import React, { useMemo, useState } from "react";
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
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { useChatThread } from "../../features/parent/hooks";
import { useAuth } from "../../features/auth/AuthContext";

type ChatRoute = RouteProp<ParentStackParamList, "ChatThread">;

export const ChatThreadScreen: React.FC = () => {
  const { params } = useRoute<ChatRoute>();
  const { threadId } = params;
  const { user } = useAuth();
  const { thread, messages, isLoading, isError, error, send, sending } = useChatThread(threadId);
  const [input, setInput] = useState("");

  const conversationTitle = useMemo(() => {
    if (thread?.child?.prenom || thread?.child?.nom) {
      return `${thread.child.prenom ?? ""} ${thread.child.nom ?? ""}`.trim();
    }
    return thread?.title ?? "المحادثة";
  }, [thread]);

  const canSend = input.trim().length > 0 && !sending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={80}
    >
      <View style={styles.threadHeader}>
        <Text style={styles.threadTitle}>{conversationTitle}</Text>
        {thread?.participants ? (
          <Text style={styles.threadSubtitle} numberOfLines={1}>
            {thread.participants
              .filter((participant) => !participant.isCurrentUser)
              .map((participant) => participant.name)
              .join(" · ") || "-"}
          </Text>
        ) : null}
      </View>

      {isError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error ?? "تعذّر تحميل المحادثة."}</Text>
        </View>
      )}

      {isLoading && messages.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.loadingText}>جارٍ تحميل المحادثة...</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          renderItem={({ item }) => {
            const isParent = item.sender?.role === "PARENT" || item.sender?.id === user?.id;
            return (
              <View
                style={[
                  styles.bubbleRow,
                  { justifyContent: isParent ? "flex-end" : "flex-start" },
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isParent ? styles.bubbleParent : styles.bubbleEducator,
                  ]}
                >
                  <Text style={styles.bubbleText}>{item.text ?? ""}</Text>
                  <Text style={styles.bubbleTime}>
                    {new Date(item.createdAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="اكتب رسالة..."
          value={input}
          onChangeText={setInput}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={() => {
            if (!canSend) {
              return;
            }
            send(input.trim());
            setInput("");
          }}
          disabled={!canSend}
        >
          <Text style={styles.sendText}>{sending ? "..." : "إرسال"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  threadHeader: { paddingHorizontal: 16, paddingTop: 12 },
  threadTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  threadSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  errorBox: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: { color: "#B91C1C", textAlign: "center" },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: { color: "#4B5563" },
  bubbleRow: { flexDirection: "row", marginBottom: 8 },
  bubble: {
    maxWidth: "80%",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleParent: { backgroundColor: "#2563EB", marginLeft: 40 },
  bubbleEducator: { backgroundColor: "#E5E7EB", marginRight: 40 },
  bubbleText: { fontSize: 14, color: "#111827" },
  bubbleTime: { fontSize: 10, color: "#9CA3AF", textAlign: "right", marginTop: 4 },
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
  sendButtonDisabled: { opacity: 0.6 },
  sendText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
});
