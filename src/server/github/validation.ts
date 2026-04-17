const GITHUB_USERNAME_RE = /^[a-z\d](?:[a-z\d-]{0,38}[a-z\d])?$/i
const GITHUB_REPO_NAME_RE = /^[a-z\d._-]{1,100}$/i

export function isValidGitHubUsername(username: string): boolean {
  return GITHUB_USERNAME_RE.test(username)
}

export function isValidGitHubRepoName(repo: string): boolean {
  return GITHUB_REPO_NAME_RE.test(repo)
}

export function isValidContributionYear(year: number): boolean {
  const currentYear = new Date().getFullYear()

  return Number.isInteger(year) && year >= 2008 && year <= currentYear
}
