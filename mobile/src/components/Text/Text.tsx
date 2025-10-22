import { Text as RNText, TextProps, StyleSheet, I18nManager } from 'react-native';

export function Text({ style, ...props }: TextProps): JSX.Element {
  return <RNText {...props} style={[styles.base, style]} />;
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
    textAlign: I18nManager.isRTL ? 'right' : 'left'
  }
});
