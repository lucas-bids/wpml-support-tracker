const DEFAULT_TZ = 'America/Sao_Paulo'

export function toDateKey(date = new Date(), tz = DEFAULT_TZ) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return fmt.format(date) // yyyy-mm-dd
}

export function toMonthKey(date = new Date(), tz = DEFAULT_TZ) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date)
  const y = parts.find((p) => p.type === 'year').value
  const m = parts.find((p) => p.type === 'month').value
  return `${y}-${m}`
}

export function weekdaysInMonth(year, month /* 1-12 */) {
  const mIndex = month - 1
  const start = new Date(year, mIndex, 1)
  const end = new Date(year, mIndex + 1, 0)
  let count = 0
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay()
    if (day >= 1 && day <= 5) count++
  }
  return count
}

export function remainingWeekdaysInMonth(fromDate = new Date(), tz = DEFAULT_TZ) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(fromDate)
  const y = Number(parts.find((p) => p.type === 'year').value)
  const m = Number(parts.find((p) => p.type === 'month').value)
  const d = Number(parts.find((p) => p.type === 'day').value)
  const start = new Date(y, m - 1, d)
  const end = new Date(y, m, 0)
  let count = 0
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    const day = dt.getDay()
    if (day >= 1 && day <= 5) count++
  }
  return count
}

export function parseISODateKey(dateKey /* yyyy-mm-dd */, tz = DEFAULT_TZ) {
  // Note: assumes runtime tz matches provided tz; sufficient for MVP
  return new Date(`${dateKey}T00:00:00`)
}


