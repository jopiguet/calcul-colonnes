/**
 * SQL, generated: what a query returns. Two small tables drawn at random
 * (pets and their owners, with a few NULLs), a query, and its result. Each
 * wrong option is the result of a real slip: `>` read as `>=`, NULL compared
 * with `=` or `<>`, AND before OR forgotten, COUNT(*) for COUNT(col), HAVING
 * skipped, a LEFT JOIN read as an inner one.
 *
 * Only portable SQL: the result is the same in PostgreSQL, SQLite and MySQL
 * (no NULL in an ORDER BY, no integer division, no LIKE). `check:quiz` runs
 * every query shown on a real SQLite database and compares the options with
 * what it returns.
 */
import type { Rng } from "./rng";
import type { Draft, Generator, Localized, MistakeKey, Option } from "./types";
import type { L3 } from "./linux/types";

const L = (t: L3): Localized => ({ en: t[0], fr: t[1], es: t[2] });

export type Cell = string | number | null;

interface Owner {
  id: number;
  name: string;
}
interface Pet {
  name: string;
  kind: string | null;
  age: number | null;
  owner: number | null;
}
interface Data {
  owners: Owner[];
  pets: Pet[];
}

const OWNER_NAMES = ["Ana", "Ben", "Carla", "Dev", "Eva", "Femi", "Gus", "Hana"];
// Short names: the pets table must fit a phone (docs/question-generators.md#sql).
const PET_NAMES = ["Bea", "Coco", "Fifi", "Kiwi", "Luna", "Milo", "Nala", "Pip", "Rex", "Tofu", "Zazu"];
const KINDS = ["cat", "dog", "fish"];

/**
 * Three owners, one of them without a pet; five or six pets, one of unknown
 * kind, one of unknown age and one without an owner. Ages all differ, so no
 * ORDER BY has ties.
 */
function drawData(rng: Rng): Data {
  const ownerNames = rng.shuffle(OWNER_NAMES).slice(0, 3).sort();
  const owners = ownerNames.map((name, i) => ({ id: i + 1, name }));
  const lonely = rng.int(1, 3); // the owner with no pet
  const others = owners.filter((o) => o.id !== lonely).map((o) => o.id);
  const n = rng.int(5, 6);
  const names = rng.shuffle(PET_NAMES).slice(0, n);
  const ages = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).slice(0, n);
  const pets: Pet[] = names.map((name, i) => ({ name, kind: KINDS[i % 3]!, age: ages[i]!, owner: others[i % 2]! }));
  // Two pets of a kind at least, so groups have more than one row.
  pets[3]!.kind = pets[0]!.kind;
  const [noKind, noAge, noOwner] = rng.shuffle([...pets.keys()]).slice(0, 3) as [number, number, number];
  pets[noKind]!.kind = null;
  pets[noAge]!.age = null;
  pets[noOwner]!.owner = null;
  return { owners, pets: rng.shuffle(pets) };
}

const sqlValue = (v: Cell): string => (v === null ? "NULL" : typeof v === "number" ? String(v) : `'${v}'`);

/** The statements that create and fill the tables (for the check, and the explanation's record). */
export function setupOf(d: Data): string {
  return [
    "CREATE TABLE owners (id INTEGER PRIMARY KEY, name TEXT);",
    `INSERT INTO owners VALUES ${d.owners.map((o) => `(${o.id}, ${sqlValue(o.name)})`).join(", ")};`,
    "CREATE TABLE pets (name TEXT, kind TEXT, age INTEGER, owner INTEGER);",
    `INSERT INTO pets VALUES ${d.pets.map((p) => `(${[p.name, p.kind, p.age, p.owner].map(sqlValue).join(", ")})`).join(", ")};`,
  ].join("\n");
}

const tt = (s: string): string => `\\texttt{${s.replace(/_/g, "\\_")}}`;
const cell = (v: Cell): string => (v === null ? "\\textsf{NULL}" : tt(String(v)));

