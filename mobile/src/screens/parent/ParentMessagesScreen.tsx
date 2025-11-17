import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParentStackParamList } from "../../navigation/ParentNavigator";

type Nav = NativeStackNavigationProp<ParentStackParamList>;

const MOCK_THREADS = [
  {
    id: 1,
    childId: 1,
    childName: "Ahmed",
    educatorName: "أ. مريم",
    lastMessage: "Merci pour la photo, Ahmed était très content.",
    lastDate: "Hier",
  },
];

export const ParentMessagesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_THREADS}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.threadCard}
            onPress={() =>
              navigation.navigate("ChatThread", {
                childId: item.childId,
                threadId: item.id,
              })
            }
          >
            <Text style={styles.childName}>{item.childName}</Text>
            <Text style={styles.educator}>مع: {item.educatorName}</Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            <Text style={styles.lastDate}>{item.lastDate}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>لا توجد محادثات بعد</Text>
            <Text style={styles.emptyText}>
              يمكنك بدء محادثة من خلال لوحة متابعة الطفل أو من إدارة الجمعية.
            </Text>
          </View>
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
  emptyBox: {
    padding: 16,
    margin: 16,
    borderRadius: 14,
    backgroundColor: "#FFF",
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  emptyText: { fontSize: 13, color: "#6B7280" },
});
