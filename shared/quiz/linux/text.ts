/** Linux, text: grep, sed, awk, columns and lines, pipelines. */
import type { LinuxQuestion } from "./types";

const grep: LinuxQuestion[] = [
  {
    id: "lx-grep-01",
    q: ["`grep 'cat|dog' pets.txt` finds nothing, although both words are in the file. Why?", "`grep 'cat|dog' pets.txt` ne trouve rien, alors que les deux mots sont dans le fichier. Pourquoi ?", "`grep 'cat|dog' pets.txt` no encuentra nada, aunque las dos palabras están en el archivo. ¿Por qué?"],
    a: ["In a basic regular expression `|` is an ordinary character: use `grep -E 'cat|dog'`", "Dans une expression régulière de base, `|` est un caractère ordinaire : utiliser `grep -E 'cat|dog'`", "En una expresión regular básica `|` es un carácter normal: usar `grep -E 'cat|dog'`"],
    w: [
      ["The quotes stop `grep` from reading the pattern", "Les guillemets empêchent `grep` de lire le motif", "Las comillas impiden que `grep` lea el patrón"],
      ["`grep` takes only one word at a time", "`grep` ne prend qu'un mot à la fois", "`grep` solo admite una palabra a la vez"],
      ["The pipe sends the result to a program named `dog`", "Le tube envoie le résultat à un programme nommé `dog`", "La tubería envía el resultado a un programa llamado `dog`"],
    ],
    e: [
      "Inside single quotes the shell sees no pipe. GNU grep also accepts `cat\\|dog` in basic syntax; `grep -e cat -e dog` works everywhere.",
      "Entre apostrophes, le shell ne voit pas de tube. GNU grep accepte aussi `cat\\|dog` en syntaxe de base ; `grep -e cat -e dog` marche partout.",
      "Entre comillas simples el shell no ve ninguna tubería. GNU grep también acepta `cat\\|dog` en sintaxis básica; `grep -e cat -e dog` funciona en todas partes.",
    ],
  },
  {
    id: "lx-grep-02",
    q: ["Which option makes `grep` print the lines that do NOT match?", "Quelle option fait afficher par `grep` les lignes qui ne correspondent PAS ?", "¿Qué opción hace que `grep` muestre las líneas que NO coinciden?"],
    a: ["`-v`", "`-v`", "`-v`"],
    w: [["`-n`", "`-n`", "`-n`"], ["`-x`", "`-x`", "`-x`"], ["`-i`", "`-i`", "`-i`"], ["`-o`", "`-o`", "`-o`"]],
    e: [
      "`-v` inverts the match. `-n` adds line numbers, `-x` matches whole lines, `-i` ignores case, `-o` prints only the matching part.",
      "`-v` inverse la correspondance. `-n` ajoute les numéros de ligne, `-x` compare des lignes entières, `-i` ignore la casse, `-o` n'affiche que la partie trouvée.",
      "`-v` invierte la coincidencia. `-n` añade números de línea, `-x` compara líneas enteras, `-i` ignora mayúsculas, `-o` muestra solo la parte encontrada.",
    ],
  },
  {
    id: "lx-grep-03",
    q: ["A line contains 'error' three times. What does `grep -c error` count for it?", "Une ligne contient trois fois « error ». Combien `grep -c error` compte-t-il pour elle ?", "Una línea contiene tres veces «error». ¿Cuánto cuenta `grep -c error` para ella?"],
    a: ["1: `-c` counts matching lines", "1 : `-c` compte les lignes qui correspondent", "1: `-c` cuenta las líneas que coinciden"],
    w: [
      ["3: `-c` counts occurrences", "3 : `-c` compte les occurrences", "3: `-c` cuenta las apariciones"],
      ["The number of characters of the line", "Le nombre de caractères de la ligne", "El número de caracteres de la línea"],
      ["0, unless `-w` is given", "0, sauf avec `-w`", "0, salvo con `-w`"],
    ],
    e: [
      "To count occurrences: `grep -o error file | wc -l`, since `-o` prints each match on its own line.",
      "Pour compter les occurrences : `grep -o error file | wc -l`, car `-o` affiche chaque correspondance sur sa propre ligne.",
      "Para contar apariciones: `grep -o error file | wc -l`, porque `-o` muestra cada coincidencia en su propia línea.",
    ],
  },
  {
    id: "lx-grep-04",
    q: ["Which command lists only the names of the files under `src/` that contain `TODO`?", "Quelle commande liste seulement les noms des fichiers sous `src/` qui contiennent `TODO` ?", "¿Qué comando lista solo los nombres de los archivos bajo `src/` que contienen `TODO`?"],
    a: ["`grep -rl TODO src/`", "`grep -rl TODO src/`", "`grep -rl TODO src/`"],
    w: [["`grep -rc TODO src/`", "`grep -rc TODO src/`", "`grep -rc TODO src/`"], ["`grep -L TODO src/*`", "`grep -L TODO src/*`", "`grep -L TODO src/*`"], ["`grep -rn TODO src/`", "`grep -rn TODO src/`", "`grep -rn TODO src/`"]],
    e: [
      "`-r` recurses, `-l` prints file names with a match; `-L` prints those without one; `-c` prints a count for every file, zero included.",
      "`-r` descend récursivement, `-l` affiche les noms des fichiers où il y a une correspondance ; `-L` ceux où il n'y en a pas ; `-c` un compte pour chaque fichier, zéro compris.",
      "`-r` recorre recursivamente, `-l` muestra los nombres de archivos con coincidencia; `-L` los que no la tienen; `-c` un recuento por archivo, cero incluido.",
    ],
  },
  {
    id: "lx-grep-05",
    q: ["Compared with `grep is notes.txt`, what does `grep -w is notes.txt` match?", "Par rapport à `grep is notes.txt`, que trouve `grep -w is notes.txt` ?", "En comparación con `grep is notes.txt`, ¿qué encuentra `grep -w is notes.txt`?"],
    a: ["Only 'is' as a whole word, not inside 'this' or 'island'", "Seulement « is » comme mot entier, pas dans « this » ou « island »", "Solo «is» como palabra completa, no dentro de «this» o «island»"],
    w: [
      ["Only lines that are exactly 'is'", "Seulement les lignes qui valent exactement « is »", "Solo las líneas que son exactamente «is»"],
      ["'is' in any case: 'IS', 'Is'", "« is » dans toutes les casses : « IS », « Is »", "«is» en cualquier combinación de mayúsculas: «IS», «Is»"],
      ["Only lines starting with 'is'", "Seulement les lignes qui commencent par « is »", "Solo las líneas que empiezan por «is»"],
    ],
    e: [
      "Whole lines are `-x`, case-insensitive is `-i`, a start of line is the pattern `^is`.",
      "Les lignes entières, c'est `-x` ; sans casse, `-i` ; un début de ligne, le motif `^is`.",
      "Las líneas enteras son `-x`; sin distinguir mayúsculas, `-i`; un comienzo de línea, el patrón `^is`.",
    ],
  },
  {
    id: "lx-grep-06",
    q: ["How do you show each match of 'Traceback' in a log with the 5 lines that follow it?", "Comment afficher chaque « Traceback » d'un journal avec les 5 lignes qui le suivent ?", "¿Cómo mostrar cada «Traceback» de un registro con las 5 líneas que lo siguen?"],
    a: ["`grep -A 5 Traceback app.log`", "`grep -A 5 Traceback app.log`", "`grep -A 5 Traceback app.log`"],
    w: [["`grep -B 5 Traceback app.log`", "`grep -B 5 Traceback app.log`", "`grep -B 5 Traceback app.log`"], ["`grep -m 5 Traceback app.log`", "`grep -m 5 Traceback app.log`", "`grep -m 5 Traceback app.log`"], ["`grep -n 5 Traceback app.log`", "`grep -n 5 Traceback app.log`", "`grep -n 5 Traceback app.log`"]],
    e: [
      "`-A` after, `-B` before, `-C` both. `-m 5` stops after 5 matching lines.",
      "`-A` après, `-B` avant, `-C` les deux. `-m 5` s'arrête après 5 lignes trouvées.",
      "`-A` después, `-B` antes, `-C` ambas. `-m 5` se detiene tras 5 líneas encontradas.",
    ],
  },
];

