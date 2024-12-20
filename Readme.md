# Veracode Static Analysis Pipeline and Policy scan and import of results to SARIF - GitHub Action

This action includes a workflow that triggers a Veracode Static Analysis Pipeline Scan or Policy Scan. It accepts the Veracode pipeline or policy scan JSON result file as input and converts it to SARIF format.

Add the `-jo true` to your Pipeline Scan command to generate the JSON result file. See [details for the other pipeline scan attributes](https://docs.veracode.com/r/r_pipeline_scan_commands).

If your GitHub account allows code scanning alerts, you can then upload the `sarif` file to show the scan findings.

Run a pipeline or policy scan of your application code within your GitHub development pipeline. The action also converts the scan results to a Static Analysis Results Interchange Format (SARIF) file and imports them as code-scanning alerts. To view the scan results, in your GitHub project, select Security > Code scanning alerts.

To configure this action, edit the settings in the provided /workflows/main.yml file. For example, if you do not want the action to convert the scan results from JSON format to SARIF format and import them into GitHub, you can remove or comment out those settings.

---

## Inputs:

- ### `scan-type`
  **Required** The scan type for which a SARIF report needs to be generated can be either a `pipeline` or a `policy` scan.
  |Default value |  `"pipeline"`|
  --- | ---

- ### `results-json`
  **Required** The location of the JSON result file for the policy or pipeline.
  |Default value |  `"results.json"`|
  --- | ---

- ### `pipeline-results-json` -- DEPRECATED
  **Make sure you use results-json instead**
  --- | ---

- ### `output-results-sarif`
  **Optional** The path to the SARIF format result file.
  |Default value|`"veracode-results.sarif"`|
  --- | ---

- ### `source-base-path-1` (can go from `1` to `3`)
  **Optional** In some compilations, the path representation is not the same as the repository root folder. In order to add the ability to navigate back from the scanning issue to the file in the repository, a base path to the source is required. The input format is regex base (`"[search pattern]:[replace with pattern]"`).
  | Default value | `""` |
  --- | ---

- ### `finding-rule-level`
  **WARNING  
  The 'finding-rule-level' input is deprecated and will be removed in a future release.  
  It will be overwritten witten with 4:3:0  
  This setting is not needed anymore as GitHub as introduced granular control over the severity of findings  
  Please find more information here: https://github.blog/changelog/2021-07-19-codeql-code-scanning-new-severity-levels-for-security-alerts/#about-security-severity-levels**  
    
  **Optional** The conversion rule from Veracode finding levels to GitHub levels.

  - **Veracode levels**: 5 = `Very High`, 4 = `High`, 3 = `Medium`, 2 = `Low`, 1 = `Very Low`, 0 = `informational`.
  - **GitHub levels**: `error`, `warning`, `note`.  

  Example values:

  - "4:3:0" => `High` and `Very high` will show as `error`, Medium as `warning` and the rest as `note`
  - "3:2:1" => `Medium` and above will show as `error`, `Low` as `warning`, `Very Low` as `note`, and `informational` will not show at all

  **Note:**  Only **`error`** level will fail pull request check
  | Default value| `"4:3:0"` |
  --- | ---

- ### `repo_owner`
  **Optional** The account owner of the repository. The name is not case-sensitive. This is only required if the action runs on a different repository than the one where the results should be published.

- ### `repo_name`
  **Optional** The name of the repository without the .git extension. The name is not case-sensitive. This is only required if the action runs on a different repository than the one where the results should be published

- ### `githubToken`
  **Required** GitHub token is a secure token that allows the workflow to interact with the GitHub API and perform actions on behalf of the repository or user

- ### `ref`
  **Required** The full Git reference

- ### `commitSHA`
  **Required** The SHA of the commit to which the analysis you are uploading relates
  
- ### `noupload`
  **Optional** Will allow to only create the SARIF file and not upload it to the repository. This is useful if you want to use the SARIF file in a different way.


## Example usage

- ### Pipeline Scan

```yaml
  results_to_sarif:
    needs: pipeline_scan
    runs-on: ubuntu-latest
    name: import pipeline results to sarif
    steps:
      - name: Get scan results
        uses: actions/download-artifact@v3
        with:
          name: "Veracode Pipeline-Scan Results"
      - name: Convert pipeline scan output to SARIF format
        id: convert
        uses: Veracode/veracode-pipeline-scan-results-to-sarif@v1.0.7
        with:
          results-json: filtered_results.json
          output-results-sarif: veracode-results.sarif
          source-base-path-1: "^com/veracode:src/main/java/com/veracode"
          source-base-path-2: "^WEB-INF:src/main/webapp/WEB-INF"
          output-results-sarif: veracode-results.sarif
          repo_owner: OWNER
          repo_name: REPO
          commitSHA: 4b6472266afd7b471e86085a6659e8c7f2b119da
          ref: refs/heads/master
          githubToken: *****
 ```
 - ### Policy Scan

 ```yaml
    get-policy-flaws:
      runs-on: ubuntu-latest
      container: 
        image: veracode/api-signing:latest
      steps:
        - name: get policy flaws
          run: |
            cd /tmp
            export VERACODE_API_KEY_ID=${{ secrets.VID }}
            export VERACODE_API_KEY_SECRET=${{ secrets.VKEY }}
            guid=$(http --auth-type veracode_hmac GET "https://api.veracode.com/appsec/v1/applications?name=VERACODE-PROFILE-NAME" | jq -r '._embedded.applications[0].guid') 
            echo GUID: ${guid}
            total_flaws=$(http --auth-type veracode_hmac GET "https://api.veracode.com/appsec/v2/applications/${guid}/findings?scan_type=STATIC&violates_policy=True" | jq -r '.page.total_elements')
            echo TOTAL_FLAWS: ${total_flaws}
            http --auth-type veracode_hmac GET "https://api.veracode.com/appsec/v2/applications/${guid}/findings?scan_type=STATIC&violates_policy=True&size=${total_flaws}" > policy_flaws.json

        - name: save results file
          uses: actions/upload-artifact@v3
          with:
            name: policy-flaws
            path: /tmp/policy_flaws.json


  results_to_sarif:
    needs: policy_scan
    runs-on: ubuntu-latest
    name: import policy results to sarif
    steps:
      - name: Get scan results
        uses: actions/download-artifact@v3
        with:
          name: "Veracode Policy-Scan Results"
      - name: Convert policy scan output to SARIF format
        id: convert
        uses: Veracode/veracode-pipeline-scan-results-to-sarif@v1.0.7
        with:
          results-json: /tmp/policy_flaws.json
          output-results-sarif: veracode-results.sarif
          source-base-path-1: "^com/veracode:src/main/java/com/veracode"
          source-base-path-2: "^WEB-INF:src/main/webapp/WEB-INF"
          output-results-sarif: veracode-results.sarif
          repo_owner: OWNER
          repo_name: REPO
          commitSHA: COMMIT-SHA
          ref: refs/heads/master
          githubToken: *****
 ```

## Build the package on your own
``` ncc build src/action.ts```
