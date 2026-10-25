/**
 * SQL, the language: reading (filters, NULL, sorting, expressions),
 * aggregating, joining, and changing data and schemas. Where PostgreSQL,
 * SQLite and MySQL differ, the question says so. Code between backticks is
 * the same in the three languages.
 */
import type { LinuxQuestion as SqlQuestion } from "../linux/types";

// ----------------------------------------------------------------- reading

const filtering: SqlQuestion[] = [
  {
    id: "sq-filter-01",
    q: ["Which ages does `WHERE age BETWEEN 3 AND 5` keep?", "Quels âges garde `WHERE age BETWEEN 3 AND 5` ?", "¿Qué edades conserva `WHERE age BETWEEN 3 AND 5`?"],
    a: ["3, 4 and 5: both ends are included", "3, 4 et 5 : les deux bornes sont comprises", "3, 4 y 5: los dos extremos se incluyen"],
    w: [
      ["Only 4: both ends are excluded", "Seulement 4 : les deux bornes sont exclues", "Solo 4: los dos extremos se excluyen"],
      ["3 and 4: the upper end is excluded", "3 et 4 : la borne supérieure est exclue", "3 y 4: el extremo superior se excluye"],
      ["4 and 5: the lower end is excluded", "4 et 5 : la borne inférieure est exclue", "4 y 5: el extremo inferior se excluye"],
    ],
    e: [
      "`BETWEEN a AND b` means `>= a AND <= b`. With dates and times, `BETWEEN '2026-01-01' AND '2026-01-31'` misses most of the 31st: `>= '2026-01-01' AND < '2026-02-01'` is safer.",
      "`BETWEEN a AND b` veut dire `>= a AND <= b`. Avec des dates et heures, `BETWEEN '2026-01-01' AND '2026-01-31'` manque presque tout le 31 : `>= '2026-01-01' AND < '2026-02-01'` est plus sûr.",
      "`BETWEEN a AND b` significa `>= a AND <= b`. Con fechas y horas, `BETWEEN '2026-01-01' AND '2026-01-31'` pierde casi todo el día 31: `>= '2026-01-01' AND < '2026-02-01'` es más seguro.",
    ],
  },
  {
    id: "sq-filter-02",
    q: ["Which names does `WHERE name LIKE '_a%'` match?", "Quels noms correspondent à `WHERE name LIKE '_a%'` ?", "¿Qué nombres encajan con `WHERE name LIKE '_a%'`?"],
    a: ["Those whose second letter is a, like `Paul`", "Ceux dont la deuxième lettre est un a, comme `Paul`", "Los que tienen una a como segunda letra, como `Paul`"],
    w: [
      ["Those that start with a, like `anna`", "Ceux qui commencent par a, comme `anna`", "Los que empiezan por a, como `anna`"],
      ["Those that contain an a anywhere", "Ceux qui contiennent un a n'importe où", "Los que contienen una a en cualquier sitio"],
      ["Those that start with an underscore and an a", "Ceux qui commencent par un tiret bas et un a", "Los que empiezan por un guion bajo y una a"],
    ],
    e: [
      "In `LIKE`, `_` stands for exactly one character and `%` for any number (none included). A literal `_` or `%` is escaped: `LIKE 'a\\_%' ESCAPE '\\'`.",
      "Dans `LIKE`, `_` vaut exactement un caractère et `%` un nombre quelconque (aucun compris). Un `_` ou un `%` littéral s'échappe : `LIKE 'a\\_%' ESCAPE '\\'`.",
      "En `LIKE`, `_` vale exactamente un carácter y `%` cualquier número (ninguno incluido). Un `_` o `%` literal se escapa: `LIKE 'a\\_%' ESCAPE '\\'`.",
    ],
  },
  {
    id: "sq-filter-03",
    q: ["Does `WHERE name LIKE 'ana%'` find `Ana`?", "`WHERE name LIKE 'ana%'` trouve-t-il `Ana` ?", "¿Encuentra `WHERE name LIKE 'ana%'` a `Ana`?"],
    a: ["It depends: not in PostgreSQL (use `ILIKE`), yes in SQLite and with MySQL's default collation", "Ça dépend : pas en PostgreSQL (utiliser `ILIKE`), oui en SQLite et avec la collation par défaut de MySQL", "Depende: no en PostgreSQL (usar `ILIKE`), sí en SQLite y con la intercalación por defecto de MySQL"],
    w: [
      ["Yes, everywhere: SQL is case-insensitive", "Oui, partout : SQL ignore la casse", "Sí, en todas partes: SQL no distingue mayúsculas"],
      ["No, nowhere: `LIKE` always compares case", "Non, nulle part : `LIKE` tient toujours compte de la casse", "No, en ninguna parte: `LIKE` siempre distingue mayúsculas"],
      ["Only with `%` at both ends", "Seulement avec `%` aux deux bouts", "Solo con `%` en los dos extremos"],
    ],
    e: [
      "Keywords are case-insensitive, data is not necessarily. PostgreSQL compares case (`ILIKE` or `lower(name) LIKE 'ana%'` do not); SQLite's `LIKE` ignores case for ASCII letters; in MySQL it follows the column's collation, case-insensitive by default (`_ci`).",
      "Les mots-clés ignorent la casse, les données pas forcément. PostgreSQL tient compte de la casse (`ILIKE` ou `lower(name) LIKE 'ana%'` non) ; le `LIKE` de SQLite l'ignore pour les lettres ASCII ; en MySQL, il suit la collation de la colonne, insensible à la casse par défaut (`_ci`).",
      "Las palabras clave no distinguen mayúsculas, los datos no necesariamente. PostgreSQL las distingue (`ILIKE` o `lower(name) LIKE 'ana%'` no); el `LIKE` de SQLite las ignora en letras ASCII; en MySQL sigue la intercalación de la columna, que por defecto no las distingue (`_ci`).",
    ],
  },
  {
    id: "sq-filter-04",
    q: ["What does `SELECT DISTINCT kind, age FROM pets` remove?", "Que retire `SELECT DISTINCT kind, age FROM pets` ?", "¿Qué elimina `SELECT DISTINCT kind, age FROM pets`?"],
    a: ["Rows whose pair (kind, age) repeats", "Les lignes dont le couple (kind, age) se répète", "Las filas cuyo par (kind, age) se repite"],
    w: [
      ["Rows whose kind repeats, whatever the age", "Les lignes dont l'espèce se répète, quel que soit l'âge", "Las filas cuya especie se repite, sea cual sea la edad"],
      ["Rows whose age repeats", "Les lignes dont l'âge se répète", "Las filas cuya edad se repite"],
      ["Nothing: `DISTINCT` only works with one column", "Rien : `DISTINCT` ne marche qu'avec une colonne", "Nada: `DISTINCT` solo funciona con una columna"],
    ],
    e: [
      "`DISTINCT` applies to the whole row selected. One row per kind needs `GROUP BY kind` with aggregates, or PostgreSQL's `DISTINCT ON (kind)`.",
      "`DISTINCT` porte sur toute la ligne sélectionnée. Une ligne par espèce demande `GROUP BY kind` avec des agrégats, ou le `DISTINCT ON (kind)` de PostgreSQL.",
      "`DISTINCT` se aplica a toda la fila seleccionada. Una fila por especie requiere `GROUP BY kind` con agregados, o el `DISTINCT ON (kind)` de PostgreSQL.",
    ],
  },
  {
    id: "sq-filter-05",
    q: ["`WHERE name = \"Ana\"` fails in PostgreSQL with `column \"Ana\" does not exist`. Why?", "`WHERE name = \"Ana\"` échoue en PostgreSQL avec `column \"Ana\" does not exist`. Pourquoi ?", "`WHERE name = \"Ana\"` falla en PostgreSQL con `column \"Ana\" does not exist`. ¿Por qué?"],
    a: ["Double quotes name a column or table; text goes in single quotes: `'Ana'`", "Les guillemets doubles nomment une colonne ou une table ; le texte va entre apostrophes : `'Ana'`", "Las comillas dobles nombran una columna o tabla; el texto va entre comillas simples: `'Ana'`"],
    w: [
      ["Text with a capital needs `ILIKE`", "Un texte avec une majuscule demande `ILIKE`", "Un texto con mayúscula necesita `ILIKE`"],
      ["The column `name` is a reserved word", "La colonne `name` est un mot réservé", "La columna `name` es una palabra reservada"],
      ["PostgreSQL does not compare text with `=`", "PostgreSQL ne compare pas du texte avec `=`", "PostgreSQL no compara texto con `=`"],
    ],
    e: [
      "Standard SQL: 'text' is a string, \"Name\" an identifier (case kept). SQLite falls back to a string when no column has that name; MySQL takes double quotes as strings, and uses backticks for names, unless `ANSI_QUOTES` is set.",
      "SQL standard : 'texte' est une chaîne, \"Nom\" un identifiant (casse gardée). SQLite se rabat sur une chaîne quand aucune colonne ne porte ce nom ; MySQL prend les guillemets doubles pour des chaînes et nomme avec des accents graves, sauf avec `ANSI_QUOTES`.",
      "SQL estándar: 'texto' es una cadena, \"Nombre\" un identificador (respeta mayúsculas). SQLite recurre a una cadena si ninguna columna tiene ese nombre; MySQL toma las comillas dobles como cadenas y usa acentos graves para los nombres, salvo con `ANSI_QUOTES`.",
    ],
  },
];

const nulls: SqlQuestion[] = [
  {
    id: "sq-null-01",
    q: ["What is `NULL + 1`?", "Que vaut `NULL + 1` ?", "¿Cuánto vale `NULL + 1`?"],
    a: ["NULL: an unknown plus one is still unknown", "NULL : un inconnu plus un reste inconnu", "NULL: un desconocido más uno sigue siendo desconocido"],
    w: [["1: NULL counts as 0", "1 : NULL compte pour 0", "1: NULL cuenta como 0"], ["An error", "Une erreur", "Un error"], ["`'NULL1'`: it is joined as text", "`'NULL1'` : c'est collé comme du texte", "`'NULL1'`: se une como texto"]],
    e: [
      "Almost every operator and function returns NULL when one argument is NULL; `COALESCE(x, 0) + 1` gives a default. Aggregates are the exception: `SUM` and `AVG` skip NULLs.",
      "Presque tous les opérateurs et fonctions renvoient NULL quand un argument est NULL ; `COALESCE(x, 0) + 1` donne une valeur par défaut. Les agrégats font exception : `SUM` et `AVG` ignorent les NULL.",
      "Casi todos los operadores y funciones devuelven NULL cuando un argumento es NULL; `COALESCE(x, 0) + 1` da un valor por defecto. Los agregados son la excepción: `SUM` y `AVG` ignoran los NULL.",
    ],
  },
  {
    id: "sq-null-02",
    q: ["What does `COALESCE(nickname, first_name, 'friend')` return?", "Que renvoie `COALESCE(nickname, first_name, 'friend')` ?", "¿Qué devuelve `COALESCE(nickname, first_name, 'friend')`?"],
    a: ["The first of the three that is not NULL", "Le premier des trois qui n'est pas NULL", "El primero de los tres que no es NULL"],
    w: [["The three joined together", "Les trois mis bout à bout", "Los tres unidos"], ["NULL if any of them is NULL", "NULL si l'un d'eux est NULL", "NULL si alguno es NULL"], ["The longest of the three", "Le plus long des trois", "El más largo de los tres"]],
    e: [
      "`COALESCE` is standard and works in all three; MySQL and SQLite also have `IFNULL(a, b)` for two values. `NULLIF(a, b)` does the reverse: NULL when a equals b.",
      "`COALESCE` est standard et marche dans les trois ; MySQL et SQLite ont aussi `IFNULL(a, b)` pour deux valeurs. `NULLIF(a, b)` fait l'inverse : NULL quand a vaut b.",
      "`COALESCE` es estándar y funciona en los tres; MySQL y SQLite también tienen `IFNULL(a, b)` para dos valores. `NULLIF(a, b)` hace lo contrario: NULL cuando a es igual a b.",
    ],
  },
  {
    id: "sq-null-03",
    q: ["`SELECT * FROM a WHERE id NOT IN (SELECT a_id FROM b)` returns no row at all, though some ids are missing from b. Why?", "`SELECT * FROM a WHERE id NOT IN (SELECT a_id FROM b)` ne renvoie aucune ligne, alors que des id manquent dans b. Pourquoi ?", "`SELECT * FROM a WHERE id NOT IN (SELECT a_id FROM b)` no devuelve ninguna fila, aunque faltan ids en b. ¿Por qué?"],
    a: ["`b.a_id` contains a NULL: `NOT IN` is then never true; use `NOT EXISTS`", "`b.a_id` contient un NULL : `NOT IN` n'est alors jamais vrai ; utiliser `NOT EXISTS`", "`b.a_id` contiene un NULL: `NOT IN` nunca es verdadero entonces; usar `NOT EXISTS`"],
    w: [["A subquery cannot be used with `NOT IN`", "Une sous-requête ne s'utilise pas avec `NOT IN`", "Una subconsulta no se usa con `NOT IN`"], ["`NOT IN` compares text only", "`NOT IN` ne compare que du texte", "`NOT IN` solo compara texto"], ["The ids must be sorted first", "Les id doivent d'abord être triés", "Los ids deben ordenarse antes"]],
    e: [
      "`x NOT IN (1, NULL)` means `x <> 1 AND x <> NULL`, and `x <> NULL` is unknown. `WHERE NOT EXISTS (SELECT 1 FROM b WHERE b.a_id = a.id)` is not fooled by NULLs.",
      "`x NOT IN (1, NULL)` veut dire `x <> 1 AND x <> NULL`, et `x <> NULL` est inconnu. `WHERE NOT EXISTS (SELECT 1 FROM b WHERE b.a_id = a.id)` ne se laisse pas piéger par les NULL.",
      "`x NOT IN (1, NULL)` significa `x <> 1 AND x <> NULL`, y `x <> NULL` es desconocido. `WHERE NOT EXISTS (SELECT 1 FROM b WHERE b.a_id = a.id)` no se deja engañar por los NULL.",
    ],
  },
  {
    id: "sq-null-04",
    q: ["Where do NULLs go with `ORDER BY age`?", "Où vont les NULL avec `ORDER BY age` ?", "¿Dónde van los NULL con `ORDER BY age`?"],
    a: ["Last in PostgreSQL, first in SQLite and MySQL; `NULLS FIRST`/`NULLS LAST` decides", "En dernier en PostgreSQL, en premier en SQLite et MySQL ; `NULLS FIRST`/`NULLS LAST` décide", "Al final en PostgreSQL, al principio en SQLite y MySQL; `NULLS FIRST`/`NULLS LAST` decide"],
    w: [["They are left out of the result", "Ils sont écartés du résultat", "Se excluyen del resultado"], ["Always first, as the smallest value", "Toujours en premier, comme la plus petite valeur", "Siempre al principio, como el valor más pequeño"], ["In random places", "À des places au hasard", "En lugares al azar"]],
    e: [
      "PostgreSQL treats NULL as larger than any value, SQLite and MySQL as smaller. `NULLS LAST` exists in PostgreSQL and SQLite (3.30+); in MySQL, sort on `age IS NULL` first: `ORDER BY age IS NULL, age`.",
      "PostgreSQL traite NULL comme plus grand que toute valeur, SQLite et MySQL comme plus petit. `NULLS LAST` existe en PostgreSQL et SQLite (3.30+) ; en MySQL, trier d'abord sur `age IS NULL` : `ORDER BY age IS NULL, age`.",
      "PostgreSQL trata NULL como mayor que cualquier valor, SQLite y MySQL como menor. `NULLS LAST` existe en PostgreSQL y SQLite (3.30+); en MySQL, ordenar primero por `age IS NULL`: `ORDER BY age IS NULL, age`.",
    ],
  },
  {
    id: "sq-null-05",
    q: ["What does `NULL = NULL` give?", "Que donne `NULL = NULL` ?", "¿Qué da `NULL = NULL`?"],
    a: ["NULL (unknown), so a `WHERE` with it keeps no row", "NULL (inconnu) : un `WHERE` avec lui ne garde aucune ligne", "NULL (desconocido): un `WHERE` con él no conserva ninguna fila"],
    w: [["TRUE", "TRUE", "TRUE"], ["FALSE", "FALSE", "FALSE"], ["An error", "Une erreur", "Un error"]],
    e: [
      "Two unknowns are not known to be equal. `IS NULL` tests for NULL; to compare two columns that may both be NULL: `a IS NOT DISTINCT FROM b` (PostgreSQL, SQLite 3.39+), `a IS b` (SQLite), `a <=> b` (MySQL).",
      "Deux inconnus ne sont pas connus pour être égaux. `IS NULL` teste NULL ; pour comparer deux colonnes peut-être NULL toutes deux : `a IS NOT DISTINCT FROM b` (PostgreSQL, SQLite 3.39+), `a IS b` (SQLite), `a <=> b` (MySQL).",
      "Dos desconocidos no se sabe si son iguales. `IS NULL` comprueba NULL; para comparar dos columnas que pueden ser ambas NULL: `a IS NOT DISTINCT FROM b` (PostgreSQL, SQLite 3.39+), `a IS b` (SQLite), `a <=> b` (MySQL).",
    ],
  },
];

