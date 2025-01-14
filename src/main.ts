import * as core from '@actions/core'
import {
  getGithubBuildUrl,
  getGithubCommitUrl,
  getGithubPullRequestUrl
} from './githubUtils'
import { getApiKey } from './utils'
import { report as reportUltralight } from 'ultralight-core'

export async function run(): Promise<void> {
  try {
    const testExecutionReportPath = process.env.UL_TEST_EXECUTION_REPORT_PATH
      ? process.env.UL_TEST_EXECUTION_REPORT_PATH
      : core.getInput('test-execution-report-path')

    const ultralightUrl = process.env.ULTRALIGHT_URL
      ? process.env.ULTRALIGHT_URL
      : core.getInput('ultralight-url')

    const ultralightProductId = parseInt(
      process.env.UL_PRODUCT_ID
        ? process.env.UL_PRODUCT_ID
        : core.getInput('ultralight-product-id')
    )

    const testProtocolDefinitionsDirPath = process.env
      .UL_TEST_PROTOCOL_DEFINITIONS_DIRECTORY_PATH
      ? process.env.UL_TEST_PROTOCOL_DEFINITIONS_DIRECTORY_PATH
      : core.getInput('test-protocol-definitions-directory-path')

    const result = await reportUltralight({
      buildUrl: getGithubBuildUrl(),
      commitUrl: getGithubCommitUrl(),
      pullRequestUrl: getGithubPullRequestUrl(),
      testExecutionReportPath,
      testProtocolDefinitionsDirPath,
      ultralightProductId,
      ultralightApiKey: getApiKey(),
      ultralightUrl
    })
    for (const info of result.messages) {
      core.info(info)
    }
    for (const warn of result.warnings) {
      core.warning(warn)
    }

    if (result.errors.length > 0) {
      for (const error of result.errors) {
        core.error(error)
      }
      core.setFailed('Ultralight GitHub Action failed')
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
