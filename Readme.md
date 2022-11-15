# Veracode Static Analysis Pipeline scan and import of results to SARIF - GitHub Action

This action has a workflow which initiates a Veracode Static Analyis Pipeline Scan and takes the Veracode pipeline scan JSON result file as an input and transforms it to a SARIF format.

Add the `-jo true` to your Pipeline Scan command to generate the JSON result file. See [details for the other pipeline scan attributes](https://docs.veracode.com/r/r_pipeline_scan_commands).

If your GitHub account allows code scanning alerts, you can then upload the `sarif` file to show the scan findings.

See [Veracode pipeline scan example in GitHub action](https://docs.veracode.com/go/c_about_github).

---

## Inputs

### `pipeline-results-json`

**Required** The path to the pipeline json result file.
|Default value |  `"results.json"`|
--- | ---

### `output-results-sarif`

**Optional** The path to the SARIF format result file.
|Default value|`"veracode-results.sarif"`|
--- | ---

### `source-base-path-1` (can go from `1` to `3`)

**Optional** In some compilations, the path representation is not the same as the repository root folder. In order to add the ability to navigate back from the scanning issue to the file in the repository, a base path to the source is required. The input format is regex base (`"[search pattern]:[replace with pattern]"`).
| Default value | `""` |
--- | ---

### `finding-rule-level`

**Optional** The conversion rule from Veracode finding levels to Github levels.

- **Veracode levels**: 5 = `Very High`, 4 = `High`, 3 = `Medium`, 2 = `Low`, 1 = `Very Low`, 0 = `informational`.
- **GitHub levels**: `error`, `warning`, `note`.  

Example values:

- "4:3:0" => `High` and `Very high` will show as `error`, Medium as `warning` and the rest as `note`
- "3:2:1" => `Medium` and above will show as `error`, `Low` as `warning`, `Very Low` as `note`, and `informational` will not show at all

**Note:**  Only **`error`** level will fail pull request check
| Default value| `"4:3:0"` |
--- | ---

## Example usage

```yaml
  results_to_sarif:
    needs: pipeline_scan
    runs-on: ubuntu-latest
    name: import pipeline results to sarif
    steps:
      - name: Convert pipeline scan output to SARIF format
        id: convert
        uses: Veracode/veracode-pipeline-scan-results-to-sarif@v0.1.7
        with:
          pipeline-results-json: results.json
          output-results-sarif: veracode-results.sarif
          source-base-path-1: "^com/veracode:src/main/java/com/veracode"
          source-base-path-2: "^WEB-INF:src/main/webapp/WEB-INF"
          finding-rule-level: "3:1:0"

      - name: upload sarif file to repository
        uses: github/codeql-action/upload-sarif@v2
        with: # Path to SARIF file relative to the root of the repository
          sarif_file: veracode-results.sarif
 ```
