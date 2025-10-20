import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function Loader(): JSX.Element {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    alignItems: 'center'
  }
});
