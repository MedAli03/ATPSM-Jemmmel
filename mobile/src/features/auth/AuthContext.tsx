// src/features/auth/AuthContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginRequest } from "./api";
import { User } from "./types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

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
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("user"),
        ]);

        if (storedToken && storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          if (isMounted) {
            setToken(storedToken);
            setUser(parsedUser);
            setStatus("authenticated");
          }
          return;
        }
      } catch (error) {
        console.error("Failed to load auth state", error);
      }

      if (isMounted) {
        setStatus("unauthenticated");
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistAuth = useCallback(async (nextToken: string, nextUser: User) => {
    await Promise.all([
      AsyncStorage.setItem("token", nextToken),
      AsyncStorage.setItem("user", JSON.stringify(nextUser)),
    ]);
  }, []);

  const clearAuth = useCallback(async () => {
    await Promise.all([AsyncStorage.removeItem("token"), AsyncStorage.removeItem("user")]);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginRequest({ email, password });
      setToken(response.token);
      setUser(response.user);
      setStatus("authenticated");
      await persistAuth(response.token, response.user);
    },
    [persistAuth]
  );

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
    await clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ status, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
