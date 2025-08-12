import { toMonthKey } from '../lib/date.js'

export default function Header({ monthKey, onChangeMonthKey, onSignOut, onOpenSettings }) {
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
      <div className="header-right row">
        <button className="btn" aria-label="Settings" onClick={onOpenSettings}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M19.14,12.94a7.43,7.43,0,0,0,.05-.94,7.43,7.43,0,0,0-.05-.94l2.11-1.65a.5.5,0,0,0,.12-.64l-2-3.46a.5.5,0,0,0-.6-.22l-2.49,1a7.28,7.28,0,0,0-1.63-.94l-.38-2.65A.5.5,0,0,0,13,1H11a.5.5,0,0,0-.5.42L10.14,4.07a7.28,7.28,0,0,0-1.63.94l-2.49-1a.5.5,0,0,0-.6.22l-2,3.46a.5.5,0,0,0,.12.64L5.64,11a7.43,7.43,0,0,0-.05.94,7.43,7.43,0,0,0,.05.94L3.53,14.53a.5.5,0,0,0-.12.64l2,3.46a.5.5,0,0,0,.6.22l2.49-1a7.28,7.28,0,0,0,1.63.94l.38,2.65A.5.5,0,0,0,11,23h2a.5.5,0,0,0,.5-.42l.36-2.65a7.28,7.28,0,0,0,1.63-.94l2.49,1a.5.5,0,0,0,.6-.22l2-3.46a.5.5,0,0,0-.12-.64ZM12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/>
          </svg>
        </button>
        <button className="btn" onClick={onSignOut}>Sign out</button>
      </div>
    </header>
  )
}


