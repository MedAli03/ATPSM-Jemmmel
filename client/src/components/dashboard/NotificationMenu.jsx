// src/components/dashboard/NotificationMenu.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  useUnreadCount,
  useRecentNotifications,
  useNotificationMutations,
} from "../../hooks/useNotifications";
import { useAuth } from "../../context/AuthContext";

const TYPE_STYLES = {
  actualite: {
    label: "خبر",
    chip: "bg-blue-100 text-blue-600",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 5h16M4 11h16M4 17h10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  evenement: {
    label: "فعالية",
    chip: "bg-violet-100 text-violet-600",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  inscription: {
    label: "المجموعات",
    chip: "bg-emerald-100 text-emerald-600",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20a7.5 7.5 0 0115 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  affectation: {
    label: "تعيين",
    chip: "bg-indigo-100 text-indigo-600",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M12 14l-3 3m0 0l3 3m-3-3h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M16 4h4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  pei: {
    label: "PEI",
    chip: "bg-sky-100 text-sky-600",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 19l7-14 7 14H5z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M12 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
      </svg>
    ),
  },
  evaluation: {
    label: "تقييم",
    chip: "bg-amber-100 text-amber-600",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M4 19h16M8 11l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  recommandation: {
    label: "ذكاء اصطناعي",
    chip: "bg-cyan-100 text-cyan-600",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 3h6l1 3h3v4l-3 2 3 2v4h-3l-1 3H9l-1-3H5v-4l3-2-3-2V6h3l1-3z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  note: {
    label: "ملاحظة",
    chip: "bg-rose-100 text-rose-600",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M5 4h14v16H5z" stroke="currentColor" strokeWidth="2" />
        <path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  activite: {
    label: "نشاط",
    chip: "bg-orange-100 text-orange-600",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l2.39 6.955H21l-5.195 3.776L17.79 20 12 15.889 6.21 20l1.985-7.269L3 8.955h6.61L12 2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  message: {
    label: "رسالة",
    chip: "bg-gray-100 text-gray-600",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 5h16v14l-4-3H4z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M4 5l8 7 8-7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  document: {
    label: "وثيقة",
    chip: "bg-slate-100 text-slate-600",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M7 2h8l4 4v16H7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M15 2v4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  reglement: {
    label: "نظام",
    chip: "bg-teal-100 text-teal-600",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l8 4v6c0 4.418-3.582 8-8 8s-8-3.582-8-8V7l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 11v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="9" r="1" fill="currentColor" />
      </svg>
    ),
  },
  info: {
    label: "معلومة",
    chip: "bg-slate-100 text-slate-600",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M12 12v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="8" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
};

function getTypeStyle(type) {
  return TYPE_STYLES[type] || TYPE_STYLES.info;
}

function formatRelative(dateLike) {
  if (!dateLike) return "الآن";
  const date = new Date(dateLike);
  if (Number.isNaN(+date)) return dateLike;
  return new Intl.DateTimeFormat("ar-TN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function NotificationMenu({ anchorClass = "" }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("unread");
  const panelRef = useRef(null);
  const { currentUser } = useAuth();

  const { data: unreadCount = 0 } = useUnreadCount();
  const {
    items,
    isLoading,
    isError,
    refetch,
  } = useRecentNotifications(10, { enabled: true });
  const { markOne, markAll, remove } = useNotificationMutations();

  useEffect(() => {
    const handler = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  const filtered = useMemo(() => {
    return tab === "unread" ? items.filter((item) => !item.read) : items;
  }, [items, tab]);

  const basePath =
    currentUser?.role === "DIRECTEUR"
      ? "/dashboard/manager/notifications"
      : "/dashboard/president/notifications";

  const handleMarkAll = () => {
    if (!filtered.length || markAll.isPending) return;
    markAll.mutate();
  };

  const handleMarkOne = (id) => {
    if (markOne.isPending) return;
    markOne.mutate(id);
  };

  const handleDelete = (id) => {
    if (remove.isPending) return;
    remove.mutate(id);
  };

  return (
    <div className="relative" ref={panelRef} dir="rtl">
      <button
        type="button"
        className={`relative flex items-center justify-center rounded-2xl bg-white/70 border border-slate-200 px-2.5 py-2 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow ${anchorClass}`}
        onClick={() => setOpen((s) => !s)}
        aria-label="الإشعارات"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 17h5l-1.405-1.405A2.03 2.03 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 grid min-w-[1.5rem] place-items-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[11px] font-bold text-white shadow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl backdrop-blur" role="dialog" aria-label="قائمة الإشعارات">
          <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-slate-700 px-4 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-200">إشعارات النظام</p>
                <p className="text-lg font-semibold">{unreadCount || "لا جديد"}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleMarkAll}
                  disabled={markAll.isPending || !filtered.length}
                  className="rounded-full bg-white/10 px-3 py-1 font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  تمييز الكل كمقروء
                </button>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="rounded-full bg-white/10 px-2 py-1 text-white transition hover:bg-white/20"
                >
                  إعادة التحديث
                </button>
              </div>
            </div>
            <div className="mt-3 flex gap-2 rounded-full bg-white/15 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setTab("unread")}
                className={`flex-1 rounded-full px-3 py-1 transition ${
                  tab === "unread"
                    ? "bg-white text-slate-900 shadow"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                غير مقروءة
              </button>
              <button
                type="button"
                onClick={() => setTab("all")}
                className={`flex-1 rounded-full px-3 py-1 transition ${
                  tab === "all"
                    ? "bg-white text-slate-900 shadow"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                الكل
              </button>
            </div>
          </div>

          <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto bg-white">
            {isLoading && <SkeletonList />}

            {isError && (
              <div className="px-5 py-6 text-sm text-rose-600">
                حدث خطأ أثناء تحميل الإشعارات.
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mr-2 text-blue-600"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                لا توجد إشعارات في هذا التصنيف.
                <p className="mt-1 text-xs text-slate-400">سنعلمك فور حدوث جديد.</p>
              </div>
            )}

            {!isLoading &&
              !isError &&
              filtered.map((notification) => {
                const style = getTypeStyle(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 px-5 py-4 transition ${
                      notification.read
                        ? "hover:bg-slate-50"
                        : "bg-sky-50/60 hover:bg-sky-50"
                    }`}
                  >
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-xl ${style.chip}`}
                      aria-hidden={true}
                    >
                      {style.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className={`rounded-full px-2 py-0.5 ${style.chip}`}>
                          {style.label}
                        </span>
                        <span>{formatRelative(notification.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2">
                        {notification.title || notification.text}
                      </p>
                      {notification.body && (
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                          {notification.body}
                        </p>
                      )}
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="mt-2 inline-flex items-center text-xs font-medium text-blue-600 hover:underline"
                        >
                          عرض التفاصيل
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
                    <div className="flex flex-col gap-2 text-xs">
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkOne(notification.id)}
                          className="rounded-full border border-emerald-200 px-3 py-1 text-emerald-600 transition hover:bg-emerald-500 hover:text-white"
                        >
                          تمت القراءة
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(notification.id)}
                        className="rounded-full border border-rose-200 px-3 py-1 text-rose-600 transition hover:bg-rose-500 hover:text-white"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-center text-sm">
            <Link
              to={basePath}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-white shadow hover:bg-slate-800"
            >
              عرض جميع الإشعارات
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3 px-5 py-4">
      {[...Array(4)].map((_, idx) => (
        <div key={idx} className="flex gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-200/60" />
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded bg-slate-200/60" />
            <div className="h-3 w-2/3 rounded bg-slate-200/40" />
          </div>
        </div>
      ))}
    </div>
  );
}
