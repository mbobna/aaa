import React, { useEffect, useState } from 'react'
import { getImages, uploadImage, deleteImage } from '../api'

export default function Gallery({ onChange, isAdmin, adminToken }) {
  const [images, setImages] = useState([])
  const [selectedImg, setSelectedImg] = useState(null)

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
    if (!isAdmin) return
    await deleteImage(id, adminToken)
    await load()
    onChange && onChange()
  }

  return (
    <div className="card">
      <h2>FOTO KOTIČEK</h2>
      <input type="file" onChange={handleUpload} />

      <div className="gallery">
        {images.length === 0 && <p>Ni naloženih slik.</p>}
        {images.map(img => (
          <div className="thumb" key={img.id}>
            <img
              src={img.url}
              alt="uploaded"
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
          <img src={selectedImg} alt="Povečana slika" style={{ maxWidth: '95%', maxHeight: '95%' }} />
        </div>
      )}
    </div>
  )
}
