import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";

type Route = RouteProp<EducatorStackParamList, "DailyNoteForm">;
type Nav = NativeStackNavigationProp<EducatorStackParamList>;

export const DailyNoteFormScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { childId } = params;
  const [note, setNote] = useState("");

  const handleSave = async () => {
    if (!note.trim()) {
      Alert.alert("تنبيه", "الرجاء كتابة الملاحظة.");
      return;
    }

    // TODO: POST /educateur/enfants/:id/notes
    console.log("Saving note for child", childId, note);
    Alert.alert("تمّ الحفظ", "تمّ حفظ الملاحظة بنجاح.", [
      { text: "حسنًا", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>ملاحظة يومية حول الطفل {childId}</Text>
      <TextInput
        style={styles.textArea}
        placeholder="اكتب هنا ملاحظة مختصرة حول سلوك الطفل، مشاركته، تفاعله..."
        multiline
        value={note}
        onChangeText={setNote}
      />
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>حفظ الملاحظة</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 16 },
  label: { fontSize: 14, color: "#4B5563", marginBottom: 8 },
  textArea: {
    minHeight: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    textAlignVertical: "top",
    fontSize: 14,
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});
