/**
 * Rust, Avancé: lifetimes and smart pointers, trait objects, error design,
 * closures, shared state between threads, Cargo features and workspaces,
 * declarative macros.
 */
import type { LinuxQuestion as RustQuestion } from "../linux/types";

const lifetimes: RustQuestion[] = [
  {
    id: "rs-life-01",
    q: ["What does `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str` tell the compiler?", "Que dit `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str` au compilateur ?", "¿Qué le dice `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str` al compilador?"],
    a: ["The result may borrow from either argument, so it is valid only while both are", "Le résultat peut emprunter à l'un ou l'autre argument : il n'est valable que tant que les deux le sont", "El resultado puede tomar prestado de cualquiera de los argumentos: solo es válido mientras lo sean los dos"],
    w: [["The result lives as long as the program", "Le résultat vit aussi longtemps que le programme", "El resultado vive tanto como el programa"], ["Both strings are copied", "Les deux chaînes sont copiées", "Las dos cadenas se copian"], ["The strings must have the same length", "Les chaînes doivent avoir la même longueur", "Las cadenas deben tener la misma longitud"]],
    e: [
      "Lifetime parameters change no lifetime: they describe how the output's validity relates to the inputs', so callers can be checked without reading the body. `'a` becomes the shorter of the two borrows at each call.",
      "Les paramètres de durée de vie ne changent aucune durée de vie : ils décrivent le lien entre la validité du résultat et celle des entrées, pour vérifier les appelants sans lire le corps. `'a` devient le plus court des deux emprunts à chaque appel.",
      "Los parámetros de tiempo de vida no cambian ningún tiempo de vida: describen la relación entre la validez del resultado y la de las entradas, para comprobar a los llamadores sin leer el cuerpo. `'a` pasa a ser el más corto de los dos préstamos en cada llamada.",
    ],
  },
  {
    id: "rs-life-02",
    q: ["Why does `fn first_word(s: &str) -> &str` need no lifetime written?", "Pourquoi `fn first_word(s: &str) -> &str` n'a-t-il besoin d'aucune durée de vie écrite ?", "¿Por qué `fn first_word(s: &str) -> &str` no necesita ningún tiempo de vida escrito?"],
    a: ["Elision: with one input reference, the output gets its lifetime", "L'élision : avec une seule référence en entrée, la sortie reçoit sa durée de vie", "La elisión: con una sola referencia de entrada, la salida recibe su tiempo de vida"],
    w: [["`&str` never needs lifetimes", "`&str` n'a jamais besoin de durée de vie", "`&str` nunca necesita tiempos de vida"], ["The compiler reads the body to guess", "Le compilateur lit le corps pour deviner", "El compilador lee el cuerpo para adivinar"], ["It returns a copy", "Elle renvoie une copie", "Devuelve una copia"]],
    e: [
      "Three rules: each input reference gets its own lifetime; if there is exactly one, the outputs get it; in a method, the outputs get `&self`'s. When the rules do not decide, as with two inputs, you write it.",
      "Trois règles : chaque référence en entrée reçoit sa propre durée de vie ; s'il n'y en a qu'une, les sorties la reçoivent ; dans une méthode, les sorties reçoivent celle de `&self`. Quand les règles ne tranchent pas, comme avec deux entrées, on l'écrit.",
      "Tres reglas: cada referencia de entrada recibe su propio tiempo de vida; si hay exactamente una, las salidas lo reciben; en un método, las salidas reciben el de `&self`. Cuando las reglas no deciden, como con dos entradas, se escribe.",
    ],
  },
  {
    id: "rs-life-03",
    q: ["What does the bound `T: 'static` require of `T`?", "Qu'exige la contrainte `T: 'static` de `T` ?", "¿Qué exige la restricción `T: 'static` a `T`?"],
    a: ["That `T` holds no borrow shorter than the program: owned types such as `String` qualify", "Que `T` ne contienne aucun emprunt plus court que le programme : des types possédés comme `String` conviennent", "Que `T` no contenga ningún préstamo más corto que el programa: los tipos propios como `String` sirven"],
    w: [["That every value of `T` lives until the program ends", "Que chaque valeur de `T` vive jusqu'à la fin du programme", "Que cada valor de `T` viva hasta el final del programa"], ["That `T` is stored in a `static`", "Que `T` soit stocké dans un `static`", "Que `T` se guarde en un `static`"], ["That `T` is a string literal", "Que `T` soit un littéral de chaîne", "Que `T` sea un literal de cadena"]],
    e: [
      "`'static` as a bound means the value could be kept as long as wanted, not that it will be: a `String` moved into a thread is freed when the thread is done. `&'static str` is a reference that is valid for the whole program.",
      "`'static` comme contrainte veut dire que la valeur pourrait être gardée aussi longtemps qu'on veut, pas qu'elle le sera : une `String` déplacée dans un thread est libérée quand le thread a fini. `&'static str` est une référence valable pendant tout le programme.",
      "`'static` como restricción significa que el valor podría conservarse tanto como se quiera, no que se vaya a conservar: un `String` movido a un hilo se libera cuando el hilo termina. `&'static str` es una referencia válida durante todo el programa.",
    ],
  },
  {
    id: "rs-life-04",
    q: ["A struct keeps a `&str` to the text it parses. How is it declared?", "Une struct garde un `&str` vers le texte qu'elle analyse. Comment la déclarer ?", "Una struct guarda un `&str` al texto que analiza. ¿Cómo se declara?"],
    a: ["`struct Parser<'a> { input: &'a str }`: a `Parser` cannot outlive the text", "`struct Parser<'a> { input: &'a str }` : un `Parser` ne peut pas survivre au texte", "`struct Parser<'a> { input: &'a str }`: un `Parser` no puede sobrevivir al texto"],
    w: [["`struct Parser { input: &str }`", "`struct Parser { input: &str }`", "`struct Parser { input: &str }`"], ["`struct Parser { input: &'static str }` in every case", "`struct Parser { input: &'static str }` dans tous les cas", "`struct Parser { input: &'static str }` en todos los casos"], ["It cannot: structs must own their data", "Impossible : les structs doivent posséder leurs données", "No se puede: las structs deben poseer sus datos"]],
    e: [
      "A reference in a struct always needs a lifetime parameter. It avoids copying the input, at the cost of tying the struct to it; when that gets awkward, owning a `String` is the simple way out.",
      "Une référence dans une struct demande toujours un paramètre de durée de vie. Cela évite de copier l'entrée, au prix de lier la struct à elle ; quand cela devient pénible, posséder une `String` est la sortie simple.",
      "Una referencia en una struct siempre necesita un parámetro de tiempo de vida. Evita copiar la entrada, a costa de atar la struct a ella; cuando se vuelve incómodo, poseer un `String` es la salida sencilla.",
    ],
  },
  {
    id: "rs-life-05",
    q: ["`let r; { let x = 5; r = &x; } println!(\"{r}\");`: what does the compiler say?", "`let r; { let x = 5; r = &x; } println!(\"{r}\");` : que dit le compilateur ?", "`let r; { let x = 5; r = &x; } println!(\"{r}\");`: ¿qué dice el compilador?"],
    a: ["`x` does not live long enough: it is freed at the inner closing brace while `r` is still used", "`x` ne vit pas assez longtemps : il est libéré à l'accolade intérieure alors que `r` sert encore", "`x` no vive lo suficiente: se libera en la llave interior mientras `r` todavía se usa"],
    w: [["Nothing: `5` is a constant", "Rien : `5` est une constante", "Nada: `5` es una constante"], ["`r` must be `mut`", "`r` doit être `mut`", "`r` debe ser `mut`"], ["`r` needs a type", "`r` a besoin d'un type", "`r` necesita un tipo"]],
    e: [
      "The borrow checker compares where `x` dies with where `r` is last used. Moving the `println!` inside the block, or `x` outside it, fixes it. This is the dangling pointer C would compile.",
      "Le vérificateur d'emprunts compare l'endroit où `x` meurt et celui où `r` sert pour la dernière fois. Mettre le `println!` dans le bloc, ou `x` dehors, corrige. C'est le pointeur pendant que le C compilerait.",
      "El comprobador de préstamos compara dónde muere `x` y dónde se usa `r` por última vez. Llevar el `println!` dentro del bloque, o `x` fuera, lo corrige. Es el puntero colgante que C compilaría.",
    ],
  },
];

