/**
 * Rust, Intermédiaire: strings and numbers, borrowing, traits and generics,
 * propagating errors, iterators and maps, threads, modules and tests.
 */
import type { LinuxQuestion as RustQuestion } from "../linux/types";

const strings: RustQuestion[] = [
  {
    id: "rs-str-01",
    q: ["What separates `String` from `&str`?", "Qu'est-ce qui distingue `String` de `&str` ?", "¿Qué diferencia `String` de `&str`?"],
    a: ["`String` owns a growable buffer; `&str` borrows a slice of text from somewhere else", "`String` possède un tampon qui peut grandir ; `&str` emprunte une tranche de texte située ailleurs", "`String` posee un búfer que puede crecer; `&str` toma prestado un trozo de texto que está en otro sitio"],
    w: [["`&str` is the faster `String`, otherwise the same", "`&str` est la `String` rapide, sinon pareille", "`&str` es el `String` rápido, por lo demás igual"], ["`String` is ASCII, `&str` is Unicode", "`String` est en ASCII, `&str` en Unicode", "`String` está en ASCII, `&str` en Unicode"], ["`&str` can only hold literals", "`&str` ne peut contenir que des littéraux", "`&str` solo puede contener literales"]],
    e: [
      "Both are UTF-8. A literal is a `&'static str` stored in the program; `&my_string` and `&my_string[2..5]` are `&str` views into a `String`. A function that only reads text takes `&str`, which accepts both.",
      "Les deux sont en UTF-8. Un littéral est un `&'static str` stocké dans le programme ; `&my_string` et `&my_string[2..5]` sont des vues `&str` sur une `String`. Une fonction qui ne fait que lire du texte prend `&str`, qui accepte les deux.",
      "Los dos están en UTF-8. Un literal es un `&'static str` guardado en el programa; `&my_string` y `&my_string[2..5]` son vistas `&str` de un `String`. Una función que solo lee texto toma `&str`, que acepta ambos.",
    ],
  },
  {
    id: "rs-str-02",
    q: ["Why does `let c = s[0];` not compile on a `String`?", "Pourquoi `let c = s[0];` ne compile-t-il pas sur une `String` ?", "¿Por qué `let c = s[0];` no compila sobre un `String`?"],
    a: ["Text is UTF-8: byte 0 is not always a character; use `s.chars().next()` or `s.as_bytes()[0]`", "Le texte est en UTF-8 : l'octet 0 n'est pas toujours un caractère ; utiliser `s.chars().next()` ou `s.as_bytes()[0]`", "El texto está en UTF-8: el byte 0 no siempre es un carácter; usar `s.chars().next()` o `s.as_bytes()[0]`"],
    w: [["Strings start at index 1", "Les chaînes commencent à l'indice 1", "Las cadenas empiezan en el índice 1"], ["`s` must be `mut` to be read", "`s` doit être `mut` pour être lue", "`s` debe ser `mut` para leerse"], ["Indexing a string needs `unsafe`", "Indexer une chaîne demande `unsafe`", "Indexar una cadena requiere `unsafe`"]],
    e: [
      "Rust refuses an operation that would look O(1) and correct but be neither for non-ASCII text. You choose what you mean: bytes, `chars()` (Unicode scalar values), or grapheme clusters with the `unicode-segmentation` crate.",
      "Rust refuse une opération qui semblerait en O(1) et correcte mais ne serait ni l'un ni l'autre pour un texte non ASCII. On choisit ce qu'on veut : octets, `chars()` (valeurs scalaires Unicode), ou graphèmes avec le crate `unicode-segmentation`.",
      "Rust rechaza una operación que parecería O(1) y correcta pero no sería ninguna de las dos con texto no ASCII. Se elige lo que se quiere: bytes, `chars()` (valores escalares Unicode), o grafemas con el crate `unicode-segmentation`.",
    ],
  },
  {
    id: "rs-str-03",
    q: ["What does `&s[0..1]` do when `s` is `\"élan\"`?", "Que fait `&s[0..1]` quand `s` vaut `\"élan\"` ?", "¿Qué hace `&s[0..1]` cuando `s` vale `\"élan\"`?"],
    a: ["It panics: byte 1 is in the middle of é, which takes 2 bytes", "Il panique : l'octet 1 est au milieu de é, qui en prend 2", "Provoca un pánico: el byte 1 está en medio de é, que ocupa 2"],
    w: [["It gives `\"é\"`", "Il donne `\"é\"`", "Da `\"é\"`"], ["It gives `\"e\"`", "Il donne `\"e\"`", "Da `\"e\"`"], ["It gives half of é, an invalid character", "Il donne la moitié de é, un caractère invalide", "Da la mitad de é, un carácter inválido"]],
    e: [
      "Slices of `str` are in bytes and must fall on character boundaries, so a `str` is always valid UTF-8. `s.get(0..1)` returns `None` instead of panicking; `s.char_indices()` gives the boundaries.",
      "Les tranches de `str` sont en octets et doivent tomber sur des limites de caractères : un `str` est toujours de l'UTF-8 valide. `s.get(0..1)` renvoie `None` au lieu de paniquer ; `s.char_indices()` donne les limites.",
      "Los cortes de `str` son en bytes y deben caer en límites de carácter, así que un `str` siempre es UTF-8 válido. `s.get(0..1)` devuelve `None` en vez de provocar un pánico; `s.char_indices()` da los límites.",
    ],
  },
  {
    id: "rs-str-04",
    q: ["After `let s3 = s1 + &s2;` with two `String`s, which can still be used?", "Après `let s3 = s1 + &s2;` avec deux `String`, lesquelles restent utilisables ?", "Tras `let s3 = s1 + &s2;` con dos `String`, ¿cuáles se pueden seguir usando?"],
    a: ["`s2` and `s3`: `+` took `s1` by value and reused its buffer", "`s2` et `s3` : `+` a pris `s1` par valeur et réutilisé son tampon", "`s2` y `s3`: `+` tomó `s1` por valor y reutilizó su búfer"],
    w: [["All three", "Les trois", "Las tres"], ["Only `s3`", "Seulement `s3`", "Solo `s3`"], ["`s1` and `s3`", "`s1` et `s3`", "`s1` y `s3`"]],
    e: [
      "`+` on `String` is `fn add(self, other: &str) -> String`: it consumes the left side and appends to it. `format!(\"{s1}{s2}\")` borrows both and is easier to read with several pieces.",
      "`+` sur `String` est `fn add(self, other: &str) -> String` : il consomme la partie gauche et ajoute à la suite. `format!(\"{s1}{s2}\")` emprunte les deux et se lit mieux avec plusieurs morceaux.",
      "`+` sobre `String` es `fn add(self, other: &str) -> String`: consume el lado izquierdo y añade a continuación. `format!(\"{s1}{s2}\")` toma prestados los dos y se lee mejor con varias piezas.",
    ],
  },
  {
    id: "rs-str-05",
    q: ["What does `format!(\"{name} has {n:>3} points\")` do?", "Que fait `format!(\"{name} has {n:>3} points\")` ?", "¿Qué hace `format!(\"{name} has {n:>3} points\")`?"],
    a: ["Builds a `String` from the variables `name` and `n`, `n` right-aligned on 3 characters", "Construit une `String` avec les variables `name` et `n`, `n` aligné à droite sur 3 caractères", "Construye un `String` con las variables `name` y `n`, `n` alineado a la derecha en 3 caracteres"],
    w: [["Prints the text on the screen", "Affiche le texte à l'écran", "Muestra el texto en pantalla"], ["Returns the literal text with the braces", "Renvoie le texte littéral avec les accolades", "Devuelve el texto literal con las llaves"], ["Fails: variables must be passed after the text", "Échoue : les variables doivent être passées après le texte", "Falla: las variables deben pasarse después del texto"]],
    e: [
      "`format!` returns a `String`; `println!` prints the same thing. Variables can be named inside the braces (since Rust 1.58); expressions still go after the text: `format!(\"{}\", a + b)`. The format string is checked at compile time.",
      "`format!` renvoie une `String` ; `println!` affiche la même chose. Les variables peuvent être nommées dans les accolades (depuis Rust 1.58) ; les expressions vont toujours après le texte : `format!(\"{}\", a + b)`. La chaîne de format est vérifiée à la compilation.",
      "`format!` devuelve un `String`; `println!` muestra lo mismo. Las variables pueden nombrarse dentro de las llaves (desde Rust 1.58); las expresiones siguen yendo después del texto: `format!(\"{}\", a + b)`. La cadena de formato se comprueba al compilar.",
    ],
  },
];

