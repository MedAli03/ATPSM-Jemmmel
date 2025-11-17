import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";

type Route = RouteProp<EducatorStackParamList, "ObservationInitiale">;
type Nav = NativeStackNavigationProp<EducatorStackParamList>;

export const ObservationInitialeScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { childId } = params;

  // you can pre-fill later from API if observation exists
  const [date, setDate] = useState<string>("");
  const [context, setContext] = useState<string>(""); // contexte de l’observation
  const [communication, setCommunication] = useState<string>("");
  const [social, setSocial] = useState<string>("");
  const [behavior, setBehavior] = useState<string>("");
  const [interests, setInterests] = useState<string>("");
  const [sensory, setSensory] = useState<string>("");
  const [strengths, setStrengths] = useState<string>("");
  const [needs, setNeeds] = useState<string>("");

  const handleSave = async () => {
    // simple validation
    if (!needs.trim()) {
      Alert.alert("تنبيه", "الرجاء تحديد أهم الاحتياجات التربوية.");
      return;
    }

    const payload = {
      childId,
      date: date || null,
      context,
      communication,
      social,
      behavior,
      interests,
      sensory,
      strengths,
      needs,
    };

    // TODO: POST or PUT /enfants/:id/observation-initiale
    console.log("Saving observation_initiale", payload);

    Alert.alert("تمّ الحفظ", "تمّ حفظ الملاحظة الأولية بنجاح.", [
      {
        text: "حسنًا",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.headerCard}>
          <Text style={styles.title}>الملاحظة الأوّلية للطفل</Text>
          <Text style={styles.childIdText}>ID الطفل: {childId}</Text>
          <Text style={styles.helper}>
            هذه الملاحظة تساعد في بناء الـ PEI الأولي (Projet Éducatif
            Individuel) وتحديد نقاط القوة والاحتياجات.
          </Text>
        </View>

        {/* DATE + CONTEXT */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>المعطيات العامة</Text>

          <Text style={styles.label}>تاريخ الملاحظة (اختياري)</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: 2025-11-17"
            value={date}
            onChangeText={setDate}
          />

          <Text style={styles.label}>السياق</Text>
          <TextInput
            style={styles.textArea}
            placeholder="مثال: حصة فردية / حصة جماعية / وقت الاستراحة..."
            multiline
            value={context}
            onChangeText={setContext}
          />
        </View>

        {/* DOMAINS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ملاحظة المجالات الأساسية</Text>

          <Text style={styles.label}>التواصل (Communication)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="كيفية تواصل الطفل؟ (لغة، إيماءات، صور، تجنّب التواصل...)"
            multiline
            value={communication}
            onChangeText={setCommunication}
          />

          <Text style={styles.label}>
            التفاعل الاجتماعي (Interaction sociale)
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="استجابة الطفل للآخرين، اللعب مع الزملاء، الاتصال البصري..."
            multiline
            value={social}
            onChangeText={setSocial}
          />

          <Text style={styles.label}>السلوك (Comportement)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="سلوكيات متكرّرة، نوبات غضب، صعوبات في الانتقال بين الأنشطة..."
            multiline
            value={behavior}
            onChangeText={setBehavior}
          />

          <Text style={styles.label}>الاهتمامات (Centres d’intérêt)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="أنشطة/أشياء يحبّها الطفل، تركيز خاص على موضوع معيّن..."
            multiline
            value={interests}
            onChangeText={setInterests}
          />

          <Text style={styles.label}>الحسّيّات (Profil sensoriel)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="حساسية للصوت/الضوء، بحث عن حركة، لمس الأشياء باستمرار..."
            multiline
            value={sensory}
            onChangeText={setSensory}
          />
        </View>

        {/* SYNTHESIS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>تركيب تربوي</Text>

          <Text style={styles.label}>نقاط القوّة عند الطفل</Text>
          <TextInput
            style={styles.textArea}
            placeholder="ما الذي ينجح الطفل في فعله؟ ما هي قدراته الحالية؟"
            multiline
            value={strengths}
            onChangeText={setStrengths}
          />

          <Text style={styles.label}>الاحتياجات والأولويات التربوية *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="ما هي أهمّ الاحتياجات التي يجب أخذها بعين الاعتبار في الـ PEI؟"
            multiline
            value={needs}
            onChangeText={setNeeds}
          />
          <Text style={styles.requiredHint}>
            * هذا الحقل ضروري لأنه يؤثّر مباشرة في أهداف الـ PEI.
          </Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>إلغاء</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.saveBtn]}
            onPress={handleSave}
          >
            <Text style={styles.saveText}>حفظ الملاحظة</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3F4F6" },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },

  headerCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  childIdText: { fontSize: 13, color: "#4B5563", marginTop: 4 },
  helper: { fontSize: 12, color: "#4B5563", marginTop: 6 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  label: { fontSize: 13, fontWeight: "500", color: "#4B5563", marginTop: 8 },
  input: {
    marginTop: 4,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  textArea: {
    marginTop: 4,
    minHeight: 80,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlignVertical: "top",
    fontSize: 14,
  },
  requiredHint: {
    fontSize: 11,
    color: "#F97316",
    marginTop: 4,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#E5E7EB",
  },
  saveBtn: {
    backgroundColor: "#2563EB",
  },
  cancelText: { fontSize: 14, fontWeight: "600", color: "#111827" },
  saveText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
});
