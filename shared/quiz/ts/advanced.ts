/**
 * TypeScript, Avancé: closures, structural typing, control-flow analysis,
 * utility types, mapped and conditional types, JavaScript pitfalls, strict
 * compiler options.
 */
import type { LinuxQuestion as TsQuestion } from "../linux/types";

const closures: TsQuestion[] = [
  {
    id: "ts-clos-01",
    q: ["What does `function counter() { let n = 0; return () => ++n; }` give?", "Que donne `function counter() { let n = 0; return () => ++n; }` ?", "¿Qué da `function counter() { let n = 0; return () => ++n; }`?"],
    a: ["A function that keeps its own `n`: each `counter()` makes a new, independent count", "Une fonction qui garde son propre `n` : chaque `counter()` crée un nouveau compte, indépendant", "Una función que conserva su propio `n`: cada `counter()` crea una cuenta nueva e independiente"],
    w: [["A function that always returns 1", "Une fonction qui renvoie toujours 1", "Una función que siempre devuelve 1"], ["A shared global counter", "Un compteur global partagé", "Un contador global compartido"], ["An error: `n` no longer exists after `counter` returns", "Une erreur : `n` n'existe plus quand `counter` a rendu la main", "Un error: `n` ya no existe cuando `counter` termina"]],
    e: [
      "A closure keeps the variables of the scope where it was created alive as long as it lives. It is how JavaScript makes private state without classes; the variable is shared by every closure created in the same call.",
      "Une closure garde en vie les variables de la portée où elle a été créée, tant qu'elle vit. C'est ainsi que JavaScript fait un état privé sans classes ; la variable est partagée par toutes les closures créées dans le même appel.",
      "Una clausura mantiene vivas las variables del ámbito donde se creó mientras ella viva. Así hace JavaScript estado privado sin clases; la variable la comparten todas las clausuras creadas en la misma llamada.",
    ],
  },
  {
    id: "ts-clos-02",
    q: ["Inside `setTimeout(() => this.save(), 100)` in a method, what is `this`?", "Dans `setTimeout(() => this.save(), 100)` à l'intérieur d'une méthode, que vaut `this` ?", "Dentro de `setTimeout(() => this.save(), 100)` en un método, ¿qué es `this`?"],
    a: ["The method's `this`: an arrow function has no `this` of its own", "Le `this` de la méthode : une fonction fléchée n'a pas de `this` à elle", "El `this` del método: una función flecha no tiene `this` propio"],
    w: [["`undefined`", "`undefined`", "`undefined`"], ["The global object", "L'objet global", "El objeto global"], ["The timer", "La minuterie", "El temporizador"]],
    e: [
      "Arrow functions take `this` (and `arguments`) from the surrounding code, which is why they fit callbacks. A `function () { this.save() }` here would get its own `this`, `undefined` in strict code.",
      "Les fonctions fléchées prennent `this` (et `arguments`) du code qui les entoure, ce qui les rend adaptées aux rappels. Un `function () { this.save() }` aurait ici son propre `this`, `undefined` en code strict.",
      "Las funciones flecha toman `this` (y `arguments`) del código que las rodea, por eso encajan en las retrollamadas. Un `function () { this.save() }` tendría aquí su propio `this`, `undefined` en código estricto.",
    ],
  },
  {
    id: "ts-clos-03",
    q: ["What does a debounce function do with closures?", "Que fait une fonction de debounce avec des closures ?", "¿Qué hace una función debounce con clausuras?"],
    a: ["Keeps a timer in a closure and restarts it on each call, so the work runs once the calls stop", "Garde une minuterie dans une closure et la relance à chaque appel, pour que le travail se fasse une fois les appels arrêtés", "Guarda un temporizador en una clausura y lo reinicia en cada llamada, para que el trabajo se haga cuando cesan las llamadas"],
    w: [["Runs the function twice", "Exécute la fonction deux fois", "Ejecuta la función dos veces"], ["Removes bugs from the function", "Retire les bugs de la fonction", "Quita los fallos de la función"], ["Runs the function in another thread", "Exécute la fonction dans un autre thread", "Ejecuta la función en otro hilo"]],
    e: [
      "`let t: ReturnType<typeof setTimeout> | undefined;` lives in the closure; each call does `clearTimeout(t)` then sets a new timer. Typing it with `ReturnType` works in browsers (a number) and Node (an object).",
      "`let t: ReturnType<typeof setTimeout> | undefined;` vit dans la closure ; chaque appel fait `clearTimeout(t)` puis pose une nouvelle minuterie. Le typer avec `ReturnType` marche dans les navigateurs (un nombre) et dans Node (un objet).",
      "`let t: ReturnType<typeof setTimeout> | undefined;` vive en la clausura; cada llamada hace `clearTimeout(t)` y pone un temporizador nuevo. Tiparlo con `ReturnType` funciona en navegadores (un número) y en Node (un objeto).",
    ],
  },
  {
    id: "ts-clos-04",
    q: ["A closure holds a large array that is no longer needed. What happens to the memory?", "Une closure tient un grand tableau qui ne sert plus. Qu'arrive-t-il à la mémoire ?", "Una clausura retiene un array grande que ya no hace falta. ¿Qué pasa con la memoria?"],
    a: ["It stays allocated as long as the closure is reachable (a listener never removed, say)", "Elle reste allouée tant que la closure est atteignable (un écouteur jamais retiré, par exemple)", "Sigue asignada mientras la clausura sea alcanzable (un listener nunca quitado, por ejemplo)"],
    w: [["It is freed when the outer function returns", "Elle est libérée au retour de la fonction extérieure", "Se libera cuando termina la función exterior"], ["It is freed after a minute", "Elle est libérée au bout d'une minute", "Se libera al cabo de un minuto"], ["Closures copy only small values", "Les closures ne copient que des petites valeurs", "Las clausuras solo copian valores pequeños"]],
    e: [
      "The garbage collector frees what is unreachable. Event listeners, timers and caches that keep closures alive are the usual leaks: `removeEventListener`, `clearInterval`, or an `AbortController` signal end them.",
      "Le ramasse-miettes libère ce qui n'est plus atteignable. Écouteurs d'événements, minuteries et caches qui gardent des closures en vie sont les fuites habituelles : `removeEventListener`, `clearInterval`, ou un signal d'`AbortController` y mettent fin.",
      "El recolector de basura libera lo inalcanzable. Los listeners de eventos, temporizadores y cachés que mantienen vivas clausuras son las fugas habituales: `removeEventListener`, `clearInterval`, o una señal de `AbortController` las terminan.",
    ],
  },
  {
    id: "ts-clos-05",
    q: ["Why does TypeScript lose a narrowing inside a callback: `if (user) { items.forEach(() => user.name) }` with `let user`?", "Pourquoi TypeScript perd-il un affinement dans un rappel : `if (user) { items.forEach(() => user.name) }` avec `let user` ?", "¿Por qué TypeScript pierde un estrechamiento dentro de una retrollamada: `if (user) { items.forEach(() => user.name) }` con `let user`?"],
    a: ["The callback might run later, after `user` was reassigned; with a `const`, or a `let` never reassigned after it, it keeps the narrowing", "Le rappel pourrait s'exécuter plus tard, après une réaffectation de `user` ; avec une `const`, ou un `let` jamais réaffecté ensuite, l'affinement est gardé", "La retrollamada podría ejecutarse más tarde, tras reasignarse `user`; con una `const`, o un `let` que no se reasigna después, se conserva el estrechamiento"],
    w: [["Callbacks are never type-checked", "Les rappels ne sont jamais vérifiés", "Las retrollamadas nunca se comprueban"], ["`forEach` erases types", "`forEach` efface les types", "`forEach` borra los tipos"], ["It is a bug fixed by `as any`", "C'est un bug corrigé par `as any`", "Es un fallo que se corrige con `as any`"]],
    e: [
      "Narrowing is per code location; a closure may run at any time. Since TypeScript 5.4, narrowings are kept in closures created after the last assignment. Copying into a `const` first is the classic fix.",
      "L'affinement vaut pour un endroit du code ; une closure peut s'exécuter à tout moment. Depuis TypeScript 5.4, les affinements sont gardés dans les closures créées après la dernière affectation. Copier d'abord dans une `const` est la correction classique.",
      "El estrechamiento vale para un lugar del código; una clausura puede ejecutarse en cualquier momento. Desde TypeScript 5.4, los estrechamientos se conservan en las clausuras creadas tras la última asignación. Copiar antes a una `const` es la corrección clásica.",
    ],
  },
];

