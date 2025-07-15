/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  insertWorkoutRecordSchema,
  insertWorkoutSchema,
  updateWorkoutSchema,
} from "@/db/schema/workouts";
import { handleError, handleSuccess } from "@/utils/handleError";
import {
  addWorkout,
  addWorkoutRecord,
  deleteWorkout,
  deleteWorkoutRecords,
  getUserWorkouts,
  getUserWorkoutsWithRecords,
  getWorkoutByLocalId,
  updateWorkout,
} from "@/utils/workouts";
import { NextRequest } from "next/server";
import { CustomError, PathErrors } from "share/interfaces/error-codes";
import { Workout } from "share/interfaces/Records";
import z from "zod";

export const listOwnWorkoutController = async (req: NextRequest) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const url = req.nextUrl;
    const withRecords = url.searchParams.get("details") === "true";
    if (withRecords) {
      return handleSuccess(await getUserWorkoutsWithRecords(ownerId));
    } else {
      return handleSuccess(await getUserWorkouts(ownerId));
    }
  } catch (error) {
    return handleError(error);
  }
};

export const addWorkoutController = async (req: NextRequest) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const body: Workout = await req.json();
    const { id, lastSetTime, exercises, ...rest } = body;
    const parsed = insertWorkoutSchema.omit({ ownerId: true }).parse({
      ...rest,
      rpe: rest.RPE,
      lastUpdate: new Date(rest.lastUpdate),
      startTime: new Date(rest.startTime),
      endTime: new Date(rest.endTime!),
    });

    const newRowId = await addWorkout({ ...parsed, ownerId });

    const parsedExercise = z.array(insertWorkoutRecordSchema).safeParse(
      exercises.map((e) => ({
        ...e,
        workoutId: newRowId,
      })),
    );
    if (!parsedExercise.success) {
      await deleteWorkout(newRowId);
      throw new Error(parsedExercise.error.message);
    } else {
      await addWorkoutRecord(newRowId, parsedExercise.data);
    }
    return handleSuccess({ id: newRowId });
  } catch (error) {
    console.log(error);
    return handleError(error);
  }
};

export const deleteWorkoutController = async (
  req: NextRequest,
  { params }: { params: Promise<{ localId: string }> },
) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const localId = (await params).localId;
    if (!localId) throw new CustomError(PathErrors.id_invalid, 400);
    const { id } = await getWorkoutByLocalId(localId, ownerId);
    await deleteWorkout(id);
    return handleSuccess();
  } catch (error) {
    return handleError(error);
  }
};

export const updateWorkoutController = async (
  req: NextRequest,
  { params }: { params: Promise<{ localId: string }> },
) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const localId = (await params).localId;
    const body: Partial<Workout> = await req.json();
    if (!localId) throw new CustomError(PathErrors.id_invalid, 400);

    const { id } = await getWorkoutByLocalId(localId, ownerId);

    const { exercises, id: _id, ...rest } = body;

    const parsedWorkout = updateWorkoutSchema.parse(rest);

    if (exercises) {
      const schema = z.array(insertWorkoutRecordSchema);
      const parsedExercises = schema.parse(
        exercises.map((e) => ({ ...e, workoutId: id })),
      );

      await deleteWorkoutRecords(id);
      await addWorkoutRecord(id, parsedExercises);
    }
    updateWorkout(parsedWorkout, id);
    return handleSuccess({ id });
  } catch (error) {
    return handleError(error);
  }
};
