import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
};

// Papers API
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

// Notes API
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

// Syllabus API
export const syllabusAPI = {
  getAll: () => api.get('/api/syllabus'),
  create: (formData) => api.post('/api/syllabus', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/api/syllabus/${id}`),
  download: (id) => {
    window.open(`${API_BASE_URL}/api/syllabus/${id}/download`, '_blank');
  }
};

// Stats API
export const statsAPI = {
  get: () => api.get('/api/stats')
};

export default api;