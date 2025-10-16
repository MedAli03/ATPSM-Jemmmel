import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';

import { login } from '../../api/auth';
import { setAuthToken } from '../../api/client';
import TextField from '../../components/ui/TextField';
import PasswordField from '../../components/ui/PasswordField';
import Button from '../../components/ui/Button';

const LOGIN_SCHEMA = yup.object({
  identifier: yup
    .string()
    .trim()
    .required('validation.identifierRequired')
    .min(3, 'validation.identifierMin')
    .max(120, 'validation.identifierMax'),
  password: yup
    .string()
    .trim()
    .required('validation.passwordRequired')
    .min(6, 'validation.passwordMin')
    .max(100, 'validation.passwordMax')
});

export default function LoginScreen({ onLoggedIn }) {
  const { t } = useTranslation();
  const identifierRef = useRef(null);
  const passwordRef = useRef(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    I18nManager.allowRTL(true);
    if (!I18nManager.isRTL) {
      try {
        I18nManager.forceRTL(true);
      } catch (error) {
        console.warn('Unable to enforce RTL layout', error);
      }
    }
  }, []);

  const resolver = useMemo(
    () =>
      yupResolver(
        LOGIN_SCHEMA.transform((value) => ({
          ...value,
          identifier: value.identifier?.trim() ?? '',
          password: value.password ?? ''
        }))
      ),
    []
  );

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset
  } = useForm({
    resolver,
    mode: 'onBlur',
    defaultValues: {
      identifier: '',
      password: ''
    }
  });

  const loginMutation = useMutation({
    mutationFn: login
  });

  const focusFirstError = (formErrors) => {
    if (formErrors?.identifier) {
      identifierRef.current?.focus();
      return;
    }
    if (formErrors?.password) {
      passwordRef.current?.focus();
    }
  };

  const onSubmit = handleSubmit(
    async (formData) => {
      setAlertMessage(null);
      try {
        const payload = await loginMutation.mutateAsync({
          identifier: formData.identifier.trim(),
          password: formData.password
        });

        if (!payload?.token || !payload?.user) {
          throw new Error('Incomplete authentication payload');
        }

        const authPayload = {
          token: payload.token,
          user: payload.user
        };

        await SecureStore.setItemAsync('auth', JSON.stringify(authPayload));
        setAuthToken(payload.token);

        if (typeof onLoggedIn === 'function') {
          onLoggedIn(authPayload);
        }

        reset({ identifier: '', password: '' });
      } catch (error) {
        if (error?.status === 422) {
          const validationErrors = error.data?.errors ?? {};
          const serverErrors = {};

          if (validationErrors.identifier) {
            serverErrors.identifier = {
              type: 'server',
              message: validationErrors.identifier
            };
          }

          if (validationErrors.password) {
            serverErrors.password = {
              type: 'server',
              message: validationErrors.password
            };
          }

          if (serverErrors.identifier) {
            setError('identifier', serverErrors.identifier);
          }
          if (serverErrors.password) {
            setError('password', serverErrors.password);
          }

          focusFirstError(serverErrors);
          return;
        }

        if (error?.status === 401) {
          setAlertMessage(t('login.invalidCredentials'));
          return;
        }

        console.error('Login request failed', error);
        Alert.alert('خطأ', t('login.unexpectedError'));
      }
    },
    (formErrors) => {
      focusFirstError(formErrors);
    }
  );

  return (
    <LinearGradient
      colors={['#0f172a', '#1d4ed8']}
      className="flex-1"
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 items-center justify-center px-5 py-12">
            <View className="w-full max-w-md rounded-2xl bg-white/95 p-6 shadow-lg">
              <Text className="text-right text-3xl font-extrabold text-neutral-900">
                {t('login.title')}
              </Text>
              <Text className="mb-6 mt-2 text-right text-base text-neutral-500">
                {t('login.subtitle')}
              </Text>

              {alertMessage ? (
                <View className="mb-4 rounded-xl bg-red-500/90 px-4 py-3">
                  <Text className="text-right text-sm font-semibold text-white">
                    {alertMessage}
                  </Text>
                </View>
              ) : null}

              <Controller
                control={control}
                name="identifier"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    ref={identifierRef}
                    label={t('login.identifier')}
                    placeholder={t('login.identifierPlaceholder')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="username"
                    returnKeyType="next"
                    textContentType="username"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    error={errors.identifier ? t(errors.identifier.message) : undefined}
                    accessibilityLabel={t('login.identifier')}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <PasswordField
                    ref={passwordRef}
                    label={t('login.password')}
                    placeholder={t('login.passwordPlaceholder')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    returnKeyType="done"
                    textContentType="password"
                    onSubmitEditing={onSubmit}
                    error={errors.password ? t(errors.password.message) : undefined}
                    accessibilityLabel={t('login.password')}
                    toggleLabel={t('login.togglePassword')}
                    showText={t('login.showPassword')}
                    hideText={t('login.hidePassword')}
                  />
                )}
              />

              <View className="mt-4 flex-row-reverse items-center justify-between">
                <Pressable
                  onPress={() => setRememberMe((prev) => !prev)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: rememberMe }}
                  hitSlop={12}
                  className="flex-row-reverse items-center"
                >
                  <View
                    className={`ml-3 h-5 w-5 items-center justify-center rounded border ${
                      rememberMe
                        ? 'border-sky-600 bg-sky-600'
                        : 'border-neutral-300 bg-white'
                    }`}
                  >
                    {rememberMe ? (
                      <View className="h-2.5 w-2.5 rounded bg-white" />
                    ) : null}
                  </View>
                  <Text className="text-sm text-neutral-700 dark:text-neutral-100">
                    {t('login.rememberMe')}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {}}
                  accessibilityRole="button"
                  hitSlop={12}
                >
                  <Text className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                    {t('login.forgotPassword')}
                  </Text>
                </Pressable>
              </View>

              <View className="mt-8">
                <Button
                  onPress={onSubmit}
                  loading={loginMutation.isPending}
                  disabled={loginMutation.isPending}
                  accessibilityLabel={t('login.submit')}
                >
                  {t('login.submit')}
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
