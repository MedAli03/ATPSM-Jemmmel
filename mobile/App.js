import { useEffect } from 'react';
import { I18nManager, SafeAreaView } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/auth/LoginScreen';
import './src/i18n';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    I18nManager.allowRTL(true);
    if (!I18nManager.isRTL) {
      try {
        I18nManager.forceRTL(true);
      } catch (error) {
        console.warn('Failed to apply RTL layout', error);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView className="flex-1 bg-neutral-900" style={{ flex: 1 }}>
        <StatusBar style="light" />
        <LoginScreen />
      </SafeAreaView>
    </QueryClientProvider>
  );
}
