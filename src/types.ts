import type { ContributionLevel, DisplayName, ErrorType, GraphSize } from '~/enums'

export type Themes =
  | 'GitHub'
  | 'GitHubDark'
  | 'Winter'
  | 'GitLab'
  | 'GitLabDark'
  | 'Halloween'
  | 'Dracula'
  | 'Slate'
  | 'Rose'
  | 'Indigo'
  | 'Emerald'
  | 'Sky'
  | 'Amber'

export interface Theme {
  name: Themes
  textColor: string
  levelColors: [level_0: string, level_1: string, level_2: string, level_3: string, level_4: string]
  background: string
  mode?: 'light' | 'dark'
}

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
}

export interface ResponseData {
  errorType?: ErrorType
  message?: string
  data?: GraphData
}

export interface GraphSettings {
  displayName?: DisplayName
  yearRange?: [start_year: string | undefined, end_year: string | undefined]
  showAttribution?: boolean
  size?: GraphSize
  theme?: Themes
}

export interface GitHubApiJson<Data> {
  data?: Data
  message?: string
  errors?: { type: string; message: string }[]
}

export interface GitHubRepo {
  repositories: {
    nodes: { name: string; createdAt: string }[]
    pageInfo: {
      hasNextPage: boolean
      endCursor: string
    }
  }
}

export interface RepoCreatedInYear {
  count: number
  repos: GitHubRepo['repositories']['nodes']
}
