/**
 * React, Intermédiaire: composition and context, designing state, effects in
 * practice, the rules of rendering, forms and Actions, typing events and
 * hooks, the development workflow, testing components.
 */
import type { LinuxQuestion as ReactQuestion } from "../linux/types";

const composition: ReactQuestion[] = [
  {
    id: "re-comp-01",
    q: ["What problem does context (`createContext`, `useContext`) solve?", "Quel problème le contexte (`createContext`, `useContext`) résout-il ?", "¿Qué problema resuelve el contexto (`createContext`, `useContext`)?"],
    a: ["Passing a value deep into the tree without threading it through every level as a prop", "Faire descendre une valeur profondément dans l'arbre sans la passer en prop à chaque niveau", "Pasar un valor a lo hondo del árbol sin enhebrarlo como prop por cada nivel"],
    w: [
      ["Making components render less often", "Faire moins de rendus", "Hacer que los componentes rendericen menos"],
      ["Sharing state between two browser tabs", "Partager l'état entre deux onglets", "Compartir estado entre dos pestañas"],
      ["Replacing every prop of an application", "Remplacer toutes les props d'une application", "Sustituir todas las props de una aplicación"],
    ],
    e: [
      "Context suits values many components need: the theme, the signed-in user, the language. Every component that reads it renders again when the provided value changes, so it is not a free state manager; split contexts, or keep fast-changing state elsewhere. In React 19 `<ThemeContext value={t}>` provides it directly.",
      "Le contexte convient aux valeurs dont beaucoup de composants ont besoin : le thème, l'utilisateur connecté, la langue. Chaque composant qui le lit refait un rendu quand la valeur fournie change : ce n'est pas un gestionnaire d'état gratuit ; découper les contextes, ou garder ailleurs l'état qui change vite. Dans React 19, `<ThemeContext value={t}>` le fournit directement.",
      "El contexto sirve para valores que necesitan muchos componentes: el tema, el usuario conectado, el idioma. Cada componente que lo lee vuelve a renderizar cuando cambia el valor proporcionado, así que no es un gestor de estado gratuito; dividir los contextos, o guardar en otro sitio el estado que cambia rápido. En React 19, `<ThemeContext value={t}>` lo proporciona directamente.",
    ],
  },
  {
    id: "re-comp-02",
    q: ["`useContext(ThemeContext)` in a component with no provider above it returns what?", "`useContext(ThemeContext)` dans un composant sans fournisseur au-dessus renvoie quoi ?", "¿Qué devuelve `useContext(ThemeContext)` en un componente sin proveedor encima?"],
    a: ["The default value given to `createContext`", "La valeur par défaut donnée à `createContext`", "El valor por defecto dado a `createContext`"],
    w: [["It throws an error", "Il lève une erreur", "Lanza un error"], ["`undefined`, always", "`undefined`, toujours", "`undefined`, siempre"], ["The value of the nearest sibling's provider", "La valeur du fournisseur du frère le plus proche", "El valor del proveedor del hermano más cercano"]],
    e: [
      "React looks up the tree for the nearest provider; with none, it uses the default. A common pattern makes the default `null` and wraps `useContext` in a custom hook that throws a clear error, so a forgotten provider is found at once.",
      "React remonte l'arbre jusqu'au fournisseur le plus proche ; sans fournisseur, il prend la valeur par défaut. Un usage courant met `null` par défaut et enveloppe `useContext` dans un hook personnalisé qui lève une erreur claire : un fournisseur oublié se repère tout de suite.",
      "React sube por el árbol hasta el proveedor más cercano; si no hay, usa el valor por defecto. Un patrón habitual pone `null` por defecto y envuelve `useContext` en un hook personalizado que lanza un error claro, así un proveedor olvidado se detecta enseguida.",
    ],
  },
  {
    id: "re-comp-03",
    q: ["What is a custom hook?", "Qu'est-ce qu'un hook personnalisé ?", "¿Qué es un hook personalizado?"],
    a: ["A function whose name starts with `use` and that calls other hooks, to share stateful logic", "Une fonction dont le nom commence par `use` et qui appelle d'autres hooks, pour partager une logique avec état", "Una función cuyo nombre empieza por `use` y que llama a otros hooks, para compartir lógica con estado"],
    w: [
      ["A component that renders nothing", "Un composant qui ne rend rien", "Un componente que no renderiza nada"],
      ["A way to share one state between components", "Un moyen de partager un même état entre composants", "Una forma de compartir un mismo estado entre componentes"],
      ["A hook registered with `React.registerHook`", "Un hook enregistré avec `React.registerHook`", "Un hook registrado con `React.registerHook`"],
    ],
    e: [
      "`useOnline()` or `useDebounced(value, 300)` package logic; each component that calls one gets its own state, not a shared one. The `use` prefix tells the linter to apply the rules of hooks inside.",
      "`useOnline()` ou `useDebounced(value, 300)` regroupent une logique ; chaque composant qui l'appelle a son propre état, pas un état partagé. Le préfixe `use` dit au linter d'appliquer les règles des hooks à l'intérieur.",
      "`useOnline()` o `useDebounced(value, 300)` empaquetan lógica; cada componente que la llama tiene su propio estado, no uno compartido. El prefijo `use` indica al linter que aplique dentro las reglas de los hooks.",
    ],
  },
  {
    id: "re-comp-04",
    q: ["What does `createPortal(child, document.body)` do?", "Que fait `createPortal(child, document.body)` ?", "¿Qué hace `createPortal(child, document.body)`?"],
    a: ["Renders `child` into another DOM node while it stays in the React tree (context, events)", "Rend `child` dans un autre nœud du DOM tout en le gardant dans l'arbre React (contexte, événements)", "Renderiza `child` en otro nodo del DOM mientras sigue en el árbol de React (contexto, eventos)"],
    w: [
      ["Opens the child in a new window", "Ouvre l'enfant dans une nouvelle fenêtre", "Abre el hijo en una ventana nueva"],
      ["Moves the child out of React's control", "Sort l'enfant du contrôle de React", "Saca el hijo del control de React"],
      ["Copies the child to the body as static HTML", "Copie l'enfant dans le body en HTML statique", "Copia el hijo al body como HTML estático"],
    ],
    e: [
      "Portals serve dialogs, tooltips and menus that must escape a parent's `overflow: hidden` or stacking context. The child still reads its contexts, and its events bubble to its React parents, not to its DOM parents. The native `<dialog>` element with `showModal()` is another option for modals.",
      "Les portails servent aux dialogues, infobulles et menus qui doivent échapper à un `overflow: hidden` ou à un contexte d'empilement du parent. L'enfant lit toujours ses contextes, et ses événements remontent vers ses parents React, pas vers ses parents du DOM. L'élément natif `<dialog>` avec `showModal()` est une autre option pour les fenêtres modales.",
      "Los portales sirven para diálogos, tooltips y menús que deben escapar de un `overflow: hidden` o del contexto de apilamiento del padre. El hijo sigue leyendo sus contextos, y sus eventos suben a sus padres de React, no a sus padres del DOM. El elemento nativo `<dialog>` con `showModal()` es otra opción para los modales.",
    ],
  },
];

