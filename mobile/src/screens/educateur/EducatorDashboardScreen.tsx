// src/screens/educateur/EducatorDashboardScreen.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../features/auth/AuthContext";
import { EducatorNavigator } from "../../navigation/EducatorNavigator";

export const EducatorDashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bienvenue, {user?.prenom ?? "Éducateur"}</Text>
          <Text style={styles.subtitle}>{user?.role ?? "EDUCATEUR"}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.navigatorContainer}>
        <EducatorNavigator />
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
    borderBottomColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    marginTop: 4,
    color: "#666",
  },
  logout: {
    color: "#d9534f",
    fontWeight: "600",
  },
  navigatorContainer: {
    flex: 1,
  },
});
