// src/pages/dashboard/educators/AllEducators.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Modal from "../../../components/common/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { useToast } from "../../../components/common/ToastProvider";
import {
  listEducateurs,
  getEducateur,
  createEducateur,
  updateEducateur,
  archiveEducateur,
  unarchiveEducateur,
} from "../../../api/educateurs";
import { listAnnees, getActiveAnnee } from "../../../api/groups";

const statusLabels = {
  active: "نشط",
  archived: "مؤرشف",
};

const STATUS_OPTIONS = [
  { value: "all", label: "كل الحالات" },
  { value: "active", label: "نشط" },
  { value: "archived", label: "مؤرشف" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const schema = yup.object({
  prenom: yup.string().trim().required("الاسم إجباري"),
  nom: yup.string().trim().required("اللقب إجباري"),
  telephone: yup.string().trim().required("رقم الجوال إجباري"),
  email: yup
    .string()
    .trim()
    .email("البريد الإلكتروني غير صالح")
    .required("البريد الإلكتروني إجباري"),
  mot_de_passe: yup
    .string()
    .trim()
    .min(6, "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل")
    .notRequired(),
});

const dateFormatter = new Intl.DateTimeFormat("ar-TN", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

function isArchived(item) {
  if (!item || typeof item !== "object") return false;
  if (typeof item.status === "string") {
    return item.status === "archived" || item.status === "inactive";
  }
  if (typeof item.est_archive !== "undefined") return Boolean(item.est_archive);
  if (typeof item.is_active !== "undefined") return !item.is_active;
  if (item.archived_at) return true;
  return false;
}

function extractGroups(item) {
  if (!item || typeof item !== "object") return [];
  if (Array.isArray(item.current_groups)) return item.current_groups;
  if (Array.isArray(item.groupes_actuels)) return item.groupes_actuels;
  if (Array.isArray(item.groupes)) return item.groupes;
  if (item.affectations && Array.isArray(item.affectations)) {
    return item.affectations.filter((aff) => aff?.est_active !== false);
  }
  return [];
}

function toFormValues(data) {
  if (!data || typeof data !== "object") {
    return { prenom: "", nom: "", telephone: "", email: "", mot_de_passe: "" };
  }
  return {
    prenom: data.prenom || data.first_name || "",
    nom: data.nom || data.last_name || "",
    telephone: data.telephone || data.phone || "",
    email: data.email || "",
    mot_de_passe: "",
  };
}

export default function AllEducators() {
  const toast = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    anneeId: "",
    page: 1,
    limit: 10,
  });
  const [searchDraft, setSearchDraft] = useState("");

  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  const anneesQuery = useQuery({ queryKey: ["annees"], queryFn: listAnnees });

  const anneesOptions = useMemo(() => {
    const raw = anneesQuery.data;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object") {
      if (Array.isArray(raw.data)) return raw.data;
      if (Array.isArray(raw.items)) return raw.items;
    }
    return [];
  }, [anneesQuery.data]);
  const activeAnneeQuery = useQuery({
    queryKey: ["anneeActive"],
    queryFn: getActiveAnnee,
  });

  const listQuery = useQuery({
    queryKey: ["educateurs", "list", filters],
    queryFn: () =>
      listEducateurs({
        search: filters.search || undefined,
        status: filters.status,
        annee_id: filters.anneeId || undefined,
        page: filters.page,
        limit: filters.limit,
      }),
    keepPreviousData: true,
  });

  const meta = useMemo(() => {
    const fallback = { page: filters.page, limit: filters.limit, total: 0 };
    if (!listQuery.data || typeof listQuery.data !== "object") return fallback;
    const result = {
      ...fallback,
      ...(listQuery.data.meta || {}),
    };
    result.limit = Number(result.limit) || filters.limit;
    result.page = Number(result.page) || filters.page;
    result.total = Number.isFinite(result.total) ? result.total : Number(result.total) || 0;
    return result;
  }, [filters.limit, filters.page, listQuery.data]);

  useEffect(() => {
    if (!listQuery.isFetching && meta.page && meta.page !== filters.page) {
      setFilters((prev) => ({ ...prev, page: meta.page }));
    }
  }, [meta.page, filters.page, listQuery.isFetching]);

  const lastPage = Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 10)));
  const items = Array.isArray(listQuery.data?.items)
    ? listQuery.data.items
    : [];

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailsId, setDetailsId] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);

  const educatorQuery = useQuery({
    queryKey: ["educateurs", "item", editingId],
    queryFn: () => getEducateur(editingId),
    enabled: formOpen && Boolean(editingId),
  });

  const detailsQuery = useQuery({
    queryKey: ["educateurs", "item", detailsId],
    queryFn: () => getEducateur(detailsId),
    enabled: Boolean(detailsId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setFocus,
    setError,
    clearErrors,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { prenom: "", nom: "", telephone: "", email: "", mot_de_passe: "" },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!formOpen) return;
    if (editingId) {
      if (educatorQuery.isFetching) return;
      reset(toFormValues(educatorQuery.data));
    } else {
      reset({ prenom: "", nom: "", telephone: "", email: "", mot_de_passe: "" });
    }
    const t = setTimeout(() => setFocus("prenom"), 50);
    return () => clearTimeout(t);
  }, [formOpen, editingId, educatorQuery.isFetching, educatorQuery.data, reset, setFocus]);

  const createMut = useMutation({
    mutationFn: createEducateur,
    onSuccess: () => {
      toast?.("تم إضافة المربّي بنجاح ✅", "success");
      qc.invalidateQueries({ queryKey: ["educateurs"] });
      setFormOpen(false);
      setEditingId(null);
    },
    onError: (err) => {
      toast?.(err?.response?.data?.message || "تعذر إضافة المربّي ❌", "error");
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateEducateur(id, payload),
    onSuccess: (_, variables) => {
      toast?.("تم حفظ التعديلات ✅", "success");
      qc.invalidateQueries({ queryKey: ["educateurs"] });
      qc.invalidateQueries({ queryKey: ["educateurs", "item", variables.id] });
      setFormOpen(false);
      setEditingId(null);
    },
    onError: (err) => {
      toast?.(err?.response?.data?.message || "تعذر حفظ البيانات ❌", "error");
    },
  });

  const archiveMut = useMutation({
    mutationFn: ({ id, action }) =>
      action === "archive" ? archiveEducateur(id) : unarchiveEducateur(id),
    onSuccess: (_, vars) => {
      toast?.("تم تحديث حالة المربّي ✅", "success");
      qc.invalidateQueries({ queryKey: ["educateurs"] });
      qc.invalidateQueries({ queryKey: ["educateurs", "item", vars.id] });
      setArchiveTarget(null);
    },
    onError: (err) => {
      toast?.(
        err?.response?.data?.message || "تعذر تحديث حالة المربّي ❌",
        "error"
      );
    },
  });

  const submitForm = handleSubmit((values) => {
    const payload = {
      prenom: values.prenom?.trim() || "",
      nom: values.nom?.trim() || "",
      telephone: values.telephone?.trim() || "",
      email: values.email?.trim() || "",
    };

    const password = values.mot_de_passe?.trim() || "";

    if (!editingId) {
      if (!password) {
        setError("mot_de_passe", {
          type: "required",
          message: "كلمة المرور إجبارية للمربّي الجديد",
        });
        return;
      }
      clearErrors("mot_de_passe");
      payload.mot_de_passe = password;
    } else if (password) {
      clearErrors("mot_de_passe");
      payload.mot_de_passe = password;
    } else {
      clearErrors("mot_de_passe");
    }

    if (editingId) {
      updateMut.mutate({ id: editingId, payload });
    } else {
      createMut.mutate(payload);
    }
  });

  const onFormSubmit = (event) => {
    event.preventDefault();
    submitForm();
  };

  const formId = "educator-form";
  const isSaving = createMut.isPending || updateMut.isPending;

  const handleApplySearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchDraft.trim(),
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({ search: "", status: "all", anneeId: "", page: 1, limit: 10 });
    setSearchDraft("");
  };

  const navigateToGroups = (row) => {
    if (!row?.id) return;
    const params = new URLSearchParams();
    const targetYear = filters.anneeId || activeAnneeQuery.data?.id;
    if (targetYear) params.set("anneeId", targetYear);
    params.set("educateurId", row.id);
    navigate(`/dashboard/president/groups?${params.toString()}`);
  };

  return (
    <div className="p-4 md:p-6 space-y-4" dir="rtl">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">المربّون</h1>
          <p className="text-sm text-gray-500">
            إدارة سجلات المربّين، التعيينات الحالية، وحالتهم خلال السنة الدراسية.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            + إضافة مربٍ جديد
          </button>
        </div>
      </header>

      <section className="bg-white border rounded-2xl shadow-sm p-4 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 border md:w-72">
              <svg
                className="w-5 h-5 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 21l-4.35-4.35M11 18a7 7 0 110-14 7 7 0 010 14z" />
              </svg>
              <input
                className="bg-transparent outline-none text-sm flex-1"
                placeholder="ابحث بالاسم أو الهاتف أو البريد…"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplySearch();
                  }
                }}
              />
            </div>

            <select
              className="px-3 py-2 rounded-xl border bg-white text-sm"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2 rounded-xl border bg-white text-sm"
              value={filters.anneeId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, anneeId: e.target.value, page: 1 }))
              }
            >
              <option value="">كل السنوات الدراسية</option>
              {anneesOptions.map((annee) => (
                <option key={annee.id} value={annee.id}>
                  {annee.libelle || annee.nom || `سنة ${annee.id}`}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2 rounded-xl border bg-white text-sm"
              value={filters.limit}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  limit: Number(e.target.value),
                  page: 1,
                }))
              }
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / صفحة
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplySearch}
              className="px-3 py-2 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-sm"
            >
              تطبيق البحث
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-xl border text-sm hover:bg-gray-50"
            >
              إعادة التعيين
            </button>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الاسم الكامل</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الهاتف (جوال)</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">البريد الإلكتروني</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الحالة</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">المجموعات الحالية</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">آخر تحديث</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listQuery.isLoading ? (
                  [...Array(filters.limit)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="h-3.5 bg-gray-100 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3.5 bg-gray-100 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3.5 bg-gray-100 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3.5 bg-gray-100 rounded w-16" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3.5 bg-gray-100 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3.5 bg-gray-100 rounded w-20" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3.5 bg-gray-100 rounded" />
                      </td>
                    </tr>
                  ))
                ) : listQuery.isError ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-rose-600">
                      تعذر تحميل قائمة المربّين.
                      <button
                        type="button"
                        onClick={() => listQuery.refetch()}
                        className="ml-2 text-indigo-600 underline"
                      >
                        إعادة المحاولة
                      </button>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                      لا توجد نتائج مطابقة للمعايير الحالية.
                    </td>
                  </tr>
                ) : (
                  items.map((row) => {
                    const fullName = [row.prenom, row.nom]
                      .filter(Boolean)
                      .join(" ")
                      .trim() || row.full_name || "—";
                    const phone = row.telephone || row.phone || "—";
                    const email = row.email || "—";
                    const archived = isArchived(row);
                    const groups = extractGroups(row);
                    return (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{fullName}</td>
                        <td className="px-4 py-3 text-gray-600">{phone || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">{email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              archived
                                ? "bg-gray-100 text-gray-600"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {archived ? statusLabels.archived : statusLabels.active}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {groups.length === 0 ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {groups.map((g) => (
                                <span
                                  key={`${g.id}-${g.annee_id || ""}`}
                                  className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs"
                                >
                                  {g.nom || g.name || `مجموعة #${g.id}`}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(row.updated_at || row.updatedAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setDetailsId(row.id)}
                              className="px-2 py-1 text-xs rounded-lg border border-gray-200 hover:bg-gray-100"
                            >
                              عرض التفاصيل
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(row.id);
                                setFormOpen(true);
                              }}
                              className="px-2 py-1 text-xs rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                            >
                              تعديل
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setArchiveTarget({
                                  id: row.id,
                                  action: archived ? "unarchive" : "archive",
                                })
                              }
                              className="px-2 py-1 text-xs rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                            >
                              {archived ? "إلغاء الأرشفة" : "أرشفة"}
                            </button>
                            <button
                              type="button"
                              onClick={() => navigateToGroups(row)}
                              className="px-2 py-1 text-xs rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            >
                              تعيين لمجموعة
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
        </div>

        <div className="space-y-3 md:hidden">
          {listQuery.isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="rounded-2xl border p-4 space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : listQuery.isError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
              تعذر تحميل البيانات.
              <button
                type="button"
                onClick={() => listQuery.refetch()}
                className="mr-2 underline"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-6 text-center text-gray-500">
              لا توجد نتائج.
            </div>
          ) : (
            items.map((row) => {
              const fullName = [row.prenom, row.nom]
                .filter(Boolean)
                .join(" ")
                .trim() || row.full_name || "—";
              const archived = isArchived(row);
              const groups = extractGroups(row);
              return (
                <div key={row.id} className="rounded-2xl border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-gray-900">{fullName}</div>
                      <div className="text-sm text-gray-500">{row.email || "—"}</div>
                      <div className="text-sm text-gray-500">{row.telephone || row.phone || "—"}</div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        archived
                          ? "bg-gray-100 text-gray-600"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {archived ? statusLabels.archived : statusLabels.active}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    آخر تحديث: {formatDate(row.updated_at || row.updatedAt)}
                  </div>
                  {groups.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {groups.map((g) => (
                        <span
                          key={`${g.id}-${g.annee_id || ""}`}
                          className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs"
                        >
                          {g.nom || g.name || `مجموعة #${g.id}`}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailsId(row.id)}
                      className="flex-1 px-3 py-2 rounded-xl border text-sm"
                    >
                      التفاصيل
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(row.id);
                        setFormOpen(true);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-indigo-200 text-indigo-600 text-sm"
                    >
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setArchiveTarget({
                          id: row.id,
                          action: archived ? "unarchive" : "archive",
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-rose-200 text-rose-600 text-sm"
                    >
                      {archived ? "إلغاء الأرشفة" : "أرشفة"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToGroups(row)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-emerald-600 text-sm"
                  >
                    تعيين لمجموعة
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-gray-600">
          <div>
            عرض {(items.length && meta.limit) ? `${(meta.page - 1) * meta.limit + 1}–${Math.min(meta.page * meta.limit, meta.total || 0)}` : "0"} من {meta.total || 0}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={filters.page <= 1}
              className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
            >
              السابق
            </button>
            <span>
              صفحة {filters.page} من {lastPage}
            </span>
            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min(lastPage, prev.page + 1),
                }))
              }
              disabled={filters.page >= lastPage}
              className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        </div>
      </section>

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingId(null);
        }}
        title={editingId ? "تعديل بيانات المربّي" : "إضافة مربٍ جديد"}
        size="xl"
        footer={
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-600">
              {editingId
                ? "قم بمراجعة البيانات ثم اضغط حفظ للتحديث."
                : "أدخل بيانات المربّي الجديدة ثم اضغط حفظ."}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                disabled={isSaving}
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => submitForm()}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? "جارٍ الحفظ…" : "حفظ"}
              </button>
            </div>
          </div>
        }
      >
        <form
          id={formId}
          noValidate
          onSubmit={onFormSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="prenom">
                الاسم
              </label>
              <input
                id="prenom"
                className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...register("prenom")}
              />
              {errors.prenom ? (
                <p className="text-xs text-rose-600">{errors.prenom.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="nom">
                اللقب
              </label>
              <input
                id="nom"
                className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...register("nom")}
              />
              {errors.nom ? (
                <p className="text-xs text-rose-600">{errors.nom.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="telephone">
                رقم الجوال
              </label>
              <input
                id="telephone"
                className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...register("telephone")}
              />
              {errors.telephone ? (
                <p className="text-xs text-rose-600">{errors.telephone.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="email"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-xs text-rose-600">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="mot_de_passe">
                كلمة المرور المبدئية
              </label>
              <input
                id="mot_de_passe"
                type="password"
                className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={editingId ? "اترك الحقل فارغًا إذا لم ترغب بتغييره" : "كلمة مرور من 6 أحرف على الأقل"}
                {...register("mot_de_passe")}
              />
              <p className="text-xs text-gray-500">
                {editingId
                  ? "يمكنك تحديث كلمة المرور بكتابة قيمة جديدة أو ترك الحقل فارغًا للإبقاء على الحالية."
                  : "سيتم إنشاء حساب المربّي باستخدام كلمة المرور التي تُدخلها هنا."}
              </p>
              {errors.mot_de_passe ? (
                <p className="text-xs text-rose-600">{errors.mot_de_passe.message}</p>
              ) : null}
            </div>
          </div>
        </form>
      </Modal>

      <EducatorDrawer
        open={Boolean(detailsId)}
        onClose={() => setDetailsId(null)}
        data={detailsQuery.data}
        loading={detailsQuery.isLoading}
      />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        title={archiveTarget?.action === "archive" ? "أرشفة المربّي" : "إلغاء الأرشفة"}
        description={
          archiveTarget?.action === "archive"
            ? "سيتم نقل المربّي إلى حالة مؤرشفة ولن يظهر في التعيينات الجديدة."
            : "سيصبح المربّي نشطًا من جديد ويمكن تعيينه للمجموعات."
        }
        confirmText={archiveTarget?.action === "archive" ? "أرشفة" : "تفعيل"}
        loading={archiveMut.isPending}
        onConfirm={() =>
          archiveTarget?.id &&
          archiveMut.mutate({ id: archiveTarget.id, action: archiveTarget.action })
        }
      />
    </div>
  );
}

function EducatorDrawer({ open, onClose, data, loading }) {
  if (!open) return null;
  const fullName = data
    ? [data.prenom, data.nom].filter(Boolean).join(" ").trim() || data.full_name || "—"
    : "—";
  const archived = isArchived(data);
  const groups = extractGroups(data);

  return (
    <div className="fixed inset-0 z-[70] flex" dir="rtl">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <aside className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
        <div className="px-6 py-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{data?.email || "—"}</span>
              <span>•</span>
              <span>{data?.telephone || data?.phone || "—"}</span>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                archived ? "bg-gray-100 text-gray-600" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {archived ? statusLabels.archived : statusLabels.active}
            </span>
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">البيانات الأساسية</h3>
            <div className="rounded-2xl border bg-gray-50 p-4 text-sm text-gray-600 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">البريد الإلكتروني</span>
                <span className="font-medium text-gray-800">{data?.email || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">الهاتف الجوال</span>
                <span className="font-medium text-gray-800">
                  {data?.telephone || data?.phone || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">آخر تحديث</span>
                <span className="font-medium text-gray-800">
                  {formatDate(data?.updated_at || data?.updatedAt)}
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">المجموعات الحالية</h3>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="h-10 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="rounded-xl border border-dashed p-4 text-sm text-gray-500 text-center">
                لا توجد مجموعات نشطة حالياً.
              </div>
            ) : (
              <ul className="space-y-2">
                {groups.map((g) => (
                  <li
                    key={`${g.id}-${g.annee_id || ""}`}
                    className="rounded-xl border px-4 py-3 flex flex-col gap-1"
                  >
                    <div className="text-sm font-semibold text-gray-900">
                      {g.nom || g.name || `مجموعة #${g.id}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      السنة الدراسية: {g.annee_libelle || g.annee || g.annee_id || "—"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
