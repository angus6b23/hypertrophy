import { db } from "@/db";
import {
  Plan,
  PlanDay,
  PlanExercises,
  planDays,
  plans,
  planExercises,
} from "@/db/schema/plans";
import { and, asc, eq, gt } from "drizzle-orm";
import { single } from "./db-helper";
import {
  Plan as PlanType,
  PlanDay as PlanDayType,
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
  const newPlan = await db.insert(plans).values(plan).returning().then(single);
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
