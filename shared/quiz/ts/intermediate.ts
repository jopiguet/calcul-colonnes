/**
 * TypeScript, Intermédiaire: literal types and enums, function signatures,
 * classes, narrowing, generics, promises and async, modules.
 */
import type { LinuxQuestion as TsQuestion } from "../linux/types";

const literals: TsQuestion[] = [
  {
    id: "ts-lit-01",
    q: ["What does `as const` do in `const dirs = [\"up\", \"down\"] as const;`?", "Que fait `as const` dans `const dirs = [\"up\", \"down\"] as const;` ?", "¿Qué hace `as const` en `const dirs = [\"up\", \"down\"] as const;`?"],
    a: ["Keeps the narrowest type: `readonly [\"up\", \"down\"]`, not `string[]`", "Garde le type le plus étroit : `readonly [\"up\", \"down\"]`, pas `string[]`", "Conserva el tipo más estrecho: `readonly [\"up\", \"down\"]`, no `string[]`"],
    w: [["Freezes the array at run time", "Gèle le tableau à l'exécution", "Congela el array al ejecutar"], ["Converts the strings to constants of an enum", "Convertit les chaînes en constantes d'un enum", "Convierte las cadenas en constantes de un enum"], ["Nothing: `const` already does it", "Rien : `const` le fait déjà", "Nada: `const` ya lo hace"]],
    e: [
      "`as const` is a type-level hint: literal types, readonly arrays and properties, tuples instead of arrays. Nothing changes at run time (`Object.freeze` would). `(typeof dirs)[number]` then gives `\"up\" | \"down\"`.",
      "`as const` est une indication de typage : types littéraux, tableaux et propriétés en lecture seule, tuples au lieu de tableaux. Rien ne change à l'exécution (`Object.freeze` le ferait). `(typeof dirs)[number]` donne ensuite `\"up\" | \"down\"`.",
      "`as const` es una indicación de tipos: tipos literales, arrays y propiedades de solo lectura, tuplas en lugar de arrays. Nada cambia al ejecutar (`Object.freeze` sí). `(typeof dirs)[number]` da después `\"up\" | \"down\"`.",
    ],
  },
  {
    id: "ts-lit-02",
    q: ["What does `enum Color { Red, Green }` produce at run time?", "Que produit `enum Color { Red, Green }` à l'exécution ?", "¿Qué produce `enum Color { Red, Green }` al ejecutar?"],
    a: ["An object, with `Color.Red` 0 and `Color.Green` 1, and a reverse mapping from numbers to names", "Un objet, avec `Color.Red` à 0 et `Color.Green` à 1, et une table inverse des nombres vers les noms", "Un objeto, con `Color.Red` en 0 y `Color.Green` en 1, y una tabla inversa de números a nombres"],
    w: [["Nothing: enums are erased like types", "Rien : les enums sont effacés comme les types", "Nada: los enums se borran como los tipos"], ["Two global constants", "Deux constantes globales", "Dos constantes globales"], ["A class with two instances", "Une classe avec deux instances", "Una clase con dos instancias"]],
    e: [
      "Enums are one of the few TypeScript features that emit code, which is why `erasableSyntaxOnly` and Node's type stripping reject them. A numeric enum also accepts any number. A union of string literals, or an `as const` object, usually serves better.",
      "Les enums sont l'une des rares fonctions de TypeScript qui produisent du code, d'où le refus de `erasableSyntaxOnly` et du retrait des types de Node. Un enum numérique accepte aussi n'importe quel nombre. Une union de littéraux, ou un objet `as const`, convient en général mieux.",
      "Los enums son una de las pocas funciones de TypeScript que generan código, por eso `erasableSyntaxOnly` y la eliminación de tipos de Node los rechazan. Un enum numérico acepta además cualquier número. Una unión de literales, o un objeto `as const`, suele servir mejor.",
    ],
  },
  {
    id: "ts-lit-03",
    q: ["`let dir = \"up\"; move(dir);` fails when `move` takes `\"up\" | \"down\"`. Why?", "`let dir = \"up\"; move(dir);` échoue quand `move` prend `\"up\" | \"down\"`. Pourquoi ?", "`let dir = \"up\"; move(dir);` falla cuando `move` recibe `\"up\" | \"down\"`. ¿Por qué?"],
    a: ["`let` widens `dir` to `string`, which may be any text; use `const`, or annotate `let dir: \"up\" | \"down\"`", "`let` élargit `dir` en `string`, qui peut être n'importe quel texte ; utiliser `const`, ou annoter `let dir: \"up\" | \"down\"`", "`let` amplía `dir` a `string`, que puede ser cualquier texto; usar `const`, o anotar `let dir: \"up\" | \"down\"`"],
    w: [["`move` cannot take variables", "`move` ne peut pas prendre de variables", "`move` no puede recibir variables"], ["The string must be in single quotes", "La chaîne doit être entre apostrophes", "La cadena debe ir entre comillas simples"], ["Literal types only work in interfaces", "Les types littéraux ne marchent que dans les interfaces", "Los tipos literales solo funcionan en interfaces"]],
    e: [
      "Widening is why literal types sometimes seem lost. Objects widen too: `{ dir: \"up\" }` has `dir: string`; `as const` or `satisfies` with the expected type keeps it narrow.",
      "L'élargissement explique pourquoi les types littéraux semblent parfois perdus. Les objets s'élargissent aussi : `{ dir: \"up\" }` a `dir: string` ; `as const` ou `satisfies` avec le type attendu le garde étroit.",
      "La ampliación explica por qué los tipos literales a veces parecen perderse. Los objetos también se amplían: `{ dir: \"up\" }` tiene `dir: string`; `as const` o `satisfies` con el tipo esperado lo mantiene estrecho.",
    ],
  },
  {
    id: "ts-lit-04",
    q: ["What is the type `never`?", "Qu'est-ce que le type `never` ?", "¿Qué es el tipo `never`?"],
    a: ["The empty type: no value has it; a function that never returns, or a case that cannot happen", "Le type vide : aucune valeur ne l'a ; une fonction qui ne rend jamais la main, ou un cas impossible", "El tipo vacío: ningún valor lo tiene; una función que nunca termina, o un caso imposible"],
    w: [["Another name for `void`", "Un autre nom de `void`", "Otro nombre de `void`"], ["Another name for `null`", "Un autre nom de `null`", "Otro nombre de `null`"], ["The type of variables never used", "Le type des variables jamais utilisées", "El tipo de las variables nunca usadas"]],
    e: [
      "After every member of a union has been handled, what is left is `never`: assigning it to a `never` variable makes the compiler complain the day a new member is added. `string & number` is `never` too.",
      "Une fois chaque membre d'une union traité, ce qui reste est `never` : l'affecter à une variable `never` fait protester le compilateur le jour où un nouveau membre est ajouté. `string & number` est aussi `never`.",
      "Una vez tratado cada miembro de una unión, lo que queda es `never`: asignarlo a una variable `never` hace que el compilador proteste el día que se añada un miembro nuevo. `string & number` también es `never`.",
    ],
  },
  {
    id: "ts-lit-05",
    q: ["What does `const cfg = { port: 8080 } satisfies Config;` give over `const cfg: Config = …`?", "Qu'apporte `const cfg = { port: 8080 } satisfies Config;` par rapport à `const cfg: Config = …` ?", "¿Qué aporta `const cfg = { port: 8080 } satisfies Config;` frente a `const cfg: Config = …`?"],
    a: ["It checks the value against `Config` but keeps the value's own, narrower type", "Il vérifie la valeur face à `Config` mais garde le type propre, plus étroit, de la valeur", "Comprueba el valor frente a `Config` pero conserva el tipo propio, más estrecho, del valor"],
    w: [["It converts the value to a `Config`", "Il convertit la valeur en `Config`", "Convierte el valor en un `Config`"], ["It skips the check", "Il saute la vérification", "Se salta la comprobación"], ["It checks at run time", "Il vérifie à l'exécution", "Comprueba al ejecutar"]],
    e: [
      "With an annotation, `cfg` has type `Config` and loses what the literal said (for example which optional keys are present). `satisfies` (TypeScript 4.9) validates without widening, so `cfg.port` is known to exist.",
      "Avec une annotation, `cfg` a le type `Config` et perd ce que disait le littéral (par exemple quelles clés optionnelles sont présentes). `satisfies` (TypeScript 4.9) valide sans élargir : `cfg.port` est connu comme présent.",
      "Con una anotación, `cfg` tiene el tipo `Config` y pierde lo que decía el literal (por ejemplo qué claves opcionales están presentes). `satisfies` (TypeScript 4.9) valida sin ampliar, así que se sabe que `cfg.port` existe.",
    ],
  },
];

