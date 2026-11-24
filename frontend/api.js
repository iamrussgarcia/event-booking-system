import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
})

// attach auth token from localStorage if you have one
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('spotlight.token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default API