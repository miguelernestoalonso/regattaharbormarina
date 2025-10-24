
export const START_HOUR = 7
export const START_MIN = 30
export const SLOTS = 20
export const SLOT_MIN = 30

export function idxToTime(idx: number): string {
  const totalMin = (START_HOUR * 60 + START_MIN) + idx * SLOT_MIN
  const hh = Math.floor(totalMin / 60)
  const mm = totalMin % 60
  const hStr = String(hh).padStart(2, '0')
  const mStr = String(mm).padStart(2, '0')
  return `${hStr}:${mStr}`
}

export function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDaysISO(iso: string, delta: number): string {
  const [y,m,d] = iso.split('-').map(Number)
  const dt = new Date(y, m-1, d)
  dt.setDate(dt.getDate() + delta)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth()+1).padStart(2,'0')
  const dd = String(dt.getDate()).padStart(2,'0')
  return `${yy}-${mm}-${dd}`
}
