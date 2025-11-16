// src/screens/educateur/GroupChildrenScreen.tsx
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
import { useGroupChildren } from "../../features/educateur/hooks";
import { ChildSummary } from "../../features/educateur/types";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";

type Props = NativeStackScreenProps<EducatorStackParamList, "GroupChildren">;

const renderChildItem = (
  child: ChildSummary,
  onPress: (child: ChildSummary) => void,
): JSX.Element => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(child)}>
    <Text style={styles.cardTitle}>{child.prenom} {child.nom}</Text>
    {child.date_naissance ? (
      <Text style={styles.cardSubtitle}>
        Né(e) le {new Date(child.date_naissance).toLocaleDateString()}
      </Text>
    ) : null}
  </TouchableOpacity>
);

export const GroupChildrenScreen: React.FC<Props> = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { children, loading, error, refetch } = useGroupChildren(groupId);

  const handleSelectChild = (child: ChildSummary) => {
    navigation.navigate("ChildPei", {
      childId: child.id,
      childName: `${child.prenom} ${child.nom}`,
    });
  };

  return (
    <View style={styles.container}>
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
              <Text style={styles.emptyText}>Aucun enfant dans ce groupe.</Text>
            </View>
          )}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardSubtitle: {
    marginTop: 4,
    color: "#666",
  },
});
