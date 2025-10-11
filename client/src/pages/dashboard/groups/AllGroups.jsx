/* eslint-disable no-unused-vars */
// src/pages/dashboard/groups/AllGroupes.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Modal from "../../../components/common/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { useToast } from "../../../components/common/ToastProvider";

import useGroupsPage from "../../../hooks/useGroupsPage";

import {
  listAnnees,
  getActiveAnnee,
  listGroupes,
  createGroupe,
  updateGroupe,
  archiveGroupe,
  deleteGroupe,
  listInscriptions,
  addInscriptionsBatch,
  deleteInscription,
  getAffectation,
  setAffectation,
  deleteAffectation,
  searchGroupChildrenCandidates,
  searchGroupEducateurCandidates,
} from "../../../api/groups";

/* =========================================================================
   List screen
   ========================================================================= */
export default function AllGroupes() {
  const toast = useToast();
  const qc = useQueryClient();

  const {
    anneeId,
    statut,
    search,
    page,
    limit,
    draftSearch,
    setAnneeId,
    setStatut,
    setPage,
    setLimit,
    setDraftSearch,
    applySearch,
    resetFilters,
  } = useGroupsPage();

  // Years
  const anneesQ = useQuery({ queryKey: ["annees"], queryFn: listAnnees });
  const activeAnneeQ = useQuery({
    queryKey: ["anneeActive"],
    queryFn: getActiveAnnee,
  });

  // If no anneeId chosen, use active one (if available)
  const effectiveAnneeId = anneeId ?? activeAnneeQ.data?.id ?? undefined;

  // List groups (API handles both /groupes?… and legacy /groupes/annees/:id)
  const groupesQ = useQuery({
    queryKey: [
      "groupes",
      { anneeId: effectiveAnneeId, statut, search, page, limit },
    ],
    queryFn: () =>
      listGroupes({ anneeId: effectiveAnneeId, statut, search, page, limit }),
    // If your backend requires a year, keep enabled on year only; otherwise you can allow fetching without year.
    enabled: effectiveAnneeId != null,
    keepPreviousData: true,
  });

  // Local UI state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // group row
  const [confirmArchive, setConfirmArchive] = useState(null); // { id, to: "archive"|"actif" }
  const [confirmDelete, setConfirmDelete] = useState(null); // id
  const [manageModal, setManageModal] = useState(null); // { id, nom, annee_id, archived }

  // Mutations
  const createMut = useMutation({
    mutationFn: createGroupe,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupes"] });
      toast?.("تم إنشاء المجموعة بنجاح ✅", "success");
      setShowForm(false);
    },
    onError: (e) =>
      toast?.(e?.response?.data?.message || "تعذر إنشاء المجموعة ❌", "error"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateGroupe(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupes"] });
      toast?.("تم حفظ التعديلات ✅", "success");
      setShowForm(false);
      setEditing(null);
    },
    onError: (e) =>
      toast?.(e?.response?.data?.message || "تعذر الحفظ ❌", "error"),
  });

  const patchStatutMut = useMutation({
    mutationFn: ({ id, to }) => archiveGroupe(id, to),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupes"] });
      toast?.("تم تحديث الحالة ✅", "success");
      setConfirmArchive(null);
    },
    onError: (e) =>
      toast?.(e?.response?.data?.message || "تعذر تحديث الحالة ❌", "error"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteGroupe(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groupes"] });
      toast?.("تم حذف المجموعة ✅", "success");
      setConfirmDelete(null);
    },
    onError: (e) =>
      toast?.(
        e?.response?.data?.message || "تعذر الحذف. تأكد من عدم وجود ارتباطات.",
        "error"
      ),
  });

  // Normalize data safely (array or empty)
  const data = useMemo(
    () => (Array.isArray(groupesQ.data) ? groupesQ.data : []),
    [groupesQ.data]
  );

  return (
    <div className="p-4 md:p-6" dir="rtl">
      {/* If no year at all */}
      {effectiveAnneeId == null && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 mb-4">
          يرجى اختيار السنة الدراسية أولاً.
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">المجموعات</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            disabled={effectiveAnneeId == null}
          >
            مجموعة جديدة
          </button>
          <Link
            to="/dashboard/children"
            className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50"
          >
            الأطفال
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow border p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              السنة الدراسية
            </label>
            <select
              className="w-full rounded-xl border px-3 py-2 bg-white"
              value={effectiveAnneeId || ""}
              onChange={(e) =>
                setAnneeId(e.target.value ? Number(e.target.value) : undefined)
              }
            >
              {!effectiveAnneeId && <option value="">— اختر السنة —</option>}
              {(anneesQ.data || []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.libelle} {a.est_active ? "• الحالية" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">الحالة</label>
            <div className="flex items-center gap-2">
              {[
                { key: "actif", label: "نشطة" },
                { key: "archive", label: "مؤرشفة" },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={`px-3 py-2 rounded-xl border text-sm ${
                    statut === s.key
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white"
                  }`}
                  onClick={() => setStatut(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">بحث</label>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-xl border px-3 py-2"
                placeholder="ابحث باسم المجموعة…"
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
              />
              <button
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
                onClick={applySearch}
              >
                بحث
              </button>
              <button
                className="px-4 py-2 rounded-xl border"
                onClick={resetFilters}
              >
                إعادة تعيين
              </button>
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
                <th className="text-right px-4 py-3">اسم المجموعة</th>
                <th className="text-right px-4 py-3">السنة</th>
                <th className="text-right px-4 py-3">الحالة</th>
                <th className="text-right px-4 py-3"># الأطفال</th>
                <th className="text-right px-4 py-3">المربي</th>
                <th className="text-right px-4 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {groupesQ.isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    جارٍ التحميل…
                  </td>
                </tr>
              ) : groupesQ.isError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-rose-600"
                  >
                    {groupesQ.error?.response?.data?.message ||
                      "حدث خطأ أثناء الجلب."}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    لا توجد مجموعات.
                  </td>
                </tr>
              ) : (
                data.map((g) => {
                  const isArchived = g.statut === "archive";
                  const yearLib =
                    (anneesQ.data || []).find((a) => a.id === g.annee_id)
                      ?.libelle || "—";
                  return (
                    <tr key={g.id} className="border-t">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {g.nom}
                      </td>
                      <td className="px-4 py-3">{yearLib}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            isArchived
                              ? "bg-gray-200 text-gray-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isArchived ? "مؤرشف" : "نشط"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {typeof g.nb_enfants === "number" ? g.nb_enfants : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {/* Not included in list → shown in Manage modal */}
                        <span className="text-gray-500">—</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl border"
                            onClick={() => {
                              setEditing(g);
                              setShowForm(true);
                            }}
                          >
                            تعديل
                          </button>

                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl border"
                            onClick={() =>
                              setManageModal({
                                id: g.id,
                                nom: g.nom,
                                annee_id: g.annee_id,
                                archived: isArchived,
                              })
                            }
                          >
                            إدارة الأعضاء
                          </button>

                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl border"
                            onClick={() =>
                              setConfirmArchive({
                                id: g.id,
                                to: isArchived ? "actif" : "archive",
                              })
                            }
                          >
                            {isArchived ? "إلغاء الأرشفة" : "أرشفة"}
                          </button>

                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700"
                            onClick={() => setConfirmDelete(g.id)}
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

        {/* Pagination (UI only; legacy route may ignore these on server) */}
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
          <div className="text-gray-600">الصفحة {page}</div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-xl border disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              السابق
            </button>
            <button
              className="px-3 py-1.5 rounded-xl border"
              onClick={() => setPage(page + 1)}
            >
              التالي
            </button>
            <select
              className="px-3 py-1.5 rounded-xl border bg-white"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
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

      {/* Create/Edit */}
      <GroupeFormModal
        open={showForm}
        initial={editing}
        annees={anneesQ.data || []}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        onSubmit={(payload) => {
          if (editing) {
            updateMut.mutate({
              id: editing.id,
              payload: {
                nom: payload.nom,
                description: payload.description,
                statut: payload.statut,
              },
            });
          } else {
            createMut.mutate(payload);
          }
        }}
        isSubmitting={createMut.isPending || updateMut.isPending}
        defaultAnneeId={effectiveAnneeId}
      />

      {/* Archive/Unarchive */}
      <ConfirmDialog
        open={!!confirmArchive}
        title={
          confirmArchive?.to === "archive"
            ? "أرشفة المجموعة؟"
            : "إلغاء الأرشفة؟"
        }
        description={
          confirmArchive?.to === "archive"
            ? "لن يمكنك إدارة الأعضاء أثناء الأرشفة."
            : "سيتم تفعيل المجموعة من جديد."
        }
        confirmText="تأكيد"
        cancelText="إلغاء"
        onClose={() => setConfirmArchive(null)}
        onConfirm={() =>
          confirmArchive && patchStatutMut.mutate(confirmArchive)
        }
      />

      {/* Delete */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="حذف المجموعة؟"
        description="قد يفشل الحذف إذا كانت هناك ارتباطات. يُفضّل الأرشفة."
        confirmText="حذف"
        cancelText="إلغاء"
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteMut.mutate(confirmDelete)}
      />

      {/* Manage members / educator */}
      {manageModal && (
        <ManageGroupeModal
          group={manageModal}
          onClose={() => setManageModal(null)}
        />
      )}
    </div>
  );
}

/* =========================================================================
   Create / Edit modal
   ========================================================================= */
function GroupeFormModal({
  open,
  initial,
  annees,
  onClose,
  onSubmit,
  isSubmitting,
  defaultAnneeId,
}) {
  const isEdit = !!initial;

  const [annee_id, setAnneeId] = useState(
    initial?.annee_id ?? defaultAnneeId ?? ""
  );
  const [nom, setNom] = useState(initial?.nom || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [statut, setStatut] = useState(initial?.statut || "actif");

  // Reset when props change
  useMemo(() => {
    if (isEdit && initial) {
      setAnneeId(initial.annee_id);
      setNom(initial.nom || "");
      setDescription(initial.description || "");
      setStatut(initial.statut || "actif");
    } else {
      setAnneeId(defaultAnneeId ?? "");
      setNom("");
      setDescription("");
      setStatut("actif");
    }
  }, [isEdit, initial, defaultAnneeId]);

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "تعديل مجموعة" : "مجموعة جديدة"}
      description="أدخل معلومات المجموعة."
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-xl border"
            onClick={onClose}
            disabled={isSubmitting}
          >
            إلغاء
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50"
            onClick={() =>
              isEdit
                ? onSubmit({
                    id: initial.id,
                    nom: nom.trim(),
                    description: description.trim() || null,
                    statut,
                  })
                : onSubmit({
                    annee_id: Number(annee_id),
                    nom: nom.trim(),
                    description: description.trim() || null,
                    statut,
                  })
            }
            disabled={isSubmitting || !nom.trim() || (!isEdit && !annee_id)}
          >
            {isSubmitting ? "جارٍ الحفظ…" : "حفظ"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {!isEdit && (
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              السنة الدراسية <span className="text-rose-600">*</span>
            </label>
            <select
              className="w-full rounded-xl border px-3 py-2 bg-white"
              value={annee_id}
              onChange={(e) => setAnneeId(e.target.value)}
            >
              <option value="">— اختر السنة —</option>
              {annees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.libelle}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            اسم المجموعة <span className="text-rose-600">*</span>
          </label>
          <input
            className="w-full rounded-xl border px-3 py-2"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">الوصف</label>
          <textarea
            rows={3}
            className="w-full rounded-xl border px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {isEdit && (
          <div>
            <label className="block text-sm text-gray-700 mb-1">الحالة</label>
            <select
              className="w-full rounded-xl border px-3 py-2 bg-white"
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
            >
              <option value="actif">نشط</option>
              <option value="archive">مؤرشف</option>
            </select>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* =========================================================================
   Manage members / educator modal
   ========================================================================= */
function ManageGroupeModal({ group, onClose }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState("enfants"); // enfants | educateur
  const archived = group.archived;
  const anneeId = group.annee_id;

  // Inscriptions (to display current members)
  const inscQ = useQuery({
    queryKey: ["inscriptions", { groupeId: group.id, anneeId }],
    queryFn: () => listInscriptions({ groupeId: group.id, anneeId }),
    enabled: !!anneeId,
  });

  // Affectation (to display current educator)
  const affectQ = useQuery({
    queryKey: ["affectation", { groupeId: group.id, anneeId }],
    queryFn: () => getAffectation({ groupeId: group.id, anneeId }),
    enabled: !!anneeId,
  });

  // Mutations
  const addInsMut = useMutation({
    mutationFn: ({ enfantIds }) =>
      addInscriptionsBatch({ groupeId: group.id, anneeId, enfantIds }),
    onSuccess: (out) => {
      qc.invalidateQueries({
        queryKey: ["inscriptions", { groupeId: group.id, anneeId }],
      });
      const created = Number(out?.created ?? 0);
      const transferred = Number(out?.transferred?.length ?? 0);
      const skipped = Number(out?.skipped?.length ?? 0);
      const parts = [];
      if (created) parts.push(`${created} جديد${created > 1 ? "ين" : ""}`);
      if (transferred)
        parts.push(`${transferred} منقول${transferred > 1 ? "ين" : ""}`);
      const summary = parts.length ? parts.join(" و ") : "لا تغييرات";
      const extra = skipped ? ` — تم تجاهل ${skipped}` : "";
      toast?.(`تمت معالجة الأطفال (${summary})${extra}`, "success");
    },
    onError: (e) => {
      const code = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        (code === 409
          ? "بعض الأطفال مسجلون مسبقاً في هذه السنة."
          : "تعذر الإضافة.");
      toast?.(msg, "error");
    },
  });

  const delInsMut = useMutation({
    mutationFn: ({ inscriptionId }) =>
      deleteInscription({ groupeId: group.id, inscriptionId }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["inscriptions", { groupeId: group.id, anneeId }],
      });
      toast?.("تمت إزالة الطفل من المجموعة ✅", "success");
    },
    onError: (e) =>
      toast?.(e?.response?.data?.message || "تعذر الإزالة.", "error"),
  });

  const setAffMut = useMutation({
    mutationFn: ({ educateur_id }) =>
      setAffectation({ groupeId: group.id, anneeId, educateur_id }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["affectation", { groupeId: group.id, anneeId }],
      });
      toast?.("تم تعيين المربي ✅", "success");
    },
    onError: (e) => {
      const code = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        (code === 409
          ? "لا يمكن التعيين: تحقق من قيود السنة (المربي/المجموعة)."
          : "تعذر التعيين.");
      toast?.(msg, "error");
    },
  });

  const delAffMut = useMutation({
    mutationFn: ({ affectationId }) =>
      deleteAffectation({ groupeId: group.id, affectationId }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["affectation", { groupeId: group.id, anneeId }],
      });
      toast?.("تم إزالة التعيين ✅", "success");
    },
    onError: (e) =>
      toast?.(e?.response?.data?.message || "تعذر الإزالة.", "error"),
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={`إدارة المجموعة — ${group.nom}`}
      description={`السنة: ${anneeId}`}
      size="xl"
      footer={
        <div className="flex justify-end">
          <button className="px-4 py-2 rounded-xl border" onClick={onClose}>
            إغلاق
          </button>
        </div>
      }
    >
      {/* Tabs */}
      <div className="mb-4 flex items-center gap-2">
        {[
          ["enfants", "الأطفال"],
          ["educateur", "المربي"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-2 rounded-xl text-sm ${
              tab === key
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "enfants" ? (
        <EnfantsTabSelection
          archived={archived}
          inscQ={inscQ}
          onBatchAdd={(ids) => addInsMut.mutate({ enfantIds: ids })}
          onRemove={(inscriptionId) => delInsMut.mutate({ inscriptionId })}
          isAdding={addInsMut.isPending}
          isRemoving={delInsMut.isPending}
          anneeId={anneeId}
          groupeId={group.id}
        />
      ) : (
        <EducateurTabSelection
          archived={archived}
          affectQ={affectQ}
          onAssign={(educateur_id) => setAffMut.mutate({ educateur_id })}
          onRemove={(affectationId) => delAffMut.mutate({ affectationId })}
          isAssigning={setAffMut.isPending}
          isRemoving={delAffMut.isPending}
          anneeId={anneeId}
        />
      )}
    </Modal>
  );
}

/* =========================================================================
   Enfants tab
   ========================================================================= */
function EnfantsTabSelection({
  archived,
  inscQ,
  onBatchAdd,
  onRemove,
  isAdding,
  isRemoving,
  anneeId,
  groupeId,
}) {
  const [availableSearch, setAvailableSearch] = useState("");
  const [availablePage, setAvailablePage] = useState(1);
  const [availableLimit, setAvailableLimit] = useState(10);
  const [selected, setSelected] = useState(new Set());

  const [transferSearch, setTransferSearch] = useState("");
  const [transferPage, setTransferPage] = useState(1);
  const [transferLimit, setTransferLimit] = useState(5);
  const [transferTouched, setTransferTouched] = useState(false);

  useEffect(() => {
    setSelected(new Set());
  }, [availableSearch, availablePage, availableLimit, groupeId, anneeId]);

  const availableQ = useQuery({
    queryKey: [
      "group_children_available",
      {
        anneeId,
        groupeId,
        search: availableSearch.trim(),
        page: availablePage,
        limit: availableLimit,
      },
    ],
    queryFn: () =>
      searchGroupChildrenCandidates({
        anneeId,
        search: availableSearch.trim() || undefined,
        scope: "available",
        page: availablePage,
        limit: availableLimit,
        excludeGroupeId: groupeId,
      }),
    enabled: !!anneeId,
    keepPreviousData: true,
  });

  const canQueryTransfer = transferSearch.trim().length >= 2;
  const transferQ = useQuery({
    queryKey: [
      "group_children_transfer",
      {
        anneeId,
        groupeId,
        search: transferSearch.trim(),
        page: transferPage,
        limit: transferLimit,
      },
    ],
    queryFn: () =>
      searchGroupChildrenCandidates({
        anneeId,
        search: transferSearch.trim(),
        scope: "assigned",
        page: transferPage,
        limit: transferLimit,
        excludeGroupeId: groupeId,
      }),
    enabled: !!anneeId && canQueryTransfer,
    keepPreviousData: true,
  });

  const currentMembers = inscQ.data?.items ?? [];
  const currentMemberIds = new Set(currentMembers.map((m) => m.enfant_id));
  const availableItems = availableQ.data?.items ?? [];
  const availableMeta = availableQ.data?.meta ?? { hasMore: false, page: availablePage };
  const transferItems = transferQ.data?.items ?? [];
  const transferMeta = transferQ.data?.meta ?? { hasMore: false, page: transferPage };

  const selectedIds = Array.from(selected).filter(
    (id) => !currentMemberIds.has(id)
  );
  const canAdd = selectedIds.length > 0 && !archived && !isAdding;
  const listSize = Math.max(4, Math.min(10, availableItems.length || 0));

  const handleSelectChange = (event) => {
    const values = Array.from(event.target.selectedOptions || []).map((opt) =>
      Number(opt.value)
    );
    setSelected(new Set(values));
  };

  useEffect(() => {
    setSelected(new Set());
  }, [inscQ.data?.meta?.total, groupeId]);

  const handleTransfer = (enfantId) => {
    if (!archived && !isAdding) {
      onBatchAdd([enfantId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Select from directory (with pagination) */}
        <div className="p-4 border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-700">
              اختيار أطفال جدد (غير مسجلين هذا العام)
            </div>
            <div className="flex items-center gap-2">
              <input
                disabled={archived}
                className="rounded-xl border px-3 py-2"
                placeholder="بحث بالاسم/اللقب…"
                value={availableSearch}
                onChange={(e) => {
                  setAvailableSearch(e.target.value);
                  setAvailablePage(1);
                }}
              />
              <button
                className="px-3 py-2 rounded-xl border"
                onClick={() => {
                  setAvailableSearch("");
                  setAvailablePage(1);
                  setSelected(new Set());
                }}
              >
                مسح
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">نتائج متاحة</div>
              <div className="flex items-center gap-2">
                <select
                  className="text-xs rounded-lg border px-2 py-1 bg-white"
                  value={availableLimit}
                  onChange={(e) => {
                    setAvailableLimit(Number(e.target.value));
                    setAvailablePage(1);
                  }}
                >
                  {[10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}/صفحة
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500">الصفحة {availablePage}</div>
              </div>
            </div>

            {availableQ.isLoading ? (
              <div className="p-3 text-sm text-gray-500 border rounded-xl">
                جارٍ التحميل…
              </div>
            ) : availableItems.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 border rounded-xl">
                لا يوجد أطفال متاحون بهذه المعايير.
              </div>
            ) : (
              <select
                multiple
                disabled={archived}
                className="w-full border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring"
                size={listSize}
                value={Array.from(selected).map(String)}
                onChange={handleSelectChange}
              >
                {availableItems.map((c) => (
                  <option key={c.id} value={String(c.id)} className="text-sm">
                    {c.prenom} {c.nom} #{c.id}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center justify-between text-xs text-gray-600">
              <div>
                المختارون للإضافة: <b>{selectedIds.length}</b>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 rounded-lg border"
                  onClick={() => setAvailablePage((p) => Math.max(1, p - 1))}
                  disabled={availablePage <= 1 || availableQ.isLoading}
                >
                  السابق
                </button>
                <button
                  className="px-2 py-1 rounded-lg border"
                  onClick={() => setAvailablePage((p) => p + 1)}
                  disabled={
                    availableQ.isLoading ||
                    !availableMeta?.hasMore
                  }
                >
                  التالي
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <button
              disabled={!canAdd}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50"
              onClick={() => onBatchAdd(selectedIds)}
            >
              {isAdding ? "جارٍ الإضافة…" : "إضافة الأطفال المختارين"}
            </button>
          </div>
          {archived && (
            <p className="mt-2 text-xs text-gray-500">
              المجموعة مؤرشفة — الإضافة معطلة.
            </p>
          )}
        </div>

        {/* Current members (removal) */}
        <div className="p-4 border rounded-xl">
          <div className="text-sm font-semibold text-gray-700 mb-3">
            أعضاء المجموعة
          </div>
          <div className="border rounded-xl overflow-hidden">
            {inscQ.isLoading ? (
              <div className="p-3 text-sm text-gray-500">جارٍ التحميل…</div>
            ) : currentMembers.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">لا توجد عناصر.</div>
            ) : (
              <ul className="divide-y max-h-96 overflow-auto">
                {currentMembers.map((m) => (
                  <li
                    key={m.id}
                    className="p-3 flex items-center justify-between"
                  >
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {m.prenom ? `${m.prenom} ${m.nom}` : `#${m.enfant_id}`}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {m.date_inscription
                          ? new Date(m.date_inscription).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>
                    <button
                      disabled={archived || isRemoving}
                      className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 disabled:opacity-50"
                      onClick={() => onRemove(m.id)}
                    >
                      إزالة
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {archived && (
            <p className="mt-2 text-xs text-gray-500">
              المجموعة مؤرشفة — الإزالة معطلة.
            </p>
          )}
        </div>
      </div>

      {/* Transfer helper */}
      <div className="p-4 border rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-gray-700">
            نقل طفل من مجموعة أخرى في نفس السنة
          </div>
          <div className="text-xs text-gray-500">
            اكتب على الأقل حرفين للبحث
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <input
            className="rounded-xl border px-3 py-2 flex-1"
            placeholder="اسم الطفل أو اللقب أو الرقم…"
            value={transferSearch}
            onChange={(e) => {
              setTransferSearch(e.target.value);
              setTransferTouched(true);
              setTransferPage(1);
            }}
          />
          <button
            className="px-3 py-2 rounded-xl border"
            onClick={() => {
              setTransferSearch("");
              setTransferTouched(false);
              setTransferPage(1);
            }}
          >
            مسح
          </button>
        </div>

        {!transferTouched ? (
          <div className="p-3 text-sm text-gray-500 border rounded-xl">
            ابحث عن طفل لنقله من مجموعة أخرى خلال هذه السنة.
          </div>
        ) : !canQueryTransfer ? (
          <div className="p-3 text-sm text-gray-500 border rounded-xl">
            الرجاء إدخال حرفين على الأقل لإظهار الأطفال القابلين للنقل.
          </div>
        ) : transferQ.isLoading ? (
          <div className="p-3 text-sm text-gray-500 border rounded-xl">
            جارٍ التحميل…
          </div>
        ) : transferItems.length === 0 ? (
          <div className="p-3 text-sm text-gray-500 border rounded-xl">
            لا نتائج مطابقة حالياً.
          </div>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-auto">
            {transferItems.map((child) => {
              const current = child.inscription_actuelle;
              return (
                <li
                  key={child.id}
                  className="p-3 border rounded-xl flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900">
                      {child.prenom} {child.nom} #{child.id}
                    </div>
                    {current && (
                      <div className="text-xs text-gray-600">
                        المجموعة الحالية: {current.groupe_nom ?? `#${current.groupe_id}`}
                      </div>
                    )}
                  </div>
                  <button
                    className="px-3 py-1.5 rounded-xl border border-indigo-300 text-indigo-700 disabled:opacity-50"
                    disabled={archived || isAdding}
                    onClick={() => handleTransfer(child.id)}
                  >
                    نقل للمجموعة
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-3 flex items-center justify-end gap-2 text-xs text-gray-600">
          <button
            className="px-2 py-1 rounded-lg border"
            onClick={() => setTransferPage((p) => Math.max(1, p - 1))}
            disabled={transferPage <= 1 || transferQ.isLoading}
          >
            السابق
          </button>
          <button
            className="px-2 py-1 rounded-lg border"
            onClick={() => setTransferPage((p) => p + 1)}
            disabled={transferQ.isLoading || !transferMeta?.hasMore}
          >
            التالي
          </button>
        </div>
        {archived && (
          <p className="mt-2 text-xs text-gray-500">
            المجموعة مؤرشفة — النقل معطل.
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   Educateur tab
   ========================================================================= */
function EducateurTabSelection({
  archived,
  affectQ,
  onAssign,
  onRemove,
  isAssigning,
  isRemoving,
  anneeId,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    setSelectedId("");
  }, [searchTerm, page, limit, anneeId]);

  const edusQ = useQuery({
    queryKey: [
      "educateurs_candidates",
      { anneeId, search: searchTerm.trim(), page, limit },
    ],
    queryFn: () =>
      searchGroupEducateurCandidates({
        anneeId,
        search: searchTerm.trim() || undefined,
        page,
        limit,
      }),
    enabled: !!anneeId,
    keepPreviousData: true,
  });

  const current = affectQ.data ?? null;
  const currentEducateur = current?.educateur ?? null;
  const options = edusQ.data?.items ?? [];
  const meta = edusQ.data?.meta ?? { hasMore: false };
  const canAssign = Boolean(selectedId) && !archived && !isAssigning;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* Current assignment */}
      <div className="p-4 border rounded-xl">
        <div className="text-sm font-semibold text-gray-700 mb-3">
          التعيين الحالي
        </div>
        <div className="p-3 rounded-xl bg-gray-50 border">
          {affectQ.isLoading ? (
            <div className="text-sm text-gray-500">جارٍ التحميل…</div>
          ) : current ? (
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {currentEducateur
                    ? `${currentEducateur.prenom} ${currentEducateur.nom}`
                    : `#${current.educateur_id}`}
                </div>
                <div className="text-gray-500 text-xs">
                  {currentEducateur?.email || "—"}
                </div>
                <div className="text-gray-400 text-xs">
                  {current.date_affectation
                    ? new Date(current.date_affectation).toLocaleDateString()
                    : "—"}
                </div>
              </div>
              <button
                disabled={archived || isRemoving}
                className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 disabled:opacity-50"
                onClick={() => onRemove(current.id)}
              >
                إزالة التعيين
              </button>
            </div>
          ) : (
            <div className="text-sm text-orange-600">لا يوجد تعيين.</div>
          )}
          {archived && (
            <p className="mt-2 text-xs text-gray-500">
              المجموعة مؤرشفة — التعديلات معطلة.
            </p>
          )}
        </div>
      </div>

      {/* Directory selection */}
      <div className="p-4 border rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-gray-700">اختيار مربي</div>
          <div className="flex items-center gap-2">
            <input
              disabled={archived}
              className="rounded-xl border px-3 py-2"
              placeholder="ابحث عن مربي (الاسم/البريد)…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            <button
              className="px-3 py-2 rounded-xl border"
              onClick={() => {
                setSearchTerm("");
                setPage(1);
                setSelectedId("");
              }}
            >
              مسح
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">النتائج</div>
            <select
              className="text-xs rounded-lg border px-2 py-1 bg-white"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}/صفحة
                </option>
              ))}
            </select>
          </div>

          {edusQ.isLoading ? (
            <div className="p-3 text-sm text-gray-500 border rounded-xl">
              جارٍ التحميل…
            </div>
          ) : options.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 border rounded-xl">
              لا يوجد مربون متاحون بهذه المعايير.
            </div>
          ) : (
            <select
              disabled={archived}
              className="w-full border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="" disabled>
                — اختر مربيًا —
              </option>
              {options.map((u) => {
                const isCurrent = current?.educateur_id === u.id;
                return (
                  <option
                    key={u.id}
                    value={String(u.id)}
                    disabled={isCurrent}
                  >
                    {u.prenom} {u.nom} #{u.id} — {u.email}
                    {isCurrent ? " (المربي الحالي)" : ""}
                  </option>
                );
              })}
            </select>
          )}

          <div className="flex items-center justify-between text-xs text-gray-600">
            <div>الصفحة {page}</div>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 rounded-lg border disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || edusQ.isLoading}
              >
                السابق
              </button>
              <button
                className="px-2 py-1 rounded-lg border"
                onClick={() => setPage((p) => p + 1)}
                disabled={edusQ.isLoading || !meta?.hasMore}
              >
                التالي
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            disabled={!canAssign}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50"
            onClick={() => onAssign(Number(selectedId))}
          >
            {isAssigning ? "جارٍ التعيين…" : "تعيين"}
          </button>
        </div>
        {archived && (
          <p className="mt-2 text-xs text-gray-500">
            المجموعة مؤرشفة — التعيين معطل.
          </p>
        )}
      </div>
    </div>
  );
}
