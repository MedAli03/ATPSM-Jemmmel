// src/screens/parent/ParentProfileScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { useAuth } from "../../features/auth/AuthContext";

export const ParentProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const parent = {
    name: (user as any)?.fullName || (user as any)?.name || "وليّ الأمر",
    email: (user as any)?.email || "no-email@example.com",
    role: "وليّ أمر",
    childrenCount: 2, // TODO: remplacer plus tard par vraie donnée
    memberSince: "2024-09-01", // TODO: remplacer par createdAt si dispo
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      "تغيير الصورة",
      "سيتم لاحقاً تمكينك من اختيار صورة جديدة من المعرض."
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />
      <View style={styles.root}>
        {/* Top header / hero */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroSubtitle}>ملف الحساب</Text>
              <Text style={styles.heroTitle}>{parent.name}</Text>
              <Text style={styles.heroRole}>{parent.role}</Text>
            </View>

            <View style={styles.heroAvatarBlock}>
              <View style={styles.heroAvatarCircle}>
                <Text style={styles.heroAvatarText}>
                  {parent.name?.charAt(0) || "و"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleChangeAvatar}
                activeOpacity={0.8}
              >
                <Text style={styles.heroChangeAvatar}>تغيير الصورة</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Small stats row inside header */}
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>أطفالك في المنصّة</Text>
              <Text style={styles.heroStatValue}>{parent.childrenCount}</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>عضو منذ</Text>
              <Text style={styles.heroStatValue}>{parent.memberSince}</Text>
            </View>
          </View>
        </View>

        {/* Content cards */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Account info */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>معلومات الحساب</Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>الاسم الكامل</Text>
              <Text style={styles.value}>{parent.name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <Text style={styles.value}>{parent.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>الدور في المنصّة</Text>
              <Text style={styles.value}>{parent.role}</Text>
            </View>

            <View style={styles.infoRowLast}>
              <Text style={styles.label}>تاريخ الانضمام</Text>
              <Text style={styles.value}>{parent.memberSince}</Text>
            </View>
          </View>

          {/* Children info */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>متابعة الأطفال</Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>عدد الأطفال المرتبطين</Text>
              <Text style={styles.value}>{parent.childrenCount}</Text>
            </View>

            <Text style={styles.helperText}>
              سيتم لاحقاً ربط هذا العدد بالبيانات الحقيقية الخاصة بأطفالك في
              الجمعية، مع إمكانية إدارة الربط من الموقع الرئيسي.
            </Text>
          </View>

          {/* App info */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>عن التطبيق</Text>
            <Text style={styles.helperText}>
              هذا التطبيق مخصّص للأولياء لمتابعة تقدّم أطفالهم، الاطلاع على
              الملاحظات اليومية، والتفاعل بشكل آمن مع الفريق التربوي للجمعية.
            </Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>إصدار التطبيق</Text>
              <Text style={styles.metaValue}>1.0.0</Text>
            </View>
          </View>

          {/* Logout */}
          <View style={styles.logoutWrapper}>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={logout}
              activeOpacity={0.85}
            >
              <Text style={styles.logoutText}>تسجيل الخروج</Text>
            </TouchableOpacity>
            <Text style={styles.logoutHelper}>
              سيتم إنهاء جلستك الحالية والعودة إلى شاشة تسجيل الدخول.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  root: {
    flex: 1,
    backgroundColor: "#F3F4FF",
    writingDirection: "rtl",
  },

  /* Hero header */
  hero: {
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  heroContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTextBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#BFDBFE",
    fontWeight: "500",
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "800",
  },
  heroRole: {
    fontSize: 13,
    color: "#E0F2FE",
    marginTop: 4,
  },
  heroAvatarBlock: {
    alignItems: "center",
    marginLeft: 12,
  },
  heroAvatarCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#93C5FD",
  },
  heroAvatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  heroChangeAvatar: {
    marginTop: 6,
    fontSize: 12,
    color: "#E0F2FE",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  heroStatsRow: {
    flexDirection: "row-reverse",
    backgroundColor: "#1E40AF",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  heroStatItem: {
    flex: 1,
    alignItems: "flex-end",
  },
  heroStatLabel: {
    fontSize: 11,
    color: "#C7D2FE",
  },
  heroStatValue: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "700",
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 26,
    backgroundColor: "#3B82F6",
    marginHorizontal: 12,
    opacity: 0.7,
  },

  /* Scroll content */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },

  /* Cards */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
    marginBottom: 10,
  },
  infoRow: {
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
  },
  infoRowLast: {
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "right",
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: "#111827",
    textAlign: "right",
    fontWeight: "500",
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
    marginTop: 6,
    lineHeight: 20,
  },
  metaRow: {
    marginTop: 10,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  metaValue: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
  },

  /* Logout */
  logoutWrapper: {
    marginTop: 8,
  },
  logoutBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: "center",
    shadowColor: "#B91C1C",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  logoutHelper: {
    marginTop: 6,
    fontSize: 11,
    textAlign: "center",
    color: "#6B7280",
  },
});
