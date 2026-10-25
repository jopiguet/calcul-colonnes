/**
 * The texts of the guided tour (src/tour.ts), in French, Spanish and English.
 * Without the DOM, so that npm run check:tour can read them: every chip is
 * the label of a real button or heading of the app.
 */

export type Step = {
  id: string;
  icon: string;
  title: string;
  text: string[];
  chips?: string[];
  /** Only on an account's own session, or only on a player's own login. */
  only?: "account" | "player";
};

export interface Texts {
  steps: Step[];
  stepOf: (n: number, of: number) => string;
  previous: string;
  next: string;
  finish: string;
  skip: string;
  keys: string;
  /** The link in the footer of the home page. */
  link: string;
}

const fr: Texts = {
  steps: [
    {
      id: "welcome",
      icon: "👋",
      title: "Bienvenue sur Luma",
      text: [
        "Luma entraîne au calcul, aux mathématiques, aux sciences, à l'informatique et aux langues, par de courts exercices et des tests corrigés.",
        "Cette visite montre en quelques pages où se trouve chaque chose. Elle reste disponible en bas de la page d'accueil.",
      ],
      chips: ["🧭 Visite guidée"],
    },
    {
      id: "players",
      icon: "👥",
      title: "Un compte, plusieurs joueurs",
      text: [
        "Un compte peut réunir toute une famille ou une classe : chaque joueur a ses propres résultats et ses propres révisions.",
        "Le bouton avec le nom du joueur, en haut, ouvre « Qui joue ? » pour changer de joueur ou en ajouter un. Scores compare les joueurs du compte.",
        "Dans ⚙️, un joueur peut recevoir sa connexion propre, et un code de partage ouvre ses progrès à un autre compte.",
      ],
      chips: ["👤 Joueur", "Qui joue ?", "🏆 Scores", "⚙️"],
      only: "account",
    },
    {
      id: "own-login",
      icon: "🔑",
      title: "Ta propre connexion",
      text: [
        "Tu es connecté avec ta connexion propre : tu vois tes activités, tes résultats et tes révisions, et seulement les tiens.",
        "Le bouton 🚪, en haut, te déconnecte.",
      ],
      chips: ["🚪"],
      only: "player",
    },
    {
      id: "home",
      icon: "🏠",
      title: "La page d'accueil",
      text: [
        "Les activités sont rangées par domaine : Mathématiques, Sciences, Chimie et biologie, Informatique, Langues, Découvrir.",
        "Un badge sur une carte signale ce qui attend une révision.",
      ],
      chips: ["Mathématiques", "Sciences", "Informatique", "Langues", "Découvrir"],
    },
    {
      id: "tests",
      icon: "📝",
      title: "Les tests",
      text: [
        "Pour un test, on choisit le niveau, les thèmes et le nombre de questions. On répond parmi 4 choix, ou au clavier quand l'activité le permet.",
        "Les touches 1 à 4 répondent, ← → passent d'une question à l'autre. À la fin, chaque réponse est corrigée et expliquée ; une erreur typique est nommée.",
      ],
      chips: ["4 choix", "Au clavier", "Commencer le test"],
    },
    {
      id: "progress",
      icon: "📈",
      title: "Révisions et progrès",
      text: [
        "Les types de questions manquées reviennent dans les tests suivants, jusqu'à ce qu'ils soient acquis.",
        "Mes progrès montre ce qui est acquis et ce qui reste à travailler ; Mes tests garde chaque test, que l'on peut refaire à l'identique.",
      ],
      chips: ["📈 Mes progrès", "🗂️ Mes tests", "Refaire ce test"],
    },
    {
      id: "languages",
      icon: "🗣️",
      title: "Les langues",
      text: [
        "Chaque livre de vocabulaire se travaille leçon par leçon : Apprendre présente les mots nouveaux, Réviser les ramène au bon moment, de plus en plus espacés.",
        "Les écritures (kanji, kana, alphabet arabe) s'apprennent de la même manière.",
      ],
      chips: ["Apprendre", "Réviser"],
    },
    {
      id: "discover",
      icon: "🔭",
      title: "Découvrir",
      text: [
        "Physique, astronomie et biologie se découvrent dans de petits laboratoires interactifs : on change un paramètre et on observe ce qui se passe.",
      ],
      chips: ["Physique", "Astronomie"],
    },
    {
      id: "account",
      icon: "⚙️",
      title: "Le compte et les données",
      text: [
        "La page du compte permet de choisir les activités affichées, de télécharger ses données ou de supprimer le compte.",
        "Confidentialité explique ce que Luma garde et pourquoi. Envoyer un avis, en bas de l'accueil, nous écrit directement. La langue se change en haut à droite.",
      ],
      chips: ["Activités affichées", "🔒 Confidentialité", "💬 Envoyer un avis"],
      only: "account",
    },
    {
      id: "go",
      icon: "🚀",
      title: "C'est parti",
      text: ["Un bon début : un test court, cinq questions, au niveau qui te semble facile. Le reste suit."],
    },
  ],
  stepOf: (n, of) => `${n} / ${of}`,
  previous: "← Précédent",
  next: "Suivant →",
  finish: "Commencer",
  skip: "Passer la visite",
  keys: "Touches ← → pour naviguer",
  link: "🧭 Visite guidée",
};

