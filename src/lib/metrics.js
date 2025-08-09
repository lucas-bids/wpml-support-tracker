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
  const dailyAverageGoal = Number(monthDoc?.monthlyGoal || 0) // This is now the daily average goal
  const extraTaskHours = Number(monthDoc?.extraTaskHours || 0)
  const daysOff = Array.isArray(monthDoc?.daysOff) ? monthDoc.daysOff : []

  const effectiveMonthKey = selectedMonthKey || toMonthKey(today, tz)
  const [yearStr, monthStr] = effectiveMonthKey.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)

  const workingDays = Math.max(0, weekdaysInMonth(year, month) - daysOff.length)
  const hoursThisMonth = Math.max(0, workingDays * workdayHours - extraTaskHours)
  const adjustedDayEquivalents = Math.max(0, hoursThisMonth / workdayHours)
  
  // Calculate monthly goal from daily average goal
  const monthlyGoal = Math.round(dailyAverageGoal * adjustedDayEquivalents)

  // Worked days so far (weekdays from 1st..today) minus daysOff up to today
  // Determine cutoff day for "worked so far" depending on selected month
  const currentMonthKey = toMonthKey(today, tz)
  const endOfSelected = new Date(year, month, 0).getDate()
  let todayDay
  if (effectiveMonthKey === currentMonthKey) {
    todayDay = today.getDate()
  } else {
    // If viewing past months, assume whole month worked; if future month, none worked
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

  const dailyAverage = total / Math.max(1, workedDaysSoFar)
  const remaining = Math.max(0, monthlyGoal - total)
  const pacePerDay = Math.ceil(remaining / Math.max(1, remainingDays))
  const adjustedDailyAverage = total / Math.max(1, adjustedDayEquivalents)

  return {
    total,
    workedDaysSoFar,
    dailyAverage,
    dailyAverageGoal,
    monthlyGoal,
    remaining,
    remainingDays,
    pacePerDay,
    hoursThisMonth,
    adjustedDayEquivalents,
    adjustedDailyAverage,
  }
}


