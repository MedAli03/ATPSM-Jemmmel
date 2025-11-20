// src/pages/dashboard/president/Overview.jsx
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOverview, activateYear } from "../../../api/dashboard.president";
import { getActiveAnnee } from "../../../api/annees";
import StatCard from "../../../components/dashboard/StatCard";
import WeeklyBar from "../../../components/dashboard/charts/WeeklyBar";
import PeiStatus from "../../../components/dashboard/charts/PeiStatus";
import Histogram from "../../../components/dashboard/charts/Histogram";
import SelectAnnee from "../../../components/dashboard/common/SelectAnnee";
import BroadcastForm from "../../../components/dashboard/forms/BroadcastForm";

function SkeletonCard() {
  return <div className="h-28 rounded-xl bg-gray-100 animate-pulse" />;
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
      <div className="font-semibold mb-2">تعذر تحميل البيانات</div>
      <p className="text-sm mb-3">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}

function CardList({ title, items, emptyText }) {
  return (
    <div className="bg-white border rounded-xl p-4 h-full">
      <div className="font-semibold mb-2">{title}</div>
      {items.length === 0 ? (
        <div className="text-sm text-gray-500">{emptyText}</div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg bg-gray-50 px-3 py-2">
              <div className="font-medium text-gray-800">{item.title}</div>
              <div className="text-xs text-gray-500">{item.meta}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PresidentOverview() {
  const qc = useQueryClient();
  const [anneeId, setAnneeId] = useState(null);

  const { data: activeYear } = useQuery({
    queryKey: ["annees", "active"],
    queryFn: getActiveAnnee,
  });

  useEffect(() => {
    if (!anneeId && activeYear?.data?.id) {
      setAnneeId(activeYear.data.id);
    }
  }, [activeYear?.data?.id, anneeId]);

  const ovq = useQuery({
    queryKey: ["president", "overview", { anneeId, weeks: 8, bins: 10, limit: 5 }],
    queryFn: () => getOverview({ anneeId, weeks: 8, bins: 10, limit: 5 }),
    keepPreviousData: true,
  });

  const act = useMutation({
    mutationFn: () => activateYear(anneeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["annees"] });
      qc.invalidateQueries({ queryKey: ["annees", "active"] });
      qc.invalidateQueries({ queryKey: ["president", "overview"] });
      alert("تم تفعيل السنة بنجاح");
    },
  });

  const overview = ovq.data?.data || {};
  const counters = overview.counters || {};
  const peiStats = overview.peiStats || {};
  const weekly = overview.activitiesWeekly || [];
  const hist = overview.evalDistribution || { histogram: [] };
  const latest = overview.latestActualites || [];
  const events = overview.upcomingEvents || [];
  const unread = overview.notifications?.unread ?? 0;

  const totalPei = useMemo(
    () =>
      Object.values(peiStats || {}).reduce(
        (acc, v) => acc + (Number(v) || 0),
        0
      ),
    [peiStats]
  );

  const peiDistribution = useMemo(
    () => [
      { key: "EN_ATTENTE_VALIDATION", name: "في انتظار المصادقة", value: peiStats.EN_ATTENTE_VALIDATION || 0 },
      { key: "VALIDE", name: "مصادقة", value: peiStats.VALIDE || 0 },
      { key: "CLOTURE", name: "مغلَقة", value: peiStats.CLOTURE || 0 },
      { key: "REFUSE", name: "مرفوضة", value: peiStats.REFUSE || 0 },
    ],
    [peiStats]
  );

  const kpis = [
    { label: "عدد الأطفال", value: counters.nbEnfants, hint: "الأطفال المسجلون حاليًا" },
    { label: "عدد المربين", value: counters.nbEducateurs, hint: "المربّون النشطون" },
    { label: "عدد الأولياء", value: counters.nbParents, hint: "أولياء مفعّلون" },
    {
      label: "المجموعات النشطة",
      value: counters.nbGroupesActifs,
      hint: counters?.anneeActive?.libelle || "السنة الدراسية الحالية",
    },
    { label: "إجمالي مشاريع PEI", value: totalPei, hint: "حسب حالة المصادقة" },
    { label: "إشعارات غير مقروءة", value: unread, hint: "لدى حسابك" },
  ];

  const isLoading = ovq.isPending;
  const isError = ovq.isError;

  return (
    <div className="p-4 lg:p-6 space-y-5" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة الرئيس</h1>
          <p className="text-sm text-gray-500">نظرة شاملة على نشاط الجمعية والمستجدات</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SelectAnnee value={anneeId ?? ""} onChange={setAnneeId} />
          <button
            onClick={() => act.mutate()}
            disabled={!anneeId || act.isPending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {act.isPending ? "جارٍ التفعيل..." : "تفعيل السنة"}
          </button>
          <button
            onClick={() => ovq.refetch()}
            className="rounded-lg bg-white px-4 py-2 text-sm border text-gray-700 hover:bg-gray-50"
          >
            تحديث البيانات
          </button>
        </div>
      </div>

      {isError && (
        <ErrorState
          message={
            ovq.error?.response?.data?.message || ovq.error?.message || "حدث خطأ غير متوقع"
          }
          onRetry={ovq.refetch}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : kpis.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <WeeklyBar data={weekly} loading={isLoading} />
        <PeiStatus data={peiDistribution} loading={isLoading} />
      </div>

      <Histogram data={hist} loading={isLoading} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          <CardList
            title="آخر الأخبار"
            items={latest.map((a) => ({
              id: a.id,
              title: a.titre,
              meta: a.publie_le,
            }))}
            emptyText="لا توجد بيانات متاحة حاليًا"
          />
          <CardList
            title="الفعاليات القادمة"
            items={events.map((e) => ({ id: e.id, title: e.titre, meta: e.debut }))}
            emptyText="لا توجد بيانات متاحة حاليًا"
          />
        </div>
        <div className="bg-white border rounded-xl p-4 flex flex-col gap-3">
          <div className="font-semibold">بثّ إشعار فوري</div>
          <p className="text-sm text-gray-500">أرسل تحديثًا سريعًا لكلّ الأدوار أو لدور محدد.</p>
          <BroadcastForm />
        </div>
      </div>
    </div>
  );
}