const en: Texts = {
  steps: [
    {
      id: "welcome",
      icon: "👋",
      title: "Welcome to Luma",
      text: [
        "Luma trains arithmetic, maths, science, computing and languages, through short exercises and corrected tests.",
        "This tour shows, in a few pages, where everything is. It stays available at the bottom of the home page.",
      ],
      chips: ["🧭 Guided tour"],
    },
    {
      id: "players",
      icon: "👥",
      title: "One account, several players",
      text: [
        "An account can hold a whole family or class: each player has their own results and their own reviews.",
        "The button with the player's name, at the top, opens “Who's playing?” to switch player or add one. Scores compares the account's players.",
        "In ⚙️, a player can get their own login, and a sharing code opens their progress to another account.",
      ],
      chips: ["👤 Player", "Who's playing?", "🏆 Scores", "⚙️"],
      only: "account",
    },
    {
      id: "own-login",
      icon: "🔑",
      title: "Your own login",
      text: [
        "You are signed in with your own login: you see your activities, your results and your reviews, and only yours.",
        "The 🚪 button, at the top, signs you out.",
      ],
      chips: ["🚪"],
      only: "player",
    },
    {
      id: "home",
      icon: "🏠",
      title: "The home page",
      text: [
        "Activities are grouped by field: Mathematics, Sciences, Chemistry and biology, Computing, Languages, Discover.",
        "A badge on a card shows what is waiting for review.",
      ],
      chips: ["Mathematics", "Sciences", "Computing", "Languages", "Discover"],
    },
    {
      id: "tests",
      icon: "📝",
      title: "Tests",
      text: [
        "For a test, you choose the level, the topics and the number of questions. You answer among 4 choices, or by typing when the activity allows it.",
        "Keys 1 to 4 answer, ← → move between questions. At the end, every answer is corrected and explained; a typical mistake is named.",
      ],
      chips: ["4 choices", "Typed", "Start the quiz"],
    },
    {
      id: "progress",
      icon: "📈",
      title: "Reviews and progress",
      text: [
        "Kinds of question you missed come back in later tests, until they are mastered.",
        "My progress shows what is mastered and what still needs work; My tests keeps every test, which can be taken again exactly.",
      ],
      chips: ["📈 My progress", "🗂️ My tests", "Take this test again"],
    },
    {
      id: "languages",
      icon: "🗣️",
      title: "Languages",
      text: [
        "Each vocabulary book is worked lesson by lesson: Learn introduces new words, Review brings them back at the right time, further and further apart.",
        "Scripts (kanji, kana, the Arabic alphabet) are learnt the same way.",
      ],
      chips: ["Learn", "Review"],
    },
    {
      id: "discover",
      icon: "🔭",
      title: "Discover",
      text: [
        "Physics, astronomy and biology are explored in small interactive labs: change a parameter and watch what happens.",
      ],
      chips: ["Physics", "Astronomy"],
    },
    {
      id: "account",
      icon: "⚙️",
      title: "Account and data",
      text: [
        "The account page chooses the activities shown, downloads your data or deletes the account.",
        "Privacy explains what Luma keeps and why. Send feedback, at the bottom of the home page, writes to us directly. The language is changed at the top right.",
      ],
      chips: ["Activities shown", "🔒 Privacy", "💬 Send feedback"],
      only: "account",
    },
    {
      id: "go",
      icon: "🚀",
      title: "Off you go",
      text: ["A good start: a short test, five questions, at a level that feels easy. The rest follows."],
    },
  ],
  stepOf: (n, of) => `${n} / ${of}`,
  previous: "← Previous",
  next: "Next →",
  finish: "Start",
  skip: "Skip the tour",
  keys: "Keys ← → to move",
  link: "🧭 Guided tour",
};

