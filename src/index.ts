import fs from "fs";
import {Converter} from "./Converter";
import {setupSourceReplacement, sliceReportLevels} from "./utils";
import * as Sarif from "sarif";
import {PipelineScanResult} from "./PipelineScanResult";
import {Options} from "./Options";
import * as core from '@actions/core'
import { request } from '@octokit/request';

export function run(opt: Options, msgFunc: (msg: string) => void) {
    const inputFilename = opt.inputFilename
    const outputFilename = opt.outputFilename
    const ruleLevel = opt.ruleLevel
    const pathReplacers = opt.pathReplacers

    if (ruleLevel !== undefined && ruleLevel.length > 0) {
        core.info("##################")
        core.info("WARNING")
        core.info("##################")
        core.info("The 'finding-rule-level' input is deprecated and will be removed in a future release.")
        core.info("It will be overwritten with with 4:3:0")
        core.info("This setting is not needed anymore as GitHub as introduced granular control over the severity of findings")
        core.info("Please find more information here: https://github.blog/changelog/2021-07-19-codeql-code-scanning-new-severity-levels-for-security-alerts/#about-security-severity-levels")
        core.info("##################")
    }

    let rawData: Buffer = fs.readFileSync(inputFilename);
    let converter = new Converter({
        replacers: setupSourceReplacement(...pathReplacers.split(";")),
        reportLevels: sliceReportLevels(ruleLevel)
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
        throw Error('Failed to parse input file ' + inputFilename)
    }
    fs.writeFileSync(outputFilename, JSON.stringify(output));
    msgFunc('file created: ' + outputFilename);

    uploadSARIF(outputFilename, opt)

}

async function uploadSARIF(outputFilename:any, opt:any) {
    //upload SARIF
    await request('PUT /repos/{opt.owner}/{opt.repo}code-scanning/analysis/status', {
        headers: {
            authorization: opt.githubToken
        },
        owner: opt.owner,
        repo: opt.repo,
        data: outputFilename
    })

}