/** Linux, bash scripting: tests, loops, functions, arguments, arrays (6.14.0). */
import type { LinuxQuestion } from "./types";

const tests: LinuxQuestion[] = [
  {
    id: "lx-test-01",
    q: ["With `x` empty, `[ $x = yes ]` fails with 'unary operator expected'. Why?", "Avec `x` vide, `[ $x = yes ]` échoue avec « unary operator expected ». Pourquoi ?", "Con `x` vacía, `[ $x = yes ]` falla con «unary operator expected». ¿Por qué?"],
    a: ["Unquoted, the empty variable disappears and `[` sees `= yes`: write `[ \"$x\" = yes ]`", "Sans guillemets, la variable vide disparaît et `[` voit `= yes` : écrire `[ \"$x\" = yes ]`", "Sin comillas, la variable vacía desaparece y `[` ve `= yes`: escribir `[ \"$x\" = yes ]`"],
    w: [
      ["Strings are compared with `==` only", "Les chaînes ne se comparent qu'avec `==`", "Las cadenas solo se comparan con `==`"],
      ["`x` must be exported first", "`x` doit d'abord être exportée", "`x` debe exportarse primero"],
      ["Strings need `-eq`", "Les chaînes demandent `-eq`", "Las cadenas necesitan `-eq`"],
    ],
    e: [
      "`[` is an ordinary command: its arguments are split before it runs. Inside `[[ ]]` bash does not split, so `[[ $x = yes ]]` works.",
      "`[` est une commande ordinaire : ses arguments sont découpés avant qu'elle s'exécute. Dans `[[ ]]`, bash ne découpe pas, et `[[ $x = yes ]]` marche.",
      "`[` es una orden normal: sus argumentos se dividen antes de ejecutarla. Dentro de `[[ ]]` bash no divide, así que `[[ $x = yes ]]` funciona.",
    ],
  },
  {
    id: "lx-test-02",
    q: ["With `a=07` and `b=7`, which test is true?", "Avec `a=07` et `b=7`, quel test est vrai ?", "Con `a=07` y `b=7`, ¿qué prueba es verdadera?"],
    a: ["`[ \"$a\" -eq \"$b\" ]`", "`[ \"$a\" -eq \"$b\" ]`", "`[ \"$a\" -eq \"$b\" ]`"],
    w: [["`[ \"$a\" = \"$b\" ]`", "`[ \"$a\" = \"$b\" ]`", "`[ \"$a\" = \"$b\" ]`"], ["`[ \"$a\" == \"$b\" ]`", "`[ \"$a\" == \"$b\" ]`", "`[ \"$a\" == \"$b\" ]`"], ["`[[ $a == $b ]]`", "`[[ $a == $b ]]`", "`[[ $a == $b ]]`"]],
    e: [
      "`-eq`, `-lt`, `-gt` compare integers: 07 is 7. `=` and `==` compare strings, character by character; in `[[ ]]`, `==` matches a pattern, still as text. For arithmetic: `(( a == b ))`.",
      "`-eq`, `-lt`, `-gt` comparent des entiers : 07 vaut 7. `=` et `==` comparent des chaînes, caractère par caractère ; dans `[[ ]]`, `==` compare à un motif, toujours comme du texte. Pour l'arithmétique : `(( a == b ))`.",
      "`-eq`, `-lt`, `-gt` comparan enteros: 07 vale 7. `=` y `==` comparan cadenas, carácter a carácter; en `[[ ]]`, `==` compara con un patrón, siempre como texto. Para la aritmética: `(( a == b ))`.",
    ],
  },
  {
    id: "lx-test-03",
    q: ["When is `[[ $f == *.log ]]` true?", "Quand `[[ $f == *.log ]]` est-il vrai ?", "¿Cuándo es verdadera `[[ $f == *.log ]]`?"],
    a: ["When the string in `f` ends in `.log`, whether or not such a file exists", "Quand la chaîne contenue dans `f` finit par `.log`, qu'un tel fichier existe ou non", "Cuando la cadena de `f` termina en `.log`, exista o no tal archivo"],
    w: [
      ["When a `.log` file exists in the directory", "Quand un fichier `.log` existe dans le répertoire", "Cuando existe un archivo `.log` en el directorio"],
      ["Only when `f` is literally `*.log`", "Seulement quand `f` vaut littéralement `*.log`", "Solo cuando `f` es literalmente `*.log`"],
      ["When `f` contains a dot followed by any letters, as a regular expression", "Quand `f` contient un point suivi de lettres, comme expression régulière", "Cuando `f` contiene un punto seguido de letras, como expresión regular"],
    ],
    e: [
      "On the right of `==` in `[[ ]]`, an unquoted pattern is matched like a glob against the string. Quoted, `\"*.log\"` is compared literally.",
      "À droite de `==` dans `[[ ]]`, un motif sans guillemets est comparé à la chaîne comme un glob. Entre guillemets, `\"*.log\"` est comparé littéralement.",
      "A la derecha de `==` en `[[ ]]`, un patrón sin comillas se compara con la cadena como un glob. Entre comillas, `\"*.log\"` se compara literalmente.",
    ],
  },
  {
    id: "lx-test-04",
    q: ["Which test checks that a file exists and is not empty?", "Quel test vérifie qu'un fichier existe et n'est pas vide ?", "¿Qué prueba comprueba que un archivo existe y no está vacío?"],
    a: ["`[ -s report.csv ]`", "`[ -s report.csv ]`", "`[ -s report.csv ]`"],
    w: [["`[ -e report.csv ]`", "`[ -e report.csv ]`", "`[ -e report.csv ]`"], ["`[ -f report.csv ]`", "`[ -f report.csv ]`", "`[ -f report.csv ]`"], ["`[ -n report.csv ]`", "`[ -n report.csv ]`", "`[ -n report.csv ]`"]],
    e: [
      "`-s`: size above zero. `-e` only exists, `-f` is a regular file (possibly empty), `-d` a directory. `-n` tests a string, here the name itself: always true.",
      "`-s` : taille supérieure à zéro. `-e` existe seulement, `-f` est un fichier ordinaire (vide peut-être), `-d` un répertoire. `-n` teste une chaîne, ici le nom lui-même : toujours vrai.",
      "`-s`: tamaño mayor que cero. `-e` solo existe, `-f` es un archivo normal (quizá vacío), `-d` un directorio. `-n` prueba una cadena, aquí el propio nombre: siempre verdadero.",
    ],
  },
  {
    id: "lx-test-05",
    q: ["Why does `if grep -q ERROR app.log; then` need no `[ ]`?", "Pourquoi `if grep -q ERROR app.log; then` n'a-t-il pas besoin de `[ ]` ?", "¿Por qué `if grep -q ERROR app.log; then` no necesita `[ ]`?"],
    a: ["`if` runs a command and tests its exit status; `[` is just one such command", "`if` lance une commande et teste son code de sortie ; `[` n'est qu'une de ces commandes", "`if` ejecuta una orden y prueba su código de salida; `[` es solo una de esas órdenes"],
    w: [
      ["`-q` turns `grep` into a test expression", "`-q` transforme `grep` en expression de test", "`-q` convierte `grep` en una expresión de prueba"],
      ["`then` compares the output with `true`", "`then` compare la sortie avec `true`", "`then` compara la salida con `true`"],
      ["Brackets are only needed around variables", "Les crochets ne servent qu'autour des variables", "Los corchetes solo hacen falta alrededor de variables"],
    ],
    e: [
      "Status 0 means true. `grep` gives 0 when it finds a line; `-q` only silences it. `[` (also called `test`) gives 0 when its expression holds.",
      "Le code 0 veut dire vrai. `grep` rend 0 quand il trouve une ligne ; `-q` le rend seulement muet. `[` (aussi appelé `test`) rend 0 quand son expression est vraie.",
      "El código 0 significa verdadero. `grep` devuelve 0 cuando encuentra una línea; `-q` solo lo silencia. `[` (también llamado `test`) devuelve 0 cuando su expresión se cumple.",
    ],
  },
  {
    id: "lx-test-06",
    q: ["What does `[[ $n =~ ^[0-9]+$ ]]` check?", "Que vérifie `[[ $n =~ ^[0-9]+$ ]]` ?", "¿Qué comprueba `[[ $n =~ ^[0-9]+$ ]]`?"],
    a: ["That `n` is made of digits only, as an extended regular expression", "Que `n` n'est fait que de chiffres, comme expression régulière étendue", "Que `n` solo tiene dígitos, como expresión regular extendida"],
    w: [
      ["That `n` contains at least one digit somewhere", "Que `n` contient au moins un chiffre quelque part", "Que `n` contiene al menos un dígito en algún sitio"],
      ["That `n` equals the text `^[0-9]+$`", "Que `n` vaut le texte `^[0-9]+$`", "Que `n` es igual al texto `^[0-9]+$`"],
      ["That a file named like `n` exists", "Qu'un fichier nommé comme `n` existe", "Que existe un archivo llamado como `n`"],
    ],
    e: [
      "`^` and `$` anchor the whole string. Quoting the right side would make it a literal string; the groups caught are in `BASH_REMATCH`.",
      "`^` et `$` ancrent toute la chaîne. Mettre la partie droite entre guillemets en ferait une chaîne littérale ; les groupes capturés sont dans `BASH_REMATCH`.",
      "`^` y `$` anclan la cadena entera. Entrecomillar la parte derecha la volvería una cadena literal; los grupos capturados quedan en `BASH_REMATCH`.",
    ],
  },
];

