import { Stack } from 'expo-router';

import { useWorkoutStore } from '~/utils/stores/session-store';
import { useMeasurementStore } from '~/utils/stores/measurement-store';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';

const DebugPage = () => {
  const workoutStore = useWorkoutStore();
  const measurementStore = useMeasurementStore();
  return (
    <>
      <Stack.Screen options={{ headerShown: true }} />
      <Button
        onPress={() => {
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
      <Button
        onPress={() => {
          workoutStore.workouts.forEach((wo) => {
            if (!wo.exercises) {
              workoutStore.remove(wo.localId);
            }
          });
        }}>
        <Text>Clear Empty Session</Text>
      </Button>
      <Button
        onPress={() => {
          measurementStore.data.forEach((m) => measurementStore.delete(m.localId));
        }}>
        <Text>Clear All Measurements</Text>
      </Button>
    </>
  );
};

export default DebugPage;
