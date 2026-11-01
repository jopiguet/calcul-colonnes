/**
 * Linux, Expert: questions added with the four levels (QUIZ_VERSION 5) where a
 * topic had few Expert questions. Same format as linux/*.ts.
 */
import type { LinuxQuestion } from "../linux/types";

const files: LinuxQuestion[] = [
  {
    id: "lx-files-x01",
    since: 5,
    q: ["What does `chattr +i notes.txt` do on ext4?", "Que fait `chattr +i notes.txt` sur ext4 ?", "¿Qué hace `chattr +i notes.txt` en ext4?"],
    a: ["Makes the file immutable: nobody, not even root, can change, rename or delete it until `chattr -i`", "Rend le fichier immuable : personne, même root, ne peut le modifier, le renommer ou le supprimer avant `chattr -i`", "Hace el archivo inmutable: nadie, ni siquiera root, puede cambiarlo, renombrarlo ni borrarlo hasta `chattr -i`"],
    w: [
      ["Hides the file from `ls`", "Cache le fichier à `ls`", "Oculta el archivo a `ls`"],
      ["Encrypts the file with the owner's key", "Chiffre le fichier avec la clé du propriétaire", "Cifra el archivo con la clave del propietario"],
      ["Makes the file executable by everyone", "Rend le fichier exécutable par tous", "Hace el archivo ejecutable por todos"],
    ],
    e: [
      "`i` is a file attribute, below the permissions: writes, renames, links and deletion are refused even for root, who must first remove it with `chattr -i`. `lsattr` shows the attributes.",
      "`i` est un attribut du fichier, en dessous des permissions : écriture, renommage, liens et suppression sont refusés même à root, qui doit d'abord l'enlever avec `chattr -i`. `lsattr` montre les attributs.",
      "`i` es un atributo del archivo, por debajo de los permisos: la escritura, el renombrado, los enlaces y el borrado se rechazan incluso a root, que primero debe quitarlo con `chattr -i`. `lsattr` muestra los atributos.",
    ],
  },
  {
    id: "lx-files-x02",
    since: 5,
    q: ["Why can `cp --reflink=always disk.img copy.img` finish at once on Btrfs or XFS, even for 50 GB?", "Pourquoi `cp --reflink=always disk.img copy.img` peut-il finir aussitôt sur Btrfs ou XFS, même pour 50 Go ?", "¿Por qué `cp --reflink=always disk.img copy.img` puede terminar al instante en Btrfs o XFS, incluso con 50 GB?"],
    a: ["The copy shares the original's data blocks until one of the two files is written to (copy on write)", "La copie partage les blocs de données de l'original jusqu'à ce que l'un des deux fichiers soit modifié (copie à l'écriture)", "La copia comparte los bloques de datos del original hasta que se escribe en uno de los dos archivos (copia en escritura)"],
    w: [
      ["It makes a hard link, so the two names are one file", "Il crée un lien physique : les deux noms sont un seul fichier", "Crea un enlace duro: los dos nombres son un solo archivo"],
      ["It copies only the metadata; the data is lost", "Il ne copie que les métadonnées ; les données sont perdues", "Solo copia los metadatos; los datos se pierden"],
      ["It compresses the copy on the fly", "Il compresse la copie à la volée", "Comprime la copia sobre la marcha"],
    ],
    e: [
      "A reflink is a second file pointing at the same extents; a block is copied only when one side changes it. Unlike a hard link, changing the copy leaves the original intact. On ext4 `--reflink=always` fails; `--reflink=auto` falls back to a normal copy.",
      "Un reflink est un second fichier pointant vers les mêmes extents ; un bloc n'est copié que quand l'un des côtés le modifie. Contrairement à un lien physique, modifier la copie laisse l'original intact. Sur ext4, `--reflink=always` échoue ; `--reflink=auto` revient à une copie normale.",
      "Un reflink es un segundo archivo que apunta a los mismos extents; un bloque solo se copia cuando uno de los lados lo cambia. A diferencia de un enlace duro, cambiar la copia deja intacto el original. En ext4 `--reflink=always` falla; `--reflink=auto` vuelve a una copia normal.",
    ],
  },
];

