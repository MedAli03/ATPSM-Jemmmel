import { memo } from "react";

const densityHeights = {
  comfortable: "py-4",
  compact: "py-2",
};

const ThreadItem = memo(function ThreadItem({ thread, isActive, onSelect, density = "comfortable", index, total, onKeyNavigate }) {
  if (!thread) return null;
  const participants = thread.participants || [];
  const title = thread.title || participants.map((p) => p?.name).filter(Boolean).join("، ");
  const lastSender = thread.preview?.senderName || "";
  const previewText = thread.preview?.text || "";
  const relativeTime = thread.preview?.relativeTime || "";
  const unread = Number(thread.unreadCount || 0);

  return (
    <button
      id={`thread-${thread.id}`}
      type="button"
      onClick={onSelect}
      className={`group flex w-full flex-col items-stretch gap-2 rounded-3xl border border-transparent bg-white/70 px-4 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400/40 dark:bg-slate-900/70 ${densityHeights[density] || densityHeights.comfortable} ${isActive ? "border-primary-300 shadow-md dark:border-primary-500" : ""}`}
      data-index={index}
      onKeyDown={(event) => {
        if (!onKeyNavigate) return;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          onKeyNavigate(Math.min(index + 1, total - 1));
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          onKeyNavigate(Math.max(index - 1, 0));
        }
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-slate-200 shadow-sm">
            {participants.slice(0, 2).map((participant, idx) => (
              <img
                key={participant?.id || idx}
                src={participant?.avatarUrl}
                alt={participant?.name || ""}
                className={`absolute h-full w-full object-cover transition duration-200 ${idx === 0 ? "" : "translate-x-1/3 border border-white"}`}
              />
            ))}
            {participants.length > 2 ? (
              <span className="absolute inset-0 flex items-center justify-center bg-primary-100 text-xs font-semibold text-primary-700">
                +{participants.length - 2}
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title || "محادثة"}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400" aria-label={previewText}>
              {lastSender ? `${lastSender}: ` : ""}
              {previewText || "بدون رسائل بعد"}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-slate-400">{relativeTime}</span>
          {unread > 0 ? (
            <span className="inline-flex min-w-[1.75rem] items-center justify-center rounded-full bg-primary-500 px-2 py-1 text-[11px] font-bold text-white shadow-inner">
              {unread}
            </span>
          ) : null}
        </div>
      </div>
      {thread.archived ? (
        <span className="text-[11px] text-amber-600">مؤرشفة</span>
      ) : null}
    </button>
  );
});

export default ThreadItem;
