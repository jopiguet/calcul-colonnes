/** Texts of the TypeScript test, in French, Spanish and English; merged into quiz-i18n.ts. */
import type { TsTopic } from "../shared/quiz";

type Lang = "fr" | "es" | "en";
type Tri = Record<Lang, string>;

export const TS_TEXTS = {
  fr: { modeTs: "🔷 TypeScript", tsSetupTitle: "QCM : TypeScript" },
  es: { modeTs: "🔷 TypeScript", tsSetupTitle: "Test: TypeScript" },
  en: { modeTs: "🔷 TypeScript", tsSetupTitle: "Test: TypeScript" },
} satisfies Record<Lang, Record<string, string>>;

export const TS_LEVEL_NAMES: Record<"tsBeginner" | "tsIntermediate" | "tsAdvanced" | "tsExpert", Tri> = {
  tsBeginner: { fr: "Débutant", es: "Principiante", en: "Beginner" },
  tsIntermediate: { fr: "Intermédiaire", es: "Intermedio", en: "Intermediate" },
  tsAdvanced: { fr: "Avancé", es: "Avanzado", en: "Advanced" },
  tsExpert: { fr: "Expert", es: "Experto", en: "Expert" },
};

export const TS_GROUPS: Record<Lang, { tsLanguage: string; tsPlatform: string }> = {
  fr: { tsLanguage: "Le langage et ses types", tsPlatform: "Exécution et outillage" },
  es: { tsLanguage: "El lenguaje y sus tipos", tsPlatform: "Ejecución y herramientas" },
  en: { tsLanguage: "The language and its types", tsPlatform: "Runtime and tooling" },
};

export const TS_TOPIC_NAMES: Record<Lang, Record<TsTopic, string>> = {
  fr: {
    tsBasics: "Bases : types, tableaux, objets",
    tsFunctions: "Fonctions et closures",
    tsObjects: "Interfaces et classes",
    tsNarrowing: "Unions et affinement",
    tsGenerics: "Génériques et types utilitaires",
    tsTypeLevel: "Types mappés et conditionnels",
    tsRuntime: "Le JavaScript à l'exécution",
    tsTooling: "tsconfig, modules, outils",
  },
  es: {
    tsBasics: "Bases: tipos, arrays, objetos",
    tsFunctions: "Funciones y clausuras",
    tsObjects: "Interfaces y clases",
    tsNarrowing: "Uniones y estrechamiento",
    tsGenerics: "Genéricos y tipos utilitarios",
    tsTypeLevel: "Tipos mapeados y condicionales",
    tsRuntime: "El JavaScript al ejecutar",
    tsTooling: "tsconfig, módulos, herramientas",
  },
  en: {
    tsBasics: "Basics: types, arrays, objects",
    tsFunctions: "Functions and closures",
    tsObjects: "Interfaces and classes",
    tsNarrowing: "Unions and narrowing",
    tsGenerics: "Generics and utility types",
    tsTypeLevel: "Mapped and conditional types",
    tsRuntime: "JavaScript at run time",
    tsTooling: "tsconfig, modules, tools",
  },
};

