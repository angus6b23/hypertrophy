import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ExerciseList } from './list';
import { createContext, useCallback, useState } from 'react';
import { useCurrentPlan } from '~/utils/hooks/use-current-plan';
import { useWorkoutPlanStore } from '~/utils/stores/workout-plan-store';
import { PlanExercise } from 'share/interfaces/Workout';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

export const AddExerciseContext = createContext<{
  exSet: number[];
  setExSet: React.Dispatch<React.SetStateAction<number[]>>;
}>({
  exSet: [],
  setExSet: () => {},
});

const AddExercisePage = () => {
  const { t } = useTranslation();
  const local = useLocalSearchParams();
  const idx = Number(local.idx);

  const [exSet, setExSet] = useState<number[]>([]);
  const currentPlan = useCurrentPlan();
  const workoutPlanStore = useWorkoutPlanStore();
  const router = useRouter();
  const handleAdd = useCallback(() => {
    const addEx = exSet.map(
      (val) =>
        ({
          exerciseId: val,
          targetReps: 10,
          targetSets: 3,
        }) as PlanExercise
    );
    const newEx = [...currentPlan.days[idx].exercises!, ...addEx];
    workoutPlanStore.update(currentPlan.localId, {
      ...currentPlan,
      days: currentPlan.days.map((d, i) => (i === idx ? { ...d, exercises: newEx } : d)),
    });
    setExSet([]);
    router.replace(`/(tabs)/workout/day/${idx}`);
  }, [exSet, currentPlan]);

  const AddButton = () => {
    const { t } = useTranslation();
    return (
      <>
        {exSet.length > 0 && (
          <Button onPress={handleAdd} variant="default">
            <Text>{t('common.add')}</Text>
          </Button>
        )}
      </>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('workout.add_exercise'),
          headerShown: true,
          headerRight: () => <AddButton />,
        }}
      />
      <AddExerciseContext.Provider value={{ exSet, setExSet }}>
        <ExerciseList useCheckList={true} inner={true} />
      </AddExerciseContext.Provider>
    </>
  );
};

export default AddExercisePage;
