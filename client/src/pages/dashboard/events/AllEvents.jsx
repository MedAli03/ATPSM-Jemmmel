import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  deleteEvent,
  updateEvent,
} from "../../../api/events";
import { useEventsPage } from "../../../hooks/useEventsPage";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { useToast } from "../../../components/common/ToastProvider";

const AUDIENCE_OPTIONS = [
  { value: "", label: "كلّ الفئات" },
  { value: "tous", label: "الجميع" },
  { value: "parents", label: "الأولياء" },
  { value: "educateurs", label: "المربّون" },
];

const AUDIENCE_LABELS = {
  tous: "الجميع",
  parents: "الأولياء",
  educateurs: "المربّون",
};

const dtFormatter = new Intl.DateTimeFormat("ar", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return dtFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function toDateStart(value) {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00`).toISOString();
}

function toDateEnd(value) {
  if (!value) return undefined;
  return new Date(`${value}T23:59:59`).toISOString();
}

export default function AllEvents() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [audience, setAudience] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);

  const params = useMemo(
    () => ({
      page,
      limit,
      q: search.trim(),
      audience,
      date_debut: toDateStart(fromDate),
      date_fin: toDateEnd(toDate),
    }),
    [page, limit, search, audience, fromDate, toDate]
  );

  const eventsQuery = useEventsPage(params);
  const data = eventsQuery.data ?? {};
  const rows = data.rows ?? [];
  const count = data.count ?? 0;
  const resolvedLimit = data.limit ?? limit;
  const totalPages = Math.max(
    1,
    Math.ceil(count / (resolvedLimit ? Number(resolvedLimit) : 1))
  );

  useEffect(() => {
    setPage(1);
  }, [search, audience, fromDate, toDate, limit]);

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? updateEvent(id, payload) : createEvent(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setShowForm(false);
      setEditingEvent(null);
      toast?.(
        variables?.id
          ? "تم حفظ تعديلات الفعالية بنجاح ✅"
          : "تم إنشاء الفعالية بنجاح ✅",
        "success"
      );
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "تعذّر حفظ بيانات الفعالية ❌";
      toast?.(message, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setEventToDelete(null);
      toast?.("تم حذف الفعالية بنجاح ✅", "success");
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "تعذّر حذف الفعالية ❌";
      toast?.(message, "error");
    },
  });

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleSaveEvent = async (values) => {
    const { debut, fin } = values;
    const start = new Date(debut);
    const end = new Date(fin);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast?.("يجب تحديد تاريخي البداية والنهاية", "error");
      return;
    }

    if (start >= end) {
      toast?.("يجب أن يكون تاريخ نهاية الفعالية بعد بدايتها", "error");
      return;
    }

    const payload = {
      titre: values.titre.trim(),
      description: values.description?.trim() || undefined,
      debut: start.toISOString(),
      fin: end.toISOString(),
      audience: values.audience || "tous",
      lieu: values.lieu?.trim() || undefined,
    };

    if (!payload.description) delete payload.description;
    if (!payload.lieu) delete payload.lieu;

    if (values.document_id) {
      payload.document_id = Number(values.document_id);
    } else if (editingEvent?.document_id) {
      payload.document_id = null;
    }

    await saveMutation.mutateAsync({ id: editingEvent?.id, payload });
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    await deleteMutation.mutateAsync(eventToDelete.id);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الفعاليات</h1>
          <p className="text-sm text-gray-500">
            إدارة الفعاليات القادمة مع إمكانية البحث، التصفية، والتحكم الكامل.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={handleAddEvent}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 4a1 1 0 011 1v4h4a1 1 0 010 2h-4v4a1 1 0 01-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
            </svg>
            إضافة فعالية
          </button>
          <button
            onClick={() => eventsQuery.refetch()}
            className="px-3 py-2 rounded-xl border text-sm hover:bg-gray-50"
          >
            تحديث
          </button>
        </div>
      </header>

      <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-wrap gap-3 items-end px-4 py-4 border-b bg-gray-50">
          <label className="flex flex-col text-xs text-gray-500 gap-1">
            البحث
            <div className="flex items-center bg-white rounded-xl px-3 py-2 border text-gray-700">
              <svg
                className="w-5 h-5 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 21l-4.35-4.35M11 18a7 7 0 110-14 7 7 0 010 14z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث في العنوان أو المكان…"
                className="bg-transparent outline-none pr-2 text-sm w-56"
              />
            </div>
          </label>

          <label className="flex flex-col text-xs text-gray-500 gap-1">
            الفئة المستهدفة
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="px-3 py-2 rounded-xl border bg-white text-sm"
            >
              {AUDIENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs text-gray-500 gap-1">
            من تاريخ
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 rounded-xl border bg-white text-sm"
            />
          </label>

          <label className="flex flex-col text-xs text-gray-500 gap-1">
            إلى تاريخ
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 rounded-xl border bg-white text-sm"
            />
          </label>

          <label className="flex flex-col text-xs text-gray-500 gap-1">
            العناصر لكل صفحة
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border bg-white text-sm"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / صفحة
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b text-sm text-gray-500">
          <div className="col-span-1">#</div>
          <div className="col-span-3">العنوان</div>
          <div className="col-span-2">الفترة</div>
          <div className="col-span-2">الفئة</div>
          <div className="col-span-2">المكان</div>
          <div className="col-span-1">المسؤول</div>
          <div className="col-span-1 text-center">إجراءات</div>
        </div>

        {eventsQuery.isLoading ? (
          <div className="p-4">
            <div className="space-y-3 animate-pulse">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ) : eventsQuery.isError ? (
          <div className="p-6 text-red-600 text-sm">
            تعذّر تحميل قائمة الفعاليات.
            <button
              onClick={() => eventsQuery.refetch()}
              className="mr-2 text-blue-600"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            لا توجد فعاليات مطابقة للبحث الحالي.
          </div>
        ) : (
          <ul className="divide-y">
            {rows.map((event) => (
              <li
                key={event.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 text-sm text-gray-700"
              >
                <div className="col-span-1 font-medium text-gray-900">
                  {event.id}
                </div>
                <div className="col-span-3 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {event.titre}
                  </div>
                  {event.description ? (
                    <p className="text-xs text-gray-500 truncate">
                      {event.description}
                    </p>
                  ) : null}
                </div>
                <div className="col-span-2 text-gray-700">
                  <div>{formatDateTime(event.debut)}</div>
                  <div className="text-xs text-gray-500">
                    {formatDateTime(event.fin)}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-600">
                    {AUDIENCE_LABELS[event.audience] || "غير محدد"}
                  </span>
                </div>
                <div className="col-span-2 text-gray-700 truncate">
                  {event.lieu || "—"}
                </div>
                <div className="col-span-1 text-gray-600 truncate">
                  {event.admin
                    ? `${event.admin.prenom ?? ""} ${event.admin.nom ?? ""}`.trim() ||
                      event.admin.email ||
                      "—"
                    : "—"}
                </div>
                <div className="col-span-1 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="px-2 py-1 rounded-lg border text-xs hover:bg-gray-50"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => setEventToDelete(event)}
                    className="px-2 py-1 rounded-lg border border-rose-300 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t text-sm text-gray-600">
          <div>
            الصفحة <b>{page}</b> من <b>{totalPages}</b> (إجمالي {count} فعالية)
            {eventsQuery.isFetching && !eventsQuery.isLoading && (
              <span className="ml-2 text-gray-400">(يتم التحديث…)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border disabled:opacity-50"
              disabled={page <= 1}
            >
              السابق
            </button>
            <span className="text-xs text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border disabled:opacity-50"
              disabled={page >= totalPages}
            >
              التالي
            </button>
          </div>
        </div>
      </section>

      <EventFormDialog
        open={showForm}
        initialData={editingEvent}
        onClose={() => {
          if (saveMutation.isLoading) return;
          setShowForm(false);
          setEditingEvent(null);
        }}
        onSubmit={handleSaveEvent}
        isSubmitting={saveMutation.isLoading}
      />

      <ConfirmDialog
        open={Boolean(eventToDelete)}
        title="حذف الفعالية"
        description={`هل ترغب حقًا في حذف الفعالية '${
          eventToDelete?.titre ?? ""
        }'؟ لا يمكن التراجع عن هذه العملية.`}
        confirmText="حذف"
        cancelText="إلغاء"
        loading={deleteMutation.isLoading}
        onClose={() => {
          if (deleteMutation.isLoading) return;
          setEventToDelete(null);
        }}
        onConfirm={handleDeleteEvent}
      />
    </div>
  );
}

function toInputDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => `${n}`.padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function EventFormDialog({ open, initialData, onClose, onSubmit, isSubmitting }) {
  const [form, setForm] = useState(() => buildInitialState(initialData));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(buildInitialState(initialData));
      setErrors({});
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.titre.trim()) nextErrors.titre = "العنوان مطلوب";
    if (!form.debut) nextErrors.debut = "تاريخ البداية مطلوب";
    if (!form.fin) nextErrors.fin = "تاريخ النهاية مطلوب";

    if (form.debut && form.fin) {
      const start = new Date(form.debut);
      const end = new Date(form.fin);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        if (start >= end) {
          nextErrors.fin = "يجب أن يكون تاريخ النهاية بعد البداية";
        }
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        dir="rtl"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? "تعديل فعالية" : "إضافة فعالية"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <span className="sr-only">إغلاق</span>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              عنوان الفعالية
            </label>
            <input
              type="text"
              value={form.titre}
              onChange={handleChange("titre")}
              className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: يوم مفتوح للتوعية"
              disabled={isSubmitting}
            />
            {errors.titre ? (
              <p className="text-xs text-rose-600 mt-1">{errors.titre}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الوصف التفصيلي
            </label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              rows={4}
              className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أضف تفاصيل إضافية حول الفعالية"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                يبدأ في
              </label>
              <input
                type="datetime-local"
                value={form.debut}
                onChange={handleChange("debut")}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              {errors.debut ? (
                <p className="text-xs text-rose-600 mt-1">{errors.debut}</p>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ينتهي في
              </label>
              <input
                type="datetime-local"
                value={form.fin}
                onChange={handleChange("fin")}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              {errors.fin ? (
                <p className="text-xs text-rose-600 mt-1">{errors.fin}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الفئة المستهدفة
              </label>
              <select
                value={form.audience}
                onChange={handleChange("audience")}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                {AUDIENCE_OPTIONS.filter((option) => option.value !== "").map(
                  (option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الموقع
              </label>
              <input
                type="text"
                value={form.lieu}
                onChange={handleChange("lieu")}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: مقرّ الجمعية"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رقم المستند المرتبط (اختياري)
            </label>
            <input
              type="number"
              value={form.document_id}
              onChange={handleChange("document_id")}
              className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل الرقم إن وجد"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جارٍ الحفظ…" : initialData ? "حفظ التعديلات" : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function buildInitialState(event) {
  if (!event) {
    return {
      titre: "",
      description: "",
      debut: "",
      fin: "",
      audience: "tous",
      lieu: "",
      document_id: "",
    };
  }

  return {
    titre: event.titre ?? "",
    description: event.description ?? "",
    debut: toInputDateTime(event.debut),
    fin: toInputDateTime(event.fin),
    audience: event.audience ?? "tous",
    lieu: event.lieu ?? "",
    document_id:
      event.document_id === null || event.document_id === undefined
        ? ""
        : String(event.document_id),
  };
}

