# Linux — lo esencial del test

## Cómo usar este curso

Este curso acompaña al test de Linux. Cada parte lista los comandos sobre los que pregunta el test, lo que hacen y la trampa que tienden las opciones erróneas. Pruebe cada comando en un terminal: basta un directorio desechable en `/tmp`.

| Nivel | Lo que pide |
|---|---|
| Principiante | Moverse, leer archivos, los permisos en octal, las primeras tuberías |
| Intermedio | `grep`, `sed`, las redirecciones, los procesos, los paquetes, `ssh`, Git a diario |
| Avanzado | `awk`, `cron`, `umask`, la expansión de parámetros, los servicios, las herramientas de red |
| Experto | Los casos límite: señales y `trap`, descriptores de archivo, `rebase`, unidades `systemd`, `strace` |

## Parte 1 — Archivos y permisos

`pwd`, `ls -la`, `cd -` (vuelve al directorio anterior), `mkdir -p`, `cp -r`, `mv`, `rm -r`. `find` busca por nombre, tipo, tamaño o fecha y puede ejecutar un comando sobre cada resultado.

Los permisos son tres tríos para el usuario, el grupo y los demás: `r` = 4, `w` = 2, `x` = 1. Así `rwxr-x---` es `750`. En un directorio, `x` permite entrar y `r` listar su contenido. `umask 022` quita la escritura al grupo y a los demás: los archivos nuevos reciben `644`, los directorios nuevos `755`. Un enlace duro es otro nombre para el mismo inodo; un enlace simbólico apunta a una ruta y se rompe si el destino se mueve.

```bash
chmod 750 deploy.sh
find . -name '*.log' -mtime +7 -delete
tar -czf backup.tar.gz notes/
ln -s /srv/app/current app
```

## Parte 2 — El texto: grep, sed, awk

- `grep -i` ignora mayúsculas, `-v` invierte, `-r` recorre directorios, `-c` cuenta líneas, `-E` admite expresiones regulares extendidas.
- `sed 's/old/new/g'` sustituye cada coincidencia en cada línea; sin `g`, solo la primera. `-i` modifica el archivo en su sitio.
- `awk` divide cada línea en campos `$1`, `$2`…; `-F` fija el separador y `NR` es el número de línea.
- `sort | uniq -c | sort -rn` cuenta y ordena líneas; `cut -d: -f1` toma una columna; `wc -l` cuenta líneas.

```bash
grep -rn 'TODO' src/
sed -i 's/http:/https:/g' links.txt
awk -F: '$3 >= 1000 { print $1 }' /etc/passwd
cut -d' ' -f1 access.log | sort | uniq -c | sort -rn | head
```

## Parte 3 — El shell

`>` sobrescribe, `>>` añade, `2>` redirige los errores, `2>&1` envía los errores adonde va la salida — el orden importa: `cmd > out 2>&1` captura ambos, `cmd 2>&1 > out` no. `|` pasa la salida de un comando al siguiente.

La expansión ocurre antes de ejecutar: `*` para los patrones, `{a,b}` para las llaves, `$VAR` para las variables, `$(cmd)` para la sustitución de comandos. Las comillas simples bloquean toda expansión; las dobles conservan `$` pero impiden la división en palabras. `&&` ejecuta el siguiente comando si hay éxito, `||` si hay fallo. `export` pasa una variable a los procesos hijos.

## Parte 4 — Procesos y planificación

- `ps aux`, `top`, `pgrep`; `kill` envía `SIGTERM` (15) por defecto, que un programa puede capturar; `SIGKILL` (9) no puede capturarse.
- `&` lanza una tarea en segundo plano; `jobs`, `fg`, `bg`; `Ctrl+Z` suspende; `nohup` sobrevive al final de la sesión.
- `systemctl start`, `stop`, `enable` (al arrancar), `status`; `journalctl -u nginx` muestra el registro de una unidad.
- Una línea de cron tiene cinco campos: minuto, hora, día del mes, mes, día de la semana.

