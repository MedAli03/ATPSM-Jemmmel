import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiCalendar, FiChevronLeft, FiImage } from "react-icons/fi";
import { useSiteOverview } from "../hooks/useSiteOverview";
import { resolveApiAssetPath } from "../utils/url";

const NewsPage = () => {
  const { data, isLoading } = useSiteOverview();

  const articles = useMemo(() => {
    if (Array.isArray(data?.highlights?.news)) {
      return data.highlights.news.map((item) => ({
        ...item,
        couverture_url: resolveApiAssetPath(item?.couverture_url) || item?.couverture_url || null,
      }));
    }
    return [];
  }, [data?.highlights?.news]);

  const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("ar-TN", { dateStyle: "medium" }).format(date);
  };

  const hasContent = articles.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-16" dir="rtl">
      <div className="mx-auto max-w-6xl px-4">
        <motion.h1
          className="text-3xl font-bold text-center text-indigo-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          أخبارنا
        </motion.h1>
        <p className="mt-3 text-center text-sm text-slate-600">
          تابع أحدث الأنشطة والمستجدات الصادرة عن الجمعية.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(isLoading && !hasContent ? Array.from({ length: 3 }) : articles).map((news, index) => (
            <motion.article
              key={news?.id || `placeholder-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-indigo-50 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[4/3] bg-indigo-50">
                {news?.couverture_url ? (
                  <img
                    src={news.couverture_url}
                    alt={news.titre}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-indigo-200">
                    <FiImage className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col space-y-3 p-5 text-right">
                <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
                  <FiCalendar className="h-4 w-4" />
                  {formatDate(news?.publie_le) || "قريبًا"}
                </div>
                <h2 className="text-lg font-semibold text-slate-900 line-clamp-2">
                  {news?.titre || "خبر قادم"}
                </h2>
                <p className="text-sm text-slate-600 line-clamp-3">
                  {news?.resume || "ترقبوا قصصًا جديدة من أنشطة الجمعية."}
                </p>
                <div className="mt-auto">
                  <Link
                    to={news?.id ? `/news/${news.id}` : "#"}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 disabled:opacity-60"
                    onClick={(event) => {
                      if (!news?.id) {
                        event.preventDefault();
                      }
                    }}
                  >
                    اقرأ المزيد
                    <FiChevronLeft className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {!isLoading && !hasContent && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-600">
            لا توجد أخبار منشورة حاليًا، سنشارك آخر التحديثات قريبًا.
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