const sorting: SqlQuestion[] = [
  {
    id: "sq-sort-01",
    q: ["A query has no `ORDER BY`. In which order do its rows come?", "Une requête n'a pas d'`ORDER BY`. Dans quel ordre viennent ses lignes ?", "Una consulta no tiene `ORDER BY`. ¿En qué orden llegan sus filas?"],
    a: ["No order is promised: it may change from one run to the next", "Aucun ordre n'est garanti : il peut changer d'une fois à l'autre", "No se garantiza ningún orden: puede cambiar de una vez a otra"],
    w: [["In insertion order", "Dans l'ordre d'insertion", "En el orden de inserción"], ["Sorted by primary key", "Triées par clé primaire", "Ordenadas por clave primaria"], ["Sorted by the first column", "Triées par la première colonne", "Ordenadas por la primera columna"]],
    e: [
      "The order reflects how the engine happened to read the data (a scan, an index, parallel workers). It often looks stable on small tables and breaks later: whenever order matters, say `ORDER BY`.",
      "L'ordre reflète la façon dont le moteur a lu les données (un parcours, un index, des processus parallèles). Il semble souvent stable sur de petites tables puis change : dès que l'ordre compte, écrire `ORDER BY`.",
      "El orden refleja cómo el motor leyó los datos (un recorrido, un índice, procesos paralelos). Suele parecer estable en tablas pequeñas y luego cambia: cuando el orden importa, escribir `ORDER BY`.",
    ],
  },
  {
    id: "sq-sort-02",
    q: ["In `ORDER BY kind, age DESC`, what is sorted in descending order?", "Dans `ORDER BY kind, age DESC`, qu'est-ce qui est trié par ordre décroissant ?", "En `ORDER BY kind, age DESC`, ¿qué se ordena de forma descendente?"],
    a: ["Only age, within each kind; kind stays ascending", "Seulement l'âge, à l'intérieur de chaque espèce ; l'espèce reste croissante", "Solo la edad, dentro de cada especie; la especie sigue ascendente"],
    w: [["Both columns", "Les deux colonnes", "Las dos columnas"], ["Only kind", "Seulement l'espèce", "Solo la especie"], ["The whole result, reversed at the end", "Tout le résultat, inversé à la fin", "Todo el resultado, invertido al final"]],
    e: [
      "`ASC` (the default) or `DESC` belongs to each sort key. Both descending: `ORDER BY kind DESC, age DESC`.",
      "`ASC` (par défaut) ou `DESC` s'applique à chaque clé de tri. Les deux décroissantes : `ORDER BY kind DESC, age DESC`.",
      "`ASC` (por defecto) o `DESC` se aplica a cada clave de ordenación. Las dos descendentes: `ORDER BY kind DESC, age DESC`.",
    ],
  },
  {
    id: "sq-sort-03",
    q: ["What does `ORDER BY 2` sort by?", "Selon quoi trie `ORDER BY 2` ?", "¿Por qué ordena `ORDER BY 2`?"],
    a: ["The second column of the `SELECT` list", "La deuxième colonne de la liste du `SELECT`", "La segunda columna de la lista del `SELECT`"],
    w: [["The constant 2, so nothing changes", "La constante 2 : rien ne change", "La constante 2: nada cambia"], ["The second column of the table", "La deuxième colonne de la table", "La segunda columna de la tabla"], ["Every second row", "Une ligne sur deux", "Una fila de cada dos"]],
    e: [
      "Handy at the prompt, fragile in code: adding a column to the `SELECT` changes the sort. Naming the column, or its alias, is clearer.",
      "Pratique à la main, fragile dans du code : ajouter une colonne au `SELECT` change le tri. Nommer la colonne, ou son alias, est plus clair.",
      "Práctico a mano, frágil en código: añadir una columna al `SELECT` cambia el orden. Nombrar la columna, o su alias, es más claro.",
    ],
  },
  {
    id: "sq-sort-04",
    q: ["Page 5000 of a list, with `ORDER BY id LIMIT 20 OFFSET 100000`, is slow. What is faster?", "La page 5000 d'une liste, avec `ORDER BY id LIMIT 20 OFFSET 100000`, est lente. Qu'est-ce qui est plus rapide ?", "La página 5000 de una lista, con `ORDER BY id LIMIT 20 OFFSET 100000`, es lenta. ¿Qué es más rápido?"],
    a: ["Start after the last id seen: `WHERE id > 100020 ORDER BY id LIMIT 20`", "Repartir après le dernier id vu : `WHERE id > 100020 ORDER BY id LIMIT 20`", "Seguir tras el último id visto: `WHERE id > 100020 ORDER BY id LIMIT 20`"],
    w: [["A larger `LIMIT`", "Un `LIMIT` plus grand", "Un `LIMIT` mayor"], ["Removing the `ORDER BY`", "Retirer l'`ORDER BY`", "Quitar el `ORDER BY`"], ["`SELECT DISTINCT`", "`SELECT DISTINCT`", "`SELECT DISTINCT`"]],
    e: [
      "`OFFSET` still reads and throws away every skipped row. Keyset (seek) pagination jumps there through the index on id, whatever the page.",
      "`OFFSET` lit quand même chaque ligne sautée, puis la jette. La pagination par clé y saute directement par l'index sur id, quelle que soit la page.",
      "`OFFSET` lee igualmente cada fila saltada y la descarta. La paginación por clave salta directamente por el índice de id, sea cual sea la página.",
    ],
  },
  {
    id: "sq-sort-05",
    q: ["Two rows tie on the sort key. With `ORDER BY score DESC LIMIT 10`, which one is in the top ten?", "Deux lignes sont à égalité sur la clé de tri. Avec `ORDER BY score DESC LIMIT 10`, laquelle est dans les dix premières ?", "Dos filas empatan en la clave de orden. Con `ORDER BY score DESC LIMIT 10`, ¿cuál está entre las diez primeras?"],
    a: ["Either: add a tie-breaker, `ORDER BY score DESC, id`", "L'une ou l'autre : ajouter un départage, `ORDER BY score DESC, id`", "Cualquiera: añadir un desempate, `ORDER BY score DESC, id`"],
    w: [["The one inserted first", "Celle insérée en premier", "La insertada primero"], ["Both: `LIMIT` keeps ties", "Les deux : `LIMIT` garde les égalités", "Las dos: `LIMIT` conserva los empates"], ["Neither: ties are left out", "Aucune : les égalités sont écartées", "Ninguna: los empates se excluyen"]],
    e: [
      "Among equal keys the order is not defined, so paging can repeat or skip rows. A unique last key makes it total. To keep every tie at the cut: `FETCH FIRST 10 ROWS WITH TIES` (PostgreSQL 13+).",
      "Entre clés égales, l'ordre n'est pas défini : la pagination peut répéter ou sauter des lignes. Une dernière clé unique le rend total. Pour garder toutes les égalités à la coupure : `FETCH FIRST 10 ROWS WITH TIES` (PostgreSQL 13+).",
      "Entre claves iguales el orden no está definido: la paginación puede repetir o saltar filas. Una última clave única lo hace total. Para conservar todos los empates en el corte: `FETCH FIRST 10 ROWS WITH TIES` (PostgreSQL 13+).",
    ],
  },
];

const expressions: SqlQuestion[] = [
  {
    id: "sq-expr-01",
    q: ["What does `CASE WHEN age < 2 THEN 'young' WHEN age < 10 THEN 'adult' END` give for age 12?", "Que donne `CASE WHEN age < 2 THEN 'young' WHEN age < 10 THEN 'adult' END` pour 12 ans ?", "¿Qué da `CASE WHEN age < 2 THEN 'young' WHEN age < 10 THEN 'adult' END` para 12 años?"],
    a: ["NULL: no branch matches and there is no `ELSE`", "NULL : aucune branche ne correspond et il n'y a pas d'`ELSE`", "NULL: ninguna rama coincide y no hay `ELSE`"],
    w: [["`'adult'`, the last branch", "`'adult'`, la dernière branche", "`'adult'`, la última rama"], ["An error", "Une erreur", "Un error"], ["`'young'`, the first branch", "`'young'`, la première branche", "`'young'`, la primera rama"]],
    e: [
      "`CASE` takes the first `WHEN` that is true; with none and no `ELSE`, it is NULL. Ending with `ELSE 'old'` covers the rest.",
      "`CASE` prend le premier `WHEN` vrai ; s'il n'y en a aucun et pas d'`ELSE`, c'est NULL. Finir par `ELSE 'old'` couvre le reste.",
      "`CASE` toma el primer `WHEN` verdadero; si no hay ninguno ni `ELSE`, es NULL. Terminar con `ELSE 'old'` cubre el resto.",
    ],
  },
  {
    id: "sq-expr-02",
    q: ["How are two strings joined?", "Comment colle-t-on deux chaînes ?", "¿Cómo se unen dos cadenas?"],
    a: ["`a || b` in PostgreSQL and SQLite; `CONCAT(a, b)` in MySQL (and the others)", "`a || b` en PostgreSQL et SQLite ; `CONCAT(a, b)` en MySQL (et les autres)", "`a || b` en PostgreSQL y SQLite; `CONCAT(a, b)` en MySQL (y los demás)"],
    w: [["`a + b` everywhere", "`a + b` partout", "`a + b` en todas partes"], ["`a & b` everywhere", "`a & b` partout", "`a & b` en todas partes"], ["`a || b` everywhere, MySQL included", "`a || b` partout, MySQL compris", "`a || b` en todas partes, MySQL incluido"]],
    e: [
      "In MySQL `||` is a logical OR unless `PIPES_AS_CONCAT` is set. NULL differs too: `'a' || NULL` is NULL, and so is MySQL's `CONCAT('a', NULL)`; PostgreSQL's `concat()` skips NULLs.",
      "En MySQL, `||` est un OU logique sauf avec `PIPES_AS_CONCAT`. NULL diffère aussi : `'a' || NULL` est NULL, tout comme `CONCAT('a', NULL)` en MySQL ; le `concat()` de PostgreSQL ignore les NULL.",
      "En MySQL `||` es un O lógico salvo con `PIPES_AS_CONCAT`. NULL también difiere: `'a' || NULL` es NULL, igual que `CONCAT('a', NULL)` en MySQL; el `concat()` de PostgreSQL ignora los NULL.",
    ],
  },
  {
    id: "sq-expr-03",
    q: ["What does `SELECT 7 / 2` return?", "Que renvoie `SELECT 7 / 2` ?", "¿Qué devuelve `SELECT 7 / 2`?"],
    a: ["3 in PostgreSQL and SQLite (integer division), 3.5000 in MySQL", "3 en PostgreSQL et SQLite (division entière), 3.5000 en MySQL", "3 en PostgreSQL y SQLite (división entera), 3.5000 en MySQL"],
    w: [["3.5 everywhere", "3.5 partout", "3.5 en todas partes"], ["3 everywhere", "3 partout", "3 en todas partes"], ["4 everywhere: it is rounded", "4 partout : c'est arrondi", "4 en todas partes: se redondea"]],
    e: [
      "Two integers give an integer in PostgreSQL and SQLite: write `7 / 2.0` or `CAST(7 AS REAL) / 2`. MySQL's `/` always gives a decimal; its integer division is `7 DIV 2`. Averages of integer columns are a classic trap.",
      "Deux entiers donnent un entier en PostgreSQL et SQLite : écrire `7 / 2.0` ou `CAST(7 AS REAL) / 2`. Le `/` de MySQL donne toujours un décimal ; sa division entière est `7 DIV 2`. Les moyennes de colonnes entières sont un piège classique.",
      "Dos enteros dan un entero en PostgreSQL y SQLite: escribir `7 / 2.0` o `CAST(7 AS REAL) / 2`. El `/` de MySQL siempre da un decimal; su división entera es `7 DIV 2`. Los promedios de columnas enteras son una trampa clásica.",
    ],
  },
  {
    id: "sq-expr-04",
    q: ["`SELECT price * qty AS total FROM lines WHERE total > 100` fails. Why?", "`SELECT price * qty AS total FROM lines WHERE total > 100` échoue. Pourquoi ?", "`SELECT price * qty AS total FROM lines WHERE total > 100` falla. ¿Por qué?"],
    a: ["`WHERE` runs before the `SELECT` list: repeat the expression, or use a subquery", "`WHERE` passe avant la liste du `SELECT` : répéter l'expression, ou passer par une sous-requête", "`WHERE` se evalúa antes de la lista del `SELECT`: repetir la expresión, o usar una subconsulta"],
    w: [["An alias cannot contain a calculation", "Un alias ne peut pas contenir de calcul", "Un alias no puede contener un cálculo"], ["`total` is a reserved word", "`total` est un mot réservé", "`total` es una palabra reservada"], ["`AS` is only for tables", "`AS` ne sert qu'aux tables", "`AS` solo sirve para tablas"]],
    e: [
      "Logical order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT. So `ORDER BY total` works, `WHERE total` does not (PostgreSQL, MySQL); SQLite tolerates it as an extension.",
      "Ordre logique : FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT. Donc `ORDER BY total` marche, `WHERE total` non (PostgreSQL, MySQL) ; SQLite le tolère en extension.",
      "Orden lógico: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT. Así `ORDER BY total` funciona y `WHERE total` no (PostgreSQL, MySQL); SQLite lo tolera como extensión.",
    ],
  },
  {
    id: "sq-expr-05",
    q: ["How do you turn the text `'42'` into a number?", "Comment transformer le texte `'42'` en nombre ?", "¿Cómo se convierte el texto `'42'` en número?"],
    a: ["`CAST('42' AS INTEGER)` everywhere; `'42'::int` in PostgreSQL", "`CAST('42' AS INTEGER)` partout ; `'42'::int` en PostgreSQL", "`CAST('42' AS INTEGER)` en todas partes; `'42'::int` en PostgreSQL"],
    w: [["`NUMBER('42')`", "`NUMBER('42')`", "`NUMBER('42')`"], ["`'42' AS INTEGER`", "`'42' AS INTEGER`", "`'42' AS INTEGER`"], ["`INT('42')`", "`INT('42')`", "`INT('42')`"]],
    e: [
      "`CAST` is standard. On bad input PostgreSQL raises an error, SQLite and MySQL quietly give 0 (or a warning). MySQL casts to `SIGNED` or `UNSIGNED` rather than `INTEGER`.",
      "`CAST` est standard. Sur une entrée invalide, PostgreSQL lève une erreur, SQLite et MySQL donnent discrètement 0 (ou un avertissement). MySQL convertit en `SIGNED` ou `UNSIGNED` plutôt qu'en `INTEGER`.",
      "`CAST` es estándar. Con una entrada inválida PostgreSQL lanza un error, SQLite y MySQL dan 0 en silencio (o un aviso). MySQL convierte a `SIGNED` o `UNSIGNED` más que a `INTEGER`.",
    ],
  },
];

