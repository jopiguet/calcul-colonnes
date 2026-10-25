/**
 * The three engines, each with its client and what sets it apart:
 * PostgreSQL (psql), SQLite (sqlite3) and MySQL/MariaDB (mysql). Each
 * question says how to install the client.
 */
import type { Install, LinuxQuestion as SqlQuestion } from "../linux/types";

export const PSQL: Install = { apt: "postgresql-client", dnf: "postgresql", brew: "libpq" };
export const SQLITE: Install = { apt: "sqlite3", dnf: "sqlite", brew: "sqlite" };
export const MYSQL: Install = { apt: "default-mysql-client", dnf: "mysql", brew: "mysql-client" };

const withInstall = (install: Install, list: SqlQuestion[]): SqlQuestion[] => list.map((q) => ({ ...q, install }));

// -------------------------------------------------------------- PostgreSQL

const psql: SqlQuestion[] = [
  {
    id: "sq-psql-01",
    q: ["In psql, how do you list the tables, then see the columns of `pets`?", "Dans psql, comment lister les tables, puis voir les colonnes de `pets` ?", "En psql, ¿cómo se listan las tablas y luego se ven las columnas de `pets`?"],
    a: ["`\\dt`, then `\\d pets`", "`\\dt`, puis `\\d pets`", "`\\dt`, y luego `\\d pets`"],
    w: [["`SHOW TABLES;`, then `DESCRIBE pets;`", "`SHOW TABLES;`, puis `DESCRIBE pets;`", "`SHOW TABLES;`, y luego `DESCRIBE pets;`"], ["`.tables`, then `.schema pets`", "`.tables`, puis `.schema pets`", "`.tables`, y luego `.schema pets`"], ["`LIST TABLES;`, then `COLUMNS pets;`", "`LIST TABLES;`, puis `COLUMNS pets;`", "`LIST TABLES;`, y luego `COLUMNS pets;`"]],
    e: [
      "psql's meta-commands start with a backslash and need no semicolon. `\\d pets` shows columns, indexes and constraints; `\\d+` adds sizes; `\\?` lists them all. `SHOW TABLES` is MySQL, `.tables` SQLite.",
      "Les méta-commandes de psql commencent par une barre oblique inverse et n'ont pas besoin de point-virgule. `\\d pets` montre colonnes, index et contraintes ; `\\d+` ajoute les tailles ; `\\?` les liste toutes. `SHOW TABLES` est du MySQL, `.tables` du SQLite.",
      "Los metacomandos de psql empiezan por una barra invertida y no necesitan punto y coma. `\\d pets` muestra columnas, índices y restricciones; `\\d+` añade tamaños; `\\?` los lista todos. `SHOW TABLES` es MySQL, `.tables` SQLite.",
    ],
  },
  {
    id: "sq-psql-02",
    q: ["In psql, how do you switch to the database `shop`?", "Dans psql, comment passer à la base `shop` ?", "En psql, ¿cómo se cambia a la base `shop`?"],
    a: ["`\\c shop`", "`\\c shop`", "`\\c shop`"],
    w: [["`USE shop;`", "`USE shop;`", "`USE shop;`"], ["`SET DATABASE shop;`", "`SET DATABASE shop;`", "`SET DATABASE shop;`"], ["`.open shop`", "`.open shop`", "`.open shop`"]],
    e: [
      "A PostgreSQL connection belongs to one database: `\\c` (`\\connect`) opens a new connection. `\\l` lists the databases. `USE` is MySQL; in PostgreSQL, schemas inside a database are chosen with `SET search_path`.",
      "Une connexion PostgreSQL appartient à une base : `\\c` (`\\connect`) ouvre une nouvelle connexion. `\\l` liste les bases. `USE` est du MySQL ; en PostgreSQL, les schémas d'une base se choisissent avec `SET search_path`.",
      "Una conexión de PostgreSQL pertenece a una base: `\\c` (`\\connect`) abre una nueva conexión. `\\l` lista las bases. `USE` es de MySQL; en PostgreSQL, los esquemas dentro de una base se eligen con `SET search_path`.",
    ],
  },
  {
    id: "sq-psql-03",
    q: ["A row has twenty columns and wraps unreadably in psql. What helps?", "Une ligne a vingt colonnes et se replie de façon illisible dans psql. Qu'est-ce qui aide ?", "Una fila tiene veinte columnas y se corta de forma ilegible en psql. ¿Qué ayuda?"],
    a: ["`\\x`: expanded display, one column per line", "`\\x` : affichage étendu, une colonne par ligne", "`\\x`: visualización expandida, una columna por línea"],
    w: [["`\\timing`", "`\\timing`", "`\\timing`"], ["`SELECT * WRAP OFF`", "`SELECT * WRAP OFF`", "`SELECT * WRAP OFF`"], ["`\\q`", "`\\q`", "`\\q`"]],
    e: [
      "`\\x` toggles expanded output (`\\x auto` switches only when a row is too wide); MySQL's equivalent is ending the query with `\\G`. `\\timing` shows how long each query took, `\\q` quits.",
      "`\\x` bascule l'affichage étendu (`\\x auto` ne bascule que si une ligne est trop large) ; l'équivalent MySQL est de finir la requête par `\\G`. `\\timing` montre la durée de chaque requête, `\\q` quitte.",
      "`\\x` alterna la salida expandida (`\\x auto` solo cambia cuando una fila es demasiado ancha); el equivalente en MySQL es terminar la consulta con `\\G`. `\\timing` muestra cuánto tardó cada consulta, `\\q` sale.",
    ],
  },
  {
    id: "sq-psql-04",
    q: ["How do you load `pets.csv` from your laptop into a table on a remote PostgreSQL server?", "Comment charger `pets.csv` depuis votre portable dans une table d'un serveur PostgreSQL distant ?", "¿Cómo se carga `pets.csv` desde el portátil en una tabla de un servidor PostgreSQL remoto?"],
    a: ["`\\copy pets FROM 'pets.csv' WITH (FORMAT csv, HEADER)` in psql", "`\\copy pets FROM 'pets.csv' WITH (FORMAT csv, HEADER)` dans psql", "`\\copy pets FROM 'pets.csv' WITH (FORMAT csv, HEADER)` en psql"],
    w: [["`COPY pets FROM 'pets.csv'`: the server reads your laptop's file", "`COPY pets FROM 'pets.csv'` : le serveur lit le fichier de votre portable", "`COPY pets FROM 'pets.csv'`: el servidor lee el archivo de su portátil"], ["`INSERT INTO pets FILE 'pets.csv'`", "`INSERT INTO pets FILE 'pets.csv'`", "`INSERT INTO pets FILE 'pets.csv'`"], ["`.import pets.csv pets`", "`.import pets.csv pets`", "`.import pets.csv pets`"]],
    e: [
      "`COPY … FROM 'file'` is run by the server and reads the server's disk (and needs special rights). psql's `\\copy` reads the file on the client and streams it through the connection.",
      "`COPY … FROM 'fichier'` est exécuté par le serveur et lit le disque du serveur (avec des droits spéciaux). Le `\\copy` de psql lit le fichier côté client et l'envoie par la connexion.",
      "`COPY … FROM 'archivo'` lo ejecuta el servidor y lee el disco del servidor (con derechos especiales). El `\\copy` de psql lee el archivo en el cliente y lo envía por la conexión.",
    ],
  },
  {
    id: "sq-psql-05",
    q: ["`psql postgresql://ana@db.example.org:5432/shop`: what does the URL give?", "`psql postgresql://ana@db.example.org:5432/shop` : que donne l'URL ?", "`psql postgresql://ana@db.example.org:5432/shop`: ¿qué da la URL?"],
    a: ["User ana, host db.example.org, port 5432, database shop", "Utilisatrice ana, hôte db.example.org, port 5432, base shop", "Usuaria ana, servidor db.example.org, puerto 5432, base shop"],
    w: [["User shop, database ana", "Utilisateur shop, base ana", "Usuario shop, base ana"], ["A web page to open in the browser", "Une page web à ouvrir dans le navigateur", "Una página web para abrir en el navegador"], ["Host ana, database db.example.org", "Hôte ana, base db.example.org", "Servidor ana, base db.example.org"]],
    e: [
      "`scheme://user:password@host:port/database?options`. The password is better left out of the URL (shell history): psql asks for it, or reads `~/.pgpass`. Options such as `?sslmode=require` follow.",
      "`schéma://utilisateur:motdepasse@hôte:port/base?options`. Mieux vaut laisser le mot de passe hors de l'URL (historique du shell) : psql le demande, ou le lit dans `~/.pgpass`. Les options comme `?sslmode=require` suivent.",
      "`esquema://usuario:contraseña@servidor:puerto/base?opciones`. Mejor dejar la contraseña fuera de la URL (historial del shell): psql la pide, o la lee de `~/.pgpass`. Opciones como `?sslmode=require` van después.",
    ],
  },
];

