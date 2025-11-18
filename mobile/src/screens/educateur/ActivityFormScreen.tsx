import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";
import { ForbiddenError, addPEIActivity, getActivePeiForChild } from "../../features/educateur/api";
import { showErrorMessage, showSuccessMessage } from "../../utils/feedback";
import { validateStringFields } from "../../utils/validation";

type Route = RouteProp<EducatorStackParamList, "ActivityForm">;
type Nav = NativeStackNavigationProp<EducatorStackParamList>;

export const ActivityFormScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { childId, peiId: initialPeiId } = params;

  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [peiId, setPeiId] = useState<number | null>(initialPeiId ?? null);
  const [loadingPei, setLoadingPei] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    objective?: string;
    description?: string;
    pei?: string;
  }>({});

  useEffect(() => {
    if (initialPeiId) {
      return;
    }
    let isMounted = true;
    const fetchPei = async () => {
      setLoadingPei(true);
      try {
        const pei = await getActivePeiForChild(childId);
        if (isMounted) {
          setPeiId(pei?.id ?? null);
        }
      } catch (err) {
        console.error("Failed to load active PEI for activity", err);
        if (err instanceof ForbiddenError) {
          Alert.alert("غير مصرح", err.message);
        }
      } finally {
        if (isMounted) {
          setLoadingPei(false);
        }
      }
    };
    fetchPei();
    return () => {
      isMounted = false;
    };
  }, [childId, initialPeiId]);

  useEffect(() => {
    if (!peiId) return;
    setFieldErrors((prev) => {
      if (!prev.pei) return prev;
      const next = { ...prev };
      delete next.pei;
      return next;
    });
  }, [peiId]);

  const buildValidationErrors = () => {
    const textErrors = validateStringFields([
      {
        key: "title",
        value: title,
        required: true,
        minLength: 3,
        maxLength: 150,
        messages: {
          minLength: "العنوان قصير جدًا",
          maxLength: "العنوان طويل جدًا (150 حرفًا كحدّ أقصى)",
        },
      },
      {
        key: "objective",
        value: objective,
        minLength: 3,
        maxLength: 150,
        messages: {
          minLength: "الهدف يحتاج إلى 3 أحرف على الأقل",
          maxLength: "الهدف طويل جدًا",
        },
      },
      {
        key: "description",
        value: description,
        minLength: 10,
        maxLength: 2000,
        messages: {
          minLength: "الوصف قصير جدًا",
          maxLength: "الوصف طويل جدًا",
        },
      },
    ]);

    const errors: {
      title?: string;
      objective?: string;
      description?: string;
      pei?: string;
    } = { ...textErrors };

    if (!peiId) {
      errors.pei = "لا يوجد PEI نشط، لا يمكن ربط النشاط.";
    }

    return errors;
  };

  const validateForm = () => {
    const errors = buildValidationErrors();
    setFieldErrors(errors);
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      Alert.alert("تنبيه", "يرجى تصحيح الحقول المحددة.");
    }
    return !hasErrors;
  };

  const clearFieldError = (key: keyof typeof fieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedObjective = objective.trim();
    const trimmedDescription = description.trim();

    setSaving(true);
    try {
      await addPEIActivity(peiId, {
        titre: trimmedTitle,
        objectifs: trimmedObjective || undefined,
        description: trimmedDescription || undefined,
        date_activite: new Date().toISOString(),
        enfant_id: childId,
      });
      showSuccessMessage("تم حفظ النشاط بنجاح");
      navigation.goBack();
    } catch (err) {
      console.error("Failed to save activity", err);
      const fallback = "تعذّر حفظ النشاط. حاول مجددًا.";
      const message =
        err instanceof ForbiddenError
          ? err.message
          : err instanceof Error
            ? err.message
            : fallback;
      showErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const isSubmitDisabled = saving || loadingPei || Object.keys(buildValidationErrors()).length > 0;

  return (
    <View style={styles.container}>
      {loadingPei && !peiId ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#2563EB" />
          <Text style={styles.loaderText}>جارٍ التحقق من الـ PEI النشط...</Text>
        </View>
      ) : null}
      <Text style={styles.label}>عنوان النشاط</Text>
      <TextInput
        style={styles.input}
        placeholder="مثال: لعبة تصنيف الألوان"
        value={title}
        onChangeText={(text) => {
          clearFieldError("title");
          setTitle(text);
        }}
      />
      {fieldErrors.title ? (
        <Text style={styles.errorText}>{fieldErrors.title}</Text>
      ) : null}

      <Text style={styles.label}>الهدف التربوي</Text>
      <TextInput
        style={styles.input}
        placeholder="مثال: تنمية مهارات الانتباه والتركيز"
        value={objective}
        onChangeText={(text) => {
          clearFieldError("objective");
          setObjective(text);
        }}
      />
      {fieldErrors.objective ? (
        <Text style={styles.errorText}>{fieldErrors.objective}</Text>
      ) : null}

      <Text style={styles.label}>وصف مختصر</Text>
      <TextInput
        style={styles.textArea}
        placeholder="شرح خطوات النشاط، الوسائل المستعملة، أسلوب التعزيز..."
        multiline
        value={description}
        onChangeText={(text) => {
          clearFieldError("description");
          setDescription(text);
        }}
      />
      {fieldErrors.description ? (
        <Text style={styles.errorText}>{fieldErrors.description}</Text>
      ) : null}
      {fieldErrors.pei ? (
        <Text style={styles.errorText}>{fieldErrors.pei}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.saveBtn, isSubmitDisabled && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={isSubmitDisabled}
      >
        <Text style={styles.saveText}>{saving ? "..." : "حفظ النشاط"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 16 },
  label: { fontSize: 14, color: "#4B5563", marginBottom: 4, marginTop: 10 },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 14,
  },
  textArea: {
    minHeight: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    textAlignVertical: "top",
    fontSize: 14,
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: "#10B981",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  errorText: {
    color: "#DC2626",
    marginTop: 8,
    textAlign: "center",
    fontSize: 13,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  loader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  loaderText: { color: "#6B7280", fontSize: 13 },
});
