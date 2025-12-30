import { array, type InferInput, nullable, number, object, optional, string } from 'valibot'

import type { BlockShape, ColorScheme, ContributionLevel, ErrorType, GraphSize } from '~/enums'

export type Themes = 'Classic' | 'Midnight' | 'Sunset' | 'Sunsetx' | 'Violet' | 'GreenWall'

type GitHubProfileName = string

export type GitHubUsername = string

export type ContributionYear = number

export interface GitHubUser {
  name?: GitHubProfileName
  login: GitHubUsername
  avatarUrl: string
  bio?: string
  followers: {
    totalCount: number
  }
  following: {
    totalCount: number
  }
  contributionsCollection: {
    years: ContributionYear[]
  }
}

export interface GitHubContributionCalendar {
  contributionsCollection: {
    contributionCalendar: ContributionCalendar
  }
}

export interface ContributionBasic extends Omit<GitHubUser, 'contributionsCollection'> {
  contributionYears: ContributionYear[]
}

export interface ContributionDay {
  level: `${ContributionLevel}`
  weekday?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  count: number
  date: string
}

export interface ContributionCalendar {
  total: number
  year: number
  weeks: {
    days: ContributionDay[]
  }[]
}

export interface GraphData extends ContributionBasic {
  contributionCalendars: ContributionCalendar[]
  statistics?: ValuableStatistics
}

export type DataMode = 'public' | 'authorized'

export type FallbackReason
  = | 'not_logged_in'
    | 'username_mismatch'
    | 'token_missing'
    | 'token_invalid'

export interface ResponseMeta {
  /** 数据获取模式 */
  mode: DataMode
  /** 登录用户信息 */
  viewer?: {
    login: string
  }
  /** 回退到公开模式的原因 */
  reason?: FallbackReason
}

export interface ResponseData {
  errorType?: ErrorType
  message?: string
  data?: GraphData
  meta?: ResponseMeta
}

export interface GraphSettings {
  yearRange?: [start_year: string | undefined, end_year: string | undefined]
  daysLabel?: boolean
  showSafariHeader?: boolean
  showAttribution?: boolean
  size?: GraphSize
  blockShape?: BlockShape
  theme?: Themes
}

export interface GitHubApiJson<Data> {
  data?: Data
  message?: string
  errors?: { type: string, message: string }[]
}

const RepoInfoSchema = object({
  name: string(),
  createdAt: string(),
  url: string(),
  description: optional(string()),
  stargazerCount: number(),
  forkCount: number(),
  issues: object({
    totalCount: number(),
  }),
  defaultBranchRef: optional(nullable(object({
    target: optional(nullable(object({
      history: optional(nullable(object({
        totalCount: number(),
      }))),
    }))),
  }))),
  languages: optional(nullable(object({
    totalSize: number(),
    edges: array(object({
      size: number(),
      node: object({
        name: string(),
      }),
    })),
  }))),
})

const IssueInfoSchema = object({
  title: string(),
  createdAt: string(),
  url: string(),
  repository: object({
    nameWithOwner: string(),
    url: string(),
  }),
})

export const ReposCreatedInYearSchema = object({
  count: number(),
  repos: array(RepoInfoSchema),
})

export const IssuesInYearSchema = object({
  count: number(),
  issues: array(IssueInfoSchema),
})

export const RepoInteractionSchema = object({
  /** 仓库名（含 owner，如 "owner/repo"） */
  nameWithOwner: string(),
  /** 仓库 URL */
  url: string(),
  /** 仓库描述（可选） */
  description: optional(nullable(string())),
  /** Star 数（可选，用于 tie-break 排序） */
  stargazerCount: optional(number()),
  /** Fork 数（可选） */
  forkCount: optional(number()),
  /** 交互计数 */
  interaction: object({
    commits: number(),
    pullRequests: number(),
    reviews: number(),
    issues: number(),
  }),
  /** 综合影响力评分（基于 star、fork 和交互活动的 log 压缩加权） */
  score: number(),
})

/**
 * 用户在某年度有交互活动的自有仓库列表
 *
 * 说明：仅包含用户自己创建的仓库中，在指定年份有过交互活动的仓库
 */
export const RepoInteractionsInYearSchema = object({
  count: number(),
  repos: array(RepoInteractionSchema),
})

