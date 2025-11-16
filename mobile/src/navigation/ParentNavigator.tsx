// src/navigation/ParentNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ChildListScreen } from "../screens/parent/ChildListScreen";
import { ChildDetailScreen } from "../screens/parent/ChildDetailScreen";
import { ChildTimelineScreen } from "../screens/parent/ChildTimelineScreen";

export type ParentStackParamList = {
  ChildList: undefined;
  ChildDetail: { childId: number; childName?: string };
  ChildTimeline: { childId: number; childName?: string };
};

const Stack = createNativeStackNavigator<ParentStackParamList>();

export const ParentNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChildList"
        component={ChildListScreen}
        options={{ title: "Mes enfants" }}
      />
      <Stack.Screen
        name="ChildDetail"
        component={ChildDetailScreen}
        options={({ route }) => ({
          title: route.params.childName ?? "Profil",
        })}
      />
      <Stack.Screen
        name="ChildTimeline"
        component={ChildTimelineScreen}
        options={({ route }) => ({
          title: route.params.childName
            ? `Suivi - ${route.params.childName}`
            : "Suivi",
        })}
      />
    </Stack.Navigator>
  );
};
