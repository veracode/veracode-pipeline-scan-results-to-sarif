import {
    FlawFingerprint,
    FlawMatch,
    Issue,
    PipelineScanResult,
    SourceFile
} from "./PipelineScanResult";
import * as Sarif from 'sarif';
import { ConversionConfig } from "./ConversionConfig";
//import { getFilePath } from "./utils";
import { Location, LogicalLocation, Result } from "sarif";
import {getFilePath, mapVeracodeSeverityToCVSS, removeLeadingSlash} from "./utils";
import { PolicyScanResult, Finding, FindingDetails, PolicyFlawMatch, PolicyFlawFingerprint } from "./PolicyScanResult";

export class Converter {
    private config: ConversionConfig
    private readonly msgFunc: (msg: string) => void


    constructor(conversionConfig: ConversionConfig, msgFunc: (msg: string) => void) {
        this.config = conversionConfig
        this.msgFunc = msgFunc
    }



    convertPipelineScanResults(pipelineScanResult: PipelineScanResult): Sarif.Log {
        this.msgFunc('Pipeline Scan results file found and parsed - validated JSON file');
        //"scan_status": "SUCCESS"
        if (pipelineScanResult.scan_status !== "SUCCESS") {
            throw Error("Unsuccessful scan status found")
        }

        this.msgFunc('Issues count: ' + pipelineScanResult.findings.length);
        let rules: Sarif.ReportingDescriptor[] = pipelineScanResult.findings
            .reduce((acc, val) => {
                // dedupe by cwe_id
                if (!acc.map(value => value.cwe_id).includes(val.cwe_id)) {
                    acc.push(val);
                }
                return acc;
            }, <Issue[]>[])
            .map(issue => this.issueToRule(issue));
        // convert to SARIF json
        let sarifResults: Sarif.Result[] = pipelineScanResult.findings
            .map(issue => this.issueToResult(issue));

        // construct the full SARIF content
        return {
            $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
            version: "2.1.0",
            runs: [
                {
                    tool: {
                        driver: {
                            name: "Veracode Static Analysis Pipeline Scan",
                            rules: rules
                        }
                    },
                    results: sarifResults
                }
            ]
        };
    }

    private issueToRule(issue: Issue): Sarif.ReportingDescriptor {
        return {
            id: issue.cwe_id,
            name: issue.issue_type,
            shortDescription: {
                text: "CWE-" + issue.cwe_id + ": " + issue.issue_type
            },
            helpUri: "https://cwe.mitre.org/data/definitions/" + issue.cwe_id + ".html",
            properties: {
                "security-severity": mapVeracodeSeverityToCVSS(issue.severity),
                category: issue.issue_type_id,
                tags: [issue.issue_type_id]
            },
//            defaultConfiguration: {
//                level: issue.severity
//            }
        };
    }

    private issueToResult(issue: Issue): Sarif.Result {
        let sourceFile: SourceFile = issue.files.source_file
        // construct flaw location
        let location: Sarif.Location = {
            physicalLocation: {
                artifactLocation: {
                    uri: getFilePath(sourceFile.file, this.config.replacers)
                },
                region: {
                    startLine: sourceFile.line
                }
            },
            logicalLocations: [
                {
                    name: sourceFile.function_name,
                    fullyQualifiedName: sourceFile.qualified_function_name,
                    kind: "function",
                },
                {
                    fullyQualifiedName: issue.title,
                    kind: "member",
                    parentIndex: 0
                }
            ]
        }
        var flawMatch: FlawMatch
        if (issue.flaw_match === undefined) {
            var flawMatch: FlawMatch = {
                flaw_hash: "",
                flaw_hash_count: 0,
                flaw_hash_ordinal: 0,
                cause_hash: "",
                cause_hash_count: 0,
                cause_hash_ordinal: 0,
                procedure_hash: "",
                prototype_hash: "",
            }
        }
        else {
            var flawMatch: FlawMatch = issue.flaw_match as FlawMatch
        }


        let fingerprints: { [key: string]: string } = {
            flawHash: flawMatch.flaw_hash,
            flawHashCount: flawMatch.flaw_hash_count.toString(),
            flawHashOrdinal: flawMatch.flaw_hash_ordinal.toString(),
            causeHash: flawMatch.cause_hash,
            causeHashCount: flawMatch.cause_hash_count.toString(),
            causeHashOrdinal: flawMatch.cause_hash_ordinal.toString(),
            procedureHash: flawMatch.procedure_hash,
            prototypeHash: flawMatch.prototype_hash,
        }

        // construct the issue

        let ghrank:number = +mapVeracodeSeverityToCVSS(issue.severity)
        return {
            // get the severity number to name
            level: this.config.reportLevels.get(issue.severity),
            rank: ghrank,
            message: {
                text: issue.display_text,
            },
            locations: [location],
            ruleId: issue.cwe_id,
            partialFingerprints: fingerprints
        };
    }

