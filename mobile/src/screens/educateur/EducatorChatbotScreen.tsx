import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  getChatbotHistory,
  sendChatbotMessage,
} from "../../services/chatbot";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";

type ChatEntry = {
  id: string | number;
  question: string;
  answer: string;
  createdAt: string;
};

export const EducatorChatbotScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<
    "ACCESS_FORBIDDEN" | "LOAD_FAILED" | "MISSING_CHILD" | null
  >(null);
  const listRef = useRef<FlatList<ChatEntry>>(null);
  const route = useRoute<RouteProp<EducatorStackParamList, "EducatorChatbot">>();
  const childId = route.params?.childId;
  const childName = route.params?.childName;

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!childId) {
        setError("MISSING_CHILD");
        setMessages([]);
        return;
      }

      const data = await getChatbotHistory(childId);
      const mapped: ChatEntry[] = (data || []).map((row: any) => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
        createdAt: row.createdAt,
      }));
      setMessages(mapped);
      scrollToEnd();
    } catch (err: any) {
      console.warn("Failed to load chatbot history", err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("ACCESS_FORBIDDEN");
      } else {
        setError("LOAD_FAILED");
      }
    } finally {
      setLoading(false);
    }
  }, [childId, scrollToEnd]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    if (!childId) {
      setError("MISSING_CHILD");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatEntry = {
      id: tempId,
      question: trimmed,
      answer: "",
      createdAt: new Date().toISOString(),
    };

    setInput("");
    setMessages((prev) => [...prev, optimistic]);
    scrollToEnd();
    setSending(true);
    setError(null);

    try {
      const res = await sendChatbotMessage(childId, trimmed);
      const next: ChatEntry = {
        id: res?.id || res?.createdAt || tempId,
        question: res?.question || trimmed,
        answer: res?.answer || "",
        createdAt: res?.createdAt || optimistic.createdAt,
      };
      setMessages((prev) => prev.map((m) => (m.id === tempId ? next : m)));
      scrollToEnd();
    } catch (err: any) {
      console.error("Failed to send chatbot question", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(trimmed);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("ACCESS_FORBIDDEN");
      } else {
        setError("LOAD_FAILED");
      }
    } finally {
      setSending(false);
    }
  }, [childId, input, scrollToEnd, sending]);

  const renderItem = ({ item }: { item: ChatEntry }) => (
    <View style={styles.messageBlock}>
      <View style={[styles.bubble, styles.userBubble]}>
        <Text style={styles.bubbleLabel}>أنت</Text>
        <Text style={styles.bubbleText}>{item.question}</Text>
      </View>
      <View style={[styles.bubble, styles.botBubble]}>
        <Text style={styles.bubbleLabel}>المساعد</Text>
        {item.answer ? (
          <Text style={styles.bubbleText}>{item.answer}</Text>
        ) : (
          <ActivityIndicator size="small" color="#2563EB" />
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.loadingText}>جارٍ تحميل المحادثة...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {childName ? `${childName} · محادثة المساعد` : "محادثة المساعد"}
          </Text>
          <Text style={styles.subtitle}>
            Chatbot éducatif (llama2)
            {childName ? ` – ${childName}` : ""}
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {error === "ACCESS_FORBIDDEN"
                ? "ليس لديك صلاحية لاستخدام هذا المساعد لهذا الطفل."
                : error === "MISSING_CHILD"
                ? "يرجى اختيار طفل لبدء المحادثة."
                : "فشل تحميل المحادثة. حاول مجددًا."}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadHistory}>
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && messages.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>لا توجد محادثات سابقة لهذا الطفل</Text>
            <Text style={styles.emptySubtitle}>
              لا توجد محادثات سابقة لهذا الطفل. ابدأ بالسؤال الأول ✨
            </Text>
          </View>
        )}

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={scrollToEnd}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="اكتب سؤالك..."
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            editable={!sending && !!childId && error !== "ACCESS_FORBIDDEN"}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || sending || !childId || error === "ACCESS_FORBIDDEN") &&
                styles.sendDisabled,
            ]}
            onPress={handleSend}
            disabled={
              !input.trim() || sending || !childId || error === "ACCESS_FORBIDDEN"
            }
          >
            {sending ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.sendText}>إرسال</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3F4F6" },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  messageBlock: { marginBottom: 12 },
  bubble: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" },
  botBubble: { alignSelf: "flex-start", backgroundColor: "#FFFFFF" },
  bubbleLabel: { fontSize: 11, color: "#6B7280", marginBottom: 4 },
  bubbleText: { fontSize: 14, color: "#111827", lineHeight: 20 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    textAlign: "right",
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#2563EB",
    borderRadius: 12,
  },
  sendDisabled: { backgroundColor: "#93C5FD" },
  sendText: { color: "#FFFFFF", fontWeight: "700" },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loadingText: { fontSize: 13, color: "#4B5563" },
  errorBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: { color: "#B91C1C", fontSize: 13, marginBottom: 4 },
  retryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F87171",
    borderRadius: 10,
  },
  retryText: { color: "#FFFFFF", fontWeight: "600" },
  emptyBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#1D4ED8" },
  emptySubtitle: { fontSize: 13, color: "#1E3A8A", marginTop: 4 },
});
