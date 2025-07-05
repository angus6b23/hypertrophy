import {
  text,
  pgTable,
  serial,
  uuid,
  integer,
  boolean,
  json,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { exercises, recordTypeEnum } from "./exercise";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

export const workouts = pgTable("workouts", {
  id: serial().primaryKey().unique().notNull(),
  localId: text().notNull(),
  startTime: timestamp().notNull(),
  endTime: timestamp().notNull(),
  rpe: integer(),
  remarks: text(),
  ownerId: uuid()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  public: boolean().notNull().default(false),
  lastUpdate: timestamp().defaultNow().notNull(),
});

export const workoutRecords = pgTable("workouts-exercise", {
  id: serial().primaryKey().unique().notNull(),
  workoutId: integer()
    .references(() => workouts.id, { onDelete: "cascade" })
    .notNull(),
  exerciseId: integer()
    .references(() => exercises.id)
    .notNull(),
  record: json().notNull(),
  type: recordTypeEnum().notNull(),
});

export const insertWorkoutSchema = createInsertSchema(workouts);
export type InsertWorkoutSchema = z.infer<typeof insertWorkoutSchema>;
export const selectWorkoutSchema = createSelectSchema(workouts);
export type SelectWorkoutSchema = z.infer<typeof selectWorkoutSchema>;
export const updateWorkoutSchema = createUpdateSchema(workouts);
export type UpdateWorkoutSchema = z.infer<typeof updateWorkoutSchema>;

export const insertWorkoutRecordSchema = createInsertSchema(workoutRecords);
export type InsertWorkoutRecordSchema = z.infer<
  typeof insertWorkoutRecordSchema
>;
export const selectWorkoutRecordSchema = createSelectSchema(workoutRecords);
export type SelectWorkoutRecordSchema = z.infer<
  typeof selectWorkoutRecordSchema
>;

export const updateWorkoutRecordSchema = createUpdateSchema(workoutRecords);
export type UpdateWorkoutRecordSchema = z.infer<
  typeof updateWorkoutRecordSchema
>;
