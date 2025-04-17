import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { CustomError, AuthErrors } from "share/interfaces/error-codes";
import { jwtSecret } from "./constants";
import { single } from "./db-helper";
import { jwtVerify } from "jose";

type VerifyTokenOptions = {
  checkDb?: boolean;
  refreshToken?: boolean;
};
type AccessToken = {
  id: string;
  isRefresh?: boolean;
  iat: number;
};
/**
 * Verify Access Token
 *
 * @param token - access or refresh token: string
 * @param options - An optional configuration object for the function
 * @returns user id represented by token if token is valid, an error otherwise
 *
 *
 */
export const verifyTokenJose = async (
  token: string,
  options?: VerifyTokenOptions,
) => {
  const { payload }: { payload: AccessToken } = await jwtVerify(
    token,
    new TextEncoder().encode(jwtSecret),
  );
  if (options?.refreshToken) {
    if (!payload.isRefresh) {
      throw new CustomError(AuthErrors.expected_refresh_token, 400);
    }
  }
  if (options?.checkDb) {
    if (!payload.id) throw new CustomError(AuthErrors.user_id_not_found, 403);
    const record = await db
      .select({ id: users.id, isDisabled: users.isDisabled })
      .from(users)
      .where(eq(users.id, payload.id as string))
      .limit(1)
      .then(single);
    if (record.isDisabled) {
      throw new CustomError(AuthErrors.user_is_disabled, 403);
    } else {
      return payload.id;
    }
  } else {
    return payload.id;
  }
};
