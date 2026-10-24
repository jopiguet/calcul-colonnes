/**
 * Builds a practice session: which cards, in which order, asked how.
 *
 * learn    1. cards due for review (their wait is over), oldest first;
 *          2. recall (and reading) cards that just became available
 *             (recognition in box 2);
 *          3. new entries, in the book's order, at most NEW_PER_SESSION. In
 *             the Characters book, the characters met in the player's words
 *             (another Japanese book) come first.
 * due      cards due for review only.
 * review   cards already started, due or not: due first, then the weakest
 *          (lowest box), then those not seen for the longest time. No new
 *          entries. A right answer ahead of time does not move the card up.
 *
 * A wrong answer is asked again at the end of the session (by the browser).
 */
import { acceptedForms, display, normalise, writable } from "./grade";
import { NEW_PER_SESSION, RECALL_AFTER, askMode, type CardState, type Direction, type ModePreference } from "./schedule";
import type { BookKind, TranslationLang } from "./format";
import type { VocabCard } from "../types";

export interface SessionEntry {
  id: number;
  sectionId: number;
  position: number;
  /** The word studied ("la llave", "abase"). */
  term: string;
  /** Its translation or definition ("key", "degrade"). */
  meaning: string;
  group: string;
  feminine: boolean;
  /** Example or remark, shown after the answer ("corporeal" for "corp"). */
  note: string;
  /** How the term reads, when its script does not say it (Japanese rōmaji), or "". */
  reading: string;
  /** A kanji's readings ("ニチ / ジツ / ひ"), or "": asked as a third direction. */
  readings: string;
  /** The meaning in other interface languages. */
  translations: Partial<Record<TranslationLang, string>>;
  book: BookInfo;
}

/** How a book is studied. */
export interface BookInfo {
  /**
   * translation: meaning in another language; definition: meaning explained
   * in the same language; characters: kana and kanji (docs/characters.md).
   */
  kind: BookKind;
  termLang: string;
  meaningLang: string;
  /** A word list in alphabetical order: neighbours are not related in meaning. */
  alphabetical: boolean;
}

export type ProgressMap = Map<string, CardState>;
export const progressKey = (entryId: number, direction: Direction): string => `${entryId}:${direction}`;

/** The directions an entry is learnt in: a kanji is also read. */
export const directionsOf = (entry: Pick<SessionEntry, "readings">): Direction[] =>
  entry.readings ? ["recognise", "recall", "read"] : ["recognise", "recall"];

/**
 * The entry with its meaning in the interface's language, when the book gives
 * one ("jour" for 日 in French); as it is otherwise.
 */
export function localise(entry: SessionEntry, lang: string | undefined): SessionEntry {
  const translated = lang ? entry.translations[lang as TranslationLang] : undefined;
  if (!translated || lang === entry.book.meaningLang) return entry;
  return { ...entry, meaning: translated, book: { ...entry.book, meaningLang: lang! } };
}

/**
 * The side shown, the side to answer and its language. Recognise: the term
 * shown, its meaning asked. Recall: the meaning shown, the term asked. Read: a
 * kanji shown, its readings asked (one is enough).
 */
export function sides(entry: SessionEntry, direction: Direction): { prompt: string; answer: string; lang: string } {
  if (direction === "read") return { prompt: entry.term, answer: entry.readings, lang: entry.book.termLang };
  return direction === "recognise"
    ? { prompt: entry.term, answer: entry.meaning, lang: entry.book.meaningLang }
    : { prompt: entry.meaning, answer: entry.term, lang: entry.book.termLang };
}

/**
 * Can this card be answered in writing? Not a definition, nor a long phrase;
 * nor a character to produce (chosen among look-alikes instead: few keyboards
 * write one kana or one kanji on its own). A kanji's reading is: one of its
 * readings, in kana or rōmaji.
 */
