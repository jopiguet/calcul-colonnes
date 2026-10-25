/**
 * Rust, Expert: interior mutability and variance, advanced traits, async,
 * build tooling and publishing, unsafe Rust and FFI. The 2024 edition's
 * rules are the ones described.
 */
import type { LinuxQuestion as RustQuestion } from "../linux/types";

const interior: RustQuestion[] = [
  {
    id: "rs-cell-01",
    q: ["`Cell<T>` or `RefCell<T>`: when is `Cell` enough?", "`Cell<T>` ou `RefCell<T>` : quand `Cell` suffit-il ?", "`Cell<T>` o `RefCell<T>`: ¿cuándo basta `Cell`?"],
    a: ["When you only get and set whole values (`Copy`, or with `replace`/`take`), never a reference inside", "Quand on ne fait que lire et remplacer des valeurs entières (`Copy`, ou avec `replace`/`take`), jamais de référence vers l'intérieur", "Cuando solo se leen y sustituyen valores enteros (`Copy`, o con `replace`/`take`), nunca una referencia hacia dentro"],
    w: [["When the value is shared between threads", "Quand la valeur est partagée entre threads", "Cuando el valor se comparte entre hilos"], ["When the value is large", "Quand la valeur est grosse", "Cuando el valor es grande"], ["Never: `Cell` is deprecated", "Jamais : `Cell` est obsolète", "Nunca: `Cell` está obsoleto"]],
    e: [
      "`Cell` hands out no references, so it needs no borrow tracking and cannot fail; `RefCell` gives `Ref`/`RefMut` guards and counts them at run time. Neither is `Sync`; between threads, use atomics, `Mutex` or `RwLock`.",
      "`Cell` ne distribue aucune référence : il n'a pas besoin de suivre les emprunts et ne peut pas échouer ; `RefCell` donne des gardiens `Ref`/`RefMut` et les compte à l'exécution. Aucun des deux n'est `Sync` ; entre threads, utiliser des atomiques, `Mutex` ou `RwLock`.",
      "`Cell` no reparte referencias, así que no necesita seguir los préstamos y no puede fallar; `RefCell` da guardianes `Ref`/`RefMut` y los cuenta al ejecutar. Ninguno es `Sync`; entre hilos, usar atómicos, `Mutex` o `RwLock`.",
    ],
  },
  {
    id: "rs-cell-02",
    q: ["What do `Cell`, `RefCell`, `Mutex` and the atomics all rest on?", "Sur quoi reposent tous `Cell`, `RefCell`, `Mutex` et les atomiques ?", "¿En qué se basan todos `Cell`, `RefCell`, `Mutex` y los atómicos?"],
    a: ["`UnsafeCell`: the only legal way to change data reached through a `&` reference", "`UnsafeCell` : la seule façon légale de modifier des données atteintes par une référence `&`", "`UnsafeCell`: la única forma legal de cambiar datos alcanzados mediante una referencia `&`"],
    w: [["A `static mut`", "Un `static mut`", "Un `static mut`"], ["Casting `&T` to `&mut T`", "Convertir `&T` en `&mut T`", "Convertir `&T` en `&mut T`"], ["The operating system's locks", "Les verrous du système d'exploitation", "Los cerrojos del sistema operativo"]],
    e: [
      "The compiler assumes data behind `&T` does not change, except inside an `UnsafeCell`. Turning a `&T` into a `&mut T` by a cast is undefined behaviour, always, even if nothing else looks at the data.",
      "Le compilateur suppose que les données derrière `&T` ne changent pas, sauf à l'intérieur d'un `UnsafeCell`. Transformer un `&T` en `&mut T` par conversion est un comportement indéfini, toujours, même si rien d'autre ne regarde les données.",
      "El compilador supone que los datos detrás de `&T` no cambian, salvo dentro de un `UnsafeCell`. Convertir un `&T` en `&mut T` con un cast es comportamiento indefinido, siempre, aunque nada más mire los datos.",
    ],
  },
  {
    id: "rs-cell-03",
    q: ["What is `PhantomData<T>` for in `struct Id<T> { raw: u64, _t: PhantomData<T> }`?", "À quoi sert `PhantomData<T>` dans `struct Id<T> { raw: u64, _t: PhantomData<T> }` ?", "¿Para qué sirve `PhantomData<T>` en `struct Id<T> { raw: u64, _t: PhantomData<T> }`?"],
    a: ["It uses `T` without storing one, so `Id<User>` and `Id<Order>` are different types; it takes no space", "Il utilise `T` sans en stocker, pour que `Id<User>` et `Id<Order>` soient des types différents ; il ne prend aucune place", "Usa `T` sin guardar ninguno, para que `Id<User>` e `Id<Order>` sean tipos distintos; no ocupa espacio"],
    w: [["It stores a default `T`", "Il stocke un `T` par défaut", "Guarda un `T` por defecto"], ["It makes the struct thread-safe", "Il rend la struct sûre entre threads", "Hace la struct segura entre hilos"], ["It hides the field from `Debug`", "Il cache le champ dans `Debug`", "Oculta el campo en `Debug`"]],
    e: [
      "An unused type parameter is an error; `PhantomData` marks it used, and tells the compiler about ownership, variance and auto traits: `PhantomData<T>` acts as if a `T` were owned, `PhantomData<fn() -> T>` does not.",
      "Un paramètre de type inutilisé est une erreur ; `PhantomData` le marque utilisé, et renseigne le compilateur sur la propriété, la variance et les traits automatiques : `PhantomData<T>` agit comme si un `T` était possédé, `PhantomData<fn() -> T>` non.",
      "Un parámetro de tipo sin usar es un error; `PhantomData` lo marca como usado, e informa al compilador sobre la propiedad, la varianza y los traits automáticos: `PhantomData<T>` actúa como si se poseyera un `T`, `PhantomData<fn() -> T>` no.",
    ],
  },
  {
    id: "rs-cell-04",
    q: ["Why is `&'a mut T` invariant in `T`, when `&'a T` is covariant?", "Pourquoi `&'a mut T` est-il invariant en `T`, alors que `&'a T` est covariant ?", "¿Por qué `&'a mut T` es invariante en `T`, cuando `&'a T` es covariante?"],
    a: ["Through `&mut` you can write: shrinking `T` would let a short-lived reference be stored where a longer one is expected", "Par `&mut` on peut écrire : réduire `T` permettrait de ranger une référence de courte durée là où une plus longue est attendue", "Mediante `&mut` se puede escribir: reducir `T` permitiría guardar una referencia de vida corta donde se espera una más larga"],
    w: [["For speed", "Pour la vitesse", "Por velocidad"], ["Because `&mut` cannot be copied", "Parce que `&mut` ne se copie pas", "Porque `&mut` no se puede copiar"], ["It is a known compiler bug", "C'est un bug connu du compilateur", "Es un fallo conocido del compilador"]],
    e: [
      "A `&'static str` can be used as a `&'a str` (covariance) when only read. With `&mut Vec<&'static str>` taken as `&mut Vec<&'a str>`, code could push a short-lived `&str` that the original owner then reads after it died.",
      "Un `&'static str` peut servir de `&'a str` (covariance) quand on ne fait que lire. Avec un `&mut Vec<&'static str>` pris pour un `&mut Vec<&'a str>`, le code pourrait y pousser un `&str` de courte durée que le propriétaire d'origine lirait après sa mort.",
      "Un `&'static str` puede usarse como `&'a str` (covarianza) cuando solo se lee. Con un `&mut Vec<&'static str>` tomado como `&mut Vec<&'a str>`, el código podría meter un `&str` de vida corta que el dueño original leería después de que muriera.",
    ],
  },
  {
    id: "rs-cell-05",
    q: ["Inside `fn f(slot: &mut Option<String>)`, how do you take the `String` out?", "Dans `fn f(slot: &mut Option<String>)`, comment sortir la `String` ?", "Dentro de `fn f(slot: &mut Option<String>)`, ¿cómo se saca el `String`?"],
    a: ["`slot.take()` (or `std::mem::take`/`replace`): it leaves `None` in its place", "`slot.take()` (ou `std::mem::take`/`replace`) : il laisse `None` à la place", "`slot.take()` (o `std::mem::take`/`replace`): deja `None` en su lugar"],
    w: [["`let s = *slot;`", "`let s = *slot;`", "`let s = *slot;`"], ["`let s = slot.clone().unwrap();` is the only way", "`let s = slot.clone().unwrap();` est la seule façon", "`let s = slot.clone().unwrap();` es la única forma"], ["`unsafe { std::ptr::read(slot) }`", "`unsafe { std::ptr::read(slot) }`", "`unsafe { std::ptr::read(slot) }`"]],
    e: [
      "You cannot move out of a reference: the owner would be left with nothing valid. Swapping in a replacement keeps it valid. `mem::replace(&mut x, new)` and `mem::take(&mut x)` (with `Default`) do it for any type.",
      "On ne peut pas sortir une valeur d'une référence : le propriétaire resterait sans rien de valide. Échanger contre un remplaçant le garde valide. `mem::replace(&mut x, new)` et `mem::take(&mut x)` (avec `Default`) le font pour tout type.",
      "No se puede sacar un valor de una referencia: el dueño se quedaría sin nada válido. Intercambiarlo por un sustituto lo mantiene válido. `mem::replace(&mut x, new)` y `mem::take(&mut x)` (con `Default`) lo hacen para cualquier tipo.",
    ],
  },
];

