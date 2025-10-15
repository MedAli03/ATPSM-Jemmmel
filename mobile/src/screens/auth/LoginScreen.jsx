import { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';

const schema = yup.object({
  email: yup.string().email('صيغة البريد غير صحيحة').required('مطلوب'),
  password: yup.string().required('مطلوب')
});

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(schema)
  });

  const passwordToggleLabel = useMemo(
    () => (showPassword ? t('login.hidePassword') : t('login.showPassword')),
    [showPassword, t]
  );

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError('');
    try {
      await login({
        email: values.email.trim(),
        mot_de_passe: values.password
      });
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.errors?.[0]?.msg;
      setError(apiMessage || t('login.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="relative flex-1 bg-indigo-950">
      <StatusBar barStyle="light-content" />
      <View className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-indigo-500/30" />
      <View className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-blue-400/20" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow"
        >
          <View className="flex-1 justify-between px-6 pb-10 pt-16">
            <View className="items-center">
              <View className="h-20 w-20 items-center justify-center rounded-3xl bg-white/10">
                <Image
                  source={require('../../../assets/logo.png')}
                  className="h-12 w-12"
                  resizeMode="contain"
                />
              </View>
              <Text className="mt-8 text-3xl font-bold text-white">{t('login.heroTitle')}</Text>
              <Text className="mt-3 text-center text-base leading-6 text-indigo-100">
                {t('login.heroSubtitle')}
              </Text>
            </View>

            <View className="mt-12 w-full self-center rounded-3xl bg-white/95 p-6 shadow-2xl">
              <Text className="text-right text-2xl font-bold text-gray-900">{t('login.title')}</Text>
              <Text className="mt-2 text-right text-sm text-gray-500">
                {t('login.heroSubtitle')}
              </Text>

              <View className="mt-8 space-y-6">
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label={t('login.email')}
                      value={value}
                      onChangeText={onChange}
                      placeholder={t('login.emailPlaceholder')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      textContentType="emailAddress"
                      error={errors.email?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <View className="w-full">
                      <View className="mb-2 flex-row items-center justify-between">
                        <Text className="text-base font-semibold text-gray-800">{t('login.password')}</Text>
                        <TouchableOpacity
                          accessibilityRole="button"
                          onPress={() => setShowPassword((prev) => !prev)}
                        >
                          <Text className="text-sm font-semibold text-indigo-600">{passwordToggleLabel}</Text>
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        secureTextEntry={!showPassword}
                        textContentType="password"
                        placeholder={t('login.passwordPlaceholder')}
                        placeholderTextColor="#9CA3AF"
                        className={`w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-right ${
                          errors.password ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.password?.message ? (
                        <Text className="mt-1 text-sm text-red-600">{errors.password.message}</Text>
                      ) : null}
                    </View>
                  )}
                />

                {error ? (
                  <View className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                    <Text className="text-center text-sm font-semibold text-red-600">{error}</Text>
                  </View>
                ) : null}

                <Button
                  title={submitting ? t('login.loading') : t('login.submit')}
                  onPress={handleSubmit(onSubmit)}
                  disabled={submitting}
                  className="bg-indigo-600"
                />

                <Text className="text-center text-xs leading-5 text-gray-400">
                  {t('login.disclaimer')}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
