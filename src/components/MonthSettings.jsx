import { useEffect, useMemo, useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { toMonthKey } from '../lib/date.js'

const TZ = 'America/Sao_Paulo'

export default function MonthSettings({ user, monthKey, value, onSaved }) {
  const [form, setForm] = useState({ monthlyGoal: 0, extraTaskHours: 0, daysOff: [] })
  useEffect(() => {
    setForm({
      monthlyGoal: Number(value?.monthlyGoal || 0),
      extraTaskHours: Number(value?.extraTaskHours || 0),
      daysOff: Array.isArray(value?.daysOff) ? value.daysOff : [],
    })
  }, [value])

  const headers = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const [y, m] = monthKey.split('-').map(Number)
  const first = new Date(y, m - 1, 1)
  const startCol = first.getDay() // 0=Sun..6=Sat
  const daysInMonth = new Date(y, m, 0).getDate()
  const cells = []
  for (let i = 0; i < startCol; i++) cells.push({ type: 'pad' })
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(y, m - 1, d)
    const dow = dt.getDay()
    const k = `${monthKey}-${String(d).padStart(2, '0')}`
    const isWeekend = dow === 0 || dow === 6
    const isOff = form.daysOff.includes(k)
    cells.push({
      type: 'day',
      k,
      d,
      dow,
      isWeekend,
      isOff,
      isWeekday: dow >= 1 && dow <= 5,
    })
  }
  while (cells.length % 7 !== 0) cells.push({ type: 'pad' })

  function onToggle(k, isWeekday) {
    if (!isWeekday) return
    toggleDayOff(k)
  }

  function toggleDayOff(k) {
    setForm((prev) => {
      const set = new Set(prev.daysOff)
      if (set.has(k)) set.delete(k)
      else set.add(k)
      return { ...prev, daysOff: Array.from(set).sort() }
    })
  }

  async function save() {
    const ref = doc(db, 'users', user.uid, 'months', monthKey)
    await setDoc(
      ref,
      {
        monthlyGoal: Number(form.monthlyGoal || 0),
        extraTaskHours: Number(form.extraTaskHours || 0),
        daysOff: form.daysOff,
      },
      { merge: true }
    )
    if (typeof onSaved === 'function') onSaved()
  }

  return (
    <div className="grid">
      <div className="form-group">
        <div className="row">
          <label style={{ flex: 1 }}>
            <span className="muted">Daily average goal (tickets/day)</span>
            <input
              className="input"
              type="number"
              min="0"
              step="0.1"
              value={form.monthlyGoal}
              onChange={(e) => setForm((f) => ({ ...f, monthlyGoal: Number(e.target.value) }))}
            />
          </label>
          <label style={{ flex: 1 }}>
            <span className="muted">Extra task hours</span>
            <input
              className="input"
              type="number"
              min="0"
              value={form.extraTaskHours}
              onChange={(e) => setForm((f) => ({ ...f, extraTaskHours: Number(e.target.value) }))}
            />
          </label>
        </div>
      </div>

      <div className="form-group">


      <div className="row space-between" style={{ marginBottom: 'var(--space-2)' }}>
          <div className="muted">Days off</div>
          <div className="calendar-legend">
            <span className="chip chip--work" /> <small className="muted">Working day</small>
            <span className="chip chip--off" /> <small className="muted ml-2">Day off</small>
            <span className="chip chip--nonwork" /> <small className="muted ml-2">Weekend</small>
          </div>
        </div>

        <div className="calendar">
          {headers.map((h) => (
            <div key={h} className="calendar__head muted">
              {h}
            </div>

          ))}

{cells.map((c, i) => {
            if (c.type === 'pad') {
              return <div key={`pad-${i}`} className="calendar__cell calendar__cell--pad" aria-hidden="true" />
            }
            const cls = [
              'calendar__cell',
              c.isWeekend ? 'is-weekend' : 'is-weekday',
              c.isWeekday && c.isOff ? 'is-off' : '',
            ]
              .filter(Boolean)
              .join(' ')
            const label = `${String(c.d).padStart(2, '0')}`
            return (
              <button
                key={c.k}
                type="button"
                className={cls}
                aria-pressed={c.isWeekday && c.isOff ? 'true' : 'false'}
                aria-label={`${c.isWeekday ? (c.isOff ? 'Day off' : 'Working day') : 'Weekend'} ${c.k}`}
                onClick={() => onToggle(c.k, c.isWeekday)}
                disabled={!c.isWeekday}
              >
                {label}
              </button>
            )
          })}
          
        </div>
      </div>

      <div className="form-group">
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}


