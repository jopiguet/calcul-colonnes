/**
 * TypeScript, Débutant: primitive types and inference, arrays and objects,
 * functions, interfaces, unions, the JavaScript underneath, and setting up
 * a project. Code between backticks is the same in the three languages.
 */
import type { LinuxQuestion as TsQuestion } from "../linux/types";

const primitives: TsQuestion[] = [
  {
    id: "ts-prim-01",
    q: ["What type does TypeScript give `x` in `let x = 3;`?", "Quel type TypeScript donne-t-il à `x` dans `let x = 3;` ?", "¿Qué tipo da TypeScript a `x` en `let x = 3;`?"],
    a: ["`number`, inferred from the value", "`number`, déduit de la valeur", "`number`, deducido del valor"],
    w: [["`any`: without an annotation nothing is checked", "`any` : sans annotation, rien n'est vérifié", "`any`: sin anotación no se comprueba nada"], ["`3`, the literal", "`3`, le littéral", "`3`, el literal"], ["`int`", "`int`", "`int`"]],
    e: [
      "TypeScript infers types from values; annotations are needed mainly on function parameters. A `let` widens to `number` because it may change; `const x = 3` keeps the literal type `3`. There is one number type, a 64-bit float, plus `bigint`.",
      "TypeScript déduit les types des valeurs ; les annotations servent surtout pour les paramètres de fonctions. Un `let` s'élargit en `number` car il peut changer ; `const x = 3` garde le type littéral `3`. Il y a un seul type nombre, un flottant 64 bits, plus `bigint`.",
      "TypeScript deduce los tipos de los valores; las anotaciones hacen falta sobre todo en los parámetros de funciones. Un `let` se amplía a `number` porque puede cambiar; `const x = 3` conserva el tipo literal `3`. Hay un solo tipo número, un flotante de 64 bits, más `bigint`.",
    ],
  },
  {
    id: "ts-prim-02",
    q: ["`let name: string = 42;`: what happens?", "`let name: string = 42;` : que se passe-t-il ?", "`let name: string = 42;`: ¿qué pasa?"],
    a: ["A type error at compile time; by default `tsc` still writes the JavaScript", "Une erreur de type à la compilation ; par défaut `tsc` écrit quand même le JavaScript", "Un error de tipo al compilar; por defecto `tsc` escribe igualmente el JavaScript"],
    w: [["The number is converted to the string \"42\"", "Le nombre est converti en chaîne \"42\"", "El número se convierte en la cadena \"42\""], ["A crash when the program runs", "Un plantage à l'exécution", "Un fallo al ejecutar"], ["Nothing: annotations are comments", "Rien : les annotations sont des commentaires", "Nada: las anotaciones son comentarios"]],
    e: [
      "Types exist only at compile time and are erased; they never convert values. `tsc` reports the error and, unless `noEmitOnError` is set, emits code anyway. In CI, treat the errors as a failure.",
      "Les types n'existent qu'à la compilation et sont effacés ; ils ne convertissent jamais de valeur. `tsc` signale l'erreur et, sauf avec `noEmitOnError`, produit quand même le code. En CI, traiter les erreurs comme un échec.",
      "Los tipos solo existen al compilar y se borran; nunca convierten valores. `tsc` informa del error y, salvo con `noEmitOnError`, genera el código igualmente. En CI, tratar los errores como un fallo.",
    ],
  },
  {
    id: "ts-prim-03",
    q: ["What separates `any` from `unknown`?", "Qu'est-ce qui distingue `any` de `unknown` ?", "¿Qué diferencia `any` de `unknown`?"],
    a: ["Anything goes with `any`, unchecked; `unknown` must be narrowed before it is used", "Tout est permis avec `any`, sans vérification ; `unknown` doit être affiné avant d'être utilisé", "Con `any` todo vale, sin comprobación; `unknown` debe estrecharse antes de usarse"],
    w: [["Nothing: they are synonyms", "Rien : ce sont des synonymes", "Nada: son sinónimos"], ["`unknown` also allows anything, `any` nothing", "`unknown` permet aussi tout, `any` rien", "`unknown` también permite todo, `any` nada"], ["`any` is for numbers, `unknown` for objects", "`any` pour les nombres, `unknown` pour les objets", "`any` para números, `unknown` para objetos"]],
    e: [
      "`any` turns checking off and spreads: what it touches becomes `any`. `unknown` accepts any value but allows nothing until a test (`typeof x === \"string\"`) proves what it is. Use `unknown` for data from outside: JSON, `catch`, user input.",
      "`any` coupe la vérification et se propage : ce qu'il touche devient `any`. `unknown` accepte n'importe quelle valeur mais ne permet rien tant qu'un test (`typeof x === \"string\"`) n'a pas prouvé ce que c'est. Utiliser `unknown` pour les données venues de l'extérieur : JSON, `catch`, saisie.",
      "`any` desactiva la comprobación y se propaga: lo que toca pasa a ser `any`. `unknown` acepta cualquier valor pero no permite nada hasta que una prueba (`typeof x === \"string\"`) demuestre qué es. Usar `unknown` para los datos de fuera: JSON, `catch`, entradas del usuario.",
    ],
  },
  {
    id: "ts-prim-04",
    q: ["`null` and `undefined`: which means what, by convention?", "`null` et `undefined` : lequel veut dire quoi, par convention ?", "`null` y `undefined`: ¿cuál significa qué, por convención?"],
    a: ["`undefined`: not set (a missing property, a missing argument); `null`: explicitly no value", "`undefined` : pas défini (propriété absente, argument manquant) ; `null` : explicitement aucune valeur", "`undefined`: no definido (propiedad ausente, argumento que falta); `null`: explícitamente ningún valor"],
    w: [["They are the same value", "C'est la même valeur", "Son el mismo valor"], ["`null` is a number, `undefined` a string", "`null` est un nombre, `undefined` une chaîne", "`null` es un número, `undefined` una cadena"], ["`undefined` only exists in TypeScript", "`undefined` n'existe qu'en TypeScript", "`undefined` solo existe en TypeScript"]],
    e: [
      "JavaScript has both; `null == undefined` is true, `null === undefined` false. With `strictNullChecks` (part of `strict`), neither fits in a `string`: a variable that may be missing is typed `string | undefined`.",
      "JavaScript a les deux ; `null == undefined` est vrai, `null === undefined` faux. Avec `strictNullChecks` (inclus dans `strict`), aucun des deux ne tient dans un `string` : une variable qui peut manquer se type `string | undefined`.",
      "JavaScript tiene los dos; `null == undefined` es verdadero, `null === undefined` falso. Con `strictNullChecks` (incluido en `strict`), ninguno cabe en un `string`: una variable que puede faltar se tipa `string | undefined`.",
    ],
  },
  {
    id: "ts-prim-05",
    q: ["`const color = \"red\";` and `let shade = \"red\";`: which types?", "`const color = \"red\";` et `let shade = \"red\";` : quels types ?", "`const color = \"red\";` y `let shade = \"red\";`: ¿qué tipos?"],
    a: ["The literal type `\"red\"`, and `string`", "Le type littéral `\"red\"`, et `string`", "El tipo literal `\"red\"`, y `string`"],
    w: [["`string` for both", "`string` pour les deux", "`string` para los dos"], ["`\"red\"` for both", "`\"red\"` pour les deux", "`\"red\"` para los dos"], ["`any` for both", "`any` pour les deux", "`any` para los dos"]],
    e: [
      "A `const` cannot change, so it keeps the exact value as its type; a `let` is widened. Literal types combine into unions such as `\"red\" | \"green\"`, a type-checked set of allowed values.",
      "Une `const` ne peut pas changer, elle garde donc la valeur exacte comme type ; un `let` est élargi. Les types littéraux se combinent en unions comme `\"red\" | \"green\"`, un ensemble de valeurs permises vérifié.",
      "Una `const` no puede cambiar, así que conserva el valor exacto como tipo; un `let` se amplía. Los tipos literales se combinan en uniones como `\"red\" | \"green\"`, un conjunto de valores permitidos que se comprueba.",
    ],
  },
];

