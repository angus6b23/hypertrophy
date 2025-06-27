import { Stack } from 'expo-router';
import { ExerciseList } from '~/app/(zShare)/exercise/list';

export default function ExerciseView() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true }} />
      <ExerciseList />
    </>
  );
}
