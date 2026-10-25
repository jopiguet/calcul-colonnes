/**
 * Rust, generated: what a short program prints. Each wrong option is what a
 * real misconception predicts: integer division rounded down, `%` taken as
 * Euclidean, `as` casts clamping, a shadow leaking out of its block, bytes
 * and characters confused, `a..b` including `b`, the most specific `match`
 * arm, `dedup` removing every duplicate, values dropped in declaration order.
 *
 * `check:quiz` compiles every program shown with the real `rustc` and
 * compares what it prints with the options. A program's lines are kept to
 * 36 characters, so that it fits a phone without scrolling.
 */
import type { Rng } from "./rng";
import type { Draft, Generator, Localized, MistakeKey, Option } from "./types";
import type { L3 } from "./linux/types";

const L = (t: L3): Localized => ({ en: t[0], fr: t[1], es: t[2] });
const code = (s: string): Localized => ({ en: `\`${s}\``, fr: `\`${s}\``, es: `\`${s}\`` });

/** An option is an output: its identity (tex) is what is printed. A lone integer can be typed. */
const out = (printed: string, mistake?: MistakeKey): Option => ({
  tex: printed,
  text: code(printed),
  ...(/^-?\d+$/.test(printed) ? { num: Number(printed) } : {}),
  ...(mistake ? { mistake } : {}),
});

const PRINTS: L3 = ["What does this program print?", "Qu'affiche ce programme ?", "¿Qué muestra este programa?"];

/** The longest line a program may have: it must fit a phone. */
export const RUST_LINE_MAX = 36;

function draft(program: string, correct: string, wrong: Option[], explanation: L3): Draft {
  const seen = new Set([correct]);
  return {
    prompt: { key: "concept", tex: "", id: program, text: L(PRINTS), code: program },
    correct: out(correct),
    wrong: wrong.filter((o) => !seen.has(o.tex) && seen.add(o.tex)),
    explanation: { key: "concept", tex: "", text: L(explanation) },
    verify: { kind: "rust", program },
  };
}

/** A program from its lines (indentation included). */
const program = (...lines: string[]): string => lines.join("\n");

/** Integer division and remainder as Rust does them: toward zero, remainder of the dividend's sign. */
const div = (a: number, b: number): number => Math.trunc(a / b);
const rem = (a: number, b: number): number => a - b * div(a, b);
const euclid = (a: number, b: number): number => ((a % b) + Math.abs(b)) % Math.abs(b);

// ------------------------------------------------------------ beginner