const stateDesign: ReactQuestion[] = [
  {
    id: "re-sd-01",
    q: ["`fullName` is always `first + \" \" + last`, both in state. Where does `fullName` belong?", "`fullName` vaut toujours `first + \" \" + last`, tous deux dans l'état. Où va `fullName` ?", "`fullName` es siempre `first + \" \" + last`, ambos en el estado. ¿Dónde va `fullName`?"],
    a: ["Computed during the render, not stored in state", "Calculé pendant le rendu, pas stocké dans l'état", "Calculado durante el renderizado, no guardado en el estado"],
    w: [
      ["In a third `useState`, updated in an effect", "Dans un troisième `useState`, mis à jour dans un effet", "En un tercer `useState`, actualizado en un efecto"],
      ["In a ref", "Dans une ref", "En una ref"],
      ["In context", "Dans un contexte", "En un contexto"],
    ],
    e: [
      "Derived values are computed, not synchronised: state plus an effect renders twice and can show a stale value in between. If the computation is costly, `useMemo` caches it. Keep the minimal state and derive the rest.",
      "Les valeurs dérivées se calculent, elles ne se synchronisent pas : un état plus un effet font deux rendus et peuvent montrer entre-temps une valeur périmée. Si le calcul coûte cher, `useMemo` le met en cache. Garder l'état minimal et dériver le reste.",
      "Los valores derivados se calculan, no se sincronizan: un estado más un efecto renderizan dos veces y pueden mostrar entretanto un valor desfasado. Si el cálculo es costoso, `useMemo` lo guarda en caché. Mantener el estado mínimo y derivar el resto.",
    ],
  },
  {
    id: "re-sd-02",
    q: ["What is a controlled input?", "Qu'est-ce qu'un champ contrôlé ?", "¿Qué es un input controlado?"],
    a: ["One whose `value` comes from state and whose `onChange` updates that state", "Un champ dont la `value` vient de l'état et dont le `onChange` met cet état à jour", "Uno cuyo `value` viene del estado y cuyo `onChange` actualiza ese estado"],
    w: [
      ["One with `defaultValue`, read with a ref", "Un champ avec `defaultValue`, lu par une ref", "Uno con `defaultValue`, leído con una ref"],
      ["One disabled until it is valid", "Un champ désactivé tant qu'il n'est pas valide", "Uno desactivado hasta que es válido"],
      ["One validated by the browser", "Un champ validé par le navigateur", "Uno validado por el navegador"],
    ],
    e: [
      "React then owns the value: it can be filtered, formatted or checked at each keystroke. `value` without `onChange` makes a field the user cannot type in. Uncontrolled fields (`defaultValue`, read on submit with `FormData`) are simpler when nothing reacts to each keystroke.",
      "React possède alors la valeur : on peut la filtrer, la formater ou la vérifier à chaque frappe. `value` sans `onChange` donne un champ où l'on ne peut pas écrire. Les champs non contrôlés (`defaultValue`, lus à l'envoi avec `FormData`) sont plus simples quand rien ne réagit à chaque frappe.",
      "React posee entonces el valor: se puede filtrar, formatear o comprobar en cada pulsación. `value` sin `onChange` da un campo en el que no se puede escribir. Los campos no controlados (`defaultValue`, leídos al enviar con `FormData`) son más simples cuando nada reacciona a cada pulsación.",
    ],
  },
  {
    id: "re-sd-03",
    q: ["When is `useReducer` a better fit than several `useState`?", "Quand `useReducer` convient-il mieux que plusieurs `useState` ?", "¿Cuándo encaja mejor `useReducer` que varios `useState`?"],
    a: ["When many updates touch related state: the transitions live in one pure function, `(state, action) => newState`", "Quand de nombreuses mises à jour touchent un état lié : les transitions vivent dans une fonction pure, `(state, action) => newState`", "Cuando muchas actualizaciones tocan estado relacionado: las transiciones viven en una función pura, `(state, action) => newState`"],
    w: [
      ["When the state is a number", "Quand l'état est un nombre", "Cuando el estado es un número"],
      ["When the state must be shared between tabs", "Quand l'état doit être partagé entre onglets", "Cuando el estado debe compartirse entre pestañas"],
      ["Whenever performance matters: it renders less", "Dès que la performance compte : il fait moins de rendus", "Siempre que importe el rendimiento: renderiza menos"],
    ],
    e: [
      "A reducer names what happened (`{ type: \"added\", id }`) and computes the next state in one place, which can be tested without React. It does not render less than `useState`. Pass `dispatch` down: its identity never changes.",
      "Un reducer nomme ce qui s'est passé (`{ type: \"added\", id }`) et calcule l'état suivant en un seul endroit, testable sans React. Il ne fait pas moins de rendus que `useState`. Transmettre `dispatch` : son identité ne change jamais.",
      "Un reducer nombra lo que pasó (`{ type: \"added\", id }`) y calcula el siguiente estado en un solo sitio, que se puede probar sin React. No renderiza menos que `useState`. Pasar `dispatch` hacia abajo: su identidad nunca cambia.",
    ],
  },
  {
    id: "re-sd-04",
    q: ["State `{ user: { name: \"Ana\", age: 9 } }`: how is the age changed?", "État `{ user: { name: \"Ana\", age: 9 } }` : comment changer l'âge ?", "Estado `{ user: { name: \"Ana\", age: 9 } }`: ¿cómo se cambia la edad?"],
    a: ["`setState({ ...state, user: { ...state.user, age: 10 } })`", "`setState({ ...state, user: { ...state.user, age: 10 } })`", "`setState({ ...state, user: { ...state.user, age: 10 } })`"],
    w: [
      ["`state.user.age = 10; setState(state)`", "`state.user.age = 10; setState(state)`", "`state.user.age = 10; setState(state)`"],
      ["`setState({ user: { age: 10 } })`, merged like in classes", "`setState({ user: { age: 10 } })`, fusionné comme dans les classes", "`setState({ user: { age: 10 } })`, fusionado como en las clases"],
      ["`setState({ ...state, age: 10 })`", "`setState({ ...state, age: 10 })`", "`setState({ ...state, age: 10 })`"],
    ],
    e: [
      "A hook's setter replaces the value; it does not merge like a class's `this.setState`. Every level on the path to the change is copied, the rest is shared. Deep updates get long: flatten the state, use a reducer, or a helper such as Immer.",
      "Le setter d'un hook remplace la valeur ; il ne fusionne pas comme le `this.setState` des classes. Chaque niveau sur le chemin du changement est copié, le reste est partagé. Les mises à jour profondes s'allongent : aplatir l'état, utiliser un reducer, ou un outil comme Immer.",
      "El setter de un hook sustituye el valor; no fusiona como el `this.setState` de las clases. Cada nivel en el camino del cambio se copia, el resto se comparte. Las actualizaciones profundas se alargan: aplanar el estado, usar un reducer, o una herramienta como Immer.",
    ],
  },
  {
    id: "re-sd-05",
    q: ["A list of items and the `selected` one, both in state. What is the safer shape?", "Une liste d'éléments et l'élément `selected`, tous deux dans l'état. Quelle forme est la plus sûre ?", "Una lista de elementos y el `selected`, ambos en el estado. ¿Qué forma es más segura?"],
    a: ["Store `selectedId` and find the item at render time", "Garder `selectedId` et retrouver l'élément au rendu", "Guardar `selectedId` y buscar el elemento al renderizar"],
    w: [
      ["Store a copy of the selected item", "Garder une copie de l'élément sélectionné", "Guardar una copia del elemento seleccionado"],
      ["Store its index in the list", "Garder son indice dans la liste", "Guardar su índice en la lista"],
      ["Add `selected: true` to every item", "Ajouter `selected: true` à chaque élément", "Añadir `selected: true` a cada elemento"],
    ],
    e: [
      "A copy goes stale when the item is edited in the list; an index points at another item after a deletion or sort. An id is one fact, with no duplicate to keep in step. The same rule removes most `useEffect` syncing.",
      "Une copie devient périmée quand l'élément est modifié dans la liste ; un indice désigne un autre élément après une suppression ou un tri. Un identifiant est un seul fait, sans doublon à tenir à jour. La même règle supprime la plupart des synchronisations par `useEffect`.",
      "Una copia queda desfasada cuando el elemento se edita en la lista; un índice apunta a otro elemento tras un borrado o una ordenación. Un id es un solo dato, sin duplicado que mantener al día. La misma regla elimina la mayoría de las sincronizaciones con `useEffect`.",
    ],
  },
];

