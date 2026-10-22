/**
 * Linux, tools worth installing: search, viewing, JSON, monitoring, workflow,
 * diagnostics. Each question says how to install its tool.
 */
import type { LinuxQuestion } from "./types";

const search: LinuxQuestion[] = [
  {
    id: "lx-rg-01",
    q: ["What does `rg TODO` skip by default that `grep -r TODO .` reads?", "Qu'est-ce que `rg TODO` saute par défaut, alors que `grep -r TODO .` le lit ?", "¿Qué omite `rg TODO` por defecto que `grep -r TODO .` sí lee?"],
    a: ["Files listed in `.gitignore`, hidden files and binary files", "Les fichiers listés dans `.gitignore`, les fichiers cachés et les fichiers binaires", "Los archivos listados en `.gitignore`, los ocultos y los binarios"],
    w: [
      ["Files larger than 1 MB", "Les fichiers de plus de 1 Mo", "Los archivos de más de 1 MB"],
      ["Subdirectories", "Les sous-répertoires", "Los subdirectorios"],
      ["Nothing: it is only faster", "Rien : il est seulement plus rapide", "Nada: solo es más rápido"],
    ],
    e: [
      "ripgrep is recursive and much faster on code trees. `rg -uuu` searches everything, like grep; `rg -t py` limits it to Python files.",
      "ripgrep est récursif et bien plus rapide sur du code. `rg -uuu` cherche partout, comme grep ; `rg -t py` se limite aux fichiers Python.",
      "ripgrep es recursivo y mucho más rápido en árboles de código. `rg -uuu` busca en todo, como grep; `rg -t py` se limita a los archivos Python.",
    ],
    install: { apt: "ripgrep", dnf: "ripgrep", brew: "ripgrep" },
  },
  {
    id: "lx-fd-01",
    q: ["After `sudo apt install fd-find` on Debian, `fd` gives 'command not found'. Why?", "Après `sudo apt install fd-find` sous Debian, `fd` répond « command not found ». Pourquoi ?", "Tras `sudo apt install fd-find` en Debian, `fd` responde «command not found». ¿Por qué?"],
    a: ["Debian names the program `fdfind`, as another package already used `fd`", "Debian nomme le programme `fdfind`, un autre paquet utilisant déjà `fd`", "Debian llama al programa `fdfind`, porque otro paquete ya usaba `fd`"],
    w: [
      ["The package only installs a library", "Le paquet n'installe qu'une bibliothèque", "El paquete solo instala una biblioteca"],
      ["A new shell is needed for any new program", "Il faut un nouveau shell pour tout nouveau programme", "Hace falta un shell nuevo para cualquier programa nuevo"],
      ["`fd` must be run with `sudo`", "`fd` doit être lancé avec `sudo`", "`fd` debe ejecutarse con `sudo`"],
    ],
    e: [
      "A link fixes it: `ln -s \"$(which fdfind)\" ~/.local/bin/fd`. The same happens to `bat`, installed as `batcat`.",
      "Un lien règle cela : `ln -s \"$(which fdfind)\" ~/.local/bin/fd`. Il en va de même pour `bat`, installé sous le nom `batcat`.",
      "Un enlace lo arregla: `ln -s \"$(which fdfind)\" ~/.local/bin/fd`. Lo mismo pasa con `bat`, instalado como `batcat`.",
    ],
    install: { apt: "fd-find", dnf: "fd-find", brew: "fd" },
  },
  {
    id: "lx-fd-02",
    q: ["Which `fd` command does the job of `find . -name '*.py'`?", "Quelle commande `fd` fait le travail de `find . -name '*.py'` ?", "¿Qué orden de `fd` hace el trabajo de `find . -name '*.py'`?"],
    a: ["`fd -e py`", "`fd -e py`", "`fd -e py`"],
    w: [["`fd *.py`", "`fd *.py`", "`fd *.py`"], ["`fd -name py`", "`fd -name py`", "`fd -name py`"], ["`fd --type py`", "`fd --type py`", "`fd --type py`"]],
    e: [
      "`-e` filters by extension; the pattern itself is a regular expression (`fd '^test_'`), and `-t f` keeps files only. Like rg, fd skips ignored and hidden files.",
      "`-e` filtre par extension ; le motif lui-même est une expression régulière (`fd '^test_'`), et `-t f` ne garde que les fichiers. Comme rg, fd saute les fichiers ignorés et cachés.",
      "`-e` filtra por extensión; el patrón en sí es una expresión regular (`fd '^test_'`), y `-t f` deja solo archivos. Como rg, fd omite los archivos ignorados y ocultos.",
    ],
    install: { apt: "fd-find", dnf: "fd-find", brew: "fd" },
  },
  {
    id: "lx-fzf-01",
    q: ["What does `fzf` do?", "Que fait `fzf` ?", "¿Qué hace `fzf`?"],
    a: ["Lets you pick lines from its input by typing a few letters, then prints the choice", "Permet de choisir des lignes de son entrée en tapant quelques lettres, puis affiche le choix", "Permite elegir líneas de su entrada escribiendo unas letras y luego muestra la elección"],
    w: [
      ["Formats text into fixed-width columns", "Met du texte en colonnes de largeur fixe", "Formatea texto en columnas de ancho fijo"],
      ["Checks a filesystem for errors", "Vérifie un système de fichiers", "Comprueba un sistema de archivos"],
      ["Compresses files faster than gzip", "Compresse des fichiers plus vite que gzip", "Comprime archivos más rápido que gzip"],
    ],
    e: [
      "Examples: `vim \"$(fzf)\"`, `git switch \"$(git branch | fzf)\"`. Its shell integration turns Ctrl-R into a fuzzy history search.",
      "Exemples : `vim \"$(fzf)\"`, `git switch \"$(git branch | fzf)\"`. Son intégration au shell transforme Ctrl-R en recherche approximative dans l'historique.",
      "Ejemplos: `vim \"$(fzf)\"`, `git switch \"$(git branch | fzf)\"`. Su integración con el shell convierte Ctrl-R en una búsqueda aproximada en el historial.",
    ],
    install: { apt: "fzf", dnf: "fzf", brew: "fzf" },
  },
  {
    id: "lx-z-01",
    q: ["With zoxide set up, what does `z proj` do?", "Avec zoxide installé, que fait `z proj` ?", "Con zoxide configurado, ¿qué hace `z proj`?"],
    a: ["Jumps to the directory matching 'proj' that you use most and most recently", "Va dans le répertoire correspondant à « proj » que vous utilisez le plus et le plus récemment", "Salta al directorio que coincide con «proj» que más y más recientemente usa"],
    w: [
      ["Compresses the `proj` directory", "Compresse le répertoire `proj`", "Comprime el directorio `proj`"],
      ["Creates `proj` and enters it", "Crée `proj` et y entre", "Crea `proj` y entra en él"],
      ["Searches files named 'proj'", "Cherche les fichiers nommés « proj »", "Busca archivos llamados «proj»"],
    ],
    e: [
      "It learns from every `cd`. Setup: `eval \"$(zoxide init bash)\"` in `~/.bashrc`; `zi` chooses interactively with fzf.",
      "Il apprend de chaque `cd`. Mise en place : `eval \"$(zoxide init bash)\"` dans `~/.bashrc` ; `zi` fait choisir avec fzf.",
      "Aprende de cada `cd`. Configuración: `eval \"$(zoxide init bash)\"` en `~/.bashrc`; `zi` permite elegir con fzf.",
    ],
    install: { apt: "zoxide", dnf: "zoxide", brew: "zoxide" },
  },
];

