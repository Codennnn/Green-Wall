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

/**
 * 年度标签翻译器接口
 * 用于依赖注入模式，将翻译逻辑从业务逻辑中解耦
 */
export interface TagTranslator {
  /** 活跃度标签翻译 */
  activityLevel: (key: 'low' | 'medium' | 'high' | 'intense') => string
  /** 提交节奏标签翻译 */
  commitStyle: (key: 'consistent' | 'intermittent' | 'sprint' | 'steadyVaried') => string
  /** 时间习惯标签翻译 */
  timePattern: (key: 'weekdayHeavy' | 'weekendHeavy' | 'balanced' | 'specificDay') => string
  /** 项目模式标签翻译 */
  repoPattern: (key: 'fewQuality' | 'manyExperiments' | 'hasHit' | 'collaborative') => string
  /** 技术侧重标签翻译 */
  techFocus: {
    unknown: () => string
    specialist: (language: string) => string
    majorMinor: (major: string, minor: string) => string
    dual: (lang1: string, lang2: string) => string
    polyglot: () => string
    primarySecondary: (primary: string, secondary: string) => string
  }
}

export interface DeriveTagsInput {
  statistics?: ValuableStatistics
  calendars?: ContributionCalendar[]
  topLanguages?: TopLanguageItem[]
  reposData?: RepoCreatedInYear
  issuesData?: IssuesInYear
  /** 翻译器实例，用于获取本地化标签文本 */
  translator: TagTranslator
}

/**
 * 高光数据提取输入类型
 */
export interface ExtractHighlightsInput {
  statistics?: ValuableStatistics
  reposData?: RepoCreatedInYear
  issuesData?: IssuesInYear
}

/**
 * 推导活跃度标签
 * 基于：总贡献数、日均贡献数
 */
function deriveActivityLevel(
  statistics: ValuableStatistics | undefined,
  translator: TagTranslator,
): string {
  if (!statistics) {
    return translator.activityLevel('medium')
  }

  const { totalContributions, averageContributionsPerDay } = statistics

  // 基于年度总贡献数和日均贡献判断
  if (totalContributions >= 2000 || averageContributionsPerDay >= 8) {
    return translator.activityLevel('intense')
  }

  if (totalContributions >= 1000 || averageContributionsPerDay >= 4) {
    return translator.activityLevel('high')
  }

  if (totalContributions >= 300 || averageContributionsPerDay >= 1) {
    return translator.activityLevel('medium')
  }

  return translator.activityLevel('low')
}

/**
 * 推导提交节奏标签
 * 基于：最长连续天数、最长空档、月度峰值占比
 */
function deriveCommitStyle(
  statistics: ValuableStatistics | undefined,
  translator: TagTranslator,
): string {
  if (!statistics) {
    return translator.commitStyle('steadyVaried')
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
    return translator.commitStyle('consistent')
  }

  // 冲刺爆发型：月度峰值占比高（某月贡献超过总贡献 40%）
  if (peakMonthRatio >= 0.4) {
    return translator.commitStyle('sprint')
  }

  // 间歇迭代型：长空档
  if (longestGap >= 30) {
    return translator.commitStyle('intermittent')
  }

  // 默认：稳中有变
  return translator.commitStyle('steadyVaried')
}

/**
 * 推导时间习惯标签
 * 基于：周末贡献占比、周分布数据
 */
function deriveTimePattern(
  statistics: ValuableStatistics | undefined,
  calendars: ContributionCalendar[] | undefined,
  translator: TagTranslator,
): string {
  if (!statistics || !calendars) {
    return translator.timePattern('balanced')
  }

  const { weekendContributions, totalContributions } = statistics

  // 计算周末贡献占比
  const weekendRatio = totalContributions > 0
    ? weekendContributions / totalContributions
    : 0

  // 周末理论占比约 2/7 ≈ 28.6%
  // 如果周末贡献 > 40%，则周末更勤
  if (weekendRatio >= 0.4) {
    return translator.timePattern('weekendHeavy')
  }

  // 如果周末贡献 < 20%，则工作日更勤
  if (weekendRatio <= 0.2) {
    return translator.timePattern('weekdayHeavy')
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
    return translator.timePattern('specificDay')
  }

  return translator.timePattern('balanced')
}

/**
 * 推导技术侧重标签
 * 基于：top languages
 */
function deriveTechFocus(
  topLanguages: TopLanguageItem[] | undefined,
  translator: TagTranslator,
): string {
  if (!topLanguages || topLanguages.length === 0) {
    return translator.techFocus.unknown()
  }

  // 只有一种语言
  if (topLanguages.length === 1) {
    return translator.techFocus.specialist(topLanguages[0].language)
  }

  const top1 = topLanguages[0]
  const top2 = topLanguages[1]

  // 如果第一名占比超过 60%，则主修
  if (top1.ratio >= 0.6) {
    return translator.techFocus.majorMinor(top1.language, top2.language)
  }

  // 如果前两名合计超过 80%，则双修
  if (top1.ratio + top2.ratio >= 0.8) {
    return translator.techFocus.dual(top1.language, top2.language)
  }

  // 如果语言种类 >= 4 且分布较均匀
  if (topLanguages.length >= 4 && top1.ratio < 0.4) {
    return translator.techFocus.polyglot()
  }

  // 默认描述前两名
  return translator.techFocus.primarySecondary(top1.language, top2.language)
}

/**
 * 推导项目模式标签
 * 基于：新建仓库数、星标分布、Issue 参与度
 */
function deriveRepoPattern(
  reposData: RepoCreatedInYear | undefined,
  issuesData: IssuesInYear | undefined,
  translator: TagTranslator,
): string {
  const reposCount = reposData?.count ?? 0
  const issuesCount = issuesData?.count ?? 0
  const repos = reposData?.repos ?? []

  // 偏协作：Issue 参与数较高（相对于仓库数）
  if (issuesCount >= 20 || (reposCount > 0 && issuesCount / reposCount >= 2)) {
    return translator.repoPattern('collaborative')
  }

  // 有爆款倾向：存在星标数较高的仓库
  const maxStars = Math.max(...repos.map((r) => r.stargazerCount), 0)

  if (maxStars >= 50) {
    return translator.repoPattern('hasHit')
  }

  // 多仓库试验田：新建仓库数多
  if (reposCount >= 10) {
    return translator.repoPattern('manyExperiments')
  }

  // 少而精：仓库数少
  if (reposCount <= 3 && reposCount > 0) {
    return translator.repoPattern('fewQuality')
  }

  // 默认
  return translator.repoPattern('fewQuality')
}

// ============================================================================
// 主函数
// ============================================================================

/**
 * 从 GitHub 数据推导年度报告标签
 * 标签由前端预计算，AI 仅解读不重新分类
 * @param input - 推导输入数据，包含 translator 字段用于本地化
 */
export function deriveYearlyTags(input: DeriveTagsInput): YearlyReportTags {
  const {
    statistics,
    calendars,
    topLanguages,
    reposData,
    issuesData,
    translator,
  } = input

  return {
    activity_level: deriveActivityLevel(statistics, translator),
    commit_style: deriveCommitStyle(statistics, translator),
    time_pattern: deriveTimePattern(statistics, calendars, translator),
    tech_focus: deriveTechFocus(topLanguages, translator),
    repo_pattern: deriveRepoPattern(reposData, issuesData, translator),
  }
}

/**
 * 从 GitHub 数据提取高光点
 * 供 AI 作为素材参考，但不作为标签
 */
export function extractHighlights(input: ExtractHighlightsInput): YearlyReportHighlights {
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
