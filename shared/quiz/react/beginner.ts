/**
 * React, Débutant: components and JSX, state, a first effect, lists and keys,
 * loading data, typing props, a Vite project, a first test. Code between
 * backticks is the same in the three languages.
 */
import type { LinuxQuestion as ReactQuestion } from "../linux/types";

const jsx: ReactQuestion[] = [
  {
    id: "re-jsx-01",
    q: ["What is a React component, in today's React?", "Qu'est-ce qu'un composant React, dans le React d'aujourd'hui ?", "¿Qué es un componente React, en el React actual?"],
    a: ["A function that takes props and returns what to show (JSX)", "Une fonction qui reçoit des props et renvoie ce qu'il faut afficher (du JSX)", "Una función que recibe props y devuelve lo que hay que mostrar (JSX)"],
    w: [
      ["An HTML file with a template", "Un fichier HTML avec un gabarit", "Un archivo HTML con una plantilla"],
      ["A class that must extend `React.Component`", "Une classe qui doit étendre `React.Component`", "Una clase que debe extender `React.Component`"],
      ["A CSS module bound to an element", "Un module CSS lié à un élément", "Un módulo CSS ligado a un elemento"],
    ],
    e: [
      "Components are plain functions: React calls them with the props and renders what they return. Class components still work but are legacy; new code uses functions and hooks. A component's name starts with a capital letter: `<Card />` is a component, `<card />` an HTML tag.",
      "Les composants sont de simples fonctions : React les appelle avec les props et affiche ce qu'elles renvoient. Les composants classes fonctionnent encore mais sont hérités ; le code neuf utilise des fonctions et des hooks. Le nom d'un composant commence par une majuscule : `<Card />` est un composant, `<card />` une balise HTML.",
      "Los componentes son funciones simples: React las llama con las props y muestra lo que devuelven. Los componentes de clase siguen funcionando pero son heredados; el código nuevo usa funciones y hooks. El nombre de un componente empieza por mayúscula: `<Card />` es un componente, `<card />` una etiqueta HTML.",
    ],
  },
  {
    id: "re-jsx-02",
    q: ["What does JSX such as `<h1>Hi</h1>` become when it is built?", "Que devient du JSX comme `<h1>Hi</h1>` à la compilation ?", "¿En qué se convierte JSX como `<h1>Hi</h1>` al compilar?"],
    a: ["A function call that creates a React element, an object describing what to show", "Un appel de fonction qui crée un élément React, un objet qui décrit quoi afficher", "Una llamada a función que crea un elemento React, un objeto que describe qué mostrar"],
    w: [
      ["A string of HTML inserted with `innerHTML`", "Une chaîne HTML insérée avec `innerHTML`", "Una cadena HTML insertada con `innerHTML`"],
      ["A real DOM node, created at once", "Un vrai nœud du DOM, créé aussitôt", "Un nodo real del DOM, creado al instante"],
      ["It stays as is: browsers read JSX", "Il reste tel quel : les navigateurs lisent le JSX", "Se queda igual: los navegadores leen JSX"],
    ],
    e: [
      "The compiler (esbuild, SWC, Babel, TypeScript) turns JSX into calls to `jsx()` from `react/jsx-runtime`. They return plain objects; React compares them with the previous ones and changes only what differs in the DOM. Browsers do not understand JSX, which is why a build step is needed.",
      "Le compilateur (esbuild, SWC, Babel, TypeScript) transforme le JSX en appels à `jsx()` de `react/jsx-runtime`. Ils renvoient de simples objets ; React les compare aux précédents et ne change dans le DOM que ce qui diffère. Les navigateurs ne comprennent pas le JSX, d'où l'étape de compilation.",
      "El compilador (esbuild, SWC, Babel, TypeScript) convierte el JSX en llamadas a `jsx()` de `react/jsx-runtime`. Devuelven objetos simples; React los compara con los anteriores y solo cambia en el DOM lo que difiere. Los navegadores no entienden JSX, por eso hace falta un paso de compilación.",
    ],
  },
  {
    id: "re-jsx-03",
    q: ["In JSX, how is a CSS class given to a `div`?", "En JSX, comment donner une classe CSS à un `div` ?", "En JSX, ¿cómo se da una clase CSS a un `div`?"],
    a: ["`className=\"card\"`", "`className=\"card\"`", "`className=\"card\"`"],
    w: [["`class=\"card\"`", "`class=\"card\"`", "`class=\"card\"`"], ["`css=\"card\"`", "`css=\"card\"`", "`css=\"card\"`"], ["`style=\"card\"`", "`style=\"card\"`", "`style=\"card\"`"]],
    e: [
      "JSX attributes follow the DOM's property names: `className`, `htmlFor`, `onClick`, `tabIndex`. `style` takes an object, `style={{ marginTop: 8 }}`, with camelCase names and numbers read as pixels.",
      "Les attributs JSX suivent les noms des propriétés du DOM : `className`, `htmlFor`, `onClick`, `tabIndex`. `style` prend un objet, `style={{ marginTop: 8 }}`, avec des noms en camelCase et des nombres lus comme des pixels.",
      "Los atributos JSX siguen los nombres de las propiedades del DOM: `className`, `htmlFor`, `onClick`, `tabIndex`. `style` recibe un objeto, `style={{ marginTop: 8 }}`, con nombres en camelCase y números leídos como píxeles.",
    ],
  },
  {
    id: "re-jsx-04",
    q: ["A component must return two sibling elements, a `<h2>` and a `<p>`. How?", "Un composant doit renvoyer deux éléments frères, un `<h2>` et un `<p>`. Comment ?", "Un componente debe devolver dos elementos hermanos, un `<h2>` y un `<p>`. ¿Cómo?"],
    a: ["Wrap them in a fragment, `<>…</>`, which adds nothing to the DOM", "Les entourer d'un fragment, `<>…</>`, qui n'ajoute rien au DOM", "Envolverlos en un fragmento, `<>…</>`, que no añade nada al DOM"],
    w: [
      ["Return them separated by a comma", "Les renvoyer séparés par une virgule", "Devolverlos separados por una coma"],
      ["It is impossible: always add a `div`", "C'est impossible : il faut toujours un `div`", "Es imposible: siempre hay que añadir un `div`"],
      ["Call `return` twice", "Appeler `return` deux fois", "Llamar a `return` dos veces"],
    ],
    e: [
      "An expression has one value, so JSX needs one root. A fragment groups children without a wrapper element, which keeps lists, tables and flex layouts intact. In a list, the long form `<Fragment key={id}>` carries a key.",
      "Une expression a une seule valeur, donc le JSX a besoin d'une racine. Un fragment groupe des enfants sans élément englobant, ce qui préserve listes, tableaux et mises en page flex. Dans une liste, la forme longue `<Fragment key={id}>` porte une clé.",
      "Una expresión tiene un solo valor, así que JSX necesita una raíz. Un fragmento agrupa hijos sin elemento contenedor, lo que mantiene intactas listas, tablas y diseños flex. En una lista, la forma larga `<Fragment key={id}>` lleva una clave.",
    ],
  },
  {
    id: "re-jsx-05",
    q: ["How does a parent pass data to a child component?", "Comment un parent passe-t-il des données à un composant enfant ?", "¿Cómo pasa un padre datos a un componente hijo?"],
    a: ["Through props, attributes in JSX that the child receives as one object, read-only", "Par les props, des attributs en JSX que l'enfant reçoit comme un objet, en lecture seule", "Mediante props, atributos en JSX que el hijo recibe como un objeto, de solo lectura"],
    w: [
      ["Through global variables", "Par des variables globales", "Mediante variables globales"],
      ["The child changes the parent's variables directly", "L'enfant modifie directement les variables du parent", "El hijo cambia directamente las variables del padre"],
      ["Through `localStorage`", "Par `localStorage`", "Mediante `localStorage`"],
    ],
    e: [
      "`<Avatar size={48} user={u} />` calls `Avatar({ size: 48, user: u })`. Data flows down; a child that must change something receives a function as a prop, `onChange`, and calls it. A component never mutates its props.",
      "`<Avatar size={48} user={u} />` appelle `Avatar({ size: 48, user: u })`. Les données descendent ; un enfant qui doit changer quelque chose reçoit une fonction en prop, `onChange`, et l'appelle. Un composant ne modifie jamais ses props.",
      "`<Avatar size={48} user={u} />` llama a `Avatar({ size: 48, user: u })`. Los datos bajan; un hijo que debe cambiar algo recibe una función como prop, `onChange`, y la llama. Un componente nunca modifica sus props.",
    ],
  },
  {
    id: "re-jsx-06",
    q: ["What is `children` in `<Card><p>Text</p></Card>`?", "Qu'est-ce que `children` dans `<Card><p>Text</p></Card>` ?", "¿Qué es `children` en `<Card><p>Text</p></Card>`?"],
    a: ["A prop holding what is written between the tags, here the `<p>`", "Une prop qui contient ce qui est écrit entre les balises, ici le `<p>`", "Una prop que contiene lo escrito entre las etiquetas, aquí el `<p>`"],
    w: [
      ["The list of DOM nodes inside the card, to change by hand", "La liste des nœuds du DOM dans la carte, à modifier à la main", "La lista de nodos del DOM dentro de la tarjeta, para cambiarla a mano"],
      ["A reserved word; it cannot be read", "Un mot réservé ; il ne peut pas être lu", "Una palabra reservada; no se puede leer"],
      ["The components that `Card` imports", "Les composants que `Card` importe", "Los componentes que importa `Card`"],
    ],
    e: [
      "`Card` places `{children}` where the content goes: a layout or a frame without knowing what is inside. It is the simplest form of composition, and often better than a long list of props.",
      "`Card` place `{children}` là où va le contenu : une mise en page ou un cadre sans savoir ce qu'il contient. C'est la forme la plus simple de composition, souvent préférable à une longue liste de props.",
      "`Card` coloca `{children}` donde va el contenido: un diseño o un marco sin saber qué contiene. Es la forma más simple de composición, a menudo mejor que una larga lista de props.",
    ],
  },
];

