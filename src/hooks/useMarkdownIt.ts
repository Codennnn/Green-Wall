import { useDeferredValue, useEffect, useMemo, useState } from 'react'

import type MarkdownIt from 'markdown-it'

interface UseMarkdownItReturn {
  /** 渲染后的 HTML 字符串 */
  html: string
}

const MARKDOWN_IT_OPTIONS = {
  // 启用 HTML 标签解析（允许 HTML 通过）
  html: true,
  // 启用链接自动转换
  linkify: true,
  // 启用换行符转换为 <br>
  breaks: true,
}

let markdownItInstance: MarkdownIt | undefined
let markdownItPromise: Promise<MarkdownIt> | undefined

function loadMarkdownIt(): Promise<MarkdownIt> {
  if (markdownItInstance) {
    return Promise.resolve(markdownItInstance)
  }

  markdownItPromise ??= import('markdown-it').then(({ default: markdownit }) => {
    markdownItInstance = markdownit(MARKDOWN_IT_OPTIONS)

    return markdownItInstance
  }).catch((err: unknown) => {
    markdownItPromise = undefined

    throw err
  })

  return markdownItPromise
}

export function useMarkdownIt(content: string): UseMarkdownItReturn {
  const deferredContent = useDeferredValue(content)
  const [md, setMd] = useState<MarkdownIt | undefined>(() => markdownItInstance)

  useEffect(() => {
    if (md || !content) {
      return
    }

    let active = true

    void loadMarkdownIt().then((markdownIt) => {
      if (active) {
        setMd(markdownIt)
      }
    }).catch(() => {
      // Retry on the next content update if the lazy chunk failed to load.
    })

    return () => {
      active = false
    }
  }, [content, md])

  const contentToRender = content ? deferredContent : ''
  const html = useMemo(() => {
    if (!md || !contentToRender) {
      return ''
    }

    return md.render(contentToRender)
  }, [contentToRender, md])

  return {
    html,
  }
}
