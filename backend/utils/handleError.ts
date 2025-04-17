import { CustomError } from "share/interfaces/error-codes";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const handleError = (err: unknown) => {
  if (err instanceof ZodError) {
    return NextResponse.json(
      { status: "error", message: err.issues[0].message },
      { status: 400 },
    );
  } else if (err instanceof CustomError) {
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 400 },
    );
  } else {
    return NextResponse.json(
      { status: "error", message: "Bad Request" },
      { status: 400 },
    );
  }
};
