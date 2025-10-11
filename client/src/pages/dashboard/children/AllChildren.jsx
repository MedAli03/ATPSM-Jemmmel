// src/pages/dashboard/children/AllChildren.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useChildrenPage from "../../../hooks/useChildrenPage";
import {
  useDeleteEnfant,
  useLinkParent,
  useUnlinkParent,
} from "../../../hooks/useChildMutations";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

export default function AllChildren() {
  const navigate = useNavigate();

  // Filters / paging
  const [q, setQ] = useState("");
  const [parentId, setParentId] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // Link mode per-row (to enter parent_user_id)
  const [linkRowId, setLinkRowId] = useState(null);
  const [linkInput, setLinkInput] = useState("");

  // Delete dialog state
  const [deleteId, setDeleteId] = useState(null);
  const [confirmUnlinkId, setConfirmUnlinkId] = useState(null);

  // Compose params for the query
  const { rows, count, totalPages, isLoading, isError, prefetchPage, refetch } =
    useChildrenPage({
      page,
      pageSize,
      q,
      parent_user_id: parentId,
      debounceMs: 300,
    });

  // Mutations
  const delMu = useDeleteEnfant();
  const linkMu = useLinkParent();
  const unlinkMu = useUnlinkParent();

  // Reset page when filters change (basic UX)
  useEffect(() => {
    setPage(1);
  }, [q, parentId, pageSize]);

  // Helpers
  function handleView(id) {
    navigate(`/dashboard/president/children/${id}`);
  }

  function handleDelete(id) {
    setDeleteId(id);
  }

  function confirmDelete() {
    if (!deleteId) return;
    delMu.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        // refresh current page
        refetch();
      },
    });
  }

  function startLink(row) {
    setLinkRowId(row.id);
    setLinkInput("");
  }

  function confirmLink() {
    if (!linkRowId) return;
    const parent_user_id = Number(linkInput);
    if (!parent_user_id || Number.isNaN(parent_user_id)) return;
    linkMu.mutate(
      { enfantId: linkRowId, parent_user_id },
      {
        onSuccess: () => {
          setLinkRowId(null);
          setLinkInput("");
          refetch();
        },
      }
    );
  }

  function confirmUnlink() {
    if (!confirmUnlinkId) return;
    unlinkMu.mutate(
      { enfantId: confirmUnlinkId },
      {
        onSuccess: () => {
          setConfirmUnlinkId(null);
          refetch();
        },
      }
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header / Filters */}
      <div className="bg-white rounded-2xl shadow p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              الأطفال
            </h1>
            <p className="text-sm text-gray-500">
              إدارة قائمة الأطفال والبحث والارتباط بالولي
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">بحث</label>
              <input
                className="rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white w-60"
                placeholder="اسم/لقب..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">
                تصفية حسب حساب الولي
              </label>
              <input
                className="rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white w-56"
                placeholder="ID الولي"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">عدد العناصر</label>
              <select
                className="rounded-xl border border-gray-200 px-3 py-2 bg-white"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <Link
              to="/dashboard/president/children/new"
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white"
            >
              إضافة طفل جديد
            </Link>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-right px-4 py-3 font-semibold">#</th>
                <th className="text-right px-4 py-3 font-semibold">الاسم</th>
                <th className="text-right px-4 py-3 font-semibold">
                  تاريخ الميلاد
                </th>
                <th className="text-right px-4 py-3 font-semibold">الولي</th>
                <th className="text-right px-4 py-3 font-semibold w-64">
                  الإجراءات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-8 bg-gray-200 rounded" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-rose-700">
                    حدث خطأ أثناء جلب البيانات.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-gray-600">
                    لا توجد نتائج مطابقة.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{row.id}</td>
                    <td className="px-4 py-3">
                      {row.prenom} {row.nom}
                    </td>
                    <td className="px-4 py-3">{row.date_naissance || "—"}</td>
                    <td className="px-4 py-3">
                      {row.parent_user_id ? (
                        <span className="px-2 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                          مرتبط: {row.parent_user_id}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                          لا يوجد
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleView(row.id)}
                          className="px-3 py-2 rounded-xl border"
                        >
                          عرض
                        </button>

                        {/* Link / Unlink */}
                        {row.parent_user_id ? (
                          <button
                            onClick={() => setConfirmUnlinkId(row.id)}
                            className="px-3 py-2 rounded-xl border text-rose-700 border-rose-200"
                            disabled={
                              unlinkMu.isPending && confirmUnlinkId === row.id
                            }
                          >
                            {unlinkMu.isPending && confirmUnlinkId === row.id
                              ? "جارٍ الفك…"
                              : "فك الربط"}
                          </button>
                        ) : linkRowId === row.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              className="rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white w-32"
                              placeholder="ID الولي"
                              value={linkInput}
                              onChange={(e) => setLinkInput(e.target.value)}
                            />
                            <button
                              onClick={confirmLink}
                              disabled={linkMu.isPending}
                              className="px-3 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50"
                            >
                              {linkMu.isPending ? "جارٍ الربط…" : "تأكيد"}
                            </button>
                            <button
                              onClick={() => {
                                setLinkRowId(null);
                                setLinkInput("");
                              }}
                              className="px-3 py-2 rounded-xl border"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startLink(row)}
                            className="px-3 py-2 rounded-xl border"
                          >
                            ربط ولي
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="px-3 py-2 rounded-xl border text-rose-700 border-rose-200"
                          disabled={delMu.isPending && deleteId === row.id}
                        >
                          {delMu.isPending && deleteId === row.id
                            ? "جارٍ الحذف…"
                            : "حذف"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3">
          <div className="text-sm text-gray-600">المجموع: {count}</div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-xl border disabled:opacity-50"
              disabled={page <= 1}
              onMouseEnter={() => prefetchPage(page - 1)}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              السابق
            </button>
            <span className="text-sm text-gray-600">
              صفحة {page} / {totalPages}
            </span>
            <button
              className="px-3 py-2 rounded-xl border disabled:opacity-50"
              disabled={page >= totalPages}
              onMouseEnter={() => prefetchPage(page + 1)}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              التالي
            </button>
          </div>
        </div>
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={!!deleteId}
        title="حذف الطفل؟"
        description="هل تريد بالتأكيد حذف هذا السجل؟ هذا الإجراء لا يمكن التراجع عنه."
        confirmText="حذف"
        cancelText="رجوع"
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={!!confirmUnlinkId}
        title="فك الربط؟"
        description="سيتم فك ارتباط هذا الطفل بحساب الولي."
        confirmText="فك الربط"
        cancelText="رجوع"
        onClose={() => setConfirmUnlinkId(null)}
        onConfirm={confirmUnlink}
      />
    </div>
  );
}
