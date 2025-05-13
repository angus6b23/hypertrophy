import { FlashList } from '@shopify/flash-list';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { ExerciseItem } from '~/components/ui/ExerciseItem';
import { useCurrentPlan } from '~/utils/hooks/use-current-plan';
import exerciseDb from 'share/exercises/exercises.json';
import { Exercise } from 'share/exercises/types/exercise';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useTranslation } from 'react-i18next';

const ExerciseDay = () => {
  const local = useLocalSearchParams();
  const idx = Number(local.idx as string);
  const currentPlan = useCurrentPlan();
  const [currentDay, setCurrentDay] = useState(currentPlan.days[idx]);
  useEffect(() => {
    setCurrentDay(currentPlan.days[idx]);
  }, [idx, currentPlan]);
  console.log(currentDay.exercises);

  return (
    <>
      <Stack.Screen options={{ title: `${currentDay.name}`, headerShown: true }} />
      <FlashList
        data={currentPlan.days[idx].exercises}
        keyExtractor={(item, idx) => `${item.exerciseId}-${idx}`}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 64 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={(item) => {
          const ex = exerciseDb.exercises.find((ex) => ex.id === item.item.exerciseId)! as Exercise;
          return <ExerciseItem exercise={ex} />;
        }}
        ListFooterComponent={<AddExerciseButton idx={idx} />}
        estimatedItemSize={10}
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
