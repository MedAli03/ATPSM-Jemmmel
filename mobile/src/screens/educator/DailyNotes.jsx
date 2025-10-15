import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { fetchDailyNotesByPei, createDailyNote } from '../../api/notes';
import { fetchActivePeisForEducator } from '../../api/pei';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Empty from '../../components/common/Empty';
import ErrorState from '../../components/common/ErrorState';
import { useAuth } from '../../hooks/useAuth';

const schema = yup.object({
  type: yup.string().required('مطلوب'),
  contenu: yup.string().required('مطلوب'),
  date: yup.string().required('مطلوب'),
  time: yup.string().required('مطلوب'),
  pieces_jointes: yup
    .string()
    .transform((value) => (value === '' ? null : value))
    .nullable()
});

export default function DailyNotes() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPeiId, setSelectedPeiId] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: { type: '', contenu: '', date: '', time: '', pieces_jointes: '' },
    resolver: yupResolver(schema)
  });

  const peisQuery = useQuery({
    queryKey: ['educatorPeis', user?.id],
    queryFn: () => fetchActivePeisForEducator(user.id),
    enabled: Boolean(user?.id)
  });

  useEffect(() => {
    if (!selectedPeiId && peisQuery.data?.items?.length) {
      setSelectedPeiId(peisQuery.data.items[0].id);
    }
  }, [peisQuery.data, selectedPeiId]);

  useEffect(() => {
    const now = new Date();
    reset({
      type: '',
      contenu: '',
      date: format(now, 'yyyy-MM-dd'),
      time: format(now, 'HH:mm'),
      pieces_jointes: ''
    });
  }, [reset, selectedPeiId]);

  const currentPei = useMemo(
    () => peisQuery.data?.items?.find((pei) => pei.id === selectedPeiId) ?? null,
    [peisQuery.data?.items, selectedPeiId]
  );

  const notesQuery = useQuery({
    queryKey: ['educatorNotes', selectedPeiId],
    queryFn: () => fetchDailyNotesByPei(selectedPeiId, { pageSize: 20 }),
    enabled: Boolean(selectedPeiId)
  });

  const mutation = useMutation({
    mutationFn: ({ peiId, payload }) => createDailyNote(peiId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educatorNotes', selectedPeiId] });
      const now = new Date();
      reset({
        type: '',
        contenu: '',
        date: format(now, 'yyyy-MM-dd'),
        time: format(now, 'HH:mm'),
        pieces_jointes: ''
      });
    }
  });

  const onSubmit = (values) => {
    if (!currentPei?.enfant_id) return;
    const timestamp = new Date(`${values.date}T${values.time}`);
    if (Number.isNaN(timestamp.getTime())) {
      return;
    }
    mutation.mutate({
      peiId: selectedPeiId,
      payload: {
        enfant_id: currentPei.enfant_id,
        type: values.type,
        contenu: values.contenu,
        date_note: timestamp.toISOString(),
        pieces_jointes: values.pieces_jointes || null
      }
    });
  };

  if (peisQuery.isLoading && !peisQuery.data) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  if (peisQuery.isError) {
    return <ErrorState message={t('common.error')} onRetry={peisQuery.refetch} />;
  }

  const notes = notesQuery.data?.items ?? [];

  return (
    <View className="flex-1 bg-gray-50 px-4 py-4">
      <View className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <Text className="mb-4 text-xl font-semibold text-gray-900">{t('educator.notes.create')}</Text>

        {peisQuery.data?.items?.length ? (
          <View className="mb-4 flex-row flex-wrap gap-2">
            {peisQuery.data.items.map((pei) => {
              const isActive = pei.id === selectedPeiId;
              const label = pei.enfant?.prenom
                ? `${pei.enfant.prenom} ${pei.enfant.nom ?? ''}`.trim()
                : t('educator.notes.childFallback', { id: pei.enfant_id });
              return (
                <Pressable
                  key={pei.id}
                  onPress={() => setSelectedPeiId(pei.id)}
                  className={`rounded-full border px-4 py-2 ${
                    isActive ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white'
                  }`}
                >
                  <Text className={`text-sm ${isActive ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Text className="text-sm text-gray-500">{t('educator.notes.noPei')}</Text>
        )}

        {selectedPeiId ? (
          <>
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('educator.notes.type')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.type?.message}
                  className="mb-3"
                />
              )}
            />

            <Controller
              control={control}
              name="contenu"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('educator.notes.content')}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  error={errors.contenu?.message}
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
              name="pieces_jointes"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('educator.notes.attachment')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.pieces_jointes?.message}
                  className="mb-6"
                />
              )}
            />

            <Button
              title={t('educator.notes.submit')}
              onPress={handleSubmit(onSubmit)}
              disabled={mutation.isPending}
            />
          </>
        ) : null}
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id?.toString?.() ?? String(item.id)}
        renderItem={({ item }) => (
          <View className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
            <Text className="text-base font-semibold text-gray-900">
              {item.type || t('educator.notes.noteLabel')}
            </Text>
            {item.contenu ? <Text className="mt-1 text-sm text-gray-600">{item.contenu}</Text> : null}
            {item.date_note ? (
              <Text className="mt-1 text-xs text-gray-400">{format(new Date(item.date_note), 'yyyy-MM-dd HH:mm')}</Text>
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
