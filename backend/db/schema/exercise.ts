import z from "zod";
import { pgEnum, pgTable, serial, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const bodyPartEnum = pgEnum("body_part_enum", [
  "abdominals",
  "hamstrings",
  "calves",
  "shoulders",
  "adductors",
  "glutes",
  "quadriceps",
  "biceps",
  "forearms",
  "abductors",
  "triceps",
  "chest",
  "lower back",
  "traps",
  "middle back",
  "lats",
  "neck",
]);

export const equipmentEnum = pgEnum("equipment_enum", [
  "body only",
  "machine",
  "other",
  "foam roll",
  "kettlebells",
  "dumbbell",
  "cable",
  "barbell",
  "bands",
  "medicine ball",
  "exercise ball",
  "e-z curl bar",
]);

export const recordTypeEnum = pgEnum("record_type_enum", [
  "reps_with_weight",
  "reps",
  "time",
  "distance",
]);

export const exerciseLevelEnum = pgEnum("exercise_level_enum", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const exerciseCategoryEnum = pgEnum("exercise_category_enum", [
  "strength",
  "stretching",
  "plyometrics",
  "strongman",
  "powerlifting",
  "cardio",
  "olympic weightlifting",
]);

export const mechanicsEnum = pgEnum("mechanics_enum", [
  "compound",
  "isolation",
]);

export const forceEnum = pgEnum("force_enum", ["pull", "push", "static"]);

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey().unique().notNull(),
  name: text("name").notNull().unique(),
  mechanic: mechanicsEnum("mechanic"),
  force: forceEnum("force"),
  category: exerciseCategoryEnum("category").notNull(),
  primaryMuscles: bodyPartEnum("primary_muscle").array().notNull(),
  secondaryMuscles: bodyPartEnum("secondary_muscle").array().notNull(),
  equipment: equipmentEnum("equipment"),
  recordType: recordTypeEnum("record_type").notNull(),
  description: text(),
  ownerId: uuid().references(() => users.id, { onDelete: "set null" }),
});

export const InsertExerciseSchema = createInsertSchema(exercises);
export type Exercise = z.infer<typeof InsertExerciseSchema>;
const SelectExerciseSchema = createSelectSchema(exercises);
export type DbExercise = z.infer<typeof SelectExerciseSchema>;
