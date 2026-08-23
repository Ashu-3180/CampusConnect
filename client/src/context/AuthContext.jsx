import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import authService from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data =
          await authService.getCurrentUser(token);

        setUser(data.user);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (userData) => {
    const data =
      await authService.register(userData);

    localStorage.setItem("token", data.token);

    setUser(data.user);

    return data;
  };

  const login = async (credentials) => {
    const data =
      await authService.login(credentials);

    localStorage.setItem("token", data.token);

    setUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}