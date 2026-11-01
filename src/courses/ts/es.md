# TypeScript — lo esencial del test

## Cómo usar este curso

Este curso acompaña al test de TypeScript. Muchas preguntas muestran un fragmento y preguntan qué muestra o qué dice el compilador. TypeScript solo comprueba tipos: en ejecución es JavaScript, así que la mitad del test trata del propio JavaScript. Pruebe los fragmentos en el [TypeScript Playground](https://www.typescriptlang.org/play).

| Nivel | Lo que pide |
|---|---|
| Principiante | Tipos primitivos, arrays, objetos, funciones, `let` y `const` |
| Intermedio | Interfaces, uniones y estrechamiento, clases, módulos, `async` |
| Avanzado | Genéricos, tipos utilitarios, el bucle de eventos, opciones estrictas, herramientas |
| Experto | Tipos mapeados y condicionales, agujeros de solidez, orden de evaluación, detalles de los motores |

## Parte 1 — Lo básico

Los tipos primitivos son `string`, `number`, `boolean`, `bigint`, `symbol`, `null` y `undefined`. Un `number` es un flotante de 64 bits: `0.1 + 0.2 === 0.3` es `false`. Los arrays se escriben `number[]` o `Array<number>`, las tuplas `[string, number]`. Un tipo literal como `"GET"` solo admite ese valor, y `const` infiere tipos literales donde `let` los ensancha.

Métodos de array: `map`, `filter` y `slice` devuelven un array nuevo; `push`, `splice`, `reverse` y `sort` lo modifican en su sitio. `sort` sin comparador compara como cadenas: `[10, 9, 1].sort()` da `[1, 10, 9]`.

## Parte 2 — Funciones y closures

Los parámetros pueden ser opcionales (`x?: number`), tener valores por defecto o recoger el resto (`...xs: number[]`). El tipo de retorno se infiere, pero conviene escribirlo en las funciones exportadas. Las sobrecargas dan varias firmas a una sola implementación.

Una closure conserva las variables del ámbito donde se creó. `let` en un bucle crea un enlace nuevo en cada iteración; `var` comparte uno solo:

```ts
const fns: Array<() => number> = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
console.log(fns.map((f) => f()));
```

Esto muestra `[3, 3, 3]`; con `let` muestra `[0, 1, 2]`.

## Parte 3 — Objetos, interfaces, clases

TypeScript tiene tipado estructural: un objeto encaja en un tipo si tiene los miembros adecuados, se llame como se llame. Un literal de objeto pasado directamente se comprueba contra propiedades de más; el mismo objeto pasado por una variable, no. `interface` y `type` describen formas; las interfaces se pueden fusionar y extender, los tipos pueden expresar uniones.

Las clases añaden `private`, `protected`, `readonly` y las propiedades de parámetro (`constructor(private name: string)`). `private` es una comprobación al compilar; `#name` es privado también en ejecución. Los inicializadores de campos se ejecutan antes del cuerpo del constructor, y en una subclase después de que vuelva `super()`.

## Parte 4 — Uniones y estrechamiento

Una unión `string | number` debe estrecharse antes de usarla. El compilador estrecha con `typeof`, `instanceof`, `in`, las comparaciones de igualdad y un campo discriminante:

```ts
type Shape = { kind: "circle"; r: number } | { kind: "square"; side: number };
function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.r ** 2;
    case "square": return s.side ** 2;
  }
}
```

Una guarda definida por el usuario devuelve `x is T`. `typeof null` es `"object"`, igual que `typeof []`, así que compruebe con `Array.isArray`. Asignar el caso restante a `never` hace que el compilador señale un caso olvidado.

## Parte 5 — JavaScript en ejecución

- `==` convierte tipos, `===` no; use `===`.
- `??` solo recurre a la alternativa con `null` y `undefined`, `||` con cualquier valor falso como `0` o `""`; `?.` se detiene en `null` o `undefined`.
- Objetos y arrays se pasan por referencia; la propagación `{...obj}` solo copia un nivel, `structuredClone` copia en profundidad.
- El bucle de eventos ejecuta el script actual, luego todas las microtareas (callbacks de `Promise`, continuaciones de `await`), luego la siguiente macrotarea (`setTimeout`). Así `setTimeout(f, 0)` se ejecuta después del `then` de una promesa resuelta.
- Las funciones `async` devuelven una promesa; un `await` dentro de un callback de `forEach` no hace esperar al bucle.

## Parte 6 — Herramientas y rigor

`tsc` compila según `tsconfig.json`. `strict` activa `strictNullChecks`, `noImplicitAny` y las demás comprobaciones; `noUncheckedIndexedAccess` añade `undefined` a las lecturas indexadas. Los módulos ES usan `import` y `export`; `import type` importa un tipo que desaparece de la salida. Las definiciones de tipos de los paquetes JavaScript vienen de `@types/…`. Los bundlers como Vite y los ejecutores como `tsx` quitan los tipos sin comprobarlos, así que ejecute `tsc --noEmit` en la CI.

## Parte 7 — Genéricos y tipos utilitarios

Un genérico mantiene el vínculo entre entrada y salida: `function first<T>(xs: T[]): T | undefined`. Se restringe con `extends`: `<T extends { id: number }>`. Tipos utilitarios integrados:

| Tipo | Da |
|---|---|
| `Partial<T>` | Todas las propiedades opcionales |
| `Required<T>` | Todas las propiedades obligatorias |
| `Pick<T, K>` | Solo las claves `K` |
| `Omit<T, K>` | Todas las claves salvo `K` |
| `Record<K, V>` | Un objeto con claves `K` y valores `V` |
| `ReturnType<F>` | El tipo de retorno de un tipo de función |

## Parte 8 — Programación a nivel de tipos

Un tipo mapeado reconstruye un tipo objeto clave por clave: `{ [K in keyof T]: T[K] | null }`. Un tipo condicional elige: `T extends string ? "text" : "other"`, y se distribuye sobre las uniones. `infer` captura una parte: `T extends Promise<infer U> ? U : T`. Los tipos de plantilla literal construyen cadenas a partir de otros tipos, como `on${Capitalize<E>}` para nombres de eventos. El sistema de tipos es deliberadamente no sólido en algunos puntos — `any`, las aserciones de tipo, la bivarianza de los parámetros de método, la covarianza de los arrays — así que un programa puede pasar la comprobación y aun así fallar.

## Fuentes

| Tema | Referencia gratuita |
|---|---|
| El lenguaje | [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) |
| Opciones del compilador | [Referencia de TSConfig](https://www.typescriptlang.org/tsconfig) |
| JavaScript | [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) |
| El bucle de eventos | [MDN, The event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop) |