const collections: TsQuestion[] = [
  {
    id: "ts-coll-01",
    q: ["How is an array of numbers typed?", "Comment type-t-on un tableau de nombres ?", "¿Cómo se tipa un array de números?"],
    a: ["`number[]` (or `Array<number>`)", "`number[]` (ou `Array<number>`)", "`number[]` (o `Array<number>`)"],
    w: [["`array<number>`", "`array<number>`", "`array<number>`"], ["`[number]`, for any length", "`[number]`, pour toute longueur", "`[number]`, para cualquier longitud"], ["`numbers`", "`numbers`", "`numbers`"]],
    e: [
      "Both spellings mean the same. `[number]` is a tuple of exactly one number. `readonly number[]` forbids `push` and assignment through that reference.",
      "Les deux écritures veulent dire la même chose. `[number]` est un tuple d'exactement un nombre. `readonly number[]` interdit `push` et l'affectation par cette référence.",
      "Las dos formas significan lo mismo. `[number]` es una tupla de exactamente un número. `readonly number[]` prohíbe `push` y la asignación mediante esa referencia.",
    ],
  },
  {
    id: "ts-coll-02",
    q: ["What is `let p: [string, number] = [\"Ana\", 30];`?", "Qu'est-ce que `let p: [string, number] = [\"Ana\", 30];` ?", "¿Qué es `let p: [string, number] = [\"Ana\", 30];`?"],
    a: ["A tuple: a string then a number, in that order", "Un tuple : une chaîne puis un nombre, dans cet ordre", "Una tupla: una cadena y luego un número, en ese orden"],
    w: [["An array of strings or numbers, in any order", "Un tableau de chaînes ou de nombres, dans n'importe quel ordre", "Un array de cadenas o números, en cualquier orden"], ["An object with two properties", "Un objet à deux propriétés", "Un objeto con dos propiedades"], ["A type error", "Une erreur de type", "Un error de tipo"]],
    e: [
      "At run time a tuple is an ordinary array; the type fixes the length and each position's type. `p[0]` is a `string`, `p[1]` a `number`. Destructuring reads it: `const [name, age] = p;`.",
      "À l'exécution, un tuple est un tableau ordinaire ; le type fixe la longueur et le type de chaque position. `p[0]` est un `string`, `p[1]` un `number`. La déstructuration le lit : `const [name, age] = p;`.",
      "Al ejecutar, una tupla es un array corriente; el tipo fija la longitud y el tipo de cada posición. `p[0]` es un `string`, `p[1]` un `number`. La desestructuración la lee: `const [name, age] = p;`.",
    ],
  },
  {
    id: "ts-coll-03",
    q: ["`const a = [1, 2]; a.push(3);`: allowed?", "`const a = [1, 2]; a.push(3);` : permis ?", "`const a = [1, 2]; a.push(3);`: ¿permitido?"],
    a: ["Yes: `const` fixes the variable, not the array's contents", "Oui : `const` fixe la variable, pas le contenu du tableau", "Sí: `const` fija la variable, no el contenido del array"],
    w: [["No: a `const` array cannot change", "Non : un tableau `const` ne peut pas changer", "No: un array `const` no puede cambiar"], ["Only with `as const`", "Seulement avec `as const`", "Solo con `as const`"], ["Only in JavaScript, not TypeScript", "Seulement en JavaScript, pas en TypeScript", "Solo en JavaScript, no en TypeScript"]],
    e: [
      "`a = [9]` would be refused; changing the array it points to is fine. To forbid that too, type it `readonly number[]` or write `[1, 2] as const` (a `readonly [1, 2]` tuple); `Object.freeze` does it at run time.",
      "`a = [9]` serait refusé ; modifier le tableau pointé est permis. Pour l'interdire aussi, le typer `readonly number[]` ou écrire `[1, 2] as const` (un tuple `readonly [1, 2]`) ; `Object.freeze` le fait à l'exécution.",
      "`a = [9]` se rechazaría; cambiar el array al que apunta está permitido. Para prohibirlo también, tiparlo `readonly number[]` o escribir `[1, 2] as const` (una tupla `readonly [1, 2]`); `Object.freeze` lo hace al ejecutar.",
    ],
  },
  {
    id: "ts-coll-04",
    q: ["How do you type an object whose keys are any strings and values numbers?", "Comment typer un objet dont les clés sont des chaînes quelconques et les valeurs des nombres ?", "¿Cómo se tipa un objeto cuyas claves son cadenas cualesquiera y los valores números?"],
    a: ["`Record<string, number>` (or `{ [key: string]: number }`)", "`Record<string, number>` (ou `{ [key: string]: number }`)", "`Record<string, number>` (o `{ [key: string]: number }`)"],
    w: [["`object<number>`", "`object<number>`", "`object<number>`"], ["`{ string: number }`", "`{ string: number }`", "`{ string: number }`"], ["`Map<number>`", "`Map<number>`", "`Map<number>`"]],
    e: [
      "`{ string: number }` would be one property named `string`. With an index signature, `scores[\"zoe\"]` is typed `number` even if missing, unless `noUncheckedIndexedAccess` adds `| undefined`. A `Map<string, number>` is the alternative with a real `.has`.",
      "`{ string: number }` serait une seule propriété nommée `string`. Avec une signature d'index, `scores[\"zoe\"]` est typé `number` même s'il manque, sauf si `noUncheckedIndexedAccess` ajoute `| undefined`. Une `Map<string, number>` est l'alternative, avec un vrai `.has`.",
      "`{ string: number }` sería una sola propiedad llamada `string`. Con una firma de índice, `scores[\"zoe\"]` se tipa `number` aunque falte, salvo que `noUncheckedIndexedAccess` añada `| undefined`. Un `Map<string, number>` es la alternativa, con un `.has` real.",
    ],
  },
  {
    id: "ts-coll-05",
    q: ["`const p = { x: 1 }; p.y = 2;`: what does TypeScript say?", "`const p = { x: 1 }; p.y = 2;` : que dit TypeScript ?", "`const p = { x: 1 }; p.y = 2;`: ¿qué dice TypeScript?"],
    a: ["An error: `p`'s type is `{ x: number }`, with no property `y`", "Une erreur : le type de `p` est `{ x: number }`, sans propriété `y`", "Un error: el tipo de `p` es `{ x: number }`, sin propiedad `y`"],
    w: [["Nothing: objects can always gain properties", "Rien : les objets peuvent toujours gagner des propriétés", "Nada: los objetos siempre pueden ganar propiedades"], ["It works because `p` is `const`", "Ça marche parce que `p` est `const`", "Funciona porque `p` es `const`"], ["A run-time crash", "Un plantage à l'exécution", "Un fallo al ejecutar"]],
    e: [
      "An object's type is fixed when it is created. Declare the shape up front, `{ x: number; y?: number }`, or build the object complete. JavaScript would accept it; the error is the point of the types.",
      "Le type d'un objet est fixé à sa création. Déclarer la forme d'avance, `{ x: number; y?: number }`, ou construire l'objet complet. JavaScript l'accepterait ; l'erreur est la raison d'être des types.",
      "El tipo de un objeto se fija al crearlo. Declarar la forma de antemano, `{ x: number; y?: number }`, o construir el objeto completo. JavaScript lo aceptaría; el error es la razón de ser de los tipos.",
    ],
  },
];

