/**
 * React, generated: a short component, and what the page or the console
 * shows once `App` is rendered, sometimes after clicks on its button. Each
 * wrong option is what a misconception predicts: state that changes at once,
 * `0 &&` rendering nothing, effects running during render or parent first,
 * unbatched updates, a key that keeps state, refs that re-render, memo with
 * a new object, StrictMode running things once.
 *
 * The imports are left out: the hooks and `memo` come from "react". The
 * checks (`check:quiz`) type-check every program with `tsc` (strict, JSX for
 * React 19), then render it with React DOM in a DOM (jsdom), in development,
 * click the first button as many times as the question says, and compare the
 * page's text (spaces collapsed) or the console's lines (joined by spaces)
 * with the options. Lines are kept to 36 characters, to fit a phone.
 */
import type { Rng } from "./rng";
import type { Draft, Generator, Localized, MistakeKey, Option } from "./types";
import type { L3 } from "./linux/types";

const L = (t: L3): Localized => ({ en: t[0], fr: t[1], es: t[2] });

/** The longest line a program may have: it must fit a phone. */
export const REACT_LINE_MAX = 36;

/** What the program is checked against: the page's text or the console's lines. */
export type ReactShow = "page" | "log";

/** The hooks a program may use without importing them (the checks add the import). */
export const REACT_IMPORTS = 'import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";';

const NOTHING: L3 = ["nothing", "rien", "nada"];

const out = (shown: string, mistake?: MistakeKey): Option => ({
  tex: shown,
  text: shown === "" ? L(NOTHING) : { en: `\`${shown}\``, fr: `\`${shown}\``, es: `\`${shown}\`` },
  ...(mistake ? { mistake } : {}),
});

function question(show: ReactShow, clicks: number, strict: boolean): L3 {
  const times: L3 =
    clicks === 1 ? ["once", "une fois", "una vez"] : clicks === 2 ? ["twice", "deux fois", "dos veces"] : [`${clicks} times`, `${clicks} fois`, `${clicks} veces`];
  if (show === "page") {
    return clicks === 0
      ? ["What does the page show?", "Qu'affiche la page ?", "¿Qué muestra la página?"]
      : [
          `The button is clicked ${times[0]}. What does the page show?`,
          `On clique ${times[1]} sur le bouton. Qu'affiche la page ?`,
          `Se pulsa el botón ${times[2]}. ¿Qué muestra la página?`,
        ];
  }
  if (strict) {
    return [
      "`App` is rendered inside `<StrictMode>`, in development. What does the console show?",
      "`App` est rendu dans `<StrictMode>`, en développement. Qu'affiche la console ?",
      "`App` se renderiza dentro de `<StrictMode>`, en desarrollo. ¿Qué muestra la consola?",
    ];
  }
  return clicks === 0
    ? ["`App` is rendered. What does the console show?", "`App` est rendu. Qu'affiche la console ?", "Se renderiza `App`. ¿Qué muestra la consola?"]
    : [
        `\`App\` is rendered, then its button is clicked ${times[0]}. What does the console show?`,
        `\`App\` est rendu, puis on clique ${times[1]} sur son bouton. Qu'affiche la console ?`,
        `Se renderiza \`App\` y luego se pulsa su botón ${times[2]}. ¿Qué muestra la consola?`,
      ];
}

/** The console's lines are shown joined by spaces; said once in every explanation about logs. */
const LINES: L3 = [
  " Each `console.log` makes a line; they are shown here separated by spaces.",
  " Chaque `console.log` fait une ligne ; elles sont montrées ici séparées par des espaces.",
  " Cada `console.log` produce una línea; aquí se muestran separadas por espacios.",
];

function draft(program: string, opts: { show: ReactShow; clicks?: number; strict?: boolean }, correct: string, wrong: Option[], explanation: L3): Draft {
  const clicks = opts.clicks ?? 0;
  const strict = opts.strict ?? false;
  const seen = new Set([correct]);
  const text: L3 = opts.show === "log" ? [explanation[0] + LINES[0], explanation[1] + LINES[1], explanation[2] + LINES[2]] : explanation;
  return {
    prompt: { key: "concept", tex: "", id: `${program}|${opts.show}|${clicks}|${strict}`, text: L(question(opts.show, clicks, strict)), code: program },
    correct: out(correct),
    wrong: wrong.filter((o) => !seen.has(o.tex) && seen.add(o.tex)),
    explanation: { key: "concept", tex: "", text: L(text) },
    verify: { kind: "react", program, clicks, show: opts.show, ...(strict ? { strict: true } : {}) },
  };
}

const program = (...lines: string[]): string => lines.join("\n");
const repeat = (n: number, f: (i: number) => string): string[] => Array.from({ length: n }, (_, i) => f(i));
const range = (from: number, n: number, step = 1): number[] => Array.from({ length: n }, (_, i) => from + i * step);

/** The button that shows `n`, three lines, as most programs end. */
const BUTTON = ["  return (", "    <button onClick={click}>", "      {n}", "    </button>", "  );", "}"];

// ------------------------------------------------------------ beginner

