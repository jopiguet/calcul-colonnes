/**
 * GitHub, Intermédiaire: remotes and releases, issue forms and Projects,
 * the three merge methods and CODEOWNERS, the common branching models and
 * versioning, required checks and stale reviews, matrices, caches and
 * expressions, job permissions and environments, and dependabot.yml.
 */
import type { LinuxQuestion as GithubQuestion } from "../linux/types";

const reposWork: GithubQuestion[] = [
  {
    id: "gh-repos-11",
    q: ["You cloned your fork. By convention, what are the remotes `origin` and `upstream`?", "Tu as cloné ton fork. Par convention, que sont les remotes `origin` et `upstream` ?", "Clonaste tu fork. Por convención, ¿qué son los remotos `origin` y `upstream`?"],
    a: ["`origin` is your fork, `upstream` the original project you add yourself", "`origin` est ton fork, `upstream` le projet original que tu ajoutes toi-même", "`origin` es tu fork y `upstream` el proyecto original, que añades tú"],
    w: [["`origin` is the original project, `upstream` your fork", "`origin` est le projet original, `upstream` ton fork", "`origin` es el proyecto original y `upstream` tu fork"], ["Both point at the original project", "Les deux pointent vers le projet original", "Los dos apuntan al proyecto original"], ["`upstream` is created by GitHub automatically", "`upstream` est créé automatiquement par GitHub", "GitHub crea `upstream` automáticamente"]],
    e: [
      "`git clone` names the cloned URL `origin`. To follow the original you run `git remote add upstream <url>`, then `git fetch upstream` and merge or rebase `upstream/main` into your branch. You push to `origin` and open pull requests towards upstream.",
      "`git clone` nomme `origin` l'URL clonée. Pour suivre l'original, on lance `git remote add upstream <url>`, puis `git fetch upstream`, et on fusionne ou rebase `upstream/main` dans sa branche. On pousse vers `origin` et on ouvre des pull requests vers upstream.",
      "`git clone` llama `origin` a la URL clonada. Para seguir el original se ejecuta `git remote add upstream <url>`, luego `git fetch upstream`, y se fusiona o se hace rebase de `upstream/main` en la rama. Se sube a `origin` y se abren pull requests hacia upstream.",
    ],
  },
  {
    id: "gh-repos-12",
    q: ["What is the difference between a Git tag and a GitHub release?", "Quelle est la différence entre un tag Git et une release GitHub ?", "¿Qué diferencia hay entre un tag de Git y una release de GitHub?"],
    a: ["A tag names a commit in Git; a release is a GitHub page built on a tag, with notes and downloadable files", "Un tag nomme un commit dans Git ; une release est une page GitHub construite sur un tag, avec des notes et des fichiers téléchargeables", "Un tag nombra un commit en Git; una release es una página de GitHub construida sobre un tag, con notas y archivos descargables"],
    w: [["A tag is a branch that cannot move; a release is a branch that can", "Un tag est une branche qui ne bouge pas ; une release, une branche qui bouge", "Un tag es una rama que no se mueve y una release una que sí"], ["Releases exist in Git, tags only on GitHub", "Les releases existent dans Git, les tags seulement sur GitHub", "Las releases existen en Git y los tags solo en GitHub"], ["They are the same object", "C'est le même objet", "Son el mismo objeto"]],
    e: [
      "`git tag v1.4.0` (better annotated, `-a`) marks a commit and travels with `git push --tags`. A release adds a title, notes (which GitHub can generate from merged pull requests), binaries, and can be marked pre-release or latest. Packages and Actions often trigger on releases.",
      "`git tag v1.4.0` (mieux annoté, `-a`) marque un commit et voyage avec `git push --tags`. Une release ajoute un titre, des notes (que GitHub peut générer à partir des pull requests fusionnées), des binaires, et peut être marquée pré-version ou dernière. Les packages et Actions se déclenchent souvent sur les releases.",
      "`git tag v1.4.0` (mejor anotado, `-a`) marca un commit y viaja con `git push --tags`. Una release añade un título, notas (que GitHub puede generar a partir de las pull requests fusionadas), binarios, y puede marcarse como prelanzamiento o la última. Los paquetes y Actions suelen dispararse con las releases.",
    ],
  },
  {
    id: "gh-repos-13",
    q: ["Your fork is 30 commits behind upstream. What is the simplest way to update its `main` on GitHub?", "Ton fork a 30 commits de retard sur upstream. Quelle est la manière la plus simple de mettre à jour son `main` sur GitHub ?", "Tu fork va 30 commits por detrás de upstream. ¿Cuál es la forma más sencilla de actualizar su `main` en GitHub?"],
    a: ["The Sync fork button, or `gh repo sync`", "Le bouton Sync fork, ou `gh repo sync`", "El botón Sync fork, o `gh repo sync`"],
    w: [["Delete the fork and fork again", "Supprimer le fork et forker à nouveau", "Borrar el fork y volver a hacerlo"], ["Open an issue on upstream", "Ouvrir une issue sur upstream", "Abrir una issue en upstream"], ["Wait: GitHub syncs forks every night", "Attendre : GitHub synchronise les forks chaque nuit", "Esperar: GitHub sincroniza los forks cada noche"]],
    e: [
      "Sync fork merges upstream's branch into your fork's branch on the server; locally you then `git pull`. If your fork's `main` has its own commits, the sync can conflict, which is why contributions belong on feature branches, keeping `main` a clean mirror.",
      "Sync fork fusionne côté serveur la branche d'upstream dans celle de ton fork ; en local, tu fais ensuite `git pull`. Si le `main` de ton fork a ses propres commits, la synchronisation peut entrer en conflit : c'est pourquoi les contributions vont sur des branches dédiées, et `main` reste un miroir propre.",
      "Sync fork fusiona en el servidor la rama de upstream en la de tu fork; en local haces luego `git pull`. Si el `main` de tu fork tiene commits propios, la sincronización puede dar conflicto: por eso las contribuciones van en ramas aparte y `main` se queda como espejo limpio.",
    ],
  },
  {
    id: "gh-repos-14",
    q: ["What does a template repository give?", "Qu'apporte un dépôt modèle (template repository) ?", "¿Qué aporta un repositorio plantilla (template repository)?"],
    a: ["New repositories start with its files and folders, but with a fresh history and no link back", "Les nouveaux dépôts démarrent avec ses fichiers et dossiers, mais avec un historique neuf et sans lien vers lui", "Los repositorios nuevos empiezan con sus archivos y carpetas, pero con un historial nuevo y sin vínculo con él"],
    w: [["A fork that stays in sync with the template", "Un fork qui reste synchronisé avec le modèle", "Un fork que sigue sincronizado con la plantilla"], ["A copy of the template's issues and pull requests", "Une copie des issues et pull requests du modèle", "Una copia de las issues y pull requests de la plantilla"], ["Read-only access to the template for everyone", "Un accès en lecture seule au modèle pour tous", "Acceso de solo lectura a la plantilla para todos"]],
    e: [
      "Mark a repository as a template and Use this template creates a new, independent repository from its default branch (optionally all branches). It suits starter projects: a CI workflow, a `.gitignore`, a licence and a README skeleton, without the template's commits.",
      "Marque un dépôt comme modèle et Use this template crée un dépôt neuf, indépendant, à partir de sa branche par défaut (au choix toutes les branches). Cela convient aux projets de départ : un workflow de CI, un `.gitignore`, une licence et un squelette de README, sans les commits du modèle.",
      "Marca un repositorio como plantilla y Use this template crea un repositorio nuevo e independiente a partir de su rama por defecto (opcionalmente todas las ramas). Va bien para proyectos de inicio: un workflow de CI, un `.gitignore`, una licencia y un esqueleto de README, sin los commits de la plantilla.",
    ],
  },
];

