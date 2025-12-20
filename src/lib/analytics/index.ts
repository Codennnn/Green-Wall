import type { GraphSize } from '~/enums'
import { isDevelopment } from '~/helpers'

/**
 * 追踪用户事件
 * @param event - 事件名称
 * @param data - 事件数据（仅会过滤 null/undefined；请避免直接上报用户名、完整 URL 等高敏/高基数字段）
 */
export function trackEvent(
  event: string,
  data?: Record<string, string | number | boolean | undefined | null>,
): void {
  // 开发环境不追踪
  if (isDevelopment()) {
    return
  }

  // SSR 环境不追踪
  if (typeof window === 'undefined') {
    return
  }

  // Umami 未加载时不追踪
  if (typeof window.umami === 'undefined') {
    return
  }

  try {
    const cleanData: Record<string, string | number | boolean> = {}

    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          cleanData[key] = value
        }
      })
    }

    const finalData = Object.keys(cleanData).length > 0 ? cleanData : undefined
    window.umami.track(event, finalData)
  }
  catch (error) {
    console.error('Failed to track event:', error)
  }
}

type EntryPoint = 'url' | 'input_submit' | 'famous_user' | 'recent_user'

function buildYearRangeString(value?: [start?: string, end?: string]): string | undefined {
  if (!value) {
    return undefined
  }

  const [start, end] = value

  if (!start && !end) {
    return undefined
  }

  // 结构化字段在 Umami 事件里不一定方便聚合，这里保留低成本的 string 口径
  return `${start ?? ''}-${end ?? ''}`
}

