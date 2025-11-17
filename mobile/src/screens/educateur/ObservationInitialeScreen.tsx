import React, { useEffect, useMemo, useState } from "react";
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
import {
  createObservationInitiale,
  getLatestObservationInitiale,
  ObservationInitialeDto,
  updateObservationInitiale,
} from "../../features/educateur/api";

type Route = RouteProp<EducatorStackParamList, "ObservationInitiale">;
type Nav = NativeStackNavigationProp<EducatorStackParamList>;

type ObservationFormState = {
  date: string;
  context: string;
  communication: string;
  social: string;
  behavior: string;
  interests: string;
  sensory: string;
  strengths: string;
  needs: string;
};

const emptyForm: ObservationFormState = {
  date: "",
  context: "",
  communication: "",
  social: "",
  behavior: "",
  interests: "",
  sensory: "",
  strengths: "",
  needs: "",
};

const serializeContenu = (fields: ObservationFormState): string =>
  JSON.stringify({ version: 1, ...fields });

const parseContenu = (value: string | null | undefined): Partial<ObservationFormState> => {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      const { date, ...rest } = parsed as Record<string, unknown>;
      const normalized: Partial<ObservationFormState> = {};
      Object.entries(rest).forEach(([key, val]) => {
        if (typeof val === "string" && key in emptyForm) {
          normalized[key as keyof ObservationFormState] = val;
        }
      });
      if (typeof date === "string") {
        normalized.date = date;
      }
      return normalized;
    }
  } catch (error) {
    // Fallback: legacy plain text stored in contenu
    return { needs: value };
  }

  return {};
};

