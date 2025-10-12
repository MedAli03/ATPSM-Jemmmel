import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useToast } from "../../../components/common/ToastProvider";
import Modal from "../../../components/common/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import {
  fetchActiveSchoolYear,
  fetchSchoolYears,
} from "../../../api/annees";
import {
  getChildrenPerGroupStats,
  getDirectorStats,
  getFamilySituationDistribution,
  getMonthlyInscriptions,
} from "../../../api/stats";
import { getUpcomingEvenements } from "../../../api/evenements";
import { getLatestActualites } from "../../../api/actualites";
import { listNonInscrits } from "../../../api/enfants";
import { listGroupes } from "../../../api/groups";
import { createInscription } from "../../../api/inscriptions";

const numberFormatter = new Intl.NumberFormat("ar-EG");
const monthFormatter = new Intl.DateTimeFormat("ar", {
  month: "short",
  year: "numeric",
});
const dateFormatter = new Intl.DateTimeFormat("ar-TN", { dateStyle: "medium" });

const PIE_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6"];

function formatNumber(value) {
  if (value == null) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return numberFormatter.format(n);
}

function resolveChildName(child) {
  if (!child) return "";
  const parts = [child.prenom, child.nom].filter(Boolean);
  return parts.length ? parts.join(" ") : child.full_name || child.name || "طفل";
}

function useToastOnError(toast, query, fallbackMessage) {
  useEffect(() => {
    if (!toast || !query?.isError) return;
    const message =
      query.error?.response?.data?.message ||
      query.error?.message ||
      fallbackMessage;
    toast(message, "error");
  }, [toast, query?.isError, query?.error, fallbackMessage]);
}

