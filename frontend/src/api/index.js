// src/api/index.js
import axios from "axios";

/*────────────────────  ОБЩИЕ ФУНКЦИИ  ────────────────────*/
function getAccess()  { return localStorage.getItem("access"); }
function getRefresh() { return localStorage.getItem("refresh"); }
function setTokens({ access, refresh }) {
  if (access)  localStorage.setItem("access",  access);
  if (refresh) localStorage.setItem("refresh", refresh);
}

/*────────────────────  СОЗДАЁМ БАЗОВЫЕ ИНСТАНСЫ  ────────────────────*/
export const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,            // нужны куки CSRF
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

export const authApi = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

/*────────────────────  ПОДСТАВЛЯЕМ JWT  ────────────────────*/
function attachToken(config) {
  const t = getAccess();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
}
api .interceptors.request.use(attachToken);
authApi.interceptors.request.use(attachToken);

/*────────────────────  АВТО‑REFRESH  ────────────────────*/
let refreshing = false;
let queue = [];

async function refreshToken() {
  if (refreshing) {
    // если уже идёт refresh — ждём его
    return new Promise((res) => queue.push(res));
  }
  refreshing = true;
  try {
    const { data } = await authApi.post("/auth/jwt/refresh/", {
      refresh: getRefresh(),
    });
    setTokens({ access: data.access });
    queue.forEach((cb) => cb());
  } catch {
    // refresh не сработал → вылогиниваем
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  } finally {
    refreshing = false;
    queue = [];
  }
}

// перехватчик ошибок
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const cfg = error.config;
    if (error.response?.status === 401 && !cfg.__isRetry) {
      cfg.__isRetry = true;
      await refreshToken();
      return api(cfg);           // повторяем оригинальный запрос
    }
    return Promise.reject(error);
  }
);

/*────────────────────  ЭКСПОРТЫ API  ────────────────────*/
/* товары / магазины / предложения */
export const fetchProducts = async () => {
  const { data } = await api.get("/products/");
  return Array.isArray(data) ? data : [];
};
export const fetchStores          = ()   => api.get("/stores/");
export const sendPriceSuggestion  = (d)  => api.post("/suggest-price/", d);

/* auth (Djoser) */
export const register = (d) => authApi.post("/auth/users/",        d);
export const login    = async (d) => {
  const { data } = await authApi.post("/auth/jwt/create/", d);
  setTokens(data);
  return data;
};
export const getUser  = () => authApi.get("/auth/users/me/");

export const checkout     = ()   => api.post("/checkout/");
export const getMyOrders  = ()   => api.get("/orders/");
export const getOrderOne  = id   => api.get(`/orders/?id=${id}`);