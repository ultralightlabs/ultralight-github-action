import * as core from '@actions/core'
import * as github from '@actions/github'
import axios from 'axios'
import { uploadFile } from './upload'
import { getAuthHeader } from './utils'
import { getGithubBuildUrl } from './githubUtils'

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

    const githubSha = process.env.GITHUB_SHA
      ? process.env.GITHUB_SHA
      : github.context.sha

    const testProtocolDefinitionsDirPath = process.env
      .UL_TEST_PROTOCOL_DEFINITIONS_DIRECTORY_PATH
      ? process.env.UL_TEST_PROTOCOL_DEFINITIONS_DIRECTORY_PATH
      : core.getInput('test-protocol-definitions-directory-path')

    /* Test Report START */
    let reportKey = ''
    let reportBucket = ''
    if (testExecutionReportPath) {
      core.info(`Uploading test report from ${testExecutionReportPath}`)
      const { key, bucket } = await uploadFile(
        testExecutionReportPath,
        ultralightUrl
      )
      reportKey = key
      reportBucket = bucket
    }

    /* Test Report END */

    /* Test Steps START */

    let testProtocolDefinitionsKey = ''
    let testProtocolDefinitionsBucket = ''
    if (testProtocolDefinitionsDirPath) {
      core.info(`Uploading test steps from ${testProtocolDefinitionsDirPath}`)
      /** zip up the directory and upload */
      const { key, bucket } = await uploadFile(
        testProtocolDefinitionsDirPath,
        ultralightUrl
      )
      testProtocolDefinitionsKey = key
      testProtocolDefinitionsBucket = bucket
    }

    /* Test Steps END */

    const result = await axios.post(
      new URL('api/v1/report/build', ultralightUrl).toString(),
      {
        githubBuildUrl: getGithubBuildUrl(),
        githubSha,
        testReport: testExecutionReportPath
          ? {
              key: reportKey,
              bucket: reportBucket
            }
          : undefined,
        testSteps: testProtocolDefinitionsDirPath
          ? {
              key: testProtocolDefinitionsKey,
              bucket: testProtocolDefinitionsBucket
            }
          : undefined,
        ultralightProductId
      },
      {
        headers: {
          ...getAuthHeader()
        }
      }
    )
    core.info(`Test execution result: ${JSON.stringify(result.data)}`)
    const data = result.data

    if (data.errors) {
      for (const error of data.errors) {
        core.error(error.message)
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