/** A table as KaTeX shows it: its name, then its columns and rows. */
function tableTex(name: string, columns: string[], rows: Cell[][], numeric: boolean[]): string {
  const spec = `|${numeric.map((n) => (n ? "r" : "l")).join("|")}|`;
  const head = columns.map((c) => `\\textsf{\\textbf{${c.replace(/_/g, "\\_")}}}`).join(" & "); // KaTeX has no bold typewriter
  const body = rows.map((r) => r.map(cell).join(" & ")).join(" \\\\ ");
  return `\\begin{array}{c}${tt(name)}\\\\[2pt]\\begin{array}{${spec}}\\hline ${head} \\\\ \\hline ${body} \\\\ \\hline\\end{array}\\end{array}`;
}

const petsTex = (d: Data): string =>
  tableTex("pets", ["name", "kind", "age", "owner"], d.pets.map((p) => [p.name, p.kind, p.age, p.owner]), [false, false, true, true]);
const ownersTex = (d: Data): string => tableTex("owners", ["id", "name"], d.owners.map((o) => [o.id, o.name]), [true, false]);

/** A result as the options show it: one value; a column as a list; rows as "a | b, c | d"; no row as ∅. */
export function formatRows(rows: Cell[][]): string {
  if (rows.length === 0) return "∅";
  const value = (v: Cell): string => (v === null ? "NULL" : typeof v === "number" ? String(Number(v.toFixed(2))) : v);
  return rows.map((r) => r.map(value).join(" | ")).join(", ");
}

const NO_ROW: L3 = ["(no row)", "(aucune ligne)", "(ninguna fila)"];

/** An option is a result: its identity (tex) is the result as written. */
function result(rows: Cell[][], mistake?: MistakeKey): Option {
  const shown = formatRows(rows);
  const single = rows.length === 1 && rows[0]!.length === 1 && typeof rows[0]![0] === "number" ? (rows[0]![0] as number) : undefined;
  return {
    tex: shown,
    text: shown === "∅" ? L(NO_ROW) : { en: `\`${shown}\``, fr: `\`${shown}\``, es: `\`${shown}\`` },
    ...(single !== undefined ? { num: Number(single.toFixed(2)) } : {}),
    ...(mistake ? { mistake } : {}),
  };
}

const RETURNS: L3 = ["What does this query return?", "Que renvoie cette requête ?", "¿Qué devuelve esta consulta?"];

function draft(d: Data, query: string, tables: "pets" | "both", correct: Cell[][], wrong: Option[], explanation: L3): Draft {
  const right = result(correct);
  const seen = new Set([right.tex]);
  const distinct = wrong.filter((o) => !seen.has(o.tex) && seen.add(o.tex));
  return {
    prompt: {
      key: "concept",
      // Stacked and small: two tables side by side would not fit a phone.
      tex: `\\footnotesize ${tables === "both" ? `\\begin{array}{c}${ownersTex(d)}\\\\[6pt]${petsTex(d)}\\end{array}` : petsTex(d)}`,
      id: query,
      text: L(RETURNS.map((s) => `${s} \`${query}\``) as unknown as L3),
    },
    correct: right,
    wrong: distinct,
    explanation: { key: "concept", tex: "", text: L(explanation) },
    verify: { kind: "sql", setup: setupOf(d), query },
  };
}

const byName = (a: Pet, b: Pet): number => (a.name < b.name ? -1 : 1);
const names = (pets: Pet[]): Cell[][] => [...pets].sort(byName).map((p) => [p.name]);

// ------------------------------------------------------------------ filters

