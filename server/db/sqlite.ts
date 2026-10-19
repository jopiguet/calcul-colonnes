import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import BetterSqlite3 from "better-sqlite3";
import type { Database, Param, Row } from "./index.ts";

export function openSqlite(path: string): Database {
  const file = path === ":memory:" ? path : resolve(path);
  if (file !== ":memory:") mkdirSync(dirname(file), { recursive: true });

  const db = new BetterSqlite3(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON"); // off by default in SQLite; needed for ON DELETE CASCADE

  return {
    dialect: "sqlite",
    label: `SQLite (${file})`,

    async query(sql: string, params: Param[] = []): Promise<Row[]> {
      // $1 → @p1: named parameters, so a value can be used more than once.
      const statement = db.prepare(sql.replace(/\$(\d+)/g, "@p$1"));
      const named = Object.fromEntries(params.map((value, i) => [`p${i + 1}`, value]));
      if (statement.reader) return statement.all(named) as Row[];
      statement.run(named);
      return [];
    },

    async exec(sql: string): Promise<void> {
      db.exec(sql);
    },

    async transaction(work) {
      db.exec("BEGIN");
      try {
        const result = await work(this);
        db.exec("COMMIT");
        return result;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },

    async close(): Promise<void> {
      db.close();
    },
  };
}
