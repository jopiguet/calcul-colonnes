/**
 * TypeScript, Expert: class semantics and decorators, advanced type-level
 * tools, where the type system is unsound, the JavaScript engine, and the
 * current tooling (TypeScript 7's native compiler, Node's type stripping).
 */
import type { LinuxQuestion as TsQuestion } from "../linux/types";

const classSemantics: TsQuestion[] = [
  {
    id: "ts-cls-01",
    q: ["What does `useDefineForClassFields` (on by default for targets from ES2022) change?", "Que change `useDefineForClassFields` (actif par défaut pour les cibles à partir d'ES2022) ?", "¿Qué cambia `useDefineForClassFields` (activo por defecto para destinos desde ES2022)?"],
    a: ["Class fields are defined with JavaScript's own semantics (`Object.defineProperty`), so a field redeclared in a subclass hides an accessor of the base", "Les champs de classe sont définis avec la sémantique de JavaScript (`Object.defineProperty`) : un champ redéclaré dans une sous-classe masque un accesseur de la classe de base", "Los campos de clase se definen con la semántica propia de JavaScript (`Object.defineProperty`): un campo redeclarado en una subclase oculta un accesor de la clase base"],
    w: [["Fields become `readonly`", "Les champs deviennent `readonly`", "Los campos pasan a ser `readonly`"], ["Fields are set before the base constructor runs", "Les champs sont initialisés avant le constructeur de la classe de base", "Los campos se asignan antes del constructor de la clase base"], ["Nothing at run time", "Rien à l'exécution", "Nada al ejecutar"]],
    e: [
      "The old emit assigned fields (`this.x = …`), which calls setters; the standard defines them. Either way, fields are set after `super()` returns. A field only redeclared for its type should be written `declare x: T;`, which emits nothing.",
      "L'ancienne émission affectait les champs (`this.x = …`), ce qui appelle les mutateurs ; la norme les définit. Dans les deux cas, les champs sont initialisés après le retour de `super()`. Un champ redéclaré seulement pour son type s'écrit `declare x: T;`, qui ne produit rien.",
      "La emisión antigua asignaba los campos (`this.x = …`), lo que llama a los setters; el estándar los define. En ambos casos, los campos se asignan tras volver de `super()`. Un campo redeclarado solo por su tipo se escribe `declare x: T;`, que no genera nada.",
    ],
  },
  {
    id: "ts-cls-02",
    q: ["Standard decorators (TypeScript 5.0) or `experimentalDecorators`: what differs?", "Décorateurs standard (TypeScript 5.0) ou `experimentalDecorators` : qu'est-ce qui diffère ?", "Decoradores estándar (TypeScript 5.0) o `experimentalDecorators`: ¿qué difiere?"],
    a: ["The standard ones follow the TC39 proposal, with a context argument and no parameter decorators or metadata emit; the older ones are what Angular and NestJS were built on", "Les standard suivent la proposition TC39, avec un argument de contexte, sans décorateurs de paramètres ni émission de métadonnées ; les anciens sont ceux sur lesquels Angular et NestJS ont été construits", "Los estándar siguen la propuesta TC39, con un argumento de contexto y sin decoradores de parámetros ni emisión de metadatos; los antiguos son sobre los que se construyeron Angular y NestJS"],
    w: [["Nothing: they are the same", "Rien : ce sont les mêmes", "Nada: son los mismos"], ["Standard decorators only work on functions", "Les décorateurs standard ne marchent que sur les fonctions", "Los decoradores estándar solo funcionan en funciones"], ["`experimentalDecorators` runs at compile time only", "`experimentalDecorators` ne s'exécute qu'à la compilation", "`experimentalDecorators` solo se ejecuta al compilar"]],
    e: [
      "The two have incompatible signatures, so a decorator library targets one. Both run at run time, when the class is defined. `emitDecoratorMetadata` exists only for the experimental kind.",
      "Les deux ont des signatures incompatibles : une bibliothèque de décorateurs vise l'un des deux. Tous deux s'exécutent à l'exécution, quand la classe est définie. `emitDecoratorMetadata` n'existe que pour le genre expérimental.",
      "Los dos tienen firmas incompatibles, así que una biblioteca de decoradores se dirige a uno. Ambos se ejecutan al ejecutar, cuando se define la clase. `emitDecoratorMetadata` solo existe para el tipo experimental.",
    ],
  },
  {
    id: "ts-cls-03",
    q: ["What does `using conn = await db.connect();` do (TypeScript 5.2)?", "Que fait `using conn = await db.connect();` (TypeScript 5.2) ?", "¿Qué hace `using conn = await db.connect();` (TypeScript 5.2)?"],
    a: ["Disposes `conn` (`[Symbol.dispose]()`) automatically when the block ends, even on an exception", "Libère `conn` (`[Symbol.dispose]()`) automatiquement à la fin du bloc, même en cas d'exception", "Libera `conn` (`[Symbol.dispose]()`) automáticamente al terminar el bloque, incluso ante una excepción"],
    w: [["Makes `conn` readonly", "Rend `conn` en lecture seule", "Hace `conn` de solo lectura"], ["Imports `conn` from a module", "Importe `conn` d'un module", "Importa `conn` de un módulo"], ["Shares `conn` between threads", "Partage `conn` entre threads", "Comparte `conn` entre hilos"]],
    e: [
      "Explicit resource management, like `try … finally` written once in the type: resources are disposed in reverse order. `await using` calls `[Symbol.asyncDispose]`. It needs a runtime with `Symbol.dispose`, or a polyfill.",
      "La gestion explicite des ressources, comme un `try … finally` écrit une fois dans le type : les ressources sont libérées dans l'ordre inverse. `await using` appelle `[Symbol.asyncDispose]`. Il faut un environnement qui a `Symbol.dispose`, ou un polyfill.",
      "La gestión explícita de recursos, como un `try … finally` escrito una vez en el tipo: los recursos se liberan en orden inverso. `await using` llama a `[Symbol.asyncDispose]`. Hace falta un entorno con `Symbol.dispose`, o un polyfill.",
    ],
  },
  {
    id: "ts-cls-04",
    q: ["What does `accessor` in `class C { accessor size = 1; }` declare?", "Que déclare `accessor` dans `class C { accessor size = 1; }` ?", "¿Qué declara `accessor` en `class C { accessor size = 1; }`?"],
    a: ["A getter and setter pair backed by a private field, which decorators can intercept", "Une paire d'accesseurs adossée à un champ privé, que les décorateurs peuvent intercepter", "Un par de getter y setter respaldado por un campo privado, que los decoradores pueden interceptar"],
    w: [["A read-only field", "Un champ en lecture seule", "Un campo de solo lectura"], ["A static field", "Un champ statique", "Un campo estático"], ["A field visible only to subclasses", "Un champ visible seulement des sous-classes", "Un campo visible solo para las subclases"]],
    e: [
      "Auto-accessors (TypeScript 4.9, part of the decorators proposal) let a decorator wrap property access, for example for reactivity or validation, which a plain field does not allow.",
      "Les auto-accesseurs (TypeScript 4.9, partie de la proposition des décorateurs) permettent à un décorateur d'envelopper l'accès à la propriété, par exemple pour la réactivité ou la validation, ce qu'un champ simple ne permet pas.",
      "Los autoaccesores (TypeScript 4.9, parte de la propuesta de decoradores) permiten a un decorador envolver el acceso a la propiedad, por ejemplo para reactividad o validación, lo que un campo simple no permite.",
    ],
  },
  {
    id: "ts-cls-05",
    q: ["`override` on a method: what does `noImplicitOverride` add?", "`override` sur une méthode : qu'ajoute `noImplicitOverride` ?", "`override` en un método: ¿qué añade `noImplicitOverride`?"],
    a: ["It requires `override` on every method that replaces a base method, and flags `override` where nothing is replaced", "Il exige `override` sur chaque méthode qui remplace une méthode de base, et signale un `override` qui ne remplace rien", "Exige `override` en cada método que sustituye a uno de la base, y señala un `override` que no sustituye nada"],
    w: [["It forbids overriding methods", "Il interdit de redéfinir des méthodes", "Prohíbe redefinir métodos"], ["It calls the base method automatically", "Il appelle automatiquement la méthode de base", "Llama automáticamente al método base"], ["It makes methods final", "Il rend les méthodes finales", "Hace finales los métodos"]],
    e: [
      "A base method renamed or removed would otherwise leave subclass methods that silently no longer override anything. `override` is erased; TypeScript has no `final`.",
      "Sinon, une méthode de base renommée ou supprimée laisserait des méthodes de sous-classes qui, en silence, ne redéfinissent plus rien. `override` est effacé ; TypeScript n'a pas de `final`.",
      "Si no, un método base renombrado o eliminado dejaría métodos de subclases que, en silencio, ya no redefinen nada. `override` se borra; TypeScript no tiene `final`.",
    ],
  },
];

