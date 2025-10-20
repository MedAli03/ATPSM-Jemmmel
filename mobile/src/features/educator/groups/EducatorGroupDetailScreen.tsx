import { RouteProp, useRoute } from '@react-navigation/native';
import { FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@components/EmptyState';
import { ErrorState } from '@components/ErrorState';
import { Loader } from '@components/Loader';
import { Text } from '@components/Text';

import { useEducatorGroup } from './hooks';

export function EducatorGroupDetailScreen(): JSX.Element {
  const route = useRoute<RouteProp<{ params: { groupId: number } }, 'params'>>();
  const { groupId } = route.params;
  const { data, isLoading, isError, refetch } = useEducatorGroup(groupId);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState title="خطأ" onRetry={() => refetch()} />;
  if (!data) return <EmptyState title="لا توجد بيانات" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.name}</Text>
      <FlatList
        data={data.children}
        keyExtractor={(child) => child.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.child}>
            <Text>{`${item.firstName} ${item.lastName}`}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16
  },
  child: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0'
  }
});
