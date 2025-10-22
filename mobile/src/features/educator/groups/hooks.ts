import { useProtectedQuery } from '@hooks/useProtectedQuery';
import { fetchEducatorGroupDetail, GroupDetail, GroupSummary, listEducatorGroups } from './api';

export function useEducatorGroups() {
  return useProtectedQuery<GroupSummary[]>({
    queryKey: ['educator-groups'],
    queryFn: listEducatorGroups
  });
}

export function useEducatorGroup(groupId: number) {
  return useProtectedQuery<GroupDetail>({
    queryKey: ['educator-group', groupId],
    queryFn: () => fetchEducatorGroupDetail(groupId),
    enabled: groupId > 0
  });
}
