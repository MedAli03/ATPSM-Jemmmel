import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";
import {
  getThreadDetails,
  listThreadMessages,
  markThreadAsRead,
  sendThreadMessage,
} from "../../features/educateur/api";
import { MessageCursor, MessageThreadSummary, ThreadMessage } from "../../features/educateur/types";
import { showSuccessMessage } from "../../utils/feedback";

type Route = RouteProp<EducatorStackParamList, "EducatorChatThread">;

export const EducatorChatThreadScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const { childId, threadId } = params;
  const [thread, setThread] = useState<MessageThreadSummary | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(Boolean(threadId));
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<MessageCursor | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);

  const getMessageValidationError = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "هذا الحقل إجباري";
    }
    if (trimmed.length < 2) {
      return "النص قصير جدًا";
    }
    if (trimmed.length > 2000) {
      return "النص طويل جدًا";
    }
    return null;
  }, []);

  const pendingInputError = useMemo(
    () => getMessageValidationError(input),
    [getMessageValidationError, input]
  );

  const validateForm = useCallback(() => {
    const error = getMessageValidationError(input);
    if (error) {
      setSendError(error);
      return false;
    }
    setSendError(null);
    return true;
  }, [getMessageValidationError, input]);

  const isSendDisabled = sending || Boolean(pendingInputError);

  const loadThread = useCallback(async () => {
    if (!threadId) return;
    setLoading(true);
    setError(null);
    try {
      const [threadDetails, history] = await Promise.all([
        getThreadDetails(threadId),
        listThreadMessages(threadId, { limit: 30 }),
      ]);
      setThread(threadDetails);
      setMessages(history.messages);
      setNextCursor(history.nextCursor);
      if (history.messages.length) {
        await markThreadAsRead(threadId, history.messages[history.messages.length - 1].id);
      }
    } catch (err) {
      console.error("Failed to load thread", err);
      setError("تعذّر تحميل المحادثة. الرجاء العودة لاحقًا.");
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  useEffect(() => {
    if (!sendFeedback) {
      return;
    }
    const timeout = setTimeout(() => setSendFeedback(null), 3000);
    return () => clearTimeout(timeout);
  }, [sendFeedback]);

  const refreshMessages = useCallback(async () => {
    if (!threadId) return;
    setRefreshing(true);
    try {
      const history = await listThreadMessages(threadId, { limit: 30 });
      setMessages(history.messages);
      setNextCursor(history.nextCursor);
      if (history.messages.length) {
        await markThreadAsRead(threadId, history.messages[history.messages.length - 1].id);
      }
    } catch (err) {
      console.error("Failed to refresh messages", err);
      Alert.alert("خطأ", "تعذّر تحديث الرسائل، حاول مجددًا.");
    } finally {
      setRefreshing(false);
    }
  }, [threadId]);

  const loadOlder = useCallback(async () => {
    if (!threadId || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const history = await listThreadMessages(threadId, { cursor: nextCursor, limit: 30 });
      setMessages((prev) => [...history.messages, ...prev]);
      setNextCursor(history.nextCursor);
    } catch (err) {
      console.error("Failed to load older messages", err);
      Alert.alert("خطأ", "تعذّر تحميل رسائل أقدم.");
    } finally {
      setLoadingMore(false);
    }
  }, [threadId, nextCursor, loadingMore]);

  const handleSend = useCallback(async () => {
    if (!threadId) return;
    if (!validateForm()) {
      return;
    }
    const trimmed = input.trim();
    setSendFeedback(null);
    setSending(true);
    try {
      const message = await sendThreadMessage(threadId, { text: trimmed });
      setMessages((prev) => [...prev, message]);
      setInput("");
      setSendFeedback("تم إرسال الرسالة بنجاح.");
      showSuccessMessage("تم إرسال الرسالة");
    } catch (err) {
      console.error("Failed to send message", err);
      const message = err instanceof Error ? err.message : "تعذّر إرسال الرسالة.";
      Alert.alert("خطأ", message);
      setSendError(message);
    } finally {
      setSending(false);
    }
  }, [input, threadId, validateForm]);

  const isEducatorMessage = useCallback(
    (message: ThreadMessage) => message.sender?.role === "EDUCATEUR",
    []
  );

  const threadTitle = useMemo(() => {
    if (thread?.title) return thread.title;
    const parent = thread?.participants.find((p) => p.role === "PARENT");
    return parent?.name ?? "محادثة";
  }, [thread]);

  if (!threadId) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>لا يوجد معرف للمحادثة</Text>
        <Text style={styles.emptyText}>يرجى فتح شاشة الرسائل واختيار محادثة للعرض.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={80}
    >
      <View style={styles.threadInfoBox}>
        <Text style={styles.threadTitle}>{threadTitle}</Text>
        {thread?.participants.length ? (
          <Text style={styles.threadSubtitle}>
            المشاركون: {thread.participants.map((p) => p.name).filter(Boolean).join("، ")}
          </Text>
        ) : null}
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && messages.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.loadingText}>جارٍ تحميل الرسائل...</Text>
        </View>
      ) : null}

      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshMessages} />}
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>لا توجد رسائل بعد</Text>
              <Text style={styles.emptyText}>ابدأ المحادثة بإرسال أول رسالة.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const educator = isEducatorMessage(item);
          return (
            <View
              style={[
                styles.bubbleRow,
                { justifyContent: educator ? "flex-end" : "flex-start" },
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  educator ? styles.bubbleEducator : styles.bubbleParent,
                ]}
              >
                <Text style={styles.bubbleText}>{item.text}</Text>
                <Text style={styles.bubbleTime}>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleTimeString("ar-TN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {nextCursor ? (
        <TouchableOpacity
          style={styles.loadOlderBtn}
          onPress={loadOlder}
          disabled={loadingMore}
        >
          <Text style={styles.loadOlderText}>
            {loadingMore ? "جارٍ التحميل..." : "تحميل رسائل أقدم"}
          </Text>
        </TouchableOpacity>
      ) : null}

        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={`رسالة حول الطفل ${childId ?? ""}...`}
              value={input}
              onChangeText={(text) => {
                setInput(text);
                if (sendError) {
                  setSendError(null);
                }
              }}
              maxLength={2000}
            />
            <TouchableOpacity
              style={[styles.sendButton, isSendDisabled && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={isSendDisabled}
            >
              <Text style={styles.sendText}>{sending ? "..." : "إرسال"}</Text>
            </TouchableOpacity>
          </View>
          {sendError ? <Text style={styles.sendErrorText}>{sendError}</Text> : null}
          {sendFeedback ? <Text style={styles.sendSuccessText}>{sendFeedback}</Text> : null}
        </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  bubbleRow: { flexDirection: "row", marginBottom: 8 },
  bubble: {
    maxWidth: "80%",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleEducator: { backgroundColor: "#2563EB", marginLeft: 40 },
  bubbleParent: { backgroundColor: "#E5E7EB", marginRight: 40 },
  bubbleText: { fontSize: 14, color: "#111827" },
  bubbleTime: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
  },
  threadInfoBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  threadTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  threadSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  errorBox: {
    marginHorizontal: 16,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: { color: "#B91C1C", fontSize: 13, textAlign: "right" },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
  },
  loadingText: { color: "#4B5563", fontSize: 13 },
  inputSection: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
  },
  sendButton: {
    marginLeft: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
  sendErrorText: {
    color: "#B91C1C",
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
    marginHorizontal: 8,
  },
  sendSuccessText: {
    color: "#059669",
    fontSize: 12,
    textAlign: "right",
    marginTop: 2,
    marginHorizontal: 8,
  },
  loadOlderBtn: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 8,
    alignItems: "center",
  },
  loadOlderText: { color: "#2563EB", fontWeight: "600", fontSize: 13 },
  emptyState: {
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 6 },
  emptyText: { fontSize: 13, color: "#6B7280", lineHeight: 20 },
});
