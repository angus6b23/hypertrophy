import { PathErrors } from "@/share/interfaces/error-codes";
import { Request, Response, NextFunction } from "express";

export const requireId = (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  if (!req.params.id) {
    res.status(400).json({ status: "error", message: PathErrors.id_not_found });
    return;
  } else if (!id || id < 0) {
    res.status(400).json({ status: "error", message: PathErrors.id_invalid });
  }
  next();
};
