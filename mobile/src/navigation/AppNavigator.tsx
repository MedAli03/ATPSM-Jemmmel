// src/navigation/AppNavigator.tsx
import React from "react";
import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../features/auth/AuthContext";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { EducatorDashboardScreen } from "../screens/educateur/EducatorDashboardScreen";
import { ParentDashboardScreen } from "../screens/parent/ParentDashboardScreen";

export type RootStackParamList = {
  Login: undefined;
  ParentDashboard: undefined;
  EducatorDashboard: undefined;
  NotAllowed: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const LoadingScreen = () => (
  <View style={styles.centered}>
    <ActivityIndicator />
    <Text style={styles.loadingText}>Chargement...</Text>
  </View>
);

const NotAllowedScreen = () => {
  const { logout } = useAuth();

  return (
    <View style={styles.centered}>
      <Text style={styles.loadingText}>Ce rôle n'a pas accès à l'application mobile.</Text>
      <Button title="Se déconnecter" onPress={logout} />
    </View>
  );
};

export const AppNavigator: React.FC = () => {
  const { status, user } = useAuth();

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status === "unauthenticated" || !user) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

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

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    textAlign: "center",
  },
});
