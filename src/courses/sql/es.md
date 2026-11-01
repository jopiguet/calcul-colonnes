# SQL — lo esencial del test

## Cómo usar este curso

Este curso acompaña al test de SQL. Los ejemplos usan dos pequeñas tablas inventadas, `employees(id, name, dept_id, salary, manager_id)` y `departments(id, name)`. Cada parte da la sintaxis, el resultado esperado y la trampa que tienden las opciones erróneas. Pruebe las consultas en `sqlite3` — no necesita servidor.

| Nivel | Lo que pide |
|---|---|
| Principiante | `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`, contar filas |
| Intermedio | `NULL`, `GROUP BY`, uniones internas y externas, `INSERT`, `UPDATE`, `DELETE` |
| Avanzado | Funciones de ventana, subconsultas, transacciones, índices, los clientes de cada base |
| Experto | Los casos límite: `NULL` en `NOT IN`, niveles de aislamiento, planes de consulta, diferencias entre motores |

## Parte 1 — Seleccionar filas

Una consulta se escribe `SELECT … FROM … WHERE … ORDER BY … LIMIT …` pero se evalúa en otro orden: `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `ORDER BY`, `LIMIT`. Por eso un alias definido en `SELECT` no puede usarse en `WHERE`.

`NULL` significa desconocido: `NULL = NULL` no es verdadero, así que compruebe con `IS NULL`. `COALESCE(a, b)` da el primer valor que no es `NULL`. `LIKE 'A%'` reconoce un prefijo, `BETWEEN` incluye ambos extremos, `IN` comprueba una lista.

```sql
SELECT name, salary * 12 AS yearly
FROM employees
WHERE dept_id IN (1, 3) AND manager_id IS NOT NULL
ORDER BY yearly DESC
LIMIT 5;
```

## Parte 2 — Agregados y ventanas

`COUNT(*)` cuenta filas, `COUNT(col)` cuenta los valores que no son `NULL`, y `AVG` ignora `NULL`. Cada columna de `SELECT` debe estar agrupada o agregada. `WHERE` filtra filas antes de agrupar; `HAVING` filtra grupos después.

```sql
SELECT dept_id, COUNT(*) AS staff, AVG(salary) AS average
FROM employees
GROUP BY dept_id
HAVING COUNT(*) >= 3;
```

Una función de ventana calcula sobre filas relacionadas sin fusionarlas: `RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC)` clasifica dentro de cada departamento. `ROW_NUMBER` nunca da empates, `RANK` deja huecos tras los empates, `DENSE_RANK` no.

## Parte 3 — Uniones y subconsultas

| Unión | Conserva |
|---|---|
| `INNER JOIN` | Solo las filas que coinciden en ambos lados |
| `LEFT JOIN` | Todas las filas de la izquierda, con `NULL` donde nada coincide |
| `FULL JOIN` | Todas las filas de ambos lados |
| `CROSS JOIN` | Todos los pares de filas |

Una condición sobre la tabla derecha en `WHERE` vuelve a convertir un `LEFT JOIN` en una unión interna; póngala en `ON`. Una autounión da a cada empleado su responsable. `UNION` elimina duplicados, `UNION ALL` los conserva. `EXISTS` es más seguro que `NOT IN` cuando la subconsulta puede devolver `NULL`: un solo `NULL` hace que `NOT IN` no devuelva ninguna fila.

```sql
SELECT e.name, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;
```

## Parte 4 — Modificar datos y esquema

`INSERT INTO … VALUES`, `UPDATE … SET … WHERE`, `DELETE FROM … WHERE` — sin `WHERE`, cambian todas las filas. `CREATE TABLE` con las restricciones `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `REFERENCES` y `CHECK`; `ALTER TABLE` añade una columna. Una transacción agrupa cambios: `BEGIN`, y luego `COMMIT` o `ROLLBACK`. Un índice acelera las búsquedas en sus columnas y ralentiza las escrituras; un índice compuesto sobre `(a, b)` ayuda a un filtro sobre `a` pero no sobre `b` solo.

## Parte 5 — PostgreSQL

El cliente es `psql`: `\l` lista las bases, `\dt` las tablas, `\d employees` describe una, `\q` sale. PostgreSQL tiene `SERIAL` y columnas de identidad, `RETURNING` tras una escritura, `ILIKE` para comparar sin distinguir mayúsculas, `JSONB` con el operador `->>`, y `EXPLAIN ANALYZE` para mostrar y cronometrar un plan. `VACUUM` recupera el espacio que dejan las actualizaciones y los borrados. Los roles llevan los permisos: `GRANT SELECT ON employees TO reader`.

## Parte 6 — SQLite

SQLite es una biblioteca y un archivo; el shell es `sqlite3`, con `.tables`, `.schema`, `.mode column` y `.quit`. Los tipos son afinidades: una columna declarada `INTEGER` puede contener texto, salvo que la tabla sea `STRICT`. Las claves foráneas solo se comprueban tras `PRAGMA foreign_keys = ON`. `INTEGER PRIMARY KEY` es el identificador de fila. Un solo escritor a la vez; el registro anticipado, `PRAGMA journal_mode = WAL`, deja trabajar a los lectores durante una escritura.

## Parte 7 — MySQL

El cliente es `mysql -u user -p`, con `SHOW DATABASES`, `USE`, `SHOW TABLES` y `DESCRIBE`. MySQL escribe `AUTO_INCREMENT`, cita los nombres con acentos graves y acepta `LIMIT offset, count` además de la forma estándar. InnoDB es el motor con transacciones y claves foráneas. Cuidado con los valores por defecto: el juego de caracteres `utf8` solo admite tres bytes por carácter, así que use `utf8mb4`, y sin un modo SQL estricto MySQL puede truncar un valor en lugar de rechazarlo.

## Parte 8 — Buenas prácticas

- Pase los valores como parámetros, nunca pegándolos en la cadena SQL: así nacen las inyecciones.
- Pruebe un `UPDATE` o un `DELETE` ejecutando primero su `WHERE` en un `SELECT`, dentro de una transacción.
- Dé a cada tabla una clave primaria, y normalice hasta que cada dato se guarde una sola vez.
- Lea el plan con `EXPLAIN` antes de añadir un índice, y evite `SELECT *` en el código.
- Haga copias con la herramienta de la base — `pg_dump`, `mysqldump`, `.backup` — y pruebe la restauración.

## Fuentes

| Tema | Referencia gratuita |
|---|---|
| PostgreSQL | [Documentación de PostgreSQL](https://www.postgresql.org/docs/current/) |
| SQLite | [Documentación de SQLite](https://www.sqlite.org/docs.html) |
| MySQL | [Manual de referencia de MySQL](https://dev.mysql.com/doc/refman/8.4/en/) |
| Ejercicios y tutoriales | [SQLBolt](https://sqlbolt.com/) |
