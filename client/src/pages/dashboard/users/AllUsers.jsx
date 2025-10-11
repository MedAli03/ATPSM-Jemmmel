import { useEffect, useMemo, useState } from "react";
import { useUsersPage } from "../../../hooks/useUsersPage";

const ROLES = [
  { value: "", label: "كل الأدوار" },
  { value: "PRESIDENT", label: "الرئيس" },
  { value: "DIRECTEUR", label: "المدير" },
  { value: "EDUCATEUR", label: "المربّي" },
  { value: "PARENT", label: "الولي" },
];

// is_active filter: "", "true", "false"
const ACTIVE_FILTERS = [
  { value: "", label: "كل الحالات" },
  { value: 1, label: "نشط" },
  { value: 0, label: "غير نشط" },
];

export default function AllUsers() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState(""); // "", "1", "0"
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({ page, pageSize, q, role, is_active: isActiveFilter }),
    [page, pageSize, q, role, isActiveFilter]
  );
  const { data, isLoading, isError, refetch, isFetching } =
    useUsersPage(params);

  useEffect(() => {
    setPage(1);
  }, [q, role, isActiveFilter, pageSize]);

  const total = data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const items = data?.items ?? [];

  return (
    <div className="space-y-4" dir="rtl">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">كل المستخدمون</h1>
          <p className="text-sm text-gray-500">
            إدارة المستخدمين عبر البحث والتصفية والترقيم.
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
              placeholder="ابحث بالاسم/البريد…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2 rounded-xl border bg-white text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            className="px-3 py-2 rounded-xl border bg-white text-sm"
            value={isActiveFilter}
            onChange={(e) => setIsActiveFilter(e.target.value)}
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
          <div className="col-span-4">الاسم</div>
          <div className="col-span-3">البريد الإلكتروني</div>
          <div className="col-span-2">الدور</div>
          <div className="col-span-1">الحالة</div>
          <div className="col-span-2">تاريخ الإنشاء</div>
        </div>

        {/* body */}
        {isLoading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="p-6 text-red-600">
            تعذر تحميل المستخدمين.
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
            {items.map((u) => (
              <li key={u.id} className="grid grid-cols-12 gap-2 px-4 py-3">
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  {u.avatar_url ? (
                    <img
                      className="w-9 h-9 rounded-full object-cover"
                      src={u.avatar_url}
                      alt="avatar"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {u.nom || u.prenom
                        ? `${u.nom || ""} ${u.prenom || ""}`.trim()
                        : "—"}
                    </div>
                    {(u.phone || u.telephone) && (
                      <div className="text-xs text-gray-500">
                        {u.phone || u.telephone}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-3 text-sm text-gray-700 truncate">
                  {u.email || "—"}
                </div>

                <div className="col-span-2">
                  <RoleBadge role={u.role} />
                </div>

                <div className="col-span-1">
                   <StatusBadge is_active={u.is_active} status={u.status} />
                </div>

                <div className="col-span-2 text-sm text-gray-600">
                  {formatDate(u.created_at)}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* footer / pagination */}
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

function RoleBadge({ role }) {
  const map = {
    PRESIDENT: { text: "الرئيس", cls: "bg-indigo-50 text-indigo-700" },
    DIRECTEUR: { text: "المدير", cls: "bg-blue-50 text-blue-700" },
    EDUCATEUR: { text: "المربّي", cls: "bg-emerald-50 text-emerald-700" },
    PARENT: { text: "الولي", cls: "bg-amber-50 text-amber-700" },
  };
  const m = map[String(role || "").toUpperCase()] || {
    text: role || "—",
    cls: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${m.cls}`}>{m.text}</span>
  );
}

function StatusBadge({ is_active, status }) {
  const active =
    typeof is_active === "boolean"
      ? is_active
      : String(status || "").toUpperCase() === "ACTIVE";

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

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(+date)) return d;
  return date.toLocaleString("ar-TN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
