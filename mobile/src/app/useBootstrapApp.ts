import { useCallback, useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { useAuthStore } from '@features/auth/store';
import { initI18n } from '@i18n/i18n';

export function useBootstrapApp(): { bootstrapped: boolean; theme: 'light' | 'dark' } {
  const hydrate = useAuthStore((state) => state.hydrate);
  const hydrated = useAuthStore((state) => state.hydrated);
  const theme = useColorScheme() === 'dark' ? 'dark' : 'light';

  const boot = useCallback(async () => {
    await initI18n();
    await hydrate();
  }, [hydrate]);

  useEffect(() => {
    void boot();
  }, [boot]);

  return {
    bootstrapped: hydrated,
    theme
  };
}