const es: Texts = {
  steps: [
    {
      id: "welcome",
      icon: "👋",
      title: "Bienvenido a Luma",
      text: [
        "Luma entrena el cálculo, las matemáticas, las ciencias, la informática y los idiomas, con ejercicios cortos y tests corregidos.",
        "Esta visita muestra en pocas páginas dónde está cada cosa. Sigue disponible al pie de la página de inicio.",
      ],
      chips: ["🧭 Visita guiada"],
    },
    {
      id: "players",
      icon: "👥",
      title: "Una cuenta, varios jugadores",
      text: [
        "Una cuenta puede reunir a toda una familia o una clase: cada jugador tiene sus propios resultados y sus propios repasos.",
        "El botón con el nombre del jugador, arriba, abre «¿Quién juega?» para cambiar de jugador o añadir uno. Puntuaciones compara a los jugadores de la cuenta.",
        "En ⚙️, un jugador puede recibir su propio acceso, y un código para compartir abre su progreso a otra cuenta.",
      ],
      chips: ["👤 Jugador", "¿Quién juega?", "🏆 Puntuaciones", "⚙️"],
      only: "account",
    },
    {
      id: "own-login",
      icon: "🔑",
      title: "Tu propio acceso",
      text: [
        "Has entrado con tu propio acceso: ves tus actividades, tus resultados y tus repasos, y solo los tuyos.",
        "El botón 🚪, arriba, cierra la sesión.",
      ],
      chips: ["🚪"],
      only: "player",
    },
    {
      id: "home",
      icon: "🏠",
      title: "La página de inicio",
      text: [
        "Las actividades se agrupan por ámbito: Matemáticas, Ciencias, Química y biología, Informática, Idiomas, Descubrir.",
        "Una insignia en una tarjeta indica lo que espera un repaso.",
      ],
      chips: ["Matemáticas", "Ciencias", "Informática", "Idiomas", "Descubrir"],
    },
    {
      id: "tests",
      icon: "📝",
      title: "Los tests",
      text: [
        "Para un test se eligen el nivel, los temas y el número de preguntas. Se responde entre 4 opciones, o con el teclado cuando la actividad lo permite.",
        "Las teclas 1 a 4 responden, ← → pasan de una pregunta a otra. Al final, cada respuesta se corrige y se explica; un error típico se nombra.",
      ],
      chips: ["4 opciones", "Con el teclado", "Empezar el test"],
    },
    {
      id: "progress",
      icon: "📈",
      title: "Repasos y progreso",
      text: [
        "Los tipos de pregunta fallados vuelven en los tests siguientes, hasta dominarlos.",
        "Mi progreso muestra lo dominado y lo que queda por trabajar; Mis tests guarda cada test, que se puede repetir tal cual.",
      ],
      chips: ["📈 Mi progreso", "🗂️ Mis tests", "Repetir este test"],
    },
    {
      id: "languages",
      icon: "🗣️",
      title: "Los idiomas",
      text: [
        "Cada libro de vocabulario se trabaja lección por lección: Aprender presenta las palabras nuevas, Repasar las trae de vuelta en el momento justo, cada vez más espaciadas.",
        "Las escrituras (kanji, kana, alfabeto árabe) se aprenden del mismo modo.",
      ],
      chips: ["Aprender", "Repasar"],
    },
    {
      id: "discover",
      icon: "🔭",
      title: "Descubrir",
      text: [
        "La física, la astronomía y la biología se exploran en pequeños laboratorios interactivos: se cambia un parámetro y se observa lo que pasa.",
      ],
      chips: ["Física", "Astronomía"],
    },
    {
      id: "account",
      icon: "⚙️",
      title: "La cuenta y los datos",
      text: [
        "La página de la cuenta permite elegir las actividades visibles, descargar los datos o eliminar la cuenta.",
        "Privacidad explica qué guarda Luma y por qué. Enviar una opinión, al pie del inicio, nos escribe directamente. El idioma se cambia arriba a la derecha.",
      ],
      chips: ["Actividades visibles", "🔒 Privacidad", "💬 Enviar una opinión"],
      only: "account",
    },
    {
      id: "go",
      icon: "🚀",
      title: "¡Adelante!",
      text: ["Un buen comienzo: un test corto, cinco preguntas, en un nivel que parezca fácil. Lo demás viene solo."],
    },
  ],
  stepOf: (n, of) => `${n} / ${of}`,
  previous: "← Anterior",
  next: "Siguiente →",
  finish: "Empezar",
  skip: "Saltar la visita",
  keys: "Teclas ← → para avanzar",
  link: "🧭 Visita guiada",
};

export type TourLang = "fr" | "es" | "en";

export const TOUR_TEXTS: Record<TourLang, Texts> = { fr, en, es };

/** The pages for a session: an account's own, or a player's own login. */
export function tourSteps(playerSession: boolean, lang: TourLang): Step[] {
  return TOUR_TEXTS[lang].steps.filter((s) => !s.only || s.only === (playerSession ? "player" : "account"));
}


