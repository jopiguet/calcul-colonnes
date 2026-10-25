/**
 * TypeScript, generated: what a short program logs. TypeScript runs as
 * JavaScript, so most of these are about what the types do not change: the
 * default `sort`, `??` and `||`, `typeof`, the event loop, `var` in closures,
 * floating point, shallow copies, `async` and `await`, class fields and the
 * base constructor. Each wrong option is what a misconception predicts.
 *
 * `check:quiz` type-checks every program shown with `tsc` in strict mode,
 * then runs it and compares what it logs (lines joined by spaces) with the
 * options. Lines are kept to 36 characters, to fit a phone.
 */
import type { Rng } from "./rng";
import type { Draft, Generator, Localized, MistakeKey, Option } from "./types";
import type { L3 } from "./linux/types";

const L = (t: L3): Localized => ({ en: t[0], fr: t[1], es: t[2] });
const code = (s: string): Localized => ({ en: `\`${s}\``, fr: `\`${s}\``, es: `\`${s}\`` });

const out = (printed: string, mistake?: MistakeKey): Option => ({
  tex: printed,
  text: code(printed),
  ...(/^-?\d+$/.test(printed) ? { num: Number(printed) } : {}),
  ...(mistake ? { mistake } : {}),
});

const LOGS: L3 = ["What does this program log?", "Qu'affiche ce programme ?", "¿Qué muestra este programa?"];

/** The longest line a program may have: it must fit a phone. */
export const TS_LINE_MAX = 36;

function draft(program: string, correct: string, wrong: Option[], explanation: L3): Draft {
  const seen = new Set([correct]);
  return {
    prompt: { key: "concept", tex: "", id: program, text: L(LOGS), code: program },
    correct: out(correct),
    wrong: wrong.filter((o) => !seen.has(o.tex) && seen.add(o.tex)),
    explanation: { key: "concept", tex: "", text: L(explanation) },
    verify: { kind: "ts", program },
  };
}

const program = (...lines: string[]): string => lines.join("\n");

// ------------------------------------------------------------ beginner

/** sort without a comparator, push's return value, slice and splice. */
export const arrayMethods: Generator = (rng: Rng) => {
  const shape = rng.pick(["sort", "push", "slice"] as const);
  if (shape === "sort") {
    // One- and two-digit numbers, so the text order differs from the numeric one.
    const xs = rng.shuffle([rng.int(10, 19), rng.int(2, 9), rng.int(20, 39), rng.int(1, 1), rng.int(100, 120)]).slice(0, 4);
    if (!xs.some((x) => x >= 10) || !xs.some((x) => x < 10)) return arrayMethods(rng);
    const lexical = [...xs].sort();
    const numeric = [...xs].sort((a, b) => a - b);
    return draft(
      program(`const a = [${xs.join(", ")}];`, "a.sort();", 'console.log(a.join(" "));'),
      lexical.join(" "),
      [out(numeric.join(" "), "tsSortStrings"), out(xs.join(" "), "tsMutatingMethod"), out([...numeric].reverse().join(" "), "tsSortStrings")],
      [
        "Without a comparator, `sort` converts the items to strings and compares them as text, so \"10\" comes before \"9\". Numbers need `a.sort((x, y) => x - y)`. `sort` changes the array in place (and returns it); `toSorted` returns a sorted copy.",
        "Sans comparateur, `sort` convertit les éléments en chaînes et les compare comme du texte : \"10\" passe avant \"9\". Pour des nombres, `a.sort((x, y) => x - y)`. `sort` modifie le tableau sur place (et le renvoie) ; `toSorted` renvoie une copie triée.",
        "Sin comparador, `sort` convierte los elementos en cadenas y los compara como texto: \"10\" va antes que \"9\". Para números, `a.sort((x, y) => x - y)`. `sort` cambia el array en su sitio (y lo devuelve); `toSorted` devuelve una copia ordenada.",
      ],
    );
  }
  if (shape === "push") {
    const xs = rng.shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, rng.int(2, 3));
    const added = rng.int(10, 20);
    return draft(
      program(`const a = [${xs.join(", ")}];`, `const n = a.push(${added});`, "console.log(n, a.length);"),
      `${xs.length + 1} ${xs.length + 1}`,
      [out(`${added} ${xs.length + 1}`, "tsMutatingMethod"), out(`${xs.length} ${xs.length + 1}`, "tsMutatingMethod"), out(`${[...xs, added].join(",")} ${xs.length + 1}`, "tsMutatingMethod"), out(`${xs.length + 1} ${xs.length}`, "tsMutatingMethod")],
      [
        "`push` adds to the array itself and returns its new length, not the item or a new array. `console.log` with several arguments prints them separated by spaces.",
        "`push` ajoute au tableau lui-même et renvoie sa nouvelle longueur, pas l'élément ni un nouveau tableau. `console.log` avec plusieurs arguments les affiche séparés par des espaces.",
        "`push` añade al propio array y devuelve su nueva longitud, no el elemento ni un array nuevo. `console.log` con varios argumentos los muestra separados por espacios.",
      ],
    );
  }
  const xs = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 6);
  const start = rng.int(1, 2);
  const count = rng.int(2, 3);
  const s = (ys: number[]): string => ys.join("");
  const after = [...xs.slice(0, start), ...xs.slice(start + count)];
  return slicing(xs, start, count, s, after);
};

