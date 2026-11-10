/**
 * GitHub, Débutant: what a repository, a commit, a branch and a fork are,
 * issues and labels, opening and reviewing a pull request, accounts and
 * roles, why main is protected, a first workflow, secrets, and what
 * Dependabot does. Code between backticks is the same in the three
 * languages.
 */
import type { LinuxQuestion as GithubQuestion } from "../linux/types";

const reposBasics: GithubQuestion[] = [
  {
    id: "gh-repos-01",
    q: ["What is the difference between cloning and forking a repository?", "Quelle est la différence entre cloner et forker un dépôt ?", "¿Qué diferencia hay entre clonar y hacer un fork de un repositorio?"],
    a: ["A clone is a copy on your computer; a fork is a copy under your own GitHub account, which you can then clone", "Un clone est une copie sur ton ordinateur ; un fork est une copie sous ton propre compte GitHub, que tu peux ensuite cloner", "Un clon es una copia en tu ordenador; un fork es una copia bajo tu propia cuenta de GitHub, que luego puedes clonar"],
    w: [["They are the same thing under two names", "C'est la même chose sous deux noms", "Son lo mismo con dos nombres"], ["A fork downloads only the last commit, a clone the whole history", "Un fork ne télécharge que le dernier commit, un clone tout l'historique", "Un fork descarga solo el último commit; un clon, todo el historial"], ["A clone can be pushed to anyone's repository, a fork cannot be pushed at all", "Un clone peut être poussé dans n'importe quel dépôt, un fork ne peut pas être poussé du tout", "Un clon se puede subir al repositorio de cualquiera; un fork no se puede subir en absoluto"]],
    e: [
      "`git clone` copies a repository, with its whole history, to your machine. A fork is a server-side copy on GitHub, owned by you: you fork a project you cannot write to, push your branch to your fork, and open a pull request back to the original.",
      "`git clone` copie un dépôt, avec tout son historique, sur ta machine. Un fork est une copie côté serveur, sur GitHub, qui t'appartient : on forke un projet dans lequel on ne peut pas écrire, on pousse sa branche dans son fork, puis on ouvre une pull request vers l'original.",
      "`git clone` copia un repositorio, con todo su historial, en tu máquina. Un fork es una copia en el servidor, en GitHub, que te pertenece: haces fork de un proyecto en el que no puedes escribir, subes tu rama a tu fork y abres una pull request hacia el original.",
    ],
  },
  {
    id: "gh-repos-02",
    q: ["What is a commit?", "Qu'est-ce qu'un commit ?", "¿Qué es un commit?"],
    a: ["A snapshot of the project's files with a message, an author and a link to the commit before it", "Un instantané des fichiers du projet, avec un message, un auteur et un lien vers le commit précédent", "Una instantánea de los archivos del proyecto, con un mensaje, un autor y un enlace al commit anterior"],
    w: [["A copy of one file that changed, sent to GitHub", "La copie d'un fichier modifié, envoyée à GitHub", "La copia de un archivo modificado, enviada a GitHub"], ["A comment left on a line of code", "Un commentaire laissé sur une ligne de code", "Un comentario dejado en una línea de código"], ["A request to merge a branch into main", "Une demande de fusion d'une branche dans main", "Una petición de fusionar una rama en main"]],
    e: [
      "Each commit records the whole tree of files at that moment (Git stores unchanged files once), plus who made it, when, why (the message) and its parent. That chain of parents is the history. Committing is local; `git push` sends the commits to GitHub.",
      "Chaque commit enregistre l'arborescence complète des fichiers à ce moment (Git ne stocke qu'une fois les fichiers inchangés), avec qui l'a fait, quand, pourquoi (le message) et son parent. Cette chaîne de parents est l'historique. Committer est local ; `git push` envoie les commits à GitHub.",
      "Cada commit registra el árbol completo de archivos en ese momento (Git guarda una sola vez los archivos sin cambios), con quién lo hizo, cuándo, por qué (el mensaje) y su padre. Esa cadena de padres es el historial. Hacer commit es local; `git push` envía los commits a GitHub.",
    ],
  },
  {
    id: "gh-repos-03",
    q: ["What is a `.gitignore` file for?", "À quoi sert un fichier `.gitignore` ?", "¿Para qué sirve un archivo `.gitignore`?"],
    a: ["It lists files Git should not track, such as build output, dependencies and local secrets", "Il liste les fichiers que Git ne doit pas suivre, comme les résultats de build, les dépendances et les secrets locaux", "Lista los archivos que Git no debe seguir, como los resultados de compilación, las dependencias y los secretos locales"],
    w: [["It hides files from other people while keeping them in the repository", "Il cache des fichiers aux autres tout en les gardant dans le dépôt", "Oculta archivos a los demás sin quitarlos del repositorio"], ["It deletes files already committed from the history", "Il supprime de l'historique les fichiers déjà committés", "Borra del historial los archivos ya confirmados"], ["It tells GitHub which files to show on the home page", "Il dit à GitHub quels fichiers montrer sur la page d'accueil", "Le dice a GitHub qué archivos mostrar en la página principal"]],
    e: [
      "Patterns such as `node_modules/`, `dist/` or `.env` keep generated and private files out of commits. It only affects untracked files: a file already committed stays tracked until you remove it with `git rm --cached`, and a secret committed once stays in the history.",
      "Des motifs comme `node_modules/`, `dist/` ou `.env` gardent les fichiers générés et privés hors des commits. Cela ne vaut que pour les fichiers non suivis : un fichier déjà committé reste suivi jusqu'à ce qu'on le retire avec `git rm --cached`, et un secret committé une fois reste dans l'historique.",
      "Patrones como `node_modules/`, `dist/` o `.env` mantienen fuera de los commits los archivos generados y privados. Solo afecta a los archivos no seguidos: un archivo ya confirmado sigue seguido hasta que lo quitas con `git rm --cached`, y un secreto confirmado una vez se queda en el historial.",
    ],
  },
  {
    id: "gh-repos-04",
    q: ["Why work on a branch instead of committing straight to `main`?", "Pourquoi travailler sur une branche plutôt que committer directement sur `main` ?", "¿Por qué trabajar en una rama en vez de hacer commit directamente en `main`?"],
    a: ["The change stays apart until it is reviewed and tested, and `main` stays deployable", "Le changement reste à part jusqu'à ce qu'il soit relu et testé, et `main` reste déployable", "El cambio queda aparte hasta que se revisa y se prueba, y `main` sigue siendo desplegable"],
    w: [["Branches make Git faster", "Les branches rendent Git plus rapide", "Las ramas hacen Git más rápido"], ["Commits on `main` cannot be undone", "Les commits sur `main` ne peuvent pas être annulés", "Los commits en `main` no se pueden deshacer"], ["GitHub deletes commits made on `main` after a week", "GitHub supprime après une semaine les commits faits sur `main`", "GitHub borra al cabo de una semana los commits hechos en `main`"]],
    e: [
      "A branch is just a movable pointer to a commit, cheap to create. Work happens on a short-lived branch, a pull request shows the change for review and runs the checks, and only then is it merged. That is the GitHub flow: `main` always works.",
      "Une branche n'est qu'un pointeur mobile vers un commit, peu coûteux à créer. Le travail se fait sur une branche de courte durée, une pull request montre le changement pour la revue et lance les vérifications, et alors seulement on fusionne. C'est le GitHub flow : `main` fonctionne toujours.",
      "Una rama no es más que un puntero móvil a un commit, barato de crear. El trabajo se hace en una rama de corta duración, una pull request muestra el cambio para revisarlo y lanza las comprobaciones, y solo entonces se fusiona. Es el GitHub flow: `main` siempre funciona.",
    ],
  },
];

