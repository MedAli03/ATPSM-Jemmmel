import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";
import { addPEIActivity, getActivePeiForChild } from "../../features/educateur/api";

type Route = RouteProp<EducatorStackParamList, "ActivityForm">;
type Nav = NativeStackNavigationProp<EducatorStackParamList>;

export const ActivityFormScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { childId, peiId: initialPeiId } = params;

  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [peiId, setPeiId] = useState<number | null>(initialPeiId ?? null);
  const [loadingPei, setLoadingPei] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialPeiId) {
      return;
    }
    let isMounted = true;
    const fetchPei = async () => {
      setLoadingPei(true);
      try {
        const pei = await getActivePeiForChild(childId);
        if (isMounted) {
          setPeiId(pei?.id ?? null);
        }
      } catch (err) {
        console.error("Failed to load active PEI for activity", err);
      } finally {
        if (isMounted) {
          setLoadingPei(false);
        }
      }
    };
    fetchPei();
    return () => {
      isMounted = false;
    };
  }, [childId, initialPeiId]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال عنوان النشاط.");
      return;
    }

    if (!peiId) {
      Alert.alert("تنبيه", "لا يوجد PEI نشط، لا يمكن ربط النشاط.");
      return;
    }

    setSaving(true);
    try {
      await addPEIActivity(peiId, {
        titre: title.trim(),
        objectifs: objective.trim() || undefined,
        description: description.trim() || undefined,
        date_activite: new Date().toISOString(),
        enfant_id: childId,
      });
      Alert.alert("تمّ الحفظ", "تمّ حفظ النشاط بنجاح.", [
        { text: "حسنًا", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Failed to save activity", err);
      const message = err instanceof Error ? err.message : "تعذّر حفظ النشاط. حاول مجددًا.";
      Alert.alert("خطأ", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {loadingPei && !peiId ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.loaderText}>جارٍ التحقق من الـ PEI النشط...</Text>
        </View>
      ) : null}
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

      <TouchableOpacity
        style={[styles.saveBtn, (saving || loadingPei) && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving || loadingPei}
      >
        <Text style={styles.saveText}>{saving ? "..." : "حفظ النشاط"}</Text>
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
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  loader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  loaderText: { color: "#6B7280", fontSize: 13 },
});
