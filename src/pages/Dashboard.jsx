import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db, signOutUser } from '../lib/firebase.js'
import { toDateKey, toMonthKey } from '../lib/date.js'
import { computeMonthStats } from '../lib/metrics.js'
import Header from '../components/Header.jsx'
import AddTicketForm from '../components/AddTicketForm.jsx'
import TicketList from '../components/TicketList.jsx'
import MonthStats from '../components/MonthStats.jsx'
import MonthSettings from '../components/MonthSettings.jsx'

const TZ = 'America/Sao_Paulo'

export default function Dashboard({ user }) {
  const [monthKey, setMonthKey] = useState(toMonthKey(new Date(), TZ))
  const [todayKey, setTodayKey] = useState(toDateKey(new Date(), TZ))
  const [ticketsToday, setTicketsToday] = useState([])
  const [ticketsMonth, setTicketsMonth] = useState([])
  const [monthDoc, setMonthDoc] = useState({ monthlyGoal: 0, extraTaskHours: 0, daysOff: [] })

  useEffect(() => {
    // Update todayKey hourly (simple)
    const id = setInterval(() => setTodayKey(toDateKey(new Date(), TZ)), 60 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const col = collection(db, 'users', user.uid, 'tickets')
    const q = query(col, where('dateKey', '==', todayKey))
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      arr.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setTicketsToday(arr)
    })
    return () => unsub()
  }, [user.uid, todayKey])

  useEffect(() => {
    const col = collection(db, 'users', user.uid, 'tickets')
    const q = query(col, where('monthKey', '==', monthKey))
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      arr.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setTicketsMonth(arr)
    })
    return () => unsub()
  }, [user.uid, monthKey])

  useEffect(() => {
    const ref = doc(db, 'users', user.uid, 'months', monthKey)
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() || { monthlyGoal: 0, extraTaskHours: 0, daysOff: [] }
      setMonthDoc({
        monthlyGoal: Number(data.monthlyGoal || 0),
        extraTaskHours: Number(data.extraTaskHours || 0),
        daysOff: Array.isArray(data.daysOff) ? data.daysOff : [],
      })
    })
    return () => unsub()
  }, [user.uid, monthKey])

  const stats = useMemo(() => computeMonthStats({
    ticketsForMonth: ticketsMonth,
    monthDoc,
    today: new Date(),
    tz: TZ,
    selectedMonthKey: monthKey,
  }), [ticketsMonth, monthDoc, monthKey])

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'users', user.uid, 'tickets', id))
  }

  return (
    <div className="container">
      <Header monthKey={monthKey} onChangeMonthKey={setMonthKey} onSignOut={signOutUser} />

      <div className="grid grid-2">
        <div className="card">
          <div className="title">Quick Add</div>
          <AddTicketForm
            user={user}
            monthKey={monthKey}
            dateKey={todayKey}
            existingToday={ticketsToday}
          />
        </div>

        <div className="card">
          <div className="title">Month Stats</div>
          <MonthStats stats={stats} monthDoc={monthDoc} />
        </div>
      </div>

      <div className="grid" style={{ marginTop: 'var(--space-4)' }}>
        <div className="card">
          <div className="space-between">
            <div className="title">Today’s Tickets</div>
            <div className="muted">{todayKey}</div>
          </div>
          <TicketList tickets={ticketsToday} onDelete={handleDelete} />
        </div>

        <div className="card">
          <div className="title">Month Settings</div>
          <MonthSettings user={user} monthKey={monthKey} value={monthDoc} />
        </div>
      </div>

      {/* TODO V1: edit ticket; per-day view; exports */}
    </div>
  )
}


