import axios from 'axios'
const API = 'http://127.0.0.1:5000'

export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return axios.post(`${API}/upload`, formData)
}

export const getImages = () => axios.get(`${API}/images`)
export const deleteImage = (id) => axios.delete(`${API}/delete/${id}`)
export const getMeta = () => axios.get(`${API}/meta`) 