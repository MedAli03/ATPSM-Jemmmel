// src/components/dashboard/DashboardHome.jsx
import { useEffect, useState } from "react";
import { getDashboardOverview } from "../../services/dashboard.api";
import DeltaBadge from "../common/DeltaBadge";

const StatCard = ({
  title,
  value,
  icon,
  tone = "blue",
  delta,
  deltaType = "pct",
}) => {
  const palettes = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      iconBg: "bg-blue-100",
      iconTxt: "text-blue-600",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-100",
      iconBg: "bg-green-100",
      iconTxt: "text-green-600",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-100",
      iconBg: "bg-purple-100",
      iconTxt: "text-purple-600",
    },
  };
  const p = palettes[tone];
  return (
    <div className={`${p.bg} rounded-lg p-4 border ${p.border}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-gray-700">{title}</h3>
        <div className={`${p.iconBg} p-2 rounded-full ${p.iconTxt}`}>
          {icon}
        </div>
      </div>

      <div className="mt-2 flex items-end gap-2">
        <p className="text-3xl font-bold">{value ?? "—"}</p>
        {delta !== undefined && (
          <DeltaBadge
            value={delta}
            suffix={deltaType === "pct" ? "%" : ""}
            positiveIsGood={true}
          />
        )}
      </div>
    </div>
  );
};

export default function DashboardHome() {
  const [data, setData] = useState(null);
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getDashboardOverview();
        if (!alive) return;
        setData(res);
        setState({ loading: false, error: "" });
      } catch (e) {
        setState({
          loading: false,
          error:
            e?.response?.data?.message ||
            "تعذر تحميل البيانات. يرجى المحاولة لاحقًا.",
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const skeleton = (
    <div className="animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="h-28 bg-gray-100 rounded" />
        <div className="h-28 bg-gray-100 rounded" />
        <div className="h-28 bg-gray-100 rounded" />
      </div>
      <div className="h-64 bg-gray-100 rounded" />
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6" dir="rtl">
      <h2 className="text-xl font-bold text-gray-800 mb-4">نظرة عامة</h2>

      {state.loading && skeleton}

      {!state.loading && state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4 mb-6">
          {state.error}
        </div>
      )}

      {!state.loading && !state.error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard
              title="المستخدمون"
              value={data?.users?.total}
              delta={data?.users?.deltaPct}
              deltaType="pct"
              tone="blue"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              }
            />

            <StatCard
              title="الأنشطة"
              value={data?.activities?.total}
              delta={data?.activities?.delta} // +عدد أنشطة جديدة
              deltaType="abs"
              tone="green"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
            />

            <StatCard
              title="التقارير"
              value={data?.reports?.total}
              delta={data?.reports?.deltaPct}
              deltaType="pct"
              tone="purple"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a 2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a 2 2 0 012 2v10m-6 0a2 2 0 002 2h2a 2 2 0 002-2m0 0V5a 2 2 0 012-2h2a 2 2 0 012 2v14a 2 2 0 01-2 2h-2a 2 2 0 01-2-2z"
                  />
                </svg>
              }
            />
          </div>

          {/* Last stats block (chart placeholder friendly to later plugging a real chart) */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              الإحصائيات الأخيرة
            </h3>

            {/* Simple bars without libs (works now). Replace with Chart.js later if you want. */}
            <div className="space-y-3">
              {(data?.series?.labels || []).map((label, i) => {
                const v = data.series.values[i] ?? 0;
                const width = Math.min(
                  100,
                  Math.round((v / Math.max(...data.series.values, 1)) * 100)
                );
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{label}</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded h-3">
                      <div
                        className="h-3 bg-indigo-500 rounded"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {!data?.series?.labels?.length && (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">لا توجد بيانات للعرض حاليًا</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