const issuesBasics: GithubQuestion[] = [
  {
    id: "gh-issues-01",
    q: ["A pull request's description says `Fixes #42`. What happens when it is merged into the default branch?", "La description d'une pull request dit `Fixes #42`. Que se passe-t-il quand elle est fusionnée dans la branche par défaut ?", "La descripción de una pull request dice `Fixes #42`. ¿Qué pasa cuando se fusiona en la rama por defecto?"],
    a: ["Issue 42 is closed automatically and linked to the pull request", "L'issue 42 est fermée automatiquement et liée à la pull request", "La issue 42 se cierra automáticamente y queda enlazada a la pull request"],
    w: [["Issue 42 gets a label `fixed`", "L'issue 42 reçoit un label `fixed`", "La issue 42 recibe una etiqueta `fixed`"], ["Nothing: the words are only a convention for humans", "Rien : ces mots ne sont qu'une convention pour les humains", "Nada: esas palabras son solo una convención para humanos"], ["Issue 42 is closed as soon as the pull request is opened", "L'issue 42 est fermée dès que la pull request est ouverte", "La issue 42 se cierra en cuanto se abre la pull request"]],
    e: [
      "The closing keywords (`close`, `fix`, `resolve` and their forms) link the issue at once and close it when the pull request is merged into the default branch. Merged into another branch, the issue stays open. `Refs #42` only links, without closing.",
      "Les mots-clés de fermeture (`close`, `fix`, `resolve` et leurs formes) lient l'issue tout de suite et la ferment quand la pull request est fusionnée dans la branche par défaut. Fusionnée dans une autre branche, l'issue reste ouverte. `Refs #42` lie seulement, sans fermer.",
      "Las palabras de cierre (`close`, `fix`, `resolve` y sus formas) enlazan la issue enseguida y la cierran cuando la pull request se fusiona en la rama por defecto. Fusionada en otra rama, la issue sigue abierta. `Refs #42` solo enlaza, sin cerrar.",
    ],
  },
  {
    id: "gh-issues-02",
    q: ["What are labels for on issues?", "À quoi servent les labels sur les issues ?", "¿Para qué sirven las etiquetas en las issues?"],
    a: ["Sorting and filtering issues by kind, area or state, such as `bug`, `docs` or `good first issue`", "Trier et filtrer les issues par nature, domaine ou état, comme `bug`, `docs` ou `good first issue`", "Clasificar y filtrar las issues por tipo, área o estado, como `bug`, `docs` o `good first issue`"],
    w: [["Giving an issue a deadline", "Donner une échéance à une issue", "Dar una fecha límite a una issue"], ["Assigning an issue to a person", "Assigner une issue à une personne", "Asignar una issue a una persona"], ["Making an issue private", "Rendre une issue privée", "Hacer privada una issue"]],
    e: [
      "Labels are free-form tags shared by issues and pull requests in a repository. Search uses them (`label:bug`), boards group by them, and some have a public meaning: `good first issue` and `help wanted` are surfaced to newcomers. Deadlines belong to milestones, people to assignees.",
      "Les labels sont des étiquettes libres, communes aux issues et aux pull requests d'un dépôt. La recherche les utilise (`label:bug`), les tableaux regroupent par eux, et certains ont un sens public : `good first issue` et `help wanted` sont mis en avant pour les nouveaux venus. Les échéances relèvent des milestones, les personnes des assignés.",
      "Las etiquetas son marcas libres, comunes a las issues y pull requests de un repositorio. La búsqueda las usa (`label:bug`), los tableros agrupan por ellas y algunas tienen un sentido público: `good first issue` y `help wanted` se muestran a los recién llegados. Las fechas son cosa de los milestones; las personas, de los asignados.",
    ],
  },
  {
    id: "gh-issues-03",
    q: ["What does writing `@lea` in an issue comment do?", "Que fait l'écriture de `@lea` dans un commentaire d'issue ?", "¿Qué hace escribir `@lea` en un comentario de una issue?"],
    a: ["It notifies the user `lea` and subscribes her to the issue", "Elle notifie l'utilisatrice `lea` et l'abonne à l'issue", "Notifica a la usuaria `lea` y la suscribe a la issue"],
    w: [["It assigns the issue to `lea`", "Elle assigne l'issue à `lea`", "Asigna la issue a `lea`"], ["It gives `lea` write access to the repository", "Elle donne à `lea` l'accès en écriture au dépôt", "Da a `lea` acceso de escritura al repositorio"], ["Nothing unless `lea` already watches the repository", "Rien, sauf si `lea` suit déjà le dépôt", "Nada, salvo que `lea` ya siga el repositorio"]],
    e: [
      "A mention sends a notification and subscribes the person to the thread; `@org/team` notifies every member of a team. Mention people deliberately: it is an interruption. Assigning is a separate action, and permissions never change through a comment.",
      "Une mention envoie une notification et abonne la personne au fil ; `@org/team` notifie chaque membre d'une équipe. Mentionne à bon escient : c'est une interruption. Assigner est une action distincte, et les permissions ne changent jamais par un commentaire.",
      "Una mención envía una notificación y suscribe a la persona al hilo; `@org/team` notifica a cada miembro de un equipo. Menciona con criterio: es una interrupción. Asignar es una acción aparte, y los permisos nunca cambian por un comentario.",
    ],
  },
  {
    id: "gh-issues-04",
    q: ["What makes a good bug report?", "Qu'est-ce qui fait un bon rapport de bug ?", "¿Qué hace un buen informe de error?"],
    a: ["Steps to reproduce, what was expected, what happened, and the version or environment", "Les étapes pour reproduire, ce qui était attendu, ce qui s'est passé, et la version ou l'environnement", "Los pasos para reproducirlo, lo que se esperaba, lo que pasó y la versión o el entorno"],
    w: [["A title in capitals so that it is seen", "Un titre en majuscules pour qu'il soit vu", "Un título en mayúsculas para que se vea"], ["The proposed fix, without describing the problem", "La correction proposée, sans décrire le problème", "La corrección propuesta, sin describir el problema"], ["A mention of every maintainer", "Une mention de chaque mainteneur", "Una mención a cada mantenedor"]],
    e: [
      "A maintainer must first see the bug to fix it. Minimal steps, expected against actual behaviour, the exact error text and the version save rounds of questions. Issue forms can ask for exactly these fields; search for a duplicate before opening.",
      "Un mainteneur doit d'abord voir le bug pour le corriger. Des étapes minimales, le comportement attendu face au comportement réel, le texte exact de l'erreur et la version épargnent des allers-retours. Les formulaires d'issue peuvent demander exactement ces champs ; cherche un doublon avant d'ouvrir.",
      "Un mantenedor tiene que ver primero el error para corregirlo. Pasos mínimos, el comportamiento esperado frente al real, el texto exacto del error y la versión ahorran idas y vueltas. Los formularios de issue pueden pedir justo esos campos; busca un duplicado antes de abrir.",
    ],
  },
];

