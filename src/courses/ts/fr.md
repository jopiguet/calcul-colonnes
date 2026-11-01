# TypeScript — l'essentiel du test

## Comment utiliser ce cours

Ce cours accompagne le test TypeScript. Beaucoup de questions montrent un extrait et demandent ce qu'il affiche ou ce que dit le compilateur. TypeScript ne vérifie que les types : à l'exécution, c'est du JavaScript, et la moitié du test porte donc sur JavaScript lui-même. Essayez les extraits dans le [TypeScript Playground](https://www.typescriptlang.org/play).

| Niveau | Ce qu'il demande |
|---|---|
| Débutant | Types primitifs, tableaux, objets, fonctions, `let` et `const` |
| Intermédiaire | Interfaces, unions et rétrécissement, classes, modules, `async` |
| Avancé | Génériques, types utilitaires, la boucle d'événements, options strictes, outillage |
| Expert | Types mappés et conditionnels, failles de cohérence, ordre d'évaluation, détails des moteurs |

## Partie 1 — Les bases

Les types primitifs sont `string`, `number`, `boolean`, `bigint`, `symbol`, `null` et `undefined`. Un `number` est un flottant de 64 bits : `0.1 + 0.2 === 0.3` vaut `false`. Les tableaux s'écrivent `number[]` ou `Array<number>`, les tuples `[string, number]`. Un type littéral comme `"GET"` n'admet que cette valeur, et `const` infère des types littéraux là où `let` les élargit.

Méthodes de tableau : `map`, `filter` et `slice` renvoient un nouveau tableau ; `push`, `splice`, `reverse` et `sort` le modifient sur place. `sort` sans comparateur compare comme des chaînes : `[10, 9, 1].sort()` donne `[1, 10, 9]`.

## Partie 2 — Fonctions et closures

Les paramètres peuvent être optionnels (`x?: number`), avoir des valeurs par défaut ou rassembler le reste (`...xs: number[]`). Le type de retour est inféré mais mérite d'être écrit sur les fonctions exportées. Les surcharges donnent plusieurs signatures à une seule implémentation.

Une closure garde les variables de la portée où elle a été créée. `let` dans une boucle crée une nouvelle liaison à chaque itération ; `var` en partage une seule :

```ts
const fns: Array<() => number> = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
console.log(fns.map((f) => f()));
```

Ceci affiche `[3, 3, 3]` ; avec `let`, on obtient `[0, 1, 2]`.

## Partie 3 — Objets, interfaces, classes

TypeScript est typé structurellement : un objet convient à un type s'il a les bons membres, quel que soit son nom. Un littéral objet passé directement est vérifié contre les propriétés en trop ; le même objet passé par une variable ne l'est pas. `interface` et `type` décrivent tous deux des formes ; les interfaces peuvent être fusionnées et étendues, les types peuvent exprimer des unions.

Les classes ajoutent `private`, `protected`, `readonly` et les propriétés de paramètre (`constructor(private name: string)`). `private` est une vérification à la compilation ; `#name` est privé aussi à l'exécution. Les initialiseurs de champs s'exécutent avant le corps du constructeur, et dans une sous-classe après le retour de `super()`.

## Partie 4 — Unions et rétrécissement

Une union `string | number` doit être rétrécie avant usage. Le compilateur rétrécit avec `typeof`, `instanceof`, `in`, les tests d'égalité et un champ discriminant :

```ts
type Shape = { kind: "circle"; r: number } | { kind: "square"; side: number };
function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.r ** 2;
    case "square": return s.side ** 2;
  }
}
```

Une garde définie par l'utilisateur renvoie `x is T`. `typeof null` vaut `"object"`, tout comme `typeof []` : vérifiez donc avec `Array.isArray`. Affecter le cas restant à `never` fait signaler par le compilateur un cas oublié.

## Partie 5 — JavaScript à l'exécution

- `==` convertit les types, `===` non ; utilisez `===`.
- `??` ne se rabat que sur `null` et `undefined`, `||` sur toute valeur fausse comme `0` ou `""` ; `?.` s'arrête sur `null` ou `undefined`.
- Objets et tableaux sont passés par référence ; la décomposition `{...obj}` ne copie qu'un niveau, `structuredClone` copie en profondeur.
- La boucle d'événements exécute le script en cours, puis toutes les microtâches (rappels de `Promise`, suites d'`await`), puis la macrotâche suivante (`setTimeout`). Ainsi `setTimeout(f, 0)` s'exécute après le `then` d'une promesse résolue.
- Les fonctions `async` renvoient une promesse ; un `await` dans un rappel de `forEach` ne fait pas attendre la boucle.

## Partie 6 — Outillage et rigueur

`tsc` compile selon `tsconfig.json`. `strict` active `strictNullChecks`, `noImplicitAny` et les autres vérifications ; `noUncheckedIndexedAccess` ajoute `undefined` aux lectures indexées. Les modules ES utilisent `import` et `export` ; `import type` importe un type qui disparaît de la sortie. Les définitions de types des paquets JavaScript viennent de `@types/…`. Les bundlers comme Vite et les lanceurs comme `tsx` retirent les types sans les vérifier : lancez donc `tsc --noEmit` en CI.

## Partie 7 — Génériques et types utilitaires

Un générique garde le lien entre entrée et sortie : `function first<T>(xs: T[]): T | undefined`. On le contraint avec `extends` : `<T extends { id: number }>`. Types utilitaires intégrés :

| Type | Donne |
|---|---|
| `Partial<T>` | Toutes les propriétés optionnelles |
| `Required<T>` | Toutes les propriétés obligatoires |
| `Pick<T, K>` | Seulement les clés `K` |
| `Omit<T, K>` | Toutes les clés sauf `K` |
| `Record<K, V>` | Un objet de clés `K` et de valeurs `V` |
| `ReturnType<F>` | Le type de retour d'un type de fonction |

## Partie 8 — La programmation au niveau des types

Un type mappé reconstruit un type objet clé par clé : `{ [K in keyof T]: T[K] | null }`. Un type conditionnel choisit : `T extends string ? "text" : "other"`, et il se distribue sur les unions. `infer` capture une partie : `T extends Promise<infer U> ? U : T`. Les types littéraux de gabarit construisent des chaînes à partir d'autres types, comme `on${Capitalize<E>}` pour des noms d'événements. Le système de types est volontairement incohérent par endroits — `any`, les assertions de type, la bivariance des paramètres de méthode, la covariance des tableaux — si bien qu'un programme peut passer la vérification et échouer quand même.

## Sources

| Thème | Référence gratuite |
|---|---|
| Le langage | [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) |
| Options du compilateur | [Référence TSConfig](https://www.typescriptlang.org/tsconfig) |
| JavaScript | [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) |
| La boucle d'événements | [MDN, The event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop) |
