import { NextFunction, Request, Response } from "express";
import { handleError } from "../utils/handleError";
import { AuthErrors, CustomError } from "@/share/interfaces/error-codes";
import { verifyToken } from "../utils/auth";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new CustomError(AuthErrors.no_auth_header, 401);
    }
    const authHeaderArr = authHeader.split(" ");
    if (
      authHeaderArr.length !== 2 ||
      authHeaderArr[0].toLowerCase() !== "Bearer".toLowerCase()
    ) {
      throw new CustomError(AuthErrors.invalid_auth_header, 401);
    }
    const token = authHeaderArr[1];
    const id = await verifyToken(token, { checkDb: true });
    res.locals.id = id;
    next();
  } catch (err) {
    handleError(res, err);
  }
};
