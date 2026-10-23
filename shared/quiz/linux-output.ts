/**
 * Linux, generated: what a command prints. A line of text through `sed` or
 * `awk`, a file name through bash's parameter expansion. The options are
 * outputs, each wrong one the result of a real slip (the `g` flag, fields
 * counted from 0, `#` for `%`). `check:quiz` runs every command shown with
 * the real bash, sed and awk and compares their output with the options.
 */
import type { Rng } from "./rng";
import type { Draft, Generator, Localized, MistakeKey, Option } from "./types";
import type { L3 } from "./linux/types";

const L = (t: L3): Localized => ({ en: t[0], fr: t[1], es: t[2] });
const code = (s: string): Localized => ({ en: `\`${s}\``, fr: `\`${s}\``, es: `\`${s}\`` });
const join = (sentence: L3, command: string): Localized => L(sentence.map((s) => `${s} \`${command}\``) as unknown as L3);

/** An option is an output: its identity (tex) is the text printed. */
const out = (printed: string, mistake?: MistakeKey): Option => ({ tex: printed, text: code(printed), ...(mistake ? { mistake } : {}) });

const PRINTS: L3 = ["What does this command print?", "Qu'affiche cette commande ?", "¿Qué muestra esta orden?"];

function draft(command: string, correct: string, wrong: Option[], explanation: L3): Draft {
  return {
    prompt: { key: "concept", tex: "", id: command, text: join(PRINTS, command) },
    correct: out(correct),
    wrong: wrong.filter((o) => o.tex !== "" && o.tex !== correct),
    explanation: { key: "concept", tex: "", text: L(explanation) },
    verify: { kind: "shell", command },
  };
}

const fill = (t: L3, values: Record<string, string>): L3 =>
  t.map((s) => s.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? "")) as unknown as L3;

// --------------------------------------------------------------------- sed

const ANIMALS = ["cat", "dog", "fox", "owl", "bee", "elk", "yak"];
const FILLERS = ["and", "saw", "met", "then", "or", "with", "near"];

