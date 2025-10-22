import { ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@components/Card';
import { EmptyState } from '@components/EmptyState';
import { ErrorState } from '@components/ErrorState';
import { Loader } from '@components/Loader';
import { Text } from '@components/Text';

import { useEducatorDashboard } from './hooks';

export function EducatorDashboardScreen(): JSX.Element {
  const { data, isLoading, isError, refetch } = useEducatorDashboard();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState title="خطأ" onRetry={() => refetch()} />;
  if (!data) return <EmptyState title="لا توجد بيانات" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.grid}>
        <Card>
          <Text style={styles.metric}>{data.groupsCount}</Text>
          <Text>مجموعاتي</Text>
        </Card>
        <Card>
          <Text style={styles.metric}>{data.childrenCount}</Text>
          <Text>أطفالي</Text>
        </Card>
        <Card>
          <Text style={styles.metric}>{data.pendingItems}</Text>
          <Text>عناصر بإنتظار</Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  grid: {
    marginBottom: 16
  },
  metric: {
    fontSize: 32,
    fontWeight: '700'
  }
});