const effectsInPractice: ReactQuestion[] = [
  {
    id: "re-ep-01",
    q: ["An effect fetches `/api/user/${id}`. `id` changes quickly. What can go wrong?", "Un effet charge `/api/user/${id}`. `id` change vite. Qu'est-ce qui peut mal tourner ?", "Un efecto carga `/api/user/${id}`. `id` cambia rápido. ¿Qué puede salir mal?"],
    a: ["An older response arrives last and overwrites the newer one; the cleanup must ignore or abort it", "Une réponse plus ancienne arrive en dernier et écrase la plus récente ; le nettoyage doit l'ignorer ou l'annuler", "Una respuesta más antigua llega la última y sobrescribe la más reciente; la limpieza debe ignorarla o cancelarla"],
    w: [
      ["Nothing: React waits for each request", "Rien : React attend chaque requête", "Nada: React espera cada petición"],
      ["The browser merges the two requests", "Le navigateur fusionne les deux requêtes", "El navegador fusiona las dos peticiones"],
      ["The effect only runs once anyway", "L'effet ne s'exécute qu'une fois de toute façon", "El efecto solo se ejecuta una vez de todos modos"],
    ],
    e: [
      "A race: requests finish in any order. In the effect, create an `AbortController`, pass its `signal` to `fetch`, and call `abort()` in the cleanup (or set an `ignore` flag). Data libraries (TanStack Query, SWR, a framework's loaders) handle this, caching and retries for you.",
      "Une course : les requêtes se terminent dans n'importe quel ordre. Dans l'effet, créer un `AbortController`, passer son `signal` à `fetch`, et appeler `abort()` dans le nettoyage (ou poser un drapeau `ignore`). Les bibliothèques de données (TanStack Query, SWR, les loaders d'un framework) gèrent cela, le cache et les nouvelles tentatives.",
      "Una carrera: las peticiones terminan en cualquier orden. En el efecto, crear un `AbortController`, pasar su `signal` a `fetch`, y llamar a `abort()` en la limpieza (o poner una bandera `ignore`). Las bibliotecas de datos (TanStack Query, SWR, los loaders de un framework) gestionan esto, la caché y los reintentos.",
    ],
  },
  {
    id: "re-ep-02",
    q: ["A form resets a field when `userId` changes, with `useEffect(() => setText(\"\"), [userId])`. Better?", "Un formulaire vide un champ quand `userId` change, avec `useEffect(() => setText(\"\"), [userId])`. Mieux ?", "Un formulario vacía un campo cuando cambia `userId`, con `useEffect(() => setText(\"\"), [userId])`. ¿Mejor?"],
    a: ["`<Form key={userId} />`: a new key gives a fresh component and fresh state", "`<Form key={userId} />` : une nouvelle clé donne un composant neuf et un état neuf", "`<Form key={userId} />`: una clave nueva da un componente nuevo y estado nuevo"],
    w: [
      ["Add `text` to the dependencies", "Ajouter `text` aux dépendances", "Añadir `text` a las dependencias"],
      ["Use `useLayoutEffect` instead", "Utiliser `useLayoutEffect` à la place", "Usar `useLayoutEffect` en su lugar"],
      ["Reset it in a `setTimeout`", "Le vider dans un `setTimeout`", "Vaciarlo en un `setTimeout`"],
    ],
    e: [
      "The effect renders once with the old text for the new user, then again. A key tells React that a different user means a different form. Effects that only adjust state from props are usually unnecessary.",
      "L'effet fait un rendu avec l'ancien texte pour le nouvel utilisateur, puis un autre. Une clé dit à React qu'un autre utilisateur est un autre formulaire. Les effets qui ne font qu'ajuster l'état à partir des props sont en général inutiles.",
      "El efecto renderiza una vez con el texto viejo para el usuario nuevo, y luego otra vez. Una clave le dice a React que otro usuario es otro formulario. Los efectos que solo ajustan el estado a partir de las props suelen sobrar.",
    ],
  },
  {
    id: "re-ep-03",
    q: ["A click must send an analytics event and a POST. Where does that code go?", "Un clic doit envoyer un événement d'analyse et un POST. Où va ce code ?", "Un clic debe enviar un evento de analítica y un POST. ¿Dónde va ese código?"],
    a: ["In the click handler", "Dans le gestionnaire du clic", "En el manejador del clic"],
    w: [
      ["In an effect that watches a `clicked` state", "Dans un effet qui surveille un état `clicked`", "En un efecto que vigila un estado `clicked`"],
      ["In the component's body", "Dans le corps du composant", "En el cuerpo del componente"],
      ["In a layout effect, to be sure it runs", "Dans un effet de layout, pour être sûr qu'il s'exécute", "En un efecto de layout, para estar seguro de que se ejecuta"],
    ],
    e: [
      "Code caused by a specific interaction belongs to that interaction's handler. An effect runs because the component is displayed, not because the user did something; routing a click through state and an effect adds a render and fires again in StrictMode or after a remount.",
      "Le code causé par une interaction précise appartient au gestionnaire de cette interaction. Un effet s'exécute parce que le composant est affiché, pas parce que l'utilisateur a fait quelque chose ; faire passer un clic par un état et un effet ajoute un rendu et se redéclenche en StrictMode ou après un remontage.",
      "El código causado por una interacción concreta pertenece al manejador de esa interacción. Un efecto se ejecuta porque el componente se muestra, no porque el usuario haya hecho algo; pasar un clic por un estado y un efecto añade un renderizado y se vuelve a disparar en StrictMode o tras un remontaje.",
    ],
  },
  {
    id: "re-ep-04",
    q: ["An effect uses an object `options` created in the component's body, listed in its dependencies. What happens?", "Un effet utilise un objet `options` créé dans le corps du composant, listé dans ses dépendances. Que se passe-t-il ?", "Un efecto usa un objeto `options` creado en el cuerpo del componente, listado en sus dependencias. ¿Qué pasa?"],
    a: ["The effect runs after every render: a new object is never `Object.is`-equal to the previous one", "L'effet s'exécute après chaque rendu : un nouvel objet n'est jamais égal au précédent selon `Object.is`", "El efecto se ejecuta tras cada renderizado: un objeto nuevo nunca es igual al anterior según `Object.is`"],
    w: [
      ["React compares the object's contents", "React compare le contenu de l'objet", "React compara el contenido del objeto"],
      ["Objects are ignored in dependency lists", "Les objets sont ignorés dans les listes de dépendances", "Los objetos se ignoran en las listas de dependencias"],
      ["It runs once, like `[]`", "Il s'exécute une fois, comme `[]`", "Se ejecuta una vez, como `[]`"],
    ],
    e: [
      "Create the object inside the effect, depend on its primitive fields (`roomId`, `serverUrl`), or move it out of the component if it is constant. `useMemo` works too but hides the cause. Silencing the linter instead leaves stale values.",
      "Créer l'objet dans l'effet, dépendre de ses champs primitifs (`roomId`, `serverUrl`), ou le sortir du composant s'il est constant. `useMemo` marche aussi mais cache la cause. Faire taire le linter laisse des valeurs périmées.",
      "Crear el objeto dentro del efecto, depender de sus campos primitivos (`roomId`, `serverUrl`), o sacarlo del componente si es constante. `useMemo` también funciona pero oculta la causa. Silenciar el linter deja valores desfasados.",
    ],
  },
  {
    id: "re-ep-05",
    q: ["In development, an effect that opens a connection connects, disconnects and connects again on mount. Why?", "En développement, un effet qui ouvre une connexion se connecte, se déconnecte et se reconnecte au montage. Pourquoi ?", "En desarrollo, un efecto que abre una conexión se conecta, se desconecta y se vuelve a conectar al montar. ¿Por qué?"],
    a: ["StrictMode runs effect, cleanup and effect again, to check the cleanup undoes the setup", "StrictMode exécute l'effet, le nettoyage puis l'effet à nouveau, pour vérifier que le nettoyage défait la mise en place", "StrictMode ejecuta efecto, limpieza y efecto otra vez, para comprobar que la limpieza deshace lo preparado"],
    w: [
      ["A bug in React 19, fixed by `[]`", "Un bogue de React 19, corrigé par `[]`", "Un error de React 19, corregido con `[]`"],
      ["Vite reloads the module twice", "Vite recharge le module deux fois", "Vite recarga el módulo dos veces"],
      ["The component is rendered by two roots", "Le composant est rendu par deux racines", "El componente lo renderizan dos raíces"],
    ],
    e: [
      "It only happens in development under `<StrictMode>`. With a correct cleanup the user sees no difference, and the same code survives real remounts (navigation, Activity, Fast Refresh). Do not fight it with a ref that skips the second run; fix the cleanup.",
      "Cela n'arrive qu'en développement sous `<StrictMode>`. Avec un nettoyage correct, l'utilisateur ne voit aucune différence, et le même code survit aux vrais remontages (navigation, Activity, Fast Refresh). Ne pas le contourner avec une ref qui saute la seconde exécution ; corriger le nettoyage.",
      "Solo ocurre en desarrollo bajo `<StrictMode>`. Con una limpieza correcta el usuario no nota diferencia, y el mismo código sobrevive a remontajes reales (navegación, Activity, Fast Refresh). No evitarlo con una ref que se salta la segunda ejecución; corregir la limpieza.",
    ],
  },
];

