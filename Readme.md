# Hello world javascript action

This action prints "Hello World" or "Hello" + the name of a person to greet to the log.

## Inputs

### `pipeline-results-json`

**Required** The path to the pipeline json result file. Default `"results.json"`.

### `output-results-sarif`

**Required** The path to the SARIF format result file. Default `"veracode-results.sarif"`.

## Example usage

uses: Lerer/veracode-pipeline-scan-results-to-sarif@v1  
with:  
&nbsp;&nbsp;&nbsp;&nbsp;pipeline-results-json: results.json  
&nbsp;&nbsp;&nbsp;&nbsp;output-results-sarif: veracode-results.sarif  