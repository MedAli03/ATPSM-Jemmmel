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

const PRIMARY = "#2563EB";

type Props = NativeStackScreenProps<EducatorStackParamList, "GroupChildren">;

const formatDate = (value?: string) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("ar-TN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const GroupChildrenScreen: React.FC<Props> = ({ route, navigation }) => {
  const { groupId, groupName } = route.params;
  const { children = [], loading, error, refetch } = useGroupChildren(groupId);

  const handleSelectChild = (child: ChildSummary) => {
    navigation.navigate("ChildPei", {
      childId: child.id,
      childName: `${child.prenom} ${child.nom}`,
    });
  };

  const renderItem = ({ item }: { item: ChildSummary }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelectChild(item)}
      activeOpacity={0.85}
    >
      <Text style={styles.cardTitle}>
        {item.prenom} {item.nom}
      </Text>
      {item.date_naissance ? (
        <Text style={styles.cardSubtitle}>
          تاريخ الميلاد: {formatDate(item.date_naissance)}
        </Text>
      ) : null}
      <Text style={styles.cardHint}>اضغط لعرض الخطة التربوية</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>أطفال المجموعة</Text>
      <Text style={styles.screenSubtitle}>{groupName}</Text>
      {loading && children.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={PRIMARY} />
        </View>
      ) : error && children.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={children}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={
            children.length === 0 ? styles.emptyContent : styles.listContent
          }
          ListEmptyComponent={() => (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>لا يوجد أطفال في هذه المجموعة.</Text>
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
    textAlign: "right",
  },
  screenSubtitle: {
    fontSize: 16,
    color: "#4B5563",
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
