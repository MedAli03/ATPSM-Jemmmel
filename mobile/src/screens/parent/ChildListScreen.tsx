// src/screens/parent/ChildListScreen.tsx
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { useMyChildren } from "../../features/parent/hooks";
import { Child } from "../../features/parent/types";
import { useAuth } from "../../features/auth/AuthContext";

type Props = NativeStackScreenProps<ParentStackParamList, "ChildList">;

const formatDate = (isoDate?: string) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  return date.toLocaleDateString();
};

const renderChildItem = (
  child: Child,
  onPress: (child: Child) => void,
): JSX.Element => {
  return (
    <TouchableOpacity
      style={styles.childCard}
      onPress={() => onPress(child)}
      activeOpacity={0.7}
    >
      <Text style={styles.childName}>
        {child.prenom} {child.nom}
      </Text>
      <Text style={styles.childDetail}>Né(e) le {formatDate(child.date_naissance)}</Text>
      {child.diagnostic ? (
        <Text style={styles.childDiagnostic}>{child.diagnostic}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

export const ChildListScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { data: children, loading, error, refetch } = useMyChildren();

  const handleSelectChild = (child: Child) => {
    navigation.navigate("ChildDetail", {
      childId: child.id,
      childName: `${child.prenom} ${child.nom}`,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mes enfants</Text>
          <Text style={styles.subtitle}>Connecté en tant que {user?.prenom}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={children}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderChildItem(item, handleSelectChild)}
          contentContainerStyle={
            children.length === 0 ? styles.emptyContent : styles.listContent
          }
          ListEmptyComponent={() => (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>Aucun enfant associé à ce compte.</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refetch} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
  },
  subtitle: {
    color: "#666",
    marginTop: 4,
  },
  logout: {
    color: "#d9534f",
    fontWeight: "600",
  },
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
  emptyContent: {
    flexGrow: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  childCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  childName: {
    fontSize: 18,
    fontWeight: "600",
  },
  childDetail: {
    marginTop: 6,
    color: "#555",
  },
  childDiagnostic: {
    marginTop: 6,
    fontStyle: "italic",
    color: "#888",
  },
});
