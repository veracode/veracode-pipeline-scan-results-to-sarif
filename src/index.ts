import fs from "fs";
import {Converter} from "./Converter";
import {setupSourceReplacement, sliceReportLevels} from "./utils";
import * as Sarif from "sarif";
import {PipelineScanResult} from "./PipelineScanResult";
import {Options} from "./Options";
import * as core from '@actions/core'
import { request } from '@octokit/request';
import { createGzip } from 'zlib';
import { Buffer } from 'buffer';

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
    console.log('opts: '+JSON.stringify(opt))

    //gzip compress and base64 encode the SARIF file
    function createGzipBase64 (outputFilename:any): Promise<string> {
        return new Promise((resolve, reject) => {
            const gzip = createGzip();
            const inputStream = fs.createReadStream(outputFilename);
            let compressedData: Buffer[] = [];

            gzip.on('data', (chunk: Buffer) => {
                compressedData.push(chunk);
            });

            gzip.on('end', () => {
                const compressedBuffer = Buffer.concat(compressedData);
                let generatedBase64Data = compressedBuffer.toString('base64');
                return generatedBase64Data
            });
            inputStream.pipe(gzip);
        })
    }
    createGzipBase64(outputFilename)
    .then((base64Data) => {
        
        //const base64Data = createGzipBase64(outputFilename)
        console.log('Base64 data: '+base64Data);
        request('POST /repos/'+opt.repo_owner+'/'+opt.repo_name+'/code-scanning/sarifs', {
            headers: {
                authorization: opt.githubToken
            },
            owner: opt.repo_owner,
            repo: opt.repo_name,
            ref: opt.ref,
            commit_sha: opt.commitSHA,
            sarif: base64Data
        })

    }).catch((error) => {   
        console.error('Error: '+error)
    });


}