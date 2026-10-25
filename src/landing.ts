/**
 * Landing page, for visitors who are not signed in and have never signed in on
 * this browser. Returning visitors go straight to the sign-in screen.
 *
 * The hero writes one column addition the way the app teaches it: units first,
 * the carry above the next column, then leftwards. That is the page's only
 * animation, and it is skipped with prefers-reduced-motion.
 */
import katex from "katex";
import type { AuthOptions } from "../shared/types";
import { el } from "./dom";
import { currentLang, type Lang } from "./i18n";

const texts = {
  fr: {
    signIn: "Se connecter",
    signUp: "Créer un compte",
    haveAccount: "J'ai déjà un compte",
    title: "Le calcul posé, comme dans le cahier.",
    lead: "Additions, soustractions, multiplications et divisions en colonnes, écrites des unités vers la gauche avec les retenues. Des QCM de mathématiques pour le lycée et la première année d'université. Et du vocabulaire, espagnol et anglais, qui revient au bon moment.",
    figure: "Une addition posée : 478 plus 356 égale 834, avec deux retenues.",
    columnsTitle: "Le calcul en colonnes",
    columnsText: "Les quatre opérations, disposées comme sur papier. On écrit les unités d'abord, la retenue au-dessus de la colonne suivante. La multiplication par deux chiffres a une ligne par produit partiel ; la division a sa potence, avec le reste.",
    columnsMore: "Une fiche A4 de 20 opérations s'imprime en un clic.",
    quizTitle: "Des QCM qui corrigent vraiment",
    quizText: "Dérivées, intégrales, trigonométrie, limites, exponentielles et logarithmes, niveau lycée ou université. Chaque question est générée, et chaque mauvaise réponse proposée est une erreur typique : l'exposant oublié, la dérivée intérieure manquante, le signe inversé.",
    quizMore: "La correction nomme l'erreur commise.",
    reviewTitle: "Les erreurs reviennent jusqu'à être comprises",
    reviewText: "Un type de question raté revient dans les tests suivants, jusqu'à deux bonnes réponses d'affilée. La page de progrès montre, pour chaque enfant, ce qui est acquis, ce qui est en cours et les erreurs les plus fréquentes.",
    reviewMore: "Dérivée d'une composée : à revoir",
    vocabTitle: "Le vocabulaire, par répétition espacée",
    vocabText: "Espagnol avec traductions, anglais avec définitions : les chapitres d'un livre de vocabulaire deviennent des leçons. Chaque mot revient après 10 minutes, puis 1, 3, 7, 16 et 35 jours, et repart du début après une erreur. Choix multiples quand il est nouveau, réponse écrite quand il est connu.",
    vocabMore: "Un accent oublié est pardonné, un article faux ne l'est pas.",
    familyTitle: "Un compte pour l'adulte, un accès pour chaque enfant",
    familyText: "Le parent ou l'enseignant crée le compte et les joueurs. Chaque enfant peut recevoir son propre identifiant : il ne voit alors que ses exercices et ses résultats.",
    privacy: "Pas de publicité, pas de traceur, aucune ressource chargée depuis un autre site.",
    languages: "En français, en espagnol et en anglais.",
    closed: "Les inscriptions sont fermées sur ce serveur.",
    byInvite: "Sur invitation : le lien reçu ouvre la création du compte.",
    privacyLink: "🔒 Confidentialité",
  },
  es: {
    signIn: "Iniciar sesión",
    signUp: "Crear una cuenta",
    haveAccount: "Ya tengo una cuenta",
    title: "Cálculo en columnas, como en el cuaderno.",
    lead: "Sumas, restas, multiplicaciones y divisiones en columnas, escritas de las unidades hacia la izquierda con las llevadas. Tests de matemáticas para bachillerato y primer año de universidad. Y vocabulario, de español y de inglés, que vuelve en el momento justo.",
    figure: "Una suma en columnas: 478 más 356 es 834, con dos llevadas.",
    columnsTitle: "Cálculo en columnas",
    columnsText: "Las cuatro operaciones, dispuestas como en papel. Se escriben primero las unidades y la llevada encima de la columna siguiente. La multiplicación por dos cifras tiene una línea por producto parcial; la división, su galera con el resto.",
    columnsMore: "Una ficha A4 de 20 operaciones se imprime con un clic.",
    quizTitle: "Tests que corrigen de verdad",
    quizText: "Derivadas, integrales, trigonometría, límites, exponenciales y logaritmos, nivel bachillerato o universidad. Cada pregunta se genera, y cada opción incorrecta es un error típico: el exponente olvidado, la derivada interior que falta, el signo cambiado.",
    quizMore: "La corrección nombra el error cometido.",
    reviewTitle: "Los errores vuelven hasta entenderlos",
    reviewText: "Un tipo de pregunta fallado vuelve en los tests siguientes, hasta dos respuestas correctas seguidas. La página de progreso muestra, para cada niño, lo adquirido, lo que está en curso y los errores más frecuentes.",
    reviewMore: "Derivada de una composición: por repasar",
    vocabTitle: "Vocabulario, con repetición espaciada",
    vocabText: "Español con traducciones, inglés con definiciones: los capítulos de un libro de vocabulario se convierten en lecciones. Cada palabra vuelve a los 10 minutos, luego a 1, 3, 7, 16 y 35 días, y empieza de nuevo tras un error. Opción múltiple cuando es nueva, respuesta escrita cuando ya se conoce.",
    vocabMore: "Una tilde olvidada se perdona, un artículo equivocado no.",
    familyTitle: "Una cuenta para el adulto, un acceso para cada niño",
    familyText: "El padre, la madre o el profesor crea la cuenta y los jugadores. Cada niño puede recibir su propio usuario: entonces solo ve sus ejercicios y sus resultados.",
    privacy: "Sin publicidad, sin rastreadores, ningún recurso cargado desde otro sitio.",
    languages: "En francés, español e inglés.",
    closed: "El registro está cerrado en este servidor.",
    byInvite: "Por invitación: el enlace recibido abre la creación de la cuenta.",
    privacyLink: "🔒 Privacidad",
  },
  en: {
    signIn: "Sign in",
    signUp: "Create an account",
    haveAccount: "I already have an account",
    title: "Column arithmetic, the way it's written in the exercise book.",
    lead: "Addition, subtraction, multiplication and division in columns, written from the units leftwards, with carries. Multiple-choice maths tests for secondary school and first-year university. And vocabulary, Spanish and English, that comes back at the right time.",
    figure: "A column addition: 478 plus 356 equals 834, with two carries.",
    columnsTitle: "Column arithmetic",
    columnsText: "The four operations, laid out as on paper. The units are written first, and the carry above the next column. Multiplying by two digits gives one line per partial product; division has its bracket and remainder.",
    columnsMore: "An A4 sheet of 20 operations prints in one click.",
    quizTitle: "Quizzes that really correct",
    quizText: "Derivatives, integrals, trigonometry, limits, exponentials and logarithms, at secondary-school or university level. Every question is generated, and every wrong option is a typical mistake: the exponent not lowered, the inner derivative forgotten, the sign flipped.",
    quizMore: "The correction names the mistake made.",
    reviewTitle: "Mistakes come back until they're understood",
    reviewText: "A kind of question answered wrong comes back in later quizzes until it has been answered right twice in a row. The progress page shows, for each child, what is mastered, what is in progress and their most frequent mistakes.",
    reviewMore: "Derivative of a composition: to review",
    vocabTitle: "Vocabulary, with spaced repetition",
    vocabText: "Spanish with translations, English with definitions: the chapters of a vocabulary book become lessons. Each word comes back after 10 minutes, then 1, 3, 7, 16 and 35 days, and starts again after a mistake. Multiple choice while it is new, a written answer once it is known.",
    vocabMore: "A forgotten accent is forgiven, a wrong article is not.",
    familyTitle: "One account for the adult, a sign-in for each child",
    familyText: "The parent or teacher creates the account and the players. Each child can get a username of their own: they then see only their own exercises and results.",
    privacy: "No ads, no trackers, nothing loaded from another site.",
    languages: "In French, Spanish and English.",
    closed: "Registration is closed on this server.",
    byInvite: "By invitation: the link you received opens the sign-up.",
    privacyLink: "🔒 Privacy",
  },
} satisfies Record<Lang, Record<string, string>>;