const functions: TsQuestion[] = [
  {
    id: "ts-fn-01",
    q: ["`function area(w, h) { return w * h; }` in strict mode: what is wrong?", "`function area(w, h) { return w * h; }` en mode strict : qu'est-ce qui ne va pas ?", "`function area(w, h) { return w * h; }` en modo strict: ¿qué falla?"],
    a: ["The parameters are implicitly `any` (`noImplicitAny`): annotate them, `w: number, h: number`", "Les paramètres sont implicitement `any` (`noImplicitAny`) : les annoter, `w: number, h: number`", "Los parámetros son `any` implícitamente (`noImplicitAny`): anotarlos, `w: number, h: number`"],
    w: [["Functions must declare their return type", "Les fonctions doivent déclarer leur type de retour", "Las funciones deben declarar su tipo de retorno"], ["`*` is not allowed in TypeScript", "`*` n'est pas permis en TypeScript", "`*` no se permite en TypeScript"], ["Nothing: types are inferred from the call", "Rien : les types sont déduits de l'appel", "Nada: los tipos se deducen de la llamada"]],
    e: [
      "Parameters are not inferred from calls; the return type is inferred from the body. Writing the return type anyway catches a body that returns the wrong thing.",
      "Les paramètres ne sont pas déduits des appels ; le type de retour est déduit du corps. Écrire quand même le type de retour attrape un corps qui renvoie la mauvaise chose.",
      "Los parámetros no se deducen de las llamadas; el tipo de retorno se deduce del cuerpo. Escribir igualmente el tipo de retorno detecta un cuerpo que devuelve lo que no debe.",
    ],
  },
  {
    id: "ts-fn-02",
    q: ["How is a parameter made optional?", "Comment rendre un paramètre optionnel ?", "¿Cómo se hace opcional un parámetro?"],
    a: ["`function greet(name?: string)`, or with a default `name = \"you\"`; inside, `name` may be `undefined` (without a default)", "`function greet(name?: string)`, ou avec une valeur par défaut `name = \"you\"` ; dedans, `name` peut être `undefined` (sans défaut)", "`function greet(name?: string)`, o con un valor por defecto `name = \"you\"`; dentro, `name` puede ser `undefined` (sin valor por defecto)"],
    w: [["`function greet(optional name: string)`", "`function greet(optional name: string)`", "`function greet(optional name: string)`"], ["Any parameter can be left out", "Tout paramètre peut être omis", "Cualquier parámetro se puede omitir"], ["`function greet(name: string = null)`", "`function greet(name: string = null)`", "`function greet(name: string = null)`"]],
    e: [
      "Unlike JavaScript, TypeScript checks the number of arguments. Optional parameters come after the required ones; a default value also sets the type. A rest parameter takes the others: `...xs: number[]`.",
      "Contrairement à JavaScript, TypeScript vérifie le nombre d'arguments. Les paramètres optionnels viennent après les obligatoires ; une valeur par défaut fixe aussi le type. Un paramètre du reste prend les autres : `...xs: number[]`.",
      "A diferencia de JavaScript, TypeScript comprueba el número de argumentos. Los parámetros opcionales van después de los obligatorios; un valor por defecto fija también el tipo. Un parámetro rest toma los demás: `...xs: number[]`.",
    ],
  },
  {
    id: "ts-fn-03",
    q: ["What does a function typed `(): void` promise?", "Que promet une fonction typée `(): void` ?", "¿Qué promete una función tipada `(): void`?"],
    a: ["That its return value should not be used", "Que sa valeur de retour ne doit pas être utilisée", "Que su valor de retorno no debe usarse"],
    w: [["That it never returns", "Qu'elle ne rend jamais la main", "Que nunca termina"], ["That it returns `null`", "Qu'elle renvoie `null`", "Que devuelve `null`"], ["That it has no parameters", "Qu'elle n'a pas de paramètres", "Que no tiene parámetros"]],
    e: [
      "`void` means no useful value; at run time such a function returns `undefined`. A function that never returns (it always throws or loops) is typed `never`. A callback typed `() => void` may still be given a function that returns something, which is ignored.",
      "`void` veut dire aucune valeur utile ; à l'exécution, une telle fonction renvoie `undefined`. Une fonction qui ne rend jamais la main (elle lève toujours une erreur ou boucle) est typée `never`. Un rappel typé `() => void` peut quand même recevoir une fonction qui renvoie quelque chose, ignoré.",
      "`void` significa ningún valor útil; al ejecutar, una función así devuelve `undefined`. Una función que nunca termina (siempre lanza un error o se queda en un bucle) se tipa `never`. A una retrollamada tipada `() => void` se le puede pasar igualmente una función que devuelve algo, que se ignora.",
    ],
  },
  {
    id: "ts-fn-04",
    q: ["How is a variable that holds a function from `number` to `string` typed?", "Comment typer une variable qui contient une fonction de `number` vers `string` ?", "¿Cómo se tipa una variable que contiene una función de `number` a `string`?"],
    a: ["`let fmt: (n: number) => string;`", "`let fmt: (n: number) => string;`", "`let fmt: (n: number) => string;`"],
    w: [["`let fmt: function(number): string;`", "`let fmt: function(number): string;`", "`let fmt: function(number): string;`"], ["`let fmt: Function<number, string>;`", "`let fmt: Function<number, string>;`", "`let fmt: Function<number, string>;`"], ["`let fmt: number => string;`", "`let fmt: number => string;`", "`let fmt: number => string;`"]],
    e: [
      "A function type names its parameters (the names are documentation only) and its result after `=>`. `Function`, the global type, accepts any function and checks nothing: avoid it.",
      "Un type de fonction nomme ses paramètres (les noms ne servent qu'à la documentation) et son résultat après `=>`. `Function`, le type global, accepte n'importe quelle fonction et ne vérifie rien : à éviter.",
      "Un tipo de función nombra sus parámetros (los nombres solo sirven de documentación) y su resultado tras `=>`. `Function`, el tipo global, acepta cualquier función y no comprueba nada: evitarlo.",
    ],
  },
  {
    id: "ts-fn-05",
    q: ["In `[\"a\", \"b\"].map((s) => s.toUpperCase())`, why does `s` need no annotation?", "Dans `[\"a\", \"b\"].map((s) => s.toUpperCase())`, pourquoi `s` n'a-t-il pas besoin d'annotation ?", "En `[\"a\", \"b\"].map((s) => s.toUpperCase())`, ¿por qué `s` no necesita anotación?"],
    a: ["Contextual typing: `map` on a `string[]` expects a callback taking a `string`", "Le typage contextuel : `map` sur un `string[]` attend un rappel qui prend un `string`", "El tipado contextual: `map` sobre un `string[]` espera una retrollamada que recibe un `string`"],
    w: [["Callbacks are always `any`", "Les rappels sont toujours `any`", "Las retrollamadas siempre son `any`"], ["Arrow functions need no types", "Les fonctions fléchées n'ont pas besoin de types", "Las funciones flecha no necesitan tipos"], ["It is inferred from `toUpperCase`", "Il est déduit de `toUpperCase`", "Se deduce de `toUpperCase`"]],
    e: [
      "Where a function is passed, its parameter types come from the expected type. The result here is `string[]`. The same function stored in a variable first would need its parameter typed.",
      "Là où une fonction est passée, les types de ses paramètres viennent du type attendu. Le résultat ici est un `string[]`. La même fonction rangée d'abord dans une variable demanderait le type de son paramètre.",
      "Donde se pasa una función, los tipos de sus parámetros vienen del tipo esperado. El resultado aquí es un `string[]`. La misma función guardada antes en una variable necesitaría tipar su parámetro.",
    ],
  },
];

