import React, { useEffect, useState } from 'react'
import { getImages, uploadImage, deleteImage } from '../api'
import { QRCodeCanvas } from 'qrcode.react'

export default function Gallery({ onChange }) {
  const [images, setImages] = useState([])
  const [selectedImg, setSelectedImg] = useState(null) // nova state za izbrano sliko
  const link = `${window.location.origin}/gallery`

  const load = async () => {
    try {
      const res = await getImages()
      setImages(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { load() }, [])

  const handleUpload = async (e) => {
    const f = e.target.files[0]
    if (!f) return

    try {
      await uploadImage(f)
      await load()
      onChange && onChange()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    await deleteImage(id)
    await load()
    onChange && onChange()
  }

  return (
    <div className="card">
      <h2>FOTO KOTIČEK</h2>
      {/*
      <div className="qr">
        <QRCodeCanvas value={link} size={140} />
        <p>{link}</p>
      </div>
      */}

      <div>
        <input type="file" onChange={handleUpload} />
      </div>

      <div className="gallery">
        {images.length === 0 && <p>Ni naloženih slik.</p>}
        {images.map(img => (
          <div className="thumb" key={img.id}>
            <img 
              src={img.url} 
              alt="uploaded" 
              onClick={() => setSelectedImg(img.url)} // ob kliku se slika poveča
            />
            <button className="btn-danger" onClick={() => handleDelete(img.id)}>Izbriši</button>
          </div>
        ))}
      </div>

      {/* Overlay za povečano sliko */}
      {selectedImg && (
        <div 
          className="overlay" 
          onClick={() => setSelectedImg(null)} // klik na overlay zapre sliko
        >
          <img src={selectedImg} alt="Povečana slika" className="enlarged"/>
        </div>
      )}
    </div>
  )
}
