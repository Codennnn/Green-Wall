export type MonthAbbr
  = | 'Jan'
    | 'Feb'
    | 'Mar'
    | 'Apr'
    | 'May'
    | 'Jun'
    | 'Jul'
    | 'Aug'
    | 'Sep'
    | 'Oct'
    | 'Nov'
    | 'Dec'

export type WeekdayAbbr = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'

type Translator = (key: string) => string

const MONTH_KEY_MAP: Record<MonthAbbr, string> = {
  Jan: 'jan',
  Feb: 'feb',
  Mar: 'mar',
  Apr: 'apr',
  May: 'may',
  Jun: 'jun',
  Jul: 'jul',
  Aug: 'aug',
  Sep: 'sep',
  Oct: 'oct',
  Nov: 'nov',
  Dec: 'dec',
}

const WEEKDAY_SHORT_KEY_MAP: Record<WeekdayAbbr, string> = {
  Sun: 'sun',
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
  Sat: 'sat',
}

export function createMonthShortNames(tMonths: Translator): Record<MonthAbbr, string> {
  return {
    Jan: tMonths(MONTH_KEY_MAP.Jan),
    Feb: tMonths(MONTH_KEY_MAP.Feb),
    Mar: tMonths(MONTH_KEY_MAP.Mar),
    Apr: tMonths(MONTH_KEY_MAP.Apr),
    May: tMonths(MONTH_KEY_MAP.May),
    Jun: tMonths(MONTH_KEY_MAP.Jun),
    Jul: tMonths(MONTH_KEY_MAP.Jul),
    Aug: tMonths(MONTH_KEY_MAP.Aug),
    Sep: tMonths(MONTH_KEY_MAP.Sep),
    Oct: tMonths(MONTH_KEY_MAP.Oct),
    Nov: tMonths(MONTH_KEY_MAP.Nov),
    Dec: tMonths(MONTH_KEY_MAP.Dec),
  }
}

export function createWeekdayShortNames(tWeekdays: Translator): Record<WeekdayAbbr, string> {
  return {
    Sun: tWeekdays(WEEKDAY_SHORT_KEY_MAP.Sun),
    Mon: tWeekdays(WEEKDAY_SHORT_KEY_MAP.Mon),
    Tue: tWeekdays(WEEKDAY_SHORT_KEY_MAP.Tue),
    Wed: tWeekdays(WEEKDAY_SHORT_KEY_MAP.Wed),
    Thu: tWeekdays(WEEKDAY_SHORT_KEY_MAP.Thu),
    Fri: tWeekdays(WEEKDAY_SHORT_KEY_MAP.Fri),
    Sat: tWeekdays(WEEKDAY_SHORT_KEY_MAP.Sat),
  }
}