const interfaces: TsQuestion[] = [
  {
    id: "ts-iface-01",
    q: ["What does `interface User { name: string; age?: number }` describe?", "Que décrit `interface User { name: string; age?: number }` ?", "¿Qué describe `interface User { name: string; age?: number }`?"],
    a: ["An object with a `name` string and, optionally, an `age` number", "Un objet avec une chaîne `name` et, en option, un nombre `age`", "Un objeto con una cadena `name` y, opcionalmente, un número `age`"],
    w: [["A class to instantiate with `new User()`", "Une classe à instancier avec `new User()`", "Una clase que instanciar con `new User()`"], ["An object whose `age` is always `null`", "Un objet dont `age` vaut toujours `null`", "Un objeto cuyo `age` siempre es `null`"], ["A run-time check of objects", "Une vérification des objets à l'exécution", "Una comprobación de objetos al ejecutar"]],
    e: [
      "An interface is a shape for the type checker only; it leaves nothing in the JavaScript. `age?` may be missing; reading it gives `number | undefined`. Any object with those properties fits, whatever made it.",
      "Une interface est une forme pour le vérificateur de types seulement ; elle ne laisse rien dans le JavaScript. `age?` peut manquer ; le lire donne `number | undefined`. Tout objet ayant ces propriétés convient, quoi qui l'ait créé.",
      "Una interfaz es una forma solo para el comprobador de tipos; no deja nada en el JavaScript. `age?` puede faltar; leerlo da `number | undefined`. Cualquier objeto con esas propiedades vale, lo haya creado lo que sea.",
    ],
  },
  {
    id: "ts-iface-02",
    q: ["`interface` or `type` for an object shape?", "`interface` ou `type` pour la forme d'un objet ?", "¿`interface` o `type` para la forma de un objeto?"],
    a: ["Either works; `type` can also name unions and other types, an interface can be extended and merged", "Les deux marchent ; `type` peut aussi nommer des unions et d'autres types, une interface peut être étendue et fusionnée", "Los dos funcionan; `type` también puede nombrar uniones y otros tipos, una interfaz puede extenderse y fusionarse"],
    w: [["Only `interface` works for objects", "Seule `interface` marche pour les objets", "Solo `interface` funciona para objetos"], ["`type` is checked at run time", "`type` est vérifié à l'exécution", "`type` se comprueba al ejecutar"], ["`interface` is deprecated", "`interface` est obsolète", "`interface` está obsoleta"]],
    e: [
      "`type Id = string | number` has no interface form. Two `interface Window` declarations merge, which is how libraries extend globals. Pick one style per project; error messages are sometimes clearer with interfaces.",
      "`type Id = string | number` n'a pas d'équivalent en interface. Deux déclarations `interface Window` fusionnent, c'est ainsi que les bibliothèques étendent les globales. Choisir un style par projet ; les messages d'erreur sont parfois plus clairs avec les interfaces.",
      "`type Id = string | number` no tiene equivalente en interfaz. Dos declaraciones `interface Window` se fusionan, así extienden las bibliotecas los globales. Elegir un estilo por proyecto; los mensajes de error a veces son más claros con interfaces.",
    ],
  },
  {
    id: "ts-iface-03",
    q: ["What does `readonly id: number` in an interface prevent?", "Qu'empêche `readonly id: number` dans une interface ?", "¿Qué impide `readonly id: number` en una interfaz?"],
    a: ["Assigning `user.id = …` through that type, at compile time", "L'affectation `user.id = …` par ce type, à la compilation", "La asignación `user.id = …` mediante ese tipo, al compilar"],
    w: [["Any change to the object at run time", "Tout changement de l'objet à l'exécution", "Cualquier cambio del objeto al ejecutar"], ["Reading `id`", "La lecture de `id`", "La lectura de `id`"], ["Copying the object", "La copie de l'objet", "La copia del objeto"]],
    e: [
      "`readonly` is a compile-time promise about one view of the object; nothing stops the JavaScript, and another type without `readonly` may alias the same object. `Object.freeze` enforces it at run time, one level deep.",
      "`readonly` est une promesse à la compilation sur une vue de l'objet ; rien n'arrête le JavaScript, et un autre type sans `readonly` peut désigner le même objet. `Object.freeze` l'impose à l'exécution, sur un niveau.",
      "`readonly` es una promesa al compilar sobre una vista del objeto; nada detiene el JavaScript, y otro tipo sin `readonly` puede apuntar al mismo objeto. `Object.freeze` lo impone al ejecutar, a un nivel.",
    ],
  },
  {
    id: "ts-iface-04",
    q: ["Can an object literal with an extra property be passed where `User` is expected: `save({ name: \"Ana\", admin: true })`?", "Peut-on passer un littéral d'objet avec une propriété en trop là où `User` est attendu : `save({ name: \"Ana\", admin: true })` ?", "¿Se puede pasar un literal de objeto con una propiedad de más donde se espera `User`: `save({ name: \"Ana\", admin: true })`?"],
    a: ["No: an object literal gets an excess property check; the same object from a variable would pass", "Non : un littéral d'objet subit une vérification des propriétés en trop ; le même objet venu d'une variable passerait", "No: un literal de objeto pasa una comprobación de propiedades de más; el mismo objeto desde una variable pasaría"],
    w: [["Yes, always: extra properties are ignored", "Oui, toujours : les propriétés en trop sont ignorées", "Sí, siempre: las propiedades de más se ignoran"], ["No, never: types must match exactly", "Non, jamais : les types doivent correspondre exactement", "No, nunca: los tipos deben coincidir exactamente"], ["Only if `admin` is optional in `User`", "Seulement si `admin` est optionnel dans `User`", "Solo si `admin` es opcional en `User`"]],
    e: [
      "Types are structural: an object with more properties than needed still fits. For a fresh literal, an extra property is almost always a typo (`nmae`), so TypeScript flags it there only.",
      "Les types sont structurels : un objet avec plus de propriétés que nécessaire convient quand même. Pour un littéral tout neuf, une propriété en trop est presque toujours une faute de frappe (`nmae`), alors TypeScript la signale là seulement.",
      "Los tipos son estructurales: un objeto con más propiedades de las necesarias sigue valiendo. En un literal recién creado, una propiedad de más casi siempre es una errata (`nmae`), así que TypeScript la señala solo ahí.",
    ],
  },
  {
    id: "ts-iface-05",
    q: ["`interface Admin extends User { level: number }`: what is an `Admin`?", "`interface Admin extends User { level: number }` : qu'est-ce qu'un `Admin` ?", "`interface Admin extends User { level: number }`: ¿qué es un `Admin`?"],
    a: ["Everything a `User` has, plus `level`", "Tout ce qu'a un `User`, plus `level`", "Todo lo que tiene un `User`, más `level`"],
    w: [["A `User` with `level` instead of `name`", "Un `User` avec `level` au lieu de `name`", "Un `User` con `level` en lugar de `name`"], ["A subclass created at run time", "Une sous-classe créée à l'exécution", "Una subclase creada al ejecutar"], ["Either a `User` or a `level`", "Soit un `User` soit un `level`", "O un `User` o un `level`"]],
    e: [
      "Extending adds properties; every `Admin` is usable where a `User` is expected. With `type`, the same is written `type Admin = User & { level: number }`, an intersection.",
      "Étendre ajoute des propriétés ; tout `Admin` est utilisable là où un `User` est attendu. Avec `type`, la même chose s'écrit `type Admin = User & { level: number }`, une intersection.",
      "Extender añade propiedades; todo `Admin` se puede usar donde se espera un `User`. Con `type`, lo mismo se escribe `type Admin = User & { level: number }`, una intersección.",
    ],
  },
];

