import { ActivityIndicator, Pressable, Text, View } from 'react-native';

export default function Button({
  children,
  onPress,
  disabled,
  loading,
  accessibilityLabel,
  className = ''
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel}
      onPress={loading ? undefined : onPress}
      disabled={isDisabled}
      className={`w-full rounded-xl bg-sky-600 py-3 ${isDisabled ? 'opacity-60' : 'opacity-100'} ${className}`}
    >
      <View className="flex-row items-center justify-center space-x-2 space-x-reverse">
        {loading ? <ActivityIndicator color="#fff" /> : null}
        <Text className="text-lg font-semibold text-white">{children}</Text>
      </View>
    </Pressable>
  );
}