    convertSarifLog(sarifLog: Sarif.Log): PipelineScanResult {
        let issues: Issue[] = sarifLog.runs
            // flatmap results
            .map(run => run.results)
            .reduce((acc, val) => acc.concat(val), [])
            // flatmap results to each location
            .map(val => val.locations.map(location => [val, location] as [Result, Location]))
            .reduce((acc, val) => acc.concat(val), [])
            // get member which is nested within function
            .map(pair => {
                let possibleCallees = pair[1].logicalLocations
                    .filter(logicalLocation =>
                        logicalLocation.kind === "member" &&
                        logicalLocation.parentIndex !== undefined &&
                        pair[1].logicalLocations[logicalLocation.parentIndex].kind === "function")
                if (possibleCallees.length > 0) {
                    return [pair[0], pair[1], possibleCallees[0]] as [Result, Location, LogicalLocation]
                } else {
                    return undefined
                }
            })
            .filter(triple => triple !== undefined)
            .map(triple => {
                let result = triple[0]
                let location = triple[1]
                let memberCallLogicalLocations = triple[2]
                let functionLogicalLocations = location.logicalLocations[memberCallLogicalLocations.parentIndex]
                return {
                    title: memberCallLogicalLocations.fullyQualifiedName,
                    cwe_id: result.ruleId,
                    severity: result.rank,
                    display_text: result.message.text,
                    files: {
                        source_file: {
                            file: location.physicalLocation.artifactLocation.uri,
                            line: location.physicalLocation.region.startLine,
                            function_name: functionLogicalLocations.name,
                            qualified_function_name: functionLogicalLocations.fullyQualifiedName
                        }
                    },
                    flaw_match: this.fingerprintsToFlawMatch(result.fingerprints, result.partialFingerprints)
                }
            });
        return {
            findings: issues,
        }
    }

    private fingerprintsToFlawMatch(fingerprints: { [key: string]: string },
        partialFingerprints: { [key: string]: string }): FlawFingerprint {
        if (partialFingerprints &&
            ["procedureHash", "prototypeHash",
                "flawHash", "flawHashCount", "flawHashOrdinal",
                "causeHash", "causeHashCount", "causeHashOrdinal"]
                .every(propertyName => propertyName in partialFingerprints && partialFingerprints[propertyName])) {
            // we do this because the values of fingerprints is string type
            // but FlawMatch have number typed properties
            this.msgFunc("Using partial fingerprint keys")
            return {
                procedure_hash: partialFingerprints["procedureHash"].toString(),
                cause_hash: partialFingerprints["causeHash"].toString(),
                cause_hash_count: parseInt(partialFingerprints["causeHashCount"]),
                cause_hash_ordinal: parseInt(partialFingerprints["causeHashOrdinal"]),
                flaw_hash: partialFingerprints["flawHash"].toString(),
                flaw_hash_count: parseInt(partialFingerprints["flawHashCount"]),
                flaw_hash_ordinal: parseInt(partialFingerprints["flawHashOrdinal"]),
                prototype_hash: partialFingerprints["prototypeHash"].toString(),
            };
        }
        let fingerprintKeys = Object.keys(fingerprints);
        let versionRegExp = new RegExp(/\/v(\d+)$/);
        if (fingerprintKeys.length > 0) {
            let highestKey = fingerprintKeys.reduce((current, nextValue) => {
                let currentVersionMatch = current.match(versionRegExp)
                let currentVersion = currentVersionMatch === null ? 0 : parseInt(currentVersionMatch[1])
                let nextVersionMatch = nextValue.match(versionRegExp)
                let nextVersion = nextVersionMatch === null ? 0 : parseInt(nextVersionMatch[1])
                if (currentVersion > nextVersion) {
                    return current
                } else {
                    return nextValue
                }
            }, fingerprintKeys[0]);
            this.msgFunc("Using " + highestKey + " as main fingerprint");
            return {
                sarif_fingerprint: fingerprints[highestKey]
            };
        }
        throw Error("Flaw fingerprints not set or error parsing SARIF fingerprints");
    }

