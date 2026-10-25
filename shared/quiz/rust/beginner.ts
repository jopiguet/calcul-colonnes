/**
 * Rust, Débutant: variables and types, control flow, moves, structs and
 * enums, panics, vectors, Cargo. Code between backticks is the same in the
 * three languages.
 */
import type { LinuxQuestion as RustQuestion } from "../linux/types";

const variables: RustQuestion[] = [
  {
    id: "rs-var-01",
    q: ["`let x = 5;` then `x = 6;`: what happens?", "`let x = 5;` puis `x = 6;` : que se passe-t-il ?", "`let x = 5;` y luego `x = 6;`: ¿qué pasa?"],
    a: ["A compile error: `x` is immutable; write `let mut x = 5;`", "Une erreur de compilation : `x` est immuable ; écrire `let mut x = 5;`", "Un error de compilación: `x` es inmutable; escribir `let mut x = 5;`"],
    w: [["`x` is now 6", "`x` vaut maintenant 6", "`x` vale ahora 6"], ["A panic when the program runs", "Un panic à l'exécution", "Un pánico al ejecutar"], ["A warning, and `x` stays 5", "Un avertissement, et `x` reste à 5", "Un aviso, y `x` sigue en 5"]],
    e: [
      "Variables are immutable by default; `mut` says a variable will change, and the compiler checks it. Immutability is the safe default: a value you did not mark `mut` cannot change under you.",
      "Les variables sont immuables par défaut ; `mut` annonce qu'une variable va changer, et le compilateur le vérifie. L'immuabilité est le défaut sûr : une valeur non marquée `mut` ne peut pas changer dans votre dos.",
      "Las variables son inmutables por defecto; `mut` anuncia que una variable cambiará, y el compilador lo comprueba. La inmutabilidad es el valor seguro por defecto: un valor no marcado `mut` no puede cambiar a sus espaldas.",
    ],
  },
  {
    id: "rs-var-02",
    q: ["Is `let n = \"42\"; let n: i32 = n.parse().unwrap();` allowed?", "`let n = \"42\"; let n: i32 = n.parse().unwrap();` est-il permis ?", "¿Está permitido `let n = \"42\"; let n: i32 = n.parse().unwrap();`?"],
    a: ["Yes: the second `let` makes a new variable (shadowing), which may have another type", "Oui : le second `let` crée une nouvelle variable (masquage), qui peut avoir un autre type", "Sí: el segundo `let` crea una variable nueva (sombreado), que puede tener otro tipo"],
    w: [["No: a variable cannot change type", "Non : une variable ne peut pas changer de type", "No: una variable no puede cambiar de tipo"], ["Only if the first `let` has `mut`", "Seulement si le premier `let` a `mut`", "Solo si el primer `let` lleva `mut`"], ["No: a name can be declared once per function", "Non : un nom ne se déclare qu'une fois par fonction", "No: un nombre se declara una sola vez por función"]],
    e: [
      "Shadowing reuses a name for a new value, often of another type, without `mut`. `let mut n = \"42\"; n = 42;` would fail: `mut` lets a variable change value, never type.",
      "Le masquage réutilise un nom pour une nouvelle valeur, souvent d'un autre type, sans `mut`. `let mut n = \"42\"; n = 42;` échouerait : `mut` permet de changer la valeur d'une variable, jamais son type.",
      "El sombreado reutiliza un nombre para un valor nuevo, a menudo de otro tipo, sin `mut`. `let mut n = \"42\"; n = 42;` fallaría: `mut` permite cambiar el valor de una variable, nunca su tipo.",
    ],
  },
  {
    id: "rs-var-03",
    q: ["How does `const MAX: u32 = 100_000;` differ from a `let`?", "En quoi `const MAX: u32 = 100_000;` diffère-t-il d'un `let` ?", "¿En qué se diferencia `const MAX: u32 = 100_000;` de un `let`?"],
    a: ["Its type must be written, its value is known at compile time, and it may be declared outside any function", "Son type doit être écrit, sa valeur est connue à la compilation, et elle peut être déclarée hors de toute fonction", "Su tipo debe escribirse, su valor se conoce al compilar, y puede declararse fuera de cualquier función"],
    w: [["It can be changed with `mut`", "On peut la changer avec `mut`", "Se puede cambiar con `mut`"], ["It is computed when the program starts, from the environment", "Elle est calculée au démarrage du programme, depuis l'environnement", "Se calcula al arrancar el programa, desde el entorno"], ["Nothing: it is another spelling of `let`", "Rien : c'est une autre écriture de `let`", "Nada: es otra forma de escribir `let`"]],
    e: [
      "A constant is evaluated at compile time and copied where it is used; the `_` in `100_000` only helps reading. Constants are named in SCREAMING_SNAKE_CASE. A `static` is similar but has one fixed address.",
      "Une constante est évaluée à la compilation et recopiée là où elle sert ; le `_` de `100_000` aide seulement à lire. Les constantes s'écrivent en SCREAMING_SNAKE_CASE. Un `static` est proche mais a une adresse fixe unique.",
      "Una constante se evalúa al compilar y se copia donde se usa; el `_` de `100_000` solo ayuda a leer. Las constantes se escriben en SCREAMING_SNAKE_CASE. Un `static` es parecido pero tiene una única dirección fija.",
    ],
  },
  {
    id: "rs-var-04",
    q: ["Without an annotation, which types do `let n = 3;` and `let f = 2.5;` get?", "Sans annotation, quels types reçoivent `let n = 3;` et `let f = 2.5;` ?", "Sin anotación, ¿qué tipos reciben `let n = 3;` y `let f = 2.5;`?"],
    a: ["`i32` and `f64`, unless the code around them asks for another type", "`i32` et `f64`, sauf si le code autour demande un autre type", "`i32` y `f64`, salvo que el código de alrededor pida otro tipo"],
    w: [["`i64` and `f32`", "`i64` et `f32`", "`i64` y `f32`"], ["`usize` and `f64`", "`usize` et `f64`", "`usize` y `f64`"], ["None: Rust requires every type to be written", "Aucun : Rust exige d'écrire chaque type", "Ninguno: Rust exige escribir cada tipo"]],
    e: [
      "Rust infers types from use: if `n` is later used as an index, it becomes `usize`. Only when nothing decides does an integer default to `i32` and a float to `f64`. A suffix fixes it: `3u8`, `2.5f32`.",
      "Rust déduit les types de l'usage : si `n` sert ensuite d'indice, il devient `usize`. C'est seulement quand rien ne décide qu'un entier vaut `i32` et un flottant `f64`. Un suffixe le fixe : `3u8`, `2.5f32`.",
      "Rust deduce los tipos del uso: si `n` se usa después como índice, pasa a ser `usize`. Solo cuando nada lo decide un entero es `i32` y un flotante `f64`. Un sufijo lo fija: `3u8`, `2.5f32`.",
    ],
  },
  {
    id: "rs-var-05",
    q: ["What separates `let _x = f();` from `let _ = f();`?", "Qu'est-ce qui distingue `let _x = f();` de `let _ = f();` ?", "¿Qué diferencia `let _x = f();` de `let _ = f();`?"],
    a: ["`_x` keeps the value to the end of the scope, with no unused warning; `_` binds nothing, so the value is dropped at once", "`_x` garde la valeur jusqu'à la fin de la portée, sans avertissement ; `_` ne lie rien : la valeur est libérée aussitôt", "`_x` conserva el valor hasta el final del ámbito, sin aviso; `_` no enlaza nada: el valor se libera en el acto"],
    w: [["Nothing: both ignore the value the same way", "Rien : les deux ignorent la valeur de la même façon", "Nada: los dos ignoran el valor igual"], ["`_x` is a compile error", "`_x` est une erreur de compilation", "`_x` es un error de compilación"], ["`_` keeps the value longer than `_x`", "`_` garde la valeur plus longtemps que `_x`", "`_` conserva el valor más tiempo que `_x`"]],
    e: [
      "A leading underscore only silences the unused-variable warning. The difference matters for values that do something when dropped: `let _ = mutex.lock()` releases the lock immediately, `let _guard = mutex.lock()` holds it.",
      "Un tiret bas initial fait seulement taire l'avertissement de variable inutilisée. La différence compte pour les valeurs qui agissent à leur libération : `let _ = mutex.lock()` relâche le verrou aussitôt, `let _guard = mutex.lock()` le garde.",
      "Un guion bajo inicial solo silencia el aviso de variable sin usar. La diferencia importa con valores que hacen algo al liberarse: `let _ = mutex.lock()` suelta el cerrojo en el acto, `let _guard = mutex.lock()` lo mantiene.",
    ],
  },
];

