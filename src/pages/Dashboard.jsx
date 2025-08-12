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
import SettingsOverlay from '../SettingsOverlay.jsx'

const TZ = 'America/Sao_Paulo'

export default function Dashboard({ user }) {
  const [monthKey, setMonthKey] = useState(toMonthKey(new Date(), TZ))
  const [todayKey, setTodayKey] = useState(toDateKey(new Date(), TZ))
  const [ticketsToday, setTicketsToday] = useState([])
  const [ticketsMonth, setTicketsMonth] = useState([])
  const [monthDoc, setMonthDoc] = useState({ monthlyGoal: 0, extraTaskHours: 0, daysOff: [] })
  const [settingsOpen, setSettingsOpen] = useState(false)

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

  function StatCard({ label, value }) {
    return (
      <div className="grid">
        <div className="muted">{label}</div>
        <div style={{ fontWeight: 600, fontSize: 24 }}>{value}</div>
      </div>
    )
  }

  return (
    <div className="container">
      <Header
        monthKey={monthKey}
        onChangeMonthKey={setMonthKey}
        onSignOut={signOutUser}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Two main columns */}
      <div className="dashboard-grid">

        {/* ===== Left main column ===== */}
        <section className="left-col">

          {/* Row 1: Quick Add (single wide card) */}
          <div className="card">
            <div className="title">Quick Add</div>
            <AddTicketForm
              user={user}
              monthKey={monthKey}
              dateKey={todayKey}
              existingToday={ticketsToday}
            />
          </div>

          {/* Row 2: two internal columns */}
          <div className="left-row-2">
            <div className="card">
              <div className="title">Daily total</div>
              <StatCard label="Today" value={ticketsToday.length} />
            </div>

            <div className="card">
              <div className="title">Needed per workday</div>
              <StatCard label="To goal" value={stats.ticketsPerDayToGoal ?? 0} />
            </div>
          </div>

          {/* Row 3: two internal columns */}
          <div className="left-row-3">
            <div className="card">
              <div className="title">Daily average</div>
              <StatCard label="So far" value={(stats.adjustedDailyAverage ?? 0).toFixed(1)} />
            </div>

            <div className="card">
              <div className="title">Remaining</div>
              <StatCard label="Tickets left" value={stats.remaining ?? 0} />
            </div>
          </div>
        </section>

        {/* ===== Right main column ===== */}
        <section className="right-col">

          {/* Rows 1 & 2: Ticket list spans two rows, full width of right column */}
          <div className="card right-ticketlist">
            <div className="space-between">
              <div className="title">Day’s Tickets</div>
              <div className="muted">{todayKey}</div>
            </div>
            <div className="ticket-list-scroll">
              <TicketList tickets={ticketsToday} onDelete={handleDelete} />
            </div>
          </div>

          {/* Row 3: Wide card with days off + extra task hours summary */}
          <div className="card right-summary">
            <div className="title">Month summary</div>
            <div className="grid">
              <div className="row">
                <div className="muted">Days off</div>
                <div style={{ marginLeft: 'auto' }}>{monthDoc.daysOff?.length || 0}</div>
              </div>
              <div className="row">
                <div className="muted">Extra task hours</div>
                <div style={{ marginLeft: 'auto' }}>{monthDoc.extraTaskHours || 0}</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Settings overlay */}
      <SettingsOverlay
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        monthKey={monthKey}
        value={monthDoc}
      />

      {/* TODO V1: edit ticket; per-day view; exports */}
    </div>
  )
}


