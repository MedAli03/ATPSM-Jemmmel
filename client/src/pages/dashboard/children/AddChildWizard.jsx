// src/pages/dashboard/children/AddChildWizard.jsx
import { cloneElement, isValidElement, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createEnfantFlow } from "../../../api/enfants.create";
import { useToast } from "../../../components/common/ToastProvider";

/* =========================
   Helpers
   ========================= */
const nullIfEmpty = (v) => (v === "" ? null : v);
const cx = (...classes) => classes.filter(Boolean).join(" ");
const controlClasses = (hasError) =>
  cx(
    "w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition",
    hasError
      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200 bg-rose-50"
      : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100 bg-white"
  );
const phoneRegex = /^[0-9+()\-\s]{7,20}$/;
const cinRegex = /^\d{8}$/;
const isDate = (v) => !!v && !Number.isNaN(Date.parse(v));

// Focus + smooth scroll to first error
function focusFirstError(errors, root) {
  const firstKey = Object.keys(errors)[0];
  if (!firstKey) return;
  const el = root?.querySelector?.(
    `[name="${firstKey}"], #${firstKey}, #${firstKey}-error`
  );
  if (el) {
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

/* =========================
   Yup Schemas (per step)
   ========================= */

// Step 1 — enfant
const enfantSchema = yup.object({
  nom: yup
    .string()
    .trim()
    .max(100, "الحد الأقصى 100 حرف")
    .required("اللقب مطلوب"),
  prenom: yup
    .string()
    .trim()
    .max(100, "الحد الأقصى 100 حرف")
    .required("الإسم مطلوب"),
  date_naissance: yup
    .string()
    .required("تاريخ الولادة مطلوب")
    .test("is-date", "صيغة التاريخ غير صحيحة", isDate)
    .test(
      "not-in-future",
      "تاريخ الولادة لا يمكن أن يكون في المستقبل",
      (value) => !value || new Date(value) <= new Date()
    ),
  // parent_user_id is set later via link; keep it out of the form for now
});

// Step 2 — fiche_enfant
const ficheSchema = yup.object({
  lieu_naissance: yup
    .string()
    .trim()
    .max(150, "الحد الأقصى 150 حرف")
    .required("مكان الولادة مطلوب"),
  diagnostic_medical: yup
    .string()
    .trim()
    .max(10000, "نص طويل جدًا")
    .required("التشخيص الطبي مطلوب"),
  nb_freres: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? null : Number(originalValue)
    )
    .typeError("يرجى إدخال رقم صالح")
    .integer("يرجى إدخال عدد صحيح")
    .min(0, "يجب أن تكون ≥ 0")
    .required("عدد الإخوة مطلوب"),
  nb_soeurs: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? null : Number(originalValue)
    )
    .typeError("يرجى إدخال رقم صالح")
    .integer("يرجى إدخال عدد صحيح")
    .min(0, "يجب أن تكون ≥ 0")
    .required("عدد الأخوات مطلوب"),
  rang_enfant: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? null : Number(originalValue)
    )
    .typeError("يرجى إدخال رقم صالح")
    .integer("يرجى إدخال عدد صحيح")
    .min(1, "يجب أن تكون ≥ 1")
    .required("ترتيب الطفل مطلوب"),
  situation_familiale: yup
    .mixed()
    .oneOf(
      ["deux_parents", "pere_seul", "mere_seule", "autre"],
      "قيمة غير صالحة"
    )
    .required("الوضعية العائلية مطلوبة"),
  diag_auteur_nom: yup
    .string()
    .trim()
    .max(150, "الحد الأقصى 150 حرف")
    .required("اسم مُصدر التشخيص مطلوب"),
  diag_auteur_description: yup
    .string()
    .trim()
    .max(10000, "نص طويل جدًا")
    .required("وصف مُصدر التشخيص مطلوب"),
  carte_invalidite_numero: yup
    .string()
    .trim()
    .max(100, "الحد الأقصى 100 حرف")
    .nullable()
    .transform(nullIfEmpty),
  carte_invalidite_couleur: yup
    .string()
    .trim()
    .max(50, "الحد الأقصى 50 حرف")
    .nullable()
    .transform(nullIfEmpty),
  type_handicap: yup
    .string()
    .trim()
    .max(150, "الحد الأقصى 150 حرف")
    .required("نوع الإعاقة مطلوب"),
  troubles_principaux: yup
    .string()
    .trim()
    .max(10000, "نص طويل جدًا")
    .required("الاضطرابات الرئيسية مطلوبة"),
});

