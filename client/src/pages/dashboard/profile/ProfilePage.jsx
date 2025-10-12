import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UNSAFE_NavigationContext, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../components/common/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { useToast } from "../../../components/common/ToastProvider";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchMe,
  fetchRecentSessions,
  updateAvatar,
  updateMe,
  updatePassword,
} from "../../../api/me";

const allowedRoles = new Set(["DIRECTEUR", "PRESIDENT"]);

const profileSchema = yup.object({
  prenom: yup
    .string()
    .required("الاسم مطلوب")
    .max(100, "يجب ألا يتجاوز 100 حرف"),
  nom: yup
    .string()
    .required("اللقب مطلوب")
    .max(100, "يجب ألا يتجاوز 100 حرف"),
  email: yup
    .string()
    .transform((value) => (value && value.trim() === "" ? null : value?.trim()))
    .nullable()
    .email("بريد إلكتروني غير صالح"),
  phone: yup
    .string()
    .transform((value) => (value && value.trim() === "" ? null : value?.trim()))
    .nullable()
    .matches(/^[0-9+()\-\s]{7,20}$/u, "رقم هاتف غير صالح"),
  adresse: yup
    .string()
    .transform((value) => (value && value.trim() === "" ? null : value?.trim()))
    .nullable()
    .max(250, "يجب ألا يتجاوز 250 حرف"),
});

const passwordSchema = yup.object({
  current_password: yup
    .string()
    .required("كلمة السر الحالية مطلوبة")
    .min(6, "على الأقل 6 محارف"),
  new_password: yup
    .string()
    .required("كلمة السر الجديدة مطلوبة")
    .min(8, "على الأقل 8 محارف")
    .notOneOf([yup.ref("current_password")], "يجب أن تختلف عن الحالية"),
});

function toFormValues(data) {
  return {
    prenom: data?.prenom ?? "",
    nom: data?.nom ?? "",
    email: data?.email ?? "",
    phone: data?.phone ?? "",
    adresse: data?.adresse ?? "",
  };
}

function formatDateTime(input) {
  if (!input) return "-";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "-";
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeSessions(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.sessions)) return raw.sessions;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.results)) return raw.results;
  return [];
}

