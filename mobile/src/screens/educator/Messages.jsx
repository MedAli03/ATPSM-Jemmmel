import { useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { fetchThreads } from '../../api/messages';
import Loader from '../../components/common/Loader';
import Empty from '../../components/common/Empty';
import ErrorState from '../../components/common/ErrorState';

export default function EducatorMessages() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useQuery({ queryKey: ['threads', 'educateur'], queryFn: () => fetchThreads('educateur') });

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
      onPress={() => navigation.navigate('EducatorThread', { threadId: item.id })}
      className="mb-3 rounded-2xl bg-white p-4 shadow-sm"
    >
      <Text className="text-lg font-semibold text-gray-900">{item.subject || item.title}</Text>
      {item.last_message ? (
        <Text className="mt-1 text-sm text-gray-500" numberOfLines={1}>
          {item.last_message.content}
        </Text>
      ) : null}
      {item.updated_at ? (
        <Text className="mt-1 text-xs text-gray-400">{format(new Date(item.updated_at), 'yyyy-MM-dd HH:mm')}</Text>
      ) : null}
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50 px-4 py-4">
      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id?.toString?.() ?? String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#2563EB" />}
        ListEmptyComponent={<Empty message={t('messages.empty')} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}
