import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiLoader,
  FiTag,
} from "react-icons/fi";
import { fetchSiteNewsArticle } from "../api/site";
import { resolveApiAssetPath } from "../utils/url";

const MotionArticle = motion.article;

const MoreAboutNewsPage = () => {
  const { id } = useParams();
  const numericId = Number(id);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    if (!Number.isFinite(numericId)) {
      setError("المقال غير موجود");
      setLoading(false);
      return () => {
        /* noop */
      };
    }

    fetchSiteNewsArticle(numericId)
      .then((payload) => {
        if (!active) return;
        setArticle(payload);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setError("تعذر العثور على هذا المقال أو أنه لم يعد متاحًا.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [numericId]);

  const cover = useMemo(() => {
    if (!article?.coverUrl) return null;
    return resolveApiAssetPath(article.coverUrl);
  }, [article?.coverUrl]);

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

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-28" dir="rtl">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <FiLoader className="h-10 w-10 animate-spin text-indigo-500" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50/70 p-10 text-center text-red-700">
            <p className="text-lg font-semibold">{error}</p>
            <Link
              to="/news"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              العودة إلى الأخبار
              <FiArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <MotionArticle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="relative h-72 sm:h-96">
              {cover ? (
                <img
                  src={cover}
                  alt={article?.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 via-sky-100 to-slate-100">
                  <FiLoader className="h-10 w-10 animate-spin text-indigo-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 space-y-4 px-6 pb-6 text-white sm:px-10">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-100/90">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="h-4 w-4" />
                    {formatDate(article?.publishedAt)}
                  </div>
                  {formatReadTime(article?.readTimeMinutes) && (
                    <div className="flex items-center gap-2">
                      <FiClock className="h-4 w-4" />
                      {formatReadTime(article?.readTimeMinutes)}
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold leading-snug sm:text-3xl">
                  {article?.title}
                </h1>
                <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
                  {(Array.isArray(article?.tags) ? article.tags : []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 font-semibold"
                    >
                      <FiTag className="h-3.5 w-3.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8 px-6 pb-10 pt-8 sm:px-10">
              {article?.author?.name && (
                <div className="flex items-center justify-end gap-3 text-sm text-slate-500">
                  <span>بقلم: {article.author.name}</span>
                  {article.author.email && (
                    <span className="text-slate-400">{article.author.email}</span>
                  )}
                </div>
              )}

              <div
                className="space-y-6 text-right text-base leading-8 text-slate-700 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900 [&_p]:text-slate-700 [&_ul]:list-disc [&_ul]:pr-6 [&_ol]:list-decimal [&_ol]:pr-6 [&_li]:my-1"
                dangerouslySetInnerHTML={{ __html: article?.contentHtml || article?.summary || "" }}
              />

              {Array.isArray(article?.gallery) && article.gallery.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-900">لحظات من الفعالية</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {article.gallery.map((item) => {
                      const src = resolveApiAssetPath(item);
                      return (
                        <img
                          key={item}
                          src={src || undefined}
                          alt=""
                          className="h-48 w-full rounded-2xl object-cover"
                          loading="lazy"
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Link
                  to="/news"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
                >
                  العودة إلى الأخبار
                  <FiArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </MotionArticle>
        )}
      </div>
    </div>
  );
};

export default MoreAboutNewsPage;
