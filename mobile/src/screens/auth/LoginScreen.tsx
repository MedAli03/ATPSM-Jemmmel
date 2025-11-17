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
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    const validationErrors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      validationErrors.email = "يرجى إدخال البريد الإلكتروني.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      validationErrors.email = "صيغة البريد الإلكتروني غير صحيحة.";
    }

    if (!password) {
      validationErrors.password = "يرجى إدخال كلمة المرور.";
    } else if (password.length < 6) {
      validationErrors.password = "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل.";
    }

    if (validationErrors.email || validationErrors.password) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    setLoading(true);
    try {
      await login(trimmedEmail, password);
    } catch (error) {
      console.error("Login failed", error);
      Alert.alert(
        "فشل تسجيل الدخول",
        "البريد الإلكتروني أو كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى."
      );
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
          <Text style={styles.badgeText}>منصة الجمعية</Text>
          <Text style={styles.title}>تسجيل الدخول</Text>
          <Text style={styles.subtitle}>مرحباً بك من جديد، يسعدنا رؤيتك.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل البريد الإلكتروني"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              textAlign="right"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>كلمة المرور</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل كلمة المرور"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              textAlign="right"
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
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
  },
  badgeText: {
    alignSelf: "flex-start",
    color: "#1D4ED8",
    backgroundColor: "rgba(37, 99, 235, 0.12)",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 12,
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
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1E293B",
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0F172A",
    backgroundColor: "#FDFDFE",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: 6,
    textAlign: "right",
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
