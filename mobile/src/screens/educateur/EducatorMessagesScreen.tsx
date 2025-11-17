import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";

type Nav = NativeStackNavigationProp<EducatorStackParamList>;

const MOCK_THREADS = [
  {
    id: 1,
    childId: 1,
    childName: "Ahmed Ben Ali",
    parentName: "Ali Ben Ali",
    lastMessage: "Merci madame pour la mise à jour.",
    lastDate: "Hier",
  },
];

export const EducatorMessagesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_THREADS}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.threadCard}
            onPress={() =>
              navigation.navigate("EducatorChatThread", {
                childId: item.childId,
                threadId: item.id,
              })
            }
          >
            <Text style={styles.childName}>{item.childName}</Text>
            <Text style={styles.parentName}>وليّ الأمر: {item.parentName}</Text>
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
              ستظهر هنا محادثاتك مع الأولياء حول الأطفال.
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
  emptyBox: {
    padding: 16,
    margin: 16,
    borderRadius: 16,
    backgroundColor: "#FFF",
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  emptyText: { fontSize: 13, color: "#6B7280" },
});
