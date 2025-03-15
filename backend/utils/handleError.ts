import { response } from "express";

class CustomError extends Error {
  constructor(message: string, { statusCode }: { statusCode?: number }) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (err: unknown) => {
  // const error = err as CustomError;
  response.status(500).json({ error: "Something went wrong" });
  // response.status(error.statusCode ?? 500).json({ error: error.message });
};
