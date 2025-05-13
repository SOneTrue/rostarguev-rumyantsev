import { createContext, useContext, useEffect, useState } from 'react';
import { getUser } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const loadUser = async () => {
    try {
      const { data } = await getUser();
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
