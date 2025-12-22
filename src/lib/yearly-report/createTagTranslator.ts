import type { TagTranslator } from './deriveTags'

/**
 * 翻译函数类型
 * 用于从 next-intl 的 useTranslations 或 getTranslations 获取翻译
 */
export type TranslationFunction = (key: string, values?: Record<string, string | number>) => string

/**
 * 创建标签翻译器实例
 *
 * @param t - next-intl 的翻译函数，通常来自 useTranslations('yearlyTags') 或 getTranslations('yearlyTags')
 * @returns TagTranslator 实例
 */
export function createTagTranslator(t: TranslationFunction): TagTranslator {
  return {
    activityLevel: (key) => t(`activityLevel.${key}`),
    commitStyle: (key) => t(`commitStyle.${key}`),
    timePattern: (key) => t(`timePattern.${key}`),
    repoPattern: (key) => t(`repoPattern.${key}`),
    techFocus: {
      unknown: () => t('techFocus.unknown'),
      specialist: (language) => t('techFocus.specialist', { language }),
      majorMinor: (major, minor) => t('techFocus.majorMinor', { major, minor }),
      dual: (lang1, lang2) => t('techFocus.dual', { lang1, lang2 }),
      polyglot: () => t('techFocus.polyglot'),
      primarySecondary: (primary, secondary) =>
        t('techFocus.primarySecondary', { primary, secondary }),
    },
  }
}
