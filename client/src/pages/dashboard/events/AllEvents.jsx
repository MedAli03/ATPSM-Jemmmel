// src/pages/dashboard/events/AllEvents.jsx
import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import {
  useCalendarEventsQuery,
  useCancelEvent,
  useCreateEvent,
  useEvent,
  useEventsQuery,
  usePublishEvent,
  useUpdateEvent,
  useAttendees,
} from "../../../api/evenements";
import Modal from "../../../components/common/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { useToast } from "../../../components/common/ToastProvider";
import EventsCalendar from "../../../components/events/Calendar";

const TZ = "Africa/Tunis";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(TZ);

yup.setLocale({
  mixed: {
    required: "هذا الحقل إلزامي",
  },
  string: {
    max: "تجاوزت الحد الأقصى للأحرف",
  },
  number: {
    min: "القيمة أصغر من المسموح",
    integer: "يجب إدخال رقم صحيح",
  },
  array: {
    min: "الرجاء اختيار عنصر واحد على الأقل",
  },
});

const statutLabels = {
  brouillon: "مسودة",
  publie: "منشور",
  annule: "ملغى",
};

const statutBadgeClasses = {
  brouillon: "bg-gray-100 text-gray-700",
  publie: "bg-emerald-100 text-emerald-700",
  annule: "bg-rose-100 text-rose-700",
};

const typeLabels = {
  interne: "داخلي",
  public: "عام",
};

const typeBadgeClasses = {
  interne: "bg-indigo-100 text-indigo-700",
  public: "bg-emerald-100 text-emerald-700",
};

const audienceOptions = [
  { value: "PRESIDENT", label: "الرئيس" },
  { value: "DIRECTEUR", label: "المدير" },
  { value: "EDUCATEUR", label: "المربي" },
  { value: "PARENT", label: "الولي" },
];

const durationOptions = [
  { value: "day", label: "اليوم" },
  { value: "week", label: "هذا الأسبوع" },
  { value: "month", label: "هذا الشهر" },
  { value: "custom", label: "مدة مخصصة" },
];

const eventSchema = yup
  .object({
    titre: yup.string().required("العنوان مطلوب").max(150, "الحد الأقصى 150 حرفاً"),
    description: yup.string().max(5000, "الحد الأقصى 5000 حرف"),
    date_debut: yup
      .string()
      .required("تاريخ البداية مطلوب")
      .test("valid", "صيغة التاريخ غير صالحة", (value) => !value || dayjs(value).isValid()),
    date_fin: yup
      .string()
      .required("تاريخ النهاية مطلوب")
      .test("valid", "صيغة التاريخ غير صالحة", (value) => !value || dayjs(value).isValid())
      .test("after", "تاريخ النهاية يجب أن يكون بعد البداية", function (value) {
        const start = dayjs(this.parent.date_debut);
        const end = dayjs(value);
        if (!value || !start.isValid() || !end.isValid()) return true;
        return end.isAfter(start) || end.isSame(start);
      }),
    lieu: yup.string().max(200, "الحد الأقصى 200 حرف"),
    type: yup
      .string()
      .required("نوع الفعالية مطلوب")
      .oneOf(["interne", "public"], "نوع غير صالح"),
    statut: yup
      .string()
      .oneOf(["brouillon", "publie", "annule"], "حالة غير صالحة")
      .default("brouillon"),
    audience_roles: yup.array().of(yup.string().oneOf(audienceOptions.map((opt) => opt.value))).default([]),
    group_ids: yup.array().of(yup.number().integer()).default([]),
    capacity: yup
      .number()
      .transform((value) => (Number.isNaN(value) ? undefined : value))
      .nullable()
      .optional()
      .min(1, "الحد الأدنى 1")
      .integer("يجب أن يكون رقماً صحيحاً"),
    attachments: yup
      .array()
      .of(
        yup.object({
          name: yup.string().required("اسم المرفق مطلوب"),
          url: yup
            .string()
            .required("رابط المرفق مطلوب")
            .url("الرجاء إدخال رابط صالح"),
        })
      )
      .default([]),
  })
  .required();