const numbers: RustQuestion[] = [
  {
    id: "rs-num-01",
    q: ["`let a: i32 = 1; let b: i64 = 2; let c = a + b;`: what happens?", "`let a: i32 = 1; let b: i64 = 2; let c = a + b;` : que se passe-t-il ?", "`let a: i32 = 1; let b: i64 = 2; let c = a + b;`: ¿qué pasa?"],
    a: ["A compile error: no implicit widening; write `i64::from(a) + b`", "Une erreur de compilation : pas d'élargissement implicite ; écrire `i64::from(a) + b`", "Un error de compilación: no hay ensanchamiento implícito; escribir `i64::from(a) + b`"],
    w: [["`c` is an `i64` worth 3", "`c` est un `i64` qui vaut 3", "`c` es un `i64` que vale 3"], ["`c` is an `i32` worth 3", "`c` est un `i32` qui vaut 3", "`c` es un `i32` que vale 3"], ["A panic at run time", "Un panic à l'exécution", "Un pánico al ejecutar"]],
    e: [
      "Arithmetic needs both sides of the same type. `From` covers conversions that never lose anything (`i32` to `i64`); `TryFrom` the others (`i64` to `i32` returns a `Result`); `as` converts anything, silently.",
      "L'arithmétique veut les deux côtés du même type. `From` couvre les conversions qui ne perdent jamais rien (`i32` vers `i64`) ; `TryFrom` les autres (`i64` vers `i32` renvoie un `Result`) ; `as` convertit tout, en silence.",
      "La aritmética exige los dos lados del mismo tipo. `From` cubre las conversiones que nunca pierden nada (`i32` a `i64`); `TryFrom` las demás (`i64` a `i32` devuelve un `Result`); `as` convierte cualquier cosa, en silencio.",
    ],
  },
  {
    id: "rs-num-02",
    q: ["What does `u8::try_from(300)` return?", "Que renvoie `u8::try_from(300)` ?", "¿Qué devuelve `u8::try_from(300)`?"],
    a: ["An `Err`: 300 does not fit in a `u8`", "Un `Err` : 300 ne tient pas dans un `u8`", "Un `Err`: 300 no cabe en un `u8`"],
    w: [["`Ok(44)`", "`Ok(44)`", "`Ok(44)`"], ["`Ok(255)`", "`Ok(255)`", "`Ok(255)`"], ["It panics", "Il panique", "Provoca un pánico"]],
    e: [
      "`300 as u8` gives 44 (the low 8 bits) without a word; `try_from` checks and lets you decide. Prefer it whenever the value comes from outside.",
      "`300 as u8` donne 44 (les 8 bits de poids faible) sans rien dire ; `try_from` vérifie et laisse décider. Le préférer dès que la valeur vient de l'extérieur.",
      "`300 as u8` da 44 (los 8 bits bajos) sin avisar; `try_from` comprueba y deja decidir. Preferirlo siempre que el valor venga de fuera.",
    ],
  },
  {
    id: "rs-num-03",
    q: ["Why does `v.sort()` not compile on a `Vec<f64>`?", "Pourquoi `v.sort()` ne compile-t-il pas sur un `Vec<f64>` ?", "¿Por qué `v.sort()` no compila sobre un `Vec<f64>`?"],
    a: ["`f64` is not `Ord`: NaN is not comparable; use `v.sort_by(f64::total_cmp)`", "`f64` n'est pas `Ord` : NaN n'est pas comparable ; utiliser `v.sort_by(f64::total_cmp)`", "`f64` no es `Ord`: NaN no es comparable; usar `v.sort_by(f64::total_cmp)`"],
    w: [["Floats cannot be stored in a `Vec`", "Les flottants ne se stockent pas dans un `Vec`", "Los flotantes no se guardan en un `Vec`"], ["`sort` needs `mut`, nothing else", "`sort` demande `mut`, rien d'autre", "`sort` necesita `mut`, nada más"], ["`sort` only works on strings", "`sort` ne marche que sur des chaînes", "`sort` solo funciona con cadenas"]],
    e: [
      "`NaN == NaN` is false and `NaN < x` too, so floats are only `PartialOrd`. `total_cmp` defines a full order (NaNs at the ends). The same reason keeps `f64` out of `HashMap` keys.",
      "`NaN == NaN` est faux, et `NaN < x` aussi : les flottants ne sont que `PartialOrd`. `total_cmp` définit un ordre total (les NaN aux extrémités). La même raison exclut `f64` des clés de `HashMap`.",
      "`NaN == NaN` es falso, y `NaN < x` también: los flotantes solo son `PartialOrd`. `total_cmp` define un orden total (los NaN en los extremos). Por la misma razón `f64` no puede ser clave de un `HashMap`.",
    ],
  },
  {
    id: "rs-num-04",
    q: ["What does `250u8.checked_add(10)` return?", "Que renvoie `250u8.checked_add(10)` ?", "¿Qué devuelve `250u8.checked_add(10)`?"],
    a: ["`None`, since the result would overflow", "`None`, puisque le résultat déborderait", "`None`, ya que el resultado desbordaría"],
    w: [["`Some(4)`", "`Some(4)`", "`Some(4)`"], ["`Some(255)`", "`Some(255)`", "`Some(255)`"], ["It panics", "Il panique", "Provoca un pánico"]],
    e: [
      "Each integer type has `checked_*` (an `Option`), `wrapping_*` (modulo), `saturating_*` (clamped) and `overflowing_*` (the result and a flag). They behave the same in debug and release builds.",
      "Chaque type entier a `checked_*` (une `Option`), `wrapping_*` (modulo), `saturating_*` (plafonné) et `overflowing_*` (le résultat et un indicateur). Ils se comportent pareil en debug et en release.",
      "Cada tipo entero tiene `checked_*` (una `Option`), `wrapping_*` (módulo), `saturating_*` (limitado) y `overflowing_*` (el resultado y un indicador). Se comportan igual en debug y en release.",
    ],
  },
  {
    id: "rs-num-05",
    q: ["What does `0.1 + 0.2 == 0.3` give in Rust?", "Que donne `0.1 + 0.2 == 0.3` en Rust ?", "¿Qué da `0.1 + 0.2 == 0.3` en Rust?"],
    a: ["`false`, as in every language with binary floating point", "`false`, comme dans tout langage à virgule flottante binaire", "`false`, como en todo lenguaje con coma flotante binaria"],
    w: [["`true`: Rust rounds floats exactly", "`true` : Rust arrondit les flottants exactement", "`true`: Rust redondea los flotantes con exactitud"], ["A compile error", "Une erreur de compilation", "Un error de compilación"], ["`true` in release, `false` in debug", "`true` en release, `false` en debug", "`true` en release, `false` en debug"]],
    e: [
      "0.1 has no exact binary form. Compare with a tolerance, `(a - b).abs() < 1e-9`, or use integers (cents) or a decimal crate (`rust_decimal`) for money. Clippy warns about `==` on floats.",
      "0,1 n'a pas de forme binaire exacte. Comparer avec une tolérance, `(a - b).abs() < 1e-9`, ou utiliser des entiers (centimes) ou un crate décimal (`rust_decimal`) pour l'argent. Clippy avertit des `==` sur les flottants.",
      "0,1 no tiene forma binaria exacta. Comparar con una tolerancia, `(a - b).abs() < 1e-9`, o usar enteros (céntimos) o un crate decimal (`rust_decimal`) para el dinero. Clippy avisa de los `==` entre flotantes.",
    ],
  },
];

