import fs from "fs";
import {Converter} from "./Converter";
import {setupSourceReplacement, sliceReportLevels} from "./utils";
import * as Sarif from "sarif";
import {PipelineScanResult} from "./PipelineScanResult";
import {Options} from "./Options";

export function run(opt: Options, msgFunc: (msg: string) => void) {
    const inputFilename = opt.inputFilename
    const outputFilename = opt.outputFilename
    const ruleLevel = opt.ruleLevel
    const pathReplacers = opt.pathReplacers

    let rawData: Buffer = fs.readFileSync(inputFilename);
    let converter = new Converter({
        replacers: setupSourceReplacement(...pathReplacers.split(";")),
        reportLevels: sliceReportLevels(ruleLevel),
    }, msgFunc)
    let output: Sarif.Log | PipelineScanResult
    try {
        let results: PipelineScanResult | Sarif.Log = JSON.parse(rawData.toString());
        try {
            output = converter.convertPipelineScanResults(results as PipelineScanResult)
        } catch (_) {
            output = converter.convertSarifLog(results as Sarif.Log)
        }
    } catch (error) {
        throw Error('Failed to parse input file' + inputFilename)
    }
    fs.writeFileSync(outputFilename, JSON.stringify(output));
    msgFunc('file created: ' + outputFilename);
}
