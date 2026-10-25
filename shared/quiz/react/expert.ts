/**
 * React, Expert: how React works inside (reconciliation, concurrent
 * rendering, effects' phases), streaming and pre-rendering on the server,
 * React 19's types, the platform around the app, and test strategy.
 */
import type { LinuxQuestion as ReactQuestion } from "../linux/types";

const internals: ReactQuestion[] = [
  {
    id: "re-int-01",
    q: ["A click inside a portal rendered into `document.body` reaches which `onClick` handlers?", "Un clic dans un portail rendu dans `document.body` atteint quels gestionnaires `onClick` ?", "¿A qué manejadores `onClick` llega un clic dentro de un portal renderizado en `document.body`?"],
    a: ["Those of its React ancestors, even though its DOM parent is `body`", "Ceux de ses ancêtres React, même si son parent dans le DOM est `body`", "Los de sus ancestros de React, aunque su padre en el DOM sea `body`"],
    w: [["Only the handlers of `body` and `document`", "Seulement ceux de `body` et de `document`", "Solo los de `body` y `document`"], ["None: portals stop propagation", "Aucun : les portails stoppent la propagation", "Ninguno: los portales detienen la propagación"], ["Those of the element the portal is placed next to in the DOM", "Ceux de l'élément à côté duquel le portail est placé dans le DOM", "Los del elemento junto al que se coloca el portal en el DOM"]],
    e: [
      "React dispatches its synthetic events along the component tree. A modal's clicks therefore bubble to the component that opened it, which may close it by accident: stop propagation in the modal, or check the target. Native listeners added with `addEventListener` still follow the DOM.",
      "React distribue ses événements synthétiques le long de l'arbre des composants. Les clics d'une fenêtre modale remontent donc vers le composant qui l'a ouverte, qui peut la fermer par erreur : stopper la propagation dans la modale, ou vérifier la cible. Les écouteurs natifs ajoutés avec `addEventListener` suivent toujours le DOM.",
      "React reparte sus eventos sintéticos a lo largo del árbol de componentes. Así que los clics de un modal suben al componente que lo abrió, que puede cerrarlo sin querer: detener la propagación en el modal, o comprobar el destino. Los escuchadores nativos añadidos con `addEventListener` siguen el DOM.",
    ],
  },
  {
    id: "re-int-02",
    q: ["React's work on an update has two phases. Which can be interrupted?", "Le travail de React sur une mise à jour a deux phases. Laquelle peut être interrompue ?", "El trabajo de React en una actualización tiene dos fases. ¿Cuál se puede interrumpir?"],
    a: ["Rendering (calling components, diffing) can be paused or thrown away; the commit to the DOM is synchronous", "Le rendu (appeler les composants, comparer) peut être mis en pause ou abandonné ; le commit dans le DOM est synchrone", "El renderizado (llamar a componentes, comparar) se puede pausar o descartar; el commit al DOM es síncrono"],
    w: [["The commit, so the browser can paint between DOM changes", "Le commit, pour que le navigateur puisse peindre entre deux modifications du DOM", "El commit, para que el navegador pueda pintar entre cambios del DOM"], ["Both, at any point", "Les deux, à tout moment", "Ambas, en cualquier momento"], ["Neither: React always blocks until done", "Aucune : React bloque toujours jusqu'à la fin", "Ninguna: React siempre bloquea hasta terminar"]],
    e: [
      "Concurrent rendering (transitions, Suspense, deferred values) yields to the browser between components and may restart; that is why rendering must be pure. The commit applies all changes at once, then runs layout effects, and later passive effects, so the user never sees a half-updated screen.",
      "Le rendu concurrent (transitions, Suspense, valeurs différées) rend la main au navigateur entre deux composants et peut recommencer ; c'est pourquoi le rendu doit être pur. Le commit applique tous les changements d'un coup, puis exécute les effets de layout, et plus tard les effets passifs : l'utilisateur ne voit jamais un écran à moitié mis à jour.",
      "El renderizado concurrente (transiciones, Suspense, valores diferidos) cede el control al navegador entre componentes y puede reiniciarse; por eso el renderizado debe ser puro. El commit aplica todos los cambios de una vez, luego ejecuta los efectos de layout y después los pasivos, así el usuario nunca ve una pantalla a medio actualizar.",
    ],
  },
  {
    id: "re-int-03",
    q: ["React compares the old and new trees in linear time thanks to which assumptions?", "React compare l'ancien et le nouvel arbre en temps linéaire grâce à quelles hypothèses ?", "¿Gracias a qué supuestos compara React el árbol viejo y el nuevo en tiempo lineal?"],
    a: ["Elements of different types produce different trees, and keys identify children across renders", "Des éléments de types différents produisent des arbres différents, et les clés identifient les enfants d'un rendu à l'autre", "Elementos de tipos distintos producen árboles distintos, y las claves identifican a los hijos entre renderizados"],
    w: [["It compares every node with every other node", "Il compare chaque nœud à tous les autres", "Compara cada nodo con todos los demás"], ["It hashes the HTML of each subtree", "Il calcule une empreinte du HTML de chaque sous-arbre", "Calcula un hash del HTML de cada subárbol"], ["It only compares the root element", "Il ne compare que l'élément racine", "Solo compara el elemento raíz"]],
    e: [
      "A general tree diff costs O(n³). React instead replaces a subtree whenever the type at a position changes (a `div` becoming a `section`, or a component becoming another), and matches lists by key. Hence the rules: stable component definitions, stable keys.",
      "Une comparaison générale d'arbres coûte O(n³). React remplace plutôt un sous-arbre dès que le type à une position change (un `div` devenu `section`, ou un composant devenu un autre), et associe les listes par clé. D'où les règles : définitions de composants stables, clés stables.",
      "Una comparación general de árboles cuesta O(n³). React, en cambio, sustituye un subárbol en cuanto cambia el tipo en una posición (un `div` que pasa a `section`, o un componente que pasa a ser otro), y empareja las listas por clave. De ahí las reglas: definiciones de componentes estables, claves estables.",
    ],
  },
];

