export const getGithubCommitUrl = (): string => {
  return `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/tree/${process.env.GITHUB_SHA}`
}

export const getGithubBuildUrl = (): string => {
  return `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
}