const smartPointers: RustQuestion[] = [
  {
    id: "rs-ptr-01",
    q: ["Why does `enum List { Cons(i32, List), Nil }` not compile, and `Cons(i32, Box<List>)` does?", "Pourquoi `enum List { Cons(i32, List), Nil }` ne compile-t-il pas, et `Cons(i32, Box<List>)` si ?", "¿Por qué `enum List { Cons(i32, List), Nil }` no compila y `Cons(i32, Box<List>)` sí?"],
    a: ["A type that contains itself has infinite size; a `Box` is a pointer of fixed size", "Un type qui se contient lui-même a une taille infinie ; une `Box` est un pointeur de taille fixe", "Un tipo que se contiene a sí mismo tiene tamaño infinito; un `Box` es un puntero de tamaño fijo"],
    w: [["Enums cannot hold integers", "Les enums ne contiennent pas d'entiers", "Los enums no contienen enteros"], ["`Box` makes the list immutable", "`Box` rend la liste immuable", "`Box` hace la lista inmutable"], ["Recursion needs `unsafe`", "La récursion demande `unsafe`", "La recursión requiere `unsafe`"]],
    e: [
      "Every type needs a size known at compile time. `Box<T>` puts `T` on the heap and owns it; it is freed with the box. Trees, linked lists and `Box<dyn Trait>` use it.",
      "Chaque type a besoin d'une taille connue à la compilation. `Box<T>` met `T` sur le tas et le possède ; il est libéré avec la boîte. Arbres, listes chaînées et `Box<dyn Trait>` l'utilisent.",
      "Cada tipo necesita un tamaño conocido al compilar. `Box<T>` pone `T` en el montón y lo posee; se libera con la caja. Árboles, listas enlazadas y `Box<dyn Trait>` lo usan.",
    ],
  },
  {
    id: "rs-ptr-02",
    q: ["What does `Rc::clone(&a)` copy?", "Que copie `Rc::clone(&a)` ?", "¿Qué copia `Rc::clone(&a)`?"],
    a: ["Nothing of the data: it adds one to the reference count and returns another pointer", "Rien des données : il ajoute un au compteur de références et renvoie un autre pointeur", "Nada de los datos: suma uno al contador de referencias y devuelve otro puntero"],
    w: [["The whole value, deeply", "Toute la valeur, en profondeur", "Todo el valor, en profundidad"], ["The value's first level only", "Seulement le premier niveau de la valeur", "Solo el primer nivel del valor"], ["It moves `a`", "Il déplace `a`", "Mueve `a`"]],
    e: [
      "`Rc` gives shared ownership in one thread; the value is freed when the last `Rc` goes. Writing `Rc::clone(&a)` rather than `a.clone()` shows it is cheap. The data is read-only, unless wrapped in a `RefCell`.",
      "`Rc` donne une propriété partagée dans un thread ; la valeur est libérée quand le dernier `Rc` disparaît. Écrire `Rc::clone(&a)` plutôt que `a.clone()` montre que c'est bon marché. Les données sont en lecture seule, sauf dans un `RefCell`.",
      "`Rc` da propiedad compartida en un hilo; el valor se libera cuando desaparece el último `Rc`. Escribir `Rc::clone(&a)` en vez de `a.clone()` muestra que es barato. Los datos son de solo lectura, salvo dentro de un `RefCell`.",
    ],
  },
  {
    id: "rs-ptr-03",
    q: ["Two `borrow_mut()` on the same `RefCell` at once: what happens?", "Deux `borrow_mut()` sur le même `RefCell` en même temps : que se passe-t-il ?", "Dos `borrow_mut()` sobre el mismo `RefCell` a la vez: ¿qué pasa?"],
    a: ["A panic at run time: `RefCell` checks the borrowing rules while the program runs", "Un panic à l'exécution : `RefCell` vérifie les règles d'emprunt pendant que le programme tourne", "Un pánico al ejecutar: `RefCell` comprueba las reglas de préstamo mientras el programa se ejecuta"],
    w: [["A compile error", "Une erreur de compilation", "Un error de compilación"], ["The second waits for the first", "Le second attend le premier", "El segundo espera al primero"], ["Both succeed and the last write wins", "Les deux réussissent et la dernière écriture gagne", "Los dos funcionan y gana la última escritura"]],
    e: [
      "`RefCell` moves the check from compile time to run time, for cases the compiler cannot prove (graphs, callbacks). `try_borrow_mut` returns an error instead of panicking. Keep its borrows short.",
      "`RefCell` déplace la vérification de la compilation à l'exécution, pour les cas que le compilateur ne peut pas prouver (graphes, rappels). `try_borrow_mut` renvoie une erreur au lieu de paniquer. Garder ses emprunts courts.",
      "`RefCell` lleva la comprobación del momento de compilar al de ejecutar, para casos que el compilador no puede demostrar (grafos, retrollamadas). `try_borrow_mut` devuelve un error en vez de provocar un pánico. Mantener cortos sus préstamos.",
    ],
  },
  {
    id: "rs-ptr-04",
    q: ["A parent and its child point to each other with `Rc`. What goes wrong?", "Un parent et son enfant se pointent l'un l'autre avec des `Rc`. Qu'est-ce qui ne va pas ?", "Un padre y su hijo se apuntan mutuamente con `Rc`. ¿Qué falla?"],
    a: ["A cycle: the counts never reach zero and the memory leaks; the back link should be a `Weak`", "Un cycle : les compteurs n'atteignent jamais zéro et la mémoire fuit ; le lien retour doit être un `Weak`", "Un ciclo: los contadores nunca llegan a cero y la memoria se pierde; el enlace de vuelta debe ser un `Weak`"],
    w: [["A compile error", "Une erreur de compilation", "Un error de compilación"], ["A double free", "Une double libération", "Una doble liberación"], ["Nothing: `Rc` detects cycles", "Rien : `Rc` détecte les cycles", "Nada: `Rc` detecta los ciclos"]],
    e: [
      "Leaking is memory-safe, so the compiler allows it. A `Weak` does not keep the value alive; `upgrade()` returns `Some(Rc)` while it exists. Owners down the tree, `Weak` up.",
      "Une fuite ne viole pas la sûreté mémoire, donc le compilateur la permet. Un `Weak` ne garde pas la valeur en vie ; `upgrade()` renvoie `Some(Rc)` tant qu'elle existe. Les propriétaires vers le bas de l'arbre, des `Weak` vers le haut.",
      "Una fuga no rompe la seguridad de memoria, así que el compilador la permite. Un `Weak` no mantiene vivo el valor; `upgrade()` devuelve `Some(Rc)` mientras exista. Dueños hacia abajo del árbol, `Weak` hacia arriba.",
    ],
  },
  {
    id: "rs-ptr-05",
    q: ["Why can `fn greet(s: &str)` be called with `&Box<String>`?", "Pourquoi `fn greet(s: &str)` accepte-t-il un `&Box<String>` ?", "¿Por qué `fn greet(s: &str)` acepta un `&Box<String>`?"],
    a: ["Deref coercion: `&Box<String>` becomes `&String`, then `&str`, through `Deref`", "La coercition par `Deref` : `&Box<String>` devient `&String`, puis `&str`", "La coerción por `Deref`: `&Box<String>` pasa a `&String`, y luego a `&str`"],
    w: [["`Box` converts everything to text", "`Box` convertit tout en texte", "`Box` convierte todo en texto"], ["It copies the string", "Il copie la chaîne", "Copia la cadena"], ["It does not: a cast is needed", "Ce n'est pas le cas : il faut une conversion", "No es así: hace falta una conversión"]],
    e: [
      "Where a reference type does not match, the compiler applies `Deref` as many times as needed. It is why smart pointers feel like the values they hold, and why `&String` is accepted wherever `&str` is.",
      "Quand un type de référence ne correspond pas, le compilateur applique `Deref` autant de fois que nécessaire. C'est pourquoi les pointeurs intelligents se manient comme les valeurs qu'ils contiennent, et pourquoi `&String` passe partout où `&str` est attendu.",
      "Cuando un tipo de referencia no coincide, el compilador aplica `Deref` tantas veces como haga falta. Por eso los punteros inteligentes se manejan como los valores que contienen, y por eso `&String` vale donde se espera `&str`.",
    ],
  },
];

