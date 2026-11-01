# Linux — l'essentiel du test

## Comment utiliser ce cours

Ce cours accompagne le test Linux. Chaque partie liste les commandes sur lesquelles porte le test, ce qu'elles font et le piège que tendent les mauvaises réponses. Essayez chaque commande dans un terminal : un répertoire jetable dans `/tmp` suffit.

| Niveau | Ce qu'il demande |
|---|---|
| Débutant | Se déplacer, lire des fichiers, les permissions en octal, les premiers tubes |
| Intermédiaire | `grep`, `sed`, les redirections, les processus, les paquets, `ssh`, Git au quotidien |
| Avancé | `awk`, `cron`, `umask`, l'expansion de paramètres, les services, les outils réseau |
| Expert | Les cas limites : signaux et `trap`, descripteurs de fichiers, `rebase`, unités `systemd`, `strace` |

## Partie 1 — Fichiers et permissions

`pwd`, `ls -la`, `cd -` (retour au répertoire précédent), `mkdir -p`, `cp -r`, `mv`, `rm -r`. `find` cherche par nom, type, taille ou date et peut lancer une commande sur chaque résultat.

Les permissions sont trois triplets pour l'utilisateur, le groupe et les autres : `r` = 4, `w` = 2, `x` = 1. Ainsi `rwxr-x---` vaut `750`. Sur un répertoire, `x` permet d'y entrer et `r` d'en lister le contenu. `umask 022` retire l'écriture au groupe et aux autres : les nouveaux fichiers reçoivent `644`, les nouveaux répertoires `755`. Un lien physique est un autre nom pour le même inode ; un lien symbolique pointe vers un chemin et se casse si la cible bouge.

```bash
chmod 750 deploy.sh
find . -name '*.log' -mtime +7 -delete
tar -czf backup.tar.gz notes/
ln -s /srv/app/current app
```

## Partie 2 — Le texte : grep, sed, awk

- `grep -i` ignore la casse, `-v` inverse, `-r` descend dans les répertoires, `-c` compte les lignes, `-E` accepte les expressions régulières étendues.
- `sed 's/old/new/g'` remplace chaque occurrence sur chaque ligne ; sans `g`, seulement la première. `-i` modifie le fichier sur place.
- `awk` découpe chaque ligne en champs `$1`, `$2`… ; `-F` fixe le séparateur et `NR` est le numéro de ligne.
- `sort | uniq -c | sort -rn` compte et classe les lignes ; `cut -d: -f1` prend une colonne ; `wc -l` compte les lignes.

```bash
grep -rn 'TODO' src/
sed -i 's/http:/https:/g' links.txt
awk -F: '$3 >= 1000 { print $1 }' /etc/passwd
cut -d' ' -f1 access.log | sort | uniq -c | sort -rn | head
```

## Partie 3 — Le shell

`>` écrase, `>>` ajoute, `2>` redirige les erreurs, `2>&1` envoie les erreurs là où va la sortie — l'ordre compte : `cmd > out 2>&1` capture les deux, `cmd 2>&1 > out` non. `|` passe la sortie d'une commande à la suivante.

L'expansion a lieu avant l'exécution : `*` pour les motifs, `{a,b}` pour les accolades, `$VAR` pour les variables, `$(cmd)` pour la substitution de commande. Les apostrophes bloquent toute expansion ; les guillemets gardent `$` mais empêchent le découpage en mots. `&&` lance la commande suivante en cas de succès, `||` en cas d'échec. `export` transmet une variable aux processus enfants.

## Partie 4 — Processus et planification

- `ps aux`, `top`, `pgrep` ; `kill` envoie `SIGTERM` (15) par défaut, qu'un programme peut intercepter ; `SIGKILL` (9) ne peut pas l'être.
- `&` lance une tâche en arrière-plan ; `jobs`, `fg`, `bg` ; `Ctrl+Z` suspend ; `nohup` survit à la fin de la session.
- `systemctl start`, `stop`, `enable` (au démarrage), `status` ; `journalctl -u nginx` montre le journal d'une unité.
- Une ligne cron a cinq champs : minute, heure, jour du mois, mois, jour de la semaine.

