import { useEffect } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

import { fetchMe, updateMe } from '../../api/me';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { useAuth } from '../../hooks/useAuth';

const schema = yup.object({
  name: yup.string().required('مطلوب'),
  phone: yup.string().nullable()
});

export default function EducatorAccount() {
  const { logout, updateUser } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['me'], queryFn: fetchMe });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty }
  } = useForm({ defaultValues: { name: '', phone: '' }, resolver: yupResolver(schema) });

  useEffect(() => {
    if (data) {
      reset({ name: data.name || '', phone: data.phone || '' });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (updated) => {
      queryClient.setQueryData(['me'], updated);
      void updateUser(updated);
      Alert.alert(t('account.title'), t('account.updateSuccess'));
    }
  });

  const onSubmit = (values) => {
    mutation.mutate(values);
  };

  if (isLoading && !data) {
    return <Loader />;
  }

  if (isError) {
    return <ErrorState message={t('common.error')} onRetry={refetch} />;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
      <View className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <Text className="mb-4 text-xl font-semibold text-gray-900">{t('account.title')}</Text>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Input
              label={t('account.name')}
              value={value}
              onChangeText={onChange}
              error={error?.message}
              className="mb-4"
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Input
              label={t('account.phone')}
              value={value}
              onChangeText={onChange}
              keyboardType="phone-pad"
              error={error?.message}
              className="mb-4"
            />
          )}
        />

        <Button title={t('common.save')} onPress={handleSubmit(onSubmit)} disabled={mutation.isPending || !isDirty} />
      </View>

      <Button title={t('common.logout')} onPress={logout} className="bg-red-500" />
    </ScrollView>
  );
}
