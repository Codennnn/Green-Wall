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
// 标签枚举定义
// ============================================================================

/** 活跃度标签 */
export const ActivityLevel = {
  LOW: '低活跃度',
  MEDIUM: '中等活跃度',
  HIGH: '高活跃度',
  INTENSE: '爆肝但克制',
} as const

/** 提交节奏标签 */
export const CommitStyle = {
  CONSISTENT: '持续打卡型',
  INTERMITTENT: '间歇迭代型',
  SPRINT: '冲刺爆发型',
  STEADY_VARIED: '稳中有变型',
} as const

/** 时间习惯标签 */
export const TimePattern = {
  WEEKDAY_HEAVY: '工作日更勤',
  WEEKEND_HEAVY: '周末更勤',
  BALANCED: '均衡分布',
  SPECIFIC_DAY: '某天特别凶',
} as const

/** 项目模式标签 */
export const RepoPattern = {
  FEW_QUALITY: '少而精',
  MANY_EXPERIMENTS: '多仓库试验田',
  HAS_HIT: '有爆款倾向',
  COLLABORATIVE: '偏协作',
} as const

// ============================================================================
// 标签推导输入类型
// ============================================================================

export interface DeriveTagsInput {
  statistics?: ValuableStatistics
  calendars?: ContributionCalendar[]
  topLanguages?: TopLanguageItem[]
  reposData?: RepoCreatedInYear
  issuesData?: IssuesInYear
}

// ============================================================================
// 标签推导函数
// ============================================================================

/**
 * 推导活跃度标签
 * 基于：总贡献数、日均贡献数
 */
function deriveActivityLevel(statistics?: ValuableStatistics): string {
  if (!statistics) {
    return ActivityLevel.MEDIUM
  }

  const { totalContributions, averageContributionsPerDay } = statistics

  // 基于年度总贡献数和日均贡献判断
  if (totalContributions >= 2000 || averageContributionsPerDay >= 8) {
    return ActivityLevel.INTENSE
  }

  if (totalContributions >= 1000 || averageContributionsPerDay >= 4) {
    return ActivityLevel.HIGH
  }

  if (totalContributions >= 300 || averageContributionsPerDay >= 1) {
    return ActivityLevel.MEDIUM
  }

  return ActivityLevel.LOW
}

/**
 * 推导提交节奏标签
 * 基于：最长连续天数、最长空档、月度峰值占比
 */
function deriveCommitStyle(statistics?: ValuableStatistics): string {
  if (!statistics) {
    return CommitStyle.STEADY_VARIED
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
    return CommitStyle.CONSISTENT
  }

  // 冲刺爆发型：月度峰值占比高（某月贡献超过总贡献 40%）
  if (peakMonthRatio >= 0.4) {
    return CommitStyle.SPRINT
  }

  // 间歇迭代型：长空档
  if (longestGap >= 30) {
    return CommitStyle.INTERMITTENT
  }

  // 默认：稳中有变
  return CommitStyle.STEADY_VARIED
}

/**
 * 推导时间习惯标签
 * 基于：周末贡献占比、周分布数据
 */
function deriveTimePattern(
  statistics?: ValuableStatistics,
  calendars?: ContributionCalendar[],
): string {
  if (!statistics || !calendars) {
    return TimePattern.BALANCED
  }

  const { weekendContributions, totalContributions } = statistics

  // 计算周末贡献占比
  const weekendRatio = totalContributions > 0
    ? weekendContributions / totalContributions
    : 0

  // 周末理论占比约 2/7 ≈ 28.6%
  // 如果周末贡献 > 40%，则周末更勤
  if (weekendRatio >= 0.4) {
    return TimePattern.WEEKEND_HEAVY
  }

  // 如果周末贡献 < 20%，则工作日更勤
  if (weekendRatio <= 0.2) {
    return TimePattern.WEEKDAY_HEAVY
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
    return TimePattern.SPECIFIC_DAY
  }

  return TimePattern.BALANCED
}

/**
 * 推导技术侧重标签
 * 基于：top languages
 */
function deriveTechFocus(topLanguages?: TopLanguageItem[]): string {
  if (!topLanguages || topLanguages.length === 0) {
    return '技术栈未知'
  }

  // 只有一种语言
  if (topLanguages.length === 1) {
    return `${topLanguages[0].language} 专精`
  }

  const top1 = topLanguages[0]
  const top2 = topLanguages[1]

  // 如果第一名占比超过 60%，则主修
  if (top1.ratio >= 0.6) {
    return `${top1.language} 主修，${top2.language} 选修`
  }

  // 如果前两名合计超过 80%，则双修
  if (top1.ratio + top2.ratio >= 0.8) {
    return `${top1.language} + ${top2.language} 双修`
  }

  // 如果语言种类 >= 4 且分布较均匀
  if (topLanguages.length >= 4 && top1.ratio < 0.4) {
    return '多语言游牧'
  }

  // 默认描述前两名
  return `${top1.language} 为主，${top2.language} 辅助`
}

/**
 * 推导项目模式标签
 * 基于：新建仓库数、星标分布、Issue 参与度
 */
function deriveRepoPattern(
  reposData?: RepoCreatedInYear,
  issuesData?: IssuesInYear,
): string {
  const reposCount = reposData?.count ?? 0
  const issuesCount = issuesData?.count ?? 0
  const repos = reposData?.repos ?? []

  // 偏协作：Issue 参与数较高（相对于仓库数）
  if (issuesCount >= 20 || (reposCount > 0 && issuesCount / reposCount >= 2)) {
    return RepoPattern.COLLABORATIVE
  }

  // 有爆款倾向：存在星标数较高的仓库
  const maxStars = Math.max(...repos.map((r) => r.stargazerCount), 0)

  if (maxStars >= 50) {
    return RepoPattern.HAS_HIT
  }

  // 多仓库试验田：新建仓库数多
  if (reposCount >= 10) {
    return RepoPattern.MANY_EXPERIMENTS
  }

  // 少而精：仓库数少
  if (reposCount <= 3 && reposCount > 0) {
    return RepoPattern.FEW_QUALITY
  }

  // 默认
  return RepoPattern.FEW_QUALITY
}

// ============================================================================
// 主函数
// ============================================================================

/**
 * 从 GitHub 数据推导年度报告标签
 * 标签由前端预计算，AI 仅解读不重新分类
 */
export function deriveYearlyTags(input: DeriveTagsInput): YearlyReportTags {
  const {
    statistics,
    calendars,
    topLanguages,
    reposData,
    issuesData,
  } = input

  return {
    activity_level: deriveActivityLevel(statistics),
    commit_style: deriveCommitStyle(statistics),
    time_pattern: deriveTimePattern(statistics, calendars),
    tech_focus: deriveTechFocus(topLanguages),
    repo_pattern: deriveRepoPattern(reposData, issuesData),
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
