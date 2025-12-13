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