const structural: TsQuestion[] = [
  {
    id: "ts-struct-01",
    q: ["`interface Meters { value: number }` and `interface Feet { value: number }`: can a `Feet` be passed where `Meters` is expected?", "`interface Meters { value: number }` et `interface Feet { value: number }` : peut-on passer un `Feet` là où `Meters` est attendu ?", "`interface Meters { value: number }` y `interface Feet { value: number }`: ¿se puede pasar un `Feet` donde se espera `Meters`?"],
    a: ["Yes: types are compared by shape, not by name", "Oui : les types se comparent par leur forme, pas par leur nom", "Sí: los tipos se comparan por su forma, no por su nombre"],
    w: [["No: different names are different types", "Non : des noms différents font des types différents", "No: nombres distintos son tipos distintos"], ["Only with `implements`", "Seulement avec `implements`", "Solo con `implements`"], ["Only at run time", "Seulement à l'exécution", "Solo al ejecutar"]],
    e: [
      "Structural typing fits JavaScript's objects, but two units with the same shape mix freely. A brand makes them distinct: `type Meters = number & { readonly __brand: \"m\" }`, created only through a checked function.",
      "Le typage structurel convient aux objets de JavaScript, mais deux unités de même forme se mélangent librement. Une marque les distingue : `type Meters = number & { readonly __brand: \"m\" }`, créée seulement par une fonction qui vérifie.",
      "El tipado estructural encaja con los objetos de JavaScript, pero dos unidades con la misma forma se mezclan libremente. Una marca las distingue: `type Meters = number & { readonly __brand: \"m\" }`, creada solo mediante una función que comprueba.",
    ],
  },
  {
    id: "ts-struct-02",
    q: ["A function takes `{}` as a parameter type. What does it accept?", "Une fonction prend `{}` comme type de paramètre. Qu'accepte-t-elle ?", "Una función toma `{}` como tipo de parámetro. ¿Qué acepta?"],
    a: ["Almost anything: every value except `null` and `undefined`, numbers and strings included", "Presque tout : toute valeur sauf `null` et `undefined`, nombres et chaînes compris", "Casi todo: cualquier valor salvo `null` y `undefined`, números y cadenas incluidos"],
    w: [["Only empty objects", "Seulement des objets vides", "Solo objetos vacíos"], ["Only objects, not primitives", "Seulement des objets, pas les primitives", "Solo objetos, no primitivos"], ["Nothing", "Rien", "Nada"]],
    e: [
      "`{}` means \"has no required properties\", which every non-nullish value satisfies. For any non-primitive, write `object`; for an empty object, `Record<string, never>`; for any value, `unknown`.",
      "`{}` veut dire « n'a aucune propriété obligatoire », ce que satisfait toute valeur non nulle. Pour tout non-primitif, écrire `object` ; pour un objet vide, `Record<string, never>` ; pour n'importe quelle valeur, `unknown`.",
      "`{}` significa «no tiene propiedades obligatorias», lo que cumple cualquier valor no nulo. Para cualquier no primitivo, escribir `object`; para un objeto vacío, `Record<string, never>`; para cualquier valor, `unknown`.",
    ],
  },
  {
    id: "ts-struct-03",
    q: ["Why is `Object.keys(user)` typed `string[]`, not `(keyof User)[]`?", "Pourquoi `Object.keys(user)` est-il typé `string[]`, et pas `(keyof User)[]` ?", "¿Por qué `Object.keys(user)` se tipa `string[]`, y no `(keyof User)[]`?"],
    a: ["The object may have more keys than its type lists: structural typing allows extra properties", "L'objet peut avoir plus de clés que son type n'en liste : le typage structurel permet des propriétés en plus", "El objeto puede tener más claves de las que lista su tipo: el tipado estructural permite propiedades de más"],
    w: [["It is an oversight in the standard library types", "C'est un oubli dans les types de la bibliothèque standard", "Es un descuido en los tipos de la biblioteca estándar"], ["Keys are always strings at run time, and nothing more is known", "Les clés sont toujours des chaînes, on ne sait rien de plus", "Las claves siempre son cadenas, no se sabe nada más"], ["`keyof` does not work on interfaces", "`keyof` ne marche pas sur les interfaces", "`keyof` no funciona con interfaces"]],
    e: [
      "An `Admin` with an extra `level` is a valid `User`, so `keyof User` would be a lie for it. When you know the object is exact, cast deliberately: `Object.keys(o) as (keyof typeof o)[]`.",
      "Un `Admin` avec un `level` en plus est un `User` valable : `keyof User` serait un mensonge pour lui. Quand on sait l'objet exact, convertir délibérément : `Object.keys(o) as (keyof typeof o)[]`.",
      "Un `Admin` con un `level` de más es un `User` válido, así que `keyof User` sería mentira para él. Cuando se sabe que el objeto es exacto, convertir a propósito: `Object.keys(o) as (keyof typeof o)[]`.",
    ],
  },
  {
    id: "ts-struct-04",
    q: ["Is a class instance's type checked by class name? `class A { x = 1 }`, `class B { x = 1 }`, `const a: A = new B();`", "Le type d'une instance est-il vérifié par le nom de la classe ? `class A { x = 1 }`, `class B { x = 1 }`, `const a: A = new B();`", "¿Se comprueba el tipo de una instancia por el nombre de la clase? `class A { x = 1 }`, `class B { x = 1 }`, `const a: A = new B();`"],
    a: ["No: it compiles, since `B` has the same public shape; private or `#` members make classes nominal", "Non : ça compile, `B` ayant la même forme publique ; des membres privés ou `#` rendent les classes nominales", "No: compila, ya que `B` tiene la misma forma pública; los miembros privados o `#` hacen nominales las clases"],
    w: [["Yes: classes are nominal", "Oui : les classes sont nominales", "Sí: las clases son nominales"], ["It compiles but `instanceof A` is then true", "Ça compile mais `instanceof A` est alors vrai", "Compila pero `instanceof A` es entonces verdadero"], ["Only with `strict`", "Seulement avec `strict`", "Solo con `strict`"]],
    e: [
      "`a instanceof A` is false at run time although the types agree: the checker and the prototype chain answer different questions. A `private` or `#` field declared in a class only matches itself.",
      "`a instanceof A` est faux à l'exécution alors que les types s'accordent : le vérificateur et la chaîne de prototypes répondent à des questions différentes. Un champ `private` ou `#` déclaré dans une classe ne correspond qu'à lui-même.",
      "`a instanceof A` es falso al ejecutar aunque los tipos coincidan: el comprobador y la cadena de prototipos responden a preguntas distintas. Un campo `private` o `#` declarado en una clase solo coincide consigo mismo.",
    ],
  },
  {
    id: "ts-struct-05",
    q: ["`const routes = { home: \"/\", about: \"/about\" } satisfies Record<string, string>;`: what is `keyof typeof routes`?", "`const routes = { home: \"/\", about: \"/about\" } satisfies Record<string, string>;` : que vaut `keyof typeof routes` ?", "`const routes = { home: \"/\", about: \"/about\" } satisfies Record<string, string>;`: ¿qué es `keyof typeof routes`?"],
    a: ["`\"home\" | \"about\"`: `satisfies` checks without widening the type to `Record<string, string>`", "`\"home\" | \"about\"` : `satisfies` vérifie sans élargir le type en `Record<string, string>`", "`\"home\" | \"about\"`: `satisfies` comprueba sin ampliar el tipo a `Record<string, string>`"],
    w: [["`string`", "`string`", "`string`"], ["`never`", "`never`", "`never`"], ["`\"/\" | \"/about\"`", "`\"/\" | \"/about\"`", "`\"/\" | \"/about\"`"]],
    e: [
      "With `const routes: Record<string, string>`, the keys become `string` and `routes.typo` type-checks. `satisfies` gets both: the check against the wider type, and the precise keys for autocompletion.",
      "Avec `const routes: Record<string, string>`, les clés deviennent `string` et `routes.typo` passe la vérification. `satisfies` obtient les deux : la vérification face au type large, et les clés précises pour la complétion.",
      "Con `const routes: Record<string, string>`, las claves pasan a ser `string` y `routes.typo` pasa la comprobación. `satisfies` consigue las dos cosas: la comprobación frente al tipo amplio, y las claves precisas para el autocompletado.",
    ],
  },
];

