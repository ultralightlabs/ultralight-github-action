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

    let result: {
      messages: string[]
      warnings: string[]
      errors: string[]
    }

    if (command === 'reportTest') {
      if (!ultralightProductId)
        throw new Error(
          'command=reportTest requires input ultralight-product-id'
        )

      result = await reportTest({
        buildUrl: getGithubBuildUrl(),
        commitUrl: getGithubCommitUrl(),
        testExecutionReportPath,
        testProtocolDefinitionsDirPath,
        ultralightProductId,
        ultralightApiKey,
        ultralightUrl
      })
    } else if (command === 'reportCommit') {
      if (!commitHash)
        throw new Error('command=reportCommit requires input commit-hash')
      if (!prUrl) throw new Error('command=reportCommit requires input pr-url')
      if (!prDescriptionFilePath)
        throw new Error(
          'command=reportCommit requires input pr-description-file-path'
        )

      result = await reportCommit({
        ultralightUrl,
        ultralightApiKey,
        pullRequestDescription: fs.readFileSync(prDescriptionFilePath, 'utf8'),
        commit: {
          hash: commitHash,
          pullRequestUrl: prUrl
        }
      })
    } else {
      throw new Error(`Unknown command: ${command}`)
    }

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
