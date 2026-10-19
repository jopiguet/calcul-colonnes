import type {
  AuthOptions,
  AuthState,
  NewAttempt,
  NewQuizResult,
  Profile,
  SignInMethod,
  User,
  UserStats,
  VocabAnswer,
  VocabAnswerResult,
  VocabBookInfo,
  VocabCard,
  VocabLessonInfo,
  VocabProgress,
} from "../shared/types";

export type { AuthOptions, AuthState, NewAttempt, NewQuizResult, Profile, SignInMethod, User, UserStats };
export type { VocabAnswer, VocabAnswerResult, VocabBookInfo, VocabCard, VocabLessonInfo, VocabProgress };

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
  register: (name: string, email: string, password: string): Promise<AuthState> =>
    post("/auth/register", { name, email, password }),
  login: (identifier: string, password: string): Promise<void> => post("/auth/login", { identifier, password }),
  logout: (): Promise<void> => post("/auth/logout"),
  logoutOthers: (): Promise<void> => post("/auth/logout-all"),
  methods: (): Promise<SignInMethod[]> => call("/auth/methods"),
  removeMethod: (id: number): Promise<void> => call(`/auth/methods/${id}`, { method: "DELETE" }),
  setPassword: (password: string, current?: string, email?: string): Promise<void> =>
    post("/auth/password", { password, current, email }),
  setPlayerPassword: (playerId: number, username: string, password: string): Promise<SignInMethod> =>
    post(`/auth/players/${playerId}/password`, { username, password }),
  /** Full-page navigation to the provider (OAuth). */
  providerUrl: (provider: string, intent: "login" | "link" | "link-player", player?: number): string =>
    `/api/auth/oauth/${encodeURIComponent(provider)}/start?intent=${intent}${player ? `&player=${player}` : ""}`,
};

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
    /** For "all", id is the book's. */
    target: { kind: "section" | "lesson" | "all"; id: number; purpose: "learn" | "review" | "due" },
    size: number,
    mode: "mixed" | "choice" | "written",
  ): Promise<VocabCard[]> =>
    call(
      `/vocab/session?userId=${userId}&kind=${target.kind}&id=${target.id}&purpose=${target.purpose}&size=${size}&mode=${mode}`,
    ),
  /** The server grades the answer and moves the card between boxes. */
  answer: (answer: VocabAnswer): Promise<VocabAnswerResult> => post("/vocab/answers", answer),
};
