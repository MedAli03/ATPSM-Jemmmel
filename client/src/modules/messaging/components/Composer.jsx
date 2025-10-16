import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  message: yup.string().trim().max(2000, "الحد الأقصى ٢٠٠٠ حرف").required("اكتب رسالتك")
});

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ميغابايت`;
}

const Composer = ({
  onSend,
  onDraftChange,
  onTyping,
  initialDraft = "",
  disabled = false,
  focusSearch,
}) => {
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const resolver = useMemo(() => yupResolver(schema), []);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver,
    defaultValues: { message: initialDraft },
  });

  const messageValue = watch("message", initialDraft);

  useEffect(() => {
    setValue("message", initialDraft);
  }, [initialDraft, setValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onDraftChange?.(messageValue);
      if (messageValue?.trim()) {
        onTyping?.();
      }
    }, 280);
    return () => clearTimeout(handler);
  }, [messageValue, onDraftChange, onTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageValue]);

  const submit = handleSubmit(async (values) => {
    if (!values.message?.trim() && attachments.length === 0) return;
    await onSend?.({
      text: values.message.trim(),
      attachments,
    });
    reset({ message: "" });
    setAttachments([]);
  });

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    const mapped = files.map((file) => ({
      id: `${file.name}-${file.size}`,
      name: file.name,
      size: formatSize(file.size),
    }));
    setAttachments((prev) => [...prev, ...mapped]);
    event.target.value = "";
  };

  const { ref: messageRef, ...messageField } = register("message");

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/70"
    >
      <div className="flex items-center justify-between gap-3">
          <label className="flex flex-1 items-start gap-2 text-sm text-slate-500">
            <textarea
              {...messageField}
              ref={(element) => {
                messageRef(element);
                textareaRef.current = element;
              }}
            placeholder="اكتب رسالتك…"
            className="flex-1 resize-none rounded-3xl border border-transparent bg-transparent px-4 py-3 text-right text-slate-900 placeholder:text-slate-400 focus:border-primary-300 focus:outline-none focus:ring-0 dark:text-slate-100"
            rows={1}
            maxLength={2000}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key?.toLowerCase() === "k") {
                event.preventDefault();
                focusSearch?.();
              }
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            aria-invalid={errors.message ? "true" : "false"}
          />
        </label>
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-primary-200 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            📎
            <input type="file" className="sr-only" onChange={handleFiles} multiple disabled={disabled} />
          </label>
          <button
            type="button"
            onClick={() => alert("🚧 سيتم إضافة منتقي الإيموجي لاحقاً")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-500 transition hover:border-primary-200 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-800"
          >
            😊
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-2">
          {attachments.map((attachment) => (
            <span
              key={attachment.id}
              className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <span>{attachment.name}</span>
              {attachment.size ? <span className="opacity-70">{attachment.size}</span> : null}
              <button
                type="button"
                onClick={() => setAttachments((prev) => prev.filter((item) => item.id !== attachment.id))}
                className="text-slate-400 transition hover:text-rose-500"
                aria-label="إزالة المرفق"
              >
                ×
              </button>
            </span>
          ))}
          {attachments.length === 0 ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              🚧 سيتم دعم رفع الملفات في التكامل مع الخادم.
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <span>{messageValue?.length || 0}/2000</span>
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            إرسال
          </button>
        </div>
      </div>
      {errors.message ? (
        <span className="text-xs text-rose-500" role="alert">
          {errors.message.message}
        </span>
      ) : null}
    </form>
  );
};

export default Composer;
