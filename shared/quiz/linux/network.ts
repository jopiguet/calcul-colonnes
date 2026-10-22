/** Linux, the network: interfaces and ports, transfers, SSH, names. */
import type { LinuxQuestion } from "./types";

const interfaces: LinuxQuestion[] = [
  {
    id: "lx-net-01",
    q: ["`ifconfig` is missing on a recent distribution. Which command shows the IP addresses instead?", "`ifconfig` manque sur une distribution récente. Quelle commande montre les adresses IP à la place ?", "`ifconfig` no está en una distribución reciente. ¿Qué comando muestra las direcciones IP en su lugar?"],
    a: ["`ip addr` (or `ip a`)", "`ip addr` (ou `ip a`)", "`ip addr` (o `ip a`)"],
    w: [["`ip route`", "`ip route`", "`ip route`"], ["`hostname -f`", "`hostname -f`", "`hostname -f`"], ["`ping localhost`", "`ping localhost`", "`ping localhost`"]],
    e: [
      "`ifconfig` belongs to the old `net-tools` package. `ip route` shows the routes (the default gateway); `ip -br a` gives a one-line summary per interface.",
      "`ifconfig` fait partie de l'ancien paquet `net-tools`. `ip route` montre les routes (la passerelle par défaut) ; `ip -br a` donne un résumé d'une ligne par interface.",
      "`ifconfig` pertenece al antiguo paquete `net-tools`. `ip route` muestra las rutas (la pasarela por defecto); `ip -br a` da un resumen de una línea por interfaz.",
    ],
  },
  {
    id: "lx-net-02",
    q: ["Which command shows which program listens on TCP port 443?", "Quelle commande montre quel programme écoute sur le port TCP 443 ?", "¿Qué comando muestra qué programa escucha en el puerto TCP 443?"],
    a: ["`sudo ss -tlnp`", "`sudo ss -tlnp`", "`sudo ss -tlnp`"],
    w: [["`ip addr show 443`", "`ip addr show 443`", "`ip addr show 443`"], ["`ping -p 443 localhost`", "`ping -p 443 localhost`", "`ping -p 443 localhost`"], ["`ss -u`", "`ss -u`", "`ss -u`"]],
    e: [
      "`t` TCP, `l` listening, `n` numeric, `p` process (other users' processes need root). `netstat -tlnp` is the old equivalent, from `net-tools`.",
      "`t` TCP, `l` en écoute, `n` numérique, `p` processus (ceux des autres utilisateurs demandent root). `netstat -tlnp` est l'ancien équivalent, de `net-tools`.",
      "`t` TCP, `l` a la escucha, `n` numérico, `p` proceso (los de otros usuarios requieren root). `netstat -tlnp` es el equivalente antiguo, de `net-tools`.",
    ],
  },
  {
    id: "lx-net-03",
    q: ["A server answers web requests but not `ping`. Is it down?", "Un serveur répond aux requêtes web mais pas à `ping`. Est-il en panne ?", "Un servidor responde a las peticiones web pero no a `ping`. ¿Está caído?"],
    a: ["No: ICMP is often blocked by a firewall; test the service itself", "Non : l'ICMP est souvent bloqué par un pare-feu ; tester le service lui-même", "No: el ICMP suele estar bloqueado por un cortafuegos; probar el propio servicio"],
    w: [
      ["Yes: a server that does not answer ping is down", "Oui : un serveur qui ne répond pas au ping est en panne", "Sí: un servidor que no responde al ping está caído"],
      ["Its DNS name is wrong", "Son nom DNS est faux", "Su nombre DNS es incorrecto"],
      ["Its network card is half broken", "Sa carte réseau est à moitié en panne", "Su tarjeta de red está medio rota"],
    ],
    e: [
      "`ping` uses ICMP, not TCP. `curl -I https://host` or `nc -zv host 443` test the port that matters.",
      "`ping` utilise l'ICMP, pas le TCP. `curl -I https://host` ou `nc -zv host 443` testent le port qui compte.",
      "`ping` usa ICMP, no TCP. `curl -I https://host` o `nc -zv host 443` prueban el puerto que importa.",
    ],
  },
  {
    id: "lx-net-04",
    q: ["What does `nc -zv db.local 5432` tell you?", "Que vous apprend `nc -zv db.local 5432` ?", "¿Qué le dice `nc -zv db.local 5432`?"],
    a: ["Whether a TCP connection to port 5432 can be opened, without sending data", "Si une connexion TCP au port 5432 peut s'ouvrir, sans envoyer de données", "Si se puede abrir una conexión TCP al puerto 5432, sin enviar datos"],
    w: [
      ["The PostgreSQL version", "La version de PostgreSQL", "La versión de PostgreSQL"],
      ["The route to the server", "La route vers le serveur", "La ruta hasta el servidor"],
      ["The bandwidth to the server", "Le débit vers le serveur", "El ancho de banda hasta el servidor"],
    ],
    e: [
      "`-z` connects and closes, `-v` says how it went. It separates 'nothing listens' or 'a firewall drops' from a problem in the application.",
      "`-z` se connecte et referme, `-v` dit comment ça s'est passé. On sépare ainsi « rien n'écoute » ou « un pare-feu bloque » d'un problème dans l'application.",
      "`-z` conecta y cierra, `-v` dice cómo fue. Así se distingue «nada escucha» o «un cortafuegos bloquea» de un problema de la aplicación.",
    ],
    install: { apt: "netcat-openbsd", dnf: "nmap-ncat" },
  },
  {
    id: "lx-net-05",
    q: ["Which command shows the default gateway?", "Quelle commande montre la passerelle par défaut ?", "¿Qué comando muestra la pasarela por defecto?"],
    a: ["`ip route`", "`ip route`", "`ip route`"],
    w: [["`ip link`", "`ip link`", "`ip link`"], ["`ss -r`", "`ss -r`", "`ss -r`"], ["`cat /etc/hosts`", "`cat /etc/hosts`", "`cat /etc/hosts`"]],
    e: [
      "The line `default via 192.168.1.1 dev …` is the gateway. `ip link` lists interfaces and their state.",
      "La ligne `default via 192.168.1.1 dev …` est la passerelle. `ip link` liste les interfaces et leur état.",
      "La línea `default via 192.168.1.1 dev …` es la pasarela. `ip link` lista las interfaces y su estado.",
    ],
  },
];

