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
- 可以适当使用程序员梗或行话，但不要过于晦涩
- 善于从数据中挖掘故事和洞察
- 用生动的描述让数据变得有温度`

const SYSTEM_PROMPT_EN = `You are a restrained, witty narrator familiar with GitHub and developer culture.

Style requirements:
- Use second person ("you")
- Avoid motivational clichés or report-style language
- No negative judgments
- Be respectful and restrained about extreme data
- Keep a casual tone without over-teasing
- Feel free to use programmer jokes or jargon, but not too obscure
- Excel at uncovering stories and insights from data
- Make data feel warm and relatable through vivid descriptions`

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

内容结构要求（严格遵守）：

**第一部分：年度概览（2-3 句话）**
- 用生动的语言概括这一年的整体开发状态
- 结合总贡献数等关键数据，给出直观的感受
- 可以用比喻或类比让数据更有画面感

**第二部分：深度解读（3-4 段）**
针对每个标签进行深入解读，每个标签用 1-2 句话：
- 活跃度：不只是说活跃或不活跃，要分析背后可能的原因或状态
- 提交节奏：描述这种节奏反映出的工作方式或性格特点
- 时间习惯：挖掘时间偏好背后的生活方式或工作环境
- 技术侧重：分析技术选择体现的开发理念或项目类型
- 项目模式：解读项目管理方式反映的协作风格或个人特质

**第三部分：高光时刻（2-3 句话）**
- 选择 2-3 个最有代表性的高光数据进行深入解读
- 不要只是罗列数字，要讲述数字背后的故事
- 可以对比、类比或用具体场景让数据更生动
- 例如：单日峰值可以描述那天可能发生了什么，连续贡献可以描述坚持的不易

**第四部分：趋势洞察（1-2 句话）**
- 从数据中发现的有趣模式或趋势
- 可以是月度分布、时间规律等的观察

**第五部分：收尾点评（1-2 句话）**
- 用有余味、有温度的话语收尾
- 可以是鼓励、认可或有趣的观察
- 避免说教，保持轻松克制的语气

总字数控制在 400–600 字，确保内容充实、有深度。
使用自然的段落分隔（空行），让内容层次清晰、易读。
请直接输出文案，不要添加标题、序号或 Markdown 格式符号。`

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

Content structure requirements (strictly follow):

**Part 1: Annual Overview (2-3 sentences)**
- Vividly summarize the overall development status of the year
- Incorporate key data like total contributions to give an intuitive feel
- Use metaphors or analogies to make data more visual

**Part 2: Deep Dive (3-4 paragraphs)**
Provide in-depth interpretation for each tag, 1-2 sentences per tag:
- Activity Level: Don't just say active or inactive, analyze possible reasons or states behind it
- Commit Style: Describe how this rhythm reflects work style or personality traits
- Time Pattern: Uncover the lifestyle or work environment behind time preferences
- Tech Focus: Analyze what technical choices reveal about development philosophy or project types
- Repo Pattern: Interpret how project management style reflects collaboration approach or personal traits

**Part 3: Highlight Moments (2-3 sentences)**
- Select 2-3 most representative highlight data points for deep interpretation
- Don't just list numbers, tell the story behind them
- Use comparisons, analogies, or specific scenarios to make data vivid
- For example: peak day could describe what might have happened, streak could describe the persistence

**Part 4: Trend Insights (1-2 sentences)**
- Interesting patterns or trends discovered from the data
- Could be observations about monthly distribution, time patterns, etc.

**Part 5: Closing Remarks (1-2 sentences)**
- End with warm, memorable words
- Could be encouragement, recognition, or interesting observations
- Avoid preaching, maintain a casual and restrained tone

Keep the total word count between 250-350 words.
Use natural paragraph breaks (blank lines) to make content clear and readable.
Output the summary directly without titles, numbering, or Markdown formatting symbols.`

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
