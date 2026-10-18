import {
  QUIZ_VERSION,
  RECENT,
  generateQuiz,
  gradeQuiz,
  skillStatus,
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
  Profile,
  SkillProgress,
  User,
  UserStats,
} from "../shared/types.ts";
import type { Database, Row } from "./db/index.ts";

// PostgreSQL returns BIGINT and aggregates as strings, SQLite as numbers: always go through Number().
const toUser = (row: Row): User => ({
  id: Number(row.id),
  name: String(row.name),
  createdAt: Number(row.created_at),
});

export const nameKey = (name: string): string => name.toLocaleLowerCase("fr");

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

  async listUsers(): Promise<User[]> {
    const rows = await this.db.query("SELECT id, name, created_at FROM users");
    return rows.map(toUser).sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }

  async getUser(id: number): Promise<User | null> {
    const rows = await this.db.query("SELECT id, name, created_at FROM users WHERE id = $1", [id]);
    return rows[0] ? toUser(rows[0]) : null;
  }

  /** Null when a player with the same name (ignoring case) already exists. */
  async addUser(name: string): Promise<User | null> {
    const rows = await this.db.query(
      `INSERT INTO users (name, name_key, created_at) VALUES ($1, $2, $3)
       ON CONFLICT (name_key) DO NOTHING
       RETURNING id, name, created_at`,
      [name, nameKey(name), Date.now()],
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
  async addQuiz(result: NewQuizResult & { level: Level; topics: Topic[] }): Promise<{ correct: number; total: number }> {
    const focus = result.focus ?? [];
    const questions = generateQuiz({
      seed: result.seed,
      level: result.level,
      topics: result.topics,
      count: result.count,
      focus,
      version: QUIZ_VERSION,
    });
    const correct = gradeQuiz(questions, result.answers);
    const at = Date.now();
    const rows = await this.db.query(
      `INSERT INTO quiz_results (user_id, at, level, topics, seed, question_count, correct, answers, focus, version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
      ],
    );
    await this.addQuizAnswers(Number(rows[0]!.id), result.userId, at, questions, result.answers);
    return { correct, total: result.count };
  }

  private async addQuizAnswers(
    quizId: number,
    userId: number,
    at: number,
    questions: Question[],
    answers: number[],
  ): Promise<void> {
    if (questions.length === 0) return;
    const params: (string | number | null)[] = [];
    const values = questions.map((q, i) => {
      const given = answers[i] ?? -1;
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
      );
      const n = params.length - 10;
      return `(${Array.from({ length: 10 }, (_, k) => `$${n + k + 1}`).join(", ")})`;
    });
    await this.db.query(
      `INSERT INTO quiz_answers (quiz_id, user_id, at, position, skill, topic, given, correct, review, mistake)
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
      `SELECT r.id, r.user_id, r.at, r.level, r.topics, r.seed, r.question_count, r.answers, r.focus, r.version
         FROM quiz_results r
        WHERE NOT EXISTS (SELECT 1 FROM quiz_answers a WHERE a.quiz_id = r.id)`,
    );
    let filled = 0;
    for (const row of rows) {
      try {
        const questions = this.regenerate(row); // exactly as the player saw it
        const answers = JSON.parse(String(row.answers)) as number[];
        await this.addQuizAnswers(Number(row.id), Number(row.user_id), Number(row.at), questions, answers);
        filled += 1;
      } catch (error) {
        console.error(`quiz ${String(row.id)}: answers not rebuilt (${(error as Error).message})`);
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
      `SELECT r.id, r.level, r.topics, r.seed, r.question_count, r.focus, r.version
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
        console.error(`quiz ${String(row.id)}: mistakes not rebuilt (${(error as Error).message})`);
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
    });
  }

  /** Progress of one player: every kind of question met in tests, and the column arithmetic. */
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

    return { user, skills: [...bySkill.values()], mistakes, operators };
  }

  /** `since`: start of "today" in the player's time zone, in epoch milliseconds. */
  async stats(since: number): Promise<UserStats[]> {
    const rows = await this.db.query(
      `SELECT u.id, u.name, u.created_at,
              COUNT(a.id)                                                  AS total,
              COALESCE(SUM(a.correct), 0)                                  AS correct,
              COALESCE(SUM(CASE WHEN a.at >= $1 THEN 1 ELSE 0 END), 0)         AS today_total,
              COALESCE(SUM(CASE WHEN a.at >= $1 THEN a.correct ELSE 0 END), 0) AS today_correct
         FROM users u
         LEFT JOIN attempts a ON a.user_id = u.id
        GROUP BY u.id, u.name, u.created_at`,
      [since],
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
          user: toUser(row),
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