const useStateBasics: ReactQuestion[] = [
  {
    id: "re-state-01",
    q: ["What does `const [n, setN] = useState(0)` give?", "Que donne `const [n, setN] = useState(0)` ?", "¿Qué da `const [n, setN] = useState(0)`?"],
    a: ["The current value, and a function that stores a new one and renders the component again", "La valeur actuelle, et une fonction qui en enregistre une nouvelle et refait le rendu du composant", "El valor actual, y una función que guarda uno nuevo y vuelve a renderizar el componente"],
    w: [
      ["A variable and its copy", "Une variable et sa copie", "Una variable y su copia"],
      ["A getter and a setter that change `n` at once, without rendering", "Un getter et un setter qui changent `n` aussitôt, sans rendu", "Un getter y un setter que cambian `n` al instante, sin renderizar"],
      ["Two counters that start at 0", "Deux compteurs qui partent de 0", "Dos contadores que empiezan en 0"],
    ],
    e: [
      "State is memory that survives renders. `setN` does not change `n` in the running code: it asks React for a new render, in which `useState` returns the new value. A plain `let` would be reset at every render and would not update the screen.",
      "L'état est une mémoire qui survit aux rendus. `setN` ne change pas `n` dans le code en cours : il demande un nouveau rendu à React, dans lequel `useState` renvoie la nouvelle valeur. Un simple `let` serait remis à zéro à chaque rendu et ne mettrait pas l'écran à jour.",
      "El estado es memoria que sobrevive a los renderizados. `setN` no cambia `n` en el código en curso: pide a React un nuevo renderizado, en el que `useState` devuelve el valor nuevo. Un simple `let` se reiniciaría en cada renderizado y no actualizaría la pantalla.",
    ],
  },
  {
    id: "re-state-02",
    q: ["Where may hooks such as `useState` be called?", "Où peut-on appeler des hooks comme `useState` ?", "¿Dónde se pueden llamar hooks como `useState`?"],
    a: ["At the top level of a component or of a custom hook, never in a condition or a loop", "Au premier niveau d'un composant ou d'un hook personnalisé, jamais dans une condition ou une boucle", "En el nivel superior de un componente o de un hook personalizado, nunca en una condición o un bucle"],
    w: [
      ["Anywhere, even in a `setTimeout`", "N'importe où, même dans un `setTimeout`", "En cualquier sitio, incluso en un `setTimeout`"],
      ["Only in event handlers", "Seulement dans les gestionnaires d'événements", "Solo en los manejadores de eventos"],
      ["In any function whose name starts with a capital", "Dans toute fonction dont le nom commence par une majuscule", "En cualquier función cuyo nombre empiece por mayúscula"],
    ],
    e: [
      "React matches hooks to their state by call order: the first `useState` of a render is the first slot, and so on. A conditional call shifts the order and mixes states up. The `react-hooks` ESLint plugin enforces this. `use` is the one exception: it may be called conditionally.",
      "React associe les hooks à leur état par l'ordre des appels : le premier `useState` d'un rendu est le premier emplacement, et ainsi de suite. Un appel conditionnel décale l'ordre et mélange les états. Le plugin ESLint `react-hooks` le vérifie. `use` est la seule exception : il peut être appelé sous condition.",
      "React asocia los hooks a su estado por el orden de las llamadas: el primer `useState` de un renderizado es la primera casilla, y así sucesivamente. Una llamada condicional desplaza el orden y mezcla los estados. El plugin de ESLint `react-hooks` lo comprueba. `use` es la única excepción: se puede llamar de forma condicional.",
    ],
  },
  {
    id: "re-state-03",
    q: ["State holds an array, `items`. How is an item added?", "L'état contient un tableau, `items`. Comment ajouter un élément ?", "El estado contiene un array, `items`. ¿Cómo se añade un elemento?"],
    a: ["`setItems([...items, x])`: a new array", "`setItems([...items, x])` : un nouveau tableau", "`setItems([...items, x])`: un array nuevo"],
    w: [
      ["`items.push(x)`, React notices", "`items.push(x)`, React le remarque", "`items.push(x)`, React lo nota"],
      ["`items.push(x); setItems(items)`", "`items.push(x); setItems(items)`", "`items.push(x); setItems(items)`"],
      ["`items[items.length] = x`", "`items[items.length] = x`", "`items[items.length] = x`"],
    ],
    e: [
      "React compares the old and new state with `Object.is`: the same array, even changed inside, counts as unchanged, and nothing renders. State is treated as immutable: copy with spread, `map`, `filter`, `toSorted`, or `structuredClone` for deep data.",
      "React compare l'ancien et le nouvel état avec `Object.is` : le même tableau, même modifié à l'intérieur, compte comme inchangé, et rien n'est rendu. L'état se traite comme immuable : copier avec la décomposition, `map`, `filter`, `toSorted`, ou `structuredClone` pour des données profondes.",
      "React compara el estado viejo y el nuevo con `Object.is`: el mismo array, aunque cambie por dentro, cuenta como sin cambios, y no se renderiza nada. El estado se trata como inmutable: copiar con el operador de propagación, `map`, `filter`, `toSorted`, o `structuredClone` para datos profundos.",
    ],
  },
  {
    id: "re-state-04",
    q: ["How does a button run code when it is clicked?", "Comment un bouton exécute-t-il du code quand on clique dessus ?", "¿Cómo ejecuta un botón código al pulsarlo?"],
    a: ["`onClick={save}`: pass the function, React calls it on the click", "`onClick={save}` : passer la fonction, React l'appelle au clic", "`onClick={save}`: pasar la función, React la llama al pulsar"],
    w: [
      ["`onClick={save()}`", "`onClick={save()}`", "`onClick={save()}`"],
      ["`onclick=\"save()\"`", "`onclick=\"save()\"`", "`onclick=\"save()\"`"],
      ["`addEventListener` in the component's body", "`addEventListener` dans le corps du composant", "`addEventListener` en el cuerpo del componente"],
    ],
    e: [
      "`onClick={save()}` calls `save` during the render and passes its result; with a state setter inside, it loops. To pass an argument, wrap it: `onClick={() => remove(id)}`. React attaches its listeners once, at the root, and calls the right handler.",
      "`onClick={save()}` appelle `save` pendant le rendu et passe son résultat ; avec un setter d'état dedans, ça boucle. Pour passer un argument, envelopper : `onClick={() => remove(id)}`. React attache ses écouteurs une fois, à la racine, et appelle le bon gestionnaire.",
      "`onClick={save()}` llama a `save` durante el renderizado y pasa su resultado; con un setter de estado dentro, entra en bucle. Para pasar un argumento, envolver: `onClick={() => remove(id)}`. React coloca sus escuchadores una vez, en la raíz, y llama al manejador correcto.",
    ],
  },
  {
    id: "re-state-05",
    q: ["Two components show the same count and must stay in step. Where does the count live?", "Deux composants affichent le même compteur et doivent rester d'accord. Où vit le compteur ?", "Dos componentes muestran el mismo contador y deben coincidir. ¿Dónde vive el contador?"],
    a: ["In their closest common parent, passed down as props (lifting state up)", "Dans leur plus proche parent commun, transmis en props (remonter l'état)", "En su padre común más cercano, pasado como props (elevar el estado)"],
    w: [
      ["In each of them, copied on every click", "Dans chacun d'eux, copié à chaque clic", "En cada uno, copiado en cada clic"],
      ["In a global variable of the module", "Dans une variable globale du module", "En una variable global del módulo"],
      ["In the first one, which reads the other's state", "Dans le premier, qui lit l'état de l'autre", "En el primero, que lee el estado del otro"],
    ],
    e: [
      "One source of truth: the parent owns the state and passes the value and a setter (or an `onIncrement`) to both. Two copies drift apart. When the common parent is far away, context or a store avoids passing props through every level.",
      "Une seule source de vérité : le parent possède l'état et passe la valeur et un setter (ou un `onIncrement`) aux deux. Deux copies finissent par diverger. Quand le parent commun est loin, un contexte ou un store évite de passer les props à chaque niveau.",
      "Una sola fuente de verdad: el padre posee el estado y pasa el valor y un setter (o un `onIncrement`) a los dos. Dos copias acaban divergiendo. Cuando el padre común está lejos, un contexto o un store evita pasar props por cada nivel.",
    ],
  },
];

