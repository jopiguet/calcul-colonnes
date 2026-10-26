import type {
  AuthOptions,
  AuthState,
  NewAttempt,
  NewQuizResult,
  PastTest,
  Profile,
  SignInMethod,
  User,
  PlayerShare,
  UserStats,
  VocabAnswer,
  VocabAnswerResult,
  VocabBookInfo,
  VocabCard,
  VocabLessonInfo,
  VocabLessonWords,
  VocabProgress,
  VocabStats,
} from "../shared/types";
import type { Bank, Subject } from "../shared/quiz";

import type { ExerciseBookInfo, ExerciseBookView, ExerciseUnitView } from "../shared/exercises/api";
export type { AuthOptions, AuthState, NewAttempt, NewQuizResult, PastTest, PlayerShare, Profile, SignInMethod, User, UserStats };
export type { VocabAnswer, VocabAnswerResult, VocabBookInfo, VocabCard, VocabLessonInfo, VocabLessonWords, VocabProgress, VocabStats };

/**
 * Players and scores live in the server's database (SQLite, or PostgreSQL on
 * Neon); the app only talks to the small JSON API in server/app.ts.
 */

export class DuplicateNameError extends Error {}

/** An error answered by the API, with its code ("invalid_credentials", "email_in_use"…). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

/** The session ended (expired, signed out elsewhere): the app goes back to the sign-in screen. */
export class SignedOutError extends Error {}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: "same-origin",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  if (response.ok) return (response.status === 204 ? undefined : await response.json()) as T;
  const code = String(((await response.json().catch(() => ({}))) as { error?: unknown }).error ?? response.status);
  if (response.status === 401 && code === "not_signed_in") throw new SignedOutError();
  if (response.status === 409 && path === "/users") throw new DuplicateNameError();
  throw new ApiError(response.status, code);
}

const post = <T>(path: string, body: unknown = {}): Promise<T> =>
  call<T>(path, { method: "POST", body: JSON.stringify(body) });

