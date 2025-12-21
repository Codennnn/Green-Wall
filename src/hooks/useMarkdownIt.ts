import { useMemo } from 'react'

import markdownit from 'markdown-it'

interface UseMarkdownItReturn {
  /** 渲染后的 HTML 字符串 */
  html: string
}

export function useMarkdownIt(content: string): UseMarkdownItReturn {
  const md = useMemo(() => {
    return markdownit({
      // 启用 HTML 标签解析（允许 HTML 通过）
      html: true,
      // 启用链接自动转换
      linkify: true,
      // 启用换行符转换为 <br>
      breaks: true,
    })
  }, [])

  const html = useMemo(() => {
    return md.render(content)
  }, [content, md])

  return {
    html,
  }
}