const borrowing: RustQuestion[] = [
  {
    id: "rs-borrow-01",
    q: ["What are the borrowing rules?", "Quelles sont les règles d'emprunt ?", "¿Cuáles son las reglas de préstamo?"],
    a: ["At any time, either any number of `&T` or exactly one `&mut T`, and a reference never outlives its value", "À tout moment, soit autant de `&T` qu'on veut, soit exactement un `&mut T`, et une référence ne survit jamais à sa valeur", "En todo momento, o cuantos `&T` se quiera o exactamente un `&mut T`, y una referencia nunca sobrevive a su valor"],
    w: [["One `&T` and one `&mut T` at most", "Un `&T` et un `&mut T` au plus", "Un `&T` y un `&mut T` como mucho"], ["Any number of each, if the code is single-threaded", "Autant de chaque qu'on veut, si le code n'a qu'un thread", "Cuantos se quiera de cada uno, si el código tiene un solo hilo"], ["Only one reference of any kind at a time", "Une seule référence de n'importe quel type à la fois", "Una sola referencia de cualquier tipo a la vez"]],
    e: [
      "Shared or exclusive, never both: this rules out data races, and iterator invalidation in a single thread too. The compiler checks it; there is no cost at run time.",
      "Partagé ou exclusif, jamais les deux : cela exclut les courses de données, et l'invalidation d'itérateurs même avec un seul thread. Le compilateur le vérifie ; aucun coût à l'exécution.",
      "Compartido o exclusivo, nunca ambos: esto descarta las carreras de datos, y también la invalidación de iteradores en un solo hilo. El compilador lo comprueba; no cuesta nada al ejecutar.",
    ],
  },
  {
    id: "rs-borrow-02",
    q: ["`let r = &mut s; r.push('!'); let t = &s; println!(\"{t}\");` compiles. Why is `r` no problem?", "`let r = &mut s; r.push('!'); let t = &s; println!(\"{t}\");` compile. Pourquoi `r` ne gêne-t-il pas ?", "`let r = &mut s; r.push('!'); let t = &s; println!(\"{t}\");` compila. ¿Por qué `r` no molesta?"],
    a: ["A borrow lasts until its last use, not to the end of the block: `r` is finished before `t`", "Un emprunt dure jusqu'à sa dernière utilisation, pas jusqu'à la fin du bloc : `r` est fini avant `t`", "Un préstamo dura hasta su último uso, no hasta el final del bloque: `r` ha terminado antes que `t`"],
    w: [["`push` ends every borrow", "`push` met fin à tous les emprunts", "`push` termina todos los préstamos"], ["`&s` copies `s`", "`&s` copie `s`", "`&s` copia `s`"], ["Mutable and shared borrows may overlap in one function", "Emprunts mutables et partagés peuvent se chevaucher dans une fonction", "Los préstamos mutables y compartidos pueden solaparse en una función"]],
    e: [
      "Non-lexical lifetimes (2018): the compiler ends a borrow where it is last used. Using `r` again after `t` was taken would be the error.",
      "Les durées de vie non lexicales (2018) : le compilateur termine un emprunt là où il sert pour la dernière fois. Réutiliser `r` après avoir pris `t` serait l'erreur.",
      "Los tiempos de vida no léxicos (2018): el compilador termina un préstamo donde se usa por última vez. Volver a usar `r` después de tomar `t` sería el error.",
    ],
  },
  {
    id: "rs-borrow-03",
    q: ["Why is `fn make() -> &String { let s = String::new(); &s }` refused?", "Pourquoi `fn make() -> &String { let s = String::new(); &s }` est-il refusé ?", "¿Por qué se rechaza `fn make() -> &String { let s = String::new(); &s }`?"],
    a: ["`s` is freed at the end of `make`: the reference would dangle; return the `String` itself", "`s` est libérée à la fin de `make` : la référence pendrait dans le vide ; renvoyer la `String` elle-même", "`s` se libera al final de `make`: la referencia quedaría colgando; devolver el propio `String`"],
    w: [["Functions cannot return references", "Les fonctions ne peuvent pas renvoyer de références", "Las funciones no pueden devolver referencias"], ["`s` must be `mut`", "`s` doit être `mut`", "`s` debe ser `mut`"], ["`String::new()` cannot be borrowed", "`String::new()` ne peut pas être emprunté", "`String::new()` no se puede tomar prestado"]],
    e: [
      "A returned reference must point to something that outlives the call: an argument, or static data. The compiler first asks for a lifetime, then reports that the function returns a reference to a local value. Returning `String` moves it to the caller.",
      "Une référence renvoyée doit pointer vers quelque chose qui survit à l'appel : un argument, ou une donnée statique. Le compilateur demande d'abord une durée de vie, puis signale que la fonction renvoie une référence à une valeur locale. Renvoyer `String` la déplace chez l'appelant.",
      "Una referencia devuelta debe apuntar a algo que sobreviva a la llamada: un argumento, o datos estáticos. El compilador pide primero un tiempo de vida, y luego indica que la función devuelve una referencia a un valor local. Devolver `String` lo mueve al llamador.",
    ],
  },
  {
    id: "rs-borrow-04",
    q: ["What is `&v[1..3]` for a `Vec<i32>`?", "Qu'est-ce que `&v[1..3]` pour un `Vec<i32>` ?", "¿Qué es `&v[1..3]` para un `Vec<i32>`?"],
    a: ["A slice `&[i32]` borrowing items 1 and 2, without copying", "Une tranche `&[i32]` qui emprunte les éléments 1 et 2, sans copie", "Un corte `&[i32]` que toma prestados los elementos 1 y 2, sin copiar"],
    w: [["A new `Vec` with items 1, 2 and 3", "Un nouveau `Vec` avec les éléments 1, 2 et 3", "Un `Vec` nuevo con los elementos 1, 2 y 3"], ["A reference to item 3", "Une référence à l'élément 3", "Una referencia al elemento 3"], ["A copy of items 1 to 3", "Une copie des éléments 1 à 3", "Una copia de los elementos 1 a 3"]],
    e: [
      "A slice is a pointer and a length. A function taking `&[i32]` works with arrays, vectors and parts of them; `.to_vec()` makes an owned copy when needed.",
      "Une tranche est un pointeur et une longueur. Une fonction qui prend `&[i32]` marche avec les tableaux, les vecteurs et leurs parties ; `.to_vec()` fait une copie possédée au besoin.",
      "Un corte es un puntero y una longitud. Una función que toma `&[i32]` funciona con arrays, vectores y partes de ellos; `.to_vec()` hace una copia propia cuando hace falta.",
    ],
  },
  {
    id: "rs-borrow-05",
    q: ["A method takes `self` instead of `&self`. What does it mean for the caller?", "Une méthode prend `self` au lieu de `&self`. Qu'est-ce que cela veut dire pour l'appelant ?", "Un método toma `self` en lugar de `&self`. ¿Qué significa para quien lo llama?"],
    a: ["The value is moved into the method: it cannot be used after the call (unless `Copy`)", "La valeur est déplacée dans la méthode : elle n'est plus utilisable après l'appel (sauf si `Copy`)", "El valor se mueve al método: no se puede usar tras la llamada (salvo si es `Copy`)"],
    w: [["Nothing: `self` and `&self` are the same", "Rien : `self` et `&self` sont pareils", "Nada: `self` y `&self` son lo mismo"], ["The method can only read the value", "La méthode ne peut que lire la valeur", "El método solo puede leer el valor"], ["The method is static", "La méthode est statique", "El método es estático"]],
    e: [
      "`&self` reads, `&mut self` changes, `self` consumes: converting (`into_iter`, `into_bytes`) or finishing (a builder's `build`). The receiver tells what happens to the value.",
      "`&self` lit, `&mut self` modifie, `self` consomme : pour convertir (`into_iter`, `into_bytes`) ou terminer (le `build` d'un builder). Le récepteur dit ce qu'il advient de la valeur.",
      "`&self` lee, `&mut self` modifica, `self` consume: para convertir (`into_iter`, `into_bytes`) o terminar (el `build` de un builder). El receptor dice qué le pasa al valor.",
    ],
  },
];

const traits: RustQuestion[] = [
  {
    id: "rs-trait-01",
    q: ["You implement `Display` for `Point`. What do you get with it?", "Vous implémentez `Display` pour `Point`. Qu'obtenez-vous avec ?", "Implementa `Display` para `Point`. ¿Qué obtiene con ello?"],
    a: ["`{}` in format strings, and `p.to_string()`", "`{}` dans les chaînes de format, et `p.to_string()`", "`{}` en las cadenas de formato, y `p.to_string()`"],
    w: [["`{:?}` only", "`{:?}` seulement", "Solo `{:?}`"], ["Comparison with `==`", "La comparaison avec `==`", "La comparación con `==`"], ["Nothing else: `to_string` must be written too", "Rien d'autre : `to_string` doit aussi être écrite", "Nada más: también hay que escribir `to_string`"]],
    e: [
      "The standard library has a blanket implementation: every type that is `Display` gets `ToString`. One trait written, two features. `==` comes from `PartialEq`, `{:?}` from `Debug`.",
      "La bibliothèque standard a une implémentation générale : tout type `Display` reçoit `ToString`. Un trait écrit, deux fonctions. `==` vient de `PartialEq`, `{:?}` de `Debug`.",
      "La biblioteca estándar tiene una implementación general: todo tipo `Display` recibe `ToString`. Un trait escrito, dos funciones. `==` viene de `PartialEq`, `{:?}` de `Debug`.",
    ],
  },
  {
    id: "rs-trait-02",
    q: ["Why does `fn largest<T>(v: &[T]) -> &T` fail when it compares items with `>`?", "Pourquoi `fn largest<T>(v: &[T]) -> &T` échoue-t-il quand il compare des éléments avec `>` ?", "¿Por qué falla `fn largest<T>(v: &[T]) -> &T` cuando compara elementos con `>`?"],
    a: ["`T` could be any type; the bound `T: PartialOrd` says it can be compared", "`T` pourrait être n'importe quel type ; la contrainte `T: PartialOrd` dit qu'il se compare", "`T` podría ser cualquier tipo; la restricción `T: PartialOrd` dice que se puede comparar"],
    w: [["Generic functions cannot compare", "Les fonctions génériques ne comparent pas", "Las funciones genéricas no comparan"], ["`>` only works on numbers", "`>` ne marche que sur les nombres", "`>` solo funciona con números"], ["It needs `T: Copy`, nothing else", "Il faut `T: Copy`, rien d'autre", "Necesita `T: Copy`, nada más"]],
    e: [
      "A generic body can only use what its bounds promise; the check happens once, at the definition. Each concrete type then gets its own compiled copy (monomorphization), as fast as handwritten code.",
      "Le corps d'une fonction générique ne peut utiliser que ce que ses contraintes promettent ; la vérification a lieu une fois, à la définition. Chaque type concret reçoit ensuite sa propre copie compilée (monomorphisation), aussi rapide que du code écrit à la main.",
      "El cuerpo genérico solo puede usar lo que prometen sus restricciones; la comprobación se hace una vez, en la definición. Luego cada tipo concreto recibe su propia copia compilada (monomorfización), tan rápida como código escrito a mano.",
    ],
  },
  {
    id: "rs-trait-03",
    q: ["Why does `#[derive(Clone, Copy)]` fail on `struct User { name: String, age: u32 }`?", "Pourquoi `#[derive(Clone, Copy)]` échoue-t-il sur `struct User { name: String, age: u32 }` ?", "¿Por qué falla `#[derive(Clone, Copy)]` sobre `struct User { name: String, age: u32 }`?"],
    a: ["`Copy` needs every field to be `Copy`, and `String` owns heap memory; derive `Clone` only", "`Copy` exige que chaque champ soit `Copy`, et `String` possède de la mémoire sur le tas ; ne dériver que `Clone`", "`Copy` exige que cada campo sea `Copy`, y `String` posee memoria en el montón; derivar solo `Clone`"],
    w: [["`Clone` and `Copy` cannot be derived together", "`Clone` et `Copy` ne se dérivent pas ensemble", "`Clone` y `Copy` no se derivan juntos"], ["Structs can never be `Copy`", "Les structs ne peuvent jamais être `Copy`", "Las structs nunca pueden ser `Copy`"], ["`u32` is not `Copy`", "`u32` n'est pas `Copy`", "`u32` no es `Copy`"]],
    e: [
      "`Copy` means a bitwise copy is a correct copy; with a `String` inside, two copies would free the same buffer. `Copy` also requires `Clone`. A struct of numbers can derive both.",
      "`Copy` veut dire qu'une copie bit à bit est une copie correcte ; avec une `String` dedans, deux copies libéreraient le même tampon. `Copy` exige aussi `Clone`. Une struct de nombres peut dériver les deux.",
      "`Copy` significa que una copia bit a bit es una copia correcta; con un `String` dentro, dos copias liberarían el mismo búfer. `Copy` también exige `Clone`. Una struct de números puede derivar los dos.",
    ],
  },
  {
    id: "rs-trait-04",
    q: ["What does `fn evens(n: u32) -> impl Iterator<Item = u32>` promise?", "Que promet `fn evens(n: u32) -> impl Iterator<Item = u32>` ?", "¿Qué promete `fn evens(n: u32) -> impl Iterator<Item = u32>`?"],
    a: ["One concrete iterator type, kept hidden, that yields `u32`s", "Un type d'itérateur concret, gardé caché, qui produit des `u32`", "Un tipo de iterador concreto, oculto, que produce `u32`"],
    w: [["Any iterator, chosen at run time", "N'importe quel itérateur, choisi à l'exécution", "Cualquier iterador, elegido al ejecutar"], ["A `Vec<u32>`", "Un `Vec<u32>`", "Un `Vec<u32>`"], ["A boxed iterator on the heap", "Un itérateur en boîte sur le tas", "Un iterador en caja en el montón"]],
    e: [
      "`impl Trait` in return position hides a long type (closures inside adapters cannot even be named) with no run-time cost. All return paths must give the same type; for different ones, `Box<dyn Iterator<Item = u32>>`.",
      "`impl Trait` en position de retour cache un type long (les closures dans les adaptateurs ne se nomment même pas) sans coût à l'exécution. Tous les chemins de retour doivent donner le même type ; pour des types différents, `Box<dyn Iterator<Item = u32>>`.",
      "`impl Trait` en posición de retorno oculta un tipo largo (las clausuras dentro de los adaptadores ni siquiera tienen nombre) sin coste al ejecutar. Todos los caminos de retorno deben dar el mismo tipo; para tipos distintos, `Box<dyn Iterator<Item = u32>>`.",
    ],
  },
  {
    id: "rs-trait-05",
    q: ["A trait method has a body in the trait. What does an implementation have to do?", "Une méthode de trait a un corps dans le trait. Que doit faire une implémentation ?", "Un método de trait tiene cuerpo en el trait. ¿Qué tiene que hacer una implementación?"],
    a: ["Nothing: it gets that default, and may override it", "Rien : elle reçoit ce défaut, et peut le remplacer", "Nada: recibe ese valor por defecto, y puede sustituirlo"],
    w: [["Copy the body into its own `impl`", "Recopier le corps dans son `impl`", "Copiar el cuerpo en su `impl`"], ["Call it with `super`", "L'appeler avec `super`", "Llamarlo con `super`"], ["It cannot override it", "Elle ne peut pas le remplacer", "No puede sustituirlo"]],
    e: [
      "Default methods are often built on the required ones: `Iterator` asks only for `next` and provides `map`, `filter`, `sum` and some seventy more. An override cannot call the default version it replaces.",
      "Les méthodes par défaut s'appuient souvent sur celles requises : `Iterator` ne demande que `next` et fournit `map`, `filter`, `sum` et quelque soixante-dix autres. Un remplacement ne peut pas appeler la version par défaut qu'il remplace.",
      "Los métodos por defecto suelen apoyarse en los obligatorios: `Iterator` solo pide `next` y ofrece `map`, `filter`, `sum` y unos setenta más. Una sustitución no puede llamar a la versión por defecto que sustituye.",
    ],
  },
];

