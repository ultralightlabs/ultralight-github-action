import * as core from '@actions/core'
import * as github from '@actions/github'
import type { PullRequestEvent } from '@octokit/webhooks-definitions/schema'
import { getGithubBuildUrl, getGithubCommitUrl } from './githubUtils'
import { getApiKey } from './utils'
import {
  report as reportTest,
  reportCommit,
  UltralightApiResponse
} from 'ultralight-core'
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
    const unitUnderTest =
      process.env.UL_UNIT_UNDER_TEST ||
      core.getInput('test-execution-unit-under-test')

    let result: UltralightApiResponse

    const pullRequestEventPayload = github.context.payload
      .pull_request as PullRequestEvent['pull_request']

    const commitHash =
      core.getInput('commit-hash') || pullRequestEventPayload?.head?.sha
    const prUrl = core.getInput('pr-url') || pullRequestEventPayload?.html_url

    const isMergeCommit =
      core.getInput('is-merge-commit').toLowerCase() === 'true' ||
      pullRequestEventPayload.merged === true

    if (command === 'REPORT_TEST') {
      if (!ultralightProductId)
        throw new Error(
          'command=REPORT_TEST requires input ultralight-product-id'
        )

      result = await reportTest({
        buildUrl: getGithubBuildUrl(),
        commitUrl: getGithubCommitUrl(),
        commitHash,
        pullRequestUrl: prUrl,
        isMergeCommit,
        testExecutionReportPath,
        unitUnderTest,
        testProtocolDefinitionsDirPath,
        ultralightProductId,
        ultralightApiKey,
        ultralightUrl
      })
    } else if (command === 'REPORT_COMMIT') {
      let prDescription: string | null = null

      const prDescriptionFilePath =
        process.env.PR_DESCRIPTION_FILE_PATH ||
        core.getInput('pr-description-file-path')
      if (prDescriptionFilePath) {
        prDescription = fs.readFileSync(prDescriptionFilePath, 'utf8')
      }
      prDescription = prDescription || pullRequestEventPayload?.body

      if (!(commitHash && prUrl && prDescription)) {
        throw new Error(
          'command=REPORT_COMMIT requires env variables COMMIT_HASH, PR_URL, and PR_DESCRIPTION_FILE_PATH to be set when not triggered by a pull_request event'
        )
      }

      result = await reportCommit({
        ultralightUrl,
        ultralightApiKey,
        pullRequestDescription: prDescription,
        commit: {
          hash: commitHash,
          pullRequestUrl: prUrl,
          isMergeCommit
        }
      })

      if (result.data) {
        const data = result.data as {
          mergeAllowed: {
            value: boolean
          }
        }
        core.setOutput('merge-allowed', String(data.mergeAllowed.value))
        core.setOutput('report-commit-data', JSON.stringify(data))
      }
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
