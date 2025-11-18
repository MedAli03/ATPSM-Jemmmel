import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { useParentThreads } from "../../features/parent/hooks";

type Nav = NativeStackNavigationProp<ParentStackParamList>;

export const ParentMessagesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { threads, isLoading, isError, error, refetch } = useParentThreads();

  return (
    <View style={styles.container}>
      <FlatList
        data={threads}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        refreshing={isLoading && threads.length > 0}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.threadCard}
            onPress={() =>
              navigation.navigate("ChatThread", {
                childId: item.child?.id ?? 0,
                threadId: item.id,
              })
            }
          >
            <Text style={styles.childName}>
              {item.child?.prenom || item.child?.nom || item.title || "محادثة"}
            </Text>
            <Text style={styles.educator} numberOfLines={1}>
              {item.participants
                .filter((p) => !p.isCurrentUser)
                .map((p) => p.name)
                .join(" · ") || "-"}
            </Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage?.text ?? "لا توجد رسائل بعد"}
            </Text>
            <Text style={styles.lastDate}>{item.updatedAt ?? ""}</Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#2563EB" />
              <Text style={styles.loadingText}>جارٍ تحميل المحادثات...</Text>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>لا توجد محادثات بعد</Text>
              <Text style={styles.emptyText}>
                يمكنك بدء محادثة من خلال لوحة متابعة الطفل أو من إدارة الجمعية.
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
  threadCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  childName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  educator: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  lastMessage: { fontSize: 13, color: "#374151", marginTop: 6 },
  lastDate: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "right",
  },
  unreadBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#DC2626",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  loadingBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 24, gap: 8 },
  loadingText: { color: "#4B5563" },
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