/** setN(n + a) twice in one handler adds a once; setN(v => v + a) adds each time. */
export const clickCounter: Generator = (rng: Rng) => {
  const shape = rng.pick(["value", "updater", "valueThenUpdater", "updaterThenValue"] as const);
  const a = rng.int(1, 3);
  const b = rng.int(1, 3);
  const clicks = rng.int(1, 3);
  const calls = shape === "value" || shape === "updater" ? rng.int(2, 3) : 2;
  const set = (kind: "value" | "updater", k: number): string => (kind === "value" ? `    setN(n + ${k});` : `    setN((v) => v + ${k});`);
  const lines =
    shape === "value"
      ? repeat(calls, () => set("value", a))
      : shape === "updater"
        ? repeat(calls, () => set("updater", a))
        : shape === "valueThenUpdater"
          ? [set("value", a), set("updater", b)]
          : [set("updater", b), set("value", a)];
  // What one click adds.
  const step = shape === "value" ? a : shape === "updater" ? calls * a : shape === "valueThenUpdater" ? a + b : a;
  // Every call adding to the latest value.
  const queued = shape === "value" || shape === "updater" ? calls * a : a + b;
  // Every call reading the value of the render.
  const snapshot = shape === "updater" ? a : shape === "valueThenUpdater" ? b : a;
  return draft(
    program("function App() {", "  const [n, setN] = useState(0);", "  const click = () => {", ...lines, "  };", ...BUTTON),
    { show: "page", clicks },
    `${clicks * step}`,
    [
      out(`${clicks * queued}`, "reactUpdaterQueue"),
      out(`${clicks * snapshot}`, "reactUpdaterQueue"),
      out(`${(clicks - 1) * step}`, "reactStateSnapshot"),
      out(`${(clicks + 1) * step}`, "reactStateSnapshot"),
    ],
    [
      "Inside one click, `n` is the value of the render the handler came from: `setN(n + k)` asks for that value plus k, and a second such call asks for the same thing again, so the last one wins. `setN((v) => v + k)` queues an update that receives the latest pending value, so updaters add up. React applies the queue in order, then renders once, and the button shows the result.",
      "Pendant un clic, `n` est la valeur du rendu d'où vient le gestionnaire : `setN(n + k)` demande cette valeur plus k, et un second appel identique redemande la même chose, donc c'est le dernier qui l'emporte. `setN((v) => v + k)` met en file une mise à jour qui reçoit la dernière valeur en attente, donc les fonctions s'additionnent. React applique la file dans l'ordre, puis fait un seul rendu, et le bouton montre le résultat.",
      "Durante un clic, `n` es el valor del renderizado del que viene el manejador: `setN(n + k)` pide ese valor más k, y una segunda llamada igual vuelve a pedir lo mismo, así que gana la última. `setN((v) => v + k)` encola una actualización que recibe el último valor pendiente, así que las funciones se suman. React aplica la cola en orden, luego renderiza una vez, y el botón muestra el resultado.",
    ],
  );
};

/** 0 && … renders 0; false, null and undefined render nothing; JSX joins lines with a space. */
export const conditionalRender: Generator = (rng: Rng) => {
  const n = rng.pick([0, 0, rng.int(2, 9)]);
  const ok = rng.pick([false, false, true]);
  const name = rng.pick(["null", "null", '"Ana"']);
  const shownN = n === 0 ? "0" : "x";
  const shownOk = ok ? "y" : "";
  const shownName = name === "null" ? "" : "Ana";
  const page = (a: string, b: string, c: string, sep = " "): string => [`[${a}]`, `[${b}]`, `[${c}]`].join(sep);
  const correct = page(shownN, shownOk, shownName);
  // n is the one with a slip to show: 0, or a value whose && gives "x".
  return draft(
    program(
      "function App() {",
      `  const n: number = ${n};`,
      `  const ok: boolean = ${ok};`,
      `  const name: string | null = ${name};`,
      "  return (",
      "    <p>",
      '      [{n && "x"}]',
      '      [{ok && "y"}]',
      "      [{name}]",
      "    </p>",
      "  );",
      "}",
    ),
    { show: "page" },
    correct,
    [
      out(page(n === 0 ? "" : "true", shownOk, shownName), n === 0 ? "reactZeroRender" : "reactFalsyRender"),
      out(page(shownN, ok ? "y" : "false", name === "null" ? "null" : "Ana"), "reactFalsyRender"),
      out(page(shownN, shownOk, shownName, ""), "reactJsxWhitespace"),
      out(page(n === 0 ? "" : "x", ok ? "y" : "", name === "null" ? "" : "Ana", ""), n === 0 ? "reactZeroRender" : "reactJsxWhitespace"),
      out(page(n === 0 ? "0" : "x", ok ? "true" : "false", shownName), "reactFalsyRender"),
    ],
    [
      "`a && b` gives `a` when `a` is falsy, and React renders numbers, even 0: `{0 && …}` shows a 0, so test `n > 0 && …` instead. `false`, `true`, `null` and `undefined` render nothing. Between lines of JSX, a line break and its indentation become one space; inside a line, nothing is added.",
      "`a && b` donne `a` quand `a` est faux, et React affiche les nombres, même 0 : `{0 && …}` montre un 0, d'où `n > 0 && …`. `false`, `true`, `null` et `undefined` n'affichent rien. Entre des lignes de JSX, un retour à la ligne et son indentation deviennent une espace ; à l'intérieur d'une ligne, rien n'est ajouté.",
      "`a && b` da `a` cuando `a` es falso, y React muestra los números, incluso 0: `{0 && …}` muestra un 0, de ahí `n > 0 && …`. `false`, `true`, `null` y `undefined` no muestran nada. Entre líneas de JSX, un salto de línea y su sangría se convierten en un espacio; dentro de una línea no se añade nada.",
    ],
  );
};