/** WHERE: a boundary, AND before OR, NOT IN with a NULL. */
export const filterRows: Generator = (rng) => {
  const d = drawData(rng);
  const aged = d.pets.filter((p) => p.age !== null).map((p) => p.age!).sort((a, b) => a - b);
  // A boundary that one pet sits exactly on.
  const k = aged[rng.int(1, aged.length - 2)]!;
  const shape = rng.pick(["boundary", "precedence", "notIn"] as const);
  if (shape === "boundary") {
    const op = rng.pick([">", "<"] as const);
    const pass = (p: Pet, strict: boolean): boolean => p.age !== null && (op === ">" ? (strict ? p.age > k : p.age >= k) : strict ? p.age < k : p.age <= k);
    return draft(d, `SELECT name FROM pets WHERE age ${op} ${k} ORDER BY name;`, "pets", names(d.pets.filter((p) => pass(p, true))), [
      result(names(d.pets.filter((p) => pass(p, false))), "sqlBoundary"),
      result(names(d.pets.filter((p) => pass(p, true) || p.age === null)), "sqlNullCompared"),
      result(names(d.pets.filter((p) => p.age !== null && !pass(p, false))), "sqlBoundary"),
    ], [
      `\`${op}\` is strict: the pet aged exactly ${k} is left out. A NULL age is unknown, so \`age ${op} ${k}\` is not true for it: never returned.`,
      `\`${op}\` est strict : l'animal qui a exactement ${k} ans n'y est pas. Un âge NULL est inconnu : \`age ${op} ${k}\` n'est pas vrai pour lui, il n'est jamais renvoyé.`,
      `\`${op}\` es estricto: el animal de exactamente ${k} años queda fuera. Una edad NULL es desconocida: \`age ${op} ${k}\` no es verdadero para ella, nunca se devuelve.`,
    ]);
  }
  const [a, b] = rng.shuffle(KINDS).slice(0, 2) as [string, string];
  if (shape === "precedence") {
    const older = (p: Pet): boolean => p.age !== null && p.age > k;
    return draft(d, `SELECT name FROM pets WHERE kind = '${a}' OR kind = '${b}' AND age > ${k} ORDER BY name;`, "pets", names(d.pets.filter((p) => p.kind === a || (p.kind === b && older(p)))), [
      result(names(d.pets.filter((p) => (p.kind === a || p.kind === b) && older(p))), "sqlPrecedence"),
      result(names(d.pets.filter((p) => p.kind === a || p.kind === b)), "sqlPrecedence"),
      result(names(d.pets.filter((p) => p.kind === b && older(p))), "sqlPrecedence"),
    ], [
      `AND binds tighter than OR: \`kind = '${a}' OR (kind = '${b}' AND age > ${k})\`. Every ${a}, and the ${b}s older than ${k}. Brackets make the intent clear.`,
      `AND l'emporte sur OR : \`kind = '${a}' OR (kind = '${b}' AND age > ${k})\`. Tous les ${a}, et les ${b} de plus de ${k} ans. Des parenthèses rendent l'intention claire.`,
      `AND tiene prioridad sobre OR: \`kind = '${a}' OR (kind = '${b}' AND age > ${k})\`. Todos los ${a}, y los ${b} de más de ${k} años. Los paréntesis aclaran la intención.`,
    ]);
  }
  return draft(d, `SELECT name FROM pets WHERE kind NOT IN ('${a}') ORDER BY name;`, "pets", names(d.pets.filter((p) => p.kind !== null && p.kind !== a)), [
    result(names(d.pets.filter((p) => p.kind !== a)), "sqlNullCompared"),
    result(names(d.pets.filter((p) => p.kind === a)), "sqlNullCompared"),
    result(names(d.pets.filter((p) => p.kind === null || p.kind === a)), "sqlNullCompared"),
  ], [
    `For the pet whose kind is NULL, \`NULL NOT IN ('${a}')\` is unknown, not true: the row is left out. Add \`OR kind IS NULL\` to keep it.`,
    `Pour l'animal dont l'espèce est NULL, \`NULL NOT IN ('${a}')\` est inconnu, pas vrai : la ligne est écartée. Ajouter \`OR kind IS NULL\` pour la garder.`,
    `Para el animal cuya especie es NULL, \`NULL NOT IN ('${a}')\` es desconocido, no verdadero: la fila queda fuera. Añadir \`OR kind IS NULL\` para conservarla.`,
  ]);
};

