import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiLoader,
  FiSearch,
  FiTag,
} from "react-icons/fi";
import { fetchSiteNews } from "../api/site";
import { resolveApiAssetPath } from "../utils/url";

const PAGE_SIZE = 9;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const MotionArticle = motion.article;
const MotionDiv = motion.div;

const NewsPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: PAGE_SIZE, total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchSiteNews({
      page,
      limit: PAGE_SIZE,
      search: query || undefined,
    })
      .then((payload) => {
        if (!active) return;

        const fetchedItems = Array.isArray(payload?.items) ? payload.items : [];

        setItems((prev) => {
          if (page === 1) {
            return fetchedItems;
          }

          const merged = [...prev];
          const existingIds = new Set(prev.map((item) => item.id));

          fetchedItems.forEach((item) => {
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
              ? fetchedItems.length
              : prev.total,
        }));

        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setError("تعذر تحميل الأخبار في الوقت الحالي. يرجى المحاولة لاحقًا.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [page, query, refreshIndex]);

  const hasMore = useMemo(() => {
    if (!meta?.limit || !meta?.page) return false;
    return meta.page * meta.limit < (meta.total || 0);
  }, [meta]);

  const [featured, ...rest] = items;

  const isInitialLoading = loading && page === 1 && items.length === 0;
  const isLoadingMore = loading && page > 1;

  const formatDate = (value) => {
    if (!value) return "قريبًا";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "قريبًا";
    return new Intl.DateTimeFormat("ar-TN", {
      dateStyle: "long",
    }).format(date);
  };

  const formatReadTime = (minutes) => {
    if (!minutes) return null;
    if (minutes < 2) return "دقيقة قراءة";
    if (minutes <= 10) return `${minutes} دقائق`;
    return `${minutes} دقيقة تقريبًا`;
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchTerm.trim());
  };

  const handleReset = () => {
    setSearchTerm("");
    setQuery("");
    setPage(1);
    setRefreshIndex((prev) => prev + 1);
  };

  const featuredCover = featured?.coverUrl
    ? resolveApiAssetPath(featured.coverUrl)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-28" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-indigo-700 via-indigo-600 to-sky-500 px-6 py-12 text-white shadow-2xl sm:px-10">
          <div
            className="pointer-events-none absolute -left-32 top-1/2 hidden h-72 w-72 -translate-y-1/2 rounded-full bg-white/10 blur-3xl lg:block"
            aria-hidden="true"
          />
            <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <div className="space-y-6 text-right">
              <div>
                <span className="text-sm font-semibold text-indigo-100/90">
                  آخر قصصنا
                </span>
                <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
                  أخبار جمعية الحمائم
                </h1>
              </div>
              <p className="max-w-xl text-sm text-indigo-100/90 sm:text-base sm:leading-8">
                نبقيكم على اطلاع على أبرز المبادرات، قصص النجاح، وبرامج الدعم التي
                تعمل عليها الجمعية مع الأطفال وأسرهم.
              </p>
              {featured ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-end gap-4 text-sm text-indigo-100">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="h-4 w-4" />
                      {formatDate(featured.publishedAt)}
                    </div>
                    {formatReadTime(featured.readTimeMinutes) && (
                      <div className="flex items-center gap-2">
                        <FiClock className="h-4 w-4" />
                        {formatReadTime(featured.readTimeMinutes)}
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-semibold leading-snug">
                    {featured.title}
                  </h2>
                  <p className="text-sm text-indigo-100/80 sm:text-base sm:leading-7">
                    {featured.summary || "قريبًا نشارككم تفاصيل مبادرات جديدة."}
                  </p>
                  <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-indigo-100/90">
                    {(Array.isArray(featured.tags) ? featured.tags : []).slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"
                      >
                        <FiTag className="h-3.5 w-3.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Link
                      to={`/news/${featured.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:-translate-y-0.5 hover:bg-slate-100"
                    >
                      اقرأ القصة الكاملة
                      <FiArrowLeft className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-white/10 p-6 text-sm text-indigo-50">
                  لا تتوفر أخبار منشورة في الوقت الحالي، ترقبوا جديدنا قريبًا.
                </div>
              )}
            </div>
            <MotionDiv
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6 }}
              className="relative hidden overflow-hidden rounded-3xl bg-white/5 shadow-2xl lg:block"
            >
              {featuredCover ? (
                <img
                  src={featuredCover}
                  alt={featured?.title}
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full min-h-[320px] items-center justify-center bg-gradient-to-br from-indigo-400/30 to-indigo-300/40">
                  <FiLoader className="h-12 w-12 animate-spin text-white/70" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-transparent to-sky-400/40" />
            </MotionDiv>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2 text-right">
              <span className="text-sm font-semibold text-indigo-600">أرشيف الأخبار</span>
              <h2 className="text-2xl font-bold text-slate-900">اكتشف المزيد من قصصنا</h2>
              <p className="max-w-2xl text-sm text-slate-600">
                تصفّح المقالات المنشورة، وابحث عن المواضيع التي تهمك حول برامج الجمعية والفعاليات والتوعية بطيف التوحد.
              </p>
            </div>
            <form onSubmit={handleSearch} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-80">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="ابحث في الأخبار..."
                  className="w-full rounded-full border border-slate-200 bg-white py-3 pr-5 pl-12 text-right text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  بحث
                </button>
                {query && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
                  >
                    تصفية النتائج
                  </button>
                )}
              </div>
            </form>
          </div>

          {error ? (
            <div className="mt-16 rounded-3xl border border-red-100 bg-red-50/60 p-8 text-right text-red-700">
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
            <div className="mt-12">
              {isInitialLoading && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="animate-pulse rounded-3xl border border-slate-100 bg-white p-6"
                    >
                      <div className="h-40 w-full rounded-2xl bg-slate-100" />
                      <div className="mt-6 h-5 w-3/4 rounded-full bg-slate-100" />
                      <div className="mt-4 h-4 w-full rounded-full bg-slate-100" />
                      <div className="mt-2 h-4 w-5/6 rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
              )}

              {!isInitialLoading && items.length === 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center text-slate-600 shadow-sm">
                  لا توجد أخبار متاحة حاليًا. تابعونا للاطلاع على جديد الجمعية قريبًا.
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((news) => {
                  const cover = news?.coverUrl
                    ? resolveApiAssetPath(news.coverUrl)
                    : null;

                  return (
                    <MotionArticle
                      key={news.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.4 }}
                      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative">
                        {cover ? (
                          <img
                            src={cover}
                            alt={news.title}
                            className="h-48 w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-slate-400">
                            <FiLoader className="h-8 w-8 animate-spin" />
                          </div>
                        )}
                        <div className="absolute inset-x-4 top-4 flex justify-end">
                          {news.pinned && (
                            <span className="rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-semibold text-white shadow-md">
                              خبر مميز
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col gap-4 p-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
                          <FiCalendar className="h-4 w-4" />
                          {formatDate(news.publishedAt)}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                          {news.title}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-3">
                          {news.summary}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          {formatReadTime(news.readTimeMinutes) && (
                            <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
                              <FiClock className="h-4 w-4" />
                              {formatReadTime(news.readTimeMinutes)}
                            </span>
                          )}
                          <Link
                            to={`/news/${news.id}`}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                          >
                            اقرأ المزيد
                            <FiArrowLeft className="h-4 w-4" />
                          </Link>
                        </div>
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

export default NewsPage;
