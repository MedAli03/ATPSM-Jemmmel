import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiChevronLeft, FiMapPin } from "react-icons/fi";
import { useSiteOverview } from "../../hooks/useSiteOverview";

const BlogSection = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useSiteOverview();

  const news = useMemo(() => {
    if (Array.isArray(data?.highlights?.news)) {
      return data.highlights.news.slice(0, 4);
    }
    return [];
  }, [data?.highlights?.news]);

  const events = useMemo(() => {
    if (Array.isArray(data?.highlights?.events)) {
      return data.highlights.events.slice(0, 3);
    }
    return [];
  }, [data?.highlights?.events]);

  const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("ar-TN", { dateStyle: "medium" }).format(date);
  };

  return (
    <section className="relative mt-24 bg-slate-50 py-20" dir="rtl">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="text-right">
            <span className="text-sm font-semibold text-indigo-600">آخر المستجدات</span>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">أخبار الجمعية</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              اكتشف المبادرات والنجاحات التي يحققها فريق جمعية الحمائم مع الأطفال والأسر على مدار العام.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/news")}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500 px-5 py-3 text-sm font-semibold text-indigo-600 transition hover:-translate-y-0.5 hover:bg-indigo-500 hover:text-white"
          >
            كل الأخبار
            <FiArrowLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[2fr,1fr]">
          <div className="grid gap-6 sm:grid-cols-2">
            {(isLoading && news.length === 0 ? Array.from({ length: 4 }) : news).map((item, index) => (
              <article
                key={item?.id || `skeleton-${index}`}
                className="group relative overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  {item?.couverture_url ? (
                    <img
                      src={item.couverture_url}
                      alt={item.titre}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-indigo-400">
                      <FiChevronLeft className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="space-y-3 px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
                    <FiCalendar className="h-4 w-4" />
                    {formatDate(item?.publie_le) || "قريبًا"}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                    {item?.titre || "خبر قادم"}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {item?.resume || "ترقبوا قصصًا جديدة من رحلتنا مع الأطفال والأسر."}
                  </p>
                  <button
                    type="button"
                    onClick={() => item?.id && navigate(`/news/${item.id}`)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                    disabled={!item?.id}
                  >
                    اقرأ المزيد
                    <FiChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="flex h-full flex-col justify-between rounded-3xl border border-indigo-100 bg-white p-6 shadow-lg">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">الفعاليات القادمة</h3>
              <p className="mt-2 text-sm text-slate-600">
                انضم إلينا في لقاءات وورشات تدعم مهارات الأطفال وتبني مجتمعًا واعيًا بطيف التوحد.
              </p>
            </div>
            <ul className="mt-6 space-y-5">
              {(isLoading && events.length === 0 ? Array.from({ length: 3 }) : events).map((event, index) => (
                <li
                  key={event?.id || `event-skeleton-${index}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-right transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {event?.titre || "فعالية قريبة"}
                  </p>
                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-end gap-2">
                      <FiCalendar className="h-4 w-4" />
                      {formatDate(event?.debut) || "سيعلن قريبًا"}
                    </div>
                    {event?.lieu && (
                      <div className="flex items-center justify-end gap-2">
                        <FiMapPin className="h-4 w-4" />
                        {event.lieu}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => navigate("/events")}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
            >
              استكشف جميع الفعاليات
              <FiChevronLeft className="h-4 w-4" />
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