export const TS_SKILLS: Record<Lang, Record<string, string>> = {
  fr: {
    "tsBasics.primitives": "Types primitifs, any et unknown",
    "tsBasics.collections": "Tableaux, tuples, objets",
    "tsBasics.arrayMethods": "Ce que font sort, push, slice, splice",
    "tsBasics.literals": "Types littéraux, as const, enums, satisfies",
    "tsFunctions.functions": "Fonctions typées",
    "tsFunctions.signatures": "Surcharges, this, paramètres du reste",
    "tsFunctions.closures": "Closures",
    "tsFunctions.closureLoop": "Ce que capture une closure dans une boucle",
    "tsObjects.interfaces": "Interfaces",
    "tsObjects.classes": "Classes",
    "tsObjects.structural": "Typage structurel",
    "tsObjects.classSemantics": "Champs, décorateurs, using",
    "tsObjects.initOrder": "L'ordre d'initialisation d'une classe",
    "tsNarrowing.unions": "Unions et assertions",
    "tsNarrowing.guards": "Gardes et unions discriminées",
    "tsNarrowing.typeofValues": "Ce que donne typeof",
    "tsNarrowing.controlFlow": "Analyse du flot de contrôle",
    "tsGenerics.genericsBasics": "Génériques, contraintes, keyof",
    "tsGenerics.utility": "Types utilitaires",
    "tsTypeLevel.mapped": "Types mappés et accès indexé",
    "tsTypeLevel.conditional": "Types conditionnels et infer",
    "tsTypeLevel.advancedTypes": "const, NoInfer, variance, marques",
    "tsTypeLevel.soundness": "Les trous du système de types",
    "tsRuntime.jsBasics": "Le JavaScript de base",
    "tsRuntime.nullish": "Ce que donnent ?? et ?.",
    "tsRuntime.async": "Promesses et async",
    "tsRuntime.eventLoop": "L'ordre de la boucle d'événements",
    "tsRuntime.pitfalls": "Pièges de JavaScript",
    "tsRuntime.numbers": "Ce que donnent les calculs de nombres",
    "tsRuntime.copies": "Copies superficielles et profondes",
    "tsRuntime.engine": "Le moteur : microtâches, WeakMap, générateurs",
    "tsRuntime.asyncOrder": "L'ordre de async et await",
    "tsTooling.setup": "Installer et compiler",
    "tsTooling.modules": "Modules et déclarations",
    "tsTooling.strictness": "Options strictes",
    "tsTooling.ecosystem": "TypeScript 7, Node, références de projets",
  },
  es: {
    "tsBasics.primitives": "Tipos primitivos, any y unknown",
    "tsBasics.collections": "Arrays, tuplas, objetos",
    "tsBasics.arrayMethods": "Lo que hacen sort, push, slice, splice",
    "tsBasics.literals": "Tipos literales, as const, enums, satisfies",
    "tsFunctions.functions": "Funciones tipadas",
    "tsFunctions.signatures": "Sobrecargas, this, parámetros rest",
    "tsFunctions.closures": "Clausuras",
    "tsFunctions.closureLoop": "Lo que captura una clausura en un bucle",
    "tsObjects.interfaces": "Interfaces",
    "tsObjects.classes": "Clases",
    "tsObjects.structural": "Tipado estructural",
    "tsObjects.classSemantics": "Campos, decoradores, using",
    "tsObjects.initOrder": "El orden de inicialización de una clase",
    "tsNarrowing.unions": "Uniones y aserciones",
    "tsNarrowing.guards": "Guardas y uniones discriminadas",
    "tsNarrowing.typeofValues": "Lo que da typeof",
    "tsNarrowing.controlFlow": "Análisis del flujo de control",
    "tsGenerics.genericsBasics": "Genéricos, restricciones, keyof",
    "tsGenerics.utility": "Tipos utilitarios",
    "tsTypeLevel.mapped": "Tipos mapeados y acceso indexado",
    "tsTypeLevel.conditional": "Tipos condicionales e infer",
    "tsTypeLevel.advancedTypes": "const, NoInfer, varianza, marcas",
    "tsTypeLevel.soundness": "Los huecos del sistema de tipos",
    "tsRuntime.jsBasics": "El JavaScript básico",
    "tsRuntime.nullish": "Lo que dan ?? y ?.",
    "tsRuntime.async": "Promesas y async",
    "tsRuntime.eventLoop": "El orden del bucle de eventos",
    "tsRuntime.pitfalls": "Trampas de JavaScript",
    "tsRuntime.numbers": "Lo que dan los cálculos con números",
    "tsRuntime.copies": "Copias superficiales y profundas",
    "tsRuntime.engine": "El motor: microtareas, WeakMap, generadores",
    "tsRuntime.asyncOrder": "El orden de async y await",
    "tsTooling.setup": "Instalar y compilar",
    "tsTooling.modules": "Módulos y declaraciones",
    "tsTooling.strictness": "Opciones estrictas",
    "tsTooling.ecosystem": "TypeScript 7, Node, referencias de proyectos",
  },
  en: {
    "tsBasics.primitives": "Primitive types, any and unknown",
    "tsBasics.collections": "Arrays, tuples, objects",
    "tsBasics.arrayMethods": "What sort, push, slice, splice do",
    "tsBasics.literals": "Literal types, as const, enums, satisfies",
    "tsFunctions.functions": "Typed functions",
    "tsFunctions.signatures": "Overloads, this, rest parameters",
    "tsFunctions.closures": "Closures",
    "tsFunctions.closureLoop": "What a closure in a loop captures",
    "tsObjects.interfaces": "Interfaces",
    "tsObjects.classes": "Classes",
    "tsObjects.structural": "Structural typing",
    "tsObjects.classSemantics": "Fields, decorators, using",
    "tsObjects.initOrder": "A class's initialization order",
    "tsNarrowing.unions": "Unions and assertions",
    "tsNarrowing.guards": "Guards and discriminated unions",
    "tsNarrowing.typeofValues": "What typeof gives",
    "tsNarrowing.controlFlow": "Control-flow analysis",
    "tsGenerics.genericsBasics": "Generics, constraints, keyof",
    "tsGenerics.utility": "Utility types",
    "tsTypeLevel.mapped": "Mapped types and indexed access",
    "tsTypeLevel.conditional": "Conditional types and infer",
    "tsTypeLevel.advancedTypes": "const, NoInfer, variance, brands",
    "tsTypeLevel.soundness": "Where the type system is unsound",
    "tsRuntime.jsBasics": "Basic JavaScript",
    "tsRuntime.nullish": "What ?? and ?. give",
    "tsRuntime.async": "Promises and async",
    "tsRuntime.eventLoop": "Event loop order",
    "tsRuntime.pitfalls": "JavaScript pitfalls",
    "tsRuntime.numbers": "What number arithmetic gives",
    "tsRuntime.copies": "Shallow and deep copies",
    "tsRuntime.engine": "The engine: microtasks, WeakMap, generators",
    "tsRuntime.asyncOrder": "async and await order",
    "tsTooling.setup": "Installing and compiling",
    "tsTooling.modules": "Modules and declarations",
    "tsTooling.strictness": "Strict options",
    "tsTooling.ecosystem": "TypeScript 7, Node, project references",
  },
};

