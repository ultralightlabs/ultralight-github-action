import * as core from '@actions/core'
import { getApiKey } from './utils'
import { UltralightApiResponse } from 'ultralight-core'
import { reportCommitCommand } from './commands/reportCommit'
import { reportTestCommand } from './commands/reportTest'

export async function run(): Promise<void> {
  try {
    const command = process.env.COMMAND || core.getInput('command')

    const ultralightApiKey = getApiKey()
    const ultralightUrl =
      process.env.ULTRALIGHT_URL || core.getInput('ultralight-url')

    let result: UltralightApiResponse

    switch (command) {
      case 'REPORT_TEST':
        result = await reportTestCommand({
          ultralightApiKey,
          ultralightUrl
        })
        break
      case 'REPORT_COMMIT':
        result = await reportCommitCommand(ultralightUrl, ultralightApiKey)
        break
      default:
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
