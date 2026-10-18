import pg from "pg";
import type { Database, Param, Row } from "./index.ts";

export function openPostgres(databaseUrl: string): Database {
  // Neon: use the connection string from the dashboard as is (it carries sslmode=require).
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 5 });
  // An idle connection dropped by the server (Neon suspends idle computes) must not crash us.
  pool.on("error", (error) => console.error("postgres pool:", error.message));

  const url = new URL(databaseUrl);

  return {
    dialect: "postgres",
    label: `PostgreSQL (${url.hostname}${url.pathname})`,

    async query(sql: string, params: Param[] = []): Promise<Row[]> {
      return (await pool.query(sql, params)).rows as Row[];
    },

    async exec(sql: string): Promise<void> {
      await pool.query(sql); // no parameters → several statements in one round trip
    },

    async close(): Promise<void> {
      await pool.end();
    },
  };
}
