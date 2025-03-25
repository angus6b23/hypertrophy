import { pgEnum, pgTable, serial, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

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
  "barbell",
  "dumbbell",
  "kettlebell",
  "machine",
  "other",
  "body_weight",
  "resistent_band",
  "foam_roller",
  "medicine_ball",
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
  name: text("name").notNull(),
  mechanics: mechanicsEnum("mechanics"),
  force: forceEnum("force"),
  category: exerciseCategoryEnum("category").notNull(),
  primaryMuscle: bodyPartEnum("primary_muscle").array().notNull(),
  secondaryMuscle: bodyPartEnum("secondary_muscle").array().notNull(),
  equipment: equipmentEnum("equipment").array().notNull(),
  recordType: recordTypeEnum("record_type").notNull(),
  description: text(),
  ownerId: uuid().references(() => users.id, { onDelete: "set null" }),
});
