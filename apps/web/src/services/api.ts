import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
  if (token) {
    const { state } = JSON.parse(token)
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`
    }
  }
  return config
})

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },
  register: async (email: string, username: string, password: string) => {
    const { data } = await api.post('/auth/register', { email, username, password })
    return data
  },
}

// Meal API
export const mealApi = {
  getAll: async (startDate?: string, endDate?: string) => {
    const { data } = await api.get('/meals', { params: { startDate, endDate } })
    return data
  },
  create: async (meal: any) => {
    const { data } = await api.post('/meals', meal)
    return data
  },
  getDailySummary: async (date?: string) => {
    const { data } = await api.get('/meals/daily-summary', { params: { date } })
    return data
  },
}

// TDEE API
export const tdeeApi = {
  calculate: async () => {
    const { data } = await api.get('/tdee/calculate')
    return data
  },
  updateProfile: async (profile: any) => {
    const { data } = await api.put('/tdee/profile', profile)
    return data
  },
}

// Meal Plan API
export const mealPlanApi = {
  getAll: async () => {
    const { data } = await api.get('/meal-plans')
    return data
  },
  create: async (plan: any) => {
    const { data } = await api.post('/meal-plans', plan)
    return data
  },
  getActive: async () => {
    const { data } = await api.get('/meal-plans/active')
    return data
  },
}

// Analytics API
export const analyticsApi = {
  getHistory: async (days: number = 30) => {
    const { data } = await api.get('/analytics/history', { params: { days } })
    return data
  },
  getSummary: async (period: 'week' | 'month' | 'year' = 'week') => {
    const { data } = await api.get('/analytics/summary', { params: { period } })
    return data
  },
  trackProgress: async (date?: string) => {
    const { data } = await api.post('/analytics/track', null, { params: { date } })
    return data
  },
}

// AI Service API
const AI_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'

export const aiApi = {
  recognizeFood: async (imageData: string) => {
    const { data } = await axios.post(`${AI_URL}/api/recognize`, { imageData })
    return data
  },
}
