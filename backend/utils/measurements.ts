/* eslint-disable @typescript-eslint/no-unused-vars */

import { eq, and, lte, gte } from "drizzle-orm";
import { db } from "../db";
import {
  InsertMeasurement,
  measurements,
  UpdateMeasurement,
} from "../db/schema/measurements";
import { single } from "./db-helper";

interface GetMeasurementsOption {
  from: Date;
  to: Date;
  id: string;
}

/**
 * Get Measurement of a user from database
 *
 * @param id - id of the user
 * @param from - Date from which data is to be fetched
 * @param to - Date to which data is to be fetched
 * @returns DbMeasurements[]
 *
 */
export const getMeasurements = ({ from, to, id }: GetMeasurementsOption) => {
  const records = db
    .select({
      date: measurements.date,
      id: measurements.id,
      height: measurements.height,
      weight: measurements.weight,
      bodyFat: measurements.bodyFat,
      waist: measurements.waist,
      chest: measurements.chest,
      hip: measurements.hip,
    })
    .from(measurements)
    .where(
      and(
        eq(measurements.ownerId, id),
        gte(measurements.date, from),
        lte(measurements.date, to),
      ),
    )
    .orderBy(measurements.date);
  return records;
};

export const getMeasurementByLocalId = ({
  ownerId,
  localId,
}: {
  ownerId: string;
  localId: string;
}) => {
  const record = db
    .select()
    .from(measurements)
    .where(
      and(eq(measurements.ownerId, ownerId), eq(measurements.localId, localId)),
    )
    .limit(1)
    .then(single);
  return record;
};

/**
 * Insert Measurement into database
 *
 * @param data - InsertMeasurement
 * @returns DbMeasurement
 *
 * @example
 * ```
 * await insertMeasurement({
 *    date: new Date("2025-01-01T00:00:00.000Z"),
 *    weight: 41
 *    ownerId: "be731511-ee25-4cca-a563-ffb2599301ff"
 * })
 * ```
 */
export const insertMeasurement = async (data: InsertMeasurement) => {
  const record = await db
    .insert(measurements)
    .values(data)
    .returning()
    .then(single);
  return record;
};

/**
 * Update measurement from db
 *
 * @param data - UpdateMeasurement
 * @returns void
 *
 *
 */
export const updateMeasurement = async (
  id: number,
  data: UpdateMeasurement,
) => {
  const { id: _id, ownerId, ...rest } = data;
  return await db
    .update(measurements)
    .set(rest)
    .where(eq(measurements.id, id))
    .returning()
    .then(single);
};

export const deleteMeasurement = async (id: number) => {
  await db.delete(measurements).where(eq(measurements.id, id));
};
