import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";

type Route = RouteProp<EducatorStackParamList, "EducatorPeiDetail">;
type Nav = NativeStackNavigationProp<EducatorStackParamList>;

type TabKey = "OBJECTIFS" | "ACTIVITES" | "EVALUATIONS";

type PeiOverview = {
  title: string;
  status: "ACTIVE" | "TO_REVIEW" | "CLOSED";
  startDate: string;
  endDate?: string | null;
  lastEvaluationDate?: string | null;
};

type PeiObjective = {
  id: number;
  domain: string; // Communication, Autonomie...
  description: string;
  status: "IN_PROGRESS" | "ACHIEVED" | "NOT_STARTED";
  progress: number; // 0–100
};

type PeiActivity = {
  id: number;
  date: string;
  title: string;
  domain: string;
  status: "DONE" | "PLANNED";
};

type PeiEvaluation = {
  id: number;
  date: string;
  periodLabel: string; // "Évaluation 3 mois"
  summary: string;
  globalScore?: number; // 1–5
};

// MOCKS – replace later with API data
const MOCK_OVERVIEW: PeiOverview = {
  title: "PEI 2024 / 2025 – Ahmed",
  status: "ACTIVE",
  startDate: "2024-09-01",
  endDate: null,
  lastEvaluationDate: "2025-01-15",
};

const MOCK_OBJECTIVES: PeiObjective[] = [
  {
    id: 1,
    domain: "Communication",
    description: "Augmenter les demandes spontanées à l’aide de pictogrammes.",
    status: "IN_PROGRESS",
    progress: 60,
  },
  {
    id: 2,
    domain: "Autonomie",
    description: "Participer au rangement du matériel à la fin de l’activité.",
    status: "ACHIEVED",
    progress: 100,
  },
  {
    id: 3,
    domain: "Interaction sociale",
    description: "Tolérer la présence d’un pair pendant 5 minutes de jeu.",
    status: "NOT_STARTED",
    progress: 0,
  },
];

const MOCK_ACTIVITIES: PeiActivity[] = [
  {
    id: 1,
    date: "2025-02-01",
    title: "Jeu de demandes avec pictogrammes",
    domain: "Communication",
    status: "DONE",
  },
  {
    id: 2,
    date: "2025-01-20",
    title: "Routine de rangement après activité",
    domain: "Autonomie",
    status: "DONE",
  },
  {
    id: 3,
    date: "2025-02-05",
    title: "Jeu parallèle avec un pair",
    domain: "Interaction sociale",
    status: "PLANNED",
  },
];

const MOCK_EVALUATIONS: PeiEvaluation[] = [
  {
    id: 1,
    date: "2025-01-15",
    periodLabel: "Évaluation à 3 mois",
    summary:
      "Progression satisfaisante en communication visuelle, objectifs d’autonomie largement atteints.",
    globalScore: 4,
  },
  {
    id: 2,
    date: "2024-11-15",
    periodLabel: "Bilan initial",
    summary:
      "Mise en place des routines et introduction des supports visuels.",
    globalScore: 3,
  },
];

