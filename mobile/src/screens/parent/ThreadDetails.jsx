import { useCallback, useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, RefreshControl, TextInput, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { fetchThreadMessages, sendThreadMessage } from '../../api/messages';
import MessageItem from '../../components/common/MessageItem';
import Loader from '../../components/common/Loader';
import Empty from '../../components/common/Empty';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

export default function ParentThread() {
  const route = useRoute();
  const threadId = route.params?.threadId;
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['threadMessages', threadId],
    queryFn: () => fetchThreadMessages(threadId),
    enabled: Boolean(threadId)
  });

  const mutation = useMutation({
    mutationFn: (payload) => sendThreadMessage(threadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threadMessages', threadId] });
      reset({ content: '' });
    }
  });

  const { control, handleSubmit, reset } = useForm({ defaultValues: { content: '' } });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const onSubmit = (values) => {
    if (!values.content.trim()) return;
    mutation.mutate({ content: values.content.trim() });
  };

  const messages = useMemo(() => {
    if (!data) return [];
    return data.map((message) => ({
      ...message,
      isMine:
        message.isMine ??
        message.sender_id === user?.id ||
        message.sender?.id === user?.id ||
        message.sender_role === user?.role
    }));
  }, [data, user?.id, user?.role]);

  if (isLoading && !data) {
    return <Loader />;
  }

  if (isError) {
    return <ErrorState message={t('common.error')} onRetry={refetch} />;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-gray-50">
      <FlatList
        className="flex-1 px-4 py-4"
        data={messages}
        keyExtractor={(item) => item.id?.toString?.() ?? String(item.id)}
        renderItem={({ item }) => <MessageItem message={item} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#2563EB" />}
        ListEmptyComponent={<Empty message={t('messages.empty')} />}
        contentContainerStyle={{ paddingBottom: 120 }}
        inverted
      />
      <View className="border-t border-gray-200 bg-white px-4 py-3">
        <Controller
          control={control}
          name="content"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder={t('messages.placeholder')}
              placeholderTextColor="#9CA3AF"
              multiline
              className="mb-3 h-20 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-right"
            />
          )}
        />
        <Button title={t('common.send')} onPress={handleSubmit(onSubmit)} disabled={mutation.isPending} />
      </View>
    </KeyboardAvoidingView>
  );
}
