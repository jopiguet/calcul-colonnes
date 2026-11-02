/**
 * An EPUB workbook → exercise book (docs/exercises.md#epub-workbooks):
 *
 *   npm run exercises:epub -- "Practice_Makes_Perfect_Complete_Spanish_Grammar.epub"
 *   npm run exercises:import -- data/exercises/complete-spanish-grammar
 *
 * For workbooks whose EPUB marks each exercise and its key with anchors
 * (McGraw-Hill's Practice Makes Perfect: "ch4ans11" on the exercise,
 * "ch4ans-11" on its key). Each exercise is drawn as the book prints it, with
 * the book's own style sheet, in Chromium (Playwright's, as for the tests):
 * the picture of the exercise is what the app shows, and every blank of the
 * book (a run of underscores, an answer line) becomes a field at its place.
 * The key gives each item's answer; an exercise without one, or whose key is
 * a text (a translated paragraph), is answered freely and marked by the player.
 *
 * The output is the book's content: it stays in data/, never in the project.
 */
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";
import { parseExerciseBook, type BookExercise, type ExerciseBookFile, type Gap } from "../shared/exercises/format.ts";

/** The files of a zip archive (an EPUB), by name. Stored and deflated entries only, as EPUBs are. */
export function unzip(zip: Buffer): Map<string, Buffer> {
  let end = zip.length - 22;
  while (end >= 0 && zip.readUInt32LE(end) !== 0x06054b50) end--;
  if (end < 0) throw new Error("not a zip archive (no central directory)");
  const count = zip.readUInt16LE(end + 10);
  let at = zip.readUInt32LE(end + 16);
  const files = new Map<string, Buffer>();
  for (let i = 0; i < count; i++) {
    if (zip.readUInt32LE(at) !== 0x02014b50) throw new Error("zip: broken central directory");
    const method = zip.readUInt16LE(at + 10);
    const size = zip.readUInt32LE(at + 20);
    const nameLength = zip.readUInt16LE(at + 28);
    const extra = zip.readUInt16LE(at + 30);
    const comment = zip.readUInt16LE(at + 32);
    const local = zip.readUInt32LE(at + 42);
    const name = zip.subarray(at + 46, at + 46 + nameLength).toString("utf8");
    at += 46 + nameLength + extra + comment;
    if (name.endsWith("/")) continue;
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    const data = zip.subarray(start, start + size);
    if (method === 0) files.set(name, Buffer.from(data));
    else if (method === 8) files.set(name, inflateRawSync(data));
    else throw new Error(`zip: ${name} is compressed with method ${method}`);
  }
  return files;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** The text of an HTML fragment: tags out, entities read, spaces single. */
export function textOf(fragment: string): string {
  return fragment
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, code: string) =>
      code[0] === "#" ? String.fromCodePoint(code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : Number(code.slice(1))) : (ENTITIES[code] ?? m),
    )
    .replace(/[\s ]+/g, " ")
    .trim();
}

export interface KeyExercise {
  /** "4.11" */
  id: string;
  items: { n: string; answer: string }[];
  /** The key's text outside numbered items: a translated paragraph. */
  text: string;
}

