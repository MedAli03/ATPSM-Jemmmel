import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  changeParentPassword,
  getParent,
  listParentChildren,
  updateParent,
} from "../../../api/parents";
import Modal from "../../../components/common/Modal";
import { useToast } from "../../../components/common/ToastProvider";
import { useParentsPage } from "../../../hooks/useParentsPage";

const ACTIVE_FILTERS = [
  { value: "", label: "كل الحالات" },
  { value: "true", label: "نشط" },
  { value: "false", label: "غير نشط" },
];

export default function AllParents() {
  const toast = useToast();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [isActive, setIsActive] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [detailsId, setDetailsId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [passwordId, setPasswordId] = useState(null);
  const [childrenCounts, setChildrenCounts] = useState({});
  const [hoveredId, setHoveredId] = useState(null);

  const params = useMemo(
    () => ({ page, pageSize, q, is_active: isActive }),
    [page, pageSize, q, isActive]
  );

  const query = useParentsPage(params);
  const data = query.data ?? {};
  const rows = data.rows ?? [];
  const count = data.count ?? 0;
  const pageSizeResolved = data.pageSize ?? pageSize;
  const totalPages = Math.max(1, Math.ceil(count / (pageSizeResolved || 1)));
  const infoId = detailsId || editId || passwordId;

  useEffect(() => {
    setPage(1);
  }, [q, isActive, pageSize]);

  const parentInfo = useQuery({
    queryKey: ["parent", infoId],
    queryFn: () => getParent(infoId),
    enabled: !!infoId,
  });

  const parentChildren = useQuery({
    queryKey: ["parent", detailsId, "children"],
    queryFn: () => listParentChildren(detailsId, { limit: 100 }),
    enabled: !!detailsId,
  });

  useEffect(() => {
    if (detailsId && parentChildren.data) {
      setChildrenCounts((prev) => ({
        ...prev,
        [detailsId]:
          parentChildren.data.count ?? parentChildren.data.rows?.length ?? 0,
      }));
    }
  }, [detailsId, parentChildren.data]);

  const updateMu = useMutation({
    mutationFn: ({ id, payload }) => updateParent(id, payload),
    onSuccess: () => {
      toast?.("تم حفظ التعديلات ✅", "success");
      qc.invalidateQueries({ queryKey: ["parents"] });
      qc.invalidateQueries({ queryKey: ["parent", infoId] });
      setEditId(null);
    },
    onError: (e) => {
      const msg = e?.response?.data?.message || "تعذر حفظ البيانات ❌";
      toast?.(msg, "error");
    },
  });

  const changePasswordMu = useMutation({
    mutationFn: ({ id, mot_de_passe }) => changeParentPassword(id, mot_de_passe),
    onSuccess: () => {
      toast?.("تم تغيير كلمة السر ✅", "success");
      setPasswordId(null);
    },
    onError: (e) => {
      const msg = e?.response?.data?.message || "تعذر تغيير كلمة السر ❌";
      toast?.(msg, "error");
    },
  });

  return (
    <div className="space-y-4" dir="rtl">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الأولياء</h1>
          <p className="text-sm text-gray-500">
            إدارة حسابات الأولياء مع إمكانية البحث والتصفية حسب الحالة.
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
              إجمالي: {count}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-sky-700">
              حجم الصفحة الحالي: {pageSizeResolved}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 border">
            <svg
              className="w-5 h-5 text-gray-500"
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
              className="bg-transparent outline-none pr-2 w-64 text-sm"
              placeholder="ابحث بالاسم أو البريد أو الهاتف…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2 rounded-xl border bg-white text-sm"
            value={isActive}
            onChange={(e) => setIsActive(e.target.value)}
          >
            {ACTIVE_FILTERS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            className="px-3 py-2 rounded-xl border bg-white text-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / صفحة
              </option>
            ))}
          </select>

          <button
            onClick={() => query.refetch()}
            className="px-3 py-2 rounded-xl border text-sm hover:bg-gray-50"
          >
            تحديث
          </button>
        </div>
      </header>

      <section className="bg-white border rounded-2xl shadow-sm">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b text-xs uppercase tracking-wide text-gray-500">
            <div className="col-span-1">#</div>
            <div className="col-span-3">الاسم الكامل</div>
            <div className="col-span-2">البريد الإلكتروني</div>
            <div className="col-span-2">الهاتف</div>
            <div className="col-span-2">الأطفال</div>
            <div className="col-span-2 text-left">خيارات</div>
          </div>

        {query.isLoading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ) : query.isError ? (
          <div className="p-6 text-red-600">
            تعذّر تحميل قائمة الأولياء.
            <button
              onClick={() => query.refetch()}
              className="mr-2 text-blue-600"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-gray-500">لا توجد نتائج مطابقة</div>
        ) : (
          <ul className="divide-y">
            {rows.map((parent) => (
              <li
                key={parent.id}
                className={`grid grid-cols-12 gap-2 px-4 py-3 text-sm transition-colors duration-150 ${
                  hoveredId === parent.id ? "bg-slate-50" : "bg-white"
                }`}
                onMouseEnter={() => setHoveredId(parent.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="col-span-1 font-semibold text-gray-900 flex items-center gap-1">
                  <span className="text-xs text-gray-400">ID</span>
                  {parent.id}
                </div>
                <div className="col-span-3 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {formatFullName(parent)}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{parent.adresse || "—"}</div>
                </div>
                <div className="col-span-2 truncate text-gray-700 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-1 text-[11px] text-sky-700">
                    بريد
                  </span>
                  <span className="truncate">{parent.email || "—"}</span>
                </div>
                <div className="col-span-2 text-gray-700 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[11px] text-amber-700">
                    هاتف
                  </span>
                  <span>{parent.telephone || "—"}</span>
                </div>
                <div className="col-span-2">
                  <ChildrenCountBadge count={childrenCounts[parent.id]} />
                  {parentChildren.isFetching && detailsId === parent.id ? (
                    <p className="text-[11px] text-gray-400 mt-1">تحديث...</p>
                  ) : null}
                </div>
                <div className="col-span-2 flex flex-wrap items-center gap-2 justify-end text-xs">
                  <ActionButton onClick={() => setDetailsId(parent.id)}>
                    عرض التفاصيل
                  </ActionButton>
                  <ActionButton onClick={() => setEditId(parent.id)} color="slate">
                    تعديل البيانات
                  </ActionButton>
                  <ActionButton onClick={() => setPasswordId(parent.id)} color="rose">
                    تغيير كلمة السر
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
          <div className="text-gray-600">
            الصفحة <b>{page}</b> من <b>{totalPages}</b>
            {query.isFetching && !query.isLoading && (
              <span className="ml-2 text-gray-400">(تحديث…)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              السابق
            </button>
            <button
              className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              التالي
            </button>
          </div>
        </div>
      </section>

      <ParentDetailsDialog
        open={!!detailsId}
        onClose={() => setDetailsId(null)}
        parent={parentInfo.data}
        isLoading={parentInfo.isLoading}
        isError={parentInfo.isError}
        childrenQuery={parentChildren}
      />

      <EditParentDialog
        open={!!editId}
        onClose={() => setEditId(null)}
        parent={parentInfo.data}
        isLoading={parentInfo.isLoading}
        onSave={(values) => updateMu.mutate({ id: editId, payload: values })}
        isSaving={updateMu.isPending}
      />

      <ChangePasswordDialog
        open={!!passwordId}
        onClose={() => setPasswordId(null)}
        parent={parentInfo.data}
        isLoading={parentInfo.isLoading}
        onSave={(mot_de_passe) =>
          changePasswordMu.mutate({ id: passwordId, mot_de_passe })
        }
        isSaving={changePasswordMu.isPending}
      />
    </div>
  );
}

function formatFullName(parent) {
  const nom = parent?.nom || "";
  const prenom = parent?.prenom || "";
  const full = `${prenom} ${nom}`.trim();
  return full || "—";
}

function ChildrenCountBadge({ count }) {
  if (typeof count !== "number") {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
        —
      </span>
    );
  }
  return count > 0 ? (
    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
      {count} طفل
    </span>
  ) : (
    <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700">
      لا أطفال
    </span>
  );
}

function ActionButton({ children, onClick, color = "blue" }) {
  const palette = {
    blue: "border-blue-100 text-blue-700 hover:bg-blue-50",
    slate: "border-slate-200 text-slate-700 hover:bg-slate-50",
    rose: "border-rose-100 text-rose-700 hover:bg-rose-50",
  };

  return (
    <button
      className={`px-3 py-1.5 rounded-lg border transition ${palette[color]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ParentDetailsDialog({
  open,
  onClose,
  parent,
  isLoading,
  isError,
  childrenQuery,
}) {
  const children = childrenQuery?.data?.rows ?? [];
  const content = (() => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded" />
          ))}
        </div>
      );
    }
    if (isError || !parent) {
      return <p className="text-rose-600 text-sm">تعذر تحميل بيانات الولي.</p>;
    }
    return (
      <div className="space-y-4 text-sm text-gray-800">
        <div className="flex flex-col gap-3 rounded-xl border bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-bold">
              {parent.prenom?.[0] || parent.nom?.[0] || "و"}
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{formatFullName(parent)}</p>
              <p className="text-xs text-gray-500">معرّف: {parent.id}</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[11px] text-emerald-700">
              حساب ولي
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="البريد الإلكتروني" value={parent.email || "—"} />
            <DetailField label="الهاتف" value={parent.telephone || "—"} />
            <DetailField label="العنوان" value={parent.adresse || "—"} />
            <DetailField label="تاريخ الإنشاء" value={parent.createdAt?.split("T")[0] || "—"} />
          </div>
        </div>

        <div className="rounded-xl border px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-semibold text-gray-900">الأطفال المرتبطون</h4>
            <span className="text-[11px] text-gray-500">
              GET /parents/:id/enfants
            </span>
          </div>
          {childrenQuery?.isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-3 bg-gray-100 rounded" />
              ))}
            </div>
          ) : children.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-700">
              لا يوجد أطفال مرتبطون.
            </div>
          ) : (
            <ul className="space-y-2">
              {children.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border px-3 py-2 bg-white"
                >
                  <div>
                    <p className="font-medium text-gray-900">{formatChildName(c)}</p>
                    <p className="text-[11px] text-gray-500">معرّف الطفل: {c.id}</p>
                  </div>
                  <span className="text-xs text-gray-500">{c.date_naissance || "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-xs text-gray-500">
          • GET /parents/:id لعرض بيانات الحساب. • GET /parents/:id/enfants لعرض الأطفال المرتبطين.
        </p>
      </div>
    );
  })();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تفاصيل حساب الولي"
      description="معلومات الحساب والأطفال المرتبطين (قراءة فقط)"
      size="lg"
    >
      {content}
    </Modal>
  );
}

function EditParentDialog({ open, onClose, parent, isLoading, onSave, isSaving }) {
  const schema = yup.object({
    nom: yup.string().max(100).required("مطلوب"),
    prenom: yup.string().max(100).required("مطلوب"),
    email: yup.string().email("بريد غير صالح").required("مطلوب"),
    telephone: yup.string().max(50).nullable(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nom: parent?.nom || "",
      prenom: parent?.prenom || "",
      email: parent?.email || "",
      telephone: parent?.telephone || "",
    },
  });

  useEffect(() => {
    reset({
      nom: parent?.nom || "",
      prenom: parent?.prenom || "",
      email: parent?.email || "",
      telephone: parent?.telephone || "",
    });
  }, [parent, reset]);

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-xl border hover:bg-gray-50 disabled:opacity-50"
        disabled={isSaving}
      >
        إلغاء
      </button>
      <button
        type="submit"
        form="edit-parent-form"
        className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50"
        disabled={isSaving}
      >
        {isSaving ? "جارٍ الحفظ…" : "حفظ"}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تعديل بيانات الولي"
      description="تحديث البريد الإلكتروني أو بيانات الاتصال عبر PUT /parents/:id"
      size="md"
      footer={footer}
    >
      {isLoading && !parent ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded" />
          ))}
        </div>
      ) : (
        <form
          id="edit-parent-form"
          className="space-y-3"
          onSubmit={handleSubmit((values) => onSave(values))}
        >
          <Field label="الاسم" error={errors.nom?.message}>
            <input
              className="w-full rounded-xl border px-3 py-2"
              {...register("nom")}
              placeholder="اسم العائلة"
            />
          </Field>
          <Field label="اللقب" error={errors.prenom?.message}>
            <input
              className="w-full rounded-xl border px-3 py-2"
              {...register("prenom")}
              placeholder="الاسم الشخصي"
            />
          </Field>
          <Field label="البريد الإلكتروني" error={errors.email?.message}>
            <input
              className="w-full rounded-xl border px-3 py-2"
              {...register("email")}
              placeholder="email@example.com"
            />
          </Field>
          <Field label="الهاتف" error={errors.telephone?.message}>
            <input
              className="w-full rounded-xl border px-3 py-2"
              {...register("telephone")}
              placeholder="رقم الهاتف"
            />
          </Field>
        </form>
      )}
    </Modal>
  );
}

function ChangePasswordDialog({
  open,
  onClose,
  parent,
  isLoading,
  onSave,
  isSaving,
}) {
  const schema = yup.object({
    mot_de_passe: yup.string().min(8, "8 أحرف على الأقل").required("مطلوب"),
    confirm: yup
      .string()
      .oneOf([yup.ref("mot_de_passe")], "يجب أن تتطابق كلمتا السر")
      .required("مطلوب"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues: { mot_de_passe: "", confirm: "" } });

  useEffect(() => {
    if (open) {
      reset({ mot_de_passe: "", confirm: "" });
    }
  }, [open, reset]);

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-xl border hover:bg-gray-50 disabled:opacity-50"
        disabled={isSaving}
      >
        إلغاء
      </button>
      <button
        type="submit"
        form="change-parent-password"
        className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50"
        disabled={isSaving}
      >
        {isSaving ? "جارٍ التحديث…" : "حفظ كلمة السر"}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تغيير كلمة سر الولي"
      description="يتم إرسال كلمة السر الجديدة عبر PATCH /parents/:id/change-password"
      size="sm"
      footer={footer}
    >
      {isLoading && !parent ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded" />
          ))}
        </div>
      ) : (
        <form
          id="change-parent-password"
          className="space-y-3"
          onSubmit={handleSubmit((values) => onSave(values.mot_de_passe))}
        >
          <Field label="كلمة السر الجديدة" error={errors.mot_de_passe?.message}>
            <input
              type="password"
              className="w-full rounded-xl border px-3 py-2"
              {...register("mot_de_passe")}
              placeholder="••••••••"
            />
          </Field>
          <Field label="تأكيد كلمة السر" error={errors.confirm?.message}>
            <input
              type="password"
              className="w-full rounded-xl border px-3 py-2"
              {...register("confirm")}
              placeholder="••••••••"
            />
          </Field>
        </form>
      )}
    </Modal>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block space-y-1 text-sm text-gray-700">
      <span>{label}</span>
      {children}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </label>
  );
}

function formatChildName(c) {
  const full = `${c?.prenom || ""} ${c?.nom || ""}`.trim();
  return full || `طفل ${c?.id ?? ""}`;
}
