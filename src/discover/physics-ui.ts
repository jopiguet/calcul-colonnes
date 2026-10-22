/**
 * What the physics labs share, on top of ./lab.ts: sliders that move a
 * drawing as they are dragged, SVG drawing, tables, formulas, verdicts and
 * the head of a lab. The physics labs have no experiment number: their
 * trials are not random, the same settings give the same result.
 */
import katex from "katex";
import "katex/dist/katex.min.css";
import { el } from "../dom";
import { control } from "./lab";
import { pt } from "./physics-i18n";

const NS = "http://www.w3.org/2000/svg";

/** The lab's title. */
export function physicsHead(title: string): HTMLElement {
  const head = el("div", "discover-head");
  head.append(el("h1", "title", title));
  return head;
}

/** An SVG drawing with a label for screen readers. */
export function drawing(cls: string, width: number, height: number, aria: string): SVGSVGElement {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("class", cls);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", aria);
  return svg;
}

/** Adds an SVG element to a parent, with its attributes and optional text. */
export function shape<K extends keyof SVGElementTagNameMap>(
  parent: SVGElement,
  tag: K,
  attrs: Record<string, string | number>,
  text?: string,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  parent.append(node);
  return node;
}

/** Points as an SVG "points" attribute. */
export const points = (list: [number, number][]): string => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/**
 * A labelled slider. While it is dragged, `onInput` updates the lab's state
 * and redraws what depends on it (not the slider, which would lose the drag);
 * the shown value follows.
 */
export function slider(opts: {
  label: string;
  key: string;
  min: number;
  max: number;
  step: number;
  value: number;
  format: (value: number) => string;
  onInput: (value: number) => void;
}): HTMLElement {
  const field = el("label", "field discover-slider physics-slider");
  field.append(el("span", "field-label", opts.label));
  const row = el("span", "discover-slider-row");
  const input = el("input", "discover-range");
  input.type = "range";
  input.min = String(opts.min);
  input.max = String(opts.max);
  input.step = String(opts.step);
  input.value = String(opts.value);
  input.dataset.focus = opts.key;
  input.name = opts.key;
  const output = el("output", "discover-range-value", opts.format(opts.value));
  input.addEventListener("input", () => {
    const v = Number(input.value);
    output.textContent = opts.format(v);
    input.setAttribute("aria-valuetext", opts.format(v));
    opts.onInput(v);
  });
  input.setAttribute("aria-valuetext", opts.format(opts.value));
  row.append(input, output);
  field.append(row);
  return field;
}

/** A switch shown as a toggle button. */
export function toggle(label: string, key: string, on: boolean, onToggle: () => void): HTMLButtonElement {
  const b = control(`segment physics-toggle${on ? " on" : ""}`, label, key, onToggle);
  b.setAttribute("aria-pressed", String(on));
  return b;
}

/** A table with a header row; `mark` rows are emphasised. */
export function table(cls: string, headers: string[], rows: string[][], mark: (i: number) => boolean = () => false): HTMLElement {
  const wrap = el("div", "physics-table-wrap");
  const t = el("table", `discover-table ${cls}`);
  const head = el("thead");
  const hr = el("tr");
  for (const h of headers) {
    const th = el("th", "", h);
    th.scope = "col";
    hr.append(th);
  }
  head.append(hr);
  const body = el("tbody");
  rows.forEach((row, i) => {
    const tr = el("tr", mark(i) ? "is-target" : "");
    row.forEach((cell, j) => tr.append(el(j === 0 ? "th" : "td", "", cell)));
    body.append(tr);
  });
  t.append(head, body);
  wrap.append(t);
  return wrap;
}

/** A formula, displayed. */
export function formula(tex: string): HTMLElement {
  const box = el("p", "discover-formula");
  katex.render(tex, box, { throwOnError: false, displayMode: true });
  return box;
}

/** A sentence about a prediction: right, wrong, or neutral. */
export function verdict(text: string, good: boolean | null = null): HTMLElement {
  return el("p", `discover-verdict${good === null ? "" : good ? " good" : " bad"}`, text);
}

/** The predictions, recalled above the experiment. */
export function mineLine(items: string[]): HTMLElement {
  return el("p", "discover-mine", pt("mine", { list: items.join(" · ") }));
}

/** A step's button that is enabled once its condition holds, with a hint otherwise. */
export function gatedButton(label: string, key: string, ready: boolean, hint: string, onClick: () => void): HTMLElement[] {
  const b = control("primary", label, key, onClick);
  b.disabled = !ready;
  return ready ? [b] : [b, el("p", "hint", hint)];
}

/** "Start again", at the end of a lab. */
export function restartPanel(checked: boolean, onRestart: () => void): HTMLElement {
  const box = el("div", "discover-again");
  box.append(control(checked ? "primary" : "ghost", pt("restart"), "again", onRestart), el("p", "hint", pt("restartHint")));
  return box;
}

/** Replaces the element matching `selector` inside `root` by a fresh one: a partial redraw. */
export function replace(root: ParentNode, selector: string, next: Element): void {
  root.querySelector(selector)?.replaceWith(next);
}
