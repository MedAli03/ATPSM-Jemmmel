// src/navigation/EducatorNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GroupListScreen } from "../screens/educateur/GroupListScreen";
import { GroupChildrenScreen } from "../screens/educateur/GroupChildrenScreen";
import { ChildPeiScreen } from "../screens/educateur/ChildPeiScreen";
import { PeiEvaluationsScreen } from "../screens/educateur/PeiEvaluationsScreen";

export type EducatorStackParamList = {
  GroupList: undefined;
  GroupChildren: { groupId: number; groupName: string };
  ChildPei: { childId: number; childName: string };
  PeiEvaluations: { peiId: number; childName: string };
};

const Stack = createNativeStackNavigator<EducatorStackParamList>();

export const EducatorNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="GroupList"
        component={GroupListScreen}
        options={{ title: "Mes groupes" }}
      />
      <Stack.Screen
        name="GroupChildren"
        component={GroupChildrenScreen}
        options={({ route }) => ({ title: route.params.groupName })}
      />
      <Stack.Screen
        name="ChildPei"
        component={ChildPeiScreen}
        options={({ route }) => ({ title: route.params.childName })}
      />
      <Stack.Screen
        name="PeiEvaluations"
        component={PeiEvaluationsScreen}
        options={({ route }) => ({
          title: `Évaluations - ${route.params.childName}`,
        })}
      />
    </Stack.Navigator>
  );
};
