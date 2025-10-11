// src/components/dashboard/common/SelectAnnee.jsx
import { useQuery } from "@tanstack/react-query";
import { listAnnees } from "../../../api/annees";

export default function SelectAnnee({ value, onChange }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["annees"],
    queryFn: listAnnees,
  });

  const annees = data?.data || [];

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600">اختر السنة:</label>
      <select
        className="border rounded-lg px-3 py-2 bg-white"
        disabled={isLoading || isError}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">— الكل —</option>
        {annees.map((a) => (
          <option key={a.id} value={a.id}>
            {a.libelle} {a.est_active ? " (مفعّلة)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
