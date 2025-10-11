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

  return (
    <div className="p-4 md:p-6 space-y-4" dir="rtl">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">الأخبار</h1>
          <p className="text-sm text-gray-500">
            إدارة نشر الأخبار، التثبيت، والجدولة الخاصة بلوحة الرئيس.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditor(null)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          >
            إنشاء خبر
          </button>
          <Link
            to="/dashboard/president"
            className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50"
          >
            لوحة الرئيس
          </Link>
        </div>
      </header>

      <section className="bg-white border rounded-2xl shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">بحث</label>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-xl border px-3 py-2"
                placeholder="ابحث بعنوان أو ملخص الخبر"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
              />
              <button
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
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
            className="px-3 py-2 rounded-xl border text-sm"
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
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          className="px-3 py-1.5 rounded-xl border"
                          onClick={() => openEditor(item.id)}
                        >
                          تحرير
                        </button>
                        <button
                          className="px-3 py-1.5 rounded-xl border"
                          onClick={() =>
                            statusMut.mutate({ id: item.id, statut: "published" })
                          }
                          disabled={statusMut.isPending}
                        >
                          نشر الآن
                        </button>
                        <button
                          className="px-3 py-1.5 rounded-xl border"
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
                          className="px-3 py-1.5 rounded-xl border"
                          onClick={() =>
                            statusMut.mutate({ id: item.id, statut: "draft" })
                          }
                          disabled={statusMut.isPending}
                        >
                          جعل مسودة
                        </button>
                        <button
                          className="px-3 py-1.5 rounded-xl border"
                          onClick={() => pinMut.mutate({ id: item.id, next: !item.epingle })}
                          disabled={pinMut.isPending}
                        >
                          {item.epingle ? "إلغاء التثبيت" : "تثبيت"}
                        </button>
                        <button
                          className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700"
                          onClick={() => setDeleteId(item.id)}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-t px-4 py-3 text-sm text-gray-600">
          <div>
            الصفحة {meta.page} من {lastPage} — إجمالي {meta.total} خبر
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-xl border disabled:opacity-50"
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={filters.page <= 1 || listQuery.isLoading}
            >
              السابق
            </button>
            <button
              className="px-3 py-1.5 rounded-xl border disabled:opacity-50"
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
              className="px-3 py-1.5 rounded-xl border bg-white"
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
        .split(",")
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
      description="أضف تفاصيل الخبر وادارة حالة النشر."
      size="xl"
      footer={
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-rose-600 min-h-[1rem]">{localError}</div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="px-4 py-2 rounded-xl border" onClick={onClose} disabled={disabled}>
              إلغاء
            </button>
            <button
              className="px-4 py-2 rounded-xl border bg-gray-50"
              onClick={() => submitWith("draft")}
              disabled={disabled}
            >
              حفظ كمسودة
            </button>
            <button
              className="px-4 py-2 rounded-xl border bg-amber-50 text-amber-700"
              onClick={() => submitWith("schedule")}
              disabled={disabled}
            >
              جدولة
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50"
              onClick={() => submitWith("publish")}
              disabled={disabled}
            >
              نشر الآن
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4" dir="rtl">
        {loadingInitial ? (
          <div className="text-sm text-gray-500">جارٍ تحميل الخبر…</div>
        ) : (
          <>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                العنوان <span className="text-rose-600">*</span>
              </label>
              <input
                className="w-full rounded-xl border px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان الخبر"
                disabled={disabled}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">الملخص</label>
              <textarea
                className="w-full rounded-xl border px-3 py-2 min-h-[90px]"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="ملخص قصير لعرضه في البطاقات"
                disabled={disabled}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                المحتوى <span className="text-rose-600">*</span>
              </label>
              <RichTextEditor value={content} onChange={setContent} disabled={disabled} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-gray-700 mb-1">الوسوم</label>
                <input
                  className="w-full rounded-xl border px-3 py-2"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="مثال: أنشطة، فعاليات، أطفال"
                  disabled={disabled}
                />
                <p className="text-xs text-gray-500 mt-1">افصل الوسوم بفاصلة (،).</p>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    disabled={disabled}
                  />
                  تثبيت في أعلى قائمة الأخبار
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-gray-700 mb-1">تاريخ الجدولة</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border px-3 py-2"
                  value={scheduleAt}
                  onChange={(e) => setScheduleAt(e.target.value)}
                  disabled={disabled}
                />
                <p className="text-xs text-gray-500 mt-1">
                  استخدم هذا الحقل لتحديد وقت النشر عند اختيار "جدولة".
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">صورة الغلاف</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCoverChange(e, setCover)}
                  className="block w-full text-sm"
                  disabled={disabled}
                />
                {cover ? (
                  <div className="mt-2 relative">
                    <img
                      src={cover}
                      alt="غلاف الخبر"
                      className="w-full max-h-40 object-cover rounded-xl border"
                    />
                    <button
                      type="button"
                      className="absolute top-2 left-2 bg-white/80 rounded-full px-2 py-1 text-xs"
                      onClick={() => setCover(null)}
                      disabled={disabled}
                    >
                      إزالة
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">معرض الصور</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleGalleryChange(e, setGallery)}
                className="block w-full text-sm"
                disabled={disabled}
              />
              {gallery.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {gallery.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={url}
                        alt={`معرض ${idx + 1}`}
                        className="w-24 h-24 object-cover rounded-xl border"
                      />
                      <button
                        type="button"
                        className="absolute top-1 left-1 bg-white/80 rounded-full px-2 py-0.5 text-xs"
                        onClick={() =>
                          setGallery((prev) => prev.filter((_, index) => index !== idx))
                        }
                        disabled={disabled}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </>
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
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-rose-600">{error}</span>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-xl border" onClick={onClose} disabled={isSubmitting}>
              إلغاء
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50"
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

  return (
    <div className="border rounded-2xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 bg-gray-50 px-3 py-2 text-xs text-gray-600">
        <ToolbarButton onClick={() => apply("bold")} label="عريض" />
        <ToolbarButton onClick={() => apply("italic")} label="مائل" />
        <ToolbarButton onClick={() => apply("underline")} label="تحته خط" />
        <ToolbarButton onClick={() => apply("insertUnorderedList")} label="قائمة نقطية" />
        <ToolbarButton onClick={() => apply("insertOrderedList")} label="قائمة مرقمة" />
      </div>
      <div
        className="min-h-[220px] px-4 py-3 leading-7 focus:outline-none"
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
  setGallery((prev) => [...prev, ...urls]);
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