const loops: LinuxQuestion[] = [
  {
    id: "lx-loop-01",
    q: ["Why write `for f in *.jpg` rather than `for f in $(ls *.jpg)`?", "Pourquoi écrire `for f in *.jpg` plutôt que `for f in $(ls *.jpg)` ?", "¿Por qué escribir `for f in *.jpg` en vez de `for f in $(ls *.jpg)`?"],
    a: ["The glob gives each file as one word; the output of `ls` is split at spaces, so `my trip.jpg` becomes two", "Le glob donne chaque fichier en un seul mot ; la sortie de `ls` est coupée aux espaces, et `my trip.jpg` en fait deux", "El glob da cada archivo como una sola palabra; la salida de `ls` se corta en los espacios, y `my trip.jpg` se vuelve dos"],
    w: [
      ["It is only faster", "C'est seulement plus rapide", "Solo es más rápido"],
      ["`ls` leaves out the files it cannot sort", "`ls` omet les fichiers qu'il ne sait pas trier", "`ls` omite los archivos que no sabe ordenar"],
      ["The glob also descends into subdirectories", "Le glob descend aussi dans les sous-répertoires", "El glob también entra en los subdirectorios"],
    ],
    e: [
      "Inside the loop, quote it too: `cp \"$f\" backup/`. With `shopt -s nullglob`, the loop runs zero times when nothing matches.",
      "Dans la boucle, la mettre aussi entre guillemets : `cp \"$f\" backup/`. Avec `shopt -s nullglob`, la boucle ne tourne pas quand rien ne correspond.",
      "Dentro del bucle, entrecomillarla también: `cp \"$f\" backup/`. Con `shopt -s nullglob`, el bucle no se ejecuta cuando nada coincide.",
    ],
  },
  {
    id: "lx-loop-02",
    q: ["In `while IFS= read -r line; do …; done < notes.txt`, what do `IFS=` and `-r` do?", "Dans `while IFS= read -r line; do …; done < notes.txt`, que font `IFS=` et `-r` ?", "En `while IFS= read -r line; do …; done < notes.txt`, ¿qué hacen `IFS=` y `-r`?"],
    a: ["Keep the leading and trailing spaces, and keep backslashes as they are", "Garder les espaces de début et de fin, et garder les barres obliques inverses telles quelles", "Conservar los espacios del principio y del final, y las barras invertidas tal cual"],
    w: [
      ["Read the whole file at once, in reverse order", "Lire tout le fichier d'un coup, à l'envers", "Leer todo el archivo de una vez, al revés"],
      ["Read the subdirectories recursively", "Lire les sous-répertoires récursivement", "Leer los subdirectorios recursivamente"],
      ["Skip the empty lines and the comments", "Sauter les lignes vides et les commentaires", "Saltar las líneas vacías y los comentarios"],
    ],
    e: [
      "Without them, `read` trims spaces with `IFS` and treats `\\` as an escape. A last line without a newline is skipped unless the test is `read -r line || [ -n \"$line\" ]`.",
      "Sans eux, `read` rogne les espaces avec `IFS` et traite `\\` comme un échappement. Une dernière ligne sans retour à la ligne est sautée, sauf avec le test `read -r line || [ -n \"$line\" ]`.",
      "Sin ellos, `read` recorta los espacios con `IFS` y trata `\\` como escape. Una última línea sin salto de línea se salta, salvo con la prueba `read -r line || [ -n \"$line\" ]`.",
    ],
  },
  {
    id: "lx-loop-03",
    q: ["`n=0; cat list.txt | while read -r l; do n=$((n+1)); done; echo $n` prints 0. Why?", "`n=0; cat list.txt | while read -r l; do n=$((n+1)); done; echo $n` affiche 0. Pourquoi ?", "`n=0; cat list.txt | while read -r l; do n=$((n+1)); done; echo $n` muestra 0. ¿Por qué?"],
    a: ["Each part of a pipe runs in a subshell: the loop's `n` is gone when it ends. Write `done < list.txt`", "Chaque partie d'un tube tourne dans un sous-shell : le `n` de la boucle disparaît à sa fin. Écrire `done < list.txt`", "Cada parte de una tubería corre en un subshell: la `n` del bucle desaparece al acabar. Escribir `done < list.txt`"],
    w: [
      ["`read` empties the variables it does not use", "`read` vide les variables qu'il n'utilise pas", "`read` vacía las variables que no usa"],
      ["Arithmetic needs `let` inside a loop", "L'arithmétique demande `let` dans une boucle", "La aritmética necesita `let` dentro de un bucle"],
      ["`echo` runs before the loop has finished", "`echo` s'exécute avant la fin de la boucle", "`echo` se ejecuta antes de que acabe el bucle"],
    ],
    e: [
      "With a redirection, the loop runs in the current shell. `shopt -s lastpipe` (in a script) also keeps the last part of a pipe in it.",
      "Avec une redirection, la boucle tourne dans le shell courant. `shopt -s lastpipe` (dans un script) y garde aussi la dernière partie d'un tube.",
      "Con una redirección, el bucle corre en el shell actual. `shopt -s lastpipe` (en un script) también mantiene allí la última parte de una tubería.",
    ],
  },
  {
    id: "lx-loop-04",
    q: ["With `n=5`, `for i in {1..$n}; do echo $i; done` prints `{1..5}` once. Why?", "Avec `n=5`, `for i in {1..$n}; do echo $i; done` affiche `{1..5}` une fois. Pourquoi ?", "Con `n=5`, `for i in {1..$n}; do echo $i; done` muestra `{1..5}` una vez. ¿Por qué?"],
    a: ["Braces are expanded before variables, when `$n` is not a number yet. Use `for ((i = 1; i <= n; i++))`", "Les accolades sont développées avant les variables, quand `$n` n'est pas encore un nombre. Utiliser `for ((i = 1; i <= n; i++))`", "Las llaves se expanden antes que las variables, cuando `$n` aún no es un número. Usar `for ((i = 1; i <= n; i++))`"],
    w: [
      ["`n` must be declared with `declare -i`", "`n` doit être déclarée avec `declare -i`", "`n` debe declararse con `declare -i`"],
      ["Ranges only go up to 4", "Les plages s'arrêtent à 4", "Los rangos solo llegan a 4"],
      ["`echo` cannot print inside braces", "`echo` ne peut pas afficher dans des accolades", "`echo` no puede mostrar dentro de llaves"],
    ],
    e: [
      "`{1..5}` written out works; with a variable, `seq 1 \"$n\"` or the C-style loop does.",
      "`{1..5}` écrit en toutes lettres marche ; avec une variable, `seq 1 \"$n\"` ou la boucle à la C.",
      "`{1..5}` escrito tal cual funciona; con una variable, `seq 1 \"$n\"` o el bucle al estilo C.",
    ],
  },
  {
    id: "lx-loop-05",
    q: ["What does `until ping -c1 db >/dev/null; do sleep 5; done` do?", "Que fait `until ping -c1 db >/dev/null; do sleep 5; done` ?", "¿Qué hace `until ping -c1 db >/dev/null; do sleep 5; done`?"],
    a: ["Waits, retrying every 5 seconds, until `db` answers", "Attend, en réessayant toutes les 5 secondes, que `db` réponde", "Espera, reintentando cada 5 segundos, hasta que `db` responda"],
    w: [
      ["Pings `db` every 5 seconds until it stops answering", "Envoie un ping à `db` toutes les 5 secondes jusqu'à ce qu'il ne réponde plus", "Hace ping a `db` cada 5 segundos hasta que deje de responder"],
      ["Tries 5 times, then gives up", "Essaie 5 fois, puis abandonne", "Lo intenta 5 veces y se rinde"],
      ["Pings once and sleeps 5 seconds", "Fait un ping puis dort 5 secondes", "Hace un ping y duerme 5 segundos"],
    ],
    e: [
      "`until` loops while its command fails, the reverse of `while`. In a script, add a limit, or it waits forever.",
      "`until` boucle tant que sa commande échoue, l'inverse de `while`. Dans un script, ajouter une limite, sinon il attend sans fin.",
      "`until` repite mientras su orden falla, lo contrario de `while`. En un script, añadir un límite, o espera para siempre.",
    ],
  },
  {
    id: "lx-loop-06",
    q: ["Why `find . -name '*.txt' -print0 | while IFS= read -r -d '' f`?", "Pourquoi `find . -name '*.txt' -print0 | while IFS= read -r -d '' f` ?", "¿Por qué `find . -name '*.txt' -print0 | while IFS= read -r -d '' f`?"],
    a: ["The names are separated by a NUL byte, the one byte a file name cannot hold: spaces and newlines are safe", "Les noms sont séparés par l'octet NUL, le seul qu'un nom de fichier ne peut pas contenir : espaces et retours à la ligne ne gênent plus", "Los nombres se separan con el byte NUL, el único que un nombre de archivo no puede contener: espacios y saltos de línea dejan de molestar"],
    w: [
      ["It keeps only the empty files", "Il ne garde que les fichiers vides", "Solo conserva los archivos vacíos"],
      ["It sorts the names before the loop", "Il trie les noms avant la boucle", "Ordena los nombres antes del bucle"],
      ["It skips the hidden files", "Il saute les fichiers cachés", "Se salta los archivos ocultos"],
    ],
    e: [
      "`-d ''` makes `read` stop at NUL instead of a newline. The same pairing: `find … -print0 | xargs -0`.",
      "`-d ''` fait s'arrêter `read` sur NUL au lieu du retour à la ligne. Même principe : `find … -print0 | xargs -0`.",
      "`-d ''` hace que `read` pare en NUL en vez de en el salto de línea. Mismo principio: `find … -print0 | xargs -0`.",
    ],
  },
];

