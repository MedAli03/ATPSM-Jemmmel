import { useQuery } from "@tanstack/react-query";
import { listUsers } from "../api/users";

export function useUsersPage(params) {
  return useQuery({
    queryKey: ["users", "page", params],
    queryFn: () => listUsers(params),
    keepPreviousData: true,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
}
