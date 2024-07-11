# Ultralight GitHub Action

This GitHub Action reports test protocols and executions to your Ultralight
instance, for best-in-class traceability.

## Usage

```yaml
- if: always() # Runs even if previous steps fail
  uses: ultralightlabs/ultralight-github-action@v1
  with:
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

    # Optional, enables test protocol updates.
    # Path to the directory holding the YAML files for your test protocol
    # definitions. Every test protocol must be an existing Verification (e.g.
    # VER-1) or Validation (e.g. VAL-2) in your Ultralight Design Controls
    # instance.
    # See "Test Protocol Definitions" section below for how the
    # files should be formatted.
    test-protocol-definitions-directory-path: test-protocols/
```

### Test Protocol Definitions

Each test case must be written in a separate YAML file in the following format:

```yaml
ultralight-test-id: number
title: string
description: string
steps:
  - step: string
    acceptance_criteria: string
  - step: string
    acceptance_criteria: string
```

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

### Pull Request with Label

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

### ⚠️ Not Recommended ⚠️

You should avoid adding the Ultralight GitHub Action to an existing CI build
(for example, a workflow that is triggered for every pushed commit or PR). This
will mostly result in undesired noise in your Design Controls instance.
