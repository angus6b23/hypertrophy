import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().defaultRandom().unique().notNull(),
    username: text().unique().notNull(),
    password: text(),
    displayName: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    isOauth: boolean().default(false).notNull(),
    isDisabled: boolean().default(false).notNull(),
  },
  (table) => [
    index("id_idx").on(table.id),
    index("username").on(table.username),
  ],
);