const issuesWork: GithubQuestion[] = [
  {
    id: "gh-issues-11",
    q: ["Where do issue forms live, and what do they add over a Markdown template?", "Où vivent les formulaires d'issue, et qu'apportent-ils de plus qu'un modèle Markdown ?", "¿Dónde viven los formularios de issue y qué aportan frente a una plantilla Markdown?"],
    a: ["In `.github/ISSUE_TEMPLATE/` as YAML files; they give real fields, required ones and dropdowns", "Dans `.github/ISSUE_TEMPLATE/` en fichiers YAML ; ils donnent de vrais champs, des champs obligatoires et des listes", "En `.github/ISSUE_TEMPLATE/` como archivos YAML; dan campos de verdad, obligatorios y desplegables"],
    w: [["In the repository settings; they replace labels", "Dans les réglages du dépôt ; ils remplacent les labels", "En los ajustes del repositorio; sustituyen a las etiquetas"], ["In `README.md`; they add a table of contents", "Dans `README.md` ; ils ajoutent une table des matières", "En `README.md`; añaden un índice"], ["In `.github/workflows/`; they run tests on each issue", "Dans `.github/workflows/` ; ils lancent des tests sur chaque issue", "En `.github/workflows/`; lanzan pruebas en cada issue"]],
    e: [
      "A Markdown template pre-fills a text box that people can erase; a form shows inputs, text areas, dropdowns and checkboxes, can mark fields required, and can add labels and assignees. `config.yml` in the same folder can turn off blank issues and link to Discussions.",
      "Un modèle Markdown pré-remplit une zone de texte que l'on peut effacer ; un formulaire montre des champs, des zones de texte, des listes et des cases à cocher, peut rendre des champs obligatoires et ajouter labels et assignés. `config.yml` dans le même dossier peut désactiver les issues vierges et renvoyer vers Discussions.",
      "Una plantilla Markdown rellena un cuadro de texto que se puede borrar; un formulario muestra campos, áreas de texto, desplegables y casillas, puede hacer obligatorios algunos campos y añadir etiquetas y asignados. `config.yml` en la misma carpeta puede desactivar las issues en blanco y remitir a Discussions.",
    ],
  },
  {
    id: "gh-issues-12",
    q: ["What does a GitHub Project (the current Projects) hold?", "Que contient un GitHub Project (les Projects actuels) ?", "¿Qué contiene un GitHub Project (los Projects actuales)?"],
    a: ["Issues and pull requests from any repositories of the owner, with custom fields and table, board or roadmap views", "Des issues et pull requests de n'importe quels dépôts du propriétaire, avec des champs personnalisés et des vues tableau, board ou roadmap", "Issues y pull requests de cualquier repositorio del propietario, con campos personalizados y vistas de tabla, tablero u hoja de ruta"],
    w: [["Copies of issues, which then evolve separately", "Des copies des issues, qui évoluent ensuite séparément", "Copias de las issues, que luego evolucionan por separado"], ["Only the issues of a single repository", "Seulement les issues d'un seul dépôt", "Solo las issues de un único repositorio"], ["Code and branches, like a second repository", "Du code et des branches, comme un second dépôt", "Código y ramas, como un segundo repositorio"]],
    e: [
      "Items are the real issues and pull requests, shown with extra fields (Status, Priority, Iteration, Estimate). Changing the issue changes the item. Views filter, group and sort; built-in workflows can set Status when an item is added, closed or merged.",
      "Les éléments sont les vraies issues et pull requests, montrées avec des champs en plus (Status, Priority, Iteration, Estimate). Modifier l'issue modifie l'élément. Les vues filtrent, regroupent et trient ; des workflows intégrés peuvent régler Status quand un élément est ajouté, fermé ou fusionné.",
      "Los elementos son las issues y pull requests reales, mostradas con campos adicionales (Status, Priority, Iteration, Estimate). Cambiar la issue cambia el elemento. Las vistas filtran, agrupan y ordenan; unos workflows integrados pueden fijar Status cuando un elemento se añade, se cierra o se fusiona.",
    ],
  },
  {
    id: "gh-issues-13",
    q: ["When should a question go to Discussions rather than to an issue?", "Quand une question doit-elle aller dans Discussions plutôt que dans une issue ?", "¿Cuándo debe ir una pregunta a Discussions en vez de a una issue?"],
    a: ["When it is open-ended, such as a how-to question or an idea, with no concrete work to track yet", "Quand elle est ouverte, comme une question d'usage ou une idée, sans travail concret à suivre encore", "Cuando es abierta, como una duda de uso o una idea, sin trabajo concreto que seguir aún"],
    w: [["When it is urgent", "Quand elle est urgente", "Cuando es urgente"], ["When it reports a security vulnerability", "Quand elle signale une vulnérabilité", "Cuando informa de una vulnerabilidad"], ["Never: Discussions are only for maintainers", "Jamais : Discussions est réservé aux mainteneurs", "Nunca: Discussions es solo para los mantenedores"]],
    e: [
      "Issues are a to-do list: each should end in work done or a decision not to. Discussions host Q&A (with a marked answer), ideas and announcements, keeping the issue list actionable. A discussion can become an issue once there is concrete work, and vice versa.",
      "Les issues sont une liste de tâches : chacune doit finir en travail fait ou en décision de ne pas le faire. Discussions accueille les questions-réponses (avec une réponse marquée), les idées et les annonces, ce qui garde la liste d'issues actionnable. Une discussion peut devenir une issue une fois le travail concret, et inversement.",
      "Las issues son una lista de tareas: cada una debe acabar en trabajo hecho o en la decisión de no hacerlo. Discussions acoge preguntas y respuestas (con una respuesta marcada), ideas y anuncios, y mantiene accionable la lista de issues. Una discusión puede convertirse en issue cuando hay trabajo concreto, y al revés.",
    ],
  },
  {
    id: "gh-issues-14",
    q: ["What is a milestone?", "Qu'est-ce qu'un milestone ?", "¿Qué es un milestone?"],
    a: ["A group of issues and pull requests towards a goal, often a release, with an optional due date and a progress bar", "Un groupe d'issues et de pull requests vers un objectif, souvent une version, avec une échéance facultative et une barre de progression", "Un grupo de issues y pull requests hacia un objetivo, a menudo una versión, con fecha límite opcional y barra de progreso"],
    w: [["A tag on a commit", "Un tag sur un commit", "Un tag en un commit"], ["A label that cannot be removed", "Un label qu'on ne peut pas retirer", "Una etiqueta que no se puede quitar"], ["A protected branch", "Une branche protégée", "Una rama protegida"]],
    e: [
      "Each issue or pull request belongs to at most one milestone, per repository. The milestone page shows open against closed. For planning across repositories or with more fields, Projects with an iteration field have largely taken over that role.",
      "Chaque issue ou pull request appartient au plus à un milestone, par dépôt. La page du milestone montre ouvertes contre fermées. Pour planifier sur plusieurs dépôts ou avec plus de champs, les Projects avec un champ d'itération ont largement repris ce rôle.",
      "Cada issue o pull request pertenece como mucho a un milestone, por repositorio. La página del milestone muestra abiertas frente a cerradas. Para planificar entre repositorios o con más campos, los Projects con un campo de iteración han asumido en gran parte ese papel.",
    ],
  },
];