const effectsIntro: ReactQuestion[] = [
  {
    id: "re-eff-01",
    q: ["What is `useEffect` for?", "À quoi sert `useEffect` ?", "¿Para qué sirve `useEffect`?"],
    a: ["To synchronise the component with something outside React (a subscription, a timer, the document title) after it renders", "À synchroniser le composant avec quelque chose hors de React (un abonnement, une minuterie, le titre du document) après son rendu", "A sincronizar el componente con algo externo a React (una suscripción, un temporizador, el título del documento) tras renderizar"],
    w: [
      ["To compute values from props before rendering", "À calculer des valeurs à partir des props avant le rendu", "A calcular valores a partir de props antes de renderizar"],
      ["To handle clicks", "À gérer les clics", "A gestionar los clics"],
      ["To make the component render faster", "À rendre le composant plus rapide", "A hacer que el componente renderice más rápido"],
    ],
    e: [
      "An effect runs after the render is on the screen. Something computed from props or state belongs in the render itself; a click belongs in its handler. Effects are for the outside world: connecting, subscribing, measuring, calling a non-React widget.",
      "Un effet s'exécute après que le rendu est à l'écran. Ce qui se calcule depuis les props ou l'état va dans le rendu lui-même ; un clic va dans son gestionnaire. Les effets sont pour le monde extérieur : se connecter, s'abonner, mesurer, piloter un widget non React.",
      "Un efecto se ejecuta cuando el renderizado ya está en pantalla. Lo que se calcula a partir de props o estado va en el propio renderizado; un clic va en su manejador. Los efectos son para el mundo exterior: conectarse, suscribirse, medir, controlar un widget que no es React.",
    ],
  },
  {
    id: "re-eff-02",
    q: ["What does the second argument of `useEffect(fn, [id])` mean?", "Que signifie le second argument de `useEffect(fn, [id])` ?", "¿Qué significa el segundo argumento de `useEffect(fn, [id])`?"],
    a: ["Run the effect after the first render and again whenever `id` changes", "Exécuter l'effet après le premier rendu et à nouveau chaque fois que `id` change", "Ejecutar el efecto tras el primer renderizado y de nuevo cada vez que cambie `id`"],
    w: [
      ["Pass `id` as an argument to `fn`", "Passer `id` en argument à `fn`", "Pasar `id` como argumento a `fn`"],
      ["Run the effect only when `id` is truthy", "N'exécuter l'effet que si `id` est vrai", "Ejecutar el efecto solo si `id` es verdadero"],
      ["Run it once, then never, whatever `id` does", "L'exécuter une fois, puis jamais, quoi que fasse `id`", "Ejecutarlo una vez y nunca más, haga lo que haga `id`"],
    ],
    e: [
      "The list names the values the effect reads; React compares them with `Object.is` after each render. `[]` runs once after mounting; no list runs after every render. Listing every value read keeps the effect in step; the ESLint rule `exhaustive-deps` checks it.",
      "La liste nomme les valeurs que l'effet lit ; React les compare avec `Object.is` après chaque rendu. `[]` s'exécute une fois après le montage ; sans liste, après chaque rendu. Lister toutes les valeurs lues garde l'effet synchronisé ; la règle ESLint `exhaustive-deps` le vérifie.",
      "La lista nombra los valores que lee el efecto; React los compara con `Object.is` tras cada renderizado. `[]` se ejecuta una vez tras el montaje; sin lista, tras cada renderizado. Listar todos los valores leídos mantiene el efecto sincronizado; la regla de ESLint `exhaustive-deps` lo comprueba.",
    ],
  },
  {
    id: "re-eff-03",
    q: ["An effect starts a `setInterval`. What must it do?", "Un effet lance un `setInterval`. Que doit-il faire ?", "Un efecto inicia un `setInterval`. ¿Qué debe hacer?"],
    a: ["Return a cleanup function that calls `clearInterval`", "Renvoyer une fonction de nettoyage qui appelle `clearInterval`", "Devolver una función de limpieza que llame a `clearInterval`"],
    w: [
      ["Nothing: React stops timers when the component goes", "Rien : React arrête les minuteries quand le composant disparaît", "Nada: React detiene los temporizadores cuando el componente desaparece"],
      ["Call `clearInterval` at the start of the next render", "Appeler `clearInterval` au début du rendu suivant", "Llamar a `clearInterval` al principio del siguiente renderizado"],
      ["Store the interval in state", "Enregistrer l'intervalle dans l'état", "Guardar el intervalo en el estado"],
    ],
    e: [
      "React calls the cleanup before the effect runs again and when the component unmounts. Without it, every re-run adds a timer and an unmounted component keeps ticking. In development, StrictMode runs effects twice on mount precisely to reveal a missing cleanup.",
      "React appelle le nettoyage avant de relancer l'effet et au démontage du composant. Sans lui, chaque relance ajoute une minuterie et un composant démonté continue de tourner. En développement, StrictMode exécute les effets deux fois au montage justement pour révéler un nettoyage manquant.",
      "React llama a la limpieza antes de volver a ejecutar el efecto y al desmontar el componente. Sin ella, cada reejecución añade un temporizador y un componente desmontado sigue funcionando. En desarrollo, StrictMode ejecuta los efectos dos veces al montar precisamente para revelar una limpieza que falta.",
    ],
  },
];

