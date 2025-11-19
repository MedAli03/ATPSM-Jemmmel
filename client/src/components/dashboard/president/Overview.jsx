// src/pages/dashboard/president/Overview.jsx
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOverview, activateYear } from "../../../api/dashboard.president";
import { getActiveAnnee } from "../../../api/annees";
import StatCard from "../../../components/dashboard/StatCard";
import WeeklyBar from "../../../components/dashboard/charts/WeeklyBar";
import PeiStatus from "../../../components/dashboard/charts/PeiStatus";
import Histogram from "../../../components/dashboard/charts/Histogram";
import SelectAnnee from "../../../components/dashboard/common/SelectAnnee";
import BroadcastForm from "../../../components/dashboard/forms/BroadcastForm";

export default function PresidentOverview() {
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

  const ovq = useQuery({
    queryKey: [
      "president",
      "overview",
      { anneeId, weeks: 8, bins: 10, limit: 8 },
    ],
    queryFn: () => getOverview({ anneeId, weeks: 8, bins: 10, limit: 8 }),
    enabled: anneeId !== undefined,
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

  const counters = ovq.data?.data?.counters;
  const peiStats = ovq.data?.data?.peiStats;
  const weekly = ovq.data?.data?.activitiesWeekly;
  const hist = ovq.data?.data?.evalDistribution;
  const latest = ovq.data?.data?.latestActualites || [];
  const events = ovq.data?.data?.upcomingEvents || [];

  return (
    <div className="p-4 space-y-4" dir="rtl">
      {/* Top actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="text-2xl font-bold">لوحة الرئيس</div>
        <div className="flex gap-3 items-center">
          <SelectAnnee value={anneeId ?? ""} onChange={setAnneeId} />
          <button
            onClick={() => act.mutate()}
            disabled={!anneeId || act.isPending}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50"
          >
            {act.isPending ? "جارٍ التفعيل..." : "تفعيل السنة"}
          </button>
        </div>
      </div>

      {/* Loading / error */}
      {ovq.isLoading && <div className="text-gray-500">جارٍ التحميل…</div>}
      {ovq.isError && (
        <div className="text-red-600">
          فشل التحميل:{" "}
          {ovq.error?.response?.data?.message || ovq.error?.message}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="عدد الأطفال" value={counters?.nbEnfants} />
        <StatCard label="عدد المربين" value={counters?.nbEducateurs} />
        <StatCard label="عدد الأولياء" value={counters?.nbParents} />
        <StatCard
          label="المجموعات النشطة"
          value={counters?.nbGroupesActifs}
          hint={counters?.anneeActive?.libelle}
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <WeeklyBar data={weekly} />
        <PeiStatus data={peiStats} />
      </div>

      <div>
        <Histogram data={hist} />
      </div>

      {/* Lists */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="font-semibold mb-2">آخر الأخبار</div>
          <ul className="space-y-2">
            {latest.length === 0 && (
              <li className="text-gray-500">لا توجد أخبار</li>
            )}
            {latest.map((a) => (
              <li key={a.id} className="border-b pb-2">
                <div className="font-medium">{a.titre}</div>
                <div className="text-sm text-gray-500">{a.publie_le}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="font-semibold mb-2">الفعاليات القادمة</div>
          <ul className="space-y-2">
            {events.length === 0 && (
              <li className="text-gray-500">لا توجد فعاليات</li>
            )}
            {events.map((e) => (
              <li key={e.id} className="border-b pb-2">
                <div className="font-medium">{e.titre}</div>
                <div className="text-sm text-gray-500">{e.debut}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Broadcast */}
      <BroadcastForm />
    </div>
  );
}
