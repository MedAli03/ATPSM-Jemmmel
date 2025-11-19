// src/pages/dashboard/president/Overview.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOverview, activateYear } from "../../../api/dashboard.president";
import { getActiveAnnee } from "../../../api/annees";
import StatCard from "../../../components/dashboard/StatCard";
import WeeklyBar from "../../../components/dashboard/charts/WeeklyBar";
import PeiStatus from "../../../components/dashboard/charts/PeiStatus";
import Histogram from "../../../components/dashboard/charts/Histogram";
import SelectAnnee from "../../../components/dashboard/common/SelectAnnee";
import BroadcastForm from "../../../components/dashboard/forms/BroadcastForm";
import { useToast } from "../../common/ToastProvider";

const numberFormatter = new Intl.NumberFormat("ar-TN-u-nu-latn");
const dateFormatter = new Intl.DateTimeFormat("ar-TN-u-nu-latn", {
  dateStyle: "medium",
});

function formatNumber(value) {
  if (value == null) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return numberFormatter.format(n);
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : dateFormatter.format(d);
}

export default function PresidentOverview() {
  const toast = useToast();
  const qc = useQueryClient();

  const { data: activeYear } = useQuery({
    queryKey: ["annees", "active"],
    queryFn: getActiveAnnee,
  });

  const [anneeId, setAnneeId] = useState();

  useEffect(() => {
    if (activeYear?.data?.id && anneeId === undefined) {
      setAnneeId(activeYear.data.id);
    }
  }, [activeYear?.data?.id, anneeId]);

  const filters = useMemo(() => ({ anneeId, weeks: 8, bins: 10, limit: 5 }), [
    anneeId,
  ]);

  const ovq = useQuery({
    queryKey: ["president", "overview", filters],
    queryFn: () => getOverview(filters),
    enabled: anneeId !== undefined,
  });

  const act = useMutation({
    mutationFn: () => activateYear(anneeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["annees"] });
      qc.invalidateQueries({ queryKey: ["annees", "active"] });
      qc.invalidateQueries({ queryKey: ["president", "overview"] });
      toast?.("تم تفعيل السنة بنجاح", "success");
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || error?.message || "تعذر تفعيل السنة";
      toast?.(message, "error");
    },
  });

  const counters = ovq.data?.data?.counters;
  const peiStats = ovq.data?.data?.peiStats;
  const weekly = ovq.data?.data?.activitiesWeekly;
  const hist = ovq.data?.data?.evalDistribution;
  const latest = ovq.data?.data?.latestActualites || [];
  const events = ovq.data?.data?.upcomingEvents || [];
  const unread = ovq.data?.data?.notifications?.unread ?? 0;

  const totalPei = peiStats
    ? Object.values(peiStats).reduce((sum, val) => sum + (Number(val) || 0), 0)
    : 0;

  const isLoading = ovq.isLoading || anneeId === undefined;
  const hasError = ovq.isError;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-2xl font-bold">لوحة الرئيس</div>
          {counters?.anneeActive?.libelle && (
            <div className="mt-1 text-sm text-gray-500">
              السنة الدراسية المفعّلة: {counters.anneeActive.libelle}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SelectAnnee value={anneeId ?? ""} onChange={setAnneeId} />
          <button
            onClick={() => act.mutate()}
            disabled={!anneeId || act.isPending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white shadow disabled:opacity-50"
          >
            {act.isPending ? "جارٍ التفعيل..." : "تفعيل السنة"}
          </button>
        </div>
      </div>

      {hasError && (
        <ErrorCard
          message={
            ovq.error?.response?.data?.message || ovq.error?.message || "فشل التحميل"
          }
          onRetry={() => ovq.refetch()}
        />
      )}

      {/* KPIs */}
      {isLoading ? (
        <StatGridSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <StatCard label="عدد الأطفال" value={formatNumber(counters?.nbEnfants)} />
          <StatCard label="عدد المربين" value={formatNumber(counters?.nbEducateurs)} />
          <StatCard label="عدد الأولياء" value={formatNumber(counters?.nbParents)} />
          <StatCard
            label="المجموعات النشطة"
            value={formatNumber(counters?.nbGroupesActifs)}
            hint={counters?.anneeActive?.libelle}
          />
          <StatCard
            label="الخطط التربوية الفردية"
            value={formatNumber(totalPei)}
          />
          <StatCard
            label="الإشعارات غير المقروءة"
            value={formatNumber(unread)}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartContainer
          title="النشاطات خلال الأسابيع الأخيرة"
          isLoading={isLoading || ovq.isFetching}
        >
          <WeeklyBar data={weekly} emptyLabel="لا توجد نشاطات مسجلة" />
        </ChartContainer>
        <ChartContainer
          title="حالة مشاريع PEI"
          isLoading={isLoading || ovq.isFetching}
        >
          <PeiStatus data={peiStats} emptyLabel="لا توجد خطط مسجلة" />
        </ChartContainer>
      </div>

      <ChartContainer
        title="توزيع الدرجات"
        isLoading={isLoading || ovq.isFetching}
      >
        <Histogram data={hist} emptyLabel="لا توجد تقييمات بعد" />
      </ChartContainer>

      {/* Lists */}
      <div className="grid gap-4 md:grid-cols-2">
        <ListCard
          title="آخر الأخبار"
          items={latest}
          emptyLabel="لا توجد أخبار"
          renderItem={(a) => (
            <div className="flex flex-col gap-1">
              <div className="font-medium text-gray-900">{a.titre}</div>
              <div className="text-sm text-gray-500">{formatDate(a.publie_le)}</div>
            </div>
          )}
          footerLink={{ label: "عرض جميع الأخبار", to: "/dashboard/president/news" }}
          isLoading={isLoading || ovq.isFetching}
        />

        <ListCard
          title="الفعاليات القادمة"
          items={events}
          emptyLabel="لا توجد فعاليات"
          renderItem={(e) => (
            <div className="flex flex-col gap-1">
              <div className="font-medium text-gray-900">{e.titre}</div>
              <div className="text-sm text-gray-500">{formatDate(e.debut)}</div>
            </div>
          )}
          footerLink={{ label: "عرض جميع الفعاليات", to: "/dashboard/president/events" }}
          isLoading={isLoading || ovq.isFetching}
        />
      </div>

      {/* Broadcast */}
      <BroadcastForm />
    </div>
  );
}

function StatGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-xl border bg-white p-4 shadow-sm"
        >
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="mt-3 h-6 w-16 rounded bg-gray-300" />
          <div className="mt-2 h-3 w-24 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function ErrorCard({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
      <div className="font-medium">{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg border border-rose-200 px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-100"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

function ChartContainer({ title, isLoading, children }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="border-b px-4 py-3 font-semibold text-gray-800">
        {title}
      </div>
      <div className="min-h-[260px] px-4 py-3">
        {isLoading ? <BlockSkeleton /> : children}
      </div>
    </div>
  );
}

function ListCard({ title, items, renderItem, emptyLabel, footerLink, isLoading }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-white">
      <div className="border-b px-4 py-3 font-semibold text-gray-800">{title}</div>
      <div className="flex-1 px-4 py-3">
        {isLoading ? (
          <ListSkeleton />
        ) : items?.length ? (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="border-b pb-3 last:border-none last:pb-0">
                {renderItem(item)}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">{emptyLabel}</div>
        )}
      </div>
      {footerLink ? (
        <div className="border-t bg-gray-50 px-4 py-2 text-sm">
          <Link to={footerLink.to} className="font-medium text-emerald-700 hover:underline">
            {footerLink.label}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function BlockSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-500" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="animate-pulse space-y-2 rounded-lg border bg-gray-50 p-3">
          <div className="h-3 w-1/2 rounded bg-gray-200" />
          <div className="h-3 w-1/3 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}
