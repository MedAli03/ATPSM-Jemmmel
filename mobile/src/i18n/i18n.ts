import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

import ar from './ar.json';
import fr from './fr.json';

let initialized = false;

export const resources = {
  ar: { translation: ar },
  fr: { translation: fr }
};

function detectLanguage(): 'ar' | 'fr' {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    const preferred = locales[0];
    if (preferred.languageCode === 'fr') {
      return 'fr';
    }
  }
  return 'ar';
}

export async function initI18n(): Promise<void> {
  if (initialized) return;
  const lng = detectLanguage();
  await i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    lng,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });
  I18nManager.forceRTL(true);
  initialized = true;
}

export { i18n };