/** slice copies [start, end); splice(start, count) removes and returns, changing the array. */
function slicing(xs: number[], start: number, count: number, s: (ys: number[]) => string, after: number[]): Draft {
  const slice = xs.slice(start, start + count);
  return draft(
    program(`const a = [${xs.join(", ")}];`, `const b = a.slice(${start}, ${start + count});`, `const c = a.splice(${start}, ${count});`, 'const [x, y, z] = [a, b, c].map(', '  (v) => v.join(""),', ");", "console.log(x, y, z);"),
    `${s(after)} ${s(slice)} ${s(slice)}`,
    [
      out(`${s(xs)} ${s(slice)} ${s(slice)}`, "tsMutatingMethod"),
      out(`${s(after)} ${s(xs.slice(start, start + count + 1))} ${s(slice)}`, "tsSliceEnd"),
      // splice's count read as an end index (only when that end is past the start).
      ...(count > start ? [out(`${s([...xs.slice(0, start), ...xs.slice(count)])} ${s(slice)} ${s(xs.slice(start, count))}`, "tsSliceEnd")] : []),
      out(`${s(after)} ${s(after)} ${s(slice)}`, "tsMutatingMethod"),
    ],
    [
      `\`slice(${start}, ${start + count})\` copies items ${start} to ${start + count - 1}: the end is excluded, and the array is untouched. \`splice(${start}, ${count})\` removes ${count} items from index ${start} (a count, not an end) and returns them, changing the array.`,
      `\`slice(${start}, ${start + count})\` copie les éléments ${start} à ${start + count - 1} : la fin est exclue, et le tableau n'est pas touché. \`splice(${start}, ${count})\` retire ${count} éléments à partir de l'indice ${start} (un nombre, pas une fin) et les renvoie, en modifiant le tableau.`,
      `\`slice(${start}, ${start + count})\` copia los elementos ${start} a ${start + count - 1}: el final se excluye, y el array no cambia. \`splice(${start}, ${count})\` quita ${count} elementos desde el índice ${start} (una cantidad, no un final) y los devuelve, cambiando el array.`,
    ],
  );
}

