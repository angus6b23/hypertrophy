export interface Workout {
  startTime: Date;
  endTime?: Date;
  RPE: number;
  localId: string;
  exercises: ExerciseRecord[];
  remarks?: string;
}

export interface ExerciseRecord {
  exercisdId: number;
  remarks?: string;
  record: RepRecord[] | CardioRecord | RepWeightRecord[];
}

enum SetType {
  normal,
  warmup,
  dropset,
  superset,
}

export interface RepRecord {
  reps: number;
  type: SetType;
}
export interface RepWeightRecord extends RepRecord {
  weight: number;
}

export interface CardioRecord {
  distance?: number;
  speed?: number;
  time?: number;
  targetHR?: number;
}
