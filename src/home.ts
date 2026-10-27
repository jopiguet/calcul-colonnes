/**
 * Home page of a player: every activity, grouped by subject, each with what is
 * waiting (concepts to review, words due). Opened after choosing a player and
 * from the ← link of every activity.
 */
import { button, el } from "./dom";
import { appFooter, newsBanner } from "./news";
import { currentLang, type Lang } from "./i18n";
import { qt } from "./quiz-i18n";
import { store, vocab, workbook, type User, type VocabBookInfo, type VocabProgress } from "./store";
import { workbookStatus } from "./workbook";
import { wt } from "./workbook-i18n";
import type { ExerciseBookInfo } from "../shared/exercises/api";
import { bookTitle, shelfApart, shelvesOf } from "./vocab";
import { langName, vt } from "./vocab-i18n";
import { dt } from "./discover/i18n";
import { pt } from "./discover/physics-i18n";
import { at } from "./discover/astro-i18n";
import { bt } from "./discover/bio-i18n";
import { mt } from "./discover/math-i18n";
import { prt } from "./progress-i18n";
import type { DiscoverActivity } from "./discover/activities";
import { CALC_TOPICS, CF_TOPICS, CHEMBIO_TOPICS, CHEMISTRY_TOPICS, ECON_TOPICS, LINUX_TOPICS, GCP_TOPICS, REACT_TOPICS, RUST_TOPICS, SQL_TOPICS, TS_TOPICS, type Subject } from "../shared/quiz";

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
    chembio: "Chimie et biologie",
    chembioText: "Équilibrer les équations : combustions, sels, déplacements",
    computing: "Informatique",
    linuxText: "La ligne de commande, des bases aux outils à installer",
    sqlText: "Requêtes, jointures, transactions ; psql, sqlite3 et mysql",
    rustText: "Du premier programme à l'async et l'unsafe, en quatre niveaux",
    tsText: "Les types, et le JavaScript qui tourne dessous, en quatre niveaux",
    reactText: "Composants, état, effets, et la pile autour : Vite, tests, déploiement",
    gcpText: "IAM, comptes de service, réseau et pare-feu, en quatre niveaux",
    cfText: "DNS, cache, WAF, Workers, Zero Trust et IA, en quatre niveaux",
    economics: "Économie",
    econText: "Fiscalité, bien-être, assurance sociale, travail : notions et graphiques",
    calcText: "Limites, dérivées, intégrales, séries, plusieurs variables, Itô : notions et graphiques",
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
    chembio: "Química y biología",
    chembioText: "Ajustar ecuaciones: combustiones, sales, desplazamientos",
    computing: "Informática",
    linuxText: "La línea de órdenes, de lo básico a las herramientas que instalar",
    sqlText: "Consultas, uniones, transacciones; psql, sqlite3 y mysql",
    rustText: "Del primer programa al async y el unsafe, en cuatro niveles",
    tsText: "Los tipos, y el JavaScript que se ejecuta debajo, en cuatro niveles",
    reactText: "Componentes, estado, efectos, y la pila alrededor: Vite, tests, despliegue",
    gcpText: "IAM, cuentas de servicio, red y firewall, en cuatro niveles",
    cfText: "DNS, caché, WAF, Workers, Zero Trust e IA, en cuatro niveles",
    economics: "Economía",
    econText: "Impuestos, bienestar, seguro social, trabajo: conceptos y gráficos",
    calcText: "Límites, derivadas, integrales, series, varias variables, Itô: conceptos y gráficas",
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
    chembio: "Chemistry and biology",
    chembioText: "Balancing equations: combustions, salts, displacements",
    computing: "Computing",
    linuxText: "The command line, from the basics to tools worth installing",
    sqlText: "Queries, joins, transactions; psql, sqlite3 and mysql",
    rustText: "From a first program to async and unsafe, in four levels",
    tsText: "The types, and the JavaScript running underneath, in four levels",
    reactText: "Components, state, effects, and the stack around them: Vite, tests, deployment",
    gcpText: "IAM, service accounts, networking and firewalls, in four levels",
    cfText: "DNS, cache, WAF, Workers, Zero Trust and AI, in four levels",
    economics: "Economics",
    econText: "Taxation, welfare, social insurance, labour: concepts and charts",
    calcText: "Limits, derivatives, integrals, series, several variables, Itô: concepts and graphs",
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
  /** The books of one language studied, together (src/vocab.ts, shelvesOf). */
  | { mode: "shelf"; lang: string }
  | { mode: "discover"; activity: DiscoverActivity }
  /** A workbook's exercises (src/workbook.ts). */
  | { mode: "workbook"; book: string };

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
      return activity.subject === "chemistry" ? "chemistry" : activity.subject === "linux" ? "linux" : activity.subject === "chembio" ? "chembio" : activity.subject === "sql" ? "sql" : activity.subject === "rust" ? "rust" : activity.subject === "ts" ? "ts" : activity.subject === "react" ? "react" : activity.subject === "gcp" ? "gcp" : activity.subject === "cf" ? "cf" : activity.subject === "econ" ? "econ" : activity.subject === "calc" ? "calc" : "quiz";
    case "discover":
      return `discover-${activity.activity}`;
    case "vocab": {
      const book = books.find((b) => b.id === activity.book);
      return book ? `vocab-${book.slug}` : null;
    }
    case "shelf":
      // Not hidden on its own: it holds the player's books that are not.
      return null;
    case "workbook":
      return `workbook-${activity.book}`;
  }
}