const sed: LinuxQuestion[] = [
  {
    id: "lx-sed-01",
    q: ["What does `sed 's/cat/dog/' pets.txt` change?", "Que change `sed 's/cat/dog/' pets.txt` ?", "¿Qué cambia `sed 's/cat/dog/' pets.txt`?"],
    a: ["It prints the file with the first 'cat' of each line replaced; the file is unchanged", "Il affiche le fichier avec le premier « cat » de chaque ligne remplacé ; le fichier ne change pas", "Muestra el archivo con el primer «cat» de cada línea sustituido; el archivo no cambia"],
    w: [
      ["It replaces every 'cat' in the file itself", "Il remplace tous les « cat » dans le fichier lui-même", "Sustituye todos los «cat» en el propio archivo"],
      ["It replaces only the first 'cat' of the whole file", "Il ne remplace que le premier « cat » du fichier entier", "Solo sustituye el primer «cat» del archivo entero"],
      ["It prints only the lines that contained 'cat'", "Il n'affiche que les lignes qui contenaient « cat »", "Solo muestra las líneas que contenían «cat»"],
    ],
    e: [
      "Add `g` for every occurrence on a line (`s/cat/dog/g`), and `-i` to write the file back.",
      "Ajouter `g` pour toutes les occurrences d'une ligne (`s/cat/dog/g`), et `-i` pour réécrire le fichier.",
      "Añadir `g` para todas las apariciones de una línea (`s/cat/dog/g`), y `-i` para reescribir el archivo.",
    ],
  },
  {
    id: "lx-sed-02",
    q: ["How do you print only lines 10 to 20 of a file with `sed`?", "Comment n'afficher que les lignes 10 à 20 d'un fichier avec `sed` ?", "¿Cómo mostrar solo las líneas 10 a 20 de un archivo con `sed`?"],
    a: ["`sed -n '10,20p' file`", "`sed -n '10,20p' file`", "`sed -n '10,20p' file`"],
    w: [["`sed '10,20p' file`", "`sed '10,20p' file`", "`sed '10,20p' file`"], ["`sed '10,20d' file`", "`sed '10,20d' file`", "`sed '10,20d' file`"], ["`sed -n '10-20' file`", "`sed -n '10-20' file`", "`sed -n '10-20' file`"]],
    e: [
      "`-n` stops the automatic printing; without it, lines 10–20 would appear twice among all the others. `d` deletes them instead.",
      "`-n` supprime l'affichage automatique ; sans lui, les lignes 10 à 20 apparaîtraient deux fois parmi toutes les autres. `d` les supprime au contraire.",
      "`-n` suprime la impresión automática; sin ella, las líneas 10 a 20 aparecerían dos veces entre todas las demás. `d` las elimina en cambio.",
    ],
  },
  {
    id: "lx-sed-03",
    q: ["Why write `sed 's|/usr/local|/opt|g'` with `|` instead of `/`?", "Pourquoi écrire `sed 's|/usr/local|/opt|g'` avec `|` au lieu de `/` ?", "¿Por qué escribir `sed 's|/usr/local|/opt|g'` con `|` en vez de `/`?"],
    a: ["Any character can delimit the command; with `|`, the slashes of the paths need no escaping", "N'importe quel caractère peut délimiter la commande ; avec `|`, les barres des chemins n'ont pas à être échappées", "Cualquier carácter puede delimitar la orden; con `|`, las barras de las rutas no necesitan escaparse"],
    w: [
      ["`|` makes the replacement global", "`|` rend le remplacement global", "`|` hace global la sustitución"],
      ["`|` sends the result to the next command", "`|` envoie le résultat à la commande suivante", "`|` envía el resultado a la orden siguiente"],
      ["Paths can only be replaced with `|`", "Les chemins ne se remplacent qu'avec `|`", "Las rutas solo se sustituyen con `|`"],
    ],
    e: [
      "With slashes it would read `s/\\/usr\\/local/\\/opt/g`. The `g` makes it global; the quotes hide the `|` from the shell.",
      "Avec des barres, il faudrait écrire `s/\\/usr\\/local/\\/opt/g`. C'est `g` qui rend le remplacement global ; les apostrophes cachent le `|` au shell.",
      "Con barras habría que escribir `s/\\/usr\\/local/\\/opt/g`. Es `g` lo que hace global la sustitución; las comillas ocultan el `|` al shell.",
    ],
  },
  {
    id: "lx-sed-04",
    q: ["What does `sed -i.bak '/^#/d' app.conf` do?", "Que fait `sed -i.bak '/^#/d' app.conf` ?", "¿Qué hace `sed -i.bak '/^#/d' app.conf`?"],
    a: ["Deletes the lines starting with `#` in the file, keeping the original as `app.conf.bak`", "Supprime dans le fichier les lignes qui commencent par `#`, en gardant l'original en `app.conf.bak`", "Elimina del archivo las líneas que empiezan por `#`, conservando el original como `app.conf.bak`"],
    w: [
      ["Comments out every line", "Met toutes les lignes en commentaire", "Comenta todas las líneas"],
      ["Prints the comment lines into `app.conf.bak`", "Écrit les lignes de commentaire dans `app.conf.bak`", "Escribe las líneas de comentario en `app.conf.bak`"],
      ["Deletes every `#` character, keeping the lines", "Supprime chaque caractère `#`, en gardant les lignes", "Elimina cada carácter `#`, conservando las líneas"],
    ],
    e: [
      "`/^#/` selects the lines, `d` deletes them; `-i` edits in place, here with a backup suffix.",
      "`/^#/` choisit les lignes, `d` les supprime ; `-i` modifie sur place, ici avec un suffixe de sauvegarde.",
      "`/^#/` elige las líneas, `d` las elimina; `-i` edita en el sitio, aquí con un sufijo de copia.",
    ],
  },
  {
    id: "lx-sed-05",
    q: ["`sed -i 's/a/b/' f` works on Linux but fails on macOS. Why?", "`sed -i 's/a/b/' f` marche sous Linux mais échoue sous macOS. Pourquoi ?", "`sed -i 's/a/b/' f` funciona en Linux pero falla en macOS. ¿Por qué?"],
    a: ["BSD `sed` needs a backup suffix after `-i`, possibly empty: `sed -i '' 's/a/b/' f`", "Le `sed` BSD veut un suffixe de sauvegarde après `-i`, éventuellement vide : `sed -i '' 's/a/b/' f`", "El `sed` de BSD exige un sufijo de copia tras `-i`, quizá vacío: `sed -i '' 's/a/b/' f`"],
    w: [
      ["macOS has no `sed`", "macOS n'a pas de `sed`", "macOS no tiene `sed`"],
      ["macOS files are read-only", "Les fichiers de macOS sont en lecture seule", "Los archivos de macOS son de solo lectura"],
      ["The quotes must be double on macOS", "Les guillemets doivent être doubles sous macOS", "Las comillas deben ser dobles en macOS"],
    ],
    e: [
      "macOS ships BSD tools. GNU sed is available with `brew install gnu-sed`, as `gsed`.",
      "macOS fournit les outils BSD. Le sed GNU s'installe avec `brew install gnu-sed`, sous le nom `gsed`.",
      "macOS trae las herramientas BSD. El sed de GNU se instala con `brew install gnu-sed`, con el nombre `gsed`.",
    ],
  },
];

