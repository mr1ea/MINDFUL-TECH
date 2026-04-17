import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials)
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateStats: (stats) => api.put('/user/stats', { userStats: stats }),
  updateSafetySettings: (settings) => api.put('/user/safety-settings', { safetySettings: settings }),
  updateBehaviorPatterns: (patterns) => api.put('/user/behavior-patterns', { behaviorPatterns: patterns })
};

export const contentAPI = {
  analyzeContent: (contentInput) => api.post('/content/analyze', { contentInput }),
  logContent: (contentData) => api.post('/content', contentData),
  getContentLogs: () => api.get('/content'),
  getPlatformSummary: () => api.get('/content/summary')
};

export const moodAPI = {
  logMood: (moodData) => api.post('/mood', moodData),
  getMoods: (params) => api.get('/mood', { params }),
  getMoodStats: (params) => api.get('/mood/stats', { params }),
  deleteMood: (id) => api.delete(`/mood/${id}`)
};

export const focusAPI = {
  logSession: (sessionData) => api.post('/focus', sessionData),
  getSessions: (params) => api.get('/focus', { params }),
  getFocusStats: (params) => api.get('/focus/stats', { params }),
  getTodaySessions: () => api.get('/focus/today'),
  deleteSession: (id) => api.delete(`/focus/${id}`)
};

export default api;