const propagation: RustQuestion[] = [
  {
    id: "rs-prop-01",
    q: ["What does `let text = fs::read_to_string(path)?;` do when the file is missing?", "Que fait `let text = fs::read_to_string(path)?;` quand le fichier manque ?", "¿Qué hace `let text = fs::read_to_string(path)?;` cuando falta el archivo?"],
    a: ["Returns the error from the current function at once, converted with `From` if needed", "Renvoie aussitôt l'erreur depuis la fonction en cours, convertie par `From` au besoin", "Devuelve en el acto el error desde la función actual, convertido con `From` si hace falta"],
    w: [["Panics", "Panique", "Provoca un pánico"], ["Sets `text` to an empty string", "Met `text` à une chaîne vide", "Pone `text` a una cadena vacía"], ["Retries until the file appears", "Réessaie jusqu'à ce que le fichier apparaisse", "Reintenta hasta que aparezca el archivo"]],
    e: [
      "`?` unwraps `Ok` and returns early on `Err`: the short form of a `match` that passes errors up. The function must return a `Result` whose error type can be made `From` the one met.",
      "`?` extrait le `Ok` et sort tôt sur un `Err` : la forme courte d'un `match` qui remonte les erreurs. La fonction doit renvoyer un `Result` dont le type d'erreur peut être fait `From` celui rencontré.",
      "`?` saca el `Ok` y sale antes ante un `Err`: la forma corta de un `match` que pasa los errores hacia arriba. La función debe devolver un `Result` cuyo tipo de error se pueda obtener `From` el encontrado.",
    ],
  },
  {
    id: "rs-prop-02",
    q: ["`?` in `fn main()` gives a compile error. What makes it work?", "`?` dans `fn main()` donne une erreur de compilation. Qu'est-ce qui le fait marcher ?", "`?` en `fn main()` da un error de compilación. ¿Qué lo hace funcionar?"],
    a: ["`fn main() -> Result<(), Box<dyn Error>>`, ending with `Ok(())`", "`fn main() -> Result<(), Box<dyn Error>>`, en finissant par `Ok(())`", "`fn main() -> Result<(), Box<dyn Error>>`, terminando con `Ok(())`"],
    w: [["`use std::error;` at the top", "`use std::error;` en haut", "`use std::error;` arriba"], ["`?` is never allowed in `main`", "`?` n'est jamais permis dans `main`", "`?` nunca se permite en `main`"], ["Wrapping `main` in `try`", "Envelopper `main` dans `try`", "Envolver `main` en `try`"]],
    e: [
      "`?` needs a function returning `Result` (or `Option`). `main` may return a `Result`: an `Err` prints its `Debug` form and exits with a failure status. `Box<dyn Error>` accepts most error types through `?`.",
      "`?` demande une fonction qui renvoie un `Result` (ou une `Option`). `main` peut renvoyer un `Result` : un `Err` affiche sa forme `Debug` et sort avec un code d'échec. `Box<dyn Error>` accepte la plupart des types d'erreurs via `?`.",
      "`?` necesita una función que devuelva `Result` (u `Option`). `main` puede devolver un `Result`: un `Err` muestra su forma `Debug` y sale con un código de fallo. `Box<dyn Error>` acepta la mayoría de los tipos de error mediante `?`.",
    ],
  },
  {
    id: "rs-prop-03",
    q: ["In a function returning `Option<u32>`, what does `let x = map.get(k)?;` do?", "Dans une fonction qui renvoie `Option<u32>`, que fait `let x = map.get(k)?;` ?", "En una función que devuelve `Option<u32>`, ¿qué hace `let x = map.get(k)?;`?"],
    a: ["Returns `None` at once if the key is missing, otherwise gives the value", "Renvoie `None` aussitôt si la clé manque, sinon donne la valeur", "Devuelve `None` en el acto si falta la clave; si no, da el valor"],
    w: [["It does not compile: `?` is only for `Result`", "Ça ne compile pas : `?` est réservé à `Result`", "No compila: `?` es solo para `Result`"], ["Panics on a missing key", "Panique sur une clé absente", "Provoca un pánico si falta la clave"], ["Gives 0 for a missing key", "Donne 0 pour une clé absente", "Da 0 si falta la clave"]],
    e: [
      "`?` works on `Option` in a function returning `Option`, and on `Result` in one returning `Result`; mixing needs a conversion: `.ok_or(MyError::Missing)?` turns `None` into an error.",
      "`?` marche sur `Option` dans une fonction qui renvoie `Option`, et sur `Result` dans une qui renvoie `Result` ; les mélanger demande une conversion : `.ok_or(MyError::Missing)?` transforme `None` en erreur.",
      "`?` funciona sobre `Option` en una función que devuelve `Option`, y sobre `Result` en una que devuelve `Result`; mezclarlos requiere una conversión: `.ok_or(MyError::Missing)?` convierte `None` en un error.",
    ],
  },
  {
    id: "rs-prop-04",
    q: ["How do you turn an `io::Error` into your own `ConfigError` on the way up?", "Comment transformer une `io::Error` en votre propre `ConfigError` en la remontant ?", "¿Cómo se convierte un `io::Error` en su propio `ConfigError` al pasarlo hacia arriba?"],
    a: ["`.map_err(ConfigError::Read)?`, or `impl From<io::Error> for ConfigError` so that `?` does it", "`.map_err(ConfigError::Read)?`, ou `impl From<io::Error> for ConfigError` pour que `?` le fasse", "`.map_err(ConfigError::Read)?`, o `impl From<io::Error> for ConfigError` para que `?` lo haga"],
    w: [["Cast it: `e as ConfigError`", "La convertir : `e as ConfigError`", "Convertirlo: `e as ConfigError`"], ["Catch it and throw the new one", "L'attraper et lancer la nouvelle", "Capturarlo y lanzar el nuevo"], ["It is not possible: errors keep their type", "Ce n'est pas possible : les erreurs gardent leur type", "No es posible: los errores conservan su tipo"]],
    e: [
      "`map_err` changes the error of a `Result` and leaves `Ok` alone. With a `From` implementation, `?` converts by itself; an enum variant holding the source keeps the original cause.",
      "`map_err` change l'erreur d'un `Result` et laisse `Ok` tel quel. Avec une implémentation de `From`, `?` convertit tout seul ; une variante d'enum qui contient la source garde la cause d'origine.",
      "`map_err` cambia el error de un `Result` y deja `Ok` como está. Con una implementación de `From`, `?` convierte por sí solo; una variante de enum que contiene la fuente conserva la causa original.",
    ],
  },
  {
    id: "rs-prop-05",
    q: ["What do `.ok()` and `.unwrap_or_default()` do on a `Result<u32, E>`?", "Que font `.ok()` et `.unwrap_or_default()` sur un `Result<u32, E>` ?", "¿Qué hacen `.ok()` y `.unwrap_or_default()` sobre un `Result<u32, E>`?"],
    a: ["`ok()` gives an `Option`, dropping the error; `unwrap_or_default()` gives the value, or 0 on error", "`ok()` donne une `Option`, en jetant l'erreur ; `unwrap_or_default()` donne la valeur, ou 0 en cas d'erreur", "`ok()` da una `Option`, descartando el error; `unwrap_or_default()` da el valor, o 0 si hay error"],
    w: [["Both panic on error", "Les deux paniquent en cas d'erreur", "Los dos provocan un pánico si hay error"], ["`ok()` checks the value is positive", "`ok()` vérifie que la valeur est positive", "`ok()` comprueba que el valor es positivo"], ["Both log the error", "Les deux journalisent l'erreur", "Los dos registran el error"]],
    e: [
      "They throw the error away on purpose: right when it really does not matter, wrong when it hides a failure. `Default` gives 0 for numbers, an empty `String` or `Vec`.",
      "Elles jettent l'erreur exprès : bien quand elle n'importe vraiment pas, mal quand elles cachent un échec. `Default` donne 0 pour les nombres, une `String` ou un `Vec` vide.",
      "Descartan el error a propósito: bien cuando de verdad no importa, mal cuando ocultan un fallo. `Default` da 0 para los números, un `String` o un `Vec` vacío.",
    ],
  },
];

