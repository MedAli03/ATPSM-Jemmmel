import { useCallback } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { fetchGroupChildren } from '../../api/groups';
import { fetchActiveSchoolYear } from '../../api/annees';
import Loader from '../../components/common/Loader';
import Empty from '../../components/common/Empty';
import ErrorState from '../../components/common/ErrorState';

export default function GroupChildren() {
  const route = useRoute();
  const groupId = route.params?.groupId;
  const providedYearId = route.params?.anneeId;
  const { t } = useTranslation();

  const {
    data: fallbackYear
  } = useQuery({
    queryKey: ['activeYear'],
    queryFn: fetchActiveSchoolYear,
    enabled: !providedYearId
  });

  const anneeId = providedYearId || fallbackYear?.id;

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['groupChildren', groupId, anneeId],
    queryFn: () => fetchGroupChildren(groupId, { anneeId }),
    enabled: Boolean(groupId && anneeId)
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading && !data) {
    return <Loader />;
  }

  if (isError) {
    return <ErrorState message={t('common.error')} onRetry={refetch} />;
  }

  return (
    <View className="flex-1 bg-gray-50 px-4 py-4">
      <FlatList
        data={data?.items || []}
        keyExtractor={(item) => item.id?.toString?.() ?? String(item.id)}
        renderItem={({ item }) => (
          <View className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900">
              {item.prenom || item.nom ? `${item.prenom ?? ''} ${item.nom ?? ''}`.trim() : item.enfant_id}
            </Text>
            {item.date_naissance ? (
              <Text className="mt-1 text-sm text-gray-600">{format(new Date(item.date_naissance), 'yyyy-MM-dd')}</Text>
            ) : null}
          </View>
        )}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#2563EB" />}
        ListEmptyComponent={<Empty message={t('common.empty')} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}