/** ?? against ||, and ?. on a missing object. */
export const nullish: Generator = (rng: Rng) => {
  if (rng.int(0, 1) === 0) {
    const n = rng.pick([0, 0, rng.int(1, 9)]);
    const text = rng.pick(["", "", "hi"]);
    const dn = rng.int(5, 9);
    const n1 = n ?? dn;
    const n2 = n || dn;
    const t1 = text ?? "x";
    const t2 = text || "x";
    const show = (a: number, b: number, c: string, d: string): string => `${a} ${b} [${c}] [${d}]`;
    return draft(
      program(`const n: number = ${n};`, `const s: string = "${text}";`, `const a = n ?? ${dn};`, `const b = n || ${dn};`, 'const c = s ?? "x";', 'const d = s || "x";', "const e = `[${c}] [${d}]`;", "console.log(a, b, e);"),
      show(n1, n2, t1, t2),
      [
        out(show(n2, n2, t2, t2), "tsNullishOr"),
        out(show(n1, n1, t1, t1), "tsNullishOr"),
        out(show(n2, n1, t2, t1), "tsNullishOr"),
      ],
      [
        "`??` falls back only on `null` or `undefined`; `||` on every falsy value: 0, \"\", `false`, `NaN`. For a count or a text that may legitimately be 0 or empty, `??` is the one that keeps it.",
        "`??` ne remplace que `null` ou `undefined` ; `||` toute valeur fausse : 0, \"\", `false`, `NaN`. Pour un compte ou un texte qui peut valoir 0 ou être vide, c'est `??` qui le garde.",
        "`??` solo sustituye `null` o `undefined`; `||` cualquier valor falso: 0, \"\", `false`, `NaN`. Para una cuenta o un texto que puede valer 0 o estar vacío, `??` es el que lo conserva.",
      ],
    );
  }
  const inner = rng.int(0, 1) === 0 ? 0 : rng.int(1, 9);
  const d = rng.int(10, 99);
  return draft(
    program("type B = { inner?: { n: number } };", `const x: B = { inner: { n: ${inner} } };`, "const y: B = {};", `const p = x.inner?.n ?? ${d};`, `const q = y.inner?.n ?? ${d};`, "console.log(p, q);"),
    `${inner} ${d}`,
    [out(`${inner || d} ${d}`, "tsNullishOr"), out(`${inner} undefined`, "tsOptionalChain"), out(`${inner} null`, "tsOptionalChain"), out(`${d} ${d}`, "tsNullishOr")],
    [
      "`y.inner?.n` stops at the missing `inner` and gives `undefined` instead of throwing; `?? " + `${d}` + "` then replaces it. `x.inner?.n` is " + `${inner}` + ", a value, so `??` keeps it" + (inner === 0 ? ", where `||` would not." : "."),
      "`y.inner?.n` s'arrête sur le `inner` absent et donne `undefined` au lieu de lever une erreur ; `?? " + `${d}` + "` le remplace ensuite. `x.inner?.n` vaut " + `${inner}` + ", une valeur, donc `??` la garde" + (inner === 0 ? ", là où `||` ne la garderait pas." : "."),
      "`y.inner?.n` se detiene en el `inner` ausente y da `undefined` en lugar de lanzar un error; `?? " + `${d}` + "` lo sustituye después. `x.inner?.n` vale " + `${inner}` + ", un valor, así que `??` lo conserva" + (inner === 0 ? ", donde `||` no lo haría." : "."),
    ],
  );
};

// -------------------------------------------------------- intermediate

const TYPEOF: { src: string; real: string; wrong: string }[] = [
  { src: "null", real: "object", wrong: "null" },
  { src: "[1]", real: "object", wrong: "array" },
  { src: "NaN", real: "number", wrong: "NaN" },
  { src: "() => 0", real: "function", wrong: "object" },
  { src: "class {}", real: "function", wrong: "class" },
  { src: "1n", real: "bigint", wrong: "number" },
  { src: "new Date()", real: "object", wrong: "date" },
  { src: "undefined", real: "undefined", wrong: "null" },
];

