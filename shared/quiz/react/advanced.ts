/**
 * React, Avancé: component patterns, state outside React, effects done right,
 * performance and concurrency, data on the server, typing reusable
 * components, building and deploying, end-to-end tests.
 */
import type { LinuxQuestion as ReactQuestion } from "../linux/types";

const patterns: ReactQuestion[] = [
  {
    id: "re-pat-01",
    q: ["In React 19, how does a function component receive a `ref` from its parent?", "Dans React 19, comment un composant fonction reçoit-il une `ref` de son parent ?", "En React 19, ¿cómo recibe un componente de función una `ref` de su padre?"],
    a: ["As an ordinary prop, `ref`, to pass on to an element", "Comme une prop ordinaire, `ref`, à transmettre à un élément", "Como una prop normal, `ref`, para pasarla a un elemento"],
    w: [["Only through `forwardRef`", "Seulement par `forwardRef`", "Solo mediante `forwardRef`"], ["It cannot: refs are for classes", "Impossible : les refs sont pour les classes", "No puede: las refs son para clases"], ["Through `this.refs`", "Par `this.refs`", "Mediante `this.refs`"]],
    e: [
      "`function Input({ ref, ...props }) { return <input ref={ref} {...props} /> }` works in React 19; `forwardRef` is no longer needed and will be deprecated. React 19 also lets a ref callback return a cleanup function, called when the element is removed.",
      "`function Input({ ref, ...props }) { return <input ref={ref} {...props} /> }` fonctionne dans React 19 ; `forwardRef` n'est plus nécessaire et sera déprécié. React 19 permet aussi à une ref fonction de renvoyer un nettoyage, appelé quand l'élément est retiré.",
      "`function Input({ ref, ...props }) { return <input ref={ref} {...props} /> }` funciona en React 19; `forwardRef` ya no hace falta y quedará obsoleto. React 19 también permite que una ref de función devuelva una limpieza, llamada cuando se quita el elemento.",
    ],
  },
  {
    id: "re-pat-02",
    q: ["What catches an error thrown while rendering a part of the tree?", "Qu'est-ce qui attrape une erreur levée pendant le rendu d'une partie de l'arbre ?", "¿Qué atrapa un error lanzado al renderizar una parte del árbol?"],
    a: ["An error boundary above it: a class with `getDerivedStateFromError` (or a library such as `react-error-boundary`)", "Une error boundary au-dessus : une classe avec `getDerivedStateFromError` (ou une bibliothèque comme `react-error-boundary`)", "Un error boundary por encima: una clase con `getDerivedStateFromError` (o una biblioteca como `react-error-boundary`)"],
    w: [["A `try`/`catch` around the JSX in the parent", "Un `try`/`catch` autour du JSX dans le parent", "Un `try`/`catch` alrededor del JSX en el padre"], ["`useEffect` with an error argument", "`useEffect` avec un argument d'erreur", "`useEffect` con un argumento de error"], ["`window.onerror`, which lets React keep the tree", "`window.onerror`, qui permet à React de garder l'arbre", "`window.onerror`, que permite a React mantener el árbol"]],
    e: [
      "A `try`/`catch` in the parent only wraps the creation of elements; the child renders later. Without a boundary, React removes the whole tree. Boundaries do not catch errors in event handlers or async code: those are caught where they happen. React 19's `createRoot` takes `onCaughtError` and `onUncaughtError` for reporting.",
      "Un `try`/`catch` dans le parent n'entoure que la création des éléments ; l'enfant est rendu plus tard. Sans boundary, React retire tout l'arbre. Les boundaries n'attrapent pas les erreurs des gestionnaires d'événements ni du code asynchrone : celles-ci s'attrapent là où elles se produisent. Le `createRoot` de React 19 accepte `onCaughtError` et `onUncaughtError` pour les signaler.",
      "Un `try`/`catch` en el padre solo envuelve la creación de los elementos; el hijo se renderiza después. Sin boundary, React quita todo el árbol. Los boundaries no atrapan errores de manejadores de eventos ni de código asíncrono: esos se atrapan donde ocurren. El `createRoot` de React 19 acepta `onCaughtError` y `onUncaughtError` para notificarlos.",
    ],
  },
  {
    id: "re-pat-03",
    q: ["`const Chart = lazy(() => import(\"./Chart\"))`: what else is needed?", "`const Chart = lazy(() => import(\"./Chart\"))` : que faut-il de plus ?", "`const Chart = lazy(() => import(\"./Chart\"))`: ¿qué más hace falta?"],
    a: ["A `<Suspense fallback={...}>` above `<Chart />`, shown while its code loads", "Un `<Suspense fallback={...}>` au-dessus de `<Chart />`, affiché pendant le chargement de son code", "Un `<Suspense fallback={...}>` encima de `<Chart />`, mostrado mientras se carga su código"],
    w: [["Nothing: the component renders empty until loaded", "Rien : le composant reste vide jusqu'au chargement", "Nada: el componente queda vacío hasta que carga"], ["An effect that calls `Chart.load()`", "Un effet qui appelle `Chart.load()`", "Un efecto que llame a `Chart.load()`"], ["A `<script>` tag for the chunk", "Une balise `<script>` pour le morceau", "Una etiqueta `<script>` para el fragmento"]],
    e: [
      "The bundler puts `Chart` and its dependencies in a separate chunk, loaded on first render. Until then the component suspends and the nearest Suspense boundary shows its fallback. The module must have a default export.",
      "Le bundler place `Chart` et ses dépendances dans un morceau séparé, chargé au premier rendu. D'ici là, le composant suspend et la Suspense boundary la plus proche affiche son fallback. Le module doit avoir un export par défaut.",
      "El bundler pone `Chart` y sus dependencias en un fragmento aparte, cargado en el primer renderizado. Hasta entonces el componente se suspende y el Suspense más cercano muestra su fallback. El módulo debe tener un export por defecto.",
    ],
  },
  {
    id: "re-pat-04",
    q: ["`<Tabs><Tabs.List>…</Tabs.List><Tabs.Panel>…</Tabs.Panel></Tabs>`: how do the parts share the active tab?", "`<Tabs><Tabs.List>…</Tabs.List><Tabs.Panel>…</Tabs.Panel></Tabs>` : comment les parties partagent-elles l'onglet actif ?", "`<Tabs><Tabs.List>…</Tabs.List><Tabs.Panel>…</Tabs.Panel></Tabs>`: ¿cómo comparten las partes la pestaña activa?"],
    a: ["Through a context that `Tabs` provides and its sub-components read", "Par un contexte que `Tabs` fournit et que ses sous-composants lisent", "Mediante un contexto que `Tabs` proporciona y sus subcomponentes leen"],
    w: [["Through global variables", "Par des variables globales", "Mediante variables globales"], ["`Tabs` clones each child with `cloneElement`, whatever their depth", "`Tabs` clone chaque enfant avec `cloneElement`, quelle que soit sa profondeur", "`Tabs` clona cada hijo con `cloneElement`, sea cual sea su profundidad"], ["Each part keeps its own copy of the active tab", "Chaque partie garde sa propre copie de l'onglet actif", "Cada parte guarda su propia copia de la pestaña activa"]],
    e: [
      "Compound components share implicit state through context, so the user arranges the parts freely, with wrappers in between. `cloneElement` only reaches direct children and is fragile. Libraries such as Radix and React Aria are built this way, with accessibility included.",
      "Les composants composés partagent un état implicite par contexte : l'utilisateur dispose les parties librement, avec des enveloppes entre elles. `cloneElement` n'atteint que les enfants directs et reste fragile. Des bibliothèques comme Radix et React Aria sont construites ainsi, accessibilité comprise.",
      "Los componentes compuestos comparten estado implícito mediante contexto, así que el usuario coloca las partes libremente, con envoltorios entre medias. `cloneElement` solo llega a los hijos directos y es frágil. Bibliotecas como Radix y React Aria están hechas así, con la accesibilidad incluida.",
    ],
  },
];

