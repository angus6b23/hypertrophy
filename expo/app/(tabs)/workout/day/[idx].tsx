import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { ExerciseItem } from '~/components/ui/ExerciseItem';
import { useCurrentPlan } from '~/utils/hooks/use-current-plan';
import exerciseDb from 'share/exercises/exercises.json';
import { Exercise } from 'share/exercises/types/exercise';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useTranslation } from 'react-i18next';

import DraggableFlatList, { DragEndParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { PlanExercise } from 'share/interfaces/Workout';
import { useWorkoutPlanStore } from '~/utils/stores/workout-plan-store';
import { useWorkoutStore } from '~/utils/stores/session-store';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { useColors } from '~/utils/rn-reusables/useColors';

const ExerciseDay = () => {
  const local = useLocalSearchParams();
  const idx = Number(local.idx as string);

  const currentPlan = useCurrentPlan();
  const [currentDay, setCurrentDay] = useState(currentPlan.days[idx]);

  const updateWorkout = useWorkoutPlanStore((s) => s.update);
  const currSession = useWorkoutStore((s) => s.current);
  const colors = useColors();

  useEffect(() => {
    setCurrentDay(currentPlan.days[idx]);
  }, [idx, currentPlan]);

  const handleDrag = useCallback(
    (d: DragEndParams<PlanExercise>) => {
      updateWorkout(currentPlan.localId, {
        ...currentPlan,
        days: currentPlan.days.map((day, i) =>
          i !== idx
            ? day
            : {
                ...day,
                exercises: d.data,
              }
        ),
      });
    },
    [currentDay, currentPlan, idx]
  );
  return (
    <>
      <Stack.Screen options={{ title: `${currentDay.name}`, headerShown: true }} />
      <DraggableFlatList
        data={currentPlan.days[idx].exercises}
        keyExtractor={(item) => item.localId as string}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 64 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={(item) => {
          const ex = exerciseDb.exercises.find((ex) => ex.id === item.item.exerciseId)! as Exercise;
          return (
            <ScaleDecorator>
              <View className="relative flex flex-row items-center rounded-lg bg-muted">
                <ExerciseItem
                  exercise={ex}
                  drag={item.drag}
                  href={`/(zShare)/exercise/logs?day=${idx}&exercise=${item.getIndex()}&exercisePlanId=${item.item.localId}`}
                  size={96}
                  className="flex-1 bg-muted"
                />
                {currSession &&
                  currSession.exercises.find((ex) => item.item.localId! === ex.exercisePlanId)
                    ?.finished && (
                    <View className="absolute right-4">
                      <ThemedIcon name="CircleCheck" color={colors.text} size={32} />
                    </View>
                  )}
              </View>
            </ScaleDecorator>
          );
        }}
        ListFooterComponent={<AddExerciseButton idx={idx} />}
        onDragEnd={handleDrag}
      />
    </>
  );
};

const AddExerciseButton = ({ idx }: { idx: number }) => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Button className="mt-4" onPress={() => router.push(`/(zShare)/exercise/add?idx=${idx}`)}>
      <Text>{t('common.add_exercise')}</Text>
    </Button>
  );
};
export default ExerciseDay;
