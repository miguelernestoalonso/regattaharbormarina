import React, { useEffect, useState } from 'react'
import SchedulerGrid, { type Booking } from './components/SchedulerGrid'
import { clampBookingIdx, idxToTime } from './utils/time'
import { hasSupabase, supabase } from './lib/supabase'

type Role = 'ADMIN' | 'TV'

function toISO(d: Date) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}
function fromISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d); dt.setHours(0,0,0,0); return dt
}
function startOfWeekMonday(dateISO: string) {
  const d = fromISO(dateISO); const js = d.getDay(); const diff = (js === 0 ? -6 : 1 - js); d.setDate(d.getDate() + diff); return d
}
function addDaysISO(dateISO: string, delta: number) {
  const d = fromISO(dateISO); d.setDate(d.getDate() + delta); return toISO(d)
}
function sameWeekSetWeekday(dateISO: string, weekdayMon1toFri5: number) {
  const monday = startOfWeekMonday(dateISO); monday.setDate(monday.getDate() + (weekdayMon1toFri5 - 1)); return toISO(monday)
}
function weekdayMon1toSun7(dateISO: string) {
  const d = fromISO(dateISO); const js = d.getDay(); return js === 0 ? 7 : js
}

const RESOURCES = ['WR1','WR2','WR3','WR4','WR5','WR6','WR7','WR8','WR9','WR10','SR1','SR2','SR3']

export default function App(){
  const [role, setRole] = useState<Role>('TV')
  const [date, setDate] = useState<string>(toISO(new Date()))
  const [bookings, setBookings] = useState<Booking[]>([])
  const isTV = role === 'TV'

  // Load per-day
  useEffect(() => {
    (async () => {
      if (hasSupabase) {
        const { data, error } = await supabase.from('bookings').select('*').eq('date', date).order('start_idx', { ascending: true })
        if (!error && data) {
          setBookings(data.map((r:any) => ({
            id: r.id, date: r.date, resource: r.resource, title: r.title, startIdx: r.start_idx, endIdx: r.end_idx
          })))
          return
        }
      }
      const raw = localStorage.getItem(`msp.bookings:${date}`)
      setBookings(raw ? JSON.parse(raw) : [])
    })()
  }, [date])

  // Persist per-day (Supabase if available, else localStorage)
  useEffect(() => {
    (async () => {
      if (hasSupabase) {
        await supabase.from('bookings').delete().eq('date', date)
        if (bookings.length) {
          await supabase.from('bookings').insert(bookings.map(b => ({
            id: b.id, date: b.date, resource: b.resource, title: b.title, start_idx: b.startIdx, end_idx: b.endIdx
          })))
        }
      } else {
        localStorage.setItem(`msp.bookings:${date}`, JSON.stringify(bookings))
      }
    })()
  }, [bookings, date])

  const wk = weekdayMon1toSun7(date)
  const tvWeekdayValue = Math.min(5, Math.max(1, wk))

  function handlePrevDay(){ setDate(prev => addDaysISO(prev, -1)) }
  function handleNextDay(){ setDate(prev => addDaysISO(prev, +1)) }
  function handleToday(){ setDate(toISO(new Date())) }
  function handleSelectWeekday(e: React.ChangeEvent<HTMLSelectElement>){
    const wd = Number(e.target.value); setDate(prev => sameWeekSetWeekday(prev, wd))
  }

  function createBooking(b: Booking){
    const collision = bookings.some(x => x.resource === b.resource && !(b.endIdx <= x.startIdx || b.startIdx >= x.endIdx))
    if (collision) { alert('Overlap not allowed on the same resource.'); return }
    setBookings(prev => [...prev, b])
  }

  function editBooking(b: Booking){
    if (role !== 'ADMIN') return
    const title = prompt('Edit title', b.title) ?? b.title
    const nb = { ...b, title }
    setBookings(prev => prev.map(x => x.id === b.id ? nb : x))
  }

  return (
    <div className="scheduler-root">
      <div className="topbar">
        <div className="topbar-left">
          <span className="role-badge">Role:</span>
          <select className="select" value={role} onChange={e => setRole(e.target.value as Role)}>
            <option value="TV">TV</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <span className="role-badge">Date:</span>
          <input type="date" className="select" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div className="topbar-right">
          {isTV && (
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button className="button" onClick={handlePrevDay}>Previous day</button>
              <label className="role-badge" htmlFor="tv-weekday-select">Mon–Fri</label>
              <select id="tv-weekday-select" className="select" value={tvWeekdayValue} onChange={handleSelectWeekday}>
                <option value={1}>Mon</option><option value={2}>Tue</option>
                <option value={3}>Wed</option><option value={4}>Thu</option>
                <option value={5}>Fri</option>
              </select>
              <button className="button" onClick={handleNextDay}>Next day</button>
              <button className="button" onClick={handleToday}>Today</button>
            </div>
          )}
        </div>
      </div>

      <div className="header">
        <div className="header-cell muted">Hour</div>
        {RESOURCES.map(r => <div key={r} className="header-cell">{r}</div>)}
      </div>

      <SchedulerGrid
        role={role}
        date={date}
        bookings={bookings}
        onCreate={createBooking}
        onEdit={editBooking}
        resources={RESOURCES}
      />
    </div>
  )
}