/** `/` and `%` on a negative number; `as` casts; wrapping, saturating and checked additions. */
export const integerOps: Generator = (rng: Rng) => {
  const shape = rng.pick(["divRem", "castUp", "castNegative", "overflow"] as const);
  if (shape === "divRem") {
    const b = rng.pick([2, 3, 4, 5]);
    let a = -rng.int(7, 29);
    if (a % b === 0) a -= 1;
    return draft(
      program("fn main() {", `    let a: i32 = ${a};`, `    let b: i32 = ${b};`, '    println!("{} {}", a / b, a % b);', "}"),
      `${div(a, b)} ${rem(a, b)}`,
      [
        out(`${Math.floor(a / b)} ${euclid(a, b)}`, "rustIntegerDivision"),
        out(`${div(a, b)} ${euclid(a, b)}`, "rustRemainderSign"),
        out(`${Math.floor(a / b)} ${rem(a, b)}`, "rustIntegerDivision"),
        out(`${-div(a, b)} ${-rem(a, b)}`, "signError"),
      ],
      [
        "Integer division rounds toward zero, so a negative quotient goes up, not down; `%` then has the sign of the dividend, so that `a == b * (a / b) + a % b`. `a.div_euclid(b)` and `a.rem_euclid(b)` give the rounded-down quotient and a remainder that is never negative.",
        "La division entière arrondit vers zéro : un quotient négatif monte, il ne descend pas ; `%` a alors le signe du dividende, pour que `a == b * (a / b) + a % b`. `a.div_euclid(b)` et `a.rem_euclid(b)` donnent le quotient arrondi vers le bas et un reste jamais négatif.",
        "La división entera redondea hacia cero: un cociente negativo sube, no baja; `%` tiene entonces el signo del dividendo, para que `a == b * (a / b) + a % b`. `a.div_euclid(b)` y `a.rem_euclid(b)` dan el cociente redondeado hacia abajo y un resto nunca negativo.",
      ],
    );
  }
  if (shape === "castUp") {
    const v = rng.int(257, 600);
    const low = v % 256;
    if (low === 0 || low === 255) return integerOps(rng);
    const f = `${v}.7`;
    return draft(
      program("fn main() {", `    let n: i32 = ${v};`, `    let x: f64 = ${f};`, "    let a = n as u8;", "    let b = x as u8;", '    println!("{} {}", a, b);', "}"),
      `${low} 255`,
      [out("255 255", "rustCastSaturates"), out(`${low} ${low}`, "rustCastWraps"), out(`255 ${low}`, "rustCastSaturates"), out(`${low} ${(low + 1) % 256}`, "rustCastWraps")],
      [
        "Between integers, `as` keeps the low bits: " + `${v}` + " modulo 256. From a float, `as` truncates toward zero and saturates at the type's limits (and NaN gives 0). Neither ever fails: `u8::try_from(n)` does, returning an `Err` when the value does not fit.",
        "Entre entiers, `as` garde les bits de poids faible : " + `${v}` + " modulo 256. Depuis un flottant, `as` tronque vers zéro et sature aux limites du type (et NaN donne 0). Aucun des deux n'échoue jamais : `u8::try_from(n)`, si, en renvoyant `Err` quand la valeur ne tient pas.",
        "Entre enteros, `as` conserva los bits bajos: " + `${v}` + " módulo 256. Desde un flotante, `as` trunca hacia cero y satura en los límites del tipo (y NaN da 0). Ninguno falla nunca: `u8::try_from(n)` sí, devolviendo `Err` cuando el valor no cabe.",
      ],
    );
  }
  if (shape === "castNegative") {
    const n = rng.int(1, 60);
    const fx = rng.int(2, 9);
    return draft(
      program("fn main() {", `    let n: i32 = -${n};`, `    let x: f64 = -${fx}.5;`, "    let a = n as u8;", "    let b = x as u8;", '    println!("{} {}", a, b);', "}"),
      `${256 - n} 0`,
      [out("0 0", "rustCastSaturates"), out(`${256 - n} ${256 - fx}`, "rustCastWraps"), out(`${n} ${fx}`, "signError"), out(`0 ${256 - fx}`, "rustCastSaturates")],
      [
        "A negative integer cast to `u8` keeps its low 8 bits, as two's complement: −n becomes 256 − n. A negative float cast to an unsigned type saturates at 0.",
        "Un entier négatif converti en `u8` garde ses 8 bits de poids faible, en complément à deux : −n devient 256 − n. Un flottant négatif converti en type non signé sature à 0.",
        "Un entero negativo convertido a `u8` conserva sus 8 bits bajos, en complemento a dos: −n pasa a ser 256 − n. Un flotante negativo convertido a un tipo sin signo satura en 0.",
      ],
    );
  }
  const x = rng.int(240, 252);
  const k = rng.int(256 - x + 1, 256 - x + 20);
  const wrapped = (x + k) % 256;
  return draft(
    program("fn main() {", `    let x: u8 = ${x};`, `    let a = x.wrapping_add(${k});`, `    let b = x.saturating_add(${k});`, `    let c = x.checked_add(${k});`, '    println!("{} {} {:?}", a, b, c);', "}"),
    `${wrapped} 255 None`,
    [
      out(`255 ${wrapped} None`, "rustWrapping"),
      out(`${wrapped} 255 Some(${wrapped})`, "rustWrapping"),
      out(`${wrapped} 255 Some(255)`, "rustWrapping"),
      out(`${x + k} ${x + k} Some(${x + k})`, "rustCastSaturates"),
    ],
    [
      "`wrapping_add` goes round modulo 256, `saturating_add` stops at 255, `checked_add` returns `None` on overflow. A plain `x + k` panics in a debug build and wraps in a release build: the methods say which you mean.",
      "`wrapping_add` repart modulo 256, `saturating_add` s'arrête à 255, `checked_add` renvoie `None` en cas de dépassement. Un simple `x + k` panique en build de debug et repart à zéro en release : les méthodes disent ce que l'on veut.",
      "`wrapping_add` da la vuelta módulo 256, `saturating_add` se detiene en 255, `checked_add` devuelve `None` al desbordar. Un simple `x + k` provoca un pánico en debug y da la vuelta en release: los métodos dicen qué se quiere.",
    ],
  );
};

