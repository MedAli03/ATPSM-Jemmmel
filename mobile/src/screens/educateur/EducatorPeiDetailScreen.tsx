import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";
import {
  getPEI,
  getPeiActivities,
  getPeiEvaluations,
} from "../../features/educateur/api";
import {
  PeiActivitySummary,
  PeiDetails,
  PeiEvaluation,
} from "../../features/educateur/types";

type Route = RouteProp<EducatorStackParamList, "EducatorPeiDetail">;
type Nav = NativeStackNavigationProp<EducatorStackParamList>;

type TabKey = "OBJECTIFS" | "ACTIVITES" | "EVALUATIONS";

export const EducatorPeiDetailScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { childId, peiId } = params;

  const [tab, setTab] = useState<TabKey>("OBJECTIFS");
  const [pei, setPei] = useState<PeiDetails | null>(null);
  const [activities, setActivities] = useState<PeiActivitySummary[]>([]);
  const [evaluations, setEvaluations] = useState<PeiEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPei = async () => {
      if (!peiId) {
        setLoading(false);
        setError("لا يمكن تحميل بيانات الـ PEI بدون معرّف صالح.");
        Alert.alert("تنبيه", "لا يمكن تحميل بيانات الـ PEI بدون معرّف صالح.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [peiDetails, activityItems, evaluationItems] = await Promise.all([
          getPEI(peiId),
          getPeiActivities(peiId, { pageSize: 20 }),
          getPeiEvaluations(peiId),
        ]);
        if (!isMounted) return;
        setPei(peiDetails);
        setActivities(activityItems);
        setEvaluations(evaluationItems);
      } catch (err) {
        console.error("Failed to load PEI details", err);
        if (isMounted) {
          const fallback = "تعذّر تحميل بيانات الـ PEI. حاول لاحقًا.";
          const message = err instanceof Error ? err.message : fallback;
          setError(message);
          Alert.alert("تنبيه", message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPei();

    return () => {
      isMounted = false;
    };
  }, [peiId]);

  const renderStatusLabel = (status?: PeiDetails["statut"]) => {
    switch (status) {
      case "ACTIF":
        return "PEI مفعّل";
      case "CLOTURE":
        return "PEI مغلق";
      case "BROUILLON":
        return "PEI في طور الإعداد";
      default:
        return "PEI";
    }
  };

  const openChildTimeline = () => {
    navigation.navigate("EducatorChildTimeline", { childId, peiId });
  };

  const formatDate = (value?: string | null) => (value ? value.slice(0, 10) : "-");
  const objectiveLines = pei?.objectifs
    ? pei.objectifs.split(/\n+/).map((line) => line.trim()).filter(Boolean)
    : [];
  const statusStyle = pei?.statut === "ACTIF"
    ? styles.statusActive
    : pei?.statut === "CLOTURE"
    ? styles.statusClosed
    : styles.statusToReview;
  const showLoader = loading && !pei;

  if (showLoader) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderBox}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.loaderText}>جارٍ تحميل تفاصيل الـ PEI...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* HEADER */}
        {pei ? (
          <View style={styles.headerCard}>
            <Text style={styles.title}>{pei.titre}</Text>

            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerLabel}>بداية الـ PEI</Text>
                <Text style={styles.headerValue}>{formatDate(pei.date_debut)}</Text>
                {pei.date_derniere_maj && (
                  <>
                    <Text style={[styles.headerLabel, { marginTop: 6 }]}>آخر تحديث</Text>
                    <Text style={styles.headerValue}>{formatDate(pei.date_derniere_maj)}</Text>
                  </>
                )}
              </View>
              <View style={[styles.statusChip, statusStyle]}>
                <Text style={styles.statusText}>{renderStatusLabel(pei.statut)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.timelineBtn}
              onPress={openChildTimeline}
            >
              <Text style={styles.timelineBtnText}>عرض يوم الطفل (Timeline)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyPeiBox}>
            <Text style={styles.emptyText}>لا تتوفر بيانات الـ PEI الحالية.</Text>
          </View>
        )}

        {/* TABS */}
        <View style={styles.tabsRow}>
          <TabButton
            label="الأهداف"
            active={tab === "OBJECTIFS"}
            onPress={() => setTab("OBJECTIFS")}
          />
          <TabButton
            label="الأنشطة"
            active={tab === "ACTIVITES"}
            onPress={() => setTab("ACTIVITES")}
          />
          <TabButton
            label="التقييمات"
            active={tab === "EVALUATIONS"}
            onPress={() => setTab("EVALUATIONS")}
          />
        </View>

        {/* CONTENT */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {tab === "OBJECTIFS" && (
            <View>
              {objectiveLines.length === 0 ? (
                <Text style={styles.emptyText}>
                  لا توجد أهداف مربوطة بهذا الـ PEI بعد.
                </Text>
              ) : (
                objectiveLines.map((line, index) => (
                  <View key={`objective-${index}`} style={styles.objectiveCard}>
                    <Text style={styles.objectiveDomain}>هدف #{index + 1}</Text>
                    <Text style={styles.objectiveDescription}>{line}</Text>
                  </View>
                ))
              )}
            </View>
          )}

          {tab === "ACTIVITES" && (
            <View>
              {activities.length === 0 ? (
                <Text style={styles.emptyText}>
                  لا توجد أنشطة مرتبطة بهذا الـ PEI بعد.
                </Text>
              ) : (
                activities.map((act) => (
                  <View key={act.id} style={styles.activityCard}>
                    <View style={styles.activityHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityTitle}>{act.titre ?? "نشاط"}</Text>
                        {act.type ? (
                          <Text style={styles.activityDomain}>النوع: {act.type}</Text>
                        ) : null}
                      </View>
                      {act.educateur && (
                        <Text style={styles.activityEducator}>{act.educateur}</Text>
                      )}
                    </View>
                    <Text style={styles.activityDate}>بتاريخ: {formatDate(act.date)}</Text>
                    {act.description ? (
                      <Text style={styles.activityDescription}>{act.description}</Text>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          )}

          {tab === "EVALUATIONS" && (
            <View>
              {evaluations.length === 0 ? (
                <Text style={styles.emptyText}>
                  لا توجد تقييمات مرتبطة بهذا الـ PEI بعد.
                </Text>
              ) : (
                evaluations.map((ev) => (
                  <View key={ev.id} style={styles.evaluationCard}>
                    <View style={styles.evaluationHeaderRow}>
                      <View>
                        <Text style={styles.evaluationPeriod}>
                          {ev.periode || "تقييم"}
                        </Text>
                        <Text style={styles.evaluationDate}>
                          بتاريخ: {formatDate(ev.date)}
                        </Text>
                      </View>
                      {ev.note_globale != null && (
                        <View style={styles.scoreBadge}>
                          <Text style={styles.scoreLabel}>تقييم عام</Text>
                          <Text style={styles.scoreValue}>{ev.note_globale}/5</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.evaluationSummary}>
                      {ev.commentaire_global ?? "لا توجد ملاحظات"}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

type TabButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const TabButton: React.FC<TabButtonProps> = ({ label, active, onPress }) => {
  return (
    <TouchableOpacity style={styles.tabBtn} onPress={onPress}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
      {active && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3F4F6" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  loaderBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loaderText: { marginTop: 12, color: "#4B5563" },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 12,
  },
  errorText: { fontSize: 13, color: "#B91C1C", textAlign: "right" },

  headerCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  headerLabel: { fontSize: 11, color: "#6B7280" },
  headerValue: { fontSize: 13, color: "#111827", marginTop: 2 },

  statusChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  statusActive: { backgroundColor: "#DCFCE7" },
  statusToReview: { backgroundColor: "#FEF3C7" },
  statusClosed: { backgroundColor: "#E5E7EB" },

  timelineBtn: {
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2563EB",
    paddingVertical: 8,
    alignItems: "center",
  },
  timelineBtnText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
  },
  emptyPeiBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },

  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB80",
    borderRadius: 999,
    padding: 2,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  tabLabel: { fontSize: 13, color: "#6B7280" },
  tabLabelActive: { color: "#111827", fontWeight: "700" },
  tabIndicator: {
    marginTop: 4,
    height: 3,
    width: "70%",
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 12,
  },

  // OBJECTIFS
  objectiveCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  objectiveDomain: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  objectiveDescription: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 4,
  },

  // ACTIVITES
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activityHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  activityTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  activityDomain: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  activityEducator: { fontSize: 12, color: "#6B7280" },
  activityDate: { fontSize: 12, color: "#6B7280", marginTop: 6 },
  activityDescription: { fontSize: 12, color: "#374151", marginTop: 6 },

  // EVALUATIONS
  evaluationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  evaluationHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  evaluationPeriod: { fontSize: 14, fontWeight: "700", color: "#111827" },
  evaluationDate: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  scoreBadge: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
  },
  scoreLabel: { fontSize: 11, color: "#4B5563" },
  scoreValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4338CA",
    marginTop: 2,
  },
  evaluationSummary: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 8,
  },
});
