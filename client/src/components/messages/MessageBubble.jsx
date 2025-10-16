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

const formatFileSize = (size) => {
  if (typeof size !== "number" || Number.isNaN(size) || size <= 0) {
    return null;
  }
  const units = ["بايت", "ك.ب", "م.ب", "ج.ب"];
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const MessageBubble = ({ message, isOwn = false }) => {
  const bubbleClasses = isOwn
    ? "self-start bg-primary-500 text-white"
    : "self-end bg-white text-slate-900 border border-slate-200";
  const senderClasses = isOwn
    ? "text-xs font-semibold text-white/70"
    : "text-xs font-semibold text-primary-600";
  const attachmentIconClasses = isOwn
    ? "inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white"
    : "inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600";
  const timestampClasses = isOwn
    ? "text-[11px] text-white/60 self-start"
    : "text-[11px] text-slate-400 self-start";

  return (
    <div className={`max-w-xl w-fit rounded-3xl px-5 py-3 shadow-sm ${bubbleClasses}`}>
      <div className="flex flex-col gap-2 text-right">
        {message?.senderName && <span className={senderClasses}>{message.senderName}</span>}
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
                <span className={attachmentIconClasses}>📎</span>
                <span className="flex min-w-0 flex-col text-right">
                  <span className="truncate max-w-[12rem]">{file.name || "مرفق"}</span>
                  {formatFileSize(file.size) && (
                    <span className="text-[11px] text-slate-400">
                      {formatFileSize(file.size)}
                    </span>
                  )}
                </span>
              </a>
            ))}
          </div>
        )}
        <span className={timestampClasses}>{formatDateTime(message?.createdAt)}</span>
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
        size: PropTypes.number,
        mimeType: PropTypes.string,
      }),
    ),
  }),
  isOwn: PropTypes.bool,
};

export default MessageBubble;
