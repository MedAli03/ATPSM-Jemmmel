// src/components/dashboard/NotificationMenu.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useUnreadCount,
  useRecentNotifications,
} from "../../hooks/useNotifications";

export default function NotificationMenu({ anchorClass = "" }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("unread"); // "unread" | "all"
  const ref = useRef(null);

  // Backend data
  const { data: badgeCount = 0 } = useUnreadCount({ enabled: open || true });
  const { items, isLoading, isError, refetch } = useRecentNotifications(8, {
    enabled: open || true,
  });

  // Local-only optimistic actions
  const [local, setLocal] = useState([]);
  useEffect(() => {
    setLocal(items);
  }, [items]);

  const unreadCount = local.filter((i) => !i.read).length || badgeCount || 0;
  const filtered = useMemo(
    () => (tab === "unread" ? local.filter((i) => !i.read) : local),
    [local, tab]
  );

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onMarkAll = () => {
    // TODO: call PUT /notifications/mark-all-read (when available)
    setLocal((prev) => prev.map((i) => ({ ...i, read: true })));
  };
  const onClearAll = () => {
    // purely UI clear
    setLocal([]);
  };
  const onMarkOne = (id) => {
    // TODO: call PUT /notifications/:id/read
    setLocal((prev) =>
      prev.map((i) => (i.id === id ? { ...i, read: true } : i))
    );
  };
  const onDeleteOne = (id) => {
    // TODO: call DELETE /notifications/:id
    setLocal((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="relative" ref={ref} dir="rtl">
      {/* Bell anchor */}
      <button
        className={`relative rounded-2xl p-2 hover:bg-gray-100 ${anchorClass}`}
        onClick={() => setOpen((s) => !s)}
        aria-label="الإشعارات"
      >
        <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 17h5l-1.405-1.405A2.03 2.03 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-60 sm:w-60 bg-white rounded-2xl shadow-xl border overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-2 border-b flex items-center justify-between">
            <div className="font-semibold">الإشعارات</div>
            <div className="flex items-center gap-2">
              <button
                onClick={onMarkAll}
                className="text-sm text-blue-600 hover:underline"
              >
                تمييز الكل كمقروء
              </button>
              <button
                onClick={onClearAll}
                className="text-sm text-gray-500 hover:underline"
              >
                مسح
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-3 pt-2">
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setTab("unread")}
                className={`flex-1 rounded-lg py-1.5 text-sm ${
                  tab === "unread"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-600"
                }`}
              >
                غير مقروءة {unreadCount ? `(${unreadCount})` : ""}
              </button>
              <button
                onClick={() => setTab("all")}
                className={`flex-1 rounded-lg py-1.5 text-sm ${
                  tab === "all"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-600"
                }`}
              >
                الكل ({local.length})
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y pt-1">
            {isLoading && (
              <div className="p-4">
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded" />
                  ))}
                </div>
              </div>
            )}

            {isError && (
              <div className="px-4 py-6">
                <p className="text-sm text-red-600">تعذر تحميل الإشعارات.</p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 text-sm text-blue-600"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && <EmptyState />}

            {!isLoading &&
              !isError &&
              filtered.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 group ${
                    !n.read ? "bg-blue-50/60" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <TypeDot type={n.type} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-gray-900 line-clamp-2">
                        {n.text}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {n.time}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.read && (
                        <button
                          className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          onClick={() => onMarkOne(n.id)}
                        >
                          مقروء
                        </button>
                      )}
                      <button
                        className="text-xs px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                        onClick={() => onDeleteOne(n.id)}
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Footer link */}
          <a
            href="/dashboard/president/notifications"
            className="block text-center py-3 text-sm font-medium text-blue-600 hover:bg-gray-50"
          >
            عرض جميع الإشعارات
          </a>
        </div>
      )}
    </div>
  );
}

function TypeDot({ type }) {
  const map = {
    event: "bg-violet-500",
    news: "bg-blue-500",
    reminder: "bg-amber-500",
    info: "bg-gray-400",
  };
  return (
    <span className={`w-2 h-2 mt-2 rounded-full ${map[type] || map.info}`} />
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto grid place-items-center">
        <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12a9 9 0 11-6.219-8.56"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 7v5l3 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="mt-3 text-sm text-gray-600">لا توجد إشعارات هنا الآن</p>
      <p className="text-xs text-gray-400 mt-1">سنخبرك عند حدوث أي جديد</p>
    </div>
  );
}