const concurrency: ReactQuestion[] = [
  {
    id: "re-con-01",
    q: ["What is \"tearing\", and what prevents it?", "Qu'est-ce que le « tearing », et qu'est-ce qui l'empêche ?", "¿Qué es el «tearing» y qué lo evita?"],
    a: ["Parts of one screen showing different versions of an external store during a concurrent render; `useSyncExternalStore` prevents it", "Des parties d'un même écran qui montrent des versions différentes d'un store externe pendant un rendu concurrent ; `useSyncExternalStore` l'empêche", "Partes de una misma pantalla mostrando versiones distintas de un store externo durante un renderizado concurrente; `useSyncExternalStore` lo evita"],
    w: [["A CSS bug in animations; `will-change` prevents it", "Un bogue CSS des animations ; `will-change` l'empêche", "Un fallo de CSS en animaciones; `will-change` lo evita"], ["Losing state on unmount; `key` prevents it", "La perte d'état au démontage ; `key` l'empêche", "Perder el estado al desmontar; `key` lo evita"], ["Two roots on one page; `createPortal` prevents it", "Deux racines sur une page ; `createPortal` l'empêche", "Dos raíces en una página; `createPortal` lo evita"]],
    e: [
      "A render that yields can resume after the store changed, so early components saw the old value and later ones the new. React's own state cannot tear; a mutable external source can. `useSyncExternalStore` detects the change and renders synchronously with one snapshot.",
      "Un rendu qui rend la main peut reprendre après un changement du store : les premiers composants ont vu l'ancienne valeur et les suivants la nouvelle. L'état propre à React ne peut pas se déchirer ; une source externe modifiable, si. `useSyncExternalStore` détecte le changement et refait un rendu synchrone avec un seul instantané.",
      "Un renderizado que cede el control puede reanudarse tras cambiar el store, así que los primeros componentes vieron el valor viejo y los siguientes el nuevo. El estado propio de React no puede desgarrarse; una fuente externa mutable, sí. `useSyncExternalStore` detecta el cambio y renderiza de forma síncrona con una sola instantánea.",
    ],
  },
  {
    id: "re-con-02",
    q: ["Inside an async Action, code runs after an `await`. Are state updates made there part of the transition?", "Dans une Action asynchrone, du code s'exécute après un `await`. Les mises à jour d'état faites là font-elles partie de la transition ?", "Dentro de una Action asíncrona, hay código que se ejecuta tras un `await`. ¿Las actualizaciones de estado hechas ahí forman parte de la transición?"],
    a: ["Not automatically: wrap them in another `startTransition`, since the async context is lost after `await`", "Pas automatiquement : les envelopper dans un nouveau `startTransition`, car le contexte est perdu après `await`", "No automáticamente: envolverlas en otro `startTransition`, porque el contexto se pierde tras el `await`"],
    w: [["Yes, everything in the function is", "Oui, tout ce qui est dans la fonction en fait partie", "Sí, todo lo que hay en la función forma parte"], ["They are ignored", "Elles sont ignorées", "Se ignoran"], ["They throw an error", "Elles lèvent une erreur", "Lanzan un error"]],
    e: [
      "React knows an update belongs to a transition while the callback runs synchronously. After an `await`, the code runs later from the event loop, outside that scope; the React docs call this out and recommend a nested `startTransition` until JavaScript has async context.",
      "React sait qu'une mise à jour appartient à une transition tant que la fonction s'exécute de façon synchrone. Après un `await`, le code s'exécute plus tard depuis la boucle d'événements, hors de cette portée ; la documentation de React le signale et conseille un `startTransition` imbriqué tant que JavaScript n'a pas de contexte asynchrone.",
      "React sabe que una actualización pertenece a una transición mientras la función se ejecuta de forma síncrona. Tras un `await`, el código se ejecuta más tarde desde el bucle de eventos, fuera de ese ámbito; la documentación de React lo advierte y recomienda un `startTransition` anidado hasta que JavaScript tenga contexto asíncrono.",
    ],
  },
  {
    id: "re-con-03",
    q: ["Why does a Suspense boundary that already shows content not swap back to its fallback during a transition?", "Pourquoi une Suspense boundary qui montre déjà du contenu ne revient-elle pas à son fallback pendant une transition ?", "¿Por qué un Suspense que ya muestra contenido no vuelve a su fallback durante una transición?"],
    a: ["React keeps the visible content while the transition's render suspends, rather than hiding it behind a spinner", "React garde le contenu visible pendant que le rendu de la transition suspend, plutôt que de le cacher derrière un indicateur", "React mantiene el contenido visible mientras el renderizado de la transición se suspende, en lugar de ocultarlo tras un indicador"],
    w: [["Fallbacks are shown only once per page load", "Les fallbacks ne s'affichent qu'une fois par chargement", "Los fallbacks solo se muestran una vez por carga"], ["Transitions cannot suspend", "Les transitions ne peuvent pas suspendre", "Las transiciones no pueden suspenderse"], ["The fallback is shown, but under the content", "Le fallback est affiché, mais sous le contenu", "El fallback se muestra, pero debajo del contenido"]],
    e: [
      "Replacing a page the user is reading with a spinner is worse than a short wait. Urgent updates that suspend do show the fallback. New boundaries inside the transition's tree still show theirs; `isPending` lets the old screen hint that something is loading.",
      "Remplacer une page que l'utilisateur lit par un indicateur de chargement est pire qu'une courte attente. Les mises à jour urgentes qui suspendent affichent bien le fallback. Les nouvelles boundaries dans l'arbre de la transition montrent le leur ; `isPending` permet à l'ancien écran de signaler un chargement.",
      "Sustituir por un indicador una página que el usuario está leyendo es peor que una espera corta. Las actualizaciones urgentes que se suspenden sí muestran el fallback. Los boundaries nuevos dentro del árbol de la transición muestran el suyo; `isPending` permite a la pantalla vieja indicar que algo carga.",
    ],
  },
];

