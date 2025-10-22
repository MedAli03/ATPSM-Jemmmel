import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button } from '@components/Button';
import { Text } from '@components/Text';
import { useAuth } from '@hooks/useAuth';
import { i18n } from '@i18n/i18n';

export function SettingsScreen(): JSX.Element {
  const { t } = useTranslation();
  const { logout, user } = useAuth();

  const toggleLanguage = () => {
    const next = i18n.language === 'ar' ? 'fr' : 'ar';
    void i18n.changeLanguage(next);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user?.name ?? user?.email}</Text>
      <Button label="تبديل اللغة" onPress={toggleLanguage} style={styles.button} />
      <Button
        label={t('actions.logout')}
        onPress={() => logout()}
        variant="secondary"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16
  },
  button: {
    marginTop: 12
  }
});
