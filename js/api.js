const API_BASE = 'https://church-booking-backend.onrender.com'

let accessToken = localStorage.getItem('access_token') || null
let userRole = localStorage.getItem('user_role') || null

export function setToken(token) {
  accessToken = token
  localStorage.setItem('access_token', token)
}

export function setRole(role) {
  userRole = role
  localStorage.setItem('user_role', role)
}

export function getRole() {
  return userRole
}

export function clearAuth() {
  accessToken = null
  userRole = null
  localStorage.removeItem('access_token')
  localStorage.removeItem('user_role')
}

export async function apiRequest(path, options = {}) {
  const headers = options.headers || {}
  headers['Content-Type'] = 'application/json'

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  })

  let data = {}
  try {
    data = await res.json()
  } catch (_) {}

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong')
  }

  return data
}