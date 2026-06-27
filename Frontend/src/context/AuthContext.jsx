/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openLogin, setOpenLogin] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await authService.getMe();
          setUser(data.user);
        } catch (error) {
          console.error("Token verification failed, clearing session:", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    setOpenLogin(false);
    return data.user;
  };

  const register = async (name, email, phone, password) => {
    const data = await authService.register(name, email, phone, password);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    setOpenLogin(false);
    return data.user;
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
        openLogin,
        setOpenLogin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
