import axios from 'axios'

const API = 'https://foto-koticek-x9ew.onrender.com' // tvoj Render URL

let adminToken = null
export const setAdminToken = (token) => { adminToken = token }

export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return axios.post(`${API}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getImages = () => axios.get(`${API}/images`)

export const deleteImage = (id) => {
  if (!adminToken) return Promise.reject(new Error('Niste prijavljeni kot admin'))
  return axios.delete(`${API}/admin/delete/${id}`, {
    headers: { 'Admin-Token': adminToken }
  })
}

export const getMeta = () => axios.get(`${API}/meta`)
