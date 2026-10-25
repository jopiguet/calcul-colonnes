/**
 * Good practice around SQL, whatever the engine: designing tables, keeping
 * queries safe from injection, making them fast, and running a database
 * (backups, migrations, connections).
 */
import type { LinuxQuestion as SqlQuestion } from "../linux/types";

const design: SqlQuestion[] = [
  {
    id: "sq-design-01",
    q: ["An `orders` table repeats the customer's name and address on every order. What is the risk?", "Une table `orders` répète le nom et l'adresse du client sur chaque commande. Quel est le risque ?", "Una tabla `orders` repite el nombre y la dirección del cliente en cada pedido. ¿Cuál es el riesgo?"],
    a: ["A change of address must be made on every row, and a missed one leaves two addresses", "Un changement d'adresse doit se faire sur chaque ligne, et un oubli laisse deux adresses", "Un cambio de dirección debe hacerse en cada fila, y un olvido deja dos direcciones"],
    w: [["None: repeating data makes it safer", "Aucun : répéter les données les protège", "Ninguno: repetir los datos los protege"], ["Queries cannot read it", "Les requêtes ne peuvent pas le lire", "Las consultas no pueden leerlo"], ["Only the disk space", "Seulement la place sur disque", "Solo el espacio en disco"]],
    e: [
      "Normalising stores each fact once: a `customers` table, and `orders.customer_id` pointing to it. A deliberate copy is fine when it records history, such as the address an order was actually shipped to.",
      "Normaliser garde chaque fait une seule fois : une table `customers`, et `orders.customer_id` qui pointe vers elle. Une copie voulue va bien quand elle garde l'historique, comme l'adresse où une commande a vraiment été livrée.",
      "Normalizar guarda cada hecho una sola vez: una tabla `customers`, y `orders.customer_id` que apunta a ella. Una copia deliberada está bien cuando guarda historia, como la dirección a la que se envió realmente un pedido.",
    ],
  },
  {
    id: "sq-design-02",
    q: ["Why not use the email address as a users table's primary key?", "Pourquoi ne pas prendre l'adresse e-mail comme clé primaire d'une table d'utilisateurs ?", "¿Por qué no usar el correo como clave primaria de una tabla de usuarios?"],
    a: ["People change their email: every table pointing to it would have to change too", "Les gens changent d'e-mail : chaque table qui y renvoie devrait changer aussi", "La gente cambia de correo: cada tabla que apunta a él tendría que cambiar también"],
    w: [["Text cannot be a primary key", "Un texte ne peut pas être une clé primaire", "Un texto no puede ser clave primaria"], ["Emails are never unique", "Les e-mails ne sont jamais uniques", "Los correos nunca son únicos"], ["It is slower to type", "C'est plus long à taper", "Es más largo de escribir"]],
    e: [
      "A surrogate key (an identity number, or a UUID) never changes, and the email gets its own `UNIQUE` constraint. A natural key suits what never changes, such as an ISO country code.",
      "Une clé de substitution (un numéro d'identité, ou un UUID) ne change jamais, et l'e-mail reçoit sa propre contrainte `UNIQUE`. Une clé naturelle convient à ce qui ne change pas, comme un code pays ISO.",
      "Una clave sustituta (un número de identidad, o un UUID) no cambia nunca, y el correo recibe su propia restricción `UNIQUE`. Una clave natural sirve para lo que no cambia, como un código de país ISO.",
    ],
  },
  {
    id: "sq-design-03",
    q: ["Where should a rule such as \"a quantity is never negative\" live?", "Où doit vivre une règle comme « une quantité n'est jamais négative » ?", "¿Dónde debe vivir una regla como «una cantidad nunca es negativa»?"],
    a: ["In the table too: `CHECK (qty >= 0)`, so no program can break it", "Aussi dans la table : `CHECK (qty >= 0)`, pour qu'aucun programme ne puisse l'enfreindre", "También en la tabla: `CHECK (qty >= 0)`, para que ningún programa pueda saltársela"],
    w: [["Only in the web form", "Seulement dans le formulaire web", "Solo en el formulario web"], ["In a comment on the column", "Dans un commentaire sur la colonne", "En un comentario sobre la columna"], ["Nowhere: the database takes whatever it is sent", "Nulle part : la base prend ce qu'on lui envoie", "En ningún sitio: la base acepta lo que le envíen"]],
    e: [
      "Scripts, imports and other apps bypass the form. `NOT NULL`, `UNIQUE`, `CHECK` and foreign keys are checked on every write. MySQL enforces `CHECK` only since 8.0.16.",
      "Scripts, imports et autres applications contournent le formulaire. `NOT NULL`, `UNIQUE`, `CHECK` et les clés étrangères sont vérifiés à chaque écriture. MySQL n'applique `CHECK` que depuis la 8.0.16.",
      "Los scripts, las importaciones y otras aplicaciones se saltan el formulario. `NOT NULL`, `UNIQUE`, `CHECK` y las claves foráneas se comprueban en cada escritura. MySQL solo aplica `CHECK` desde la 8.0.16.",
    ],
  },
  {
    id: "sq-design-04",
    q: ["How should times of events be stored for users in several time zones?", "Comment stocker l'heure d'événements pour des utilisateurs de plusieurs fuseaux horaires ?", "¿Cómo se guarda la hora de eventos para usuarios de varias zonas horarias?"],
    a: ["As instants in UTC (`timestamptz` in PostgreSQL), converted to local time for display", "Comme des instants en UTC (`timestamptz` en PostgreSQL), convertis en heure locale à l'affichage", "Como instantes en UTC (`timestamptz` en PostgreSQL), convertidos a hora local al mostrarlos"],
    w: [["In each user's local time, without the zone", "Dans l'heure locale de chaque utilisateur, sans le fuseau", "En la hora local de cada usuario, sin la zona"], ["As text such as `'25/10 14h'`", "En texte comme `'25/10 14h'`", "Como texto del tipo `'25/10 14h'`"], ["In the server's local time", "Dans l'heure locale du serveur", "En la hora local del servidor"]],
    e: [
      "A local time without its zone is ambiguous, and an hour repeats when clocks go back. Keep the user's zone (`'Europe/Zurich'`) separately when local rules matter, for a meeting at 9:00 their time.",
      "Une heure locale sans fuseau est ambiguë, et une heure se répète au passage à l'heure d'hiver. Garder le fuseau de l'utilisateur (`'Europe/Zurich'`) à part quand les règles locales comptent, pour une réunion à 9 h chez lui.",
      "Una hora local sin zona es ambigua, y una hora se repite al cambiar al horario de invierno. Guardar aparte la zona del usuario (`'Europe/Zurich'`) cuando importan las reglas locales, para una reunión a las 9:00 en su hora.",
    ],
  },
  {
    id: "sq-design-05",
    q: ["Instead of deleting customers, an app sets `deleted_at`. What must every query then do?", "Au lieu de supprimer les clients, une application remplit `deleted_at`. Que doit alors faire chaque requête ?", "En vez de borrar clientes, una aplicación rellena `deleted_at`. ¿Qué debe hacer entonces cada consulta?"],
    a: ["Add `WHERE deleted_at IS NULL`, or read through a view that does", "Ajouter `WHERE deleted_at IS NULL`, ou lire par une vue qui le fait", "Añadir `WHERE deleted_at IS NULL`, o leer a través de una vista que lo haga"],
    w: [["Nothing: the rows are hidden by themselves", "Rien : les lignes se cachent d'elles-mêmes", "Nada: las filas se ocultan solas"], ["Run `VACUUM` first", "Lancer d'abord `VACUUM`", "Ejecutar antes `VACUUM`"], ["Sort by `deleted_at`", "Trier par `deleted_at`", "Ordenar por `deleted_at`"]],
    e: [
      "A soft delete keeps history and allows undo, at a cost: a forgotten filter shows deleted rows, and unique emails need a partial index (`WHERE deleted_at IS NULL`). Personal data may still have to be erased for real.",
      "Une suppression douce garde l'historique et permet d'annuler, à un prix : un filtre oublié montre des lignes supprimées, et des e-mails uniques demandent un index partiel (`WHERE deleted_at IS NULL`). Les données personnelles peuvent quand même devoir être vraiment effacées.",
      "Un borrado lógico guarda la historia y permite deshacer, con un coste: un filtro olvidado muestra filas borradas, y los correos únicos necesitan un índice parcial (`WHERE deleted_at IS NULL`). Los datos personales pueden tener que borrarse de verdad igualmente.",
    ],
  },
];

