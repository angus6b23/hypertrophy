import { db } from "@/db";
import {
  Plan,
  PlanDay,
  PlanExercises,
  planDays,
  plans,
  planExercises,
  insertPlanDaysSchema,
  insertPlanExercisesSchema,
  insertPlanSchema,
} from "@/db/schema/plans";
import { and, asc, eq, gt } from "drizzle-orm";
import { single } from "./db-helper";
import {
  Plan as PlanType,
  PlanDay as PlanDayType,
  PlanExercise,
} from "share/interfaces/Workout";

export const getUserPlan = async (userId: string) => {
  const userPlans = await db
    .select()
    .from(plans)
    .where(eq(plans.ownerId, userId));
  return userPlans;
};

export const getPublicPlans = async (cursor = 0) => {
  const publicPlans = await db
    .select()
    .from(plans)
    .limit(20)
    .where(and(eq(plans.isPublic, true), gt(plans.id, cursor)))
    .orderBy(asc(plans.id));
  return publicPlans;
};

export const getPlanOnwer = async (id: number) => {
  const plan = await db
    .select()
    .from(plans)
    .where(eq(plans.id, id))
    .limit(1)
    .then(single);
  return plan.ownerId;
};

export const getPlanDetails = async (id: number) => {
  const plan = await db
    .select()
    .from(plans)
    .where(eq(plans.id, id))
    .innerJoin(planDays, eq(plans.id, planDays.planId))
    .innerJoin(planExercises, eq(planDays.id, planExercises.dayId));
  const reducedPlan = plan.reduce((acc, row) => {
    const day: PlanDayType = {
      ...row.plan_days,
      exercises: [row.plan_exercises],
    };

    if (!acc.id) {
      acc = { ...row.plans, days: [day] };
    } else {
      const accDay = acc.days.find((d) => d.id === day.id);
      if (!accDay) {
        acc.days.push(day);
      } else {
        accDay.exercises.push(row.plan_exercises);
      }
    }
    return acc;
  }, {} as PlanType);
  return reducedPlan;
};

export const insertPlan = async (plan: Plan) => {
  const newPlan = await db
    .insert(plans)
    .values(plan)
    .onConflictDoUpdate({
      target: plans.id,
      set: { ...plan },
    })
    .returning()
    .then(single);
  return newPlan;
};

export const insertPlanDay = async (planDay: PlanDay) => {
  const newPlanDay = await db
    .insert(planDays)
    .values(planDay)
    .returning()
    .then(single);
  return newPlanDay;
};

export const insertPlanExercise = async (planExercise: PlanExercises) => {
  const newPlanExercise = await db
    .insert(planExercises)
    .values(planExercise)
    .returning()
    .then(single);
  return newPlanExercise;
};

export const deletePlan = async (id: number) => {
  await db.delete(plans).where(eq(plans.id, id));
};

export const updatePlan = async (id: number, plan: Plan) => {
  // Deconstruct id and ownerId, disallowing chaning of these fields
  const { id: _id, ownerId: _ownerId, ...planData } = plan;
  await db.update(plans).set(planData).where(eq(plans.id, id));
};

export const insertPlanPayload = async (payload: PlanType) => {
  const { days, ...rest }: { days: PlanDayType[]; rest: Omit<Plan, "days"> } =
    payload;
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
};

export const clearPlan = async (id: number) => {
  await db.delete(planDays).where(eq(planDays.planId, id));
};