const controlFlow: TsQuestion[] = [
  {
    id: "ts-flow-01",
    q: ["`function f(x: string | null) { if (!x) return; … }`: what is `x` after the `if`?", "`function f(x: string | null) { if (!x) return; … }` : que vaut le type de `x` après le `if` ?", "`function f(x: string | null) { if (!x) return; … }`: ¿qué tipo tiene `x` tras el `if`?"],
    a: ["`string`, but the empty string was also sent back by `!x`", "`string`, mais la chaîne vide a aussi été renvoyée par `!x`", "`string`, pero la cadena vacía también salió por `!x`"],
    w: [["`string | null` still", "Toujours `string | null`", "Todavía `string | null`"], ["`null`", "`null`", "`null`"], ["`never`", "`never`", "`never`"]],
    e: [
      "Control-flow analysis follows returns, throws and assignments. A truthiness test narrows away `null` and `undefined`, and also drops \"\" at run time; when the empty string is valid, test `x === null`.",
      "L'analyse du flot de contrôle suit les retours, les erreurs levées et les affectations. Un test de vérité retire `null` et `undefined`, et écarte aussi \"\" à l'exécution ; quand la chaîne vide est valable, tester `x === null`.",
      "El análisis del flujo de control sigue los retornos, los errores lanzados y las asignaciones. Una prueba de veracidad quita `null` y `undefined`, y también descarta \"\" al ejecutar; cuando la cadena vacía es válida, probar `x === null`.",
    ],
  },
  {
    id: "ts-flow-02",
    q: ["Why does `if (typeof x === \"object\")` not narrow out `null`?", "Pourquoi `if (typeof x === \"object\")` n'écarte-t-il pas `null` ?", "¿Por qué `if (typeof x === \"object\")` no descarta `null`?"],
    a: ["Because `typeof null` is \"object\" in JavaScript; add `x !== null`", "Parce que `typeof null` vaut \"object\" en JavaScript ; ajouter `x !== null`", "Porque `typeof null` es \"object\" en JavaScript; añadir `x !== null`"],
    w: [["It is a TypeScript bug", "C'est un bug de TypeScript", "Es un fallo de TypeScript"], ["`typeof` does not narrow", "`typeof` n'affine pas", "`typeof` no estrecha"], ["It does narrow it out", "Il l'écarte bien", "Sí lo descarta"]],
    e: [
      "TypeScript models JavaScript faithfully, quirks included. `x !== null && typeof x === \"object\"` gives `object`; for arrays, `Array.isArray`.",
      "TypeScript modélise JavaScript fidèlement, bizarreries comprises. `x !== null && typeof x === \"object\"` donne `object` ; pour les tableaux, `Array.isArray`.",
      "TypeScript modela JavaScript con fidelidad, rarezas incluidas. `x !== null && typeof x === \"object\"` da `object`; para arrays, `Array.isArray`.",
    ],
  },
  {
    id: "ts-flow-03",
    q: ["`const value = map.get(key); if (map.has(key)) value.trim();` fails. Why?", "`const value = map.get(key); if (map.has(key)) value.trim();` échoue. Pourquoi ?", "`const value = map.get(key); if (map.has(key)) value.trim();` falla. ¿Por qué?"],
    a: ["`has` does not narrow `value`: TypeScript does not link the two calls; test `value !== undefined` instead", "`has` n'affine pas `value` : TypeScript ne relie pas les deux appels ; tester plutôt `value !== undefined`", "`has` no estrecha `value`: TypeScript no relaciona las dos llamadas; probar en su lugar `value !== undefined`"],
    w: [["`Map` values are always `any`", "Les valeurs d'une `Map` sont toujours `any`", "Los valores de un `Map` siempre son `any`"], ["`trim` does not exist on strings", "`trim` n'existe pas sur les chaînes", "`trim` no existe en las cadenas"], ["`has` must be called before `get`", "`has` doit être appelé avant `get`", "`has` debe llamarse antes que `get`"]],
    e: [
      "Narrowing works on what is tested; `has` and `get` are separate methods. Testing the value itself is also one lookup instead of two.",
      "L'affinement porte sur ce qui est testé ; `has` et `get` sont deux méthodes distinctes. Tester la valeur elle-même fait aussi une recherche au lieu de deux.",
      "El estrechamiento recae sobre lo que se prueba; `has` y `get` son métodos distintos. Probar el propio valor además hace una búsqueda en vez de dos.",
    ],
  },
  {
    id: "ts-flow-04",
    q: ["What does `x!` (a postfix `!`) do?", "Que fait `x!` (un `!` après) ?", "¿Qué hace `x!` (un `!` detrás)?"],
    a: ["Tells the compiler `x` is not `null` or `undefined`, with no check: a non-null assertion", "Dit au compilateur que `x` n'est ni `null` ni `undefined`, sans vérifier : une assertion de non-nullité", "Le dice al compilador que `x` no es `null` ni `undefined`, sin comprobar: una aserción de no nulo"],
    w: [["Negates `x`", "Prend la négation de `x`", "Niega `x`"], ["Throws if `x` is null", "Lève une erreur si `x` est nul", "Lanza un error si `x` es nulo"], ["Makes `x` required", "Rend `x` obligatoire", "Hace `x` obligatorio"]],
    e: [
      "It is erased, so a wrong `!` turns into a crash later and far away. Prefer a check, or an explicit failure: `x ?? throwError(\"missing x\")`. Lint rules can forbid `!`.",
      "Il est effacé : un `!` faux devient un plantage plus tard et ailleurs. Préférer un test, ou un échec explicite : `x ?? throwError(\"missing x\")`. Des règles de lint peuvent interdire `!`.",
      "Se borra, así que un `!` falso se convierte en un fallo más tarde y en otro sitio. Preferir una comprobación, o un fallo explícito: `x ?? throwError(\"missing x\")`. Hay reglas de lint que pueden prohibir `!`.",
    ],
  },
  {
    id: "ts-flow-05",
    q: ["`function fail(msg: string): never { throw new Error(msg); }`: why the `never` return type?", "`function fail(msg: string): never { throw new Error(msg); }` : pourquoi le type de retour `never` ?", "`function fail(msg: string): never { throw new Error(msg); }`: ¿por qué el tipo de retorno `never`?"],
    a: ["The code after a call to `fail` is known unreachable, so narrowing continues as after a `throw`", "Le code après un appel à `fail` est connu comme inatteignable, et l'affinement continue comme après un `throw`", "El código tras una llamada a `fail` se sabe inalcanzable, así que el estrechamiento sigue como tras un `throw`"],
    w: [["It means the function returns nothing", "Cela veut dire que la fonction ne renvoie rien", "Significa que la función no devuelve nada"], ["`never` is required for functions that throw", "`never` est obligatoire pour les fonctions qui lèvent une erreur", "`never` es obligatorio para las funciones que lanzan errores"], ["It makes the error impossible to catch", "Il rend l'erreur impossible à attraper", "Hace imposible capturar el error"]],
    e: [
      "`if (!user) fail(\"no user\");` then narrows `user` afterwards, provided the function's `never` return type is written explicitly. `void` would let the code continue in the checker's eyes.",
      "`if (!user) fail(\"no user\");` affine ensuite `user`, à condition que le type de retour `never` de la fonction soit écrit explicitement. Avec `void`, le code continuerait aux yeux du vérificateur.",
      "`if (!user) fail(\"no user\");` estrecha después `user`, siempre que el tipo de retorno `never` de la función esté escrito explícitamente. Con `void`, el código seguiría a ojos del comprobador.",
    ],
  },
];

