import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getUser } from "../api";        // GET /auth/users/me/

const AuthCtx = createContext();

/**
 * Оборачивает всё приложение и даёт:
 *   user  – объект пользователя или null
 *   ready – true, когда запрос /me завершён
 *   loadUser() – перезагрузить профиль
 */
export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [ready, setReady] = useState(false);

  /** запрашиваем данные профиля */
  const loadUser = useCallback(async () => {
    try {
      const { data } = await getUser();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setReady(true);       // запрос окончен (успех или ошибка)
    }
  }, []);

  /* первый запрос при старте приложения */
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthCtx.Provider value={{ user, ready, loadUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

/** удобный хук */
export function useAuth() {
  return useContext(AuthCtx);
}