const pgFeatures: SqlQuestion[] = [
  {
    id: "sq-pg-01",
    q: ["How do you get the id the database gave a new row, in the same statement?", "Comment obtenir l'id que la base a donné à une nouvelle ligne, dans la même instruction ?", "¿Cómo se obtiene el id que la base dio a una fila nueva, en la misma sentencia?"],
    a: ["`INSERT INTO pets (name) VALUES ('Rex') RETURNING id`", "`INSERT INTO pets (name) VALUES ('Rex') RETURNING id`", "`INSERT INTO pets (name) VALUES ('Rex') RETURNING id`"],
    w: [["`SELECT MAX(id) FROM pets` right after", "`SELECT MAX(id) FROM pets` juste après", "`SELECT MAX(id) FROM pets` justo después"], ["`INSERT … OUTPUT id`", "`INSERT … OUTPUT id`", "`INSERT … OUTPUT id`"], ["`SELECT LAST_INSERT_ID()`", "`SELECT LAST_INSERT_ID()`", "`SELECT LAST_INSERT_ID()`"]],
    e: [
      "`RETURNING` works with `INSERT`, `UPDATE` and `DELETE` in PostgreSQL, and in SQLite since 3.35. `MAX(id)` is wrong as soon as two sessions insert at once. MySQL has `LAST_INSERT_ID()`, per connection.",
      "`RETURNING` marche avec `INSERT`, `UPDATE` et `DELETE` en PostgreSQL, et en SQLite depuis la 3.35. `MAX(id)` est faux dès que deux sessions insèrent en même temps. MySQL a `LAST_INSERT_ID()`, par connexion.",
      "`RETURNING` funciona con `INSERT`, `UPDATE` y `DELETE` en PostgreSQL, y en SQLite desde la 3.35. `MAX(id)` falla en cuanto dos sesiones insertan a la vez. MySQL tiene `LAST_INSERT_ID()`, por conexión.",
    ],
  },
  {
    id: "sq-pg-02",
    q: ["What does `INSERT … ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name` do?", "Que fait `INSERT … ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name` ?", "¿Qué hace `INSERT … ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name`?"],
    a: ["Inserts, or when the email exists, updates that row with the new name", "Insère, ou si l'e-mail existe, met à jour cette ligne avec le nouveau nom", "Inserta o, si el correo existe, actualiza esa fila con el nombre nuevo"],
    w: [["Deletes the existing row, then inserts", "Supprime la ligne existante, puis insère", "Borra la fila existente y luego inserta"], ["Inserts a second row with the same email", "Insère une seconde ligne avec le même e-mail", "Inserta una segunda fila con el mismo correo"], ["Ignores the new row", "Ignore la nouvelle ligne", "Ignora la fila nueva"]],
    e: [
      "An upsert, in one atomic statement. `EXCLUDED` is the row that was proposed; `DO NOTHING` skips it instead. It needs a unique index on `email`. SQLite has the same syntax; MySQL writes `ON DUPLICATE KEY UPDATE`.",
      "Un upsert, en une instruction atomique. `EXCLUDED` est la ligne proposée ; `DO NOTHING` l'ignore à la place. Il faut un index unique sur `email`. SQLite a la même syntaxe ; MySQL écrit `ON DUPLICATE KEY UPDATE`.",
      "Un upsert, en una sentencia atómica. `EXCLUDED` es la fila propuesta; `DO NOTHING` la ignora en su lugar. Necesita un índice único sobre `email`. SQLite tiene la misma sintaxis; MySQL escribe `ON DUPLICATE KEY UPDATE`.",
    ],
  },
  {
    id: "sq-pg-03",
    q: ["Which is today's way to declare an auto-numbered key in PostgreSQL?", "Quelle est la façon actuelle de déclarer une clé auto-numérotée en PostgreSQL ?", "¿Cuál es la forma actual de declarar una clave autonumerada en PostgreSQL?"],
    a: ["`id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`", "`id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`", "`id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`"],
    w: [["`id INTEGER AUTO_INCREMENT PRIMARY KEY`", "`id INTEGER AUTO_INCREMENT PRIMARY KEY`", "`id INTEGER AUTO_INCREMENT PRIMARY KEY`"], ["`id INTEGER PRIMARY KEY AUTOINCREMENT`", "`id INTEGER PRIMARY KEY AUTOINCREMENT`", "`id INTEGER PRIMARY KEY AUTOINCREMENT`"], ["`id NUMBER IDENTITY(1,1)`", "`id NUMBER IDENTITY(1,1)`", "`id NUMBER IDENTITY(1,1)`"]],
    e: [
      "Identity columns are standard SQL (PostgreSQL 10+). `SERIAL` still works: it creates a sequence and a default. `AUTO_INCREMENT` is MySQL, `AUTOINCREMENT` SQLite. Numbers can have gaps: a rolled-back insert still uses one.",
      "Les colonnes d'identité sont du SQL standard (PostgreSQL 10+). `SERIAL` marche encore : il crée une séquence et une valeur par défaut. `AUTO_INCREMENT` est du MySQL, `AUTOINCREMENT` du SQLite. Les numéros peuvent avoir des trous : une insertion annulée en consomme un.",
      "Las columnas de identidad son SQL estándar (PostgreSQL 10+). `SERIAL` sigue funcionando: crea una secuencia y un valor por defecto. `AUTO_INCREMENT` es MySQL, `AUTOINCREMENT` SQLite. Los números pueden tener huecos: una inserción deshecha consume uno.",
    ],
  },
  {
    id: "sq-pg-04",
    q: ["A `data JSONB` column holds `{\"city\": \"Bern\"}`. What gives the city as text?", "Une colonne `data JSONB` contient `{\"city\": \"Bern\"}`. Qu'est-ce qui donne la ville en texte ?", "Una columna `data JSONB` contiene `{\"city\": \"Bern\"}`. ¿Qué da la ciudad como texto?"],
    a: ["`data ->> 'city'`", "`data ->> 'city'`", "`data ->> 'city'`"],
    w: [["`data -> 'city'`, which is already text", "`data -> 'city'`, qui est déjà du texte", "`data -> 'city'`, que ya es texto"], ["`data.city`", "`data.city`", "`data.city`"], ["`data['city'] AS TEXT`", "`data['city'] AS TEXT`", "`data['city'] AS TEXT`"]],
    e: [
      "`->` returns JSON (`\"Bern\"` with quotes), `->>` text. `data @> '{\"city\": \"Bern\"}'` tests containment and can use a GIN index. `JSONB` stores parsed, indexed JSON; plain `JSON` keeps the text as typed.",
      "`->` renvoie du JSON (`\"Bern\"` avec guillemets), `->>` du texte. `data @> '{\"city\": \"Bern\"}'` teste l'inclusion et peut utiliser un index GIN. `JSONB` stocke un JSON analysé et indexable ; `JSON` simple garde le texte tel quel.",
      "`->` devuelve JSON (`\"Bern\"` con comillas), `->>` texto. `data @> '{\"city\": \"Bern\"}'` comprueba la inclusión y puede usar un índice GIN. `JSONB` guarda JSON analizado e indexable; `JSON` simple conserva el texto tal cual.",
    ],
  },
  {
    id: "sq-pg-05",
    q: ["What does `SELECT generate_series(1, 5)` return?", "Que renvoie `SELECT generate_series(1, 5)` ?", "¿Qué devuelve `SELECT generate_series(1, 5)`?"],
    a: ["Five rows: 1, 2, 3, 4, 5", "Cinq lignes : 1, 2, 3, 4, 5", "Cinco filas: 1, 2, 3, 4, 5"],
    w: [["One row with the array 1 to 5", "Une ligne avec le tableau 1 à 5", "Una fila con el array del 1 al 5"], ["A random number between 1 and 5", "Un nombre au hasard entre 1 et 5", "Un número al azar entre 1 y 5"], ["The text `'1-5'`", "Le texte `'1-5'`", "El texto `'1-5'`"]],
    e: [
      "A set-returning function: handy for test data and to fill gaps, such as every day of a month with `generate_series('2026-10-01'::date, '2026-10-31', interval '1 day')`, left-joined to the sales.",
      "Une fonction qui renvoie un ensemble : pratique pour des données de test et pour combler les trous, comme chaque jour d'un mois avec `generate_series('2026-10-01'::date, '2026-10-31', interval '1 day')`, en jointure gauche avec les ventes.",
      "Una función que devuelve un conjunto: útil para datos de prueba y para rellenar huecos, como cada día de un mes con `generate_series('2026-10-01'::date, '2026-10-31', interval '1 day')`, en unión izquierda con las ventas.",
    ],
  },
  {
    id: "sq-pg-06",
    q: ["What does `'2026-10-25'::date` do?", "Que fait `'2026-10-25'::date` ?", "¿Qué hace `'2026-10-25'::date`?"],
    a: ["Casts the text to a date, PostgreSQL's short form of `CAST(… AS date)`", "Convertit le texte en date, la forme courte de `CAST(… AS date)` en PostgreSQL", "Convierte el texto en fecha, la forma corta de `CAST(… AS date)` en PostgreSQL"],
    w: [["Compares the text with today's date", "Compare le texte à la date du jour", "Compara el texto con la fecha de hoy"], ["Names a column `date`", "Nomme une colonne `date`", "Nombra una columna `date`"], ["Comments out the rest of the line", "Met le reste de la ligne en commentaire", "Comenta el resto de la línea"]],
    e: [
      "`::` is PostgreSQL only; `CAST` works everywhere. Typed literals are standard too: `DATE '2026-10-25'`, `INTERVAL '1 day'`.",
      "`::` n'existe qu'en PostgreSQL ; `CAST` marche partout. Les littéraux typés sont aussi standard : `DATE '2026-10-25'`, `INTERVAL '1 day'`.",
      "`::` solo existe en PostgreSQL; `CAST` funciona en todas partes. Los literales con tipo también son estándar: `DATE '2026-10-25'`, `INTERVAL '1 day'`.",
    ],
  },
];

