import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";

type Route = RouteProp<EducatorStackParamList, "ActivityForm">;
type Nav = NativeStackNavigationProp<EducatorStackParamList>;

export const ActivityFormScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { childId } = params;

  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال عنوان النشاط.");
      return;
    }

    // TODO: POST /educateur/enfants/:id/activites
    console.log("Saving activity for child", childId, {
      title,
      objective,
      description,
    });
    Alert.alert("تمّ الحفظ", "تمّ حفظ النشاط بنجاح.", [
      { text: "حسنًا", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>عنوان النشاط</Text>
      <TextInput
        style={styles.input}
        placeholder="مثال: لعبة تصنيف الألوان"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>الهدف التربوي</Text>
      <TextInput
        style={styles.input}
        placeholder="مثال: تنمية مهارات الانتباه والتركيز"
        value={objective}
        onChangeText={setObjective}
      />

      <Text style={styles.label}>وصف مختصر</Text>
      <TextInput
        style={styles.textArea}
        placeholder="شرح خطوات النشاط، الوسائل المستعملة، أسلوب التعزيز..."
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>حفظ النشاط</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 16 },
  label: { fontSize: 14, color: "#4B5563", marginBottom: 4, marginTop: 10 },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 14,
  },
  textArea: {
    minHeight: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    textAlignVertical: "top",
    fontSize: 14,
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: "#10B981",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});
