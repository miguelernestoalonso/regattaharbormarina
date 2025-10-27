export const START_HOUR = 8
export const START_MIN  = 0
export const SLOT_MIN   = 30
export const SLOTS      = 18  // 08:00–17:00, 30 min/slot

export function clampBookingIdx(startIdx: number, endIdx: number){
  const s = Math.max(0, Math.min(startIdx, SLOTS - 1))
  const e = Math.max(s + 1, Math.min(endIdx, SLOTS))
  return { startIdx: s, endIdx: e }
}

export function idxToTime(idx: number){
  const base = START_HOUR*60 + START_MIN
  const t = base + idx*SLOT_MIN
  const h = Math.floor(t / 60)
  const m = t % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
}

export function timeToIdx(h: number, m: number){
  const base = START_HOUR*60 + START_MIN
  const t = h*60 + m
  return Math.round((t - base) / SLOT_MIN)
}