/** A shadow inside a block, or an assignment: what the outer variable holds afterwards. */
export const shadowing: Generator = (rng: Rng) => {
  const a = rng.int(2, 9);
  const m = rng.int(2, 5);
  const d = rng.int(1, 9);
  const am = a * m;
  if (rng.int(0, 1) === 0) {
    return draft(
      program("fn main() {", `    let x = ${a};`, `    let x = x * ${m};`, "    {", `        let x = x + ${d};`, '        print!("{} ", x);', "    }", '    println!("{}", x);', "}"),
      `${am + d} ${am}`,
      [out(`${am + d} ${am + d}`, "rustShadowScope"), out(`${a + d} ${a}`, "rustShadowIgnored"), out(`${am + d} ${a}`, "rustShadowIgnored")],
      [
        "Each `let x` makes a new variable that hides the previous one. The one inside the block ends with the block: afterwards `x` is again the outer one, worth " + `${a} × ${m}` + ".",
        "Chaque `let x` crée une nouvelle variable qui masque la précédente. Celle du bloc disparaît avec le bloc : ensuite, `x` est de nouveau celle de l'extérieur, qui vaut " + `${a} × ${m}` + ".",
        "Cada `let x` crea una variable nueva que oculta la anterior. La del bloque termina con el bloque: después, `x` vuelve a ser la de fuera, que vale " + `${a} × ${m}` + ".",
      ],
    );
  }
  return draft(
    program("fn main() {", `    let mut x = ${a};`, `    x = x * ${m};`, "    {", `        x = x + ${d};`, '        print!("{} ", x);', "    }", '    println!("{}", x);', "}"),
    `${am + d} ${am + d}`,
    [out(`${am + d} ${am}`, "rustShadowScope"), out(`${a + d} ${a + d}`, "rustShadowIgnored"), out(`${am + d} ${a}`, "rustShadowScope")],
    [
      "No `let` here: `x = …` changes the one variable `x`, declared `mut`, inside the block as outside. The change stays after the block. Only a new `let` inside the block would end with it.",
      "Pas de `let` ici : `x = …` modifie l'unique variable `x`, déclarée `mut`, dans le bloc comme dehors. Le changement reste après le bloc. Seul un nouveau `let` dans le bloc disparaîtrait avec lui.",
      "Aquí no hay `let`: `x = …` cambia la única variable `x`, declarada `mut`, dentro del bloque como fuera. El cambio permanece tras el bloque. Solo un nuevo `let` dentro del bloque terminaría con él.",
    ],
  );
};

// -------------------------------------------------------- intermediate

/** Words with characters of 2, 3 or 4 bytes in UTF-8. */
const WORDS = ["café", "naïve", "Zürich", "señor", "crème", "Ωmega", "€uro", "日本", "año", "Köln", "jalapeño", "🦀rust", "façade", "ÅÄÖ"];

/** `len()` counts bytes, `chars().count()` characters. */
export const stringLength: Generator = (rng: Rng) => {
  const word = rng.pick(WORDS);
  const bytes = new TextEncoder().encode(word).length;
  const chars = [...word].length;
  // Wrong models: one byte per character; two per character (UTF-16 in mind); a terminating zero byte.
  return draft(
    program("fn main() {", `    let s = "${word}";`, "    let n = s.chars().count();", '    println!("{} {}", s.len(), n);', "}"),
    `${bytes} ${chars}`,
    [out(`${chars} ${chars}`, "rustBytesChars"), out(`${chars} ${bytes}`, "rustBytesChars"), out(`${2 * chars} ${chars}`, "rustBytesChars"), out(`${bytes + 1} ${chars}`, "rustBytesChars")],
    [
      "A `str` is UTF-8: `len()` is its size in bytes, and a character outside ASCII takes 2 to 4 of them (é 2, € and 日 3, 🦀 4). `chars().count()` counts the characters (Unicode scalar values) and has to walk the string. No terminating zero byte, unlike C.",
      "Un `str` est en UTF-8 : `len()` est sa taille en octets, et un caractère hors ASCII en prend 2 à 4 (é 2, € et 日 3, 🦀 4). `chars().count()` compte les caractères (valeurs scalaires Unicode) et doit parcourir la chaîne. Pas d'octet nul final, contrairement au C.",
      "Un `str` está en UTF-8: `len()` es su tamaño en bytes, y un carácter fuera de ASCII ocupa de 2 a 4 (é 2, € y 日 3, 🦀 4). `chars().count()` cuenta los caracteres (valores escalares Unicode) y tiene que recorrer la cadena. Sin byte nulo final, a diferencia de C.",
    ],
  );
};

