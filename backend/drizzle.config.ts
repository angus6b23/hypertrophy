import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql", // 'mysql' | 'sqlite' | 'turso'
  schema: "./db/schema",
  dbCredentials: {
    host: "localhost",
    database: "hypertrophy",
    user: "admin",
    password: "admin",
    ssl: false,
  },
  casing: "snake_case",
  migrations: {
    schema: "public",
  },
});
