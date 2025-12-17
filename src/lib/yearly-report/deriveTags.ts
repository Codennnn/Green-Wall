import type { TopLanguageItem } from '~/lib/language-stats'
import type {
  ContributionCalendar,
  IssuesInYear,
  RepoCreatedInYear,
  ValuableStatistics,
} from '~/types'
import type {
  YearlyReportHighlights,
  YearlyReportTags,
} from '~/types/ai-report'

// ============================================================================
// 标签枚举定义 - 中文
// ============================================================================

/** 活跃度标签 - 中文 */
export const ActivityLevelZh = {
  LOW: '低活跃度',
  MEDIUM: '中等活跃度',
  HIGH: '高活跃度',
  INTENSE: '爆肝但克制',
} as const

/** 提交节奏标签 - 中文 */
export const CommitStyleZh = {
  CONSISTENT: '持续打卡型',
  INTERMITTENT: '间歇迭代型',
  SPRINT: '冲刺爆发型',
  STEADY_VARIED: '稳中有变型',
} as const

/** 时间习惯标签 - 中文 */
export const TimePatternZh = {
  WEEKDAY_HEAVY: '工作日更勤',
  WEEKEND_HEAVY: '周末更勤',
  BALANCED: '均衡分布',
  SPECIFIC_DAY: '某天特别凶',
} as const

/** 项目模式标签 - 中文 */
export const RepoPatternZh = {
  FEW_QUALITY: '少而精',
  MANY_EXPERIMENTS: '多仓库试验田',
  HAS_HIT: '有爆款倾向',
  COLLABORATIVE: '偏协作',
} as const

// ============================================================================
// 标签枚举定义 - 英文
// ============================================================================

/** 活跃度标签 - 英文 */
export const ActivityLevelEn = {
  LOW: 'Low Activity',
  MEDIUM: 'Moderate Activity',
  HIGH: 'High Activity',
  INTENSE: 'Intense but Restrained',
} as const

/** 提交节奏标签 - 英文 */
export const CommitStyleEn = {
  CONSISTENT: 'Consistent Daily Committer',
  INTERMITTENT: 'Intermittent Iterator',
  SPRINT: 'Sprint Burster',
  STEADY_VARIED: 'Steady with Variation',
} as const

/** 时间习惯标签 - 英文 */
export const TimePatternEn = {
  WEEKDAY_HEAVY: 'Weekday Heavy',
  WEEKEND_HEAVY: 'Weekend Heavy',
  BALANCED: 'Balanced Distribution',
  SPECIFIC_DAY: 'Specific Day Peak',
} as const

/** 项目模式标签 - 英文 */
export const RepoPatternEn = {
  FEW_QUALITY: 'Few but Quality',
  MANY_EXPERIMENTS: 'Experimental Multi-Repo',
  HAS_HIT: 'Has Popular Projects',
  COLLABORATIVE: 'Collaboration Oriented',
} as const

// ============================================================================
// 辅助函数：根据 locale 获取标签常量
// ============================================================================

function getActivityLevel(locale?: string) {
  return locale === 'zh' ? ActivityLevelZh : ActivityLevelEn
}

function getCommitStyle(locale?: string) {
  return locale === 'zh' ? CommitStyleZh : CommitStyleEn
}

function getTimePattern(locale?: string) {
  return locale === 'zh' ? TimePatternZh : TimePatternEn
}

function getRepoPattern(locale?: string) {
  return locale === 'zh' ? RepoPatternZh : RepoPatternEn
}

/** 根据 locale 获取技术栈未知文案 */
function getTechFocusUnknown(locale?: string) {
  return locale === 'zh' ? '技术栈未知' : 'Tech Stack Unknown'
}

/** 根据 locale 获取技术栈专精文案 */
function getTechFocusSpecialist(language: string, locale?: string) {
  return locale === 'zh' ? `${language} 专精` : `${language} Specialist`
}

/** 根据 locale 获取技术栈主修/选修文案 */
function getTechFocusMajorMinor(major: string, minor: string, locale?: string) {
  return locale === 'zh'
    ? `${major} 主修，${minor} 选修`
    : `${major} Major, ${minor} Minor`
}

/** 根据 locale 获取技术栈双修文案 */
function getTechFocusDual(lang1: string, lang2: string, locale?: string) {
  return locale === 'zh'
    ? `${lang1} + ${lang2} 双修`
    : `${lang1} + ${lang2} Dual Focus`
}

