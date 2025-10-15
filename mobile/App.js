import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/hooks/useAuth';
import './src/i18n';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* noop */
});

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        I18nManager.allowRTL(true);
        const hasForced = await AsyncStorage.getItem('atpsm_rtl_initialized');
        if (!hasForced || !I18nManager.isRTL) {
          I18nManager.forceRTL(true);
          await AsyncStorage.setItem('atpsm_rtl_initialized', '1');
        }
      } catch (error) {
        console.warn('Failed to enable RTL mode', error);
      } finally {
        setTimeout(() => {
          if (isMounted) {
            SplashScreen.hideAsync().catch(() => {});
          }
        }, 400);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
