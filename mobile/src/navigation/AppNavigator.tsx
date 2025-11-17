import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../features/auth/AuthContext";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { ParentNavigator } from "./ParentNavigator";
import { EducatorNavigator } from "./EducatorNavigator";
export type RootStackParamList = {
  Login: undefined;
  ParentDashboard: undefined; // we keep the name but render ParentNavigator
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
      <Text style={styles.loadingText}>Accès non autorisé</Text>
      {/* you can add a logout button here if you want */}
    </View>
  );
};

export const AppNavigator = () => {
  const { user, status } = useAuth(); // 👈 use status instead of loading

  if (status === "loading") {
    return <LoadingScreen />;
  }

  // not authenticated → show login
  if (status === "unauthenticated" || !user) {
    return <LoginScreen />;
  }

  // authenticated + parent
  if (user.role === "PARENT") {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ParentDashboard" component={ParentNavigator} />
      </Stack.Navigator>
    );
  }

  // authenticated + educator
  if (user.role === "EDUCATEUR") {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="EducatorDashboard"
          component={EducatorNavigator} // nested, but extra stack
        />
      </Stack.Navigator>
    );
  }

  // authenticated but role not allowed
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
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 8 },
});