/** Range ends, and the order of filter, map, skip, take, rev and step_by. */
export const iteratorChain: Generator = (rng: Rng) => {
  const shape = rng.pick(["filterMap", "skipTake", "revStep"] as const);
  const list = (xs: number[]): string => `[${xs.join(", ")}]`;
  const range = (from: number, to: number): number[] => Array.from({ length: Math.max(0, to - from) }, (_, i) => from + i);
  if (shape === "filterMap") {
    const [k, m] = rng.pick([[4, 2], [6, 2], [6, 3], [6, 4], [9, 3], [8, 2], [8, 6]] as const);
    const n = k * rng.int(2, 3);
    const sum = (xs: number[]): number => xs.reduce((s, x) => s + x, 0);
    const xs = range(1, n);
    return draft(
      program("fn main() {", `    let s: i32 = (1..${n})`, `        .filter(|x| x % ${k} == 0)`, `        .map(|x| x * ${m})`, "        .sum();", '    println!("{}", s);', "}"),
      String(sum(xs.filter((x) => x % k === 0).map((x) => x * m))),
      [
        out(String(sum(range(1, n + 1).filter((x) => x % k === 0).map((x) => x * m))), "rustRangeEnd"),
        out(String(sum(xs.map((x) => x * m).filter((x) => x % k === 0))), "rustIteratorOrder"),
        out(String(sum(xs.filter((x) => x % k !== 0).map((x) => x * m))), "rustFilterInverted"),
      ],
      [
        `\`1..${n}\` stops before ${n}. \`filter\` keeps the numbers that pass the test, before \`map\` multiplies them: the test is on the original numbers, not on the products.`,
        `\`1..${n}\` s'arrête avant ${n}. \`filter\` garde les nombres qui passent le test, avant que \`map\` ne les multiplie : le test porte sur les nombres d'origine, pas sur les produits.`,
        `\`1..${n}\` se detiene antes de ${n}. \`filter\` conserva los números que pasan la prueba, antes de que \`map\` los multiplique: la prueba es sobre los números originales, no sobre los productos.`,
      ],
    );
  }
  if (shape === "skipTake") {
    const from = rng.int(0, 3);
    const to = from + rng.int(7, 9);
    const skip = rng.int(2, 3);
    const take = rng.int(3, 5);
    const xs = range(from, to);
    return draft(
      program("fn main() {", `    let v: Vec<i32> = (${from}..${to})`, `        .skip(${skip})`, `        .take(${take})`, "        .collect();", '    println!("{:?}", v);', "}"),
      list(xs.slice(skip, skip + take)),
      [
        out(list(xs.slice(0, take).slice(skip)), "rustIteratorOrder"),
        out(list(xs.slice(skip - 1, skip - 1 + take)), "rustRangeEnd"),
        out(list(xs.slice(skip + 1, skip + 1 + take)), "rustRangeEnd"),
        out(list(xs.slice(0, take)), "rustIteratorOrder"),
      ],
      [
        `\`skip(${skip})\` drops the first ${skip} items, then \`take(${take})\` keeps the next ${take}: the adapters apply in the order written. The other way round, \`take\` first, keeps only ${Math.max(0, take - skip)}.`,
        `\`skip(${skip})\` écarte les ${skip} premiers éléments, puis \`take(${take})\` garde les ${take} suivants : les adaptateurs s'appliquent dans l'ordre écrit. Dans l'autre sens, \`take\` d'abord, il n'en resterait que ${Math.max(0, take - skip)}.`,
        `\`skip(${skip})\` descarta los ${skip} primeros elementos y luego \`take(${take})\` conserva los ${take} siguientes: los adaptadores se aplican en el orden escrito. Al revés, \`take\` primero, solo quedarían ${Math.max(0, take - skip)}.`,
      ],
    );
  }
  const n = rng.int(9, 14);
  const k = rng.int(3, 4);
  const xs = range(0, n);
  const every = (ys: number[]): number[] => ys.filter((_, i) => i % k === 0);
  return draft(
    program("fn main() {", `    let v: Vec<i32> = (0..${n})`, "        .rev()", `        .step_by(${k})`, "        .collect();", '    println!("{:?}", v);', "}"),
    list(every([...xs].reverse())),
    [
      out(list([...every(xs)].reverse()), "rustIteratorOrder"),
      out(list(every([...range(0, n + 1)].reverse())), "rustRangeEnd"),
      out(list(every(xs)), "rustIteratorOrder"),
    ],
    [
      `\`(0..${n}).rev()\` starts at ${n - 1} (the end is excluded), then \`step_by(${k})\` keeps every ${k}th item from there. Stepping first and reversing after would start from the last multiple of ${k}.`,
      `\`(0..${n}).rev()\` part de ${n - 1} (la fin est exclue), puis \`step_by(${k})\` garde un élément sur ${k} à partir de là. Sauter d'abord et inverser ensuite partirait du dernier multiple de ${k}.`,
      `\`(0..${n}).rev()\` empieza en ${n - 1} (el final se excluye), luego \`step_by(${k})\` conserva un elemento de cada ${k} desde ahí. Saltar primero e invertir después empezaría por el último múltiplo de ${k}.`,
    ],
  );
};

