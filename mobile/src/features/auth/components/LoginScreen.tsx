import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@components/Button';
import { Text } from '@components/Text';

import { useLogin } from '../hooks/useLogin';

export function LoginScreen(): JSX.Element {
  const { t } = useTranslation();
  const { form, handleSubmit, isLoading } = useLogin();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.login_title')}</Text>
      <View style={styles.field}>
        <Text style={styles.label}>{t('auth.email')}</Text>
        <Controller
          control={form.control}
          name="email"
          render={({ field: { onChange, value }, fieldState }) => (
            <>
              <TextInput
                style={[styles.input, fieldState.error && styles.error]}
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign="right"
              />
              {fieldState.error ? (
                <Text style={styles.errorText}>{fieldState.error.message}</Text>
              ) : null}
            </>
          )}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('auth.password')}</Text>
        <Controller
          control={form.control}
          name="password"
          render={({ field: { onChange, value }, fieldState }) => (
            <>
              <TextInput
                style={[styles.input, fieldState.error && styles.error]}
                onChangeText={onChange}
                value={value}
                secureTextEntry
                textAlign="right"
              />
              {fieldState.error ? (
                <Text style={styles.errorText}>{fieldState.error.message}</Text>
              ) : null}
            </>
          )}
        />
      </View>
      <Button
        label={t('actions.login')}
        onPress={handleSubmit}
        loading={isLoading}
        accessibilityHint="login"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f8fafc'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center'
  },
  field: {
    marginBottom: 16
  },
  label: {
    marginBottom: 8,
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff'
  },
  error: {
    borderColor: '#dc2626'
  },
  errorText: {
    color: '#dc2626',
    marginTop: 4
  }
});
