import { useProtectedQuery } from '@hooks/useProtectedQuery';
import { EducatorDashboard, fetchEducatorDashboard } from './api';

export function useEducatorDashboard() {
  return useProtectedQuery<EducatorDashboard>({
    queryKey: ['educator-dashboard'],
    queryFn: fetchEducatorDashboard
  });
}