export type RepoInfo = InferInput<typeof RepoInfoSchema>

export type IssueInfo = InferInput<typeof IssueInfoSchema>

export interface GitHubRepo {
  repositories: {
    nodes: RepoInfo[]
    pageInfo: {
      hasNextPage: boolean
      endCursor: string
    }
  }
}

export interface GitHubIssue {
  nodes: IssueInfo[]
  pageInfo: {
    hasNextPage: boolean
    endCursor: string
  }
}

export type RepoCreatedInYear = InferInput<typeof ReposCreatedInYearSchema>

export type IssuesInYear = InferInput<typeof IssuesInYearSchema>

export type RepoInteraction = InferInput<typeof RepoInteractionSchema>

export type RepoInteractionsInYear = InferInput<typeof RepoInteractionsInYearSchema>

export interface ValuableStatistics {
  weekendContributions: number
  totalContributions: number
  longestStreak: number
  longestStreakStartDate?: string
  longestStreakEndDate?: string
  longestGap: number
  longestGapStartDate?: string
  longestGapEndDate?: string
  maxContributionsInADay: number
  maxContributionsDate?: string
  averageContributionsPerDay: number
  maxContributionsMonth?: string
  maxMonthlyContributions: number
}

export interface ThemePreset {
  name: Themes
  mode?: ColorScheme
  colorForeground: string
  colorBackground: string
  colorSecondary: string
  colorPrimary: string
  colorBorder: string
  colorBackgroundContainer: string
  levelColors: [level_0: string, level_1: string, level_2: string, level_3: string, level_4: string]
}

/**
 * 单仓库深度分析 - 核心指标
 */
export interface RepoBasicMetrics {
  /** 仓库完整名称（owner/name） */
  nameWithOwner: string
  /** 仓库 URL */
  url: string
  /** 描述 */
  description: string | null
  /** 星标数 */
  stargazerCount: number
  /** Fork 数 */
  forkCount: number
  /** 默认分支提交总数 */
  commitCount: number
  /** Issue 总数 */
  issueCount: number
  /** 最近推送时间 */
  pushedAt: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 默认分支名 */
  defaultBranchName: string | null
  /** 仓库状态 */
  status: {
    isArchived: boolean
    isPrivate: boolean
    isFork: boolean
    isDisabled: boolean
  }
}

/**
 * 健康度指标
 */
export interface RepoHealthMetrics {
  /** Issue 统计 */
  issues: {
    total: number
    open: number
    closed: number
    openRatio: number
  }
  /** PR 统计 */
  pullRequests: {
    total: number
    open: number
    merged: number
    closed: number
    mergedRatio: number
  }
}

/**
 * 技术栈指标
 */
export interface RepoTechStackMetrics {
  /** 语言分布 */
  languages: {
    totalSize: number
    items: {
      name: string
      size: number
      percentage: number
    }[]
  }
  /** 许可证 */
  license: {
    spdxId: string | null
    name: string | null
    url: string | null
  } | null
  /** Release 信息 */
  releases: {
    totalCount: number
    latest: {
      tagName: string
      publishedAt: string
      url: string
    } | null
  }
  /** Topics */
  topics: string[]
  /** 仓库体量（KB） */
  diskUsage: number | null
}

/**
 * 仓库拥有者信息
 */
export interface RepoOwnerInfo {
  /** 用户名 */
  login: string
  /** 用户全名 */
  name: string | null
  /** 头像 URL */
  avatarUrl: string
  /** 用户简介 */
  bio: string | null
  /** GitHub 主页 URL */
  url: string
  /** 关注者数量 */
  followers: number
  /** 正在关注数量 */
  following: number
  /** 公开仓库数量 */
  repositories: number
  /** 加入 GitHub 时间 */
  createdAt: string
  /** 用户类型 */
  type: 'User' | 'Organization'
}

/**
 * 完整的仓库深度分析数据
 */
export interface RepoAnalysis {
  basic: RepoBasicMetrics
  health: RepoHealthMetrics | null
  techStack: RepoTechStackMetrics | null
  owner: RepoOwnerInfo | null
}

/**
 * API 响应包装
 */
export interface RepoAnalysisResponse {
  data: RepoAnalysis
  meta: {
    mode: DataMode
    fetchedAt: string
    metrics: string[]
  }
}
