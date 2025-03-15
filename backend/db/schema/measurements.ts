import {
  decimal,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const lengthUnitEnum = pgEnum("length_unit_enum", ["inch", "cm"]);
export const weightUnitEnum = pgEnum("weight_unit_enum", ["lb", "kg"]);

export const measurements = pgTable("measurements", {
  id: serial().primaryKey().unique().notNull(),
  weight: decimal(),
  weightUnit: weightUnitEnum(),
  height: decimal(),
  heightUnit: lengthUnitEnum(),
  bodyFat: decimal(),
  chest: decimal(),
  chestUnit: lengthUnitEnum(),
  waist: decimal(),
  waistUnit: lengthUnitEnum(),
  hip: decimal(),
  hipUnit: lengthUnitEnum(),
  createdAt: timestamp().defaultNow().notNull(),
  ownerId: uuid()
    .notNull()
    .references(() => users.id),
});
