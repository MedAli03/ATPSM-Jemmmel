// src/pages/dashboard/news/AllNews.jsx
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import {
  createNews,
  deleteNews,
  getNews,
  listNews,
  toggleNewsPin,
  updateNews,
  updateNewsStatus,
} from "../../../api/news";
import { useToast } from "../../../components/common/ToastProvider";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Modal from "../../../components/common/Modal";

const statusLabels = {
  draft: "مسودة",
  published: "منشور",
  scheduled: "مجدول",
};

const statusOptions = [
  { value: "all", label: "الكل" },
  { value: "draft", label: "مسودة" },
  { value: "published", label: "منشور" },
  { value: "scheduled", label: "مجدول" },
];

const TITLE_LIMIT = 200;
const SUMMARY_LIMIT = 500;

const dateFormatter = new Intl.DateTimeFormat("ar-TN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
};

export default function AllNews() {
  const toast = useToast();
  const qc = useQueryClient();

  const [searchDraft, setSearchDraft] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    pinnedOnly: false,
    from: "",
    to: "",
    page: 1,
    limit: 10,
  });

  const listQuery = useQuery({
    queryKey: ["news", "list", filters],
    queryFn: () =>
      listNews({
        search: filters.search,
        status: filters.status,
        pinnedOnly: filters.pinnedOnly,
        from: filters.from || undefined,
        to: filters.to || undefined,
        page: filters.page,
        limit: filters.limit,
      }),
    keepPreviousData: true,
  });

  const items = listQuery.data?.items ?? [];
  const meta = listQuery.data?.meta ?? { page: filters.page, limit: filters.limit, total: 0 };
  const lastPage = Math.max(1, Math.ceil((meta.total || 0) / meta.limit));

  useEffect(() => {
    if (!listQuery.isFetching && meta.page && meta.page !== filters.page) {
      setFilters((prev) => ({ ...prev, page: meta.page }));
    }
  }, [meta.page, filters.page, listQuery.isFetching]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [scheduleTarget, setScheduleTarget] = useState(null);

  const editorQuery = useQuery({
    queryKey: ["news", "item", editingId],
    queryFn: () => getNews(editingId),
    enabled: editorOpen && Boolean(editingId),
  });

  const createMut = useMutation({
    mutationFn: createNews,
    onSuccess: (data) => {
      toast?.("تم إنشاء الخبر بنجاح ✅", "success");
      qc.invalidateQueries({ queryKey: ["news", "list"] });
      setEditorOpen(false);
      setEditingId(null);
      if (data?.id) {
        qc.invalidateQueries({ queryKey: ["news", "item", data.id] });
      }
    },
    onError: (err) => {
      toast?.(err?.response?.data?.message || "تعذر إنشاء الخبر ❌", "error");
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateNews(id, payload),
    onSuccess: (data, vars) => {
      toast?.("تم حفظ التعديلات ✅", "success");
      qc.invalidateQueries({ queryKey: ["news", "list"] });
      qc.invalidateQueries({ queryKey: ["news", "item", vars.id] });
      setEditorOpen(false);
      setEditingId(null);
    },
    onError: (err) => {
      toast?.(err?.response?.data?.message || "تعذر حفظ التعديلات ❌", "error");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteNews,
    onSuccess: () => {
      toast?.("تم حذف الخبر بنجاح ✅", "success");
      qc.invalidateQueries({ queryKey: ["news", "list"] });
      if (editingId) qc.invalidateQueries({ queryKey: ["news", "item", editingId] });
    },
    onError: (err) => {
      toast?.(err?.response?.data?.message || "تعذر الحذف ❌", "error");
    },
    onSettled: () => setDeleteId(null),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, statut, publie_le }) => updateNewsStatus(id, { statut, publie_le }),
    onSuccess: (_, vars) => {
      toast?.("تم تحديث حالة الخبر ✅", "success");
      qc.invalidateQueries({ queryKey: ["news", "list"] });
      qc.invalidateQueries({ queryKey: ["news", "item", vars.id] });
    },
    onError: (err) => {
      toast?.(err?.response?.data?.message || "تعذر تحديث الحالة ❌", "error");
    },
    onSettled: () => setScheduleTarget(null),
  });

  const pinMut = useMutation({
    mutationFn: ({ id, next }) => toggleNewsPin(id, next),
    onMutate: async ({ id, next }) => {
      await qc.cancelQueries({ queryKey: ["news", "list"] });
      const previous = qc.getQueriesData({ queryKey: ["news", "list"] });
      previous.forEach(([key, data]) => {
        if (!data) return;
        qc.setQueryData(key, (old) => {
          if (!old) return old;
          const updatedItems = (old.items || []).map((item) =>
            item.id === id ? { ...item, epingle: next } : item
          );
          return { ...old, items: updatedItems };
        });
      });
      return { previous };
    },
    onError: (err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
      toast?.(err?.response?.data?.message || "تعذر تحديث التثبيت ❌", "error");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["news", "list"] });
    },
    onSuccess: () => {
      toast?.("تم تحديث حالة التثبيت ✅", "success");
    },
  });

  const openEditor = (id = null) => {
    setEditingId(id);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (action, payload) => {
    const body = { ...payload };
    if (action === "publish") {
      body.statut = "published";
      body.publie_le = new Date().toISOString();
    } else if (action === "schedule") {
      body.statut = "scheduled";
    } else {
      body.statut = "draft";
      body.publie_le = null;
    }

    if (editingId) {
      updateMut.mutate({ id: editingId, payload: body });
    } else {
      createMut.mutate(body);
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  const renderActionButtons = (item, layout = "row") => {
    const containerClass =
      layout === "column"
        ? "flex flex-col gap-2"
        : "flex flex-wrap items-center gap-2";
    const buttonWidth = layout === "column" ? "w-full" : "";
    const baseClasses = `px-3 py-1.5 rounded-xl border text-sm transition ${buttonWidth}`;

    return (
      <div className={containerClass}>
        <button className={baseClasses} onClick={() => openEditor(item.id)}>
          تحرير
        </button>
        <button
          className={baseClasses}
          onClick={() => statusMut.mutate({ id: item.id, statut: "published" })}
          disabled={statusMut.isPending}
        >
          نشر الآن
        </button>
        <button
          className={baseClasses}
          onClick={() =>
            setScheduleTarget({
              id: item.id,
              publie_le: item.publie_le,
            })
          }
        >
          جدولة
        </button>
        <button
          className={baseClasses}
          onClick={() => statusMut.mutate({ id: item.id, statut: "draft" })}
          disabled={statusMut.isPending}
        >
          جعل مسودة
        </button>
        <button
          className={baseClasses}
          onClick={() => pinMut.mutate({ id: item.id, next: !item.epingle })}
          disabled={pinMut.isPending}
        >
          {item.epingle ? "إلغاء التثبيت" : "تثبيت"}
        </button>
        <button
          className={`${baseClasses} border-rose-300 text-rose-700`}
          onClick={() => setDeleteId(item.id)}
        >
          حذف
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-4" dir="rtl">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">الأخبار</h1>
          <p className="text-sm text-gray-500">
            إدارة نشر الأخبار، التثبيت، والجدولة الخاصة بلوحة الرئيس.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openEditor(null)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 w-full sm:w-auto"
          >
            إنشاء خبر
          </button>
          <Link
            to="/dashboard/president"
            className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 w-full sm:w-auto text-center"
          >
            لوحة الرئيس
          </Link>
        </div>
      </header>

      <section className="bg-white border rounded-2xl shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">بحث</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                className="flex-1 rounded-xl border px-3 py-2"
                placeholder="ابحث بعنوان أو ملخص الخبر"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
              />
              <button
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white w-full sm:w-auto"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    search: searchDraft.trim(),
                    page: 1,
                  }))
                }
              >
                بحث
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">الحالة</label>
            <select
              className="w-full rounded-xl border px-3 py-2 bg-white"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value,
                  page: 1,
                }))
              }
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">من</label>
            <input
              type="date"
              className="w-full rounded-xl border px-3 py-2"
              value={filters.from}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value, page: 1 }))
              }
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">إلى</label>
            <input
              type="date"
              className="w-full rounded-xl border px-3 py-2"
              value={filters.to}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value, page: 1 }))
              }
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={filters.pinnedOnly}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  pinnedOnly: e.target.checked,
                  page: 1,
                }))
              }
            />
            عرض المثبّت فقط
          </label>

          <button
            className="px-3 py-2 rounded-xl border text-sm w-full sm:w-auto"
            onClick={() => {
              setFilters({ search: "", status: "all", pinnedOnly: false, from: "", to: "", page: 1, limit: 10 });
              setSearchDraft("");
            }}
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      </section>

      <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-right">العنوان</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-right">مثبّت</th>
                  <th className="px-4 py-3 text-right">تاريخ النشر</th>
                  <th className="px-4 py-3 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {listQuery.isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      جارٍ تحميل الأخبار…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      لا توجد أخبار مطابقة للبحث الحالي.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {item.epingle ? (
                              <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs">
                                مثبت
                              </span>
                            ) : null}
                            <span className="font-medium text-gray-900">{item.titre}</span>
                          </div>
                          {item.resume ? (
                            <p
                              className="text-xs text-gray-500 max-w-2xl"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {item.resume}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.statut === "published"
                              ? "bg-emerald-100 text-emerald-700"
                              : item.statut === "scheduled"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {statusLabels[item.statut] || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.epingle ? "نعم" : "لا"}</td>
                      <td className="px-4 py-3">{formatDateTime(item.publie_le)}</td>
                      <td className="px-4 py-3">{renderActionButtons(item)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:hidden space-y-3 px-4 py-4">
          {listQuery.isLoading ? (
            <div className="text-center text-gray-500 border rounded-2xl py-6">
              جارٍ تحميل الأخبار…
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-gray-500 border rounded-2xl py-6">
              لا توجد أخبار مطابقة للبحث الحالي.
            </div>
          ) : (
            items.map((item) => (
              <article key={item.id} className="border rounded-2xl p-4 shadow-sm space-y-3 bg-white">
                <header className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                        item.statut === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.statut === "scheduled"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {statusLabels[item.statut] || "—"}
                    </span>
                    {item.epingle ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs">
                        مثبت
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{item.titre}</h3>
                  {item.resume ? <p className="text-sm text-gray-600 leading-6">{item.resume}</p> : null}
                </header>
                <dl className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                  <div>
                    <dt className="font-medium text-gray-600">تاريخ النشر</dt>
                    <dd>{formatDateTime(item.publie_le)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-600">مثبّت</dt>
                    <dd>{item.epingle ? "نعم" : "لا"}</dd>
                  </div>
                </dl>
                <div>{renderActionButtons(item, "column")}</div>
              </article>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-t px-4 py-3 text-sm text-gray-600">
          <div>
            الصفحة {meta.page} من {lastPage} — إجمالي {meta.total} خبر
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
            <button
              className="px-3 py-1.5 rounded-xl border disabled:opacity-50 w-full sm:w-auto"
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={filters.page <= 1 || listQuery.isLoading}
            >
              السابق
            </button>
            <button
              className="px-3 py-1.5 rounded-xl border disabled:opacity-50 w-full sm:w-auto"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min(lastPage, prev.page + 1),
                }))
              }
              disabled={filters.page >= lastPage || listQuery.isLoading}
            >
              التالي
            </button>
            <select
              className="px-3 py-1.5 rounded-xl border bg-white w-full sm:w-auto"
              value={filters.limit}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  limit: Number(e.target.value),
                  page: 1,
                }))
              }
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} / صفحة
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <NewsEditor
        open={editorOpen}
        initial={editingId ? editorQuery.data : null}
        loadingInitial={editorQuery.isLoading && editingId != null}
        onClose={closeEditor}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
      />

      <ScheduleDialog
        open={Boolean(scheduleTarget)}
        initialDate={scheduleTarget?.publie_le || null}
        onClose={() => setScheduleTarget(null)}
        onConfirm={(date) =>
          scheduleTarget &&
          statusMut.mutate({ id: scheduleTarget.id, statut: "scheduled", publie_le: date })
        }
        isSubmitting={statusMut.isPending}
      />

      <ConfirmDialog
        open={deleteId != null}
        title="حذف الخبر"
        description="سيتم حذف الخبر نهائياً ولا يمكن التراجع عن ذلك."
        confirmText="حذف"
        cancelText="إلغاء"
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        loading={deleteMut.isPending}
      />
    </div>
  );
}

