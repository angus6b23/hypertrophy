import { SafeAreaView, View } from 'react-native';
import { SwipeGesture } from 'react-native-swipe-gesture-handler';
import { Exercise, RecordType } from 'share/exercises/types/exercise';
import { RepWeightRecord, RepRecord, TimeRecord } from 'share/interfaces/Records';
import {
  RepWithWeightRecordForm,
  RepRecordForm,
  TimeRecordForm,
} from '~/components/ui/ExerciseLogForms';
import { LogBanner, Toolbar } from './logs';
import { useRef } from 'react';
import { PlanExercise } from 'share/interfaces/Workout';
import { nanoid } from 'nanoid/non-secure';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import exerciseDb from 'share/exercises/exercises.json';
import { useExerciseHistory } from '~/utils/hooks/use-exercise-history';
import { Button } from '~/components/ui/button';
import { ThemedIcon } from '~/components/ui/ThemedIcon';

export default function AdHocLog() {
  const { id } = useLocalSearchParams();
  const exId = Number(id);

  const exRef = useRef(exerciseDb.exercises.find((e) => e.id === exId) as Exercise | undefined);

  const tempPlanExercise = useRef<PlanExercise>({
    localId: nanoid(8),
    exerciseId: exId,
  });
  const planExercise = tempPlanExercise.current;
  const history = useExerciseHistory(planExercise);
  const logEx = () => {};
  const nextTab = () => {};
  const setShowImg = (_bool: boolean) => {};
  const router = useRouter();

  if (!exRef.current) {
    return <Redirect href="/(zShare)/exercise/list" />;
  }
  const exercise = exRef.current;
  return (
    <SafeAreaView className="relative flex-1">
      <Stack.Screen />
      <SwipeGesture
        onSwipePerformed={(action) => {
          if (action === 'up') {
            setShowImg(false);
          } else if (action === 'down') {
            setShowImg(true);
          }
        }}>
        <View className="relative flex h-full w-full pb-24">
          <LogBanner exercise={exercise} />
          <Toolbar exercise={exercise} planExercise={planExercise} />
          {history.type === RecordType.reps_with_weight ? (
            <RepWithWeightRecordForm
              prefill={history.record as RepWeightRecord[]}
              planExercise={planExercise}
              exId={exercise.id!}
              nextTab={nextTab}
              logEx={logEx}
            />
          ) : history.type === RecordType.reps ? (
            <RepRecordForm
              prefill={history.record as RepRecord[]}
              planExercise={planExercise}
              exId={exercise.id!}
              nextTab={nextTab}
              logEx={logEx}
            />
          ) : history.type === RecordType.time ? (
            <TimeRecordForm
              prefill={history.record as TimeRecord[]}
              planExercise={planExercise}
              exId={exercise.id!}
              nextTab={nextTab}
              logEx={logEx}
            />
          ) : (
            <></>
          )}
        </View>
        <Button
          variant="secondary"
          size="floating"
          onPress={() => router.dismissAll()}
          className="absolute left-4 top-16 aspect-square rounded-full bg-foreground/60">
          <ThemedIcon name="ChevronLeft" size={24} inverted />
        </Button>
      </SwipeGesture>
    </SafeAreaView>
  );
}