const renderRules: ReactQuestion[] = [
  {
    id: "re-rr-01",
    q: ["What does \"a component must be pure\" mean?", "Que veut dire « un composant doit être pur » ?", "¿Qué significa «un componente debe ser puro»?"],
    a: ["Given the same props, state and context, it returns the same JSX and changes nothing outside during render", "Avec les mêmes props, état et contexte, il renvoie le même JSX et ne modifie rien à l'extérieur pendant le rendu", "Con las mismas props, estado y contexto, devuelve el mismo JSX y no cambia nada fuera durante el renderizado"],
    w: [
      ["It may not use state", "Il n'a pas le droit d'utiliser l'état", "No puede usar estado"],
      ["It has no props", "Il n'a pas de props", "No tiene props"],
      ["It renders only once", "Il ne fait qu'un seul rendu", "Solo renderiza una vez"],
    ],
    e: [
      "React may call a component several times, pause, discard or redo a render (transitions, StrictMode, Suspense). Mutating a variable outside, changing props, or writing to the DOM during render breaks that. Side effects go in handlers and effects; local mutation of objects created during the render is fine.",
      "React peut appeler un composant plusieurs fois, mettre un rendu en pause, l'abandonner ou le refaire (transitions, StrictMode, Suspense). Modifier une variable extérieure, changer les props ou écrire dans le DOM pendant le rendu casse cela. Les effets de bord vont dans les gestionnaires et les effets ; modifier un objet créé pendant le rendu reste permis.",
      "React puede llamar a un componente varias veces, pausar, descartar o rehacer un renderizado (transiciones, StrictMode, Suspense). Cambiar una variable externa, modificar props o escribir en el DOM durante el renderizado lo rompe. Los efectos secundarios van en manejadores y efectos; mutar objetos creados durante el renderizado está bien.",
    ],
  },
  {
    id: "re-rr-02",
    q: ["A component is defined inside another component's body. What happens on each render of the parent?", "Un composant est défini dans le corps d'un autre composant. Que se passe-t-il à chaque rendu du parent ?", "Un componente se define dentro del cuerpo de otro. ¿Qué pasa en cada renderizado del padre?"],
    a: ["It is a new component type each time: React unmounts and remounts it, losing its state and focus", "C'est un nouveau type de composant à chaque fois : React le démonte et le remonte, en perdant son état et le focus", "Es un tipo de componente nuevo cada vez: React lo desmonta y lo vuelve a montar, perdiendo su estado y el foco"],
    w: [
      ["Nothing special; it is just slower", "Rien de particulier ; c'est juste plus lent", "Nada especial; solo es más lento"],
      ["React reuses it, since its code is the same", "React le réutilise, puisque son code est le même", "React lo reutiliza, ya que su código es el mismo"],
      ["It is a syntax error", "C'est une erreur de syntaxe", "Es un error de sintaxis"],
    ],
    e: [
      "React compares element types by identity: a function created during render is a new type, so its subtree is replaced. A text field inside it loses focus at every keystroke. Define components at the top level of the module and pass data as props.",
      "React compare les types d'éléments par identité : une fonction créée pendant le rendu est un nouveau type, donc son sous-arbre est remplacé. Un champ de texte à l'intérieur perd le focus à chaque frappe. Définir les composants au premier niveau du module et passer les données en props.",
      "React compara los tipos de elementos por identidad: una función creada durante el renderizado es un tipo nuevo, así que su subárbol se sustituye. Un campo de texto dentro pierde el foco en cada pulsación. Definir los componentes en el nivel superior del módulo y pasar los datos como props.",
    ],
  },
  {
    id: "re-rr-03",
    q: ["`{cond ? <Counter /> : <Counter />}` with `cond` toggling: is the counter's state kept?", "`{cond ? <Counter /> : <Counter />}` avec `cond` qui bascule : l'état du compteur est-il gardé ?", "`{cond ? <Counter /> : <Counter />}` con `cond` alternando: ¿se conserva el estado del contador?"],
    a: ["Yes: same type at the same position, so React keeps the same instance", "Oui : même type à la même position, donc React garde la même instance", "Sí: mismo tipo en la misma posición, así que React mantiene la misma instancia"],
    w: [
      ["No: the two branches are different components", "Non : les deux branches sont des composants différents", "No: las dos ramas son componentes distintos"],
      ["Only if the props are equal", "Seulement si les props sont égales", "Solo si las props son iguales"],
      ["No: a ternary always remounts", "Non : un ternaire remonte toujours", "No: un ternario siempre vuelve a montar"],
    ],
    e: [
      "State belongs to a position in the tree, identified by type and key, not to the JSX that produced it. To get two independent counters, give them different keys (`key=\"a\"`, `key=\"b\"`) or put them at different positions.",
      "L'état appartient à une position dans l'arbre, identifiée par le type et la clé, pas au JSX qui l'a produit. Pour avoir deux compteurs indépendants, leur donner des clés différentes (`key=\"a\"`, `key=\"b\"`) ou les placer à des positions différentes.",
      "El estado pertenece a una posición en el árbol, identificada por tipo y clave, no al JSX que la produjo. Para tener dos contadores independientes, darles claves distintas (`key=\"a\"`, `key=\"b\"`) o ponerlos en posiciones distintas.",
    ],
  },
  {
    id: "re-rr-04",
    q: ["Why does calling a state setter directly in the component's body usually fail?", "Pourquoi appeler un setter d'état directement dans le corps du composant échoue-t-il en général ?", "¿Por qué llamar a un setter de estado directamente en el cuerpo del componente suele fallar?"],
    a: ["Each render asks for another render: React stops with \"Too many re-renders\"", "Chaque rendu en demande un autre : React s'arrête sur « Too many re-renders »", "Cada renderizado pide otro: React se detiene con «Too many re-renders»"],
    w: [
      ["Setters only exist inside effects", "Les setters n'existent que dans les effets", "Los setters solo existen dentro de los efectos"],
      ["The new value is ignored silently", "La nouvelle valeur est ignorée en silence", "El valor nuevo se ignora en silencio"],
      ["It works and is the recommended way", "Ça marche, et c'est la méthode recommandée", "Funciona y es la forma recomendada"],
    ],
    e: [
      "An unconditional `setN(...)` during render loops. The one accepted pattern is a guarded update that stores the previous prop and adjusts state when it changes (`if (prev !== items) { setPrev(items); ... }`), and even that is rarely needed: compute the value or use a key.",
      "Un `setN(...)` inconditionnel pendant le rendu boucle. Le seul usage admis est une mise à jour gardée qui retient la prop précédente et ajuste l'état quand elle change (`if (prev !== items) { setPrev(items); ... }`), et même cela sert rarement : calculer la valeur ou utiliser une clé.",
      "Un `setN(...)` incondicional durante el renderizado entra en bucle. El único patrón aceptado es una actualización protegida que guarda la prop anterior y ajusta el estado cuando cambia (`if (prev !== items) { setPrev(items); ... }`), e incluso eso rara vez hace falta: calcular el valor o usar una clave.",
    ],
  },
];

