import {ReportingConfiguration} from "sarif";
import {PathReplacer} from "./ConversionConfig";
import * as core from '@actions/core'

export const setupSourceReplacement = (...subs: string[]): PathReplacer[] => {
    return subs
        .filter(sub => sub && sub.length > 0)
        .map(sub => _parseReplacer(sub));
}

const _parseReplacer = (input: string): PathReplacer => {
    const values = input.split(':');
    if (values.length != 2) {
        throw new Error('source-base-path attribute in wrong format. Please refer to the action documentation');
    }
    return {
        regex: RegExp(values[0]),
        value: values[1]
    }
}

export const sliceReportLevels = (requestedLevels: string): Map<number, ReportingConfiguration.level> => {
    let levels: Map<number, ReportingConfiguration.level> = new Map()
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
    let gl: ReportingConfiguration.level = 'error';
    for (let vl = 5; vl >= 0; vl--) {
        if (vl < split_value) {
            split_loc++;
            if (split_loc == 3) {
                return;
            }
            split_value = split[split_loc];
            if (gl === 'error') {
                gl = 'warning';
            } else {
                gl = 'note';
            }
        }
        levels.set(vl, gl)
    }
    // none,note,warning,error
    return levels;
}


export const getFilePath = (filePath: string, replacer: PathReplacer[]) => {
    let final = filePath;
    replacer.forEach(element => {
        if (element.regex.test(final)) {
            final = final.replace(element.regex, element.value);
        }
    });
    return final;
}

export const mapVeracodeSeverityToCVSS = (severity: number): string => {
    // https://docs.veracode.com/r/review_severity_exploitability#veracode-finding-severities
    // https://github.blog/changelog/2021-07-19-codeql-code-scanning-new-severity-levels-for-security-alerts/#about-security-severity-levels
    switch (severity) {
        // Veracode Very High, GitHub Critical
        case 5:
            return "9.0";
        // Veracode High, GitHub High
        case 4:
            return "7.0";
        // Veracode Medium, GitHub Medium
        case 3:
            return "4.0";
        // Veracode Low, GitHub Low
        case 2:
            return "0.1";
        // Veracode Very Low, GitHub Low - not a perfect mapping but this can't be GitHub None as that maps to Veracode Informational
        case 1:
            return "0.1"
        // Veracode Informational, GitHub None
        case 0:
            return "0.0"
        default:
            return "0.0";
    }
}

export const removeLeadingSlash = (str: string): string => {
    // Check if the string starts with '/'
    if (str.charAt(0) === '/') {
        // Remove the leading '/'
        return str.substring(1);
    }
    // If '/' is not present at the first character, return the original string
    return str;
}