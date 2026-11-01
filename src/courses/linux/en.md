# Linux — the essentials of the test

## How to use this course

This course goes with the Linux test. Each part lists the commands the test asks about, what they do and the trap the wrong options set. Try every command in a terminal: a throwaway directory in `/tmp` is enough.

| Level | What it asks |
|---|---|
| Beginner | Moving around, reading files, permissions in octal, the first pipes |
| Intermediate | `grep`, `sed`, redirections, processes, packages, `ssh`, everyday Git |
| Advanced | `awk`, `cron`, `umask`, parameter expansion, services, networking tools |
| Expert | The edge cases: signals and `trap`, file descriptors, `rebase`, `systemd` units, `strace` |

## Part 1 — Files and permissions

`pwd`, `ls -la`, `cd -` (back to the previous directory), `mkdir -p`, `cp -r`, `mv`, `rm -r`. `find` searches by name, type, size or date and can run a command on each result.

Permissions are three triplets for user, group and others: `r` = 4, `w` = 2, `x` = 1. So `rwxr-x---` is `750`. On a directory, `x` lets you enter it and `r` lets you list it. `umask 022` removes write for group and others: new files get `644`, new directories `755`. A hard link is another name for the same inode; a symbolic link points to a path and breaks if the target moves.

```bash
chmod 750 deploy.sh
find . -name '*.log' -mtime +7 -delete
tar -czf backup.tar.gz notes/
ln -s /srv/app/current app
```

## Part 2 — Text: grep, sed, awk

- `grep -i` ignores case, `-v` inverts, `-r` recurses, `-c` counts lines, `-E` takes extended regular expressions.
- `sed 's/old/new/g'` replaces every match on each line; without `g`, only the first. `-i` edits the file in place.
- `awk` splits each line into fields `$1`, `$2`…; `-F` sets the separator and `NR` is the line number.
- `sort | uniq -c | sort -rn` counts and ranks lines; `cut -d: -f1` takes one column; `wc -l` counts lines.

```bash
grep -rn 'TODO' src/
sed -i 's/http:/https:/g' links.txt
awk -F: '$3 >= 1000 { print $1 }' /etc/passwd
cut -d' ' -f1 access.log | sort | uniq -c | sort -rn | head
```

## Part 3 — The shell

`>` overwrites, `>>` appends, `2>` redirects errors, `2>&1` sends errors where output goes — order matters: `cmd > out 2>&1` captures both, `cmd 2>&1 > out` does not. `|` feeds the output of one command to the next.

Expansion happens before the command runs: `*` globs, `{a,b}` braces, `$VAR` variables, `$(cmd)` command substitution. Single quotes stop all expansion; double quotes keep `$` but stop word splitting. `&&` runs the next command on success, `||` on failure. `export` passes a variable to child processes.

## Part 4 — Processes and scheduling

- `ps aux`, `top`, `pgrep`; `kill` sends `SIGTERM` (15) by default, which a program can catch; `SIGKILL` (9) cannot be caught.
- `&` starts a job in the background; `jobs`, `fg`, `bg`; `Ctrl+Z` suspends; `nohup` survives the end of the session.
- `systemctl start`, `stop`, `enable` (at boot), `status`; `journalctl -u nginx` shows a unit's log.
- A cron line has five fields: minute, hour, day of month, month, day of week.

```bash
# every weekday at 06:30
30 6 * * 1-5 /usr/local/bin/backup.sh
```

## Part 5 — The system

`df -h` shows free space per filesystem, `du -sh` the size of a directory, `lsblk` the disks, `mount` what is mounted. `useradd`, `usermod -aG` (add to a group without leaving the others), `passwd`, `sudo`. Packages: `apt install` on Debian and Ubuntu, `dnf install` on Fedora and RHEL. `uname -r` gives the kernel, `free -h` the memory, `uptime` the load.

## Part 6 — The network

`ip addr` and `ip route` replace `ifconfig` and `route`. `ss -tlnp` lists listening TCP ports. `curl -I` fetches only the headers. `dig` and `host` query DNS. `ssh-keygen` makes a key pair, `ssh-copy-id` installs the public key on a server, and `scp` or `rsync -av` copy files over SSH; `rsync` only sends what changed.

## Part 7 — Shell scripts

Start with `#!/usr/bin/env bash` and, for safety, `set -euo pipefail`. Arguments are `$1`, `$2`…, all of them `"$@"`, their number `$#`, the last exit status `$?`.

```bash
#!/usr/bin/env bash
set -euo pipefail
for file in "$@"; do
  if [[ -f "$file" ]]; then
    echo "${file%.txt}.bak"
  fi
done
```

Parameter expansion: `${var:-default}` gives a default, `${var#prefix}` and `${var%suffix}` remove the shortest match, `##` and `%%` the longest, `${#var}` is the length. Arrays: `arr=(a b c)`, `"${arr[@]}"`, `${#arr[@]}`.

## Part 8 — Git

`git status`, `add`, `commit`, `log --oneline`. `switch -c` creates a branch, `merge` joins one, `rebase` replays commits on another base and rewrites them — never on a branch others share. Undo: `restore` throws away changes in a file, `reset --soft HEAD~1` undoes a commit but keeps its changes staged, `revert` adds a commit that cancels another and is safe on shared history. `fetch` downloads, `pull` downloads and merges, `push` uploads.

## Part 9 — Vim

Vim has modes: normal for commands, insert (`i`, `a`, `o`) for typing, visual (`v`) for selecting; `Esc` returns to normal mode. Moving: `h` `j` `k` `l`, `w` and `b` by word, `0` and `$` to the line ends, `gg` and `G` to the file ends. Editing: `dd` deletes a line, `yy` copies it, `p` pastes, `u` undoes, `.` repeats. Search with `/`, then `n`; replace with `:%s/old/new/g`. Save with `:w`, quit with `:q`, and quit without saving with `:q!`.

## Part 10 — Tools

`less` pages through a file (`/` searches, `q` quits), `tail -f` follows a growing log, `watch` reruns a command. `jq` reads JSON: `jq '.items[].name'`. `htop` and `vmstat` show load, `lsof` the open files, `strace` the system calls of a process. `tmux` keeps a session alive after you disconnect. `xargs` turns lines into arguments: `find . -name '*.tmp' | xargs rm`.

## Sources

| Topic | Free reference |
|---|---|
| Commands and options | [The Linux man-pages project](https://man7.org/linux/man-pages/) |
| The shell and scripts | [GNU Bash manual](https://www.gnu.org/software/bash/manual/) |
| The command line from the start | [The Linux Command Line, William Shotts](https://linuxcommand.org/tlcl.php) |
| Git | [Pro Git](https://git-scm.com/book/en/v2) |
| Vim | [Vim documentation](https://vimhelp.org/) |
