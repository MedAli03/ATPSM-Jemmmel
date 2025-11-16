// src/screens/parent/ParentDashboardScreen.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../features/auth/AuthContext";
import { ParentNavigator } from "../../navigation/ParentNavigator";

export const ParentDashboardScreen: React.FC = () => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Bienvenue, {user?.prenom ?? "Parent"}</Text>
        <Text style={styles.subtitle}>Rôle: {user?.role ?? "PARENT"}</Text>
      </View>
      <View style={styles.navigatorContainer}>
        <ParentNavigator />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  welcome: {
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    marginTop: 4,
    color: "#666",
  },
  navigatorContainer: {
    flex: 1,
  },
});
