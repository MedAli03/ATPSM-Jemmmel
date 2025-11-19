// src/screens/parent/ParentMessagesScreen.tsx
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

  const renderThread = ({ item }: any) => {
    const otherParticipants =
      item.participants
        ?.filter((p: any) => !p.isCurrentUser)
        ?.map((p: any) => p.name)
        ?.join(" · ") || "بدون مربي";

    const lastMessage = item.lastMessage?.text ?? "لا توجد رسائل بعد";
    const lastDate = item.updatedAt ?? "";

    const childName =
      item.child?.prenom ||
      item.child?.nom ||
      item.title ||
      "محادثة غير مسمّاة";

    return (
      <TouchableOpacity
        style={styles.threadCard}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("ChatThread", {
            childId: item.child?.id ?? 0,
            threadId: item.id,
          })
        }
      >
        {/* Avatar + names */}
        <View style={styles.rowHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{childName[0]}</Text>
          </View>

          <View style={styles.threadInfo}>
            <Text style={styles.childName} numberOfLines={1}>
              {childName}
            </Text>
            <Text style={styles.educator} numberOfLines={1}>
              {otherParticipants}
            </Text>
          </View>
        </View>

        {/* Last message */}
        <Text style={styles.lastMessage} numberOfLines={1}>
          {lastMessage}
        </Text>

        {/* Date & unread badge */}
        <View style={styles.bottomRow}>
          <Text style={styles.lastDate}>{lastDate}</Text>

          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الرسائل</Text>
        <Text style={styles.headerSubtitle}>
          تواصل مباشر مع المربي(ة) المسؤول(ة) عن طفلك
        </Text>
      </View>

      <FlatList
        data={threads}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderThread}
        refreshing={isLoading && threads.length > 0}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
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
              {isError && <Text style={styles.errorText}>{String(error)}</Text>}
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F2F5FA",
    writingDirection: "rtl",
  },

  /* HEADER */
  header: {
    padding: 20,
    backgroundColor: "#2563EB",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "right",
  },
  headerSubtitle: {
    color: "#DBEAFE",
    fontSize: 13,
    marginTop: 4,
    textAlign: "right",
  },

  /* THREAD CARD */
  threadCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  rowHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 6,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2563EB33",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1D4ED8",
  },

  threadInfo: {
    flex: 1,
    alignItems: "flex-end",
  },

  childName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  educator: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  lastMessage: {
    fontSize: 13,
    color: "#374151",
    marginTop: 6,
    textAlign: "right",
  },

  bottomRow: {
    marginTop: 8,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },

  lastDate: {
    fontSize: 11,
    color: "#9CA3AF",
  },

  unreadBadge: {
    backgroundColor: "#DC2626",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },

  /* STATES */
  loadingBox: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: "#4B5563",
  },

  emptyBox: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    margin: 20,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827",
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  errorText: {
    marginTop: 8,
    color: "#B91C1C",
    fontSize: 12,
  },
});
