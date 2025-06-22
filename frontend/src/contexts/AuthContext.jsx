import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getUser } from "../api";

const AuthCtx = createContext();


export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [ready, setReady] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const { data } = await getUser();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthCtx.Provider value={{ user, ready, loadUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}


