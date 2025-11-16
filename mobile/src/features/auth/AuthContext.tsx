// src/features/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserRole } from "./types";
import { loginRequest } from "./api";

type AuthStatus = "loading" | "unauthenticated" | "authenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Charger les infos depuis AsyncStorage au démarrage
    const bootstrapAsync = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        const savedUser = await AsyncStorage.getItem("user");

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      } catch (e) {
        console.error("Error loading auth state", e);
        setStatus("unauthenticated");
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await loginRequest({ email, password });

      setToken(data.token);
      setUser(data.user);
      setStatus("authenticated");

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ status, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