const externalState: ReactQuestion[] = [
  {
    id: "re-ext-01",
    q: ["Which hook subscribes a component to a store outside React (a small store, `navigator.onLine`)?", "Quel hook abonne un composant à un store hors de React (un petit store, `navigator.onLine`) ?", "¿Qué hook suscribe un componente a un store fuera de React (un store pequeño, `navigator.onLine`)?"],
    a: ["`useSyncExternalStore(subscribe, getSnapshot)`", "`useSyncExternalStore(subscribe, getSnapshot)`", "`useSyncExternalStore(subscribe, getSnapshot)`"],
    w: [["`useEffect` that copies the value into state, always fine", "`useEffect` qui copie la valeur dans l'état, toujours correct", "`useEffect` que copia el valor al estado, siempre correcto"], ["`useContext`", "`useContext`", "`useContext`"], ["`useMemo` with the store as a dependency", "`useMemo` avec le store en dépendance", "`useMemo` con el store como dependencia"]],
    e: [
      "It reads a consistent value during concurrent rendering (no tearing, where parts of the screen show different versions) and supports server rendering with a third argument. `getSnapshot` must return the same value while nothing changed: a new object each call loops.",
      "Il lit une valeur cohérente pendant le rendu concurrent (pas de tearing, où des parties de l'écran montrent des versions différentes) et gère le rendu serveur avec un troisième argument. `getSnapshot` doit renvoyer la même valeur tant que rien n'a changé : un nouvel objet à chaque appel boucle.",
      "Lee un valor coherente durante el renderizado concurrente (sin tearing, donde partes de la pantalla muestran versiones distintas) y admite renderizado en servidor con un tercer argumento. `getSnapshot` debe devolver el mismo valor mientras nada cambie: un objeto nuevo en cada llamada entra en bucle.",
    ],
  },
  {
    id: "re-ext-02",
    q: ["The current filter and page of a list should survive a reload and be shareable. Where do they live?", "Le filtre et la page actuels d'une liste doivent survivre à un rechargement et pouvoir se partager. Où vivent-ils ?", "El filtro y la página actuales de una lista deben sobrevivir a una recarga y poder compartirse. ¿Dónde viven?"],
    a: ["In the URL (search parameters), read by the router", "Dans l'URL (paramètres de recherche), lue par le routeur", "En la URL (parámetros de búsqueda), leída por el router"],
    w: [["In a context at the root", "Dans un contexte à la racine", "En un contexto en la raíz"], ["In `useState` of the list", "Dans un `useState` de la liste", "En un `useState` de la lista"], ["In a cookie, read by an effect", "Dans un cookie, lu par un effet", "En una cookie, leída por un efecto"]],
    e: [
      "The URL is state the browser already keeps: back and forward work, links can be shared and bookmarked. Component state and context vanish on reload. Keep there what defines the view; keep drafts and open menus in local state.",
      "L'URL est un état que le navigateur garde déjà : précédent et suivant marchent, les liens se partagent et se mettent en favoris. L'état des composants et le contexte disparaissent au rechargement. Y mettre ce qui définit la vue ; garder brouillons et menus ouverts dans l'état local.",
      "La URL es un estado que el navegador ya guarda: atrás y adelante funcionan, los enlaces se comparten y se guardan en marcadores. El estado de los componentes y el contexto desaparecen al recargar. Poner ahí lo que define la vista; dejar borradores y menús abiertos en el estado local.",
    ],
  },
  {
    id: "re-ext-03",
    q: ["Server data (a user list from the API) is copied into a global store such as Redux. What is the usual criticism?", "Des données serveur (une liste d'utilisateurs de l'API) sont copiées dans un store global comme Redux. Quelle est la critique habituelle ?", "Datos del servidor (una lista de usuarios de la API) se copian en un store global como Redux. ¿Cuál es la crítica habitual?"],
    a: ["It is a cache in disguise: staleness, refetching and deduplication must be written by hand; a server-state library does them", "C'est un cache déguisé : péremption, rechargement et dédoublonnage s'écrivent à la main ; une bibliothèque d'état serveur les fait", "Es una caché disfrazada: caducidad, recarga y deduplicación se escriben a mano; una biblioteca de estado de servidor las hace"],
    w: [["Redux cannot hold arrays", "Redux ne peut pas contenir de tableaux", "Redux no puede contener arrays"], ["Global stores are always slower than context", "Les stores globaux sont toujours plus lents que le contexte", "Los stores globales siempre son más lentos que el contexto"], ["The data would be lost on every render", "Les données seraient perdues à chaque rendu", "Los datos se perderían en cada renderizado"]],
    e: [
      "Client state (what the user is doing) and server state (a copy of data someone else owns) have different problems. TanStack Query, SWR or a framework's loaders handle the second; what is left for a global store is usually small.",
      "L'état client (ce que fait l'utilisateur) et l'état serveur (une copie de données possédées ailleurs) ont des problèmes différents. TanStack Query, SWR ou les loaders d'un framework gèrent le second ; ce qui reste pour un store global est en général petit.",
      "El estado del cliente (lo que hace el usuario) y el estado del servidor (una copia de datos que posee otro) tienen problemas distintos. TanStack Query, SWR o los loaders de un framework gestionan el segundo; lo que queda para un store global suele ser poco.",
    ],
  },
  {
    id: "re-ext-04",
    q: ["A context provides `{ user, setUser }` built inline at every render. What is the cost?", "Un contexte fournit `{ user, setUser }` construit en ligne à chaque rendu. Quel est le coût ?", "Un contexto proporciona `{ user, setUser }` construido en línea en cada renderizado. ¿Cuál es el coste?"],
    a: ["Every consumer renders whenever the provider renders, since the value is a new object", "Chaque consommateur refait un rendu à chaque rendu du fournisseur, puisque la valeur est un nouvel objet", "Cada consumidor renderiza cada vez que renderiza el proveedor, porque el valor es un objeto nuevo"],
    w: [["None: React compares the object's fields", "Aucun : React compare les champs de l'objet", "Ninguno: React compara los campos del objeto"], ["The context stops updating", "Le contexte cesse de se mettre à jour", "El contexto deja de actualizarse"], ["Only `setUser` is recreated, which is harmless", "Seul `setUser` est recréé, ce qui est sans effet", "Solo se recrea `setUser`, lo que no afecta"]],
    e: [
      "Context compares the value with `Object.is`. Wrap it in `useMemo` (or let the React Compiler do it), or split rarely and often changing parts into two contexts. `memo` on a consumer does not help: reading the context bypasses it.",
      "Le contexte compare la valeur avec `Object.is`. L'envelopper dans `useMemo` (ou laisser le React Compiler le faire), ou séparer en deux contextes ce qui change rarement et souvent. `memo` sur un consommateur n'aide pas : lire le contexte le contourne.",
      "El contexto compara el valor con `Object.is`. Envolverlo en `useMemo` (o dejar que lo haga el React Compiler), o separar en dos contextos lo que cambia poco y lo que cambia a menudo. `memo` en un consumidor no ayuda: leer el contexto lo salta.",
    ],
  },
];

