import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listAnnees,
  createAnnee,
  updateAnnee,
  activateAnnee,
  archiveAnnee,
} from "../../../api/annees";
import Modal from "../../../components/common/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { useToast } from "../../../components/common/ToastProvider";

// Lifecycle reminder: PLANIFIEE -> (activate) ACTIVE -> (archive) ARCHIVEE.
// Activation uses POST /annees/:id/activate, archivage via POST /annees/:id/archive.
// Creation/édition uses POST /annees and PUT /annees/:id with { libelle, date_debut, date_fin }.

const STATUS_META = {
  ACTIVE: { label: "نشطة", className: "bg-emerald-100 text-emerald-700" },
  PLANIFIEE: { label: "مجدولة", className: "bg-sky-100 text-sky-700" },
  ARCHIVEE: { label: "مؤرشفة", className: "bg-gray-200 text-gray-800" },
};

function YearBadge({ statut = "PLANIFIEE", estActive }) {
  const meta = STATUS_META[statut] || STATUS_META.PLANIFIEE;
  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}
      >
        {meta.label}
      </span>
      {estActive ? (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
          السنة النشطة حالياً
        </span>
      ) : null}
    </div>
  );
}

function YearForm({ values, onChange }) {
  return (
    <div className="space-y-3" dir="rtl">
      <div>
        <label className="block text-sm font-semibold text-gray-700">الترقيم (مثال: 2024-2025)</label>
        <input
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          value={values.libelle}
          onChange={(e) => onChange({ ...values, libelle: e.target.value })}
          placeholder="YYYY-YYYY"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-700">تاريخ البداية</label>
          <input
            type="date"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            value={values.date_debut}
            onChange={(e) => onChange({ ...values, date_debut: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">تاريخ النهاية</label>
          <input
            type="date"
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            value={values.date_fin}
            onChange={(e) => onChange({ ...values, date_fin: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export default function YearsManagement() {
  const toast = useToast();
  const qc = useQueryClient();
  const [statutFilter, setStatutFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState({
    libelle: "",
    date_debut: "",
    date_fin: "",
  });
  const [editing, setEditing] = useState(null);
  const [confirmActivate, setConfirmActivate] = useState(null);
  const [confirmArchive, setConfirmArchive] = useState(null);

  const anneesQuery = useQuery({
    queryKey: ["annees", { statut: statutFilter }],
    queryFn: () =>
      listAnnees(statutFilter === "ALL" ? {} : { statut: statutFilter }),
  });

  const annees = useMemo(() => {
    const raw = anneesQuery.data;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.items)) return raw.items;
    return [];
  }, [anneesQuery.data]);

  const resetForm = () => {
    setFormValues({ libelle: "", date_debut: "", date_fin: "" });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (year) => {
    setEditing(year);
    setFormValues({
      libelle: year.libelle || "",
      date_debut: year.date_debut || "",
      date_fin: year.date_fin || "",
    });
    setShowForm(true);
  };

  const invalidateYears = () => {
    qc.invalidateQueries({ queryKey: ["annees"] });
  };

  const createMut = useMutation({
    mutationFn: createAnnee,
    onSuccess: () => {
      toast?.("تم إنشاء السنة الدراسية بنجاح ✅", "success");
      invalidateYears();
      setShowForm(false);
    },
    onError: (e) =>
      toast?.(
        e?.response?.data?.message || "تعذر إنشاء السنة الدراسية ❌",
        "error"
      ),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateAnnee(id, payload),
    onSuccess: () => {
      toast?.("تم تحديث بيانات السنة ✅", "success");
      invalidateYears();
      setShowForm(false);
      setEditing(null);
    },
    onError: (e) =>
      toast?.(e?.response?.data?.message || "تعذر حفظ التعديلات ❌", "error"),
  });

  const activateMut = useMutation({
    mutationFn: (id) => activateAnnee(id),
    onSuccess: () => {
      toast?.("تم ضبط السنة النشطة ✅", "success");
      invalidateYears();
      setConfirmActivate(null);
    },
    onError: (e) =>
      toast?.(e?.response?.data?.message || "تعذر التفعيل ❌", "error"),
  });

  const archiveMut = useMutation({
    mutationFn: (id) => archiveAnnee(id),
    onSuccess: () => {
      toast?.("تمت أرشفة السنة ✅", "success");
      invalidateYears();
      setConfirmArchive(null);
    },
    onError: (e) =>
      toast?.(e?.response?.data?.message || "تعذر الأرشفة ❌", "error"),
  });

  const handleSubmitForm = () => {
    if (!formValues.libelle || !formValues.date_debut || !formValues.date_fin) {
      toast?.("المرجو تعبئة كل الحقول", "error");
      return;
    }
    if (new Date(formValues.date_debut) >= new Date(formValues.date_fin)) {
      toast?.("تاريخ البداية يجب أن يكون قبل تاريخ النهاية", "error");
      return;
    }
    if (editing) {
      updateMut.mutate({ id: editing.id, payload: formValues });
    } else {
      createMut.mutate(formValues);
    }
  };

  const isLoading = anneesQuery.isLoading;
  const hasError = anneesQuery.isError;

  const stats = useMemo(() => {
    const total = annees.length;
    const active = annees.filter((a) => a.statut === "ACTIVE").length;
    const archived = annees.filter((a) => a.statut === "ARCHIVEE").length;
    return { total, active, archived };
  }, [annees]);

  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-indigo-700 via-indigo-600 to-indigo-500 text-white shadow-xl">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6)_0,_rgba(255,255,255,0)_60%)]" />
        <div className="relative z-10 p-6 md:p-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-indigo-100">لوحة الرئيس</p>
            <h1 className="text-3xl font-bold">إدارة السنوات الدراسية</h1>
            <p className="max-w-2xl text-indigo-100/80 text-sm md:text-base">
              تحكّم في إنشاء السنوات، تفعيل السنة الجارية، وأرشفة السنوات المنتهية مع احترام دورة الحياة الأكاديمية.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-indigo-50/90">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                إجمالي: {stats.total}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                نشطة: {stats.active}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                مؤرشفة: {stats.archived}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-indigo-700 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="text-xl">＋</span>
              <span className="font-semibold">إنشاء سنة جديدة</span>
            </button>
            <p className="text-xs text-indigo-100/80">
              إمكانية التفعيل/الأرشفة متاحة من الجدول أدناه.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-lg font-bold">
              📅
            </div>
            <div>
              <h2 className="text-lg font-bold">السنوات المسجلة</h2>
              <p className="text-sm text-gray-500">تصفية حسب الحالة أو إدارة التفاصيل بسرعة.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["ALL", "ACTIVE", "PLANIFIEE", "ARCHIVEE"].map((key) => (
              <button
                key={key}
                onClick={() => setStatutFilter(key)}
                className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                  statutFilter === key
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {key === "ALL"
                  ? "الكل"
                  : STATUS_META[key]?.label || key}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto px-4 py-4 md:px-6">
          {isLoading ? (
            <p className="py-8 text-center text-gray-500">جارٍ تحميل السنوات...</p>
          ) : hasError ? (
            <p className="py-8 text-center text-rose-600">تعذر جلب البيانات.</p>
          ) : annees.length === 0 ? (
            <p className="py-8 text-center text-gray-500">لا توجد سنوات مسجلة حالياً.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-right">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    الترقيم
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    البداية
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    النهاية
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    الحالة
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-sm">
                {annees.map((year) => (
                  <tr key={year.id} className="hover:bg-indigo-50/40 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900">{year.libelle}</td>
                    <td className="px-4 py-3 text-gray-700">{year.date_debut}</td>
                    <td className="px-4 py-3 text-gray-700">{year.date_fin}</td>
                    <td className="px-4 py-3">
                      <YearBadge statut={year.statut} estActive={year.est_active} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                        <button
                          onClick={() => openEdit(year)}
                          className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          disabled={year.statut === "ARCHIVEE"}
                        >
                          تعديل
                        </button>
                        {!year.est_active && year.statut !== "ARCHIVEE" ? (
                          <button
                            onClick={() => setConfirmActivate(year)}
                            className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
                            disabled={activateMut.isLoading}
                          >
                            تعيين كنشطة
                          </button>
                        ) : null}
                        {year.statut !== "ARCHIVEE" ? (
                          <button
                            onClick={() => setConfirmArchive(year)}
                            className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            disabled={archiveMut.isLoading}
                          >
                            أرشفة
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        title={editing ? "تعديل سنة دراسية" : "إنشاء سنة دراسية"}
        description="يتم حفظ التواريخ وتنسيق libellé وفق نموذج YYYY-YYYY."
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="rounded-lg border px-4 py-2 text-sm"
              disabled={createMut.isLoading || updateMut.isLoading}
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmitForm}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
              disabled={createMut.isLoading || updateMut.isLoading}
            >
              {createMut.isLoading || updateMut.isLoading
                ? "جارٍ الحفظ..."
                : editing
                ? "حفظ التعديلات"
                : "إنشاء"}
            </button>
          </div>
        }
      >
        <YearForm values={formValues} onChange={setFormValues} />
      </Modal>

      <ConfirmDialog
        open={!!confirmActivate}
        title="تعيين السنة كنشطة"
        description={`سيتم ضبط ${confirmActivate?.libelle || "السنة المختارة"} كسنة نشطة. سيتم إلغاء تنشيط السنوات الأخرى (ما لم تكن مؤرشفة).`}
        loading={activateMut.isLoading}
        onClose={() => setConfirmActivate(null)}
        onConfirm={() => confirmActivate && activateMut.mutate(confirmActivate.id)}
        confirmText="تفعيل"
      />

      <ConfirmDialog
        open={!!confirmArchive}
        title="تأكيد الأرشفة"
        description={`سيتم أرشفة ${confirmArchive?.libelle || "السنة"} وتعطيل أي تنشيط عليها.`}
        loading={archiveMut.isLoading}
        onClose={() => setConfirmArchive(null)}
        onConfirm={() => confirmArchive && archiveMut.mutate(confirmArchive.id)}
        confirmText="أرشفة"
      />
    </div>
  );
}
