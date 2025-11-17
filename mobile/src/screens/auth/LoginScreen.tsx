// src/screens/auth/LoginScreen.tsx
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../features/auth/AuthContext";

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("خطأ", "يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      console.error("Login failed", error);
      Alert.alert("خطأ", "حدث خطأ، يرجى التحقق من البيانات.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>تسجيل الدخول</Text>
          <Text style={styles.subtitle}>مرحباً بك في منصة الجمعية</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>البريد الإلكتروني</Text>
          <TextInput
            style={styles.input}
            placeholder="البريد الإلكتروني"
            placeholderTextColor="#9AA0B5"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            textAlign="right"
          />

          <Text style={styles.label}>كلمة المرور</Text>
          <TextInput
            style={styles.input}
            placeholder="كلمة المرور"
            placeholderTextColor="#9AA0B5"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            textAlign="right"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>تسجيل الدخول</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FA",
    padding: 20,
    direction: "rtl",
    writingDirection: "rtl",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    marginTop: 8,
    textAlign: "right",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1F2937",
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: "#FDFDFE",
    fontSize: 16,
    color: "#111827",
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});
