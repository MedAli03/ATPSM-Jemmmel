import { FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@components/EmptyState';
import { ErrorState } from '@components/ErrorState';
import { Loader } from '@components/Loader';
import { Text } from '@components/Text';

import { useEducatorChildren } from './hooks';

export function EducatorChildrenScreen(): JSX.Element {
  const { data, isLoading, isError, refetch } = useEducatorChildren();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState title="خطأ" onRetry={() => refetch()} />;
  if (!data || data.length === 0) return <EmptyState title="لا يوجد أطفال" />;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{`${item.firstName} ${item.lastName}`}</Text>
          <Text>{item.groupName ?? '—'}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12
  },
  title: {
    fontWeight: '600',
    marginBottom: 4
  }
});
