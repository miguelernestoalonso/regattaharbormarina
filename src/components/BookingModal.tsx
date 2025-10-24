
import React, { useState } from 'react'
import { Booking } from '../types'
import { idxToTime } from '../utils/time'

type Props = {
  mode: 'create' | 'edit'
  booking: Booking
  onCancel: () => void
  onSave: (b: Booking) => void
  onDelete?: (id: string) => void
  resources: string[]
}

export default function BookingModal({ mode, booking, onCancel, onSave, onDelete, resources }: Props) {
  const [title, setTitle] = useState(booking.title)
  const [resource, setResource] = useState(booking.resource)
  const [startIdx, setStartIdx] = useState(booking.startIdx)
  const [endIdx, setEndIdx] = useState(booking.endIdx)

  function handleSave() {
    if (endIdx <= startIdx) return
    onSave({ ...booking, title, resource, startIdx, endIdx })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 modal-overlay" onClick={onCancel}></div>

      <div className="relative w-[520px] max-w-[95vw] modal-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">{mode === 'create' ? 'Create appointment' : 'Edit appointment'}</h2>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 items-center">
            <label className="text-sm text-slate-600">Date</label>
            <div className="col-span-2 text-sm text-slate-800">{booking.date}</div>
          </div>

          <div className="grid grid-cols-3 gap-3 items-center">
            <label className="text-sm text-slate-600">Resource</label>
            <select className="col-span-2 border border-slate-300 rounded-md px-2 py-1 text-sm"
              value={resource} onChange={e => setResource(e.target.value)}>
              {resources.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3 items-center">
            <label className="text-sm text-slate-600">Title</label>
            <input className="col-span-2 border border-slate-300 rounded-md px-2 py-1 text-sm"
              value={title} onChange={e => setTitle(e.target.value)} placeholder="Appointment / task" />
          </div>

          <div className="grid grid-cols-3 gap-3 items-center">
            <label className="text-sm text-slate-600">Start time</label>
            <select className="col-span-2 border border-slate-300 rounded-md px-2 py-1 text-sm"
              value={startIdx} onChange={e => setStartIdx(Number(e.target.value))}>
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i} value={i}>{idxToTime(i)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3 items-center">
            <label className="text-sm text-slate-600">End time</label>
            <select className="col-span-2 border border-slate-300 rounded-md px-2 py-1 text-sm"
              value={endIdx} onChange={e => setEndIdx(Number(e.target.value))}>
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i+1} value={i+1}>{idxToTime(i+1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-between">
          {mode === 'edit' ? (
            <button
              className="px-3 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
              onClick={() => onDelete && onDelete(booking.id)}
            >
              Delete
            </button>
          ) : <div />}

          <div className="space-x-2">
            <button className="px-3 py-2 rounded-md border border-slate-300 text-slate-700 bg-white"
              onClick={onCancel}>Cancel</button>
            <button className="px-3 py-2 rounded-md bg-navy text-white"
              onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
