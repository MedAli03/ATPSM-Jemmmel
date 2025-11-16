// src/screens/educateur/GroupListScreen.tsx
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
import { useMyGroups } from "../../features/educateur/hooks";
import { Group } from "../../features/educateur/types";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";

type Props = NativeStackScreenProps<EducatorStackParamList, "GroupList">;

const renderGroupItem = (
  group: Group,
  onPress: (group: Group) => void,
): JSX.Element => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(group)}>
    <Text style={styles.cardTitle}>{group.nom}</Text>
    <Text style={styles.cardSubtitle}>{group.annee_scolaire}</Text>
    {group.description ? (
      <Text style={styles.cardDescription}>{group.description}</Text>
    ) : null}
  </TouchableOpacity>
);

export const GroupListScreen: React.FC<Props> = ({ navigation }) => {
  const { groups, loading, error, refetch } = useMyGroups();

  const handleSelectGroup = (group: Group) => {
    navigation.navigate("GroupChildren", {
      groupId: group.id,
      groupName: group.nom,
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
          data={groups}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderGroupItem(item, handleSelectGroup)}
          contentContainerStyle={
            groups.length === 0 ? styles.emptyContent : styles.listContent
          }
          ListEmptyComponent={() => (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>Aucun groupe assigné.</Text>
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
  cardDescription: {
    marginTop: 8,
    color: "#444",
  },
});