const unions: TsQuestion[] = [
  {
    id: "ts-union-01",
    q: ["`function len(x: string | string[])`: why does `x.toUpperCase()` fail?", "`function len(x: string | string[])` : pourquoi `x.toUpperCase()` échoue-t-il ?", "`function len(x: string | string[])`: ¿por qué falla `x.toUpperCase()`?"],
    a: ["Only what both members have is allowed; test first: `if (typeof x === \"string\")`", "Seul ce que les deux membres ont est permis ; tester d'abord : `if (typeof x === \"string\")`", "Solo se permite lo que tienen los dos miembros; probar antes: `if (typeof x === \"string\")`"],
    w: [["Unions cannot hold strings", "Les unions ne peuvent pas contenir de chaînes", "Las uniones no pueden contener cadenas"], ["`toUpperCase` needs `await`", "`toUpperCase` demande `await`", "`toUpperCase` necesita `await`"], ["It does not fail", "Ça n'échoue pas", "No falla"]],
    e: [
      "A union value is one of its members, unknown which until tested. `x.length` works (both have it); `toUpperCase` only on strings. Inside the `if`, TypeScript narrows `x` to `string`, and to `string[]` in the `else`.",
      "Une valeur d'union est l'un de ses membres, on ne sait lequel avant un test. `x.length` marche (les deux l'ont) ; `toUpperCase` seulement sur les chaînes. Dans le `if`, TypeScript affine `x` en `string`, et en `string[]` dans le `else`.",
      "Un valor de una unión es uno de sus miembros, sin saber cuál hasta probarlo. `x.length` funciona (los dos lo tienen); `toUpperCase` solo con cadenas. Dentro del `if`, TypeScript estrecha `x` a `string`, y a `string[]` en el `else`.",
    ],
  },
  {
    id: "ts-union-02",
    q: ["How do you allow only the values \"sm\", \"md\" and \"lg\" for a size?", "Comment n'autoriser que les valeurs \"sm\", \"md\" et \"lg\" pour une taille ?", "¿Cómo se permiten solo los valores \"sm\", \"md\" y \"lg\" para un tamaño?"],
    a: ["`type Size = \"sm\" | \"md\" | \"lg\";`", "`type Size = \"sm\" | \"md\" | \"lg\";`", "`type Size = \"sm\" | \"md\" | \"lg\";`"],
    w: [["`type Size = string(\"sm\", \"md\", \"lg\");`", "`type Size = string(\"sm\", \"md\", \"lg\");`", "`type Size = string(\"sm\", \"md\", \"lg\");`"], ["A regular expression on `string`", "Une expression régulière sur `string`", "Una expresión regular sobre `string`"], ["It is not possible without an enum", "Impossible sans un enum", "Imposible sin un enum"]],
    e: [
      "A union of string literals is checked, autocompleted and erased at run time. An `enum` is the older alternative, which emits an object. The values can also come from an array: `const SIZES = [\"sm\", \"md\"] as const; type Size = (typeof SIZES)[number];`.",
      "Une union de littéraux de chaîne est vérifiée, complétée par l'éditeur et effacée à l'exécution. Un `enum` est l'ancienne alternative, qui produit un objet. Les valeurs peuvent aussi venir d'un tableau : `const SIZES = [\"sm\", \"md\"] as const; type Size = (typeof SIZES)[number];`.",
      "Una unión de literales de cadena se comprueba, se autocompleta y se borra al ejecutar. Un `enum` es la alternativa antigua, que genera un objeto. Los valores también pueden venir de un array: `const SIZES = [\"sm\", \"md\"] as const; type Size = (typeof SIZES)[number];`.",
    ],
  },
  {
    id: "ts-union-03",
    q: ["Is `string | number` the same as `string & number`?", "`string | number` est-il pareil que `string & number` ?", "¿Es `string | number` lo mismo que `string & number`?"],
    a: ["No: `|` is either one; `&` is both at once, which for these two is impossible: `never`", "Non : `|` est l'un ou l'autre ; `&` les deux à la fois, ce qui est impossible pour ces deux-là : `never`", "No: `|` es uno u otro; `&` los dos a la vez, lo que es imposible para estos dos: `never`"],
    w: [["Yes: both mean either one", "Oui : les deux veulent dire l'un ou l'autre", "Sí: los dos significan uno u otro"], ["`&` concatenates strings and numbers", "`&` concatène chaînes et nombres", "`&` concatena cadenas y números"], ["`&` is a bitwise operation on types", "`&` est une opération bit à bit sur les types", "`&` es una operación bit a bit sobre tipos"]],
    e: [
      "Think of types as sets of values: a union is the union of the sets, an intersection their common part. For object types, the intersection has all the properties of both, which is why `A & B` combines shapes.",
      "Voir les types comme des ensembles de valeurs : une union est la réunion des ensembles, une intersection leur partie commune. Pour des types objets, l'intersection a toutes les propriétés des deux, d'où `A & B` qui combine des formes.",
      "Pensar en los tipos como conjuntos de valores: una unión es la unión de los conjuntos, una intersección su parte común. Para tipos objeto, la intersección tiene todas las propiedades de ambos, por eso `A & B` combina formas.",
    ],
  },
  {
    id: "ts-union-04",
    q: ["`function f(id: number | null)`: how do you use `id` as a number safely?", "`function f(id: number | null)` : comment utiliser `id` comme nombre sans risque ?", "`function f(id: number | null)`: ¿cómo se usa `id` como número con seguridad?"],
    a: ["Check it: `if (id !== null) { … }`, where `id` is a `number`", "Le vérifier : `if (id !== null) { … }`, où `id` est un `number`", "Comprobarlo: `if (id !== null) { … }`, donde `id` es un `number`"],
    w: [["`id!` everywhere", "`id!` partout", "`id!` en todas partes"], ["`id as number` everywhere", "`id as number` partout", "`id as number` en todas partes"], ["`Number(id)`, which turns `null` into a number safely", "`Number(id)`, qui transforme `null` en nombre sans risque", "`Number(id)`, que convierte `null` en número con seguridad"]],
    e: [
      "Narrowing by a check is safe; `id!` (non-null assertion) and `as` only silence the compiler, and a real `null` crashes later. `Number(null)` is 0, a quiet bug. `id ?? 0` gives a default when one makes sense.",
      "Affiner par un test est sûr ; `id!` (assertion de non-nullité) et `as` ne font que faire taire le compilateur, et un vrai `null` plante plus tard. `Number(null)` vaut 0, un bug silencieux. `id ?? 0` donne une valeur par défaut quand elle a un sens.",
      "Estrechar con una comprobación es seguro; `id!` (aserción de no nulo) y `as` solo silencian al compilador, y un `null` real falla después. `Number(null)` es 0, un fallo silencioso. `id ?? 0` da un valor por defecto cuando tiene sentido.",
    ],
  },
  {
    id: "ts-union-05",
    q: ["What does `x as string` do at run time?", "Que fait `x as string` à l'exécution ?", "¿Qué hace `x as string` al ejecutar?"],
    a: ["Nothing: it only tells the compiler to treat `x` as a string; no check, no conversion", "Rien : il dit seulement au compilateur de traiter `x` comme une chaîne ; ni vérification, ni conversion", "Nada: solo le dice al compilador que trate `x` como cadena; ni comprobación, ni conversión"],
    w: [["Converts `x` to a string", "Convertit `x` en chaîne", "Convierte `x` en cadena"], ["Throws if `x` is not a string", "Lève une erreur si `x` n'est pas une chaîne", "Lanza un error si `x` no es una cadena"], ["Returns `null` if `x` is not a string", "Renvoie `null` si `x` n'est pas une chaîne", "Devuelve `null` si `x` no es una cadena"]],
    e: [
      "A type assertion is erased. It is for when you know more than the compiler (a DOM element's exact type); wrong, it hides a bug. `String(x)` converts; a `typeof` test checks.",
      "Une assertion de type est effacée. Elle sert quand on en sait plus que le compilateur (le type exact d'un élément DOM) ; fausse, elle cache un bug. `String(x)` convertit ; un test `typeof` vérifie.",
      "Una aserción de tipo se borra. Sirve cuando se sabe más que el compilador (el tipo exacto de un elemento DOM); si es falsa, oculta un fallo. `String(x)` convierte; una prueba `typeof` comprueba.",
    ],
  },
];