// Step 3 — parents_fiche (at least one contact)
const parentsFicheSchema = yup
  .object({
    // الأب
    pere_nom: yup
      .string()
      .trim()
      .max(255, "الحد الأقصى 255 حرف")
      .required("لقب الأب مطلوب"),
    pere_prenom: yup
      .string()
      .trim()
      .max(255, "الحد الأقصى 255 حرف")
      .required("اسم الأب مطلوب"),
    pere_naissance_date: yup
      .string()
      .nullable()
      .transform(nullIfEmpty)
      .test("is-date", "صيغة التاريخ غير صحيحة", (v) => v == null || isDate(v)),
    pere_naissance_lieu: yup
      .string()
      .trim()
      .max(255, "الحد الأقصى 255 حرف")
      .nullable()
      .transform(nullIfEmpty),
    pere_origine: yup
      .string()
      .trim()
      .max(255, "الحد الأقصى 255 حرف")
      .nullable()
      .transform(nullIfEmpty),
    pere_cin_numero: yup
      .string()
      .trim()
      .nullable()
      .transform(nullIfEmpty)
      .test(
        "cin",
        "رقم بطاقة تعريف غير صالح (8 أرقام)",
        (v) => v == null || cinRegex.test(v)
      ),
    pere_cin_delivree_a: yup
      .string()
      .trim()
      .max(255, "الحد الأقصى 255 حرف")
      .nullable()
      .transform(nullIfEmpty),
    pere_adresse: yup
      .string()
      .trim()
      .max(500, "الحد الأقصى 500 حرف")
      .required("عنوان الأب مطلوب"),
    pere_profession: yup
      .string()
      .trim()
      .max(255, "الحد الأقصى 255 حرف")
      .required("مهنة الأب مطلوبة"),
    pere_couverture_sociale: yup
      .string()
      .trim()
      .max(255, "الحد الأقصى 255 حرف")
      .nullable()
      .transform(nullIfEmpty),
    pere_tel_domicile: yup
      .string()
      .trim()
      .nullable()
      .transform(nullIfEmpty)
      .test(
        "phone",
        "رقم هاتف غير صالح",
        (v) => v == null || phoneRegex.test(v)
      ),
    pere_tel_travail: yup
      .string()
      .trim()
      .nullable()
      .transform(nullIfEmpty)
      .test(
        "phone",
        "رقم هاتف غير صالح",
        (v) => v == null || phoneRegex.test(v)
      ),
    pere_tel_portable: yup
      .string()
      .trim()
      .required("رقم هاتف الأب الجوال مطلوب")
      .test("phone", "رقم هاتف غير صالح", (v) => phoneRegex.test(v)),
    pere_email: yup
      .string()
      .trim()
      .email("بريد إلكتروني غير صالح")
      .nullable()
      .transform(nullIfEmpty),

    // الأم
    mere_nom: yup
      .string()
      .trim()
      .max(255, "الحد الأقصى 255 حرف")
      .required("لقب الأم مطلوب"),
    mere_prenom: yup
      .string()
      .trim()
      .max(255, "الحد الأقصى 255 حرف")
      .required("اسم الأم مطلوب"),
    mere_naissance_date: yup
      .string()
      .nullable()
      .transform(nullIfEmpty)
      .test("is-date", "صيغة التاريخ غير صحيحة", (v) => v == null || isDate(v)),
    mere_naissance_lieu: yup
      .string()
      .trim()
      .max(255, "الحد الأقصى 255 حرف")
      .nullable()
      .transform(nullIfEmpty),
    mere_origine: yup
      .string()
      .trim()
      .max(255, "الحد الأقصى 255 حرف")
      .nullable()
      .transform(nullIfEmpty),
    mere_cin_numero: yup
      .string()
      .trim()
      .nullable()
      .transform(nullIfEmpty)
      .test(
        "cin",
        "رقم بطاقة تعريف غير صالح (8 أرقام)",
        (v) => v == null || cinRegex.test(v)
      ),
    mere_cin_delivree_a: yup
      .string()
      .trim()
      .max(255, "الحد الأقصى 255 حرف")
      .nullable()
      .transform(nullIfEmpty),
    mere_adresse: yup
      .string()
      .trim()
      .max(500, "الحد الأقصى 500 حرف")
      .required("عنوان الأم مطلوب"),
    mere_profession: yup
      .string()
      .trim()
      .max(255, "الحد الأقصى 255 حرف")
      .required("مهنة الأم مطلوبة"),
    mere_couverture_sociale: yup
      .string()
      .trim()
      .max(255, "الحد الأقصى 255 حرف")
      .nullable()
      .transform(nullIfEmpty),
    mere_tel_domicile: yup
      .string()
      .trim()
      .nullable()
      .transform(nullIfEmpty)
      .test(
        "phone",
        "رقم هاتف غير صالح",
        (v) => v == null || phoneRegex.test(v)
      ),
    mere_tel_travail: yup
      .string()
      .trim()
      .nullable()
      .transform(nullIfEmpty)
      .test(
        "phone",
        "رقم هاتف غير صالح",
        (v) => v == null || phoneRegex.test(v)
      ),
    mere_tel_portable: yup
      .string()
      .trim()
      .required("رقم هاتف الأم الجوال مطلوب")
      .test("phone", "رقم هاتف غير صالح", (v) => phoneRegex.test(v)),
    mere_email: yup
      .string()
      .trim()
      .email("بريد إلكتروني غير صالح")
      .nullable()
      .transform(nullIfEmpty),
  })
  .test(
    "at-least-one-contact",
    "يجب توفير وسيلة اتصال واحدة على الأقل (هاتف أو بريد) لأحد الوالدين",
    (values, ctx) => {
      const contactFields = [
        "pere_tel_portable",
        "pere_tel_travail",
        "pere_tel_domicile",
        "pere_email",
        "mere_tel_portable",
        "mere_tel_travail",
        "mere_tel_domicile",
        "mere_email",
      ];
      const hasContact = contactFields.some((k) => {
        const value = values?.[k];
        if (typeof value === "string") {
          return value.trim().length > 0;
        }
        return Boolean(value);
      });

      if (hasContact) {
        return true;
      }

      return ctx.createError({
        path: "atLeastOneContact",
        message:
          "يجب توفير وسيلة اتصال واحدة على الأقل (هاتف أو بريد) لأحد الوالدين",
      });
    }
  );

