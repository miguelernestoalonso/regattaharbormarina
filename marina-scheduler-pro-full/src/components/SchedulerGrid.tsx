import React, { useEffect, useMemo, useRef, useState } from 'react'
import { SLOTS, idxToTime, clampBookingIdx } from '../utils/time'

type Role = 'ADMIN' | 'TV'
export type Booking = { id:string; date:string; resource:string; title:string; startIdx:number; endIdx:number }

type Props = {
  role: Role
  date: string
  bookings: Booking[]
  onCreate: (b: Booking) => void
  onEdit: (b: Booking) => void
  resources: string[]
}

export default function SchedulerGrid({ role, date, bookings, onCreate, onEdit, resources }: Props){
  const [trackPx, setTrackPx] = useState(48)
  const gridBodyRef = useRef<HTMLDivElement|null>(null)
  const isAdmin = role === 'ADMIN'

  useEffect(() => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--track-height')
    const px = parseFloat(raw); if (!Number.isNaN(px) && px>0) setTrackPx(px)
  }, [])

  const rows = useMemo(() => Array.from({ length: SLOTS }, (_, i) => i), [])
  const [drag, setDrag] = useState<{res?: string, start?: number, end?: number} | null>(null)

  function clientYToIdx(clientY: number){
    const el = gridBodyRef.current; if (!el) return 0
    const r = el.getBoundingClientRect(); const y = clientY - r.top + el.scrollTop
    return Math.max(0, Math.min(SLOTS, Math.round(y / trackPx)))
  }

  function handleMouseDown(res: string, e: React.MouseEvent){
    if (!isAdmin) return
    const idx = clientYToIdx(e.clientY)
    setDrag({ res, start: idx, end: idx })
  }
  function handleMouseMove(e: React.MouseEvent){
    if (!drag || !isAdmin) return
    const idx = clientYToIdx(e.clientY)
    setDrag(prev => prev ? { ...prev, end: idx } : prev)
  }
  function handleMouseUp(){
    if (!drag || !isAdmin || drag.start==null || drag.end==null || !drag.res) { setDrag(null); return }
    const s=Math.min(drag.start,drag.end), e=Math.max(drag.start,drag.end)
    const { startIdx, endIdx } = clampBookingIdx(s,e)
    if (endIdx-startIdx<1){ setDrag(null); return }
    onCreate({ id: crypto.randomUUID(), date, resource: drag.res, title:'New booking', startIdx, endIdx })
    setDrag(null)
  }

  return (
    <div className="grid" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {/* time column */}
      <div className="time-col">
        <div className="header-cell muted">Hour</div>
        <div className="grid-body" ref={gridBodyRef}>
          {rows.map(i => <div className="time-label" key={i}>{idxToTime(i)}</div>)}
        </div>
      </div>

      {/* resource columns */}
      {resources.map(res => {
        const items = bookings.filter(b => b.date===date && b.resource===res)
        const inRange = drag && drag.res===res ? clampBookingIdx(Math.min(drag.start!,drag.end!), Math.max(drag.start!,drag.end!)) : null
        return (
          <div key={res} className="col" onMouseDown={(e)=>handleMouseDown(res,e)}>
            <div className="header-cell">{res}</div>
            <div className="grid-body">
              {rows.map(i => <div key={i} className="cell" />)}
              <div className="col-blocks">
                {items.map(b => (
                  <div
                    key={b.id}
                    className="booking-block"
                    style={{ top: b.startIdx*trackPx, height: (b.endIdx-b.startIdx)*trackPx }}
                    onClick={() => isAdmin && onEdit(b)}
                  >
                    <div className="booking-title">{b.title}</div>
                    <div className="booking-time">{idxToTime(b.startIdx)}–{idxToTime(b.endIdx)}</div>
                  </div>
                ))}
                {isAdmin && inRange && (
                  <div className="booking-block"
                    style={{ top: inRange.startIdx*trackPx, height: (inRange.endIdx-inRange.startIdx)*trackPx, opacity:.35 }} />
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}