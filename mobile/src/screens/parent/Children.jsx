import { useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { fetchMyChildren } from '../../api/enfants';
import Loader from '../../components/common/Loader';
import Empty from '../../components/common/Empty';
import ErrorState from '../../components/common/ErrorState';

export default function ChildrenScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useQuery({ queryKey: ['parentChildren'], queryFn: fetchMyChildren });

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
      onPress={() => navigation.navigate('ChildDetails', { childId: item.id })}
      className="mb-3 rounded-2xl bg-white p-4 shadow-sm"
    >
      <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
      {item.group ? <Text className="mt-1 text-sm text-gray-500">{item.group}</Text> : null}
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
