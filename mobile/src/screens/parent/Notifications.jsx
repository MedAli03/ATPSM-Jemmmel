import { useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { fetchUnreadNotifications, markNotificationRead } from '../../api/notifications';
import Loader from '../../components/common/Loader';
import Empty from '../../components/common/Empty';
import ErrorState from '../../components/common/ErrorState';

export default function ParentNotifications() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useQuery({ queryKey: ['notifications', 'unread'], queryFn: () => fetchUnreadNotifications() });

  const mutation = useMutation({
    mutationFn: (id) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    }
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

  const renderItem = ({ item }) => (
    <Pressable
      className="mb-3 rounded-2xl bg-white p-4 shadow-sm"
      onPress={() => mutation.mutate(item.id)}
    >
      <Text className="text-lg font-semibold text-gray-900">{item.title}</Text>
      {item.body ? <Text className="mt-1 text-base text-gray-700">{item.body}</Text> : null}
      {item.created_at ? (
        <Text className="mt-1 text-xs text-gray-400">{format(new Date(item.created_at), 'yyyy-MM-dd HH:mm')}</Text>
      ) : null}
      <Text className="mt-3 text-sm font-semibold text-blue-600">{t('common.markRead')}</Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50 px-4 py-4">
      <FlatList
        data={data?.items || []}
        keyExtractor={(item) => item.id?.toString?.() ?? String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#2563EB" />}
        ListEmptyComponent={<Empty message={t('notifications.empty')} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}
