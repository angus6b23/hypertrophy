/* eslint-disable @typescript-eslint/no-unused-vars */

import { db } from "@/db";
import {
  InsertWorkoutRecordSchema,
  InsertWorkoutSchema,
  SelectWorkoutRecordSchema,
  SelectWorkoutSchema,
  UpdateWorkoutSchema,
  workoutRecords,
  workouts,
} from "@/db/schema/workouts";
import { and, eq } from "drizzle-orm";
import { single } from "./db-helper";

interface WorkoutResponse extends SelectWorkoutSchema {
  exercises: Omit<SelectWorkoutRecordSchema, "workoutId">[];
}
export const getUserWorkouts = async (ownerId: string) => {
  const res = await db
    .select()
    .from(workouts)
    .where(eq(workouts.ownerId, ownerId));
  return res;
};

export const getUserWorkoutsWithRecords = async (ownerId: string) => {
  const rows = await db
    .select()
    .from(workouts)
    .where(eq(workouts.ownerId, ownerId))
    .leftJoin(workoutRecords, eq(workouts.id, workoutRecords.workoutId));
  const res = rows.reduce<WorkoutResponse[]>((acc, row) => {
    const workout = row.workouts;
    const { workoutId, ...exercise } = row[
      "workouts-exercise"
    ]! as SelectWorkoutRecordSchema;
    const accWorkout = acc.find((w) => w.id === workout.id);

    if (!accWorkout) {
      acc.push({ ...workout, exercises: [exercise] });
    } else {
      accWorkout.exercises.push(exercise);
    }
    return acc;
  }, []);
  return res;
};

export const getWorkoutByLocalId = async (localId: string, ownerId: string) => {
  return db
    .select()
    .from(workouts)
    .where(and(eq(workouts.localId, localId), eq(workouts.ownerId, ownerId)))
    .limit(1)
    .then(single);
};
export const getSingleWorkout = async (id: number) => {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.id, id))
    .limit(1)
    .then(single);
};

export const addWorkout = async (data: InsertWorkoutSchema) => {
  const row = await db.insert(workouts).values(data).returning().then(single);
  return row.id;
};

export const addWorkoutRecord = async (
  workoutId: number,
  data: InsertWorkoutRecordSchema[],
) => {
  await db
    .insert(workoutRecords)
    .values(data.map((d) => ({ ...d, workoutId })));
};

export const updateWorkout = async (data: UpdateWorkoutSchema, id: number) => {
  const { id: _id, ownerId, ...rest } = data;
  await db
    .update(workouts)
    .set(rest)
    .where(eq(workouts.id, id))
    .returning()
    .then(single);
};

export const deleteWorkout = async (workoutId: number) => {
  await db.delete(workouts).where(eq(workouts.id, workoutId));
};

export const deleteWorkoutRecords = async (workoutId: number) => {
  await db
    .delete(workoutRecords)
    .where(eq(workoutRecords.workoutId, workoutId));
};