const effectsAdvanced: ReactQuestion[] = [
  {
    id: "re-ea-01",
    q: ["An effect connects to a chat room and logs with the current `theme`. Changing `theme` must not reconnect. What does React 19.2 offer?", "Un effet se connecte à un salon de discussion et journalise avec le `theme` courant. Changer de `theme` ne doit pas reconnecter. Que propose React 19.2 ?", "Un efecto se conecta a una sala de chat y registra con el `theme` actual. Cambiar el `theme` no debe reconectar. ¿Qué ofrece React 19.2?"],
    a: ["`useEffectEvent`: a function that reads the latest `theme`, called from the effect, not listed in its dependencies", "`useEffectEvent` : une fonction qui lit le dernier `theme`, appelée depuis l'effet, absente de ses dépendances", "`useEffectEvent`: una función que lee el último `theme`, llamada desde el efecto, sin listarla en sus dependencias"],
    w: [["Leave `theme` out of the dependencies and silence the linter", "Omettre `theme` des dépendances et faire taire le linter", "Omitir `theme` de las dependencias y silenciar el linter"], ["`useCallback` with `[theme]`", "`useCallback` avec `[theme]`", "`useCallback` con `[theme]`"], ["Move the connection into `useMemo`", "Mettre la connexion dans `useMemo`", "Mover la conexión a `useMemo`"]],
    e: [
      "Effect Events separate the reactive part (the room id, which must reconnect) from the non-reactive part (what happens when a message arrives). Declare them next to the effect and never pass them to other components or list them as dependencies. Omitting a dependency instead freezes a stale `theme`.",
      "Les Effect Events séparent la partie réactive (l'identifiant du salon, qui doit reconnecter) de la partie non réactive (ce qui se passe à l'arrivée d'un message). Les déclarer à côté de l'effet, sans jamais les passer à d'autres composants ni les lister en dépendances. Omettre une dépendance fige au contraire un `theme` périmé.",
      "Los Effect Events separan la parte reactiva (el id de la sala, que debe reconectar) de la no reactiva (lo que pasa al llegar un mensaje). Declararlos junto al efecto, sin pasarlos nunca a otros componentes ni listarlos como dependencias. Omitir una dependencia, en cambio, congela un `theme` desfasado.",
    ],
  },
  {
    id: "re-ea-02",
    q: ["A tooltip measures its size to place itself. Why `useLayoutEffect` rather than `useEffect`?", "Une infobulle mesure sa taille pour se placer. Pourquoi `useLayoutEffect` plutôt que `useEffect` ?", "Un tooltip mide su tamaño para colocarse. ¿Por qué `useLayoutEffect` en vez de `useEffect`?"],
    a: ["It runs before the browser paints, so the corrected position is shown without a visible jump", "Il s'exécute avant que le navigateur ne peigne, donc la position corrigée s'affiche sans saut visible", "Se ejecuta antes de que el navegador pinte, así que la posición corregida se muestra sin salto visible"],
    w: [["It runs before the render, with the props", "Il s'exécute avant le rendu, avec les props", "Se ejecuta antes del renderizado, con las props"], ["It is faster in every case", "Il est plus rapide dans tous les cas", "Es más rápido en todos los casos"], ["`useEffect` cannot read the DOM", "`useEffect` ne peut pas lire le DOM", "`useEffect` no puede leer el DOM"]],
    e: [
      "Both run after React updates the DOM; a layout effect runs synchronously before paint and blocks it, so it is for measuring and adjusting layout only. It does nothing during server rendering. Most effects should be `useEffect`, which does not delay the screen.",
      "Les deux s'exécutent après la mise à jour du DOM ; un effet de layout s'exécute de façon synchrone avant la peinture et la bloque : il sert seulement à mesurer et ajuster la mise en page. Il ne fait rien pendant le rendu serveur. La plupart des effets doivent être des `useEffect`, qui ne retardent pas l'écran.",
      "Ambos se ejecutan tras actualizar el DOM; un efecto de layout se ejecuta de forma síncrona antes del pintado y lo bloquea, así que sirve solo para medir y ajustar el diseño. No hace nada en el renderizado en servidor. La mayoría de los efectos deben ser `useEffect`, que no retrasa la pantalla.",
    ],
  },
  {
    id: "re-ea-03",
    q: ["`<Activity mode=\"hidden\">` (React 19.2) wraps a tab that is not shown. What happens to it?", "`<Activity mode=\"hidden\">` (React 19.2) entoure un onglet qui n'est pas affiché. Que lui arrive-t-il ?", "`<Activity mode=\"hidden\">` (React 19.2) envuelve una pestaña que no se muestra. ¿Qué le pasa?"],
    a: ["It is hidden and its effects are cleaned up, but its state is kept and it can render in the background at low priority", "Il est masqué et ses effets sont nettoyés, mais son état est gardé et il peut se rendre en arrière-plan en basse priorité", "Se oculta y sus efectos se limpian, pero su estado se conserva y puede renderizarse en segundo plano con baja prioridad"],
    w: [["It is unmounted, state included", "Il est démonté, état compris", "Se desmonta, estado incluido"], ["It keeps running its effects, only invisible", "Il continue d'exécuter ses effets, simplement invisible", "Sigue ejecutando sus efectos, solo que invisible"], ["It is rendered on the server instead", "Il est rendu sur le serveur à la place", "Se renderiza en el servidor en su lugar"]],
    e: [
      "Activity sits between conditional rendering (state lost) and CSS hiding (effects still running): returning to the tab is instant and keeps form drafts and scroll, while subscriptions are paused. It can also pre-render a screen the user is likely to open next.",
      "Activity se situe entre le rendu conditionnel (état perdu) et le masquage CSS (effets toujours actifs) : revenir à l'onglet est immédiat et garde brouillons et défilement, tandis que les abonnements sont suspendus. Il peut aussi pré-rendre un écran que l'utilisateur ouvrira sans doute.",
      "Activity está entre el renderizado condicional (estado perdido) y ocultar con CSS (efectos aún activos): volver a la pestaña es inmediato y conserva borradores y desplazamiento, mientras las suscripciones se pausan. También puede prerenderizar una pantalla que el usuario probablemente abrirá.",
    ],
  },
  {
    id: "re-ea-04",
    q: ["Why is \"fetch in `useEffect` with `[]`\" fragile as an app's data strategy?", "Pourquoi « charger dans `useEffect` avec `[]` » est-il fragile comme stratégie de données d'une application ?", "¿Por qué «cargar en `useEffect` con `[]`» es frágil como estrategia de datos de una app?"],
    a: ["It loads only after render, in waterfalls from parent to child, with no cache, and races to handle by hand", "Il ne charge qu'après le rendu, en cascades du parent à l'enfant, sans cache, avec des courses à gérer à la main", "Solo carga tras renderizar, en cascadas de padre a hijo, sin caché, y con carreras que gestionar a mano"],
    w: [["Effects cannot call `fetch`", "Les effets ne peuvent pas appeler `fetch`", "Los efectos no pueden llamar a `fetch`"], ["The request is sent twice in production", "La requête part deux fois en production", "La petición se envía dos veces en producción"], ["It blocks the first paint until the data arrives", "Il bloque le premier affichage jusqu'à l'arrivée des données", "Bloquea el primer pintado hasta que llegan los datos"]],
    e: [
      "A child's request starts only after its parent's data arrived and it rendered: a waterfall. Routers with loaders start requests in parallel at navigation; server components fetch on the server; data libraries add caching and deduplication. Effects remain fine for small cases.",
      "La requête d'un enfant ne part qu'après l'arrivée des données du parent et son rendu : une cascade. Les routeurs à loaders lancent les requêtes en parallèle dès la navigation ; les composants serveur chargent sur le serveur ; les bibliothèques de données ajoutent cache et dédoublonnage. Les effets restent corrects pour les petits cas.",
      "La petición de un hijo solo sale cuando han llegado los datos del padre y este ha renderizado: una cascada. Los routers con loaders lanzan las peticiones en paralelo al navegar; los componentes de servidor cargan en el servidor; las bibliotecas de datos añaden caché y deduplicación. Los efectos siguen valiendo para casos pequeños.",
    ],
  },
];

