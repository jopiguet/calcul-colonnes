/** Linux, the system: disks and memory, users, packages, information. */
import type { LinuxQuestion } from "./types";

const storage: LinuxQuestion[] = [
  {
    id: "lx-disk-01",
    q: ["Which command shows the free space of each mounted filesystem, in readable units?", "Quelle commande montre l'espace libre de chaque système de fichiers monté, en unités lisibles ?", "¿Qué comando muestra el espacio libre de cada sistema de archivos montado, en unidades legibles?"],
    a: ["`df -h`", "`df -h`", "`df -h`"],
    w: [["`du -h`", "`du -h`", "`du -h`"], ["`free -h`", "`free -h`", "`free -h`"], ["`lsblk -f`", "`lsblk -f`", "`lsblk -f`"]],
    e: [
      "`df` reports filesystems, `du` the space used by files and directories, `free` memory. `lsblk -f` shows filesystems and mount points, not their use.",
      "`df` rend compte des systèmes de fichiers, `du` de l'espace occupé par des fichiers et répertoires, `free` de la mémoire. `lsblk -f` montre les systèmes de fichiers et points de montage, pas leur occupation.",
      "`df` informa de los sistemas de archivos, `du` del espacio que ocupan archivos y directorios, `free` de la memoria. `lsblk -f` muestra sistemas de archivos y puntos de montaje, no su ocupación.",
    ],
  },
  {
    id: "lx-disk-02",
    q: ["How do you see how much space each item of the current directory takes?", "Comment voir la place que prend chaque élément du répertoire courant ?", "¿Cómo ver cuánto espacio ocupa cada elemento del directorio actual?"],
    a: ["`du -sh *`", "`du -sh *`", "`du -sh *`"],
    w: [["`du -sh .`", "`du -sh .`", "`du -sh .`"], ["`ls -s`", "`ls -s`", "`ls -s`"], ["`df -h .`", "`df -h .`", "`df -h .`"]],
    e: [
      "`-s` gives one total per argument, `-h` readable units. `du -sh .` gives a single total; `ls -s` does not count what is inside subdirectories. `*` skips hidden items. (`ncdu` explores interactively.)",
      "`-s` donne un total par argument, `-h` des unités lisibles. `du -sh .` ne donne qu'un total ; `ls -s` ne compte pas le contenu des sous-répertoires. `*` saute les éléments cachés. (`ncdu` explore de façon interactive.)",
      "`-s` da un total por argumento, `-h` unidades legibles. `du -sh .` da un solo total; `ls -s` no cuenta el contenido de los subdirectorios. `*` omite los elementos ocultos. (`ncdu` explora de forma interactiva.)",
    ],
  },
  {
    id: "lx-disk-03",
    q: ["`free -h` shows 300 MiB 'free' but 9 GiB 'available'. Is memory short?", "`free -h` affiche 300 Mio « free » mais 9 Gio « available ». La mémoire manque-t-elle ?", "`free -h` muestra 300 MiB «free» pero 9 GiB «available». ¿Falta memoria?"],
    a: ["No: Linux uses spare memory as disk cache and gives it back on demand", "Non : Linux utilise la mémoire libre comme cache disque et la rend à la demande", "No: Linux usa la memoria libre como caché de disco y la devuelve cuando se pide"],
    w: [
      ["Yes: only 300 MiB can still be used", "Oui : seuls 300 Mio peuvent encore servir", "Sí: solo se pueden usar 300 MiB más"],
      ["Yes: the cache must be emptied by hand", "Oui : il faut vider le cache à la main", "Sí: hay que vaciar la caché a mano"],
      ["The swap is full", "La swap est pleine", "La swap está llena"],
    ],
    e: [
      "'available' estimates what new programs can get. Empty memory is wasted memory.",
      "« available » estime ce que de nouveaux programmes peuvent obtenir. Une mémoire vide est une mémoire gaspillée.",
      "«available» estima lo que pueden obtener los programas nuevos. La memoria vacía es memoria desperdiciada.",
    ],
  },
  {
    id: "lx-disk-04",
    q: ["What is `/etc/fstab` for?", "À quoi sert `/etc/fstab` ?", "¿Para qué sirve `/etc/fstab`?"],
    a: ["It lists the filesystems to mount at boot, where and with which options", "Il liste les systèmes de fichiers à monter au démarrage, où et avec quelles options", "Lista los sistemas de archivos que montar al arrancar, dónde y con qué opciones"],
    w: [
      ["It formats the disks", "Il formate les disques", "Formatea los discos"],
      ["It lists the files of each partition", "Il liste les fichiers de chaque partition", "Lista los archivos de cada partición"],
      ["It records the disks' errors", "Il enregistre les erreurs des disques", "Registra los errores de los discos"],
    ],
    e: [
      "Prefer `UUID=` to `/dev/sdb1`, which can change. Test an edit with `sudo mount -a` (or `findmnt --verify`) before rebooting.",
      "Préférer `UUID=` à `/dev/sdb1`, qui peut changer. Tester une modification avec `sudo mount -a` (ou `findmnt --verify`) avant de redémarrer.",
      "Mejor `UUID=` que `/dev/sdb1`, que puede cambiar. Probar un cambio con `sudo mount -a` (o `findmnt --verify`) antes de reiniciar.",
    ],
  },
  {
    id: "lx-disk-05",
    q: ["Which command shows disks and partitions as a tree, with sizes and mount points?", "Quelle commande montre disques et partitions en arbre, avec tailles et points de montage ?", "¿Qué comando muestra discos y particiones en árbol, con tamaños y puntos de montaje?"],
    a: ["`lsblk`", "`lsblk`", "`lsblk`"],
    w: [["`lsusb`", "`lsusb`", "`lsusb`"], ["`df -i`", "`df -i`", "`df -i`"], ["`tree /dev`", "`tree /dev`", "`tree /dev`"]],
    e: [
      "`lsusb` lists USB devices; `df -i` shows inode use. Before writing to a disk, `lsblk` helps not to pick the wrong one.",
      "`lsusb` liste les périphériques USB ; `df -i` montre l'usage des inodes. Avant d'écrire sur un disque, `lsblk` aide à ne pas se tromper de disque.",
      "`lsusb` lista los dispositivos USB; `df -i` muestra el uso de inodos. Antes de escribir en un disco, `lsblk` ayuda a no equivocarse de disco.",
    ],
  },
];

