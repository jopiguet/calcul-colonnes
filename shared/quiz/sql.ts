/**
 * SQL: the language, the three engines most met (PostgreSQL, SQLite, MySQL)
 * with their clients, and good practice. Like Linux, two sorts of kinds:
 *
 * - **Written** ones, lists in `sql/*.ts` (English, French, Spanish; code
 *   between backticks, the same in every language). An engine's questions say
 *   how to install its client.
 * - **Generated** ones: two small random tables and a query; what does it
 *   return? (`sql-output.ts`, checked against a real SQLite database).
 *
 * A written list only grows: a new question gets `since: <new QUIZ_VERSION>`.
 */
import type { Generator } from "./types";
import type { LinuxQuestion as SqlQuestion } from "./linux/types";
import { written } from "./linux";
import { aggregate, join, modify, select } from "./sql/language";
import { mysql, postgres, sqlite } from "./sql/engines";
import { practice } from "./sql/practice";
import { averageAge, countValues, filterRows, groupCount, joinRows, nullRows, orderLimit } from "./sql-output";

export type { SqlQuestion };

const kinds = (lists: Record<string, readonly SqlQuestion[]>): Record<string, Generator> =>
  Object.fromEntries(Object.entries(lists).map(([name, list]) => [name, written(list)]));

/** Every written SQL question, for the checks. */
export const SQL_QUESTIONS: Record<string, Record<string, readonly SqlQuestion[]>> = { select, aggregate, join, modify, postgres, sqlite, mysql, practice };

export const sqlSelect = { sql: { ...kinds(select), filterRows, nullRows, orderLimit } };
export const sqlAggregate = { sql: { ...kinds(aggregate), countValues, averageAge, groupCount } };
export const sqlJoins = { sql: { ...kinds(join), joinRows } };
export const sqlModify = { sql: kinds(modify) };
export const sqlPostgres = { sql: kinds(postgres) };
export const sqlSqlite = { sql: kinds(sqlite) };
export const sqlMysql = { sql: kinds(mysql) };
export const sqlPractice = { sql: kinds(practice) };
