const core = require('@actions/core');
//onst github = require('@actions/github');

const fs = require('fs');

const pipelineInputFileName = core.getInput('pipeline-results-json'); // 'results.json'
const sarifOutputFileName = core.getInput('output-results-sarif'); // 'veracode-results.sarif'

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

const addRuleToRules = (issue,rules) => {
    if (rules.filter(ruleItem => ruleItem.id===issue.CWEId).length>0) {
        return null;
    }
    /*
     {
              "id": "no-unused-vars",
              "shortDescription": {
                "text": "disallow unused variables"
              },
              "helpUri": "https://eslint.org/docs/rules/no-unused-vars",
              "properties": {
                "category": "Variables"
              }
            }
    */
    let rule = {
        id: issue.CWEId,
        shortDescription: {
            text: "CWE-"+issue.CWEId+": "+issue.IssueType
        },
        helpUri: "https://cwe.mitre.org/data/definitions/"+issue.CWEId+".html",
        properties: {
            category: issue.IssueTypeId
        }
    }

    return rule;
}

/*
 {
    "Title": "java.sql.Statement.executeQuery",
    "IssueId": "1016",
    "GOB": "B",
    "Severity": "4",
    "IssueTypeId": "taint",
    "IssueType": "Improper Neutralization of Special Elements used in an SQL Command (\u0027SQL Injection\u0027)",
    "CWEId": "89",
    "VCId": "89.005",
    "DisplayText": "\u003cspan\u003eThis database query contains a SQL injection flaw.  The call to java.sql.Statement.executeQuery() constructs a dynamic SQL query using a variable derived from untrusted input.  An attacker could exploit this flaw to execute arbitrary SQL queries against the database. The first argument to executeQuery() contains tainted data from the variable sqlQuery. The tainted data originated from an earlier call to AnnotationVirtualController.vc_annotation_entry.\u003c/span\u003e \u003cspan\u003eAvoid dynamically constructing SQL queries.  Instead, use parameterized prepared statements to prevent the database from interpreting the contents of bind variables as part of the query.  Always validate untrusted input to ensure that it conforms to the expected format, using centralized data validation routines when possible.\u003c/span\u003e \u003cspan\u003eReferences: \u003ca href\u003d\"https://cwe.mitre.org/data/definitions/89.html\"\u003eCWE\u003c/a\u003e \u003ca href\u003d\"https://www.owasp.org/index.php/SQL_injection\"\u003eOWASP\u003c/a\u003e \u003ca href\u003d\"https://webappsec.pbworks.com/SQL-Injection\"\u003eWASC\u003c/a\u003e\u003c/span\u003e",
    "Files": {
        "SourceFile": {
        "File": "com/veracode/verademo/controller/UserController.java",
        "Line": "166",
        "FunctionName": "processLogin",
        "QualifiedFunctionName": "com.veracode.verademo.controller.UserController.processLogin",
        "FunctionPrototype": "java.lang.String processLogin(java.lang.String, java.lang.String, java.lang.String, java.lang.String, org.springframework.ui.Model, javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)",
        "Scope": "com.veracode.verademo.controller.UserController"
        }
    },
    "FlawMatch": {
        "ProcedureHash": "844194490",
        "PrototypeHash": "839857025",
        "FlawHash": "3392777041",
        "FlawHashCount": "1",
        "FlawHashOrdinal": "1",
        "CauseHash": "1176028798",
        "CauseHashCount": "1",
        "CauseHashOrdinal": "1"
    }
    },
*/
const convertPipelineResultFileToSarifFile = (inputFileName,outputFileName) => {
    var results = {};

    let rawdata = fs.readFileSync(inputFileName);
    results = JSON.parse(rawdata);
    console.log('Pipeline Scan results file found and parsed - validated JSON file');

    //"scan_status": "SUCCESS"
    if (results.scan_status==='SUCCESS') {
        let issues = results.results.TestResults.Issues.Issue;
        console.log('Issues count: '+issues.length);

        let rules=[];

        // convert to SARIF json
        let sarifResults = issues.map(issue => {
            // append rule to ruleset - if not already there
            let rule = addRuleToRules(issue,rules);
            if (rule!==null){
                rules.push(rule);
            }

            // construct flaw location
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
            // get the severity number to name
            let serStr = sevIntToStr(issue.Severity);
            // construct the issue
            let resultItem = {
                level: serStr,
                message: {
                    text: issue.Title + ' - '+issue.DisplayText,
                },
                locations: [location],
                ruleId: issue.CWEId
            }
            return resultItem;
        })

        // construct the full SARIF content
        let sarifFileJSONContent = {
            $schema : "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
            version : "2.1.0",
            runs : [
                {
                    tool : {
                        driver : {
                            name : "Veracode Pipeline Scanner",
                            rules: rules
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
}

try {
    convertPipelineResultFileToSarifFile(pipelineInputFileName,sarifOutputFileName);
} catch (error) {
    core.setFailed(error.message);
}

module.exports = {
    sevIntToStr: sevIntToStr,
    convertToSarif: convertPipelineResultFileToSarifFile
}

