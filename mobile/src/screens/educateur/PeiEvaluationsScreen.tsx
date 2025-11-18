// src/screens/educateur/PeiEvaluationsScreen.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createPeiEvaluation } from "../../features/educateur/api";
import { usePeiEvaluations } from "../../features/educateur/hooks";
import { PeiEvaluation } from "../../features/educateur/types";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";

const PRIMARY = "#2563EB";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("ar-TN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

type Props = NativeStackScreenProps<EducatorStackParamList, "PeiEvaluations">;

export const PeiEvaluationsScreen: React.FC<Props> = ({ route }) => {
  const { peiId, childName } = route.params;
  const { evaluations, loading, error, refetch } = usePeiEvaluations(peiId);
  const [dateEvaluation, setDateEvaluation] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ date?: string; score?: string; notes?: string }>({});

  const buildValidationErrors = useCallback(() => {
    const trimmedDate = dateEvaluation.trim();
    const trimmedNotes = notes.trim();
    const trimmedScore = score.trim();
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const errors: { date?: string; score?: string; notes?: string } = {};

    if (!trimmedDate) {
      errors.date = "هذا الحقل إجباري";
    } else if (!datePattern.test(trimmedDate)) {
      errors.date = "تنسيق غير صحيح";
    }

    if (!trimmedScore) {
      errors.score = "هذا الحقل إجباري";
    } else {
      const numericScore = Number(trimmedScore);
      if (Number.isNaN(numericScore)) {
        errors.score = "الرجاء إدخال رقم صالح";
      } else if (numericScore < 0 || numericScore > 100) {
        errors.score = "الدرجة يجب أن تكون بين 0 و100";
      }
    }

    if (trimmedNotes && trimmedNotes.length < 10) {
      errors.notes = "النص قصير جدًا";
    } else if (trimmedNotes.length > 1000) {
      errors.notes = "النص طويل جدًا";
    }

    return errors;
  }, [dateEvaluation, score, notes]);

  const hasPendingErrors = useMemo(
    () => Object.keys(buildValidationErrors()).length > 0,
    [buildValidationErrors]
  );

  const validateForm = useCallback(() => {
    const errors = buildValidationErrors();
    setFieldErrors(errors);
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      setFormError("يرجى تصحيح الحقول المطلوبة.");
    } else {
      setFormError(null);
    }
    return !hasErrors;
  }, [buildValidationErrors]);

  const clearFieldError = (key: keyof typeof fieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (formError) {
      setFormError(null);
    }
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const handleCreateEvaluation = async () => {
    if (!validateForm()) {
      setSuccessMessage(null);
      return;
    }
    setSubmitting(true);
    try {
      const trimmedDate = dateEvaluation.trim();
      const trimmedNotes = notes.trim();
      const numericScore = Number(score.trim());
      await createPeiEvaluation(peiId, {
        date_evaluation: `${trimmedDate}T00:00:00.000Z`,
        score: numericScore,
        notes: trimmedNotes || undefined,
      });
      setDateEvaluation(new Date().toISOString().slice(0, 10));
      setScore("");
      setNotes("");
      setFieldErrors({});
      setFormError(null);
      setSuccessMessage("تم حفظ التقييم بنجاح.");
      Alert.alert("تم الحفظ", "تمت إضافة التقييم الجديد.");
      await refetch();
    } catch (err) {
      const fallback = "حدث خطأ غير متوقع.";
      const message = err instanceof Error ? err.message : fallback;
      setFormError(message);
      setSuccessMessage(null);
      Alert.alert("خطأ", message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderEvaluationItem = ({ item }: { item: PeiEvaluation }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>التاريخ: {formatDate(item.date)}</Text>
        <Text style={styles.badge}>آخر تقييم: {formatDate(item.periode)}</Text>
      </View>
      {item.note_globale !== undefined ? (
        <Text style={styles.cardNote}>التقييم العام: {item.note_globale}</Text>
      ) : null}
      {item.commentaire_global ? (
        <Text style={styles.cardDescription}>{item.commentaire_global}</Text>
      ) : null}
      {item.created_by ? (
        <Text style={styles.cardFooter}>المربي: {item.created_by}</Text>
      ) : null}
    </View>
  );

  if (loading && evaluations.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={PRIMARY} />
      </View>
    );
  }

  if (error && evaluations.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>تقييمات الخطة</Text>
      <Text style={styles.screenSubtitle}>{childName}</Text>
      <FlatList
        data={evaluations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEvaluationItem}
        contentContainerStyle={
          evaluations.length === 0 ? styles.emptyContent : styles.listContent
        }
        ListHeaderComponent={() => (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>إضافة تقييم جديد</Text>
            <TextInput
              style={styles.input}
              placeholder="تاريخ التقييم (YYYY-MM-DD)"
              placeholderTextColor="#9AA0B5"
              value={dateEvaluation}
              onChangeText={(text) => {
                clearFieldError("date");
                setDateEvaluation(text);
              }}
              textAlign="right"
            />
            {fieldErrors.date ? (
              <Text style={styles.errorText}>{fieldErrors.date}</Text>
            ) : null}
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="ملاحظات عامة (اختياري)"
              placeholderTextColor="#9AA0B5"
              value={notes}
              onChangeText={(text) => {
                clearFieldError("notes");
                setNotes(text);
              }}
              multiline
              numberOfLines={4}
              textAlign="right"
              textAlignVertical="top"
            />
            {fieldErrors.notes ? (
              <Text style={styles.errorText}>{fieldErrors.notes}</Text>
            ) : null}
            <TextInput
              style={styles.input}
              placeholder="الدرجة العامة (0 - 100)"
              placeholderTextColor="#9AA0B5"
              value={score}
              onChangeText={(text) => {
                clearFieldError("score");
                setScore(text);
              }}
              keyboardType="numeric"
              textAlign="right"
            />
            {fieldErrors.score ? (
              <Text style={styles.errorText}>{fieldErrors.score}</Text>
            ) : null}
            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
            {successMessage ? (
              <Text style={styles.successText}>{successMessage}</Text>
            ) : null}
            {error && evaluations.length > 0 ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
            <TouchableOpacity
              style={[styles.button, (submitting || hasPendingErrors) && styles.buttonDisabled]}
              onPress={handleCreateEvaluation}
              disabled={submitting || hasPendingErrors}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                {submitting ? "جاري الحفظ..." : "حفظ التقييم"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>لا توجد تقييمات حتى الآن.</Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FA",
    padding: 16,
    direction: "rtl",
    writingDirection: "rtl",
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },
  screenSubtitle: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 16,
    textAlign: "right",
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: "#FDFDFE",
    fontSize: 16,
    color: "#111827",
  },
  multilineInput: {
    minHeight: 110,
  },
  button: {
    backgroundColor: PRIMARY,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  badge: {
    backgroundColor: "#DBEAFE",
    color: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "600",
  },
  cardNote: {
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
    textAlign: "right",
  },
  cardDescription: {
    color: "#4B5563",
    lineHeight: 22,
    textAlign: "right",
    marginBottom: 6,
  },
  cardFooter: {
    color: "#6B7280",
    fontSize: 13,
    textAlign: "right",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    direction: "rtl",
    writingDirection: "rtl",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 15,
    textAlign: "center",
    marginTop: 6,
  },
  successText: {
    color: "#059669",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
  },
});
