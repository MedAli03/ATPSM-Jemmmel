import { useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { fetchMyGroups } from '../../api/groups';
import Loader from '../../components/common/Loader';
import Empty from '../../components/common/Empty';
import ErrorState from '../../components/common/ErrorState';

export default function MyGroups() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useQuery({ queryKey: ['educatorGroups'], queryFn: fetchMyGroups });

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
      onPress={() => navigation.navigate('GroupChildren', { groupId: item.id, groupName: item.name })}
    >
      <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
      {item.level ? <Text className="mt-1 text-sm text-gray-500">{item.level}</Text> : null}
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50 px-4 py-4">
      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id?.toString?.() ?? String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#2563EB" />}
        ListEmptyComponent={<Empty message={t('common.empty')} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}