const pullsBasics: GithubQuestion[] = [
  {
    id: "gh-pulls-01",
    q: ["In a pull request, what are the base branch and the compare (head) branch?", "Dans une pull request, que sont la branche de base et la branche comparée (head) ?", "En una pull request, ¿qué son la rama base y la rama comparada (head)?"],
    a: ["The base receives the changes; the compare branch holds them", "La base reçoit les changements ; la branche comparée les contient", "La base recibe los cambios; la rama comparada los contiene"],
    w: [["The base holds the changes; the compare branch receives them", "La base contient les changements ; la branche comparée les reçoit", "La base contiene los cambios; la rama comparada los recibe"], ["They are two copies that GitHub keeps in sync", "Ce sont deux copies que GitHub garde synchronisées", "Son dos copias que GitHub mantiene sincronizadas"], ["The base is always `main`, the compare branch always a fork", "La base est toujours `main`, la branche comparée toujours un fork", "La base es siempre `main` y la comparada siempre un fork"]],
    e: [
      "A pull request asks to merge head into base: usually `feature/login` into `main`. The diff shows what head has that base does not. The base can be any branch, and head can live in the same repository or in a fork.",
      "Une pull request demande de fusionner head dans base : en général `feature/login` dans `main`. Le diff montre ce que head a et que base n'a pas. La base peut être n'importe quelle branche, et head peut vivre dans le même dépôt ou dans un fork.",
      "Una pull request pide fusionar head en base: normalmente `feature/login` en `main`. El diff muestra lo que head tiene y base no. La base puede ser cualquier rama, y head puede estar en el mismo repositorio o en un fork.",
    ],
  },
  {
    id: "gh-pulls-02",
    q: ["What is a draft pull request for?", "À quoi sert une pull request en brouillon (draft) ?", "¿Para qué sirve una pull request en borrador (draft)?"],
    a: ["Sharing work in progress: it cannot be merged and code owners are not asked to review until it is marked ready", "Partager un travail en cours : elle ne peut pas être fusionnée et les code owners ne sont pas sollicités avant qu'elle soit marquée prête", "Compartir trabajo en curso: no se puede fusionar y no se pide revisión a los code owners hasta marcarla lista"],
    w: [["Keeping a pull request hidden from other people", "Cacher une pull request aux autres", "Ocultar una pull request a los demás"], ["Running the workflows without spending minutes", "Lancer les workflows sans consommer de minutes", "Ejecutar los workflows sin gastar minutos"], ["Saving a pull request that GitHub deletes after a day", "Garder une pull request que GitHub supprime après un jour", "Guardar una pull request que GitHub borra al cabo de un día"]],
    e: [
      "A draft is visible to everyone who can see the repository and runs its checks; it just signals not ready yet. Early drafts invite feedback on direction before the details are polished. Ready for review turns it into a normal pull request.",
      "Un brouillon est visible par tous ceux qui voient le dépôt et lance ses vérifications ; il signale seulement qu'il n'est pas prêt. Un brouillon ouvert tôt invite des retours sur la direction avant que les détails soient peaufinés. Ready for review le change en pull request normale.",
      "Un borrador es visible para todos los que ven el repositorio y lanza sus comprobaciones; solo indica que aún no está listo. Un borrador temprano invita a comentar la dirección antes de pulir los detalles. Ready for review lo convierte en una pull request normal.",
    ],
  },
  {
    id: "gh-pulls-03",
    q: ["A reviewer chooses Request changes. What does that mean?", "Un relecteur choisit Request changes. Qu'est-ce que cela signifie ?", "Un revisor elige Request changes. ¿Qué significa?"],
    a: ["The reviewer asks for changes before merging; with required reviews, it blocks the merge until resolved", "Le relecteur demande des modifications avant la fusion ; avec des revues exigées, cela bloque la fusion jusqu'à résolution", "El revisor pide cambios antes de fusionar; con revisiones exigidas, bloquea la fusión hasta resolverlo"],
    w: [["GitHub rewrites the code as the reviewer suggests", "GitHub réécrit le code comme le relecteur le propose", "GitHub reescribe el código como propone el revisor"], ["The pull request is closed", "La pull request est fermée", "La pull request se cierra"], ["The author loses write access until the changes are made", "L'auteur perd l'accès en écriture jusqu'aux modifications", "El autor pierde el acceso de escritura hasta hacer los cambios"]],
    e: [
      "A review is Comment, Approve or Request changes. Request changes stays on the pull request until the same reviewer approves, or the review is dismissed. Under branch protection with required approvals, an outstanding request for changes blocks the merge.",
      "Une revue est Comment, Approve ou Request changes. Request changes reste sur la pull request jusqu'à ce que le même relecteur approuve, ou que la revue soit écartée (dismiss). Sous une protection de branche avec approbations exigées, une demande de modifications en suspens bloque la fusion.",
      "Una revisión es Comment, Approve o Request changes. Request changes se queda en la pull request hasta que el mismo revisor apruebe o la revisión se descarte (dismiss). Con protección de rama y aprobaciones exigidas, una petición de cambios pendiente bloquea la fusión.",
    ],
  },
  {
    id: "gh-pulls-04",
    q: ["What makes a pull request easy to review?", "Qu'est-ce qui rend une pull request facile à relire ?", "¿Qué hace fácil de revisar una pull request?"],
    a: ["One focused change, small enough to read in one sitting, with a description of why and how to test it", "Un seul changement ciblé, assez petit pour être lu d'une traite, avec une description du pourquoi et de comment le tester", "Un único cambio concreto, lo bastante pequeño para leerlo de una vez, con una descripción del porqué y de cómo probarlo"],
    w: [["Grouping a week of changes so reviewers look only once", "Regrouper une semaine de changements pour que les relecteurs ne regardent qu'une fois", "Agrupar una semana de cambios para que los revisores miren una sola vez"], ["Reformatting every file at the same time, for consistency", "Reformater tous les fichiers en même temps, par cohérence", "Reformatear todos los archivos a la vez, por coherencia"], ["Leaving the description empty: the diff says everything", "Laisser la description vide : le diff dit tout", "Dejar la descripción vacía: el diff lo dice todo"]],
    e: [
      "Review quality drops sharply with size: a few hundred lines get real attention, thousands get a skim. Separate refactors and reformatting from behaviour changes, link the issue, and say how you tested. Screenshots help for interface changes.",
      "La qualité d'une revue chute avec la taille : quelques centaines de lignes reçoivent une vraie attention, des milliers un survol. Sépare les refactorings et le reformatage des changements de comportement, lie l'issue et dis comment tu as testé. Des captures d'écran aident pour l'interface.",
      "La calidad de una revisión cae con el tamaño: unos cientos de líneas reciben atención real; miles, una ojeada. Separa las refactorizaciones y el reformateo de los cambios de comportamiento, enlaza la issue y explica cómo lo probaste. Las capturas ayudan con la interfaz.",
    ],
  },
];

