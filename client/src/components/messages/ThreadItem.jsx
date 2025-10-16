import PropTypes from "prop-types";

const formatTime = (value) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("ar-TN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return value;
  }
};

const ThreadItem = ({ thread, isActive = false, onClick }) => {
  const participantNames = Array.isArray(thread?.participants)
    ? thread.participants
        .map((participant) =>
          typeof participant === "string" ? participant : participant?.name,
        )
        .filter(Boolean)
    : [];
  const title =
    thread?.title || participantNames.join("، ") || "محادثة";
  const lastMessageAuthor = thread?.lastMessage?.senderName
    ? `${thread.lastMessage.senderName}: `
    : "";
  const preview = thread?.lastMessage?.body || "لا توجد رسائل";
  const unreadCount = thread?.unreadCount ?? 0;

  const baseClasses =
    "w-full text-right px-4 py-3 rounded-2xl transition-colors border flex flex-col gap-1 bg-white/70 backdrop-blur";
  const activeClasses = isActive
    ? " border-primary-500 bg-primary-50 shadow-sm"
    : " border-transparent hover:border-primary-200 hover:bg-primary-50/40";

  return (
    <button type="button" onClick={onClick} className={baseClasses + activeClasses}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-500/10 text-primary-600 flex items-center justify-center text-sm font-semibold">
          {thread?.avatarUrl ? (
            <img
              src={thread.avatarUrl}
              alt={title}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            title?.[0] ?? "م"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-slate-900 truncate">{title}</span>
            <span className="text-xs text-slate-500">
              {formatTime(thread?.lastMessage?.createdAt || thread?.updatedAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-600 truncate">
              {lastMessageAuthor}
              {preview}
            </p>
            {unreadCount > 0 && (
              <span className="ml-auto inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-rose-500 text-white text-xs font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

ThreadItem.propTypes = {
  thread: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    participants: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          name: PropTypes.string,
          role: PropTypes.string,
        }),
      ]),
    ),
    avatarUrl: PropTypes.string,
    unreadCount: PropTypes.number,
    updatedAt: PropTypes.string,
    lastMessage: PropTypes.shape({
      body: PropTypes.string,
      senderName: PropTypes.string,
      createdAt: PropTypes.string,
    }),
  }),
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
};

export default ThreadItem;