const effectsExpert: ReactQuestion[] = [
  {
    id: "re-ee-01",
    q: ["Who is `useInsertionEffect` for?", "À qui sert `useInsertionEffect` ?", "¿Para quién es `useInsertionEffect`?"],
    a: ["CSS-in-JS libraries, to insert `<style>` rules before layout effects read the layout", "Aux bibliothèques CSS-in-JS, pour insérer des règles `<style>` avant que les effets de layout ne lisent la mise en page", "A las bibliotecas de CSS-in-JS, para insertar reglas `<style>` antes de que los efectos de layout lean el diseño"],
    w: [["Any component inserting DOM nodes", "Tout composant qui insère des nœuds du DOM", "Cualquier componente que inserte nodos del DOM"], ["Analytics, to run before render", "L'analytique, pour s'exécuter avant le rendu", "La analítica, para ejecutarse antes del renderizado"], ["Server rendering only", "Le rendu serveur uniquement", "Solo el renderizado en servidor"]],
    e: [
      "It runs before every layout effect and cannot update state or read refs. Inserting styles there avoids layout being computed with missing rules. Application code almost never needs it.",
      "Il s'exécute avant tout effet de layout et ne peut ni changer l'état ni lire des refs. Y insérer les styles évite de calculer la mise en page avec des règles manquantes. Le code d'application n'en a presque jamais besoin.",
      "Se ejecuta antes que cualquier efecto de layout y no puede cambiar el estado ni leer refs. Insertar ahí los estilos evita calcular el diseño con reglas que faltan. El código de aplicación casi nunca lo necesita.",
    ],
  },
  {
    id: "re-ee-02",
    q: ["A ref callback in React 19 returns a function. When is it called?", "Une ref fonction dans React 19 renvoie une fonction. Quand est-elle appelée ?", "Una ref de función en React 19 devuelve una función. ¿Cuándo se llama?"],
    a: ["When the element is detached (or the callback changes), instead of calling the callback with `null`", "Quand l'élément est détaché (ou que la fonction change), au lieu d'appeler la fonction avec `null`", "Cuando el elemento se desconecta (o cambia la función), en lugar de llamar a la función con `null`"],
    w: [["Never: the return value is ignored", "Jamais : la valeur renvoyée est ignorée", "Nunca: el valor devuelto se ignora"], ["After every render", "Après chaque rendu", "Tras cada renderizado"], ["Before the element is created", "Avant la création de l'élément", "Antes de crear el elemento"]],
    e: [
      "`ref={(node) => { const o = new ResizeObserver(cb); o.observe(node); return () => o.disconnect(); }}` pairs setup and teardown like an effect. An inline callback is a new function at each render, so it is detached and attached again each time unless it is stable.",
      "`ref={(node) => { const o = new ResizeObserver(cb); o.observe(node); return () => o.disconnect(); }}` associe mise en place et nettoyage comme un effet. Une fonction écrite en ligne est nouvelle à chaque rendu : elle est détachée puis rattachée à chaque fois, sauf si elle est stable.",
      "`ref={(node) => { const o = new ResizeObserver(cb); o.observe(node); return () => o.disconnect(); }}` empareja preparación y limpieza como un efecto. Una función escrita en línea es nueva en cada renderizado, así que se desconecta y se vuelve a conectar cada vez, salvo que sea estable.",
    ],
  },
  {
    id: "re-ee-03",
    q: ["An effect reads a value through a stale closure even though the dependency list is complete. A likely cause?", "Un effet lit une valeur via une closure périmée bien que la liste de dépendances soit complète. Une cause probable ?", "Un efecto lee un valor a través de una clausura desfasada aunque la lista de dependencias esté completa. ¿Una causa probable?"],
    a: ["A callback registered once (a listener, a timer) keeps the closure of the render that registered it", "Une fonction enregistrée une seule fois (un écouteur, une minuterie) garde la closure du rendu qui l'a enregistrée", "Una función registrada una sola vez (un escuchador, un temporizador) conserva la clausura del renderizado que la registró"],
    w: [["React caches effects between sessions", "React met les effets en cache entre les sessions", "React guarda los efectos en caché entre sesiones"], ["`Object.is` fails on numbers", "`Object.is` échoue sur les nombres", "`Object.is` falla con números"], ["Dependencies are compared only on mount", "Les dépendances ne sont comparées qu'au montage", "Las dependencias solo se comparan al montar"]],
    e: [
      "`setInterval(() => setN(n + 1), 1000)` in an effect with `[]` always sees the first `n`. Use an updater (`setN((v) => v + 1)`), re-subscribe when the value changes, or read it through an Effect Event or a ref.",
      "`setInterval(() => setN(n + 1), 1000)` dans un effet avec `[]` voit toujours le premier `n`. Utiliser une fonction de mise à jour (`setN((v) => v + 1)`), se réabonner quand la valeur change, ou la lire par un Effect Event ou une ref.",
      "`setInterval(() => setN(n + 1), 1000)` en un efecto con `[]` siempre ve el primer `n`. Usar una función de actualización (`setN((v) => v + 1)`), volver a suscribirse cuando cambie el valor, o leerlo con un Effect Event o una ref.",
    ],
  },
];

