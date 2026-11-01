# SQL — l'essentiel du test

## Comment utiliser ce cours

Ce cours accompagne le test SQL. Les exemples utilisent deux petites tables inventées, `employees(id, name, dept_id, salary, manager_id)` et `departments(id, name)`. Chaque partie donne la syntaxe, le résultat attendu et le piège que tendent les mauvaises réponses. Essayez les requêtes dans `sqlite3` — il n'a besoin d'aucun serveur.

| Niveau | Ce qu'il demande |
|---|---|
| Débutant | `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`, compter des lignes |
| Intermédiaire | `NULL`, `GROUP BY`, jointures internes et externes, `INSERT`, `UPDATE`, `DELETE` |
| Avancé | Fonctions de fenêtre, sous-requêtes, transactions, index, les clients de chaque base |
| Expert | Les cas limites : `NULL` dans `NOT IN`, niveaux d'isolation, plans d'exécution, différences entre moteurs |

## Partie 1 — Sélectionner des lignes

Une requête s'écrit `SELECT … FROM … WHERE … ORDER BY … LIMIT …` mais s'évalue dans un autre ordre : `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `ORDER BY`, `LIMIT`. C'est pourquoi un alias défini dans `SELECT` ne peut pas servir dans `WHERE`.

`NULL` signifie inconnu : `NULL = NULL` n'est pas vrai, il faut donc tester avec `IS NULL`. `COALESCE(a, b)` donne la première valeur qui n'est pas `NULL`. `LIKE 'A%'` reconnaît un préfixe, `BETWEEN` inclut les deux bornes, `IN` teste une liste.

```sql
SELECT name, salary * 12 AS yearly
FROM employees
WHERE dept_id IN (1, 3) AND manager_id IS NOT NULL
ORDER BY yearly DESC
LIMIT 5;
```

## Partie 2 — Agrégats et fenêtres

`COUNT(*)` compte les lignes, `COUNT(col)` les valeurs qui ne sont pas `NULL`, et `AVG` ignore `NULL`. Chaque colonne de `SELECT` doit être groupée ou agrégée. `WHERE` filtre les lignes avant le regroupement ; `HAVING` filtre les groupes après.

```sql
SELECT dept_id, COUNT(*) AS staff, AVG(salary) AS average
FROM employees
GROUP BY dept_id
HAVING COUNT(*) >= 3;
```

Une fonction de fenêtre calcule sur des lignes liées sans les fusionner : `RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC)` classe à l'intérieur de chaque département. `ROW_NUMBER` ne donne jamais d'ex aequo, `RANK` laisse des trous après les ex aequo, `DENSE_RANK` non.

## Partie 3 — Jointures et sous-requêtes

| Jointure | Garde |
|---|---|
| `INNER JOIN` | Seulement les lignes qui correspondent des deux côtés |
| `LEFT JOIN` | Toutes les lignes de gauche, avec `NULL` quand rien ne correspond |
| `FULL JOIN` | Toutes les lignes des deux côtés |
| `CROSS JOIN` | Toutes les paires de lignes |

Une condition sur la table de droite dans `WHERE` retransforme un `LEFT JOIN` en jointure interne ; mettez-la plutôt dans `ON`. Une auto-jointure donne à chaque employé son responsable. `UNION` retire les doublons, `UNION ALL` les garde. `EXISTS` est plus sûr que `NOT IN` quand la sous-requête peut renvoyer `NULL` : un seul `NULL` fait que `NOT IN` ne renvoie aucune ligne.

```sql
SELECT e.name, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;
```

## Partie 4 — Modifier les données et le schéma

`INSERT INTO … VALUES`, `UPDATE … SET … WHERE`, `DELETE FROM … WHERE` — sans `WHERE`, toutes les lignes changent. `CREATE TABLE` avec les contraintes `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `REFERENCES` et `CHECK` ; `ALTER TABLE` ajoute une colonne. Une transaction regroupe des changements : `BEGIN`, puis `COMMIT` ou `ROLLBACK`. Un index accélère les recherches sur ses colonnes et ralentit les écritures ; un index composite sur `(a, b)` aide un filtre sur `a` mais pas sur `b` seul.

## Partie 5 — PostgreSQL

Le client est `psql` : `\l` liste les bases, `\dt` les tables, `\d employees` en décrit une, `\q` quitte. PostgreSQL a `SERIAL` et les colonnes d'identité, `RETURNING` après une écriture, `ILIKE` pour une correspondance insensible à la casse, `JSONB` avec l'opérateur `->>`, et `EXPLAIN ANALYZE` pour afficher et chronométrer un plan. `VACUUM` récupère la place laissée par les mises à jour et les suppressions. Les rôles portent les droits : `GRANT SELECT ON employees TO reader`.

## Partie 6 — SQLite

SQLite est une bibliothèque et un fichier ; le shell est `sqlite3`, avec `.tables`, `.schema`, `.mode column` et `.quit`. Les types sont des affinités : une colonne déclarée `INTEGER` peut contenir du texte, sauf si la table est `STRICT`. Les clés étrangères ne sont vérifiées qu'après `PRAGMA foreign_keys = ON`. `INTEGER PRIMARY KEY` est l'identifiant de ligne. Un seul écrivain à la fois ; la journalisation anticipée, `PRAGMA journal_mode = WAL`, laisse les lecteurs travailler pendant une écriture.

## Partie 7 — MySQL

Le client est `mysql -u user -p`, avec `SHOW DATABASES`, `USE`, `SHOW TABLES` et `DESCRIBE`. MySQL écrit `AUTO_INCREMENT`, cite les noms avec des accents graves, et accepte `LIMIT offset, count` en plus de la forme standard. InnoDB est le moteur qui a les transactions et les clés étrangères. Attention aux valeurs par défaut : le jeu de caractères `utf8` ne tient que trois octets par caractère, utilisez donc `utf8mb4`, et sans mode SQL strict MySQL peut tronquer une valeur au lieu de la refuser.

## Partie 8 — Bonnes pratiques

- Passez les valeurs en paramètres, ne les collez jamais dans la chaîne SQL : c'est ainsi que naissent les injections.
- Testez un `UPDATE` ou un `DELETE` en lançant d'abord son `WHERE` dans un `SELECT`, à l'intérieur d'une transaction.
- Donnez une clé primaire à chaque table, et normalisez jusqu'à ce que chaque fait soit stocké une seule fois.
- Lisez le plan avec `EXPLAIN` avant d'ajouter un index, et évitez `SELECT *` dans le code.
- Sauvegardez avec l'outil de la base — `pg_dump`, `mysqldump`, `.backup` — et testez la restauration.

## Sources

| Thème | Référence gratuite |
|---|---|
| PostgreSQL | [Documentation de PostgreSQL](https://www.postgresql.org/docs/current/) |
| SQLite | [Documentation de SQLite](https://www.sqlite.org/docs.html) |
| MySQL | [Manuel de référence de MySQL](https://dev.mysql.com/doc/refman/8.4/en/) |
| Exercices et tutoriels | [SQLBolt](https://sqlbolt.com/) |