```bash
# cada día laborable a las 06:30
30 6 * * 1-5 /usr/local/bin/backup.sh
```

## Parte 5 — El sistema

`df -h` muestra el espacio libre por sistema de archivos, `du -sh` el tamaño de un directorio, `lsblk` los discos, `mount` lo que está montado. `useradd`, `usermod -aG` (añadir a un grupo sin salir de los demás), `passwd`, `sudo`. Paquetes: `apt install` en Debian y Ubuntu, `dnf install` en Fedora y RHEL. `uname -r` da el núcleo, `free -h` la memoria, `uptime` la carga.

## Parte 6 — La red

`ip addr` e `ip route` sustituyen a `ifconfig` y `route`. `ss -tlnp` lista los puertos TCP en escucha. `curl -I` solo obtiene las cabeceras. `dig` y `host` consultan el DNS. `ssh-keygen` crea un par de claves, `ssh-copy-id` instala la clave pública en un servidor, y `scp` o `rsync -av` copian archivos por SSH; `rsync` solo envía lo que ha cambiado.

## Parte 7 — Los scripts de shell

Empiece con `#!/usr/bin/env bash` y, por prudencia, `set -euo pipefail`. Los argumentos son `$1`, `$2`…, todos juntos `"$@"`, su número `$#`, el último código de salida `$?`.

```bash
#!/usr/bin/env bash
set -euo pipefail
for file in "$@"; do
  if [[ -f "$file" ]]; then
    echo "${file%.txt}.bak"
  fi
done
```

Expansión de parámetros: `${var:-default}` da un valor por defecto, `${var#prefix}` y `${var%suffix}` quitan la coincidencia más corta, `##` y `%%` la más larga, `${#var}` es la longitud. Arrays: `arr=(a b c)`, `"${arr[@]}"`, `${#arr[@]}`.

## Parte 8 — Git

`git status`, `add`, `commit`, `log --oneline`. `switch -c` crea una rama, `merge` fusiona una, `rebase` vuelve a aplicar los commits sobre otra base y los reescribe — nunca en una rama que otros comparten. Deshacer: `restore` descarta los cambios de un archivo, `reset --soft HEAD~1` deshace un commit pero deja sus cambios preparados, `revert` añade un commit que anula otro y es seguro en un historial compartido. `fetch` descarga, `pull` descarga y fusiona, `push` sube.

## Parte 9 — Vim

Vim tiene modos: normal para los comandos, inserción (`i`, `a`, `o`) para escribir, visual (`v`) para seleccionar; `Esc` vuelve al modo normal. Moverse: `h` `j` `k` `l`, `w` y `b` por palabra, `0` y `$` a los extremos de la línea, `gg` y `G` a los extremos del archivo. Editar: `dd` borra una línea, `yy` la copia, `p` pega, `u` deshace, `.` repite. Busque con `/`, luego `n`; sustituya con `:%s/old/new/g`. Guarde con `:w`, salga con `:q`, y salga sin guardar con `:q!`.

## Parte 10 — Las herramientas

`less` recorre un archivo (`/` busca, `q` sale), `tail -f` sigue un registro que crece, `watch` repite un comando. `jq` lee JSON: `jq '.items[].name'`. `htop` y `vmstat` muestran la carga, `lsof` los archivos abiertos, `strace` las llamadas al sistema de un proceso. `tmux` mantiene viva una sesión tras desconectarse. `xargs` convierte líneas en argumentos: `find . -name '*.tmp' | xargs rm`.

## Fuentes

| Tema | Referencia gratuita |
|---|---|
| Comandos y opciones | [El proyecto Linux man-pages](https://man7.org/linux/man-pages/) |
| El shell y los scripts | [Manual de GNU Bash](https://www.gnu.org/software/bash/manual/) |
| La línea de comandos desde el principio | [The Linux Command Line, William Shotts](https://linuxcommand.org/tlcl.php) |
| Git | [Pro Git](https://git-scm.com/book/en/v2) |
| Vim | [Documentación de Vim](https://vimhelp.org/) |