const types: RustQuestion[] = [
  {
    id: "rs-type-01",
    q: ["How many bytes does a `char` take?", "Combien d'octets prend un `char` ?", "¿Cuántos bytes ocupa un `char`?"],
    a: ["4: any Unicode scalar value, so `'é'` and `'🦀'` are one `char` each", "4 : n'importe quelle valeur scalaire Unicode, donc `'é'` et `'🦀'` sont un `char` chacun", "4: cualquier valor escalar Unicode, así que `'é'` y `'🦀'` son un `char` cada uno"],
    w: [["1, as in C", "1, comme en C", "1, como en C"], ["2, as in Java", "2, comme en Java", "2, como en Java"], ["It varies from 1 to 4 with the character", "Ça varie de 1 à 4 selon le caractère", "Varía de 1 a 4 según el carácter"]],
    e: [
      "A `char` alone is always 4 bytes. Inside a `String` or `str`, characters are stored in UTF-8, 1 to 4 bytes each: that is where the size varies. A byte is a `u8`, and `b'a'` is a byte literal.",
      "Un `char` seul fait toujours 4 octets. Dans une `String` ou un `str`, les caractères sont stockés en UTF-8, de 1 à 4 octets chacun : c'est là que la taille varie. Un octet est un `u8`, et `b'a'` un littéral d'octet.",
      "Un `char` solo ocupa siempre 4 bytes. Dentro de un `String` o un `str`, los caracteres se guardan en UTF-8, de 1 a 4 bytes cada uno: ahí es donde varía el tamaño. Un byte es un `u8`, y `b'a'` un literal de byte.",
    ],
  },
  {
    id: "rs-type-02",
    q: ["What is `[0; 5]`?", "Qu'est-ce que `[0; 5]` ?", "¿Qué es `[0; 5]`?"],
    a: ["An array of five zeros, of type `[i32; 5]`: its length is part of its type", "Un tableau de cinq zéros, de type `[i32; 5]` : sa longueur fait partie de son type", "Un array de cinco ceros, de tipo `[i32; 5]`: su longitud forma parte de su tipo"],
    w: [["A vector that can grow from 5", "Un vecteur qui peut grandir à partir de 5", "Un vector que puede crecer desde 5"], ["The range from 0 to 5", "L'intervalle de 0 à 5", "El intervalo de 0 a 5"], ["A tuple holding 0 and 5", "Un tuple contenant 0 et 5", "Una tupla que contiene 0 y 5"]],
    e: [
      "Arrays have a fixed length known at compile time and usually live on the stack. A `Vec` grows on the heap; `vec![0; 5]` builds one the same way. A tuple mixes types: `(1, \"a\")`, read with `.0` and `.1`.",
      "Les tableaux ont une longueur fixe connue à la compilation et vivent en général sur la pile. Un `Vec` grandit sur le tas ; `vec![0; 5]` en construit un de la même façon. Un tuple mélange les types : `(1, \"a\")`, lu avec `.0` et `.1`.",
      "Los arrays tienen una longitud fija conocida al compilar y suelen vivir en la pila. Un `Vec` crece en el montón; `vec![0; 5]` construye uno del mismo modo. Una tupla mezcla tipos: `(1, \"a\")`, que se lee con `.0` y `.1`.",
    ],
  },
  {
    id: "rs-type-03",
    q: ["An index read from the user is past the end of an array. What does `a[i]` do?", "Un indice lu chez l'utilisateur dépasse la fin d'un tableau. Que fait `a[i]` ?", "Un índice leído del usuario sobrepasa el final de un array. ¿Qué hace `a[i]`?"],
    a: ["It panics: indexing is checked at run time, never reading past the end", "Il panique : l'accès est vérifié à l'exécution, jamais de lecture au-delà de la fin", "Provoca un pánico: el acceso se comprueba al ejecutar, nunca se lee más allá del final"],
    w: [["It reads whatever memory follows", "Il lit la mémoire qui suit, quelle qu'elle soit", "Lee la memoria que sigue, sea cual sea"], ["It returns 0", "Il renvoie 0", "Devuelve 0"], ["It wraps round to the start", "Il repart au début", "Vuelve al principio"]],
    e: [
      "Bounds checks are what make indexing safe: a panic stops the thread with a message instead of corrupting memory. `a.get(i)` returns an `Option` instead, `None` when out of range.",
      "Les vérifications de bornes rendent l'accès sûr : un panic arrête le thread avec un message au lieu de corrompre la mémoire. `a.get(i)` renvoie plutôt une `Option`, `None` hors des bornes.",
      "Las comprobaciones de límites hacen seguro el acceso: un pánico detiene el hilo con un mensaje en lugar de corromper la memoria. `a.get(i)` devuelve en cambio una `Option`, `None` fuera de rango.",
    ],
  },
  {
    id: "rs-type-04",
    q: ["Which type do indexes and lengths use?", "Quel type utilisent les indices et les longueurs ?", "¿Qué tipo usan los índices y las longitudes?"],
    a: ["`usize`, as wide as a pointer (64 bits on most machines)", "`usize`, aussi large qu'un pointeur (64 bits sur la plupart des machines)", "`usize`, tan ancho como un puntero (64 bits en la mayoría de máquinas)"],
    w: [["`i32`", "`i32`", "`i32`"], ["`u32` everywhere", "`u32` partout", "`u32` en todas partes"], ["Any integer type", "N'importe quel type entier", "Cualquier tipo entero"]],
    e: [
      "`v.len()` is a `usize` and `v[i]` needs one; an `i32` index must be converted (`i as usize`, or `usize::try_from(i)` when it may be negative). Rust never converts between integer types by itself.",
      "`v.len()` est un `usize` et `v[i]` en demande un ; un indice `i32` doit être converti (`i as usize`, ou `usize::try_from(i)` s'il peut être négatif). Rust ne convertit jamais tout seul entre types entiers.",
      "`v.len()` es un `usize` y `v[i]` necesita uno; un índice `i32` hay que convertirlo (`i as usize`, o `usize::try_from(i)` si puede ser negativo). Rust nunca convierte por sí solo entre tipos enteros.",
    ],
  },
  {
    id: "rs-type-05",
    q: ["Which values does a `u8` hold, and an `i8`?", "Quelles valeurs tient un `u8`, et un `i8` ?", "¿Qué valores admite un `u8`, y un `i8`?"],
    a: ["0 to 255, and −128 to 127", "0 à 255, et −128 à 127", "0 a 255, y −128 a 127"],
    w: [["0 to 256, and −128 to 128", "0 à 256, et −128 à 128", "0 a 256, y −128 a 128"], ["−255 to 255 for both", "−255 à 255 pour les deux", "−255 a 255 para los dos"], ["0 to 127, and −255 to 255", "0 à 127, et −255 à 255", "0 a 127, y −255 a 255"]],
    e: [
      "`u` types are unsigned, `i` types signed, from 8 to 128 bits. The limits are constants: `u8::MAX`, `i8::MIN`. Going past them is an overflow: a panic in a debug build.",
      "Les types `u` sont non signés, les `i` signés, de 8 à 128 bits. Les limites sont des constantes : `u8::MAX`, `i8::MIN`. Les dépasser est un dépassement : un panic en build de debug.",
      "Los tipos `u` son sin signo, los `i` con signo, de 8 a 128 bits. Los límites son constantes: `u8::MAX`, `i8::MIN`. Superarlos es un desbordamiento: un pánico en una compilación de debug.",
    ],
  },
];

