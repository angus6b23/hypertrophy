import {
  pgTable,
  serial,
  text,
  uuid,
  boolean,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { exercises } from "./exercise";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";
import { createUpdateSchema } from "drizzle-zod";

export const plans = pgTable(
  "plans",
  {
    id: serial().primaryKey().unique().notNull(),
    name: text().notNull(),
    description: text().notNull().default(""),
    localId: text().notNull(),
    ownerId: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    isPublic: boolean().default(false).notNull(),
    isWeekday: boolean().default(true).notNull(),
    lastUpdate: timestamp().defaultNow().notNull(),
  },
  (table) => ({
    uniqueIds: unique("owner_localId_unique").on(table.localId, table.ownerId),
  }),
);

export const planDays = pgTable("plan_days", {
  id: serial().primaryKey().unique().notNull(),
  planId: serial()
    .references(() => plans.id, { onDelete: "cascade" })
    .notNull(),
  name: text().notNull(),
  day: integer().notNull(),
});

export const planExercises = pgTable("plan_exercises", {
  id: serial().primaryKey().unique().notNull(),
  dayId: serial()
    .references(() => planDays.id, { onDelete: "cascade" })
    .notNull(),
  exerciseId: serial()
    .references(() => exercises.id, { onDelete: "cascade" })
    .notNull(),
  targetSets: integer().default(3),
  targetReps: integer().default(10),
  restTime: integer().default(60),
});

export const insertPlanSchema = createInsertSchema(plans);
export type InsertPlanSchema = z.infer<typeof insertPlanSchema>;
export const insertPlanDaysSchema = createInsertSchema(planDays);
export type InsertPlanDaysSchema = z.infer<typeof insertPlanDaysSchema>;
export const insertPlanExercisesSchema = createInsertSchema(planExercises);
export type InsertPlanExercisesSchema = z.infer<
  typeof insertPlanExercisesSchema
>;
export const updatePlanSchema = createUpdateSchema(plans);
export type UpdatePlanSchema = z.infer<typeof updatePlanSchema>;
