import {
  insertPlanDaysSchema,
  insertPlanExercisesSchema,
  insertPlanSchema,
} from "@/db/schema/plans";
import { handleError } from "@/utils/handleError";
import {
  deletePlan,
  getPlanDetails,
  getPublicPlans,
  getUserPlan,
  insertPlan,
  insertPlanDay,
  insertPlanExercise,
} from "@/utils/plans";
import { NextRequest, NextResponse } from "next/server";
import { CustomError, PathErrors } from "share/interfaces/error-codes";
import { Plan, PlanDay, PlanExercise } from "share/interfaces/Workout";

export const getPlansController = async (req: NextRequest) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const url = new URL(req.nextUrl);
    const queries = url.searchParams;
    if (queries.get("public")) {
      const cursor = Number(queries.get("page")) || 0;
      const plans = await getPublicPlans(cursor);
      return NextResponse.json({ status: "success", data: plans });
    } else {
      const plans = await getUserPlan(ownerId);
      return NextResponse.json({ status: "success", data: plans });
    }
  } catch (err) {
    return handleError(err);
  }
};

export const postPlansController = async (req: NextRequest) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const json = await req.json();
    const data = { ...json, ownerId };
    const { days, ...rest }: { days: PlanDay[]; rest: Omit<Plan, "days"> } =
      data;

    const plan = insertPlanSchema.parse(rest);
    const { id: planId } = await insertPlan(plan);
    for (const day of days) {
      const dayWithPlanId = { ...day, planId };
      const {
        exercises,
        ...rest
      }: { exercises: PlanExercise[]; rest: Omit<PlanDay, "exercises"> } =
        dayWithPlanId;
      const parsedDay = insertPlanDaysSchema.parse(rest);
      const { id: dayId } = await insertPlanDay(parsedDay);
      for (const exercise of exercises) {
        const exerciseWithPlanDayId = { ...exercise, dayId };
        const parsedExercise = insertPlanExercisesSchema.parse(
          exerciseWithPlanDayId,
        );
        await insertPlanExercise(parsedExercise);
      }
    }
    return NextResponse.json({ status: "success" });
  } catch (err) {
    console.error(err);
    return handleError(err);
  }
};

export const deletePlanController = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const numberId = Number(id);
    if (isNaN(numberId)) throw new CustomError(PathErrors.id_invalid, 400);
    await deletePlan(numberId);
    return NextResponse.json({ status: "success" });
  } catch (err) {
    return handleError(err);
  }
};

export const getPlanDetailsController = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const ownerId = req.headers.get("x-user-id");
    const { id } = await params;
    return NextResponse.json({
      status: "success",
      data: await getPlanDetails(Number(id)),
    });
  } catch (err) {
    console.error(err);
    return handleError(err);
  }
};