const traitObjects: RustQuestion[] = [
  {
    id: "rs-dyn-01",
    q: ["`Vec<Box<dyn Shape>>` or a generic `T: Shape`: what is the trade-off?", "`Vec<Box<dyn Shape>>` ou un générique `T: Shape` : quel est le compromis ?", "`Vec<Box<dyn Shape>>` o un genérico `T: Shape`: ¿cuál es el compromiso?"],
    a: ["`dyn` mixes shapes in one list, with a call through a vtable; generics are compiled per type, one type per list", "`dyn` mélange les formes dans une liste, avec un appel via une vtable ; les génériques sont compilés par type, un seul type par liste", "`dyn` mezcla formas en una lista, con una llamada mediante una vtable; los genéricos se compilan por tipo, un solo tipo por lista"],
    w: [["None: the compiler produces the same code", "Aucun : le compilateur produit le même code", "Ninguno: el compilador produce el mismo código"], ["`dyn` is checked at run time, generics at compile time", "`dyn` est vérifié à l'exécution, les génériques à la compilation", "`dyn` se comprueba al ejecutar, los genéricos al compilar"], ["Generics allocate on the heap, `dyn` on the stack", "Les génériques allouent sur le tas, `dyn` sur la pile", "Los genéricos asignan en el montón, `dyn` en la pila"]],
    e: [
      "Both are type-checked at compile time. Dynamic dispatch costs an indirect call and usually a heap allocation, but one compiled copy; static dispatch inlines and duplicates code per type. Use `dyn` for open-ended, mixed collections.",
      "Les deux sont vérifiés à la compilation. L'appel dynamique coûte un appel indirect et souvent une allocation, mais une seule copie compilée ; l'appel statique met en ligne et duplique le code par type. `dyn` pour les collections mélangées et ouvertes.",
      "Ambos se comprueban al compilar. El envío dinámico cuesta una llamada indirecta y a menudo una asignación, pero una sola copia compilada; el estático integra y duplica el código por tipo. `dyn` para colecciones mezcladas y abiertas.",
    ],
  },
  {
    id: "rs-dyn-02",
    q: ["Why can a trait with `fn duplicate(&self) -> Self` not be used as `dyn Trait`?", "Pourquoi un trait avec `fn duplicate(&self) -> Self` ne peut-il pas servir de `dyn Trait` ?", "¿Por qué un trait con `fn duplicate(&self) -> Self` no puede usarse como `dyn Trait`?"],
    a: ["Behind `dyn` the concrete type, and so its size, is unknown: the method cannot return it", "Derrière `dyn`, le type concret, donc sa taille, est inconnu : la méthode ne peut pas le renvoyer", "Detrás de `dyn` el tipo concreto, y por tanto su tamaño, es desconocido: el método no puede devolverlo"],
    w: [["Traits cannot return values", "Les traits ne peuvent pas renvoyer de valeurs", "Los traits no pueden devolver valores"], ["`Self` is a reserved word", "`Self` est un mot réservé", "`Self` es una palabra reservada"], ["`&self` methods are not allowed in `dyn`", "Les méthodes `&self` ne sont pas permises avec `dyn`", "Los métodos `&self` no se permiten con `dyn`"]],
    e: [
      "A trait is `dyn`-compatible (formerly object-safe) when every method can go in a vtable: no `Self` by value, no generic methods. Adding `where Self: Sized` to such a method excludes it from the vtable and keeps the trait usable as `dyn`.",
      "Un trait est compatible `dyn` (autrefois « object-safe ») quand chaque méthode peut aller dans une vtable : pas de `Self` par valeur, pas de méthodes génériques. Ajouter `where Self: Sized` à une telle méthode l'exclut de la vtable et garde le trait utilisable en `dyn`.",
      "Un trait es compatible con `dyn` (antes «object-safe») cuando cada método puede ir en una vtable: sin `Self` por valor, sin métodos genéricos. Añadir `where Self: Sized` a un método así lo excluye de la vtable y mantiene el trait usable como `dyn`.",
    ],
  },
  {
    id: "rs-dyn-03",
    q: ["How big is a `&dyn Display` on a 64-bit machine?", "Quelle taille fait un `&dyn Display` sur une machine 64 bits ?", "¿Qué tamaño tiene un `&dyn Display` en una máquina de 64 bits?"],
    a: ["16 bytes: a pointer to the data and a pointer to the vtable", "16 octets : un pointeur vers les données et un pointeur vers la vtable", "16 bytes: un puntero a los datos y un puntero a la vtable"],
    w: [["8 bytes, like any reference", "8 octets, comme toute référence", "8 bytes, como toda referencia"], ["The size of the value it points to", "La taille de la valeur pointée", "El tamaño del valor al que apunta"], ["24 bytes, like a `Vec`", "24 octets, comme un `Vec`", "24 bytes, como un `Vec`"]],
    e: [
      "References to unsized types are fat pointers: `&[T]` and `&str` carry a length, `&dyn Trait` a vtable (methods, size, alignment, drop). `std::mem::size_of::<&dyn Display>()` gives 16.",
      "Les références vers des types sans taille fixe sont des pointeurs larges : `&[T]` et `&str` portent une longueur, `&dyn Trait` une vtable (méthodes, taille, alignement, libération). `std::mem::size_of::<&dyn Display>()` donne 16.",
      "Las referencias a tipos sin tamaño fijo son punteros anchos: `&[T]` y `&str` llevan una longitud, `&dyn Trait` una vtable (métodos, tamaño, alineación, liberación). `std::mem::size_of::<&dyn Display>()` da 16.",
    ],
  },
  {
    id: "rs-dyn-04",
    q: ["Why is `Iterator` written with `type Item;` rather than `Iterator<T>`?", "Pourquoi `Iterator` s'écrit-il avec `type Item;` plutôt que `Iterator<T>` ?", "¿Por qué `Iterator` se escribe con `type Item;` en lugar de `Iterator<T>`?"],
    a: ["An associated type allows one implementation per type: each iterator yields one kind of item, which the compiler then knows", "Un type associé permet une seule implémentation par type : chaque itérateur produit un seul genre d'élément, que le compilateur connaît alors", "Un tipo asociado permite una sola implementación por tipo: cada iterador produce un solo tipo de elemento, que el compilador conoce entonces"],
    w: [["Generic traits do not exist", "Les traits génériques n'existent pas", "Los traits genéricos no existen"], ["It is faster at run time", "C'est plus rapide à l'exécution", "Es más rápido al ejecutar"], ["Only for historical reasons", "Seulement pour des raisons historiques", "Solo por razones históricas"]],
    e: [
      "With a generic parameter, a type could implement `Iterator<u8>` and `Iterator<String>`, and every call would need annotations. A generic parameter fits when several implementations make sense: `From<T>`, `Add<Rhs>`.",
      "Avec un paramètre générique, un type pourrait implémenter `Iterator<u8>` et `Iterator<String>`, et chaque appel demanderait des annotations. Un paramètre générique convient quand plusieurs implémentations ont un sens : `From<T>`, `Add<Rhs>`.",
      "Con un parámetro genérico, un tipo podría implementar `Iterator<u8>` e `Iterator<String>`, y cada llamada necesitaría anotaciones. Un parámetro genérico conviene cuando varias implementaciones tienen sentido: `From<T>`, `Add<Rhs>`.",
    ],
  },
  {
    id: "rs-dyn-05",
    q: ["How do you make `p1 + p2` work for a `Point`?", "Comment faire marcher `p1 + p2` pour un `Point` ?", "¿Cómo se hace funcionar `p1 + p2` para un `Point`?"],
    a: ["`impl std::ops::Add for Point { type Output = Point; fn add(self, o: Point) -> Point { … } }`", "`impl std::ops::Add for Point { type Output = Point; fn add(self, o: Point) -> Point { … } }`", "`impl std::ops::Add for Point { type Output = Point; fn add(self, o: Point) -> Point { … } }`"],
    w: [["Define `fn operator+`", "Définir `fn operator+`", "Definir `fn operator+`"], ["It cannot: operators are only for numbers", "Impossible : les opérateurs sont réservés aux nombres", "No se puede: los operadores son solo para números"], ["`#[derive(Add)]` from the standard library", "`#[derive(Add)]` de la bibliothèque standard", "`#[derive(Add)]` de la biblioteca estándar"]],
    e: [
      "Each operator is a trait of `std::ops` (`Add`, `Mul`, `Neg`, `Index`…), comparisons are `PartialEq` and `PartialOrd`. `add` takes `self` by value: for a non-`Copy` type, also implement `Add<&Point> for &Point` to avoid moves.",
      "Chaque opérateur est un trait de `std::ops` (`Add`, `Mul`, `Neg`, `Index`…), les comparaisons sont `PartialEq` et `PartialOrd`. `add` prend `self` par valeur : pour un type non `Copy`, implémenter aussi `Add<&Point> for &Point` pour éviter les déplacements.",
      "Cada operador es un trait de `std::ops` (`Add`, `Mul`, `Neg`, `Index`…), las comparaciones son `PartialEq` y `PartialOrd`. `add` toma `self` por valor: para un tipo no `Copy`, implementar también `Add<&Point> for &Point` para evitar movimientos.",
    ],
  },
];

