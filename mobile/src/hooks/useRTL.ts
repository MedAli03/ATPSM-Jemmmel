import { useEffect } from 'react';
import { I18nManager } from 'react-native';

import { i18n } from '@i18n/i18n';

export function useRTL(): void {
  useEffect(() => {
    const dir = i18n.dir();
    if (dir === 'rtl' && !I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    }
  }, []);
}