const shell: LinuxQuestion[] = [
  {
    id: "lx-shell-x01",
    since: 5,
    q: ["Why does `echo hi | read -r x; echo \"$x\"` print an empty line in bash?", "Pourquoi `echo hi | read -r x; echo \"$x\"` affiche-t-il une ligne vide en bash ?", "¿Por qué `echo hi | read -r x; echo \"$x\"` muestra una línea vacía en bash?"],
    a: ["Each part of a pipeline runs in a subshell, so `x` is set in a process that has already ended", "Chaque partie d'un pipeline tourne dans un sous-shell : `x` est défini dans un processus déjà terminé", "Cada parte de una tubería se ejecuta en una subshell: `x` se define en un proceso que ya terminó"],
    w: [
      ["`read` needs the `-p` option to store a value", "`read` a besoin de l'option `-p` pour garder une valeur", "`read` necesita la opción `-p` para guardar un valor"],
      ["`echo` writes to standard error, not to the pipe", "`echo` écrit sur la sortie d'erreur, pas dans le tube", "`echo` escribe en la salida de error, no en la tubería"],
      ["`x` is a reserved variable in bash", "`x` est une variable réservée de bash", "`x` es una variable reservada de bash"],
    ],
    e: [
      "bash forks every element of a pipeline, the last one included. `read -r x <<< \"hi\"` or `shopt -s lastpipe` (in a script) keeps the variable in the current shell. zsh runs the last element in the current shell.",
      "bash crée un processus pour chaque élément d'un pipeline, le dernier compris. `read -r x <<< \"hi\"` ou `shopt -s lastpipe` (dans un script) garde la variable dans le shell courant. zsh exécute le dernier élément dans le shell courant.",
      "bash crea un proceso para cada elemento de una tubería, incluido el último. `read -r x <<< \"hi\"` o `shopt -s lastpipe` (en un script) mantiene la variable en la shell actual. zsh ejecuta el último elemento en la shell actual.",
    ],
  },
  {
    id: "lx-shell-x02",
    since: 5,
    q: ["Inside double quotes, how do `\"$*\"` and `\"$@\"` differ?", "Entre guillemets doubles, en quoi `\"$*\"` et `\"$@\"` diffèrent-ils ?", "Entre comillas dobles, ¿en qué se diferencian `\"$*\"` y `\"$@\"`?"],
    a: ["`\"$*\"` is one word, the arguments joined by the first character of `IFS`; `\"$@\"` keeps each argument a word of its own", "`\"$*\"` est un seul mot, les arguments joints par le premier caractère de `IFS` ; `\"$@\"` garde chaque argument comme un mot", "`\"$*\"` es una sola palabra, los argumentos unidos por el primer carácter de `IFS`; `\"$@\"` mantiene cada argumento como una palabra"],
    w: [
      ["They are the same; the quotes change nothing", "Ils sont identiques ; les guillemets ne changent rien", "Son iguales; las comillas no cambian nada"],
      ["`\"$@\"` drops the empty arguments, `\"$*\"` keeps them", "`\"$@\"` supprime les arguments vides, `\"$*\"` les garde", "`\"$@\"` quita los argumentos vacíos, `\"$*\"` los mantiene"],
      ["`\"$*\"` includes the script's name, `\"$@\"` does not", "`\"$*\"` inclut le nom du script, `\"$@\"` non", "`\"$*\"` incluye el nombre del script, `\"$@\"` no"],
    ],
    e: [
      "With arguments `a` and `b c`, `\"$@\"` gives two words, `a` and `b c`; `\"$*\"` gives the single word `a b c`. Passing arguments on is almost always `\"$@\"`. Neither includes `$0`.",
      "Avec les arguments `a` et `b c`, `\"$@\"` donne deux mots, `a` et `b c` ; `\"$*\"` donne le seul mot `a b c`. Pour transmettre des arguments, c'est presque toujours `\"$@\"`. Aucun des deux n'inclut `$0`.",
      "Con los argumentos `a` y `b c`, `\"$@\"` da dos palabras, `a` y `b c`; `\"$*\"` da la única palabra `a b c`. Para pasar argumentos casi siempre se usa `\"$@\"`. Ninguno incluye `$0`.",
    ],
  },
];

const processes: LinuxQuestion[] = [
  {
    id: "lx-proc-x01",
    since: 5,
    q: ["A process survives `kill -9`. What is the most likely reason?", "Un processus survit à `kill -9`. Quelle est la raison la plus probable ?", "Un proceso sobrevive a `kill -9`. ¿Cuál es la razón más probable?"],
    a: ["It is in uninterruptible sleep (state `D`), stuck in the kernel on I/O, for example a hung NFS mount", "Il est en sommeil non interruptible (état `D`), bloqué dans le noyau sur une entrée-sortie, par exemple un montage NFS figé", "Está en sueño no interrumpible (estado `D`), bloqueado en el núcleo en una entrada/salida, por ejemplo un montaje NFS colgado"],
    w: [
      ["It catches SIGKILL and ignores it", "Il intercepte SIGKILL et l'ignore", "Captura SIGKILL y lo ignora"],
      ["It runs as root, and only root's own `kill` works", "Il tourne en root, et seul un `kill` de root marche", "Se ejecuta como root, y solo un `kill` de root funciona"],
      ["It is a zombie and has to be killed twice", "C'est un zombie, qu'il faut tuer deux fois", "Es un zombi y hay que matarlo dos veces"],
    ],
    e: [
      "SIGKILL can be neither caught nor ignored, but it is delivered only when the process leaves the kernel; in state `D` that waits for the I/O. A zombie (`Z`) is already dead: only its parent reaping it, or the parent's end, removes it.",
      "SIGKILL ne peut être ni intercepté ni ignoré, mais il n'est délivré qu'au retour du noyau ; en état `D`, cela attend la fin de l'entrée-sortie. Un zombie (`Z`) est déjà mort : seul son parent qui le récupère, ou la fin du parent, le fait disparaître.",
      "SIGKILL no se puede capturar ni ignorar, pero solo se entrega cuando el proceso sale del núcleo; en estado `D` eso espera a la entrada/salida. Un zombi (`Z`) ya está muerto: solo lo elimina su padre al recogerlo, o el fin del padre.",
    ],
  },
];

