/**
 * SQL, Expert: questions added with the four levels (QUIZ_VERSION 5) where a
 * topic had few Expert questions. Same format as sql/*.ts.
 */
import type { LinuxQuestion as SqlQuestion } from "../linux/types";

const select: SqlQuestion[] = [
  {
    id: "sq-sel-x01",
    since: 5,
    q: ["What does `SELECT * FROM events ORDER BY random() LIMIT 1` cost on a table of ten million rows?", "Que coûte `SELECT * FROM events ORDER BY random() LIMIT 1` sur une table de dix millions de lignes ?", "¿Qué cuesta `SELECT * FROM events ORDER BY random() LIMIT 1` en una tabla de diez millones de filas?"],
    a: ["It reads every row and draws a number for each, to keep one", "Elle lit toutes les lignes et tire un nombre pour chacune, pour en garder une", "Lee todas las filas y saca un número para cada una, para quedarse con una"],
    w: [
      ["One index lookup", "Une seule recherche dans un index", "Una sola búsqueda en un índice"],
      ["Almost nothing: `LIMIT 1` stops after the first row", "Presque rien : `LIMIT 1` s'arrête après la première ligne", "Casi nada: `LIMIT 1` se detiene tras la primera fila"],
      ["Nothing: it is refused, `random()` cannot be sorted on", "Rien : elle est refusée, on ne peut pas trier sur `random()`", "Nada: se rechaza, no se puede ordenar por `random()`"],
    ],
    e: [
      "The sort key exists only once every row has been read, so the whole table is scanned (a top-1 sort keeps the memory small, not the reading). PostgreSQL's `TABLESAMPLE SYSTEM`, or picking a random id in the key's range, avoids the full scan. MySQL writes `RAND()`.",
      "La clé de tri n'existe qu'une fois toutes les lignes lues : toute la table est parcourue (un tri du premier élément économise la mémoire, pas la lecture). Le `TABLESAMPLE SYSTEM` de PostgreSQL, ou tirer un identifiant au hasard dans la plage de la clé, évite le parcours complet. MySQL écrit `RAND()`.",
      "La clave de orden solo existe tras leer todas las filas, así que se recorre toda la tabla (ordenar solo el primero ahorra memoria, no lectura). El `TABLESAMPLE SYSTEM` de PostgreSQL, o elegir un id al azar en el rango de la clave, evita el recorrido completo. MySQL escribe `RAND()`.",
    ],
  },
  {
    id: "sq-sel-x02",
    since: 5,
    q: ["`WHERE status <> 'done'` leaves out the rows whose status is NULL. Which condition keeps them?", "`WHERE status <> 'done'` écarte les lignes dont le statut est NULL. Quelle condition les garde ?", "`WHERE status <> 'done'` deja fuera las filas cuyo estado es NULL. ¿Qué condición las conserva?"],
    a: ["`WHERE status IS DISTINCT FROM 'done'`", "`WHERE status IS DISTINCT FROM 'done'`", "`WHERE status IS DISTINCT FROM 'done'`"],
    w: [
      ["`WHERE status != 'done'`", "`WHERE status != 'done'`", "`WHERE status != 'done'`"],
      ["`WHERE NOT (status = 'done')`", "`WHERE NOT (status = 'done')`", "`WHERE NOT (status = 'done')`"],
      ["`WHERE status NOT LIKE 'done'`", "`WHERE status NOT LIKE 'done'`", "`WHERE status NOT LIKE 'done'`"],
    ],
    e: [
      "Any comparison with NULL gives NULL, which `WHERE` treats as false; `!=` and `NOT (… = …)` behave the same. `IS DISTINCT FROM` treats NULL as a value (PostgreSQL, SQLite 3.39+); elsewhere write `status <> 'done' OR status IS NULL`, or MySQL's `NOT (status <=> 'done')`.",
      "Toute comparaison avec NULL donne NULL, que `WHERE` traite comme faux ; `!=` et `NOT (… = …)` font de même. `IS DISTINCT FROM` traite NULL comme une valeur (PostgreSQL, SQLite 3.39+) ; ailleurs, écrivez `status <> 'done' OR status IS NULL`, ou en MySQL `NOT (status <=> 'done')`.",
      "Toda comparación con NULL da NULL, que `WHERE` trata como falso; `!=` y `NOT (… = …)` se comportan igual. `IS DISTINCT FROM` trata NULL como un valor (PostgreSQL, SQLite 3.39+); en otros motores escriba `status <> 'done' OR status IS NULL`, o en MySQL `NOT (status <=> 'done')`.",
    ],
  },
  {
    id: "sq-sel-x03",
    since: 5,
    q: ["What do the three counts of `SELECT COUNT(*), COUNT(email), COUNT(DISTINCT email) FROM users` tell apart?", "Que distinguent les trois comptes de `SELECT COUNT(*), COUNT(email), COUNT(DISTINCT email) FROM users` ?", "¿Qué distinguen los tres recuentos de `SELECT COUNT(*), COUNT(email), COUNT(DISTINCT email) FROM users`?"],
    a: ["All the rows, the rows with an email, and the different emails", "Toutes les lignes, les lignes qui ont un e-mail, et les e-mails différents", "Todas las filas, las filas con correo, y los correos distintos"],
    w: [
      ["The same number three times", "Trois fois le même nombre", "Tres veces el mismo número"],
      ["The rows, the NULL emails, and the duplicate emails", "Les lignes, les e-mails NULL et les e-mails en double", "Las filas, los correos NULL y los correos duplicados"],
      ["The columns, the emails, and the users", "Les colonnes, les e-mails et les utilisateurs", "Las columnas, los correos y los usuarios"],
    ],
    e: [
      "`COUNT(*)` counts rows; `COUNT(column)` skips NULLs; `COUNT(DISTINCT column)` also counts each value once. The gap between the last two is the number of rows that repeat an email.",
      "`COUNT(*)` compte les lignes ; `COUNT(colonne)` saute les NULL ; `COUNT(DISTINCT colonne)` compte en plus chaque valeur une fois. L'écart entre les deux derniers est le nombre de lignes qui répètent un e-mail.",
      "`COUNT(*)` cuenta filas; `COUNT(columna)` salta los NULL; `COUNT(DISTINCT columna)` además cuenta cada valor una vez. La diferencia entre los dos últimos es el número de filas que repiten un correo.",
    ],
  },
];