/* =========================
   Component
   ========================= */
export default function AddChildWizard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState("");
  const stepRefs = [useRef(null), useRef(null), useRef(null)];

  // RHF forms (validate per step; show errors + focus)
  const enfantForm = useForm({
    defaultValues: { nom: "", prenom: "", date_naissance: "" },
    resolver: yupResolver(enfantSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    criteriaMode: "firstError",
  });

  const ficheForm = useForm({
    defaultValues: {
      lieu_naissance: "",
      diagnostic_medical: "",
      nb_freres: "",
      nb_soeurs: "",
      rang_enfant: "",
      situation_familiale: "",
      diag_auteur_nom: "",
      diag_auteur_description: "",
      carte_invalidite_numero: "",
      carte_invalidite_couleur: "",
      type_handicap: "",
      troubles_principaux: "",
    },
    resolver: yupResolver(ficheSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    criteriaMode: "firstError",
  });

  const parentsForm = useForm({
    defaultValues: {
      pere_nom: "",
      pere_prenom: "",
      pere_naissance_date: "",
      pere_naissance_lieu: "",
      pere_origine: "",
      pere_cin_numero: "",
      pere_cin_delivree_a: "",
      pere_adresse: "",
      pere_profession: "",
      pere_couverture_sociale: "",
      pere_tel_domicile: "",
      pere_tel_travail: "",
      pere_tel_portable: "",
      pere_email: "",

      mere_nom: "",
      mere_prenom: "",
      mere_naissance_date: "",
      mere_naissance_lieu: "",
      mere_origine: "",
      mere_cin_numero: "",
      mere_cin_delivree_a: "",
      mere_adresse: "",
      mere_profession: "",
      mere_couverture_sociale: "",
      mere_tel_domicile: "",
      mere_tel_travail: "",
      mere_tel_portable: "",
      mere_email: "",
    },
    resolver: yupResolver(parentsFicheSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    criteriaMode: "firstError",
  });

  const enfantPreview = enfantForm.watch();
  const fichePreview = ficheForm.watch();
  const parentsPreview = parentsForm.watch();

  const { mutate, isLoading } = useMutation({
    mutationFn: async () => {
      setServerError("");
      const enfant = enfantForm.getValues();
      const fiche = normalizeFiche(ficheForm.getValues());
      const parentsFiche = normalizeParentsFiche(parentsForm.getValues());
      await createEnfantFlow({ enfant, fiche, parentsFiche });
    },
    onSuccess: () => {
      toast?.("تمت إضافة الطفل بنجاح ✅", "success");
      navigate("/dashboard/president/children", { replace: true });
    },
    onError: (e) => {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.";
      setServerError(msg);
      toast?.(msg, "error");
    },
  });

  const validating =
    isLoading ||
    enfantForm.formState.isSubmitting ||
    ficheForm.formState.isSubmitting ||
    parentsForm.formState.isSubmitting;

  // Next with strict validation + focus/scroll
  const handleNext = async () => {
    if (step === 0) {
      const ok = await enfantForm.trigger(undefined, { shouldFocus: true });
      if (!ok) {
        focusFirstError(enfantForm.formState.errors, stepRefs[0].current);
        return;
      }
    }
    if (step === 1) {
      const ok = await ficheForm.trigger(undefined, { shouldFocus: true });
      if (!ok) {
        focusFirstError(ficheForm.formState.errors, stepRefs[1].current);
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 2));
  };

  const handleConfirm = async () => {
    const ok = await parentsForm.trigger(undefined, { shouldFocus: true });
    if (!ok) {
      focusFirstError(parentsForm.formState.errors, stepRefs[2].current);
      return;
    }
    mutate();
  };

  const handlePrev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="p-4 md:p-6" dir="rtl">
      <div className="max-w-5xl mx-auto bg-white border rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-l from-indigo-50 to-white">
          <div>
            <h1 className="text-xl font-bold text-gray-900">إضافة طفل جديد</h1>
            <p className="text-sm text-gray-500">
              لا يتم حفظ أي بيانات حتى تضغط <b>تأكيد</b>.
            </p>
          </div>
          <Link
            to="/dashboard/children"
            className="text-indigo-600 hover:text-indigo-700 text-sm"
          >
            الرجوع إلى القائمة
          </Link>
        </div>

        {/* Stepper */}
        <WizardSteps step={step} />

        {/* Body */}
        <div className="px-5 py-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div ref={stepRefs[step]}>
              {step === 0 && <StepChild form={enfantForm} />}
              {step === 1 && <StepFiche form={ficheForm} />}
              {step === 2 && <StepParentsFiche form={parentsForm} />}
            </div>

            <PreviewPanel
              step={step}
              enfant={enfantPreview}
              fiche={fichePreview}
              parents={parentsPreview}
            />
          </div>

          {serverError && (
            <div className="mt-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm">
              {serverError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 0 || validating}
            className="px-4 py-2 rounded-xl border hover:bg-gray-100 disabled:opacity-50"
          >
            {validating && step === 0 ? "..." : "السابق"}
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={validating}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {validating ? "جارِ التحقق…" : "التالي"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={validating}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {validating ? "جارِ التأكيد…" : "تأكيد"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* =============== UI Helpers =============== */
function WizardSteps({ step }) {
  const steps = [
    { key: 0, title: "بيانات الطفل" },
    { key: 1, title: "سجلّ الطفل" },
    { key: 2, title: "بيانات الأولياء" },
  ];
  return (
    <div className="px-5 pt-5">
      <div className="flex items-center gap-3">
        {steps.map((s, idx) => {
          const active = step === s.key;
          const done = step > s.key;
          return (
            <div key={s.key} className="flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={[
                    "w-8 h-8 rounded-full flex items-center justify-center border",
                    active
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : done
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-600 border-gray-300",
                  ].join(" ")}
                >
                  {idx + 1}
                </div>
                <div
                  className={
                    active ? "font-semibold text-gray-900" : "text-gray-600"
                  }
                >
                  {s.title}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="h-2 rounded-full bg-gray-100 mt-2 mb-4">
                  <div
                    className={[
                      "h-2 rounded-full",
                      step > s.key
                        ? "bg-emerald-500"
                        : step === s.key
                        ? "bg-indigo-500"
                        : "bg-gray-100",
                    ].join(" ")}
                    style={{
                      width:
                        step > s.key ? "100%" : step === s.key ? "50%" : "0%",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ id, label, required, error, children }) {
  const describedBy = error ? `${id}-error` : undefined;
  let control;

  if (typeof children === "function") {
    control = children({
      describedBy,
      error,
      controlClassName: controlClasses(Boolean(error)),
    });
  } else if (isValidElement(children)) {
    control = cloneElement(children, {
      id,
      "aria-invalid": Boolean(error),
      "aria-describedby": describedBy,
      className: cx(children.props.className, controlClasses(Boolean(error))),
    });
  } else {
    control = children;
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm mb-1 text-gray-700">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      {control}
      {error && (
        <p id={describedBy} className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

function PreviewPanel({ step, enfant, fiche, parents }) {
  const sectionTitle = (title, done) => (
    <div className="flex items-center justify-between mb-3">
      <span className="font-semibold text-gray-800">{title}</span>
      <span
        className={[
          "text-xs font-medium px-2 py-1 rounded-lg",
          done
            ? "bg-emerald-100 text-emerald-700"
            : "bg-gray-100 text-gray-500",
        ].join(" ")}
      >
        {done ? "مكتمل" : "مسودة"}
      </span>
    </div>
  );

  const val = (input) => {
    if (input === null || typeof input === "undefined") return "—";
    if (typeof input === "string" && input.trim() === "") return "—";
    return input;
  };

  const childDone = Boolean(enfant?.nom && enfant?.prenom && enfant?.date_naissance);
  const ficheDone =
    step > 0 &&
    Object.values(fiche || {}).some((v) => v !== null && `${v}`.trim() !== "");
  const parentsDone =
    step === 2 &&
    Boolean(parents?.pere_nom && parents?.pere_prenom && parents?.mere_nom && parents?.mere_prenom);

  const parentName = (nom, prenom) => {
    const parts = [nom, prenom]
      .map((p) => (typeof p === "string" ? p.trim() : p))
      .filter((p) => p && `${p}`.trim() !== "");
    return parts.length ? parts.join(" ") : "—";
  };

  const rows = useMemo(
    () => [
      {
        title: "بيانات الطفل",
        done: childDone,
        items: [
          { label: "اللقب", value: val(enfant?.nom) },
          { label: "الإسم", value: val(enfant?.prenom) },
          { label: "تاريخ الولادة", value: val(enfant?.date_naissance) },
        ],
      },
      {
        title: "سجلّ الطفل",
        done: ficheDone,
        items: [
          { label: "التشخيص الطبي", value: val(fiche?.diagnostic_medical) },
          { label: "نوع الإعاقة", value: val(fiche?.type_handicap) },
          { label: "الاضطرابات الرئيسية", value: val(fiche?.troubles_principaux) },
        ],
      },
      {
        title: "بيانات الأولياء",
        done: parentsDone,
        items: [
          { label: "الأب", value: parentName(parents?.pere_nom, parents?.pere_prenom) },
          { label: "الأم", value: parentName(parents?.mere_nom, parents?.mere_prenom) },
          {
            label: "وسائل الاتصال",
            value:
              val(
                [
                  parents?.pere_tel_portable,
                  parents?.pere_email,
                  parents?.mere_tel_portable,
                  parents?.mere_email,
                ]
                  .filter((x) => x && `${x}`.trim() !== "")
                  .join(" • ")
              ) || "—",
          },
        ],
      },
    ],
    [childDone, ficheDone, parentsDone, enfant, fiche, parents]
  );

  return (
    <aside className="lg:sticky lg:top-6 h-max bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-5">
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1">معاينة سريعة</p>
        <p className="text-xs text-gray-500">
          يتم تحديث هذه البطاقة تلقائيًا أثناء تعبئة الحقول لمساعدتك على مراجعة
          البيانات قبل التأكيد.
        </p>
      </div>

      {rows.map((section) => (
        <div key={section.title} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          {sectionTitle(section.title, section.done)}
          <dl className="space-y-2 text-sm text-gray-600">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-3">
                <dt className="font-medium text-gray-700">{item.label}</dt>
                <dd className="text-gray-600 text-left rtl:text-right">
                  {item.value || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}

      <div className="text-xs text-gray-500">
        <p>تلميح: يمكنك الرجوع إلى أي خطوة لتعديل البيانات قبل الضغط على "تأكيد".</p>
      </div>
    </aside>
  );
}

/* =============== Steps =============== */
function StepChild({ form }) {
  const {
    register,
    formState: { errors },
  } = form;
  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      onSubmit={(e) => e.preventDefault()}
    >
      <Field id="nom" label="اللقب" required error={errors.nom?.message}>
        <input
          id="nom"
          {...register("nom")}
          name="nom"
          aria-invalid={!!errors.nom}
          aria-describedby={errors.nom ? "nom-error" : undefined}
          className="w-full px-3 py-2 rounded-xl border"
          placeholder="مثال: بن سالم"
        />
      </Field>

      <Field id="prenom" label="الإسم" required error={errors.prenom?.message}>
        <input
          id="prenom"
          {...register("prenom")}
          name="prenom"
          aria-invalid={!!errors.prenom}
          aria-describedby={errors.prenom ? "prenom-error" : undefined}
          className="w-full px-3 py-2 rounded-xl border"
          placeholder="مثال: يوسف"
        />
      </Field>

      <Field
        id="date_naissance"
        label="تاريخ الولادة"
        required
        error={errors.date_naissance?.message}
      >
        <input
          id="date_naissance"
          type="date"
          {...register("date_naissance")}
          name="date_naissance"
          aria-invalid={!!errors.date_naissance}
          aria-describedby={
            errors.date_naissance ? "date_naissance-error" : undefined
          }
          className="w-full px-3 py-2 rounded-xl border"
        />
      </Field>

      <div className="md:col-span-2 text-xs text-gray-500">
        * الحقول الأساسية إلزامية.
      </div>
    </form>
  );
}

function StepFiche({ form }) {
  const {
    register,
    formState: { errors },
  } = form;
  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      onSubmit={(e) => e.preventDefault()}
    >
      <Field
        id="lieu_naissance"
        label="مكان الولادة"
        required
        error={errors.lieu_naissance?.message}
      >
        <input
          id="lieu_naissance"
          {...register("lieu_naissance")}
          name="lieu_naissance"
          aria-invalid={!!errors.lieu_naissance}
          aria-describedby={
            errors.lieu_naissance ? "lieu_naissance-error" : undefined
          }
          className="w-full px-3 py-2 rounded-xl border"
          placeholder="مثال: تونس"
        />
      </Field>

      <Field
        id="diagnostic_medical"
        label="التشخيص الطبي"
        required
        error={errors.diagnostic_medical?.message}
      >
        <input
          id="diagnostic_medical"
          {...register("diagnostic_medical")}
          name="diagnostic_medical"
          aria-invalid={!!errors.diagnostic_medical}
          aria-describedby={
            errors.diagnostic_medical ? "diagnostic_medical-error" : undefined
          }
          className="w-full px-3 py-2 rounded-xl border"
          placeholder="ASD level 2…"
        />
      </Field>

      <Field
        id="nb_freres"
        label="عدد الإخوة"
        required
        error={errors.nb_freres?.message}
      >
        <input
          id="nb_freres"
          type="number"
          min="0"
          {...register("nb_freres")}
          name="nb_freres"
          aria-invalid={!!errors.nb_freres}
          aria-describedby={errors.nb_freres ? "nb_freres-error" : undefined}
          className="w-full px-3 py-2 rounded-xl border"
        />
      </Field>

      <Field
        id="nb_soeurs"
        label="عدد الأخوات"
        required
        error={errors.nb_soeurs?.message}
      >
        <input
          id="nb_soeurs"
          type="number"
          min="0"
          {...register("nb_soeurs")}
          name="nb_soeurs"
          aria-invalid={!!errors.nb_soeurs}
          aria-describedby={errors.nb_soeurs ? "nb_soeurs-error" : undefined}
          className="w-full px-3 py-2 rounded-xl border"
        />
      </Field>

      <Field
        id="rang_enfant"
        label="ترتيب الطفل"
        required
        error={errors.rang_enfant?.message}
      >
        <input
          id="rang_enfant"
          type="number"
          min="1"
          {...register("rang_enfant")}
          name="rang_enfant"
          aria-invalid={!!errors.rang_enfant}
          aria-describedby={
            errors.rang_enfant ? "rang_enfant-error" : undefined
          }
          className="w-full px-3 py-2 rounded-xl border"
        />
      </Field>

      <Field
        id="situation_familiale"
        label="الوضعية العائلية"
        required
        error={errors.situation_familiale?.message}
      >
        <select
          id="situation_familiale"
          {...register("situation_familiale")}
          name="situation_familiale"
          aria-invalid={!!errors.situation_familiale}
          aria-describedby={
            errors.situation_familiale ? "situation_familiale-error" : undefined
          }
          className="w-full px-3 py-2 rounded-xl border bg-white"
        >
          <option value="">—</option>
          <option value="deux_parents">والدان</option>
          <option value="pere_seul">أب فقط</option>
          <option value="mere_seule">أم فقط</option>
          <option value="autre">أخرى</option>
        </select>
      </Field>

      <Field
        id="diag_auteur_nom"
        label="اسم مُصدر التشخيص"
        required
        error={errors.diag_auteur_nom?.message}
      >
        <input
          id="diag_auteur_nom"
          {...register("diag_auteur_nom")}
          name="diag_auteur_nom"
          aria-invalid={!!errors.diag_auteur_nom}
          aria-describedby={
            errors.diag_auteur_nom ? "diag_auteur_nom-error" : undefined
          }
          className="w-full px-3 py-2 rounded-xl border"
        />
      </Field>

      <Field
        id="diag_auteur_description"
        label="وصف مُصدر التشخيص"
        required
        error={errors.diag_auteur_description?.message}
      >
        <input
          id="diag_auteur_description"
          {...register("diag_auteur_description")}
          name="diag_auteur_description"
          aria-invalid={!!errors.diag_auteur_description}
          aria-describedby={
            errors.diag_auteur_description
              ? "diag_auteur_description-error"
              : undefined
          }
          className="w-full px-3 py-2 rounded-xl border"
        />
      </Field>

      <Field
        id="carte_invalidite_numero"
        label="رقم بطاقة الإعاقة"
        error={errors.carte_invalidite_numero?.message}
      >
        <input
          id="carte_invalidite_numero"
          {...register("carte_invalidite_numero")}
          name="carte_invalidite_numero"
          aria-invalid={!!errors.carte_invalidite_numero}
          aria-describedby={
            errors.carte_invalidite_numero
              ? "carte_invalidite_numero-error"
              : undefined
          }
          className="w-full px-3 py-2 rounded-xl border"
        />
      </Field>

      <Field
        id="carte_invalidite_couleur"
        label="لون بطاقة الإعاقة"
        error={errors.carte_invalidite_couleur?.message}
      >
        <input
          id="carte_invalidite_couleur"
          {...register("carte_invalidite_couleur")}
          name="carte_invalidite_couleur"
          aria-invalid={!!errors.carte_invalidite_couleur}
          aria-describedby={
            errors.carte_invalidite_couleur
              ? "carte_invalidite_couleur-error"
              : undefined
          }
          className="w-full px-3 py-2 rounded-xl border"
        />
      </Field>

      <Field
        id="type_handicap"
        label="نوع الإعاقة"
        required
        error={errors.type_handicap?.message}
      >
        <input
          id="type_handicap"
          {...register("type_handicap")}
          name="type_handicap"
          aria-invalid={!!errors.type_handicap}
          aria-describedby={
            errors.type_handicap ? "type_handicap-error" : undefined
          }
          className="w-full px-3 py-2 rounded-xl border"
        />
      </Field>

      <div className="md:col-span-2">
        <Field
          id="troubles_principaux"
          label="الاضطرابات الرئيسية"
          required
          error={errors.troubles_principaux?.message}
        >
          {({ describedBy }) => (
            <textarea
              id="troubles_principaux"
              rows={4}
              {...register("troubles_principaux")}
              name="troubles_principaux"
              aria-invalid={!!errors.troubles_principaux}
              aria-describedby={describedBy}
              className="w-full px-3 py-2 rounded-xl border"
            />
          )}
        </Field>
      </div>
    </form>
  );
}

function StepParentsFiche({ form }) {
  const {
    register,
    formState: { errors },
  } = form;
  const formLevelError = errors?.atLeastOneContact?.message;

  const Two = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
      {children}
    </div>
  );
  const Section = ({ title, children }) => (
    <div className="md:col-span-2 p-4 rounded-xl border bg-gray-50">
      <div className="text-sm font-semibold text-gray-700 mb-3">{title}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      onSubmit={(e) => e.preventDefault()}
    >
      {formLevelError && (
        <div
          id="atLeastOneContact-error"
          role="alert"
          tabIndex={-1}
          className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          {formLevelError}
        </div>
      )}

      <Section title="معلومات الأب">
        <Two>
          <Field
            id="pere_nom"
            label="اللقب"
            required
            error={errors.pere_nom?.message}
          >
            <input
              id="pere_nom"
              {...register("pere_nom")}
              name="pere_nom"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
          <Field
            id="pere_prenom"
            label="الإسم"
            required
            error={errors.pere_prenom?.message}
          >
            <input
              id="pere_prenom"
              {...register("pere_prenom")}
              name="pere_prenom"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
        </Two>

        <Two>
          <Field
            id="pere_naissance_date"
            label="تاريخ الميلاد"
            error={errors.pere_naissance_date?.message}
          >
            <input
              id="pere_naissance_date"
              type="date"
              {...register("pere_naissance_date")}
              name="pere_naissance_date"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
          <Field
            id="pere_naissance_lieu"
            label="مكان الميلاد"
            error={errors.pere_naissance_lieu?.message}
          >
            <input
              id="pere_naissance_lieu"
              {...register("pere_naissance_lieu")}
              name="pere_naissance_lieu"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
        </Two>

        <Two>
          <Field
            id="pere_cin_numero"
            label="رقم بطاقة التعريف"
            error={errors.pere_cin_numero?.message}
          >
            <input
              id="pere_cin_numero"
              {...register("pere_cin_numero")}
              name="pere_cin_numero"
              className="w-full px-3 py-2 rounded-xl border"
              placeholder="8 أرقام"
            />
          </Field>
          <Field
            id="pere_cin_delivree_a"
            label="المسلّمة في"
            error={errors.pere_cin_delivree_a?.message}
          >
            <input
              id="pere_cin_delivree_a"
              {...register("pere_cin_delivree_a")}
              name="pere_cin_delivree_a"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
        </Two>

        <Two>
          <Field
            id="pere_adresse"
            label="العنوان"
            required
            error={errors.pere_adresse?.message}
          >
            <input
              id="pere_adresse"
              {...register("pere_adresse")}
              name="pere_adresse"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
          <Field
            id="pere_profession"
            label="المهنة"
            required
            error={errors.pere_profession?.message}
          >
            <input
              id="pere_profession"
              {...register("pere_profession")}
              name="pere_profession"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
        </Two>

        <Two>
          <Field
            id="pere_tel_domicile"
            label="هاتف (منزل)"
            error={errors.pere_tel_domicile?.message}
          >
            <input
              id="pere_tel_domicile"
              {...register("pere_tel_domicile")}
              name="pere_tel_domicile"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
          <Field
            id="pere_tel_travail"
            label="هاتف (عمل)"
            error={errors.pere_tel_travail?.message}
          >
            <input
              id="pere_tel_travail"
              {...register("pere_tel_travail")}
              name="pere_tel_travail"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
        </Two>

        <Two>
          <Field
            id="pere_tel_portable"
            label="هاتف (جوال)"
            required
            error={errors.pere_tel_portable?.message}
          >
            <input
              id="pere_tel_portable"
              {...register("pere_tel_portable")}
              name="pere_tel_portable"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
          <Field
            id="pere_email"
            label="البريد الإلكتروني"
            error={errors.pere_email?.message}
          >
            <input
              id="pere_email"
              type="email"
              {...register("pere_email")}
              name="pere_email"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
        </Two>
      </Section>

      <Section title="معلومات الأم">
        <Two>
          <Field
            id="mere_nom"
            label="اللقب"
            required
            error={errors.mere_nom?.message}
          >
            <input
              id="mere_nom"
              {...register("mere_nom")}
              name="mere_nom"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
          <Field
            id="mere_prenom"
            label="الإسم"
            required
            error={errors.mere_prenom?.message}
          >
            <input
              id="mere_prenom"
              {...register("mere_prenom")}
              name="mere_prenom"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
        </Two>

        <Two>
          <Field
            id="mere_naissance_date"
            label="تاريخ الميلاد"
            error={errors.mere_naissance_date?.message}
          >
            <input
              id="mere_naissance_date"
              type="date"
              {...register("mere_naissance_date")}
              name="mere_naissance_date"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
          <Field
            id="mere_naissance_lieu"
            label="مكان الميلاد"
            error={errors.mere_naissance_lieu?.message}
          >
            <input
              id="mere_naissance_lieu"
              {...register("mere_naissance_lieu")}
              name="mere_naissance_lieu"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
        </Two>

        <Two>
          <Field
            id="mere_cin_numero"
            label="رقم بطاقة التعريف"
            error={errors.mere_cin_numero?.message}
          >
            <input
              id="mere_cin_numero"
              {...register("mere_cin_numero")}
              name="mere_cin_numero"
              className="w-full px-3 py-2 rounded-xl border"
              placeholder="8 أرقام"
            />
          </Field>
          <Field
            id="mere_cin_delivree_a"
            label="المسلّمة في"
            error={errors.mere_cin_delivree_a?.message}
          >
            <input
              id="mere_cin_delivree_a"
              {...register("mere_cin_delivree_a")}
              name="mere_cin_delivree_a"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
        </Two>

        <Two>
          <Field
            id="mere_adresse"
            label="العنوان"
            required
            error={errors.mere_adresse?.message}
          >
            <input
              id="mere_adresse"
              {...register("mere_adresse")}
              name="mere_adresse"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
          <Field
            id="mere_profession"
            label="المهنة"
            required
            error={errors.mere_profession?.message}
          >
            <input
              id="mere_profession"
              {...register("mere_profession")}
              name="mere_profession"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
        </Two>

        <Two>
          <Field
            id="mere_tel_domicile"
            label="هاتف (منزل)"
            error={errors.mere_tel_domicile?.message}
          >
            <input
              id="mere_tel_domicile"
              {...register("mere_tel_domicile")}
              name="mere_tel_domicile"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
          <Field
            id="mere_tel_travail"
            label="هاتف (عمل)"
            error={errors.mere_tel_travail?.message}
          >
            <input
              id="mere_tel_travail"
              {...register("mere_tel_travail")}
              name="mere_tel_travail"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
        </Two>

        <Two>
          <Field
            id="mere_tel_portable"
            label="هاتف (جوال)"
            required
            error={errors.mere_tel_portable?.message}
          >
            <input
              id="mere_tel_portable"
              {...register("mere_tel_portable")}
              name="mere_tel_portable"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
          <Field
            id="mere_email"
            label="البريد الإلكتروني"
            error={errors.mere_email?.message}
          >
            <input
              id="mere_email"
              type="email"
              {...register("mere_email")}
              name="mere_email"
              className="w-full px-3 py-2 rounded-xl border"
            />
          </Field>
        </Two>
      </Section>
    </form>
  );
}

/* =============== Normalizers =============== */
function normalizeFiche(f) {
  const toInt = (v) =>
    v === "" || v === null || typeof v === "undefined" ? null : Number(v);
  return {
    ...f,
    nb_freres: toInt(f.nb_freres),
    nb_soeurs: toInt(f.nb_soeurs),
    rang_enfant: toInt(f.rang_enfant),
  };
}
function normalizeParentsFiche(f) {
  const out = {};
  for (const k in f) out[k] = nullIfEmpty(f[k]);
  return out;
}