const signatures: TsQuestion[] = [
  {
    id: "ts-sig-01",
    q: ["What are function overloads for?", "À quoi servent les surcharges de fonction ?", "¿Para qué sirven las sobrecargas de función?"],
    a: ["Several call signatures for one implementation, when the result's type depends on the arguments", "Plusieurs signatures d'appel pour une seule implémentation, quand le type du résultat dépend des arguments", "Varias firmas de llamada para una sola implementación, cuando el tipo del resultado depende de los argumentos"],
    w: [["Several implementations chosen at run time by type", "Plusieurs implémentations choisies à l'exécution selon le type", "Varias implementaciones elegidas al ejecutar según el tipo"], ["Calling a function more than once", "Appeler une fonction plusieurs fois", "Llamar a una función más de una vez"], ["Replacing a library's function", "Remplacer la fonction d'une bibliothèque", "Sustituir la función de una biblioteca"]],
    e: [
      "`function parse(x: string): number; function parse(x: number): string;` then one body handling both. JavaScript has no dispatch on types: the body tests `typeof`. When a union parameter or a generic is enough, prefer it.",
      "`function parse(x: string): number; function parse(x: number): string;` puis un seul corps qui traite les deux. JavaScript ne choisit rien selon les types : le corps teste `typeof`. Quand un paramètre union ou un générique suffit, le préférer.",
      "`function parse(x: string): number; function parse(x: number): string;` y luego un solo cuerpo que trata ambos. JavaScript no elige nada según los tipos: el cuerpo prueba `typeof`. Cuando basta un parámetro unión o un genérico, preferirlo.",
    ],
  },
  {
    id: "ts-sig-02",
    q: ["`const f = obj.method; f();` and `this` is `undefined` inside. Why?", "`const f = obj.method; f();` et `this` vaut `undefined` dedans. Pourquoi ?", "`const f = obj.method; f();` y `this` vale `undefined` dentro. ¿Por qué?"],
    a: ["`this` depends on how a function is called; detached from `obj`, it is lost: bind it, or use an arrow function", "`this` dépend de la façon dont une fonction est appelée ; détachée de `obj`, elle le perd : la lier, ou utiliser une fonction fléchée", "`this` depende de cómo se llama una función; separada de `obj`, lo pierde: enlazarla, o usar una función flecha"],
    w: [["Methods cannot be stored in variables", "Les méthodes ne se rangent pas dans des variables", "Los métodos no se guardan en variables"], ["`f` is a copy of `obj`", "`f` est une copie de `obj`", "`f` es una copia de `obj`"], ["TypeScript removes `this` when compiling", "TypeScript retire `this` à la compilation", "TypeScript quita `this` al compilar"]],
    e: [
      "The same happens when a method is passed as a callback: `button.onclick = obj.method`. `obj.method.bind(obj)`, `() => obj.method()`, or a class field defined as an arrow function keep `this`. Arrow functions take `this` from where they are written.",
      "Il en va de même quand une méthode est passée en rappel : `button.onclick = obj.method`. `obj.method.bind(obj)`, `() => obj.method()`, ou un champ de classe défini en fonction fléchée gardent `this`. Les fonctions fléchées prennent le `this` de l'endroit où elles sont écrites.",
      "Lo mismo pasa cuando un método se pasa como retrollamada: `button.onclick = obj.method`. `obj.method.bind(obj)`, `() => obj.method()`, o un campo de clase definido como función flecha conservan `this`. Las funciones flecha toman el `this` del lugar donde se escriben.",
    ],
  },
  {
    id: "ts-sig-03",
    q: ["How is a function taking any number of numbers typed?", "Comment typer une fonction qui prend un nombre quelconque de nombres ?", "¿Cómo se tipa una función que recibe cualquier cantidad de números?"],
    a: ["`function sum(...xs: number[]): number`", "`function sum(...xs: number[]): number`", "`function sum(...xs: number[]): number`"],
    w: [["`function sum(xs: number...): number`", "`function sum(xs: number...): number`", "`function sum(xs: number...): number`"], ["`function sum(arguments): number`", "`function sum(arguments): number`", "`function sum(arguments): number`"], ["`function sum(*xs: number): number`", "`function sum(*xs: number): number`", "`function sum(*xs: number): number`"]],
    e: [
      "A rest parameter collects the remaining arguments into an array. To pass an array to it, spread it: `sum(...values)`. A rest parameter typed as a tuple, `...args: [string, number]`, fixes the count.",
      "Un paramètre du reste regroupe les arguments restants dans un tableau. Pour lui passer un tableau, le décomposer : `sum(...values)`. Un paramètre du reste typé comme un tuple, `...args: [string, number]`, fixe le nombre.",
      "Un parámetro rest reúne los argumentos restantes en un array. Para pasarle un array, propagarlo: `sum(...values)`. Un parámetro rest tipado como tupla, `...args: [string, number]`, fija la cantidad.",
    ],
  },
  {
    id: "ts-sig-04",
    q: ["A callback is typed `(item: string) => void`. Can it be given `(item: string, i: number) => void`?", "Un rappel est typé `(item: string) => void`. Peut-on lui donner `(item: string, i: number) => void` ?", "Una retrollamada se tipa `(item: string) => void`. ¿Se le puede dar `(item: string, i: number) => void`?"],
    a: ["No: it would expect an `i` that is never passed; the other way round, a function with fewer parameters, is fine", "Non : elle attendrait un `i` jamais passé ; l'inverse, une fonction avec moins de paramètres, va bien", "No: esperaría un `i` que nunca se pasa; al revés, una función con menos parámetros, vale"],
    w: [["Yes: extra parameters are ignored", "Oui : les paramètres en trop sont ignorés", "Sí: los parámetros de más se ignoran"], ["Yes, if `i` is a number", "Oui, si `i` est un nombre", "Sí, si `i` es un número"], ["No: callbacks must match exactly", "Non : les rappels doivent correspondre exactement", "No: las retrollamadas deben coincidir exactamente"]],
    e: [
      "Passing fewer parameters is safe, because JavaScript ignores extra arguments: that is why `arr.forEach((x) => …)` fits `forEach`'s three-parameter callback. Requiring more would read `undefined`.",
      "Prendre moins de paramètres est sûr, car JavaScript ignore les arguments en trop : c'est pourquoi `arr.forEach((x) => …)` convient au rappel à trois paramètres de `forEach`. En exiger plus ferait lire `undefined`.",
      "Recibir menos parámetros es seguro, porque JavaScript ignora los argumentos de más: por eso `arr.forEach((x) => …)` encaja con la retrollamada de tres parámetros de `forEach`. Exigir más haría leer `undefined`.",
    ],
  },
  {
    id: "ts-sig-05",
    q: ["What does `function assertIsString(x: unknown): asserts x is string` declare?", "Que déclare `function assertIsString(x: unknown): asserts x is string` ?", "¿Qué declara `function assertIsString(x: unknown): asserts x is string`?"],
    a: ["That if the function returns, `x` is a `string` from then on (it must throw otherwise)", "Que si la fonction rend la main, `x` est un `string` à partir de là (sinon elle doit lever une erreur)", "Que si la función termina, `x` es un `string` desde ahí (si no, debe lanzar un error)"],
    w: [["That it returns a boolean", "Qu'elle renvoie un booléen", "Que devuelve un booleano"], ["That it converts `x` to a string", "Qu'elle convertit `x` en chaîne", "Que convierte `x` en cadena"], ["Nothing: `asserts` is a comment", "Rien : `asserts` est un commentaire", "Nada: `asserts` es un comentario"]],
    e: [
      "An assertion function narrows the variable for the rest of the block, like a check that throws. TypeScript trusts the signature: a body that does not really throw on bad input makes the narrowing a lie.",
      "Une fonction d'assertion affine la variable pour la suite du bloc, comme une vérification qui lève une erreur. TypeScript fait confiance à la signature : un corps qui ne lève pas vraiment d'erreur sur une entrée invalide rend l'affinement mensonger.",
      "Una función de aserción estrecha la variable para el resto del bloque, como una comprobación que lanza un error. TypeScript confía en la firma: un cuerpo que no lance de verdad un error ante una entrada inválida hace mentiroso el estrechamiento.",
    ],
  },
];

