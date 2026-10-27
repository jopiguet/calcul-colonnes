import { at } from "./auth-i18n";
import { button, el } from "./dom";
import { currentLang } from "./i18n";
import { sendFeedback } from "./store";
import { tourLink } from "./tour";

/**
 * What a user sees of the releases: the version, a few lines of news per
 * release in their language (the CHANGELOG is the developer's), a banner
 * once after an update, and "Send feedback" for the owner to read.
 */

declare const __APP_VERSION__: string;
export const APP_VERSION = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev";

interface News {
  version: string;
  fr: string[];
  es: string[];
  en: string[];
}

/** Newest first. A release with nothing a user would notice has no entry. */
export const NEWS: News[] = [
  {
    version: "6.31.0",
    fr: ["🔶 Cloudflare : un nouveau QCM en quatre niveaux, du DNS et du cache aux Workers, à Zero Trust et à l'IA, avec des questions calculées sur les règles, le SSL/TLS, le cache, les tunnels et Access."],
    es: ["🔶 Cloudflare: un nuevo test en cuatro niveles, del DNS y la caché a los Workers, Zero Trust y la IA, con preguntas calculadas sobre reglas, SSL/TLS, caché, túneles y Access."],
    en: ["🔶 Cloudflare: a new test at four levels, from DNS and the cache to Workers, Zero Trust and AI, with computed questions on rules, SSL/TLS, caching, tunnels and Access."],
  },
  {
    version: "6.30.0",
    fr: ["Curiosités mathématiques : cinq nouveaux labos, avant Chimie et biologie. Le flocon de Koch, l'ensemble de Mandelbrot (zoome dans le bord), le jeu du chaos, l'attracteur de Lorenz (l'effet papillon) et le passage de l'ordre au chaos."],
    es: ["Curiosidades matemáticas: cinco laboratorios nuevos, antes de Química y biología. El copo de Koch, el conjunto de Mandelbrot (amplía el borde), el juego del caos, el atractor de Lorenz (el efecto mariposa) y el paso del orden al caos."],
    en: ["Mathematical curiosities: five new labs, before Chemistry and biology. The Koch snowflake, the Mandelbrot set (zoom into the edge), the chaos game, the Lorenz attractor (the butterfly effect) and the road from order to chaos."],
  },
  {
    version: "6.29.1",
    fr: ["Sur l'accueil, les exercices des livres ont leur propre groupe, à côté du vocabulaire ; Chimie et biologie passe à la fin."],
    es: ["En el inicio, los ejercicios de los libros tienen su propio grupo, junto al vocabulario; Química y biología pasa al final."],
    en: ["On the home page, the book exercises have a group of their own, next to the vocabulary; Chemistry and biology moves to the end."],
  },
  {
    version: "6.29.0",
    fr: ["✏️ Exercices des livres : les exercices de tes livres d'anglais (Grammar in Use, Vocabulary in Use, Idioms in Use…), à remplir sur la page même, corrigés à la fin de chaque unité."],
    es: ["✏️ Ejercicios de los libros: los ejercicios de tus libros de inglés (Grammar in Use, Vocabulary in Use, Idioms in Use…), para rellenar en la misma página, corregidos al final de cada unidad."],
    en: ["✏️ Book exercises: the exercises of your English workbooks (Grammar in Use, Vocabulary in Use, Idioms in Use…), filled in on the page itself, corrected at the end of each unit."],
  },
  {
    version: "6.28.0",
    fr: ["∫ Analyse : un nouveau QCM d'analyse, des limites au calcul stochastique, avec des questions sur des graphiques (tangentes, sommes de Riemann, champs de pentes, polynômes de Taylor…). Le QCM de maths reste là."],
    es: ["∫ Cálculo: un nuevo test de cálculo, de los límites al cálculo estocástico, con preguntas sobre gráficas (tangentes, sumas de Riemann, campos de pendientes, polinomios de Taylor…). El test de matemáticas sigue ahí."],
    en: ["∫ Calculus: a new test, from limits to stochastic calculus, with questions on graphs (tangents, Riemann sums, slope fields, Taylor polynomials…). The maths QCM stays."],
  },
  {
    version: "6.27.0",
    fr: [
      "📚 Les livres d'une même langue se rangent ensemble : une carte « Vocabulaire allemand » pour Collins, Lernwortschatz et Nietzsche, des séances sur les livres cochés, et chaque livre toujours ouvrable seul.",
      "Devoirs : « Passer toute la section » dans la liste des mots, et « Passer ce mot » sur une carte.",
      "Allemand : « die Ehre » suffit pour « die Ehre, -n », « finden » pour un verbe avec ses formes. En français, l'article est facultatif.",
    ],
    es: [
      "📚 Los libros de un mismo idioma se agrupan: una tarjeta «Vocabulario de alemán» para Collins, Lernwortschatz y Nietzsche, sesiones con los libros marcados, y cada libro se sigue abriendo solo.",
      "Deberes: «Saltar toda la sección» en la lista de palabras, y «Saltar esta palabra» en una tarjeta.",
      "Alemán: «die Ehre» basta para «die Ehre, -n», «finden» para un verbo con sus formas. En francés, el artículo es opcional.",
    ],
    en: [
      "📚 Books of one language are shelved together: one \"German vocabulary\" card for Collins, Lernwortschatz and Nietzsche, sessions across the books ticked, and each book still opens on its own.",
      "Homework: \"Skip the whole section\" in the word list, and \"Skip this word\" on a card.",
      "German: \"die Ehre\" is enough for \"die Ehre, -n\", \"finden\" for a verb with its forms. In French, the article is optional.",
    ],
  },
  {
    version: "6.26.0",
    fr: ["🏛️ Économie publique : un nouveau QCM sur la fiscalité, le bien-être, l'assurance sociale et le travail, avec des questions sur des graphiques (aires, courbes de Lorenz, monopsone…)."],
    es: ["🏛️ Economía pública: un nuevo test sobre impuestos, bienestar, seguro social y trabajo, con preguntas sobre gráficos (áreas, curvas de Lorenz, monopsonio…)."],
    en: ["🏛️ Public economics: a new test on taxation, welfare, social insurance and labour, with questions on charts (areas, Lorenz curves, monopsony…)."],
  },
  {
    version: "6.25.0",
    fr: ["☁️ Google Cloud : un nouveau QCM en quatre niveaux, centré sur IAM et l'infrastructure, avec des stratégies d'accès et des règles de pare-feu à évaluer."],
    es: ["☁️ Google Cloud: un nuevo test en cuatro niveles, centrado en IAM y la infraestructura, con políticas de acceso y reglas de firewall que evaluar."],
    en: ["☁️ Google Cloud: a new test at four levels, focused on IAM and infrastructure, with access policies and firewall rules to evaluate."],
  },
  {
    version: "6.24.0",
    fr: ["⚛️ React : un nouveau QCM en quatre niveaux, des composants à la pile qui les entoure (Vite, tests, déploiement), avec des composants dont il faut prédire l'affichage."],
    es: ["⚛️ React: un nuevo test en cuatro niveles, de los componentes a la pila que los rodea (Vite, tests, despliegue), con componentes cuya salida hay que predecir."],
    en: ["⚛️ React: a new test at four levels, from components to the stack around them (Vite, tests, deployment), with components whose output you predict."],
  },
  {
    version: "6.23.0",
    fr: ["🧭 Visite guidée : quelques pages pour faire le tour de Luma, à retrouver en bas de la page d'accueil."],
    es: ["🧭 Visita guiada: unas páginas para recorrer Luma, disponible al pie de la página de inicio."],
    en: ["🧭 Guided tour: a few pages around Luma, at the bottom of the home page whenever you want it."],
  },
  {
    version: "6.22.0",
    fr: ["🔷 TypeScript : un nouveau QCM en quatre niveaux, des types au JavaScript qui tourne dessous, avec des programmes dont il faut prédire l'affichage."],
    es: ["🔷 TypeScript: un nuevo test en cuatro niveles, de los tipos al JavaScript que se ejecuta debajo, con programas cuya salida hay que predecir."],
    en: ["🔷 TypeScript: a new test at four levels, from the types to the JavaScript running underneath, with programs whose output you predict."],
  },
  {
    version: "6.21.0",
    fr: ["🦀 Rust : un nouveau QCM en quatre niveaux, de Débutant à Expert, avec des programmes dont il faut prédire l'affichage."],
    es: ["🦀 Rust: un nuevo test en cuatro niveles, de Principiante a Experto, con programas cuya salida hay que predecir."],
    en: ["🦀 Rust: a new test at four levels, from Beginner to Expert, with programs whose output you predict."],
  },
  {
    version: "6.20.0",
    fr: ["🗄️ SQL : un nouveau QCM, du SELECT aux transactions, avec PostgreSQL, SQLite et MySQL, et les bonnes pratiques."],
    es: ["🗄️ SQL: un nuevo test, del SELECT a las transacciones, con PostgreSQL, SQLite y MySQL, y las buenas prácticas."],
    en: ["🗄️ SQL: a new test, from SELECT to transactions, with PostgreSQL, SQLite and MySQL, and good practice."],
  },
  {
    version: "6.19.0",
    fr: [
      "Luma s'ouvre à la famille et aux amis, sur invitation.",
      "Page Compte : télécharger vos données, ou supprimer votre compte.",
      "💬 Envoyer un avis, en bas de la page d'accueil.",
    ],
    es: [
      "Luma se abre a la familia y los amigos, por invitación.",
      "Página Cuenta: descargar tus datos, o eliminar tu cuenta.",
      "💬 Enviar una opinión, al pie de la página de inicio.",
    ],
    en: [
      "Luma opens to family and friends, by invitation.",
      "Account page: download your data, or delete your account.",
      "💬 Send feedback, at the bottom of the home page.",
    ],
  },
  {
    version: "6.18.0",
    fr: ["🗂️ Mes tests : chaque test passé, avec ses corrections, sur la page Mes progrès de chaque matière. Refaire ce test redonne les mêmes questions."],
    es: ["🗂️ Mis tests: cada test hecho, con sus correcciones, en la página Mi progreso de cada materia. Repetir este test da las mismas preguntas."],
    en: ["🗂️ My tests: every test taken, with its corrections, on each subject's progress page. Take this test again gives the same questions."],
  },
  {
    version: "6.17.2",
    fr: ["Vocabulaire : apprendre dans tout le livre apporte toujours de nouveaux mots, dans l'ordre du livre."],
    es: ["Vocabulario: aprender en todo el libro siempre trae palabras nuevas, en el orden del libro."],
    en: ["Vocabulary: learning from the whole book always brings new words, in the book's order."],
  },
  {
    version: "6.17.0",
    fr: ["Chimie physique : la thermodynamique statistique (Focus 13). Grilles logiques et réglages des tests plus compacts, sans sauts de page."],
    es: ["Química física: la termodinámica estadística (Focus 13). Rejillas lógicas y ajustes de los tests más compactos, sin saltos de página."],
    en: ["Physical chemistry: statistical thermodynamics (Focus 13). Logic grids and test settings more compact, without page jumps."],
  },
];

