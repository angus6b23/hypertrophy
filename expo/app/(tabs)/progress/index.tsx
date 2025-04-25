import { Stack, useRouter } from 'expo-router';
import { Cog } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import MaterialTabs from 'react-native-material-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MeasurementPage } from './measurement';
import { StatisticsPage } from './statistics';

import { XStack } from '~/components/ui/Stacks';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useColors } from '~/utils/rn-reusables/useColors';

function ProgresPage() {
  const { t } = useTranslation();
  const colors = useColors();
  const router = useRouter();

  const [tab, setTab] = useState(0);
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
        <MaterialTabs
          items={[t('common.workouts'), t('common.measurements'), t('common.statistics')]}
          selectedIndex={tab}
          onChange={setTab}
          barColor={colors.card}
          indicatorColor={colors.primary}
          activeTextColor={colors.text}
          inactiveTextColor={colors.text}
        />
        {tab === 0 && <View />}
        {tab === 1 && <MeasurementPage />}
        {tab === 2 && <StatisticsPage />}
      </SafeAreaView>
    </>
  );
}

export default ProgresPage;
