import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { I18nManager, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nextProvider } from 'react-i18next';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

import { queryClient } from './src/lib/queryClient';
import { i18n } from './src/i18n/i18n';
import { useBootstrapApp } from './src/app/useBootstrapApp';
import { AppNavigator } from './src/app/navigation/AppNavigator';

export default function App(): JSX.Element {
  const { bootstrapped, theme } = useBootstrapApp();

  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    }
  }, []);

  if (!bootstrapped) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View style={{ flex: 1, backgroundColor: '#fff' }} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer>
              <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
              <AppNavigator />
            </NavigationContainer>
            <Toast position="top" topOffset={60} visibilityTime={3000} />
          </QueryClientProvider>
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
