import { useNavigation } from '@react-navigation/native';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@components/EmptyState';
import { ErrorState } from '@components/ErrorState';
import { Loader } from '@components/Loader';
import { Text } from '@components/Text';

import { useEducatorGroups } from './hooks';

export function EducatorGroupsScreen(): JSX.Element {
  const navigation = useNavigation<any>();
  const { data, isLoading, isError, refetch } = useEducatorGroups();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState title="خطأ" onRetry={() => refetch()} />;
  if (!data || data.length === 0) return <EmptyState title="لا توجد مجموعات" />;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('EducatorGroupDetail', { groupId: item.id })}
        >
          <Text style={styles.title}>{item.name}</Text>
          <Text>{item.childCount} طفل</Text>
        </Pressable>
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
