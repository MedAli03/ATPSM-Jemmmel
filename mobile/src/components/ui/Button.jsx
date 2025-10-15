import { Pressable, Text } from 'react-native';

export default function Button({ title, onPress, disabled, className = '', textClassName = '' }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      className={`rounded-xl bg-blue-600 px-4 py-3 items-center ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      <Text className={`text-white text-base font-semibold ${textClassName}`}>{title}</Text>
    </Pressable>
  );
}