const teamsBasics: GithubQuestion[] = [
  {
    id: "gh-teams-01",
    q: ["What does an organization give that a personal account does not?", "Qu'apporte une organisation qu'un compte personnel n'a pas ?", "¿Qué aporta una organización que una cuenta personal no tiene?"],
    a: ["Shared ownership of repositories, teams with their own permissions, and owners who manage members", "La propriété partagée des dépôts, des équipes avec leurs propres permissions, et des propriétaires qui gèrent les membres", "La propiedad compartida de los repositorios, equipos con sus propios permisos y propietarios que gestionan a los miembros"],
    w: [["Unlimited private repositories, which personal accounts lack", "Des dépôts privés illimités, que les comptes personnels n'ont pas", "Repositorios privados ilimitados, que las cuentas personales no tienen"], ["A second login for each person", "Un deuxième identifiant pour chaque personne", "Un segundo usuario para cada persona"], ["Faster Git operations", "Des opérations Git plus rapides", "Operaciones de Git más rápidas"]],
    e: [
      "People keep their personal accounts and join organizations as members. Repositories then belong to the organization, not to whoever created them, so nothing is lost when someone leaves. Personal accounts also have unlimited private repositories on the free plan.",
      "Chacun garde son compte personnel et rejoint des organisations comme membre. Les dépôts appartiennent alors à l'organisation, pas à celui qui les a créés, donc rien n'est perdu quand quelqu'un part. Les comptes personnels ont eux aussi des dépôts privés illimités sur le plan gratuit.",
      "Cada uno conserva su cuenta personal y se une a organizaciones como miembro. Los repositorios pertenecen entonces a la organización, no a quien los creó, así que nada se pierde cuando alguien se va. Las cuentas personales también tienen repositorios privados ilimitados en el plan gratuito.",
    ],
  },
  {
    id: "gh-teams-02",
    q: ["Which repository role lets someone manage issues and pull requests without pushing code?", "Quel rôle de dépôt permet de gérer issues et pull requests sans pousser de code ?", "¿Qué rol de repositorio permite gestionar issues y pull requests sin subir código?"],
    a: ["Triage", "Triage", "Triage"],
    w: [["Read", "Read", "Read"], ["Write", "Write", "Write"], ["Maintain", "Maintain", "Maintain"]],
    e: [
      "The five roles, from least to most: Read (view, clone, comment), Triage (also label, assign, close issues and pull requests), Write (push, merge), Maintain (also manage the repository's settings except the dangerous ones), Admin (everything, including deletion and access).",
      "Les cinq rôles, du moindre au plus large : Read (voir, cloner, commenter), Triage (en plus étiqueter, assigner, fermer issues et pull requests), Write (pousser, fusionner), Maintain (en plus gérer les réglages du dépôt sauf les dangereux), Admin (tout, suppression et accès compris).",
      "Los cinco roles, de menos a más: Read (ver, clonar, comentar), Triage (además etiquetar, asignar, cerrar issues y pull requests), Write (subir, fusionar), Maintain (además gestionar los ajustes del repositorio salvo los peligrosos), Admin (todo, incluidos el borrado y los accesos).",
    ],
  },
  {
    id: "gh-teams-03",
    q: ["Why give access through teams rather than to each person?", "Pourquoi donner les accès par équipes plutôt qu'à chaque personne ?", "¿Por qué dar acceso por equipos en vez de a cada persona?"],
    a: ["Access follows membership: joining or leaving a team changes every repository at once", "L'accès suit l'appartenance : rejoindre ou quitter une équipe change tous les dépôts d'un coup", "El acceso sigue a la pertenencia: entrar o salir de un equipo cambia todos los repositorios a la vez"],
    w: [["Teams get more permissions than people can", "Les équipes reçoivent plus de permissions que les personnes", "Los equipos reciben más permisos que las personas"], ["People alone cannot be given access to a repository", "On ne peut pas donner accès à un dépôt à une personne seule", "No se puede dar acceso a un repositorio a una persona sola"], ["Teams are required to open pull requests", "Les équipes sont nécessaires pour ouvrir des pull requests", "Los equipos son necesarios para abrir pull requests"]],
    e: [
      "Granting access person by person drifts: people change roles and keep rights. A team such as `@acme/backend` holds the permission, and also serves for mentions and code review requests. Audits become one question: who is in the team?",
      "Donner les accès personne par personne dérive : les gens changent de rôle et gardent leurs droits. Une équipe comme `@acme/backend` porte la permission, et sert aussi aux mentions et aux demandes de revue. Un audit devient une seule question : qui est dans l'équipe ?",
      "Dar acceso persona a persona deriva: la gente cambia de puesto y conserva sus derechos. Un equipo como `@acme/backend` lleva el permiso, y sirve también para menciones y peticiones de revisión. Una auditoría se reduce a una pregunta: ¿quién está en el equipo?",
    ],
  },
  {
    id: "gh-teams-04",
    q: ["What should a `CONTRIBUTING.md` file contain?", "Que doit contenir un fichier `CONTRIBUTING.md` ?", "¿Qué debe contener un archivo `CONTRIBUTING.md`?"],
    a: ["How to set up the project, propose a change and get it reviewed: branches, tests, style, what a good pull request is", "Comment installer le projet, proposer un changement et le faire relire : branches, tests, style, ce qu'est une bonne pull request", "Cómo instalar el proyecto, proponer un cambio y que lo revisen: ramas, pruebas, estilo, qué es una buena pull request"],
    w: [["The project's licence", "La licence du projet", "La licencia del proyecto"], ["How to report a security vulnerability privately", "Comment signaler une vulnérabilité en privé", "Cómo informar en privado de una vulnerabilidad"], ["The list of releases", "La liste des versions publiées", "La lista de versiones publicadas"]],
    e: [
      "GitHub links `CONTRIBUTING.md` when someone opens an issue or a pull request. The licence goes in `LICENSE`, vulnerability reporting in `SECURITY.md`, behaviour in `CODE_OF_CONDUCT.md`, the history in releases or a `CHANGELOG.md`. An organization can provide defaults in a `.github` repository.",
      "GitHub met un lien vers `CONTRIBUTING.md` quand quelqu'un ouvre une issue ou une pull request. La licence va dans `LICENSE`, le signalement des vulnérabilités dans `SECURITY.md`, le comportement dans `CODE_OF_CONDUCT.md`, l'historique dans les releases ou un `CHANGELOG.md`. Une organisation peut fournir des fichiers par défaut dans un dépôt `.github`.",
      "GitHub enlaza `CONTRIBUTING.md` cuando alguien abre una issue o una pull request. La licencia va en `LICENSE`, el aviso de vulnerabilidades en `SECURITY.md`, la conducta en `CODE_OF_CONDUCT.md`, el historial en las releases o un `CHANGELOG.md`. Una organización puede dar archivos por defecto en un repositorio `.github`.",
    ],
  },
];

