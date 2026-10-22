/**
 * Written texts (question bank, Linux questions) mix three kinds of run:
 * plain text, inline TeX between $…$, and code between `…`. Code is read
 * first, so a `$HOME` or `echo $?` inside backticks is code, not TeX.
 */
export type RichPart = { kind: "text" | "math" | "code"; value: string };

export function richParts(text: string): RichPart[] {
  const parts: RichPart[] = [];
  text.split(/(`[^`]+`)/).forEach((chunk) => {
    if (chunk.length > 1 && chunk.startsWith("`") && chunk.endsWith("`")) {
      parts.push({ kind: "code", value: chunk.slice(1, -1) });
      return;
    }
    chunk.split(/(\$[^$]+\$)/).forEach((piece) => {
      if (piece.length > 1 && piece.startsWith("$") && piece.endsWith("$")) parts.push({ kind: "math", value: piece.slice(1, -1) });
      else if (piece) parts.push({ kind: "text", value: piece });
    });
  });
  return parts;
}

/** The code runs of a text, in order: the same in every language of a question. */
export const codeRuns = (text: string): string[] => richParts(text).filter((p) => p.kind === "code").map((p) => p.value);
