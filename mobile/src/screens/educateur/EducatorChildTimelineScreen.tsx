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

type Route = RouteProp<EducatorStackParamList, "EducatorChildTimeline">;
type Nav = NativeStackNavigationProp<EducatorStackParamList>;

const MOCK_EVENTS = [
  {
    id: 1,
    date: "2025-11-15",
    type: "note",
    title: "ملاحظة يومية",
    content: "Participation active à l’atelier communication visuelle.",
  },
  {
    id: 2,
    date: "2025-11-10",
    type: "activity",
    title: "نشاط تربوي",
    content: "Jeu de tri de couleurs avec renforcement positif.",
  },
  {
    id: 3,
    date: "2025-11-01",
    type: "pei",
    title: "تقييم PEI",
    content: "Progrès sur l’objectif d’initier le contact visuel.",
  },
];

export const EducatorChildTimelineScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { childId } = params;

  const events = MOCK_EVENTS; // TODO: fetch from API

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>يوم الطفل · {childId}</Text>
          <Text style={styles.headerSubtitle}>
            ملاحظات، أنشطة، تقييمات PEI و تطوّر الطفل
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate("DailyNoteForm", { childId })}
          >
            <Text style={styles.headerBtnText}>+ ملاحظة</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate("ActivityForm", { childId })}
          >
            <Text style={styles.headerBtnText}>+ نشاط</Text>
          </TouchableOpacity>
        </View>
      </View>

      {events.map((e) => (
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
  headerBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
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
