import { useTranslation } from 'react-i18next';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { LoginScreen } from '@features/auth';
import {
  ParentDashboardScreen,
  ParentChildScreen,
  ParentThreadsScreen,
  ParentThreadScreen,
  ParentNotificationsScreen
} from '@features/parent';
import {
  EducatorDashboardScreen,
  EducatorGroupsScreen,
  EducatorGroupDetailScreen,
  EducatorChildrenScreen,
  EducatorObservationScreen,
  EducatorPeiScreen,
  EducatorDailyNotesScreen,
  EducatorActivitiesScreen,
  EducatorThreadsScreen,
  EducatorThreadScreen,
  PeiLandingScreen
} from '@features/educator';
import { SettingsScreen } from '@app/screens/SettingsScreen';
import { useAuthStore } from '@features/auth/store';
import { useNotifications } from '@hooks/useNotifications';

const Stack = createNativeStackNavigator();
const ParentTabsNavigator = createBottomTabNavigator();
const EducatorTabsNavigator = createBottomTabNavigator();
const PeiTopTabs = createMaterialTopTabNavigator();

function ParentTabs() {
  const { t } = useTranslation();
  useNotifications();
  return (
    <ParentTabsNavigator.Navigator screenOptions={{ headerShown: false }}>
      <ParentTabsNavigator.Screen
        name="ParentHome"
        component={ParentDashboardScreen}
        options={{ tabBarLabel: t('tabs.home') }}
      />
      <ParentTabsNavigator.Screen
        name="ParentChild"
        component={ParentChildScreen}
        options={{ tabBarLabel: t('tabs.child') }}
      />
      <ParentTabsNavigator.Screen
        name="ParentMessages"
        component={ParentThreadsScreen}
        options={{ tabBarLabel: t('tabs.messages') }}
      />
      <ParentTabsNavigator.Screen
        name="ParentNotifications"
        component={ParentNotificationsScreen}
        options={{ tabBarLabel: t('tabs.notifications') }}
      />
      <ParentTabsNavigator.Screen
        name="ParentSettings"
        component={SettingsScreen}
        options={{ tabBarLabel: t('tabs.settings') }}
      />
    </ParentTabsNavigator.Navigator>
  );
}

function EducatorPeiTabs(props: { route: { params: { childId: number; peiId: number } } }) {
  const { childId, peiId } = props.route.params;
  return (
    <PeiTopTabs.Navigator>
      <PeiTopTabs.Screen
        name="PeiObservation"
        component={EducatorObservationScreen}
        initialParams={{ childId }}
        options={{ title: 'الملاحظة' }}
      />
      <PeiTopTabs.Screen
        name="PeiPlan"
        component={EducatorPeiScreen}
        initialParams={{ childId }}
        options={{ title: 'الخطة' }}
      />
      <PeiTopTabs.Screen
        name="PeiNotes"
        component={EducatorDailyNotesScreen}
        initialParams={{ peiId }}
        options={{ title: 'ملاحظات' }}
      />
      <PeiTopTabs.Screen
        name="PeiActivities"
        component={EducatorActivitiesScreen}
        initialParams={{ peiId }}
        options={{ title: 'أنشطة' }}
      />
    </PeiTopTabs.Navigator>
  );
}

function EducatorTabs() {
  const { t } = useTranslation();
  useNotifications();
  return (
    <EducatorTabsNavigator.Navigator screenOptions={{ headerShown: false }}>
      <EducatorTabsNavigator.Screen
        name="EducatorHome"
        component={EducatorDashboardScreen}
        options={{ tabBarLabel: t('tabs.home') }}
      />
      <EducatorTabsNavigator.Screen
        name="EducatorGroups"
        component={EducatorGroupsScreen}
        options={{ tabBarLabel: t('tabs.groups') }}
      />
      <EducatorTabsNavigator.Screen
        name="EducatorChildren"
        component={EducatorChildrenScreen}
        options={{ tabBarLabel: t('tabs.children') }}
      />
      <EducatorTabsNavigator.Screen
        name="EducatorPei"
        component={PeiLandingScreen}
        options={{ tabBarLabel: t('tabs.pei') }}
      />
      <EducatorTabsNavigator.Screen
        name="EducatorMessages"
        component={EducatorThreadsScreen}
        options={{ tabBarLabel: t('tabs.messages') }}
      />
      <EducatorTabsNavigator.Screen
        name="EducatorSettings"
        component={SettingsScreen}
        options={{ tabBarLabel: t('tabs.settings') }}
      />
    </EducatorTabsNavigator.Navigator>
  );
}

export function AppNavigator(): JSX.Element {
  const user = useAuthStore((state) => state.user);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          {user.role === 'PARENT' ? (
            <Stack.Screen name="Parent" component={ParentTabs} />
          ) : (
            <Stack.Screen name="Educator" component={EducatorTabs} />
          )}
          <Stack.Screen name="ParentThread" component={ParentThreadScreen} />
          <Stack.Screen name="EducatorThread" component={EducatorThreadScreen} />
          <Stack.Screen name="EducatorGroupDetail" component={EducatorGroupDetailScreen} />
          <Stack.Screen name="EducatorPeiTabs" component={EducatorPeiTabs} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