const advancedTypes: TsQuestion[] = [
  {
    id: "ts-adv-01",
    q: ["What does a `const` type parameter do: `function routes<const T>(r: T): T`?", "Que fait un paramètre de type `const` : `function routes<const T>(r: T): T` ?", "¿Qué hace un parámetro de tipo `const`: `function routes<const T>(r: T): T`?"],
    a: ["Infers `T` as if the argument were written `as const`: literal types and readonly tuples", "Déduit `T` comme si l'argument était écrit `as const` : types littéraux et tuples en lecture seule", "Deduce `T` como si el argumento se escribiera `as const`: tipos literales y tuplas de solo lectura"],
    w: [["Makes `T` immutable at run time", "Rend `T` immuable à l'exécution", "Hace `T` inmutable al ejecutar"], ["Forbids reassigning `r`", "Interdit de réaffecter `r`", "Prohíbe reasignar `r`"], ["Requires a constant argument", "Exige un argument constant", "Exige un argumento constante"]],
    e: [
      "Since TypeScript 5.0, callers no longer need to write `as const` to keep `[\"/home\", \"/about\"]` as a tuple of literals. It only changes inference; nothing is frozen.",
      "Depuis TypeScript 5.0, les appelants n'ont plus à écrire `as const` pour garder `[\"/home\", \"/about\"]` comme un tuple de littéraux. Cela ne change que la déduction ; rien n'est gelé.",
      "Desde TypeScript 5.0, quien llama ya no tiene que escribir `as const` para conservar `[\"/home\", \"/about\"]` como tupla de literales. Solo cambia la deducción; nada se congela.",
    ],
  },
  {
    id: "ts-adv-02",
    q: ["What does `NoInfer<T>` do in `function pick<T>(all: T[], fallback: NoInfer<T>)`?", "Que fait `NoInfer<T>` dans `function pick<T>(all: T[], fallback: NoInfer<T>)` ?", "¿Qué hace `NoInfer<T>` en `function pick<T>(all: T[], fallback: NoInfer<T>)`?"],
    a: ["Stops `fallback` from taking part in inferring `T`: `T` comes from `all`, and `fallback` is checked against it", "Empêche `fallback` de participer à la déduction de `T` : `T` vient de `all`, et `fallback` est vérifié face à lui", "Impide que `fallback` participe en la deducción de `T`: `T` viene de `all`, y `fallback` se comprueba contra él"],
    w: [["Makes `fallback` optional", "Rend `fallback` optionnel", "Hace opcional `fallback`"], ["Turns off checking for `fallback`", "Coupe la vérification de `fallback`", "Desactiva la comprobación de `fallback`"], ["Makes `T` `unknown`", "Fait de `T` un `unknown`", "Hace `T` `unknown`"]],
    e: [
      "Without it, `pick([\"a\", \"b\"], \"z\")` would infer `T` as `\"a\" | \"b\" | \"z\"` and accept the typo. `NoInfer` (TypeScript 5.4) blocks inference from that position only.",
      "Sans lui, `pick([\"a\", \"b\"], \"z\")` déduirait `T` comme `\"a\" | \"b\" | \"z\"` et accepterait la faute. `NoInfer` (TypeScript 5.4) bloque la déduction depuis cette position seulement.",
      "Sin él, `pick([\"a\", \"b\"], \"z\")` deduciría `T` como `\"a\" | \"b\" | \"z\"` y aceptaría la errata. `NoInfer` (TypeScript 5.4) bloquea la deducción solo desde esa posición.",
    ],
  },
  {
    id: "ts-adv-03",
    q: ["What are `in` and `out` in `interface Producer<out T>` (TypeScript 4.7)?", "Que sont `in` et `out` dans `interface Producer<out T>` (TypeScript 4.7) ?", "¿Qué son `in` y `out` en `interface Producer<out T>` (TypeScript 4.7)?"],
    a: ["Variance annotations: `out` says `T` is only produced (covariant), `in` only consumed (contravariant); the compiler checks and uses them", "Des annotations de variance : `out` dit que `T` est seulement produit (covariant), `in` seulement consommé (contravariant) ; le compilateur les vérifie et s'en sert", "Anotaciones de varianza: `out` dice que `T` solo se produce (covariante), `in` solo se consume (contravariante); el compilador las comprueba y las usa"],
    w: [["Input and output parameters of functions", "Les paramètres d'entrée et de sortie des fonctions", "Los parámetros de entrada y salida de las funciones"], ["Run-time direction of data", "Le sens des données à l'exécution", "El sentido de los datos al ejecutar"], ["Import and export markers", "Des marqueurs d'import et d'export", "Marcadores de import y export"]],
    e: [
      "TypeScript normally measures variance by comparing structures, which is slow for big recursive types. Annotations document intent, speed up checking, and catch a use of `T` that contradicts them.",
      "TypeScript mesure normalement la variance en comparant les structures, ce qui est lent pour de grands types récursifs. Les annotations documentent l'intention, accélèrent la vérification, et attrapent un usage de `T` qui les contredit.",
      "TypeScript normalmente mide la varianza comparando estructuras, lo que es lento con tipos recursivos grandes. Las anotaciones documentan la intención, aceleran la comprobación, y detectan un uso de `T` que las contradice.",
    ],
  },
  {
    id: "ts-adv-04",
    q: ["How do you make a `UserId` that is a `string` at run time but not interchangeable with other strings?", "Comment faire un `UserId` qui est un `string` à l'exécution mais pas interchangeable avec d'autres chaînes ?", "¿Cómo se hace un `UserId` que es un `string` al ejecutar pero no intercambiable con otras cadenas?"],
    a: ["A branded type: `type UserId = string & { readonly __brand: \"UserId\" }`, made only by a function that validates", "Un type marqué : `type UserId = string & { readonly __brand: \"UserId\" }`, créé seulement par une fonction qui valide", "Un tipo marcado: `type UserId = string & { readonly __brand: \"UserId\" }`, creado solo por una función que valida"],
    w: [["`type UserId = string`", "`type UserId = string`", "`type UserId = string`"], ["`class UserId extends String`", "`class UserId extends String`", "`class UserId extends String`"], ["`enum UserId`", "`enum UserId`", "`enum UserId`"]],
    e: [
      "A type alias is only a new name; structural typing makes it the same type. The brand property never exists at run time; it only makes plain strings fail to type-check until they go through the constructor function, which casts once.",
      "Un alias de type n'est qu'un nouveau nom ; le typage structurel en fait le même type. La propriété de marque n'existe jamais à l'exécution ; elle fait seulement échouer les chaînes ordinaires tant qu'elles ne passent pas par la fonction de création, qui convertit une fois.",
      "Un alias de tipo es solo un nombre nuevo; el tipado estructural lo hace el mismo tipo. La propiedad de marca nunca existe al ejecutar; solo hace que las cadenas normales no pasen la comprobación hasta que pasen por la función de creación, que convierte una vez.",
    ],
  },
  {
    id: "ts-adv-05",
    q: ["\"Type instantiation is excessively deep and possibly infinite.\" What usually causes it?", "« Type instantiation is excessively deep and possibly infinite. » Qu'est-ce qui le provoque, d'habitude ?", "«Type instantiation is excessively deep and possibly infinite.» ¿Qué suele provocarlo?"],
    a: ["A recursive type (conditional or mapped) that recurses too deep for the checker's limits", "Un type récursif (conditionnel ou mappé) qui descend trop profond pour les limites du vérificateur", "Un tipo recursivo (condicional o mapeado) que baja demasiado para los límites del comprobador"],
    w: [["A loop at run time", "Une boucle à l'exécution", "Un bucle al ejecutar"], ["Too many files in the project", "Trop de fichiers dans le projet", "Demasiados archivos en el proyecto"], ["A missing `tsconfig.json`", "Un `tsconfig.json` manquant", "Un `tsconfig.json` que falta"]],
    e: [
      "The checker caps recursion (around 50 levels, 1000 for tail-recursive conditional types). Bounding the depth with a counter tuple, making recursion tail-recursive, or simplifying the type are the usual fixes.",
      "Le vérificateur limite la récursion (autour de 50 niveaux, 1000 pour les types conditionnels récursifs terminaux). Borner la profondeur avec un tuple compteur, rendre la récursion terminale, ou simplifier le type sont les corrections habituelles.",
      "El comprobador limita la recursión (unos 50 niveles, 1000 para los tipos condicionales con recursión de cola). Acotar la profundidad con una tupla contador, hacer la recursión de cola, o simplificar el tipo son las correcciones habituales.",
    ],
  },
];

