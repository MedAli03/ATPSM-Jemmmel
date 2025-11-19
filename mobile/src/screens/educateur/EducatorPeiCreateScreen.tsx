import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { EducatorStackParamList } from "../../navigation/EducatorNavigator";
import { useAuth } from "../../features/auth/AuthContext";
import { createPEI, getActiveSchoolYear } from "../../features/educateur/api";
import { showErrorMessage, showSuccessMessage } from "../../utils/feedback";
import { validateStringFields } from "../../utils/validation";

type Route = RouteProp<EducatorStackParamList, "EducatorPeiCreate">;
type Nav = NativeStackNavigationProp<EducatorStackParamList, "EducatorPeiCreate">;

export const EducatorPeiCreateScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { childId, anneeId: initialAnneeId } = params;
  const { user } = useAuth();

  const [objectifGeneral, setObjectifGeneral] = useState("");
  const [priorites, setPriorites] = useState("");
  const [axes, setAxes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    goal?: string;
    priorities?: string;
    axes?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [anneeId, setAnneeId] = useState<number | null>(initialAnneeId ?? null);
  const [yearLoading, setYearLoading] = useState(!initialAnneeId);

  useEffect(() => {
    if (initialAnneeId) {
      return;
    }
    let isMounted = true;
    const loadYear = async () => {
      setYearLoading(true);
      try {
        const year = await getActiveSchoolYear();
        if (isMounted) {
          setAnneeId(year.id);
          setFormError(null);
        }
      } catch (error) {
        console.error("Failed to load active school year", error);
        if (isMounted) {
          setFormError("تعذّر تحديد السنة الدراسية الحالية.");
        }
      } finally {
        if (isMounted) {
          setYearLoading(false);
        }
      }
    };

    loadYear();
    return () => {
      isMounted = false;
    };
  }, [initialAnneeId]);

  const objectifsPayload = useMemo(() => {
    const sections: string[] = [];
    const goalText = objectifGeneral.trim();
    const prioritiesText = priorites.trim();
    const axesText = axes.trim();

    if (goalText) {
      sections.push(`الأهداف العامة:\n${goalText}`);
    }
    if (prioritiesText) {
      sections.push(`الأولويات:\n${prioritiesText}`);
    }
    if (axesText) {
      sections.push(`محاور العمل:\n${axesText}`);
    }
    return sections.join("\n\n");
  }, [objectifGeneral, priorites, axes]);

  const validateForm = () => {
    const errors = validateStringFields([
      {
        key: "goal" as const,
        value: objectifGeneral,
        required: true,
        minLength: 10,
        messages: {
          required: "هذا الحقل إجباري",
          minLength: "يرجى تقديم هدف عام مفصل (10 أحرف على الأقل).",
        },
      },
      {
        key: "priorities" as const,
        value: priorites,
        minLength: 5,
        messages: {
          minLength: "الرجاء توضيح الأولويات بمزيد من التفصيل.",
        },
      },
      {
        key: "axes" as const,
        value: axes,
        minLength: 5,
        messages: {
          minLength: "الرجاء وصف محاور العمل بمزيد من التفاصيل.",
        },
      },
    ]);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      showErrorMessage("يرجى تصحيح الحقول المحددة.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }
    if (!user) {
      showErrorMessage("يجب تسجيل الدخول كمربٍّ لإنشاء الـ PEI.");
      return;
    }
    if (!anneeId) {
      showErrorMessage("لا يمكن إنشاء الـ PEI بدون سنة دراسية نشطة.");
      return;
    }
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const newPei = await createPEI({
        enfant_id: childId,
        educateur_id: user.id,
        annee_id: anneeId,
        date_creation: new Date().toISOString(),
        objectifs: objectifsPayload,
      });
      showSuccessMessage("تم إرسال الـ PEI للمدير/الرئيس للمصادقة");
      navigation.replace("EducatorPeiDetail", { childId, peiId: newPei.id });
    } catch (error) {
      console.error("Failed to submit PEI", error);
      const fallback = "حدث خطأ أثناء إنشاء الـ PEI";
      const message =
        error instanceof Error && error.message ? error.message : fallback;
      setFormError(message);
      showErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderError = (message?: string) =>
    message ? <Text style={styles.errorText}>{message}</Text> : null;

  const isSubmitDisabled =
    submitting || yearLoading || !anneeId || !objectifGeneral.trim();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>إنشاء مشروع تربوي افرادي</Text>
      <Text style={styles.subtitle}>
        قدّم الأهداف العامة والأولويات ومحاور العمل التي ستُعرض على الإدارة
        للمصادقة.
      </Text>

      <View style={styles.fieldBlock}>
        <Text style={styles.label}>الهدف العام *</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={objectifGeneral}
          onChangeText={(text) => {
            setObjectifGeneral(text);
            if (fieldErrors.goal) {
              setFieldErrors((prev) => ({ ...prev, goal: undefined }));
            }
          }}
          multiline
          numberOfLines={4}
          placeholder="صف الهدف الرئيسي لهذا الـ PEI"
          placeholderTextColor="#9CA3AF"
          textAlignVertical="top"
        />
        {renderError(fieldErrors.goal)}
      </View>

      <View style={styles.fieldBlock}>
        <Text style={styles.label}>الأولويات التربوية</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={priorites}
          onChangeText={(text) => {
            setPriorites(text);
            if (fieldErrors.priorities) {
              setFieldErrors((prev) => ({ ...prev, priorities: undefined }));
            }
          }}
          multiline
          numberOfLines={4}
          placeholder="اذكر الأولويات أو مجالات التدخّل المستعجلة"
          placeholderTextColor="#9CA3AF"
          textAlignVertical="top"
        />
        {renderError(fieldErrors.priorities)}
      </View>

      <View style={styles.fieldBlock}>
        <Text style={styles.label}>محاور العمل</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={axes}
          onChangeText={(text) => {
            setAxes(text);
            if (fieldErrors.axes) {
              setFieldErrors((prev) => ({ ...prev, axes: undefined }));
            }
          }}
          multiline
          numberOfLines={4}
          placeholder="اقترح المحاور أو الأنشطة الرئيسية"
          placeholderTextColor="#9CA3AF"
          textAlignVertical="top"
        />
        {renderError(fieldErrors.axes)}
      </View>

      {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

      <TouchableOpacity
        style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitDisabled}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>إرسال الـ PEI للمصادقة</Text>
        )}
      </TouchableOpacity>

      {yearLoading ? (
        <View style={styles.helperRow}>
          <ActivityIndicator color="#2563EB" size="small" />
          <Text style={styles.helperText}>جارٍ التحقق من السنة الدراسية...</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "right",
  },
  subtitle: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 24,
    lineHeight: 22,
    textAlign: "right",
  },
  fieldBlock: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5F5",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#0F172A",
    textAlign: "right",
    backgroundColor: "#FFFFFF",
  },
  multilineInput: {
    minHeight: 120,
    lineHeight: 22,
  },
  errorText: {
    color: "#DC2626",
    marginTop: 6,
    textAlign: "right",
  },
  submitButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  helperRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 16,
  },
  helperText: {
    color: "#475569",
    fontSize: 14,
    marginRight: 8,
  },
});
