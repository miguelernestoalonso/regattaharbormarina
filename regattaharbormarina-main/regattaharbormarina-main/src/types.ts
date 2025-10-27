
export type Role = 'TV' | 'ADMIN'

export type Booking = {
  id: string
  date: string // YYYY-MM-DD
  resource: string // WR1..WR10, SR1..SR3
  title: string
  startIdx: number // inclusive, 0..19
  endIdx: number   // exclusive, 1..20
}
