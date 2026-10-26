import type { Chart, Graph } from "../shared/quiz";
import { currentLang } from "./i18n";

/**
 * Draws the graphs of the QCM as inline SVG: curves on a grid with one line
 * per unit, a plane in space through its three intercepts (cavalier
 * projection), or an economic diagram (labelled axes, named curves, shaded
 * areas). Colours come from CSS classes, so light and dark themes apply.
 */

const NS = "http://www.w3.org/2000/svg";
let clipIds = 0;

function node<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, text?: string): SVGElementTagNameMap[K] {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (text !== undefined) n.textContent = text;
  return n;
}

const fmt = (v: number): string => (Math.round(v * 100) / 100).toString();

export function drawGraph(graph: Graph, label: string, size: "large" | "small" = "large"): SVGSVGElement {
  return graph.type === "curves" ? curves(graph, label, size) : graph.type === "chart" ? chart(graph, label, size) : plane(graph, label, size);
}

/** An economic diagram, scaled to a fixed frame whatever its units. */
function chart(g: Chart, label: string, size: "large" | "small"): SVGSVGElement {
  const left = 36;
  const right = 22;
  const top = 16;
  const bottom = 26;
  const [x0, x1] = g.x;
  const [y0, y1] = g.y;
  // A fixed frame, or the same scale on both axes (angles, circles, polar curves).
  const plotW = g.square ? 240 : 300 - left - right;
  const plotH = g.square ? Math.min(300, Math.max(120, (plotW * (y1 - y0)) / (x1 - x0))) : 220 - top - bottom;
  const width = left + plotW + right;
  const height = top + plotH + bottom;
  const px = (x: number): number => left + ((x - x0) / (x1 - x0)) * plotW;
  const py = (y: number): number => height - bottom - ((y - y0) / (y1 - y0)) * plotH;
  const svg = node("svg", { viewBox: `0 0 ${width} ${height}`, class: `graph chart ${size}${g.square ? " square" : ""}`, role: "img", "aria-label": label });
  const id = `graph-clip-${++clipIds}`;
  const defs = node("defs", {});
  const clip = node("clipPath", { id });
  clip.append(node("rect", { x: px(x0), y: py(y1), width: px(x1) - px(x0), height: py(y0) - py(y1) }));
  const hatch = node("pattern", { id: `${id}-hatch`, width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" });
  hatch.append(node("line", { x1: 0, y1: 0, x2: 0, y2: 6, class: "c-hatch" }));
  defs.append(clip, hatch);
  svg.append(defs);

  // A faint grid, under everything.
  if (g.grid && g.grid > 0) {
    const step = g.grid;
    for (let x = Math.ceil(x0 / step) * step; x <= x1 + 1e-9; x += step) svg.append(node("line", { x1: px(x), y1: py(y0), x2: px(x), y2: py(y1), class: "g-grid" }));
    for (let y = Math.ceil(y0 / step) * step; y <= y1 + 1e-9; y += step) svg.append(node("line", { x1: px(x0), y1: py(y), x2: px(x1), y2: py(y), class: "g-grid" }));
  }

  // Areas first, under the curves.
  for (const a of g.areas ?? []) {
    const pts = a.points.map(([x, y]) => `${fmt(px(x))},${fmt(py(y))}`).join(" ");
    svg.append(node("polygon", { points: pts, class: `c-area c-${a.style}` }));
    if (a.style === "loss") svg.append(node("polygon", { points: pts, fill: `url(#${id}-hatch)`, class: "c-area-hatch" }));
  }

  // Axes with arrows, names and values: along the frame, or through the origin.
  const origin = g.axes === "origin";
  const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
  const ax = px(origin ? clamp(0, x0, x1) : x0);
  const ay = py(origin ? clamp(0, y0, y1) : y0);
  svg.append(node("line", { x1: px(x0), y1: ay, x2: px(x1) + 10, y2: ay, class: "c-axis" }));
  svg.append(node("line", { x1: ax, y1: py(y0), x2: ax, y2: py(y1) - 10, class: "c-axis" }));
  svg.append(node("path", { d: `M${fmt(px(x1) + 10)} ${fmt(ay)} l-6 -3 v6 z`, class: "c-arrow" }));
  svg.append(node("path", { d: `M${fmt(ax)} ${fmt(py(y1) - 10)} l-3 6 h6 z`, class: "c-arrow" }));
  svg.append(node("text", { x: px(x1) + 12, y: ay + 16, class: "c-axis-label", "text-anchor": "end" }, g.xLabel));
  svg.append(node("text", { x: ax + 7, y: py(y1) - 4, class: "c-axis-label", "text-anchor": "start" }, g.yLabel));
  for (const t of g.xTicks ?? []) {
    svg.append(node("line", { x1: px(t), y1: ay, x2: px(t), y2: ay + 3, class: "c-axis" }));
    svg.append(node("text", { x: px(t), y: ay + 13, class: "c-tick", "text-anchor": "middle" }, fmtTick(t)));
  }
  for (const t of g.yTicks ?? []) {
    svg.append(node("line", { x1: ax - 3, y1: py(t), x2: ax, y2: py(t), class: "c-axis" }));
    svg.append(node("text", { x: ax - 5, y: py(t) + 3.5, class: "c-tick", "text-anchor": "end" }, fmtTick(t)));
  }

  for (const d of g.drops ?? []) {
    svg.append(node("path", { d: `M${fmt(px(d.x))} ${fmt(ay)} V${fmt(py(d.y))} H${fmt(ax)}`, class: "c-drop" }));
  }

  // A slope field or a vector field: short segments of one length on a grid.
  if (g.field) {
    const count = g.field.count ?? 9;
    const cellX = plotW / count;
    const cellY = plotH / count;
    const half = 0.36 * Math.min(cellX, cellY);
    const field = node("g", { class: g.field.arrows ? "c-field is-vectors" : "c-field" });
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        const x = x0 + ((i + 0.5) * (x1 - x0)) / count;
        const y = y0 + ((j + 0.5) * (y1 - y0)) / count;
        const [dx, dy] = g.field.fn(x, y);
        // In screen units: the direction as drawn, whatever the scales.
        const sx = (dx * plotW) / (x1 - x0);
        const sy = (-dy * plotH) / (y1 - y0);
        const norm = Math.hypot(sx, sy);
        if (!Number.isFinite(norm) || norm === 0) {
          field.append(node("circle", { cx: fmt(px(x)), cy: fmt(py(y)), r: 1, class: "c-field-dot" }));
          continue;
        }
        const ux = (sx / norm) * half;
        const uy = (sy / norm) * half;
        const cx = px(x);
        const cy = py(y);
        if (g.field.arrows) {
          field.append(node("line", { x1: fmt(cx - ux), y1: fmt(cy - uy), x2: fmt(cx + ux), y2: fmt(cy + uy), class: "c-field-line" }));
          const angle = (Math.atan2(uy, ux) * 180) / Math.PI;
          field.append(node("path", { d: "M0 0 l-4 -2.2 v4.4 z", transform: `translate(${fmt(cx + ux)} ${fmt(cy + uy)}) rotate(${fmt(angle)})`, class: "c-field-head" }));
        } else {
          field.append(node("line", { x1: fmt(cx - ux), y1: fmt(cy - uy), x2: fmt(cx + ux), y2: fmt(cy + uy), class: "c-field-line" }));
        }
      }
    }
    svg.append(field);
  }

  // Curves, clipped to the frame; each label at its last visible point.
  const layer = node("g", { "clip-path": `url(#${id})` });
  const labels: { x: number; y: number; text: string; style: string }[] = [];
  for (const c of g.curves) {
    let pts: [number, number][] = c.points ?? [];
    if (c.fn) {
      pts = [];
      for (let i = 0; i <= 240; i++) {
        const x = x0 + ((x1 - x0) * i) / 240;
        const y = c.fn(x);
        if (Number.isFinite(y)) pts.push([x, y]);
      }
    }
    const inside = pts.filter(([x, y]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
    if (pts.length < 2) continue;
    // A jump (a gap in x, or an undefined value between samples) breaks the line.
    let d = "";
    pts.forEach(([x, y], i) => {
      const prev = pts[i - 1];
      const gap = !prev || (c.fn !== undefined && x - prev[0] > (1.5 * (x1 - x0)) / 240);
      d += `${gap ? "M" : "L"}${fmt(px(x))} ${fmt(py(Math.max(y0 - (y1 - y0), Math.min(y1 + (y1 - y0), y))))}`;
    });
    layer.append(node("path", { d, class: c.style === "guide" ? "c-guide" : c.style === "alt" ? "c-curve c-alt" : "c-curve" }));
    const end = inside[inside.length - 1];
    if (c.label && end) labels.push({ x: px(end[0]), y: py(end[1]), text: c.label, style: c.style ?? "main" });
  }
  svg.append(layer);
  for (const l of labels) {
    const x = Math.min(width - 2, l.x + 3);
    const y = Math.max(10, Math.min(height - bottom - 4, l.y - 3));
    svg.append(node("text", { x, y, class: `c-label c-label-${l.style}`, "text-anchor": l.x > width - 30 ? "end" : "start" }, l.text));
  }

  // Vectors: arrows with their name at the tip.
  for (const v of g.vectors ?? []) {
    const [ax0, ay0] = [px(v.from[0]), py(v.from[1])];
    const [ax1, ay1] = [px(v.to[0]), py(v.to[1])];
    const angle = (Math.atan2(ay1 - ay0, ax1 - ax0) * 180) / Math.PI;
    const cls = v.style === "alt" ? "c-vector c-alt" : "c-vector";
    svg.append(node("line", { x1: fmt(ax0), y1: fmt(ay0), x2: fmt(ax1), y2: fmt(ay1), class: cls }));
    svg.append(node("path", { d: "M0 0 l-8 -4 v8 z", transform: `translate(${fmt(ax1)} ${fmt(ay1)}) rotate(${fmt(angle)})`, class: `${cls} c-vector-head` }));
    if (v.label) {
      const dx = ax1 - ax0;
      const dy = ay1 - ay0;
      const n = Math.hypot(dx, dy) || 1;
      svg.append(node("text", { x: fmt(ax1 + (dx / n) * 10), y: fmt(ay1 + (dy / n) * 10 + 4), class: `c-label c-label-${v.style ?? "main"}`, "text-anchor": "middle" }, v.label));
    }
  }

  for (const a of g.areas ?? []) {
    if (!a.label) continue;
    const cx = a.points.reduce((s, [x]) => s + x, 0) / a.points.length;
    const cy = a.points.reduce((s, [, y]) => s + y, 0) / a.points.length;
    svg.append(node("text", { x: px(cx), y: py(cy) + 4, class: "c-area-label", "text-anchor": "middle" }, a.label));
  }
  for (const p of g.points ?? []) {
    svg.append(node("circle", { cx: px(p.x), cy: py(p.y), r: p.open ? 3.4 : 3, class: p.open ? "g-point g-point-open" : "g-point" }));
    if (p.label) svg.append(node("text", { x: px(p.x) + 5, y: py(p.y) - 5, class: "c-label" }, p.label));
  }
  return svg;
}

/** A tick label, with a decimal comma in French and Spanish. */
const fmtTick = (v: number): string => {
  const text = Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
  return currentLang() === "en" ? text : text.replace(".", ",");
};

function curves(g: Extract<Graph, { type: "curves" }>, label: string, size: "large" | "small"): SVGSVGElement {
  const unit = 20;
  const pad = 10;
  const [x0, x1] = g.x;
  const [y0, y1] = g.y;
  const width = (x1 - x0) * unit + 2 * pad;
  const height = (y1 - y0) * unit + 2 * pad;
  const px = (x: number): number => pad + (x - x0) * unit;
  const py = (y: number): number => pad + (y1 - y) * unit;

  const svg = node("svg", { viewBox: `0 0 ${width} ${height}`, class: `graph ${size}`, role: "img", "aria-label": label });
  const id = `graph-clip-${++clipIds}`;
  const clip = node("clipPath", { id });
  clip.append(node("rect", { x: px(x0), y: py(y1), width: (x1 - x0) * unit, height: (y1 - y0) * unit }));
  svg.append(clip);

  // Grid, then axes with a few numbers.
  for (let x = Math.ceil(x0); x <= x1; x++) svg.append(node("line", { x1: px(x), y1: py(y0), x2: px(x), y2: py(y1), class: "g-grid" }));
  for (let y = Math.ceil(y0); y <= y1; y++) svg.append(node("line", { x1: px(x0), y1: py(y), x2: px(x1), y2: py(y), class: "g-grid" }));
  if (y0 <= 0 && y1 >= 0) svg.append(node("line", { x1: px(x0), y1: py(0), x2: px(x1), y2: py(0), class: "g-axis" }));
  if (x0 <= 0 && x1 >= 0) svg.append(node("line", { x1: px(0), y1: py(y0), x2: px(0), y2: py(y1), class: "g-axis" }));
  for (let x = Math.ceil(x0); x <= x1; x++) {
    if (x === 0 || x % 2 !== 0) continue;
    svg.append(node("text", { x: px(x), y: py(0) + 11, class: "g-tick", "text-anchor": "middle" }, String(x)));
  }
  for (let y = Math.ceil(y0); y <= y1; y++) {
    if (y === 0 || y % 2 !== 0) continue;
    svg.append(node("text", { x: px(0) - 4, y: py(y) + 3.5, class: "g-tick", "text-anchor": "end" }, String(y)));
  }

  // Curves: sampled finely, broken where undefined or far outside (an asymptote).
  const layer = node("g", { "clip-path": `url(#${id})` });
  for (const c of g.curves) {
    let d = "";
    let pen = false;
    const steps = 480;
    for (let i = 0; i <= steps; i++) {
      const x = x0 + ((x1 - x0) * i) / steps;
      const y = c.fn(x);
      const ok = Number.isFinite(y) && y > y0 - 6 && y < y1 + 6;
      if (!ok) {
        pen = false;
        continue;
      }
      d += `${pen ? "L" : "M"}${fmt(px(x))} ${fmt(py(y))}`;
      pen = true;
    }
    layer.append(node("path", { d, class: c.style === "guide" ? "g-guide" : "g-curve" }));
  }
  svg.append(layer);

  for (const p of g.points ?? []) {
    svg.append(node("circle", { cx: px(p.x), cy: py(p.y), r: 3.2, class: "g-point" }));
    if (p.label) svg.append(node("text", { x: px(p.x) + 5, y: py(p.y) - 5, class: "g-label" }, p.label));
  }
  return svg;
}

function plane(g: Extract<Graph, { type: "plane" }>, label: string, size: "large" | "small"): SVGSVGElement {
  const width = 170;
  const height = 150;
  const scale = 62 / g.extent;
  const origin = { x: 84, y: 82 };
  // Cavalier projection: y to the right, z up, x towards the viewer (down and left).
  const project = (x: number, y: number, z: number): [number, number] => [
    origin.x + scale * (y - 0.55 * x),
    origin.y + scale * (0.45 * x - z),
  ];
  const svg = node("svg", { viewBox: `0 0 ${width} ${height}`, class: `graph plane ${size}`, role: "img", "aria-label": label });
  const line = (a: [number, number], b: [number, number], cls: string): SVGLineElement =>
    node("line", { x1: fmt(a[0]), y1: fmt(a[1]), x2: fmt(b[0]), y2: fmt(b[1]), class: cls });

  const reach = g.extent * 1.12;
  const axes: [string, (t: number) => [number, number]][] = [
    ["x", (t) => project(t, 0, 0)],
    ["y", (t) => project(0, t, 0)],
    ["z", (t) => project(0, 0, t)],
  ];
  for (const [name, at] of axes) {
    svg.append(line(at(-reach * 0.6), at(0), "g-axis-back"), line(at(0), at(reach), "g-axis"));
    for (let t = 1; t <= g.extent; t++) {
      const [cx, cy] = at(t);
      svg.append(node("circle", { cx: fmt(cx), cy: fmt(cy), r: 1.1, class: "g-tick-dot" }));
    }
    // The axis name just past its end, kept inside the picture.
    const [lx, ly] = at(reach + 0.1 * g.extent);
    const x = Math.min(width - 6, Math.max(6, lx));
    const y = Math.min(height - 3, Math.max(12, ly + 4));
    svg.append(node("text", { x: fmt(x), y: fmt(y), class: "g-label", "text-anchor": name === "y" ? "end" : "middle" }, name));
  }

  const [u, v, w] = g.intercepts;
  const corners = [project(u, 0, 0), project(0, v, 0), project(0, 0, w)];
  svg.append(node("polygon", { points: corners.map(([a, b]) => `${fmt(a)},${fmt(b)}`).join(" "), class: "g-plane" }));
  const names: [number, [number, number], [number, number]][] = [
    [u, corners[0]!, [10, 4]],
    [v, corners[1]!, [2, 16]],
    [w, corners[2]!, [-11, 5]],
  ];
  for (const [value, [cx, cy], [dx, dy]] of names) {
    svg.append(node("circle", { cx: fmt(cx), cy: fmt(cy), r: 3, class: "g-point" }));
    svg.append(node("text", { x: fmt(cx + dx), y: fmt(cy + dy), class: "g-label", "text-anchor": "middle" }, String(value)));
  }
  return svg;
}