/** Every activity of the home page, by group: what an account can show or hide for a player. */
export function activityCatalog(books: VocabBookInfo[], exerciseBooks: ExerciseBookInfo[] = []): { group: string; activities: { id: string; title: string }[] }[] {
  return [
    { group: ht("maths"), activities: [{ id: "columns", title: qt("modeColumns") }, { id: "quiz", title: qt("modeQuiz") }, { id: "calc", title: qt("modeCalc") }] },
    { group: ht("sciences"), activities: [{ id: "chemistry", title: qt("modeChemistry") }] },
    { group: ht("computing"), activities: [{ id: "linux", title: qt("modeLinux") }, { id: "sql", title: qt("modeSql") }, { id: "rust", title: qt("modeRust") }, { id: "ts", title: qt("modeTs") }, { id: "react", title: qt("modeReact") }, { id: "gcp", title: qt("modeGcp") }, { id: "cf", title: qt("modeCf") }] },
    { group: ht("economics"), activities: [{ id: "econ", title: qt("modeEcon") }] },
    {
      group: ht("languages"),
      activities: [
        ...books.map((b) => ({ id: `vocab-${b.slug}`, title: `${b.kind === "characters" ? "✍️" : "💬"} ${bookTitle(b)}` })),
      ],
    },
    { group: wt("home"), activities: exerciseBooks.map((b) => ({ id: `workbook-${b.id}`, title: `✏️ ${b.source}` })) },
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
    {
      group: at("group"),
      activities: [
        { id: "discover-moon", title: at("moonTitle") },
        { id: "discover-seasons", title: at("seasonsTitle") },
        { id: "discover-eclipses", title: at("eclipsesTitle") },
        { id: "discover-planets", title: at("planetsTitle") },
      ],
    },
    {
      group: mt("group"),
      activities: [
        { id: "discover-koch", title: mt("kochTitle") },
        { id: "discover-mandelbrot", title: mt("mandelbrotTitle") },
        { id: "discover-chaosgame", title: mt("chaosTitle") },
        { id: "discover-lorenz", title: mt("lorenzTitle") },
        { id: "discover-logistic", title: mt("logisticTitle") },
      ],
    },
    {
      group: ht("chembio"),
      activities: [
        { id: "chembio", title: qt("modeChemBio") },
        { id: "discover-molecules", title: bt("moleculesTitle") },
        { id: "discover-genetics", title: bt("geneticsTitle") },
        { id: "discover-cells", title: bt("cellsTitle") },
        { id: "discover-ecology", title: bt("ecologyTitle") },
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
  const [profile, books, progress, exerciseBooks] = await Promise.all([
    store.profile(ctx.user.id).catch(() => null),
    vocabBooks().catch(() => [] as VocabBookInfo[]),
    vocab.progress(ctx.user.id).catch(() => null as VocabProgress | null),
    workbook.books(ctx.user.id).catch(() => [] as ExerciseBookInfo[]),
  ]);

  const maths = el("div", "activity-group");
  maths.append(el("h2", "activity-group-title", ht("maths")));
  // Kinds of question to review, by subject.
  const subjectOfTopic = (topic: string): Subject =>
    (CHEMISTRY_TOPICS as string[]).includes(topic)
      ? "chemistry"
      : (LINUX_TOPICS as string[]).includes(topic)
        ? "linux"
        : (CHEMBIO_TOPICS as string[]).includes(topic)
          ? "chembio"
          : (SQL_TOPICS as string[]).includes(topic)
            ? "sql"
            : (RUST_TOPICS as string[]).includes(topic)
              ? "rust"
              : (TS_TOPICS as string[]).includes(topic)
                ? "ts"
                : (REACT_TOPICS as string[]).includes(topic)
                  ? "react"
                  : (GCP_TOPICS as string[]).includes(topic)
                    ? "gcp"
                    : (CF_TOPICS as string[]).includes(topic)
                      ? "cf"
                    : (ECON_TOPICS as string[]).includes(topic)
                      ? "econ"
                      : (CALC_TOPICS as string[]).includes(topic)
                        ? "calc"
                        : "maths";
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
    // Calculus: concept questions from the books, and questions read on graphs (docs/question-generators.md#calculus).
    card("calc", qt("modeCalc"), ht("calcText"), reviewStatus(toReview("calc")), () => ctx.open({ mode: "quiz", subject: "calc" })),
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

  // Chemistry and biology: the balancing test (docs/question-generators.md#balancing), then the labs (docs/discover.md).
  const chembio = el("div", "activity-group");
  chembio.append(el("h2", "activity-group-title", ht("chembio")));
  const bench = el("div", "activity-grid");
  bench.append(
    card("chembio", qt("modeChemBio"), ht("chembioText"), reviewStatus(toReview("chembio")), () => ctx.open({ mode: "quiz", subject: "chembio" })),
    card("discover-molecules", bt("moleculesTitle"), bt("moleculesText"), null, () => ctx.open({ mode: "discover", activity: "molecules" })),
    card("discover-genetics", bt("geneticsTitle"), bt("geneticsText"), null, () => ctx.open({ mode: "discover", activity: "genetics" })),
    card("discover-cells", bt("cellsTitle"), bt("cellsText"), null, () => ctx.open({ mode: "discover", activity: "cells" })),
    card("discover-ecology", bt("ecologyTitle"), bt("ecologyText"), null, () => ctx.open({ mode: "discover", activity: "ecology" })),
  );
  chembio.append(bench);

  // Mathematical curiosities: fractals and chaos (docs/discover.md#mathematical-curiosities).
  const curiosities = el("div", "activity-group");
  curiosities.append(el("h2", "activity-group-title", mt("group")));
  const oddities = el("div", "activity-grid");
  oddities.append(
    card("discover-koch", mt("kochTitle"), mt("kochText"), null, () => ctx.open({ mode: "discover", activity: "koch" })),
    card("discover-mandelbrot", mt("mandelbrotTitle"), mt("mandelbrotText"), null, () => ctx.open({ mode: "discover", activity: "mandelbrot" })),
    card("discover-chaosgame", mt("chaosTitle"), mt("chaosText"), null, () => ctx.open({ mode: "discover", activity: "chaosgame" })),
    card("discover-lorenz", mt("lorenzTitle"), mt("lorenzText"), null, () => ctx.open({ mode: "discover", activity: "lorenz" })),
    card("discover-logistic", mt("logisticTitle"), mt("logisticText"), null, () => ctx.open({ mode: "discover", activity: "logistic" })),
  );
  curiosities.append(oddities);

  const computing = el("div", "activity-group");
  computing.append(el("h2", "activity-group-title", ht("computing")));
  const shell = el("div", "activity-grid");
  shell.append(card("linux", qt("modeLinux"), ht("linuxText"), reviewStatus(toReview("linux")), () => ctx.open({ mode: "quiz", subject: "linux" })),
    card("sql", qt("modeSql"), ht("sqlText"), reviewStatus(toReview("sql")), () => ctx.open({ mode: "quiz", subject: "sql" })),
    card("rust", qt("modeRust"), ht("rustText"), reviewStatus(toReview("rust")), () => ctx.open({ mode: "quiz", subject: "rust" })),
    card("ts", qt("modeTs"), ht("tsText"), reviewStatus(toReview("ts")), () => ctx.open({ mode: "quiz", subject: "ts" })),
    card("react", qt("modeReact"), ht("reactText"), reviewStatus(toReview("react")), () => ctx.open({ mode: "quiz", subject: "react" })),
    card("gcp", qt("modeGcp"), ht("gcpText"), reviewStatus(toReview("gcp")), () => ctx.open({ mode: "quiz", subject: "gcp" })),
    card("cf", qt("modeCf"), ht("cfText"), reviewStatus(toReview("cf")), () => ctx.open({ mode: "quiz", subject: "cf" })),
  );
  computing.append(shell);

  // Public economics: concept questions from the books, and calculations on the classic diagrams.
  const economics = el("div", "activity-group");
  economics.append(el("h2", "activity-group-title", ht("economics")));
  const desk = el("div", "activity-grid");
  desk.append(card("econ", qt("modeEcon"), ht("econText"), reviewStatus(toReview("econ")), () => ctx.open({ mode: "quiz", subject: "econ" })));
  economics.append(desk);

  const languages = el("div", "activity-group");
  languages.append(el("h2", "activity-group-title", ht("languages")));
  const shelf = el("div", "activity-grid");
  // A language with several books: one card for them all (its page opens each), unless the player keeps them apart.
  const hiddenBooks = new Set(ctx.user.hidden ?? []);
  const shown = books.filter((b) => !hiddenBooks.has(`vocab-${b.slug}`));
  const grouped = new Map(shelvesOf(shown).filter((s) => !shelfApart(s.lang)).map((s) => [s.lang, s]));
  const placed = new Set<string>();
  for (const book of books) {
    const together = book.kind !== "characters" && !hiddenBooks.has(`vocab-${book.slug}`) ? grouped.get(book.term) : undefined;
    if (together) {
      if (placed.has(together.lang)) continue;
      placed.add(together.lang);
      const due = together.books.reduce((sum, b) => sum + (progress?.books[b.id]?.due ?? 0), 0);
      const started = together.books.some((b) => (progress?.books[b.id]?.started ?? 0) > 0);
      const words = together.books.reduce((sum, b) => sum + b.entries, 0);
      const status = due > 0
        ? { text: due === 1 ? ht("oneWordDue") : ht("wordsDue", { count: due }), waiting: true }
        : started ? { text: ht("upToDate"), waiting: false } : { text: ht("notStarted", { count: words }), waiting: false };
      shelf.append(
        card(`vocab-shelf-${together.lang}`, `📚 ${vt("title", { lang: langName(together.lang) })}`, together.books.map((b) => b.title).join(" · "), status, () =>
          ctx.open({ mode: "shelf", lang: together.lang }),
        ),
      );
      continue;
    }
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

  // Workbooks: the exercises of a book, filled in on its pages (docs/exercises.md); a group of their own.
  const workbooks = el("div", "activity-group");
  workbooks.append(el("h2", "activity-group-title", wt("home")));
  const desks = el("div", "activity-grid");
  for (const b of exerciseBooks) {
    desks.append(card(`workbook-${b.id}`, `✏️ ${b.source}`, `${b.title} · ${wt("homeText")}`, workbookStatus(b), () => ctx.open({ mode: "workbook", book: b.id })));
  }
  workbooks.append(desks);

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

  // Astronomy: geometric models of the sky, the same pattern again.
  const astronomy = el("div", "activity-group");
  astronomy.append(el("h2", "activity-group-title", at("group")));
  const sky = el("div", "activity-grid");
  sky.append(
    card("discover-moon", at("moonTitle"), at("moonText"), null, () => ctx.open({ mode: "discover", activity: "moon" })),
    card("discover-seasons", at("seasonsTitle"), at("seasonsText"), null, () => ctx.open({ mode: "discover", activity: "seasons" })),
    card("discover-eclipses", at("eclipsesTitle"), at("eclipsesText"), null, () => ctx.open({ mode: "discover", activity: "eclipses" })),
    card("discover-planets", at("planetsTitle"), at("planetsText"), null, () => ctx.open({ mode: "discover", activity: "planets" })),
  );
  astronomy.append(sky);

  // Activities the player's account hides; a group left empty goes too.
  const hidden = new Set(ctx.user.hidden ?? []);
  // On a wide screen, groups sit side by side, each as wide as its cards need.
  const groups = el("div", "home-groups");
  // Chemistry and biology last: the other science groups come before it.
  for (const group of [maths, sciences, computing, economics, languages, workbooks, discover, physics, astronomy, curiosities, chembio]) {
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
  // The release news once, then the foot: version, news, feedback, privacy.
  const news = newsBanner();
  if (news) head.after(news);
  wrap.append(appFooter("home"));
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
