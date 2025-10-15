import { ScrollView, View } from 'react-native';

export default function ScreenContainer({ children, scrollable = true, className = '', refreshControl }) {
  if (scrollable) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className={`flex-1 bg-gray-50 ${className}`}
        refreshControl={refreshControl}
      >
        <View className="px-5 py-6">{children}</View>
      </ScrollView>
    );
  }

  return <View className={`flex-1 bg-gray-50 px-5 py-6 ${className}`}>{children}</View>;
}
