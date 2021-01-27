import {ReportingConfiguration} from "sarif";
import {PathReplacer} from "./ConversionConfig";

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

