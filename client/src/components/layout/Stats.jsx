import { useMemo } from "react";
import {
  FiBookOpen,
  FiCalendar,
  FiHeart,
  FiLayers,
  FiUsers,
  FiUserCheck,
} from "react-icons/fi";
import { useSiteOverview } from "../../hooks/useSiteOverview";

const METRICS = [
  { key: "children", label: "الأطفال المستفيدون", icon: FiUsers, accent: "from-indigo-500 to-indigo-400" },
  { key: "parents", label: "الأسر المساندة", icon: FiHeart, accent: "from-rose-500 to-rose-400" },
  { key: "educators", label: "المختصون العاملون", icon: FiUserCheck, accent: "from-violet-500 to-violet-400" },
  { key: "activeGroups", label: "المجموعات النشطة", icon: FiLayers, accent: "from-emerald-500 to-emerald-400" },
  { key: "events", label: "فعاليات سنوية", icon: FiCalendar, accent: "from-sky-500 to-sky-400" },
  { key: "news", label: "أخبار منشورة", icon: FiBookOpen, accent: "from-amber-500 to-amber-400" },
];

const Stats = () => {
  const { data } = useSiteOverview();
  const stats = useMemo(() => data?.highlights?.stats || {}, [data?.highlights?.stats]);

  const formatNumber = (value) => {
    if (typeof value !== "number" || Number.isNaN(value)) return 0;
    return new Intl.NumberFormat("ar-TN").format(value);
  };

  return (
    <section className="relative -mt-12" dir="rtl">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-4xl border border-white/40 bg-gradient-to-br from-indigo-600 via-indigo-500 to-slate-900 p-10 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" aria-hidden="true" />
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl text-right">
              <span className="text-sm font-semibold text-indigo-100">أثر الجمعية بالأرقام</span>
              <h2 className="mt-3 text-3xl font-black leading-tight">نحتضن أطفال طيف التوحد وأسرهم برؤية علمية وإنسانية.</h2>
              <p className="mt-4 text-sm text-indigo-100/80">
                تعكس هذه المؤشرات البيانات الحية داخل منصتنا الرقمية وتبرز جهود الفرق الميدانية وشركائنا.
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3 text-xs text-indigo-100/70">
                <span>
                  {`يقود ${formatNumber(stats.educators)} مختص ${formatNumber(stats.children)} طفلًا عبر ${formatNumber(
                    stats.activeGroups
                  )} مجموعات نشطة.`}
                </span>
                <span>{`نواكب ${formatNumber(stats.parents)} أسرة بالاستشارات والتدريب.`}</span>
              </div>
            </div>
            <div className="grid w-full gap-5 sm:grid-cols-2 lg:w-auto lg:grid-cols-3">
              {METRICS.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.key}
                    className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur transition hover:border-white/40"
                  >
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${metric.accent}`} aria-hidden="true" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-100/80">{metric.label}</span>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="mt-4 text-3xl font-black">{formatNumber(stats[metric.key])}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
