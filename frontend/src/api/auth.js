import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

/* ---------- регистрация ---------- */
export const register = ({ email, password }) =>
  api.post('/auth/users/', {
    username: email,     // 👈  дублируем e‑mail
    email,
    password,
  });

/* ---------- логин ---------- */
export const login = ({ email, password }) =>
  api.post('/auth/jwt/create/', {
    username: email,   //  ←  без username Django выдаёт ошибку
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
