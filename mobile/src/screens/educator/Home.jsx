import { RefreshControl, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import ScreenContainer from '../../components/ui/ScreenContainer';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Empty from '../../components/common/Empty';
import { fetchActiveSchoolYear } from '../../api/annees';
import { fetchActivePeisForEducator } from '../../api/pei';
import { fetchUpcomingEvents } from '../../api/evenements';
import { fetchUnreadNotifications } from '../../api/notifications';
import { useAuth } from '../../hooks/useAuth';

export default function EducatorHome() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const {
    data: year,
    isLoading: yearLoading,
    isError: yearError,
    refetch: refetchYear
  } = useQuery({ queryKey: ['activeYear'], queryFn: fetchActiveSchoolYear });

  const {
    data: peis,
    isLoading: peisLoading,
    isError: peisError,
    refetch: refetchPeis
  } = useQuery({
    queryKey: ['educatorPeis', user?.id],
    queryFn: () => fetchActivePeisForEducator(user.id),
    enabled: Boolean(user?.id)
  });

  const {
    data: events,
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents
  } = useQuery({
    queryKey: ['educatorEvents'],
    queryFn: () => fetchUpcomingEvents({ limit: 3, audience: 'educateurs' })
  });

  const {
    data: notifications,
    isLoading: notificationsLoading,
    isError: notificationsError,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['educatorNotifications'],
    queryFn: () => fetchUnreadNotifications({ limit: 5 })
  });

  const isLoading = yearLoading || peisLoading || eventsLoading || notificationsLoading;
  const hasError = yearError || peisError || eventsError || notificationsError;

  const onRefresh = async () => {
    await Promise.all([refetchYear(), refetchPeis(), refetchEvents(), refetchNotifications()]);
  };

  if (isLoading && !year && !peis && !events && !notifications) {
    return <Loader />;
  }

  if (hasError) {
    return <ErrorState message={t('common.error')} onRetry={onRefresh} />;
  }

  const peisCount = peis?.meta?.total ?? peis?.items?.length ?? 0;
  const notificationsItems = notifications?.items ?? [];

  return (
    <ScreenContainer
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#2563EB" />}
    >
      <Text className="mb-4 text-2xl font-bold text-gray-900">{t('educator.home.title')}</Text>

      <View className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
        <Text className="text-base text-gray-600">{t('educator.home.activeYear')}</Text>
        <Text className="text-lg font-semibold text-gray-900">{year?.libelle || t('common.unknown')}</Text>
      </View>

      <View className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
        <Text className="mb-2 text-lg font-semibold text-gray-900">{t('educator.home.activePei')}</Text>
        <Text className="text-3xl font-bold text-indigo-600">{peisCount}</Text>
        {peis?.items?.length ? (
          <View className="mt-3 space-y-2">
            {peis.items.slice(0, 3).map((pei) => (
              <Text key={pei.id} className="text-base text-gray-700">
                • {pei.enfant?.prenom ? `${pei.enfant.prenom} ${pei.enfant.nom ?? ''}`.trim() : pei.enfant_id}
              </Text>
            ))}
          </View>
        ) : (
          <Text className="mt-3 text-sm text-gray-500">{t('educator.home.noPei')}</Text>
        )}
      </View>

      <View className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
        <Text className="mb-3 text-lg font-semibold text-gray-900">{t('educator.home.upcomingEvents')}</Text>
        {events?.length ? (
          <View className="space-y-3">
            {events.map((event) => (
              <View key={event.id || event.title} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <Text className="text-base font-semibold text-gray-900">{event.title || event.name}</Text>
                {event.startsAt ? (
                  <Text className="mt-1 text-sm text-gray-600">
                    {format(new Date(event.startsAt), 'yyyy-MM-dd HH:mm')}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <Empty message={t('educator.home.noEvents')} />
        )}
      </View>

      <View className="rounded-2xl bg-white p-5 shadow-sm">
        <Text className="mb-3 text-lg font-semibold text-gray-900">{t('educator.home.unread')}</Text>
        {notificationsItems.length ? (
          <View className="space-y-3">
            {notificationsItems.map((item) => (
              <View key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <Text className="text-base font-semibold text-gray-900">{item.title}</Text>
                {item.body ? <Text className="mt-1 text-sm text-gray-600">{item.body}</Text> : null}
              </View>
            ))}
          </View>
        ) : (
          <Empty message={t('educator.home.noNotifications')} />
        )}
      </View>
    </ScreenContainer>
  );
}
