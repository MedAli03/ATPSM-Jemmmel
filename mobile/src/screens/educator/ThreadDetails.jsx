import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function EducatorThread() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-6">
      <Text className="text-center text-base text-gray-600">{t('messages.unavailable')}</Text>
    </View>
  );
}