function startOfToday(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export const auth = {
  session: (): Promise<AuthState> => call("/auth/session"),
  options: (): Promise<AuthOptions> => call("/auth/options"),
  register: (name: string, email: string, password: string, invite?: string): Promise<AuthState> =>
    post("/auth/register", { name, email, password, ...(invite ? { invite } : {}) }),
  /** Whether an invitation can still be used. */
  inviteUsable: (code: string): Promise<{ usable: boolean }> => call(`/auth/invites/${encodeURIComponent(code)}`),
  /** Deletes the account and everything it owns. */
  deleteAccount: (): Promise<void> => call("/auth/account", { method: "DELETE", body: JSON.stringify({ confirm: "delete-account" }) }),
  login: (identifier: string, password: string): Promise<void> => post("/auth/login", { identifier, password }),
  logout: (): Promise<void> => post("/auth/logout"),
  /** The guided tour finished or skipped: it no longer opens by itself. */
  onboarded: (): Promise<void> => post("/auth/onboarded"),
  logoutOthers: (): Promise<void> => post("/auth/logout-all"),
  methods: (): Promise<SignInMethod[]> => call("/auth/methods"),
  removeMethod: (id: number): Promise<void> => call(`/auth/methods/${id}`, { method: "DELETE" }),
  setPassword: (password: string, current?: string, email?: string): Promise<void> =>
    post("/auth/password", { password, current, email }),
  setPlayerPassword: (playerId: number, username: string, password: string): Promise<SignInMethod> =>
    post(`/auth/players/${playerId}/password`, { username, password }),
  /** Full-page navigation to the provider (OAuth). */
  providerUrl: (provider: string, intent: "login" | "link" | "link-player", player?: number, invite?: string): string =>
    `/api/auth/oauth/${encodeURIComponent(provider)}/start?intent=${intent}${player ? `&player=${player}` : ""}${invite ? `&invite=${encodeURIComponent(invite)}` : ""}`,
};

/** What the owner's page shows (server/admin.ts). */
export interface AdminState {
  registration: "open" | "invite" | "closed";
  invites: { id: string; note: string; createdAt: number; expiresAt: number; usedAt: number | null; usedBy: string | null }[];
  books: { id: number; title: string; kind: string; term: string; visibility: "private" | "shared" }[];
  bank: "private" | "shared";
  exerciseBooks: { id: string; title: string; visibility: "private" | "shared" }[];
  feedback: { id: number; at: number; account: string | null; player: string | null; page: string; version: string; text: string }[];
}

export const admin = {
  state: (): Promise<AdminState> => call("/admin"),
  invite: (note: string): Promise<{ code: string; link: string; invite: AdminState["invites"][number] }> => post("/admin/invites", { note }),
  removeInvite: (id: string): Promise<void> => call(`/admin/invites/${id}`, { method: "DELETE" }),
  bookVisibility: (id: number, visibility: "private" | "shared"): Promise<void> =>
    call(`/admin/books/${id}`, { method: "PUT", body: JSON.stringify({ visibility }) }),
  bankVisibility: (visibility: "private" | "shared"): Promise<void> => call("/admin/bank", { method: "PUT", body: JSON.stringify({ visibility }) }),
  exerciseBookVisibility: (id: string, visibility: "private" | "shared"): Promise<void> =>
    call(`/admin/exercise-books/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify({ visibility }) }),
};

/** "Send feedback": a few lines for the owner. */
export const sendFeedback = (text: string, page: string): Promise<void> => post("/feedback", { text, page });

/** Everything stored about the account, as a JSON file to save. */
export async function exportData(): Promise<Blob> {
  const response = await fetch("/api/export", { credentials: "same-origin" });
  if (!response.ok) throw new ApiError(response.status, "export_failed");
  return response.blob();
}

export const store = {
  listUsers: (): Promise<User[]> => call("/users"),
  addUser: (name: string): Promise<User> =>
    call("/users", { method: "POST", body: JSON.stringify({ name }) }),
  /** Deletes the account's own player; a shared one only leaves this account's list. */
  deleteUser: (id: number): Promise<void> => call(`/users/${id}`, { method: "DELETE" }),
  setHidden: (id: number, hidden: string[]): Promise<void> =>
    call(`/users/${id}/hidden`, { method: "PUT", body: JSON.stringify({ hidden }) }),
  /** A single-use code another account types to see this player too. */
  createInvite: (id: number): Promise<{ code: string; expiresAt: number }> => post(`/users/${id}/invites`),
  shares: (id: number): Promise<PlayerShare[]> => call(`/users/${id}/shares`),
  removeShare: (id: number, accountId: number): Promise<void> => call(`/users/${id}/shares/${accountId}`, { method: "DELETE" }),
  joinShare: (code: string): Promise<User> => post("/shares", { code }),
  addAttempt: (attempt: NewAttempt): Promise<{ correct: boolean }> =>
    call("/attempts", { method: "POST", body: JSON.stringify(attempt) }),
  /** The server regenerates the test from its seed and returns its own grading. */
  addQuiz: (result: NewQuizResult): Promise<{ correct: number; total: number }> =>
    call("/quizzes", { method: "POST", body: JSON.stringify(result) }),
  /** "Today" is the player's local day, so its start is sent by the browser. */
  stats: (): Promise<UserStats[]> => call(`/stats?since=${startOfToday()}`),
  /** Progress of one player: kinds of question met in tests, column arithmetic. */
  profile: (userId: number): Promise<Profile> => call(`/users/${userId}/profile?since=${startOfToday()}`),
  /** A player's last tests in one subject, newest first, to rebuild and read again. */
  pastTests: (userId: number, subject: Subject): Promise<PastTest[]> => call(`/users/${userId}/tests?subject=${subject}`),
};

export const quizBank = {
  /** The question bank: the browser generates the tests too, from the same questions. */
  load: (): Promise<Bank> => call("/quiz/bank"),
  /** A question flagged from the corrections, for the author to check. */
  flag: (flag: { userId: number; skill: string; question: string; note: string }): Promise<void> => post("/quiz/flags", flag),
};

export const vocab = {
  /** Books imported on the server, with their lessons and sections. */
  books: (): Promise<VocabBookInfo[]> => call("/vocab/books"),
  progress: (userId: number): Promise<VocabProgress> => call(`/vocab/progress?userId=${userId}&since=${startOfToday()}`),
  /**
   * learn: due words, then new ones; review: words already started, weakest
   * first, due or not; due: only the words whose review is due.
   */
  session: (
    userId: number,
    /** For "all", id is the book's; "books": several books of a shelf. */
    target:
      | { kind: "section" | "lesson" | "all"; id: number; purpose: "learn" | "review" | "due" }
      | { kind: "books"; ids: number[]; purpose: "learn" | "review" | "due" },
    size: number,
    mode: "mixed" | "choice" | "written",
    order: "book" | "random" = "book",
    /** Interface language: meanings in it, when the book has them. */
    lang?: string,
  ): Promise<VocabCard[]> =>
    call(
      `/vocab/session?userId=${userId}&kind=${target.kind}&` +
        (target.kind === "books" ? `books=${target.ids.join(",")}` : `id=${target.id}`) +
        `&purpose=${target.purpose}&size=${size}&mode=${mode}&order=${order}` +
        (lang ? `&lang=${lang}` : ""),
    ),
  /** A lesson's words, with how far each is learnt and whether it is skipped. */
  lessonWords: (userId: number, lessonId: number, lang?: string): Promise<VocabLessonWords> =>
    call(`/vocab/lessons/${lessonId}/words?userId=${userId}${lang ? `&lang=${lang}` : ""}`),
  /** Skips a word, or puts it back. */
  setSkipped: (userId: number, entryId: number, skipped: boolean): Promise<void> =>
    call("/vocab/skips", { method: "PUT", body: JSON.stringify({ userId, entryId, skipped }) }),
  /** Skips several words at once (a section's), or puts them back. */
  setSkippedMany: (userId: number, entryIds: number[], skipped: boolean): Promise<void> =>
    call("/vocab/skips", { method: "PUT", body: JSON.stringify({ userId, entryIds, skipped }) }),
  /** A player's statistics on one book; days are counted in the browser's time zone. */
  stats: (userId: number, bookId: number): Promise<VocabStats> =>
    call(`/vocab/stats?userId=${userId}&book=${bookId}&tz=${-new Date().getTimezoneOffset()}`),
  /** The server grades the answer and moves the card between boxes. */
  answer: (answer: VocabAnswer): Promise<VocabAnswerResult> => post("/vocab/answers", answer),
};

/** Workbook exercises (server/exercises.ts). */
export const workbook = {
  books: (userId: number): Promise<ExerciseBookInfo[]> => call(`/exercises/books?userId=${userId}`),
  book: (userId: number, book: string): Promise<ExerciseBookView> => call(`/exercises/books/${encodeURIComponent(book)}?userId=${userId}`),
  unit: (userId: number, book: string, unit: number): Promise<ExerciseUnitView> =>
    call(`/exercises/books/${encodeURIComponent(book)}/units/${unit}?userId=${userId}`),
  /** What was typed in one exercise, kept as a draft. */
  save: (userId: number, book: string, exercise: string, answers: Record<string, string[]>): Promise<void> =>
    call("/exercises/answers", { method: "PUT", body: JSON.stringify({ userId, book, exercise, answers }) }),
  /** Corrects the unit: the server marks every exercise against the key. */
  check: (userId: number, book: string, unit: number, answers: Record<string, Record<string, string[]>>): Promise<ExerciseUnitView> =>
    post("/exercises/check", { userId, book, unit, answers }),
  /** The player marks an item himself; null gives it back to the key. */
  override: (userId: number, book: string, exercise: string, item: string, right: boolean | null): Promise<void> =>
    call("/exercises/override", { method: "PUT", body: JSON.stringify({ userId, book, exercise, item, right }) }),
  reset: (userId: number, book: string, unit: number): Promise<void> =>
    call(`/exercises/answers?userId=${userId}&book=${encodeURIComponent(book)}&unit=${unit}`, { method: "DELETE" }),
};
