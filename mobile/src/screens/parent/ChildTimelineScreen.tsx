// src/screens/parent/ChildTimelineScreen.tsx
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { useChildTimeline } from "../../features/parent/hooks";
import { TimelineItem } from "../../features/parent/types";

type Props = NativeStackScreenProps<ParentStackParamList, "ChildTimeline">;

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const timelineBadgeStyles: Record<TimelineItem["type"], object> = {
  NOTE: { backgroundColor: "#2196f3" },
  ACTIVITE: { backgroundColor: "#ff9800" },
  EVALUATION: { backgroundColor: "#9c27b0" },
};

const TimelineCard: React.FC<{ item: TimelineItem }> = ({ item }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
        <View style={[styles.badge, timelineBadgeStyles[item.type]]}>
          <Text style={styles.badgeText}>{item.type}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{item.titre}</Text>
      {item.description ? (
        <Text style={styles.cardDescription}>{item.description}</Text>
      ) : null}
      {item.created_by ? (
        <Text style={styles.cardFooter}>Par {item.created_by}</Text>
      ) : null}
    </View>
  );
};

export const ChildTimelineScreen: React.FC<Props> = ({ route }) => {
  const { childId } = route.params;
  const { data: timeline, loading, error } = useChildTimeline(childId);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={timeline}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={
        timeline.length === 0 ? styles.emptyContent : styles.timelineContent
      }
      renderItem={({ item }) => <TimelineCard item={item} />}
      ListEmptyComponent={() => (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Aucun événement pour cet enfant.</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#d9534f",
    textAlign: "center",
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyText: {
    color: "#666",
  },
  timelineContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardDate: {
    color: "#888",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  cardDescription: {
    color: "#444",
    marginBottom: 8,
  },
  cardFooter: {
    color: "#777",
    fontStyle: "italic",
  },
});