const control: RustQuestion[] = [
  {
    id: "rs-ctrl-01",
    q: ["Why does `let x = if ok { 1 } else { \"one\" };` not compile?", "Pourquoi `let x = if ok { 1 } else { \"one\" };` ne compile-t-il pas ?", "¿Por qué no compila `let x = if ok { 1 } else { \"one\" };`?"],
    a: ["`if` is an expression: both branches must have the same type", "`if` est une expression : les deux branches doivent avoir le même type", "`if` es una expresión: las dos ramas deben tener el mismo tipo"],
    w: [["`if` cannot be used after `=`", "`if` ne peut pas suivre un `=`", "`if` no puede ir después de `=`"], ["The condition needs brackets", "La condition demande des parenthèses", "La condición necesita paréntesis"], ["A block cannot end without a semicolon", "Un bloc ne peut pas finir sans point-virgule", "Un bloque no puede terminar sin punto y coma"]],
    e: [
      "Rust has no `?:` operator: `if … else …` gives a value. A block's last expression, without a semicolon, is its value; with a semicolon it is a statement, and the block gives `()`.",
      "Rust n'a pas d'opérateur `?:` : `if … else …` donne une valeur. La dernière expression d'un bloc, sans point-virgule, est sa valeur ; avec un point-virgule, c'est une instruction, et le bloc donne `()`.",
      "Rust no tiene operador `?:`: `if … else …` da un valor. La última expresión de un bloque, sin punto y coma, es su valor; con punto y coma es una sentencia, y el bloque da `()`.",
    ],
  },
  {
    id: "rs-ctrl-02",
    q: ["What does `let r = loop { break 7; };` give `r`?", "Que vaut `r` après `let r = loop { break 7; };` ?", "¿Cuánto vale `r` tras `let r = loop { break 7; };`?"],
    a: ["7: `break` can carry the value of a `loop`", "7 : `break` peut porter la valeur d'un `loop`", "7: `break` puede llevar el valor de un `loop`"],
    w: [["`()`: a loop has no value", "`()` : une boucle n'a pas de valeur", "`()`: un bucle no tiene valor"], ["It never ends", "Elle ne finit jamais", "No termina nunca"], ["A compile error", "Une erreur de compilation", "Un error de compilación"]],
    e: [
      "`loop` repeats until a `break`, which may carry a value: handy for retrying until something succeeds. `while` and `for` loops always give `()`.",
      "`loop` répète jusqu'à un `break`, qui peut porter une valeur : pratique pour réessayer jusqu'à ce que ça marche. Les boucles `while` et `for` donnent toujours `()`.",
      "`loop` repite hasta un `break`, que puede llevar un valor: práctico para reintentar hasta que algo funcione. Los bucles `while` y `for` siempre dan `()`.",
    ],
  },
  {
    id: "rs-ctrl-03",
    q: ["Which numbers does `for i in 1..4` go through?", "Par quels nombres passe `for i in 1..4` ?", "¿Por qué números pasa `for i in 1..4`?"],
    a: ["1, 2 and 3; `1..=4` would include 4", "1, 2 et 3 ; `1..=4` inclurait 4", "1, 2 y 3; `1..=4` incluiría 4"],
    w: [["1, 2, 3 and 4", "1, 2, 3 et 4", "1, 2, 3 y 4"], ["2 and 3", "2 et 3", "2 y 3"], ["0, 1, 2 and 3", "0, 1, 2 et 3", "0, 1, 2 y 3"]],
    e: [
      "`a..b` is half-open: it includes `a`, not `b`, so `0..v.len()` gives exactly the valid indexes. `(1..4).rev()` counts down: 3, 2, 1.",
      "`a..b` est semi-ouvert : il comprend `a`, pas `b`, donc `0..v.len()` donne exactement les indices valides. `(1..4).rev()` compte à rebours : 3, 2, 1.",
      "`a..b` es semiabierto: incluye `a`, no `b`, así que `0..v.len()` da exactamente los índices válidos. `(1..4).rev()` cuenta hacia atrás: 3, 2, 1.",
    ],
  },
  {
    id: "rs-ctrl-04",
    q: ["`let n = 3; if n { … }`: what happens?", "`let n = 3; if n { … }` : que se passe-t-il ?", "`let n = 3; if n { … }`: ¿qué pasa?"],
    a: ["A compile error: a condition must be a `bool`; write `if n != 0`", "Une erreur de compilation : une condition doit être un `bool` ; écrire `if n != 0`", "Un error de compilación: una condición debe ser un `bool`; escribir `if n != 0`"],
    w: [["The block runs: any non-zero number is true", "Le bloc s'exécute : tout nombre non nul est vrai", "El bloque se ejecuta: todo número distinto de cero es verdadero"], ["The block is skipped", "Le bloc est sauté", "El bloque se salta"], ["A panic at run time", "Un panic à l'exécution", "Un pánico al ejecutar"]],
    e: [
      "Rust has no truthiness: numbers, strings and `Option`s are never taken as booleans. The test is written out, which also rules out `if (x = 0)` slips.",
      "Rust n'a pas de valeur de vérité implicite : nombres, chaînes et `Option` ne sont jamais pris pour des booléens. Le test s'écrit en entier, ce qui écarte aussi les erreurs du type `if (x = 0)`.",
      "Rust no tiene veracidad implícita: números, cadenas y `Option` nunca se toman como booleanos. La prueba se escribe entera, lo que también descarta despistes como `if (x = 0)`.",
    ],
  },
  {
    id: "rs-ctrl-05",
    q: ["Two nested loops: how do you leave both from the inner one?", "Deux boucles imbriquées : comment sortir des deux depuis celle de l'intérieur ?", "Dos bucles anidados: ¿cómo se sale de los dos desde el interior?"],
    a: ["Label the outer loop, `'outer: for …`, and write `break 'outer;`", "Étiqueter la boucle extérieure, `'outer: for …`, et écrire `break 'outer;`", "Etiquetar el bucle exterior, `'outer: for …`, y escribir `break 'outer;`"],
    w: [["`break 2;`", "`break 2;`", "`break 2;`"], ["`goto end;`", "`goto end;`", "`goto end;`"], ["`break; break;`", "`break; break;`", "`break; break;`"]],
    e: [
      "A label starts with an apostrophe; `break` and `continue` can name the loop they act on. There is no `goto`. Moving the loops into a function and using `return` is another clean way out.",
      "Une étiquette commence par une apostrophe ; `break` et `continue` peuvent nommer la boucle visée. Il n'y a pas de `goto`. Mettre les boucles dans une fonction et utiliser `return` est une autre sortie propre.",
      "Una etiqueta empieza por un apóstrofo; `break` y `continue` pueden nombrar el bucle al que afectan. No hay `goto`. Mover los bucles a una función y usar `return` es otra salida limpia.",
    ],
  },
];

