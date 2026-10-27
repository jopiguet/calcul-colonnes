/**
 * npm run check:courses: the three languages of each course (src/courses)
 * have the same shape. Same headings by level, same code blocks (line for
 * line, comments aside), same links, same tables (rows and columns), same
 * inline code and the same TeX, in the same order; no raw dollar sign
 * outside code and TeX (it would open TeX); every topic of a course's test
 * points to a section that exists.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseMarkdown, type Block } from "../src/markdown-parse";
import { TOPICS } from "../shared/quiz";
import { sectionOf } from "../src/courses/sections";

const ROOT = join(import.meta.dirname, "..", "src", "courses");
const LANGS = ["en", "fr", "es"] as const;
let failures = 0;
let checks = 0;
const fail = (message: string): void => {
  failures++;
  console.error(`✗ ${message}`);
};
const check = (ok: boolean, message: string): void => {
  checks++;
  if (!ok) fail(message);
};

/** A code line without its comment, so a translated comment does not count. */
const codeLine = (line: string): string =>
  /^\s*(\/\/|#)\s/.test(line) ? "" : line.replace(/\s+(\/\/|#)\s.*$/, "").replace(/\/\*.*\*\//, "").trimEnd();

interface Shape {
  headings: number[];
  code: string[];
  links: string[];
  tables: string[];
  inlineCode: string[];
  math: string[];
  sections: number;
}

function inlineRuns(text: string): { code: string[]; math: string[]; links: string[]; dollars: number } {
  const code = [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
  const rest = text.replace(/`[^`]+`/g, "");
  const math = [...rest.matchAll(/\$([^$\n]+)\$/g)].map((m) => m[1]!);
  const dollars = (rest.replace(/\$[^$\n]+\$/g, "").match(/\$/g) ?? []).length;
  const links = [...rest.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]!);
  return { code, math, links, dollars };
}

function shape(blocks: Block[], where: string): Shape {
  const s: Shape = { headings: [], code: [], links: [], tables: [], inlineCode: [], math: [], sections: 0 };
  const texts: string[] = [];
  for (const b of blocks) {
    if (b.kind === "heading") {
      s.headings.push(b.level);
      if (b.level === 2) s.sections++;
      texts.push(b.text);
    } else if (b.kind === "paragraph") texts.push(b.text);
    else if (b.kind === "list") texts.push(...b.items);
    else if (b.kind === "table") {
      s.tables.push(`${b.header.length}×${b.rows.length}`);
      for (const row of b.rows) check(row.length === b.header.length, `${where}: a table row has ${row.length} cells for ${b.header.length} columns`);
      texts.push(...b.header, ...b.rows.flat());
    } else if (b.kind === "code") s.code.push(b.text.split("\n").map(codeLine).join("\n"));
    else s.math.push(b.tex);
  }
  for (const t of texts) {
    const runs = inlineRuns(t);
    s.inlineCode.push(...runs.code);
    s.math.push(...runs.math);
    s.links.push(...runs.links);
    check(runs.dollars === 0, `${where}: a bare $ outside code and TeX in “${t.slice(0, 60)}”`);
  }
  return s;
}

const same = (a: unknown[], b: unknown[]): boolean => a.length === b.length && a.every((x, i) => x === b[i]);

for (const id of readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
  const shapes = Object.fromEntries(
    LANGS.map((lang) => {
      const blocks = parseMarkdown(readFileSync(join(ROOT, id, `${lang}.md`), "utf8"));
      check(blocks[0]?.kind === "heading" && blocks[0].level === 1, `${id}/${lang}: starts with its # title`);
      return [lang, shape(blocks, `${id}/${lang}`)];
    }),
  ) as Record<(typeof LANGS)[number], Shape>;
  const en = shapes.en;
  for (const lang of ["fr", "es"] as const) {
    const other = shapes[lang];
    const name = `${id}/${lang}`;
    check(same(en.headings, other.headings), `${name}: headings ${other.headings.join("")} vs en ${en.headings.join("")}`);
    check(en.code.length === other.code.length, `${name}: ${other.code.length} code blocks vs ${en.code.length}`);
    en.code.forEach((code, i) => check(code === other.code[i], `${name}: code block ${i + 1} differs from English`));
    check(same(en.links, other.links), `${name}: links differ from English`);
    check(same(en.tables, other.tables), `${name}: tables ${other.tables.join(" ")} vs en ${en.tables.join(" ")}`);
    check(same(en.inlineCode, other.inlineCode), `${name}: inline code differs from English (${other.inlineCode.length} vs ${en.inlineCode.length}${(() => {
      const i = en.inlineCode.findIndex((c, k) => c !== other.inlineCode[k]);
      return i >= 0 ? `, first at ${i}: ${en.inlineCode[i]} / ${other.inlineCode[i]}` : "";
    })()})`);
    // Formulas may use each language's letters (M–C–M′ is A–M–A′ in French): as many, in the same places.
    check(en.math.length === other.math.length, `${name}: ${other.math.length} formulas vs ${en.math.length} in English`);
  }
  // Every topic that points into this course points to a section it has.
  const prefix = id === "marx" ? "marx" : id;
  for (const topic of TOPICS.filter((t) => t.startsWith(prefix))) {
    const section = sectionOf(topic, "");
    check(section !== null && section < en.sections, `${id}: topic ${topic} points to section ${section} of ${en.sections}`);
  }
  console.log(`${id}: ${en.sections} sections, ${en.code.length} code blocks, ${en.tables.length} tables, ${en.links.length} links, ${en.math.length} formulas`);
}

console.log(failures === 0 ? `✓ courses: ${checks} checks` : `✗ ${failures} of ${checks} checks failed`);
process.exit(failures === 0 ? 0 : 1);
