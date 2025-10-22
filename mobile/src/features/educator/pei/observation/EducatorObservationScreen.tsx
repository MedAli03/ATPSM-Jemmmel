import { RouteProp, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@components/Button';
import { EmptyState } from '@components/EmptyState';
import { ErrorState } from '@components/ErrorState';
import { Loader } from '@components/Loader';
import { Text } from '@components/Text';

import { useObservation, useUpsertObservation } from '../hooks';

const observationFormSchema = z.object({
  summary: z.string().min(10)
});

type ObservationForm = z.infer<typeof observationFormSchema>;

export function EducatorObservationScreen(): JSX.Element {
  const route = useRoute<RouteProp<{ params: { childId: number } }, 'params'>>();
  const { childId } = route.params;
  const observation = useObservation(childId);
  const mutation = useUpsertObservation(childId);
  const form = useForm<ObservationForm>({
    resolver: zodResolver(observationFormSchema),
    defaultValues: { summary: '' }
  });

  useEffect(() => {
    if (observation.data?.summary) {
      form.reset({ summary: observation.data.summary });
    }
  }, [observation.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values.summary);
  });

  if (observation.isLoading) return <Loader />;
  if (observation.isError) return <ErrorState title="خطأ" onRetry={() => observation.refetch()} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {observation.data ? (
        <Text style={styles.updated}>{observation.data.updatedAt ?? ''}</Text>
      ) : (
        <EmptyState title="أضف الملاحظة الأولى" />
      )}
      <View style={styles.field}>
        <Text style={styles.label}>الوصف</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={6}
          onChangeText={(value) => form.setValue('summary', value)}
          value={form.watch('summary')}
        />
        {form.formState.errors.summary ? (
          <Text style={styles.error}>{form.formState.errors.summary.message}</Text>
        ) : null}
      </View>
      <Button label="حفظ" onPress={onSubmit} loading={mutation.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 16
  },
  updated: {
    color: '#94a3b8',
    textAlign: 'left'
  },
  field: {
    marginTop: 12
  },
  label: {
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 12,
    textAlign: 'right'
  },
  error: {
    color: '#dc2626'
  }
});