const jsBasics: TsQuestion[] = [
  {
    id: "ts-js-01",
    q: ["Why prefer `===` to `==`?", "Pourquoi préférer `===` à `==` ?", "¿Por qué preferir `===` a `==`?"],
    a: ["`==` converts types first (`0 == \"\"` is true); `===` compares without converting", "`==` convertit d'abord les types (`0 == \"\"` est vrai) ; `===` compare sans convertir", "`==` convierte antes los tipos (`0 == \"\"` es verdadero); `===` compara sin convertir"],
    w: [["`===` is faster, otherwise the same", "`===` est plus rapide, sinon pareil", "`===` es más rápido, por lo demás igual"], ["`==` does not exist in TypeScript", "`==` n'existe pas en TypeScript", "`==` no existe en TypeScript"], ["`===` compares the contents of objects", "`===` compare le contenu des objets", "`===` compara el contenido de los objetos"]],
    e: [
      "Loose equality's conversion rules surprise. One accepted use: `x == null` is true for `null` and `undefined` alike. Neither operator compares objects by content: two arrays with the same items are not `===`.",
      "Les règles de conversion de l'égalité large surprennent. Un usage admis : `x == null` est vrai pour `null` comme pour `undefined`. Aucun des deux opérateurs ne compare le contenu des objets : deux tableaux aux mêmes éléments ne sont pas `===`.",
      "Las reglas de conversión de la igualdad débil sorprenden. Un uso aceptado: `x == null` es verdadero tanto para `null` como para `undefined`. Ninguno de los dos operadores compara el contenido de los objetos: dos arrays con los mismos elementos no son `===`.",
    ],
  },
  {
    id: "ts-js-02",
    q: ["`let`, `const` or `var`?", "`let`, `const` ou `var` ?", "¿`let`, `const` o `var`?"],
    a: ["`const` by default, `let` when the variable is reassigned, `var` never: it is scoped to the whole function", "`const` par défaut, `let` quand la variable est réaffectée, `var` jamais : sa portée est toute la fonction", "`const` por defecto, `let` cuando la variable se reasigna, `var` nunca: su ámbito es toda la función"],
    w: [["`var` everywhere, as it is the fastest", "`var` partout, c'est le plus rapide", "`var` en todas partes, es el más rápido"], ["`let` for numbers, `const` for strings", "`let` pour les nombres, `const` pour les chaînes", "`let` para números, `const` para cadenas"], ["`const` cannot hold objects", "`const` ne peut pas contenir d'objets", "`const` no puede contener objetos"]],
    e: [
      "`let` and `const` are block-scoped and cannot be used before their declaration. A `var` declared in a loop is one variable for the whole function, the source of the classic closure-in-a-loop bug.",
      "`let` et `const` ont une portée de bloc et ne peuvent pas servir avant leur déclaration. Un `var` déclaré dans une boucle est une seule variable pour toute la fonction, la source du bug classique des closures dans une boucle.",
      "`let` y `const` tienen ámbito de bloque y no pueden usarse antes de su declaración. Un `var` declarado en un bucle es una sola variable para toda la función, el origen del clásico fallo de las clausuras en un bucle.",
    ],
  },
  {
    id: "ts-js-03",
    q: ["Which values are falsy in JavaScript?", "Quelles valeurs sont fausses (falsy) en JavaScript ?", "¿Qué valores son falsos (falsy) en JavaScript?"],
    a: ["`false`, `0`, `-0`, `0n`, `\"\"`, `null`, `undefined` and `NaN`; everything else is truthy, `[]` and `{}` included", "`false`, `0`, `-0`, `0n`, `\"\"`, `null`, `undefined` et `NaN` ; tout le reste est vrai, `[]` et `{}` compris", "`false`, `0`, `-0`, `0n`, `\"\"`, `null`, `undefined` y `NaN`; todo lo demás es verdadero, `[]` y `{}` incluidos"],
    w: [["Only `false` and `null`", "Seulement `false` et `null`", "Solo `false` y `null`"], ["Also `[]`, `{}` and `\"0\"`", "Aussi `[]`, `{}` et `\"0\"`", "También `[]`, `{}` y `\"0\"`"], ["Only `false`: other values cannot be tested", "Seulement `false` : les autres valeurs ne se testent pas", "Solo `false`: los demás valores no se pueden probar"]],
    e: [
      "`if (items.length)` and `if (name)` rely on this, and so does `||`. The trap: 0 and \"\" are often valid values; test them explicitly, or use `??`, which only reacts to `null` and `undefined`.",
      "`if (items.length)` et `if (name)` reposent dessus, tout comme `||`. Le piège : 0 et \"\" sont souvent des valeurs valables ; les tester explicitement, ou utiliser `??`, qui ne réagit qu'à `null` et `undefined`.",
      "`if (items.length)` y `if (name)` se apoyan en esto, igual que `||`. La trampa: 0 y \"\" suelen ser valores válidos; probarlos de forma explícita, o usar `??`, que solo reacciona ante `null` y `undefined`.",
    ],
  },
  {
    id: "ts-js-04",
    q: ["What does `const { name, age = 18 } = user;` do?", "Que fait `const { name, age = 18 } = user;` ?", "¿Qué hace `const { name, age = 18 } = user;`?"],
    a: ["Takes `user.name` and `user.age` into two variables, `age` being 18 if it is `undefined`", "Met `user.name` et `user.age` dans deux variables, `age` valant 18 s'il est `undefined`", "Pone `user.name` y `user.age` en dos variables, `age` vale 18 si es `undefined`"],
    w: [["Sets `user.age` to 18", "Met `user.age` à 18", "Pone `user.age` a 18"], ["Creates a new object `{ name, age }`", "Crée un nouvel objet `{ name, age }`", "Crea un objeto nuevo `{ name, age }`"], ["Checks that `user` has these properties at run time", "Vérifie à l'exécution que `user` a ces propriétés", "Comprueba al ejecutar que `user` tiene esas propiedades"]],
    e: [
      "Destructuring reads properties into variables; the default applies only to `undefined`, not to `null` or 0. Renaming: `const { name: n } = user`. Arrays destructure by position: `const [first, ...rest] = list`.",
      "La déstructuration lit des propriétés dans des variables ; la valeur par défaut ne s'applique qu'à `undefined`, pas à `null` ni à 0. Pour renommer : `const { name: n } = user`. Les tableaux se déstructurent par position : `const [first, ...rest] = list`.",
      "La desestructuración lee propiedades en variables; el valor por defecto solo se aplica a `undefined`, no a `null` ni a 0. Para renombrar: `const { name: n } = user`. Los arrays se desestructuran por posición: `const [first, ...rest] = list`.",
    ],
  },
  {
    id: "ts-js-05",
    q: ["A string written between backticks (grave accents) contains `${name}`. What happens?", "Une chaîne écrite entre accents graves contient `${name}`. Que se passe-t-il ?", "Una cadena escrita entre acentos graves contiene `${name}`. ¿Qué pasa?"],
    a: ["The value of `name` is inserted: it is a template literal", "La valeur de `name` est insérée : c'est un gabarit de chaîne", "Se inserta el valor de `name`: es una plantilla de cadena"],
    w: [["The characters are kept as they are", "Les caractères sont gardés tels quels", "Los caracteres se quedan tal cual"], ["It is a regular expression", "C'est une expression régulière", "Es una expresión regular"], ["It runs a shell command", "Ça lance une commande shell", "Ejecuta una orden del shell"]],
    e: [
      "Backticks allow embedded expressions and line breaks; in ordinary quotes, `${name}` stays text. TypeScript also has template literal types, for example a type for every string that starts with on, for event names.",
      "Les accents graves permettent des expressions incluses et des retours à la ligne ; entre guillemets ordinaires, `${name}` reste du texte. TypeScript a aussi des types gabarits, par exemple un type pour toute chaîne qui commence par on, pour des noms d'événements.",
      "Los acentos graves permiten expresiones incluidas y saltos de línea; entre comillas normales, `${name}` sigue siendo texto. TypeScript también tiene tipos plantilla, por ejemplo un tipo para toda cadena que empieza por on, para nombres de eventos.",
    ],
  },
];