    convertPolicyScanResults(policyScanResult: PolicyScanResult): Sarif.Log {
        this.msgFunc('Policy Scan results file found and parsed - validated JSON file');
        this.msgFunc('Issues count: ' + policyScanResult._embedded.findings.length);
        let rules: Sarif.ReportingDescriptor[] = policyScanResult._embedded.findings
            .reduce((acc, val) => {
                // dedupe by cwe_id
                if (!acc.map(value => value.finding_details.cwe.id).includes(val.finding_details.cwe.id)) {
                    acc.push(val);
                }
                return acc;
            }, <Finding[]>[])
            .map(issue => this.findingToRule(issue));

        // convert to SARIF json
        let sarifResults: Sarif.Result[] = policyScanResult._embedded.findings
            .map(findings => this.findingToResult(findings));

        // construct the full SARIF content
        return {
            $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
            version: "2.1.0",
            runs: [
                {
                    tool: {
                        driver: {
                            name: "Veracode Static Analysis Policy Scan",
                            rules: rules
                        }
                    },
                    results: sarifResults
                }
            ]
        };
    }

    private findingToRule(finding: Finding): Sarif.ReportingDescriptor {
        /*
         {
                  "id": "no-unused-vars",
                  "shortDescription": {
                    "text": "disallow unused variables"
                  },
                  "helpUri": "https://eslint.org/docs/rules/no-unused-vars",
                  "properties": {
                    "category": "Variables"
                  }
                }
        */
        return {
            id: finding.finding_details.cwe?.id.toString(),
            name: finding.finding_details.cwe?.name,
            shortDescription: {
                text: "CWE-" + finding.finding_details.cwe?.id.toString() + ": " + finding.finding_details.cwe?.name
            },
            helpUri: "https://cwe.mitre.org/data/definitions/" + finding.finding_details.cwe?.id.toString() + ".html",
            properties: {
                "security-severity": mapVeracodeSeverityToCVSS(finding.finding_details.severity),
                category: finding.scan_type,
                tags: [finding.scan_type]
            },
            // defaultConfiguration: {
            //     level: this.config.reportLevels.get(finding.finding_details.severity)
            // }
        };
    }

    private findingToResult(finding: Finding): Sarif.Result {
        let finding_details: FindingDetails = finding.finding_details;
        // construct flaw location
        let location: Sarif.Location = {
            physicalLocation: {
                artifactLocation: {
                    uri: removeLeadingSlash(getFilePath(finding_details.file_path, this.config.replacers))
                },
                region: {
                    startLine: finding_details.file_line_number
                }
            },
            logicalLocations: [
                {
                    name: finding_details.file_name,
                    fullyQualifiedName: finding_details.procedure,
                    kind: "function",
                },
                {
                    fullyQualifiedName: finding_details.attack_vector,
                    kind: "member",
                    parentIndex: 0
                }
            ]
        }
        var flawMatch: PolicyFlawMatch
        if (finding.flaw_match === undefined) {
            var flawMatch: PolicyFlawMatch = {
                context_guid: "",
                file_path: "",
                procedure: "",
            }
        }
        else {
            var flawMatch: PolicyFlawMatch = finding.flaw_match as PolicyFlawMatch
        }

        let fingerprints: { [key: string]: string } = {
            context_guid: flawMatch.context_guid,
            file_path: flawMatch.file_path,
            procedure: flawMatch.procedure
        }

        // construct the issue
        let ghrank:number = +mapVeracodeSeverityToCVSS(finding_details.severity)
        return {
            // get the severity number to name
            level: this.config.reportLevels.get(finding_details.severity),
            rank: ghrank,
            message: {
                text: finding.description,
            },
            locations: [location],
            ruleId: finding_details.cwe?.id.toString(),
            partialFingerprints: fingerprints
        };
    }

