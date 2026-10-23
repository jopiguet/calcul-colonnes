/**
 * Linux, vim: modes, moving, editing, searching and replacing (6.14.0). The
 * basics hold in the small `vi` that minimal systems ship (vim-tiny); the rest
 * of vim is the `vim` package.
 */
import type { LinuxQuestion } from "./types";

const modes: LinuxQuestion[] = [
  {
    id: "lx-vim-01",
    q: ["How do you leave vim without saving the changes?", "Comment quitter vim sans enregistrer les changements ?", "¿Cómo salir de vim sin guardar los cambios?"],
    a: ["`Esc`, then `:q!`", "`Esc`, puis `:q!`", "`Esc`, y luego `:q!`"],
    w: [["`Esc`, then `:wq`", "`Esc`, puis `:wq`", "`Esc`, y luego `:wq`"], ["`Esc`, then `:q`", "`Esc`, puis `:q`", "`Esc`, y luego `:q`"], ["`Ctrl-C`", "`Ctrl-C`", "`Ctrl-C`"]],
    e: [
      "`:q` refuses while there are unsaved changes; `!` overrides it. `:wq` saves first. `Ctrl-C` only cancels the current command.",
      "`:q` refuse tant qu'il reste des changements non enregistrés ; `!` passe outre. `:wq` enregistre d'abord. `Ctrl-C` n'annule que la commande en cours.",
      "`:q` se niega mientras haya cambios sin guardar; `!` lo fuerza. `:wq` guarda primero. `Ctrl-C` solo cancela la orden en curso.",
    ],
  },
  {
    id: "lx-vim-02",
    q: ["You typed `:wq` and the text `:wq` appeared in the file. Why?", "Vous avez tapé `:wq` et le texte `:wq` est apparu dans le fichier. Pourquoi ?", "Escribió `:wq` y el texto `:wq` apareció en el archivo. ¿Por qué?"],
    a: ["You were in insert mode: `Esc` first, back to normal mode", "Vous étiez en mode insertion : d'abord `Esc`, pour revenir au mode normal", "Estaba en modo inserción: primero `Esc`, para volver al modo normal"],
    w: [
      ["The file is read-only", "Le fichier est en lecture seule", "El archivo es de solo lectura"],
      ["Commands must be typed in capitals", "Les commandes se tapent en majuscules", "Las órdenes se escriben en mayúsculas"],
      ["`:wq` only works with `sudo`", "`:wq` ne marche qu'avec `sudo`", "`:wq` solo funciona con `sudo`"],
    ],
    e: [
      "`-- INSERT --` at the bottom tells the mode. `u` in normal mode removes the stray text.",
      "`-- INSERT --` en bas indique le mode. `u` en mode normal retire le texte égaré.",
      "`-- INSERT --` abajo indica el modo. `u` en modo normal quita el texto sobrante.",
    ],
  },
  {
    id: "lx-vim-03",
    q: ["In normal mode, which key opens a new line below the cursor and starts inserting?", "En mode normal, quelle touche ouvre une nouvelle ligne sous le curseur et passe en insertion ?", "En modo normal, ¿qué tecla abre una línea nueva debajo del cursor y empieza a insertar?"],
    a: ["`o`", "`o`", "`o`"],
    w: [["`O`", "`O`", "`O`"], ["`a`", "`a`", "`a`"], ["`A`", "`A`", "`A`"], ["`i`", "`i`", "`i`"]],
    e: [
      "`O` opens a line above. `i` inserts before the cursor, `a` after it, `I` at the start of the line, `A` at its end.",
      "`O` ouvre une ligne au-dessus. `i` insère avant le curseur, `a` après, `I` en début de ligne, `A` à la fin.",
      "`O` abre una línea encima. `i` inserta antes del cursor, `a` después, `I` al principio de la línea, `A` al final.",
    ],
  },
  {
    id: "lx-vim-04",
    q: ["What does `ZZ` do in normal mode?", "Que fait `ZZ` en mode normal ?", "¿Qué hace `ZZ` en modo normal?"],
    a: ["Saves the file if it changed, and quits, like `:x`", "Enregistre le fichier s'il a changé, et quitte, comme `:x`", "Guarda el archivo si ha cambiado, y sale, como `:x`"],
    w: [["Quits without saving", "Quitte sans enregistrer", "Sale sin guardar"], ["Undoes every change", "Annule tous les changements", "Deshace todos los cambios"], ["Centres the screen on the cursor", "Centre l'écran sur le curseur", "Centra la pantalla en el cursor"]],
    e: [
      "`ZQ` quits without saving, like `:q!`. `zz` (lower case) centres the screen on the cursor's line.",
      "`ZQ` quitte sans enregistrer, comme `:q!`. `zz` (en minuscules) centre l'écran sur la ligne du curseur.",
      "`ZQ` sale sin guardar, como `:q!`. `zz` (en minúsculas) centra la pantalla en la línea del cursor.",
    ],
  },
  {
    id: "lx-vim-05",
    q: ["Which key starts selecting a rectangular block, to edit a column?", "Quelle touche commence la sélection d'un bloc rectangulaire, pour modifier une colonne ?", "¿Qué tecla empieza a seleccionar un bloque rectangular, para editar una columna?"],
    a: ["`Ctrl-v`", "`Ctrl-v`", "`Ctrl-v`"],
    w: [["`v`", "`v`", "`v`"], ["`V`", "`V`", "`V`"], ["`Ctrl-b`", "`Ctrl-b`", "`Ctrl-b`"]],
    e: [
      "`v` selects characters, `V` whole lines. In a block, `I` then text then `Esc` inserts on every line of it.",
      "`v` sélectionne des caractères, `V` des lignes entières. Dans un bloc, `I`, puis le texte, puis `Esc` insère sur chacune de ses lignes.",
      "`v` selecciona caracteres, `V` líneas enteras. En un bloque, `I`, luego el texto y luego `Esc` inserta en cada una de sus líneas.",
    ],
  },
  {
    id: "lx-vim-06",
    q: ["You opened `/etc/hosts` without `sudo` and changed it. How do you save it anyway?", "Vous avez ouvert `/etc/hosts` sans `sudo` et l'avez modifié. Comment l'enregistrer quand même ?", "Abrió `/etc/hosts` sin `sudo` y lo modificó. ¿Cómo guardarlo igualmente?"],
    a: ["`:w !sudo tee % > /dev/null`", "`:w !sudo tee % > /dev/null`", "`:w !sudo tee % > /dev/null`"],
    w: [["`:w!`", "`:w!`", "`:w!`"], ["`:sudo w`", "`:sudo w`", "`:sudo w`"], ["`:wq!`", "`:wq!`", "`:wq!`"]],
    e: [
      "`:w !cmd` sends the buffer to a command; `%` is the file's name, and `tee` running as root writes it. `!` alone only overrides vim's own read-only flag, not the system's permissions.",
      "`:w !cmd` envoie le tampon à une commande ; `%` est le nom du fichier, et `tee`, lancé en root, l'écrit. Le `!` seul ne passe outre que le drapeau lecture seule de vim, pas les permissions du système.",
      "`:w !cmd` envía el búfer a una orden; `%` es el nombre del archivo, y `tee`, ejecutado como root, lo escribe. El `!` solo se salta la marca de solo lectura de vim, no los permisos del sistema.",
    ],
  },
];

