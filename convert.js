'use strict';

//import { exit } from 'process';
const fs = require('fs');

const DEFAULT_INPUT_FILE = 'results.json';
const DEFAULT_OUTPUT_FILE = 'veracode-results.sarif';
const inputAttrPrefix = 'INPUT_FILENAME:';
const outputAttrPrefix = 'OUTPUT_FILENAME:';


// none,note,warning,error
const sevIntToStr = (sevInt) => {
    const intSev = parseInt(sevInt);
    if (intSev===5 || intSev===4){
        return 'error';
    } else if (intSev===3) {
        return 'warning';
    } else if (intSev===2||intSev===1 || intSev===0){
        return 'note';
    } else {
        return 'none'
    }
};

var results = {};
let outputFileName = DEFAULT_OUTPUT_FILE;
let inoutFileName = DEFAULT_INPUT_FILE;
try {
    let inputFile = process.argv[2];
    if (inputFile.length>inputAttrPrefix.length){
        inoutFileName = inputFile.substring(inputAttrPrefix.length);
    }   
    let outputFile = process.argv[3];
    if (outputFile.length>outputAttrPrefix.length){
        outputFileName = outputFile.substring(outputAttrPrefix.length);
    } 
    let rawdata = fs.readFileSync(inoutFileName);
    results = JSON.parse(rawdata);
    console.log('Pipeline Scan result found and parsed as a valid JSON file');
} catch (readerr) {
    console.log(readerr);
    process.exit(2);
}

//"scan_status": "SUCCESS"
if (results.scan_status==='SUCCESS') {
    let issues = results.results.TestResults.Issues.Issue;
    console.log('Issues count: '+issues.length);

    // convert to SARIF json
    let sarifResults = issues.map(issue => {
        let issueFileLocation = issue.Files.SourceFile;
        let location = {
            physicalLocation: {
                artifactLocation: {
                    uri: issueFileLocation.File
                },
                region: {
                    startLine: parseInt(issueFileLocation.Line)
                }
            }
        }
        let serStr = sevIntToStr(issue.Severity);
        let resultItem = {
            level: serStr,
            message: {
                text: issue.Title + ' - '+issue.IssueType,
            },
            locations: [location]
        }
        return resultItem;
    })

    let sarifFileJSONContent = {
        $schema : "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
        version : "2.1.0",
        runs : [
            {
                tool : {
                    driver : {
                        name : "Veracode Pipeline Scanner"
                    }
                },
                results: sarifResults
            }   
        ]
    };

    // save to file
    fs.writeFileSync(outputFileName,JSON.stringify(sarifFileJSONContent));

}