const pgAdmin: SqlQuestion[] = [
  {
    id: "sq-pgadm-01",
    q: ["How do you save a database `shop` and restore it elsewhere?", "Comment sauvegarder une base `shop` et la restaurer ailleurs ?", "¿Cómo se guarda una base `shop` y se restaura en otro sitio?"],
    a: ["`pg_dump -Fc shop > shop.dump`, then `pg_restore -d shop shop.dump`", "`pg_dump -Fc shop > shop.dump`, puis `pg_restore -d shop shop.dump`", "`pg_dump -Fc shop > shop.dump`, y luego `pg_restore -d shop shop.dump`"],
    w: [["Copy the files of the data directory while the server runs", "Copier les fichiers du répertoire de données pendant que le serveur tourne", "Copiar los archivos del directorio de datos con el servidor en marcha"], ["`BACKUP DATABASE shop TO 'shop.bak'`", "`BACKUP DATABASE shop TO 'shop.bak'`", "`BACKUP DATABASE shop TO 'shop.bak'`"], ["`mysqldump shop > shop.sql`", "`mysqldump shop > shop.sql`", "`mysqldump shop > shop.sql`"]],
    e: [
      "`pg_dump` takes a consistent snapshot without stopping anyone. `-Fc` (custom format) is compressed and lets `pg_restore` pick tables or run in parallel (`-j`); a plain `.sql` dump is replayed with `psql -f`. `pg_dumpall` adds roles. A backup counts once a restore has been tried.",
      "`pg_dump` prend un instantané cohérent sans arrêter personne. `-Fc` (format personnalisé) est compressé et permet à `pg_restore` de choisir des tables ou de travailler en parallèle (`-j`) ; un dump `.sql` simple se rejoue avec `psql -f`. `pg_dumpall` ajoute les rôles. Une sauvegarde compte une fois qu'une restauration a été essayée.",
      "`pg_dump` toma una instantánea coherente sin parar a nadie. `-Fc` (formato personalizado) va comprimido y permite que `pg_restore` elija tablas o trabaje en paralelo (`-j`); un volcado `.sql` simple se repite con `psql -f`. `pg_dumpall` añade los roles. Una copia cuenta cuando se ha probado restaurarla.",
    ],
  },
  {
    id: "sq-pgadm-02",
    q: ["An app should read and write the tables of `shop`, nothing more. What do you give its role?", "Une application doit lire et écrire les tables de `shop`, rien de plus. Que donner à son rôle ?", "Una aplicación debe leer y escribir las tablas de `shop`, nada más. ¿Qué se le da a su rol?"],
    a: ["`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app`", "`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app`", "`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app`"],
    w: [["`ALTER ROLE app SUPERUSER`", "`ALTER ROLE app SUPERUSER`", "`ALTER ROLE app SUPERUSER`"], ["The `postgres` account's password", "Le mot de passe du compte `postgres`", "La contraseña de la cuenta `postgres`"], ["`GRANT ALL PRIVILEGES ON DATABASE shop TO app`", "`GRANT ALL PRIVILEGES ON DATABASE shop TO app`", "`GRANT ALL PRIVILEGES ON DATABASE shop TO app`"]],
    e: [
      "Least privilege: a leaked app password then cannot drop tables or read other databases. Rights on the database itself are about connecting and creating schemas, not reading tables. Future tables need `ALTER DEFAULT PRIVILEGES`.",
      "Le moindre privilège : un mot de passe d'application qui fuit ne peut alors ni supprimer des tables ni lire d'autres bases. Les droits sur la base elle-même portent sur la connexion et la création de schémas, pas sur la lecture des tables. Les futures tables demandent `ALTER DEFAULT PRIVILEGES`.",
      "Mínimo privilegio: una contraseña de aplicación filtrada no puede entonces borrar tablas ni leer otras bases. Los derechos sobre la base en sí tratan de conectarse y crear esquemas, no de leer tablas. Las tablas futuras requieren `ALTER DEFAULT PRIVILEGES`.",
    ],
  },
  {
    id: "sq-pgadm-03",
    q: ["What does `EXPLAIN ANALYZE SELECT …` show?", "Que montre `EXPLAIN ANALYZE SELECT …` ?", "¿Qué muestra `EXPLAIN ANALYZE SELECT …`?"],
    a: ["The plan the query used, with real row counts and times: it runs the query", "Le plan utilisé par la requête, avec les vrais nombres de lignes et les temps : il exécute la requête", "El plan que usó la consulta, con números reales de filas y tiempos: ejecuta la consulta"],
    w: [["Only the estimated plan, without running anything", "Seulement le plan estimé, sans rien exécuter", "Solo el plan estimado, sin ejecutar nada"], ["The table's statistics", "Les statistiques de la table", "Las estadísticas de la tabla"], ["A check of the query's syntax", "Une vérification de la syntaxe de la requête", "Una comprobación de la sintaxis de la consulta"]],
    e: [
      "`EXPLAIN` alone estimates; `ANALYZE` executes, so wrap an `UPDATE` in `BEGIN` … `ROLLBACK`. Look for `Seq Scan` on large tables, and estimated rows far from actual ones (stale statistics: run `ANALYZE`).",
      "`EXPLAIN` seul estime ; `ANALYZE` exécute : envelopper un `UPDATE` dans `BEGIN` … `ROLLBACK`. Chercher les `Seq Scan` sur de grandes tables, et les lignes estimées loin des réelles (statistiques périmées : lancer `ANALYZE`).",
      "`EXPLAIN` solo estima; `ANALYZE` ejecuta, así que hay que envolver un `UPDATE` en `BEGIN` … `ROLLBACK`. Buscar `Seq Scan` en tablas grandes, y filas estimadas lejos de las reales (estadísticas antiguas: ejecutar `ANALYZE`).",
    ],
  },
  {
    id: "sq-pgadm-04",
    q: ["Why does PostgreSQL need `VACUUM` (usually run by autovacuum)?", "Pourquoi PostgreSQL a-t-il besoin de `VACUUM` (lancé d'habitude par l'autovacuum) ?", "¿Por qué PostgreSQL necesita `VACUUM` (normalmente lanzado por autovacuum)?"],
    a: ["An update or delete leaves the old row version in place; `VACUUM` frees that space for reuse", "Une mise à jour ou suppression laisse l'ancienne version de la ligne en place ; `VACUUM` libère cette place pour la réutiliser", "Una actualización o un borrado deja la versión antigua de la fila; `VACUUM` libera ese espacio para reutilizarlo"],
    w: [["To defragment the disk", "Pour défragmenter le disque", "Para desfragmentar el disco"], ["To delete rows older than a month", "Pour supprimer les lignes de plus d'un mois", "Para borrar las filas de más de un mes"], ["To make a backup", "Pour faire une sauvegarde", "Para hacer una copia de seguridad"]],
    e: [
      "MVCC keeps old versions for transactions that may still see them. `VACUUM` marks dead ones reusable (`VACUUM FULL` rewrites the table, locked); it also prevents transaction-id wraparound. Long-open transactions block it.",
      "Le MVCC garde les anciennes versions pour les transactions qui peuvent encore les voir. `VACUUM` rend réutilisables les versions mortes (`VACUUM FULL` réécrit la table, verrouillée) ; il évite aussi le rebouclage des numéros de transaction. Les transactions ouvertes longtemps le bloquent.",
      "MVCC guarda las versiones antiguas para las transacciones que aún puedan verlas. `VACUUM` marca reutilizables las muertas (`VACUUM FULL` reescribe la tabla, bloqueada); también evita el desbordamiento de los identificadores de transacción. Las transacciones abiertas mucho tiempo lo bloquean.",
    ],
  },
  {
    id: "sq-pgadm-05",
    q: ["A query has hung for an hour. How do you find it, then stop it?", "Une requête bloque depuis une heure. Comment la trouver, puis l'arrêter ?", "Una consulta lleva una hora colgada. ¿Cómo se encuentra y luego se detiene?"],
    a: ["`SELECT pid, state, query FROM pg_stat_activity`, then `SELECT pg_cancel_backend(pid)`", "`SELECT pid, state, query FROM pg_stat_activity`, puis `SELECT pg_cancel_backend(pid)`", "`SELECT pid, state, query FROM pg_stat_activity`, y luego `SELECT pg_cancel_backend(pid)`"],
    w: [["`SHOW PROCESSLIST`, then `KILL`", "`SHOW PROCESSLIST`, puis `KILL`", "`SHOW PROCESSLIST`, y luego `KILL`"], ["Restart the server", "Redémarrer le serveur", "Reiniciar el servidor"], ["`kill -9` on the postgres process", "`kill -9` sur le processus postgres", "`kill -9` sobre el proceso postgres"]],
    e: [
      "`pg_cancel_backend` cancels the query, `pg_terminate_backend` closes the connection. `kill -9` on a backend makes the server restart every connection. MySQL's way is `SHOW PROCESSLIST` and `KILL QUERY id`. `statement_timeout` prevents it.",
      "`pg_cancel_backend` annule la requête, `pg_terminate_backend` ferme la connexion. Un `kill -9` sur un processus serveur fait redémarrer toutes les connexions. En MySQL : `SHOW PROCESSLIST` et `KILL QUERY id`. `statement_timeout` l'évite.",
      "`pg_cancel_backend` cancela la consulta, `pg_terminate_backend` cierra la conexión. Un `kill -9` sobre un proceso del servidor reinicia todas las conexiones. En MySQL: `SHOW PROCESSLIST` y `KILL QUERY id`. `statement_timeout` lo previene.",
    ],
  },
];

