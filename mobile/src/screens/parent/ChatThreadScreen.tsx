import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ParentStackParamList } from "../../navigation/ParentNavigator";

type ChatRoute = RouteProp<ParentStackParamList, "ChatThread">;

type Message = {
  id: number;
  from: "PARENT" | "EDUCATEUR";
  content: string;
  createdAt: string;
};

const MOCK_MESSAGES: Message[] = [
  { id: 1, from: "EDUCATEUR", content: "Bonjour, Ahmed a très bien travaillé aujourd’hui.", createdAt: "09:15" },
  { id: 2, from: "PARENT", content: "Merci beaucoup pour vos efforts 🙏", createdAt: "09:20" },
];

export const ChatThreadScreen: React.FC = () => {
  const { params } = useRoute<ChatRoute>();
  const { childId } = params;
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: messages.length + 1,
      from: "PARENT",
      content: input.trim(),
      createdAt: "Maintenant",
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    // TODO: call API to send message
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={80}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        renderItem={({ item }) => {
          const isParent = item.from === "PARENT";
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
                <Text style={styles.bubbleText}>{item.content}</Text>
                <Text style={styles.bubbleTime}>{item.createdAt}</Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="اكتب رسالة..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>إرسال</Text>
        </TouchableOpacity>
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
  sendText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
});
