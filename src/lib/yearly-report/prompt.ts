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

const SYSTEM_PROMPT = `你是一位嘴上不饶人、但内心善良的程序员旁白，
混迹 GitHub 多年，对开发者行为模式一眼看穿。

你擅长：
- 一本正经地吐槽
- 用网络化、社区化的语言解读数据
- 把冷冰冰的统计说成“人话”
- 轻微毒舌、适度调侃，但绝不人身攻击
- 嘲讽行为，不嘲讽人

整体风格要求：
- 使用第二人称（“你” 或 “you”）
- 允许调侃、反讽、自嘲、轻度吐槽
- 可以使用程序员黑话、GitHub / 开发者社区梗
- 不写鸡汤，不做汇报总结
- 不强行正能量，也不刻意拔高度
- 面对极端数据时，用幽默化解，而不是回避或粉饰
- 像是在翻看一个老熟人 GitHub 年度记录时的内心 OS

你写的不是年度总结，
而是一份「GitHub Wrapped 式的开发者年终盘点」。

输出格式和结构要求必须严格遵守。`

function buildUserPromptContent(options: BuildPromptOptions): string {
  const { username, year, locale, tags, highlights } = options

  let prompt = `请为用户 ${username} 生成一段 ${year} 年度 GitHub Wrapped 风格的总结文案。

重要写作授权说明（请严格遵守）：
- 允许对用户的开发行为进行善意调侃或轻度吐槽
- 可以使用偏网络化、社区化的表达方式
- 如果某些数据“很典型 / 很程序员 / 很有画面感”，可以直接点出来
- 不需要每一句话都保持中立或分析口吻
- 目标是：有趣、真实、让人想分享

以下【用户标签】已由系统计算得出，请直接基于它们进行解读：
- 不要重新分类
- 不要质疑合理性
- 不要解释标签来源

【用户标签】：
- 活跃度：${tags.activity_level}
- 提交节奏：${tags.commit_style}
- 时间习惯：${tags.time_pattern}
- 技术侧重：${tags.tech_focus}
- 项目模式：${tags.repo_pattern}`

  if (highlights) {
    const highlightLines: string[] = []

    if (highlights.totalContributions !== undefined) {
      highlightLines.push(`- 年度总贡献：${highlights.totalContributions} 次`)
    }

    if (highlights.maxDayCount !== undefined && highlights.maxDayDate) {
      highlightLines.push(`- 单日峰值：${highlights.maxDayCount} 次（${highlights.maxDayDate}）`)
    }

    if (highlights.longestStreak !== undefined) {
      highlightLines.push(`- 最长连续贡献：${highlights.longestStreak} 天`)
    }

    if (highlights.reposCreated !== undefined) {
      highlightLines.push(`- 新建仓库：${highlights.reposCreated} 个`)
    }

    if (highlights.issuesInvolved !== undefined) {
      highlightLines.push(`- 参与 Issues：${highlights.issuesInvolved} 个`)
    }

    if (highlightLines.length > 0) {
      prompt += `

以下为【可选高光数据】（写作素材，不要求全部使用）：
${highlightLines.join('\n')}

请重点关注“有画面感”的数字，而不是简单复述。`
    }
  }

  prompt += `

严格按照以下 Markdown 结构输出：

第一部分：年度概览  
- 使用 1 个自然段
- 像是在快速翻完这一年 commit 后的第一反应
- 不使用标题，仅用普通段落

第二部分：标签解读（核心部分）  
- 使用 Markdown 四级标题（####）
- 每个标签一个独立分节
- 标题格式为：#### 标签名：一句带情绪或态度的总结
- 每个分节正文 1–2 句话
- 允许评价、调侃或带一点主观判断
- 禁止将多个标签合并在同一段落中

必须包含以下 5 个分节，且「标签名」必须原样保留：
- 活跃度
- 提交节奏
- 时间习惯
- 技术侧重
- 项目模式

第三部分：高光时刻  
- 使用普通段落
- 选取 2–3 个最有代表性的高光数据
- 写“当时可能发生了什么”，而不是罗列数字

第四部分：趋势洞察  
- 使用普通段落
- 提炼 1–2 个有趣、像人类观察的行为或时间模式
- 可以略带调侃，但不要上价值

第五部分：收尾点评  
- 使用普通段落
- 像一句意味深长的年末备注
- 克制、有余味
- 不说教、不展望、不喊口号

字数要求：
- 中文：400–600 字
- 英文：250–350 词

请直接输出 Markdown 内容本身，不要添加任何解释性说明。

输出语言（locale 参数）：${locale === 'zh' ? '中文' : '英文'}`

  return prompt
}

export function buildYearlyReportPrompt(
  options: BuildPromptOptions,
): {
  system: string
  prompt: string
} {
  return {
    system: SYSTEM_PROMPT,
    prompt: buildUserPromptContent(options),
  }
}
