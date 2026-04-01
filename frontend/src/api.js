import axios from 'axios'

const API = 'https://foto-koticek-x9ew.onrender.com'

export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return axios.post(`${API}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getImages = () => axios.get(`${API}/images`)

// admin delete zahteva token
export const deleteImage = (id, adminToken) =>
  axios.delete(`${API}/admin/delete/${id}`, {
    headers: { 'Admin-Token': adminToken }
  })

export const getMeta = () => axios.get(`${API}/meta`)