// ------------------------------------------------------------- aggregating

const aggregates: SqlQuestion[] = [
  {
    id: "sq-agg-01",
    q: ["What does `SELECT SUM(amount) FROM payments WHERE 1 = 0` return?", "Que renvoie `SELECT SUM(amount) FROM payments WHERE 1 = 0` ?", "¿Qué devuelve `SELECT SUM(amount) FROM payments WHERE 1 = 0`?"],
    a: ["One row with NULL", "Une ligne avec NULL", "Una fila con NULL"],
    w: [["One row with 0", "Une ligne avec 0", "Una fila con 0"], ["No row", "Aucune ligne", "Ninguna fila"], ["An error", "Une erreur", "Un error"]],
    e: [
      "Without `GROUP BY`, an aggregate always returns one row; the sum of nothing is NULL (but `COUNT` of nothing is 0). `COALESCE(SUM(amount), 0)` gives 0.",
      "Sans `GROUP BY`, un agrégat renvoie toujours une ligne ; la somme de rien est NULL (mais le `COUNT` de rien vaut 0). `COALESCE(SUM(amount), 0)` donne 0.",
      "Sin `GROUP BY`, un agregado siempre devuelve una fila; la suma de nada es NULL (pero el `COUNT` de nada es 0). `COALESCE(SUM(amount), 0)` da 0.",
    ],
  },
  {
    id: "sq-agg-02",
    q: ["`SELECT name FROM pets WHERE age = MAX(age)` is refused. What works?", "`SELECT name FROM pets WHERE age = MAX(age)` est refusé. Qu'est-ce qui marche ?", "`SELECT name FROM pets WHERE age = MAX(age)` se rechaza. ¿Qué funciona?"],
    a: ["`WHERE age = (SELECT MAX(age) FROM pets)`", "`WHERE age = (SELECT MAX(age) FROM pets)`", "`WHERE age = (SELECT MAX(age) FROM pets)`"],
    w: [["`HAVING age = MAX(age)` without `GROUP BY`", "`HAVING age = MAX(age)` sans `GROUP BY`", "`HAVING age = MAX(age)` sin `GROUP BY`"], ["`WHERE MAX(age)`", "`WHERE MAX(age)`", "`WHERE MAX(age)`"], ["`SELECT MAX(name)`", "`SELECT MAX(name)`", "`SELECT MAX(name)`"]],
    e: [
      "Aggregates are computed after `WHERE`, so they cannot be used in it. A subquery gives the maximum first; `ORDER BY age DESC LIMIT 1` also works but keeps only one of several oldest.",
      "Les agrégats sont calculés après le `WHERE` : on ne peut pas s'en servir dedans. Une sous-requête donne d'abord le maximum ; `ORDER BY age DESC LIMIT 1` marche aussi mais ne garde qu'un des plus âgés.",
      "Los agregados se calculan después del `WHERE`: no se pueden usar en él. Una subconsulta da primero el máximo; `ORDER BY age DESC LIMIT 1` también funciona pero solo conserva uno de los mayores.",
    ],
  },
  {
    id: "sq-agg-03",
    q: ["What does `MAX(name)` give on a text column?", "Que donne `MAX(name)` sur une colonne de texte ?", "¿Qué da `MAX(name)` en una columna de texto?"],
    a: ["The last name in the sort order of the collation", "Le dernier nom dans l'ordre de tri de la collation", "El último nombre en el orden de la intercalación"],
    w: [["The longest name", "Le nom le plus long", "El nombre más largo"], ["An error: `MAX` is for numbers", "Une erreur : `MAX` est pour les nombres", "Un error: `MAX` es para números"], ["The most frequent name", "Le nom le plus fréquent", "El nombre más frecuente"]],
    e: [
      "`MIN` and `MAX` follow the same order as `ORDER BY`. The longest needs `ORDER BY length(name) DESC LIMIT 1` (`char_length` in MySQL counts characters, `length` bytes).",
      "`MIN` et `MAX` suivent le même ordre qu'`ORDER BY`. Le plus long demande `ORDER BY length(name) DESC LIMIT 1` (en MySQL, `char_length` compte les caractères, `length` les octets).",
      "`MIN` y `MAX` siguen el mismo orden que `ORDER BY`. El más largo requiere `ORDER BY length(name) DESC LIMIT 1` (en MySQL `char_length` cuenta caracteres y `length` bytes).",
    ],
  },
  {
    id: "sq-agg-04",
    q: ["How do you count the paid and unpaid orders in one query?", "Comment compter en une requête les commandes payées et impayées ?", "¿Cómo se cuentan en una consulta los pedidos pagados y no pagados?"],
    a: ["`SUM(CASE WHEN paid THEN 1 ELSE 0 END)`, or `COUNT(*) FILTER (WHERE paid)` in PostgreSQL and SQLite", "`SUM(CASE WHEN paid THEN 1 ELSE 0 END)`, ou `COUNT(*) FILTER (WHERE paid)` en PostgreSQL et SQLite", "`SUM(CASE WHEN paid THEN 1 ELSE 0 END)`, o `COUNT(*) FILTER (WHERE paid)` en PostgreSQL y SQLite"],
    w: [["Two `WHERE` clauses in the same query", "Deux clauses `WHERE` dans la même requête", "Dos cláusulas `WHERE` en la misma consulta"], ["`COUNT(paid)` and `COUNT(NOT paid)`", "`COUNT(paid)` et `COUNT(NOT paid)`", "`COUNT(paid)` y `COUNT(NOT paid)`"], ["It needs two queries", "Il faut deux requêtes", "Hacen falta dos consultas"]],
    e: [
      "Conditional aggregation: each row adds 1 to the right total. `COUNT(paid)` counts every non-NULL value, false ones included. `FILTER` exists in PostgreSQL and SQLite (3.30+), not in MySQL.",
      "Agrégation conditionnelle : chaque ligne ajoute 1 au bon total. `COUNT(paid)` compte toutes les valeurs non NULL, fausses comprises. `FILTER` existe en PostgreSQL et SQLite (3.30+), pas en MySQL.",
      "Agregación condicional: cada fila suma 1 al total correcto. `COUNT(paid)` cuenta todos los valores no NULL, falsos incluidos. `FILTER` existe en PostgreSQL y SQLite (3.30+), no en MySQL.",
    ],
  },
  {
    id: "sq-agg-05",
    q: ["How do you list every pet's name of a kind in one cell, separated by commas?", "Comment lister dans une seule cellule les noms des animaux de chaque espèce, séparés par des virgules ?", "¿Cómo se listan en una sola celda los nombres de los animales de cada especie, separados por comas?"],
    a: ["`string_agg(name, ', ')` in PostgreSQL, `group_concat(name, ', ')` in SQLite, `GROUP_CONCAT(name SEPARATOR ', ')` in MySQL", "`string_agg(name, ', ')` en PostgreSQL, `group_concat(name, ', ')` en SQLite, `GROUP_CONCAT(name SEPARATOR ', ')` en MySQL", "`string_agg(name, ', ')` en PostgreSQL, `group_concat(name, ', ')` en SQLite, `GROUP_CONCAT(name SEPARATOR ', ')` en MySQL"],
    w: [["`SUM(name)`", "`SUM(name)`", "`SUM(name)`"], ["`name || ','` with `GROUP BY`", "`name || ','` avec `GROUP BY`", "`name || ','` con `GROUP BY`"], ["`DISTINCT name` with `GROUP BY`", "`DISTINCT name` avec `GROUP BY`", "`DISTINCT name` con `GROUP BY`"]],
    e: [
      "Each engine has its string aggregate, used with `GROUP BY kind`. In PostgreSQL the order is set inside: `string_agg(name, ', ' ORDER BY name)`; MySQL truncates at `group_concat_max_len` (1024 bytes by default).",
      "Chaque moteur a son agrégat de chaînes, utilisé avec `GROUP BY kind`. En PostgreSQL, l'ordre se donne dedans : `string_agg(name, ', ' ORDER BY name)` ; MySQL coupe à `group_concat_max_len` (1024 octets par défaut).",
      "Cada motor tiene su agregado de cadenas, usado con `GROUP BY kind`. En PostgreSQL el orden se indica dentro: `string_agg(name, ', ' ORDER BY name)`; MySQL corta en `group_concat_max_len` (1024 bytes por defecto).",
    ],
  },
];