const system: LinuxQuestion[] = [
  {
    id: "lx-sys-x01",
    since: 5,
    q: ["What does `systemd-analyze blame` show?", "Que montre `systemd-analyze blame` ?", "¿Qué muestra `systemd-analyze blame`?"],
    a: ["How long each unit took to start at the last boot, slowest first", "Le temps que chaque unité a mis à démarrer au dernier boot, la plus lente d'abord", "Cuánto tardó cada unidad en arrancar en el último inicio, la más lenta primero"],
    w: [
      ["Which user last changed each unit file", "Quel utilisateur a modifié chaque fichier d'unité en dernier", "Qué usuario modificó por última vez cada archivo de unidad"],
      ["The units that failed, with their error messages", "Les unités en échec, avec leurs messages d'erreur", "Las unidades que fallaron, con sus mensajes de error"],
      ["The kernel's log of the last boot", "Le journal du noyau du dernier démarrage", "El registro del núcleo del último arranque"],
    ],
    e: [
      "A unit waiting for the network can look slow while it only waits; `systemd-analyze critical-chain` shows what actually held the boot up. Failed units: `systemctl --failed`.",
      "Une unité qui attend le réseau peut sembler lente alors qu'elle ne fait qu'attendre ; `systemd-analyze critical-chain` montre ce qui a vraiment retardé le démarrage. Unités en échec : `systemctl --failed`.",
      "Una unidad que espera a la red puede parecer lenta aunque solo espere; `systemd-analyze critical-chain` muestra qué retrasó realmente el arranque. Unidades fallidas: `systemctl --failed`.",
    ],
  },
  {
    id: "lx-sys-x02",
    since: 5,
    q: ["`touch new` says 'No space left on device', yet `df -h` shows 20 GB free. What has run out?", "`touch new` répond 'No space left on device', mais `df -h` montre 20 Go libres. Qu'est-ce qui manque ?", "`touch new` responde 'No space left on device', pero `df -h` muestra 20 GB libres. ¿Qué se ha agotado?"],
    a: ["Inodes: millions of small files used them all, as `df -i` shows", "Les inodes : des millions de petits fichiers les ont tous pris, comme le montre `df -i`", "Los inodos: millones de archivos pequeños los gastaron todos, como muestra `df -i`"],
    w: [
      ["The swap space", "L'espace d'échange (swap)", "El espacio de intercambio (swap)"],
      ["The shell's file descriptors", "Les descripteurs de fichiers du shell", "Los descriptores de archivo de la shell"],
      ["The filesystem's journal", "Le journal du système de fichiers", "El diario del sistema de archivos"],
    ],
    e: [
      "Every file needs an inode, and ext4 fixes their number when the filesystem is made. A cache or mail spool of tiny files can use them all with space left. Find the directory with `du --inodes`, delete files, or remake the filesystem with more inodes.",
      "Chaque fichier a besoin d'un inode, et ext4 en fixe le nombre à la création du système de fichiers. Un cache ou une file de courriels de minuscules fichiers peut tous les prendre en laissant de la place. Trouvez le répertoire avec `du --inodes`, supprimez des fichiers, ou refaites le système de fichiers avec plus d'inodes.",
      "Cada archivo necesita un inodo, y ext4 fija su número al crear el sistema de archivos. Una caché o una cola de correo de archivos diminutos puede gastarlos todos con espacio libre. Busque el directorio con `du --inodes`, borre archivos o rehaga el sistema de archivos con más inodos.",
    ],
  },
  {
    id: "lx-sys-x03",
    since: 5,
    q: ["A server logs 'Too many open files'. What does `ulimit -n` show?", "Un serveur écrit 'Too many open files'. Que montre `ulimit -n` ?", "Un servidor registra 'Too many open files'. ¿Qué muestra `ulimit -n`?"],
    a: ["The most file descriptors a process started from this shell may have open at once", "Le nombre maximal de descripteurs de fichiers qu'un processus lancé depuis ce shell peut avoir ouverts à la fois", "El número máximo de descriptores de archivo que un proceso lanzado desde esta shell puede tener abiertos a la vez"],
    w: [
      ["The number of files on the disk", "Le nombre de fichiers sur le disque", "El número de archivos del disco"],
      ["The most processes the system can run", "Le nombre maximal de processus du système", "El número máximo de procesos del sistema"],
      ["The largest file the shell may create, in blocks", "La taille maximale d'un fichier que le shell peut créer, en blocs", "El tamaño máximo de archivo que la shell puede crear, en bloques"],
    ],
    e: [
      "Sockets count as open files. For a systemd service the limit is set in its unit with `LimitNOFILE=`, not by `ulimit` in a shell; `cat /proc/<pid>/limits` shows the limit a running process really has.",
      "Les sockets comptent comme des fichiers ouverts. Pour un service systemd, la limite se règle dans son unité avec `LimitNOFILE=`, pas par `ulimit` dans un shell ; `cat /proc/<pid>/limits` montre la limite réelle d'un processus en cours.",
      "Los sockets cuentan como archivos abiertos. Para un servicio systemd el límite se fija en su unidad con `LimitNOFILE=`, no con `ulimit` en una shell; `cat /proc/<pid>/limits` muestra el límite real de un proceso en marcha.",
    ],
  },
  {
    id: "lx-sys-x04",
    since: 5,
    q: ["Where does `systemctl edit nginx` save your changes?", "Où `systemctl edit nginx` enregistre-t-il vos modifications ?", "¿Dónde guarda `systemctl edit nginx` sus cambios?"],
    a: ["In a drop-in, `/etc/systemd/system/nginx.service.d/override.conf`, applied on top of the packaged unit", "Dans un fichier complémentaire, `/etc/systemd/system/nginx.service.d/override.conf`, appliqué par-dessus l'unité du paquet", "En un archivo complementario, `/etc/systemd/system/nginx.service.d/override.conf`, aplicado sobre la unidad del paquete"],
    w: [
      ["In the packaged unit under `/lib/systemd/system`, overwritten", "Dans l'unité du paquet sous `/lib/systemd/system`, écrasée", "En la unidad del paquete bajo `/lib/systemd/system`, sobrescrita"],
      ["In `~/.config/systemd/nginx.conf`", "Dans `~/.config/systemd/nginx.conf`", "En `~/.config/systemd/nginx.conf`"],
      ["In `/etc/nginx/systemd.conf`", "Dans `/etc/nginx/systemd.conf`", "En `/etc/nginx/systemd.conf`"],
    ],
    e: [
      "Drop-ins survive package upgrades, which replace the files under `/lib/systemd/system`. To clear a list setting such as `ExecStart=` before giving a new value, the drop-in sets it empty first. `systemctl cat nginx` shows the unit with its drop-ins.",
      "Les fichiers complémentaires survivent aux mises à jour du paquet, qui remplacent les fichiers de `/lib/systemd/system`. Pour vider un réglage de liste comme `ExecStart=` avant d'en donner un nouveau, on le met d'abord à vide. `systemctl cat nginx` montre l'unité avec ses compléments.",
      "Los archivos complementarios sobreviven a las actualizaciones del paquete, que reemplazan los archivos de `/lib/systemd/system`. Para vaciar un ajuste de lista como `ExecStart=` antes de dar uno nuevo, primero se pone vacío. `systemctl cat nginx` muestra la unidad con sus complementos.",
    ],
  },
  {
    id: "lx-sys-x05",
    since: 5,
    q: ["What does `vm.swappiness` (in `/proc/sys/vm/swappiness`) tune?", "Que règle `vm.swappiness` (dans `/proc/sys/vm/swappiness`) ?", "¿Qué ajusta `vm.swappiness` (en `/proc/sys/vm/swappiness`)?"],
    a: ["How readily the kernel swaps out process memory rather than dropping file cache", "Avec quel empressement le noyau envoie la mémoire des processus dans le swap plutôt que de vider le cache des fichiers", "Con qué facilidad el núcleo pasa la memoria de los procesos al swap en lugar de vaciar la caché de archivos"],
    w: [
      ["The size of the swap partition", "La taille de la partition d'échange", "El tamaño de la partición de intercambio"],
      ["How often the swap is defragmented", "La fréquence de défragmentation du swap", "La frecuencia de desfragmentación del swap"],
      ["Which users may use swap", "Quels utilisateurs peuvent utiliser le swap", "Qué usuarios pueden usar el swap"],
    ],
    e: [
      "Higher values swap idle process pages sooner to keep more cache; lower values keep process memory in RAM. It is set with `sysctl vm.swappiness=10` and kept in `/etc/sysctl.d/`.",
      "Une valeur haute envoie plus tôt dans le swap les pages inactives des processus pour garder plus de cache ; une valeur basse garde la mémoire des processus en RAM. On la règle avec `sysctl vm.swappiness=10` et on la garde dans `/etc/sysctl.d/`.",
      "Un valor alto envía antes al swap las páginas inactivas de los procesos para conservar más caché; uno bajo mantiene la memoria de los procesos en RAM. Se fija con `sysctl vm.swappiness=10` y se guarda en `/etc/sysctl.d/`.",
    ],
  },
];