function normalizeApiEndpointForAnalytics(endpoint: string): {
  endpoint: string
  endpoint_name: string
} {
  let normalizedEndpoint = endpoint
  let endpointName = ''

  if (normalizedEndpoint.startsWith('/api/contribution/')) {
    // 避免把 username 上报到分析系统（高敏 + 高基数）
    normalizedEndpoint = normalizedEndpoint.replace(
      /^\/api\/contribution\/[^/?#]+/,
      '/api/contribution/:username',
    )
    endpointName = 'contribution'
  }
  else if (normalizedEndpoint === '/api/repos') {
    endpointName = 'repos'
  }
  else if (normalizedEndpoint === '/api/issues') {
    endpointName = 'issues'
  }
  else if (normalizedEndpoint === '/api/repo-interactions') {
    endpointName = 'repo_interactions'
  }
  else {
    endpointName = normalizedEndpoint
      .replace(/[^a-z0-9]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase()
      .slice(0, 60)
  }

  return {
    endpoint: normalizedEndpoint,
    endpoint_name: endpointName || 'unknown',
  }
}

/**
 * 统一的事件追踪工具函数
 */
export const eventTracker = {
  user: {
    search: {
      start: (
        entryPoint: EntryPoint,
        yearRange?: [start?: string, end?: string],
      ) => {
        trackEvent('user.search.start', {
          entry_point: entryPoint,
          year_range: buildYearRangeString(yearRange),
        })
      },
      success: (
        entryPoint: EntryPoint,
        hasGraphData: boolean,
        durationMs?: number,
        yearRange?: [start?: string, end?: string],
      ) => {
        trackEvent('user.search.success', {
          entry_point: entryPoint,
          has_graph_data: hasGraphData,
          duration_ms: durationMs,
          year_range: buildYearRangeString(yearRange),
        })
      },
      error: (
        errorType: string,
        status: number,
        entryPoint: EntryPoint,
        durationMs?: number,
      ) => {
        trackEvent('user.search.error', {
          error_category: errorType,
          http_status: status,
          entry_point: entryPoint,
          duration_ms: durationMs,
        })
      },
    },
  },

  image: {
    download: {
      click: (context: 'home' | 'year_report', size?: GraphSize) => {
        trackEvent('image.download.click', {
          context,
          image_size: size ?? 'unknown',
        })
      },
      success: (
        size: GraphSize | undefined,
        theme: string,
        includeLabels: boolean,
        includeAttribution: boolean,
        context?: 'home' | 'year_report',
      ) => {
        trackEvent('image.download.success', {
          image_size: size ?? 'unknown',
          theme,
          include_labels: includeLabels,
          include_attribution: includeAttribution,
          file_format: 'png',
          context,
        })
      },
      error: (errorMessage: string, context?: 'home' | 'year_report') => {
        trackEvent('image.download.error', {
          error_message: errorMessage.substring(0, 100),
          file_format: 'png',
          context,
        })
      },
    },
    copy: {
      click: (context: 'home' | 'year_report', size?: GraphSize) => {
        trackEvent('image.copy.click', {
          context,
          image_size: size ?? 'unknown',
        })
      },
      success: (
        size: GraphSize | undefined,
        theme: string,
        includeLabels: boolean,
        context?: 'home' | 'year_report',
      ) => {
        trackEvent('image.copy.success', {
          image_size: size ?? 'unknown',
          theme,
          include_labels: includeLabels,
          file_format: 'png',
          context,
        })
      },
      error: (errorMessage: string, context?: 'home' | 'year_report') => {
        trackEvent('image.copy.error', {
          error_message: errorMessage.substring(0, 100),
          clipboard_item_support: typeof ClipboardItem !== 'undefined',
          context,
        })
      },
    },
  },

  share: {
    open: () => {
      trackEvent('share.open', {})
    },
    preview: (data?: {
      size?: string
      theme?: string
      yearRange?: [start?: string, end?: string]
      showSafariHeader?: boolean
      showAttribution?: boolean
    }) => {
      trackEvent('share.preview', {
        size: data?.size,
        theme: data?.theme,
        year_range: buildYearRangeString(data?.yearRange),
        show_safari_header: data?.showSafariHeader,
        show_attribution: data?.showAttribution,
      })
    },
    copy: (data?: {
      size?: string
      theme?: string
      yearRange?: [start?: string, end?: string]
      showSafariHeader?: boolean
      showAttribution?: boolean
    }) => {
      trackEvent('share.copy', {
        size: data?.size,
        theme: data?.theme,
        year_range: buildYearRangeString(data?.yearRange),
        show_safari_header: data?.showSafariHeader,
        show_attribution: data?.showAttribution,
      })
    },
    cta: {
      generateClick: (source: 'share_page') => {
        trackEvent('share.cta.generate.click', {
          source,
        })
      },
    },
  },

  ui: {
    theme: {
      change: (themeName: string) => {
        trackEvent('ui.theme.change', {
          theme_name: themeName,
        })
      },
    },
    settings: {
      open: (trigger: 'button' | 'auto') => {
        trackEvent('ui.settings.open', {
          trigger,
        })
      },
      close: (method: 'button' | 'outside_click' | 'popout') => {
        trackEvent('ui.settings.close', {
          method,
        })
      },
      popout: () => {
        trackEvent('ui.settings.popout', {})
      },
      dragEnd: (durationMs: number) => {
        trackEvent('ui.settings.drag_end', {
          duration_ms: durationMs,
        })
      },
      change: (settingKey: string, value: string | number | boolean) => {
        trackEvent('ui.settings.change', {
          setting_key: settingKey,
          setting_value: value,
        })
      },
    },
  },

  analytics: {
    view: (chartType: 'monthly' | 'weekly' | 'languages' | 'yearly', year?: number) => {
      trackEvent('analytics.view', {
        chart_type: chartType,
        year: year,
      })
    },
    interaction: (chartType: string, interactionType: 'hover' | 'click' | 'scroll') => {
      trackEvent('analytics.interaction', {
        chart_type: chartType,
        interaction_type: interactionType,
      })
    },
  },

  discovery: {
    userClick: (userType: 'recent' | 'famous', userCount?: number, position?: number) => {
      trackEvent('discovery.user.click', {
        user_type: userType,
        user_count: userCount,
        position: position,
      })
    },
  },

  api: {
    error: (
      endpoint: string,
      status: number,
      errorType: string | number,
      retryCount?: number,
    ) => {
      const normalized = normalizeApiEndpointForAnalytics(endpoint)

      trackEvent('api.error', {
        endpoint: normalized.endpoint,
        endpoint_name: normalized.endpoint_name,
        http_status: status,
        error_category: errorType.toString(),
        retry_count: retryCount,
      })
    },
  },

  year: {
    search: {
      submit: (year: number, source: 'manual' | 'quick_entry') => {
        trackEvent('year.search.submit', {
          year,
          source,
        })
      },
    },
    quickEntry: {
      click: (year: number, isOwnProfile: boolean) => {
        trackEvent('year.quick_entry.click', {
          year,
          is_own_profile: isOwnProfile,
        })
      },
    },
    navigate: {
      start: (year: number) => {
        trackEvent('year.navigate.start', {
          year,
        })
      },
      success: (year: number, durationMs?: number) => {
        trackEvent('year.navigate.success', {
          year,
          duration_ms: durationMs,
        })
      },
    },
    card: {
      interaction: (cardType: 'repos' | 'issues' | 'chart' | 'stat', action: 'hover' | 'click') => {
        trackEvent('year.card.interaction', {
          card_type: cardType,
          action,
        })
      },
    },
  },

  ai: {
    report: {
      generate: {
        start: (year: number, hasHighlights: boolean, configSource: 'builtin' | 'custom') => {
          trackEvent('ai.report.generate.start', {
            year,
            has_highlights: hasHighlights,
            config_source: configSource,
          })
        },
        success: (year: number, durationMs: number, textLength: number) => {
          trackEvent('ai.report.generate.success', {
            year,
            duration_ms: durationMs,
            text_length: textLength,
          })
        },
        error: (year: number, errorMessage: string, durationMs: number, configSource: 'builtin' | 'custom') => {
          trackEvent('ai.report.generate.error', {
            year,
            error_message: errorMessage.substring(0, 100),
            duration_ms: durationMs,
            config_source: configSource,
          })
        },
        abort: (year: number, durationMs: number, textLength: number) => {
          trackEvent('ai.report.generate.abort', {
            year,
            duration_ms: durationMs,
            text_length: textLength,
          })
        },
      },
      copy: (year: number, textLength: number) => {
        trackEvent('ai.report.copy', {
          year,
          text_length: textLength,
        })
      },
    },
    config: {
      open: (currentSource: 'builtin' | 'custom') => {
        trackEvent('ai.config.open', {
          current_source: currentSource,
        })
      },
      test: {
        start: (provider: string) => {
          trackEvent('ai.config.test.start', {
            provider,
          })
        },
        success: (provider: string, latencyMs: number) => {
          trackEvent('ai.config.test.success', {
            provider,
            latency_ms: latencyMs,
          })
        },
        error: (provider: string, errorType: string, latencyMs: number) => {
          trackEvent('ai.config.test.error', {
            provider,
            error_type: errorType,
            latency_ms: latencyMs,
          })
        },
      },
      save: (provider: string) => {
        trackEvent('ai.config.save', {
          provider,
        })
      },
      reset: () => {
        trackEvent('ai.config.reset', {})
      },
    },
  },

  auth: {
    signIn: {
      click: (source: 'header' | 'year_page' | 'benefits_popup') => {
        trackEvent('auth.sign_in.click', {
          source,
        })
      },
    },
    signOut: {
      click: () => {
        trackEvent('auth.sign_out.click', {})
      },
    },
    yearReview: {
      open: (year: number, hasLogin: boolean) => {
        trackEvent('auth.year_review.open', {
          year,
          has_login: hasLogin,
        })
      },
    },
  },

  nav: {
    click: (destination: string, source: string) => {
      trackEvent('nav.click', {
        destination,
        source,
      })
    },
  },
}