const users: LinuxQuestion[] = [
  {
    id: "lx-user-01",
    q: ["Whose password does `sudo` ask for, by default?", "Quel mot de passe `sudo` demande-t-il, par défaut ?", "¿Qué contraseña pide `sudo`, por defecto?"],
    a: ["Your own", "Le vôtre", "La suya"],
    w: [["root's", "Celui de root", "La de root"], ["None", "Aucun", "Ninguna"], ["The administrator group's", "Celui du groupe des administrateurs", "La del grupo de administradores"]],
    e: [
      "`sudo` checks who you are, then `/etc/sudoers` decides what you may do. `su` asks for the target user's password.",
      "`sudo` vérifie qui vous êtes, puis `/etc/sudoers` décide ce que vous pouvez faire. `su` demande le mot de passe de l'utilisateur cible.",
      "`sudo` comprueba quién es usted y luego `/etc/sudoers` decide qué puede hacer. `su` pide la contraseña del usuario de destino.",
    ],
  },
  {
    id: "lx-user-02",
    q: ["After `sudo usermod -aG docker alice`, `docker ps` still says 'permission denied' for alice. Why?", "Après `sudo usermod -aG docker alice`, `docker ps` répond toujours « permission denied » pour alice. Pourquoi ?", "Tras `sudo usermod -aG docker alice`, `docker ps` sigue respondiendo «permission denied» para alice. ¿Por qué?"],
    a: ["Group membership is read at login: she must log in again (or run `newgrp docker`)", "L'appartenance aux groupes est lue à la connexion : elle doit se reconnecter (ou lancer `newgrp docker`)", "La pertenencia a grupos se lee al iniciar sesión: debe volver a entrar (o ejecutar `newgrp docker`)"],
    w: [
      ["`-a` removed her other groups", "`-a` a retiré ses autres groupes", "`-a` le quitó sus otros grupos"],
      ["The docker group needs a reboot", "Le groupe docker demande un redémarrage", "El grupo docker requiere reiniciar"],
      ["`usermod` only works for new users", "`usermod` ne marche que pour les nouveaux utilisateurs", "`usermod` solo funciona con usuarios nuevos"],
    ],
    e: [
      "`-a` appends; `-G` without `-a` would replace her supplementary groups. `id alice` shows the configured groups, `id` in her session the active ones.",
      "`-a` ajoute ; `-G` sans `-a` remplacerait ses groupes supplémentaires. `id alice` montre les groupes configurés, `id` dans sa session ceux qui sont actifs.",
      "`-a` añade; `-G` sin `-a` sustituiría sus grupos adicionales. `id alice` muestra los grupos configurados, `id` en su sesión los activos.",
    ],
  },
  {
    id: "lx-user-03",
    q: ["Where are password hashes stored on a modern Linux system?", "Où sont stockés les hachages des mots de passe sur un Linux moderne ?", "¿Dónde se guardan los hash de las contraseñas en un Linux moderno?"],
    a: ["In `/etc/shadow`, readable only by root", "Dans `/etc/shadow`, lisible seulement par root", "En `/etc/shadow`, legible solo por root"],
    w: [["In `/etc/passwd`, readable by all", "Dans `/etc/passwd`, lisible par tous", "En `/etc/passwd`, legible por todos"], ["In `~/.password`", "Dans `~/.password`", "En `~/.password`"], ["In `/etc/sudoers`", "Dans `/etc/sudoers`", "En `/etc/sudoers`"]],
    e: [
      "`/etc/passwd` must stay readable (names, home directories, shells), so its password field is just `x`.",
      "`/etc/passwd` doit rester lisible (noms, répertoires personnels, shells) : son champ de mot de passe vaut juste `x`.",
      "`/etc/passwd` debe seguir siendo legible (nombres, directorios personales, shells), así que su campo de contraseña es solo `x`.",
    ],
  },
  {
    id: "lx-user-04",
    q: ["Why edit sudo's rules with `visudo` rather than a plain editor?", "Pourquoi modifier les règles de sudo avec `visudo` plutôt qu'avec un éditeur ordinaire ?", "¿Por qué editar las reglas de sudo con `visudo` y no con un editor normal?"],
    a: ["It checks the syntax before saving: a broken sudoers file can lock everyone out of sudo", "Il vérifie la syntaxe avant d'enregistrer : un fichier sudoers cassé peut priver tout le monde de sudo", "Comprueba la sintaxis antes de guardar: un archivo sudoers roto puede dejar a todos sin sudo"],
    w: [
      ["The file is encrypted", "Le fichier est chiffré", "El archivo está cifrado"],
      ["Only `vi` can open it", "Seul `vi` peut l'ouvrir", "Solo `vi` puede abrirlo"],
      ["It also restarts sudo", "Il redémarre aussi sudo", "También reinicia sudo"],
    ],
    e: [
      "It uses `EDITOR` or `VISUAL`, and locks the file. Rules can also go in files under `/etc/sudoers.d/` (`visudo -f`).",
      "Il utilise `EDITOR` ou `VISUAL`, et verrouille le fichier. Les règles peuvent aussi aller dans des fichiers sous `/etc/sudoers.d/` (`visudo -f`).",
      "Usa `EDITOR` o `VISUAL`, y bloquea el archivo. Las reglas también pueden ir en archivos bajo `/etc/sudoers.d/` (`visudo -f`).",
    ],
  },
  {
    id: "lx-user-05",
    q: ["Which command shows your user id, your group id and all your groups?", "Quelle commande montre votre numéro d'utilisateur, votre numéro de groupe et tous vos groupes ?", "¿Qué comando muestra su número de usuario, su número de grupo y todos sus grupos?"],
    a: ["`id`", "`id`", "`id`"],
    w: [["`whoami`", "`whoami`", "`whoami`"], ["`who`", "`who`", "`who`"], ["`users`", "`users`", "`users`"]],
    e: [
      "`whoami` prints only the name; `who` and `users` list the people logged in.",
      "`whoami` n'affiche que le nom ; `who` et `users` listent les personnes connectées.",
      "`whoami` solo muestra el nombre; `who` y `users` listan a las personas conectadas.",
    ],
  },
];

