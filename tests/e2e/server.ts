/** Test server: starts the real server on a fresh SQLite file. */
import { rmSync } from "node:fs";

const path = process.env.SQLITE_PATH;
if (!path || process.env.DATABASE_URL) throw new Error("the test server must run on its own SQLite file");
for (const suffix of ["", "-wal", "-shm"]) rmSync(path + suffix, { force: true });

await import("../../server/index.ts");