/** NULL: `= NULL` matches nothing, `<>` leaves NULL out, IS NULL finds it. */
export const nullRows: Generator = (rng) => {
  const d = drawData(rng);
  const shape = rng.pick(["equalsNull", "different", "isNull"] as const);
  const column = rng.pick(["kind", "age"] as const);
  const value = (p: Pet): string | number | null => (column === "kind" ? p.kind : p.age);
  const nulls = d.pets.filter((p) => value(p) === null);
  if (shape === "equalsNull") {
    return draft(d, `SELECT name FROM pets WHERE ${column} = NULL;`, "pets", [], [
      result(names(nulls), "sqlNullCompared"),
      result(names(d.pets.filter((p) => value(p) !== null)), "sqlNullCompared"),
      result(names(d.pets), "sqlNullCompared"),
    ], [
      "Any comparison with NULL, even `= NULL`, is unknown, never true: no row. The test for a missing value is `IS NULL`.",
      "Toute comparaison avec NULL, même `= NULL`, est inconnue, jamais vraie : aucune ligne. Pour une valeur absente, on teste `IS NULL`.",
      "Toda comparación con NULL, incluso `= NULL`, es desconocida, nunca verdadera: ninguna fila. Para un valor ausente se usa `IS NULL`.",
    ]);
  }
  if (shape === "isNull") {
    return draft(d, `SELECT name FROM pets WHERE ${column} IS NULL;`, "pets", names(nulls), [
      result([], "sqlNullCompared"),
      result(names(d.pets.filter((p) => value(p) !== null)), "sqlNullCompared"),
      result(names(d.pets), "sqlNullCompared"),
    ], [
      "`IS NULL` is the test for a missing value: the one row where it is NULL.",
      "`IS NULL` teste une valeur absente : la seule ligne où elle est NULL.",
      "`IS NULL` comprueba un valor ausente: la única fila donde es NULL.",
    ]);
  }
  const kind = rng.pick(KINDS);
  return draft(d, `SELECT name FROM pets WHERE kind <> '${kind}' ORDER BY name;`, "pets", names(d.pets.filter((p) => p.kind !== null && p.kind !== kind)), [
    result(names(d.pets.filter((p) => p.kind !== kind)), "sqlNullCompared"),
    result(names(d.pets.filter((p) => p.kind === kind)), "sqlNullCompared"),
    result(names(d.pets.filter((p) => p.kind !== kind && p.age !== null)), "sqlNullCompared"),
  ], [
    `\`NULL <> '${kind}'\` is unknown, so the pet of unknown kind is not returned. \`kind IS DISTINCT FROM '${kind}'\` (PostgreSQL, SQLite \`IS NOT\`) would keep it.`,
    `\`NULL <> '${kind}'\` est inconnu : l'animal d'espèce inconnue n'est pas renvoyé. \`kind IS DISTINCT FROM '${kind}'\` (PostgreSQL, SQLite \`IS NOT\`) le garderait.`,
    `\`NULL <> '${kind}'\` es desconocido: el animal de especie desconocida no se devuelve. \`kind IS DISTINCT FROM '${kind}'\` (PostgreSQL, SQLite \`IS NOT\`) lo conservaría.`,
  ]);
};

