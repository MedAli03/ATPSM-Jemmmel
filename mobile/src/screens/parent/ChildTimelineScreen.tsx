import React, { useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { useChildTimeline } from "../../features/parent/hooks";

type TimelineRoute = RouteProp<ParentStackParamList, "ChildTimeline">;

export const ChildTimelineScreen: React.FC = () => {
  const { params } = useRoute<TimelineRoute>();
  const { childId } = params;
  const { events, isLoading, isError, error, refetch } = useChildTimeline(childId);
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading && events.length > 0} onRefresh={onRefresh} />}
    >
      <Text style={styles.headerTitle}>تابع يوم الطفل · {childId}</Text>
      <Text style={styles.headerSubtitle}>
        ملاحظات، أنشطة، و تحديثات المشروع التربوي (PEI)
      </Text>

      {isError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error ?? "تعذّر تحميل الأحداث."}</Text>
        </View>
      )}

      {isLoading && events.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.loadingText}>جارٍ تحميل الأحداث...</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>لا توجد أحداث بعد لهذا الطفل.</Text>
          <Text style={styles.emptyText}>ستظهر هنا الملاحظات والأنشطة والتقييمات المعتمدة.</Text>
        </View>
      ) : (
        events.map((e) => (
          <View key={e.id} style={styles.timelineItem}>
            <View style={styles.timelineLine} />
            <View style={styles.bullet} />
            <View style={styles.card}>
              <Text style={styles.date}>{e.date?.slice(0, 10)}</Text>
              <Text style={styles.title}>{e.title}</Text>
              <Text style={styles.type}>
                {e.type === "daily_note"
                  ? "ملاحظة يومية"
                  : e.type === "activity"
                  ? "نشاط"
                  : e.type === "evaluation"
                  ? "تقييم PEI"
                  : "PEI"}
              </Text>
              {e.description ? <Text style={styles.contentText}>{e.description}</Text> : null}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827",
  },
  headerSubtitle: { fontSize: 13, color: "#6B7280", marginBottom: 16 },
  errorBox: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 12,
  },
  errorText: { color: "#B91C1C", textAlign: "right" },
  loadingBox: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  loadingText: { color: "#374151" },
  emptyBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 6 },
  emptyText: { fontSize: 13, color: "#6B7280" },
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
