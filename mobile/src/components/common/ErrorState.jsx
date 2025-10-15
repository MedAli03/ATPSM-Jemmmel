import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import Button from '../ui/Button';

export default function ErrorState({ message, onRetry }) {
  const { t } = useTranslation();
  return (
    <View className="items-center justify-center rounded-2xl border border-red-200 bg-white px-6 py-12">
      <Text className="mb-4 text-center text-base text-red-600">{message}</Text>
      {onRetry ? <Button title={t('common.retry')} onPress={onRetry} /> : null}
    </View>
  );
}
