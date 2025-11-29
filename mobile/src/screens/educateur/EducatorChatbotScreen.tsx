import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";
import {
  ChatbotMessage,
  getChatbotMessages,
  sendChatbotMessage,
} from "../../features/educateur/chatbot.api";

type Route = RouteProp<EducatorStackParamList, "EducatorChatbot">;

const formatTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

export const EducatorChatbotScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const { enfantId, anneeId, childName } = params;

  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const orderedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [messages]
  );

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const history = await getChatbotMessages(enfantId, anneeId);
      setMessages(history);
    } catch (err) {
      console.error("Failed to load chatbot messages", err);
      Alert.alert("خطأ", "تعذّر تحميل المحادثة. حاول مجددًا.");
    } finally {
      setLoading(false);
    }
  }, [anneeId, enfantId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const result = await sendChatbotMessage(enfantId, anneeId, trimmed);
      setMessages((prev) => [...prev, result.userMessage, result.assistantMessage]);
      setInput("");
    } catch (err) {
      console.error("Failed to send chatbot message", err);
      Alert.alert("خطأ", "تعذّر إرسال الرسالة إلى المساعد.");
    } finally {
      setSending(false);
    }
  }, [anneeId, enfantId, input, sending]);

  const renderItem = ({ item }: { item: ChatbotMessage }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={styles.bubbleMeta}>
          {isUser ? "أنت" : "المساعد"} · {formatTime(item.created_at)}
        </Text>
        <Text style={styles.bubbleText}>{item.message}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}> 
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <Text style={styles.title}>المساعد البيداغوجي</Text>
        <Text style={styles.subtitle}>{childName ? `للطفل ${childName}` : ""}</Text>
      </View>

      <FlatList
        data={orderedMessages}
        keyExtractor={(item) => `${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="اكتب سؤالك للمساعد..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={sending}
        >
          <Text style={styles.sendText}>{sending ? "..." : "إرسال"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 14, color: "#4B5563", marginTop: 4 },
  listContent: { padding: 16, gap: 10 },
  bubble: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  userBubble: {
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
  botBubble: {
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  bubbleMeta: { fontSize: 11, color: "#6B7280", marginBottom: 6 },
  bubbleText: { fontSize: 14, color: "#111827", lineHeight: 20 },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F9FAFB",
  },
  sendButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#2563EB",
    borderRadius: 10,
  },
  sendButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  sendText: { color: "#FFFFFF", fontWeight: "700" },
});
