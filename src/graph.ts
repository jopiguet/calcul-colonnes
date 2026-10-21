import type { Graph } from "../shared/quiz";

/**
 * Draws the graphs of the QCM as inline SVG: curves on a grid with one line
 * per unit, or a plane in space through its three intercepts (cavalier
 * projection). Colours come from CSS classes, so light and dark themes apply.
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
  return graph.type === "curves" ? curves(graph, label, size) : plane(graph, label, size);
}

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