const awk: LinuxQuestion[] = [
  {
    id: "lx-awk-01",
    q: ["What does `awk -F: '{print $1}' /etc/passwd` print?", "Qu'affiche `awk -F: '{print $1}' /etc/passwd` ?", "¿Qué muestra `awk -F: '{print $1}' /etc/passwd`?"],
    a: ["The user names: the first field of each line, fields separated by `:`", "Les noms d'utilisateur : le premier champ de chaque ligne, champs séparés par `:`", "Los nombres de usuario: el primer campo de cada línea, con campos separados por `:`"],
    w: [
      ["The value of the shell variable `1`", "La valeur de la variable du shell `1`", "El valor de la variable del shell `1`"],
      ["The first line of the file", "La première ligne du fichier", "La primera línea del archivo"],
      ["The first character of each line", "Le premier caractère de chaque ligne", "El primer carácter de cada línea"],
    ],
    e: [
      "In single quotes, the dollar is awk's own: `$1` is field 1, `$0` the whole line, `$NF` the last field.",
      "Entre apostrophes, le dollar est celui d'awk : `$1` est le champ 1, `$0` la ligne entière, `$NF` le dernier champ.",
      "Entre comillas simples, el dólar es el de awk: `$1` es el campo 1, `$0` la línea entera, `$NF` el último campo.",
    ],
  },
  {
    id: "lx-awk-02",
    q: ["What does `awk '{s += $3} END {print s}' sales.txt` print?", "Qu'affiche `awk '{s += $3} END {print s}' sales.txt` ?", "¿Qué muestra `awk '{s += $3} END {print s}' sales.txt`?"],
    a: ["The sum of the third column", "La somme de la troisième colonne", "La suma de la tercera columna"],
    w: [
      ["The third line", "La troisième ligne", "La tercera línea"],
      ["The number of lines", "Le nombre de lignes", "El número de líneas"],
      ["Each running total, line by line", "Chaque total intermédiaire, ligne après ligne", "Cada total parcial, línea a línea"],
    ],
    e: [
      "The first block runs for every line; `END` runs once after the last. Variables start at zero (or empty).",
      "Le premier bloc s'exécute pour chaque ligne ; `END` une fois après la dernière. Les variables partent de zéro (ou vides).",
      "El primer bloque se ejecuta en cada línea; `END` una vez tras la última. Las variables empiezan en cero (o vacías).",
    ],
  },
  {
    id: "lx-awk-03",
    q: ["Which command prints only line 10 of a file?", "Quelle commande n'affiche que la ligne 10 d'un fichier ?", "¿Qué comando muestra solo la línea 10 de un archivo?"],
    a: ["`awk 'NR == 10' file`", "`awk 'NR == 10' file`", "`awk 'NR == 10' file`"],
    w: [["`awk '$10' file`", "`awk '$10' file`", "`awk '$10' file`"], ["`awk 'NF == 10' file`", "`awk 'NF == 10' file`", "`awk 'NF == 10' file`"], ["`head -10 file`", "`head -10 file`", "`head -10 file`"]],
    e: [
      "`NR` is the line number, `NF` the number of fields; `$10` is field 10. `head -10` prints the first ten lines. (`sed -n 10p` works too.)",
      "`NR` est le numéro de ligne, `NF` le nombre de champs ; `$10` est le champ 10. `head -10` affiche les dix premières lignes. (`sed -n 10p` marche aussi.)",
      "`NR` es el número de línea, `NF` el número de campos; `$10` es el campo 10. `head -10` muestra las diez primeras líneas. (`sed -n 10p` también sirve.)",
    ],
  },
  {
    id: "lx-awk-04",
    q: ["What does `awk '$3 > 100' orders.txt` print?", "Qu'affiche `awk '$3 > 100' orders.txt` ?", "¿Qué muestra `awk '$3 > 100' orders.txt`?"],
    a: ["The lines whose third field is greater than 100", "Les lignes dont le troisième champ est supérieur à 100", "Las líneas cuyo tercer campo es mayor que 100"],
    w: [
      ["The third field of every line, written to a file named `100`", "Le troisième champ de chaque ligne, écrit dans un fichier nommé `100`", "El tercer campo de cada línea, escrito en un archivo llamado `100`"],
      ["The first 100 lines", "Les 100 premières lignes", "Las 100 primeras líneas"],
      ["Nothing: a pattern needs an action", "Rien : un motif a besoin d'une action", "Nada: un patrón necesita una acción"],
    ],
    e: [
      "A pattern without an action prints the matching lines (`{print}` is the default). `>` inside a pattern is a comparison, not a redirection.",
      "Un motif sans action affiche les lignes qui le vérifient (`{print}` par défaut). `>` dans un motif est une comparaison, pas une redirection.",
      "Un patrón sin acción muestra las líneas que lo cumplen (`{print}` por defecto). `>` dentro de un patrón es una comparación, no una redirección.",
    ],
  },
];

