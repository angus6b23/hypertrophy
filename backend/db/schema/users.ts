import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey().unique().notNull(),
  username: text().unique().notNull(),
  displayName: text().notNull(),
  email: text().unique().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