const safety: SqlQuestion[] = [
  {
    id: "sq-safe-01",
    q: ["A program builds `\"SELECT * FROM users WHERE name = '\" + name + \"'\"` from a form. What does the name `x' OR '1'='1` do?", "Un programme construit `\"SELECT * FROM users WHERE name = '\" + name + \"'\"` depuis un formulaire. Que fait le nom `x' OR '1'='1` ?", "Un programa construye `\"SELECT * FROM users WHERE name = '\" + name + \"'\"` desde un formulario. ¿Qué hace el nombre `x' OR '1'='1`?"],
    a: ["It changes the query, which now returns every user: SQL injection", "Il change la requête, qui renvoie maintenant tous les utilisateurs : une injection SQL", "Cambia la consulta, que ahora devuelve todos los usuarios: una inyección SQL"],
    w: [["Nothing: it finds no user with that name", "Rien : il ne trouve aucun utilisateur de ce nom", "Nada: no encuentra ningún usuario con ese nombre"], ["A syntax error, so it is harmless", "Une erreur de syntaxe, donc sans danger", "Un error de sintaxis, así que es inofensivo"], ["The database refuses quotes in names", "La base refuse les apostrophes dans les noms", "La base rechaza las comillas en los nombres"]],
    e: [
      "Text from outside became SQL. The same trick can read other tables or delete data. The fix is not escaping by hand but parameters: the query and the values travel separately.",
      "Un texte venu de l'extérieur est devenu du SQL. La même astuce peut lire d'autres tables ou effacer des données. Le remède n'est pas d'échapper à la main mais les paramètres : la requête et les valeurs voyagent séparément.",
      "Un texto de fuera se convirtió en SQL. El mismo truco puede leer otras tablas o borrar datos. El remedio no es escapar a mano sino los parámetros: la consulta y los valores viajan por separado.",
    ],
  },
  {
    id: "sq-safe-02",
    q: ["Which placeholder marks a parameter in a query?", "Quel marqueur indique un paramètre dans une requête ?", "¿Qué marcador indica un parámetro en una consulta?"],
    a: ["It depends on the driver: `$1` (PostgreSQL), `?` (SQLite, MySQL), `%s` (Python's psycopg and MySQL drivers)", "Ça dépend du pilote : `$1` (PostgreSQL), `?` (SQLite, MySQL), `%s` (les pilotes Python psycopg et MySQL)", "Depende del controlador: `$1` (PostgreSQL), `?` (SQLite, MySQL), `%s` (los controladores Python psycopg y MySQL)"],
    w: [["`{name}`, filled by string formatting", "`{name}`, rempli par formatage de chaîne", "`{name}`, rellenado con formato de cadena"], ["`'name'` in quotes", "`'name'` entre apostrophes", "`'name'` entre comillas"], ["`@@name`", "`@@name`", "`@@name`"]],
    e: [
      "The placeholder is written without quotes and the value passed beside the query: `db.query(\"SELECT * FROM users WHERE name = $1\", [name])`. psycopg's `%s` is not Python's `%` operator: the driver sends the value safely.",
      "Le marqueur s'écrit sans apostrophes et la valeur passe à côté de la requête : `db.query(\"SELECT * FROM users WHERE name = $1\", [name])`. Le `%s` de psycopg n'est pas l'opérateur `%` de Python : le pilote envoie la valeur sans danger.",
      "El marcador se escribe sin comillas y el valor se pasa junto a la consulta: `db.query(\"SELECT * FROM users WHERE name = $1\", [name])`. El `%s` de psycopg no es el operador `%` de Python: el controlador envía el valor de forma segura.",
    ],
  },
  {
    id: "sq-safe-03",
    q: ["A user may pick the sort column, `name` or `age`. Can it be a parameter: `ORDER BY $1`?", "Un utilisateur peut choisir la colonne de tri, `name` ou `age`. Peut-on en faire un paramètre : `ORDER BY $1` ?", "Un usuario puede elegir la columna de orden, `name` o `age`. ¿Puede ser un parámetro: `ORDER BY $1`?"],
    a: ["No: parameters are values, not names; pick the name from a fixed list in the program", "Non : les paramètres sont des valeurs, pas des noms ; choisir le nom dans une liste fixe du programme", "No: los parámetros son valores, no nombres; elegir el nombre de una lista fija en el programa"],
    w: [["Yes, it sorts by the column named", "Oui, il trie par la colonne nommée", "Sí, ordena por la columna nombrada"], ["Yes, if it is in quotes", "Oui, s'il est entre apostrophes", "Sí, si va entre comillas"], ["Only in MySQL", "Seulement en MySQL", "Solo en MySQL"]],
    e: [
      "`ORDER BY $1` sorts by a constant, so nothing changes. Table and column names, and `ASC`/`DESC`, come from an allow-list: `{ name: \"name\", age: \"age\" }[choice]`, never from the request itself.",
      "`ORDER BY $1` trie par une constante : rien ne change. Les noms de tables et de colonnes, et `ASC`/`DESC`, viennent d'une liste autorisée : `{ name: \"name\", age: \"age\" }[choice]`, jamais de la requête reçue elle-même.",
      "`ORDER BY $1` ordena por una constante: nada cambia. Los nombres de tablas y columnas, y `ASC`/`DESC`, salen de una lista permitida: `{ name: \"name\", age: \"age\" }[choice]`, nunca de la petición recibida.",
    ],
  },
  {
    id: "sq-safe-04",
    q: ["How should a users table keep passwords?", "Comment une table d'utilisateurs doit-elle garder les mots de passe ?", "¿Cómo debe guardar las contraseñas una tabla de usuarios?"],
    a: ["As a slow salted hash (Argon2, bcrypt, scrypt), never the password itself", "Sous forme de hachage lent et salé (Argon2, bcrypt, scrypt), jamais le mot de passe lui-même", "Como un hash lento con sal (Argon2, bcrypt, scrypt), nunca la contraseña misma"],
    w: [["Encrypted with a key kept in the same database", "Chiffrés avec une clé gardée dans la même base", "Cifradas con una clave guardada en la misma base"], ["As an MD5 of the password", "En MD5 du mot de passe", "Como un MD5 de la contraseña"], ["As plain text in a column only admins can read", "En clair dans une colonne que seuls les admins lisent", "En texto plano en una columna que solo leen los administradores"]],
    e: [
      "Databases leak, through backups too. A slow hash with its own salt per password makes a leaked table expensive to crack; MD5 and SHA-256 are too fast. Checking a login recomputes the hash.",
      "Les bases fuient, par les sauvegardes aussi. Un hachage lent avec son propre sel par mot de passe rend coûteux le cassage d'une table volée ; MD5 et SHA-256 sont trop rapides. Vérifier une connexion recalcule le hachage.",
      "Las bases se filtran, también por las copias de seguridad. Un hash lento con su propia sal por contraseña encarece romper una tabla robada; MD5 y SHA-256 son demasiado rápidos. Comprobar un inicio de sesión recalcula el hash.",
    ],
  },
  {
    id: "sq-safe-05",
    q: ["Where should the database password of an app live?", "Où doit vivre le mot de passe de base de données d'une application ?", "¿Dónde debe vivir la contraseña de base de datos de una aplicación?"],
    a: ["In the environment or a secret manager, outside the code and the repository", "Dans l'environnement ou un gestionnaire de secrets, hors du code et du dépôt", "En el entorno o en un gestor de secretos, fuera del código y del repositorio"],
    w: [["In the source code, next to the query", "Dans le code source, à côté de la requête", "En el código fuente, junto a la consulta"], ["In a committed `config.json`", "Dans un `config.json` versionné", "En un `config.json` versionado"], ["In the database itself", "Dans la base elle-même", "En la propia base"]],
    e: [
      "A password in git stays in its history for good, even after removal. A `DATABASE_URL` variable, filled from a secret store, keeps it out; a `.env.example` with placeholders documents what is needed.",
      "Un mot de passe dans git reste pour de bon dans son historique, même après suppression. Une variable `DATABASE_URL`, remplie depuis un coffre de secrets, l'en garde ; un `.env.example` avec des valeurs factices documente ce qu'il faut.",
      "Una contraseña en git queda para siempre en su historial, aunque se borre. Una variable `DATABASE_URL`, rellenada desde un almacén de secretos, la mantiene fuera; un `.env.example` con valores ficticios documenta lo que hace falta.",
    ],
  },
];