function formatDateTime(value) {
  if (!value) return "—";
  const dt = dayjs(value);
  if (!dt.isValid()) return "—";
  return dt.tz(TZ).locale("ar").format("DD MMMM YYYY، HH:mm");
}

function isoFromLocal(localValue) {
  if (!localValue) return null;
  const parsed = dayjs(localValue);
  if (!parsed.isValid()) return null;
  return parsed.tz(TZ).toISOString();
}

function localFromIso(isoValue) {
  if (!isoValue) return "";
  const dt = dayjs(isoValue);
  if (!dt.isValid()) return "";
  return dt.tz(TZ).format("YYYY-MM-DDTHH:mm");
}

function EventForm({ initialValues, onSubmit, onCancel, submitting }) {
  const [activeTab, setActiveTab] = useState("general");

  const form = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      titre: initialValues?.titre ?? "",
      description: initialValues?.description ?? "",
      date_debut: localFromIso(initialValues?.date_debut) || "",
      date_fin: localFromIso(initialValues?.date_fin) || "",
      lieu: initialValues?.lieu ?? "",
      type: initialValues?.type ?? "interne",
      statut: initialValues?.statut ?? "brouillon",
      audience_roles: initialValues?.audience_roles ?? [],
      group_ids: initialValues?.group_ids ?? [],
      capacity:
        initialValues?.capacity == null || Number.isNaN(Number(initialValues?.capacity))
          ? ""
          : Number(initialValues?.capacity),
      attachments:
        Array.isArray(initialValues?.attachments) && initialValues.attachments.length
          ? initialValues.attachments
          : [],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const { fields, append, remove } = useFieldArray({ control, name: "attachments" });

  useEffect(() => {
    if (!initialValues) return;
    setValue("titre", initialValues.titre ?? "");
    setValue("description", initialValues.description ?? "");
    setValue("date_debut", localFromIso(initialValues.date_debut) || "");
    setValue("date_fin", localFromIso(initialValues.date_fin) || "");
    setValue("lieu", initialValues.lieu ?? "");
    setValue("type", initialValues.type ?? "interne");
    setValue("statut", initialValues.statut ?? "brouillon");
    setValue("audience_roles", initialValues.audience_roles ?? []);
    setValue("group_ids", initialValues.group_ids ?? []);
    setValue(
      "capacity",
      initialValues?.capacity == null || Number.isNaN(Number(initialValues?.capacity))
        ? ""
        : Number(initialValues.capacity)
    );
    setValue(
      "attachments",
      Array.isArray(initialValues?.attachments) ? initialValues.attachments : []
    );
  }, [initialValues, setValue]);

  const onFormSubmit = (values) => {
    const payload = {
      ...values,
      date_debut: isoFromLocal(values.date_debut),
      date_fin: isoFromLocal(values.date_fin),
      capacity: values.capacity === "" ? null : Number(values.capacity),
    };
    onSubmit?.(payload);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(onFormSubmit)(e);
  };

  const selectedRoles = watch("audience_roles") ?? [];

  const toggleAudience = (role) => {
    const current = new Set(selectedRoles);
    if (current.has(role)) current.delete(role);
    else current.add(role);
    setValue("audience_roles", Array.from(current));
  };

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-6" dir="rtl">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "general" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => setActiveTab("general")}
        >
          عام
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "audience" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => setActiveTab("audience")}
        >
          الجمهور
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "attachments" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
          }`}
          onClick={() => setActiveTab("attachments")}
        >
          مرفقات
        </button>
      </div>

      {activeTab === "general" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="col-span-2 flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="titre">
              عنوان الفعالية
            </label>
            <input
              id="titre"
              {...register("titre")}
              type="text"
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-right text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="اكتب عنواناً واضحاً"
            />
            {errors.titre ? <p className="text-xs text-rose-600">{errors.titre.message}</p> : null}
          </div>

          <div className="col-span-2 flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="description">
              وصف مختصر
            </label>
            <textarea
              id="description"
              {...register("description")}
              rows={4}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-right text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="قدّم تفاصيل إضافية عن الفعالية"
            />
            {errors.description ? (
              <p className="text-xs text-rose-600">{errors.description.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="date_debut">
              تاريخ البداية
            </label>
            <input
              id="date_debut"
              {...register("date_debut")}
              type="datetime-local"
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
            />
            {errors.date_debut ? (
              <p className="text-xs text-rose-600">{errors.date_debut.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="date_fin">
              تاريخ النهاية
            </label>
            <input
              id="date_fin"
              {...register("date_fin")}
              type="datetime-local"
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
            />
            {errors.date_fin ? <p className="text-xs text-rose-600">{errors.date_fin.message}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="lieu">
              المكان
            </label>
            <input
              id="lieu"
              {...register("lieu")}
              type="text"
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="حدد مكان الفعالية"
            />
            {errors.lieu ? <p className="text-xs text-rose-600">{errors.lieu.message}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="type">
              نوع الفعالية
            </label>
            <select
              id="type"
              {...register("type")}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="interne">داخلي</option>
              <option value="public">عام</option>
            </select>
            {errors.type ? <p className="text-xs text-rose-600">{errors.type.message}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="statut">
              حالة الفعالية
            </label>
            <select
              id="statut"
              {...register("statut")}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="brouillon">مسودة</option>
              <option value="publie">منشور</option>
              <option value="annule">ملغى</option>
            </select>
            {errors.statut ? <p className="text-xs text-rose-600">{errors.statut.message}</p> : null}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="capacity">
              السعة (اختياري)
            </label>
            <input
              id="capacity"
              {...register("capacity")}
              type="number"
              min={1}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="عدد الأماكن المتاحة"
            />
            {errors.capacity ? (
              <p className="text-xs text-rose-600">{errors.capacity.message}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {activeTab === "audience" ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            حدد الأدوار أو المجموعات المستهدفة بالفعالية. يمكنك تركها فارغة لتكون عامة حسب نوع الفعالية.
          </p>
          <div className="flex flex-wrap gap-2">
            {audienceOptions.map((opt) => {
              const active = selectedRoles.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleAudience(opt.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    active ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <label className="text-sm font-semibold text-gray-700" htmlFor="group_ids">
            المجموعات (اكتب المعرّفات مفصولة بفاصلة)
          </label>
          <input
            id="group_ids"
            type="text"
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="مثال: 12, 45, 51"
            value={(watch("group_ids") ?? []).join(", ")}
            onChange={(e) => {
              const values = e.target.value
                .split(",")
                .map((part) => part.trim())
                .filter(Boolean)
                .map((v) => Number(v))
                .filter((n) => !Number.isNaN(n));
              setValue("group_ids", values);
            }}
          />
          {errors.group_ids ? (
            <p className="text-xs text-rose-600">{errors.group_ids.message}</p>
          ) : null}
        </div>
      ) : null}

      {activeTab === "attachments" ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">أضف روابط للوثائق أو الصور المتعلقة بالفعالية.</p>
            <button
              type="button"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={() =>
                append({
                  name: "",
                  url: "",
                })
              }
            >
              إضافة مرفق
            </button>
          </div>
          {fields.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400">
              لا توجد مرفقات حالياً
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {fields.map((field, idx) => (
                <div key={field.id} className="rounded-2xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700" htmlFor={`attachment-name-${idx}`}>
                      اسم المرفق
                    </label>
                    <input
                      id={`attachment-name-${idx}`}
                      {...register(`attachments.${idx}.name`)}
                      type="text"
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
                      placeholder="اسم واضح للمرفق"
                    />
                    {errors.attachments?.[idx]?.name ? (
                      <p className="text-xs text-rose-600">{errors.attachments[idx].name?.message}</p>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700" htmlFor={`attachment-url-${idx}`}>
                      رابط المرفق
                    </label>
                    <input
                      id={`attachment-url-${idx}`}
                      {...register(`attachments.${idx}.url`)}
                      type="url"
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
                      placeholder="https://example.com/file.pdf"
                    />
                    {errors.attachments?.[idx]?.url ? (
                      <p className="text-xs text-rose-600">{errors.attachments[idx].url?.message}</p>
                    ) : null}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-600"
                      onClick={() => remove(idx)}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="flex justify-between gap-3">
        <button
          type="button"
          className="rounded-full border border-gray-200 px-6 py-2 text-sm font-semibold text-gray-600 hover:border-gray-300"
          onClick={() => onCancel?.()}
        >
          إلغاء
        </button>
        <button
          type="button"
          className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={handleFormSubmit}
          disabled={submitting}
        >
          {submitting ? "جار الحفظ..." : "حفظ"}
        </button>
      </div>
    </form>
  );
}

function DetailsDrawer({ open, eventId, onClose, onEdit, onPublish, onCancel }) {
  const { data: eventData, isLoading } = useEvent(eventId, { enabled: open && Boolean(eventId) });
  const { data: attendees } = useAttendees(eventId, { enabled: open && Boolean(eventId) });

  const attendeeCount = Array.isArray(attendees) ? attendees.length : eventData?.attendees_count ?? 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end" dir="rtl">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative z-40 flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">تفاصيل الفعالية</h3>
          <button type="button" className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="flex-1 space-y-6 px-6 py-6">
          {isLoading ? (
            <p className="text-sm text-gray-500">جار التحميل...</p>
          ) : eventData ? (
            <>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-gray-900">{eventData.titre}</h4>
                <p className="text-sm text-gray-600">{eventData.description || "لا يوجد وصف"}</p>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statutBadgeClasses[eventData.statut] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {statutLabels[eventData.statut] ?? "غير محدد"}
                  </span>
                  {eventData.type ? (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        typeBadgeClasses[eventData.type] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {typeLabels[eventData.type] ?? eventData.type}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <dl className="grid grid-cols-1 gap-3 text-sm text-gray-700">
                  <div className="flex flex-col">
                    <dt className="text-xs text-gray-500">البداية</dt>
                    <dd>{formatDateTime(eventData.date_debut)}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-xs text-gray-500">النهاية</dt>
                    <dd>{formatDateTime(eventData.date_fin)}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-xs text-gray-500">المكان</dt>
                    <dd>{eventData.lieu || "—"}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-xs text-gray-500">آخر تحديث</dt>
                    <dd>{formatDateTime(eventData.updated_at || eventData.updatedAt)}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-xs text-gray-500">السعة</dt>
                    <dd>
                      {eventData.capacity ? (
                        <span>
                          {eventData.capacity} مقعدًا — الحضور: {attendeeCount}
                          {eventData.capacity ? (
                            <span className="ms-1 text-xs text-indigo-500">عرض الحضور</span>
                          ) : null}
                        </span>
                      ) : (
                        "غير محددة"
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <h5 className="text-sm font-semibold text-gray-800">الجمهور المستهدف</h5>
                {Array.isArray(eventData.audience_roles) && eventData.audience_roles.length ? (
                  <div className="flex flex-wrap gap-2">
                    {eventData.audience_roles.map((role) => (
                      <span key={role} className="rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-700">
                        {audienceOptions.find((opt) => opt.value === role)?.label ?? role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">غير محدد - الفعالية مفتوحة حسب النوع.</p>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <h5 className="text-sm font-semibold text-gray-800">المرفقات</h5>
                {Array.isArray(eventData.attachments) && eventData.attachments.length ? (
                  <ul className="list-disc space-y-2 pe-5 text-indigo-600">
                    {eventData.attachments.map((att) => (
                      <li key={att.url}>
                        <a href={att.url} className="hover:underline" target="_blank" rel="noreferrer">
                          {att.name || att.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">لا توجد مرفقات.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">تعذر تحميل بيانات الفعالية.</p>
          )}
        </div>
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => onEdit?.(eventData)}
            >
              تعديل
            </button>
            <button
              type="button"
              className="rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600"
              onClick={() => onPublish?.(eventData)}
            >
              نشر
            </button>
            <button
              type="button"
              className="rounded-full border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-600"
              onClick={() => onCancel?.(eventData)}
            >
              إلغاء
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function computeRangeParams(duration, customFrom, customTo) {
  const now = dayjs().tz(TZ);
  if (duration === "day") {
    return { date_from: now.startOf("day").toISOString(), date_to: now.endOf("day").toISOString() };
  }
  if (duration === "week") {
    return { date_from: now.startOf("week").toISOString(), date_to: now.endOf("week").toISOString() };
  }
  if (duration === "month") {
    return { date_from: now.startOf("month").toISOString(), date_to: now.endOf("month").toISOString() };
  }
  return {
    date_from: customFrom ? isoFromLocal(customFrom) : undefined,
    date_to: customTo ? isoFromLocal(customTo) : undefined,
  };
}

function BulkBar({ selectedCount, onPublish, onCancel, onClear }) {
  if (selectedCount === 0) return null;
  return (
    <div className="sticky top-24 z-20 flex w-full items-center justify-between rounded-2xl border border-indigo-200 bg-white/90 px-6 py-3 shadow" dir="rtl">
      <p className="text-sm font-semibold text-gray-700">تم تحديد {selectedCount} فعالية</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600"
          onClick={onPublish}
        >
          نشر المحدد
        </button>
        <button
          type="button"
          className="rounded-full border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-600"
          onClick={onCancel}
        >
          إلغاء المحدد
        </button>
        <button
          type="button"
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600"
          onClick={onClear}
        >
          مسح التحديد
        </button>
      </div>
    </div>
  );
}

export default function AllEvents() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [calendarRange, setCalendarRange] = useState({ start: null, end: null });
  const [selectedRows, setSelectedRows] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorId, setEditorId] = useState(null);
  const [editorInitial, setEditorInitial] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const view = searchParams.get("view") || "calendar";
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const statut = searchParams.get("statut") || "";
  const anneeId = searchParams.get("annee_id") || "";
  const groupeId = searchParams.get("groupe_id") || "";
  const duration = searchParams.get("duration") || "month";
  const customFrom = searchParams.get("date_from") || "";
  const customTo = searchParams.get("date_to") || "";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(5, Number(searchParams.get("limit") || 10)));

  const [searchDraft, setSearchDraft] = useState(search);
  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (searchDraft) next.set("search", searchDraft);
      else next.delete("search");
      next.set("page", "1");
      setSearchParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchDraft, searchParams, setSearchParams]);

  const rangeParams = useMemo(() => computeRangeParams(duration, customFrom, customTo), [
    duration,
    customFrom,
    customTo,
  ]);

  const listQuery = useEventsQuery(
    {
      search: search || undefined,
      type: type || undefined,
      statut: statut || undefined,
      annee_id: anneeId || undefined,
      groupe_id: groupeId || undefined,
      date_from: rangeParams.date_from,
      date_to: rangeParams.date_to,
      page,
      limit,
    },
    { enabled: view === "list" }
  );

  const items = listQuery.data?.items ?? [];
  const meta = listQuery.data?.meta ?? { total: 0, page, limit };
  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / meta.limit));

  useEffect(() => {
    if (view === "list") {
      setSelectedRows([]);
    }
  }, [view, page, limit, search, type, statut, anneeId, groupeId, duration, customFrom, customTo]);

  const calendarQuery = useCalendarEventsQuery(
    {
      start: calendarRange.start,
      end: calendarRange.end,
      annee_id: anneeId || undefined,
      groupe_id: groupeId || undefined,
    },
    {
      enabled:
        view === "calendar" && Boolean(calendarRange.start) && Boolean(calendarRange.end),
    }
  );

  const createMutation = useCreateEvent({
    onSuccess: () => {
      toast?.("تم إنشاء الفعالية ✅", "success");
      setEditorOpen(false);
      setEditorId(null);
      setEditorInitial(null);
    },
    onError: (err) => {
      toast?.(err?.response?.data?.message || "تعذر إنشاء الفعالية", "error");
    },
  });

  const updateMutation = useUpdateEvent({
    onSuccess: () => {
      toast?.("تم تحديث الفعالية ✅", "success");
      setEditorOpen(false);
      setEditorId(null);
      setEditorInitial(null);
    },
    onError: (err) => {
      toast?.(err?.response?.data?.message || "تعذر تحديث الفعالية", "error");
    },
  });

  const publishMutation = usePublishEvent({
    onSuccess: () => {
      toast?.("تم تنفيذ العملية ✅", "success");
    },
    onError: (err) => {
      toast?.(err?.response?.data?.message || "تعذر نشر الفعالية", "error");
    },
  });

  const cancelMutation = useCancelEvent({
    onSuccess: () => {
      toast?.("تم تنفيذ العملية ✅", "success");
    },
    onError: (err) => {
      toast?.(err?.response?.data?.message || "تعذر إلغاء الفعالية", "error");
    },
  });

  const { data: editorFetched } = useEvent(editorId, { enabled: editorOpen && Boolean(editorId) });

  const openCreate = (preset = null) => {
    setEditorId(null);
    setEditorInitial(preset);
    setEditorOpen(true);
  };

  const openEdit = (event) => {
    setEditorId(event?.id ?? null);
    setEditorInitial(event || null);
    setEditorOpen(true);
  };

  const openDrawer = (event) => {
    setDetailId(event?.id ?? null);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDetailId(null);
  };

  const changeView = (nextView) => {
    const next = new URLSearchParams(searchParams);
    next.set("view", nextView);
    if (nextView === "calendar") {
      next.delete("page");
    } else {
      next.set("page", String(page));
    }
    setSearchParams(next, { replace: true });
  };

  const setParam = (key, value, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    if (value == null || value === "") next.delete(key);
    else next.set(key, String(value));
    if (resetPage) next.set("page", "1");
    setSearchParams(next, { replace: true });
  };

  const handlePageChange = (delta) => {
    const nextPage = Math.min(totalPages, Math.max(1, page + delta));
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next, { replace: true });
  };

  const handleLimitChange = (value) => {
    const next = new URLSearchParams(searchParams);
    next.set("limit", String(value));
    next.set("page", "1");
    setSearchParams(next, { replace: true });
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) => {
      if (prev.includes(id)) return prev.filter((rowId) => rowId !== id);
      return [...prev, id];
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === items.length) setSelectedRows([]);
    else setSelectedRows(items.map((item) => item.id));
  };

  const handleSubmitEvent = (payload) => {
    if (editorId) {
      updateMutation.mutate({ id: editorId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const runBulkAction = async (action) => {
    const targets = selectedRows.slice();
    if (!targets.length) return;
    try {
      if (action === "publish") {
        await Promise.all(targets.map((id) => publishMutation.mutateAsync(id)));
      } else if (action === "cancel") {
        await Promise.all(targets.map((id) => cancelMutation.mutateAsync(id)));
      }
      toast?.("تم تنفيذ العملية ✅", "success");
      setSelectedRows([]);
    } catch (err) {
      toast?.(err?.response?.data?.message || "حدث خطأ أثناء تنفيذ العملية", "error");
    }
  };

  const confirmAndRun = (action, targetId) => {
    setConfirmAction({ action, targetId });
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { action, targetId } = confirmAction;
    if (targetId) {
      if (action === "publish") publishMutation.mutate(targetId);
      if (action === "cancel") cancelMutation.mutate(targetId);
    } else {
      runBulkAction(action);
    }
    setConfirmAction(null);
  };

  const handleCalendarCreate = (day) => {
    const startIso = dayjs(day).tz(TZ).startOf("hour").toISOString();
    const endIso = dayjs(day).tz(TZ).startOf("hour").add(2, "hour").toISOString();
    openCreate({ date_debut: startIso, date_fin: endIso });
  };

  const calendarEvents = (calendarQuery.data ?? []).map((event) => ({
    ...event,
    title: event.title || event.titre,
  }));

  const formInitialValues = editorId
    ? editorFetched || editorInitial || null
    : editorInitial;

  useEffect(() => {
    if (listQuery.isError) {
      toast?.(
        listQuery.error?.response?.data?.message || "تعذر تحميل قائمة الفعاليات",
        "error"
      );
    }
  }, [listQuery.isError, listQuery.error, toast]);

  useEffect(() => {
    if (calendarQuery.isError) {
      toast?.(
        calendarQuery.error?.response?.data?.message || "تعذر تحميل فعاليات التقويم",
        "error"
      );
    }
  }, [calendarQuery.isError, calendarQuery.error, toast]);

  return (
    <div className="flex flex-col gap-6 px-4 py-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الفعاليات</h1>
          <p className="text-sm text-gray-500">إدارة الفعاليات من خلال التقويم أو القائمة التفصيلية.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              view === "calendar" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => changeView("calendar")}
          >
            التقويم
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              view === "list" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => changeView("list")}
          >
            قائمة
          </button>
          <button
            type="button"
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={openCreate}
          >
            إضافة فعالية
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600">بحث</label>
            <input
              type="text"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="ابحث بعنوان أو وصف أو مكان"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600">المدة</label>
            <select
              value={duration}
              onChange={(e) => {
                setParam("duration", e.target.value);
                if (e.target.value !== "custom") {
                  setParam("date_from", null, { resetPage: false });
                  setParam("date_to", null, { resetPage: false });
                }
              }}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {durationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600">نوع الفعالية</label>
            <select
              value={type}
              onChange={(e) => setParam("type", e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">الكل</option>
              <option value="interne">داخلي</option>
              <option value="public">عام</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600">حالة النشر</label>
            <select
              value={statut}
              onChange={(e) => setParam("statut", e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">الكل</option>
              <option value="brouillon">مسودة</option>
              <option value="publie">منشور</option>
              <option value="annule">ملغى</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600">السنة الدراسية</label>
            <input
              type="text"
              value={anneeId}
              onChange={(e) => setParam("annee_id", e.target.value)}
              placeholder="مثال: 2024"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600">المجموعة</label>
            <input
              type="text"
              value={groupeId}
              onChange={(e) => setParam("groupe_id", e.target.value)}
              placeholder="معرّف المجموعة"
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          {duration === "custom" ? (
            <Fragment>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600">من تاريخ</label>
                <input
                  type="datetime-local"
                  value={customFrom}
                  onChange={(e) => setParam("date_from", e.target.value)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600">إلى تاريخ</label>
                <input
                  type="datetime-local"
                  value={customTo}
                  onChange={(e) => setParam("date_to", e.target.value)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </Fragment>
          ) : null}
        </div>
      </div>

      {view === "calendar" ? (
        <EventsCalendar
          events={calendarEvents}
          onCreate={handleCalendarCreate}
          onEventClick={(event) => openDrawer(event)}
          onRangeChange={(range) => setCalendarRange(range)}
          loading={calendarQuery.isLoading}
        />
      ) : null}

      {view === "list" ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <BulkBar
            selectedCount={selectedRows.length}
            onPublish={() => confirmAndRun("publish")}
            onCancel={() => confirmAndRun("cancel")}
            onClear={() => setSelectedRows([])}
          />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" dir="rtl">
              <thead className="bg-gray-50">
                <tr className="text-right text-xs font-semibold text-gray-600">
                  <th className="sticky top-0 bg-gray-50 px-3 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedRows.length === items.length && items.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="sticky top-0 bg-gray-50 px-3 py-3">العنوان</th>
                  <th className="sticky top-0 bg-gray-50 px-3 py-3">التاريخ/المدة</th>
                  <th className="sticky top-0 bg-gray-50 px-3 py-3">المكان</th>
                  <th className="sticky top-0 bg-gray-50 px-3 py-3">النوع</th>
                  <th className="sticky top-0 bg-gray-50 px-3 py-3">الحالة</th>
                  <th className="sticky top-0 bg-gray-50 px-3 py-3">المنظم</th>
                  <th className="sticky top-0 bg-gray-50 px-3 py-3">آخر تحديث</th>
                  <th className="sticky top-0 bg-gray-50 px-3 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listQuery.isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-10 text-center text-sm text-gray-500">
                      جار التحميل...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-10 text-center text-sm text-gray-500">
                      لا توجد فعاليات مطابقة للمعايير الحالية.
                    </td>
                  </tr>
                ) : (
                  items.map((event) => {
                    const selected = selectedRows.includes(event.id);
                    return (
                      <tr key={event.id} className="hover:bg-indigo-50/40">
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={selected}
                            onChange={() => toggleRowSelection(event.id)}
                          />
                        </td>
                        <td className="px-3 py-3 text-sm font-semibold text-gray-800">{event.titre}</td>
                        <td className="px-3 py-3 text-xs text-gray-600">
                          <div>{formatDateTime(event.date_debut)}</div>
                          <div className="text-[11px] text-gray-400">{formatDateTime(event.date_fin)}</div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600">{event.lieu || "—"}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              typeBadgeClasses[event.type] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {typeLabels[event.type] ?? event.type}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              statutBadgeClasses[event.statut] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {statutLabels[event.statut] ?? event.statut}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600">{event.organisateur || "—"}</td>
                        <td className="px-3 py-3 text-xs text-gray-500">{formatDateTime(event.updated_at)}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2 text-xs font-semibold">
                            <button
                              type="button"
                              className="rounded-full bg-gray-100 px-3 py-1 text-gray-600"
                              onClick={() => openDrawer(event)}
                            >
                              عرض
                            </button>
                            <button
                              type="button"
                              className="rounded-full bg-indigo-600 px-3 py-1 text-white"
                              onClick={() => openEdit(event)}
                            >
                              تعديل
                            </button>
                            <button
                              type="button"
                              className="rounded-full border border-emerald-500 px-3 py-1 text-emerald-600"
                              onClick={() => confirmAndRun("publish", event.id)}
                            >
                              نشر
                            </button>
                            <button
                              type="button"
                              className="rounded-full border border-rose-400 px-3 py-1 text-rose-600"
                              onClick={() => confirmAndRun("cancel", event.id)}
                            >
                              إلغاء
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {items.length ? (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full border border-gray-200 px-3 py-1"
                  onClick={() => handlePageChange(-1)}
                  disabled={page <= 1}
                >
                  السابق
                </button>
                <span>
                  صفحة {meta.page} من {totalPages}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-gray-200 px-3 py-1"
                  onClick={() => handlePageChange(1)}
                  disabled={page >= totalPages}
                >
                  التالي
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span>العناصر لكل صفحة</span>
                <select
                  className="rounded-xl border border-gray-200 px-3 py-1"
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                >
                  {[10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editorId ? "تعديل الفعالية" : "فعالية جديدة"}
        size="xl"
      >
        <EventForm
          initialValues={formInitialValues}
          onSubmit={handleSubmitEvent}
          onCancel={() => {
            setEditorOpen(false);
            setEditorId(null);
            setEditorInitial(null);
          }}
          submitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      <DetailsDrawer
        open={drawerOpen}
        eventId={detailId}
        onClose={closeDrawer}
        onEdit={(event) => {
          setDrawerOpen(false);
          openEdit(event);
        }}
        onPublish={(event) => confirmAndRun("publish", event?.id)}
        onCancel={(event) => confirmAndRun("cancel", event?.id)}
      />

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title="تأكيد العملية"
        message="هل أنت متأكد من تنفيذ هذه العملية؟"
        confirmText="تأكيد"
        cancelText="إلغاء"
        onConfirm={handleConfirm}
       onClose={() => setConfirmAction(null)}
      />
    </div>
  );
}