const aggregate: SqlQuestion[] = [
  {
    id: "sq-agg-x01",
    since: 5,
    q: ["What does `GROUP BY ROLLUP (country, city)` add to the result?", "Qu'ajoute `GROUP BY ROLLUP (country, city)` au résultat ?", "¿Qué añade `GROUP BY ROLLUP (country, city)` al resultado?"],
    a: ["A subtotal row per country and a grand total, with NULL in the columns rolled up", "Une ligne de sous-total par pays et un total général, avec NULL dans les colonnes regroupées", "Una fila de subtotal por país y un total general, con NULL en las columnas agrupadas"],
    w: [
      ["The cities sorted inside each country, nothing more", "Les villes triées dans chaque pays, sans plus", "Las ciudades ordenadas dentro de cada país, nada más"],
      ["One row per city across all countries", "Une ligne par ville, tous pays confondus", "Una fila por ciudad, sin distinguir países"],
      ["The running total of each country", "Le total cumulé de chaque pays", "El total acumulado de cada país"],
    ],
    e: [
      "ROLLUP groups by (country, city), then (country), then (). `GROUPING(city)` tells a subtotal's NULL from a real NULL city. PostgreSQL and SQL Server write `ROLLUP (…)`, MySQL `GROUP BY country, city WITH ROLLUP`; SQLite has neither.",
      "ROLLUP regroupe par (country, city), puis (country), puis (). `GROUPING(city)` distingue le NULL d'un sous-total d'une ville réellement NULL. PostgreSQL et SQL Server écrivent `ROLLUP (…)`, MySQL `GROUP BY country, city WITH ROLLUP` ; SQLite n'a ni l'un ni l'autre.",
      "ROLLUP agrupa por (country, city), luego (country), luego (). `GROUPING(city)` distingue el NULL de un subtotal de una ciudad realmente NULL. PostgreSQL y SQL Server escriben `ROLLUP (…)`, MySQL `GROUP BY country, city WITH ROLLUP`; SQLite no tiene ninguno.",
    ],
  },
  {
    id: "sq-agg-x02",
    since: 5,
    q: ["With one row per day, what does `SUM(sales) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)` give?", "Avec une ligne par jour, que donne `SUM(sales) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)` ?", "Con una fila por día, ¿qué da `SUM(sales) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`?"],
    a: ["A moving sum over seven days: the current day and the six before it", "Une somme glissante sur sept jours : le jour courant et les six précédents", "Una suma móvil de siete días: el día actual y los seis anteriores"],
    w: [
      ["A sum over six days", "Une somme sur six jours", "Una suma de seis días"],
      ["The total of the table minus the last six days", "Le total de la table moins les six derniers jours", "El total de la tabla menos los seis últimos días"],
      ["The sum of every seventh day", "La somme d'un jour sur sept", "La suma de uno de cada siete días"],
    ],
    e: [
      "`ROWS` counts rows, so a missing day widens the window in time; `RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW` (PostgreSQL) counts days. The first six rows sum fewer than seven values.",
      "`ROWS` compte des lignes : un jour manquant élargit la fenêtre dans le temps ; `RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW` (PostgreSQL) compte des jours. Les six premières lignes additionnent moins de sept valeurs.",
      "`ROWS` cuenta filas, así que un día que falta ensancha la ventana en el tiempo; `RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW` (PostgreSQL) cuenta días. Las seis primeras filas suman menos de siete valores.",
    ],
  },
];