const viewers: LinuxQuestion[] = [
  {
    id: "lx-bat-01",
    q: ["What does `bat app.py` add to `cat app.py`?", "Qu'ajoute `bat app.py` à `cat app.py` ?", "¿Qué añade `bat app.py` a `cat app.py`?"],
    a: ["Syntax highlighting, line numbers, Git changes and paging", "La coloration syntaxique, les numéros de ligne, les changements Git et la pagination", "Resaltado de sintaxis, números de línea, cambios de Git y paginación"],
    w: [
      ["Automatic formatting of the code", "La mise en forme automatique du code", "El formateo automático del código"],
      ["Running the file", "L'exécution du fichier", "La ejecución del archivo"],
      ["Spell checking", "La correction orthographique", "La corrección ortográfica"],
    ],
    e: [
      "When its output goes to a pipe, it behaves like `cat`. On Debian and Ubuntu the program is called `batcat`.",
      "Quand sa sortie part dans un tube, il se comporte comme `cat`. Sous Debian et Ubuntu, le programme s'appelle `batcat`.",
      "Cuando su salida va a una tubería, se comporta como `cat`. En Debian y Ubuntu el programa se llama `batcat`.",
    ],
    install: { apt: "bat", dnf: "bat", brew: "bat" },
  },
  {
    id: "lx-eza-01",
    q: ["What is `eza`?", "Qu'est-ce que `eza` ?", "¿Qué es `eza`?"],
    a: ["A modern `ls`: colours, Git status per file, a tree view (`eza --tree`)", "Un `ls` moderne : couleurs, état Git de chaque fichier, vue en arbre (`eza --tree`)", "Un `ls` moderno: colores, estado de Git de cada archivo, vista en árbol (`eza --tree`)"],
    w: [
      ["A file archiver", "Un archiveur de fichiers", "Un archivador de archivos"],
      ["A text editor", "Un éditeur de texte", "Un editor de texto"],
      ["A disk partitioning tool", "Un outil de partitionnement", "Una herramienta de particionado"],
    ],
    e: [
      "It continues the unmaintained `exa`. `eza -l --git` shows each file's Git state; many people alias `ls` to it.",
      "Il prend la suite d'`exa`, abandonné. `eza -l --git` montre l'état Git de chaque fichier ; beaucoup en font un alias de `ls`.",
      "Continúa el abandonado `exa`. `eza -l --git` muestra el estado de Git de cada archivo; mucha gente lo usa como alias de `ls`.",
    ],
    install: { apt: "eza", dnf: "eza", brew: "eza" },
  },
  {
    id: "lx-tree-01",
    q: ["Which command shows a directory as a tree, two levels deep?", "Quelle commande montre un répertoire en arbre, sur deux niveaux ?", "¿Qué comando muestra un directorio en árbol, con dos niveles?"],
    a: ["`tree -L 2`", "`tree -L 2`", "`tree -L 2`"],
    w: [["`tree -d 2`", "`tree -d 2`", "`tree -d 2`"], ["`ls -R2`", "`ls -R2`", "`ls -R2`"], ["`du -L 2`", "`du -L 2`", "`du -L 2`"]],
    e: [
      "`-L` limits the depth, `-d` shows directories only, `-a` includes hidden files, `-I 'node_modules'` leaves a pattern out.",
      "`-L` limite la profondeur, `-d` ne montre que les répertoires, `-a` inclut les fichiers cachés, `-I 'node_modules'` exclut un motif.",
      "`-L` limita la profundidad, `-d` muestra solo directorios, `-a` incluye los ocultos, `-I 'node_modules'` excluye un patrón.",
    ],
    install: { apt: "tree", dnf: "tree", brew: "tree" },
  },
  {
    id: "lx-delta-01",
    q: ["What is `delta` (package git-delta) used for?", "À quoi sert `delta` (paquet git-delta) ?", "¿Para qué sirve `delta` (paquete git-delta)?"],
    a: ["Showing `git diff` output with syntax highlighting, side by side if wished", "Afficher la sortie de `git diff` avec coloration syntaxique, côte à côte si on veut", "Mostrar la salida de `git diff` con resaltado de sintaxis, en paralelo si se quiere"],
    w: [
      ["Computing the difference between two dates", "Calculer la différence entre deux dates", "Calcular la diferencia entre dos fechas"],
      ["Sending only changed blocks over the network", "Envoyer seulement les blocs modifiés sur le réseau", "Enviar solo los bloques cambiados por la red"],
      ["Merging Git branches automatically", "Fusionner des branches Git automatiquement", "Fusionar ramas de Git automáticamente"],
    ],
    e: [
      "It is set as Git's pager in `~/.gitconfig`: `core.pager = delta`, `interactive.diffFilter = delta --color-only`.",
      "On le règle comme pageur de Git dans `~/.gitconfig` : `core.pager = delta`, `interactive.diffFilter = delta --color-only`.",
      "Se configura como paginador de Git en `~/.gitconfig`: `core.pager = delta`, `interactive.diffFilter = delta --color-only`.",
    ],
    install: { apt: "git-delta", dnf: "git-delta", brew: "git-delta" },
  },
];

