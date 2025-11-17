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

const PRIMARY = "#2563EB";
const ACCENT = "#F97316";

const formatDate = (isoDate?: string) => {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("ar-TN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

type Props = NativeStackScreenProps<ParentStackParamList, "ChildList">;

export const ChildListScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { data: children = [], loading, error, refetch } = useMyChildren();

  const handleSelectChild = (child: Child) => {
    navigation.navigate("ChildDetail", {
      childId: child.id,
      childName: `${child.prenom} ${child.nom}`,
    });
  };

  const renderChildItem = ({ item }: { item: Child }) => (
    <TouchableOpacity
      style={styles.childCard}
      onPress={() => handleSelectChild(item)}
      activeOpacity={0.8}
    >
      <Text style={styles.childName}>
        {item.prenom} {item.nom}
      </Text>
      {item.date_naissance ? (
        <Text style={styles.childMeta}>
          تاريخ الميلاد: {formatDate(item.date_naissance)}
        </Text>
      ) : null}
      {item.diagnostic ? (
        <Text style={styles.childDiagnostic}>{item.diagnostic}</Text>
      ) : null}
      <Text style={styles.childHint}>اضغط لعرض تفاصيل الطفل</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>أطفالي</Text>
          <Text style={styles.subtitle}>مرحباً {user?.prenom}, يمكنك متابعة أطفالك هنا.</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>

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
          renderItem={renderChildItem}
          contentContainerStyle={
            children.length === 0 ? styles.emptyContent : styles.listContent
          }
          ListEmptyComponent={() => (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                لا يوجد أطفال مرتبطون بحسابك حالياً.
              </Text>
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
    direction: "rtl",
    writingDirection: "rtl",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#F7F7FA",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    marginTop: 6,
    textAlign: "right",
  },
  logoutButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  logoutText: {
    color: "#B91C1C",
    fontWeight: "600",
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  childCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  childName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },
  childMeta: {
    fontSize: 15,
    color: "#4B5563",
    marginTop: 8,
    textAlign: "right",
  },
  childDiagnostic: {
    fontSize: 15,
    color: ACCENT,
    marginTop: 6,
    textAlign: "right",
  },
  childHint: {
    marginTop: 12,
    fontSize: 14,
    color: PRIMARY,
    textAlign: "right",
    fontWeight: "500",
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
