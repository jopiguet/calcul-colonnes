import {
  QUIZ_VERSION,
  RECENT,
  generateQuiz,
  gradeQuiz,
  resolveAnswers,
  skillStatus,
  typeable,
  type AnswerMode,
  type Level,
  type Question,
  type Topic,
} from "../shared/quiz/index.ts";
import type {
  NewAttempt,
  MistakeProgress,
  NewQuizResult,
  Operator,
  OperatorProgress,
  PastTest,
  PlayerShare,
  Profile,
  SkillProgress,
  User,
  UserStats,
} from "../shared/types.ts";
import { createHash, randomInt } from "node:crypto";
import type { Database, Row } from "./db/index.ts";
import { log } from "./runtime.ts";

/** Activity ids on the home page: "columns", "vocab-collins-spanish"… */
export const ACTIVITY_ID = /^[a-z0-9][a-z0-9-]{0,59}$/;
export const HIDDEN_MAX = 200;

function hiddenOf(raw: unknown): string[] {
  try {
    const list: unknown = JSON.parse(String(raw ?? "[]"));
    return Array.isArray(list) ? list.filter((a): a is string => typeof a === "string" && ACTIVITY_ID.test(a)) : [];
  } catch {
    return [];
  }
}

// PostgreSQL returns BIGINT and aggregates as strings, SQLite as numbers: always go through Number().
// `accountId`: the session's account; a player of another account is shared with it.
const toUser = (row: Row, accountId?: number): User => ({
  id: Number(row.id),
  name: String(row.name),
  createdAt: Number(row.created_at),
  hidden: hiddenOf(row.hidden),
  ...(accountId !== undefined && row.account_id !== null && row.account_id !== undefined && Number(row.account_id) !== accountId
    ? { sharedBy: String(row.owner_name ?? "") }
    : {}),
});

/** Players a session's account sees: its own, and those shared with it. Uses $1 for the account id. */
const VISIBLE = "(u.account_id = $1 OR EXISTS (SELECT 1 FROM player_shares s WHERE s.user_id = u.id AND s.account_id = $1))";
const USER_COLUMNS = "u.id, u.name, u.created_at, u.hidden, u.account_id, o.name AS owner_name";

/** Share codes: 10 characters without look-alikes (0/O, 1/I), about 50 bits, shown as XXXXX-XXXXX. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const INVITE_DAYS = 7;
const hashCode = (code: string): string => createHash("sha256").update(code).digest("hex");
/** A typed code, upper-cased, without spaces or dashes; null when it cannot be one. */
export function normalizeCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.toUpperCase().replace(/[\s-]/g, "");
  return code.length === 10 && [...code].every((ch) => CODE_ALPHABET.includes(ch)) ? code : null;
}

export type RedeemResult = { user: User } | { error: "invalid_code" | "own_player" | "already_shared" };



/** Unique per account: "<account id>:<lower-cased name>". */
export const nameKey = (accountId: number, name: string): string => `${accountId}:${name.toLocaleLowerCase("fr")}`;

/** What a session may see: the account's players, or one player (a child's own login). */
export interface Scope {
  accountId: number;
  playerId: number | null;
}

/** Symbols stored in the database (plain ASCII). */
const STORED: Record<Operator, string> = { "+": "+", "−": "-", "×": "*", "÷": "/" };
const FROM_STORED: Record<string, Operator> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

export function isCorrect(attempt: NewAttempt): boolean {
  const { operator, top, bottom, given, givenRemainder } = attempt;
  switch (operator) {
    case "+":
      return given === top + bottom;
    case "−":
      return given === top - bottom;
    case "×":
      return given === top * bottom;
    case "÷": // Euclidean division: quotient and remainder must both be right
      return given === Math.floor(top / bottom) && givenRemainder === top % bottom;
  }
}

/** The mistake behind an answer: null when right or blank. */
function mistakeOf(q: Question, given: number): string | null {
  if (given < 0 || given === q.correct) return null;
  return q.options[given]?.mistake ?? null;
}

export class Repository {
  constructor(private readonly db: Database) {}

  async listUsers(scope: Scope): Promise<User[]> {
    const rows = await this.db.query(
      `SELECT ${USER_COLUMNS} FROM users u LEFT JOIN accounts o ON o.id = u.account_id
        WHERE ${VISIBLE} AND (CAST($2 AS BIGINT) = 0 OR u.id = CAST($2 AS BIGINT))`,
      [scope.accountId, scope.playerId ?? 0],
    );
    return rows.map((r) => toUser(r, scope.accountId)).sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }

  /** The player, if this session may see it: its account's, or shared with it. */
  async getUser(id: number, scope: Scope): Promise<User | null> {
    if (scope.playerId !== null && scope.playerId !== id) return null;
    const rows = await this.db.query(
      `SELECT ${USER_COLUMNS} FROM users u LEFT JOIN accounts o ON o.id = u.account_id WHERE ${VISIBLE} AND u.id = $2`,
      [scope.accountId, id],
    );
    return rows[0] ? toUser(rows[0], scope.accountId) : null;
  }

  /** The player, if the session is its account's (not a share, not a player's own login). */
  async ownUser(id: number, scope: Scope): Promise<User | null> {
    if (scope.playerId !== null) return null;
    const rows = await this.db.query(
      `SELECT ${USER_COLUMNS} FROM users u LEFT JOIN accounts o ON o.id = u.account_id WHERE u.id = $1 AND u.account_id = $2`,
      [id, scope.accountId],
    );
    return rows[0] ? toUser(rows[0], scope.accountId) : null;
  }

  async setHidden(id: number, hidden: string[]): Promise<void> {
    await this.db.query("UPDATE users SET hidden = $1 WHERE id = $2", [JSON.stringify([...new Set(hidden)].sort()), id]);
  }

  /** A new share code for a player; the code itself is returned once and never stored. */
  async createInvite(userId: number, now = Date.now()): Promise<{ code: string; expiresAt: number }> {
    const code = Array.from({ length: 10 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");
    const expiresAt = now + INVITE_DAYS * 86_400_000;
    await this.db.query("DELETE FROM player_invites WHERE expires_at < $1", [now]);
    await this.db.query("INSERT INTO player_invites (id, user_id, created_at, expires_at) VALUES ($1, $2, $3, $4)", [
      hashCode(code),
      userId,
      now,
      expiresAt,
    ]);
    return { code: `${code.slice(0, 5)}-${code.slice(5)}`, expiresAt };
  }

  /** Uses a share code: the player becomes visible to this account. */
  async redeemInvite(code: string, accountId: number, now = Date.now()): Promise<RedeemResult> {
    return this.db.transaction(async (tx) => {
      const rows = await tx.query(
        `SELECT i.user_id, u.account_id FROM player_invites i JOIN users u ON u.id = i.user_id
          WHERE i.id = $1 AND i.used_at IS NULL AND i.expires_at > $2`,
        [hashCode(code), now],
      );
      const invite = rows[0];
      if (!invite) return { error: "invalid_code" } as const;
      const userId = Number(invite.user_id);
      if (Number(invite.account_id) === accountId) return { error: "own_player" } as const;
      const known = await tx.query("SELECT 1 AS x FROM player_shares WHERE user_id = $1 AND account_id = $2", [userId, accountId]);
      if (known.length > 0) return { error: "already_shared" } as const;
      await tx.query("INSERT INTO player_shares (user_id, account_id, created_at) VALUES ($1, $2, $3)", [userId, accountId, now]);
      await tx.query("UPDATE player_invites SET used_at = $1 WHERE id = $2", [now, hashCode(code)]);
      const user = await tx.query(
        `SELECT ${USER_COLUMNS} FROM users u LEFT JOIN accounts o ON o.id = u.account_id WHERE u.id = $1`,
        [userId],
      );
      return { user: toUser(user[0]!, accountId) };
    });
  }

  /** The accounts a player is shared with. */
  async listShares(userId: number): Promise<PlayerShare[]> {
    const rows = await this.db.query(
      `SELECT a.id, a.name, a.email, s.created_at FROM player_shares s JOIN accounts a ON a.id = s.account_id
        WHERE s.user_id = $1 ORDER BY s.created_at`,
      [userId],
    );
    return rows.map((r) => ({
      accountId: Number(r.id),
      name: String(r.name),
      email: r.email === null || r.email === undefined ? null : String(r.email),
      since: Number(r.created_at),
    }));
  }

  /** Ends a share; the player's results stay with the player. */
  async removeShare(userId: number, accountId: number): Promise<boolean> {
    const rows = await this.db.query("DELETE FROM player_shares WHERE user_id = $1 AND account_id = $2 RETURNING user_id", [
      userId,
      accountId,
    ]);
    return rows.length > 0;
  }

  /** Null when the account already has a player with the same name (ignoring case). */
  async addUser(name: string, accountId: number): Promise<User | null> {
    const rows = await this.db.query(
      `INSERT INTO users (name, name_key, created_at, account_id) VALUES ($1, $2, $3, $4)
       ON CONFLICT (name_key) DO NOTHING
       RETURNING id, name, created_at`,
      [name, nameKey(accountId, name), Date.now(), accountId],
    );
    return rows[0] ? toUser(rows[0]) : null;
  }

  /** The player's attempts go with them (ON DELETE CASCADE). */
  async deleteUser(id: number): Promise<void> {
    await this.db.query("DELETE FROM users WHERE id = $1", [id]);
  }

  async addAttempt(attempt: NewAttempt): Promise<{ correct: boolean }> {
    const correct = isCorrect(attempt);
    await this.db.query(
      `INSERT INTO attempts (user_id, at, maximum, operator, top, bottom, given, correct, given_remainder)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        attempt.userId,
        Date.now(),
        attempt.maximum,
        STORED[attempt.operator],
        attempt.top,
        attempt.bottom,
        attempt.given,
        correct ? 1 : 0,
        attempt.operator === "÷" ? attempt.givenRemainder : null,
      ],
    );
    return { correct };
  }

  /** Regenerates the test from its seed, grades it, and stores the result and each answer. */
  async addQuiz(result: NewQuizResult & { level: Level; topics: Topic[]; bank?: number | null }): Promise<{ correct: number; total: number }> {
    const mode = result.mode ?? "choices";
    const focus = result.focus ?? [];
    const questions = generateQuiz({
      seed: result.seed,
      level: result.level,
      topics: result.topics,
      count: result.count,
      focus,
      version: QUIZ_VERSION,
      ...(result.bank !== null && result.bank !== undefined ? { bank: result.bank } : {}),
    });
    // Typed answers are matched to the options here, never trusted from the browser.
    const given = resolveAnswers(questions, result.answers, mode);
    const correct = gradeQuiz(questions, given);
    const at = Date.now();
    const rows = await this.db.query(
      `INSERT INTO quiz_results (user_id, at, level, topics, seed, question_count, correct, answers, focus, version, mode, bank)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        result.userId,
        at,
        result.level,
        result.topics.join(","),
        result.seed,
        result.count,
        correct,
        JSON.stringify(result.answers),
        focus.join(","),
        QUIZ_VERSION,
        mode,
        result.bank ?? null,
      ],
    );
    await this.addQuizAnswers(Number(rows[0]!.id), result.userId, at, questions, result.answers, mode);
    return { correct, total: result.count };
  }

  private async addQuizAnswers(
    quizId: number,
    userId: number,
    at: number,
    questions: Question[],
    answers: (number | string)[],
    mode: AnswerMode,
  ): Promise<void> {
    if (questions.length === 0) return;
    const resolved = resolveAnswers(questions, answers, mode);
    const params: (string | number | null)[] = [];
    const values = questions.map((q, i) => {
      const given = resolved[i]!;
      const raw = answers[i];
      const typed = typeof raw === "string" && mode === "typed" && typeable(q) ? raw : null;
      params.push(
        quizId,
        userId,
        at,
        i,
        q.skill,
        q.topic,
        given,
        given === q.correct ? 1 : 0,
        q.review ? 1 : 0,
        mistakeOf(q, given),
        typed,
      );
      const n = params.length - 11;
      return `(${Array.from({ length: 11 }, (_, k) => `$${n + k + 1}`).join(", ")})`;
    });
    await this.db.query(
      `INSERT INTO quiz_answers (quiz_id, user_id, at, position, skill, topic, given, correct, review, mistake, typed)
       VALUES ${values.join(", ")}`,
      params,
    );
  }

  /**
   * Tests saved before answers were recorded per kind of question: regenerate
   * them from their seed and fill quiz_answers. Runs at startup; does nothing
   * once every test has its answers.
   */
  async backfillQuizAnswers(): Promise<number> {
    const rows = await this.db.query(
      `SELECT r.id, r.user_id, r.at, r.level, r.topics, r.seed, r.question_count, r.answers, r.focus, r.version, r.mode, r.bank
         FROM quiz_results r
        WHERE NOT EXISTS (SELECT 1 FROM quiz_answers a WHERE a.quiz_id = r.id)`,
    );
    let filled = 0;
    for (const row of rows) {
      try {
        const questions = this.regenerate(row); // exactly as the player saw it
        const answers = JSON.parse(String(row.answers)) as (number | string)[];
        const mode = String(row.mode ?? "choices") === "typed" ? "typed" : "choices";
        await this.addQuizAnswers(Number(row.id), Number(row.user_id), Number(row.at), questions, answers, mode);
        filled += 1;
      } catch (error) {
        log.error(`quiz ${String(row.id)}: answers not rebuilt`, error);
      }
    }
    return filled;
  }

  /**
   * Wrong answers saved before mistakes were recorded: regenerate their test
   * and fill the mistake. Runs at startup; does nothing once all are filled.
   */
  async backfillMistakes(): Promise<number> {
    const rows = await this.db.query(
      `SELECT r.id, r.level, r.topics, r.seed, r.question_count, r.focus, r.version, r.bank
         FROM quiz_results r
        WHERE EXISTS (SELECT 1 FROM quiz_answers a
                       WHERE a.quiz_id = r.id AND a.correct = 0 AND a.given >= 0 AND a.mistake IS NULL)`,
    );
    let filled = 0;
    for (const row of rows) {
      try {
        const questions = this.regenerate(row);
        const wrong = await this.db.query(
          `SELECT position, given FROM quiz_answers
            WHERE quiz_id = $1 AND correct = 0 AND given >= 0 AND mistake IS NULL`,
          [Number(row.id)],
        );
        for (const answer of wrong) {
          const q = questions[Number(answer.position)];
          const mistake = q ? mistakeOf(q, Number(answer.given)) : null;
          if (!mistake) continue;
          await this.db.query(`UPDATE quiz_answers SET mistake = $1 WHERE quiz_id = $2 AND position = $3`, [
            mistake,
            Number(row.id),
            Number(answer.position),
          ]);
        }
        filled += 1;
      } catch (error) {
        log.error(`quiz ${String(row.id)}: mistakes not rebuilt`, error);
      }
    }
    return filled;
  }

  /** A saved test, rebuilt from its seed exactly as the player saw it. */
  private regenerate(row: Row): Question[] {
    const focus = String(row.focus ?? "");
    return generateQuiz({
      seed: Number(row.seed),
      level: String(row.level) as Level,
      topics: String(row.topics).split(",") as Topic[],
      count: Number(row.question_count),
      focus: focus ? focus.split(",") : [],
      version: Number(row.version ?? 1),
      ...(row.bank === null || row.bank === undefined ? {} : { bank: Number(row.bank) }),
    });
  }

  /** Progress of one player: every kind of question met in tests, and the column arithmetic. */
  /**
   * Everything stored about an account and its own players, for the account
   * to download (GDPR): no secrets (password hashes, session tokens).
   */
  async exportAccount(accountId: number): Promise<Record<string, unknown>> {
    const one = async (sql: string, params: number[]) => (await this.db.query(sql, params))[0] ?? null;
    const all = (sql: string, params: number[]) => this.db.query(sql, params);
    const account = await one("SELECT id, email, name, role, created_at, onboarded_at FROM accounts WHERE id = $1", [accountId]);
    const methods = await all(
      "SELECT type, provider, label, player_id, created_at, last_used_at FROM credentials WHERE account_id = $1 ORDER BY id",
      [accountId],
    );
    const players = [];
    for (const p of await all("SELECT id, name, created_at, hidden, onboarded_at FROM users WHERE account_id = $1 ORDER BY id", [accountId])) {
      const id = Number(p.id);
      players.push({
        ...p,
        sharedWith: await all("SELECT a.name, a.email, s.created_at FROM player_shares s JOIN accounts a ON a.id = s.account_id WHERE s.user_id = $1", [id]),
        attempts: await all("SELECT * FROM attempts WHERE user_id = $1 ORDER BY id", [id]),
        tests: await all("SELECT * FROM quiz_results WHERE user_id = $1 ORDER BY id", [id]),
        testAnswers: await all("SELECT * FROM quiz_answers WHERE user_id = $1 ORDER BY id", [id]),
        questionsReported: await all("SELECT at, skill, question, note FROM quiz_flags WHERE user_id = $1 ORDER BY id", [id]),
        vocabularyProgress: await all(
          "SELECT p.*, e.term, e.meaning FROM vocab_progress p JOIN vocab_entries e ON e.id = p.entry_id WHERE p.user_id = $1 ORDER BY p.entry_id",
          [id],
        ),
        vocabularyAnswers: await all("SELECT * FROM vocab_answers WHERE user_id = $1 ORDER BY at", [id]),
        vocabularySkipped: await all("SELECT * FROM vocab_skips WHERE user_id = $1", [id]),
      });
    }
    const sharedWithMe = await all(
      "SELECT u.name, o.name AS owner, s.created_at FROM player_shares s JOIN users u ON u.id = s.user_id JOIN accounts o ON o.id = u.account_id WHERE s.account_id = $1",
      [accountId],
    );
    const feedback = await all("SELECT at, page, version, text FROM feedback WHERE account_id = $1 ORDER BY at", [accountId]);
    return { format: "luma-export", exportedAt: new Date().toISOString(), account, signInMethods: methods, players, sharedWithMe, feedback };
  }

  // ------------------------------------------------------------- feedback

  async addFeedback(f: { accountId: number; playerId: number | null; page: string; version: string; text: string }): Promise<void> {
    await this.db.query("INSERT INTO feedback (account_id, player_id, at, page, version, text) VALUES ($1, $2, $3, $4, $5, $6)", [
      f.accountId,
      f.playerId,
      Date.now(),
      f.page,
      f.version,
      f.text,
    ]);
  }

  async feedback(limit: number): Promise<{ id: number; at: number; account: string | null; player: string | null; page: string; version: string; text: string }[]> {
    const rows = await this.db.query(
      `SELECT f.id, f.at, f.page, f.version, f.text, a.name AS account, u.name AS player
         FROM feedback f LEFT JOIN accounts a ON a.id = f.account_id LEFT JOIN users u ON u.id = f.player_id
        ORDER BY f.at DESC LIMIT ${Math.trunc(limit)}`,
    );
    return rows.map((r) => ({
      id: Number(r.id),
      at: Number(r.at),
      account: r.account === null || r.account === undefined ? null : String(r.account),
      player: r.player === null || r.player === undefined ? null : String(r.player),
      page: String(r.page),
      version: String(r.version),
      text: String(r.text),
    }));
  }

  // ------------------------------------------------------------- settings

  async setting(key: string): Promise<string | null> {
    const rows = await this.db.query("SELECT value FROM app_settings WHERE key = $1", [key]);
    return rows[0] ? String(rows[0].value) : null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await this.db.query("DELETE FROM app_settings WHERE key = $1", [key]);
    await this.db.query("INSERT INTO app_settings (key, value) VALUES ($1, $2)", [key, value]);
  }

  /** A player's tests at these levels, newest first. */
  async pastTests(userId: number, levels: Level[], limit: number): Promise<PastTest[]> {
    const rows = await this.db.query(
      `SELECT id, at, level, topics, seed, question_count, correct, answers, focus, version, mode, bank
         FROM quiz_results WHERE user_id = $1 AND level IN (${levels.map((_, i) => `$${i + 2}`).join(", ")})
        ORDER BY at DESC, id DESC LIMIT ${Math.trunc(limit)}`,
      [userId, ...levels],
    );
    return rows.map((row) => {
      let answers: (number | string)[] = [];
      try {
        const parsed: unknown = JSON.parse(String(row.answers));
        if (Array.isArray(parsed)) answers = parsed.filter((a): a is number | string => typeof a === "number" || typeof a === "string");
      } catch {
        // an unreadable row: shown without answers
      }
      return {
        id: Number(row.id),
        at: Number(row.at),
        level: String(row.level),
        topics: String(row.topics).split(",").filter(Boolean),
        seed: Number(row.seed),
        count: Number(row.question_count),
        correct: Number(row.correct),
        answers,
        focus: String(row.focus ?? "").split(",").filter(Boolean),
        version: Number(row.version ?? 1),
        mode: row.mode === "typed" ? "typed" : "choices",
        bank: row.bank === null || row.bank === undefined ? null : Number(row.bank),
      };
    });
  }

  async profile(user: User, since: number): Promise<Profile> {
    const answers = await this.db.query(
      `SELECT skill, topic, correct, at FROM quiz_answers WHERE user_id = $1 ORDER BY at DESC, id DESC`,
      [user.id],
    );
    const bySkill = new Map<string, SkillProgress>();
    const history = new Map<string, boolean[]>();
    for (const row of answers) {
      const skill = String(row.skill);
      const ok = Number(row.correct) === 1;
      let entry = bySkill.get(skill);
      if (!entry) {
        entry = { skill, topic: String(row.topic), total: 0, correct: 0, recent: [], lastAt: Number(row.at), status: "learning" };
        bySkill.set(skill, entry);
        history.set(skill, []);
      }
      entry.total += 1;
      if (ok) entry.correct += 1;
      history.get(skill)!.push(ok);
    }
    for (const entry of bySkill.values()) {
      const all = history.get(entry.skill)!;
      entry.recent = all.slice(0, RECENT);
      entry.status = skillStatus(all);
    }

    const mistakeRows = await this.db.query(
      `SELECT mistake, skill, at FROM quiz_answers
        WHERE user_id = $1 AND mistake IS NOT NULL
        ORDER BY at DESC, id DESC`,
      [user.id],
    );
    const byMistake = new Map<string, MistakeProgress>();
    for (const row of mistakeRows) {
      const mistake = String(row.mistake);
      let entry = byMistake.get(mistake);
      if (!entry) {
        entry = { mistake, count: 0, lastAt: Number(row.at), skills: [] };
        byMistake.set(mistake, entry);
      }
      entry.count += 1;
      if (!entry.skills.includes(String(row.skill))) entry.skills.push(String(row.skill));
    }
    const mistakes = [...byMistake.values()].sort((a, b) => b.count - a.count || b.lastAt - a.lastAt);

    const operatorRows = await this.db.query(
      `SELECT operator,
              COUNT(*)                                                       AS total,
              SUM(correct)                                                   AS correct,
              SUM(CASE WHEN at >= $2 THEN 1 ELSE 0 END)                       AS today_total,
              SUM(CASE WHEN at >= $2 THEN correct ELSE 0 END)                 AS today_correct
         FROM attempts
        WHERE user_id = $1
        GROUP BY operator`,
      [user.id, since],
    );
    const order = ["+", "−", "×", "÷"];
    const operators: OperatorProgress[] = operatorRows
      .map((row) => ({
        operator: FROM_STORED[String(row.operator)] ?? "+",
        total: Number(row.total),
        correct: Number(row.correct),
        todayTotal: Number(row.today_total),
        todayCorrect: Number(row.today_correct),
      }))
      .sort((a, b) => order.indexOf(a.operator) - order.indexOf(b.operator));

    // Test answers since the start of the player's day, every subject together.
    const today = answers.filter((row) => Number(row.at) >= since);
    const quizToday = { answers: today.length, right: today.filter((row) => Number(row.correct) === 1).length };

    return { user, skills: [...bySkill.values()], mistakes, operators, quizToday };
  }

  /** `since`: start of "today" in the player's time zone, in epoch milliseconds. */
  async stats(since: number, scope: Scope): Promise<UserStats[]> {
    const rows = await this.db.query(
      `SELECT u.id, u.name, u.created_at, u.hidden, u.account_id, o.name AS owner_name,
              COUNT(a.id)                                                  AS total,
              COALESCE(SUM(a.correct), 0)                                  AS correct,
              COALESCE(SUM(CASE WHEN a.at >= $2 THEN 1 ELSE 0 END), 0)         AS today_total,
              COALESCE(SUM(CASE WHEN a.at >= $2 THEN a.correct ELSE 0 END), 0) AS today_correct
         FROM users u
         LEFT JOIN accounts o ON o.id = u.account_id
         LEFT JOIN attempts a ON a.user_id = u.id
        WHERE ${VISIBLE} AND (CAST($3 AS BIGINT) = 0 OR u.id = CAST($3 AS BIGINT))
        GROUP BY u.id, u.name, u.created_at, u.hidden, u.account_id, o.name`,
      [scope.accountId, since, scope.playerId ?? 0],
    );
    // Separate query: joining both tables at once would multiply the rows.
    const quizRows = await this.db.query(
      `SELECT user_id, COUNT(*) AS tests, SUM(correct) AS correct, SUM(question_count) AS questions
         FROM quiz_results
        GROUP BY user_id`,
    );
    const quiz = new Map(quizRows.map((row) => [Number(row.user_id), row]));
    return rows
      .map((row) => {
        const q = quiz.get(Number(row.id));
        return {
          user: toUser(row, scope.accountId),
          total: Number(row.total),
          correct: Number(row.correct),
          todayTotal: Number(row.today_total),
          todayCorrect: Number(row.today_correct),
          quizTests: Number(q?.tests ?? 0),
          quizCorrect: Number(q?.correct ?? 0),
          quizQuestions: Number(q?.questions ?? 0),
        };
      })
      .sort((a, b) => b.correct - a.correct || a.user.name.localeCompare(b.user.name, "fr"));
  }
}