const pullsWork: GithubQuestion[] = [
  {
    id: "gh-pulls-11",
    q: ["Which merge method turns all of a pull request's commits into one commit on the base branch?", "Quelle méthode de fusion change tous les commits d'une pull request en un seul commit sur la branche de base ?", "¿Qué método de fusión convierte todos los commits de una pull request en uno solo en la rama base?"],
    a: ["Squash and merge", "Squash and merge", "Squash and merge"],
    w: [["Create a merge commit", "Create a merge commit", "Create a merge commit"], ["Rebase and merge", "Rebase and merge", "Rebase and merge"], ["Fast-forward only", "Fast-forward only", "Fast-forward only"]],
    e: [
      "Squash keeps the base history at one commit per pull request, whatever the branch looked like. A merge commit keeps every commit plus a merge commit tying them in. Rebase and merge replays each commit on the base without a merge commit, giving a linear history with the individual commits.",
      "Squash garde dans l'historique de la base un commit par pull request, quelle que soit l'allure de la branche. Un merge commit garde chaque commit plus un commit de fusion qui les rattache. Rebase and merge rejoue chaque commit sur la base sans commit de fusion, d'où un historique linéaire avec les commits individuels.",
      "Squash deja en el historial de la base un commit por pull request, sea cual sea el aspecto de la rama. Un merge commit conserva cada commit más un commit de fusión que los une. Rebase and merge reaplica cada commit sobre la base sin commit de fusión, con un historial lineal y los commits individuales.",
    ],
  },
  {
    id: "gh-pulls-12",
    q: ["What does a `CODEOWNERS` file do?", "Que fait un fichier `CODEOWNERS` ?", "¿Qué hace un archivo `CODEOWNERS`?"],
    a: ["It names who owns which paths; they are requested for review automatically, and can be required to approve", "Il nomme qui possède quels chemins ; ces personnes sont sollicitées automatiquement en revue, et leur approbation peut être exigée", "Indica quién es dueño de qué rutas; se les pide revisión automáticamente y se puede exigir su aprobación"],
    w: [["It gives those people write access to those paths only", "Il donne à ces personnes l'accès en écriture à ces seuls chemins", "Da a esas personas acceso de escritura solo a esas rutas"], ["It lists the authors of each file for the licence", "Il liste les auteurs de chaque fichier pour la licence", "Lista los autores de cada archivo para la licencia"], ["It stops anyone else from opening pull requests", "Il empêche quiconque d'autre d'ouvrir des pull requests", "Impide que nadie más abra pull requests"]],
    e: [
      "Lines such as `/docs/ @acme/writers` map patterns to users or teams. When a pull request touches those paths, the owners are added as reviewers. With branch protection's Require review from Code Owners, their approval becomes mandatory. It never grants permissions; owners need write access.",
      "Des lignes comme `/docs/ @acme/writers` associent des motifs à des utilisateurs ou équipes. Quand une pull request touche ces chemins, les propriétaires sont ajoutés comme relecteurs. Avec Require review from Code Owners de la protection de branche, leur approbation devient obligatoire. Cela ne donne jamais de permissions ; les propriétaires doivent avoir l'accès en écriture.",
      "Líneas como `/docs/ @acme/writers` asocian patrones a usuarios o equipos. Cuando una pull request toca esas rutas, los dueños se añaden como revisores. Con Require review from Code Owners de la protección de rama, su aprobación pasa a ser obligatoria. Nunca da permisos; los dueños necesitan acceso de escritura.",
    ],
  },
  {
    id: "gh-pulls-13",
    q: ["A reviewer writes a suggested change on a line. What can the author do with it?", "Un relecteur écrit une suggestion de modification sur une ligne. Que peut en faire l'auteur ?", "Un revisor escribe un cambio sugerido en una línea. ¿Qué puede hacer el autor con él?"],
    a: ["Commit it from the pull request with one click, alone or in a batch with others", "Le committer depuis la pull request en un clic, seul ou par lot avec d'autres", "Confirmarlo desde la pull request con un clic, solo o en lote con otros"],
    w: [["Only copy it by hand into the code", "Seulement le recopier à la main dans le code", "Solo copiarlo a mano en el código"], ["Nothing until a maintainer accepts it", "Rien tant qu'un mainteneur ne l'a pas accepté", "Nada hasta que un mantenedor lo acepte"], ["Merge it into `main` directly, bypassing the pull request", "Le fusionner directement dans `main`, sans passer par la pull request", "Fusionarlo directamente en `main`, saltándose la pull request"]],
    e: [
      "A suggestion block in a review comment contains replacement lines. The author (or anyone with write access) can apply it, creating a commit on the pull request's branch, credited to both. Batching several suggestions avoids a commit per comment.",
      "Un bloc de suggestion dans un commentaire de revue contient les lignes de remplacement. L'auteur (ou toute personne avec l'accès en écriture) peut l'appliquer, ce qui crée un commit sur la branche de la pull request, crédité aux deux. Grouper plusieurs suggestions évite un commit par commentaire.",
      "Un bloque de sugerencia en un comentario de revisión contiene las líneas de sustitución. El autor (o quien tenga acceso de escritura) puede aplicarla, lo que crea un commit en la rama de la pull request, atribuido a ambos. Agrupar varias sugerencias evita un commit por comentario.",
    ],
  },
  {
    id: "gh-pulls-14",
    q: ["GitHub says This branch has conflicts that must be resolved. What does that mean?", "GitHub dit This branch has conflicts that must be resolved. Qu'est-ce que cela signifie ?", "GitHub dice This branch has conflicts that must be resolved. ¿Qué significa?"],
    a: ["The branch and the base changed the same lines differently, so Git cannot merge them alone", "La branche et la base ont modifié les mêmes lignes différemment, donc Git ne peut pas les fusionner seul", "La rama y la base cambiaron las mismas líneas de forma distinta, así que Git no puede fusionarlas solo"],
    w: [["Two people are editing the pull request at the same time", "Deux personnes modifient la pull request en même temps", "Dos personas editan la pull request a la vez"], ["The tests failed", "Les tests ont échoué", "Las pruebas fallaron"], ["The branch name is already used", "Le nom de la branche est déjà pris", "El nombre de la rama ya está en uso"]],
    e: [
      "Resolve by merging or rebasing the base into the branch, editing the conflicted files to keep the right content, and pushing. Simple conflicts can be fixed in GitHub's editor. Small, short-lived branches conflict less, which is one reason to merge often.",
      "On résout en fusionnant ou en rebasant la base dans la branche, en éditant les fichiers en conflit pour garder le bon contenu, puis en poussant. Les conflits simples se règlent dans l'éditeur de GitHub. Des branches petites et brèves entrent moins en conflit, une raison de fusionner souvent.",
      "Se resuelve fusionando la base en la rama o haciendo rebase sobre ella, editando los archivos en conflicto para quedarse con el contenido correcto y subiendo. Los conflictos sencillos se arreglan en el editor de GitHub. Las ramas pequeñas y breves chocan menos, una razón para fusionar a menudo.",
    ],
  },
];