type NameProp = { src: string; real: string; slip: string };
const NAME_PROPS: NameProp[] = [
  { src: "<Hi name={null} />", real: "", slip: "you" },
  { src: "<Hi />", real: "you", slip: "" },
  { src: '<Hi name="" />', real: "", slip: "you" },
  { src: "<Hi name={undefined} />", real: "you", slip: "" },
  { src: '<Hi name="Ana" />', real: "Ana", slip: "you" },
];

/** A default value replaces a missing prop or undefined, not null or "". */
export const defaultProps: Generator = (rng: Rng) => {
  const def = rng.pick(["you", "guest", "all"]);
  const picked = rng.shuffle(NAME_PROPS).slice(0, 3);
  if (!picked.some((p) => p.src.includes("null") || p.src.includes('""'))) return defaultProps(rng);
  const real = (p: NameProp): string => (p.real === "you" ? def : p.real);
  const slip = (p: NameProp): string => (p.slip === "you" ? def : p.slip);
  const page = (xs: string[]): string => xs.map((x) => `[${x}]`).join("");
  const swap = (i: number): string => page(picked.map((p, j) => (j === i ? slip(p) : real(p))));
  return draft(
    program(
      `function Hi({ name = "${def}" }: {`,
      "  name?: string | null;",
      "}) {",
      "  return <p>[{name}]</p>;",
      "}",
      "function App() {",
      "  return (",
      "    <>",
      ...picked.map((p) => `      ${p.src}`),
      "    </>",
      "  );",
      "}",
    ),
    { show: "page" },
    page(picked.map(real)),
    [out(swap(0), "reactDefaultProp"), out(swap(1), "reactDefaultProp"), out(swap(2), "reactDefaultProp"), out(page(picked.map((p) => (p.src.includes("null") ? "null" : real(p)))), "reactFalsyRender")],
    [
      "A default in the destructuring, `{ name = \"" + def + "\" }`, applies only when the prop is `undefined`: left out, or passed as `undefined`. `null` and `\"\"` are values, so they are kept, and both render nothing. Each `<p>` is a block of its own: the page's text runs them together.",
      "Une valeur par défaut dans la déstructuration, `{ name = \"" + def + "\" }`, ne s'applique que si la prop vaut `undefined` : absente, ou passée à `undefined`. `null` et `\"\"` sont des valeurs, donc gardées, et n'affichent rien. Chaque `<p>` est un bloc à lui : le texte de la page les met bout à bout.",
      "Un valor por defecto en la desestructuración, `{ name = \"" + def + "\" }`, solo se aplica cuando la prop es `undefined`: omitida, o pasada como `undefined`. `null` y `\"\"` son valores, así que se conservan, y no muestran nada. Cada `<p>` es un bloque propio: el texto de la página los pone seguidos.",
    ],
  );
};

// -------------------------------------------------------- intermediate

/** The handler logs the state of its render: setN does not change n. */
export const staleLog: Generator = (rng: Rng) => {
  const twice = rng.int(0, 1) === 1;
  const updater = rng.int(0, 1) === 1;
  const clicks = rng.int(2, 3);
  const step = twice && updater ? 2 : 1;
  const set = updater ? "    setN((v) => v + 1);" : "    setN(n + 1);";
  const before = range(0, clicks, step);
  return draft(
    program("function App() {", "  const [n, setN] = useState(0);", "  const click = () => {", set, ...(twice ? [set] : []), "    console.log(n);", "  };", ...BUTTON),
    { show: "log", clicks },
    before.join(" "),
    [
      out(range(step, clicks, step).join(" "), "reactStateSnapshot"),
      out(repeat(clicks, () => "0").join(" "), "reactStateSnapshot"),
      out([...before, clicks * step].join(" "), "reactStateSnapshot"),
      // Two calls in one click: setN(n + 1) taken to add 2, or updaters to add 1.
      ...(twice ? [out(range(0, clicks, updater ? 1 : 2).join(" "), "reactUpdaterQueue")] : []),
    ],
    [
      "A render's state is a constant: `n` in the handler is the value of the render that created it, and `setN` only asks for a new render. So the log is always one step behind the button. The next click comes from the new render, with its new `n`: the handler is not stuck on the first value." +
        (twice ? (updater ? " Two updaters add 2 per click." : " Two `setN(n + 1)` ask for the same value: 1 per click.") : ""),
      "L'état d'un rendu est une constante : `n` dans le gestionnaire est la valeur du rendu qui l'a créé, et `setN` ne fait que demander un nouveau rendu. Le log a donc toujours un temps de retard sur le bouton. Le clic suivant vient du nouveau rendu, avec son nouveau `n` : le gestionnaire ne reste pas bloqué sur la première valeur." +
        (twice ? (updater ? " Deux fonctions de mise à jour ajoutent 2 par clic." : " Deux `setN(n + 1)` demandent la même valeur : 1 par clic.") : ""),
      "El estado de un renderizado es una constante: `n` en el manejador es el valor del renderizado que lo creó, y `setN` solo pide un nuevo renderizado. Así que el log va siempre un paso por detrás del botón. El clic siguiente viene del nuevo renderizado, con su nuevo `n`: el manejador no se queda en el primer valor." +
        (twice ? (updater ? " Dos funciones de actualización suman 2 por clic." : " Dos `setN(n + 1)` piden el mismo valor: 1 por clic.") : ""),
    ],
  );
};