const reconciliation: ReactQuestion[] = [
  {
    id: "re-rec-01",
    q: ["Which code does the React Compiler leave unoptimised?", "Quel code le React Compiler laisse-t-il sans optimisation ?", "¿Qué código deja el React Compiler sin optimizar?"],
    a: ["Components that break the rules of React, such as mutating props or reading refs during render", "Les composants qui enfreignent les règles de React, comme modifier des props ou lire des refs pendant le rendu", "Los componentes que rompen las reglas de React, como mutar props o leer refs durante el renderizado"],
    w: [["Every component with an effect", "Tout composant avec un effet", "Todo componente con un efecto"], ["Components written as arrow functions", "Les composants écrits en fonctions fléchées", "Los componentes escritos como funciones flecha"], ["Components longer than 100 lines", "Les composants de plus de 100 lignes", "Los componentes de más de 100 líneas"]],
    e: [
      "The compiler analyses each component; when it cannot prove memoisation safe it skips that component and the rest of the app is still compiled. The compiler-powered rules of `eslint-plugin-react-hooks` report these violations, and `\"use no memo\"` opts a component out by hand.",
      "Le compilateur analyse chaque composant ; s'il ne peut prouver la mémoïsation sûre, il saute ce composant et le reste de l'application est compilé. Les règles d'`eslint-plugin-react-hooks` fondées sur le compilateur signalent ces infractions, et `\"use no memo\"` exclut un composant à la main.",
      "El compilador analiza cada componente; cuando no puede demostrar que memoizar es seguro, se salta ese componente y el resto de la app se compila igual. Las reglas de `eslint-plugin-react-hooks` basadas en el compilador señalan esas infracciones, y `\"use no memo\"` excluye un componente a mano.",
    ],
  },
  {
    id: "re-rec-02",
    q: ["`setN(5)` when `n` is already 5: what does React do?", "`setN(5)` alors que `n` vaut déjà 5 : que fait React ?", "`setN(5)` cuando `n` ya vale 5: ¿qué hace React?"],
    a: ["It bails out: no re-render of the children, though it may call the component once more before deciding", "Il abandonne : pas de nouveau rendu des enfants, même s'il peut appeler le composant une fois de plus avant de décider", "Se retira: no vuelve a renderizar a los hijos, aunque puede llamar al componente una vez más antes de decidir"],
    w: [["It always re-renders the whole subtree", "Il refait toujours le rendu de tout le sous-arbre", "Siempre vuelve a renderizar todo el subárbol"], ["It throws, since nothing changed", "Il lève une erreur, puisque rien n'a changé", "Lanza un error, porque nada cambió"], ["It schedules the update for the next session", "Il reporte la mise à jour à la session suivante", "Aplaza la actualización a la siguiente sesión"]],
    e: [
      "With `Object.is` equality React can skip the work. Sometimes it has to render the component itself to find out, then discards the result without touching children or effects. Code should not depend on how many times a component renders.",
      "Avec une égalité selon `Object.is`, React peut s'épargner le travail. Parfois il doit rendre le composant lui-même pour s'en rendre compte, puis jette le résultat sans toucher aux enfants ni aux effets. Le code ne doit pas dépendre du nombre de rendus d'un composant.",
      "Con igualdad según `Object.is`, React puede ahorrarse el trabajo. A veces tiene que renderizar el propio componente para averiguarlo, y luego descarta el resultado sin tocar hijos ni efectos. El código no debe depender de cuántas veces renderiza un componente.",
    ],
  },
  {
    id: "re-rec-03",
    q: ["What does `useId` return, and what is it for?", "Que renvoie `useId`, et à quoi sert-il ?", "¿Qué devuelve `useId` y para qué sirve?"],
    a: ["A string unique to the component instance and identical on server and client, for `id` and `aria-*` attributes", "Une chaîne unique à l'instance du composant et identique sur le serveur et le client, pour les attributs `id` et `aria-*`", "Una cadena única para la instancia del componente e idéntica en servidor y cliente, para atributos `id` y `aria-*`"],
    w: [["A random number, for list keys", "Un nombre aléatoire, pour les clés de liste", "Un número aleatorio, para claves de lista"], ["The database id of the current user", "L'identifiant en base de l'utilisateur courant", "El id en la base de datos del usuario actual"], ["A counter incremented at each render", "Un compteur incrémenté à chaque rendu", "Un contador que aumenta en cada renderizado"]],
    e: [
      "It is derived from the component's position in the tree, so server and client agree and hydration matches. It must not be used as a list `key`, which should come from data. React 19.2 changed its format to `_r_…`, valid in CSS selectors and view-transition names.",
      "Il est dérivé de la position du composant dans l'arbre : serveur et client sont d'accord et l'hydratation correspond. Il ne doit pas servir de `key` de liste, qui doit venir des données. React 19.2 a changé son format en `_r_…`, valide dans les sélecteurs CSS et les noms de transitions de vue.",
      "Se deriva de la posición del componente en el árbol, así que servidor y cliente coinciden y la hidratación encaja. No debe usarse como `key` de lista, que debe venir de los datos. React 19.2 cambió su formato a `_r_…`, válido en selectores CSS y nombres de transiciones de vista.",
    ],
  },
  {
    id: "re-rec-04",
    q: ["Why may a component's body run in development more often than its effects?", "Pourquoi le corps d'un composant peut-il s'exécuter en développement plus souvent que ses effets ?", "¿Por qué el cuerpo de un componente puede ejecutarse en desarrollo más a menudo que sus efectos?"],
    a: ["StrictMode double-calls render, and concurrent renders can be discarded before any commit", "StrictMode appelle deux fois le rendu, et des rendus concurrents peuvent être abandonnés avant tout commit", "StrictMode llama dos veces al renderizado, y los renderizados concurrentes pueden descartarse antes de cualquier commit"],
    w: [["Effects are skipped in development", "Les effets sont sautés en développement", "Los efectos se saltan en desarrollo"], ["Vite runs each module twice", "Vite exécute chaque module deux fois", "Vite ejecuta cada módulo dos veces"], ["Effects run only once per session", "Les effets ne s'exécutent qu'une fois par session", "Los efectos solo se ejecutan una vez por sesión"]],
    e: [
      "A render is a calculation React may repeat or throw away; only a committed render runs effects. Counting renders, logging analytics or mutating in the body therefore gives wrong numbers. Put side effects where they belong: handlers and effects.",
      "Un rendu est un calcul que React peut répéter ou jeter ; seul un rendu validé (commit) exécute les effets. Compter les rendus, envoyer de l'analytique ou modifier quelque chose dans le corps donne donc de faux chiffres. Mettre les effets de bord à leur place : gestionnaires et effets.",
      "Un renderizado es un cálculo que React puede repetir o descartar; solo un renderizado confirmado (commit) ejecuta efectos. Contar renderizados, enviar analítica o mutar en el cuerpo da por tanto cifras falsas. Poner los efectos secundarios en su sitio: manejadores y efectos.",
    ],
  },
];

