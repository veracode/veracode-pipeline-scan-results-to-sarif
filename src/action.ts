#!/usr/bin/env node

import * as core from '@actions/core'
import {run} from "./index";

try {
    run({
        inputFilename: core.getInput('pipeline-results-json', {required: true}),
        outputFilename: core.getInput('output-results-sarif', {required: true}),
        ruleLevel: core.getInput('finding-rule-level'),
        pathReplacers: [
            core.getInput('source-base-path-1'),
            core.getInput('source-base-path-2'),
            core.getInput('source-base-path-3')
        ].join(";")
    }, msg => core.info(msg));
} catch (error) {
    core.setFailed(error.message);
}