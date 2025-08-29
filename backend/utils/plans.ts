/* eslint-disable @typescript-eslint/no-unused-vars */

import { db } from "@/db";
import {
  planDays,
  plans,
  planExercises,
  insertPlanDaysSchema,
  insertPlanExercisesSchema,
  insertPlanSchema,
  InsertPlanSchema,
  InsertPlanDaysSchema,
  InsertPlanExercisesSchema,
  UpdatePlanSchema,
} from "@/db/schema/plans";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { single } from "./db-helper";
import { Plan, PlanDay } from "share/interfaces/Workout";
import z from "zod";
import { nanoid } from "nanoid";
import { users } from "@/db/schema/users";
import { PgColumn } from "drizzle-orm/pg-core";

/**
 * Get plans created by user from db
 *
 * @param userId - id of the user
 * @returns Plan[]
 *
 */
export const getUserPlan = async (userId: string) => {
  const userPlans = await db
    .select()
    .from(plans)
    .where(eq(plans.ownerId, userId));
  return userPlans;
};

/**
 * Get plans checked for public from db
 *
 * @returns Plan[]
 *
 */
export const getPublicPlans = async (
  query = "",
  cursor = 1,
  ascending = false,
  sort = "update",
) => {
  let sortCol: typeof plans.lastUpdate | typeof plans.name = plans.lastUpdate;
  if (sort === "name") {
    sortCol = plans.name;
  }

  const publicPlans = await db
    .select({
      id: plans.id,
      name: plans.name,
      description: plans.description,
      owner: users.displayName,
    })
    .from(plans)
    .innerJoin(users, eq(plans.ownerId, users.id))
    .limit(20)
    .offset(20 * (cursor - 1))
    .where(
      query
        ? and(
            eq(plans.isPublic, true),
            or(
              ilike(plans.name, `%${query}%`),
              ilike(plans.description, `%${query}%`),
            ),
          )
        : eq(plans.isPublic, true),
    )
    .orderBy(ascending ? asc(sortCol) : desc(sortCol));
  return publicPlans;
};

/**
 * Get the userid of a given plan id
 *
 * @param id - id of a plan
 * @returns userid: string
 *
 */
export const getPlanOnwer = async (id: number) => {
  const plan = await db
    .select()
    .from(plans)
    .where(eq(plans.id, id))
    .limit(1)
    .then(single);
  return plan.ownerId;
};

export const getPlanDetails = async (localId: string, ownerId: string) => {
  const { id } = await getPlanByLocalId(localId, ownerId);
  const plan = await db
    .select()
    .from(plans)
    .where(eq(plans.id, id))
    .leftJoin(planDays, eq(plans.id, planDays.planId))
    .leftJoin(planExercises, eq(planDays.id, planExercises.dayId));
  const reducedPlan = plan.reduce((acc, row) => {
    let day: PlanDay | null = null;
    if (row.plan_days) {
      day = {
        ...row.plan_days,
        exercises: row.plan_exercises
          ? [{ ...row.plan_exercises, localId: nanoid(5) }]
          : [],
      };
    }

    if (!day) {
      acc = { ...row.plans, days: [] };
      return acc;
    }

    if (!acc.id) {
      acc = { ...row.plans, days: [day] };
    } else {
      const accDay = acc.days.find((d) => d.id === day?.id);
      if (!accDay) {
        acc.days.push(day);
      } else if (row.plan_exercises) {
        accDay.exercises.push({ ...row.plan_exercises, localId: nanoid(5) });
      }
    }
    return acc;
  }, {} as Plan);
  return reducedPlan;
};

export const getPlanByLocalId = async (localId: string, ownerId: string) => {
  const plan = await db
    .select()
    .from(plans)
    .where(and(eq(plans.localId, localId), eq(plans.ownerId, ownerId)))
    .limit(1)
    .then(single);
  return plan;
};

export const insertPlan = async (plan: InsertPlanSchema) => {
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

export const insertPlanDay = async (planDay: InsertPlanDaysSchema) => {
  const newPlanDay = await db
    .insert(planDays)
    .values(planDay)
    .returning()
    .then(single);
  return newPlanDay;
};

export const insertPlanExercises = async (
  planExercise: InsertPlanExercisesSchema[],
) => {
  if (planExercise.length > 0) {
    await db.insert(planExercises).values(planExercise);
  }
};

export const deletePlan = async (localId: string, ownerId: string) => {
  await db
    .delete(plans)
    .where(and(eq(plans.ownerId, ownerId), eq(plans.localId, localId)));
};

export const updatePlan = async (id: number, plan: UpdatePlanSchema) => {
  // Deconstruct id and ownerId, disallowing chaning of these fields
  const { id: _id, ownerId: _ownerId, ...planData } = plan;
  await db.update(plans).set(planData).where(eq(plans.id, id));
};

export const insertPlanPayload = async (payload: Plan) => {
  // Deconstruct day property from Plan
  const { days, ...rest } = payload;
  // Parse Plan and insert to db
  const plan = insertPlanSchema.parse({
    ...rest,
    lastUpdate: new Date(rest.lastUpdate),
  });
  const { id: planId } = await insertPlan(plan);

  // Iterate through days
  for (const day of days) {
    const { exercises, ...rest } = {
      ...day,
      planId,
    };

    const parsedDay = insertPlanDaysSchema.safeParse(rest);
    if (!parsedDay.success) {
      await deletePlan(planId);
      throw new Error(parsedDay.error.message);
    }
    const { id: dayId } = await insertPlanDay(parsedDay.data);
    const parsedExercises = z
      .array(insertPlanExercisesSchema)
      .safeParse(exercises.map((e) => ({ ...e, dayId })));
    if (!parsedExercises.success) {
      await deletePlan(planId);
      throw new Error(parsedExercises.error.message);
    }
    await insertPlanExercises(parsedExercises.data);
  }
  return planId;
};

export const clearPlan = async (id: number) => {
  await db.delete(planDays).where(eq(planDays.planId, id));
};