/** typeof null, an array, NaN, a function or class, a bigint. */
export const typeofValues: Generator = (rng: Rng) => {
  const picked = rng.shuffle(TYPEOF).slice(0, 3);
  // A line per value keeps every line short.
  const lines = picked.map((p, i) => `const v${i} = ${p.src};`);
  const real = picked.map((p) => p.real);
  const swapOne = (i: number): string => picked.map((p, j) => (j === i ? p.wrong : p.real)).join(" ");
  return draft(
    program(...lines, "const t = [v0, v1, v2].map(", "  (v) => typeof v,", ");", 'console.log(t.join(" "));'),
    real.join(" "),
    [out(swapOne(0), "tsTypeof"), out(swapOne(1), "tsTypeof"), out(swapOne(2), "tsTypeof"), out(picked.map((p) => p.wrong).join(" "), "tsTypeof")],
    [
      "`typeof` gives one of eight strings. `typeof null` is \"object\", a mistake from JavaScript's first version kept for compatibility; arrays and dates are \"object\" too (`Array.isArray` tells arrays apart); NaN is a \"number\"; functions and classes are \"function\". TypeScript narrows with `typeof` the same way, which is why it does not narrow `null` out of \"object\".",
      "`typeof` donne l'une de huit chaînes. `typeof null` vaut \"object\", une erreur de la première version de JavaScript gardée par compatibilité ; tableaux et dates sont aussi \"object\" (`Array.isArray` distingue les tableaux) ; NaN est un \"number\" ; fonctions et classes sont \"function\". TypeScript affine avec `typeof` de la même façon, d'où le `null` qui reste dans \"object\".",
      "`typeof` da una de ocho cadenas. `typeof null` es \"object\", un error de la primera versión de JavaScript que se mantiene por compatibilidad; arrays y fechas también son \"object\" (`Array.isArray` distingue los arrays); NaN es un \"number\"; funciones y clases son \"function\". TypeScript estrecha con `typeof` igual, por eso `null` sigue dentro de \"object\".",
    ],
  );
};

type Job = { kind: "sync" | "micro" | "macro"; label: string };

/** Order of logs: synchronous code, then promise callbacks, then timers. */
export const eventLoop: Generator = (rng: Rng) => {
  const labels = rng.shuffle(["a", "b", "c", "d", "e", "f"]);
  const kinds: Job["kind"][] = rng.shuffle(["sync", "sync", "micro", "macro", rng.pick(["micro", "macro", "sync"] as const)]);
  // A timer written before a promise callback, so the slip shows.
  const firstMacro = kinds.indexOf("macro");
  const lastMicro = kinds.lastIndexOf("micro");
  if (firstMacro > lastMicro) [kinds[firstMacro], kinds[lastMicro]] = [kinds[lastMicro]!, kinds[firstMacro]!];
  const jobs: Job[] = kinds.map((kind, i) => ({ kind, label: labels[i]! }));
  const line = (j: Job): string =>
    j.kind === "sync"
      ? `console.log("${j.label}");`
      : j.kind === "micro"
        ? `Promise.resolve().then(() =>\n  console.log("${j.label}"),\n);`
        : `setTimeout(() => console.log("${j.label}"));`;
  const of = (kind: Job["kind"]): string[] => jobs.filter((j) => j.kind === kind).map((j) => j.label);
  const real = [...of("sync"), ...of("micro"), ...of("macro")].join(" ");
  return draft(
    program(...jobs.map(line)),
    real,
    [
      out([...of("sync"), ...of("macro"), ...of("micro")].join(" "), "tsMicrotaskOrder"),
      out(jobs.map((j) => j.label).join(" "), "tsAsyncSync"),
      out([...of("sync"), ...jobs.filter((j) => j.kind !== "sync").map((j) => j.label)].join(" "), "tsMicrotaskOrder"),
    ],
    [
      "Synchronous code runs to the end first. Then the microtasks (promise callbacks, `queueMicrotask`) all run, in order, before the next macrotask: a `setTimeout` callback waits even with a delay of 0. Each `console.log` makes its own line; the lines are shown here separated by spaces.",
      "Le code synchrone s'exécute d'abord jusqu'au bout. Puis toutes les microtâches (rappels de promesses, `queueMicrotask`) s'exécutent, dans l'ordre, avant la macrotâche suivante : un rappel de `setTimeout` attend même avec un délai de 0. Chaque `console.log` fait sa propre ligne ; les lignes sont montrées ici séparées par des espaces.",
      "El código síncrono se ejecuta primero hasta el final. Luego se ejecutan todas las microtareas (retrollamadas de promesas, `queueMicrotask`), en orden, antes de la siguiente macrotarea: una retrollamada de `setTimeout` espera aunque el retraso sea 0. Cada `console.log` produce su propia línea; aquí las líneas se muestran separadas por espacios.",
    ],
  );
};

