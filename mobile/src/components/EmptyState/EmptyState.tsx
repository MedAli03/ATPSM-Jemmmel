import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@components/Text';

interface EmptyStateProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export function EmptyState({ title, description, children }: EmptyStateProps): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {children}
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
    color: '#64748b'
  }
});
