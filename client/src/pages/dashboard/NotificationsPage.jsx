import { useEffect, useMemo, useState } from "react";
import {
  useNotificationsPage,
  useNotificationMutations,
} from "../../hooks/useNotifications";

const STATUS_OPTS = [
  { value: "all", label: "الكل" },
  { value: "unread", label: "غير مقروءة" },
  { value: "read", label: "مقروءة" },
];

const TYPE_OPTS = [
  { value: "all", label: "جميع الأنواع" },
  { value: "actualite", label: "الأخبار" },
  { value: "evenement", label: "الفعاليات" },
  { value: "inscription", label: "المجموعات" },
  { value: "pei", label: "مشاريع PEI" },
  { value: "evaluation", label: "التقييمات" },
  { value: "activite", label: "الأنشطة" },
  { value: "note", label: "الملاحظات" },
  { value: "message", label: "الرسائل" },
];

const TYPE_BADGES = {
  actualite: { text: "خبر", class: "bg-blue-50 text-blue-700" },
  evenement: { text: "فعالية", class: "bg-violet-50 text-violet-700" },
  inscription: { text: "مجموعة", class: "bg-emerald-50 text-emerald-700" },
  affectation: { text: "تعيين", class: "bg-indigo-50 text-indigo-700" },
  pei: { text: "PEI", class: "bg-sky-50 text-sky-700" },
  evaluation: { text: "تقييم", class: "bg-amber-50 text-amber-700" },
  activite: { text: "نشاط", class: "bg-orange-50 text-orange-700" },
  note: { text: "ملاحظة", class: "bg-rose-50 text-rose-700" },
  recommandation: { text: "ذكاء اصطناعي", class: "bg-cyan-50 text-cyan-700" },
  message: { text: "رسالة", class: "bg-gray-100 text-gray-700" },
  document: { text: "وثيقة", class: "bg-slate-100 text-slate-600" },
  reglement: { text: "نظام", class: "bg-teal-50 text-teal-700" },
  info: { text: "معلومة", class: "bg-slate-100 text-slate-600" },
};

export default function NotificationsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({ page, pageSize, q, status, type }),
    [page, pageSize, q, status, type]
  );
  const { data, isLoading, isError, refetch, isFetching } =
    useNotificationsPage(params);
  const { markOne, markAll, remove } = useNotificationMutations();

  useEffect(() => {
    setPage(1);
  }, [q, status, type, pageSize]);

  const items = data?.items ?? [];
  const meta = data?.meta ?? {};
  const total = meta.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const unreadTotal = meta.unread ?? null;

  return (
    <div className="space-y-5" dir="rtl">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">الإشعارات</h1>
          <p className="text-sm text-slate-500">
            تصفح جميع الإشعارات مع إمكانيات البحث والتصفية وإدارتها.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21l-4.35-4.35M11 18a7 7 0 110-14 7 7 0 010 14z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <input
              className="w-64 bg-transparent pr-2 text-sm outline-none"
              placeholder="ابحث في العنوان أو المحتوى…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {TYPE_OPTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / صفحة
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
          >
            تحديث
          </button>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 text-sm text-slate-500">
          <div>
            إجمالي العناصر: <span className="font-medium text-slate-900">{total}</span>
          </div>
          {unreadTotal != null && (
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                غير مقروءة: {unreadTotal}
              </span>
              <button
                type="button"
                onClick={() => markAll.mutate()}
                className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:bg-slate-100"
              >
                تمييز الكل كمقروء
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="p-4">
            <div className="space-y-3 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 rounded bg-slate-100" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="p-6 text-sm text-rose-600">
            حدث خطأ أثناء تحميل البيانات.
            <button onClick={() => refetch()} className="mr-2 text-blue-600">
              إعادة المحاولة
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-slate-500">لا توجد نتائج مطابقة</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => (
              <li
                key={n.id}
                className={`flex flex-col gap-2 px-5 py-4 transition md:flex-row md:items-center ${
                  n.read ? "bg-white" : "bg-sky-50/70"
                }`}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    {badgeForType(n.type)}
                    <span>{n.read ? "مقروء" : "غير مقروء"}</span>
                    <span>{formatDate(n.createdAt)}</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {n.title || n.text || "—"}
                  </div>
                  {n.body && (
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{n.body}</p>
                  )}
                  {n.actionUrl && (
                    <a
                      href={n.actionUrl}
                      className="mt-2 inline-flex items-center text-xs font-medium text-blue-600 hover:underline"
                    >
                      الانتقال للصفحة
                      <svg className="mr-1 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 self-end md:self-auto">
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => markOne.mutate(n.id)}
                      className="rounded-full border border-emerald-200 px-3 py-1 text-xs text-emerald-600 transition hover:bg-emerald-500 hover:text-white"
                    >
                      تمييز كمقروء
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove.mutate(n.id)}
                    className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-600 transition hover:bg-rose-500 hover:text-white"
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
          <div>
            الصفحة <b>{page}</b> من <b>{lastPage}</b>
            {isFetching && <span className="ml-2 text-slate-400">(تحديث…)</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              السابق
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page >= lastPage}
            >
              التالي
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function badgeForType(type) {
  const badge = TYPE_BADGES[type] || TYPE_BADGES.info;
  return <span className={`rounded-full px-2 py-1 text-xs ${badge.class}`}>{badge.text}</span>;
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(+date)) return d;
  return new Intl.DateTimeFormat("ar-TN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
