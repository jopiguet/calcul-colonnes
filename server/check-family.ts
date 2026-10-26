/**
 * Checks of the family release (npm run check:family), on a fresh SQLite file
 * through the real routes: sign-up by invitation (REGISTRATION=invite), the
 * owner's role, content an account may not see, and deleting an account.
 * The browser tests run with open registration; this covers invite mode.
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "./app.ts";
import type { AuthConfig } from "./auth/config.ts";

let failures = 0;
let checks = 0;
function expect(label: string, actual: unknown, wanted: unknown): void {
  checks++;
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    failures++;
    console.error(`✘ ${label}: got ${JSON.stringify(actual)}, wanted ${JSON.stringify(wanted)}`);
  }
}

const dir = mkdtempSync(join(tmpdir(), "luma-family-"));
const { openDatabase } = await import("./db/index.ts");
const db = await openDatabase({ databaseUrl: "", sqlitePath: join(dir, "family.sqlite") }).catch(() => null);
if (!db) {
  console.log("family checks: skipped (SQLite not installed)");
  process.exit(0);
}

try {
  const { migrate } = await import("./db/migrate.ts");
  const { VocabStore } = await import("./vocab.ts");
  const { ExerciseStore } = await import("./exercises.ts");
  await migrate(db);
  const config: AuthConfig = {
    publicUrl: new URL("http://localhost:8787"),
    secureCookies: false,
    sessionDays: 30,
    registration: "invite",
    trustProxy: true, // the client address from a header: app.request has no socket
    attemptsPerAddress: 1000,
    privacyHosting: "EU",
    privacyContact: "owner@example.test",
  };
  const app = createApp(db, config, new Map());

  /** A browser: its cookie, and JSON requests. */
  const browser = () => {
    let cookie = "";
    return async (method: string, path: string, body?: unknown): Promise<{ status: number; json: Record<string, unknown> | unknown[] | null }> => {
      const response = await app.request(path, {
        method,
        headers: { "cf-connecting-ip": "127.0.0.1", ...(body ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const set = response.headers.get("set-cookie");
      if (set) cookie = set.split(";")[0]!;
      // An image is not JSON: its status is enough.
      if (!(response.headers.get("content-type") ?? "").includes("json")) return { status: response.status, json: null };
      const text = await response.text();
      return { status: response.status, json: text ? (JSON.parse(text) as Record<string, unknown>) : null };
    };
  };
  const account = (name: string, email: string, invite?: string) => ({ name, email, password: "correct horse battery", ...(invite ? { invite } : {}) });

  // Content: a book of the owner's, and the characters (open licence).
  const vocab = new VocabStore(db);
  await vocab.import({
    book: { id: "owned", title: "Owned", kind: "translation", term: "es", meaning: "en" },
    lessons: [{ title: "L", subtitle: "", sections: [{ title: "S", subtitle: "", entries: [{ term: "uno", meaning: "one" }, { term: "dos", meaning: "two" }] }] }],
  });
  await vocab.import({
    book: { id: "kana", title: "Kana", kind: "characters", term: "ja", meaning: "en" },
    lessons: [{ title: "L", subtitle: "", sections: [{ title: "S", subtitle: "", entries: [{ term: "あ", meaning: "a" }, { term: "い", meaning: "i" }] }] }],
  });

  // A workbook of the owner's: the invented one of the browser tests.
  await new ExerciseStore(db).importFolder("tests/e2e/fixtures/exercise-book");

  // The first account: no invitation needed, and it is the owner.
  const owner = browser();
  expect("first account without invitation", (await owner("POST", "/api/auth/register", account("Owner", "owner@example.test"))).status, 201);
  const session = (await owner("GET", "/api/auth/session")).json as { account: { owner: boolean } };
  expect("first account is the owner", session.account.owner, true);
  const options = (await owner("GET", "/api/auth/options")).json as { invite: boolean; registration: boolean; hosting: string };
  expect("options: by invitation", [options.invite, options.registration, options.hosting], [true, true, "EU"]);

  // Anyone else needs an invitation.
  const stranger = browser();
  expect("no invitation: refused", (await stranger("POST", "/api/auth/register", account("Stranger", "s@example.test"))).json, { error: "invite_invalid" });
  expect("a made-up code: refused", (await stranger("POST", "/api/auth/register", account("Stranger", "s@example.test", "made-up-code-123"))).status, 403);
  expect("a member cannot invite", (await stranger("POST", "/api/admin/invites", { note: "x" })).status, 401);

  const made = (await owner("POST", "/api/admin/invites", { note: "Rosa" })).json as { code: string; link: string };
  expect("the link carries the code", made.link, `http://localhost:8787/#join=${made.code}`);
  expect("usable before", (await stranger("GET", `/api/auth/invites/${made.code}`)).json, { usable: true });
  const rosa = browser();
  expect("with the invitation: created", (await rosa("POST", "/api/auth/register", account("Rosa", "rosa@example.test", made.code))).status, 201);
  expect("used once only", (await stranger("POST", "/api/auth/register", account("Other", "o@example.test", made.code))).json, { error: "invite_invalid" });
  expect("not usable after", (await stranger("GET", `/api/auth/invites/${made.code}`)).json, { usable: false });
  const invites = ((await owner("GET", "/api/admin")).json as { invites: { note: string; usedBy: string | null }[] }).invites;
  expect("the owner sees who used it", invites.map((i) => [i.note, i.usedBy]), [["Rosa", "Rosa"]]);

  // An expired invitation is refused.
  const old = (await owner("POST", "/api/admin/invites", { note: "late" })).json as { code: string };
  await db.query("UPDATE account_invites SET expires_at = 1 WHERE note = 'late'");
  expect("expired: refused", (await stranger("POST", "/api/auth/register", account("Late", "late@example.test", old.code))).json, { error: "invite_invalid" });

  // Rosa is a member: no owner's page; the owner's book is not hers, the characters are.
  expect("member: not the owner", ((await rosa("GET", "/api/auth/session")).json as { account: { owner: boolean } }).account.owner, false);
  expect("member: owner's page refused", (await rosa("GET", "/api/admin")).status, 403);
  const seen = ((await rosa("GET", "/api/vocab/books")).json as { slug: string }[]).map((b) => b.slug);
  expect("member: shared books only", seen, ["kana"]);
  expect("owner: every book", ((await owner("GET", "/api/vocab/books")).json as { slug: string }[]).map((b) => b.slug), ["owned", "kana"]);
  expect("member: an empty bank", ((await rosa("GET", "/api/quiz/bank")).json as { revision: number }).revision, 0);
  const player = (await rosa("POST", "/api/users", { name: "Léo" })).json as { id: number };
  const ownedId = Number((await db.query("SELECT id FROM vocab_books WHERE slug = 'owned'"))[0]!.id);
  const ownedEntry = Number((await db.query("SELECT e.id FROM vocab_entries e WHERE e.term = 'uno'"))[0]!.id);
  expect("member: a session of the owner's book refused", (await rosa("GET", `/api/vocab/session?userId=${player.id}&kind=all&id=${ownedId}&purpose=learn&size=15&mode=choice`)).status, 404);
  expect("member: an answer in it refused", (await rosa("POST", "/api/vocab/answers", { userId: player.id, entryId: ownedEntry, direction: "recognise", mode: "choice", given: "one" })).status, 404);

  // The owner's workbook: not hers either, nor its images, until shared.
  expect("member: no workbook", (await rosa("GET", `/api/exercises/books?userId=${player.id}`)).json, []);
  expect("member: a unit refused", (await rosa("GET", `/api/exercises/books/test-workbook/units/1?userId=${player.id}`)).status, 404);
  expect("member: an image refused", (await rosa("GET", "/api/exercises/image/test-workbook/1.1")).status, 404);
  expect("member: a correction refused", (await rosa("POST", "/api/exercises/check", { userId: player.id, book: "test-workbook", unit: 1, answers: {} })).status, 404);
  expect("owner shares the workbook", (await owner("PUT", "/api/admin/exercise-books/test-workbook", { visibility: "shared" })).status, 204);
  expect("member: the workbook seen", ((await rosa("GET", `/api/exercises/books?userId=${player.id}`)).json as { id: string }[]).map((b) => b.id), ["test-workbook"]);
  expect("member: an image now", (await rosa("GET", "/api/exercises/image/test-workbook/1.1")).status, 200);

  // Shared by the owner: seen.
  expect("owner shares the book", (await owner("PUT", `/api/admin/books/${ownedId}`, { visibility: "shared" })).status, 204);
  expect("member: now seen", ((await rosa("GET", "/api/vocab/books")).json as { slug: string }[]).map((b) => b.slug), ["owned", "kana"]);
  expect("member: written questions refused in a test", (await rosa("POST", "/api/quizzes", { userId: player.id, seed: 1, level: "chemistry", topics: ["gases"], count: 5, answers: [-1, -1, -1, -1, -1], bank: 1 })).status, 400);

  // Feedback and export.
  expect("feedback sent", (await rosa("POST", "/api/feedback", { text: "Super", page: "home" })).status, 204);
  expect("the owner reads it", ((await owner("GET", "/api/admin")).json as { feedback: { text: string; account: string }[] }).feedback.map((f) => [f.text, f.account]), [["Super", "Rosa"]]);
  const exported = (await rosa("GET", "/api/export")).json as { account: { email: string }; players: { name: string }[]; feedback: unknown[] };
  expect("export: the account and its players", [exported.account.email, exported.players.map((p) => p.name), exported.feedback.length], ["rosa@example.test", ["Léo"], 1]);
  expect("export: no secret", JSON.stringify(exported).includes("scrypt") || JSON.stringify(exported).includes("secret"), false);

  // Deletion: the owner waits for the others; a member goes with everything.
  expect("owner cannot leave others behind", (await owner("DELETE", "/api/auth/account", { confirm: "delete-account" })).json, { error: "owner_with_members" });
  expect("unconfirmed: refused", (await rosa("DELETE", "/api/auth/account", {})).status, 400);
  expect("member deleted", (await rosa("DELETE", "/api/auth/account", { confirm: "delete-account" })).status, 204);
  expect("signed out", (await rosa("GET", "/api/auth/session")).json, { authenticated: false });
  expect("her player and results gone", (await db.query("SELECT COUNT(*) AS n FROM users WHERE id = $1", [player.id]))[0]!.n, 0);
  expect("her feedback kept, without her", ((await owner("GET", "/api/admin")).json as { feedback: { account: string | null }[] }).feedback.map((f) => f.account), [null]);
  expect("the owner alone may leave", (await owner("DELETE", "/api/auth/account", { confirm: "delete-account" })).status, 204);
  expect("no account left", (await db.query("SELECT COUNT(*) AS n FROM accounts"))[0]!.n, 0);

  // Never indexed.
  const robots = await app.request("/robots.txt");
  expect("robots.txt", [await robots.text(), robots.headers.get("x-robots-tag")], ["User-agent: *\nDisallow: /\n", "noindex, nofollow"]);
} finally {
  await db.close();
  rmSync(dir, { recursive: true, force: true });
}

if (failures > 0) {
  console.error(`${failures} of ${checks} family checks failed`);
  process.exit(1);
}
console.log(`family checks passed (${checks})`);
