import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useWorkoutStore } from '~/utils/stores/session-store';
import { View } from 'react-native';
import { Workout } from 'share/interfaces/Records';
import { Text } from '~/components/ui/text';
import { useEffect, useState } from 'react';
import { minutesPassed } from '~/utils/misc/time';
import { XStack } from '~/components/ui/Stacks';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';

export default function Layout() {
  const currWorkout = useWorkoutStore((s) => s.current);
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />;
      {currWorkout && <FloatingWidget workout={currWorkout} />}
    </>
  );
}

const FloatingWidget = ({ workout }: { workout: Workout }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const end = useWorkoutStore((s) => s.end);

  const [minute, setMinute] = useState(
    minutesPassed(new Date(workout?.startTime as unknown as string))
  );

  useFocusEffect(() => {
    const interval = setInterval(() => {
      const minPassed = minutesPassed(new Date(workout?.startTime as unknown as string));
      setMinute(minPassed);
    }, 1000 * 10);
    return () => {
      clearInterval(interval);
    };
  });

  useEffect(() => {
    if (minute > 60 * 4) {
      end();
    }
  }, [minute]);

  return (
    <View className="absolute bottom-2 left-2 rounded-lg bg-secondary">
      <XStack fill={false} className="rounded-lg bg-secondary" align="center">
        <Text className="text-lg text-secondary-foreground">{t('common.current_session')}</Text>
        <XStack fill={false} padding="none" gap="sm" className="bg-transparent">
          <Text className="text-bold text-xl text-secondary-foreground">{minute}</Text>
          <Text className="text-bold text-xl lowercase text-secondary-foreground">
            {t('common.min')}
          </Text>
        </XStack>
        <Button onPress={() => router.push('/(zShare)/session')}>
          <Text>{t('common.end')}</Text>
        </Button>
      </XStack>
    </View>
  );
};