const json: LinuxQuestion[] = [
  {
    id: "lx-jq-01",
    q: ["What does `jq '.items[].name' data.json` print?", "Qu'affiche `jq '.items[].name' data.json` ?", "¿Qué muestra `jq '.items[].name' data.json`?"],
    a: ["The `name` of each element of the `items` array, one per line, as JSON strings", "Le `name` de chaque élément du tableau `items`, un par ligne, en chaînes JSON", "El `name` de cada elemento del array `items`, uno por línea, como cadenas JSON"],
    w: [
      ["The first item's name only", "Le nom du premier élément seulement", "Solo el nombre del primer elemento"],
      ["The number of items", "Le nombre d'éléments", "El número de elementos"],
      ["The file with `items` removed", "Le fichier sans `items`", "El archivo sin `items`"],
    ],
    e: [
      "`[]` iterates over the array. `jq -r` prints raw strings without quotes, ready for the shell; `jq '.items | length'` counts.",
      "`[]` parcourt le tableau. `jq -r` affiche les chaînes brutes, sans guillemets, prêtes pour le shell ; `jq '.items | length'` compte.",
      "`[]` recorre el array. `jq -r` muestra las cadenas en bruto, sin comillas, listas para el shell; `jq '.items | length'` cuenta.",
    ],
    install: { apt: "jq", dnf: "jq", brew: "jq" },
  },
  {
    id: "lx-jq-02",
    q: ["Which filter keeps the people older than 30 from a JSON array of `{name, age}`?", "Quel filtre garde les personnes de plus de 30 ans d'un tableau JSON de `{name, age}` ?", "¿Qué filtro conserva a las personas mayores de 30 de un array JSON de `{name, age}`?"],
    a: ["`jq '.[] | select(.age > 30)'`", "`jq '.[] | select(.age > 30)'`", "`jq '.[] | select(.age > 30)'`"],
    w: [["`jq '.[].age > 30'`", "`jq '.[].age > 30'`", "`jq '.[].age > 30'`"], ["`jq 'grep(.age > 30)'`", "`jq 'grep(.age > 30)'`", "`jq 'grep(.age > 30)'`"], ["`jq '.[age > 30]'`", "`jq '.[age > 30]'`", "`jq '.[age > 30]'`"]],
    e: [
      "`.[].age > 30` prints `true` or `false` for each person. Wrap in brackets to get an array back: `jq '[.[] | select(.age > 30)]'`, or use `map(select(…))`.",
      "`.[].age > 30` affiche `true` ou `false` pour chaque personne. Entourer de crochets pour retrouver un tableau : `jq '[.[] | select(.age > 30)]'`, ou utiliser `map(select(…))`.",
      "`.[].age > 30` muestra `true` o `false` para cada persona. Rodear con corchetes para recuperar un array: `jq '[.[] | select(.age > 30)]'`, o usar `map(select(…))`.",
    ],
    install: { apt: "jq", dnf: "jq", brew: "jq" },
  },
  {
    id: "lx-jq-03",
    q: ["An API returns JSON on one long line. What makes it readable?", "Une API renvoie du JSON sur une seule longue ligne. Qu'est-ce qui le rend lisible ?", "Una API devuelve JSON en una sola línea larga. ¿Qué lo hace legible?"],
    a: ["`curl -s https://api.example.org/items | jq .`", "`curl -s https://api.example.org/items | jq .`", "`curl -s https://api.example.org/items | jq .`"],
    w: [["`curl -s https://api.example.org/items | fold`", "`curl -s https://api.example.org/items | fold`", "`curl -s https://api.example.org/items | fold`"], ["`curl --pretty https://api.example.org/items`", "`curl --pretty https://api.example.org/items`", "`curl --pretty https://api.example.org/items`"], ["`curl -s https://api.example.org/items | column -t`", "`curl -s https://api.example.org/items | column -t`", "`curl -s https://api.example.org/items | column -t`"]],
    e: [
      "`.` is the identity filter: jq prints the input indented and in colour. `python3 -m json.tool` does the indenting without installing anything.",
      "`.` est le filtre identité : jq affiche l'entrée indentée et en couleur. `python3 -m json.tool` indente sans rien installer.",
      "`.` es el filtro identidad: jq muestra la entrada sangrada y en color. `python3 -m json.tool` sangra sin instalar nada.",
    ],
    install: { apt: "jq", dnf: "jq", brew: "jq" },
  },
];