const formsActions: ReactQuestion[] = [
  {
    id: "re-form-01",
    q: ["In React 19, what can a `<form>`'s `action` prop be?", "Dans React 19, que peut être la prop `action` d'un `<form>` ?", "En React 19, ¿qué puede ser la prop `action` de un `<form>`?"],
    a: ["A function, called with the form's `FormData` on submit; React manages the pending state and resets the form", "Une fonction, appelée avec le `FormData` du formulaire à l'envoi ; React gère l'attente et réinitialise le formulaire", "Una función, llamada con el `FormData` del formulario al enviar; React gestiona el estado pendiente y reinicia el formulario"],
    w: [
      ["Only a URL, as in HTML", "Seulement une URL, comme en HTML", "Solo una URL, como en HTML"],
      ["A string naming a reducer", "Une chaîne qui nomme un reducer", "Una cadena que nombra un reducer"],
      ["A promise to await before rendering", "Une promesse à attendre avant le rendu", "Una promesa que esperar antes de renderizar"],
    ],
    e: [
      "Functions passed to `action` are Actions: they may be async, run in a transition, and the form's uncontrolled fields are reset when they succeed. No `onSubmit` with `preventDefault` is needed. With a framework, the function can be a server function (`\"use server\"`).",
      "Les fonctions passées à `action` sont des Actions : elles peuvent être asynchrones, s'exécutent dans une transition, et les champs non contrôlés du formulaire sont réinitialisés quand elles réussissent. Plus besoin d'`onSubmit` avec `preventDefault`. Avec un framework, la fonction peut être une fonction serveur (`\"use server\"`).",
      "Las funciones pasadas a `action` son Actions: pueden ser asíncronas, se ejecutan en una transición, y los campos no controlados del formulario se reinician cuando tienen éxito. Ya no hace falta `onSubmit` con `preventDefault`. Con un framework, la función puede ser una función de servidor (`\"use server\"`).",
    ],
  },
  {
    id: "re-form-02",
    q: ["What does `useActionState(action, initial)` return?", "Que renvoie `useActionState(action, initial)` ?", "¿Qué devuelve `useActionState(action, initial)`?"],
    a: ["The last result of the action, a wrapped action to pass to the form, and whether it is pending", "Le dernier résultat de l'action, une action enveloppée à passer au formulaire, et si elle est en cours", "El último resultado de la acción, una acción envuelta para pasar al formulario, y si está pendiente"],
    w: [
      ["The form's field values", "Les valeurs des champs du formulaire", "Los valores de los campos del formulario"],
      ["A promise of the server's response", "Une promesse de la réponse du serveur", "Una promesa de la respuesta del servidor"],
      ["A ref to the `<form>` element", "Une ref vers l'élément `<form>`", "Una ref al elemento `<form>`"],
    ],
    e: [
      "`const [state, formAction, isPending] = useActionState(save, null)`: `save(previousState, formData)` returns the next state, often errors to display. It replaced the `useFormState` of the canaries.",
      "`const [state, formAction, isPending] = useActionState(save, null)` : `save(previousState, formData)` renvoie l'état suivant, souvent des erreurs à afficher. Il remplace le `useFormState` des versions canary.",
      "`const [state, formAction, isPending] = useActionState(save, null)`: `save(previousState, formData)` devuelve el estado siguiente, a menudo errores que mostrar. Sustituye al `useFormState` de las versiones canary.",
    ],
  },
  {
    id: "re-form-03",
    q: ["A submit button must show \"Saving…\" while its form's action runs. Which hook, called where?", "Un bouton d'envoi doit afficher « Enregistrement… » pendant l'action de son formulaire. Quel hook, appelé où ?", "Un botón de envío debe mostrar «Guardando…» mientras se ejecuta la acción de su formulario. ¿Qué hook, llamado dónde?"],
    a: ["`useFormStatus()` from `react-dom`, in a component rendered inside the `<form>`", "`useFormStatus()` de `react-dom`, dans un composant rendu à l'intérieur du `<form>`", "`useFormStatus()` de `react-dom`, en un componente renderizado dentro del `<form>`"],
    w: [
      ["`useFormStatus()` in the component that renders the `<form>`", "`useFormStatus()` dans le composant qui rend le `<form>`", "`useFormStatus()` en el componente que renderiza el `<form>`"],
      ["`useState` set in `onClick`", "`useState` modifié dans `onClick`", "`useState` cambiado en `onClick`"],
      ["`useEffect` watching the form", "`useEffect` qui surveille le formulaire", "`useEffect` que vigila el formulario"],
    ],
    e: [
      "`useFormStatus` reads the status of the parent form, like a context the form provides; the component that renders the `<form>` is above it and sees nothing. Hence a small `<SubmitButton />` that reads `pending` and disables itself.",
      "`useFormStatus` lit l'état du formulaire parent, comme un contexte fourni par le formulaire ; le composant qui rend le `<form>` est au-dessus et ne voit rien. D'où un petit `<SubmitButton />` qui lit `pending` et se désactive.",
      "`useFormStatus` lee el estado del formulario padre, como un contexto que el formulario proporciona; el componente que renderiza el `<form>` está por encima y no ve nada. De ahí un pequeño `<SubmitButton />` que lee `pending` y se desactiva.",
    ],
  },
  {
    id: "re-form-04",
    q: ["What does `useOptimistic` give?", "Que fournit `useOptimistic` ?", "¿Qué proporciona `useOptimistic`?"],
    a: ["A value shown at once while an action runs, which falls back to the real state when it ends", "Une valeur affichée tout de suite pendant qu'une action s'exécute, qui revient à l'état réel quand elle se termine", "Un valor mostrado al instante mientras se ejecuta una acción, que vuelve al estado real cuando termina"],
    w: [
      ["A cache of server responses", "Un cache des réponses du serveur", "Una caché de las respuestas del servidor"],
      ["Automatic retries of failed requests", "Des nouvelles tentatives automatiques des requêtes échouées", "Reintentos automáticos de las peticiones fallidas"],
      ["A faster render for large lists", "Un rendu plus rapide pour les grandes listes", "Un renderizado más rápido para listas grandes"],
    ],
    e: [
      "A new message appears in the list as soon as it is sent, marked as sending. When the action finishes, the optimistic value is dropped and the real state, now containing the message (or not, after an error), is shown. The rollback is automatic.",
      "Un nouveau message apparaît dans la liste dès l'envoi, marqué comme en cours. Quand l'action se termine, la valeur optimiste est abandonnée et l'état réel, qui contient maintenant le message (ou pas, après une erreur), est affiché. Le retour en arrière est automatique.",
      "Un mensaje nuevo aparece en la lista en cuanto se envía, marcado como enviándose. Cuando termina la acción, el valor optimista se descarta y se muestra el estado real, que ya contiene el mensaje (o no, tras un error). La vuelta atrás es automática.",
    ],
  },
  {
    id: "re-form-05",
    q: ["TanStack Query's `useQuery({ queryKey: [\"user\", id], queryFn })`: what is the key for?", "`useQuery({ queryKey: [\"user\", id], queryFn })` de TanStack Query : à quoi sert la clé ?", "`useQuery({ queryKey: [\"user\", id], queryFn })` de TanStack Query: ¿para qué sirve la clave?"],
    a: ["It identifies the data in the cache: components with the same key share one request and one result", "Elle identifie les données dans le cache : des composants avec la même clé partagent une requête et un résultat", "Identifica los datos en la caché: los componentes con la misma clave comparten una petición y un resultado"],
    w: [
      ["It is the URL to fetch", "C'est l'URL à charger", "Es la URL que cargar"],
      ["It encrypts the response", "Elle chiffre la réponse", "Cifra la respuesta"],
      ["It is the React `key` of the component", "C'est la `key` React du composant", "Es la `key` de React del componente"],
    ],
    e: [
      "When `id` changes, the key changes and the matching data is loaded (or taken from the cache). Mutations invalidate keys to refetch. By default data is stale at once (`staleTime` 0) and refetched when the window regains focus; unused data is kept for five minutes.",
      "Quand `id` change, la clé change et les données correspondantes sont chargées (ou prises dans le cache). Les mutations invalident des clés pour recharger. Par défaut les données sont périmées tout de suite (`staleTime` 0) et rechargées quand la fenêtre reprend le focus ; les données inutilisées sont gardées cinq minutes.",
      "Cuando cambia `id`, cambia la clave y se cargan los datos correspondientes (o se toman de la caché). Las mutaciones invalidan claves para recargar. Por defecto los datos quedan obsoletos al instante (`staleTime` 0) y se recargan cuando la ventana recupera el foco; los datos sin usar se guardan cinco minutos.",
    ],
  },
];