const grouping: SqlQuestion[] = [
  {
    id: "sq-group-01",
    q: ["`SELECT kind, name, COUNT(*) FROM pets GROUP BY kind`: what happens?", "`SELECT kind, name, COUNT(*) FROM pets GROUP BY kind` : que se passe-t-il ?", "`SELECT kind, name, COUNT(*) FROM pets GROUP BY kind`: ¿qué pasa?"],
    a: ["An error in PostgreSQL and in MySQL's default mode; SQLite returns a name from some row of each group", "Une erreur en PostgreSQL et dans le mode par défaut de MySQL ; SQLite renvoie le nom d'une ligne quelconque de chaque groupe", "Un error en PostgreSQL y en el modo por defecto de MySQL; SQLite devuelve el nombre de alguna fila de cada grupo"],
    w: [["One row per pet", "Une ligne par animal", "Una fila por animal"], ["The names are joined with commas", "Les noms sont collés avec des virgules", "Los nombres se unen con comas"], ["`name` is ignored", "`name` est ignoré", "`name` se ignora"]],
    e: [
      "A grouped query has one row per group: every selected column must be grouped or aggregated. MySQL refuses it since 5.7 (`ONLY_FULL_GROUP_BY`); SQLite picks a value from an arbitrary row of the group.",
      "Une requête groupée a une ligne par groupe : chaque colonne sélectionnée doit être groupée ou agrégée. MySQL la refuse depuis la 5.7 (`ONLY_FULL_GROUP_BY`) ; SQLite prend la valeur d'une ligne quelconque du groupe.",
      "Una consulta agrupada tiene una fila por grupo: cada columna seleccionada debe agruparse o agregarse. MySQL la rechaza desde la 5.7 (`ONLY_FULL_GROUP_BY`); SQLite toma el valor de una fila cualquiera del grupo.",
    ],
  },
  {
    id: "sq-group-02",
    q: ["`WHERE` or `HAVING`: which filter is applied after grouping?", "`WHERE` ou `HAVING` : quel filtre s'applique après le regroupement ?", "`WHERE` o `HAVING`: ¿qué filtro se aplica después de agrupar?"],
    a: ["`HAVING`: it filters groups, and can use aggregates", "`HAVING` : il filtre les groupes et peut utiliser des agrégats", "`HAVING`: filtra grupos y puede usar agregados"],
    w: [["`WHERE`: it always comes last", "`WHERE` : il vient toujours en dernier", "`WHERE`: siempre va al final"], ["Both, in either order", "Les deux, dans n'importe quel ordre", "Los dos, en cualquier orden"], ["Neither: grouping cannot be filtered", "Aucun : on ne filtre pas un regroupement", "Ninguno: no se filtra una agrupación"]],
    e: [
      "`WHERE` keeps rows before they are grouped; `HAVING` keeps groups afterwards. A condition on plain columns belongs in `WHERE`: fewer rows to group.",
      "`WHERE` garde des lignes avant le regroupement ; `HAVING` garde des groupes ensuite. Une condition sur de simples colonnes va dans `WHERE` : moins de lignes à regrouper.",
      "`WHERE` conserva filas antes de agrupar; `HAVING` conserva grupos después. Una condición sobre columnas simples va en `WHERE`: menos filas que agrupar.",
    ],
  },
  {
    id: "sq-group-03",
    q: ["What does `GROUP BY kind` do with the rows whose kind is NULL?", "Que fait `GROUP BY kind` des lignes dont l'espèce est NULL ?", "¿Qué hace `GROUP BY kind` con las filas cuya especie es NULL?"],
    a: ["They form one group of their own, NULL", "Elles forment un seul groupe à part, NULL", "Forman un único grupo aparte, NULL"],
    w: [["They are left out", "Elles sont écartées", "Se excluyen"], ["Each forms its own group", "Chacune forme son propre groupe", "Cada una forma su propio grupo"], ["They join the first group", "Elles rejoignent le premier groupe", "Se unen al primer grupo"]],
    e: [
      "For grouping (and `DISTINCT`), NULLs count as equal to each other, though `NULL = NULL` is not true. `WHERE kind IS NOT NULL` leaves them out.",
      "Pour regrouper (et pour `DISTINCT`), les NULL comptent comme égaux entre eux, même si `NULL = NULL` n'est pas vrai. `WHERE kind IS NOT NULL` les écarte.",
      "Para agrupar (y para `DISTINCT`), los NULL cuentan como iguales entre sí, aunque `NULL = NULL` no sea verdadero. `WHERE kind IS NOT NULL` los excluye.",
    ],
  },
  {
    id: "sq-group-04",
    q: ["How many groups does `GROUP BY kind, owner_id` make?", "Combien de groupes fait `GROUP BY kind, owner_id` ?", "¿Cuántos grupos hace `GROUP BY kind, owner_id`?"],
    a: ["One per pair (kind, owner_id) that occurs", "Un par couple (kind, owner_id) présent", "Uno por cada par (kind, owner_id) presente"],
    w: [["One per kind, then one per owner", "Un par espèce, puis un par maître", "Uno por especie y luego uno por dueño"], ["As many as kinds times owners, even empty", "Autant qu'espèces fois maîtres, même vides", "Tantos como especies por dueños, incluso vacíos"], ["One per owner only", "Un par maître seulement", "Uno por dueño solamente"]],
    e: [
      "Groups are the distinct combinations that exist in the data; empty combinations do not appear. Subtotals per kind as well need `ROLLUP` (`GROUP BY ROLLUP (kind, owner_id)` in PostgreSQL, `WITH ROLLUP` in MySQL).",
      "Les groupes sont les combinaisons distinctes présentes dans les données ; les combinaisons vides n'apparaissent pas. Des sous-totaux par espèce en plus demandent `ROLLUP` (`GROUP BY ROLLUP (kind, owner_id)` en PostgreSQL, `WITH ROLLUP` en MySQL).",
      "Los grupos son las combinaciones distintas presentes en los datos; las vacías no aparecen. Subtotales por especie además requieren `ROLLUP` (`GROUP BY ROLLUP (kind, owner_id)` en PostgreSQL, `WITH ROLLUP` en MySQL).",
    ],
  },
  {
    id: "sq-group-05",
    q: ["In which logical order are the clauses of a `SELECT` evaluated?", "Dans quel ordre logique les clauses d'un `SELECT` sont-elles évaluées ?", "¿En qué orden lógico se evalúan las cláusulas de un `SELECT`?"],
    a: ["FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT", "FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT", "FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT"],
    w: [["SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT", "SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT", "SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT"], ["FROM, SELECT, WHERE, ORDER BY, GROUP BY, HAVING, LIMIT", "FROM, SELECT, WHERE, ORDER BY, GROUP BY, HAVING, LIMIT", "FROM, SELECT, WHERE, ORDER BY, GROUP BY, HAVING, LIMIT"], ["FROM, WHERE, SELECT, GROUP BY, HAVING, LIMIT, ORDER BY", "FROM, WHERE, SELECT, GROUP BY, HAVING, LIMIT, ORDER BY", "FROM, WHERE, SELECT, GROUP BY, HAVING, LIMIT, ORDER BY"]],
    e: [
      "Written order is not run order. It explains the rules: an alias from `SELECT` is unknown in `WHERE` but known in `ORDER BY`; aggregates exist from `HAVING` on. (The engine may execute differently, with the same result.)",
      "L'ordre d'écriture n'est pas l'ordre d'exécution. Il explique les règles : un alias du `SELECT` est inconnu dans `WHERE` mais connu dans `ORDER BY` ; les agrégats existent à partir de `HAVING`. (Le moteur peut exécuter autrement, avec le même résultat.)",
      "El orden de escritura no es el de ejecución. Explica las reglas: un alias del `SELECT` es desconocido en `WHERE` pero conocido en `ORDER BY`; los agregados existen desde `HAVING`. (El motor puede ejecutar de otro modo, con el mismo resultado.)",
    ],
  },
];

const windows: SqlQuestion[] = [
  {
    id: "sq-window-01",
    q: ["How does `ROW_NUMBER() OVER (PARTITION BY kind ORDER BY age)` differ from a `GROUP BY kind`?", "En quoi `ROW_NUMBER() OVER (PARTITION BY kind ORDER BY age)` diffère-t-il d'un `GROUP BY kind` ?", "¿En qué se diferencia `ROW_NUMBER() OVER (PARTITION BY kind ORDER BY age)` de un `GROUP BY kind`?"],
    a: ["Every row stays; each gets its rank within its kind, from 1", "Toutes les lignes restent ; chacune reçoit son rang dans son espèce, à partir de 1", "Todas las filas se quedan; cada una recibe su posición en su especie, desde 1"],
    w: [["It returns one row per kind", "Il renvoie une ligne par espèce", "Devuelve una fila por especie"], ["It numbers all the rows from 1 to n, ignoring kind", "Il numérote toutes les lignes de 1 à n, sans tenir compte de l'espèce", "Numera todas las filas de 1 a n, sin tener en cuenta la especie"], ["It sorts the result by kind", "Il trie le résultat par espèce", "Ordena el resultado por especie"]],
    e: [
      "A window function computes over related rows without merging them. The youngest of each kind: wrap it in a subquery and keep `rn = 1`. Windows exist in PostgreSQL, SQLite (3.25+) and MySQL (8.0+).",
      "Une fonction de fenêtre calcule sur des lignes liées sans les fusionner. Le plus jeune de chaque espèce : l'envelopper dans une sous-requête et garder `rn = 1`. Les fenêtres existent en PostgreSQL, SQLite (3.25+) et MySQL (8.0+).",
      "Una función de ventana calcula sobre filas relacionadas sin fusionarlas. El más joven de cada especie: envolverla en una subconsulta y conservar `rn = 1`. Las ventanas existen en PostgreSQL, SQLite (3.25+) y MySQL (8.0+).",
    ],
  },
  {
    id: "sq-window-02",
    q: ["Scores 90, 90, 80 in descending order: what do `RANK()` and `DENSE_RANK()` give?", "Des scores 90, 90, 80 par ordre décroissant : que donnent `RANK()` et `DENSE_RANK()` ?", "Puntuaciones 90, 90, 80 en orden descendente: ¿qué dan `RANK()` y `DENSE_RANK()`?"],
    a: ["1, 1, 3 and 1, 1, 2", "1, 1, 3 et 1, 1, 2", "1, 1, 3 y 1, 1, 2"],
    w: [["1, 2, 3 and 1, 1, 2", "1, 2, 3 et 1, 1, 2", "1, 2, 3 y 1, 1, 2"], ["1, 1, 2 and 1, 1, 3", "1, 1, 2 et 1, 1, 3", "1, 1, 2 y 1, 1, 3"], ["1, 1, 3 for both", "1, 1, 3 pour les deux", "1, 1, 3 para los dos"]],
    e: [
      "`RANK` gives ties the same rank and leaves a gap; `DENSE_RANK` leaves none; `ROW_NUMBER` gives 1, 2, 3 whatever the ties.",
      "`RANK` donne le même rang aux égalités et laisse un trou ; `DENSE_RANK` n'en laisse pas ; `ROW_NUMBER` donne 1, 2, 3 quelles que soient les égalités.",
      "`RANK` da la misma posición a los empates y deja un hueco; `DENSE_RANK` no deja ninguno; `ROW_NUMBER` da 1, 2, 3 sean cuales sean los empates.",
    ],
  },
  {
    id: "sq-window-03",
    q: ["What does `SUM(amount) OVER (ORDER BY day)` compute?", "Que calcule `SUM(amount) OVER (ORDER BY day)` ?", "¿Qué calcula `SUM(amount) OVER (ORDER BY day)`?"],
    a: ["A running total: the sum up to each row's day", "Un cumul : la somme jusqu'au jour de chaque ligne", "Un total acumulado: la suma hasta el día de cada fila"],
    w: [["The total of every day, on every row", "Le total de tous les jours, sur chaque ligne", "El total de todos los días, en cada fila"], ["The amount of each day alone", "Le montant de chaque jour seul", "El importe de cada día solo"], ["An error: `SUM` needs `GROUP BY`", "Une erreur : `SUM` demande `GROUP BY`", "Un error: `SUM` necesita `GROUP BY`"]],
    e: [
      "With `ORDER BY` in the window, the frame runs from the first row to the current one (rows with the same day count together). Without it, `SUM(amount) OVER ()` is the grand total on every row.",
      "Avec `ORDER BY` dans la fenêtre, le cadre va de la première ligne à la ligne courante (les lignes du même jour comptent ensemble). Sans lui, `SUM(amount) OVER ()` est le total général sur chaque ligne.",
      "Con `ORDER BY` en la ventana, el marco va de la primera fila a la actual (las filas del mismo día cuentan juntas). Sin él, `SUM(amount) OVER ()` es el total general en cada fila.",
    ],
  },
  {
    id: "sq-window-04",
    q: ["How do you get, on each row, the previous day's value?", "Comment obtenir, sur chaque ligne, la valeur du jour précédent ?", "¿Cómo se obtiene, en cada fila, el valor del día anterior?"],
    a: ["`LAG(value) OVER (ORDER BY day)`", "`LAG(value) OVER (ORDER BY day)`", "`LAG(value) OVER (ORDER BY day)`"],
    w: [["`PREV(value)`", "`PREV(value)`", "`PREV(value)`"], ["`value - 1`", "`value - 1`", "`value - 1`"], ["`MIN(value) OVER ()`", "`MIN(value) OVER ()`", "`MIN(value) OVER ()`"]],
    e: [
      "`LAG` reads a previous row, `LEAD` a following one (NULL past the ends, or a default: `LAG(value, 1, 0)`). The change from one day to the next: `value - LAG(value) OVER (ORDER BY day)`.",
      "`LAG` lit une ligne précédente, `LEAD` une suivante (NULL au-delà des bouts, ou une valeur par défaut : `LAG(value, 1, 0)`). La variation d'un jour à l'autre : `value - LAG(value) OVER (ORDER BY day)`.",
      "`LAG` lee una fila anterior, `LEAD` una siguiente (NULL más allá de los extremos, o un valor por defecto: `LAG(value, 1, 0)`). La variación de un día a otro: `value - LAG(value) OVER (ORDER BY day)`.",
    ],
  },
  {
    id: "sq-window-05",
    q: ["`WHERE ROW_NUMBER() OVER (ORDER BY score DESC) <= 3` is refused. Why?", "`WHERE ROW_NUMBER() OVER (ORDER BY score DESC) <= 3` est refusé. Pourquoi ?", "`WHERE ROW_NUMBER() OVER (ORDER BY score DESC) <= 3` se rechaza. ¿Por qué?"],
    a: ["Windows are computed after `WHERE`: filter in an outer query or a CTE", "Les fenêtres sont calculées après `WHERE` : filtrer dans une requête englobante ou une CTE", "Las ventanas se calculan después de `WHERE`: filtrar en una consulta externa o una CTE"],
    w: [["`ROW_NUMBER` needs `PARTITION BY`", "`ROW_NUMBER` demande `PARTITION BY`", "`ROW_NUMBER` necesita `PARTITION BY`"], ["`<=` does not work with numbers from a window", "`<=` ne marche pas avec des nombres de fenêtre", "`<=` no funciona con números de ventana"], ["Use `HAVING` instead of `WHERE`", "Utiliser `HAVING` au lieu de `WHERE`", "Usar `HAVING` en lugar de `WHERE`"]],
    e: [
      "Windows run with the `SELECT` list, after `WHERE`, `GROUP BY` and `HAVING`. `WITH ranked AS (SELECT *, ROW_NUMBER() OVER (ORDER BY score DESC) AS rn FROM t) SELECT * FROM ranked WHERE rn <= 3`.",
      "Les fenêtres s'exécutent avec la liste du `SELECT`, après `WHERE`, `GROUP BY` et `HAVING`. `WITH ranked AS (SELECT *, ROW_NUMBER() OVER (ORDER BY score DESC) AS rn FROM t) SELECT * FROM ranked WHERE rn <= 3`.",
      "Las ventanas se ejecutan con la lista del `SELECT`, después de `WHERE`, `GROUP BY` y `HAVING`. `WITH ranked AS (SELECT *, ROW_NUMBER() OVER (ORDER BY score DESC) AS rn FROM t) SELECT * FROM ranked WHERE rn <= 3`.",
    ],
  },
];