const network: LinuxQuestion[] = [
  {
    id: "lx-net-x01",
    since: 5,
    q: ["Why does a closed TCP connection stay in `TIME_WAIT` for a minute or more?", "Pourquoi une connexion TCP fermée reste-t-elle en `TIME_WAIT` une minute ou plus ?", "¿Por qué una conexión TCP cerrada se queda en `TIME_WAIT` un minuto o más?"],
    a: ["The side that closed first waits so that late packets of the old connection are not taken for a new one on the same ports", "Le côté qui a fermé en premier attend, pour que des paquets en retard de l'ancienne connexion ne soient pas pris pour une nouvelle sur les mêmes ports", "El lado que cerró primero espera para que los paquetes tardíos de la conexión antigua no se tomen por una nueva en los mismos puertos"],
    w: [
      ["The server is overloaded and cannot close it", "Le serveur est surchargé et ne peut pas la fermer", "El servidor está sobrecargado y no puede cerrarla"],
      ["The firewall keeps it for its logs", "Le pare-feu la garde pour ses journaux", "El cortafuegos la guarda para sus registros"],
      ["It waits for the DNS cache to expire", "Elle attend l'expiration du cache DNS", "Espera a que caduque la caché DNS"],
    ],
    e: [
      "TIME_WAIT lasts twice the maximum segment lifetime and also lets the last ACK be sent again if it was lost. Many TIME_WAIT sockets on a busy client are normal; reusing connections (keep-alive, pools) avoids running out of ports.",
      "TIME_WAIT dure deux fois la durée de vie maximale d'un segment et permet aussi de renvoyer le dernier ACK s'il s'est perdu. Beaucoup de sockets en TIME_WAIT sur un client chargé, c'est normal ; réutiliser les connexions (keep-alive, pools) évite de manquer de ports.",
      "TIME_WAIT dura el doble de la vida máxima de un segmento y permite además reenviar el último ACK si se perdió. Muchos sockets en TIME_WAIT en un cliente cargado es normal; reutilizar las conexiones (keep-alive, pools) evita quedarse sin puertos.",
    ],
  },
  {
    id: "lx-net-x02",
    since: 5,
    q: ["Over a VPN, `ssh` logs in but hangs as soon as a command prints a lot. What is a classic cause?", "Dans un VPN, `ssh` se connecte mais se fige dès qu'une commande affiche beaucoup. Quelle cause classique ?", "En una VPN, `ssh` entra pero se cuelga en cuanto un comando imprime mucho. ¿Qué causa clásica?"],
    a: ["An MTU problem: large packets are dropped and the ICMP 'fragmentation needed' replies are blocked", "Un problème de MTU : les gros paquets sont perdus et les réponses ICMP 'fragmentation needed' sont bloquées", "Un problema de MTU: los paquetes grandes se pierden y las respuestas ICMP 'fragmentation needed' están bloqueadas"],
    w: [
      ["The DNS server answers too slowly", "Le serveur DNS répond trop lentement", "El servidor DNS responde demasiado lento"],
      ["The terminal's scroll buffer is full", "Le tampon de défilement du terminal est plein", "El búfer de desplazamiento de la terminal está lleno"],
      ["SSH compression is turned off", "La compression SSH est désactivée", "La compresión SSH está desactivada"],
    ],
    e: [
      "Small packets fit through the tunnel, full-size ones do not, and path MTU discovery fails silently when ICMP is filtered. Lowering the interface MTU, or clamping the TCP MSS on the router, fixes it; `ping -M do -s 1400 host` finds the size that passes.",
      "Les petits paquets passent dans le tunnel, ceux de taille maximale non, et la découverte du MTU échoue en silence quand l'ICMP est filtré. Baisser le MTU de l'interface, ou limiter le MSS TCP sur le routeur, règle le problème ; `ping -M do -s 1400 host` trouve la taille qui passe.",
      "Los paquetes pequeños caben por el túnel y los de tamaño completo no, y el descubrimiento del MTU falla en silencio cuando el ICMP está filtrado. Bajar el MTU de la interfaz, o limitar el MSS TCP en el router, lo arregla; `ping -M do -s 1400 host` encuentra el tamaño que pasa.",
    ],
  },
  {
    id: "lx-net-x03",
    since: 5,
    q: ["What does `ip route get 1.1.1.1` tell you?", "Que vous dit `ip route get 1.1.1.1` ?", "¿Qué le dice `ip route get 1.1.1.1`?"],
    a: ["Which route, interface and source address the kernel would use to reach that address", "Quelle route, quelle interface et quelle adresse source le noyau utiliserait pour joindre cette adresse", "Qué ruta, interfaz y dirección de origen usaría el núcleo para llegar a esa dirección"],
    w: [
      ["Whether 1.1.1.1 answers ping", "Si 1.1.1.1 répond au ping", "Si 1.1.1.1 responde al ping"],
      ["Every router on the way, like `traceroute`", "Chaque routeur du chemin, comme `traceroute`", "Cada router del camino, como `traceroute`"],
      ["The DNS name of 1.1.1.1", "Le nom DNS de 1.1.1.1", "El nombre DNS de 1.1.1.1"],
    ],
    e: [
      "It asks the kernel's routing decision without sending anything, which settles questions such as 'does this traffic go through the VPN?'. Policy routing (`ip rule`) is taken into account.",
      "Elle demande la décision de routage du noyau sans rien envoyer, ce qui tranche des questions comme « ce trafic passe-t-il par le VPN ? ». Le routage par politique (`ip rule`) est pris en compte.",
      "Pregunta la decisión de enrutamiento del núcleo sin enviar nada, lo que resuelve preguntas como «¿este tráfico pasa por la VPN?». Se tiene en cuenta el enrutamiento por políticas (`ip rule`).",
    ],
  },
];

