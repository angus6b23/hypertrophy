import { Router } from "express";
import {
  deleteMeasurementsController,
  getMeasurementsController,
  postMeasurementsController,
  putMeasurementsController,
} from "../controllers/measurement";
import { requireAuth } from "../middlewares/auth";
import { requireId } from "../middlewares/validatePath";

export const measurementRouter = Router();

measurementRouter.use(requireAuth);

measurementRouter.get("/", getMeasurementsController);
measurementRouter.post("/", postMeasurementsController);
measurementRouter.put("/:id", requireId, putMeasurementsController);
measurementRouter.delete("/:id", requireId, deleteMeasurementsController);
