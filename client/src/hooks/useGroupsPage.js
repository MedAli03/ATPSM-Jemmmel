// src/hooks/useGroupsPage.js
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function useGroupsPage() {
  const [sp, setSp] = useSearchParams();

  const anneeId = sp.get("anneeId") ? Number(sp.get("anneeId")) : undefined;
  const statut = sp.get("statut") || "actif"; // default to active
  const search = sp.get("search") || "";
  const page = Math.max(1, Number(sp.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") || 10)));

  const [draftSearch, setDraftSearch] = useState(search);

  useEffect(() => setDraftSearch(search), [search]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(sp);
    if (v == null || v === "") next.delete(k);
    else next.set(k, String(v));
    setSp(next, { replace: true });
  };

  const setAnneeId = (id) => {
    const next = new URLSearchParams(sp);
    if (id) next.set("anneeId", String(id));
    else next.delete("anneeId");
    next.set("page", "1");
    setSp(next, { replace: true });
  };

  const setStatut = (s) => {
    const next = new URLSearchParams(sp);
    if (s) next.set("statut", s);
    else next.delete("statut");
    next.set("page", "1");
    setSp(next, { replace: true });
  };

  const setPage = (p) => setParam("page", Math.max(1, p));
  const setLimit = (l) => {
    const next = new URLSearchParams(sp);
    next.set("limit", String(Math.min(100, Math.max(1, l))));
    next.set("page", "1");
    setSp(next, { replace: true });
  };

  const applySearch = () => {
    const next = new URLSearchParams(sp);
    if (draftSearch) next.set("search", draftSearch);
    else next.delete("search");
    next.set("page", "1");
    setSp(next, { replace: true });
  };

  const resetFilters = () => {
    const next = new URLSearchParams();
    next.set("statut", "actif");
    next.set("page", "1");
    next.set("limit", String(limit));
    setSp(next, { replace: true });
  };

  return useMemo(
    () => ({
      // state
      anneeId,
      statut,
      search,
      page,
      limit,
      draftSearch,
      // setters
      setAnneeId,
      setStatut,
      setPage,
      setLimit,
      setDraftSearch,
      applySearch,
      resetFilters,
    }),
    [anneeId, statut, search, page, limit, draftSearch]
  );
}
