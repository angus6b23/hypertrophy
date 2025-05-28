import { Stack, useLocalSearchParams } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';
import { useCurrentPlan } from '~/utils/hooks/use-current-plan';
import { TabBar, TabView } from 'react-native-tab-view';
import exerciseDb from 'share/exercises/exercises.json';
import { Exercise } from 'share/exercises/types/exercise';
import { Text } from '~/components/ui/text';
import { Dimensions, ScrollView, View } from 'react-native';
import { useColors } from '~/utils/rn-reusables/useColors';
import { BannerImage } from './[id]';
import { LinearGradient } from 'expo-linear-gradient';
import { SwipeGesture } from 'react-native-swipe-gesture-handler';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import { Button } from '~/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useExerciseHistory } from '~/utils/hooks/use-exercise-history';
import { RepWithWeightRecordForm } from '~/components/ui/ExerciseLogForms';
import { RepWeightRecord } from 'share/interfaces/Records';

interface LogContextType {
  showImg: boolean;
  setShowImg: React.Dispatch<React.SetStateAction<boolean>>;
}
const LogContext = createContext<LogContextType>({
  showImg: true,
  setShowImg: () => {},
});

const ExerciseLogs = () => {
  const localParams = useLocalSearchParams();
  const day: number = Number(localParams.day);
  const ex: number = Number(localParams.exercise);

  const currentPlan = useCurrentPlan();
  const [currDay, setCurrDay] = useState(currentPlan.days[day]);
  const [showImg, setShowImg] = useState(true);
  const [tab, setTab] = useState(ex);
  const colors = useColors();

  const exercises = currDay.exercises.map(
    (planEx) => exerciseDb.exercises.find((ex) => ex.id === planEx.exerciseId)!
  );

  useEffect(() => {
    setCurrDay(currentPlan.days[day]);
  }, [currentPlan, day]);

  return (
    <LogContext.Provider value={{ showImg, setShowImg }}>
      <Stack.Screen
        options={{ title: `${currDay.name}`, headerShown: true, headerShadowVisible: false }}
      />
      <TabView
        navigationState={{
          index: tab,
          routes: exercises.map((ex, i) => ({
            key: `${i.toString()}-${ex.id}`,
            title: ex.name,
          })),
        }}
        style={{ padding: 0 }}
        renderScene={({ route }) => (
          <LogTab exercise={exercises[Number(route.key.split('-')[0])] as Exercise} />
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

const LogTab = ({ exercise }: { exercise: Exercise }) => {
  const history = useExerciseHistory(exercise.id!);
  const { exercisePlanId } = useLocalSearchParams();
  const { setShowImg } = useContext(LogContext);

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
        <ScrollView className="m-4">
          {history.type === 'reps_with_weight' && (
            <RepWithWeightRecordForm
              prefill={history.record as RepWeightRecord[]}
              exercisePlanId={exercisePlanId as string}
            />
          )}
          <View className="h-2 w-2 bg-green-400" />
        </ScrollView>
        <LogButton />
      </View>
    </SwipeGesture>
  );
};

const LogBanner = ({ exercise }: { exercise: Exercise }) => {
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

const LogButton = () => {
  const { t } = useTranslation();
  return (
    <View className="absolute bottom-16 left-0 w-full px-4">
      <Button>
        <Text>{t('common.log')}</Text>
      </Button>
    </View>
  );
};
export default ExerciseLogs;
