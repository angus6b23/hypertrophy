import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Cog } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';

import { StatisticsPage } from './statistics';
import { MeasurementPage } from './measurement';

import { useColors } from '~/utils/rn-reusables/useColors';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { XStack } from '~/components/ui/Stacks';
import { CustomTab } from '~/components/ui/CustomTab';
import { ProgressWorkoutPage } from './workout';

function ProgresPage() {
  const { t } = useTranslation();
  const colors = useColors();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: t('common.progress') }} />
      <SafeAreaView
        style={{
          flex: 1,
          flexDirection: 'column',
        }}>
        <XStack justify="between" align="center" fill={false}>
          <Text className="text-xl font-bold">{t('common.progress')}</Text>
          <XStack justify="end" fill={false} padding="none">
            <Button variant="ghost" className="p-2" onPress={() => router.push('/options')}>
              <Cog size={24} color={colors.text} />
            </Button>
          </XStack>
        </XStack>
        <CustomTab
          routes={[
            { title: t('common.workouts'), key: 'workouts' },
            { title: t('common.measurements'), key: 'measurements' },
            { title: t('common.statistics'), key: 'statistics' },
          ]}
          screens={({ route }) =>
            route.key === 'workouts' ? (
              <ProgressWorkoutPage />
            ) : route.key === 'measurements' ? (
              <MeasurementPage />
            ) : (
              <StatisticsPage />
            )
          }
          tabBarProps={{ scrollEnabled: false }}
        />
      </SafeAreaView>
    </>
  );
}

export default ProgresPage;
