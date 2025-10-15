import { useCallback } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { fetchGroupChildren } from '../../api/enfants';
import Loader from '../../components/common/Loader';
import Empty from '../../components/common/Empty';
import ErrorState from '../../components/common/ErrorState';

export default function GroupChildren() {
  const route = useRoute();
  const groupId = route.params?.groupId;
  const { t } = useTranslation();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['groupChildren', groupId],
    queryFn: () => fetchGroupChildren(groupId),
    enabled: Boolean(groupId)
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
        data={data || []}
        keyExtractor={(item) => item.id?.toString?.() ?? String(item.id)}
        renderItem={({ item }) => (
          <View className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
            {item.notes ? <Text className="mt-1 text-sm text-gray-600">{item.notes}</Text> : null}
          </View>
        )}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#2563EB" />}
        ListEmptyComponent={<Empty message={t('common.empty')} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}