export function canWrite(entry: SessionEntry, direction: Direction): boolean {
  if (direction === "recognise" && entry.book.kind === "definition") return false;
  if (entry.book.kind === "characters") return direction === "read" || writable(entry.meaning) && direction === "recognise";
  return writable(sides(entry, direction).answer);
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Three wrong options: entries of the same group first, then of the same
 * section, then of the pool (the lesson). Never an option that reads like the
 * answer or like another option.
 */
export function distractors(entry: SessionEntry, direction: Direction, pool: SessionEntry[], random: () => number): string[] {
  const { answer, prompt } = sides(entry, direction);
  // Another entry with the same prompt would be a second right answer
  // ("large": macro, magn): never offered as a wrong option.
  const samePrompt = normalise(prompt);
  const taken = new Set(acceptedForms(answer));
  taken.add(normalise(answer));
  // Length in words; in Japanese, written without spaces, in characters.
  const size = (text: string): number => (sides(entry, direction).lang === "ja" ? [...text].length : text.split(" ").length);
  const words = size(answer);
  // In a themed book, the same section gives plausible wrong options. In an
  // alphabetical list it gives look-alikes (abase, abash, abate): the whole
  // book is used instead, keeping only an explicit group (prefixes with prefixes).
  // Characters: kana with kana, kanji with kanji, meanings in the same language.
  const kin =
    entry.book.kind === "characters"
      ? pool.filter(
          (e) => Boolean(e.readings) === Boolean(entry.readings) && (direction !== "recognise" || e.book.meaningLang === entry.book.meaningLang),
        )
      : pool;
  const tiers = entry.book.alphabetical
    ? [entry.group ? kin.filter((e) => e.group === entry.group) : [], kin]
    : [
        kin.filter((e) => e.sectionId === entry.sectionId && e.group === entry.group),
        kin.filter((e) => e.sectionId === entry.sectionId),
        kin,
      ];
  const chosen: string[] = [];
  for (const tier of tiers) {
    // Similar length first, so the answer does not stand out by its size.
    const candidates = shuffle(tier, random).sort(
      (a, b) =>
        Math.abs(size(sides(a, direction).answer) - words) - Math.abs(size(sides(b, direction).answer) - words),
    );
    for (const other of candidates) {
      if (chosen.length === 3) return chosen;
      if (other.id === entry.id || normalise(sides(other, direction).prompt) === samePrompt) continue;
      const text = sides(other, direction).answer;
      const key = normalise(text);
      if (!key || taken.has(key) || acceptedForms(text).some((f) => taken.has(f))) continue;
      taken.add(key);
      chosen.push(display(text));
    }
  }
  return chosen;
}

export interface SessionRequest {
  /** Entries to practise (a section, a lesson, or everything for "due"). */
  entries: SessionEntry[];
  /** Where wrong options are drawn from (the entries' lessons). */
  pool: SessionEntry[];
  progress: ProgressMap;
  now: number;
  size: number;
  preference: ModePreference;
  purpose: SessionPurpose;
  /** Order of new entries: the book's, or at random. */
  newOrder: NewOrder;
  /** Characters book: entries met in the player's words, introduced first. */
  met?: ReadonlySet<number>;
  random: () => number;
}

export type SessionPurpose = "learn" | "review" | "due";
export type NewOrder = "book" | "random";

export function buildSession(req: SessionRequest): VocabCard[] {
  const { entries, progress, now, size } = req;
  const picked: { entry: SessionEntry; direction: Direction; box: number }[] = [];

  const due: { entry: SessionEntry; direction: Direction; state: CardState }[] = [];
  const ahead: { entry: SessionEntry; direction: Direction; state: CardState }[] = [];
  const ready: { entry: SessionEntry; direction: Direction }[] = [];
  const fresh: SessionEntry[] = [];
  for (const entry of entries) {
    const directions = directionsOf(entry);
    const states = directions.map((d) => [d, progress.get(progressKey(entry.id, d))] as const);
    if (states.every(([, state]) => !state)) fresh.push(entry);
    for (const [direction, state] of states) {
      if (!state) continue;
      (state.dueAt <= now ? due : ahead).push({ entry, direction, state });
    }
    // Recall, and a kanji's reading, once recognition has reached its box.
    const recognise = progress.get(progressKey(entry.id, "recognise"));
    if (recognise && recognise.box >= RECALL_AFTER) {
      for (const [direction, state] of states) if (direction !== "recognise" && !state) ready.push({ entry, direction });
    }
  }
  due.sort((a, b) => a.state.dueAt - b.state.dueAt);

  // Learning: room is kept for new entries, however many reviews are due or
  // recall cards are ready (a kanji brings two more each), so "learn" always
  // brings new words while there are any. Reviews take what is left.
  const newWanted = req.purpose === "learn" ? Math.min(NEW_PER_SESSION, fresh.length, size) : 0;
  const reviewRoom = size - newWanted;
  for (const d of due) if (picked.length < reviewRoom) picked.push({ entry: d.entry, direction: d.direction, box: d.state.box });
  if (req.purpose === "review") {
    // Weakest first, then the longest unseen; random among equals.
    const order = shuffle(ahead, req.random).sort(
      (a, b) => a.state.box - b.state.box || (a.state.lastAt ?? 0) - (b.state.lastAt ?? 0),
    );
    for (const d of order) if (picked.length < size) picked.push({ entry: d.entry, direction: d.direction, box: d.state.box });
  }
  if (req.purpose === "learn") {
    for (const r of ready) if (picked.length < reviewRoom) picked.push({ ...r, box: 0 });
    // The book's order is the order of the entries given (lesson, section, position):
    // section ids follow the imports, not the book, once a book has been updated.
    const ordered = req.newOrder === "random" ? shuffle(fresh, req.random) : fresh;
    // Characters met in the player's words: up to half the new ones; the rest
    // follow the book (or the draw), so the book's order goes on too.
    const met = req.met;
    const metFirst = met ? ordered.filter((e) => met.has(e.id)).slice(0, Math.ceil(newWanted / 2)) : [];
    const rest = ordered.filter((e) => !metFirst.includes(e));
    for (const entry of [...metFirst, ...rest].slice(0, newWanted)) picked.push({ entry, direction: "recognise", box: 0 });
    // Fewer new entries than room: more reviews, then more recall cards.
    for (const d of due) if (picked.length < size && !picked.some((p) => p.entry === d.entry && p.direction === d.direction)) picked.push({ entry: d.entry, direction: d.direction, box: d.state.box });
    for (const r of ready) if (picked.length < size && !picked.some((p) => p.entry === r.entry && p.direction === r.direction)) picked.push({ ...r, box: 0 });
  }

  // Reviews and new cards mixed, so a session does not end with all the new words.
  return shuffle(picked, req.random).map(({ entry, direction, box }) => {
    const { prompt, answer, lang } = sides(entry, direction);
    const mode = askMode(box, req.preference, canWrite(entry, direction));
    const characters = entry.book.kind === "characters";
    const card: VocabCard = {
      entryId: entry.id,
      direction,
      mode,
      box,
      prompt: display(prompt),
      promptLang: direction === "recall" ? entry.book.meaningLang : entry.book.termLang,
      answerLang: lang,
      ...(entry.group ? { group: entry.group } : {}),
      ...(direction === "recognise" && entry.feminine ? { feminine: true } : {}),
      ...(direction === "recognise" && entry.reading ? { promptReading: entry.reading } : {}),
      ...(characters ? { script: entry.readings ? ("kanji" as const) : ("kana" as const) } : {}),
      ...(characters && req.met?.has(entry.id) ? { met: true } : {}),
    };
    if (mode === "choice") {
      card.options = shuffle([display(answer), ...distractors(entry, direction, req.pool, req.random)], req.random);
      // Japanese options with their rōmaji, for a learner who does not read kana yet.
      if (direction === "recall" && entry.reading) {
        const readings = new Map<string, string>();
        for (const e of [entry, ...req.pool]) if (e.reading && !readings.has(display(e.term))) readings.set(display(e.term), e.reading);
        readings.set(display(entry.term), entry.reading);
        card.optionReadings = card.options.map((o) => readings.get(o) ?? "");
      }
    }
    return card;
  });
}
