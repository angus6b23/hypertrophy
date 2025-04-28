import { Link, Redirect, Stack } from 'expo-router';
import { SafeAreaView, TouchableNativeFeedback } from 'react-native';
import { YStack } from '~/components/ui/Stacks';
import { useWorkoutPlanStore } from '~/utils/stores/workout-plan-store';
import { Text } from '~/components/ui/text';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemedIcon } from '~/components/ui/ThemedIcon';

const WorkoutPage = () => {
  const { t } = useTranslation();
  const workoutPlanStore = useWorkoutPlanStore();
  const plan = workoutPlanStore.plans.find((plan) => plan.localId === workoutPlanStore.currentPlan);

  if (!plan) {
    return <Redirect href="/(tabs)/workout/listPlan" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `${t('plan.current_plan')}: ${plan.name}`,
          headerShown: true,
          headerRight: () => (
            <Link href="/(tabs)/workout/listPlan">
              <ThemedIcon name="SquarePen" size={24} />
            </Link>
          ),
        }}
      />
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

export default WorkoutPage;
