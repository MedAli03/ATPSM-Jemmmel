import { useEffect, useMemo, useState } from "react";
import { useParentsPage } from "../../../hooks/useParentsPage";

const ACTIVE_FILTERS = [
  { value: "", label: "كل الحالات" },
  { value: "true", label: "نشط" },
  { value: "false", label: "غير نشط" },
];

export default function AllParents() {
  const [q, setQ] = useState("");
  const [isActive, setIsActive] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({ page, pageSize, q, is_active: isActive }),
    [page, pageSize, q, isActive]
  );

  const query = useParentsPage(params);
  const data = query.data ?? {};
  const rows = data.rows ?? [];
  const count = data.count ?? 0;
  const pageSizeResolved = data.pageSize ?? pageSize;
  const totalPages = Math.max(1, Math.ceil(count / (pageSizeResolved || 1)));

  useEffect(() => {
    setPage(1);
  }, [q, isActive, pageSize]);

  return (
    <div className="space-y-4" dir="rtl">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الأولياء</h1>
          <p className="text-sm text-gray-500">
            إدارة حسابات الأولياء مع إمكانية البحث والتصفية حسب الحالة.
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
              placeholder="ابحث بالاسم أو البريد أو الهاتف…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2 rounded-xl border bg-white text-sm"
            value={isActive}
            onChange={(e) => setIsActive(e.target.value)}
          >
            {ACTIVE_FILTERS.map((o) => (
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
            onClick={() => query.refetch()}
            className="px-3 py-2 rounded-xl border text-sm hover:bg-gray-50"
          >
            تحديث
          </button>
        </div>
      </header>

      <section className="bg-white border rounded-2xl shadow-sm">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b text-sm text-gray-500">
          <div className="col-span-1">#</div>
          <div className="col-span-3">الاسم الكامل</div>
          <div className="col-span-3">البريد الإلكتروني</div>
          <div className="col-span-2">الهاتف</div>
          <div className="col-span-1">الحالة</div>
          <div className="col-span-2">تاريخ الإنشاء</div>
        </div>

        {query.isLoading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ) : query.isError ? (
          <div className="p-6 text-red-600">
            تعذّر تحميل قائمة الأولياء.
            <button
              onClick={() => query.refetch()}
              className="mr-2 text-blue-600"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-gray-500">لا توجد نتائج مطابقة</div>
        ) : (
          <ul className="divide-y">
            {rows.map((parent) => (
              <li
                key={parent.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 text-sm text-gray-700"
              >
                <div className="col-span-1 font-medium text-gray-900">{parent.id}</div>
                <div className="col-span-3 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {formatFullName(parent)}
                  </div>
                </div>
                <div className="col-span-3 truncate text-gray-700">
                  {parent.email || "—"}
                </div>
                <div className="col-span-2 text-gray-700">
                  {parent.telephone || "—"}
                </div>
                <div className="col-span-1">
                  <StatusBadge is_active={parent.is_active} />
                </div>
                <div className="col-span-2 text-gray-600">
                  {formatDate(parent.created_at)}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
          <div className="text-gray-600">
            الصفحة <b>{page}</b> من <b>{totalPages}</b>
            {query.isFetching && !query.isLoading && (
              <span className="ml-2 text-gray-400">(تحديث…)</span>
            )}
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              التالي
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatFullName(parent) {
  const nom = parent?.nom || "";
  const prenom = parent?.prenom || "";
  const full = `${prenom} ${nom}`.trim();
  return full || "—";
}

function StatusBadge({ is_active }) {
  const active = normalizeActive(is_active);
  if (active === null) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
        غير محدد
      </span>
    );
  }

  return active ? (
    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
      نشط
    </span>
  ) : (
    <span className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-700">
      غير نشط
    </span>
  );
}

function normalizeActive(value) {
  if (value === true || value === "true" || value === 1 || value === "1") {
    return true;
  }
  if (value === false || value === "false" || value === 0 || value === "0") {
    return false;
  }
  return null;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(+date)) return value;
  return date.toLocaleString("ar-TN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
