import { useProtectedQuery } from '@hooks/useProtectedQuery';
import { EducatorChild, listEducatorChildren } from './api';

export function useEducatorChildren() {
  return useProtectedQuery<EducatorChild[]>({
    queryKey: ['educator-children'],
    queryFn: listEducatorChildren
  });
}
