import {Converter} from "./Converter";
import * as fs from "fs";
import {setupSourceReplacement, sliceReportLevels} from "./utils";
import test from "ava";
import {Log} from "sarif";

/*
test('can convert veracode results to sarif results', t => {
    let veracodeResultsPath = __dirname + '/../test_resource/resultsToSarif.json';
    let sarifResultsPath = __dirname + '/../test_resource/resultsToSarif.sarif.json';

    let veracodeResultsData = fs.readFileSync(veracodeResultsPath);
    let veracodeResults = JSON.parse(veracodeResultsData.toString());

    let sarifResultsData = fs.readFileSync(sarifResultsPath);
    let sarifResults: Log = JSON.parse(sarifResultsData.toString())

    let output = new Converter({
        reportLevels: sliceReportLevels('4:3:0'),
        replacers: setupSourceReplacement(),
    }, msg => {}).convertPipelineScanResults(veracodeResults);
    t.deepEqual(sarifResults, output)
})

test('can convert sarif results to veracode results', t => {
    let veracodeResultsPath = __dirname + '/../test_resource/sarifToResults.json';
    let sarifResultsPath = __dirname + '/../test_resource/sarifToResults.sarif.json';

    let veracodeResultsData = fs.readFileSync(veracodeResultsPath);
    let veracodeResults = JSON.parse(veracodeResultsData.toString());

    let sarifResultsData = fs.readFileSync(sarifResultsPath);
    let sarifResults: Log = JSON.parse(sarifResultsData.toString())

    let output = new Converter({
        reportLevels: sliceReportLevels('4:3:0'),
        replacers: setupSourceReplacement(),
    }, msg => {}).convertSarifLog(sarifResults);
    t.deepEqual(veracodeResults, output)
})

test('can convert veracode policy scan results to sarif results', t => {
    let veracodeResultsPath = __dirname + '/../test_resource/policy_flaws.json';
    let sarifResultsPath = __dirname + '/../test_resource/policy_flaws.sarif.json';

    let veracodeResultsData = fs.readFileSync(veracodeResultsPath);
    let veracodeResults = JSON.parse(veracodeResultsData.toString());

    let sarifResultsData = fs.readFileSync(sarifResultsPath);
    let sarifResults: Log = JSON.parse(sarifResultsData.toString())

    let output = new Converter({
        reportLevels: sliceReportLevels('4:3:0'),
        replacers: setupSourceReplacement(),
    }, msg => { }).convertPolicyScanResults(veracodeResults);
    t.deepEqual(sarifResults, output)
})

test('can convert sarif results to veracode policy results', t => {
    let veracodeResultsPath = __dirname + '/../test_resource/sarifToPolicyFlaws.json';
    let sarifResultsPath = __dirname + '/../test_resource/policy_flaws.sarif.json';

    let veracodeResultsData = fs.readFileSync(veracodeResultsPath);
    let veracodeResults = JSON.parse(veracodeResultsData.toString());

    let sarifResultsData = fs.readFileSync(sarifResultsPath);
    let sarifResults: Log = JSON.parse(sarifResultsData.toString())

    let output = new Converter({
        reportLevels: sliceReportLevels('4:3:0'),
        replacers: setupSourceReplacement(),
    }, msg => { }).policyResultConvertSarifLog(sarifResults);
    t.deepEqual(veracodeResults, output)
})
*/