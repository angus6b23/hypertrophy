import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useCurrentPlan } from '~/utils/hooks/use-current-plan';
import { TabBar, TabView } from 'react-native-tab-view';
import exerciseDb from 'share/exercises/exercises.json';
import { Exercise, RecordType } from 'share/exercises/types/exercise';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Dimensions, View } from 'react-native';
import { useColors } from '~/utils/rn-reusables/useColors';
import { BannerImage } from './[id]';
import { LinearGradient } from 'expo-linear-gradient';
import { SwipeGesture } from 'react-native-swipe-gesture-handler';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import { useExerciseHistory } from '~/utils/hooks/use-exercise-history';
import {
  RepRecordForm,
  RepWithWeightRecordForm,
  TimeRecordForm,
} from '~/components/ui/ExerciseLogForms';
import { AnyRecord, RepRecord, RepWeightRecord, TimeRecord } from 'share/interfaces/Records';
import { PlanExercise } from 'share/interfaces/Workout';
import { XStack } from '~/components/ui/Stacks';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { t } from 'i18next';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { useWorkoutStore } from '~/utils/stores/session-store';
import { useAudioPlayer } from 'expo-audio';

interface LogContextType {
  showImg: boolean;
  setShowImg: React.Dispatch<React.SetStateAction<boolean>>;
  nextTab: () => void;
  logEx: (t: number) => void;
  remainingRest: number;
}
export const LogContext = createContext<LogContextType>({
  showImg: true,
  setShowImg: () => {},
  nextTab: () => {},
  logEx: () => {},
  remainingRest: 0,
});

const beep = require('~/assets/audio/beep.wav');

