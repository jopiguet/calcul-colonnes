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
    version: "8.2.0",
    fr: ["Le rōmaji et les translittérations peuvent être masqués : nouveau choix « Jamais », sur les cartes comme dans la liste des mots.", "Le choix vaut pour tous les livres de toutes les langues, ou pour un seul livre : « Le même choix dans tous les livres »."],
    es: ["El rōmaji y las transliteraciones pueden ocultarse: nueva opción «Nunca», en las tarjetas y en la lista de palabras.", "La elección vale para todos los libros de todas las lenguas, o para un solo libro: «La misma elección en todos los libros»."],
    en: ["Rōmaji and transliterations can be hidden: a new choice, “Never”, on the cards and in the word list.", "The choice applies to every book of every language, or to one book: “The same choice in every book”."],
  },
  {
    version: "8.1.1",
    fr: ["Sur ordinateur, les réglages d'un test tiennent à nouveau dans la hauteur de l'écran."],
    es: ["En el ordenador, los ajustes de un test vuelven a caber en la altura de la pantalla."],
    en: ["On a computer, a test's settings fit the screen's height again."],
  },
  {
    version: "8.1.0",
    fr: ["Sur tablette et ordinateur, les écrans prennent plus de place : questions, cartes, labos et leurs images.", "La page d'un livre de vocabulaire sur grand écran : les révisions et les réglages à gauche, les leçons à droite.", "Les signes des tableaux des leçons (hiéroglyphes, cunéiformes) sont plus grands. Sur téléphone, rien ne change."],
    es: ["En tableta y ordenador, las pantallas ocupan más espacio: preguntas, tarjetas, laboratorios y sus imágenes.", "La página de un libro de vocabulario en pantalla grande: los repasos y los ajustes a la izquierda, las lecciones a la derecha.", "Los signos de las tablas de las lecciones (jeroglíficos, cuneiformes) son más grandes. En el móvil, nada cambia."],
    en: ["On a tablet or a computer, the screens use more room: questions, cards, labs and their pictures.", "A vocabulary book's page on a large screen: reviews and settings on the left, the lessons on the right.", "The signs in the lessons' tables (hieroglyphs, cuneiform) are larger. On a phone, nothing changes."],
  },
  {
    version: "8.0.1",
    fr: ["Sur iPhone : les niveaux d'un test gardent leur taille, et les cartes d'une section sur une ligne ne sont plus coupées en bas."],
    es: ["En iPhone: los niveles de un test conservan su tamaño, y las tarjetas de una sección en una línea ya no se cortan por abajo."],
    en: ["On iPhone: a test's levels keep their size, and the cards of a section on one line are no longer cut at the bottom."],
  },
  {
    version: "8.0.0",
    fr: ["Les cours s'écoutent : en malayalam, égyptien, sumérien et akkadien, un ▶ après les mots, les lettres des tableaux et les proverbes dit le mot.", "Les cartes des lettres malayalam disent la lettre une fois la réponse donnée.", "Une voix de synthèse : pour les langues anciennes, la lecture des enseignants (nfr « nefer »), non le son perdu de la langue."],
    es: ["Los cursos se escuchan: en malayalam, egipcio, sumerio y acadio, un ▶ tras las palabras, las letras de las tablas y los proverbios dice la palabra.", "Las tarjetas de las letras malayalam dicen la letra una vez respondida.", "Una voz sintética: para las lenguas antiguas, la lectura de los profesores (nfr «nefer»), no el sonido perdido de la lengua."],
    en: ["The courses can be listened to: in Malayalam, Egyptian, Sumerian and Akkadian, a ▶ after the words, the letters of the tables and the proverbs says the word.", "The Malayalam letter cards say the letter once answered.", "A synthetic voice: for the ancient languages, the reading teachers use (nfr “nefer”), not the lost sound of the language."],
  },
  {
    version: "7.10.0",
    fr: ["Accueil : chaque groupe tient sur une ligne, son titre l'ouvre en entier.", "Ce qui attend (mots à réviser, notions à revoir) passe en tête, le plus nombreux d'abord, puis reprend sa place une fois fait.", "Le ⋯ de chaque carte réorganise l'accueil comme sur un téléphone : déplacer les cartes et les groupes, retirer, rajouter."],
    es: ["Inicio: cada grupo cabe en una línea, su título lo abre entero.", "Lo pendiente (palabras por repasar, nociones por revisar) pasa delante, lo más numeroso primero, y vuelve a su sitio una vez hecho.", "El ⋯ de cada tarjeta reorganiza el inicio como en un teléfono: mover tarjetas y grupos, quitar, volver a añadir."],
    en: ["Home page: each group fits on one line; its title opens it whole.", "What waits (words to review, notions to revise) comes first, the most first, then goes back to its place once done.", "Each card's ⋯ arranges the home page as on a phone: move cards and groups, remove, add back."],
  },
  {
    version: "7.9.0",
    fr: ["Vocabulaire : le propriétaire du serveur peut exporter chaque livre en JSON, ou tous d'un coup, cours de langues compris, depuis sa page « Famille et amis ». Le fichier est au format que l'import relit."],
    es: ["Vocabulario: el propietario del servidor puede exportar cada libro en JSON, o todos de una vez, cursos de idiomas incluidos, desde su página «Familia y amigos». El archivo está en el formato que la importación vuelve a leer."],
    en: ["Vocabulary: the server's owner can export each book as JSON, or all of them at once, language courses included, from the \"Family and friends\" page. The file is in the format the import reads back."],
  },
  {
    version: "7.8.0",
    fr: ["Le vocabulaire des cours de langues est maintenant sous « Langues » sur l'accueil, avec les mots à réviser, à côté de vos livres de la même langue : chaque langue des cours y a sa carte, même sans autre livre. Les lettres malayalam aussi.", "Malayalam : un recueil de trente-trois proverbes par thème (leçon 19), tous dans le vocabulaire du cours."],
    es: ["El vocabulario de los cursos de idiomas está ahora en «Idiomas» en el inicio, con las palabras por repasar, junto a sus libros de la misma lengua: cada lengua de los cursos tiene su tarjeta, aunque no haya otro libro. Las letras malayalam también.", "Malayalam: un compendio de treinta y tres refranes por temas (lección 19), todos en el vocabulario del curso."],
    en: ["The language courses' vocabulary is now under \"Languages\" on the home page, with its words to review, beside your own books of the same language: every course language has its card, even with no other book. The Malayalam letters too.", "Malayalam: a compendium of thirty-three proverbs by theme (lesson 19), all of them in the course vocabulary."],
  },
  {
    version: "7.7.0",
    fr: ["Cours de langues : le malayalam, en 18 leçons, de l'écriture et ses ligatures aux cas, aux temps et aux participes, la langue parlée du Kerala, le calendrier de Kollam, puis les proverbes, Ezhuthachan et Kumaran Asan. Les réponses se tapent en malayalam, en ISO ou en « manglish » : « keralam » vaut കേരളം. Et 96 cartes des lettres, comme pour les kana."],
    es: ["Cursos de idiomas: el malayalam, en 18 lecciones, de la escritura y sus ligaduras a los casos, los tiempos y los participios, la lengua hablada de Kerala, el calendario de Kollam, y luego los refranes, Ezhuthachan y Kumaran Asan. Las respuestas se escriben en malayalam, en ISO o en «manglish»: «keralam» vale കേരളം. Y 96 tarjetas de las letras, como para los kana."],
    en: ["Language courses: Malayalam, 18 lessons from the script and its conjuncts to the cases, tenses and participles, the spoken language of Kerala, the Kollam calendar, then proverbs, Ezhuthachan and Kumaran Asan. Answers can be typed in Malayalam, ISO or Manglish: \"keralam\" counts as കേരളം. Plus 96 letter cards, as for the kana."],
  },
  {
    version: "7.6.0",
    fr: ["Cours de langues : l'hébreu, en 19 leçons, de l'alef-bet et du niqqud aux binyanim, aux temps et à la smikhout, l'hébreu parlé d'aujourd'hui, puis l'hébreu biblique : Genèse 1, le Chema, la bénédiction sacerdotale, le psaume 23 et l'Ecclésiaste. Les réponses se tapent en hébreu ou en lettres latines : « shalom » vaut שלום."],
    es: ["Cursos de idiomas: el hebreo, en 19 lecciones, del alef-bet y el niqud a los binyanim, los tiempos y la smijut, el hebreo hablado de hoy, y luego el hebreo bíblico: Génesis 1, el Shemá, la bendición sacerdotal, el salmo 23 y el Eclesiastés. Las respuestas se escriben en hebreo o en letras latinas: «shalom» vale שלום."],
    en: ["Language courses: Hebrew, 19 lessons from the alef-bet and niqqud to the binyanim, the tenses and smikhut, the Hebrew spoken today, then Biblical Hebrew: Genesis 1, the Shema, the Priestly Blessing, Psalm 23 and Ecclesiastes. Answers can be typed in Hebrew or Latin letters: \"shalom\" counts as שלום."],
  },
  {
    version: "7.5.0",
    fr: ["Cours de langues : l'arabe, en 22 leçons, de l'alphabet aux formes verbales, avec des exemples coraniques tout au long, puis l'écriture du Coran, la Fâtiha et les sourates courtes, et les dialectes d'aujourd'hui. Les réponses se tapent en arabe ou en lettres latines : « kitab » vaut كتاب."],
    es: ["Cursos de idiomas: el árabe, en 22 lecciones, del alfabeto a las formas verbales, con ejemplos coránicos a lo largo del curso, y luego la escritura del Corán, la Fátiha y las suras breves, y los dialectos de hoy. Las respuestas se escriben en árabe o en letras latinas: «kitab» vale كتاب."],
    en: ["Language courses: Arabic, 22 lessons from the alphabet to the verb forms, with Quranic examples throughout, then the script of the Quran, al-Fatiha and the short suras, and today's dialects. Answers can be typed in Arabic or Latin letters: \"kitab\" counts as كتاب."],
  },
  {
    version: "7.4.0",
    fr: ["Cours de langues : le persan, en 18 leçons, de l'alphabet au persan parlé de Téhéran, puis Ferdowsi, Saadi, Rûmî, Hâfez et Khayyâm. Le persan s'affiche de droite à gauche, et les réponses se tapent en persan ou en lettres latines : « ketab » vaut کتاب."],
    es: ["Cursos de idiomas: el persa, en 18 lecciones, del alfabeto al persa hablado de Teherán, y luego Ferdousí, Saadí, Rumi, Hafez y Jayam. El persa se muestra de derecha a izquierda, y las respuestas se escriben en persa o en letras latinas: «ketab» vale کتاب."],
    en: ["Language courses: Persian, 18 lessons from the alphabet to the spoken Persian of Tehran, then Ferdowsi, Saadi, Rumi, Hafez and Khayyam. Persian is shown right to left, and answers can be typed in Persian or Latin letters: \"ketab\" counts as کتاب."],
  },
  {
    version: "7.3.0",
    fr: ["Cours de langues : le grec ancien, en 24 leçons, de l'alphabet et des accents à l'optatif et aux verbes en -μι, puis Homère, Platon et l'Évangile de Jean. Les réponses se tapent en lettres grecques ou latines : « logos » vaut λόγος."],
    es: ["Cursos de idiomas: el griego antiguo, en 24 lecciones, del alfabeto y los acentos al optativo y los verbos en -μι, y luego Homero, Platón y el Evangelio de Juan. Las respuestas se escriben en letras griegas o latinas: «logos» vale λόγος."],
    en: ["Language courses: Ancient Greek, 24 lessons from the alphabet and accents to the optative and the -μι verbs, then Homer, Plato and the Gospel of John. Answers can be typed in Greek or Latin letters: \"logos\" counts as λόγος."],
  },
  {
    version: "7.2.0",
    fr: ["Cours de langues : le sumérien, en 12 leçons, et l'akkadien, en 14, de l'écriture cunéiforme aux inscriptions royales, au Code de Hammurabi et à Gilgamesh. Les signes sont dessinés en cunéiforme, et « digir » ou « sharraku » se tapent sans clavier spécial."],
    es: ["Cursos de idiomas: el sumerio, en 12 lecciones, y el acadio, en 14, de la escritura cuneiforme a las inscripciones reales, el Código de Hammurabi y Gilgamesh. Los signos se dibujan en cuneiforme, y «digir» o «sharraku» se escriben sin teclado especial."],
    en: ["Language courses: Sumerian in 12 lessons and Akkadian in 14, from cuneiform writing to royal inscriptions, the Laws of Hammurabi and Gilgamesh. The signs are drawn in cuneiform, and \"digir\" or \"sharraku\" can be typed on any keyboard."],
  },
  {
    version: "7.1.0",
    fr: ["Cours de langues : l'égyptien hiéroglyphique, en 21 leçons, des signes à Sinouhé, avec la formule d'offrande, les noms des rois et les symboles. Les lettres spéciales ont leurs boutons, et « ankh » vaut ꜥnḫ."],
    es: ["Cursos de idiomas: el egipcio jeroglífico, en 21 lecciones, de los signos a Sinuhé, con la fórmula de ofrenda, los nombres de los reyes y los símbolos. Las letras especiales tienen sus botones, y «ankh» vale ꜥnḫ."],
    en: ["Language courses: hieroglyphic Egyptian, 21 lessons from the signs to Sinuhe, with the offering formula, the kings' names and the symbols. The special letters have buttons, and \"ankh\" counts as ꜥnḫ."],
  },
  {
    version: "7.0.0",
    fr: ["Cours de langues : un cours de latin complet, en 31 leçons, de l'alphabet à Virgile. Chaque leçon a ses explications et tableaux, ses exercices corrigés, un résumé et ses mots à réviser."],
    es: ["Cursos de idiomas: un curso completo de latín, en 31 lecciones, del alfabeto a Virgilio. Cada lección tiene sus explicaciones y tablas, ejercicios corregidos, un resumen y sus palabras para repasar."],
    en: ["Language courses: a complete Latin course, 31 lessons from the alphabet to Virgil. Each lesson has its explanations and tables, marked exercises, a summary and its words to practise."],
  },
  {
    version: "6.37.0",
    fr: ["Vocabulaire : après la réponse, un signe cunéiforme montre ce qu'il est et fait et ses lectures par langue (chacune acceptée), un mot latin son genre, son génitif ou ses temps primitifs."],
    es: ["Vocabulario: tras la respuesta, un signo cuneiforme muestra lo que es y lo que hace y sus lecturas por idioma (cada una se acepta), una palabra latina su género, su genitivo o su enunciado."],
    en: ["Vocabulary: after the answer, a cuneiform sign shows what it is and does and its readings by language (each one accepted), a Latin word its gender, genitive or principal parts."],
  },
  {
    version: "6.36.0",
    fr: ["Exercices des livres : les cahiers en EPUB, comme Complete Spanish Grammar, se remplissent sur la page, avec la correction à la fin de l'unité."],
    es: ["Ejercicios de los libros: los cuadernos en EPUB, como Complete Spanish Grammar, se rellenan en la página, con la corrección al final de la unidad."],
    en: ["Workbook exercises: workbooks sold as EPUB, such as Complete Spanish Grammar, are filled in on the page, corrected at the end of the unit."],
  },
  {
    version: "6.35.1",
    fr: ["Vocabulaire : « el jugador de baloncesto » est accepté quand le livre écrit « el jugador / la jugadora de baloncesto », et en anglais « I'm » vaut « I am », « don't » vaut « do not »."],
    es: ["Vocabulario: «el jugador de baloncesto» se acepta cuando el libro escribe «el jugador / la jugadora de baloncesto», y en inglés «I'm» vale «I am», «don't» vale «do not»."],
    en: ["Vocabulary: \"el jugador de baloncesto\" is accepted when the book prints \"el jugador / la jugadora de baloncesto\", and in English \"I'm\" counts as \"I am\", \"don't\" as \"do not\"."],
  },
  {
    version: "6.35.0",
    fr: ["Vocabulaire : les dictionnaires illustrés. L'image accompagne le mot, et « L'image seule » demande le mot d'après l'image."],
    es: ["Vocabulario: los diccionarios ilustrados. La imagen acompaña la palabra, y «Solo la imagen» pide la palabra a partir de la imagen."],
    en: ["Vocabulary: picture dictionaries. The picture comes with the word, and \"Picture alone\" asks for the word from the picture."],
  },
  {
    version: "6.34.0",
    fr: ["Vocabulaire : portugais, swahili, chinois, sumérien (cunéiforme) et égyptien (hiéroglyphes), les signes en grand avec leur lecture. Une réponse courte comme « becoming » n'est plus refusée quand le livre en donne deux."],
    es: ["Vocabulario: portugués, suajili, chino, sumerio (cuneiforme) y egipcio (jeroglíficos), los signos en grande con su lectura. Una respuesta corta como «becoming» ya no se rechaza cuando el libro da dos."],
    en: ["Vocabulary: Portuguese, Swahili, Chinese, Sumerian (cuneiform) and Egyptian (hieroglyphs), the signs large with their reading. A short answer such as \"becoming\" is no longer refused when the book gives two."],
  },
  {
    version: "6.33.0",
    fr: [
      "Quatre niveaux partout : chaque QCM a maintenant Débutant, Intermédiaire, Avancé et Expert. Tes anciens tests et tes progrès restent à leur place.",
      "📖 Lire le cours : chaque QCM a maintenant son cours, court et dans ta langue, et une mauvaise réponse mène à la partie qui l'explique.",
    ],
    es: [
      "Cuatro niveles en todos: cada test tiene ahora Principiante, Intermedio, Avanzado y Experto. Tus tests anteriores y tu progreso siguen en su sitio.",
      "📖 Leer el curso: cada test tiene ahora su curso, breve y en tu idioma, y una respuesta incorrecta lleva a la parte que la explica.",
    ],
    en: [
      "Four levels everywhere: every test now has Beginner, Intermediate, Advanced and Expert. Your past tests and progress stay where they were.",
      "📖 Read the course: every test now has its course, short and in your language, and a wrong answer leads to the part that explains it.",
    ],
  },
  {
    version: "6.32.0",
    fr: [
      "⚒️ Le Capital : un nouveau QCM sur les trois livres du Capital de Marx, en trois niveaux, avec des questions calculées (plus-value, profit, schémas de reproduction, prix de production, rente).",
      "📖 Lire le cours : le Capital et Cloudflare ont maintenant leur cours dans l'appli, et une mauvaise réponse mène à la partie qui l'explique.",
    ],
    es: [
      "⚒️ El capital: un nuevo test sobre los tres libros de El capital de Marx, en tres niveles, con preguntas calculadas (plusvalor, ganancia, esquemas de reproducción, precios de producción, renta).",
      "📖 Leer el curso: El capital y Cloudflare tienen ahora su curso en la aplicación, y una respuesta incorrecta lleva a la parte que la explica.",
    ],
    en: [
      "⚒️ Capital: a new test on the three volumes of Marx's Capital, at three levels, with computed questions (surplus value, profit, reproduction schemes, prices of production, rent).",
      "📖 Read the course: Capital and Cloudflare now have their course in the app, and a wrong answer leads to the part that explains it.",
    ],
  },
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
