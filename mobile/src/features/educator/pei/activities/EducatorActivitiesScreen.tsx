import { RouteProp, useRoute } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@components/Button';
import { EmptyState } from '@components/EmptyState';
import { ErrorState } from '@components/ErrorState';
import { Loader } from '@components/Loader';
import { Text } from '@components/Text';
import { formatDate } from '@utils/date';

import { useActivities, useCreateActivity } from '../hooks';

const activitySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  scheduledAt: z.string().min(4)
});

type ActivityForm = z.infer<typeof activitySchema>;

export function EducatorActivitiesScreen(): JSX.Element {
  const route = useRoute<RouteProp<{ params?: { peiId?: number } }, 'params'>>();
  const peiId = route.params?.peiId ?? 0;
  const activities = useActivities(peiId);
  const createActivity = useCreateActivity(peiId);
  const form = useForm<ActivityForm>({
    resolver: zodResolver(activitySchema),
    defaultValues: { title: '', description: '', scheduledAt: '' }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createActivity.mutateAsync(values);
    form.reset({ title: '', description: '', scheduledAt: '' });
  });

  if (peiId === 0) {
    return <EmptyState title="اختر خطة نشطة" />;
  }

  if (activities.isLoading) return <Loader />;
  if (activities.isError) return <ErrorState title="خطأ" onRetry={() => activities.refetch()} />;

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, styles.inputSpacing]}
          placeholder="النشاط"
          value={form.watch('title')}
          onChangeText={(value) => form.setValue('title', value)}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="الوصف"
          multiline
          value={form.watch('description')}
          onChangeText={(value) => form.setValue('description', value)}
        />
        <TextInput
          style={[styles.input, styles.inputSpacing]}
          placeholder="التاريخ (YYYY-MM-DD)"
          value={form.watch('scheduledAt')}
          onChangeText={(value) => form.setValue('scheduledAt', value)}
        />
        <Button label="إضافة" onPress={onSubmit} loading={createActivity.isPending} />
      </View>
      {activities.data && activities.data.length > 0 ? (
        <FlatList
          data={activities.data}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.activity}>
              <Text style={styles.title}>{item.title}</Text>
              <Text>{item.description}</Text>
              <Text style={styles.date}>{formatDate(item.scheduledAt)}</Text>
            </View>
          )}
        />
      ) : (
        <EmptyState title="لا توجد أنشطة" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 16
  },
  form: {
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 12,
    textAlign: 'right'
  },
  inputSpacing: {
    marginBottom: 12
  },
  multiline: {
    minHeight: 100,
    marginBottom: 12
  },
  list: {
    paddingBottom: 32
  },
  activity: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  title: {
    fontWeight: '600'
  },
  date: {
    color: '#94a3b8'
  }
});
