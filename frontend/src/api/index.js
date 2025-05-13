import axios from 'axios';

// Основной API (для /api/...)
export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
});

export const fetchProducts = async () => {
  const { data } = await api.get('/products/');
  return data;
};

export function sendPriceSuggestion(data) {
  return api.post('/suggest-price/', data);
}

// ---- АВТОРИЗАЦИЯ ----

export const authApi = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

authApi.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Регистрация и логин
export const register = (data) => authApi.post('/auth/users/', data);
export const login    = (data) => authApi.post('/auth/jwt/create/', data);
export const getUser  = ()     => authApi.get('/auth/users/me/');
