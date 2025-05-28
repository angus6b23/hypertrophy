import { FlashList } from '@shopify/flash-list';
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

const ExerciseDay = () => {
  const local = useLocalSearchParams();
  const idx = Number(local.idx as string);
  const currentPlan = useCurrentPlan();
  const [currentDay, setCurrentDay] = useState(currentPlan.days[idx]);
  const workoutPlanStore = useWorkoutPlanStore();
  useEffect(() => {
    setCurrentDay(currentPlan.days[idx]);
  }, [idx, currentPlan]);

  const handleDrag = useCallback(
    (d: DragEndParams<PlanExercise>) => {
      workoutPlanStore.update(currentPlan.localId, {
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
            <ExerciseItem
              exercise={ex}
              drag={item.drag}
              href={`/(zShare)/exercise/logs?day=${idx}&exercise=${item.getIndex()}&exercisePlanId=${item.item.localId}`}
            />
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
