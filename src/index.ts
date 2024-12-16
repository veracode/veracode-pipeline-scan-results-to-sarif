import fs from "fs";
import {Converter} from "./Converter";
import {setupSourceReplacement, sliceReportLevels} from "./utils";
import * as Sarif from "sarif";
import {PipelineScanResult} from "./PipelineScanResult";
import { PolicyScanResult } from "./PolicyScanResult";
import {Options} from "./Options";
import * as core from '@actions/core'
import { request } from '@octokit/request';
import { Octokit } from '@octokit/core';
import { gzipSync } from 'zlib';
import { Buffer } from 'buffer';

export function run(opt: Options, msgFunc: (msg: string) => void) {
    const scanType = opt.scanType
    const inputFilename = opt.scanType == 'pipeline' ? opt.inputFilename : opt.resultsJson
    const outputFilename = opt.outputFilename
    const ruleLevel = opt.ruleLevel
    const pathReplacers = opt.pathReplacers

    if (ruleLevel !== undefined && ruleLevel.length > 0) {
        core.info("##################")
        core.info("WARNING")
        core.info("##################")
        core.info("The 'finding-rule-level' input is deprecated and will be removed in a future release.")
        core.info("It will be overwritten with 4:3:0")
        core.info("This setting is not needed anymore as GitHub as introduced granular control over the severity of findings")
        core.info("Please find more information here: https://github.blog/changelog/2021-07-19-codeql-code-scanning-new-severity-levels-for-security-alerts/#about-security-severity-levels")
        core.info("##################")
    }

    let rawData: Buffer = fs.readFileSync(inputFilename);
    let converter = new Converter({
        replacers: setupSourceReplacement(...pathReplacers.split(";")),
        reportLevels: sliceReportLevels(ruleLevel)
    }, msgFunc)
    let output: Sarif.Log | PipelineScanResult | PolicyScanResult
    try {
        let results: PolicyScanResult | PipelineScanResult | Sarif.Log = JSON.parse(rawData.toString());
        if (scanType === 'policy') {
            try {
                output = converter.convertPolicyScanResults(results as PolicyScanResult)
            } catch (error) {
                core.info(`Failed to convert policy result to sarif : ${error}`);
                output = converter.policyResultConvertSarifLog(results as Sarif.Log)
            }
        } else {
            try {
                output = converter.convertPipelineScanResults(results as PipelineScanResult)
            } catch (error) {
                core.info(`Failed to convert pipeline result to sarif : ${error}`);
                output = converter.convertSarifLog(results as Sarif.Log)
            }
        }
    } catch (error) {
        throw Error('Failed to parse input file ' + inputFilename)
    }
    fs.writeFileSync(outputFilename, JSON.stringify(output));
    msgFunc('file created: ' + outputFilename);

    uploadSARIF(outputFilename, opt)

}

//upload SARIF
async function uploadSARIF(outputFilename:any, opt:any) {
    if (opt.noupload === 'true') {
        console.log('Skipping upload to GitHub');
        return;
    }
    else {
        //gzip compress and base64 encode the SARIF file
        async function createGzipBase64 (outputFilename:any): Promise<string> {
            try {
                // Read the entire file into memory
                const fileData = fs.readFileSync(outputFilename);

                console.log('File data: '+fileData);
        
                // Compress the file data
                const compressedData = gzipSync(fileData);
        
                // Encode the compressed data to base64
                const base64Data = compressedData.toString('base64');
                return base64Data;
            } catch (error) {
                throw error;
            }
        }

        const octokit = new Octokit({
            auth: opt.githubToken
        })

        const base64Data = await createGzipBase64(outputFilename)
        console.log('Base64 data: '+base64Data);
        await octokit.request('POST /repos/'+opt.repo_owner+'/'+opt.repo_name+'/code-scanning/sarifs', {
    //        headers: {
    //            authorization: opt.githubToken
    //        },
    //        owner: opt.repo_owner,
    //       repo: opt.repo_name,
            ref: opt.ref,
            commit_sha: opt.commitSHA,
            sarif: base64Data
        })
    }

}