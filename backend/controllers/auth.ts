import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createUser,
  signJWT,
  verifyPassword,
  verifyTokenJWT,
} from "backend/utils/auth";
import { AuthErrors } from "share/interfaces/error-codes";
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
  password: z
    .string({ message: AuthErrors.password_missing })
    .min(8, { message: AuthErrors.password_too_short })
    .max(32, { message: AuthErrors.password_too_long }),
});
// type LoginBody = z.infer<typeof loginBodySchema>;

export const signUpBodySchema = loginBodySchema.extend({
  displayName: z
    .string({ message: AuthErrors.displayName_missing })
    .min(3, { message: AuthErrors.displayName_too_short })
    .max(32, { message: AuthErrors.displayName_too_long }),
});

// type SignUpBody = z.infer<typeof signUpBodySchema>;

export const loginController = async (req: NextRequest) => {
  try {
    const body = loginBodySchema.parse(await req.json());
    const id = await verifyPassword(body.username, body.password);
    const tokens = signJWT(id);
    return NextResponse.json({ status: "success", data: tokens });
  } catch (err) {
    return handleError(err);
  }
};

export const signUpController = async (req: NextRequest) => {
  try {
    const body = signUpBodySchema.parse(await req.json());
    await createUser(body);
    return NextResponse.json({ status: "success" });
  } catch (err) {
    return handleError(err);
  }
};

export const refreshTokenController = async (req: NextRequest) => {
  try {
    const schema = z.object({
      refreshToken: z.string(),
    });
    const body = schema.parse(await req.json());
    const id = await verifyTokenJWT(body.refreshToken, {
      checkDb: true,
      refreshToken: true,
    });
    const tokens = signJWT(id);
    return NextResponse.json({ status: "success", data: tokens });
  } catch (err) {
    return handleError(err);
  }
};

//TODO: Change hardcoded sessionId
export const redirectOIDC = async (req: NextRequest) => {
  try {
    const url = await generateOIDCRedirectURL("PLACEHOLDER");
    return NextResponse.redirect(url.toString());
  } catch (err) {
    return handleError(err);
  }
};