export const EducatorPeiDetailScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { childId, peiId } = params;

  const [tab, setTab] = useState<TabKey>("OBJECTIFS");
  const [overview, setOverview] = useState<PeiOverview | null>(null);
  const [objectives, setObjectives] = useState<PeiObjective[]>([]);
  const [activities, setActivities] = useState<PeiActivity[]>([]);
  const [evaluations, setEvaluations] = useState<PeiEvaluation[]>([]);

  useEffect(() => {
    // TODO: fetch from API:
    // GET /enfants/:childId/pei/:peiId
    setOverview(MOCK_OVERVIEW);
    setObjectives(MOCK_OBJECTIVES);
    setActivities(MOCK_ACTIVITIES);
    setEvaluations(MOCK_EVALUATIONS);
  }, [childId, peiId]);

  const renderStatusLabel = (status: PeiOverview["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "PEI مفعّل";
      case "TO_REVIEW":
        return "في انتظار مراجعة";
      default:
        return "PEI مغلق";
    }
  };

  const renderObjectiveStatus = (status: PeiObjective["status"]) => {
    switch (status) {
      case "IN_PROGRESS":
        return "جاري الإنجاز";
      case "ACHIEVED":
        return "متحقّق";
      default:
        return "غير مفعّل";
    }
  };

  const openChildTimeline = () => {
    navigation.navigate("EducatorChildTimeline", { childId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        {overview && (
          <View style={styles.headerCard}>
            <Text style={styles.title}>{overview.title}</Text>

            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerLabel}>بداية الـ PEI</Text>
                <Text style={styles.headerValue}>{overview.startDate}</Text>
                {overview.lastEvaluationDate && (
                  <>
                    <Text style={[styles.headerLabel, { marginTop: 6 }]}>
                      آخر تقييم
                    </Text>
                    <Text style={styles.headerValue}>
                      {overview.lastEvaluationDate}
                    </Text>
                  </>
                )}
              </View>
              <View
                style={[
                  styles.statusChip,
                  overview.status === "ACTIVE"
                    ? styles.statusActive
                    : overview.status === "TO_REVIEW"
                    ? styles.statusToReview
                    : styles.statusClosed,
                ]}
              >
                <Text style={styles.statusText}>
                  {renderStatusLabel(overview.status)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.timelineBtn}
              onPress={openChildTimeline}
            >
              <Text style={styles.timelineBtnText}>عرض يوم الطفل (Timeline)</Text>
            </TouchableOpacity>
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
              {objectives.length === 0 ? (
                <Text style={styles.emptyText}>
                  لا توجد أهداف مربوطة بهذا الـ PEI بعد.
                </Text>
              ) : (
                objectives.map((obj) => (
                  <View key={obj.id} style={styles.objectiveCard}>
                    <View style={styles.objectiveHeaderRow}>
                      <Text style={styles.objectiveDomain}>{obj.domain}</Text>
                      <View
                        style={[
                          styles.objectiveStatusChip,
                          obj.status === "ACHIEVED"
                            ? styles.objectiveStatusAchieved
                            : obj.status === "IN_PROGRESS"
                            ? styles.objectiveStatusInProgress
                            : styles.objectiveStatusNotStarted,
                        ]}
                      >
                        <Text style={styles.objectiveStatusText}>
                          {renderObjectiveStatus(obj.status)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.objectiveDescription}>
                      {obj.description}
                    </Text>

                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${obj.progress}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressLabel}>
                      التقدّم: {obj.progress}%
                    </Text>
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
                      <View>
                        <Text style={styles.activityTitle}>{act.title}</Text>
                        <Text style={styles.activityDomain}>
                          المجال: {act.domain}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.activityStatusChip,
                          act.status === "DONE"
                            ? styles.activityStatusDone
                            : styles.activityStatusPlanned,
                        ]}
                      >
                        <Text style={styles.activityStatusText}>
                          {act.status === "DONE" ? "منجزة" : "مخطّطة"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.activityDate}>بتاريخ: {act.date}</Text>
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
                          {ev.periodLabel}
                        </Text>
                        <Text style={styles.evaluationDate}>
                          بتاريخ: {ev.date}
                        </Text>
                      </View>
                      {ev.globalScore != null && (
                        <View style={styles.scoreBadge}>
                          <Text style={styles.scoreLabel}>تقييم عام</Text>
                          <Text style={styles.scoreValue}>{ev.globalScore}/5</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.evaluationSummary}>{ev.summary}</Text>
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
  objectiveHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  objectiveDomain: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  objectiveStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  objectiveStatusText: { fontSize: 11, fontWeight: "600" },
  objectiveStatusAchieved: { backgroundColor: "#DCFCE7" },
  objectiveStatusInProgress: { backgroundColor: "#FEF3C7" },
  objectiveStatusNotStarted: { backgroundColor: "#E5E7EB" },
  objectiveDescription: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },
  progressLabel: {
    fontSize: 11,
    color: "#6B7280",
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
  activityStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  activityStatusText: { fontSize: 11, fontWeight: "600" },
  activityStatusDone: { backgroundColor: "#DCFCE7" },
  activityStatusPlanned: { backgroundColor: "#FEF3C7" },
  activityDate: { fontSize: 12, color: "#6B7280", marginTop: 6 },

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
