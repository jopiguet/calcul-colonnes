/** Texts of the SQL test, in French, Spanish and English; merged into quiz-i18n.ts. */
import type { SqlTopic } from "../shared/quiz";

type Lang = "fr" | "es" | "en";
type Tri = Record<Lang, string>;

export const SQ_TEXTS = {
  fr: { modeSql: "🗄️ SQL", sqlSetupTitle: "QCM : SQL et bases de données" },
  es: { modeSql: "🗄️ SQL", sqlSetupTitle: "Test: SQL y bases de datos" },
  en: { modeSql: "🗄️ SQL", sqlSetupTitle: "Test: SQL and databases" },
} satisfies Record<Lang, Record<string, string>>;

export const SQ_LEVEL: Tri = { fr: "SQL", es: "SQL", en: "SQL" };

export const SQ_GROUPS: Record<Lang, { sqlLanguage: string; sqlEngines: string }> = {
  fr: { sqlLanguage: "Le langage SQL", sqlEngines: "PostgreSQL, SQLite, MySQL" },
  es: { sqlLanguage: "El lenguaje SQL", sqlEngines: "PostgreSQL, SQLite, MySQL" },
  en: { sqlLanguage: "The SQL language", sqlEngines: "PostgreSQL, SQLite, MySQL" },
};

export const SQ_TOPICS: Record<Lang, Record<SqlTopic, string>> = {
  fr: {
    sqlSelect: "Lire : filtres, NULL, tri",
    sqlAggregate: "Agréger et regrouper",
    sqlJoins: "Jointures et sous-requêtes",
    sqlModify: "Modifier : données, schéma, transactions",
    sqlPostgres: "PostgreSQL et psql",
    sqlSqlite: "SQLite et sqlite3",
    sqlMysql: "MySQL et MariaDB",
    sqlPractice: "Bonnes pratiques",
  },
  es: {
    sqlSelect: "Leer: filtros, NULL, orden",
    sqlAggregate: "Agregar y agrupar",
    sqlJoins: "Uniones y subconsultas",
    sqlModify: "Modificar: datos, esquema, transacciones",
    sqlPostgres: "PostgreSQL y psql",
    sqlSqlite: "SQLite y sqlite3",
    sqlMysql: "MySQL y MariaDB",
    sqlPractice: "Buenas prácticas",
  },
  en: {
    sqlSelect: "Reading: filters, NULL, sorting",
    sqlAggregate: "Aggregating and grouping",
    sqlJoins: "Joins and subqueries",
    sqlModify: "Changing: data, schema, transactions",
    sqlPostgres: "PostgreSQL and psql",
    sqlSqlite: "SQLite and sqlite3",
    sqlMysql: "MySQL and MariaDB",
    sqlPractice: "Good practice",
  },
};

