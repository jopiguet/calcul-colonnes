/** Linux, the shell (bash): redirections, expansions, control, environment. */
import type { LinuxQuestion } from "./types";

const redirection: LinuxQuestion[] = [
  {
    id: "lx-redir-01",
    q: ["Which command sends both the output and the errors of `make` to `build.log`?", "Quelle commande envoie à la fois la sortie et les erreurs de `make` dans `build.log` ?", "¿Qué comando envía a la vez la salida y los errores de `make` a `build.log`?"],
    a: ["`make > build.log 2>&1`", "`make > build.log 2>&1`", "`make > build.log 2>&1`"],
    w: [["`make 2>&1 > build.log`", "`make 2>&1 > build.log`", "`make 2>&1 > build.log`"], ["`make 2> build.log`", "`make 2> build.log`", "`make 2> build.log`"], ["`make 1>&2 > build.log`", "`make 1>&2 > build.log`", "`make 1>&2 > build.log`"]],
    e: [
      "Redirections apply left to right: `2>&1` copies wherever output points at that moment. Written first, it still points at the terminal. (bash also accepts `&> build.log`.)",
      "Les redirections s'appliquent de gauche à droite : `2>&1` copie la destination de la sortie à cet instant. Écrit en premier, il pointe encore vers le terminal. (bash accepte aussi `&> build.log`.)",
      "Las redirecciones se aplican de izquierda a derecha: `2>&1` copia el destino de la salida en ese momento. Escrito primero, sigue apuntando al terminal. (bash también acepta `&> build.log`.)",
    ],
  },
  {
    id: "lx-redir-02",
    q: ["What is the difference between `date > log.txt` and `date >> log.txt`?", "Quelle différence entre `date > log.txt` et `date >> log.txt` ?", "¿Qué diferencia hay entre `date > log.txt` y `date >> log.txt`?"],
    a: ["`>` empties the file first, `>>` adds at its end", "`>` vide d'abord le fichier, `>>` ajoute à la fin", "`>` vacía primero el archivo, `>>` añade al final"],
    w: [
      ["`>>` also captures the errors", "`>>` capture aussi les erreurs", "`>>` también captura los errores"],
      ["`>>` writes the file twice", "`>>` écrit le fichier deux fois", "`>>` escribe el archivo dos veces"],
      ["None: both append", "Aucune : les deux ajoutent", "Ninguna: los dos añaden"],
    ],
    e: [
      "Both create the file if needed. `set -o noclobber` makes `>` refuse to overwrite an existing file (`>|` forces it).",
      "Les deux créent le fichier si besoin. `set -o noclobber` fait refuser à `>` d'écraser un fichier existant (`>|` force).",
      "Ambos crean el archivo si hace falta. `set -o noclobber` hace que `>` se niegue a sobrescribir un archivo existente (`>|` lo fuerza).",
    ],
  },
  {
    id: "lx-redir-03",
    q: ["What does `2>/dev/null` do at the end of a command?", "Que fait `2>/dev/null` à la fin d'une commande ?", "¿Qué hace `2>/dev/null` al final de una orden?"],
    a: ["Throws away its error messages", "Jette ses messages d'erreur", "Descarta sus mensajes de error"],
    w: [
      ["Runs it twice", "La lance deux fois", "La ejecuta dos veces"],
      ["Throws away its normal output", "Jette sa sortie normale", "Descarta su salida normal"],
      ["Makes it ignore errors and go on", "Lui fait ignorer les erreurs et continuer", "Le hace ignorar los errores y seguir"],
    ],
    e: [
      "File descriptor 2 is the standard error; `/dev/null` swallows whatever is written to it. The command behaves exactly as before.",
      "Le descripteur 2 est la sortie d'erreur ; `/dev/null` avale tout ce qu'on y écrit. La commande se comporte exactement comme avant.",
      "El descriptor 2 es la salida de errores; `/dev/null` se traga todo lo que se escribe en él. La orden se comporta igual que antes.",
    ],
  },
  {
    id: "lx-redir-04",
    q: ["In a script, what is the difference between `cat <<EOF` and `cat <<'EOF'`?", "Dans un script, quelle différence entre `cat <<EOF` et `cat <<'EOF'` ?", "En un script, ¿qué diferencia hay entre `cat <<EOF` y `cat <<'EOF'`?"],
    a: ["With the quotes, variables and `$(…)` in the text are left as written", "Avec les apostrophes, les variables et les `$(…)` du texte restent tels quels", "Con las comillas, las variables y los `$(…)` del texto se quedan tal cual"],
    w: [
      ["With the quotes, the text must be on one line", "Avec les apostrophes, le texte doit tenir sur une ligne", "Con las comillas, el texto debe ir en una línea"],
      ["Without the quotes, the text goes to a file named `EOF`", "Sans les apostrophes, le texte va dans un fichier nommé `EOF`", "Sin las comillas, el texto va a un archivo llamado `EOF`"],
      ["None", "Aucune", "Ninguna"],
    ],
    e: [
      "Quoting the delimiter is the way to write a script or a config file containing dollars. `<<-` also removes leading tabs.",
      "Mettre le délimiteur entre apostrophes permet d'écrire un script ou un fichier de configuration contenant des dollars. `<<-` retire en plus les tabulations en début de ligne.",
      "Poner el delimitador entre comillas permite escribir un script o un archivo de configuración con dólares. `<<-` además quita los tabuladores iniciales.",
    ],
  },
  {
    id: "lx-redir-05",
    q: ["What does `diff <(sort a.txt) <(sort b.txt)` do?", "Que fait `diff <(sort a.txt) <(sort b.txt)` ?", "¿Qué hace `diff <(sort a.txt) <(sort b.txt)`?"],
    a: ["Compares the sorted versions of the two files, without temporary files", "Compare les versions triées des deux fichiers, sans fichiers temporaires", "Compara las versiones ordenadas de los dos archivos, sin archivos temporales"],
    w: [
      ["Sorts both files in place, then compares them", "Trie les deux fichiers sur place, puis les compare", "Ordena los dos archivos en el sitio y luego los compara"],
      ["Reads the files named `sort`", "Lit les fichiers nommés `sort`", "Lee los archivos llamados `sort`"],
      ["It is a syntax error", "C'est une erreur de syntaxe", "Es un error de sintaxis"],
    ],
    e: [
      "Process substitution: each `<(…)` becomes a path such as `/dev/fd/63` from which the command's output can be read. bash and zsh have it, plain `sh` does not.",
      "Substitution de processus : chaque `<(…)` devient un chemin comme `/dev/fd/63` d'où on lit la sortie de la commande. bash et zsh l'ont, `sh` simple non.",
      "Sustitución de procesos: cada `<(…)` se convierte en una ruta como `/dev/fd/63` desde la que se lee la salida de la orden. bash y zsh la tienen, `sh` simple no.",
    ],
  },
];

