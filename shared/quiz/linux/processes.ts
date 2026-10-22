/** Linux, processes: listing, signals, jobs, services (systemd), scheduling. */
import type { LinuxQuestion } from "./types";

const listing: LinuxQuestion[] = [
  {
    id: "lx-proc-01",
    q: ["Which command lists every process of every user, with its CPU and memory use?", "Quelle commande liste tous les processus de tous les utilisateurs, avec leur usage de processeur et de mémoire ?", "¿Qué comando lista todos los procesos de todos los usuarios, con su uso de CPU y memoria?"],
    a: ["`ps aux`", "`ps aux`", "`ps aux`"],
    w: [["`ps`", "`ps`", "`ps`"], ["`jobs -l`", "`jobs -l`", "`jobs -l`"], ["`ls /proc`", "`ls /proc`", "`ls /proc`"]],
    e: [
      "Plain `ps` shows only the processes of the current terminal; `jobs` only the shell's own jobs. `/proc` has a directory per process, without any summary.",
      "`ps` seul ne montre que les processus du terminal courant ; `jobs` seulement les tâches du shell. `/proc` a un répertoire par processus, sans résumé.",
      "`ps` a secas solo muestra los procesos del terminal actual; `jobs`, solo las tareas del shell. `/proc` tiene un directorio por proceso, sin resumen.",
    ],
  },
  {
    id: "lx-proc-02",
    q: ["What is the 'load average' shown by `uptime`?", "Qu'est-ce que la « load average » affichée par `uptime` ?", "¿Qué es la «load average» que muestra `uptime`?"],
    a: ["The average number of processes running or waiting to run (or for disk), over 1, 5 and 15 minutes", "Le nombre moyen de processus en cours ou en attente du processeur (ou du disque), sur 1, 5 et 15 minutes", "El número medio de procesos ejecutándose o esperando la CPU (o el disco), en 1, 5 y 15 minutos"],
    w: [
      ["The CPU usage in percent, per core", "L'usage du processeur en pour cent, par cœur", "El uso de CPU en porcentaje, por núcleo"],
      ["The memory used, in GiB", "La mémoire utilisée, en Gio", "La memoria usada, en GiB"],
      ["The number of users logged in", "Le nombre d'utilisateurs connectés", "El número de usuarios conectados"],
    ],
    e: [
      "Compare it with the number of cores (`nproc`): 4.0 keeps a 4-core machine fully busy. On Linux, processes waiting for disk count too.",
      "On la compare au nombre de cœurs (`nproc`) : 4,0 occupe pleinement une machine à 4 cœurs. Sous Linux, les processus qui attendent le disque comptent aussi.",
      "Se compara con el número de núcleos (`nproc`): 4,0 ocupa por completo una máquina de 4 núcleos. En Linux, los procesos que esperan al disco también cuentan.",
    ],
  },
  {
    id: "lx-proc-03",
    q: ["`ps` shows a process in state `Z` (zombie). What is it?", "`ps` montre un processus dans l'état `Z` (zombie). Qu'est-ce que c'est ?", "`ps` muestra un proceso en estado `Z` (zombi). ¿Qué es?"],
    a: ["A finished process whose parent has not yet collected its exit status", "Un processus terminé dont le parent n'a pas encore récupéré le code de sortie", "Un proceso terminado cuyo padre aún no ha recogido su código de salida"],
    w: [
      ["A process using 100 % of the CPU", "Un processus qui utilise 100 % du processeur", "Un proceso que usa el 100 % de la CPU"],
      ["A process that `kill -9` will remove", "Un processus que `kill -9` fera disparaître", "Un proceso que `kill -9` hará desaparecer"],
      ["A virus", "Un virus", "Un virus"],
    ],
    e: [
      "It uses no memory, only a table entry; it cannot be killed, being already dead. It goes when the parent waits for it, or ends (then `init` adopts and reaps it).",
      "Il n'utilise pas de mémoire, juste une entrée de table ; on ne peut pas le tuer, il est déjà mort. Il disparaît quand le parent l'attend, ou se termine (`init` l'adopte alors et le récupère).",
      "No usa memoria, solo una entrada de la tabla; no se puede matar, ya está muerto. Desaparece cuando el padre lo espera o termina (entonces `init` lo adopta y lo recoge).",
    ],
  },
  {
    id: "lx-proc-04",
    q: ["What does `nice -n 10 ./encode.sh` do?", "Que fait `nice -n 10 ./encode.sh` ?", "¿Qué hace `nice -n 10 ./encode.sh`?"],
    a: ["Runs it with a lower priority, so other work goes first", "Le lance avec une priorité plus basse, pour que le reste passe d'abord", "Lo ejecuta con menor prioridad, para que el resto vaya primero"],
    w: [
      ["Runs it with a higher priority", "Le lance avec une priorité plus haute", "Lo ejecuta con mayor prioridad"],
      ["Limits it to 10 % of the CPU", "Le limite à 10 % du processeur", "Lo limita al 10 % de la CPU"],
      ["Runs it 10 times", "Le lance 10 fois", "Lo ejecuta 10 veces"],
    ],
    e: [
      "Niceness goes from −20 (greedy) to 19 (nicest). Anyone may raise it; lowering it below 0 needs root. `renice` changes a running process.",
      "La gentillesse va de −20 (gourmand) à 19 (le plus gentil). Tout le monde peut l'augmenter ; la baisser sous 0 demande root. `renice` change un processus en cours.",
      "La amabilidad va de −20 (acaparador) a 19 (el más amable). Cualquiera puede subirla; bajarla de 0 requiere root. `renice` cambia un proceso en marcha.",
    ],
  },
  {
    id: "lx-proc-05",
    q: ["`df` says the disk is full, but `du` adds up to much less. A common cause?", "`df` dit que le disque est plein, mais `du` totalise bien moins. Une cause fréquente ?", "`df` dice que el disco está lleno, pero `du` suma mucho menos. ¿Una causa frecuente?"],
    a: ["A deleted file still held open by a process; `lsof +L1` lists them", "Un fichier supprimé encore ouvert par un processus ; `lsof +L1` les liste", "Un archivo borrado que un proceso mantiene abierto; `lsof +L1` los lista"],
    w: [
      ["`du` does not count hidden files", "`du` ne compte pas les fichiers cachés", "`du` no cuenta los archivos ocultos"],
      ["`df` counts in decimal units", "`df` compte en unités décimales", "`df` cuenta en unidades decimales"],
      ["The trash has not been emptied", "La corbeille n'a pas été vidée", "La papelera no se ha vaciado"],
    ],
    e: [
      "The space is freed when the process closes the file: restart it (a log written by a service is a typical case).",
      "L'espace est libéré quand le processus ferme le fichier : le redémarrer (un journal écrit par un service est le cas typique).",
      "El espacio se libera cuando el proceso cierra el archivo: reiniciarlo (un registro que escribe un servicio es el caso típico).",
    ],
  },
  {
    id: "lx-proc-06",
    q: ["Which command finds the process numbers of `python3 backup.py`, matching the whole command line?", "Quelle commande trouve les numéros de processus de `python3 backup.py`, en cherchant dans la ligne de commande entière ?", "¿Qué comando encuentra los números de proceso de `python3 backup.py`, buscando en la línea de órdenes completa?"],
    a: ["`pgrep -f backup.py`", "`pgrep -f backup.py`", "`pgrep -f backup.py`"],
    w: [["`pgrep backup.py`", "`pgrep backup.py`", "`pgrep backup.py`"], ["`pidof backup.py`", "`pidof backup.py`", "`pidof backup.py`"], ["`which backup.py`", "`which backup.py`", "`which backup.py`"]],
    e: [
      "Without `-f`, `pgrep` matches only the process name (`python3`). `pkill -f` sends a signal to the same processes.",
      "Sans `-f`, `pgrep` ne regarde que le nom du processus (`python3`). `pkill -f` envoie un signal aux mêmes processus.",
      "Sin `-f`, `pgrep` solo mira el nombre del proceso (`python3`). `pkill -f` envía una señal a los mismos procesos.",
    ],
  },
];

