// src/screens/parent/ChildListScreen.tsx
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { useMyChildren } from "../../features/parent/hooks";

type Nav = NativeStackNavigationProp<ParentStackParamList>;

export const ChildListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { children, isLoading, isError, error, refetch } = useMyChildren();
  const [query, setQuery] = useState("");

  const filteredChildren = useMemo(() => {
    if (!query.trim()) {
      return children;
    }
    const lower = query.trim().toLowerCase();
    return children.filter((child) => {
      const fullName = `${child.prenom} ${child.nom}`.toLowerCase();
      return fullName.includes(lower);
    });
  }, [children, query]);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>أطفالي</Text>
          <Text style={styles.subtitle}>
            القائمة التالية مرتبطة مباشرة بحسابك وتعرض الأطفال المرتبطين بك في
            الجمعية.
          </Text>
        </View>

        <TextInput
          placeholder="ابحث عن طفل بالاسم"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          placeholderTextColor="#94A3B8"
        />

        {isError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error ?? "حدث خطأ"}</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading && children.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#2563EB" />
            <Text style={styles.loadingText}>جارٍ تحميل القائمة...</Text>
          </View>
        ) : filteredChildren.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>لا يوجد أطفال مطابقون للبحث</Text>
            <Text style={styles.emptyText}>جرّب تعديل كلمات البحث أو حدّث الصفحة.</Text>
          </View>
        ) : (
          filteredChildren.map((child) => (
            <TouchableOpacity
              key={child.id}
              activeOpacity={0.9}
              style={styles.childCard}
              onPress={() => navigation.navigate("ChildDetails", { childId: child.id })}
            >
              <View style={styles.childHeaderRow}>
                <Text style={styles.childName}>
                  {child.prenom} {child.nom}
                </Text>
                <Text style={styles.childGroup}>
                  {child.groupe_actuel?.nom ?? "-"}
                </Text>
              </View>

              <Text style={styles.childMeta}>
                تاريخ الميلاد: {child.date_naissance}
              </Text>

              <Text style={styles.childNoteLabel}>آخر ملاحظة</Text>
              <Text style={styles.childNote} numberOfLines={2}>
                {child.last_note_preview ?? "لم تتم إضافة ملاحظات بعد."}
              </Text>

              <View style={styles.childFooter}>
                <Text style={styles.childFooterText}>اضغط لعرض ملف الطفل الكامل</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    writingDirection: "rtl", // RTL global
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748B",
    textAlign: "right",
    lineHeight: 20,
  },
  searchInput: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CBD5F5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
    textAlign: "right",
    color: "#0F172A",
  },
  errorBox: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 12,
  },
  errorText: { fontSize: 13, color: "#B91C1C", marginBottom: 6, textAlign: "right" },
  retryBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#B91C1C",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  loadingBox: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  loadingText: { fontSize: 13, color: "#334155" },
  emptyBox: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4, color: "#0F172A" },
  emptyText: { fontSize: 13, color: "#64748B" },
  childCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  childHeaderRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  childName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
  },
  childGroup: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },
  childMeta: {
    fontSize: 13,
    color: "#475569",
    textAlign: "right",
    marginBottom: 6,
  },
  childNoteLabel: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "right",
    marginBottom: 2,
  },
  childNote: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "right",
    lineHeight: 20,
  },
  childFooter: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  childFooterText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },
});