const performance: ReactQuestion[] = [
  {
    id: "re-perf-01",
    q: ["What does the React Compiler do?", "Que fait le React Compiler ?", "¿Qué hace el React Compiler?"],
    a: ["At build time, it memoises components and values automatically, as `memo`, `useMemo` and `useCallback` would", "À la compilation, il mémoïse automatiquement composants et valeurs, comme le feraient `memo`, `useMemo` et `useCallback`", "Al compilar, memoiza automáticamente componentes y valores, como harían `memo`, `useMemo` y `useCallback`"],
    w: [["It turns React into native code", "Il transforme React en code natif", "Convierte React en código nativo"], ["It removes the virtual DOM", "Il supprime le DOM virtuel", "Elimina el DOM virtual"], ["It compiles JSX to HTML strings", "Il compile le JSX en chaînes HTML", "Compila JSX a cadenas HTML"]],
    e: [
      "It runs as a Babel plugin (with integrations for Vite and frameworks) and relies on components following the rules of React, purity above all; code it cannot prove safe is left as is. Version 1.0 shipped in October 2025. With it, most hand-written memoisation becomes unnecessary.",
      "Il fonctionne comme un plugin Babel (avec des intégrations pour Vite et les frameworks) et suppose que les composants suivent les règles de React, la pureté avant tout ; le code qu'il ne peut prouver sûr est laissé tel quel. La version 1.0 est sortie en octobre 2025. Avec lui, la plupart des mémoïsations écrites à la main deviennent inutiles.",
      "Funciona como plugin de Babel (con integraciones para Vite y frameworks) y supone que los componentes siguen las reglas de React, sobre todo la pureza; el código que no puede demostrar seguro lo deja igual. La versión 1.0 salió en octubre de 2025. Con él, la mayoría de la memoización escrita a mano sobra.",
    ],
  },
  {
    id: "re-perf-02",
    q: ["Typing in a search box filters a list of 10,000 rows and the typing lags. What does `useDeferredValue` do for it?", "Taper dans une recherche filtre une liste de 10 000 lignes et la saisie rame. Qu'apporte `useDeferredValue` ?", "Escribir en un buscador filtra una lista de 10.000 filas y la escritura va lenta. ¿Qué aporta `useDeferredValue`?"],
    a: ["The input updates at once; the list renders with a lagging copy of the query, in an interruptible background render", "Le champ se met à jour tout de suite ; la liste se rend avec une copie retardée de la requête, en arrière-plan et de façon interruptible", "El campo se actualiza al instante; la lista se renderiza con una copia retrasada de la consulta, en segundo plano y de forma interrumpible"],
    w: [["It waits a fixed 300 ms, like a debounce", "Il attend 300 ms fixes, comme un debounce", "Espera 300 ms fijos, como un debounce"], ["It renders the list in a Web Worker", "Il rend la liste dans un Web Worker", "Renderiza la lista en un Web Worker"], ["It caches the filtered list across sessions", "Il met en cache la liste filtrée entre les sessions", "Guarda en caché la lista filtrada entre sesiones"]],
    e: [
      "React renders the urgent update (the field) first, then the deferred one; if the user types again, the background render is dropped and restarted. No fixed delay: fast machines show results almost at once. The list component should be `memo`, so the urgent render skips it.",
      "React rend d'abord la mise à jour urgente (le champ), puis la différée ; si l'utilisateur tape encore, le rendu en arrière-plan est abandonné et recommencé. Aucun délai fixe : une machine rapide montre les résultats presque aussitôt. Le composant de liste doit être `memo`, pour que le rendu urgent le saute.",
      "React renderiza primero la actualización urgente (el campo) y luego la diferida; si el usuario vuelve a escribir, el renderizado en segundo plano se descarta y se reinicia. Sin retraso fijo: una máquina rápida muestra resultados casi al instante. El componente de lista debe ser `memo`, para que el renderizado urgente se lo salte.",
    ],
  },
  {
    id: "re-perf-03",
    q: ["What does `startTransition(() => setTab(\"photos\"))` change?", "Que change `startTransition(() => setTab(\"photos\"))` ?", "¿Qué cambia `startTransition(() => setTab(\"photos\"))`?"],
    a: ["The update is non-urgent: it can be interrupted, and the current screen stays instead of a Suspense fallback while the new one loads", "La mise à jour n'est pas urgente : elle peut être interrompue, et l'écran actuel reste au lieu d'un fallback de Suspense pendant le chargement du nouveau", "La actualización no es urgente: se puede interrumpir, y la pantalla actual se mantiene en lugar de un fallback de Suspense mientras carga la nueva"],
    w: [["The update runs in a separate thread", "La mise à jour s'exécute dans un autre thread", "La actualización se ejecuta en otro hilo"], ["The update is delayed until the next idle time", "La mise à jour est repoussée jusqu'au prochain temps mort", "La actualización se pospone hasta el siguiente momento libre"], ["The state change is animated", "Le changement d'état est animé", "El cambio de estado se anima"]],
    e: [
      "`useTransition` adds `isPending` to show that something is coming. In React 19 the function may be async (an Action): pending lasts until it finishes. Typing must not be a transition: inputs need urgent updates.",
      "`useTransition` ajoute `isPending` pour montrer que quelque chose arrive. Dans React 19, la fonction peut être asynchrone (une Action) : l'attente dure jusqu'à sa fin. La saisie ne doit pas être une transition : les champs ont besoin de mises à jour urgentes.",
      "`useTransition` añade `isPending` para mostrar que algo llega. En React 19 la función puede ser asíncrona (una Action): lo pendiente dura hasta que termina. Escribir no debe ser una transición: los campos necesitan actualizaciones urgentes.",
    ],
  },
  {
    id: "re-perf-04",
    q: ["Before adding `memo` everywhere, what should be done first?", "Avant de mettre `memo` partout, que faut-il faire d'abord ?", "Antes de poner `memo` en todas partes, ¿qué hay que hacer primero?"],
    a: ["Measure with the React DevTools Profiler (or Performance tracks) to find what actually renders slowly", "Mesurer avec le Profiler des React DevTools (ou les Performance tracks) pour trouver ce qui est vraiment lent", "Medir con el Profiler de las React DevTools (o los Performance tracks) para encontrar lo que de verdad renderiza lento"],
    w: [["Convert components to classes", "Convertir les composants en classes", "Convertir los componentes en clases"], ["Remove all state from the app", "Retirer tout l'état de l'application", "Quitar todo el estado de la app"], ["Use the production build in development", "Utiliser le build de production en développement", "Usar la compilación de producción en desarrollo"]],
    e: [
      "Most renders are cheap. The profiler shows which components render, why and how long. The usual fixes are structural: move state down to where it is used, pass children instead of rendering them, virtualise long lists. Measure in a production build: development is slower on purpose.",
      "La plupart des rendus sont bon marché. Le profiler montre quels composants se rendent, pourquoi et combien de temps. Les remèdes habituels sont structurels : descendre l'état là où il sert, passer des enfants au lieu de les rendre, virtualiser les longues listes. Mesurer sur un build de production : le développement est lent exprès.",
      "La mayoría de los renderizados son baratos. El profiler muestra qué componentes renderizan, por qué y cuánto tardan. Los remedios habituales son estructurales: bajar el estado a donde se usa, pasar hijos en lugar de renderizarlos, virtualizar listas largas. Medir con una compilación de producción: el desarrollo es lento a propósito.",
    ],
  },
  {
    id: "re-perf-05",
    q: ["`useCallback(fn, deps)` is worth it when?", "`useCallback(fn, deps)` vaut la peine quand ?", "¿Cuándo merece la pena `useCallback(fn, deps)`?"],
    a: ["When the function goes to a `memo` child or into a dependency list, where its identity matters", "Quand la fonction va à un enfant `memo` ou dans une liste de dépendances, où son identité compte", "Cuando la función va a un hijo `memo` o a una lista de dependencias, donde su identidad importa"],
    w: [["Always: it makes the function faster", "Toujours : il rend la fonction plus rapide", "Siempre: hace la función más rápida"], ["When the function is long", "Quand la fonction est longue", "Cuando la función es larga"], ["Never: it was removed in React 19", "Jamais : il a été retiré de React 19", "Nunca: se eliminó en React 19"]],
    e: [
      "`useCallback` does not make a function cheaper; it keeps the same function between renders while `deps` are unchanged. Without a consumer that compares identities, it only adds work and noise. The React Compiler inserts it where it helps.",
      "`useCallback` ne rend pas une fonction moins coûteuse ; il garde la même fonction entre les rendus tant que `deps` ne change pas. Sans consommateur qui compare les identités, il ne fait qu'ajouter du travail et du bruit. Le React Compiler l'insère là où il sert.",
      "`useCallback` no abarata una función; mantiene la misma función entre renderizados mientras `deps` no cambie. Sin un consumidor que compare identidades, solo añade trabajo y ruido. El React Compiler lo inserta donde ayuda.",
    ],
  },
];