const listsKeys: ReactQuestion[] = [
  {
    id: "re-list-01",
    q: ["How is an array of todos shown as a list?", "Comment afficher un tableau de tâches sous forme de liste ?", "¿Cómo se muestra un array de tareas como lista?"],
    a: ["`todos.map((t) => <li key={t.id}>{t.text}</li>)`", "`todos.map((t) => <li key={t.id}>{t.text}</li>)`", "`todos.map((t) => <li key={t.id}>{t.text}</li>)`"],
    w: [
      ["`todos.forEach((t) => <li>{t.text}</li>)`", "`todos.forEach((t) => <li>{t.text}</li>)`", "`todos.forEach((t) => <li>{t.text}</li>)`"],
      ["`for (const t of todos) <li>{t.text}</li>`", "`for (const t of todos) <li>{t.text}</li>`", "`for (const t of todos) <li>{t.text}</li>`"],
      ["`<li repeat={todos}>{t.text}</li>`", "`<li repeat={todos}>{t.text}</li>`", "`<li repeat={todos}>{t.text}</li>`"],
    ],
    e: [
      "JSX takes an array of elements; `map` builds one, `forEach` returns nothing. Each item gets a `key` that is unique among its siblings and stable, usually the id from the data.",
      "Le JSX accepte un tableau d'éléments ; `map` en construit un, `forEach` ne renvoie rien. Chaque élément reçoit une `key` unique parmi ses frères et stable, en général l'identifiant venu des données.",
      "JSX acepta un array de elementos; `map` construye uno, `forEach` no devuelve nada. Cada elemento recibe una `key` única entre sus hermanos y estable, normalmente el id que viene de los datos.",
    ],
  },
  {
    id: "re-list-02",
    q: ["Why is the array index a poor `key` for a list that can be reordered or filtered?", "Pourquoi l'indice du tableau est-il une mauvaise `key` pour une liste qu'on peut réordonner ou filtrer ?", "¿Por qué el índice del array es una mala `key` para una lista que se puede reordenar o filtrar?"],
    a: ["The key follows the position, not the item: state and inputs stay with the wrong row", "La clé suit la position, pas l'élément : l'état et les champs restent sur la mauvaise ligne", "La clave sigue la posición, no el elemento: el estado y los campos se quedan en la fila equivocada"],
    w: [
      ["Indexes are slower to compare than strings", "Les indices sont plus lents à comparer que des chaînes", "Los índices son más lentos de comparar que las cadenas"],
      ["React forbids numbers as keys", "React interdit les nombres comme clés", "React prohíbe los números como claves"],
      ["It is fine: React finds the items by their content", "C'est très bien : React retrouve les éléments par leur contenu", "Está bien: React encuentra los elementos por su contenido"],
    ],
    e: [
      "React matches old and new children by key. With the index, deleting the first row makes the second take key 0, so React keeps the first row's component and its state for it. A stable id from the data keeps each component with its item. An index is acceptable only for a list that never changes order.",
      "React associe anciens et nouveaux enfants par leur clé. Avec l'indice, supprimer la première ligne donne la clé 0 à la deuxième : React garde pour elle le composant de la première et son état. Un identifiant stable venu des données garde chaque composant avec son élément. L'indice ne convient qu'à une liste dont l'ordre ne change jamais.",
      "React empareja hijos viejos y nuevos por su clave. Con el índice, borrar la primera fila hace que la segunda tome la clave 0, así que React le deja el componente de la primera y su estado. Un id estable de los datos mantiene cada componente con su elemento. El índice solo vale para una lista cuyo orden nunca cambia.",
    ],
  },
  {
    id: "re-list-03",
    q: ["When does a component render again?", "Quand un composant refait-il un rendu ?", "¿Cuándo vuelve a renderizar un componente?"],
    a: ["When its state changes, when its parent renders, or when a context it reads changes", "Quand son état change, quand son parent refait un rendu, ou quand un contexte qu'il lit change", "Cuando cambia su estado, cuando su padre vuelve a renderizar, o cuando cambia un contexto que lee"],
    w: [
      ["Only when its props change", "Seulement quand ses props changent", "Solo cuando cambian sus props"],
      ["Every 16 milliseconds, at each frame", "Toutes les 16 millisecondes, à chaque image", "Cada 16 milisegundos, en cada fotograma"],
      ["When any variable of its module changes", "Quand n'importe quelle variable de son module change", "Cuando cambia cualquier variable de su módulo"],
    ],
    e: [
      "By default a parent's render renders all its children, whether their props changed or not; that is usually cheap, since only the differences reach the DOM. `memo` skips a child whose props are equal. A rendered component is not a repainted one.",
      "Par défaut, le rendu d'un parent rend tous ses enfants, que leurs props aient changé ou non ; c'est en général peu coûteux, puisque seules les différences atteignent le DOM. `memo` saute un enfant dont les props sont égales. Un composant rendu n'est pas un composant repeint.",
      "Por defecto, el renderizado de un padre renderiza a todos sus hijos, hayan cambiado sus props o no; suele ser barato, porque solo las diferencias llegan al DOM. `memo` se salta un hijo cuyas props son iguales. Un componente renderizado no es un componente repintado.",
    ],
  },
];