const motions: LinuxQuestion[] = [
  {
    id: "lx-vim-07",
    q: ["How do you go to line 42?", "Comment aller à la ligne 42 ?", "¿Cómo ir a la línea 42?"],
    a: ["`42G`, or `:42`", "`42G`, ou `:42`", "`42G`, o `:42`"],
    w: [["`G42`", "`G42`", "`G42`"], ["`/42`", "`/42`", "`/42`"], ["`42j`", "`42j`", "`42j`"]],
    e: [
      "`gg` is the first line, `G` the last. `/42` searches for the text 42; `42j` moves 42 lines down from where you are.",
      "`gg` est la première ligne, `G` la dernière. `/42` cherche le texte 42 ; `42j` descend de 42 lignes depuis là où vous êtes.",
      "`gg` es la primera línea, `G` la última. `/42` busca el texto 42; `42j` baja 42 líneas desde donde está.",
    ],
  },
  {
    id: "lx-vim-08",
    q: ["Which key moves to the first character of the line that is not a space?", "Quelle touche va au premier caractère de la ligne qui n'est pas une espace ?", "¿Qué tecla va al primer carácter de la línea que no es un espacio?"],
    a: ["`^`", "`^`", "`^`"],
    w: [["`0`", "`0`", "`0`"], ["`$`", "`$`", "`$`"], ["`gg`", "`gg`", "`gg`"]],
    e: [
      "`0` is the very first column, before any indentation; `$` is the end of the line. As in regular expressions, `^` and `$` are start and end.",
      "`0` est la toute première colonne, avant l'indentation ; `$` est la fin de la ligne. Comme dans les expressions régulières, `^` et `$` sont le début et la fin.",
      "`0` es la primerísima columna, antes de la sangría; `$` es el final de la línea. Como en las expresiones regulares, `^` y `$` son principio y final.",
    ],
  },
  {
    id: "lx-vim-09",
    q: ["What do `w`, `b` and `e` do?", "Que font `w`, `b` et `e` ?", "¿Qué hacen `w`, `b` y `e`?"],
    a: ["Move to the start of the next word, back to the start of a word, to the end of a word", "Vont au début du mot suivant, reviennent au début d'un mot, vont à la fin d'un mot", "Van al principio de la palabra siguiente, vuelven al principio de una palabra, van al final de una palabra"],
    w: [
      ["Write, go back to the last save, edit another file", "Enregistrer, revenir au dernier enregistrement, ouvrir un autre fichier", "Guardar, volver al último guardado, abrir otro archivo"],
      ["Move one word, one block and one line", "Avancer d'un mot, d'un bloc et d'une ligne", "Avanzar una palabra, un bloque y una línea"],
      ["Select a word, a bracket, an expression", "Sélectionner un mot, une parenthèse, une expression", "Seleccionar una palabra, un paréntesis, una expresión"],
    ],
    e: [
      "Capitals `W`, `B`, `E` count only spaces as separators, so `a.b-c` is one WORD. A count repeats them: `3w`.",
      "Les majuscules `W`, `B`, `E` ne prennent que les espaces comme séparateurs : `a.b-c` est un seul MOT. Un nombre les répète : `3w`.",
      "Las mayúsculas `W`, `B`, `E` solo toman los espacios como separadores: `a.b-c` es una sola PALABRA. Un número las repite: `3w`.",
    ],
  },
  {
    id: "lx-vim-10",
    q: ["The cursor is on a `(`. What does `%` do?", "Le curseur est sur une `(`. Que fait `%` ?", "El cursor está en un `(`. ¿Qué hace `%`?"],
    a: ["Jumps to the matching `)`", "Saute à la `)` correspondante", "Salta al `)` correspondiente"],
    w: [["Selects the whole file", "Sélectionne tout le fichier", "Selecciona todo el archivo"], ["Shows how far into the file the cursor is", "Indique où en est le curseur dans le fichier", "Indica en qué parte del archivo está el cursor"], ["Deletes the brackets", "Supprime les parenthèses", "Borra los paréntesis"]],
    e: [
      "It works for `()`, `[]` and `{}`. With an operator it covers the whole span: `d%` deletes up to the matching bracket. In a `:` command, `%` means every line.",
      "Il marche pour `()`, `[]` et `{}`. Avec un opérateur, il couvre tout l'intervalle : `d%` supprime jusqu'à la parenthèse correspondante. Dans une commande `:`, `%` veut dire toutes les lignes.",
      "Funciona con `()`, `[]` y `{}`. Con un operador abarca todo el tramo: `d%` borra hasta el paréntesis correspondiente. En una orden `:`, `%` significa todas las líneas.",
    ],
  },
  {
    id: "lx-vim-11",
    q: ["What does `f,` do in normal mode?", "Que fait `f,` en mode normal ?", "¿Qué hace `f,` en modo normal?"],
    a: ["Moves to the next comma on the line; `;` repeats it", "Va à la virgule suivante sur la ligne ; `;` recommence", "Va a la siguiente coma de la línea; `;` lo repite"],
    w: [
      ["Searches the whole file for a comma", "Cherche une virgule dans tout le fichier", "Busca una coma en todo el archivo"],
      ["Folds the code at the comma", "Replie le code à la virgule", "Pliega el código en la coma"],
      ["Replaces the character under the cursor with a comma", "Remplace le caractère sous le curseur par une virgule", "Sustituye el carácter bajo el cursor por una coma"],
    ],
    e: [
      "`t,` stops just before it; `F` and `T` look backwards. Combined: `dt,` deletes up to the comma. Replacing one character is `r,`.",
      "`t,` s'arrête juste avant ; `F` et `T` cherchent vers l'arrière. Combiné : `dt,` supprime jusqu'à la virgule. Remplacer un caractère, c'est `r,`.",
      "`t,` se detiene justo antes; `F` y `T` buscan hacia atrás. Combinado: `dt,` borra hasta la coma. Sustituir un carácter es `r,`.",
    ],
  },
  {
    id: "lx-vim-12",
    q: ["What does `*` do in normal mode?", "Que fait `*` en mode normal ?", "¿Qué hace `*` en modo normal?"],
    a: ["Searches forward for the whole word under the cursor", "Cherche vers l'avant le mot entier sous le curseur", "Busca hacia delante la palabra entera bajo el cursor"],
    w: [["Selects every line", "Sélectionne toutes les lignes", "Selecciona todas las líneas"], ["Marks the line as important", "Marque la ligne comme importante", "Marca la línea como importante"], ["Repeats the last change", "Répète le dernier changement", "Repite el último cambio"]],
    e: [
      "`#` searches backwards. Then `n` and `N` go on, and `:%s//new/g` replaces it: an empty pattern reuses the last search.",
      "`#` cherche vers l'arrière. Ensuite `n` et `N` continuent, et `:%s//new/g` le remplace : un motif vide reprend la dernière recherche.",
      "`#` busca hacia atrás. Después `n` y `N` siguen, y `:%s//new/g` la sustituye: un patrón vacío reutiliza la última búsqueda.",
    ],
  },
];

