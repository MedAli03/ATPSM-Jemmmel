// src/screens/educateur/EducatorDashboardScreen.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../features/auth/AuthContext";
import { EducatorNavigator } from "../../navigation/EducatorNavigator";

export const EducatorDashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>مرحباً، {user?.prenom ?? "المربي"}</Text>
        <Text style={styles.subtitle}>هذا هو فضاؤك لمتابعة المجموعات والأطفال.</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>مجموعاتي</Text>
      <View style={styles.navigatorWrapper}>
        <EducatorNavigator />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FA",
    padding: 16,
    direction: "rtl",
    writingDirection: "rtl",
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
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
  logoutButton: {
    marginTop: 16,
    alignSelf: "flex-start",
    backgroundColor: "#FEE2E2",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  logoutText: {
    color: "#B91C1C",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "right",
    marginBottom: 12,
  },
  navigatorWrapper: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
});