const utility: TsQuestion[] = [
  {
    id: "ts-util-01",
    q: ["What does `Partial<User>` give?", "Que donne `Partial<User>` ?", "¿Qué da `Partial<User>`?"],
    a: ["`User` with every property optional", "`User` avec chaque propriété optionnelle", "`User` con cada propiedad opcional"],
    w: [["Half of `User`'s properties", "La moitié des propriétés de `User`", "La mitad de las propiedades de `User`"], ["`User` with every property `readonly`", "`User` avec chaque propriété en `readonly`", "`User` con cada propiedad `readonly`"], ["`User | undefined`", "`User | undefined`", "`User | undefined`"]],
    e: [
      "Typical for update functions: `update(id, changes: Partial<User>)`. It is one level deep. Its opposite is `Required<User>`; `Readonly<User>` adds `readonly`.",
      "Typique des fonctions de mise à jour : `update(id, changes: Partial<User>)`. Il agit sur un niveau. Son contraire est `Required<User>` ; `Readonly<User>` ajoute `readonly`.",
      "Típico de las funciones de actualización: `update(id, changes: Partial<User>)`. Actúa sobre un nivel. Su contrario es `Required<User>`; `Readonly<User>` añade `readonly`.",
    ],
  },
  {
    id: "ts-util-02",
    q: ["`Pick<User, \"id\" | \"name\">` and `Omit<User, \"password\">`: what do they make?", "`Pick<User, \"id\" | \"name\">` et `Omit<User, \"password\">` : que produisent-ils ?", "`Pick<User, \"id\" | \"name\">` y `Omit<User, \"password\">`: ¿qué producen?"],
    a: ["A type with only `id` and `name`; a type with everything but `password`", "Un type avec seulement `id` et `name` ; un type avec tout sauf `password`", "Un tipo con solo `id` y `name`; un tipo con todo salvo `password`"],
    w: [["Two objects, filtered at run time", "Deux objets, filtrés à l'exécution", "Dos objetos, filtrados al ejecutar"], ["The values of those properties", "Les valeurs de ces propriétés", "Los valores de esas propiedades"], ["Errors unless `User` is a class", "Des erreurs sauf si `User` est une classe", "Errores salvo que `User` sea una clase"]],
    e: [
      "They shape types, not objects: a value of type `Omit<User, \"password\">` built by spreading a `User` still carries the password at run time. Note that `Omit` accepts keys that do not exist, `Pick` does not.",
      "Ils façonnent des types, pas des objets : une valeur de type `Omit<User, \"password\">` construite en décomposant un `User` porte toujours le mot de passe à l'exécution. `Omit` accepte des clés inexistantes, `Pick` non.",
      "Dan forma a tipos, no a objetos: un valor de tipo `Omit<User, \"password\">` construido propagando un `User` sigue llevando la contraseña al ejecutar. `Omit` acepta claves que no existen, `Pick` no.",
    ],
  },
  {
    id: "ts-util-03",
    q: ["What is `Record<\"en\" | \"fr\", string>`?", "Qu'est-ce que `Record<\"en\" | \"fr\", string>` ?", "¿Qué es `Record<\"en\" | \"fr\", string>`?"],
    a: ["An object type with exactly the keys `en` and `fr`, both required, both strings", "Un type objet avec exactement les clés `en` et `fr`, obligatoires, toutes deux des chaînes", "Un tipo objeto con exactamente las claves `en` y `fr`, obligatorias, ambas cadenas"],
    w: [["A `Map` from languages to strings", "Une `Map` des langues vers des chaînes", "Un `Map` de idiomas a cadenas"], ["An object with `en` or `fr`", "Un objet avec `en` ou `fr`", "Un objeto con `en` o `fr`"], ["An array of two strings", "Un tableau de deux chaînes", "Un array de dos cadenas"]],
    e: [
      "With a union of literals as keys, `Record` makes every key required: adding \"es\" to the union flags every object that lacks it. With `string` as keys it is an open dictionary.",
      "Avec une union de littéraux comme clés, `Record` rend chaque clé obligatoire : ajouter \"es\" à l'union signale chaque objet qui ne l'a pas. Avec `string` comme clés, c'est un dictionnaire ouvert.",
      "Con una unión de literales como claves, `Record` hace obligatoria cada clave: añadir \"es\" a la unión señala cada objeto que no la tiene. Con `string` como claves es un diccionario abierto.",
    ],
  },
  {
    id: "ts-util-04",
    q: ["What do `Parameters<typeof f>` and `ReturnType<typeof f>` give?", "Que donnent `Parameters<typeof f>` et `ReturnType<typeof f>` ?", "¿Qué dan `Parameters<typeof f>` y `ReturnType<typeof f>`?"],
    a: ["The tuple of `f`'s parameter types, and its return type", "Le tuple des types des paramètres de `f`, et son type de retour", "La tupla de los tipos de los parámetros de `f`, y su tipo de retorno"],
    w: [["`f`'s argument values", "Les valeurs des arguments de `f`", "Los valores de los argumentos de `f`"], ["The number of parameters", "Le nombre de paramètres", "El número de parámetros"], ["Errors: functions have no types", "Des erreurs : les fonctions n'ont pas de types", "Errores: las funciones no tienen tipos"]],
    e: [
      "Useful to wrap a function without repeating its signature: `function logged(...args: Parameters<typeof f>): ReturnType<typeof f>`. Both are written with conditional types and `infer`.",
      "Utile pour envelopper une fonction sans répéter sa signature : `function logged(...args: Parameters<typeof f>): ReturnType<typeof f>`. Les deux sont écrits avec des types conditionnels et `infer`.",
      "Útil para envolver una función sin repetir su firma: `function logged(...args: Parameters<typeof f>): ReturnType<typeof f>`. Los dos se escriben con tipos condicionales e `infer`.",
    ],
  },
  {
    id: "ts-util-05",
    q: ["What does `NonNullable<string | null | undefined>` give?", "Que donne `NonNullable<string | null | undefined>` ?", "¿Qué da `NonNullable<string | null | undefined>`?"],
    a: ["`string`", "`string`", "`string`"],
    w: [["`string | null`", "`string | null`", "`string | null`"], ["`never`", "`never`", "`never`"], ["`unknown`", "`unknown`", "`unknown`"]],
    e: [
      "It removes `null` and `undefined` from a type. `Exclude<T, U>` removes any members of a union (`Exclude<\"a\" | \"b\", \"a\">` is `\"b\"`), `Extract<T, U>` keeps them.",
      "Il retire `null` et `undefined` d'un type. `Exclude<T, U>` retire n'importe quels membres d'une union (`Exclude<\"a\" | \"b\", \"a\">` donne `\"b\"`), `Extract<T, U>` les garde.",
      "Quita `null` y `undefined` de un tipo. `Exclude<T, U>` quita cualquier miembro de una unión (`Exclude<\"a\" | \"b\", \"a\">` da `\"b\"`), `Extract<T, U>` los conserva.",
    ],
  },
];

