import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export function useNotifications(): void {
  useEffect(() => {
    void Notifications.requestPermissionsAsync();
    const subscription = Notifications.addNotificationReceivedListener(() => {});
    return () => {
      Notifications.removeNotificationSubscription(subscription);
    };
  }, []);
}