const ExerciseLogs = () => {
  const localParams = useLocalSearchParams();
  const router = useRouter();

  const player = useAudioPlayer(beep);
  // Index of day of current plan
  const day: number = Number(localParams.day);
  // Index of exercise of the day of current plan
  const ex: number = Number(localParams.exercise);

  // For displaying rest timer
  const [restTime, setResttime] = useState(0);
  const [lastLog, setLastLog] = useState(new Date());
  const [remainingRest, setRemainingRest] = useState(0);

  const currentPlan = useCurrentPlan();
  const [currDay, setCurrDay] = useState(currentPlan.days[day]);
  const [showImg, setShowImg] = useState(true);
  const [tab, setTab] = useState(ex);
  const colors = useColors();

  const exercises = currDay.exercises.map((planEx) => ({
    ...exerciseDb.exercises.find((ex) => ex.id === planEx.exerciseId)!,
    exercisePlanId: planEx.localId!,
  }));

  const nextTab = useCallback(() => {
    const exCount = currDay.exercises.length;
    if (tab === exCount - 1) {
      router.dismiss();
    } else {
      setTab((prev) => prev + 1);
    }
  }, [currDay, tab, setTab]);

  useEffect(() => {
    setCurrDay(currentPlan.days[day]);
  }, [currentPlan, day]);

  const getRemainingRestTime = useCallback(() => {
    return Math.round((restTime * 1000 - (Date.now() - lastLog.getTime())) / 1000);
  }, [lastLog, restTime]);

  useFocusEffect(() => {
    const interval = setInterval(() => {
      const res = getRemainingRestTime();
      if (res > -1) {
        setRemainingRest(res);
        if (res === 0) {
          player.seekTo(0);
          player.play();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  });

  const logEx = useCallback(
    (restTime: number) => {
      setLastLog(new Date());
      setResttime(restTime);
    },
    [setLastLog, setResttime]
  );

  return (
    <LogContext.Provider value={{ showImg, setShowImg, nextTab, logEx, remainingRest }}>
      <Stack.Screen
        options={{ title: `${currDay.name}`, headerShown: true, headerShadowVisible: false }}
      />
      <TabView
        navigationState={{
          index: tab,
          routes: exercises.map((ex, i) => ({
            key: `${i.toString()}-${ex.exercisePlanId}`,
            title: ex.name,
          })),
        }}
        style={{ padding: 0 }}
        renderScene={({ route }) => (
          <LogTab
            exercise={exercises[Number(route.key.split('-')[0])] as Exercise}
            planExercise={currDay.exercises[Number(route.key.split('-')[0])] as PlanExercise}
          />
        )}
        onIndexChange={setTab}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            activeColor={colors.text}
            inactiveColor={colors.text}
            style={{ backgroundColor: colors.background, width: Dimensions.get('window').width }}
            indicatorStyle={{ backgroundColor: colors.text }}
            scrollEnabled={true}
          />
        )}
        swipeEnabled={true}
      />
    </LogContext.Provider>
  );
};

const LogTab = ({ exercise, planExercise }: { exercise: Exercise; planExercise: PlanExercise }) => {
  const history = useExerciseHistory(planExercise);
  const { setShowImg, nextTab, logEx } = useContext(LogContext);

  return (
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
    </SwipeGesture>
  );
};

export const LogBanner = ({ exercise }: { exercise: Exercise }) => {
  const { showImg } = useContext(LogContext);
  return (
    <View className="relative">
      {showImg ? (
        <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
          <BannerImage path={exercise.path} name={exercise.name} />
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(0,0,0,0.8)']}
            className="absolute h-full w-full"
          />
          <Text className="absolute bottom-2 left-4 text-3xl text-white">{exercise.name}</Text>
        </Animated.View>
      ) : (
        <Animated.Text
          entering={FadeInDown}
          exiting={FadeOutDown}
          className="ml-4 mt-4 text-2xl text-foreground">
          {exercise.name}
        </Animated.Text>
      )}
    </View>
  );
};

export const Toolbar = ({
  exercise,
  planExercise,
}: {
  exercise: Exercise;
  planExercise: PlanExercise;
}) => {
  const router = useRouter();
  const colors = useColors();
  const log = useWorkoutStore((s) => s.log);
  const session = useWorkoutStore((s) => s.current);
  const start = useWorkoutStore((s) => s.start);

  const getRemarks = useCallback(() => {
    return (
      session?.exercises.find((ex) => ex.exercisePlanId === planExercise.localId)?.remarks || ''
    );
  }, [session]);

  const [remarks, setRemarks] = useState(getRemarks());

  useEffect(() => {
    setRemarks(getRemarks());
  }, [session]);

  const handleLog = () => {
    if (!session) {
      start();
      log({
        exercises: [
          {
            exercisePlanId: planExercise.localId,
            exerciseId: exercise.id as number,
            record: (exercise.record_type === RecordType.cardio ? {} : []) as AnyRecord,
            type: exercise.record_type,
            finished: false,
          },
        ],
      });
    } else {
      const ex = session.exercises;
      let found = false;
      for (const e of ex) {
        if (e.exercisePlanId === planExercise.localId) {
          e.remarks = remarks;
          found = true;
        }
      }
      if (!found) {
        ex.push({
          exercisePlanId: planExercise.localId,
          exerciseId: exercise.id as number,
          record: (exercise.record_type === RecordType.cardio ? {} : []) as AnyRecord,
          type: exercise.record_type,
          finished: false,
        });
      }
      log({ exercises: ex });
    }
  };

  return (
    <XStack fill={false} justify="end" padding="none" gap="sm" className="py-0">
      <Button
        variant="ghost"
        onPress={() => {
          router.push(`/(zShare)/exercise/${exercise.id}?hide_add_button=true`);
        }}>
        <ThemedIcon name="ChartColumn" color={colors.text} size={20} />
      </Button>
      <Dialog onOpenChange={handleLog}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="p-0">
            <ThemedIcon name="NotebookPen" size={20} />
          </Button>
        </DialogTrigger>
        <DialogContent className="min-w-96">
          <DialogHeader>
            <DialogTitle>{t('commont.remarks')}</DialogTitle>
            <DialogDescription>
              <Input
                className="min-h-96 w-full"
                placeholder={t('workout.enter_remark')}
                value={remarks}
                onChangeText={(s) => setRemarks(s)}
              />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button>
                <Text>{t('common.finish')}</Text>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </XStack>
  );
};

export default ExerciseLogs;