const fetching: ReactQuestion[] = [
  {
    id: "re-fetch-01",
    q: ["Where should a component not call `fetch`?", "Où un composant ne doit-il pas appeler `fetch` ?", "¿Dónde no debe un componente llamar a `fetch`?"],
    a: ["Directly in its body: it would run at every render", "Directement dans son corps : l'appel partirait à chaque rendu", "Directamente en su cuerpo: se ejecutaría en cada renderizado"],
    w: [
      ["In an event handler", "Dans un gestionnaire d'événements", "En un manejador de eventos"],
      ["In an effect", "Dans un effet", "En un efecto"],
      ["In a data library such as TanStack Query", "Dans une bibliothèque de données comme TanStack Query", "En una biblioteca de datos como TanStack Query"],
    ],
    e: [
      "Rendering must be pure: the same props and state give the same output, without side effects. A request in the body fires on every render, and setting state with its result renders again: a loop. Load in a handler (after a click), in an effect, through a data library, or in a framework's loader or server component.",
      "Le rendu doit être pur : mêmes props et même état, même résultat, sans effet de bord. Une requête dans le corps part à chaque rendu, et mettre son résultat dans l'état refait un rendu : une boucle. Charger dans un gestionnaire (après un clic), dans un effet, via une bibliothèque de données, ou dans le loader ou le composant serveur d'un framework.",
      "El renderizado debe ser puro: mismas props y mismo estado, mismo resultado, sin efectos secundarios. Una petición en el cuerpo sale en cada renderizado, y guardar su resultado en el estado vuelve a renderizar: un bucle. Cargar en un manejador (tras un clic), en un efecto, con una biblioteca de datos, o en el loader o componente de servidor de un framework.",
    ],
  },
  {
    id: "re-fetch-02",
    q: ["Data loads in an effect. What does the component show meanwhile?", "Des données se chargent dans un effet. Que montre le composant en attendant ?", "Los datos se cargan en un efecto. ¿Qué muestra el componente mientras tanto?"],
    a: ["What its state says: typically a loading state, then the data or an error", "Ce que dit son état : en général un état de chargement, puis les données ou une erreur", "Lo que dice su estado: normalmente un estado de carga, luego los datos o un error"],
    w: [
      ["Nothing: React waits for the request before the first render", "Rien : React attend la requête avant le premier rendu", "Nada: React espera la petición antes del primer renderizado"],
      ["The data of the previous visit, automatically", "Les données de la visite précédente, automatiquement", "Los datos de la visita anterior, automáticamente"],
      ["An error, since effects cannot be asynchronous", "Une erreur, puisque les effets ne peuvent pas être asynchrones", "Un error, porque los efectos no pueden ser asíncronos"],
    ],
    e: [
      "The effect runs after the first render, which happens without the data. Model the three cases in state (`loading`, `data`, `error`) and render each. The effect's function itself cannot be `async` (it must return a cleanup or nothing), but it can call an async function inside.",
      "L'effet s'exécute après le premier rendu, qui a lieu sans les données. Représenter les trois cas dans l'état (`loading`, `data`, `error`) et rendre chacun. La fonction de l'effet elle-même ne peut pas être `async` (elle doit renvoyer un nettoyage ou rien), mais elle peut appeler une fonction asynchrone à l'intérieur.",
      "El efecto se ejecuta tras el primer renderizado, que ocurre sin los datos. Representar los tres casos en el estado (`loading`, `data`, `error`) y renderizar cada uno. La función del efecto no puede ser `async` (debe devolver una limpieza o nada), pero puede llamar dentro a una función asíncrona.",
    ],
  },
  {
    id: "re-fetch-03",
    q: ["A Vite app at port 5173 calls its API server at port 8787 in development. The simplest way to avoid CORS?", "Une app Vite sur le port 5173 appelle son serveur d'API sur le port 8787 en développement. Le plus simple pour éviter CORS ?", "Una app de Vite en el puerto 5173 llama a su servidor de API en el puerto 8787 en desarrollo. ¿Lo más simple para evitar CORS?"],
    a: ["A proxy in `vite.config.ts` (`server.proxy` for `/api`), so the page calls its own origin", "Un proxy dans `vite.config.ts` (`server.proxy` pour `/api`), pour que la page appelle sa propre origine", "Un proxy en `vite.config.ts` (`server.proxy` para `/api`), para que la página llame a su propio origen"],
    w: [
      ["Disable CORS in the browser", "Désactiver CORS dans le navigateur", "Desactivar CORS en el navegador"],
      ["Add `mode: \"no-cors\"` to every `fetch`", "Ajouter `mode: \"no-cors\"` à chaque `fetch`", "Añadir `mode: \"no-cors\"` a cada `fetch`"],
      ["Allow every origin with `*` and cookies", "Autoriser toutes les origines avec `*` et les cookies", "Permitir todos los orígenes con `*` y cookies"],
    ],
    e: [
      "The dev server forwards `/api/...` to the API, so the browser sees one origin, as it will in production when one server serves both. `no-cors` gives an unreadable response; `*` cannot be combined with credentials. Same origin also keeps session cookies simple (`SameSite`, `HttpOnly`).",
      "Le serveur de développement transmet `/api/...` à l'API : le navigateur ne voit qu'une origine, comme en production quand un seul serveur sert les deux. `no-cors` donne une réponse illisible ; `*` ne se combine pas avec les identifiants. La même origine garde aussi les cookies de session simples (`SameSite`, `HttpOnly`).",
      "El servidor de desarrollo reenvía `/api/...` a la API, así que el navegador ve un solo origen, como en producción cuando un servidor sirve ambos. `no-cors` da una respuesta ilegible; `*` no se combina con credenciales. El mismo origen también simplifica las cookies de sesión (`SameSite`, `HttpOnly`).",
    ],
  },
];

