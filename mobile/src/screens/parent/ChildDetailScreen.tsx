// src/screens/parent/ChildDetailScreen.tsx
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { useChildDetail } from "../../features/parent/hooks";

type Props = NativeStackScreenProps<ParentStackParamList, "ChildDetail">;

const formatDate = (isoDate?: string) => {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString();
};

export const ChildDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { childId, childName } = route.params;
  const { data: child, loading, error, refetch } = useChildDetail(childId);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: child?.prenom && child?.nom ? `${child.prenom} ${child.nom}` : childName,
    });
  }, [child, childName, navigation]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !child) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Impossible de charger le profil."}</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {child.photo_url ? (
        <Image source={{ uri: child.photo_url }} style={styles.avatar} />
      ) : (
        <View style={styles.placeholderAvatar}>
          <Text style={styles.placeholderInitials}>
            {child.prenom.charAt(0)}
            {child.nom.charAt(0)}
          </Text>
        </View>
      )}
      <Text style={styles.name}>
        {child.prenom} {child.nom}
      </Text>
      <Text style={styles.label}>Date de naissance</Text>
      <Text style={styles.value}>{formatDate(child.date_naissance)}</Text>
      {child.diagnostic ? (
        <>
          <Text style={styles.label}>Diagnostic</Text>
          <Text style={styles.value}>{child.diagnostic}</Text>
        </>
      ) : null}
      <TouchableOpacity
        style={styles.timelineButton}
        onPress={() =>
          navigation.navigate("ChildTimeline", {
            childId: child.id,
            childName: `${child.prenom} ${child.nom}`,
          })
        }
      >
        <Text style={styles.timelineText}>Voir le suivi</Text>
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
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#007bff",
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  placeholderAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e0e0",
  },
  placeholderInitials: {
    fontSize: 32,
    fontWeight: "700",
    color: "#666",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  label: {
    alignSelf: "flex-start",
    color: "#666",
    marginTop: 12,
  },
  value: {
    alignSelf: "flex-start",
    fontSize: 16,
    marginTop: 4,
  },
  timelineButton: {
    marginTop: 24,
    alignSelf: "stretch",
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    borderRadius: 10,
  },
  timelineText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