const signals: LinuxQuestion[] = [
  {
    id: "lx-sig-01",
    q: ["Which signal does `kill 1234` send?", "Quel signal envoie `kill 1234` ?", "¿Qué señal envía `kill 1234`?"],
    a: ["SIGTERM (15): a request to stop, which the program can handle to clean up", "SIGTERM (15) : une demande d'arrêt, que le programme peut traiter pour faire le ménage", "SIGTERM (15): una petición de parada, que el programa puede atender para limpiar"],
    w: [
      ["SIGKILL (9), which stops it at once", "SIGKILL (9), qui l'arrête immédiatement", "SIGKILL (9), que lo detiene al instante"],
      ["SIGINT (2), like Ctrl-C", "SIGINT (2), comme Ctrl-C", "SIGINT (2), como Ctrl-C"],
      ["SIGHUP (1)", "SIGHUP (1)", "SIGHUP (1)"],
    ],
    e: [
      "Try SIGTERM first, and SIGKILL only if the process does not stop: SIGKILL cannot be caught, so no cleanup happens.",
      "Essayer d'abord SIGTERM, et SIGKILL seulement si le processus ne s'arrête pas : SIGKILL ne peut pas être intercepté, il n'y a donc aucun ménage.",
      "Probar primero SIGTERM, y SIGKILL solo si el proceso no se detiene: SIGKILL no se puede capturar, así que no hay limpieza.",
    ],
  },
  {
    id: "lx-sig-02",
    q: ["What does Ctrl-Z do to the program running in the terminal?", "Que fait Ctrl-Z au programme qui tourne dans le terminal ?", "¿Qué hace Ctrl-Z al programa que se ejecuta en el terminal?"],
    a: ["Suspends it (SIGTSTP); `fg` resumes it, `bg` lets it go on in the background", "Le suspend (SIGTSTP) ; `fg` le reprend, `bg` le laisse continuer en arrière-plan", "Lo suspende (SIGTSTP); `fg` lo reanuda, `bg` lo deja seguir en segundo plano"],
    w: [
      ["Kills it", "Le tue", "Lo mata"],
      ["Undoes its last action", "Annule sa dernière action", "Deshace su última acción"],
      ["Sends it end of input", "Lui envoie une fin d'entrée", "Le envía el fin de la entrada"],
    ],
    e: [
      "Ctrl-C sends SIGINT (interrupt), Ctrl-\\ SIGQUIT; Ctrl-D is not a signal but end of input (EOF) on the terminal.",
      "Ctrl-C envoie SIGINT (interruption), Ctrl-\\ SIGQUIT ; Ctrl-D n'est pas un signal mais la fin d'entrée (EOF) du terminal.",
      "Ctrl-C envía SIGINT (interrupción), Ctrl-\\ SIGQUIT; Ctrl-D no es una señal sino el fin de la entrada (EOF) del terminal.",
    ],
  },
  {
    id: "lx-sig-03",
    q: ["What does `kill -0 1234` do?", "Que fait `kill -0 1234` ?", "¿Qué hace `kill -0 1234`?"],
    a: ["Sends nothing, but succeeds only if process 1234 exists and you may signal it", "N'envoie rien, mais ne réussit que si le processus 1234 existe et qu'on a le droit de lui envoyer un signal", "No envía nada, pero solo tiene éxito si el proceso 1234 existe y se le pueden enviar señales"],
    w: [
      ["Kills process 1234 and its children", "Tue le processus 1234 et ses enfants", "Mata el proceso 1234 y sus hijos"],
      ["Kills every process", "Tue tous les processus", "Mata todos los procesos"],
      ["Sends signal 0, which resets the process", "Envoie le signal 0, qui réinitialise le processus", "Envía la señal 0, que reinicia el proceso"],
    ],
    e: [
      "Used in scripts: `kill -0 \"$pid\" 2>/dev/null && echo running`. A negative number targets a process group.",
      "Utile dans les scripts : `kill -0 \"$pid\" 2>/dev/null && echo running`. Un nombre négatif vise un groupe de processus.",
      "Útil en scripts: `kill -0 \"$pid\" 2>/dev/null && echo running`. Un número negativo apunta a un grupo de procesos.",
    ],
  },
  {
    id: "lx-sig-04",
    q: ["What does SIGHUP do to many daemons, such as nginx?", "Que fait SIGHUP à beaucoup de démons, comme nginx ?", "¿Qué hace SIGHUP a muchos demonios, como nginx?"],
    a: ["Makes them reload their configuration", "Leur fait recharger leur configuration", "Les hace recargar su configuración"],
    w: [
      ["Stops them for good", "Les arrête définitivement", "Los detiene para siempre"],
      ["Pauses them", "Les met en pause", "Los pone en pausa"],
      ["Makes them print their status", "Leur fait afficher leur état", "Les hace mostrar su estado"],
    ],
    e: [
      "Its first meaning, the terminal hung up, still applies to programs started from a terminal, which end by default when it closes: hence `nohup`.",
      "Son premier sens, le terminal a raccroché, vaut toujours pour les programmes lancés depuis un terminal, qui s'arrêtent par défaut à sa fermeture : d'où `nohup`.",
      "Su primer sentido, el terminal ha colgado, sigue valiendo para los programas lanzados desde un terminal, que terminan por defecto al cerrarlo: de ahí `nohup`.",
    ],
  },
];

