import { Stack } from 'expo-router';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useWorkoutStore } from '~/utils/stores/session-store';

const DebugPage = () => {
  const workoutStore = useWorkoutStore();
  return (
    <>
      <Stack.Screen options={{ headerShown: true }} />
      <Button
        onPress={() => {
          console.log(workoutStore.workouts);
          workoutStore.end();
        }}>
        <Text>End Session</Text>
      </Button>
      <Button
        onPress={() => {
          workoutStore.end();
          workoutStore.workouts.forEach((wo) => workoutStore.remove(wo.localId));
        }}>
        <Text>Clear All Session</Text>
      </Button>
    </>
  );
};

export default DebugPage;