const moves: RustQuestion[] = [
  {
    id: "rs-move-01",
    q: ["`let s1 = String::from(\"hi\"); let s2 = s1;` and then `println!(\"{}\", s1);`: what happens?", "`let s1 = String::from(\"hi\"); let s2 = s1;` puis `println!(\"{}\", s1);` : que se passe-t-il ?", "`let s1 = String::from(\"hi\"); let s2 = s1;` y luego `println!(\"{}\", s1);`: ¿qué pasa?"],
    a: ["A compile error: the `String` moved to `s2`, `s1` can no longer be used", "Une erreur de compilation : la `String` a été déplacée dans `s2`, `s1` n'est plus utilisable", "Un error de compilación: el `String` se movió a `s2`, `s1` ya no se puede usar"],
    w: [["It prints hi: both share the text", "Il affiche hi : les deux partagent le texte", "Muestra hi: los dos comparten el texto"], ["It prints an empty line", "Il affiche une ligne vide", "Muestra una línea vacía"], ["A crash: the memory was freed twice", "Un plantage : la mémoire a été libérée deux fois", "Un fallo: la memoria se liberó dos veces"]],
    e: [
      "A `String` has one owner. Assigning it moves ownership: only `s2` will free the text, so freeing it twice is impossible, and the compiler forbids using `s1`. `let s2 = s1.clone();` copies it instead.",
      "Une `String` a un seul propriétaire. L'affecter déplace la propriété : seule `s2` libérera le texte, donc une double libération est impossible, et le compilateur interdit d'utiliser `s1`. `let s2 = s1.clone();` la copie à la place.",
      "Un `String` tiene un solo dueño. Asignarlo mueve la propiedad: solo `s2` liberará el texto, así que liberarlo dos veces es imposible, y el compilador prohíbe usar `s1`. `let s2 = s1.clone();` lo copia en su lugar.",
    ],
  },
  {
    id: "rs-move-02",
    q: ["`let a = 5; let b = a;`: can `a` still be used?", "`let a = 5; let b = a;` : `a` est-il encore utilisable ?", "`let a = 5; let b = a;`: ¿se puede seguir usando `a`?"],
    a: ["Yes: `i32` is `Copy`, so the value is copied, not moved", "Oui : `i32` est `Copy`, donc la valeur est copiée, pas déplacée", "Sí: `i32` es `Copy`, así que el valor se copia, no se mueve"],
    w: [["No: every assignment moves", "Non : toute affectation déplace", "No: toda asignación mueve"], ["Only if `a` is `mut`", "Seulement si `a` est `mut`", "Solo si `a` es `mut`"], ["Only after `b` goes out of scope", "Seulement quand `b` sort de sa portée", "Solo cuando `b` sale de su ámbito"]],
    e: [
      "Simple values that live entirely on the stack (integers, floats, `bool`, `char`, and tuples or arrays of them) are `Copy`: copying is cheap and nothing needs freeing. Types that own heap memory, like `String` and `Vec`, move.",
      "Les valeurs simples qui tiennent entièrement sur la pile (entiers, flottants, `bool`, `char`, et leurs tuples ou tableaux) sont `Copy` : la copie est bon marché et rien n'est à libérer. Les types qui possèdent de la mémoire sur le tas, comme `String` et `Vec`, se déplacent.",
      "Los valores simples que viven por completo en la pila (enteros, flotantes, `bool`, `char`, y sus tuplas o arrays) son `Copy`: copiar es barato y no hay nada que liberar. Los tipos que poseen memoria en el montón, como `String` y `Vec`, se mueven.",
    ],
  },
  {
    id: "rs-move-03",
    q: ["`fn shout(s: String)`, then `shout(name); println!(\"{}\", name);`: how do you fix the error?", "`fn shout(s: String)`, puis `shout(name); println!(\"{}\", name);` : comment corriger l'erreur ?", "`fn shout(s: String)`, y luego `shout(name); println!(\"{}\", name);`: ¿cómo se corrige el error?"],
    a: ["Make it borrow: `fn shout(s: &str)` and call `shout(&name)`", "Le faire emprunter : `fn shout(s: &str)` et appeler `shout(&name)`", "Hacer que tome prestado: `fn shout(s: &str)` y llamar `shout(&name)`"],
    w: [["Add `mut` to `name`", "Ajouter `mut` à `name`", "Añadir `mut` a `name`"], ["Call `shout(name)` twice", "Appeler `shout(name)` deux fois", "Llamar `shout(name)` dos veces"], ["Write `return name;` in `shout`", "Écrire `return name;` dans `shout`", "Escribir `return name;` en `shout`"]],
    e: [
      "Passing a `String` by value moves it into the function, which frees it at its end. A function that only reads takes a reference; `&str` accepts both `&String` and string literals. `shout(name.clone())` also works, at the cost of a copy.",
      "Passer une `String` par valeur la déplace dans la fonction, qui la libère à sa fin. Une fonction qui ne fait que lire prend une référence ; `&str` accepte à la fois `&String` et les littéraux. `shout(name.clone())` marche aussi, au prix d'une copie.",
      "Pasar un `String` por valor lo mueve a la función, que lo libera al terminar. Una función que solo lee toma una referencia; `&str` acepta tanto `&String` como literales. `shout(name.clone())` también funciona, a costa de una copia.",
    ],
  },
  {
    id: "rs-move-04",
    q: ["When is the memory of a `String` freed?", "Quand la mémoire d'une `String` est-elle libérée ?", "¿Cuándo se libera la memoria de un `String`?"],
    a: ["When its owner goes out of scope: Rust inserts the call, no garbage collector", "Quand son propriétaire sort de sa portée : Rust insère l'appel, sans ramasse-miettes", "Cuando su dueño sale de su ámbito: Rust inserta la llamada, sin recolector de basura"],
    w: [["When the garbage collector runs", "Quand le ramasse-miettes passe", "Cuando pasa el recolector de basura"], ["Only when you call `free`", "Seulement quand on appelle `free`", "Solo al llamar a `free`"], ["At the end of the program", "À la fin du programme", "Al final del programa"]],
    e: [
      "At the closing brace of the owner's scope, Rust calls `drop`. The moment is known at compile time, and the same mechanism closes files, sockets and locks. Moving a value hands that duty to the new owner.",
      "À l'accolade fermante de la portée du propriétaire, Rust appelle `drop`. Le moment est connu à la compilation, et le même mécanisme ferme fichiers, sockets et verrous. Déplacer une valeur transmet ce devoir au nouveau propriétaire.",
      "En la llave de cierre del ámbito del dueño, Rust llama a `drop`. El momento se conoce al compilar, y el mismo mecanismo cierra archivos, sockets y cerrojos. Mover un valor pasa esa tarea al nuevo dueño.",
    ],
  },
  {
    id: "rs-move-05",
    q: ["What does `.clone()` cost on a `Vec<String>` of a thousand names?", "Que coûte `.clone()` sur un `Vec<String>` de mille noms ?", "¿Cuánto cuesta `.clone()` sobre un `Vec<String>` de mil nombres?"],
    a: ["A full copy: a new vector and a new allocation for every name", "Une copie complète : un nouveau vecteur et une nouvelle allocation pour chaque nom", "Una copia completa: un vector nuevo y una asignación nueva para cada nombre"],
    w: [["Nothing: it shares the data", "Rien : il partage les données", "Nada: comparte los datos"], ["Only the vector's header, not the names", "Seulement l'en-tête du vecteur, pas les noms", "Solo la cabecera del vector, no los nombres"], ["It moves the vector", "Il déplace le vecteur", "Mueve el vector"]],
    e: [
      "`clone` is an explicit, deep copy: Rust makes copies of heap data visible in the code. Borrowing (`&v`) shares without copying; `Rc` or `Arc` share ownership when several owners are really needed.",
      "`clone` est une copie explicite et profonde : Rust rend visibles dans le code les copies de données du tas. Emprunter (`&v`) partage sans copier ; `Rc` ou `Arc` partagent la propriété quand plusieurs propriétaires sont vraiment nécessaires.",
      "`clone` es una copia explícita y profunda: Rust hace visibles en el código las copias de datos del montón. Tomar prestado (`&v`) comparte sin copiar; `Rc` o `Arc` comparten la propiedad cuando de verdad hacen falta varios dueños.",
    ],
  },
];

