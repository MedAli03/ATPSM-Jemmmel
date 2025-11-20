import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCalendar, FiChevronLeft, FiImage } from "react-icons/fi";
import { useSiteOverview } from "../hooks/useSiteOverview";
import { resolveApiAssetPath } from "../utils/url";

const MoreAboutNewsPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useSiteOverview();

  const article = useMemo(() => {
    const items = Array.isArray(data?.highlights?.news) ? data.highlights.news : [];
    return items.find((item) => String(item.id) === String(id));
  }, [data?.highlights?.news, id]);

  const imageSrc =
    resolveApiAssetPath(article?.couverture_url) || article?.couverture_url || null;

  const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("ar-TN", { dateStyle: "medium" }).format(date);
  };

  if (!article && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16" dir="rtl">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-700">
          <p className="text-lg font-semibold text-indigo-700">المقال غير متوفر</p>
          <p className="mt-2 text-sm">الخبر الذي تبحث عنه غير موجود أو لم يتم نشره بعد.</p>
          <Link
            to="/news"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
          >
            العودة إلى الأخبار
            <FiChevronLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-16" dir="rtl">
      <div className="mx-auto max-w-4xl px-4">
        <motion.div
          className="overflow-hidden rounded-3xl border border-indigo-50 bg-white shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="aspect-[5/3] bg-indigo-50">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={article?.titre}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-indigo-200">
                <FiImage className="h-12 w-12" />
              </div>
            )}
          </div>
          <div className="space-y-4 p-6 text-right">
            <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
              <FiCalendar className="h-4 w-4" />
              {formatDate(article?.publie_le) || "قريبًا"}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{article?.titre || "خبر"}</h1>
            <p className="text-sm leading-7 text-slate-700">
              {article?.resume || "سيتم نشر تفاصيل هذا الخبر قريبًا."}
            </p>
            <div className="pt-4">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
              >
                العودة إلى الأخبار
                <FiChevronLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MoreAboutNewsPage;
