import { useQuery } from "@tanstack/react-query";
import { listParents } from "../api/parents";

export function useParentsPage(params) {
  return useQuery({
    queryKey: ["parents", params],
    queryFn: () => listParents(params),
    keepPreviousData: true,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
}

export default useParentsPage;
