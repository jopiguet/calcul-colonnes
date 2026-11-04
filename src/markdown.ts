/**
 * The Markdown of a course (src/courses), as DOM nodes: headings, paragraphs,
 * lists (bullets, numbers, checkboxes), tables, fenced code, and inline
 * **bold**, *italic*, `code`, [links](https://…) and $TeX$. Code is read
 * first, so `$HOME` in backticks stays code. Nothing goes through innerHTML
 * but KaTeX's own output.
 */
import katex from "katex";
import "katex/dist/katex.min.css";
import { el } from "./dom";

export { parseMarkdown, type Block } from "./markdown-parse";
import type { Block } from "./markdown-parse";

function tex(source: string, display: boolean): HTMLElement {
  const node = el(display ? "div" : "span", display ? "math display" : "math");
  node.innerHTML = katex.renderToString(source, { throwOnError: false, displayMode: display });
  return node;
}

/** A code or math run, set aside while emphasis and links are read. */
type Atom = { kind: "code" | "math"; value: string };
const MARK = "\u0000";

/**
 * Inline runs. Code spans are set aside first, then $TeX$, each as a marker,
 * so `**\`x\`**` is bold code and `` `$HOME` `` stays code; links, bold and
 * italic are read on what is left.
 */
export function inline(text: string, target: HTMLElement = el("span")): HTMLElement {
  const atoms: Atom[] = [];
  const keep = (kind: Atom["kind"], value: string): string => `${MARK}${atoms.push({ kind, value }) - 1}${MARK}`;
  const marked = text
    .replace(/`([^`]+)`/g, (_, code: string) => keep("code", code))
    .replace(/\$([^$\n]+)\$/g, (_, math: string) => keep("math", math));
  emphasis(marked, target, atoms);
  return target;
}

/**
 * Hieroglyphs and cuneiform signs: drawn larger than the text around them, in their own font.
 * Persian, Arabic and Hebrew: each run of words set apart, right to left, so it reads in its order inside a left-to-right line.
 * Malayalam: each run of words in its font, a little larger, since its letters are small beside Latin ones.
 */
const RTL = "\\u0590-\\u05FF\\uFB1D-\\uFB4F\\u0600-\\u06FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF";
// Commas and stops between right-to-left words stay in the run; a colon or semicolon ends it, since it
// belongs to the sentence around it. A run may end on "…" (the gap of an
// exercise), "?" or "!", so that they sit at the end of the right-to-left words.
const ML = "\\u0D00-\\u0D7F";
const SIGNS = new RegExp(`([\\u{13000}-\\u{1345F}\\u{12000}-\\u{1254F}]+|[${ML}](?:[${ML}\\u200C\\u200D ,.?!]*[${ML}])?|[${RTL}](?:[${RTL}\\u200C\\u200D ,.?!]*(?:[${RTL}]|[…?!]))?)`, "u");

function signs(text: string, target: HTMLElement): void {
  text.split(SIGNS).forEach((piece, i) => {
    if (!piece) return;
    if (i % 2 === 0) target.append(piece);
    else if (/[\u0D00-\u0D7F]/u.test(piece)) {
      const run = el("span", "script-malayalam", piece);
      run.lang = "ml";
      target.append(run);
    } else if (/[\u0590-\u05FF\uFB1D-\uFB4F\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/u.test(piece)) {
      const run = el("bdi", /[\u0590-\u05FF\uFB1D-\uFB4F]/u.test(piece) ? "script-hebrew" : "script-arabic", piece);
      run.dir = "rtl";
      target.append(run);
    } else target.append(el("span", /[\u{13000}-\u{1345F}]/u.test(piece) ? "script-signs hiero" : "script-signs cuneiform", piece));
  });
}

function plain(text: string, target: HTMLElement, atoms: Atom[]): void {
  text.split(new RegExp(`${MARK}(\\d+)${MARK}`)).forEach((piece, i) => {
    if (i % 2 === 0) {
      if (piece) signs(piece, target);
      return;
    }
    const atom = atoms[Number(piece)]!;
    target.append(atom.kind === "code" ? el("code", undefined, atom.value) : tex(atom.value, false));
  });
}

function emphasis(text: string, target: HTMLElement, atoms: Atom[]): void {
  // Italics may hold bold (*rosa **puellae***): tried first, so its asterisks are not read as bold.
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*((?:[^*\s]|\*\*[^*]+\*\*)(?:[^*]|\*\*[^*]+\*\*)*?)\*(?!\*)|\*\*(.+?)\*\*/g;
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    if (m.index > last) plain(text.slice(last, m.index), target, atoms);
    if (m[1] !== undefined) {
      const link = el("a");
      plain(m[1], link, atoms);
      link.href = m[2]!;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      target.append(link);
    } else if (m[4] !== undefined) {
      const strong = el("strong");
      emphasis(m[4], strong, atoms);
      target.append(strong);
    } else {
      const em = el("em");
      emphasis(m[3]!, em, atoms);
      target.append(em);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) plain(text.slice(last), target, atoms);
}

/** One block as a node; headings get the id given. */
export function renderBlock(block: Block, id?: string): HTMLElement {
  switch (block.kind) {
    case "heading": {
      const tag = (["h2", "h2", "h3", "h4"] as const)[block.level - 1] ?? "h4";
      const node = inline(block.text, el(tag, `course-h${block.level}`));
      if (id) node.id = id;
      return node;
    }
    case "paragraph": {
      const p = el("p");
      block.text.split("\n").forEach((line, i) => {
        if (i) p.append(el("br"));
        inline(line, p);
      });
      return p;
    }
    case "list": {
      const list = el(block.style === "ordered" ? "ol" : "ul", block.style === "check" ? "course-checklist" : undefined);
      for (const item of block.items) {
        const li = el("li");
        if (block.style === "check") {
          const box = el("input");
          box.type = "checkbox";
          box.setAttribute("aria-hidden", "true");
          box.tabIndex = -1;
          li.append(box);
        }
        list.append(inline(item, li));
      }
      return list;
    }
    case "table": {
      const scroll = el("div", "course-table");
      const table = el("table");
      const head = el("tr");
      for (const c of block.header) head.append(inline(c, el("th")));
      const thead = el("thead");
      thead.append(head);
      const tbody = el("tbody");
      for (const row of block.rows) {
        const tr = el("tr");
        for (const c of row) tr.append(inline(c, el("td")));
        tbody.append(tr);
      }
      table.append(thead, tbody);
      scroll.append(table);
      return scroll;
    }
    case "code": {
      const pre = el("pre", "course-code");
      pre.append(el("code", undefined, block.text));
      if (block.lang) pre.dataset.lang = block.lang;
      return pre;
    }
    case "math":
      return tex(block.tex, true);
  }
}