const soundness: TsQuestion[] = [
  {
    id: "ts-sound-01",
    q: ["`const dogs: Dog[] = []; const animals: Animal[] = dogs; animals.push(new Cat());` Does it compile?", "`const dogs: Dog[] = []; const animals: Animal[] = dogs; animals.push(new Cat());` Cela compile-t-il ?", "`const dogs: Dog[] = []; const animals: Animal[] = dogs; animals.push(new Cat());` ¿Compila?"],
    a: ["Yes, and `dogs` now holds a cat: arrays are treated as covariant, which is unsound", "Oui, et `dogs` contient maintenant un chat : les tableaux sont traités comme covariants, ce qui n'est pas sûr", "Sí, y `dogs` contiene ahora un gato: los arrays se tratan como covariantes, lo que no es seguro"],
    w: [["No: `Dog[]` is not assignable to `Animal[]`", "Non : `Dog[]` n'est pas assignable à `Animal[]`", "No: `Dog[]` no es asignable a `Animal[]`"], ["No: `push` is refused on `animals`", "Non : `push` est refusé sur `animals`", "No: `push` se rechaza en `animals`"], ["Yes, and the cat is turned into a dog", "Oui, et le chat est transformé en chien", "Sí, y el gato se convierte en perro"]],
    e: [
      "TypeScript chose convenience over soundness here: mutable arrays should be invariant. Taking `readonly Animal[]` as a parameter is safe, since it cannot be written to.",
      "TypeScript a choisi la commodité plutôt que la sûreté ici : les tableaux modifiables devraient être invariants. Prendre un `readonly Animal[]` en paramètre est sûr, puisqu'on ne peut pas y écrire.",
      "TypeScript eligió la comodidad sobre la seguridad aquí: los arrays mutables deberían ser invariantes. Tomar un `readonly Animal[]` como parámetro es seguro, ya que no se puede escribir en él.",
    ],
  },
  {
    id: "ts-sound-02",
    q: ["Why is `interface Handler { handle(e: Event): void }` less strictly checked than `{ handle: (e: Event) => void }`?", "Pourquoi `interface Handler { handle(e: Event): void }` est-il vérifié moins strictement que `{ handle: (e: Event) => void }` ?", "¿Por qué `interface Handler { handle(e: Event): void }` se comprueba de forma menos estricta que `{ handle: (e: Event) => void }`?"],
    a: ["Method syntax keeps parameters bivariant, even under `strictFunctionTypes`; property syntax gets contravariant checks", "La syntaxe de méthode garde des paramètres bivariants, même avec `strictFunctionTypes` ; la syntaxe de propriété reçoit les vérifications contravariantes", "La sintaxis de método mantiene los parámetros bivariantes, incluso con `strictFunctionTypes`; la sintaxis de propiedad recibe las comprobaciones contravariantes"],
    w: [["They are checked the same way", "Elles sont vérifiées de la même façon", "Se comprueban igual"], ["Methods are not type-checked at all", "Les méthodes ne sont pas vérifiées du tout", "Los métodos no se comprueban en absoluto"], ["Property syntax is less strict", "La syntaxe de propriété est moins stricte", "La sintaxis de propiedad es menos estricta"]],
    e: [
      "Bivariant methods kept the DOM and arrays usable (`Array<Dog>` as `Array<Animal>`) when strict function types arrived. A handler of `MouseEvent` then fits a method expecting any `Event`. Lint rules can require property syntax.",
      "Les méthodes bivariantes ont gardé le DOM et les tableaux utilisables (`Array<Dog>` comme `Array<Animal>`) à l'arrivée des types de fonctions stricts. Un gestionnaire de `MouseEvent` convient alors à une méthode qui attend n'importe quel `Event`. Des règles de lint peuvent exiger la syntaxe de propriété.",
      "Los métodos bivariantes mantuvieron utilizables el DOM y los arrays (`Array<Dog>` como `Array<Animal>`) al llegar los tipos de función estrictos. Un manejador de `MouseEvent` encaja entonces en un método que espera cualquier `Event`. Hay reglas de lint que pueden exigir la sintaxis de propiedad.",
    ],
  },
  {
    id: "ts-sound-03",
    q: ["A value typed `any` is assigned to a `number` variable, then `.toFixed()` is called. Where can it fail?", "Une valeur typée `any` est affectée à une variable `number`, puis on appelle `.toFixed()`. Où cela peut-il échouer ?", "Un valor tipado `any` se asigna a una variable `number`, y luego se llama a `.toFixed()`. ¿Dónde puede fallar?"],
    a: ["At run time, far from the source: `any` passes silently into typed code", "À l'exécution, loin de la source : `any` passe en silence dans du code typé", "Al ejecutar, lejos del origen: `any` entra en silencio en código tipado"],
    w: [["At compile time, at the assignment", "À la compilation, à l'affectation", "Al compilar, en la asignación"], ["Nowhere: `number` is checked at run time", "Nulle part : `number` est vérifié à l'exécution", "En ningún sitio: `number` se comprueba al ejecutar"], ["Only in strict mode", "Seulement en mode strict", "Solo en modo strict"]],
    e: [
      "`any` is assignable to everything, so one untyped value (a `JSON.parse`, an untyped library) spreads through correct-looking code. `unknown` at the boundary, plus the `no-unsafe-*` lint rules, keep it contained.",
      "`any` est assignable à tout : une seule valeur non typée (un `JSON.parse`, une bibliothèque sans types) se répand dans du code qui paraît correct. `unknown` à la frontière, plus les règles de lint `no-unsafe-*`, la contiennent.",
      "`any` es asignable a todo, así que un solo valor sin tipo (un `JSON.parse`, una biblioteca sin tipos) se extiende por código de aspecto correcto. `unknown` en la frontera, más las reglas de lint `no-unsafe-*`, lo contienen.",
    ],
  },
  {
    id: "ts-sound-04",
    q: ["Is TypeScript's type system sound, that is: does a program that type-checks never have a type error at run time?", "Le système de types de TypeScript est-il sûr, c'est-à-dire : un programme qui passe la vérification n'a-t-il jamais d'erreur de type à l'exécution ?", "¿Es seguro el sistema de tipos de TypeScript, es decir: un programa que pasa la comprobación nunca tiene un error de tipo al ejecutar?"],
    a: ["No, by design: assertions, `any`, array covariance, method bivariance and unchecked indexing are deliberate holes", "Non, c'est voulu : assertions, `any`, covariance des tableaux, bivariance des méthodes et indexation non vérifiée sont des trous délibérés", "No, a propósito: aserciones, `any`, covarianza de arrays, bivarianza de métodos e indexación sin comprobar son huecos deliberados"],
    w: [["Yes, with `strict`", "Oui, avec `strict`", "Sí, con `strict`"], ["Yes, always", "Oui, toujours", "Sí, siempre"], ["Only for code without classes", "Seulement pour du code sans classes", "Solo para código sin clases"]],
    e: [
      "Soundness was explicitly not a goal: TypeScript aims at catching likely bugs while typing existing JavaScript patterns. Knowing where the holes are is what lets you avoid them.",
      "La sûreté n'a explicitement pas été un objectif : TypeScript vise à attraper les bugs probables tout en typant les façons d'écrire du JavaScript existant. Savoir où sont les trous permet de les éviter.",
      "La seguridad no fue un objetivo de forma explícita: TypeScript busca detectar fallos probables tipando a la vez los patrones de JavaScript existentes. Saber dónde están los huecos es lo que permite evitarlos.",
    ],
  },
  {
    id: "ts-sound-05",
    q: ["`function f(x: string | number) { if (typeof x === \"string\") x = 42; return x.toFixed(); }` What does the checker think `x` is at `return`?", "`function f(x: string | number) { if (typeof x === \"string\") x = 42; return x.toFixed(); }` Que pense le vérificateur de `x` au `return` ?", "`function f(x: string | number) { if (typeof x === \"string\") x = 42; return x.toFixed(); }` ¿Qué cree el comprobador que es `x` en el `return`?"],
    a: ["`number`: assignments narrow too, and both paths end with a number", "`number` : les affectations affinent aussi, et les deux chemins finissent avec un nombre", "`number`: las asignaciones también estrechan, y los dos caminos terminan con un número"],
    w: [["`string | number`, so `toFixed` is refused", "`string | number`, donc `toFixed` est refusé", "`string | number`, así que `toFixed` se rechaza"], ["`string`", "`string`", "`string`"], ["`never`", "`never`", "`never`"]],
    e: [
      "Control-flow analysis tracks the type of each variable at each point: a test narrows, an assignment of a narrower value narrows, and branches join. This one is sound, unlike the holes listed elsewhere.",
      "L'analyse du flot de contrôle suit le type de chaque variable à chaque point : un test affine, l'affectation d'une valeur plus étroite affine, et les branches se rejoignent. Celle-ci est sûre, contrairement aux trous cités ailleurs.",
      "El análisis del flujo de control sigue el tipo de cada variable en cada punto: una prueba estrecha, la asignación de un valor más estrecho estrecha, y las ramas se unen. Este es seguro, a diferencia de los huecos citados en otros lugares.",
    ],
  },
];