const mapped: TsQuestion[] = [
  {
    id: "ts-map-01",
    q: ["What does `type Flags<T> = { [K in keyof T]: boolean }` do?", "Que fait `type Flags<T> = { [K in keyof T]: boolean }` ?", "¿Qué hace `type Flags<T> = { [K in keyof T]: boolean }`?"],
    a: ["Makes a type with the same keys as `T`, each typed `boolean`: a mapped type", "Crée un type avec les mêmes clés que `T`, chacune de type `boolean` : un type mappé", "Crea un tipo con las mismas claves que `T`, cada una de tipo `boolean`: un tipo mapeado"],
    w: [["Loops over an object at run time", "Parcourt un objet à l'exécution", "Recorre un objeto al ejecutar"], ["Makes an array of booleans", "Crée un tableau de booléens", "Crea un array de booleanos"], ["Checks that `T` has boolean values", "Vérifie que `T` a des valeurs booléennes", "Comprueba que `T` tiene valores booleanos"]],
    e: [
      "A mapped type iterates over keys at the type level. `Partial`, `Readonly` and `Record` are written this way. Modifiers can be added or removed: `-readonly`, `-?`.",
      "Un type mappé parcourt des clés au niveau des types. `Partial`, `Readonly` et `Record` s'écrivent ainsi. Les modificateurs peuvent être ajoutés ou retirés : `-readonly`, `-?`.",
      "Un tipo mapeado recorre claves a nivel de tipos. `Partial`, `Readonly` y `Record` se escriben así. Los modificadores se pueden añadir o quitar: `-readonly`, `-?`.",
    ],
  },
  {
    id: "ts-map-02",
    q: ["What is `User[\"address\"][\"city\"]` as a type?", "Qu'est-ce que `User[\"address\"][\"city\"]` comme type ?", "¿Qué es `User[\"address\"][\"city\"]` como tipo?"],
    a: ["The type of the property `city` of `User`'s `address`: an indexed access type", "Le type de la propriété `city` de l'`address` de `User` : un type d'accès indexé", "El tipo de la propiedad `city` del `address` de `User`: un tipo de acceso indexado"],
    w: [["A string read from an object at run time", "Une chaîne lue dans un objet à l'exécution", "Una cadena leída de un objeto al ejecutar"], ["A syntax error: types cannot be indexed", "Une erreur de syntaxe : on n'indexe pas un type", "Un error de sintaxis: los tipos no se indexan"], ["`string`, always", "`string`, toujours", "`string`, siempre"]],
    e: [
      "Indexed access reuses parts of existing types instead of repeating them. `T[number]` gives an array's element type, `T[keyof T]` the union of all property types.",
      "L'accès indexé réutilise des parties de types existants au lieu de les répéter. `T[number]` donne le type des éléments d'un tableau, `T[keyof T]` l'union des types de toutes les propriétés.",
      "El acceso indexado reutiliza partes de tipos existentes en vez de repetirlas. `T[number]` da el tipo de los elementos de un array, `T[keyof T]` la unión de los tipos de todas las propiedades.",
    ],
  },
  {
    id: "ts-map-03",
    q: ["In a mapped type, what does `as` after the key do: `{ [K in keyof T as Exclude<K, \"id\">]: T[K] }`?", "Dans un type mappé, que fait `as` après la clé : `{ [K in keyof T as Exclude<K, \"id\">]: T[K] }` ?", "En un tipo mapeado, ¿qué hace `as` tras la clave: `{ [K in keyof T as Exclude<K, \"id\">]: T[K] }`?"],
    a: ["Renames or filters keys: here `id` is dropped", "Renomme ou filtre les clés : ici `id` est retiré", "Renombra o filtra claves: aquí se quita `id`"],
    w: [["Casts each value", "Convertit chaque valeur", "Convierte cada valor"], ["Nothing: `as` is ignored in types", "Rien : `as` est ignoré dans les types", "Nada: `as` se ignora en los tipos"], ["Makes every key optional", "Rend chaque clé optionnelle", "Hace opcional cada clave"]],
    e: [
      "Key remapping (TypeScript 4.1): a key mapped to `never` disappears. Combined with template literal types it builds names such as getters for each property.",
      "Le remappage des clés (TypeScript 4.1) : une clé envoyée sur `never` disparaît. Combiné aux types gabarits, il construit des noms comme des accesseurs pour chaque propriété.",
      "La reasignación de claves (TypeScript 4.1): una clave enviada a `never` desaparece. Combinada con los tipos plantilla, construye nombres como getters para cada propiedad.",
    ],
  },
  {
    id: "ts-map-04",
    q: ["What does `typeof config` mean in `type Config = typeof config;`?", "Que veut dire `typeof config` dans `type Config = typeof config;` ?", "¿Qué significa `typeof config` en `type Config = typeof config;`?"],
    a: ["The type TypeScript inferred for the value `config`", "Le type que TypeScript a déduit pour la valeur `config`", "El tipo que TypeScript dedujo para el valor `config`"],
    w: [["The string \"object\"", "La chaîne \"object\"", "La cadena \"object\""], ["A run-time check of `config`", "Une vérification de `config` à l'exécution", "Una comprobación de `config` al ejecutar"], ["The class `config` was made from", "La classe à partir de laquelle `config` a été créé", "La clase a partir de la que se creó `config`"]],
    e: [
      "In a type position, `typeof` turns a value into its type; in an expression, it is JavaScript's run-time operator. Deriving types from values (with `as const`) keeps a single source of truth.",
      "En position de type, `typeof` transforme une valeur en son type ; dans une expression, c'est l'opérateur de JavaScript à l'exécution. Dériver les types des valeurs (avec `as const`) garde une seule source de vérité.",
      "En posición de tipo, `typeof` convierte un valor en su tipo; en una expresión, es el operador de JavaScript al ejecutar. Derivar los tipos de los valores (con `as const`) mantiene una única fuente de verdad.",
    ],
  },
  {
    id: "ts-map-05",
    q: ["What does `DeepReadonly<T>` need that `Readonly<T>` does not do?", "De quoi `DeepReadonly<T>` a-t-il besoin que `Readonly<T>` ne fait pas ?", "¿Qué necesita `DeepReadonly<T>` que `Readonly<T>` no hace?"],
    a: ["To apply itself recursively to object properties: `Readonly` is one level deep", "S'appliquer récursivement aux propriétés objets : `Readonly` n'agit que sur un niveau", "Aplicarse recursivamente a las propiedades objeto: `Readonly` solo actúa en un nivel"],
    w: [["A run-time freeze", "Un gel à l'exécution", "Una congelación al ejecutar"], ["Nothing: `Readonly` is already deep", "Rien : `Readonly` est déjà profond", "Nada: `Readonly` ya es profundo"], ["A class", "Une classe", "Una clase"]],
    e: [
      "`type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> }` (with care for functions and arrays). Recursive types are allowed; very deep ones slow the checker.",
      "`type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> }` (en prenant soin des fonctions et des tableaux). Les types récursifs sont permis ; très profonds, ils ralentissent le vérificateur.",
      "`type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> }` (con cuidado con funciones y arrays). Los tipos recursivos se permiten; muy profundos, ralentizan el comprobador.",
    ],
  },
];