const packages: LinuxQuestion[] = [
  {
    id: "lx-pkg-01",
    q: ["On Debian or Ubuntu, what is the difference between `apt update` and `apt upgrade`?", "Sous Debian ou Ubuntu, quelle différence entre `apt update` et `apt upgrade` ?", "En Debian o Ubuntu, ¿qué diferencia hay entre `apt update` y `apt upgrade`?"],
    a: ["`update` refreshes the package lists; `upgrade` installs the newer versions", "`update` rafraîchit les listes de paquets ; `upgrade` installe les versions plus récentes", "`update` actualiza las listas de paquetes; `upgrade` instala las versiones más nuevas"],
    w: [
      ["`update` upgrades apt itself", "`update` met à jour apt lui-même", "`update` actualiza el propio apt"],
      ["None: both upgrade everything", "Aucune : les deux mettent tout à jour", "Ninguna: los dos lo actualizan todo"],
      ["`upgrade` changes the distribution's release", "`upgrade` change de version de la distribution", "`upgrade` cambia de versión de la distribución"],
    ],
    e: [
      "Run `update` first, or `upgrade` sees stale lists. Moving to a new release is a separate procedure (`do-release-upgrade` on Ubuntu).",
      "Lancer `update` d'abord, sinon `upgrade` voit des listes périmées. Passer à une nouvelle version est une procédure à part (`do-release-upgrade` sous Ubuntu).",
      "Ejecutar `update` primero, si no `upgrade` ve listas caducadas. Pasar a una versión nueva es un procedimiento aparte (`do-release-upgrade` en Ubuntu).",
    ],
  },
  {
    id: "lx-pkg-02",
    q: ["What does `apt purge nginx` do that `apt remove nginx` does not?", "Que fait `apt purge nginx` que `apt remove nginx` ne fait pas ?", "¿Qué hace `apt purge nginx` que no hace `apt remove nginx`?"],
    a: ["It also deletes nginx's system configuration files", "Il supprime aussi les fichiers de configuration système de nginx", "También borra los archivos de configuración del sistema de nginx"],
    w: [
      ["It also removes every package depending on nginx", "Il supprime aussi tous les paquets qui dépendent de nginx", "También elimina todos los paquetes que dependen de nginx"],
      ["It also deletes the web sites served", "Il supprime aussi les sites web servis", "También borra los sitios web servidos"],
      ["Nothing more", "Rien de plus", "Nada más"],
    ],
    e: [
      "Files under `/etc` stay after `remove`. Unused dependencies go with `apt autoremove`. Your own data, such as `/var/www`, is never touched.",
      "Les fichiers sous `/etc` restent après `remove`. Les dépendances devenues inutiles partent avec `apt autoremove`. Vos propres données, comme `/var/www`, ne sont jamais touchées.",
      "Los archivos de `/etc` se quedan tras `remove`. Las dependencias que ya no se usan se van con `apt autoremove`. Sus propios datos, como `/var/www`, nunca se tocan.",
    ],
  },
  {
    id: "lx-pkg-03",
    q: ["Which command tells which installed Debian package a file such as `/usr/bin/curl` comes from?", "Quelle commande dit de quel paquet Debian installé vient un fichier comme `/usr/bin/curl` ?", "¿Qué comando dice de qué paquete Debian instalado viene un archivo como `/usr/bin/curl`?"],
    a: ["`dpkg -S /usr/bin/curl`", "`dpkg -S /usr/bin/curl`", "`dpkg -S /usr/bin/curl`"],
    w: [["`dpkg -L /usr/bin/curl`", "`dpkg -L /usr/bin/curl`", "`dpkg -L /usr/bin/curl`"], ["`apt show /usr/bin/curl`", "`apt show /usr/bin/curl`", "`apt show /usr/bin/curl`"], ["`which -p curl`", "`which -p curl`", "`which -p curl`"]],
    e: [
      "`dpkg -L pkg` lists a package's files. For a file not installed yet: `apt-file search` (package `apt-file`). Fedora: `rpm -qf` and `dnf provides`.",
      "`dpkg -L paquet` liste les fichiers d'un paquet. Pour un fichier pas encore installé : `apt-file search` (paquet `apt-file`). Fedora : `rpm -qf` et `dnf provides`.",
      "`dpkg -L paquete` lista los archivos de un paquete. Para un archivo aún no instalado: `apt-file search` (paquete `apt-file`). Fedora: `rpm -qf` y `dnf provides`.",
    ],
  },
  {
    id: "lx-pkg-04",
    q: ["On Fedora, which command finds the package that would provide `/usr/bin/dig`?", "Sous Fedora, quelle commande trouve le paquet qui fournirait `/usr/bin/dig` ?", "En Fedora, ¿qué comando encuentra el paquete que proporcionaría `/usr/bin/dig`?"],
    a: ["`dnf provides /usr/bin/dig`", "`dnf provides /usr/bin/dig`", "`dnf provides /usr/bin/dig`"],
    w: [["`dnf search /usr/bin/dig`", "`dnf search /usr/bin/dig`", "`dnf search /usr/bin/dig`"], ["`rpm -qf /usr/bin/dig`", "`rpm -qf /usr/bin/dig`", "`rpm -qf /usr/bin/dig`"], ["`dnf info dig`", "`dnf info dig`", "`dnf info dig`"]],
    e: [
      "`provides` searches the repositories' file lists (here: `bind-utils`). `rpm -qf` only knows installed files.",
      "`provides` cherche dans les listes de fichiers des dépôts (ici : `bind-utils`). `rpm -qf` ne connaît que les fichiers installés.",
      "`provides` busca en las listas de archivos de los repositorios (aquí: `bind-utils`). `rpm -qf` solo conoce los archivos instalados.",
    ],
  },
  {
    id: "lx-pkg-05",
    q: ["What does `apt autoremove` remove?", "Que supprime `apt autoremove` ?", "¿Qué elimina `apt autoremove`?"],
    a: ["Packages installed only as dependencies, and no longer needed", "Les paquets installés seulement comme dépendances, et devenus inutiles", "Los paquetes instalados solo como dependencias y que ya no se necesitan"],
    w: [
      ["Every package not used for 30 days", "Tous les paquets inutilisés depuis 30 jours", "Todos los paquetes sin usar desde hace 30 días"],
      ["The downloaded `.deb` files", "Les fichiers `.deb` téléchargés", "Los archivos `.deb` descargados"],
      ["Old configuration files", "Les anciens fichiers de configuration", "Los archivos de configuración antiguos"],
    ],
    e: [
      "Downloaded archives are cleared by `apt clean`. Old kernels are often among the packages removed.",
      "Les archives téléchargées s'effacent avec `apt clean`. Les anciens noyaux font souvent partie des paquets supprimés.",
      "Los archivos descargados se borran con `apt clean`. Los núcleos antiguos suelen estar entre los paquetes eliminados.",
    ],
  },
];