export const SQ_SKILLS: Record<Lang, Record<string, string>> = {
  fr: {
    "sqlSelect.filtering": "Filtrer : BETWEEN, LIKE, DISTINCT",
    "sqlSelect.nulls": "NULL et la logique à trois valeurs",
    "sqlSelect.sorting": "Trier et paginer",
    "sqlSelect.expressions": "Expressions : CASE, CAST, calculs",
    "sqlSelect.filterRows": "Ce que renvoie un WHERE",
    "sqlSelect.nullRows": "Ce que renvoie un test sur NULL",
    "sqlSelect.orderLimit": "Ce que renvoient ORDER BY et LIMIT",
    "sqlAggregate.aggregates": "Fonctions d'agrégat",
    "sqlAggregate.grouping": "GROUP BY et HAVING",
    "sqlAggregate.windows": "Fonctions de fenêtre",
    "sqlAggregate.countValues": "Ce que compte COUNT",
    "sqlAggregate.averageAge": "SUM et AVG face aux NULL",
    "sqlAggregate.groupCount": "Ce que renvoie un GROUP BY",
    "sqlJoins.joins": "Jointures",
    "sqlJoins.subqueries": "Sous-requêtes, EXISTS, CTE",
    "sqlJoins.sets": "UNION, INTERSECT, EXCEPT",
    "sqlJoins.joinRows": "Ce que renvoie une jointure",
    "sqlModify.changes": "INSERT, UPDATE, DELETE",
    "sqlModify.schema": "Tables, types et contraintes",
    "sqlModify.transactions": "Transactions et isolation",
    "sqlModify.indexes": "Index",
    "sqlPostgres.psql": "Le client psql",
    "sqlPostgres.pgFeatures": "Le SQL de PostgreSQL",
    "sqlPostgres.pgAdmin": "Administrer PostgreSQL",
    "sqlSqlite.sqliteShell": "Le shell sqlite3",
    "sqlSqlite.sqliteTypes": "Types et tables SQLite",
    "sqlSqlite.sqliteRuntime": "SQLite à l'usage : PRAGMA, verrous",
    "sqlMysql.mysqlClient": "Le client mysql, mysqldump, comptes",
    "sqlMysql.mysqlSpecifics": "Les particularités de MySQL",
    "sqlPractice.design": "Concevoir les tables",
    "sqlPractice.safety": "Sécurité : injection, secrets",
    "sqlPractice.performance": "Performances",
    "sqlPractice.operations": "Exploitation : sauvegardes, migrations",
  },
  es: {
    "sqlSelect.filtering": "Filtrar: BETWEEN, LIKE, DISTINCT",
    "sqlSelect.nulls": "NULL y la lógica de tres valores",
    "sqlSelect.sorting": "Ordenar y paginar",
    "sqlSelect.expressions": "Expresiones: CASE, CAST, cálculos",
    "sqlSelect.filterRows": "Lo que devuelve un WHERE",
    "sqlSelect.nullRows": "Lo que devuelve una prueba sobre NULL",
    "sqlSelect.orderLimit": "Lo que devuelven ORDER BY y LIMIT",
    "sqlAggregate.aggregates": "Funciones de agregado",
    "sqlAggregate.grouping": "GROUP BY y HAVING",
    "sqlAggregate.windows": "Funciones de ventana",
    "sqlAggregate.countValues": "Lo que cuenta COUNT",
    "sqlAggregate.averageAge": "SUM y AVG ante los NULL",
    "sqlAggregate.groupCount": "Lo que devuelve un GROUP BY",
    "sqlJoins.joins": "Uniones",
    "sqlJoins.subqueries": "Subconsultas, EXISTS, CTE",
    "sqlJoins.sets": "UNION, INTERSECT, EXCEPT",
    "sqlJoins.joinRows": "Lo que devuelve una unión",
    "sqlModify.changes": "INSERT, UPDATE, DELETE",
    "sqlModify.schema": "Tablas, tipos y restricciones",
    "sqlModify.transactions": "Transacciones y aislamiento",
    "sqlModify.indexes": "Índices",
    "sqlPostgres.psql": "El cliente psql",
    "sqlPostgres.pgFeatures": "El SQL de PostgreSQL",
    "sqlPostgres.pgAdmin": "Administrar PostgreSQL",
    "sqlSqlite.sqliteShell": "El shell sqlite3",
    "sqlSqlite.sqliteTypes": "Tipos y tablas de SQLite",
    "sqlSqlite.sqliteRuntime": "SQLite en uso: PRAGMA, bloqueos",
    "sqlMysql.mysqlClient": "El cliente mysql, mysqldump, cuentas",
    "sqlMysql.mysqlSpecifics": "Las particularidades de MySQL",
    "sqlPractice.design": "Diseñar las tablas",
    "sqlPractice.safety": "Seguridad: inyección, secretos",
    "sqlPractice.performance": "Rendimiento",
    "sqlPractice.operations": "Operación: copias, migraciones",
  },
  en: {
    "sqlSelect.filtering": "Filtering: BETWEEN, LIKE, DISTINCT",
    "sqlSelect.nulls": "NULL and three-valued logic",
    "sqlSelect.sorting": "Sorting and paging",
    "sqlSelect.expressions": "Expressions: CASE, CAST, arithmetic",
    "sqlSelect.filterRows": "What a WHERE returns",
    "sqlSelect.nullRows": "What a test on NULL returns",
    "sqlSelect.orderLimit": "What ORDER BY and LIMIT return",
    "sqlAggregate.aggregates": "Aggregate functions",
    "sqlAggregate.grouping": "GROUP BY and HAVING",
    "sqlAggregate.windows": "Window functions",
    "sqlAggregate.countValues": "What COUNT counts",
    "sqlAggregate.averageAge": "SUM and AVG with NULLs",
    "sqlAggregate.groupCount": "What a GROUP BY returns",
    "sqlJoins.joins": "Joins",
    "sqlJoins.subqueries": "Subqueries, EXISTS, CTEs",
    "sqlJoins.sets": "UNION, INTERSECT, EXCEPT",
    "sqlJoins.joinRows": "What a join returns",
    "sqlModify.changes": "INSERT, UPDATE, DELETE",
    "sqlModify.schema": "Tables, types and constraints",
    "sqlModify.transactions": "Transactions and isolation",
    "sqlModify.indexes": "Indexes",
    "sqlPostgres.psql": "The psql client",
    "sqlPostgres.pgFeatures": "PostgreSQL's SQL",
    "sqlPostgres.pgAdmin": "Running PostgreSQL",
    "sqlSqlite.sqliteShell": "The sqlite3 shell",
    "sqlSqlite.sqliteTypes": "SQLite types and tables",
    "sqlSqlite.sqliteRuntime": "SQLite in use: PRAGMAs, locks",
    "sqlMysql.mysqlClient": "The mysql client, mysqldump, accounts",
    "sqlMysql.mysqlSpecifics": "What sets MySQL apart",
    "sqlPractice.design": "Designing tables",
    "sqlPractice.safety": "Safety: injection, secrets",
    "sqlPractice.performance": "Performance",
    "sqlPractice.operations": "Operations: backups, migrations",
  },
};

