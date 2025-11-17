import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../../features/auth/AuthContext";

export const EducatorProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const educator = {
    name: (user as any)?.fullName || (user as any)?.name || "المربّي/ـة",
    email: (user as any)?.email || "no-email@example.com",
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>حساب المربّي/ـة</Text>
        <Text style={styles.label}>الاسم</Text>
        <Text style={styles.value}>{educator.name}</Text>

        <Text style={styles.label}>البريد الإلكتروني</Text>
        <Text style={styles.value}>{educator.email}</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 16 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  label: { fontSize: 13, fontWeight: "500", marginTop: 10, color: "#6B7280" },
  value: { fontSize: 14, color: "#111827", marginTop: 2 },
  logoutBtn: {
    marginTop: 24,
    backgroundColor: "#DC2626",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});
