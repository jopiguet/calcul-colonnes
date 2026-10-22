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
import { pt } from "./discover/physics-i18n";
import { prt } from "./progress-i18n";
import type { DiscoverActivity } from "./discover/activities";
import { CHEMISTRY_TOPICS, LINUX_TOPICS, type Subject } from "../shared/quiz";

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
    cardsDue: "{count} cartes à réviser",
    oneCardDue: "1 carte à réviser",
    charsNotStarted: "{count} caractères",
    noBooks: "Aucun livre de vocabulaire importé : voir docs/vocabulary.md.",
    sciences: "Sciences",
    computing: "Informatique",
    linuxText: "La ligne de commande, des bases aux outils à installer",
    nothingShown: "Aucune activité n'est ouverte pour ce joueur. Elles se choisissent sur la page Compte.",
    chemistryText: "Chimie physique : calculs et notions, Focus par Focus",
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
    cardsDue: "{count} tarjetas por repasar",
    oneCardDue: "1 tarjeta por repasar",
    charsNotStarted: "{count} caracteres",
    noBooks: "No hay libros de vocabulario importados: ver docs/vocabulary.md.",
    sciences: "Ciencias",
    computing: "Informática",
    linuxText: "La línea de órdenes, de lo básico a las herramientas que instalar",
    nothingShown: "No hay ninguna actividad abierta para este jugador. Se eligen en la página Cuenta.",
    chemistryText: "Química física: cálculos y conceptos, Focus por Focus",
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
    cardsDue: "{count} cards to review",
    oneCardDue: "1 card to review",
    charsNotStarted: "{count} characters",
    noBooks: "No vocabulary book imported: see docs/vocabulary.md.",
    sciences: "Sciences",
    computing: "Computing",
    linuxText: "The command line, from the basics to tools worth installing",
    nothingShown: "No activity is open for this player. They are chosen on the Account page.",
    chemistryText: "Physical chemistry: calculations and concepts, Focus by Focus",
    home: "Home",
  },
} satisfies Record<Lang, Record<string, string>>;

type HomeKey = keyof (typeof texts)["fr"];
export const ht = (key: HomeKey, values: Record<string, string | number> = {}): string =>
  texts[currentLang()][key].replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? ""));

export type Activity =
  | { mode: "columns" }
  | { mode: "quiz"; subject?: Subject }
  | { mode: "vocab"; book: number }
  | { mode: "discover"; activity: DiscoverActivity };

