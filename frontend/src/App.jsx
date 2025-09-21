import React, { useEffect, useState } from 'react'
import Gallery from './components/Gallery'
import AdminPanel from './components/AdminPanel'
import { getMeta } from './api'

export default function App() {
  const [meta, setMeta] = useState({ images: 0, time_left_seconds: null })

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

  // v frontend App.jsx ali v glavnem React komponentu
useEffect(() => {
  const interval = setInterval(() => {
    fetch("https://tvoj-render-url.onrender.com/meta")
      .then(res => console.log("Pinged backend:", res.status))
      .catch(err => console.error(err))
  }, 5 * 60 * 1000); // vsake 5 minut

  return () => clearInterval(interval);
}, []);


  return (
    <div className="container">
      <h1>Skupaj ustvarjamo spomine.</h1>
      <div className="layout">
        <Gallery onChange={loadMeta} />
        <AdminPanel meta={meta} />
      </div>
    </div>
  )
}