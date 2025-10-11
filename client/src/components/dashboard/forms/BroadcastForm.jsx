// src/components/dashboard/forms/BroadcastForm.jsx
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { broadcast } from "../../../api/dashboard.president";

const ROLES = ["ALL", "PRESIDENT", "DIRECTEUR", "EDUCATEUR", "PARENT"];

export default function BroadcastForm() {
  const [role, setRole] = useState("ALL");
  const [type, setType] = useState("ACTUALITE");
  const [titre, setTitre] = useState("");
  const [corps, setCorps] = useState("");

  const mut = useMutation({
    mutationFn: () => broadcast({ role, type, titre, corps }),
  });

  return (
    <form
      className="bg-white border rounded-xl p-4 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!titre || !corps) return;
        mut.mutate(undefined, {
          onSuccess: () => {
            setTitre("");
            setCorps("");
            alert("تم الإرسال بنجاح");
          },
        });
      }}
    >
      <div className="font-semibold">بثّ إشعار</div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">الدور</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">النوع</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="ACTUALITE">ACTUALITE</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">العنوان</label>
        <input
          className="w-full border rounded-lg px-3 py-2"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="اكتب عنوان الإشعار"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">النص</label>
        <textarea
          className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
          value={corps}
          onChange={(e) => setCorps(e.target.value)}
          placeholder="اكتب نص الإشعار هنا"
        />
      </div>

      <button
        disabled={mut.isPending}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
      >
        {mut.isPending ? "جارٍ الإرسال..." : "إرسال"}
      </button>

      {mut.isError && (
        <div className="text-red-600 text-sm mt-2">
          فشل الإرسال:{" "}
          {mut.error?.response?.data?.message || mut.error?.message}
        </div>
      )}
    </form>
  );
}
