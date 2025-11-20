import { useMemo } from "react";
import { motion } from "framer-motion";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import { useSiteOverview } from "../hooks/useSiteOverview";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ActivitiesPage = () => {
  const { data, isLoading } = useSiteOverview();

  const events = useMemo(() => {
    if (Array.isArray(data?.highlights?.events)) {
      return data.highlights.events;
    }
    return [];
  }, [data?.highlights?.events]);

  const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("ar-TN", { dateStyle: "medium" }).format(date);
  };

  const hasEvents = events.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-16" dir="rtl">
      <div className="mx-auto max-w-6xl px-4">
        <motion.h2
          className="text-3xl font-bold text-center text-indigo-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          فعالياتنا القادمة
        </motion.h2>
        <p className="mt-3 text-center text-sm text-slate-600">
          ندعوك للانضمام إلى ورشاتنا وأنشطتنا الداعمة للأطفال وأسرهم.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(isLoading && !hasEvents ? Array.from({ length: 3 }) : events).map((event, index) => (
            <motion.div
              key={event?.id || `placeholder-${index}`}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="flex h-full flex-col justify-between rounded-2xl border border-indigo-50 bg-white p-5 text-right shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900">{event?.titre || "فعالية قادمة"}</p>
                <p className="text-sm text-slate-600 line-clamp-3">
                  {event?.description || "ترقبوا تفاصيل هذه الفعالية قريبًا."}
                </p>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
                  <FiCalendar className="h-4 w-4" />
                  {formatDate(event?.debut) || "سيعلن قريبًا"}
                </div>
                {event?.lieu && (
                  <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
                    <FiMapPin className="h-4 w-4" />
                    {event.lieu}
                  </div>
                )}
                {event?.audience && (
                  <p className="text-xs text-slate-500">الفئة المستهدفة: {event.audience}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {!isLoading && !hasEvents && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-600">
            لا توجد فعاليات معلنة حاليًا، سنشارك الجدول القادم قريبًا.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesPage;
