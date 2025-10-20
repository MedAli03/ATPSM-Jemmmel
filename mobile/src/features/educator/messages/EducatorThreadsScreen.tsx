import { useNavigation } from '@react-navigation/native';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@components/EmptyState';
import { ErrorState } from '@components/ErrorState';
import { Loader } from '@components/Loader';
import { Text } from '@components/Text';
import { formatRelative } from '@utils/date';

import { useEducatorThreads } from './hooks';

export function EducatorThreadsScreen(): JSX.Element {
  const navigation = useNavigation<any>();
  const { data, isLoading, isError, refetch } = useEducatorThreads();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState title="خطأ" onRetry={() => refetch()} />;
  if (!data || data.length === 0) return <EmptyState title="لا توجد محادثات" />;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <Pressable
          style={styles.thread}
          onPress={() => navigation.navigate('EducatorThread', { threadId: item.id })}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{item.title ?? '—'}</Text>
            {item.unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
              </View>
            ) : null}
          </View>
          <Text numberOfLines={1} style={styles.preview}>
            {item.lastMessage?.text ?? ''}
          </Text>
          <Text style={styles.timestamp}>{formatRelative(item.updatedAt)}</Text>
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
  thread: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  title: {
    fontWeight: '600',
    fontSize: 18
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  badgeText: {
    color: '#fff'
  },
  preview: {
    color: '#475569'
  },
  timestamp: {
    marginTop: 8,
    color: '#94a3b8'
  }
});
