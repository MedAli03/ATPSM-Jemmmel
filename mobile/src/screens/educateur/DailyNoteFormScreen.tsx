import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";
import { ForbiddenError, addDailyNote, getActivePeiForChild } from "../../features/educateur/api";

type Route = RouteProp<EducatorStackParamList, "DailyNoteForm">;
type Nav = NativeStackNavigationProp<EducatorStackParamList>;

export const DailyNoteFormScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { childId, peiId: initialPeiId } = params;
  const [note, setNote] = useState("");
  const [peiId, setPeiId] = useState<number | null>(initialPeiId ?? null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPeiId) {
      return;
    }

    let isMounted = true;
    const fetchPei = async () => {
      setLoading(true);
      try {
        const pei = await getActivePeiForChild(childId);
        if (isMounted) {
          setPeiId(pei?.id ?? null);
        }
      } catch (err) {
        console.error("Failed to load active PEI for note", err);
        if (err instanceof ForbiddenError) {
          Alert.alert("غير مصرح", err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPei();

    return () => {
      isMounted = false;
    };
  }, [childId, initialPeiId]);

  const handleSave = async () => {
    const trimmed = note.trim();

    if (trimmed.length < 10) {
      const message = "الرجاء إدخال ملاحظة أوضح (10 أحرف على الأقل).";
      setFormError(message);
      Alert.alert("تنبيه", message);
      return;
    }

    if (trimmed.length > 800) {
      const message = "الملاحظة طويلة جدًا، الرجاء الاختصار (أقل من 800 حرف).";
      setFormError(message);
      Alert.alert("تنبيه", message);
      return;
    }

    if (!peiId) {
      const message = "لا يوجد PEI نشط لهذا الطفل، لا يمكن ربط الملاحظة.";
      setFormError(message);
      Alert.alert("تنبيه", message);
      return;
    }

    setFormError(null);

    setSaving(true);
    try {
      await addDailyNote(childId, {
        peiId,
        date_note: new Date().toISOString(),
        contenu: trimmed,
      });
      Alert.alert("تمّ الحفظ", "تمّ حفظ الملاحظة بنجاح.", [
        { text: "حسنًا", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Failed to save daily note", err);
      const defaultMessage = "تعذّر حفظ الملاحظة. حاول مرة أخرى.";
      const message = err instanceof ForbiddenError ? err.message : err instanceof Error ? err.message : defaultMessage;
      setFormError(message);
      Alert.alert("خطأ", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && !peiId ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.loaderText}>جارٍ التحقق من الـ PEI النشط...</Text>
        </View>
      ) : null}
      <Text style={styles.label}>ملاحظة يومية حول الطفل {childId}</Text>
      <TextInput
        style={styles.textArea}
        placeholder="اكتب هنا ملاحظة مختصرة حول سلوك الطفل، مشاركته، تفاعله..."
        multiline
        value={note}
        onChangeText={setNote}
      />
      {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
      <TouchableOpacity
        style={[styles.saveBtn, (saving || loading) && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving || loading}
      >
        <Text style={styles.saveText}>{saving ? "..." : "حفظ الملاحظة"}</Text>
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
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  loader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  loaderText: { color: "#6B7280", fontSize: 13 },
});
