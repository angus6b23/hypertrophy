import { Plan } from 'share/interfaces/Workout';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from './persist';

interface WorkoutPlanState {
  plans: Plan[];
  currentPlan: string;
}
interface WorkoutPlanAction {
  add: (data: Plan) => void;
  change: (newPlanId: string) => void;
  update: (localId: string, data: Partial<Plan>) => void;
  delete: (localId: string) => void;
}
export const useMeasurementStore = create<WorkoutPlanAction & WorkoutPlanState>()(
  persist<WorkoutPlanState & WorkoutPlanAction>(
    (set) => ({
      plans: [],
      currentPlan: '',

      add: (newData: Plan) => set((prevState) => ({ plans: [newData, ...prevState.plans] })),
      change: (newPlanId: string) =>
        set(() => ({
          currentPlan: newPlanId,
        })),
      update: (localId: string, data: Partial<Plan>) =>
        set((prevState) => ({
          plans: prevState.plans.map((item) =>
            item.localId === localId ? { ...item, ...data } : item
          ),
        })),
      delete: (localId: string) =>
        set((prevState) => ({ plans: prevState.plans.filter((item) => item.localId !== localId) })),
    }),
    { name: 'planStorage', storage: createJSONStorage(() => mmkvStorage) }
  )
);
