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
  const anneesOptions = useMemo(() => {
    const raw = anneesQ.data;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object") {
      if (Array.isArray(raw.data)) return raw.data;
      if (Array.isArray(raw.items)) return raw.items;
    }
    return [];
  }, [anneesQ.data]);
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
  const stats = useMemo(() => {
    let activeCount = 0;
    let archivedCount = 0;
    let childrenCount = 0;
    data.forEach((g) => {
      if (g?.statut === "actif") activeCount += 1;
      if (g?.statut === "archive") archivedCount += 1;
      if (typeof g?.nb_enfants === "number") {
        childrenCount += g.nb_enfants;
      }
    });
    return {
      total: data.length,
      active: activeCount,
      archived: archivedCount,
      children: childrenCount,
    };
  }, [data]);
  const activeYearData = activeAnneeQ.data;
  const effectiveAnneeLabel = useMemo(() => {
    if (effectiveAnneeId == null) return null;
    const fromList = anneesOptions.find((a) => a.id === effectiveAnneeId);
    if (fromList) return fromList.libelle;
    if (activeYearData?.id === effectiveAnneeId) {
      return activeYearData?.libelle ?? null;
    }
    return null;
  }, [effectiveAnneeId, anneesOptions, activeYearData]);
  const isLoadingGroups = groupesQ.isLoading;
  const hasErrorGroups = groupesQ.isError;

  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-indigo-700 via-indigo-600 to-indigo-500 text-white shadow-xl">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6)_0,_rgba(255,255,255,0)_60%)]" />
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-indigo-100">لوحة التحكم</p>
              <h1 className="text-2xl md:text-3xl font-bold">المجموعات الدراسية</h1>
              <p className="max-w-xl text-indigo-100/80 text-sm md:text-base">
                راقب التقدم، أنشئ مجموعات جديدة، ونسّق توزيع الأطفال والمربين بسهولة ضمن تجربة متكاملة بالعربية.
              </p>
              {effectiveAnneeId == null ? (
                <p className="text-amber-100/90 font-medium">
                  اختر السنة الدراسية لعرض تفاصيل المجموعات وإدارتها.
                </p>
              ) : (
                <p className="text-indigo-100/90">
                  السنة المختارة: <span className="font-semibold">{effectiveAnneeLabel ?? `#${effectiveAnneeId}`}</span>
                </p>
              )}
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setShowForm(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/90 px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-900/20 transition hover:bg-white disabled:opacity-50"
                  disabled={effectiveAnneeId == null}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                    +
                  </span>
                  مجموعة جديدة
                </button>
                <Link
                  to="/dashboard/children"
                  className="inline-flex items-center rounded-2xl border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
                >
                  سجل الأطفال
                </Link>
              </div>
              {activeYearData?.libelle && (
                <span className="text-xs text-indigo-100/80">
                  السنة النشطة: {activeYearData.libelle}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "إجمالي المجموعات", value: stats.total },
              { label: "المجموعات النشطة", value: stats.active },
              { label: "المجموعات المؤرشفة", value: stats.archived },
              { label: "عدد الأطفال الحالي", value: stats.children },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-inner backdrop-blur"
              >
                <p className="text-xs text-indigo-100/80">{card.label}</p>
                <p className="mt-1 text-xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-indigo-100/70 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-indigo-900/80">السنة الدراسية</label>
            <select
              className="w-full rounded-2xl border border-indigo-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={effectiveAnneeId || ""}
              onChange={(e) =>
                setAnneeId(e.target.value ? Number(e.target.value) : undefined)
              }
            >
              {!effectiveAnneeId && <option value="">— اختر السنة —</option>}
              {anneesOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.libelle} {a.est_active ? "• الحالية" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-indigo-900/80">الحالة</label>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: "actif", label: "نشطة" },
                { key: "archive", label: "مؤرشفة" },
              ].map((s) => {
                const active = statut === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    className={`rounded-2xl px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                      active
                        ? "bg-indigo-600 text-white shadow"
                        : "border border-indigo-200 bg-white text-indigo-700 hover:border-indigo-300"
                    }`}
                    onClick={() => setStatut(s.key)}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-indigo-900/80">بحث</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-indigo-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18 7.5 7.5 0 0016.65 16.65z"
                    />
                  </svg>
                </span>
                <input
                  className="w-full rounded-2xl border border-indigo-200 bg-white py-2.5 pr-4 pl-10 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="ابحث باسم المجموعة…"
                  value={draftSearch}
                  onChange={(e) => setDraftSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                  onClick={applySearch}
                >
                  بحث
                </button>
                <button
                  type="button"
                  className="rounded-2xl border border-indigo-200 px-4 py-2 text-sm text-indigo-700 hover:border-indigo-300"
                  onClick={resetFilters}
                >
                  إعادة تعيين
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-100 bg-gray-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">قائمة المجموعات</h2>
            <p className="text-sm text-gray-500">
              استعرض المجموعات الحالية، وقم بإدارتها أو تعديلها بسرعة.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {stats.total} مجموعة
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm leading-6 text-gray-700">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-right font-semibold text-gray-500">اسم المجموعة</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-500">السنة</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-500">الحالة</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-500">الأطفال</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-500">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingGroups
                ? Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-3 w-24 rounded-full bg-gray-200" />
                        <div className="mt-2 h-3 w-32 rounded-full bg-gray-100" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 w-16 rounded-full bg-gray-200" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 w-20 rounded-full bg-gray-200" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 w-10 rounded-full bg-gray-200" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 w-28 rounded-full bg-gray-200" />
                      </td>
                    </tr>
                  ))
                : hasErrorGroups
                ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-6 text-center text-sm font-medium text-rose-600"
                      >
                        {groupesQ.error?.response?.data?.message || "حدث خطأ أثناء الجلب."}
                      </td>
                    </tr>
                  )
                : data.length === 0
                ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        لا توجد مجموعات مطابقة للمعايير الحالية.
                      </td>
                    </tr>
                  )
                : (
                    data.map((g) => {
                      const isArchived = g.statut === "archive";
                      const yearLib =
                        anneesOptions.find((a) => a.id === g.annee_id)?.libelle || "—";
                      const childrenCount =
                        typeof g.nb_enfants === "number" ? g.nb_enfants : 0;
                      return (
                        <tr
                          key={g.id}
                          className="transition hover:bg-indigo-50/40"
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{g.nom}</div>
                            {g.description && (
                              <div className="mt-1 text-xs text-gray-500 truncate">
                                {g.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{yearLib}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                isArchived
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              <span className="inline-block h-2 w-2 rounded-full bg-current" />
                              {isArchived ? "مؤرشفة" : "نشطة"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                              {childrenCount}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap justify-end gap-2 text-xs font-medium">
                              <button
                                type="button"
                                className="rounded-full border border-indigo-200 px-3 py-1.5 text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50"
                                onClick={() => {
                                  setEditing(g);
                                  setShowForm(true);
                                }}
                              >
                                تعديل
                              </button>
                              <button
                                type="button"
                                className="rounded-full border border-indigo-200 px-3 py-1.5 text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50"
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
                                className="rounded-full border border-indigo-200 px-3 py-1.5 text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50"
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
                                className="rounded-full border border-rose-200 px-3 py-1.5 text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
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
        <div className="flex flex-col gap-3 border-t border-gray-100 bg-white px-6 py-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            الصفحة الحالية: <span className="font-semibold text-gray-800">{page}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-indigo-200 px-3 py-1.5 transition hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || isLoadingGroups}
            >
              السابق
            </button>
            <button
              type="button"
              className="rounded-full border border-indigo-200 px-3 py-1.5 transition hover:border-indigo-300 hover:bg-indigo-50"
              onClick={() => setPage(page + 1)}
              disabled={isLoadingGroups}
            >
              التالي
            </button>
            <select
              className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              disabled={isLoadingGroups}
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / صفحة
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Create/Edit */}
      <GroupeFormModal
        open={showForm}
        initial={editing}
        annees={anneesOptions}
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