const iterators: RustQuestion[] = [
  {
    id: "rs-iter-01",
    q: ["`v.iter().map(|x| println!(\"{x}\"));` prints nothing. Why?", "`v.iter().map(|x| println!(\"{x}\"));` n'affiche rien. Pourquoi ?", "`v.iter().map(|x| println!(\"{x}\"));` no muestra nada. ¿Por qué?"],
    a: ["Iterators are lazy: nothing runs until something consumes them; use `for` or `for_each`", "Les itérateurs sont paresseux : rien ne s'exécute tant que rien ne les consomme ; utiliser `for` ou `for_each`", "Los iteradores son perezosos: nada se ejecuta hasta que algo los consume; usar `for` o `for_each`"],
    w: [["`println!` cannot be used in a closure", "`println!` ne s'utilise pas dans une closure", "`println!` no se puede usar en una clausura"], ["`map` only works on owned values", "`map` ne marche que sur des valeurs possédées", "`map` solo funciona con valores propios"], ["The output is buffered until the end", "La sortie est mise en tampon jusqu'à la fin", "La salida se guarda en un búfer hasta el final"]],
    e: [
      "Adapters (`map`, `filter`, `zip`) only build a new iterator; consumers (`for`, `collect`, `sum`, `count`, `for_each`) pull items through. The compiler warns: iterators are `#[must_use]`.",
      "Les adaptateurs (`map`, `filter`, `zip`) ne font que construire un nouvel itérateur ; les consommateurs (`for`, `collect`, `sum`, `count`, `for_each`) font passer les éléments. Le compilateur avertit : les itérateurs sont `#[must_use]`.",
      "Los adaptadores (`map`, `filter`, `zip`) solo construyen un iterador nuevo; los consumidores (`for`, `collect`, `sum`, `count`, `for_each`) hacen pasar los elementos. El compilador avisa: los iteradores son `#[must_use]`.",
    ],
  },
  {
    id: "rs-iter-02",
    q: ["On a `Vec<String>`, what do `iter()`, `iter_mut()` and `into_iter()` yield?", "Sur un `Vec<String>`, que produisent `iter()`, `iter_mut()` et `into_iter()` ?", "Sobre un `Vec<String>`, ¿qué producen `iter()`, `iter_mut()` e `into_iter()`?"],
    a: ["`&String`, `&mut String`, and `String` itself, consuming the vector", "`&String`, `&mut String`, et `String` elle-même, en consommant le vecteur", "`&String`, `&mut String`, y el propio `String`, consumiendo el vector"],
    w: [["Copies of each `String` in all three cases", "Des copies de chaque `String` dans les trois cas", "Copias de cada `String` en los tres casos"], ["`String`, `&String` and `&mut String`", "`String`, `&String` et `&mut String`", "`String`, `&String` y `&mut String`"], ["Indexes, values and pairs", "Des indices, des valeurs et des paires", "Índices, valores y pares"]],
    e: [
      "The same three ways as ownership: borrow, borrow mutably, take. `for s in &v`, `for s in &mut v` and `for s in v` call them. `enumerate()` adds the index to any of them.",
      "Les trois mêmes façons que pour la propriété : emprunter, emprunter en mutable, prendre. `for s in &v`, `for s in &mut v` et `for s in v` les appellent. `enumerate()` ajoute l'indice à n'importe lequel.",
      "Las mismas tres formas que la propiedad: tomar prestado, tomar prestado mutable, quedarse. `for s in &v`, `for s in &mut v` y `for s in v` las llaman. `enumerate()` añade el índice a cualquiera.",
    ],
  },
  {
    id: "rs-iter-03",
    q: ["`let v = it.collect();` does not compile. What does the compiler need?", "`let v = it.collect();` ne compile pas. De quoi le compilateur a-t-il besoin ?", "`let v = it.collect();` no compila. ¿Qué necesita el compilador?"],
    a: ["The collection to build: `let v: Vec<_> = …` or `.collect::<Vec<_>>()`", "La collection à construire : `let v: Vec<_> = …` ou `.collect::<Vec<_>>()`", "La colección que construir: `let v: Vec<_> = …` o `.collect::<Vec<_>>()`"],
    w: [["A size: `.collect(10)`", "Une taille : `.collect(10)`", "Un tamaño: `.collect(10)`"], ["`mut` on `v`", "`mut` sur `v`", "`mut` en `v`"], ["An import of `std::collect`", "Un import de `std::collect`", "Una importación de `std::collect`"]],
    e: [
      "`collect` can build a `Vec`, `String`, `HashMap`, `HashSet`, even a `Result<Vec<_>, E>` that stops at the first error; the type says which. `_` lets the compiler infer the items.",
      "`collect` peut construire un `Vec`, une `String`, une `HashMap`, un `HashSet`, même un `Result<Vec<_>, E>` qui s'arrête à la première erreur ; le type dit lequel. `_` laisse le compilateur déduire les éléments.",
      "`collect` puede construir un `Vec`, un `String`, un `HashMap`, un `HashSet`, incluso un `Result<Vec<_>, E>` que se detiene en el primer error; el tipo dice cuál. `_` deja que el compilador deduzca los elementos.",
    ],
  },
  {
    id: "rs-iter-04",
    q: ["How long is `a.iter().zip(b.iter())` when `a` has 5 items and `b` has 3?", "Quelle est la longueur de `a.iter().zip(b.iter())` quand `a` a 5 éléments et `b` en a 3 ?", "¿Qué longitud tiene `a.iter().zip(b.iter())` cuando `a` tiene 5 elementos y `b` tiene 3?"],
    a: ["3 pairs: it stops at the shorter", "3 paires : il s'arrête au plus court", "3 pares: se detiene en el más corto"],
    w: [["5 pairs, the last two with nothing", "5 paires, les deux dernières vides", "5 pares, los dos últimos vacíos"], ["It panics: lengths differ", "Il panique : les longueurs diffèrent", "Provoca un pánico: las longitudes difieren"], ["8 items", "8 éléments", "8 elementos"]],
    e: [
      "`zip` silently drops what is left of the longer one; check lengths first when that would be a bug. `chain` puts two iterators end to end; `enumerate` is `zip` with `0..`.",
      "`zip` laisse tomber en silence le reste du plus long ; vérifier les longueurs avant quand ce serait un bug. `chain` met deux itérateurs bout à bout ; `enumerate` est un `zip` avec `0..`.",
      "`zip` descarta en silencio lo que sobra del más largo; comprobar antes las longitudes cuando eso sería un fallo. `chain` pone dos iteradores uno tras otro; `enumerate` es un `zip` con `0..`.",
    ],
  },
  {
    id: "rs-iter-05",
    q: ["Is `v.iter().map(…).filter(…).sum()` slower than a hand-written loop?", "`v.iter().map(…).filter(…).sum()` est-il plus lent qu'une boucle écrite à la main ?", "¿Es `v.iter().map(…).filter(…).sum()` más lento que un bucle escrito a mano?"],
    a: ["No: the adapters are inlined into one loop, often with bounds checks removed", "Non : les adaptateurs sont mis en ligne en une seule boucle, souvent sans vérification de bornes", "No: los adaptadores se integran en un solo bucle, a menudo sin comprobaciones de límites"],
    w: [["Yes: each adapter goes through the data again", "Oui : chaque adaptateur repasse sur les données", "Sí: cada adaptador vuelve a recorrer los datos"], ["Yes: each step allocates a vector", "Oui : chaque étape alloue un vecteur", "Sí: cada paso asigna un vector"], ["Yes: closures are called through pointers", "Oui : les closures sont appelées par pointeur", "Sí: las clausuras se llaman mediante punteros"]],
    e: [
      "A zero-cost abstraction: each item goes through the whole chain in one pass, and each closure has its own type, so calls are direct and inlined in release builds. Only `collect` allocates.",
      "Une abstraction sans coût : chaque élément traverse toute la chaîne en un seul passage, et chaque closure a son propre type, donc les appels sont directs et mis en ligne en release. Seul `collect` alloue.",
      "Una abstracción sin coste: cada elemento atraviesa toda la cadena en una sola pasada, y cada clausura tiene su propio tipo, así que las llamadas son directas e integradas en release. Solo `collect` asigna memoria.",
    ],
  },
];

