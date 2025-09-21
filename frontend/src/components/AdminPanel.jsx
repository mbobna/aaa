import React from 'react'

export default function AdminPanel({ meta }) {
  const formatTime = (s) => {
    if (!s) return '-'
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h}h ${m}m ${sec}s`
  }

  return (
    <div className="card admin">
      # <h2>Admin</h2>
      # <p>Št. slik: <strong>{meta.images}</strong></p>
      # <p>Čas do izbrisa: <strong>{formatTime(meta.time_left_seconds)}</strong></p>
      # <p>QR odjemalci vidijo galerijo na /gallery</p>
    </div>
  )
}
