#!/usr/bin/env node
module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 351:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 186:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __nccwpck_require__(351);
const file_command_1 = __nccwpck_require__(717);
const utils_1 = __nccwpck_require__(278);
const os = __importStar(__nccwpck_require__(87));
const path = __importStar(__nccwpck_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    process.stdout.write(os.EOL);
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(747));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 278:
/***/ ((__unused_webpack_module, exports) => {


// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 716:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Converter = void 0;
const utils_1 = __nccwpck_require__(314);
class Converter {
    constructor(conversionConfig, msgFunc) {
        this.config = conversionConfig;
        this.msgFunc = msgFunc;
    }
    convertPipelineScanResults(pipelineScanResult) {
        this.msgFunc('Pipeline Scan results file found and parsed - validated JSON file');
        //"scan_status": "SUCCESS"
        if (pipelineScanResult.scan_status !== "SUCCESS") {
            throw Error("Unsuccessful scan status found");
        }
        this.msgFunc('Issues count: ' + pipelineScanResult.findings.length);
        let rules = pipelineScanResult.findings
            .reduce((acc, val) => {
            // dedupe by cwe_id
            if (!acc.map(value => value.cwe_id).includes(val.cwe_id)) {
                acc.push(val);
            }
            return acc;
        }, [])
            .map(issue => this.issueToRule(issue));
        // convert to SARIF json
        let sarifResults = pipelineScanResult.findings
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
    issueToRule(issue) {
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
            id: issue.cwe_id,
            name: issue.issue_type,
            shortDescription: {
                text: "CWE-" + issue.cwe_id + ": " + issue.issue_type
            },
            helpUri: "https://cwe.mitre.org/data/definitions/" + issue.cwe_id + ".html",
            properties: {
                category: issue.issue_type_id,
                tags: [issue.issue_type_id]
            },
            defaultConfiguration: {
                level: this.config.reportLevels.get(issue.severity)
            }
        };
    }
    issueToResult(issue) {
        let sourceFile = issue.files.source_file;
        // construct flaw location
        let location = {
            physicalLocation: {
                artifactLocation: {
                    uri: utils_1.getFilePath(sourceFile.file, this.config.replacers)
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
        };
        let flawMatch = issue.flaw_match;
        let fingerprints = {
            flawHash: flawMatch.flaw_hash,
            flawHashCount: flawMatch.flaw_hash_count.toString(),
            flawHashOrdinal: flawMatch.flaw_hash_ordinal.toString(),
            causeHash: flawMatch.cause_hash,
            causeHashCount: flawMatch.cause_hash_count.toString(),
            causeHashOrdinal: flawMatch.cause_hash_ordinal.toString(),
            procedureHash: flawMatch.procedure_hash,
            prototypeHash: flawMatch.prototype_hash
        };
        // construct the issue
        return {
            // get the severity number to name
            level: this.config.reportLevels.get(issue.severity),
            rank: issue.severity,
            message: {
                text: issue.display_text,
            },
            locations: [location],
            ruleId: issue.cwe_id,
            partialFingerprints: fingerprints
        };
    }
    convertSarifLog(sarifLog) {
        let issues = sarifLog.runs
            // flatmap results
            .map(run => run.results)
            .reduce((acc, val) => acc.concat(val), [])
            // flatmap results to each location
            .map(val => val.locations.map(location => [val, location]))
            .reduce((acc, val) => acc.concat(val), [])
            // get member which is nested within function
            .map(pair => {
            let possibleCallees = pair[1].logicalLocations
                .filter(logicalLocation => logicalLocation.kind === "member" &&
                logicalLocation.parentIndex !== undefined &&
                pair[1].logicalLocations[logicalLocation.parentIndex].kind === "function");
            if (possibleCallees.length > 0) {
                return [pair[0], pair[1], possibleCallees[0]];
            }
            else {
                return undefined;
            }
        })
            .filter(triple => triple !== undefined)
            .map(triple => {
            let result = triple[0];
            let location = triple[1];
            let memberCallLogicalLocations = triple[2];
            let functionLogicalLocations = location.logicalLocations[memberCallLogicalLocations.parentIndex];
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
            };
        });
        return {
            findings: issues,
        };
    }
    fingerprintsToFlawMatch(fingerprints, partialFingerpirnts) {
        if (partialFingerpirnts &&
            ["procedureHash", "prototypeHash",
                "flawHash", "flawHashCount", "flawHashOrdinal",
                "causeHash", "causeHashCount", "causeHashOrdinal"]
                .every(propertyName => propertyName in partialFingerpirnts && partialFingerpirnts[propertyName])) {
            // we do this because the values of fingerprints is string type
            // but FLawMatch have number typed properties
            this.msgFunc("Using partial fingerprint keys");
            return {
                procedure_hash: partialFingerpirnts["procedureHash"].toString(),
                cause_hash: partialFingerpirnts["causeHash"].toString(),
                cause_hash_count: parseInt(partialFingerpirnts["causeHashCount"]),
                cause_hash_ordinal: parseInt(partialFingerpirnts["causeHashOrdinal"]),
                flaw_hash: partialFingerpirnts["flawHash"].toString(),
                flaw_hash_count: parseInt(partialFingerpirnts["flawHashCount"]),
                flaw_hash_ordinal: parseInt(partialFingerpirnts["flawHashOrdinal"]),
                prototype_hash: partialFingerpirnts["prototypeHash"].toString(),
            };
        }
        let fingerprintKeys = Object.keys(fingerprints);
        let versionRegExp = new RegExp(/\/v(\d+)$/);
        if (fingerprintKeys.length > 0) {
            let highestKey = fingerprintKeys.reduce((current, nextValue) => {
                let currentVersionMatch = current.match(versionRegExp);
                let currentVersion = currentVersionMatch === null ? 0 : parseInt(currentVersionMatch[1]);
                let nextVersionMatch = nextValue.match(versionRegExp);
                let nextVersion = nextVersionMatch === null ? 0 : parseInt(nextVersionMatch[1]);
                if (currentVersion > nextVersion) {
                    return current;
                }
                else {
                    return nextValue;
                }
            }, fingerprintKeys[0]);
            this.msgFunc("Using " + highestKey + " as main fingerprint");
            return {
                sarif_fingerprint: fingerprints[highestKey]
            };
        }
        throw Error("Flaw fingerprints not set or error parsing SARIF fingerprints");
    }
}
exports.Converter = Converter;


/***/ }),

/***/ 672:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core = __importStar(__nccwpck_require__(186));
const index_1 = __nccwpck_require__(144);
try {
    index_1.run({
        inputFilename: core.getInput('pipeline-results-json', { required: true }),
        outputFilename: core.getInput('output-results-sarif', { required: true }),
        ruleLevel: core.getInput('finding-rule-level'),
        pathReplacers: [
            core.getInput('source-base-path-1'),
            core.getInput('source-base-path-2'),
            core.getInput('source-base-path-3')
        ].join(";")
    }, msg => core.info(msg));
}
catch (error) {
    core.setFailed(error.message);
}


/***/ }),

