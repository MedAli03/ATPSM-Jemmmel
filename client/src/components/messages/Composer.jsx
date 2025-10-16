import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  body: yup.string().trim().required("نص الرسالة مطلوب"),
  attachments: yup
    .mixed()
    .test("fileList", "", (value) => value == null || value instanceof FileList),
});

const Composer = ({ onSend, isSending = false, onTypingChange }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { body: "", attachments: undefined },
    resolver: yupResolver(schema),
  });

  const typingTimeout = useRef();
  const bodyValue = watch("body");

  useEffect(() => {
    if (!onTypingChange) return;
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (bodyValue && bodyValue.trim().length > 0) {
      onTypingChange(true);
      typingTimeout.current = setTimeout(() => {
        onTypingChange(false);
      }, 1500);
    } else {
      onTypingChange(false);
    }
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [bodyValue, onTypingChange]);

  const onSubmit = (values) => {
    const attachments = values.attachments
      ? Array.from(values.attachments).slice(0, 5)
      : [];
    onSend({ body: values.body.trim(), attachments });
    reset({ body: "", attachments: undefined });
  };

  return (
    <form
      dir="rtl"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 bg-white/80 backdrop-blur rounded-3xl p-4 border border-slate-200"
    >
      <div>
        <textarea
          rows={3}
          placeholder="اكتب رسالتك هنا..."
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-right focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          {...register("body")}
        />
        {errors.body && (
          <p className="text-xs text-rose-500 mt-1">{errors.body.message}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <label className="flex items-center gap-2 text-sm text-primary-600 cursor-pointer">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            📎
          </span>
          <span className="flex flex-col text-right leading-tight">
            <span>إضافة مرفقات</span>
            <span className="text-[11px] text-slate-400">حتى 5 ملفات</span>
          </span>
          <input
            type="file"
            multiple
            className="hidden"
            {...register("attachments")}
          />
        </label>
        <button
          type="submit"
          disabled={isSending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-300"
        >
          {isSending ? "جارٍ الإرسال..." : "إرسال"}
        </button>
      </div>
    </form>
  );
};

Composer.propTypes = {
  onSend: PropTypes.func.isRequired,
  isSending: PropTypes.bool,
  onTypingChange: PropTypes.func,
};

export default Composer;
