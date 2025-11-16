// src/screens/parent/ParentDashboardScreen.tsx
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../features/auth/AuthContext";

export const ParentDashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue Parent</Text>
      <Text style={styles.subtitle}>
        {user?.prenom} {user?.nom} ({user?.role})
      </Text>
      <Button title="Se déconnecter" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
});