const conditional: TsQuestion[] = [
  {
    id: "ts-cond-01",
    q: ["What is `T extends string ? \"text\" : \"other\"` for `T = 42`?", "Que vaut `T extends string ? \"text\" : \"other\"` pour `T = 42` ?", "¿Qué es `T extends string ? \"text\" : \"other\"` para `T = 42`?"],
    a: ["`\"other\"`: 42 is not assignable to `string`", "`\"other\"` : 42 n'est pas assignable à `string`", "`\"other\"`: 42 no es asignable a `string`"],
    w: [["`\"text\"`", "`\"text\"`", "`\"text\"`"], ["`\"text\" | \"other\"`", "`\"text\" | \"other\"`", "`\"text\" | \"other\"`"], ["A run-time error", "Une erreur à l'exécution", "Un error al ejecutar"]],
    e: [
      "A conditional type tests assignability at the type level, like a ternary over types. It is evaluated by the checker only; nothing runs.",
      "Un type conditionnel teste l'assignabilité au niveau des types, comme un ternaire sur des types. Seul le vérificateur l'évalue ; rien ne s'exécute.",
      "Un tipo condicional comprueba la asignabilidad a nivel de tipos, como un ternario sobre tipos. Solo lo evalúa el comprobador; nada se ejecuta.",
    ],
  },
  {
    id: "ts-cond-02",
    q: ["`type ToArray<T> = T extends unknown ? T[] : never;` What is `ToArray<string | number>`?", "`type ToArray<T> = T extends unknown ? T[] : never;` Que vaut `ToArray<string | number>` ?", "`type ToArray<T> = T extends unknown ? T[] : never;` ¿Qué es `ToArray<string | number>`?"],
    a: ["`string[] | number[]`: a conditional on a bare type parameter distributes over a union", "`string[] | number[]` : un conditionnel sur un paramètre de type nu se distribue sur une union", "`string[] | number[]`: un condicional sobre un parámetro de tipo desnudo se distribuye sobre una unión"],
    w: [["`(string | number)[]`", "`(string | number)[]`", "`(string | number)[]`"], ["`never`", "`never`", "`never`"], ["`unknown[]`", "`unknown[]`", "`unknown[]`"]],
    e: [
      "The condition runs once per member, and the results are joined. To treat the union as a whole, wrap both sides: `[T] extends [unknown] ? T[] : never` gives `(string | number)[]`. Distribution is also why `never` maps to `never`.",
      "La condition s'applique à chaque membre, et les résultats sont réunis. Pour traiter l'union comme un tout, envelopper les deux côtés : `[T] extends [unknown] ? T[] : never` donne `(string | number)[]`. La distribution explique aussi pourquoi `never` donne `never`.",
      "La condición se aplica a cada miembro, y los resultados se unen. Para tratar la unión como un todo, envolver los dos lados: `[T] extends [unknown] ? T[] : never` da `(string | number)[]`. La distribución también explica por qué `never` da `never`.",
    ],
  },
  {
    id: "ts-cond-03",
    q: ["What does `infer` do in `type ElementOf<T> = T extends (infer U)[] ? U : never`?", "Que fait `infer` dans `type ElementOf<T> = T extends (infer U)[] ? U : never` ?", "¿Qué hace `infer` en `type ElementOf<T> = T extends (infer U)[] ? U : never`?"],
    a: ["Captures the matched part as a new type variable `U`: `ElementOf<number[]>` is `number`", "Capture la partie qui correspond dans une nouvelle variable de type `U` : `ElementOf<number[]>` vaut `number`", "Captura la parte que coincide en una variable de tipo nueva `U`: `ElementOf<number[]>` es `number`"],
    w: [["Asks the compiler to guess `T`", "Demande au compilateur de deviner `T`", "Pide al compilador que adivine `T`"], ["Checks `U` at run time", "Vérifie `U` à l'exécution", "Comprueba `U` al ejecutar"], ["Declares `U` as `any`", "Déclare `U` comme `any`", "Declara `U` como `any`"]],
    e: [
      "`infer` is pattern matching on types, allowed only in the `extends` clause of a conditional type. `ReturnType`, `Parameters` and `Awaited` are built with it.",
      "`infer` est un filtrage par motif sur les types, permis seulement dans la clause `extends` d'un type conditionnel. `ReturnType`, `Parameters` et `Awaited` sont construits avec.",
      "`infer` es coincidencia de patrones sobre tipos, permitida solo en la cláusula `extends` de un tipo condicional. `ReturnType`, `Parameters` y `Awaited` se construyen con él.",
    ],
  },
  {
    id: "ts-cond-04",
    q: ["What is `string extends \"a\" ? 1 : 2`?", "Que vaut `string extends \"a\" ? 1 : 2` ?", "¿Qué es `string extends \"a\" ? 1 : 2`?"],
    a: ["`2`: not every string is \"a\"; `\"a\" extends string` would be true", "`2` : toutes les chaînes ne sont pas \"a\" ; `\"a\" extends string` serait vrai", "`2`: no toda cadena es \"a\"; `\"a\" extends string` sería verdadero"],
    w: [["`1`", "`1`", "`1`"], ["`1 | 2`", "`1 | 2`", "`1 | 2`"], ["An error", "Une erreur", "Un error"]],
    e: [
      "`A extends B` asks whether every `A` is a `B`: a subset test. Literal types are subtypes of their base type, not the reverse.",
      "`A extends B` demande si tout `A` est un `B` : un test d'inclusion. Les types littéraux sont des sous-types de leur type de base, pas l'inverse.",
      "`A extends B` pregunta si todo `A` es un `B`: una prueba de inclusión. Los tipos literales son subtipos de su tipo base, no al revés.",
    ],
  },
  {
    id: "ts-cond-05",
    q: ["When should you reach for conditional types in application code?", "Quand faut-il recourir aux types conditionnels dans le code d'une application ?", "¿Cuándo conviene usar tipos condicionales en el código de una aplicación?"],
    a: ["Rarely: in library code or shared helpers, when simpler types (unions, overloads, generics) cannot say it", "Rarement : dans du code de bibliothèque ou des aides partagées, quand des types plus simples (unions, surcharges, génériques) ne suffisent pas", "Pocas veces: en código de biblioteca o ayudas compartidas, cuando tipos más simples (uniones, sobrecargas, genéricos) no bastan"],
    w: [["For every function, to be safe", "Pour chaque fonction, par sécurité", "Para cada función, por seguridad"], ["Never: they are experimental", "Jamais : ils sont expérimentaux", "Nunca: son experimentales"], ["Instead of `if` statements", "À la place des instructions `if`", "En lugar de las sentencias `if`"]],
    e: [
      "Type-level code is hard to read, slows the checker and gives obscure errors. The aim of types is to describe the code for its readers; clever types that nobody can change are a cost.",
      "Le code au niveau des types est difficile à lire, ralentit le vérificateur et donne des erreurs obscures. Le but des types est de décrire le code pour ses lecteurs ; des types astucieux que personne ne peut modifier sont un coût.",
      "El código a nivel de tipos es difícil de leer, ralentiza el comprobador y da errores oscuros. El objetivo de los tipos es describir el código a sus lectores; tipos ingeniosos que nadie puede cambiar son un coste.",
    ],
  },
];

