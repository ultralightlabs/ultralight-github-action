import * as core from '@actions/core'

export const getAuthHeader = (): { 'X-API-KEY': string } => {
  const ultralightApiKey = process.env.UL_API_KEY
    ? process.env.UL_API_KEY
    : core.getInput('ultralight-api-key')
  if (!ultralightApiKey) {
    throw new Error('Ultralight API key is required')
  }
  return {
    'X-API-KEY': ultralightApiKey
  }
}
