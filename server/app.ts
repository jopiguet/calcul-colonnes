import { Hono } from "hono";
import {
  LEVELS,
  MAX_QUESTIONS,
  ANSWER_MODES,
  OPTION_COUNT,
  QUIZ_VERSION,
  TYPED_MAX,
  topicsFor,
  TOPICS,
  isSkill,
  type AnswerMode,
  type Level,
  type Topic,
} from "../shared/quiz/index.ts";
import type { NewAttempt, NewQuizResult } from "../shared/types.ts";
import type { AuthConfig } from "./auth/config.ts";
import { loadSession, originCheck, requireAccount, requireSession, type AppEnv } from "./auth/middleware.ts";
import type { Provider } from "./auth/providers.ts";
import { authRoutes } from "./auth/routes.ts";
import { AuthStore } from "./auth/store.ts";
import type { Database } from "./db/index.ts";
import { Repository, type Scope } from "./repository.ts";
import { VocabStore, vocabRoutes } from "./vocab.ts";

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

type ValidQuiz = NewQuizResult & { level: Level; topics: Topic[]; mode: AnswerMode };

function parseQuiz(body: unknown): ValidQuiz | null {
  if (typeof body !== "object" || body === null) return null;
  const { userId, seed, level, topics, count, answers, focus = [], version = QUIZ_VERSION, mode = "choices" } = body as Record<
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
  if ((level === "school" || level === "university") && !topics.some((t) => topicsFor(level, typeof version === "number" ? version : QUIZ_VERSION).includes(t as Topic))) return null;
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
  };
}

export function createApp(db: Database, authConfig: AuthConfig, providers: Map<string, Provider>): Hono<AppEnv> {
  const repository = new Repository(db);
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

  data.delete("/users/:id", requireAccount, async (c) => {
    const id = Number(c.req.param("id"));
    if (!isInt(id, 1, Number.MAX_SAFE_INTEGER)) return c.json({ error: "invalid id" }, 400);
    if (!(await repository.getUser(id, scope(c)))) return c.json({ error: "unknown user" }, 404);
    await repository.deleteUser(id);
    return c.body(null, 204);
  });

  data.post("/attempts", async (c) => {
    const attempt = parseAttempt(await c.req.json().catch(() => null));
    if (!attempt) return c.json({ error: "invalid attempt" }, 400);
    if (!(await repository.getUser(attempt.userId, scope(c)))) return c.json({ error: "unknown user" }, 404);
    return c.json(await repository.addAttempt(attempt), 201);
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
    const quiz = parseQuiz(await c.req.json().catch(() => null));
    if (!quiz) return c.json({ error: "invalid quiz" }, 400);
    if (!(await repository.getUser(quiz.userId, scope(c)))) return c.json({ error: "unknown user" }, 404);
    return c.json(await repository.addQuiz(quiz), 201);
  });

  data.get("/stats", async (c) => {
    const since = Number(c.req.query("since") ?? 0);
    if (!Number.isFinite(since) || since < 0) return c.json({ error: "invalid since" }, 400);
    return c.json(await repository.stats(Math.trunc(since), scope(c)));
  });

  data.route("/vocab", vocabRoutes(new VocabStore(db), repository, scope as (c: never) => Scope));

  api.route("/", data);

  api.onError((error, c) => {
    console.error(`${c.req.method} ${c.req.path}:`, error.message);
    return c.json({ error: "database error" }, 500);
  });

  const app = new Hono<AppEnv>();
  // Answers are per account and change with every answer: never kept by a
  // browser or a proxy (Cloudflare).
  app.use("/api/*", async (c, next) => {
    await next();
    if (!c.res.headers.has("Cache-Control")) c.res.headers.set("Cache-Control", "no-store");
  });
  app.route("/api", api);
  return app;
}