const eventsHooks: ReactQuestion[] = [
  {
    id: "re-ev-01",
    q: ["What type is the event in `onChange` of an `<input>`?", "Quel est le type de l'événement dans le `onChange` d'un `<input>` ?", "¿Qué tipo tiene el evento en el `onChange` de un `<input>`?"],
    a: ["`React.ChangeEvent<HTMLInputElement>`", "`React.ChangeEvent<HTMLInputElement>`", "`React.ChangeEvent<HTMLInputElement>`"],
    w: [["`Event`", "`Event`", "`Event`"], ["`InputEvent`", "`InputEvent`", "`InputEvent`"], ["`React.MouseEvent<HTMLInputElement>`", "`React.MouseEvent<HTMLInputElement>`", "`React.MouseEvent<HTMLInputElement>`"]],
    e: [
      "React passes its own synthetic events, typed by kind and element. Written inline, `onChange={(e) => setText(e.target.value)}` needs no annotation: the type is inferred from the prop. React's `onChange` fires at every keystroke, like the DOM's `input` event.",
      "React passe ses propres événements synthétiques, typés selon la sorte et l'élément. Écrit en ligne, `onChange={(e) => setText(e.target.value)}` n'a besoin d'aucune annotation : le type est déduit de la prop. Le `onChange` de React se déclenche à chaque frappe, comme l'événement `input` du DOM.",
      "React pasa sus propios eventos sintéticos, tipados según el tipo y el elemento. Escrito en línea, `onChange={(e) => setText(e.target.value)}` no necesita anotación: el tipo se deduce de la prop. El `onChange` de React se dispara en cada pulsación, como el evento `input` del DOM.",
    ],
  },
  {
    id: "re-ev-02",
    q: ["`const input = useRef<HTMLInputElement>(null)`: what is the type of `input.current`?", "`const input = useRef<HTMLInputElement>(null)` : quel est le type de `input.current` ?", "`const input = useRef<HTMLInputElement>(null)`: ¿qué tipo tiene `input.current`?"],
    a: ["`HTMLInputElement | null`: null until React attaches it, so check before use", "`HTMLInputElement | null` : null tant que React ne l'a pas attaché, donc vérifier avant usage", "`HTMLInputElement | null`: null hasta que React lo asigna, así que comprobar antes de usarlo"],
    w: [["`HTMLInputElement`, always set", "`HTMLInputElement`, toujours défini", "`HTMLInputElement`, siempre definido"], ["`any`", "`any`", "`any`"], ["`string`, the input's value", "`string`, la valeur du champ", "`string`, el valor del campo"]],
    e: [
      "A DOM ref is filled after the commit and emptied on unmount. With React 19's types, `useRef` always takes an argument and returns a mutable `RefObject`; `input.current?.focus()` handles the null case.",
      "Une ref du DOM est remplie après le commit et vidée au démontage. Avec les types de React 19, `useRef` prend toujours un argument et renvoie un `RefObject` modifiable ; `input.current?.focus()` gère le cas null.",
      "Una ref del DOM se rellena tras el commit y se vacía al desmontar. Con los tipos de React 19, `useRef` siempre recibe un argumento y devuelve un `RefObject` mutable; `input.current?.focus()` gestiona el caso null.",
    ],
  },
  {
    id: "re-ev-03",
    q: ["A `Button` should accept every prop a `<button>` accepts, plus `variant`. How is it typed?", "Un `Button` doit accepter toutes les props d'un `<button>`, plus `variant`. Comment le typer ?", "Un `Button` debe aceptar todas las props de un `<button>`, más `variant`. ¿Cómo se tipa?"],
    a: ["`React.ComponentProps<\"button\"> & { variant: \"primary\" | \"ghost\" }`", "`React.ComponentProps<\"button\"> & { variant: \"primary\" | \"ghost\" }`", "`React.ComponentProps<\"button\"> & { variant: \"primary\" | \"ghost\" }`"],
    w: [["`HTMLButtonElement & { variant: string }`", "`HTMLButtonElement & { variant: string }`", "`HTMLButtonElement & { variant: string }`"], ["`{ [key: string]: any }`", "`{ [key: string]: any }`", "`{ [key: string]: any }`"], ["`React.ButtonHTMLAttributes`", "`React.ButtonHTMLAttributes`", "`React.ButtonHTMLAttributes`"]],
    e: [
      "`ComponentProps<\"button\">` is the props of the intrinsic element, `onClick`, `disabled`, `type`, ARIA attributes and `ref`. Spread the rest onto the element: `({ variant, ...rest }) => <button {...rest} />`. `HTMLButtonElement` is the DOM node's type, with methods, not props.",
      "`ComponentProps<\"button\">` donne les props de l'élément natif, `onClick`, `disabled`, `type`, attributs ARIA et `ref`. Étaler le reste sur l'élément : `({ variant, ...rest }) => <button {...rest} />`. `HTMLButtonElement` est le type du nœud du DOM, avec ses méthodes, pas des props.",
      "`ComponentProps<\"button\">` da las props del elemento nativo, `onClick`, `disabled`, `type`, atributos ARIA y `ref`. Propagar el resto sobre el elemento: `({ variant, ...rest }) => <button {...rest} />`. `HTMLButtonElement` es el tipo del nodo del DOM, con sus métodos, no props.",
    ],
  },
  {
    id: "re-ev-04",
    q: ["A custom hook returns `[value, setValue]`. Why add `as const`?", "Un hook personnalisé renvoie `[value, setValue]`. Pourquoi ajouter `as const` ?", "Un hook personalizado devuelve `[value, setValue]`. ¿Por qué añadir `as const`?"],
    a: ["Otherwise the type is an array of the union of both, not a two-item tuple", "Sinon le type est un tableau de l'union des deux, pas un tuple de deux éléments", "Si no, el tipo es un array de la unión de ambos, no una tupla de dos elementos"],
    w: [["To make the value immutable at run time", "Pour rendre la valeur immuable à l'exécution", "Para hacer el valor inmutable en tiempo de ejecución"], ["Hooks must return constants", "Les hooks doivent renvoyer des constantes", "Los hooks deben devolver constantes"], ["To avoid a re-render", "Pour éviter un rendu", "Para evitar un renderizado"]],
    e: [
      "`[\"a\", () => {}]` is inferred as `(string | (() => void))[]`, so destructuring gives unions on both sides. `as const` gives `readonly [string, () => void]`. An object return (`{ value, setValue }`) avoids the question.",
      "`[\"a\", () => {}]` est déduit en `(string | (() => void))[]` : la déstructuration donne des unions des deux côtés. `as const` donne `readonly [string, () => void]`. Renvoyer un objet (`{ value, setValue }`) évite la question.",
      "`[\"a\", () => {}]` se deduce como `(string | (() => void))[]`, así que la desestructuración da uniones a ambos lados. `as const` da `readonly [string, () => void]`. Devolver un objeto (`{ value, setValue }`) evita el problema.",
    ],
  },
];