const propsTypes: ReactQuestion[] = [
  {
    id: "re-type-01",
    q: ["How are a component's props typed in TypeScript?", "Comment typer les props d'un composant en TypeScript ?", "¿Cómo se tipan las props de un componente en TypeScript?"],
    a: ["As the type of its parameter: `function Badge({ label }: { label: string })`", "Comme le type de son paramètre : `function Badge({ label }: { label: string })`", "Como el tipo de su parámetro: `function Badge({ label }: { label: string })`"],
    w: [
      ["With `Badge.propTypes`, checked by the compiler", "Avec `Badge.propTypes`, vérifié par le compilateur", "Con `Badge.propTypes`, comprobado por el compilador"],
      ["They cannot be typed: JSX is untyped", "Impossible : le JSX n'est pas typé", "No se pueden tipar: JSX no tiene tipos"],
      ["With a comment above the component", "Avec un commentaire au-dessus du composant", "Con un comentario encima del componente"],
    ],
    e: [
      "Props are a function's parameter, so they are typed like one, usually with a named `type Props = {...}`. TypeScript then checks every `<Badge ... />`: a missing or misspelled prop is an error. `propTypes` were run-time checks; React 19 ignores them in function components.",
      "Les props sont le paramètre d'une fonction : elles se typent comme lui, en général avec un `type Props = {...}` nommé. TypeScript vérifie alors chaque `<Badge ... />` : une prop manquante ou mal écrite est une erreur. Les `propTypes` étaient des vérifications à l'exécution ; React 19 les ignore dans les composants fonctions.",
      "Las props son el parámetro de una función, así que se tipan como tal, normalmente con un `type Props = {...}` con nombre. TypeScript comprueba entonces cada `<Badge ... />`: una prop que falta o está mal escrita es un error. Los `propTypes` eran comprobaciones en tiempo de ejecución; React 19 los ignora en componentes de función.",
    ],
  },
  {
    id: "re-type-02",
    q: ["What type fits a `children` prop that may be text, elements or nothing?", "Quel type convient à une prop `children` qui peut être du texte, des éléments ou rien ?", "¿Qué tipo sirve para una prop `children` que puede ser texto, elementos o nada?"],
    a: ["`React.ReactNode`", "`React.ReactNode`", "`React.ReactNode`"],
    w: [["`JSX.Element`", "`JSX.Element`", "`JSX.Element`"], ["`string`", "`string`", "`string`"], ["`HTMLElement`", "`HTMLElement`", "`HTMLElement`"]],
    e: [
      "`ReactNode` is anything React can render: elements, strings, numbers, arrays of them, `null`, `undefined`, booleans. `JSX.Element` (or `React.JSX.Element`) is one element only, too narrow for text. `HTMLElement` is a DOM node, not something to render.",
      "`ReactNode` est tout ce que React sait afficher : éléments, chaînes, nombres, leurs tableaux, `null`, `undefined`, booléens. `JSX.Element` (ou `React.JSX.Element`) est un seul élément, trop étroit pour du texte. `HTMLElement` est un nœud du DOM, pas quelque chose à rendre.",
      "`ReactNode` es todo lo que React sabe mostrar: elementos, cadenas, números, arrays de ellos, `null`, `undefined`, booleanos. `JSX.Element` (o `React.JSX.Element`) es un solo elemento, demasiado estrecho para texto. `HTMLElement` es un nodo del DOM, no algo que renderizar.",
    ],
  },
  {
    id: "re-type-03",
    q: ["`const [user, setUser] = useState(null)`: what is wrong in TypeScript?", "`const [user, setUser] = useState(null)` : quel est le problème en TypeScript ?", "`const [user, setUser] = useState(null)`: ¿qué falla en TypeScript?"],
    a: ["The state is inferred as `null` only; write `useState<User | null>(null)`", "L'état est déduit comme `null` seulement ; écrire `useState<User | null>(null)`", "El estado se deduce solo como `null`; escribir `useState<User | null>(null)`"],
    w: [
      ["Nothing: TypeScript widens it to `any`", "Rien : TypeScript l'élargit en `any`", "Nada: TypeScript lo amplía a `any`"],
      ["`useState` cannot hold `null`", "`useState` ne peut pas contenir `null`", "`useState` no puede contener `null`"],
      ["The setter must be typed by hand", "Le setter doit être typé à la main", "El setter se debe tipar a mano"],
    ],
    e: [
      "`useState` infers its type from the initial value. `null` alone gives a state that can only ever be `null`, so `setUser(u)` is an error. The type argument gives the full union; the setter follows. `useState(0)` or `useState(\"\")` need nothing.",
      "`useState` déduit son type de la valeur initiale. `null` seul donne un état qui ne peut valoir que `null`, donc `setUser(u)` est une erreur. L'argument de type donne l'union complète ; le setter suit. `useState(0)` ou `useState(\"\")` n'ont besoin de rien.",
      "`useState` deduce su tipo del valor inicial. `null` solo da un estado que solo puede ser `null`, así que `setUser(u)` es un error. El argumento de tipo da la unión completa; el setter la sigue. `useState(0)` o `useState(\"\")` no necesitan nada.",
    ],
  },
  {
    id: "re-type-04",
    q: ["Which file extension holds TypeScript with JSX?", "Quelle extension de fichier contient du TypeScript avec du JSX ?", "¿Qué extensión de archivo contiene TypeScript con JSX?"],
    a: ["`.tsx`", "`.tsx`", "`.tsx`"],
    w: [["`.ts`, JSX works anywhere", "`.ts`, le JSX marche partout", "`.ts`, JSX funciona en cualquier sitio"], ["`.jsx`", "`.jsx`", "`.jsx`"], ["`.rts`", "`.rts`", "`.rts`"]],
    e: [
      "JSX is only parsed in `.tsx` (and `.jsx`): in `.ts`, `<T>x` is a type assertion, which clashes with JSX tags. The `jsx` option in `tsconfig.json` (`react-jsx`) says how JSX is compiled.",
      "Le JSX n'est lu que dans `.tsx` (et `.jsx`) : dans un `.ts`, `<T>x` est une assertion de type, en conflit avec les balises JSX. L'option `jsx` du `tsconfig.json` (`react-jsx`) dit comment le JSX est compilé.",
      "JSX solo se interpreta en `.tsx` (y `.jsx`): en un `.ts`, `<T>x` es una aserción de tipo, que choca con las etiquetas JSX. La opción `jsx` de `tsconfig.json` (`react-jsx`) indica cómo se compila JSX.",
    ],
  },
];

