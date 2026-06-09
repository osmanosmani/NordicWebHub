import axios from 'axios'

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7089/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})