const monitoring: LinuxQuestion[] = [
  {
    id: "lx-htop-01",
    q: ["What does `htop` offer over `top`?", "Qu'apporte `htop` par rapport à `top` ?", "¿Qué aporta `htop` frente a `top`?"],
    a: ["Bars per core and for memory, scrolling, a tree view, and keys to sort, search and kill", "Des barres par cœur et pour la mémoire, le défilement, une vue en arbre, et des touches pour trier, chercher et tuer", "Barras por núcleo y de memoria, desplazamiento, vista en árbol y teclas para ordenar, buscar y matar"],
    w: [
      ["It shows the processes of other machines", "Il montre les processus d'autres machines", "Muestra los procesos de otras máquinas"],
      ["It lowers CPU use automatically", "Il réduit automatiquement l'usage du processeur", "Reduce automáticamente el uso de CPU"],
      ["It records history to a file", "Il enregistre l'historique dans un fichier", "Guarda el historial en un archivo"],
    ],
    e: [
      "F5 tree, F6 sort, F3 search, F9 signal, F10 quit. `btop` adds graphs for disks and network.",
      "F5 arbre, F6 tri, F3 recherche, F9 signal, F10 quitter. `btop` ajoute des graphiques pour les disques et le réseau.",
      "F5 árbol, F6 ordenar, F3 buscar, F9 señal, F10 salir. `btop` añade gráficos de discos y red.",
    ],
    install: { apt: "htop", dnf: "htop", brew: "htop" },
  },
  {
    id: "lx-ncdu-01",
    q: ["The disk is full. Which tool lets you browse what takes the space and delete it on the spot?", "Le disque est plein. Quel outil permet de parcourir ce qui prend la place et de le supprimer sur place ?", "El disco está lleno. ¿Qué herramienta permite recorrer lo que ocupa espacio y borrarlo allí mismo?"],
    a: ["`ncdu`", "`ncdu`", "`ncdu`"],
    w: [["`fsck`", "`fsck`", "`fsck`"], ["`fdisk`", "`fdisk`", "`fdisk`"], ["`free`", "`free`", "`free`"]],
    e: [
      "It scans once, then lists directories by size; arrows to enter, `d` to delete. `ncdu -x /` stays on one filesystem.",
      "Il parcourt une fois, puis liste les répertoires par taille ; flèches pour entrer, `d` pour supprimer. `ncdu -x /` reste sur un seul système de fichiers.",
      "Analiza una vez y luego lista los directorios por tamaño; flechas para entrar, `d` para borrar. `ncdu -x /` se queda en un solo sistema de archivos.",
    ],
    install: { apt: "ncdu", dnf: "ncdu", brew: "ncdu" },
  },
  {
    id: "lx-duf-01",
    q: ["What is `duf`?", "Qu'est-ce que `duf` ?", "¿Qué es `duf`?"],
    a: ["A `df` with a readable table per device type, with usage bars", "Un `df` avec un tableau lisible par type de périphérique, avec des barres d'occupation", "Un `df` con una tabla legible por tipo de dispositivo, con barras de ocupación"],
    w: [
      ["A faster `du`", "Un `du` plus rapide", "Un `du` más rápido"],
      ["A duplicate file finder", "Un détecteur de fichiers en double", "Un buscador de archivos duplicados"],
      ["A disk benchmark", "Un banc d'essai de disques", "Un banco de pruebas de discos"],
    ],
    e: [
      "It separates local disks, network mounts and special filesystems. Directory sizes remain `du`'s (or `ncdu`'s) job.",
      "Il sépare disques locaux, montages réseau et systèmes de fichiers spéciaux. La taille des répertoires reste l'affaire de `du` (ou `ncdu`).",
      "Separa discos locales, montajes de red y sistemas de archivos especiales. El tamaño de los directorios sigue siendo tarea de `du` (o `ncdu`).",
    ],
    install: { apt: "duf", dnf: "duf", brew: "duf" },
  },
  {
    id: "lx-btop-01",
    q: ["Which of these tools shows CPU, memory, disks and network with live graphs, in the terminal?", "Lequel de ces outils montre processeur, mémoire, disques et réseau avec des graphiques en direct, dans le terminal ?", "¿Cuál de estas herramientas muestra CPU, memoria, discos y red con gráficos en directo, en el terminal?"],
    a: ["`btop`", "`btop`", "`btop`"],
    w: [["`vmstat`", "`vmstat`", "`vmstat`"], ["`uptime`", "`uptime`", "`uptime`"], ["`lscpu`", "`lscpu`", "`lscpu`"]],
    e: [
      "`vmstat 1` prints a line of figures per second, `uptime` the load, `lscpu` the processor's description.",
      "`vmstat 1` affiche une ligne de chiffres par seconde, `uptime` la charge, `lscpu` la description du processeur.",
      "`vmstat 1` muestra una línea de cifras por segundo, `uptime` la carga, `lscpu` la descripción del procesador.",
    ],
    install: { apt: "btop", dnf: "btop", brew: "btop" },
  },
];