    policyResultConvertSarifLog(sarifLog: Sarif.Log): PolicyScanResult {
        let issues: Finding[] = sarifLog.runs
            // flatmap results
            .map(run => run.results)
            .reduce((acc, val) => acc.concat(val), [])
            // flatmap results to each location
            .map(val => val.locations.map(location => [val, location] as [Result, Location]))
            .reduce((acc, val) => acc.concat(val), [])
            // get member which is nested within function
            .map(pair => {
                let possibleCallees = pair[1].logicalLocations
                    .filter(logicalLocation =>
                        logicalLocation.kind === "member" &&
                        logicalLocation.parentIndex !== undefined &&
                        pair[1].logicalLocations[logicalLocation.parentIndex].kind === "function")
                if (possibleCallees.length > 0) {
                    return [pair[0], pair[1], possibleCallees[0]] as [Result, Location, LogicalLocation]
                } else {
                    return undefined
                }
            })
            .filter(triple => triple !== undefined)
            .map(triple => {
                let result = triple[0]
                let location = triple[1]
                let memberCallLogicalLocations = triple[2]
                let functionLogicalLocations = location.logicalLocations[memberCallLogicalLocations.parentIndex]
                return {
                    // title: memberCallLogicalLocations.fullyQualifiedName,
                    description: result.message.text,
                    finding_details: {
                        cwe: {
                            id: result.ruleId ? parseInt(result.ruleId) : null
                        },
                        severity: result.rank,
                        file_path: location.physicalLocation.artifactLocation.uri,
                        file_line_number: location.physicalLocation.region.startLine,
                        file_name: functionLogicalLocations.name,
                        attack_vector: functionLogicalLocations.fullyQualifiedName
                    },
                    flaw_match: this.fingerprintsToPolicyFlawMatch(result.partialFingerprints)
                }
            });
        return {
            _embedded: {
                findings: issues
            }
        }
    }

    private fingerprintsToPolicyFlawMatch(partialFingerprints: { [key: string]: string }): PolicyFlawFingerprint {
        if (partialFingerprints &&
            ["context_guid", "file_path", "procedure"]
                .every(propertyName => propertyName in partialFingerprints && partialFingerprints[propertyName])) {
            // we do this because the values of fingerprints is string type
            // but FlawMatch have number typed properties
            this.msgFunc("Using partial fingerprint keys")
            return {
                context_guid: partialFingerprints["procedureHash"].toString(),
                file_path: partialFingerprints["file_path"].toString(),
                procedure: partialFingerprints["procedure"].toString(),

            };
        }
        let fingerprintKeys = Object.keys(partialFingerprints);
        let versionRegExp = new RegExp(/\/v(\d+)$/);
        if (fingerprintKeys.length > 0) {
            let highestKey = fingerprintKeys.reduce((current, nextValue) => {
                let currentVersionMatch = current.match(versionRegExp)
                let currentVersion = currentVersionMatch === null ? 0 : parseInt(currentVersionMatch[1])
                let nextVersionMatch = nextValue.match(versionRegExp)
                let nextVersion = nextVersionMatch === null ? 0 : parseInt(nextVersionMatch[1])
                if (currentVersion > nextVersion) {
                    return current
                } else {
                    return nextValue
                }
            }, fingerprintKeys[0]);
            this.msgFunc("Using " + highestKey + " as main fingerprint");
            return {
                sarif_fingerprint: partialFingerprints[highestKey]
            };
        }
        throw Error("Flaw fingerprints not set or error parsing SARIF fingerprints");
    }
}