# React — the essentials of the test

## How to use this course

This course goes with the React test. Many questions show a component and ask what it renders, how many times it renders, or what an effect logs. The examples use function components, hooks and TypeScript.

| Level | What it asks |
|---|---|
| Beginner | JSX, props, `useState`, lists, events |
| Intermediate | Effects and their cleanup, keys, forms, fetching data, typing props |
| Advanced | Batching, memoisation, reconciliation, server components, testing |
| Expert | Effect and cleanup order, Strict Mode, concurrent rendering, layout effects, internals |

## Part 1 — Components and JSX

A component is a function that takes props and returns JSX. JSX is JavaScript: `{expr}` inserts a value, `className` replaces `class`, and a component's name starts with a capital letter. `false`, `null` and `undefined` render nothing, but `0` renders "0", so `{count && <List />}` shows a 0 when the count is empty; write `{count > 0 && <List />}`.

Pass children with `props.children`, and compose small components instead of adding flags. Default values come from destructuring: `function Button({ size = "md" })`.

## Part 2 — State

`useState` returns the current value and a setter. Setting state schedules a new render; the variable keeps its old value until then. When the new state depends on the old one, pass a function:

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

Three `setCount(count + 1)` calls would add only 1. Never mutate state: build a new object or array. Keep the minimum state and compute the rest during render. Changing a component's `key` resets its state. For state outside React, subscribe with `useSyncExternalStore`.

## Part 3 — Effects

An effect synchronises with something outside React — a subscription, a timer, the document title — after the render is shown. Its dependency array decides when it reruns: after every render without it, once with `[]`, when a listed value changes otherwise. The cleanup function runs before the next run and when the component unmounts.

```tsx
useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000);
  return () => clearInterval(id);
}, []);
```

Parents' effects run after their children's. In development, Strict Mode mounts, unmounts and mounts again, so every effect runs, cleans up and runs once more: a missing cleanup shows up at once. `useLayoutEffect` runs before the browser paints, for measuring layout. A `useRef` holds a value across renders without causing one. You do not need an effect to derive data from props or to respond to a click.

## Part 4 — Rendering

A component renders again when its state changes or its parent renders. React compares the new tree with the old one: a different element type replaces the subtree, the same type updates it. In a list, `key` tells items apart; an array index as key breaks state when items are reordered or removed.

Several state updates in one event are batched into a single render, even in timeouts and promises since React 18. `memo` skips a child whose props are unchanged, which only helps if the props are stable: an inline object or function is new on every render, hence `useMemo` and `useCallback`.

## Part 5 — Data and forms

Fetching in an effect needs a loading state, an error state and protection against a stale response arriving last; libraries such as TanStack Query handle this. Controlled inputs take `value` and `onChange`; uncontrolled ones read the DOM on submit. React 19 form actions pass a function to `<form action>`, with `useActionState` for the result and `useFormStatus` for the pending state. Server components run on the server and send their result; `Suspense` shows a fallback while a part is streaming in.

## Part 6 — Typing

Type props with an interface or type: `function Card({ title }: { title: string })`. `React.ReactNode` covers anything renderable. Events have types such as `React.ChangeEvent<HTMLInputElement>`. `useState<string | null>(null)` sets a type the initial value cannot give, and `useRef<HTMLDivElement>(null)` types a DOM reference. Generic components keep the item type: `function List<T>({ items, render }: …)`.

## Part 7 — Tooling

`npm create vite@latest` starts a React project with TypeScript and a fast development server with hot reloading. `npm run build` writes static files to `dist/`. Frameworks such as Next.js and React Router add routing, server rendering and data loading. React DevTools show the component tree, props, state and why a component rendered.

## Part 8 — Testing

Test behaviour, not implementation: React Testing Library renders a component and queries it as a user would, by role and text. `userEvent` simulates typing and clicks; `findBy…` waits for something asynchronous. Vitest or Jest run the tests; Playwright drives a real browser for end-to-end tests. Most tests should be fast component tests, with a few end-to-end tests over the key paths.

## Sources

| Topic | Free reference |
|---|---|
| React and hooks | [react.dev, Learn](https://react.dev/learn) |
| API reference | [react.dev, Reference](https://react.dev/reference/react) |
| Effects | [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) |
| Testing | [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) |
| Vite | [Vite guide](https://vite.dev/guide/) |
