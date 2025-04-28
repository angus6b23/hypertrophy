import { Redirect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { YStack } from '~/components/ui/Stacks';
import { Text } from '~/components/ui/text';
import { useWorkoutPlanStore } from '~/utils/stores/workout-plan-store';

export const CurrentWorkoutPage = () => {
  const workoutPlanStore = useWorkoutPlanStore();

  if (!workoutPlanStore.currentPlan) {
    return <Redirect href="/(tabs)/workout/listPlan" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'current workout plan' }} />
      <SafeAreaView style={{ flex: 1, flexDirection: 'column' }}>
        <YStack>
          <Text>CurrentWorkout</Text>
          <Text>CurrentWorkout</Text>
          <Text>CurrentWorkout</Text>
          <Text>CurrentWorkout</Text>
        </YStack>
      </SafeAreaView>
    </>
  );
};