const tools: LinuxQuestion[] = [
  {
    id: "lx-tools-x01",
    since: 5,
    q: ["What does `strace -f -e trace=openat ./app` show?", "Que montre `strace -f -e trace=openat ./app` ?", "¿Qué muestra `strace -f -e trace=openat ./app`?"],
    a: ["Every file the program and its child processes try to open, with the result of each call", "Chaque fichier que le programme et ses processus enfants tentent d'ouvrir, avec le résultat de chaque appel", "Cada archivo que el programa y sus procesos hijos intentan abrir, con el resultado de cada llamada"],
    w: [
      ["The CPU time spent in each function", "Le temps processeur passé dans chaque fonction", "El tiempo de procesador gastado en cada función"],
      ["The network packets the program sends", "Les paquets réseau que le programme envoie", "Los paquetes de red que envía el programa"],
      ["The program's memory leaks", "Les fuites de mémoire du programme", "Las fugas de memoria del programa"],
    ],
    e: [
      "strace prints system calls; a failed `openat` with `ENOENT` shows where a program looked for a missing file. `-f` follows forks. It is in a package of its own (`strace`).",
      "strace affiche les appels système ; un `openat` en échec avec `ENOENT` montre où un programme a cherché un fichier absent. `-f` suit les processus enfants. Il est dans son propre paquet (`strace`).",
      "strace muestra las llamadas al sistema; un `openat` fallido con `ENOENT` indica dónde buscó un programa un archivo ausente. `-f` sigue a los procesos hijos. Está en su propio paquete (`strace`).",
    ],
    install: { apt: "strace", dnf: "strace" },
  },
  {
    id: "lx-tools-x02",
    since: 5,
    q: ["What does `lsof -i :8080` list?", "Que liste `lsof -i :8080` ?", "¿Qué lista `lsof -i :8080`?"],
    a: ["The processes that have a network socket on port 8080, listening or connected", "Les processus qui ont une socket réseau sur le port 8080, en écoute ou connectée", "Los procesos que tienen un socket de red en el puerto 8080, escuchando o conectado"],
    w: [
      ["The files changed in the last 8080 seconds", "Les fichiers modifiés depuis 8080 secondes", "Los archivos cambiados en los últimos 8080 segundos"],
      ["The firewall rules for port 8080", "Les règles du pare-feu pour le port 8080", "Las reglas del cortafuegos para el puerto 8080"],
      ["The bandwidth used on port 8080", "La bande passante utilisée sur le port 8080", "El ancho de banda usado en el puerto 8080"],
    ],
    e: [
      "lsof lists open files, and sockets are files. Without root it shows only your own processes. `lsof +D /mnt/usb` finds what keeps a mount busy; `ss -tlnp` is the lighter way to see listeners.",
      "lsof liste les fichiers ouverts, et les sockets sont des fichiers. Sans root, il ne montre que vos propres processus. `lsof +D /mnt/usb` trouve ce qui occupe un montage ; `ss -tlnp` est la façon plus légère de voir qui écoute.",
      "lsof lista los archivos abiertos, y los sockets son archivos. Sin root solo muestra sus propios procesos. `lsof +D /mnt/usb` encuentra qué mantiene ocupado un montaje; `ss -tlnp` es la forma más ligera de ver quién escucha.",
    ],
    install: { apt: "lsof", dnf: "lsof" },
  },
  {
    id: "lx-tools-x03",
    since: 5,
    q: ["What is `perf top` for?", "À quoi sert `perf top` ?", "¿Para qué sirve `perf top`?"],
    a: ["Seeing live which functions, in programs and in the kernel, use the CPU", "Voir en direct quelles fonctions, dans les programmes et le noyau, occupent le processeur", "Ver en directo qué funciones, en los programas y el núcleo, usan el procesador"],
    w: [
      ["Benchmarking the disks", "Mesurer les performances des disques", "Medir el rendimiento de los discos"],
      ["Listing the open ports", "Lister les ports ouverts", "Listar los puertos abiertos"],
      ["Showing the memory of each process", "Afficher la mémoire de chaque processus", "Mostrar la memoria de cada proceso"],
    ],
    e: [
      "perf samples the CPU many times a second and counts where it was. `perf record -g` then `perf report` profile one program with call stacks; symbols need debug information to show names.",
      "perf échantillonne le processeur de nombreuses fois par seconde et compte où il se trouvait. `perf record -g` puis `perf report` profilent un programme avec les piles d'appels ; il faut des informations de débogage pour voir les noms.",
      "perf muestrea el procesador muchas veces por segundo y cuenta dónde estaba. `perf record -g` y luego `perf report` perfilan un programa con las pilas de llamadas; hace falta información de depuración para ver los nombres.",
    ],
    install: { apt: "linux-perf", dnf: "perf" },
  },
  {
    id: "lx-tools-x04",
    since: 5,
    q: ["What does `jq -r '.[] | [.name, .age] | @csv' people.json` print?", "Qu'affiche `jq -r '.[] | [.name, .age] | @csv' people.json` ?", "¿Qué imprime `jq -r '.[] | [.name, .age] | @csv' people.json`?"],
    a: ["One CSV line per person: the name in quotes, a comma, the age", "Une ligne CSV par personne : le nom entre guillemets, une virgule, l'âge", "Una línea CSV por persona: el nombre entre comillas, una coma, la edad"],
    w: [
      ["A JSON array of arrays", "Un tableau JSON de tableaux", "Un array JSON de arrays"],
      ["Only the names, one per line", "Seulement les noms, un par ligne", "Solo los nombres, uno por línea"],
      ["An error: `@csv` needs a file name", "Une erreur : `@csv` attend un nom de fichier", "Un error: `@csv` necesita un nombre de archivo"],
    ],
    e: [
      "`.[]` walks the array, `[.name, .age]` builds a row, `@csv` formats it with strings quoted, and `-r` prints the result raw instead of as a JSON string. `@tsv` gives tab-separated rows.",
      "`.[]` parcourt le tableau, `[.name, .age]` construit une ligne, `@csv` la met en forme avec les chaînes entre guillemets, et `-r` affiche le résultat brut au lieu d'une chaîne JSON. `@tsv` donne des lignes séparées par des tabulations.",
      "`.[]` recorre el array, `[.name, .age]` construye una fila, `@csv` le da formato con las cadenas entre comillas, y `-r` imprime el resultado en bruto en vez de como cadena JSON. `@tsv` da filas separadas por tabuladores.",
    ],
    install: { apt: "jq", dnf: "jq", brew: "jq" },
  },
];