const editing: LinuxQuestion[] = [
  {
    id: "lx-vim-13",
    q: ["How do you swap the current line with the one below?", "Comment échanger la ligne courante avec celle du dessous ?", "¿Cómo intercambiar la línea actual con la de abajo?"],
    a: ["`ddp`", "`ddp`", "`ddp`"],
    w: [["`yyp`", "`yyp`", "`yyp`"], ["`xp`", "`xp`", "`xp`"], ["`J`", "`J`", "`J`"]],
    e: [
      "`dd` cuts the line, `p` puts it below the next one. `yyp` duplicates the line; `xp` swaps two characters; `J` joins two lines.",
      "`dd` coupe la ligne, `p` la remet sous la suivante. `yyp` duplique la ligne ; `xp` échange deux caractères ; `J` joint deux lignes.",
      "`dd` corta la línea, `p` la pone debajo de la siguiente. `yyp` duplica la línea; `xp` intercambia dos caracteres; `J` une dos líneas.",
    ],
  },
  {
    id: "lx-vim-14",
    q: ["The cursor is inside `\"hello world\"`. What does `ci\"` do?", "Le curseur est dans `\"hello world\"`. Que fait `ci\"` ?", "El cursor está dentro de `\"hello world\"`. ¿Qué hace `ci\"`?"],
    a: ["Deletes the text between the quotes and starts inserting there", "Supprime le texte entre les guillemets et passe en insertion à sa place", "Borra el texto entre las comillas y empieza a insertar allí"],
    w: [
      ["Changes the quotes to apostrophes", "Change les guillemets en apostrophes", "Cambia las comillas dobles por simples"],
      ["Counts the characters inside the quotes", "Compte les caractères entre les guillemets", "Cuenta los caracteres entre las comillas"],
      ["Deletes the quotes and their text, without inserting", "Supprime les guillemets et leur texte, sans passer en insertion", "Borra las comillas y su texto, sin insertar"],
    ],
    e: [
      "An operator (`c` change, `d` delete, `y` copy) followed by a text object: `iw` a word, `i(` inside brackets, `a\"` the quotes included.",
      "Un opérateur (`c` changer, `d` supprimer, `y` copier) suivi d'un objet de texte : `iw` un mot, `i(` l'intérieur de parenthèses, `a\"` guillemets compris.",
      "Un operador (`c` cambiar, `d` borrar, `y` copiar) seguido de un objeto de texto: `iw` una palabra, `i(` el interior de paréntesis, `a\"` con las comillas.",
    ],
  },
  {
    id: "lx-vim-15",
    q: ["What does `.` do in normal mode?", "Que fait `.` en mode normal ?", "¿Qué hace `.` en modo normal?"],
    a: ["Repeats the last change, at the cursor", "Répète le dernier changement, à l'endroit du curseur", "Repite el último cambio, donde está el cursor"],
    w: [["Repeats the last `:` command", "Répète la dernière commande `:`", "Repite la última orden `:`"], ["Moves to the next sentence", "Va à la phrase suivante", "Va a la frase siguiente"], ["Shows the current directory", "Affiche le répertoire courant", "Muestra el directorio actual"]],
    e: [
      "With `*` then `cgn`, each `.` changes the next match. `@:` repeats the last `:` command.",
      "Avec `*` puis `cgn`, chaque `.` change la correspondance suivante. `@:` répète la dernière commande `:`.",
      "Con `*` y luego `cgn`, cada `.` cambia la siguiente coincidencia. `@:` repite la última orden `:`.",
    ],
  },
  {
    id: "lx-vim-16",
    q: ["Which keys undo and redo?", "Quelles touches annulent et rétablissent ?", "¿Qué teclas deshacen y rehacen?"],
    a: ["`u` and `Ctrl-r`", "`u` et `Ctrl-r`", "`u` y `Ctrl-r`"],
    w: [["`Ctrl-z` and `Ctrl-y`", "`Ctrl-z` et `Ctrl-y`", "`Ctrl-z` y `Ctrl-y`"], ["`U` and `r`", "`U` et `r`", "`U` y `r`"], ["`:undo` and `.`", "`:undo` et `.`", "`:undo` y `.`"]],
    e: [
      "`Ctrl-z` suspends vim in the terminal (`fg` brings it back). `r` replaces one character; `U` undoes all the changes on the last line edited.",
      "`Ctrl-z` suspend vim dans le terminal (`fg` le ramène). `r` remplace un caractère ; `U` annule tous les changements de la dernière ligne modifiée.",
      "`Ctrl-z` suspende vim en el terminal (`fg` lo recupera). `r` sustituye un carácter; `U` deshace todos los cambios de la última línea editada.",
    ],
  },
  {
    id: "lx-vim-17",
    q: ["What does `3yy` do?", "Que fait `3yy` ?", "¿Qué hace `3yy`?"],
    a: ["Copies three lines, from the cursor's, ready for `p`", "Copie trois lignes, à partir de celle du curseur, prêtes pour `p`", "Copia tres líneas, desde la del cursor, listas para `p`"],
    w: [["Deletes three lines", "Supprime trois lignes", "Borra tres líneas"], ["Answers yes three times", "Répond oui trois fois", "Responde que sí tres veces"], ["Redoes three changes", "Rétablit trois changements", "Rehace tres cambios"]],
    e: [
      "`y` is yank, vim's copy. Copy and delete fill the same unnamed register; to reach the system clipboard, `\"+y` (when vim has clipboard support).",
      "`y` est yank, la copie de vim. Copier et supprimer remplissent le même registre anonyme ; pour le presse-papiers du système, `\"+y` (si vim gère le presse-papiers).",
      "`y` es yank, la copia de vim. Copiar y borrar llenan el mismo registro sin nombre; para el portapapeles del sistema, `\"+y` (si vim admite el portapapeles).",
    ],
  },
  {
    id: "lx-vim-18",
    q: ["What does `D` do in normal mode?", "Que fait `D` en mode normal ?", "¿Qué hace `D` en modo normal?"],
    a: ["Deletes from the cursor to the end of the line, like `d$`", "Supprime du curseur à la fin de la ligne, comme `d$`", "Borra desde el cursor hasta el final de la línea, como `d$`"],
    w: [["Deletes the whole line, like `dd`", "Supprime toute la ligne, comme `dd`", "Borra la línea entera, como `dd`"], ["Deletes the word under the cursor", "Supprime le mot sous le curseur", "Borra la palabra bajo el cursor"], ["Duplicates the line", "Duplique la ligne", "Duplica la línea"]],
    e: [
      "In the same way `C` changes to the end of the line (`c$`) and `Y` copies the line. `dw` deletes up to the next word.",
      "De même `C` change jusqu'à la fin de la ligne (`c$`) et `Y` copie la ligne. `dw` supprime jusqu'au mot suivant.",
      "Del mismo modo `C` cambia hasta el final de la línea (`c$`) y `Y` copia la línea. `dw` borra hasta la palabra siguiente.",
    ],
  },
];

