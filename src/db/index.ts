import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

/**
 * postgres.js client configured for Supabase pooler.
 * max: 1 for serverless — each invocation gets its own short-lived connection.
 */
const client = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  // Required for Supabase transaction pooler (port 6543)
  prepare: false,
});

export const db = drizzle(client, { schema });
