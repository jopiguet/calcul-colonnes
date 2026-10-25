/** Types shared by the browser app and the API server. */

export type Operator = "+" | "−" | "×" | "÷";

export interface User {
  id: number;
  name: string;
  createdAt: number; // epoch milliseconds
  /** Activities hidden from the player's home page ("columns", "vocab-collins-spanish"…). */
  hidden?: string[];
  /** Set when another account owns the player and shares it with this one: that account's name. */
  sharedBy?: string;
}

/** An account a player is shared with (seen by the player's own account). */
export interface PlayerShare {
  accountId: number;
  name: string;
  email: string | null;
  since: number;
}

/**
 * What the app sends for each answered operation; the server decides if it is correct.
 * For a division, `top` is the dividend, `bottom` the divisor, `given` the quotient
 * and `givenRemainder` the remainder. It is null for the other operations.
 */
export interface NewAttempt {
  userId: number;
  maximum: number;
  operator: Operator;
  top: number;
  bottom: number;
  given: number;
  givenRemainder: number | null;
}

export interface UserStats {
  user: User;
  total: number;
  correct: number;
  todayTotal: number;
  todayCorrect: number;
  /** Multiple-choice tests: number of tests, right answers, questions. */
  quizTests: number;
  quizCorrect: number;
  quizQuestions: number;
}

/** A finished multiple-choice test. The server regenerates it from the seed and grades it. */
export interface NewQuizResult {
  userId: number;
  seed: number;
  level: string;
  topics: string[];
  count: number;
  /**
   * For each question: the option index chosen (−1 when left blank), or in a
   * typed test the text typed for a question whose answer is a number.
   */
  answers: (number | string)[];
  /** "typed" when numbers were typed where possible; "choices" when omitted. */
  mode?: "choices" | "typed";
  /** Kinds of question brought back for review (see generateQuiz). */
  focus?: string[];
  /** Physical chemistry: the question bank revision the test drew from. */
  bank?: number | null;
  /** Generator version used by the browser; must be the server's. */
  version?: number;
}

export interface SkillProgress {
  /** Kind of question, e.g. "derivatives.product". */
  skill: string;
  topic: string;
  total: number;
  correct: number;
  /** Latest answers, newest first (at most five). */
  recent: boolean[];
  lastAt: number;
  status: "review" | "learning" | "mastered";
}

export interface MistakeProgress {
  /** Mistake type, e.g. "chainRuleForgotten" (MISTAKES in shared/quiz/types.ts). */
  mistake: string;
  count: number;
  lastAt: number;
  /** Kinds of question where it was made, most recent first. */
  skills: string[];
}

export interface OperatorProgress {
  operator: Operator;
  total: number;
  correct: number;
  todayTotal: number;
  todayCorrect: number;
}

/**
 * A test taken, as stored: everything needed to rebuild it exactly (the
 * seed, the kinds brought back, the generator version and the bank revision)
 * and the answers as given (an option index, −1 blank, or the text typed).
 */
export interface PastTest {
  id: number;
  at: number;
  level: string;
  topics: string[];
  seed: number;
  count: number;
  correct: number;
  answers: (number | string)[];
  focus: string[];
  version: number;
  mode: "choices" | "typed";
  bank: number | null;
}

export interface Profile {
  user: User;
  skills: SkillProgress[];
  /** Mistakes made in tests, most frequent first. */
  mistakes: MistakeProgress[];
  operators: OperatorProgress[];
  /** Test answers since the `since` given (the start of the player's day). */
  quizToday: { answers: number; right: number };
}

// ------------------------------------------------------------- authentication

/** Who is signed in. A player session (own login of a child) is limited to that player. */
export interface AuthState {
  authenticated: boolean;
  /** `owner`: the account that runs the server (invitations, content, feedback). */
  account?: { id: number; name: string; email: string | null; owner?: boolean };
  player?: { id: number; name: string } | null;
  /** The guided tour was seen by this account (or, on a player's own login, this player). */
  onboarded?: boolean;
}

/** How one can sign in on this server. */
export interface AuthOptions {
  providers: { id: string; name: string }[];
  /** New accounts may be created (always true while there is no account yet). */
  registration: boolean;
  /** New accounts need an invitation from the owner. */
  invite?: boolean;
  /** For the privacy page: where the server and database run, and whom to ask (PRIVACY_HOSTING, PRIVACY_CONTACT). */
  hosting?: string;
  contact?: string;
  /** PUBLIC_URL: the address the app expects to be opened at. */
  publicUrl: string;
}

/** A way to sign in, attached to the account or to one of its players. */
export interface SignInMethod {
  id: number;
  type: "password" | "oauth" | "passkey" | "email_link";
  /** Provider id for "oauth" ("google", "github"…); empty otherwise. */
  provider: string;
  /** Email or username for a password, name or email at the provider. */
  label: string | null;
  /** Set for a player's own login. */
  playerId: number | null;
  createdAt: number;
  lastUsedAt: number | null;
}

// ---------------------------------------------------------------- vocabulary

