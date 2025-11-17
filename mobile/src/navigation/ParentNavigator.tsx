import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import { ParentDashboardScreen } from "../screens/parent/ParentDashboardScreen";
import { ChildDetailsScreen } from "../screens/parent/ChildDetailsScreen";
import { ChildTimelineScreen } from "../screens/parent/ChildTimelineScreen";
import { ParentMessagesScreen } from "../screens/parent/ParentMessagesScreen";
import { ChatThreadScreen } from "../screens/parent/ChatThreadScreen";
import { ParentNotificationsScreen } from "../screens/parent/ParentNotificationsScreen";
import { ParentProfileScreen } from "../screens/parent/ParentProfileScreen";

export type ParentStackParamList = {
  ParentTabs: undefined;
  ChildDetails: { childId: number };
  ChildTimeline: { childId: number };
  ChatThread: { childId: number; threadId?: number };
};

export type ParentTabParamList = {
  Dashboard: undefined;
  Messages: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<ParentStackParamList>();
const Tab = createBottomTabNavigator<ParentTabParamList>();

const ParentTabsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 60 },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={ParentDashboardScreen}
        options={{
          tabBarLabel: "الرئيسية",
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={ParentMessagesScreen}
        options={{
          tabBarLabel: "الرسائل",
          tabBarIcon: () => <Text>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={ParentNotificationsScreen}
        options={{
          tabBarLabel: "الإشعارات",
          tabBarIcon: () => <Text>🔔</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ParentProfileScreen}
        options={{
          tabBarLabel: "الحساب",
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export const ParentNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ParentTabs"
        component={ParentTabsNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChildDetails"
        component={ChildDetailsScreen}
        options={{ title: "ملف الطفل" }}
      />
      <Stack.Screen
        name="ChildTimeline"
        component={ChildTimelineScreen}
        options={{ title: "تابع يوم الطفل" }}
      />
      <Stack.Screen
        name="ChatThread"
        component={ChatThreadScreen}
        options={{ title: "المحادثة" }}
      />
    </Stack.Navigator>
  );
};
