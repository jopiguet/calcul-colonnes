/**
 * Home page of a player: every activity, grouped by subject, each with what is
 * waiting (concepts to review, words due). Opened after choosing a player and
 * from the ← link of every activity.
 */
import { button, el } from "./dom";
import { currentLang, type Lang } from "./i18n";
import { qt } from "./quiz-i18n";
import { store, vocab, type User, type VocabBookInfo, type VocabProgress } from "./store";
import { bookTitle } from "./vocab";
import { dt } from "./discover/i18n";

const texts = {
  fr: {
    greeting: "Que fait-on, {name} ?",
    maths: "Mathématiques",
    languages: "Langues",
    columnsText: "Les quatre opérations posées, des unités vers la gauche.",
    quizText: "Dérivées, intégrales, trigonométrie, limites, exponentielles.",
    toReview: "{count} notions à revoir",
    oneToReview: "1 notion à revoir",
    wordsDue: "{count} mots à réviser",
    oneWordDue: "1 mot à réviser",
    upToDate: "À jour",
    notStarted: "{count} mots",
    noBooks: "Aucun livre de vocabulaire importé : voir docs/vocabulary.md.",
    home: "Accueil",
  },
  es: {
    greeting: "¿Qué hacemos, {name}?",
    maths: "Matemáticas",
    languages: "Idiomas",
    columnsText: "Las cuatro operaciones en columnas, de las unidades hacia la izquierda.",
    quizText: "Derivadas, integrales, trigonometría, límites, exponenciales.",
    toReview: "{count} nociones por repasar",
    oneToReview: "1 noción por repasar",
    wordsDue: "{count} palabras por repasar",
    oneWordDue: "1 palabra por repasar",
    upToDate: "Al día",
    notStarted: "{count} palabras",
    noBooks: "No hay libros de vocabulario importados: ver docs/vocabulary.md.",
    home: "Inicio",
  },
  en: {
    greeting: "What shall we do, {name}?",
    maths: "Mathematics",
    languages: "Languages",
    columnsText: "The four operations in columns, from the units leftwards.",
    quizText: "Derivatives, integrals, trigonometry, limits, exponentials.",
    toReview: "{count} concepts to review",
    oneToReview: "1 concept to review",
    wordsDue: "{count} words to review",
    oneWordDue: "1 word to review",
    upToDate: "Up to date",
    notStarted: "{count} words",
    noBooks: "No vocabulary book imported: see docs/vocabulary.md.",
    home: "Home",
  },
} satisfies Record<Lang, Record<string, string>>;

type HomeKey = keyof (typeof texts)["fr"];
export const ht = (key: HomeKey, values: Record<string, string | number> = {}): string =>
  texts[currentLang()][key].replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? ""));

export type Activity = { mode: "columns" | "quiz" | "discover" } | { mode: "vocab"; book: number };

export interface HomeContext {
  user: User;
  open(activity: Activity): void;
}

let booksCache: { books: VocabBookInfo[]; at: number } | null = null;
/** The books change only on an import: kept a few minutes, then asked again. */
const BOOKS_FOR = 5 * 60_000;

/** Books on the server; looked up again when none yet, after a while, or on request. */
export async function vocabBooks(): Promise<VocabBookInfo[]> {
  if (!booksCache || booksCache.books.length === 0 || Date.now() - booksCache.at > BOOKS_FOR) {
    booksCache = { books: await vocab.books(), at: Date.now() };
  }
  return booksCache.books;
}

/** The next vocabBooks() asks the server (a book may have been imported). */
export function forgetBooks(): void {
  booksCache = null;
}

/** One activity: what it is, and what is waiting there. */
function card(
  activity: string,
  title: string,
  text: string,
  status: { text: string; waiting: boolean } | null,
  onOpen: () => void,
): HTMLElement {
  const b = button("activity", "", onOpen);
  b.dataset.activity = activity;
  b.append(el("span", "activity-title", title), el("span", "activity-text", text));
  if (status) b.append(el("span", `activity-status${status.waiting ? " waiting" : ""}`, status.text));
  return b;
}

export async function homeView(ctx: HomeContext): Promise<HTMLElement> {
  const wrap = el("section", "home");
  wrap.append(el("h1", "title home-title", ht("greeting", { name: ctx.user.name })));

  // What is waiting, fetched together; a failure leaves the cards without status.
  const [profile, books, progress] = await Promise.all([
    store.profile(ctx.user.id).catch(() => null),
    vocabBooks().catch(() => [] as VocabBookInfo[]),
    vocab.progress(ctx.user.id).catch(() => null as VocabProgress | null),
  ]);

  const maths = el("div", "activity-group");
  maths.append(el("h2", "activity-group-title", ht("maths")));
  const review = profile ? profile.skills.filter((s) => s.status === "review").length : 0;
  const grid = el("div", "activity-grid");
  grid.append(
    card("columns", qt("modeColumns"), ht("columnsText"), null, () => ctx.open({ mode: "columns" })),
    card(
      "quiz",
      qt("modeQuiz"),
      ht("quizText"),
      review > 0 ? { text: review === 1 ? ht("oneToReview") : ht("toReview", { count: review }), waiting: true } : null,
      () => ctx.open({ mode: "quiz" }),
    ),
  );
  maths.append(grid);

  const languages = el("div", "activity-group");
  languages.append(el("h2", "activity-group-title", ht("languages")));
  const shelf = el("div", "activity-grid");
  for (const book of books) {
    const mine = progress?.books[book.id];
    const status =
      mine && mine.due > 0
        ? { text: mine.due === 1 ? ht("oneWordDue") : ht("wordsDue", { count: mine.due }), waiting: true }
        : mine && mine.started > 0
          ? { text: ht("upToDate"), waiting: false }
          : { text: ht("notStarted", { count: book.entries }), waiting: false };
    shelf.append(
      card(`vocab-${book.slug}`, `💬 ${bookTitle(book)}`, book.title, status, () =>
        ctx.open({ mode: "vocab", book: book.id }),
      ),
    );
  }
  if (books.length === 0) shelf.append(el("p", "empty small", ht("noBooks")));
  languages.append(shelf);

  // Discover: experiments rather than exercises (docs/discover.md).
  const discover = el("div", "activity-group");
  discover.append(el("h2", "activity-group-title", dt("group")));
  const lab = el("div", "activity-grid");
  lab.append(card("discover-dice", dt("diceTitle"), dt("diceText"), null, () => ctx.open({ mode: "discover" })));
  discover.append(lab);

  wrap.append(maths, languages, discover);
  return wrap;
}

/** The link back to the home page, with the activity's name. */
export function activityBar(title: string, onHome: () => void): HTMLElement {
  const bar = el("nav", "activity-bar");
  const back = button("ghost small home-link", `← ${ht("home")}`, onHome);
  bar.append(back);
  if (title) bar.append(el("span", "activity-bar-title", title));
  return bar;
}
