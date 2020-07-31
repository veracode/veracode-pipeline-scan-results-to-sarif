# Veracode Pipeline scan results to SARIF - Github Action

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Lerer_veracode-pipeline-scan-results-to-sarif&metric=alert_status)](https://sonarcloud.io/dashboard?id=Lerer_veracode-pipeline-scan-results-to-sarif)

This action take the Veracode pipeline scan json result file as an input and transform it to a SARIF format. <br>

Add the `-jo true` to your Pipeline Scan command to generate the JSON result file. See, [details for the other pipeline scan attributes](https://help.veracode.com/reader/tS9CaFwL4_lbIEWWomsJoA/zjaZE08bAYZVPBWWbgmZvw)</br>

If your github account allows code scanning, you can then upload the `sarif` file to show the scan findings 

See - [Veracode pipeline scan example in github action](https://help.veracode.com/reader/tS9CaFwL4_lbIEWWomsJoA/MVXQBY1PzfrTXGd6V~ZgxA)

<hr>

# Inputs

## `pipeline-results-json`

**Required** The path to the pipeline json result file. 
|Default value |  `"results.json"`|
--- | ---

## `output-results-sarif`

**Optional** The path to the SARIF format result file.
|Default value|`"veracode-results.sarif"`|
--- | ---

## `source-base-path-1` (can go from `1` to `3`)

**Optional** In some compilations, the path representation is not the same as the repository root folder. In order to add the ability to navigate back from the scanning issue to the file in the repository, a base path to the source is required. The input format is regex base (`"[search pattern]:[replace with pattern]"`). 
| Default value | `""` |
--- | ---

## `finding-rule-level`

**Optional** The conversion rule from Veracode finding levels to Github levels.

- **Veracode levels**: 5 = `Very High`, 4 = `High`, 3 = `Medium`, 2 = `Low`, 1 = `Very Low`, 0 = `informational`.
- **GitHub levels**: `error`, `warning`, `note`.  

Example values: 
- "4:3:0" => `High` and `Very high` will show as `error`, Medium as `warning` and the rest as `note`
- "3:2:1" => `Medium` and above will show as `error`, `Low` as `warning`, `Very Low` as `note`, and `informational` will not show at all

**Note:**  Only **`error`** level will fail pull request check 
| Default value| `"4:3:0"` |
--- | ---
# Example usage

```
- name: Convert pipeline scan output to SARIF format
  id: convert   
  uses: Lerer/veracode-pipeline-scan-results-to-sarif@v1.0.5
  with:
    pipeline-results-json: results.json
    output-results-sarif: veracode-results.sarif
    source-base-path-1: "^com/veracode:src/main/java/com/veracode"
    source-base-path-2: "^WEB-INF:src/main/webapp/WEB-INF"
    finding-rule-level: "3:1:0"
      
- name: upload sarif file to repository
  uses: github/codeql-action/upload-sarif@v1
  with: # Path to SARIF file relative to the root of the repository
    sarif_file: veracode-results.sarif
```
