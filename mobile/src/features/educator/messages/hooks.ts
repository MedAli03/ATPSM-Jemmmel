import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { useAuthStore } from '@features/auth/store';
import { useProtectedQuery } from '@hooks/useProtectedQuery';

import {
  listEducatorThreads,
  listEducatorMessages,
  sendEducatorMessage,
  markEducatorThreadRead,
  EducatorMessage
} from './api';

export function useEducatorThreads() {
  return useProtectedQuery({
    queryKey: ['educator-threads'],
    queryFn: listEducatorThreads
  });
}

export function useEducatorThreadMessages(threadId: number) {
  return useInfiniteQuery({
    queryKey: ['educator-thread', threadId],
    queryFn: ({ pageParam }) => listEducatorMessages(threadId, pageParam as string | undefined),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });
}

export function useSendEducatorMessage(threadId: number) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (variables: { text: string; attachment?: { uri: string; name: string; mimeType: string } | null }) =>
      sendEducatorMessage(threadId, variables),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['educator-thread', threadId] });
      const previous = queryClient.getQueryData(['educator-thread', threadId]);
      const optimistic: EducatorMessage = {
        id: Date.now(),
        threadId,
        senderId: user?.id ?? 0,
        text: variables.text,
        createdAt: new Date().toISOString(),
        status: 'sending'
      };
      queryClient.setQueryData(['educator-thread', threadId], (old: any) => {
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
            index === 0 ? { ...page, data: [optimistic, ...page.data] } : page
          )
        };
      });
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['educator-thread', threadId], context.previous);
      }
      Toast.show({ type: 'error', text1: 'تعذر إرسال الرسالة' });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['educator-thread', threadId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, index: number) =>
            index === 0
              ? {
                  ...page,
                  data: [
                    { ...data, status: 'sent' },
                    ...page.data.filter((message: EducatorMessage) => message.status !== 'sending')
                  ]
                }
              : page
          )
        };
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['educator-threads'] });
    }
  });
}

export function useMarkEducatorThreadRead(threadId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId?: number) => markEducatorThreadRead(threadId, messageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['educator-threads'] });
    }
  });
}
