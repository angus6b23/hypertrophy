import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RepWeightRecord, Workout } from 'share/interfaces/Records';
import { YStack, XStack } from '~/components/ui/Stacks';
import { Text } from '~/components/ui/text';
import { WeightUnit } from '~/types/units';
import { minutesPassed } from '~/utils/misc/time';
import { useWorkoutStore } from '~/utils/stores/session-store';
import { useTranslation } from 'react-i18next';
import { round } from '~/utils/misc/round-numbers';
import { useOptionStore } from '~/utils/stores/option-store';
import { FlashList } from '@shopify/flash-list';
import { View } from 'react-native';
import { ExerciseItem } from '~/components/ui/ExerciseItem';
import { ExerciseRecordItem } from '~/components/ui/ExerciseRecordItem';

const WorkoutDayView = () => {
  const router = useRouter();
  const { date: paraDate } = useLocalSearchParams();
  const workouts = useWorkoutStore((s) => s.workouts);
  const [sessions, setSessions] = useState<Workout[]>([]);

  const date = new Date(paraDate as string);
  if (!date) {
    router.dismiss();
  }

  useEffect(() => {
    const filtered = workouts.filter((w) => {
      const wDate = new Date(w.startTime).toISOString().split('T')[0];
      return wDate === date.toISOString().split('T')[0];
    });
    setSessions(filtered);
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: date.toLocaleDateString(), headerShown: true }} />
      <FlashList
        data={sessions}
        keyExtractor={(item) => item.localId}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View className="h-8" />}
        renderItem={(item) => (
          <>
            <SessionHeader workout={item.item} />
            <FlashList
              data={item.item.exercises}
              keyExtractor={(inner, i) => `${item.item.localId}-${inner.exercisePlanId}-${i}`}
              contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12 }}
              ItemSeparatorComponent={() => <View className="h-4" />}
              renderItem={(inner) => (
                <ExerciseRecordItem
                  record={inner.item}
                  date={item.item.startTime as unknown as string}
                  options={{ showDate: false, showName: true }}
                />
              )}
            />
          </>
        )}
        estimatedItemSize={2}
      />
    </>
  );
};

const SessionHeader = ({ workout }: { workout: Workout }) => {
  const { t } = useTranslation();

  const preferredUnit = useOptionStore((s) => s.unit.workoutWeight);

  const getWorkoutVolume = useCallback(
    (workout: Workout) => {
      const volume = workout.exercises.reduce((acc, ex) => {
        if (ex.type === 'reps_with_weight') {
          const record = ex.record as RepWeightRecord[];
          record.forEach((r) => (acc += r.weight * r.reps));
        }
        return acc;
      }, 0);
      return preferredUnit === WeightUnit.kg ? round(volume) : round(volume / 2);
    },
    [preferredUnit]
  );

  return (
    <YStack fill={false} className="w-full bg-muted" align="center">
      <Text className="text-xl font-bold">{t('workout.session_summary')}</Text>
      <XStack
        gap="none"
        padding="none"
        fill={false}
        className="w-full bg-transparent"
        justify="around">
        <YStack gap="none" padding="none" fill={false} className="bg-transparent">
          <Text className="text-xl text-muted-foreground">{t('workout.duration')}</Text>
          <Text className="text-xl">
            {minutesPassed(new Date(workout.startTime), new Date(workout.endTime!)) +
              ' ' +
              t('common.min')}
          </Text>
        </YStack>
        <YStack gap="none" padding="none" fill={false} className="bg-transparent">
          <Text className="text-xl text-muted-foreground">{t('workout.exercises')}</Text>
          <Text className="text-xl">{workout.exercises.length}</Text>
        </YStack>
        <YStack gap="none" padding="none" fill={false} className="bg-transparent">
          <Text className="text-xl text-muted-foreground">{t('workout.volume')}</Text>
          <Text className="text-xl">
            {getWorkoutVolume(workout)}{' '}
            {preferredUnit === WeightUnit.kg ? t('unit.kg') : t('unit.lbs')}
          </Text>
        </YStack>
        {workout.RPE && (
          <YStack gap="none" padding="none" fill={false} className="bg-transparent">
            <Text className="text-xl text-muted-foreground">{t('workout.rpe')}</Text>
            <Text className="text-xl">{workout.RPE} / 10</Text>
          </YStack>
        )}
      </XStack>
    </YStack>
  );
};

export default WorkoutDayView;