function useNavigationPrompt(when) {
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const [open, setOpen] = useState(false);
  const txRef = useRef(null);

  useEffect(() => {
    if (!when || typeof navigator?.block !== "function") {
      return undefined;
    }

    const unblock = navigator.block((tx) => {
      setOpen(true);
      txRef.current = tx;
    });

    return () => {
      unblock();
      txRef.current = null;
    };
  }, [navigator, when]);

  useEffect(() => {
    if (!when && open) {
      setOpen(false);
      txRef.current = null;
    }
  }, [when, open]);

  useEffect(() => {
    if (!when) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [when]);

  const confirm = () => {
    setOpen(false);
    const tx = txRef.current;
    txRef.current = null;
    tx?.retry?.();
  };

  const cancel = () => {
    setOpen(false);
    txRef.current = null;
  };

  return { open, confirm, cancel };
}

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const normalizedRole = String(currentUser?.role || "").toUpperCase();
  const canAccess = allowedRoles.has(normalizedRole);

  useEffect(() => {
    if (!currentUser) return;
    if (canAccess) return;
    const fallback = normalizedRole === "PRESIDENT"
      ? "/dashboard/president"
      : normalizedRole === "DIRECTEUR"
      ? "/dashboard/manager"
      : "/";
    navigate(fallback, { replace: true, state: { from: location } });
  }, [currentUser, canAccess, normalizedRole, navigate, location]);

  const profileForm = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: toFormValues(null),
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = profileForm;

  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: { current_password: "", new_password: "" },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = passwordForm;

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled: canAccess,
    onError: () => toast("تعذر تحميل بيانات الملف الشخصي", "error"),
  });

  const sessionsQuery = useQuery({
    queryKey: ["me", "sessions"],
    queryFn: () => fetchRecentSessions(10),
    enabled: !!meQuery.data,
    staleTime: 60_000,
    onError: () => toast("تعذر تحميل الجلسات الأخيرة", "error"),
  });

  useEffect(() => {
    if (meQuery.data) {
      reset(toFormValues(meQuery.data));
    }
  }, [meQuery.data, reset]);

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  const updateProfileMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (data, variables) => {
      const snapshot = {
        ...(meQuery.data || {}),
        ...variables,
        ...(data || {}),
      };
      queryClient.setQueryData(["me"], snapshot);
      reset(toFormValues(snapshot));
      toast("تم الحفظ");
    },
    onError: () => toast("تعذر حفظ التغييرات", "error"),
  });

  const avatarMutation = useMutation({
    mutationFn: updateAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast("تم تحديث الصورة");
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: () => toast("تعذر تحديث الصورة", "error"),
  });

  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast("تم تغيير كلمة السر");
      resetPasswordForm({ current_password: "", new_password: "" });
      setPasswordModalOpen(false);
    },
    onError: () => toast("تعذر تغيير كلمة السر", "error"),
  });

  const submitProfile = handleSubmit((values) => {
    const payload = {
      nom: values.nom.trim(),
      prenom: values.prenom.trim(),
      email: values.email?.trim() || null,
      phone: values.phone?.trim() || null,
      adresse: values.adresse?.trim() || null,
    };
    updateProfileMutation.mutate(payload);
  });

  const submitPassword = handlePasswordSubmit((values) => {
    passwordMutation.mutate(values);
  });

  const resetForm = () => {
    reset(toFormValues(meQuery.data));
  };

  const hasPendingAvatar = !!avatarFile && !avatarMutation.isPending;
  const hasDirtyForm = isDirty && !updateProfileMutation.isPending;
  const shouldBlockNavigation = canAccess && (hasPendingAvatar || hasDirtyForm);

  const { open: leaveOpen, confirm: confirmLeave, cancel: cancelLeave } =
    useNavigationPrompt(shouldBlockNavigation);

  if (currentUser && !canAccess) {
    return null;
  }

  const isLoading = meQuery.isLoading;
  const hasError = meQuery.isError;
  const profile = meQuery.data;
  const sessions = useMemo(
    () => normalizeSessions(sessionsQuery.data).slice(0, 10),
    [sessionsQuery.data]
  );

  const profileRole = String(profile?.role || normalizedRole || "").toUpperCase();
  const roleMeta =
    profileRole === "PRESIDENT"
      ? {
          text: "الرئيس",
          classes: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        }
      : profileRole === "DIRECTEUR"
      ? {
          text: "المدير",
          classes: "bg-indigo-100 text-indigo-700 border border-indigo-200",
        }
      : {
          text: profileRole || "—",
          classes: "bg-gray-100 text-gray-600 border border-gray-200",
        };

  const fullName = profile
    ? `${profile.prenom ?? ""} ${profile.nom ?? ""}`.trim()
    : "";

  const initials = fullName
    ? fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
    : "؟";

  const onSelectAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("الرجاء اختيار صورة بصيغة صحيحة", "error");
      event.target.value = "";
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setAvatarFile(file);
  };

  const handleAvatarUpload = () => {
    if (!avatarFile) return;
    avatarMutation.mutate(avatarFile);
  };

  const handleAvatarCancel = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const inputClass =
    "mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="mx-auto max-w-6xl space-y-6" dir="rtl">
      <div className="space-y-2">
        <nav aria-label="مسار التنقل" className="text-sm text-gray-500">
          <ol className="flex items-center gap-2">
            <li className="text-gray-500">لوحة التحكم</li>
            <li className="text-gray-400">/</li>
            <li className="font-medium text-gray-900">الملف الشخصي</li>
          </ol>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
        <p className="text-sm text-gray-500">
          حدّث معلوماتك الشخصية، غيّر كلمة السر، وتابع جلساتك الأخيرة.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="lg:col-span-1">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 lg:sticky lg:top-20">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="mx-auto h-28 w-28 rounded-full bg-gray-200" />
                <div className="mx-auto h-4 w-32 rounded-full bg-gray-200" />
                <div className="mx-auto h-3 w-20 rounded-full bg-gray-200" />
                <div className="space-y-2 pt-4">
                  <div className="h-10 rounded-xl bg-gray-100" />
                  <div className="h-10 rounded-xl bg-gray-100" />
                </div>
              </div>
            ) : hasError ? (
              <div className="space-y-3 text-center">
                <p className="text-sm text-rose-600">حدث خطأ أثناء تحميل البيانات.</p>
                <button
                  type="button"
                  onClick={() => meQuery.refetch()}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : (
              <div className="space-y-5 text-center">
                <div className="relative mx-auto h-28 w-28">
                  <div className="h-full w-full overflow-hidden rounded-full border-4 border-white shadow-lg">
                    {avatarPreview || profile?.avatar_url ? (
                      <img
                        src={avatarPreview || profile?.avatar_url}
                        alt={fullName || "الصورة الشخصية"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-200 to-indigo-400 text-xl font-bold text-white">
                        {initials}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{fullName || "—"}</h2>
                  <span
                    className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${roleMeta.classes}`}
                  >
                    {roleMeta.text}
                  </span>
                </div>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    تحديث الصورة
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(true)}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    تغيير كلمة السر
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onSelectAvatar}
                    aria-label="اختيار صورة جديدة"
                  />
                </div>

                {avatarPreview ? (
                  <div className="space-y-3 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-4 text-start">
                    <p className="text-xs font-medium text-indigo-700">
                      تمت إضافة صورة جديدة. هل ترغب في حفظها؟
                    </p>
                    <div className="overflow-hidden rounded-xl border border-white shadow">
                      <img
                        src={avatarPreview}
                        alt="معاينة الصورة"
                        className="h-32 w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleAvatarUpload}
                        disabled={avatarMutation.isPending}
                        className="inline-flex flex-1 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                      >
                        {avatarMutation.isPending ? "جارٍ الرفع…" : "حفظ الصورة"}
                      </button>
                      <button
                        type="button"
                        onClick={handleAvatarCancel}
                        className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </aside>

        <section className="lg:col-span-2">
          <div className="rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
            <div className="flex flex-wrap gap-2 border-b border-gray-100 px-6 py-4">
              <TabButton
                id="basic"
                label="المعلومات الأساسية"
                activeTab={activeTab}
                onSelect={setActiveTab}
              />
              <TabButton
                id="account"
                label="معلومات الحساب"
                activeTab={activeTab}
                onSelect={setActiveTab}
              />
              <TabButton
                id="sessions"
                label="الجلسات الأخيرة"
                activeTab={activeTab}
                onSelect={setActiveTab}
              />
            </div>
            <TabPanels
              activeTab={activeTab}
              isLoading={isLoading}
              hasError={hasError}
              profile={profile}
              register={register}
              errors={errors}
              inputClass={inputClass}
              submitProfile={submitProfile}
              resetForm={resetForm}
              isSaving={updateProfileMutation.isPending}
              sessionsQuery={sessionsQuery}
              sessions={sessions}
            />
          </div>
        </section>
      </div>

      <Modal
        open={passwordModalOpen}
        onClose={() => {
          if (passwordMutation.isPending) return;
          setPasswordModalOpen(false);
        }}
        title="تغيير كلمة السر"
        description="أدخل كلمة السر الحالية والجديدة لحماية حسابك."
      >
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              كلمة السر الحالية
            </label>
            <input
              type="password"
              {...registerPassword("current_password")}
              className={inputClass}
              autoComplete="current-password"
            />
            {passwordErrors.current_password ? (
              <p className="mt-1 text-xs text-rose-600">
                {passwordErrors.current_password.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              كلمة السر الجديدة
            </label>
            <input
              type="password"
              {...registerPassword("new_password")}
              className={inputClass}
              autoComplete="new-password"
            />
            {passwordErrors.new_password ? (
              <p className="mt-1 text-xs text-rose-600">
                {passwordErrors.new_password.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                resetPasswordForm({ current_password: "", new_password: "" });
                setPasswordModalOpen(false);
              }}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:flex-none"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => submitPassword()}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-400 sm:flex-none"
              disabled={passwordMutation.isPending}
            >
              {passwordMutation.isPending ? "جارٍ الحفظ…" : "تحديث"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={leaveOpen}
        title="تغييرات غير محفوظة"
        description="لديك تغييرات غير محفوظة. هل ترغب بمغادرة الصفحة؟"
        confirmText="مغادرة"
        cancelText="البقاء"
        onClose={cancelLeave}
        onConfirm={confirmLeave}
      />
    </div>
  );
}

function TabButton({ id, label, activeTab, onSelect }) {
  const isActive = activeTab === id;
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
        isActive
          ? "bg-indigo-600 text-white shadow"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

function TabPanels({
  activeTab,
  isLoading,
  hasError,
  profile,
  register,
  errors,
  inputClass,
  submitProfile,
  resetForm,
  isSaving,
  sessionsQuery,
  sessions,
}) {
  if (isLoading) {
    return (
      <div className="space-y-4 px-6 py-8">
        <div className="h-4 w-1/2 rounded-full bg-gray-100 animate-pulse" />
        <div className="h-4 w-full rounded-full bg-gray-100 animate-pulse" />
        <div className="h-4 w-2/3 rounded-full bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="px-6 py-8 text-sm text-rose-600">
        تعذر تحميل المعلومات. حاول مرة أخرى لاحقًا.
      </div>
    );
  }

  if (activeTab === "account") {
    return (
      <div className="space-y-4 px-6 py-8">
        <InfoRow label="اسم المستخدم / المعرّف" value={profile?.username} mono />
        <InfoRow label="الدور" value={profile?.role === "PRESIDENT" ? "الرئيس" : profile?.role === "DIRECTEUR" ? "المدير" : profile?.role || "—"} />
        <InfoRow label="آخر تسجيل دخول" value={formatDateTime(profile?.last_login)} />
        <InfoRow label="تاريخ الإنشاء" value={formatDateTime(profile?.created_at)} />
      </div>
    );
  }

  if (activeTab === "sessions") {
    if (sessionsQuery.isLoading) {
      return (
        <div className="px-6 py-8">
          <div className="h-4 w-40 rounded-full bg-gray-100 animate-pulse" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-10 rounded-xl bg-gray-50 animate-pulse" />
            ))}
          </div>
        </div>
      );
    }

    if (sessionsQuery.isError) {
      return (
        <div className="px-6 py-8 text-sm text-rose-600">
          تعذر تحميل الجلسات الأخيرة.
        </div>
      );
    }

    if (!sessions.length) {
      return (
        <div className="px-6 py-8 text-sm text-gray-500">
          لا توجد جلسات حديثة متاحة.
        </div>
      );
    }

    return (
      <div className="px-4 py-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-right text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3">
                  المتصفح / المنصة
                </th>
                <th scope="col" className="px-4 py-3">
                  عنوان IP
                </th>
                <th scope="col" className="px-4 py-3">
                  الوقت
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((session, index) => (
                <tr key={session.id || index} className="text-gray-700">
                  <td className="px-4 py-3">
                    {session.browser || session.platform || session.device || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {session.ip || session.ip_address || session.ipAddress || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {formatDateTime(session.time || session.created_at || session.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
      }}
      className="space-y-6 px-6 py-8"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            الاسم
          </label>
          <input {...register("prenom")} className={inputClass} />
          {errors.prenom ? (
            <p className="mt-1 text-xs text-rose-600">{errors.prenom.message}</p>
          ) : null}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            اللقب
          </label>
          <input {...register("nom")} className={inputClass} />
          {errors.nom ? (
            <p className="mt-1 text-xs text-rose-600">{errors.nom.message}</p>
          ) : null}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            {...register("email")}
            className={inputClass}
            autoComplete="email"
          />
          {errors.email ? (
            <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
          ) : null}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            الهاتف (جوال)
          </label>
          <input {...register("phone")} className={inputClass} />
          {errors.phone ? (
            <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>
          ) : null}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          العنوان
        </label>
        <textarea
          rows={3}
          {...register("adresse")}
          className={`${inputClass} min-h-[96px]`}
        />
        {errors.adresse ? (
          <p className="mt-1 text-xs text-rose-600">{errors.adresse.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:flex-none"
        >
          إعادة التعيين
        </button>
        <button
          type="button"
          onClick={() => submitProfile()}
          disabled={isSaving}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-400 sm:flex-none"
        >
          {isSaving ? "جارٍ الحفظ…" : "حفظ"}
        </button>
      </div>
    </form>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
      <span className="text-xs font-semibold text-gray-500">{label}</span>
      <span
        className={`text-sm text-gray-900 ${mono ? "font-mono break-all" : ""}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}