type TsMistake =
  | "tsSortStrings"
  | "tsMutatingMethod"
  | "tsSliceEnd"
  | "tsNullishOr"
  | "tsOptionalChain"
  | "tsTypeof"
  | "tsMicrotaskOrder"
  | "tsAsyncSync"
  | "tsAwaitOrder"
  | "tsVarCapture"
  | "tsFloat"
  | "tsParseNumber"
  | "tsRounding"
  | "tsShallowCopy"
  | "tsReferenceEquality"
  | "tsFieldInitOrder";

export const TS_MISTAKES: Record<Lang, Record<TsMistake, string>> = {
  fr: {
    tsSortStrings: "sort() sans comparateur pris pour un tri numérique",
    tsMutatingMethod: "Ce qu'une méthode modifie ou renvoie confondu",
    tsSliceEnd: "Fin de slice prise comme incluse, ou nombre de splice pris pour une fin",
    tsNullishOr: "?? et || confondus",
    tsOptionalChain: "?. pris pour une erreur ou pour null",
    tsTypeof: "Le résultat de typeof mal connu",
    tsMicrotaskOrder: "Minuterie prise pour plus rapide qu'une promesse",
    tsAsyncSync: "Code asynchrone pris pour exécuté dans l'ordre d'écriture",
    tsAwaitOrder: "await pris pour bloquer l'appelant",
    tsVarCapture: "var et let confondus dans une boucle",
    tsFloat: "Virgule flottante ou toFixed mal compris",
    tsParseNumber: "Number() et parseInt() confondus",
    tsRounding: "Arrondi des demis ou des négatifs mal connu",
    tsShallowCopy: "Copie superficielle et profonde confondues",
    tsReferenceEquality: "Identité et contenu confondus",
    tsFieldInitOrder: "Champs pris pour initialisés avant le constructeur parent",
  },
  es: {
    tsSortStrings: "sort() sin comparador tomado como orden numérico",
    tsMutatingMethod: "Lo que un método cambia o devuelve confundido",
    tsSliceEnd: "Final de slice tomado como incluido, o cantidad de splice tomada como final",
    tsNullishOr: "?? y || confundidos",
    tsOptionalChain: "?. tomado como un error o como null",
    tsTypeof: "El resultado de typeof mal conocido",
    tsMicrotaskOrder: "Temporizador tomado como más rápido que una promesa",
    tsAsyncSync: "Código asíncrono tomado como ejecutado en el orden escrito",
    tsAwaitOrder: "await tomado como bloquear a quien llama",
    tsVarCapture: "var y let confundidos en un bucle",
    tsFloat: "Coma flotante o toFixed mal entendidos",
    tsParseNumber: "Number() y parseInt() confundidos",
    tsRounding: "Redondeo de mitades o negativos mal conocido",
    tsShallowCopy: "Copia superficial y profunda confundidas",
    tsReferenceEquality: "Identidad y contenido confundidos",
    tsFieldInitOrder: "Campos tomados como inicializados antes del constructor padre",
  },
  en: {
    tsSortStrings: "sort() without a comparator taken to sort numbers",
    tsMutatingMethod: "What a method changes or returns confused",
    tsSliceEnd: "slice's end taken as included, or splice's count as an end",
    tsNullishOr: "?? and || confused",
    tsOptionalChain: "?. taken to throw or give null",
    tsTypeof: "typeof's result misremembered",
    tsMicrotaskOrder: "A timer taken to run before a promise callback",
    tsAsyncSync: "Async code taken to run in the order written",
    tsAwaitOrder: "await taken to block the caller",
    tsVarCapture: "var and let confused in a loop",
    tsFloat: "Floating point or toFixed misread",
    tsParseNumber: "Number() and parseInt() confused",
    tsRounding: "Rounding of halves or negatives misremembered",
    tsShallowCopy: "Shallow and deep copies confused",
    tsReferenceEquality: "Identity and contents confused",
    tsFieldInitOrder: "Fields taken to be set before the base constructor",
  },
};
