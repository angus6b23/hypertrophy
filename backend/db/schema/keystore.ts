import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const keystore = pgTable("keystore", {
  id: serial("id").primaryKey().unique().notNull(),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
});