const advancedTraits: RustQuestion[] = [
  {
    id: "rs-adv-01",
    q: ["Why is `impl fmt::Display for Vec<Point>` refused in your crate?", "Pourquoi `impl fmt::Display for Vec<Point>` est-il refusé dans votre crate ?", "¿Por qué se rechaza `impl fmt::Display for Vec<Point>` en su crate?"],
    a: ["The orphan rule: neither `Display` nor `Vec` is yours; wrap it in a newtype, `struct Points(Vec<Point>)`", "La règle de l'orphelin : ni `Display` ni `Vec` ne sont à vous ; l'envelopper dans un nouveau type, `struct Points(Vec<Point>)`", "La regla del huérfano: ni `Display` ni `Vec` son suyos; envolverlo en un tipo nuevo, `struct Points(Vec<Point>)`"],
    w: [["`Vec` cannot be displayed", "`Vec` ne peut pas être affiché", "`Vec` no se puede mostrar"], ["`Point` must be `Copy`", "`Point` doit être `Copy`", "`Point` debe ser `Copy`"], ["Generic types cannot implement traits", "Les types génériques n'implémentent pas de traits", "Los tipos genéricos no implementan traits"]],
    e: [
      "Coherence: there must be at most one implementation of a trait for a type in the whole program. An impl is allowed only if the trait or the type is local; otherwise two crates could both write it.",
      "La cohérence : il doit y avoir au plus une implémentation d'un trait pour un type dans tout le programme. Une implémentation n'est permise que si le trait ou le type est local ; sinon deux crates pourraient l'écrire.",
      "La coherencia: debe haber como mucho una implementación de un trait para un tipo en todo el programa. Una implementación solo se permite si el trait o el tipo es local; si no, dos crates podrían escribirla.",
    ],
  },
  {
    id: "rs-adv-02",
    q: ["What does `type Item<'a> where Self: 'a;` in a trait allow (a GAT)?", "Que permet `type Item<'a> where Self: 'a;` dans un trait (un GAT) ?", "¿Qué permite `type Item<'a> where Self: 'a;` en un trait (un GAT)?"],
    a: ["An associated type that depends on a lifetime: items borrowing from the iterator itself, as in a lending iterator", "Un type associé qui dépend d'une durée de vie : des éléments qui empruntent à l'itérateur lui-même, comme dans un itérateur prêteur", "Un tipo asociado que depende de un tiempo de vida: elementos que toman prestado del propio iterador, como en un iterador prestamista"],
    w: [["An associated type with a default", "Un type associé avec une valeur par défaut", "Un tipo asociado con un valor por defecto"], ["Items that live forever", "Des éléments qui vivent éternellement", "Elementos que viven para siempre"], ["Nothing new: it is the same as `type Item;`", "Rien de nouveau : c'est pareil que `type Item;`", "Nada nuevo: es lo mismo que `type Item;`"]],
    e: [
      "Generic associated types, stable since Rust 1.65. `Iterator::next(&mut self) -> Option<Self::Item>` cannot return something borrowed from `self`; with `Item<'a>`, `next(&'a mut self) -> Option<Self::Item<'a>>` can.",
      "Les types associés génériques, stables depuis Rust 1.65. `Iterator::next(&mut self) -> Option<Self::Item>` ne peut pas renvoyer quelque chose emprunté à `self` ; avec `Item<'a>`, `next(&'a mut self) -> Option<Self::Item<'a>>` le peut.",
      "Los tipos asociados genéricos, estables desde Rust 1.65. `Iterator::next(&mut self) -> Option<Self::Item>` no puede devolver algo prestado de `self`; con `Item<'a>`, `next(&'a mut self) -> Option<Self::Item<'a>>` sí puede.",
    ],
  },
  {
    id: "rs-adv-03",
    q: ["What does `F: for<'a> Fn(&'a str) -> &'a str` say?", "Que dit `F: for<'a> Fn(&'a str) -> &'a str` ?", "¿Qué dice `F: for<'a> Fn(&'a str) -> &'a str`?"],
    a: ["`F` works for every lifetime the caller picks, returning a borrow of its input: a higher-ranked bound", "`F` marche pour toute durée de vie choisie par l'appelant, en renvoyant un emprunt de son entrée : une contrainte de rang supérieur", "`F` funciona para cualquier tiempo de vida que elija quien llama, devolviendo un préstamo de su entrada: una restricción de rango superior"],
    w: [["`F` only accepts `'static` strings", "`F` n'accepte que des chaînes `'static`", "`F` solo acepta cadenas `'static`"], ["A loop over lifetimes at run time", "Une boucle sur des durées de vie à l'exécution", "Un bucle sobre tiempos de vida al ejecutar"], ["`F` is called once per lifetime", "`F` est appelée une fois par durée de vie", "`F` se llama una vez por tiempo de vida"]],
    e: [
      "The function calling `F` will pass references to its own locals, whose lifetimes cannot be named in the signature. `Fn(&str) -> &str` written without `for` means the same: the compiler adds it.",
      "La fonction qui appelle `F` lui passera des références vers ses propres variables locales, dont les durées de vie ne peuvent pas être nommées dans la signature. `Fn(&str) -> &str` écrit sans `for` veut dire la même chose : le compilateur l'ajoute.",
      "La función que llama a `F` le pasará referencias a sus propias variables locales, cuyos tiempos de vida no pueden nombrarse en la firma. `Fn(&str) -> &str` escrito sin `for` significa lo mismo: el compilador lo añade.",
    ],
  },
  {
    id: "rs-adv-04",
    q: ["`fn show<T>(x: &T)` refuses `show(\"hi\")` with `T = str`. Why, and what fixes it?", "`fn show<T>(x: &T)` refuse `show(\"hi\")` avec `T = str`. Pourquoi, et qu'est-ce qui corrige ?", "`fn show<T>(x: &T)` rechaza `show(\"hi\")` con `T = str`. ¿Por qué, y qué lo corrige?"],
    a: ["Type parameters are `Sized` by default and `str` is not; write `T: ?Sized`", "Les paramètres de type sont `Sized` par défaut et `str` ne l'est pas ; écrire `T: ?Sized`", "Los parámetros de tipo son `Sized` por defecto y `str` no lo es; escribir `T: ?Sized`"],
    w: [["`str` is not `Display`", "`str` n'est pas `Display`", "`str` no es `Display`"], ["Literals cannot be passed to generics", "Les littéraux ne se passent pas aux génériques", "Los literales no se pasan a genéricos"], ["`T` needs `'static`", "`T` demande `'static`", "`T` necesita `'static`"]],
    e: [
      "Every generic parameter has an implicit `Sized` bound, since most code moves `T` by value. Behind a reference, an unsized `T` (`str`, `[u8]`, `dyn Trait`) is fine; `?Sized` lifts the bound. `ToString` for any `T: Display + ?Sized` is how `\"hi\".to_string()` works.",
      "Chaque paramètre générique a une contrainte `Sized` implicite, puisque la plupart du code déplace `T` par valeur. Derrière une référence, un `T` sans taille fixe (`str`, `[u8]`, `dyn Trait`) convient ; `?Sized` lève la contrainte. `ToString` pour tout `T: Display + ?Sized` est ce qui fait marcher `\"hi\".to_string()`.",
      "Cada parámetro genérico tiene una restricción `Sized` implícita, ya que casi todo el código mueve `T` por valor. Detrás de una referencia, un `T` sin tamaño fijo (`str`, `[u8]`, `dyn Trait`) vale; `?Sized` quita la restricción. `ToString` para todo `T: Display + ?Sized` es lo que hace funcionar `\"hi\".to_string()`.",
    ],
  },
  {
    id: "rs-adv-05",
    q: ["A trait has `async fn fetch(&self) -> Data`. What is the catch?", "Un trait a `async fn fetch(&self) -> Data`. Où est le piège ?", "Un trait tiene `async fn fetch(&self) -> Data`. ¿Dónde está la trampa?"],
    a: ["It works since Rust 1.75, but the trait is not `dyn`-compatible, and callers cannot require the future to be `Send`", "Ça marche depuis Rust 1.75, mais le trait n'est pas compatible `dyn`, et les appelants ne peuvent pas exiger que le futur soit `Send`", "Funciona desde Rust 1.75, pero el trait no es compatible con `dyn`, y quienes llaman no pueden exigir que el futuro sea `Send`"],
    w: [["It does not compile in stable Rust", "Ça ne compile pas en Rust stable", "No compila en Rust estable"], ["Every call allocates on the heap", "Chaque appel alloue sur le tas", "Cada llamada asigna en el montón"], ["The method runs synchronously", "La méthode s'exécute de façon synchrone", "El método se ejecuta de forma síncrona"]],
    e: [
      "`async fn` in a trait returns an anonymous `impl Future` per implementation. For `Box<dyn Trait>` or a guaranteed `Send` future (needed by `tokio::spawn`), write `fn fetch(&self) -> impl Future<Output = Data> + Send`, or use the `async-trait` crate, which boxes.",
      "Un `async fn` dans un trait renvoie un `impl Future` anonyme par implémentation. Pour `Box<dyn Trait>` ou un futur garanti `Send` (exigé par `tokio::spawn`), écrire `fn fetch(&self) -> impl Future<Output = Data> + Send`, ou utiliser le crate `async-trait`, qui met en boîte.",
      "Un `async fn` en un trait devuelve un `impl Future` anónimo por implementación. Para `Box<dyn Trait>` o un futuro garantizado `Send` (que exige `tokio::spawn`), escribir `fn fetch(&self) -> impl Future<Output = Data> + Send`, o usar el crate `async-trait`, que mete en caja.",
    ],
  },
];

