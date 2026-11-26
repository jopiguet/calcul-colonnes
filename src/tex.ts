/**
 * KaTeX, loaded the first time a formula is shown: most pages have none, and
 * it is a quarter of a megabyte. Until it is there a formula shows its TeX.
 */
type Katex = typeof import("katex").default;

let katex: Katex | null = null;
let loading: Promise<Katex> | null = null;

export const loadKatex = (): Promise<Katex> => (loading ??= import("katex").then((module) => (katex = module.default)));

/** Puts a formula into a node: at once if KaTeX is loaded, as soon as it is otherwise. */
export function renderTex(node: HTMLElement, source: string, display: boolean): void {
  const draw = (k: Katex): void => {
    node.innerHTML = k.renderToString(source, { throwOnError: false, displayMode: display });
    node.classList.remove("math-pending");
  };
  if (katex) return draw(katex);
  node.textContent = source;
  node.classList.add("math-pending");
  loadKatex().then(draw, () => undefined); // offline: the TeX stays
}
