import React, { useEffect, useMemo, useState } from "react";
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
  const [showErrors, setShowErrors] = useState(false);

  const validateFields = () => {
    const trimmed = note.trim();
    const errors: Partial<Record<"note" | "pei", string>> = {};

    if (!trimmed) {
      errors.note = "هذا الحقل إجباري.";
    } else if (trimmed.length < 10) {
      errors.note = "الرجاء إدخال ملاحظة أوضح (10 أحرف على الأقل).";
    }

    if (!peiId) {
      errors.pei = "لا يوجد PEI نشط لهذا الطفل، لا يمكن ربط الملاحظة.";
    }

    return errors;
  };

  const currentErrors = useMemo(() => validateFields(), [note, peiId]);
  const hasBlockingErrors = Object.keys(currentErrors).length > 0;

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
    setShowErrors(true);
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      const firstMessage = errors.note || errors.pei || "يرجى تصحيح الحقول المحددة.";
      setFormError(firstMessage);
      Alert.alert("تنبيه", firstMessage);
      return;
    }

    const trimmed = note.trim();
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
        onChangeText={(value) => {
          setNote(value);
          if (!showErrors) {
            return;
          }
          setFormError(null);
        }}
        onFocus={() => setShowErrors(true)}
      />
      {showErrors && currentErrors.note ? (
        <Text style={styles.errorText}>{currentErrors.note}</Text>
      ) : null}
      {showErrors && currentErrors.pei ? (
        <Text style={styles.errorText}>{currentErrors.pei}</Text>
      ) : null}
      {formError && !(showErrors && (currentErrors.note || currentErrors.pei)) ? (
        <Text style={styles.errorText}>{formError}</Text>
      ) : null}
      <TouchableOpacity
        style={[styles.saveBtn, (saving || loading) && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving || loading || hasBlockingErrors}
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
