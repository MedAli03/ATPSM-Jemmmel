import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { EmptyState } from '@components/EmptyState';
import { ErrorState } from '@components/ErrorState';
import { Loader } from '@components/Loader';
import { Text } from '@components/Text';

import { useEducatorChildren } from '../children/hooks';
import { fetchActivePei } from './api';

export function PeiLandingScreen(): JSX.Element {
  const navigation = useNavigation<any>();
  const { data, isLoading, isError, refetch } = useEducatorChildren();
  const [loadingChild, setLoadingChild] = useState<number | null>(null);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState title="خطأ" onRetry={() => refetch()} />;
  if (!data || data.length === 0) return <EmptyState title="لا يوجد أطفال" />;

  const handleSelect = async (childId: number) => {
    setLoadingChild(childId);
    try {
      const pei = await fetchActivePei(childId);
      navigation.navigate('EducatorPeiTabs', { childId, peiId: pei?.id ?? 0 });
    } catch (error) {
      console.warn('Failed to load PEI', error);
      navigation.navigate('EducatorPeiTabs', { childId, peiId: 0 });
    } finally {
      setLoadingChild(null);
    }
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => handleSelect(item.id)}>
          <Text style={styles.title}>{`${item.firstName} ${item.lastName}`}</Text>
          <Text style={styles.subtitle}>{item.groupName ?? '—'}</Text>
          {loadingChild === item.id ? <ActivityIndicator style={styles.spinner} /> : null}
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
    fontWeight: '600'
  },
  subtitle: {
    color: '#475569',
    marginTop: 4
  },
  spinner: {
    marginTop: 8
  }
});
