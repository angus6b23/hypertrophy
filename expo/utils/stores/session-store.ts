import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';

import { Workout } from 'share/interfaces/Records';

import { nanoid } from 'nanoid/non-secure';

import { mmkvStorage } from './persist';

interface WorkoutState {
  workouts: Workout[];
  current: null | Workout;
}
interface WorkoutAction {
  start: () => void;
  end: (rpe?: number) => void;
  log: (data: Partial<Workout>) => void;
  update: (localId: string, data: Partial<Workout>, updateTimeStamp?: boolean) => void;
  remove: (localId: string) => void;
  add: (data: Workout) => void;
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
            lastUpdate: new Date(),
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
                    new Date(prevState.current!.startTime).getTime() + 4 * 3600 * 1000
                  )
                ),
                exercises: prevState.current.exercises ?? [],
                lastUpdate: new Date(),
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
          current: { ...prevState.current!, ...data, lastUpdate: new Date() },
        }));
      },
      update: (localId: string, data: Partial<Workout>, updateTimeStamp = true) =>
        set((prevState) => ({
          workouts: prevState.workouts.map((item) =>
            item.localId === localId
              ? { ...item, ...data, ...(updateTimeStamp && { lastUpdate: new Date() }) }
              : item
          ),
        })),
      remove: (localId: string) =>
        set((prevState) => ({
          workouts: prevState.workouts.filter((item) => item.localId !== localId),
        })),
      add: (workout: Workout) =>
        set((prevState) => ({ workouts: [...prevState.workouts, workout] })),
      abandon: () => {
        set({ current: null });
      },
    }),
    { name: 'workoutStorage', storage: createJSONStorage(() => mmkvStorage) }
  )
);
