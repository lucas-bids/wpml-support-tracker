import { toMonthKey } from '../lib/date.js'

export default function Header({ monthKey, onChangeMonthKey, onSignOut }) {
  const label = (() => {
    const [y, m] = monthKey.split('-').map(Number)
    const dt = new Date(y, m - 1, 1)
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(dt)
  })()

  function shiftMonth(delta) {
    const [y, m] = monthKey.split('-').map(Number)
    const dt = new Date(y, m - 1 + delta, 1)
    onChangeMonthKey(toMonthKey(dt))
  }

  return (
    <header className="header">
      <div className="header-left">
        <button className="btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
          ◀
        </button>
        <div className="month-label" aria-live="polite">{label}</div>
        <button className="btn" onClick={() => shiftMonth(1)} aria-label="Next month">
          ▶
        </button>
      </div>
      <div className="header-right">
        <button className="btn" onClick={onSignOut}>Sign out</button>
      </div>
    </header>
  )
}


