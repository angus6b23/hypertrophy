import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "./stackHandler";
import { AuthErrors } from "share/interfaces/error-codes";
import { verifyTokenJose } from "@/utils/jwt";

const PATHS_REQUIRE_AUTH = [
  "/api/measurement",
  "/api/me",
  "/api/plans",
  "/api/workouts",
];

export const withAuth: MiddlewareFactory = (next) => {
  return async (req: NextRequest, _next: NextFetchEvent) => {
    try {
      const pathname = req.nextUrl.pathname;
      if (PATHS_REQUIRE_AUTH.some((path) => pathname.startsWith(path))) {
        const token = req.headers.get("Authorization");
        if (!token) {
          return NextResponse.json(
            { status: "error", message: "Unauthorized" },
            { status: 401 },
          );
        }
        const tokenSplit = token.split(" ");
        if (tokenSplit[0].toLowerCase() !== "bearer" || !tokenSplit[1]) {
          return NextResponse.json(
            { status: "error", message: AuthErrors.invalid_auth_header },
            { status: 400 },
          );
        }
        const userId = await verifyTokenJose(tokenSplit[1]);
        const res = await next(req, _next);
        if (res) {
          res.headers.set("x-user-id", userId);
        }
        return res;
      }
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        { status: "error", message: AuthErrors.invalid_auth_header },
        { status: 400 },
      );
    }
  };
};