const classes: TsQuestion[] = [
  {
    id: "ts-class-01",
    q: ["`private secret` against `#secret` in a class: what is the difference?", "`private secret` face à `#secret` dans une classe : quelle différence ?", "`private secret` frente a `#secret` en una clase: ¿qué diferencia hay?"],
    a: ["`private` is checked only by TypeScript and erased; `#secret` is private in JavaScript itself, at run time", "`private` n'est vérifié que par TypeScript et effacé ; `#secret` est privé dans JavaScript lui-même, à l'exécution", "`private` solo lo comprueba TypeScript y se borra; `#secret` es privado en el propio JavaScript, al ejecutar"],
    w: [["None: two spellings of one thing", "Aucune : deux écritures d'une même chose", "Ninguna: dos formas de escribir lo mismo"], ["`#secret` is a comment", "`#secret` est un commentaire", "`#secret` es un comentario"], ["`private` is enforced at run time, `#` is not", "`private` est imposé à l'exécution, `#` non", "`private` se impone al ejecutar, `#` no"]],
    e: [
      "`(obj as any).secret` reads a `private` field; nothing reaches a `#field` from outside the class. Both have their uses: `private` costs nothing and lets tests peek, `#` really hides.",
      "`(obj as any).secret` lit un champ `private` ; rien n'atteint un `#champ` hors de la classe. Les deux ont leur usage : `private` ne coûte rien et laisse les tests regarder, `#` cache vraiment.",
      "`(obj as any).secret` lee un campo `private`; nada llega a un `#campo` desde fuera de la clase. Los dos tienen su uso: `private` no cuesta nada y deja mirar a las pruebas, `#` oculta de verdad.",
    ],
  },
  {
    id: "ts-class-02",
    q: ["What does `constructor(private readonly db: Db) {}` do?", "Que fait `constructor(private readonly db: Db) {}` ?", "¿Qué hace `constructor(private readonly db: Db) {}`?"],
    a: ["Declares a `db` property and assigns the argument to it: a parameter property", "Déclare une propriété `db` et lui affecte l'argument : une propriété de paramètre", "Declara una propiedad `db` y le asigna el argumento: una propiedad de parámetro"],
    w: [["Nothing: the parameter is not stored", "Rien : le paramètre n'est pas gardé", "Nada: el parámetro no se guarda"], ["Makes the `Db` class private", "Rend la classe `Db` privée", "Hace privada la clase `Db`"], ["Creates a new `Db` each time", "Crée un nouveau `Db` à chaque fois", "Crea un `Db` nuevo cada vez"]],
    e: [
      "A short form for a field plus `this.db = db`. It emits code, so `erasableSyntaxOnly` (and Node's type stripping) refuse it; writing the field and the assignment by hand is the erasable form.",
      "Une forme courte pour un champ plus `this.db = db`. Elle produit du code, donc `erasableSyntaxOnly` (et le retrait des types de Node) la refusent ; écrire le champ et l'affectation à la main est la forme effaçable.",
      "Una forma corta de un campo más `this.db = db`. Genera código, así que `erasableSyntaxOnly` (y la eliminación de tipos de Node) la rechazan; escribir el campo y la asignación a mano es la forma borrable.",
    ],
  },
  {
    id: "ts-class-03",
    q: ["`abstract class Shape { abstract area(): number }`: what can you do with it?", "`abstract class Shape { abstract area(): number }` : que peut-on en faire ?", "`abstract class Shape { abstract area(): number }`: ¿qué se puede hacer con ella?"],
    a: ["Extend it, and implement `area` in each subclass; `new Shape()` is refused", "L'étendre, et implémenter `area` dans chaque sous-classe ; `new Shape()` est refusé", "Extenderla, e implementar `area` en cada subclase; `new Shape()` se rechaza"],
    w: [["Create shapes with `new Shape()`", "Créer des formes avec `new Shape()`", "Crear formas con `new Shape()`"], ["Only use it as an interface", "Seulement s'en servir comme interface", "Solo usarla como interfaz"], ["Call `Shape.area()` directly", "Appeler `Shape.area()` directement", "Llamar a `Shape.area()` directamente"]],
    e: [
      "An abstract class can hold shared code and leave some methods to subclasses. Unlike an interface it exists at run time and allows only single inheritance; a class may `implements` several interfaces.",
      "Une classe abstraite peut contenir du code commun et laisser des méthodes aux sous-classes. Contrairement à une interface, elle existe à l'exécution et ne permet qu'un héritage simple ; une classe peut `implements` plusieurs interfaces.",
      "Una clase abstracta puede contener código común y dejar métodos a las subclases. A diferencia de una interfaz, existe al ejecutar y solo permite herencia simple; una clase puede `implements` varias interfaces.",
    ],
  },
  {
    id: "ts-class-04",
    q: ["`class Point { x: number; }` in strict mode: what does the compiler say?", "`class Point { x: number; }` en mode strict : que dit le compilateur ?", "`class Point { x: number; }` en modo strict: ¿qué dice el compilador?"],
    a: ["`x` has no initializer and is not set in the constructor (`strictPropertyInitialization`)", "`x` n'a pas de valeur initiale et n'est pas affecté dans le constructeur (`strictPropertyInitialization`)", "`x` no tiene valor inicial y no se asigna en el constructor (`strictPropertyInitialization`)"],
    w: [["Nothing: `x` is 0 by default", "Rien : `x` vaut 0 par défaut", "Nada: `x` vale 0 por defecto"], ["Classes cannot declare fields", "Les classes ne peuvent pas déclarer de champs", "Las clases no pueden declarar campos"], ["`x` must be `public`", "`x` doit être `public`", "`x` debe ser `public`"]],
    e: [
      "Without a value, `x` would be `undefined`, though typed `number`. Give it one (`x = 0`), set it in the constructor, make it optional, or, when a framework fills it, use `x!: number` to say so.",
      "Sans valeur, `x` vaudrait `undefined` tout en étant typé `number`. Lui en donner une (`x = 0`), l'affecter dans le constructeur, le rendre optionnel, ou, quand un framework le remplit, écrire `x!: number` pour le dire.",
      "Sin valor, `x` sería `undefined` aunque esté tipado `number`. Darle uno (`x = 0`), asignarlo en el constructor, hacerlo opcional, o, cuando un framework lo rellena, escribir `x!: number` para decirlo.",
    ],
  },
  {
    id: "ts-class-05",
    q: ["`class Dog implements Animal`: what does `implements` check?", "`class Dog implements Animal` : que vérifie `implements` ?", "`class Dog implements Animal`: ¿qué comprueba `implements`?"],
    a: ["That `Dog` has everything `Animal` requires; it adds nothing to the class", "Que `Dog` a tout ce que `Animal` exige ; il n'ajoute rien à la classe", "Que `Dog` tiene todo lo que exige `Animal`; no añade nada a la clase"],
    w: [["It copies `Animal`'s methods into `Dog`", "Il copie les méthodes d'`Animal` dans `Dog`", "Copia los métodos de `Animal` en `Dog`"], ["It makes `Dog` a subclass at run time", "Il fait de `Dog` une sous-classe à l'exécution", "Hace de `Dog` una subclase al ejecutar"], ["Nothing: it is required to use `Dog` as an `Animal`", "Rien : il est obligatoire pour utiliser `Dog` comme `Animal`", "Nada: es obligatorio para usar `Dog` como `Animal`"]],
    e: [
      "It is a check at the class, giving errors where the class is written. It is not required: with structural typing, any object with the right members is an `Animal`. Method parameter types are not inferred from it.",
      "C'est une vérification sur la classe, qui donne les erreurs là où la classe est écrite. Elle n'est pas obligatoire : avec le typage structurel, tout objet qui a les bons membres est un `Animal`. Les types des paramètres des méthodes n'en sont pas déduits.",
      "Es una comprobación sobre la clase, que da los errores donde se escribe la clase. No es obligatoria: con el tipado estructural, cualquier objeto con los miembros adecuados es un `Animal`. Los tipos de los parámetros de los métodos no se deducen de ella.",
    ],
  },
];

