import { createContext, useState, useEffect, useContext } from "react";
import client from "../api/client";

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, try to restore token and user from storage and verify /me
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");

    if (!token) { setIsLoading(false); return; }

    // If we have cached user, set it immediately for fast rendering
    if (userStr) setCurrentUser(JSON.parse(userStr));

    // Verify token and refresh user data
    client.get("/api/auth/me")
      .then(({ data }) => {
        setCurrentUser(data);
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(data));
      })
      .catch(() => {
        // If token invalid/expired, force logout
        logout();
      })
      .finally(() => setIsLoading(false));
  }, []);

  // remember=true -> localStorage, else sessionStorage
  const login = ({ token, user }, remember = true) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token"); localStorage.removeItem("user");
    sessionStorage.removeItem("token"); sessionStorage.removeItem("user");
    setCurrentUser(null);
  };

  // Call backend to change password (requires auth)
  const changePassword = (ancien_mot_de_passe, nouveau_mot_de_passe) =>
    client.post("/api/auth/change-password", { ancien_mot_de_passe, nouveau_mot_de_passe });

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}