// ----------------------------------------------------------------- joining

const joins: SqlQuestion[] = [
  {
    id: "sq-join-01",
    q: ["`owners LEFT JOIN pets ON pets.owner_id = owners.id WHERE pets.kind = 'cat'`: are the owners without pets in the result?", "`owners LEFT JOIN pets ON pets.owner_id = owners.id WHERE pets.kind = 'cat'` : les maîtres sans animal sont-ils dans le résultat ?", "`owners LEFT JOIN pets ON pets.owner_id = owners.id WHERE pets.kind = 'cat'`: ¿están en el resultado los dueños sin animales?"],
    a: ["No: the `WHERE` on pets drops their NULL rows; put the condition in the `ON`", "Non : le `WHERE` sur pets écarte leurs lignes NULL ; mettre la condition dans le `ON`", "No: el `WHERE` sobre pets descarta sus filas NULL; poner la condición en el `ON`"],
    w: [["Yes: a LEFT JOIN keeps every owner whatever follows", "Oui : un LEFT JOIN garde tous les maîtres quoi qu'il arrive", "Sí: un LEFT JOIN conserva todos los dueños pase lo que pase"], ["Only if they have a dog", "Seulement s'ils ont un chien", "Solo si tienen un perro"], ["An error: `WHERE` is not allowed after a join", "Une erreur : `WHERE` n'est pas permis après une jointure", "Un error: `WHERE` no se permite tras una unión"]],
    e: [
      "For an owner without pets, `pets.kind` is NULL, and `NULL = 'cat'` is not true: the LEFT JOIN becomes an inner one. `LEFT JOIN pets ON pets.owner_id = owners.id AND pets.kind = 'cat'` keeps every owner, with their cats if any.",
      "Pour un maître sans animal, `pets.kind` est NULL, et `NULL = 'cat'` n'est pas vrai : le LEFT JOIN devient une jointure interne. `LEFT JOIN pets ON pets.owner_id = owners.id AND pets.kind = 'cat'` garde tous les maîtres, avec leurs chats s'ils en ont.",
      "Para un dueño sin animales, `pets.kind` es NULL, y `NULL = 'cat'` no es verdadero: el LEFT JOIN se vuelve interno. `LEFT JOIN pets ON pets.owner_id = owners.id AND pets.kind = 'cat'` conserva todos los dueños, con sus gatos si los tienen.",
    ],
  },
  {
    id: "sq-join-02",
    q: ["`SELECT * FROM owners, pets` with 3 owners and 5 pets: how many rows?", "`SELECT * FROM owners, pets` avec 3 maîtres et 5 animaux : combien de lignes ?", "`SELECT * FROM owners, pets` con 3 dueños y 5 animales: ¿cuántas filas?"],
    a: ["15: every owner with every pet", "15 : chaque maître avec chaque animal", "15: cada dueño con cada animal"],
    w: [["5: each pet with its owner", "5 : chaque animal avec son maître", "5: cada animal con su dueño"], ["8: the two tables one after the other", "8 : les deux tables l'une après l'autre", "8: las dos tablas una tras otra"], ["3: one per owner", "3 : une par maître", "3: una por dueño"]],
    e: [
      "A comma (or `CROSS JOIN`) with no condition is the Cartesian product. A forgotten join condition multiplies rows: write joins with `JOIN … ON`, so the condition cannot be left out silently.",
      "Une virgule (ou `CROSS JOIN`) sans condition est le produit cartésien. Une condition de jointure oubliée multiplie les lignes : écrire les jointures avec `JOIN … ON`, pour que la condition ne puisse pas manquer en silence.",
      "Una coma (o `CROSS JOIN`) sin condición es el producto cartesiano. Una condición de unión olvidada multiplica las filas: escribir las uniones con `JOIN … ON`, para que la condición no pueda faltar en silencio.",
    ],
  },
  {
    id: "sq-join-03",
    q: ["Which engines have `FULL OUTER JOIN`?", "Quels moteurs ont `FULL OUTER JOIN` ?", "¿Qué motores tienen `FULL OUTER JOIN`?"],
    a: ["PostgreSQL, and SQLite since 3.39; MySQL does not (a `UNION` of a LEFT and a RIGHT JOIN instead)", "PostgreSQL, et SQLite depuis la 3.39 ; pas MySQL (une `UNION` d'un LEFT et d'un RIGHT JOIN à la place)", "PostgreSQL, y SQLite desde la 3.39; MySQL no (una `UNION` de un LEFT y un RIGHT JOIN en su lugar)"],
    w: [["All three", "Les trois", "Los tres"], ["MySQL only", "MySQL seulement", "Solo MySQL"], ["None: it is not standard SQL", "Aucun : ce n'est pas du SQL standard", "Ninguno: no es SQL estándar"]],
    e: [
      "A full join keeps the rows of both sides, matched where possible, with NULLs elsewhere. SQLite 3.39 (2022) also added `RIGHT JOIN`, which MySQL has always had.",
      "Une jointure complète garde les lignes des deux côtés, appariées si possible, avec des NULL ailleurs. SQLite 3.39 (2022) a aussi ajouté `RIGHT JOIN`, que MySQL a toujours eu.",
      "Una unión completa conserva las filas de ambos lados, emparejadas si es posible, con NULL en lo demás. SQLite 3.39 (2022) añadió también `RIGHT JOIN`, que MySQL siempre tuvo.",
    ],
  },
  {
    id: "sq-join-04",
    q: ["Each order has several lines. `SUM(orders.shipping)` over `orders JOIN lines` gives a shipping total too high. Why?", "Chaque commande a plusieurs lignes. `SUM(orders.shipping)` sur `orders JOIN lines` donne un total de frais de port trop élevé. Pourquoi ?", "Cada pedido tiene varias líneas. `SUM(orders.shipping)` sobre `orders JOIN lines` da un total de envío demasiado alto. ¿Por qué?"],
    a: ["The join repeats each order once per line, so its shipping is added several times", "La jointure répète chaque commande une fois par ligne : ses frais sont additionnés plusieurs fois", "La unión repite cada pedido una vez por línea: su envío se suma varias veces"],
    w: [["`SUM` adds NULLs as zeros", "`SUM` additionne les NULL comme des zéros", "`SUM` suma los NULL como ceros"], ["The join loses the orders without lines", "La jointure perd les commandes sans lignes", "La unión pierde los pedidos sin líneas"], ["`SUM` needs `DISTINCT` on joins", "`SUM` demande `DISTINCT` sur les jointures", "`SUM` necesita `DISTINCT` en las uniones"]],
    e: [
      "Joining one-to-many fans the parent rows out. Aggregate each table at its own level first (a subquery per table), then join the totals. `SUM(DISTINCT shipping)` would also merge two orders that cost the same.",
      "Joindre en un-à-plusieurs démultiplie les lignes parentes. Agréger d'abord chaque table à son niveau (une sous-requête par table), puis joindre les totaux. `SUM(DISTINCT shipping)` fusionnerait aussi deux commandes au même prix.",
      "Unir uno a muchos multiplica las filas padre. Agregar primero cada tabla en su nivel (una subconsulta por tabla) y luego unir los totales. `SUM(DISTINCT shipping)` fusionaría también dos pedidos con el mismo coste.",
    ],
  },
  {
    id: "sq-join-05",
    q: ["`employees` has a `manager_id` column. How do you list each employee with their manager's name?", "`employees` a une colonne `manager_id`. Comment lister chaque employé avec le nom de son responsable ?", "`employees` tiene una columna `manager_id`. ¿Cómo se lista cada empleado con el nombre de su responsable?"],
    a: ["Join the table to itself: `FROM employees e LEFT JOIN employees m ON m.id = e.manager_id`", "Joindre la table à elle-même : `FROM employees e LEFT JOIN employees m ON m.id = e.manager_id`", "Unir la tabla consigo misma: `FROM employees e LEFT JOIN employees m ON m.id = e.manager_id`"],
    w: [["It needs a second `managers` table", "Il faut une seconde table `managers`", "Hace falta una segunda tabla `managers`"], ["`GROUP BY manager_id`", "`GROUP BY manager_id`", "`GROUP BY manager_id`"], ["`SELECT name, manager_id.name`", "`SELECT name, manager_id.name`", "`SELECT name, manager_id.name`"]],
    e: [
      "A self-join needs two aliases. LEFT keeps the boss, who has no manager. The whole chain of command is a recursive query: `WITH RECURSIVE`.",
      "Une auto-jointure demande deux alias. LEFT garde la patronne, qui n'a pas de responsable. Toute la chaîne hiérarchique est une requête récursive : `WITH RECURSIVE`.",
      "Una autounión necesita dos alias. LEFT conserva a la jefa, que no tiene responsable. Toda la cadena jerárquica es una consulta recursiva: `WITH RECURSIVE`.",
    ],
  },
];

const subqueries: SqlQuestion[] = [
  {
    id: "sq-sub-01",
    q: ["`WHERE price = (SELECT price FROM products WHERE kind = 'tea')` fails with several teas. Why?", "`WHERE price = (SELECT price FROM products WHERE kind = 'tea')` échoue avec plusieurs thés. Pourquoi ?", "`WHERE price = (SELECT price FROM products WHERE kind = 'tea')` falla con varios tés. ¿Por qué?"],
    a: ["`=` needs a single value; the subquery returns several: use `IN`, or `= ANY` in PostgreSQL", "`=` attend une seule valeur ; la sous-requête en renvoie plusieurs : utiliser `IN`, ou `= ANY` en PostgreSQL", "`=` espera un solo valor; la subconsulta devuelve varios: usar `IN`, o `= ANY` en PostgreSQL"],
    w: [["Subqueries cannot be compared", "On ne compare pas des sous-requêtes", "No se comparan subconsultas"], ["The subquery needs `ORDER BY`", "La sous-requête demande `ORDER BY`", "La subconsulta necesita `ORDER BY`"], ["`price` is used twice", "`price` est utilisé deux fois", "`price` se usa dos veces"]],
    e: [
      "A scalar subquery must return at most one row (none gives NULL). PostgreSQL and MySQL raise an error; SQLite quietly takes the first row, which hides the bug.",
      "Une sous-requête scalaire doit renvoyer au plus une ligne (aucune donne NULL). PostgreSQL et MySQL lèvent une erreur ; SQLite prend la première ligne en silence, ce qui cache le bug.",
      "Una subconsulta escalar debe devolver como mucho una fila (ninguna da NULL). PostgreSQL y MySQL lanzan un error; SQLite toma la primera fila en silencio, lo que oculta el fallo.",
    ],
  },
  {
    id: "sq-sub-02",
    q: ["What does `WHERE EXISTS (SELECT 1 FROM pets p WHERE p.owner_id = o.id)` keep?", "Que garde `WHERE EXISTS (SELECT 1 FROM pets p WHERE p.owner_id = o.id)` ?", "¿Qué conserva `WHERE EXISTS (SELECT 1 FROM pets p WHERE p.owner_id = o.id)`?"],
    a: ["The owners with at least one pet, each once", "Les maîtres qui ont au moins un animal, chacun une fois", "Los dueños con al menos un animal, cada uno una vez"],
    w: [["The owners whose pet's value is 1", "Les maîtres dont l'animal vaut 1", "Los dueños cuyo animal vale 1"], ["Each owner once per pet", "Chaque maître une fois par animal", "Cada dueño una vez por animal"], ["Every owner, since `SELECT 1` is always true", "Tous les maîtres, puisque `SELECT 1` est toujours vrai", "Todos los dueños, ya que `SELECT 1` siempre es verdadero"]],
    e: [
      "`EXISTS` only asks whether the correlated subquery finds a row; what it selects does not matter. Unlike a join, it never repeats the owner.",
      "`EXISTS` demande seulement si la sous-requête corrélée trouve une ligne ; ce qu'elle sélectionne n'importe pas. Contrairement à une jointure, il ne répète jamais le maître.",
      "`EXISTS` solo pregunta si la subconsulta correlacionada encuentra una fila; lo que selecciona no importa. A diferencia de una unión, nunca repite al dueño.",
    ],
  },
  {
    id: "sq-sub-03",
    q: ["What is `WITH recent AS (SELECT …) SELECT … FROM recent` for?", "À quoi sert `WITH recent AS (SELECT …) SELECT … FROM recent` ?", "¿Para qué sirve `WITH recent AS (SELECT …) SELECT … FROM recent`?"],
    a: ["Naming a subquery (a CTE) to read it like a temporary table in that query", "Nommer une sous-requête (une CTE) pour la lire comme une table temporaire dans cette requête", "Nombrar una subconsulta (una CTE) para leerla como una tabla temporal en esa consulta"],
    w: [["Creating a table that lasts after the query", "Créer une table qui reste après la requête", "Crear una tabla que queda tras la consulta"], ["Caching the result for the next queries", "Garder le résultat en cache pour les requêtes suivantes", "Guardar el resultado en caché para las siguientes consultas"], ["Locking the rows it reads", "Verrouiller les lignes qu'elle lit", "Bloquear las filas que lee"]],
    e: [
      "A common table expression only lives for its statement. It makes long queries readable, step by step, and `WITH RECURSIVE` walks trees and graphs. Available in PostgreSQL, SQLite and MySQL 8.0+.",
      "Une expression de table commune ne vit que le temps de sa requête. Elle rend lisibles les longues requêtes, étape par étape, et `WITH RECURSIVE` parcourt arbres et graphes. Disponible en PostgreSQL, SQLite et MySQL 8.0+.",
      "Una expresión de tabla común solo vive lo que dura su sentencia. Hace legibles las consultas largas, paso a paso, y `WITH RECURSIVE` recorre árboles y grafos. Disponible en PostgreSQL, SQLite y MySQL 8.0+.",
    ],
  },
  {
    id: "sq-sub-04",
    q: ["`SELECT * FROM (SELECT kind, COUNT(*) AS n FROM pets GROUP BY kind) WHERE n > 1` fails in MySQL. What is missing?", "`SELECT * FROM (SELECT kind, COUNT(*) AS n FROM pets GROUP BY kind) WHERE n > 1` échoue en MySQL. Que manque-t-il ?", "`SELECT * FROM (SELECT kind, COUNT(*) AS n FROM pets GROUP BY kind) WHERE n > 1` falla en MySQL. ¿Qué falta?"],
    a: ["An alias for the derived table: `(…) AS t`", "Un alias pour la table dérivée : `(…) AS t`", "Un alias para la tabla derivada: `(…) AS t`"],
    w: [["A `HAVING` inside the subquery", "Un `HAVING` dans la sous-requête", "Un `HAVING` dentro de la subconsulta"], ["`ORDER BY` in the subquery", "`ORDER BY` dans la sous-requête", "`ORDER BY` en la subconsulta"], ["Subqueries are not allowed in `FROM`", "Les sous-requêtes ne sont pas permises dans `FROM`", "No se permiten subconsultas en `FROM`"]],
    e: [
      "MySQL requires every derived table to be named, as PostgreSQL did before version 16; SQLite does not. Naming it always is the portable habit.",
      "MySQL exige un nom pour chaque table dérivée, comme PostgreSQL avant la version 16 ; SQLite non. La nommer toujours est l'habitude portable.",
      "MySQL exige un nombre para cada tabla derivada, como PostgreSQL antes de la versión 16; SQLite no. Nombrarla siempre es la costumbre portable.",
    ],
  },
  {
    id: "sq-sub-05",
    q: ["What does `WITH RECURSIVE` let a query do?", "Que permet `WITH RECURSIVE` à une requête ?", "¿Qué permite `WITH RECURSIVE` a una consulta?"],
    a: ["Refer to its own result, to walk a hierarchy or a graph to any depth", "Se référer à son propre résultat, pour parcourir une hiérarchie ou un graphe à toute profondeur", "Referirse a su propio resultado, para recorrer una jerarquía o un grafo a cualquier profundidad"],
    w: [["Run the same query again every minute", "Relancer la même requête chaque minute", "Repetir la misma consulta cada minuto"], ["Call a stored procedure", "Appeler une procédure stockée", "Llamar a un procedimiento almacenado"], ["Copy a table into itself", "Copier une table dans elle-même", "Copiar una tabla en sí misma"]],
    e: [
      "A starting `SELECT`, `UNION ALL`, then a `SELECT` that joins the CTE to the table; it repeats until no new row comes. A cycle in the data loops forever unless the path is checked.",
      "Un `SELECT` de départ, `UNION ALL`, puis un `SELECT` qui joint la CTE à la table ; il se répète tant que de nouvelles lignes viennent. Un cycle dans les données boucle sans fin si le chemin n'est pas vérifié.",
      "Un `SELECT` inicial, `UNION ALL`, y luego un `SELECT` que une la CTE con la tabla; se repite mientras lleguen filas nuevas. Un ciclo en los datos se repite sin fin si no se comprueba el camino.",
    ],
  },
];