/** On mount: every render first, parent before children; then effects, children before parents. */
export const effectOrder: Generator = (rng: Rng) => {
  const p = "App";
  const [c1, c2] = rng.shuffle(["A", "B", "C", "D", "E"]);
  const two = rng.int(0, 1) === 1;
  const children = two ? [c1!, c2!] : [c1!];
  const component = (name: string, body: string[]): string[] => [
    `function ${name}() {`,
    `  console.log("render ${name}");`,
    "  useEffect(() => {",
    `    console.log("effect ${name}");`,
    "  });",
    ...body,
    "}",
  ];
  const child = (name: string): string[] => component(name, ["  return null;"]);
  const parentBody = two ? ["  return (", "    <>", ...children.map((c) => `      <${c} />`), "    </>", "  );"] : [`  return <${c1} />;`];
  const renders = [p, ...children].map((x) => `render ${x}`);
  const effects = (xs: string[]): string[] => xs.map((x) => `effect ${x}`);
  return draft(
    program(...children.flatMap(child), ...component(p, parentBody)),
    { show: "log" },
    [...renders, ...effects([...children, p])].join(" "),
    [
      out([...renders, ...effects([p, ...children])].join(" "), "reactEffectParentFirst"),
      out([`render ${p}`, `effect ${p}`, ...children.flatMap((c) => [`render ${c}`, `effect ${c}`])].join(" "), "reactEffectTiming"),
      out([...[...children, p].map((x) => `render ${x}`), ...effects([...children, p])].join(" "), "reactRenderOrder"),
      out([...[...children, p].map((x) => `render ${x}`), ...effects([p, ...children])].join(" "), "reactRenderOrder"),
    ],
    [
      "React renders from the top: a component's function runs, returns its children, then React renders those. Effects wait until the whole tree is rendered and on the screen, and run from the bottom up: children's effects before their parent's, so a parent's effect sees its children ready. Siblings go in order.",
      "React rend depuis le haut : la fonction d'un composant s'exécute, renvoie ses enfants, puis React rend ceux-ci. Les effets attendent que tout l'arbre soit rendu et affiché, et s'exécutent de bas en haut : ceux des enfants avant celui du parent, qui trouve ainsi ses enfants prêts. Les frères passent dans l'ordre.",
      "React renderiza desde arriba: la función de un componente se ejecuta, devuelve sus hijos, y luego React renderiza estos. Los efectos esperan a que todo el árbol esté renderizado y en pantalla, y se ejecutan de abajo arriba: los de los hijos antes que el del padre, que así encuentra a sus hijos listos. Los hermanos van en orden.",
    ],
  );
};

/** Two setters in one handler: one render per click, not one per setter. */
export const batching: Generator = (rng: Rng) => {
  const clicks = rng.int(1, 3);
  const a = rng.int(1, 3);
  const b = rng.int(1, 3);
  const sums = range(0, clicks + 1, a + b);
  const unbatched = [0, ...range(1, clicks).flatMap((i) => [(i - 1) * (a + b) + a, i * (a + b)])];
  return draft(
    program(
      "function App() {",
      "  const [x, setX] = useState(0);",
      "  const [y, setY] = useState(0);",
      '  console.log("render", x + y);',
      "  const click = () => {",
      `    setX(x + ${a});`,
      `    setY(y + ${b});`,
      "  };",
      "  return (",
      "    <button onClick={click}>",
      "      +",
      "    </button>",
      "  );",
      "}",
    ),
    { show: "log", clicks },
    sums.map((s) => `render ${s}`).join(" "),
    [
      out(unbatched.map((s) => `render ${s}`).join(" "), "reactNoBatching"),
      out(sums.map(() => "render 0").join(" "), "reactStateSnapshot"),
      out([0, ...range(1, clicks).flatMap((i) => [i * (a + b), i * (a + b)])].map((s) => `render ${s}`).join(" "), "reactNoBatching"),
    ],
    [
      "The first line comes from the first render. Then, React batches: every setter called during one event is queued, and the component renders once afterwards, with both new values. Since React 18, updates in timeouts, promises and native events are batched too.",
      "La première ligne vient du premier rendu. Ensuite, React regroupe : chaque setter appelé pendant un même événement est mis en file, et le composant fait un seul rendu après, avec les deux nouvelles valeurs. Depuis React 18, les mises à jour dans les timeouts, les promesses et les événements natifs sont aussi regroupées.",
      "La primera línea viene del primer renderizado. Después, React agrupa: cada setter llamado durante un mismo evento se encola, y el componente renderiza una sola vez después, con los dos valores nuevos. Desde React 18, las actualizaciones en timeouts, promesas y eventos nativos también se agrupan.",
    ],
  );
};