const guards: TsQuestion[] = [
  {
    id: "ts-guard-01",
    q: ["`type Shape = { kind: \"circle\"; r: number } | { kind: \"square\"; side: number }`: how do you tell them apart?", "`type Shape = { kind: \"circle\"; r: number } | { kind: \"square\"; side: number }` : comment les distinguer ?", "`type Shape = { kind: \"circle\"; r: number } | { kind: \"square\"; side: number }`: ¿cómo se distinguen?"],
    a: ["`switch (s.kind)`: each `case` narrows `s` to that member", "`switch (s.kind)` : chaque `case` affine `s` en ce membre", "`switch (s.kind)`: cada `case` estrecha `s` a ese miembro"],
    w: [["`s instanceof Circle`", "`s instanceof Circle`", "`s instanceof Circle`"], ["`typeof s === \"circle\"`", "`typeof s === \"circle\"`", "`typeof s === \"circle\"`"], ["It cannot be done at run time", "Impossible à l'exécution", "No se puede al ejecutar"]],
    e: [
      "A discriminated union: a shared literal property tells the members apart, at run time and for the checker. No classes are needed, and `instanceof` would not work on plain objects. It is the usual way to model states and messages.",
      "Une union discriminée : une propriété littérale commune distingue les membres, à l'exécution et pour le vérificateur. Pas besoin de classes, et `instanceof` ne marcherait pas sur des objets simples. C'est la façon habituelle de modéliser des états et des messages.",
      "Una unión discriminada: una propiedad literal común distingue los miembros, al ejecutar y para el comprobador. No hacen falta clases, e `instanceof` no funcionaría con objetos simples. Es la forma habitual de modelar estados y mensajes.",
    ],
  },
  {
    id: "ts-guard-02",
    q: ["How do you make a `switch` over `s.kind` fail to compile when a new shape is added and forgotten?", "Comment faire échouer la compilation d'un `switch` sur `s.kind` quand une nouvelle forme est ajoutée et oubliée ?", "¿Cómo se hace que un `switch` sobre `s.kind` no compile cuando se añade una forma nueva y se olvida?"],
    a: ["In `default`, assign `s` to a variable of type `never`: `const done: never = s;`", "Dans le `default`, affecter `s` à une variable de type `never` : `const done: never = s;`", "En el `default`, asignar `s` a una variable de tipo `never`: `const done: never = s;`"],
    w: [["Add `strict: true`", "Ajouter `strict: true`", "Añadir `strict: true`"], ["Throw an error in `default`", "Lever une erreur dans le `default`", "Lanzar un error en el `default`"], ["It happens by itself, always", "Ça se fait tout seul, toujours", "Pasa solo, siempre"]],
    e: [
      "When every case is handled, `s` is `never` in `default` and the assignment is fine; a new member reaches `default` and the assignment fails. Throwing alone only fails at run time. A function returning a value without `default` also gets checked, through its return type.",
      "Quand tous les cas sont traités, `s` est `never` dans le `default` et l'affectation passe ; un nouveau membre arrive au `default` et l'affectation échoue. Lever une erreur seule n'échoue qu'à l'exécution. Une fonction qui renvoie une valeur sans `default` est aussi vérifiée, par son type de retour.",
      "Cuando todos los casos están tratados, `s` es `never` en el `default` y la asignación pasa; un miembro nuevo llega al `default` y la asignación falla. Lanzar un error solo falla al ejecutar. Una función que devuelve un valor sin `default` también se comprueba, por su tipo de retorno.",
    ],
  },
  {
    id: "ts-guard-03",
    q: ["What does `function isFish(p: Pet): p is Fish` let the caller do?", "Que permet `function isFish(p: Pet): p is Fish` à l'appelant ?", "¿Qué permite `function isFish(p: Pet): p is Fish` a quien la llama?"],
    a: ["After `if (isFish(p))`, use `p` as a `Fish` inside the `if`", "Après `if (isFish(p))`, utiliser `p` comme un `Fish` dans le `if`", "Tras `if (isFish(p))`, usar `p` como un `Fish` dentro del `if`"],
    w: [["Convert a `Pet` into a `Fish`", "Convertir un `Pet` en `Fish`", "Convertir un `Pet` en `Fish`"], ["Nothing more than a `boolean` return", "Rien de plus qu'un retour `boolean`", "Nada más que un retorno `boolean`"], ["Check the type at compile time only", "Vérifier le type à la compilation seulement", "Comprobar el tipo solo al compilar"]],
    e: [
      "A type predicate is a boolean function that also narrows. As with assertion functions, TypeScript trusts the body. Since TypeScript 5.5, simple guards such as `(x) => x !== null` get their predicate inferred, so `filter` narrows arrays.",
      "Un prédicat de type est une fonction booléenne qui affine en plus. Comme pour les fonctions d'assertion, TypeScript fait confiance au corps. Depuis TypeScript 5.5, des gardes simples comme `(x) => x !== null` ont leur prédicat déduit, donc `filter` affine les tableaux.",
      "Un predicado de tipo es una función booleana que además estrecha. Como con las funciones de aserción, TypeScript confía en el cuerpo. Desde TypeScript 5.5, guardas sencillas como `(x) => x !== null` deducen su predicado, así que `filter` estrecha los arrays.",
    ],
  },
  {
    id: "ts-guard-04",
    q: ["`if (\"swim\" in animal) { … }`: what does it narrow?", "`if (\"swim\" in animal) { … }` : qu'est-ce que cela affine ?", "`if (\"swim\" in animal) { … }`: ¿qué estrecha?"],
    a: ["`animal` to the members of its union that have a `swim` property", "`animal` aux membres de son union qui ont une propriété `swim`", "`animal` a los miembros de su unión que tienen una propiedad `swim`"],
    w: [["Nothing: `in` is only for loops", "Rien : `in` ne sert qu'aux boucles", "Nada: `in` solo sirve para bucles"], ["`animal` to `string`", "`animal` en `string`", "`animal` a `string`"], ["It checks that `swim` is a method", "Il vérifie que `swim` est une méthode", "Comprueba que `swim` es un método"]],
    e: [
      "The `in` operator tests whether an object has a property (its own or inherited), at run time, and TypeScript narrows on it. Next to `typeof`, `instanceof` and literal checks, it is one of the built-in narrowings.",
      "L'opérateur `in` teste si un objet a une propriété (propre ou héritée), à l'exécution, et TypeScript affine dessus. Avec `typeof`, `instanceof` et les tests de littéraux, c'est l'un des affinements intégrés.",
      "El operador `in` comprueba si un objeto tiene una propiedad (propia o heredada), al ejecutar, y TypeScript estrecha según él. Junto a `typeof`, `instanceof` y las pruebas de literales, es uno de los estrechamientos integrados.",
    ],
  },
  {
    id: "ts-guard-05",
    q: ["In `catch (e)`, what is the type of `e` with `strict`?", "Dans `catch (e)`, quel est le type de `e` avec `strict` ?", "En `catch (e)`, ¿qué tipo tiene `e` con `strict`?"],
    a: ["`unknown`: anything can be thrown; check `e instanceof Error` before reading `e.message`", "`unknown` : on peut lever n'importe quoi ; vérifier `e instanceof Error` avant de lire `e.message`", "`unknown`: se puede lanzar cualquier cosa; comprobar `e instanceof Error` antes de leer `e.message`"],
    w: [["`Error`", "`Error`", "`Error`"], ["`string`", "`string`", "`string`"], ["The type of the error the `try` block can throw", "Le type de l'erreur que le bloc `try` peut lever", "El tipo del error que puede lanzar el bloque `try`"]],
    e: [
      "JavaScript can `throw` a string or an object, and TypeScript does not track what a function throws. `useUnknownInCatchVariables` (in `strict`) makes it `unknown`; before, it was `any`.",
      "JavaScript peut lever (`throw`) une chaîne ou un objet, et TypeScript ne suit pas ce qu'une fonction lève. `useUnknownInCatchVariables` (dans `strict`) en fait un `unknown` ; avant, c'était `any`.",
      "JavaScript puede lanzar (`throw`) una cadena o un objeto, y TypeScript no sigue lo que lanza una función. `useUnknownInCatchVariables` (en `strict`) lo hace `unknown`; antes era `any`.",
    ],
  },
];