/** ORDER BY … DESC LIMIT n OFFSET m. */
export const orderLimit: Generator = (rng) => {
  const d = drawData(rng);
  const aged = d.pets.filter((p) => p.age !== null);
  const desc = rng.int(0, 1) === 1;
  const limit = rng.int(2, 3);
  const offset = rng.int(1, 2);
  const sorted = (down: boolean): Pet[] => [...aged].sort((a, b) => (down ? b.age! - a.age! : a.age! - b.age!));
  const take = (down: boolean, n: number, skip: number): Cell[][] => sorted(down).slice(skip, skip + n).map((p) => [p.name]);
  return draft(d, `SELECT name FROM pets WHERE age IS NOT NULL ORDER BY age${desc ? " DESC" : ""} LIMIT ${limit} OFFSET ${offset};`, "pets", take(desc, limit, offset), [
    result(take(desc, limit, 0), "sqlLimitOffset"),
    result(take(!desc, limit, offset), "sqlSortDirection"),
    result(take(desc, offset, limit), "sqlLimitOffset"),
    result(take(desc, limit + offset, 0), "sqlLimitOffset"),
  ], [
    `Sorted by age${desc ? ", oldest first" : ", youngest first"}; OFFSET ${offset} skips ${offset === 1 ? "the first row" : "the first two rows"}, LIMIT ${limit} keeps the next ${limit}. MySQL also writes \`LIMIT ${offset}, ${limit}\`: the offset comes first there.`,
    `Triés par âge${desc ? ", du plus vieux au plus jeune" : ", du plus jeune au plus vieux"} ; OFFSET ${offset} saute ${offset === 1 ? "la première ligne" : "les deux premières lignes"}, LIMIT ${limit} garde les ${limit} suivantes. MySQL écrit aussi \`LIMIT ${offset}, ${limit}\` : le décalage vient alors en premier.`,
    `Ordenados por edad${desc ? ", del mayor al menor" : ", del menor al mayor"}; OFFSET ${offset} salta ${offset === 1 ? "la primera fila" : "las dos primeras filas"}, LIMIT ${limit} conserva las ${limit} siguientes. MySQL también escribe \`LIMIT ${offset}, ${limit}\`: ahí el desplazamiento va primero.`,
  ]);
};

// -------------------------------------------------------------- aggregates

/** COUNT(*), COUNT(column), COUNT(DISTINCT column). */
export const countValues: Generator = (rng) => {
  const d = drawData(rng);
  const all = d.pets.length;
  const known = d.pets.filter((p) => p.kind !== null).length;
  const distinct = new Set(d.pets.filter((p) => p.kind !== null).map((p) => p.kind)).size;
  const shape = rng.pick(["star", "column", "distinct"] as const);
  const q = { star: "COUNT(*)", column: "COUNT(kind)", distinct: "COUNT(DISTINCT kind)" }[shape];
  const value = { star: all, column: known, distinct }[shape];
  const n = (x: number, m?: MistakeKey): Option => result([[x]], m);
  const wrong =
    shape === "star"
      ? [n(known, "sqlCountNulls"), n(distinct, "sqlDistinct"), n(all - 1, "sqlCountNulls")]
      : shape === "column"
        ? [n(all, "sqlCountNulls"), n(distinct, "sqlDistinct"), n(known - 1, "sqlCountNulls")]
        : [n(known, "sqlDistinct"), n(distinct + 1, "sqlCountNulls"), n(all, "sqlCountNulls")];
  return draft(d, `SELECT ${q} FROM pets;`, "pets", [[value]], wrong, [
    "`COUNT(*)` counts rows; `COUNT(kind)` the rows where kind is not NULL; `COUNT(DISTINCT kind)` the different non-NULL kinds.",
    "`COUNT(*)` compte les lignes ; `COUNT(kind)` les lignes où kind n'est pas NULL ; `COUNT(DISTINCT kind)` les espèces différentes, sans NULL.",
    "`COUNT(*)` cuenta filas; `COUNT(kind)` las filas donde kind no es NULL; `COUNT(DISTINCT kind)` las especies distintas, sin NULL.",
  ]);
};