const sets: SqlQuestion[] = [
  {
    id: "sq-set-01",
    q: ["What separates `UNION` from `UNION ALL`?", "Qu'est-ce qui distingue `UNION` de `UNION ALL` ?", "¿Qué diferencia `UNION` de `UNION ALL`?"],
    a: ["`UNION` removes duplicate rows; `UNION ALL` keeps them all and is faster", "`UNION` retire les lignes en double ; `UNION ALL` les garde toutes et va plus vite", "`UNION` quita las filas duplicadas; `UNION ALL` las conserva todas y es más rápido"],
    w: [["`UNION ALL` merges every table of the database", "`UNION ALL` fusionne toutes les tables de la base", "`UNION ALL` fusiona todas las tablas de la base"], ["`UNION` sorts, `UNION ALL` does not, otherwise the same rows", "`UNION` trie, `UNION ALL` non, sinon les mêmes lignes", "`UNION` ordena y `UNION ALL` no, por lo demás las mismas filas"], ["None: they are synonyms", "Aucune : ce sont des synonymes", "Ninguna: son sinónimos"]],
    e: [
      "Removing duplicates means sorting or hashing every row. When the parts cannot overlap, or duplicates are wanted, `UNION ALL` is the one to write.",
      "Retirer les doublons demande de trier ou hacher chaque ligne. Quand les parties ne peuvent pas se recouper, ou que les doublons sont voulus, c'est `UNION ALL` qu'il faut écrire.",
      "Quitar duplicados exige ordenar o aplicar hash a cada fila. Cuando las partes no pueden solaparse, o se quieren los duplicados, hay que escribir `UNION ALL`.",
    ],
  },
  {
    id: "sq-set-02",
    q: ["`SELECT name, age FROM cats UNION SELECT name FROM dogs` fails. Why?", "`SELECT name, age FROM cats UNION SELECT name FROM dogs` échoue. Pourquoi ?", "`SELECT name, age FROM cats UNION SELECT name FROM dogs` falla. ¿Por qué?"],
    a: ["Both parts must have the same number of columns, of compatible types", "Les deux parties doivent avoir le même nombre de colonnes, de types compatibles", "Las dos partes deben tener el mismo número de columnas, de tipos compatibles"],
    w: [["The tables must have the same name", "Les tables doivent avoir le même nom", "Las tablas deben tener el mismo nombre"], ["`UNION` needs `ORDER BY`", "`UNION` demande `ORDER BY`", "`UNION` necesita `ORDER BY`"], ["`name` is ambiguous", "`name` est ambigu", "`name` es ambiguo"]],
    e: [
      "Columns pair up by position, not by name; the first part names them. A missing column can be filled: `SELECT name, NULL FROM dogs`.",
      "Les colonnes s'apparient par position, pas par nom ; la première partie les nomme. Une colonne manquante se complète : `SELECT name, NULL FROM dogs`.",
      "Las columnas se emparejan por posición, no por nombre; la primera parte les da nombre. Una columna que falta se rellena: `SELECT name, NULL FROM dogs`.",
    ],
  },
  {
    id: "sq-set-03",
    q: ["What does `SELECT email FROM customers EXCEPT SELECT email FROM unsubscribed` return?", "Que renvoie `SELECT email FROM customers EXCEPT SELECT email FROM unsubscribed` ?", "¿Qué devuelve `SELECT email FROM customers EXCEPT SELECT email FROM unsubscribed`?"],
    a: ["The customers' emails that are not in the unsubscribed list", "Les e-mails des clients qui ne sont pas dans la liste des désabonnés", "Los correos de los clientes que no están en la lista de bajas"],
    w: [["Every email of both tables, except duplicates", "Tous les e-mails des deux tables, sauf les doublons", "Todos los correos de ambas tablas, salvo duplicados"], ["The emails in both tables", "Les e-mails présents dans les deux tables", "Los correos presentes en ambas tablas"], ["The unsubscribed emails that are not customers", "Les e-mails désabonnés qui ne sont pas clients", "Los correos de baja que no son clientes"]],
    e: [
      "`EXCEPT` is a set difference, `INTERSECT` the common part; both remove duplicates. PostgreSQL and SQLite have both; MySQL since 8.0.31 (Oracle calls it `MINUS`).",
      "`EXCEPT` est une différence d'ensembles, `INTERSECT` la partie commune ; tous deux retirent les doublons. PostgreSQL et SQLite ont les deux ; MySQL depuis la 8.0.31 (Oracle l'appelle `MINUS`).",
      "`EXCEPT` es una diferencia de conjuntos, `INTERSECT` la parte común; ambos quitan duplicados. PostgreSQL y SQLite tienen los dos; MySQL desde la 8.0.31 (Oracle lo llama `MINUS`).",
    ],
  },
  {
    id: "sq-set-04",
    q: ["Where does `ORDER BY` go in a `UNION`?", "Où va l'`ORDER BY` dans une `UNION` ?", "¿Dónde va el `ORDER BY` en una `UNION`?"],
    a: ["Once, at the very end: it sorts the combined result", "Une fois, tout à la fin : il trie le résultat combiné", "Una vez, al final del todo: ordena el resultado combinado"],
    w: [["In each part, which keeps its order", "Dans chaque partie, qui garde son ordre", "En cada parte, que conserva su orden"], ["Only in the first part", "Seulement dans la première partie", "Solo en la primera parte"], ["Nowhere: a `UNION` cannot be sorted", "Nulle part : une `UNION` ne se trie pas", "En ningún sitio: una `UNION` no se ordena"]],
    e: [
      "The final `ORDER BY` uses the first part's column names. Sorting one part alone needs brackets and a `LIMIT` with it, otherwise the order is not kept anyway.",
      "L'`ORDER BY` final utilise les noms de colonnes de la première partie. Trier une partie seule demande des parenthèses et un `LIMIT` avec, sinon l'ordre n'est de toute façon pas gardé.",
      "El `ORDER BY` final usa los nombres de columna de la primera parte. Ordenar una sola parte requiere paréntesis y un `LIMIT` con él; si no, el orden no se conserva de todos modos.",
    ],
  },
];

// ---------------------------------------------------------------- changing

const changes: SqlQuestion[] = [
  {
    id: "sq-dml-01",
    q: ["What does `UPDATE accounts SET balance = 0` do?", "Que fait `UPDATE accounts SET balance = 0` ?", "¿Qué hace `UPDATE accounts SET balance = 0`?"],
    a: ["Sets every account's balance to 0: there is no `WHERE`", "Met le solde de tous les comptes à 0 : il n'y a pas de `WHERE`", "Pone a 0 el saldo de todas las cuentas: no hay `WHERE`"],
    w: [["Nothing until a `WHERE` is given", "Rien tant qu'un `WHERE` n'est pas donné", "Nada hasta que se da un `WHERE`"], ["Only the last account inserted", "Seulement le dernier compte inséré", "Solo la última cuenta insertada"], ["Asks for confirmation first", "Demande d'abord une confirmation", "Pide confirmación primero"]],
    e: [
      "Without `WHERE`, `UPDATE` and `DELETE` touch every row. Habits: write the `WHERE` first, try it as a `SELECT`, and work inside `BEGIN;` … `COMMIT;` so a mistake can be rolled back. MySQL's `--safe-updates` refuses them without a key in the `WHERE`.",
      "Sans `WHERE`, `UPDATE` et `DELETE` touchent toutes les lignes. Habitudes : écrire le `WHERE` d'abord, l'essayer en `SELECT`, et travailler dans `BEGIN;` … `COMMIT;` pour pouvoir annuler. Le `--safe-updates` de MySQL les refuse sans clé dans le `WHERE`.",
      "Sin `WHERE`, `UPDATE` y `DELETE` afectan a todas las filas. Hábitos: escribir primero el `WHERE`, probarlo como `SELECT` y trabajar dentro de `BEGIN;` … `COMMIT;` para poder deshacer. El `--safe-updates` de MySQL los rechaza sin clave en el `WHERE`.",
    ],
  },
  {
    id: "sq-dml-02",
    q: ["After `UPDATE t SET a = b, b = a`, what holds `a`?", "Après `UPDATE t SET a = b, b = a`, que contient `a` ?", "Tras `UPDATE t SET a = b, b = a`, ¿qué contiene `a`?"],
    a: ["The old b; in PostgreSQL and SQLite `b` gets the old a (a swap), in MySQL `b` gets the new a, so both hold the old b", "L'ancien b ; en PostgreSQL et SQLite `b` reçoit l'ancien a (un échange), en MySQL `b` reçoit le nouveau a : les deux valent l'ancien b", "El antiguo b; en PostgreSQL y SQLite `b` recibe el antiguo a (un intercambio), en MySQL `b` recibe el nuevo a: los dos valen el antiguo b"],
    w: [["The old a: nothing changes", "L'ancien a : rien ne change", "El antiguo a: nada cambia"], ["An error: a column cannot be set twice", "Une erreur : une colonne ne s'affecte pas deux fois", "Un error: una columna no se asigna dos veces"], ["NULL", "NULL", "NULL"]],
    e: [
      "Standard SQL evaluates every right-hand side on the old row first; MySQL assigns from left to right, each seeing the previous assignments. Portable code avoids relying on either.",
      "Le SQL standard évalue d'abord tous les membres de droite sur l'ancienne ligne ; MySQL affecte de gauche à droite, chacun voyant les affectations précédentes. Un code portable évite de s'appuyer sur l'un ou l'autre.",
      "El SQL estándar evalúa primero todos los lados derechos sobre la fila antigua; MySQL asigna de izquierda a derecha, cada uno viendo las asignaciones anteriores. El código portable evita depender de uno u otro.",
    ],
  },
  {
    id: "sq-dml-03",
    q: ["How do you copy last year's orders into an archive table?", "Comment copier les commandes de l'an dernier dans une table d'archive ?", "¿Cómo se copian los pedidos del año pasado en una tabla de archivo?"],
    a: ["`INSERT INTO archive (id, total) SELECT id, total FROM orders WHERE …`", "`INSERT INTO archive (id, total) SELECT id, total FROM orders WHERE …`", "`INSERT INTO archive (id, total) SELECT id, total FROM orders WHERE …`"],
    w: [["`INSERT INTO archive VALUES (SELECT * FROM orders)`", "`INSERT INTO archive VALUES (SELECT * FROM orders)`", "`INSERT INTO archive VALUES (SELECT * FROM orders)`"], ["`UPDATE archive FROM orders`", "`UPDATE archive FROM orders`", "`UPDATE archive FROM orders`"], ["`COPY orders TO archive`", "`COPY orders TO archive`", "`COPY orders TO archive`"]],
    e: [
      "`INSERT … SELECT` inserts every row the query returns, in one statement. Listing the columns on both sides keeps it working when a table gets a new column.",
      "`INSERT … SELECT` insère toutes les lignes que renvoie la requête, en une instruction. Lister les colonnes des deux côtés le garde valable quand une table reçoit une nouvelle colonne.",
      "`INSERT … SELECT` inserta todas las filas que devuelve la consulta, en una sola sentencia. Enumerar las columnas en ambos lados lo mantiene válido cuando una tabla recibe una columna nueva.",
    ],
  },
  {
    id: "sq-dml-04",
    q: ["`DELETE FROM logs` or `TRUNCATE logs`: what is the difference?", "`DELETE FROM logs` ou `TRUNCATE logs` : quelle différence ?", "`DELETE FROM logs` o `TRUNCATE logs`: ¿qué diferencia hay?"],
    a: ["`TRUNCATE` empties the table at once, without row-by-row work or `WHERE`; SQLite has no `TRUNCATE`", "`TRUNCATE` vide la table d'un coup, sans travail ligne par ligne ni `WHERE` ; SQLite n'a pas de `TRUNCATE`", "`TRUNCATE` vacía la tabla de golpe, sin trabajo fila a fila ni `WHERE`; SQLite no tiene `TRUNCATE`"],
    w: [["`TRUNCATE` also drops the table", "`TRUNCATE` supprime aussi la table", "`TRUNCATE` también borra la tabla"], ["`DELETE FROM` without `WHERE` is refused", "`DELETE FROM` sans `WHERE` est refusé", "`DELETE FROM` sin `WHERE` se rechaza"], ["None: they are synonyms", "Aucune : ce sont des synonymes", "Ninguna: son sinónimos"]],
    e: [
      "`DELETE` can be filtered and fires triggers; `TRUNCATE` cannot. In MySQL `TRUNCATE` commits implicitly and resets `AUTO_INCREMENT`; PostgreSQL's can be rolled back, and `RESTART IDENTITY` resets the ids. SQLite optimises a `DELETE` without `WHERE`.",
      "`DELETE` se filtre et déclenche les triggers ; `TRUNCATE` non. En MySQL, `TRUNCATE` valide implicitement et remet `AUTO_INCREMENT` à zéro ; celui de PostgreSQL s'annule, et `RESTART IDENTITY` remet les id à zéro. SQLite optimise un `DELETE` sans `WHERE`.",
      "`DELETE` se puede filtrar y dispara los triggers; `TRUNCATE` no. En MySQL `TRUNCATE` confirma implícitamente y reinicia `AUTO_INCREMENT`; el de PostgreSQL se puede deshacer, y `RESTART IDENTITY` reinicia los ids. SQLite optimiza un `DELETE` sin `WHERE`.",
    ],
  },
  {
    id: "sq-dml-05",
    q: ["Why list the columns in `INSERT INTO pets (name, kind) VALUES ('Rex', 'dog')`?", "Pourquoi lister les colonnes dans `INSERT INTO pets (name, kind) VALUES ('Rex', 'dog')` ?", "¿Por qué enumerar las columnas en `INSERT INTO pets (name, kind) VALUES ('Rex', 'dog')`?"],
    a: ["So the values do not depend on the table's column order, and the others take their defaults", "Pour que les valeurs ne dépendent pas de l'ordre des colonnes de la table, et que les autres prennent leur valeur par défaut", "Para que los valores no dependan del orden de las columnas de la tabla, y las demás tomen su valor por defecto"],
    w: [["It is faster", "C'est plus rapide", "Es más rápido"], ["Otherwise the row is inserted twice", "Sinon la ligne est insérée deux fois", "Si no, la fila se inserta dos veces"], ["It is required by every engine", "C'est obligatoire dans tous les moteurs", "Es obligatorio en todos los motores"]],
    e: [
      "Without the list, values fill every column in table order: adding or moving a column later breaks the statement, or worse, puts a value in the wrong column. Several rows at once: `VALUES (…), (…)`.",
      "Sans la liste, les valeurs remplissent toutes les colonnes dans l'ordre de la table : ajouter ou déplacer une colonne plus tard casse l'instruction, ou pire, met une valeur dans la mauvaise colonne. Plusieurs lignes d'un coup : `VALUES (…), (…)`.",
      "Sin la lista, los valores llenan todas las columnas en el orden de la tabla: añadir o mover una columna después rompe la sentencia o, peor, pone un valor en la columna equivocada. Varias filas a la vez: `VALUES (…), (…)`.",
    ],
  },
];