const protectionBasics: GithubQuestion[] = [
  {
    id: "gh-protection-01",
    q: ["Why protect the `main` branch?", "Pourquoi protéger la branche `main` ?", "¿Por qué proteger la rama `main`?"],
    a: ["So that changes reach it only through reviewed pull requests whose checks pass", "Pour que les changements n'y arrivent que par des pull requests relues dont les vérifications passent", "Para que los cambios solo lleguen a ella mediante pull requests revisadas cuyas comprobaciones pasan"],
    w: [["To hide it from people who are not members", "Pour la cacher aux non-membres", "Para ocultarla a quienes no son miembros"], ["To keep a backup copy of it", "Pour en garder une copie de secours", "Para guardar una copia de seguridad"], ["Because GitHub refuses to deploy unprotected branches", "Parce que GitHub refuse de déployer les branches non protégées", "Porque GitHub se niega a desplegar ramas sin proteger"]],
    e: [
      "Without protection, anyone with write access can push straight to `main`, force-push over its history or delete it. A rule requiring a pull request, approvals and passing checks turns good habits into guarantees, which matters most when `main` deploys automatically.",
      "Sans protection, quiconque a l'accès en écriture peut pousser directement sur `main`, réécrire son historique par un force-push ou la supprimer. Une règle exigeant une pull request, des approbations et des vérifications réussies change les bonnes habitudes en garanties, ce qui compte surtout quand `main` se déploie automatiquement.",
      "Sin protección, cualquiera con acceso de escritura puede subir directamente a `main`, reescribir su historial con un force-push o borrarla. Una regla que exige pull request, aprobaciones y comprobaciones superadas convierte los buenos hábitos en garantías, sobre todo cuando `main` se despliega automáticamente.",
    ],
  },
  {
    id: "gh-protection-02",
    q: ["A rule requires one approving review. Can the pull request's author approve it?", "Une règle exige une revue approuvée. L'auteur de la pull request peut-il l'approuver ?", "Una regla exige una revisión aprobada. ¿Puede aprobarla el autor de la pull request?"],
    a: ["No: GitHub does not let authors approve their own pull requests", "Non : GitHub ne laisse pas un auteur approuver sa propre pull request", "No: GitHub no deja que un autor apruebe su propia pull request"],
    w: [["Yes, if they are an administrator", "Oui, s'il est administrateur", "Sí, si es administrador"], ["Yes, but only after 24 hours", "Oui, mais seulement après 24 heures", "Sí, pero solo pasadas 24 horas"], ["Yes: one approval from anyone counts", "Oui : une approbation de n'importe qui compte", "Sí: cuenta una aprobación de cualquiera"]],
    e: [
      "The point of required review is a second person. Authors can comment on their pull request but not approve it. An administrator may be allowed to bypass the rule and merge anyway, which is a different thing, and visible in the history.",
      "Le but d'une revue exigée, c'est une deuxième personne. L'auteur peut commenter sa pull request mais pas l'approuver. Un administrateur peut être autorisé à contourner la règle et fusionner quand même, ce qui est autre chose, et visible dans l'historique.",
      "El sentido de una revisión exigida es una segunda persona. El autor puede comentar su pull request pero no aprobarla. A un administrador se le puede permitir saltarse la regla y fusionar igualmente, que es otra cosa, y visible en el historial.",
    ],
  },
  {
    id: "gh-protection-03",
    q: ["What does a required status check do?", "Que fait une vérification de statut exigée (required status check) ?", "¿Qué hace una comprobación de estado exigida (required status check)?"],
    a: ["It blocks the merge until a named check, such as the test job, has succeeded on the pull request", "Elle bloque la fusion jusqu'à ce qu'une vérification nommée, comme le job de tests, ait réussi sur la pull request", "Bloquea la fusión hasta que una comprobación con nombre, como el job de pruebas, haya tenido éxito en la pull request"],
    w: [["It runs the tests again after the merge", "Elle relance les tests après la fusion", "Vuelve a lanzar las pruebas tras la fusión"], ["It sends an e-mail when a check fails", "Elle envoie un e-mail quand une vérification échoue", "Envía un correo cuando una comprobación falla"], ["It makes every workflow of the repository mandatory", "Elle rend obligatoire chaque workflow du dépôt", "Hace obligatorio cada workflow del repositorio"]],
    e: [
      "You pick checks by name (for example `test` or `build`), reported by Actions or another CI. Until each has passed on the latest commit of the pull request, the merge button stays disabled. Checks that are not required only inform.",
      "On choisit les vérifications par leur nom (par exemple `test` ou `build`), rapportées par Actions ou une autre CI. Tant que chacune n'a pas réussi sur le dernier commit de la pull request, le bouton de fusion reste désactivé. Les vérifications non exigées informent seulement.",
      "Se eligen las comprobaciones por su nombre (por ejemplo `test` o `build`), informadas por Actions u otra CI. Mientras cada una no haya pasado en el último commit de la pull request, el botón de fusión sigue desactivado. Las no exigidas solo informan.",
    ],
  },
  {
    id: "gh-protection-04",
    q: ["Why block force-pushes on `main`?", "Pourquoi bloquer les force-push sur `main` ?", "¿Por qué bloquear los force-push en `main`?"],
    a: ["A force-push can replace published history, losing other people's commits and breaking their clones", "Un force-push peut remplacer un historique publié, perdre les commits des autres et casser leurs clones", "Un force-push puede sustituir un historial publicado, perder commits de otros y romper sus clones"],
    w: [["Force-pushes are slower than normal pushes", "Les force-push sont plus lents que les push normaux", "Los force-push son más lentos que los push normales"], ["A force-push deletes the repository", "Un force-push supprime le dépôt", "Un force-push borra el repositorio"], ["Force-pushes skip the `.gitignore`", "Les force-push ignorent le `.gitignore`", "Los force-push se saltan el `.gitignore`"]],
    e: [
      "`git push --force` makes the remote branch point at your commit even if that drops commits. On a shared branch that rewrites what everyone built on. Branch protection blocks force-pushes and deletion by default; on your own feature branch, `--force-with-lease` is the careful form.",
      "`git push --force` fait pointer la branche distante sur ton commit même si cela abandonne des commits. Sur une branche partagée, cela réécrit ce sur quoi tout le monde a construit. La protection de branche bloque par défaut force-push et suppression ; sur ta propre branche, `--force-with-lease` est la forme prudente.",
      "`git push --force` hace que la rama remota apunte a tu commit aunque eso abandone commits. En una rama compartida, reescribe aquello sobre lo que todos construyeron. La protección de rama bloquea por defecto force-push y borrado; en tu propia rama, `--force-with-lease` es la forma prudente.",
    ],
  },
];

