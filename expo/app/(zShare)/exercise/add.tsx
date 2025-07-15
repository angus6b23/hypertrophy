import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ExerciseList } from './list';
import { createContext, useCallback, useState } from 'react';
import { useCurrentPlan } from '~/utils/hooks/use-current-plan';
import { useWorkoutPlanStore } from '~/utils/stores/workout-plan-store';
import { PlanExercise } from 'share/interfaces/Workout';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { nanoid } from 'nanoid/non-secure';
import { useOptionStore } from '~/utils/stores/option-store';
import { useAccountStore } from '~/utils/stores/account-store';

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
  const update = useWorkoutPlanStore((s) => s.update);
  const defaultReps = useOptionStore((s) => s.workout.defaultReps);
  const defaultSets = useOptionStore((s) => s.workout.defaultSets);
  const defaultRest = useOptionStore((s) => s.workout.defaultRest);

  const router = useRouter();

  const handleAdd = useCallback(async () => {
    const addEx = exSet.map(
      (val) =>
        ({
          localId: nanoid(),
          exerciseId: val,
          targetReps: defaultReps,
          targetSets: defaultSets,
          restTime: defaultRest,
        }) as PlanExercise
    );
    const newEx = [...currentPlan.days[idx].exercises!, ...addEx];
    update(currentPlan.localId, {
      ...currentPlan,
      days: currentPlan.days.map((d, i) => (i === idx ? { ...d, exercises: newEx } : d)),
    });
    setExSet([]);
    router.dismiss();
  }, [exSet, currentPlan, defaultReps, defaultSets, defaultRest]);

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