const SEEN_KEY = "luma-news-seen";

const linesOf = (n: News): string[] => (currentLang() === "es" ? n.es : currentLang() === "en" ? n.en : n.fr);

/** The release news not seen yet on this device, once: null when there is none. */
export function newsBanner(): HTMLElement | null {
  let seen: string | null = null;
  try {
    seen = localStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
  const latest = NEWS[0];
  if (!latest || latest.version !== APP_VERSION || seen === latest.version) return null;
  // A first visit: nothing is "new" yet; the news start with the next release.
  if (seen === null) {
    try {
      localStorage.setItem(SEEN_KEY, latest.version);
    } catch {
      // nothing kept
    }
    return null;
  }
  const box = el("aside", "news-banner");
  box.setAttribute("role", "status");
  const list = el("ul");
  for (const line of linesOf(latest)) list.append(el("li", undefined, line));
  box.append(
    el("strong", "news-title", `✨ ${at("newsBanner", { version: latest.version })}`),
    list,
    button("ghost small", at("newsClose"), () => {
      try {
        localStorage.setItem(SEEN_KEY, latest.version);
      } catch {
        // shown again next time
      }
      box.remove();
    }),
  );
  return box;
}

/** The foot of the home page: version and news, feedback, privacy. */
export function appFooter(page: string): HTMLElement {
  const foot = el("footer", "app-footer");
  const line = el("div", "app-footer-line");
  const version = el("span", "app-version", at("version", { version: APP_VERSION }));
  const newsPanel = el("div", "news-panel");
  newsPanel.hidden = true;
  const toggleNews = button("link", at("whatsNew"), () => {
    if (newsPanel.childElementCount === 0) {
      for (const n of NEWS) {
        newsPanel.append(el("h3", "news-version", n.version));
        const list = el("ul");
        for (const l of linesOf(n)) list.append(el("li", undefined, l));
        newsPanel.append(list);
      }
    }
    newsPanel.hidden = !newsPanel.hidden;
  });
  const privacy = el("a", "privacy-link", at("privacyLink"));
  privacy.href = "#privacy";

  const form = el("form", "feedback-form");
  form.hidden = true;
  const text = el("textarea", "feedback-text");
  text.maxLength = 2000;
  text.rows = 4;
  text.placeholder = at("feedbackPlaceholder");
  text.setAttribute("aria-label", at("feedbackOpen"));
  const send = el("button", "primary small", at("feedbackSend"));
  send.type = "submit";
  const said = el("p", "feedback-status");
  said.setAttribute("role", "status");
  form.append(text, send);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!text.value.trim()) return;
    send.disabled = true;
    sendFeedback(text.value.trim(), page)
      .then(() => {
        form.hidden = true;
        text.value = "";
        said.textContent = at("feedbackThanks");
      })
      .catch(() => (said.textContent = at("feedbackFailed")))
      .finally(() => (send.disabled = false));
  });
  const open = button("ghost small feedback-open", at("feedbackOpen"), () => {
    form.hidden = !form.hidden;
    said.textContent = "";
    if (!form.hidden) text.focus();
  });
  line.append(version, el("span", "app-footer-dot", "·"), toggleNews, el("span", "app-footer-dot", "·"), privacy);
  // The guided tour, opened again: on the home page, where the tour says it is.
  if (page === "home") line.append(el("span", "app-footer-dot", "·"), tourLink());
  foot.append(open, form, said, line, newsPanel);
  return foot;
}