/** One card of a vocabulary session (see shared/vocab/session.ts). */
export interface VocabCard {
  entryId: number;
  /** recognise: Spanish shown, meaning asked; recall: meaning shown, Spanish asked; read: a kanji shown, a reading asked. */
  direction: "recognise" | "recall" | "read";
  mode: "choice" | "written";
  /** Leitner box before this answer; 0 for a card never asked. */
  box: number;
  prompt: string;
  /** Languages of the prompt and of the answer ("es", "en"). */
  promptLang: string;
  answerLang: string;
  /** Heading inside the section ("Interior"), as a hint. */
  group?: string;
  /** Feminine noun taking "el" ("el agua"), shown with the prompt. */
  feminine?: boolean;
  /** Multiple choice only: four options, one right. */
  options?: string[];
  /** How the prompt reads (Japanese: its rōmaji), shown under it. */
  promptReading?: string;
  /** Multiple choice: how each option reads, in the order of `options` ("" when none). */
  optionReadings?: string[];
  /** Characters book: a kana ("kana") or a kanji ("kanji") card. */
  script?: "kana" | "kanji";
  /** Characters book: met in a word the player has started in another Japanese book. */
  met?: boolean;
  /** A session across a shelf's books: the title of the word's book. */
  source?: string;
}

export interface VocabSectionInfo {
  id: number;
  /** Title in the language studied; subtitle in the other, when the book has one. */
  title: string;
  subtitle: string;
  entries: number;
}

export interface VocabLessonInfo {
  id: number;
  title: string;
  subtitle: string;
  sections: VocabSectionInfo[];
}

/** A vocabulary book and its lessons. */
export interface VocabBookInfo {
  id: number;
  slug: string;
  title: string;
  kind: "translation" | "definition" | "characters";
  /** Language studied, and language of the meanings ("es", "en"). */
  term: string;
  meaning: string;
  /** "alphabetical": a word list; new words come at random by default. */
  order: "book" | "alphabetical";
  /** Where the content comes from (a licence's attribution), "" when nothing to say. */
  credit: string;
  /** "private": seen by the owner's account only (a book you own); "shared": by every account. */
  visibility: "private" | "shared";
  entries: number;
  lessons: VocabLessonInfo[];
}

/** Counts of entries by status, for one section. */
export interface VocabSectionProgress {
  new: number;
  learning: number;
  known: number;
  mastered: number;
  /** Words the player skipped: counted apart from the others. */
  skipped: number;
  /** Cards whose review is due now. */
  due: number;
}

/** A word of a lesson, as its word list shows it. */
export interface VocabWord {
  id: number;
  term: string;
  /** How it reads (rōmaji, transliteration), "" if nothing to say. */
  reading: string;
  /** In the interface's language when the book has it. */
  meaning: string;
  note: string;
  status: "new" | "learning" | "known" | "mastered";
  skipped: boolean;
}

/** A lesson's words, section by section. */
export interface VocabLessonWords {
  lesson: { id: number; title: string; subtitle: string };
  sections: { id: number; title: string; subtitle: string; words: VocabWord[] }[];
}

export interface VocabProgress {
  sections: Record<number, VocabSectionProgress>;
  /** Per book: cards due, entries started; for a Characters book, characters met in the player's words and not started. */
  books: Record<number, { due: number; started: number; met?: number }>;
  due: number;
  /** Answers since the `since` given. */
  today: { answers: number; right: number };
}

export interface VocabAnswer {
  userId: number;
  entryId: number;
  direction: "recognise" | "recall" | "read";
  mode: "choice" | "written";
  given: string;
  /** Interface language: a meaning given in it is graded against it ("fr", "es", "en"). */
  lang?: string;
}

/** A word or a character shown with an answer, to link the books together. */
export interface VocabRelated {
  term: string;
  /** How it reads (rōmaji of a word), "" if none. */
  reading: string;
  meaning: string;
  /** A character: already started in the Characters book. */
  started?: boolean;
}

export interface VocabAnswerResult {
  verdict: "right" | "accent" | "typo" | "article" | "wrong";
  correct: boolean;
  /** The answer as printed in the book. */
  expected: string;
  feminine: boolean;
  /** How the term reads (Japanese: its rōmaji), "" when the book gives none. */
  reading: string;
  /** Example or remark from the book, if any. */
  note: string;
  box: number;
  dueAt: number;
  /** Characters book, kanji: the meaning (in the interface's language) and the readings. */
  meaning?: string;
  readings?: string;
  /** Characters book: words the player has started that use this character. */
  inWords?: VocabRelated[];
  /** Japanese word: its kanji, as the Characters book gives them. */
  characters?: VocabRelated[];
}

/** A share of answers: how many, how many right. */
export interface VocabTally {
  answers: number;
  right: number;
}

/** A player's statistics on one book (GET /api/vocab/stats). Days are the player's local days. */
export interface VocabStats {
  /** Entries of the book, by status (both directions considered, see entryStatus). */
  words: { total: number; new: number; learning: number; known: number; mastered: number };
  /** Cards per Leitner box, per direction: index 1–6; index 0 is unused. */
  boxes: { recognise: number[]; recall: number[]; read: number[] };
  /** Every answer on this book. */
  all: VocabTally;
  /** The last 30 days, oldest first: answers, right ones, and entries seen for the first time. */
  days: { day: string; answers: number; right: number; newWords: number }[];
  /** Days in a row with at least one answer, up to today (or yesterday, if nothing yet today); and the longest. */
  streak: { current: number; best: number };
  /** Cards due: index 0 is today, overdue included; then the next 13 days. */
  forecast: number[];
  /** Over every answer: by question kind and direction; written answers by verdict. */
  byMode: { choice: VocabTally; written: VocabTally };
  byDirection: { recognise: VocabTally; recall: VocabTally; read: VocabTally };
  verdicts: { right: number; accent: number; typo: number; article: number; wrong: number };
  lessons: { id: number; title: string; total: number; new: number; learning: number; known: number; mastered: number }[];
  /** The entries most often answered wrong, at most 12. */
  hardest: { entryId: number; term: string; meaning: string; reading: string; wrong: number; answers: number; box: number }[];
}
