import { StyleSheet, View } from 'react-native';

import { Button } from '@components/Button';
import { Text } from '@components/Text';

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ title, description, onRetry, retryLabel = 'إعادة المحاولة' }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {onRetry ? (
        <Button label={retryLabel} onPress={onRetry} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32
  },
  title: {
    fontSize: 18,
    fontWeight: '600'
  },
  description: {
    marginTop: 8,
    color: '#ef4444'
  },
  button: {
    marginTop: 16,
    width: '60%'
  }
});