/** AVG and SUM leave NULL out. */
export const averageAge: Generator = (rng) => {
  const d = drawData(rng);
  const ages = d.pets.filter((p) => p.age !== null).map((p) => p.age!);
  const sum = ages.reduce((a, b) => a + b, 0);
  const shape = rng.pick(["avg", "sum"] as const);
  const n = (x: number, m?: MistakeKey): Option => result([[x]], m);
  if (shape === "avg") {
    return draft(d, "SELECT AVG(age) FROM pets;", "pets", [[sum / ages.length]], [n(sum / d.pets.length, "sqlAvgNulls"), n(sum, "sqlAggregateConfused"), n(ages.length, "sqlAggregateConfused")], [
      `AVG leaves the NULL age out: ${sum} / ${ages.length}, not / ${d.pets.length}. To count it as 0: \`AVG(COALESCE(age, 0))\`.`,
      `AVG ignore l'âge NULL : ${sum} / ${ages.length}, pas / ${d.pets.length}. Pour le compter comme 0 : \`AVG(COALESCE(age, 0))\`.`,
      `AVG ignora la edad NULL: ${sum} / ${ages.length}, no / ${d.pets.length}. Para contarla como 0: \`AVG(COALESCE(age, 0))\`.`,
    ]);
  }
  return draft(d, "SELECT SUM(age), COUNT(age) FROM pets;", "pets", [[sum, ages.length]], [
    result([[sum, d.pets.length]], "sqlCountNulls"),
    result([[sum / ages.length, ages.length]], "sqlAggregateConfused"),
    result([[null, ages.length]], "sqlAvgNulls"),
  ], [
    "SUM adds the known ages, leaving NULL out (a NULL does not make the sum NULL); COUNT(age) counts them.",
    "SUM additionne les âges connus, sans le NULL (un NULL ne rend pas la somme NULL) ; COUNT(age) les compte.",
    "SUM suma las edades conocidas, sin el NULL (un NULL no vuelve NULL la suma); COUNT(age) las cuenta.",
  ]);
};

/** GROUP BY with HAVING, or with WHERE first. */
export const groupCount: Generator = (rng) => {
  const d = drawData(rng);
  const counts = (pets: Pet[]): Map<string | null, number> => {
    const m = new Map<string | null, number>();
    for (const p of pets) m.set(p.kind, (m.get(p.kind) ?? 0) + 1);
    return m;
  };
  const rows = (m: Map<string | null, number>, keep: (n: number) => boolean, withNull: boolean): Cell[][] =>
    [...m]
      .filter(([k, n]) => keep(n) && (withNull || k !== null))
      .sort(([a], [b]) => (a === null ? -1 : b === null ? 1 : a < b ? -1 : 1))
      .map(([k, n]) => [k, n]);
  const shape = rng.pick(["having", "where"] as const);
  if (shape === "having") {
    const all = counts(d.pets);
    return draft(d, "SELECT kind, COUNT(*) FROM pets WHERE kind IS NOT NULL GROUP BY kind HAVING COUNT(*) > 1 ORDER BY kind;", "pets", rows(all, (n) => n > 1, false), [
      result(rows(all, () => true, false), "sqlHavingIgnored"),
      result(rows(all, (n) => n > 1, true).length === rows(all, (n) => n > 1, false).length ? rows(all, () => true, true) : rows(all, (n) => n > 1, true), "sqlNullGroup"),
      result(rows(all, (n) => n === 1, false), "sqlHavingIgnored"),
    ], [
      "WHERE removes the row of unknown kind before grouping; HAVING then keeps the groups of more than one pet.",
      "WHERE retire la ligne d'espèce inconnue avant le regroupement ; HAVING garde ensuite les groupes de plus d'un animal.",
      "WHERE quita la fila de especie desconocida antes de agrupar; HAVING conserva después los grupos de más de un animal.",
    ]);
  }
  const aged = d.pets.filter((p) => p.age !== null).map((p) => p.age!).sort((a, b) => a - b);
  const k = aged[1]!;
  const older = counts(d.pets.filter((p) => p.age !== null && p.age > k && p.kind !== null));
  const every = counts(d.pets.filter((p) => p.kind !== null));
  return draft(d, `SELECT kind, COUNT(*) FROM pets WHERE age > ${k} AND kind IS NOT NULL GROUP BY kind ORDER BY kind;`, "pets", rows(older, () => true, false), [
    result(rows(every, () => true, false), "sqlHavingIgnored"),
    result(rows(counts(d.pets.filter((p) => p.age !== null && p.age > k)), () => true, true), "sqlNullGroup"),
    result(rows(counts(d.pets.filter((p) => p.age !== null && p.age >= k && p.kind !== null)), () => true, false), "sqlBoundary"),
  ], [
    `WHERE keeps the rows first (older than ${k}, kind known), then GROUP BY counts what is left in each kind. A kind with no row left has no group at all.`,
    `WHERE garde d'abord les lignes (plus de ${k} ans, espèce connue), puis GROUP BY compte ce qui reste dans chaque espèce. Une espèce sans ligne restante n'a pas de groupe du tout.`,
    `WHERE conserva primero las filas (más de ${k} años, especie conocida), luego GROUP BY cuenta lo que queda en cada especie. Una especie sin filas restantes no tiene grupo.`,
  ]);
};

