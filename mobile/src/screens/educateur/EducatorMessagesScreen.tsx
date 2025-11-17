import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";
import { listMessageThreads } from "../../features/educateur/api";
import { MessageThreadSummary } from "../../features/educateur/types";

type Nav = NativeStackNavigationProp<EducatorStackParamList>;

export const EducatorMessagesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = useCallback(
    async (fromRefresh = false) => {
      if (fromRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const result = await listMessageThreads({ limit: 50 });
        setThreads(result.threads);
      } catch (err) {
        console.error("Failed to load threads", err);
        setError("تعذّر تحميل المحادثات. حاول مرة أخرى لاحقًا.");
      } finally {
        if (fromRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const onRefresh = useCallback(() => loadThreads(true), [loadThreads]);

  const formattedThreads = useMemo(() => threads, [threads]);

  const buildParentName = (thread: MessageThreadSummary) => {
    return thread.participants.find((p) => p.role === "PARENT")?.name;
  };

  const buildChildLabel = (thread: MessageThreadSummary) => {
    return thread.title || buildParentName(thread) || "محادثة";
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={formattedThreads}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          loading && formattedThreads.length === 0 ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#2563EB" />
              <Text style={styles.loadingText}>جارٍ تحميل المحادثات...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.threadCard}
            onPress={() =>
              navigation.navigate("EducatorChatThread", {
                threadId: item.id,
              })
            }
          >
            <Text style={styles.childName}>{buildChildLabel(item)}</Text>
            {buildParentName(item) ? (
              <Text style={styles.parentName}>وليّ الأمر: {buildParentName(item)}</Text>
            ) : null}
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage?.text ?? "لا توجد رسائل بعد"}
            </Text>
            <View style={styles.threadMetaRow}>
              <Text style={styles.lastDate}>
                {item.lastMessage?.createdAt
                  ? new Date(item.lastMessage.createdAt).toLocaleString("ar-TN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>لا توجد محادثات بعد</Text>
              <Text style={styles.emptyText}>
                ستظهر هنا محادثاتك مع الأولياء حول الأطفال.
              </Text>
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
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  childName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  parentName: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  lastMessage: { fontSize: 13, color: "#374151", marginTop: 6 },
  lastDate: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "right",
  },
  threadMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  unreadBadge: {
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#2563EB",
    alignItems: "center",
  },
  unreadText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  loadingText: { color: "#4B5563", fontSize: 13 },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 12,
  },
  errorText: { color: "#B91C1C", fontSize: 13, textAlign: "right" },
  emptyBox: {
    padding: 16,
    margin: 16,
    borderRadius: 16,
    backgroundColor: "#FFF",
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  emptyText: { fontSize: 13, color: "#6B7280" },
});
