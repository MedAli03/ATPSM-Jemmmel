import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";
import { getChildrenByGroup, getMyGroups } from "../../features/educateur/api";

type Nav = NativeStackNavigationProp<EducatorStackParamList>;

type Group = {
  id: number;
  name: string;
  year: string;           // ex: "2024/2025"
  isCurrent: boolean;     // true = groupe de l'année scolaire en cours
  children: { id: number; name: string }[];
};

export const EducatorGroupsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(
    async (fromRefresh = false) => {
      if (fromRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const apiGroups = await getMyGroups({ includeHistory: true });
        const mapped = await Promise.all(
          apiGroups.map(async (group) => {
            const isCurrent = group.statut !== "archive";
            let children: { id: number; name: string }[] = [];
            if (isCurrent) {
              try {
                const roster = await getChildrenByGroup(group.id);
                children = roster.map((child) => ({
                  id: child.id,
                  name: `${child.prenom} ${child.nom}`.trim() || `طفل #${child.id}`,
                }));
              } catch (err) {
                console.warn("Failed to load group children", group.id, err);
              }
            }
            return {
              id: group.id,
              name: group.nom,
              year: group.annee_scolaire ?? `السنة #${group.annee_id}`,
              isCurrent,
              children,
            };
          })
        );
        setGroups(mapped);
      } catch (err) {
        console.error("Failed to load groups", err);
        setError("تعذّر تحميل المجموعات. الرجاء إعادة المحاولة.");
      } finally {
        if (fromRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const onRefresh = useCallback(() => fetchGroups(true), [fetchGroups]);

  const currentGroup = groups.find((g) => g.isCurrent);
  const pastGroups = groups.filter((g) => !g.isCurrent);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.loadingText}>يتم تحميل المجموعات المسندة إليك...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* CURRENT GROUP */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المجموعة الحالية</Text>
        <Text style={styles.sectionSubtitle}>
          لكل سنة دراسيّة، يكون لك مجموعة واحدة فقط.
        </Text>

        {!currentGroup ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>لا توجد مجموعة حالية</Text>
            <Text style={styles.emptyText}>
              سيقوم المدير بإسناد مجموعة لك في السنة الدراسيّة الحالية.
            </Text>
          </View>
        ) : (
          <View style={[styles.groupCard, styles.currentCard]}>
            <View style={styles.groupHeaderRow}>
              <View>
                <Text style={styles.groupName}>{currentGroup.name}</Text>
                <Text style={styles.groupYear}>{currentGroup.year}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>السنة الحاليّة</Text>
              </View>
            </View>

            <Text style={styles.groupLabel}>الأطفال في هذه المجموعة:</Text>
            {currentGroup.children.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.childRow}
                onPress={() =>
                  navigation.navigate("EducatorChildDetails", { childId: c.id })
                }
              >
                <Text style={styles.childName}>{c.name}</Text>
                <Text style={styles.childAction}>عرض الملف ▸</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* HISTORY OF GROUPS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>تاريخ مجموعاتك السابقة</Text>
        <Text style={styles.sectionSubtitle}>
          نظرة على المجموعات التي اشتغلت معها في السنوات الماضية.
        </Text>

        {pastGroups.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>لا يوجد تاريخ مجموعات بعد</Text>
            <Text style={styles.emptyText}>
              عندما تنتهي السنة الدراسيّة الحالية، ستظهر مجموعتك هنا كمجموعة سابقة.
            </Text>
          </View>
        ) : (
          pastGroups.map((g) => (
            <View key={g.id} style={styles.historyCard}>
              <View style={styles.historyHeaderRow}>
                <View>
                  <Text style={styles.historyName}>{g.name}</Text>
                  <Text style={styles.historyYear}>{g.year}</Text>
                </View>
                <Text style={styles.historyTag}>مجموعة سابقة</Text>
              </View>

              <Text style={styles.historyLabel}>
                عدد الأطفال: {g.children.length}
              </Text>

              <View style={styles.historyChildren}>
                {g.children.map((c) => (
                  <Text key={c.id} style={styles.historyChild}>
                    • {c.name}
                  </Text>
                ))}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { padding: 16, paddingBottom: 32 },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  loadingText: { fontSize: 13, color: "#4B5563" },
  errorBox: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 12,
  },
  errorText: { fontSize: 13, color: "#B91C1C" },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  sectionSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 4 },

  emptyBox: {
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4, color: "#111827" },
  emptyText: { fontSize: 13, color: "#6B7280" },

  groupCard: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  currentCard: {
    borderColor: "#2563EB40",
    backgroundColor: "#2563EB08",
  },
  groupHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  groupName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  groupYear: { fontSize: 13, color: "#4B5563", marginTop: 2 },
  chip: {
    backgroundColor: "#2563EB20",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: { fontSize: 11, color: "#1D4ED8", fontWeight: "600" },
  groupLabel: { fontSize: 13, color: "#4B5563", marginTop: 8, marginBottom: 4 },
  childRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  childName: { fontSize: 14, color: "#111827" },
  childAction: { fontSize: 12, color: "#2563EB" },

  // history cards
  historyCard: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  historyName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  historyYear: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  historyTag: { fontSize: 12, color: "#9CA3AF" },
  historyLabel: { fontSize: 13, color: "#4B5563", marginTop: 4 },
  historyChildren: { marginTop: 4 },
  historyChild: { fontSize: 12, color: "#6B7280" },
});
