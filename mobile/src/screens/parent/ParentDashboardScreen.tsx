// src/screens/parent/ParentDashboardScreen.tsx
import React, { useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "../../features/auth/AuthContext";
import { ParentStackParamList } from "../../navigation/ParentNavigator";
import { useMyChildren } from "../../features/parent/hooks";
import { Child } from "../../features/parent/types";

type ParentNav = NativeStackNavigationProp<ParentStackParamList, "ParentTabs">;

export const ParentDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<ParentNav>();
  const { children, isLoading, isError, error, refetch } = useMyChildren();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const parentName =
    (user as any)?.fullName ||
    (user as any)?.name ||
    (user as any)?.username ||
    "وليّ الأمر";

  const openChildDetails = (childId: number) => {
    navigation.navigate("ChildDetails", { childId });
  };

  const openChildTimeline = (childId: number) => {
    navigation.navigate("ChildTimeline", { childId });
  };

  const openChat = (child: Child) => {
    if (child.thread_id) {
      navigation.navigate("ChatThread", {
        childId: child.id,
        threadId: child.thread_id,
      });
      return;
    }
    (navigation as any).navigate("ParentTabs", { screen: "Messages" });
  };

  const latestUpdate = useMemo(() => {
    const dates = children
      .map((c) => c.last_note_date)
      .filter(Boolean) as string[];

    if (!dates.length) return null;

    return dates.sort().reverse()[0];
  }, [children]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />
      <View style={styles.root}>
        {/* HERO HEADER */}
        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroGreeting}>مرحبًا، {parentName} 👋</Text>
              <Text style={styles.heroSubtitle}>
                من هذه الشاشة يمكنك متابعة أطفالك، قراءة الملاحظات اليومية
                والتواصل بسهولة مع الفريق التربوي للجمعية.
              </Text>
            </View>

            <View style={styles.heroAvatarBlock}>
              <View style={styles.heroAvatarCircle}>
                <Text style={styles.heroAvatarText}>
                  {parentName.charAt(0) || "و"}
                </Text>
              </View>
              <Text style={styles.heroRole}>حساب وليّ الأمر</Text>
            </View>
          </View>

          {/* STATS */}
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>عدد الأطفال المرتبطين</Text>
              <Text style={styles.heroStatValue}>{children.length}</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>آخر تحديث تربوي</Text>
              <Text style={styles.heroStatValue}>
                {latestUpdate ?? "-"}
              </Text>
            </View>
          </View>
        </View>

        {/* MAIN CONTENT */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          {/* INFO BANNER */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerTitle}>لوحة متابعة الأسرة</Text>
            <Text style={styles.infoBannerText}>
              اضغط على بطاقة أيّ طفل للاطلاع على ملفّه، ملاحظاته اليومية،
              والأنشطة المنجزة في الجمعية.
            </Text>
          </View>

          {/* CHILDREN LIST */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>أطفالي</Text>
              <Text style={styles.sectionSubtitle}>Mes enfants</Text>
            </View>

            {isError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {error ?? "حدث خطأ غير متوقّع أثناء جلب بيانات الأطفال."}
                </Text>
                <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
                  <Text style={styles.retryText}>إعادة المحاولة</Text>
                </TouchableOpacity>
              </View>
            )}

            {isLoading && children.length === 0 ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color="#2563EB" />
                <Text style={styles.loadingText}>
                  جارٍ تحميل بيانات الأطفال...
                </Text>
              </View>
            ) : children.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>
                  لا يوجد أطفال مرتبطون بحسابك حاليًا.
                </Text>
                <Text style={styles.emptyText}>
                  سيتمّ ربط حسابك بأطفالك من طرف إدارة الجمعية. في حال وجود
                  إشكال، يرجى التواصل مباشرة مع إدارة الجمعية.
                </Text>
              </View>
            ) : (
              children.map((child) => {
                // 🔔 Unread flags coming from backend (optional)
                const hasUnreadNote =
                  child.has_unread_note === true ||
                  child.has_unread_daily_note === true;

                const unreadMessagesCount = child.unread_messages_count ?? 0;

                const hasUnreadMessages = unreadMessagesCount > 0;

                let unreadLabel = "";
                if (hasUnreadNote && hasUnreadMessages) {
                  unreadLabel = "ملاحظة + رسائل جديدة";
                } else if (hasUnreadNote) {
                  unreadLabel = "ملاحظة جديدة";
                } else if (hasUnreadMessages) {
                  unreadLabel = "رسائل جديدة";
                }

                return (
                  <TouchableOpacity
                    key={child.id}
                    style={styles.childCard}
                    activeOpacity={0.92}
                    onPress={() => openChildDetails(child.id)}
                  >
                    {/* Top row */}
                    <View style={styles.childHeaderRow}>
                      <View style={styles.childNameBlock}>
                        <Text style={styles.childName} numberOfLines={1}>
                          {child.prenom} {child.nom}
                        </Text>
                        <Text style={styles.childGroup} numberOfLines={1}>
                          {child.groupe_actuel?.nom ?? "مجموعة غير محددة"}
                        </Text>
                      </View>

                      <View style={styles.childBadgesColumn}>
                        <View style={styles.childBadge}>
                          <Text style={styles.childBadgeText}>
                            متابعة اليوم
                          </Text>
                        </View>

                        {unreadLabel !== "" && (
                          <View style={styles.unreadPill}>
                            <View style={styles.unreadDot} />
                            <Text style={styles.unreadPillText}>
                              {unreadLabel}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Educator */}
                    <View style={styles.childMetaRow}>
                      <Text style={styles.childMetaLabel}>
                        المربية / المربي:
                      </Text>
                      <Text
                        style={styles.childMetaValue}
                        numberOfLines={1}
                      >
                        {child.educateur_referent
                          ? `${child.educateur_referent.prenom ?? ""} ${
                              child.educateur_referent.nom ?? ""
                            }`.trim()
                          : "غير محدد"}
                      </Text>
                    </View>

                    {/* Last note */}
                    <View
                      style={[
                        styles.lastNoteBox,
                        hasUnreadNote && styles.lastNoteBoxUnread,
                      ]}
                    >
                      <Text style={styles.lastNoteLabel}>
                        آخر ملاحظة · {child.last_note_date ?? "-"}
                      </Text>
                      <Text style={styles.lastNoteText} numberOfLines={2}>
                        {child.last_note_preview ??
                          "لم تتم إضافة ملاحظات بعد لطفلك في هذه الفترة."}
                      </Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={styles.cardAction}
                        onPress={() => openChildDetails(child.id)}
                      >
                        <Text style={styles.cardActionEmoji}>📘</Text>
                        <Text style={styles.cardActionText}>ملف الطفل</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cardAction}
                        onPress={() => openChildTimeline(child.id)}
                      >
                        <Text style={styles.cardActionEmoji}>🕒</Text>
                        <Text style={styles.cardActionText}>
                          متابعة يوم الطفل
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cardAction}
                        onPress={() => openChat(child)}
                      >
                        <View style={styles.chatActionWrapper}>
                          <Text style={styles.cardActionEmoji}>💬</Text>
                          {hasUnreadMessages && (
                            <View style={styles.actionBadge}>
                              <Text style={styles.actionBadgeText}>
                                {unreadMessagesCount > 9
                                  ? "9+"
                                  : unreadMessagesCount}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.cardActionText}>
                          راسل المربي(ة)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* QUICK ACTIONS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
              <Text style={styles.sectionSubtitle}>Actions rapides</Text>
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.quickAction}
                activeOpacity={0.92}
                onPress={() =>
                  (navigation as any).navigate("ParentTabs", {
                    screen: "Messages",
                  })
                }
              >
                <View style={styles.quickIconBadge}>
                  <Text style={styles.quickEmoji}>📩</Text>
                </View>
                <Text style={styles.quickTitle}>الرسائل</Text>
                <Text style={styles.quickText}>
                  عرض المحادثات مع المربين وإدارة الجمعية في فضاء واحد منظّم.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                activeOpacity={0.92}
                // à connecter plus tard à un écran Notifications
              >
                <View style={styles.quickIconBadgeSecondary}>
                  <Text style={styles.quickEmoji}>🔔</Text>
                </View>
                <Text style={styles.quickTitle}>الإشعارات</Text>
                <Text style={styles.quickText}>
                  اطّلع على آخر التنبيهات حول المواعيد، الاجتماعات، والأنشطة
                  الخاصّة بأطفالك.
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ATPSM – Jemmel · منصة رقمية لمرافقة الأطفال بالتعاون مع الأولياء.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1D4ED8",
  },
  root: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    writingDirection: "rtl",
  },

  /* HERO */
  hero: {
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  heroRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  heroTextBlock: {
    flex: 1,
    alignItems: "flex-end",
    paddingLeft: 8,
  },
  heroGreeting: {
    fontSize: 18,
    color: "#E0F2FE",
    fontWeight: "800",
    textAlign: "right",
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#BFDBFE",
    marginTop: 4,
    lineHeight: 20,
    textAlign: "right",
  },
  heroAvatarBlock: {
    alignItems: "center",
    marginLeft: 8,
  },
  heroAvatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#2563EB",
    borderWidth: 2,
    borderColor: "#93C5FD",
    alignItems: "center",
    justifyContent: "center",
  },
  heroAvatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  heroRole: {
    marginTop: 4,
    fontSize: 11,
    color: "#DBEAFE",
  },
  heroStatsRow: {
    flexDirection: "row-reverse",
    backgroundColor: "#1E3A8A",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    marginTop: 4,
  },
  heroStatCard: {
    flex: 1,
    alignItems: "flex-end",
  },
  heroStatLabel: {
    fontSize: 11,
    color: "#C7D2FE",
  },
  heroStatValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 26,
    backgroundColor: "#3B82F6",
    marginHorizontal: 10,
    opacity: 0.7,
  },

  /* SCROLL */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
  },

  /* INFO BANNER */
  infoBanner: {
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    marginBottom: 10,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1D4ED8",
    textAlign: "right",
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 12,
    color: "#4B5563",
    textAlign: "right",
    lineHeight: 18,
  },

  /* SECTIONS */
  section: {
    marginTop: 14,
  },
  sectionHeader: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "right",
    marginTop: 2,
  },

  /* STATES */
  errorBox: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginTop: 6,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: "#B91C1C",
    marginBottom: 6,
    textAlign: "right",
  },
  retryBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#B91C1C",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 13,
    color: "#374151",
  },
  emptyBox: {
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    textAlign: "right",
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "right",
    lineHeight: 20,
  },

  /* CHILD CARD */
  childCard: {
    marginTop: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  childHeaderRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  childNameBlock: {
    flex: 1,
    alignItems: "flex-end",
    paddingLeft: 8,
  },
  childName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },
  childGroup: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 2,
    textAlign: "right",
  },
  childBadgesColumn: {
    alignItems: "flex-end",
    gap: 4,
  },
  childBadge: {
    backgroundColor: "#2563EB15",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  childBadgeText: {
    fontSize: 12,
    color: "#1D4ED8",
    fontWeight: "600",
  },

  unreadPill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#DC2626",
    marginLeft: 4,
  },
  unreadPillText: {
    fontSize: 11,
    color: "#B91C1C",
    fontWeight: "600",
  },

  childMetaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 4,
  },
  childMetaLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 4,
  },
  childMetaValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
  },

  lastNoteBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  lastNoteBoxUnread: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FBBF24",
  },
  lastNoteLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    textAlign: "right",
  },
  lastNoteText: {
    fontSize: 13,
    color: "#111827",
    textAlign: "right",
    lineHeight: 20,
  },

  cardActionsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cardAction: {
    alignItems: "center",
    flex: 1,
  },
  chatActionWrapper: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
  },
  cardActionEmoji: {
    fontSize: 18,
  },
  cardActionText: {
    fontSize: 11,
    marginTop: 2,
    color: "#374151",
  },
  actionBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#DC2626",
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  /* QUICK ACTIONS */
  row: {
    flexDirection: "row-reverse",
    columnGap: 10,
    marginTop: 6,
  },
  quickAction: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  quickIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    alignSelf: "flex-end",
  },
  quickIconBadgeSecondary: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    alignSelf: "flex-end",
  },
  quickEmoji: {
    fontSize: 18,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    textAlign: "right",
  },
  quickText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
    lineHeight: 18,
  },

  /* FOOTER */
  footer: {
    marginTop: 22,
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