// ------------------------------------------------------------------ SQLite

const sqliteShell: SqlQuestion[] = [
  {
    id: "sq-lite-01",
    q: ["In the `sqlite3` shell, how do you list the tables and see how `pets` was created?", "Dans le shell `sqlite3`, comment lister les tables et voir comment `pets` a été créée ?", "En el shell `sqlite3`, ¿cómo se listan las tablas y se ve cómo se creó `pets`?"],
    a: ["`.tables`, then `.schema pets`", "`.tables`, puis `.schema pets`", "`.tables`, y luego `.schema pets`"],
    w: [["`\\dt`, then `\\d pets`", "`\\dt`, puis `\\d pets`", "`\\dt`, y luego `\\d pets`"], ["`SHOW TABLES;`, then `SHOW CREATE TABLE pets;`", "`SHOW TABLES;`, puis `SHOW CREATE TABLE pets;`", "`SHOW TABLES;`, y luego `SHOW CREATE TABLE pets;`"], ["`.list`, then `.describe pets`", "`.list`, puis `.describe pets`", "`.list`, y luego `.describe pets`"]],
    e: [
      "The shell's own commands start with a dot, take no semicolon, and `.help` lists them. The schema is also a table: `SELECT name, sql FROM sqlite_schema`. `PRAGMA table_info(pets)` gives the columns one per row.",
      "Les commandes propres au shell commencent par un point, sans point-virgule, et `.help` les liste. Le schéma est aussi une table : `SELECT name, sql FROM sqlite_schema`. `PRAGMA table_info(pets)` donne les colonnes une par ligne.",
      "Los comandos propios del shell empiezan por un punto, sin punto y coma, y `.help` los lista. El esquema también es una tabla: `SELECT name, sql FROM sqlite_schema`. `PRAGMA table_info(pets)` da las columnas una por fila.",
    ],
  },
  {
    id: "sq-lite-02",
    q: ["`sqlite3 shop.db` with no file `shop.db` yet: what happens?", "`sqlite3 shop.db` alors que `shop.db` n'existe pas : que se passe-t-il ?", "`sqlite3 shop.db` sin que exista `shop.db`: ¿qué pasa?"],
    a: ["The database is created, as a file, when something is first written", "La base est créée, sous forme de fichier, à la première écriture", "La base se crea, como archivo, en la primera escritura"],
    w: [["An error: create it with `CREATE DATABASE` first", "Une erreur : la créer d'abord avec `CREATE DATABASE`", "Un error: hay que crearla antes con `CREATE DATABASE`"], ["It connects to a server named shop.db", "Il se connecte à un serveur nommé shop.db", "Se conecta a un servidor llamado shop.db"], ["It opens a database in memory only", "Il ouvre une base en mémoire seulement", "Abre una base solo en memoria"]],
    e: [
      "SQLite has no server: a database is one ordinary file (plus `-wal` and `-shm` files in WAL mode), copied, mailed or versioned like any other. A misspelt name quietly makes a new, empty database. `sqlite3` with no name, or `:memory:`, works in memory.",
      "SQLite n'a pas de serveur : une base est un simple fichier (plus des fichiers `-wal` et `-shm` en mode WAL), qui se copie, s'envoie ou se versionne comme un autre. Un nom mal tapé crée en silence une nouvelle base vide. `sqlite3` sans nom, ou `:memory:`, travaille en mémoire.",
      "SQLite no tiene servidor: una base es un archivo corriente (más archivos `-wal` y `-shm` en modo WAL), que se copia, se envía o se versiona como cualquier otro. Un nombre mal escrito crea en silencio una base nueva y vacía. `sqlite3` sin nombre, o `:memory:`, trabaja en memoria.",
    ],
  },
  {
    id: "sq-lite-03",
    q: ["How do you load `pets.csv`, with a header row, into the table `pets`?", "Comment charger `pets.csv`, avec une ligne d'en-tête, dans la table `pets` ?", "¿Cómo se carga `pets.csv`, con una fila de cabecera, en la tabla `pets`?"],
    a: ["`.import --csv --skip 1 pets.csv pets`", "`.import --csv --skip 1 pets.csv pets`", "`.import --csv --skip 1 pets.csv pets`"],
    w: [["`\\copy pets FROM 'pets.csv'`", "`\\copy pets FROM 'pets.csv'`", "`\\copy pets FROM 'pets.csv'`"], ["`LOAD DATA INFILE 'pets.csv' INTO TABLE pets`", "`LOAD DATA INFILE 'pets.csv' INTO TABLE pets`", "`LOAD DATA INFILE 'pets.csv' INTO TABLE pets`"], ["`.read pets.csv`", "`.read pets.csv`", "`.read pets.csv`"]],
    e: [
      "When the table does not exist, `.import --csv` creates it with the header as column names (all TEXT). `.read file.sql` runs SQL from a file; output to CSV: `.mode csv`, `.headers on`, `.output out.csv`.",
      "Quand la table n'existe pas, `.import --csv` la crée avec l'en-tête comme noms de colonnes (toutes en TEXT). `.read fichier.sql` exécute du SQL depuis un fichier ; une sortie en CSV : `.mode csv`, `.headers on`, `.output out.csv`.",
      "Cuando la tabla no existe, `.import --csv` la crea con la cabecera como nombres de columna (todas TEXT). `.read archivo.sql` ejecuta SQL desde un archivo; salida en CSV: `.mode csv`, `.headers on`, `.output out.csv`.",
    ],
  },
  {
    id: "sq-lite-04",
    q: ["How do you back up a SQLite database that an app is using?", "Comment sauvegarder une base SQLite qu'une application utilise ?", "¿Cómo se hace una copia de una base SQLite que una aplicación está usando?"],
    a: ["`sqlite3 shop.db \".backup copy.db\"`, or `VACUUM INTO 'copy.db'`", "`sqlite3 shop.db \".backup copy.db\"`, ou `VACUUM INTO 'copy.db'`", "`sqlite3 shop.db \".backup copy.db\"`, o `VACUUM INTO 'copy.db'`"],
    w: [["`cp shop.db copy.db`, whatever is happening", "`cp shop.db copy.db`, quoi qu'il se passe", "`cp shop.db copy.db`, pase lo que pase"], ["`pg_dump shop.db`", "`pg_dump shop.db`", "`pg_dump shop.db`"], ["`BACKUP TO 'copy.db'`", "`BACKUP TO 'copy.db'`", "`BACKUP TO 'copy.db'`"]],
    e: [
      "A plain copy during a write, or without its `-wal` file, can be corrupt. `.backup` uses the online backup API, `VACUUM INTO` writes a compact copy; both are consistent. `.dump` writes the whole database as SQL text.",
      "Une simple copie pendant une écriture, ou sans son fichier `-wal`, peut être corrompue. `.backup` utilise l'API de sauvegarde à chaud, `VACUUM INTO` écrit une copie compacte ; les deux sont cohérentes. `.dump` écrit toute la base en texte SQL.",
      "Una copia simple durante una escritura, o sin su archivo `-wal`, puede quedar corrupta. `.backup` usa la API de copia en caliente, `VACUUM INTO` escribe una copia compacta; las dos son coherentes. `.dump` escribe toda la base como texto SQL.",
    ],
  },
  {
    id: "sq-lite-05",
    q: ["Results come out as `Rex|dog|3`. How do you get aligned columns with headers?", "Les résultats sortent comme `Rex|dog|3`. Comment obtenir des colonnes alignées avec en-têtes ?", "Los resultados salen como `Rex|dog|3`. ¿Cómo se obtienen columnas alineadas con cabeceras?"],
    a: ["`.mode box` (or `.mode column` with `.headers on`)", "`.mode box` (ou `.mode column` avec `.headers on`)", "`.mode box` (o `.mode column` con `.headers on`)"],
    w: [["`\\x`", "`\\x`", "`\\x`"], ["`SET FORMAT TABLE`", "`SET FORMAT TABLE`", "`SET FORMAT TABLE`"], ["`.pretty on`", "`.pretty on`", "`.pretty on`"]],
    e: [
      "`list` (with `|`) is the shell's old default; `.mode` also offers `csv`, `json`, `markdown`, `line` (one column per line, like psql's `\\x`). `~/.sqliterc` keeps your settings.",
      "`list` (avec `|`) est l'ancien mode par défaut du shell ; `.mode` propose aussi `csv`, `json`, `markdown`, `line` (une colonne par ligne, comme le `\\x` de psql). `~/.sqliterc` garde vos réglages.",
      "`list` (con `|`) es el antiguo modo por defecto del shell; `.mode` también ofrece `csv`, `json`, `markdown`, `line` (una columna por línea, como el `\\x` de psql). `~/.sqliterc` guarda sus ajustes.",
    ],
  },
];