function NewsEditor({ open, initial, loadingInitial, onClose, onSubmit, isSubmitting }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [pinned, setPinned] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [cover, setCover] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.titre || "");
      setSummary(initial.resume || "");
      setContent(initial.contenu_html || initial.contenu || "");
      setTagsInput(Array.isArray(initial.tags) ? initial.tags.join(", ") : "");
      setPinned(Boolean(initial.epingle));
      setCover(initial.couverture_url || null);
      setGallery(Array.isArray(initial.galerie_urls) ? initial.galerie_urls : []);
      if (initial.statut === "scheduled" && initial.publie_le) {
        const dt = new Date(initial.publie_le);
        if (!Number.isNaN(dt.getTime())) {
          setScheduleAt(formatDatetimeLocal(dt));
        }
      } else {
        setScheduleAt("");
      }
    } else {
      setTitle("");
      setSummary("");
      setContent("");
      setTagsInput("");
      setPinned(false);
      setCover(null);
      setGallery([]);
      setScheduleAt("");
    }
    setLocalError("");
  }, [open, initial]);

  if (!open) return null;

  const disabled = isSubmitting || loadingInitial;

  const submitWith = (action) => {
    if (!title.trim() || !content.trim()) {
      setLocalError("الرجاء تعبئة العنوان والمحتوى");
      return;
    }
    if (action === "schedule" && !scheduleAt) {
      setLocalError("الرجاء تحديد تاريخ الجدولة");
      return;
    }
    setLocalError("");

    let scheduleIso;
    if (action === "schedule" && scheduleAt) {
      const dt = new Date(scheduleAt);
      if (Number.isNaN(dt.getTime())) {
        setLocalError("التاريخ المحدد غير صالح");
        return;
      }
      scheduleIso = dt.toISOString();
    }

    const payload = {
      titre: title.trim(),
      resume: summary.trim() || null,
      contenu_html: content,
      tags: tagsInput
        .split(/[،,]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
      epingle: pinned,
      couverture_url: cover,
      galerie_urls: gallery,
      publie_le: action === "schedule" ? scheduleIso : undefined,
    };

    onSubmit?.(action, payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "تعديل الخبر" : "إنشاء خبر"}
      description="أكمل تفاصيل الخبر وحدد خيارات النشر قبل الحفظ."
      size="full"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="min-h-[1rem] text-xs text-rose-600">{localError}</span>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-3">
            <button
              className="rounded-xl border px-4 py-2 text-sm"
              onClick={onClose}
              disabled={disabled}
            >
              إلغاء
            </button>
            <button
              className="rounded-xl border bg-gray-50 px-4 py-2 text-sm"
              onClick={() => submitWith("draft")}
              disabled={disabled}
            >
              حفظ كمسودة
            </button>
            <button
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700"
              onClick={() => submitWith("schedule")}
              disabled={disabled}
            >
              جدولة
            </button>
            <button
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              onClick={() => submitWith("publish")}
              disabled={disabled}
            >
              نشر الآن
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6" dir="rtl">
        {loadingInitial ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            جارٍ تحميل الخبر…
          </div>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">المعلومات الأساسية</h2>
                  <p className="mt-1 text-xs text-gray-500">هذه البيانات تظهر في بطاقات الأخبار وقائمة الجدول.</p>
                </div>
                <div className="space-y-5 px-5 py-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm text-gray-700">
                      <label>
                        العنوان <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-xs text-gray-400">{title.length}/{TITLE_LIMIT}</span>
                    </div>
                    <input
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="اكتب عنواناً واضحاً وجذاباً"
                      disabled={disabled}
                      maxLength={TITLE_LIMIT}
                    />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm text-gray-700">
                      <label>الملخص</label>
                      <span className="text-xs text-gray-400">{summary.length}/{SUMMARY_LIMIT}</span>
                    </div>
                    <textarea
                      className="min-h-[110px] w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="اختصر مضمون الخبر في جملة أو جملتين"
                      disabled={disabled}
                      maxLength={SUMMARY_LIMIT}
                    />
                    <p className="mt-1 text-xs text-gray-500">سيتم إظهار الملخص في بطاقات العرض والنتائج.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">محتوى الخبر</h2>
                  <p className="mt-1 text-xs text-gray-500">استخدم أدوات التنسيق لإبراز العناوين أو القوائم داخل النص.</p>
                </div>
                <div className="px-5 py-4">
                  <RichTextEditor value={content} onChange={setContent} disabled={disabled} />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">الوسوم والمعرض</h2>
                  <p className="mt-1 text-xs text-gray-500">ساعد الجمهور في العثور على الخبر عبر الكلمات المفتاحية والصور الداعمة.</p>
                </div>
                <div className="space-y-5 px-5 py-4">
                  <div>
                    <label className="mb-1 block text-sm text-gray-700">الوسوم</label>
                    <input
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="مثال: أنشطة، فعاليات، أطفال"
                      disabled={disabled}
                    />
                    <p className="mt-1 text-xs text-gray-500">افصل بين الوسوم باستخدام الفاصلة العربية أو الإنجليزية.</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">معرض الصور</label>
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
                      <span className="block mb-2">أضف حتى 10 صور لدعم الخبر.</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleGalleryChange(e, setGallery)}
                        className="mx-auto block text-sm"
                        disabled={disabled}
                      />
                    </div>
                    {gallery.length >= 10 ? (
                      <p className="mt-2 text-xs text-amber-600">تم الوصول إلى الحد الأقصى للصور (10).</p>
                    ) : null}
                    {gallery.length > 0 ? (
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {gallery.map((url, idx) => (
                          <div key={idx} className="group relative overflow-hidden rounded-xl border border-gray-200">
                            <img
                              src={url}
                              alt={`معرض ${idx + 1}`}
                              className="h-28 w-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-xs text-rose-600 shadow"
                              onClick={() =>
                                setGallery((prev) => prev.filter((_, index) => index !== idx))
                              }
                              disabled={disabled}
                            >
                              إزالة
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">خيارات النشر</h2>
                  <p className="mt-1 text-xs text-gray-500">حدد الجدولة والتثبيت قبل اعتماد الخبر.</p>
                </div>
                <div className="space-y-4 px-5 py-4">
                  <label className="block text-sm text-gray-700">
                    <span className="mb-2 block">تاريخ الجدولة</span>
                    <input
                      type="datetime-local"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      value={scheduleAt}
                      onChange={(e) => setScheduleAt(e.target.value)}
                      disabled={disabled}
                    />
                    <p className="mt-1 text-xs text-gray-500">هذا التاريخ يستخدم عند اختيار خيار "جدولة" في الأسفل.</p>
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={pinned}
                      onChange={(e) => setPinned(e.target.checked)}
                      disabled={disabled}
                    />
                    تثبيت الخبر في أعلى القائمة
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">صورة الغلاف</h2>
                  <p className="mt-1 text-xs text-gray-500">اختر صورة معبرة لواجهة الخبر، أو اتركه بدون غلاف.</p>
                </div>
                <div className="space-y-4 px-5 py-4">
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
                    <span className="block mb-2">اسحب وأفلت الصورة أو اخترها من جهازك.</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCoverChange(e, setCover)}
                      className="mx-auto block text-sm"
                      disabled={disabled}
                    />
                  </div>
                  {cover ? (
                    <div className="relative overflow-hidden rounded-2xl border border-gray-200">
                      <img src={cover} alt="غلاف الخبر" className="max-h-48 w-full object-cover" />
                      <button
                        type="button"
                        className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs text-rose-600 shadow"
                        onClick={() => setCover(null)}
                        disabled={disabled}
                      >
                        إزالة الغلاف
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </aside>
          </section>
        )}
      </div>
    </Modal>
  );
}

function ScheduleDialog({ open, initialDate, onClose, onConfirm, isSubmitting }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && initialDate) {
      const dt = new Date(initialDate);
      if (!Number.isNaN(dt.getTime())) {
        setValue(formatDatetimeLocal(dt));
      } else {
        setValue("");
      }
    } else if (open) {
      setValue("");
    }
    setError("");
  }, [open, initialDate]);

  if (!open) return null;

  const submit = () => {
    if (!value) {
      setError("الرجاء تحديد موعد الجدولة");
      return;
    }
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) {
      setError("التاريخ المحدد غير صالح");
      return;
    }
    onConfirm?.(dt.toISOString());
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="جدولة النشر"
      description="حدد تاريخاً ووقتاً لنشر الخبر تلقائياً."
      size="sm"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-rose-600">{error}</span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              className="px-4 py-2 rounded-xl border w-full sm:w-auto"
              onClick={onClose}
              disabled={isSubmitting}
            >
              إلغاء
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50 w-full sm:w-auto"
              onClick={submit}
              disabled={isSubmitting}
            >
              تأكيد الجدولة
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <label className="block text-sm text-gray-700">
          تاريخ ووقت النشر
          <input
            type="datetime-local"
            className="mt-2 w-full rounded-xl border px-3 py-2"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isSubmitting}
          />
        </label>
        <p className="text-xs text-gray-500">
          سيتم نشر الخبر تلقائياً في الموعد المحدد ما لم يتم تغييره يدوياً.
        </p>
      </div>
    </Modal>
  );
}

