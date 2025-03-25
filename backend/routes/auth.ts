import { Router } from "express";
import {
  loginController,
  refreshTokenController,
  signUpController,
} from "backend/controllers/auth";

export const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.post("/signup", signUpController);
authRouter.post("/refresh", refreshTokenController);
