import { eq, and, lte, gte } from "drizzle-orm";
import { db } from "../db";
import {
  InsertMeasurement,
  measurements,
  UpdateMeasurement,
} from "../db/schema/measurements";
import { single } from "./db-helper";
import { AuthErrors, CustomError } from "share/interfaces/error-codes";

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
      createdAt: measurements.createdAt,
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
  const record = await db.insert(measurements).values(data).returning();
  return record;
};

const checkOwnership = async (id: number, ownerId: string) => {
  const existingRecord = await db
    .select({ ownerId: measurements.ownerId })
    .from(measurements)
    .where(eq(measurements.id, id))
    .limit(1)
    .then(single);
  if (existingRecord.ownerId !== ownerId) {
    throw new CustomError(AuthErrors.unauthorized_access, 403);
  }
};
/**
 * Update measurement from db
 *
 * @param data - UpdateMeasurement
 * @returns void
 *
 *
 */
export const updateMeasurement = async (data: UpdateMeasurement) => {
  await checkOwnership(data.id!, data.ownerId!);
  await db.update(measurements).set(data).where(eq(measurements.id, data.id!));
};

export const deleteMeasurement = async (id: number, ownerId: string) => {
  await checkOwnership(id, ownerId);
  await db.delete(measurements).where(eq(measurements.id, id));
};