export interface HomeContext {
  user: User;
  open(activity: Activity): void;
  /** The overview of the player's progress in every activity. */
  showProgress(): void;
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

/** An activity's id, as stored in a player's hidden list ("columns", "vocab-collins-spanish"…). */
export function activityId(activity: Activity, books: VocabBookInfo[]): string | null {
  switch (activity.mode) {
    case "columns":
      return "columns";
    case "quiz":
      return activity.subject === "chemistry" ? "chemistry" : activity.subject === "linux" ? "linux" : "quiz";
    case "discover":
      return `discover-${activity.activity}`;
    case "vocab": {
      const book = books.find((b) => b.id === activity.book);
      return book ? `vocab-${book.slug}` : null;
    }
  }
}

/** Every activity of the home page, by group: what an account can show or hide for a player. */
export function activityCatalog(books: VocabBookInfo[]): { group: string; activities: { id: string; title: string }[] }[] {
  return [
    { group: ht("maths"), activities: [{ id: "columns", title: qt("modeColumns") }, { id: "quiz", title: qt("modeQuiz") }] },
    { group: ht("sciences"), activities: [{ id: "chemistry", title: qt("modeChemistry") }] },
    { group: ht("computing"), activities: [{ id: "linux", title: qt("modeLinux") }] },
    {
      group: ht("languages"),
      activities: books.map((b) => ({ id: `vocab-${b.slug}`, title: `${b.kind === "characters" ? "✍️" : "💬"} ${bookTitle(b)}` })),
    },
    {
      group: dt("group"),
      activities: [
        { id: "discover-dice", title: dt("diceTitle") },
        { id: "discover-coins", title: dt("coinsTitle") },
        { id: "discover-puzzles", title: dt("puzzlesTitle") },
      ],
    },
    {
      group: pt("group"),
      activities: [
        { id: "discover-throw", title: pt("throwTitle") },
        { id: "discover-pendulum", title: pt("pendulumTitle") },
        { id: "discover-lenses", title: pt("lensesTitle") },
        { id: "discover-circuits", title: pt("circuitsTitle") },
      ],
    },
  ];
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
  const head = el("div", "home-head");
  const progressLink = button("ghost small home-progress", qt("progress"), ctx.showProgress);
  progressLink.title = prt("chipLabel");
  head.append(el("h1", "title home-title", ht("greeting", { name: ctx.user.name })), progressLink);
  wrap.append(head);

  // What is waiting, fetched together; a failure leaves the cards without status.
  const [profile, books, progress] = await Promise.all([
    store.profile(ctx.user.id).catch(() => null),
    vocabBooks().catch(() => [] as VocabBookInfo[]),
    vocab.progress(ctx.user.id).catch(() => null as VocabProgress | null),
  ]);

  const maths = el("div", "activity-group");
  maths.append(el("h2", "activity-group-title", ht("maths")));
  // Kinds of question to review, by subject.
  const subjectOfTopic = (topic: string): Subject =>
    (CHEMISTRY_TOPICS as string[]).includes(topic) ? "chemistry" : (LINUX_TOPICS as string[]).includes(topic) ? "linux" : "maths";
  const toReview = (subject: Subject): number =>
    profile ? profile.skills.filter((s) => s.status === "review" && subjectOfTopic(s.topic) === subject).length : 0;
  const reviewStatus = (n: number): { text: string; waiting: boolean } | null =>
    n > 0 ? { text: n === 1 ? ht("oneToReview") : ht("toReview", { count: n }), waiting: true } : null;
  const review = toReview("maths");
  const grid = el("div", "activity-grid");
  grid.append(
    card("columns", qt("modeColumns"), ht("columnsText"), null, () => ctx.open({ mode: "columns" })),
    card(
      "quiz",
      qt("modeQuiz"),
      ht("quizText"),
      review > 0 ? { text: review === 1 ? ht("oneToReview") : ht("toReview", { count: review }), waiting: true } : null,
      () => ctx.open({ mode: "quiz", subject: "maths" }),
    ),
  );
  maths.append(grid);

  const sciences = el("div", "activity-group");
  sciences.append(el("h2", "activity-group-title", ht("sciences")));
  const chemReview = toReview("chemistry");
  const labs = el("div", "activity-grid");
  labs.append(
    card(
      "chemistry",
      qt("modeChemistry"),
      ht("chemistryText"),
      chemReview > 0 ? { text: chemReview === 1 ? ht("oneToReview") : ht("toReview", { count: chemReview }), waiting: true } : null,
      () => ctx.open({ mode: "quiz", subject: "chemistry" }),
    ),
  );
  sciences.append(labs);

  const computing = el("div", "activity-group");
  computing.append(el("h2", "activity-group-title", ht("computing")));
  const shell = el("div", "activity-grid");
  shell.append(card("linux", qt("modeLinux"), ht("linuxText"), reviewStatus(toReview("linux")), () => ctx.open({ mode: "quiz", subject: "linux" })));
  computing.append(shell);

  const languages = el("div", "activity-group");
  languages.append(el("h2", "activity-group-title", ht("languages")));
  const shelf = el("div", "activity-grid");
  for (const book of books) {
    const mine = progress?.books[book.id];
    const signs = book.kind === "characters";
    const status =
      mine && mine.due > 0
        ? signs
          ? { text: mine.due === 1 ? ht("oneCardDue") : ht("cardsDue", { count: mine.due }), waiting: true }
          : { text: mine.due === 1 ? ht("oneWordDue") : ht("wordsDue", { count: mine.due }), waiting: true }
        : mine && mine.started > 0
          ? { text: ht("upToDate"), waiting: false }
          : { text: ht(signs ? "charsNotStarted" : "notStarted", { count: book.entries }), waiting: false };
    shelf.append(
      card(`vocab-${book.slug}`, `${signs ? "✍️" : "💬"} ${bookTitle(book)}`, book.title, status, () =>
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
  lab.append(
    card("discover-dice", dt("diceTitle"), dt("diceText"), null, () => ctx.open({ mode: "discover", activity: "dice" })),
    card("discover-coins", dt("coinsTitle"), dt("coinsText"), null, () => ctx.open({ mode: "discover", activity: "coins" })),
    card("discover-puzzles", dt("puzzlesTitle"), dt("puzzlesText"), null, () => ctx.open({ mode: "discover", activity: "puzzles" })),
  );
  discover.append(lab);

  // The physics playground: the same pattern, with simulations (docs/discover.md).
  const physics = el("div", "activity-group");
  physics.append(el("h2", "activity-group-title", pt("group")));
  const playground = el("div", "activity-grid");
  playground.append(
    card("discover-throw", pt("throwTitle"), pt("throwText"), null, () => ctx.open({ mode: "discover", activity: "throw" })),
    card("discover-pendulum", pt("pendulumTitle"), pt("pendulumText"), null, () => ctx.open({ mode: "discover", activity: "pendulum" })),
    card("discover-lenses", pt("lensesTitle"), pt("lensesText"), null, () => ctx.open({ mode: "discover", activity: "lenses" })),
    card("discover-circuits", pt("circuitsTitle"), pt("circuitsText"), null, () => ctx.open({ mode: "discover", activity: "circuits" })),
  );
  physics.append(playground);

  // Activities the player's account hides; a group left empty goes too.
  const hidden = new Set(ctx.user.hidden ?? []);
  // On a wide screen, groups sit side by side, each as wide as its cards need.
  const groups = el("div", "home-groups");
  for (const group of [maths, sciences, computing, languages, discover, physics]) {
    for (const node of group.querySelectorAll<HTMLElement>("[data-activity]")) {
      if (hidden.has(node.dataset.activity!)) node.remove();
    }
    const empty = group.querySelector(".empty");
    const cards = group.querySelectorAll("[data-activity]").length;
    group.style.setProperty("--cards", String(Math.max(1, Math.min(cards, 4))));
    if (cards > 0 || (empty && hidden.size === 0)) groups.append(group);
  }
  if (groups.childElementCount === 0) wrap.append(el("p", "empty", ht("nothingShown")));
  else wrap.append(groups);
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