const workflow: LinuxQuestion[] = [
  {
    id: "lx-tmux-01",
    q: ["Your SSH connection drops while a long job runs inside tmux. What then?", "Votre connexion SSH tombe pendant qu'un long travail tourne dans tmux. Et alors ?", "Su conexión SSH se corta mientras un trabajo largo se ejecuta dentro de tmux. ¿Y entonces?"],
    a: ["The job goes on; reconnect and run `tmux attach` to find it", "Le travail continue ; se reconnecter et lancer `tmux attach` pour le retrouver", "El trabajo sigue; volver a conectar y ejecutar `tmux attach` para recuperarlo"],
    w: [
      ["The job stops with the connection", "Le travail s'arrête avec la connexion", "El trabajo se detiene con la conexión"],
      ["The job restarts from the beginning", "Le travail recommence depuis le début", "El trabajo vuelve a empezar desde el principio"],
      ["The output is lost but the job goes on", "La sortie est perdue mais le travail continue", "La salida se pierde pero el trabajo sigue"],
    ],
    e: [
      "tmux runs the session on the server. Ctrl-b d detaches on purpose, Ctrl-b c opens a window, Ctrl-b % splits.",
      "tmux fait tourner la session sur le serveur. Ctrl-b d détache exprès, Ctrl-b c ouvre une fenêtre, Ctrl-b % partage l'écran.",
      "tmux ejecuta la sesión en el servidor. Ctrl-b d separa a propósito, Ctrl-b c abre una ventana, Ctrl-b % divide la pantalla.",
    ],
    install: { apt: "tmux", dnf: "tmux", brew: "tmux" },
  },
  {
    id: "lx-tldr-01",
    q: ["How does `tldr tar` differ from `man tar`?", "En quoi `tldr tar` diffère-t-il de `man tar` ?", "¿En qué se diferencia `tldr tar` de `man tar`?"],
    a: ["It shows a handful of common examples written by a community, not the full reference", "Il montre quelques exemples courants écrits par une communauté, pas la référence complète", "Muestra unos cuantos ejemplos habituales escritos por una comunidad, no la referencia completa"],
    w: [
      ["It is the same page, shorter by AI", "C'est la même page, raccourcie par une IA", "Es la misma página, acortada por una IA"],
      ["It explains the source code", "Il explique le code source", "Explica el código fuente"],
      ["It only works offline", "Il ne marche que hors ligne", "Solo funciona sin conexión"],
    ],
    e: [
      "Pages are downloaded and cached (`tldr --update`). The man page remains the reference for every option.",
      "Les pages sont téléchargées et gardées en cache (`tldr --update`). La page de man reste la référence pour chaque option.",
      "Las páginas se descargan y se guardan en caché (`tldr --update`). La página de man sigue siendo la referencia de cada opción.",
    ],
    install: { apt: "tldr", dnf: "tldr", brew: "tlrc" },
  },
  {
    id: "lx-entr-01",
    q: ["What does `ls *.py | entr -r python app.py` do?", "Que fait `ls *.py | entr -r python app.py` ?", "¿Qué hace `ls *.py | entr -r python app.py`?"],
    a: ["Restarts `python app.py` each time one of the listed files changes", "Relance `python app.py` chaque fois qu'un des fichiers listés change", "Reinicia `python app.py` cada vez que cambia uno de los archivos listados"],
    w: [
      ["Runs `app.py` once per file", "Lance `app.py` une fois par fichier", "Ejecuta `app.py` una vez por archivo"],
      ["Encrypts the Python files", "Chiffre les fichiers Python", "Cifra los archivos Python"],
      ["Records which files `app.py` reads", "Enregistre les fichiers que lit `app.py`", "Registra los archivos que lee `app.py`"],
    ],
    e: [
      "`-r` restarts a long-running process; without it, `entr` runs the command once per change (tests, a build).",
      "`-r` relance un processus qui dure ; sans lui, `entr` lance la commande une fois par changement (des tests, une compilation).",
      "`-r` reinicia un proceso que dura; sin él, `entr` ejecuta la orden una vez por cambio (pruebas, una compilación).",
    ],
    install: { apt: "entr", dnf: "entr", brew: "entr" },
  },
  {
    id: "lx-par-01",
    q: ["What does `parallel gzip ::: *.log` do?", "Que fait `parallel gzip ::: *.log` ?", "¿Qué hace `parallel gzip ::: *.log`?"],
    a: ["Compresses the log files several at a time, one job per processor core", "Compresse les journaux plusieurs à la fois, une tâche par cœur", "Comprime los registros varios a la vez, una tarea por núcleo"],
    w: [
      ["Compresses all the logs into one archive", "Compresse tous les journaux dans une seule archive", "Comprime todos los registros en un solo archivo"],
      ["Compresses each log twice", "Compresse chaque journal deux fois", "Comprime cada registro dos veces"],
      ["Splits each log in parallel parts", "Coupe chaque journal en parties parallèles", "Divide cada registro en partes paralelas"],
    ],
    e: [
      "`:::` gives the arguments; `-j 4` sets the number of jobs. It keeps each job's output together, which `xargs -P` does not.",
      "`:::` donne les arguments ; `-j 4` fixe le nombre de tâches. Il garde la sortie de chaque tâche groupée, ce que ne fait pas `xargs -P`.",
      "`:::` da los argumentos; `-j 4` fija el número de tareas. Mantiene junta la salida de cada tarea, cosa que `xargs -P` no hace.",
    ],
    install: { apt: "parallel", dnf: "parallel", brew: "parallel" },
  },
  {
    id: "lx-pv-01",
    q: ["What does `pv dump.sql | psql shop` add to `psql shop < dump.sql`?", "Qu'apporte `pv dump.sql | psql shop` par rapport à `psql shop < dump.sql` ?", "¿Qué aporta `pv dump.sql | psql shop` frente a `psql shop < dump.sql`?"],
    a: ["A progress bar with the rate and the time left", "Une barre de progression avec le débit et le temps restant", "Una barra de progreso con la velocidad y el tiempo restante"],
    w: [
      ["It checks the SQL before sending it", "Il vérifie le SQL avant de l'envoyer", "Comprueba el SQL antes de enviarlo"],
      ["It compresses the transfer", "Il compresse le transfert", "Comprime la transferencia"],
      ["It runs the import in parallel", "Il lance l'import en parallèle", "Ejecuta la importación en paralelo"],
    ],
    e: [
      "Pipe Viewer measures what flows through it. With a file name it knows the size, hence the time left.",
      "Pipe Viewer mesure ce qui passe à travers lui. Avec un nom de fichier, il connaît la taille, d'où le temps restant.",
      "Pipe Viewer mide lo que pasa por él. Con un nombre de archivo conoce el tamaño, y de ahí el tiempo restante.",
    ],
    install: { apt: "pv", dnf: "pv", brew: "pv" },
  },
  {
    id: "lx-hyp-01",
    q: ["Which tool times two commands properly, with warm-up runs and statistics?", "Quel outil chronomètre proprement deux commandes, avec des tours de chauffe et des statistiques ?", "¿Qué herramienta cronometra bien dos órdenes, con ejecuciones de calentamiento y estadísticas?"],
    a: ["`hyperfine 'rg TODO' 'grep -r TODO .'`", "`hyperfine 'rg TODO' 'grep -r TODO .'`", "`hyperfine 'rg TODO' 'grep -r TODO .'`"],
    w: [["`time rg TODO; time grep -r TODO .`", "`time rg TODO; time grep -r TODO .`", "`time rg TODO; time grep -r TODO .`"], ["`watch rg TODO`", "`watch rg TODO`", "`watch rg TODO`"], ["`perf top`", "`perf top`", "`perf top`"]],
    e: [
      "`time` measures one run, cache effects included. hyperfine repeats, reports mean and spread, and compares; `--warmup 3` fills the caches first.",
      "`time` mesure une seule exécution, effets de cache compris. hyperfine répète, donne moyenne et dispersion, et compare ; `--warmup 3` remplit d'abord les caches.",
      "`time` mide una sola ejecución, con los efectos de caché. hyperfine repite, da media y dispersión, y compara; `--warmup 3` llena antes las cachés.",
    ],
    install: { apt: "hyperfine", dnf: "hyperfine", brew: "hyperfine" },
  },
  {
    id: "lx-sc-01",
    q: ["What does `shellcheck deploy.sh` do?", "Que fait `shellcheck deploy.sh` ?", "¿Qué hace `shellcheck deploy.sh`?"],
    a: ["Reads the script without running it and warns about bugs such as unquoted variables", "Lit le script sans l'exécuter et signale des bogues comme les variables sans guillemets", "Lee el script sin ejecutarlo y avisa de errores como las variables sin comillas"],
    w: [
      ["Runs it in a sandbox", "L'exécute dans un bac à sable", "Lo ejecuta en un entorno aislado"],
      ["Checks its permissions", "Vérifie ses permissions", "Comprueba sus permisos"],
      ["Formats it", "Le met en forme", "Le da formato"],
    ],
    e: [
      "Each warning has a code (SC2086…) explained on its wiki. Formatting is `shfmt`'s job.",
      "Chaque avertissement a un code (SC2086…) expliqué sur son wiki. La mise en forme, c'est le rôle de `shfmt`.",
      "Cada aviso tiene un código (SC2086…) explicado en su wiki. Dar formato es tarea de `shfmt`.",
    ],
    install: { apt: "shellcheck", dnf: "ShellCheck", brew: "shellcheck" },
  },
];

