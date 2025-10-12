// src/pages/dashboard/director/Dashboard.jsx
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import Modal from "../../../components/common/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { useToast } from "../../../components/common/ToastProvider";

import {
  listAnneesScolaires,
  getActiveAnneeScolaire,
} from "../../../api/annees";
import {
  getDirectorStats,
  getChildrenPerGroup,
  getMonthlyRegistrations,
  getFamilySituationDistribution,
} from "../../../api/stats";
import { getUpcomingEvents } from "../../../api/evenements";
import { getLatestActualites } from "../../../api/actualites";
import { listEnfantsNonInscrits } from "../../../api/enfants";
import { listGroupes } from "../../../api/groups";
import { createInscription } from "../../../api/inscriptions";

const numberFormatter = new Intl.NumberFormat("ar-TN", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("ar-TN", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("ar-TN", {
  year: "numeric",
  month: "short",
});

const pieColors = [
  "#2563eb",
  "#f97316",
  "#22c55e",
  "#ec4899",
  "#0ea5e9",
  "#a855f7",
  "#facc15",
  "#10b981",
];

function formatNumber(value) {
  const numeric = Number(value ?? 0);
  if (Number.isNaN(numeric)) return "0";
  return numberFormatter.format(numeric);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
}

function formatMonthLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return monthFormatter.format(date);
}

function EmptyState({ message }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
      {message}
    </div>
  );
}

function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="h-4 w-full animate-pulse rounded-full bg-gray-200/80"
        />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/50 border-t-transparent" />
    </div>
  );
}

function useErrorToast(error, toast, fallback) {
  useEffect(() => {
    if (!error) return;
    const message = error?.response?.data?.message || fallback;
    toast?.(message, "error");
  }, [error, toast, fallback]);
}

