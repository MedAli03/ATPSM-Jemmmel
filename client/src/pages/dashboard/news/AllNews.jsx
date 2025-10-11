// src/pages/dashboard/news/AllNews.jsx
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { useToast } from "../../../components/common/ToastProvider";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Modal from "../../../components/common/Modal";

import {
  listNews,
  createNews,
  updateNews,
  deleteNews,
  setPublish,
  setPinned,
} from "../../../api/news";

/* =========================================================================
   President → News list
   ========================================================================= */
export default function AllNews() {
  const qc = useQueryClient();
  const toast = useToast();

  // filters/state
  const [search, setSearch] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [status, setStatus] = useState("all"); // all | draft | published
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // list query
  const newsQ = useQuery({
    queryKey: ["news", { search, status, pinnedOnly, page, limit }],
    queryFn: () => listNews({ search, status, pinnedOnly, page, limit }),
    keepPreviousData: true,
  });

  const items = newsQ.data?.items || [];
  const total = Number(newsQ.data?.total || 0);
  const lastPage = Math.max(1, Math.ceil(total / limit));

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // mutations
  const createMut = useMutation({
    mutationFn: createNews,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news"] });
      toast?.("تم إنشاء الخبر بنجاح ✅", "success");
      setShowForm(false);
    },
    onError: (e) => toast?.(e?.response?.data?.message || "تعذر إنشاء الخبر ❌", "error"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateNews(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news"] });
      toast?.("تم حفظ التعديلات ✅", "success");
      setShowForm(false);
      setEditing(null);
    },
    onError: (e) => toast?.(e?.response?.data?.message || "تعذر الحفظ ❌", "error"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteNews,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news"] });
      toast?.("تم حذف الخبر ✅", "success");
      setConfirmDelete(null);
    },
    onError: (e) => toast?.(e?.response?.data?.message || "تعذر الحذف ❌", "error"),
  });

  const publishMut = useMutation({
    mutationFn: ({ id, published }) => setPublish(id, published),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news"] });
      toast?.("تم تحديث حالة النشر ✅", "success");
    },
    onError: (e) => toast?.(e?.response?.data?.message || "تعذر التحديث ❌", "error"),
  });

  const pinMut = useMutation({
    mutationFn: ({ id, pinned }) => setPinned(id, pinned),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news"] });
      toast?.("تم تغيير حالة التثبيت ✅", "success");
    },
    onError: (e) => toast?.(e?.response?.data?.message || "تعذر التحديث ❌", "error"),
  });

  const loading = newsQ.isLoading;

  // handlers
  const applySearch = () => {
    setPage(1);
    setSearch(draftSearch.trim());
  };

  const resetFilters = () => {
    setDraftSearch("");
    setSearch("");
    setStatus("all");
    setPinnedOnly(false);
    setPage(1);
    setLimit(10);
  };

  const headerActions = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          خبر جديد
        </button>
        <Link to="/dashboard/president" className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50">
          لوحة الرئيس
        </Link>
      </div>
    ),
    []
  );

  return (
    <div className="p-4 md:p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">الأخبار</h1>
          <p className="text-sm text-gray-500">إدارة الأخبار، النشر، والتثبيت في أعلى الصفحة.</p>
        </div>
        {headerActions}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow border p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">بحث</label>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-xl border px-3 py-2"
                placeholder="ابحث بعنوان الخبر…"
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
              />
              <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white" onClick={applySearch}>
                بحث
              </button>
              <button className="px-4 py-2 rounded-xl border" onClick={resetFilters}>
                إعادة تعيين
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">الحالة</label>
            <div className="flex items-center gap-2">
              {[
                { key: "all", label: "الكل" },
                { key: "published", label: "منشور" },
                { key: "draft", label: "مسودة" },
              ].map((s) => (
                <button
                  key={s.key}
                  className={`px-3 py-2 rounded-xl border text-sm ${
                    status === s.key ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"
                  }`}
                  onClick={() => {
                    setStatus(s.key);
                    setPage(1);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">تثبيت</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={pinnedOnly}
                  onChange={(e) => {
                    setPinnedOnly(e.target.checked);
                    setPage(1);
                  }}
                />
                عرض المثبّت فقط
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-right px-4 py-3">العنوان</th>
                <th className="text-right px-4 py-3">الحالة</th>
                <th className="text-right px-4 py-3">مثبّت</th>
                <th className="text-right px-4 py-3">تاريخ الإنشاء</th>
                <th className="text-right px-4 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    جارٍ التحميل…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    لا توجد أخبار.
                  </td>
                </tr>
              ) : (
                items.map((n) => {
                  const isPublished = (n.status || n.statut) === "published" || n.published === true;
                  const isPinned = !!n.pinned;
                  const createdAt = n.created_at || n.createdAt || n.created || n.createdAtUtc;
                  return (
                    <tr key={n.id} className="border-t">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          {isPinned && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">
                              مثبت
                            </span>
                          )}
                          <span>{n.title || n.titre}</span>
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xl" dangerouslySetInnerHTML={{ __html: n.excerpt || "" }} />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {isPublished ? "منشور" : "مسودة"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{isPinned ? "نعم" : "لا"}</td>
                      <td className="px-4 py-3">
                        {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            className="px-3 py-1.5 rounded-xl border"
                            onClick={() => {
                              setEditing(n);
                              setShowForm(true);
                            }}
                          >
                            تعديل
                          </button>

                          <button
                            className={`px-3 py-1.5 rounded-xl border ${
                              isPublished ? "border-amber-300 text-amber-700" : ""
                            }`}
                            onClick={() => publishMut.mutate({ id: n.id, published: !isPublished })}
                            disabled={publishMut.isPending}
                          >
                            {publishMut.isPending ? "…" : isPublished ? "تحويل لمسودة" : "نشر"}
                          </button>

                          <button
                            className="px-3 py-1.5 rounded-xl border"
                            onClick={() => pinMut.mutate({ id: n.id, pinned: !isPinned })}
                            disabled={pinMut.isPending}
                          >
                            {isPinned ? "إلغاء التثبيت" : "تثبيت"}
                          </button>

                          <button
                            className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700"
                            onClick={() => setConfirmDelete(n.id)}
                          >
                            حذف
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
          <div className="text-gray-600">
            الصفحة {page} من {lastPage}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-xl border disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              السابق
            </button>
            <button
              className="px-3 py-1.5 rounded-xl border disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={loading || page >= lastPage}
            >
              التالي
            </button>
            <select
              className="px-3 py-1.5 rounded-xl border bg-white"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / صفحة
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Create/Edit modal */}
      <NewsFormModal
        open={showForm}
        initial={editing}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        onSubmit={(payload) => {
          if (editing) {
            updateMut.mutate({ id: editing.id, payload });
          } else {
            createMut.mutate(payload);
          }
        }}
        isSubmitting={createMut.isPending || updateMut.isPending}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="حذف الخبر؟"
        description="لا يمكن التراجع عن هذه العملية."
        confirmText="حذف"
        cancelText="إلغاء"
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteMut.mutate(confirmDelete)}
      />
    </div>
  );
}

/* =========================================================================
   Create/Edit Modal
   ========================================================================= */
function NewsFormModal({ open, initial, onClose, onSubmit, isSubmitting }) {
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title || initial?.titre || "");
  const [content, setContent] = useState(initial?.content || initial?.contenu || "");
  const [status, setStatus] = useState(
    initial?.status || initial?.statut || "draft"
  );
  const [pinned, setPinned] = useState(!!initial?.pinned);

  // reset when initial changes/open toggles
  // (simple approach; if you need stricter control, use useEffect)
  useMemo(() => {
    if (isEdit) {
      setTitle(initial?.title || initial?.titre || "");
      setContent(initial?.content || initial?.contenu || "");
      setStatus(initial?.status || initial?.statut || "draft");
      setPinned(!!initial?.pinned);
    } else {
      setTitle("");
      setContent("");
      setStatus("draft");
      setPinned(false);
    }
  }, [isEdit, initial, open]);

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "تعديل خبر" : "خبر جديد"}
      description="أدخل تفاصيل الخبر."
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded-xl border" onClick={onClose} disabled={isSubmitting}>
            إلغاء
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50"
            onClick={() =>
              isEdit
                ? onSubmit({ title: title.trim(), content: content.trim(), status, pinned })
                : onSubmit({ title: title.trim(), content: content.trim(), status, pinned })
            }
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? "جارٍ الحفظ…" : "حفظ"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            العنوان <span className="text-rose-600">*</span>
          </label>
          <input
            className="w-full rounded-xl border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="أدخل عنوان الخبر…"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            المحتوى <span className="text-rose-600">*</span>
          </label>
          <textarea
            rows={8}
            className="w-full rounded-xl border px-3 py-2 leading-7"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="نص الخبر…"
          />
          <p className="text-xs text-gray-500 mt-1">
            * يمكنك لاحقاً استبدال هذا بمحرر نص غني (TipTap / Quill) عند الحاجة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">الحالة</label>
            <select
              className="w-full rounded-xl border px-3 py-2 bg-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="draft">مسودة</option>
              <option value="published">منشور</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              تثبيت في الأعلى
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
