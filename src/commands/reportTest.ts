import { getGithubBuildUrl, getGithubCommitUrl } from '../githubUtils'
import { report as reportTest, UltralightApiResponse } from 'ultralight-core'
import * as core from '@actions/core'

export async function reportTestCommand({
  ultralightApiKey,
  ultralightUrl
}: {
  ultralightApiKey: string
  ultralightUrl: string
}): Promise<UltralightApiResponse> {
  const ultralightProductId = parseInt(
    process.env.UL_PRODUCT_ID || core.getInput('ultralight-product-id')
  )
  const testProtocolDefinitionsDirPath =
    process.env.UL_TEST_PROTOCOL_DEFINITIONS_DIRECTORY_PATH ||
    core.getInput('test-protocol-definitions-directory-path')
  const testExecutionReportPath =
    process.env.UL_TEST_EXECUTION_REPORT_PATH ||
    core.getInput('test-execution-report-path')
  if (!ultralightProductId) {
    throw new Error('command=REPORT_TEST requires input ultralight-product-id')
  }

  const result: UltralightApiResponse = await reportTest({
    buildUrl: getGithubBuildUrl(),
    commitUrl: getGithubCommitUrl(),
    testExecutionReportPath,
    testProtocolDefinitionsDirPath,
    ultralightProductId,
    ultralightApiKey,
    ultralightUrl
  })
  return result
}
