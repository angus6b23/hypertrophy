import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { YStack } from '~/components/ui/Stacks';
import { TimeSeriesChart } from '~/components/ui/TimeSeriesChart';
import { Text } from '~/components/ui/text';
import { useMeasurementStore } from '~/utils/stores/measurement-store';

export const StatisticsPage = () => {
  return (
    <>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
        className="w-full">
        <YStack padding="none" gap="lg" fill={false}>
          <BodyCompositionChart />
        </YStack>
      </ScrollView>
    </>
  );
};

export const BodyCompositionChart = () => {
  const { t } = useTranslation();
  const measurements = useMeasurementStore((state) => state.data);
  return (
    <YStack>
      <Text className="text-lg font-bold">{t('stat.body_composition')}</Text>
      {measurements.length > 0 && (
        <TimeSeriesChart
          data={measurements}
          xKey="date"
          yOptions={[
            {
              key: 'weight',
              configDomain: 10,
              type: 'bar',
            },
            {
              key: 'bodyFat',
              configDomain: 5,
              type: 'line',
            },
          ]}
        />
      )}
    </YStack>
  );
};
