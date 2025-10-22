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
import { formatRelative } from '@utils/date';

import { useCreateDailyNote, useDailyNotes } from '../hooks';

const noteSchema = z.object({
  content: z.string().min(5),
  mood: z.string().optional()
});

type NoteForm = z.infer<typeof noteSchema>;

export function EducatorDailyNotesScreen(): JSX.Element {
  const route = useRoute<RouteProp<{ params?: { peiId?: number } }, 'params'>>();
  const peiId = route.params?.peiId ?? 0;
  const notes = useDailyNotes(peiId);
  const createNote = useCreateDailyNote(peiId);
  const form = useForm<NoteForm>({
    resolver: zodResolver(noteSchema),
    defaultValues: { content: '', mood: '' }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await createNote.mutateAsync({ content: values.content, mood: values.mood });
    form.reset({ content: '', mood: '' });
  });

  if (peiId === 0) {
    return <EmptyState title="اختر خطة نشطة" />;
  }

  if (notes.isLoading) return <Loader />;
  if (notes.isError) return <ErrorState title="خطأ" onRetry={() => notes.refetch()} />;

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="أضف ملاحظة"
          multiline
          value={form.watch('content')}
          onChangeText={(value) => form.setValue('content', value)}
        />
        <TextInput
          style={[styles.input, styles.inputSpacing]}
          placeholder="المزاج"
          value={form.watch('mood') ?? ''}
          onChangeText={(value) => form.setValue('mood', value)}
        />
        <Button label="إضافة" onPress={onSubmit} loading={createNote.isPending} />
      </View>
      {notes.data && notes.data.length > 0 ? (
        <FlatList
          data={notes.data}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.note}>
              <Text>{item.content}</Text>
              <Text style={styles.meta}>{formatRelative(item.createdAt)}</Text>
            </View>
          )}
        />
      ) : (
        <EmptyState title="لا توجد ملاحظات" />
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
  note: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  meta: {
    color: '#94a3b8'
  }
});