/** The answer key: its units ("1   The present tense …") and each exercise's items. */
export function readKey(html: string): { units: { n: number; title: string }[]; exercises: Map<string, KeyExercise> } {
  const units: { n: number; title: string }[] = [];
  const exercises = new Map<string, KeyExercise>();
  let current: KeyExercise | null = null;
  for (const m of html.matchAll(/<(h3|p)\b[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/\1>/g)) {
    const [, , cls, inner] = m as unknown as [string, string, string, string];
    if (cls.startsWith("h3d")) {
      const t = /^(\d+)\s+(.+)$/.exec(textOf(inner));
      if (t) units.push({ n: Number(t[1]), title: t[2]! });
      current = null;
      continue;
    }
    if (cls === "ansta") {
      const id = /id="ch(\d+)ans-(\d+)"/.exec(inner);
      if (!id) continue;
      current = { id: `${id[1]}.${id[2]}`, items: [], text: "" };
      exercises.set(current.id, current);
      // What follows the exercise's number: the key as a text.
      const after = inner.replace(/^[\s\S]*?<\/strong>/, "");
      current.text = textOf(after);
      continue;
    }
    if (!current || !/^ans/.test(cls)) continue;
    const line = textOf(inner);
    if (!line) continue;
    const item = /^(\d{1,2})\.\s*(.*)$/.exec(line);
    if (item) current.items.push({ n: item[1]!, answer: item[2]! });
    else if (current.items.length > 0) current.items[current.items.length - 1]!.answer += ` ${line}`;
    else current.text = `${current.text} ${line}`.trim();
  }
  return { units, exercises };
}

/** An exercise's HTML in its chapter: from its title's paragraph to the rule under it. */
export interface Fragment {
  id: string;
  unit: number;
  page: number;
  keyed: boolean;
  html: string;
}

export function fragmentsOf(chapter: string): Fragment[] {
  const anchors = [...chapter.matchAll(/<a id="ch(\d+)ans(\d+)"><\/a>/g)];
  const starts = anchors.map((a) => chapter.lastIndexOf("<p", a.index));
  // The chapter's number: most of its anchors'. One that says another chapter is a slip of
  // the book ("ch16ans18" among chapter 17's exercises, linked to 16.18's key): renumbered.
  const counts = new Map<string, number>();
  for (const a of anchors) counts.set(a[1]!, (counts.get(a[1]!) ?? 0) + 1);
  const chapterNumber = [...counts].sort((x, y) => y[1] - x[1])[0]?.[0];
  return anchors.map((a, i) => {
    const unit = chapterNumber ?? a[1]!;
    const slip = a[1] !== unit;
    const start = starts[i]!;
    const limit = starts[i + 1] ?? chapter.length;
    const candidates = [chapter.indexOf('<div class="border2', start), chapter.indexOf("<h2", start), chapter.indexOf("<h3", start)].filter((x) => x > start);
    const end = Math.min(limit, ...candidates);
    const pages = [...chapter.slice(0, a.index! + 40).matchAll(/id="page_(\d+)"/g)];
    return {
      id: `${unit}.${a[2]}`,
      unit: Number(unit),
      page: pages.length ? Number(pages[pages.length - 1]![1]) : 0,
      keyed: !slip && chapter.slice(a.index!, a.index! + 200).includes(`#ch${a[1]}ans-${a[2]}`),
      html: chapter.slice(start, end),
    };
  });
}

/** The exercise's instruction: its title line(s), "Práctica. Escribe en español." */
const instructionOf = (html: string): string =>
  [...html.matchAll(/<p class="trade\d?">([\s\S]*?)<\/p>/g)].map((m) => textOf(m[1]!)).join(" ").slice(0, 2000);

/** What the browser measures of one drawn exercise. */
interface Drawn {
  id: string;
  width: number;
  height: number;
  /** Items numbered in the exercise, in order, with the blanks on their lines. */
  items: { n: string; gaps: Gap[] }[];
  /** Blanks outside a numbered item (in a paragraph). */
  loose: Gap[];
  /** Answer lines drawn inside the exercise's pictures (a list printed as an image), in reading order. */
  drawnLines: Gap[];
}

/**
 * Runs in the page: marks the blanks, finds each block's item, measures.
 * A string, so that the server's type check (no DOM) does not read it.
 */
const MEASURE = `(lines) => {
  const out = [];
  for (const ex of document.querySelectorAll(".ex")) {
    const walker = document.createTreeWalker(ex, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    for (const t of texts) {
      if (!/_{3,}/.test(t.data)) continue;
      const frag = document.createDocumentFragment();
      for (const part of t.data.split(/(_{3,})/)) {
        if (!part) continue;
        if (/^_{3,}$/.test(part)) {
          const s = document.createElement("span");
          s.className = "blank";
          s.textContent = part;
          frag.append(s);
        } else frag.append(document.createTextNode(part));
      }
      t.replaceWith(frag);
    }
    const box = ex.getBoundingClientRect();
    const gapOf = (el) => {
      const r = el.getBoundingClientRect();
      return [
        +((r.left - box.left) / box.width).toFixed(4),
        +((r.bottom - box.top) / box.height).toFixed(4),
        +(r.width / box.width).toFixed(4),
      ];
    };
    const items = [];
    const loose = [];
    let item = null;
    for (const block of ex.children) {
      const text = block.textContent.replace(/[\\s\\u00a0]+/g, " ").trim();
      const number = /^(?:_{3,}\\s*)?(\\d{1,2})\\.(?!\\d)/.exec(text);
      if (number && !/^alis/.test(block.className)) {
        item = { n: String(Number(number[1])), gaps: [] };
        if (!items.some((i) => i.n === item.n)) items.push(item);
        else item = items.find((i) => i.n === item.n);
      } else if (/^(trade|h\\d|imagel)/.test(block.className) || block.tagName.startsWith("H")) {
        // A title or a new part of the exercise: blanks after it are not the item's above.
        if (!/^imagel/.test(block.className) || items.length > 0) item = null;
      }
      const blanks = [...block.querySelectorAll("span.blank, img")].filter(
        (el) => el.tagName === "SPAN" || lines.includes(el.getAttribute("src").split("/").pop()),
      );
      for (const el of blanks) {
        // A number just before the blank, in running text ("… todos 2. ____ martes", or after a line break): that item's.
        const range = document.createRange();
        range.setStart(block, 0);
        range.setEndBefore(el);
        const inline = /(?:^|[^\\d.,])(\\d{1,2})[.)]\\s*$/.exec(range.toString().replace(/[\\s\\u00a0]+/g, " "));
        let owner = item;
        if (inline && !/^alis/.test(block.className)) {
          const n = String(Number(inline[1]));
          owner = items.find((i) => i.n === n) ?? null;
          if (!owner) {
            owner = { n, gaps: [] };
            items.push(owner);
          }
        }
        (owner ? owner.gaps : loose).push(gapOf(el));
      }
    }
    // Pictures of the exercise (not its title, not the answer lines): the answer lines drawn in them.
    // A line is a thin dark run, a fifth of the picture wide at least, with nothing printed just above
    // it (an underlined word has its letters there).
    const drawnLines = [];
    for (const img of ex.querySelectorAll("img")) {
      const file = img.getAttribute("src").split("/").pop();
      if (lines.includes(file) || img.naturalHeight < 60 || (img.naturalWidth === 751 && img.naturalHeight < 100)) continue;
      const W = img.naturalWidth, H = img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const c = canvas.getContext("2d");
      c.drawImage(img, 0, 0);
      let px;
      try { px = c.getImageData(0, 0, W, H).data; } catch { continue; }
      const dark = (x, y) => { const i = 4 * (y * W + x); return px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11 < 150; };
      const found = [];
      for (let y = 8; y < H; y++) {
        let x = 0;
        while (x < W) {
          if (!dark(x, y)) { x++; continue; }
          const x0 = x;
          while (x < W && (dark(x, y) || (x + 1 < W && dark(x + 1, y)))) x++;
          const len = x - x0;
          if (len < Math.max(40, W * 0.2)) continue;
          // Thin: the row 3 pixels below is light along it.
          let below = 0, above = 0, n = 0;
          for (let k = x0; k < x; k += 2) {
            n++;
            if (y + 3 < H && dark(k, y + 3)) below++;
            for (let d = 3; d <= 12; d++) if (y - d >= 0 && dark(k, y - d)) { above++; break; }
          }
          if (below / n > 0.2 || above / n > 0.15) continue;
          if (found.some((f) => Math.abs(f.y - y) <= 4 && f.x0 < x && x0 < f.x1)) continue;
          found.push({ x0, x1: x, y });
        }
      }
      const r = img.getBoundingClientRect();
      const sx = r.width / W, sy = r.height / H;
      for (const f of found) {
        drawnLines.push([
          +((r.left + f.x0 * sx - box.left) / box.width).toFixed(4),
          +((r.top + (f.y + 1) * sy - box.top) / box.height).toFixed(4),
          +(((f.x1 - f.x0) * sx) / box.width).toFixed(4),
        ]);
      }
    }
    drawnLines.sort((a, b) => (Math.abs(a[1] - b[1]) < 0.01 ? a[0] - b[0] : a[1] - b[1]));
    out.push({ id: ex.dataset.id, width: Math.round(box.width), height: Math.round(box.height), items, loose, drawnLines });
  }
  return out;
}`;

export interface EpubReport {
  book: string;
  units: number;
  exercises: number;
  keyed: number;
  open: number;
  fields: number;
  under: number;
  /** Items of the key not found in the exercise, and the other way round, by exercise. */
  mismatched: string[];
}

export interface EpubOptions {
  id: string;
  title: string;
  source: string;
  level: string;
  language: string;
  out: string;
  /** Exercises to draw, for a quick look ("4.11,4.12"); all when empty. */
  only?: string[];
}

export async function extractEpub(epubPath: string, options: EpubOptions): Promise<EpubReport> {
  const files = unzip(readFileSync(epubPath));
  const text = (name: string): string => files.get(name)?.toString("utf8") ?? "";
  const opfPath = /full-path="([^"]+)"/.exec(text("META-INF/container.xml"))?.[1];
  if (!opfPath) throw new Error("not an EPUB: META-INF/container.xml names no package");
  const base = posix.dirname(opfPath);
  const opf = text(opfPath);
  const manifest = new Map([...opf.matchAll(/<item\b[^>]*>/g)].map((m) => [/id="([^"]+)"/.exec(m[0])?.[1] ?? "", /href="([^"]+)"/.exec(m[0])?.[1] ?? ""]));
  const spine = [...opf.matchAll(/<itemref\b[^>]*idref="([^"]+)"/g)].map((m) => posix.join(base, decodeURIComponent(manifest.get(m[1]!) ?? "")));
  const keyFile = spine.find((f) => /id="ch\d+ans-\d+"/.test(text(f)));
  if (!keyFile) throw new Error("no answer key: this EPUB does not mark its exercises (ch1ans-1); see docs/exercises.md#epub-workbooks");
  const key = readKey(text(keyFile));
  const chapters = spine.filter((f) => f !== keyFile && /<a id="ch\d+ans\d+"><\/a>/.test(text(f)));

  // Answer lines: the small, wide pictures used again and again ("____" drawn as an image).
  const uses = new Map<string, number>();
  for (const f of spine) for (const m of text(f).matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/g)) {
    const tag = m[0];
    const h = Number(/height="(\d+)"/.exec(tag)?.[1] ?? 99);
    const w = Number(/width="(\d+)"/.exec(tag)?.[1] ?? 0);
    if (h <= 22 && w >= 150) uses.set(posix.basename(m[1]!), (uses.get(posix.basename(m[1]!)) ?? 0) + 1);
  }
  const lines = [...uses].filter(([, k]) => k >= 10).map(([name]) => name);

  // The EPUB on disk, so that the browser reads its style sheets and pictures.
  const work = mkdtempSync(join(tmpdir(), "luma-epub-"));
  const imagesOut = join(options.out, "images");
  mkdirSync(imagesOut, { recursive: true });
  const exercises: BookExercise[] = [];
  const report: EpubReport = { book: options.id, units: 0, exercises: 0, keyed: 0, open: 0, fields: 0, under: 0, mismatched: [] };
  const browser = await launchBrowser();
  try {
    for (const [name, data] of files) {
      const target = join(work, name);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, data);
    }
    const page = await browser.newPage({ viewport: { width: 760, height: 1000 }, deviceScaleFactor: 1.5 });
    for (const chapter of chapters) {
      const html = text(chapter);
      const head = /<head>([\s\S]*?)<\/head>/.exec(html)?.[1] ?? "";
      const styles = [...head.matchAll(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/g)].map((m) => `<link rel="stylesheet" href="${m[1]}">`).join("");
      const fragments = fragmentsOf(html).filter((f) => !options.only?.length || options.only.includes(f.id));
      if (fragments.length === 0) continue;
      const doc =
        `<!doctype html><html><head><meta charset="utf-8">${styles}<style>` +
        "html,body{margin:0;padding:0;background:#fff;color:#111}" +
        ".ex{width:720px;box-sizing:border-box;padding:6px 18px 14px;margin:0 0 40px;background:#fff;overflow:hidden}" +
        ".ex img{max-width:100%;height:auto}.ex p{orphans:1;widows:1}" +
        "</style></head><body>" +
        fragments.map((f) => `<div class="ex" data-id="${f.id}">${f.html}</div>`).join("") +
        "</body></html>";
      const file = join(work, dirname(chapter), "luma-exercises.html");
      writeFileSync(file, doc);
      await page.goto(pathToFileURL(file).href);
      await page.evaluate("document.fonts.ready");
      await page.waitForLoadState("load");
      const drawn = (await page.evaluate(`(${MEASURE})(${JSON.stringify(lines)})`)) as Drawn[];
      for (const [i, f] of fragments.entries()) {
        const d = drawn[i]!;
        const image = `${f.id}.jpg`;
        await page.locator(`.ex[data-id="${f.id}"]`).screenshot({ path: join(imagesOut, image), type: "jpeg", quality: 82 });
        exercises.push(merge(f, d, f.keyed ? key.exercises.get(f.id) : undefined, image, instructionOf(f.html), report));
      }
    }
  } finally {
    await browser.close();
    rmSync(work, { recursive: true, force: true });
  }

  const unitNumbers = new Set(exercises.map((e) => e.unit));
  const units = [...unitNumbers].sort((a, b) => a - b).map((n) => ({ n, title: key.units.find((u) => u.n === n)?.title ?? "" }));
  const book: ExerciseBookFile = {
    format: 1,
    book: { id: options.id, title: options.title, source: options.source, level: options.level, kind: "grammar", language: options.language },
    units,
    exercises,
  };
  parseExerciseBook(book);
  writeFileSync(join(options.out, "book.json"), JSON.stringify(book, null, 1));
  report.units = units.length;
  report.exercises = exercises.length;
  return report;
}