export default function DirectorDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const anneeId = searchParams.get("annee_id") || "";
  const dateFrom = searchParams.get("date_debut") || "";
  const dateTo = searchParams.get("date_fin") || "";

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [childSearch, setChildSearch] = useState("");
  const childInputRef = useRef(null);
  const deferredSearch = useDeferredValue(childSearch.trim());

  const anneesQuery = useQuery({
    queryKey: ["director", "annees-scolaires"],
    queryFn: listAnneesScolaires,
    staleTime: 5 * 60 * 1000,
  });

  const activeAnneeQuery = useQuery({
    queryKey: ["director", "annee-active"],
    queryFn: getActiveAnneeScolaire,
    staleTime: 5 * 60 * 1000,
  });

  useErrorToast(
    anneesQuery.error,
    toast,
    "تعذر تحميل قائمة السنوات الدراسية"
  );
  useErrorToast(
    activeAnneeQuery.error,
    toast,
    "تعذر تحديد السنة الدراسية النشطة"
  );

  useEffect(() => {
    if (!anneeId && activeAnneeQuery.data?.id) {
      const next = {};
      next.annee_id = String(activeAnneeQuery.data.id);
      if (dateFrom) next.date_debut = dateFrom;
      if (dateTo) next.date_fin = dateTo;
      setSearchParams(next, { replace: true });
    }
  }, [anneeId, activeAnneeQuery.data, dateFrom, dateTo, setSearchParams]);

  const statsQuery = useQuery({
    queryKey: [
      "director",
      "stats",
      { anneeId, dateFrom, dateTo },
    ],
    queryFn: () =>
      getDirectorStats({
        annee_id: anneeId,
        date_debut: dateFrom || undefined,
        date_fin: dateTo || undefined,
      }),
    enabled: Boolean(anneeId),
  });
  useErrorToast(statsQuery.error, toast, "تعذر تحميل الإحصائيات العامة");

  const groupesBarQuery = useQuery({
    queryKey: ["director", "children-per-group", { anneeId }],
    queryFn: () => getChildrenPerGroup({ annee_id: anneeId, limit: 10 }),
    enabled: Boolean(anneeId),
  });
  useErrorToast(
    groupesBarQuery.error,
    toast,
    "تعذر تحميل توزيع الأطفال حسب المجموعات"
  );

  const monthlyLineQuery = useQuery({
    queryKey: ["director", "monthly-registrations", { anneeId }],
    queryFn: () => getMonthlyRegistrations({ annee_id: anneeId }),
    enabled: Boolean(anneeId),
  });
  useErrorToast(
    monthlyLineQuery.error,
    toast,
    "تعذر تحميل منحنى التسجيلات"
  );

  const familyPieQuery = useQuery({
    queryKey: ["director", "family-distribution", { anneeId }],
    queryFn: () => getFamilySituationDistribution({ annee_id: anneeId }),
    enabled: Boolean(anneeId),
  });
  useErrorToast(
    familyPieQuery.error,
    toast,
    "تعذر تحميل توزيع الوضعية العائلية"
  );

  const eventsQuery = useQuery({
    queryKey: ["director", "upcoming-events", { anneeId }],
    queryFn: () => getUpcomingEvents({ annee_id: anneeId, limit: 5 }),
    enabled: Boolean(anneeId),
  });
  useErrorToast(eventsQuery.error, toast, "تعذر تحميل الفعاليات القادمة");

  const newsQuery = useQuery({
    queryKey: ["director", "latest-actualites"],
    queryFn: () => getLatestActualites({ limit: 5 }),
  });
  useErrorToast(newsQuery.error, toast, "تعذر تحميل آخر الأخبار");

  const nonInscritsQuery = useQuery({
    queryKey: ["director", "non-inscrits", { anneeId }],
    queryFn: () => listEnfantsNonInscrits({ annee_id: anneeId, limit: 8 }),
    enabled: Boolean(anneeId),
  });
  useErrorToast(
    nonInscritsQuery.error,
    toast,
    "تعذر تحميل قائمة الأطفال غير المسجلين"
  );

  const modalGroupsQuery = useQuery({
    queryKey: ["director", "groups", { anneeId }],
    queryFn: () => listGroupes({ anneeId, limit: 100 }),
    enabled: assignModalOpen && Boolean(anneeId),
  });
  useErrorToast(
    modalGroupsQuery.error,
    toast,
    "تعذر تحميل المجموعات المتاحة"
  );

  const modalChildrenQuery = useQuery({
    queryKey: [
      "director",
      "non-inscrits-search",
      { anneeId, search: deferredSearch },
    ],
    queryFn: () =>
      deferredSearch
        ? listEnfantsNonInscrits({
            annee_id: anneeId,
            limit: 25,
            q: deferredSearch,
          })
        : listEnfantsNonInscrits({ annee_id: anneeId, limit: 25 }),
    enabled: assignModalOpen && Boolean(anneeId),
    staleTime: 5_000,
  });
  useErrorToast(
    modalChildrenQuery.error,
    toast,
    "تعذر تحميل الأطفال للبحث"
  );

  const inscriptionMutation = useMutation({
    mutationFn: ({ enfantId, groupeId }) =>
      createInscription({
        enfant_id: enfantId,
        groupe_id: groupeId,
        annee_id: anneeId,
      }),
    onSuccess: () => {
      toast?.("تم تسجيل الطفل بنجاح ✅", "success");
      setConfirmOpen(false);
      setAssignModalOpen(false);
      setSelectedChild(null);
      setSelectedGroupId("");
      queryClient.invalidateQueries({ queryKey: ["director", "stats"] });
      queryClient.invalidateQueries({
        queryKey: ["director", "non-inscrits"],
      });
      queryClient.invalidateQueries({
        queryKey: ["director", "children-per-group"],
      });
      queryClient.invalidateQueries({
        queryKey: ["director", "monthly-registrations"],
      });
    },
    onError: (error) => {
      toast?.(
        error?.response?.data?.message || "تعذر تسجيل الطفل في المجموعة",
        "error"
      );
    },
  });

  useEffect(() => {
    if (assignModalOpen) {
      setChildSearch("");
      setSelectedGroupId("");
      setTimeout(() => childInputRef.current?.focus?.(), 100);
    } else {
      setSelectedChild(null);
      setSelectedGroupId("");
      setChildSearch("");
    }
  }, [assignModalOpen]);

  const {
    enfants_total: totalEnfants = 0,
    groupes_actifs: totalGroupesActifs = 0,
    groupes_archive: totalGroupesArchives = 0,
    educateurs_total: totalEducateurs = 0,
    enfants_sans_groupe: totalSansGroupe = 0,
    inscriptions_en_attente: totalInscriptionsEnAttente = 0,
  } = statsQuery.data ?? {};

  const kpis = useMemo(
    () => [
      {
        id: "enfants_total",
        label: "إجمالي الأطفال",
        value: totalEnfants,
        accent: "from-sky-500/10 to-blue-500/10 text-blue-700",
        icon: (
          <svg
            className="h-10 w-10 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 14c4.418 0 8 1.79 8 4v2H4v-2c0-2.21 3.582-4 8-4zm0-10a4 4 0 110 8 4 4 0 010-8z"
            />
          </svg>
        ),
      },
      {
        id: "groupes_actifs",
        label: "مجموعات نشطة",
        value: totalGroupesActifs,
        accent: "from-emerald-500/10 to-emerald-600/10 text-emerald-700",
        icon: (
          <svg
            className="h-10 w-10 text-emerald-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M7 7h10v10H7z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M3 11l9-9 9 9M9 21h6"
            />
          </svg>
        ),
        hint: totalGroupesArchives,
        hintLabel: "مؤرشفة",
      },
      {
        id: "educateurs_total",
        label: "عدد المربّين",
        value: totalEducateurs,
        accent: "from-violet-500/10 to-indigo-500/10 text-indigo-700",
        icon: (
          <svg
            className="h-10 w-10 text-indigo-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M17 20h5v-2a6 6 0 00-9-5.197M7 20H2v-2a6 6 0 019-5.197"
            />
            <circle cx="12" cy="7" r="4" strokeWidth="1.5" />
          </svg>
        ),
      },
      {
        id: "enfants_sans_groupe",
        label: "أطفال بلا مجموعة",
        value: totalSansGroupe,
        accent: "from-amber-500/10 to-amber-600/10 text-amber-700",
        icon: (
          <svg
            className="h-10 w-10 text-amber-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9.75 9a3 3 0 104.5 0m2.75 6a6 6 0 00-10.5 0"
            />
          </svg>
        ),
      },
      {
        id: "inscriptions_en_attente",
        label: "طلبات قيد المعالجة",
        value: totalInscriptionsEnAttente,
        accent: "from-rose-500/10 to-rose-600/10 text-rose-700",
        icon: (
          <svg
            className="h-10 w-10 text-rose-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 8v4l3 2"
            />
            <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
          </svg>
        ),
      },
    ],
    [
      totalEnfants,
      totalGroupesActifs,
      totalGroupesArchives,
      totalEducateurs,
      totalSansGroupe,
      totalInscriptionsEnAttente,
    ]
  );

  const groupesData = useMemo(
    () =>
      (groupesBarQuery.data ?? []).map((row) => ({
        nom: row?.nom || row?.name || "—",
        enfants: Number(row?.enfants ?? row?.total ?? 0),
      })),
    [groupesBarQuery.data]
  );

  const monthlyData = useMemo(
    () =>
      (monthlyLineQuery.data ?? []).map((row) => ({
        mois: formatMonthLabel(row?.mois || row?.month),
        value: Number(row?.total ?? row?.inscriptions ?? 0),
      })),
    [monthlyLineQuery.data]
  );

  const pieData = useMemo(
    () =>
      (familyPieQuery.data ?? []).map((row) => ({
        name: row?.label || row?.situation || "غير محدد",
        value: Number(row?.value ?? row?.total ?? 0),
      })),
    [familyPieQuery.data]
  );

  const upcomingEvents = eventsQuery.data ?? [];
  const latestNews = newsQuery.data ?? [];
  const nonInscrits = nonInscritsQuery.data ?? [];

  const modalChildren = useMemo(() => {
    const raw = modalChildrenQuery.data ?? [];
    if (!selectedChild?.id) return raw;
    const exists = raw.some((child) => child?.id === selectedChild.id);
    return exists ? raw : [selectedChild, ...raw];
  }, [modalChildrenQuery.data, selectedChild]);

  const modalGroups = modalGroupsQuery.data ?? [];

  const selectedGroup = modalGroups.find((g) => String(g?.id) === selectedGroupId);

  const handleSelectChange = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  };

  const handleAssignRequest = () => {
    if (!selectedChild || !selectedGroupId) {
      toast?.("اختر طفلاً ومجموعة أولاً", "error");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmAssign = () => {
    if (!selectedChild || !selectedGroupId) return;
    inscriptionMutation.mutate({
      enfantId: selectedChild.id,
      groupeId: Number(selectedGroupId),
    });
  };

  const quickActions = [
    {
      id: "create-group",
      label: "إنشاء مجموعة جديدة",
      onClick: () =>
        navigate(
          `/dashboard/president/groups${
            anneeId ? `?anneeId=${encodeURIComponent(anneeId)}` : ""
          }`
        ),
      color: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      id: "assign-educator",
      label: "تعيين مربٍّ لمجموعة",
      onClick: () =>
        navigate(
          `/dashboard/president/groups${
            anneeId
              ? `?anneeId=${encodeURIComponent(anneeId)}&view=educateurs`
              : "?view=educateurs"
          }`
        ),
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      id: "register-child",
      label: "تسجيل طفل في مجموعة",
      onClick: () => setAssignModalOpen(true),
      color: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      id: "create-event",
      label: "إنشاء حدث جديد",
      onClick: () => navigate("/dashboard/president/events"),
      color: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      id: "create-news",
      label: "إنشاء إعلان جديد",
      onClick: () => navigate("/dashboard/president/news"),
      color: "bg-rose-50 text-rose-700 border-rose-100",
    },
  ];

  return (
    <div className="space-y-6" dir="rtl" aria-label="لوحة المدير">
      <section className="sticky top-0 z-30 space-y-4 rounded-3xl border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">لوحة المدير</h1>
              <p className="text-sm text-gray-500">
                تابع مؤشرات السنة الدراسية وقراراتك اليومية في مكان واحد.
              </p>
            </div>
            <div className="text-xs text-gray-400">
              البيانات محدثة كل 10 دقائق
            </div>
          </div>
        </div>

        <form
          className="grid gap-4 md:grid-cols-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">السنة الدراسية</span>
            <select
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={anneeId}
              onChange={(event) => handleSelectChange("annee_id", event.target.value)}
              aria-label="اختيار السنة الدراسية"
            >
              <option value="" disabled>
                {anneesQuery.isLoading ? "جار التحميل…" : "اختر السنة"}
              </option>
              {(anneesQuery.data ?? []).map((annee) => (
                <option key={annee?.id} value={annee?.id}>
                  {annee?.libelle || annee?.label || `سنة ${annee?.id}`}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">من تاريخ</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) =>
                handleSelectChange("date_debut", event.target.value)
              }
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label="تاريخ البداية"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">إلى تاريخ</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) =>
                handleSelectChange("date_fin", event.target.value)
              }
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label="تاريخ النهاية"
            />
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete("date_debut");
                next.delete("date_fin");
                setSearchParams(next, { replace: true });
              }}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              تصفية افتراضية
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statsQuery.isLoading
          ? Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <LoadingSkeleton rows={4} />
              </div>
            ))
          : kpis.map((item) => (
              <article
                key={item.id}
                className={`group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                aria-label={item.label}
              >
                <div
                  className={`absolute -top-16 left-12 h-32 w-32 rounded-full bg-gradient-to-br ${item.accent} opacity-40 blur-3xl transition group-hover:opacity-70`}
                  aria-hidden="true"
                />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-500">
                      {item.label}
                    </span>
                    <div className="mt-2 text-3xl font-black text-gray-900">
                      {formatNumber(item.value)}
                    </div>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-white/70 p-2 shadow-inner">
                    {item.icon}
                  </div>
                </div>
                {item.hint != null ? (
                  <p className="mt-4 text-xs text-gray-500">
                    {item.hintLabel || ""}: {formatNumber(item.hint)}
                  </p>
                ) : null}
              </article>
            ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                الأطفال لكل مجموعة (أعلى 10)
              </h2>
              <p className="text-xs text-gray-500">
                ترتيب تنازلي حسب عدد الأطفال المسجلين في كل مجموعة.
              </p>
            </div>
          </div>
          {groupesBarQuery.isLoading ? (
            <ChartSkeleton />
          ) : groupesData.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupesData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tickFormatter={formatNumber} stroke="#475569" />
                  <YAxis dataKey="nom" type="category" width={120} stroke="#475569" />
                  <Tooltip
                    formatter={(value) => formatNumber(value)}
                    labelFormatter={(label) => `المجموعة: ${label}`}
                  />
                  <Bar dataKey="enfants" fill="#2563eb" radius={[0, 12, 12, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message="لا توجد بيانات متاحة للمجموعات" />
          )}
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                التسجيلات الشهرية (آخر 12 شهرًا)
              </h2>
              <p className="text-xs text-gray-500">
                رصد تطور التسجيلات لمتابعة الذروة والانخفاضات.
              </p>
            </div>
          </div>
          {monthlyLineQuery.isLoading ? (
            <ChartSkeleton />
          ) : monthlyData.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                  <XAxis dataKey="mois" stroke="#475569" />
                  <YAxis tickFormatter={formatNumber} stroke="#475569" />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="عدد التسجيلات"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message="لا توجد بيانات تسجيلات شهرية" />
          )}
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                توزيع الوضعية العائلية
              </h2>
              <p className="text-xs text-gray-500">
                فهم خلفيات العائلات يساعد على دعمهم بفعالية.
              </p>
            </div>
          </div>
          {familyPieQuery.isLoading ? (
            <ChartSkeleton />
          ) : pieData.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ name, value }) => `${name}: ${formatNumber(value)}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message="لا توجد بيانات للوضعية العائلية" />
          )}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                الأحداث القادمة
              </h2>
              <p className="text-xs text-gray-500">
                أبرز الأنشطة خلال الأيام القادمة.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/dashboard/president/events")}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 transition hover:bg-gray-50"
            >
              عرض الكل
            </button>
          </div>
          {eventsQuery.isLoading ? (
            <LoadingSkeleton rows={6} />
          ) : upcomingEvents.length ? (
            <ul className="space-y-4">
              {upcomingEvents.map((event) => (
                <li
                  key={event?.id || event?.slug}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-gray-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {event?.titre || event?.title || "حدث بدون عنوان"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {event?.lieu ? `المكان: ${event.lieu}` : ""}
                    </div>
                  </div>
                  <div className="text-right text-xs text-blue-600">
                    {formatDate(event?.date_debut || event?.date || event?.starts_at)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="لا توجد فعاليات مسجلة" />
          )}
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">آخر الإعلانات</h2>
            <p className="text-xs text-gray-500">
              أحدث المستجدات التي تمت مشاركتها مع العائلات والفريق.
            </p>
          </div>
          {newsQuery.isLoading ? (
            <LoadingSkeleton rows={6} />
          ) : latestNews.length ? (
            <ul className="space-y-4">
              {latestNews.map((item) => (
                <li key={item?.id || item?.slug} className="rounded-2xl border border-gray-100 p-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {item?.titre || item?.title || "عنوان غير متوفر"}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {formatDate(item?.published_at || item?.created_at)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="لا توجد إعلانات حديثة" />
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                أطفال غير مسجّلين
              </h2>
              <p className="text-xs text-gray-500">
                أسرع بربطهم بالمجموعات المناسبة قبل بداية الأنشطة.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAssignModalOpen(true)}
              className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700 transition hover:bg-amber-100"
            >
              تسجيل سريع
            </button>
          </div>
          {nonInscritsQuery.isLoading ? (
            <LoadingSkeleton rows={6} />
          ) : nonInscrits.length ? (
            <ul className="space-y-3">
              {nonInscrits.map((child) => (
                <li
                  key={child?.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 p-4"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {child?.nom && child?.prenom
                        ? `${child.prenom} ${child.nom}`
                        : child?.full_name || "اسم غير متوفر"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(child?.date_naissance)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignModalOpen(true);
                      setSelectedChild(child);
                    }}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700 transition hover:bg-blue-100"
                    aria-label="تسجيل الطفل"
                  >
                    تسجيل الآن
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="جميع الأطفال مسجلون في مجموعات" />
          )}
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">إجراءات سريعة</h2>
            <p className="text-xs text-gray-500">
              روابط فورية لتسريع أهم العمليات اليومية للمدير.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={action.onClick}
                className={`flex h-full flex-col justify-between gap-3 rounded-2xl border px-4 py-4 text-right text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow ${action.color}`}
              >
                <span>{action.label}</span>
                <span className="text-[11px] font-normal text-gray-500">
                  اضغط للمتابعة
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Modal
        open={assignModalOpen}
        onClose={() => {
          if (inscriptionMutation.isPending) return;
          setAssignModalOpen(false);
        }}
        title="تسجيل طفل في مجموعة"
        description="اختر الطفل والمجموعة ثم أكد العملية"
        size="lg"
        initialFocusRef={childInputRef}
        footer={
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-gray-500">
              سيتم حفظ التسجيل فور التأكيد.
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                disabled={inscriptionMutation.isPending}
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleAssignRequest}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
                disabled={inscriptionMutation.isPending}
              >
                متابعة
              </button>
            </div>
          </div>
        }
      >
        <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
          <div className="space-y-2">
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              <span>ابحث عن الطفل</span>
              <input
                ref={childInputRef}
                type="search"
                value={childSearch}
                onChange={(event) => setChildSearch(event.target.value)}
                placeholder="اكتب الاسم أو الرقم الوطني"
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <div className="max-h-52 space-y-2 overflow-y-auto rounded-2xl border border-gray-100 p-2">
              {modalChildrenQuery.isLoading ? (
                <LoadingSkeleton rows={6} />
              ) : modalChildren.length ? (
                modalChildren.map((child) => {
                  const childLabel = child?.nom && child?.prenom
                    ? `${child.prenom} ${child.nom}`
                    : child?.full_name || "اسم غير متوفر";
                  const isSelected = selectedChild?.id === child?.id;
                  return (
                    <label
                      key={child?.id}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-sm transition ${
                        isSelected
                          ? "border-blue-200 bg-blue-50"
                          : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-gray-900">
                          {childLabel}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(child?.date_naissance)}
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="selectedChild"
                        checked={isSelected}
                        onChange={() => setSelectedChild(child)}
                        className="h-4 w-4"
                      />
                    </label>
                  );
                })
              ) : (
                <EmptyState message="لا يوجد أطفال مطابقون لبحثك" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              <span>اختر المجموعة</span>
              <select
                value={selectedGroupId}
                onChange={(event) => setSelectedGroupId(event.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">
                  {modalGroupsQuery.isLoading
                    ? "جار التحميل…"
                    : "اختر المجموعة"}
                </option>
                {modalGroups.map((group) => (
                  <option key={group?.id} value={group?.id}>
                    {group?.nom || group?.name || `مجموعة ${group?.id}`}
                  </option>
                ))}
              </select>
            </label>
            {!modalGroups.length && !modalGroupsQuery.isLoading ? (
              <p className="text-xs text-amber-600">
                لا توجد مجموعات متاحة في هذه السنة الدراسية.
              </p>
            ) : null}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          if (inscriptionMutation.isPending) return;
          setConfirmOpen(false);
        }}
        onConfirm={handleConfirmAssign}
        loading={inscriptionMutation.isPending}
        title="تأكيد التسجيل"
        description={
          selectedChild && selectedGroup
            ? `هل تريد تسجيل ${
                selectedChild?.nom && selectedChild?.prenom
                  ? `${selectedChild.prenom} ${selectedChild.nom}`
                  : selectedChild?.full_name || "هذا الطفل"
              } في مجموعة ${selectedGroup?.nom || selectedGroup?.name}?`
            : "يرجى اختيار طفل ومجموعة"
        }
        confirmText="تأكيد"
        cancelText="إلغاء"
      />
    </div>
  );
}