const errorDesign: RustQuestion[] = [
  {
    id: "rs-errd-01",
    q: ["A library and an application: which error style suits each, usually?", "Une bibliothèque et une application : quel style d'erreur convient à chacune, d'habitude ?", "Una biblioteca y una aplicación: ¿qué estilo de error suele convenir a cada una?"],
    a: ["The library: its own error enum (often with `thiserror`) that callers can match; the application: `anyhow::Result` with context", "La bibliothèque : son propre enum d'erreurs (souvent avec `thiserror`) que les appelants peuvent filtrer ; l'application : `anyhow::Result` avec du contexte", "La biblioteca: su propio enum de errores (a menudo con `thiserror`) que los llamadores pueden comparar; la aplicación: `anyhow::Result` con contexto"],
    w: [["Both: `String` errors", "Les deux : des erreurs `String`", "Las dos: errores `String`"], ["Both: panics", "Les deux : des panics", "Las dos: pánicos"], ["The library: `anyhow`; the application: an enum", "La bibliothèque : `anyhow` ; l'application : un enum", "La biblioteca: `anyhow`; la aplicación: un enum"]],
    e: [
      "Callers of a library need to tell errors apart; an application mostly reports them to a human, with the chain of causes. `thiserror` writes `Display` and `From` for an enum; `anyhow::Error` wraps any error and adds context.",
      "Les appelants d'une bibliothèque doivent distinguer les erreurs ; une application les rapporte surtout à un humain, avec la chaîne des causes. `thiserror` écrit `Display` et `From` pour un enum ; `anyhow::Error` enveloppe n'importe quelle erreur et ajoute du contexte.",
      "Quienes llaman a una biblioteca necesitan distinguir los errores; una aplicación sobre todo los comunica a una persona, con la cadena de causas. `thiserror` escribe `Display` y `From` para un enum; `anyhow::Error` envuelve cualquier error y añade contexto.",
    ],
  },
  {
    id: "rs-errd-02",
    q: ["What does `.with_context(|| format!(\"reading {path}\"))?` add (anyhow)?", "Qu'ajoute `.with_context(|| format!(\"reading {path}\"))?` (anyhow) ?", "¿Qué añade `.with_context(|| format!(\"reading {path}\"))?` (anyhow)?"],
    a: ["A message saying what was being done, kept above the original error in the report", "Un message qui dit ce qu'on faisait, gardé au-dessus de l'erreur d'origine dans le rapport", "Un mensaje que dice qué se estaba haciendo, conservado encima del error original en el informe"],
    w: [["It retries the operation", "Il réessaie l'opération", "Reintenta la operación"], ["It replaces the original error", "Il remplace l'erreur d'origine", "Sustituye el error original"], ["It logs and ignores the error", "Il journalise et ignore l'erreur", "Registra e ignora el error"]],
    e: [
      "\"No such file or directory\" alone does not say which file. With context the report reads: Error: reading config.toml, Caused by: No such file or directory. The closure is only called on error.",
      "« No such file or directory » seul ne dit pas quel fichier. Avec du contexte, le rapport dit : Error: reading config.toml, Caused by: No such file or directory. La closure n'est appelée qu'en cas d'erreur.",
      "«No such file or directory» solo no dice qué archivo. Con contexto, el informe dice: Error: reading config.toml, Caused by: No such file or directory. La clausura solo se llama si hay error.",
    ],
  },
  {
    id: "rs-errd-03",
    q: ["Why `Box<dyn Error + Send + Sync>` rather than `Box<dyn Error>`?", "Pourquoi `Box<dyn Error + Send + Sync>` plutôt que `Box<dyn Error>` ?", "¿Por qué `Box<dyn Error + Send + Sync>` en lugar de `Box<dyn Error>`?"],
    a: ["So the error can cross threads, be returned from a spawned thread or an async task", "Pour que l'erreur puisse passer entre threads, être renvoyée par un thread lancé ou une tâche async", "Para que el error pueda pasar entre hilos, devolverse desde un hilo lanzado o una tarea async"],
    w: [["It is faster", "C'est plus rapide", "Es más rápido"], ["`Box<dyn Error>` cannot hold an `io::Error`", "`Box<dyn Error>` ne peut pas contenir une `io::Error`", "`Box<dyn Error>` no puede contener un `io::Error`"], ["It adds a backtrace", "Cela ajoute une trace d'appels", "Añade una traza de llamadas"]],
    e: [
      "A plain `dyn Error` might hide a type that is not thread-safe, so the compiler refuses to send it. Most errors are `Send + Sync`; `anyhow::Error` requires it too.",
      "Un simple `dyn Error` pourrait cacher un type non sûr entre threads, donc le compilateur refuse de l'envoyer. La plupart des erreurs sont `Send + Sync` ; `anyhow::Error` l'exige aussi.",
      "Un simple `dyn Error` podría ocultar un tipo no seguro entre hilos, así que el compilador se niega a enviarlo. La mayoría de errores son `Send + Sync`; `anyhow::Error` también lo exige.",
    ],
  },
  {
    id: "rs-errd-04",
    q: ["Your `enum ConfigError` has `Io(io::Error)`. What should its `source()` return?", "Votre `enum ConfigError` a `Io(io::Error)`. Que doit renvoyer son `source()` ?", "Su `enum ConfigError` tiene `Io(io::Error)`. ¿Qué debe devolver su `source()`?"],
    a: ["`Some(&the io::Error)`, so a report can walk the chain of causes", "`Some(&l'io::Error)`, pour qu'un rapport puisse remonter la chaîne des causes", "`Some(&el io::Error)`, para que un informe pueda recorrer la cadena de causas"],
    w: [["`None` always", "`None` toujours", "`None` siempre"], ["The file name", "Le nom du fichier", "El nombre del archivo"], ["A new `String` with both messages", "Une nouvelle `String` avec les deux messages", "Un `String` nuevo con los dos mensajes"]],
    e: [
      "`Error::source` links an error to its cause. A good habit: `Display` describes this level only, and the cause comes through `source`, so it is not printed twice. `thiserror`'s `#[source]` or `#[from]` does it.",
      "`Error::source` relie une erreur à sa cause. Une bonne habitude : `Display` décrit ce niveau seulement, et la cause passe par `source`, pour qu'elle ne soit pas affichée deux fois. Le `#[source]` ou `#[from]` de `thiserror` le fait.",
      "`Error::source` enlaza un error con su causa. Una buena costumbre: `Display` describe solo este nivel, y la causa va por `source`, para que no se muestre dos veces. El `#[source]` o `#[from]` de `thiserror` lo hace.",
    ],
  },
  {
    id: "rs-errd-05",
    q: ["Why mark a public error enum `#[non_exhaustive]`?", "Pourquoi marquer un enum d'erreurs public `#[non_exhaustive]` ?", "¿Por qué marcar un enum de errores público `#[non_exhaustive]`?"],
    a: ["So a new variant can be added later without breaking callers: their `match` must have a `_` arm", "Pour pouvoir ajouter une variante plus tard sans casser les appelants : leur `match` doit avoir un bras `_`", "Para poder añadir una variante más tarde sin romper a los llamadores: su `match` debe tener un brazo `_`"],
    w: [["To hide it from documentation", "Pour la cacher dans la documentation", "Para ocultarlo en la documentación"], ["To make any `match` on it impossible", "Pour rendre tout `match` impossible", "Para impedir cualquier `match`"], ["To allow variants without data only", "Pour n'autoriser que des variantes sans données", "Para permitir solo variantes sin datos"]],
    e: [
      "Without it, adding a variant is a breaking change (SemVer major), since exhaustive `match` expressions in other crates stop compiling. Inside the defining crate, a `match` stays exhaustive.",
      "Sans lui, ajouter une variante est un changement cassant (majeur au sens SemVer), puisque les `match` exhaustifs des autres crates ne compilent plus. Dans le crate qui le définit, les `match` restent exhaustifs.",
      "Sin él, añadir una variante es un cambio incompatible (mayor en SemVer), ya que los `match` exhaustivos de otros crates dejan de compilar. Dentro del crate que lo define, los `match` siguen siendo exhaustivos.",
    ],
  },
];