function RichTextEditor({ value, onChange, disabled }) {
  const [internal, setInternal] = useState(value || "");

  useEffect(() => {
    setInternal(value || "");
  }, [value]);

  const apply = (command) => {
    if (disabled || typeof document === "undefined") return;
    document.execCommand(command, false, null);
  };

  const showPlaceholder =
    !internal ||
    internal.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim().length === 0;

  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="flex flex-wrap items-center gap-2 bg-gray-50 px-3 py-2 text-xs text-gray-600">
        <ToolbarButton onClick={() => apply("bold")} label="عريض" />
        <ToolbarButton onClick={() => apply("italic")} label="مائل" />
        <ToolbarButton onClick={() => apply("underline")} label="تحته خط" />
        <ToolbarButton onClick={() => apply("insertUnorderedList")} label="قائمة نقطية" />
        <ToolbarButton onClick={() => apply("insertOrderedList")} label="قائمة مرقمة" />
      </div>
      <div className="relative">
        {showPlaceholder ? (
          <span className="pointer-events-none absolute right-4 top-3 text-sm text-gray-400">
            اكتب محتوى الخبر هنا…
          </span>
        ) : null}
        <div
          className="min-h-[220px] bg-white px-4 py-3 leading-7 focus:outline-none"
          contentEditable={!disabled}
          suppressContentEditableWarning
          dir="rtl"
          onInput={(e) => {
            const html = e.currentTarget.innerHTML;
            setInternal(html);
            onChange?.(html);
          }}
          dangerouslySetInnerHTML={{ __html: internal || "" }}
        />
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, label }) {
  return (
    <button
      type="button"
      className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-100"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

async function handleCoverChange(event, setCover) {
  const file = event.target.files?.[0];
  if (!file) return;
  const url = await readAsDataUrl(file);
  setCover(url);
}

async function handleGalleryChange(event, setGallery) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  const urls = await Promise.all(files.map((file) => readAsDataUrl(file)));
  setGallery((prev) => {
    const availableSlots = Math.max(0, 10 - prev.length);
    const nextBatch = availableSlots ? urls.slice(0, availableSlots) : [];
    return availableSlots ? [...prev, ...nextBatch] : prev;
  });
}

function formatDatetimeLocal(date) {
  const pad = (n) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