const jobs: LinuxQuestion[] = [
  {
    id: "lx-job-01",
    q: ["You start `./train.sh` over SSH. Which keeps it running after you log out?", "Vous lancez `./train.sh` en SSH. Qu'est-ce qui le garde en vie après la déconnexion ?", "Lanza `./train.sh` por SSH. ¿Qué lo mantiene en marcha después de desconectarse?"],
    a: ["`nohup ./train.sh &` (or running it inside tmux or screen)", "`nohup ./train.sh &` (ou le lancer dans tmux ou screen)", "`nohup ./train.sh &` (o ejecutarlo dentro de tmux o screen)"],
    w: [["`./train.sh &` alone, always", "`./train.sh &` seul, toujours", "`./train.sh &` a secas, siempre"], ["`sudo ./train.sh`", "`sudo ./train.sh`", "`sudo ./train.sh`"], ["`./train.sh; exit`", "`./train.sh; exit`", "`./train.sh; exit`"]],
    e: [
      "`nohup` makes it ignore SIGHUP and writes its output to `nohup.out`. A multiplexer also lets you come back to the session later.",
      "`nohup` lui fait ignorer SIGHUP et écrit sa sortie dans `nohup.out`. Un multiplexeur permet en plus de revenir plus tard à la session.",
      "`nohup` hace que ignore SIGHUP y escribe su salida en `nohup.out`. Un multiplexor permite además volver más tarde a la sesión.",
    ],
  },
  {
    id: "lx-job-02",
    q: ["Which command brings background job 2 back to the foreground?", "Quelle commande ramène la tâche de fond 2 au premier plan ?", "¿Qué orden devuelve la tarea en segundo plano 2 al primer plano?"],
    a: ["`fg %2`", "`fg %2`", "`fg %2`"],
    w: [["`bg %2`", "`bg %2`", "`bg %2`"], ["`kill %2`", "`kill %2`", "`kill %2`"], ["`jobs 2`", "`jobs 2`", "`jobs 2`"]],
    e: [
      "`jobs` lists the shell's jobs with their numbers; `%2` refers to job 2, not process 2.",
      "`jobs` liste les tâches du shell avec leurs numéros ; `%2` désigne la tâche 2, pas le processus 2.",
      "`jobs` lista las tareas del shell con sus números; `%2` se refiere a la tarea 2, no al proceso 2.",
    ],
  },
  {
    id: "lx-job-03",
    q: ["What does `disown` do to a running background job?", "Que fait `disown` à une tâche de fond en cours ?", "¿Qué hace `disown` a una tarea en segundo plano en marcha?"],
    a: ["Removes it from the shell's job list, so the shell does not send it SIGHUP on exit", "La retire de la liste des tâches du shell, qui ne lui enverra pas SIGHUP en se terminant", "La quita de la lista de tareas del shell, que no le enviará SIGHUP al salir"],
    w: [
      ["Kills it", "La tue", "La mata"],
      ["Gives it to another user", "La donne à un autre utilisateur", "Se la da a otro usuario"],
      ["Moves it to the foreground", "La passe au premier plan", "La pasa al primer plano"],
    ],
    e: [
      "It is the after-the-fact `nohup`. Its output still goes to the terminal, which may be gone.",
      "C'est le `nohup` après coup. Sa sortie va toujours vers le terminal, qui peut avoir disparu.",
      "Es el `nohup` a posteriori. Su salida sigue yendo al terminal, que puede haber desaparecido.",
    ],
  },
];

