import { useEffect, useMemo, useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { toMonthKey } from '../lib/date.js'

const TZ = 'America/Sao_Paulo'

export default function MonthSettings({ user, monthKey, value }) {
  const [form, setForm] = useState({ monthlyGoal: 0, extraTaskHours: 0, daysOff: [] })
  useEffect(() => {
    setForm({
      monthlyGoal: Number(value?.monthlyGoal || 0),
      extraTaskHours: Number(value?.extraTaskHours || 0),
      daysOff: Array.isArray(value?.daysOff) ? value.daysOff : [],
    })
  }, [value])

  const days = useMemo(() => {
    const [y, m] = monthKey.split('-').map(Number)
    const end = new Date(y, m, 0).getDate()
    const list = []
    for (let d = 1; d <= end; d++) {
      const dt = new Date(y, m - 1, d)
      const dow = dt.getDay()
      if (dow >= 1 && dow <= 5) {
        list.push(`${monthKey}-${String(d).padStart(2, '0')}`)
      }
    }
    return list
  }, [monthKey])

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
        <div className="muted" style={{ marginBottom: 'var(--space-1)' }}>Days off (weekdays)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--space-1)' }}>
          {days.map((k) => (
            <label key={k} className="row" style={{ gap: 'var(--space-1)' }}>
              <input
                type="checkbox"
                checked={form.daysOff.includes(k)}
                onChange={() => toggleDayOff(k)}
                aria-label={`Day off ${k}`}
              />
              <span className="muted" style={{ fontSize: 12 }}>{k.slice(-2)}</span>
            </label>
          ))}
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