/** 根据 locale 获取多语言游牧文案 */
function getTechFocusPolyglot(locale?: string) {
  return locale === 'zh' ? '多语言游牧' : 'Polyglot Developer'
}

/** 根据 locale 获取主/辅助文案 */
function getTechFocusPrimarySecondary(primary: string, secondary: string, locale?: string) {
  return locale === 'zh'
    ? `${primary} 为主，${secondary} 辅助`
    : `${primary} Primary, ${secondary} Secondary`
}

// 为了向后兼容，保留原有导出名称（指向中文版本）
export const ActivityLevel = ActivityLevelZh
export const CommitStyle = CommitStyleZh
export const TimePattern = TimePatternZh
export const RepoPattern = RepoPatternZh

// ============================================================================
// 标签推导输入类型
// ============================================================================

export interface DeriveTagsInput {
  statistics?: ValuableStatistics
  calendars?: ContributionCalendar[]
  topLanguages?: TopLanguageItem[]
  reposData?: RepoCreatedInYear
  issuesData?: IssuesInYear
  /** 语言环境，决定标签输出的语言 */
  locale?: string
}

// ============================================================================
// 标签推导函数
// ============================================================================

/**
 * 推导活跃度标签
 * 基于：总贡献数、日均贡献数
 */
function deriveActivityLevel(statistics?: ValuableStatistics, locale?: string): string {
  const level = getActivityLevel(locale)

  if (!statistics) {
    return level.MEDIUM
  }

  const { totalContributions, averageContributionsPerDay } = statistics

  // 基于年度总贡献数和日均贡献判断
  if (totalContributions >= 2000 || averageContributionsPerDay >= 8) {
    return level.INTENSE
  }

  if (totalContributions >= 1000 || averageContributionsPerDay >= 4) {
    return level.HIGH
  }

  if (totalContributions >= 300 || averageContributionsPerDay >= 1) {
    return level.MEDIUM
  }

  return level.LOW
}

/**
 * 推导提交节奏标签
 * 基于：最长连续天数、最长空档、月度峰值占比
 */
function deriveCommitStyle(statistics?: ValuableStatistics, locale?: string): string {
  const style = getCommitStyle(locale)

  if (!statistics) {
    return style.STEADY_VARIED
  }

  const {
    longestStreak,
    longestGap,
    maxMonthlyContributions,
    totalContributions,
  } = statistics

  // 计算月度峰值占总贡献的比例
  const peakMonthRatio = totalContributions > 0
    ? maxMonthlyContributions / totalContributions
    : 0

  // 持续打卡型：长连续、短空档
  if (longestStreak >= 30 && longestGap <= 7) {
    return style.CONSISTENT
  }

  // 冲刺爆发型：月度峰值占比高（某月贡献超过总贡献 40%）
  if (peakMonthRatio >= 0.4) {
    return style.SPRINT
  }

  // 间歇迭代型：长空档
  if (longestGap >= 30) {
    return style.INTERMITTENT
  }

  // 默认：稳中有变
  return style.STEADY_VARIED
}

/**
 * 推导时间习惯标签
 * 基于：周末贡献占比、周分布数据
 */
function deriveTimePattern(
  statistics?: ValuableStatistics,
  calendars?: ContributionCalendar[],
  locale?: string,
): string {
  const pattern = getTimePattern(locale)

  if (!statistics || !calendars) {
    return pattern.BALANCED
  }

  const { weekendContributions, totalContributions } = statistics

  // 计算周末贡献占比
  const weekendRatio = totalContributions > 0
    ? weekendContributions / totalContributions
    : 0

  // 周末理论占比约 2/7 ≈ 28.6%
  // 如果周末贡献 > 40%，则周末更勤
  if (weekendRatio >= 0.4) {
    return pattern.WEEKEND_HEAVY
  }

  // 如果周末贡献 < 20%，则工作日更勤
  if (weekendRatio <= 0.2) {
    return pattern.WEEKDAY_HEAVY
  }

  // 计算周分布，找出是否有某天特别凶
  const weeklyCount: number[] = Array.from({ length: 7 }, () => 0)

  for (const calendar of calendars) {
    for (const week of calendar.weeks) {
      for (const day of week.days) {
        if (day.count > 0 && day.weekday !== undefined) {
          weeklyCount[day.weekday] += day.count
        }
      }
    }
  }

  const maxDayCount = Math.max(...weeklyCount)
  const avgDayCount = weeklyCount.reduce((a, b) => a + b, 0) / 7

  // 如果某天贡献超过平均值的 2 倍，则某天特别凶
  if (maxDayCount > avgDayCount * 2 && avgDayCount > 0) {
    return pattern.SPECIFIC_DAY
  }

  return pattern.BALANCED
}

