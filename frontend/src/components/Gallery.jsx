import React, { useEffect, useState } from 'react'
import { getImages, uploadImage, deleteImage } from '../api'

export default function Gallery({ onChange, isAdmin, adminToken }) {
  const [images, setImages] = useState([])
  const [selectedImg, setSelectedImg] = useState(null)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    try {
      const res = await getImages()
      setImages(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { load() }, [])

  // 🔥 Resize + kompresija slike
  const resizeImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.85) => {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        let width = img.width
        let height = img.height

        // Če je slika že majhna → ne resize-aj
        if (width <= maxWidth && height <= maxHeight) {
          resolve(file)
          return
        }

        const canvas = document.createElement('canvas')

        if (width > height) {
          height *= maxWidth / width
          width = maxWidth
        } else {
          width *= maxHeight / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          },
          'image/jpeg',
          quality
        )
      }

      img.src = url
    })
  }

  const handleUpload = async (e) => {
    const f = e.target.files[0]
    if (!f) return

    try {
      setUploading(true)

      const resizedFile = await resizeImage(f)
      await uploadImage(resizedFile)

      await load()
      onChange && onChange()
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!isAdmin) return
    await deleteImage(id, adminToken)
    await load()
    onChange && onChange()
  }

  return (
    <div className="card">
      <h2>FOTO KOTIČEK</h2>

      <input type="file" className="btn-danger" onChange={handleUpload} />

      {uploading && <p>Nalaganje slike...</p>}

      <div className="gallery">
        {images.length === 0 && <p>Ni naloženih slik.</p>}
        {images.map(img => (
          <div className="thumb" key={img.id}>
            <img
              src={img.url}
              alt="uploaded"
              loading="lazy"
              onClick={() => setSelectedImg(img.url)}
              style={{ maxWidth: '100%', height: 'auto', cursor: 'pointer' }}
            />

            {isAdmin && (
              <button className="btn-danger" onClick={() => handleDelete(img.id)}>
                Izbriši
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedImg && (
        <div className="overlay" onClick={() => setSelectedImg(null)}>
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