const git: LinuxQuestion[] = [
  {
    id: "lx-git-x01",
    since: 5,
    q: ["What does `git bisect` do?", "Que fait `git bisect` ?", "¿Qué hace `git bisect`?"],
    a: ["Searches the history by halves, between a good and a bad commit, for the commit that brought a bug", "Cherche dans l'historique par moitiés, entre un bon et un mauvais commit, celui qui a introduit un bogue", "Busca en el historial por mitades, entre un commit bueno y uno malo, el que introdujo un error"],
    w: [
      ["Splits a commit into two", "Coupe un commit en deux", "Divide un commit en dos"],
      ["Merges two branches halfway", "Fusionne deux branches à moitié", "Fusiona dos ramas a medias"],
      ["Removes half of the history to save space", "Supprime la moitié de l'historique pour gagner de la place", "Borra la mitad del historial para ahorrar espacio"],
    ],
    e: [
      "`git bisect start`, `git bisect bad`, `git bisect good v1.2`, then mark each commit git checks out; a thousand commits take about ten steps. `git bisect run ./test.sh` does it alone with a script that fails on the bug.",
      "`git bisect start`, `git bisect bad`, `git bisect good v1.2`, puis on note chaque commit que git extrait ; mille commits demandent une dizaine d'étapes. `git bisect run ./test.sh` le fait seul avec un script qui échoue sur le bogue.",
      "`git bisect start`, `git bisect bad`, `git bisect good v1.2`, y luego se marca cada commit que git extrae; mil commits piden unos diez pasos. `git bisect run ./test.sh` lo hace solo con un script que falla con el error.",
    ],
  },
  {
    id: "lx-git-x02",
    since: 5,
    q: ["What does `git rebase -i HEAD~3` let you do?", "Que permet `git rebase -i HEAD~3` ?", "¿Qué permite `git rebase -i HEAD~3`?"],
    a: ["Reorder, reword, squash or drop the last three commits", "Réordonner, reformuler, fusionner ou supprimer les trois derniers commits", "Reordenar, reescribir, fusionar o eliminar los tres últimos commits"],
    w: [
      ["Rebase the branch onto three others", "Rebaser la branche sur trois autres", "Rebasar la rama sobre otras tres"],
      ["Undo the last three pushes on the server", "Annuler les trois derniers push sur le serveur", "Deshacer los tres últimos push en el servidor"],
      ["Show the last three commits and nothing else", "Afficher les trois derniers commits, sans plus", "Mostrar los tres últimos commits y nada más"],
    ],
    e: [
      "It opens a list of the commits with an action each (`pick`, `reword`, `squash`, `fixup`, `drop`). The commits are rewritten with new ids, so this is for history not yet shared, or followed by `--force-with-lease`.",
      "Il ouvre la liste des commits avec une action pour chacun (`pick`, `reword`, `squash`, `fixup`, `drop`). Les commits sont réécrits avec de nouveaux identifiants : c'est pour un historique pas encore partagé, ou suivi de `--force-with-lease`.",
      "Abre la lista de commits con una acción para cada uno (`pick`, `reword`, `squash`, `fixup`, `drop`). Los commits se reescriben con nuevos identificadores, así que es para un historial aún no compartido, o seguido de `--force-with-lease`.",
    ],
  },
  {
    id: "lx-git-x03",
    since: 5,
    q: ["What does `git cherry-pick a1b2c3d` do?", "Que fait `git cherry-pick a1b2c3d` ?", "¿Qué hace `git cherry-pick a1b2c3d`?"],
    a: ["Applies the change made by that one commit onto the current branch, as a new commit", "Applique la modification de ce seul commit à la branche courante, comme un nouveau commit", "Aplica el cambio de ese único commit a la rama actual, como un commit nuevo"],
    w: [
      ["Moves the current branch to that commit", "Déplace la branche courante sur ce commit", "Mueve la rama actual a ese commit"],
      ["Deletes that commit from every branch", "Supprime ce commit de toutes les branches", "Borra ese commit de todas las ramas"],
      ["Merges the whole branch that contains it", "Fusionne toute la branche qui le contient", "Fusiona toda la rama que lo contiene"],
    ],
    e: [
      "The new commit has the same change and message but another id. It suits porting a fix to a release branch; `-x` records the original id in the message.",
      "Le nouveau commit a la même modification et le même message mais un autre identifiant. C'est utile pour reporter un correctif sur une branche de version ; `-x` note l'identifiant d'origine dans le message.",
      "El nuevo commit tiene el mismo cambio y mensaje pero otro identificador. Sirve para llevar una corrección a una rama de versión; `-x` anota el identificador original en el mensaje.",
    ],
  },
  {
    id: "lx-git-x04",
    since: 5,
    q: ["What does `git worktree add ../hotfix main` give you?", "Que vous donne `git worktree add ../hotfix main` ?", "¿Qué le da `git worktree add ../hotfix main`?"],
    a: ["A second working directory on `main`, sharing the same repository, to work on two branches at once", "Un second répertoire de travail sur `main`, partageant le même dépôt, pour travailler sur deux branches à la fois", "Un segundo directorio de trabajo en `main`, que comparte el mismo repositorio, para trabajar en dos ramas a la vez"],
    w: [
      ["A separate clone with its own copy of the history", "Un clone séparé avec sa propre copie de l'historique", "Un clon aparte con su propia copia del historial"],
      ["A backup of the repository in `../hotfix`", "Une sauvegarde du dépôt dans `../hotfix`", "Una copia de seguridad del repositorio en `../hotfix`"],
      ["A submodule named `hotfix`", "Un sous-module nommé `hotfix`", "Un submódulo llamado `hotfix`"],
    ],
    e: [
      "Worktrees share objects and refs, so a commit in one is seen at once in the other; a branch can be checked out in only one worktree. `git worktree remove ../hotfix` ends it.",
      "Les worktrees partagent objets et références : un commit dans l'un se voit aussitôt dans l'autre ; une branche ne peut être extraite que dans un seul worktree. `git worktree remove ../hotfix` y met fin.",
      "Los worktrees comparten objetos y referencias, así que un commit en uno se ve al instante en el otro; una rama solo puede estar extraída en un worktree. `git worktree remove ../hotfix` lo termina.",
    ],
  },
];