/**
 * Lines in two columns or more (1–7 on the left, 8–14 on the right) are read
 * column by column, as the items are numbered; otherwise row by row.
 */
export function columnsFirst(lines: Gap[]): Gap[] {
  const columns: Gap[][] = [];
  for (const line of [...lines].sort((a, b) => a[0] - b[0])) {
    const column = columns.find((c) => Math.abs(c[0]![0] - line[0]) < 0.04);
    if (column) column.push(line);
    else columns.push([line]);
  }
  if (columns.length < 2 || columns.some((c) => c.length < 2)) return lines;
  return columns.flatMap((c) => c.sort((a, b) => a[1] - b[1]));
}

/** Browsers built on Chromium that Playwright can drive, where they are usually installed. */
const INSTALLED_BROWSERS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

/**
 * A Chromium to draw in: PLAYWRIGHT_CHROMIUM if set, Playwright's own, or else
 * a Chrome, Chromium, Edge or Brave already installed (Playwright's own is not
 * made for every system: none for macOS 13 since Playwright 1.5x). File access,
 * so that the pictures can be read back (the answer lines drawn in them).
 */
async function launchBrowser(): Promise<import("playwright").Browser> {
  const { chromium } = await import("playwright");
  const args = ["--allow-file-access-from-files"];
  const { existsSync } = await import("node:fs");
  const tries: { label: string; options: Parameters<typeof chromium.launch>[0] }[] = [
    ...(process.env.PLAYWRIGHT_CHROMIUM ? [{ label: process.env.PLAYWRIGHT_CHROMIUM, options: { executablePath: process.env.PLAYWRIGHT_CHROMIUM, args } }] : []),
    { label: "Playwright's Chromium", options: { args } },
    ...INSTALLED_BROWSERS.filter((path) => existsSync(path)).map((path) => ({ label: path, options: { executablePath: path, args } })),
  ];
  const errors: string[] = [];
  for (const t of tries) {
    try {
      const browser = await chromium.launch(t.options);
      if (t.label !== "Playwright's Chromium") console.log(`drawing in ${t.label}`);
      return browser;
    } catch (error) {
      errors.push(`${t.label}: ${String(error).split("\n")[0]}`);
    }
  }
  throw new Error(
    "No Chromium-based browser found to draw the exercises. Install Google Chrome, or set PLAYWRIGHT_CHROMIUM to a Chrome, Chromium, Edge or Brave executable.\n" +
      errors.join("\n"),
  );
}