const setup: TsQuestion[] = [
  {
    id: "ts-setup-01",
    q: ["How does a TypeScript program usually run?", "Comment un programme TypeScript s'exécute-t-il d'habitude ?", "¿Cómo se suele ejecutar un programa TypeScript?"],
    a: ["The types are removed and the resulting JavaScript runs (in Node, a browser, Deno, Bun)", "Les types sont retirés et le JavaScript obtenu s'exécute (dans Node, un navigateur, Deno, Bun)", "Se quitan los tipos y se ejecuta el JavaScript resultante (en Node, un navegador, Deno, Bun)"],
    w: [["On a TypeScript virtual machine", "Sur une machine virtuelle TypeScript", "En una máquina virtual TypeScript"], ["Compiled to machine code by `tsc`", "Compilé en code machine par `tsc`", "Compilado a código máquina por `tsc`"], ["Interpreted with its types checked at each line", "Interprété avec ses types vérifiés à chaque ligne", "Interpretado comprobando sus tipos en cada línea"]],
    e: [
      "`tsc` both checks types and writes JavaScript; tools such as esbuild, tsx or Node's own type stripping only remove types, fast, without checking. A common setup: a fast tool to run, `tsc --noEmit` to check.",
      "`tsc` vérifie les types et écrit le JavaScript ; des outils comme esbuild, tsx ou le retrait des types de Node lui-même ne font que retirer les types, vite, sans vérifier. Un montage courant : un outil rapide pour exécuter, `tsc --noEmit` pour vérifier.",
      "`tsc` comprueba los tipos y escribe JavaScript; herramientas como esbuild, tsx o la eliminación de tipos del propio Node solo quitan los tipos, rápido, sin comprobar. Una configuración habitual: una herramienta rápida para ejecutar, `tsc --noEmit` para comprobar.",
    ],
  },
  {
    id: "ts-setup-02",
    q: ["What does `\"strict\": true` in `tsconfig.json` turn on?", "Qu'active `\"strict\": true` dans `tsconfig.json` ?", "¿Qué activa `\"strict\": true` en `tsconfig.json`?"],
    a: ["A family of checks: `strictNullChecks`, `noImplicitAny`, strict function types, and more", "Une famille de vérifications : `strictNullChecks`, `noImplicitAny`, types de fonctions stricts, et d'autres", "Una familia de comprobaciones: `strictNullChecks`, `noImplicitAny`, tipos de función estrictos, y más"],
    w: [["JavaScript's `\"use strict\"` only", "Seulement le `\"use strict\"` de JavaScript", "Solo el `\"use strict\"` de JavaScript"], ["Faster compilation", "Une compilation plus rapide", "Una compilación más rápida"], ["Run-time type checks", "Des vérifications de types à l'exécution", "Comprobaciones de tipos al ejecutar"]],
    e: [
      "Without `strict`, `null` fits in every type and missing types become `any`: much of the safety is gone. New projects start strict; `tsc --init` writes it. New strict-family flags join with TypeScript releases.",
      "Sans `strict`, `null` tient dans tous les types et les types manquants deviennent `any` : une bonne part de la sûreté disparaît. Les nouveaux projets commencent en strict ; `tsc --init` l'écrit. De nouvelles options rejoignent la famille au fil des versions.",
      "Sin `strict`, `null` cabe en todos los tipos y los tipos que faltan pasan a ser `any`: se pierde buena parte de la seguridad. Los proyectos nuevos empiezan en strict; `tsc --init` lo escribe. Nuevas opciones se unen a la familia con las versiones.",
    ],
  },
  {
    id: "ts-setup-03",
    q: ["What does `tsc --noEmit` do?", "Que fait `tsc --noEmit` ?", "¿Qué hace `tsc --noEmit`?"],
    a: ["Checks the types of the project without writing any JavaScript", "Vérifie les types du projet sans écrire de JavaScript", "Comprueba los tipos del proyecto sin escribir JavaScript"],
    w: [["Compiles without checking", "Compile sans vérifier", "Compila sin comprobar"], ["Removes the `dist` folder", "Supprime le dossier `dist`", "Borra la carpeta `dist`"], ["Lists the project's files", "Liste les fichiers du projet", "Lista los archivos del proyecto"]],
    e: [
      "When a bundler (Vite, esbuild) builds the code, `tsc --noEmit` is the type-check step, run in CI and in `--watch` while editing. Editors run the same checker through the language server.",
      "Quand un bundler (Vite, esbuild) construit le code, `tsc --noEmit` est l'étape de vérification des types, lancée en CI et en `--watch` pendant l'écriture. Les éditeurs font tourner le même vérificateur via le serveur de langage.",
      "Cuando un empaquetador (Vite, esbuild) construye el código, `tsc --noEmit` es el paso de comprobación de tipos, ejecutado en CI y en `--watch` mientras se escribe. Los editores ejecutan el mismo comprobador mediante el servidor de lenguaje.",
    ],
  },
  {
    id: "ts-setup-04",
    q: ["How does TypeScript know the types of a library such as `express`?", "Comment TypeScript connaît-il les types d'une bibliothèque comme `express` ?", "¿Cómo conoce TypeScript los tipos de una biblioteca como `express`?"],
    a: ["From declaration files (`.d.ts`): shipped with the package, or from `@types/express`", "Par des fichiers de déclaration (`.d.ts`) : livrés avec le paquet, ou venus de `@types/express`", "Por archivos de declaración (`.d.ts`): incluidos en el paquete, o desde `@types/express`"],
    w: [["By reading the library's JavaScript at run time", "En lisant le JavaScript de la bibliothèque à l'exécution", "Leyendo el JavaScript de la biblioteca al ejecutar"], ["It cannot: libraries are always `any`", "Impossible : les bibliothèques sont toujours `any`", "No puede: las bibliotecas siempre son `any`"], ["From the npm website", "Depuis le site de npm", "Desde la web de npm"]],
    e: [
      "A `.d.ts` file holds types only. Many packages bundle theirs; for others the community DefinitelyTyped project publishes `@types/…` packages, installed as dev dependencies. Node's own types are `@types/node`.",
      "Un fichier `.d.ts` ne contient que des types. Beaucoup de paquets livrent les leurs ; pour les autres, le projet communautaire DefinitelyTyped publie des paquets `@types/…`, installés en dépendances de développement. Les types de Node sont `@types/node`.",
      "Un archivo `.d.ts` solo contiene tipos. Muchos paquetes incluyen los suyos; para los demás, el proyecto comunitario DefinitelyTyped publica paquetes `@types/…`, que se instalan como dependencias de desarrollo. Los tipos de Node son `@types/node`.",
    ],
  },
  {
    id: "ts-setup-05",
    q: ["`target` and `lib` in `tsconfig.json`: what do they set?", "`target` et `lib` dans `tsconfig.json` : que règlent-ils ?", "`target` y `lib` en `tsconfig.json`: ¿qué ajustan?"],
    a: ["`target`: which JavaScript version is written; `lib`: which built-in APIs the code may use (`ES2023`, `DOM`…)", "`target` : quelle version de JavaScript est écrite ; `lib` : quelles API intégrées le code peut utiliser (`ES2023`, `DOM`…)", "`target`: qué versión de JavaScript se escribe; `lib`: qué API integradas puede usar el código (`ES2023`, `DOM`…)"],
    w: [["Where the output goes, and which libraries to download", "Où va la sortie, et quelles bibliothèques télécharger", "Adónde va la salida, y qué bibliotecas descargar"], ["The Node version to install", "La version de Node à installer", "La versión de Node que instalar"], ["Nothing since TypeScript 5", "Rien depuis TypeScript 5", "Nada desde TypeScript 5"]],
    e: [
      "An older `target` rewrites newer syntax; it never adds missing functions (no polyfills). `lib` only tells the checker what exists: with `DOM`, `document` type-checks even if the code then runs in Node. The output folder is `outDir`.",
      "Un `target` plus ancien réécrit la syntaxe récente ; il n'ajoute jamais de fonctions manquantes (pas de polyfills). `lib` ne dit au vérificateur que ce qui existe : avec `DOM`, `document` passe même si le code tourne ensuite dans Node. Le dossier de sortie est `outDir`.",
      "Un `target` más antiguo reescribe la sintaxis reciente; nunca añade funciones que faltan (sin polyfills). `lib` solo le dice al comprobador qué existe: con `DOM`, `document` pasa aunque el código se ejecute luego en Node. La carpeta de salida es `outDir`.",
    ],
  },
];

export const basics = { primitives, collections };
export const functionsTopic = { functions };
export const objects = { interfaces };
export const narrowing = { unions };
export const runtime = { jsBasics };
export const tooling = { setup };
