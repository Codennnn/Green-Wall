import { type NextRequest, NextResponse } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { streamText } from 'ai'
import { number, object, optional, parse, string } from 'valibot'

import { getModelFromRequest, isModelFactoryError } from '~/lib/ai/runtime-model'
import {
  classifyAiError,
  STREAM_EVENT_DONE,
  STREAM_EVENT_ERROR,
  STREAM_EVENT_TEXT,
} from '~/lib/ai/stream-error'
import { buildYearlyReportPrompt, type TagCategoryNames } from '~/lib/yearly-report/prompt'
import type { StreamErrorInfo } from '~/types/ai-report'

export const maxDuration = 30

interface StreamTextData {
  delta: string
}

interface StreamDoneData {
  ok: true
}

function createErrorResponse(error: unknown, status = 500): NextResponse {
  const classified = classifyAiError(error)

  if (status === 400 && classified.code === 'unknown') {
    return NextResponse.json(
      {
        code: 'badRequest',
        message: 'Invalid request body',
        retryable: false,
      },
      { status },
    )
  }

  return NextResponse.json(classified, { status })
}

function encodeSseEvent(
  event: string,
  data: StreamTextData | StreamErrorInfo | StreamDoneData,
): Uint8Array {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`

  return new TextEncoder().encode(payload)
}

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
        {
          code: 'badRequest',
          message: modelResult.message,
          retryable: false,
        },
        { status: 400 },
      )
    }

    // 3. 获取标签类别名称的本地化翻译
    const effectiveLocale = locale ?? 'en'
    const t = await getTranslations({ locale: effectiveLocale, namespace: 'yearlyTags.categoryNames' })
    const categoryNames: TagCategoryNames = {
      activityLevel: t('activityLevel'),
      commitStyle: t('commitStyle'),
      timePattern: t('timePattern'),
      techFocus: t('techFocus'),
      repoPattern: t('repoPattern'),
    }

    // 4. 构建 Prompt
    const { system, prompt } = buildYearlyReportPrompt({
      username,
      year,
      locale,
      tags,
      highlights,
      categoryNames,
    })

    // 5. 调用 AI SDK streamText
    // 关键：streamText 的错误不是通过异常抛出的，而是通过 onError 回调
    // 或 fullStream 中的 error 部分传递的。我们需要使用这些机制来捕获错误。
    let streamError: Error | null = null

    const result = streamText({
      model: modelResult.model,
      system,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 3000,
      // 使用 onError 回调捕获流式错误（如 401 认证错误）
      onError: ({ error }) => {
        console.error('[AI Yearly Report] onError callback:', error instanceof Error ? error.message : String(error))
        streamError = error instanceof Error ? error : new Error(String(error))
      },
    })

    // 6. 使用 fullStream 而不是 textStream 来检测错误部分
    // fullStream 包含 text-delta、error 等不同类型的部分
    const readableStream = new ReadableStream({
      async start(controller) {
        let hasErrored = false

        const emitError = (error: unknown) => {
          if (hasErrored) {
            return
          }

          hasErrored = true
          const errorInfo = classifyAiError(error)
          controller.enqueue(encodeSseEvent(STREAM_EVENT_ERROR, errorInfo))
        }

        try {
          for await (const part of result.fullStream) {
            // 检测 onError 回调中设置的错误
            if (streamError) {
              emitError(streamError)
              controller.close()

              return
            }

            // 检测流中的错误部分
            if (part.type === 'error') {
              console.error('[AI Yearly Report] Stream error part:', part.error instanceof Error ? part.error.message : String(part.error))

              emitError(part.error)
              controller.close()

              return
            }

            // 只处理文本增量部分
            if (part.type === 'text-delta') {
              controller.enqueue(encodeSseEvent(STREAM_EVENT_TEXT, { delta: part.text }))
            }
          }

          // 流结束后再次检查是否有 onError 设置的错误
          if (streamError) {
            emitError(streamError)
          }
          else {
            controller.enqueue(encodeSseEvent(STREAM_EVENT_DONE, { ok: true }))
          }

          controller.close()
        }
        catch (unexpectedError) {
          // 兜底：捕获任何意外的异常
          console.error('[AI Yearly Report] Unexpected error:', unexpectedError instanceof Error ? unexpectedError.message : String(unexpectedError))

          try {
            emitError(unexpectedError)
            controller.close()
          }
          catch {
            // 忽略 enqueue/close 失败
          }
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive',
      },
    })
  }
  catch (error) {
    // 注意：不要 log 完整的 body，避免泄露 apiKey
    console.error('[AI Yearly Report] Error:', error instanceof Error ? error.message : 'Unknown error')

    // 区分校验错误和其他错误
    if (error instanceof Error) {
      // Valibot 校验错误
      if (error.name === 'ValiError') {
        return createErrorResponse(
          new Error('Invalid request body'),
          400,
        )
      }

      return createErrorResponse(error, 500)
    }

    return createErrorResponse(new Error('An unexpected error occurred'), 500)
  }
}
