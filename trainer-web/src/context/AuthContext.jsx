import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginTrainer } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('trainer_token');
    const storedUser = localStorage.getItem('trainer_user');
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const result = await loginTrainer(credentials);
    if (!result.token || !result.user) {
      throw new Error('Respuesta de autenticación inválida');
    }
    if (result.user.role !== 'trainer') {
      throw new Error('Esta cuenta no tiene permisos de entrenador');
    }
    localStorage.setItem('trainer_token', result.token);
    localStorage.setItem('trainer_user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    return result;
  };

  const logout = () => {
    localStorage.removeItem('trainer_token');
    localStorage.removeItem('trainer_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      loading,
      login,
      logout,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