const hashmaps: RustQuestion[] = [
  {
    id: "rs-map-01",
    q: ["How do you count words with a `HashMap<&str, u32>`, in one line per word?", "Comment compter les mots avec une `HashMap<&str, u32>`, en une ligne par mot ?", "¿Cómo se cuentan palabras con un `HashMap<&str, u32>`, en una línea por palabra?"],
    a: ["`*counts.entry(word).or_insert(0) += 1;`", "`*counts.entry(word).or_insert(0) += 1;`", "`*counts.entry(word).or_insert(0) += 1;`"],
    w: [["`counts[word] += 1;`", "`counts[word] += 1;`", "`counts[word] += 1;`"], ["`counts.add(word);`", "`counts.add(word);`", "`counts.add(word);`"], ["`counts.insert(word, counts.get(word) + 1);`", "`counts.insert(word, counts.get(word) + 1);`", "`counts.insert(word, counts.get(word) + 1);`"]],
    e: [
      "`entry` looks the key up once and returns a slot; `or_insert(0)` fills it if empty and gives `&mut u32`. Indexing a `HashMap` exists only for reading and panics on a missing key; `get` returns an `Option`.",
      "`entry` cherche la clé une seule fois et renvoie un emplacement ; `or_insert(0)` le remplit s'il est vide et donne un `&mut u32`. L'indexation d'une `HashMap` n'existe qu'en lecture et panique sur une clé absente ; `get` renvoie une `Option`.",
      "`entry` busca la clave una sola vez y devuelve un hueco; `or_insert(0)` lo rellena si está vacío y da un `&mut u32`. Indexar un `HashMap` solo existe para leer y provoca un pánico si falta la clave; `get` devuelve una `Option`.",
    ],
  },
  {
    id: "rs-map-02",
    q: ["In which order does `for (k, v) in &map` visit a `HashMap`?", "Dans quel ordre `for (k, v) in &map` parcourt-il une `HashMap` ?", "¿En qué orden recorre `for (k, v) in &map` un `HashMap`?"],
    a: ["No set order, and it changes from one run to the next; `BTreeMap` keeps keys sorted", "Aucun ordre fixe, et il change d'une exécution à l'autre ; `BTreeMap` garde les clés triées", "Ningún orden fijo, y cambia de una ejecución a otra; `BTreeMap` mantiene las claves ordenadas"],
    w: [["Insertion order", "L'ordre d'insertion", "El orden de inserción"], ["Sorted by key", "Trié par clé", "Ordenado por clave"], ["Sorted by value", "Trié par valeur", "Ordenado por valor"]],
    e: [
      "`HashMap` hashes with a random seed per process, against attacks that send colliding keys. For output that must not change, sort the keys or use `BTreeMap`; the `indexmap` crate keeps insertion order.",
      "`HashMap` hache avec une graine aléatoire par processus, contre les attaques qui envoient des clés en collision. Pour une sortie qui ne doit pas changer, trier les clés ou utiliser `BTreeMap` ; le crate `indexmap` garde l'ordre d'insertion.",
      "`HashMap` aplica el hash con una semilla aleatoria por proceso, contra ataques que envían claves en colisión. Para una salida que no debe cambiar, ordenar las claves o usar `BTreeMap`; el crate `indexmap` conserva el orden de inserción.",
    ],
  },
  {
    id: "rs-map-03",
    q: ["Why does `let m: HashMap<String, i32> = HashMap::new();` fail with no `use` line?", "Pourquoi `let m: HashMap<String, i32> = HashMap::new();` échoue-t-il sans ligne `use` ?", "¿Por qué falla `let m: HashMap<String, i32> = HashMap::new();` sin línea `use`?"],
    a: ["`HashMap` is not in the prelude: add `use std::collections::HashMap;`", "`HashMap` n'est pas dans le prélude : ajouter `use std::collections::HashMap;`", "`HashMap` no está en el preludio: añadir `use std::collections::HashMap;`"],
    w: [["It needs the `hashmap` crate in `Cargo.toml`", "Il faut le crate `hashmap` dans `Cargo.toml`", "Hace falta el crate `hashmap` en `Cargo.toml`"], ["`HashMap` needs a capacity", "`HashMap` demande une capacité", "`HashMap` necesita una capacidad"], ["`String` cannot be a key", "`String` ne peut pas être une clé", "`String` no puede ser una clave"]],
    e: [
      "The prelude brings only the most common names (`Vec`, `String`, `Option`, `Result`, `Box`); the rest is imported with `use`. Keys must be `Eq + Hash`, which `String` is.",
      "Le prélude n'apporte que les noms les plus courants (`Vec`, `String`, `Option`, `Result`, `Box`) ; le reste s'importe avec `use`. Les clés doivent être `Eq + Hash`, ce que `String` est.",
      "El preludio solo trae los nombres más comunes (`Vec`, `String`, `Option`, `Result`, `Box`); el resto se importa con `use`. Las claves deben ser `Eq + Hash`, y `String` lo es.",
    ],
  },
  {
    id: "rs-map-04",
    q: ["What does `map.insert(k, v)` return when `k` was already there?", "Que renvoie `map.insert(k, v)` quand `k` y était déjà ?", "¿Qué devuelve `map.insert(k, v)` cuando `k` ya estaba?"],
    a: ["`Some(old value)`: the new one replaces it", "`Some(ancienne valeur)` : la nouvelle la remplace", "`Some(valor antiguo)`: el nuevo lo sustituye"],
    w: [["`None`, and the old value is kept", "`None`, et l'ancienne valeur est gardée", "`None`, y se conserva el valor antiguo"], ["An error", "Une erreur", "Un error"], ["`true`", "`true`", "`true`"]],
    e: [
      "`insert` overwrites and hands back what it replaced. To insert only if absent: `map.entry(k).or_insert(v)`. Inserting a `String` key or value moves it into the map.",
      "`insert` écrase et rend ce qu'il remplace. Pour n'insérer que si la clé manque : `map.entry(k).or_insert(v)`. Insérer une clé ou une valeur `String` la déplace dans la table.",
      "`insert` sobrescribe y devuelve lo que sustituye. Para insertar solo si falta: `map.entry(k).or_insert(v)`. Insertar una clave o valor `String` lo mueve al mapa.",
    ],
  },
  {
    id: "rs-map-05",
    q: ["You need unique names, and to test membership fast. Which collection?", "Il vous faut des noms uniques, et tester vite l'appartenance. Quelle collection ?", "Necesita nombres únicos, y comprobar rápido la pertenencia. ¿Qué colección?"],
    a: ["`HashSet<String>` (or `BTreeSet` to keep them sorted)", "`HashSet<String>` (ou `BTreeSet` pour les garder triés)", "`HashSet<String>` (o `BTreeSet` para mantenerlos ordenados)"],
    w: [["`Vec<String>` with `contains`", "`Vec<String>` avec `contains`", "`Vec<String>` con `contains`"], ["`HashMap<String, ()>` is the only way", "`HashMap<String, ()>` est la seule façon", "`HashMap<String, ()>` es la única forma"], ["`VecDeque<String>`", "`VecDeque<String>`", "`VecDeque<String>`"]],
    e: [
      "`insert` returns `false` for a duplicate, and `contains` is O(1) on average, where a `Vec` is O(n). Sets also give `union`, `intersection` and `difference`.",
      "`insert` renvoie `false` pour un doublon, et `contains` est en O(1) en moyenne, contre O(n) pour un `Vec`. Les ensembles offrent aussi `union`, `intersection` et `difference`.",
      "`insert` devuelve `false` ante un duplicado, y `contains` es O(1) de media, frente a O(n) en un `Vec`. Los conjuntos ofrecen también `union`, `intersection` y `difference`.",
    ],
  },
];

