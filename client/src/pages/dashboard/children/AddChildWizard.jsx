import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createEnfantFlow } from "../../../api/enfants.create";
import { useToast } from "../../../components/common/ToastProvider";

/* =========================
   Helpers & constants
   ========================= */
const nullIfEmpty = (value) => (value === "" ? null : value);
const inputClass = (hasError) =>
  [
    "w-full px-3 py-2 rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-offset-0",
    hasError
      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200 bg-rose-50"
      : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100 bg-white",
  ].join(" ");

const phoneRegex = /^[0-9+()\-\s]{7,20}$/;
const cinRegex = /^\d{8}$/;
const isDate = (value) => !!value && !Number.isNaN(Date.parse(value));

const CHILD_FIELDS = ["nom", "prenom", "date_naissance"];
const FICHE_FIELDS = [
  "lieu_naissance",
  "diagnostic_medical",
  "nb_freres",
  "nb_soeurs",
  "rang_enfant",
  "situation_familiale",
  "diag_auteur_nom",
  "diag_auteur_description",
  "carte_invalidite_numero",
  "carte_invalidite_couleur",
  "type_handicap",
  "troubles_principaux",
];
const PARENT_FIELDS = [
  "pere_nom",
  "pere_prenom",
  "pere_naissance_date",
  "pere_naissance_lieu",
  "pere_origine",
  "pere_cin_numero",
  "pere_cin_delivree_a",
  "pere_adresse",
  "pere_profession",
  "pere_couverture_sociale",
  "pere_tel_domicile",
  "pere_tel_travail",
  "pere_tel_portable",
  "pere_email",
  "mere_nom",
  "mere_prenom",
  "mere_naissance_date",
  "mere_naissance_lieu",
  "mere_origine",
  "mere_cin_numero",
  "mere_cin_delivree_a",
  "mere_adresse",
  "mere_profession",
  "mere_couverture_sociale",
  "mere_tel_domicile",
  "mere_tel_travail",
  "mere_tel_portable",
  "mere_email",
  "atLeastOneContact",
];

