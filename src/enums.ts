/** Check out: {@link https://docs.github.com/en/graphql/reference/enums#contributionlevel} */
export const enum ContributionLevel {
  Null = 'Null',
  NONE = 'NONE',
  FIRST_QUARTILE = 'FIRST_QUARTILE',
  SECOND_QUARTILE = 'SECOND_QUARTILE',
  THIRD_QUARTILE = 'THIRD_QUARTILE',
  FOURTH_QUARTILE = 'FOURTH_QUARTILE',
}

export const enum ErrorType {
  BadCredentials,
  BadRequest,
}

export const enum GraphSize {
  Small = 's',
  Medium = 'm',
  Large = 'l',
}

export const enum BlockShape {
  Square = 'square',
  Round = 'round',
}

export const enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

export const enum ColorScheme {
  Light = 'light',
  Dark = 'dark',
}

export const enum ReposCardMode {
  Created = 'created',
  Interactions = 'interactions',
}

// const enum 在编译期被内联，没有可供 Object.values 反射的运行期对象，所以只能逐值比较。
export function isContributionLevel(value: unknown): value is ContributionLevel {
  return value === ContributionLevel.Null
    || value === ContributionLevel.NONE
    || value === ContributionLevel.FIRST_QUARTILE
    || value === ContributionLevel.SECOND_QUARTILE
    || value === ContributionLevel.THIRD_QUARTILE
    || value === ContributionLevel.FOURTH_QUARTILE
}

export function isGraphSize(value: unknown): value is GraphSize {
  return value === GraphSize.Small
    || value === GraphSize.Medium
    || value === GraphSize.Large
}

export function isBlockShape(value: unknown): value is BlockShape {
  return value === BlockShape.Square || value === BlockShape.Round
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === ThemeMode.Light
    || value === ThemeMode.Dark
    || value === ThemeMode.System
}
