import splitbee from '@splitbee/web'

export function numberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const isDev: boolean = process.env.NODE_ENV === 'development'

export function trackEvent(
  event: string,
  data?: Record<string, string | number | boolean | undefined | null>
): void {
  if (isDev) {
    return
  }

  void splitbee.track(event, data)
}