const transfer: LinuxQuestion[] = [
  {
    id: "lx-xfer-01",
    q: ["`curl https://example.org/file.zip` fills the terminal with garbage. What saves it under its own name?", "`curl https://example.org/file.zip` remplit le terminal de caractères illisibles. Qu'est-ce qui l'enregistre sous son propre nom ?", "`curl https://example.org/file.zip` llena el terminal de caracteres ilegibles. ¿Qué lo guarda con su propio nombre?"],
    a: ["`curl -O https://example.org/file.zip`", "`curl -O https://example.org/file.zip`", "`curl -O https://example.org/file.zip`"],
    w: [["`curl -o https://example.org/file.zip`", "`curl -o https://example.org/file.zip`", "`curl -o https://example.org/file.zip`"], ["`curl -s https://example.org/file.zip`", "`curl -s https://example.org/file.zip`", "`curl -s https://example.org/file.zip`"], ["`curl -I https://example.org/file.zip`", "`curl -I https://example.org/file.zip`", "`curl -I https://example.org/file.zip`"]],
    e: [
      "`curl` writes to standard output. `-O` uses the remote name; `-o name` takes a name of your choice. `-s` silences the progress, `-I` asks for the headers only.",
      "`curl` écrit sur la sortie standard. `-O` reprend le nom distant ; `-o nom` prend un nom choisi. `-s` fait taire la progression, `-I` ne demande que les en-têtes.",
      "`curl` escribe en la salida estándar. `-O` usa el nombre remoto; `-o nombre` toma uno elegido. `-s` silencia el progreso, `-I` solo pide las cabeceras.",
    ],
  },
  {
    id: "lx-xfer-02",
    q: ["`curl` returns a short '301 Moved Permanently' page and nothing else. What fixes it?", "`curl` renvoie une courte page « 301 Moved Permanently » et rien d'autre. Qu'est-ce qui règle le problème ?", "`curl` devuelve una breve página «301 Moved Permanently» y nada más. ¿Qué lo arregla?"],
    a: ["`-L`, to follow redirections", "`-L`, pour suivre les redirections", "`-L`, para seguir las redirecciones"],
    w: [["`-k`, to ignore the certificate", "`-k`, pour ignorer le certificat", "`-k`, para ignorar el certificado"], ["`-X GET`", "`-X GET`", "`-X GET`"], ["`--retry 3`", "`--retry 3`", "`--retry 3`"]],
    e: [
      "Without `-L`, curl shows the redirection itself. `-k` turns off certificate checks: avoid it outside tests.",
      "Sans `-L`, curl montre la redirection elle-même. `-k` désactive la vérification du certificat : à éviter hors des tests.",
      "Sin `-L`, curl muestra la propia redirección. `-k` desactiva la comprobación del certificado: evitarlo fuera de las pruebas.",
    ],
  },
  {
    id: "lx-xfer-03",
    q: ["What is the difference between `rsync -a photos/ backup/` and `rsync -a photos backup/`?", "Quelle différence entre `rsync -a photos/ backup/` et `rsync -a photos backup/` ?", "¿Qué diferencia hay entre `rsync -a photos/ backup/` y `rsync -a photos backup/`?"],
    a: ["With the slash, the content of `photos` goes into `backup/`; without it, `backup/photos/` is created", "Avec la barre, le contenu de `photos` va dans `backup/` ; sans elle, `backup/photos/` est créé", "Con la barra, el contenido de `photos` va a `backup/`; sin ella, se crea `backup/photos/`"],
    w: [
      ["None", "Aucune", "Ninguna"],
      ["Without the slash, only files are copied, not subdirectories", "Sans la barre, seuls les fichiers sont copiés, pas les sous-répertoires", "Sin la barra, solo se copian los archivos, no los subdirectorios"],
      ["With the slash, `backup/` is emptied first", "Avec la barre, `backup/` est d'abord vidé", "Con la barra, `backup/` se vacía primero"],
    ],
    e: [
      "Only the trailing slash of the source matters. To make the copy an exact mirror, `--delete` removes extra files from the destination: try `--dry-run` first.",
      "Seule la barre finale de la source compte. Pour un miroir exact, `--delete` retire de la destination les fichiers en trop : essayer d'abord `--dry-run`.",
      "Solo importa la barra final del origen. Para un espejo exacto, `--delete` quita del destino los archivos sobrantes: probar antes con `--dry-run`.",
    ],
  },
  {
    id: "lx-xfer-04",
    q: ["Why prefer `rsync` to `scp` to copy a large directory again after a few changes?", "Pourquoi préférer `rsync` à `scp` pour recopier un gros répertoire après quelques modifications ?", "¿Por qué preferir `rsync` a `scp` para volver a copiar un directorio grande tras unos cambios?"],
    a: ["It sends only what changed, and can resume an interrupted copy", "Il n'envoie que ce qui a changé, et peut reprendre une copie interrompue", "Solo envía lo que ha cambiado y puede reanudar una copia interrumpida"],
    w: [
      ["It encrypts, while `scp` does not", "Il chiffre, alors que `scp` non", "Cifra, mientras que `scp` no"],
      ["It does not need SSH", "Il n'a pas besoin de SSH", "No necesita SSH"],
      ["It compresses the files on the destination", "Il compresse les fichiers à destination", "Comprime los archivos en el destino"],
    ],
    e: [
      "Both go over SSH and are encrypted. `-z` compresses during the transfer only; `--partial --progress` (or `-P`) keeps partial files.",
      "Les deux passent par SSH et sont chiffrés. `-z` compresse pendant le transfert seulement ; `--partial --progress` (ou `-P`) garde les fichiers partiels.",
      "Ambos van por SSH y están cifrados. `-z` comprime solo durante la transferencia; `--partial --progress` (o `-P`) conserva los archivos parciales.",
    ],
  },
  {
    id: "lx-xfer-05",
    q: ["A large `wget` download stopped halfway. How do you continue it?", "Un gros téléchargement `wget` s'est arrêté à mi-chemin. Comment le reprendre ?", "Una descarga grande con `wget` se detuvo a medias. ¿Cómo reanudarla?"],
    a: ["`wget -c` with the same address", "`wget -c` avec la même adresse", "`wget -c` con la misma dirección"],
    w: [["`wget -r`", "`wget -r`", "`wget -r`"], ["`wget -N`", "`wget -N`", "`wget -N`"], ["It cannot be continued", "On ne peut pas le reprendre", "No se puede reanudar"]],
    e: [
      "`-c` continues a partial file if the server supports ranges. `-r` downloads recursively, `-N` only if newer. curl's equivalent is `curl -C - -O`.",
      "`-c` reprend un fichier partiel si le serveur accepte les plages. `-r` télécharge récursivement, `-N` seulement si plus récent. L'équivalent avec curl est `curl -C - -O`.",
      "`-c` continúa un archivo parcial si el servidor admite rangos. `-r` descarga recursivamente, `-N` solo si es más nuevo. El equivalente con curl es `curl -C - -O`.",
    ],
  },
];