const sqliteTypes: SqlQuestion[] = [
  {
    id: "sq-litetype-01",
    q: ["A column is declared `age INTEGER`. What does `INSERT INTO pets (age) VALUES ('old')` do in an ordinary SQLite table?", "Une colonne est déclarée `age INTEGER`. Que fait `INSERT INTO pets (age) VALUES ('old')` dans une table SQLite ordinaire ?", "Una columna se declara `age INTEGER`. ¿Qué hace `INSERT INTO pets (age) VALUES ('old')` en una tabla SQLite corriente?"],
    a: ["Stores the text `'old'`: the declared type is only a preference (affinity)", "Stocke le texte `'old'` : le type déclaré n'est qu'une préférence (affinité)", "Guarda el texto `'old'`: el tipo declarado es solo una preferencia (afinidad)"],
    w: [["Refuses it with a type error", "Le refuse avec une erreur de type", "Lo rechaza con un error de tipo"], ["Stores 0", "Stocke 0", "Guarda 0"], ["Stores NULL", "Stocke NULL", "Guarda NULL"]],
    e: [
      "SQLite types belong to values: a column with INTEGER affinity turns `'42'` into 42, but keeps text that is not a number. `CREATE TABLE … STRICT` (3.37+) refuses wrong types, as PostgreSQL does.",
      "En SQLite, les types appartiennent aux valeurs : une colonne d'affinité INTEGER transforme `'42'` en 42, mais garde un texte qui n'est pas un nombre. `CREATE TABLE … STRICT` (3.37+) refuse les mauvais types, comme PostgreSQL.",
      "En SQLite los tipos pertenecen a los valores: una columna con afinidad INTEGER convierte `'42'` en 42, pero conserva un texto que no es un número. `CREATE TABLE … STRICT` (3.37+) rechaza los tipos incorrectos, como PostgreSQL.",
    ],
  },
  {
    id: "sq-litetype-02",
    q: ["How does SQLite store dates?", "Comment SQLite stocke-t-il les dates ?", "¿Cómo guarda SQLite las fechas?"],
    a: ["It has no date type: as ISO text, a Unix time or a Julian day, which its date functions read", "Il n'a pas de type date : en texte ISO, en temps Unix ou en jour julien, que ses fonctions de date savent lire", "No tiene tipo fecha: como texto ISO, tiempo Unix o día juliano, que sus funciones de fecha saben leer"],
    w: [["In a native DATE type, like PostgreSQL", "Dans un type DATE natif, comme PostgreSQL", "En un tipo DATE nativo, como PostgreSQL"], ["Only as Unix time", "Seulement en temps Unix", "Solo como tiempo Unix"], ["It cannot store dates", "Il ne peut pas stocker de dates", "No puede guardar fechas"]],
    e: [
      "`date('now')`, `datetime(ts, 'unixepoch')`, `strftime('%Y', d)`, `date(d, '+1 month')`. ISO text (`'2026-10-25 14:00:00'`) sorts correctly as text; pick one form per column and keep to it.",
      "`date('now')`, `datetime(ts, 'unixepoch')`, `strftime('%Y', d)`, `date(d, '+1 month')`. Le texte ISO (`'2026-10-25 14:00:00'`) se trie bien comme texte ; choisir une forme par colonne et s'y tenir.",
      "`date('now')`, `datetime(ts, 'unixepoch')`, `strftime('%Y', d)`, `date(d, '+1 month')`. El texto ISO (`'2026-10-25 14:00:00'`) se ordena bien como texto; elegir una forma por columna y mantenerla.",
    ],
  },
  {
    id: "sq-litetype-03",
    q: ["What is a column declared `id INTEGER PRIMARY KEY` in SQLite?", "Qu'est-ce qu'une colonne déclarée `id INTEGER PRIMARY KEY` en SQLite ?", "¿Qué es una columna declarada `id INTEGER PRIMARY KEY` en SQLite?"],
    a: ["A name for the table's rowid: filled automatically when left out", "Un nom pour le rowid de la table : rempli automatiquement quand on l'omet", "Un nombre para el rowid de la tabla: se rellena automáticamente si se omite"],
    w: [["An ordinary column that must always be given", "Une colonne ordinaire qu'il faut toujours fournir", "Una columna corriente que siempre hay que dar"], ["The same as `INT PRIMARY KEY`", "La même chose que `INT PRIMARY KEY`", "Lo mismo que `INT PRIMARY KEY`"], ["A text key", "Une clé texte", "Una clave de texto"]],
    e: [
      "Every ordinary table has a hidden 64-bit rowid; exactly `INTEGER PRIMARY KEY` makes the column an alias of it (`INT PRIMARY KEY` does not). A new row gets the largest id plus one; adding `AUTOINCREMENT` only forbids reusing the ids of deleted rows.",
      "Chaque table ordinaire a un rowid caché de 64 bits ; exactement `INTEGER PRIMARY KEY` fait de la colonne un alias (`INT PRIMARY KEY` non). Une nouvelle ligne reçoit le plus grand id plus un ; ajouter `AUTOINCREMENT` interdit seulement de réutiliser les id de lignes supprimées.",
      "Cada tabla corriente tiene un rowid oculto de 64 bits; exactamente `INTEGER PRIMARY KEY` hace de la columna un alias (`INT PRIMARY KEY` no). Una fila nueva recibe el mayor id más uno; añadir `AUTOINCREMENT` solo impide reutilizar los ids de filas borradas.",
    ],
  },
  {
    id: "sq-litetype-04",
    q: ["In SQLite, how is a boolean stored?", "En SQLite, comment stocke-t-on un booléen ?", "En SQLite, ¿cómo se guarda un booleano?"],
    a: ["As the integers 0 and 1; `TRUE` and `FALSE` are just 1 and 0", "Avec les entiers 0 et 1 ; `TRUE` et `FALSE` valent simplement 1 et 0", "Con los enteros 0 y 1; `TRUE` y `FALSE` son simplemente 1 y 0"],
    w: [["In a BOOLEAN type of one bit", "Dans un type BOOLEAN d'un bit", "En un tipo BOOLEAN de un bit"], ["As the text `'true'` and `'false'`", "Avec les textes `'true'` et `'false'`", "Con los textos `'true'` y `'false'`"], ["It cannot be stored", "On ne peut pas le stocker", "No se puede guardar"]],
    e: [
      "A column may be declared `BOOLEAN`, but it holds integers. MySQL does the same (`BOOLEAN` is `TINYINT(1)`); PostgreSQL has a real `boolean` type. `CHECK (done IN (0, 1))` keeps other values out.",
      "Une colonne peut être déclarée `BOOLEAN`, mais elle contient des entiers. MySQL fait pareil (`BOOLEAN` est un `TINYINT(1)`) ; PostgreSQL a un vrai type `boolean`. `CHECK (done IN (0, 1))` écarte les autres valeurs.",
      "Una columna puede declararse `BOOLEAN`, pero contiene enteros. MySQL hace lo mismo (`BOOLEAN` es `TINYINT(1)`); PostgreSQL tiene un tipo `boolean` real. `CHECK (done IN (0, 1))` deja fuera otros valores.",
    ],
  },
  {
    id: "sq-litetype-05",
    q: ["Which change can SQLite's `ALTER TABLE` not make directly?", "Quel changement l'`ALTER TABLE` de SQLite ne sait-il pas faire directement ?", "¿Qué cambio no sabe hacer directamente el `ALTER TABLE` de SQLite?"],
    a: ["Change a column's type or constraints: rebuild the table (create new, copy, drop old, rename)", "Changer le type ou les contraintes d'une colonne : reconstruire la table (créer la nouvelle, copier, supprimer l'ancienne, renommer)", "Cambiar el tipo o las restricciones de una columna: reconstruir la tabla (crear la nueva, copiar, borrar la antigua, renombrar)"],
    w: [["Add a column", "Ajouter une colonne", "Añadir una columna"], ["Rename the table", "Renommer la table", "Renombrar la tabla"], ["Rename a column", "Renommer une colonne", "Renombrar una columna"]],
    e: [
      "SQLite's `ALTER TABLE` adds, renames and, since 3.35, drops columns. Anything else follows the documented twelve-step rebuild, inside a transaction with foreign keys off.",
      "L'`ALTER TABLE` de SQLite ajoute, renomme et, depuis la 3.35, supprime des colonnes. Tout le reste suit la reconstruction en douze étapes documentée, dans une transaction, clés étrangères désactivées.",
      "El `ALTER TABLE` de SQLite añade, renombra y, desde la 3.35, borra columnas. Todo lo demás sigue la reconstrucción documentada en doce pasos, dentro de una transacción y con las claves foráneas desactivadas.",
    ],
  },
];