// ------------------------------------------------------------ advanced

/** Closures created in a loop over var or let. */
export const closureLoop: Generator = (rng: Rng) => {
  const n = rng.int(3, 4);
  const k = rng.int(2, 9);
  const useVar = rng.int(0, 1) === 0;
  const perIteration = Array.from({ length: n }, (_, i) => i * k);
  const shared = Array.from({ length: n }, () => n * k);
  return draft(
    program("const fs: (() => number)[] = [];", `for (${useVar ? "var" : "let"} i = 0; i < ${n}; i++) {`, `  fs.push(() => i * ${k});`, "}", "const out = fs.map((f) => f());", 'console.log(out.join(" "));'),
    (useVar ? shared : perIteration).join(" "),
    [
      out((useVar ? perIteration : shared).join(" "), "tsVarCapture"),
      out(Array.from({ length: n }, () => (n - 1) * k).join(" "), "tsVarCapture"),
      out(Array.from({ length: n }, (_, i) => (i + 1) * k).join(" "), "tsVarCapture"),
    ],
    [
      "A closure captures the variable, not its value at that moment. `var` makes one variable for the whole function: when the closures run, the loop is over and `i` is " + `${n}` + ". `let` in a `for` makes a fresh `i` for each iteration, so each closure keeps its own.",
      "Une closure capture la variable, pas sa valeur du moment. `var` crée une seule variable pour toute la fonction : quand les closures s'exécutent, la boucle est finie et `i` vaut " + `${n}` + ". `let` dans un `for` crée un nouveau `i` à chaque tour, donc chaque closure garde le sien.",
      "Una clausura captura la variable, no su valor en ese momento. `var` crea una sola variable para toda la función: cuando se ejecutan las clausuras, el bucle ha terminado e `i` vale " + `${n}` + ". `let` en un `for` crea un `i` nuevo en cada vuelta, así que cada clausura conserva el suyo.",
    ],
  );
};

