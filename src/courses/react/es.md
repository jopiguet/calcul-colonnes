# React — lo esencial del test

## Cómo usar este curso

Este curso acompaña al test de React. Muchas preguntas muestran un componente y preguntan qué renderiza, cuántas veces se renderiza o qué registra un efecto. Los ejemplos usan componentes de función, hooks y TypeScript.

| Nivel | Lo que pide |
|---|---|
| Principiante | JSX, props, `useState`, listas, eventos |
| Intermedio | Los efectos y su limpieza, las claves, los formularios, la carga de datos, el tipado de props |
| Avanzado | Agrupación de actualizaciones, memoización, reconciliación, componentes de servidor, tests |
| Experto | Orden de efectos y limpiezas, Strict Mode, renderizado concurrente, efectos de diseño, funcionamiento interno |

## Parte 1 — Componentes y JSX

Un componente es una función que recibe props y devuelve JSX. JSX es JavaScript: `{expr}` inserta un valor, `className` sustituye a `class`, y el nombre de un componente empieza por mayúscula. `false`, `null` y `undefined` no muestran nada, pero `0` muestra «0», así que `{count && <List />}` enseña un 0 cuando la cuenta está vacía; escriba `{count > 0 && <List />}`.

Pase hijos con `props.children`, y componga componentes pequeños en lugar de añadir indicadores. Los valores por defecto vienen de la desestructuración: `function Button({ size = "md" })`.

## Parte 2 — El estado

`useState` devuelve el valor actual y una función para cambiarlo. Cambiar el estado programa un nuevo renderizado; la variable conserva su valor anterior hasta entonces. Cuando el nuevo estado depende del anterior, pase una función:

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  const addThree = () => {
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    setCount((c) => c + 1);
  };
  return <button onClick={addThree}>{count}</button>;
}
```

Tres llamadas `setCount(count + 1)` solo sumarían 1. No mute nunca el estado: construya un objeto o array nuevo. Guarde el mínimo de estado y calcule el resto durante el renderizado. Cambiar la `key` de un componente reinicia su estado. Para un estado externo a React, suscríbase con `useSyncExternalStore`.

## Parte 3 — Los efectos

Un efecto sincroniza con algo externo a React — una suscripción, un temporizador, el título del documento — después de mostrar el renderizado. Su array de dependencias decide cuándo se repite: tras cada renderizado si no lo hay, una vez con `[]`, y si no cuando cambia un valor de la lista. La función de limpieza se ejecuta antes de la siguiente ejecución y al desmontar el componente.

```tsx
useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000);
  return () => clearInterval(id);
}, []);
```

Los efectos de los padres se ejecutan después de los de sus hijos. En desarrollo, Strict Mode monta, desmonta y vuelve a montar, así que cada efecto se ejecuta, se limpia y se ejecuta otra vez: una limpieza olvidada se nota enseguida. `useLayoutEffect` se ejecuta antes de que el navegador pinte, para medir el diseño. Un `useRef` guarda un valor entre renderizados sin provocar ninguno. No hace falta un efecto para derivar datos de las props ni para responder a un clic.

## Parte 4 — El renderizado

Un componente se vuelve a renderizar cuando cambia su estado o se renderiza su padre. React compara el árbol nuevo con el anterior: un tipo de elemento distinto sustituye el subárbol, el mismo tipo lo actualiza. En una lista, `key` distingue los elementos; un índice de array como clave rompe el estado cuando los elementos se reordenan o se eliminan.

Varias actualizaciones de estado en un mismo evento se agrupan en un solo renderizado, incluso en temporizadores y promesas desde React 18. `memo` se salta un hijo cuyas props no han cambiado, lo que solo ayuda si las props son estables: un objeto o una función escritos en línea son nuevos en cada renderizado, de ahí `useMemo` y `useCallback`.

## Parte 5 — Datos y formularios

Cargar datos en un efecto exige un estado de carga, un estado de error y protección contra una respuesta obsoleta que llega la última; bibliotecas como TanStack Query se encargan de ello. Los campos controlados reciben `value` y `onChange`; los no controlados leen el DOM al enviar. Las acciones de formulario de React 19 pasan una función a `<form action>`, con `useActionState` para el resultado y `useFormStatus` para el estado pendiente. Los componentes de servidor se ejecutan en el servidor y envían su resultado; `Suspense` muestra un contenido alternativo mientras una parte llega en streaming.

## Parte 6 — El tipado

Tipe las props con una interfaz o un tipo: `function Card({ title }: { title: string })`. `React.ReactNode` cubre todo lo que se puede renderizar. Los eventos tienen tipos como `React.ChangeEvent<HTMLInputElement>`. `useState<string | null>(null)` fija un tipo que el valor inicial no puede dar, y `useRef<HTMLDivElement>(null)` tipa una referencia al DOM. Los componentes genéricos conservan el tipo de los elementos: `function List<T>({ items, render }: …)`.

## Parte 7 — Las herramientas

`npm create vite@latest` crea un proyecto React con TypeScript y un servidor de desarrollo rápido con recarga en caliente. `npm run build` escribe archivos estáticos en `dist/`. Frameworks como Next.js y React Router añaden enrutamiento, renderizado en servidor y carga de datos. Las React DevTools muestran el árbol de componentes, las props, el estado y el motivo de un renderizado.

## Parte 8 — Los tests

Pruebe el comportamiento, no la implementación: React Testing Library renderiza un componente y lo consulta como lo haría un usuario, por rol y por texto. `userEvent` simula escritura y clics; `findBy…` espera algo asíncrono. Vitest o Jest ejecutan los tests; Playwright maneja un navegador real para los tests de extremo a extremo. La mayoría de los tests deberían ser tests de componentes rápidos, con unos pocos de extremo a extremo sobre los recorridos clave.

## Fuentes

| Tema | Referencia gratuita |
|---|---|
| React y los hooks | [react.dev, Learn](https://react.dev/learn) |
| Referencia de la API | [react.dev, Reference](https://react.dev/reference/react) |
| Los efectos | [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) |
| Los tests | [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) |
| Vite | [Guía de Vite](https://vite.dev/guide/) |
