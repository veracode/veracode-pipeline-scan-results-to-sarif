#!/usr/bin/env node

import { program, Option } from 'commander'
import { run } from "./index";

program
    .version('0.0.1')
    .requiredOption('-i, --input <path>', 'Input file to convert')
    .requiredOption('-o, --output <path>', 'Output file to convert')
    .addOption(new Option('-s, --scan-type <string>', 'Scan type').default('pipeline').choices(['pipeline', 'policy']))
    .option('-r, --rule-level <string>', 'Rule level', '4:3:0')
    .option('-p, --path-replace <string>', 'Path replacements', '')
    .option('--repo-owner <string>', 'Repository owner')
    .option('--repo-name <string>', 'Repository name')
    .option('-g, --github-token <string>', 'GitHub tokens')
    .option('-c, --commit-sha <string>', 'Commit SHA')
    .option('-R, --ref <string>', 'Ref')
    .option('-n, --noupload', 'Don\'t upload results to GitHub', false)
    .parse(process.argv)

try {
    let opts = program.opts()
    run({
        scanType: opts["scanType"],
        // inputFilename is used for pipeline scans, resultsJson otherwise (see index.ts)
        resultsJson: opts["input"],
        inputFilename: opts["input"],
        outputFilename: opts["output"],
        ruleLevel: opts["ruleLevel"],
        pathReplacers: opts["pathReplace"],
        repo_owner: opts["repoOwner"],
        repo_name: opts["repoName"],
        githubToken: opts["githubToken"],
        commitSHA: opts["commitSHA"],
        ref: opts["ref"],
        noupload: opts["noupload"].toString()
    }, msg => console.log(msg))
} catch (error) {
    console.error(error.message);
}