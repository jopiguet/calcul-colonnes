/** Linux, files: moving around, links, finding files, permissions, archives. */
import type { LinuxQuestion } from "./types";

const navigation: LinuxQuestion[] = [
  {
    id: "lx-nav-01",
    q: ["What does `cd -` do?", "Que fait `cd -` ?", "¿Qué hace `cd -`?"],
    a: ["Goes back to the previous directory", "Revient au répertoire précédent", "Vuelve al directorio anterior"],
    w: [
      ["Goes up to the parent directory", "Remonte au répertoire parent", "Sube al directorio padre"],
      ["Goes to the home directory", "Va au répertoire personnel", "Va al directorio personal"],
      ["Goes to the root directory `/`", "Va à la racine `/`", "Va a la raíz `/`"],
    ],
    e: [
      "`-` stands for the previous directory, kept in `OLDPWD`; `cd ..` goes up, `cd` alone goes home.",
      "`-` désigne le répertoire précédent, gardé dans `OLDPWD` ; `cd ..` remonte, `cd` seul ramène au répertoire personnel.",
      "`-` designa el directorio anterior, guardado en `OLDPWD`; `cd ..` sube y `cd` a secas lleva al directorio personal.",
    ],
  },
  {
    id: "lx-nav-02",
    q: ["Which option makes `ls` show files whose name starts with a dot?", "Quelle option fait afficher par `ls` les fichiers dont le nom commence par un point ?", "¿Qué opción hace que `ls` muestre los archivos cuyo nombre empieza por un punto?"],
    a: ["`-a`", "`-a`", "`-a`"],
    w: [["`-l`", "`-l`", "`-l`"], ["`-h`", "`-h`", "`-h`"], ["`-R`", "`-R`", "`-R`"], ["`-d`", "`-d`", "`-d`"]],
    e: [
      "Names starting with `.` are hidden by convention; `-a` shows them (with `.` and `..`), `-A` without those two.",
      "Les noms qui commencent par `.` sont cachés par convention ; `-a` les montre (avec `.` et `..`), `-A` sans ces deux-là.",
      "Los nombres que empiezan por `.` están ocultos por convención; `-a` los muestra (con `.` y `..`), `-A` sin esos dos.",
    ],
  },
  {
    id: "lx-nav-03",
    q: ["What does `cp -a src/ dst/` keep that `cp -r` does not?", "Que conserve `cp -a src/ dst/` que `cp -r` ne conserve pas ?", "¿Qué conserva `cp -a src/ dst/` que `cp -r` no conserva?"],
    a: [
      "Permissions, timestamps, ownership where possible, and symbolic links as links",
      "Les permissions, les dates, le propriétaire si possible, et les liens symboliques comme liens",
      "Los permisos, las fechas, el propietario si es posible, y los enlaces simbólicos como enlaces",
    ],
    w: [
      ["Nothing: `-a` is just another spelling of `-r`", "Rien : `-a` est une autre écriture de `-r`", "Nada: `-a` es otra forma de escribir `-r`"],
      ["It compresses the copy", "Elle compresse la copie", "Comprime la copia"],
      ["It copies only files newer than those in `dst/`", "Elle ne copie que les fichiers plus récents que ceux de `dst/`", "Solo copia los archivos más recientes que los de `dst/`"],
    ],
    e: [
      "`-a` (archive) is `-dR --preserve=all`. Copying only newer files is `-u`.",
      "`-a` (archive) vaut `-dR --preserve=all`. Ne copier que les fichiers plus récents, c'est `-u`.",
      "`-a` (archive) equivale a `-dR --preserve=all`. Copiar solo los más recientes es `-u`.",
    ],
  },
  {
    id: "lx-nav-04",
    q: ["`archive` is an existing directory. What does `mv report.txt archive` do?", "`archive` est un répertoire existant. Que fait `mv report.txt archive` ?", "`archive` es un directorio que ya existe. ¿Qué hace `mv report.txt archive`?"],
    a: ["Moves the file into it, as `archive/report.txt`", "Déplace le fichier dedans, en `archive/report.txt`", "Mueve el archivo dentro, como `archive/report.txt`"],
    w: [
      ["Replaces the directory by the file, renamed `archive`", "Remplace le répertoire par le fichier, renommé `archive`", "Sustituye el directorio por el archivo, renombrado `archive`"],
      ["Fails: the target already exists", "Échoue : la cible existe déjà", "Falla: el destino ya existe"],
      ["Copies the file and keeps the original", "Copie le fichier et garde l'original", "Copia el archivo y conserva el original"],
    ],
    e: [
      "When the last argument is a directory, `mv` moves the sources into it. Over an existing file it would overwrite it, unless `-i` or `-n`.",
      "Quand le dernier argument est un répertoire, `mv` y déplace les sources. Sur un fichier existant, il l'écraserait, sauf avec `-i` ou `-n`.",
      "Cuando el último argumento es un directorio, `mv` mueve allí los orígenes. Sobre un archivo existente lo sobrescribiría, salvo con `-i` o `-n`.",
    ],
  },
  {
    id: "lx-nav-05",
    q: ["`rmdir photos` answers 'Directory not empty'. Why?", "`rmdir photos` répond « Directory not empty ». Pourquoi ?", "`rmdir photos` responde «Directory not empty». ¿Por qué?"],
    a: ["`rmdir` only removes empty directories; `rm -r photos` removes one with its content", "`rmdir` ne supprime que les répertoires vides ; `rm -r photos` en supprime un avec son contenu", "`rmdir` solo elimina directorios vacíos; `rm -r photos` elimina uno con su contenido"],
    w: [
      ["Removing a directory needs `sudo`", "Supprimer un répertoire demande `sudo`", "Eliminar un directorio requiere `sudo`"],
      ["`photos` is a symbolic link", "`photos` est un lien symbolique", "`photos` es un enlace simbólico"],
      ["The option `-f` is missing", "Il manque l'option `-f`", "Falta la opción `-f`"],
    ],
    e: [
      "That makes `rmdir` a safe way to clean up empty directories: it never deletes files.",
      "C'est ce qui fait de `rmdir` un moyen sûr de nettoyer les répertoires vides : il ne supprime jamais de fichiers.",
      "Por eso `rmdir` es una forma segura de limpiar directorios vacíos: nunca borra archivos.",
    ],
  },
  {
    id: "lx-nav-06",
    q: ["What does `mkdir -p projects/2026/report` do if `projects` does not exist?", "Que fait `mkdir -p projects/2026/report` si `projects` n'existe pas ?", "¿Qué hace `mkdir -p projects/2026/report` si `projects` no existe?"],
    a: ["Creates the three directories, and is not an error if they exist", "Crée les trois répertoires, sans erreur s'ils existent déjà", "Crea los tres directorios, sin error si ya existen"],
    w: [
      ["Fails: `projects` must exist first", "Échoue : `projects` doit d'abord exister", "Falla: `projects` debe existir antes"],
      ["Creates only `report`, in the current directory", "Ne crée que `report`, dans le répertoire courant", "Crea solo `report`, en el directorio actual"],
      ["Creates them with private permissions", "Les crée avec des permissions privées", "Los crea con permisos privados"],
    ],
    e: [
      "`-p` (parents) creates the missing parents. Permissions follow the umask, as usual.",
      "`-p` (parents) crée les parents manquants. Les permissions suivent l'umask, comme d'habitude.",
      "`-p` (parents) crea los padres que faltan. Los permisos siguen la umask, como siempre.",
    ],
  },
  {
    id: "lx-nav-07",
    q: ["What does `touch notes.txt` do when the file already exists?", "Que fait `touch notes.txt` quand le fichier existe déjà ?", "¿Qué hace `touch notes.txt` cuando el archivo ya existe?"],
    a: ["Updates its access and modification times, without changing its content", "Met à jour ses dates d'accès et de modification, sans changer son contenu", "Actualiza sus fechas de acceso y modificación, sin cambiar su contenido"],
    w: [
      ["Empties it", "Le vide", "Lo vacía"],
      ["Nothing at all", "Rien du tout", "Nada en absoluto"],
      ["Creates `notes.txt.1` next to it", "Crée `notes.txt.1` à côté", "Crea `notes.txt.1` al lado"],
    ],
    e: [
      "Creating an empty file is only what `touch` does when the file is missing. To empty a file: `> notes.txt` or `truncate -s 0 notes.txt`.",
      "Créer un fichier vide n'est que ce que fait `touch` quand le fichier manque. Pour vider un fichier : `> notes.txt` ou `truncate -s 0 notes.txt`.",
      "Crear un archivo vacío es solo lo que hace `touch` cuando el archivo falta. Para vaciarlo: `> notes.txt` o `truncate -s 0 notes.txt`.",
    ],
  },
];

