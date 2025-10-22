import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ar';
import 'dayjs/locale/fr';

import { i18n } from '@i18n/i18n';

dayjs.extend(relativeTime);

dayjs.locale('ar');

i18n.on('languageChanged', (lng) => {
  dayjs.locale(lng === 'fr' ? 'fr' : 'ar');
});

export function formatRelative(date: string | number | Date): string {
  return dayjs(date).fromNow();
}

export function formatDate(date: string | number | Date, format = 'DD MMM YYYY'): string {
  return dayjs(date).format(format);
}
