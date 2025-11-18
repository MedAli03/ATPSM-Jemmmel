import React from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useParentNotifications } from "../../features/parent/hooks";

export const ParentNotificationsScreen: React.FC = () => {
  const { notifications, isLoading, isError, error, refetch } = useParentNotifications();

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        refreshing={isLoading && notifications.length > 0}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.titre}</Text>
            <Text style={styles.body}>{item.corps ?? ""}</Text>
            <Text style={styles.date}>{item.created_at}</Text>
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#2563EB" />
              <Text style={styles.loadingText}>جارٍ تحميل الإشعارات...</Text>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>لا توجد إشعارات حاليًا</Text>
              <Text style={styles.emptyText}>
                ستظهر هنا آخر التحديثات حول أطفالك.
              </Text>
              {isError && <Text style={styles.errorText}>{error}</Text>}
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: { fontSize: 15, fontWeight: "600", marginBottom: 4, color: "#111827" },
  body: { fontSize: 13, color: "#4B5563" },
  date: { fontSize: 11, color: "#9CA3AF", marginTop: 8, textAlign: "right" },
  loadingBox: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", paddingVertical: 24 },
  loadingText: { color: "#374151" },
  emptyBox: {
    padding: 16,
    margin: 16,
    borderRadius: 14,
    backgroundColor: "#FFF",
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  emptyText: { fontSize: 13, color: "#6B7280" },
  errorText: { marginTop: 8, color: "#B91C1C", textAlign: "center" },
});
