// src/screens/auth/LoginScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useAuth } from "../../features/auth/AuthContext";

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("parent@test.com"); // pour tester
  const [password, setPassword] = useState("123456"); // pour tester
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez saisir email et mot de passe.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // La navigation se fera automatiquement via AppNavigator selon le rôle
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erreur", "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <Text style={styles.subtitle}>Parent / Éducateur</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Se connecter" onPress={handleSubmit} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
});
