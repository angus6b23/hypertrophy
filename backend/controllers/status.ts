import { NextResponse } from "next/server";
export const getStatusController = async () => {
  return NextResponse.json({
    status: "success",
    data: {
      allowSignup: process.env.ALLOW_SIGNUP === "true",
      allowOauth: process.env.OAUTH_ENABLED === "true",
    },
  });
};
