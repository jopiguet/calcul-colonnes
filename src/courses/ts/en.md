# TypeScript — the essentials of the test

## How to use this course

This course goes with the TypeScript test. Many questions show a snippet and ask what it logs or what the compiler says. TypeScript only checks types: at run time it is JavaScript, so half the test is about JavaScript itself. Try the snippets in the [TypeScript Playground](https://www.typescriptlang.org/play).

| Level | What it asks |
|---|---|
| Beginner | Primitive types, arrays, objects, functions, `let` and `const` |
| Intermediate | Interfaces, unions and narrowing, classes, modules, `async` |
| Advanced | Generics, utility types, the event loop, strict options, tooling |
| Expert | Mapped and conditional types, soundness holes, evaluation order, engine details |

## Part 1 — The basics

Primitive types are `string`, `number`, `boolean`, `bigint`, `symbol`, `null` and `undefined`. A `number` is a 64-bit float: `0.1 + 0.2 === 0.3` is `false`. Arrays are `number[]` or `Array<number>`, tuples `[string, number]`. A literal type such as `"GET"` allows only that value, and `const` infers literal types where `let` widens them.

Array methods: `map`, `filter` and `slice` return a new array; `push`, `splice`, `reverse` and `sort` change it in place. `sort` without a comparator compares as strings: `[10, 9, 1].sort()` gives `[1, 10, 9]`.

## Part 2 — Functions and closures

Parameters can be optional (`x?: number`), have defaults, or collect the rest (`...xs: number[]`). A return type is inferred but worth writing on exported functions. Overloads give several signatures to one implementation.

A closure keeps the variables of the scope where it was created. `let` in a loop creates a new binding per iteration; `var` shares one:

```ts
const fns: Array<() => number> = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
console.log(fns.map((f) => f()));
```

This logs `[3, 3, 3]`; with `let` it logs `[0, 1, 2]`.

## Part 3 — Objects, interfaces, classes

TypeScript is structurally typed: an object fits a type if it has the right members, whatever its name. An object literal passed directly is checked for extra properties; the same object through a variable is not. `interface` and `type` both describe shapes; interfaces can be merged and extended, types can express unions.

Classes add `private`, `protected`, `readonly` and parameter properties (`constructor(private name: string)`). `private` is a compile-time check; `#name` is private at run time too. Field initialisers run before the constructor body, and in a subclass after `super()` returns.

## Part 4 — Unions and narrowing

A union `string | number` must be narrowed before use. The compiler narrows with `typeof`, `instanceof`, `in`, equality checks, and a discriminant field:

```ts
type Shape = { kind: "circle"; r: number } | { kind: "square"; side: number };
function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.r ** 2;
    case "square": return s.side ** 2;
  }
}
```

A user-defined guard returns `x is T`. `typeof null` is `"object"` and `typeof []` too, so check `Array.isArray`. Assigning the leftover case to `never` makes the compiler report a missing case.

## Part 5 — JavaScript at run time

- `==` converts types, `===` does not; use `===`.
- `??` falls back only on `null` and `undefined`, `||` on every falsy value such as `0` or `""`; `?.` stops on `null` or `undefined`.
- Objects and arrays are passed by reference; the spread `{...obj}` copies only one level, `structuredClone` copies deeply.
- The event loop runs the current script, then every microtask (`Promise` callbacks, `await` continuations), then the next macrotask (`setTimeout`). So `setTimeout(f, 0)` runs after a resolved promise's `then`.
- `async` functions return a promise; an `await` inside a `forEach` callback does not make the loop wait.

## Part 6 — Tooling and strictness

`tsc` compiles using `tsconfig.json`. `strict` turns on `strictNullChecks`, `noImplicitAny` and the other checks; `noUncheckedIndexedAccess` adds `undefined` to indexed reads. ES modules use `import` and `export`; `import type` imports a type that disappears from the output. Type definitions for JavaScript packages come from `@types/…`. Bundlers such as Vite and runners such as `tsx` strip types without checking them, so run `tsc --noEmit` in CI.

## Part 7 — Generics and utility types

A generic keeps the link between input and output: `function first<T>(xs: T[]): T | undefined`. Constrain it with `extends`: `<T extends { id: number }>`. Built-in utility types:

| Type | Gives |
|---|---|
| `Partial<T>` | Every property optional |
| `Required<T>` | Every property required |
| `Pick<T, K>` | Only the keys `K` |
| `Omit<T, K>` | All keys except `K` |
| `Record<K, V>` | An object with keys `K` and values `V` |
| `ReturnType<F>` | The return type of a function type |

## Part 8 — Type-level programming

A mapped type rebuilds an object type key by key: `{ [K in keyof T]: T[K] | null }`. A conditional type chooses: `T extends string ? "text" : "other"`, and it distributes over unions. `infer` captures a part: `T extends Promise<infer U> ? U : T`. Template literal types build strings from other types, such as `on${Capitalize<E>}` for event names. The type system is deliberately unsound in places — `any`, type assertions, method parameter bivariance, array covariance — so a program can type-check and still fail.

## Sources

| Topic | Free reference |
|---|---|
| The language | [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) |
| Compiler options | [TSConfig reference](https://www.typescriptlang.org/tsconfig) |
| JavaScript | [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) |
| The event loop | [MDN, The event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop) |