/** The first arm that matches wins, guard or range. */
export const matchArms: Generator = (rng: Rng) => {
  const upper = 2 * rng.int(3, 6) + 1; // odd: the range's end is an odd number that only the range takes
  const guardFirst = rng.int(0, 1) === 0;
  const evenSmall = 2 * rng.int(1, Math.floor(upper / 2)); // matches the guard and the range
  const edge = upper; // odd, at the range's end
  const bigOdd = upper + 2; // odd, above the range
  const values = rng.shuffle([evenSmall, edge, bigOdd, 0]).slice(0, 3);
  if (!values.includes(evenSmall)) values[0] = evenSmall;
  type Arm = "zero" | "even" | "small" | "big";
  const arms: Arm[] = guardFirst ? ["zero", "even", "small", "big"] : ["zero", "small", "even", "big"];
  const matches = (arm: Arm, n: number, inclusive: boolean): boolean =>
    arm === "zero" ? n === 0 : arm === "even" ? n % 2 === 0 : arm === "small" ? n >= 1 && (inclusive ? n <= upper : n < upper) : true;
  const firstMatch = (order: Arm[], inclusive: boolean) => (n: number): Arm => order.find((a) => matches(a, n, inclusive))!;
  const lastMatch = (n: number): Arm => [...arms].reverse().find((a) => a !== "big" && matches(a, n, true)) ?? "big";
  const show = (f: (n: number) => Arm): string => values.map(f).join(" ");
  const line = (arm: Arm): string =>
    arm === "zero" ? '        0 => "zero",' : arm === "even" ? '        x if x % 2 == 0 => "even",' : arm === "small" ? `        1..=${upper} => "small",` : '        _ => "big",';
  const swapped: Arm[] = guardFirst ? ["zero", "small", "even", "big"] : ["zero", "even", "small", "big"];
  return draft(
    program("fn kind(n: i32) -> &'static str {", "    match n {", ...arms.map(line), "    }", "}", "", "fn main() {", `    for n in [${values.join(", ")}] {`, '        print!("{} ", kind(n));', "    }", "}"),
    show(firstMatch(arms, true)),
    [out(show(firstMatch(swapped, true)), "rustMatchOrder"), out(show(lastMatch), "rustMatchOrder"), out(show(firstMatch(arms, false)), "rustRangeEnd")],
    [
      `A \`match\` tries its arms from the top and takes the first that matches; a guard (\`if …\`) is part of its arm's test. ${evenSmall} is even and between 1 and ${upper}: the arm written first wins. \`1..=${upper}\` includes ${upper}.`,
      `Un \`match\` essaie ses bras depuis le haut et prend le premier qui correspond ; une garde (\`if …\`) fait partie du test de son bras. ${evenSmall} est pair et entre 1 et ${upper} : le bras écrit en premier l'emporte. \`1..=${upper}\` comprend ${upper}.`,
      `Un \`match\` prueba sus brazos desde arriba y toma el primero que coincide; una guarda (\`if …\`) forma parte de la prueba de su brazo. ${evenSmall} es par y está entre 1 y ${upper}: gana el brazo escrito primero. \`1..=${upper}\` incluye ${upper}.`,
    ],
  );
};

// ------------------------------------------------------------ advanced

