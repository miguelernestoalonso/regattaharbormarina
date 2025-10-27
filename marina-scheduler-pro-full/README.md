# Marina Scheduler Pro — TV Controls + Light Theme + Alignment Fix

## Includes
- Light, professional theme (legible dark text, blue accents)
- Exact block alignment (08:00–17:00, 30-min slots)
- TV Controls: **Previous**, **Next**, **Mon–Fri**, **Today**
- Per-day storage:
  - Supabase (if env configured)
  - Fallback: localStorage `msp.bookings:YYYY-MM-DD`

## Setup
```bash
npm install
npm run dev
npm run build
npm run preview
```

## Supabase
Create table:
```sql
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  date text not null,
  resource text not null,
  title text not null,
  start_idx int not null,
  end_idx int not null
);
create index on bookings (date, resource);
```

Create a `.env` from `.env.example`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Deploy
- Vercel or Netlify
- Framework: **Vite**, Output: `dist`