const join: SqlQuestion[] = [
  {
    id: "sq-join-x01",
    since: 5,
    q: ["What does a `LATERAL` subquery allow in `FROM`?", "Que permet une sous-requête `LATERAL` dans le `FROM` ?", "¿Qué permite una subconsulta `LATERAL` en el `FROM`?"],
    a: ["Referring to the tables listed before it, e.g. the three latest orders of each customer", "Faire référence aux tables placées avant elle, par exemple les trois dernières commandes de chaque client", "Hacer referencia a las tablas anteriores, por ejemplo los tres últimos pedidos de cada cliente"],
    w: [
      ["Running the subquery in parallel", "Exécuter la sous-requête en parallèle", "Ejecutar la subconsulta en paralelo"],
      ["Joining tables of two different databases", "Joindre des tables de deux bases différentes", "Unir tablas de dos bases de datos distintas"],
      ["Joining without an `ON` condition", "Joindre sans condition `ON`", "Unir sin condición `ON`"],
    ],
    e: [
      "An ordinary subquery in `FROM` cannot see the other tables of the `FROM`; a lateral one is run for each row before it. PostgreSQL and MySQL 8.0.14+ have `LATERAL`, SQL Server `CROSS APPLY`; SQLite has neither.",
      "Une sous-requête ordinaire dans le `FROM` ne voit pas les autres tables du `FROM` ; une sous-requête latérale est exécutée pour chaque ligne qui la précède. PostgreSQL et MySQL 8.0.14+ ont `LATERAL`, SQL Server `CROSS APPLY` ; SQLite n'a ni l'un ni l'autre.",
      "Una subconsulta normal en el `FROM` no ve las otras tablas del `FROM`; una lateral se ejecuta para cada fila anterior. PostgreSQL y MySQL 8.0.14+ tienen `LATERAL`, SQL Server `CROSS APPLY`; SQLite no tiene ninguno.",
    ],
  },
  {
    id: "sq-join-x02",
    since: 5,
    q: ["Which query lists the customers that have no order?", "Quelle requête liste les clients qui n'ont aucune commande ?", "¿Qué consulta lista los clientes que no tienen pedidos?"],
    a: ["`SELECT c.* FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`", "`SELECT c.* FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`", "`SELECT c.* FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`"],
    w: [
      ["`SELECT c.* FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`", "`SELECT c.* FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`", "`SELECT c.* FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL`"],
      ["`SELECT c.* FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NOT NULL`", "`SELECT c.* FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NOT NULL`", "`SELECT c.* FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NOT NULL`"],
      ["`SELECT c.* FROM customers c CROSS JOIN orders o WHERE o.customer_id <> c.id`", "`SELECT c.* FROM customers c CROSS JOIN orders o WHERE o.customer_id <> c.id`", "`SELECT c.* FROM customers c CROSS JOIN orders o WHERE o.customer_id <> c.id`"],
    ],
    e: [
      "An anti-join: `NOT EXISTS`, or `LEFT JOIN … WHERE o.id IS NULL`. An inner join never yields a NULL order id, the `IS NOT NULL` version lists customers with orders, and the cross join pairs every customer with others' orders. Avoid `NOT IN` when the subquery can return NULL.",
      "Une anti-jointure : `NOT EXISTS`, ou `LEFT JOIN … WHERE o.id IS NULL`. Une jointure interne ne donne jamais d'identifiant de commande NULL, la version `IS NOT NULL` liste les clients qui ont des commandes, et le produit cartésien associe chaque client aux commandes des autres. Évitez `NOT IN` quand la sous-requête peut renvoyer NULL.",
      "Una antiunión: `NOT EXISTS`, o `LEFT JOIN … WHERE o.id IS NULL`. Una unión interna nunca da un id de pedido NULL, la versión `IS NOT NULL` lista los clientes con pedidos, y el producto cartesiano empareja a cada cliente con pedidos ajenos. Evite `NOT IN` cuando la subconsulta pueda devolver NULL.",
    ],
  },
];

