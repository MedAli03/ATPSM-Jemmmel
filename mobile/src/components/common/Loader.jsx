import { ActivityIndicator, View } from 'react-native';

export default function Loader() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}
