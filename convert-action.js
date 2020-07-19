const core = require('@actions/core');
//onst github = require('@actions/github');

const fs = require('fs');


// none,note,warning,error
const sevIntToStr = (sevInt => {
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
})

try {
    const inputFileName = core.getInput('pipeline-results-json'); // 'results.json'
    const outputFileName = core.getInput('output-results-sarif'); // 'veracode-results.sarif'

    // Get the JSON webhook payload for the event that triggered the workflow
    //const payload = JSON.stringify(github.context.payload, undefined, 2)
    //console.log(`The event payload: ${payload}`);

    var results = {};

    let rawdata = fs.readFileSync(inputFileName);
    results = JSON.parse(rawdata);
    console.log('Pipeline Scan results file found and parsed - validated JSON file');

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
        console.log('SARIF file created: '+outputFileName);
    }
} catch (error) {
    core.setFailed(error.message);
}


