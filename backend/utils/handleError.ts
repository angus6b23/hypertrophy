import { Response } from "express";
import { ZodError } from "zod";

export const handleError = <T extends { [key: string]: string }>(
  res: Response,
  err: unknown,
  errMessages: T,
) => {
  if (err instanceof ZodError) {
    const message = errMessages[err.issues[0].message];
    res.status(400).json({ message });
  } else {
    const error = err as Error;
    const message = errMessages[error.message];
    if (message) {
      res.status(400).json({ message });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
