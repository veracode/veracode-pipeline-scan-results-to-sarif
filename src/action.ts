#!/usr/bin/env node

import * as core from '@actions/core'
import * as github from '@actions/github'
import {run} from "./index";

try {
    let owner
    let repo
    if ( core.getInput('repo_owner') && core.getInput('repo_name') ){
        owner = core.getInput('repo_owner');
        console.log('Owner: '+core.getInput('repo_owner'))
        repo = core.getInput('repo_name');
        console.log('Repo: '+core.getInput('repo_name'))
    }
    else {
        owner = github.context.repo.owner;
        repo = github.context.repo.repo;
    }
    run({
        inputFilename: core.getInput('pipeline-results-json', {required: true}),
        outputFilename: core.getInput('output-results-sarif', {required: true}),
        ruleLevel: core.getInput('finding-rule-level'),
        repo_owner: owner,
        repo_name: repo,
        authToken: core.getInput('github_token'),
        pathReplacers: [
            core.getInput('source-base-path-1'),
            core.getInput('source-base-path-2'),
            core.getInput('source-base-path-3')
        ].join(";")
    }, msg => core.info(msg));
} catch (error) {
    core.setFailed(error.message);
}