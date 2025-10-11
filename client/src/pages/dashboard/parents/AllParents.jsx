// src/pages/dashboard/parents/AllParents.jsx
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Modal from "../../../components/common/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { useToast } from "../../../components/common/ToastProvider";
import {
  useParentsQuery,
  useParent,
  useCreateParent,
  useUpdateParent,
  useArchiveParent,
  useUnarchiveParent,
  useLinkChild,
  useUnlinkChild,
  searchChildren,
} from "../../../api/parents";

const STATUS_OPTIONS = [
  { value: "all", label: "كل الحالات" },
  { value: "active", label: "نشط" },
  { value: "archived", label: "مؤرشف" },
];

const CONTACT_OPTIONS = [
  { value: "any", label: "كل جهات الاتصال" },
  { value: "email", label: "يملك بريداً" },
  { value: "phone", label: "يملك هاتفاً" },
  { value: "both", label: "هاتف وبريد" },
  { value: "missing", label: "ناقص بيانات" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const PHONE_REGEX = /^[0-9+()\-\s]{7,20}$/;

function createFormSchema({ isEdit }) {
  const passwordSchemaBase = yup
    .string()
    .transform((value, originalValue) => {
      if (originalValue === undefined) return undefined;
      const trimmed = (originalValue || "").trim();
      return trimmed.length ? trimmed : "";
    })
    .nullable()
    .max(100, "كلمة المرور طويلة جداً")
    .test("password-length", "كلمة المرور لا تقل عن 6 أحرف", (value) => {
      if (!value) return true;
      return value.length >= 6;
    });

  const passwordSchema = isEdit
    ? passwordSchemaBase.optional().nullable()
    : passwordSchemaBase.required("كلمة المرور مطلوبة");

  return yup
    .object({
      prenom: yup.string().trim().required("الاسم إجباري"),
      nom: yup.string().trim().required("اللقب إجباري"),
      telephone: yup
        .string()
        .transform((value) =>
          value === undefined || value === null ? null : value.trim()
        )
        .nullable()
        .test("phone-format", "رقم الهاتف غير صالح", (value) => {
          if (!value) return true;
          return PHONE_REGEX.test(value);
        }),
      email: yup
        .string()
        .transform((value) =>
          value === undefined || value === null ? null : value.trim()
        )
        .nullable()
        .email("البريد الإلكتروني غير صالح"),
      adresse: yup
        .string()
        .transform((value) =>
          value === undefined || value === null ? null : value.trim()
        )
        .nullable()
        .max(255, "العنوان طويل جداً"),
      mot_de_passe: passwordSchema,
    })
    .test("contact", "يجب توفير هاتف أو بريد إلكتروني", (value) => {
      if (!value) return false;
      const phone = typeof value.telephone === "string" ? value.telephone.trim() : value.telephone;
      const email = typeof value.email === "string" ? value.email.trim() : value.email;
      return Boolean((phone && phone.length) || (email && email.length));
    });
}

const defaultFormValues = {
  prenom: "",
  nom: "",
  telephone: "",
  email: "",
  adresse: "",
  mot_de_passe: "",
};

function toFormValues(parent) {
  if (!parent) return { ...defaultFormValues };
  return {
    prenom: parent.prenom || "",
    nom: parent.nom || "",
    telephone: parent.telephone || "",
    email: parent.email || "",
    adresse: parent.adresse || "",
    mot_de_passe: "",
  };
}

function fullName(parent) {
  if (!parent) return "—";
  const name = `${parent.prenom || ""} ${parent.nom || ""}`.trim();
  return name || "—";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-TN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

export default function AllParents() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(() => ({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "all",
    has_contact: searchParams.get("has_contact") || "any",
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 10),
  }));
  const [searchDraft, setSearchDraft] = useState(filters.search);

  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.has_contact && filters.has_contact !== "any")
      params.set("has_contact", filters.has_contact);
    if (filters.page && filters.page !== 1) params.set("page", String(filters.page));
    if (filters.limit && filters.limit !== 10) params.set("limit", String(filters.limit));
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const listQuery = useParentsQuery(filters);
  const items = Array.isArray(listQuery.data?.items) ? listQuery.data.items : [];
  const meta = listQuery.data?.meta || { page: filters.page, limit: filters.limit, total: 0 };
  const lastPage = Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || filters.limit)));

  const [selected, setSelected] = useState([]);
  useEffect(() => {
    setSelected((prev) => prev.filter((id) => items.some((item) => item.id === id)));
  }, [items]);

  const [formState, setFormState] = useState({ mode: "create", parentId: null });
  const [formOpen, setFormOpen] = useState(false);
  const [detailsId, setDetailsId] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [linkState, setLinkState] = useState({ open: false, parentId: null });

  const resolver = useMemo(
    () => yupResolver(createFormSchema({ isEdit: formState.mode === "edit" })),
    [formState.mode]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaultFormValues,
    resolver,
  });

  const parentDetailQuery = useParent(formState.parentId, {
    enabled: formOpen && formState.mode === "edit" && Boolean(formState.parentId),
  });
  const drawerQuery = useParent(detailsId, {
    enabled: Boolean(detailsId),
  });

  useEffect(() => {
    if (formOpen && formState.mode === "edit" && parentDetailQuery.data) {
      reset(toFormValues(parentDetailQuery.data));
    }
    if (formOpen && formState.mode === "create") {
      reset({ ...defaultFormValues });
    }
  }, [formOpen, formState.mode, parentDetailQuery.data, reset]);

  const createMutation = useCreateParent({
    onSuccess: () => {
      toast?.("تم إضافة الولي بنجاح");
      setFormOpen(false);
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message || err?.message || "تعذر إنشاء الولي";
      toast?.(message, "error");
    },
  });
  const updateMutation = useUpdateParent({
    onSuccess: () => {
      toast?.("تم تحديث بيانات الولي");
      setFormOpen(false);
    },
    onError: (err) => {
      const message = err?.response?.data?.message || err?.message || "تعذر التحديث";
      toast?.(message, "error");
    },
  });
  const archiveMutation = useArchiveParent({
    onError: (err) => {
      const message = err?.response?.data?.message || err?.message || "تعذر الأرشفة";
      toast?.(message, "error");
    },
  });
  const unarchiveMutation = useUnarchiveParent({
    onError: (err) => {
      const message = err?.response?.data?.message || err?.message || "تعذر الاسترجاع";
      toast?.(message, "error");
    },
  });
  const linkChildMutation = useLinkChild({
    onSuccess: () => {
      toast?.("تم ربط الطفل بنجاح");
      setLinkState({ open: false, parentId: null });
    },
    onError: (err) => {
      const message = err?.response?.data?.message || err?.message || "تعذر ربط الطفل";
      toast?.(message, "error");
    },
  });
  const unlinkChildMutation = useUnlinkChild({
    onSuccess: () => {
      toast?.("تم إلغاء الربط");
    },
    onError: (err) => {
      const message = err?.response?.data?.message || err?.message || "تعذر إلغاء الربط";
      toast?.(message, "error");
    },
  });

  const onSubmit = async (values, e) => {
    const payload = {
      prenom: values.prenom.trim(),
      nom: values.nom.trim(),
      telephone: values.telephone ? values.telephone.trim() : "",
      email: values.email ? values.email.trim() : "",
      adresse: values.adresse ? values.adresse.trim() : "",
      mot_de_passe: values.mot_de_passe || undefined,
    };
    try {
      if (formState.mode === "edit" && formState.parentId) {
        await updateMutation.mutateAsync({ id: formState.parentId, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (err) {
      // handled by mutations
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchDraft.trim();
      setFilters((prev) => ({ ...prev, search: trimmed, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchDraft]);

  const toggleSelectAll = () => {
    if (selected.length === items.length) {
      setSelected([]);
    } else {
      setSelected(items.map((item) => item.id));
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const openCreateModal = () => {
    setFormState({ mode: "create", parentId: null });
    reset({ ...defaultFormValues });
    setFormOpen(true);
  };

  const openEditModal = (id) => {
    setFormState({ mode: "edit", parentId: id });
    setFormOpen(true);
  };

  const openDetails = (id) => {
    setDetailsId(id);
  };

  const openLinkModal = (id) => {
    setLinkState({ open: true, parentId: id });
  };

  const confirmArchive = (ids, type) => {
    if (!ids.length) return;
    setConfirmState({
      open: true,
      type,
      ids,
    });
  };

  const confirmUnlink = (parentId, enfantId) => {
    setConfirmState({
      open: true,
      type: "unlink",
      parentId,
      enfantId,
    });
  };

  const [confirmLoading, setConfirmLoading] = useState(false);
  const handleConfirm = async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    try {
      if (confirmState.type === "archive") {
        await Promise.all(
          confirmState.ids.map((id) => archiveMutation.mutateAsync(id))
        );
        toast?.("تم أرشفة الأولياء المحددين");
        setSelected([]);
      } else if (confirmState.type === "unarchive") {
        await Promise.all(
          confirmState.ids.map((id) => unarchiveMutation.mutateAsync(id))
        );
        toast?.("تم تفعيل الأولياء");
        setSelected([]);
      } else if (confirmState.type === "unlink") {
        await unlinkChildMutation.mutateAsync({
          parentId: confirmState.parentId,
          enfantId: confirmState.enfantId,
        });
      }
    } catch (err) {
      // handled above
    } finally {
      setConfirmLoading(false);
      setConfirmState(null);
    }
  };

  const exportCsv = () => {
    if (!items.length) {
      toast?.("لا توجد بيانات للتصدير", "error");
      return;
    }
    const headers = [
      "الاسم الكامل",
      "الهاتف",
      "البريد",
      "العنوان",
      "عدد الأطفال",
      "الحالة",
      "آخر تحديث",
    ];
    const rows = items.map((item) => [
      fullName(item),
      item.telephone || "",
      item.email || "",
      item.adresse || "",
      item.children_count || 0,
      item.status === "archived" ? "مؤرشف" : "نشط",
      formatDate(item.updated_at),
    ]);
    const csv = [headers.map(csvEscape).join(","), ...rows.map((row) => row.map(csvEscape).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `parents-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const linkingParent =
    items.find((p) => p.id === linkState.parentId) ||
    (drawerQuery.data && drawerQuery.data.id === linkState.parentId
      ? drawerQuery.data
      : null);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8" dir="rtl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">الأولياء</h1>
            <p className="text-sm text-slate-500">إدارة حسابات أولياء الأمور وربط الأطفال.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <svg
                className="h-4 w-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l4-4m-4 4-4-4" />
              </svg>
              تصدير CSV
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
              </svg>
              إضافة ولي
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <svg
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 4a6 6 0 014.472 9.972l4.278 4.278a.75.75 0 11-1.06 1.06l-4.279-4.277A6 6 0 1110 4z"
                  />
                </svg>
                <input
                  type="search"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  placeholder="بحث بالاسم أو الهاتف أو البريد"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-10 pl-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.has_contact}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, has_contact: e.target.value, page: 1 }))
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {CONTACT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>عدد السجلات: {meta.total || 0}</span>
              <span>صفحة {meta.page || 1} من {lastPage}</span>
            </div>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-blue-50/70 px-3 py-2 text-sm text-blue-700">
              <span>تم تحديد {selected.length} ولي</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => confirmArchive(selected, "archive")}
                  className="rounded-lg border border-blue-200 px-3 py-1 hover:bg-blue-100"
                >
                  أرشفة المحدد
                </button>
                <button
                  type="button"
                  onClick={() => confirmArchive(selected, "unarchive")}
                  className="rounded-lg border border-blue-200 px-3 py-1 hover:bg-blue-100"
                >
                  تفعيل المحدد
                </button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="hidden w-full overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-200 text-right">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="w-12 px-3 py-3 text-xs font-semibold text-slate-500">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300"
                        checked={selected.length === items.length && items.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">الاسم الكامل</th>
                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">الهاتف</th>
                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">البريد</th>
                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">العنوان</th>
                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">عدد الأطفال</th>
                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">الحالة</th>
                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">آخر تحديث</th>
                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-sm">
                  {listQuery.isLoading ? (
                    [...Array(5)].map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-3 py-4">
                          <div className="h-4 w-4 rounded bg-slate-200" />
                        </td>
                        {[...Array(7)].map((__, i) => (
                          <td key={i} className="px-3 py-4">
                            <div className="h-4 w-full rounded bg-slate-200" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                        لا توجد نتائج مطابقة للبحث الحالي.
                      </td>
                    </tr>
                  ) : (
                    items.map((parent) => (
                      <tr key={parent.id} className="hover:bg-slate-50">
                        <td className="px-3 py-4">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300"
                            checked={selected.includes(parent.id)}
                            onChange={() => toggleSelect(parent.id)}
                          />
                        </td>
                        <td className="px-3 py-4 font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{fullName(parent)}</span>
                            {parent.missing_contact && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                                ناقص بيانات اتصال
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-slate-600">{parent.telephone || "—"}</td>
                        <td className="px-3 py-4 text-slate-600">{parent.email || "—"}</td>
                        <td className="px-3 py-4 text-slate-600">{parent.adresse || "—"}</td>
                        <td className="px-3 py-4 text-slate-600">{parent.children_count || 0}</td>
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              parent.status === "archived"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {parent.status === "archived" ? "مؤرشف" : "نشط"}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-slate-600">{formatDate(parent.updated_at)}</td>
                        <td className="px-3 py-4">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => openDetails(parent.id)}
                              className="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-100"
                            >
                              عرض التفاصيل
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(parent.id)}
                              className="rounded-lg border border-blue-200 px-3 py-1 text-blue-600 hover:bg-blue-50"
                            >
                              تعديل
                            </button>
                            {parent.status === "archived" ? (
                              <button
                                type="button"
                                onClick={() => confirmArchive([parent.id], "unarchive")}
                                className="rounded-lg border border-emerald-200 px-3 py-1 text-emerald-600 hover:bg-emerald-50"
                              >
                                إلغاء الأرشفة
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => confirmArchive([parent.id], "archive")}
                                className="rounded-lg border border-rose-200 px-3 py-1 text-rose-600 hover:bg-rose-50"
                              >
                                أرشفة
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openLinkModal(parent.id)}
                              className="rounded-lg border border-indigo-200 px-3 py-1 text-indigo-600 hover:bg-indigo-50"
                            >
                              تعيين لطفل
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 md:hidden">
              {listQuery.isLoading ? (
                [...Array(3)].map((_, idx) => (
                  <div key={idx} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="mt-3 space-y-2">
                      {[...Array(3)].map((__, i) => (
                        <div key={i} className="h-3 w-full rounded bg-slate-200" />
                      ))}
                    </div>
                  </div>
                ))
              ) : items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                  لا توجد نتائج مطابقة.
                </div>
              ) : (
                items.map((parent) => (
                  <div key={parent.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{fullName(parent)}</div>
                        <div className="mt-1 text-xs text-slate-500">آخر تحديث: {formatDate(parent.updated_at)}</div>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300"
                        checked={selected.includes(parent.id)}
                        onChange={() => toggleSelect(parent.id)}
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-500">الهاتف:</span> {parent.telephone || "—"}
                      </div>
                      <div>
                        <span className="text-slate-500">البريد:</span> {parent.email || "—"}
                      </div>
                      <div>
                        <span className="text-slate-500">العنوان:</span> {parent.adresse || "—"}
                      </div>
                      <div>
                        <span className="text-slate-500">الأطفال:</span> {parent.children_count || 0}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          parent.status === "archived"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {parent.status === "archived" ? "مؤرشف" : "نشط"}
                      </span>
                      {parent.missing_contact && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-700">
                          ناقص بيانات اتصال
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => openDetails(parent.id)}
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-100"
                      >
                        عرض التفاصيل
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(parent.id)}
                        className="flex-1 rounded-lg border border-blue-200 px-3 py-1 text-blue-600 hover:bg-blue-50"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => openLinkModal(parent.id)}
                        className="flex-1 rounded-lg border border-indigo-200 px-3 py-1 text-indigo-600 hover:bg-indigo-50"
                      >
                        تعيين لطفل
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          confirmArchive(
                            [parent.id],
                            parent.status === "archived" ? "unarchive" : "archive"
                          )
                        }
                        className="flex-1 rounded-lg border border-rose-200 px-3 py-1 text-rose-600 hover:bg-rose-50"
                      >
                        {parent.status === "archived" ? "إلغاء الأرشفة" : "أرشفة"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 sm:flex-row">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={meta.page <= 1}
                className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(lastPage, prev.page + 1) }))}
                disabled={meta.page >= lastPage}
                className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40"
              >
                التالي
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span>عدد الصفوف:</span>
              <select
                value={filters.limit}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }))
                }
                className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={formState.mode === "edit" ? "تعديل بيانات الولي" : "إضافة ولي جديد"}
        description="أدخل بيانات الولي مع مراعاة توفر وسيلة اتصال واحدة على الأقل"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="prenom">
                الاسم
              </label>
              <input
                id="prenom"
                type="text"
                {...register("prenom")}
                className={`rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  errors.prenom ? "border-rose-400" : "border-slate-300"
                }`}
              />
              {errors.prenom && (
                <p className="text-xs text-rose-600">{errors.prenom.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="nom">
                اللقب
              </label>
              <input
                id="nom"
                type="text"
                {...register("nom")}
                className={`rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  errors.nom ? "border-rose-400" : "border-slate-300"
                }`}
              />
              {errors.nom && <p className="text-xs text-rose-600">{errors.nom.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="telephone">
                الهاتف
              </label>
              <input
                id="telephone"
                type="text"
                {...register("telephone")}
                className={`rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  errors.telephone ? "border-rose-400" : "border-slate-300"
                }`}
              />
              {errors.telephone && (
                <p className="text-xs text-rose-600">{errors.telephone.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className={`rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  errors.email ? "border-rose-400" : "border-slate-300"
                }`}
              />
              {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="adresse">
              العنوان
            </label>
            <textarea
              id="adresse"
              rows={3}
              {...register("adresse")}
              className={`rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                errors.adresse ? "border-rose-400" : "border-slate-300"
              }`}
            />
            {errors.adresse && (
              <p className="text-xs text-rose-600">{errors.adresse.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              كلمة المرور {formState.mode === "edit" ? "(اتركها فارغة للإبقاء عليها)" : ""}
            </label>
            <input
              id="password"
              type="password"
              {...register("mot_de_passe")}
              className={`rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                errors.mot_de_passe ? "border-rose-400" : "border-slate-300"
              }`}
            />
            {errors.mot_de_passe && (
              <p className="text-xs text-rose-600">{errors.mot_de_passe.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting || createMutation.isLoading || updateMutation.isLoading}
            >
              {formState.mode === "edit" ? "تحديث" : "حفظ"}
            </button>
          </div>
        </form>
      </Modal>

      <ParentDrawer
        open={Boolean(detailsId)}
        onClose={() => setDetailsId(null)}
        data={drawerQuery.data}
        loading={drawerQuery.isLoading}
        onEdit={() => {
          if (detailsId) {
            const id = detailsId;
            setDetailsId(null);
            openEditModal(id);
          }
        }}
        onLink={() => {
          if (detailsId) {
            const id = detailsId;
            setDetailsId(null);
            openLinkModal(id);
          }
        }}
        onUnlink={(childId) => confirmUnlink(detailsId, childId)}
      />

      <LinkChildModal
        open={linkState.open}
        parent={linkingParent}
        onClose={() => setLinkState({ open: false, parentId: null })}
        onLink={(childId) =>
          linkChildMutation.mutate({ parentId: linkState.parentId, enfantId: childId })
        }
        linking={linkChildMutation.isLoading}
      />

      <ConfirmDialog
        open={Boolean(confirmState)}
        onClose={() => !confirmLoading && setConfirmState(null)}
        onConfirm={handleConfirm}
        loading={confirmLoading}
        title={
          confirmState?.type === "archive"
            ? "تأكيد الأرشفة"
            : confirmState?.type === "unarchive"
            ? "تأكيد التفعيل"
            : "تأكيد إلغاء الربط"
        }
        description={
          confirmState?.type === "unlink"
            ? "هل تريد إلغاء ربط الطفل بهذا الولي؟"
            : "هل ترغب في متابعة العملية المحددة؟"
        }
        confirmText={
          confirmState?.type === "archive"
            ? "أرشفة"
            : confirmState?.type === "unarchive"
            ? "تفعيل"
            : "إلغاء الربط"
        }
      />
    </div>
  );
}

function ParentDrawer({ open, onClose, data, loading, onEdit, onLink, onUnlink }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end" dir="rtl">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">تفاصيل الولي</h2>
            <p className="text-xs text-slate-500">معلومات الاتصال والأطفال المرتبطون</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-blue-200 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
            >
              تعديل
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
              aria-label="إغلاق"
            >
              ×
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-4 w-full animate-pulse rounded bg-slate-200" />
              ))}
            </div>
          ) : !data ? (
            <div className="text-center text-sm text-slate-500">لا توجد بيانات للعرض.</div>
          ) : (
            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <div className="text-xs text-slate-500">الاسم الكامل</div>
                <div className="font-semibold text-slate-900">{fullName(data)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-500">الهاتف</div>
                  <div>{data.telephone || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">البريد الإلكتروني</div>
                  <div>{data.email || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">العنوان</div>
                  <div>{data.adresse || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">الحالة</div>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        data.status === "archived"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {data.status === "archived" ? "مؤرشف" : "نشط"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">الأطفال المرتبطون</h3>
                <button
                  type="button"
                  onClick={onLink}
                  className="rounded-lg border border-indigo-200 px-3 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
                >
                  ربط طفل
                </button>
              </div>
              {(!data.enfants || data.enfants.length === 0) && (
                <div className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-500">
                  لا يوجد أطفال مرتبطون حالياً.
                </div>
              )}
              <div className="flex flex-col gap-2">
                {Array.isArray(data.enfants) &&
                  data.enfants.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{`${child.prenom || ""} ${child.nom || ""}`.trim()}</div>
                        <div className="text-xs text-slate-500">
                          {child.date_naissance || "—"} · {child.groupe_actif?.nom || "بدون مجموعة"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onUnlink(child.id)}
                        className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700 hover:bg-rose-200"
                      >
                        إلغاء الربط
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function LinkChildModal({ open, parent, onClose, onLink, linking }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchChildren(query.trim());
        if (active) setResults(data);
      } catch (err) {
        toast?.("تعذر تحميل الأطفال", "error");
      } finally {
        if (active) setLoading(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, open, toast]);

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ربط طفل بالولي"
      description={parent ? `اختر طفلاً لربطه بالولي ${fullName(parent)}` : ""}
      size="md"
    >
      <div className="space-y-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث باسم الطفل"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        {loading ? (
          <div className="space-y-2 text-sm text-slate-500">
            جاري البحث عن الأطفال…
          </div>
        ) : query.trim().length < 2 ? (
          <div className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-500">
            اكتب حرفين على الأقل لبدء البحث.
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-500">
            لم يتم العثور على أطفال مطابقين.
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((child) => {
              const alreadyLinked = child.parent_user_id && child.parent_user_id !== parent?.id;
              const alreadyWithParent = child.parent_user_id === parent?.id;
              return (
                <div
                  key={child.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium text-slate-900">{`${child.prenom || ""} ${child.nom || ""}`.trim()}</div>
                    <div className="text-xs text-slate-500">{child.date_naissance || "—"}</div>
                    {alreadyLinked && (
                      <div className="text-xs text-rose-600">مرتبط بولي آخر</div>
                    )}
                    {alreadyWithParent && (
                      <div className="text-xs text-emerald-600">مرتبط بالفعل بهذا الولي</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onLink(child.id)}
                    disabled={alreadyLinked || alreadyWithParent || linking}
                    className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    ربط
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
          >
            إغلاق
          </button>
        </div>
      </div>
    </Modal>
  );
}
