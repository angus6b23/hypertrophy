import { Request, Response } from "express";
import { z } from "zod";
import {
  createUser,
  signJWT,
  verifyPassword,
  verifyToken,
} from "backend/utils/auth";
import { AuthErrors } from "@/share/interfaces/error-codes";
import { generateOIDCRedirectURL } from "backend/utils/oidc";
import { handleError } from "../utils/handleError";

const loginBodySchema = z.object({
  username: z
    .string({ message: AuthErrors.username_missing })
    .min(3, { message: AuthErrors.username_too_short })
    .max(32, { message: AuthErrors.username_too_long })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: AuthErrors.username_invalid_char,
    }),
  password: z.string({ message: "password_missing" }),
});
type LoginBody = z.infer<typeof loginBodySchema>;

const signUpBodySchema = loginBodySchema.extend({
  displayName: z
    .string({ message: AuthErrors.displayName_missing })
    .min(3, { message: AuthErrors.displayName_too_short })
    .max(32, { message: AuthErrors.displayName_too_long }),
});

type SignUpBody = z.infer<typeof signUpBodySchema>;

export const loginController = async (
  req: Request<LoginBody>,
  res: Response,
) => {
  try {
    const body = loginBodySchema.parse(req.body);
    const id = await verifyPassword(body.username, body.password);
    const tokens = signJWT(id);
    res.status(200).json(tokens);
  } catch (err) {
    handleError(res, err);
  }
};

export const signUpController = async (
  req: Request<SignUpBody>,
  res: Response,
) => {
  try {
    const body = signUpBodySchema.parse(req.body);
    await createUser(body);
    res.status(200).json({ message: "success" });
  } catch (err) {
    handleError(res, err);
  }
};

export const refreshTokenController = async (
  req: Request<{ refreshToken: string }>,
  res: Response,
) => {
  try {
    const schema = z.object({
      refreshToken: z.string(),
    });
    const body = schema.parse(req.body);
    const id = await verifyToken(body.refreshToken, {
      checkDb: true,
      refreshToken: true,
    });
    const tokens = signJWT(id);
    res.status(200).json(tokens);
  } catch (err) {
    handleError(res, err);
  }
};

export const redirectOIDC = async (req: Request, res: Response) => {
  try {
    const url = await generateOIDCRedirectURL(req.session.id);
    res.redirect(url.toString());
  } catch (err) {
    handleError(res, err);
  }
};
