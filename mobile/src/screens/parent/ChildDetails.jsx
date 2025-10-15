import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { fetchChildDetails } from '../../api/enfants';
import { fetchActivePeiByChild } from '../../api/pei';
import { fetchDailyNotesByPei } from '../../api/notes';

export default function ChildDetailsScreen() {
  const route = useRoute();
  const { t } = useTranslation();
  const childId = route.params?.childId;

  const childQuery = useQuery({
    queryKey: ['child', childId],
    queryFn: () => fetchChildDetails(childId),
    enabled: Boolean(childId)
  });

  const peiQuery = useQuery({
    queryKey: ['childPei', childId],
    queryFn: () => fetchActivePeiByChild(childId),
    enabled: Boolean(childId)
  });

  const notesQuery = useQuery({
    queryKey: ['childNotes', childId, peiQuery.data?.id],
    queryFn: () => fetchDailyNotesByPei(peiQuery.data.id, { pageSize: 10 }),
    enabled: Boolean(peiQuery.data?.id)
  });

  const refreshing = childQuery.isRefetching || notesQuery.isRefetching || peiQuery.isRefetching;

  const onRefresh = async () => {
    await Promise.all([childQuery.refetch(), notesQuery.refetch(), peiQuery.refetch()]);
  };

  if (childQuery.isLoading) {
    return <Loader />;
  }

  if (childQuery.isError) {
    return <ErrorState message={t('common.error')} onRetry={onRefresh} />;
  }

  const child = childQuery.data;
  const notes = notesQuery.data?.items || [];
  const pei = peiQuery.data;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
    >
      <View className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <Text className="text-xl font-semibold text-gray-900">{child?.fullName}</Text>
        {child?.birthdate ? (
          <Text className="mt-1 text-sm text-gray-500">{format(new Date(child.birthdate), 'yyyy-MM-dd')}</Text>
        ) : null}
      </View>

      <View className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <Text className="mb-3 text-lg font-semibold text-gray-900">{t('parent.children.notes')}</Text>
        {notesQuery.isPending && !notes.length ? (
          <Text className="text-sm text-gray-500">{t('common.loading')}</Text>
        ) : notes.length ? (
          <View className="space-y-3">
            {notes.map((note) => (
              <View key={note.id} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                {note.type ? (
                  <Text className="text-sm font-semibold text-gray-600">{note.type}</Text>
                ) : null}
                {note.contenu ? <Text className="mt-1 text-base text-gray-900">{note.contenu}</Text> : null}
                {note.date_note ? (
                  <Text className="mt-1 text-xs text-gray-500">{format(new Date(note.date_note), 'yyyy-MM-dd HH:mm')}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-sm text-gray-500">{t('parent.children.notesUnavailable')}</Text>
        )}
      </View>

      <View className="rounded-2xl bg-white p-5 shadow-sm">
        <Text className="mb-3 text-lg font-semibold text-gray-900">{t('parent.children.pei')}</Text>
        {pei ? (
          <View>
            <Text className="text-base text-gray-900">{t('parent.children.peiStatus')}</Text>
            <Text className="mt-1 text-sm text-gray-600">{pei.statut || '—'}</Text>
            {pei.objectifs ? <Text className="mt-2 text-sm text-gray-600">{pei.objectifs}</Text> : null}
          </View>
        ) : (
          <Text className="text-sm text-gray-500">{t('parent.children.noPei')}</Text>
        )}
      </View>
    </ScrollView>
  );
}
