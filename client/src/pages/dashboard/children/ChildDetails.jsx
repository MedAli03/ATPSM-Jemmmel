// src/pages/dashboard/children/ChildDetails.jsx
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  getEnfantById,
  getFicheByEnfantId,
  getParentsFicheByEnfantId,
} from "../../../api/enfants";

import {
  useDeleteEnfant,
  useLinkParent,
  useUnlinkParent,
  useUpdateFiche,
  useUpdateParentsFiche,
} from "../../../hooks/useChildMutations";

import ConfirmDialog from "../../../components/common/ConfirmDialog";
import LinkParentModal from "../../../components/common/LinkParentModal";
import { useToast } from "../../../components/common/ToastProvider";

/* ========== Small UI helpers ========== */
function SectionCard({ title, children, actions }) {
  return (
    <div className="bg-white rounded-2xl shadow border">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ======================================
   Page
   ====================================== */
export default function ChildDetails() {
  const { id } = useParams();
  const enfantId = Number(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [tab, setTab] = useState("overview");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Link Parent modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkServerError, setLinkServerError] = useState("");

  // Queries (align keys with mutation invalidates)
  const enfantQ = useQuery({
    queryKey: ["enfant", enfantId],
    queryFn: () => getEnfantById(enfantId), // should return the enfant object
    enabled: Number.isFinite(enfantId) && enfantId > 0,
  });

  const ficheQ = useQuery({
    queryKey: ["fiche_enfant", enfantId],
    queryFn: () => getFicheByEnfantId(enfantId),
    enabled: !!enfantId,
  });

  const parentsQ = useQuery({
    queryKey: ["parents_fiche", enfantId],
    queryFn: () => getParentsFicheByEnfantId(enfantId),
    enabled: !!enfantId,
  });

  // Mutations
  const del = useDeleteEnfant();
  const link = useLinkParent();
  const unlink = useUnlinkParent();
  const updateFiche = useUpdateFiche();
  const updateParents = useUpdateParentsFiche();

  const loading = enfantQ.isLoading || ficheQ.isLoading || parentsQ.isLoading;
  const error = enfantQ.isError || ficheQ.isError || parentsQ.isError;

  const enfant = enfantQ.data || null;
  const fiche = ficheQ.data || null;
  const parents = parentsQ.data || null;

  const headerActions = useMemo(() => {
    if (!enfant) return null;
    return (
      <>
        {enfant.parent_user_id ? (
          <button
            onClick={() =>
              unlink.mutate(
                { enfantId },
                {
                  onSuccess: () => {
                    enfantQ.refetch();
                    toast?.("تم فك الارتباط بنجاح", "success");
                  },
                  onError: () => toast?.("تعذّر فك الارتباط", "error"),
                }
              )
            }
            className="px-3 py-2 rounded-xl border disabled:opacity-50"
            disabled={unlink.isPending}
          >
            {unlink.isPending ? "جارٍ الفك…" : "فكّ الربط مع الولي"}
          </button>
        ) : (
          <button
            onClick={() => {
              setLinkServerError("");
              setShowLinkModal(true);
            }}
            className="px-3 py-2 rounded-xl border"
          >
            ربط ولي
          </button>
        )}

        <button
          onClick={() => setConfirmDelete(true)}
          className="px-3 py-2 rounded-xl border border-rose-300 text-rose-700"
        >
          حذف
        </button>
      </>
    );
  }, [enfant, enfantId, unlink, enfantQ, toast]);

  return (
    <div className="p-4 md:p-6" dir="rtl">
      <div className="mb-4">
        <Link
          to="/dashboard/president/children"
          className="text-indigo-600 text-sm hover:underline"
        >
          ← الرجوع إلى القائمة
        </Link>
      </div>

      {/* Header */}
      <SectionCard title="ملف الطفل" actions={headerActions}>
        {loading && <div className="text-sm text-gray-500">جارٍ التحميل…</div>}
        {error && (
          <div className="text-sm text-rose-600">
            حدث خطأ أثناء الجلب. يرجى إعادة المحاولة.
          </div>
        )}
        {!loading && !error && enfant && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {enfant.prenom} {enfant.nom}
              </div>
              <div className="text-sm text-gray-600">
                تاريخ الولادة:{" "}
                {enfant.date_naissance
                  ? new Date(enfant.date_naissance).toLocaleDateString()
                  : "—"}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {enfant.parent_user_id ? (
                <span>ولي مرتبط: #{enfant.parent_user_id}</span>
              ) : (
                <span className="text-orange-600">لا يوجد ولي مرتبط</span>
              )}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Tabs */}
      <div className="mt-4 bg-white rounded-2xl shadow border">
        <div className="px-5 py-3 border-b">
          <div className="flex flex-wrap gap-2">
            {[
              ["overview", "نظرة عامة"],
              ["fiche", "سجلّ الطفل"],
              ["parents", "بطاقة الأولياء"],
              ["docs", "الوثائق"],
              ["history", "السجلّ"],
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
        </div>

        <div className="p-5">
          {tab === "overview" && (
            <OverviewTab enfant={enfant} fiche={fiche} parents={parents} />
          )}

          {tab === "fiche" && (
            <FicheForm
              initial={fiche}
              onSave={(payload) =>
                new Promise((resolve, reject) => {
                  updateFiche.mutate(
                    { enfantId, payload },
                    {
                      onSuccess: () => {
                        ficheQ.refetch();
                        resolve();
                      },
                      onError: reject,
                    }
                  );
                })
              }
              isSaving={updateFiche.isPending}
            />
          )}

          {tab === "parents" && (
            <ParentsFicheForm
              initial={parents}
              onSave={(payload) =>
                new Promise((resolve, reject) => {
                  updateParents.mutate(
                    { enfantId, payload },
                    {
                      onSuccess: () => {
                        parentsQ.refetch();
                        resolve();
                      },
                      onError: reject,
                    }
                  );
                })
              }
              isSaving={updateParents.isPending}
            />
          )}

          {tab === "docs" && <DocsStub />}
          {tab === "history" && <HistoryStub />}
        </div>
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        open={confirmDelete}
        title="حذف الطفل؟"
        description="سيتم حذف الطفل وكل سجلاته المرتبطة."
        confirmText="حذف"
        cancelText="إلغاء"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() =>
          del.mutate(enfantId, {
            onSuccess: () => {
              toast?.("تم حذف الملف بنجاح", "success");
              navigate("/dashboard/president/children");
            },
            onError: () => toast?.("تعذّر حذف الملف", "error"),
          })
        }
      />

      {/* Link Parent modal */}
      <LinkParentModal
        open={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        isSubmitting={link.isPending}
        serverError={linkServerError}
        onSubmit={({ parent_user_id }) => {
          setLinkServerError("");
          link.mutate(
            { enfantId, parent_user_id },
            {
              onSuccess: () => {
                setShowLinkModal(false);
                enfantQ.refetch();
                parentsQ.refetch();
                toast?.("تم الربط بنجاح", "success");
              },
              onError: (e) => {
                const msg =
                  e?.response?.data?.message ||
                  e?.message ||
                  "تعذر إتمام عملية الربط، يرجى المحاولة مرة أخرى.";
                setLinkServerError(msg);
                toast?.("تعذر إتمام عملية الربط", "error");
              },
            }
          );
        }}
      />
    </div>
  );
}

/* ======================================
   Tabs content (minimal forms, Arabic)
   ====================================== */

function OverviewTab({ enfant, fiche, parents }) {
  if (!enfant) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl border bg-gray-50">
        <div className="text-xs text-gray-500 mb-1">الطفل</div>
        <div className="text-sm text-gray-800">
          {enfant.prenom} {enfant.nom}
        </div>
        <div className="text-sm text-gray-600">
          {enfant.date_naissance
            ? new Date(enfant.date_naissance).toLocaleDateString()
            : "—"}
        </div>
      </div>

      <div className="p-4 rounded-xl border bg-gray-50">
        <div className="text-xs text-gray-500 mb-1">سجلّ الطفل</div>
        {fiche ? (
          <ul className="text-sm text-gray-800 space-y-1">
            <li>مكان الولادة: {fiche.lieu_naissance || "—"}</li>
            <li>التشخيص الطبي: {fiche.diagnostic_medical || "—"}</li>
            <li>نوع الإعاقة: {fiche.type_handicap || "—"}</li>
          </ul>
        ) : (
          <div className="text-sm text-gray-500">لا توجد معطيات بعد.</div>
        )}
      </div>

      <div className="p-4 rounded-xl border bg-gray-50">
        <div className="text-xs text-gray-500 mb-1">الأولياء</div>
        {parents ? (
          <ul className="text-sm text-gray-800 space-y-1">
            <li>
              الأب:{" "}
              {parents.pere_nom
                ? `${parents.pere_prenom || ""} ${parents.pere_nom}`.trim()
                : "—"}
            </li>
            <li>
              الأم:{" "}
              {parents.mere_nom
                ? `${parents.mere_prenom || ""} ${parents.mere_nom}`.trim()
                : "—"}
            </li>
            <li>
              هاتف:{" "}
              {parents.pere_tel_portable || parents.mere_tel_portable || "—"}
            </li>
          </ul>
        ) : (
          <div className="text-sm text-gray-500">لا توجد معطيات بعد.</div>
        )}
      </div>
    </div>
  );
}

/* ---------- Forms with toast feedback ---------- */

function FicheForm({ initial, onSave, isSaving }) {
  const toast = useToast();
  const [state, setState] = useState({
    lieu_naissance: initial?.lieu_naissance || "",
    diagnostic_medical: initial?.diagnostic_medical || "",
    nb_freres: initial?.nb_freres ?? "",
    nb_soeurs: initial?.nb_soeurs ?? "",
    rang_enfant: initial?.rang_enfant ?? "",
    situation_familiale: initial?.situation_familiale || "",
    diag_auteur_nom: initial?.diag_auteur_nom || "",
    diag_auteur_description: initial?.diag_auteur_description || "",
    carte_invalidite_numero: initial?.carte_invalidite_numero || "",
    carte_invalidite_couleur: initial?.carte_invalidite_couleur || "",
    type_handicap: initial?.type_handicap || "",
    troubles_principaux: initial?.troubles_principaux || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave({
        ...state,
        nb_freres: state.nb_freres === "" ? null : Number(state.nb_freres),
        nb_soeurs: state.nb_soeurs === "" ? null : Number(state.nb_soeurs),
        rang_enfant:
          state.rang_enfant === "" ? null : Number(state.rang_enfant),
      });
      toast?.("تم الحفظ بنجاح ✅", "success");
    } catch {
      toast?.("فشل في الحفظ ❌", "error");
    }
  };

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      onSubmit={handleSubmit}
    >
      {[
        ["lieu_naissance", "مكان الولادة"],
        ["diagnostic_medical", "التشخيص الطبي"],
        ["type_handicap", "نوع الإعاقة"],
        ["diag_auteur_nom", "اسم مُصدر التشخيص"],
        ["diag_auteur_description", "وصف مُصدر التشخيص"],
        ["carte_invalidite_numero", "رقم بطاقة الإعاقة"],
        ["carte_invalidite_couleur", "لون بطاقة الإعاقة"],
      ].map(([key, label]) => (
        <label key={key} className="flex flex-col gap-1">
          <span className="text-sm text-gray-700">{label}</span>
          <input
            className="rounded-xl border px-3 py-2"
            value={state[key] ?? ""}
            onChange={(e) => setState((s) => ({ ...s, [key]: e.target.value }))}
          />
        </label>
      ))}

      {[
        ["nb_freres", "عدد الإخوة"],
        ["nb_soeurs", "عدد الأخوات"],
        ["rang_enfant", "ترتيب الطفل"],
      ].map(([key, label]) => (
        <label key={key} className="flex flex-col gap-1">
          <span className="text-sm text-gray-700">{label}</span>
          <input
            type="number"
            className="rounded-xl border px-3 py-2"
            value={state[key] ?? ""}
            onChange={(e) => setState((s) => ({ ...s, [key]: e.target.value }))}
          />
        </label>
      ))}

      <label className="flex flex-col gap-1 md:col-span-2">
        <span className="text-sm text-gray-700">الوضعية العائلية</span>
        <select
          className="rounded-xl border px-3 py-2 bg-white"
          value={state.situation_familiale}
          onChange={(e) =>
            setState((s) => ({ ...s, situation_familiale: e.target.value }))
          }
        >
          <option value="">—</option>
          <option value="deux_parents">والدان</option>
          <option value="pere_seul">أب فقط</option>
          <option value="mere_seule">أم فقط</option>
          <option value="autre">أخرى</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 md:col-span-2">
        <span className="text-sm text-gray-700">الاضطرابات الرئيسية</span>
        <textarea
          rows={4}
          className="rounded-xl border px-3 py-2"
          value={state.troubles_principaux}
          onChange={(e) =>
            setState((s) => ({ ...s, troubles_principaux: e.target.value }))
          }
        />
      </label>

      <div className="md:col-span-2 flex justify-end gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50"
        >
          {isSaving ? "جارٍ الحفظ…" : "حفظ"}
        </button>
      </div>
    </form>
  );
}

function ParentsFicheForm({ initial, onSave, isSaving }) {
  const toast = useToast();
  const [state, setState] = useState({
    // father
    pere_nom: initial?.pere_nom || "",
    pere_prenom: initial?.pere_prenom || "",
    pere_tel_portable: initial?.pere_tel_portable || "",
    pere_email: initial?.pere_email || "",
    // mother
    mere_nom: initial?.mere_nom || "",
    mere_prenom: initial?.mere_prenom || "",
    mere_tel_portable: initial?.mere_tel_portable || "",
    mere_email: initial?.mere_email || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(state);
      toast?.("تم الحفظ بنجاح ✅", "success");
    } catch {
      toast?.("فشل في الحفظ ❌", "error");
    }
  };

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      onSubmit={handleSubmit}
    >
      <div className="md:col-span-2 text-sm text-gray-600">
        أدخل أهم بيانات التواصل؛ يمكن إكمال التفاصيل لاحقًا.
      </div>

      {[
        ["pere_nom", "لقب الأب"],
        ["pere_prenom", "اسم الأب"],
        ["pere_tel_portable", "هاتف الأب"],
        ["pere_email", "بريد الأب"],
        ["mere_nom", "لقب الأم"],
        ["mere_prenom", "اسم الأم"],
        ["mere_tel_portable", "هاتف الأم"],
        ["mere_email", "بريد الأم"],
      ].map(([key, label]) => (
        <label key={key} className="flex flex-col gap-1">
          <span className="text-sm text-gray-700">{label}</span>
          <input
            className="rounded-xl border px-3 py-2"
            value={state[key] ?? ""}
            onChange={(e) => setState((s) => ({ ...s, [key]: e.target.value }))}
          />
        </label>
      ))}

      <div className="md:col-span-2 flex justify-end gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50"
        >
          {isSaving ? "جارٍ الحفظ…" : "حفظ"}
        </button>
      </div>
    </form>
  );
}

/* ---------- Coming soon stubs ---------- */
function DocsStub() {
  return (
    <div className="text-sm text-gray-600">
      قادمًا: جدول وثائق مع رفع/تنزيل ومعاينة.
    </div>
  );
}
function HistoryStub() {
  return (
    <div className="text-sm text-gray-600">
      قادمًا: سجلّ التغييرات والأنشطة.
    </div>
  );
}
