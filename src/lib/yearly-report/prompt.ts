import type {
  YearlyReportHighlights,
  YearlyReportTags,
} from '~/types/ai-report'

export interface BuildPromptOptions {
  username: string
  year: number
  locale?: string
  tags: YearlyReportTags
  highlights?: YearlyReportHighlights
}

const SYSTEM_PROMPT_ZH = `你是一位克制、有幽默感的程序员旁白，熟悉 GitHub 和开发者文化。

整体风格要求：
- 使用第二人称（"你"）
- 不使用鸡汤或汇报式语言
- 不进行负面评价
- 对极端数据保持克制和尊重
- 语气轻松，但不过度调侃
- 可以适当使用程序员梗或行话，但不要过于晦涩`

const SYSTEM_PROMPT_EN = `You are a restrained, witty narrator familiar with GitHub and developer culture.

Style requirements:
- Use second person ("you")
- Avoid motivational clichés or report-style language
- No negative judgments
- Be respectful and restrained about extreme data
- Keep a casual tone without over-teasing
- Feel free to use programmer jokes or jargon, but not too obscure`

function buildUserPromptZh(options: BuildPromptOptions): string {
  const { username, year, tags, highlights } = options

  let prompt = `请为用户 ${username} 生成一段 ${year} 年度 GitHub Wrapped 总结文案。

请基于以下【已确定的用户标签】进行解读，这些标签已由系统计算得出，请不要重新分类或质疑：
- 活跃度：${tags.activity_level}
- 提交节奏：${tags.commit_style}
- 时间习惯：${tags.time_pattern}
- 技术侧重：${tags.tech_focus}
- 项目模式：${tags.repo_pattern}`

  // 添加高光数据（如果有）
  if (highlights) {
    const highlightLines: string[] = []

    if (highlights.totalContributions !== undefined) {
      highlightLines.push(`年度总贡献：${highlights.totalContributions} 次`)
    }

    if (highlights.maxDayCount !== undefined && highlights.maxDayDate) {
      highlightLines.push(`单日峰值：${highlights.maxDayCount} 次（${highlights.maxDayDate}）`)
    }

    if (highlights.longestStreak !== undefined) {
      highlightLines.push(`最长连续贡献：${highlights.longestStreak} 天`)
    }

    if (highlights.reposCreated !== undefined) {
      highlightLines.push(`新建仓库：${highlights.reposCreated} 个`)
    }

    if (highlights.issuesInvolved !== undefined) {
      highlightLines.push(`参与 Issues：${highlights.issuesInvolved} 个`)
    }

    if (highlightLines.length > 0) {
      prompt += `

【可选参考的高光数据】（可作为素材，但不必全部提及）：
${highlightLines.join('\n')}`
    }
  }

  prompt += `

结构要求（严格遵守）：
1. 用一句话概括这一年的开发状态
2. 用 1–2 句话解释标签背后的"习惯或节奏"
3. 点出一个最具代表性的高光点
4. 用一句有余味的评价收尾

总字数控制在 120–180 字。
请直接输出文案，不要解释过程，不要添加标题或分隔符。`

  return prompt
}

function buildUserPromptEn(options: BuildPromptOptions): string {
  const { username, year, tags, highlights } = options

  let prompt = `Generate a ${year} GitHub Wrapped summary for user ${username}.

Based on the following **pre-determined user tags** (calculated by the system, do not reclassify or question):
- Activity Level: ${tags.activity_level}
- Commit Style: ${tags.commit_style}
- Time Pattern: ${tags.time_pattern}
- Tech Focus: ${tags.tech_focus}
- Repo Pattern: ${tags.repo_pattern}`

  // Add highlights if available
  if (highlights) {
    const highlightLines: string[] = []

    if (highlights.totalContributions !== undefined) {
      highlightLines.push(`Total contributions: ${highlights.totalContributions}`)
    }

    if (highlights.maxDayCount !== undefined && highlights.maxDayDate) {
      highlightLines.push(`Peak day: ${highlights.maxDayCount} contributions (${highlights.maxDayDate})`)
    }

    if (highlights.longestStreak !== undefined) {
      highlightLines.push(`Longest streak: ${highlights.longestStreak} days`)
    }

    if (highlights.reposCreated !== undefined) {
      highlightLines.push(`New repos: ${highlights.reposCreated}`)
    }

    if (highlights.issuesInvolved !== undefined) {
      highlightLines.push(`Issues involved: ${highlights.issuesInvolved}`)
    }

    if (highlightLines.length > 0) {
      prompt += `

**Optional highlights for reference** (use as material, not all need to be mentioned):
${highlightLines.join('\n')}`
    }
  }

  prompt += `

Structure requirements (strictly follow):
1. One sentence summarizing the year's dev status
2. 1-2 sentences explaining the "habits or rhythm" behind the tags
3. Highlight one most representative achievement
4. End with a memorable closing remark

Keep the total word count between 60-100 words (English equivalent of 120-180 Chinese characters).
Output the summary directly without explanations, titles, or separators.`

  return prompt
}

/**
 * 构建年度报告的 System Prompt
 */
export function buildSystemPrompt(locale?: string): string {
  return locale === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN
}

/**
 * 构建年度报告的 User Prompt
 */
export function buildUserPrompt(options: BuildPromptOptions): string {
  const { locale } = options

  return locale === 'zh'
    ? buildUserPromptZh(options)
    : buildUserPromptEn(options)
}

/**
 * 构建完整的 Prompt 配置（供 AI SDK 使用）
 */
export function buildYearlyReportPrompt(options: BuildPromptOptions): {
  system: string
  prompt: string
} {
  return {
    system: buildSystemPrompt(options.locale),
    prompt: buildUserPrompt(options),
  }
}