const closures: RustQuestion[] = [
  {
    id: "rs-clos-01",
    q: ["A closure moves a captured `String` out (returns it). Which trait does it implement?", "Une closure sort une `String` capturée (la renvoie). Quel trait implémente-t-elle ?", "Una clausura saca un `String` capturado (lo devuelve). ¿Qué trait implementa?"],
    a: ["`FnOnce` only: after one call the `String` is gone", "`FnOnce` seulement : après un appel, la `String` n'y est plus", "Solo `FnOnce`: tras una llamada el `String` ya no está"],
    w: [["`Fn`", "`Fn`", "`Fn`"], ["`FnMut`", "`FnMut`", "`FnMut`"], ["All three", "Les trois", "Los tres"]],
    e: [
      "`Fn` only reads its captures and can be called many times, even at once; `FnMut` changes them; `FnOnce` consumes them. Every closure is `FnOnce`; `Fn` ones are also `FnMut`. A function asks for the least it needs, e.g. `unwrap_or_else` takes `FnOnce`.",
      "`Fn` ne fait que lire ses captures et peut être appelée souvent, même en parallèle ; `FnMut` les modifie ; `FnOnce` les consomme. Toute closure est `FnOnce` ; les `Fn` sont aussi `FnMut`. Une fonction demande le moins possible, `unwrap_or_else` prend par exemple un `FnOnce`.",
      "`Fn` solo lee sus capturas y se puede llamar muchas veces, incluso a la vez; `FnMut` las modifica; `FnOnce` las consume. Toda clausura es `FnOnce`; las `Fn` son también `FnMut`. Una función pide lo mínimo, por ejemplo `unwrap_or_else` toma un `FnOnce`.",
    ],
  },
  {
    id: "rs-clos-02",
    q: ["`let mut count = 0; let inc = || count += 1; inc();` does not compile. Why?", "`let mut count = 0; let inc = || count += 1; inc();` ne compile pas. Pourquoi ?", "`let mut count = 0; let inc = || count += 1; inc();` no compila. ¿Por qué?"],
    a: ["`inc` changes its state, so it must be `let mut inc`", "`inc` modifie son état, elle doit donc être `let mut inc`", "`inc` cambia su estado, así que debe ser `let mut inc`"],
    w: [["Closures cannot change outside variables", "Les closures ne peuvent pas modifier les variables extérieures", "Las clausuras no pueden cambiar variables de fuera"], ["`count` must be passed as an argument", "`count` doit être passé en argument", "`count` debe pasarse como argumento"], ["It needs `move`", "Il faut `move`", "Necesita `move`"]],
    e: [
      "An `FnMut` closure holds a `&mut count`; calling it mutates the closure, hence `mut`. While `inc` lives, `count` cannot be read elsewhere: the mutable borrow is exclusive.",
      "Une closure `FnMut` contient un `&mut count` ; l'appeler modifie la closure, d'où `mut`. Tant que `inc` vit, `count` ne peut pas être lu ailleurs : l'emprunt mutable est exclusif.",
      "Una clausura `FnMut` contiene un `&mut count`; llamarla modifica la clausura, de ahí `mut`. Mientras `inc` viva, `count` no se puede leer en otro sitio: el préstamo mutable es exclusivo.",
    ],
  },
  {
    id: "rs-clos-03",
    q: ["What does `move` before a closure change?", "Que change `move` devant une closure ?", "¿Qué cambia `move` delante de una clausura?"],
    a: ["It captures by value: owned values move in, `Copy` ones are copied; the closure no longer borrows", "Elle capture par valeur : les valeurs possédées y sont déplacées, les `Copy` copiées ; la closure n'emprunte plus", "Captura por valor: los valores propios se mueven dentro, los `Copy` se copian; la clausura ya no toma prestado"],
    w: [["It makes the closure run in another thread", "Elle fait tourner la closure dans un autre thread", "Hace que la clausura se ejecute en otro hilo"], ["It makes it `FnOnce`", "Elle la rend `FnOnce`", "La hace `FnOnce`"], ["It moves the closure to the heap", "Elle déplace la closure sur le tas", "Mueve la clausura al montón"]],
    e: [
      "`move` decides how variables are captured, not how the closure may be called: a `move` closure that only reads is still `Fn`. It is needed when the closure outlives the scope: threads, returned closures, async tasks.",
      "`move` décide comment les variables sont capturées, pas comment la closure peut être appelée : une closure `move` qui ne fait que lire reste `Fn`. Il le faut quand la closure survit à la portée : threads, closures renvoyées, tâches async.",
      "`move` decide cómo se capturan las variables, no cómo se puede llamar a la clausura: una clausura `move` que solo lee sigue siendo `Fn`. Hace falta cuando la clausura sobrevive al ámbito: hilos, clausuras devueltas, tareas async.",
    ],
  },
  {
    id: "rs-clos-04",
    q: ["How does a function return a closure that adds `n`?", "Comment une fonction renvoie-t-elle une closure qui ajoute `n` ?", "¿Cómo devuelve una función una clausura que suma `n`?"],
    a: ["`fn adder(n: i32) -> impl Fn(i32) -> i32 { move |x| x + n }`", "`fn adder(n: i32) -> impl Fn(i32) -> i32 { move |x| x + n }`", "`fn adder(n: i32) -> impl Fn(i32) -> i32 { move |x| x + n }`"],
    w: [["`fn adder(n: i32) -> Fn(i32) -> i32 { |x| x + n }`", "`fn adder(n: i32) -> Fn(i32) -> i32 { |x| x + n }`", "`fn adder(n: i32) -> Fn(i32) -> i32 { |x| x + n }`"], ["`fn adder(n: i32) -> closure { |x| x + n }`", "`fn adder(n: i32) -> closure { |x| x + n }`", "`fn adder(n: i32) -> closure { |x| x + n }`"], ["It cannot: closures cannot leave their function", "Impossible : les closures ne quittent pas leur fonction", "No se puede: las clausuras no salen de su función"]],
    e: [
      "Each closure has its own unnamed type, so `impl Fn` names it by its trait. `move` copies `n` into the closure, which outlives `adder`. Returning different closures from branches needs `Box<dyn Fn(i32) -> i32>`.",
      "Chaque closure a son propre type sans nom : `impl Fn` le désigne par son trait. `move` copie `n` dans la closure, qui survit à `adder`. Renvoyer des closures différentes selon les branches demande `Box<dyn Fn(i32) -> i32>`.",
      "Cada clausura tiene su propio tipo sin nombre, así que `impl Fn` lo nombra por su trait. `move` copia `n` dentro de la clausura, que sobrevive a `adder`. Devolver clausuras distintas según la rama requiere `Box<dyn Fn(i32) -> i32>`.",
    ],
  },
  {
    id: "rs-clos-05",
    q: ["Since the 2021 edition, a closure uses `p.x` only. What does it capture?", "Depuis l'édition 2021, une closure n'utilise que `p.x`. Que capture-t-elle ?", "Desde la edición 2021, una clausura solo usa `p.x`. ¿Qué captura?"],
    a: ["Only the field `p.x`: other fields of `p` stay free to use", "Seulement le champ `p.x` : les autres champs de `p` restent utilisables", "Solo el campo `p.x`: los demás campos de `p` siguen libres para usarse"],
    w: [["The whole of `p`", "Tout `p`", "Todo `p`"], ["A copy of `p`", "Une copie de `p`", "Una copia de `p`"], ["Nothing until it is called", "Rien tant qu'elle n'est pas appelée", "Nada hasta que se llama"]],
    e: [
      "Disjoint capture: a closure can borrow `p.x` while code next to it changes `p.y`. In the 2018 edition it captured `p` entirely, which made such code fail; `cargo fix --edition` handles the rare drop-order differences.",
      "La capture disjointe : une closure peut emprunter `p.x` pendant que le code à côté modifie `p.y`. Dans l'édition 2018, elle capturait tout `p`, ce qui faisait échouer ce code ; `cargo fix --edition` traite les rares différences d'ordre de libération.",
      "Captura disjunta: una clausura puede tomar prestado `p.x` mientras el código de al lado cambia `p.y`. En la edición 2018 capturaba todo `p`, lo que hacía fallar ese código; `cargo fix --edition` trata las raras diferencias de orden de liberación.",
    ],
  },
];