type SqlMistake =
  | "sqlBoundary"
  | "sqlNullCompared"
  | "sqlPrecedence"
  | "sqlLimitOffset"
  | "sqlSortDirection"
  | "sqlCountNulls"
  | "sqlDistinct"
  | "sqlAvgNulls"
  | "sqlAggregateConfused"
  | "sqlHavingIgnored"
  | "sqlNullGroup"
  | "sqlJoinKind"
  | "sqlCrossProduct";

export const SQ_MISTAKES: Record<Lang, Record<SqlMistake, string>> = {
  fr: {
    sqlBoundary: "> lu comme >= : la ligne sur la borne du mauvais côté",
    sqlNullCompared: "NULL comparé avec =, <> ou NOT IN comme une valeur",
    sqlPrecedence: "OR pris avant AND",
    sqlLimitOffset: "LIMIT et OFFSET confondus, ou OFFSET oublié",
    sqlSortDirection: "ASC et DESC confondus",
    sqlCountNulls: "COUNT(*) et COUNT(colonne) confondus : les NULL comptés ou non",
    sqlDistinct: "DISTINCT appliqué ou oublié",
    sqlAvgNulls: "AVG ou SUM qui compterait NULL comme 0, ou deviendrait NULL",
    sqlAggregateConfused: "SUM, AVG et COUNT confondus",
    sqlHavingIgnored: "HAVING (ou WHERE) pas appliqué",
    sqlNullGroup: "Le groupe NULL gardé ou perdu à tort",
    sqlJoinKind: "Jointure interne et externe confondues",
    sqlCrossProduct: "Chaque ligne avec chaque ligne : condition de jointure ignorée",
  },
  es: {
    sqlBoundary: "> leído como >=: la fila del límite en el lado equivocado",
    sqlNullCompared: "NULL comparado con =, <> o NOT IN como un valor",
    sqlPrecedence: "OR tomado antes que AND",
    sqlLimitOffset: "LIMIT y OFFSET confundidos, u OFFSET olvidado",
    sqlSortDirection: "ASC y DESC confundidos",
    sqlCountNulls: "COUNT(*) y COUNT(columna) confundidos: los NULL contados o no",
    sqlDistinct: "DISTINCT aplicado u olvidado",
    sqlAvgNulls: "AVG o SUM que contaría NULL como 0, o se volvería NULL",
    sqlAggregateConfused: "SUM, AVG y COUNT confundidos",
    sqlHavingIgnored: "HAVING (o WHERE) sin aplicar",
    sqlNullGroup: "El grupo NULL conservado o perdido por error",
    sqlJoinKind: "Unión interna y externa confundidas",
    sqlCrossProduct: "Cada fila con cada fila: condición de unión ignorada",
  },
  en: {
    sqlBoundary: "> read as >=: the row on the boundary on the wrong side",
    sqlNullCompared: "NULL compared with =, <> or NOT IN as if it were a value",
    sqlPrecedence: "OR taken before AND",
    sqlLimitOffset: "LIMIT and OFFSET confused, or OFFSET forgotten",
    sqlSortDirection: "ASC and DESC confused",
    sqlCountNulls: "COUNT(*) and COUNT(column) confused: NULLs counted or not",
    sqlDistinct: "DISTINCT applied or forgotten",
    sqlAvgNulls: "AVG or SUM taken to count NULL as 0, or to become NULL",
    sqlAggregateConfused: "SUM, AVG and COUNT confused",
    sqlHavingIgnored: "HAVING (or WHERE) not applied",
    sqlNullGroup: "The NULL group kept or lost wrongly",
    sqlJoinKind: "Inner and outer joins confused",
    sqlCrossProduct: "Every row with every row: join condition ignored",
  },
};