const streaming: ReactQuestion[] = [
  {
    id: "re-str-01",
    q: ["`renderToReadableStream` (or `renderToPipeableStream` in Node) streams HTML. What do Suspense boundaries add?", "`renderToReadableStream` (ou `renderToPipeableStream` sous Node) diffuse du HTML. Qu'apportent les Suspense boundaries ?", "`renderToReadableStream` (o `renderToPipeableStream` en Node) envía HTML por flujo. ¿Qué aportan los Suspense?"],
    a: ["The shell is sent at once with fallbacks; each boundary's HTML follows when its data is ready, and hydrates on its own", "L'enveloppe part tout de suite avec les fallbacks ; le HTML de chaque boundary suit quand ses données sont prêtes, et s'hydrate à part", "El armazón se envía al instante con los fallbacks; el HTML de cada boundary llega cuando sus datos están listos, y se hidrata por separado"],
    w: [["Nothing on the server; Suspense is client-only", "Rien côté serveur ; Suspense n'existe que dans le client", "Nada en el servidor; Suspense solo existe en el cliente"], ["They make the server wait for all data before sending", "Ils font attendre toutes les données au serveur avant l'envoi", "Hacen que el servidor espere todos los datos antes de enviar"], ["They split the page into separate HTTP requests", "Ils découpent la page en requêtes HTTP séparées", "Dividen la página en peticiones HTTP separadas"]],
    e: [
      "Streaming sends the top of the page early, then small chunks with inline scripts that put each section in place. Selective hydration makes the part the user interacts with hydrate first. The web-streams version runs on edge runtimes and servers such as Hono; Node uses pipeable streams.",
      "La diffusion envoie tôt le haut de la page, puis de petits morceaux avec des scripts en ligne qui mettent chaque section en place. L'hydratation sélective hydrate d'abord la partie avec laquelle l'utilisateur interagit. La version web streams tourne sur les runtimes edge et des serveurs comme Hono ; Node utilise les flux pipeable.",
      "El streaming envía pronto la parte superior de la página y luego fragmentos pequeños con scripts en línea que colocan cada sección. La hidratación selectiva hidrata primero la parte con la que interactúa el usuario. La versión de web streams funciona en runtimes edge y servidores como Hono; Node usa streams pipeable.",
    ],
  },
  {
    id: "re-str-02",
    q: ["React 19.2's partial pre-rendering: what does `prerender` return for a page with dynamic parts?", "Le pré-rendu partiel de React 19.2 : que renvoie `prerender` pour une page avec des parties dynamiques ?", "El prerenderizado parcial de React 19.2: ¿qué devuelve `prerender` para una página con partes dinámicas?"],
    a: ["A `prelude` of static HTML to serve from a CDN, and a `postponed` state from which `resume` streams the rest per request", "Un `prelude` de HTML statique à servir depuis un CDN, et un état `postponed` d'où `resume` diffuse le reste à chaque requête", "Un `prelude` de HTML estático para servir desde una CDN, y un estado `postponed` desde el que `resume` envía el resto en cada petición"],
    w: [["A complete HTML file with the dynamic data frozen", "Un fichier HTML complet avec les données dynamiques figées", "Un archivo HTML completo con los datos dinámicos congelados"], ["A JSON tree for the client to render", "Un arbre JSON que le client rend", "Un árbol JSON para que lo renderice el cliente"], ["A Service Worker", "Un Service Worker", "Un Service Worker"]],
    e: [
      "Static parts are rendered once at build or deploy time; dynamic parts, behind Suspense boundaries, are rendered when a request comes in, continuing from the saved state. It combines a fast first byte with per-user content.",
      "Les parties statiques sont rendues une fois, au build ou au déploiement ; les parties dynamiques, derrière des Suspense boundaries, sont rendues à l'arrivée d'une requête, en reprenant l'état enregistré. Cela combine un premier octet rapide et un contenu propre à chaque utilisateur.",
      "Las partes estáticas se renderizan una vez, al compilar o desplegar; las dinámicas, tras Suspense boundaries, se renderizan cuando llega una petición, continuando desde el estado guardado. Combina un primer byte rápido con contenido propio de cada usuario.",
    ],
  },
  {
    id: "re-str-03",
    q: ["`cacheSignal()` (React 19.2) is used where, for what?", "`cacheSignal()` (React 19.2) s'utilise où, pour quoi ?", "`cacheSignal()` (React 19.2) se usa dónde, ¿para qué?"],
    a: ["In server components, to get an `AbortSignal` that aborts when the `cache()` lifetime ends, so pending work can stop", "Dans les composants serveur, pour obtenir un `AbortSignal` qui s'annule à la fin de la durée de vie de `cache()`, afin d'arrêter le travail en cours", "En componentes de servidor, para obtener un `AbortSignal` que se cancela cuando termina la vida de `cache()`, para detener el trabajo pendiente"],
    w: [["In client components, to cancel a transition", "Dans les composants client, pour annuler une transition", "En componentes de cliente, para cancelar una transición"], ["In tests, to wait for all effects", "Dans les tests, pour attendre tous les effets", "En los tests, para esperar todos los efectos"], ["In Service Workers, to clear the HTTP cache", "Dans les Service Workers, pour vider le cache HTTP", "En los Service Workers, para vaciar la caché HTTP"]],
    e: [
      "`cache()` deduplicates calls during one server render. When that render completes, is aborted or fails, the signal fires: a `fetch(url, { signal: cacheSignal() })` started for it is cancelled instead of running for nothing.",
      "`cache()` dédoublonne les appels pendant un rendu serveur. Quand ce rendu se termine, est annulé ou échoue, le signal se déclenche : un `fetch(url, { signal: cacheSignal() })` lancé pour lui est annulé au lieu de tourner pour rien.",
      "`cache()` deduplica las llamadas durante un renderizado en servidor. Cuando ese renderizado termina, se cancela o falla, la señal se dispara: un `fetch(url, { signal: cacheSignal() })` iniciado para él se cancela en lugar de seguir para nada.",
    ],
  },
  {
    id: "re-str-04",
    q: ["In React 19, a `<title>` rendered inside a deep component ends up where?", "Dans React 19, un `<title>` rendu dans un composant profond se retrouve où ?", "En React 19, ¿dónde acaba un `<title>` renderizado en un componente profundo?"],
    a: ["In the document's `<head>`: React hoists `title`, `meta` and `link` tags", "Dans le `<head>` du document : React remonte les balises `title`, `meta` et `link`", "En el `<head>` del documento: React sube las etiquetas `title`, `meta` y `link`"],
    w: [["Inside the component's `div`, ignored by browsers", "Dans le `div` du composant, ignoré par les navigateurs", "Dentro del `div` del componente, ignorado por los navegadores"], ["Nowhere: it needs `react-helmet`", "Nulle part : il faut `react-helmet`", "En ninguna parte: hace falta `react-helmet`"], ["In a new window title only during development", "Dans un titre de fenêtre, en développement seulement", "En un título de ventana, solo en desarrollo"]],
    e: [
      "Document metadata can now be written next to the content it describes, on the client and in streamed server rendering. Stylesheets with `precedence` are also ordered and deduplicated, and scripts with `async` are loaded once.",
      "Les métadonnées du document peuvent maintenant s'écrire à côté du contenu qu'elles décrivent, côté client comme en rendu serveur diffusé. Les feuilles de style avec `precedence` sont aussi ordonnées et dédoublonnées, et les scripts `async` chargés une seule fois.",
      "Los metadatos del documento ahora se pueden escribir junto al contenido que describen, en el cliente y en el renderizado en servidor por streaming. Las hojas de estilo con `precedence` también se ordenan y deduplican, y los scripts `async` se cargan una sola vez.",
    ],
  },
];

