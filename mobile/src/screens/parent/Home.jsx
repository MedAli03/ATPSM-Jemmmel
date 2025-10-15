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

export default function ParentHome() {
  const { t } = useTranslation();

  const {
    data: children,
    isLoading: childrenLoading,
    isError: childrenError,
    refetch: refetchChildren
  } = useQuery({ queryKey: ['parentChildren'], queryFn: fetchMyChildren });

  const {
    data: events,
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents
  } = useQuery({ queryKey: ['upcomingEvents'], queryFn: () => fetchUpcomingEvents(1) });

  const refreshing = childrenLoading || eventsLoading;

  const onRefresh = async () => {
    await Promise.all([refetchChildren(), refetchEvents()]);
  };

  if (childrenLoading && eventsLoading) {
    return <Loader />;
  }

  if (childrenError || eventsError) {
    return <ErrorState message={t('common.error')} onRetry={onRefresh} />;
  }

  const nextEvent = events?.[0];
  const recentNote = children?.flatMap?.((child) => (child?.last_note ? [child.last_note] : []))?.[0];

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
              {nextEvent.date ? (
                <Text className="mt-1 text-sm text-gray-500">
                  {format(new Date(nextEvent.date), 'yyyy-MM-dd HH:mm')}
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
              <Text className="text-base text-gray-900">{recentNote.summary || recentNote.content}</Text>
              {recentNote.created_at ? (
                <Text className="mt-1 text-sm text-gray-500">
                  {format(new Date(recentNote.created_at), 'yyyy-MM-dd HH:mm')}
                </Text>
              ) : null}
            </View>
          ) : (
            <Empty message={t('common.empty')} />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
