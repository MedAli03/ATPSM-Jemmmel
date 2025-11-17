import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ParentStackParamList } from "../../navigation/ParentNavigator";

type ChildDetailsRoute = RouteProp<ParentStackParamList, "ChildDetails">;

export const ChildDetailsScreen: React.FC = () => {
  const { params } = useRoute<ChildDetailsRoute>();
  const { childId } = params;

  // TODO: fetch dossier enfant via API (childId)
  const child = {
    id: childId,
    firstName: "Ahmed",
    lastName: "Ben Ali",
    birthDate: "2017-04-10",
    group: "مجموعة الألوان",
    educator: "أ. مريم",
    diagnosis: "TSA - niveau 2",
    allergies: "لا يوجد",
    needs: "Besoin de structure visuelle, routines stables.",
    parents: {
      fatherName: "Ali Ben Ali",
      motherName: "Fatma Trabelsi",
      phone: "+216 55 555 555",
      address: "Jemmel, Monastir",
    },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>ملف الطفل</Text>
        <Text style={styles.name}>
          {child.firstName} {child.lastName}
        </Text>
        <Text style={styles.label}>تاريخ الميلاد:</Text>
        <Text style={styles.value}>{child.birthDate}</Text>

        <Text style={styles.label}>المجموعة / السنة:</Text>
        <Text style={styles.value}>{child.group}</Text>

        <Text style={styles.label}>المربية / éducateur référent:</Text>
        <Text style={styles.value}>{child.educator}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>المعلومات الطبية - التربوية</Text>
        <Text style={styles.label}>التشخيص:</Text>
        <Text style={styles.value}>{child.diagnosis}</Text>

        <Text style={styles.label}>الحساسيّات:</Text>
        <Text style={styles.value}>{child.allergies}</Text>

        <Text style={styles.label}>الاحتياجات الخاصّة:</Text>
        <Text style={styles.value}>{child.needs}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>معلومات الأولياء</Text>
        <Text style={styles.label}>الأب:</Text>
        <Text style={styles.value}>{child.parents.fatherName}</Text>

        <Text style={styles.label}>الأم:</Text>
        <Text style={styles.value}>{child.parents.motherName}</Text>

        <Text style={styles.label}>الهاتف:</Text>
        <Text style={styles.value}>{child.parents.phone}</Text>

        <Text style={styles.label}>العنوان:</Text>
        <Text style={styles.value}>{child.parents.address}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#111827" },
  name: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#1F2937" },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#111827" },
  label: { fontSize: 13, fontWeight: "500", marginTop: 6, color: "#6B7280" },
  value: { fontSize: 14, color: "#111827", marginTop: 2 },
});