const performance: SqlQuestion[] = [
  {
    id: "sq-perf-01",
    q: ["A page lists 50 owners, then runs one query per owner for their pets: 51 queries. What is it called, and the fix?", "Une page liste 50 maîtres, puis lance une requête par maître pour ses animaux : 51 requêtes. Comment s'appelle-t-il, et le remède ?", "Una página lista 50 dueños y luego lanza una consulta por dueño para sus animales: 51 consultas. ¿Cómo se llama, y el remedio?"],
    a: ["The N+1 problem: one join, or one query with `WHERE owner_id IN (…)`", "Le problème N+1 : une jointure, ou une requête avec `WHERE owner_id IN (…)`", "El problema N+1: una unión, o una consulta con `WHERE owner_id IN (…)`"],
    w: [["A deadlock: add an index", "Un interblocage : ajouter un index", "Un interbloqueo: añadir un índice"], ["Normal: each query is small", "Normal : chaque requête est petite", "Normal: cada consulta es pequeña"], ["A Cartesian product: add `DISTINCT`", "Un produit cartésien : ajouter `DISTINCT`", "Un producto cartesiano: añadir `DISTINCT`"]],
    e: [
      "Each round trip to the server costs latency, often more than the query itself. ORMs cause it quietly when related objects load lazily; their eager-loading option (`include`, `select_related`, `joinedload`) fixes it.",
      "Chaque aller-retour vers le serveur coûte de la latence, souvent plus que la requête elle-même. Les ORM le provoquent en silence quand les objets liés se chargent à la demande ; leur option de chargement anticipé (`include`, `select_related`, `joinedload`) le corrige.",
      "Cada ida y vuelta al servidor cuesta latencia, a menudo más que la consulta. Los ORM lo provocan en silencio cuando los objetos relacionados se cargan bajo demanda; su opción de carga anticipada (`include`, `select_related`, `joinedload`) lo corrige.",
    ],
  },
  {
    id: "sq-perf-02",
    q: ["Why avoid `SELECT *` in application code?", "Pourquoi éviter `SELECT *` dans le code d'une application ?", "¿Por qué evitar `SELECT *` en el código de una aplicación?"],
    a: ["It reads and sends columns nobody uses, and changes when the table does", "Il lit et envoie des colonnes que personne n'utilise, et change quand la table change", "Lee y envía columnas que nadie usa, y cambia cuando cambia la tabla"],
    w: [["It is not valid SQL", "Ce n'est pas du SQL valide", "No es SQL válido"], ["It locks the table", "Il verrouille la table", "Bloquea la tabla"], ["It skips NULL columns", "Il saute les colonnes NULL", "Se salta las columnas NULL"]],
    e: [
      "A large text or JSON column travels for nothing, and a covering index (one that holds every column needed) cannot be used. At the prompt, exploring, `SELECT *` is fine.",
      "Une grande colonne de texte ou de JSON voyage pour rien, et un index couvrant (qui contient toutes les colonnes nécessaires) ne peut pas servir. À la main, pour explorer, `SELECT *` va bien.",
      "Una columna grande de texto o JSON viaja para nada, y no se puede usar un índice que cubra (que contenga todas las columnas necesarias). A mano, para explorar, `SELECT *` está bien.",
    ],
  },
  {
    id: "sq-perf-03",
    q: ["`WHERE created_at >= '2026-01-01'` uses an index; `WHERE year(created_at) = 2026` does not. Why?", "`WHERE created_at >= '2026-01-01'` utilise un index ; `WHERE year(created_at) = 2026` non. Pourquoi ?", "`WHERE created_at >= '2026-01-01'` usa un índice; `WHERE year(created_at) = 2026` no. ¿Por qué?"],
    a: ["The function hides the column: compare the column itself with a range", "La fonction cache la colonne : comparer la colonne elle-même à un intervalle", "La función oculta la columna: comparar la propia columna con un intervalo"],
    w: [["`year` is slow to compute", "`year` est lent à calculer", "`year` es lento de calcular"], ["Indexes do not hold dates", "Les index ne contiennent pas de dates", "Los índices no contienen fechas"], ["2026 must be in quotes", "2026 doit être entre apostrophes", "2026 debe ir entre comillas"]],
    e: [
      "A condition the index can use is \"sargable\": the bare column against a value. `created_at >= '2026-01-01' AND created_at < '2027-01-01'` keeps the year and uses the index.",
      "Une condition que l'index peut utiliser est « sargable » : la colonne nue face à une valeur. `created_at >= '2026-01-01' AND created_at < '2027-01-01'` garde l'année et utilise l'index.",
      "Una condición que el índice puede usar es «sargable»: la columna sola frente a un valor. `created_at >= '2026-01-01' AND created_at < '2027-01-01'` conserva el año y usa el índice.",
    ],
  },
  {
    id: "sq-perf-04",
    q: ["How do you see whether a query reads the whole table?", "Comment voir si une requête lit toute la table ?", "¿Cómo se ve si una consulta lee toda la tabla?"],
    a: ["Put `EXPLAIN` in front of it: `Seq Scan` (PostgreSQL), `SCAN` (SQLite), `type: ALL` (MySQL)", "Mettre `EXPLAIN` devant : `Seq Scan` (PostgreSQL), `SCAN` (SQLite), `type: ALL` (MySQL)", "Poner `EXPLAIN` delante: `Seq Scan` (PostgreSQL), `SCAN` (SQLite), `type: ALL` (MySQL)"],
    w: [["Time it twice: the second run tells", "La chronométrer deux fois : la seconde le dit", "Cronometrarla dos veces: la segunda lo dice"], ["`SHOW INDEXES`", "`SHOW INDEXES`", "`SHOW INDEXES`"], ["Count its rows", "Compter ses lignes", "Contar sus filas"]],
    e: [
      "Each engine prints its plan differently: SQLite's handy form is `EXPLAIN QUERY PLAN`, where `SEARCH … USING INDEX` is good. On a tiny table a full scan is the right plan anyway.",
      "Chaque moteur affiche son plan à sa façon : la forme pratique de SQLite est `EXPLAIN QUERY PLAN`, où `SEARCH … USING INDEX` est bon signe. Sur une toute petite table, un parcours complet est de toute façon le bon plan.",
      "Cada motor muestra su plan a su manera: la forma práctica de SQLite es `EXPLAIN QUERY PLAN`, donde `SEARCH … USING INDEX` es buena señal. En una tabla muy pequeña, un recorrido completo es de todos modos el plan correcto.",
    ],
  },
  {
    id: "sq-perf-05",
    q: ["A web app opens a new database connection for every request. What helps under load?", "Une application web ouvre une nouvelle connexion à la base à chaque requête. Qu'est-ce qui aide sous charge ?", "Una aplicación web abre una nueva conexión a la base en cada petición. ¿Qué ayuda bajo carga?"],
    a: ["A connection pool, reusing a few open connections", "Un pool de connexions, qui réutilise quelques connexions ouvertes", "Un pool de conexiones, que reutiliza unas pocas conexiones abiertas"],
    w: [["Opening even more connections", "Ouvrir encore plus de connexions", "Abrir todavía más conexiones"], ["A larger `LIMIT`", "Un `LIMIT` plus grand", "Un `LIMIT` mayor"], ["Closing the connections after each row", "Fermer les connexions après chaque ligne", "Cerrar las conexiones tras cada fila"]],
    e: [
      "Connecting costs a handshake, authentication and, in PostgreSQL, a whole server process; servers also cap connections (`max_connections`). Drivers have pools; PgBouncer pools in front of PostgreSQL for many app instances.",
      "Se connecter coûte une poignée de main, une authentification et, en PostgreSQL, tout un processus serveur ; les serveurs limitent aussi les connexions (`max_connections`). Les pilotes ont des pools ; PgBouncer en fait un devant PostgreSQL pour de nombreuses instances.",
      "Conectarse cuesta un saludo, una autenticación y, en PostgreSQL, todo un proceso del servidor; los servidores también limitan las conexiones (`max_connections`). Los controladores tienen pools; PgBouncer hace uno delante de PostgreSQL para muchas instancias.",
    ],
  },
];

