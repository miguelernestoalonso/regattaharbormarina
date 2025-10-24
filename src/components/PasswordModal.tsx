
import React, { useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (value: string) => void
}

export default function PasswordModal({ open, onClose, onSubmit }: Props) {
  const [value, setValue] = useState('')

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 modal-overlay" onClick={onClose} />
      <div className="relative w-[420px] max-w-[95vw] modal-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">ADMIN access</h2>
        <p className="text-sm text-slate-500 mb-4">Enter the ADMIN password to enable editing.</p>
        <input
          type="password"
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm mb-4"
          placeholder="Password"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onSubmit(value) }}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSubmit(value)}>Continue</button>
        </div>
      </div>
    </div>
  )
}
