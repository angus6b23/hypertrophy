import jwt from "jsonwebtoken";
import { jwtSecret, salt } from "./constants";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { single } from "./db-helper";
import bcrypt from "bcrypt";

export const signJWT = ({ id }: { id: string }) => {
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
type VerifyTokenOptions = {
  checkDb?: boolean;
  refreshToken?: boolean;
};
export const verifyToken = async (
  token: string,
  options?: VerifyTokenOptions,
) => {
  try {
    const decode = jwt.verify(token, jwtSecret) as AccessToken;
    if (options?.refreshToken) {
      if (!decode.isRefresh) {
        throw new Error("Expected refresh token");
      }
    }
    if (options?.checkDb) {
      const record = await db
        .select({ id: users.id, isDisabled: users.isDisabled })
        .from(users)
        .where(eq(users.id, decode.id))
        .then(single);
      if (record.isDisabled) {
        throw new Error("User is disabled");
      } else {
        return decode.id;
      }
    } else {
      return decode.id;
    }
  } catch (err) {
    return err as Error;
  }
};

export const verifyPassword = async (username: string, password: string) => {
  try {
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
      throw new Error("User is disabled");
    }
    const hashedPassword = await bcrypt.hash(password, salt);
    if (hashedPassword === record.password) {
      return record.id;
    } else {
      throw new Error("Password does not match");
    }
  } catch (err) {
    return err as Error;
  }
};
