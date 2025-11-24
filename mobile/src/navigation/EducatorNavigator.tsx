import { Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { EducatorDashboardScreen } from "../screens/educateur/EducatorDashboardScreen";
import { EducatorGroupsScreen } from "../screens/educateur/EducatorGroupsScreen";
import { EducatorMessagesScreen } from "../screens/educateur/EducatorMessagesScreen";
import { EducatorChatThreadScreen } from "../screens/educateur/EducatorChatThreadScreen";
import { EducatorProfileScreen } from "../screens/educateur/EducatorProfileScreen";
import { EducatorChildDetailsScreen } from "../screens/educateur/EducatorChildDetailsScreen";
import { EducatorChildTimelineScreen } from "../screens/educateur/EducatorChildTimelineScreen";
import { DailyNoteFormScreen } from "../screens/educateur/DailyNoteFormScreen";
import { ActivityFormScreen } from "../screens/educateur/ActivityFormScreen";
import { ObservationInitialeScreen } from "../screens/educateur/ObservationInitialeScreen";
import { EducatorPeiDetailScreen } from "../screens/educateur/EducatorPeiDetailScreen";
import { EducatorPeiCreateScreen } from "../screens/educateur/EducatorPeiCreateScreen";
import { EducatorChatbotScreen } from "../screens/educateur/EducatorChatbotScreen";

export type EducatorStackParamList = {
  EducatorTabs: undefined;
  EducatorChildDetails: { childId: number };
  EducatorChildTimeline: { childId: number; peiId?: number };
  DailyNoteForm: { childId: number; peiId?: number };
  ActivityForm: { childId: number; peiId?: number };
  EducatorChatThread: { threadId?: number; childId?: number };
  ObservationInitiale: { childId: number };
  EducatorPeiDetail: { childId: number; peiId?: number };
  EducatorPeiCreate: { childId: number; anneeId?: number };
  EducatorChatbot: { childId?: number };
};

export type EducatorTabParamList = {
  EducatorDashboard: undefined;
  EducatorGroups: undefined;
  EducatorMessages: undefined;
  EducatorProfile: undefined;
};

const Stack = createNativeStackNavigator<EducatorStackParamList>();
const Tab = createBottomTabNavigator<EducatorTabParamList>();

const EducatorTabsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 60 },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="EducatorDashboard"
        component={EducatorDashboardScreen}
        options={{
          tabBarLabel: "الرئيسية",
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="EducatorGroups"
        component={EducatorGroupsScreen}
        options={{
          tabBarLabel: "مجموعاتي",
          tabBarIcon: () => <Text>👥</Text>,
        }}
      />
      <Tab.Screen
        name="EducatorMessages"
        component={EducatorMessagesScreen}
        options={{
          tabBarLabel: "الرسائل",
          tabBarIcon: () => <Text>💬</Text>,
        }}
      />
      <Tab.Screen
        name="EducatorProfile"
        component={EducatorProfileScreen}
        options={{
          tabBarLabel: "الحساب",
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export const EducatorNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="EducatorTabs"
        component={EducatorTabsNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EducatorChildDetails"
        component={EducatorChildDetailsScreen}
        options={{ title: "ملف الطفل" }}
      />
      <Stack.Screen
        name="EducatorChildTimeline"
        component={EducatorChildTimelineScreen}
        options={{ title: "يوم الطفل" }}
      />
      <Stack.Screen
        name="DailyNoteForm"
        component={DailyNoteFormScreen}
        options={{ title: "ملاحظة يومية جديدة" }}
      />
      <Stack.Screen
        name="ActivityForm"
        component={ActivityFormScreen}
        options={{ title: "نشاط جديد" }}
      />
      <Stack.Screen
        name="EducatorChatThread"
        component={EducatorChatThreadScreen}
        options={{ title: "محادثة مع الولي" }}
      />
      <Stack.Screen
        name="ObservationInitiale"
        component={ObservationInitialeScreen}
        options={{ title: "الملاحظة الأولية" }}
      />
      <Stack.Screen
        name="EducatorPeiDetail"
        component={EducatorPeiDetailScreen}
        options={{ title: "PEI – تفاصيل" }}
      />
      <Stack.Screen
        name="EducatorPeiCreate"
        component={EducatorPeiCreateScreen}
        options={{ title: "إنشاء PEI" }}
      />
      <Stack.Screen
        name="EducatorChatbot"
        component={EducatorChatbotScreen}
        options={{ title: "المساعد التربوي" }}
      />
    </Stack.Navigator>
  );
};