// ------------------------------------------------------------ advanced

/** useState's argument is read once; a new key makes a new component, with fresh state. */
export const keyReset: Generator = (rng: Rng) => {
  const start = rng.int(1, 4);
  const clicks = rng.int(1, 3);
  const key = rng.pick(["n", "n", "none", '"x"'] as const);
  const now = start + clicks;
  const fresh = key === "n";
  return draft(
    program(
      "function Shown(p: { v: number }) {",
      "  const [first] = useState(p.v);",
      "  return <p>{first}/{p.v}</p>;",
      "}",
      "function App() {",
      `  const [n, setN] = useState(${start});`,
      "  const click = () => setN(n + 1);",
      "  return (",
      "    <>",
      "      <button onClick={click} />",
      key === "none" ? "      <Shown v={n} />" : `      <Shown key={${key}} v={n} />`,
      "    </>",
      "  );",
      "}",
    ),
    { show: "page", clicks },
    fresh ? `${now}/${now}` : `${start}/${now}`,
    [
      out(fresh ? `${start}/${now}` : `${now}/${now}`, fresh ? "reactKeyState" : "reactInitialState"),
      out(`${start}/${start}`, "reactStateSnapshot"),
      out(`${now}/${start}`, "reactStateSnapshot"),
      out(fresh ? `${now - 1}/${now}` : `${start + 1}/${now}`, fresh ? "reactKeyState" : "reactInitialState"),
    ],
    [
      "`useState(p.v)` uses its argument only when the component first mounts; later renders ignore it, so `first` keeps its first value while `p.v` follows the props. A `key` that changes makes React treat the element as a new component: the old one is unmounted, the new one mounts with fresh state. That is how to reset a form when its subject changes. A constant key, or none, keeps the same instance.",
      "`useState(p.v)` n'utilise son argument qu'au premier montage ; les rendus suivants l'ignorent, donc `first` garde sa première valeur tandis que `p.v` suit les props. Une `key` qui change fait traiter l'élément comme un nouveau composant : l'ancien est démonté, le nouveau monte avec un état neuf. C'est ainsi qu'on réinitialise un formulaire quand son sujet change. Une clé constante, ou aucune, garde la même instance.",
      "`useState(p.v)` solo usa su argumento en el primer montaje; los renderizados siguientes lo ignoran, así que `first` conserva su primer valor mientras `p.v` sigue las props. Una `key` que cambia hace que React trate el elemento como un componente nuevo: el antiguo se desmonta y el nuevo se monta con estado nuevo. Así se reinicia un formulario cuando cambia su tema. Una clave constante, o ninguna, mantiene la misma instancia.",
    ],
  );
};

/** Changing ref.current does not render; the screen shows it at the next render. */
export const refCounter: Generator = (rng: Rng) => {
  const clicks = rng.int(1, 3);
  const withState = rng.int(0, 1) === 1;
  const k = rng.int(1, 3);
  return draft(
    program(
      "function App() {",
      "  const r = useRef(0);",
      "  const [n, setN] = useState(0);",
      "  const click = () => {",
      `    r.current += ${k};`,
      ...(withState ? ["    setN(n + 1);"] : []),
      "  };",
      "  return (",
      "    <button onClick={click}>",
      "      {r.current}/{n}",
      "    </button>",
      "  );",
      "}",
    ),
    { show: "page", clicks },
    withState ? `${clicks * k}/${clicks}` : "0/0",
    withState
      ? [out(`${(clicks - 1) * k}/${clicks}`, "reactRefRenders"), out(`0/${clicks}`, "reactRefRenders"), out(`${clicks * k}/${clicks - 1}`, "reactStateSnapshot"), out(`${clicks * k}/0`, "reactStateSnapshot")]
      : [out(`${clicks * k}/0`, "reactRefRenders"), out(`${clicks * k}/${clicks}`, "reactRefRenders"), out(`${(clicks - 1) * k}/0`, "reactRefRenders"), out(`0/${clicks}`, "reactStateSnapshot")],
    [
      "A ref is a box React keeps between renders: `r.current` can change at any time, and changing it does not render. The screen shows the value it had at the last render." +
        (withState ? " Here `setN` renders after each click, and that render reads the ref already incremented." : " Here nothing asks for a render, so the button keeps showing 0/0 although the ref has grown.") +
        " Use state for what is shown, a ref for what is not (a timer id, a DOM node, a previous value).",
      "Une ref est une boîte que React garde d'un rendu à l'autre : `r.current` peut changer à tout moment, et la changer ne déclenche pas de rendu. L'écran montre la valeur qu'elle avait au dernier rendu." +
        (withState ? " Ici `setN` provoque un rendu après chaque clic, et ce rendu lit la ref déjà augmentée." : " Ici rien ne demande de rendu, donc le bouton affiche toujours 0/0 alors que la ref a augmenté.") +
        " L'état pour ce qui s'affiche, une ref pour le reste (identifiant de minuterie, nœud du DOM, valeur précédente).",
      "Una ref es una caja que React conserva entre renderizados: `r.current` puede cambiar en cualquier momento, y cambiarla no renderiza. La pantalla muestra el valor que tenía en el último renderizado." +
        (withState ? " Aquí `setN` renderiza tras cada clic, y ese renderizado lee la ref ya incrementada." : " Aquí nada pide un renderizado, así que el botón sigue mostrando 0/0 aunque la ref haya crecido.") +
        " Estado para lo que se muestra, una ref para lo demás (id de un temporizador, nodo del DOM, valor anterior).",
    ],
  );
};