const structsEnums: RustQuestion[] = [
  {
    id: "rs-struct-01",
    q: ["`println!(\"{:?}\", p)` on a `struct Point { x: i32, y: i32 }` fails. What is missing?", "`println!(\"{:?}\", p)` sur une `struct Point { x: i32, y: i32 }` échoue. Que manque-t-il ?", "`println!(\"{:?}\", p)` sobre un `struct Point { x: i32, y: i32 }` falla. ¿Qué falta?"],
    a: ["`#[derive(Debug)]` above the struct", "`#[derive(Debug)]` au-dessus de la struct", "`#[derive(Debug)]` encima de la struct"],
    w: [["A `toString` method", "Une méthode `toString`", "Un método `toString`"], ["`pub` on the fields", "`pub` sur les champs", "`pub` en los campos"], ["`{:?}` only works for numbers", "`{:?}` ne marche que pour les nombres", "`{:?}` solo funciona con números"]],
    e: [
      "`{:?}` uses the `Debug` trait, which `derive` writes for you; `{:#?}` pretty-prints it. `{}` needs `Display`, written by hand, because how to show a value to users is a choice.",
      "`{:?}` utilise le trait `Debug`, que `derive` écrit pour vous ; `{:#?}` l'affiche joliment. `{}` demande `Display`, écrit à la main, car la façon de montrer une valeur aux utilisateurs est un choix.",
      "`{:?}` usa el trait `Debug`, que `derive` escribe por usted; `{:#?}` lo muestra con formato. `{}` necesita `Display`, escrito a mano, porque cómo mostrar un valor a los usuarios es una elección.",
    ],
  },
  {
    id: "rs-struct-02",
    q: ["What can `enum Shape { Circle(f64), Rect { w: f64, h: f64 } }` hold?", "Que peut contenir `enum Shape { Circle(f64), Rect { w: f64, h: f64 } }` ?", "¿Qué puede contener `enum Shape { Circle(f64), Rect { w: f64, h: f64 } }`?"],
    a: ["Either a circle with its radius, or a rectangle with its width and height: each variant has its own data", "Soit un cercle avec son rayon, soit un rectangle avec sa largeur et sa hauteur : chaque variante a ses données", "O un círculo con su radio, o un rectángulo con su ancho y alto: cada variante tiene sus datos"],
    w: [["Both a circle and a rectangle at once", "À la fois un cercle et un rectangle", "A la vez un círculo y un rectángulo"], ["Only a number, 0 or 1, as in C", "Seulement un nombre, 0 ou 1, comme en C", "Solo un número, 0 o 1, como en C"], ["Nothing: enum variants cannot hold data", "Rien : les variantes d'enum ne portent pas de données", "Nada: las variantes de un enum no llevan datos"]],
    e: [
      "Rust's enums are tagged unions: a value is one variant, with that variant's fields. `match` finds out which and binds the fields: `Shape::Circle(r) => 3.14 * r * r`.",
      "Les enums de Rust sont des unions étiquetées : une valeur est une variante, avec les champs de cette variante. `match` détermine laquelle et lie les champs : `Shape::Circle(r) => 3.14 * r * r`.",
      "Los enums de Rust son uniones etiquetadas: un valor es una variante, con los campos de esa variante. `match` averigua cuál y enlaza los campos: `Shape::Circle(r) => 3.14 * r * r`.",
    ],
  },
  {
    id: "rs-struct-03",
    q: ["A `match` on `Shape` handles `Circle` but forgets `Rect`. What happens?", "Un `match` sur `Shape` traite `Circle` mais oublie `Rect`. Que se passe-t-il ?", "Un `match` sobre `Shape` trata `Circle` pero olvida `Rect`. ¿Qué pasa?"],
    a: ["A compile error: a `match` must cover every case", "Une erreur de compilation : un `match` doit couvrir tous les cas", "Un error de compilación: un `match` debe cubrir todos los casos"],
    w: [["Rectangles are skipped silently", "Les rectangles sont ignorés en silence", "Los rectángulos se saltan en silencio"], ["A panic when a rectangle comes", "Un panic quand un rectangle arrive", "Un pánico cuando llega un rectángulo"], ["A warning only", "Un avertissement seulement", "Solo un aviso"]],
    e: [
      "Exhaustiveness is checked: adding a variant later points to every `match` that must handle it. `_ => …` catches the rest when that is really meant, at the price of that help.",
      "L'exhaustivité est vérifiée : ajouter une variante plus tard signale chaque `match` qui doit la traiter. `_ => …` attrape le reste quand c'est vraiment voulu, au prix de cette aide.",
      "La exhaustividad se comprueba: añadir una variante más tarde señala cada `match` que debe tratarla. `_ => …` captura el resto cuando de verdad se quiere, a costa de esa ayuda.",
    ],
  },
  {
    id: "rs-struct-04",
    q: ["How does Rust say that a value may be missing?", "Comment Rust dit-il qu'une valeur peut manquer ?", "¿Cómo dice Rust que un valor puede faltar?"],
    a: ["With `Option<T>`: `Some(value)` or `None`, which must be handled before using the value", "Avec `Option<T>` : `Some(valeur)` ou `None`, à traiter avant d'utiliser la valeur", "Con `Option<T>`: `Some(valor)` o `None`, que hay que tratar antes de usar el valor"],
    w: [["With `null`, as in Java", "Avec `null`, comme en Java", "Con `null`, como en Java"], ["With 0 or an empty string", "Avec 0 ou une chaîne vide", "Con 0 o una cadena vacía"], ["With an exception", "Avec une exception", "Con una excepción"]],
    e: [
      "Safe Rust has no null. An `Option<i32>` is not an `i32`: the compiler makes you look inside with `match`, `if let Some(x) = …`, or a method such as `unwrap_or`. The missing case cannot be forgotten.",
      "Le Rust sûr n'a pas de null. Une `Option<i32>` n'est pas un `i32` : le compilateur oblige à regarder dedans avec `match`, `if let Some(x) = …`, ou une méthode comme `unwrap_or`. Le cas manquant ne peut pas être oublié.",
      "El Rust seguro no tiene null. Una `Option<i32>` no es un `i32`: el compilador obliga a mirar dentro con `match`, `if let Some(x) = …`, o un método como `unwrap_or`. El caso ausente no se puede olvidar.",
    ],
  },
  {
    id: "rs-struct-05",
    q: ["In `impl Point { fn new(x: i32, y: i32) -> Self { … } fn norm(&self) -> f64 { … } }`, how are the two called?", "Dans `impl Point { fn new(x: i32, y: i32) -> Self { … } fn norm(&self) -> f64 { … } }`, comment appelle-t-on les deux ?", "En `impl Point { fn new(x: i32, y: i32) -> Self { … } fn norm(&self) -> f64 { … } }`, ¿cómo se llaman las dos?"],
    a: ["`Point::new(1, 2)`, then `p.norm()`: `new` has no `self`, `norm` is a method", "`Point::new(1, 2)`, puis `p.norm()` : `new` n'a pas de `self`, `norm` est une méthode", "`Point::new(1, 2)`, y luego `p.norm()`: `new` no tiene `self`, `norm` es un método"],
    w: [["`new Point(1, 2)`, then `p.norm()`", "`new Point(1, 2)`, puis `p.norm()`", "`new Point(1, 2)`, y luego `p.norm()`"], ["`p.new(1, 2)`, then `Point::norm()`", "`p.new(1, 2)`, puis `Point::norm()`", "`p.new(1, 2)`, y luego `Point::norm()`"], ["`Point(1, 2)`, then `norm(p)`", "`Point(1, 2)`, puis `norm(p)`", "`Point(1, 2)`, y luego `norm(p)`"]],
    e: [
      "A function without `self` is an associated function, called on the type; `new` is only a convention, not a keyword. `&self` borrows the value the method is called on; `Self` is the type being implemented.",
      "Une fonction sans `self` est une fonction associée, appelée sur le type ; `new` n'est qu'une convention, pas un mot-clé. `&self` emprunte la valeur sur laquelle la méthode est appelée ; `Self` est le type implémenté.",
      "Una función sin `self` es una función asociada, que se llama sobre el tipo; `new` es solo una convención, no una palabra clave. `&self` toma prestado el valor sobre el que se llama el método; `Self` es el tipo que se implementa.",
    ],
  },
];