const pitfalls: TsQuestion[] = [
  {
    id: "ts-pit-01",
    q: ["`[\"1\", \"2\", \"3\"].map(parseInt)` gives `[1, NaN, NaN]`. Why?", "`[\"1\", \"2\", \"3\"].map(parseInt)` donne `[1, NaN, NaN]`. Pourquoi ?", "`[\"1\", \"2\", \"3\"].map(parseInt)` da `[1, NaN, NaN]`. ¿Por qué?"],
    a: ["`map` passes the index as a second argument, and `parseInt` reads it as the base", "`map` passe l'indice en second argument, et `parseInt` le lit comme la base", "`map` pasa el índice como segundo argumento, y `parseInt` lo lee como la base"],
    w: [["`parseInt` does not accept strings with quotes", "`parseInt` n'accepte pas les chaînes entre guillemets", "`parseInt` no acepta cadenas entre comillas"], ["`map` skips every other item", "`map` saute un élément sur deux", "`map` se salta un elemento de cada dos"], ["It is random", "C'est aléatoire", "Es aleatorio"]],
    e: [
      "`parseInt(\"2\", 1)` and `parseInt(\"3\", 2)` are NaN. TypeScript accepts it: `parseInt(s: string, radix?: number)` fits the callback `(value: string, index: number)`. A ready-made function passed as a callback gets the index and the array too; write the arrow: `.map((s) => parseInt(s, 10))`.",
      "`parseInt(\"2\", 1)` et `parseInt(\"3\", 2)` donnent NaN. TypeScript l'accepte : `parseInt(s: string, radix?: number)` convient au rappel `(value: string, index: number)`. Une fonction toute faite passée en rappel reçoit aussi l'indice et le tableau ; écrire la fonction fléchée : `.map((s) => parseInt(s, 10))`.",
      "`parseInt(\"2\", 1)` y `parseInt(\"3\", 2)` dan NaN. TypeScript lo acepta: `parseInt(s: string, radix?: number)` encaja con la retrollamada `(value: string, index: number)`. Una función ya hecha pasada como retrollamada recibe también el índice y el array; escribir la función flecha: `.map((s) => parseInt(s, 10))`.",
    ],
  },
  {
    id: "ts-pit-02",
    q: ["`for (const k in arr)` over an array: what is `k`?", "`for (const k in arr)` sur un tableau : que vaut `k` ?", "`for (const k in arr)` sobre un array: ¿qué es `k`?"],
    a: ["Each index as a string (\"0\", \"1\"…), plus any other enumerable properties; `for…of` gives the values", "Chaque indice sous forme de chaîne (\"0\", \"1\"…), plus les autres propriétés énumérables ; `for…of` donne les valeurs", "Cada índice como cadena (\"0\", \"1\"…), más las demás propiedades enumerables; `for…of` da los valores"],
    w: [["Each value", "Chaque valeur", "Cada valor"], ["Each index as a number", "Chaque indice comme nombre", "Cada índice como número"], ["Nothing: `in` only works on objects", "Rien : `in` ne marche que sur les objets", "Nada: `in` solo funciona con objetos"]],
    e: [
      "`for…in` walks property names, as strings, inherited enumerable ones included. For arrays use `for…of`, or `arr.entries()` for index and value together.",
      "`for…in` parcourt les noms de propriétés, en chaînes, héritées énumérables comprises. Pour les tableaux, utiliser `for…of`, ou `arr.entries()` pour l'indice et la valeur ensemble.",
      "`for…in` recorre los nombres de propiedades, como cadenas, incluidas las heredadas enumerables. Para arrays, usar `for…of`, o `arr.entries()` para índice y valor juntos.",
    ],
  },
  {
    id: "ts-pit-03",
    q: ["`JSON.parse(text)` returns which type, and what does that mean?", "`JSON.parse(text)` renvoie quel type, et qu'est-ce que cela implique ?", "`JSON.parse(text)` devuelve qué tipo, y ¿qué implica?"],
    a: ["`any`: whatever type you give the result is unchecked; validate it (by hand, or with a schema library such as zod)", "`any` : le type qu'on donne au résultat n'est pas vérifié ; le valider (à la main, ou avec une bibliothèque de schémas comme zod)", "`any`: el tipo que se da al resultado no se comprueba; validarlo (a mano, o con una biblioteca de esquemas como zod)"],
    w: [["The type of the variable it is assigned to, checked", "Le type de la variable qui le reçoit, vérifié", "El tipo de la variable que lo recibe, comprobado"], ["`object`", "`object`", "`object`"], ["`string`", "`string`", "`string`"]],
    e: [
      "`const u: User = JSON.parse(text)` compiles whatever the text holds. The same goes for `fetch(…).json()`. Data crossing a boundary (network, files, `localStorage`) must be checked at run time; types describe it only once it is.",
      "`const u: User = JSON.parse(text)` compile quel que soit le texte. Il en va de même pour `fetch(…).json()`. Les données qui franchissent une frontière (réseau, fichiers, `localStorage`) doivent être vérifiées à l'exécution ; les types ne les décrivent qu'ensuite.",
      "`const u: User = JSON.parse(text)` compila sea cual sea el texto. Lo mismo vale para `fetch(…).json()`. Los datos que cruzan una frontera (red, archivos, `localStorage`) deben comprobarse al ejecutar; los tipos solo los describen después.",
    ],
  },
  {
    id: "ts-pit-04",
    q: ["`const d = new Date(\"2026-10-25\");` What is `d.getDate()` in Madrid, and in New York?", "`const d = new Date(\"2026-10-25\");` Que vaut `d.getDate()` à Madrid, et à New York ?", "`const d = new Date(\"2026-10-25\");` ¿Cuánto vale `d.getDate()` en Madrid, y en Nueva York?"],
    a: ["25 in Madrid, 24 in New York: a date-only string is read as UTC midnight, and `getDate` uses local time", "25 à Madrid, 24 à New York : une chaîne avec la date seule est lue comme minuit UTC, et `getDate` utilise l'heure locale", "25 en Madrid, 24 en Nueva York: una cadena solo con fecha se lee como medianoche UTC, y `getDate` usa la hora local"],
    w: [["25 in both", "25 dans les deux", "25 en las dos"], ["24 in both", "24 dans les deux", "24 en las dos"], ["An error: the format is not valid", "Une erreur : le format n'est pas valide", "Un error: el formato no es válido"]],
    e: [
      "Date-only ISO strings are UTC, date-time strings without a zone are local: a classic off-by-one-day bug. `getUTCDate` reads UTC; the Temporal API (`Temporal.PlainDate`) has dates without times or zones.",
      "Les chaînes ISO avec la date seule sont en UTC, celles avec date et heure sans fuseau en heure locale : un bug classique de décalage d'un jour. `getUTCDate` lit en UTC ; l'API Temporal (`Temporal.PlainDate`) a des dates sans heure ni fuseau.",
      "Las cadenas ISO solo con fecha son UTC, las de fecha y hora sin zona son locales: un fallo clásico de un día de diferencia. `getUTCDate` lee en UTC; la API Temporal (`Temporal.PlainDate`) tiene fechas sin hora ni zona.",
    ],
  },
  {
    id: "ts-pit-05",
    q: ["`arr.indexOf(NaN)` and `arr.includes(NaN)` on `[NaN]`: what do they give?", "`arr.indexOf(NaN)` et `arr.includes(NaN)` sur `[NaN]` : que donnent-ils ?", "`arr.indexOf(NaN)` y `arr.includes(NaN)` sobre `[NaN]`: ¿qué dan?"],
    a: ["-1 and `true`: `indexOf` uses `===`, where NaN never matches; `includes` treats NaN as equal to itself", "-1 et `true` : `indexOf` utilise `===`, où NaN ne correspond jamais ; `includes` tient NaN pour égal à lui-même", "-1 y `true`: `indexOf` usa `===`, donde NaN nunca coincide; `includes` trata NaN como igual a sí mismo"],
    w: [["0 and `true`", "0 et `true`", "0 y `true`"], ["-1 and `false`", "-1 et `false`", "-1 y `false`"], ["0 and `false`", "0 et `false`", "0 y `false`"]],
    e: [
      "`includes`, `Set` and `Map` use SameValueZero, where NaN equals NaN. `Number.isNaN(x)` is the right test for one value; the global `isNaN` converts its argument first.",
      "`includes`, `Set` et `Map` utilisent SameValueZero, où NaN vaut NaN. `Number.isNaN(x)` est le bon test pour une valeur ; le `isNaN` global convertit d'abord son argument.",
      "`includes`, `Set` y `Map` usan SameValueZero, donde NaN es igual a NaN. `Number.isNaN(x)` es la prueba correcta para un valor; el `isNaN` global convierte antes su argumento.",
    ],
  },
];

