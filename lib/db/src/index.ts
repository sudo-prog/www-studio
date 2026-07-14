import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const dbUrl = process.env.DATABASE_URL;
const isLocal = /localhost|127\.0\.0\.1|host\.docker\.internal/.test(dbUrl);
export const pool = new Pool({
  connectionString: dbUrl,
  // Supabase direct host publishes only an IPv6 (AAAA) record; Vercel's
  // serverless runtime fails DNS on IPv6 (ENOTFOUND). Force the IPv4 path.
  family: 4,
  ...(isLocal
    ? {}
    : { ssl: { rejectUnauthorized: false } }),
} as pg.PoolConfig & { family: number });
export const db = drizzle(pool, { schema });

export * from "./schema";