/**
 * 推导技术侧重标签
 * 基于：top languages
 */
function deriveTechFocus(topLanguages?: TopLanguageItem[], locale?: string): string {
  if (!topLanguages || topLanguages.length === 0) {
    return getTechFocusUnknown(locale)
  }

  // 只有一种语言
  if (topLanguages.length === 1) {
    return getTechFocusSpecialist(topLanguages[0].language, locale)
  }

  const top1 = topLanguages[0]
  const top2 = topLanguages[1]

  // 如果第一名占比超过 60%，则主修
  if (top1.ratio >= 0.6) {
    return getTechFocusMajorMinor(top1.language, top2.language, locale)
  }

  // 如果前两名合计超过 80%，则双修
  if (top1.ratio + top2.ratio >= 0.8) {
    return getTechFocusDual(top1.language, top2.language, locale)
  }

  // 如果语言种类 >= 4 且分布较均匀
  if (topLanguages.length >= 4 && top1.ratio < 0.4) {
    return getTechFocusPolyglot(locale)
  }

  // 默认描述前两名
  return getTechFocusPrimarySecondary(top1.language, top2.language, locale)
}

/**
 * 推导项目模式标签
 * 基于：新建仓库数、星标分布、Issue 参与度
 */
function deriveRepoPattern(
  reposData?: RepoCreatedInYear,
  issuesData?: IssuesInYear,
  locale?: string,
): string {
  const pattern = getRepoPattern(locale)
  const reposCount = reposData?.count ?? 0
  const issuesCount = issuesData?.count ?? 0
  const repos = reposData?.repos ?? []

  // 偏协作：Issue 参与数较高（相对于仓库数）
  if (issuesCount >= 20 || (reposCount > 0 && issuesCount / reposCount >= 2)) {
    return pattern.COLLABORATIVE
  }

  // 有爆款倾向：存在星标数较高的仓库
  const maxStars = Math.max(...repos.map((r) => r.stargazerCount), 0)

  if (maxStars >= 50) {
    return pattern.HAS_HIT
  }

  // 多仓库试验田：新建仓库数多
  if (reposCount >= 10) {
    return pattern.MANY_EXPERIMENTS
  }

  // 少而精：仓库数少
  if (reposCount <= 3 && reposCount > 0) {
    return pattern.FEW_QUALITY
  }

  // 默认
  return pattern.FEW_QUALITY
}

// ============================================================================
// 主函数
// ============================================================================

/**
 * 从 GitHub 数据推导年度报告标签
 * 标签由前端预计算，AI 仅解读不重新分类
 * @param input - 推导输入数据，包含 locale 字段决定输出语言
 */
export function deriveYearlyTags(input: DeriveTagsInput): YearlyReportTags {
  const {
    statistics,
    calendars,
    topLanguages,
    reposData,
    issuesData,
    locale,
  } = input

  return {
    activity_level: deriveActivityLevel(statistics, locale),
    commit_style: deriveCommitStyle(statistics, locale),
    time_pattern: deriveTimePattern(statistics, calendars, locale),
    tech_focus: deriveTechFocus(topLanguages, locale),
    repo_pattern: deriveRepoPattern(reposData, issuesData, locale),
  }
}

/**
 * 从 GitHub 数据提取高光点
 * 供 AI 作为素材参考，但不作为标签
 */
export function extractHighlights(input: DeriveTagsInput): YearlyReportHighlights {
  const { statistics, reposData, issuesData } = input

  return {
    maxDayCount: statistics?.maxContributionsInADay,
    maxDayDate: statistics?.maxContributionsDate,
    maxMonth: statistics?.maxContributionsMonth,
    longestStreak: statistics?.longestStreak,
    totalContributions: statistics?.totalContributions,
    reposCreated: reposData?.count,
    issuesInvolved: issuesData?.count,
  }
}
