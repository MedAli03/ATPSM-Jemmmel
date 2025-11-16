// src/screens/parent/ParentDashboardScreen.tsx
import React from "react";
import { View, Text, Button } from "react-native";
import { useAuth } from "../../features/auth/AuthContext";

export const ParentDashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Bienvenue Parent 👨‍👩‍👧</Text>
      <Text>{user?.prenom} {user?.nom}</Text>
      <Button title="Se déconnecter" onPress={logout} />
    </View>
  );
};
