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

const PRIMARY = "#2563EB";

type Props = NativeStackScreenProps<EducatorStackParamList, "ChildPei">;

const formatDate = (value?: string) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("ar-TN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const ChildPeiScreen: React.FC<Props> = ({ route, navigation }) => {
  const { childId, childName } = route.params;
  const { pei, loading, error } = useActivePei(childId);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={PRIMARY} />
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
        <Text style={styles.emptyText}>لا توجد خطة تربوية فردية نشطة لهذا الطفل.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.screenTitle}>الخطة التربوية الفردية</Text>
      <Text style={styles.screenSubtitle}>{childName}</Text>
      <View style={styles.card}>
        <Text style={styles.label}>عنوان الخطة</Text>
        <Text style={styles.value}>{pei.titre}</Text>

        <Text style={styles.label}>الحالة</Text>
        <Text style={styles.value}>{pei.statut === "ACTIF" ? "نشطة" : "مغلقة"}</Text>

        <Text style={styles.label}>تاريخ البداية</Text>
        <Text style={styles.value}>{formatDate(pei.date_debut)}</Text>

        {pei.date_fin_prevue ? (
          <>
            <Text style={styles.label}>تاريخ النهاية المتوقعة</Text>
            <Text style={styles.value}>{formatDate(pei.date_fin_prevue)}</Text>
          </>
        ) : null}

        {pei.objectifs_resume ? (
          <>
            <Text style={styles.label}>الأهداف الرئيسية</Text>
            <Text style={styles.value}>{pei.objectifs_resume}</Text>
          </>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("PeiEvaluations", {
            peiId: pei.id,
            childName,
          })
        }
      >
        <Text style={styles.buttonText}>عرض التقييمات</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F7F7FA",
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 12,
    textAlign: "right",
  },
  value: {
    fontSize: 17,
    color: "#111827",
    marginTop: 4,
    textAlign: "right",
    fontWeight: "600",
  },
  button: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F7F7FA",
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
    fontSize: 16,
    textAlign: "center",
  },
});