const operations: SqlQuestion[] = [
  {
    id: "sq-ops-01",
    q: ["When can you trust a backup?", "Quand peut-on se fier à une sauvegarde ?", "¿Cuándo se puede confiar en una copia de seguridad?"],
    a: ["Once it has been restored, somewhere else, and checked", "Une fois qu'elle a été restaurée, ailleurs, et vérifiée", "Cuando se ha restaurado, en otro sitio, y se ha comprobado"],
    w: [["As soon as the file exists", "Dès que le fichier existe", "En cuanto existe el archivo"], ["When it is larger than the database", "Quand elle est plus grande que la base", "Cuando es mayor que la base"], ["When it is on the same disk", "Quand elle est sur le même disque", "Cuando está en el mismo disco"]],
    e: [
      "Untested backups fail in surprising ways: missing roles, a wrong version, an empty file. Keep copies off the machine, and know how much data you can lose (how often) and how long a restore takes.",
      "Des sauvegardes non testées échouent de façon surprenante : rôles manquants, mauvaise version, fichier vide. Garder des copies hors de la machine, et savoir combien de données on peut perdre (à quelle fréquence) et combien de temps prend une restauration.",
      "Las copias no probadas fallan de formas sorprendentes: roles que faltan, versión equivocada, archivo vacío. Guardar copias fuera de la máquina, y saber cuántos datos se pueden perder (cada cuánto) y cuánto tarda una restauración.",
    ],
  },
  {
    id: "sq-ops-02",
    q: ["How should schema changes reach the production database?", "Comment les changements de schéma doivent-ils arriver sur la base de production ?", "¿Cómo deben llegar los cambios de esquema a la base de producción?"],
    a: ["As numbered migration files in the repository, applied in order by a tool and recorded in a table", "Sous forme de fichiers de migration numérotés dans le dépôt, appliqués dans l'ordre par un outil et notés dans une table", "Como archivos de migración numerados en el repositorio, aplicados en orden por una herramienta y anotados en una tabla"],
    w: [["Typed by hand in production when needed", "Tapés à la main en production au besoin", "Escritos a mano en producción cuando haga falta"], ["By dropping and recreating the database", "En supprimant et recréant la base", "Borrando y recreando la base"], ["By copying the developer's database over it", "En copiant la base du développeur par-dessus", "Copiando encima la base del desarrollador"]],
    e: [
      "Every environment then has the same schema, and the history shows what changed when. Breaking changes go in steps: add the new column, deploy code that writes both, backfill, then drop the old one.",
      "Chaque environnement a alors le même schéma, et l'historique montre ce qui a changé et quand. Les changements cassants se font par étapes : ajouter la nouvelle colonne, déployer un code qui écrit les deux, remplir, puis supprimer l'ancienne.",
      "Así cada entorno tiene el mismo esquema, y el historial muestra qué cambió y cuándo. Los cambios que rompen se hacen por pasos: añadir la columna nueva, desplegar código que escribe en las dos, rellenar, y luego borrar la antigua.",
    ],
  },
  {
    id: "sq-ops-03",
    q: ["Which ports do PostgreSQL and MySQL listen on by default?", "Sur quels ports PostgreSQL et MySQL écoutent-ils par défaut ?", "¿En qué puertos escuchan por defecto PostgreSQL y MySQL?"],
    a: ["5432 and 3306", "5432 et 3306", "5432 y 3306"],
    w: [["3306 and 5432", "3306 et 5432", "3306 y 5432"], ["80 and 443", "80 et 443", "80 y 443"], ["8080 for both", "8080 pour les deux", "8080 para los dos"]],
    e: [
      "SQLite has none: it is a file. Neither port should be open to the internet; reach a remote database through a private network, a VPN or an SSH tunnel: `ssh -L 5432:localhost:5432 server`.",
      "SQLite n'en a pas : c'est un fichier. Aucun des deux ports ne devrait être ouvert sur internet ; atteindre une base distante par un réseau privé, un VPN ou un tunnel SSH : `ssh -L 5432:localhost:5432 server`.",
      "SQLite no tiene: es un archivo. Ninguno de los dos puertos debería estar abierto a internet; llegar a una base remota por una red privada, una VPN o un túnel SSH: `ssh -L 5432:localhost:5432 server`.",
    ],
  },
  {
    id: "sq-ops-04",
    q: ["You must fix a few rows by hand in production. What is the safe way?", "Vous devez corriger quelques lignes à la main en production. Quelle est la façon sûre ?", "Hay que corregir unas filas a mano en producción. ¿Cuál es la forma segura?"],
    a: ["`BEGIN`, the change, a `SELECT` to check the count and values, then `COMMIT` or `ROLLBACK`", "`BEGIN`, le changement, un `SELECT` pour vérifier le nombre et les valeurs, puis `COMMIT` ou `ROLLBACK`", "`BEGIN`, el cambio, un `SELECT` para comprobar el número y los valores, y luego `COMMIT` o `ROLLBACK`"],
    w: [["Run the `UPDATE` straight away, then look", "Lancer l'`UPDATE` tout de suite, puis regarder", "Lanzar el `UPDATE` enseguida y luego mirar"], ["Stop the server first", "Arrêter d'abord le serveur", "Parar antes el servidor"], ["Edit the database files", "Modifier les fichiers de la base", "Editar los archivos de la base"]],
    e: [
      "Check the reported row count (`UPDATE 3`) against what you expected before committing, and keep the transaction short: its locks block others. A recent backup, and a second pair of eyes, help too.",
      "Comparer le nombre de lignes annoncé (`UPDATE 3`) à ce qu'on attendait avant de valider, et garder la transaction courte : ses verrous bloquent les autres. Une sauvegarde récente, et un second regard, aident aussi.",
      "Comparar el número de filas indicado (`UPDATE 3`) con lo esperado antes de confirmar, y mantener corta la transacción: sus bloqueos detienen a los demás. Una copia reciente, y otra persona que revise, también ayudan.",
    ],
  },
  {
    id: "sq-ops-05",
    q: ["Why keep the production, test and development databases apart?", "Pourquoi séparer les bases de production, de test et de développement ?", "¿Por qué separar las bases de producción, pruebas y desarrollo?"],
    a: ["So a test or a mistake never touches real data, and real personal data stays out of test machines", "Pour qu'un test ou une erreur ne touche jamais de vraies données, et que les vraies données personnelles restent hors des machines de test", "Para que una prueba o un error nunca toque datos reales, y que los datos personales reales queden fuera de las máquinas de prueba"],
    w: [["It makes queries faster", "Les requêtes vont plus vite", "Las consultas van más rápido"], ["Licences require it", "Les licences l'exigent", "Las licencias lo exigen"], ["One server cannot hold two databases", "Un serveur ne peut pas contenir deux bases", "Un servidor no puede contener dos bases"]],
    e: [
      "Different databases and different credentials; tests build their own invented data. A copy of production for testing is anonymised first. Neon and similar services make cheap branches of a database for this.",
      "Des bases différentes et des identifiants différents ; les tests construisent leurs propres données inventées. Une copie de la production pour tester est d'abord anonymisée. Neon et des services semblables font pour cela des branches bon marché d'une base.",
      "Bases distintas y credenciales distintas; las pruebas construyen sus propios datos inventados. Una copia de producción para pruebas se anonimiza antes. Neon y servicios similares crean para ello ramas baratas de una base.",
    ],
  },
];

export const practice = { design, safety, performance, operations };