/** Before the next effect, the cleanup of the previous one, with its own values; [] runs once. */
export const cleanupOrder: Generator = (rng: Rng) => {
  const deps = rng.pick(["[n]", "[n]", "[]", "none"] as const);
  const clicks = rng.int(1, 2);
  const every = deps !== "[]";
  const real = every ? [...range(0, clicks).flatMap((i) => [`start ${i}`, `stop ${i}`]), `start ${clicks}`] : ["start 0"];
  const all = [...range(0, clicks).flatMap((i) => [`start ${i}`, `stop ${i}`]), `start ${clicks}`];
  return draft(
    program(
      "function App() {",
      "  const [n, setN] = useState(0);",
      "  useEffect(() => {",
      '    console.log("start", n);',
      "    return () => {",
      '      console.log("stop", n);',
      "    };",
      deps === "none" ? "  });" : `  }, ${deps});`,
      "  const click = () => setN(n + 1);",
      "  return <button onClick={click} />;",
      "}",
    ),
    { show: "log", clicks },
    real.join(" "),
    every
      ? [
          out(["start 0", ...range(1, clicks).flatMap((i) => [`stop ${i}`, `start ${i}`])].join(" "), "reactCleanupOrder"),
          out(["start 0", ...range(1, clicks).flatMap((i) => [`start ${i}`, `stop ${i - 1}`])].join(" "), "reactCleanupOrder"),
          out(["start 0", ...range(1, clicks).map((i) => `start ${i}`)].join(" "), "reactCleanupOrder"),
          out("start 0", "reactEffectDeps"),
        ]
      : [out(all.join(" "), "reactEffectDeps"), out(["start 0", ...range(1, clicks).map((i) => `start ${i}`)].join(" "), "reactEffectDeps"), out("start 0 stop 0", "reactCleanupOrder"), out("", "reactEffectDeps")],
    [
      (every
        ? "The effect depends on `n`" + (deps === "none" ? " (with no list, on every render)" : "") + ", so after each click React first runs the previous effect's cleanup, which still sees the `n` of its own render, then the new effect."
        : "With `[]` the effect runs once, after the first render; clicks render again but do not touch it. Its cleanup would run when the component unmounts.") +
        " Cleanups exist to undo what the effect set up: a subscription, a timer, a connection.",
      (every
        ? "L'effet dépend de `n`" + (deps === "none" ? " (sans liste, de chaque rendu)" : "") + ", donc après chaque clic React exécute d'abord le nettoyage de l'effet précédent, qui voit encore le `n` de son propre rendu, puis le nouvel effet."
        : "Avec `[]`, l'effet s'exécute une fois, après le premier rendu ; les clics refont un rendu sans le toucher. Son nettoyage s'exécuterait au démontage du composant.") +
        " Les nettoyages servent à défaire ce que l'effet a mis en place : un abonnement, une minuterie, une connexion.",
      (every
        ? "El efecto depende de `n`" + (deps === "none" ? " (sin lista, de cada renderizado)" : "") + ", así que tras cada clic React ejecuta primero la limpieza del efecto anterior, que todavía ve el `n` de su propio renderizado, y luego el efecto nuevo."
        : "Con `[]` el efecto se ejecuta una vez, tras el primer renderizado; los clics vuelven a renderizar sin tocarlo. Su limpieza se ejecutaría al desmontar el componente.") +
        " Las limpiezas sirven para deshacer lo que el efecto preparó: una suscripción, un temporizador, una conexión.",
    ],
  );
};

type MemoProp = { decl: string[]; pass: string; stable: boolean; type: string; read: string };
const MEMO_PROPS: MemoProp[] = [
  { decl: [], pass: 't="x"', stable: true, type: "{ t: string }", read: "t" },
  { decl: ['  const s = { t: "x" };'], pass: "s={s}", stable: false, type: "{ s: { t: string } }", read: "s" },
  { decl: ["  const s = useMemo(", '    () => ({ t: "x" }),', "    [],", "  );"], pass: "s={s}", stable: true, type: "{ s: { t: string } }", read: "s" },
  { decl: ["  const f = () => n;"], pass: "f={f}", stable: false, type: "{ f: () => number }", read: "f" },
];

