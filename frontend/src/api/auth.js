import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/* ---------- регистрация ---------- */
export const register = ({ email, password }) =>
  api.post('/auth/users/', {
    username: email,
    email,
    password,
  });

/* ---------- логин ---------- */
export const login = ({ email, password }) =>
  api.post('/auth/jwt/create/', {
    username: email,
    email,
    password,
  });

/* ---------- текущий пользователь ---------- */
export const getMe = () => api.get('/auth/users/me/');

api.interceptors.request.use((conf) => {
  const token = localStorage.getItem('access');
  if (token) conf.headers.Authorization = `Bearer ${token}`;
  return conf;
});