const typesExpert: ReactQuestion[] = [
  {
    id: "re-te-01",
    q: ["With `@types/react` 19, where is the `JSX` namespace?", "Avec `@types/react` 19, où est l'espace de noms `JSX` ?", "Con `@types/react` 19, ¿dónde está el espacio de nombres `JSX`?"],
    a: ["Under `React.JSX`; the global `JSX` namespace is gone", "Sous `React.JSX` ; l'espace de noms global `JSX` a disparu", "Bajo `React.JSX`; el espacio de nombres global `JSX` ha desaparecido"],
    w: [["Still global, as before", "Toujours global, comme avant", "Sigue siendo global, como antes"], ["In `react-dom`", "Dans `react-dom`", "En `react-dom`"], ["Types no longer describe JSX", "Les types ne décrivent plus le JSX", "Los tipos ya no describen JSX"]],
    e: [
      "A global `JSX` clashed when several JSX libraries were installed. Code that wrote `JSX.Element` imports the type or writes `React.JSX.Element`. Augmenting intrinsic elements now goes through `declare module \"react\" { namespace JSX { … } }`.",
      "Un `JSX` global entrait en conflit quand plusieurs bibliothèques JSX étaient installées. Le code qui écrivait `JSX.Element` importe le type ou écrit `React.JSX.Element`. Étendre les éléments natifs passe maintenant par `declare module \"react\" { namespace JSX { … } }`.",
      "Un `JSX` global chocaba cuando había varias bibliotecas JSX instaladas. El código que escribía `JSX.Element` importa el tipo o escribe `React.JSX.Element`. Ampliar los elementos nativos pasa ahora por `declare module \"react\" { namespace JSX { … } }`.",
    ],
  },
  {
    id: "re-te-02",
    q: ["A polymorphic `<Text as=\"label\" htmlFor=\"x\">` should accept the props of whatever `as` names. The usual typing?", "Un `<Text as=\"label\" htmlFor=\"x\">` polymorphe doit accepter les props de ce que nomme `as`. Le typage habituel ?", "Un `<Text as=\"label\" htmlFor=\"x\">` polimórfico debe aceptar las props de lo que nombre `as`. ¿El tipado habitual?"],
    a: ["A generic `C extends React.ElementType`, with props `{ as?: C } & Omit<React.ComponentProps<C>, \"as\">`", "Un générique `C extends React.ElementType`, avec les props `{ as?: C } & Omit<React.ComponentProps<C>, \"as\">`", "Un genérico `C extends React.ElementType`, con props `{ as?: C } & Omit<React.ComponentProps<C>, \"as\">`"],
    w: [["`as: string` and `[key: string]: any`", "`as: string` et `[key: string]: any`", "`as: string` y `[key: string]: any`"], ["A union of every HTML element's props", "Une union des props de chaque élément HTML", "Una unión de las props de cada elemento HTML"], ["It cannot be typed", "Impossible à typer", "No se puede tipar"]],
    e: [
      "TypeScript infers `C` from `as`, then checks the other props against that element or component. A default (`C extends React.ElementType = \"span\"`) covers the case without `as`. Some libraries prefer an `asChild` prop that merges props into the single child, which is simpler to type.",
      "TypeScript déduit `C` de `as`, puis vérifie les autres props par rapport à cet élément ou composant. Une valeur par défaut (`C extends React.ElementType = \"span\"`) couvre le cas sans `as`. Certaines bibliothèques préfèrent une prop `asChild` qui fusionne les props dans l'unique enfant, plus simple à typer.",
      "TypeScript deduce `C` de `as` y luego comprueba las demás props contra ese elemento o componente. Un valor por defecto (`C extends React.ElementType = \"span\"`) cubre el caso sin `as`. Algunas bibliotecas prefieren una prop `asChild` que fusiona las props en el único hijo, más fácil de tipar.",
    ],
  },
  {
    id: "re-te-03",
    q: ["In React 19's types, what changed for `useRef`?", "Dans les types de React 19, qu'est-ce qui a changé pour `useRef` ?", "En los tipos de React 19, ¿qué cambió en `useRef`?"],
    a: ["It requires an argument, and the returned `RefObject` is always mutable; `MutableRefObject` is deprecated", "Il exige un argument, et le `RefObject` renvoyé est toujours modifiable ; `MutableRefObject` est déprécié", "Exige un argumento, y el `RefObject` devuelto es siempre mutable; `MutableRefObject` queda obsoleto"],
    w: [["It can no longer hold DOM nodes", "Il ne peut plus contenir de nœuds du DOM", "Ya no puede contener nodos del DOM"], ["`current` became read-only", "`current` est devenu en lecture seule", "`current` pasó a ser de solo lectura"], ["It was renamed `useReference`", "Il a été renommé `useReference`", "Se renombró como `useReference`"]],
    e: [
      "Before, `useRef<T>(null)` gave a read-only `current` and `useRef<T>()` an `undefined` one, a confusing split. Now `useRef<HTMLDivElement>(null)` is `RefObject<HTMLDivElement | null>`, assignable and passable to `ref`. Codemods handle most migrations.",
      "Avant, `useRef<T>(null)` donnait un `current` en lecture seule et `useRef<T>()` une valeur `undefined`, une distinction déroutante. Désormais `useRef<HTMLDivElement>(null)` est un `RefObject<HTMLDivElement | null>`, modifiable et utilisable comme `ref`. Des codemods font l'essentiel de la migration.",
      "Antes, `useRef<T>(null)` daba un `current` de solo lectura y `useRef<T>()` uno `undefined`, una división confusa. Ahora `useRef<HTMLDivElement>(null)` es `RefObject<HTMLDivElement | null>`, asignable y utilizable como `ref`. Los codemods hacen la mayor parte de la migración.",
    ],
  },
];

