// src/navigation/AppNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "../features/auth/AuthContext";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { ParentDashboardScreen } from "../screens/parent/ParentDashboardScreen";
import { EducatorDashboardScreen } from "../screens/educateur/EducatorDashboardScreen";

export type RootStackParamList = {
  Login: undefined;
  ParentDashboard: undefined;
  EducatorDashboard: undefined;
  NotAllowed: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator />
    <Text>Chargement...</Text>
  </View>
);

const NotAllowedScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Ce rôle n'a pas accès à l'application mobile.</Text>
  </View>
);

export const AppNavigator: React.FC = () => {
  const { status, user } = useAuth();

  if (status === "loading") {
    return <LoadingScreen />;
  }

  // Non connecté → stack Auth
  if (status === "unauthenticated" || !user) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  // Connecté → route selon le rôle
  if (user.role === "PARENT") {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="ParentDashboard"
          component={ParentDashboardScreen}
          options={{ title: "Espace Parent" }}
        />
      </Stack.Navigator>
    );
  }

  if (user.role === "EDUCATEUR") {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="EducatorDashboard"
          component={EducatorDashboardScreen}
          options={{ title: "Espace Éducateur" }}
        />
      </Stack.Navigator>
    );
  }

  // Autres rôles (PRESIDENT, DIRECTEUR, ADMIN) → ne pas utiliser mobile
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="NotAllowed"
        component={NotAllowedScreen}
        options={{ title: "Accès non autorisé" }}
      />
    </Stack.Navigator>
  );
};
