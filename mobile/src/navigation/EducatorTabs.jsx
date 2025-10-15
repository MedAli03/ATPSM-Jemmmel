import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import EducatorHome from '../screens/educator/Home';
import MyGroups from '../screens/educator/MyGroups';
import GroupChildren from '../screens/educator/GroupChildren';
import DailyNotes from '../screens/educator/DailyNotes';
import EducatorMessages from '../screens/educator/Messages';
import EducatorThread from '../screens/educator/ThreadDetails';
import EducatorAccount from '../screens/educator/Account';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function GroupsStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen name="GroupsHome" component={MyGroups} options={{ headerTitle: t('educator.groups.title') }} />
      <Stack.Screen
        name="GroupChildren"
        component={GroupChildren}
        options={{ headerTitle: t('educator.groups.children') }}
      />
    </Stack.Navigator>
  );
}

function MessagesStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen name="EducatorMessagesHome" component={EducatorMessages} options={{ headerTitle: t('messages.title') }} />
      <Stack.Screen name="EducatorThread" component={EducatorThread} options={{ headerTitle: t('messages.title') }} />
    </Stack.Navigator>
  );
}

export default function EducatorTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="EducatorHome" component={EducatorHome} options={{ title: t('tabs.educator.home') }} />
      <Tab.Screen name="EducatorGroups" component={GroupsStack} options={{ title: t('tabs.educator.groups') }} />
      <Tab.Screen name="EducatorNotes" component={DailyNotes} options={{ title: t('tabs.educator.notes') }} />
      <Tab.Screen name="EducatorMessages" component={MessagesStack} options={{ title: t('tabs.educator.messages') }} />
      <Tab.Screen name="EducatorAccount" component={EducatorAccount} options={{ title: t('tabs.educator.account') }} />
    </Tab.Navigator>
  );
}
