import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { login as loginApi, loadStoredCredentials, clearCredentials, updateStoredUser } from '../api/auth';
import { clearAuthToken, setAuthToken, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    clearAuthToken();
    await clearCredentials();
    await queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      Alert.alert('جلسة منتهية', 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.', [
        { text: 'حسناً', onPress: () => logout() }
      ]);
    });
  }, [logout]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const stored = await loadStoredCredentials();
        if (stored?.token && stored?.user) {
          setToken(stored.token);
          setUser(stored.user);
          setAuthToken(stored.token);
        }
      } catch (error) {
        console.warn('Failed to load credentials', error);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = useCallback(
    async (credentials) => {
      const result = await loginApi(credentials);
      setToken(result.token);
      setAuthToken(result.token);
      setUser(result.user);
      return result;
    },
    []
  );

  const updateUser = useCallback(
    async (nextUser) => {
      setUser(nextUser);
      try {
        await updateStoredUser(nextUser);
      } catch (error) {
        console.warn('Failed to persist user profile', error);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading: loading,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      updateUser
    }),
    [login, logout, token, user, loading, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