type LandingKey = keyof (typeof texts)["fr"];
const lt = (key: LandingKey): string => texts[currentLang()][key];

/** 478 + 356 = 834: the hero's addition, with the step at which each digit appears. */
function heroBoard(): HTMLElement {
  const figure = el("figure", "hero-board");
  figure.setAttribute("role", "img");
  figure.setAttribute("aria-label", lt("figure"));

  const grid = el("div", "hero-grid");
  grid.setAttribute("aria-hidden", "true");
  const cell = (text: string, cls = "", step?: number): HTMLElement => {
    const c = el("span", `hero-cell ${cls}`.trim(), text);
    if (step !== undefined) c.style.setProperty("--step", String(step));
    return c;
  };
  // Four columns: operator, hundreds, tens, units.
  grid.append(
    cell(""), cell("1", "hero-carry", 3), cell("1", "hero-carry", 1), cell(""),
    cell(""), cell("4"), cell("7"), cell("8"),
    cell("+", "hero-op"), cell("3"), cell("5"), cell("6"),
    el("span", "hero-rule"),
    cell(""), cell("8", "hero-answer", 4), cell("3", "hero-answer", 2), cell("4", "hero-answer", 0),
  );
  figure.append(grid);
  return figure;
}

/** A small division in the bracket layout, as the app draws it. */
function divisionSample(): HTMLElement {
  const d = el("div", "sample-division");
  d.setAttribute("aria-hidden", "true");
  d.append(
    el("span", "sd-dividend", "128"),
    el("span", "sd-divisor", "4"),
    el("span", "sd-work", "08"),
    el("span", "sd-quotient", "32"),
    el("span", "sd-rest", "0"),
  );
  return d;
}

