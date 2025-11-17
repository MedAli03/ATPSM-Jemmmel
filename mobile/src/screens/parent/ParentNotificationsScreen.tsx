import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const MOCK_NOTIFS = [
  {
    id: 1,
    title: "ملاحظة جديدة لطفلك Ahmed",
    body: "L’éducatrice a ajouté une note quotidienne pour aujourd’hui.",
    date: "Aujourd’hui · 10:30",
  },
  {
    id: 2,
    title: "نشاط جديد",
    body: "Atelier « Habiletés sociales » prévu demain à 9h.",
    date: "Hier · 18:00",
  },
];

export const ParentNotificationsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_NOTIFS}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>لا توجد إشعارات حاليًا</Text>
            <Text style={styles.emptyText}>
              ستظهر هنا آخر التحديثات حول أطفالك.
            </Text>
          </View>
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
  emptyBox: {
    padding: 16,
    margin: 16,
    borderRadius: 14,
    backgroundColor: "#FFF",
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  emptyText: { fontSize: 13, color: "#6B7280" },
});