const search: LinuxQuestion[] = [
  {
    id: "lx-vim-19",
    q: ["`:s/foo/bar/g` changed only one line. Why?", "`:s/foo/bar/g` n'a changé qu'une ligne. Pourquoi ?", "`:s/foo/bar/g` solo cambió una línea. ¿Por qué?"],
    a: ["Without a range, `:s` works on the current line; `:%s/foo/bar/g` covers the file", "Sans plage, `:s` agit sur la ligne courante ; `:%s/foo/bar/g` couvre le fichier", "Sin rango, `:s` actúa en la línea actual; `:%s/foo/bar/g` abarca el archivo"],
    w: [
      ["`g` means only the first match of the file", "`g` veut dire seulement la première correspondance du fichier", "`g` significa solo la primera coincidencia del archivo"],
      ["The other lines have `Foo` with a capital", "Les autres lignes ont `Foo` avec une majuscule", "Las otras líneas tienen `Foo` con mayúscula"],
      ["vim replaces at most one line per command", "vim ne remplace qu'une ligne par commande", "vim sustituye como mucho una línea por orden"],
    ],
    e: [
      "`%` is every line; `10,20` a range; `'<,'>` the visual selection. `g` means every match on each line, as in sed.",
      "`%` désigne toutes les lignes ; `10,20` une plage ; `'<,'>` la sélection visuelle. `g` veut dire toutes les correspondances de chaque ligne, comme dans sed.",
      "`%` designa todas las líneas; `10,20` un rango; `'<,'>` la selección visual. `g` significa todas las coincidencias de cada línea, como en sed.",
    ],
  },
  {
    id: "lx-vim-20",
    q: ["What does the `c` in `:%s/old/new/gc` add?", "Qu'ajoute le `c` de `:%s/old/new/gc` ?", "¿Qué añade la `c` de `:%s/old/new/gc`?"],
    a: ["vim asks before each replacement: `y`, `n`, `a` for all, `q` to stop", "vim demande avant chaque remplacement : `y`, `n`, `a` pour tout, `q` pour arrêter", "vim pregunta antes de cada sustitución: `y`, `n`, `a` para todas, `q` para parar"],
    w: [["Makes the search case-sensitive", "Rend la recherche sensible à la casse", "Hace la búsqueda sensible a mayúsculas"], ["Counts the matches without replacing", "Compte les correspondances sans remplacer", "Cuenta las coincidencias sin sustituir"], ["Copies the old text to the clipboard", "Copie l'ancien texte dans le presse-papiers", "Copia el texto antiguo al portapapeles"]],
    e: [
      "Counting is the `n` flag: `:%s/old//gn`. `i` ignores case for this command, `I` respects it.",
      "Compter, c'est l'option `n` : `:%s/old//gn`. `i` ignore la casse pour cette commande, `I` la respecte.",
      "Contar es la opción `n`: `:%s/old//gn`. `i` ignora mayúsculas en esta orden, `I` las respeta.",
    ],
  },
  {
    id: "lx-vim-21",
    q: ["After `/error`, which keys go to the next and to the previous match?", "Après `/error`, quelles touches vont à la correspondance suivante et à la précédente ?", "Tras `/error`, ¿qué teclas van a la coincidencia siguiente y a la anterior?"],
    a: ["`n` and `N`", "`n` et `N`", "`n` y `N`"],
    w: [["`j` and `k`", "`j` et `k`", "`j` y `k`"], ["`Tab` and `Shift-Tab`", "`Tab` et `Shift-Tab`", "`Tab` y `Shift-Tab`"], ["`f` and `F`", "`f` et `F`", "`f` y `F`"]],
    e: [
      "`?error` searches backwards, and then `n` goes on backwards. `:set hlsearch` highlights every match; `:noh` clears it.",
      "`?error` cherche vers l'arrière, et `n` continue alors vers l'arrière. `:set hlsearch` surligne toutes les correspondances ; `:noh` efface le surlignage.",
      "`?error` busca hacia atrás, y `n` sigue entonces hacia atrás. `:set hlsearch` resalta todas las coincidencias; `:noh` quita el resaltado.",
    ],
  },
  {
    id: "lx-vim-22",
    q: ["What does `:g/DEBUG/d` do?", "Que fait `:g/DEBUG/d` ?", "¿Qué hace `:g/DEBUG/d`?"],
    a: ["Deletes every line containing `DEBUG`", "Supprime toutes les lignes qui contiennent `DEBUG`", "Borra todas las líneas que contienen `DEBUG`"],
    w: [["Deletes the word `DEBUG` everywhere, keeping the lines", "Supprime le mot `DEBUG` partout, en gardant les lignes", "Borra la palabra `DEBUG` en todas partes, conservando las líneas"], ["Deletes the first line with `DEBUG`", "Supprime la première ligne avec `DEBUG`", "Borra la primera línea con `DEBUG`"], ["Keeps only the lines with `DEBUG`", "Ne garde que les lignes avec `DEBUG`", "Solo conserva las líneas con `DEBUG`"]],
    e: [
      "`:g/pattern/cmd` runs a command on every matching line; `:v` (or `:g!`) on every other line, so `:v/DEBUG/d` keeps only them. It is where `grep` got its name: `g/re/p`.",
      "`:g/motif/cmd` lance une commande sur chaque ligne qui correspond ; `:v` (ou `:g!`) sur toutes les autres : `:v/DEBUG/d` ne garde qu'elles. C'est de là que `grep` tient son nom : `g/re/p`.",
      "`:g/patrón/cmd` ejecuta una orden en cada línea que coincide; `:v` (o `:g!`) en todas las demás: `:v/DEBUG/d` solo deja esas. De ahí viene el nombre de `grep`: `g/re/p`.",
    ],
  },
  {
    id: "lx-vim-23",
    q: ["How do you put `# ` at the start of lines 3 to 8?", "Comment mettre `# ` au début des lignes 3 à 8 ?", "¿Cómo poner `# ` al principio de las líneas 3 a 8?"],
    a: ["`:3,8s/^/# /`", "`:3,8s/^/# /`", "`:3,8s/^/# /`"],
    w: [["`:3-8s/^/# /`", "`:3-8s/^/# /`", "`:3-8s/^/# /`"], ["`:3,8s/$/# /`", "`:3,8s/$/# /`", "`:3,8s/$/# /`"], ["`:3,8i# `", "`:3,8i# `", "`:3,8i# `"]],
    e: [
      "`^` matches the start of the line, so the substitution inserts. `$` would add the text at the end. Visual block mode (`Ctrl-v`, `I`) does the same by hand.",
      "`^` correspond au début de la ligne : la substitution insère. `$` ajouterait le texte à la fin. Le mode bloc visuel (`Ctrl-v`, `I`) fait la même chose à la main.",
      "`^` coincide con el principio de la línea: la sustitución inserta. `$` añadiría el texto al final. El modo bloque visual (`Ctrl-v`, `I`) hace lo mismo a mano.",
    ],
  },
  {
    id: "lx-vim-24",
    q: ["What does `/\\<is\\>` find?", "Que trouve `/\\<is\\>` ?", "¿Qué encuentra `/\\<is\\>`?"],
    a: ["'is' as a whole word, not inside 'this' or 'island'", "« is » comme mot entier, pas dans « this » ou « island »", "«is» como palabra completa, no dentro de «this» o «island»"],
    w: [["'is' between angle brackets", "« is » entre chevrons", "«is» entre signos de menor y mayor"], ["Lines starting with 'is'", "Les lignes qui commencent par « is »", "Las líneas que empiezan por «is»"], ["'is' in any case", "« is » en majuscules ou minuscules", "«is» en mayúsculas o minúsculas"]],
    e: [
      "`\\<` and `\\>` are word boundaries in vim, as `grep -w` does. `\\c` anywhere in the pattern ignores case.",
      "`\\<` et `\\>` sont des limites de mot dans vim, comme le fait `grep -w`. `\\c` n'importe où dans le motif ignore la casse.",
      "`\\<` y `\\>` son límites de palabra en vim, como hace `grep -w`. `\\c` en cualquier lugar del patrón ignora mayúsculas.",
    ],
  },
];

export const vim = { modes, motions, editing, search };