const expansion: LinuxQuestion[] = [
  {
    id: "lx-exp-01",
    q: ["What do `echo '$HOME'` and `echo \"$HOME\"` print?", "Qu'affichent `echo '$HOME'` et `echo \"$HOME\"` ?", "¿Qué muestran `echo '$HOME'` y `echo \"$HOME\"`?"],
    a: ["The text `$HOME`, then the home directory's path", "Le texte `$HOME`, puis le chemin du répertoire personnel", "El texto `$HOME` y luego la ruta del directorio personal"],
    w: [
      ["The path both times", "Le chemin les deux fois", "La ruta las dos veces"],
      ["The text `$HOME` both times", "Le texte `$HOME` les deux fois", "El texto `$HOME` las dos veces"],
      ["The path, then the text `$HOME`", "Le chemin, puis le texte `$HOME`", "La ruta y luego el texto `$HOME`"],
    ],
    e: [
      "Single quotes keep everything literal; double quotes still expand `$`, backquotes and `\\`.",
      "Les apostrophes gardent tout littéral ; les guillemets doubles développent encore `$`, les accents graves et `\\`.",
      "Las comillas simples lo dejan todo literal; las dobles siguen expandiendo `$`, los acentos graves y `\\`.",
    ],
  },
  {
    id: "lx-exp-02",
    q: ["`f='my report.txt'; rm $f` tries to delete two files. Why?", "`f='my report.txt'; rm $f` essaie de supprimer deux fichiers. Pourquoi ?", "`f='my report.txt'; rm $f` intenta borrar dos archivos. ¿Por qué?"],
    a: ["Unquoted, the value is split on spaces: write `rm \"$f\"`", "Sans guillemets, la valeur est coupée aux espaces : écrire `rm \"$f\"`", "Sin comillas, el valor se corta en los espacios: escribir `rm \"$f\"`"],
    w: [
      ["`rm` always splits its arguments on spaces", "`rm` coupe toujours ses arguments aux espaces", "`rm` siempre corta sus argumentos en los espacios"],
      ["The single quotes were kept in the value", "Les apostrophes sont restées dans la valeur", "Las comillas simples se quedaron en el valor"],
      ["File names cannot contain spaces", "Les noms de fichiers ne peuvent pas contenir d'espaces", "Los nombres de archivo no pueden contener espacios"],
    ],
    e: [
      "Word splitting (and globbing) apply to unquoted expansions. Quoting variables is the first rule of shell scripting; `shellcheck` warns about it.",
      "Le découpage en mots (et les jokers) s'appliquent aux développements sans guillemets. Mettre les variables entre guillemets est la première règle des scripts ; `shellcheck` le signale.",
      "La división en palabras (y los comodines) se aplican a las expansiones sin comillas. Entrecomillar las variables es la primera regla de los scripts; `shellcheck` lo avisa.",
    ],
  },
  {
    id: "lx-exp-03",
    q: ["What does `mkdir -p photos/{2025,2026}/{jan,feb}` create?", "Que crée `mkdir -p photos/{2025,2026}/{jan,feb}` ?", "¿Qué crea `mkdir -p photos/{2025,2026}/{jan,feb}`?"],
    a: ["Four directories: `photos/2025/jan`, `photos/2025/feb`, `photos/2026/jan`, `photos/2026/feb`", "Quatre répertoires : `photos/2025/jan`, `photos/2025/feb`, `photos/2026/jan`, `photos/2026/feb`", "Cuatro directorios: `photos/2025/jan`, `photos/2025/feb`, `photos/2026/jan`, `photos/2026/feb`"],
    w: [
      ["One directory, with braces in its name", "Un seul répertoire, avec des accolades dans son nom", "Un solo directorio, con llaves en su nombre"],
      ["Two directories: `photos/2025` and `photos/2026`", "Deux répertoires : `photos/2025` et `photos/2026`", "Dos directorios: `photos/2025` y `photos/2026`"],
      ["Nothing: braces need quotes", "Rien : les accolades demandent des guillemets", "Nada: las llaves necesitan comillas"],
    ],
    e: [
      "Brace expansion produces every combination, before the command runs and whether the paths exist or not. `{1..5}` gives a sequence.",
      "Le développement des accolades produit toutes les combinaisons, avant que la commande ne tourne et que les chemins existent ou non. `{1..5}` donne une suite.",
      "La expansión de llaves produce todas las combinaciones, antes de que se ejecute la orden y existan o no las rutas. `{1..5}` da una secuencia.",
    ],
  },
  {
    id: "lx-exp-04",
    q: ["With `f=report.txt`, what does `echo \"${f%.txt}.pdf\"` print?", "Avec `f=report.txt`, qu'affiche `echo \"${f%.txt}.pdf\"` ?", "Con `f=report.txt`, ¿qué muestra `echo \"${f%.txt}.pdf\"`?"],
    a: ["`report.pdf`", "`report.pdf`", "`report.pdf`"],
    w: [["`report.txt.pdf`", "`report.txt.pdf`", "`report.txt.pdf`"], ["`.pdf`", "`.pdf`", "`.pdf`"], ["`report%.txt.pdf`", "`report%.txt.pdf`", "`report%.txt.pdf`"]],
    e: [
      "`%` removes the shortest matching suffix, `%%` the longest; `#` and `##` do the same from the start. `${f:-x}` gives `x` if `f` is empty or unset.",
      "`%` retire le plus court suffixe qui correspond, `%%` le plus long ; `#` et `##` font de même depuis le début. `${f:-x}` donne `x` si `f` est vide ou non définie.",
      "`%` quita el sufijo coincidente más corto, `%%` el más largo; `#` y `##` hacen lo mismo desde el principio. `${f:-x}` da `x` si `f` está vacía o sin definir.",
    ],
  },
  {
    id: "lx-exp-05",
    q: ["What does `echo $((7 / 2))` print in bash?", "Qu'affiche `echo $((7 / 2))` dans bash ?", "¿Qué muestra `echo $((7 / 2))` en bash?"],
    a: ["`3`: integer arithmetic", "`3` : arithmétique entière", "`3`: aritmética entera"],
    w: [["`3.5`", "`3.5`", "`3.5`"], ["`7 / 2`", "`7 / 2`", "`7 / 2`"], ["`4`", "`4`", "`4`"]],
    e: [
      "bash only knows integers and truncates. For decimals: `echo 'scale=2; 7/2' | bc`, or `awk 'BEGIN {print 7/2}'`.",
      "bash ne connaît que les entiers et tronque. Pour des décimales : `echo 'scale=2; 7/2' | bc`, ou `awk 'BEGIN {print 7/2}'`.",
      "bash solo conoce enteros y trunca. Para decimales: `echo 'scale=2; 7/2' | bc`, o `awk 'BEGIN {print 7/2}'`.",
    ],
  },
  {
    id: "lx-exp-06",
    q: ["In a directory with no `.xyz` file, what does bash pass to `ls` for `ls *.xyz`?", "Dans un répertoire sans fichier `.xyz`, que transmet bash à `ls` pour `ls *.xyz` ?", "En un directorio sin archivos `.xyz`, ¿qué pasa bash a `ls` con `ls *.xyz`?"],
    a: ["The pattern itself, `*.xyz`, so `ls` complains it does not exist", "Le motif lui-même, `*.xyz`, si bien que `ls` se plaint qu'il n'existe pas", "El propio patrón, `*.xyz`, así que `ls` se queja de que no existe"],
    w: [
      ["Nothing, so `ls` lists the whole directory", "Rien, si bien que `ls` liste tout le répertoire", "Nada, así que `ls` lista todo el directorio"],
      ["Every file of the directory", "Tous les fichiers du répertoire", "Todos los archivos del directorio"],
      ["An error from bash before `ls` runs", "Une erreur de bash avant que `ls` ne tourne", "Un error de bash antes de que se ejecute `ls`"],
    ],
    e: [
      "That is bash's default; `shopt -s nullglob` makes it expand to nothing, `failglob` to an error. zsh reports 'no matches found' by default.",
      "C'est le comportement par défaut de bash ; `shopt -s nullglob` le fait développer en rien, `failglob` en erreur. zsh répond « no matches found » par défaut.",
      "Es el comportamiento por defecto de bash; `shopt -s nullglob` lo expande a nada y `failglob` a un error. zsh responde «no matches found» por defecto.",
    ],
  },
];

