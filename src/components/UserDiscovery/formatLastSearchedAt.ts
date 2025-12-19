export function formatLastSearchedAt(ms: number) {
  const date = new Date(ms)
  const ok = Number.isFinite(date.getTime())

  if (!ok) {
    return ''
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).formatToParts(date)

  const month = parts.find((p) => p.type === 'month')?.value ?? '00'
  const day = parts.find((p) => p.type === 'day')?.value ?? '00'
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00'
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'

  return `${month}/${day} ${hour}:${minute}`
}