const devWorkflow: ReactQuestion[] = [
  {
    id: "re-dw-01",
    q: ["What does Fast Refresh keep when a component file is edited?", "Que garde Fast Refresh quand on modifie le fichier d'un composant ?", "¿Qué conserva Fast Refresh al editar el archivo de un componente?"],
    a: ["The state of the components, as long as the file exports only components", "L'état des composants, tant que le fichier n'exporte que des composants", "El estado de los componentes, siempre que el archivo exporte solo componentes"],
    w: [["Nothing: the page reloads", "Rien : la page se recharge", "Nada: la página se recarga"], ["The DOM only, not the state", "Seulement le DOM, pas l'état", "Solo el DOM, no el estado"], ["Everything, even after changing hook order", "Tout, même après avoir changé l'ordre des hooks", "Todo, incluso tras cambiar el orden de los hooks"]],
    e: [
      "A file that also exports constants or helpers forces a full reload of its importers. Changing which hooks a component calls resets its state. The ESLint rule `react-refresh/only-export-components` flags mixed files.",
      "Un fichier qui exporte aussi des constantes ou des utilitaires force un rechargement complet de ceux qui l'importent. Changer les hooks qu'appelle un composant réinitialise son état. La règle ESLint `react-refresh/only-export-components` signale les fichiers mixtes.",
      "Un archivo que también exporta constantes o utilidades obliga a recargar del todo a quienes lo importan. Cambiar los hooks que llama un componente reinicia su estado. La regla de ESLint `react-refresh/only-export-components` señala los archivos mixtos.",
    ],
  },
  {
    id: "re-dw-02",
    q: ["Vite does not type-check while bundling. How is a type error kept out of production?", "Vite ne vérifie pas les types en construisant. Comment éviter qu'une erreur de type arrive en production ?", "Vite no comprueba los tipos al empaquetar. ¿Cómo se evita que un error de tipos llegue a producción?"],
    a: ["Run `tsc --noEmit` (or `tsc -b`) in the build script and in CI", "Lancer `tsc --noEmit` (ou `tsc -b`) dans le script de build et en CI", "Ejecutar `tsc --noEmit` (o `tsc -b`) en el script de compilación y en CI"],
    w: [["Vite checks types in `build` but not in `dev`", "Vite vérifie les types au `build` mais pas en `dev`", "Vite comprueba los tipos en `build` pero no en `dev`"], ["Set `strict: true`, which makes Vite check", "Mettre `strict: true`, ce qui fait vérifier Vite", "Poner `strict: true`, lo que hace que Vite compruebe"], ["Types cannot fail a build", "Les types ne peuvent pas faire échouer un build", "Los tipos no pueden hacer fallar una compilación"]],
    e: [
      "Vite strips types file by file, which is fast but sees no cross-file errors. The `react-ts` template's build script is `tsc -b && vite build`. Editors show errors as you type, which is not a check of the whole project.",
      "Vite retire les types fichier par fichier, ce qui est rapide mais ne voit aucune erreur entre fichiers. Le script de build du modèle `react-ts` est `tsc -b && vite build`. L'éditeur montre les erreurs à la frappe, ce qui ne vérifie pas tout le projet.",
      "Vite quita los tipos archivo por archivo, lo que es rápido pero no ve errores entre archivos. El script de compilación de la plantilla `react-ts` es `tsc -b && vite build`. El editor muestra errores al escribir, lo que no comprueba todo el proyecto.",
    ],
  },
  {
    id: "re-dw-03",
    q: ["What does the ESLint plugin `eslint-plugin-react-hooks` check?", "Que vérifie le plugin ESLint `eslint-plugin-react-hooks` ?", "¿Qué comprueba el plugin de ESLint `eslint-plugin-react-hooks`?"],
    a: ["The rules of hooks and the dependency lists of effects, and, in recent versions, rules from the React Compiler", "Les règles des hooks et les listes de dépendances des effets, et, dans les versions récentes, des règles du React Compiler", "Las reglas de los hooks y las listas de dependencias de los efectos y, en versiones recientes, reglas del React Compiler"],
    w: [["Formatting and indentation of JSX", "Le formatage et l'indentation du JSX", "El formato y la sangría del JSX"], ["Accessibility of the markup", "L'accessibilité du balisage", "La accesibilidad del marcado"], ["The types of props", "Les types des props", "Los tipos de las props"]],
    e: [
      "`rules-of-hooks` catches conditional hooks; `exhaustive-deps` catches values missing from dependency lists. Its recommended preset uses the flat config format. Formatting is Prettier's job; accessibility, `eslint-plugin-jsx-a11y`; types, `tsc`.",
      "`rules-of-hooks` repère les hooks conditionnels ; `exhaustive-deps` les valeurs absentes des listes de dépendances. Son préréglage recommandé utilise le format de configuration flat. Le formatage est le travail de Prettier ; l'accessibilité, d'`eslint-plugin-jsx-a11y` ; les types, de `tsc`.",
      "`rules-of-hooks` detecta los hooks condicionales; `exhaustive-deps`, los valores que faltan en las listas de dependencias. Su preajuste recomendado usa el formato de configuración flat. El formato es cosa de Prettier; la accesibilidad, de `eslint-plugin-jsx-a11y`; los tipos, de `tsc`.",
    ],
  },
  {
    id: "re-dw-04",
    q: ["A Vite build produces `assets/index-4f3a9c.js`. How should a server cache it?", "Un build Vite produit `assets/index-4f3a9c.js`. Comment un serveur doit-il le mettre en cache ?", "Una compilación de Vite produce `assets/index-4f3a9c.js`. ¿Cómo debe guardarlo en caché un servidor?"],
    a: ["For a long time, `immutable`: its name changes with its content. `index.html` itself is not cached (or revalidated)", "Longtemps, `immutable` : son nom change avec son contenu. `index.html` lui-même n'est pas mis en cache (ou revalidé)", "Mucho tiempo, `immutable`: su nombre cambia con su contenido. `index.html` en sí no se guarda en caché (o se revalida)"],
    w: [["Never: JavaScript must always be fresh", "Jamais : le JavaScript doit toujours être frais", "Nunca: el JavaScript debe estar siempre fresco"], ["Like `index.html`, for one hour", "Comme `index.html`, pendant une heure", "Como `index.html`, durante una hora"], ["Only in the browser's memory, until a reload", "Seulement en mémoire du navigateur, jusqu'au rechargement", "Solo en memoria del navegador, hasta recargar"]],
    e: [
      "Hashed names make long caching safe: a new build has new names, and the fresh `index.html` points to them. If `index.html` were cached, users would keep loading the old bundle after a deployment.",
      "Les noms à empreinte rendent le long cache sûr : un nouveau build a de nouveaux noms, et l'`index.html` frais pointe vers eux. Si `index.html` était en cache, les utilisateurs continueraient à charger l'ancien bundle après un déploiement.",
      "Los nombres con hash hacen seguro el caché largo: una compilación nueva tiene nombres nuevos, y el `index.html` fresco apunta a ellos. Si `index.html` estuviera en caché, los usuarios seguirían cargando el bundle viejo tras un despliegue.",
    ],
  },
];

