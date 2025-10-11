import { useEffect, useMemo, useState } from "react";
import { useNotificationsPage } from "../../hooks/useNotifications";

const STATUS_OPTS = [
  { value: "all", label: "الكل" },
  { value: "unread", label: "غير مقروءة" },
  { value: "read", label: "مقروءة" },
];

const TYPE_OPTS = [
  { value: "all", label: "جميع الأنواع" },
  { value: "news", label: "الأخبار" },
  { value: "event", label: "الفعاليات" },
  { value: "reminder", label: "تذكير" },
  { value: "info", label: "معلومات" },
];

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

  useEffect(() => {
    setPage(1);
  }, [q, status, type, pageSize]); // reset to page 1 on filters change

  const total = data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const items = data?.items ?? [];

  return (
    <div className="space-y-4" dir="rtl">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
          <p className="text-sm text-gray-500">
            تصفح وأدِر الإشعارات مع البحث والتصفية والصفحات.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 border">
            <svg
              className="w-5 h-5 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21 21l-4.35-4.35M11 18a7 7 0 110-14 7 7 0 010 14z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <input
              className="bg-transparent outline-none pr-2 w-64 text-sm"
              placeholder="ابحث في العنوان/المحتوى…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2 rounded-xl border bg-white text-sm"
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
            className="px-3 py-2 rounded-xl border bg-white text-sm"
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
            className="px-3 py-2 rounded-xl border bg-white text-sm"
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
            onClick={() => refetch()}
            className="px-3 py-2 rounded-xl border text-sm hover:bg-gray-50"
          >
            تحديث
          </button>
        </div>
      </header>

      <section className="bg-white border rounded-2xl shadow-sm">
        {/* table header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b text-sm text-gray-500">
          <div className="col-span-5">العنوان / المحتوى</div>
          <div className="col-span-2">النوع</div>
          <div className="col-span-2">الحالة</div>
          <div className="col-span-3">التاريخ</div>
        </div>

        {/* body */}
        {isLoading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="p-6 text-red-600">
            حدث خطأ أثناء تحميل البيانات.
            <button onClick={() => refetch()} className="mr-2 text-blue-600">
              إعادة المحاولة
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            لا توجد نتائج مطابقة
          </div>
        ) : (
          <ul className="divide-y">
            {items.map((n) => (
              <li key={n.id} className="grid grid-cols-12 gap-2 px-4 py-3">
                <div className="col-span-5">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {n.title || "—"}
                  </div>
                  {n.content && (
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {n.content}
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <TypeBadge type={n.type} />
                </div>
                <div className="col-span-2">
                  {n.read ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                      مقروء
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      غير مقروء
                    </span>
                  )}
                </div>
                <div className="col-span-3 text-sm text-gray-600">
                  {formatDate(n.time)}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* footer */}
        <div
          className="flex items-center justify-between px-4 py-3 border-t text-sm"
          dir="rtl"
        >
          <div className="text-gray-600">
            الصفحة <b>{page}</b> من <b>{lastPage}</b>
            {isFetching && <span className="ml-2 text-gray-400">(تحديث…)</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              السابق
            </button>
            <button
              className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
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

function TypeBadge({ type }) {
  const map = {
    news: { text: "الأخبار", class: "bg-blue-50 text-blue-700" },
    event: { text: "فعالية", class: "bg-violet-50 text-violet-700" },
    reminder: { text: "تذكير", class: "bg-amber-50 text-amber-700" },
    info: { text: "معلومة", class: "bg-gray-100 text-gray-700" },
  };
  const m = map[type] || map.info;
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${m.class}`}>
      {m.text}
    </span>
  );
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(+date)) return d;
  return date.toLocaleString("ar-TN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
