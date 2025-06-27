import { RecordType } from "../exercises/types/exercise";

export interface Workout {
  id?: number;
  startTime: Date;
  endTime?: Date;
  RPE?: number;
  localId: string;
  exercises: ExerciseRecord[];
  remarks?: string;
  lastSetTime?: Date;
  public?: boolean;
}
export type AnyRecord =
  | RepRecord[]
  | CardioRecord
  | RepWeightRecord[]
  | TimeRecord[];

export interface ExerciseRecord {
  exerciseId: number;
  exercisePlanId: string;
  remarks?: string;
  finished: boolean;
  type: RecordType;
  record: AnyRecord;
}

export enum SetType {
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

export interface TimeRecord {
  time: number;
}
