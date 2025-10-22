import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { useAuthStore } from '@features/auth/store';
import { useProtectedQuery } from '@hooks/useProtectedQuery';
import {
  listParentThreads,
  listParentMessages,
  sendParentMessage,
  markParentThreadRead,
  MessageDto
} from './api';

export function useParentThreads(childId?: number) {
  return useProtectedQuery({
    queryKey: ['parent-threads', childId],
    queryFn: () => listParentThreads(childId)
  });
}

export function useParentThreadMessages(threadId: number) {
  return useInfiniteQuery({
    queryKey: ['parent-thread', threadId],
    queryFn: ({ pageParam }) => listParentMessages(threadId, pageParam as string | undefined),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });
}

export function useSendParentMessage(threadId: number) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (variables: { text: string; attachment?: { uri: string; name: string; mimeType: string } | null }) =>
      sendParentMessage(threadId, variables),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['parent-thread', threadId] });
      const previous = queryClient.getQueryData(['parent-thread', threadId]);
      const optimistic: MessageDto = {
        id: Date.now(),
        threadId,
        senderId: user?.id ?? 0,
        text: variables.text,
        createdAt: new Date().toISOString(),
        status: 'sending'
      };
      queryClient.setQueryData(['parent-thread', threadId], (old: any) => {
        if (!old) {
          return {
            pageParams: [undefined],
            pages: [
              {
                data: [optimistic],
                nextCursor: undefined
              }
            ]
          };
        }
        return {
          ...old,
          pages: old.pages.map((page: any, index: number) =>
            index === 0
              ? {
                  ...page,
                  data: [optimistic, ...page.data]
                }
              : page
          )
        };
      });
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['parent-thread', threadId], context.previous);
      }
      Toast.show({ type: 'error', text1: 'خطأ في إرسال الرسالة' });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['parent-thread', threadId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, index: number) =>
            index === 0
              ? {
                  ...page,
                  data: [
                    { ...data, status: 'sent' },
                    ...page.data.filter((message: MessageDto) => message.status !== 'sending')
                  ]
                }
              : page
          )
        };
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['parent-threads'] });
    }
  });
}

export function useMarkParentThreadRead(threadId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId?: number) => markParentThreadRead(threadId, messageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['parent-threads'] });
    }
  });
}
