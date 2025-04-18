import z, { ZodNumber } from "zod";
import {
  date,
  real,
  pgTable,
  serial,
  timestamp,
  uuid,
  text,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { MeasurementErrors } from "share/interfaces/error-codes";

export const measurements = pgTable(
  "measurements",
  {
    id: serial().primaryKey().unique().notNull(),
    localId: text().notNull(),
    date: date("date", { mode: "date" }).notNull(),
    weight: real(),
    height: real(),
    bodyFat: real(),
    chest: real(),
    waist: real(),
    hip: real(),
    createdAt: timestamp().defaultNow().notNull(),
    ownerId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => ({
    uniqueIds: unique("owner_localId_unique").on(table.localId, table.ownerId),
  }),
);

const measurementConstraints = {
  weight: (z: ZodNumber) =>
    z
      .min(0, { message: MeasurementErrors.weight_negative })
      .max(999, { message: MeasurementErrors.weight_too_high }),
  height: (z: ZodNumber) =>
    z
      .min(0, { message: MeasurementErrors.height_negative })
      .max(300, { message: MeasurementErrors.height_too_high }),
  bodyFat: (z: ZodNumber) =>
    z
      .min(0, { message: MeasurementErrors.bodyfat_negative })
      .max(100, { message: MeasurementErrors.bodyfat_too_high }),
  chest: (z: ZodNumber) =>
    z
      .min(0, { message: MeasurementErrors.chest_negative })
      .max(999, { message: MeasurementErrors.chest_too_high }),
  waist: (z: ZodNumber) =>
    z
      .min(0, { message: MeasurementErrors.waist_negative })
      .max(999, { message: MeasurementErrors.waist_too_high }),
  hip: (z: ZodNumber) =>
    z
      .min(0, { message: MeasurementErrors.hip_negative })
      .max(999, { message: MeasurementErrors.hip_too_high }),
};

export const InsertMeasurementSchema = createInsertSchema(
  measurements,
  measurementConstraints,
);
export type InsertMeasurement = z.infer<typeof InsertMeasurementSchema>;
export const SelectMeasurementSchema = createSelectSchema(measurements);
export type SelectMeasurements = z.infer<typeof SelectMeasurementSchema>;
export const UpdateMeasurementSchema = createUpdateSchema(
  measurements,
  measurementConstraints,
);
export type UpdateMeasurement = z.infer<typeof UpdateMeasurementSchema>;
export type Measurement = Omit<SelectMeasurements, "ownerId">;