const sqliteRuntime: SqlQuestion[] = [
  {
    id: "sq-literun-01",
    q: ["Pets point to a deleted owner, though `pets.owner_id` has `REFERENCES owners (id)`. Why, in SQLite?", "Des animaux pointent vers un maître supprimé, alors que `pets.owner_id` a `REFERENCES owners (id)`. Pourquoi, en SQLite ?", "Hay animales que apuntan a un dueño borrado, aunque `pets.owner_id` tiene `REFERENCES owners (id)`. ¿Por qué, en SQLite?"],
    a: ["Foreign keys are checked only after `PRAGMA foreign_keys = ON`, set on each connection", "Les clés étrangères ne sont vérifiées qu'après `PRAGMA foreign_keys = ON`, à régler sur chaque connexion", "Las claves foráneas solo se comprueban tras `PRAGMA foreign_keys = ON`, en cada conexión"],
    w: [["SQLite has no foreign keys", "SQLite n'a pas de clés étrangères", "SQLite no tiene claves foráneas"], ["The owner was deleted in another file", "Le maître a été supprimé dans un autre fichier", "El dueño se borró en otro archivo"], ["It needs an index on owners", "Il faut un index sur owners", "Hace falta un índice sobre owners"]],
    e: [
      "Off by default, for compatibility. Set it whenever the app opens the database. `PRAGMA foreign_key_check` lists the rows that already break their keys.",
      "Désactivé par défaut, pour la compatibilité. Le régler chaque fois que l'application ouvre la base. `PRAGMA foreign_key_check` liste les lignes qui violent déjà leurs clés.",
      "Desactivado por defecto, por compatibilidad. Hay que activarlo cada vez que la aplicación abre la base. `PRAGMA foreign_key_check` lista las filas que ya violan sus claves.",
    ],
  },
  {
    id: "sq-literun-02",
    q: ["Two processes write to one SQLite file and one gets `database is locked`. What is going on?", "Deux processus écrivent dans un même fichier SQLite et l'un reçoit `database is locked`. Que se passe-t-il ?", "Dos procesos escriben en un mismo archivo SQLite y uno recibe `database is locked`. ¿Qué pasa?"],
    a: ["Only one writer at a time: set `PRAGMA busy_timeout` so it waits, keep write transactions short", "Un seul écrivain à la fois : régler `PRAGMA busy_timeout` pour qu'il attende, garder les transactions d'écriture courtes", "Un solo escritor a la vez: ajustar `PRAGMA busy_timeout` para que espere, mantener cortas las transacciones de escritura"],
    w: [["The file is corrupt", "Le fichier est corrompu", "El archivo está corrupto"], ["SQLite allows one process per file", "SQLite permet un processus par fichier", "SQLite permite un proceso por archivo"], ["The disk is full", "Le disque est plein", "El disco está lleno"]],
    e: [
      "Readers are many, writers one; without a timeout the second writer fails at once. `busy_timeout = 5000` waits up to 5 s. `BEGIN IMMEDIATE` takes the write lock at the start instead of failing half-way.",
      "Les lecteurs sont nombreux, l'écrivain unique ; sans délai, le second écrivain échoue tout de suite. `busy_timeout = 5000` attend jusqu'à 5 s. `BEGIN IMMEDIATE` prend le verrou d'écriture dès le début au lieu d'échouer à mi-chemin.",
      "Los lectores son muchos, el escritor uno; sin tiempo de espera el segundo escritor falla de inmediato. `busy_timeout = 5000` espera hasta 5 s. `BEGIN IMMEDIATE` toma el bloqueo de escritura al principio en vez de fallar a mitad.",
    ],
  },
  {
    id: "sq-literun-03",
    q: ["What does `PRAGMA journal_mode = WAL` change?", "Que change `PRAGMA journal_mode = WAL` ?", "¿Qué cambia `PRAGMA journal_mode = WAL`?"],
    a: ["Readers no longer wait for the writer, and writes are usually faster", "Les lecteurs n'attendent plus l'écrivain, et les écritures vont souvent plus vite", "Los lectores ya no esperan al escritor, y las escrituras suelen ir más rápido"],
    w: [["Several writers at once", "Plusieurs écrivains en même temps", "Varios escritores a la vez"], ["The database is kept in memory", "La base est gardée en mémoire", "La base se guarda en memoria"], ["Changes are no longer durable", "Les changements ne sont plus durables", "Los cambios ya no son duraderos"]],
    e: [
      "Changes go to a `-wal` file and are copied back at checkpoints; readers keep their snapshot. It stays set in the file. Still one writer. Not for databases on network filesystems.",
      "Les changements vont dans un fichier `-wal` et sont recopiés lors des checkpoints ; les lecteurs gardent leur instantané. Le réglage reste dans le fichier. Toujours un seul écrivain. Pas pour des bases sur un système de fichiers réseau.",
      "Los cambios van a un archivo `-wal` y se copian de vuelta en los checkpoints; los lectores conservan su instantánea. El ajuste queda en el archivo. Sigue habiendo un solo escritor. No para bases en sistemas de archivos de red.",
    ],
  },
  {
    id: "sq-literun-04",
    q: ["Inserting 100 000 rows one statement at a time in SQLite takes minutes. What makes it fast?", "Insérer 100 000 lignes une instruction à la fois en SQLite prend des minutes. Qu'est-ce qui accélère ?", "Insertar 100 000 filas una sentencia a la vez en SQLite tarda minutos. ¿Qué lo acelera?"],
    a: ["One transaction around them all: `BEGIN;` … `COMMIT;`", "Une seule transaction autour de toutes : `BEGIN;` … `COMMIT;`", "Una sola transacción alrededor de todas: `BEGIN;` … `COMMIT;`"],
    w: [["An index on every column", "Un index sur chaque colonne", "Un índice sobre cada columna"], ["`PRAGMA foreign_keys = ON`", "`PRAGMA foreign_keys = ON`", "`PRAGMA foreign_keys = ON`"], ["`VACUUM` before each insert", "`VACUUM` avant chaque insertion", "`VACUUM` antes de cada inserción"]],
    e: [
      "Each statement outside a transaction is its own transaction, synced to disk. Grouped, the disk is synced once. A prepared statement reused for every row helps too.",
      "Chaque instruction hors transaction est sa propre transaction, synchronisée sur disque. Regroupées, le disque n'est synchronisé qu'une fois. Une instruction préparée réutilisée pour chaque ligne aide aussi.",
      "Cada sentencia fuera de una transacción es su propia transacción, sincronizada con el disco. Agrupadas, el disco se sincroniza una sola vez. Una sentencia preparada reutilizada para cada fila también ayuda.",
    ],
  },
  {
    id: "sq-literun-05",
    q: ["When is SQLite a good choice over a database server?", "Quand SQLite est-il un bon choix plutôt qu'un serveur de base de données ?", "¿Cuándo es SQLite una buena opción frente a un servidor de base de datos?"],
    a: ["Data kept with one app or device: phones, desktop apps, tests, small sites with few writers", "Des données liées à une application ou un appareil : téléphones, applications de bureau, tests, petits sites avec peu d'écrivains", "Datos ligados a una aplicación o dispositivo: móviles, aplicaciones de escritorio, pruebas, sitios pequeños con pocos escritores"],
    w: [["Never: it is only a toy", "Jamais : ce n'est qu'un jouet", "Nunca: es solo un juguete"], ["Many servers writing to one database over the network", "Plusieurs serveurs écrivant dans une base par le réseau", "Varios servidores escribiendo en una base por la red"], ["Only for read-only data", "Seulement pour des données en lecture seule", "Solo para datos de solo lectura"]],
    e: [
      "SQLite is embedded in the program, with no setup, users or network. It is in every phone and browser. Several machines, many concurrent writers, or fine-grained rights call for PostgreSQL or MySQL.",
      "SQLite est intégré au programme, sans installation, utilisateurs ni réseau. Il est dans chaque téléphone et navigateur. Plusieurs machines, beaucoup d'écrivains simultanés, ou des droits fins demandent PostgreSQL ou MySQL.",
      "SQLite va integrado en el programa, sin instalación, usuarios ni red. Está en cada móvil y navegador. Varias máquinas, muchos escritores simultáneos o derechos finos requieren PostgreSQL o MySQL.",
    ],
  },
];

// ------------------------------------------------------------------- MySQL

