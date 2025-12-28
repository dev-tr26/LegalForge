import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token if needed
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

export const uploadDocument = async (file, userId = 'anonymous') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);

  try {
    const response = await api.post('/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const getDocuments = async (userId = 'anonymous') => {
  try {
    const response = await api.get(`/documents/?user_id=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Fetch documents error:', error);
    throw error;
  }
};

export const getDocument = async (documentId) => {
  try {
    const response = await api.get(`/documents/${documentId}/`);
    return response.data;
  } catch (error) {
    console.error('Fetch document error:', error);
    throw error;
  }
};

export const generateDocument = async (documentId, templateType, prompt = '') => {
  try {
    const response = await api.post('/generate/', {
      document_id: documentId,
      template_type: templateType,
      prompt: prompt,
    });
    return response.data;
  } catch (error) {
    console.error('Generate document error:', error);
    throw error;
  }
};

export const deleteDocument = async (documentId) => {
  try {
    const response = await api.delete(`/documents/${documentId}/`);
    return response.data;
  } catch (error) {
    console.error('Delete document error:', error);
    throw error;
  }
};

export const updateDocument = async (documentId, data) => {
  try {
    const response = await api.put(`/documents/${documentId}/`, data);
    return response.data;
  } catch (error) {
    console.error('Update document error:', error);
    throw error;
  }
};

export const getTemplates = async () => {
  try {
    const response = await api.get('/templates/');
    return response.data;
  } catch (error) {
    console.error('Fetch templates error:', error);
    throw error;
  }
};

export default api;