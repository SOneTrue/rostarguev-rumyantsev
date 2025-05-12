import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000/api',  // уже содержит /api
});

// Аутентификация
export const register = (data) => api.post('/auth/users/', data);
export const login    = (data) => api.post('/auth/jwt/create/', data);

// Авторизация
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Получение товаров
export const fetchProducts = async () => {
  const { data } = await api.get('/products/');
  return data;
};

// Предложение цены
export function sendPriceSuggestion(data) {
  return api.post('/suggest-price/', data);  // ✅ без повторного /api
}