const links: LinuxQuestion[] = [
  {
    id: "lx-link-01",
    q: ["After `ln data.csv copy.csv` then `rm data.csv`, what about `copy.csv`?", "Après `ln data.csv copy.csv` puis `rm data.csv`, qu'en est-il de `copy.csv` ?", "Tras `ln data.csv copy.csv` y luego `rm data.csv`, ¿qué pasa con `copy.csv`?"],
    a: ["It still holds the data: both names pointed to the same inode", "Il contient toujours les données : les deux noms désignaient le même inode", "Sigue teniendo los datos: ambos nombres apuntaban al mismo inodo"],
    w: [
      ["It is a broken link", "C'est un lien cassé", "Es un enlace roto"],
      ["It is deleted too", "Il est supprimé aussi", "También se elimina"],
      ["It becomes empty", "Il devient vide", "Queda vacío"],
    ],
    e: [
      "Without `-s`, `ln` makes a hard link: a second name for the same file. The data goes when the last name does (link count 0).",
      "Sans `-s`, `ln` crée un lien physique : un second nom pour le même fichier. Les données disparaissent avec le dernier nom (compteur de liens à 0).",
      "Sin `-s`, `ln` crea un enlace duro: un segundo nombre para el mismo archivo. Los datos desaparecen con el último nombre (contador de enlaces a 0).",
    ],
  },
  {
    id: "lx-link-02",
    q: ["After `ln -s data.csv latest.csv` then `rm data.csv`, what does `cat latest.csv` give?", "Après `ln -s data.csv latest.csv` puis `rm data.csv`, que donne `cat latest.csv` ?", "Tras `ln -s data.csv latest.csv` y luego `rm data.csv`, ¿qué da `cat latest.csv`?"],
    a: ["'No such file or directory': the link points to a name that is gone", "« No such file or directory » : le lien pointe vers un nom qui n'existe plus", "«No such file or directory»: el enlace apunta a un nombre que ya no existe"],
    w: [
      ["The old content, kept by the link", "L'ancien contenu, gardé par le lien", "El contenido antiguo, conservado por el enlace"],
      ["An empty output", "Une sortie vide", "Una salida vacía"],
      ["The text `data.csv`", "Le texte `data.csv`", "El texto `data.csv`"],
    ],
    e: [
      "A symbolic link stores a path. It dangles once the target is removed, and works again if a file of that name comes back.",
      "Un lien symbolique stocke un chemin. Il pend dès que la cible est supprimée, et refonctionne si un fichier de ce nom revient.",
      "Un enlace simbólico guarda una ruta. Queda colgando cuando se elimina el destino y vuelve a funcionar si reaparece un archivo con ese nombre.",
    ],
  },
  {
    id: "lx-link-03",
    q: ["Why does `ln /mnt/usb/photo.jpg photo.jpg` fail when the USB stick is another filesystem?", "Pourquoi `ln /mnt/usb/photo.jpg photo.jpg` échoue-t-il quand la clé USB est un autre système de fichiers ?", "¿Por qué falla `ln /mnt/usb/photo.jpg photo.jpg` cuando la memoria USB es otro sistema de archivos?"],
    a: ["A hard link names an inode, and inodes belong to one filesystem; `ln -s` works across them", "Un lien physique nomme un inode, et les inodes appartiennent à un seul système de fichiers ; `ln -s` fonctionne entre eux", "Un enlace duro nombra un inodo, y los inodos pertenecen a un solo sistema de archivos; `ln -s` funciona entre ellos"],
    w: [
      ["USB sticks are always read-only", "Les clés USB sont toujours en lecture seule", "Las memorias USB siempre son de solo lectura"],
      ["Links need `sudo`", "Les liens demandent `sudo`", "Los enlaces requieren `sudo`"],
      ["The names must differ", "Les noms doivent être différents", "Los nombres deben ser distintos"],
    ],
    e: [
      "The error is 'Invalid cross-device link'. Hard links to directories are not allowed either.",
      "L'erreur est « Invalid cross-device link ». Les liens physiques vers des répertoires ne sont pas permis non plus.",
      "El error es «Invalid cross-device link». Tampoco se permiten enlaces duros a directorios.",
    ],
  },
  {
    id: "lx-link-04",
    q: ["In `ls -l` output, what is the number right after the permissions?", "Dans la sortie de `ls -l`, quel est le nombre juste après les permissions ?", "En la salida de `ls -l`, ¿qué es el número justo después de los permisos?"],
    a: ["The number of hard links", "Le nombre de liens physiques", "El número de enlaces duros"],
    w: [
      ["The size in blocks", "La taille en blocs", "El tamaño en bloques"],
      ["The inode number", "Le numéro d'inode", "El número de inodo"],
      ["The number of times the file was opened", "Le nombre d'ouvertures du fichier", "El número de veces que se abrió el archivo"],
    ],
    e: [
      "For a directory it is 2 plus its number of subdirectories (`.` and each `..`). The inode number is shown by `ls -i`.",
      "Pour un répertoire, c'est 2 plus son nombre de sous-répertoires (`.` et chaque `..`). Le numéro d'inode s'affiche avec `ls -i`.",
      "En un directorio es 2 más su número de subdirectorios (`.` y cada `..`). El número de inodo lo muestra `ls -i`.",
    ],
  },
  {
    id: "lx-link-05",
    q: ["Which command gives the absolute path a symbolic link finally leads to, through every link?", "Quelle commande donne le chemin absolu auquel mène finalement un lien symbolique, à travers tous les liens ?", "¿Qué comando da la ruta absoluta a la que lleva finalmente un enlace simbólico, a través de todos los enlaces?"],
    a: ["`readlink -f`", "`readlink -f`", "`readlink -f`"],
    w: [["`ls -l`", "`ls -l`", "`ls -l`"], ["`stat -c %i`", "`stat -c %i`", "`stat -c %i`"], ["`file`", "`file`", "`file`"]],
    e: [
      "`readlink` alone prints one level; `-f` (or `realpath`) resolves all of them. `ls -l` shows only the first target.",
      "`readlink` seul affiche un niveau ; `-f` (ou `realpath`) les résout tous. `ls -l` ne montre que la première cible.",
      "`readlink` a secas muestra un nivel; `-f` (o `realpath`) los resuelve todos. `ls -l` solo muestra el primer destino.",
    ],
  },
];