/** `echo '…' | sed 's/…/…/…'`: which matches are replaced, and by what. */
export const sedSubstitute: Generator = (rng: Rng) => {
  const shape = rng.pick(["first", "global", "nth", "ampersand", "greedy", "groups"] as const);
  const [t, r] = rng.shuffle(ANIMALS).slice(0, 2) as [string, string];
  const fillers = rng.shuffle(FILLERS);
  // Three occurrences of t, two filler words between them: "cat and cat saw cat".
  const words = [t, fillers[0]!, t, fillers[1]!, t];
  const line = words.join(" ");
  /** The line with the occurrences in `which` (0, 1, 2) replaced by `by`. */
  const replace = (which: number[], by: string): string => {
    let k = -1;
    return words.map((w) => (w === t && which.includes(++k) ? by : w)).join(" ");
  };
  const echo = (text: string, script: string, flags = ""): string => `echo '${text}' | sed ${flags}'${script}'`;
  switch (shape) {
    case "first":
      return draft(echo(line, `s/${t}/${r}/`), replace([0], r), [out(replace([0, 1, 2], r), "sedFlagMisread"), out(replace([2], r), "sedFlagMisread"), out(replace([1], r), "sedFlagMisread")], [
        "Without a flag, `s` replaces the first match of each line only; `g` replaces them all.",
        "Sans option, `s` ne remplace que la première correspondance de chaque ligne ; `g` les remplace toutes.",
        "Sin opción, `s` solo sustituye la primera coincidencia de cada línea; `g` las sustituye todas.",
      ]);
    case "global":
      return draft(echo(line, `s/${t}/${r}/g`), replace([0, 1, 2], r), [out(replace([0], r), "sedFlagMisread"), out(replace([2], r), "sedFlagMisread"), out(replace([0, 1], r), "sedFlagMisread")], [
        "`g` (global) replaces every match on the line, not only the first.",
        "`g` (global) remplace toutes les correspondances de la ligne, pas seulement la première.",
        "`g` (global) sustituye todas las coincidencias de la línea, no solo la primera.",
      ]);
    case "nth":
      return draft(echo(line, `s/${t}/${r}/2`), replace([1], r), [out(replace([0], r), "sedFlagMisread"), out(replace([1, 2], r), "sedFlagMisread"), out(replace([0, 1], r), "sedFlagMisread")], [
        "A number as flag replaces only that match: `2` the second. `2g` would replace the second and every one after it.",
        "Un nombre comme option ne remplace que cette correspondance-là : `2` la deuxième. `2g` remplacerait la deuxième et toutes les suivantes.",
        "Un número como opción solo sustituye esa coincidencia: `2` la segunda. `2g` sustituiría la segunda y todas las siguientes.",
      ]);
    case "ampersand":
      return draft(echo(line, `s/${t}/[&]/g`), replace([0, 1, 2], `[${t}]`), [out(replace([0, 1, 2], "[&]"), "sedReference"), out(replace([0], `[${t}]`), "sedFlagMisread"), out(replace([0, 1, 2], "[]"), "sedReference")], [
        "In the replacement, `&` stands for the text that matched; write `\\&` for a literal ampersand.",
        "Dans le remplacement, `&` représente le texte trouvé ; écrire `\\&` pour une esperluette littérale.",
        "En la sustitución, `&` representa el texto encontrado; escribir `\\&` para un «&» literal.",
      ]);
    case "greedy": {
      const [a, b] = rng.shuffle(ANIMALS).slice(0, 2) as [string, string];
      const [x, y] = fillers.slice(2, 4) as [string, string];
      const quoted = `${x} "${a}" or "${b}" ${y}`;
      return draft(echo(quoted, 's/".*"/X/'), `${x} X ${y}`, [out(`${x} X or "${b}" ${y}`, "regexGreedy"), out(`${x} X or X ${y}`, "regexGreedy"), out("X", "sedWholeLine")], [
        "`.*` is greedy: it takes the longest match, from the first quote to the last. `\"[^\"]*\"` stops at the next quote.",
        "`.*` est gourmand : il prend la plus longue correspondance, du premier guillemet au dernier. `\"[^\"]*\"` s'arrête au guillemet suivant.",
        "`.*` es codicioso: toma la coincidencia más larga, de la primera comilla a la última. `\"[^\"]*\"` se detiene en la comilla siguiente.",
      ]);
    }
    case "groups": {
      const four = rng.shuffle(ANIMALS).slice(0, 4);
      const [w1, w2, w3, w4] = four as [string, string, string, string];
      return draft(
        echo(four.join(" "), "s/([a-z]+) ([a-z]+)/\\2 \\1/", "-E "),
        `${w2} ${w1} ${w3} ${w4}`,
        [out(`${w2} ${w1} ${w4} ${w3}`, "sedFlagMisread"), out(`\\2 \\1 ${w3} ${w4}`, "sedReference"), out(`${w2} ${w1}`, "sedWholeLine")],
        [
          "With `-E`, parentheses capture and `\\1`, `\\2` give back what they caught. Without `g`, only the first pair is swapped; the rest of the line stays.",
          "Avec `-E`, les parenthèses capturent et `\\1`, `\\2` rendent ce qu'elles ont pris. Sans `g`, seule la première paire est échangée ; le reste de la ligne demeure.",
          "Con `-E`, los paréntesis capturan y `\\1`, `\\2` devuelven lo capturado. Sin `g`, solo se intercambia el primer par; el resto de la línea se queda.",
        ],
      );
    }
  }
};

// --------------------------------------------------------------------- awk

const NAMES = ["ana", "ben", "carla", "dev", "emil", "femke", "goran"];
const CITIES = ["lund", "palma", "bern", "kyoto", "lyon", "oslo"];
const SURNAMES = ["Lopez", "Berg", "Rossi", "Weber", "Dubois"];
const SHELLS = ["/bin/bash", "/bin/zsh", "/bin/sh"];

