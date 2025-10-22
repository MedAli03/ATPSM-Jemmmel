import { useEffect, useMemo, useRef, useState } from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@components/Button';
import { Loader } from '@components/Loader';
import { Text } from '@components/Text';
import { useFilePicker } from '@hooks/useFilePicker';
import { useAuthStore } from '@features/auth/store';
import { formatRelative } from '@utils/date';

import {
  useEducatorThreadMessages,
  useSendEducatorMessage,
  useMarkEducatorThreadRead
} from './hooks';

export function EducatorThreadScreen(): JSX.Element {
  const route = useRoute<RouteProp<{ params: { threadId: number } }, 'params'>>();
  const { threadId } = route.params;
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<{ uri: string; name: string; mimeType: string } | null>(
    null
  );
  const listRef = useRef<FlatList>(null);
  const userId = useAuthStore((state) => state.user?.id);

  const messages = useEducatorThreadMessages(threadId);
  const sendMessage = useSendEducatorMessage(threadId);
  const markRead = useMarkEducatorThreadRead(threadId);
  const { pickFile } = useFilePicker();

  useEffect(() => {
    if (messages.data?.pages[0]?.data[0]) {
      void markRead.mutateAsync(messages.data.pages[0].data[0].id);
    }
  }, [messages.data, markRead]);

  const flattened = useMemo(() => messages.data?.pages.flatMap((page) => page.data) ?? [], [
    messages.data
  ]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage.mutateAsync({ text, attachment });
    setText('');
    setAttachment(null);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handlePickFile = async () => {
    const file = await pickFile();
    if (file) setAttachment(file);
  };

  if (messages.isLoading) return <Loader />;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        ref={listRef}
        data={flattened}
        keyExtractor={(item) => item.id.toString()}
        inverted
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isMine = item.senderId === userId;
          return (
            <View
              style={[styles.message, isMine ? styles.myMessage : styles.theirMessage]}
            >
              <Text style={isMine ? styles.myMessageText : styles.theirMessageText}>
                {item.text ?? ''}
              </Text>
              <Text style={styles.timestamp}>{formatRelative(item.createdAt)}</Text>
            </View>
          );
        }}
        onEndReached={() => {
          if (messages.hasNextPage && !messages.isFetchingNextPage) {
            void messages.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.2}
        ListFooterComponent={messages.isFetchingNextPage ? <Loader /> : null}
      />
      <View style={styles.composer}>
        {attachment ? <Text style={styles.attachment}>{attachment.name}</Text> : null}
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={t('messages.placeholder')}
          multiline
        />
        <View style={styles.actions}>
          <Button
            label="📎"
            variant="secondary"
            onPress={handlePickFile}
            style={styles.actionButton}
          />
          <Button
            label={t('actions.send')}
            onPress={handleSend}
            loading={sendMessage.isPending}
            style={styles.actionButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  list: {
    padding: 16,
    paddingBottom: 32
  },
  message: {
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
    maxWidth: '80%'
  },
  myMessage: {
    backgroundColor: '#2563eb',
    alignSelf: 'flex-start'
  },
  theirMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end'
  },
  myMessageText: {
    color: '#fff'
  },
  theirMessageText: {
    color: '#0f172a'
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6
  },
  composer: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0'
  },
  input: {
    minHeight: 60,
    maxHeight: 160,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 12,
    textAlign: 'right'
  },
  actions: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    marginTop: 12
  },
  actionButton: {
    marginHorizontal: 4
  },
  attachment: {
    marginBottom: 8,
    color: '#64748b'
  }
});