const engine: TsQuestion[] = [
  {
    id: "ts-eng-01",
    q: ["A promise callback schedules another promise callback, forever. What happens to `setTimeout` callbacks?", "Un rappel de promesse programme un autre rappel de promesse, sans fin. Qu'arrive-t-il aux rappels de `setTimeout` ?", "Una retrollamada de promesa programa otra retrollamada de promesa, sin fin. ¿Qué les pasa a las retrollamadas de `setTimeout`?"],
    a: ["They never run: the microtask queue is emptied before any timer, and it never empties", "Ils ne s'exécutent jamais : la file des microtâches est vidée avant toute minuterie, et elle ne se vide jamais", "Nunca se ejecutan: la cola de microtareas se vacía antes de cualquier temporizador, y nunca se vacía"],
    w: [["They alternate with the promises", "Ils alternent avec les promesses", "Se alternan con las promesas"], ["They run after 4 ms anyway", "Ils s'exécutent quand même au bout de 4 ms", "Se ejecutan igualmente a los 4 ms"], ["The engine throws a stack overflow", "Le moteur lève un dépassement de pile", "El motor lanza un desbordamiento de pila"]],
    e: [
      "Microtask starvation: the page or process stays responsive to nothing. Long work should yield through macrotasks (`setTimeout`, `setImmediate`, `scheduler.yield()` in browsers), which let I/O and rendering in between.",
      "La famine des microtâches : la page ou le processus ne répond plus à rien. Un long travail doit céder la main par des macrotâches (`setTimeout`, `setImmediate`, `scheduler.yield()` dans les navigateurs), qui laissent passer E/S et rendu entre deux.",
      "La inanición de microtareas: la página o el proceso deja de responder a nada. Un trabajo largo debe ceder mediante macrotareas (`setTimeout`, `setImmediate`, `scheduler.yield()` en navegadores), que dejan pasar E/S y renderizado entre medias.",
    ],
  },
  {
    id: "ts-eng-02",
    q: ["Why cache data about DOM nodes in a `WeakMap<Element, Info>` rather than a `Map`?", "Pourquoi mettre en cache des données sur des nœuds DOM dans une `WeakMap<Element, Info>` plutôt qu'une `Map` ?", "¿Por qué guardar en caché datos sobre nodos DOM en un `WeakMap<Element, Info>` en lugar de un `Map`?"],
    a: ["The `WeakMap` does not keep its keys alive: when a node is gone, its entry can be collected", "La `WeakMap` ne garde pas ses clés en vie : quand un nœud disparaît, son entrée peut être récupérée", "El `WeakMap` no mantiene vivas sus claves: cuando un nodo desaparece, su entrada puede recogerse"],
    w: [["It is faster to read", "Elle est plus rapide à lire", "Es más rápido de leer"], ["It can be iterated in insertion order", "Elle se parcourt dans l'ordre d'insertion", "Se puede recorrer en orden de inserción"], ["It accepts strings as keys", "Elle accepte des chaînes comme clés", "Acepta cadenas como claves"]],
    e: [
      "A `Map` would hold every node it ever saw: a leak. The price: `WeakMap` keys must be objects (or non-registered symbols), and it cannot be iterated or sized. `WeakRef` and `FinalizationRegistry` go further, with care.",
      "Une `Map` garderait tous les nœuds qu'elle a vus : une fuite. Le prix : les clés d'une `WeakMap` doivent être des objets (ou des symboles non enregistrés), et elle ne se parcourt ni ne se mesure. `WeakRef` et `FinalizationRegistry` vont plus loin, avec prudence.",
      "Un `Map` retendría todos los nodos que vio: una fuga. El precio: las claves de un `WeakMap` deben ser objetos (o símbolos no registrados), y no se puede recorrer ni medir. `WeakRef` y `FinalizationRegistry` van más allá, con cuidado.",
    ],
  },
  {
    id: "ts-eng-03",
    q: ["What does `structuredClone` refuse to copy?", "Que refuse de copier `structuredClone` ?", "¿Qué se niega a copiar `structuredClone`?"],
    a: ["Functions, DOM nodes and class prototypes: an instance comes back as a plain object", "Les fonctions, les nœuds DOM et les prototypes de classes : une instance revient en objet simple", "Las funciones, los nodos DOM y los prototipos de clases: una instancia vuelve como objeto simple"],
    w: [["Dates and `Map` objects", "Les dates et les `Map`", "Las fechas y los `Map`"], ["Cycles", "Les cycles", "Los ciclos"], ["Nested objects", "Les objets imbriqués", "Los objetos anidados"]],
    e: [
      "It uses the structured clone algorithm, the same as `postMessage`: deep, keeps cycles, `Date`, `Map`, `Set`, typed arrays; it throws on functions. `JSON.parse(JSON.stringify(x))` loses more (dates become strings, `undefined` and `Map` vanish).",
      "Il utilise l'algorithme de clonage structuré, le même que `postMessage` : profond, il garde les cycles, `Date`, `Map`, `Set`, les tableaux typés ; il lève une erreur sur les fonctions. `JSON.parse(JSON.stringify(x))` perd davantage (les dates deviennent des chaînes, `undefined` et `Map` disparaissent).",
      "Usa el algoritmo de clonación estructurada, el mismo que `postMessage`: profundo, conserva ciclos, `Date`, `Map`, `Set`, arrays con tipo; lanza un error con funciones. `JSON.parse(JSON.stringify(x))` pierde más (las fechas pasan a cadenas, `undefined` y `Map` desaparecen).",
    ],
  },
  {
    id: "ts-eng-04",
    q: ["What does `function* ids() { let n = 0; while (true) yield n++; }` give?", "Que donne `function* ids() { let n = 0; while (true) yield n++; }` ?", "¿Qué da `function* ids() { let n = 0; while (true) yield n++; }`?"],
    a: ["A lazy iterator: each `next()` runs to the next `yield`, so the infinite loop is fine", "Un itérateur paresseux : chaque `next()` avance jusqu'au `yield` suivant, la boucle infinie ne pose donc pas de problème", "Un iterador perezoso: cada `next()` avanza hasta el siguiente `yield`, así que el bucle infinito no es un problema"],
    w: [["A program that hangs", "Un programme qui se bloque", "Un programa que se cuelga"], ["An array of every number", "Un tableau de tous les nombres", "Un array de todos los números"], ["A compile error", "Une erreur de compilation", "Un error de compilación"]],
    e: [
      "A generator pauses at each `yield`. It is typed `Generator<number, never, unknown>` (yield, return, next types). Iterator helpers (`ids().take(5).toArray()`, ES2025) or `for…of` with a `break` consume it.",
      "Un générateur se met en pause à chaque `yield`. Il se type `Generator<number, never, unknown>` (types du yield, du retour, de next). Les assistants d'itérateurs (`ids().take(5).toArray()`, ES2025) ou un `for…of` avec un `break` le consomment.",
      "Un generador se detiene en cada `yield`. Se tipa `Generator<number, never, unknown>` (tipos del yield, del retorno, de next). Los ayudantes de iteradores (`ids().take(5).toArray()`, ES2025) o un `for…of` con un `break` lo consumen.",
    ],
  },
  {
    id: "ts-eng-05",
    q: ["Why use `Symbol(\"id\")` as a property key?", "Pourquoi utiliser `Symbol(\"id\")` comme clé de propriété ?", "¿Por qué usar `Symbol(\"id\")` como clave de propiedad?"],
    a: ["Each symbol is unique: no clash with other code's keys, and it stays out of `Object.keys` and `JSON.stringify`", "Chaque symbole est unique : pas de collision avec les clés d'un autre code, et il reste hors d'`Object.keys` et de `JSON.stringify`", "Cada símbolo es único: sin choques con las claves de otro código, y queda fuera de `Object.keys` y `JSON.stringify`"],
    w: [["It makes the property private", "Il rend la propriété privée", "Hace privada la propiedad"], ["It is faster than a string key", "Il est plus rapide qu'une clé chaîne", "Es más rápido que una clave cadena"], ["It is required for numbers", "Il est obligatoire pour les nombres", "Es obligatorio para números"]],
    e: [
      "Symbols are not private: `Object.getOwnPropertySymbols` finds them. Well-known symbols hook into the language: `Symbol.iterator` makes an object iterable, `Symbol.dispose` works with `using`. `Symbol.for(\"id\")` returns a shared, registered symbol.",
      "Les symboles ne sont pas privés : `Object.getOwnPropertySymbols` les trouve. Les symboles connus se branchent sur le langage : `Symbol.iterator` rend un objet itérable, `Symbol.dispose` fonctionne avec `using`. `Symbol.for(\"id\")` renvoie un symbole partagé, enregistré.",
      "Los símbolos no son privados: `Object.getOwnPropertySymbols` los encuentra. Los símbolos conocidos se conectan al lenguaje: `Symbol.iterator` hace iterable un objeto, `Symbol.dispose` funciona con `using`. `Symbol.for(\"id\")` devuelve un símbolo compartido, registrado.",
    ],
  },
];

