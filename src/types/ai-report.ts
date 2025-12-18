import type { AiRuntimeConfig } from './ai-config'

/**
 * 年度报告用户标签 - 由前端预计算，AI 仅解读不重新分类
 */
export interface YearlyReportTags {
  /** 活跃度：低/中/高/爆肝但克制 */
  activity_level: string
  /** 提交节奏：持续打卡型/间歇迭代型/冲刺爆发型/稳中有变型 */
  commit_style: string
  /** 时间习惯：工作日更勤/周末更勤/均衡分布/某天特别凶 */
  time_pattern: string
  /** 技术侧重：基于 top languages 生成 */
  tech_focus: string
  /** 项目模式：少而精/多仓库试验田/有爆款倾向/偏协作 */
  repo_pattern: string
}

/**
 * 高光数据点（可选，供 AI 作为素材但不作为标签）
 */
export interface YearlyReportHighlights {
  /** 单日最高贡献数 */
  maxDayCount?: number
  /** 最高贡献日期 */
  maxDayDate?: string
  /** 最活跃月份 */
  maxMonth?: string
  /** 最长连续贡献天数 */
  longestStreak?: number
  /** 年度总贡献数 */
  totalContributions?: number
  /** 新建仓库数 */
  reposCreated?: number
  /** 参与 Issues 数 */
  issuesInvolved?: number
}

/**
 * 生成年度报告的请求参数
 */
export interface YearlyReportRequest {
  username: string
  year: number
  locale?: string
  tags: YearlyReportTags
  highlights?: YearlyReportHighlights
  /** 可选的自定义 AI 配置 */
  aiConfig?: AiRuntimeConfig
}

/**
 * 流式请求状态
 */
export type StreamStatus = 'idle' | 'streaming' | 'success' | 'error' | 'aborted'