const functions: LinuxQuestion[] = [
  {
    id: "lx-func-01",
    q: ["How does a bash function hand a string back to its caller?", "Comment une fonction bash rend-elle une chaîne à son appelant ?", "¿Cómo devuelve una función de bash una cadena a quien la llama?"],
    a: ["It prints it, and the caller captures it: `name=$(get_name)`", "Elle l'affiche, et l'appelant la capture : `name=$(get_name)`", "La imprime, y quien llama la captura: `name=$(get_name)`"],
    w: [
      ["With `return \"text\"`", "Avec `return \"text\"`", "Con `return \"text\"`"],
      ["With `export` inside the function", "Avec `export` dans la fonction", "Con `export` dentro de la función"],
      ["Bash functions cannot give anything back", "Les fonctions bash ne peuvent rien rendre", "Las funciones de bash no pueden devolver nada"],
    ],
    e: [
      "`return` only sets the exit status, 0 to 255. Messages meant for the user then go to standard error: `echo \"warning\" >&2`.",
      "`return` ne fixe que le code de sortie, de 0 à 255. Les messages destinés à l'utilisateur vont alors sur la sortie d'erreur : `echo \"warning\" >&2`.",
      "`return` solo fija el código de salida, de 0 a 255. Los mensajes para el usuario van entonces a la salida de error: `echo \"warning\" >&2`.",
    ],
  },
  {
    id: "lx-func-02",
    q: ["What does `local` change in `f() { local count=0; … }`?", "Que change `local` dans `f() { local count=0; … }` ?", "¿Qué cambia `local` en `f() { local count=0; … }`?"],
    a: ["`count` exists only during the call; the caller's `count`, if any, is untouched", "`count` n'existe que pendant l'appel ; le `count` de l'appelant, s'il y en a un, n'est pas touché", "`count` solo existe durante la llamada; la `count` de quien llama, si la hay, no se toca"],
    w: [
      ["`count` is kept between calls", "`count` est gardée d'un appel à l'autre", "`count` se conserva entre llamadas"],
      ["`count` can only hold numbers", "`count` ne peut contenir que des nombres", "`count` solo puede contener números"],
      ["`count` is hidden from the commands the function runs", "`count` est cachée aux commandes que la fonction lance", "`count` queda oculta a las órdenes que lanza la función"],
    ],
    e: [
      "Without `local`, a variable set in a function is global: it overwrites the script's own. Functions called from `f` do see it.",
      "Sans `local`, une variable fixée dans une fonction est globale : elle écrase celle du script. Les fonctions appelées par `f` la voient bien.",
      "Sin `local`, una variable fijada en una función es global: sobrescribe la del script. Las funciones llamadas desde `f` sí la ven.",
    ],
  },
  {
    id: "lx-func-03",
    q: ["Inside a function called as `greet Ana`, what is `$1`?", "Dans une fonction appelée par `greet Ana`, qu'est-ce que `$1` ?", "Dentro de una función llamada como `greet Ana`, ¿qué es `$1`?"],
    a: ["`Ana`, the function's own first argument", "`Ana`, le premier argument de la fonction elle-même", "`Ana`, el primer argumento de la propia función"],
    w: [
      ["The script's first argument", "Le premier argument du script", "El primer argumento del script"],
      ["`greet`, the function's name", "`greet`, le nom de la fonction", "`greet`, el nombre de la función"],
      ["The number of arguments", "Le nombre d'arguments", "El número de argumentos"],
    ],
    e: [
      "During the call, `$1`, `$#` and `\"$@\"` are the function's; the script's come back after it. To pass them on: `main \"$@\"`.",
      "Pendant l'appel, `$1`, `$#` et `\"$@\"` sont ceux de la fonction ; ceux du script reviennent après. Pour les transmettre : `main \"$@\"`.",
      "Durante la llamada, `$1`, `$#` y `\"$@\"` son los de la función; los del script vuelven después. Para pasarlos: `main \"$@\"`.",
    ],
  },
  {
    id: "lx-func-04",
    q: ["What is the difference between `./lib.sh` and `source lib.sh` (or `. lib.sh`)?", "Quelle différence entre `./lib.sh` et `source lib.sh` (ou `. lib.sh`) ?", "¿Qué diferencia hay entre `./lib.sh` y `source lib.sh` (o `. lib.sh`)?"],
    a: ["`source` runs the file in the current shell: its functions and variables stay defined afterwards", "`source` exécute le fichier dans le shell courant : ses fonctions et variables restent définies après", "`source` ejecuta el archivo en el shell actual: sus funciones y variables siguen definidas después"],
    w: [
      ["`source` makes the file executable", "`source` rend le fichier exécutable", "`source` hace ejecutable el archivo"],
      ["`source` runs it in a new, clean shell", "`source` l'exécute dans un nouveau shell, vierge", "`source` lo ejecuta en un shell nuevo y limpio"],
      ["`source` only checks its syntax", "`source` ne vérifie que sa syntaxe", "`source` solo comprueba su sintaxis"],
    ],
    e: [
      "That is how `~/.bashrc` is reloaded and how scripts share functions. An `exit` in a sourced file closes the current shell.",
      "C'est ainsi qu'on recharge `~/.bashrc` et que des scripts partagent des fonctions. Un `exit` dans un fichier sourcé ferme le shell courant.",
      "Así se recarga `~/.bashrc` y así comparten funciones los scripts. Un `exit` en un archivo cargado con source cierra el shell actual.",
    ],
  },
  {
    id: "lx-func-05",
    q: ["With `exists() { [ -f \"$1\" ]; }`, what does `exists notes.txt && echo yes` do?", "Avec `exists() { [ -f \"$1\" ]; }`, que fait `exists notes.txt && echo yes` ?", "Con `exists() { [ -f \"$1\" ]; }`, ¿qué hace `exists notes.txt && echo yes`?"],
    a: ["Prints `yes` when `notes.txt` is a regular file: a function's status is its last command's", "Affiche `yes` quand `notes.txt` est un fichier ordinaire : le code d'une fonction est celui de sa dernière commande", "Muestra `yes` cuando `notes.txt` es un archivo normal: el código de una función es el de su última orden"],
    w: [
      ["Always prints `yes`: the function has no `return`", "Affiche toujours `yes` : la fonction n'a pas de `return`", "Siempre muestra `yes`: la función no tiene `return`"],
      ["Never prints anything: a test inside a function is ignored", "N'affiche jamais rien : un test dans une fonction est ignoré", "Nunca muestra nada: una prueba dentro de una función se ignora"],
      ["A syntax error: `[` needs an `if`", "Une erreur de syntaxe : `[` demande un `if`", "Un error de sintaxis: `[` necesita un `if`"],
    ],
    e: [
      "Functions behave like commands: `if exists \"$f\"; then`. A bare `return` also returns the last command's status.",
      "Les fonctions se comportent comme des commandes : `if exists \"$f\"; then`. Un `return` seul rend aussi le code de la dernière commande.",
      "Las funciones se comportan como órdenes: `if exists \"$f\"; then`. Un `return` solo también devuelve el código de la última orden.",
    ],
  },
];

