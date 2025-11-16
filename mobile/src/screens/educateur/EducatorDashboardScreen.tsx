// src/screens/educateur/EducatorDashboardScreen.tsx
import React from "react";
import { View, Text, Button } from "react-native";
import { useAuth } from "../../features/auth/AuthContext";

export const EducatorDashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Bienvenue Éducateur 👨‍🏫</Text>
      <Text>{user?.prenom} {user?.nom}</Text>
      <Button title="Se déconnecter" onPress={logout} />
    </View>
  );
};