/** The exercise as drawn, with the key's answers on its items. */
function merge(f: Fragment, d: Drawn, key: KeyExercise | undefined, image: string, instruction: string, report: EpubReport): BookExercise {
  const answers = new Map((key?.items ?? []).map((i) => [String(Number(i.n)), i.answer.trim()]));
  const items = d.items.map((it) => ({ n: it.n, answer: answers.get(it.n) ?? "", gaps: it.gaps }));
  // Items of the key the drawing does not number (a list drawn as a picture): a field under it, or on
  // the picture's lines. When the page numbers its items, a key's extra item has no question: left out.
  if (d.items.length === 0) for (const [n, answer] of answers) items.push({ n, answer, gaps: [] });
  items.sort((a, b) => Number(a.n) - Number(b.n));
  // Blanks in a paragraph, as many as the items still without one: theirs, in order.
  const bare = items.filter((i) => i.gaps.length === 0);
  if (d.loose.length > 0 && d.loose.length === bare.length) bare.forEach((it, i) => it.gaps.push(d.loose[i]!));
  // Lines drawn in a picture, as many as the items still without one: theirs, in reading order.
  // Lines on one row are one item's ("puede … / tenemos": two lines for two verbs).
  else if (d.drawnLines.length > 0 && d.drawnLines.length === bare.length) {
    const lines = columnsFirst(d.drawnLines);
    bare.forEach((it, i) => it.gaps.push(lines[i]!));
  }
  else if (d.drawnLines.length > 0) {
    const rows: Gap[][] = [];
    for (const line of d.drawnLines) {
      const row = rows[rows.length - 1];
      if (row && Math.abs(row[0]![1] - line[1]) < 0.012) row.push(line);
      else rows.push([line]);
    }
    if (rows.length === bare.length) bare.forEach((it, i) => it.gaps.push(...rows[i]!));
  }

  const keyed = Boolean(key) && answers.size > 0;
  const open = !keyed;
  if (key) report.keyed++;
  if (open) report.open++;
  for (const it of items) {
    if (it.gaps.length > 0) report.fields++;
    else report.under++;
  }
  const missing = [...answers.keys()].filter((n) => !d.items.some((i) => i.n === n));
  const unkeyed = keyed ? d.items.filter((i) => !answers.has(i.n)).map((i) => i.n) : [];
  if ((missing.length && d.items.length) || unkeyed.length) report.mismatched.push(`${f.id}: key only ${missing.join(",") || "–"}; page only ${unkeyed.join(",") || "–"}`);
  return {
    id: f.id,
    unit: f.unit,
    page: f.page,
    instruction,
    image,
    width: d.width,
    height: d.height,
    open,
    note: "",
    keyText: (key?.text ?? "").slice(0, 5000),
    items: items.slice(0, 80),
  };
}