const schema: SqlQuestion[] = [
  {
    id: "sq-ddl-01",
    q: ["What does `owner_id INTEGER REFERENCES owners (id) ON DELETE CASCADE` do when an owner is deleted?", "Que fait `owner_id INTEGER REFERENCES owners (id) ON DELETE CASCADE` quand un maître est supprimé ?", "¿Qué hace `owner_id INTEGER REFERENCES owners (id) ON DELETE CASCADE` cuando se borra un dueño?"],
    a: ["Deletes their pets too", "Supprime aussi ses animaux", "Borra también sus animales"],
    w: [["Sets their pets' owner_id to NULL", "Met à NULL le owner_id de ses animaux", "Pone a NULL el owner_id de sus animales"], ["Refuses the deletion while they have pets", "Refuse la suppression tant qu'il a des animaux", "Rechaza el borrado mientras tenga animales"], ["Nothing: it only documents the link", "Rien : ça documente seulement le lien", "Nada: solo documenta el vínculo"]],
    e: [
      "`CASCADE` follows the deletion; `SET NULL` empties the link; the default (`NO ACTION`/`RESTRICT`) refuses it. In SQLite foreign keys are only enforced after `PRAGMA foreign_keys = ON`, on each connection.",
      "`CASCADE` propage la suppression ; `SET NULL` vide le lien ; par défaut (`NO ACTION`/`RESTRICT`), elle est refusée. En SQLite, les clés étrangères ne sont appliquées qu'après `PRAGMA foreign_keys = ON`, sur chaque connexion.",
      "`CASCADE` propaga el borrado; `SET NULL` vacía el vínculo; por defecto (`NO ACTION`/`RESTRICT`) se rechaza. En SQLite las claves foráneas solo se aplican tras `PRAGMA foreign_keys = ON`, en cada conexión.",
    ],
  },
  {
    id: "sq-ddl-02",
    q: ["A column `email TEXT UNIQUE`: how many rows can have a NULL email?", "Une colonne `email TEXT UNIQUE` : combien de lignes peuvent avoir un e-mail NULL ?", "Una columna `email TEXT UNIQUE`: ¿cuántas filas pueden tener un correo NULL?"],
    a: ["Any number: NULLs are not equal to each other for `UNIQUE`", "Autant qu'on veut : pour `UNIQUE`, les NULL ne sont pas égaux entre eux", "Las que se quiera: para `UNIQUE`, los NULL no son iguales entre sí"],
    w: [["One", "Une", "Una"], ["None: `UNIQUE` implies `NOT NULL`", "Aucune : `UNIQUE` implique `NOT NULL`", "Ninguna: `UNIQUE` implica `NOT NULL`"], ["Two", "Deux", "Dos"]],
    e: [
      "In PostgreSQL, SQLite and MySQL a unique constraint allows several NULLs. Only one: `NOT NULL`, or PostgreSQL 15's `UNIQUE NULLS NOT DISTINCT`. A primary key is unique and not NULL.",
      "En PostgreSQL, SQLite et MySQL, une contrainte d'unicité admet plusieurs NULL. Un seul : `NOT NULL`, ou le `UNIQUE NULLS NOT DISTINCT` de PostgreSQL 15. Une clé primaire est unique et non NULL.",
      "En PostgreSQL, SQLite y MySQL una restricción de unicidad admite varios NULL. Solo uno: `NOT NULL`, o el `UNIQUE NULLS NOT DISTINCT` de PostgreSQL 15. Una clave primaria es única y no NULL.",
    ],
  },
  {
    id: "sq-ddl-03",
    q: ["Which type stores a price exactly?", "Quel type stocke un prix exactement ?", "¿Qué tipo guarda un precio exactamente?"],
    a: ["`NUMERIC(10, 2)` (`DECIMAL`), or a whole number of cents", "`NUMERIC(10, 2)` (`DECIMAL`), ou un nombre entier de centimes", "`NUMERIC(10, 2)` (`DECIMAL`), o un número entero de céntimos"],
    w: [["`FLOAT`", "`FLOAT`", "`FLOAT`"], ["`DOUBLE PRECISION`", "`DOUBLE PRECISION`", "`DOUBLE PRECISION`"], ["`REAL`", "`REAL`", "`REAL`"]],
    e: [
      "Binary floating point cannot hold 0.1 exactly, so sums drift (0.1 + 0.2 is not 0.3). `NUMERIC` is exact in PostgreSQL and MySQL; SQLite has no exact decimal type, so cents in an `INTEGER` are the safe choice there.",
      "La virgule flottante binaire ne représente pas 0,1 exactement : les sommes dérivent (0,1 + 0,2 ne vaut pas 0,3). `NUMERIC` est exact en PostgreSQL et MySQL ; SQLite n'a pas de type décimal exact : des centimes dans un `INTEGER` y sont le choix sûr.",
      "La coma flotante binaria no representa 0,1 exactamente: las sumas se desvían (0,1 + 0,2 no da 0,3). `NUMERIC` es exacto en PostgreSQL y MySQL; SQLite no tiene tipo decimal exacto: los céntimos en un `INTEGER` son allí la opción segura.",
    ],
  },
  {
    id: "sq-ddl-04",
    q: ["A table has a million rows. What does `ALTER TABLE users ADD COLUMN active BOOLEAN NOT NULL DEFAULT true` cost in PostgreSQL 11+?", "Une table a un million de lignes. Que coûte `ALTER TABLE users ADD COLUMN active BOOLEAN NOT NULL DEFAULT true` en PostgreSQL 11+ ?", "Una tabla tiene un millón de filas. ¿Cuánto cuesta `ALTER TABLE users ADD COLUMN active BOOLEAN NOT NULL DEFAULT true` en PostgreSQL 11+?"],
    a: ["Almost nothing: the constant default is stored once, not written into each row", "Presque rien : la valeur par défaut constante est gardée une fois, pas écrite dans chaque ligne", "Casi nada: el valor por defecto constante se guarda una vez, no se escribe en cada fila"],
    w: [["A rewrite of every row, the table locked meanwhile", "Une réécriture de chaque ligne, la table bloquée pendant ce temps", "Reescribir cada fila, con la tabla bloqueada mientras"], ["It is refused: `NOT NULL` needs an empty table", "C'est refusé : `NOT NULL` demande une table vide", "Se rechaza: `NOT NULL` necesita una tabla vacía"], ["It drops the existing rows", "Ça supprime les lignes existantes", "Borra las filas existentes"]],
    e: [
      "Since PostgreSQL 11 (and MySQL 8.0's instant ADD COLUMN), a constant default is metadata. A volatile default such as `random()`, or changing a column's type, still rewrites the table: plan those on large tables.",
      "Depuis PostgreSQL 11 (et l'ADD COLUMN instantané de MySQL 8.0), une valeur par défaut constante est une métadonnée. Un défaut volatil comme `random()`, ou un changement de type, réécrit encore la table : à prévoir sur les grandes tables.",
      "Desde PostgreSQL 11 (y el ADD COLUMN instantáneo de MySQL 8.0), un valor por defecto constante es metadato. Un defecto volátil como `random()`, o un cambio de tipo, sigue reescribiendo la tabla: hay que planificarlo en tablas grandes.",
    ],
  },
  {
    id: "sq-ddl-05",
    q: ["How is a many-to-many link (students and courses) stored?", "Comment stocke-t-on un lien plusieurs-à-plusieurs (élèves et cours) ?", "¿Cómo se guarda una relación muchos a muchos (alumnos y cursos)?"],
    a: ["In a link table `enrolments (student_id, course_id)`, one row per pair", "Dans une table de liaison `enrolments (student_id, course_id)`, une ligne par couple", "En una tabla de enlace `enrolments (student_id, course_id)`, una fila por par"],
    w: [["A comma-separated list of course ids in `students`", "Une liste d'id de cours séparés par des virgules dans `students`", "Una lista de ids de cursos separados por comas en `students`"], ["Columns `course1`, `course2`, `course3` in `students`", "Des colonnes `course1`, `course2`, `course3` dans `students`", "Columnas `course1`, `course2`, `course3` en `students`"], ["A foreign key in each table pointing to the other", "Une clé étrangère dans chaque table vers l'autre", "Una clave foránea en cada tabla hacia la otra"]],
    e: [
      "A link (junction) table with two foreign keys and a primary key on the pair keeps each fact once, can be indexed and joined, and can carry data about the link (a grade, a date).",
      "Une table de liaison avec deux clés étrangères et une clé primaire sur le couple garde chaque fait une fois, s'indexe et se joint, et peut porter des données sur le lien (une note, une date).",
      "Una tabla de enlace con dos claves foráneas y una clave primaria sobre el par guarda cada hecho una vez, se indexa y se une, y puede llevar datos sobre la relación (una nota, una fecha).",
    ],
  },
];

