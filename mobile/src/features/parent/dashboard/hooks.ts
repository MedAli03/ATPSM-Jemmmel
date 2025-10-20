import { useTranslation } from 'react-i18next';

import { useProtectedQuery } from '@hooks/useProtectedQuery';
import { fetchParentDashboard, ParentDashboardSummary } from './api';

export function useParentDashboard() {
  const { t } = useTranslation();
  const query = useProtectedQuery<ParentDashboardSummary>({
    queryKey: ['parent-dashboard'],
    queryFn: fetchParentDashboard
  });

  return {
    ...query,
    t
  };
}
