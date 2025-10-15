import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import ParentHome from '../screens/parent/Home';
import ChildrenScreen from '../screens/parent/Children';
import ChildDetailsScreen from '../screens/parent/ChildDetails';
import ParentMessages from '../screens/parent/Messages';
import ParentThread from '../screens/parent/ThreadDetails';
import ParentNotifications from '../screens/parent/Notifications';
import ParentAccount from '../screens/parent/Account';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ChildrenStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChildrenList"
        component={ChildrenScreen}
        options={{ headerTitle: t('parent.children.title') }}
      />
      <Stack.Screen
        name="ChildDetails"
        component={ChildDetailsScreen}
        options={{ headerTitle: t('parent.children.title') }}
      />
    </Stack.Navigator>
  );
}

function MessagesStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen name="MessagesHome" component={ParentMessages} options={{ headerTitle: t('messages.title') }} />
      <Stack.Screen name="Thread" component={ParentThread} options={{ headerTitle: t('messages.title') }} />
    </Stack.Navigator>
  );
}

export default function ParentTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="ParentHome" component={ParentHome} options={{ title: t('tabs.parent.home') }} />
      <Tab.Screen name="ParentChildren" component={ChildrenStack} options={{ title: t('tabs.parent.children') }} />
      <Tab.Screen name="ParentMessages" component={MessagesStack} options={{ title: t('tabs.parent.messages') }} />
      <Tab.Screen name="ParentNotifications" component={ParentNotifications} options={{ title: t('tabs.parent.notifications') }} />
      <Tab.Screen name="ParentAccount" component={ParentAccount} options={{ title: t('tabs.parent.account') }} />
    </Tab.Navigator>
  );
}
