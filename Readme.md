# Veracode Pipeline scan results to SARIF - Github Action

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Lerer_veracode-pipeline-scan-results-to-sarif&metric=alert_status)](https://sonarcloud.io/dashboard?id=Lerer_veracode-pipeline-scan-results-to-sarif)

This action take the Veracode pipeline scan json result file as an input and transform it to a SARIF format. <br>

Add the `-jo true` to your Pipeline Scan command to generate the JSON result file. See, [details for the other pipeline scan attributes](https://help.veracode.com/reader/tS9CaFwL4_lbIEWWomsJoA/zjaZE08bAYZVPBWWbgmZvw)</br>

If your github account allows code scanning, you can then upload the `sarif` file to show the scan findings 

See - [Veracode pipeline scan example in github action](https://help.veracode.com/reader/tS9CaFwL4_lbIEWWomsJoA/MVXQBY1PzfrTXGd6V~ZgxA)

<hr>

## Inputs

### `pipeline-results-json`

**Required** The path to the pipeline json result file. Default `"results.json"`.

### `output-results-sarif`

**Optional** The path to the SARIF format result file. Default `"veracode-results.sarif"`.

## Example usage

```
- name: Convert pipeline scan output to SARIF format
  id: convert   
  uses: Lerer/veracode-pipeline-scan-results-to-sarif@v1.0.3
  with:
    pipeline-results-json: results.json
    output-results-sarif: veracode-results.sarif
    
- name: upload sarif file to repository
  uses: github/codeql-action/upload-sarif@v1
  with: # Path to SARIF file relative to the root of the repository
    sarif_file: veracode-results.sarif
```
