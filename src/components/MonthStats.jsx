export default function MonthStats({ stats, monthDoc }) {
  const s = stats || {}
  return (
    <div className="grid">
      <div className="kpi">
        <div className="item">
          <div className="label">Total</div>
          <div className="value">{s.total ?? 0}</div>
        </div>
        <div className="item">
          <div className="label">Worked days so far</div>
          <div className="value">{s.workedDaysSoFar ?? 0}</div>
        </div>
        <div className="item">
          <div className="label">Daily average</div>
          <div className="value">{(s.adjustedDailyAverage ?? 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="kpi">
        <div className="item">
          <div className="label">Daily goal</div>
          <div className="value">{(s.dailyAverageGoal ?? 0).toFixed(1)}</div>
        </div>
        <div className="item">
          <div className="label">Monthly goal</div>
          <div className="value">{s.monthlyGoal ?? 0}</div>
        </div>
        <div className="item">
          <div className="label">Remaining</div>
          <div className="value">{s.remaining ?? 0}</div>
        </div>
      </div>

      <div className="kpi">
        <div className="item">
          <div className="label">Needed per workday</div>
          <div className="value">{s.ticketsPerDayToGoal ?? 0}</div>
        </div>
        <div className="item">
          <div className="label">Hours this month</div>
          <div className="value">{s.hoursThisMonth ?? 0}</div>
        </div>
        <div className="item">
          <div className="label">Adjusted day equivalents</div>
          <div className="value">{(s.adjustedDayEquivalents ?? 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="muted">
        Daily goal: {(monthDoc?.monthlyGoal || 0).toFixed(1)} tickets/day • Days off: {monthDoc?.daysOff?.length || 0} • Extra task hours: {monthDoc?.extraTaskHours || 0}
      </div>
    </div>
  )
}