const panics: RustQuestion[] = [
  {
    id: "rs-panic-01",
    q: ["What does `.unwrap()` do on a `None`?", "Que fait `.unwrap()` sur un `None` ?", "¿Qué hace `.unwrap()` sobre un `None`?"],
    a: ["It panics: the thread stops with a message", "Il panique : le thread s'arrête avec un message", "Provoca un pánico: el hilo se detiene con un mensaje"],
    w: [["It returns 0", "Il renvoie 0", "Devuelve 0"], ["It returns `None` again", "Il renvoie encore `None`", "Devuelve otra vez `None`"], ["Nothing: the line is skipped", "Rien : la ligne est sautée", "Nada: la línea se salta"]],
    e: [
      "`unwrap` says \"I am sure there is a value\"; if not, a panic. Fine in tests and quick scripts; elsewhere, handle the case (`match`, `?`, `unwrap_or`), or use `expect(\"why it cannot be missing\")` to explain.",
      "`unwrap` dit « je suis sûr qu'il y a une valeur » ; sinon, un panic. Très bien dans les tests et les petits scripts ; ailleurs, traiter le cas (`match`, `?`, `unwrap_or`), ou utiliser `expect(\"pourquoi elle ne peut pas manquer\")` pour expliquer.",
      "`unwrap` dice «estoy seguro de que hay un valor»; si no, un pánico. Bien en pruebas y scripts rápidos; en otros sitios, tratar el caso (`match`, `?`, `unwrap_or`), o usar `expect(\"por qué no puede faltar\")` para explicarlo.",
    ],
  },
  {
    id: "rs-panic-02",
    q: ["What does `\"12a\".parse::<i32>()` return?", "Que renvoie `\"12a\".parse::<i32>()` ?", "¿Qué devuelve `\"12a\".parse::<i32>()`?"],
    a: ["An `Err` holding a `ParseIntError`: parsing can fail, so it returns a `Result`", "Un `Err` contenant un `ParseIntError` : l'analyse peut échouer, elle renvoie donc un `Result`", "Un `Err` con un `ParseIntError`: el análisis puede fallar, así que devuelve un `Result`"],
    w: [["12", "12", "12"], ["0", "0", "0"], ["It panics", "Il panique", "Provoca un pánico"]],
    e: [
      "Operations that may fail for ordinary reasons return `Result<T, E>`: `Ok(value)` or `Err(error)`. The `::<i32>` (turbofish) says which type to parse into; `let n: i32 = s.parse()?;` says it through the variable.",
      "Les opérations qui peuvent échouer pour des raisons ordinaires renvoient `Result<T, E>` : `Ok(valeur)` ou `Err(erreur)`. Le `::<i32>` (turbofish) dit en quel type analyser ; `let n: i32 = s.parse()?;` le dit par la variable.",
      "Las operaciones que pueden fallar por motivos corrientes devuelven `Result<T, E>`: `Ok(valor)` o `Err(error)`. El `::<i32>` (turbofish) dice a qué tipo analizar; `let n: i32 = s.parse()?;` lo dice mediante la variable.",
    ],
  },
  {
    id: "rs-panic-03",
    q: ["A `u8` holds 255 and the program adds 1. What happens?", "Un `u8` vaut 255 et le programme ajoute 1. Que se passe-t-il ?", "Un `u8` vale 255 y el programa suma 1. ¿Qué pasa?"],
    a: ["In a debug build, a panic (overflow); in a release build, it wraps to 0", "En build de debug, un panic (dépassement) ; en build de release, il repart à 0", "En compilación de debug, un pánico (desbordamiento); en release, da la vuelta a 0"],
    w: [["It becomes 256", "Il devient 256", "Pasa a ser 256"], ["It stays at 255", "Il reste à 255", "Se queda en 255"], ["Always a compile error", "Toujours une erreur de compilation", "Siempre un error de compilación"]],
    e: [
      "Overflow is a bug, caught in debug builds; release builds skip the check for speed (`overflow-checks` in `Cargo.toml` turns it on). When wrapping or clamping is intended, say so: `wrapping_add`, `saturating_add`, `checked_add`.",
      "Le dépassement est un bug, attrapé en build de debug ; le build de release saute la vérification pour la vitesse (`overflow-checks` dans `Cargo.toml` la réactive). Quand le bouclage ou le plafonnement est voulu, le dire : `wrapping_add`, `saturating_add`, `checked_add`.",
      "El desbordamiento es un fallo, detectado en debug; las compilaciones de release omiten la comprobación por velocidad (`overflow-checks` en `Cargo.toml` la activa). Cuando se quiere dar la vuelta o saturar, decirlo: `wrapping_add`, `saturating_add`, `checked_add`.",
    ],
  },
  {
    id: "rs-panic-04",
    q: ["How do you act on both outcomes of a `Result`?", "Comment agir sur les deux issues d'un `Result` ?", "¿Cómo se actúa sobre los dos resultados de un `Result`?"],
    a: ["`match r { Ok(v) => …, Err(e) => … }`", "`match r { Ok(v) => …, Err(e) => … }`", "`match r { Ok(v) => …, Err(e) => … }`"],
    w: [["`try { … } catch (e) { … }`", "`try { … } catch (e) { … }`", "`try { … } catch (e) { … }`"], ["`if r { … } else { … }`", "`if r { … } else { … }`", "`if r { … } else { … }`"], ["`r.catch(|e| …)`", "`r.catch(|e| …)`", "`r.catch(|e| …)`"]],
    e: [
      "Rust has no exceptions: errors are values, returned and matched like any other. `if let Err(e) = r { … }` handles only the error; the `?` operator passes it up to the caller.",
      "Rust n'a pas d'exceptions : les erreurs sont des valeurs, renvoyées et filtrées comme les autres. `if let Err(e) = r { … }` ne traite que l'erreur ; l'opérateur `?` la remonte à l'appelant.",
      "Rust no tiene excepciones: los errores son valores, devueltos y comparados como cualquier otro. `if let Err(e) = r { … }` solo trata el error; el operador `?` lo pasa al llamador.",
    ],
  },
  {
    id: "rs-panic-05",
    q: ["When is `panic!` the right tool?", "Quand `panic!` est-il le bon outil ?", "¿Cuándo es `panic!` la herramienta adecuada?"],
    a: ["For a bug, a state that should be impossible; not for a missing file or bad input", "Pour un bug, un état qui devrait être impossible ; pas pour un fichier absent ou une saisie invalide", "Para un fallo, un estado que debería ser imposible; no para un archivo ausente o una entrada inválida"],
    w: [["For any error, as an exception", "Pour toute erreur, comme une exception", "Para cualquier error, como una excepción"], ["Never: it is deprecated", "Jamais : il est obsolète", "Nunca: está obsoleto"], ["To stop a loop", "Pour arrêter une boucle", "Para detener un bucle"]],
    e: [
      "Expected failures (I/O, parsing, a user's input) go in a `Result` that the caller can handle. A panic means the program is wrong; it unwinds the thread and, in the main thread, ends the program.",
      "Les échecs prévisibles (E/S, analyse, saisie d'un utilisateur) vont dans un `Result` que l'appelant peut traiter. Un panic signifie que le programme est faux ; il déroule le thread et, dans le thread principal, termine le programme.",
      "Los fallos previsibles (E/S, análisis, entrada de un usuario) van en un `Result` que el llamador puede tratar. Un pánico significa que el programa está mal; deshace el hilo y, en el hilo principal, termina el programa.",
    ],
  },
];