const services: LinuxQuestion[] = [
  {
    id: "lx-svc-01",
    q: ["What does `systemctl enable --now nginx` do?", "Que fait `systemctl enable --now nginx` ?", "¿Qué hace `systemctl enable --now nginx`?"],
    a: ["Starts nginx now and at every boot", "Démarre nginx maintenant et à chaque démarrage", "Arranca nginx ahora y en cada arranque"],
    w: [
      ["Starts it now only", "Le démarre maintenant seulement", "Lo arranca solo ahora"],
      ["Starts it at the next boot only", "Le démarre au prochain démarrage seulement", "Lo arranca solo en el próximo arranque"],
      ["Installs the nginx package", "Installe le paquet nginx", "Instala el paquete nginx"],
    ],
    e: [
      "`enable` adds it to the boot, `start` starts it now; `--now` does both. `disable --now` undoes both.",
      "`enable` l'ajoute au démarrage, `start` le lance maintenant ; `--now` fait les deux. `disable --now` défait les deux.",
      "`enable` lo añade al arranque, `start` lo inicia ahora; `--now` hace las dos cosas. `disable --now` deshace ambas.",
    ],
  },
  {
    id: "lx-svc-02",
    q: ["How do you follow the log of the `nginx` service live?", "Comment suivre en direct le journal du service `nginx` ?", "¿Cómo seguir en directo el registro del servicio `nginx`?"],
    a: ["`journalctl -u nginx -f`", "`journalctl -u nginx -f`", "`journalctl -u nginx -f`"],
    w: [["`systemctl log nginx`", "`systemctl log nginx`", "`systemctl log nginx`"], ["`tail -f /var/log/systemd`", "`tail -f /var/log/systemd`", "`tail -f /var/log/systemd`"], ["`journalctl -f nginx`", "`journalctl -f nginx`", "`journalctl -f nginx`"]],
    e: [
      "`-u` selects a unit, `-f` follows. Also useful: `-b` (this boot), `-p err` (errors and worse), `--since '1 hour ago'`.",
      "`-u` choisit une unité, `-f` suit. Utiles aussi : `-b` (ce démarrage), `-p err` (erreurs et pire), `--since '1 hour ago'`.",
      "`-u` elige una unidad, `-f` sigue. También útiles: `-b` (este arranque), `-p err` (errores y peor), `--since '1 hour ago'`.",
    ],
  },
  {
    id: "lx-svc-03",
    q: ["You edited `/etc/systemd/system/app.service`. What must come before `systemctl restart app`?", "Vous avez modifié `/etc/systemd/system/app.service`. Que faut-il faire avant `systemctl restart app` ?", "Ha editado `/etc/systemd/system/app.service`. ¿Qué hay que hacer antes de `systemctl restart app`?"],
    a: ["`systemctl daemon-reload`, so systemd reads the new unit file", "`systemctl daemon-reload`, pour que systemd relise le fichier d'unité", "`systemctl daemon-reload`, para que systemd vuelva a leer el archivo de unidad"],
    w: [
      ["A reboot", "Un redémarrage", "Un reinicio"],
      ["`systemctl enable app` again", "`systemctl enable app` de nouveau", "`systemctl enable app` otra vez"],
      ["Nothing: `restart` reads it", "Rien : `restart` le relit", "Nada: `restart` lo vuelve a leer"],
    ],
    e: [
      "systemd keeps unit files in memory and warns when they changed on disk. `systemctl edit app` writes an override and reloads by itself.",
      "systemd garde les fichiers d'unité en mémoire et prévient quand ils ont changé sur le disque. `systemctl edit app` écrit une surcharge et recharge tout seul.",
      "systemd guarda los archivos de unidad en memoria y avisa cuando han cambiado en el disco. `systemctl edit app` escribe una modificación y recarga por sí solo.",
    ],
  },
  {
    id: "lx-svc-04",
    q: ["What is the difference between `systemctl reload` and `systemctl restart`?", "Quelle différence entre `systemctl reload` et `systemctl restart` ?", "¿Qué diferencia hay entre `systemctl reload` y `systemctl restart`?"],
    a: ["`reload` asks the running service to reread its configuration; `restart` stops and starts it", "`reload` demande au service en marche de relire sa configuration ; `restart` l'arrête et le relance", "`reload` pide al servicio en marcha que vuelva a leer su configuración; `restart` lo detiene y lo arranca"],
    w: [
      ["None", "Aucune", "Ninguna"],
      ["`reload` reboots the machine", "`reload` redémarre la machine", "`reload` reinicia la máquina"],
      ["`reload` reloads the unit files", "`reload` recharge les fichiers d'unité", "`reload` recarga los archivos de unidad"],
    ],
    e: [
      "`reload` keeps connections open but works only if the service supports it. Unit files are reloaded by `daemon-reload`.",
      "`reload` garde les connexions ouvertes, mais ne marche que si le service le prend en charge. Les fichiers d'unité se rechargent avec `daemon-reload`.",
      "`reload` mantiene abiertas las conexiones, pero solo funciona si el servicio lo admite. Los archivos de unidad se recargan con `daemon-reload`.",
    ],
  },
  {
    id: "lx-svc-05",
    q: ["Which command lists the services that failed?", "Quelle commande liste les services en échec ?", "¿Qué comando lista los servicios que han fallado?"],
    a: ["`systemctl --failed`", "`systemctl --failed`", "`systemctl --failed`"],
    w: [["`systemctl status`", "`systemctl status`", "`systemctl status`"], ["`journalctl --failed`", "`journalctl --failed`", "`journalctl --failed`"], ["`service --status-all`", "`service --status-all`", "`service --status-all`"]],
    e: [
      "Then `systemctl status <unit>` and `journalctl -u <unit>` say why.",
      "Ensuite, `systemctl status <unité>` et `journalctl -u <unité>` disent pourquoi.",
      "Luego `systemctl status <unidad>` y `journalctl -u <unidad>` dicen por qué.",
    ],
  },
];