/** map, filter, unwrap_or, and_then and ok_or on an Option. */
export const optionCombinators: Generator = (rng: Rng) => {
  const shape = rng.pick(["mapFilter", "none", "okOr"] as const);
  const show = (v: number | null): string => (v === null ? "None" : `Some(${v})`);
  if (shape === "mapFilter") {
    const a = rng.int(2, 9);
    const t = rng.int(4, 16);
    const d = rng.int(0, 1) === 0 ? 0 : -1;
    const kept = 2 * a > t;
    const wrong = kept
      ? [out(String(d), "rustFilterInverted"), out(String(a), "rustIteratorOrder"), out(`Some(${2 * a})`, "rustUnwrapOr")]
      : [out(String(2 * a), "rustFilterInverted"), out("None", "rustUnwrapOr"), out(String(a), "rustIteratorOrder")];
    return draft(
      program("fn main() {", `    let v = Some(${a})`, "        .map(|x| x * 2)", `        .filter(|x| *x > ${t})`, `        .unwrap_or(${d});`, '    println!("{}", v);', "}"),
      String(kept ? 2 * a : d),
      wrong,
      [
        `\`map\` doubles the value inside \`Some\`: ${2 * a}. \`filter\` keeps it only if the test is true (${2 * a} > ${t}${kept ? "" : " is false"}), otherwise gives \`None\`. \`unwrap_or\` takes the value out of \`Some\`, or gives ${d} for \`None\`.`,
        `\`map\` double la valeur dans \`Some\` : ${2 * a}. \`filter\` ne la garde que si le test est vrai (${2 * a} > ${t}${kept ? "" : " est faux"}), sinon donne \`None\`. \`unwrap_or\` sort la valeur du \`Some\`, ou donne ${d} pour \`None\`.`,
        `\`map\` duplica el valor dentro de \`Some\`: ${2 * a}. \`filter\` solo lo conserva si la prueba es verdadera (${2 * a} > ${t}${kept ? "" : " es falso"}); si no, da \`None\`. \`unwrap_or\` saca el valor del \`Some\`, o da ${d} para \`None\`.`,
      ],
    );
  }
  if (shape === "none") {
    const d = rng.int(2, 9);
    const k = rng.pick([1, 2, 3, 4, 5].filter((x) => x !== d));
    return draft(
      program("fn main() {", "    let r: Option<i32> = None;", "    let v = r", `        .map(|x| x + ${k})`, `        .unwrap_or(${d});`, '    println!("{}", v);', "}"),
      String(d),
      [out(String(d + k), "rustUnwrapOr"), out(String(k), "rustUnwrapOr"), out("0", "rustUnwrapOr")],
      [
        `\`map\` on \`None\` does nothing: the closure is not called, there is no value. \`unwrap_or(${d})\` then gives its default as it is; the \`map\` before it does not apply to the default.`,
        `\`map\` sur \`None\` ne fait rien : la closure n'est pas appelée, il n'y a pas de valeur. \`unwrap_or(${d})\` donne alors sa valeur par défaut telle quelle ; le \`map\` qui le précède ne s'applique pas à elle.`,
        `\`map\` sobre \`None\` no hace nada: la clausura no se llama, no hay valor. \`unwrap_or(${d})\` da entonces su valor por defecto tal cual; el \`map\` anterior no se le aplica.`,
      ],
    );
  }
  const a = rng.int(2, 15);
  const even = a % 2 === 0;
  return draft(
    program("fn main() {", `    let r = Some(${a})`, "        .filter(|x| x % 2 == 0)", '        .ok_or("odd");', '    println!("{:?}", r);', "}"),
    even ? `Ok(${a})` : 'Err("odd")',
    [out(even ? 'Err("odd")' : `Ok(${a})`, "rustFilterInverted"), out(show(even ? a : null), "rustUnwrapOr"), out(even ? `Some(Ok(${a}))` : 'Ok("odd")', "rustUnwrapOr")],
    [
      `\`filter\` keeps \`Some(${a})\` only if ${a} is even. \`ok_or\` turns an \`Option\` into a \`Result\`: \`Some(v)\` becomes \`Ok(v)\`, \`None\` becomes \`Err\` with the value given. \`{:?}\` prints the variant and its content.`,
      `\`filter\` ne garde \`Some(${a})\` que si ${a} est pair. \`ok_or\` transforme une \`Option\` en \`Result\` : \`Some(v)\` devient \`Ok(v)\`, \`None\` devient \`Err\` avec la valeur donnée. \`{:?}\` affiche la variante et son contenu.`,
      `\`filter\` solo conserva \`Some(${a})\` si ${a} es par. \`ok_or\` convierte una \`Option\` en \`Result\`: \`Some(v)\` pasa a \`Ok(v)\`, \`None\` pasa a \`Err\` con el valor dado. \`{:?}\` muestra la variante y su contenido.`,
    ],
  );
};

