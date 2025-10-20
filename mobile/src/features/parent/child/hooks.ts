import { useRoute } from '@react-navigation/native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useProtectedQuery } from '@hooks/useProtectedQuery';
import { fetchParentChild, ParentChildPayload } from './api';

export function useParentChild() {
  const route = useRoute<{ params?: { childId?: number } }>();
  const childId = route.params?.childId ?? 0;
  const { t } = useTranslation();
  const query = useProtectedQuery<ParentChildPayload>({
    queryKey: ['parent-child', childId],
    queryFn: () => fetchParentChild(childId),
    enabled: childId > 0
  });

  const childName = useMemo(() => {
    if (!query.data) return '';
    return `${query.data.enfant.firstName} ${query.data.enfant.lastName}`;
  }, [query.data]);

  return { ...query, childName, t };
}
