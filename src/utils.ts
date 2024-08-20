import * as core from '@actions/core'

export const getApiKey = (): string => {
  const ultralightApiKey = process.env.UL_API_KEY
    ? process.env.UL_API_KEY
    : core.getInput('ultralight-api-key')
  if (!ultralightApiKey) {
    throw new Error('Ultralight API key is required')
  }
  return ultralightApiKey
}
