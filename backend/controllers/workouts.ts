/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  insertWorkoutRecordSchema,
  insertWorkoutSchema,
} from "@/db/schema/workouts";
import { handleError, handleSuccess } from "@/utils/handleError";
import {
  addWorkout,
  addWorkoutRecord,
  deleteWorkout,
  getSingleWorkout,
  getUserWorkouts,
  getUserWorkoutsWithRecords,
} from "@/utils/workouts";
import { NextRequest } from "next/server";
import {
  AuthErrors,
  CustomError,
  PathErrors,
} from "share/interfaces/error-codes";
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
    console.log(error);
    return handleError(error);
  }
};

export const addWorkoutController = async (req: NextRequest) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const body: Workout = await req.json();
    const { id, lastSetTime, exercises, ...rest } = body;
    const parsed = insertWorkoutSchema.parse(rest);

    const newRowId = await addWorkout({ ...parsed, ownerId });
    const parsedExercise = z
      .array(insertWorkoutRecordSchema)
      .safeParse(exercises);
    if (!parsedExercise.success) {
      await deleteWorkout(newRowId);
      throw new Error(parsedExercise.error.message);
    } else {
      await addWorkoutRecord(newRowId, parsedExercise.data);
    }
    return handleSuccess({ id: newRowId });
  } catch (error) {
    return handleError(error);
  }
};

export const deleteWorkoutController = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const id = Number((await params).id);
    if (isNaN(id)) throw new CustomError(PathErrors.id_invalid, 400);
    const row = await getSingleWorkout(id);
    if (row.ownerId !== ownerId)
      throw new CustomError(AuthErrors.unauthorized_access, 403);
    await deleteWorkout(id);
    return handleSuccess();
  } catch (error) {
    return handleError(error);
  }
};
