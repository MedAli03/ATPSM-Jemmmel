import { Text } from 'react-native';

export default function ErrorText({ children }) {
  if (!children) {
    return null;
  }

  return (
    <Text className="mt-1 text-sm text-red-600 text-right dark:text-red-400">
      {children}
    </Text>
  );
}
