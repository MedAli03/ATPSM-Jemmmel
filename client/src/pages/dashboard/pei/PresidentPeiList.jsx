import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { closePei, getPei, validatePei } from "../../../api/peis";
import Modal from "../../../components/common/Modal";
import { useToast } from "../../../components/common/ToastProvider";
import { usePeisPage } from "../../../hooks/usePeisPage";

const STATUS_TABS = [
  { value: "EN_ATTENTE_VALIDATION", label: "في انتظار المصادقة" },
  { value: "VALIDE", label: "مصدّق" },
  { value: "CLOTURE", label: "مؤرشف" },
  { value: "", label: "جميع الحالات" },
];

const STATUS_META = {
  EN_ATTENTE_VALIDATION: {
    label: "في الانتظار",
    className: "bg-amber-50 text-amber-700 border border-amber-100",
  },
  VALIDE: {
    label: "مصدّق",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  },
  CLOTURE: {
    label: "مؤرشف",
    className: "bg-slate-100 text-slate-700 border border-slate-200",
  },
  REFUSE: {
    label: "مرفوض",
    className: "bg-rose-50 text-rose-700 border border-rose-100",
  },
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatFullName(user) {
  if (!user) return "—";
  return [user.prenom, user.nom].filter(Boolean).join(" ") || user.email || "—";
}

function PeiStatusBadge({ statut }) {
  const meta = STATUS_META[statut] || {
    label: statut || "غير معروف",
    className: "bg-gray-100 text-gray-700 border border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function DetailModal({ open, onClose, peiId }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pei", peiId],
    queryFn: () => getPei(peiId),
    enabled: !!peiId,
  });

  const pei = data || {};
  const child = pei.enfant;
  const educ = pei.educateur;
  const validator = pei.validateur;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="تفاصيل مشروع PEI"
      description="عرض سريع للأهداف، الحالة، والجهات المرتبطة"
    >
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      ) : isError ? (
        <div className="text-red-600 text-sm">
          تعذّر تحميل التفاصيل.
          <button onClick={() => refetch()} className="mr-2 text-blue-600">
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <div className="space-y-4" dir="rtl">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 rounded-xl p-3 border">
              <div className="text-[11px] text-gray-500">الطفل</div>
              <div className="font-semibold text-gray-900">
                {child ? `${child.prenom || ""} ${child.nom || ""}` : "—"}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border">
              <div className="text-[11px] text-gray-500">المربّي المسؤول</div>
              <div className="font-semibold text-gray-900">{formatFullName(educ)}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border">
              <div className="text-[11px] text-gray-500">الحالة الحالية</div>
              <div className="flex items-center gap-2">
                <PeiStatusBadge statut={pei.statut} />
                <span className="text-xs text-gray-500">آخر تحديث: {formatDate(pei.date_derniere_maj)}</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border">
              <div className="text-[11px] text-gray-500">تاريخ الإنشاء</div>
              <div className="font-semibold text-gray-900">{formatDate(pei.date_creation)}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border col-span-2">
              <div className="text-[11px] text-gray-500">تأكيد الرئيس</div>
              {pei.date_validation ? (
                <div className="flex flex-wrap items-center gap-2 text-sm text-emerald-700">
                  <span>تمت المصادقة في {formatDate(pei.date_validation)}</span>
                  <span className="text-gray-500">بواسطة</span>
                  <span className="font-semibold">{formatFullName(validator)}</span>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">لم يتم اعتماد المشروع بعد.</div>
              )}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">الأهداف</div>
              <span className="text-xs text-gray-500">المحتوى من حقل objectifs في PEI</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {pei.objectifs?.trim() ? pei.objectifs : "لا توجد أهداف مسجلة بعد."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 border rounded-xl bg-white shadow-sm">
              <div className="text-[11px] text-gray-500">الأنشطة</div>
              <div className="text-lg font-semibold text-gray-900">{pei.activites?.length ?? 0}</div>
            </div>
            <div className="p-3 border rounded-xl bg-white shadow-sm">
              <div className="text-[11px] text-gray-500">التقييمات</div>
              <div className="text-lg font-semibold text-gray-900">{pei.evaluations?.length ?? 0}</div>
            </div>
            <div className="p-3 border rounded-xl bg-white shadow-sm">
              <div className="text-[11px] text-gray-500">الملاحظات اليومية</div>
              <div className="text-lg font-semibold text-gray-900">{pei.notes?.length ?? 0}</div>
            </div>
          </div>

          <div className="text-[11px] text-gray-500">
            • GET /api/pei/:id يعيد الطفل، المربّي، الأنشطة، التقييمات، والملاحظات.
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function PresidentPeiList() {
  const toast = useToast();
  const qc = useQueryClient();
  const [status, setStatus] = useState("EN_ATTENTE_VALIDATION");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const params = useMemo(
    () => ({
      page,
      pageSize,
      ...(status ? { statut: status } : {}),
    }),
    [page, pageSize, status]
  );

  const query = usePeisPage(params);
  const data = query.data ?? {};
  const rows = data.rows ?? [];
  const count = data.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(count / (data.pageSize || pageSize)));

  const validateMu = useMutation({
    mutationFn: (id) => validatePei(id), // PATCH /api/pei/:id/validate
    onSuccess: () => {
      toast?.("تمت مصادقة المشروع بنجاح ✅", "success");
      qc.invalidateQueries({ queryKey: ["peis"] });
      setPendingAction(null);
      setDetailId(null);
    },
    onError: (e) => {
      const msg = e?.response?.data?.message || "تعذر المصادقة على PEI";
      toast?.(msg, "error");
    },
  });

  const archiveMu = useMutation({
    mutationFn: (id) => closePei(id), // POST /api/pei/:id/close
    onSuccess: () => {
      toast?.("تم أرشفة المشروع", "success");
      qc.invalidateQueries({ queryKey: ["peis"] });
      setPendingAction(null);
    },
    onError: (e) => {
      const msg = e?.response?.data?.message || "تعذر أرشفة المشروع";
      toast?.(msg, "error");
    },
  });

  return (
    <div className="space-y-4" dir="rtl">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مشاريع PEI</h1>
          <p className="text-sm text-gray-500">
            تتبع حالة المشاريع التعليمية الفردية، مع إمكانية المصادقة أو الأرشفة.
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
              إجمالي: {count}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-sky-700">
              حجم الصفحة: {data.pageSize || pageSize}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
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

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={`px-3 py-2 rounded-full text-sm border transition ${
              status === tab.value
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b text-[11px] uppercase tracking-wide text-gray-500">
          <div className="col-span-3">الطفل</div>
          <div className="col-span-3">المربّي</div>
          <div className="col-span-2">الحالة</div>
          <div className="col-span-2">آخر تحديث</div>
          <div className="col-span-2 text-left">الإجراءات</div>
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
          <div className="p-6 text-red-600 text-sm">
            تعذّر تحميل قائمة المشاريع.
            <button onClick={() => query.refetch()} className="mr-2 text-blue-600">
              إعادة المحاولة
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-gray-500">لا توجد مشاريع وفق التصفية الحالية.</div>
        ) : (
          <ul className="divide-y">
            {rows.map((pei) => (
              <li key={pei.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm hover:bg-slate-50 transition">
                <div className="col-span-3">
                  <div className="font-semibold text-gray-900 truncate">
                    {pei.enfant
                      ? `${pei.enfant.prenom || ""} ${pei.enfant.nom || ""}`
                      : "—"}
                  </div>
                  <div className="text-xs text-gray-500">ID: {pei.id}</div>
                </div>
                <div className="col-span-3">
                  <div className="font-semibold text-gray-900 truncate">{formatFullName(pei.educateur)}</div>
                  <div className="text-xs text-gray-500">{pei.educateur?.email || ""}</div>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <PeiStatusBadge statut={pei.statut} />
                  {pei.date_validation && (
                    <span className="text-[11px] text-emerald-700">
                      مُصادق {formatDate(pei.date_validation)}
                    </span>
                  )}
                </div>
                <div className="col-span-2 text-xs text-gray-600 flex flex-col">
                  <span>الإنشاء: {formatDate(pei.date_creation)}</span>
                  <span>آخر تعديل: {formatDate(pei.date_derniere_maj)}</span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setDetailId(pei.id)}
                    className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
                  >
                    التفاصيل
                  </button>
                  {pei.statut === "EN_ATTENTE_VALIDATION" ? (
                    <button
                      onClick={() => setPendingAction({ type: "validate", id: pei.id })}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                      disabled={validateMu.isLoading && pendingAction?.id === pei.id}
                    >
                      {validateMu.isLoading && pendingAction?.id === pei.id
                        ? "جارٍ المصادقة..."
                        : "مصادقة"}
                    </button>
                  ) : null}
                  {pei.statut === "VALIDE" ? (
                    <button
                      onClick={() => setPendingAction({ type: "archive", id: pei.id })}
                      className="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm hover:bg-slate-800"
                      disabled={archiveMu.isLoading && pendingAction?.id === pei.id}
                    >
                      {archiveMu.isLoading && pendingAction?.id === pei.id
                        ? "جارٍ الأرشفة..."
                        : "أرشفة"}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          صفحة {data.page || page} / {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={(data.page || page) <= 1}
          >
            السابق
          </button>
          <button
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={(data.page || page) >= totalPages}
          >
            التالي
          </button>
        </div>
      </div>

      <DetailModal open={!!detailId} onClose={() => setDetailId(null)} peiId={detailId} />

      <Modal
        open={!!pendingAction}
        onClose={() => setPendingAction(null)}
        size="sm"
        title={
          pendingAction?.type === "validate"
            ? "تأكيد المصادقة"
            : "تأكيد الأرشفة"
        }
        description={
          pendingAction?.type === "validate"
            ? "سيتم تغيير حالة المشروع إلى VALIDE وتسجيل هوية الرئيس والتاريخ."
            : "سيتم نقل المشروع إلى الأرشيف مع حالة CLOTURE."
        }
        footer={
          <div className="flex justify-between gap-2">
            <button
              className="px-3 py-2 rounded-lg border text-sm"
              onClick={() => setPendingAction(null)}
            >
              إلغاء
            </button>
            <button
              className="px-3 py-2 rounded-lg text-sm text-white"
              onClick={() =>
                pendingAction?.type === "validate"
                  ? validateMu.mutate(pendingAction.id)
                  : archiveMu.mutate(pendingAction?.id)
              }
              disabled={validateMu.isLoading || archiveMu.isLoading}
              style={{ backgroundColor: pendingAction?.type === "validate" ? "#2563eb" : "#0f172a" }}
            >
              {pendingAction?.type === "validate"
                ? validateMu.isLoading
                  ? "جارٍ المصادقة..."
                  : "تأكيد"
                : archiveMu.isLoading
                ? "جارٍ الأرشفة..."
                : "أرشفة"}
            </button>
          </div>
        }
      >
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            يستخدم الزر مسار {" "}
            <span className="font-mono text-xs">PATCH /api/pei/:id/validate</span> للمصادقة
            أو {" "}
            <span className="font-mono text-xs">POST /api/pei/:id/close</span> للأرشفة.
          </p>
          <p className="text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            سيتم تحديث القائمة تلقائيًا بعد نجاح العملية.
          </p>
        </div>
      </Modal>
    </div>
  );
}
