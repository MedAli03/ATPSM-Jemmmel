import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../features/auth/AuthContext";
import {
  getChildrenByGroup,
  getMyGroups,
  listEducatorPeiSummaries,
  listRecentObservations,
} from "../../features/educateur/api";

// ⚠️ simpler: we let navigation be "any" because this screen lives inside a Tab + Stack
const navigationAny = () => useNavigation<any>();

type DashboardStats = {
  groupsCount: number;
  childrenCount: number;
  todaySessions: number;
};

type TodayChild = {
  id: number;
  name: string;
  group: string;
  focus: string;
};

type PeiSummary = {
  id: number;
  childId: number;
  childName: string;
  status: "ACTIVE" | "TO_REVIEW" | "CLOSED";
  nextReviewDate?: string; // ex: "2025-02-01"
};

type ObservationSummary = {
  id: number;
  childId: number;
  childName: string;
  date: string;
  completed: boolean;
};

export const EducatorDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = navigationAny();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayChildren, setTodayChildren] = useState<TodayChild[]>([]);
  const [peiItems, setPeiItems] = useState<PeiSummary[]>([]);
  const [observations, setObservations] = useState<ObservationSummary[]>([]);
  const [yearLabel, setYearLabel] = useState<string>("السنة الدراسيّة الجارية");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildChildName = useCallback((prenom?: string | null, nom?: string | null) => {
    const value = [prenom, nom].filter(Boolean).join(" ");
    return value.trim() || "طفل";
  }, []);

  const loadDashboard = useCallback(
    async (fromRefresh = false) => {
      if (fromRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const [groups, peiSummaries, observationRows] = await Promise.all([
          getMyGroups(),
          user?.id ? listEducatorPeiSummaries(user.id, { limit: 20 }) : Promise.resolve([]),
          user?.id
            ? listRecentObservations({ educateurId: user.id, limit: 5 })
            : Promise.resolve([]),
        ]);

        const activeGroups = groups.filter((group) => group.statut !== "archive");
        if (activeGroups.length) {
          setYearLabel(activeGroups[0].annee_scolaire ?? yearLabel);
        }

        const rosters = await Promise.all(
          activeGroups.map(async (group) => {
            try {
              const children = await getChildrenByGroup(group.id);
              return { groupName: group.nom, children };
            } catch (err) {
              console.warn("Failed to load group roster", group.id, err);
              return { groupName: group.nom, children: [] };
            }
          })
        );

        const flattened = rosters.flatMap((entry) =>
          entry.children.map((child) => ({
            id: child.id,
            name: buildChildName(child.prenom, child.nom),
            group: entry.groupName,
          }))
        );

        const peiByChild = new Map(peiSummaries.map((pei) => [pei.enfant_id, pei]));

        const todayChildCards: TodayChild[] = flattened.slice(0, 6).map((child) => ({
          ...child,
          focus: peiByChild.has(child.id) ? "PEI مفعّل" : "متابعة أولية",
        }));

        setStats({
          groupsCount: activeGroups.length,
          childrenCount: flattened.length,
          todaySessions: 0,
        });
        setTodayChildren(todayChildCards);

        const peiStatusMap: Record<string, PeiSummary["status"]> = {
          ACTIF: "ACTIVE",
          BROUILLON: "TO_REVIEW",
          CLOTURE: "CLOSED",
        };

        setPeiItems(
          peiSummaries.map((item) => ({
            id: item.id,
            childId: item.enfant_id,
            childName: item.enfant_nom_complet ?? item.titre,
            status: peiStatusMap[item.statut] ?? "TO_REVIEW",
            nextReviewDate: item.date_fin_prevue,
          }))
        );

        setObservations(
          observationRows.map((row) => ({
            id: row.id,
            childId: row.enfant_id,
            childName: buildChildName(row.enfant?.prenom, row.enfant?.nom),
            date: row.date_observation?.slice(0, 10) ?? "",
            completed: Boolean(row.contenu),
          }))
        );
      } catch (err) {
        console.error("Failed to load dashboard", err);
        setError("تعذّر تحميل لوحة المتابعة. الرجاء المحاولة لاحقًا.");
      } finally {
        if (fromRefresh) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [buildChildName, user?.id, yearLabel]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = useCallback(() => {
    loadDashboard(true);
  }, [loadDashboard]);

  const educatorName =
    (user as any)?.fullName ||
    (user as any)?.name ||
    (user as any)?.username ||
    "المربّي/ـة";

  const hasChildrenToday = todayChildren.length > 0;

  const headerYearLabel = useMemo(() => yearLabel, [yearLabel]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.helloText}>مرحبًا، {educatorName}</Text>
            <Text style={styles.subTitle}>
              Espace Éducateur · لوحة المتابعة
            </Text>
          </View>
          <View style={styles.yearChip}>
            <Text style={styles.yearChipText}>{headerYearLabel}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#2563EB" />
              <Text style={styles.loadingText}>جارٍ تحميل آخر المعطيات...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* SUMMARY CARDS */}
          {stats && (
            <View style={styles.row}>
              <View style={[styles.summaryCard, styles.primary]}>
                <Text style={styles.summaryLabel}>مجموعاتي</Text>
                <Text style={styles.summaryValue}>{stats.groupsCount}</Text>
                <Text style={styles.summaryHint}>المجموعات المسندة إليك</Text>
                <TouchableOpacity
                  style={styles.summaryLink}
                  onPress={() => navigation.navigate("EducatorGroups")}
                >
                  <Text style={styles.summaryLinkText}>عرض التفاصيل ▸</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.summaryCard, styles.secondary]}>
                <Text style={styles.summaryLabel}>الأطفال</Text>
                <Text style={styles.summaryValue}>{stats.childrenCount}</Text>
                <Text style={styles.summaryHint}>
                  عدد الأطفال في مجموعاتك الحالية
                </Text>
              </View>
            </View>
          )}

          {/* PEI + OBSERVATION SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>PEI و الملاحظة الأوّلية</Text>
              <Text style={styles.sectionSubtitle}>
                نظرة سريعة على ملفات الأطفال التربوية.
              </Text>
            </View>

            <View style={styles.peiObsRow}>
              {/* PEI CARD */}
              <View style={styles.peiCard}>
                <View style={styles.peiHeaderRow}>
                  <Text style={styles.peiTitle}>PEI النشطة</Text>
                  <Text style={styles.peiCount}>{peiItems.length}</Text>
                </View>
                {peiItems.length === 0 ? (
                  <Text style={styles.peiEmpty}>
                    لا توجد PEI مفعّلة حاليًا في مجموعتك.
                  </Text>
                ) : (
                  peiItems.slice(0, 3).map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.peiItem}
                      onPress={() =>
                        navigation.navigate("EducatorChildDetails", {
                          childId: p.childId,
                        })
                      }
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.peiChildName}>{p.childName}</Text>
                        {p.nextReviewDate && (
                          <Text style={styles.peiNextReview}>
                            مراجعة قادمة: {p.nextReviewDate}
                          </Text>
                        )}
                      </View>
                      <View
                        style={[
                          styles.peiStatusChip,
                          p.status === "ACTIVE"
                            ? styles.peiStatusActive
                            : p.status === "TO_REVIEW"
                            ? styles.peiStatusToReview
                            : styles.peiStatusClosed,
                        ]}
                      >
                        <Text style={styles.peiStatusText}>
                          {p.status === "ACTIVE"
                            ? "مفعّل"
                            : p.status === "TO_REVIEW"
                            ? "في انتظار التقييم"
                            : "مغلق"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              {/* OBSERVATION CARD */}
              <View style={styles.obsCard}>
                <View style={styles.obsHeaderRow}>
                  <Text style={styles.obsTitle}>الملاحظة الأوّلية</Text>
                  <Text style={styles.obsCount}>{observations.length}</Text>
                </View>
                {observations.length === 0 ? (
                  <Text style={styles.obsEmpty}>
                    لا توجد ملاحظات أوّلية مسجّلة بعد.
                  </Text>
                ) : (
                  observations.slice(0, 3).map((o) => (
                    <TouchableOpacity
                      key={o.id}
                      style={styles.obsItem}
                      onPress={() =>
                        navigation.navigate("EducatorChildDetails", {
                          childId: o.childId,
                        })
                      }
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.obsChildName}>{o.childName}</Text>
                        <Text style={styles.obsDate}>بتاريخ: {o.date}</Text>
                      </View>
                      <View
                        style={[
                          styles.obsStatusChip,
                          o.completed
                            ? styles.obsStatusDone
                            : styles.obsStatusPending,
                        ]}
                      >
                        <Text style={styles.obsStatusText}>
                          {o.completed ? "مكتملة" : "في طور الإنجاز"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          </View>

          {/* TODAY CHILDREN */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>أطفال اليوم</Text>
              <Text style={styles.sectionSubtitle}>
                Suivi quotidien · ملاحظات و أنشطة سريعة.
              </Text>
            </View>

            {!hasChildrenToday ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>لا توجد حصص اليوم</Text>
                <Text style={styles.emptyText}>
                  يمكنك التخطيط من خلال صفحة المجموعات أو عبر تحديث PEI.
                </Text>
              </View>
            ) : (
              todayChildren.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.childCard}
                  onPress={() =>
                    navigation.navigate("EducatorChildTimeline", {
                      childId: c.id,
                      peiId: peiItems.find((p) => p.childId === c.id)?.id,
                    })
                  }
                >
                  <View style={styles.childHeaderRow}>
                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>{c.name}</Text>
                      <Text style={styles.childGroup}>{c.group}</Text>
                    </View>
                    <View style={styles.childChip}>
                      <Text style={styles.childChipText}>تابع اليوم</Text>
                    </View>
                  </View>

                  <Text style={styles.childFocus}>
                    تركيز اليوم:{" "}
                    <Text style={styles.childFocusBold}>{c.focus}</Text>
                  </Text>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate("DailyNoteForm", {
                          childId: c.id,
                          peiId: peiItems.find((p) => p.childId === c.id)?.id,
                        })
                      }
                    >
                      <Text style={styles.actionEmoji}>📝</Text>
                      <Text style={styles.actionText}>ملاحظة</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate("ActivityForm", {
                          childId: c.id,
                          peiId: peiItems.find((p) => p.childId === c.id)?.id,
                        })
                      }
                    >
                      <Text style={styles.actionEmoji}>🎯</Text>
                      <Text style={styles.actionText}>نشاط</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate("EducatorChatThread", {
                          childId: c.id,
                        })
                      }
                    >
                      <Text style={styles.actionEmoji}>💬</Text>
                      <Text style={styles.actionText}>رسالة</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* QUICK SHORTCUTS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>اختصارات سريعة</Text>
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.quickCard}
                onPress={() => navigation.navigate("EducatorGroups")}
              >
                <Text style={styles.quickEmoji}>👥</Text>
                <Text style={styles.quickTitle}>مجموعاتي</Text>
                <Text style={styles.quickText}>عرض المجموعات و الأطفال</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickCard}
                onPress={() => navigation.navigate("EducatorMessages")}
              >
                <Text style={styles.quickEmoji}>💬</Text>
                <Text style={styles.quickTitle}>رسائل الأولياء</Text>
                <Text style={styles.quickText}>تواصل مع الأولياء بسهولة</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ATPSM – Jemmel · متابعة تربوية رقمية متكاملة.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F6FA" },
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  helloText: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subTitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  yearChip: {
    backgroundColor: "#EEF2FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  yearChipText: { fontSize: 11, color: "#4338CA", fontWeight: "600" },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  loadingBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  loadingText: { fontSize: 13, color: "#4B5563" },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 12,
  },
  errorText: { fontSize: 13, color: "#B91C1C" },

  row: { flexDirection: "row", gap: 12, marginBottom: 12 },

  summaryCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  primary: { backgroundColor: "#2563EB10", borderColor: "#2563EB30" },
  secondary: { backgroundColor: "#10B98110", borderColor: "#10B98130" },
  accent: { backgroundColor: "#F59E0B10", borderColor: "#F59E0B30" },

  summaryLabel: { fontSize: 13, color: "#6B7280" },
  summaryValue: { fontSize: 24, fontWeight: "800", color: "#111827" },
  summaryHint: { fontSize: 12, color: "#6B7280", marginTop: 6 },
  summaryLink: { marginTop: 8 },
  summaryLinkText: { fontSize: 12, color: "#1D4ED8", fontWeight: "600" },

  section: { marginTop: 16 },
  sectionHeader: { marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  sectionSubtitle: { fontSize: 13, color: "#6B7280" },

  emptyBox: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  emptyText: { fontSize: 13, color: "#6B7280" },

  // PEI + Observation cards
  peiObsRow: {
    flexDirection: "row",
    gap: 10,
  },
  peiCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  peiHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  peiTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  peiCount: { fontSize: 14, fontWeight: "700", color: "#2563EB" },
  peiEmpty: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  peiItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingVertical: 4,
  },
  peiChildName: { fontSize: 13, fontWeight: "600", color: "#111827" },
  peiNextReview: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  peiStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  peiStatusText: { fontSize: 10, fontWeight: "600" },
  peiStatusActive: { backgroundColor: "#DCFCE7" },
  peiStatusToReview: { backgroundColor: "#FEF3C7" },
  peiStatusClosed: { backgroundColor: "#E5E7EB" },

  obsCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  obsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  obsTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  obsCount: { fontSize: 14, fontWeight: "700", color: "#10B981" },
  obsEmpty: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  obsItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingVertical: 4,
  },
  obsChildName: { fontSize: 13, fontWeight: "600", color: "#111827" },
  obsDate: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  obsStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  obsStatusText: { fontSize: 10, fontWeight: "600" },
  obsStatusDone: { backgroundColor: "#DBEAFE" },
  obsStatusPending: { backgroundColor: "#FEE2E2" },

  // children of the day
  childCard: {
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  childHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  childInfo: { flex: 1, paddingRight: 8 },
  childName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  childGroup: { fontSize: 13, color: "#4B5563", marginTop: 2 },
  childChip: {
    backgroundColor: "#DCFCE7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  childChipText: { fontSize: 11, color: "#15803D", fontWeight: "600" },
  childFocus: { fontSize: 13, color: "#2563EB", marginTop: 4 },
  childFocusBold: { fontWeight: "600" },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: { alignItems: "center", flex: 1 },
  actionEmoji: { fontSize: 18 },
  actionText: { fontSize: 11, marginTop: 2, color: "#374151" },

  quickCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickEmoji: { fontSize: 22, marginBottom: 6 },
  quickTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  quickText: { fontSize: 12, color: "#6B7280" },

  footer: { marginTop: 24, alignItems: "center" },
  footerText: { fontSize: 11, color: "#9CA3AF" },
});
