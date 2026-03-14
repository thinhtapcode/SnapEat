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

  searchFoodLibrary: async (query: string) => {
    const { data } = await api.get('/meals/food-library/search', { 
      params: { q: query } 
    })
    return data
  },
  delete: async (mealId: string) => {
    const { data } = await api.delete(`/meals/${mealId}`)
    return data
  },
  update: async (mealId: string, meal: any) => {
    const { data } = await api.patch(`/meals/${mealId}`, meal)
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
  resetTarget: () => api.post('/tdee/reset-target'),
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
  apply: async (planId: string) => {
    const { data } = await api.post(`/meal-plans/${planId}/apply`)
    return data
  },
  remove: async (planId: string) => {
    const { data } = await api.delete(`/meal-plans/${planId}`)
    return data
  },
  update: async (planId: string, plan: any) => {
    const { data } = await api.patch(`/meal-plans/${planId}`, plan)
    return data
  }
  
}

// Analytics API
export const analyticApi = {
  /**
   * Lấy dữ liệu tổng hợp cho Dashboard Analytics (7 ngày gần nhất)
   * Bao gồm: Trends, Meal Distribution, Adherence Score và User Target
   */
  getDashboard: async () => {
    const { data } = await api.get('/analytics/dashboard');
    return data;
  },

  /**
   * (Tùy chọn) Lấy dữ liệu theo số ngày tùy chỉnh nếu Thịnh muốn mở rộng sau này
   */
  getHistory: async (days: number = 30) => {
    const { data } = await api.get('/analytics/history', { params: { days } });
    return data;
  },

  /**
   * Theo dõi tiến độ cân nặng/calo theo ngày cụ thể
   */
  trackProgress: async (date?: string) => {
    const { data } = await api.post('/analytics/track', null, { params: { date } });
    return data;
  },
};

// AI Service API
const AI_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'

export const aiApi = {
  recognizeFood: async (base64Image: string) => {
    // Chắc chắn rằng key gửi đi là 'imageData' khớp với Pydantic của Python
    const response = await axios.post(`${AI_URL}/api/recognize`, { 
      imageData: base64Image 
    });
    return response.data;
  },
}

export const userApi = {
  updateProfile: async (profile: any) => {
    const { data } = await api.put('/users/profile', profile);
    return data;
  },
};

// Analytics API
export const analyticsApi = {
  /**
   * Lấy dữ liệu tổng hợp cho Dashboard Analytics (7 ngày gần nhất)
   * Bao gồm: Trends, Meal Distribution, Adherence Score và User Target
   */
  getDashboard: async () => {
    const { data } = await api.get('/analytics/dashboard');
    return data;
  },

  /**
   * (Tùy chọn) Lấy dữ liệu theo số ngày tùy chỉnh nếu Thịnh muốn mở rộng sau này
   */
  getHistory: async (days: number = 30) => {
    const { data } = await api.get('/analytics/history', { params: { days } });
    return data;
  },

  /**
   * Theo dõi tiến độ cân nặng/calo theo ngày cụ thể
   */
  trackProgress: async (date?: string) => {
    const { data } = await api.post('/analytics/track', null, { params: { date } });
    return data;
  },
};