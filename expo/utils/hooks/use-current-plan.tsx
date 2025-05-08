import { useWorkoutPlanStore } from '../stores/workout-plan-store';

export const useCurrentPlan = () => {
  const workPlanStore = useWorkoutPlanStore();
  return workPlanStore.plans.find((plan) => plan.localId === workPlanStore.currentPlan)!;
};
