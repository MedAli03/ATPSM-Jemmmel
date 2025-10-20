import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@components/Card';
import { EmptyState } from '@components/EmptyState';
import { ErrorState } from '@components/ErrorState';
import { Loader } from '@components/Loader';
import { Text } from '@components/Text';
import { formatRelative } from '@utils/date';

import { useParentDashboard } from './hooks';

export function ParentDashboardScreen(): JSX.Element {
  const { data, isLoading, isError, refetch, t } = useParentDashboard();

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <ErrorState title={t('errors.network')} onRetry={() => refetch()} />;
  }

  if (!data) {
    return <EmptyState title={t('errors.empty')} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.cardTitle}>{data.child.name}</Text>
        <Text style={styles.subtitle}>{data.child.group ?? '—'}</Text>
        <View style={styles.row}>
          <Text>{data.lastNote ? formatRelative(data.lastNote) : '—'}</Text>
          <Text>{data.lastActivity ? formatRelative(data.lastActivity) : '—'}</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700'
  },
  subtitle: {
    marginTop: 4,
    color: '#475569'
  },
  row: {
    marginTop: 16,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between'
  }
});
