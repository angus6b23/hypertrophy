import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const oidcSessions = pgTable("oidc-sessions", {
  id: text().primaryKey().unique().notNull(),
  verifier: text().notNull(),
  codeChallenge: text().notNull(),
  state: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