const control: LinuxQuestion[] = [
  {
    id: "lx-ctl-01",
    q: ["What does `$?` hold right after a command?", "Que contient `$?` juste après une commande ?", "¿Qué contiene `$?` justo después de una orden?"],
    a: ["Its exit status: 0 for success, another number for failure", "Son code de sortie : 0 en cas de succès, un autre nombre en cas d'échec", "Su código de salida: 0 si tuvo éxito, otro número si falló"],
    w: [
      ["Its process number", "Son numéro de processus", "Su número de proceso"],
      ["The number of arguments it received", "Le nombre d'arguments qu'elle a reçus", "El número de argumentos que recibió"],
      ["The last line it printed", "La dernière ligne qu'elle a affichée", "La última línea que mostró"],
    ],
    e: [
      "The shell's process number is `$$`, the last background job's `$!`, the number of arguments `$#`.",
      "Le numéro de processus du shell est `$$`, celui de la dernière tâche de fond `$!`, le nombre d'arguments `$#`.",
      "El número de proceso del shell es `$$`, el de la última tarea en segundo plano `$!`, el número de argumentos `$#`.",
    ],
  },
  {
    id: "lx-ctl-02",
    q: ["When does `cmd2` run in `cmd1 && cmd2 || cmd3`?", "Quand `cmd2` s'exécute-t-il dans `cmd1 && cmd2 || cmd3` ?", "¿Cuándo se ejecuta `cmd2` en `cmd1 && cmd2 || cmd3`?"],
    a: ["Only if `cmd1` succeeds; and `cmd3` runs if `cmd1` or `cmd2` fails", "Seulement si `cmd1` réussit ; et `cmd3` s'exécute si `cmd1` ou `cmd2` échoue", "Solo si `cmd1` tiene éxito; y `cmd3` se ejecuta si falla `cmd1` o `cmd2`"],
    w: [
      ["Always, after `cmd1`", "Toujours, après `cmd1`", "Siempre, después de `cmd1`"],
      ["Only if `cmd1` fails", "Seulement si `cmd1` échoue", "Solo si `cmd1` falla"],
      ["At the same time as `cmd1`", "En même temps que `cmd1`", "A la vez que `cmd1`"],
    ],
    e: [
      "So `a && b || c` is not exactly an if/else: `c` also runs when `b` fails. `;` runs in sequence regardless, `&` in the background.",
      "`a && b || c` n'est donc pas tout à fait un si/sinon : `c` s'exécute aussi quand `b` échoue. `;` enchaîne sans condition, `&` lance en arrière-plan.",
      "Así que `a && b || c` no es exactamente un si/si no: `c` también se ejecuta cuando falla `b`. `;` encadena sin condición, `&` lanza en segundo plano.",
    ],
  },
  {
    id: "lx-ctl-03",
    q: ["What does `set -euo pipefail` at the top of a bash script do?", "Que fait `set -euo pipefail` en tête d'un script bash ?", "¿Qué hace `set -euo pipefail` al principio de un script de bash?"],
    a: ["Stops on a failing command, treats unset variables as errors, and fails a pipeline if any part fails", "Arrête sur une commande en échec, traite les variables non définies comme des erreurs, et fait échouer un tube si une partie échoue", "Para ante una orden que falla, trata las variables sin definir como errores y hace fallar una tubería si falla cualquier parte"],
    w: [
      ["Prints each command before running it", "Affiche chaque commande avant de l'exécuter", "Muestra cada orden antes de ejecutarla"],
      ["Makes the script run faster", "Fait tourner le script plus vite", "Hace que el script vaya más rápido"],
      ["Exports every variable", "Exporte toutes les variables", "Exporta todas las variables"],
    ],
    e: [
      "Without `pipefail`, a pipeline's status is its last command's. Tracing is `set -x`, exporting everything `set -a`.",
      "Sans `pipefail`, le statut d'un tube est celui de sa dernière commande. La trace, c'est `set -x` ; tout exporter, `set -a`.",
      "Sin `pipefail`, el estado de una tubería es el de su última orden. La traza es `set -x`; exportarlo todo, `set -a`.",
    ],
  },
  {
    id: "lx-ctl-04",
    q: ["`./backup.sh` answers 'Permission denied' although you own the file. Why?", "`./backup.sh` répond « Permission denied » alors que le fichier vous appartient. Pourquoi ?", "`./backup.sh` responde «Permission denied» aunque el archivo es suyo. ¿Por qué?"],
    a: ["It lacks the execute permission: `chmod +x backup.sh`, or run `bash backup.sh`", "Il lui manque le droit d'exécution : `chmod +x backup.sh`, ou lancer `bash backup.sh`", "Le falta el permiso de ejecución: `chmod +x backup.sh`, o ejecutar `bash backup.sh`"],
    w: [
      ["Scripts must be run with `sudo`", "Les scripts doivent être lancés avec `sudo`", "Los scripts deben ejecutarse con `sudo`"],
      ["The current directory is not in `PATH`", "Le répertoire courant n'est pas dans `PATH`", "El directorio actual no está en `PATH`"],
      ["The first line must be `#!/bin/sh`", "La première ligne doit être `#!/bin/sh`", "La primera línea debe ser `#!/bin/sh`"],
    ],
    e: [
      "`./` already bypasses `PATH` (without it the answer would be 'command not found'). A filesystem mounted `noexec` gives the same error.",
      "`./` contourne déjà `PATH` (sans lui, la réponse serait « command not found »). Un système de fichiers monté `noexec` donne la même erreur.",
      "`./` ya evita `PATH` (sin él la respuesta sería «command not found»). Un sistema de archivos montado con `noexec` da el mismo error.",
    ],
  },
  {
    id: "lx-ctl-05",
    q: ["`setenv.sh` sets `export DB=prod`. After `./setenv.sh`, `echo \"$DB\"` is empty. Why?", "`setenv.sh` fait `export DB=prod`. Après `./setenv.sh`, `echo \"$DB\"` est vide. Pourquoi ?", "`setenv.sh` hace `export DB=prod`. Tras `./setenv.sh`, `echo \"$DB\"` está vacío. ¿Por qué?"],
    a: ["The script ran in a child process; `source setenv.sh` runs it in the current shell", "Le script a tourné dans un processus enfant ; `source setenv.sh` l'exécute dans le shell courant", "El script se ejecutó en un proceso hijo; `source setenv.sh` lo ejecuta en el shell actual"],
    w: [
      ["`export` needs `sudo`", "`export` demande `sudo`", "`export` requiere `sudo`"],
      ["Variables are erased at the end of each line", "Les variables sont effacées à la fin de chaque ligne", "Las variables se borran al final de cada línea"],
      ["`echo` cannot print variables", "`echo` ne sait pas afficher les variables", "`echo` no sabe mostrar variables"],
    ],
    e: [
      "A child cannot change its parent's environment. `. setenv.sh` is the same as `source`.",
      "Un enfant ne peut pas changer l'environnement de son parent. `. setenv.sh` équivaut à `source`.",
      "Un hijo no puede cambiar el entorno de su padre. `. setenv.sh` equivale a `source`.",
    ],
  },
  {
    id: "lx-ctl-06",
    q: ["In a script, what is `\"$@\"`?", "Dans un script, qu'est-ce que `\"$@\"` ?", "En un script, ¿qué es `\"$@\"`?"],
    a: ["All the arguments, each kept as one word, spaces included", "Tous les arguments, chacun gardé comme un mot, espaces compris", "Todos los argumentos, cada uno conservado como una palabra, espacios incluidos"],
    w: [
      ["The number of arguments", "Le nombre d'arguments", "El número de argumentos"],
      ["All the arguments joined into one word", "Tous les arguments réunis en un seul mot", "Todos los argumentos unidos en una sola palabra"],
      ["The script's own name", "Le nom du script lui-même", "El nombre del propio script"],
    ],
    e: [
      "`\"$*\"` joins them into one word, `$#` counts them, `$0` is the script's name. `\"$@\"` is the right way to pass arguments on.",
      "`\"$*\"` les réunit en un seul mot, `$#` les compte, `$0` est le nom du script. `\"$@\"` est la bonne façon de transmettre les arguments.",
      "`\"$*\"` los une en una sola palabra, `$#` los cuenta, `$0` es el nombre del script. `\"$@\"` es la forma correcta de pasar los argumentos.",
    ],
  },
  {
    id: "lx-ctl-07",
    q: ["What does `trap 'rm -f \"$tmp\"' EXIT` do in a script?", "Que fait `trap 'rm -f \"$tmp\"' EXIT` dans un script ?", "¿Qué hace `trap 'rm -f \"$tmp\"' EXIT` en un script?"],
    a: ["Deletes the temporary file whenever the script ends, even on an error", "Supprime le fichier temporaire dès que le script se termine, même sur une erreur", "Borra el archivo temporal cuando termine el script, incluso por un error"],
    w: [
      ["Deletes it now, then exits", "Le supprime tout de suite, puis quitte", "Lo borra ahora y luego sale"],
      ["Prevents the script from exiting", "Empêche le script de se terminer", "Impide que el script termine"],
      ["Deletes it only if the script succeeds", "Ne le supprime que si le script réussit", "Solo lo borra si el script tiene éxito"],
    ],
    e: [
      "`EXIT` runs whenever the shell exits, including after a `set -e` failure. A `kill -9` cannot be trapped.",
      "`EXIT` s'exécute chaque fois que le shell se termine, y compris après un échec avec `set -e`. Un `kill -9` ne peut pas être intercepté.",
      "`EXIT` se ejecuta siempre que el shell termina, también tras un fallo con `set -e`. Un `kill -9` no se puede interceptar.",
    ],
  },
];