const asyncRust: RustQuestion[] = [
  {
    id: "rs-async-01",
    q: ["`let f = download(url);` with an `async fn download`: what has happened after this line?", "`let f = download(url);` avec un `async fn download` : que s'est-il passé après cette ligne ?", "`let f = download(url);` con un `async fn download`: ¿qué ha pasado tras esta línea?"],
    a: ["Nothing: `f` is a future; it runs only when awaited (`.await`) or polled by an executor", "Rien : `f` est un futur ; il ne s'exécute qu'une fois attendu (`.await`) ou interrogé par un exécuteur", "Nada: `f` es un futuro; solo se ejecuta al esperarlo (`.await`) o al consultarlo un ejecutor"],
    w: [["The download has started in the background", "Le téléchargement a commencé en arrière-plan", "La descarga ha empezado en segundo plano"], ["The download is done", "Le téléchargement est terminé", "La descarga ha terminado"], ["A thread was spawned", "Un thread a été lancé", "Se ha lanzado un hilo"]],
    e: [
      "Rust futures are lazy state machines, unlike JavaScript promises. `.await` drives them inside an async context; `tokio::spawn(f)` hands one to the runtime to run concurrently. A future that is dropped is cancelled.",
      "Les futurs de Rust sont des machines à états paresseuses, contrairement aux promesses de JavaScript. `.await` les fait avancer dans un contexte async ; `tokio::spawn(f)` en confie un à l'environnement d'exécution pour qu'il tourne en parallèle. Un futur libéré est annulé.",
      "Los futuros de Rust son máquinas de estados perezosas, a diferencia de las promesas de JavaScript. `.await` los hace avanzar dentro de un contexto async; `tokio::spawn(f)` entrega uno al entorno de ejecución para que corra en paralelo. Un futuro liberado se cancela.",
    ],
  },
  {
    id: "rs-async-02",
    q: ["Why does a Rust program need tokio (or another runtime) to run async code?", "Pourquoi un programme Rust a-t-il besoin de tokio (ou d'un autre environnement d'exécution) pour du code async ?", "¿Por qué un programa Rust necesita tokio (u otro entorno de ejecución) para ejecutar código async?"],
    a: ["The language defines futures and `.await` but ships no executor: the runtime polls futures and drives I/O and timers", "Le langage définit les futurs et `.await` mais ne fournit pas d'exécuteur : l'environnement interroge les futurs et pilote E/S et minuteries", "El lenguaje define los futuros y `.await` pero no trae ejecutor: el entorno consulta los futuros y gestiona la E/S y los temporizadores"],
    w: [["`async` is a tokio keyword", "`async` est un mot-clé de tokio", "`async` es una palabra clave de tokio"], ["The standard library's executor is too slow", "L'exécuteur de la bibliothèque standard est trop lent", "El ejecutor de la biblioteca estándar es demasiado lento"], ["To compile `.await`", "Pour compiler `.await`", "Para compilar `.await`"]],
    e: [
      "Leaving the executor out keeps async usable from servers to microcontrollers (embassy). `#[tokio::main]` wraps `main` in a runtime; `tokio::runtime::Runtime::block_on` does it by hand.",
      "Laisser l'exécuteur hors du langage garde l'async utilisable des serveurs aux microcontrôleurs (embassy). `#[tokio::main]` enveloppe `main` dans un environnement ; `tokio::runtime::Runtime::block_on` le fait à la main.",
      "Dejar el ejecutor fuera del lenguaje mantiene el async utilizable desde servidores hasta microcontroladores (embassy). `#[tokio::main]` envuelve `main` en un entorno; `tokio::runtime::Runtime::block_on` lo hace a mano.",
    ],
  },
  {
    id: "rs-async-03",
    q: ["An async handler calls `std::thread::sleep(Duration::from_secs(2))`. What is wrong?", "Un gestionnaire async appelle `std::thread::sleep(Duration::from_secs(2))`. Qu'est-ce qui ne va pas ?", "Un manejador async llama a `std::thread::sleep(Duration::from_secs(2))`. ¿Qué falla?"],
    a: ["It blocks the worker thread, and every task on it; use `tokio::time::sleep(…).await`, or `spawn_blocking` for blocking work", "Il bloque le thread de travail, et toutes ses tâches ; utiliser `tokio::time::sleep(…).await`, ou `spawn_blocking` pour un travail bloquant", "Bloquea el hilo de trabajo, y todas sus tareas; usar `tokio::time::sleep(…).await`, o `spawn_blocking` para trabajo bloqueante"],
    w: [["Nothing: only this task waits", "Rien : seule cette tâche attend", "Nada: solo espera esta tarea"], ["A compile error", "Une erreur de compilation", "Un error de compilación"], ["The sleep is skipped in async code", "La pause est sautée dans du code async", "La pausa se salta en código async"]],
    e: [
      "Tasks give way only at `.await` points. A blocking call (sleep, file I/O with `std::fs`, a long computation) holds the thread, so a few of them can stall a whole server. `tokio::task::spawn_blocking` moves such work to a separate pool.",
      "Les tâches ne cèdent la main qu'aux points `.await`. Un appel bloquant (pause, E/S fichier avec `std::fs`, long calcul) garde le thread : quelques-uns suffisent à figer tout un serveur. `tokio::task::spawn_blocking` déplace ce travail dans un groupe séparé.",
      "Las tareas solo ceden en los puntos `.await`. Una llamada bloqueante (pausa, E/S de archivos con `std::fs`, un cálculo largo) retiene el hilo, así que unas pocas pueden paralizar todo un servidor. `tokio::task::spawn_blocking` lleva ese trabajo a un grupo aparte.",
    ],
  },
  {
    id: "rs-async-04",
    q: ["`tokio::spawn` refuses a future that holds a `std::sync::MutexGuard` across an `.await`. Why?", "`tokio::spawn` refuse un futur qui garde un `std::sync::MutexGuard` pendant un `.await`. Pourquoi ?", "`tokio::spawn` rechaza un futuro que mantiene un `std::sync::MutexGuard` durante un `.await`. ¿Por qué?"],
    a: ["The guard is not `Send`, so the future is not; the task could resume on another thread", "Le gardien n'est pas `Send`, donc le futur non plus ; la tâche pourrait reprendre sur un autre thread", "El guardián no es `Send`, así que el futuro tampoco; la tarea podría reanudarse en otro hilo"],
    w: [["Mutexes are forbidden in async code", "Les mutex sont interdits en async", "Los mutex están prohibidos en async"], ["The future is too large", "Le futur est trop gros", "El futuro es demasiado grande"], ["`tokio::spawn` takes only closures", "`tokio::spawn` ne prend que des closures", "`tokio::spawn` solo toma clausuras"]],
    e: [
      "Everything alive across an `.await` is stored in the future. Release the guard before awaiting (a block around it), or, when the lock must be held across, use `tokio::sync::Mutex`. The same applies to `Rc`.",
      "Tout ce qui reste vivant pendant un `.await` est stocké dans le futur. Relâcher le gardien avant d'attendre (un bloc autour), ou, quand le verrou doit être tenu pendant l'attente, utiliser `tokio::sync::Mutex`. Il en va de même pour `Rc`.",
      "Todo lo que sigue vivo durante un `.await` se guarda en el futuro. Soltar el guardián antes de esperar (un bloque alrededor) o, cuando el cerrojo deba mantenerse durante la espera, usar `tokio::sync::Mutex`. Lo mismo vale para `Rc`.",
    ],
  },
  {
    id: "rs-async-05",
    q: ["`let a = fetch(1).await; let b = fetch(2).await;` against `tokio::join!(fetch(1), fetch(2))`: what changes?", "`let a = fetch(1).await; let b = fetch(2).await;` face à `tokio::join!(fetch(1), fetch(2))` : qu'est-ce qui change ?", "`let a = fetch(1).await; let b = fetch(2).await;` frente a `tokio::join!(fetch(1), fetch(2))`: ¿qué cambia?"],
    a: ["The first waits for one then the other; `join!` runs both at once in the same task and waits for both", "Le premier attend l'un puis l'autre ; `join!` fait avancer les deux en même temps dans la même tâche et attend les deux", "El primero espera uno y luego el otro; `join!` hace avanzar los dos a la vez en la misma tarea y espera a ambos"],
    w: [["Nothing: `.await` already runs them in parallel", "Rien : `.await` les fait déjà tourner en parallèle", "Nada: `.await` ya los ejecuta en paralelo"], ["`join!` creates two threads", "`join!` crée deux threads", "`join!` crea dos hilos"], ["`join!` returns the first to finish", "`join!` renvoie le premier qui termine", "`join!` devuelve el primero que termina"]],
    e: [
      "Concurrency is explicit: successive `.await`s are sequential. `join!` interleaves in one task (no extra thread); `select!` waits for the first and drops, so cancels, the others; `tokio::spawn` gives true parallelism on a multi-threaded runtime.",
      "La concurrence est explicite : des `.await` successifs sont successifs. `join!` entrelace dans une tâche (sans thread de plus) ; `select!` attend le premier et libère, donc annule, les autres ; `tokio::spawn` donne un vrai parallélisme sur un environnement multithread.",
      "La concurrencia es explícita: los `.await` sucesivos son sucesivos. `join!` intercala en una tarea (sin hilo adicional); `select!` espera al primero y libera, es decir cancela, los demás; `tokio::spawn` da paralelismo real en un entorno multihilo.",
    ],
  },
  {
    id: "rs-async-06",
    q: ["Why do futures have to be pinned (`Pin`) before they are polled?", "Pourquoi les futurs doivent-ils être épinglés (`Pin`) avant d'être interrogés ?", "¿Por qué los futuros deben fijarse (`Pin`) antes de consultarlos?"],
    a: ["An async block may hold references into itself, across an `.await`; moving it would break them", "Un bloc async peut garder des références vers lui-même, pendant un `.await` ; le déplacer les casserait", "Un bloque async puede guardar referencias a sí mismo, durante un `.await`; moverlo las rompería"],
    w: [["To keep them on the stack", "Pour les garder sur la pile", "Para mantenerlos en la pila"], ["To make them thread-safe", "Pour les rendre sûrs entre threads", "Para hacerlos seguros entre hilos"], ["To run them in order", "Pour les exécuter dans l'ordre", "Para ejecutarlos en orden"]],
    e: [
      "`let s = String::new(); let r = &s; something().await; use(r);` puts both `s` and `r` in the future's state: a self-referential struct. `Pin` promises it will not move. `Box::pin` or `std::pin::pin!` pin a future; most types are `Unpin` and do not care.",
      "`let s = String::new(); let r = &s; something().await; use(r);` met `s` et `r` dans l'état du futur : une struct auto-référente. `Pin` promet qu'elle ne bougera pas. `Box::pin` ou `std::pin::pin!` épinglent un futur ; la plupart des types sont `Unpin` et n'en ont cure.",
      "`let s = String::new(); let r = &s; something().await; use(r);` pone `s` y `r` en el estado del futuro: una struct autorreferente. `Pin` promete que no se moverá. `Box::pin` o `std::pin::pin!` fijan un futuro; la mayoría de tipos son `Unpin` y les da igual.",
    ],
  },
];