const ssh: LinuxQuestion[] = [
  {
    id: "lx-ssh-01",
    q: ["How do you install your public key on a server, to log in without a password?", "Comment installer votre clé publique sur un serveur, pour vous connecter sans mot de passe ?", "¿Cómo instalar su clave pública en un servidor, para entrar sin contraseña?"],
    a: ["`ssh-copy-id user@server`, after `ssh-keygen -t ed25519` if you have no key", "`ssh-copy-id user@server`, après `ssh-keygen -t ed25519` si vous n'avez pas de clé", "`ssh-copy-id user@server`, tras `ssh-keygen -t ed25519` si no tiene clave"],
    w: [
      ["Copy `~/.ssh/id_ed25519` to the server", "Copier `~/.ssh/id_ed25519` sur le serveur", "Copiar `~/.ssh/id_ed25519` al servidor"],
      ["`ssh -k user@server`", "`ssh -k user@server`", "`ssh -k user@server`"],
      ["Add the server to `~/.ssh/known_hosts`", "Ajouter le serveur à `~/.ssh/known_hosts`", "Añadir el servidor a `~/.ssh/known_hosts`"],
    ],
    e: [
      "It appends `~/.ssh/id_ed25519.pub` to the server's `~/.ssh/authorized_keys`. The private key, without `.pub`, never leaves your machine.",
      "Il ajoute `~/.ssh/id_ed25519.pub` au `~/.ssh/authorized_keys` du serveur. La clé privée, sans `.pub`, ne quitte jamais votre machine.",
      "Añade `~/.ssh/id_ed25519.pub` al `~/.ssh/authorized_keys` del servidor. La clave privada, sin `.pub`, nunca sale de su máquina.",
    ],
  },
  {
    id: "lx-ssh-02",
    q: ["ssh refuses a key with 'UNPROTECTED PRIVATE KEY FILE'. What fixes it?", "ssh refuse une clé avec « UNPROTECTED PRIVATE KEY FILE ». Qu'est-ce qui règle cela ?", "ssh rechaza una clave con «UNPROTECTED PRIVATE KEY FILE». ¿Qué lo arregla?"],
    a: ["`chmod 600 ~/.ssh/id_ed25519`: other users must not be able to read it", "`chmod 600 ~/.ssh/id_ed25519` : les autres utilisateurs ne doivent pas pouvoir la lire", "`chmod 600 ~/.ssh/id_ed25519`: los demás usuarios no deben poder leerla"],
    w: [["`chmod 644 ~/.ssh/id_ed25519`", "`chmod 644 ~/.ssh/id_ed25519`", "`chmod 644 ~/.ssh/id_ed25519`"], ["`ssh-keygen` again with a longer key", "Relancer `ssh-keygen` avec une clé plus longue", "Volver a ejecutar `ssh-keygen` con una clave más larga"], ["`sudo ssh`", "`sudo ssh`", "`sudo ssh`"]],
    e: [
      "Typical after copying keys from another machine or a USB stick. `~/.ssh` itself should be `700`.",
      "Fréquent après avoir copié des clés depuis une autre machine ou une clé USB. `~/.ssh` lui-même devrait être en `700`.",
      "Habitual tras copiar claves desde otra máquina o una memoria USB. El propio `~/.ssh` debería estar en `700`.",
    ],
  },
  {
    id: "lx-ssh-03",
    q: ["What does `ssh -L 5433:localhost:5432 db-server` do?", "Que fait `ssh -L 5433:localhost:5432 db-server` ?", "¿Qué hace `ssh -L 5433:localhost:5432 db-server`?"],
    a: ["Port 5433 on your machine leads, through SSH, to port 5432 of `db-server` as seen from itself", "Le port 5433 de votre machine mène, par SSH, au port 5432 de `db-server` vu depuis lui-même", "El puerto 5433 de su máquina lleva, por SSH, al puerto 5432 de `db-server` visto desde él mismo"],
    w: [
      ["It opens port 5432 of `db-server` to the internet", "Il ouvre le port 5432 de `db-server` à Internet", "Abre el puerto 5432 de `db-server` a Internet"],
      ["It copies the database to port 5433", "Il copie la base de données sur le port 5433", "Copia la base de datos al puerto 5433"],
      ["It forwards your port 5432 to the server's 5433", "Il renvoie votre port 5432 vers le 5433 du serveur", "Redirige su puerto 5432 al 5433 del servidor"],
    ],
    e: [
      "`localhost` is read on the server, so a database listening only locally becomes reachable as `localhost:5433` on your side. `-R` forwards the other way.",
      "`localhost` est interprété sur le serveur : une base qui n'écoute qu'en local devient joignable en `localhost:5433` chez vous. `-R` fait le renvoi dans l'autre sens.",
      "`localhost` se interpreta en el servidor: una base que solo escucha en local pasa a ser accesible como `localhost:5433` en su lado. `-R` redirige en sentido contrario.",
    ],
  },
  {
    id: "lx-ssh-04",
    q: ["ssh warns 'REMOTE HOST IDENTIFICATION HAS CHANGED'. What does it mean?", "ssh avertit « REMOTE HOST IDENTIFICATION HAS CHANGED ». Qu'est-ce que cela veut dire ?", "ssh avisa «REMOTE HOST IDENTIFICATION HAS CHANGED». ¿Qué significa?"],
    a: ["The server's host key differs from the one remembered: a reinstall, or someone in the middle", "La clé d'hôte du serveur diffère de celle mémorisée : une réinstallation, ou quelqu'un au milieu", "La clave de host del servidor difiere de la recordada: una reinstalación, o alguien en medio"],
    w: [
      ["Your own key has expired", "Votre propre clé a expiré", "Su propia clave ha caducado"],
      ["The server changed its IP address", "Le serveur a changé d'adresse IP", "El servidor cambió de dirección IP"],
      ["The password was changed", "Le mot de passe a été changé", "Se cambió la contraseña"],
    ],
    e: [
      "Check the new fingerprint by another channel; then `ssh-keygen -R server` forgets the old key in `~/.ssh/known_hosts`.",
      "Vérifier la nouvelle empreinte par un autre moyen ; puis `ssh-keygen -R server` oublie l'ancienne clé dans `~/.ssh/known_hosts`.",
      "Comprobar la nueva huella por otro medio; luego `ssh-keygen -R server` olvida la clave antigua en `~/.ssh/known_hosts`.",
    ],
  },
  {
    id: "lx-ssh-05",
    q: ["How do you reach `app` through the gateway `bastion` in one command?", "Comment atteindre `app` à travers la passerelle `bastion` en une seule commande ?", "¿Cómo llegar a `app` a través de la pasarela `bastion` con una sola orden?"],
    a: ["`ssh -J bastion app`", "`ssh -J bastion app`", "`ssh -J bastion app`"],
    w: [["`ssh bastion app`", "`ssh bastion app`", "`ssh bastion app`"], ["`ssh -L bastion app`", "`ssh -L bastion app`", "`ssh -L bastion app`"], ["`ssh app@bastion`", "`ssh app@bastion`", "`ssh app@bastion`"]],
    e: [
      "`-J` (ProxyJump) opens the connection to `app` through `bastion`, end to end encrypted. `ssh bastion app` would run a command named `app` on the bastion. In `~/.ssh/config`: `ProxyJump bastion`.",
      "`-J` (ProxyJump) ouvre la connexion vers `app` à travers `bastion`, chiffrée de bout en bout. `ssh bastion app` lancerait une commande nommée `app` sur le bastion. Dans `~/.ssh/config` : `ProxyJump bastion`.",
      "`-J` (ProxyJump) abre la conexión a `app` a través de `bastion`, cifrada de extremo a extremo. `ssh bastion app` ejecutaría una orden llamada `app` en el bastión. En `~/.ssh/config`: `ProxyJump bastion`.",
    ],
  },
];