const main = process.argv[1] ?? "";
if (/exercises-epub\.[jt]s$/.test(main) && main === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const flag = (name: string, fallback: string): string => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 && args[i + 1] ? args[i + 1]! : fallback;
  };
  const epub = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
  if (!epub) {
    console.error('usage: npm run exercises:epub -- book.epub [--id complete-spanish-grammar] [--title "…"] [--source "…"] [--level "…"] [--language es] [--out data/exercises/<id>] [--only 4.11,4.12] [--report]');
    process.exit(2);
  }
  const id = flag("id", "complete-spanish-grammar");
  const report = await extractEpub(epub, {
    id,
    title: flag("title", "Practice Makes Perfect: Complete Spanish Grammar"),
    source: flag("source", "Complete Spanish Grammar"),
    level: flag("level", "A2–B2"),
    language: flag("language", "es"),
    out: flag("out", `data/exercises/${id}`),
    only: flag("only", "").split(",").filter(Boolean),
  });
  console.log(
    `${report.book}: ${report.units} units, ${report.exercises} exercises (${report.keyed} with a key, ${report.open} answered freely); ` +
      `${report.fields} items with a field on the page, ${report.under} under it`,
  );
  if (args.includes("--report")) for (const line of report.mismatched) console.log(`  ${line}`);
  else if (report.mismatched.length) console.log(`  ${report.mismatched.length} exercises whose items differ from the key's: --report lists them`);
  console.log(`next: npm run exercises:import -- ${flag("out", `data/exercises/${id}`)}`);
}
