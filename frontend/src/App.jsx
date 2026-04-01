import React, { useEffect, useState } from 'react'
import Gallery from './components/Gallery'
import AdminPanel from './components/AdminPanel'
import { getMeta, setAdminToken } from './api'

export default function App() {
  const [meta, setMeta] = useState({ images: 0, time_left_seconds: null })
  const [isAdmin, setIsAdmin] = useState(false)

  // --- Naloži meta podatke ---
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

  // Ping backend vsake 5 minut
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://foto-koticek-x9ew.onrender.com/meta")
        .then(res => console.log("Pinged backend:", res.status))
        .catch(err => console.error(err))
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // --- Funkcija za admin login ---
  const adminLogin = () => {
    const password = prompt("Vnesi admin geslo:")
    if (password === "mitja") { // nastavi svoje geslo
      setIsAdmin(true)
      setAdminToken(password)
      alert("Admin dostop omogočen!")
    } else {
      alert("Nepravilno geslo")
    }
  }

  return (
    <div className="container">
      <h1>Skupaj ustvarjamo spomine.</h1>

      {/* Diskreten admin gumb pod naslovom */}
      <button
        style={{ fontSize: '0.8rem', opacity: 0.3, marginBottom: '10px' }}
        onClick={adminLogin}
      >
        Admin
      </button>

      <div className="layout">
        <Gallery onChange={loadMeta} isAdmin={isAdmin} />
        <AdminPanel meta={meta} isAdmin={isAdmin} />
      </div>
    </div>
  )
}
