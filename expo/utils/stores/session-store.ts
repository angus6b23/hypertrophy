import { Workout } from 'share/interfaces/Records';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from './persist';
import { nanoid } from 'nanoid/non-secure';

interface WorkoutState {
  workouts: Workout[];
  current: null | Workout;
}
interface WorkoutAction {
  start: () => void;
  end: (rpe?: number) => void;
  log: (data: Partial<Workout>) => void;
  update: (localId: string, data: Partial<Workout>) => void;
  remove: (localId: string) => void;
  abandon: () => void;
}
export const useWorkoutStore = create<WorkoutState & WorkoutAction>()(
  persist<WorkoutState & WorkoutAction>(
    (set) => ({
      workouts: [],
      current: null,

      start: () => {
        set({
          current: {
            startTime: new Date(),
            localId: nanoid(10),
            exercises: [],
          },
        });
      },
      end: (rpe?: number) => {
        set((prevState) => {
          if (!prevState.current) return prevState;
          return {
            ...prevState,
            workouts: [
              ...prevState.workouts,
              {
                ...prevState.current,
                endTime: new Date(
                  Math.min(
                    Date.now(),
                    new Date(prevState.current!.startTime as string).getTime() + 4 * 3600 * 1000
                  )
                ),
                RPE: rpe,
              } as Workout,
            ],
            current: null,
          };
        });
      },
      log: (data: Partial<Workout>) => {
        set((prevState) => ({
          ...prevState,
          current: { ...prevState.current!, ...data },
        }));
      },
      update: (localId: string, data: Partial<Workout>) =>
        set((prevState) => ({
          workouts: prevState.workouts.map((item) =>
            item.localId === localId ? { ...item, ...data } : item
          ),
        })),
      remove: (localId: string) =>
        set((prevState) => ({
          workouts: prevState.workouts.filter((item) => item.localId !== localId),
        })),
      abandon: () => {
        set({ current: null });
      },
    }),
    { name: 'workoutStorage', storage: createJSONStorage(() => mmkvStorage) }
  )
);
