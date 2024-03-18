#!/usr/bin/env node

import program from 'commander'
import {run} from "./index";

program
    .version('0.0.1')
    .requiredOption('-i, --input <path>', 'Input file to convert')
    .requiredOption('-o, --output <path>', 'Output file to convert')
    .option('-r, --rule-level <string>', 'Rule level', '4:3:0')
    .option('-p, --path-replace <string>', 'Path replacements', '')
    .parse(process.argv)

try {
    let opts = program.opts()
    run({
        scanType: opts["pathReplace"],
        resultsJson: opts["input"],
        inputFilename: opts["input"],
        outputFilename: opts["output"],
        ruleLevel: opts["ruleLevel"],
        pathReplacers: opts["pathReplace"],
        repo_owner: opts["pathReplace"],
        repo_name: opts["pathReplace"],
        githubToken: opts["pathReplace"],
        commitSHA: opts["pathReplace"],
        ref: opts["pathReplace"],
        noupload: opts["pathReplace"]
    }, msg => console.log(msg))
} catch (error) {
    console.error(error.message);
}