const environment: LinuxQuestion[] = [
  {
    id: "lx-env-01",
    q: ["What does `export` add to `API_URL=https://example.org`?", "Qu'apporte `export` à `API_URL=https://example.org` ?", "¿Qué añade `export` a `API_URL=https://example.org`?"],
    a: ["The variable is passed on to the programs the shell starts", "La variable est transmise aux programmes que le shell lance", "La variable se pasa a los programas que lanza el shell"],
    w: [
      ["It saves the variable for future sessions", "Il enregistre la variable pour les sessions futures", "Guarda la variable para futuras sesiones"],
      ["It makes the variable read-only", "Il met la variable en lecture seule", "Hace la variable de solo lectura"],
      ["It shares the variable with every open terminal", "Il partage la variable avec tous les terminaux ouverts", "Comparte la variable con todos los terminales abiertos"],
    ],
    e: [
      "Without `export` the variable stays in the shell. To keep it, add the line to `~/.bashrc` (or `~/.profile`). Read-only is `readonly`.",
      "Sans `export`, la variable reste dans le shell. Pour la garder, ajouter la ligne à `~/.bashrc` (ou `~/.profile`). La lecture seule, c'est `readonly`.",
      "Sin `export`, la variable se queda en el shell. Para conservarla, añadir la línea a `~/.bashrc` (o `~/.profile`). Solo lectura es `readonly`.",
    ],
  },
  {
    id: "lx-env-02",
    q: ["What does `TZ=Asia/Tokyo date` do?", "Que fait `TZ=Asia/Tokyo date` ?", "¿Qué hace `TZ=Asia/Tokyo date`?"],
    a: ["Runs `date` with `TZ` set for that command only", "Lance `date` avec `TZ` défini pour cette seule commande", "Ejecuta `date` con `TZ` definida solo para esa orden"],
    w: [
      ["Changes the system's time zone", "Change le fuseau horaire du système", "Cambia la zona horaria del sistema"],
      ["Sets `TZ` for the rest of the session", "Définit `TZ` pour le reste de la session", "Define `TZ` para el resto de la sesión"],
      ["It is a syntax error without `export`", "C'est une erreur de syntaxe sans `export`", "Es un error de sintaxis sin `export`"],
    ],
    e: [
      "`VAR=value command` puts the variable in that command's environment only. The system zone is set with `timedatectl set-timezone`.",
      "`VAR=valeur commande` place la variable dans l'environnement de cette commande seulement. Le fuseau du système se règle avec `timedatectl set-timezone`.",
      "`VAR=valor orden` pone la variable solo en el entorno de esa orden. La zona del sistema se ajusta con `timedatectl set-timezone`.",
    ],
  },
  {
    id: "lx-env-03",
    q: ["Why must a program in the current directory be started as `./prog` and not `prog`?", "Pourquoi un programme du répertoire courant doit-il être lancé par `./prog` et non `prog` ?", "¿Por qué un programa del directorio actual debe lanzarse como `./prog` y no `prog`?"],
    a: ["Commands are looked up in the `PATH` directories, and `.` is normally not one of them", "Les commandes sont cherchées dans les répertoires de `PATH`, et `.` n'en fait normalement pas partie", "Las órdenes se buscan en los directorios de `PATH`, y `.` normalmente no es uno de ellos"],
    w: [
      ["`./` gives it root's rights", "`./` lui donne les droits de root", "`./` le da los derechos de root"],
      ["`./` compiles it first", "`./` le compile d'abord", "`./` lo compila primero"],
      ["Programs without an extension need `./`", "Les programmes sans extension demandent `./`", "Los programas sin extensión requieren `./`"],
    ],
    e: [
      "Leaving `.` out of `PATH` stops a planted `ls` in some directory from running instead of `/usr/bin/ls`.",
      "Laisser `.` hors de `PATH` empêche un `ls` déposé dans un répertoire de s'exécuter à la place de `/usr/bin/ls`.",
      "Dejar `.` fuera de `PATH` impide que un `ls` colocado en algún directorio se ejecute en lugar de `/usr/bin/ls`.",
    ],
  },
  {
    id: "lx-env-04",
    q: ["You typed `apt update` and got 'Permission denied'. What does `sudo !!` do?", "Vous avez tapé `apt update` et obtenu « Permission denied ». Que fait `sudo !!` ?", "Escribió `apt update` y obtuvo «Permission denied». ¿Qué hace `sudo !!`?"],
    a: ["Runs the previous command again, with `sudo` in front", "Relance la commande précédente, précédée de `sudo`", "Vuelve a ejecutar la orden anterior, precedida de `sudo`"],
    w: [
      ["Runs `sudo` twice", "Lance `sudo` deux fois", "Ejecuta `sudo` dos veces"],
      ["Forces `sudo` without a password", "Force `sudo` sans mot de passe", "Fuerza `sudo` sin contraseña"],
      ["Repeats the last `sudo` command", "Répète la dernière commande `sudo`", "Repite la última orden con `sudo`"],
    ],
    e: [
      "`!!` is history expansion of the last command; `!$` its last argument. Ctrl-R searches the history as you type.",
      "`!!` est le développement d'historique de la dernière commande ; `!$` son dernier argument. Ctrl-R cherche dans l'historique au fil de la frappe.",
      "`!!` es la expansión del historial de la última orden; `!$` su último argumento. Ctrl-R busca en el historial mientras escribe.",
    ],
  },
  {
    id: "lx-env-05",
    q: ["An `alias ll='ls -l'` typed in a terminal is gone in the next one. Where should it go?", "Un `alias ll='ls -l'` tapé dans un terminal a disparu dans le suivant. Où faut-il le mettre ?", "Un `alias ll='ls -l'` escrito en un terminal ya no está en el siguiente. ¿Dónde hay que ponerlo?"],
    a: ["In `~/.bashrc` (`~/.zshrc` for zsh), read by each new interactive shell", "Dans `~/.bashrc` (`~/.zshrc` pour zsh), lu par chaque nouveau shell interactif", "En `~/.bashrc` (`~/.zshrc` para zsh), que lee cada nuevo shell interactivo"],
    w: [
      ["In `/etc/hosts`", "Dans `/etc/hosts`", "En `/etc/hosts`"],
      ["In `~/.bash_history`", "Dans `~/.bash_history`", "En `~/.bash_history`"],
      ["Nowhere: aliases cannot be kept", "Nulle part : les alias ne se gardent pas", "En ningún sitio: los alias no se conservan"],
    ],
    e: [
      "Login shells read `~/.bash_profile` or `~/.profile`, which usually source `~/.bashrc`. `source ~/.bashrc` applies it to the current shell.",
      "Les shells de connexion lisent `~/.bash_profile` ou `~/.profile`, qui chargent en général `~/.bashrc`. `source ~/.bashrc` l'applique au shell courant.",
      "Los shells de inicio de sesión leen `~/.bash_profile` o `~/.profile`, que suelen cargar `~/.bashrc`. `source ~/.bashrc` lo aplica al shell actual.",
    ],
  },
];

export const shell = { redirection, expansion, control, environment };