const serverData: ReactQuestion[] = [
  {
    id: "re-srv-01",
    q: ["What does `use(promise)` do in a component?", "Que fait `use(promise)` dans un composant ?", "¿Qué hace `use(promise)` en un componente?"],
    a: ["Reads the promise's value, suspending to the nearest `<Suspense>` until it resolves; errors go to the error boundary", "Lit la valeur de la promesse, en suspendant jusqu'au `<Suspense>` le plus proche avant sa résolution ; les erreurs vont à l'error boundary", "Lee el valor de la promesa, suspendiendo hasta el `<Suspense>` más cercano hasta que se resuelve; los errores van al error boundary"],
    w: [["Awaits it like `await`, blocking the page", "L'attend comme `await`, en bloquant la page", "La espera como `await`, bloqueando la página"], ["Starts a new request at each render", "Lance une nouvelle requête à chaque rendu", "Lanza una petición nueva en cada renderizado"], ["Converts it to state with an effect", "La convertit en état avec un effet", "La convierte en estado con un efecto"]],
    e: [
      "The promise must be created outside the render, or cached (by a server component, a loader or a library): a promise created during render is new each time and never settles for React. Unlike other hooks, `use` may be called inside conditions; it also reads context.",
      "La promesse doit être créée hors du rendu, ou mise en cache (par un composant serveur, un loader ou une bibliothèque) : une promesse créée pendant le rendu est nouvelle à chaque fois et ne se règle jamais pour React. Contrairement aux autres hooks, `use` peut être appelé dans une condition ; il lit aussi un contexte.",
      "La promesa debe crearse fuera del renderizado, o guardarse en caché (por un componente de servidor, un loader o una biblioteca): una promesa creada durante el renderizado es nueva cada vez y nunca se resuelve para React. A diferencia de otros hooks, `use` se puede llamar dentro de condiciones; también lee contextos.",
    ],
  },
  {
    id: "re-srv-02",
    q: ["What is a React Server Component?", "Qu'est-ce qu'un React Server Component ?", "¿Qué es un React Server Component?"],
    a: ["A component that runs only on the server (or at build time): it can read data directly and sends rendered output, not its code, to the browser", "Un composant qui ne s'exécute que sur le serveur (ou à la compilation) : il lit les données directement et envoie au navigateur son résultat, pas son code", "Un componente que solo se ejecuta en el servidor (o al compilar): lee los datos directamente y envía al navegador su resultado, no su código"],
    w: [["A component rendered to HTML on the server, then hydrated like the others", "Un composant rendu en HTML sur le serveur, puis hydraté comme les autres", "Un componente renderizado a HTML en el servidor y luego hidratado como los demás"], ["A component that can use `useState` on the server", "Un composant qui peut utiliser `useState` sur le serveur", "Un componente que puede usar `useState` en el servidor"], ["A Node.js process managed by React", "Un processus Node.js géré par React", "Un proceso de Node.js gestionado por React"]],
    e: [
      "Server components have no state or effects and add nothing to the bundle. Interactive parts are client components, marked by `\"use client\"` at the top of their module. Server rendering (SSR) is different: it turns client components into HTML, then hydrates them. RSC needs a framework or bundler integration (Next.js, React Router, Parcel, Vite plugins).",
      "Les composants serveur n'ont ni état ni effets et n'ajoutent rien au bundle. Les parties interactives sont des composants client, marqués par `\"use client\"` en tête de module. Le rendu serveur (SSR) est autre chose : il transforme des composants client en HTML, puis les hydrate. RSC demande une intégration de framework ou de bundler (Next.js, React Router, Parcel, plugins Vite).",
      "Los componentes de servidor no tienen estado ni efectos y no añaden nada al bundle. Las partes interactivas son componentes de cliente, marcados con `\"use client\"` al principio de su módulo. El renderizado en servidor (SSR) es otra cosa: convierte componentes de cliente en HTML y luego los hidrata. RSC necesita una integración de framework o de bundler (Next.js, React Router, Parcel, plugins de Vite).",
    ],
  },
  {
    id: "re-srv-03",
    q: ["A server component passes props to a client component. What may those props be?", "Un composant serveur passe des props à un composant client. Que peuvent être ces props ?", "Un componente de servidor pasa props a un componente de cliente. ¿Qué pueden ser esas props?"],
    a: ["Serialisable values: data, JSX, promises, and server functions, but not ordinary functions or class instances", "Des valeurs sérialisables : données, JSX, promesses et fonctions serveur, mais pas des fonctions ordinaires ni des instances de classes", "Valores serializables: datos, JSX, promesas y funciones de servidor, pero no funciones normales ni instancias de clases"],
    w: [["Anything, as in client-to-client props", "N'importe quoi, comme entre composants client", "Cualquier cosa, como entre componentes de cliente"], ["Strings only", "Seulement des chaînes", "Solo cadenas"], ["Only a database connection", "Seulement une connexion à la base", "Solo una conexión a la base de datos"]],
    e: [
      "The props cross the network in the RSC payload. A function cannot be sent, except a server function (`\"use server\"`), which becomes a reference the client can call. Also beware of sending more data than the client needs: everything passed is visible in the browser.",
      "Les props traversent le réseau dans la charge utile RSC. Une fonction ne peut pas être envoyée, sauf une fonction serveur (`\"use server\"`), qui devient une référence que le client peut appeler. Attention aussi à ne pas envoyer plus de données que le client n'en a besoin : tout ce qui est passé est visible dans le navigateur.",
      "Las props cruzan la red en la carga útil de RSC. No se puede enviar una función, salvo una función de servidor (`\"use server\"`), que se convierte en una referencia que el cliente puede llamar. Cuidado también con enviar más datos de los que el cliente necesita: todo lo que se pasa es visible en el navegador.",
    ],
  },
  {
    id: "re-srv-04",
    q: ["A server function (`\"use server\"`) deletes a post. What must it still do itself?", "Une fonction serveur (`\"use server\"`) supprime un article. Que doit-elle encore faire elle-même ?", "Una función de servidor (`\"use server\"`) borra un artículo. ¿Qué debe seguir haciendo ella misma?"],
    a: ["Check that the caller is signed in and allowed, and validate its arguments: it is a public HTTP endpoint", "Vérifier que l'appelant est connecté et autorisé, et valider ses arguments : c'est un point d'accès HTTP public", "Comprobar que quien llama ha iniciado sesión y tiene permiso, y validar sus argumentos: es un endpoint HTTP público"],
    w: [["Nothing: only the app's own components can call it", "Rien : seuls les composants de l'application peuvent l'appeler", "Nada: solo los componentes de la app pueden llamarla"], ["Encrypt its return value", "Chiffrer sa valeur de retour", "Cifrar su valor de retorno"], ["Run inside a transaction opened by React", "S'exécuter dans une transaction ouverte par React", "Ejecutarse dentro de una transacción abierta por React"]],
    e: [
      "The framework exposes each server function as an endpoint with an unguessable id, but anyone can call it with any arguments. Treat it like an API route: authenticate, authorise, validate (a schema library such as Zod), and return only what the caller may see.",
      "Le framework expose chaque fonction serveur comme un point d'accès avec un identifiant difficile à deviner, mais n'importe qui peut l'appeler avec n'importe quels arguments. La traiter comme une route d'API : authentifier, autoriser, valider (une bibliothèque de schémas comme Zod), et ne renvoyer que ce que l'appelant a le droit de voir.",
      "El framework expone cada función de servidor como un endpoint con un id difícil de adivinar, pero cualquiera puede llamarla con cualquier argumento. Tratarla como una ruta de API: autenticar, autorizar, validar (una biblioteca de esquemas como Zod), y devolver solo lo que quien llama puede ver.",
    ],
  },
  {
    id: "re-srv-05",
    q: ["After server rendering, React reports a hydration mismatch. A common cause?", "Après un rendu serveur, React signale une différence d'hydratation. Une cause courante ?", "Tras renderizar en el servidor, React informa de un desajuste de hidratación. ¿Una causa habitual?"],
    a: ["Output that differs between server and browser: `Date.now()`, `Math.random()`, `window` checks, locale formatting", "Un rendu qui diffère entre serveur et navigateur : `Date.now()`, `Math.random()`, tests sur `window`, formatage selon la locale", "Una salida que difiere entre servidor y navegador: `Date.now()`, `Math.random()`, comprobaciones de `window`, formato según la configuración regional"],
    w: [["Using too many components", "Utiliser trop de composants", "Usar demasiados componentes"], ["CSS loaded after the HTML", "Du CSS chargé après le HTML", "CSS cargado después del HTML"], ["A component with state", "Un composant avec un état", "Un componente con estado"]],
    e: [
      "Hydration attaches React to the server's HTML and expects the first client render to produce the same thing. Render browser-only values after mount (an effect setting state), use `useId` for ids, and keep `suppressHydrationWarning` for unavoidable text such as a timestamp. React 19 shows one error with a diff.",
      "L'hydratation rattache React au HTML du serveur et attend que le premier rendu client produise la même chose. Rendre les valeurs propres au navigateur après le montage (un effet qui change l'état), utiliser `useId` pour les identifiants, et réserver `suppressHydrationWarning` aux textes inévitables comme un horodatage. React 19 affiche une seule erreur avec un diff.",
      "La hidratación conecta React al HTML del servidor y espera que el primer renderizado en el cliente produzca lo mismo. Renderizar los valores propios del navegador tras el montaje (un efecto que cambia el estado), usar `useId` para los ids, y reservar `suppressHydrationWarning` para textos inevitables como una marca de tiempo. React 19 muestra un solo error con un diff.",
    ],
  },
];

