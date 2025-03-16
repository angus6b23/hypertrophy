import { Request, Response } from "express";
import { z } from "zod";
import { createUser, signJWT, verifyPassword, verifyToken } from "@/utils/auth";

const loginBodySchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string(),
});
type LoginBody = z.infer<typeof loginBodySchema>;

const signUpBodySchema = loginBodySchema.extend({
  displayName: z.string().min(3).max(32),
});
type SignUpBody = z.infer<typeof signUpBodySchema>;

export const loginController = async (
  req: Request<LoginBody>,
  res: Response,
) => {
  try {
    const body = loginBodySchema.parse(req.body);
    const id = await verifyPassword(body.username, body.password);
    if (id instanceof Error) {
      throw id;
    }
    const tokens = signJWT(id);
    res.status(200).json(tokens);
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
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
    console.error(err);
    res.status(400).json({ error: "Invalid request" });
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
    if (id instanceof Error) {
      throw id;
    }
    const tokens = signJWT(id);
    res.status(200).json(tokens);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid request" });
  }
};
