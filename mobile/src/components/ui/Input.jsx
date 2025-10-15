import { forwardRef } from 'react';
import { Text, TextInput, View } from 'react-native';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <View className={`w-full ${className}`}>
      {label ? <Text className="mb-2 text-right text-base font-semibold text-gray-800">{label}</Text> : null}
      <TextInput
        ref={ref}
        className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-right ${error ? 'border-red-500' : ''}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error ? <Text className="mt-1 text-sm text-red-600">{error}</Text> : null}
    </View>
  );
});

Input.displayName = 'Input';

export default Input;
