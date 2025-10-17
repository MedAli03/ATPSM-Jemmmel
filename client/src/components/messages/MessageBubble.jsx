import { formatRelativeTime } from "../../utils/relativeTime";

function escapeText(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");
}

export default function MessageBubble({ message, isMine, onRetry }) {
  const status = message.status || "sent";
  const isSystem = message.kind === "system";
  const timeAgo = formatRelativeTime(message.createdAt);

  const bubbleClass = isSystem
    ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"
    : isMine
      ? "bg-primary-600 text-white"
      : "bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100";

  const alignment = isSystem ? "items-center" : isMine ? "items-end" : "items-start";
  const justify = isSystem ? "justify-center" : isMine ? "justify-end" : "justify-start";

  return (
    <div className={`flex ${justify}`} aria-live={isSystem ? "polite" : undefined}>
      <div className={`max-w-[80%] rounded-3xl px-4 py-2 shadow-sm ${bubbleClass}`}>
        {message.text && (
          <p className="text-sm leading-6" dangerouslySetInnerHTML={{ __html: escapeText(message.text) }} />
        )}
        {Array.isArray(message.attachments) && message.attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <span
                key={attachment.id}
                className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-100"
              >
                📎 {attachment.name} ({Math.round((attachment.size || 0) / 1024)} ك.ب)
              </span>
            ))}
          </div>
        )}
        <div className={`mt-2 flex ${alignment} gap-2 text-[11px] text-slate-400`}>
          <span>{timeAgo}</span>
          {isMine && (
            <span aria-live="polite" aria-label={status === "failed" ? "فشل الإرسال" : status === "sending" ? "جاري الإرسال" : "تمت القراءة"}>
              {status === "failed" && "⚠️"}
              {status === "sending" && "⏳"}
              {status === "sent" && "✓"}
              {status === "read" && "✓✓"}
            </span>
          )}
        </div>
        {status === "failed" && (
          <button
            type="button"
            onClick={() => onRetry?.(message)}
            className="mt-2 rounded-full border border-red-500 px-3 py-1 text-xs font-semibold text-red-600"
          >
            إعادة المحاولة
          </button>
        )}
      </div>
    </div>
  );
}
