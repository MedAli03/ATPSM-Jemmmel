import { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  recipients: yup.array().of(yup.string()).min(1, "اختر مشاركاً واحداً على الأقل"),
  subject: yup.string().trim().max(120, "العنوان طويل"),
  message: yup.string().trim().required("الرسالة مطلوبة"),
});

const NewThreadModal = ({ open, onClose, onCreate, currentUserId, directory = [] }) => {
  const [query, setQuery] = useState("");
  const resolver = useMemo(() => yupResolver(schema), []);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver,
    defaultValues: { recipients: [], subject: "", message: "" },
  });

  const selectedRecipients = watch("recipients") || [];

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return directory
      .filter((participant) => participant.id !== currentUserId)
      .filter((participant) => {
        if (!lower) return true;
        return participant.name.toLowerCase().includes(lower);
      })
      .filter((participant) => !selectedRecipients.includes(participant.id));
  }, [query, selectedRecipients, currentUserId]);

  const closeAndReset = () => {
    reset();
    setQuery("");
    onClose?.();
  };

  const submit = handleSubmit(async (values) => {
    await onCreate?.({
      participantIds: values.recipients,
      subject: values.subject,
      initialMessage: { text: values.message },
    });
    closeAndReset();
  });

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeAndReset} dir="rtl">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 text-right align-middle shadow-xl transition-all dark:bg-slate-900">
                <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  محادثة جديدة
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  ابحث عن المشاركين وحدد الرسالة الأولى.
                </Dialog.Description>

                <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-500">البحث عن المشاركين</label>
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="اكتب اسم المشارك"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedRecipients.map((recipientId) => {
                      const participant = directory.find((item) => item.id === recipientId);
                      return (
                        <span
                          key={recipientId}
                          className="flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs text-primary-700 dark:bg-primary-900/40 dark:text-primary-200"
                        >
                          {participant?.name}
                          <button
                            type="button"
                            onClick={() =>
                              setValue(
                                "recipients",
                                selectedRecipients.filter((item) => item !== recipientId)
                              )
                            }
                            className="text-primary-500 transition hover:text-rose-500"
                            aria-label="إزالة المشارك"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>

                  <div className="max-h-36 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
                    {filtered.length ? (
                      <ul className="space-y-2">
                        {filtered.map((participant) => (
                          <li key={participant.id}>
                            <button
                              type="button"
                              onClick={() => setValue("recipients", [...selectedRecipients, participant.id])}
                              className="flex w-full items-center justify-between rounded-2xl px-4 py-2 text-sm text-slate-600 transition hover:bg-primary-50 hover:text-primary-700 dark:text-slate-200 dark:hover:bg-primary-900/30"
                            >
                              <span>{participant.name}</span>
                              <span className="text-[11px] text-slate-400">{participant.role}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-xs text-slate-400">لا توجد نتائج مطابقة</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-500">العنوان (اختياري)</label>
                    <input
                      type="text"
                      {...register("subject")}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-primary-300 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="عنوان المحادثة"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-500">الرسالة الأولى</label>
                    <textarea
                      {...register("message")}
                      rows={3}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-primary-300 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="اكتب الرسالة هنا"
                    />
                    {errors.message ? (
                      <span className="text-xs text-rose-500">{errors.message.message}</span>
                    ) : null}
                  </div>

                  {errors.recipients ? (
                    <span className="text-xs text-rose-500">{errors.recipients.message}</span>
                  ) : null}

                  <div className="mt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeAndReset}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
                    >
                      إنشاء المحادثة
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default NewThreadModal;
