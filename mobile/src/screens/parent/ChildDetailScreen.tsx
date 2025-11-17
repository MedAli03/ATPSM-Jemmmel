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

const PRIMARY = "#2563EB";

const formatDate = (isoDate?: string) => {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("ar-TN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

type Props = NativeStackScreenProps<ParentStackParamList, "ChildDetail">;

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
        <ActivityIndicator color={PRIMARY} />
      </View>
    );
  }

  if (error || !child) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "تعذر تحميل بيانات الطفل."}</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <Text style={styles.retryText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatarWrapper}>
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
        <Text style={styles.childName}>
          {child.prenom} {child.nom}
        </Text>
        <Text style={styles.childRole}>معلومات الطفل</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>الاسم الكامل</Text>
        <Text style={styles.value}>
          {child.prenom} {child.nom}
        </Text>

        <Text style={styles.label}>تاريخ الميلاد</Text>
        <Text style={styles.value}>{formatDate(child.date_naissance)}</Text>

        {child.diagnostic ? (
          <>
            <Text style={styles.label}>التشخيص</Text>
            <Text style={styles.value}>{child.diagnostic}</Text>
          </>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.timelineButton}
        onPress={() =>
          navigation.navigate("ChildTimeline", {
            childId: child.id,
            childName: `${child.prenom} ${child.nom}`,
          })
        }
      >
        <Text style={styles.timelineText}>عرض المتابعة اليومية</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F7F7FA",
    direction: "rtl",
    writingDirection: "rtl",
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
  errorText: {
    color: "#DC2626",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderInitials: {
    fontSize: 32,
    fontWeight: "700",
    color: "#6B7280",
  },
  childName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
    textAlign: "center",
  },
  childRole: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  infoCard: {
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
  timelineButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 24,
    alignItems: "center",
  },
  timelineText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
