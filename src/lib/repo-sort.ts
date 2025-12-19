import type { RepoInfo, RepoInteraction } from '~/types'

const SORT_WEIGHTS = {
  /** Star 数量权重（主要指标） */
  star: 100,
  /** Fork 数量权重（次要指标） */
  fork: 30,
  /** Commit 数量权重（次要指标） */
  commit: 20,
  /** Issue 总数权重（次要指标） */
  issue: 20,
  /** 有描述的加分值 */
  descriptionBonus: 5,
} as const

/**
 * 计算仓库列表中各指标的最大值，用于归一化
 */
function getMaxMetrics(repos: RepoInfo[]) {
  let maxStars = 0
  let maxForks = 0
  let maxCommits = 0
  let maxIssues = 0

  for (const repo of repos) {
    if (repo.stargazerCount > maxStars) {
      maxStars = repo.stargazerCount
    }

    if (repo.forkCount > maxForks) {
      maxForks = repo.forkCount
    }

    // 获取 commit 数量（空仓库可能没有默认分支或 history）
    const commitCount = repo.defaultBranchRef?.target?.history?.totalCount ?? 0

    if (commitCount > maxCommits) {
      maxCommits = commitCount
    }

    const issueCount = repo.issues.totalCount

    if (issueCount > maxIssues) {
      maxIssues = issueCount
    }
  }

  return { maxStars, maxForks, maxCommits, maxIssues }
}

/**
 * 归一化函数：将值映射到 0..1 区间
 * 当 max 为 0 时返回 0，避免除零错误
 */
function normalize(value: number, max: number): number {
  if (max === 0) {
    return 0
  }

  return value / max
}

/**
 * 计算单个仓库的综合得分
 */
function computeRepoScore(
  repo: RepoInfo,
  maxMetrics: { maxStars: number, maxForks: number, maxCommits: number, maxIssues: number },
): number {
  const { maxStars, maxForks, maxCommits, maxIssues } = maxMetrics

  // 归一化各指标到 0..1
  const starNorm = normalize(repo.stargazerCount, maxStars)
  const forkNorm = normalize(repo.forkCount, maxForks)
  const commitNorm = normalize(
    repo.defaultBranchRef?.target?.history?.totalCount ?? 0,
    maxCommits,
  )
  const issueNorm = normalize(repo.issues.totalCount, maxIssues)

  // 计算综合得分
  const score
    = starNorm * SORT_WEIGHTS.star
      + forkNorm * SORT_WEIGHTS.fork
      + commitNorm * SORT_WEIGHTS.commit
      + issueNorm * SORT_WEIGHTS.issue
      + (repo.description ? SORT_WEIGHTS.descriptionBonus : 0)

  return score
}

/**
 * 按展示价值对仓库列表进行综合排序
 *
 * 排序规则：
 * 1. 主要指标：star 数量（权重最高）
 * 2. 次要指标：fork 数量、commit 数量、issue 总数
 * 3. 加分项：有描述的仓库排序更靠前
 * 4. 同分时按 star 数降序，再按仓库名称字母序稳定排序
 *
 * @param repos 原始仓库列表
 * @returns 排序后的仓库列表（不修改原数组）
 */
export function sortReposByDisplayValue(repos: RepoInfo[]): RepoInfo[] {
  if (repos.length === 0) {
    return repos
  }

  // 计算归一化所需的最大值
  const maxMetrics = getMaxMetrics(repos)

  // 为每个仓库计算得分并排序
  const reposWithScore = repos.map((repo) => ({
    repo,
    score: computeRepoScore(repo, maxMetrics),
  }))

  // 排序：综合得分降序 -> star 数降序 -> 名称升序（稳定性 tie-break）
  reposWithScore.sort((a, b) => {
    // 首先按综合得分降序
    if (b.score !== a.score) {
      return b.score - a.score
    }

    // 同分时按 star 数降序
    if (b.repo.stargazerCount !== a.repo.stargazerCount) {
      return b.repo.stargazerCount - a.repo.stargazerCount
    }

    // 最后按名称升序保证稳定性
    return a.repo.name.localeCompare(b.repo.name)
  })

  return reposWithScore.map(({ repo }) => repo)
}

/**
 * 按影响力对仓库列表进行排序
 *
 * 排序规则：
 * 1. 主要指标：影响力评分（社区认可度 + 个人贡献的综合评分）
 * 2. 同分时按 stars 数量降序（社区影响力优先）
 * 3. 再按 commits 数量降序（个人贡献度）
 * 4. 最后按 nameWithOwner 升序保证稳定性
 *
 * @param repos 原始仓库列表
 * @returns 排序后的仓库列表（不修改原数组）
 */
export function sortReposByInfluence(
  repos: RepoInteraction[],
): RepoInteraction[] {
  if (repos.length === 0) {
    return repos
  }

  return [...repos].sort((a, b) => {
    // 首先按影响力评分降序
    if (b.score !== a.score) {
      return b.score - a.score
    }

    // 同分时按 stars 数量降序（社区影响力优先）
    const starsA = a.stargazerCount ?? 0
    const starsB = b.stargazerCount ?? 0

    if (starsB !== starsA) {
      return starsB - starsA
    }

    // 再按 commits 数量降序（个人贡献度）
    if (b.interaction.commits !== a.interaction.commits) {
      return b.interaction.commits - a.interaction.commits
    }

    // 最后按 nameWithOwner 升序保证稳定性
    return a.nameWithOwner.localeCompare(b.nameWithOwner)
  })
}
