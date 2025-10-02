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

  // Funkcija za resize slike pred uploadom (za mobilne naprave)
  const resizeImage = (file, maxWidth = 1024, maxHeight = 1024) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        if (width > maxWidth) {
          height = (maxWidth / width) * height
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (maxHeight / height) * width
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(blob => resolve(new File([blob], file.name, { type: file.type })), file.type, 0.9)
      }
    })
  }

  const handleUpload = async (e) => {
    const f = e.target.files[0]
    if (!f) return

    try {
      const resizedFile = await resizeImage(f)
      await uploadImage(resizedFile)
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
      <h2>Moj rojstni dan</h2>

      {/* Zakomentiran QR del */}
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
              style={{ maxWidth: '100%', height: 'auto', cursor: 'pointer' }}
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
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <img 
            src={selectedImg} 
            alt="Povečana slika" 
            style={{ maxWidth: '95%', maxHeight: '95%' }}
          />
        </div>
      )}
    </div>
  )
}
