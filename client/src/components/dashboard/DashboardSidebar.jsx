import { NavLink } from "react-router-dom";
import { useState } from "react";

/** Small inline icon set (keeps deps minimal) */
function Icon({ name, className = "w-5 h-5" }) {
  const stroke = 2;
  switch (name) {
    case "dashboard":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-8 0h12"
          />
        </svg>
      );
    case "users":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M17 20h5v-1a6 6 0 00-9-5.197M9 20H4v-1a6 6 0 0112 0v1M15 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    case "child":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M12 14c4.418 0 8 1.79 8 4v2H4v-2c0-2.21 3.582-4 8-4zM12 4a4 4 0 110 8 4 4 0 010-8z"
          />
        </svg>
      );
    case "groups":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M17 20h5v-2a6 6 0 00-9-5.197M7 20H2v-2a6 6 0 019-5.197M12 7a4 4 0 11-8 0 4 4 0 018 0zM20 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    case "pei":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M9 12h6M9 16h6M9 8h6M5 21h14a2 2 0 002-2V7l-6-4H5a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    case "eval":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M9 12l2 2 4-4M7 7h10v10H7z"
          />
        </svg>
      );
    case "reco":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      );
    case "events":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2V9H3v10a2 2 0 002 2z"
          />
        </svg>
      );
    case "news":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M19 20H5a2 2 0 01-2-2V6h14l4 4v8a2 2 0 01-2 2zM7 8h6M7 12h10M7 16h10"
          />
        </svg>
      );
    case "resources":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M12 6v12m6-6H6"
          />
        </svg>
      );
    case "chat":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M8 10h8M8 14h6M21 12a9 9 0 11-4.219-7.781L21 3v9z"
          />
        </svg>
      );
    case "notif":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-6-6v0a6 6 0 00-6 6v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1"
          />
        </svg>
      );
    case "reports":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M9 17v-2a2 2 0 012-2h8m-6 4h6m-6-8h6M7 7h.01M7 11h.01M7 15h.01M4 6h12a2 2 0 012 2v10a2 2 0 01-2 2H4z"
          />
        </svg>
      );
    case "settings":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M10.325 4.317a1.724 1.724 0 003.35 0A1.724 1.724 0 0016.248 3c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37A1.724 1.724 0 004.317 13.675c-1.756-.426-1.756-2.924 0-3.35A1.724 1.724 0 005.382 7.753c-.94-1.543.826-3.31 2.37-2.37A1.724 1.724 0 009.317 4.317z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      );
    case "years":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2V9H3v10a2 2 0 002 2z"
          />
        </svg>
      );
    case "broadcast":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M15 10l4.553-2.276a1 1 0 011.447.894v5.764a1 1 0 01-1.447.894L15 13M4 6h7v12H4z"
          />
        </svg>
      );
    case "audit":
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={stroke}
            d="M9 12l2 2 4-4m-9 8h10M7 7h10M5 21h14a2 2 0 002-2V7l-4-4H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    default:
      return null;
  }
}

function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-lg
                   hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40 transition"
      >
        <span className="flex items-center gap-2">
          <Icon name={icon} className="w-5 h-5 opacity-90" />
          {title}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="py-1">{children}</div>
      </div>
    </div>
  );
}

function Item({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg mx-1
         ${
           isActive
             ? "bg-white text-blue-700 shadow-sm"
             : "text-white/90 hover:bg-white/10 hover:text-white"
         }`
      }
    >
      <Icon name={icon} />
      <span className="mr-1">{label}</span>
      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-2 py-0.5 rounded-full bg-white/20">
        فتح
      </span>
    </NavLink>
  );
}

export default function DashboardSidebar({ open, onClose }) {
  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        className={`fixed md:static inset-y-0 right-0 z-50 w-80
        bg-gradient-to-br from-[#0f1c2d] via-[#12233a] to-[#102038]
        text-white border-l border-white/10 shadow-2xl md:shadow-none
        transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        } md:translate-x-0
        flex flex-col`}
        aria-label="الشريط الجانبي"
      >
        {/* Brand */}
        <div className="p-4 border-b border-white/10 backdrop-blur-sm bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 grid place-items-center">
                <Icon name="dashboard" className="w-6 h-6" />
              </div>
              <div>
                <div className="text-lg font-extrabold tracking-wide">
                  لوحة الرئيس
                </div>
                <div className="text-[11px] text-white/60 -mt-0.5">
                  منصة إدارة الجمعية
                </div>
              </div>
            </div>
            <button
              className="md:hidden text-white/80 hover:text-white"
              onClick={onClose}
              aria-label="إغلاق"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {/* Quick actions */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <NavLink
              to="/dashboard/president"
              className="text-xs bg-white text-blue-700 rounded-lg px-3 py-2 text-center font-semibold hover:bg-blue-50"
            >
              الإحصائيات
            </NavLink>
            <NavLink
              to="/dashboard/broadcast"
              className="text-xs bg-white/10 rounded-lg px-3 py-2 text-center hover:bg-white/15"
            >
              بثّ إشعار
            </NavLink>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          <Item
            to="/dashboard/president"
            label="لوحة التحكم"
            icon="dashboard"
          />

          <Section
            title="المستخدمون والصلاحيات"
            icon="users"
            defaultOpen={true}
          >
            <Item
              to="/dashboard/president/users"
              label="كلّ المستخدمين"
              icon="users"
            />
            <Item
              to="/dashboard/president/educators"
              label="المربّون"
              icon="users"
            />
            <Item to="/dashboard/users/parents" label="الأولياء" icon="users" />
            <Item to="/dashboard/admins" label="المديرون" icon="settings" />
          </Section>

          <Section title="الأطفال والمجموعات" icon="child" defaultOpen={true}>
            <Item
              to="/dashboard/president/children"
              label="الأطفال"
              icon="child"
            />
            <Item
              to="/dashboard/president/groups"
              label="المجموعات"
              icon="groups"
            />
            <Item to="/dashboard/years" label="السنوات الدراسية" icon="years" />
          </Section>

          <Section title="PEI والتقييمات" icon="pei" defaultOpen={true}>
            <Item to="/dashboard/pei" label="مشاريع PEI" icon="pei" />
            <Item to="/dashboard/evaluations" label="التقييمات" icon="eval" />
            <Item
              to="/dashboard/recommendations"
              label="توصيات الذكاء الاصطناعي"
              icon="reco"
            />
          </Section>

          <Section title="المحتوى والتواصل" icon="news">
            <Item to="/dashboard/president/news" label="الأخبار" icon="news" />
            <Item to="/dashboard/events" label="الفعاليات" icon="events" />
            <Item to="/dashboard/resources" label="الموارد" icon="resources" />
            <Item to="/dashboard/messaging" label="الرسائل" icon="chat" />
            <Item
              to="/dashboard/notifications"
              label="الإشعارات"
              icon="notif"
            />
          </Section>

          <Section title="التقارير والإعدادات" icon="reports">
            <Item to="/dashboard/reports" label="التقارير" icon="reports" />
            <Item to="/dashboard/settings" label="الإعدادات" icon="settings" />
            <Item to="/dashboard/audit" label="سجلّ العمليات" icon="audit" />
            <Item
              to="/dashboard/broadcast"
              label="بثّ إشعار"
              icon="broadcast"
            />
          </Section>
        </nav>

        {/* Footer user pill */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full grid place-items-center text-white">
              م
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate">محمد أحمد</div>
              <div className="text-[11px] text-white/60">رئيس الجمعية</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
