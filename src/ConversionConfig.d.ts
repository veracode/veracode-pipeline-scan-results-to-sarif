import {ReportingConfiguration} from "sarif";

export interface ConversionConfig {
    replacers: PathReplacer[],
    reportLevels: Map<number, ReportingConfiguration.level>
}

export interface PathReplacer {
    regex: RegExp,
    value: string,
}