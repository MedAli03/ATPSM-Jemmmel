import { useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { fetchGroups } from '../../api/groups';
import { fetchActiveSchoolYear } from '../../api/annees';
import Loader from '../../components/common/Loader';
import Empty from '../../components/common/Empty';
import ErrorState from '../../components/common/ErrorState';

export default function MyGroups() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const {
    data: year,
    isLoading: yearLoading,
    isError: yearError,
    refetch: refetchYear
  } = useQuery({ queryKey: ['activeYear'], queryFn: fetchActiveSchoolYear });

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['educatorGroups', year?.id],
    queryFn: () => fetchGroups({ anneeId: year?.id, limit: 50 }),
    enabled: Boolean(year?.id)
  });

  const onRefresh = useCallback(() => {
    if (yearError) {
      refetchYear();
    }
    if (year?.id) {
      refetch();
    }
  }, [refetch, refetchYear, year?.id, yearError]);

  if ((isLoading || yearLoading) && !data) {
    return <Loader />;
  }

  if (isError || yearError) {
    return <ErrorState message={t('common.error')} onRetry={onRefresh} />;
  }

  const renderItem = ({ item }) => (
    <Pressable
      className="mb-3 rounded-2xl bg-white p-4 shadow-sm"
      onPress={() =>
        navigation.navigate('GroupChildren', {
          groupId: item.id,
          groupName: item.nom || item.name,
          anneeId: year?.id
        })
      }
    >
      <Text className="text-lg font-semibold text-gray-900">{item.nom || item.name}</Text>
      {item.description ? <Text className="mt-1 text-sm text-gray-500">{item.description}</Text> : null}
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
