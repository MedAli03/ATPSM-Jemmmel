import { formatRelativeTime } from "../../utils/relativeTime";

function getThreadTitle(thread) {
  if (thread.title) return thread.title;
  const names = (thread.participants || [])
    .filter((participant) => !participant.isCurrentUser)
    .map((participant) => participant.name)
    .filter(Boolean);
  return names.join("، ") || "محادثة";
}

function safePreview(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const densityClass = {
  comfortable: "py-4",
  compact: "py-2",
};

export default function ThreadItem({ thread, active = false, density = "comfortable", onSelect }) {
  const title = getThreadTitle(thread);
  const preview = safePreview(thread.lastMessage?.text || "");
  const timeAgo = thread.updatedAt ? formatRelativeTime(thread.updatedAt) : "";
  const unread = thread.unreadCount || 0;

  const densityClassName = densityClass[density] ?? densityClass.comfortable;
  const baseClass = "w-full rounded-2xl px-4 text-right transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500";
  const variantClass = active
    ? "bg-primary-50/80 text-primary-900 shadow-sm dark:bg-primary-900/30 dark:text-white"
    : "bg-white text-slate-800 shadow-sm hover:bg-primary-50/60 dark:bg-slate-800 dark:text-slate-100";

  return (
    <button
      type="button"
      onClick={() => onSelect?.(thread)}
      className={`${baseClass} ${densityClassName} ${variantClass}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-sm font-semibold text-primary-600 dark:bg-primary-400/20 dark:text-primary-200">
          {thread.isGroup ? "👥" : "💬"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
            {timeAgo && <span className="text-xs text-slate-400">{timeAgo}</span>}
          </div>
          <p
            className="mt-1 truncate text-xs text-slate-500 dark:text-slate-300"
            dangerouslySetInnerHTML={{ __html: preview || "لا توجد رسائل بعد" }}
          />
          <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-slate-400">
            {(thread.participants || []).map((participant) => (
              <span key={participant.id} className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-700">
                {participant.name}
              </span>
            ))}
          </div>
        </div>
        {unread > 0 && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
            {unread}
          </span>
        )}
      </div>
    </button>
  );
}