const strictness: TsQuestion[] = [
  {
    id: "ts-strict-01",
    q: ["What does `noUncheckedIndexedAccess` change about `arr[0]` on a `string[]`?", "Que change `noUncheckedIndexedAccess` pour `arr[0]` sur un `string[]` ?", "¿Qué cambia `noUncheckedIndexedAccess` para `arr[0]` sobre un `string[]`?"],
    a: ["It is typed `string | undefined`, since the array may be shorter", "Il est typé `string | undefined`, puisque le tableau peut être plus court", "Se tipa `string | undefined`, ya que el array puede ser más corto"],
    w: [["It forbids indexing arrays", "Il interdit d'indexer les tableaux", "Prohíbe indexar arrays"], ["It checks the index at run time", "Il vérifie l'indice à l'exécution", "Comprueba el índice al ejecutar"], ["Nothing for arrays, only for objects", "Rien pour les tableaux, seulement pour les objets", "Nada para arrays, solo para objetos"]],
    e: [
      "It is not in `strict`. Without it, `arr[10]` is a `string` though it is `undefined` at run time. With it, index reads must be checked (or `!`); tuples and `for…of` keep their precise types.",
      "Il n'est pas dans `strict`. Sans lui, `arr[10]` est un `string` alors qu'il vaut `undefined` à l'exécution. Avec, les lectures par indice doivent être vérifiées (ou `!`) ; les tuples et `for…of` gardent leurs types précis.",
      "No está en `strict`. Sin él, `arr[10]` es un `string` aunque al ejecutar sea `undefined`. Con él, las lecturas por índice deben comprobarse (o `!`); las tuplas y `for…of` conservan sus tipos precisos.",
    ],
  },
  {
    id: "ts-strict-02",
    q: ["What does `exactOptionalPropertyTypes` forbid, for `{ name?: string }`?", "Qu'interdit `exactOptionalPropertyTypes`, pour `{ name?: string }` ?", "¿Qué prohíbe `exactOptionalPropertyTypes`, para `{ name?: string }`?"],
    a: ["Setting `name: undefined` explicitly: the property may be missing, but if present it is a string", "D'écrire explicitement `name: undefined` : la propriété peut manquer, mais si elle est là c'est une chaîne", "Escribir explícitamente `name: undefined`: la propiedad puede faltar, pero si está es una cadena"],
    w: [["Leaving `name` out", "D'omettre `name`", "Omitir `name`"], ["Reading `name`", "De lire `name`", "Leer `name`"], ["Optional properties altogether", "Les propriétés optionnelles en général", "Las propiedades opcionales en general"]],
    e: [
      "Missing and `undefined` differ at run time: `\"name\" in o`, `Object.keys` and spreading see the difference. To allow both, write `name?: string | undefined`.",
      "Absent et `undefined` diffèrent à l'exécution : `\"name\" in o`, `Object.keys` et la décomposition voient la différence. Pour permettre les deux, écrire `name?: string | undefined`.",
      "Ausente y `undefined` difieren al ejecutar: `\"name\" in o`, `Object.keys` y la propagación ven la diferencia. Para permitir ambos, escribir `name?: string | undefined`.",
    ],
  },
  {
    id: "ts-strict-03",
    q: ["Why turn on `isolatedModules` (or `verbatimModuleSyntax`)?", "Pourquoi activer `isolatedModules` (ou `verbatimModuleSyntax`) ?", "¿Por qué activar `isolatedModules` (o `verbatimModuleSyntax`)?"],
    a: ["So each file can be compiled alone, as esbuild, SWC and Node's type stripping do; constructs that need the whole program are flagged", "Pour que chaque fichier puisse être compilé seul, comme le font esbuild, SWC et le retrait des types de Node ; les constructions qui demandent tout le programme sont signalées", "Para que cada archivo pueda compilarse solo, como hacen esbuild, SWC y la eliminación de tipos de Node; se señalan las construcciones que necesitan todo el programa"],
    w: [["To run modules in separate processes", "Pour exécuter les modules dans des processus séparés", "Para ejecutar los módulos en procesos separados"], ["To forbid imports", "Pour interdire les imports", "Para prohibir los imports"], ["To make compilation slower but safer", "Pour rendre la compilation plus lente mais plus sûre", "Para hacer la compilación más lenta pero más segura"]],
    e: [
      "Re-exporting a type without `export type`, or `const enum` across files, cannot be compiled without knowing other files. `verbatimModuleSyntax` (TypeScript 5.0) goes further: imports are kept or dropped exactly as written, so type-only imports must say so.",
      "Réexporter un type sans `export type`, ou un `const enum` entre fichiers, ne se compile pas sans connaître les autres fichiers. `verbatimModuleSyntax` (TypeScript 5.0) va plus loin : les imports sont gardés ou retirés exactement comme écrits, donc les imports de types doivent le dire.",
      "Reexportar un tipo sin `export type`, o un `const enum` entre archivos, no se compila sin conocer los demás archivos. `verbatimModuleSyntax` (TypeScript 5.0) va más allá: los imports se conservan o se quitan exactamente como están escritos, así que los imports de tipos deben indicarlo.",
    ],
  },
  {
    id: "ts-strict-04",
    q: ["What does `strictFunctionTypes` check?", "Que vérifie `strictFunctionTypes` ?", "¿Qué comprueba `strictFunctionTypes`?"],
    a: ["That a function's parameters are compared contravariantly: a handler of `Dog` cannot stand in for a handler of `Animal`", "Que les paramètres des fonctions sont comparés de façon contravariante : un gestionnaire de `Dog` ne peut pas remplacer un gestionnaire d'`Animal`", "Que los parámetros de las funciones se comparan de forma contravariante: un manejador de `Dog` no puede sustituir a un manejador de `Animal`"],
    w: [["That functions declare their return types", "Que les fonctions déclarent leurs types de retour", "Que las funciones declaren sus tipos de retorno"], ["That functions are pure", "Que les fonctions sont pures", "Que las funciones son puras"], ["That arguments are checked at run time", "Que les arguments sont vérifiés à l'exécution", "Que los argumentos se comprueban al ejecutar"]],
    e: [
      "A `(d: Dog) => void` given an `Animal` that is a cat would break. The check covers function-typed properties, not methods declared with method syntax, which stay bivariant for compatibility: `onClick(e: Event): void` versus `onClick: (e: Event) => void`.",
      "Une `(d: Dog) => void` qui reçoit un `Animal` qui est un chat casserait. La vérification couvre les propriétés de type fonction, pas les méthodes écrites avec la syntaxe de méthode, qui restent bivariantes par compatibilité : `onClick(e: Event): void` face à `onClick: (e: Event) => void`.",
      "Una `(d: Dog) => void` que recibe un `Animal` que es un gato fallaría. La comprobación cubre las propiedades de tipo función, no los métodos escritos con sintaxis de método, que siguen siendo bivariantes por compatibilidad: `onClick(e: Event): void` frente a `onClick: (e: Event) => void`.",
    ],
  },
  {
    id: "ts-strict-05",
    q: ["What does `skipLibCheck: true` skip?", "Que saute `skipLibCheck: true` ?", "¿Qué se salta `skipLibCheck: true`?"],
    a: ["Type-checking inside `.d.ts` files (of dependencies and your own); your `.ts` code is still checked", "La vérification des types à l'intérieur des fichiers `.d.ts` (des dépendances et les vôtres) ; votre code `.ts` reste vérifié", "La comprobación de tipos dentro de los archivos `.d.ts` (de las dependencias y los propios); su código `.ts` se sigue comprobando"],
    w: [["Checking the project's code", "La vérification du code du projet", "La comprobación del código del proyecto"], ["Installing `@types` packages", "L'installation des paquets `@types`", "La instalación de los paquetes `@types`"], ["The `lib` setting", "Le réglage `lib`", "El ajuste `lib`"]],
    e: [
      "It speeds builds and avoids conflicts between libraries' declarations you cannot fix. The declarations are still used to type your code; only errors inside them are ignored. Most projects turn it on.",
      "Il accélère les builds et évite les conflits entre déclarations de bibliothèques que vous ne pouvez pas corriger. Les déclarations servent toujours à typer votre code ; seules les erreurs à l'intérieur sont ignorées. La plupart des projets l'activent.",
      "Acelera las compilaciones y evita conflictos entre declaraciones de bibliotecas que no se pueden corregir. Las declaraciones se siguen usando para tipar su código; solo se ignoran los errores dentro de ellas. La mayoría de proyectos lo activan.",
    ],
  },
];

export const functionsTopic = { closures };
export const objects = { structural };
export const narrowing = { controlFlow };
export const generics = { utility };
export const typeLevel = { mapped, conditional };
export const runtime = { pitfalls };
export const tooling = { strictness };
