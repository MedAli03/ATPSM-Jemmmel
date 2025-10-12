import { useQuery } from "@tanstack/react-query";
import { listEvents } from "../api/events";

export function useEventsPage(params) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => listEvents(params),
    keepPreviousData: true,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
}

export default useEventsPage;

