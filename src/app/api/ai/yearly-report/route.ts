import { type NextRequest, NextResponse } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { streamText } from 'ai'
import { number, object, optional, parse, string } from 'valibot'

import { getModelFromRequest, isModelFactoryError } from '~/lib/ai/runtime-model'
import { createTagTranslator } from '~/lib/yearly-report/createTagTranslator'
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

const AiConfigSchema = object({
  baseUrl: string(),
  apiKey: string(),
  model: string(),
})

const YearlyReportRequestSchema = object({
  username: string(),
  year: number(),
  locale: optional(string()),
  tags: YearlyReportTagsSchema,
  highlights: optional(YearlyReportHighlightsSchema),
  aiConfig: optional(AiConfigSchema),
})

export async function POST(request: NextRequest) {
  try {
    // 1. 解析并校验请求体
    const body: unknown = await request.json()
    const parsedBody = parse(YearlyReportRequestSchema, body)

    const { username, year, locale, tags, highlights, aiConfig } = parsedBody

    // 2. 获取模型实例
    const modelResult = getModelFromRequest(aiConfig)

    if (isModelFactoryError(modelResult)) {
      return NextResponse.json(
        { message: modelResult.message },
        { status: 400 },
      )
    }

    // 3. 构建 Prompt
    const { system, prompt } = buildYearlyReportPrompt({
      username,
      year,
      locale,
      tags,
      highlights,
    })

    // 4. 调用 AI SDK streamText（使用固定的合理默认值）
    const result = streamText({
      model: modelResult.model,
      system,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 3000,
    })

    // 5. 返回纯文本流式响应
    const response = result.toTextStreamResponse()
    response.headers.set('Cache-Control', 'no-store')

    return response
  }
  catch (error) {
    // 注意：不要 log 完整的 body，避免泄露 apiKey
    console.error('[AI Yearly Report] Error:', error instanceof Error ? error.message : 'Unknown error')

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
