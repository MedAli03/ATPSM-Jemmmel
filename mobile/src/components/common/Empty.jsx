import { Text, View } from 'react-native';

export default function Empty({ message }) {
  return (
    <View className="items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12">
      <Text className="text-center text-base text-gray-500">{message}</Text>
    </View>
  );
}
