import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@components/EmptyState';
import { ErrorState } from '@components/ErrorState';
import { Loader } from '@components/Loader';
import { Text } from '@components/Text';
import { formatDate } from '@utils/date';

import { useParentChild } from './hooks';

export function ParentChildScreen(): JSX.Element {
  const { data, isLoading, isError, refetch, childName } = useParentChild();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState title="حدث خطأ" onRetry={() => refetch()} />;
  if (!data) return <EmptyState title="لا توجد بيانات" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{childName}</Text>
      <Text style={styles.subtitle}>{formatDate(data.enfant.birthDate)}</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الملاحظات الطبية</Text>
        <Text>{data.fiche.medicalNotes ?? '—'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الداعمين</Text>
        {data.parents.guardians.map((guardian) => (
          <View key={guardian.phone} style={styles.guardian}>
            <Text>{guardian.name}</Text>
            <Text>{guardian.phone}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '700'
  },
  subtitle: {
    color: '#475569',
    marginBottom: 16
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 8
  },
  guardian: {
    marginBottom: 12
  }
});
