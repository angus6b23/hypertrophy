import { Image } from 'expo-image';
import { Stack, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { YStack } from '~/components/ui/Stacks';
import { Text } from '~/components/ui/text';
import { useWorkoutStore } from '~/utils/stores/session-store';
import { backend } from '~/utils/backend';
import { toast } from 'sonner-native';
import { useWorkoutPlanStore } from '~/utils/stores/workout-plan-store';

export default function SyncPage() {
  const [stage, setStage] = useState(0);
  const [_isPending, startTransition] = useTransition();
  const nav = useNavigation();

  // Disable android back button
  useEffect(() => {
    const listener = nav.addListener('beforeRemove', (e) => {
      e.preventDefault();
      if (e.data.action.type !== 'GO_BACK') nav.dispatch(e.data.action);
    });

    return () => {
      nav.removeListener('beforeRemove', listener);
    };
  }, []);
  const plans = useWorkoutPlanStore((s) => s.plans);
  const addPlan = useWorkoutPlanStore((s) => s.add);
  const updatePlan = useWorkoutPlanStore((s) => s.update);

  const workouts = useWorkoutStore((s) => s.workouts);
  const addWorkout = useWorkoutStore((s) => s.add);
  const updateWorkout = useWorkoutStore((s) => s.update);

  const syncPlan = useCallback(async () => {
    const remotePlans = await backend.plans.getUserPlans();
    for (const rp of remotePlans) {
      const p = plans.find((p) => p.localId === rp.localId);
      if (!p) {
        const details = await backend.plans.getDetails(rp.id!);
        addPlan(details);
      } else if (p.lastUpdate < rp.lastUpdate) {
        const details = await backend.plans.getDetails(rp.id!);
        updatePlan(p.localId, details, false);
      }
    }
    for (const p of plans) {
      const rp = plans.find((rp) => rp.id === p.id);
      if (!rp) {
        const res = await backend.plans.add(p);
        updatePlan(p.localId, res, false);
      } else if (rp.lastUpdate < p.lastUpdate && p.id) {
        await backend.plans.update(p.id, p);
      }
    }
  }, [plans]);

  const syncWorkouts = useCallback(async () => {
    const remoteWorkouts = await backend.workouts.getDetails();
    for (const rw of remoteWorkouts) {
      const w = workouts.find((w) => w.localId === rw.localId);
      if (!w) {
        addWorkout(rw);
      } else if (w.lastUpdate < rw.lastUpdate) {
        updateWorkout(w.localId, rw, false);
      }
    }
    for (const w of workouts) {
      const rw = workouts.find((rw) => rw.id === w.id);
      if (!rw) {
        const res = await backend.workouts.add(w);
        updateWorkout(w.localId, res, false);
      } else if (rw.lastUpdate < w.lastUpdate && w.id) {
        await backend.workouts.update(w.id, w);
      }
    }
  }, [workouts]);

  const syncAll = useCallback(async () => {
    try {
      await syncPlan();
      startTransition(() => setStage((prev) => prev + 1));
      await syncWorkouts();
      startTransition(() => setStage((prev) => prev + 1));
    } catch (err) {
      toast.error((err as Error).message);
    }
  }, [syncWorkouts]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack justify="center" align="center">
        <Image
          source={require('~/assets/images/sync.svg')}
          style={{ width: 512, height: 256 }}
          className="h-64 w-96"
          contentFit="contain"
        />
        <Text className="text-lg">Syncing...</Text>
      </YStack>
    </>
  );
}
