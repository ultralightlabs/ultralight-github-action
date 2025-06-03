# Ultralight GitHub Action

This GitHub Action reports code commits, test protocols, and test executions to
your Ultralight instance, for best-in-class traceability.

## Usage

### `command: REPORT_TEST`

```yaml
- if: always() # Runs even if previous steps fail
  uses: ultralightlabs/ultralight-github-action@v1
  with:
    # Required.
    # The command type. One of 'REPORT_TEST' or 'REPORT_COMMIT'.
    command: REPORT_TEST

    # Required.
    # This can be generated in the Ultralight web app's settings page. Store
    # this as a secret.
    ultralight-api-key: ${{secrets.ULTRALIGHT_GH_ACTION_API_KEY}}

    # Required.
    # The ID of your Ultralight product. You can find this in your browser URL
    # when viewing your product in the Ultralight web app:
    # https://app.ultralightlabs.com/[organization-name]/#products/[ultralight-product-id].
    # Store this as a secret.
    ultralight-product-id: ${{secrets.ULTRALIGHT_GH_ACTION_PRODUCT_ID}}

    # Optional, enables test execution reports.
    # Path to the test execution report file. The Ultralight API supports the
    # JUnit XML format for test execution reports. Most testing frameworks
    # provide mechanisms to output in JUnit, either in-built or via plugins.
    # Every test case in the test execution output must include the ID of an
    # existing Verification (e.g. VER-1) or Validation (e.g. VAL-2) in your
    # Ultralight Design Controls instance.
    test-execution-report-path: test-results/junit.xml

    # Optional, custom 'Unit Under Test' to display in test execution report
    test-execution-unit-under-test: V123.456.789

    # Optional, enables test protocol updates.
    # Path to the directory holding the YAML files for your test protocol
    # definitions. Every test protocol must be an existing Verification (e.g.
    # VER-1) or Validation (e.g. VAL-2) in your Ultralight Design Controls
    # instance.
    # See "Test Protocol Definitions" section below for how the
    # files should be formatted.
    test-protocol-definitions-directory-path:
      test-protocols/

      # Recommended to enable Release module integrations if your trigger is not a `pull_request` event.
    # Commit hash queried from your github action context. Query method varies depending on your
    # workflow's event trigger.
    # See https://github.com/ultralightlabs/test-project/blob/main/.github/workflows/report-commit
    # for full examples conditioned on event trigger.
    commit-hash:

    # Recommended to enable Release module integrations if your trigger is not a `pull_request` event.
    # PR URL queried from your github action context. Query method varies depending on your
    # workflow's event trigger.
    # See https://github.com/ultralightlabs/test-project/blob/main/.github/workflows/report-commit
    # for full examples conditioned on event trigger.
    pr-url:
```

#### Test Protocol Definitions

Each test case must be written in a separate YAML file in the following format:

```yaml
ultralight-test-id: number
title: string
method: string (optional. e.g. Unit Test)
description: string
steps:
  - step: string
    acceptance_criteria: string
  - step: string
    acceptance_criteria: string
```

### `command: REPORT_COMMIT`

```yaml
- if: always() # Runs even if previous steps fail
  id: report-commit
  uses: ultralightlabs/ultralight-github-action@v1
  with:
    # Required.
    # The command type. One of 'REPORT_TEST' or 'REPORT_COMMIT'.
    command: REPORT_COMMIT

    # Required.
    # This can be generated in the Ultralight web app's settings page. Store
    # this as a secret.
    ultralight-api-key: ${{secrets.ULTRALIGHT_GH_ACTION_API_KEY}}

    # The variables below are included automatically in the context of `pull_request` events.
    # If your build triggers off a non-`pull_request` event, you will need to supply the below variables,
    # which may involve additional requests to the GitHub API.
    # See https://github.com/ultralightlabs/test-project/blob/main/.github/workflows/report-commit
    # for full examples conditioned on event trigger.

    # Required if your trigger is not a `pull_request` event.
    # Commit hash queried from your github action context. Query method varies depending on your
    # workflow's event trigger.
    # See https://github.com/ultralightlabs/test-project/blob/main/.github/workflows/report-commit
    # for full examples conditioned on event trigger.
    commit-hash:

    # Required if your trigger is not a `pull_request` event.
    # PR URL queried from your github action context. Query method varies depending on your
    # workflow's event trigger.
    # See https://github.com/ultralightlabs/test-project/blob/main/.github/workflows/report-commit
    # for full examples conditioned on event trigger.
    pr-url:

    # Required if your trigger is not a `pull_request` event.
    # PR description queried from your github action context. Query method varies depending on your
    # workflow's event trigger.
    # See https://github.com/ultralightlabs/test-project/blob/main/.github/workflows/report-commit
    # for full examples conditioned on event trigger.
    pr-description-file-path: pr-body.txt

    # Can be supplied optionally if your trigger is not a `pull_request` event.
    # Whether the supplied commit is a `merge` commit, queried from your github action context. Query method varies depending on your
    # workflow's event trigger.
    # Updating an approved Software Part Version with a merge commit will NOT withdraw approval for that Software Part Version.
    # See https://github.com/ultralightlabs/test-project/blob/main/.github/workflows/report-commit
    # for full examples conditioned on event trigger.
    is-merge-commit:

  # Use outputs as desired to handle merge block or other release context.
- run: |
    echo '${{ steps.report-commit.outputs.merge-allowed }}'
    echo '${{ steps.report-commit.outputs.report-commit-data }}' | jq '.mergeAllowed'
    echo '${{ steps.report-commit.outputs.report-commit-data }}' | jq '.updatedSoftwarePartVersions'
```

#### Release Definitions

The `REPORT_COMMIT` command will read Ultralight Release details that you
specify in your PR description. They must be specified in the following YAML
format. You may want to add this example to your PR template:

````yaml
```ultralight
releases:
  - UL-RLS-X
  - UL-RLS-Y
software-parts:
  - id: SW-PART-A
    versions:
      - 2
  - id: SW-PART-B
merge-block-override: # OPTIONAL. Must be one of SKIP_RELEASE_DOCUMENTATION or SKIP_VERSION_APPROVAL
```
````

## Integrating into your team's release process

Example GitHub workflow triggers, depending on your team's GitHub process around
production deploys.

### Releases

This will trigger when a release is published as prerelease, before your team
finalizes and marks it as the latest release.

```yaml
on:
  release:
    types: [prereleased]
```

### Pull Request

This will trigger when you open, edit, reopen, or push to a PR.

```yaml
on:
  pull_request:
    types: [opened, edited, reopened, synchronize]
```

### Merge (push to main)

This will trigger when you merge a feature branch or push a commit to main.

```yaml
on:
  push:
    branches: [main]
```

### Manual

Allows you to trigger the workflow manually at any time via the GitHub Actions
web UI. Useful for testing during the setup of your workflow.

```yaml
on:
  workflow_dispatch:
```

### Alternatives

See
[GitHub's documentation on workflow triggers](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
for further customization to fit to your team's release processes.
