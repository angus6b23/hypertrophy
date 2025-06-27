import { NextRequest, NextResponse } from "next/server";
import { handleError, handleSuccess } from "../utils/handleError";
import {
  deleteMeasurement,
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
    const from = searchParams.get("from")
      ? new Date(searchParams.get("from") as string)
      : new Date(currentDate.getTime() - 7 * 24 * 3600 * 1000);
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
    console.error(err);
    return handleError(err);
  }
};

export const putMeasurementsController = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const json = await req.json();
    const id = Number((await params).id);
    const body = { ...json, id, date: new Date(json.date), ownerId };
    const data = UpdateMeasurementSchema.parse(body);
    if (!data.id) {
      throw new CustomError(MeasurementErrors.id_not_found, 400);
    }
    await updateMeasurement(data);
    return handleSuccess();
  } catch (err) {
    return handleError(err);
  }
};

export const deleteMeasurementsController = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const ownerId = req.headers.get("x-user-id")!;
    const id = Number((await params).id);
    await deleteMeasurement(id, ownerId);
    return handleSuccess();
  } catch (err) {
    return handleError(err);
  }
};
