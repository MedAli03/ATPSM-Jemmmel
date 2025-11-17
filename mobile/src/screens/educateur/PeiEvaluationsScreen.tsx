// src/screens/educateur/PeiEvaluationsScreen.tsx
import React, { useMemo, useState } from "react";
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
  const [evaluationDate, setEvaluationDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState("");
  const [score, setScore] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const validateFields = () => {
    const trimmedDate = evaluationDate.trim();
    const trimmedNotes = notes.trim();
    const trimmedScore = score.trim();
    const errors: Partial<Record<"date" | "score" | "notes", string>> = {};

    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
      errors.date = "صيغة التاريخ يجب أن تكون YYYY-MM-DD.";
    }

    if (!trimmedScore) {
      errors.score = "هذا الحقل إجباري.";
    } else {
      const numeric = Number(trimmedScore);
      if (Number.isNaN(numeric)) {
        errors.score = "الرجاء إدخال رقم صالح.";
      } else if (!Number.isInteger(numeric)) {
        errors.score = "الرجاء إدخال قيمة عددية صحيحة.";
      } else if (numeric < 0 || numeric > 100) {
        errors.score = "الدرجة يجب أن تكون بين 0 و100.";
      }
    }

    if (trimmedNotes && trimmedNotes.length < 10) {
      errors.notes = "الملاحظات العامة يجب أن تحتوي 10 أحرف على الأقل.";
    }

    return errors;
  };

  const currentErrors = useMemo(() => validateFields(), [evaluationDate, score, notes]);
  const hasBlockingErrors = Object.keys(currentErrors).length > 0;
  const shouldShowServerError = formError && !hasBlockingErrors;

  const handleCreateEvaluation = async () => {
    setShowErrors(true);
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setSuccessMessage(null);
      setFormError(errors.date || errors.score || errors.notes || "يرجى تصحيح الحقول المحددة.");
      return;
    }
    setSubmitting(true);
    try {
      await createPeiEvaluation(peiId, {
        date_evaluation: evaluationDate.trim(),
        score: Number(score.trim()),
        notes: notes.trim() || undefined,
      });
      setEvaluationDate(new Date().toISOString().slice(0, 10));
      setNotes("");
      setScore("");
      setFormError(null);
      setSuccessMessage("تم حفظ التقييم بنجاح.");
      Alert.alert("تم الحفظ", "تمت إضافة التقييم الجديد.");
      await refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "حدث خطأ غير متوقع.");
      setSuccessMessage(null);
    } finally {
      setSubmitting(false);
    }
  };

  const renderEvaluationItem = ({ item }: { item: PeiEvaluation }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>التاريخ: {formatDate(item.date)}</Text>
        <Text style={styles.badge}>الدرجة: {item.score ?? "-"}/100</Text>
      </View>
      {item.notes ? <Text style={styles.cardDescription}>{item.notes}</Text> : null}
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
              value={evaluationDate}
              onChangeText={setEvaluationDate}
              textAlign="right"
              onFocus={() => setShowErrors(true)}
            />
            {showErrors && currentErrors.date ? (
              <Text style={styles.errorText}>{currentErrors.date}</Text>
            ) : null}
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="ملاحظات عامة"
              placeholderTextColor="#9AA0B5"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlign="right"
              textAlignVertical="top"
              onFocus={() => setShowErrors(true)}
            />
            {showErrors && currentErrors.notes ? (
              <Text style={styles.errorText}>{currentErrors.notes}</Text>
            ) : null}
            <TextInput
              style={styles.input}
              placeholder="الدرجة العامة (0-100)"
              placeholderTextColor="#9AA0B5"
              value={score}
              onChangeText={setScore}
              keyboardType="numeric"
              textAlign="right"
              onFocus={() => setShowErrors(true)}
            />
            {showErrors && currentErrors.score ? (
              <Text style={styles.errorText}>{currentErrors.score}</Text>
            ) : null}
            {shouldShowServerError ? (
              <Text style={styles.errorText}>{formError}</Text>
            ) : null}
            {successMessage ? (
              <Text style={styles.successText}>{successMessage}</Text>
            ) : null}
            {error && evaluations.length > 0 ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleCreateEvaluation}
              disabled={submitting || hasBlockingErrors}
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
