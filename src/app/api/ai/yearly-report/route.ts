import { type NextRequest, NextResponse } from 'next/server'
import { streamText } from 'ai'
import { number, object, optional, parse, string } from 'valibot'

import { checkAiConfig, getAiModel } from '~/lib/ai/provider'
import { buildYearlyReportPrompt } from '~/lib/yearly-report/prompt'

export const maxDuration = 30

const YearlyReportTagsSchema = object({
  activity_level: string(),
  commit_style: string(),
  time_pattern: string(),
  tech_focus: string(),
  repo_pattern: string(),
})

const YearlyReportHighlightsSchema = object({
  maxDayCount: optional(number()),
  maxDayDate: optional(string()),
  maxMonth: optional(string()),
  longestStreak: optional(number()),
  totalContributions: optional(number()),
  reposCreated: optional(number()),
  issuesInvolved: optional(number()),
})

const YearlyReportRequestSchema = object({
  username: string(),
  year: number(),
  locale: optional(string()),
  tags: YearlyReportTagsSchema,
  highlights: optional(YearlyReportHighlightsSchema),
})

export async function POST(request: NextRequest) {
  try {
    // 1. 检查 AI 配置
    const configCheck = checkAiConfig()

    if (!configCheck.valid) {
      return NextResponse.json(
        { message: configCheck.message ?? 'AI configuration error' },
        { status: 500 },
      )
    }

    // 2. 解析并校验请求体
    const body: unknown = await request.json()
    const parsedBody = parse(YearlyReportRequestSchema, body)

    const { username, year, locale, tags, highlights } = parsedBody

    // 3. 构建 Prompt
    const { system, prompt } = buildYearlyReportPrompt({
      username,
      year,
      locale,
      tags,
      highlights,
    })

    // 4. 调用 AI SDK streamText
    const result = streamText({
      model: getAiModel(),
      system,
      prompt,
      // 可选：设置温度等参数
      temperature: 0.7,
      maxOutputTokens: 3000,
    })

    // 5. 返回纯文本流式响应
    return result.toTextStreamResponse()
  }
  catch (error) {
    console.error('[AI Yearly Report] Error:', error)

    // 区分校验错误和其他错误
    if (error instanceof Error) {
      // Valibot 校验错误
      if (error.name === 'ValiError') {
        return NextResponse.json(
          { message: 'Invalid request body', details: error.message },
          { status: 400 },
        )
      }

      return NextResponse.json(
        { message: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 },
    )
  }
}