const threads: RustQuestion[] = [
  {
    id: "rs-thread-01",
    q: ["`thread::spawn(|| println!(\"{:?}\", v));` is refused. What fixes it?", "`thread::spawn(|| println!(\"{:?}\", v));` est refusé. Qu'est-ce qui corrige ?", "`thread::spawn(|| println!(\"{:?}\", v));` se rechaza. ¿Qué lo corrige?"],
    a: ["`move ||`: the thread may outlive `v`'s scope, so it must own `v`", "`move ||` : le thread peut survivre à la portée de `v`, il doit donc posséder `v`", "`move ||`: el hilo puede sobrevivir al ámbito de `v`, así que debe poseer `v`"],
    w: [["Making `v` mutable", "Rendre `v` mutable", "Hacer `v` mutable"], ["Calling `join` first", "Appeler `join` d'abord", "Llamar antes a `join`"], ["Nothing: threads cannot print", "Rien : les threads ne peuvent pas afficher", "Nada: los hilos no pueden mostrar"]],
    e: [
      "`spawn` requires a `'static` closure: nothing guarantees the thread ends before `v` is freed. `move` hands `v` to the thread. To borrow instead, `thread::scope` (Rust 1.63) waits for its threads before returning.",
      "`spawn` exige une closure `'static` : rien ne garantit que le thread finisse avant que `v` soit libéré. `move` donne `v` au thread. Pour emprunter, `thread::scope` (Rust 1.63) attend ses threads avant de rendre la main.",
      "`spawn` exige una clausura `'static`: nada garantiza que el hilo termine antes de que se libere `v`. `move` entrega `v` al hilo. Para tomar prestado, `thread::scope` (Rust 1.63) espera a sus hilos antes de volver.",
    ],
  },
  {
    id: "rs-thread-02",
    q: ["`main` spawns a thread and returns at once. What happens to the thread?", "`main` lance un thread et rend la main aussitôt. Qu'arrive-t-il au thread ?", "`main` lanza un hilo y termina en el acto. ¿Qué le pasa al hilo?"],
    a: ["It is killed with the process; `handle.join()` waits for it", "Il est tué avec le processus ; `handle.join()` l'attend", "Muere con el proceso; `handle.join()` lo espera"],
    w: [["The process waits for it automatically", "Le processus l'attend automatiquement", "El proceso lo espera automáticamente"], ["It keeps running in the background", "Il continue en arrière-plan", "Sigue ejecutándose en segundo plano"], ["A panic", "Un panic", "Un pánico"]],
    e: [
      "When `main` returns, the process exits, whatever other threads are doing. `join()` blocks until the thread ends and returns its result, or an `Err` if it panicked.",
      "Quand `main` rend la main, le processus se termine, quoi que fassent les autres threads. `join()` bloque jusqu'à la fin du thread et renvoie son résultat, ou un `Err` s'il a paniqué.",
      "Cuando `main` termina, el proceso sale, hagan lo que hagan los demás hilos. `join()` bloquea hasta que el hilo acaba y devuelve su resultado, o un `Err` si provocó un pánico.",
    ],
  },
  {
    id: "rs-thread-03",
    q: ["Ten threads add to one counter. Which type do they share?", "Dix threads ajoutent à un même compteur. Quel type partagent-ils ?", "Diez hilos suman a un mismo contador. ¿Qué tipo comparten?"],
    a: ["`Arc<Mutex<u64>>` (or an `AtomicU64` in an `Arc`)", "`Arc<Mutex<u64>>` (ou un `AtomicU64` dans un `Arc`)", "`Arc<Mutex<u64>>` (o un `AtomicU64` en un `Arc`)"],
    w: [["`Rc<RefCell<u64>>`", "`Rc<RefCell<u64>>`", "`Rc<RefCell<u64>>`"], ["`&mut u64`", "`&mut u64`", "`&mut u64`"], ["A `static mut u64`", "Un `static mut u64`", "Un `static mut u64`"]],
    e: [
      "`Arc` shares ownership across threads with an atomic count; `Mutex` gives one thread at a time `&mut` access. `Rc` and `RefCell` are their single-thread versions, refused by the compiler between threads (not `Send`/`Sync`).",
      "`Arc` partage la propriété entre threads avec un compteur atomique ; `Mutex` donne un accès `&mut` à un thread à la fois. `Rc` et `RefCell` en sont les versions mono-thread, refusées par le compilateur entre threads (pas `Send`/`Sync`).",
      "`Arc` comparte la propiedad entre hilos con un contador atómico; `Mutex` da acceso `&mut` a un hilo cada vez. `Rc` y `RefCell` son sus versiones de un solo hilo, que el compilador rechaza entre hilos (no son `Send`/`Sync`).",
    ],
  },
  {
    id: "rs-thread-04",
    q: ["With `let (tx, rx) = mpsc::channel();`, when does `for msg in rx` end?", "Avec `let (tx, rx) = mpsc::channel();`, quand `for msg in rx` se termine-t-il ?", "Con `let (tx, rx) = mpsc::channel();`, ¿cuándo termina `for msg in rx`?"],
    a: ["When every sender has been dropped", "Quand tous les émetteurs ont été libérés", "Cuando se han liberado todos los emisores"],
    w: [["When the channel is empty", "Quand le canal est vide", "Cuando el canal está vacío"], ["After a timeout", "Après un délai", "Tras un tiempo de espera"], ["Never: it must be left with `break`", "Jamais : il faut en sortir avec `break`", "Nunca: hay que salir con `break`"]],
    e: [
      "`recv` blocks while senders exist and the channel is empty. Each thread gets its own `tx.clone()`; a leftover `tx` in `main` keeps the loop waiting forever, a classic: `drop(tx)` after spawning.",
      "`recv` bloque tant qu'il existe des émetteurs et que le canal est vide. Chaque thread reçoit son `tx.clone()` ; un `tx` oublié dans `main` fait attendre la boucle indéfiniment, un classique : `drop(tx)` après avoir lancé les threads.",
      "`recv` bloquea mientras existan emisores y el canal esté vacío. Cada hilo recibe su `tx.clone()`; un `tx` olvidado en `main` deja el bucle esperando para siempre, un clásico: `drop(tx)` tras lanzar los hilos.",
    ],
  },
  {
    id: "rs-thread-05",
    q: ["What does `thread::scope(|s| { … })` allow that `thread::spawn` does not?", "Que permet `thread::scope(|s| { … })` que `thread::spawn` ne permet pas ?", "¿Qué permite `thread::scope(|s| { … })` que `thread::spawn` no permite?"],
    a: ["Threads that borrow local variables: the scope waits for all of them before returning", "Des threads qui empruntent des variables locales : la portée les attend tous avant de rendre la main", "Hilos que toman prestadas variables locales: el ámbito los espera a todos antes de volver"],
    w: [["Threads that run faster", "Des threads plus rapides", "Hilos más rápidos"], ["Threads that can never panic", "Des threads qui ne paniquent jamais", "Hilos que nunca provocan un pánico"], ["Sharing a `Rc` between threads", "Partager un `Rc` entre threads", "Compartir un `Rc` entre hilos"]],
    e: [
      "Because every thread spawned with `s.spawn` is joined at the end of the scope, the compiler knows borrowed data outlives them: no `Arc`, no `move`, no `'static`. Stable since Rust 1.63.",
      "Comme chaque thread lancé avec `s.spawn` est rejoint à la fin de la portée, le compilateur sait que les données empruntées leur survivent : ni `Arc`, ni `move`, ni `'static`. Stable depuis Rust 1.63.",
      "Como cada hilo lanzado con `s.spawn` se une al final del ámbito, el compilador sabe que los datos prestados les sobreviven: ni `Arc`, ni `move`, ni `'static`. Estable desde Rust 1.63.",
    ],
  },
];

const modules: RustQuestion[] = [
  {
    id: "rs-mod-01",
    q: ["`mod net { fn connect() {} }`: can `main` call `net::connect()`?", "`mod net { fn connect() {} }` : `main` peut-il appeler `net::connect()` ?", "`mod net { fn connect() {} }`: ¿puede `main` llamar a `net::connect()`?"],
    a: ["No: items are private to their module by default; write `pub fn connect`", "Non : les éléments sont privés à leur module par défaut ; écrire `pub fn connect`", "No: los elementos son privados de su módulo por defecto; escribir `pub fn connect`"],
    w: [["Yes: everything in a crate is visible", "Oui : tout est visible dans un crate", "Sí: todo es visible en un crate"], ["Only with `use net::*;`", "Seulement avec `use net::*;`", "Solo con `use net::*;`"], ["Only if the module is in another file", "Seulement si le module est dans un autre fichier", "Solo si el módulo está en otro archivo"]],
    e: [
      "Privacy is per module: a child sees its parents' private items, not the reverse. `pub(crate)` opens an item to the whole crate only, `pub(super)` to the parent.",
      "La visibilité se décide par module : un enfant voit les éléments privés de ses parents, pas l'inverse. `pub(crate)` ouvre un élément au crate seulement, `pub(super)` au parent.",
      "La privacidad es por módulo: un hijo ve los elementos privados de sus padres, no al revés. `pub(crate)` abre un elemento solo al crate, `pub(super)` al padre.",
    ],
  },
  {
    id: "rs-mod-02",
    q: ["`mod utils;` in `main.rs`: where does Rust look for the module?", "`mod utils;` dans `main.rs` : où Rust cherche-t-il le module ?", "`mod utils;` en `main.rs`: ¿dónde busca Rust el módulo?"],
    a: ["In `src/utils.rs`, or `src/utils/mod.rs`", "Dans `src/utils.rs`, ou `src/utils/mod.rs`", "En `src/utils.rs`, o `src/utils/mod.rs`"],
    w: [["In every `.rs` file of the folder", "Dans tous les fichiers `.rs` du dossier", "En todos los archivos `.rs` de la carpeta"], ["On crates.io", "Sur crates.io", "En crates.io"], ["Nowhere: `mod` only declares a name", "Nulle part : `mod` ne fait que déclarer un nom", "En ningún sitio: `mod` solo declara un nombre"]],
    e: [
      "Files are not compiled because they exist: a `mod` line includes them in the module tree. A submodule `mod parse;` inside `utils.rs` lives in `src/utils/parse.rs`.",
      "Les fichiers ne sont pas compilés parce qu'ils existent : une ligne `mod` les inclut dans l'arbre des modules. Un sous-module `mod parse;` dans `utils.rs` vit dans `src/utils/parse.rs`.",
      "Los archivos no se compilan por existir: una línea `mod` los incluye en el árbol de módulos. Un submódulo `mod parse;` dentro de `utils.rs` vive en `src/utils/parse.rs`.",
    ],
  },
  {
    id: "rs-mod-03",
    q: ["Inside a module, what do `crate::`, `super::` and `self::` start from?", "Dans un module, d'où partent `crate::`, `super::` et `self::` ?", "Dentro de un módulo, ¿desde dónde empiezan `crate::`, `super::` y `self::`?"],
    a: ["The crate's root, the parent module, and the current module", "La racine du crate, le module parent, et le module courant", "La raíz del crate, el módulo padre, y el módulo actual"],
    w: [["The standard library, the parent crate, and the file", "La bibliothèque standard, le crate parent, et le fichier", "La biblioteca estándar, el crate padre, y el archivo"], ["All three mean the root", "Les trois désignent la racine", "Los tres significan la raíz"], ["The dependency, the workspace, and the test module", "La dépendance, l'espace de travail, et le module de test", "La dependencia, el espacio de trabajo, y el módulo de prueba"]],
    e: [
      "Paths are absolute from `crate::`, or relative. A dependency is named by its crate: `use serde::Deserialize;`. `pub use` re-exports a name, to offer a simpler public path.",
      "Les chemins sont absolus depuis `crate::`, ou relatifs. Une dépendance se nomme par son crate : `use serde::Deserialize;`. `pub use` réexporte un nom, pour offrir un chemin public plus simple.",
      "Las rutas son absolutas desde `crate::`, o relativas. Una dependencia se nombra por su crate: `use serde::Deserialize;`. `pub use` reexporta un nombre, para ofrecer una ruta pública más sencilla.",
    ],
  },
  {
    id: "rs-mod-04",
    q: ["`pub struct Config { path: String }`: can another module write `Config { path: s }`?", "`pub struct Config { path: String }` : un autre module peut-il écrire `Config { path: s }` ?", "`pub struct Config { path: String }`: ¿puede otro módulo escribir `Config { path: s }`?"],
    a: ["No: the field is private; the module must offer a constructor such as `Config::new`", "Non : le champ est privé ; le module doit offrir un constructeur comme `Config::new`", "No: el campo es privado; el módulo debe ofrecer un constructor como `Config::new`"],
    w: [["Yes: a `pub` struct makes its fields public", "Oui : une struct `pub` rend ses champs publics", "Sí: una struct `pub` hace públicos sus campos"], ["Yes, but it cannot read `path` afterwards", "Oui, mais il ne pourra pas lire `path` ensuite", "Sí, pero luego no podrá leer `path`"], ["Only with `unsafe`", "Seulement avec `unsafe`", "Solo con `unsafe`"]],
    e: [
      "Each field has its own visibility. Private fields let a type keep its invariants (a validated path, a sorted list) and change its insides later. An enum's variants, by contrast, are public with the enum.",
      "Chaque champ a sa propre visibilité. Des champs privés permettent à un type de garder ses invariants (un chemin validé, une liste triée) et de changer son intérieur plus tard. Les variantes d'un enum, elles, sont publiques avec l'enum.",
      "Cada campo tiene su propia visibilidad. Los campos privados permiten a un tipo mantener sus invariantes (una ruta validada, una lista ordenada) y cambiar su interior más adelante. Las variantes de un enum, en cambio, son públicas con el enum.",
    ],
  },
  {
    id: "rs-mod-05",
    q: ["What is the difference between a crate and a module?", "Quelle différence entre un crate et un module ?", "¿Qué diferencia hay entre un crate y un módulo?"],
    a: ["A crate is a unit of compilation (a library or a program); modules organize the code inside it", "Un crate est une unité de compilation (une bibliothèque ou un programme) ; les modules organisent le code à l'intérieur", "Un crate es una unidad de compilación (una biblioteca o un programa); los módulos organizan el código dentro de él"],
    w: [["None: two words for one thing", "Aucune : deux mots pour une même chose", "Ninguna: dos palabras para lo mismo"], ["A module is downloaded, a crate is written", "Un module se télécharge, un crate s'écrit", "Un módulo se descarga, un crate se escribe"], ["A crate is one file, a module a folder", "Un crate est un fichier, un module un dossier", "Un crate es un archivo, un módulo una carpeta"]],
    e: [
      "A package (one `Cargo.toml`) can hold a library crate (`src/lib.rs`) and several binary crates (`src/main.rs`, `src/bin/*.rs`). Each crate is a tree of modules rooted in its main file.",
      "Un paquet (un `Cargo.toml`) peut contenir un crate bibliothèque (`src/lib.rs`) et plusieurs crates binaires (`src/main.rs`, `src/bin/*.rs`). Chaque crate est un arbre de modules dont la racine est son fichier principal.",
      "Un paquete (un `Cargo.toml`) puede contener un crate de biblioteca (`src/lib.rs`) y varios crates binarios (`src/main.rs`, `src/bin/*.rs`). Cada crate es un árbol de módulos cuya raíz es su archivo principal.",
    ],
  },
];

