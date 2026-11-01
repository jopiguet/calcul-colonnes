# React — l'essentiel du test

## Comment utiliser ce cours

Ce cours accompagne le test React. Beaucoup de questions montrent un composant et demandent ce qu'il affiche, combien de fois il est rendu ou ce qu'un effet journalise. Les exemples utilisent des composants fonctions, des hooks et TypeScript.

| Niveau | Ce qu'il demande |
|---|---|
| Débutant | JSX, props, `useState`, listes, événements |
| Intermédiaire | Les effets et leur nettoyage, les clés, les formulaires, le chargement de données, le typage des props |
| Avancé | Regroupement des mises à jour, mémoïsation, réconciliation, composants serveur, tests |
| Expert | Ordre des effets et des nettoyages, Strict Mode, rendu concurrent, effets de mise en page, fonctionnement interne |

## Partie 1 — Composants et JSX

Un composant est une fonction qui reçoit des props et renvoie du JSX. Le JSX est du JavaScript : `{expr}` insère une valeur, `className` remplace `class`, et le nom d'un composant commence par une majuscule. `false`, `null` et `undefined` n'affichent rien, mais `0` affiche « 0 » : `{count && <List />}` montre donc un 0 quand le compte est vide ; écrivez `{count > 0 && <List />}`.

Passez des enfants avec `props.children`, et composez de petits composants plutôt que d'ajouter des drapeaux. Les valeurs par défaut viennent de la déstructuration : `function Button({ size = "md" })`.

## Partie 2 — L'état

`useState` renvoie la valeur courante et une fonction de mise à jour. Changer l'état programme un nouveau rendu ; la variable garde son ancienne valeur jusque-là. Quand le nouvel état dépend de l'ancien, passez une fonction :

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

Trois appels `setCount(count + 1)` n'ajouteraient que 1. Ne modifiez jamais l'état : construisez un nouvel objet ou tableau. Gardez le minimum d'état et calculez le reste pendant le rendu. Changer la `key` d'un composant réinitialise son état. Pour un état extérieur à React, abonnez-vous avec `useSyncExternalStore`.

## Partie 3 — Les effets

Un effet synchronise avec quelque chose d'extérieur à React — un abonnement, une minuterie, le titre du document — après l'affichage du rendu. Son tableau de dépendances décide quand il se relance : après chaque rendu sans tableau, une seule fois avec `[]`, sinon quand une valeur listée change. La fonction de nettoyage s'exécute avant l'exécution suivante et au démontage du composant.

```tsx
useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000);
  return () => clearInterval(id);
}, []);
```

Les effets des parents s'exécutent après ceux de leurs enfants. En développement, Strict Mode monte, démonte puis remonte : chaque effet s'exécute, se nettoie et s'exécute encore une fois, si bien qu'un nettoyage oublié se voit tout de suite. `useLayoutEffect` s'exécute avant que le navigateur ne peigne, pour mesurer la mise en page. Un `useRef` garde une valeur entre les rendus sans en provoquer. Il ne faut pas d'effet pour dériver des données des props ni pour réagir à un clic.

## Partie 4 — Le rendu

Un composant est rendu à nouveau quand son état change ou que son parent est rendu. React compare le nouvel arbre à l'ancien : un type d'élément différent remplace le sous-arbre, le même type le met à jour. Dans une liste, `key` distingue les éléments ; un indice de tableau comme clé casse l'état quand les éléments sont réordonnés ou retirés.

Plusieurs mises à jour d'état dans un même événement sont regroupées en un seul rendu, même dans les minuteries et les promesses depuis React 18. `memo` saute un enfant dont les props n'ont pas changé, ce qui n'aide que si les props sont stables : un objet ou une fonction écrits en ligne sont nouveaux à chaque rendu, d'où `useMemo` et `useCallback`.

## Partie 5 — Données et formulaires

Charger des données dans un effet demande un état de chargement, un état d'erreur et une protection contre une réponse périmée qui arrive en dernier ; des bibliothèques comme TanStack Query s'en chargent. Les champs contrôlés prennent `value` et `onChange` ; les champs non contrôlés lisent le DOM à l'envoi. Les actions de formulaire de React 19 passent une fonction à `<form action>`, avec `useActionState` pour le résultat et `useFormStatus` pour l'état en attente. Les composants serveur s'exécutent sur le serveur et envoient leur résultat ; `Suspense` affiche un contenu de repli pendant qu'une partie arrive en flux.

## Partie 6 — Le typage

Typez les props avec une interface ou un type : `function Card({ title }: { title: string })`. `React.ReactNode` couvre tout ce qui peut être affiché. Les événements ont des types comme `React.ChangeEvent<HTMLInputElement>`. `useState<string | null>(null)` fixe un type que la valeur initiale ne peut pas donner, et `useRef<HTMLDivElement>(null)` type une référence au DOM. Les composants génériques gardent le type des éléments : `function List<T>({ items, render }: …)`.

## Partie 7 — L'outillage

`npm create vite@latest` démarre un projet React avec TypeScript et un serveur de développement rapide avec rechargement à chaud. `npm run build` écrit des fichiers statiques dans `dist/`. Des frameworks comme Next.js et React Router ajoutent le routage, le rendu serveur et le chargement de données. Les React DevTools montrent l'arbre des composants, les props, l'état et la raison d'un rendu.

## Partie 8 — Les tests

Testez le comportement, pas l'implémentation : React Testing Library rend un composant et l'interroge comme le ferait un utilisateur, par rôle et par texte. `userEvent` simule la saisie et les clics ; `findBy…` attend quelque chose d'asynchrone. Vitest ou Jest lancent les tests ; Playwright pilote un vrai navigateur pour les tests de bout en bout. La plupart des tests devraient être des tests de composants rapides, avec quelques tests de bout en bout sur les parcours clés.

## Sources

| Thème | Référence gratuite |
|---|---|
| React et les hooks | [react.dev, Learn](https://react.dev/learn) |
| Référence de l'API | [react.dev, Reference](https://react.dev/reference/react) |
| Les effets | [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) |
| Les tests | [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) |
| Vite | [Guide de Vite](https://vite.dev/guide/) |