const find: LinuxQuestion[] = [
  {
    id: "lx-find-01",
    q: ["In `find . -name '*.log' -mtime +7`, what does `-mtime +7` select?", "Dans `find . -name '*.log' -mtime +7`, que sélectionne `-mtime +7` ?", "En `find . -name '*.log' -mtime +7`, ¿qué selecciona `-mtime +7`?"],
    a: ["Files modified more than 7 days ago (8 whole days or more)", "Les fichiers modifiés il y a plus de 7 jours (8 jours entiers ou plus)", "Los archivos modificados hace más de 7 días (8 días enteros o más)"],
    w: [
      ["Files modified within the last 7 days", "Les fichiers modifiés dans les 7 derniers jours", "Los archivos modificados en los últimos 7 días"],
      ["Files modified exactly 7 days ago", "Les fichiers modifiés il y a exactement 7 jours", "Los archivos modificados hace exactamente 7 días"],
      ["Files modified more than 7 minutes ago", "Les fichiers modifiés il y a plus de 7 minutes", "Los archivos modificados hace más de 7 minutos"],
    ],
    e: [
      "Ages count in whole days, rounded down: `+7` means more than 7, `-7` less than 7, `7` exactly 7. Minutes are `-mmin`.",
      "Les âges se comptent en jours entiers, arrondis vers le bas : `+7` veut dire plus de 7, `-7` moins de 7, `7` exactement 7. Les minutes, c'est `-mmin`.",
      "Las edades se cuentan en días enteros, redondeando hacia abajo: `+7` es más de 7, `-7` menos de 7 y `7` exactamente 7. Los minutos son `-mmin`.",
    ],
  },
  {
    id: "lx-find-02",
    q: ["Why write `find . -name '*.log'` with the quotes?", "Pourquoi écrire `find . -name '*.log'` avec les guillemets ?", "¿Por qué escribir `find . -name '*.log'` con las comillas?"],
    a: ["Otherwise the shell expands `*.log` in the current directory before `find` sees it", "Sinon le shell développe `*.log` dans le répertoire courant avant que `find` ne le voie", "Si no, el shell expande `*.log` en el directorio actual antes de que `find` lo vea"],
    w: [
      ["Quotes make the search case-insensitive", "Les guillemets rendent la recherche insensible à la casse", "Las comillas hacen la búsqueda insensible a mayúsculas"],
      ["`find` requires every argument in quotes", "`find` exige tous ses arguments entre guillemets", "`find` exige todos sus argumentos entre comillas"],
      ["They make `find` search subdirectories", "Elles font chercher `find` dans les sous-répertoires", "Hacen que `find` busque en los subdirectorios"],
    ],
    e: [
      "With one `.log` file here, `find` would receive its name and look only for that name. Case-insensitive is `-iname`; `find` always recurses.",
      "S'il y a un fichier `.log` ici, `find` recevrait son nom et ne chercherait que ce nom. Sans casse, c'est `-iname` ; `find` descend toujours dans les sous-répertoires.",
      "Si hay un archivo `.log` aquí, `find` recibiría su nombre y buscaría solo ese nombre. Sin distinguir mayúsculas es `-iname`; `find` siempre recorre los subdirectorios.",
    ],
  },
  {
    id: "lx-find-03",
    q: ["What is the difference between `-exec rm {} \;` and `-exec rm {} +` in `find`?", "Quelle différence entre `-exec rm {} \;` et `-exec rm {} +` dans `find` ?", "¿Qué diferencia hay entre `-exec rm {} \;` y `-exec rm {} +` en `find`?"],
    a: ["`;` runs `rm` once per file, `+` passes many files to each `rm`", "`;` lance `rm` une fois par fichier, `+` passe beaucoup de fichiers à chaque `rm`", "`;` ejecuta `rm` una vez por archivo, `+` pasa muchos archivos a cada `rm`"],
    w: [
      ["`+` asks for confirmation before each file", "`+` demande confirmation avant chaque fichier", "`+` pide confirmación antes de cada archivo"],
      ["`;` also deletes directories", "`;` supprime aussi les répertoires", "`;` también elimina directorios"],
      ["None: both are spellings of the same thing", "Aucune : ce sont deux écritures de la même chose", "Ninguna: son dos formas de escribir lo mismo"],
    ],
    e: [
      "`+` works like `xargs` and is much faster on many files. Confirmation per file is `-ok`. `find -delete` is simpler still.",
      "`+` fonctionne comme `xargs` et va bien plus vite sur beaucoup de fichiers. La confirmation par fichier, c'est `-ok`. `find -delete` est encore plus simple.",
      "`+` funciona como `xargs` y es mucho más rápido con muchos archivos. La confirmación por archivo es `-ok`. `find -delete` es aún más sencillo.",
    ],
  },
  {
    id: "lx-find-04",
    q: ["Which command finds regular files larger than 100 MiB under `/var`?", "Quelle commande trouve les fichiers ordinaires de plus de 100 Mio sous `/var` ?", "¿Qué comando encuentra los archivos normales de más de 100 MiB bajo `/var`?"],
    a: ["`find /var -type f -size +100M`", "`find /var -type f -size +100M`", "`find /var -type f -size +100M`"],
    w: [
      ["`find /var -type f -size 100M`", "`find /var -type f -size 100M`", "`find /var -type f -size 100M`"],
      ["`du -h /var | grep 100M`", "`du -h /var | grep 100M`", "`du -h /var | grep 100M`"],
      ["`ls -lR /var --min-size=100M`", "`ls -lR /var --min-size=100M`", "`ls -lR /var --min-size=100M`"],
    ],
    e: [
      "`+` means more than; without it, the size must round to exactly 100 MiB. `ls` has no size filter.",
      "`+` veut dire plus de ; sans lui, la taille doit valoir exactement 100 Mio après arrondi. `ls` n'a pas de filtre de taille.",
      "`+` significa más de; sin él, el tamaño debe ser exactamente 100 MiB tras redondear. `ls` no tiene filtro de tamaño.",
    ],
  },
  {
    id: "lx-find-05",
    q: ["Which command tells whether `ls` is an alias, a shell builtin or a program?", "Quelle commande dit si `ls` est un alias, une commande interne du shell ou un programme ?", "¿Qué comando dice si `ls` es un alias, una orden interna del shell o un programa?"],
    a: ["`type ls`", "`type ls`", "`type ls`"],
    w: [["`which ls`", "`which ls`", "`which ls`"], ["`whereis ls`", "`whereis ls`", "`whereis ls`"], ["`file ls`", "`file ls`", "`file ls`"]],
    e: [
      "`type` is a shell builtin and knows aliases and functions; `which` only searches `PATH` for a file.",
      "`type` est interne au shell et connaît alias et fonctions ; `which` ne fait que chercher un fichier dans `PATH`.",
      "`type` es interno del shell y conoce alias y funciones; `which` solo busca un archivo en `PATH`.",
    ],
  },
  {
    id: "lx-find-06",
    q: ["`locate report.pdf` does not find a file created a minute ago. Why?", "`locate report.pdf` ne trouve pas un fichier créé il y a une minute. Pourquoi ?", "`locate report.pdf` no encuentra un archivo creado hace un minuto. ¿Por qué?"],
    a: ["It searches a database that `updatedb` refreshes from time to time", "Il cherche dans une base que `updatedb` rafraîchit de temps en temps", "Busca en una base de datos que `updatedb` actualiza de vez en cuando"],
    w: [
      ["It only searches the current directory", "Il ne cherche que dans le répertoire courant", "Solo busca en el directorio actual"],
      ["It ignores PDF files", "Il ignore les fichiers PDF", "Ignora los archivos PDF"],
      ["New files are hidden for an hour", "Les nouveaux fichiers sont cachés pendant une heure", "Los archivos nuevos están ocultos una hora"],
    ],
    e: [
      "That is why it is instant. `sudo updatedb` refreshes it now; `find` always looks at the disk.",
      "C'est pourquoi il est instantané. `sudo updatedb` la rafraîchit tout de suite ; `find` regarde toujours le disque.",
      "Por eso es instantáneo. `sudo updatedb` la actualiza al momento; `find` siempre mira el disco.",
    ],
    install: { apt: "plocate", dnf: "plocate" },
  },
];

