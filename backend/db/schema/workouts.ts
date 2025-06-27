import {
  text,
  pgTable,
  date,
  serial,
  uuid,
  integer,
  boolean,
  json,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { exercises, recordTypeEnum } from "./exercise";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

export const workouts = pgTable("workouts", {
  id: serial().primaryKey().unique().notNull(),
  startTime: date().notNull(),
  endTime: date().notNull(),
  rpe: integer(),
  remarks: text(),
  ownerId: uuid()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  public: boolean().notNull().default(false),
  lastUpdate: date().notNull(),
});

export const workoutRecords = pgTable("workouts-exercise", {
  id: serial().primaryKey().unique().notNull(),
  workoutId: integer()
    .references(() => workouts.id, { onDelete: "cascade" })
    .notNull(),
  exerciseId: integer()
    .references(() => exercises.id)
    .notNull(),
  records: json().notNull(),
  type: recordTypeEnum().notNull(),
});

export const insertWorkoutSchema = createInsertSchema(workouts);
export type InsertWorkoutSchema = z.infer<typeof insertWorkoutSchema>;
export const selectWorkoutSchema = createSelectSchema(workouts);
export type SelectWorkoutSchema = z.infer<typeof selectWorkoutRecordSchema>;

export const insertWorkoutRecordSchema = createInsertSchema(workoutRecords);
export type InsertWorkoutRecordSchema = z.infer<
  typeof insertWorkoutRecordSchema
>;

export const selectWorkoutRecordSchema = createSelectSchema(workoutRecords);
export type SelectWorkoutRecordSchema = z.infer<
  typeof selectWorkoutRecordSchema
>;
