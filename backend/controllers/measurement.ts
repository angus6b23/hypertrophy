/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest } from "next/server";
import { handleError, handleSuccess } from "../utils/handleError";
import {
  deleteMeasurement,
  getMeasurementByLocalId,
  getMeasurements,
  insertMeasurement,
  updateMeasurement,
} from "../utils/measurements";
import {
  InsertMeasurementSchema,
  UpdateMeasurementSchema,
} from "../db/schema/measurements";
import { CustomError, MeasurementErrors } from "share/interfaces/error-codes";

export const getMeasurementsController = async (req: NextRequest) => {
  try {
    const id = req.headers.get("x-user-id")!;
    const currentDate = new Date();
    const { searchParams } = new URL(req.url);
    // Default from 1 week
    const from = searchParams.get("from")
      ? new Date(searchParams.get("from") as string)
      : new Date(currentDate.getTime() - 7 * 24 * 3600 * 1000);
    // Default to current time
    const to = searchParams.get("to")
      ? new Date(searchParams.get("to") as string)
      : currentDate;
    const records = await getMeasurements({ from, to, id });
    return handleSuccess(records);
  } catch (err) {
    return handleError(err);
  }
};

export const postMeasurementsController = async (req: NextRequest) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const json = await req.json();
    const body = {
      ...json,
      date: new Date(json.date),
      ownerId,
    };
    const data = InsertMeasurementSchema.parse(body);
    if (
      !data.weight &&
      !data.height &&
      !data.bodyFat &&
      !data.waist &&
      !data.chest &&
      !data.hip
    ) {
      throw new CustomError(MeasurementErrors.all_fields_empty, 400);
    }
    const res = await insertMeasurement(data);
    return handleSuccess(res);
  } catch (err) {
    return handleError(err);
  }
};

export const putMeasurementsController = async (
  req: NextRequest,
  { params }: { params: Promise<{ localId: string }> },
) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const json = await req.json();
    const localId = (await params).localId;
    const body = { ...json, date: new Date(json.date), ownerId };
    const data = UpdateMeasurementSchema.parse(body);
    const record = await getMeasurementByLocalId({ ownerId, localId });
    const res = await updateMeasurement(record.id, data);
    return handleSuccess({ id: res.id });
  } catch (err) {
    return handleError(err);
  }
};

export const deleteMeasurementsController = async (
  req: NextRequest,
  { params }: { params: Promise<{ localId: string }> },
) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const localId = (await params).localId;
    const { id } = await getMeasurementByLocalId({ ownerId, localId });
    await deleteMeasurement(id);
    return handleSuccess();
  } catch (err) {
    return handleError(err);
  }
};
