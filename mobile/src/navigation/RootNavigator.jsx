import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import LoginScreen from '../screens/auth/LoginScreen';
import RoleSwitch from './RoleSwitch';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return <Loader />;
  }

  const navigatorKey = isAuthenticated ? 'auth' : 'guest';

  return (
    <Stack.Navigator
      key={navigatorKey}
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="RoleSwitch" component={RoleSwitch} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('login.title') }} />
      )}
    </Stack.Navigator>
  );
}
