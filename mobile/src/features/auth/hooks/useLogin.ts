import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useProtectedMutation } from '@hooks/useProtectedMutation';
import { useAuthStore } from '../store';
import { login, loginSchema, LoginPayload } from '../api/login';

export function useLogin() {
  const { t } = useTranslation();
  const setSession = useAuthStore((state) => state.setSession);
  const mutation = useProtectedMutation({
    mutationFn: login,
    onError: () => {
      Toast.show({ type: 'error', text1: t('errors.network') });
    },
    onSuccess: async (data) => {
      await setSession(data.token, data.refreshToken ?? null);
    }
  });

  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const handleSubmit = useCallback(
    form.handleSubmit(async (values) => {
      await mutation.mutateAsync(values);
    }),
    [form, mutation]
  );

  return {
    form,
    handleSubmit,
    isLoading: mutation.isPending
  };
}
