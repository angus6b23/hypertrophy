export interface Plan {
  id?: number;
  name: string;
  description?: string;
  localId: string;
  remoteId?: number;
  days: PlanDay[];
  isPublic: boolean;
  isWeekday: boolean;
}

export interface PlanDay {
  id?: number;
  planId?: number;
  name: string;
  day: number;
  exercises: PlanExercise[];
}

export interface PlanExercise {
  id?: number;
  dayId?: number;
  exerciseId: number;
  targetReps?: number | null;
  targetSets?: number | null;
  restTime?: number | null;
}
