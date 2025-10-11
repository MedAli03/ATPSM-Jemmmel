// src/hooks/useChildrenPage.js
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listEnfants } from "../api/enfants";

/**
 * Small debounce hook to avoid firing a request on every keystroke.
 */
function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/**
 * useChildrenPage
 *
 * Params (all optional; matches your AllChildren.jsx):
 *  - page (number, default 1)
 *  - pageSize (number, default 10)
 *  - q (string)                // debounced inside the hook
 *  - parent_user_id (number|string)
 *
 * Returns:
 *  - rows, count, totalPages
 *  - pageMeta (whatever server returned)
 *  - isLoading, isFetching, isError, error, refetch
 *  - prefetchPage(n) (optimistic prefetch for pagination UX)
 */
export function useChildrenPage(params = {}) {
  const {
    page = 1,
    pageSize = 10,
    q = "",
    parent_user_id = undefined,
    debounceMs = 300,
  } = params;

  // Debounce only the search query, keep other params live
  const qDebounced = useDebounced(q, debounceMs);

  const computedParams = useMemo(
    () => ({
      page,
      pageSize,
      q: qDebounced || undefined, // avoid sending empty strings
      parent_user_id:
        parent_user_id === "" || parent_user_id === null
          ? undefined
          : parent_user_id,
    }),
    [page, pageSize, qDebounced, parent_user_id]
  );

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["enfants", computedParams],
    queryFn: () => listEnfants(computedParams),
    keepPreviousData: true, // smooth pagination
    staleTime: 15_000, // cache a bit for snappier back/forwards
  });

  const data = query.data ?? {};
  const rows = data.rows ?? [];
  const count = data.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(count / (pageSize || 10)));
  const pageMeta = {
    page: data.page ?? page,
    pageSize: data.pageSize ?? pageSize,
  };

  /**
   * Prefetch a specific page (nice UX when hovering next/prev).
   */
  async function prefetchPage(targetPage) {
    if (!targetPage || targetPage < 1 || targetPage > totalPages) return;
    const nextParams = { ...computedParams, page: targetPage };
    await queryClient.prefetchQuery({
      queryKey: ["enfants", nextParams],
      queryFn: () => listEnfants(nextParams),
    });
  }

  return {
    ...query,
    rows,
    count,
    totalPages,
    pageMeta,
    prefetchPage,
  };
}

export default useChildrenPage;
