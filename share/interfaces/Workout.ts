export interface Plan {
  id?: number;
  ownerId?: string;
  name: string;
  description?: string;
  localId: string;
  remoteId?: number;
  days: PlanDay[];
  isPublic: boolean;
  isWeekday: boolean;
  lastUpdate: Date | string;
}

export interface PublicPlan {
  id: number;
  name: string;
  description: string;
  owner: string;
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
  localId: string;
  dayId?: number;
  exerciseId: number;
  targetReps?: number | null;
  targetSets?: number | null;
  restTime?: number | null;
}
