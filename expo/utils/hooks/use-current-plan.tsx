import { useWorkoutPlanStore } from '../stores/workout-plan-store';

export const useCurrentPlan = () => {
  const plans = useWorkoutPlanStore((s) => s.plans);
  const currPlanId = useWorkoutPlanStore((s) => s.currentPlan);
  return plans.find((plan) => plan.localId === currPlanId)!;
};
