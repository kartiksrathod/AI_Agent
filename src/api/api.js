import axios from 'axios';

// Get backend URL from env or fallback to localhost
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication endpoints
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
};

// Question Papers
export const papersAPI = {
  getAll: () => api.get('/api/papers'),
  create: (formData) => api.post('/api/papers', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/api/papers/${id}`),
  download: (id) => {
    window.open(`${API_BASE_URL}/api/papers/${id}/download`, '_blank');
  },
  view: (id) => {
    window.open(`${API_BASE_URL}/api/papers/${id}/view`, '_blank');
  }
};

// Study Notes
export const notesAPI = {
  getAll: () => api.get('/api/notes'),
  create: (formData) => api.post('/api/notes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/api/notes/${id}`),
  download: (id) => {
    window.open(`${API_BASE_URL}/api/notes/${id}/download`, '_blank');
  },
  view: (id) => {
    window.open(`${API_BASE_URL}/api/notes/${id}/view`, '_blank');
  }
};

// Syllabus
export const syllabusAPI = {
  getAll: () => api.get('/api/syllabus'),
  create: (formData) => api.post('/api/syllabus', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/api/syllabus/${id}`),
  download: (id) => {
    window.open(`${API_BASE_URL}/api/syllabus/${id}/download`, '_blank');
  },
  view: (id) => {
    window.open(`${API_BASE_URL}/api/syllabus/${id}/view`, '_blank');
  }
};

// Platform stats
export const statsAPI = {
  get: () => api.get('/api/stats')
};

// User profile stuff
export const profileAPI = {
  get: () => api.get('/api/profile'),
  update: (profileData) => api.put('/api/profile', profileData),
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  removePhoto: () => api.delete('/api/profile/photo'),
  updatePassword: (passwordData) => api.put('/api/profile/password', passwordData),
  getPhoto: (userId) => `${API_BASE_URL}/api/profile/photo/${userId}`,
  getStats: () => api.get('/api/profile/stats')  // Get user statistics
};

// Bookmarks
export const bookmarksAPI = {
  getAll: () => api.get('/api/bookmarks'),
  create: (bookmarkData) => api.post('/api/bookmarks', bookmarkData),
  remove: (resourceType, resourceId) => api.delete(`/api/bookmarks/${resourceType}/${resourceId}`),
  check: (resourceType, resourceId) => api.get(`/api/bookmarks/check/${resourceType}/${resourceId}`)
};

// Achievements system
export const achievementsAPI = {
  getAll: () => api.get('/api/achievements')
};

// Learning Goals
export const learningGoalsAPI = {
  getAll: () => api.get('/api/learning-goals'),
  create: (goalData) => api.post('/api/learning-goals', goalData),
  update: (goalId, goalData) => api.put(`/api/learning-goals/${goalId}`, goalData),
  delete: (goalId) => api.delete(`/api/learning-goals/${goalId}`)
};

export default api;
