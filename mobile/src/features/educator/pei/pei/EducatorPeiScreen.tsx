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

import { useActivePei, useCreatePei } from '../hooks';

const peiFormSchema = z.object({
  year: z.string().min(4),
  objectives: z.string().min(5)
});

type PeiForm = z.infer<typeof peiFormSchema>;

export function EducatorPeiScreen(): JSX.Element {
  const route = useRoute<RouteProp<{ params: { childId: number } }, 'params'>>();
  const { childId } = route.params;
  const pei = useActivePei(childId);
  const createPei = useCreatePei(childId);
  const form = useForm<PeiForm>({
    resolver: zodResolver(peiFormSchema),
    defaultValues: { year: new Date().getFullYear().toString(), objectives: '' }
  });

  useEffect(() => {
    if (pei.data) {
      form.reset({
        year: pei.data.year.toString(),
        objectives: pei.data.objectives.join('\n')
      });
    }
  }, [pei.data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const objectives = values.objectives.split('\n').map((item) => item.trim()).filter(Boolean);
    await createPei.mutateAsync({ year: Number(values.year), objectives });
  });

  if (pei.isLoading) return <Loader />;
  if (pei.isError) return <ErrorState title="خطأ" onRetry={() => pei.refetch()} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {pei.data ? (
        <View style={styles.card}>
          <Text style={styles.title}>السنة: {pei.data.year}</Text>
          {pei.data.objectives.map((objective) => (
            <Text key={objective} style={styles.objective}>
              • {objective}
            </Text>
          ))}
        </View>
      ) : (
        <EmptyState title="لا توجد خطة نشطة" description="أنشئ خطة جديدة" />
      )}
      <View style={styles.form}>
        <Text style={styles.label}>السنة</Text>
        <TextInput
          style={[styles.input, styles.inputSpacing]}
          keyboardType="numeric"
          value={form.watch('year')}
          onChangeText={(value) => form.setValue('year', value)}
        />
        {form.formState.errors.year ? (
          <Text style={styles.error}>{form.formState.errors.year.message}</Text>
        ) : null}
        <Text style={styles.label}>الأهداف</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          multiline
          numberOfLines={5}
          value={form.watch('objectives')}
          onChangeText={(value) => form.setValue('objectives', value)}
        />
        {form.formState.errors.objectives ? (
          <Text style={styles.error}>{form.formState.errors.objectives.message}</Text>
        ) : null}
        <Button label="حفظ الخطة" onPress={onSubmit} loading={createPei.isPending} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  title: {
    fontWeight: '700'
  },
  objective: {
    color: '#475569'
  },
  form: {
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
  inputSpacing: {
    marginBottom: 12
  },
  multiline: {
    minHeight: 120,
    marginBottom: 12
  },
  error: {
    color: '#dc2626'
  }
});