const advancedTypes: ReactQuestion[] = [
  {
    id: "re-at-01",
    q: ["How is a generic `List` typed so that `renderItem` gets the item's real type?", "Comment typer un `List` générique pour que `renderItem` reçoive le vrai type de l'élément ?", "¿Cómo se tipa un `List` genérico para que `renderItem` reciba el tipo real del elemento?"],
    a: ["`function List<T>(p: { items: T[]; renderItem: (item: T) => React.ReactNode })`", "`function List<T>(p: { items: T[]; renderItem: (item: T) => React.ReactNode })`", "`function List<T>(p: { items: T[]; renderItem: (item: T) => React.ReactNode })`"],
    w: [["`items: any[]`, then cast in `renderItem`", "`items: any[]`, puis un cast dans `renderItem`", "`items: any[]`, y luego un cast en `renderItem`"], ["Generic components are impossible with JSX", "Les composants génériques sont impossibles avec le JSX", "Los componentes genéricos son imposibles con JSX"], ["`React.FC<T>`, which infers `T` from the children", "`React.FC<T>`, qui déduit `T` des enfants", "`React.FC<T>`, que deduce `T` de los hijos"]],
    e: [
      "At `<List items={users} renderItem={(u) => u.name} />`, TypeScript infers `T` from `items`, so `u` is a `User`. In a `.tsx` arrow function, write `<T,>` so the parser does not read a JSX tag. `React.FC` cannot express a generic component.",
      "À `<List items={users} renderItem={(u) => u.name} />`, TypeScript déduit `T` de `items` : `u` est un `User`. Dans une fonction fléchée en `.tsx`, écrire `<T,>` pour que l'analyseur ne lise pas une balise JSX. `React.FC` ne sait pas exprimer un composant générique.",
      "En `<List items={users} renderItem={(u) => u.name} />`, TypeScript deduce `T` de `items`, así que `u` es un `User`. En una función flecha en `.tsx`, escribir `<T,>` para que el analizador no lea una etiqueta JSX. `React.FC` no puede expresar un componente genérico.",
    ],
  },
  {
    id: "re-at-02",
    q: ["A `Button` takes either `href` (renders a link) or `onClick` (renders a button), never both. Which type?", "Un `Button` reçoit soit `href` (rend un lien), soit `onClick` (rend un bouton), jamais les deux. Quel type ?", "Un `Button` recibe `href` (renderiza un enlace) u `onClick` (renderiza un botón), nunca los dos. ¿Qué tipo?"],
    a: ["A union: `{ href: string; onClick?: never } | { onClick: () => void; href?: never }`", "Une union : `{ href: string; onClick?: never } | { onClick: () => void; href?: never }`", "Una unión: `{ href: string; onClick?: never } | { onClick: () => void; href?: never }`"],
    w: [["`{ href?: string; onClick?: () => void }`", "`{ href?: string; onClick?: () => void }`", "`{ href?: string; onClick?: () => void }`"], ["`{ href: string } & { onClick: () => void }`", "`{ href: string } & { onClick: () => void }`", "`{ href: string } & { onClick: () => void }`"], ["`Record<string, unknown>`", "`Record<string, unknown>`", "`Record<string, unknown>`"]],
    e: [
      "Two optional props allow neither and both. The union with `never` makes each case exclusive and lets `\"href\" in props` narrow inside the component. The intersection requires both.",
      "Deux props optionnelles permettent aucune ou les deux. L'union avec `never` rend chaque cas exclusif et permet à `\"href\" in props` d'affiner dans le composant. L'intersection exige les deux.",
      "Dos props opcionales permiten ninguna o las dos. La unión con `never` hace cada caso exclusivo y permite que `\"href\" in props` estreche dentro del componente. La intersección exige las dos.",
    ],
  },
  {
    id: "re-at-03",
    q: ["How is a context typed whose value only exists below its provider?", "Comment typer un contexte dont la valeur n'existe que sous son fournisseur ?", "¿Cómo se tipa un contexto cuyo valor solo existe debajo de su proveedor?"],
    a: ["`createContext<Auth | null>(null)` and a `useAuth()` hook that throws if the value is null", "`createContext<Auth | null>(null)` et un hook `useAuth()` qui lève une erreur si la valeur est nulle", "`createContext<Auth | null>(null)` y un hook `useAuth()` que lanza un error si el valor es nulo"],
    w: [["`createContext({} as Auth)`, always safe", "`createContext({} as Auth)`, toujours sûr", "`createContext({} as Auth)`, siempre seguro"], ["`createContext<any>()`", "`createContext<any>()`", "`createContext<any>()`"], ["Contexts cannot be typed", "Les contextes ne peuvent pas être typés", "Los contextos no se pueden tipar"]],
    e: [
      "`{} as Auth` lies to the compiler: a missing provider gives `undefined` fields at run time. With `null` and a checking hook, every consumer gets a non-null `Auth` type and a clear error if the provider is forgotten.",
      "`{} as Auth` ment au compilateur : un fournisseur manquant donne des champs `undefined` à l'exécution. Avec `null` et un hook qui vérifie, chaque consommateur reçoit un type `Auth` non nul et une erreur claire si le fournisseur est oublié.",
      "`{} as Auth` engaña al compilador: un proveedor que falta da campos `undefined` en tiempo de ejecución. Con `null` y un hook que comprueba, cada consumidor recibe un tipo `Auth` no nulo y un error claro si se olvida el proveedor.",
    ],
  },
  {
    id: "re-at-04",
    q: ["With Hono on the server, how does the React client get typed API calls without generating code?", "Avec Hono côté serveur, comment le client React obtient-il des appels d'API typés sans générer de code ?", "Con Hono en el servidor, ¿cómo obtiene el cliente React llamadas a la API tipadas sin generar código?"],
    a: ["Export the app's type (`export type AppType = typeof routes`) and call it through `hc<AppType>()` from `hono/client`", "Exporter le type de l'application (`export type AppType = typeof routes`) et l'appeler par `hc<AppType>()` de `hono/client`", "Exportar el tipo de la app (`export type AppType = typeof routes`) y llamarla con `hc<AppType>()` de `hono/client`"],
    w: [["Import the server's code into the bundle", "Importer le code du serveur dans le bundle", "Importar el código del servidor en el bundle"], ["It is impossible: `fetch` is untyped", "Impossible : `fetch` n'est pas typé", "Imposible: `fetch` no tiene tipos"], ["Write a `.d.ts` by hand for each route", "Écrire un `.d.ts` à la main pour chaque route", "Escribir un `.d.ts` a mano para cada ruta"]],
    e: [
      "`import type` brings only types, erased at build: no server code reaches the browser. Request bodies validated with a validator (Zod, Valibot) give typed inputs, and handlers' `c.json(...)` typed responses. Both sides must share one TypeScript project or package.",
      "`import type` n'apporte que des types, effacés au build : aucun code serveur n'arrive au navigateur. Les corps de requêtes validés par un validateur (Zod, Valibot) donnent des entrées typées, et les `c.json(...)` des handlers des réponses typées. Les deux côtés doivent partager un projet ou un paquet TypeScript.",
      "`import type` solo trae tipos, que se borran al compilar: ningún código del servidor llega al navegador. Los cuerpos de petición validados con un validador (Zod, Valibot) dan entradas tipadas, y los `c.json(...)` de los handlers, respuestas tipadas. Ambos lados deben compartir un proyecto o paquete TypeScript.",
    ],
  },
];