const args: LinuxQuestion[] = [
  {
    id: "lx-args-01",
    q: ["In a script run as `./deploy.sh prod eu`, what are `$0` and `$#`?", "Dans un script lancé par `./deploy.sh prod eu`, que valent `$0` et `$#` ?", "En un script ejecutado como `./deploy.sh prod eu`, ¿qué valen `$0` y `$#`?"],
    a: ["`./deploy.sh` and 2", "`./deploy.sh` et 2", "`./deploy.sh` y 2"],
    w: [["`prod` and 2", "`prod` et 2", "`prod` y 2"], ["`./deploy.sh` and 3", "`./deploy.sh` et 3", "`./deploy.sh` y 3"], ["`bash` and 1", "`bash` et 1", "`bash` y 1"]],
    e: [
      "`$0` is the name the script was called by; `$#` counts the arguments after it. `$$` is the process id.",
      "`$0` est le nom par lequel le script a été appelé ; `$#` compte les arguments qui suivent. `$$` est le numéro du processus.",
      "`$0` es el nombre con que se llamó al script; `$#` cuenta los argumentos que siguen. `$$` es el número del proceso.",
    ],
  },
  {
    id: "lx-args-02",
    q: ["What does `env=${1:-staging}` give?", "Que donne `env=${1:-staging}` ?", "¿Qué da `env=${1:-staging}`?"],
    a: ["The first argument, or `staging` when it is missing or empty", "Le premier argument, ou `staging` quand il manque ou est vide", "El primer argumento, o `staging` cuando falta o está vacío"],
    w: [
      ["The first argument minus the word `staging`", "Le premier argument moins le mot `staging`", "El primer argumento menos la palabra `staging`"],
      ["An error when there is no argument", "Une erreur quand il n'y a pas d'argument", "Un error cuando no hay argumento"],
      ["Always `staging`; `$1` is only read with `-1`", "Toujours `staging` ; `$1` ne se lit qu'avec `-1`", "Siempre `staging`; `$1` solo se lee con `-1`"],
    ],
    e: [
      "`:-` gives a default without setting anything; `:=` also assigns it (not allowed on `$1`); `:?` stops with a message.",
      "`:-` donne une valeur par défaut sans rien fixer ; `:=` l'affecte aussi (pas permis sur `$1`) ; `:?` arrête avec un message.",
      "`:-` da un valor por defecto sin fijar nada; `:=` además lo asigna (no se permite en `$1`); `:?` para con un mensaje.",
    ],
  },
  {
    id: "lx-args-03",
    q: ["What does `shift` do in a script?", "Que fait `shift` dans un script ?", "¿Qué hace `shift` en un script?"],
    a: ["Drops `$1`: `$2` becomes `$1`, and `$#` goes down by one", "Retire `$1` : `$2` devient `$1`, et `$#` baisse de un", "Quita `$1`: `$2` pasa a ser `$1`, y `$#` baja en uno"],
    w: [
      ["Swaps `$1` and `$2`", "Échange `$1` et `$2`", "Intercambia `$1` y `$2`"],
      ["Moves every character of `$1` one place left", "Décale d'un cran vers la gauche chaque caractère de `$1`", "Mueve cada carácter de `$1` una posición a la izquierda"],
      ["Moves the script to the background", "Passe le script en arrière-plan", "Pasa el script a segundo plano"],
    ],
    e: [
      "The usual parsing loop: `while [ $# -gt 0 ]; do case $1 in …; esac; shift; done`. `shift 2` drops two.",
      "La boucle d'analyse habituelle : `while [ $# -gt 0 ]; do case $1 in …; esac; shift; done`. `shift 2` en retire deux.",
      "El bucle de análisis habitual: `while [ $# -gt 0 ]; do case $1 in …; esac; shift; done`. `shift 2` quita dos.",
    ],
  },
  {
    id: "lx-args-04",
    q: ["In `while getopts \"vo:\" opt`, what does the colon after `o` mean?", "Dans `while getopts \"vo:\" opt`, que veut dire le deux-points après `o` ?", "En `while getopts \"vo:\" opt`, ¿qué significa los dos puntos tras `o`?"],
    a: ["`-o` takes a value, found in `$OPTARG`", "`-o` prend une valeur, qu'on trouve dans `$OPTARG`", "`-o` lleva un valor, que está en `$OPTARG`"],
    w: [
      ["`-o` is optional", "`-o` est facultative", "`-o` es opcional"],
      ["`-v` takes a value", "`-v` prend une valeur", "`-v` lleva un valor"],
      ["The colon separates the two options", "Le deux-points sépare les deux options", "Los dos puntos separan las dos opciones"],
    ],
    e: [
      "`-v` is a plain flag. An unknown option sets `opt` to `?`. After the loop, `shift $((OPTIND - 1))` leaves the other arguments.",
      "`-v` est un simple drapeau. Une option inconnue met `opt` à `?`. Après la boucle, `shift $((OPTIND - 1))` laisse les autres arguments.",
      "`-v` es un simple indicador. Una opción desconocida pone `opt` a `?`. Tras el bucle, `shift $((OPTIND - 1))` deja los demás argumentos.",
    ],
  },
  {
    id: "lx-args-05",
    q: ["What does `: \"${API_KEY:?is not set}\"` at the top of a script do?", "Que fait `: \"${API_KEY:?is not set}\"` en tête d'un script ?", "¿Qué hace `: \"${API_KEY:?is not set}\"` al principio de un script?"],
    a: ["Stops the script with that message when `API_KEY` is unset or empty", "Arrête le script avec ce message quand `API_KEY` n'est pas définie ou vide", "Detiene el script con ese mensaje cuando `API_KEY` no está definida o está vacía"],
    w: [
      ["Sets `API_KEY` to 'is not set'", "Met `API_KEY` à « is not set »", "Pone `API_KEY` a «is not set»"],
      ["Asks the user to type the key", "Demande à l'utilisateur de taper la clé", "Pide al usuario que escriba la clave"],
      ["Prints the message and carries on", "Affiche le message et continue", "Muestra el mensaje y sigue"],
    ],
    e: [
      "`:` is the command that does nothing: only the expansion's check remains. An interactive shell prints the message without closing.",
      "`:` est la commande qui ne fait rien : il ne reste que la vérification du développement. Un shell interactif affiche le message sans se fermer.",
      "`:` es la orden que no hace nada: solo queda la comprobación de la expansión. Un shell interactivo muestra el mensaje sin cerrarse.",
    ],
  },
];

