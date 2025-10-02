import axios from 'axios'

// uporabi vedno HTTPS, ker Render uporablja SSL
const API = 'https://foto-koticek-x9ew.onrender.com'

export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return axios.post(`${API}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const getImages = () => axios.get(`${API}/images`)
export const deleteImage = (id) => axios.delete(`${API}/delete/${id}`)
export const getMeta = () => axios.get(`${API}/meta`)
