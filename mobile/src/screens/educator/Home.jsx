import { RefreshControl, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '../../components/ui/ScreenContainer';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Empty from '../../components/common/Empty';
import { fetchEducatorTodayStats } from '../../api/stats';

export default function EducatorHome() {
  const { t } = useTranslation();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useQuery({ queryKey: ['educatorStatsToday'], queryFn: fetchEducatorTodayStats });

  if (isLoading && !data) {
    return <Loader />;
  }

  if (isError) {
    return <ErrorState message={t('common.error')} onRetry={refetch} />;
  }

  const tasks = data?.tasks || [];
  const summary = data?.summary;

  return (
    <ScreenContainer
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563EB" />}
    >
      <Text className="mb-4 text-2xl font-bold text-gray-900">{t('educator.home.title')}</Text>

      {summary ? (
        <View className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
          {Object.entries(summary).map(([key, value]) => (
            <View key={key} className="mb-2">
              <Text className="text-base text-gray-600">{key}</Text>
              <Text className="text-lg font-semibold text-gray-900">{value}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View className="rounded-2xl bg-white p-5 shadow-sm">
        <Text className="mb-3 text-lg font-semibold text-gray-900">{t('educator.home.title')}</Text>
        {tasks.length ? (
          <View className="space-y-3">
            {tasks.map((task) => (
              <View key={task.id || task.title} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <Text className="text-base font-semibold text-gray-900">{task.title}</Text>
                {task.description ? <Text className="mt-1 text-sm text-gray-600">{task.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : (
          <Empty message={t('educator.home.noTasks')} />
        )}
      </View>
    </ScreenContainer>
  );
}