const viteSetup: ReactQuestion[] = [
  {
    id: "re-vite-01",
    q: ["How is a new React project with TypeScript usually started today?", "Comment démarre-t-on aujourd'hui un nouveau projet React avec TypeScript ?", "¿Cómo se empieza hoy un proyecto React nuevo con TypeScript?"],
    a: ["`npm create vite@latest`, template `react-ts`, or a framework such as React Router or Next.js", "`npm create vite@latest`, modèle `react-ts`, ou un framework comme React Router ou Next.js", "`npm create vite@latest`, plantilla `react-ts`, o un framework como React Router o Next.js"],
    w: [
      ["`npx create-react-app my-app --template typescript`", "`npx create-react-app my-app --template typescript`", "`npx create-react-app my-app --template typescript`"],
      ["By adding a `<script>` tag for React to an HTML page", "En ajoutant une balise `<script>` pour React dans une page HTML", "Añadiendo una etiqueta `<script>` de React a una página HTML"],
      ["`npm install react` and opening `index.tsx` in the browser", "`npm install react` et ouvrir `index.tsx` dans le navigateur", "`npm install react` y abrir `index.tsx` en el navegador"],
    ],
    e: [
      "Create React App was deprecated in 2025. Vite gives a fast dev server and a production build for a client-side app; a framework adds routing, data loading and server rendering. Browsers cannot run `.tsx` directly.",
      "Create React App a été abandonné en 2025. Vite fournit un serveur de développement rapide et un build de production pour une application côté client ; un framework ajoute le routage, le chargement des données et le rendu serveur. Les navigateurs ne savent pas exécuter un `.tsx` directement.",
      "Create React App quedó obsoleto en 2025. Vite da un servidor de desarrollo rápido y una compilación de producción para una app del lado del cliente; un framework añade enrutado, carga de datos y renderizado en servidor. Los navegadores no ejecutan un `.tsx` directamente.",
    ],
  },
  {
    id: "re-vite-02",
    q: ["`npm run dev` and `npm run build` in a Vite project: what is the difference?", "`npm run dev` et `npm run build` dans un projet Vite : quelle différence ?", "`npm run dev` y `npm run build` en un proyecto Vite: ¿qué diferencia hay?"],
    a: ["`dev` serves the sources with hot reloading; `build` writes optimised files to `dist/` for production", "`dev` sert les sources avec rechargement à chaud ; `build` écrit des fichiers optimisés dans `dist/` pour la production", "`dev` sirve las fuentes con recarga en caliente; `build` escribe archivos optimizados en `dist/` para producción"],
    w: [
      ["None: both produce the same files", "Aucune : les deux produisent les mêmes fichiers", "Ninguna: los dos producen los mismos archivos"],
      ["`build` starts the server, `dev` only checks types", "`build` lance le serveur, `dev` ne vérifie que les types", "`build` arranca el servidor, `dev` solo comprueba tipos"],
      ["`dev` deploys to a test server", "`dev` déploie sur un serveur de test", "`dev` despliega en un servidor de pruebas"],
    ],
    e: [
      "In development Vite serves modules on demand and updates the page as files change (Fast Refresh keeps React state). `build` bundles, minifies and names files by content hash. `npm run preview` serves `dist/` locally to check the build. Vite strips types without checking them: run `tsc --noEmit` too.",
      "En développement, Vite sert les modules à la demande et met la page à jour quand les fichiers changent (Fast Refresh garde l'état React). `build` regroupe, minifie et nomme les fichiers par empreinte de contenu. `npm run preview` sert `dist/` en local pour vérifier le build. Vite retire les types sans les vérifier : lancer aussi `tsc --noEmit`.",
      "En desarrollo Vite sirve los módulos bajo demanda y actualiza la página cuando cambian los archivos (Fast Refresh conserva el estado de React). `build` empaqueta, minimiza y nombra los archivos por huella de contenido. `npm run preview` sirve `dist/` en local para comprobar la compilación. Vite quita los tipos sin comprobarlos: ejecutar también `tsc --noEmit`.",
    ],
  },
  {
    id: "re-vite-03",
    q: ["Which environment variables does Vite expose to the browser code?", "Quelles variables d'environnement Vite expose-t-il au code du navigateur ?", "¿Qué variables de entorno expone Vite al código del navegador?"],
    a: ["Only those prefixed `VITE_`, read through `import.meta.env`", "Seulement celles préfixées `VITE_`, lues par `import.meta.env`", "Solo las que empiezan por `VITE_`, leídas con `import.meta.env`"],
    w: [
      ["All of them, through `process.env`", "Toutes, par `process.env`", "Todas, mediante `process.env`"],
      ["None: the browser has no environment", "Aucune : le navigateur n'a pas d'environnement", "Ninguna: el navegador no tiene entorno"],
      ["Those in `.env`, kept secret on the server", "Celles du `.env`, gardées secrètes sur le serveur", "Las del `.env`, guardadas en secreto en el servidor"],
    ],
    e: [
      "Vite writes the values of `VITE_` variables into the bundle at build time: anyone can read them in the browser. Secrets (database URLs, API keys) never get that prefix; they stay on the server, which calls the third party itself.",
      "Vite écrit les valeurs des variables `VITE_` dans le bundle au moment du build : n'importe qui peut les lire dans le navigateur. Les secrets (URL de base de données, clés d'API) ne portent jamais ce préfixe ; ils restent sur le serveur, qui appelle lui-même le service tiers.",
      "Vite escribe los valores de las variables `VITE_` en el bundle al compilar: cualquiera puede leerlos en el navegador. Los secretos (URL de base de datos, claves de API) nunca llevan ese prefijo; se quedan en el servidor, que llama él mismo al servicio externo.",
    ],
  },
  {
    id: "re-vite-04",
    q: ["Where does a React app built with Vite attach itself to the page?", "Où une application React construite avec Vite s'attache-t-elle à la page ?", "¿Dónde se engancha a la página una app React construida con Vite?"],
    a: ["To an element of `index.html`, with `createRoot(element).render(<App />)` in the entry module", "À un élément de `index.html`, avec `createRoot(element).render(<App />)` dans le module d'entrée", "A un elemento de `index.html`, con `createRoot(element).render(<App />)` en el módulo de entrada"],
    w: [
      ["`ReactDOM.render(<App />, element)`", "`ReactDOM.render(<App />, element)`", "`ReactDOM.render(<App />, element)`"],
      ["To `document.body` automatically", "À `document.body` automatiquement", "A `document.body` automáticamente"],
      ["To every `div` with the class `react`", "À chaque `div` de classe `react`", "A cada `div` con la clase `react`"],
    ],
    e: [
      "`index.html` is Vite's entry: it loads `src/main.tsx` as a module, which imports `createRoot` from `react-dom/client` and renders the app into `#root`. `ReactDOM.render` was removed in React 19. React manages everything inside that element and nothing outside it.",
      "`index.html` est l'entrée de Vite : il charge `src/main.tsx` comme module, qui importe `createRoot` de `react-dom/client` et rend l'application dans `#root`. `ReactDOM.render` a été supprimé dans React 19. React gère tout ce qui est dans cet élément et rien au-dehors.",
      "`index.html` es la entrada de Vite: carga `src/main.tsx` como módulo, que importa `createRoot` de `react-dom/client` y renderiza la app en `#root`. `ReactDOM.render` se eliminó en React 19. React gestiona todo lo que hay dentro de ese elemento y nada fuera.",
    ],
  },
  {
    id: "re-vite-05",
    q: ["A file in `public/`, such as `public/logo.svg`, is used how?", "Un fichier de `public/`, comme `public/logo.svg`, s'utilise comment ?", "Un archivo de `public/`, como `public/logo.svg`, ¿cómo se usa?"],
    a: ["By its absolute path, `/logo.svg`: it is copied as is, without a hashed name", "Par son chemin absolu, `/logo.svg` : il est copié tel quel, sans nom haché", "Por su ruta absoluta, `/logo.svg`: se copia tal cual, sin nombre con hash"],
    w: [
      ["By importing it from `../public/logo.svg`", "En l'important depuis `../public/logo.svg`", "Importándolo desde `../public/logo.svg`"],
      ["It is ignored by the build", "Il est ignoré par le build", "La compilación lo ignora"],
      ["Only in development", "Seulement en développement", "Solo en desarrollo"],
    ],
    e: [
      "Files imported from `src/` (`import logo from \"./logo.svg\"`) go through the bundler and get a content hash in their name, so they can be cached for a year. `public/` is for files that need a fixed name: `robots.txt`, a favicon, a manifest.",
      "Les fichiers importés depuis `src/` (`import logo from \"./logo.svg\"`) passent par le bundler et reçoivent une empreinte dans leur nom, ce qui permet de les mettre en cache un an. `public/` est pour les fichiers qui ont besoin d'un nom fixe : `robots.txt`, une favicon, un manifeste.",
      "Los archivos importados desde `src/` (`import logo from \"./logo.svg\"`) pasan por el bundler y reciben un hash en su nombre, así que se pueden guardar en caché un año. `public/` es para archivos que necesitan un nombre fijo: `robots.txt`, un favicon, un manifiesto.",
    ],
  },
];

