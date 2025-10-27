# Marina Scheduler Pro

**Marina Scheduler Pro** — operativo diario (08:00–17:00), con persistencia local y vista TV/ADMIN.

## Requisitos
- Node.js 20.x
- npm

## Instalación
```bash
npm install
```

## Desarrollo
```bash
npm run dev
```

## Build (para producción)
```bash
npm run build
```
El resultado queda en `dist/`.

## Vista previa local del build
```bash
npm run preview
```

## Despliegue en Vercel (recomendado)
1. Sube esta carpeta a un repositorio de GitHub llamado `marina-scheduler-pro`.
2. En Vercel → **Import Project from GitHub** → selecciona el repo.
3. Configuración:
   - Framework Preset: **Vite**
   - Install Command: **npm install**
   - Build Command: **npm run build**
   - Output Directory: **dist**
4. **Deploy**.

> Variables de entorno (opcional): si usas contraseña ADMIN, crea `VITE_ADMIN_PASS` en **Settings → Environment Variables**.

## Despliegue en Netlify (opcional)
- **Publish directory**: `dist`
- **Build command**: `npm run build`
- **Node**: 20 (usa `.nvmrc` o setéalo en el panel)
- Para SPA, incluye `public/_redirects` con:
  ```
  /* /index.html 200
  ```

## Notas del calendario
- Horario fijo: **08:00–17:00** (30 min por fila, 18 filas).
- Recursos: **WR1–WR10, SR1–SR3**.
- Modo **TV**: solo visualización.
- Modo **ADMIN**: crear/editar/eliminar.
- Persistencia local: `localStorage` con clave `msp.bookings:YYYY-MM-DD`.
- Los bloques se renderizan **solo en su columna** (overlay por columna) y **en la hora exacta** (`--track-height` sincronizada CSS/JS).

---

© marina-scheduler-pro
