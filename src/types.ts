export type Themes =
  | 'GitHub'
  | 'GitHubDark'
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
  levelColors: [
    string, // level 0
    string, // level 1
    string, // level 2
    string, // level 3
    string //  level 4
  ]
  background: string
  mode?: 'light' | 'dark'
}

export interface RemoteContribution {
  week: number
  days: { count: number }[]
}

export type GitHubUsername = string
export type ContributionYear = number

export interface GitHubUser {
  name?: string
  login: GitHubUsername
  avatarUrl: string
  contributionsCollection: {
    years: ContributionYear[]
  }
}

/** Check out: {@link https://docs.github.com/en/graphql/reference/enums#contributionlevel} */
export const enum ContributionLevel {
  Null = 'Null',
  NONE = 'NONE',
  FIRST_QUARTILE = 'FIRST_QUARTILE',
  SECOND_QUARTILE = 'SECOND_QUARTILE',
  THIRD_QUARTILE = 'THIRD_QUARTILE',
  FOURTH_QUARTILE = 'FOURTH_QUARTILE',
}

export interface ContributionDay {
  level: `${ContributionLevel}`
  weekday?: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

export interface ContributionCalendar {
  total: number
  year: number
  weeks: {
    days: ContributionDay[]
  }[]
}

export interface GitHubContributionsCollection {
  contributionsCollection: {
    contributionCalendar: ContributionCalendar
  }
}

export interface GraphData extends GitHubUser {
  contributionCalendars: ContributionCalendar[]
}

export interface ErrorData {
  message?: string
}

export type GraphSize = 'small' | 'medium' | 'large'

export interface GraphSettings {
  size?: GraphSize
  showAttribution?: boolean
  theme?: Themes
}
