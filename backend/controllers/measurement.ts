import { Request, Response } from "express";
import { handleError } from "../utils/handleError";
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
import { CustomError, MeasurementErrors } from "@/share/interfaces/error-codes";
import { z } from "zod";

export const getMeasurementsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = res.locals.id!;
    const currentDate = new Date();
    const from = req.query.from
      ? new Date(req.query.from as string)
      : new Date(currentDate.getTime() - 7 * 24 * 3600 * 1000);
    const to = req.query.to ? new Date(req.query.to as string) : currentDate;
    const records = await getMeasurements({ from, to, id });
    res.status(200).json({ status: "success", data: records });
  } catch (err) {
    handleError(res, err);
  }
};

export const postMeasurementsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = res.locals.id!;
    const body = { ...req.body, date: new Date(req.body.date), ownerId: id };
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
    await insertMeasurement(data);
    res.status(200).json({ status: "success" });
  } catch (err) {
    handleError(res, err);
  }
};

export const putMeasurementsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const ownerId = res.locals.id!;
    const id = Number(req.params.id!);
    const body = { ...req.body, id, date: new Date(req.body.date), ownerId };
    const data = UpdateMeasurementSchema.parse(body);
    if (!data.id) {
      throw new CustomError(MeasurementErrors.id_not_found, 400);
    }
    await updateMeasurement(data);
    res.status(200).json({ status: "success" });
  } catch (err) {
    handleError(res, err);
  }
};

export const deleteMeasurementsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const ownerId = res.locals.id!;
    const id = Number(req.params.id!);
    await deleteMeasurement(id, ownerId);
    res.status(200).json({ status: "success" });
  } catch (err) {
    handleError(res, err);
  }
};
