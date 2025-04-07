import { Router } from "express";
import { getStatusController } from "../controllers/status";

export const statusRouter = Router();
statusRouter.get("/", getStatusController);
