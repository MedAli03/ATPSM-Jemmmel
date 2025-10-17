import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  message: yup.string().max(2000, "الحد الأقصى ٢٠٠٠ حرف"),
});

export default function Composer({
  value = "",
  onChange,
  onSend,
  onTypingChange,
  isSending = false,
  maxLength = 2000,
}) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { message: value },
  });

  useEffect(() => {
    reset({ message: value });
  }, [value, reset]);

  const messageValue = watch("message");

  useEffect(() => {
    onChange?.(messageValue ?? "");
  }, [messageValue, onChange]);

  useEffect(() => {
    const active = Boolean(messageValue && messageValue.trim());
    onTypingChange?.(active);
  }, [messageValue, onTypingChange]);

  const submit = handleSubmit(async (data) => {
    const content = (data.message || "").trim();
    if (!content) return;
    await onSend?.(content);
    reset({ message: "" });
  });

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const remaining = maxLength - (messageValue?.length || 0);

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-lg dark:bg-slate-900" dir="rtl">
      <textarea
        {...register("message")}
        maxLength={maxLength}
        onKeyDown={handleKeyDown}
        placeholder="اكتب رسالتك…"
        className="min-h-[80px] w-full resize-none rounded-2xl border border-slate-200 bg-transparent p-3 text-sm leading-6 text-slate-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:text-slate-100 dark:focus:border-primary-500"
      />
      {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-500 hover:border-primary-300 hover:text-primary-500"
            onClick={() => alert("TODO: دعم المرفقات")}
          >
            📎 إرفاق ملف
          </button>
          <button
            type="button"
            className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-500 hover:border-primary-300 hover:text-primary-500"
            onClick={() => alert("TODO: لوحة الرموز التعبيرية")}
          >
            🙂 الرموز التعبيرية
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span>{remaining} حرف متبقٍ</span>
          <button
            type="submit"
            disabled={isSending}
            className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
          >
            {isSending ? "جاري الإرسال…" : "إرسال"}
          </button>
        </div>
      </div>
    </form>
  );
}
