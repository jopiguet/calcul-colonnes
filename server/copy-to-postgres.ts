/**
 * One-off upgrade: copies accounts, sign-in methods, players and results from
 * the local SQLite file into the PostgreSQL database named by DATABASE_URL
 * (Neon), keeping the ids. Sessions and sign-ins in progress are not copied:
 * everyone signs in again after the switch.
 *
 *   npm run db:copy-to-postgres
 *
 * The target must be empty: the script refuses to run otherwise.
 */
import { existsSync } from "node:fs";
import { configFromEnv } from "./db/index.ts";
import { migrate } from "./db/migrate.ts";
import { openPostgres } from "./db/postgres.ts";
import { openSqlite } from "./db/sqlite.ts";

if (existsSync(".env")) process.loadEnvFile(".env");

const config = configFromEnv();
if (!config.databaseUrl) throw new Error("Set DATABASE_URL to the PostgreSQL target first");
if (!existsSync(config.sqlitePath)) throw new Error(`SQLite file not found: ${config.sqlitePath}`);

const source = openSqlite(config.sqlitePath);
const target = openPostgres(config.databaseUrl);

try {
  await migrate(source);
  await migrate(target);

  const existing = await target.query("SELECT (SELECT COUNT(*) FROM users) + (SELECT COUNT(*) FROM accounts) AS n");
  if (Number(existing[0]?.n) > 0) throw new Error("The PostgreSQL database already has accounts or players");

  const accounts = await source.query("SELECT * FROM accounts ORDER BY id");
  const credentials = await source.query("SELECT * FROM credentials ORDER BY id");
  const users = await source.query("SELECT * FROM users ORDER BY id");
  const attempts = await source.query("SELECT * FROM attempts ORDER BY id");
  const quizzes = await source.query("SELECT * FROM quiz_results ORDER BY id");
  const quizAnswers = await source.query("SELECT * FROM quiz_answers ORDER BY id");

  // Values come from our own tables: integers, plus text passed through quote().
  const quote = (value: unknown): string => {
    if (value === null || value === undefined) return "NULL";
    return typeof value === "number" ? String(value) : `'${String(value).replace(/'/g, "''")}'`;
  };
  const insert = (table: string, columns: string[], rows: Record<string, unknown>[]): string => {
    let sql = "";
    for (let i = 0; i < rows.length; i += 500) {
      const values = rows
        .slice(i, i + 500)
        .map((row) => `(${columns.map((column) => quote(row[column])).join(", ")})`);
      sql += `INSERT INTO ${table} (${columns.join(", ")}) VALUES\n${values.join(",\n")};\n`;
    }
    return sql;
  };
  // Move the identity sequences past the copied ids.
  const bump = (table: string): string =>
    `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM ${table};\n`;

  try {
    await target.exec(
      "BEGIN;\n" +
        insert("accounts", ["id", "email", "name", "created_at"], accounts) +
        insert("users", ["id", "name", "name_key", "created_at", "account_id"], users) +
        insert(
          "credentials",
          ["id", "account_id", "player_id", "type", "provider", "subject", "secret", "label", "created_at", "last_used_at"],
          credentials,
        ) +
        insert(
          "attempts",
          [
            "id",
            "user_id",
            "at",
            "maximum",
            "operator",
            "top",
            "bottom",
            "given",
            "correct",
            "given_remainder",
          ],
          attempts,
        ) +
        insert(
          "quiz_results",
          ["id", "user_id", "at", "level", "topics", "seed", "question_count", "correct", "answers", "focus", "version"],
          quizzes,
        ) +
        insert(
          "quiz_answers",
          ["id", "quiz_id", "user_id", "at", "position", "skill", "topic", "given", "correct", "review", "mistake"],
          quizAnswers,
        ) +
        bump("accounts") +
        bump("credentials") +
        bump("users") +
        bump("attempts") +
        bump("quiz_results") +
        bump("quiz_answers") +
        "COMMIT;",
    );
  } catch (error) {
    await target.exec("ROLLBACK").catch(() => undefined);
    throw error;
  }
  console.log(
    `copied ${accounts.length} accounts, ${credentials.length} sign-in methods, ${users.length} players, ${attempts.length} attempts and ${quizzes.length} tests to ${target.label}`,
  );
} finally {
  await source.close();
  await target.close();
}
