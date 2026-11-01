# SQL — the essentials of the test

## How to use this course

This course goes with the SQL test. The examples use two small invented tables, `employees(id, name, dept_id, salary, manager_id)` and `departments(id, name)`. Each part gives the syntax, the result to expect and the trap the wrong options set. Try the queries in `sqlite3` — it needs no server.

| Level | What it asks |
|---|---|
| Beginner | `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`, counting rows |
| Intermediate | `NULL`, `GROUP BY`, inner and outer joins, `INSERT`, `UPDATE`, `DELETE` |
| Advanced | Window functions, subqueries, transactions, indexes, the clients of each database |
| Expert | The edge cases: `NULL` in `NOT IN`, isolation levels, query plans, engine differences |

## Part 1 — Selecting rows

A query is written `SELECT … FROM … WHERE … ORDER BY … LIMIT …` but evaluated in another order: `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `ORDER BY`, `LIMIT`. That is why an alias defined in `SELECT` cannot be used in `WHERE`.

`NULL` means unknown: `NULL = NULL` is not true, so test with `IS NULL`. `COALESCE(a, b)` gives the first value that is not `NULL`. `LIKE 'A%'` matches a prefix, `BETWEEN` includes both ends, `IN` tests a list.

```sql
SELECT name, salary * 12 AS yearly
FROM employees
WHERE dept_id IN (1, 3) AND manager_id IS NOT NULL
ORDER BY yearly DESC
LIMIT 5;
```

## Part 2 — Aggregates and windows

`COUNT(*)` counts rows, `COUNT(col)` counts values that are not `NULL`, and `AVG` ignores `NULL`. Every column in `SELECT` must be grouped or aggregated. `WHERE` filters rows before grouping; `HAVING` filters groups after.

```sql
SELECT dept_id, COUNT(*) AS staff, AVG(salary) AS average
FROM employees
GROUP BY dept_id
HAVING COUNT(*) >= 3;
```

A window function computes over related rows without collapsing them: `RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC)` ranks within each department. `ROW_NUMBER` never ties, `RANK` leaves gaps after ties, `DENSE_RANK` does not.

## Part 3 — Joins and subqueries

| Join | Keeps |
|---|---|
| `INNER JOIN` | Only rows that match on both sides |
| `LEFT JOIN` | Every row on the left, with `NULL` where nothing matches |
| `FULL JOIN` | Every row on both sides |
| `CROSS JOIN` | Every pair of rows |

A condition on the right table in `WHERE` turns a `LEFT JOIN` back into an inner join; put it in `ON` instead. A self-join gives each employee their manager. `UNION` removes duplicates, `UNION ALL` keeps them. `EXISTS` is safer than `NOT IN` when the subquery can return `NULL`: one `NULL` makes `NOT IN` return no row.

```sql
SELECT e.name, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;
```

## Part 4 — Changing data and schema

`INSERT INTO … VALUES`, `UPDATE … SET … WHERE`, `DELETE FROM … WHERE` — without `WHERE`, every row changes. `CREATE TABLE` with `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `REFERENCES` and `CHECK` constraints; `ALTER TABLE` adds a column. A transaction groups changes: `BEGIN`, then `COMMIT` or `ROLLBACK`. An index speeds up searches on its columns and slows down writes; a composite index on `(a, b)` helps a filter on `a` but not on `b` alone.

## Part 5 — PostgreSQL

The client is `psql`: `\l` lists databases, `\dt` the tables, `\d employees` describes one, `\q` quits. PostgreSQL has `SERIAL` and identity columns, `RETURNING` after a write, `ILIKE` for case-insensitive matching, `JSONB` with the `->>` operator, and `EXPLAIN ANALYZE` to show and time a plan. `VACUUM` reclaims space left by updates and deletes. Roles carry rights: `GRANT SELECT ON employees TO reader`.

## Part 6 — SQLite

SQLite is a library and one file; the shell is `sqlite3`, with `.tables`, `.schema`, `.mode column` and `.quit`. Types are affinities: a column declared `INTEGER` can still hold text unless the table is `STRICT`. Foreign keys are checked only after `PRAGMA foreign_keys = ON`. `INTEGER PRIMARY KEY` is the row id. One writer at a time; write-ahead logging, `PRAGMA journal_mode = WAL`, lets readers work during a write.

## Part 7 — MySQL

The client is `mysql -u user -p`, with `SHOW DATABASES`, `USE`, `SHOW TABLES` and `DESCRIBE`. MySQL writes `AUTO_INCREMENT`, quotes names with backticks, and uses `LIMIT offset, count` as well as the standard form. InnoDB is the engine with transactions and foreign keys. Watch the defaults: the `utf8` character set holds only three bytes per character, so use `utf8mb4`, and without a strict SQL mode MySQL may truncate a value instead of refusing it.

## Part 8 — Good practice

- Pass values as parameters, never by pasting them into the SQL string: that is how injection happens.
- Test an `UPDATE` or `DELETE` by running its `WHERE` in a `SELECT` first, inside a transaction.
- Give each table a primary key, and normalise until each fact is stored once.
- Read the plan with `EXPLAIN` before adding an index, and avoid `SELECT *` in code.
- Back up with the database's own tool — `pg_dump`, `mysqldump`, `.backup` — and test the restore.

## Sources

| Topic | Free reference |
|---|---|
| PostgreSQL | [PostgreSQL documentation](https://www.postgresql.org/docs/current/) |
| SQLite | [SQLite documentation](https://www.sqlite.org/docs.html) |
| MySQL | [MySQL Reference Manual](https://dev.mysql.com/doc/refman/8.4/en/) |
| Practice and tutorials | [SQLBolt](https://sqlbolt.com/) |
