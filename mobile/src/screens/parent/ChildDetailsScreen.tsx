import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { useChildDetail } from "../../features/parent/hooks";

type ChildDetailsRoute = RouteProp<ParentStackParamList, "ChildDetails">;
type Nav = NativeStackNavigationProp<ParentStackParamList>;

export const ChildDetailsScreen: React.FC = () => {
  const { params } = useRoute<ChildDetailsRoute>();
  const { childId } = params;
  const navigation = useNavigation<Nav>();
  const { child, isLoading, isError, error, refetch } = useChildDetail(childId);

  const parentName = child?.parent
    ? `${child.parent.prenom ?? ""} ${child.parent.nom ?? ""}`.trim()
    : null;

  if (isLoading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator color="#2563EB" />
        <Text style={styles.loadingText}>جارٍ تحميل ملف الطفل...</Text>
      </View>
    );
  }

  if (isError || !child) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>{error ?? "تعذّر تحميل بيانات الطفل."}</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
          <Text style={styles.retryText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>ملف الطفل</Text>
        <Text style={styles.name}>
          {child.prenom} {child.nom}
        </Text>
        <Text style={styles.label}>تاريخ الميلاد:</Text>
        <Text style={styles.value}>{child.date_naissance}</Text>

        <Text style={styles.label}>المجموعة / السنة:</Text>
        <Text style={styles.value}>{child.groupe_actuel?.nom ?? "غير محدد"}</Text>

        <Text style={styles.label}>المربية / éducateur référent:</Text>
        <Text style={styles.value}>
          {child.educateur_referent
            ? `${child.educateur_referent.prenom ?? ""} ${child.educateur_referent.nom ?? ""}`.trim()
            : "غير محدد"}
        </Text>
        <TouchableOpacity
          style={styles.timelineBtn}
          onPress={() => navigation.navigate("ChildTimeline", { childId })}
        >
          <Text style={styles.timelineBtnText}>عرض يوم الطفل</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>المعلومات الطبية - التربوية</Text>
        <Text style={styles.label}>التشخيص:</Text>
        <Text style={styles.value}>{child.diagnostic ?? "غير متوفر"}</Text>

        <Text style={styles.label}>الحساسيّات:</Text>
        <Text style={styles.value}>{child.allergies ?? "غير متوفر"}</Text>

        <Text style={styles.label}>الاحتياجات الخاصّة:</Text>
        <Text style={styles.value}>{child.besoins_specifiques ?? "غير متوفر"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>معلومات الأولياء</Text>
        <Text style={styles.label}>وليّ الأمر:</Text>
        <Text style={styles.value}>{parentName || "غير متوفر"}</Text>

        <Text style={styles.label}>البريد الإلكتروني:</Text>
        <Text style={styles.value}>{child.parent?.email ?? "-"}</Text>

        <Text style={styles.label}>الهاتف:</Text>
        <Text style={styles.value}>{child.parent?.telephone ?? "-"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>حالة المشروع التربوي (PEI)</Text>
        <Text style={styles.label}>الوضع الحالي:</Text>
        <Text style={styles.value}>
          {child.active_pei?.statut === "VALIDE"
            ? "PEI مُصادَق عليه"
            : child.active_pei?.statut === "EN_ATTENTE_VALIDATION"
            ? "في انتظار المصادقة"
            : "لا يوجد PEI فعّال"}
        </Text>

        {child.active_pei?.date_validation && (
          <>
            <Text style={styles.label}>تاريخ المصادقة:</Text>
            <Text style={styles.value}>{child.active_pei.date_validation}</Text>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { padding: 16, paddingBottom: 32 },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F3F4F6",
  },
  loadingText: { marginTop: 8, color: "#475569" },
  errorText: { color: "#B91C1C", fontSize: 14, textAlign: "center", marginBottom: 12 },
  retryBtn: {
    backgroundColor: "#B91C1C",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  retryText: { color: "#FFF", fontWeight: "600" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#111827" },
  name: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#1F2937" },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#111827" },
  label: { fontSize: 13, fontWeight: "500", marginTop: 6, color: "#6B7280" },
  value: { fontSize: 14, color: "#111827", marginTop: 2 },
  timelineBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  timelineBtnText: { color: "#FFF", fontWeight: "600", fontSize: 13 },
});