const sharing: RustQuestion[] = [
  {
    id: "rs-share-01",
    q: ["What do `Send` and `Sync` mean?", "Que veulent dire `Send` et `Sync` ?", "¿Qué significan `Send` y `Sync`?"],
    a: ["`Send`: ownership can move to another thread; `Sync`: `&T` can be shared between threads", "`Send` : la propriété peut passer à un autre thread ; `Sync` : `&T` peut être partagé entre threads", "`Send`: la propiedad puede pasar a otro hilo; `Sync`: `&T` puede compartirse entre hilos"],
    w: [["`Send`: can be printed; `Sync`: can be compared", "`Send` : peut être affiché ; `Sync` : peut être comparé", "`Send`: se puede mostrar; `Sync`: se puede comparar"], ["Both mean the type has a lock", "Les deux veulent dire que le type a un verrou", "Los dos significan que el tipo tiene un cerrojo"], ["`Send`: async; `Sync`: blocking", "`Send` : async ; `Sync` : bloquant", "`Send`: async; `Sync`: bloqueante"]],
    e: [
      "Both are auto traits: the compiler derives them from a type's fields. `Rc` is neither (its count is not atomic), `RefCell` is `Send` but not `Sync`, `Mutex<T>` is `Sync` when `T` is `Send`. Data races become type errors.",
      "Ce sont des traits automatiques : le compilateur les déduit des champs d'un type. `Rc` n'est ni l'un ni l'autre (son compteur n'est pas atomique), `RefCell` est `Send` mais pas `Sync`, `Mutex<T>` est `Sync` si `T` est `Send`. Les courses de données deviennent des erreurs de type.",
      "Los dos son traits automáticos: el compilador los deduce de los campos de un tipo. `Rc` no es ninguno (su contador no es atómico), `RefCell` es `Send` pero no `Sync`, `Mutex<T>` es `Sync` si `T` es `Send`. Las carreras de datos se vuelven errores de tipo.",
    ],
  },
  {
    id: "rs-share-02",
    q: ["A thread panics while holding a `Mutex`. What do the others get from `lock()`?", "Un thread panique en tenant un `Mutex`. Qu'obtiennent les autres de `lock()` ?", "Un hilo provoca un pánico mientras tiene un `Mutex`. ¿Qué obtienen los demás de `lock()`?"],
    a: ["An `Err(PoisonError)`: the data may be half-updated; `into_inner()` still gives access", "Un `Err(PoisonError)` : les données sont peut-être à moitié modifiées ; `into_inner()` y donne quand même accès", "Un `Err(PoisonError)`: los datos pueden estar a medio actualizar; `into_inner()` aún da acceso"],
    w: [["They wait forever", "Ils attendent indéfiniment", "Esperan para siempre"], ["The lock as usual", "Le verrou comme d'habitude", "El cerrojo como siempre"], ["The whole process stops", "Tout le processus s'arrête", "Todo el proceso se detiene"]],
    e: [
      "Poisoning warns that an invariant may be broken. That is why code writes `lock().unwrap()`: carry on only if no holder panicked. `parking_lot`'s mutex has no poisoning.",
      "L'empoisonnement prévient qu'un invariant est peut-être rompu. C'est pourquoi le code écrit `lock().unwrap()` : continuer seulement si aucun détenteur n'a paniqué. Le mutex de `parking_lot` n'a pas d'empoisonnement.",
      "El envenenamiento avisa de que un invariante puede estar roto. Por eso el código escribe `lock().unwrap()`: seguir solo si ningún poseedor provocó un pánico. El mutex de `parking_lot` no tiene envenenamiento.",
    ],
  },
  {
    id: "rs-share-03",
    q: ["When is the lock of `let guard = m.lock().unwrap();` released?", "Quand le verrou de `let guard = m.lock().unwrap();` est-il relâché ?", "¿Cuándo se suelta el cerrojo de `let guard = m.lock().unwrap();`?"],
    a: ["When `guard` is dropped: at the end of its scope, or earlier with `drop(guard)`", "Quand `guard` est libéré : à la fin de sa portée, ou plus tôt avec `drop(guard)`", "Cuando se libera `guard`: al final de su ámbito, o antes con `drop(guard)`"],
    w: [["After the next statement", "Après l'instruction suivante", "Tras la sentencia siguiente"], ["When `m.unlock()` is called", "Quand on appelle `m.unlock()`", "Al llamar a `m.unlock()`"], ["Only when the thread ends", "Seulement à la fin du thread", "Solo cuando termina el hilo"]],
    e: [
      "The guard unlocks in its `Drop`, so a lock cannot be forgotten, even on a panic or an early return. Holding it longer than needed (across slow I/O) is the common mistake: release it before.",
      "Le gardien déverrouille dans son `Drop` : un verrou ne peut pas être oublié, même lors d'un panic ou d'un retour anticipé. Le garder plus longtemps que nécessaire (pendant des E/S lentes) est l'erreur courante : le relâcher avant.",
      "El guardián desbloquea en su `Drop`, así que un cerrojo no se puede olvidar, ni siquiera ante un pánico o un retorno anticipado. Mantenerlo más de lo necesario (durante E/S lentas) es el error común: soltarlo antes.",
    ],
  },
  {
    id: "rs-share-04",
    q: ["Threads only count events. What is lighter than `Mutex<u64>`?", "Des threads ne font que compter des événements. Qu'est-ce qui est plus léger que `Mutex<u64>` ?", "Los hilos solo cuentan eventos. ¿Qué es más ligero que `Mutex<u64>`?"],
    a: ["An `AtomicU64` with `fetch_add(1, Ordering::Relaxed)`", "Un `AtomicU64` avec `fetch_add(1, Ordering::Relaxed)`", "Un `AtomicU64` con `fetch_add(1, Ordering::Relaxed)`"],
    w: [["A plain `u64` with `+= 1`", "Un simple `u64` avec `+= 1`", "Un simple `u64` con `+= 1`"], ["A `RefCell<u64>`", "Un `RefCell<u64>`", "Un `RefCell<u64>`"], ["A channel per event", "Un canal par événement", "Un canal por evento"]],
    e: [
      "Atomics change a value in one indivisible step, without a lock. `Relaxed` is enough for a counter read at the end; publishing other data with a flag needs `Release` and `Acquire`. Atomics are `Sync`, shared with an `Arc` or a `static`.",
      "Les atomiques changent une valeur en une seule étape indivisible, sans verrou. `Relaxed` suffit pour un compteur lu à la fin ; publier d'autres données avec un drapeau demande `Release` et `Acquire`. Les atomiques sont `Sync`, partagés avec un `Arc` ou un `static`.",
      "Los atómicos cambian un valor en un solo paso indivisible, sin cerrojo. `Relaxed` basta para un contador que se lee al final; publicar otros datos con un indicador requiere `Release` y `Acquire`. Los atómicos son `Sync`, compartidos con un `Arc` o un `static`.",
    ],
  },
  {
    id: "rs-share-05",
    q: ["Thread A locks `m1` then `m2`, thread B locks `m2` then `m1`. What can happen?", "Le thread A verrouille `m1` puis `m2`, le thread B `m2` puis `m1`. Que peut-il arriver ?", "El hilo A bloquea `m1` y luego `m2`, el hilo B `m2` y luego `m1`. ¿Qué puede pasar?"],
    a: ["A deadlock: each waits for the other forever; lock in the same order everywhere", "Un interblocage : chacun attend l'autre indéfiniment ; verrouiller partout dans le même ordre", "Un interbloqueo: cada uno espera al otro para siempre; bloquear en el mismo orden en todas partes"],
    w: [["A compile error: Rust prevents deadlocks", "Une erreur de compilation : Rust empêche les interblocages", "Un error de compilación: Rust impide los interbloqueos"], ["A panic with a clear message", "Un panic avec un message clair", "Un pánico con un mensaje claro"], ["Nothing: `Mutex` detects the cycle and gives way", "Rien : `Mutex` détecte le cycle et cède", "Nada: `Mutex` detecta el ciclo y cede"]],
    e: [
      "Rust's guarantees cover memory safety and data races, not deadlocks or logic races. Fixed lock order, fewer locks held at once, or one lock around both pieces of data are the remedies.",
      "Les garanties de Rust couvrent la sûreté mémoire et les courses de données, pas les interblocages ni les courses logiques. Un ordre de verrouillage fixe, moins de verrous tenus à la fois, ou un seul verrou pour les deux données sont les remèdes.",
      "Las garantías de Rust cubren la seguridad de memoria y las carreras de datos, no los interbloqueos ni las carreras lógicas. Un orden de bloqueo fijo, menos cerrojos a la vez, o un solo cerrojo para los dos datos son los remedios.",
    ],
  },
];