/** Floating point, Number() against parseInt(), and rounding negatives. */
export const numbers: Generator = (rng: Rng) => {
  const shape = rng.pick(["float", "parse", "round"] as const);
  if (shape === "float") {
    const [a, b] = rng.pick([[0.1, 0.2], [0.1, 0.7], [0.2, 0.4], [0.3, 0.6]] as const);
    const sum = a + b;
    const exact = Math.round((a + b) * 10) / 10;
    const digits = rng.pick([1, 2]);
    return draft(
      program(`const x = ${a} + ${b};`, `const eq = x === ${exact};`, `console.log(eq, x.toFixed(${digits}));`),
      `${sum === exact} ${sum.toFixed(digits)}`,
      [out(`${sum !== exact} ${sum.toFixed(digits)}`, "tsFloat"), out(`${sum === exact} ${exact}`, "tsFloat"), out(`${sum !== exact} ${exact}`, "tsFloat"), out(`${sum === exact} ${sum}`, "tsFloat")],
      [
        `${a}, ${b} and ${exact} have no exact binary form, so the sum is ${sum}, not ${exact}. \`toFixed\` rounds for display and returns a string with exactly that many decimals, zeros included. Compare with a tolerance: \`Math.abs(x - ${exact}) < Number.EPSILON\`.`,
        `${a}, ${b} et ${exact} n'ont pas de forme binaire exacte : la somme vaut ${sum}, pas ${exact}. \`toFixed\` arrondit pour l'affichage et renvoie une chaîne avec exactement ce nombre de décimales, zéros compris. Comparer avec une tolérance : \`Math.abs(x - ${exact}) < Number.EPSILON\`.`,
        `${a}, ${b} y ${exact} no tienen forma binaria exacta: la suma vale ${sum}, no ${exact}. \`toFixed\` redondea para mostrar y devuelve una cadena con exactamente esos decimales, ceros incluidos. Comparar con una tolerancia: \`Math.abs(x - ${exact}) < Number.EPSILON\`.`,
      ],
    );
  }
  if (shape === "parse") {
    const n = rng.int(10, 99);
    const unit = rng.pick(["px", "kg", "em"]);
    const shown = (x: number): string => String(x);
    const p = Number.parseInt(`${n}${unit}`, 10);
    const q = Number(`${n}${unit}`);
    const e = Number("");
    return draft(
      program(`const s = "${n}${unit}";`, "const a = parseInt(s, 10);", "const b = Number(s);", 'const c = Number("");', "console.log(a, b, c);"),
      `${shown(p)} ${shown(q)} ${shown(e)}`,
      [out(`${p} ${p} ${e}`, "tsParseNumber"), out(`NaN NaN ${e}`, "tsParseNumber"), out(`${p} NaN NaN`, "tsParseNumber"), out(`${p} ${p} NaN`, "tsParseNumber")],
      [
        "`parseInt` reads digits from the start and stops at the first other character; `Number` converts the whole string or gives NaN. An empty (or blank) string gives 0 with `Number`, a classic trap for form fields. Always pass the base to `parseInt`.",
        "`parseInt` lit les chiffres du début et s'arrête au premier autre caractère ; `Number` convertit toute la chaîne ou donne NaN. Une chaîne vide (ou blanche) donne 0 avec `Number`, un piège classique des champs de formulaire. Toujours donner la base à `parseInt`.",
        "`parseInt` lee los dígitos del principio y se detiene en el primer otro carácter; `Number` convierte toda la cadena o da NaN. Una cadena vacía (o en blanco) da 0 con `Number`, una trampa clásica de los campos de formulario. Pasar siempre la base a `parseInt`.",
      ],
    );
  }
  const h = rng.int(1, 6);
  const f = rng.int(1, 6);
  const round = Math.round(-h - 0.5);
  const floor = Math.floor(-f - 0.7);
  const trunc = Math.trunc(-f - 0.7);
  return draft(
    program(`const a = Math.round(-${h}.5);`, `const b = Math.floor(-${f}.7);`, `const c = Math.trunc(-${f}.7);`, "console.log(a, b, c);"),
    `${round} ${floor} ${trunc}`,
    [out(`${round - 1} ${floor} ${trunc}`, "tsRounding"), out(`${round} ${trunc} ${trunc}`, "tsRounding"), out(`${round} ${trunc} ${floor}`, "tsRounding"), out(`${round - 1} ${trunc} ${floor}`, "tsRounding")],
    [
      `\`Math.round\` rounds halves up, toward +∞: −${h}.5 becomes ${round}, not ${round - 1}. \`Math.floor\` goes down, toward −∞ (${floor}); \`Math.trunc\` drops the decimals, toward zero (${trunc}). On negative numbers they differ.`,
      `\`Math.round\` arrondit les demis vers le haut, vers +∞ : −${h}.5 devient ${round}, pas ${round - 1}. \`Math.floor\` descend, vers −∞ (${floor}) ; \`Math.trunc\` coupe les décimales, vers zéro (${trunc}). Sur les négatifs, ils diffèrent.`,
      `\`Math.round\` redondea las mitades hacia arriba, hacia +∞: −${h}.5 pasa a ${round}, no a ${round - 1}. \`Math.floor\` baja, hacia −∞ (${floor}); \`Math.trunc\` quita los decimales, hacia cero (${trunc}). Con negativos, difieren.`,
    ],
  );
};