const actionsBasics: GithubQuestion[] = [
  {
    id: "gh-actions-01",
    q: ["Where must a GitHub Actions workflow file be?", "Où doit se trouver le fichier d'un workflow GitHub Actions ?", "¿Dónde debe estar el archivo de un workflow de GitHub Actions?"],
    a: ["In `.github/workflows/`, as a YAML file", "Dans `.github/workflows/`, en fichier YAML", "En `.github/workflows/`, como archivo YAML"],
    w: [["Anywhere, if it is named `workflow.yml`", "N'importe où, s'il s'appelle `workflow.yml`", "En cualquier sitio, si se llama `workflow.yml`"], ["In the repository's settings, not in a file", "Dans les réglages du dépôt, pas dans un fichier", "En los ajustes del repositorio, no en un archivo"], ["At the root, as `actions.json`", "À la racine, sous le nom `actions.json`", "En la raíz, como `actions.json`"]],
    e: [
      "Every `.yml` or `.yaml` file in `.github/workflows/` of the repository is a workflow. Being in the repository means it is versioned and reviewed like code, and a pull request can change the workflow it runs, within limits for forks.",
      "Chaque fichier `.yml` ou `.yaml` de `.github/workflows/` du dépôt est un workflow. Être dans le dépôt signifie qu'il est versionné et relu comme le code, et qu'une pull request peut modifier le workflow qu'elle lance, avec des limites pour les forks.",
      "Cada archivo `.yml` o `.yaml` de `.github/workflows/` del repositorio es un workflow. Estar en el repositorio significa que se versiona y revisa como el código, y que una pull request puede cambiar el workflow que lanza, con límites para los forks.",
    ],
  },
  {
    id: "gh-actions-02",
    q: ["In a workflow, how do jobs and steps relate?", "Dans un workflow, quel est le lien entre jobs et étapes (steps) ?", "En un workflow, ¿qué relación hay entre jobs y pasos (steps)?"],
    a: ["Jobs run on separate runners, in parallel by default; the steps of a job run in order on the same runner", "Les jobs tournent sur des runners séparés, en parallèle par défaut ; les étapes d'un job tournent dans l'ordre sur le même runner", "Los jobs corren en runners distintos, en paralelo por defecto; los pasos de un job corren en orden en el mismo runner"],
    w: [["Steps run in parallel, jobs in order", "Les étapes tournent en parallèle, les jobs dans l'ordre", "Los pasos corren en paralelo y los jobs en orden"], ["A job and a step are the same thing", "Un job et une étape sont la même chose", "Un job y un paso son lo mismo"], ["All jobs share one machine and its files", "Tous les jobs partagent une machine et ses fichiers", "Todos los jobs comparten una máquina y sus archivos"]],
    e: [
      "Each job gets a fresh runner (for example `ubuntu-latest`), so files do not pass between jobs unless you use artifacts or a cache. Within a job, steps share the workspace and run one after the other; a failing step stops the job. `needs:` orders jobs.",
      "Chaque job reçoit un runner neuf (par exemple `ubuntu-latest`), donc les fichiers ne passent pas d'un job à l'autre sans artefacts ou cache. Dans un job, les étapes partagent l'espace de travail et s'exécutent l'une après l'autre ; une étape qui échoue arrête le job. `needs:` ordonne les jobs.",
      "Cada job recibe un runner nuevo (por ejemplo `ubuntu-latest`), así que los archivos no pasan de un job a otro sin artefactos o caché. Dentro de un job, los pasos comparten el espacio de trabajo y se ejecutan uno tras otro; un paso que falla detiene el job. `needs:` ordena los jobs.",
    ],
  },
  {
    id: "gh-actions-03",
    q: ["What is the difference between `uses:` and `run:` in a step?", "Quelle est la différence entre `uses:` et `run:` dans une étape ?", "¿Qué diferencia hay entre `uses:` y `run:` en un paso?"],
    a: ["`uses:` runs an action, such as `actions/checkout`; `run:` runs shell commands", "`uses:` lance une action, comme `actions/checkout` ; `run:` lance des commandes shell", "`uses:` ejecuta una acción, como `actions/checkout`; `run:` ejecuta órdenes de shell"],
    w: [["`uses:` installs a package, `run:` starts a server", "`uses:` installe un paquet, `run:` démarre un serveur", "`uses:` instala un paquete y `run:` arranca un servidor"], ["`run:` runs an action, `uses:` runs shell commands", "`run:` lance une action, `uses:` des commandes shell", "`run:` ejecuta una acción y `uses:` órdenes de shell"], ["They are synonyms", "Ce sont des synonymes", "Son sinónimos"]],
    e: [
      "An action is reusable code from a repository (`owner/repo@ref`), the marketplace or a local path, configured with `with:`. `run:` is a script for the runner's shell. Most jobs start with `uses: actions/checkout`, because the runner starts without your code.",
      "Une action est du code réutilisable venant d'un dépôt (`owner/repo@ref`), de la marketplace ou d'un chemin local, configuré par `with:`. `run:` est un script pour le shell du runner. La plupart des jobs commencent par `uses: actions/checkout`, car le runner démarre sans ton code.",
      "Una acción es código reutilizable de un repositorio (`owner/repo@ref`), del marketplace o de una ruta local, configurado con `with:`. `run:` es un script para el shell del runner. La mayoría de los jobs empiezan con `uses: actions/checkout`, porque el runner arranca sin tu código.",
    ],
  },
  {
    id: "gh-actions-04",
    q: ["A workflow has `on: pull_request`. When does it run?", "Un workflow a `on: pull_request`. Quand tourne-t-il ?", "Un workflow tiene `on: pull_request`. ¿Cuándo se ejecuta?"],
    a: ["When a pull request is opened, reopened or gets new commits", "Quand une pull request est ouverte, rouverte ou reçoit de nouveaux commits", "Cuando una pull request se abre, se reabre o recibe commits nuevos"],
    w: [["Only when the pull request is merged", "Seulement quand la pull request est fusionnée", "Solo cuando la pull request se fusiona"], ["On every push to any branch", "À chaque push sur n'importe quelle branche", "En cada push a cualquier rama"], ["Once a day for each open pull request", "Une fois par jour pour chaque pull request ouverte", "Una vez al día por cada pull request abierta"]],
    e: [
      "By default `pull_request` covers the activity types `opened`, `synchronize` (new commits) and `reopened`; `types:` can add others such as `labeled`. It runs on the merge of the pull request with its base, so tests see the result of merging. Merging is a `push` to the base.",
      "Par défaut `pull_request` couvre les types d'activité `opened`, `synchronize` (nouveaux commits) et `reopened` ; `types:` peut en ajouter d'autres comme `labeled`. Il tourne sur la fusion de la pull request avec sa base, donc les tests voient le résultat de la fusion. Fusionner est un `push` sur la base.",
      "Por defecto `pull_request` cubre los tipos de actividad `opened`, `synchronize` (commits nuevos) y `reopened`; `types:` puede añadir otros como `labeled`. Se ejecuta sobre la fusión de la pull request con su base, así que las pruebas ven el resultado de fusionar. Fusionar es un `push` a la base.",
    ],
  },
];

