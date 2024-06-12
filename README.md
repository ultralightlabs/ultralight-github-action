# Ultralight GitHub Action

This GitHub Action reports test protocols and executions to your Ultralight instance, for best-in-class traceability.

See the input descriptions in [action.yml](action.yml) for full details on
usage.

## Example Usage

```yaml
- name: Report to Ultralight
  uses: ultralightlabs/ultralight-github-action
  with:
    ultralight-api-key: ${{secrets.ULTRALIGHT_GH_ACTION_API_KEY}}
    ultralight-product-id: ${{secrets.ULTRALIGHT_GH_ACTION_PRODUCT_ID}}
    test-execution-report-path: test-results/junit.xml
    test-protocol-definitions-directory-path: test-protocols/
```

## Developer Guide

- All: `yarn all`
- Lint: `yarn lint`
- Format: `yarn format:write`
- Build for packaging: `yarn package`
