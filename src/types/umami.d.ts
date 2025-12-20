/**
 * Umami Analytics 全局类型声明
 */

type UmamiEventData = Record<string, string | number | boolean>

interface Umami {
  track: (eventName: string, eventData?: UmamiEventData) => void
}

interface Window {
  umami?: Umami
}
