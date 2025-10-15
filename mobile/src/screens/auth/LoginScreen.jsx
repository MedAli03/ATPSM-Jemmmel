import { useState } from 'react';
import { Text, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ScreenContainer from '../../components/ui/ScreenContainer';
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
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(schema)
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError('');
    try {
      await login(values);
    } catch (err) {
      setError(t('login.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View className="mt-24">
        <Text className="mb-8 text-center text-3xl font-bold text-gray-900">{t('login.title')}</Text>
        <View className="space-y-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('login.email')}
                value={value}
                onChangeText={onChange}
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
              <Input
                label={t('login.password')}
                value={value}
                onChangeText={onChange}
                secureTextEntry
                textContentType="password"
                error={errors.password?.message}
              />
            )}
          />

          {error ? <Text className="text-center text-sm text-red-600">{error}</Text> : null}

          <Button title={submitting ? t('login.loading') : t('login.submit')} onPress={handleSubmit(onSubmit)} disabled={submitting} />
        </View>
      </View>
    </ScreenContainer>
  );
}
