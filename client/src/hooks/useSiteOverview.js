import { useQuery } from "@tanstack/react-query";
import { fetchSiteOverview } from "../api/site";

const STALE_TIME = 5 * 60 * 1000;

export function useSiteOverview(options = {}) {
  return useQuery({
    queryKey: ["site", "overview"],
    queryFn: fetchSiteOverview,
    staleTime: STALE_TIME,
    ...options,
  });
}
