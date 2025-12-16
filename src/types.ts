import { array, type InferInput, nullable, number, object, optional, string } from 'valibot'

import type { BlockShape, ColorScheme, ContributionLevel, ErrorType, GraphSize } from '~/enums'

export type Themes = 'Classic' | 'Midnight' | 'Sunset' | 'Sunsetx' | 'Violet'

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

export interface ResponseData {
  errorType?: ErrorType
  message?: string
  data?: GraphData
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
