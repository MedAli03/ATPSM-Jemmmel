import { useEffect } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { createDailyNote, fetchEducatorDailyNotes } from '../../api/notes';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Empty from '../../components/common/Empty';
import ErrorState from '../../components/common/ErrorState';

const schema = yup.object({
  enfant_id: yup.string().required('مطلوب'),
  behavior: yup.string().required('مطلوب'),
  activities: yup.string().required('مطلوب'),
  date: yup.string().required('مطلوب'),
  time: yup.string().required('مطلوب'),
  image: yup.string().nullable()
});

export default function DailyNotes() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: { enfant_id: '', behavior: '', activities: '', date: '', time: '', image: '' },
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    const now = new Date();
    const current = getValues();
    reset({
      ...current,
      date: format(now, 'yyyy-MM-dd'),
      time: format(now, 'HH:mm')
    });
  }, [getValues, reset]);

  const notesQuery = useQuery({ queryKey: ['educatorNotes'], queryFn: () => fetchEducatorDailyNotes(20) });

  const mutation = useMutation({
    mutationFn: (payload) => createDailyNote(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educatorNotes'] });
      const now = new Date();
      reset({
        enfant_id: '',
        behavior: '',
        activities: '',
        date: format(now, 'yyyy-MM-dd'),
        time: format(now, 'HH:mm'),
        image: ''
      });
    }
  });

  const onSubmit = (values) => {
    const occurred_at = `${values.date} ${values.time}`;
    const payload = {
      enfant_id: values.enfant_id,
      behavior: values.behavior,
      activities: values.activities,
      occurred_at,
      image: values.image || undefined
    };
    mutation.mutate(payload);
  };

  if (notesQuery.isLoading && !notesQuery.data) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  if (notesQuery.isError) {
    return <ErrorState message={t('common.error')} onRetry={notesQuery.refetch} />;
  }

  const notes = notesQuery.data || [];

  return (
    <View className="flex-1 bg-gray-50 px-4 py-4">
      <View className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <Text className="mb-4 text-xl font-semibold text-gray-900">{t('educator.notes.create')}</Text>

        <Controller
          control={control}
          name="enfant_id"
          render={({ field: { onChange, value } }) => (
            <Input
              label="ID الطفل"
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
              error={errors.enfant_id?.message}
              className="mb-3"
            />
          )}
        />

        <Controller
          control={control}
          name="behavior"
          render={({ field: { onChange, value } }) => (
            <Input
              label={t('educator.notes.behavior')}
              value={value}
              onChangeText={onChange}
              error={errors.behavior?.message}
              className="mb-3"
            />
          )}
        />

        <Controller
          control={control}
          name="activities"
          render={({ field: { onChange, value } }) => (
            <Input
              label={t('educator.notes.activities')}
              value={value}
              onChangeText={onChange}
              error={errors.activities?.message}
              className="mb-3"
            />
          )}
        />

        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <Input
              label={t('educator.notes.date')}
              value={value}
              onChangeText={onChange}
              placeholder="yyyy-MM-dd"
              error={errors.date?.message}
              className="mb-3"
            />
          )}
        />

        <Controller
          control={control}
          name="time"
          render={({ field: { onChange, value } }) => (
            <Input
              label={t('educator.notes.time')}
              value={value}
              onChangeText={onChange}
              placeholder="HH:mm"
              error={errors.time?.message}
              className="mb-3"
            />
          )}
        />

        <Controller
          control={control}
          name="image"
          render={({ field: { onChange, value } }) => (
            <Input
              label="رابط صورة (اختياري)"
              value={value}
              onChangeText={onChange}
              error={errors.image?.message}
              className="mb-6"
            />
          )}
        />

        <Button title={t('educator.notes.submit')} onPress={handleSubmit(onSubmit)} disabled={mutation.isPending} />
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id?.toString?.() ?? String(item.id)}
        renderItem={({ item }) => (
          <View className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
            <Text className="text-base font-semibold text-gray-900">{item.enfant?.name || item.enfant_id}</Text>
            <Text className="mt-1 text-sm text-gray-600">{item.behavior}</Text>
            <Text className="mt-1 text-sm text-gray-600">{item.activities}</Text>
            {item.occurred_at ? (
              <Text className="mt-1 text-xs text-gray-400">{format(new Date(item.occurred_at), 'yyyy-MM-dd HH:mm')}</Text>
            ) : null}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={notesQuery.isRefetching}
            onRefresh={notesQuery.refetch}
            tintColor="#2563EB"
          />
        }
        ListEmptyComponent={<Empty message={t('common.empty')} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}
