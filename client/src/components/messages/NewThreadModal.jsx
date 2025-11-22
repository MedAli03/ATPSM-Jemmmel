import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Modal from "../common/Modal";
import { listUsers } from "../../api/users";
import { useToast } from "../common/ToastProvider";
import { messagingApi } from "../../services/messagingApi";
import { useAuth } from "../../context/AuthContext";

const ROLE_OPTIONS = [
  { value: "", label: "كل الأدوار" },
  { value: "EDUCATEUR", label: "مربٍ" },
  { value: "PARENT", label: "ولي" },
  { value: "DIRECTEUR", label: "مدير" },
  { value: "PRESIDENT", label: "رئيس" },
];

export default function NewThreadModal({ open, onClose, onCreated }) {
  const toast = useToast();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelected(new Set());
      setMessage("");
      setTitle("");
      setSearch("");
      setDebouncedSearch("");
      setRole("");
    }
  }, [open]);

  const recipientsQuery = useQuery({
    queryKey: ["messaging", "recipients", { q: debouncedSearch, role }],
    queryFn: async () => {
      const { items } = await listUsers({ q: debouncedSearch, role, pageSize: 50 });
      return items;
    },
    enabled: open,
    staleTime: 10_000,
  });

  const recipients = useMemo(() => {
    const rows = recipientsQuery.data || [];
    if (!currentUser) return rows;
    return rows.filter((u) => Number(u.id) !== Number(currentUser.id));
  }, [recipientsQuery.data, currentUser]);

  const toggleRecipient = (id) => {
    const target = Number(id);
    if (!Number.isFinite(target)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(target)) {
        next.delete(target);
      } else {
        next.add(target);
      }
      return next;
    });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      messagingApi.createThread({
        participantIds: Array.from(selected),
        title: title.trim() || null,
        text: message.trim(),
        isGroup: selected.size > 1,
      }),
    onSuccess: (data) => {
      toast?.("تم إنشاء المحادثة وإرسال الرسالة الأولى", "success");
      onCreated?.(data?.thread, data?.message);
      onClose?.();
    },
    onError: (error) => {
      const serverMessage = error?.response?.data?.message || "تعذّر إنشاء المحادثة";
      toast?.(serverMessage, "error");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selected.size || !message.trim()) {
      toast?.("اختر مستلمين واكتب رسالة", "warning");
      return;
    }
    createMutation.mutate();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="محادثة جديدة"
      description="اختر المستخدمين وأرسل رسالة افتتاحية"
      size="xl"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">بحث</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو البريد"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">تصفية حسب الدور</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
            <span>المستلمون المحتملون</span>
            {recipientsQuery.isFetching ? <span className="text-xs text-slate-400">...جاري التحميل</span> : null}
          </div>
          <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
            {recipients.map((user) => {
              const userId = Number(user.id);
              const fullName = [user.prenom, user.nom].filter(Boolean).join(" ") || user.email;
              const checked = selected.has(userId);
              return (
                <label
                  key={user.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 text-sm shadow-sm transition ${
                    checked
                      ? "border-primary-400 bg-primary-50"
                      : "border-slate-200 bg-white hover:border-primary-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRecipient(userId)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{fullName}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    {user.phone ? (
                      <p className="text-[11px] text-slate-400">هاتف: {user.phone}</p>
                    ) : null}
                  </div>
                </label>
              );
            })}
            {!recipientsQuery.isLoading && recipients.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
                لا توجد نتائج مطابقة للبحث الحالي.
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">عنوان (اختياري)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: رسالة للطاقم التربوي"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">عدد المختارين</label>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner">
              {selected.size} مستلم/مستلمين
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">الرسالة الافتتاحية</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="اكتب محتوى الرسالة هنا"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
          <p className="text-[11px] text-slate-500">سيتم إنشاء المحادثة وإرسال هذه الرسالة كأول رسالة.</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
          >
            {createMutation.isPending ? "جاري الإرسال…" : "إنشاء وإرسال"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
