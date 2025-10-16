import ReadReceipt from "./ReadReceipt";

const bubbleBase = "max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm";

const MessageBubble = ({ message, isOwn, sender, onRetry }) => {
  if (!message) return null;
  const isSystem = message.kind === "system";
  const alignment = isSystem ? "items-center" : isOwn ? "items-end" : "items-start";
  const bubbleClasses = isSystem
    ? "bg-amber-50 text-amber-800"
    : isOwn
      ? "bg-primary-500 text-white"
      : "bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100";

  return (
    <div className={`flex flex-col gap-1 ${alignment}`} role="listitem">
      {!isSystem && !isOwn ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">{sender?.name}</span>
      ) : null}
      <div className={`${bubbleBase} ${bubbleClasses}`}>
        {message.text ? <p className="whitespace-pre-wrap" dir="auto">{message.text}</p> : null}
        {Array.isArray(message.attachments) && message.attachments.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <li
                key={attachment.id || attachment.name}
                className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs text-inherit backdrop-blur"
              >
                <span className="font-medium">{attachment.name}</span>
                {attachment.size ? <span className="opacity-70">{attachment.size}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
        {message.status === "failed" ? (
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-rose-200">
            <span>تعذّر إرسال الرسالة</span>
            <button
              type="button"
              onClick={() => onRetry?.(message)}
              className="rounded-full border border-rose-200/60 px-3 py-1 text-rose-700 transition hover:bg-rose-100 hover:text-rose-900 dark:border-rose-300/60 dark:text-white dark:hover:bg-rose-800"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : null}
      </div>
      {!isSystem ? (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{new Date(message.createdAt).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}</span>
          {isOwn ? <ReadReceipt status={message.status} readBy={message.readBy || []} /> : null}
        </div>
      ) : null}
    </div>
  );
};

export default MessageBubble;