const scheduling: LinuxQuestion[] = [
  {
    id: "lx-sched-01",
    q: ["A script works in the terminal but fails from cron with 'command not found'. Likely cause?", "Un script marche dans le terminal mais échoue depuis cron avec « command not found ». Cause probable ?", "Un script funciona en el terminal pero falla desde cron con «command not found». ¿Causa probable?"],
    a: ["cron runs it with a minimal environment and a short `PATH`", "cron le lance avec un environnement minimal et un `PATH` réduit", "cron lo ejecuta con un entorno mínimo y un `PATH` reducido"],
    w: [
      ["cron runs scripts as root", "cron lance les scripts en root", "cron ejecuta los scripts como root"],
      ["cron cannot run shell scripts", "cron ne sait pas lancer les scripts shell", "cron no sabe ejecutar scripts de shell"],
      ["The script ran before the network was up", "Le script a tourné avant que le réseau soit prêt", "El script se ejecutó antes de que la red estuviera lista"],
    ],
    e: [
      "Use full paths, or set `PATH=` at the top of the crontab. Your `~/.bashrc` is not read either.",
      "Utiliser des chemins complets, ou définir `PATH=` en tête de la crontab. Votre `~/.bashrc` n'est pas lu non plus.",
      "Usar rutas completas, o definir `PATH=` al principio del crontab. Su `~/.bashrc` tampoco se lee.",
    ],
  },
  {
    id: "lx-sched-02",
    q: ["Why does `0 3 * * * tar czf /backup/$(date +%F).tgz /srv` misbehave in a crontab?", "Pourquoi `0 3 * * * tar czf /backup/$(date +%F).tgz /srv` fonctionne-t-il mal dans une crontab ?", "¿Por qué `0 3 * * * tar czf /backup/$(date +%F).tgz /srv` funciona mal en un crontab?"],
    a: ["In a crontab `%` ends the command (the rest becomes input): write `\\%`", "Dans une crontab, `%` termine la commande (la suite devient l'entrée) : écrire `\\%`", "En un crontab, `%` termina la orden (el resto pasa a ser la entrada): escribir `\\%`"],
    w: [
      ["`$(…)` is not allowed in cron", "`$(…)` n'est pas permis dans cron", "`$(…)` no está permitido en cron"],
      ["3 must be written 03", "3 doit s'écrire 03", "3 debe escribirse 03"],
      ["`tar` cannot run without a terminal", "`tar` ne peut pas tourner sans terminal", "`tar` no puede ejecutarse sin terminal"],
    ],
    e: [
      "A classic trap. Putting the command in a script and calling the script from the crontab avoids it.",
      "Un piège classique. Mettre la commande dans un script et appeler le script depuis la crontab l'évite.",
      "Una trampa clásica. Poner la orden en un script y llamar al script desde el crontab la evita.",
    ],
  },
  {
    id: "lx-sched-03",
    q: ["How do you run a command once, in 10 minutes?", "Comment lancer une commande une seule fois, dans 10 minutes ?", "¿Cómo ejecutar una orden una sola vez, dentro de 10 minutos?"],
    a: ["`echo './report.sh' | at now + 10 minutes`", "`echo './report.sh' | at now + 10 minutes`", "`echo './report.sh' | at now + 10 minutes`"],
    w: [["`crontab -e` with `*/10 * * * *`", "`crontab -e` avec `*/10 * * * *`", "`crontab -e` con `*/10 * * * *`"], ["`sleep 10 && ./report.sh`", "`sleep 10 && ./report.sh`", "`sleep 10 && ./report.sh`"], ["`watch -n 600 ./report.sh`", "`watch -n 600 ./report.sh`", "`watch -n 600 ./report.sh`"]],
    e: [
      "`*/10` would run it every 10 minutes; `sleep 10` waits 10 seconds; `watch` repeats. `atq` lists pending jobs, `atrm` removes one; `atd` must be running.",
      "`*/10` la lancerait toutes les 10 minutes ; `sleep 10` attend 10 secondes ; `watch` répète. `atq` liste les tâches en attente, `atrm` en supprime une ; `atd` doit tourner.",
      "`*/10` la ejecutaría cada 10 minutos; `sleep 10` espera 10 segundos; `watch` repite. `atq` lista las tareas pendientes, `atrm` elimina una; `atd` debe estar en marcha.",
    ],
    install: { apt: "at", dnf: "at" },
  },
  {
    id: "lx-sched-04",
    q: ["Which command lists systemd's timers and when each runs next?", "Quelle commande liste les timers de systemd et leur prochaine exécution ?", "¿Qué comando lista los temporizadores de systemd y cuándo se ejecuta cada uno?"],
    a: ["`systemctl list-timers`", "`systemctl list-timers`", "`systemctl list-timers`"],
    w: [["`crontab -l`", "`crontab -l`", "`crontab -l`"], ["`atq`", "`atq`", "`atq`"], ["`journalctl --timers`", "`journalctl --timers`", "`journalctl --timers`"]],
    e: [
      "A timer unit (`OnCalendar=daily`, `Persistent=true`) starts a service unit: logs in the journal, and runs missed while the machine was off.",
      "Une unité timer (`OnCalendar=daily`, `Persistent=true`) démarre une unité de service : journal intégré, et rattrapage des exécutions manquées pendant que la machine était éteinte.",
      "Una unidad timer (`OnCalendar=daily`, `Persistent=true`) arranca una unidad de servicio: registro en el journal y recuperación de las ejecuciones perdidas con la máquina apagada.",
    ],
  },
];

export const processes = { listing, signals, jobs, services, scheduling };