const info: LinuxQuestion[] = [
  {
    id: "lx-info-01",
    q: ["Which command prints the version of the running kernel?", "Quelle commande affiche la version du noyau en cours ?", "¿Qué comando muestra la versión del núcleo en uso?"],
    a: ["`uname -r`", "`uname -r`", "`uname -r`"],
    w: [["`cat /etc/os-release`", "`cat /etc/os-release`", "`cat /etc/os-release`"], ["`lsb_release -a`", "`lsb_release -a`", "`lsb_release -a`"], ["`hostnamectl --kernel`", "`hostnamectl --kernel`", "`hostnamectl --kernel`"]],
    e: [
      "`/etc/os-release` and `lsb_release` describe the distribution, not the kernel. (`hostnamectl` without options shows both.)",
      "`/etc/os-release` et `lsb_release` décrivent la distribution, pas le noyau. (`hostnamectl` sans option montre les deux.)",
      "`/etc/os-release` y `lsb_release` describen la distribución, no el núcleo. (`hostnamectl` sin opciones muestra ambos.)",
    ],
  },
  {
    id: "lx-info-02",
    q: ["A program stops with just 'Killed'. Where do you look first?", "Un programme s'arrête avec juste « Killed ». Où regarder d'abord ?", "Un programa se detiene solo con «Killed». ¿Dónde mirar primero?"],
    a: ["In the kernel messages (`journalctl -k` or `dmesg`): the out-of-memory killer may have chosen it", "Dans les messages du noyau (`journalctl -k` ou `dmesg`) : le tueur de manque de mémoire l'a peut-être choisi", "En los mensajes del núcleo (`journalctl -k` o `dmesg`): puede haberlo elegido el asesino por falta de memoria"],
    w: [
      ["In the program's source code", "Dans le code source du programme", "En el código fuente del programa"],
      ["In `~/.bash_history`", "Dans `~/.bash_history`", "En `~/.bash_history`"],
      ["Nowhere: 'Killed' means a disk error", "Nulle part : « Killed » veut dire une erreur de disque", "En ningún sitio: «Killed» significa un error de disco"],
    ],
    e: [
      "Look for 'oom-kill' or 'Out of memory'. The shell prints 'Killed' for a process ended by SIGKILL.",
      "Chercher « oom-kill » ou « Out of memory ». Le shell affiche « Killed » pour un processus arrêté par SIGKILL.",
      "Buscar «oom-kill» u «Out of memory». El shell muestra «Killed» para un proceso terminado por SIGKILL.",
    ],
  },
  {
    id: "lx-info-03",
    q: ["Which command gives the number of processing units available?", "Quelle commande donne le nombre d'unités de calcul disponibles ?", "¿Qué comando da el número de unidades de procesamiento disponibles?"],
    a: ["`nproc`", "`nproc`", "`nproc`"],
    w: [["`ncpu`", "`ncpu`", "`ncpu`"], ["`cpus -a`", "`cpus -a`", "`cpus -a`"], ["`uname -p`", "`uname -p`", "`uname -p`"]],
    e: [
      "Handy for `make -j\"$(nproc)\"`. `lscpu` gives the detail (sockets, cores, threads); `uname -p` the processor type.",
      "Pratique pour `make -j\"$(nproc)\"`. `lscpu` donne le détail (sockets, cœurs, threads) ; `uname -p` le type de processeur.",
      "Práctico para `make -j\"$(nproc)\"`. `lscpu` da el detalle (zócalos, núcleos, hilos); `uname -p` el tipo de procesador.",
    ],
  },
  {
    id: "lx-info-04",
    q: ["What is in `/proc`?", "Que contient `/proc` ?", "¿Qué contiene `/proc`?"],
    a: ["Files made up by the kernel on the fly, describing processes and the system", "Des fichiers fabriqués à la volée par le noyau, qui décrivent les processus et le système", "Archivos creados al vuelo por el núcleo, que describen los procesos y el sistema"],
    w: [
      ["The programs' binaries", "Les binaires des programmes", "Los binarios de los programas"],
      ["The processes' saved memory, on disk", "La mémoire sauvegardée des processus, sur disque", "La memoria guardada de los procesos, en disco"],
      ["The CPU's firmware", "Le micrologiciel du processeur", "El firmware del procesador"],
    ],
    e: [
      "Nothing there is on disk: `/proc/meminfo`, `/proc/cpuinfo`, `/proc/<pid>/` per process. `/sys` does the same for devices.",
      "Rien n'y est sur le disque : `/proc/meminfo`, `/proc/cpuinfo`, `/proc/<pid>/` par processus. `/sys` fait de même pour les périphériques.",
      "Nada de eso está en el disco: `/proc/meminfo`, `/proc/cpuinfo`, `/proc/<pid>/` por proceso. `/sys` hace lo mismo con los dispositivos.",
    ],
  },
  {
    id: "lx-info-05",
    q: ["Which command sets the system's time zone on a systemd distribution?", "Quelle commande règle le fuseau horaire du système sur une distribution à systemd ?", "¿Qué comando ajusta la zona horaria del sistema en una distribución con systemd?"],
    a: ["`timedatectl set-timezone Europe/Madrid`", "`timedatectl set-timezone Europe/Madrid`", "`timedatectl set-timezone Europe/Madrid`"],
    w: [["`export TZ=Europe/Madrid`", "`export TZ=Europe/Madrid`", "`export TZ=Europe/Madrid`"], ["`date --zone Europe/Madrid`", "`date --zone Europe/Madrid`", "`date --zone Europe/Madrid`"], ["`hwclock --tz Europe/Madrid`", "`hwclock --tz Europe/Madrid`", "`hwclock --tz Europe/Madrid`"]],
    e: [
      "`TZ` only changes it for one shell and its children. `timedatectl list-timezones` gives the names; `timedatectl` alone shows the clock and NTP state.",
      "`TZ` ne le change que pour un shell et ses enfants. `timedatectl list-timezones` donne les noms ; `timedatectl` seul montre l'horloge et l'état NTP.",
      "`TZ` solo lo cambia para un shell y sus hijos. `timedatectl list-timezones` da los nombres; `timedatectl` a secas muestra el reloj y el estado de NTP.",
    ],
  },
];

export const system = { storage, users, packages, info };