export default function DirectorDashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [childSearch, setChildSearch] = useState("");
  const [confirmPayload, setConfirmPayload] = useState(null);

  const anneeId = searchParams.get("annee_id") || "";
  const fromDate = searchParams.get("from") || "";
  const toDate = searchParams.get("to") || "";

  const updateFilters = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const anneesQuery = useQuery({
    queryKey: ["director", "school-years"],
    queryFn: fetchSchoolYears,
    staleTime: 5 * 60 * 1000,
  });

  const activeAnneeQuery = useQuery({
    queryKey: ["director", "active-school-year"],
    queryFn: fetchActiveSchoolYear,
    staleTime: 5 * 60 * 1000,
  });

  useToastOnError(toast, anneesQuery, "تعذّر تحميل السنوات الدراسية");
  useToastOnError(toast, activeAnneeQuery, "تعذّر تحديد السنة الدراسية الحالية");

  useEffect(() => {
    const active = activeAnneeQuery.data;
    if (!anneeId && active?.id) {
      const next = new URLSearchParams(searchParams);
      next.set("annee_id", String(active.id));
      setSearchParams(next, { replace: true });
    }
  }, [anneeId, activeAnneeQuery.data, searchParams, setSearchParams]);

  const baseFilters = useMemo(
    () => ({
      annee_id: anneeId || undefined,
      date_debut: fromDate || undefined,
      date_fin: toDate || undefined,
    }),
    [anneeId, fromDate, toDate]
  );

  const statsQuery = useQuery({
    queryKey: ["director-stats", baseFilters],
    queryFn: () => getDirectorStats(baseFilters),
    enabled: Boolean(anneeId),
  });
  useToastOnError(toast, statsQuery, "تعذّر تحميل المؤشرات الرئيسية");

  const groupesStatsQuery = useQuery({
    queryKey: ["director-children-per-group", baseFilters],
    queryFn: () => getChildrenPerGroupStats({ ...baseFilters, limit: 10 }),
    enabled: Boolean(anneeId),
  });
  useToastOnError(toast, groupesStatsQuery, "تعذّر تحميل توزيع الأطفال على المجموعات");

  const monthlyInscriptionsQuery = useQuery({
    queryKey: ["director-monthly-inscriptions", baseFilters],
    queryFn: () => getMonthlyInscriptions(baseFilters),
    enabled: Boolean(anneeId),
  });
  useToastOnError(toast, monthlyInscriptionsQuery, "تعذّر تحميل تطوّر التسجيلات");

  const familySituationQuery = useQuery({
    queryKey: ["director-family-situation", baseFilters],
    queryFn: () => getFamilySituationDistribution(baseFilters),
    enabled: Boolean(anneeId),
  });
  useToastOnError(toast, familySituationQuery, "تعذّر تحميل بيانات الوضعية العائلية");

  const eventsQuery = useQuery({
    queryKey: ["director-upcoming-events", baseFilters],
    queryFn: () => getUpcomingEvenements({ ...baseFilters, limit: 5 }),
    enabled: Boolean(anneeId),
  });
  useToastOnError(toast, eventsQuery, "تعذّر تحميل الفعاليات القادمة");

  const actualitesQuery = useQuery({
    queryKey: ["director-latest-actualites"],
    queryFn: () => getLatestActualites({ limit: 5 }),
  });
  useToastOnError(toast, actualitesQuery, "تعذّر تحميل آخر الأخبار");

  const nonInscritsQuery = useQuery({
    queryKey: ["director-non-inscrits", baseFilters],
    queryFn: () => listNonInscrits({ ...baseFilters, limit: 8 }),
    enabled: Boolean(anneeId),
  });
  useToastOnError(toast, nonInscritsQuery, "تعذّر تحميل الأطفال غير المسجلين");

  const groupesQuery = useQuery({
    queryKey: ["director-active-groups", anneeId],
    queryFn: () => listGroupes({ anneeId, statut: "actif", limit: 100 }),
    enabled: isRegisterModalOpen && Boolean(anneeId),
    staleTime: 2 * 60 * 1000,
  });
  useToastOnError(toast, groupesQuery, "تعذّر تحميل قائمة المجموعات");

  const searchNonInscritsQuery = useQuery({
    queryKey: ["director-non-inscrits-search", anneeId, childSearch.trim()],
    queryFn: () =>
      listNonInscrits({ annee_id: anneeId, limit: 10, search: childSearch.trim() }),
    enabled: isRegisterModalOpen && Boolean(anneeId),
  });
  useToastOnError(toast, searchNonInscritsQuery, "تعذّر البحث عن الأطفال");

  useEffect(() => {
    if (!isRegisterModalOpen) {
      setSelectedChildId("");
      setSelectedGroupId("");
      setChildSearch("");
      setConfirmPayload(null);
      setSelectedChild(null);
    } else if (selectedChild) {
      const fullName = resolveChildName(selectedChild);
      setSelectedChildId(String(selectedChild.id));
      setChildSearch(fullName);
    }
  }, [isRegisterModalOpen, selectedChild]);

  const inscriptionMutation = useMutation({
    mutationFn: ({ enfant_id, groupe_id }) =>
      createInscription({ enfant_id, groupe_id, annee_id: anneeId }),
    onSuccess: () => {
      toast?.("تم تسجيل الطفل في المجموعة بنجاح ✅", "success");
      setConfirmPayload(null);
      setRegisterModalOpen(false);
      setSelectedChild(null);
      queryClient.invalidateQueries({ queryKey: ["director-stats"] });
      queryClient.invalidateQueries({ queryKey: ["director-children-per-group"] });
      queryClient.invalidateQueries({ queryKey: ["director-monthly-inscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["director-non-inscrits"] });
      queryClient.invalidateQueries({ queryKey: ["director-non-inscrits-search"] });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "تعذّر تسجيل الطفل في المجموعة ❌";
      toast?.(message, "error");
    },
  });

  const handleAnneeChange = (event) => {
    updateFilters({ annee_id: event.target.value });
  };

  const handleDateChange = (key) => (event) => {
    const value = event.target.value;
    if (key === "from" && toDate && value && value > toDate) {
      toast?.("لا يمكن أن يكون تاريخ البداية بعد تاريخ النهاية", "error");
      return;
    }
    if (key === "to" && fromDate && value && value < fromDate) {
      toast?.("لا يمكن أن يكون تاريخ النهاية قبل تاريخ البداية", "error");
      return;
    }
    updateFilters({ [key]: value });
  };

  const openRegisterModal = (child = null) => {
    setSelectedChild(child);
    setRegisterModalOpen(true);
  };

  const handleQuickNavigate = (path) => () => {
    navigate(path);
  };

  const handlePrepareRegistration = (event) => {
    event.preventDefault();
    if (!selectedChildId) {
      toast?.("الرجاء اختيار طفل", "error");
      return;
    }
    if (!selectedGroupId) {
      toast?.("الرجاء اختيار مجموعة", "error");
      return;
    }

    const groups = Array.isArray(groupesQuery.data) ? groupesQuery.data : [];
    const childCandidates = searchNonInscritsQuery.data || [];
    const chosenChild =
      childCandidates.find((item) => String(item.id) === String(selectedChildId)) ||
      selectedChild;
    const chosenGroup = groups.find((g) => String(g.id) === String(selectedGroupId));

    setConfirmPayload({
      enfant_id: Number(selectedChildId),
      groupe_id: Number(selectedGroupId),
      childName: resolveChildName(chosenChild),
      groupName: chosenGroup?.nom || "المجموعة",
    });
  };

  const submitRegistration = () => {
    if (!confirmPayload) return;
    inscriptionMutation.mutate({
      enfant_id: confirmPayload.enfant_id,
      groupe_id: confirmPayload.groupe_id,
    });
  };

  const stats = statsQuery.data || {};
  const groupesData = useMemo(() => {
    const raw = groupesStatsQuery.data || [];
    return raw.map((item, index) => ({
      name: item.groupe || item.nom || item.name || `مجموعة ${index + 1}`,
      value: Number(item.total || item.count || item.value || 0),
    }));
  }, [groupesStatsQuery.data]);

  const monthlyData = useMemo(() => {
    const raw = monthlyInscriptionsQuery.data || [];
    return raw.map((item, index) => {
      const dateString = item.mois || item.month || item.label;
      let parsed = dateString ? new Date(dateString) : null;
      if (parsed && Number.isNaN(parsed.getTime()) && dateString?.length === 7) {
        parsed = new Date(`${dateString}-01`);
      }
      const label = parsed && !Number.isNaN(parsed.getTime())
        ? monthFormatter.format(parsed)
        : dateString || `الشهر ${index + 1}`;
      return {
        name: label,
        value: Number(item.total || item.value || item.count || 0),
      };
    });
  }, [monthlyInscriptionsQuery.data]);

  const familyData = useMemo(() => {
    const raw = familySituationQuery.data || [];
    return raw.map((item, index) => ({
      name: item.label || item.situation || item.name || `فئة ${index + 1}`,
      value: Number(item.value || item.total || item.count || 0),
    }));
  }, [familySituationQuery.data]);

  const upcomingEvents = eventsQuery.data || [];
  const latestActualites = actualitesQuery.data || [];
  const nonInscrits = nonInscritsQuery.data || [];
  const groupOptions = (groupesQuery.data || []).map((g) => ({
    value: String(g.id),
    label: g.nom || g.name,
  }));

  const isLoadingStats = statsQuery.isLoading || !anneeId;
  const isLoadingBar = groupesStatsQuery.isLoading;
  const isLoadingLine = monthlyInscriptionsQuery.isLoading;
  const isLoadingPie = familySituationQuery.isLoading;

  return (
    <div className="space-y-6" dir="rtl">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="px-4 pt-4 pb-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">لوحة المدير</h1>
              <p className="text-sm text-gray-500">
                نظرة شاملة على الأداء والتسجيلات والفعاليات الخاصة بالسنة الدراسية الحالية.
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col text-xs text-gray-600">
                <span className="mb-1 font-medium">السنة الدراسية</span>
                <select
                  className="min-w-[180px] rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={anneeId}
                  onChange={handleAnneeChange}
                  aria-label="اختيار السنة الدراسية"
                >
                  <option value="">اختر سنة</option>
                  {(anneesQuery.data || []).map((annee) => (
                    <option key={annee.id ?? annee.value} value={annee.id ?? annee.value}>
                      {annee.libelle || annee.label || annee.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-xs text-gray-600">
                <span className="mb-1 font-medium">تاريخ البداية</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={handleDateChange("from")}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="تاريخ البداية"
                />
              </label>
              <label className="flex flex-col text-xs text-gray-600">
                <span className="mb-1 font-medium">تاريخ النهاية</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={handleDateChange("to")}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="تاريخ النهاية"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "إجمالي الأطفال",
              value: stats.enfants_total,
            },
            {
              label: "مجموعات نشطة",
              value: stats.groupes_actifs,
            },
            {
              label: "مجموعات مؤرشفة",
              value: stats.groupes_archive,
            },
            {
              label: "عدد المربّين",
              value: stats.educateurs_total,
            },
            {
              label: "أطفال بلا مجموعة",
              value: stats.enfants_sans_groupe,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <p className="text-xs text-gray-500">{item.label}</p>
              {isLoadingStats ? (
                <div className="mt-3 h-6 w-20 animate-pulse rounded-full bg-gray-200" />
              ) : (
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatNumber(item.value)}
                </p>
              )}
            </div>
          ))}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-500">طلبات التسجيل قيد المعالجة</p>
            {isLoadingStats ? (
              <div className="mt-3 h-6 w-20 animate-pulse rounded-full bg-gray-200" />
            ) : (
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatNumber(stats.inscriptions_en_attente)}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-7">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">الأطفال لكل مجموعة</h2>
              <span className="text-xs text-gray-400">أعلى 10 مجموعات</span>
            </div>
            <div className="mt-4 h-72">
              {isLoadingBar ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-20 w-full max-w-xs animate-pulse rounded-2xl bg-gray-200" />
                </div>
              ) : groupesData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groupesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value) => formatNumber(value)} />
                    <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="لا توجد بيانات للمجموعات" />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-5">
            <h2 className="text-lg font-semibold text-gray-900">التسجيلات خلال الأشهر الأخيرة</h2>
            <div className="mt-4 h-72">
              {isLoadingLine ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-20 w-full max-w-xs animate-pulse rounded-2xl bg-gray-200" />
                </div>
              ) : monthlyData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} height={50} />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value) => formatNumber(value)} />
                    <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="لا توجد تسجيلات حديثة" />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">الوضعية العائلية للأطفال</h2>
          <div className="mt-4 h-80">
            {isLoadingPie ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-20 w-full max-w-xs animate-pulse rounded-2xl bg-gray-200" />
              </div>
            ) : familyData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={familyData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={4}
                  >
                    {familyData.map((entry, index) => (
                      <Cell
                        key={`slice-${entry.name}-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, _name, { payload }) => [
                    formatNumber(value),
                    payload?.name,
                  ]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="لا توجد بيانات للوضعيات العائلية" />
            )}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">الفعاليات القادمة</h2>
              <button
                type="button"
                onClick={handleQuickNavigate("/dashboard/manager/events")}
                className="text-xs text-blue-600 hover:underline"
              >
                عرض الكل
              </button>
            </div>
            <ul className="mt-4 space-y-4">
              {eventsQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <li key={idx} className="space-y-2">
                    <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                  </li>
                ))
              ) : upcomingEvents.length ? (
                upcomingEvents.map((event) => (
                  <li key={event.id} className="rounded-xl border border-gray-100 p-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {event.titre || event.nom}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {event.debut
                        ? dateFormatter.format(new Date(event.debut))
                        : "غير محدد"}
                    </p>
                    {event.lieu ? (
                      <p className="mt-1 text-xs text-gray-400">{event.lieu}</p>
                    ) : null}
                  </li>
                ))
              ) : (
                <EmptyState message="لا توجد فعاليات في الفترة القادمة" />
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-7">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">آخر الأخبار والإعلانات</h2>
              <button
                type="button"
                onClick={handleQuickNavigate("/dashboard/manager/news")}
                className="text-xs text-blue-600 hover:underline"
              >
                عرض الكل
              </button>
            </div>
            <ul className="mt-4 space-y-4">
              {actualitesQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <li key={idx} className="space-y-2">
                    <div className="h-4 w-56 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
                  </li>
                ))
              ) : latestActualites.length ? (
                latestActualites.map((item) => (
                  <li key={item.id} className="rounded-xl border border-gray-100 p-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {item.titre || item.title}
                    </p>
                    {item.created_at ? (
                      <p className="mt-1 text-xs text-gray-500">
                        {dateFormatter.format(new Date(item.created_at))}
                      </p>
                    ) : null}
                    {item.resume || item.description ? (
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                        {item.resume || item.description}
                      </p>
                    ) : null}
                  </li>
                ))
              ) : (
                <EmptyState message="لا توجد أخبار حديثة" />
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">الأطفال غير المسجّلين</h2>
              <p className="text-sm text-gray-500">سجّل الأطفال بسرعة في مجموعات مناسبة.</p>
            </div>
            <button
              type="button"
              onClick={() => openRegisterModal(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <span aria-hidden>＋</span>
              تسجيل طفل في مجموعة
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-right">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-xs font-semibold text-gray-500">
                    الطفل
                  </th>
                  <th scope="col" className="px-4 py-2 text-xs font-semibold text-gray-500">
                    تاريخ الميلاد
                  </th>
                  <th scope="col" className="px-4 py-2 text-xs font-semibold text-gray-500">
                    آخر تحديث
                  </th>
                  <th scope="col" className="px-4 py-2 text-xs font-semibold text-gray-500">
                    إجراء سريع
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {nonInscritsQuery.isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="h-4 w-40 rounded bg-gray-200" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-24 rounded bg-gray-200" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-20 rounded bg-gray-200" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-8 w-28 rounded bg-gray-200" />
                      </td>
                    </tr>
                  ))
                ) : nonInscrits.length ? (
                  nonInscrits.map((child) => (
                    <tr key={child.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {resolveChildName(child)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {child.date_naissance
                          ? dateFormatter.format(new Date(child.date_naissance))
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {child.updated_at
                          ? dateFormatter.format(new Date(child.updated_at))
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openRegisterModal(child)}
                          className="rounded-xl border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                        >
                          تسجيل في مجموعة
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                      لا يوجد أطفال في انتظار التسجيل حالياً.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">إجراءات سريعة</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <QuickActionButton
              icon="📦"
              label="إنشاء مجموعة جديدة"
              onClick={handleQuickNavigate("/dashboard/manager/groups")}
            />
            <QuickActionButton
              icon="👩‍🏫"
              label="تعيين مربٍّ لمجموعة"
              onClick={handleQuickNavigate("/dashboard/manager/groups")}
            />
            <QuickActionButton
              icon="🧒"
              label="تسجيل طفل في مجموعة"
              onClick={() => openRegisterModal(null)}
            />
            <QuickActionButton
              icon="📅"
              label="إنشاء حدث جديد"
              onClick={handleQuickNavigate("/dashboard/manager/events")}
            />
            <QuickActionButton
              icon="📢"
              label="إنشاء إعلان جديد"
              onClick={handleQuickNavigate("/dashboard/manager/news")}
            />
          </div>
        </div>
      </section>

      <Modal
        open={isRegisterModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="تسجيل طفل في مجموعة"
        description="ابحث عن الطفل وحدد المجموعة المناسبة ثم أكد التسجيل."
        size="lg"
      >
        <form className="space-y-4" onSubmit={handlePrepareRegistration}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="child-search">
              البحث عن الطفل
            </label>
            <input
              id="child-search"
              type="search"
              value={childSearch}
              onChange={(e) => setChildSearch(e.target.value)}
              placeholder="اكتب اسم الطفل أو لقبه"
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">اختر الطفل</p>
            <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-100">
              {searchNonInscritsQuery.isLoading ? (
                <div className="p-4 text-sm text-gray-500">جارٍ التحميل…</div>
              ) : (searchNonInscritsQuery.data || []).length ? (
                (searchNonInscritsQuery.data || []).map((child) => {
                  const id = String(child.id);
                  return (
                    <label
                      key={child.id}
                      className="flex cursor-pointer items-center gap-3 border-b border-gray-50 px-4 py-2 last:border-b-0 hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="child"
                        value={id}
                        checked={selectedChildId === id}
                        onChange={() => setSelectedChildId(id)}
                        className="h-4 w-4 accent-blue-600"
                      />
                      <span className="text-sm text-gray-800">{resolveChildName(child)}</span>
                    </label>
                  );
                })
              ) : (
                <div className="p-4 text-sm text-gray-500">لا يوجد أطفال مطابقون للبحث.</div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="group-select">
              اختر المجموعة
            </label>
            <select
              id="group-select"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر المجموعة</option>
              {groupOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRegisterModalOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              متابعة للتأكيد
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmPayload)}
        onClose={() => setConfirmPayload(null)}
        onConfirm={submitRegistration}
        loading={inscriptionMutation.isPending}
        title="تأكيد التسجيل"
        description={
          confirmPayload
            ? `هل تؤكد تسجيل ${confirmPayload.childName} في ${confirmPayload.groupName}؟`
            : ""
        }
        confirmText="تأكيد"
        cancelText="إلغاء"
      />
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
      {message}
    </div>
  );
}

function QuickActionButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-right shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <span className="text-sm font-semibold text-gray-800">{label}</span>
    </button>
  );
}
