import PropTypes from "prop-types";

const formatDateTime = (value) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("ar-TN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(date);
  } catch {
    return value;
  }
};

const MessageBubble = ({ message, isOwn = false }) => {
  const bubbleClasses = isOwn
    ? "self-start bg-primary-500 text-white"
    : "self-end bg-white text-slate-900 border border-slate-200";

  return (
    <div className={`max-w-xl w-fit rounded-3xl px-5 py-3 shadow-sm ${bubbleClasses}`}>
      <div className="flex flex-col gap-2 text-right">
        {message?.senderName && (
          <span className="text-xs font-semibold text-slate-200/90">
            {message.senderName}
          </span>
        )}
        {message?.body && (
          <p className="text-sm leading-7 whitespace-pre-wrap break-words">
            {message.body}
          </p>
        )}
        {Array.isArray(message?.attachments) && message.attachments.length > 0 && (
          <div className="flex flex-col gap-1 text-sm">
            {message.attachments.map((file) => (
              <a
                key={file.id || file.url}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-xs font-medium underline"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
                  📎
                </span>
                <span className="truncate max-w-[12rem]">{file.name || "مرفق"}</span>
              </a>
            ))}
          </div>
        )}
        <span className="text-[11px] text-slate-200/70 self-start">
          {formatDateTime(message?.createdAt)}
        </span>
      </div>
    </div>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    body: PropTypes.string,
    createdAt: PropTypes.string,
    senderName: PropTypes.string,
    attachments: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        url: PropTypes.string,
      }),
    ),
  }),
  isOwn: PropTypes.bool,
};

export default MessageBubble;
