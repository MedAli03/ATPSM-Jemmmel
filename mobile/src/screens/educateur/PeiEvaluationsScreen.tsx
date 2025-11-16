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

type Props = NativeStackScreenProps<EducatorStackParamList, "PeiEvaluations">;

const formatDate = (value: string) => new Date(value).toLocaleDateString();

const renderEvaluationItem = (item: PeiEvaluation): JSX.Element => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{formatDate(item.date)}</Text>
      <Text style={styles.badge}>{item.periode}</Text>
    </View>
    {item.note_globale !== undefined ? (
      <Text style={styles.noteText}>Note globale: {item.note_globale}</Text>
    ) : null}
    {item.commentaire_global ? (
      <Text style={styles.description}>{item.commentaire_global}</Text>
    ) : null}
    {item.created_by ? (
      <Text style={styles.meta}>Par {item.created_by}</Text>
    ) : null}
  </View>
);

export const PeiEvaluationsScreen: React.FC<Props> = ({ route }) => {
  const { peiId } = route.params;
  const { evaluations, loading, error, refetch } = usePeiEvaluations(peiId);
  const [periode, setPeriode] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateEvaluation = async () => {
    if (!periode.trim()) {
      setFormError("La période est requise.");
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
      setFormError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && evaluations.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
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
    <FlatList
      data={evaluations}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => renderEvaluationItem(item)}
      contentContainerStyle={
        evaluations.length === 0 ? styles.emptyContent : styles.listContent
      }
      ListHeaderComponent={() => (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Nouvelle évaluation</Text>
          <TextInput
            style={styles.input}
            placeholder="Période (ex: 3 mois)"
            value={periode}
            onChangeText={setPeriode}
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Commentaire"
            value={commentaire}
            onChangeText={setCommentaire}
            multiline
            numberOfLines={4}
          />
          <TextInput
            style={styles.input}
            placeholder="Note globale"
            value={note}
            onChangeText={setNote}
            keyboardType="numeric"
          />
          {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
          {error && evaluations.length > 0 ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleCreateEvaluation}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>
              {submitting ? "Enregistrement..." : "Ajouter"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={() => (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Aucune évaluation enregistrée.</Text>
        </View>
      )}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#d9534f",
    marginTop: 8,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
  },
  emptyContent: {
    flexGrow: 1,
    padding: 16,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  formCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#2a7bf6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
  },
  badge: {
    backgroundColor: "#eef3ff",
    color: "#2a7bf6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "600",
  },
  noteText: {
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    color: "#555",
    marginBottom: 6,
  },
  meta: {
    color: "#999",
    fontSize: 12,
  },
});