const columns: LinuxQuestion[] = [
  {
    id: "lx-col-01",
    q: ["Why does `sort names.txt | uniq -c` need the `sort`?", "Pourquoi `sort names.txt | uniq -c` a-t-il besoin du `sort` ?", "¿Por qué `sort names.txt | uniq -c` necesita el `sort`?"],
    a: ["`uniq` only merges duplicates that are next to each other", "`uniq` ne fusionne que les doublons qui se suivent", "`uniq` solo une los duplicados que están seguidos"],
    w: [
      ["`uniq` cannot read files", "`uniq` ne sait pas lire les fichiers", "`uniq` no sabe leer archivos"],
      ["`uniq` stops with an error on unsorted input", "`uniq` s'arrête sur une erreur si l'entrée n'est pas triée", "`uniq` se detiene con un error si la entrada no está ordenada"],
      ["It does not: the result is the same without it", "Il n'en a pas besoin : le résultat est le même sans", "No lo necesita: el resultado es el mismo sin él"],
    ],
    e: [
      "The usual frequency count is `sort | uniq -c | sort -rn`. `sort -u` alone removes duplicates.",
      "Le comptage de fréquences habituel est `sort | uniq -c | sort -rn`. `sort -u` seul supprime les doublons.",
      "El recuento de frecuencias habitual es `sort | uniq -c | sort -rn`. `sort -u` solo elimina duplicados.",
    ],
  },
  {
    id: "lx-col-02",
    q: ["`sort` puts 10 before 9. Why, and what fixes it?", "`sort` met 10 avant 9. Pourquoi, et qu'est-ce qui corrige cela ?", "`sort` pone 10 antes que 9. ¿Por qué, y qué lo corrige?"],
    a: ["It compares text character by character; `sort -n` compares numbers", "Il compare du texte caractère par caractère ; `sort -n` compare des nombres", "Compara texto carácter a carácter; `sort -n` compara números"],
    w: [
      ["It sorts by length; `sort -l` fixes it", "Il trie par longueur ; `sort -l` corrige", "Ordena por longitud; `sort -l` lo corrige"],
      ["It sorts backwards; `sort -r` fixes it", "Il trie à l'envers ; `sort -r` corrige", "Ordena al revés; `sort -r` lo corrige"],
      ["The file is not in UTF-8", "Le fichier n'est pas en UTF-8", "El archivo no está en UTF-8"],
    ],
    e: [
      "'1' comes before '9' as text. `-h` sorts human sizes (2K, 1G), `-V` version numbers (1.9 before 1.10).",
      "« 1 » vient avant « 9 » en texte. `-h` trie les tailles lisibles (2K, 1G), `-V` les numéros de version (1.9 avant 1.10).",
      "«1» va antes que «9» como texto. `-h` ordena tamaños legibles (2K, 1G), `-V` números de versión (1.9 antes que 1.10).",
    ],
  },
  {
    id: "lx-col-03",
    q: ["What does `cut -d, -f2,4 data.csv` print?", "Qu'affiche `cut -d, -f2,4 data.csv` ?", "¿Qué muestra `cut -d, -f2,4 data.csv`?"],
    a: ["Fields 2 and 4 of each line, fields separated by commas", "Les champs 2 et 4 de chaque ligne, champs séparés par des virgules", "Los campos 2 y 4 de cada línea, con campos separados por comas"],
    w: [
      ["Fields 2 to 4", "Les champs 2 à 4", "Los campos 2 a 4"],
      ["Characters 2 and 4", "Les caractères 2 et 4", "Los caracteres 2 y 4"],
      ["Lines 2 and 4", "Les lignes 2 et 4", "Las líneas 2 y 4"],
    ],
    e: [
      "A range is `-f2-4`; characters are `-c`. `cut` does not understand quoted commas: for real CSV, use a CSV-aware tool.",
      "Une plage s'écrit `-f2-4` ; les caractères, c'est `-c`. `cut` ne comprend pas les virgules entre guillemets : pour du vrai CSV, prendre un outil qui connaît le CSV.",
      "Un rango se escribe `-f2-4`; los caracteres son `-c`. `cut` no entiende las comas entre comillas: para CSV de verdad, usar una herramienta que conozca el CSV.",
    ],
  },
  {
    id: "lx-col-04",
    q: ["What does `tail -n +2 data.csv` print?", "Qu'affiche `tail -n +2 data.csv` ?", "¿Qué muestra `tail -n +2 data.csv`?"],
    a: ["Everything from line 2 on: the file without its header line", "Tout à partir de la ligne 2 : le fichier sans sa ligne d'en-tête", "Todo a partir de la línea 2: el archivo sin su línea de cabecera"],
    w: [
      ["The last two lines", "Les deux dernières lignes", "Las dos últimas líneas"],
      ["The second line only", "La deuxième ligne seulement", "Solo la segunda línea"],
      ["The last line, twice", "La dernière ligne, deux fois", "La última línea, dos veces"],
    ],
    e: [
      "With `+`, the count starts from the top. `tail -n 2` gives the last two lines; `tail -f` keeps following a growing file.",
      "Avec `+`, on compte depuis le début. `tail -n 2` donne les deux dernières lignes ; `tail -f` suit un fichier qui grandit.",
      "Con `+`, se cuenta desde el principio. `tail -n 2` da las dos últimas líneas; `tail -f` sigue un archivo que crece.",
    ],
  },
  {
    id: "lx-col-05",
    q: ["What exactly does `wc -l` count?", "Que compte exactement `wc -l` ?", "¿Qué cuenta exactamente `wc -l`?"],
    a: ["Newline characters: a last line without one is not counted", "Les caractères de fin de ligne : une dernière ligne sans fin de ligne n'est pas comptée", "Los caracteres de salto de línea: una última línea sin él no se cuenta"],
    w: [
      ["Lines that contain text", "Les lignes qui contiennent du texte", "Las líneas que contienen texto"],
      ["Sentences", "Les phrases", "Las frases"],
      ["Lines, empty ones excluded", "Les lignes, sans les vides", "Las líneas, sin las vacías"],
    ],
    e: [
      "So a file written without a final newline reports one line fewer. `wc -w` counts words, `wc -c` bytes, `wc -m` characters.",
      "Un fichier écrit sans fin de ligne finale annonce donc une ligne de moins. `wc -w` compte les mots, `wc -c` les octets, `wc -m` les caractères.",
      "Así, un archivo escrito sin salto de línea final indica una línea menos. `wc -w` cuenta palabras, `wc -c` bytes, `wc -m` caracteres.",
    ],
  },
  {
    id: "lx-col-06",
    q: ["Why does `tr 'a-z' 'A-Z' notes.txt` fail?", "Pourquoi `tr 'a-z' 'A-Z' notes.txt` échoue-t-il ?", "¿Por qué falla `tr 'a-z' 'A-Z' notes.txt`?"],
    a: ["`tr` reads only its standard input: `tr 'a-z' 'A-Z' < notes.txt`", "`tr` ne lit que son entrée standard : `tr 'a-z' 'A-Z' < notes.txt`", "`tr` solo lee su entrada estándar: `tr 'a-z' 'A-Z' < notes.txt`"],
    w: [
      ["The ranges must be written `[a-z]`", "Les plages doivent s'écrire `[a-z]`", "Los rangos deben escribirse `[a-z]`"],
      ["`tr` translates words, not letters", "`tr` traduit des mots, pas des lettres", "`tr` traduce palabras, no letras"],
      ["Upper case needs `-u`", "Les majuscules demandent `-u`", "Las mayúsculas requieren `-u`"],
    ],
    e: [
      "It answers 'extra operand'. `tr` maps characters one to one; `tr -d` deletes them, `tr -s` squeezes repeats.",
      "Il répond « extra operand ». `tr` remplace des caractères un pour un ; `tr -d` les supprime, `tr -s` fusionne les répétitions.",
      "Responde «extra operand». `tr` sustituye caracteres uno por uno; `tr -d` los elimina, `tr -s` junta las repeticiones.",
    ],
  },
];