/** A spread copies one level; structuredClone copies all; === compares identity. */
export const copies: Generator = (rng: Rng) => {
  const a1 = rng.int(1, 3);
  const b1 = rng.int(4, 6);
  const set = rng.int(7, 9);
  const deep = rng.int(10, 19);
  const cloned = rng.int(20, 29);
  const useAssign = rng.int(0, 1) === 0;
  return draft(
    program(
      `const a = { n: ${a1}, in: { n: ${b1} } };`,
      useAssign ? "const b = Object.assign({}, a);" : "const b = { ...a };",
      "const c = structuredClone(a);",
      `b.n = ${set};`,
      `b.in.n = ${deep};`,
      `c.in.n = ${cloned};`,
      "const same = b.in === a.in;",
      "console.log(a.n, a.in.n, same);",
    ),
    `${a1} ${deep} true`,
    [
      out(`${a1} ${b1} false`, "tsShallowCopy"),
      out(`${set} ${deep} true`, "tsReferenceEquality"),
      out(`${a1} ${cloned} true`, "tsShallowCopy"),
      out(`${a1} ${deep} false`, "tsReferenceEquality"),
    ],
    [
      `${useAssign ? "`Object.assign`" : "A spread"} copies the top level only: \`b.n\` is \`b\`'s own, but \`b.in\` is the same object as \`a.in\`, so changing it shows through \`a\`, and \`===\` (identity) is true. \`structuredClone\` copies every level: \`c\` shares nothing with \`a\`.`,
      `${useAssign ? "`Object.assign`" : "Une décomposition"} ne copie que le premier niveau : \`b.n\` est à \`b\`, mais \`b.in\` est le même objet que \`a.in\`, donc le modifier se voit dans \`a\`, et \`===\` (identité) est vrai. \`structuredClone\` copie tous les niveaux : \`c\` ne partage rien avec \`a\`.`,
      `${useAssign ? "`Object.assign`" : "Una propagación"} solo copia el primer nivel: \`b.n\` es de \`b\`, pero \`b.in\` es el mismo objeto que \`a.in\`, así que cambiarlo se ve en \`a\`, y \`===\` (identidad) es verdadero. \`structuredClone\` copia todos los niveles: \`c\` no comparte nada con \`a\`.`,
    ],
  );
};

// -------------------------------------------------------------- expert

/** async functions run synchronously up to their first await. */
export const asyncOrder: Generator = (rng: Rng) => {
  const [p, q, r, s] = rng.shuffle(["a", "b", "c", "d", "e"]) as [string, string, string, string];
  if (rng.int(0, 1) === 0) {
    // Two calls interleave at their awaits.
    return draft(
      program("async function f(t: string) {", '  console.log(t + "1");', "  await null;", '  console.log(t + "2");', "}", `f("${p}");`, `f("${q}");`, `console.log("${r}");`),
      `${p}1 ${q}1 ${r} ${p}2 ${q}2`,
      [out(`${p}1 ${p}2 ${q}1 ${q}2 ${r}`, "tsAwaitOrder"), out(`${r} ${p}1 ${q}1 ${p}2 ${q}2`, "tsAsyncSync"), out(`${r} ${p}1 ${p}2 ${q}1 ${q}2`, "tsAsyncSync"), out(`${p}1 ${q}1 ${p}2 ${q}2 ${r}`, "tsMicrotaskOrder")],
      [
        "An async function runs synchronously up to its first `await`, then returns a promise to its caller, which carries on. The rest of the function resumes later, as a microtask, after the synchronous code. `await` pauses the function, never the caller.",
        "Une fonction async s'exécute de façon synchrone jusqu'à son premier `await`, puis rend une promesse à l'appelant, qui continue. La suite de la fonction reprend plus tard, en microtâche, après le code synchrone. `await` suspend la fonction, jamais l'appelant.",
        "Una función async se ejecuta de forma síncrona hasta su primer `await`, y luego devuelve una promesa a quien la llamó, que sigue adelante. El resto de la función se reanuda más tarde, como microtarea, tras el código síncrono. `await` suspende la función, nunca a quien la llama.",
      ],
    );
  }
  // An await's continuation against a promise callback queued after it, and a timer.
  return draft(
    program("async function f() {", `  console.log("${p}");`, "  await null;", `  console.log("${q}");`, "}", `setTimeout(() => console.log("${s}"));`, "f();", "Promise.resolve().then(() =>", `  console.log("${r}"),`, ");"),
    `${p} ${q} ${r} ${s}`,
    [out(`${p} ${r} ${q} ${s}`, "tsMicrotaskOrder"), out(`${p} ${s} ${q} ${r}`, "tsMicrotaskOrder"), out(`${s} ${p} ${q} ${r}`, "tsAsyncSync"), out(`${r} ${p} ${q} ${s}`, "tsAsyncSync")],
    [
      "`f()` logs at once, up to `await null`; its continuation is queued as a microtask then, before the `then` callback queued after the call. Microtasks run in the order they were queued, all before the timer.",
      "`f()` affiche tout de suite, jusqu'à `await null` ; sa suite est mise en file comme microtâche à ce moment, avant le rappel `then` mis en file après l'appel. Les microtâches s'exécutent dans l'ordre de leur mise en file, toutes avant la minuterie.",
      "`f()` muestra en el acto, hasta `await null`; su continuación se pone en cola como microtarea en ese momento, antes de la retrollamada `then` encolada tras la llamada. Las microtareas se ejecutan en el orden en que se encolaron, todas antes del temporizador.",
    ],
  );
};

