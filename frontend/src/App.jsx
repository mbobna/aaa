import React, { useEffect, useState } from 'react'
import Gallery from './components/Gallery'
import AdminPanel from './components/AdminPanel'
import { getMeta } from './api'

export default function App() {
  const [meta, setMeta] = useState({ images: 0, time_left_seconds: null })
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminToken, setAdminToken] = useState('')

  const loadMeta = async () => {
    try {
      const res = await getMeta()
      setMeta(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadMeta()
    const t = setInterval(loadMeta, 5000)
    return () => clearInterval(t)
  }, [])

  const handleAdminLogin = () => {
    const password = prompt("Vnesi admin geslo:")
    if (password === process.env.REACT_APP_ADMIN_PASSWORD || password === "mitja") {
      setIsAdmin(true)
      setAdminToken(password)
    } else {
      alert("Napačno geslo!")
    }
  }

  return (
    <div className="container">
      <h1>Skupaj ustvarjamo spomine.</h1>
      {!isAdmin && (
        <button className="btn-upload" onClick={handleAdminLogin}>Prijava kot admin</button>
      )}
      <Gallery onChange={loadMeta} isAdmin={isAdmin} adminToken={adminToken} />
      <AdminPanel meta={meta} />
    </div>
  )
}
