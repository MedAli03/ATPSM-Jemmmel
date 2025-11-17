// src/screens/parent/ChildTimelineScreen.tsx
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { useChildTimeline } from "../../features/parent/hooks";
import { TimelineItem } from "../../features/parent/types";

const PRIMARY = "#2563EB";
const typeLabels: Record<TimelineItem["type"], string> = {
  NOTE: "ملاحظة",
  ACTIVITE: "نشاط",
  EVALUATION: "تقييم",
};

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("ar-TN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

type Props = NativeStackScreenProps<ParentStackParamList, "ChildTimeline">;

export const ChildTimelineScreen: React.FC<Props> = ({ route }) => {
  const { childId } = route.params;
  const { data: timeline = [], loading, error } = useChildTimeline(childId);

  if (loading && timeline.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={PRIMARY} />
      </View>
    );
  }

  if (error && timeline.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: TimelineItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>التاريخ: {formatDate(item.date)}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{typeLabels[item.type]}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{item.titre}</Text>
      {item.description ? (
        <Text style={styles.cardDescription}>{item.description}</Text>
      ) : null}
      {item.created_by ? (
        <Text style={styles.cardFooter}>المربي: {item.created_by}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>متابعة الطفل</Text>
      <FlatList
        data={timeline}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={
          timeline.length === 0 ? styles.emptyContent : styles.listContent
        }
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>لا توجد ملاحظات بعد.</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F7FA",
    padding: 16,
    direction: "rtl",
    writingDirection: "rtl",
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    textAlign: "right",
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardDate: {
    color: "#6B7280",
    fontSize: 14,
  },
  badge: {
    backgroundColor: "#DBEAFE",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  badgeText: {
    color: PRIMARY,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    textAlign: "right",
  },
  cardDescription: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    textAlign: "right",
    marginBottom: 8,
  },
  cardFooter: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "right",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    direction: "rtl",
    writingDirection: "rtl",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 16,
    textAlign: "center",
  },
});