const platform: ReactQuestion[] = [
  {
    id: "re-plat-01",
    q: ["A React app is served with a strict Content Security Policy (`script-src 'self'`). What breaks?", "Une application React est servie avec une Content Security Policy stricte (`script-src 'self'`). Qu'est-ce qui casse ?", "Una app React se sirve con una Content Security Policy estricta (`script-src 'self'`). ¿Qué se rompe?"],
    a: ["Inline scripts and `eval`-like code, e.g. injected configuration or some dev tools; bundled files from the same origin still load", "Les scripts en ligne et le code de type `eval`, par ex. une configuration injectée ou certains outils de développement ; les fichiers du bundle de même origine se chargent toujours", "Los scripts en línea y el código tipo `eval`, p. ej. configuración inyectada o algunas herramientas de desarrollo; los archivos del bundle del mismo origen siguen cargando"],
    w: [["JSX, which is a form of `eval`", "Le JSX, qui est une forme d'`eval`", "JSX, que es una forma de `eval`"], ["Every `onClick` handler", "Chaque gestionnaire `onClick`", "Cada manejador `onClick`"], ["React itself, which needs `unsafe-inline`", "React lui-même, qui a besoin de `unsafe-inline`", "React mismo, que necesita `unsafe-inline`"]],
    e: [
      "React's handlers are JavaScript functions attached by React, not inline HTML attributes, so a strict CSP fits a Vite build. Streaming SSR's inline scripts need a nonce, which `renderToReadableStream` accepts. React escapes text by default; `dangerouslySetInnerHTML` is where XSS comes back.",
      "Les gestionnaires de React sont des fonctions JavaScript attachées par React, pas des attributs HTML en ligne : une CSP stricte convient à un build Vite. Les scripts en ligne du SSR en flux ont besoin d'un nonce, que `renderToReadableStream` accepte. React échappe le texte par défaut ; `dangerouslySetInnerHTML` est là où le XSS revient.",
      "Los manejadores de React son funciones de JavaScript que coloca React, no atributos HTML en línea, así que una CSP estricta encaja con una compilación de Vite. Los scripts en línea del SSR por streaming necesitan un nonce, que `renderToReadableStream` acepta. React escapa el texto por defecto; `dangerouslySetInnerHTML` es por donde vuelve el XSS.",
    ],
  },
  {
    id: "re-plat-02",
    q: ["A new version is deployed while a user has the old page open. A lazy route now fails to load its chunk. Why, and what helps?", "Une nouvelle version est déployée pendant qu'un utilisateur a l'ancienne page ouverte. Une route chargée à la demande n'arrive plus à charger son morceau. Pourquoi, et qu'est-ce qui aide ?", "Se despliega una versión nueva mientras un usuario tiene abierta la página vieja. Una ruta perezosa ya no logra cargar su fragmento. ¿Por qué, y qué ayuda?"],
    a: ["The old page asks for an old hashed file the server no longer has; keep previous assets for a while, and reload when a chunk fails", "L'ancienne page demande un ancien fichier haché que le serveur n'a plus ; garder les anciens fichiers un moment, et recharger quand un morceau échoue", "La página vieja pide un archivo con hash viejo que el servidor ya no tiene; conservar un tiempo los archivos anteriores, y recargar cuando falla un fragmento"],
    w: [["Browsers cache lazy chunks forever", "Les navigateurs gardent les morceaux à la demande pour toujours", "Los navegadores guardan los fragmentos perezosos para siempre"], ["`React.lazy` only works once per session", "`React.lazy` ne marche qu'une fois par session", "`React.lazy` solo funciona una vez por sesión"], ["The chunk was never built", "Le morceau n'a jamais été construit", "El fragmento nunca se compiló"]],
    e: [
      "Each build renames changed files. A tab opened before the deployment knows only the old names. Serving the previous build's assets alongside the new one, or catching the import error (Vite emits `vite:preloadError`) and reloading, avoids a broken screen. Checking a version file and reloading between screens works too.",
      "Chaque build renomme les fichiers modifiés. Un onglet ouvert avant le déploiement ne connaît que les anciens noms. Servir les fichiers du build précédent à côté du nouveau, ou attraper l'erreur d'import (Vite émet `vite:preloadError`) et recharger, évite un écran cassé. Vérifier un fichier de version et recharger entre deux écrans marche aussi.",
      "Cada compilación renombra los archivos cambiados. Una pestaña abierta antes del despliegue solo conoce los nombres viejos. Servir los archivos de la compilación anterior junto a los nuevos, o capturar el error de importación (Vite emite `vite:preloadError`) y recargar, evita una pantalla rota. Comprobar un archivo de versión y recargar entre pantallas también funciona.",
    ],
  },
  {
    id: "re-plat-03",
    q: ["Where does server-side rendering pay off, and where does a client-only SPA suffice?", "Où le rendu côté serveur est-il rentable, et où une SPA côté client suffit-elle ?", "¿Dónde compensa el renderizado en servidor y dónde basta una SPA en el cliente?"],
    a: ["SSR for public pages that need fast first paint and indexing; an SPA for an app behind a login where neither matters much", "Le SSR pour des pages publiques qui ont besoin d'un premier affichage rapide et d'être indexées ; une SPA pour une application derrière une connexion où ni l'un ni l'autre ne compte beaucoup", "SSR para páginas públicas que necesitan un primer pintado rápido e indexación; una SPA para una app tras un inicio de sesión donde nada de eso importa mucho"],
    w: [["SSR always: SPAs are deprecated", "Toujours le SSR : les SPA sont dépréciées", "Siempre SSR: las SPA están obsoletas"], ["SPA always: SSR is slower", "Toujours une SPA : le SSR est plus lent", "Siempre SPA: el SSR es más lento"], ["SSR only for apps with many users", "Le SSR seulement pour les applications à nombreux utilisateurs", "SSR solo para apps con muchos usuarios"]],
    e: [
      "SSR costs a server that renders, and care with hydration; it gives HTML before JavaScript, which helps search engines, link previews and slow devices. A private tool served as static files with an API is simpler to run. Pre-rendering at build time covers static public pages without a rendering server.",
      "Le SSR coûte un serveur qui rend, et de l'attention à l'hydratation ; il donne du HTML avant le JavaScript, ce qui aide les moteurs de recherche, les aperçus de liens et les appareils lents. Un outil privé servi en fichiers statiques avec une API est plus simple à exploiter. Le pré-rendu au build couvre les pages publiques statiques sans serveur de rendu.",
      "El SSR cuesta un servidor que renderiza, y cuidado con la hidratación; da HTML antes que JavaScript, lo que ayuda a los buscadores, las vistas previas de enlaces y los dispositivos lentos. Una herramienta privada servida como archivos estáticos con una API es más simple de operar. El prerenderizado al compilar cubre las páginas públicas estáticas sin servidor de renderizado.",
    ],
  },
];

