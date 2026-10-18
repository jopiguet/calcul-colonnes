import type { NewAttempt, NewQuizResult, Profile, User, UserStats } from "../shared/types";

export type { NewAttempt, NewQuizResult, Profile, User, UserStats };

/**
 * Players and scores live in the server's database (SQLite, or PostgreSQL on
 * Neon); the app only talks to the small JSON API in server/app.ts.
 */

export class DuplicateNameError extends Error {}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  if (response.status === 409) throw new DuplicateNameError();
  if (!response.ok) throw new Error(`${init?.method ?? "GET"} ${path}: HTTP ${response.status}`);
  return (response.status === 204 ? undefined : await response.json()) as T;
}

function startOfToday(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export const store = {
  listUsers: (): Promise<User[]> => call("/users"),
  addUser: (name: string): Promise<User> =>
    call("/users", { method: "POST", body: JSON.stringify({ name }) }),
  deleteUser: (id: number): Promise<void> => call(`/users/${id}`, { method: "DELETE" }),
  addAttempt: (attempt: NewAttempt): Promise<{ correct: boolean }> =>
    call("/attempts", { method: "POST", body: JSON.stringify(attempt) }),
  /** The server regenerates the test from its seed and returns its own grading. */
  addQuiz: (result: NewQuizResult): Promise<{ correct: number; total: number }> =>
    call("/quizzes", { method: "POST", body: JSON.stringify(result) }),
  /** "Today" is the player's local day, so its start is sent by the browser. */
  stats: (): Promise<UserStats[]> => call(`/stats?since=${startOfToday()}`),
  /** Progress of one player: kinds of question met in tests, column arithmetic. */
  profile: (userId: number): Promise<Profile> => call(`/users/${userId}/profile?since=${startOfToday()}`),
};
