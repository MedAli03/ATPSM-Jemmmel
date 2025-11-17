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

const PRIMARY = "#2563EB";

type Props = NativeStackScreenProps<EducatorStackParamList, "GroupList">;

export const GroupListScreen: React.FC<Props> = ({ navigation }) => {
  const { groups = [], loading, error, refetch } = useMyGroups();

  const handleSelectGroup = (group: Group) => {
    navigation.navigate("GroupChildren", {
      groupId: group.id,
      groupName: group.nom,
    });
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelectGroup(item)}
      activeOpacity={0.85}
    >
      <Text style={styles.cardTitle}>{item.nom}</Text>
      <Text style={styles.cardSubtitle}>السنة الدراسية: {item.annee_scolaire}</Text>
      {item.description ? (
        <Text style={styles.cardDescription}>وصف المجموعة: {item.description}</Text>
      ) : null}
      <Text style={styles.cardHint}>اضغط لعرض أطفال المجموعة</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>مجموعاتي</Text>
      {loading && groups.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={PRIMARY} />
        </View>
      ) : error && groups.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGroupItem}
          contentContainerStyle={
            groups.length === 0 ? styles.emptyContent : styles.listContent
          }
          ListEmptyComponent={() => (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>لا توجد مجموعات مخصصة لك حالياً.</Text>
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
    backgroundColor: "#F7F7FA",
    padding: 16,
    direction: "rtl",
    writingDirection: "rtl",
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    textAlign: "right",
  },
  listContent: {
    paddingBottom: 20,
    gap: 12,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },
  cardSubtitle: {
    fontSize: 15,
    color: "#4B5563",
    marginTop: 8,
    textAlign: "right",
  },
  cardDescription: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "right",
    lineHeight: 22,
  },
  cardHint: {
    marginTop: 12,
    color: PRIMARY,
    fontWeight: "600",
    textAlign: "right",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 16,
    textAlign: "center",
  },
});