/** memo skips a child whose props are equal (Object.is); a new object or function each render is not. */
export const memoChild: Generator = (rng: Rng) => {
  const prop = rng.pick(MEMO_PROPS);
  const memoised = rng.int(0, 3) > 0;
  const clicks = rng.int(1, 2);
  const skips = memoised && prop.stable;
  const real = ["app child", ...repeat(clicks, () => (skips ? "app" : "app child"))];
  const opposite = ["app child", ...repeat(clicks, () => (skips ? "app child" : "app"))];
  return draft(
    program(
      `type P = ${prop.type};`,
      `const Child = ${memoised ? "memo(" : ""}(${prop.read === "t" ? "{ t }" : `{ ${prop.read} }`}: P) => {`,
      '  console.log("child");',
      `  return ${prop.read === "f" ? "<i>{f()}</i>" : prop.read === "s" ? "<i>{s.t}</i>" : "<i>{t}</i>"};`,
      memoised ? "});" : "};",
      "function App() {",
      "  const [n, setN] = useState(0);",
      '  console.log("app");',
      ...prop.decl,
      "  const click = () => setN(n + 1);",
      "  return (",
      "    <>",
      "      <button onClick={click} />",
      `      <Child ${prop.pass} />`,
      "    </>",
      "  );",
      "}",
    ),
    { show: "log", clicks },
    real.join(" "),
    [
      out(opposite.join(" "), "reactMemoProps"),
      out(["app child", ...repeat(clicks, () => "child app")].join(" "), "reactRenderOrder"),
      out(["app child", ...repeat(clicks, () => "child")].join(" "), "reactMemoProps"),
      out("app child", "reactStateSnapshot"),
    ],
    [
      (memoised
        ? "`memo` skips rendering the child when every prop is the same as last time, compared with `Object.is`. " +
          (prop.stable
            ? prop.decl.length > 0
              ? "`useMemo` with `[]` returns the same object at every render, so the child is skipped."
              : "A string is compared by value, so the child is skipped."
            : "An object or function written in the parent's body is a new one at every render, so the props differ and the child renders each time; `useMemo` or `useCallback` would keep it.")
        : "Without `memo`, a child renders whenever its parent does, whatever its props.") +
        " The parent renders first, then its children. The React Compiler, when used, adds this memoisation itself.",
      (memoised
        ? "`memo` évite de rendre l'enfant quand chaque prop est la même que la fois précédente, comparée avec `Object.is`. " +
          (prop.stable
            ? prop.decl.length > 0
              ? "`useMemo` avec `[]` renvoie le même objet à chaque rendu, donc l'enfant est sauté."
              : "Une chaîne se compare par valeur, donc l'enfant est sauté."
            : "Un objet ou une fonction écrit dans le corps du parent est nouveau à chaque rendu : les props diffèrent et l'enfant est rendu à chaque fois ; `useMemo` ou `useCallback` le garderaient.")
        : "Sans `memo`, un enfant est rendu chaque fois que son parent l'est, quelles que soient ses props.") +
        " Le parent est rendu d'abord, puis ses enfants. Le React Compiler, quand il est utilisé, ajoute lui-même cette mémoïsation.",
      (memoised
        ? "`memo` evita renderizar el hijo cuando cada prop es igual que la vez anterior, comparada con `Object.is`. " +
          (prop.stable
            ? prop.decl.length > 0
              ? "`useMemo` con `[]` devuelve el mismo objeto en cada renderizado, así que el hijo se salta."
              : "Una cadena se compara por valor, así que el hijo se salta."
            : "Un objeto o una función escritos en el cuerpo del padre son nuevos en cada renderizado: las props difieren y el hijo se renderiza cada vez; `useMemo` o `useCallback` lo conservarían.")
        : "Sin `memo`, un hijo se renderiza cada vez que lo hace su padre, sean cuales sean sus props.") +
        " Primero se renderiza el padre y luego sus hijos. El React Compiler, cuando se usa, añade él mismo esta memoización.",
    ],
  );
};

// -------------------------------------------------------------- expert