const ecosystem: TsQuestion[] = [
  {
    id: "ts-eco-01",
    q: ["What is TypeScript 7?", "Qu'est-ce que TypeScript 7 ?", "¿Qué es TypeScript 7?"],
    a: ["The compiler and language service rewritten in Go, natively compiled: the same language, type-checking several times faster", "Le compilateur et le service de langage réécrits en Go, compilés en natif : le même langage, une vérification plusieurs fois plus rapide", "El compilador y el servicio de lenguaje reescritos en Go, compilados de forma nativa: el mismo lenguaje, una comprobación varias veces más rápida"],
    w: [["A new language incompatible with TypeScript 5", "Un nouveau langage incompatible avec TypeScript 5", "Un lenguaje nuevo incompatible con TypeScript 5"], ["TypeScript running in the browser only", "TypeScript qui ne tourne que dans le navigateur", "TypeScript que solo se ejecuta en el navegador"], ["A version that checks types at run time", "Une version qui vérifie les types à l'exécution", "Una versión que comprueba los tipos al ejecutar"]],
    e: [
      "The port keeps the checker's behaviour (6.0 was the last JavaScript-based release, preparing the switch by deprecating old options). Speed comes from native code and parallelism. Tools that used the old JavaScript compiler API need the new API.",
      "Le portage garde le comportement du vérificateur (la 6.0 a été la dernière version en JavaScript, préparant le passage en rendant obsolètes d'anciennes options). La vitesse vient du code natif et du parallélisme. Les outils qui utilisaient l'ancienne API JavaScript du compilateur ont besoin de la nouvelle.",
      "El port conserva el comportamiento del comprobador (la 6.0 fue la última versión en JavaScript, que preparó el cambio declarando obsoletas opciones antiguas). La velocidad viene del código nativo y del paralelismo. Las herramientas que usaban la antigua API JavaScript del compilador necesitan la nueva.",
    ],
  },
  {
    id: "ts-eco-02",
    q: ["Node runs `node app.ts` directly. What does it do with the types?", "Node exécute `node app.ts` directement. Que fait-il des types ?", "Node ejecuta `node app.ts` directamente. ¿Qué hace con los tipos?"],
    a: ["It strips them, replacing them with spaces, without checking; syntax that needs code generation (enums, parameter properties) is refused", "Il les retire, en les remplaçant par des espaces, sans vérifier ; la syntaxe qui demande de générer du code (enums, propriétés de paramètres) est refusée", "Los quita, sustituyéndolos por espacios, sin comprobar; la sintaxis que requiere generar código (enums, propiedades de parámetro) se rechaza"],
    w: [["It type-checks the file first", "Il vérifie d'abord les types du fichier", "Comprueba antes los tipos del archivo"], ["It compiles with `tsc` in the background", "Il compile avec `tsc` en arrière-plan", "Compila con `tsc` en segundo plano"], ["It ignores `.ts` files", "Il ignore les fichiers `.ts`", "Ignora los archivos `.ts`"]],
    e: [
      "Type stripping is on by default in current Node versions. `erasableSyntaxOnly` (TypeScript 5.8) makes the compiler refuse non-erasable syntax, so code runs the same under Node. Type-checking stays a separate `tsc` step.",
      "Le retrait des types est actif par défaut dans les versions actuelles de Node. `erasableSyntaxOnly` (TypeScript 5.8) fait refuser au compilateur la syntaxe non effaçable, pour que le code tourne pareil sous Node. La vérification des types reste une étape `tsc` séparée.",
      "La eliminación de tipos está activa por defecto en las versiones actuales de Node. `erasableSyntaxOnly` (TypeScript 5.8) hace que el compilador rechace la sintaxis no borrable, para que el código se ejecute igual con Node. La comprobación de tipos sigue siendo un paso `tsc` aparte.",
    ],
  },
  {
    id: "ts-eco-03",
    q: ["What does `isolatedDeclarations` (TypeScript 5.5) require?", "Qu'exige `isolatedDeclarations` (TypeScript 5.5) ?", "¿Qué exige `isolatedDeclarations` (TypeScript 5.5)?"],
    a: ["Explicit types on everything exported, so `.d.ts` files can be produced file by file without the checker", "Des types explicites sur tout ce qui est exporté, pour produire les `.d.ts` fichier par fichier sans le vérificateur", "Tipos explícitos en todo lo exportado, para producir los `.d.ts` archivo por archivo sin el comprobador"],
    w: [["Every module to be in its own process", "Chaque module dans son propre processus", "Cada módulo en su propio proceso"], ["No `.d.ts` files at all", "Aucun fichier `.d.ts`", "Ningún archivo `.d.ts`"], ["Every declaration to be `const`", "Chaque déclaration en `const`", "Cada declaración en `const`"]],
    e: [
      "Inferring an exported function's return type needs the whole program; writing it out lets fast tools (esbuild-like, in parallel) emit declarations. Large monorepos use it to build libraries quickly.",
      "Déduire le type de retour d'une fonction exportée demande tout le programme ; l'écrire permet à des outils rapides (du genre d'esbuild, en parallèle) d'émettre les déclarations. Les grands monorepos s'en servent pour construire vite les bibliothèques.",
      "Deducir el tipo de retorno de una función exportada requiere todo el programa; escribirlo permite que herramientas rápidas (del estilo de esbuild, en paralelo) emitan las declaraciones. Los grandes monorepos lo usan para construir bibliotecas rápido.",
    ],
  },
  {
    id: "ts-eco-04",
    q: ["What are project references (`references` and `composite`) for?", "À quoi servent les références de projets (`references` et `composite`) ?", "¿Para qué sirven las referencias de proyectos (`references` y `composite`)?"],
    a: ["Splitting a large codebase into projects built in order, each reusing the others' `.d.ts` output, with `tsc --build`", "Découper un gros code en projets construits dans l'ordre, chacun réutilisant les `.d.ts` des autres, avec `tsc --build`", "Dividir un código grande en proyectos construidos en orden, cada uno reutilizando los `.d.ts` de los demás, con `tsc --build`"],
    w: [["Linking to documentation", "Faire des liens vers la documentation", "Enlazar a la documentación"], ["Importing npm packages", "Importer des paquets npm", "Importar paquetes npm"], ["Running tests in parallel", "Lancer les tests en parallèle", "Ejecutar las pruebas en paralelo"]],
    e: [
      "Each referenced project is checked once and its declarations are used by the next, so a change rebuilds only what depends on it. It also enforces boundaries: a project can only import from projects it references.",
      "Chaque projet référencé est vérifié une fois et ses déclarations servent au suivant : un changement ne reconstruit que ce qui en dépend. Cela impose aussi des frontières : un projet ne peut importer que depuis les projets qu'il référence.",
      "Cada proyecto referenciado se comprueba una vez y sus declaraciones sirven al siguiente, así que un cambio solo reconstruye lo que depende de él. También impone fronteras: un proyecto solo puede importar de los proyectos que referencia.",
    ],
  },
  {
    id: "ts-eco-05",
    q: ["What does typescript-eslint add that `tsc` does not?", "Qu'apporte typescript-eslint que `tsc` n'apporte pas ?", "¿Qué aporta typescript-eslint que `tsc` no aporta?"],
    a: ["Lint rules that use types: floating promises, unsafe `any`, needless conditions, misused promises", "Des règles de lint qui utilisent les types : promesses flottantes, `any` dangereux, conditions inutiles, promesses mal utilisées", "Reglas de lint que usan los tipos: promesas flotantes, `any` peligroso, condiciones innecesarias, promesas mal usadas"],
    w: [["Type-checking itself", "La vérification des types elle-même", "La propia comprobación de tipos"], ["Compiling to JavaScript", "La compilation en JavaScript", "La compilación a JavaScript"], ["Code formatting only", "Seulement la mise en forme du code", "Solo el formato del código"]],
    e: [
      "`tsc` reports type errors; it does not judge patterns that type-check but are usually bugs. Type-aware rules (`no-floating-promises`, `no-unsafe-assignment`, `no-unnecessary-condition`) are slower, since they run the checker.",
      "`tsc` signale les erreurs de type ; il ne juge pas les façons d'écrire qui passent la vérification mais sont en général des bugs. Les règles qui utilisent les types (`no-floating-promises`, `no-unsafe-assignment`, `no-unnecessary-condition`) sont plus lentes, car elles font tourner le vérificateur.",
      "`tsc` informa de los errores de tipo; no juzga patrones que pasan la comprobación pero suelen ser fallos. Las reglas que usan tipos (`no-floating-promises`, `no-unsafe-assignment`, `no-unnecessary-condition`) son más lentas, porque ejecutan el comprobador.",
    ],
  },
];

export const objects = { classSemantics };
export const typeLevel = { advancedTypes, soundness };
export const runtime = { engine };
export const tooling = { ecosystem };
