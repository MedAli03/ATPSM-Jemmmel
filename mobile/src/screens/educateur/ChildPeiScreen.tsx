// src/screens/educateur/ChildPeiScreen.tsx
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useActivePei } from "../../features/educateur/hooks";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";

type Props = NativeStackScreenProps<EducatorStackParamList, "ChildPei">;

const formatDate = (value?: string) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
};

export const ChildPeiScreen: React.FC<Props> = ({ route, navigation }) => {
  const { childId, childName } = route.params;
  const { pei, loading, error } = useActivePei(childId);

  const handleViewEvaluations = () => {
    if (!pei) return;
    navigation.navigate("PeiEvaluations", {
      peiId: pei.id,
      childName,
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!pei) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Aucun PEI actif pour cet enfant.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.label}>Titre</Text>
        <Text style={styles.value}>{pei.titre}</Text>

        <Text style={styles.label}>Statut</Text>
        <Text style={styles.value}>{pei.statut}</Text>

        <Text style={styles.label}>Date de début</Text>
        <Text style={styles.value}>{formatDate(pei.date_debut)}</Text>

        {pei.date_fin_prevue ? (
          <>
            <Text style={styles.label}>Date de fin prévue</Text>
            <Text style={styles.value}>{formatDate(pei.date_fin_prevue)}</Text>
          </>
        ) : null}

        {pei.objectifs_resume ? (
          <>
            <Text style={styles.label}>Objectifs principaux</Text>
            <Text style={styles.value}>{pei.objectifs_resume}</Text>
          </>
        ) : null}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleViewEvaluations}>
        <Text style={styles.buttonText}>Voir les évaluations</Text>
      </TouchableOpacity>
    </ScrollView>
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
    textAlign: "center",
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: "#777",
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#2a7bf6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