const postgres: SqlQuestion[] = [
  {
    id: "sq-pg-x01",
    since: 5,
    q: ["What does `CREATE INDEX CONCURRENTLY` avoid on a busy table?", "Qu'évite `CREATE INDEX CONCURRENTLY` sur une table très utilisée ?", "¿Qué evita `CREATE INDEX CONCURRENTLY` en una tabla muy usada?"],
    a: ["Blocking inserts, updates and deletes while the index is built", "Bloquer les insertions, mises à jour et suppressions pendant la construction de l'index", "Bloquear inserciones, actualizaciones y borrados mientras se construye el índice"],
    w: [
      ["Using any disk space for the index", "Utiliser de l'espace disque pour l'index", "Usar espacio en disco para el índice"],
      ["Blocking reads, which a normal build stops", "Bloquer les lectures, qu'une construction normale arrête", "Bloquear las lecturas, que una construcción normal detiene"],
      ["Having to build the index again after a crash", "Devoir reconstruire l'index après un plantage", "Tener que reconstruir el índice tras un fallo"],
    ],
    e: [
      "A normal `CREATE INDEX` lets reads run but blocks writes until it ends. The concurrent build scans the table twice and takes longer; it cannot run in a transaction block, and if it fails it leaves an INVALID index to drop and build again.",
      "Un `CREATE INDEX` normal laisse passer les lectures mais bloque les écritures jusqu'à la fin. La construction concurrente parcourt la table deux fois et prend plus de temps ; elle ne peut pas tourner dans un bloc de transaction, et si elle échoue elle laisse un index INVALID à supprimer et refaire.",
      "Un `CREATE INDEX` normal deja pasar las lecturas pero bloquea las escrituras hasta terminar. La construcción concurrente recorre la tabla dos veces y tarda más; no puede ejecutarse en un bloque de transacción, y si falla deja un índice INVALID que hay que borrar y rehacer.",
    ],
  },
  {
    id: "sq-pg-x02",
    since: 5,
    q: ["What is `CREATE INDEX ON orders (customer_id) WHERE status = 'open'`?", "Qu'est-ce que `CREATE INDEX ON orders (customer_id) WHERE status = 'open'` ?", "¿Qué es `CREATE INDEX ON orders (customer_id) WHERE status = 'open'`?"],
    a: ["A partial index over the open orders only: smaller, used by queries that have that condition", "Un index partiel sur les seules commandes ouvertes : plus petit, utilisé par les requêtes qui ont cette condition", "Un índice parcial solo sobre los pedidos abiertos: más pequeño, usado por las consultas con esa condición"],
    w: [
      ["An index that is built only while orders are open", "Un index construit seulement pendant que des commandes sont ouvertes", "Un índice que solo se construye mientras hay pedidos abiertos"],
      ["A constraint forbidding two open orders per customer", "Une contrainte interdisant deux commandes ouvertes par client", "Una restricción que prohíbe dos pedidos abiertos por cliente"],
      ["An index on `status` with `customer_id` as a filter", "Un index sur `status` avec `customer_id` comme filtre", "Un índice sobre `status` con `customer_id` como filtro"],
    ],
    e: [
      "Only rows matching the `WHERE` are indexed, so the index stays small when open orders are few; the planner uses it when the query's condition implies the index's. With `UNIQUE` it would enforce one open order per customer. SQLite has partial indexes too.",
      "Seules les lignes qui vérifient le `WHERE` sont indexées : l'index reste petit quand les commandes ouvertes sont peu nombreuses ; le planificateur l'utilise quand la condition de la requête implique celle de l'index. Avec `UNIQUE`, il imposerait une seule commande ouverte par client. SQLite a aussi des index partiels.",
      "Solo se indexan las filas que cumplen el `WHERE`, así que el índice es pequeño cuando hay pocos pedidos abiertos; el planificador lo usa cuando la condición de la consulta implica la del índice. Con `UNIQUE` impondría un solo pedido abierto por cliente. SQLite también tiene índices parciales.",
    ],
  },
  {
    id: "sq-pg-x03",
    since: 5,
    q: ["What does `SELECT … FOR UPDATE SKIP LOCKED` let several workers do?", "Que permet `SELECT … FOR UPDATE SKIP LOCKED` à plusieurs workers ?", "¿Qué permite `SELECT … FOR UPDATE SKIP LOCKED` a varios workers?"],
    a: ["Each take different rows of a job queue, without waiting for one another", "Prendre chacun des lignes différentes d'une file de tâches, sans s'attendre", "Tomar cada uno filas distintas de una cola de tareas, sin esperarse"],
    w: [
      ["Read rows that another transaction has not committed yet", "Lire des lignes qu'une autre transaction n'a pas encore validées", "Leer filas que otra transacción aún no confirmó"],
      ["Update rows without taking any lock", "Mettre à jour des lignes sans prendre de verrou", "Actualizar filas sin tomar ningún bloqueo"],
      ["Skip the rows that failed a constraint", "Sauter les lignes qui violent une contrainte", "Saltar las filas que violan una restricción"],
    ],
    e: [
      "`FOR UPDATE` locks the rows read; `SKIP LOCKED` passes over rows already locked instead of waiting. With `LIMIT 1` each worker claims a different job. PostgreSQL and MySQL 8 have it; SQLite locks the whole database for writes.",
      "`FOR UPDATE` verrouille les lignes lues ; `SKIP LOCKED` passe les lignes déjà verrouillées au lieu d'attendre. Avec `LIMIT 1`, chaque worker prend une tâche différente. PostgreSQL et MySQL 8 l'ont ; SQLite verrouille toute la base pour écrire.",
      "`FOR UPDATE` bloquea las filas leídas; `SKIP LOCKED` pasa por alto las filas ya bloqueadas en vez de esperar. Con `LIMIT 1` cada worker toma una tarea distinta. PostgreSQL y MySQL 8 lo tienen; SQLite bloquea toda la base para escribir.",
    ],
  },
];

