
import React, { useEffect, useMemo, useState } from 'react'
import ResponsiveScaler from './ResponsiveScaler'
import { Booking, Role } from '../types'
import BookingModal from './BookingModal'
import { idxToTime, SLOTS } from '../utils/time'

const RESOURCES = [
  'WR1','WR2','WR3','WR4','WR5','WR6','WR7','WR8','WR9','WR10',
  'SR1','SR2','SR3'
]

type Props = {
  role: Role
  date: string
  onChange: (bookings: Booking[]) => void
  bookings: Booking[]
}

type DragState = null | {
  resource: string
  startIdx: number
  currentIdx: number
}

function overlap(a: Booking, b: Booking) {
  if (a.resource !== b.resource) return false
  return a.startIdx < b.endIdx && b.startIdx < a.endIdx
}

export default function SchedulerGrid({ role, date, bookings, onChange }: Props) {
  const [drag, setDrag] = useState<DragState>(null)
  const [modal, setModal] = useState<null | { mode: 'create'|'edit', booking: Booking }>(null)

// Listen for external "create" requests (from ADMIN quick button)
useEffect(() => {
  function handle(e: any) {
    const b = e.detail
    if (!b) return
    setModal({ mode: 'create', booking: b })
  }
  window.addEventListener('msp:openCreate', handle as EventListener)
  return () => window.removeEventListener('msp:openCreate', handle as EventListener)
}, [])


  function isSelected(resource: string, idx: number) {
    if (!drag) return false
    if (drag.resource !== resource) return false
    const [a, b] = [drag.startIdx, drag.currentIdx].sort((x,y)=>x-y)
    return idx >= a && idx <= b
  }

  function handleMouseDown(resource: string, idx: number) {
    if (role !== 'ADMIN') return
    setDrag({ resource, startIdx: idx, currentIdx: idx })
  }

  function handleMouseEnter(resource: string, idx: number) {
    if (!drag || role !== 'ADMIN') return
    if (drag.resource !== resource) return
    setDrag({ ...drag, currentIdx: idx })
  }

  function handleMouseUp() {
    if (role !== 'ADMIN') return
    if (!drag) return
    const [start, end] = [drag.startIdx, drag.currentIdx].sort((a,b)=>a-b)
    const newBooking: Booking = {
      id: crypto.randomUUID(),
      date,
      resource: drag.resource,
      title: '',
      startIdx: start,
      endIdx: Math.min(end + 1, SLOTS)
    }
    setDrag(null)
    setModal({ mode: 'create', booking: newBooking })
  }

  // Now line
  const nowPos = useMemo(() => {
    const today = new Date()
    const todayISO = today.toISOString().slice(0,10)
    if (todayISO !== date) return null
    const minutes = today.getHours()*60 + today.getMinutes()
    const start = 7*60 + 30
    const end = 17*60 + 30
    if (minutes < start || minutes > end) return null
    const frac = (minutes - start) / (end - start)
    return frac * (SLOTS * 44) // track-height 44px
  }, [date])

  function saveToLocal(next: Booking[]) {
    localStorage.setItem(`msp.bookings:${date}`, JSON.stringify(next))
  }

  function handleCreateSave(b: Booking) {
    const overlaps = bookings.some(x => overlap(x, b))
    if (overlaps) {
      alert('Time conflict on the same resource.')
      return
    }
    const next = [...bookings, b]
    saveToLocal(next)
    onChange(next)
    setModal(null)
  }

  function handleEditSave(b: Booking) {
    const overlaps = bookings.filter(x => x.id !== b.id).some(x => overlap(x, b))
    if (overlaps) {
      alert('Time conflict on the same resource.')
      return
    }
    const next = bookings.map(x => x.id === b.id ? b : x)
    saveToLocal(next)
    onChange(next)
    setModal(null)
  }

  function handleDelete(id: string) {
    const next = bookings.filter(x => x.id !== id)
    saveToLocal(next)
    onChange(next)
    setModal(null)
  }

  function openEdit(b: Booking) {
    if (role !== 'ADMIN') return
    setModal({ mode: 'edit', booking: b })
  }

  const rows = Array.from({ length: SLOTS }, (_, i) => i)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <ResponsiveScaler>
        <div className="grid-container sticky-header">
          <div className="px-3 py-2 text-xs font-semibold text-slate-700 border-l-0">Time</div>
          {RESOURCES.map(r => (
            <div key={r} className="px-3 py-2 text-xs font-semibold text-slate-700 border-l">{r}</div>
          ))}
        </div>
      </ResponsiveScaler>

      {/* Body */}
      <div
        className="relative"
        onMouseLeave={() => setDrag(null)}
        onMouseUp={handleMouseUp}
      >
        {/* Hour + columns grid */}
        <ResponsiveScaler><div className="grid-container">
          {/* Hour column */}
          <div>
            {rows.map(i => (
              <div key={i} className="time-row flex items-center justify-end pr-3 text-xs text-slate-500">
                {idxToTime(i)}
              </div>
            ))}
          </div>

          {/* Resource columns */}
          {RESOURCES.map(resource => (
            <div key={resource} className="">
              {/* Cells */}
              {rows.map(i => (
                <div
                  key={i}
                  className={`time-row cell ${isSelected(resource, i) ? 'selected' : ''}`}
                  onMouseDown={() => handleMouseDown(resource, i)}
                  onMouseEnter={() => handleMouseEnter(resource, i)}
                />
              ))}

              {/* Blocks layer */}
              <div className="col-blocks pointer-events-none">
                {bookings.filter(b => b.resource === resource).map(b => {
                  const top = b.startIdx * 44
                  const height = (b.endIdx - b.startIdx) * 44
                  return (
                    <div
                      key={b.id}
                      className={`booking-block ${role === 'TV' ? 'tv' : ''} pointer-events-auto`}
                      style={{ top, height }}
                      onClick={() => openEdit(b)}
                      title={`${b.title} • ${idxToTime(b.startIdx)}–${idxToTime(b.endIdx)}`}
                    >
                      <div className="text-[12px] leading-tight booking-title">{b.title || '(Untitled)'}</div>
                      <div className="text-[11px] booking-time">{idxToTime(b.startIdx)}–{idxToTime(b.endIdx)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div></ResponsiveScaler>

        {/* Now line */}
        {nowPos !== null && (
          <div className="now-line" style={{ top: nowPos }} />
        )}
      </div>

      {modal && (
        <BookingModal
          mode={modal.mode}
          booking={modal.booking}
          onCancel={() => setModal(null)}
          onSave={modal.mode === 'create' ? handleCreateSave : handleEditSave}
          onDelete={modal.mode === 'edit' ? handleDelete : undefined}
          resources={RESOURCES}
        />
      )}
    </div>
  )
}
