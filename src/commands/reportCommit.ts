import * as core from '@actions/core'
import * as github from '@actions/github'
import { reportCommit, UltralightApiResponse } from 'ultralight-core'

export async function reportCommitCommand(
  ultralightUrl: string,
  ultralightApiKey: string
): Promise<UltralightApiResponse> {
  if (!github.context.payload.pull_request) {
    throw new Error(
      'command=REPORT_COMMIT requires pull_request in github context'
    )
  }
  const pullRequestPayload = github.context.payload.pull_request

  const commitHash = process.env.COMMIT_HASH || pullRequestPayload.head.sha
  const prUrl = process.env.PR_URL || pullRequestPayload.html_url
  const prDescription =
    process.env.PR_DESCRIPTION_FILE_PATH || pullRequestPayload.body

  if (!prDescription) {
    throw new Error(
      'command=REPORT_COMMIT requires PR_DESCRIPTION_FILE_PATH or pull_request.body'
    )
  }
  if (!prUrl) {
    throw new Error(
      'command=REPORT_COMMIT requires PR_URL or pull_request.html_url'
    )
  }
  if (!commitHash) {
    throw new Error(
      'command=REPORT_COMMIT requires COMMIT_HASH or pull_request.head.sha'
    )
  }

  const result = await reportCommit({
    ultralightUrl,
    ultralightApiKey,
    pullRequestDescription: prDescription,
    commit: {
      hash: commitHash,
      pullRequestUrl: prUrl
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
  return result
}
