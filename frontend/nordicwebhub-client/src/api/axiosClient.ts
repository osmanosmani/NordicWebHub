import axios from 'axios'

// `/api` is the shared endpoint prefix, not a browser page. Individual calls
// append routes such as `/auth/login` to reach the ASP.NET Core API.
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5096/api'

const csrfClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
})

export const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const unsafeMethods = new Set(['post', 'put', 'patch', 'delete'])

axiosClient.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase()

  if (!method || !unsafeMethods.has(method)) {
    return config
  }

  // ASP.NET issues an HttpOnly antiforgery cookie and returns the matching
  // request token. A fresh token avoids identity changes after login/logout.
  const response = await csrfClient.get<{ token: string }>('/csrf-token')

  if (!response.data.token) {
    throw new Error('The CSRF token could not be loaded.')
  }

  config.headers.set('X-CSRF-TOKEN', response.data.token)

  return config
})