/** `… | awk '{print $2}'`: fields, NF and $NF, separators. */
export const awkFields: Generator = (rng: Rng) => {
  const shape = rng.pick(["field", "colon", "nf", "lastField", "concat", "comma"] as const);
  const name = rng.pick(NAMES);
  const city = rng.pick(CITIES);
  const qty = String(rng.int(2, 9));
  const price = `${rng.int(10, 99)}.${rng.pick(["50", "25", "90"])}`;
  const year = String(rng.int(2019, 2026));
  const fields = rng.int(0, 1) === 1 ? [name, city, qty, price, year] : [name, city, qty, price];
  const line = fields.join(" ");
  const f = (n: number): string => fields[n - 1] ?? "";
  const echo = (text: string, program: string, flags = ""): string => `echo '${text}' | awk ${flags}'${program}'`;
  switch (shape) {
    case "field": {
      const n = rng.int(2, fields.length - 1);
      return draft(echo(line, `{print $${n}}`), f(n), [out(f(n - 1), "fieldOffByOne"), out(f(n + 1), "fieldOffByOne"), out(String(fields.length), "awkNfConfused")], [
        "Fields are numbered from 1, split on runs of spaces and tabs; `$0` is the whole line and `NF` the number of fields.",
        "Les champs sont numérotés à partir de 1, séparés par des suites d'espaces et de tabulations ; `$0` est la ligne entière et `NF` le nombre de champs.",
        "Los campos se numeran desde 1, separados por series de espacios y tabuladores; `$0` es la línea entera y `NF` el número de campos.",
      ]);
    }
    case "colon": {
      const uid = String(rng.int(1001, 1099));
      const surname = rng.pick(SURNAMES);
      const gecos = `${name[0]!.toUpperCase()}${name.slice(1)} ${surname}`;
      const entry = [name, "x", uid, uid, gecos, `/home/${name}`, rng.pick(SHELLS)];
      const passwd = entry.join(":");
      const n = rng.int(5, 6);
      return draft(echo(passwd, `{print $${n}}`, "-F: "), entry[n - 1]!, [out(entry[n - 2]!, "fieldOffByOne"), out(entry[n]!, "fieldOffByOne"), out(passwd.split(" ")[0]!, "awkSeparator")], fill([
        "`-F:` makes `:` the separator, so the name with its space stays one field: {v}. Without `-F`, awk would split on the space.",
        "`-F:` fait de `:` le séparateur : le nom, avec son espace, reste un seul champ : {v}. Sans `-F`, awk couperait à l'espace.",
        "`-F:` hace de `:` el separador: el nombre, con su espacio, sigue siendo un solo campo: {v}. Sin `-F`, awk cortaría en el espacio.",
      ], { v: `\`${entry[n - 1]!}\`` }));
    }
    case "nf":
      return draft(echo(line, "{print NF}"), String(fields.length), [out(String(fields.length - 1), "fieldOffByOne"), out(String(fields.length + 1), "fieldOffByOne"), out(f(fields.length), "awkNfConfused")], [
        "`NF` is the number of fields of the line; `$NF` is the last field itself.",
        "`NF` est le nombre de champs de la ligne ; `$NF` est le dernier champ lui-même.",
        "`NF` es el número de campos de la línea; `$NF` es el último campo en sí.",
      ]);
    case "lastField":
      return draft(echo(line, "{print $NF}"), f(fields.length), [out(String(fields.length), "awkNfConfused"), out(f(fields.length - 1), "fieldOffByOne"), out(line, "fieldOffByOne")], [
        "`$NF` is the field whose number is `NF`: the last one. `$(NF-1)` is the one before; `$0` the whole line.",
        "`$NF` est le champ dont le numéro est `NF` : le dernier. `$(NF-1)` est celui d'avant ; `$0` la ligne entière.",
        "`$NF` es el campo cuyo número es `NF`: el último. `$(NF-1)` es el anterior; `$0` la línea entera.",
      ]);
    case "concat":
      return draft(echo(line, "{print $1 $3}"), `${f(1)}${f(3)}`, [out(`${f(1)} ${f(3)}`, "awkConcat"), out(`${f(2)}${f(4)}`, "fieldOffByOne"), out(`${f(1)} ${f(2)} ${f(3)}`, "awkConcat")], [
        "Side by side, `$1 $3` are joined with nothing between them. A comma, `$1, $3`, puts the output separator `OFS` (a space) between them.",
        "Côte à côte, `$1 $3` sont collés sans rien entre eux. Une virgule, `$1, $3`, met entre eux le séparateur de sortie `OFS` (une espace).",
        "Uno junto al otro, `$1 $3` se pegan sin nada en medio. Una coma, `$1, $3`, pone entre ellos el separador de salida `OFS` (un espacio).",
      ]);
    case "comma":
      return draft(echo(line, "{print $1, $3}"), `${f(1)} ${f(3)}`, [out(`${f(1)}${f(3)}`, "awkConcat"), out(`${f(1)}, ${f(3)}`, "awkConcat"), out(`${f(2)} ${f(4)}`, "fieldOffByOne")], [
        "The comma in `print` puts `OFS` between the values, a space by default; it is not printed itself.",
        "La virgule de `print` met `OFS` entre les valeurs, une espace par défaut ; elle-même n'est pas affichée.",
        "La coma de `print` pone `OFS` entre los valores, un espacio por defecto; ella misma no se muestra.",
      ]);
  }
};

