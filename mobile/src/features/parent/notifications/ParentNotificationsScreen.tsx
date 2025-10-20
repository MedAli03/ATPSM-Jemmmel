import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@components/EmptyState';
import { ErrorState } from '@components/ErrorState';
import { Loader } from '@components/Loader';
import { Text } from '@components/Text';
import { formatRelative } from '@utils/date';

import { useMarkParentNotificationRead, useParentNotifications } from './hooks';

export function ParentNotificationsScreen(): JSX.Element {
  const { data, isLoading, isError, refetch } = useParentNotifications();
  const markRead = useMarkParentNotificationRead();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState title="خطأ" onRetry={() => refetch()} />;
  if (!data || data.length === 0) return <EmptyState title="لا إشعارات" />;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <Pressable
          style={[styles.card, item.readAt ? styles.read : styles.unread]}
          onPress={() => markRead.mutate(item.id)}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.timestamp}>{formatRelative(item.createdAt)}</Text>
          </View>
          <Text>{item.body}</Text>
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
    padding: 16,
    borderRadius: 16,
    marginBottom: 12
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  title: {
    fontWeight: '600'
  },
  timestamp: {
    color: '#94a3b8'
  },
  unread: {
    backgroundColor: '#eef2ff'
  },
  read: {
    backgroundColor: '#fff'
  }
});