const genericsBasics: TsQuestion[] = [
  {
    id: "ts-gen-01",
    q: ["Why `function first<T>(xs: T[]): T | undefined` rather than `(xs: any[]): any`?", "Pourquoi `function first<T>(xs: T[]): T | undefined` plutôt que `(xs: any[]): any` ?", "¿Por qué `function first<T>(xs: T[]): T | undefined` en lugar de `(xs: any[]): any`?"],
    a: ["The result keeps the element type: `first([1, 2])` is `number | undefined`", "Le résultat garde le type des éléments : `first([1, 2])` est `number | undefined`", "El resultado conserva el tipo de los elementos: `first([1, 2])` es `number | undefined`"],
    w: [["It runs faster", "Ça s'exécute plus vite", "Se ejecuta más rápido"], ["`T` checks the type at run time", "`T` vérifie le type à l'exécution", "`T` comprueba el tipo al ejecutar"], ["`any` is not allowed in arrays", "`any` n'est pas permis dans les tableaux", "`any` no se permite en arrays"]],
    e: [
      "A type parameter links input and output types; `T` is inferred at each call. With `any`, the connection and all checks after the call are lost. Generics are erased like other types.",
      "Un paramètre de type relie les types d'entrée et de sortie ; `T` est déduit à chaque appel. Avec `any`, le lien et toutes les vérifications après l'appel sont perdus. Les génériques sont effacés comme les autres types.",
      "Un parámetro de tipo enlaza los tipos de entrada y de salida; `T` se deduce en cada llamada. Con `any`, se pierden el enlace y todas las comprobaciones tras la llamada. Los genéricos se borran como los demás tipos.",
    ],
  },
  {
    id: "ts-gen-02",
    q: ["Why does `function len<T>(x: T) { return x.length; }` fail, and how is it fixed?", "Pourquoi `function len<T>(x: T) { return x.length; }` échoue-t-il, et comment corriger ?", "¿Por qué falla `function len<T>(x: T) { return x.length; }`, y cómo se corrige?"],
    a: ["`T` could be anything; constrain it: `<T extends { length: number }>`", "`T` pourrait être n'importe quoi ; le contraindre : `<T extends { length: number }>`", "`T` podría ser cualquier cosa; restringirlo: `<T extends { length: number }>`"],
    w: [["Generics cannot read properties", "Les génériques ne lisent pas de propriétés", "Los genéricos no pueden leer propiedades"], ["Write `x!.length`", "Écrire `x!.length`", "Escribir `x!.length`"], ["Add `as any` to the return", "Ajouter `as any` au retour", "Añadir `as any` al retorno"]],
    e: [
      "`extends` in a type parameter is a constraint: callers must pass something with a `length`, and the body may use it. Strings, arrays and `{ length: 3 }` all qualify.",
      "`extends` dans un paramètre de type est une contrainte : les appelants doivent passer quelque chose qui a un `length`, et le corps peut s'en servir. Chaînes, tableaux et `{ length: 3 }` conviennent tous.",
      "`extends` en un parámetro de tipo es una restricción: quien llama debe pasar algo con un `length`, y el cuerpo puede usarlo. Cadenas, arrays y `{ length: 3 }` valen todos.",
    ],
  },
  {
    id: "ts-gen-03",
    q: ["What is `keyof User` for `interface User { id: number; name: string }`?", "Qu'est-ce que `keyof User` pour `interface User { id: number; name: string }` ?", "¿Qué es `keyof User` para `interface User { id: number; name: string }`?"],
    a: ["The union of its keys: `\"id\" | \"name\"`", "L'union de ses clés : `\"id\" | \"name\"`", "La unión de sus claves: `\"id\" | \"name\"`"],
    w: [["An array of its keys, at run time", "Un tableau de ses clés, à l'exécution", "Un array de sus claves, al ejecutar"], ["The union of its value types: `number | string`", "L'union des types de ses valeurs : `number | string`", "La unión de los tipos de sus valores: `number | string`"], ["`string`", "`string`", "`string`"]],
    e: [
      "`keyof` works on types; `Object.keys` is the run-time counterpart, typed `string[]` because an object may have more keys than its type says. `User[\"id\"]` (indexed access) gives `number`.",
      "`keyof` agit sur les types ; `Object.keys` est son équivalent à l'exécution, typé `string[]` car un objet peut avoir plus de clés que ne le dit son type. `User[\"id\"]` (accès indexé) donne `number`.",
      "`keyof` actúa sobre los tipos; `Object.keys` es su equivalente al ejecutar, tipado `string[]` porque un objeto puede tener más claves de las que dice su tipo. `User[\"id\"]` (acceso indexado) da `number`.",
    ],
  },
  {
    id: "ts-gen-04",
    q: ["How is `get(obj, key)` typed so that `get(user, \"name\")` is a `string`?", "Comment typer `get(obj, key)` pour que `get(user, \"name\")` soit un `string` ?", "¿Cómo se tipa `get(obj, key)` para que `get(user, \"name\")` sea un `string`?"],
    a: ["`function get<T, K extends keyof T>(obj: T, key: K): T[K]`", "`function get<T, K extends keyof T>(obj: T, key: K): T[K]`", "`function get<T, K extends keyof T>(obj: T, key: K): T[K]`"],
    w: [["`function get(obj: object, key: string): any`", "`function get(obj: object, key: string): any`", "`function get(obj: object, key: string): any`"], ["`function get<T>(obj: T, key: string): T`", "`function get<T>(obj: T, key: string): T`", "`function get<T>(obj: T, key: string): T`"], ["`function get<T>(obj: T, key: keyof T): string`", "`function get<T>(obj: T, key: keyof T): string`", "`function get<T>(obj: T, key: keyof T): string`"]],
    e: [
      "`K extends keyof T` refuses keys `T` does not have, and `T[K]` is the type of that property. With `key: keyof T` alone, the result would be the union of all property types.",
      "`K extends keyof T` refuse les clés que `T` n'a pas, et `T[K]` est le type de cette propriété. Avec seulement `key: keyof T`, le résultat serait l'union des types de toutes les propriétés.",
      "`K extends keyof T` rechaza las claves que `T` no tiene, y `T[K]` es el tipo de esa propiedad. Con solo `key: keyof T`, el resultado sería la unión de los tipos de todas las propiedades.",
    ],
  },
  {
    id: "ts-gen-05",
    q: ["`const ids = new Set();` then `ids.add(1)`: what is `ids`'s type?", "`const ids = new Set();` puis `ids.add(1)` : quel est le type de `ids` ?", "`const ids = new Set();` y luego `ids.add(1)`: ¿qué tipo tiene `ids`?"],
    a: ["`Set<unknown>`: nothing told TypeScript the element type; write `new Set<number>()`", "`Set<unknown>` : rien n'a dit à TypeScript le type des éléments ; écrire `new Set<number>()`", "`Set<unknown>`: nada le dijo a TypeScript el tipo de los elementos; escribir `new Set<number>()`"],
    w: [["`Set<number>`, inferred from `add`", "`Set<number>`, déduit de `add`", "`Set<number>`, deducido de `add`"], ["`Set<any>`", "`Set<any>`", "`Set<any>`"], ["A type error", "Une erreur de type", "Un error de tipo"]],
    e: [
      "Type arguments are inferred from the call itself, not from later use. Pass them explicitly for empty collections: `new Map<string, User>()`, `useState<User | null>(null)`.",
      "Les arguments de type sont déduits de l'appel lui-même, pas de l'usage qui suit. Les donner explicitement pour les collections vides : `new Map<string, User>()`, `useState<User | null>(null)`.",
      "Los argumentos de tipo se deducen de la propia llamada, no del uso posterior. Darlos explícitamente para colecciones vacías: `new Map<string, User>()`, `useState<User | null>(null)`.",
    ],
  },
];

