import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://kollecta-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Ajouter le token JWT automatiquement
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Erreur de connexion.';
    return Promise.reject(new Error(message));
  }
);

export default api;