const teamsWork: GithubQuestion[] = [
  {
    id: "gh-teams-11",
    q: ["What is the GitHub flow?", "Qu'est-ce que le GitHub flow ?", "¿Qué es el GitHub flow?"],
    a: ["Branch from `main`, commit, open a pull request, review and test, merge, deploy: `main` is always deployable", "Brancher depuis `main`, committer, ouvrir une pull request, relire et tester, fusionner, déployer : `main` est toujours déployable", "Crear rama desde `main`, hacer commits, abrir una pull request, revisar y probar, fusionar, desplegar: `main` siempre es desplegable"],
    w: [["Long-lived `develop` and `release` branches beside `main`", "Des branches `develop` et `release` durables à côté de `main`", "Ramas `develop` y `release` duraderas junto a `main`"], ["Everyone commits to `main` and fixes it afterwards", "Tout le monde committe sur `main` et corrige ensuite", "Todos hacen commit en `main` y lo arreglan después"], ["One branch per developer, merged once a month", "Une branche par développeur, fusionnée une fois par mois", "Una rama por desarrollador, fusionada una vez al mes"]],
    e: [
      "The GitHub flow has one long-lived branch and short feature branches. Git flow adds `develop`, release and hotfix branches, suited to software shipped in versions. Trunk-based development pushes the GitHub flow further: very short branches, merged at least daily, unfinished work behind feature flags.",
      "Le GitHub flow a une seule branche durable et de courtes branches de fonctionnalité. Git flow ajoute `develop`, des branches de release et de hotfix, adaptées aux logiciels livrés par versions. Le trunk-based development pousse le GitHub flow plus loin : des branches très courtes, fusionnées au moins chaque jour, le travail inachevé derrière des feature flags.",
      "El GitHub flow tiene una sola rama duradera y ramas cortas de funcionalidad. Git flow añade `develop`, ramas de release y de hotfix, pensadas para software entregado por versiones. El trunk-based development lleva el GitHub flow más lejos: ramas muy cortas, fusionadas al menos a diario, con el trabajo a medias tras feature flags.",
    ],
  },
  {
    id: "gh-teams-12",
    q: ["Under semantic versioning, a release adds a feature without breaking anything. From `2.3.1`, what is the next version?", "En versionnage sémantique, une version ajoute une fonctionnalité sans rien casser. Après `2.3.1`, quelle est la version suivante ?", "Con versionado semántico, una versión añade una función sin romper nada. Tras `2.3.1`, ¿cuál es la siguiente versión?"],
    a: ["`2.4.0`", "`2.4.0`", "`2.4.0`"],
    w: [["`2.3.2`", "`2.3.2`", "`2.3.2`"], ["`3.0.0`", "`3.0.0`", "`3.0.0`"], ["`2.4.1`", "`2.4.1`", "`2.4.1`"]],
    e: [
      "MAJOR.MINOR.PATCH: a breaking change bumps MAJOR, a backward-compatible feature bumps MINOR, a backward-compatible fix bumps PATCH. Bumping one resets those to its right: a new feature after `2.3.1` gives `2.4.0`. Before `1.0.0`, anything may change.",
      "MAJEUR.MINEUR.CORRECTIF : un changement cassant augmente MAJEUR, une fonctionnalité compatible MINEUR, une correction compatible CORRECTIF. Augmenter l'un remet à zéro ceux à sa droite : une fonctionnalité après `2.3.1` donne `2.4.0`. Avant `1.0.0`, tout peut changer.",
      "MAYOR.MENOR.PARCHE: un cambio incompatible sube MAYOR, una función compatible sube MENOR, una corrección compatible sube PARCHE. Subir uno pone a cero los de su derecha: una función tras `2.3.1` da `2.4.0`. Antes de `1.0.0`, todo puede cambiar.",
    ],
  },
  {
    id: "gh-teams-13",
    q: ["Which commit message follows Conventional Commits for a bug fix in the parser?", "Quel message de commit suit Conventional Commits pour une correction de bug dans l'analyseur ?", "¿Qué mensaje de commit sigue Conventional Commits para una corrección en el analizador?"],
    a: ["`fix(parser): handle empty input`", "`fix(parser): handle empty input`", "`fix(parser): handle empty input`"],
    w: [["`Fixed the parser!!`", "`Fixed the parser!!`", "`Fixed the parser!!`"], ["`parser fix - empty input`", "`parser fix - empty input`", "`parser fix - empty input`"], ["`[BUG] parser`", "`[BUG] parser`", "`[BUG] parser`"]],
    e: [
      "The form is `type(scope): description`, with types such as `feat`, `fix`, `docs`, `refactor`, `chore`; a `!` or a `BREAKING CHANGE:` footer marks a breaking change. Tools then derive the next semantic version and the changelog: `fix` gives a patch, `feat` a minor, breaking a major.",
      "La forme est `type(scope): description`, avec des types comme `feat`, `fix`, `docs`, `refactor`, `chore` ; un `!` ou un pied `BREAKING CHANGE:` signale un changement cassant. Des outils en déduisent la version sémantique suivante et le changelog : `fix` donne un correctif, `feat` une mineure, cassant une majeure.",
      "La forma es `type(scope): description`, con tipos como `feat`, `fix`, `docs`, `refactor`, `chore`; un `!` o un pie `BREAKING CHANGE:` marca un cambio incompatible. Hay herramientas que deducen la siguiente versión semántica y el changelog: `fix` da un parche, `feat` una menor, incompatible una mayor.",
    ],
  },
  {
    id: "gh-teams-14",
    q: ["Where should a project tell people how to report a vulnerability privately?", "Où un projet doit-il dire comment signaler une vulnérabilité en privé ?", "¿Dónde debe decir un proyecto cómo informar en privado de una vulnerabilidad?"],
    a: ["In `SECURITY.md`, ideally pointing to private vulnerability reporting", "Dans `SECURITY.md`, idéalement en renvoyant vers le signalement privé de vulnérabilités", "En `SECURITY.md`, idealmente remitiendo al aviso privado de vulnerabilidades"],
    w: [["In a public issue labelled `security`", "Dans une issue publique avec le label `security`", "En una issue pública con la etiqueta `security`"], ["In `CONTRIBUTING.md`, under the coding style", "Dans `CONTRIBUTING.md`, sous le style de code", "En `CONTRIBUTING.md`, bajo el estilo de código"], ["In the commit messages", "Dans les messages de commit", "En los mensajes de commit"]],
    e: [
      "A public issue tells attackers before a fix exists. GitHub shows `SECURITY.md` in the Security tab, and private vulnerability reporting lets researchers open a draft security advisory seen only by maintainers, where the fix can be prepared before disclosure.",
      "Une issue publique prévient les attaquants avant qu'une correction existe. GitHub montre `SECURITY.md` dans l'onglet Security, et le signalement privé permet aux chercheurs d'ouvrir un brouillon d'avis de sécurité vu seulement des mainteneurs, où la correction peut être préparée avant la divulgation.",
      "Una issue pública avisa a los atacantes antes de que exista una corrección. GitHub muestra `SECURITY.md` en la pestaña Security, y el aviso privado permite a los investigadores abrir un borrador de aviso de seguridad visible solo para los mantenedores, donde se prepara la corrección antes de divulgarla.",
    ],
  },
];

