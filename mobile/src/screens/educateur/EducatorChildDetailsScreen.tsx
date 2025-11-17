// src/screens/educateur/EducatorChildDetailsScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";

type Route = RouteProp<EducatorStackParamList, "EducatorChildDetails">;
type Nav = NativeStackNavigationProp<EducatorStackParamList>;

export const EducatorChildDetailsScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { childId } = params;

  // TODO: replace all this with real API calls
  const child = {
    id: childId,
    firstName: "Ahmed",
    lastName: "Ben Ali",
    birthDate: "2017-04-10",
    group: "مجموعة الألوان",
    diagnosis: "TSA - Niveau 2 (communication + interaction sociale)",
    allergies: "لا يوجد",
    needs: "Structure visuelle, routines stables, temps de transition.",
  };

  const peiSummary = {
    status: "ACTIVE" as "ACTIVE" | "TO_REVIEW" | "CLOSED",
    lastUpdate: "2025-11-01",
    nextReview: "2026-02-01",
    objectivesCount: 4,
    activitiesCount: 9,
  };

  const observation = {
    exists: true,
    date: "2025-10-15",
    completed: true,
  };

  const lastEvaluations = [
    {
      id: 1,
      date: "2025-11-10",
      summary: "تحسّن ملحوظ في التواصل البصري خلال الأنشطة المهيكلة.",
    },
    {
      id: 2,
      date: "2025-09-01",
      summary: "ثبات في تنفيذ الروتين الصباحي مع دعم بسيط.",
    },
  ];

  const lastActivities = [
    {
      id: 1,
      date: "2025-11-15",
      title: "لعبة تصنيف الألوان",
    },
    {
      id: 2,
      date: "2025-11-12",
      title: "تمارين حركية دقيقة بالمعجون",
    },
  ];

  const fullName = `${child.firstName} ${child.lastName}`;

  const renderPeiStatusLabel = () => {
    switch (peiSummary.status) {
      case "ACTIVE":
        return "PEI مفعّل";
      case "TO_REVIEW":
        return "في انتظار مراجعة";
      default:
        return "PEI مغلق";
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.childName}>{fullName}</Text>
            <Text style={styles.childGroup}>{child.group}</Text>
          </View>
          <View
            style={[
              styles.peiStatusChip,
              peiSummary.status === "ACTIVE"
                ? styles.peiStatusActive
                : peiSummary.status === "TO_REVIEW"
                ? styles.peiStatusToReview
                : styles.peiStatusClosed,
            ]}
          >
            <Text style={styles.peiStatusText}>{renderPeiStatusLabel()}</Text>
          </View>
        </View>

        <Text style={styles.headerHelper}>
          ملف شامل للطفل يجمع الملاحظة الأوّلية، الـ PEI، التقييمات والأنشطة
          التربوية.
        </Text>
      </View>

      {/* BASIC INFO */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>نبذة عن الطفل</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>تاريخ الميلاد</Text>
          <Text style={styles.infoValue}>{child.birthDate}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>التشخيص</Text>
          <Text style={styles.infoValue}>{child.diagnosis}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>الحساسيّات</Text>
          <Text style={styles.infoValue}>{child.allergies}</Text>
        </View>

        <View style={styles.infoRowColumn}>
          <Text style={styles.infoLabel}>الاحتياجات التربوية</Text>
          <Text style={styles.infoValue}>{child.needs}</Text>
        </View>
      </View>

      {/* OBSERVATION INITIALE */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>الملاحظة الأوّلية</Text>
        <Text style={styles.sectionSubtitle}>
          Observation initiale · نقطة الانطلاق لبناء الـ PEI.
        </Text>

        <View style={styles.obsRow}>
          <View style={{ flex: 1 }}>
            {observation.exists ? (
              <>
                <Text style={styles.obsStatusText}>
                  {observation.completed
                    ? "ملاحظة أولية مكتملة."
                    : "ملاحظة أولية في طور الإنجاز."}
                </Text>
                <Text style={styles.obsDate}>
                  آخر تحديث: {observation.date}
                </Text>
              </>
            ) : (
              <Text style={styles.obsStatusText}>
                لم تتم بعد إضافة ملاحظة أوّلية لهذا الطفل.
              </Text>
            )}
          </View>
          <View
            style={[
              styles.obsStatusChip,
              observation.exists && observation.completed
                ? styles.obsStatusDone
                : styles.obsStatusPending,
            ]}
          >
            <Text style={styles.obsStatusChipText}>
              {observation.exists
                ? observation.completed
                  ? "مكتملة"
                  : "غير مكتملة"
                : "غير موجودة"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.obsButton}
          onPress={() =>
            navigation.navigate("ObservationInitiale", { childId })
          }
        >
          <Text style={styles.obsButtonText}>إدارة الملاحظة الأوّلية</Text>
        </TouchableOpacity>
      </View>

      {/* PEI SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>PEI الحالي</Text>
        <Text style={styles.sectionSubtitle}>
          Projet Éducatif Individuel · الأهداف والأنشطة والتقييمات.
        </Text>

        <View style={styles.peiRow}>
          <View style={styles.peiColumn}>
            <Text style={styles.peiLabel}>آخر تحديث</Text>
            <Text style={styles.peiValue}>{peiSummary.lastUpdate}</Text>
          </View>
          <View style={styles.peiColumn}>
            <Text style={styles.peiLabel}>مراجعة قادمة</Text>
            <Text style={styles.peiValue}>{peiSummary.nextReview}</Text>
          </View>
        </View>

        <View style={styles.peiRow}>
          <View style={styles.peiColumn}>
            <Text style={styles.peiLabel}>عدد الأهداف</Text>
            <Text style={styles.peiValue}>{peiSummary.objectivesCount}</Text>
          </View>
          <View style={styles.peiColumn}>
            <Text style={styles.peiLabel}>عدد الأنشطة</Text>
            <Text style={styles.peiValue}>{peiSummary.activitiesCount}</Text>
          </View>
        </View>

        <View style={styles.peiActionsRow}>
          <TouchableOpacity
            style={styles.peiActionBtn}
            onPress={() =>
              navigation.navigate("EducatorPeiDetail", {
                childId: child.id,
                peiId: 1, // later: real PEI id from API
              })
            }
          >
            <Text style={styles.peiActionText}>عرض تفاصيل الـ PEI</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LAST EVALUATIONS & ACTIVITIES */}
      <View style={styles.rowCardWrapper}>
        {/* EVALUATIONS */}
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.sectionTitleSmall}>آخر التقييمات</Text>

          {lastEvaluations.length === 0 ? (
            <Text style={styles.mutedText}>لا توجد تقييمات مسجّلة بعد.</Text>
          ) : (
            lastEvaluations.map((e) => (
              <View key={e.id} style={styles.itemRow}>
                <Text style={styles.itemDate}>{e.date}</Text>
                <Text style={styles.itemSummary}>{e.summary}</Text>
              </View>
            ))
          )}
        </View>

        {/* ACTIVITIES */}
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.sectionTitleSmall}>آخر الأنشطة</Text>

          {lastActivities.length === 0 ? (
            <Text style={styles.mutedText}>لا توجد أنشطة مسجّلة بعد.</Text>
          ) : (
            lastActivities.map((a) => (
              <View key={a.id} style={styles.itemRow}>
                <Text style={styles.itemDate}>{a.date}</Text>
                <Text style={styles.itemSummary}>{a.title}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
        <Text style={styles.sectionSubtitle}>
          إضافة ملاحظة يومية، نشاط تربوي أو مراسلة الوليّ.
        </Text>

        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() =>
              navigation.navigate("DailyNoteForm", { childId: child.id })
            }
          >
            <Text style={styles.quickEmoji}>📝</Text>
            <Text style={styles.quickLabel}>ملاحظة يومية</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() =>
              navigation.navigate("ActivityForm", { childId: child.id })
            }
          >
            <Text style={styles.quickEmoji}>🎯</Text>
            <Text style={styles.quickLabel}>نشاط جديد</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() =>
              navigation.navigate("EducatorChatThread", {
                childId: child.id,
              })
            }
          >
            <Text style={styles.quickEmoji}>💬</Text>
            <Text style={styles.quickLabel}>رسالة مع الوليّ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SPACER */}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { padding: 16, paddingBottom: 24 },

  headerCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  childName: { fontSize: 18, fontWeight: "700", color: "#111827" },
  childGroup: { fontSize: 13, color: "#4B5563", marginTop: 2 },
  headerHelper: { fontSize: 12, color: "#4B5563", marginTop: 4 },

  peiStatusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  peiStatusText: { fontSize: 11, fontWeight: "600" },
  peiStatusActive: { backgroundColor: "#DCFCE7" },
  peiStatusToReview: { backgroundColor: "#FEF3C7" },
  peiStatusClosed: { backgroundColor: "#E5E7EB" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  sectionSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 4 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  infoRowColumn: {
    marginTop: 10,
  },
  infoLabel: { fontSize: 13, color: "#6B7280" },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    maxWidth: "70%",
  },

  // Observation
  obsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  obsStatusText: { fontSize: 13, color: "#111827" },
  obsDate: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  obsStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 8,
  },
  obsStatusChipText: { fontSize: 11, fontWeight: "600" },
  obsStatusDone: { backgroundColor: "#DBEAFE" },
  obsStatusPending: { backgroundColor: "#FEE2E2" },
  obsButton: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  obsButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },

  // PEI summary
  peiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  peiColumn: { flex: 1 },
  peiLabel: { fontSize: 12, color: "#6B7280" },
  peiValue: { fontSize: 14, color: "#111827", marginTop: 2 },
  peiActionsRow: { flexDirection: "row", marginTop: 12 },
  peiActionBtn: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2563EB",
    paddingVertical: 10,
    alignItems: "center",
  },
  peiActionText: { fontSize: 13, fontWeight: "600", color: "#2563EB" },

  // Evaluations & activities
  rowCardWrapper: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  halfCard: {
    flex: 1,
  },
  sectionTitleSmall: { fontSize: 15, fontWeight: "700", color: "#111827" },
  mutedText: { fontSize: 12, color: "#9CA3AF", marginTop: 6 },
  itemRow: { marginTop: 8 },
  itemDate: { fontSize: 11, color: "#9CA3AF" },
  itemSummary: { fontSize: 13, color: "#111827", marginTop: 2 },

  // Quick actions
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  quickBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  quickEmoji: { fontSize: 20 },
  quickLabel: { fontSize: 12, color: "#111827", marginTop: 4 },
});

export default EducatorChildDetailsScreen;
