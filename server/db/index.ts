/**
 * One small interface over the two engines.
 *
 * Queries are written once, in the subset of SQL that SQLite and PostgreSQL
 * share, with PostgreSQL-style placeholders ($1, $2…). Only the migrations
 * have one file per engine, because the id columns are declared differently.
 */

export type Dialect = "sqlite" | "postgres";
export type Param = string | number | null;
export type Row = Record<string, unknown>;

export interface Database {
  readonly dialect: Dialect;
  /** Human-readable target, without credentials, for the startup log. */
  readonly label: string;
  query(sql: string, params?: Param[]): Promise<Row[]>;
  /** Runs several statements without parameters (migrations). */
  exec(sql: string): Promise<void>;
  /**
   * Runs `work` in one transaction, on one connection: committed if it
   * resolves, rolled back if it throws.
   */
  transaction<T>(work: (tx: Pick<Database, "query">) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export interface DatabaseConfig {
  databaseUrl?: string;
  sqlitePath: string;
}

export function configFromEnv(env: NodeJS.ProcessEnv = process.env): DatabaseConfig {
  return {
    databaseUrl: env.DATABASE_URL?.trim() || undefined,
    sqlitePath: env.SQLITE_PATH?.trim() || "./data/calcul-colonnes.sqlite",
  };
}

/** DATABASE_URL set → PostgreSQL (Neon); otherwise the local SQLite file. */
export async function openDatabase(config: DatabaseConfig = configFromEnv()): Promise<Database> {
  if (config.databaseUrl) {
    if (!/^postgres(ql)?:\/\//.test(config.databaseUrl)) {
      throw new Error("DATABASE_URL must start with postgresql:// (or be empty to use SQLite)");
    }
    const { openPostgres } = await import("./postgres.ts");
    return openPostgres(config.databaseUrl);
  }
  const { openSqlite } = await import("./sqlite.ts");
  return openSqlite(config.sqlitePath);
}