const protectionWork: GithubQuestion[] = [
  {
    id: "gh-protection-11",
    q: ["What does Require branches to be up to date before merging add to required checks?", "Qu'ajoute Require branches to be up to date before merging aux vérifications exigées ?", "¿Qué añade Require branches to be up to date before merging a las comprobaciones exigidas?"],
    a: ["The branch must contain the latest base commit, so the checks ran on what the merge will produce", "La branche doit contenir le dernier commit de la base, donc les vérifications ont tourné sur ce que la fusion produira", "La rama debe contener el último commit de la base, así que las comprobaciones se ejecutaron sobre lo que producirá la fusión"],
    w: [["The checks must have run in the last 24 hours", "Les vérifications doivent avoir tourné dans les dernières 24 heures", "Las comprobaciones deben haberse ejecutado en las últimas 24 horas"], ["The pull request must be rebased, never merged", "La pull request doit être rebasée, jamais fusionnée", "La pull request debe hacer rebase, nunca fusionarse"], ["Dependencies must be at their latest version", "Les dépendances doivent être à leur dernière version", "Las dependencias deben estar en su última versión"]],
    e: [
      "Two pull requests can each pass alone and break together. Strict mode forces each to include the latest base before merging, which re-runs the checks; on a busy repository it means many rebases. A merge queue gives the same guarantee without the manual updates.",
      "Deux pull requests peuvent chacune passer seules et casser ensemble. Le mode strict oblige chacune à inclure la dernière base avant de fusionner, ce qui relance les vérifications ; sur un dépôt actif, cela fait beaucoup de mises à jour. Une merge queue donne la même garantie sans ces mises à jour manuelles.",
      "Dos pull requests pueden pasar cada una sola y romper juntas. El modo estricto obliga a cada una a incluir la última base antes de fusionar, lo que relanza las comprobaciones; en un repositorio activo supone muchas actualizaciones. Una merge queue da la misma garantía sin esas actualizaciones manuales.",
    ],
  },
  {
    id: "gh-protection-12",
    q: ["What does Dismiss stale pull request approvals when new commits are pushed prevent?", "Qu'empêche Dismiss stale pull request approvals when new commits are pushed ?", "¿Qué impide Dismiss stale pull request approvals when new commits are pushed?"],
    a: ["Merging code nobody approved, pushed after the approval", "De fusionner du code que personne n'a approuvé, poussé après l'approbation", "Fusionar código que nadie aprobó, subido después de la aprobación"],
    w: [["Approvals by people who have left the team", "Les approbations de personnes parties de l'équipe", "Las aprobaciones de personas que dejaron el equipo"], ["Approvals older than a week", "Les approbations de plus d'une semaine", "Las aprobaciones de más de una semana"], ["Reviewers approving their own pull request", "Les relecteurs qui approuvent leur propre pull request", "Que los revisores aprueben su propia pull request"]],
    e: [
      "Without it, an approval stays valid whatever is pushed next, so an approved pull request can gain unreviewed commits. With it, a new commit resets approvals. Require approval of the most recent reviewable push goes further: the last pusher cannot be the one whose approval counts.",
      "Sans cela, une approbation reste valable quoi qu'on pousse ensuite, donc une pull request approuvée peut recevoir des commits non relus. Avec, un nouveau commit annule les approbations. Require approval of the most recent reviewable push va plus loin : celui qui a poussé en dernier ne peut pas être celui dont l'approbation compte.",
      "Sin ella, una aprobación sigue valiendo pase lo que pase después, así que una pull request aprobada puede recibir commits sin revisar. Con ella, un commit nuevo anula las aprobaciones. Require approval of the most recent reviewable push va más allá: quien subió lo último no puede ser quien aprueba.",
    ],
  },
  {
    id: "gh-protection-13",
    q: ["What does Require linear history allow on the protected branch?", "Qu'autorise Require linear history sur la branche protégée ?", "¿Qué permite Require linear history en la rama protegida?"],
    a: ["Only squash merges and rebase merges: no merge commits", "Seulement les fusions squash et rebase : pas de merge commits", "Solo fusiones squash y rebase: nada de merge commits"],
    w: [["Only merge commits", "Seulement les merge commits", "Solo merge commits"], ["One pull request per day", "Une pull request par jour", "Una pull request al día"], ["Commits from one author only", "Des commits d'un seul auteur", "Commits de un solo autor"]],
    e: [
      "A linear history is a straight line of commits, easier to read, bisect and revert. Merge commits create forks and joins in the graph, so the rule forbids them; the repository must allow squash or rebase merging for pull requests to remain mergeable.",
      "Un historique linéaire est une ligne droite de commits, plus facile à lire, à bissecter et à annuler. Les merge commits créent des embranchements dans le graphe, donc la règle les interdit ; le dépôt doit autoriser la fusion squash ou rebase pour que les pull requests restent fusionnables.",
      "Un historial lineal es una línea recta de commits, más fácil de leer, de recorrer con bisect y de revertir. Los merge commits crean bifurcaciones en el grafo, así que la regla los prohíbe; el repositorio debe permitir la fusión squash o rebase para que las pull requests sigan siendo fusionables.",
    ],
  },
  {
    id: "gh-protection-14",
    q: ["Require review from Code Owners is on. A pull request touches `/infra/`, owned by `@acme/platform`. What does the merge need?", "Require review from Code Owners est activé. Une pull request touche `/infra/`, possédé par `@acme/platform`. De quoi a besoin la fusion ?", "Require review from Code Owners está activado. Una pull request toca `/infra/`, cuyo dueño es `@acme/platform`. ¿Qué necesita la fusión?"],
    a: ["An approval from a member of `@acme/platform`, besides the other rules", "Une approbation d'un membre de `@acme/platform`, en plus des autres règles", "Una aprobación de un miembro de `@acme/platform`, además de las demás reglas"],
    w: [["An approval from every member of `@acme/platform`", "Une approbation de chaque membre de `@acme/platform`", "Una aprobación de cada miembro de `@acme/platform`"], ["Nothing more: code owners are only notified", "Rien de plus : les code owners sont seulement notifiés", "Nada más: a los code owners solo se les notifica"], ["An administrator's approval", "L'approbation d'un administrateur", "La aprobación de un administrador"]],
    e: [
      "For each owned path the pull request changes, one approval from one of its owners is required; a team counts as owner through any member. If the pull request touches paths of several owners, each set needs one approval. The team must have write access for its approval to count.",
      "Pour chaque chemin possédé que la pull request modifie, une approbation d'un de ses propriétaires est exigée ; une équipe compte comme propriétaire par n'importe quel membre. Si la pull request touche des chemins de plusieurs propriétaires, chacun doit approuver une fois. L'équipe doit avoir l'accès en écriture pour que son approbation compte.",
      "Por cada ruta con dueño que cambia la pull request se exige una aprobación de uno de sus dueños; un equipo cuenta como dueño a través de cualquier miembro. Si la pull request toca rutas de varios dueños, cada uno debe aprobar una vez. El equipo necesita acceso de escritura para que cuente su aprobación.",
    ],
  },
];