const buildDeploy: ReactQuestion[] = [
  {
    id: "re-bd-01",
    q: ["A single-page app with client-side routing is deployed. `/settings` reloaded gives a 404. Why?", "Une application monopage avec routage côté client est déployée. Recharger `/settings` donne une 404. Pourquoi ?", "Se despliega una SPA con enrutado en el cliente. Recargar `/settings` da un 404. ¿Por qué?"],
    a: ["The server has no `/settings` file; it must answer unknown paths with `index.html` and let the router decide", "Le serveur n'a pas de fichier `/settings` ; il doit répondre aux chemins inconnus avec `index.html` et laisser décider le routeur", "El servidor no tiene un archivo `/settings`; debe responder a las rutas desconocidas con `index.html` y dejar que decida el router"],
    w: [["The router needs a `<base>` tag", "Le routeur a besoin d'une balise `<base>`", "El router necesita una etiqueta `<base>`"], ["The build forgot the settings page", "Le build a oublié la page des réglages", "La compilación olvidó la página de ajustes"], ["Browsers cannot reload client routes", "Les navigateurs ne savent pas recharger des routes client", "Los navegadores no pueden recargar rutas del cliente"]],
    e: [
      "Only the server sees a reload. The fallback must exclude `/api/*` and static assets, so a missing file or API route still gives a real 404. Hash routing (`#settings`) avoids the issue, at the cost of less clean URLs.",
      "Seul le serveur voit un rechargement. Le repli doit exclure `/api/*` et les fichiers statiques, pour qu'un fichier ou une route d'API absents donnent toujours une vraie 404. Le routage par hash (`#settings`) évite le problème, au prix d'URL moins propres.",
      "Solo el servidor ve una recarga. El respaldo debe excluir `/api/*` y los archivos estáticos, para que un archivo o una ruta de API inexistentes sigan dando un 404 real. El enrutado por hash (`#settings`) evita el problema, a costa de URLs menos limpias.",
    ],
  },
  {
    id: "re-bd-02",
    q: ["What bundles a production build in Vite 8?", "Qu'est-ce qui assemble un build de production avec Vite 8 ?", "¿Qué empaqueta una compilación de producción en Vite 8?"],
    a: ["Rolldown, a bundler written in Rust, in place of the earlier esbuild and Rollup pair", "Rolldown, un bundler écrit en Rust, à la place de l'ancien duo esbuild et Rollup", "Rolldown, un bundler escrito en Rust, en lugar de la anterior pareja esbuild y Rollup"],
    w: [["Webpack", "Webpack", "Webpack"], ["The TypeScript compiler", "Le compilateur TypeScript", "El compilador de TypeScript"], ["The browser, at load time", "Le navigateur, au chargement", "El navegador, al cargar"]],
    e: [
      "Earlier versions used esbuild in development and Rollup for builds; one bundler for both removes differences between them and speeds up large builds. Rollup's plugin interface is kept, so most plugins still work.",
      "Les versions précédentes utilisaient esbuild en développement et Rollup pour les builds ; un seul bundler pour les deux supprime les différences et accélère les gros builds. L'interface de plugins de Rollup est conservée, donc la plupart des plugins marchent encore.",
      "Las versiones anteriores usaban esbuild en desarrollo y Rollup para compilar; un solo bundler para ambos elimina diferencias y acelera las compilaciones grandes. Se mantiene la interfaz de plugins de Rollup, así que la mayoría de plugins siguen funcionando.",
    ],
  },
  {
    id: "re-bd-03",
    q: ["A React app and its Node API ship as one container. A common Dockerfile shape?", "Une application React et son API Node partent dans un seul conteneur. Une forme courante de Dockerfile ?", "Una app React y su API de Node se entregan en un solo contenedor. ¿Una forma habitual de Dockerfile?"],
    a: ["A multi-stage build: one stage installs and builds, the final one copies `dist/` and the server with production dependencies only", "Un build multi-étapes : une étape installe et construit, la dernière copie `dist/` et le serveur avec les seules dépendances de production", "Una compilación multietapa: una etapa instala y compila, la última copia `dist/` y el servidor solo con dependencias de producción"],
    w: [["One stage running `npm run dev` in production", "Une seule étape qui lance `npm run dev` en production", "Una sola etapa que ejecuta `npm run dev` en producción"], ["Copy `node_modules` from the developer's machine", "Copier les `node_modules` de la machine du développeur", "Copiar los `node_modules` de la máquina del desarrollador"], ["Two containers are mandatory", "Deux conteneurs sont obligatoires", "Dos contenedores son obligatorios"]],
    e: [
      "The final image has no compilers or dev dependencies: smaller, faster to start, less to patch. The server serves the static files and `/api` from one origin. On Cloud Run it listens on the `PORT` it is given; secrets come from the environment, not the image.",
      "L'image finale n'a ni compilateurs ni dépendances de développement : plus petite, plus rapide à démarrer, moins à corriger. Le serveur sert les fichiers statiques et `/api` depuis une seule origine. Sur Cloud Run, il écoute le `PORT` qu'on lui donne ; les secrets viennent de l'environnement, pas de l'image.",
      "La imagen final no tiene compiladores ni dependencias de desarrollo: más pequeña, arranca más rápido, menos que parchear. El servidor sirve los archivos estáticos y `/api` desde un solo origen. En Cloud Run escucha en el `PORT` que se le da; los secretos vienen del entorno, no de la imagen.",
    ],
  },
  {
    id: "re-bd-04",
    q: ["Where should a session token live in a React app with its own API?", "Où doit vivre un jeton de session dans une application React avec sa propre API ?", "¿Dónde debe vivir un token de sesión en una app React con su propia API?"],
    a: ["In an `HttpOnly`, `Secure`, `SameSite` cookie set by the server, out of reach of JavaScript", "Dans un cookie `HttpOnly`, `Secure`, `SameSite` posé par le serveur, hors de portée du JavaScript", "En una cookie `HttpOnly`, `Secure`, `SameSite` puesta por el servidor, fuera del alcance de JavaScript"],
    w: [["In `localStorage`, read by every request", "Dans `localStorage`, lu à chaque requête", "En `localStorage`, leído en cada petición"], ["In React state, lost on reload", "Dans l'état React, perdu au rechargement", "En el estado de React, perdido al recargar"], ["In a `VITE_` environment variable", "Dans une variable d'environnement `VITE_`", "En una variable de entorno `VITE_`"]],
    e: [
      "Any script on the page can read `localStorage`, so one cross-site scripting bug leaks every token. An `HttpOnly` cookie is sent by the browser but cannot be read by scripts; same origin makes it simple. The app asks the API who is signed in.",
      "N'importe quel script de la page peut lire `localStorage` : une seule faille XSS fait fuir tous les jetons. Un cookie `HttpOnly` est envoyé par le navigateur mais illisible par les scripts ; la même origine simplifie tout. L'application demande à l'API qui est connecté.",
      "Cualquier script de la página puede leer `localStorage`, así que un solo fallo de XSS filtra todos los tokens. Una cookie `HttpOnly` la envía el navegador pero los scripts no pueden leerla; el mismo origen lo simplifica. La app pregunta a la API quién ha iniciado sesión.",
    ],
  },
];