const buildTooling: RustQuestion[] = [
  {
    id: "rs-build-01",
    q: ["What is a `build.rs` file at a package's root?", "Qu'est-ce qu'un fichier `build.rs` à la racine d'un paquet ?", "¿Qué es un archivo `build.rs` en la raíz de un paquete?"],
    a: ["A build script Cargo compiles and runs before the crate: it can generate code, compile C, and tell Cargo how to link", "Un script de build que Cargo compile et lance avant le crate : il peut générer du code, compiler du C, et dire à Cargo comment lier", "Un script de compilación que Cargo compila y ejecuta antes del crate: puede generar código, compilar C, y decirle a Cargo cómo enlazar"],
    w: [["The crate's entry point", "Le point d'entrée du crate", "El punto de entrada del crate"], ["A Makefile for `cargo build`", "Un Makefile pour `cargo build`", "Un Makefile para `cargo build`"], ["Tests run after the build", "Des tests lancés après le build", "Pruebas que se ejecutan tras la compilación"]],
    e: [
      "It talks to Cargo by printing lines such as `cargo::rerun-if-changed=src/schema.json` or `cargo::rustc-link-lib=z` (the older form has one colon). Without `rerun-if-changed`, it reruns whenever any file of the package changes.",
      "Il parle à Cargo en affichant des lignes comme `cargo::rerun-if-changed=src/schema.json` ou `cargo::rustc-link-lib=z` (l'ancienne forme n'a qu'un deux-points). Sans `rerun-if-changed`, il se relance dès qu'un fichier du paquet change.",
      "Habla con Cargo mostrando líneas como `cargo::rerun-if-changed=src/schema.json` o `cargo::rustc-link-lib=z` (la forma antigua lleva un solo signo de dos puntos). Sin `rerun-if-changed`, se vuelve a ejecutar cada vez que cambia cualquier archivo del paquete.",
    ],
  },
  {
    id: "rs-build-02",
    q: ["What does `rust-version = \"1.80\"` in `Cargo.toml` do?", "Que fait `rust-version = \"1.80\"` dans `Cargo.toml` ?", "¿Qué hace `rust-version = \"1.80\"` en `Cargo.toml`?"],
    a: ["It states the oldest Rust supported: an older toolchain gets a clear error, and the resolver can prefer compatible dependency versions", "Il annonce le plus vieux Rust pris en charge : une chaîne plus ancienne reçoit une erreur claire, et le résolveur peut préférer des versions de dépendances compatibles", "Indica el Rust más antiguo admitido: una cadena más antigua recibe un error claro, y el resolvedor puede preferir versiones de dependencias compatibles"],
    w: [["It installs Rust 1.80", "Il installe Rust 1.80", "Instala Rust 1.80"], ["It forbids newer compilers", "Il interdit les compilateurs plus récents", "Prohíbe los compiladores más nuevos"], ["It selects the edition", "Il choisit l'édition", "Elige la edición"]],
    e: [
      "The minimum supported Rust version (MSRV). With resolver 3, the default for the 2024 edition, Cargo picks dependency versions whose own `rust-version` fits. `rust-toolchain.toml` is what pins the toolchain a project builds with.",
      "La version minimale de Rust prise en charge (MSRV). Avec le résolveur 3, par défaut pour l'édition 2024, Cargo choisit des versions de dépendances dont le propre `rust-version` convient. C'est `rust-toolchain.toml` qui fixe la chaîne avec laquelle un projet se compile.",
      "La versión mínima de Rust admitida (MSRV). Con el resolvedor 3, el predeterminado de la edición 2024, Cargo elige versiones de dependencias cuyo propio `rust-version` encaja. Es `rust-toolchain.toml` lo que fija la cadena con la que se compila un proyecto.",
    ],
  },
  {
    id: "rs-build-03",
    q: ["How do you build a Linux program for a 64-bit ARM board from an x86 laptop?", "Comment compiler un programme Linux pour une carte ARM 64 bits depuis un portable x86 ?", "¿Cómo se compila un programa Linux para una placa ARM de 64 bits desde un portátil x86?"],
    a: ["`rustup target add aarch64-unknown-linux-gnu`, then `cargo build --target aarch64-unknown-linux-gnu`, with a linker for that target", "`rustup target add aarch64-unknown-linux-gnu`, puis `cargo build --target aarch64-unknown-linux-gnu`, avec un éditeur de liens pour cette cible", "`rustup target add aarch64-unknown-linux-gnu`, y luego `cargo build --target aarch64-unknown-linux-gnu`, con un enlazador para ese destino"],
    w: [["It is impossible: build on the board", "Impossible : compiler sur la carte", "Imposible: compilar en la placa"], ["`cargo build --arch arm`", "`cargo build --arch arm`", "`cargo build --arch arm`"], ["Copy the x86 binary: Rust programs are portable", "Copier le binaire x86 : les programmes Rust sont portables", "Copiar el binario x86: los programas Rust son portables"]],
    e: [
      "rustc compiles for any target LLVM knows; rustup adds the target's standard library. The linker (and any C libraries) must match the target: tools such as `cross` (Docker) or `cargo zigbuild` provide them. The output lands in `target/<triple>/`.",
      "rustc compile pour toute cible connue de LLVM ; rustup ajoute la bibliothèque standard de la cible. L'éditeur de liens (et les bibliothèques C éventuelles) doit correspondre à la cible : des outils comme `cross` (Docker) ou `cargo zigbuild` les fournissent. Le résultat arrive dans `target/<triple>/`.",
      "rustc compila para cualquier destino que conozca LLVM; rustup añade la biblioteca estándar del destino. El enlazador (y las bibliotecas C que haya) debe corresponder al destino: herramientas como `cross` (Docker) o `cargo zigbuild` los proporcionan. El resultado va a `target/<triple>/`.",
    ],
  },
  {
    id: "rs-build-04",
    q: ["Which commands does a typical Rust CI run before the tests?", "Quelles commandes une CI Rust typique lance-t-elle avant les tests ?", "¿Qué órdenes ejecuta una CI típica de Rust antes de las pruebas?"],
    a: ["`cargo fmt --check` and `cargo clippy -- -D warnings`", "`cargo fmt --check` et `cargo clippy -- -D warnings`", "`cargo fmt --check` y `cargo clippy -- -D warnings`"],
    w: [["`cargo clean` and `cargo update`", "`cargo clean` et `cargo update`", "`cargo clean` y `cargo update`"], ["`rustc --lint`", "`rustc --lint`", "`rustc --lint`"], ["`cargo publish --dry-run` only", "`cargo publish --dry-run` seulement", "Solo `cargo publish --dry-run`"]],
    e: [
      "`fmt --check` fails on unformatted code; `clippy` adds hundreds of lints, and `-D warnings` turns warnings into errors so they cannot pile up. `cargo audit` (installed separately) checks the lockfile against the RustSec advisories.",
      "`fmt --check` échoue sur du code non formaté ; `clippy` ajoute des centaines de lints, et `-D warnings` change les avertissements en erreurs pour qu'ils ne s'accumulent pas. `cargo audit` (installé à part) vérifie le fichier de verrouillage face aux alertes RustSec.",
      "`fmt --check` falla con código sin formato; `clippy` añade cientos de lints, y `-D warnings` convierte los avisos en errores para que no se acumulen. `cargo audit` (se instala aparte) comprueba el archivo de bloqueo contra los avisos de RustSec.",
    ],
  },
  {
    id: "rs-build-05",
    q: ["A published crate version has a serious bug. What does `cargo yank` do?", "Une version publiée d'un crate a un bug grave. Que fait `cargo yank` ?", "Una versión publicada de un crate tiene un fallo grave. ¿Qué hace `cargo yank`?"],
    a: ["Stops new projects from picking that version; existing `Cargo.lock` files keep it, and the code is not deleted", "Empêche les nouveaux projets de choisir cette version ; les `Cargo.lock` existants la gardent, et le code n'est pas supprimé", "Impide que los proyectos nuevos elijan esa versión; los `Cargo.lock` existentes la conservan, y el código no se borra"],
    w: [["Deletes the version from crates.io", "Supprime la version de crates.io", "Borra la versión de crates.io"], ["Replaces it with the previous one everywhere", "La remplace partout par la précédente", "La sustituye en todas partes por la anterior"], ["Sends an update to every user", "Envoie une mise à jour à chaque utilisateur", "Envía una actualización a cada usuario"]],
    e: [
      "crates.io is permanent so that builds stay reproducible: a version can never be overwritten or removed. Yanking hides it from resolution; the fix is a new version. Leaked secrets in a published crate must be revoked, since the code stays downloadable.",
      "crates.io est permanent pour que les builds restent reproductibles : une version ne peut jamais être écrasée ni retirée. Le yank la cache à la résolution ; la correction est une nouvelle version. Des secrets publiés dans un crate doivent être révoqués, car le code reste téléchargeable.",
      "crates.io es permanente para que las compilaciones sigan siendo reproducibles: una versión nunca se puede sobrescribir ni quitar. El yank la oculta a la resolución; la corrección es una versión nueva. Los secretos publicados en un crate deben revocarse, porque el código sigue descargable.",
    ],
  },
];