const actionsWork: GithubQuestion[] = [
  {
    id: "gh-actions-11",
    q: ["A job has `strategy.matrix` with `node: [20, 22]` and `os: [ubuntu-latest, windows-latest]`. How many jobs run?", "Un job a `strategy.matrix` avec `node: [20, 22]` et `os: [ubuntu-latest, windows-latest]`. Combien de jobs tournent ?", "Un job tiene `strategy.matrix` con `node: [20, 22]` y `os: [ubuntu-latest, windows-latest]`. ¿Cuántos jobs se ejecutan?"],
    a: ["4: one per combination", "4 : un par combinaison", "4: uno por combinación"],
    w: [["2: one per Node version", "2 : un par version de Node", "2: uno por versión de Node"], ["1: the matrix runs inside one job", "1 : la matrice tourne dans un seul job", "1: la matriz corre dentro de un solo job"], ["8: each value doubles the jobs", "8 : chaque valeur double les jobs", "8: cada valor duplica los jobs"]],
    e: [
      "The matrix is the Cartesian product of its variables: 2 × 2 = 4 jobs, each reading `matrix.node` and `matrix.os`. `include` adds or extends combinations, `exclude` removes some. By default, one failure cancels the others (`fail-fast: true`).",
      "La matrice est le produit cartésien de ses variables : 2 × 2 = 4 jobs, chacun lisant `matrix.node` et `matrix.os`. `include` ajoute ou complète des combinaisons, `exclude` en retire. Par défaut, un échec annule les autres (`fail-fast: true`).",
      "La matriz es el producto cartesiano de sus variables: 2 × 2 = 4 jobs, cada uno leyendo `matrix.node` y `matrix.os`. `include` añade o completa combinaciones y `exclude` quita algunas. Por defecto, un fallo cancela los demás (`fail-fast: true`).",
    ],
  },
  {
    id: "gh-actions-12",
    q: ["Job `deploy` must wait until job `test` has succeeded. What do you write in `deploy`?", "Le job `deploy` doit attendre que le job `test` ait réussi. Qu'écris-tu dans `deploy` ?", "El job `deploy` debe esperar a que el job `test` haya tenido éxito. ¿Qué escribes en `deploy`?"],
    a: ["`needs: test`", "`needs: test`", "`needs: test`"],
    w: [["`after: test`", "`after: test`", "`after: test`"], ["`depends_on: test`", "`depends_on: test`", "`depends_on: test`"], ["Nothing: jobs run in the order written", "Rien : les jobs tournent dans l'ordre écrit", "Nada: los jobs corren en el orden escrito"]],
    e: [
      "Jobs run in parallel unless `needs:` says otherwise. With `needs: test`, `deploy` starts only after `test` succeeds and is skipped if it fails, unless its `if:` uses `always()` or `failure()`. It can also read `needs.test.outputs`.",
      "Les jobs tournent en parallèle sauf si `needs:` dit autre chose. Avec `needs: test`, `deploy` ne démarre qu'après la réussite de `test` et est sauté en cas d'échec, sauf si son `if:` utilise `always()` ou `failure()`. Il peut aussi lire `needs.test.outputs`.",
      "Los jobs corren en paralelo salvo que `needs:` diga otra cosa. Con `needs: test`, `deploy` solo empieza cuando `test` tiene éxito y se omite si falla, salvo que su `if:` use `always()` o `failure()`. También puede leer `needs.test.outputs`.",
    ],
  },
  {
    id: "gh-actions-13",
    q: ["What is the difference between an artifact and a cache in Actions?", "Quelle est la différence entre un artefact et un cache dans Actions ?", "¿Qué diferencia hay entre un artefacto y una caché en Actions?"],
    a: ["An artifact keeps a run's output to download or pass to other jobs; a cache reuses inputs such as dependencies between runs", "Un artefact garde le résultat d'une exécution pour le télécharger ou le passer à d'autres jobs ; un cache réutilise des entrées comme les dépendances d'une exécution à l'autre", "Un artefacto guarda el resultado de una ejecución para descargarlo o pasarlo a otros jobs; una caché reutiliza entradas como las dependencias entre ejecuciones"],
    w: [["They are the same storage with two names", "C'est le même stockage sous deux noms", "Son el mismo almacenamiento con dos nombres"], ["A cache is kept forever, an artifact for one hour", "Un cache est gardé pour toujours, un artefact une heure", "Una caché se guarda para siempre y un artefacto una hora"], ["Artifacts are for secrets, caches for logs", "Les artefacts sont pour les secrets, les caches pour les journaux", "Los artefactos son para secretos y las cachés para registros"]],
    e: [
      "`actions/upload-artifact` stores files of a run (a build, a report) for a retention period (90 days by default); another job downloads them. `actions/cache` restores files by a key, typically the hash of a lockfile, and a miss must still work: a cache only saves time.",
      "`actions/upload-artifact` stocke des fichiers d'une exécution (un build, un rapport) pour une durée de rétention (90 jours par défaut) ; un autre job les télécharge. `actions/cache` restaure des fichiers selon une clé, souvent le hash d'un lockfile, et l'absence de cache doit quand même fonctionner : un cache ne fait que gagner du temps.",
      "`actions/upload-artifact` guarda archivos de una ejecución (un build, un informe) durante un periodo de retención (90 días por defecto); otro job los descarga. `actions/cache` restaura archivos según una clave, a menudo el hash de un lockfile, y si no hay caché tiene que funcionar igual: la caché solo ahorra tiempo.",
    ],
  },
  {
    id: "gh-actions-14",
    q: ["A workflow has `on: schedule` with `cron: '0 6 * * 1'`. When does it run?", "Un workflow a `on: schedule` avec `cron: '0 6 * * 1'`. Quand tourne-t-il ?", "Un workflow tiene `on: schedule` con `cron: '0 6 * * 1'`. ¿Cuándo se ejecuta?"],
    a: ["Mondays at 06:00 UTC, on the default branch, possibly a little late", "Le lundi à 06:00 UTC, sur la branche par défaut, parfois avec un peu de retard", "Los lunes a las 06:00 UTC, en la rama por defecto, a veces con algo de retraso"],
    w: [["Mondays at 06:00 in the repository owner's time zone", "Le lundi à 06:00 dans le fuseau du propriétaire du dépôt", "Los lunes a las 06:00 en la zona horaria del dueño del repositorio"], ["On the 6th of every month", "Le 6 de chaque mois", "El día 6 de cada mes"], ["Every 6 minutes on Mondays", "Toutes les 6 minutes le lundi", "Cada 6 minutos los lunes"]],
    e: [
      "The five fields are minute, hour, day of month, month, day of week; times are in UTC, and the workflow file of the default branch is the one that runs. Runs can be delayed at busy times, so avoid the top of the hour for anything urgent.",
      "Les cinq champs sont minute, heure, jour du mois, mois, jour de la semaine ; les heures sont en UTC, et c'est le fichier de workflow de la branche par défaut qui tourne. Les exécutions peuvent être retardées aux heures chargées, donc évite l'heure pile pour l'urgent.",
      "Los cinco campos son minuto, hora, día del mes, mes y día de la semana; las horas van en UTC y se ejecuta el archivo de workflow de la rama por defecto. Las ejecuciones pueden retrasarse en horas de mucha carga, así que evita la hora en punto para lo urgente.",
    ],
  },
];