const diagnostics: LinuxQuestion[] = [
  {
    id: "lx-mtr-01",
    q: ["What does `mtr example.org` show?", "Qu'affiche `mtr example.org` ?", "¿Qué muestra `mtr example.org`?"],
    a: ["Each router on the way, with its packet loss and latency, updated continuously", "Chaque routeur sur le chemin, avec ses pertes de paquets et sa latence, mis à jour en continu", "Cada router del camino, con su pérdida de paquetes y su latencia, actualizado continuamente"],
    w: [
      ["The open ports of example.org", "Les ports ouverts d'example.org", "Los puertos abiertos de example.org"],
      ["The web page's loading time", "Le temps de chargement de la page web", "El tiempo de carga de la página web"],
      ["The DNS records of example.org", "Les enregistrements DNS d'example.org", "Los registros DNS de example.org"],
    ],
    e: [
      "It combines `traceroute` and `ping`. Loss on one hop that does not carry on to the next is usually a router that limits its replies, not a real problem.",
      "Il combine `traceroute` et `ping`. Une perte sur un saut qui ne se prolonge pas aux suivants vient en général d'un routeur qui limite ses réponses, pas d'un vrai problème.",
      "Combina `traceroute` y `ping`. Una pérdida en un salto que no sigue en los siguientes suele ser un router que limita sus respuestas, no un problema real.",
    ],
    install: { apt: "mtr-tiny", dnf: "mtr", brew: "mtr" },
  },
  {
    id: "lx-nmap-01",
    q: ["What does `nmap -p 1-1000 192.168.1.10` do?", "Que fait `nmap -p 1-1000 192.168.1.10` ?", "¿Qué hace `nmap -p 1-1000 192.168.1.10`?"],
    a: ["Scans ports 1 to 1000 of that machine and reports which are open", "Scrute les ports 1 à 1000 de cette machine et indique ceux qui sont ouverts", "Explora los puertos 1 a 1000 de esa máquina e indica cuáles están abiertos"],
    w: [
      ["Pings 1000 machines", "Envoie un ping à 1000 machines", "Hace ping a 1000 máquinas"],
      ["Opens ports 1 to 1000 in the firewall", "Ouvre les ports 1 à 1000 dans le pare-feu", "Abre los puertos 1 a 1000 en el cortafuegos"],
      ["Measures the bandwidth on 1000 connections", "Mesure le débit sur 1000 connexions", "Mide el ancho de banda en 1000 conexiones"],
    ],
    e: [
      "Scan only machines you are responsible for: elsewhere it can be taken as an attack. `-sV` also guesses the services' versions.",
      "Ne scruter que des machines dont on est responsable : ailleurs, cela peut passer pour une attaque. `-sV` devine aussi les versions des services.",
      "Explorar solo máquinas de las que se es responsable: en otras puede tomarse como un ataque. `-sV` también adivina las versiones de los servicios.",
    ],
    install: { apt: "nmap", dnf: "nmap", brew: "nmap" },
  },
  {
    id: "lx-http-01",
    q: ["With HTTPie, what does `http POST api.example.org/users name=Ana` send?", "Avec HTTPie, qu'envoie `http POST api.example.org/users name=Ana` ?", "Con HTTPie, ¿qué envía `http POST api.example.org/users name=Ana`?"],
    a: ["A JSON body `{\"name\": \"Ana\"}`, and it shows the answer with colours", "Un corps JSON `{\"name\": \"Ana\"}`, et affiche la réponse en couleurs", "Un cuerpo JSON `{\"name\": \"Ana\"}`, y muestra la respuesta en colores"],
    w: [
      ["A form field, like `curl -d name=Ana`", "Un champ de formulaire, comme `curl -d name=Ana`", "Un campo de formulario, como `curl -d name=Ana`"],
      ["A query string `?name=Ana`", "Une chaîne de requête `?name=Ana`", "Una cadena de consulta `?name=Ana`"],
      ["A header `name: Ana`", "Un en-tête `name: Ana`", "Una cabecera `name: Ana`"],
    ],
    e: [
      "`key=value` goes into JSON, `key==value` into the query string, `Key:value` into a header; `-f` sends a form.",
      "`clé=valeur` va dans le JSON, `clé==valeur` dans la chaîne de requête, `Clé:valeur` dans un en-tête ; `-f` envoie un formulaire.",
      "`clave=valor` va al JSON, `clave==valor` a la cadena de consulta, `Clave:valor` a una cabecera; `-f` envía un formulario.",
    ],
    install: { apt: "httpie", dnf: "httpie", brew: "httpie" },
  },
  {
    id: "lx-strace-01",
    q: ["A program says 'config not found' without saying where it looked. What shows the paths it tries?", "Un programme dit « config not found » sans dire où il a cherché. Qu'est-ce qui montre les chemins qu'il essaie ?", "Un programa dice «config not found» sin decir dónde buscó. ¿Qué muestra las rutas que intenta?"],
    a: ["`strace -f -e trace=openat ./program`", "`strace -f -e trace=openat ./program`", "`strace -f -e trace=openat ./program`"],
    w: [["`lsof ./program`", "`lsof ./program`", "`lsof ./program`"], ["`ldd ./program`", "`ldd ./program`", "`ldd ./program`"], ["`file ./program`", "`file ./program`", "`file ./program`"]],
    e: [
      "strace lists the program's system calls; each `openat` that fails with ENOENT is a path it tried. `ldd` lists shared libraries, `file` the file type.",
      "strace liste les appels système du programme ; chaque `openat` qui échoue avec ENOENT est un chemin essayé. `ldd` liste les bibliothèques partagées, `file` le type de fichier.",
      "strace lista las llamadas al sistema del programa; cada `openat` que falla con ENOENT es una ruta intentada. `ldd` lista las bibliotecas compartidas, `file` el tipo de archivo.",
    ],
    install: { apt: "strace", dnf: "strace" },
  },
];

export const tools = { search, viewers, json, monitoring, workflow, diagnostics };
