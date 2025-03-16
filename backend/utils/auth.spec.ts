import { db } from "@/db";
import { createUser, signJWT, verifyPassword, verifyToken } from "./auth";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

const TEST_IDS = [
  "",
  "1",
  "a",
  "!@",
  "1234-4321",
  "22b6c64f-f375-4730-8f31-2b6e3fad5a2d",
];

describe("JWT functionalities", () => {
  it("should able to sign and verify JWT", () => {
    TEST_IDS.forEach(async (id) => {
      const tokens = signJWT(id);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      const decodedId = await verifyToken(tokens.accessToken);
      expect(decodedId).toBe(id);
    });
  });
});

describe("User creation and login", () => {
  const user = {
    username: "jest-test",
    password: "test",
    displayName: "test",
  };
  it("should able to create user and not dpulicate", async () => {
    const userId = await createUser(user);
    expect(userId).toBeDefined();
    const duplicateUser = await createUser(user);
    expect(duplicateUser).toBeInstanceOf(Error);
  });
  it("should able to login with new user creadentials", async () => {
    const userId = await verifyPassword(user.username, user.password);
    expect(userId).toBeDefined();
  });
  it("should not be able to login anymore after user deletion", async () => {
    await db.delete(users).where(eq(users.username, user.username));
    const userId = await verifyPassword(user.username, user.password);
    expect(userId).toBeInstanceOf(Error);
  });
});