const sqlite: SqlQuestion[] = [
  {
    id: "sq-lite-x01",
    since: 5,
    q: ["What does `CREATE TABLE pets (age INTEGER) STRICT` change in SQLite?", "Que change `CREATE TABLE pets (age INTEGER) STRICT` en SQLite ?", "¿Qué cambia `CREATE TABLE pets (age INTEGER) STRICT` en SQLite?"],
    a: ["Values must fit the declared type: inserting `'old'` into `age` is refused", "Les valeurs doivent respecter le type déclaré : insérer `'old'` dans `age` est refusé", "Los valores deben ajustarse al tipo declarado: insertar `'old'` en `age` se rechaza"],
    w: [
      ["Foreign keys are checked for this table", "Les clés étrangères sont vérifiées pour cette table", "Las claves foráneas se comprueban para esta tabla"],
      ["Every column becomes `NOT NULL`", "Toutes les colonnes deviennent `NOT NULL`", "Todas las columnas pasan a ser `NOT NULL`"],
      ["The table can only be read, not written", "La table ne peut plus qu'être lue", "La tabla solo puede leerse, no escribirse"],
    ],
    e: [
      "Since SQLite 3.37, a STRICT table allows only the types `INTEGER`, `REAL`, `TEXT`, `BLOB` and `ANY`, and refuses a value that cannot be converted losslessly; `'42'` still becomes 42. Without STRICT, a column's type is only an affinity.",
      "Depuis SQLite 3.37, une table STRICT n'admet que les types `INTEGER`, `REAL`, `TEXT`, `BLOB` et `ANY`, et refuse une valeur qu'on ne peut convertir sans perte ; `'42'` devient encore 42. Sans STRICT, le type d'une colonne n'est qu'une affinité.",
      "Desde SQLite 3.37, una tabla STRICT solo admite los tipos `INTEGER`, `REAL`, `TEXT`, `BLOB` y `ANY`, y rechaza un valor que no se pueda convertir sin pérdida; `'42'` sigue pasando a 42. Sin STRICT, el tipo de una columna es solo una afinidad.",
    ],
  },
  {
    id: "sq-lite-x02",
    since: 5,
    q: ["What does `PRAGMA integrity_check` do?", "Que fait `PRAGMA integrity_check` ?", "¿Qué hace `PRAGMA integrity_check`?"],
    a: ["Reads the whole database file and reports corruption, or `ok`", "Lit tout le fichier de la base et signale les corruptions, ou `ok`", "Lee todo el archivo de la base y señala la corrupción, o `ok`"],
    w: [
      ["Checks that every foreign key points to an existing row", "Vérifie que chaque clé étrangère pointe vers une ligne existante", "Comprueba que cada clave foránea apunta a una fila existente"],
      ["Repairs the damaged pages", "Répare les pages endommagées", "Repara las páginas dañadas"],
      ["Checks the values against the column types", "Vérifie les valeurs par rapport aux types des colonnes", "Comprueba los valores contra los tipos de las columnas"],
    ],
    e: [
      "It walks every page, index and record, which takes time on a large file; `PRAGMA quick_check` skips the index-against-table checks. Foreign keys are checked by `PRAGMA foreign_key_check`. Neither repairs anything: restore from a backup, or `.recover` in the shell.",
      "Il parcourt chaque page, index et enregistrement, ce qui prend du temps sur un gros fichier ; `PRAGMA quick_check` saute la comparaison des index avec la table. Les clés étrangères se vérifient avec `PRAGMA foreign_key_check`. Aucun ne répare : restaurez une sauvegarde, ou `.recover` dans le shell.",
      "Recorre cada página, índice y registro, lo que tarda en un archivo grande; `PRAGMA quick_check` omite la comparación de los índices con la tabla. Las claves foráneas se comprueban con `PRAGMA foreign_key_check`. Ninguno repara nada: restaure una copia, o `.recover` en la shell.",
    ],
  },
  {
    id: "sq-lite-x03",
    since: 5,
    q: ["In WAL mode, why can the `-wal` file keep growing?", "En mode WAL, pourquoi le fichier `-wal` peut-il grossir sans fin ?", "En modo WAL, ¿por qué puede crecer sin fin el archivo `-wal`?"],
    a: ["A checkpoint cannot complete while a reader keeps an old snapshot open, so the log is never restarted", "Un checkpoint ne peut pas aboutir tant qu'un lecteur garde un ancien instantané ouvert : le journal ne repart jamais à zéro", "Un checkpoint no puede completarse mientras un lector mantenga abierta una instantánea antigua, así que el registro nunca vuelve a empezar"],
    w: [
      ["WAL mode never deletes anything by design", "Le mode WAL ne supprime jamais rien, par conception", "El modo WAL nunca borra nada, por diseño"],
      ["`VACUUM` was not run after each write", "`VACUUM` n'a pas été lancé après chaque écriture", "No se ejecutó `VACUUM` tras cada escritura"],
      ["The journal keeps every query for the statistics", "Le journal garde chaque requête pour les statistiques", "El registro guarda cada consulta para las estadísticas"],
    ],
    e: [
      "Writers append to the WAL; a checkpoint copies pages back into the database and the WAL restarts once no reader needs its old pages. A long-lived read transaction, often a forgotten open statement, holds it back. `PRAGMA wal_checkpoint(TRUNCATE)` after closing it shrinks the file.",
      "Les écrivains ajoutent au WAL ; un checkpoint recopie les pages dans la base et le WAL repart quand plus aucun lecteur n'a besoin de ses anciennes pages. Une transaction de lecture qui dure, souvent une requête ouverte oubliée, le retient. `PRAGMA wal_checkpoint(TRUNCATE)` une fois celle-ci fermée réduit le fichier.",
      "Los escritores añaden al WAL; un checkpoint copia las páginas a la base y el WAL vuelve a empezar cuando ningún lector necesita sus páginas viejas. Una transacción de lectura larga, a menudo una sentencia abierta olvidada, lo retiene. `PRAGMA wal_checkpoint(TRUNCATE)` tras cerrarla reduce el archivo.",
    ],
  },
  {
    id: "sq-lite-x04",
    since: 5,
    q: ["What does `VACUUM INTO 'backup.db'` do?", "Que fait `VACUUM INTO 'backup.db'` ?", "¿Qué hace `VACUUM INTO 'backup.db'`?"],
    a: ["Writes a compact, consistent copy of the database to a new file, while the database stays in use", "Écrit une copie compacte et cohérente de la base dans un nouveau fichier, pendant que la base reste utilisée", "Escribe una copia compacta y coherente de la base en un archivo nuevo, mientras la base sigue en uso"],
    w: [
      ["Moves the database into `backup.db` and empties the original", "Déplace la base dans `backup.db` et vide l'original", "Mueve la base a `backup.db` y vacía el original"],
      ["Restores the database from `backup.db`", "Restaure la base depuis `backup.db`", "Restaura la base desde `backup.db`"],
      ["Deletes the rows already saved in `backup.db`", "Supprime les lignes déjà sauvegardées dans `backup.db`", "Borra las filas ya guardadas en `backup.db`"],
    ],
    e: [
      "Since SQLite 3.27 it is a read transaction that builds a new, defragmented file; copying the `.db` file while an app writes can catch it half-changed. The shell's `.backup` and the online backup API are the other safe ways.",
      "Depuis SQLite 3.27, c'est une transaction de lecture qui construit un nouveau fichier défragmenté ; copier le fichier `.db` pendant qu'une application écrit peut le saisir à moitié modifié. Le `.backup` du shell et l'API de sauvegarde en ligne sont les autres moyens sûrs.",
      "Desde SQLite 3.27 es una transacción de lectura que construye un archivo nuevo y desfragmentado; copiar el archivo `.db` mientras una aplicación escribe puede pillarlo a medio cambiar. El `.backup` de la shell y la API de copia en línea son las otras formas seguras.",
    ],
  },
];

