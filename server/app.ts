import { Hono } from "hono";
import {
  LEVELS,
  isChemistry,
  MAX_QUESTIONS,
  ANSWER_MODES,
  OPTION_COUNT,
  QUIZ_VERSION,
  TYPED_MAX,
  topicsFor,
  TOPICS,
  isSkill,
  bankRevision,
  subjectOf,
  type AnswerMode,
  type Level,
  type Topic,
} from "../shared/quiz/index.ts";
import type { NewAttempt, NewQuizResult } from "../shared/types.ts";

/** Past tests listed per subject: the most recent. */
const PAST_TESTS = 50;
/** Feedback: a few paragraphs at most, 20 messages per account in 15 minutes. */
export const FEEDBACK_MAX = 2000;
import type { AuthConfig } from "./auth/config.ts";
import { loadSession, originCheck, requireAccount, requireSession, type AppEnv } from "./auth/middleware.ts";
import type { Provider } from "./auth/providers.ts";
import { authRoutes } from "./auth/routes.ts";
import { AuthStore } from "./auth/store.ts";
import type { Database } from "./db/index.ts";
import { ACTIVITY_ID, HIDDEN_MAX, Repository, normalizeCode, type Scope } from "./repository.ts";
import { RateLimit } from "./auth/rate-limit.ts";
import { VocabStore, vocabRoutes } from "./vocab.ts";
import { BankStore, bankRoutes, bankVisible } from "./quiz-bank.ts";
import { adminRoutes } from "./admin.ts";
import { APP_VERSION } from "./version.ts";
import { log } from "./runtime.ts";

const NAME_LENGTH = 20;
const LIMIT = 1_000_000; // generous bound on the numbers the app can send

const isInt = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;

function parseAttempt(body: unknown): NewAttempt | null {
  if (typeof body !== "object" || body === null) return null;
  const { userId, maximum, operator, top, bottom, given, givenRemainder } = body as Record<
    string,
    unknown
  >;
  if (operator !== "+" && operator !== "−" && operator !== "×" && operator !== "÷") return null;
  if (!isInt(userId, 1, Number.MAX_SAFE_INTEGER)) return null;
  if (!isInt(maximum, 1, LIMIT) || !isInt(top, 0, LIMIT) || !isInt(bottom, 0, LIMIT)) return null;
  if (!isInt(given, 0, LIMIT * LIMIT)) return null;
  if (operator !== "÷") return { userId, maximum, operator, top, bottom, given, givenRemainder: null };
  // A division needs a non-zero divisor and the remainder the player wrote.
  if (bottom === 0 || !isInt(givenRemainder, 0, LIMIT)) return null;
  return { userId, maximum, operator, top, bottom, given, givenRemainder };
}

type ValidQuiz = NewQuizResult & { level: Level; topics: Topic[]; mode: AnswerMode; bank: number | null };

function parseQuiz(body: unknown): ValidQuiz | null {
  if (typeof body !== "object" || body === null) return null;
  const { userId, seed, level, topics, count, answers, focus = [], version = QUIZ_VERSION, mode = "choices", bank = null } = body as Record<
    string,
    unknown
  >;
  // A browser still running an older build would show other questions than the server grades.
  if (version !== QUIZ_VERSION) return null;
  if (!isInt(userId, 1, Number.MAX_SAFE_INTEGER) || !isInt(seed, 0, 2 ** 32 - 1)) return null;
  if (!LEVELS.includes(level as Level) || !isInt(count, 1, MAX_QUESTIONS)) return null;
  if (!Array.isArray(topics) || topics.length === 0) return null;
  if (!topics.every((t) => TOPICS.includes(t as Topic)) || new Set(topics).size !== topics.length) return null;
  // At least one topic must have questions at this level (some exist at one level only).
  if (!topics.some((t) => topicsFor(level as Level, typeof version === "number" ? version : QUIZ_VERSION).includes(t as Topic))) return null;
  // The bank revision the browser drew from: the server's, or an older one (a test begun before an import).
  if (bank !== null && !isInt(bank, 0, bankRevision())) return null;
  if (!isChemistry(level as Level) && bank !== null) return null;
  if (!Array.isArray(answers) || answers.length !== count) return null;
  if (!ANSWER_MODES.includes(mode as AnswerMode)) return null;
  // An option index, or in a typed test a short text (matched against the options when graded).
  const valid = (a: unknown): boolean =>
    isInt(a, -1, OPTION_COUNT - 1) || (mode === "typed" && typeof a === "string" && a.length <= TYPED_MAX);
  if (!answers.every(valid)) return null;
  if (!Array.isArray(focus) || focus.length > 100) return null;
  if (!focus.every((s) => typeof s === "string" && isSkill(s)) || new Set(focus).size !== focus.length) return null;
  return {
    userId,
    seed,
    level: level as Level,
    topics: topics as Topic[],
    count,
    answers: answers as (number | string)[],
    focus: focus as string[],
    mode: mode as AnswerMode,
    bank: bank as number | null,
  };
}

