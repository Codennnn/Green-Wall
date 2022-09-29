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

export interface GitHubContributionCalendar {
  contributionsCollection: {
    contributionCalendar: ContributionCalendar
  }
}

export interface ContributionBasic {
  name?: string
  login: GitHubUsername
  avatarUrl: string
  contributionYears: ContributionYear[]
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

export interface GraphData extends ContributionBasic {
  contributionCalendars: ContributionCalendar[]
}

export interface ErrorData {
  message?: string
}

export const enum GraphSize {
  Small = 's',
  Medium = 'm',
  Large = 'l',
}

export const enum DisplayName {
  Username = '0',
  ProfileName = '1',
}

export interface GraphSettings {
  size?: GraphSize
  displayName?: DisplayName
  sinceYear?: string
  showAttribution?: boolean
  theme?: Themes
}