// ------------------------------------------------------------------- joins

/** INNER and LEFT JOIN, counted; owners without a pet. */
export const joinRows: Generator = (rng) => {
  const d = drawData(rng);
  const owned = d.pets.filter((p) => p.owner !== null);
  const lonely = d.owners.filter((o) => !owned.some((p) => p.owner === o.id));
  const inner = owned.length;
  const ownersLeft = inner + lonely.length;
  const petsLeft = d.pets.length;
  const cross = d.owners.length * d.pets.length;
  const n = (x: number, m?: MistakeKey): Option => result([[x]], m);
  const shape = rng.pick(["inner", "ownersLeft", "petsLeft", "without"] as const);
  const on = "ON p.owner = o.id";
  const EXPLAIN: L3 = [
    `An inner JOIN keeps the ${inner} pairs that match (the pet without an owner and the owner without a pet are lost). A LEFT JOIN keeps every row of the left table, with NULLs where nothing matches.`,
    `Un JOIN interne garde les ${inner} paires qui correspondent (l'animal sans maître et le maître sans animal disparaissent). Un LEFT JOIN garde toutes les lignes de la table de gauche, avec des NULL là où rien ne correspond.`,
    `Un JOIN interno conserva los ${inner} pares que coinciden (el animal sin dueño y el dueño sin animal se pierden). Un LEFT JOIN conserva todas las filas de la tabla de la izquierda, con NULL donde nada coincide.`,
  ];
  if (shape === "inner") {
    return draft(d, `SELECT COUNT(*) FROM owners o JOIN pets p ${on};`, "both", [[inner]], [n(ownersLeft, "sqlJoinKind"), n(petsLeft, "sqlJoinKind"), n(cross, "sqlCrossProduct"), n(d.owners.length, "sqlJoinKind")], EXPLAIN);
  }
  if (shape === "ownersLeft") {
    return draft(d, `SELECT COUNT(*) FROM owners o LEFT JOIN pets p ${on};`, "both", [[ownersLeft]], [n(inner, "sqlJoinKind"), n(petsLeft, "sqlJoinKind"), n(cross, "sqlCrossProduct"), n(d.owners.length, "sqlJoinKind")], EXPLAIN);
  }
  if (shape === "petsLeft") {
    return draft(d, `SELECT COUNT(*) FROM pets p LEFT JOIN owners o ${on};`, "both", [[petsLeft]], [n(inner, "sqlJoinKind"), n(ownersLeft, "sqlJoinKind"), n(cross, "sqlCrossProduct"), n(d.owners.length, "sqlJoinKind")], EXPLAIN);
  }
  const withPets = d.owners.filter((o) => owned.some((p) => p.owner === o.id));
  return draft(d, `SELECT o.name FROM owners o LEFT JOIN pets p ${on} WHERE p.name IS NULL;`, "both", lonely.map((o) => [o.name]), [
    result([], "sqlJoinKind"),
    result(withPets.map((o) => [o.name]), "sqlJoinKind"),
    result(d.owners.map((o) => [o.name]), "sqlJoinKind"),
  ], [
    "The LEFT JOIN gives the owner without a pet one row, with NULL in every column of pets; `WHERE p.name IS NULL` keeps exactly that row. `NOT EXISTS` says the same.",
    "Le LEFT JOIN donne au maître sans animal une ligne, avec NULL dans toutes les colonnes de pets ; `WHERE p.name IS NULL` garde exactement cette ligne. `NOT EXISTS` dit la même chose.",
    "El LEFT JOIN da al dueño sin animal una fila, con NULL en todas las columnas de pets; `WHERE p.name IS NULL` conserva exactamente esa fila. `NOT EXISTS` dice lo mismo.",
  ]);
};