const features: RustQuestion[] = [
  {
    id: "rs-feat-01",
    q: ["What should Cargo features (`[features]`) do?", "Que doivent faire les features de Cargo (`[features]`) ?", "¿Qué deben hacer las features de Cargo (`[features]`)?"],
    a: ["Add capabilities, never remove them: Cargo turns on the union of the features asked by every dependent", "Ajouter des fonctions, jamais en retirer : Cargo active l'union des features demandées par tous les dépendants", "Añadir funciones, nunca quitarlas: Cargo activa la unión de las features pedidas por todos los dependientes"],
    w: [["Choose between incompatible versions of the crate", "Choisir entre des versions incompatibles du crate", "Elegir entre versiones incompatibles del crate"], ["Configure the program at run time", "Configurer le programme à l'exécution", "Configurar el programa al ejecutar"], ["Pick a different edition per feature", "Choisir une édition par feature", "Elegir una edición por feature"]],
    e: [
      "Two crates in a build that use the same dependency with different features share one copy with both. Code is gated with `#[cfg(feature = \"json\")]`; `default = [...]` lists those on by default, and `default-features = false` turns them off.",
      "Deux crates d'un build qui utilisent la même dépendance avec des features différentes en partagent une seule copie, avec les deux. Le code est conditionné par `#[cfg(feature = \"json\")]` ; `default = [...]` liste celles actives par défaut, et `default-features = false` les désactive.",
      "Dos crates de una compilación que usan la misma dependencia con features distintas comparten una sola copia, con ambas. El código se condiciona con `#[cfg(feature = \"json\")]`; `default = [...]` lista las activas por defecto, y `default-features = false` las desactiva.",
    ],
  },
  {
    id: "rs-feat-02",
    q: ["What do the crates of a Cargo workspace share?", "Que partagent les crates d'un espace de travail Cargo ?", "¿Qué comparten los crates de un espacio de trabajo de Cargo?"],
    a: ["One `Cargo.lock` and one `target` folder, so dependency versions agree and builds are reused", "Un seul `Cargo.lock` et un seul dossier `target` : les versions des dépendances s'accordent et les compilations sont réutilisées", "Un solo `Cargo.lock` y una sola carpeta `target`: las versiones de las dependencias coinciden y las compilaciones se reutilizan"],
    w: [["One crate on crates.io", "Un seul crate sur crates.io", "Un solo crate en crates.io"], ["Their source files", "Leurs fichiers source", "Sus archivos fuente"], ["Nothing; it is only a folder", "Rien ; ce n'est qu'un dossier", "Nada; solo es una carpeta"]],
    e: [
      "The root `Cargo.toml` lists `members`; `[workspace.dependencies]` sets versions once, inherited with `serde.workspace = true`. `cargo test --workspace` tests them all.",
      "Le `Cargo.toml` racine liste les `members` ; `[workspace.dependencies]` fixe les versions une fois, héritées avec `serde.workspace = true`. `cargo test --workspace` les teste tous.",
      "El `Cargo.toml` raíz lista los `members`; `[workspace.dependencies]` fija las versiones una vez, heredadas con `serde.workspace = true`. `cargo test --workspace` los prueba todos.",
    ],
  },
  {
    id: "rs-feat-03",
    q: ["Can a crate on the 2024 edition depend on one written for 2015?", "Un crate en édition 2024 peut-il dépendre d'un crate écrit pour 2015 ?", "¿Puede un crate de la edición 2024 depender de uno escrito para 2015?"],
    a: ["Yes: each crate keeps its own edition, and they link together", "Oui : chaque crate garde son édition, et ils se lient ensemble", "Sí: cada crate conserva su edición, y se enlazan entre sí"],
    w: [["No: all crates of a build must share an edition", "Non : tous les crates d'un build doivent partager une édition", "No: todos los crates de una compilación deben compartir edición"], ["Only after `cargo fix` on the dependency", "Seulement après un `cargo fix` sur la dépendance", "Solo tras un `cargo fix` sobre la dependencia"], ["Only through FFI", "Seulement par FFI", "Solo mediante FFI"]],
    e: [
      "Editions (2015, 2018, 2021, 2024) change surface rules (keywords, capture, lints), never the compiled interface, so the ecosystem does not split. `cargo fix --edition` migrates a crate's code.",
      "Les éditions (2015, 2018, 2021, 2024) changent des règles de surface (mots-clés, captures, lints), jamais l'interface compilée : l'écosystème ne se divise pas. `cargo fix --edition` migre le code d'un crate.",
      "Las ediciones (2015, 2018, 2021, 2024) cambian reglas de superficie (palabras clave, capturas, lints), nunca la interfaz compilada, así que el ecosistema no se divide. `cargo fix --edition` migra el código de un crate.",
    ],
  },
  {
    id: "rs-feat-04",
    q: ["`serde = \"1.0\"` in `Cargo.toml`: which versions may Cargo pick?", "`serde = \"1.0\"` dans `Cargo.toml` : quelles versions Cargo peut-il choisir ?", "`serde = \"1.0\"` en `Cargo.toml`: ¿qué versiones puede elegir Cargo?"],
    a: ["Any 1.x from 1.0.0 on (a caret requirement), not 2.0", "N'importe quelle 1.x à partir de 1.0.0 (une exigence « caret »), pas la 2.0", "Cualquier 1.x desde 1.0.0 (un requisito «caret»), no la 2.0"],
    w: [["Exactly 1.0.0", "Exactement 1.0.0", "Exactamente 1.0.0"], ["Only 1.0.x", "Seulement 1.0.x", "Solo 1.0.x"], ["The latest, whatever its number", "La plus récente, quel que soit son numéro", "La más reciente, sea cual sea su número"]],
    e: [
      "Cargo assumes SemVer: below 2.0 nothing should break. Before 1.0, the leftmost non-zero part counts: `\"0.3\"` means at least 0.3.0 and below 0.4.0. `=1.0.5` pins one version, `~1.0` allows 1.0.x.",
      "Cargo suppose SemVer : avant 2.0, rien ne devrait casser. Avant 1.0, c'est la première partie non nulle qui compte : `\"0.3\"` veut dire au moins 0.3.0 et moins de 0.4.0. `=1.0.5` fixe une version, `~1.0` permet les 1.0.x.",
      "Cargo supone SemVer: por debajo de 2.0 nada debería romperse. Antes de 1.0 cuenta la primera parte distinta de cero: `\"0.3\"` significa al menos 0.3.0 y menos de 0.4.0. `=1.0.5` fija una versión, `~1.0` permite las 1.0.x.",
    ],
  },
  {
    id: "rs-feat-05",
    q: ["What do `lto = true`, `codegen-units = 1` and `panic = \"abort\"` in `[profile.release]` do?", "Que font `lto = true`, `codegen-units = 1` et `panic = \"abort\"` dans `[profile.release]` ?", "¿Qué hacen `lto = true`, `codegen-units = 1` y `panic = \"abort\"` en `[profile.release]`?"],
    a: ["Optimize across crates and as one unit (faster, smaller, slower to build), and abort on panic instead of unwinding", "Optimiser entre crates et en une seule unité (plus rapide, plus petit, plus long à compiler), et arrêter net sur un panic au lieu de dérouler", "Optimizar entre crates y como una sola unidad (más rápido, más pequeño, más lento de compilar), y abortar ante un pánico en vez de deshacer la pila"],
    w: [["Turn on debug checks in release", "Activer les vérifications de debug en release", "Activar las comprobaciones de debug en release"], ["Build for several targets at once", "Compiler pour plusieurs cibles à la fois", "Compilar para varios destinos a la vez"], ["Nothing: they are the defaults", "Rien : ce sont les valeurs par défaut", "Nada: son los valores por defecto"]],
    e: [
      "Link-time optimization lets the optimizer see the whole program; one codegen unit removes the split that speeds compiling. `panic = \"abort\"` saves the unwinding tables, but then `catch_unwind` cannot catch and destructors do not run.",
      "L'optimisation à l'édition de liens laisse l'optimiseur voir tout le programme ; une seule unité de génération supprime le découpage qui accélère la compilation. `panic = \"abort\"` économise les tables de déroulement, mais alors `catch_unwind` n'attrape rien et les destructeurs ne s'exécutent pas.",
      "La optimización en el enlace deja al optimizador ver todo el programa; una sola unidad de generación quita la división que acelera la compilación. `panic = \"abort\"` ahorra las tablas de desenrollado, pero entonces `catch_unwind` no captura nada y los destructores no se ejecutan.",
    ],
  },
];

