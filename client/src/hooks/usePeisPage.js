import { useQuery } from "@tanstack/react-query";
import { listPeis } from "../api/peis";

export function usePeisPage(params) {
  return useQuery({
    queryKey: ["peis", params],
    queryFn: () => listPeis(params),
    keepPreviousData: true,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
}

export default usePeisPage;
