// src/screens/parent/ParentDashboardScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../features/auth/AuthContext";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type ParentNav = NativeStackNavigationProp<ParentStackParamList, "ParentTabs">;

type ChildSummary = {
  id: number;
  firstName: string;
  lastName: string;
  groupName: string;
  educatorName: string;
  lastNoteDate: string;
  lastNotePreview: string;
};

const MOCK_CHILDREN: ChildSummary[] = [
  {
    id: 1,
    firstName: "Ahmed",
    lastName: "Ben Ali",
    groupName: "مجموعة الألوان - 2024/2025",
    educatorName: "أ. مريم",
    lastNoteDate: "12/11/2025",
    lastNotePreview: "Ahmed était calme aujourd’hui et a bien participé à l’atelier…",
  },
];

export const ParentDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<ParentNav>();
  const [children, setChildren] = useState<ChildSummary[]>([]);

  useEffect(() => {
    // TODO: replace with real API call
    setChildren(MOCK_CHILDREN);
  }, []);

  const parentName =
    (user as any)?.fullName ||
    (user as any)?.name ||
    (user as any)?.username ||
    "ولي الأمر";

  const openChildDetails = (childId: number) => {
    navigation.navigate("ChildDetails", { childId });
  };

  const openChildTimeline = (childId: number) => {
    navigation.navigate("ChildTimeline", { childId });
  };

  const openChat = (childId: number) => {
    navigation.navigate("ChatThread", { childId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.helloText}>مرحبًا، {parentName}</Text>
          <Text style={styles.subTitle}>لوحة وليّ الأمر · Espace Parent</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SUMMARY CARDS */}
          <View style={styles.row}>
            <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
              <Text style={styles.summaryLabel}>أطفالي</Text>
              <Text style={styles.summaryValue}>{children.length}</Text>
              <Text style={styles.summaryHint}>اضغط على بطاقة الطفل لعرض تفاصيله</Text>
            </View>

            <View style={[styles.summaryCard, styles.summaryCardSecondary]}>
              <Text style={styles.summaryLabel}>آخر تحديث</Text>
              <Text style={styles.summaryValueSmall}>
                {children[0]?.lastNoteDate || "-"}
              </Text>
              <Text style={styles.summaryHint}>تاريخ آخر ملاحظة تربوية</Text>
            </View>
          </View>

          {/* CHILDREN LIST */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>أطفالي</Text>
              <Text style={styles.sectionSubtitle}>Mes enfants</Text>
            </View>

            {children.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>لا يوجد أطفال مسجّلين بعد</Text>
                <Text style={styles.emptyText}>
                  سيتمّ ربط حسابك بأطفالك من طرف إدارة الجمعية.
                </Text>
              </View>
            ) : (
              children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={styles.childCard}
                  activeOpacity={0.85}
                  onPress={() => openChildDetails(child.id)}
                >
                  <View style={styles.childHeaderRow}>
                    <View style={styles.childNameContainer}>
                      <Text style={styles.childName}>
                        {child.firstName} {child.lastName}
                      </Text>
                      <Text style={styles.childGroup}>{child.groupName}</Text>
                    </View>
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>تابع اليوم</Text>
                    </View>
                  </View>

                  <View style={styles.childMetaRow}>
                    <Text style={styles.childMetaLabel}>المربية:</Text>
                    <Text style={styles.childMetaValue}>{child.educatorName}</Text>
                  </View>

                  <View style={styles.lastNoteBox}>
                    <Text style={styles.lastNoteLabel}>
                      آخر ملاحظة · {child.lastNoteDate}
                    </Text>
                    <Text style={styles.lastNoteText} numberOfLines={2}>
                      {child.lastNotePreview}
                    </Text>
                  </View>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={styles.cardAction}
                      onPress={() => openChildDetails(child.id)}
                    >
                      <Text style={styles.cardActionEmoji}>📘</Text>
                      <Text style={styles.cardActionText}>ملف الطفل</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cardAction}
                      onPress={() => openChildTimeline(child.id)}
                    >
                      <Text style={styles.cardActionEmoji}>🕒</Text>
                      <Text style={styles.cardActionText}>تابع يوم الطفل</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cardAction}
                      onPress={() => openChat(child.id)}
                    >
                      <Text style={styles.cardActionEmoji}>💬</Text>
                      <Text style={styles.cardActionText}>راسل المربية</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* QUICK ACTIONS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
              <Text style={styles.sectionSubtitle}>Actions rapides</Text>
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate("ParentTabs", { /* stays on Messages tab via tab nav if needed */ } as any)}
              >
                <Text style={styles.quickEmoji}>📩</Text>
                <Text style={styles.quickTitle}>الرسائل</Text>
                <Text style={styles.quickText}>عرض المحادثات مع المربين والإدارة</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                // tab switch will be handled from tab navigator side if needed
              >
                <Text style={styles.quickEmoji}>🔔</Text>
                <Text style={styles.quickTitle}>الإشعارات</Text>
                <Text style={styles.quickText}>اطلع على آخر التنبيهات حول طفلك</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ATPSM – Jemmel · منصة متابعة الأطفال بالتعاون مع الجمعية.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// ----- styles (same as before) -----
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F6FA" },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 12, paddingBottom: 8 },
  helloText: { fontSize: 22, fontWeight: "700", color: "#222", textAlign: "left" },
  subTitle: { fontSize: 14, color: "#666", marginTop: 4, textAlign: "left" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    justifyContent: "space-between",
  },
  summaryCardPrimary: {
    backgroundColor: "#2962FF10",
    borderWidth: 1,
    borderColor: "#2962FF30",
  },
  summaryCardSecondary: {
    backgroundColor: "#FFB30010",
    borderWidth: 1,
    borderColor: "#FFB30030",
  },
  summaryLabel: { fontSize: 13, color: "#555", marginBottom: 4 },
  summaryValue: { fontSize: 26, fontWeight: "800", color: "#1E40AF" },
  summaryValueSmall: { fontSize: 18, fontWeight: "700", color: "#92400E" },
  summaryHint: { fontSize: 12, color: "#777", marginTop: 6 },
  section: { marginTop: 16 },
  sectionHeader: { marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  sectionSubtitle: { fontSize: 13, color: "#6B7280" },
  emptyBox: {
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 4 },
  emptyText: { fontSize: 13, color: "#6B7280" },
  childCard: {
    marginTop: 8,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  childHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  childNameContainer: { flex: 1, paddingRight: 8 },
  childName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  childGroup: { fontSize: 13, color: "#4B5563", marginTop: 2 },
  chip: { backgroundColor: "#2563EB15", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  chipText: { fontSize: 12, color: "#1D4ED8", fontWeight: "600" },
  childMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  childMetaLabel: { fontSize: 13, color: "#6B7280" },
  childMetaValue: { fontSize: 13, color: "#111827", marginLeft: 4, fontWeight: "500" },
  lastNoteBox: { marginTop: 10, padding: 10, borderRadius: 12, backgroundColor: "#F9FAFB" },
  lastNoteLabel: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  lastNoteText: { fontSize: 13, color: "#111827" },
  cardActionsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  cardAction: { alignItems: "center", flex: 1 },
  cardActionEmoji: { fontSize: 18 },
  cardActionText: { fontSize: 11, marginTop: 2, color: "#374151" },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickEmoji: { fontSize: 22, marginBottom: 6 },
  quickTitle: { fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 4 },
  quickText: { fontSize: 12, color: "#6B7280" },
  footer: { marginTop: 24, alignItems: "center" },
  footerText: { fontSize: 11, color: "#9CA3AF", textAlign: "center" },
});
