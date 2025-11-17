// src/screens/parent/ParentDashboardScreen.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../features/auth/AuthContext";
import { ParentNavigator } from "../../navigation/ParentNavigator";

export const ParentDashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.title}>مرحباً، {user?.prenom ?? "ولي الأمر"}</Text>
          <Text style={styles.subtitle}>هنا يمكنك متابعة تقدم أطفالك.</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>أطفالي</Text>
      <View style={styles.navigatorWrapper}>
        <ParentNavigator />
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
    borderRadius: 16,
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
    alignSelf: "flex-start",
    marginTop: 16,
    backgroundColor: "#FEE2E2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  logoutText: {
    color: "#B91C1C",
    fontWeight: "600",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "right",
  },
  navigatorWrapper: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
});