const transactions: SqlQuestion[] = [
  {
    id: "sq-tx-01",
    q: ["`BEGIN; UPDATE … ; DELETE … ; ROLLBACK;`: what is left of the changes?", "`BEGIN; UPDATE … ; DELETE … ; ROLLBACK;` : que reste-t-il des changements ?", "`BEGIN; UPDATE … ; DELETE … ; ROLLBACK;`: ¿qué queda de los cambios?"],
    a: ["Nothing: both are undone together", "Rien : les deux sont annulés ensemble", "Nada: los dos se deshacen juntos"],
    w: [["The `UPDATE`; only the `DELETE` is undone", "L'`UPDATE` ; seul le `DELETE` est annulé", "El `UPDATE`; solo se deshace el `DELETE`"], ["Both: `ROLLBACK` only closes the transaction", "Les deux : `ROLLBACK` ferme seulement la transaction", "Los dos: `ROLLBACK` solo cierra la transacción"], ["It depends on how long they took", "Ça dépend du temps qu'ils ont pris", "Depende de cuánto tardaron"]],
    e: [
      "A transaction is atomic: everything is kept at `COMMIT`, nothing at `ROLLBACK`. Other sessions do not see the changes before the commit. `SAVEPOINT` marks a point to roll back to without losing everything.",
      "Une transaction est atomique : tout est gardé au `COMMIT`, rien au `ROLLBACK`. Les autres sessions ne voient pas les changements avant le commit. `SAVEPOINT` marque un point où revenir sans tout perdre.",
      "Una transacción es atómica: todo se guarda en el `COMMIT`, nada en el `ROLLBACK`. Las otras sesiones no ven los cambios antes del commit. `SAVEPOINT` marca un punto al que volver sin perderlo todo.",
    ],
  },
  {
    id: "sq-tx-02",
    q: ["What do the letters of ACID stand for?", "Que veulent dire les lettres d'ACID ?", "¿Qué significan las letras de ACID?"],
    a: ["Atomicity, consistency, isolation, durability", "Atomicité, cohérence, isolation, durabilité", "Atomicidad, consistencia, aislamiento, durabilidad"],
    w: [["Availability, caching, indexing, distribution", "Disponibilité, cache, indexation, distribution", "Disponibilidad, caché, indexación, distribución"], ["Access, control, integrity, data", "Accès, contrôle, intégrité, données", "Acceso, control, integridad, datos"], ["Atomicity, concurrency, indexing, durability", "Atomicité, concurrence, indexation, durabilité", "Atomicidad, concurrencia, indexación, durabilidad"]],
    e: [
      "All or nothing; constraints hold after each transaction; concurrent transactions do not see each other's unfinished work (to a chosen level); once committed, it survives a crash (the write-ahead log).",
      "Tout ou rien ; les contraintes tiennent après chaque transaction ; les transactions simultanées ne voient pas le travail inachevé des autres (à un niveau choisi) ; une fois validé, il survit à une panne (le journal d'écriture anticipée).",
      "Todo o nada; las restricciones se cumplen tras cada transacción; las transacciones simultáneas no ven el trabajo inacabado de las otras (hasta un nivel elegido); una vez confirmado, sobrevive a un fallo (el registro de escritura anticipada).",
    ],
  },
  {
    id: "sq-tx-03",
    q: ["Which isolation level does each engine use by default?", "Quel niveau d'isolation chaque moteur utilise-t-il par défaut ?", "¿Qué nivel de aislamiento usa cada motor por defecto?"],
    a: ["PostgreSQL: READ COMMITTED; MySQL (InnoDB): REPEATABLE READ; SQLite: serializable", "PostgreSQL : READ COMMITTED ; MySQL (InnoDB) : REPEATABLE READ ; SQLite : sérialisable", "PostgreSQL: READ COMMITTED; MySQL (InnoDB): REPEATABLE READ; SQLite: serializable"],
    w: [["SERIALIZABLE everywhere", "SERIALIZABLE partout", "SERIALIZABLE en todas partes"], ["READ UNCOMMITTED everywhere", "READ UNCOMMITTED partout", "READ UNCOMMITTED en todas partes"], ["PostgreSQL: REPEATABLE READ; MySQL: READ COMMITTED; SQLite: none", "PostgreSQL : REPEATABLE READ ; MySQL : READ COMMITTED ; SQLite : aucune", "PostgreSQL: REPEATABLE READ; MySQL: READ COMMITTED; SQLite: ninguno"]],
    e: [
      "In READ COMMITTED each statement sees what was committed before it started; two reads in one transaction can differ. SQLite has one writer at a time, which makes transactions serializable. `SET TRANSACTION ISOLATION LEVEL` changes it.",
      "En READ COMMITTED, chaque instruction voit ce qui était validé avant son début ; deux lectures d'une même transaction peuvent différer. SQLite n'a qu'un écrivain à la fois, ce qui rend les transactions sérialisables. `SET TRANSACTION ISOLATION LEVEL` le change.",
      "En READ COMMITTED cada sentencia ve lo confirmado antes de empezar; dos lecturas en una misma transacción pueden diferir. SQLite tiene un solo escritor a la vez, lo que hace las transacciones serializables. `SET TRANSACTION ISOLATION LEVEL` lo cambia.",
    ],
  },
  {
    id: "sq-tx-04",
    q: ["Transaction A locks row 1 then wants row 2; B locks row 2 then wants row 1. What happens?", "La transaction A verrouille la ligne 1 puis veut la 2 ; B verrouille la 2 puis veut la 1. Que se passe-t-il ?", "La transacción A bloquea la fila 1 y luego quiere la 2; B bloquea la 2 y luego quiere la 1. ¿Qué pasa?"],
    a: ["A deadlock: the database aborts one of them, which should retry", "Un interblocage : la base annule l'une des deux, qui doit réessayer", "Un interbloqueo: la base aborta una de las dos, que debe reintentar"],
    w: [["They wait for each other forever", "Elles s'attendent indéfiniment", "Se esperan para siempre"], ["Both succeed, the last one wins", "Les deux réussissent, la dernière gagne", "Las dos tienen éxito, gana la última"], ["The database merges their changes", "La base fusionne leurs changements", "La base fusiona sus cambios"]],
    e: [
      "PostgreSQL and MySQL detect the cycle and cancel a victim with a deadlock error. Locking rows in a consistent order (by id, say) avoids most deadlocks; keeping transactions short helps too.",
      "PostgreSQL et MySQL détectent le cycle et annulent une victime avec une erreur d'interblocage. Verrouiller les lignes dans un ordre constant (par id, par exemple) évite la plupart des interblocages ; des transactions courtes aident aussi.",
      "PostgreSQL y MySQL detectan el ciclo y cancelan una víctima con un error de interbloqueo. Bloquear las filas en un orden constante (por id, por ejemplo) evita la mayoría de los interbloqueos; las transacciones cortas también ayudan.",
    ],
  },
  {
    id: "sq-tx-05",
    q: ["Can a `CREATE TABLE` be undone by `ROLLBACK`?", "Un `CREATE TABLE` peut-il être annulé par `ROLLBACK` ?", "¿Se puede deshacer un `CREATE TABLE` con `ROLLBACK`?"],
    a: ["In PostgreSQL and SQLite, yes; MySQL commits implicitly before and after most DDL", "En PostgreSQL et SQLite, oui ; MySQL valide implicitement avant et après la plupart des DDL", "En PostgreSQL y SQLite, sí; MySQL confirma implícitamente antes y después de la mayoría del DDL"],
    w: [["Never: DDL is always final", "Jamais : le DDL est toujours définitif", "Nunca: el DDL siempre es definitivo"], ["Everywhere, like any statement", "Partout, comme toute instruction", "En todas partes, como cualquier sentencia"], ["Only in MySQL", "Seulement en MySQL", "Solo en MySQL"]],
    e: [
      "Transactional DDL lets a migration apply all its steps or none. In MySQL a failed migration can stop half-way, with some tables changed: plan each step to be re-runnable.",
      "Le DDL transactionnel permet à une migration d'appliquer toutes ses étapes ou aucune. En MySQL, une migration en échec peut s'arrêter à mi-chemin, certaines tables modifiées : prévoir chaque étape pour qu'elle puisse être rejouée.",
      "El DDL transaccional permite que una migración aplique todos sus pasos o ninguno. En MySQL una migración fallida puede quedarse a medias, con algunas tablas cambiadas: preparar cada paso para poder repetirlo.",
    ],
  },
];

const indexes: SqlQuestion[] = [
  {
    id: "sq-index-01",
    q: ["What does an index cost?", "Que coûte un index ?", "¿Qué cuesta un índice?"],
    a: ["Disk space, and slower inserts, updates and deletes, which must update it", "De la place sur disque, et des insertions, mises à jour et suppressions plus lentes, qui doivent le tenir à jour", "Espacio en disco, e inserciones, actualizaciones y borrados más lentos, que deben mantenerlo"],
    w: [["Nothing: it only speeds things up", "Rien : il ne fait qu'accélérer", "Nada: solo acelera"], ["It slows down every `SELECT`", "Il ralentit chaque `SELECT`", "Ralentiza cada `SELECT`"], ["It locks the table while it exists", "Il verrouille la table tant qu'il existe", "Bloquea la tabla mientras existe"]],
    e: [
      "An index is a sorted copy of some columns pointing to the rows. Index the columns that `WHERE`, `JOIN` and `ORDER BY` use often, not every column.",
      "Un index est une copie triée de quelques colonnes qui pointe vers les lignes. Indexer les colonnes souvent utilisées par `WHERE`, `JOIN` et `ORDER BY`, pas toutes les colonnes.",
      "Un índice es una copia ordenada de algunas columnas que apunta a las filas. Indexar las columnas que usan a menudo `WHERE`, `JOIN` y `ORDER BY`, no todas.",
    ],
  },
  {
    id: "sq-index-02",
    q: ["With an index on `(last_name, first_name)`, which search can use it?", "Avec un index sur `(last_name, first_name)`, quelle recherche peut l'utiliser ?", "Con un índice sobre `(last_name, first_name)`, ¿qué búsqueda puede usarlo?"],
    a: ["`WHERE last_name = 'Lee'`, with or without first_name", "`WHERE last_name = 'Lee'`, avec ou sans first_name", "`WHERE last_name = 'Lee'`, con o sin first_name"],
    w: [["`WHERE first_name = 'Ana'` alone", "`WHERE first_name = 'Ana'` seul", "`WHERE first_name = 'Ana'` solo"], ["Any search on either column", "Toute recherche sur l'une ou l'autre colonne", "Cualquier búsqueda sobre cualquiera de las columnas"], ["None: an index has one column", "Aucune : un index a une seule colonne", "Ninguna: un índice tiene una sola columna"]],
    e: [
      "Like a phone book sorted by surname then first name: it finds surnames, and first names within a surname, not first names alone. The column most often searched alone goes first.",
      "Comme un annuaire trié par nom puis prénom : il trouve les noms, et les prénoms pour un nom, pas les prénoms seuls. La colonne la plus souvent cherchée seule va en premier.",
      "Como una guía telefónica ordenada por apellido y luego nombre: encuentra apellidos, y nombres dentro de un apellido, no nombres solos. La columna más buscada sola va primero.",
    ],
  },
  {
    id: "sq-index-03",
    q: ["There is an index on `email`, yet `WHERE lower(email) = 'ana@x.org'` reads the whole table. Why?", "Il y a un index sur `email`, pourtant `WHERE lower(email) = 'ana@x.org'` lit toute la table. Pourquoi ?", "Hay un índice sobre `email` y aun así `WHERE lower(email) = 'ana@x.org'` lee toda la tabla. ¿Por qué?"],
    a: ["The index holds email, not lower(email): index the expression itself", "L'index contient email, pas lower(email) : indexer l'expression elle-même", "El índice contiene email, no lower(email): indexar la propia expresión"],
    w: [["Indexes do not work with text", "Les index ne marchent pas avec du texte", "Los índices no funcionan con texto"], ["`lower` is too slow", "`lower` est trop lent", "`lower` es demasiado lento"], ["The index needs `ANALYZE` after each query", "L'index demande un `ANALYZE` après chaque requête", "El índice necesita un `ANALYZE` tras cada consulta"]],
    e: [
      "A function on the column hides it from the index. `CREATE INDEX ON users (lower(email))` in PostgreSQL and SQLite; MySQL 8.0.13+ with `((lower(email)))`, or a generated column.",
      "Une fonction sur la colonne la cache à l'index. `CREATE INDEX ON users (lower(email))` en PostgreSQL et SQLite ; MySQL 8.0.13+ avec `((lower(email)))`, ou une colonne générée.",
      "Una función sobre la columna la oculta al índice. `CREATE INDEX ON users (lower(email))` en PostgreSQL y SQLite; MySQL 8.0.13+ con `((lower(email)))`, o una columna generada.",
    ],
  },
  {
    id: "sq-index-04",
    q: ["Which `LIKE` can use an ordinary index on `name`?", "Quel `LIKE` peut utiliser un index ordinaire sur `name` ?", "¿Qué `LIKE` puede usar un índice ordinario sobre `name`?"],
    a: ["`LIKE 'Mar%'`: a fixed beginning", "`LIKE 'Mar%'` : un début fixe", "`LIKE 'Mar%'`: un comienzo fijo"],
    w: [["`LIKE '%tin'`", "`LIKE '%tin'`", "`LIKE '%tin'`"], ["`LIKE '%art%'`", "`LIKE '%art%'`", "`LIKE '%art%'`"], ["All three", "Les trois", "Los tres"]],
    e: [
      "A B-tree is sorted from the first character: a known prefix is a range in it. Searching inside words needs full-text search, or PostgreSQL's trigram index (`pg_trgm`). In PostgreSQL the prefix case also needs a `C` collation or `text_pattern_ops`.",
      "Un B-tree est trié à partir du premier caractère : un préfixe connu y est un intervalle. Chercher à l'intérieur des mots demande la recherche plein texte, ou l'index trigramme de PostgreSQL (`pg_trgm`). En PostgreSQL, le cas du préfixe demande aussi une collation `C` ou `text_pattern_ops`.",
      "Un B-tree está ordenado desde el primer carácter: un prefijo conocido es un intervalo en él. Buscar dentro de las palabras requiere búsqueda de texto completo, o el índice de trigramas de PostgreSQL (`pg_trgm`). En PostgreSQL el caso del prefijo también necesita intercalación `C` o `text_pattern_ops`.",
    ],
  },
  {
    id: "sq-index-05",
    q: ["Does a foreign key column get an index by itself?", "Une colonne de clé étrangère reçoit-elle un index d'elle-même ?", "¿Recibe una columna de clave foránea un índice por sí sola?"],
    a: ["In MySQL (InnoDB) yes; in PostgreSQL and SQLite no: create it", "En MySQL (InnoDB), oui ; en PostgreSQL et SQLite, non : le créer", "En MySQL (InnoDB) sí; en PostgreSQL y SQLite no: hay que crearlo"],
    w: [["Yes, everywhere", "Oui, partout", "Sí, en todas partes"], ["No, and it cannot be indexed", "Non, et elle ne peut pas être indexée", "No, y no se puede indexar"], ["Only if it is also `UNIQUE`", "Seulement si elle est aussi `UNIQUE`", "Solo si también es `UNIQUE`"]],
    e: [
      "The referenced primary key is indexed, the referencing column not necessarily. Without an index, every join on it, and every delete of a parent (checking the children), scans the child table.",
      "La clé primaire référencée est indexée, la colonne qui la référence pas forcément. Sans index, chaque jointure sur elle, et chaque suppression d'un parent (qui vérifie les enfants), parcourt toute la table enfant.",
      "La clave primaria referenciada está indexada, la columna que la referencia no necesariamente. Sin índice, cada unión sobre ella, y cada borrado de un padre (que comprueba los hijos), recorre toda la tabla hija.",
    ],
  },
];

export const select = { filtering, nulls, sorting, expressions };
export const aggregate = { aggregates, grouping, windows };
export const join = { joins, subqueries, sets };
export const modify = { changes, schema, transactions, indexes };