const macros: RustQuestion[] = [
  {
    id: "rs-macro-01",
    q: ["In `macro_rules! square { ($x:expr) => { $x * $x }; }`, what is `$x:expr`?", "Dans `macro_rules! square { ($x:expr) => { $x * $x }; }`, qu'est-ce que `$x:expr` ?", "En `macro_rules! square { ($x:expr) => { $x * $x }; }`, ¿qué es `$x:expr`?"],
    a: ["A fragment: it matches one expression and names it `x`", "Un fragment : il correspond à une expression et la nomme `x`", "Un fragmento: coincide con una expresión y la llama `x`"],
    w: [["A variable of type `expr`", "Une variable de type `expr`", "Una variable de tipo `expr`"], ["A shell variable", "Une variable du shell", "Una variable del shell"], ["A string to evaluate", "Une chaîne à évaluer", "Una cadena que evaluar"]],
    e: [
      "Macros match token trees, not values; fragments include `expr`, `ident`, `ty`, `tt`, `pat`. The expression is pasted twice: `square!(f())` calls `f` twice. Repetitions are written with a separator and a star, as in `vec!`.",
      "Les macros filtrent des arbres de jetons, pas des valeurs ; les fragments comprennent `expr`, `ident`, `ty`, `tt`, `pat`. L'expression est recopiée deux fois : `square!(f())` appelle `f` deux fois. Les répétitions s'écrivent avec un séparateur et une étoile, comme dans `vec!`.",
      "Las macros comparan árboles de tokens, no valores; los fragmentos incluyen `expr`, `ident`, `ty`, `tt`, `pat`. La expresión se pega dos veces: `square!(f())` llama a `f` dos veces. Las repeticiones se escriben con un separador y un asterisco, como en `vec!`.",
    ],
  },
  {
    id: "rs-macro-02",
    q: ["Why is `println!` a macro rather than a function?", "Pourquoi `println!` est-il une macro plutôt qu'une fonction ?", "¿Por qué `println!` es una macro y no una función?"],
    a: ["It takes any number of arguments, and its format string is checked against them at compile time", "Il prend un nombre quelconque d'arguments, et sa chaîne de format est vérifiée face à eux à la compilation", "Toma cualquier número de argumentos, y su cadena de formato se comprueba contra ellos al compilar"],
    w: [["Macros are faster than functions", "Les macros sont plus rapides que les fonctions", "Las macros son más rápidas que las funciones"], ["Printing needs `unsafe`", "Afficher demande `unsafe`", "Mostrar requiere `unsafe`"], ["For compatibility with C", "Pour la compatibilité avec le C", "Por compatibilidad con C"]],
    e: [
      "Rust functions have a fixed number of typed parameters. A missing argument or a placeholder too many is a compile error, not a run-time surprise as with C's `printf`.",
      "Les fonctions Rust ont un nombre fixe de paramètres typés. Un argument manquant ou un emplacement en trop est une erreur de compilation, pas une surprise à l'exécution comme avec le `printf` du C.",
      "Las funciones de Rust tienen un número fijo de parámetros con tipo. Un argumento que falta o un hueco de más es un error de compilación, no una sorpresa al ejecutar como con el `printf` de C.",
    ],
  },
  {
    id: "rs-macro-03",
    q: ["A macro declares `let tmp = …;` inside. Can it clash with a `tmp` of the caller?", "Une macro déclare `let tmp = …;` à l'intérieur. Peut-elle entrer en conflit avec un `tmp` de l'appelant ?", "Una macro declara `let tmp = …;` dentro. ¿Puede chocar con un `tmp` de quien la llama?"],
    a: ["No: `macro_rules!` is hygienic for local variables; the two `tmp` are different", "Non : `macro_rules!` est hygiénique pour les variables locales ; les deux `tmp` sont différents", "No: `macro_rules!` es higiénica para las variables locales; los dos `tmp` son distintos"],
    w: [["Yes: the macro overwrites the caller's `tmp`", "Oui : la macro écrase le `tmp` de l'appelant", "Sí: la macro sobrescribe el `tmp` de quien la llama"], ["Yes: it is a compile error", "Oui : c'est une erreur de compilation", "Sí: es un error de compilación"], ["Only in release builds", "Seulement en release", "Solo en release"]],
    e: [
      "Names a macro creates for local variables live in the macro's own context. Hygiene is partial: items such as functions are not hygienic, and a macro refers to them with `$crate::` paths to stay correct from other crates.",
      "Les noms qu'une macro crée pour des variables locales vivent dans son propre contexte. L'hygiène est partielle : les éléments comme les fonctions ne le sont pas, et une macro y fait référence par des chemins `$crate::` pour rester correcte depuis d'autres crates.",
      "Los nombres que una macro crea para variables locales viven en su propio contexto. La higiene es parcial: elementos como las funciones no son higiénicos, y una macro se refiere a ellos con rutas `$crate::` para seguir siendo correcta desde otros crates.",
    ],
  },
  {
    id: "rs-macro-04",
    q: ["What kind of macro is `#[derive(Serialize)]`?", "Quel genre de macro est `#[derive(Serialize)]` ?", "¿Qué tipo de macro es `#[derive(Serialize)]`?"],
    a: ["A procedural macro: a compiled function, in a `proc-macro` crate, that reads the type's tokens and writes code", "Une macro procédurale : une fonction compilée, dans un crate `proc-macro`, qui lit les jetons du type et écrit du code", "Una macro procedural: una función compilada, en un crate `proc-macro`, que lee los tokens del tipo y escribe código"],
    w: [["A `macro_rules!` macro", "Une macro `macro_rules!`", "Una macro `macro_rules!`"], ["A run-time reflection call", "Un appel de réflexion à l'exécution", "Una llamada de reflexión al ejecutar"], ["A compiler built-in, not a macro", "Une fonction intégrée au compilateur, pas une macro", "Una función integrada del compilador, no una macro"]],
    e: [
      "Derive, attribute (`#[tokio::main]`) and function-like procedural macros run at compile time, usually with the `syn` and `quote` crates. They are powerful but cost build time; Rust has no run-time reflection.",
      "Les macros procédurales de dérivation, d'attribut (`#[tokio::main]`) et de type fonction tournent à la compilation, en général avec les crates `syn` et `quote`. Puissantes, elles coûtent du temps de compilation ; Rust n'a pas de réflexion à l'exécution.",
      "Las macros procedurales de derivación, de atributo (`#[tokio::main]`) y de tipo función se ejecutan al compilar, normalmente con los crates `syn` y `quote`. Son potentes pero cuestan tiempo de compilación; Rust no tiene reflexión al ejecutar.",
    ],
  },
  {
    id: "rs-macro-05",
    q: ["How do you see the code a macro call expands to?", "Comment voir le code qu'un appel de macro produit ?", "¿Cómo se ve el código que produce una llamada a una macro?"],
    a: ["`cargo expand` (installed with `cargo install cargo-expand`; it uses a nightly toolchain)", "`cargo expand` (installé avec `cargo install cargo-expand` ; il utilise une chaîne nightly)", "`cargo expand` (se instala con `cargo install cargo-expand`; usa una cadena nightly)"],
    w: [["`cargo build --verbose`", "`cargo build --verbose`", "`cargo build --verbose`"], ["`rustfmt --macros`", "`rustfmt --macros`", "`rustfmt --macros`"], ["It cannot be seen", "On ne peut pas le voir", "No se puede ver"]],
    e: [
      "It prints the crate after expansion: `println!`, derives, attributes. Editors with rust-analyzer offer \"Expand macro recursively\" on a call. Reading expansions is how macro bugs are found.",
      "Il affiche le crate après expansion : `println!`, dérivations, attributs. Les éditeurs avec rust-analyzer proposent « Expand macro recursively » sur un appel. Lire les expansions est la façon de trouver les bugs de macros.",
      "Muestra el crate tras la expansión: `println!`, derivaciones, atributos. Los editores con rust-analyzer ofrecen «Expand macro recursively» sobre una llamada. Leer las expansiones es la forma de encontrar los fallos de las macros.",
    ],
  },
];

export const ownership = { lifetimes, smartPointers };
export const typesTopic = { traitObjects };
export const errors = { errorDesign };
export const collections = { closures };
export const concurrency = { sharing };
export const cargo = { features };
export const unsafeTopic = { macros };