const mysql: SqlQuestion[] = [
  {
    id: "sq-my-x01",
    since: 5,
    q: ["In MySQL, what is the character set `utf8`?", "En MySQL, qu'est-ce que le jeu de caractères `utf8` ?", "En MySQL, ¿qué es el juego de caracteres `utf8`?"],
    a: ["An alias of `utf8mb3`: at most 3 bytes per character, so no emoji", "Un alias de `utf8mb3` : au plus 3 octets par caractère, donc pas d'emoji", "Un alias de `utf8mb3`: como mucho 3 bytes por carácter, así que sin emoji"],
    w: [
      ["Full UTF-8, the same as `utf8mb4`", "L'UTF-8 complet, comme `utf8mb4`", "UTF-8 completo, igual que `utf8mb4`"],
      ["UTF-16 under another name", "De l'UTF-16 sous un autre nom", "UTF-16 con otro nombre"],
      ["Latin-1 with a few extra characters", "Du Latin-1 avec quelques caractères en plus", "Latin-1 con algunos caracteres más"],
    ],
    e: [
      "MySQL's first UTF-8 stopped at 3 bytes, missing emoji and rare CJK characters, which fail or are cut on insert. `utf8mb4` is full UTF-8 and the default since MySQL 8.0; convert old tables with `ALTER TABLE … CONVERT TO CHARACTER SET utf8mb4`.",
      "Le premier UTF-8 de MySQL s'arrêtait à 3 octets, sans emoji ni idéogrammes rares, qui échouent ou sont tronqués à l'insertion. `utf8mb4` est l'UTF-8 complet, par défaut depuis MySQL 8.0 ; on convertit les vieilles tables avec `ALTER TABLE … CONVERT TO CHARACTER SET utf8mb4`.",
      "El primer UTF-8 de MySQL se quedaba en 3 bytes, sin emoji ni ideogramas raros, que fallan o se cortan al insertar. `utf8mb4` es el UTF-8 completo y el predeterminado desde MySQL 8.0; las tablas antiguas se convierten con `ALTER TABLE … CONVERT TO CHARACTER SET utf8mb4`.",
    ],
  },
  {
    id: "sq-my-x02",
    since: 5,
    q: ["What does MySQL's `ONLY_FULL_GROUP_BY` mode refuse?", "Que refuse le mode `ONLY_FULL_GROUP_BY` de MySQL ?", "¿Qué rechaza el modo `ONLY_FULL_GROUP_BY` de MySQL?"],
    a: ["Selecting a column that is neither grouped, aggregated, nor determined by the grouped columns", "Sélectionner une colonne qui n'est ni regroupée, ni agrégée, ni déterminée par les colonnes regroupées", "Seleccionar una columna que no está agrupada, ni agregada, ni determinada por las columnas agrupadas"],
    w: [
      ["A `GROUP BY` without `ORDER BY`", "Un `GROUP BY` sans `ORDER BY`", "Un `GROUP BY` sin `ORDER BY`"],
      ["Grouping on more than one column", "Regrouper sur plus d'une colonne", "Agrupar por más de una columna"],
      ["Aggregates without a `GROUP BY`", "Des agrégats sans `GROUP BY`", "Agregados sin `GROUP BY`"],
    ],
    e: [
      "Without it, MySQL returned a value from any row of the group, which hid bugs. It is on by default since 5.7. A column functionally dependent on a grouped primary key is allowed; `ANY_VALUE(col)` says the choice does not matter.",
      "Sans lui, MySQL renvoyait la valeur d'une ligne quelconque du groupe, ce qui cachait des erreurs. Il est actif par défaut depuis la 5.7. Une colonne qui dépend d'une clé primaire regroupée est admise ; `ANY_VALUE(col)` dit que le choix n'importe pas.",
      "Sin él, MySQL devolvía el valor de una fila cualquiera del grupo, lo que ocultaba errores. Está activo por defecto desde la 5.7. Se admite una columna que depende de una clave primaria agrupada; `ANY_VALUE(col)` indica que la elección da igual.",
    ],
  },
  {
    id: "sq-my-x03",
    since: 5,
    q: ["Under InnoDB's default isolation, `REPEATABLE READ`, what do gap locks prevent?", "Sous l'isolation par défaut d'InnoDB, `REPEATABLE READ`, qu'empêchent les verrous d'intervalle ?", "Con el aislamiento por defecto de InnoDB, `REPEATABLE READ`, ¿qué impiden los bloqueos de intervalo?"],
    a: ["Inserts into a range that a locking read scanned, so reading it again finds no new rows", "Les insertions dans une plage qu'une lecture verrouillante a parcourue : la relire ne trouve pas de nouvelles lignes", "Las inserciones en un rango que leyó una lectura con bloqueo: al releerlo no aparecen filas nuevas"],
    w: [
      ["Reads of rows being changed", "Les lectures de lignes en cours de modification", "Las lecturas de filas que se están cambiando"],
      ["Gaps in auto-increment ids", "Les trous dans les identifiants auto-incrémentés", "Los huecos en los ids autoincrementales"],
      ["Two connections using the same table", "Deux connexions sur la même table", "Dos conexiones usando la misma tabla"],
    ],
    e: [
      "`SELECT … FOR UPDATE WHERE age BETWEEN 20 AND 30` locks the index records and the gaps between them, so no phantom row appears. They are a common source of unexpected waits and deadlocks; `READ COMMITTED` takes almost none.",
      "`SELECT … FOR UPDATE WHERE age BETWEEN 20 AND 30` verrouille les entrées d'index et les intervalles entre elles : aucune ligne fantôme n'apparaît. Ils causent souvent des attentes et des interblocages inattendus ; `READ COMMITTED` n'en prend presque pas.",
      "`SELECT … FOR UPDATE WHERE age BETWEEN 20 AND 30` bloquea las entradas del índice y los intervalos entre ellas, así que no aparece ninguna fila fantasma. Causan a menudo esperas y bloqueos mutuos inesperados; `READ COMMITTED` casi no los toma.",
    ],
  },
  {
    id: "sq-my-x04",
    since: 5,
    q: ["What does `innodb_buffer_pool_size` set?", "Que règle `innodb_buffer_pool_size` ?", "¿Qué fija `innodb_buffer_pool_size`?"],
    a: ["The memory InnoDB uses to cache table and index pages", "La mémoire qu'InnoDB utilise pour garder en cache les pages des tables et des index", "La memoria que InnoDB usa para guardar en caché las páginas de tablas e índices"],
    w: [
      ["The largest table InnoDB accepts", "La plus grande table qu'InnoDB accepte", "La tabla más grande que acepta InnoDB"],
      ["The number of connections allowed", "Le nombre de connexions permises", "El número de conexiones permitidas"],
      ["The size of the binary log files", "La taille des fichiers du journal binaire", "El tamaño de los archivos del registro binario"],
    ],
    e: [
      "It is the main MySQL setting: on a dedicated server, often 50–75 % of RAM, so that the working set stays in memory. Since 5.7 it can be changed while running, in chunks; the default, 128 MiB, is small.",
      "C'est le réglage principal de MySQL : sur un serveur dédié, souvent 50 à 75 % de la RAM, pour que les données utiles restent en mémoire. Depuis la 5.7 il peut changer à chaud, par blocs ; la valeur par défaut, 128 Mio, est petite.",
      "Es el ajuste principal de MySQL: en un servidor dedicado, a menudo el 50–75 % de la RAM, para que los datos de trabajo queden en memoria. Desde la 5.7 se puede cambiar en marcha, por bloques; el valor por defecto, 128 MiB, es pequeño.",
    ],
  },
  {
    id: "sq-my-x05",
    since: 5,
    q: ["MySQL on Linux, with the default `lower_case_table_names=0`: are `Users` and `users` the same table?", "MySQL sous Linux, avec `lower_case_table_names=0` par défaut : `Users` et `users` sont-elles la même table ?", "MySQL en Linux, con `lower_case_table_names=0` por defecto: ¿son `Users` y `users` la misma tabla?"],
    a: ["No: table names follow the file system, which is case-sensitive on Linux", "Non : les noms de tables suivent le système de fichiers, sensible à la casse sous Linux", "No: los nombres de tabla siguen al sistema de archivos, que distingue mayúsculas en Linux"],
    w: [
      ["Yes: SQL names are never case-sensitive", "Oui : les noms SQL ne sont jamais sensibles à la casse", "Sí: los nombres SQL nunca distinguen mayúsculas"],
      ["Yes, but only for InnoDB tables", "Oui, mais seulement pour les tables InnoDB", "Sí, pero solo para las tablas InnoDB"],
      ["No, and column names are case-sensitive too", "Non, et les noms de colonnes aussi sont sensibles à la casse", "No, y los nombres de columna también distinguen mayúsculas"],
    ],
    e: [
      "A schema written on Windows or macOS (case-insensitive) can break on Linux. Column names are not case-sensitive. Since MySQL 8.0 the setting can only be chosen when the server is first initialised; using lower-case names everywhere avoids the issue.",
      "Un schéma écrit sous Windows ou macOS (insensibles à la casse) peut casser sous Linux. Les noms de colonnes ne sont pas sensibles à la casse. Depuis MySQL 8.0, le réglage ne se choisit qu'à l'initialisation du serveur ; des noms en minuscules partout évitent le problème.",
      "Un esquema escrito en Windows o macOS (que no distinguen mayúsculas) puede romperse en Linux. Los nombres de columna no distinguen mayúsculas. Desde MySQL 8.0 el ajuste solo se elige al inicializar el servidor; usar nombres en minúsculas en todas partes evita el problema.",
    ],
  },
];

