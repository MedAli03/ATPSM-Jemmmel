import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";
import { ForbiddenError, getActivePeiForChild, getChildHistory } from "../../features/educateur/api";
import { ChildHistoryEvent } from "../../features/educateur/types";

type Route = RouteProp<EducatorStackParamList, "EducatorChildTimeline">;
type Nav = NativeStackNavigationProp<EducatorStackParamList>;

export const EducatorChildTimelineScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { childId, peiId: initialPeiId } = params;
  const [events, setEvents] = useState<ChildHistoryEvent[]>([]);
  const [peiId, setPeiId] = useState<number | null>(initialPeiId ?? null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(
    async (fromRefresh = false) => {
      if (fromRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const [history, activePei] = await Promise.all([
          getChildHistory(childId, { peiId: peiId ?? undefined }),
          peiId ? Promise.resolve(null) : getActivePeiForChild(childId),
        ]);
        setEvents(history);
        if (!peiId && activePei?.id) {
          setPeiId(activePei.id);
        }
      } catch (err) {
        console.error("Failed to load child timeline", err);
        const fallback = "تعذّر تحميل سجلّ الطفل. حاول مرة أخرى لاحقًا.";
        const message = err instanceof ForbiddenError ? err.message : fallback;
        setEvents([]);
        if (err instanceof ForbiddenError) {
          setPeiId(null);
        }
        setError(message);
      } finally {
        if (fromRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [childId, peiId]
  );

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const onRefresh = useCallback(() => fetchTimeline(true), [fetchTimeline]);

  const typeLabel = useCallback((event: ChildHistoryEvent) => {
    switch (event.type) {
      case "daily_note":
        return "ملاحظة يومية";
      case "activity":
        return "نشاط";
      case "evaluation":
      default:
        return "تقييم PEI";
    }
  }, []);

  const formattedEvents = useMemo(() => events, [events]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>يوم الطفل · {childId}</Text>
          <Text style={styles.headerSubtitle}>
            ملاحظات، أنشطة، تقييمات PEI و تطوّر الطفل
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerBtn, !peiId && styles.headerBtnDisabled]}
            onPress={() =>
              navigation.navigate("DailyNoteForm", {
                childId,
                peiId: peiId ?? undefined,
              })
            }
            disabled={!peiId}
          >
            <Text style={styles.headerBtnText}>+ ملاحظة</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, !peiId && styles.headerBtnDisabled]}
            onPress={() =>
              navigation.navigate("ActivityForm", {
                childId,
                peiId: peiId ?? undefined,
              })
            }
            disabled={!peiId}
          >
            <Text style={styles.headerBtnText}>+ نشاط</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && formattedEvents.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.loadingText}>جارٍ تحميل سجلّ الأنشطة...</Text>
        </View>
      ) : formattedEvents.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>لا توجد أحداث حديثة</Text>
          <Text style={styles.emptyText}>
            عندما تضيف ملاحظة أو نشاطًا أو تقييمًا، سيظهر هنا بالتسلسل الزمني.
          </Text>
        </View>
      ) : (
        formattedEvents.map((event) => (
          <View key={event.id} style={styles.timelineItem}>
            <View style={styles.timelineLine} />
            <View style={styles.bullet} />
            <View style={styles.card}>
              <Text style={styles.date}>{event.date.slice(0, 10)}</Text>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.type}>{typeLabel(event)}</Text>
              {event.description ? (
                <Text style={styles.contentText}>{event.description}</Text>
              ) : null}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { padding: 16, paddingBottom: 32 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    maxWidth: 220,
  },
  headerActions: { justifyContent: "center" },
  headerBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
  },
  headerBtnDisabled: { opacity: 0.5 },
  headerBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 12,
  },
  errorText: { color: "#B91C1C", fontSize: 13, textAlign: "right" },
  loadingBox: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 16 },
  loadingText: { color: "#4B5563", fontSize: 13 },
  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 4 },
  emptyText: { fontSize: 13, color: "#6B7280", lineHeight: 20 },
  timelineItem: { flexDirection: "row", marginBottom: 16 },
  timelineLine: {
    width: 2,
    backgroundColor: "#D1D5DB",
    marginRight: 10,
    marginLeft: 8,
  },
  bullet: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#2563EB",
    position: "absolute",
    left: 3,
    top: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  date: { fontSize: 11, color: "#9CA3AF", marginBottom: 4 },
  title: { fontSize: 15, fontWeight: "600", color: "#111827" },
  type: { fontSize: 12, color: "#2563EB", marginTop: 2 },
  contentText: { fontSize: 13, color: "#374151", marginTop: 6 },
});