const securityBasics: GithubQuestion[] = [
  {
    id: "gh-security-01",
    q: ["How should a workflow use an API key?", "Comment un workflow doit-il utiliser une clé d'API ?", "¿Cómo debe usar un workflow una clave de API?"],
    a: ["Store it as an encrypted secret and read it as `secrets.API_KEY`", "La stocker comme secret chiffré et la lire avec `secrets.API_KEY`", "Guardarla como secreto cifrado y leerla con `secrets.API_KEY`"],
    w: [["Write it in the workflow file, since the repository is private", "L'écrire dans le fichier du workflow, puisque le dépôt est privé", "Escribirla en el archivo del workflow, ya que el repositorio es privado"], ["Put it in a committed `.env` file", "La mettre dans un fichier `.env` committé", "Ponerla en un archivo `.env` confirmado"], ["Pass it in the branch name", "La passer dans le nom de la branche", "Pasarla en el nombre de la rama"]],
    e: [
      "Secrets are set in the repository, environment or organization settings, encrypted, and given to a job only when it references them. Anything committed stays in the history and in every clone, private or not; a leaked key must be revoked, not just deleted.",
      "Les secrets se définissent dans les réglages du dépôt, d'un environnement ou de l'organisation, chiffrés, et ne sont donnés à un job que s'il y fait référence. Tout ce qui est committé reste dans l'historique et dans chaque clone, privé ou non ; une clé divulguée doit être révoquée, pas seulement supprimée.",
      "Los secretos se definen en los ajustes del repositorio, de un entorno o de la organización, cifrados, y solo se dan a un job que los referencia. Todo lo confirmado se queda en el historial y en cada clon, privado o no; una clave filtrada hay que revocarla, no solo borrarla.",
    ],
  },
  {
    id: "gh-security-02",
    q: ["A step prints a secret with `echo`. What appears in the log?", "Une étape affiche un secret avec `echo`. Qu'apparaît-il dans le journal ?", "Un paso imprime un secreto con `echo`. ¿Qué aparece en el registro?"],
    a: ["`***`: GitHub masks registered secret values in logs", "`***` : GitHub masque dans les journaux les valeurs des secrets enregistrés", "`***`: GitHub enmascara en los registros los valores de los secretos registrados"],
    w: [["The secret in clear text", "Le secret en clair", "El secreto en claro"], ["An error: secrets cannot be printed", "Une erreur : on ne peut pas afficher un secret", "Un error: los secretos no se pueden imprimir"], ["The secret's name instead of its value", "Le nom du secret à la place de sa valeur", "El nombre del secreto en lugar de su valor"]],
    e: [
      "Masking replaces exact matches of secret values in the log. It is a safety net, not a guarantee: a transformed value (base64, split, reversed) is not recognized. Never print secrets, and register derived values with `::add-mask::`.",
      "Le masquage remplace dans le journal les occurrences exactes des valeurs secrètes. C'est un filet de sécurité, pas une garantie : une valeur transformée (base64, découpée, inversée) n'est pas reconnue. N'affiche jamais de secrets, et déclare les valeurs dérivées avec `::add-mask::`.",
      "El enmascaramiento sustituye en el registro las apariciones exactas de los valores secretos. Es una red de seguridad, no una garantía: un valor transformado (base64, troceado, invertido) no se reconoce. No imprimas nunca secretos y registra los valores derivados con `::add-mask::`.",
    ],
  },
  {
    id: "gh-security-03",
    q: ["What is the `GITHUB_TOKEN`?", "Qu'est-ce que le `GITHUB_TOKEN` ?", "¿Qué es el `GITHUB_TOKEN`?"],
    a: ["A token GitHub creates for each workflow run, limited to the repository and expiring when the job ends", "Un jeton que GitHub crée pour chaque exécution de workflow, limité au dépôt et expirant à la fin du job", "Un token que GitHub crea para cada ejecución del workflow, limitado al repositorio y que caduca al terminar el job"],
    w: [["Your personal access token, copied into every workflow", "Ton jeton d'accès personnel, copié dans chaque workflow", "Tu token de acceso personal, copiado en cada workflow"], ["A secret you must create before Actions works", "Un secret à créer avant qu'Actions fonctionne", "Un secreto que hay que crear para que Actions funcione"], ["A token valid for every repository of the organization", "Un jeton valable pour tous les dépôts de l'organisation", "Un token válido para todos los repositorios de la organización"]],
    e: [
      "It lets a workflow call the API for its own repository: comment, upload a release, read packages. Its permissions are set by the `permissions:` key; the safe default is read-only. It needs no setup and leaks are short-lived, unlike a personal access token.",
      "Il permet à un workflow d'appeler l'API pour son propre dépôt : commenter, publier une release, lire des packages. Ses permissions se règlent par la clé `permissions:` ; le défaut prudent est la lecture seule. Il ne demande aucune configuration et une fuite dure peu, contrairement à un jeton d'accès personnel.",
      "Permite a un workflow llamar a la API de su propio repositorio: comentar, publicar una release, leer paquetes. Sus permisos se fijan con la clave `permissions:`; el valor prudente por defecto es solo lectura. No necesita configuración y una fuga dura poco, a diferencia de un token de acceso personal.",
    ],
  },
  {
    id: "gh-security-04",
    q: ["You committed a password by mistake and pushed it. What must you do first?", "Tu as committé un mot de passe par erreur et l'as poussé. Que dois-tu faire en premier ?", "Confirmaste una contraseña por error y la subiste. ¿Qué debes hacer primero?"],
    a: ["Revoke or change the password, because it must be considered public", "Révoquer ou changer le mot de passe, car il doit être considéré comme public", "Revocar o cambiar la contraseña, porque hay que considerarla pública"],
    w: [["Delete the file in a new commit", "Supprimer le fichier dans un nouveau commit", "Borrar el archivo en un commit nuevo"], ["Make the repository private", "Rendre le dépôt privé", "Hacer privado el repositorio"], ["Rename the branch", "Renommer la branche", "Cambiar el nombre de la rama"]],
    e: [
      "A new commit removes the file from the current tree, not from the history; clones, forks and caches keep it, and bots scan public pushes within seconds. Rotate the credential first, then clean the history if needed. Secret scanning with push protection blocks most such pushes up front.",
      "Un nouveau commit retire le fichier de l'arborescence courante, pas de l'historique ; clones, forks et caches le gardent, et des robots scrutent les push publics en quelques secondes. Change d'abord l'identifiant, puis nettoie l'historique si besoin. Le secret scanning avec push protection bloque d'avance la plupart de ces push.",
      "Un commit nuevo quita el archivo del árbol actual, no del historial; clones, forks y cachés lo conservan, y hay robots que vigilan los push públicos en segundos. Cambia primero la credencial y luego limpia el historial si hace falta. El secret scanning con push protection bloquea de antemano la mayoría de esos push.",
    ],
  },
];