const componentTests: ReactQuestion[] = [
  {
    id: "re-ct-01",
    q: ["`getByText`, `queryByText`, `findByText`: what tells them apart?", "`getByText`, `queryByText`, `findByText` : qu'est-ce qui les distingue ?", "`getByText`, `queryByText`, `findByText`: ¿qué los diferencia?"],
    a: ["`get` throws if absent, `query` returns `null`, `find` returns a promise that waits for it", "`get` lève une erreur si absent, `query` renvoie `null`, `find` renvoie une promesse qui l'attend", "`get` lanza un error si no está, `query` devuelve `null`, `find` devuelve una promesa que lo espera"],
    w: [["Speed only", "Seulement la vitesse", "Solo la velocidad"], ["`find` searches the whole document, the others the component", "`find` cherche dans tout le document, les autres dans le composant", "`find` busca en todo el documento, los otros en el componente"], ["They are aliases", "Ce sont des alias", "Son alias"]],
    e: [
      "Use `get` for what must be there, `query` to assert absence (`expect(queryByText(\"Error\")).toBeNull()`), `find` for what appears after something asynchronous, such as data loading.",
      "`get` pour ce qui doit être là, `query` pour vérifier une absence (`expect(queryByText(\"Error\")).toBeNull()`), `find` pour ce qui apparaît après quelque chose d'asynchrone, comme un chargement de données.",
      "`get` para lo que debe estar, `query` para comprobar una ausencia (`expect(queryByText(\"Error\")).toBeNull()`), `find` para lo que aparece tras algo asíncrono, como una carga de datos.",
    ],
  },
  {
    id: "re-ct-02",
    q: ["Why prefer `user-event` to `fireEvent` for typing into a field?", "Pourquoi préférer `user-event` à `fireEvent` pour taper dans un champ ?", "¿Por qué preferir `user-event` a `fireEvent` para escribir en un campo?"],
    a: ["It reproduces a real interaction: focus, key events, input per character", "Il reproduit une vraie interaction : focus, événements clavier, saisie caractère par caractère", "Reproduce una interacción real: foco, eventos de teclado, entrada carácter a carácter"],
    w: [["It is synchronous and faster", "Il est synchrone et plus rapide", "Es síncrono y más rápido"], ["It skips React's handlers", "Il saute les gestionnaires de React", "Se salta los manejadores de React"], ["`fireEvent` does not exist any more", "`fireEvent` n'existe plus", "`fireEvent` ya no existe"]],
    e: [
      "`fireEvent.change` dispatches one event; a person also focuses, presses keys and may be blocked by a disabled field. `const user = userEvent.setup(); await user.type(input, \"hi\")`: its methods are async and must be awaited.",
      "`fireEvent.change` envoie un seul événement ; une personne donne aussi le focus, presse des touches et peut être bloquée par un champ désactivé. `const user = userEvent.setup(); await user.type(input, \"hi\")` : ses méthodes sont asynchrones et doivent être attendues.",
      "`fireEvent.change` envía un solo evento; una persona también enfoca, pulsa teclas y puede quedar bloqueada por un campo desactivado. `const user = userEvent.setup(); await user.type(input, \"hi\")`: sus métodos son asíncronos y hay que esperarlos.",
    ],
  },
  {
    id: "re-ct-03",
    q: ["A component loads data with `fetch`. In a unit test, the network is replaced how?", "Un composant charge des données avec `fetch`. Dans un test unitaire, comment remplacer le réseau ?", "Un componente carga datos con `fetch`. En un test unitario, ¿cómo se sustituye la red?"],
    a: ["With Mock Service Worker (MSW) handlers that answer the requests, or by stubbing `fetch`", "Avec des handlers de Mock Service Worker (MSW) qui répondent aux requêtes, ou en remplaçant `fetch`", "Con handlers de Mock Service Worker (MSW) que responden a las peticiones, o sustituyendo `fetch`"],
    w: [["By calling the real production API", "En appelant la vraie API de production", "Llamando a la API real de producción"], ["It cannot: such components are untestable", "Impossible : de tels composants ne sont pas testables", "No se puede: esos componentes no se pueden probar"], ["By mocking React's `useEffect`", "En simulant le `useEffect` de React", "Simulando el `useEffect` de React"]],
    e: [
      "MSW intercepts requests at the network level, so the component's real code runs; the same handlers can serve the browser in development. Tests must not depend on a live server, its data or its availability.",
      "MSW intercepte les requêtes au niveau du réseau : le vrai code du composant s'exécute ; les mêmes handlers peuvent servir le navigateur en développement. Les tests ne doivent pas dépendre d'un serveur réel, de ses données ou de sa disponibilité.",
      "MSW intercepta las peticiones a nivel de red, así que se ejecuta el código real del componente; los mismos handlers pueden servir al navegador en desarrollo. Los tests no deben depender de un servidor real, de sus datos ni de su disponibilidad.",
    ],
  },
  {
    id: "re-ct-04",
    q: ["How is a custom hook tested on its own?", "Comment tester un hook personnalisé seul ?", "¿Cómo se prueba un hook personalizado por sí solo?"],
    a: ["With `renderHook` from Testing Library, which renders it in a test component", "Avec `renderHook` de Testing Library, qui le rend dans un composant de test", "Con `renderHook` de Testing Library, que lo renderiza en un componente de prueba"],
    w: [["By calling it like a normal function", "En l'appelant comme une fonction normale", "Llamándolo como una función normal"], ["Hooks cannot be tested", "Les hooks ne peuvent pas être testés", "Los hooks no se pueden probar"], ["With `React.testHook`", "Avec `React.testHook`", "Con `React.testHook`"]],
    e: [
      "A hook outside a component throws (\"Invalid hook call\"). `const { result } = renderHook(() => useCounter())` gives `result.current`; wrap updates in `act`. Often it is simpler to test a component that uses the hook.",
      "Un hook hors d'un composant lève une erreur (« Invalid hook call »). `const { result } = renderHook(() => useCounter())` donne `result.current` ; envelopper les mises à jour dans `act`. Souvent, tester un composant qui utilise le hook est plus simple.",
      "Un hook fuera de un componente lanza un error («Invalid hook call»). `const { result } = renderHook(() => useCounter())` da `result.current`; envolver las actualizaciones en `act`. A menudo es más simple probar un componente que use el hook.",
    ],
  },
];

export const components = { composition };
export const state = { stateDesign };
export const effects = { effectsInPractice };
export const rendering = { renderRules };
export const data = { formsActions };
export const typing = { eventsHooks };
export const tooling = { devWorkflow };
export const testing = { componentTests };
