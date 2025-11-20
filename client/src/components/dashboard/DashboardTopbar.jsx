import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationMenu from "./NotificationMenu";
// small helper
const Kbd = ({ children }) => (
  <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] border">
    {children}
  </kbd>
);

export default function TopbarNeo({ onMenuClick }) {
  const { currentUser, logout } = useAuth();
  const { pathname } = useLocation();

  const normalizedRole = String(currentUser?.role || "").toUpperCase();
  const isDirector =
    normalizedRole === "DIRECTEUR" || pathname.startsWith("/dashboard/manager");
  const homePath = isDirector ? "/dashboard/manager" : "/dashboard/president";
  const notificationsPath = `${homePath}/notifications`;
  const childrenPath = `${homePath}/children`;
  const newsPath = `${homePath}/news`;
  const eventsPath = `${homePath}/events`;
  const messagesPath = `${homePath}/messages`;

  // --- local state
  const [openCmd, setOpenCmd] = useState(false);
  // const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  // const notifRef = useRef(null);
  const userRef = useRef(null);

  // sample notifications (wire to backend later)
  // const notifications = [
  //   { id: 1, text: "تمت إضافة نشاط جديد إلى مجموعة أمل", time: "الآن", read: false },
  //   { id: 2, text: "تذكير: اجتماع يوم الجمعة", time: "منذ ساعة", read: true },
  // ];
  // const unread = notifications.filter((n) => !n.read).length;

  // breadcrumbs from URL
  const crumbs = useMemo(
    () => pathname.split("/").filter(Boolean).slice(0, 4),
    [pathname]
  );

  // close popovers by clicking outside
  // useEffect(() => {
  //   const h = (e) => {
  //     if (notifRef.current && !notifRef.current.contains(e.target)) setOpenNotif(false);
  //     if (userRef.current && !userRef.current.contains(e.target)) setOpenUser(false);
  //   };
  //   document.addEventListener("mousedown", h);
  //   return () => document.removeEventListener("mousedown", h);
  // }, []);

  // command palette (Ctrl/Cmd + K)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenCmd((s) => !s);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50" dir="rtl" aria-label="الشريط العلوي">
      {/* thin accent */}
      <div className="h-[3px] bg-gradient-to-l from-blue-600 via-indigo-500 to-sky-400" />

      {/* floating bar */}
      <div className="px-3 sm:px-6 py-2 bg-transparent">
        <div className="max-w-[1400px] mx-auto">
          <div className="rounded-2xl border border-gray-200/70 bg-white/80 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 gap-2">
              {/* left cluster: menu + brand + crumbs */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-700"
                  onClick={onMenuClick}
                  aria-label="فتح القائمة"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                </button>

                <Link to={homePath} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center text-white shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-extrabold leading-4 text-gray-900">
                      لوحة الرئيس
                    </div>
                    <div className="text-[10px] text-gray-500 leading-3 -mt-0.5">
                      منصة إدارة الجمعية
                    </div>
                  </div>
                </Link>

                {/* breadcrumbs */}
                <nav className="hidden lg:block">
                  <ol className="flex items-center gap-2 text-sm text-gray-600">
                    <li>
                      <Link to={homePath} className="hover:text-gray-900 font-medium">
                        الرئيسية
                      </Link>
                    </li>
                    {crumbs.map((c, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                          <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="capitalize">
                          {decodeURIComponent(c)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>

              {/* center: pill search */}
              <div className="hidden md:flex flex-1 justify-center max-w-2xl">
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-2xl bg-gray-100 text-gray-600 border
                             hover:bg-gray-50 focus:ring-2 ring-blue-500"
                  onClick={() => setOpenCmd(true)}
                  aria-label="فتح البحث"
                >
                  <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-4.35-4.35M11 18a7 7 0 110-14 7 7 0 010 14z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span className="text-sm">ابحث عن طفل، مجموعة، خبر…</span>
                  <span className="ms-auto flex items-center gap-1 text-xs text-gray-500">
                    <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>
                  </span>
                </button>
              </div>

              {/* right: quick actions + notif + user */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* slot: year selector (wire later) */}
                {/* <SelectAnnee value={anneeId} onChange={setAnneeId} /> */}

                <Link
                  to={notificationsPath}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-2xl
                             bg-gradient-to-l from-blue-600 to-indigo-600 text-white hover:opacity-95 shadow-sm"
                >
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-6-6v0a6 6 0 00-6 6v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  الإشعارات
                </Link>

                {/* notifications */}
          <NotificationMenu />

                {/* user capsule */}
                <div className="relative" ref={userRef}>
                  <button
                    className="flex items-center gap-2 rounded-full ps-2 pe-2 sm:pe-3 py-1.5 bg-gray-100 hover:bg-gray-200"
                    onClick={() => setOpenUser((s) => !s)}
                    aria-label="قائمة المستخدم"
                  >
                    {currentUser?.avatar ? (
                      <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover" alt="المستخدم" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
                    )}
                    <div className="hidden sm:block text-right leading-4">
                      <div className="text-sm font-semibold">
                        {currentUser?.nom ? `${currentUser.nom} ${currentUser.prenom || ""}` : "المستخدم"}
                      </div>
                      <div className="text-[11px] text-gray-500">{currentUser?.role || "PRESIDENT"}</div>
                    </div>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${openUser ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>

                  {openUser && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border py-1 z-50">
                      <Link
                        to="/dashboard/profile"
                        className="block px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        الملف الشخصي
                      </Link>
                      <button onClick={logout} className="w-full text-right px-4 py-2 text-sm hover:bg-gray-50">
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* optional sub-row: chips / filters */}
            {/* <div className="px-3 sm:px-5 pb-3">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs border">سنة 2024-2025</span>
                <button className="px-3 py-1.5 rounded-full bg-gray-100 text-xs hover:bg-gray-200">المجموعات</button>
                <button className="px-3 py-1.5 rounded-full bg-gray-100 text-xs hover:bg-gray-200">الأطفال</button>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Command Palette (simple) */}
      {openCmd && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center p-4 bg-black/40"
          onClick={() => setOpenCmd(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 border">
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.35-4.35M11 18a7 7 0 110-14 7 7 0 010 14z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                autoFocus
                placeholder="اكتب للبحث…"
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                <Kbd>Esc</Kbd> للخروج
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500 px-1">اقتراحات</div>
            <ul className="mt-1 max-h-72 overflow-y-auto">
              <CmdItem
                to={homePath}
                label={isDirector ? "الانتقال إلى لوحة المدير" : "الانتقال إلى لوحة الرئيس"}
                onClose={() => setOpenCmd(false)}
              />
              <CmdItem
                to={childrenPath}
                label="فتح إدارة الأطفال"
                onClose={() => setOpenCmd(false)}
              />
              <CmdItem
                to={newsPath}
                label="الأخبار"
                onClose={() => setOpenCmd(false)}
              />
              <CmdItem
                to={eventsPath}
                label="الفعاليات"
                onClose={() => setOpenCmd(false)}
              />
              <CmdItem
                to={messagesPath}
                label="الرسائل"
                onClose={() => setOpenCmd(false)}
              />
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}

function CmdItem({ to, label, onClose }) {
  return (
    <li>
      <Link
        to={to}
        onClick={onClose}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        {label}
      </Link>
    </li>
  );
}