const e2eTests: ReactQuestion[] = [
  {
    id: "re-e2e-01",
    q: ["A Playwright test clicks \"Save\" then checks a message. Why is a `waitForTimeout(1000)` in between a bad idea?", "Un test Playwright clique sur « Save » puis vérifie un message. Pourquoi un `waitForTimeout(1000)` entre les deux est-il une mauvaise idée ?", "Un test de Playwright pulsa «Save» y luego comprueba un mensaje. ¿Por qué es mala idea un `waitForTimeout(1000)` entre medias?"],
    a: ["Web-first assertions such as `await expect(locator).toBeVisible()` already retry until it appears; a fixed sleep is slow and still flaky", "Les assertions comme `await expect(locator).toBeVisible()` réessaient déjà jusqu'à l'apparition ; une pause fixe est lente et reste fragile", "Las aserciones como `await expect(locator).toBeVisible()` ya reintentan hasta que aparece; una pausa fija es lenta y sigue siendo frágil"],
    w: [["Playwright forbids it", "Playwright l'interdit", "Playwright lo prohíbe"], ["One second is too short for React", "Une seconde est trop courte pour React", "Un segundo es poco para React"], ["It disables the auto-waiting of `click`", "Elle désactive l'attente automatique de `click`", "Desactiva la espera automática de `click`"]],
    e: [
      "Locators wait for the element to be visible, stable and enabled before acting; `expect` on a locator polls until the condition holds or times out. A sleep wastes time when the app is fast and fails when CI is slow.",
      "Les localisateurs attendent que l'élément soit visible, stable et actif avant d'agir ; `expect` sur un localisateur réessaie jusqu'à ce que la condition soit vraie ou que le délai expire. Une pause gaspille du temps quand l'application est rapide et échoue quand la CI est lente.",
      "Los localizadores esperan a que el elemento esté visible, estable y habilitado antes de actuar; `expect` sobre un localizador reintenta hasta que se cumple la condición o se agota el tiempo. Una pausa pierde tiempo cuando la app es rápida y falla cuando la CI es lenta.",
    ],
  },
  {
    id: "re-e2e-02",
    q: ["How do end-to-end tests stay independent of each other?", "Comment des tests de bout en bout restent-ils indépendants les uns des autres ?", "¿Cómo se mantienen independientes entre sí los tests de extremo a extremo?"],
    a: ["Each test gets a fresh browser context and creates its own data (its own account, unique names)", "Chaque test reçoit un contexte de navigateur neuf et crée ses propres données (son propre compte, des noms uniques)", "Cada test recibe un contexto de navegador nuevo y crea sus propios datos (su propia cuenta, nombres únicos)"],
    w: [["They run in a fixed order, each using the previous one's data", "Ils s'exécutent dans un ordre fixe, chacun avec les données du précédent", "Se ejecutan en un orden fijo, cada uno con los datos del anterior"], ["They share one signed-in page", "Ils partagent une même page connectée", "Comparten una misma página con sesión iniciada"], ["They are run one at a time, never in parallel", "Ils sont lancés un par un, jamais en parallèle", "Se lanzan de uno en uno, nunca en paralelo"]],
    e: [
      "Playwright gives every test its own context: cookies and storage start empty. Tests that create their own data can run in parallel and in any order, and a failure stays local. A saved signed-in state (`storageState`) can speed up sign-in without sharing data.",
      "Playwright donne à chaque test son propre contexte : cookies et stockage partent vides. Des tests qui créent leurs propres données peuvent tourner en parallèle et dans n'importe quel ordre, et un échec reste local. Un état connecté enregistré (`storageState`) accélère la connexion sans partager de données.",
      "Playwright da a cada test su propio contexto: cookies y almacenamiento empiezan vacíos. Los tests que crean sus propios datos pueden ejecutarse en paralelo y en cualquier orden, y un fallo queda local. Un estado con sesión guardado (`storageState`) acelera el inicio de sesión sin compartir datos.",
    ],
  },
  {
    id: "re-e2e-03",
    q: ["Which locator is the most robust for a button labelled \"Delete\"?", "Quel localisateur est le plus robuste pour un bouton intitulé « Delete » ?", "¿Qué localizador es el más robusto para un botón con el texto «Delete»?"],
    a: ["`page.getByRole(\"button\", { name: \"Delete\" })`", "`page.getByRole(\"button\", { name: \"Delete\" })`", "`page.getByRole(\"button\", { name: \"Delete\" })`"],
    w: [["`page.locator(\"div > div:nth-child(3) > button\")`", "`page.locator(\"div > div:nth-child(3) > button\")`", "`page.locator(\"div > div:nth-child(3) > button\")`"], ["`page.locator(\".btn-red\")`", "`page.locator(\".btn-red\")`", "`page.locator(\".btn-red\")`"], ["`page.locator(\"xpath=//button[2]\")`", "`page.locator(\"xpath=//button[2]\")`", "`page.locator(\"xpath=//button[2]\")`"]],
    e: [
      "Roles and accessible names are what users and assistive technology rely on; they survive changes of markup and styling. Positional CSS and XPath break with any layout change. Playwright's codegen suggests role locators.",
      "Les rôles et noms accessibles sont ce sur quoi s'appuient les utilisateurs et les technologies d'assistance ; ils survivent aux changements de balisage et de style. Les sélecteurs CSS positionnels et XPath cassent au moindre changement de mise en page. Le codegen de Playwright propose des localisateurs par rôle.",
      "Los roles y nombres accesibles son en lo que se apoyan los usuarios y las tecnologías de asistencia; sobreviven a cambios de marcado y estilo. Los selectores CSS posicionales y XPath se rompen con cualquier cambio de diseño. El codegen de Playwright propone localizadores por rol.",
    ],
  },
  {
    id: "re-e2e-04",
    q: ["The same end-to-end suite must pass on SQLite and on PostgreSQL. What does that catch?", "La même suite de bout en bout doit passer sur SQLite et sur PostgreSQL. Qu'est-ce que cela attrape ?", "La misma batería de extremo a extremo debe pasar en SQLite y en PostgreSQL. ¿Qué detecta eso?"],
    a: ["SQL that only one engine accepts or that behaves differently: types, case-sensitivity, ordering of ties, constraint errors", "Du SQL qu'un seul moteur accepte ou qui s'y comporte autrement : types, casse, ordre des ex æquo, erreurs de contraintes", "SQL que solo acepta un motor o que se comporta distinto: tipos, mayúsculas, orden de los empates, errores de restricciones"],
    w: [["Nothing more: SQL is standard", "Rien de plus : le SQL est standard", "Nada más: el SQL es estándar"], ["Only speed differences", "Seulement des différences de vitesse", "Solo diferencias de velocidad"], ["Bugs in React's rendering", "Des bogues dans le rendu de React", "Errores en el renderizado de React"]],
    e: [
      "SQLite is loosely typed and lenient; PostgreSQL is strict about types, `GROUP BY` and identity columns. Rows with equal sort keys come back in any order unless the query says otherwise. Running the browser tests on both engines checks the real queries the app sends.",
      "SQLite est faiblement typé et tolérant ; PostgreSQL est strict sur les types, le `GROUP BY` et les colonnes d'identité. Des lignes à clés de tri égales reviennent dans n'importe quel ordre si la requête ne le précise pas. Lancer les tests navigateur sur les deux moteurs vérifie les vraies requêtes de l'application.",
      "SQLite tiene tipado débil y es permisivo; PostgreSQL es estricto con los tipos, el `GROUP BY` y las columnas de identidad. Las filas con claves de orden iguales vuelven en cualquier orden si la consulta no lo especifica. Ejecutar los tests de navegador en ambos motores comprueba las consultas reales de la app.",
    ],
  },
];

export const components = { patterns };
export const state = { externalState };
export const effects = { effectsAdvanced };
export const rendering = { performance };
export const data = { serverData };
export const typing = { advancedTypes };
export const tooling = { buildDeploy };
export const testing = { e2eTests };
