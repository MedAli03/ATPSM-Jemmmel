import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiLoader,
  FiMapPin,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import { fetchSiteEvents } from "../api/site";

const PAGE_SIZE = 6;

const audienceLabels = {
  tous: "مفتوح للجميع",
  parents: "للأولياء",
  educateurs: "للمربين",
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const MotionAside = motion.aside;
const MotionArticle = motion.article;

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: PAGE_SIZE, total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchSiteEvents({
      page,
      limit: PAGE_SIZE,
      search: query || undefined,
      audience: audience === "all" ? undefined : audience,
    })
      .then((payload) => {
        if (!active) return;

        const fetchedEvents = Array.isArray(payload?.items) ? payload.items : [];

        setEvents((prev) => {
          if (page === 1) {
            return fetchedEvents;
          }

          const merged = [...prev];
          const existingIds = new Set(prev.map((item) => item.id));

          fetchedEvents.forEach((item) => {
            if (!existingIds.has(item.id)) {
              merged.push(item);
              existingIds.add(item.id);
            }
          });

          return merged;
        });

        const metaPayload = payload?.meta ?? {};
        setMeta((prev) => ({
          page: metaPayload.page ?? page,
          limit: metaPayload.limit ?? PAGE_SIZE,
          total:
            typeof metaPayload.total === "number"
              ? metaPayload.total
              : page === 1
              ? fetchedEvents.length
              : prev.total,
        }));

        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setError("تعذر تحميل الفعاليات حاليًا. يرجى المحاولة مرة أخرى لاحقًا.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [page, query, audience, refreshIndex]);

  const hasMore = useMemo(() => {
    if (!meta?.limit || !meta?.page) return false;
    return meta.page * meta.limit < (meta.total || 0);
  }, [meta]);

  const highlight = events[0] || null;
  const otherEvents = events.slice(1);

  const isInitialLoading = loading && page === 1 && events.length === 0;
  const isLoadingMore = loading && page > 1;

  const formatDateRange = (start, end) => {
    if (!start) return "سيتم الإعلان عن الموعد قريبًا";
    const startDate = new Date(start);
    if (Number.isNaN(startDate.getTime())) return "سيتم الإعلان عن الموعد قريبًا";

    if (!end) {
      return new Intl.DateTimeFormat("ar-TN", {
        dateStyle: "full",
        timeStyle: "short",
      }).format(startDate);
    }

    const endDate = new Date(end);
    const dateFormatter = new Intl.DateTimeFormat("ar-TN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const timeFormatter = new Intl.DateTimeFormat("ar-TN", {
      hour: "numeric",
      minute: "2-digit",
    });

    const sameDay = !Number.isNaN(endDate.getTime()) &&
      endDate.toDateString() === startDate.toDateString();

    if (sameDay) {
      return `${dateFormatter.format(startDate)} · ${timeFormatter.format(startDate)} - ${timeFormatter.format(endDate)}`;
    }

    if (!Number.isNaN(endDate.getTime())) {
      return `${dateFormatter.format(startDate)} ${timeFormatter.format(startDate)} — ${dateFormatter.format(endDate)} ${timeFormatter.format(endDate)}`;
    }

    return `${dateFormatter.format(startDate)} ${timeFormatter.format(startDate)}`;
  };

  const formatShortDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return {
      day: new Intl.DateTimeFormat("ar-TN", { day: "numeric" }).format(date),
      month: new Intl.DateTimeFormat("ar-TN", { month: "short" }).format(date),
    };
  };

  const formatDuration = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    if (!remaining) {
      return hours === 1 ? "ساعة واحدة" : `${hours} ساعات`;
    }
    return `${hours} س ${remaining} د`;
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchTerm.trim());
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setQuery("");
    setAudience("all");
    setPage(1);
    setRefreshIndex((prev) => prev + 1);
  };

  const timelineEvents = useMemo(() => events.slice(0, Math.min(events.length, 3)), [events]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-24 pt-28" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-sky-500 via-indigo-500 to-indigo-600 px-6 py-12 text-white shadow-2xl sm:px-10">
          <div className="absolute inset-y-0 left-0 hidden w-64 -skew-x-6 bg-white/10 blur-3xl lg:block" aria-hidden="true" />
          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <div className="space-y-6 text-right">
              <div>
                <span className="text-sm font-semibold text-indigo-100/90">فعاليات قادمة</span>
                <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
                  فعاليات جمعية الحمائم
                </h1>
              </div>
              <p className="max-w-xl text-sm text-indigo-100/90 sm:text-base sm:leading-8">
                نقدم ورشات عمل، لقاءات توعوية، وأنشطة مجتمعية لدعم الأطفال ذوي طيف التوحد وعائلاتهم وبناء شبكة تضامن فعّالة.
              </p>
              {highlight ? (
                <div className="space-y-4 rounded-3xl bg-white/15 p-6 shadow-lg backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                      {audienceLabels[highlight.audience] || "فعالية"}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-indigo-100/80">
                      {highlight.status === "upcoming" ? "قريبًا" : "فعالية سابقة"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold leading-snug">
                    {highlight.title}
                  </h2>
                  <p className="text-sm text-indigo-100/80 sm:text-base sm:leading-7">
                    {highlight.description || "انضم إلينا في فعالية مميزة تجمع العائلات والمهتمين لدعم الأطفال."}
                  </p>
                  <div className="space-y-2 text-sm text-indigo-100">
                    <div className="flex items-center justify-end gap-2">
                      <FiCalendar className="h-4 w-4" />
                      {formatDateRange(highlight.startsAt, highlight.endsAt)}
                    </div>
                    {highlight.location && (
                      <div className="flex items-center justify-end gap-2">
                        <FiMapPin className="h-4 w-4" />
                        {highlight.location}
                      </div>
                    )}
                    {formatDuration(highlight.durationMinutes) && (
                      <div className="flex items-center justify-end gap-2">
                        <FiClock className="h-4 w-4" />
                        {formatDuration(highlight.durationMinutes)}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <a
                      href="#events"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:-translate-y-0.5 hover:bg-slate-100"
                    >
                      استكشف كل الفعاليات
                      <FiArrowLeft className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl bg-white/10 p-6 text-sm text-indigo-50">
                  لا توجد فعاليات مجدولة حاليًا، سنشارككم المواعيد الجديدة فور تأكيدها.
                </div>
              )}
            </div>

            <MotionAside
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6 }}
              className="rounded-3xl bg-white/15 p-6 shadow-xl backdrop-blur"
            >
              <h3 className="text-lg font-semibold text-white">الجدول الزمني القريب</h3>
              <p className="mt-2 text-sm text-indigo-100/80">
                لمحة سريعة عن أقرب ثلاث فعاليات في أجندتنا.
              </p>
              <ul className="mt-6 space-y-4">
                {(timelineEvents.length ? timelineEvents : Array.from({ length: 3 })).map((event, index) => {
                  const dateParts = formatShortDate(event?.startsAt);
                  return (
                    <li
                      key={event?.id || `skeleton-${index}`}
                      className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 text-right"
                    >
                      <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-white/20 text-sm font-semibold text-white">
                        <span className="text-lg">{dateParts?.day || "--"}</span>
                        <span className="text-xs uppercase tracking-widest">
                          {dateParts?.month || "---"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white line-clamp-2">
                          {event?.title || "فعالية قادمة"}
                        </p>
                        <div className="mt-2 flex items-center justify-end gap-2 text-xs text-indigo-100/80">
                          <FiMapPin className="h-4 w-4" />
                          {event?.location || "سيحدد لاحقًا"}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </MotionAside>
          </div>
        </section>

        <section id="events" className="mt-16 rounded-3xl bg-white p-8 shadow-lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2 text-right">
              <span className="text-sm font-semibold text-indigo-600">تخطيط مشاركتك</span>
              <h2 className="text-2xl font-bold text-slate-900">جدول الفعاليات</h2>
              <p className="max-w-2xl text-sm text-slate-600">
                اختر الفعاليات التي تناسب اهتمامك أو احتياجات طفلك، وابحث ضمن الأنشطة حسب الفئة أو الكلمات المفتاحية.
              </p>
            </div>
            <form
              onSubmit={handleSearch}
              className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
            >
              <div className="relative w-full sm:w-64">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="ابحث عن فعالية"
                  className="w-full rounded-full border border-slate-200 bg-white py-3 pr-5 pl-12 text-right text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <select
                value={audience}
                onChange={(event) => {
                  setAudience(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-full border border-slate-200 bg-white py-3 px-5 text-right text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:w-48"
              >
                <option value="all">كل الفئات</option>
                <option value="tous">مفتوح للجميع</option>
                <option value="parents">للأولياء</option>
                <option value="educateurs">للمربين</option>
              </select>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  بحث
                </button>
                {(query || audience !== "all") && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
                  >
                    إعادة التصفية
                  </button>
                )}
              </div>
            </form>
          </div>

          {error ? (
            <div className="mt-12 rounded-3xl border border-red-100 bg-red-50/70 p-8 text-right text-red-700">
              <p className="font-semibold">{error}</p>
              <button
                type="button"
                onClick={() => setRefreshIndex((prev) => prev + 1)}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="mt-10">
              {isInitialLoading && (
                <div className="grid gap-6 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="animate-pulse rounded-3xl border border-slate-100 bg-white p-6"
                    >
                      <div className="h-5 w-24 rounded-full bg-slate-100" />
                      <div className="mt-4 h-6 w-3/4 rounded-full bg-slate-100" />
                      <div className="mt-3 h-4 w-full rounded-full bg-slate-100" />
                      <div className="mt-2 h-4 w-5/6 rounded-full bg-slate-100" />
                      <div className="mt-6 h-4 w-32 rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
              )}

              {!isInitialLoading && events.length === 0 && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-10 text-center text-slate-600">
                  لا توجد فعاليات متاحة وفقًا للبحث الحالي.
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {otherEvents.map((event) => {
                  const durationLabel = formatDuration(event.durationMinutes);
                  return (
                    <MotionArticle
                      key={event.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.4 }}
                      className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 text-right shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                          <FiUsers className="h-4 w-4" />
                          {audienceLabels[event.audience] || "فعالية"}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            event.status === "upcoming"
                              ? "text-emerald-600"
                              : "text-slate-500"
                          }`}
                        >
                          {event.status === "upcoming" ? "قريبًا" : "فعالية سابقة"}
                        </span>
                      </div>

                      <h3 className="mt-4 text-xl font-semibold text-slate-900">
                        {event.title}
                      </h3>
                      <p className="mt-3 text-sm text-slate-600 line-clamp-3">
                        {event.description || "تفاصيل الفعالية ستنشر قريبًا."}
                      </p>

                      <div className="mt-6 space-y-3 text-sm text-slate-600">
                        <div className="flex items-center justify-end gap-2">
                          <FiCalendar className="h-4 w-4 text-indigo-500" />
                          {formatDateRange(event.startsAt, event.endsAt)}
                        </div>
                        {event.location && (
                          <div className="flex items-center justify-end gap-2">
                            <FiMapPin className="h-4 w-4 text-indigo-500" />
                            {event.location}
                          </div>
                        )}
                        {durationLabel && (
                          <div className="flex items-center justify-end gap-2">
                            <FiClock className="h-4 w-4 text-indigo-500" />
                            {durationLabel}
                          </div>
                        )}
                      </div>
                    </MotionArticle>
                  );
                })}
              </div>

              {hasMore && !error && (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setPage((prev) => prev + 1)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <FiLoader className="h-4 w-4 animate-spin" /> جار التحميل...
                      </>
                    ) : (
                      "تحميل المزيد"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default EventsPage;