const supplyBasics: GithubQuestion[] = [
  {
    id: "gh-supply-01",
    q: ["What is a Dependabot alert?", "Qu'est-ce qu'une alerte Dependabot ?", "¿Qué es una alerta de Dependabot?"],
    a: ["A warning that a dependency of the repository has a known vulnerability", "Un avertissement qu'une dépendance du dépôt a une vulnérabilité connue", "Un aviso de que una dependencia del repositorio tiene una vulnerabilidad conocida"],
    w: [["A notice that a newer version of a dependency exists", "Un avis qu'une version plus récente d'une dépendance existe", "Un aviso de que existe una versión más reciente de una dependencia"], ["A failed test in a pull request", "Un test échoué dans une pull request", "Una prueba fallida en una pull request"], ["A warning that the repository is too large", "Un avertissement que le dépôt est trop gros", "Un aviso de que el repositorio es demasiado grande"]],
    e: [
      "GitHub matches the dependency graph (from manifests and lockfiles) against the GitHub Advisory Database. An alert names the package, the affected range, the severity and the first fixed version. Newer versions without a vulnerability are the job of version updates.",
      "GitHub compare le graphe de dépendances (tiré des manifestes et des lockfiles) à la GitHub Advisory Database. Une alerte nomme le paquet, les versions touchées, la gravité et la première version corrigée. Les versions plus récentes sans vulnérabilité relèvent des mises à jour de version.",
      "GitHub compara el grafo de dependencias (sacado de los manifiestos y lockfiles) con la GitHub Advisory Database. Una alerta indica el paquete, las versiones afectadas, la gravedad y la primera versión corregida. Las versiones más nuevas sin vulnerabilidad son cosa de las actualizaciones de versión.",
    ],
  },
  {
    id: "gh-supply-02",
    q: ["What is the difference between Dependabot security updates and version updates?", "Quelle est la différence entre les mises à jour de sécurité et les mises à jour de version de Dependabot ?", "¿Qué diferencia hay entre las actualizaciones de seguridad y las de versión de Dependabot?"],
    a: ["Security updates open pull requests to fix vulnerable dependencies; version updates keep dependencies current on a schedule", "Les mises à jour de sécurité ouvrent des pull requests pour corriger les dépendances vulnérables ; les mises à jour de version tiennent les dépendances à jour selon un calendrier", "Las de seguridad abren pull requests para corregir dependencias vulnerables; las de versión mantienen las dependencias al día según un calendario"],
    w: [["Security updates are merged automatically, version updates are not", "Les mises à jour de sécurité sont fusionnées automatiquement, pas celles de version", "Las de seguridad se fusionan automáticamente y las de versión no"], ["Version updates need no configuration, security updates need `dependabot.yml`", "Les mises à jour de version ne demandent aucune configuration, celles de sécurité un `dependabot.yml`", "Las de versión no necesitan configuración y las de seguridad requieren `dependabot.yml`"], ["They are the same feature with two names", "C'est la même fonction sous deux noms", "Son la misma función con dos nombres"]],
    e: [
      "Security updates are switched on in the settings and react to alerts. Version updates are configured in `.github/dependabot.yml` (ecosystem, directory, schedule) and propose new releases even without a vulnerability. Neither merges on its own unless you set up auto-merge.",
      "Les mises à jour de sécurité s'activent dans les réglages et réagissent aux alertes. Les mises à jour de version se configurent dans `.github/dependabot.yml` (écosystème, répertoire, calendrier) et proposent les nouvelles versions même sans vulnérabilité. Aucune ne fusionne seule à moins d'avoir mis en place l'auto-merge.",
      "Las de seguridad se activan en los ajustes y reaccionan a las alertas. Las de versión se configuran en `.github/dependabot.yml` (ecosistema, directorio, calendario) y proponen versiones nuevas aunque no haya vulnerabilidad. Ninguna se fusiona sola a menos que configures el auto-merge.",
    ],
  },
  {
    id: "gh-supply-03",
    q: ["Why commit a lockfile such as `package-lock.json`?", "Pourquoi committer un lockfile comme `package-lock.json` ?", "¿Por qué confirmar un lockfile como `package-lock.json`?"],
    a: ["It pins the exact version of every dependency, direct and indirect, so every install gets the same tree", "Il fige la version exacte de chaque dépendance, directe et indirecte, pour que chaque installation obtienne le même arbre", "Fija la versión exacta de cada dependencia, directa e indirecta, para que cada instalación obtenga el mismo árbol"],
    w: [["It makes installs download less", "Il fait télécharger moins de choses aux installations", "Hace que las instalaciones descarguen menos"], ["It stops Dependabot from opening pull requests", "Il empêche Dependabot d'ouvrir des pull requests", "Impide que Dependabot abra pull requests"], ["It encrypts the dependencies", "Il chiffre les dépendances", "Cifra las dependencias"]],
    e: [
      "A manifest allows ranges (`^4.2.0`); without a lockfile, two installs a week apart can differ. The lockfile makes builds reproducible and lets the dependency graph see indirect dependencies, so alerts cover them too. Dependabot updates the lockfile in its pull requests.",
      "Un manifeste autorise des plages (`^4.2.0`) ; sans lockfile, deux installations à une semaine d'écart peuvent différer. Le lockfile rend les builds reproductibles et permet au graphe de dépendances de voir les dépendances indirectes, donc les alertes les couvrent aussi. Dependabot met à jour le lockfile dans ses pull requests.",
      "Un manifiesto admite rangos (`^4.2.0`); sin lockfile, dos instalaciones separadas por una semana pueden diferir. El lockfile hace reproducibles los builds y deja que el grafo de dependencias vea las indirectas, así que las alertas también las cubren. Dependabot actualiza el lockfile en sus pull requests.",
    ],
  },
  {
    id: "gh-supply-04",
    q: ["What does secret scanning look for?", "Que cherche le secret scanning ?", "¿Qué busca el secret scanning?"],
    a: ["Credentials such as API keys and tokens committed to the repository", "Des identifiants comme des clés d'API et des jetons committés dans le dépôt", "Credenciales como claves de API y tokens confirmados en el repositorio"],
    w: [["Vulnerable dependencies", "Des dépendances vulnérables", "Dependencias vulnerables"], ["Bugs in the code, such as SQL injection", "Des bugs dans le code, comme les injections SQL", "Errores en el código, como inyecciones SQL"], ["Large files that should use Git LFS", "De gros fichiers qui devraient utiliser Git LFS", "Archivos grandes que deberían usar Git LFS"]],
    e: [
      "It recognizes the formats of hundreds of providers' credentials in the whole history, and for many of them notifies the provider, which can revoke the key. Vulnerable dependencies are Dependabot's domain, code bugs are code scanning's (CodeQL).",
      "Il reconnaît les formats d'identifiants de centaines de fournisseurs dans tout l'historique, et pour beaucoup prévient le fournisseur, qui peut révoquer la clé. Les dépendances vulnérables relèvent de Dependabot, les bugs du code du code scanning (CodeQL).",
      "Reconoce los formatos de credenciales de cientos de proveedores en todo el historial, y para muchos avisa al proveedor, que puede revocar la clave. Las dependencias vulnerables son cosa de Dependabot; los errores de código, del code scanning (CodeQL).",
    ],
  },
];

export const repos = { reposBasics };
export const issues = { issuesBasics };
export const pulls = { pullsBasics };
export const teams = { teamsBasics };
export const protection = { protectionBasics };
export const actions = { actionsBasics };
export const security = { securityBasics };
export const supply = { supplyBasics };