const securityWork: GithubQuestion[] = [
  {
    id: "gh-security-11",
    q: ["Why set `permissions: contents: read` at the top of a workflow?", "Pourquoi mettre `permissions: contents: read` en tête d'un workflow ?", "¿Por qué poner `permissions: contents: read` al principio de un workflow?"],
    a: ["So that the `GITHUB_TOKEN` can only read the code, and a compromised step cannot push or publish", "Pour que le `GITHUB_TOKEN` ne puisse que lire le code, et qu'une étape compromise ne puisse ni pousser ni publier", "Para que el `GITHUB_TOKEN` solo pueda leer el código y un paso comprometido no pueda subir ni publicar"],
    w: [["To make the checkout faster", "Pour rendre le checkout plus rapide", "Para que el checkout sea más rápido"], ["Because the workflow fails without it", "Parce que le workflow échoue sans", "Porque el workflow falla sin ello"], ["To hide the repository's code from the logs", "Pour cacher le code du dépôt dans les journaux", "Para ocultar el código del repositorio en los registros"]],
    e: [
      "Once `permissions:` is set, every scope not listed is `none`. Grant more only to the job that needs it, such as `pull-requests: write` for a commenting job or `id-token: write` for OIDC. Organizations can also make read-only the default for all repositories.",
      "Dès que `permissions:` est défini, chaque portée non listée vaut `none`. N'accorde plus qu'au job qui en a besoin, comme `pull-requests: write` pour un job qui commente ou `id-token: write` pour OIDC. Les organisations peuvent aussi rendre la lecture seule par défaut pour tous les dépôts.",
      "En cuanto se define `permissions:`, cada ámbito no listado vale `none`. Da más solo al job que lo necesita, como `pull-requests: write` para un job que comenta o `id-token: write` para OIDC. Las organizaciones también pueden hacer que solo lectura sea el valor por defecto en todos los repositorios.",
    ],
  },
  {
    id: "gh-security-12",
    q: ["A pull request comes from a fork. Does its `pull_request` workflow get the repository's secrets?", "Une pull request vient d'un fork. Son workflow `pull_request` reçoit-il les secrets du dépôt ?", "Una pull request viene de un fork. ¿Recibe su workflow `pull_request` los secretos del repositorio?"],
    a: ["No: secrets are withheld and the token is read-only", "Non : les secrets sont retenus et le jeton est en lecture seule", "No: los secretos se retienen y el token es de solo lectura"],
    w: [["Yes, all of them", "Oui, tous", "Sí, todos"], ["Only the secrets whose name starts with `PUBLIC_`", "Seulement les secrets dont le nom commence par `PUBLIC_`", "Solo los secretos cuyo nombre empieza por `PUBLIC_`"], ["Yes, once the pull request is approved", "Oui, une fois la pull request approuvée", "Sí, una vez aprobada la pull request"]],
    e: [
      "Anyone can open a pull request from a fork with a modified workflow, so it must not see secrets or write. First-time contributors' runs can also require a maintainer's approval. Tests that need secrets go in a later step after review, never in a workflow running untrusted code with secrets.",
      "N'importe qui peut ouvrir une pull request depuis un fork avec un workflow modifié, donc celui-ci ne doit ni voir les secrets ni écrire. Les exécutions des nouveaux contributeurs peuvent aussi demander l'approbation d'un mainteneur. Les tests qui ont besoin de secrets viennent plus tard, après revue, jamais dans un workflow qui fait tourner du code non fiable avec des secrets.",
      "Cualquiera puede abrir una pull request desde un fork con un workflow modificado, así que este no debe ver los secretos ni escribir. Las ejecuciones de contribuidores nuevos también pueden requerir la aprobación de un mantenedor. Las pruebas que necesitan secretos van después, tras la revisión, nunca en un workflow que ejecute código no fiable con secretos.",
    ],
  },
  {
    id: "gh-security-13",
    q: ["A job uses `environment: production`, which has required reviewers. What happens when it runs?", "Un job utilise `environment: production`, qui a des relecteurs exigés. Que se passe-t-il quand il tourne ?", "Un job usa `environment: production`, que tiene revisores exigidos. ¿Qué pasa cuando se ejecuta?"],
    a: ["It waits for one of them to approve, and only then gets the environment's secrets", "Il attend qu'un d'entre eux approuve, et reçoit seulement alors les secrets de l'environnement", "Espera a que uno de ellos apruebe y solo entonces recibe los secretos del entorno"],
    w: [["It runs at once and notifies the reviewers afterwards", "Il tourne tout de suite et prévient les relecteurs ensuite", "Se ejecuta enseguida y avisa después a los revisores"], ["It fails unless the commit is signed", "Il échoue sauf si le commit est signé", "Falla salvo que el commit esté firmado"], ["It runs only on Mondays", "Il ne tourne que le lundi", "Solo se ejecuta los lunes"]],
    e: [
      "Environments group deployment rules and secrets: required reviewers, a wait timer, allowed branches or tags. The job pauses before it starts; approval releases it with the environment's secrets. That keeps production credentials out of every other job.",
      "Les environnements regroupent règles de déploiement et secrets : relecteurs exigés, délai d'attente, branches ou tags autorisés. Le job se met en pause avant de démarrer ; l'approbation le libère avec les secrets de l'environnement. Les identifiants de production restent ainsi hors de tous les autres jobs.",
      "Los entornos agrupan reglas de despliegue y secretos: revisores exigidos, temporizador, ramas o tags permitidos. El job se pausa antes de empezar; la aprobación lo libera con los secretos del entorno. Así las credenciales de producción quedan fuera de todos los demás jobs.",
    ],
  },
  {
    id: "gh-security-14",
    q: ["Why are workflows triggered by Dependabot given their own secrets?", "Pourquoi les workflows déclenchés par Dependabot reçoivent-ils leurs propres secrets ?", "¿Por qué los workflows disparados por Dependabot reciben sus propios secretos?"],
    a: ["They are treated like fork pull requests: Actions secrets are withheld, and only Dependabot secrets are available", "Ils sont traités comme des pull requests de fork : les secrets d'Actions sont retenus, seuls les secrets Dependabot sont disponibles", "Se tratan como pull requests de fork: los secretos de Actions se retienen y solo están disponibles los secretos de Dependabot"],
    w: [["Dependabot cannot read any secret at all", "Dependabot ne peut lire aucun secret", "Dependabot no puede leer ningún secreto"], ["Dependabot shares the organization owner's secrets", "Dependabot partage les secrets du propriétaire de l'organisation", "Dependabot comparte los secretos del dueño de la organización"], ["To bill Dependabot's minutes separately", "Pour facturer à part les minutes de Dependabot", "Para facturar aparte los minutos de Dependabot"]],
    e: [
      "A dependency update brings code you did not write, so its runs get a read-only token and no Actions secrets. Secrets a Dependabot run really needs, such as a private registry token, are added under Dependabot secrets, which are scoped to those runs.",
      "Une mise à jour de dépendance apporte du code que tu n'as pas écrit, donc ses exécutions reçoivent un jeton en lecture seule et aucun secret d'Actions. Les secrets dont une exécution Dependabot a vraiment besoin, comme le jeton d'un registre privé, s'ajoutent dans les secrets Dependabot, réservés à ces exécutions.",
      "Una actualización de dependencia trae código que no escribiste, así que sus ejecuciones reciben un token de solo lectura y ningún secreto de Actions. Los secretos que de verdad necesita una ejecución de Dependabot, como el token de un registro privado, se añaden en los secretos de Dependabot, reservados a esas ejecuciones.",
    ],
  },
];

