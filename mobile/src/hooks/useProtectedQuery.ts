import { useQuery, UseQueryOptions, QueryKey, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { useAuthStore } from '@features/auth/store';

export function useProtectedQuery<TQueryFnData, TError = AxiosError, TData = TQueryFnData>(
  options: UseQueryOptions<TQueryFnData, TError, TData, QueryKey>
): UseQueryResult<TData, TError> {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    enabled: Boolean(token) && (options.enabled ?? true),
    ...options
  });
}
