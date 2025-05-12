import axios from 'axios';
const baseURL = 'http://localhost:8000';

export const api = axios.create({ baseURL, withCredentials: true });

/* ---------- AUTH ---------- */
export const register = ({ email, password }) =>
  api.post('/auth/users/', {
    username: email,          // djoser требует username
    email,
    password,
  });

export const login = ({ email, password }) =>
  api.post('/auth/jwt/create/', { email, password });

export const getMe = () =>
  api.get('/auth/users/me/');

api.interceptors.request.use((conf) => {
  const token = localStorage.getItem('access');
  if (token) conf.headers.Authorization = `Bearer ${token}`;
  return conf;
});