/** StrictMode in development: every render twice, and effects set up, cleaned up and set up again. */
export const strictEffects: Generator = (rng: Rng) => {
  const init = rng.int(0, 2) === 0;
  const render = rng.int(0, 3) > 0;
  const cleanup = rng.int(0, 3) > 0;
  const lines = [
    "function App() {",
    ...(init ? ["  useState(() => {", '    console.log("init");', "    return 0;", "  });"] : []),
    ...(render ? ['  console.log("render");'] : []),
    "  useEffect(() => {",
    '    console.log("mount");',
    ...(cleanup ? ["    return () => {", '      console.log("unmount");', "    };"] : []),
    "  }, []);",
    "  return null;",
    "}",
  ];
  const twice = (word: string, on: boolean): string[] => (on ? [word, word] : []);
  const once = (word: string, on: boolean): string[] => (on ? [word] : []);
  const effects = cleanup ? ["mount", "unmount", "mount"] : ["mount", "mount"];
  const real = [...twice("init", init), ...twice("render", render), ...effects];
  return draft(
    program(...lines),
    { show: "log", strict: true },
    real.join(" "),
    [
      out([...once("init", init), ...once("render", render), "mount"].join(" "), "reactStrictOnce"),
      out([...twice("init", init), ...twice("render", render), "mount"].join(" "), "reactStrictOnce"),
      out([...once("init", init), ...once("render", render), ...effects].join(" "), "reactStrictOnce"),
      out([...twice("init", init), ...twice("render", render), ...(cleanup ? ["mount", "mount", "unmount"] : ["mount"])].join(" "), "reactCleanupOrder"),
    ],
    [
      "In development, `<StrictMode>` calls component functions, state initialisers and `useMemo` twice, and after the first mount runs every effect's cleanup and the effect again, as if the component were unmounted and mounted at once. Code that is pure, and effects whose cleanup undoes them, give the same result; the double run shows those that do not. In production none of this happens: one render, one effect." +
        (cleanup ? "" : " Without a cleanup, the effect simply runs twice."),
      "En développement, `<StrictMode>` appelle deux fois les fonctions des composants, les initialiseurs d'état et `useMemo`, et après le premier montage exécute le nettoyage de chaque effet puis l'effet à nouveau, comme si le composant était démonté et remonté aussitôt. Un code pur, et des effets que leur nettoyage défait, donnent le même résultat ; le double passage révèle les autres. En production, rien de tout cela : un rendu, un effet." +
        (cleanup ? "" : " Sans nettoyage, l'effet s'exécute simplement deux fois."),
      "En desarrollo, `<StrictMode>` llama dos veces a las funciones de los componentes, a los inicializadores de estado y a `useMemo`, y tras el primer montaje ejecuta la limpieza de cada efecto y otra vez el efecto, como si el componente se desmontara y volviera a montarse enseguida. Un código puro, y efectos que su limpieza deshace, dan el mismo resultado; la doble ejecución revela los demás. En producción no ocurre nada de esto: un renderizado, un efecto." +
        (cleanup ? "" : " Sin limpieza, el efecto simplemente se ejecuta dos veces."),
    ],
  );
};

/** useLayoutEffect runs before paint, all of them before any useEffect; children first in each. */
export const layoutEffects: Generator = (rng: Rng) => {
  const p = "App";
  const c = rng.pick(["A", "B", "C", "D"]);
  const hooks = (name: string, layout: boolean, passive: boolean): string[] => [
    ...(passive ? ["  useEffect(() => {", `    console.log("effect ${name}");`, "  });"] : []),
    ...(layout ? ["  useLayoutEffect(() => {", `    console.log("layout ${name}");`, "  });"] : []),
  ];
  const parentLayout = rng.int(0, 2) > 0;
  const childPassive = rng.int(0, 2) > 0;
  const lines = [
    `function ${c}() {`,
    ...hooks(c, true, childPassive),
    "  return null;",
    "}",
    "function App() {",
    ...hooks(p, parentLayout, true),
    `  return <${c} />;`,
    "}",
  ];
  const layout = [`layout ${c}`, ...(parentLayout ? [`layout ${p}`] : [])];
  const passive = [...(childPassive ? [`effect ${c}`] : []), `effect ${p}`];
  const real = [...layout, ...passive];
  // Written order: effect before layout in each component.
  const written = [...(childPassive ? [`effect ${c}`] : []), `layout ${c}`, `effect ${p}`, ...(parentLayout ? [`layout ${p}`] : [])];
  return draft(
    program(...lines),
    { show: "log" },
    real.join(" "),
    [
      out([...passive, ...layout].join(" "), "reactLayoutOrder"),
      out(written.join(" "), "reactLayoutOrder"),
      out([...[...layout].reverse(), ...[...passive].reverse()].join(" "), "reactEffectParentFirst"),
      out([`layout ${c}`, ...(childPassive ? [`effect ${c}`] : []), ...(parentLayout ? [`layout ${p}`] : []), `effect ${p}`].join(" "), "reactLayoutOrder"),
    ],
    [
      "After React changes the DOM, it runs every `useLayoutEffect`, synchronously, before the browser paints: a layout effect can measure an element and set state without a visible flicker. The `useEffect`s run afterwards, once the screen is painted. In both phases children come before parents; the order in which the hooks are written within a component does not move one phase before the other.",
      "Après avoir modifié le DOM, React exécute tous les `useLayoutEffect`, de façon synchrone, avant que le navigateur ne peigne : un effet de layout peut mesurer un élément et changer l'état sans scintillement visible. Les `useEffect` viennent ensuite, une fois l'écran peint. Dans les deux phases, les enfants passent avant les parents ; l'ordre d'écriture des hooks dans un composant ne fait pas passer une phase avant l'autre.",
      "Tras cambiar el DOM, React ejecuta todos los `useLayoutEffect`, de forma síncrona, antes de que el navegador pinte: un efecto de layout puede medir un elemento y cambiar el estado sin parpadeo visible. Los `useEffect` vienen después, una vez pintada la pantalla. En ambas fases los hijos van antes que los padres; el orden en que se escriben los hooks en un componente no adelanta una fase a la otra.",
    ],
  );
};
