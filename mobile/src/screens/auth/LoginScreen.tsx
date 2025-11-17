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
        <View style={styles.heroSection}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>منصة الجمعية</Text>
          </View>
          <Text style={styles.title}>تسجيل الدخول</Text>
          <Text style={styles.subtitle}>مرحباً بك من جديد، يسعدنا رؤيتك.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <View style={styles.inputWrapper}>
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
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>كلمة المرور</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="كلمة المرور"
                placeholderTextColor="#9AA0B5"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                textAlign="right"
              />
            </View>
          </View>

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

          <Text style={styles.helperText}>
            بتسجيلك للدخول تؤكد موافقتك على سياسات الجمعية.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FA",
    paddingHorizontal: 24,
    paddingVertical: 32,
    direction: "rtl",
    writingDirection: "rtl",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
  },
  heroSection: {
    marginBottom: 24,
    alignItems: "flex-start",
  },
  badge: {
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: {
    color: "#1D4ED8",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
  },
  subtitle: {
    fontSize: 16,
    color: "#475569",
    marginTop: 6,
    textAlign: "right",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1E293B",
    textAlign: "right",
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: "#FDFDFE",
  },
  input: {
    paddingVertical: 12,
    fontSize: 16,
    color: "#0F172A",
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  helperText: {
    marginTop: 16,
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "right",
    lineHeight: 20,
  },
});