const testingIntro: ReactQuestion[] = [
  {
    id: "re-test-01",
    q: ["What does React Testing Library encourage a test to look for?", "Que React Testing Library encourage-t-il un test à chercher ?", "¿Qué anima React Testing Library a buscar en un test?"],
    a: ["What the user sees: roles, labels and text, e.g. `getByRole(\"button\", { name: \"Save\" })`", "Ce que voit l'utilisateur : rôles, libellés et texte, par ex. `getByRole(\"button\", { name: \"Save\" })`", "Lo que ve el usuario: roles, etiquetas y texto, p. ej. `getByRole(\"button\", { name: \"Save\" })`"],
    w: [
      ["The component's state and private functions", "L'état du composant et ses fonctions privées", "El estado del componente y sus funciones privadas"],
      ["CSS classes and element ids first", "D'abord les classes CSS et les identifiants", "Primero las clases CSS y los ids"],
      ["The number of renders", "Le nombre de rendus", "El número de renderizados"],
    ],
    e: [
      "Tests that use the page the way a person does survive refactoring and check accessibility on the way: a button that cannot be found by its role and name is also invisible to a screen reader. `getByTestId` is the last resort.",
      "Des tests qui utilisent la page comme une personne survivent aux refactorisations et vérifient l'accessibilité au passage : un bouton introuvable par son rôle et son nom l'est aussi pour un lecteur d'écran. `getByTestId` est le dernier recours.",
      "Los tests que usan la página como una persona sobreviven a las refactorizaciones y comprueban la accesibilidad de paso: un botón que no se encuentra por su rol y nombre tampoco lo encuentra un lector de pantalla. `getByTestId` es el último recurso.",
    ],
  },
  {
    id: "re-test-02",
    q: ["Unit tests of components with Vitest need what environment?", "Les tests unitaires de composants avec Vitest ont besoin de quel environnement ?", "¿Qué entorno necesitan los tests unitarios de componentes con Vitest?"],
    a: ["A simulated DOM, `jsdom` or `happy-dom`, set as `environment` in the config", "Un DOM simulé, `jsdom` ou `happy-dom`, choisi comme `environment` dans la config", "Un DOM simulado, `jsdom` o `happy-dom`, puesto como `environment` en la config"],
    w: [
      ["A real browser, always", "Un vrai navigateur, toujours", "Un navegador real, siempre"],
      ["Nothing: Node has a DOM", "Rien : Node a un DOM", "Nada: Node tiene un DOM"],
      ["A running Vite dev server", "Un serveur de développement Vite lancé", "Un servidor de desarrollo de Vite en marcha"],
    ],
    e: [
      "Node has no `document`. jsdom implements the DOM in JavaScript, which is enough for rendering and events but not for layout (sizes are 0). For real layout, focus behaviour or several pages, use a browser: Vitest's browser mode, or Playwright end to end.",
      "Node n'a pas de `document`. jsdom implémente le DOM en JavaScript, ce qui suffit pour le rendu et les événements mais pas pour la mise en page (les tailles valent 0). Pour une vraie mise en page, le focus ou plusieurs pages, un navigateur : le mode navigateur de Vitest, ou Playwright de bout en bout.",
      "Node no tiene `document`. jsdom implementa el DOM en JavaScript, lo que basta para renderizar y para eventos, pero no para el diseño (los tamaños valen 0). Para diseño real, foco o varias páginas, un navegador: el modo navegador de Vitest, o Playwright de extremo a extremo.",
    ],
  },
  {
    id: "re-test-03",
    q: ["Playwright tests the app how?", "Comment Playwright teste-t-il l'application ?", "¿Cómo prueba Playwright la aplicación?"],
    a: ["End to end: it drives real browsers against the running app, server and database included", "De bout en bout : il pilote de vrais navigateurs contre l'application lancée, serveur et base compris", "De extremo a extremo: maneja navegadores reales contra la app en marcha, servidor y base de datos incluidos"],
    w: [
      ["By rendering components alone in jsdom", "En rendant les composants seuls dans jsdom", "Renderizando componentes sueltos en jsdom"],
      ["By reading the source code for errors", "En lisant le code source à la recherche d'erreurs", "Leyendo el código fuente en busca de errores"],
      ["By comparing screenshots only", "En comparant uniquement des captures d'écran", "Comparando solo capturas de pantalla"],
    ],
    e: [
      "Its `webServer` setting starts the app before the tests; locators such as `page.getByRole` wait until the element is ready, which avoids most sleeps. End-to-end tests are slower but catch what unit tests cannot: routing, cookies, the API, the build itself.",
      "Son réglage `webServer` lance l'application avant les tests ; les localisateurs comme `page.getByRole` attendent que l'élément soit prêt, ce qui évite la plupart des pauses. Les tests de bout en bout sont plus lents mais attrapent ce que les tests unitaires ne voient pas : routage, cookies, API, le build lui-même.",
      "Su opción `webServer` arranca la app antes de los tests; los localizadores como `page.getByRole` esperan a que el elemento esté listo, lo que evita la mayoría de pausas. Los tests de extremo a extremo son más lentos, pero detectan lo que los unitarios no ven: enrutado, cookies, la API, la propia compilación.",
    ],
  },
];

export const components = { jsx };
export const state = { useStateBasics };
export const effects = { effectsIntro };
export const rendering = { listsKeys };
export const data = { fetching };
export const typing = { propsTypes };
export const tooling = { viteSetup };
export const testing = { testingIntro };
