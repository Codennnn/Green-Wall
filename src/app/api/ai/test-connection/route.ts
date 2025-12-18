import { type NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { object, parse, string } from 'valibot'

import { getModelFromRequest, isModelFactoryError } from '~/lib/ai/runtime-model'
import type { TestConnectionResponse } from '~/types/ai-config'

export const maxDuration = 15

const TestConnectionRequestSchema = object({
  aiConfig: object({
    baseUrl: string(),
    apiKey: string(),
    model: string(),
  }),
})

export async function POST(request: NextRequest): Promise<NextResponse<TestConnectionResponse>> {
  const startTime = Date.now()

  try {
    // 1. 解析请求体
    const body: unknown = await request.json()
    const { aiConfig } = parse(TestConnectionRequestSchema, body)

    // 2. 获取模型实例
    const modelResult = getModelFromRequest(aiConfig)

    if (isModelFactoryError(modelResult)) {
      return NextResponse.json(
        { ok: false, message: modelResult.message },
        {
          status: 400,
          headers: { 'Cache-Control': 'no-store' },
        },
      )
    }

    // 3. 发起极短请求测试连接
    const result = await generateText({
      model: modelResult.model,
      prompt: 'Say "OK" in one word.',
      maxOutputTokens: 5,
      temperature: 0,
    })

    const latencyMs = Date.now() - startTime

    // 4. 返回成功响应
    return NextResponse.json(
      {
        ok: true,
        latencyMs,
        modelName: modelResult.modelName,
        message: result.text ? 'Connection successful' : 'Connected but no response',
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  }
  catch (error) {
    const latencyMs = Date.now() - startTime

    // 处理各类错误，避免泄露敏感信息
    let message = 'Connection failed'

    if (error instanceof Error) {
      // 过滤可能包含敏感信息的错误消息
      const errorMsg = error.message.toLowerCase()

      if (errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
        message = 'Invalid API key'
      }
      else if (errorMsg.includes('not found') || errorMsg.includes('404')) {
        message = 'Model not found or endpoint invalid'
      }
      else if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
        message = 'Connection timeout'
      }
      else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        message = 'Network error, please check the URL'
      }
      else if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
        message = 'Rate limited, please try again later'
      }
      else if (error.name === 'ValiError') {
        message = 'Invalid request format'
      }
      else {
        // 通用错误，不暴露原始信息
        message = 'Connection failed, please check your configuration'
      }
    }

    return NextResponse.json(
      { ok: false, latencyMs, message },
      {
        status: 200, // 使用 200 以便前端能正常解析响应体
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  }
}
