import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useProtectedQuery } from '@hooks/useProtectedQuery';
import { listParentNotifications, markNotificationRead, NotificationDto } from './api';

export function useParentNotifications() {
  return useProtectedQuery<NotificationDto[]>({
    queryKey: ['parent-notifications'],
    queryFn: listParentNotifications
  });
}

export function useMarkParentNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) => markNotificationRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['parent-notifications'] });
    }
  });
}
