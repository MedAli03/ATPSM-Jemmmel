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
import { ForbiddenError, addPEIActivity, getActivePeiForChild } from "../../features/educateur/api";

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
  const [formError, setFormError] = useState<string | null>(null);

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
        if (err instanceof ForbiddenError) {
          Alert.alert("غير مصرح", err.message);
        }
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
    const trimmedTitle = title.trim();
    const trimmedObjective = objective.trim();
    const trimmedDescription = description.trim();

    if (trimmedTitle.length < 3) {
      const message = "الرجاء إدخال عنوان لا يقل عن 3 أحرف.";
      setFormError(message);
      Alert.alert("تنبيه", message);
      return;
    }

    if (trimmedObjective && trimmedObjective.length < 3) {
      const message = "الهدف التربوي يجب أن يكون أكثر تحديدًا.";
      setFormError(message);
      Alert.alert("تنبيه", message);
      return;
    }

    if (trimmedDescription && trimmedDescription.length < 10) {
      const message = "الرجاء تقديم وصف مكوّن من 10 أحرف على الأقل.";
      setFormError(message);
      Alert.alert("تنبيه", message);
      return;
    }

    if (!peiId) {
      const message = "لا يوجد PEI نشط، لا يمكن ربط النشاط.";
      setFormError(message);
      Alert.alert("تنبيه", message);
      return;
    }

    setFormError(null);

    setSaving(true);
    try {
      await addPEIActivity(peiId, {
        titre: trimmedTitle,
        objectifs: trimmedObjective || undefined,
        description: trimmedDescription || undefined,
        date_activite: new Date().toISOString(),
        enfant_id: childId,
      });
      Alert.alert("تمّ الحفظ", "تمّ حفظ النشاط بنجاح.", [
        { text: "حسنًا", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Failed to save activity", err);
      const fallback = "تعذّر حفظ النشاط. حاول مجددًا.";
      const message = err instanceof ForbiddenError ? err.message : err instanceof Error ? err.message : fallback;
      setFormError(message);
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
      {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

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
  errorText: {
    color: "#DC2626",
    marginTop: 8,
    textAlign: "center",
    fontSize: 13,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  loader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  loaderText: { color: "#6B7280", fontSize: 13 },
});
