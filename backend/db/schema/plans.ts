import {
  pgTable,
  serial,
  text,
  uuid,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { exercises } from "./exercise";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

export const plans = pgTable("plans", {
  id: serial().primaryKey().unique().notNull(),
  name: text().notNull(),
  description: text().notNull().default(""),
  localId: text().notNull(),
  ownerId: uuid().references(() => users.id, { onDelete: "cascade" }),
  isPublic: boolean().default(false).notNull(),
  isWeekday: boolean().default(true).notNull(),
});

export const planDays = pgTable("plan_days", {
  id: serial().primaryKey().unique().notNull(),
  planId: serial().references(() => plans.id, { onDelete: "cascade" }),
  name: text().notNull().default(""),
  day: integer().notNull().default(0),
});

export const planExercises = pgTable("plan_exercises", {
  id: serial().primaryKey().unique().notNull(),
  dayId: serial().references(() => planDays.id, { onDelete: "cascade" }),
  exerciseId: serial().references(() => exercises.id, { onDelete: "cascade" }),
  targetSets: integer(),
  targetReps: integer(),
  restTime: integer(),
});

export const insertPlanSchema = createInsertSchema(plans);
export type Plan = z.infer<typeof insertPlanSchema>;
export const insertPlanDaysSchema = createInsertSchema(planDays);
export type PlanDay = z.infer<typeof insertPlanDaysSchema>;
export const insertPlanExercisesSchema = createInsertSchema(planExercises);
export type PlanExercises = z.infer<typeof insertPlanExercisesSchema>;