const vim: LinuxQuestion[] = [
  {
    id: "lx-vim-x01",
    since: 5,
    q: ["What does `:%norm A;` do?", "Que fait `:%norm A;` ?", "¿Qué hace `:%norm A;`?"],
    a: ["Adds a `;` at the end of every line, running the normal-mode keys `A;` on each", "Ajoute un `;` à la fin de chaque ligne, en exécutant les touches du mode normal `A;` sur chacune", "Añade un `;` al final de cada línea, ejecutando las teclas del modo normal `A;` en cada una"],
    w: [
      ["Replaces every `A` with `;`", "Remplace chaque `A` par `;`", "Reemplaza cada `A` por `;`"],
      ["Inserts a line holding `;` after each line", "Insère une ligne contenant `;` après chaque ligne", "Inserta una línea con `;` tras cada línea"],
      ["Normalises the indentation and adds `;`", "Normalise l'indentation et ajoute `;`", "Normaliza la sangría y añade `;`"],
    ],
    e: [
      "`:normal` runs keys as if typed in normal mode, on each line of the range (`%` is the whole file). It works with a visual selection too, and with a macro: `:%norm @q`.",
      "`:normal` exécute des touches comme tapées en mode normal, sur chaque ligne de la plage (`%` est tout le fichier). Ça marche aussi avec une sélection visuelle, et avec une macro : `:%norm @q`.",
      "`:normal` ejecuta teclas como si se tecleasen en modo normal, en cada línea del rango (`%` es todo el archivo). También funciona con una selección visual, y con una macro: `:%norm @q`.",
    ],
  },
  {
    id: "lx-vim-x02",
    since: 5,
    q: ["How do you record keystrokes into register `q` and play them 10 times?", "Comment enregistrer des frappes dans le registre `q` et les rejouer 10 fois ?", "¿Cómo se graban pulsaciones en el registro `q` y se reproducen 10 veces?"],
    a: ["`qq`, the keys, `q` to stop, then `10@q`", "`qq`, les touches, `q` pour arrêter, puis `10@q`", "`qq`, las teclas, `q` para parar, y luego `10@q`"],
    w: [
      ["`:record q`, the keys, then `:play 10`", "`:record q`, les touches, puis `:play 10`", "`:record q`, las teclas, y luego `:play 10`"],
      ["`mq`, the keys, then `10'q`", "`mq`, les touches, puis `10'q`", "`mq`, las teclas, y luego `10'q`"],
      ["`\"qy`, the keys, then `10p`", "`\"qy`, les touches, puis `10p`", "`\"qy`, las teclas, y luego `10p`"],
    ],
    e: [
      "`q` followed by a register letter starts recording, `q` stops; `@q` plays it and `@@` repeats the last macro. A macro that ends by moving to the next line can be run over many lines.",
      "`q` suivi d'une lettre de registre lance l'enregistrement, `q` l'arrête ; `@q` le rejoue et `@@` répète la dernière macro. Une macro qui finit en passant à la ligne suivante peut s'appliquer à beaucoup de lignes.",
      "`q` seguido de una letra de registro empieza a grabar, `q` lo para; `@q` lo reproduce y `@@` repite la última macro. Una macro que termina pasando a la línea siguiente puede aplicarse a muchas líneas.",
    ],
  },
  {
    id: "lx-vim-x03",
    since: 5,
    q: ["What does `:sort u` do?", "Que fait `:sort u` ?", "¿Qué hace `:sort u`?"],
    a: ["Sorts the lines of the range and keeps one copy of each duplicate", "Trie les lignes de la plage et garde un seul exemplaire des doublons", "Ordena las líneas del rango y deja una sola copia de cada duplicado"],
    w: [
      ["Sorts the lines in upper case", "Trie les lignes en majuscules", "Ordena las líneas en mayúsculas"],
      ["Undoes the last sort", "Annule le dernier tri", "Deshace la última ordenación"],
      ["Sorts the lines by their length", "Trie les lignes par longueur", "Ordena las líneas por su longitud"],
    ],
    e: [
      "Without a range it sorts the whole file; with a visual selection, `:'<,'>sort u`. `n` sorts by number, `!` in reverse, `i` ignores case.",
      "Sans plage, il trie tout le fichier ; avec une sélection visuelle, `:'<,'>sort u`. `n` trie par nombre, `!` à l'envers, `i` ignore la casse.",
      "Sin rango ordena todo el archivo; con una selección visual, `:'<,'>sort u`. `n` ordena por número, `!` al revés, `i` ignora mayúsculas.",
    ],
  },
];

/** By topic: the Expert list of each. */
export const LINUX_EXPERT = {
  linuxFiles: { expert: files },
  linuxShell: { expert: shell },
  linuxProcesses: { expert: processes },
  linuxSystem: { expert: system },
  linuxNetwork: { expert: network },
  linuxTools: { expert: tools },
  linuxGit: { expert: git },
  linuxVim: { expert: vim },
} as const;
