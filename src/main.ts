import * as core from '@actions/core'
import { getGithubBuildUrl, getGithubCommitUrl } from './githubUtils'
import { getApiKey } from './utils'
import { report as reportTest, reportCommit } from 'ultralight-core'
import fs from 'fs'

export async function run(): Promise<void> {
  try {
    const command = process.env.COMMAND || core.getInput('command')

    const ultralightApiKey = getApiKey()
    const ultralightProductId = parseInt(
      process.env.UL_PRODUCT_ID || core.getInput('ultralight-product-id')
    )
    const ultralightUrl =
      process.env.ULTRALIGHT_URL || core.getInput('ultralight-url')

    const testProtocolDefinitionsDirPath =
      process.env.UL_TEST_PROTOCOL_DEFINITIONS_DIRECTORY_PATH ||
      core.getInput('test-protocol-definitions-directory-path')
    const testExecutionReportPath =
      process.env.UL_TEST_EXECUTION_REPORT_PATH ||
      core.getInput('test-execution-report-path')

    const commitHash = process.env.COMMIT_HASH || core.getInput('commit-hash')
    const prUrl = process.env.PR_URL || core.getInput('pr-url')
    const prDescriptionFilePath =
      process.env.PR_DESCRIPTION_FILE_PATH ||
      core.getInput('pr-description-file-path')

    if (command === 'reportTest') {
      await handleReportTest({
        testExecutionReportPath,
        testProtocolDefinitionsDirPath,
        ultralightProductId,
        ultralightApiKey,
        ultralightUrl
      })
    } else {
      // command === 'reportCommit'
      await handleReportCommit({
        ultralightApiKey,
        ultralightUrl,
        commitHash,
        prUrl,
        prDescriptionFilePath
      })
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

const handleReportTest = async ({
  testExecutionReportPath,
  testProtocolDefinitionsDirPath,
  ultralightProductId,
  ultralightApiKey,
  ultralightUrl
}: {
  testExecutionReportPath: string
  testProtocolDefinitionsDirPath: string
  ultralightProductId: number
  ultralightApiKey: string
  ultralightUrl: string
}): Promise<void> => {
  const result = await reportTest({
    buildUrl: getGithubBuildUrl(),
    commitUrl: getGithubCommitUrl(),
    testExecutionReportPath,
    testProtocolDefinitionsDirPath,
    ultralightProductId,
    ultralightApiKey,
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
}

const handleReportCommit = async ({
  ultralightApiKey,
  ultralightUrl,
  commitHash,
  prUrl,
  prDescriptionFilePath
}: {
  ultralightApiKey: string
  ultralightUrl: string
  commitHash: string
  prUrl: string
  prDescriptionFilePath: string
}): Promise<void> => {
  await reportCommit({
    ultralightUrl,
    ultralightApiKey,
    pullRequestDescription: fs.readFileSync(prDescriptionFilePath, 'utf8'),
    commit: {
      hash: commitHash,
      pullRequestUrl: prUrl
    }
  })
}