const permissions: LinuxQuestion[] = [
  {
    id: "lx-perm-01",
    q: ["On a directory, what does the `x` permission allow?", "Sur un répertoire, que permet la permission `x` ?", "En un directorio, ¿qué permite el permiso `x`?"],
    a: ["Entering it and reaching the files inside by name", "D'y entrer et d'atteindre les fichiers qu'il contient par leur nom", "Entrar en él y llegar a los archivos que contiene por su nombre"],
    w: [
      ["Running the programs it contains", "D'exécuter les programmes qu'il contient", "Ejecutar los programas que contiene"],
      ["Listing the names of its files", "De lister les noms de ses fichiers", "Listar los nombres de sus archivos"],
      ["Nothing: `x` has no meaning for directories", "Rien : `x` n'a pas de sens pour un répertoire", "Nada: `x` no tiene sentido en un directorio"],
    ],
    e: [
      "Listing names needs `r`; creating or deleting entries needs `w` and `x`. Running a program depends on the program's own `x`.",
      "Lister les noms demande `r` ; créer ou supprimer des entrées demande `w` et `x`. Exécuter un programme dépend du `x` du programme lui-même.",
      "Listar los nombres requiere `r`; crear o borrar entradas requiere `w` y `x`. Ejecutar un programa depende del `x` del propio programa.",
    ],
  },
  {
    id: "lx-perm-02",
    q: ["Can you delete a file on which you have no write permission?", "Peut-on supprimer un fichier sur lequel on n'a pas le droit d'écriture ?", "¿Se puede borrar un archivo sobre el que no se tiene permiso de escritura?"],
    a: ["Yes, with write and execute permission on its directory (and no sticky bit)", "Oui, avec les droits d'écriture et d'exécution sur son répertoire (et sans sticky bit)", "Sí, con permisos de escritura y ejecución en su directorio (y sin sticky bit)"],
    w: [
      ["No, never", "Non, jamais", "No, nunca"],
      ["Only as root", "Seulement en root", "Solo como root"],
      ["Only if the file is empty", "Seulement si le fichier est vide", "Solo si el archivo está vacío"],
    ],
    e: [
      "Deleting removes a name from the directory, so the directory's permissions decide. `rm` asks first when the file is write-protected.",
      "Supprimer retire un nom du répertoire : ce sont les permissions du répertoire qui décident. `rm` demande confirmation quand le fichier est protégé en écriture.",
      "Borrar quita un nombre del directorio, así que deciden los permisos del directorio. `rm` pregunta antes si el archivo está protegido contra escritura.",
    ],
  },
  {
    id: "lx-perm-03",
    q: ["`/tmp` shows `drwxrwxrwt`. What does the final `t` (sticky bit) do?", "`/tmp` affiche `drwxrwxrwt`. Que fait le `t` final (sticky bit) ?", "`/tmp` muestra `drwxrwxrwt`. ¿Qué hace la `t` final (sticky bit)?"],
    a: ["Only a file's owner (or root) can delete or rename it there", "Seul le propriétaire d'un fichier (ou root) peut l'y supprimer ou le renommer", "Solo el propietario de un archivo (o root) puede borrarlo o renombrarlo allí"],
    w: [
      ["Files there are deleted at each reboot", "Les fichiers y sont effacés à chaque redémarrage", "Los archivos se borran en cada reinicio"],
      ["Files there stay in memory", "Les fichiers y restent en mémoire", "Los archivos se quedan en memoria"],
      ["Everyone can read every file there", "Tout le monde peut y lire tous les fichiers", "Todo el mundo puede leer allí todos los archivos"],
    ],
    e: [
      "Everyone may create files in `/tmp`, but not remove other people's. Cleaning at reboot is a separate setting (tmpfs or `systemd-tmpfiles`).",
      "Tout le monde peut créer des fichiers dans `/tmp`, mais pas supprimer ceux des autres. Le nettoyage au redémarrage est un réglage à part (tmpfs ou `systemd-tmpfiles`).",
      "Todos pueden crear archivos en `/tmp`, pero no borrar los de otros. La limpieza al reiniciar es otro ajuste (tmpfs o `systemd-tmpfiles`).",
    ],
  },
  {
    id: "lx-perm-04",
    q: ["Why is `/usr/bin/passwd` shown as `-rwsr-xr-x`?", "Pourquoi `/usr/bin/passwd` apparaît-il comme `-rwsr-xr-x` ?", "¿Por qué `/usr/bin/passwd` aparece como `-rwsr-xr-x`?"],
    a: ["The setuid bit: it runs with its owner's rights (root), to write the password file", "Le bit setuid : il s'exécute avec les droits de son propriétaire (root), pour écrire le fichier des mots de passe", "El bit setuid: se ejecuta con los derechos de su propietario (root), para escribir el archivo de contraseñas"],
    w: [
      ["`s` means the program is signed", "`s` veut dire que le programme est signé", "`s` significa que el programa está firmado"],
      ["`s` means it is a symbolic link", "`s` veut dire que c'est un lien symbolique", "`s` significa que es un enlace simbólico"],
      ["`s` means only root may run it", "`s` veut dire que seul root peut l'exécuter", "`s` significa que solo root puede ejecutarlo"],
    ],
    e: [
      "Setuid is octal 4000 (`chmod u+s`); setgid 2000; sticky 1000. Symbolic links show `l` as their type letter.",
      "Setuid vaut 4000 en octal (`chmod u+s`) ; setgid 2000 ; sticky 1000. Les liens symboliques ont la lettre de type `l`.",
      "Setuid vale 4000 en octal (`chmod u+s`); setgid 2000; sticky 1000. Los enlaces simbólicos tienen la letra de tipo `l`.",
    ],
  },
  {
    id: "lx-perm-05",
    q: ["Who can give one of their files to another user with `chown bob file`?", "Qui peut donner un de ses fichiers à un autre utilisateur avec `chown bob file` ?", "¿Quién puede dar uno de sus archivos a otro usuario con `chown bob file`?"],
    a: ["Only root (a process with `CAP_CHOWN`)", "Seulement root (un processus avec `CAP_CHOWN`)", "Solo root (un proceso con `CAP_CHOWN`)"],
    w: [
      ["The file's owner", "Le propriétaire du fichier", "El propietario del archivo"],
      ["Anyone with write permission on the file", "Toute personne ayant le droit d'écriture sur le fichier", "Cualquiera con permiso de escritura sobre el archivo"],
      ["Members of the file's group", "Les membres du groupe du fichier", "Los miembros del grupo del archivo"],
    ],
    e: [
      "Otherwise users could escape disk quotas or plant files under others' names. The owner may change the group, to one of their own groups (`chgrp`).",
      "Sinon on pourrait échapper aux quotas ou déposer des fichiers au nom d'autrui. Le propriétaire peut changer le groupe, pour un de ses propres groupes (`chgrp`).",
      "Si no, se podrían eludir las cuotas o dejar archivos a nombre de otros. El propietario puede cambiar el grupo, a uno de sus propios grupos (`chgrp`).",
    ],
  },
  {
    id: "lx-perm-06",
    q: ["What does `chmod u+x,go-w deploy.sh` do?", "Que fait `chmod u+x,go-w deploy.sh` ?", "¿Qué hace `chmod u+x,go-w deploy.sh`?"],
    a: ["Adds execute for the owner, removes write for group and others", "Ajoute l'exécution pour le propriétaire, retire l'écriture au groupe et aux autres", "Añade ejecución al propietario y quita escritura al grupo y a los demás"],
    w: [
      ["Adds execute for everyone, removes write for the owner", "Ajoute l'exécution pour tous, retire l'écriture au propriétaire", "Añade ejecución a todos y quita escritura al propietario"],
      ["Sets the mode to exactly `u=x,go=`", "Fixe le mode à exactement `u=x,go=`", "Fija el modo exactamente en `u=x,go=`"],
      ["Gives the file to user `u` and group `go`", "Donne le fichier à l'utilisateur `u` et au groupe `go`", "Da el archivo al usuario `u` y al grupo `go`"],
    ],
    e: [
      "`u` user (owner), `g` group, `o` others, `a` all; `+` adds, `-` removes, `=` sets exactly. Other bits are left as they were.",
      "`u` utilisateur (propriétaire), `g` groupe, `o` autres, `a` tous ; `+` ajoute, `-` retire, `=` fixe exactement. Les autres bits restent tels quels.",
      "`u` usuario (propietario), `g` grupo, `o` otros, `a` todos; `+` añade, `-` quita, `=` fija exactamente. Los demás bits quedan como estaban.",
    ],
  },
  {
    id: "lx-perm-07",
    q: ["What does the capital `X` do in `chmod -R a+X shared/`?", "Que fait le `X` majuscule dans `chmod -R a+X shared/` ?", "¿Qué hace la `X` mayúscula en `chmod -R a+X shared/`?"],
    a: ["Adds execute only to directories, and to files already executable by someone", "N'ajoute l'exécution qu'aux répertoires, et aux fichiers déjà exécutables par quelqu'un", "Solo añade ejecución a los directorios y a los archivos ya ejecutables por alguien"],
    w: [
      ["Adds execute to every file and directory", "Ajoute l'exécution à tous les fichiers et répertoires", "Añade ejecución a todos los archivos y directorios"],
      ["Removes execute everywhere", "Retire l'exécution partout", "Quita la ejecución en todas partes"],
      ["It is an error: only `x` exists", "C'est une erreur : seul `x` existe", "Es un error: solo existe `x`"],
    ],
    e: [
      "It opens a tree for browsing without making every document executable, which `a+x` would do.",
      "Il ouvre une arborescence à la navigation sans rendre tous les documents exécutables, ce que ferait `a+x`.",
      "Abre un árbol para recorrerlo sin hacer ejecutables todos los documentos, cosa que haría `a+x`.",
    ],
  },
];

