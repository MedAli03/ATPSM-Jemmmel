// src/screens/parent/ChildListScreen.tsx
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

const STATIC_CHILDREN = [
  {
    id: 1,
    name: "محمد أمين",
    group: "مجموعة أ",
    birthDate: "2018-04-12",
    lastNote: "شارك اليوم في نشاط التلوين وكان متجاوباً بشكل جميل.",
  },
  {
    id: 2,
    name: "سارة",
    group: "مجموعة ب",
    birthDate: "2019-09-03",
    lastNote: "استمتعت بلعبة التركيب وأظهرت تركيزاً جيداً.",
  },
  {
    id: 3,
    name: "آدم",
    group: "مجموعة ج",
    birthDate: "2017-12-25",
    lastNote: "تفاعل مع قصة مصورة وشارك في الإجابة عن الأسئلة.",
  },
];

export const ChildListScreen: React.FC = () => {
  const handleChildPress = (childName: string) => {
    // plus tard : navigation vers ChildDetailScreen
    Alert.alert(
      "قريباً",
      `سيتم قريباً عرض تفاصيل الطفل: ${childName} في شاشة مخصصة.`
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>أطفالي</Text>
          <Text style={styles.subtitle}>
            هذه قائمة تقريبية لأطفالك. لاحقاً سيتم جلب هذه البيانات من الخادم
            وربطها مباشرة بحسابك في الجمعية.
          </Text>
        </View>

        {/* List of children (static) */}
        {STATIC_CHILDREN.map((child) => (
          <TouchableOpacity
            key={child.id}
            activeOpacity={0.9}
            style={styles.childCard}
            onPress={() => handleChildPress(child.name)}
          >
            <View style={styles.childHeaderRow}>
              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.childGroup}>{child.group}</Text>
            </View>

            <Text style={styles.childMeta}>
              تاريخ الميلاد: {child.birthDate}
            </Text>

            <Text style={styles.childNoteLabel}>آخر ملاحظة</Text>
            <Text style={styles.childNote} numberOfLines={2}>
              {child.lastNote}
            </Text>

            <View style={styles.childFooter}>
              <Text style={styles.childFooterText}>
                اضغط لعرض تفاصيل الطفل (قريباً)
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    writingDirection: "rtl", // RTL global
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748B",
    textAlign: "right",
    lineHeight: 20,
  },
  childCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  childHeaderRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  childName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
  },
  childGroup: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },
  childMeta: {
    fontSize: 13,
    color: "#475569",
    textAlign: "right",
    marginBottom: 6,
  },
  childNoteLabel: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "right",
    marginBottom: 2,
  },
  childNote: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "right",
    lineHeight: 20,
  },
  childFooter: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  childFooterText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },
});