const unsafeRust: RustQuestion[] = [
  {
    id: "rs-unsafe-01",
    q: ["What does an `unsafe` block allow that safe Rust does not?", "Que permet un bloc `unsafe` que le Rust sûr ne permet pas ?", "¿Qué permite un bloque `unsafe` que el Rust seguro no permite?"],
    a: ["Five things: dereference raw pointers, call `unsafe` functions, use `static mut`, implement `unsafe` traits, read union fields", "Cinq choses : déréférencer des pointeurs bruts, appeler des fonctions `unsafe`, utiliser un `static mut`, implémenter des traits `unsafe`, lire les champs d'une union", "Cinco cosas: desreferenciar punteros crudos, llamar funciones `unsafe`, usar `static mut`, implementar traits `unsafe`, leer campos de una unión"],
    w: [["Turning off the borrow checker inside it", "Désactiver le vérificateur d'emprunts à l'intérieur", "Desactivar dentro el comprobador de préstamos"], ["Ignoring type errors", "Ignorer les erreurs de type", "Ignorar los errores de tipo"], ["Skipping bounds checks everywhere in the block", "Sauter partout les vérifications de bornes dans le bloc", "Saltarse en todo el bloque las comprobaciones de límites"]],
    e: [
      "Types and borrows of references are still checked inside `unsafe`; the block only unlocks those operations, whose safety the compiler cannot verify. The author promises the invariants hold, usually written in a `// SAFETY:` comment.",
      "Les types et les emprunts de références sont toujours vérifiés dans `unsafe` ; le bloc ne débloque que ces opérations, dont le compilateur ne peut pas vérifier la sûreté. L'auteur promet que les invariants tiennent, en général dans un commentaire `// SAFETY:`.",
      "Los tipos y los préstamos de referencias se siguen comprobando dentro de `unsafe`; el bloque solo desbloquea esas operaciones, cuya seguridad el compilador no puede verificar. El autor promete que se cumplen los invariantes, normalmente en un comentario `// SAFETY:`.",
    ],
  },
  {
    id: "rs-unsafe-02",
    q: ["Is `let p = &x as *const i32;` unsafe?", "`let p = &x as *const i32;` est-il unsafe ?", "¿Es unsafe `let p = &x as *const i32;`?"],
    a: ["No: making a raw pointer is safe; reading through it (`*p`) needs `unsafe`", "Non : créer un pointeur brut est sûr ; lire à travers lui (`*p`) demande `unsafe`", "No: crear un puntero crudo es seguro; leer a través de él (`*p`) requiere `unsafe`"],
    w: [["Yes: raw pointers are unsafe to create", "Oui : les pointeurs bruts sont unsafe à créer", "Sí: crear punteros crudos es unsafe"], ["It does not compile", "Ça ne compile pas", "No compila"], ["Yes, unless `x` is `mut`", "Oui, sauf si `x` est `mut`", "Sí, salvo que `x` sea `mut`"]],
    e: [
      "A raw pointer is only an address: holding one harms nothing. Dereferencing assumes it is valid, aligned and not aliased against the rules. `&raw const x` (Rust 1.82) creates one without going through a reference.",
      "Un pointeur brut n'est qu'une adresse : en avoir un ne nuit à rien. Le déréférencer suppose qu'il est valide, aligné et sans alias contraire aux règles. `&raw const x` (Rust 1.82) en crée un sans passer par une référence.",
      "Un puntero crudo es solo una dirección: tener uno no daña nada. Desreferenciarlo supone que es válido, está alineado y no tiene alias contrarios a las reglas. `&raw const x` (Rust 1.82) crea uno sin pasar por una referencia.",
    ],
  },
  {
    id: "rs-unsafe-03",
    q: ["What is undefined behaviour in Rust, for example?", "Qu'est-ce qui est un comportement indéfini en Rust, par exemple ?", "¿Qué es comportamiento indefinido en Rust, por ejemplo?"],
    a: ["Two live `&mut` to the same data, a `bool` holding 3, a data race, reading uninitialized memory", "Deux `&mut` vivants vers les mêmes données, un `bool` qui vaut 3, une course de données, lire de la mémoire non initialisée", "Dos `&mut` vivos hacia los mismos datos, un `bool` que vale 3, una carrera de datos, leer memoria sin inicializar"],
    w: [["A panic", "Un panic", "Un pánico"], ["A memory leak", "Une fuite de mémoire", "Una fuga de memoria"], ["A deadlock", "Un interblocage", "Un interbloqueo"]],
    e: [
      "The optimizer assumes UB never happens, so a program with UB can do anything, even far from the cause. Panics, leaks and deadlocks are bugs but defined; safe Rust cannot cause UB, which is the whole promise.",
      "L'optimiseur suppose que le comportement indéfini n'arrive jamais : un programme qui en contient peut faire n'importe quoi, même loin de la cause. Panics, fuites et interblocages sont des bugs mais définis ; le Rust sûr ne peut pas en provoquer, c'est toute la promesse.",
      "El optimizador supone que el comportamiento indefinido nunca ocurre, así que un programa que lo tiene puede hacer cualquier cosa, incluso lejos de la causa. Pánicos, fugas e interbloqueos son fallos pero definidos; el Rust seguro no puede causarlo, esa es toda la promesa.",
    ],
  },
  {
    id: "rs-unsafe-04",
    q: ["How do you look for undefined behaviour in your `unsafe` code?", "Comment chercher un comportement indéfini dans votre code `unsafe` ?", "¿Cómo se busca comportamiento indefinido en su código `unsafe`?"],
    a: ["Run the tests under Miri: `cargo +nightly miri test`", "Lancer les tests sous Miri : `cargo +nightly miri test`", "Ejecutar las pruebas con Miri: `cargo +nightly miri test`"],
    w: [["`cargo clippy` finds all of it", "`cargo clippy` le trouve en entier", "`cargo clippy` lo encuentra todo"], ["A release build crashes when there is some", "Un build de release plante quand il y en a", "Una compilación de release falla cuando lo hay"], ["`rustc --check-ub`", "`rustc --check-ub`", "`rustc --check-ub`"]],
    e: [
      "Miri interprets the program and checks each operation against Rust's rules: aliasing, alignment, uninitialized reads, leaks. It is slow and only sees the paths the tests take. Sanitizers (`-Zsanitizer=address`) are a complement.",
      "Miri interprète le programme et vérifie chaque opération face aux règles de Rust : alias, alignement, lectures non initialisées, fuites. Il est lent et ne voit que les chemins pris par les tests. Les sanitizers (`-Zsanitizer=address`) sont un complément.",
      "Miri interpreta el programa y comprueba cada operación contra las reglas de Rust: alias, alineación, lecturas sin inicializar, fugas. Es lento y solo ve los caminos que recorren las pruebas. Los sanitizers (`-Zsanitizer=address`) son un complemento.",
    ],
  },
  {
    id: "rs-unsafe-05",
    q: ["In the 2024 edition, `static mut COUNT: u32` and `COUNT += 1` in an `unsafe` block: what does the compiler say about `&COUNT`?", "Dans l'édition 2024, `static mut COUNT: u32` et `COUNT += 1` dans un bloc `unsafe` : que dit le compilateur de `&COUNT` ?", "En la edición 2024, `static mut COUNT: u32` y `COUNT += 1` en un bloque `unsafe`: ¿qué dice el compilador de `&COUNT`?"],
    a: ["References to a `static mut` are denied (`static_mut_refs`): use an atomic, a `Mutex`, or `&raw mut COUNT`", "Les références vers un `static mut` sont refusées (`static_mut_refs`) : utiliser un atomique, un `Mutex`, ou `&raw mut COUNT`", "Las referencias a un `static mut` se rechazan (`static_mut_refs`): usar un atómico, un `Mutex`, o `&raw mut COUNT`"],
    w: [["Nothing: `unsafe` allows it", "Rien : `unsafe` le permet", "Nada: `unsafe` lo permite"], ["`static mut` no longer exists", "`static mut` n'existe plus", "`static mut` ya no existe"], ["It must be `const mut`", "Il faut `const mut`", "Debe ser `const mut`"]],
    e: [
      "A reference to a `static mut` is undefined behaviour as soon as another one, or a write, overlaps it, which is almost impossible to rule out; the lint is deny-by-default in 2024. `static COUNT: AtomicU32` needs no `unsafe` at all.",
      "Une référence vers un `static mut` est un comportement indéfini dès qu'une autre, ou une écriture, la chevauche, ce qu'il est presque impossible d'exclure ; le lint est refusé par défaut en 2024. `static COUNT: AtomicU32` ne demande aucun `unsafe`.",
      "Una referencia a un `static mut` es comportamiento indefinido en cuanto otra, o una escritura, se solapa, cosa casi imposible de descartar; el lint se rechaza por defecto en 2024. `static COUNT: AtomicU32` no requiere ningún `unsafe`.",
    ],
  },
];

