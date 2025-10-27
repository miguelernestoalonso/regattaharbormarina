
import React, { useEffect, useMemo, useState } from 'react'
import SchedulerGrid from './components/SchedulerGrid'
import PasswordModal from './components/PasswordModal'
import { Booking, Role } from './types'
import { todayISO, addDaysISO } from './utils/time'

const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'admin123'

function loadBookings(date: string): Booking[] {
  try {
    const raw = localStorage.getItem(`msp.bookings:${date}`)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export default function App() {
  const [role, setRole] = useState<Role>('TV')
  const [adminAuth, setAdminAuth] = useState(false)
  const [date, setDate] = useState(todayISO())
  const [pwdOpen, setPwdOpen] = useState(false)
  const [tvDark, setTvDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    if (role === 'TV' || (role === 'ADMIN' && !adminAuth)) {
      root.classList.add('tv-mode')
    } else {
      root.classList.remove('tv-mode')
    }
    if (tvDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [role, adminAuth, tvDark])
  const [bookings, setBookings] = useState<Booking[]>(() => loadBookings(todayISO()))

  useEffect(() => {
    setBookings(loadBookings(date))
  }, [date])


function onAdminPasswordSubmit(p: string) {
  if (p === ADMIN_PASS) {
    setRole('ADMIN')
    setAdminAuth(true)
    setPwdOpen(false)
  } else {
    alert('Incorrect password')
  }
}
  const canEdit = role === 'ADMIN' && adminAuth

  
function handleRoleChange(next: Role) {
  if (next === 'TV') {
    setRole('TV')
    setAdminAuth(false)
    return
  }
  // Show professional modal
  setPwdOpen(true)
}


  // Admin quick-create
  
function scheduleNow() {
  if (!canEdit) return
  // default to WR1, nearest next slot within schedule
  const now = new Date()
  const startHourMin = 7*60 + 30
  const minutes = now.getHours()*60 + now.getMinutes()
  let startIdx = 0
  if (minutes > startHourMin) {
    startIdx = Math.min(19, Math.floor((minutes - startHourMin) / 30))
  }
  const detail = {
    id: crypto.randomUUID(),
    date,
    resource: 'WR1',
    title: '',
    startIdx,
    endIdx: Math.min(startIdx + 1, 20)
  }
  window.dispatchEvent(new CustomEvent('msp:openCreate', { detail }))
}



function isoForWeekday(baseISO: string, weekday: number): string {
  // weekday: 1=Mon ... 7=Sun
  const [y,m,d] = baseISO.split('-').map(Number)
  const dt = new Date(y, m-1, d)
  // JS: 0=Sun..6=Sat -> convert to 1..7
  const js = dt.getDay() // 0..6
  const current = js === 0 ? 7 : js
  const delta = weekday - current
  const nd = new Date(dt)
  nd.setDate(dt.getDate() + delta)
  const yy = nd.getFullYear()
  const mm = String(nd.getMonth()+1).padStart(2,'0')
  const dd = String(nd.getDate()).padStart(2,'0')
  return `${yy}-${mm}-${dd}`
}

  const tvNav = role === 'TV' || (role === 'ADMIN' && !adminAuth)

  return (
    <div className="app-shell mx-auto p-4">
      {/* Top controls */}
      <div className="topbar mb-4 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Role:</span>
          <select
            className="border border-slate-300 rounded-md px-2 py-1 text-sm"
            value={role}
            onChange={e => handleRoleChange(e.target.value as Role)}
          >
            <option value="TV">TV (View only)</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Date:</span>
          <input
            type="date"
            className="border border-slate-300 rounded-md px-2 py-1 text-sm"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {/* TV day-by-day navigation */}
        {tvNav && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={tvDark} onChange={e => setTvDark(e.target.checked)} />
              <span>TV Dark mode</span>
            </label>
            <button
              onClick={() => setDate(d => addDaysISO(d, -1))}
              className="px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              Previous day
            </button>
            <button
              onClick={() => setDate(d => addDaysISO(d, +1))}
              className="px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              Next day
            </button>
          </div>
        )}

        {/* ADMIN quick schedule button (no "clear day" button anymore) */}
        {canEdit && (
          <button
            onClick={scheduleNow}
            className="ml-auto px-3 py-2 rounded-md bg-navy text-white"
          >
            Schedule appointment
          </button>
        )}
      </div>

      <PasswordModal open={pwdOpen} onClose={() => setPwdOpen(false)} onSubmit={onAdminPasswordSubmit} />

      <SchedulerGrid
        role={canEdit ? 'ADMIN' : 'TV'}
        date={date}
        bookings={bookings}
        onChange={setBookings}
      />

      <div className="mt-4 text-[12px] text-slate-500">
        View = TV (no edits). Admin requires password. Blocks are light blue with white text.
      </div>
    </div>
  )
}