/** The base constructor runs before the subclass's fields are set, but calls its overrides. */
export const initOrder: Generator = (rng: Rng) => {
  const [base, kid] = rng.pick([["Base", "Kid"], ["Shape", "Square"], ["Animal", "Cat"], ["Widget", "Button"]] as const);
  const value = rng.pick(["kid", "red", "big", "new"]);
  const lower = kid.toLowerCase();
  return draft(
    program(
      `class ${base} {`,
      "  constructor() {",
      "    console.log(this.describe());",
      "  }",
      "  describe(): string {",
      `    return "${base.toLowerCase()}";`,
      "  }",
      "}",
      `class ${kid} extends ${base} {`,
      `  tag = "${value}";`,
      "  describe(): string {",
      `    return "${lower} " + this.tag;`,
      "  }",
      "}",
      `const k = new ${kid}();`,
      "console.log(k.describe());",
    ),
    `${lower} undefined ${lower} ${value}`,
    [
      out(`${lower} ${value} ${lower} ${value}`, "tsFieldInitOrder"),
      out(`${base.toLowerCase()} ${lower} ${value}`, "tsFieldInitOrder"),
      out(`${base.toLowerCase()} ${lower} undefined`, "tsFieldInitOrder"),
    ],
    [
      `\`new ${kid}()\` first runs \`${base}\`'s constructor, which calls \`this.describe()\`: the override, since \`this\` is a \`${kid}\`. But \`tag\` is only set after \`super()\` returns, so it is still \`undefined\`. TypeScript does not catch this; avoid calling overridable methods from a constructor.`,
      `\`new ${kid}()\` exécute d'abord le constructeur de \`${base}\`, qui appelle \`this.describe()\` : la redéfinition, puisque \`this\` est un \`${kid}\`. Mais \`tag\` n'est initialisé qu'au retour de \`super()\` : il vaut encore \`undefined\`. TypeScript ne le détecte pas ; éviter d'appeler des méthodes redéfinissables depuis un constructeur.`,
      `\`new ${kid}()\` ejecuta primero el constructor de \`${base}\`, que llama a \`this.describe()\`: la versión redefinida, ya que \`this\` es un \`${kid}\`. Pero \`tag\` solo se asigna al volver de \`super()\`, así que sigue siendo \`undefined\`. TypeScript no lo detecta; evitar llamar a métodos redefinibles desde un constructor.`,
    ],
  );
};
