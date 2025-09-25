import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      // console.log('estoyyy aquiii en api token: ', token)
    if (token) {
      config.headers = config.headers || {}
      ;(config.headers as any).authorization = `Bearer ${token}`
    }
  }
  return config
})

// Auth endpoints
export const AuthAPI = {
  async signIn(email: string, password: string) {
    const { data } = await api.post('/api/auth/login', { email, password })
    
    // Expecting { token, user }
    if (data?.token && typeof window !== 'undefined') localStorage.setItem('token', data.token)
    return data
  },
  async signUp(payload: any) {
    const { data } = await api.post('/api/auth/signup', payload)
    if (data?.token && typeof window !== 'undefined') localStorage.setItem('token', data.token)
    return data
  },
  async signOut() {
    try { await api.post('/api/auth/logout') } catch { /* ignore */ }
    if (typeof window !== 'undefined') localStorage.removeItem('token')
  },
  async verifyToken() {
    const { data } = await api.post('/api/auth/verify-token')
    return data
  },
  async getProfile() {
    const { data } = await api.get('/api/branch/profile')
    return data
  },
}

// Parking endpoints
export const ParkingAPI = {
  async getActive(branchId?: string) {
    const url = branchId ? `/api/parking/active?branchId=${encodeURIComponent(branchId)}` : '/api/parking/active'
    const { data } = await api.get(url)
    return data
  },
  async createEntry(plate: string, branchId?: string) {
    const { data } = await api.post('/api/parking/entry', { plate, branchId })
    return data
  },
  async exit(recordId: string, pointsToRedeem?: number) {
    const { data } = await api.post('/api/parking/exit', { id: recordId, pointsToRedeem })
    return data
  },
  async getLoyaltyPoints(plate: string) {
    // Conventional path; backend may implement as needed
    const { data } = await api.get(`/api/parking/loyalty/${encodeURIComponent(plate)}`)
    return data
  },
  async getHistory(branchId?: string) {
    const url = branchId ? `/api/parking-records/history?branchId=${encodeURIComponent(branchId)}` : '/api/parking/history'
    const { data } = await api.get(url)
    return data
  },
  async getAdminHistory() {
    const { data } = await api.get('/api/history')
    return data
  },
}

export type ApiUser = {
  uid?: string
  email?: string
  displayName?: string
  [key: string]: any
}
