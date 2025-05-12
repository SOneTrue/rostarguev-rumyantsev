import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const register = (data) => api.post('/auth/users/', data);
export const login    = (data) => api.post('/auth/jwt/create/', data);

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchProducts = async () => {
  const { data } = await api.get('/products/');
  return data;
};

export const sendPriceSuggestion = (data) => {
  return api.post('/suggestions/', data);
};
