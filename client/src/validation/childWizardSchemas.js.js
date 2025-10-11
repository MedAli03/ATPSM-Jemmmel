// src/validations/enfantWizardSchemas.js
import * as yup from "yup";

/**
 * Arabic messages (global)
 */
yup.setLocale({
  mixed: {
    required: "هذا الحقل إجباري",
  },
  string: {
    min: ({ min }) => `يجب ألا يقل الطول عن ${min} أحرف`,
    max: ({ max }) => `يجب ألا يزيد الطول عن ${max} أحرف`,
    email: "صيغة البريد الإلكتروني غير صحيحة",
  },
  number: {
    integer: "يجب أن يكون عددًا صحيحًا",
    positive: "يجب أن يكون رقمًا موجبًا",
    min: ({ min }) => `يجب أن يكون على الأقل ${min}`,
    max: ({ max }) => `يجب ألا يتجاوز ${max}`,
  },
  date: {
    max: ({ max }) => `التاريخ يجب أن يكون قبل ${max}`,
  },
});

/**
 * Helpers
 */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/; // <input type="date"> → "YYYY-MM-DD"

/**
 * STEP 1 — Enfant (creation payload)
 * Backend (Joi) requires: nom, prenom, date_naissance (ISO)
 * Optional: parent_user_id: number | null
 */
export const enfantSchema = yup.object({
  nom: yup.string().trim().max(100, "اللقب طويل جدًا (100)").required("اللقب إجباري"),
  prenom: yup.string().trim().max(100, "الاسم طويل جدًا (100)").required("الاسم إجباري"),
  // we validate date as string "YYYY-MM-DD" (ISO-like) to match HTML date input & Joi .iso()
  date_naissance: yup
    .string()
    .required("تاريخ الميلاد إجباري")
    .matches(ISO_DATE_RE, "الرجاء اختيار تاريخ صالح بالصيغة YYYY-MM-DD"),
  parent_user_id: yup
    .number()
    .typeError("معرّف الولي يجب أن يكون رقمًا")
    .integer("يجب أن يكون عددًا صحيحًا")
    .positive("يجب أن يكون رقمًا موجبًا")
    .nullable()
    .optional(),
});

/**
 * STEP 2 — Fiche Enfant (upsert)
 * Adjust required fields to your current business rules.
 * Below are common optional fields — make required where needed.
 */
export const ficheSchema = yup
  .object({
    groupe_sanguin: yup.string().trim().nullable(),
    allergies: yup.string().trim().nullable(),
    notes_medicales: yup.string().trim().nullable(),
  })
  .required();

/**
 * STEP 3 — Parents Fiche (upsert)
 * Rule: At least ONE contact method (phone or email for father or mother).
 */
export const parentsFicheSchema = yup
  .object({
    pere_nom: yup.string().trim().nullable(),
    pere_tel: yup.string().trim().nullable(),
    pere_email: yup.string().trim().email("بريد الأب غير صالح").nullable(),

    mere_nom: yup.string().trim().nullable(),
    mere_tel: yup.string().trim().nullable(),
    mere_email: yup.string().trim().email("بريد الأم غير صالح").nullable(),

    adresse: yup.string().trim().nullable(),
  })
  .test(
    "at-least-one-contact",
    "يجب توفير وسيلة تواصل واحدة على الأقل (هاتف أو بريد لأحد الأولياء)",
    (value) => {
      if (!value) return false;
      const hasFather =
        (value.pere_tel && value.pere_tel.trim() !== "") ||
        (value.pere_email && value.pere_email.trim() !== "");
      const hasMother =
        (value.mere_tel && value.mere_tel.trim() !== "") ||
        (value.mere_email && value.mere_email.trim() !== "");
      return hasFather || hasMother;
    }
  )
  .required();

/**
 * Export an array to easily switch the resolver by step in the wizard.
 * (0) enfantSchema → step 1
 * (1) ficheSchema → step 2
 * (2) parentsFicheSchema → step 3
 */
export const wizardStepSchemas = [enfantSchema, ficheSchema, parentsFicheSchema];