export const ObservationInitialeScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { childId } = params;

  const [form, setForm] = useState<ObservationFormState>(() => ({
    ...emptyForm,
    date: new Date().toISOString().slice(0, 10),
  }));
  const [observation, setObservation] = useState<ObservationInitialeDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const updateField = (key: keyof ObservationFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let isMounted = true;

    const loadObservation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const latest = await getLatestObservationInitiale(childId);
        if (!isMounted) return;

        if (latest) {
          const parsed = parseContenu(latest.contenu);
          setObservation(latest);
          setForm((prev) => ({
            ...prev,
            ...parsed,
            date:
              parsed.date ||
              latest.date_observation?.slice(0, 10) ||
              prev.date,
          }));
        }
      } catch (err) {
        console.error("Failed to load observation_initiale", err);
        if (isMounted) {
          setError("تعذّر تحميل الملاحظة الأوّلية. جرّب مجددًا.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadObservation();

    return () => {
      isMounted = false;
    };
  }, [childId]);

  const hasValidationErrors = useMemo(() => {
    const date = form.date.trim();
    const needs = form.needs.trim();
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    return !datePattern.test(date) || needs.length < 10;
  }, [form.date, form.needs]);

  const validateForm = () => {
    const date = form.date.trim();
    const needs = form.needs.trim();
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(date)) {
      return "صيغة التاريخ يجب أن تكون على شكل YYYY-MM-DD.";
    }

    if (needs.length < 10) {
      return "وصف الاحتياجات يجب أن يحتوي على 10 أحرف على الأقل.";
    }

    return null;
  };

  const handleSave = async () => {
    const validationMessage = validateForm();
    if (validationMessage) {
      setValidationError(validationMessage);
      Alert.alert("تنبيه", validationMessage);
      return;
    }

    setValidationError(null);

    setIsSaving(true);

    const dto = {
      enfant_id: childId,
      date_observation: form.date,
      contenu: serializeContenu(form),
    };

    try {
      let next: ObservationInitialeDto;
      if (observation) {
        next = await updateObservationInitiale(observation.id, {
          date_observation: dto.date_observation,
          contenu: dto.contenu,
        });
      } else {
        next = await createObservationInitiale(dto);
      }

      setObservation(next);
      Alert.alert("تمّ الحفظ", "تمّ حفظ الملاحظة الأولية بنجاح.", [
        {
          text: "حسنًا",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error("Failed to save observation_initiale", err);
      const message = err instanceof Error ? err.message : "تعذّر حفظ الملاحظة. الرجاء المحاولة من جديد.";
      setValidationError(message);
      Alert.alert("خطأ", message);
    } finally {
      setIsSaving(false);
    }
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
          {isLoading && (
            <Text style={styles.loadingText}>جارٍ تحميل الملاحظة السابقة...</Text>
          )}
          {error && !isLoading && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          <Text style={styles.helper}>
            هذه الملاحظة تساعد في بناء الـ PEI الأولي (Projet Éducatif
            Individuel) وتحديد نقاط القوة والاحتياجات.
          </Text>
        </View>
        {validationError ? (
          <View style={styles.validationBox}>
            <Text style={styles.validationText}>{validationError}</Text>
          </View>
        ) : null}

        {/* DATE + CONTEXT */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>المعطيات العامة</Text>

          <Text style={styles.label}>تاريخ الملاحظة (اختياري)</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: 2025-11-17"
            value={form.date}
            onChangeText={(text) => updateField("date", text)}
          />

          <Text style={styles.label}>السياق</Text>
          <TextInput
            style={styles.textArea}
            placeholder="مثال: حصة فردية / حصة جماعية / وقت الاستراحة..."
            multiline
            value={form.context}
            onChangeText={(text) => updateField("context", text)}
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
            value={form.communication}
            onChangeText={(text) => updateField("communication", text)}
          />

          <Text style={styles.label}>
            التفاعل الاجتماعي (Interaction sociale)
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="استجابة الطفل للآخرين، اللعب مع الزملاء، الاتصال البصري..."
            multiline
            value={form.social}
            onChangeText={(text) => updateField("social", text)}
          />

          <Text style={styles.label}>السلوك (Comportement)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="سلوكيات متكرّرة، نوبات غضب، صعوبات في الانتقال بين الأنشطة..."
            multiline
            value={form.behavior}
            onChangeText={(text) => updateField("behavior", text)}
          />

          <Text style={styles.label}>الاهتمامات (Centres d’intérêt)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="أنشطة/أشياء يحبّها الطفل، تركيز خاص على موضوع معيّن..."
            multiline
            value={form.interests}
            onChangeText={(text) => updateField("interests", text)}
          />

          <Text style={styles.label}>الحسّيّات (Profil sensoriel)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="حساسية للصوت/الضوء، بحث عن حركة، لمس الأشياء باستمرار..."
            multiline
            value={form.sensory}
            onChangeText={(text) => updateField("sensory", text)}
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
            value={form.strengths}
            onChangeText={(text) => updateField("strengths", text)}
          />

          <Text style={styles.label}>الاحتياجات والأولويات التربوية *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="ما هي أهمّ الاحتياجات التي يجب أخذها بعين الاعتبار في الـ PEI؟"
            multiline
            value={form.needs}
            onChangeText={(text) => updateField("needs", text)}
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
            style={[styles.actionBtn, styles.saveBtn, hasValidationErrors && styles.disabledBtn]}
            onPress={handleSave}
            disabled={isSaving || hasValidationErrors}
          >
            <Text style={styles.saveText}>
              {isSaving ? "جارٍ الحفظ..." : "حفظ الملاحظة"}
            </Text>
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
  validationBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  validationText: {
    color: "#B91C1C",
    textAlign: "center",
    fontSize: 13,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  childIdText: { fontSize: 13, color: "#4B5563", marginTop: 4 },
  helper: { fontSize: 12, color: "#4B5563", marginTop: 6 },
  loadingText: {
    color: "#6B7280",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },

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
  disabledBtn: {
    opacity: 0.65,
  },
  cancelText: { fontSize: 14, fontWeight: "600", color: "#111827" },
  saveText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
});
