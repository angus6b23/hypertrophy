import { pgEnum, pgTable, serial, text } from "drizzle-orm/pg-core";

export const bodyPartEnum = pgEnum("body_part_enum", [
  "chest",
  "back",
  "arms",
  "legs",
  "shoulders",
  "abs",
  "cardio",
  "core",
  "full_body",
  "other",
]);

export const equipmentEnum = pgEnum("equipment_enum", [
  "barbell",
  "dumbbell",
  "kettlebell",
  "machine",
  "other",
  "body_weight",
  "resistent_band",
]);

export const recordTypeEnum = pgEnum("record_type_enum", [
  "reps_with_weight",
  "reps",
  "time",
  "distance",
]);

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey().unique().notNull(),
  name: text("name").notNull(),
  bodyPart: bodyPartEnum("body_part").array().notNull(),
  equipment: equipmentEnum("equipment").array().notNull(),
  recordType: recordTypeEnum("record_type").notNull(),
  description: text(),
});