const mysqlClient: SqlQuestion[] = [
  {
    id: "sq-my-01",
    q: ["In the `mysql` client, how do you list the databases, pick `shop` and list its tables?", "Dans le client `mysql`, comment lister les bases, choisir `shop` et lister ses tables ?", "En el cliente `mysql`, ¿cómo se listan las bases, se elige `shop` y se listan sus tablas?"],
    a: ["`SHOW DATABASES;`, `USE shop;`, `SHOW TABLES;`", "`SHOW DATABASES;`, `USE shop;`, `SHOW TABLES;`", "`SHOW DATABASES;`, `USE shop;`, `SHOW TABLES;`"],
    w: [["`\\l`, `\\c shop`, `\\dt`", "`\\l`, `\\c shop`, `\\dt`", "`\\l`, `\\c shop`, `\\dt`"], ["`.databases`, `.open shop`, `.tables`", "`.databases`, `.open shop`, `.tables`", "`.databases`, `.open shop`, `.tables`"], ["`LIST DATABASES;`, `OPEN shop;`, `LIST TABLES;`", "`LIST DATABASES;`, `OPEN shop;`, `LIST TABLES;`", "`LIST DATABASES;`, `OPEN shop;`, `LIST TABLES;`"]],
    e: [
      "MySQL's `SHOW` statements are SQL, so they end with `;`. In MySQL a database and a schema are the same thing, and one connection can query several: `SELECT * FROM shop.pets`.",
      "Les instructions `SHOW` de MySQL sont du SQL : elles finissent par `;`. En MySQL, base et schéma sont la même chose, et une connexion peut en interroger plusieurs : `SELECT * FROM shop.pets`.",
      "Las sentencias `SHOW` de MySQL son SQL: terminan en `;`. En MySQL una base y un esquema son lo mismo, y una conexión puede consultar varias: `SELECT * FROM shop.pets`.",
    ],
  },
  {
    id: "sq-my-02",
    q: ["How do you see a MySQL table's columns, and the exact statement that would recreate it?", "Comment voir les colonnes d'une table MySQL, et l'instruction exacte qui la recréerait ?", "¿Cómo se ven las columnas de una tabla MySQL, y la sentencia exacta que la recrearía?"],
    a: ["`DESCRIBE pets;`, then `SHOW CREATE TABLE pets;`", "`DESCRIBE pets;`, puis `SHOW CREATE TABLE pets;`", "`DESCRIBE pets;`, y luego `SHOW CREATE TABLE pets;`"],
    w: [["`\\d pets`, then `\\d+ pets`", "`\\d pets`, puis `\\d+ pets`", "`\\d pets`, y luego `\\d+ pets`"], ["`.schema pets`", "`.schema pets`", "`.schema pets`"], ["`SELECT COLUMNS FROM pets;`", "`SELECT COLUMNS FROM pets;`", "`SELECT COLUMNS FROM pets;`"]],
    e: [
      "`DESCRIBE` (or `SHOW COLUMNS FROM pets`) gives one line per column; `SHOW CREATE TABLE` shows indexes, engine and character set too. The standard way, in every server engine: `information_schema.columns`.",
      "`DESCRIBE` (ou `SHOW COLUMNS FROM pets`) donne une ligne par colonne ; `SHOW CREATE TABLE` montre aussi index, moteur et jeu de caractères. La façon standard, dans tout moteur serveur : `information_schema.columns`.",
      "`DESCRIBE` (o `SHOW COLUMNS FROM pets`) da una línea por columna; `SHOW CREATE TABLE` muestra también índices, motor y juego de caracteres. La forma estándar, en cualquier motor servidor: `information_schema.columns`.",
    ],
  },
  {
    id: "sq-my-03",
    q: ["What does ending a query with `\\G` instead of `;` do in the `mysql` client?", "Que fait la fin d'une requête par `\\G` au lieu de `;` dans le client `mysql` ?", "¿Qué hace terminar una consulta con `\\G` en lugar de `;` en el cliente `mysql`?"],
    a: ["Runs it and shows each row vertically, one column per line", "L'exécute et montre chaque ligne verticalement, une colonne par ligne", "La ejecuta y muestra cada fila en vertical, una columna por línea"],
    w: [["Runs it in the background", "L'exécute en arrière-plan", "La ejecuta en segundo plano"], ["Groups the rows", "Regroupe les lignes", "Agrupa las filas"], ["Cancels it", "L'annule", "La cancela"]],
    e: [
      "The same idea as psql's `\\x`, for wide rows. `\\c` cancels the line being typed; Ctrl+C stops a running query (in recent clients).",
      "La même idée que le `\\x` de psql, pour les lignes larges. `\\c` annule la ligne en cours de saisie ; Ctrl+C arrête une requête en cours (dans les clients récents).",
      "La misma idea que el `\\x` de psql, para filas anchas. `\\c` cancela la línea que se está escribiendo; Ctrl+C detiene una consulta en curso (en los clientes recientes).",
    ],
  },
  {
    id: "sq-my-04",
    q: ["How do you save the database `shop` with MySQL's tools, without blocking writers on InnoDB tables?", "Comment sauvegarder la base `shop` avec les outils MySQL, sans bloquer les écritures sur des tables InnoDB ?", "¿Cómo se guarda la base `shop` con las herramientas de MySQL, sin bloquear las escrituras en tablas InnoDB?"],
    a: ["`mysqldump --single-transaction shop > shop.sql`", "`mysqldump --single-transaction shop > shop.sql`", "`mysqldump --single-transaction shop > shop.sql`"],
    w: [["`pg_dump shop > shop.sql`", "`pg_dump shop > shop.sql`", "`pg_dump shop > shop.sql`"], ["`mysqldump --lock-all-tables shop`", "`mysqldump --lock-all-tables shop`", "`mysqldump --lock-all-tables shop`"], ["`SELECT * INTO OUTFILE` for each table", "`SELECT * INTO OUTFILE` pour chaque table", "`SELECT * INTO OUTFILE` para cada tabla"]],
    e: [
      "`--single-transaction` reads a consistent snapshot in one transaction. The dump is SQL: restore with `mysql shop < shop.sql`. Add `--routines --triggers` to keep them. Large databases use physical backups (Percona XtraBackup, `mysqlbackup`).",
      "`--single-transaction` lit un instantané cohérent dans une transaction. Le dump est du SQL : restaurer avec `mysql shop < shop.sql`. Ajouter `--routines --triggers` pour les garder. Les grandes bases utilisent des sauvegardes physiques (Percona XtraBackup, `mysqlbackup`).",
      "`--single-transaction` lee una instantánea coherente en una transacción. El volcado es SQL: se restaura con `mysql shop < shop.sql`. Añadir `--routines --triggers` para conservarlos. Las bases grandes usan copias físicas (Percona XtraBackup, `mysqlbackup`).",
    ],
  },
  {
    id: "sq-my-05",
    q: ["`CREATE USER 'app'@'localhost'`: what is `'localhost'`?", "`CREATE USER 'app'@'localhost'` : qu'est-ce que `'localhost'` ?", "`CREATE USER 'app'@'localhost'`: ¿qué es `'localhost'`?"],
    a: ["Where the user may connect from: `'app'@'%'` is a different account, from anywhere", "D'où l'utilisateur peut se connecter : `'app'@'%'` est un autre compte, de partout", "Desde dónde puede conectarse el usuario: `'app'@'%'` es otra cuenta, desde cualquier sitio"],
    w: [["The server where the database lives", "Le serveur où vit la base", "El servidor donde vive la base"], ["The user's default database", "La base par défaut de l'utilisateur", "La base por defecto del usuario"], ["A comment", "Un commentaire", "Un comentario"]],
    e: [
      "A MySQL account is a user and a host pattern; rights are granted to that pair: `GRANT SELECT, INSERT ON shop.* TO 'app'@'10.0.%'`. A user that works locally but not from another machine is often a missing host.",
      "Un compte MySQL est un utilisateur et un motif d'hôte ; les droits se donnent à ce couple : `GRANT SELECT, INSERT ON shop.* TO 'app'@'10.0.%'`. Un utilisateur qui marche en local mais pas depuis une autre machine est souvent un hôte manquant.",
      "Una cuenta MySQL es un usuario y un patrón de servidor; los derechos se dan a ese par: `GRANT SELECT, INSERT ON shop.* TO 'app'@'10.0.%'`. Un usuario que funciona en local pero no desde otra máquina suele ser un servidor que falta.",
    ],
  },
];

