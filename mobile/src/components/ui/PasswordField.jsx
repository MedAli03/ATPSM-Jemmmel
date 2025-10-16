import { forwardRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import ErrorText from './ErrorText';

const PasswordField = forwardRef(function PasswordField(
  {
    label,
    error,
    className = '',
    inputClassName = '',
    toggleLabel,
    showText = 'إظهار',
    hideText = 'إخفاء',
    ...props
  },
  ref
) {
  const [secure, setSecure] = useState(true);

  return (
    <View className={`w-full ${className}`}>
      {label ? (
        <Text className="mb-2 text-right text-base font-semibold text-neutral-800 dark:text-neutral-100">
          {label}
        </Text>
      ) : null}
      <View className="flex-row items-center rounded-xl border border-neutral-200 bg-white/90 px-2 py-1 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-400/60 dark:border-neutral-700 dark:bg-neutral-800">
        <TextInput
          ref={ref}
          className={`flex-1 px-2 py-2 text-right text-base text-neutral-900 dark:text-neutral-100 ${inputClassName}`}
          secureTextEntry={secure}
          placeholderTextColor="rgba(120, 120, 120, 0.6)"
          textAlign="right"
          {...props}
        />
        <Pressable
          accessibilityLabel={toggleLabel}
          accessibilityRole="button"
          onPress={() => setSecure((prev) => !prev)}
          hitSlop={12}
          className="px-3 py-2"
        >
          <Text className="text-sm font-semibold text-sky-600 dark:text-sky-400">
            {secure ? showText : hideText}
          </Text>
        </Pressable>
      </View>
      <ErrorText>{error}</ErrorText>
    </View>
  );
});

export default PasswordField;