const practice: SqlQuestion[] = [
  {
    id: "sq-prac-x01",
    since: 5,
    q: ["Why rename a column by adding the new one in one release and dropping the old one in a later release?", "Pourquoi renommer une colonne en ajoutant la nouvelle dans une version et en supprimant l'ancienne dans une version ultérieure ?", "¿Por qué renombrar una columna añadiendo la nueva en una versión y borrando la antigua en una versión posterior?"],
    a: ["So that the old and new versions of the app can run side by side during the deployment", "Pour que l'ancienne et la nouvelle version de l'application puissent tourner ensemble pendant le déploiement", "Para que la versión antigua y la nueva de la aplicación puedan funcionar a la vez durante el despliegue"],
    w: [
      ["Because SQL cannot rename a column", "Parce que SQL ne sait pas renommer une colonne", "Porque SQL no puede renombrar una columna"],
      ["To keep the database smaller", "Pour garder la base plus petite", "Para que la base sea más pequeña"],
      ["Because indexes are lost on rename", "Parce que les index sont perdus au renommage", "Porque los índices se pierden al renombrar"],
    ],
    e: [
      "Expand, then contract: add the column, write to both, backfill, switch the reads, and drop the old column once no running version uses it. A plain rename breaks every server still running the old code during a rolling deployment.",
      "Étendre, puis contracter : ajouter la colonne, écrire dans les deux, remplir, basculer les lectures, puis supprimer l'ancienne quand plus aucune version en service ne l'utilise. Un simple renommage casse tous les serveurs qui font encore tourner l'ancien code pendant un déploiement progressif.",
      "Ampliar y luego contraer: añadir la columna, escribir en ambas, rellenar, cambiar las lecturas y borrar la antigua cuando ninguna versión en marcha la use. Un simple renombrado rompe todos los servidores que aún ejecutan el código antiguo durante un despliegue progresivo.",
    ],
  },
  {
    id: "sq-prac-x02",
    since: 5,
    q: ["What is an idempotency key in an API that records payments?", "Qu'est-ce qu'une clé d'idempotence dans une API qui enregistre des paiements ?", "¿Qué es una clave de idempotencia en una API que registra pagos?"],
    a: ["A key sent by the client and stored under a unique constraint, so a retried request does not pay twice", "Une clé envoyée par le client et stockée sous une contrainte d'unicité, pour qu'une requête répétée ne paie pas deux fois", "Una clave enviada por el cliente y guardada con una restricción de unicidad, para que una petición repetida no pague dos veces"],
    w: [
      ["The payment's primary key, chosen by the database", "La clé primaire du paiement, choisie par la base", "La clave primaria del pago, elegida por la base"],
      ["A secret that signs every request", "Un secret qui signe chaque requête", "Un secreto que firma cada petición"],
      ["A key that encrypts the card number", "Une clé qui chiffre le numéro de carte", "Una clave que cifra el número de tarjeta"],
    ],
    e: [
      "After a timeout the client cannot know whether the payment went through, so it retries with the same key; the insert hits the unique constraint and the server returns the first result. The key and the payment are written in one transaction.",
      "Après un délai dépassé, le client ne peut pas savoir si le paiement est passé : il réessaie avec la même clé ; l'insertion se heurte à la contrainte d'unicité et le serveur renvoie le premier résultat. La clé et le paiement s'écrivent dans une même transaction.",
      "Tras un tiempo agotado el cliente no sabe si el pago se hizo, así que reintenta con la misma clave; la inserción choca con la restricción de unicidad y el servidor devuelve el primer resultado. La clave y el pago se escriben en una misma transacción.",
    ],
  },
  {
    id: "sq-prac-x03",
    since: 5,
    q: ["An app reads the stock, then runs `UPDATE items SET stock = 4 WHERE id = 7` with the value it computed. What goes wrong under load?", "Une application lit le stock, puis lance `UPDATE items SET stock = 4 WHERE id = 7` avec la valeur calculée. Qu'est-ce qui ne va pas sous charge ?", "Una aplicación lee el stock y luego ejecuta `UPDATE items SET stock = 4 WHERE id = 7` con el valor calculado. ¿Qué falla con carga?"],
    a: ["Two requests read 5 and both write 4: a sale is lost. `SET stock = stock - 1 WHERE id = 7 AND stock > 0` does it in one step", "Deux requêtes lisent 5 et écrivent toutes deux 4 : une vente est perdue. `SET stock = stock - 1 WHERE id = 7 AND stock > 0` le fait en une étape", "Dos peticiones leen 5 y ambas escriben 4: se pierde una venta. `SET stock = stock - 1 WHERE id = 7 AND stock > 0` lo hace en un paso"],
    w: [
      ["Nothing, each `UPDATE` is atomic", "Rien, chaque `UPDATE` est atomique", "Nada, cada `UPDATE` es atómico"],
      ["The second request fails with a deadlock", "La seconde requête échoue sur un interblocage", "La segunda petición falla con un bloqueo mutuo"],
      ["The stock becomes NULL", "Le stock devient NULL", "El stock pasa a NULL"],
    ],
    e: [
      "A lost update: the statement is atomic, the read-then-write is not. Compute in the `UPDATE`, lock the row with `SELECT … FOR UPDATE`, or check a version column in the `WHERE` and retry when no row changed.",
      "Une mise à jour perdue : l'instruction est atomique, la lecture suivie d'une écriture non. Calculez dans l'`UPDATE`, verrouillez la ligne avec `SELECT … FOR UPDATE`, ou vérifiez une colonne de version dans le `WHERE` et réessayez quand aucune ligne n'a changé.",
      "Una actualización perdida: la sentencia es atómica, la lectura seguida de escritura no. Calcule en el `UPDATE`, bloquee la fila con `SELECT … FOR UPDATE`, o compruebe una columna de versión en el `WHERE` y reintente cuando no cambie ninguna fila.",
    ],
  },
];

/** By topic: the Expert list of each. */
export const SQL_EXPERT = {
  sqlSelect: { expert: select },
  sqlAggregate: { expert: aggregate },
  sqlJoins: { expert: join },
  sqlPostgres: { expert: postgres },
  sqlSqlite: { expert: sqlite },
  sqlMysql: { expert: mysql },
  sqlPractice: { expert: practice },
} as const;
