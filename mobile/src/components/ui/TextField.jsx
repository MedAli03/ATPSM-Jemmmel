import { forwardRef } from 'react';
import { Text, TextInput, View } from 'react-native';

import ErrorText from './ErrorText';

const TextField = forwardRef(function TextField(
  { label, error, className = '', inputClassName = '', ...props },
  ref
) {
  return (
    <View className={`w-full ${className}`}>
      {label ? (
        <Text className="mb-2 text-right text-base font-semibold text-neutral-800 dark:text-neutral-100">
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        className={`rounded-xl border border-neutral-200 bg-white/90 px-4 py-3 text-right text-base text-neutral-900 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-400/60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 ${inputClassName}`}
        placeholderTextColor="rgba(120, 120, 120, 0.6)"
        textAlign="right"
        {...props}
      />
      <ErrorText>{error}</ErrorText>
    </View>
  );
});

export default TextField;