const asyncTopic: TsQuestion[] = [
  {
    id: "ts-async-01",
    q: ["What does an `async function load(): Promise<User>` return when called?", "Que renvoie l'appel d'une `async function load(): Promise<User>` ?", "¿Qué devuelve la llamada a una `async function load(): Promise<User>`?"],
    a: ["A promise at once; the `User` comes later, through `await` or `.then`", "Une promesse, aussitôt ; le `User` arrive plus tard, par `await` ou `.then`", "Una promesa, en el acto; el `User` llega después, mediante `await` o `.then`"],
    w: [["The `User`, once loaded", "Le `User`, une fois chargé", "El `User`, una vez cargado"], ["`undefined` until the data arrives", "`undefined` jusqu'à l'arrivée des données", "`undefined` hasta que llegan los datos"], ["A thread", "Un thread", "Un hilo"]],
    e: [
      "An async function always returns a `Promise`; a `return user` inside resolves it. Forgetting `await` gives a `Promise<User>` where a `User` was meant, which TypeScript usually catches when the value is used.",
      "Une fonction async renvoie toujours une `Promise` ; un `return user` à l'intérieur la résout. Oublier `await` donne une `Promise<User>` là où un `User` était voulu, ce que TypeScript attrape en général à l'usage.",
      "Una función async siempre devuelve una `Promise`; un `return user` dentro la resuelve. Olvidar `await` da una `Promise<User>` donde se quería un `User`, lo que TypeScript suele detectar al usar el valor.",
    ],
  },
  {
    id: "ts-async-02",
    q: ["Three independent requests: how do you wait for all of them at once?", "Trois requêtes indépendantes : comment les attendre toutes à la fois ?", "Tres peticiones independientes: ¿cómo se esperan todas a la vez?"],
    a: ["`const [a, b, c] = await Promise.all([fa(), fb(), fc()]);`", "`const [a, b, c] = await Promise.all([fa(), fb(), fc()]);`", "`const [a, b, c] = await Promise.all([fa(), fb(), fc()]);`"],
    w: [["`await fa(); await fb(); await fc();`", "`await fa(); await fb(); await fc();`", "`await fa(); await fb(); await fc();`"], ["`await [fa(), fb(), fc()];`", "`await [fa(), fb(), fc()];`", "`await [fa(), fb(), fc()];`"], ["`Promise.race([fa(), fb(), fc()])`", "`Promise.race([fa(), fb(), fc()])`", "`Promise.race([fa(), fb(), fc()])`"]],
    e: [
      "Successive `await`s run one after the other. `Promise.all` starts nothing itself (the calls did), it waits for all, typed as a tuple, and rejects at the first failure; `Promise.allSettled` waits for every outcome. Awaiting an array does not wait for its promises.",
      "Des `await` successifs s'exécutent l'un après l'autre. `Promise.all` ne démarre rien lui-même (les appels l'ont fait), il les attend toutes, typées en tuple, et échoue au premier rejet ; `Promise.allSettled` attend toutes les issues. Attendre un tableau n'attend pas ses promesses.",
      "Los `await` sucesivos se ejecutan uno tras otro. `Promise.all` no inicia nada (lo hicieron las llamadas), las espera todas, tipadas como tupla, y falla en el primer rechazo; `Promise.allSettled` espera todos los resultados. Esperar un array no espera sus promesas.",
    ],
  },
  {
    id: "ts-async-03",
    q: ["`save(user);` without `await`, inside an async function: what is the risk?", "`save(user);` sans `await`, dans une fonction async : quel est le risque ?", "`save(user);` sin `await`, dentro de una función async: ¿cuál es el riesgo?"],
    a: ["A floating promise: the function goes on before the save is done, and a failure is never handled", "Une promesse flottante : la fonction continue avant la fin de l'enregistrement, et un échec n'est jamais traité", "Una promesa flotante: la función sigue antes de que termine el guardado, y un fallo nunca se trata"],
    w: [["None: promises run synchronously", "Aucun : les promesses s'exécutent de façon synchrone", "Ninguno: las promesas se ejecutan de forma síncrona"], ["A compile error", "Une erreur de compilation", "Un error de compilación"], ["The save is cancelled", "L'enregistrement est annulé", "El guardado se cancela"]],
    e: [
      "TypeScript does not flag it; the `no-floating-promises` lint of typescript-eslint does. An unhandled rejection crashes a Node process by default. When fire-and-forget is meant, write `void save(user).catch(log)`.",
      "TypeScript ne le signale pas ; la règle `no-floating-promises` de typescript-eslint, si. Un rejet non traité arrête un processus Node par défaut. Quand on veut vraiment lancer sans attendre, écrire `void save(user).catch(log)`.",
      "TypeScript no lo señala; la regla `no-floating-promises` de typescript-eslint, sí. Un rechazo sin tratar detiene un proceso Node por defecto. Cuando de verdad se quiere lanzar sin esperar, escribir `void save(user).catch(log)`.",
    ],
  },
  {
    id: "ts-async-04",
    q: ["How are errors of an awaited promise handled?", "Comment traite-t-on les erreurs d'une promesse attendue ?", "¿Cómo se tratan los errores de una promesa esperada?"],
    a: ["With `try { await p } catch (e) { … }`: a rejection becomes a thrown error at the `await`", "Avec `try { await p } catch (e) { … }` : un rejet devient une erreur levée au niveau du `await`", "Con `try { await p } catch (e) { … }`: un rechazo se convierte en un error lanzado en el `await`"],
    w: [["They cannot be caught", "Elles ne peuvent pas être attrapées", "No se pueden capturar"], ["`await` returns `null` on error", "`await` renvoie `null` en cas d'erreur", "`await` devuelve `null` si hay error"], ["Only with `.catch`, never with `try`", "Seulement avec `.catch`, jamais avec `try`", "Solo con `.catch`, nunca con `try`"]],
    e: [
      "`await` turns promise rejection into ordinary exception flow. `try` around a call without `await` catches nothing: the error happens later. `finally` runs either way.",
      "`await` transforme un rejet de promesse en exception ordinaire. Un `try` autour d'un appel sans `await` n'attrape rien : l'erreur arrive plus tard. `finally` s'exécute dans tous les cas.",
      "`await` convierte un rechazo de promesa en una excepción corriente. Un `try` alrededor de una llamada sin `await` no captura nada: el error llega más tarde. `finally` se ejecuta en todos los casos.",
    ],
  },
  {
    id: "ts-async-05",
    q: ["What does `Awaited<ReturnType<typeof load>>` give for `async function load(): Promise<User>`?", "Que donne `Awaited<ReturnType<typeof load>>` pour `async function load(): Promise<User>` ?", "¿Qué da `Awaited<ReturnType<typeof load>>` para `async function load(): Promise<User>`?"],
    a: ["`User`: the return type, without the `Promise`", "`User` : le type de retour, sans la `Promise`", "`User`: el tipo de retorno, sin la `Promise`"],
    w: [["`Promise<User>`", "`Promise<User>`", "`Promise<User>`"], ["`typeof load`", "`typeof load`", "`typeof load`"], ["`unknown`", "`unknown`", "`unknown`"]],
    e: [
      "`typeof` takes a value's type, `ReturnType` a function type's result, `Awaited` unwraps promises (recursively). Deriving types this way keeps them in step with the code.",
      "`typeof` prend le type d'une valeur, `ReturnType` le résultat d'un type de fonction, `Awaited` retire les promesses (récursivement). Dériver les types ainsi les garde en accord avec le code.",
      "`typeof` toma el tipo de un valor, `ReturnType` el resultado de un tipo de función, `Awaited` quita las promesas (recursivamente). Derivar los tipos así los mantiene de acuerdo con el código.",
    ],
  },
];

