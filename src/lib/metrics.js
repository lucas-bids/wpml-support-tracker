import { weekdaysInMonth, toMonthKey } from './date.js'

export function computeMonthStats({
  ticketsForMonth = [],
  monthDoc = { monthlyGoal: 0, extraTaskHours: 0, daysOff: [] },
  today = new Date(),
  tz = 'America/Sao_Paulo',
  workdayHours = 8,
  selectedMonthKey,
}) {
  const total = ticketsForMonth.length
  const dailyAverageGoal = Number(monthDoc?.monthlyGoal || 0)
  const extraTaskHours = Number(monthDoc?.extraTaskHours || 0) // month total `1(we’ll cap to “so far”)
  const daysOff = Array.isArray(monthDoc?.daysOff) ? monthDoc.daysOff : []

  const effectiveMonthKey = selectedMonthKey || toMonthKey(today, tz)
  const [yearStr, monthStr] = effectiveMonthKey.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)

  const workingDays = Math.max(0, weekdaysInMonth(year, month) - daysOff.length)
  const hoursThisMonth = Math.max(0, workingDays * workdayHours - extraTaskHours)
  const adjustedDayEquivalents = Math.max(0, hoursThisMonth / workdayHours)

  // Monthly goal derived from daily average goal
  const monthlyGoal = Math.round(dailyAverageGoal * adjustedDayEquivalents)

  // Worked days so far (Mon–Fri minus daysOff up to today)
  const currentMonthKey = toMonthKey(today, tz)
  const endOfSelected = new Date(year, month, 0).getDate()
  let todayDay
  if (effectiveMonthKey === currentMonthKey) {
    todayDay = today.getDate()
  } else {
    const [cy, cm] = currentMonthKey.split('-').map(Number)
    const cmpSelected = year * 100 + month
    const cmpCurrent = cy * 100 + cm
    todayDay = cmpSelected < cmpCurrent ? endOfSelected : 0
  }

  let workedDaysSoFar = 0
  for (let d = 1; d <= todayDay; d++) {
    const dt = new Date(year, month - 1, d)
    const dow = dt.getDay()
    const key = `${yearStr}-${monthStr}-${String(d).padStart(2, '0')}`
    const isOff = daysOff.includes(key)
    if (dow >= 1 && dow <= 5 && !isOff) workedDaysSoFar++
  }

  // Remaining weekdays in month minus upcoming daysOff
  const totalWeekdays = weekdaysInMonth(year, month)
  const weekdaysSoFar = (() => {
    let c = 0
    for (let d = 1; d <= todayDay; d++) {
      const dt = new Date(year, month - 1, d)
      const dow = dt.getDay()
      if (dow >= 1 && dow <= 5) c++
    }
    return c
  })()
  const weekdaysLeft = Math.max(0, totalWeekdays - weekdaysSoFar)
  const daysOffUpToToday = daysOff.filter((k) => Number(k.slice(-2)) <= todayDay).length
  const upcomingDaysOff = Math.max(0, daysOff.length - daysOffUpToToday)
  const remainingDays = Math.max(0, weekdaysLeft - upcomingDaysOff)

  const remaining = Math.max(0, monthlyGoal - total)
  const ticketsPerDayToGoal = Math.ceil(remaining / Math.max(1, remainingDays))

  // --- NEW: adjusted daily average counts extra task hours as “ticket-equivalents” ---
  // Cap extra task hours to the maximum hours possible up to today.
  const hoursUntilToday = Math.max(0, workedDaysSoFar * workdayHours)
  const extraHoursSoFar = Math.min(Math.max(0, extraTaskHours), hoursUntilToday)

  // Your example: ((tickets + extraHours) / (workdayHours * workedDays)) / (1/workdayHours)
  // simplifies to (tickets + extraHours) / workedDays.
  const adjustedDailyAverage = (total + extraHoursSoFar) / Math.max(1, workedDaysSoFar)

  return {
    total,
    workedDaysSoFar,
    dailyAverageGoal,
    monthlyGoal,
    remaining,
    remainingDays,
    ticketsPerDayToGoal,
    hoursThisMonth,
    adjustedDayEquivalents,
    hoursUntilToday,
    adjustedDayEquivalentsUntilToday: hoursUntilToday > 0 ? (hoursUntilToday - extraHoursSoFar) / workdayHours : 0, // kept for compatibility if used
    adjustedDailyAverage,
  }
}