const arrays: LinuxQuestion[] = [
  {
    id: "lx-array-01",
    q: ["`files=(a.txt \"my notes.txt\" b.txt)`: what does `echo ${#files[@]}` print?", "`files=(a.txt \"my notes.txt\" b.txt)` : qu'affiche `echo ${#files[@]}` ?", "`files=(a.txt \"my notes.txt\" b.txt)`: ¿qué muestra `echo ${#files[@]}`?"],
    a: ["3", "3", "3"],
    w: [["4", "4", "4"], ["1", "1", "1"], ["5, the length of the first element", "5, la longueur du premier élément", "5, la longitud del primer elemento"]],
    e: [
      "The quotes make `my notes.txt` one element. `${#files[@]}` counts elements; `${#files}` would be the length of the first.",
      "Les guillemets font de `my notes.txt` un seul élément. `${#files[@]}` compte les éléments ; `${#files}` serait la longueur du premier.",
      "Las comillas hacen de `my notes.txt` un solo elemento. `${#files[@]}` cuenta los elementos; `${#files}` sería la longitud del primero.",
    ],
  },
  {
    id: "lx-array-02",
    q: ["Why write `cp \"${files[@]}\" backup/` with the quotes?", "Pourquoi écrire `cp \"${files[@]}\" backup/` avec les guillemets ?", "¿Por qué escribir `cp \"${files[@]}\" backup/` con las comillas?"],
    a: ["Each element stays one word, spaces included", "Chaque élément reste un seul mot, espaces compris", "Cada elemento sigue siendo una palabra, espacios incluidos"],
    w: [
      ["Without them, only the first element is copied", "Sans elles, seul le premier élément est copié", "Sin ellas, solo se copia el primer elemento"],
      ["The quotes join the elements into one name", "Les guillemets réunissent les éléments en un seul nom", "Las comillas unen los elementos en un solo nombre"],
      ["They are needed for arrays of more than ten elements", "Elles sont nécessaires au-delà de dix éléments", "Hacen falta con más de diez elementos"],
    ],
    e: [
      "Unquoted, `${files[@]}` is split again at spaces: `my notes.txt` becomes two arguments. `\"${files[*]}\"` would join them into one.",
      "Sans guillemets, `${files[@]}` est redécoupé aux espaces : `my notes.txt` donne deux arguments. `\"${files[*]}\"` les réunirait en un seul.",
      "Sin comillas, `${files[@]}` se vuelve a dividir en los espacios: `my notes.txt` da dos argumentos. `\"${files[*]}\"` los uniría en uno.",
    ],
  },
  {
    id: "lx-array-03",
    q: ["`arr=(red green blue)`: what do `echo \"${arr[1]}\"` and `echo \"$arr\"` print?", "`arr=(red green blue)` : qu'affichent `echo \"${arr[1]}\"` et `echo \"$arr\"` ?", "`arr=(red green blue)`: ¿qué muestran `echo \"${arr[1]}\"` y `echo \"$arr\"`?"],
    a: ["`green`, then `red`", "`green`, puis `red`", "`green`, y luego `red`"],
    w: [["`red`, then `red green blue`", "`red`, puis `red green blue`", "`red`, y luego `red green blue`"], ["`green`, then `red green blue`", "`green`, puis `red green blue`", "`green`, y luego `red green blue`"], ["`red`, then 3", "`red`, puis 3", "`red`, y luego 3"]],
    e: [
      "Indices start at 0. A bare `$arr` is element 0. The last one: `${arr[-1]}` (bash 4.3 and later).",
      "Les indices commencent à 0. Un `$arr` seul est l'élément 0. Le dernier : `${arr[-1]}` (bash 4.3 et après).",
      "Los índices empiezan en 0. Un `$arr` solo es el elemento 0. El último: `${arr[-1]}` (bash 4.3 en adelante).",
    ],
  },
  {
    id: "lx-array-04",
    q: ["`files=(a.txt)`: what does `files+=(b.txt)` do, and `files+=b.txt`?", "`files=(a.txt)` : que fait `files+=(b.txt)`, et `files+=b.txt` ?", "`files=(a.txt)`: ¿qué hace `files+=(b.txt)`, y `files+=b.txt`?"],
    a: ["The first appends an element; the second appends text to element 0, giving `a.txtb.txt`", "Le premier ajoute un élément ; le second ajoute du texte à l'élément 0, ce qui donne `a.txtb.txt`", "El primero añade un elemento; el segundo añade texto al elemento 0, lo que da `a.txtb.txt`"],
    w: [
      ["Both append an element", "Les deux ajoutent un élément", "Los dos añaden un elemento"],
      ["The first replaces the array", "Le premier remplace le tableau", "El primero sustituye el array"],
      ["Both are errors: arrays cannot grow", "Les deux sont des erreurs : un tableau ne grandit pas", "Los dos son errores: un array no crece"],
    ],
    e: [
      "The parentheses mark a list. Collecting in a loop: `found+=(\"$f\")`.",
      "Les parenthèses marquent une liste. Pour accumuler dans une boucle : `found+=(\"$f\")`.",
      "Los paréntesis marcan una lista. Para acumular en un bucle: `found+=(\"$f\")`.",
    ],
  },
  {
    id: "lx-array-05",
    q: ["What does `declare -A port; port[web]=80; echo \"${port[web]}\"` use?", "Qu'utilise `declare -A port; port[web]=80; echo \"${port[web]}\"` ?", "¿Qué usa `declare -A port; port[web]=80; echo \"${port[web]}\"`?"],
    a: ["An associative array, indexed by strings; it prints 80", "Un tableau associatif, indexé par des chaînes ; il affiche 80", "Un array asociativo, indexado por cadenas; muestra 80"],
    w: [
      ["An array of integers only", "Un tableau d'entiers seulement", "Un array solo de enteros"],
      ["An environment variable for all programs", "Une variable d'environnement pour tous les programmes", "Una variable de entorno para todos los programas"],
      ["An ordinary array: `web` is read as index 0", "Un tableau ordinaire : `web` est lu comme l'indice 0", "Un array normal: `web` se lee como índice 0"],
    ],
    e: [
      "Without `declare -A`, `port[web]` would indeed be index 0. The keys: `${!port[@]}`; bash 4 or later (macOS ships bash 3.2).",
      "Sans `declare -A`, `port[web]` serait bien l'indice 0. Les clés : `${!port[@]}` ; bash 4 ou plus (macOS fournit bash 3.2).",
      "Sin `declare -A`, `port[web]` sería efectivamente el índice 0. Las claves: `${!port[@]}`; bash 4 o posterior (macOS trae bash 3.2).",
    ],
  },
];

export const scripting = { tests, loops, functions, arguments: args, arrays };