const pipelines: LinuxQuestion[] = [
  {
    id: "lx-pipe-01",
    q: ["Why does `sudo echo 'Hello' > /etc/motd` say 'Permission denied'?", "Pourquoi `sudo echo 'Hello' > /etc/motd` répond-il « Permission denied » ?", "¿Por qué `sudo echo 'Hello' > /etc/motd` responde «Permission denied»?"],
    a: ["Your own shell opens the file for `>`, before `sudo` runs: use `echo 'Hello' | sudo tee /etc/motd`", "C'est votre propre shell qui ouvre le fichier pour `>`, avant que `sudo` ne s'exécute : utiliser `echo 'Hello' | sudo tee /etc/motd`", "Es su propio shell el que abre el archivo para `>`, antes de que se ejecute `sudo`: usar `echo 'Hello' | sudo tee /etc/motd`"],
    w: [
      ["`echo` cannot be run with `sudo`", "`echo` ne peut pas être lancé avec `sudo`", "`echo` no se puede ejecutar con `sudo`"],
      ["`/etc/motd` is read-only even for root", "`/etc/motd` est en lecture seule même pour root", "`/etc/motd` es de solo lectura incluso para root"],
      ["The password was not asked", "Le mot de passe n'a pas été demandé", "No se pidió la contraseña"],
    ],
    e: [
      "Only `echo` gets root's rights. `tee` writes its input to the file (and to the screen); `tee -a` appends.",
      "Seul `echo` reçoit les droits de root. `tee` écrit son entrée dans le fichier (et à l'écran) ; `tee -a` ajoute à la fin.",
      "Solo `echo` recibe los derechos de root. `tee` escribe su entrada en el archivo (y en pantalla); `tee -a` añade al final.",
    ],
  },
  {
    id: "lx-pipe-02",
    q: ["`find . -name '*.tmp' | xargs rm` fails on 'my file.tmp'. What is the robust form?", "`find . -name '*.tmp' | xargs rm` échoue sur « my file.tmp ». Quelle est la forme robuste ?", "`find . -name '*.tmp' | xargs rm` falla con «my file.tmp». ¿Cuál es la forma robusta?"],
    a: ["`find . -name '*.tmp' -print0 | xargs -0 rm`", "`find . -name '*.tmp' -print0 | xargs -0 rm`", "`find . -name '*.tmp' -print0 | xargs -0 rm`"],
    w: [
      ["`find . -name '*.tmp' | xargs 'rm'`", "`find . -name '*.tmp' | xargs 'rm'`", "`find . -name '*.tmp' | xargs 'rm'`"],
      ["`find . -name '*.tmp' | xargs -n 1 rm`", "`find . -name '*.tmp' | xargs -n 1 rm`", "`find . -name '*.tmp' | xargs -n 1 rm`"],
      ["`find . -name '*.tmp' | rm`", "`find . -name '*.tmp' | rm`", "`find . -name '*.tmp' | rm`"],
    ],
    e: [
      "By default `xargs` splits on blanks. With NUL separators names may contain anything. (`find -delete` avoids the pipe altogether.)",
      "Par défaut, `xargs` coupe sur les blancs. Avec des séparateurs NUL, les noms peuvent tout contenir. (`find -delete` évite carrément le tube.)",
      "Por defecto `xargs` corta por los espacios. Con separadores NUL, los nombres pueden contener cualquier cosa. (`find -delete` evita la tubería del todo.)",
    ],
  },
  {
    id: "lx-pipe-03",
    q: ["What does `comm -12 a.txt b.txt` print, the two files being sorted?", "Qu'affiche `comm -12 a.txt b.txt`, les deux fichiers étant triés ?", "¿Qué muestra `comm -12 a.txt b.txt`, estando ordenados los dos archivos?"],
    a: ["The lines present in both files", "Les lignes présentes dans les deux fichiers", "Las líneas presentes en los dos archivos"],
    w: [
      ["Lines 1 and 2 of each file", "Les lignes 1 et 2 de chaque fichier", "Las líneas 1 y 2 de cada archivo"],
      ["The lines only in `a.txt`", "Les lignes qui ne sont que dans `a.txt`", "Las líneas que solo están en `a.txt`"],
      ["The differences, as `diff` would", "Les différences, comme `diff`", "Las diferencias, como `diff`"],
    ],
    e: [
      "`comm` prints three columns: only in the first file, only in the second, in both; `-12` hides the first two.",
      "`comm` affiche trois colonnes : seulement dans le premier fichier, seulement dans le second, dans les deux ; `-12` masque les deux premières.",
      "`comm` muestra tres columnas: solo en el primer archivo, solo en el segundo, en ambos; `-12` oculta las dos primeras.",
    ],
  },
  {
    id: "lx-pipe-04",
    q: ["What does `xargs -P 4 -n 1 gzip` do with a list of files on its input?", "Que fait `xargs -P 4 -n 1 gzip` d'une liste de fichiers reçue en entrée ?", "¿Qué hace `xargs -P 4 -n 1 gzip` con una lista de archivos recibida en su entrada?"],
    a: ["Compresses them one per `gzip`, four at a time in parallel", "Les compresse un par `gzip`, quatre à la fois en parallèle", "Los comprime uno por `gzip`, cuatro a la vez en paralelo"],
    w: [
      ["Compresses the first four files only", "Ne compresse que les quatre premiers fichiers", "Solo comprime los cuatro primeros archivos"],
      ["Splits each file into four parts", "Coupe chaque fichier en quatre parties", "Divide cada archivo en cuatro partes"],
      ["Compresses them at level 4", "Les compresse au niveau 4", "Los comprime al nivel 4"],
    ],
    e: [
      "`-n 1` gives one argument per command, `-P 4` runs four commands at once.",
      "`-n 1` donne un argument par commande, `-P 4` lance quatre commandes à la fois.",
      "`-n 1` da un argumento por orden, `-P 4` ejecuta cuatro órdenes a la vez.",
    ],
  },
  {
    id: "lx-pipe-05",
    q: ["In `cmd1 | cmd2`, what does `cmd2` receive?", "Dans `cmd1 | cmd2`, que reçoit `cmd2` ?", "En `cmd1 | cmd2`, ¿qué recibe `cmd2`?"],
    a: ["The standard output of `cmd1`, on its standard input, while both run", "La sortie standard de `cmd1`, sur son entrée standard, pendant que les deux tournent", "La salida estándar de `cmd1`, en su entrada estándar, mientras ambas se ejecutan"],
    w: [
      ["Both the output and the error output of `cmd1`", "La sortie et la sortie d'erreur de `cmd1`", "La salida y la salida de errores de `cmd1`"],
      ["The output of `cmd1` as arguments", "La sortie de `cmd1` comme arguments", "La salida de `cmd1` como argumentos"],
      ["The output of `cmd1` once it has finished", "La sortie de `cmd1` une fois qu'il a fini", "La salida de `cmd1` una vez terminada"],
    ],
    e: [
      "Errors still go to the screen unless `2>&1` or `|&`. Turning output into arguments is the job of `xargs`.",
      "Les erreurs vont toujours à l'écran, sauf avec `2>&1` ou `|&`. Transformer une sortie en arguments, c'est le rôle de `xargs`.",
      "Los errores siguen yendo a la pantalla, salvo con `2>&1` o `|&`. Convertir una salida en argumentos es tarea de `xargs`.",
    ],
  },
];

export const text = { grep, sed, awk, columns, pipelines };
