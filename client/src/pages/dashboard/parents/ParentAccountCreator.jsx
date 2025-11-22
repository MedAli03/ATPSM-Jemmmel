import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createParentAccount,
  getParentsFiche,
} from "../../../api/enfants";
import { useChildrenPage } from "../../../hooks/useChildrenPage";
import { useToast } from "../../../components/common/ToastProvider";

const PAGE_SIZES = [10, 20, 50];

export default function ParentAccountCreator() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedChild, setSelectedChild] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const toast = useToast();

  const childrenQuery = useChildrenPage({
    page,
    pageSize,
    q: search,
    parent_user_id: null, // rely on backend filter to only return children without a linked parent
  });

  const selectedFicheQuery = useQuery({
    queryKey: ["parents-fiche", selectedChild?.id],
    queryFn: () => getParentsFiche(selectedChild.id),
    enabled: Boolean(selectedChild?.id),
  });

  const mutation = useMutation({
    mutationFn: ({ enfantId, email, mot_de_passe }) =>
      createParentAccount(enfantId, { email, mot_de_passe }),
    onSuccess: () => {
      toast?.("تم إنشاء حساب الولي بنجاح");
      setSelectedChild(null);
      setPassword("");
      setConfirmPassword("");
      childrenQuery.refetch();
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message || err?.message || "تعذّر إنشاء الحساب";
      toast?.(msg, "error");
    },
  });

  const rows = childrenQuery.rows ?? [];
  const totalPages = childrenQuery.totalPages ?? 1;

  const preferredEmail = useMemo(() => {
    const fiche = selectedFicheQuery.data;
    if (!fiche) return "";
    return fiche.mere_email || fiche.pere_email || "";
  }, [selectedFicheQuery.data]);

  useEffect(() => {
    // Prefill email from fiche when available; allow manual override if missing.
    setEmail(preferredEmail || "");
  }, [preferredEmail, selectedChild?.id]);

  const parentNames = useMemo(() => {
    const fiche = selectedFicheQuery.data;
    if (!fiche) return "";
    const mere = `${fiche.mere_prenom || ""} ${fiche.mere_nom || ""}`.trim();
    const pere = `${fiche.pere_prenom || ""} ${fiche.pere_nom || ""}`.trim();
    return [mere, pere].filter(Boolean).join(" / ");
  }, [selectedFicheQuery.data]);

  const passwordMismatch = password && confirmPassword && password !== confirmPassword;
  const emailMissing = !email?.trim();
  const canSubmit =
    selectedChild &&
    !emailMissing &&
    password.length >= 8 &&
    !passwordMismatch &&
    !mutation.isLoading;

  return (
    <div className="space-y-4" dir="rtl">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">حسابات الأولياء</h1>
          <p className="text-sm text-gray-600">
            إنشاء حساب ولي انطلاقًا من ملف الطفل (parents_fiche) بإدخال كلمة مرور فقط.
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-blue-700">
              الأطفال بدون حساب ولي فقط
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
              POST /enfants/:id/create-parent-account
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 border">
            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21l-4.35-4.35M11 18a7 7 0 110-14 7 7 0 010 14z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <input
              className="bg-transparent outline-none pr-2 w-64 text-sm"
              placeholder="ابحث عن طفل..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="px-3 py-2 rounded-xl border bg-white text-sm"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n} / صفحة
              </option>
            ))}
          </select>

          <button
            onClick={() => childrenQuery.refetch()}
            className="px-3 py-2 rounded-xl border text-sm hover:bg-gray-50"
          >
            تحديث
          </button>
        </div>
      </header>

      <section className="bg-white border rounded-2xl shadow-sm">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b text-xs uppercase tracking-wide text-gray-500">
          <div className="col-span-1">#</div>
          <div className="col-span-4">الطفل</div>
          <div className="col-span-3">الأولياء</div>
          <div className="col-span-2">الحساب</div>
          <div className="col-span-2 text-left">إجراء</div>
        </div>

        {childrenQuery.isLoading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ) : childrenQuery.isError ? (
          <div className="p-6 text-red-600">
            تعذّر تحميل الأطفال.
            <button
              onClick={() => childrenQuery.refetch()}
              className="mr-2 text-blue-600"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            لا يوجد أطفال بدون حساب ولي.
          </div>
        ) : (
          <ul className="divide-y">
            {rows.map((child) => (
              <li
                key={child.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 text-sm text-gray-700 items-center hover:bg-slate-50 transition-colors"
              >
                <div className="col-span-1 font-semibold text-gray-900 flex items-center gap-1">
                  <span className="text-xs text-gray-400">ID</span>
                  {child.id}
                </div>
                <div className="col-span-4">
                  <div className="font-semibold text-gray-900">{formatChildName(child)}</div>
                  <div className="text-xs text-gray-500">
                    {child.date_naissance
                      ? new Date(child.date_naissance).toLocaleDateString("ar-TN", {
                          dateStyle: "medium",
                        })
                      : "—"}
                  </div>
                </div>
                <div className="col-span-3 text-gray-700">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                    parents_fiche
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>
                <div className="col-span-2 text-gray-700">
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[11px] text-amber-700">
                    غير مرتبط
                  </span>
                </div>
                <div className="col-span-2 text-left">
                  <button
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                    onClick={() => setSelectedChild(child)}
                  >
                    إنشاء حساب ولي
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
          <div className="text-gray-600">
            الصفحة <b>{page}</b> من <b>{totalPages}</b>
            {childrenQuery.isFetching && !childrenQuery.isLoading && (
              <span className="mr-2 text-gray-400">(تحديث...)</span>
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

      {selectedChild ? (
        <Dialog onClose={() => setSelectedChild(null)}>
          <div className="space-y-4">
            <header>
              <h2 className="text-xl font-bold text-gray-900">
                إنشاء حساب ولي للطفل {formatChildName(selectedChild)}
              </h2>
              <p className="text-sm text-gray-600">
                يمكن تعديل البريد الإلكتروني إذا لم يكن موجودًا في fiche parents.
              </p>
            </header>

            {selectedFicheQuery.isLoading ? (
              <p className="text-gray-600">جاري تحميل بيانات الأولياء…</p>
            ) : selectedFicheQuery.isError ? (
              <p className="text-rose-600 text-sm">
                تعذّر تحميل fiche الأولياء. تأكد من استكمالها قبل إنشاء الحساب.
              </p>
            ) : !selectedFicheQuery.data ? (
              <p className="text-amber-600 text-sm">
                لا توجد fiche للأولياء. يرجى إضافتها أولًا.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border bg-slate-50 px-3 py-2 flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-900 font-semibold">الأولياء</p>
                    <p className="text-xs text-gray-500">{parentNames || "—"}</p>
                  </div>
                  <div className="text-[11px] text-gray-500">parents_fiche</div>
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-sm text-gray-700">البريد الإلكتروني</span>
                  <input
                    type="email"
                    className={`px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${
                      emailMissing ? "border-amber-400 bg-amber-50" : ""
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="أدخل بريدًا إلكترونيًا للأولياء"
                  />
                  {emailMissing && (
                    <span className="text-xs text-amber-600">
                      لا يوجد بريد مسجل في fiche؛ الرجاء إدخاله يدويًا.
                    </span>
                  )}
                </label>
                <InfoRow
                  label="رقم الهاتف"
                  value={
                    selectedFicheQuery.data.mere_tel_portable ||
                    selectedFicheQuery.data.pere_tel_portable ||
                    "—"
                  }
                />
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-700">كلمة المرور</span>
                <input
                  type="password"
                  className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة مرور لا تقل عن 8 أحرف"
                />
                <span className="text-[11px] text-gray-500">
                  يجب أن تكون كلمة المرور 8 أحرف على الأقل.
                </span>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-700">تأكيد كلمة المرور</span>
                <input
                  type="password"
                  className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                />
              </label>
            </div>
            {passwordMismatch && (
              <p className="text-rose-600 text-sm">كلمتا المرور غير متطابقتين.</p>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-gray-500 space-y-1">
                <p>يتم إنشاء الحساب عبر POST /enfants/:id/create-parent-account.</p>
                <p>يتم ربط الحساب بالطفل مباشرة بعد نجاح الإنشاء.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
                  onClick={() => setSelectedChild(null)}
                  disabled={mutation.isLoading}
                >
                  إلغاء
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                  onClick={() =>
                    mutation.mutate({
                      enfantId: selectedChild.id,
                      email: email.trim(),
                      mot_de_passe: password,
                    })
                  }
                  disabled={!canSubmit}
                >
                  {mutation.isLoading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}

function Dialog({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 grid place-items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 text-gray-500 hover:text-gray-700"
          aria-label="إغلاق"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function formatChildName(child) {
  const nom = child?.nom || "";
  const prenom = child?.prenom || "";
  const full = `${prenom} ${nom}`.trim();
  return full || "—";
}

// Notes for future maintainers:
// - Backend endpoint used: POST /api/enfants/:enfantId/create-parent-account
//   Payload: { email, mot_de_passe }
// - Data sources: enfants list filtered by parent_user_id=null, fiche parents via
//   GET /api/enfants/:id/parents-fiche.
// - Possible extensions: enforce قوة كلمة المرور, السماح باختيار البريد بين الأب والأم،
//   أو إرسال إشعار بريد إلكتروني بعد الإنشاء.
