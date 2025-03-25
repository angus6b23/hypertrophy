import jwt from "jsonwebtoken";
import { jwtSecret } from "./constants";
import { db } from "backend/db";
import { users } from "backend/db/schema/users";
import { eq } from "drizzle-orm";
import { single } from "./db-helper";
import argon2 from "argon2";

/**
 * Sign access and refresh token given an id
 *
 * @param id - user id
 * @returns { accessToken: string, refreshToken: string}
 *
 */
export const signJWT = (id: string) => {
  const accessToken = jwt.sign({ id }, jwtSecret, {
    expiresIn: "24h",
  });
  const refreshToken = jwt.sign({ id, isRefresh: true }, jwtSecret, {
    expiresIn: "30d",
  });
  return { accessToken, refreshToken };
};

type AccessToken = {
  id: string;
  isRefresh?: boolean;
  iat: number;
};

/**
 * Configuration object for verifying JWT tokens
 *
 * @param checkDb - Whether to check the database for the user
 * @param refreshToken - Whether the token is a refresh token
 *
 * @example
 * ```
 * { checkDb: true, refreshToken: true }
 * ```
 */
type VerifyTokenOptions = {
  checkDb?: boolean;
  refreshToken?: boolean;
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
export const verifyToken = async (
  token: string,
  options?: VerifyTokenOptions,
) => {
  const decode = jwt.verify(token, jwtSecret) as AccessToken;
  if (options?.refreshToken) {
    if (!decode.isRefresh) {
      throw new Error("expected_refresh_token");
    }
  }
  if (options?.checkDb) {
    const record = await db
      .select({ id: users.id, isDisabled: users.isDisabled })
      .from(users)
      .where(eq(users.id, decode.id))
      .then(single);
    if (record.isDisabled) {
      throw new Error("user_is_disabled");
    } else {
      return decode.id;
    }
  } else {
    return decode.id;
  }
};

/**
 * Verify if password matches with username in database
 *
 * @param username - username of the user to check
 * @param password - password of the user to check
 * @returns user id if the password matches the record, otherwise return an error
 *
 * @example
 * ```
 * await verifyPassword("test", "test")
 * ```
 */
export const verifyPassword = async (username: string, password: string) => {
  const record = await db
    .select({
      username: users.username,
      password: users.password,
      id: users.id,
      isDisabled: users.isDisabled,
    })
    .from(users)
    .where(eq(users.username, username))
    .then(single);
  if (record.isDisabled) {
    throw new Error("user_is_disabled");
  }
  const passwordMatch = await argon2.verify(record.password ?? "", password);
  if (passwordMatch) {
    return record.id;
  } else {
    throw new Error("username_or_password_incorrect");
  }
};

/**
 * Create user into db
 *
 * @param user - An object for holding details of the user
 * @param user.username - username of the user
 * @param user.password - password of the user
 * @param user.displayName - display name of the user
 * @returns user id if successful, otherwise an error will be returned
 *
 * @example
 * ```
 * createUser({user: "some_user", password: "mystrongpassword", displayName: "Some User Name"})
 * ```
 */
export const createUser = async (user: {
  username: string;
  password: string;
  displayName: string;
}) => {
  const record = await db
    .insert(users)
    .values({ ...user, password: await argon2.hash(user.password) })
    .returning({ id: users.id })
    .then(single);
  return record.id;
};
