import { Hono } from "hono";
import {
  LEVELS,
  MAX_QUESTIONS,
  OPTION_COUNT,
  QUIZ_VERSION,
  TOPICS,
  isSkill,
  type Level,
  type Topic,
} from "../shared/quiz/index.ts";
import type { NewAttempt, NewQuizResult } from "../shared/types.ts";
import type { Database } from "./db/index.ts";
import { Repository } from "./repository.ts";

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

type ValidQuiz = NewQuizResult & { level: Level; topics: Topic[] };

function parseQuiz(body: unknown): ValidQuiz | null {
  if (typeof body !== "object" || body === null) return null;
  const { userId, seed, level, topics, count, answers, focus = [], version = QUIZ_VERSION } = body as Record<
    string,
    unknown
  >;
  // A browser still running an older build would show other questions than the server grades.
  if (version !== QUIZ_VERSION) return null;
  if (!isInt(userId, 1, Number.MAX_SAFE_INTEGER) || !isInt(seed, 0, 2 ** 32 - 1)) return null;
  if (!LEVELS.includes(level as Level) || !isInt(count, 1, MAX_QUESTIONS)) return null;
  if (!Array.isArray(topics) || topics.length === 0) return null;
  if (!topics.every((t) => TOPICS.includes(t as Topic)) || new Set(topics).size !== topics.length) return null;
  if (!Array.isArray(answers) || answers.length !== count) return null;
  if (!answers.every((a) => isInt(a, -1, OPTION_COUNT - 1))) return null;
  if (!Array.isArray(focus) || focus.length > 100) return null;
  if (!focus.every((s) => typeof s === "string" && isSkill(s)) || new Set(focus).size !== focus.length) return null;
  return {
    userId,
    seed,
    level: level as Level,
    topics: topics as Topic[],
    count,
    answers: answers as number[],
    focus: focus as string[],
  };
}

export function createApp(db: Database): Hono {
  const repository = new Repository(db);
  const api = new Hono();

  api.get("/health", (c) => c.json({ ok: true, database: db.dialect }));

  api.get("/users", async (c) => c.json(await repository.listUsers()));

  api.post("/users", async (c) => {
    const body: unknown = await c.req.json().catch(() => null);
    const raw = (body as { name?: unknown } | null)?.name;
    const name = typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
    if (name === "" || name.length > NAME_LENGTH) return c.json({ error: "invalid name" }, 400);
    const user = await repository.addUser(name);
    return user ? c.json(user, 201) : c.json({ error: "name already used" }, 409);
  });

  api.delete("/users/:id", async (c) => {
    const id = Number(c.req.param("id"));
    if (!isInt(id, 1, Number.MAX_SAFE_INTEGER)) return c.json({ error: "invalid id" }, 400);
    await repository.deleteUser(id);
    return c.body(null, 204);
  });

  api.post("/attempts", async (c) => {
    const attempt = parseAttempt(await c.req.json().catch(() => null));
    if (!attempt) return c.json({ error: "invalid attempt" }, 400);
    if (!(await repository.getUser(attempt.userId))) return c.json({ error: "unknown user" }, 404);
    return c.json(await repository.addAttempt(attempt), 201);
  });

  api.get("/users/:id/profile", async (c) => {
    const id = Number(c.req.param("id"));
    if (!isInt(id, 1, Number.MAX_SAFE_INTEGER)) return c.json({ error: "invalid id" }, 400);
    const since = Number(c.req.query("since") ?? 0);
    if (!Number.isFinite(since) || since < 0) return c.json({ error: "invalid since" }, 400);
    const user = await repository.getUser(id);
    if (!user) return c.json({ error: "unknown user" }, 404);
    return c.json(await repository.profile(user, Math.trunc(since)));
  });

  api.post("/quizzes", async (c) => {
    const quiz = parseQuiz(await c.req.json().catch(() => null));
    if (!quiz) return c.json({ error: "invalid quiz" }, 400);
    if (!(await repository.getUser(quiz.userId))) return c.json({ error: "unknown user" }, 404);
    return c.json(await repository.addQuiz(quiz), 201);
  });

  api.get("/stats", async (c) => {
    const since = Number(c.req.query("since") ?? 0);
    if (!Number.isFinite(since) || since < 0) return c.json({ error: "invalid since" }, 400);
    return c.json(await repository.stats(Math.trunc(since)));
  });

  api.onError((error, c) => {
    console.error(`${c.req.method} ${c.req.path}:`, error.message);
    return c.json({ error: "database error" }, 500);
  });

  const app = new Hono();
  app.route("/api", api);
  return app;
}
