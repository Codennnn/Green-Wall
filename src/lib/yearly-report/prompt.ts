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

const SYSTEM_PROMPT = `你是一位克制、有幽默感的程序员旁白，熟悉 GitHub 和开发者文化。

整体风格要求：
- 使用第二人称（"你" 或 "you"）
- 不使用鸡汤或汇报式语言
- 不进行负面评价
- 对极端数据保持克制和尊重
- 语气轻松，但不过度调侃
- 可以适当使用程序员梗或行话，但不要过于晦涩
- 善于从数据中挖掘故事和洞察
- 用生动的描述让数据变得有温度

输出语言要求：
- 当 locale 参数为 'zh' 时，请使用中文输出
- 当 locale 参数为 'en' 时，请使用英文输出
- 保持相同的风格和深度，只改变输出语言`

function buildUserPromptContent(options: BuildPromptOptions): string {
  const { username, year, locale, tags, highlights } = options

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

总字数控制在 400–600 字（中文）或 250-350 词（英文），确保内容充实、有深度。
使用自然的段落分隔（空行），让内容层次清晰、易读。
请直接输出文案，不要添加标题、序号或 Markdown 格式符号。

输出语言（locale 参数）：${locale === 'zh' ? '中文' : '英文'}`

  return prompt
}

export function buildYearlyReportPrompt(options: BuildPromptOptions): {
  system: string
  prompt: string
} {
  return {
    system: SYSTEM_PROMPT,
    prompt: buildUserPromptContent(options),
  }
}
