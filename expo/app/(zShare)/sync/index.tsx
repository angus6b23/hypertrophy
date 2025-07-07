import { Image } from 'expo-image';
import { Stack, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { YStack } from '~/components/ui/Stacks';
import { Text } from '~/components/ui/text';
import { useWorkoutStore } from '~/utils/stores/session-store';
import { backend } from '~/utils/backend';
import { toast } from 'sonner-native';
import { useWorkoutPlanStore } from '~/utils/stores/workout-plan-store';
import { useMeasurementStore } from '~/utils/stores/measurement-store';
import { Progress } from '~/components/ui/progress';

export default function SyncPage() {
  const [stage, setStage] = useState(0);
  const [_isPending, startTransition] = useTransition();
  const router = useRouter();
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

  const measurements = useMeasurementStore((s) => s.data);
  const addMeasurement = useMeasurementStore((s) => s.add);
  const updateMeasurement = useMeasurementStore((s) => s.update);

  const syncPlan = useCallback(async () => {
    // console.log(plans[0].days[0]);
    const remotePlans = await backend.plans.getUserPlans();
    for (const rp of remotePlans) {
      const p = plans.find((p) => p.localId === rp.localId);
      if (!p) {
        const details = await backend.plans.getDetails(rp.id!);
        addPlan(details);
      } else if (new Date(p.lastUpdate).getTime() < new Date(rp.lastUpdate).getTime() || !p.id) {
        const details = await backend.plans.getDetails(rp.id!);
        updatePlan(p.localId, details, false);
      }
    }
    for (const p of plans) {
      const rp = remotePlans.find((rp) => rp.id === p.id);
      console.log(p.name, rp?.lastUpdate, p.lastUpdate);
      if (!rp) {
        const res = await backend.plans.add(p);
        updatePlan(p.localId, res, false);
      } else if (new Date(rp.lastUpdate).getTime() < new Date(p.lastUpdate).getTime() && p.id) {
        console.log('updating plan');
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
      } else if (new Date(w.lastUpdate).getTime() < new Date(rw.lastUpdate).getTime() || !w.id) {
        updateWorkout(w.localId, rw, false);
      }
    }
    for (const w of workouts) {
      const rw = remoteWorkouts.find((rw) => rw.id === w.id);
      if (!rw) {
        const res = await backend.workouts.add(w);
        updateWorkout(w.localId, res, false);
      } else if (new Date(rw.lastUpdate).getTime() < new Date(w.lastUpdate).getTime() && w.id) {
        await backend.workouts.update(w.id, w);
      }
    }
  }, [workouts]);

  const syncMeasurements = useCallback(async () => {
    const remoteMeasurements = await backend.measurement.get();
    for (const rm of remoteMeasurements) {
      const m = measurements.find((m) => m.localId === rm.localId);
      if (!m) {
        addMeasurement(rm);
      } else if (new Date(m.lastUpdate).getTime() < new Date(rm.lastUpdate).getTime() || !m.id) {
        updateMeasurement(m.localId, rm, false);
      }
    }
    for (const m of measurements) {
      const rm = remoteMeasurements.find((rm) => rm.id === m.id);
      if (!rm) {
        const res = await backend.measurement.add(m);
        updateMeasurement(m.localId, res, false);
      } else if (new Date(rm.lastUpdate).getTime() < new Date(m.lastUpdate).getTime() && m.id) {
        await backend.measurement.update(m);
      }
    }
  }, [measurements]);

  const syncAll = useCallback(async () => {
    try {
      await syncPlan();
      startTransition(() => setStage((prev) => prev + 1));
      await syncWorkouts();
      startTransition(() => setStage((prev) => prev + 1));
      await syncMeasurements();
      startTransition(() => setStage((prev) => prev + 1));
      router.dismiss();
    } catch (err) {
      toast.error((err as Error).message);
      router.dismiss();
    }
  }, [syncWorkouts, syncPlan, syncMeasurements]);

  useEffect(() => {
    syncAll();
  }, []);

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
        <Progress value={stage * 33} />
      </YStack>
    </>
  );
}
