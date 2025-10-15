import { RefreshControl, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import ScreenContainer from '../../components/ui/ScreenContainer';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Empty from '../../components/common/Empty';
import { fetchMyChildren } from '../../api/enfants';
import { fetchUpcomingEvents } from '../../api/evenements';
import { fetchActivePeiByChild } from '../../api/pei';
import { fetchDailyNotesByPei } from '../../api/notes';

export default function ParentHome() {
  const { t } = useTranslation();

  const {
    data: childrenData,
    isLoading: childrenLoading,
    isError: childrenError,
    refetch: refetchChildren
  } = useQuery({ queryKey: ['parentChildren'], queryFn: () => fetchMyChildren() });

  const firstChildId = childrenData?.items?.[0]?.id;

  const {
    data: activePei,
    refetch: refetchPei,
    isFetching: peiFetching
  } = useQuery({
    queryKey: ['childActivePei', firstChildId],
    queryFn: () => fetchActivePeiByChild(firstChildId),
    enabled: Boolean(firstChildId)
  });

  const {
    data: recentNotes,
    refetch: refetchNotes,
    isFetching: notesFetching
  } = useQuery({
    queryKey: ['childRecentNotes', activePei?.id],
    queryFn: () => fetchDailyNotesByPei(activePei.id, { pageSize: 1 }),
    enabled: Boolean(activePei?.id)
  });

  const {
    data: events,
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents
  } = useQuery({ queryKey: ['upcomingEvents'], queryFn: () => fetchUpcomingEvents({ limit: 1 }) });

  const refreshing = childrenLoading || eventsLoading || peiFetching || notesFetching;

  const onRefresh = async () => {
    await Promise.all([
      refetchChildren(),
      refetchEvents(),
      firstChildId ? refetchPei() : Promise.resolve(),
      activePei?.id ? refetchNotes() : Promise.resolve()
    ]);
  };

  if (childrenLoading && eventsLoading) {
    return <Loader />;
  }

  if (childrenError || eventsError) {
    return <ErrorState message={t('common.error')} onRetry={onRefresh} />;
  }

  const nextEvent = events?.[0];
  const recentNote = recentNotes?.items?.[0] ?? null;
  const children = childrenData?.items ?? [];

  return (
    <ScreenContainer
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
    >
      <Text className="mb-4 text-2xl font-bold text-gray-900">{t('tabs.parent.home')}</Text>

      <View className="space-y-4">
        <View className="rounded-2xl bg-white p-5 shadow-sm">
          <Text className="mb-2 text-lg font-semibold text-gray-800">{t('parent.home.nextEvent')}</Text>
          {nextEvent ? (
            <View>
              <Text className="text-base text-gray-900">{nextEvent.title || nextEvent.name}</Text>
              {nextEvent.startsAt ? (
                <Text className="mt-1 text-sm text-gray-500">
                  {format(new Date(nextEvent.startsAt), 'yyyy-MM-dd HH:mm')}
                </Text>
              ) : null}
              {nextEvent.location ? (
                <Text className="mt-1 text-sm text-gray-500">{nextEvent.location}</Text>
              ) : null}
            </View>
          ) : (
            <Empty message={t('common.empty')} />
          )}
        </View>

        <View className="rounded-2xl bg-white p-5 shadow-sm">
          <Text className="mb-2 text-lg font-semibold text-gray-800">{t('parent.home.lastNote')}</Text>
          {recentNote ? (
            <View>
              {recentNote.type ? (
                <Text className="text-sm font-semibold text-gray-600">{recentNote.type}</Text>
              ) : null}
              {recentNote.contenu ? (
                <Text className="mt-1 text-base text-gray-900">{recentNote.contenu}</Text>
              ) : null}
              {recentNote.date_note ? (
                <Text className="mt-1 text-sm text-gray-500">
                  {format(new Date(recentNote.date_note), 'yyyy-MM-dd HH:mm')}
                </Text>
              ) : null}
            </View>
          ) : (
            <Text className="text-sm text-gray-500">{t('parent.home.notesUnavailable')}</Text>
          )}
        </View>

        <View className="rounded-2xl bg-white p-5 shadow-sm">
          <Text className="mb-2 text-lg font-semibold text-gray-800">{t('parent.home.childrenList')}</Text>
          {children.length ? (
            <View className="space-y-2">
              {children.map((child) => (
                <Text key={child.id} className="text-base text-gray-900">
                  • {child.fullName}
                </Text>
              ))}
            </View>
          ) : (
            <Empty message={t('common.empty')} />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
