/**
 * The Markdown of a course (src/courses) as blocks: headings, paragraphs,
 * lists (bullets, numbers, checkboxes), tables, fenced code and $$ TeX $$.
 * No DOM here, so the checks (server/check-courses.ts) read it too.
 */
export type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; style: "bullet" | "ordered" | "check"; items: string[] }
  | { kind: "table"; header: string[]; rows: string[][] }
  | { kind: "code"; lang: string; text: string }
  | { kind: "math"; tex: string };

const LIST_ITEM = /^(?:(\d+)\.|-(?: \[ \])?)\s+/;

/** Splits a table row on the pipes that are not escaped. */
function cells(line: string): string[] {
  const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return inner.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
}

export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.trim() === "") {
      i++;
      continue;
    }
    const fence = /^```(\w*)\s*$/.exec(line);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i]!)) body.push(lines[i++]!);
      i++;
      blocks.push({ kind: "code", lang: fence[1] ?? "", text: body.join("\n") });
      continue;
    }
    if (line.trim() === "$$") {
      const body: string[] = [];
      i++;
      while (i < lines.length && lines[i]!.trim() !== "$$") body.push(lines[i++]!);
      i++;
      blocks.push({ kind: "math", tex: body.join("\n") });
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({ kind: "heading", level: heading[1]!.length, text: heading[2]!.trim() });
      i++;
      continue;
    }
    if (line.trimStart().startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i]!.trimStart().startsWith("|")) rows.push(cells(lines[i++]!));
      const [header = [], , ...body] = rows;
      blocks.push({ kind: "table", header, rows: body });
      continue;
    }
    if (LIST_ITEM.test(line)) {
      const style = /^\d+\./.test(line) ? "ordered" : /^- \[ \]/.test(line) ? "check" : "bullet";
      const items: string[] = [];
      while (i < lines.length && LIST_ITEM.test(lines[i]!)) {
        let item = lines[i++]!.replace(LIST_ITEM, "");
        // A continuation line, indented, belongs to the item.
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]!) && !LIST_ITEM.test(lines[i]!.trim())) item += " " + lines[i++]!.trim();
        items.push(item);
      }
      blocks.push({ kind: "list", style, items });
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i]!.trim() !== "" && !/^(#{1,4}\s|```|\||\$\$)/.test(lines[i]!) && !LIST_ITEM.test(lines[i]!)) para.push(lines[i++]!.trim());
    blocks.push({ kind: "paragraph", text: para.join(" ") });
  }
  return blocks;
}