const archives: LinuxQuestion[] = [
  {
    id: "lx-arch-01",
    q: ["What does `tar -xzf site.tar.gz -C /srv` do?", "Que fait `tar -xzf site.tar.gz -C /srv` ?", "¿Qué hace `tar -xzf site.tar.gz -C /srv`?"],
    a: ["Extracts the gzip-compressed archive into `/srv`", "Extrait l'archive compressée en gzip dans `/srv`", "Extrae el archivo comprimido con gzip en `/srv`"],
    w: [
      ["Creates `site.tar.gz` from `/srv`", "Crée `site.tar.gz` à partir de `/srv`", "Crea `site.tar.gz` a partir de `/srv`"],
      ["Lists the archive's content, then copies it to `/srv`", "Liste le contenu de l'archive, puis le copie dans `/srv`", "Lista el contenido del archivo y luego lo copia a `/srv`"],
      ["Compresses `/srv` into `site.tar.gz`", "Compresse `/srv` dans `site.tar.gz`", "Comprime `/srv` en `site.tar.gz`"],
    ],
    e: [
      "`x` extract, `c` create, `t` list; `z` gzip; `f` the archive's file name; `-C` the directory to work in. Recent GNU tar detects the compression when extracting, so `z` is optional there.",
      "`x` extraire, `c` créer, `t` lister ; `z` gzip ; `f` le nom du fichier d'archive ; `-C` le répertoire où travailler. Les tar GNU récents détectent la compression à l'extraction, `z` y est facultatif.",
      "`x` extraer, `c` crear, `t` listar; `z` gzip; `f` el nombre del archivo; `-C` el directorio donde trabajar. Los tar GNU recientes detectan la compresión al extraer, así que ahí `z` es opcional.",
    ],
  },
  {
    id: "lx-arch-02",
    q: ["What does `tar -cfz backup.tar.gz docs/` do?", "Que fait `tar -cfz backup.tar.gz docs/` ?", "¿Qué hace `tar -cfz backup.tar.gz docs/`?"],
    a: ["Writes an uncompressed archive named `z`: `-f` takes the next letter as its file name", "Écrit une archive non compressée nommée `z` : `-f` prend la lettre suivante comme nom de fichier", "Escribe un archivo sin comprimir llamado `z`: `-f` toma la letra siguiente como nombre de archivo"],
    w: [
      ["Creates the gzip archive `backup.tar.gz`, as intended", "Crée l'archive gzip `backup.tar.gz`, comme voulu", "Crea el archivo gzip `backup.tar.gz`, como se quería"],
      ["Refuses: options are in the wrong order", "Refuse : les options sont dans le mauvais ordre", "Se niega: las opciones están en mal orden"],
      ["Compresses `docs/` in place", "Compresse `docs/` sur place", "Comprime `docs/` en el sitio"],
    ],
    e: [
      "`f` must come last in the cluster: `tar -czf backup.tar.gz docs/`. Here `backup.tar.gz` becomes a file to add, and tar complains it does not exist.",
      "`f` doit venir en dernier dans le groupe : `tar -czf backup.tar.gz docs/`. Ici, `backup.tar.gz` devient un fichier à ajouter, et tar se plaint qu'il n'existe pas.",
      "`f` debe ir al final del grupo: `tar -czf backup.tar.gz docs/`. Aquí `backup.tar.gz` pasa a ser un archivo que añadir, y tar se queja de que no existe.",
    ],
  },
  {
    id: "lx-arch-03",
    q: ["What happens to `notes.txt` after `gzip notes.txt`?", "Que devient `notes.txt` après `gzip notes.txt` ?", "¿Qué pasa con `notes.txt` tras `gzip notes.txt`?"],
    a: ["It is replaced by `notes.txt.gz`", "Il est remplacé par `notes.txt.gz`", "Se sustituye por `notes.txt.gz`"],
    w: [
      ["It stays, next to `notes.txt.gz`", "Il reste, à côté de `notes.txt.gz`", "Se queda, junto a `notes.txt.gz`"],
      ["It is compressed into `notes.zip`", "Il est compressé dans `notes.zip`", "Se comprime en `notes.zip`"],
      ["It is moved into a `gzip/` directory", "Il est déplacé dans un répertoire `gzip/`", "Se mueve a un directorio `gzip/`"],
    ],
    e: [
      "`gzip -k` keeps the original; `gunzip` or `gzip -d` reverses it. gzip compresses one file: `tar` bundles several first.",
      "`gzip -k` garde l'original ; `gunzip` ou `gzip -d` fait l'inverse. gzip compresse un fichier : `tar` en regroupe plusieurs avant.",
      "`gzip -k` conserva el original; `gunzip` o `gzip -d` lo deshacen. gzip comprime un archivo: `tar` agrupa antes varios.",
    ],
  },
  {
    id: "lx-arch-04",
    q: ["How do you see what a `.tar.gz` contains without extracting it?", "Comment voir ce que contient un `.tar.gz` sans l'extraire ?", "¿Cómo ver lo que contiene un `.tar.gz` sin extraerlo?"],
    a: ["`tar -tzf archive.tar.gz`", "`tar -tzf archive.tar.gz`", "`tar -tzf archive.tar.gz`"],
    w: [
      ["`tar -xvf archive.tar.gz --dry`", "`tar -xvf archive.tar.gz --dry`", "`tar -xvf archive.tar.gz --dry`"],
      ["`gzip -l archive.tar.gz`", "`gzip -l archive.tar.gz`", "`gzip -l archive.tar.gz`"],
      ["`cat archive.tar.gz`", "`cat archive.tar.gz`", "`cat archive.tar.gz`"],
    ],
    e: [
      "`t` lists the members. `gzip -l` only gives the compressed and uncompressed sizes of the whole stream.",
      "`t` liste les membres. `gzip -l` ne donne que les tailles compressée et décompressée du flux entier.",
      "`t` lista los miembros. `gzip -l` solo da los tamaños comprimido y sin comprimir del flujo entero.",
    ],
  },
  {
    id: "lx-arch-05",
    q: ["Which compressor is usually the fastest for a ratio at least as good as gzip's?", "Quel compresseur est en général le plus rapide pour un taux au moins aussi bon que gzip ?", "¿Qué compresor suele ser el más rápido con una tasa al menos tan buena como la de gzip?"],
    a: ["zstd (`tar --zstd`)", "zstd (`tar --zstd`)", "zstd (`tar --zstd`)"],
    w: [["bzip2", "bzip2", "bzip2"], ["xz", "xz", "xz"], ["compress (`.Z`)", "compress (`.Z`)", "compress (`.Z`)"]],
    e: [
      "xz compresses harder but slowly; bzip2 is slow; zstd is fast in both directions, with levels up to `-19`.",
      "xz compresse plus fort mais lentement ; bzip2 est lent ; zstd est rapide dans les deux sens, avec des niveaux jusqu'à `-19`.",
      "xz comprime más pero despacio; bzip2 es lento; zstd es rápido en ambos sentidos, con niveles hasta `-19`.",
    ],
  },
  {
    id: "lx-arch-06",
    q: ["On a fresh Debian server, `unzip photos.zip` gives 'command not found'. What now?", "Sur un serveur Debian tout neuf, `unzip photos.zip` répond « command not found ». Que faire ?", "En un servidor Debian recién instalado, `unzip photos.zip` responde «command not found». ¿Qué hacer?"],
    a: ["Install the `unzip` package", "Installer le paquet `unzip`", "Instalar el paquete `unzip`"],
    w: [
      ["Use `tar -xf photos.zip`, which reads every format", "Utiliser `tar -xf photos.zip`, qui lit tous les formats", "Usar `tar -xf photos.zip`, que lee todos los formatos"],
      ["Rename it to `photos.tar.gz`", "Le renommer en `photos.tar.gz`", "Renombrarlo a `photos.tar.gz`"],
      ["Run it again with `sudo`", "Le relancer avec `sudo`", "Ejecutarlo de nuevo con `sudo`"],
    ],
    e: [
      "zip tools are not part of a minimal install. (bsdtar, from `libarchive-tools`, can read zip files; GNU tar cannot.)",
      "Les outils zip ne font pas partie d'une installation minimale. (bsdtar, de `libarchive-tools`, sait lire les zip ; GNU tar non.)",
      "Las herramientas zip no forman parte de una instalación mínima. (bsdtar, de `libarchive-tools`, sabe leer zip; GNU tar no.)",
    ],
    install: { apt: "unzip", dnf: "unzip" },
  },
];

export const files = { navigation, links, find, permissions, archives };
