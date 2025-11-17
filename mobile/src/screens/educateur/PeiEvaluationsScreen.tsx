// src/screens/educateur/PeiEvaluationsScreen.tsx
import React, { useState } from "react";
import {
  ActivityIndicator,
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
  const [periode, setPeriode] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateEvaluation = async () => {
    if (!periode.trim()) {
      setFormError("الرجاء إدخال الفترة.");
      return;
    }
    setSubmitting(true);
    try {
      await createPeiEvaluation(peiId, {
        periode: periode.trim(),
        commentaire_global: commentaire.trim() || undefined,
        note_globale: note ? Number(note) : undefined,
      });
      setPeriode("");
      setCommentaire("");
      setNote("");
      setFormError(null);
      await refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "حدث خطأ غير متوقع.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderEvaluationItem = ({ item }: { item: PeiEvaluation }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>التاريخ: {formatDate(item.date)}</Text>
        <Text style={styles.badge}>الفترة: {item.periode}</Text>
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
              placeholder="الفترة (مثلاً: 3 أشهر)"
              placeholderTextColor="#9AA0B5"
              value={periode}
              onChangeText={setPeriode}
              textAlign="right"
            />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="ملاحظات عامة"
              placeholderTextColor="#9AA0B5"
              value={commentaire}
              onChangeText={setCommentaire}
              multiline
              numberOfLines={4}
              textAlign="right"
              textAlignVertical="top"
            />
            <TextInput
              style={styles.input}
              placeholder="الدرجة العامة"
              placeholderTextColor="#9AA0B5"
              value={note}
              onChangeText={setNote}
              keyboardType="numeric"
              textAlign="right"
            />
            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
            {error && evaluations.length > 0 ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleCreateEvaluation}
              disabled={submitting}
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
});
