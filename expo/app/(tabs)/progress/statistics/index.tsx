import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useMeasurementStore } from '~/utils/stores/measurement-store';
import { Text } from '~/components/ui/text';
import { TimeSeriesChart } from '~/components/ui/TimeSeriesChart';
import { YStack } from '~/components/ui/Stacks';

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
      {/* {measurements.length > 0 && ( */}
      {/*   <TimeSeriesChart */}
      {/*     data={measurements} */}
      {/*     xKey="date" */}
      {/*     yOptions={[ */}
      {/*       { */}
      {/*         key: 'weight', */}
      {/*         type: 'bar', */}
      {/*       }, */}
      {/*       { */}
      {/*         key: 'bodyFat', */}
      {/*         type: 'line', */}
      {/*       }, */}
      {/*     ]} */}
      {/*   /> */}
      {/* )} */}
    </YStack>
  );
};