const vectors: RustQuestion[] = [
  {
    id: "rs-vec-01",
    q: ["`let v = vec![1, 2, 3]; v.push(4);`: what happens?", "`let v = vec![1, 2, 3]; v.push(4);` : que se passe-t-il ?", "`let v = vec![1, 2, 3]; v.push(4);`: ¿qué pasa?"],
    a: ["A compile error: `v` must be `let mut` to change", "Une erreur de compilation : `v` doit être `let mut` pour changer", "Un error de compilación: `v` debe ser `let mut` para cambiar"],
    w: [["`v` becomes `[1, 2, 3, 4]`", "`v` devient `[1, 2, 3, 4]`", "`v` pasa a ser `[1, 2, 3, 4]`"], ["A panic: the vector is full", "Un panic : le vecteur est plein", "Un pánico: el vector está lleno"], ["`push` returns a new vector, `v` is unchanged", "`push` renvoie un nouveau vecteur, `v` est inchangé", "`push` devuelve un vector nuevo, `v` no cambia"]],
    e: [
      "`push` takes `&mut self`, so it needs a mutable binding. A `Vec` grows as needed, reallocating its buffer; `Vec::with_capacity(n)` reserves room in advance.",
      "`push` prend `&mut self`, il lui faut donc une liaison mutable. Un `Vec` grandit au besoin en réallouant son tampon ; `Vec::with_capacity(n)` réserve la place d'avance.",
      "`push` toma `&mut self`, así que necesita un enlace mutable. Un `Vec` crece según haga falta, reasignando su búfer; `Vec::with_capacity(n)` reserva espacio por adelantado.",
    ],
  },
  {
    id: "rs-vec-02",
    q: ["With three items, how do `v[10]` and `v.get(10)` differ?", "Avec trois éléments, en quoi `v[10]` et `v.get(10)` diffèrent-ils ?", "Con tres elementos, ¿en qué se diferencian `v[10]` y `v.get(10)`?"],
    a: ["`v[10]` panics; `v.get(10)` returns `None`", "`v[10]` panique ; `v.get(10)` renvoie `None`", "`v[10]` provoca un pánico; `v.get(10)` devuelve `None`"],
    w: [["Both return `None`", "Les deux renvoient `None`", "Los dos devuelven `None`"], ["Both panic", "Les deux paniquent", "Los dos provocan un pánico"], ["`v[10]` returns 0; `v.get(10)` panics", "`v[10]` renvoie 0 ; `v.get(10)` panique", "`v[10]` devuelve 0; `v.get(10)` provoca un pánico"]],
    e: [
      "Indexing is for when the index is known to be valid; `get` for when it may not be, with an `Option<&T>` to handle. `v.first()` and `v.last()` work the same way.",
      "L'indexation sert quand l'indice est sûrement valide ; `get` quand il peut ne pas l'être, avec une `Option<&T>` à traiter. `v.first()` et `v.last()` marchent de la même façon.",
      "La indexación sirve cuando el índice es seguro; `get` cuando puede no serlo, con una `Option<&T>` que tratar. `v.first()` y `v.last()` funcionan igual.",
    ],
  },
  {
    id: "rs-vec-03",
    q: ["After `for x in v { … }`, can `v` still be used?", "Après `for x in v { … }`, peut-on encore utiliser `v` ?", "Tras `for x in v { … }`, ¿se puede seguir usando `v`?"],
    a: ["No: the loop consumed it; `for x in &v` borrows instead", "Non : la boucle l'a consommé ; `for x in &v` emprunte à la place", "No: el bucle lo consumió; `for x in &v` toma prestado en su lugar"],
    w: [["Yes, unchanged", "Oui, inchangé", "Sí, sin cambios"], ["Yes, but empty", "Oui, mais vide", "Sí, pero vacío"], ["Only if it holds integers", "Seulement s'il contient des entiers", "Solo si contiene enteros"]],
    e: [
      "`for x in v` calls `into_iter()` and moves each item out, so `v` is gone. `&v` gives `&T` items, `&mut v` gives `&mut T` to change them in place.",
      "`for x in v` appelle `into_iter()` et sort chaque élément, donc `v` n'existe plus. `&v` donne des éléments `&T`, `&mut v` des `&mut T` pour les modifier sur place.",
      "`for x in v` llama a `into_iter()` y saca cada elemento, así que `v` deja de existir. `&v` da elementos `&T`, `&mut v` da `&mut T` para cambiarlos en su sitio.",
    ],
  },
  {
    id: "rs-vec-04",
    q: ["`let first = &v[0]; v.push(9); println!(\"{}\", first);` does not compile. Why?", "`let first = &v[0]; v.push(9); println!(\"{}\", first);` ne compile pas. Pourquoi ?", "`let first = &v[0]; v.push(9); println!(\"{}\", first);` no compila. ¿Por qué?"],
    a: ["`push` may move the vector's buffer, leaving `first` pointing to freed memory", "`push` peut déplacer le tampon du vecteur, laissant `first` pointer vers de la mémoire libérée", "`push` puede mover el búfer del vector, dejando `first` apuntando a memoria liberada"],
    w: [["`first` is not `mut`", "`first` n'est pas `mut`", "`first` no es `mut`"], ["`v[0]` cannot be borrowed", "`v[0]` ne peut pas être emprunté", "`v[0]` no se puede tomar prestado"], ["`println!` cannot print a reference", "`println!` ne peut pas afficher une référence", "`println!` no puede mostrar una referencia"]],
    e: [
      "While `first` borrows `v`, `v` cannot be borrowed mutably. In C++ this compiles and may read freed memory. Copy the value (`let first = v[0];`) or use `first` before the `push`.",
      "Tant que `first` emprunte `v`, `v` ne peut pas être emprunté de façon mutable. En C++, cela compile et peut lire de la mémoire libérée. Copier la valeur (`let first = v[0];`) ou utiliser `first` avant le `push`.",
      "Mientras `first` toma prestado `v`, `v` no puede tomarse prestado de forma mutable. En C++ esto compila y puede leer memoria liberada. Copiar el valor (`let first = v[0];`) o usar `first` antes del `push`.",
    ],
  },
  {
    id: "rs-vec-05",
    q: ["What does `v.len()` count, and `v.capacity()`?", "Que compte `v.len()`, et `v.capacity()` ?", "¿Qué cuenta `v.len()`, y `v.capacity()`?"],
    a: ["The items in the vector, and how many fit before it must reallocate", "Les éléments du vecteur, et combien tiennent avant qu'il doive réallouer", "Los elementos del vector, y cuántos caben antes de tener que reasignar"],
    w: [["The same number, always", "Le même nombre, toujours", "El mismo número, siempre"], ["Bytes, and items", "Des octets, et des éléments", "Bytes, y elementos"], ["The items, and the largest value", "Les éléments, et la plus grande valeur", "Los elementos, y el mayor valor"]],
    e: [
      "Capacity is at least the length; when it runs out, the vector allocates a larger buffer (usually double) and moves its items. Knowing the size, `Vec::with_capacity(n)` avoids those moves.",
      "La capacité est au moins la longueur ; quand elle est épuisée, le vecteur alloue un tampon plus grand (en général le double) et y déplace ses éléments. Si la taille est connue, `Vec::with_capacity(n)` évite ces déplacements.",
      "La capacidad es al menos la longitud; cuando se agota, el vector asigna un búfer mayor (normalmente el doble) y mueve allí sus elementos. Si se conoce el tamaño, `Vec::with_capacity(n)` evita esos movimientos.",
    ],
  },
];