/** dedup removes consecutive repeats only; sort_by_key is stable. */
export const sortDedup: Generator = (rng: Rng) => {
  const list = (xs: (number | string)[]): string => `[${xs.join(", ")}]`;
  if (rng.int(0, 1) === 0) {
    // Values with one consecutive repeat and one repeat further on.
    const pool = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
    const [a, b, c, d] = pool as [number, number, number, number];
    const v = rng.pick([[a, a, b, c, a, d], [b, a, a, c, b, d], [c, a, b, b, d, c]]);
    const dedup = (xs: number[]): number[] => xs.filter((x, i) => i === 0 || xs[i - 1] !== x);
    const sorted = (xs: number[]): number[] => [...xs].sort((x, y) => x - y);
    return draft(
      program("fn main() {", "    let mut v =", `        vec![${v.join(", ")}];`, "    v.dedup();", "    v.sort();", '    println!("{:?}", v);', "}"),
      list(sorted(dedup(v))),
      [out(list(sorted([...new Set(v)])), "rustDedupConsecutive"), out(list(sorted(v)), "rustDedupConsecutive"), out(list(dedup(sorted(v))), "rustIteratorOrder"), out(list(dedup(v)), "rustIteratorOrder")],
      [
        "`dedup` removes only repeats that follow each other; it runs before the sort here, so a value repeated further on stays, and the sort then brings the two copies together. Sort first, then `dedup`, to keep each value once.",
        "`dedup` ne retire que les répétitions qui se suivent ; ici il passe avant le tri : une valeur répétée plus loin reste, et le tri rapproche ensuite les deux copies. Trier d'abord, puis `dedup`, pour garder chaque valeur une fois.",
        "`dedup` solo quita las repeticiones seguidas; aquí se ejecuta antes de ordenar, así que un valor repetido más adelante se queda, y la ordenación junta después las dos copias. Ordenar primero y luego `dedup` para conservar cada valor una vez.",
      ],
    );
  }
  // Words of a few lengths, several of each: a stable sort keeps their order.
  const words = rng.shuffle(["fig", "kiwi", "pear", "plum", "lime", "apple", "melon", "date", "yam"]).slice(0, 5);
  if (new Set(words.map((w) => w.length)).size === words.length) return sortDedup(rng);
  const quoted = (xs: string[]): string[] => xs.map((w) => `"${w}"`);
  const byLength = (tie: (a: string, b: string) => number) => (xs: string[]): string[] => [...xs].sort((a, b) => a.length - b.length || tie(a, b));
  const stable = byLength(() => 0)(words);
  const alpha = byLength((a, b) => (a < b ? -1 : a > b ? 1 : 0))(words);
  const reversed = byLength((a, b) => words.indexOf(b) - words.indexOf(a))(words);
  return draft(
    program("fn main() {", "    let mut v = vec![", `        ${quoted(words.slice(0, 3)).join(", ")},`, `        ${quoted(words.slice(3)).join(", ")},`, "    ];", "    v.sort_by_key(|w| w.len());", '    println!("{:?}", v);', "}"),
    list(quoted(stable)),
    [out(list(quoted(alpha)), "rustSortStable"), out(list(quoted(reversed)), "rustSortStable"), out(list(quoted([...words].sort())), "rustSortStable"), out(list(quoted([...stable].reverse())), "rustSortStable")],
    [
      "`sort_by_key` sorts by length only, and it is stable: words of the same length keep the order they had. Ties are not broken alphabetically. `sort_unstable_by_key` is faster but makes no such promise.",
      "`sort_by_key` trie par longueur seulement, et il est stable : les mots de même longueur gardent l'ordre qu'ils avaient. Les égalités ne sont pas départagées par ordre alphabétique. `sort_unstable_by_key` est plus rapide mais ne promet rien de tel.",
      "`sort_by_key` ordena solo por longitud, y es estable: las palabras de la misma longitud conservan el orden que tenían. Los empates no se deshacen por orden alfabético. `sort_unstable_by_key` es más rápido pero no promete nada de eso.",
    ],
  );
};

// -------------------------------------------------------------- expert

type Step =
  | { kind: "let"; name: string; label: string }
  | { kind: "underscore"; label: string }
  | { kind: "pair"; name: string; labels: [string, string] }
  | { kind: "block"; name: string; label: string }
  | { kind: "drop"; name: string }
  | { kind: "end" };

/**
 * When each value is dropped, under the real rules and under three
 * misconceptions: declaration order at the end of a scope (and fields
 * reversed), `let _ =` keeping its value, a shadowed value dropped at once.
 */
