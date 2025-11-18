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

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmedEmailValue = email.trim();
  const trimmedPasswordValue = password.trim();
  const canSubmit =
    emailRegex.test(trimmedEmailValue) && trimmedPasswordValue.length >= 6;

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    const trimmedEmail = trimmedEmailValue;
    const trimmedPassword = trimmedPasswordValue;

    if (!trimmedEmail) {
      setEmailError("يرجى إدخال البريد الإلكتروني.");
      isValid = false;
    } else {
      if (!emailRegex.test(trimmedEmail)) {
        setEmailError("صيغة البريد الإلكتروني غير صحيحة.");
        isValid = false;
      }
    }

    if (!trimmedPassword) {
      setPasswordError("يرجى إدخال كلمة المرور.");
      isValid = false;
    } else if (trimmedPassword.length < 6) {
      setPasswordError("يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل.");
      isValid = false;
    }

    if (!isValid) {
      Alert.alert("خطأ", "يرجى تصحيح الحقول المحددة.");
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email.trim(), password.trim());
    } catch (error: any) {
      console.error("Login failed", error);

      let message =
        "البريد الإلكتروني أو كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.";

      if (error?.response?.status >= 500) {
        message = "حدث خطأ في الخادم، يرجى المحاولة لاحقاً.";
      }

      Alert.alert("فشل تسجيل الدخول", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header / Hero */}
        <View style={styles.heroSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>AT</Text>
          </View>

          <View style={styles.heroTextContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>منصة الجمعية</Text>
            </View>
            <Text style={styles.title}>تسجيل الدخول</Text>
            <Text style={styles.subtitle}>
              مرحباً بك من جديد، يسعدنا رؤيتك 👋{"\n"}سجّل دخولك لمتابعة تقدم
              الأطفال.
            </Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <View
              style={[
                styles.inputWrapper,
                emailError ? styles.inputWrapperError : null,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="أدخل البريد الإلكتروني"
                placeholderTextColor="#9AA0B5"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                textAlign="right"
              />
            </View>
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>كلمة المرور</Text>
            <View
              style={[
                styles.inputWrapper,
                passwordError ? styles.inputWrapperError : null,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="أدخل كلمة المرور"
                placeholderTextColor="#9AA0B5"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                textAlign="right"
              />
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          {/* Forgot password */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.forgotWrapper}
            onPress={() =>
              Alert.alert(
                "تنبيه",
                "ميزة استرجاع كلمة المرور سيتم تفعيلها لاحقاً."
              )
            }
          >
            <Text style={styles.forgotText}>هل نسيت كلمة المرور؟</Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity
            style={[styles.button, (!canSubmit || loading) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading || !canSubmit}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>تسجيل الدخول</Text>
            )}
          </TouchableOpacity>

          {/* Helper text */}
          <Text style={styles.helperText}>
            بتسجيلك للدخول، فإنك توافق على شروط الاستخدام وسياسة الخصوصية الخاصة
            بالجمعية.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            هذا التطبيق مخصص للأولياء والمربين في الجمعية لمتابعة تقدم الأطفال
            والتواصل مع الفريق التربوي.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    writingDirection: "rtl",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
  },
  heroSection: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  heroTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  badge: {
    backgroundColor: "rgba(37, 99, 235, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  badgeText: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
  },
  subtitle: {
    fontSize: 15,
    color: "#475569",
    marginTop: 6,
    textAlign: "right",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
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
  inputWrapperError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  input: {
    paddingVertical: 12,
    fontSize: 16,
    color: "#0F172A",
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: "#DC2626",
    textAlign: "right",
  },
  forgotWrapper: {
    marginTop: 4,
    marginBottom: 12,
    alignItems: "flex-end",
  },
  forgotText: {
    fontSize: 13,
    color: "#2563EB",
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  helperText: {
    marginTop: 16,
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "right",
    lineHeight: 20,
  },
  footer: {
    marginTop: 20,
    paddingHorizontal: 4,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
});
