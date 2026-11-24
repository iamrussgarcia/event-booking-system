import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Attach JWT token from localStorage to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('spotlight.token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Attach user info from localStorage to 401 responses so the app can sign out
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('spotlight.token')
      localStorage.removeItem('spotlight.user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default API
