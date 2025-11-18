// src/screens/educateur/EducatorChildDetailsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EducatorStackParamList } from "../../navigation/EducatorNavigator";
import { useAuth } from "../../features/auth/AuthContext";
import {
  ForbiddenError,
  getActivePeiForChild,
  getChildDetails,
  getLatestPeiForChild,
  getLatestObservationInitiale,
  getPEI,
  getPeiActivities,
  getPeiEvaluations,
  ObservationInitialeDto,
} from "../../features/educateur/api";
import {
  ChildDetails,
  PeiActivitySummary,
  PeiDetails,
  PeiEvaluation,
} from "../../features/educateur/types";
import { showErrorMessage } from "../../utils/feedback";

type Route = RouteProp<EducatorStackParamList, "EducatorChildDetails">;
type Nav = NativeStackNavigationProp<EducatorStackParamList>;

export const EducatorChildDetailsScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { childId } = params;
  const { user } = useAuth();

  const [child, setChild] = useState<ChildDetails | null>(null);
  const [observation, setObservation] = useState<ObservationInitialeDto | null>(null);
  const [peiDetails, setPeiDetails] = useState<PeiDetails | null>(null);
  const [evaluations, setEvaluations] = useState<PeiEvaluation[]>([]);
  const [activities, setActivities] = useState<PeiActivitySummary[]>([]);
  const [activePeiId, setActivePeiId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const [childData, observationData] = await Promise.all([
          getChildDetails(childId),
          getLatestObservationInitiale(childId).catch(() => null),
        ]);

        if (!isMounted) return;
        setChild(childData);
        setObservation(observationData);

        const activePei = await getActivePeiForChild(childId);
        if (!isMounted) return;

        if (activePei) {
          setActivePeiId(activePei.id);
          const [peiInfo, evals, acts] = await Promise.all([
            getPEI(activePei.id),
            getPeiEvaluations(activePei.id),
            getPeiActivities(activePei.id, { pageSize: 5 }),
          ]);
          if (!isMounted) return;
          setPeiDetails(peiInfo);
          setEvaluations(evals.slice(0, 3));
          setActivities(acts.slice(0, 3));
        } else {
          setActivePeiId(null);
          const latestPei = await getLatestPeiForChild(childId).catch(() => null);
          if (!isMounted) return;
          setPeiDetails(latestPei);
          setEvaluations([]);
          setActivities([]);
        }
      } catch (err) {
        console.error("Failed to load child profile", err);
        if (isMounted) {
          const fallback = "تعذّر تحميل ملف الطفل. حاول مجددًا لاحقًا.";
          const message = err instanceof ForbiddenError ? err.message : fallback;
          setChild(null);
          setObservation(null);
          setPeiDetails(null);
          setEvaluations([]);
          setActivities([]);
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [childId]);

  const fullName = `${child?.prenom ?? ""} ${child?.nom ?? ""}`.trim() || "ملف طفل";

  const renderPeiStatusLabel = () => {
    if (!peiDetails) return "لا يوجد";
    switch (peiDetails.statut) {
      case "VALIDE":
        return "PEI مُصادَق عليه";
      case "EN_ATTENTE_VALIDATION":
        return "في انتظار المصادقة";
      case "CLOTURE":
        return "PEI مغلق";
      case "REFUSE":
        return "PEI مرفوض";
      default:
        return "حالة غير معروفة";
    }
  };

  if (loading && !child) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color="#2563EB" />
        <Text style={styles.loaderText}>جارٍ تحميل ملف الطفل...</Text>
      </View>
    );
  }

  const groupLabel = peiDetails?.titre ?? "ملف تربوي";
  const birthDate = child?.date_naissance ? child.date_naissance.slice(0, 10) : "غير متاح";
  const diagnosis = child?.diagnostic ?? "غير مصرح";
  const allergies = child?.allergies ?? "غير مصرح";
  const needs = child?.besoins_specifiques ?? child?.description ?? "لم يتم تحديد احتياجات بعد";
  const peiStatusStyle = peiDetails
    ? peiDetails.statut === "VALIDE"
      ? styles.peiStatusActive
      : peiDetails.statut === "CLOTURE" || peiDetails.statut === "REFUSE"
      ? styles.peiStatusClosed
      : styles.peiStatusToReview
    : styles.peiStatusClosed;
  const activePeiDetails = peiDetails?.statut === "VALIDE" ? peiDetails : null;
  const pendingPeiDetails = peiDetails?.statut === "EN_ATTENTE_VALIDATION" ? peiDetails : null;
  const formatDate = (value?: string | null) => (value ? value.slice(0, 10) : "غير متاح");
  const observationInfo = observation
    ? {
        exists: true,
        date: observation.date_observation?.slice(0, 10) ?? "",
        completed: Boolean(observation.contenu),
      }
    : { exists: false, date: "", completed: false };
  const hasPendingPei = Boolean(pendingPeiDetails);
  const canGeneratePei = Boolean(
    observationInfo.exists && !activePeiId && user?.id && !hasPendingPei
  );
  const generationHelperText = !observationInfo.exists
    ? "يجب إكمال الملاحظة الأوّلية قبل إنشاء الـ PEI"
    : activePeiId
    ? "يوجد مشروع تربوي نشط لهذا الطفل."
    : hasPendingPei
    ? "هناك مشروع بانتظار مصادقة الإدارة."
    : !user?.id
    ? "يجب تسجيل الدخول كمربٍّ لإنشاء الـ PEI."
    : null;
  const handleGeneratePei = () => {
    if (!canGeneratePei) {
      if (!user) {
        showErrorMessage("لا يمكن إنشاء الـ PEI من دون تسجيل الدخول كمربٍّ.");
      }
      return;
    }
    navigation.navigate("EducatorPeiCreate", { childId });
  };
  const peiStats = activePeiDetails
    ? {
        lastUpdate: activePeiDetails.date_derniere_maj ?? activePeiDetails.date_debut,
        nextReview: activePeiDetails.date_fin_prevue ?? undefined,
        objectivesCount: activePeiDetails.objectifs
          ? activePeiDetails.objectifs.split(/\n+/).filter((line) => line.trim().length > 0).length
          : 0,
        activitiesCount: activities.length,
      }
    : null;
  const lastEvaluations = evaluations;
  const lastActivities = activities;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* HEADER */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.childName}>{fullName}</Text>
            <Text style={styles.childGroup}>{groupLabel}</Text>
          </View>
          <View
            style={[styles.peiStatusChip, peiStatusStyle]}
          >
            <Text style={styles.peiStatusText}>{renderPeiStatusLabel()}</Text>
          </View>
        </View>

        <Text style={styles.headerHelper}>
          ملف شامل للطفل يجمع الملاحظة الأوّلية، الـ PEI، التقييمات والأنشطة
          التربوية.
        </Text>
      </View>

      {/* BASIC INFO */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>نبذة عن الطفل</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>تاريخ الميلاد</Text>
          <Text style={styles.infoValue}>{birthDate}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>التشخيص</Text>
          <Text style={styles.infoValue}>{diagnosis}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>الحساسيّات</Text>
          <Text style={styles.infoValue}>{allergies}</Text>
        </View>

        <View style={styles.infoRowColumn}>
          <Text style={styles.infoLabel}>الاحتياجات التربوية</Text>
          <Text style={styles.infoValue}>{needs}</Text>
        </View>
      </View>

      {/* OBSERVATION INITIALE */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>الملاحظة الأوّلية</Text>
        <Text style={styles.sectionSubtitle}>
          Observation initiale · نقطة الانطلاق لبناء الـ PEI.
        </Text>

        <View style={styles.obsRow}>
          <View style={{ flex: 1 }}>
            {observationInfo.exists ? (
              <>
                <Text style={styles.obsStatusText}>
                  {observationInfo.completed
                    ? "ملاحظة أولية مكتملة."
                    : "ملاحظة أولية في طور الإنجاز."}
                </Text>
                {observationInfo.date ? (
                  <Text style={styles.obsDate}>
                    آخر تحديث: {observationInfo.date}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.obsStatusText}>
                لم تتم بعد إضافة ملاحظة أوّلية لهذا الطفل.
              </Text>
            )}
          </View>
          <View
            style={[
              styles.obsStatusChip,
              observationInfo.exists && observationInfo.completed
                ? styles.obsStatusDone
                : styles.obsStatusPending,
            ]}
          >
            <Text style={styles.obsStatusChipText}>
              {observationInfo.exists
                ? observationInfo.completed
                  ? "مكتملة"
                  : "غير مكتملة"
                : "غير موجودة"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.obsButton}
          onPress={() =>
            navigation.navigate("ObservationInitiale", { childId })
          }
        >
          <Text style={styles.obsButtonText}>إدارة الملاحظة الأوّلية</Text>
        </TouchableOpacity>
      </View>

      {/* GENERATE PEI */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>إنشاء مشروع تربوي فردي</Text>
        <Text style={styles.sectionSubtitle}>
          يمكنك إنشاء الـ PEI بمجرد الانتهاء من الملاحظة الأوّلية.
        </Text>
        <TouchableOpacity
          style={[
            styles.generatePeiButton,
            !canGeneratePei && styles.generatePeiButtonDisabled,
          ]}
          disabled={!canGeneratePei}
          onPress={handleGeneratePei}
        >
          <Text style={styles.generatePeiButtonText}>
            إنشاء مشروع تربوي فردي (PEI)
          </Text>
        </TouchableOpacity>
        {generationHelperText ? (
          <Text style={styles.generationHelper}>{generationHelperText}</Text>
        ) : null}
      </View>

      {pendingPeiDetails ? (
        <View style={[styles.card, styles.pendingPeiCard]}>
          <View style={styles.pendingHeaderRow}>
            <Text style={styles.pendingTitle}>⚠️ مشروع في انتظار المصادقة</Text>
            <View style={[styles.peiStatusChip, styles.peiStatusToReview]}>
              <Text style={styles.peiStatusText}>في انتظار المصادقة</Text>
            </View>
          </View>
          <Text style={styles.pendingSubtitle}>
            تم إرسال هذا المشروع إلى الإدارة وينتظر الموافقة قبل أن يصبح فعالًا للطفل.
          </Text>
          <View style={styles.pendingInfoRow}>
            <Text style={styles.pendingLabel}>العنوان</Text>
            <Text style={styles.pendingValue}>{pendingPeiDetails.titre}</Text>
          </View>
          <TouchableOpacity
            style={styles.pendingActionBtn}
            onPress={() =>
              navigation.navigate("EducatorPeiDetail", {
                childId,
                peiId: pendingPeiDetails.id,
              })
            }
          >
            <Text style={styles.pendingActionText}>عرض تفاصيل المشروع</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* PEI SUMMARY */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>PEI الحالي</Text>
        <Text style={styles.sectionSubtitle}>
          Projet Éducatif Individuel · الأهداف والأنشطة والتقييمات.
        </Text>

        {peiStats ? (
          <>
            <View style={styles.peiRow}>
              <View style={styles.peiColumn}>
                <Text style={styles.peiLabel}>آخر تحديث</Text>
                <Text style={styles.peiValue}>
                  {peiStats.lastUpdate ? formatDate(peiStats.lastUpdate) : "غير متاح"}
                </Text>
              </View>
              <View style={styles.peiColumn}>
                <Text style={styles.peiLabel}>مراجعة قادمة</Text>
                <Text style={styles.peiValue}>
                  {peiStats.nextReview ? formatDate(peiStats.nextReview) : "غير محدد"}
                </Text>
              </View>
            </View>

            <View style={styles.peiRow}>
              <View style={styles.peiColumn}>
                <Text style={styles.peiLabel}>عدد الأهداف</Text>
                <Text style={styles.peiValue}>{peiStats.objectivesCount ?? 0}</Text>
              </View>
              <View style={styles.peiColumn}>
                <Text style={styles.peiLabel}>عدد الأنشطة</Text>
                <Text style={styles.peiValue}>{peiStats.activitiesCount ?? 0}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noActivePeiBox}>
            <Text style={styles.mutedText}>لا يوجد PEI مُصادَق عليه حاليًا.</Text>
            {pendingPeiDetails ? (
              <Text style={[styles.mutedText, styles.noActivePeiHelper]}>
                يوجد مشروع بانتظار المصادقة قبل أن يصبح نشطًا.
              </Text>
            ) : null}
          </View>
        )}

        <View style={styles.peiActionsRow}>
          <TouchableOpacity
            style={[
              styles.peiActionBtn,
              !activePeiDetails && styles.peiActionBtnDisabled,
            ]}
            disabled={!activePeiDetails}
            onPress={() =>
              activePeiDetails &&
              navigation.navigate("EducatorPeiDetail", {
                childId,
                peiId: activePeiDetails.id,
              })
            }
          >
            <Text style={styles.peiActionText}>
              {activePeiDetails
                ? "عرض تفاصيل الـ PEI"
                : pendingPeiDetails
                ? "بانتظار المصادقة"
                : "لا يوجد PEI نشط"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LAST EVALUATIONS & ACTIVITIES */}
      <View style={styles.rowCardWrapper}>
        {/* EVALUATIONS */}
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.sectionTitleSmall}>آخر التقييمات</Text>

          {lastEvaluations.length === 0 ? (
            <Text style={styles.mutedText}>لا توجد تقييمات مسجّلة بعد.</Text>
          ) : (
            lastEvaluations.map((e) => (
              <View key={e.id} style={styles.itemRow}>
                <Text style={styles.itemDate}>{formatDate(e.date)}</Text>
                <Text style={styles.itemSummary}>
                  {e.commentaire_global ?? "بدون ملاحظات"}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* ACTIVITIES */}
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.sectionTitleSmall}>آخر الأنشطة</Text>

          {lastActivities.length === 0 ? (
            <Text style={styles.mutedText}>لا توجد أنشطة مسجّلة بعد.</Text>
          ) : (
            lastActivities.map((a) => (
              <View key={a.id} style={styles.itemRow}>
                <Text style={styles.itemDate}>{formatDate(a.date)}</Text>
                <Text style={styles.itemSummary}>
                  {a.titre ?? a.description ?? "نشاط تربوي"}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
        <Text style={styles.sectionSubtitle}>
          إضافة ملاحظة يومية، نشاط تربوي أو مراسلة الوليّ.
        </Text>

        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() =>
              navigation.navigate("DailyNoteForm", {
                childId,
                peiId: activePeiId ?? undefined,
              })
            }
          >
            <Text style={styles.quickEmoji}>📝</Text>
            <Text style={styles.quickLabel}>ملاحظة يومية</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() =>
              navigation.navigate("ActivityForm", {
                childId,
                peiId: activePeiId ?? undefined,
              })
            }
          >
            <Text style={styles.quickEmoji}>🎯</Text>
            <Text style={styles.quickLabel}>نشاط جديد</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() =>
              navigation.navigate("EducatorChatThread", {
                childId,
              })
            }
          >
            <Text style={styles.quickEmoji}>💬</Text>
            <Text style={styles.quickLabel}>رسالة مع الوليّ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SPACER */}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { padding: 16, paddingBottom: 24 },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#F3F4F6",
  },
  loaderText: { marginTop: 12, color: "#4B5563" },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 12,
  },
  errorText: { fontSize: 13, color: "#B91C1C", textAlign: "right" },

  headerCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  childName: { fontSize: 18, fontWeight: "700", color: "#111827" },
  childGroup: { fontSize: 13, color: "#4B5563", marginTop: 2 },
  headerHelper: { fontSize: 12, color: "#4B5563", marginTop: 4 },

  peiStatusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  peiStatusText: { fontSize: 11, fontWeight: "600" },
  peiStatusActive: { backgroundColor: "#DCFCE7" },
  peiStatusToReview: { backgroundColor: "#FEF3C7" },
  peiStatusClosed: { backgroundColor: "#E5E7EB" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  sectionSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 4 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  infoRowColumn: {
    marginTop: 10,
  },
  infoLabel: { fontSize: 13, color: "#6B7280" },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    maxWidth: "70%",
  },

  // Observation
  obsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  obsStatusText: { fontSize: 13, color: "#111827" },
  obsDate: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  obsStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 8,
  },
  obsStatusChipText: { fontSize: 11, fontWeight: "600" },
  obsStatusDone: { backgroundColor: "#DBEAFE" },
  obsStatusPending: { backgroundColor: "#FEE2E2" },
  obsButton: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  obsButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },

  // PEI summary
  peiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  peiColumn: { flex: 1 },
  peiLabel: { fontSize: 12, color: "#6B7280" },
  peiValue: { fontSize: 14, color: "#111827", marginTop: 2 },
  noActivePeiBox: {
    marginTop: 10,
    paddingVertical: 8,
  },
  noActivePeiHelper: {
    marginTop: 4,
  },
  peiActionsRow: { flexDirection: "row", marginTop: 12 },
  peiActionBtn: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2563EB",
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#EFF6FF",
  },
  peiActionText: { fontSize: 13, fontWeight: "600", color: "#2563EB" },
  peiActionBtnDisabled: {
    backgroundColor: "#E5E7EB",
    borderColor: "#D1D5DB",
  },

  // Evaluations & activities
  rowCardWrapper: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  halfCard: {
    flex: 1,
  },
  sectionTitleSmall: { fontSize: 15, fontWeight: "700", color: "#111827" },
  mutedText: { fontSize: 12, color: "#9CA3AF", marginTop: 6 },
  itemRow: { marginTop: 8 },
  itemDate: { fontSize: 11, color: "#9CA3AF" },
  itemSummary: { fontSize: 13, color: "#111827", marginTop: 2 },

  // Quick actions
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  quickBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  quickEmoji: { fontSize: 20 },
  quickLabel: { fontSize: 12, color: "#111827", marginTop: 4 },
  pendingPeiCard: {
    borderColor: "#FCD34D",
    borderWidth: 1,
  },
  pendingHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pendingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#92400E",
  },
  pendingSubtitle: {
    marginTop: 8,
    fontSize: 13,
    color: "#B45309",
    lineHeight: 20,
  },
  pendingInfoRow: {
    marginTop: 12,
  },
  pendingLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  pendingValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginTop: 4,
  },
  pendingActionBtn: {
    marginTop: 14,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#FEF3C7",
  },
  pendingActionText: {
    color: "#92400E",
    fontWeight: "700",
    fontSize: 13,
  },
  generatePeiButton: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  generatePeiButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  generatePeiButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  generationHelper: {
    marginTop: 10,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
  },
  inlineError: {
    marginTop: 8,
    fontSize: 12,
    color: "#B91C1C",
    textAlign: "right",
  },
});

export default EducatorChildDetailsScreen;