export function createApp(db: Database, authConfig: AuthConfig, providers: Map<string, Provider>): Hono<AppEnv> {
  const repository = new Repository(db);
  // Wrong share codes per account: 20 in 15 minutes, on top of their 50 bits.
  const shareLimit = new RateLimit(20, 15 * 60_000);
  const feedbackLimit = new RateLimit(20, 15 * 60_000);
  const bank = new BankStore(db);
  const store = new AuthStore(db);
  const api = new Hono<AppEnv>();

  api.use("*", originCheck(authConfig));
  api.use("*", loadSession(store, authConfig));
  api.get("/health", (c) => c.json({ ok: true, database: db.dialect }));
  api.route("/auth", authRoutes(store, authConfig, providers));

  // Everything below needs a session, and sees only what the session may see.
  const data = new Hono<AppEnv>();
  data.use("*", requireSession);
  const scope = (c: { get(key: "session"): AppEnv["Variables"]["session"] }): Scope => {
    const session = c.get("session")!;
    return { accountId: session.accountId, playerId: session.playerId };
  };

  data.get("/users", async (c) => c.json(await repository.listUsers(scope(c))));

  data.post("/users", requireAccount, async (c) => {
    const body: unknown = await c.req.json().catch(() => null);
    const raw = (body as { name?: unknown } | null)?.name;
    const name = typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
    if (name === "" || name.length > NAME_LENGTH) return c.json({ error: "invalid name" }, 400);
    const user = await repository.addUser(name, scope(c).accountId);
    return user ? c.json(user, 201) : c.json({ error: "name already used" }, 409);
  });

  /** The account's own player is deleted with its results; a shared one only leaves this account's list. */
  data.delete("/users/:id", requireAccount, async (c) => {
    const id = Number(c.req.param("id"));
    if (!isInt(id, 1, Number.MAX_SAFE_INTEGER)) return c.json({ error: "invalid id" }, 400);
    const user = await repository.getUser(id, scope(c));
    if (!user) return c.json({ error: "unknown user" }, 404);
    if (user.sharedBy !== undefined) await repository.removeShare(id, scope(c).accountId);
    else await repository.deleteUser(id);
    return c.body(null, 204);
  });

  // ---- what a player sees, and sharing: the player's own account only
  const own = async (c: Parameters<typeof scope>[0] & { req: { param(name: string): string } }) => {
    const id = Number(c.req.param("id"));
    return isInt(id, 1, Number.MAX_SAFE_INTEGER) ? repository.ownUser(id, scope(c)) : null;
  };

  data.put("/users/:id/hidden", requireAccount, async (c) => {
    const user = await own(c);
    if (!user) return c.json({ error: "unknown user" }, 404);
    const hidden = ((await c.req.json().catch(() => null)) as { hidden?: unknown } | null)?.hidden;
    if (!Array.isArray(hidden) || hidden.length > HIDDEN_MAX || !hidden.every((a) => typeof a === "string" && ACTIVITY_ID.test(a))) {
      return c.json({ error: "invalid hidden" }, 400);
    }
    await repository.setHidden(user.id, hidden as string[]);
    return c.body(null, 204);
  });

  data.post("/users/:id/invites", requireAccount, async (c) => {
    const user = await own(c);
    if (!user) return c.json({ error: "unknown user" }, 404);
    return c.json(await repository.createInvite(user.id), 201);
  });

  data.get("/users/:id/shares", requireAccount, async (c) => {
    const user = await own(c);
    if (!user) return c.json({ error: "unknown user" }, 404);
    return c.json(await repository.listShares(user.id));
  });

  data.delete("/users/:id/shares/:account", requireAccount, async (c) => {
    const user = await own(c);
    const account = Number(c.req.param("account"));
    if (!user) return c.json({ error: "unknown user" }, 404);
    if (!isInt(account, 1, Number.MAX_SAFE_INTEGER)) return c.json({ error: "invalid account" }, 400);
    return (await repository.removeShare(user.id, account)) ? c.body(null, 204) : c.json({ error: "unknown share" }, 404);
  });

  /** A share code typed on the Account page of another account. */
  data.post("/shares", requireAccount, async (c) => {
    const key = String(scope(c).accountId);
    if (!shareLimit.allowed(key)) return c.json({ error: "too_many_attempts" }, 429);
    const code = normalizeCode(((await c.req.json().catch(() => null)) as { code?: unknown } | null)?.code);
    const result = code ? await repository.redeemInvite(code, scope(c).accountId) : ({ error: "invalid_code" } as const);
    if ("error" in result) {
      if (result.error === "invalid_code") shareLimit.hit(key);
      return c.json(result, result.error === "invalid_code" ? 404 : 409);
    }
    return c.json(result.user, 201);
  });

  data.post("/attempts", async (c) => {
    const attempt = parseAttempt(await c.req.json().catch(() => null));
    if (!attempt) return c.json({ error: "invalid attempt" }, 400);
    if (!(await repository.getUser(attempt.userId, scope(c)))) return c.json({ error: "unknown user" }, 404);
    return c.json(await repository.addAttempt(attempt), 201);
  });

  // A player's past tests in one subject, to see their corrections again.
  data.get("/users/:id/tests", async (c) => {
    const id = Number(c.req.param("id"));
    if (!isInt(id, 1, Number.MAX_SAFE_INTEGER)) return c.json({ error: "invalid id" }, 400);
    const subject = c.req.query("subject");
    if (subject !== "maths" && subject !== "chemistry" && subject !== "linux" && subject !== "chembio" && subject !== "sql") return c.json({ error: "invalid subject" }, 400);
    const user = await repository.getUser(id, scope(c));
    if (!user) return c.json({ error: "unknown user" }, 404);
    return c.json(await repository.pastTests(id, LEVELS.filter((l) => subjectOf(l) === subject), PAST_TESTS));
  });

  data.get("/users/:id/profile", async (c) => {
    const id = Number(c.req.param("id"));
    if (!isInt(id, 1, Number.MAX_SAFE_INTEGER)) return c.json({ error: "invalid id" }, 400);
    const since = Number(c.req.query("since") ?? 0);
    if (!Number.isFinite(since) || since < 0) return c.json({ error: "invalid since" }, 400);
    const user = await repository.getUser(id, scope(c));
    if (!user) return c.json({ error: "unknown user" }, 404);
    return c.json(await repository.profile(user, Math.trunc(since)));
  });

  data.post("/quizzes", async (c) => {
    await bank.refresh(); // a bank imported since the server started
    const quiz = parseQuiz(await c.req.json().catch(() => null));
    if (!quiz) return c.json({ error: "invalid quiz" }, 400);
    // Written questions only for an account that sees the bank.
    if (quiz.bank && !(await bankVisible(repository, c.get("session")!.owner))) return c.json({ error: "invalid quiz" }, 400);
    if (!(await repository.getUser(quiz.userId, scope(c)))) return c.json({ error: "unknown user" }, 404);
    return c.json(await repository.addQuiz(quiz), 201);
  });

  data.get("/stats", async (c) => {
    const since = Number(c.req.query("since") ?? 0);
    if (!Number.isFinite(since) || since < 0) return c.json({ error: "invalid since" }, 400);
    return c.json(await repository.stats(Math.trunc(since), scope(c)));
  });

  const vocabStore = new VocabStore(db);
  data.route("/vocab", vocabRoutes(vocabStore, repository, scope as (c: never) => Scope));

  // "Send feedback": a few lines for the owner, with the page and the version.
  data.post("/feedback", async (c) => {
    const body = ((await c.req.json().catch(() => null)) ?? {}) as Record<string, unknown>;
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const page = typeof body.page === "string" ? body.page.slice(0, 100) : "";
    if (!text || text.length > FEEDBACK_MAX) return c.json({ error: "invalid feedback" }, 400);
    const session = c.get("session")!;
    if (!feedbackLimit.allowed(String(session.accountId))) return c.json({ error: "too_many_attempts" }, 429);
    feedbackLimit.hit(String(session.accountId));
    await repository.addFeedback({ accountId: session.accountId, playerId: session.playerId, page, version: APP_VERSION, text });
    return c.body(null, 204);
  });

  // Everything stored about the account and its players, to download.
  data.get("/export", requireAccount, async (c) => {
    const account = scope(c).accountId;
    c.header("Content-Disposition", `attachment; filename="luma-${new Date().toISOString().slice(0, 10)}.json"`);
    return c.json(await repository.exportAccount(account));
  });

  // The owner's page: invitations, who sees which content, feedback.
  data.route("/admin", adminRoutes({ store, repository, vocab: vocabStore, publicUrl: authConfig.publicUrl, registration: authConfig.registration }));
  data.route("/quiz", bankRoutes(bank, repository, scope as (c: never) => Scope));

  api.route("/", data);

  api.onError((error, c) => {
    // Cloud Run passes its trace id, so the error can be found next to its request in the logs.
    log.error(`${c.req.method} ${c.req.path}`, error, { trace: c.req.header("x-cloud-trace-context") });
    return c.json({ error: "database error" }, 500);
  });

  const app = new Hono<AppEnv>();
  // A family app: never listed by a search engine (docs/authentication.md#family-release).
  app.use("*", async (c, next) => {
    await next();
    c.res.headers.set("X-Robots-Tag", "noindex, nofollow");
  });
  app.get("/robots.txt", (c) => c.text("User-agent: *\nDisallow: /\n"));
  // Answers are per account and change with every answer: never kept by a
  // browser or a proxy (Cloudflare).
  app.use("/api/*", async (c, next) => {
    await next();
    if (!c.res.headers.has("Cache-Control")) c.res.headers.set("Cache-Control", "no-store");
  });
  app.route("/api", api);
  return app;
}
