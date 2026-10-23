import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _btPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!global._btPool) {
    global._btPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "off" ? false : { rejectUnauthorized: false },
      max: Number(process.env.DATABASE_POOL_MAX || 5),
      idleTimeoutMillis: Number(process.env.DATABASE_IDLE_MS || 10000),
    });
  }
  return global._btPool;
}
