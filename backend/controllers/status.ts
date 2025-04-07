import { Request, Response } from "express";
export const getStatusController = async (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    data: {
      allowSignup: process.env.ALLOW_SIGNUP === "true",
      allowOauth: process.env.OAUTH_ENABLED === "true",
    },
  });
};