// ----------------------------------------------------- parameter expansion

const BASES = ["backup.tar.gz", "trip.2026.jpg", "app.min.js", "data.2026.10.csv", "notes.v2.md", "report.final.pdf", "site.conf.bak"];
const DIRS = ["", "/srv/app/", "/home/ana/", "logs/", "/tmp/"];

/** `#` or `%`, single or doubled, with the pattern `*.` or `.*`. */
type Strip = { front: boolean; longest: boolean };
const OPS: Strip[] = [
  { front: true, longest: false },
  { front: true, longest: true },
  { front: false, longest: false },
  { front: false, longest: true },
];
const syntax = (op: Strip): string => (op.front ? (op.longest ? "##*." : "#*.") : op.longest ? "%%.*" : "%.*");
/** What bash gives (the directories have no dot: the first dot is the name's). */
function strip(f: string, op: Strip): string {
  const at = op.front === op.longest ? f.lastIndexOf(".") : f.indexOf(".");
  return op.front ? f.slice(at + 1) : f.slice(0, at);
}

/** `f=backup.tar.gz; echo "${f%.*}"`: removing a pattern from the front or the back. */
export const paramExpansion: Generator = (rng: Rng) => {
  const f = rng.pick(DIRS) + rng.pick(BASES);
  const op = rng.pick(OPS);
  const command = `f=${f}; echo "\${f${syntax(op)}}"`;
  const wrong = OPS.filter((o) => o !== op).map((o) => out(strip(f, o), o.front === op.front ? "expansionLongest" : "expansionSide"));
  return draft(command, strip(f, op), wrong, fill([
    "`#` removes the pattern from the front, `%` from the back; doubled (`##`, `%%`) it removes the longest match, single the shortest. So `${f%.*}` drops the last extension and `${f##*.}` keeps only it. Here: {v}.",
    "`#` retire le motif au début, `%` à la fin ; doublé (`##`, `%%`), il retire la plus longue correspondance, simple la plus courte. Ainsi `${f%.*}` enlève la dernière extension et `${f##*.}` ne garde qu'elle. Ici : {v}.",
    "`#` quita el patrón por delante, `%` por detrás; doble (`##`, `%%`) quita la coincidencia más larga, simple la más corta. Así `${f%.*}` quita la última extensión y `${f##*.}` solo deja esa. Aquí: {v}.",
  ], { v: `\`${strip(f, op)}\`` }));
};
