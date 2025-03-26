import { CustomError } from "@/share/interfaces/error-codes";
import { Response } from "express";
import { ZodError } from "zod";

export const handleError = (res: Response, err: unknown) => {
  if (err instanceof ZodError) {
    res.status(400).json({ status: "error", message: err.issues[0].message });
  } else if (err instanceof CustomError) {
    res.status(err.code || 400).json({ status: "error", message: err.message });
  } else {
    res.status(400).json({ status: "error", message: "Bad Request" });
  }
};