const defaultValues = {
  nom: "",
  prenom: "",
  date_naissance: "",

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
};
const schema = yup
  .object({
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
      .transform((value, original) => (original === "" ? null : Number(original)))
      .typeError("يرجى إدخال رقم صالح")
      .integer("يرجى إدخال عدد صحيح")
      .min(0, "يجب أن تكون ≥ 0")
      .required("عدد الإخوة مطلوب"),
    nb_soeurs: yup
      .number()
      .transform((value, original) => (original === "" ? null : Number(original)))
      .typeError("يرجى إدخال رقم صالح")
      .integer("يرجى إدخال عدد صحيح")
      .min(0, "يجب أن تكون ≥ 0")
      .required("عدد الأخوات مطلوب"),
    rang_enfant: yup
      .number()
      .transform((value, original) => (original === "" ? null : Number(original)))
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
      .test("is-date", "صيغة التاريخ غير صحيحة", (value) => value == null || isDate(value)),
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
      .test("cin", "رقم بطاقة تعريف غير صالح (8 أرقام)", (value) =>
        value == null || cinRegex.test(value)
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
      .test("phone", "رقم هاتف غير صالح", (value) => value == null || phoneRegex.test(value)),
    pere_tel_travail: yup
      .string()
      .trim()
      .nullable()
      .transform(nullIfEmpty)
      .test("phone", "رقم هاتف غير صالح", (value) => value == null || phoneRegex.test(value)),
    pere_tel_portable: yup
      .string()
      .trim()
      .required("رقم هاتف الأب الجوال مطلوب")
      .test("phone", "رقم هاتف غير صالح", (value) => phoneRegex.test(value)),
    pere_email: yup
      .string()
      .trim()
      .email("بريد إلكتروني غير صالح")
      .nullable()
      .transform(nullIfEmpty),

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
      .test("is-date", "صيغة التاريخ غير صحيحة", (value) => value == null || isDate(value)),
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
      .test("cin", "رقم بطاقة تعريف غير صالح (8 أرقام)", (value) =>
        value == null || cinRegex.test(value)
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
      .test("phone", "رقم هاتف غير صالح", (value) => value == null || phoneRegex.test(value)),
    mere_tel_travail: yup
      .string()
      .trim()
      .nullable()
      .transform(nullIfEmpty)
      .test("phone", "رقم هاتف غير صالح", (value) => value == null || phoneRegex.test(value)),
    mere_tel_portable: yup
      .string()
      .trim()
      .required("رقم هاتف الأم الجوال مطلوب")
      .test("phone", "رقم هاتف غير صالح", (value) => phoneRegex.test(value)),
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
      const hasContact = contactFields.some((field) => {
        const value = values?.[field];
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
        message: "يجب توفير وسيلة اتصال واحدة على الأقل (هاتف أو بريد) لأحد الوالدين",
      });
    }
  );

const STEPS = [
  { key: "child", title: "بيانات الطفل", fields: CHILD_FIELDS },
  { key: "fiche", title: "سجلّ الطفل", fields: FICHE_FIELDS },
  { key: "parents", title: "بيانات الأولياء", fields: PARENT_FIELDS },
];
/* =========================
   Component
   ========================= */
export default function AddChildWizard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState("");
  const activeStepRef = useRef(null);

  const {
    control,
    register,
    trigger,
    getValues,
    setFocus,
    getFieldState,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });

  const watchedValues = useWatch({ control });
  const previewValues = useMemo(() => {
    const current = watchedValues || {};
    return {
      enfant: pickValues(current, CHILD_FIELDS),
      fiche: pickValues(current, FICHE_FIELDS),
      parents: pickValues(current, PARENT_FIELDS),
    };
  }, [watchedValues]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (payload) => {
      await createEnfantFlow(payload);
    },
    onSuccess: () => {
      toast?.("تمت إضافة الطفل بنجاح ✅", "success");
      navigate("/dashboard/president/children", { replace: true });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.";
      setServerError(message);
      toast?.(message, "error");
    },
  });

  const busy = isSubmitting || isPending;
  const activeStep = STEPS[step];

  const focusFirstError = (fields) => {
    for (const name of fields) {
      const state = getFieldState(name);
      if (state.error) {
        setFocus(name, { shouldSelect: true });
        const el = activeStepRef.current?.querySelector?.(`[name="${name}"]`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        break;
      }
    }
  };

  const handleNext = async () => {
    const fields = activeStep.fields;
    const valid = await trigger(fields, { shouldFocus: false });
    if (!valid) {
      focusFirstError(fields);
      return;
    }
    setServerError("");
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const handlePrev = () => {
    setServerError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleConfirm = async () => {
    const fields = STEPS[2].fields;
    const valid = await trigger(fields, { shouldFocus: false });
    if (!valid) {
      focusFirstError(fields);
      return;
    }

    const values = getValues();
    const enfant = pickValues(values, CHILD_FIELDS);
    const fiche = normalizeFiche(pickValues(values, FICHE_FIELDS));
    const parentsFiche = normalizeParentsFiche(pickValues(values, PARENT_FIELDS));

    setServerError("");
    try {
      await mutateAsync({ enfant, fiche, parentsFiche });
    } catch {
      // handled in onError
    }
  };

  return (
    <div className="p-4 md:p-6" dir="rtl">
      <div className="max-w-5xl mx-auto bg-white border rounded-2xl shadow-sm overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-l from-indigo-50 to-white">
          <div>
            <h1 className="text-xl font-bold text-gray-900">إضافة طفل جديد</h1>
            <p className="text-sm text-gray-500">
              لا يتم حفظ أي بيانات حتى تضغط <strong>تأكيد</strong>.
            </p>
          </div>
          <Link
            to="/dashboard/president/children"
            className="text-indigo-600 hover:text-indigo-700 text-sm"
          >
            الرجوع إلى القائمة
          </Link>
        </header>

        <WizardSteps step={step} />

        <section className="px-5 py-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div ref={activeStepRef}>
              {step === 0 && <StepChild register={register} errors={errors} />}
              {step === 1 && <StepFiche register={register} errors={errors} />}
              {step === 2 && <StepParents register={register} errors={errors} />}
            </div>

            <PreviewPanel
              step={step}
              enfant={previewValues.enfant}
              fiche={previewValues.fiche}
              parents={previewValues.parents}
            />
          </div>

          {serverError && (
            <div className="mt-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm">
              {serverError}
            </div>
          )}
        </section>

        <footer className="flex items-center justify-between px-5 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 0 || busy}
            className="px-4 py-2 rounded-xl border hover:bg-gray-100 disabled:opacity-50"
          >
            السابق
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={busy}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              التالي
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {busy ? "جارِ التأكيد…" : "تأكيد"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
/* =========================
   UI helpers
   ========================= */
function WizardSteps({ step }) {
  return (
    <div className="px-5 pt-5">
      <div className="flex items-center gap-3">
        {STEPS.map((item, index) => {
          const active = step === index;
          const done = step > index;
          return (
            <div key={item.key} className="flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={[
                    "w-8 h-8 rounded-full flex items-center justify-center border text-sm font-medium",
                    active
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : done
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-600 border-gray-300",
                  ].join(" ")}
                >
                  {index + 1}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {item.title}
                </span>
              </div>
              <div className="mt-2 h-1 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={[
                    "h-full transition-all",
                    done
                      ? "bg-emerald-500"
                      : active
                      ? "bg-indigo-500"
                      : "bg-transparent",
                  ].join(" ")}
                  style={{ width: done ? "100%" : active ? "50%" : "0%" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ id, label, required, error, children }) {
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-sm mb-1 text-gray-700">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      {children({ id, describedBy, error })}
      {error && (
        <p id={describedBy} className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

function PreviewPanel({ step, enfant, fiche, parents }) {
  const formatValue = (value) => {
    if (value === null || typeof value === "undefined") return "—";
    if (typeof value === "string" && value.trim() === "") return "—";
    return value;
  };

  const parentName = (nom, prenom) => {
    const parts = [nom, prenom]
      .map((item) => (typeof item === "string" ? item.trim() : item))
      .filter((item) => item && item.length > 0);
    return parts.length ? parts.join(" ") : "—";
  };

  const childDone = CHILD_FIELDS.every((field) =>
    Boolean(enfant?.[field] && `${enfant[field]}`.trim() !== "")
  );
  const ficheDone = FICHE_FIELDS.some((field) => {
    const value = fiche?.[field];
    return value !== null && `${value ?? ""}`.trim() !== "";
  });
  const parentsDone = step === 2;

  const sections = useMemo(
    () => [
      {
        title: "بيانات الطفل",
        done: childDone,
        items: [
          { label: "اللقب", value: formatValue(enfant?.nom) },
          { label: "الإسم", value: formatValue(enfant?.prenom) },
          { label: "تاريخ الولادة", value: formatValue(enfant?.date_naissance) },
        ],
      },
      {
        title: "سجلّ الطفل",
        done: ficheDone,
        items: [
          {
            label: "التشخيص الطبي",
            value: formatValue(fiche?.diagnostic_medical),
          },
          {
            label: "نوع الإعاقة",
            value: formatValue(fiche?.type_handicap),
          },
          {
            label: "الاضطرابات الرئيسية",
            value: formatValue(fiche?.troubles_principaux),
          },
        ],
      },
      {
        title: "بيانات الأولياء",
        done: parentsDone,
        items: [
          {
            label: "الأب",
            value: parentName(parents?.pere_nom, parents?.pere_prenom),
          },
          {
            label: "الأم",
            value: parentName(parents?.mere_nom, parents?.mere_prenom),
          },
          {
            label: "وسائل الاتصال",
            value:
              formatValue(
                [
                  parents?.pere_tel_portable,
                  parents?.pere_email,
                  parents?.mere_tel_portable,
                  parents?.mere_email,
                ]
                  .filter((item) => item && `${item}`.trim() !== "")
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

      {sections.map((section) => (
        <div
          key={section.title}
          className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-800">{section.title}</span>
            <span
              className={[
                "text-xs font-medium px-2 py-1 rounded-lg",
                section.done
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-500",
              ].join(" ")}
            >
              {section.done ? "مكتمل" : "مسودة"}
            </span>
          </div>
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
/* =========================
   Steps
   ========================= */
function StepChild({ register, errors }) {
  return (
    <div role="group" className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field id="nom" label="اللقب" required error={errors.nom?.message}>
        {({ id, describedBy }) => (
          <input
            id={id}
            {...register("nom")}
            aria-invalid={!!errors.nom}
            aria-describedby={describedBy}
            className={inputClass(Boolean(errors.nom))}
            placeholder="مثال: بن سالم"
          />
        )}
      </Field>

      <Field id="prenom" label="الإسم" required error={errors.prenom?.message}>
        {({ id, describedBy }) => (
          <input
            id={id}
            {...register("prenom")}
            aria-invalid={!!errors.prenom}
            aria-describedby={describedBy}
            className={inputClass(Boolean(errors.prenom))}
            placeholder="مثال: يوسف"
          />
        )}
      </Field>

      <Field
        id="date_naissance"
        label="تاريخ الولادة"
        required
        error={errors.date_naissance?.message}
      >
        {({ id, describedBy }) => (
          <input
            id={id}
            type="date"
            {...register("date_naissance")}
            aria-invalid={!!errors.date_naissance}
            aria-describedby={describedBy}
            className={inputClass(Boolean(errors.date_naissance))}
          />
        )}
      </Field>

      <div className="md:col-span-2 text-xs text-gray-500">* الحقول الأساسية إلزامية.</div>
    </div>
  );
}

function StepFiche({ register, errors }) {
  return (
    <div role="group" className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field
        id="lieu_naissance"
        label="مكان الولادة"
        required
        error={errors.lieu_naissance?.message}
      >
        {({ id, describedBy }) => (
          <input
            id={id}
            {...register("lieu_naissance")}
            aria-invalid={!!errors.lieu_naissance}
            aria-describedby={describedBy}
            className={inputClass(Boolean(errors.lieu_naissance))}
            placeholder="مثال: تونس"
          />
        )}
      </Field>

      <Field
        id="diagnostic_medical"
        label="التشخيص الطبي"
        required
        error={errors.diagnostic_medical?.message}
      >
        {({ id, describedBy }) => (
          <input
            id={id}
            {...register("diagnostic_medical")}
            aria-invalid={!!errors.diagnostic_medical}
            aria-describedby={describedBy}
            className={inputClass(Boolean(errors.diagnostic_medical))}
            placeholder="ASD level 2…"
          />
        )}
      </Field>

      <Field id="nb_freres" label="عدد الإخوة" required error={errors.nb_freres?.message}>
        {({ id, describedBy }) => (
          <input
            id={id}
            type="number"
            min="0"
            {...register("nb_freres")}
            aria-invalid={!!errors.nb_freres}
            aria-describedby={describedBy}
            className={inputClass(Boolean(errors.nb_freres))}
          />
        )}
      </Field>

      <Field id="nb_soeurs" label="عدد الأخوات" required error={errors.nb_soeurs?.message}>
        {({ id, describedBy }) => (
          <input
            id={id}
            type="number"
            min="0"
            {...register("nb_soeurs")}
            aria-invalid={!!errors.nb_soeurs}
            aria-describedby={describedBy}
            className={inputClass(Boolean(errors.nb_soeurs))}
          />
        )}
      </Field>

      <Field id="rang_enfant" label="ترتيب الطفل" required error={errors.rang_enfant?.message}>
        {({ id, describedBy }) => (
          <input
            id={id}
            type="number"
            min="1"
            {...register("rang_enfant")}
            aria-invalid={!!errors.rang_enfant}
            aria-describedby={describedBy}
            className={inputClass(Boolean(errors.rang_enfant))}
          />
        )}
      </Field>

      <Field
        id="situation_familiale"
        label="الوضعية العائلية"
        required
        error={errors.situation_familiale?.message}
      >
        {({ id, describedBy }) => (
          <select
            id={id}
            {...register("situation_familiale")}
            aria-invalid={!!errors.situation_familiale}
            aria-describedby={describedBy}
            className={inputClass(Boolean(errors.situation_familiale))}
          >
            <option value="">—</option>
            <option value="deux_parents">والدان</option>
            <option value="pere_seul">أب فقط</option>
            <option value="mere_seule">أم فقط</option>
            <option value="autre">أخرى</option>
          </select>
        )}
      </Field>

      <Field
        id="diag_auteur_nom"
        label="اسم مُصدر التشخيص"
        required
        error={errors.diag_auteur_nom?.message}
      >
        {({ id, describedBy }) => (
          <input
            id={id}
            {...register("diag_auteur_nom")}
            aria-invalid={!!errors.diag_auteur_nom}
            aria-describedby={describedBy}
            className={inputClass(Boolean(errors.diag_auteur_nom))}
          />
        )}
      </Field>

      <Field
        id="diag_auteur_description"
        label="وصف مُصدر التشخيص"
        required
        error={errors.diag_auteur_description?.message}
      >
        {({ id, describedBy }) => (
          <input
            id={id}
            {...register("diag_auteur_description")}
            aria-invalid={!!errors.diag_auteur_description}
            aria-describedby={describedBy}
            className={inputClass(Boolean(errors.diag_auteur_description))}
          />
        )}
      </Field>

      <Field
        id="carte_invalidite_numero"
        label="رقم بطاقة الإعاقة"
        error={errors.carte_invalidite_numero?.message}
      >
        {({ id, describedBy }) => (
          <input
            id={id}
            {...register("carte_invalidite_numero")}
            aria-invalid={!!errors.carte_invalidite_numero}
            aria-describedby={describedBy}
            className={inputClass(Boolean(errors.carte_invalidite_numero))}
          />
        )}
      </Field>

      <Field
        id="carte_invalidite_couleur"
        label="لون بطاقة الإعاقة"
        error={errors.carte_invalidite_couleur?.message}
      >
        {({ id, describedBy }) => (
          <input
            id={id}
            {...register("carte_invalidite_couleur")}
            aria-invalid={!!errors.carte_invalidite_couleur}
            aria-describedby={describedBy}
            className={inputClass(Boolean(errors.carte_invalidite_couleur))}
          />
        )}
      </Field>

      <Field id="type_handicap" label="نوع الإعاقة" required error={errors.type_handicap?.message}>
        {({ id, describedBy }) => (
          <input
            id={id}
            {...register("type_handicap")}
            aria-invalid={!!errors.type_handicap}
            aria-describedby={describedBy}
            className={inputClass(Boolean(errors.type_handicap))}
          />
        )}
      </Field>

      <Field
        id="troubles_principaux"
        label="الاضطرابات الرئيسية"
        required
        error={errors.troubles_principaux?.message}
      >
        {({ id, describedBy }) => (
          <textarea
            id={id}
            rows={4}
            {...register("troubles_principaux")}
            aria-invalid={!!errors.troubles_principaux}
            aria-describedby={describedBy}
            className={inputClass(Boolean(errors.troubles_principaux))}
          />
        )}
      </Field>
    </div>
  );
}
function StepParents({ register, errors }) {
  const formLevelError = errors?.atLeastOneContact?.message;
  const TwoCols = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">{children}</div>
  );
  const Section = ({ title, children }) => (
    <section className="md:col-span-2 p-4 rounded-xl border bg-gray-50 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </section>
  );

  return (
    <div role="group" className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {formLevelError && (
        <div
          id="atLeastOneContact-error"
          role="alert"
          tabIndex={-1}
          className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {formLevelError}
        </div>
      )}

      <Section title="معلومات الأب">
        <TwoCols>
          <Field id="pere_nom" label="اللقب" required error={errors.pere_nom?.message}>
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("pere_nom")}
                aria-invalid={!!errors.pere_nom}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.pere_nom))}
              />
            )}
          </Field>
          <Field id="pere_prenom" label="الإسم" required error={errors.pere_prenom?.message}>
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("pere_prenom")}
                aria-invalid={!!errors.pere_prenom}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.pere_prenom))}
              />
            )}
          </Field>
        </TwoCols>

        <TwoCols>
          <Field
            id="pere_naissance_date"
            label="تاريخ الميلاد"
            error={errors.pere_naissance_date?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                type="date"
                {...register("pere_naissance_date")}
                aria-invalid={!!errors.pere_naissance_date}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.pere_naissance_date))}
              />
            )}
          </Field>
          <Field
            id="pere_naissance_lieu"
            label="مكان الميلاد"
            error={errors.pere_naissance_lieu?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("pere_naissance_lieu")}
                aria-invalid={!!errors.pere_naissance_lieu}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.pere_naissance_lieu))}
              />
            )}
          </Field>
        </TwoCols>

        <TwoCols>
          <Field
            id="pere_cin_numero"
            label="رقم بطاقة التعريف"
            error={errors.pere_cin_numero?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("pere_cin_numero")}
                aria-invalid={!!errors.pere_cin_numero}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.pere_cin_numero))}
                placeholder="8 أرقام"
              />
            )}
          </Field>
          <Field
            id="pere_cin_delivree_a"
            label="المسلّمة في"
            error={errors.pere_cin_delivree_a?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("pere_cin_delivree_a")}
                aria-invalid={!!errors.pere_cin_delivree_a}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.pere_cin_delivree_a))}
              />
            )}
          </Field>
        </TwoCols>

        <TwoCols>
          <Field
            id="pere_adresse"
            label="العنوان"
            required
            error={errors.pere_adresse?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("pere_adresse")}
                aria-invalid={!!errors.pere_adresse}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.pere_adresse))}
              />
            )}
          </Field>
          <Field
            id="pere_profession"
            label="المهنة"
            required
            error={errors.pere_profession?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("pere_profession")}
                aria-invalid={!!errors.pere_profession}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.pere_profession))}
              />
            )}
          </Field>
        </TwoCols>

        <TwoCols>
          <Field
            id="pere_tel_domicile"
            label="هاتف (منزل)"
            error={errors.pere_tel_domicile?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("pere_tel_domicile")}
                aria-invalid={!!errors.pere_tel_domicile}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.pere_tel_domicile))}
              />
            )}
          </Field>
          <Field
            id="pere_tel_travail"
            label="هاتف (عمل)"
            error={errors.pere_tel_travail?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("pere_tel_travail")}
                aria-invalid={!!errors.pere_tel_travail}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.pere_tel_travail))}
              />
            )}
          </Field>
        </TwoCols>

        <TwoCols>
          <Field
            id="pere_tel_portable"
            label="هاتف (جوال)"
            required
            error={errors.pere_tel_portable?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("pere_tel_portable")}
                aria-invalid={!!errors.pere_tel_portable}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.pere_tel_portable))}
              />
            )}
          </Field>
          <Field
            id="pere_email"
            label="البريد الإلكتروني"
            error={errors.pere_email?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                type="email"
                {...register("pere_email")}
                aria-invalid={!!errors.pere_email}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.pere_email))}
              />
            )}
          </Field>
        </TwoCols>
      </Section>

      <Section title="معلومات الأم">
        <TwoCols>
          <Field id="mere_nom" label="اللقب" required error={errors.mere_nom?.message}>
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("mere_nom")}
                aria-invalid={!!errors.mere_nom}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.mere_nom))}
              />
            )}
          </Field>
          <Field id="mere_prenom" label="الإسم" required error={errors.mere_prenom?.message}>
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("mere_prenom")}
                aria-invalid={!!errors.mere_prenom}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.mere_prenom))}
              />
            )}
          </Field>
        </TwoCols>

        <TwoCols>
          <Field
            id="mere_naissance_date"
            label="تاريخ الميلاد"
            error={errors.mere_naissance_date?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                type="date"
                {...register("mere_naissance_date")}
                aria-invalid={!!errors.mere_naissance_date}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.mere_naissance_date))}
              />
            )}
          </Field>
          <Field
            id="mere_naissance_lieu"
            label="مكان الميلاد"
            error={errors.mere_naissance_lieu?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("mere_naissance_lieu")}
                aria-invalid={!!errors.mere_naissance_lieu}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.mere_naissance_lieu))}
              />
            )}
          </Field>
        </TwoCols>

        <TwoCols>
          <Field
            id="mere_cin_numero"
            label="رقم بطاقة التعريف"
            error={errors.mere_cin_numero?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("mere_cin_numero")}
                aria-invalid={!!errors.mere_cin_numero}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.mere_cin_numero))}
                placeholder="8 أرقام"
              />
            )}
          </Field>
          <Field
            id="mere_cin_delivree_a"
            label="المسلّمة في"
            error={errors.mere_cin_delivree_a?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("mere_cin_delivree_a")}
                aria-invalid={!!errors.mere_cin_delivree_a}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.mere_cin_delivree_a))}
              />
            )}
          </Field>
        </TwoCols>

        <TwoCols>
          <Field
            id="mere_adresse"
            label="العنوان"
            required
            error={errors.mere_adresse?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("mere_adresse")}
                aria-invalid={!!errors.mere_adresse}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.mere_adresse))}
              />
            )}
          </Field>
          <Field
            id="mere_profession"
            label="المهنة"
            required
            error={errors.mere_profession?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("mere_profession")}
                aria-invalid={!!errors.mere_profession}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.mere_profession))}
              />
            )}
          </Field>
        </TwoCols>

        <TwoCols>
          <Field
            id="mere_tel_domicile"
            label="هاتف (منزل)"
            error={errors.mere_tel_domicile?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("mere_tel_domicile")}
                aria-invalid={!!errors.mere_tel_domicile}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.mere_tel_domicile))}
              />
            )}
          </Field>
          <Field
            id="mere_tel_travail"
            label="هاتف (عمل)"
            error={errors.mere_tel_travail?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("mere_tel_travail")}
                aria-invalid={!!errors.mere_tel_travail}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.mere_tel_travail))}
              />
            )}
          </Field>
        </TwoCols>

        <TwoCols>
          <Field
            id="mere_tel_portable"
            label="هاتف (جوال)"
            required
            error={errors.mere_tel_portable?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                {...register("mere_tel_portable")}
                aria-invalid={!!errors.mere_tel_portable}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.mere_tel_portable))}
              />
            )}
          </Field>
          <Field
            id="mere_email"
            label="البريد الإلكتروني"
            error={errors.mere_email?.message}
          >
            {({ id, describedBy }) => (
              <input
                id={id}
                type="email"
                {...register("mere_email")}
                aria-invalid={!!errors.mere_email}
                aria-describedby={describedBy}
                className={inputClass(Boolean(errors.mere_email))}
              />
            )}
          </Field>
        </TwoCols>
      </Section>
    </div>
  );
}
/* =========================
   Normalizers
   ========================= */
function normalizeFiche(values) {
  const toInt = (value) =>
    value === "" || value === null || typeof value === "undefined"
      ? null
      : Number(value);
  return {
    ...values,
    nb_freres: toInt(values.nb_freres),
    nb_soeurs: toInt(values.nb_soeurs),
    rang_enfant: toInt(values.rang_enfant),
  };
}

function normalizeParentsFiche(values) {
  const result = {};
  for (const key of Object.keys(values)) {
    result[key] = nullIfEmpty(values[key]);
  }
  delete result.atLeastOneContact;
  return result;
}

function pickValues(source, fields) {
  const out = {};
  fields.forEach((field) => {
    if (field === "atLeastOneContact") return;
    out[field] = source?.[field] ?? "";
  });
  return out;
}