const cargoBasics: RustQuestion[] = [
  {
    id: "rs-cargo-01",
    q: ["What does `cargo new hello` create?", "Que crée `cargo new hello` ?", "¿Qué crea `cargo new hello`?"],
    a: ["A folder with `Cargo.toml`, `src/main.rs` printing Hello, world, and a git repository", "Un dossier avec `Cargo.toml`, un `src/main.rs` qui affiche Hello, world, et un dépôt git", "Una carpeta con `Cargo.toml`, un `src/main.rs` que muestra Hello, world, y un repositorio git"],
    w: [["A compiled program called `hello`", "Un programme compilé appelé `hello`", "Un programa compilado llamado `hello`"], ["An empty file `hello.rs`", "Un fichier vide `hello.rs`", "Un archivo vacío `hello.rs`"], ["An account on crates.io", "Un compte sur crates.io", "Una cuenta en crates.io"]],
    e: [
      "`Cargo.toml` describes the package: name, version, edition, dependencies. `cargo new --lib` makes a library with `src/lib.rs`. `cargo init` does the same in an existing folder.",
      "`Cargo.toml` décrit le paquet : nom, version, édition, dépendances. `cargo new --lib` fait une bibliothèque avec `src/lib.rs`. `cargo init` fait de même dans un dossier existant.",
      "`Cargo.toml` describe el paquete: nombre, versión, edición, dependencias. `cargo new --lib` crea una biblioteca con `src/lib.rs`. `cargo init` hace lo mismo en una carpeta existente.",
    ],
  },
  {
    id: "rs-cargo-02",
    q: ["`cargo build` or `cargo build --release`: what changes?", "`cargo build` ou `cargo build --release` : qu'est-ce qui change ?", "`cargo build` o `cargo build --release`: ¿qué cambia?"],
    a: ["Release optimizes (slower to build, much faster to run) and goes to `target/release`; debug to `target/debug`", "Release optimise (plus lent à compiler, bien plus rapide à exécuter) et va dans `target/release` ; debug dans `target/debug`", "Release optimiza (más lento de compilar, mucho más rápido al ejecutar) y va a `target/release`; debug a `target/debug`"],
    w: [["Release removes all safety checks", "Release retire toutes les vérifications de sécurité", "Release quita todas las comprobaciones de seguridad"], ["Nothing: it only changes the file name", "Rien : ça change seulement le nom du fichier", "Nada: solo cambia el nombre del archivo"], ["Release uploads the program to crates.io", "Release envoie le programme sur crates.io", "Release sube el programa a crates.io"]],
    e: [
      "Measure speed in release builds only: debug builds can be ten times slower. Bounds checks stay in both; integer overflow checks are on in debug only. `cargo run --release` builds and runs.",
      "Mesurer la vitesse en release uniquement : un build de debug peut être dix fois plus lent. Les vérifications de bornes restent dans les deux ; celles de dépassement d'entier ne sont actives qu'en debug. `cargo run --release` compile et lance.",
      "Medir la velocidad solo en release: una compilación de debug puede ser diez veces más lenta. Las comprobaciones de límites siguen en ambas; las de desbordamiento de enteros solo en debug. `cargo run --release` compila y ejecuta.",
    ],
  },
  {
    id: "rs-cargo-03",
    q: ["What is `cargo check` for?", "À quoi sert `cargo check` ?", "¿Para qué sirve `cargo check`?"],
    a: ["Checking that the code compiles, without producing a program: much faster while writing", "Vérifier que le code compile, sans produire de programme : bien plus rapide pendant l'écriture", "Comprobar que el código compila, sin producir un programa: mucho más rápido mientras se escribe"],
    w: [["Running the tests", "Lancer les tests", "Ejecutar las pruebas"], ["Checking for newer versions of the dependencies", "Chercher des versions plus récentes des dépendances", "Buscar versiones más nuevas de las dependencias"], ["Formatting the code", "Formater le code", "Dar formato al código"]],
    e: [
      "It runs the type and borrow checks and skips code generation. Tests run with `cargo test`, formatting with `cargo fmt`, lints with `cargo clippy`. Editors run the same analysis through rust-analyzer.",
      "Il fait les vérifications de types et d'emprunts et saute la génération de code. Les tests se lancent avec `cargo test`, le formatage avec `cargo fmt`, les lints avec `cargo clippy`. Les éditeurs font la même analyse via rust-analyzer.",
      "Hace las comprobaciones de tipos y préstamos y omite la generación de código. Las pruebas se lanzan con `cargo test`, el formato con `cargo fmt`, los lints con `cargo clippy`. Los editores hacen el mismo análisis con rust-analyzer.",
    ],
  },
  {
    id: "rs-cargo-04",
    q: ["How is Rust usually installed and updated?", "Comment installe-t-on et met-on à jour Rust, d'habitude ?", "¿Cómo se suele instalar y actualizar Rust?"],
    a: ["With rustup: the installer from rustup.rs, then `rustup update`", "Avec rustup : l'installeur de rustup.rs, puis `rustup update`", "Con rustup: el instalador de rustup.rs, y luego `rustup update`"],
    w: [["With `cargo install rust`", "Avec `cargo install rust`", "Con `cargo install rust`"], ["Only from the Linux distribution's packages", "Seulement depuis les paquets de la distribution Linux", "Solo desde los paquetes de la distribución Linux"], ["By downloading `rustc` from crates.io", "En téléchargeant `rustc` sur crates.io", "Descargando `rustc` de crates.io"]],
    e: [
      "rustup manages toolchains (stable, beta, nightly), targets for cross-compiling, and components such as `clippy` and `rustfmt`. A new stable Rust comes out every six weeks. Distribution packages (`apt install rustc`) work but lag behind.",
      "rustup gère les chaînes d'outils (stable, beta, nightly), les cibles de compilation croisée et des composants comme `clippy` et `rustfmt`. Une nouvelle version stable sort toutes les six semaines. Les paquets des distributions (`apt install rustc`) marchent mais ont du retard.",
      "rustup gestiona las cadenas de herramientas (stable, beta, nightly), los destinos de compilación cruzada y componentes como `clippy` y `rustfmt`. Sale una versión estable nueva cada seis semanas. Los paquetes de las distribuciones (`apt install rustc`) funcionan pero van con retraso.",
    ],
  },
  {
    id: "rs-cargo-05",
    q: ["How do you add the `rand` crate to a project, and what does `Cargo.lock` do?", "Comment ajouter le crate `rand` à un projet, et à quoi sert `Cargo.lock` ?", "¿Cómo se añade el crate `rand` a un proyecto, y para qué sirve `Cargo.lock`?"],
    a: ["`cargo add rand` adds it to `Cargo.toml`; `Cargo.lock` records the exact versions resolved, so builds repeat", "`cargo add rand` l'ajoute à `Cargo.toml` ; `Cargo.lock` note les versions exactes retenues, pour des builds reproductibles", "`cargo add rand` lo añade a `Cargo.toml`; `Cargo.lock` anota las versiones exactas elegidas, para compilaciones repetibles"],
    w: [["`npm install rand`; `Cargo.lock` locks the folder", "`npm install rand` ; `Cargo.lock` verrouille le dossier", "`npm install rand`; `Cargo.lock` bloquea la carpeta"], ["Copy its source into `src`; `Cargo.lock` lists the authors", "Copier sa source dans `src` ; `Cargo.lock` liste les auteurs", "Copiar su código en `src`; `Cargo.lock` lista los autores"], ["`use rand;` is enough; `Cargo.lock` is a cache to delete", "`use rand;` suffit ; `Cargo.lock` est un cache à supprimer", "`use rand;` basta; `Cargo.lock` es una caché que hay que borrar"]],
    e: [
      "`Cargo.toml` states ranges (`rand = \"0.9\"`); `Cargo.lock` pins what was chosen, and is committed for programs. `cargo update` moves to newer versions within the ranges. Crates come from crates.io.",
      "`Cargo.toml` donne des plages (`rand = \"0.9\"`) ; `Cargo.lock` fige ce qui a été choisi, et se versionne pour les programmes. `cargo update` passe à des versions plus récentes dans les plages. Les crates viennent de crates.io.",
      "`Cargo.toml` indica rangos (`rand = \"0.9\"`); `Cargo.lock` fija lo elegido, y se versiona en los programas. `cargo update` pasa a versiones más nuevas dentro de los rangos. Los crates vienen de crates.io.",
    ],
  },
];

export const basics = { variables, types, control };
export const ownership = { moves };
export const typesTopic = { structsEnums };
export const errors = { panics };
export const collections = { vectors };
export const cargo = { cargoBasics };
