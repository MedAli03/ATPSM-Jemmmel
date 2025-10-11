// src/components/common/LinkParentModal.jsx
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Modal from "./Modal";

const schema = yup.object({
  parent_user_id: yup
    .number()
    .typeError("يرجى إدخال رقم صالح")
    .integer("يجب أن يكون عددًا صحيحًا")
    .positive("يجب أن يكون رقمًا موجبًا")
    .required("هذا الحقل إجباري"),
});

export default function LinkParentModal({
  open,
  onClose,
  onSubmit, // (values) => void | Promise
  isSubmitting = false,
  serverError = "",
}) {
  const initialRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { parent_user_id: "" },
    mode: "onSubmit",
  });

  // Reset form when opening
  useEffect(() => {
    if (open) reset({ parent_user_id: "" });
  }, [open, reset]);

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-xl border hover:bg-gray-50 disabled:opacity-50"
        disabled={isSubmitting}
      >
        إلغاء
      </button>
      <button
        type="submit"
        form="link-parent-form"
        className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? "جارٍ الربط…" : "تأكيد الربط"}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ربط ولي بالحساب"
      description="أدخل معرّف حساب الولي (ID) لربط هذا الطفل به."
      size="sm"
      footer={footer}
      initialFocusRef={initialRef}
    >
      <form
        id="link-parent-form"
        onSubmit={handleSubmit((values) =>
          onSubmit({ parent_user_id: Number(values.parent_user_id) })
        )}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="parent_user_id"
            className="block text-sm text-gray-700 mb-1"
          >
            معرّف حساب الولي
          </label>
          <input
            id="parent_user_id"
            type="number"
            inputMode="numeric"
            placeholder="مثال: 123"
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            {...register("parent_user_id")}
            aria-invalid={!!errors.parent_user_id}
            ref={(el) => {
              // keep RHF ref + our initial focus
              register("parent_user_id").ref(el);
              initialRef.current = el;
            }}
          />
          {errors.parent_user_id && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.parent_user_id.message}
            </p>
          )}
        </div>

        {serverError ? (
          <div className="p-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs">
            {serverError}
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