const modules: TsQuestion[] = [
  {
    id: "ts-mod-01",
    q: ["What is `import type { User } from \"./user\";` for?", "À quoi sert `import type { User } from \"./user\";` ?", "¿Para qué sirve `import type { User } from \"./user\";`?"],
    a: ["Importing only a type: the line is removed from the JavaScript, and nothing is loaded at run time", "Importer seulement un type : la ligne est retirée du JavaScript, et rien n'est chargé à l'exécution", "Importar solo un tipo: la línea se quita del JavaScript, y nada se carga al ejecutar"],
    w: [["Importing a value faster", "Importer une valeur plus vite", "Importar un valor más rápido"], ["Checking the module's types at run time", "Vérifier les types du module à l'exécution", "Comprobar los tipos del módulo al ejecutar"], ["Nothing: it is the same as `import`", "Rien : c'est pareil qu'`import`", "Nada: es lo mismo que `import`"]],
    e: [
      "Tools that strip types file by file cannot know whether `User` is a type. `import type` (and `verbatimModuleSyntax`, which requires it) makes the intent explicit, and avoids loading modules for their types alone.",
      "Les outils qui retirent les types fichier par fichier ne peuvent pas savoir si `User` est un type. `import type` (et `verbatimModuleSyntax`, qui l'exige) rend l'intention explicite, et évite de charger des modules pour leurs seuls types.",
      "Las herramientas que quitan los tipos archivo por archivo no pueden saber si `User` es un tipo. `import type` (y `verbatimModuleSyntax`, que lo exige) hace explícita la intención, y evita cargar módulos solo por sus tipos.",
    ],
  },
  {
    id: "ts-mod-02",
    q: ["ES modules or CommonJS: which syntax is which?", "Modules ES ou CommonJS : quelle syntaxe est laquelle ?", "Módulos ES o CommonJS: ¿qué sintaxis es cuál?"],
    a: ["ESM: `import` and `export`; CommonJS: `require()` and `module.exports`, Node's original system", "ESM : `import` et `export` ; CommonJS : `require()` et `module.exports`, le système d'origine de Node", "ESM: `import` y `export`; CommonJS: `require()` y `module.exports`, el sistema original de Node"],
    w: [["They are the same thing", "C'est la même chose", "Son lo mismo"], ["ESM is for browsers only", "ESM est réservé aux navigateurs", "ESM es solo para navegadores"], ["CommonJS is TypeScript's own system", "CommonJS est le système propre à TypeScript", "CommonJS es el sistema propio de TypeScript"]],
    e: [
      "ES modules are the standard, loaded asynchronously, with top-level `await`. In Node, `\"type\": \"module\"` in `package.json` makes `.js` files ESM; `.mjs` and `.cjs` force one or the other. TypeScript's `module: \"nodenext\"` follows the same rules.",
      "Les modules ES sont la norme, chargés de façon asynchrone, avec `await` au premier niveau. Dans Node, `\"type\": \"module\"` dans `package.json` fait des `.js` des modules ES ; `.mjs` et `.cjs` imposent l'un ou l'autre. Le `module: \"nodenext\"` de TypeScript suit les mêmes règles.",
      "Los módulos ES son el estándar, se cargan de forma asíncrona, con `await` en el nivel superior. En Node, `\"type\": \"module\"` en `package.json` hace de los `.js` módulos ES; `.mjs` y `.cjs` imponen uno u otro. El `module: \"nodenext\"` de TypeScript sigue las mismas reglas.",
    ],
  },
  {
    id: "ts-mod-03",
    q: ["Under `module: \"nodenext\"`, why must a relative import end in `.js` even though the file is `user.ts`?", "Avec `module: \"nodenext\"`, pourquoi un import relatif doit-il finir par `.js` alors que le fichier est `user.ts` ?", "Con `module: \"nodenext\"`, ¿por qué un import relativo debe acabar en `.js` aunque el archivo sea `user.ts`?"],
    a: ["Node's ES modules need the exact file name, and the import must name the file that will exist at run time", "Les modules ES de Node veulent le nom de fichier exact, et l'import doit nommer le fichier qui existera à l'exécution", "Los módulos ES de Node necesitan el nombre de archivo exacto, y el import debe nombrar el archivo que existirá al ejecutar"],
    w: [["It is a TypeScript bug", "C'est un bug de TypeScript", "Es un fallo de TypeScript"], ["`.js` files load faster", "Les fichiers `.js` se chargent plus vite", "Los archivos `.js` cargan más rápido"], ["Imports may never name `.ts` files", "Les imports ne peuvent jamais nommer de fichiers `.ts`", "Los imports nunca pueden nombrar archivos `.ts`"]],
    e: [
      "TypeScript does not rewrite import paths (by design), so `./user.js` is what Node will load after compiling. With a bundler, `moduleResolution: \"bundler\"` allows extensionless imports; with Node's type stripping, `./user.ts` is imported directly (`allowImportingTsExtensions`, or `rewriteRelativeImportExtensions`).",
      "TypeScript ne réécrit pas les chemins d'import (c'est voulu) : `./user.js` est ce que Node chargera après compilation. Avec un bundler, `moduleResolution: \"bundler\"` permet des imports sans extension ; avec le retrait des types de Node, on importe directement `./user.ts` (`allowImportingTsExtensions`, ou `rewriteRelativeImportExtensions`).",
      "TypeScript no reescribe las rutas de import (a propósito): `./user.js` es lo que cargará Node tras compilar. Con un empaquetador, `moduleResolution: \"bundler\"` permite imports sin extensión; con la eliminación de tipos de Node, se importa directamente `./user.ts` (`allowImportingTsExtensions`, o `rewriteRelativeImportExtensions`).",
    ],
  },
  {
    id: "ts-mod-04",
    q: ["What does a `.d.ts` file contain?", "Que contient un fichier `.d.ts` ?", "¿Qué contiene un archivo `.d.ts`?"],
    a: ["Only declarations: the types of a module's exports, no code", "Seulement des déclarations : les types des exports d'un module, sans code", "Solo declaraciones: los tipos de lo que exporta un módulo, sin código"],
    w: [["Compiled JavaScript", "Du JavaScript compilé", "JavaScript compilado"], ["Tests", "Des tests", "Pruebas"], ["The project's settings", "Les réglages du projet", "Los ajustes del proyecto"]],
    e: [
      "`declaration: true` makes `tsc` write them next to the JavaScript of a library, so its users get types. Hand-written ones describe JavaScript code, or extend globals with `declare global`.",
      "`declaration: true` fait écrire à `tsc` ces fichiers à côté du JavaScript d'une bibliothèque, pour que ses utilisateurs aient les types. Ceux écrits à la main décrivent du code JavaScript, ou étendent les globales avec `declare global`.",
      "`declaration: true` hace que `tsc` los escriba junto al JavaScript de una biblioteca, para que sus usuarios tengan los tipos. Los escritos a mano describen código JavaScript, o amplían los globales con `declare global`.",
    ],
  },
  {
    id: "ts-mod-05",
    q: ["Default export or named exports?", "Export par défaut ou exports nommés ?", "¿Exportación por defecto o exportaciones con nombre?"],
    a: ["Named exports are usually preferred: one name everywhere, better refactoring and autocompletion", "On préfère en général les exports nommés : un seul nom partout, meilleurs renommages et complétion", "Se suelen preferir las exportaciones con nombre: un solo nombre en todas partes, mejores refactorizaciones y autocompletado"],
    w: [["Default exports are required by TypeScript", "TypeScript exige des exports par défaut", "TypeScript exige exportaciones por defecto"], ["Named exports cannot export functions", "Les exports nommés ne peuvent pas exporter de fonctions", "Las exportaciones con nombre no pueden exportar funciones"], ["A module may have only one export", "Un module ne peut avoir qu'un export", "Un módulo solo puede tener una exportación"]],
    e: [
      "A default export is renamed freely by each importer (`import Foo from …`), so the same thing goes by several names. Some frameworks require defaults (route components, config files); otherwise named exports keep code searchable.",
      "Un export par défaut est renommé librement par chaque importateur (`import Foo from …`) : la même chose porte plusieurs noms. Certains frameworks exigent des exports par défaut (composants de route, fichiers de config) ; sinon les exports nommés gardent le code facile à chercher.",
      "Una exportación por defecto la renombra libremente cada importador (`import Foo from …`): lo mismo lleva varios nombres. Algunos frameworks exigen exportaciones por defecto (componentes de ruta, archivos de configuración); si no, las exportaciones con nombre mantienen el código fácil de buscar.",
    ],
  },
];

export const basics = { literals };
export const functionsTopic = { signatures };
export const objects = { classes };
export const narrowing = { guards };
export const generics = { genericsBasics };
export const runtime = { async: asyncTopic };
export const tooling = { modules };