const mysqlSpecifics: SqlQuestion[] = [
  {
    id: "sq-myspec-01",
    q: ["Which character set stores every Unicode character, emoji included, in MySQL?", "Quel jeu de caractères stocke tous les caractères Unicode, emoji compris, en MySQL ?", "¿Qué juego de caracteres guarda todos los caracteres Unicode, emoji incluidos, en MySQL?"],
    a: ["`utf8mb4`", "`utf8mb4`", "`utf8mb4`"],
    w: [["`utf8`, in MySQL an alias of `utf8mb3`", "`utf8`, en MySQL un alias de `utf8mb3`", "`utf8`, en MySQL un alias de `utf8mb3`"], ["`latin1`", "`latin1`", "`latin1`"], ["`ascii`", "`ascii`", "`ascii`"]],
    e: [
      "MySQL's old `utf8` holds at most 3 bytes per character, so 😀 (4 bytes) fails or is cut. `utf8mb4` is the default since MySQL 8.0; old tables can still be `utf8mb3` or `latin1`: check with `SHOW CREATE TABLE`.",
      "L'ancien `utf8` de MySQL tient au plus 3 octets par caractère : 😀 (4 octets) échoue ou est coupé. `utf8mb4` est le défaut depuis MySQL 8.0 ; d'anciennes tables peuvent encore être en `utf8mb3` ou `latin1` : vérifier avec `SHOW CREATE TABLE`.",
      "El antiguo `utf8` de MySQL guarda como mucho 3 bytes por carácter, así que 😀 (4 bytes) falla o se corta. `utf8mb4` es el defecto desde MySQL 8.0; tablas antiguas pueden seguir en `utf8mb3` o `latin1`: comprobarlo con `SHOW CREATE TABLE`.",
    ],
  },
  {
    id: "sq-myspec-02",
    q: ["How do you name a column called `order` (a reserved word) in MySQL?", "Comment nommer une colonne appelée `order` (un mot réservé) en MySQL ?", "¿Cómo se nombra una columna llamada `order` (palabra reservada) en MySQL?"],
    a: ["Between backticks, the grave-accent quote, on each side of the name", "Entre accents graves, l'apostrophe inversée, de chaque côté du nom", "Entre acentos graves, la comilla invertida, a cada lado del nombre"],
    w: [["Between single quotes: `SELECT 'order' FROM sales`", "Entre apostrophes : `SELECT 'order' FROM sales`", "Entre comillas simples: `SELECT 'order' FROM sales`"], ["Between brackets: `SELECT [order] FROM sales`", "Entre crochets : `SELECT [order] FROM sales`", "Entre corchetes: `SELECT [order] FROM sales`"], ["It cannot be used", "On ne peut pas l'utiliser", "No se puede usar"]],
    e: [
      "Single quotes make a string, so `'order'` returns the word on every row. PostgreSQL and SQLite use double quotes (\"order\"), SQL Server brackets. Easier still: avoid reserved words as names.",
      "Les apostrophes font une chaîne : `'order'` renvoie le mot sur chaque ligne. PostgreSQL et SQLite utilisent des guillemets doubles (\"order\"), SQL Server des crochets. Plus simple encore : éviter les mots réservés comme noms.",
      "Las comillas simples forman una cadena: `'order'` devuelve la palabra en cada fila. PostgreSQL y SQLite usan comillas dobles (\"order\"), SQL Server corchetes. Más sencillo aún: evitar palabras reservadas como nombres.",
    ],
  },
  {
    id: "sq-myspec-03",
    q: ["What does `LIMIT 20, 10` return in MySQL?", "Que renvoie `LIMIT 20, 10` en MySQL ?", "¿Qué devuelve `LIMIT 20, 10` en MySQL?"],
    a: ["10 rows, after skipping 20: `LIMIT 10 OFFSET 20`", "10 lignes, après en avoir sauté 20 : `LIMIT 10 OFFSET 20`", "10 filas, tras saltar 20: `LIMIT 10 OFFSET 20`"],
    w: [["20 rows, after skipping 10", "20 lignes, après en avoir sauté 10", "20 filas, tras saltar 10"], ["Rows 20 to 10, backwards", "Les lignes 20 à 10, à l'envers", "Las filas 20 a 10, al revés"], ["30 rows", "30 lignes", "30 filas"]],
    e: [
      "In the comma form the offset comes first; SQLite reads it the same way. PostgreSQL only accepts `LIMIT 10 OFFSET 20`, which is the clearer form everywhere.",
      "Dans la forme avec virgule, le décalage vient en premier ; SQLite la lit de la même façon. PostgreSQL n'accepte que `LIMIT 10 OFFSET 20`, la forme la plus claire partout.",
      "En la forma con coma el desplazamiento va primero; SQLite la lee igual. PostgreSQL solo acepta `LIMIT 10 OFFSET 20`, la forma más clara en todas partes.",
    ],
  },
  {
    id: "sq-myspec-04",
    q: ["Which MySQL storage engine supports transactions and foreign keys?", "Quel moteur de stockage MySQL gère les transactions et les clés étrangères ?", "¿Qué motor de almacenamiento de MySQL admite transacciones y claves foráneas?"],
    a: ["InnoDB, the default since MySQL 5.5", "InnoDB, le défaut depuis MySQL 5.5", "InnoDB, el predeterminado desde MySQL 5.5"],
    w: [["MyISAM", "MyISAM", "MyISAM"], ["MEMORY", "MEMORY", "MEMORY"], ["CSV", "CSV", "CSV"]],
    e: [
      "Old MyISAM tables ignore `BEGIN`/`ROLLBACK` and foreign keys, and lock whole tables. `SHOW TABLE STATUS` shows each table's engine; `ALTER TABLE t ENGINE = InnoDB` converts one.",
      "Les vieilles tables MyISAM ignorent `BEGIN`/`ROLLBACK` et les clés étrangères, et verrouillent des tables entières. `SHOW TABLE STATUS` montre le moteur de chaque table ; `ALTER TABLE t ENGINE = InnoDB` en convertit une.",
      "Las antiguas tablas MyISAM ignoran `BEGIN`/`ROLLBACK` y las claves foráneas, y bloquean tablas enteras. `SHOW TABLE STATUS` muestra el motor de cada tabla; `ALTER TABLE t ENGINE = InnoDB` convierte una.",
    ],
  },
  {
    id: "sq-myspec-05",
    q: ["What is MySQL's upsert?", "Quel est l'upsert de MySQL ?", "¿Cuál es el upsert de MySQL?"],
    a: ["`INSERT … ON DUPLICATE KEY UPDATE name = VALUES(name)`", "`INSERT … ON DUPLICATE KEY UPDATE name = VALUES(name)`", "`INSERT … ON DUPLICATE KEY UPDATE name = VALUES(name)`"],
    w: [["`INSERT … ON CONFLICT DO UPDATE`", "`INSERT … ON CONFLICT DO UPDATE`", "`INSERT … ON CONFLICT DO UPDATE`"], ["`MERGE INTO … USING …`", "`MERGE INTO … USING …`", "`MERGE INTO … USING …`"], ["`UPSERT INTO …`", "`UPSERT INTO …`", "`UPSERT INTO …`"]],
    e: [
      "It fires on any unique or primary key clash. MySQL 8.0.19+ prefers an alias: `INSERT … AS new ON DUPLICATE KEY UPDATE name = new.name`. `REPLACE INTO` deletes then inserts, which fires deletes and changes ids.",
      "Il se déclenche sur tout conflit de clé unique ou primaire. MySQL 8.0.19+ préfère un alias : `INSERT … AS new ON DUPLICATE KEY UPDATE name = new.name`. `REPLACE INTO` supprime puis insère, ce qui déclenche des suppressions et change les id.",
      "Se activa ante cualquier choque de clave única o primaria. MySQL 8.0.19+ prefiere un alias: `INSERT … AS new ON DUPLICATE KEY UPDATE name = new.name`. `REPLACE INTO` borra y luego inserta, lo que dispara borrados y cambia los ids.",
    ],
  },
  {
    id: "sq-myspec-06",
    q: ["MySQL and MariaDB: how do they relate?", "MySQL et MariaDB : quel lien ?", "MySQL y MariaDB: ¿qué relación tienen?"],
    a: ["MariaDB is a fork of MySQL: same client and most SQL, but they have drifted apart", "MariaDB est un fork de MySQL : même client et presque le même SQL, mais ils ont divergé", "MariaDB es una bifurcación de MySQL: mismo cliente y casi el mismo SQL, pero se han ido separando"],
    w: [["They are two names for one product", "Ce sont deux noms pour un même produit", "Son dos nombres para un mismo producto"], ["MariaDB is a PostgreSQL extension", "MariaDB est une extension de PostgreSQL", "MariaDB es una extensión de PostgreSQL"], ["MariaDB is MySQL's paid version", "MariaDB est la version payante de MySQL", "MariaDB es la versión de pago de MySQL"]],
    e: [
      "Forked in 2009 when Oracle bought MySQL; Debian ships MariaDB as `default-mysql-client`. Day-to-day SQL is shared; JSON, replication and newer features differ, so check the docs of the server you have (`SELECT VERSION()`).",
      "Forké en 2009 quand Oracle a racheté MySQL ; Debian fournit MariaDB comme `default-mysql-client`. Le SQL courant est commun ; JSON, réplication et fonctions récentes diffèrent : lire la doc du serveur que vous avez (`SELECT VERSION()`).",
      "Bifurcado en 2009 cuando Oracle compró MySQL; Debian distribuye MariaDB como `default-mysql-client`. El SQL corriente es común; JSON, replicación y funciones recientes difieren: consultar la documentación del servidor que tenga (`SELECT VERSION()`).",
    ],
  },
];

export const postgres = { psql: withInstall(PSQL, psql), pgFeatures: withInstall(PSQL, pgFeatures), pgAdmin: withInstall(PSQL, pgAdmin) };
export const sqlite = { sqliteShell: withInstall(SQLITE, sqliteShell), sqliteTypes: withInstall(SQLITE, sqliteTypes), sqliteRuntime: withInstall(SQLITE, sqliteRuntime) };
export const mysql = { mysqlClient: withInstall(MYSQL, mysqlClient), mysqlSpecifics: withInstall(MYSQL, mysqlSpecifics) };