function formulaSample(): HTMLElement {
  const box = el("div", "sample-formula");
  box.setAttribute("aria-hidden", "true");
  katex.render("\\frac{d}{dx}\\,\\sin(3x^2) = 6x\\cos(3x^2)", box, { throwOnError: false, displayMode: true });
  return box;
}

function reviewSample(): HTMLElement {
  const box = el("div", "sample-review");
  box.setAttribute("aria-hidden", "true");
  const dots = el("span", "dots");
  for (const ok of [false, true, false]) dots.append(el("span", `dot ${ok ? "good" : "bad"}`));
  box.append(el("span", "sample-review-text", lt("reviewMore")), dots);
  return box;
}

/** A vocabulary card as the app shows it: the word, its box. */
function vocabSample(): HTMLElement {
  const box = el("div", "sample-vocab");
  box.setAttribute("aria-hidden", "true");
  const word = el("span", "sample-vocab-word", "la llave");
  word.lang = "es";
  const dots = el("span", "vocab-box");
  for (let i = 1; i <= 6; i++) dots.append(el("span", i <= 3 ? "on" : ""));
  box.append(word, el("span", "sample-vocab-answer", "key"), dots);
  return box;
}

export interface LandingContext {
  options: AuthOptions;
  /** The page's top bar (language selector), shared with the app. */
  topBar: HTMLElement;
}

export function landingView({ options, topBar }: LandingContext): HTMLElement {
  const page = el("div", "landing");

  // Header: name of the app on the left, language and sign-in on the right.
  const head = el("header", "landing-head");
  const brand = el("a", "brand", "Luma");
  brand.href = "#about";
  const signIn = el("a", "landing-signin", lt("signIn"));
  signIn.href = "#sign-in";
  topBar.classList.add("landing-tools");
  topBar.append(signIn);
  head.append(brand, topBar);

  // Hero.
  const hero = el("section", "hero");
  const text = el("div", "hero-text");
  const cta = el("div", "hero-cta");
  if (options.invite) {
    // By invitation: the link received opens the sign-up form; here, sign in.
    const only = el("a", "button primary", lt("signIn"));
    only.href = "#sign-in";
    cta.append(only, el("p", "hero-note", lt("byInvite")));
  } else if (options.registration) {
    const signUp = el("a", "button primary", lt("signUp"));
    signUp.href = "#sign-up";
    const have = el("a", "button quiet", lt("haveAccount"));
    have.href = "#sign-in";
    cta.append(signUp, have);
  } else {
    const only = el("a", "button primary", lt("signIn"));
    only.href = "#sign-in";
    cta.append(only, el("p", "hero-note", lt("closed")));
  }
  text.append(el("h1", "hero-title", lt("title")), el("p", "hero-lead", lt("lead")), cta);
  hero.append(text, heroBoard());

  // What the app does, each with a real sample of what the child sees.
  const features = el("section", "features");
  const feature = (title: LandingKey, body: LandingKey, more: LandingKey | null, sample: HTMLElement): HTMLElement => {
    const f = el("article", "feature");
    const words = el("div", "feature-text");
    words.append(el("h2", "feature-title", lt(title)), el("p", undefined, lt(body)));
    if (more) words.append(el("p", "feature-more", lt(more)));
    f.append(sample, words);
    return f;
  };
  features.append(
    feature("columnsTitle", "columnsText", "columnsMore", divisionSample()),
    feature("quizTitle", "quizText", "quizMore", formulaSample()),
    feature("reviewTitle", "reviewText", null, reviewSample()),
    feature("vocabTitle", "vocabText", "vocabMore", vocabSample()),
  );

  const family = el("section", "family");
  family.append(el("h2", "feature-title", lt("familyTitle")), el("p", undefined, lt("familyText")));

  const foot = el("footer", "landing-foot");
  const privacy = el("a", "landing-privacy", lt("privacyLink"));
  privacy.href = "#privacy";
  foot.append(el("p", undefined, lt("privacy")), el("p", undefined, lt("languages")), privacy);

  page.append(head, hero, features, family, foot);
  return page;
}