const supplyWork: GithubQuestion[] = [
  {
    id: "gh-supply-11",
    q: ["In `dependabot.yml`, what does each entry of `updates:` need at least?", "Dans `dependabot.yml`, de quoi chaque entrée de `updates:` a-t-elle besoin au minimum ?", "En `dependabot.yml`, ¿qué necesita como mínimo cada entrada de `updates:`?"],
    a: ["A `package-ecosystem`, a `directory` and a `schedule.interval`", "Un `package-ecosystem`, un `directory` et un `schedule.interval`", "Un `package-ecosystem`, un `directory` y un `schedule.interval`"],
    w: [["A token and a list of packages", "Un jeton et une liste de paquets", "Un token y una lista de paquetes"], ["Only the name of the lockfile", "Seulement le nom du lockfile", "Solo el nombre del lockfile"], ["A branch name and a label", "Un nom de branche et un label", "Un nombre de rama y una etiqueta"]],
    e: [
      "The file starts with `version: 2`. Each entry says which ecosystem (`npm`, `pip`, `docker`, `github-actions`…), where its manifest is, and how often to check (`daily`, `weekly`, `monthly`). Options such as `groups`, `ignore`, `labels` and `open-pull-requests-limit` refine it.",
      "Le fichier commence par `version: 2`. Chaque entrée dit quel écosystème (`npm`, `pip`, `docker`, `github-actions`…), où est son manifeste, et à quelle fréquence vérifier (`daily`, `weekly`, `monthly`). Des options comme `groups`, `ignore`, `labels` et `open-pull-requests-limit` l'affinent.",
      "El archivo empieza con `version: 2`. Cada entrada indica qué ecosistema (`npm`, `pip`, `docker`, `github-actions`…), dónde está su manifiesto y con qué frecuencia comprobar (`daily`, `weekly`, `monthly`). Opciones como `groups`, `ignore`, `labels` y `open-pull-requests-limit` lo afinan.",
    ],
  },
  {
    id: "gh-supply-12",
    q: ["Dependabot opens fifteen pull requests a week for small updates. Which option reduces the noise?", "Dependabot ouvre quinze pull requests par semaine pour de petites mises à jour. Quelle option réduit le bruit ?", "Dependabot abre quince pull requests a la semana para actualizaciones pequeñas. ¿Qué opción reduce el ruido?"],
    a: ["`groups`, to bundle related updates, for example all minor and patch updates, into one pull request", "`groups`, pour réunir des mises à jour liées, par exemple toutes les mineures et correctives, en une pull request", "`groups`, para reunir actualizaciones relacionadas, por ejemplo todas las menores y de parche, en una pull request"],
    w: [["Turning off the dependency graph", "Désactiver le graphe de dépendances", "Desactivar el grafo de dependencias"], ["Deleting the lockfile", "Supprimer le lockfile", "Borrar el lockfile"], ["`open-pull-requests-limit: 0` for security updates", "`open-pull-requests-limit: 0` pour les mises à jour de sécurité", "`open-pull-requests-limit: 0` para las actualizaciones de seguridad"]],
    e: [
      "A group gathers dependencies by pattern and update type, for example `update-types: [minor, patch]`, into one pull request per schedule. Major updates can stay separate, since they need attention. A weekly schedule also helps; setting the limit to 0 turns version updates off entirely.",
      "Un groupe rassemble des dépendances par motif et type de mise à jour, par exemple `update-types: [minor, patch]`, en une pull request par échéance. Les mises à jour majeures peuvent rester à part, car elles demandent de l'attention. Un calendrier hebdomadaire aide aussi ; mettre la limite à 0 désactive entièrement les mises à jour de version.",
      "Un grupo reúne dependencias por patrón y tipo de actualización, por ejemplo `update-types: [minor, patch]`, en una pull request por periodo. Las actualizaciones mayores pueden quedar aparte, porque requieren atención. Un calendario semanal también ayuda; poner el límite a 0 desactiva del todo las actualizaciones de versión.",
    ],
  },
  {
    id: "gh-supply-13",
    q: ["Why add `package-ecosystem: github-actions` to `dependabot.yml`?", "Pourquoi ajouter `package-ecosystem: github-actions` à `dependabot.yml` ?", "¿Por qué añadir `package-ecosystem: github-actions` a `dependabot.yml`?"],
    a: ["So that the actions used in workflows are updated too, including those pinned to a commit SHA", "Pour que les actions utilisées dans les workflows soient mises à jour aussi, y compris celles épinglées par SHA de commit", "Para que también se actualicen las acciones usadas en los workflows, incluidas las fijadas por SHA de commit"],
    w: [["So that Dependabot can run inside Actions", "Pour que Dependabot puisse tourner dans Actions", "Para que Dependabot pueda ejecutarse dentro de Actions"], ["To allow workflows to install npm packages", "Pour permettre aux workflows d'installer des paquets npm", "Para permitir que los workflows instalen paquetes npm"], ["It is required for any Dependabot configuration", "C'est obligatoire dans toute configuration Dependabot", "Es obligatorio en cualquier configuración de Dependabot"]],
    e: [
      "Actions are dependencies like any other: `uses: actions/checkout@<sha>` stays on that version until updated. With the `github-actions` ecosystem and `directory: /`, Dependabot proposes newer tags or SHAs, keeping the version comment beside the SHA up to date.",
      "Les actions sont des dépendances comme les autres : `uses: actions/checkout@<sha>` reste sur cette version jusqu'à la mise à jour. Avec l'écosystème `github-actions` et `directory: /`, Dependabot propose des tags ou SHA plus récents, en tenant à jour le commentaire de version à côté du SHA.",
      "Las acciones son dependencias como las demás: `uses: actions/checkout@<sha>` se queda en esa versión hasta actualizarla. Con el ecosistema `github-actions` y `directory: /`, Dependabot propone tags o SHA más recientes y mantiene al día el comentario de versión junto al SHA.",
    ],
  },
  {
    id: "gh-supply-14",
    q: ["A vulnerable package is only a development dependency used in tests. How should you treat the alert?", "Un paquet vulnérable n'est qu'une dépendance de développement utilisée dans les tests. Comment traiter l'alerte ?", "Un paquete vulnerable es solo una dependencia de desarrollo usada en las pruebas. ¿Cómo tratar la alerta?"],
    a: ["Judge whether the vulnerable code is reachable; if not, update when convenient or dismiss it with a stated reason", "Juger si le code vulnérable est atteignable ; sinon, mettre à jour quand c'est pratique ou l'écarter avec une raison", "Valorar si el código vulnerable es alcanzable; si no, actualizar cuando convenga o descartarla indicando el motivo"],
    w: [["Always treat it as critical and stop all releases", "Toujours la traiter comme critique et arrêter toutes les versions", "Tratarla siempre como crítica y detener todas las versiones"], ["Delete the test files", "Supprimer les fichiers de test", "Borrar los archivos de prueba"], ["Ignore it: development dependencies can never be exploited", "L'ignorer : les dépendances de développement ne sont jamais exploitables", "Ignorarla: las dependencias de desarrollo nunca son explotables"]],
    e: [
      "Severity scores describe the package, not your use of it. A dev dependency never shipped to users is usually lower risk, though one running in CI with secrets can still matter. Dismissing records a reason (not used, tolerable risk, inaccurate), keeping the triage auditable.",
      "Les scores de gravité décrivent le paquet, pas ton usage. Une dépendance de développement jamais livrée aux utilisateurs présente en général moins de risque, même si une qui tourne dans la CI avec des secrets peut compter. Écarter enregistre une raison (non utilisé, risque tolérable, inexact), ce qui garde le tri vérifiable.",
      "Las puntuaciones de gravedad describen el paquete, no tu uso. Una dependencia de desarrollo que nunca llega a los usuarios suele suponer menos riesgo, aunque una que corre en la CI con secretos puede importar. Descartar registra un motivo (no se usa, riesgo tolerable, inexacto) y deja el triaje auditable.",
    ],
  },
];

export const repos = { reposWork };
export const issues = { issuesWork };
export const pulls = { pullsWork };
export const teams = { teamsWork };
export const protection = { protectionWork };
export const actions = { actionsWork };
export const security = { securityWork };
export const supply = { supplyWork };