/***/ 144:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.run = void 0;
const fs_1 = __importDefault(__nccwpck_require__(747));
const Converter_1 = __nccwpck_require__(716);
const utils_1 = __nccwpck_require__(314);
function run(opt, msgFunc) {
    const inputFilename = opt.inputFilename;
    const outputFilename = opt.outputFilename;
    const ruleLevel = opt.ruleLevel;
    const pathReplacers = opt.pathReplacers;
    let rawData = fs_1.default.readFileSync(inputFilename);
    let converter = new Converter_1.Converter({
        replacers: utils_1.setupSourceReplacement(...pathReplacers.split(";")),
        reportLevels: utils_1.sliceReportLevels(ruleLevel),
    }, msgFunc);
    let output;
    try {
        let results = JSON.parse(rawData.toString());
        try {
            output = converter.convertPipelineScanResults(results);
        }
        catch (_) {
            output = converter.convertSarifLog(results);
        }
    }
    catch (error) {
        throw Error('Failed to parse input file' + inputFilename);
    }
    fs_1.default.writeFileSync(outputFilename, JSON.stringify(output));
    msgFunc('file created: ' + outputFilename);
}
exports.run = run;


/***/ }),

/***/ 314:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getFilePath = exports.sliceReportLevels = exports.setupSourceReplacement = void 0;
const setupSourceReplacement = (...subs) => {
    return subs
        .filter(sub => sub && sub.length > 0)
        .map(sub => _parseReplacer(sub));
};
exports.setupSourceReplacement = setupSourceReplacement;
const _parseReplacer = (input) => {
    const values = input.split(':');
    if (values.length != 2) {
        throw new Error('source-base-path attribute in wrong format. Please refer to the action documentation');
    }
    return {
        regex: RegExp(values[0]),
        value: values[1]
    };
};
const sliceReportLevels = (requestedLevels) => {
    let levels = new Map();
    const split = requestedLevels
        .split(':')
        .map(str => str.trim())
        .map(str => parseInt(str));
    if (split === undefined || split.length != 3) {
        throw new Error("'finding-rule-level' should have 3 integer values separated with ':' and no white spaces\n" +
            "See documentation for valid values for 'finding-rule-level'");
    }
    let split_loc = 0;
    let split_value = split[split_loc];
    let gl = 'error';
    for (let vl = 5; vl >= 0; vl--) {
        if (vl < split_value) {
            split_loc++;
            if (split_loc == 3) {
                return;
            }
            split_value = split[split_loc];
            if (gl === 'error') {
                gl = 'warning';
            }
            else {
                gl = 'note';
            }
        }
        levels.set(vl, gl);
    }
    // none,note,warning,error
    return levels;
};
exports.sliceReportLevels = sliceReportLevels;
const getFilePath = (filePath, replacer) => {
    let final = filePath;
    replacer.forEach(element => {
        if (element.regex.test(final)) {
            final = final.replace(element.regex, element.value);
        }
    });
    return final;
};
exports.getFilePath = getFilePath;


/***/ }),

/***/ 747:
/***/ ((module) => {

module.exports = require("fs");;

/***/ }),

/***/ 87:
/***/ ((module) => {

module.exports = require("os");;

/***/ }),

/***/ 622:
/***/ ((module) => {

module.exports = require("path");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__nccwpck_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __nccwpck_require__(672);
/******/ })()
;