const core = require('@actions/core');
const github = require('@actions/github');

const fs = require('fs');

try {
    const inputFileName = core.getInput('pipeline-results-json'); // 'results.json'
    const outputFileName = core.getInput('output-results-sarif'); // 'veracode-results.sarif'

    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);

    var results = {};

    let rawdata = fs.readFileSync(inputFileName);
    results = JSON.parse(rawdata);
    console.log('Pipeline Scan result found and parsed as a valid JSON file');

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
                        startLine: issueFileLocation.Line
                    }
                }
            }
            let resultItem = {
                level: issue.Severity,
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
        console.log('SARIF file created: '+outputFileName);
    }
} catch (readerr) {
    core.setFailed(error.message);
}