const testing: RustQuestion[] = [
  {
    id: "rs-test-01",
    q: ["Where do unit tests usually live, and how are they run?", "Où vivent d'habitude les tests unitaires, et comment les lance-t-on ?", "¿Dónde suelen vivir las pruebas unitarias, y cómo se ejecutan?"],
    a: ["In a `#[cfg(test)] mod tests` at the bottom of the file, as `#[test]` functions, run by `cargo test`", "Dans un `#[cfg(test)] mod tests` en bas du fichier, sous forme de fonctions `#[test]`, lancées par `cargo test`", "En un `#[cfg(test)] mod tests` al final del archivo, como funciones `#[test]`, ejecutadas con `cargo test`"],
    w: [["In a separate test framework to install", "Dans un framework de test séparé à installer", "En un marco de pruebas aparte que hay que instalar"], ["In `main`, behind an `if`", "Dans `main`, derrière un `if`", "En `main`, detrás de un `if`"], ["Only in a `tests` folder", "Seulement dans un dossier `tests`", "Solo en una carpeta `tests`"]],
    e: [
      "`#[cfg(test)]` compiles the module only for tests, and it can reach the file's private functions. `cargo test name` runs the tests whose name contains `name`.",
      "`#[cfg(test)]` ne compile le module que pour les tests, et il peut atteindre les fonctions privées du fichier. `cargo test nom` lance les tests dont le nom contient `nom`.",
      "`#[cfg(test)]` solo compila el módulo para las pruebas, y puede llegar a las funciones privadas del archivo. `cargo test nombre` ejecuta las pruebas cuyo nombre contiene `nombre`.",
    ],
  },
  {
    id: "rs-test-02",
    q: ["Why prefer `assert_eq!(got, want)` to `assert!(got == want)`?", "Pourquoi préférer `assert_eq!(got, want)` à `assert!(got == want)` ?", "¿Por qué preferir `assert_eq!(got, want)` a `assert!(got == want)`?"],
    a: ["On failure it prints both values (they must be `Debug`)", "En cas d'échec, il affiche les deux valeurs (qui doivent être `Debug`)", "Si falla, muestra los dos valores (que deben ser `Debug`)"],
    w: [["It is faster", "Il est plus rapide", "Es más rápido"], ["`assert!` is removed in release builds", "`assert!` disparaît en release", "`assert!` desaparece en release"], ["It compares with a tolerance", "Il compare avec une tolérance", "Compara con una tolerancia"]],
    e: [
      "Seeing `left: 41, right: 42` saves a debugging round. Both macros panic, which is how a test fails, and both stay in release builds; `debug_assert!` is the one removed.",
      "Voir `left: 41, right: 42` évite un tour de débogage. Les deux macros paniquent, c'est ainsi qu'un test échoue, et les deux restent en release ; c'est `debug_assert!` qui disparaît.",
      "Ver `left: 41, right: 42` ahorra una vuelta de depuración. Las dos macros provocan un pánico, que es como falla una prueba, y las dos siguen en release; la que desaparece es `debug_assert!`.",
    ],
  },
  {
    id: "rs-test-03",
    q: ["How do you test that a function panics on bad input?", "Comment tester qu'une fonction panique sur une entrée invalide ?", "¿Cómo se prueba que una función provoca un pánico con una entrada inválida?"],
    a: ["`#[test] #[should_panic]` on the test (optionally with `expected = \"part of the message\"`)", "`#[test] #[should_panic]` sur le test (avec en option `expected = \"partie du message\"`)", "`#[test] #[should_panic]` en la prueba (opcionalmente con `expected = \"parte del mensaje\"`)"],
    w: [["Wrap the call in `try`", "Envelopper l'appel dans `try`", "Envolver la llamada en `try`"], ["It cannot be tested", "On ne peut pas le tester", "No se puede probar"], ["`assert_panics!(f())`", "`assert_panics!(f())`", "`assert_panics!(f())`"]],
    e: [
      "The test passes only if the function panics. For a function that returns a `Result`, test the `Err` instead: `assert!(parse(\"x\").is_err())`. A test may itself return `Result<(), E>` and use `?`.",
      "Le test ne passe que si la fonction panique. Pour une fonction qui renvoie un `Result`, tester plutôt le `Err` : `assert!(parse(\"x\").is_err())`. Un test peut lui-même renvoyer `Result<(), E>` et utiliser `?`.",
      "La prueba solo pasa si la función provoca un pánico. Para una función que devuelve un `Result`, probar en cambio el `Err`: `assert!(parse(\"x\").is_err())`. Una prueba puede devolver ella misma `Result<(), E>` y usar `?`.",
    ],
  },
  {
    id: "rs-test-04",
    q: ["What is in a project's `tests/` folder?", "Que contient le dossier `tests/` d'un projet ?", "¿Qué contiene la carpeta `tests/` de un proyecto?"],
    a: ["Integration tests: each file is a separate crate that uses the library's public API only", "Des tests d'intégration : chaque fichier est un crate séparé qui n'utilise que l'API publique de la bibliothèque", "Pruebas de integración: cada archivo es un crate aparte que solo usa la API pública de la biblioteca"],
    w: [["Test data files only", "Seulement des fichiers de données de test", "Solo archivos de datos de prueba"], ["The compiled tests", "Les tests compilés", "Las pruebas compiladas"], ["Tests that run only in release", "Des tests lancés seulement en release", "Pruebas que solo se ejecutan en release"]],
    e: [
      "They test the crate as a user would. Shared helpers go in `tests/common/mod.rs`, which is not a test file itself. A binary-only crate exposes nothing to them: move the logic into `src/lib.rs`.",
      "Ils testent le crate comme le ferait un utilisateur. Les aides communes vont dans `tests/common/mod.rs`, qui n'est pas lui-même un fichier de test. Un crate uniquement binaire ne leur expose rien : déplacer la logique dans `src/lib.rs`.",
      "Prueban el crate como lo haría un usuario. Las ayudas comunes van en `tests/common/mod.rs`, que no es un archivo de prueba. Un crate solo binario no les expone nada: mover la lógica a `src/lib.rs`.",
    ],
  },
  {
    id: "rs-test-05",
    q: ["A code example in a `///` comment: what does `cargo test` do with it?", "Un exemple de code dans un commentaire `///` : qu'en fait `cargo test` ?", "Un ejemplo de código en un comentario `///`: ¿qué hace `cargo test` con él?"],
    a: ["Compiles and runs it as a test: documentation examples cannot go stale", "Le compile et l'exécute comme un test : les exemples de la documentation ne peuvent pas devenir faux", "Lo compila y ejecuta como una prueba: los ejemplos de la documentación no pueden quedarse obsoletos"],
    w: [["Nothing: comments are ignored", "Rien : les commentaires sont ignorés", "Nada: los comentarios se ignoran"], ["Prints it", "L'affiche", "Lo muestra"], ["Checks its formatting only", "Vérifie seulement sa mise en forme", "Solo comprueba su formato"]],
    e: [
      "Doctests run for library crates. A block marked `ignore` is skipped, `no_run` is compiled but not run, `should_panic` must panic. `cargo doc --open` shows the same comments as HTML.",
      "Les doctests tournent pour les crates bibliothèques. Un bloc marqué `ignore` est sauté, `no_run` est compilé sans être exécuté, `should_panic` doit paniquer. `cargo doc --open` affiche les mêmes commentaires en HTML.",
      "Los doctests se ejecutan en los crates de biblioteca. Un bloque marcado `ignore` se salta, `no_run` se compila pero no se ejecuta, `should_panic` debe provocar un pánico. `cargo doc --open` muestra los mismos comentarios en HTML.",
    ],
  },
];

export const basics = { strings, numbers };
export const ownership = { borrowing };
export const typesTopic = { traits };
export const errors = { propagation };
export const collections = { iterators, hashmaps };
export const concurrency = { threads };
export const cargo = { modules, testing };