```bash
# chaque jour ouvrable à 06:30
30 6 * * 1-5 /usr/local/bin/backup.sh
```

## Partie 5 — Le système

`df -h` montre l'espace libre par système de fichiers, `du -sh` la taille d'un répertoire, `lsblk` les disques, `mount` ce qui est monté. `useradd`, `usermod -aG` (ajouter à un groupe sans quitter les autres), `passwd`, `sudo`. Paquets : `apt install` sous Debian et Ubuntu, `dnf install` sous Fedora et RHEL. `uname -r` donne le noyau, `free -h` la mémoire, `uptime` la charge.

## Partie 6 — Le réseau

`ip addr` et `ip route` remplacent `ifconfig` et `route`. `ss -tlnp` liste les ports TCP en écoute. `curl -I` ne récupère que les en-têtes. `dig` et `host` interrogent le DNS. `ssh-keygen` crée une paire de clés, `ssh-copy-id` installe la clé publique sur un serveur, et `scp` ou `rsync -av` copient des fichiers par SSH ; `rsync` n'envoie que ce qui a changé.

## Partie 7 — Les scripts shell

Commencez par `#!/usr/bin/env bash` et, par prudence, `set -euo pipefail`. Les arguments sont `$1`, `$2`…, tous ensemble `"$@"`, leur nombre `$#`, le dernier code de retour `$?`.

```bash
#!/usr/bin/env bash
set -euo pipefail
for file in "$@"; do
  if [[ -f "$file" ]]; then
    echo "${file%.txt}.bak"
  fi
done
```

Expansion de paramètres : `${var:-default}` donne une valeur par défaut, `${var#prefix}` et `${var%suffix}` retirent la plus courte correspondance, `##` et `%%` la plus longue, `${#var}` est la longueur. Tableaux : `arr=(a b c)`, `"${arr[@]}"`, `${#arr[@]}`.

## Partie 8 — Git

`git status`, `add`, `commit`, `log --oneline`. `switch -c` crée une branche, `merge` en fusionne une, `rebase` rejoue les commits sur une autre base et les réécrit — jamais sur une branche que d'autres partagent. Annuler : `restore` jette les changements d'un fichier, `reset --soft HEAD~1` défait un commit mais garde ses changements indexés, `revert` ajoute un commit qui en annule un autre et reste sûr sur un historique partagé. `fetch` télécharge, `pull` télécharge et fusionne, `push` envoie.

## Partie 9 — Vim

Vim a des modes : normal pour les commandes, insertion (`i`, `a`, `o`) pour taper, visuel (`v`) pour sélectionner ; `Esc` revient au mode normal. Se déplacer : `h` `j` `k` `l`, `w` et `b` par mot, `0` et `$` aux bouts de la ligne, `gg` et `G` aux bouts du fichier. Éditer : `dd` supprime une ligne, `yy` la copie, `p` colle, `u` annule, `.` répète. Cherchez avec `/`, puis `n` ; remplacez avec `:%s/old/new/g`. Enregistrez avec `:w`, quittez avec `:q`, et quittez sans enregistrer avec `:q!`.

## Partie 10 — Les outils

`less` fait défiler un fichier (`/` cherche, `q` quitte), `tail -f` suit un journal qui grandit, `watch` relance une commande. `jq` lit le JSON : `jq '.items[].name'`. `htop` et `vmstat` montrent la charge, `lsof` les fichiers ouverts, `strace` les appels système d'un processus. `tmux` garde une session en vie après la déconnexion. `xargs` transforme des lignes en arguments : `find . -name '*.tmp' | xargs rm`.

## Sources

| Thème | Référence gratuite |
|---|---|
| Commandes et options | [Le projet Linux man-pages](https://man7.org/linux/man-pages/) |
| Le shell et les scripts | [Manuel de GNU Bash](https://www.gnu.org/software/bash/manual/) |
| La ligne de commande depuis le début | [The Linux Command Line, William Shotts](https://linuxcommand.org/tlcl.php) |
| Git | [Pro Git](https://git-scm.com/book/en/v2) |
| Vim | [Documentation de Vim](https://vimhelp.org/) |