const ffi: RustQuestion[] = [
  {
    id: "rs-ffi-01",
    q: ["How do you declare C's `abs` to call it from Rust, in the 2024 edition?", "Comment déclarer le `abs` du C pour l'appeler depuis Rust, dans l'édition 2024 ?", "¿Cómo se declara el `abs` de C para llamarlo desde Rust, en la edición 2024?"],
    a: ["`unsafe extern \"C\" { fn abs(x: i32) -> i32; }`, then call it in an `unsafe` block", "`unsafe extern \"C\" { fn abs(x: i32) -> i32; }`, puis l'appeler dans un bloc `unsafe`", "`unsafe extern \"C\" { fn abs(x: i32) -> i32; }`, y luego llamarla en un bloque `unsafe`"],
    w: [["`#include <stdlib.h>`", "`#include <stdlib.h>`", "`#include <stdlib.h>`"], ["`use libc::abs;` with nothing else, no `unsafe`", "`use libc::abs;` sans rien d'autre, sans `unsafe`", "`use libc::abs;` sin nada más, sin `unsafe`"], ["`extern crate c;`", "`extern crate c;`", "`extern crate c;`"]],
    e: [
      "The compiler cannot check a foreign signature; the 2024 edition makes the block itself `unsafe extern` to say so. Items inside may be marked `safe fn` when the declaration is known to be harmless. The `libc` crate declares most of the C library.",
      "Le compilateur ne peut pas vérifier une signature étrangère ; l'édition 2024 fait écrire le bloc lui-même `unsafe extern` pour le dire. Les éléments à l'intérieur peuvent être marqués `safe fn` quand la déclaration est sans danger. Le crate `libc` déclare l'essentiel de la bibliothèque C.",
      "El compilador no puede comprobar una firma extranjera; la edición 2024 hace escribir el propio bloque `unsafe extern` para decirlo. Los elementos de dentro pueden marcarse `safe fn` cuando la declaración es inofensiva. El crate `libc` declara casi toda la biblioteca C.",
    ],
  },
  {
    id: "rs-ffi-02",
    q: ["Why put `#[repr(C)]` on a struct passed to C?", "Pourquoi mettre `#[repr(C)]` sur une struct passée au C ?", "¿Por qué poner `#[repr(C)]` en una struct que se pasa a C?"],
    a: ["Rust may reorder and pad fields as it likes; `repr(C)` uses C's layout, in declaration order", "Rust peut réordonner et remplir les champs à sa guise ; `repr(C)` prend la disposition du C, dans l'ordre de déclaration", "Rust puede reordenar y rellenar los campos a su gusto; `repr(C)` usa la disposición de C, en orden de declaración"],
    w: [["To make it `Copy`", "Pour la rendre `Copy`", "Para hacerla `Copy`"], ["To allocate it with `malloc`", "Pour l'allouer avec `malloc`", "Para asignarla con `malloc`"], ["To allow `unsafe` code on it", "Pour permettre du code `unsafe` dessus", "Para permitir código `unsafe` sobre ella"]],
    e: [
      "The default layout is unspecified, so the compiler can shrink structs. Across FFI, both sides must agree byte for byte. `repr(u8)` and `repr(C)` on enums fix their tag; `repr(transparent)` gives a newtype its field's exact layout.",
      "La disposition par défaut n'est pas spécifiée, ce qui permet au compilateur de réduire les structs. À travers une FFI, les deux côtés doivent s'accorder octet par octet. `repr(u8)` et `repr(C)` sur un enum fixent son étiquette ; `repr(transparent)` donne à un newtype la disposition exacte de son champ.",
      "La disposición por defecto no está especificada, lo que permite al compilador reducir las structs. A través de una FFI, los dos lados deben coincidir byte a byte. `repr(u8)` y `repr(C)` en un enum fijan su etiqueta; `repr(transparent)` da a un newtype la disposición exacta de su campo.",
    ],
  },
  {
    id: "rs-ffi-03",
    q: ["How do you pass a Rust `String` to a C function expecting `const char*`?", "Comment passer une `String` Rust à une fonction C qui attend un `const char*` ?", "¿Cómo se pasa un `String` de Rust a una función C que espera un `const char*`?"],
    a: ["`let c = CString::new(s)?;` then `c.as_ptr()`, keeping `c` alive during the call", "`let c = CString::new(s)?;` puis `c.as_ptr()`, en gardant `c` en vie pendant l'appel", "`let c = CString::new(s)?;` y luego `c.as_ptr()`, manteniendo `c` vivo durante la llamada"],
    w: [["`s.as_ptr()` directly", "`s.as_ptr()` directement", "`s.as_ptr()` directamente"], ["`&s as *const char`", "`&s as *const char`", "`&s as *const char`"], ["`s.into_bytes().as_ptr()`", "`s.into_bytes().as_ptr()`", "`s.into_bytes().as_ptr()`"]],
    e: [
      "A `String` has no terminating zero and may contain one inside; `CString::new` adds the terminator and fails on an interior zero. `CString::new(s)?.as_ptr()` in one expression frees the `CString` at once: a dangling pointer. `CStr` reads C strings back.",
      "Une `String` n'a pas de zéro final et peut en contenir un ; `CString::new` ajoute le terminateur et échoue sur un zéro intérieur. `CString::new(s)?.as_ptr()` en une seule expression libère le `CString` aussitôt : un pointeur pendant. `CStr` relit les chaînes du C.",
      "Un `String` no tiene cero final y puede contener uno dentro; `CString::new` añade el terminador y falla ante un cero interior. `CString::new(s)?.as_ptr()` en una sola expresión libera el `CString` en el acto: un puntero colgante. `CStr` lee de vuelta las cadenas de C.",
    ],
  },
  {
    id: "rs-ffi-04",
    q: ["How do you export a Rust function for C to call, in the 2024 edition?", "Comment exporter une fonction Rust pour que le C l'appelle, dans l'édition 2024 ?", "¿Cómo se exporta una función de Rust para que C la llame, en la edición 2024?"],
    a: ["`#[unsafe(no_mangle)] pub extern \"C\" fn add(a: i32, b: i32) -> i32`, in a crate built as `cdylib` or `staticlib`", "`#[unsafe(no_mangle)] pub extern \"C\" fn add(a: i32, b: i32) -> i32`, dans un crate compilé en `cdylib` ou `staticlib`", "`#[unsafe(no_mangle)] pub extern \"C\" fn add(a: i32, b: i32) -> i32`, en un crate compilado como `cdylib` o `staticlib`"],
    w: [["`pub fn add` is enough", "`pub fn add` suffit", "`pub fn add` basta"], ["`#[export] fn add`", "`#[export] fn add`", "`#[export] fn add`"], ["`extern crate add;`", "`extern crate add;`", "`extern crate add;`"]],
    e: [
      "`extern \"C\"` uses C's calling convention; `no_mangle` keeps the symbol name `add`. Since two exported symbols with one name are undefined behaviour, the 2024 edition wants the attribute written `unsafe(...)`. `cbindgen` writes the matching C header.",
      "`extern \"C\"` utilise la convention d'appel du C ; `no_mangle` garde le nom de symbole `add`. Comme deux symboles exportés de même nom sont un comportement indéfini, l'édition 2024 veut l'attribut écrit `unsafe(...)`. `cbindgen` écrit l'en-tête C correspondant.",
      "`extern \"C\"` usa la convención de llamada de C; `no_mangle` mantiene el nombre de símbolo `add`. Como dos símbolos exportados con el mismo nombre son comportamiento indefinido, la edición 2024 pide el atributo escrito `unsafe(...)`. `cbindgen` escribe la cabecera C correspondiente.",
    ],
  },
  {
    id: "rs-ffi-05",
    q: ["A Rust `extern \"C\"` function called from C panics. What happens?", "Une fonction Rust `extern \"C\"` appelée depuis le C panique. Que se passe-t-il ?", "Una función de Rust `extern \"C\"` llamada desde C provoca un pánico. ¿Qué pasa?"],
    a: ["The process aborts (since Rust 1.81): a panic cannot unwind into C; catch it with `catch_unwind`, or use `extern \"C-unwind\"`", "Le processus s'arrête net (depuis Rust 1.81) : un panic ne peut pas se dérouler dans du C ; l'attraper avec `catch_unwind`, ou utiliser `extern \"C-unwind\"`", "El proceso aborta (desde Rust 1.81): un pánico no puede propagarse hacia C; capturarlo con `catch_unwind`, o usar `extern \"C-unwind\"`"],
    w: [["C receives an error code", "Le C reçoit un code d'erreur", "C recibe un código de error"], ["The panic unwinds through the C frames to Rust", "Le panic se déroule à travers les cadres C jusqu'à Rust", "El pánico se propaga por los marcos de C hasta Rust"], ["The panic is ignored", "Le panic est ignoré", "El pánico se ignora"]],
    e: [
      "Unwinding through foreign frames was undefined behaviour; now an `extern \"C\"` function aborts instead. A callback that may panic wraps its body in `std::panic::catch_unwind` and turns the panic into an error code for C.",
      "Dérouler à travers des cadres étrangers était un comportement indéfini ; désormais une fonction `extern \"C\"` s'arrête net à la place. Un rappel qui peut paniquer enveloppe son corps dans `std::panic::catch_unwind` et transforme le panic en code d'erreur pour le C.",
      "Propagar a través de marcos extranjeros era comportamiento indefinido; ahora una función `extern \"C\"` aborta en su lugar. Una retrollamada que pueda provocar un pánico envuelve su cuerpo en `std::panic::catch_unwind` y convierte el pánico en un código de error para C.",
    ],
  },
];

export const ownership = { interior };
export const typesTopic = { advancedTraits };
export const concurrency = { async: asyncRust };
export const cargo = { buildTooling };
export const unsafeTopic = { unsafeRust, ffi };