function dropOrder(steps: Step[], model: "real" | "forward" | "fieldsReversed" | "underscoreKept" | "shadowDrops"): string {
  const printed: string[] = [];
  let scope: { name: string; labels: string[] }[] = [];
  const release = (binding: { labels: string[] }): void => {
    printed.push(...(model === "forward" || model === "fieldsReversed" ? [...binding.labels].reverse() : binding.labels));
  };
  const endOf = (bindings: { labels: string[] }[]): void => {
    for (const b of model === "forward" ? bindings : [...bindings].reverse()) release(b);
  };
  const bind = (name: string, labels: string[]): void => {
    const shadowed = scope.find((b) => b.name === name);
    if (shadowed && model === "shadowDrops") {
      release(shadowed);
      scope = scope.filter((b) => b !== shadowed);
    }
    if (shadowed && model !== "shadowDrops") shadowed.name = `${name}'`; // still alive, no longer nameable
    scope.push({ name, labels });
  };
  for (const step of steps) {
    if (step.kind === "let") bind(step.name, [step.label]);
    else if (step.kind === "underscore") {
      if (model === "underscoreKept") scope.push({ name: "_", labels: [step.label] });
      else printed.push(step.label);
    } else if (step.kind === "pair") bind(step.name, [...step.labels]);
    else if (step.kind === "block") printed.push(step.label);
    else if (step.kind === "drop") {
      const b = scope.find((x) => x.name === step.name)!;
      scope = scope.filter((x) => x !== b);
      release(b);
    } else printed.push("end");
  }
  endOf(scope);
  return printed.join(" ");
}

/** Values with a Drop that prints: in what order do they go? */
export const dropOrderKind: Generator = (rng: Rng) => {
  const labels = rng.shuffle(["a", "b", "c", "d", "e", "f", "g", "h"]);
  let next = 0;
  const label = (): string => labels[next++]!;
  const withPair = rng.int(0, 1) === 0;
  const pool: Step[][] = [
    [{ kind: "underscore", label: label() }],
    [{ kind: "block", name: "t", label: label() }],
  ];
  const x = label();
  const y = label();
  const steps: Step[] = [{ kind: "let", name: "x", label: x }];
  const extras = rng.shuffle(pool);
  steps.push(...extras[0]!);
  if (withPair) steps.push({ kind: "pair", name: "p", labels: [label(), label()] });
  else steps.push({ kind: "let", name: "x", label: y }); // shadows x
  if (withPair) steps.push({ kind: "let", name: "y", label: y });
  steps.push(...extras[1]!);
  if (withPair && rng.int(0, 1) === 0) steps.push({ kind: "drop", name: "y" });
  steps.push({ kind: "end" });

  const lines: string[] = ["struct D(&'static str);", ...(withPair ? ["struct P(D, D);"] : []), "", "impl Drop for D {", "    fn drop(&mut self) {", '        print!("{} ", self.0);', "    }", "}", "", "fn main() {"];
  for (const s of steps) {
    if (s.kind === "let") lines.push(`    let ${s.name} = D("${s.label}");`);
    else if (s.kind === "underscore") lines.push(`    let _ = D("${s.label}");`);
    else if (s.kind === "pair") lines.push(`    let ${s.name} = P(`, `        D("${s.labels[0]}"),`, `        D("${s.labels[1]}"),`, "    );");
    else if (s.kind === "block") lines.push("    {", `        let ${s.name} = D("${s.label}");`, "    }");
    else if (s.kind === "drop") lines.push(`    drop(${s.name});`);
    else lines.push('    print!("end ");');
  }
  lines.push("}");
  return draft(
    program(...lines),
    dropOrder(steps, "real"),
    [
      out(dropOrder(steps, "forward"), "rustDropOrder"),
      out(dropOrder(steps, "fieldsReversed"), "rustDropOrder"),
      out(dropOrder(steps, "underscoreKept"), "rustLetUnderscore"),
      out(dropOrder(steps, "shadowDrops"), "rustShadowDrop"),
    ],
    [
      "Locals are dropped at the end of their scope in reverse order of declaration; a struct's fields after it, in declaration order. `let _ = …` binds nothing, so the value is dropped at once; `let _x` would keep it. A shadowed variable is not dropped when hidden: it lives to the end of the scope. `drop(v)` moves `v` into a function that drops it there.",
      "Les variables locales sont libérées à la fin de leur portée, dans l'ordre inverse de leur déclaration ; les champs d'une struct après elle, dans l'ordre de déclaration. `let _ = …` ne lie rien : la valeur est libérée tout de suite ; `let _x` la garderait. Une variable masquée n'est pas libérée quand elle est cachée : elle vit jusqu'à la fin de la portée. `drop(v)` déplace `v` dans une fonction qui la libère là.",
      "Las variables locales se liberan al final de su ámbito en orden inverso a su declaración; los campos de una struct después de ella, en orden de declaración. `let _ = …` no enlaza nada: el valor se libera en el acto; `let _x` lo conservaría. Una variable ocultada no se libera al ocultarse: vive hasta el final del ámbito. `drop(v)` mueve `v` a una función que lo libera allí.",
    ],
  );
};
