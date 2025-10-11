// src/context/AuthContext.jsx
import { createContext, useContext, useMemo, useState } from "react";
import { login as apiLogin, logout as apiLogout } from "../api/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem("auth");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = auth?.user || null;

  const doLogin = async (email, mot_de_passe) => {
    setIsLoading(true);
    try {
      const { token, user } = await apiLogin(email, mot_de_passe);
      const value = { token, user };
      localStorage.setItem("auth", JSON.stringify(value));
      setAuth(value);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const doLogout = () => {
    apiLogout();
    setAuth(null);
    window.location.href = "/login";
  };

  const value = useMemo(
    () => ({
      isLoading,
      currentUser,
      token: auth?.token || null,
      role: currentUser?.role || null,
      login: doLogin,
      logout: doLogout,
    }),
    [isLoading, auth, currentUser]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthCtx);
}