const dns: LinuxQuestion[] = [
  {
    id: "lx-dns-01",
    q: ["Which command prints just the IP address of a name, from the DNS?", "Quelle commande affiche juste l'adresse IP d'un nom, d'après le DNS ?", "¿Qué comando muestra solo la dirección IP de un nombre, según el DNS?"],
    a: ["`dig +short example.org`", "`dig +short example.org`", "`dig +short example.org`"],
    w: [["`ping -q example.org`", "`ping -q example.org`", "`ping -q example.org`"], ["`ip addr example.org`", "`ip addr example.org`", "`ip addr example.org`"], ["`hostname example.org`", "`hostname example.org`", "`hostname example.org`"]],
    e: [
      "`dig MX example.org` gives the mail servers, `dig @1.1.1.1 …` asks a given server. `hostname example.org` would rename your machine, as root.",
      "`dig MX example.org` donne les serveurs de courrier, `dig @1.1.1.1 …` interroge un serveur choisi. `hostname example.org` renommerait votre machine, en root.",
      "`dig MX example.org` da los servidores de correo, `dig @1.1.1.1 …` pregunta a un servidor elegido. `hostname example.org` cambiaría el nombre de su máquina, como root.",
    ],
    install: { apt: "dnsutils", dnf: "bind-utils", brew: "bind" },
  },
  {
    id: "lx-dns-02",
    q: ["A name is set in `/etc/hosts`. Why can `dig` and `ping` disagree about it?", "Un nom est défini dans `/etc/hosts`. Pourquoi `dig` et `ping` peuvent-ils ne pas être d'accord à son sujet ?", "Un nombre está definido en `/etc/hosts`. ¿Por qué pueden no coincidir `dig` y `ping` sobre él?"],
    a: ["`dig` asks the DNS directly; programs such as `ping` go through the system's resolver, which reads `/etc/hosts` first", "`dig` interroge directement le DNS ; les programmes comme `ping` passent par le résolveur du système, qui lit d'abord `/etc/hosts`", "`dig` pregunta directamente al DNS; programas como `ping` pasan por el resolutor del sistema, que lee primero `/etc/hosts`"],
    w: [
      ["`/etc/hosts` is only read at boot", "`/etc/hosts` n'est lu qu'au démarrage", "`/etc/hosts` solo se lee al arrancar"],
      ["`ping` ignores `/etc/hosts`", "`ping` ignore `/etc/hosts`", "`ping` ignora `/etc/hosts`"],
      ["They always agree", "Ils sont toujours d'accord", "Siempre coinciden"],
    ],
    e: [
      "`getent hosts name` answers the way programs do. The order of sources is set in `/etc/nsswitch.conf`.",
      "`getent hosts nom` répond comme les programmes. L'ordre des sources est réglé dans `/etc/nsswitch.conf`.",
      "`getent hosts nombre` responde como los programas. El orden de las fuentes se ajusta en `/etc/nsswitch.conf`.",
    ],
  },
  {
    id: "lx-dns-03",
    q: ["`/etc/resolv.conf` says `nameserver 127.0.0.53`. Where do you see the real DNS servers?", "`/etc/resolv.conf` indique `nameserver 127.0.0.53`. Où voir les vrais serveurs DNS ?", "`/etc/resolv.conf` indica `nameserver 127.0.0.53`. ¿Dónde ver los servidores DNS reales?"],
    a: ["`resolvectl status`: 127.0.0.53 is systemd-resolved's local stub", "`resolvectl status` : 127.0.0.53 est le relais local de systemd-resolved", "`resolvectl status`: 127.0.0.53 es el reenviador local de systemd-resolved"],
    w: [
      ["Nowhere: the machine is its own DNS server", "Nulle part : la machine est son propre serveur DNS", "En ningún sitio: la máquina es su propio servidor DNS"],
      ["In `/etc/hosts`", "Dans `/etc/hosts`", "En `/etc/hosts`"],
      ["With `ip route`", "Avec `ip route`", "Con `ip route`"],
    ],
    e: [
      "systemd-resolved caches answers and forwards questions to the servers received from DHCP or set per interface.",
      "systemd-resolved garde les réponses en cache et transmet les questions aux serveurs reçus par DHCP ou réglés par interface.",
      "systemd-resolved guarda las respuestas en caché y reenvía las preguntas a los servidores recibidos por DHCP o fijados por interfaz.",
    ],
  },
];

export const network = { interfaces, transfer, ssh, dns };
