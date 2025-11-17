import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ParentStackParamList } from "../../navigation/ParentNavigator";

type TimelineRoute = RouteProp<ParentStackParamList, "ChildTimeline">;

const MOCK_EVENTS = [
  {
    id: 1,
    date: "2025-11-15",
    type: "note",
    title: "ملاحظة يومية",
    content: "Ahmed a bien participé à l’activité de communication visuelle.",
  },
  {
    id: 2,
    date: "2025-11-10",
    type: "activity",
    title: "نشاط تربوي",
    content: "Atelier motricité fine avec cubes de couleurs.",
  },
  {
    id: 3,
    date: "2025-11-01",
    type: "pei",
    title: "تحديث PEI",
    content: "Objectifs de communication ajustés suite aux progrès constatés.",
  },
];

export const ChildTimelineScreen: React.FC = () => {
  const { params } = useRoute<TimelineRoute>();
  const { childId } = params;

  // TODO: fetch notes/activités/PEI events for childId
  const events = MOCK_EVENTS;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>تابع يوم الطفل · {childId}</Text>
      <Text style={styles.headerSubtitle}>
        ملاحظات، أنشطة، و تحديثات المشروع التربوي (PEI)
      </Text>

      {events.map((e, index) => (
        <View key={e.id} style={styles.timelineItem}>
          <View style={styles.timelineLine} />
          <View style={styles.bullet} />
          <View style={styles.card}>
            <Text style={styles.date}>{e.date}</Text>
            <Text style={styles.title}>{e.title}</Text>
            <Text style={styles.type}>
              {e.type === "note"
                ? "ملاحظة يومية"
                : e.type === "activity"
                ? "نشاط"
                : "PEI"}
            </Text>
            <Text style={styles.contentText}>{e.content}</Text>
          </View>
        </View>
      ))}
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