const testStrategy: ReactQuestion[] = [
  {
    id: "re-ts-01",
    q: ["A component shows a toast that disappears after 5 s. How is that tested quickly?", "Un composant affiche un message qui disparaît après 5 s. Comment le tester vite ?", "Un componente muestra un aviso que desaparece tras 5 s. ¿Cómo se prueba rápido?"],
    a: ["Fake timers (`vi.useFakeTimers()`), advanced by hand, with `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`", "Des minuteries simulées (`vi.useFakeTimers()`), avancées à la main, avec `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`", "Temporizadores simulados (`vi.useFakeTimers()`), avanzados a mano, con `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`"],
    w: [["Wait 5 real seconds in the test", "Attendre 5 vraies secondes dans le test", "Esperar 5 segundos reales en el test"], ["Remove the timer in tests with an environment flag", "Retirer la minuterie dans les tests avec un drapeau d'environnement", "Quitar el temporizador en los tests con una bandera de entorno"], ["It cannot be tested", "Ce n'est pas testable", "No se puede probar"]],
    e: [
      "Fake timers replace `setTimeout` and the clock; advancing them runs the due callbacks at once. user-event waits between actions, so it must be told to use the fake clock or it hangs. Restore real timers after each test.",
      "Les minuteries simulées remplacent `setTimeout` et l'horloge ; les avancer exécute aussitôt les rappels échus. user-event attend entre ses actions : il faut lui dire d'utiliser l'horloge simulée, sinon il se bloque. Rétablir les vraies minuteries après chaque test.",
      "Los temporizadores simulados sustituyen `setTimeout` y el reloj; avanzarlos ejecuta al instante las retrollamadas pendientes. user-event espera entre acciones, así que hay que decirle que use el reloj simulado o se queda colgado. Restaurar los temporizadores reales tras cada test.",
    ],
  },
  {
    id: "re-ts-02",
    q: ["\"Warning: An update was not wrapped in act(...)\" in a test means what?", "« Warning: An update was not wrapped in act(...) » dans un test signifie quoi ?", "¿Qué significa «Warning: An update was not wrapped in act(...)» en un test?"],
    a: ["State changed after the test stopped waiting, e.g. a request resolving late; the test should await that outcome", "L'état a changé après que le test a cessé d'attendre, par ex. une requête qui se termine tard ; le test doit attendre ce résultat", "El estado cambió después de que el test dejara de esperar, p. ej. una petición que termina tarde; el test debe esperar ese resultado"],
    w: [["React is not installed correctly", "React n'est pas correctement installé", "React no está bien instalado"], ["The component has no key", "Le composant n'a pas de clé", "El componente no tiene clave"], ["The test is too fast and should be slowed down", "Le test est trop rapide et doit être ralenti", "El test es demasiado rápido y hay que ralentizarlo"]],
    e: [
      "Testing Library's helpers already wrap renders and events in `act`. The warning points at asynchronous work nobody waited for: use `findBy…` or `waitFor` for the expected result, or make sure requests are mocked and settle before the test ends.",
      "Les utilitaires de Testing Library enveloppent déjà rendus et événements dans `act`. L'avertissement désigne un travail asynchrone que personne n'a attendu : utiliser `findBy…` ou `waitFor` pour le résultat attendu, ou s'assurer que les requêtes sont simulées et se terminent avant la fin du test.",
      "Las utilidades de Testing Library ya envuelven renderizados y eventos en `act`. El aviso señala un trabajo asíncrono que nadie esperó: usar `findBy…` o `waitFor` para el resultado esperado, o asegurarse de que las peticiones están simuladas y terminan antes del final del test.",
    ],
  },
  {
    id: "re-ts-03",
    q: ["How should a team split tests between unit, component and end-to-end?", "Comment une équipe doit-elle répartir les tests entre unitaires, composants et bout en bout ?", "¿Cómo debe repartir un equipo los tests entre unitarios, de componentes y de extremo a extremo?"],
    a: ["Pure logic in fast unit tests, behaviour in component tests, and a smaller set of end-to-end tests for the critical paths through the real stack", "La logique pure en tests unitaires rapides, le comportement en tests de composants, et un ensemble plus réduit de tests de bout en bout pour les parcours critiques à travers la vraie pile", "La lógica pura en tests unitarios rápidos, el comportamiento en tests de componentes, y un conjunto menor de tests de extremo a extremo para los recorridos críticos por la pila real"],
    w: [["Only end-to-end: the rest is redundant", "Seulement du bout en bout : le reste est redondant", "Solo de extremo a extremo: lo demás sobra"], ["Only unit tests: browsers are unreliable", "Seulement des tests unitaires : les navigateurs ne sont pas fiables", "Solo unitarios: los navegadores no son fiables"], ["Snapshot tests of every component", "Des tests snapshot de chaque composant", "Tests snapshot de cada componente"]],
    e: [
      "Each layer catches different bugs at a different cost. Fast tests give quick feedback; end-to-end tests prove the parts work together: build, routing, cookies, API, database. Large snapshots of markup break on every change and get updated without being read.",
      "Chaque niveau attrape des bogues différents pour un coût différent. Les tests rapides donnent un retour rapide ; les tests de bout en bout prouvent que les parties marchent ensemble : build, routage, cookies, API, base de données. De gros snapshots de balisage cassent à chaque changement et sont mis à jour sans être lus.",
      "Cada nivel detecta errores distintos con un coste distinto. Los tests rápidos dan respuesta rápida; los de extremo a extremo prueban que las partes funcionan juntas: compilación, enrutado, cookies, API, base de datos. Los snapshots grandes de marcado se rompen con cada cambio y se actualizan sin leerlos.",
    ],
  },
];

export const components = { internals };
export const state = { concurrency };
export const effects = { effectsExpert };
export const rendering = { reconciliation };
export const data = { streaming };
export const typing = { typesExpert };
export const tooling = { platform };
export const testing = { testStrategy };
