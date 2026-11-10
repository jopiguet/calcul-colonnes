/**
 * GitHub, Expert: Git's objects and rewriting history, the GraphQL API and
 * issue transfers, CODEOWNERS precedence, revert and bisect, enterprise
 * identity, layered rulesets and required workflows, status functions and
 * dynamic matrices, OIDC conditions and dangerous triggers, SBOMs,
 * advisories and Dependabot's cooldown.
 */
import type { LinuxQuestion as GithubQuestion } from "../linux/types";

const reposExpert: GithubQuestion[] = [
  {
    id: "gh-repos-31",
    q: ["A password was committed months ago and pushed. Which sequence actually removes it?", "Un mot de passe a été committé il y a des mois et poussé. Quelle suite d'actions le retire vraiment ?", "Se confirmó y subió una contraseña hace meses. ¿Qué secuencia la elimina de verdad?"],
    a: ["Rotate it, rewrite history with `git filter-repo`, force-push every branch and tag, ask GitHub Support to purge cached views, and have collaborators re-clone", "Le changer, réécrire l'historique avec `git filter-repo`, forcer le push de chaque branche et tag, demander au support GitHub de purger les vues en cache, et faire recloner les collaborateurs", "Cambiarla, reescribir el historial con `git filter-repo`, forzar el push de cada rama y tag, pedir al soporte de GitHub que purgue las vistas en caché y hacer que los colaboradores vuelvan a clonar"],
    w: [["`git revert` of the commit that added it", "`git revert` du commit qui l'a ajouté", "`git revert` del commit que la añadió"], ["Deleting the file and pushing", "Supprimer le fichier et pousser", "Borrar el archivo y subir"], ["Making the repository private for a day", "Rendre le dépôt privé pendant un jour", "Hacer privado el repositorio durante un día"]],
    e: [
      "A revert adds a commit; the secret stays in its parent. Rewriting creates new commit IDs for everything after the bad one, so every clone and fork still holds the old objects, and pull request views may cache them. That is why rotation comes first: history cleaning only limits further exposure.",
      "Un revert ajoute un commit ; le secret reste dans son parent. La réécriture crée de nouveaux identifiants pour tous les commits après le mauvais, donc chaque clone et chaque fork garde les anciens objets, et les vues de pull request peuvent les avoir en cache. C'est pourquoi le changement d'identifiant vient en premier : nettoyer l'historique ne fait que limiter l'exposition future.",
      "Un revert añade un commit; el secreto se queda en su padre. Reescribir crea identificadores nuevos para todos los commits posteriores al malo, así que cada clon y cada fork conserva los objetos antiguos, y las vistas de pull request pueden tenerlos en caché. Por eso cambiar la credencial va primero: limpiar el historial solo limita la exposición futura.",
    ],
  },
  {
    id: "gh-repos-32",
    q: ["What does a commit's ID (its SHA) depend on?", "De quoi dépend l'identifiant d'un commit (son SHA) ?", "¿De qué depende el identificador de un commit (su SHA)?"],
    a: ["Its tree, its parents, its author and committer with dates, and its message", "Son arbre, ses parents, son auteur et son committer avec les dates, et son message", "Su árbol, sus padres, su autor y su committer con las fechas, y su mensaje"],
    w: [["Only the files it changed", "Seulement les fichiers qu'il a modifiés", "Solo los archivos que cambió"], ["A random number chosen at commit time", "Un nombre aléatoire choisi au moment du commit", "Un número aleatorio elegido al hacer commit"], ["The branch it was made on", "La branche sur laquelle il a été fait", "La rama en la que se hizo"]],
    e: [
      "Git is content-addressed: blobs (file contents), trees (directories) and commits are hashed. Because a commit includes its parent's hash, changing anything in an old commit changes every descendant's ID; that is why rebasing and amending produce new commits and published history should not be rewritten. Branches are just names pointing at commits.",
      "Git est adressé par le contenu : blobs (contenu des fichiers), arbres (répertoires) et commits sont hachés. Comme un commit contient le hash de son parent, changer quoi que ce soit dans un ancien commit change l'identifiant de tous ses descendants ; c'est pourquoi rebase et amend produisent de nouveaux commits et qu'on ne réécrit pas un historique publié. Les branches ne sont que des noms pointant vers des commits.",
      "Git se direcciona por contenido: blobs (contenido de los archivos), árboles (directorios) y commits se hashean. Como un commit incluye el hash de su padre, cambiar cualquier cosa de un commit antiguo cambia el identificador de todos sus descendientes; por eso rebase y amend producen commits nuevos y no se reescribe un historial publicado. Las ramas no son más que nombres que apuntan a commits.",
    ],
  },
  {
    id: "gh-repos-33",
    q: ["A company weighs one monorepo against many repositories. What is a real cost of the monorepo on GitHub?", "Une entreprise hésite entre un monorepo et de nombreux dépôts. Quel est un vrai coût du monorepo sur GitHub ?", "Una empresa duda entre un monorepo y muchos repositorios. ¿Cuál es un coste real del monorepo en GitHub?"],
    a: ["CI must build and test only what changed, and permissions are per repository, so ownership relies on CODEOWNERS and rulesets", "La CI doit construire et tester seulement ce qui a changé, et les permissions sont par dépôt, donc la propriété repose sur CODEOWNERS et les rulesets", "La CI debe construir y probar solo lo que cambió, y los permisos son por repositorio, así que la propiedad depende de CODEOWNERS y de los rulesets"],
    w: [["GitHub limits a repository to 100 files", "GitHub limite un dépôt à 100 fichiers", "GitHub limita un repositorio a 100 archivos"], ["A monorepo cannot have pull requests", "Un monorepo ne peut pas avoir de pull requests", "Un monorepo no puede tener pull requests"], ["Cross-project changes become impossible", "Les changements entre projets deviennent impossibles", "Los cambios entre proyectos se vuelven imposibles"]],
    e: [
      "A monorepo makes atomic cross-project changes and shared tooling easy. In exchange, path filters or a build system that knows the dependency graph keep CI fast, and since read and write access cannot be split by folder, review ownership comes from CODEOWNERS and path rules. Many repositories invert these trade-offs.",
      "Un monorepo facilite les changements atomiques entre projets et l'outillage partagé. En échange, des filtres de chemins ou un système de build qui connaît le graphe de dépendances gardent la CI rapide, et comme l'accès en lecture et en écriture ne se découpe pas par dossier, la responsabilité des revues vient de CODEOWNERS et de règles de chemins. De nombreux dépôts inversent ces compromis.",
      "Un monorepo facilita los cambios atómicos entre proyectos y las herramientas compartidas. A cambio, filtros de rutas o un sistema de build que conozca el grafo de dependencias mantienen rápida la CI, y como el acceso de lectura y escritura no se divide por carpetas, la responsabilidad de las revisiones viene de CODEOWNERS y de reglas de rutas. Muchos repositorios invierten estos compromisos.",
    ],
  },
  {
    id: "gh-repos-34",
    q: ["A repository moves from a user to an organization with Transfer ownership. What keeps working?", "Un dépôt passe d'un utilisateur à une organisation par Transfer ownership. Qu'est-ce qui continue de fonctionner ?", "Un repositorio pasa de un usuario a una organización con Transfer ownership. ¿Qué sigue funcionando?"],
    a: ["Issues, pull requests, stars and redirects from the old URL for web and Git, as long as nothing new takes the old name", "Les issues, pull requests, étoiles et les redirections depuis l'ancienne URL pour le web et Git, tant que rien de nouveau ne prend l'ancien nom", "Las issues, pull requests, estrellas y las redirecciones desde la URL antigua para la web y Git, mientras nada nuevo ocupe el nombre antiguo"],
    w: [["Nothing: links break and history is lost", "Rien : les liens cassent et l'historique est perdu", "Nada: los enlaces se rompen y se pierde el historial"], ["Only the code; issues stay with the old owner", "Seulement le code ; les issues restent à l'ancien propriétaire", "Solo el código; las issues se quedan con el antiguo dueño"], ["Everything, and the old name stays reserved forever", "Tout, et l'ancien nom reste réservé pour toujours", "Todo, y el nombre antiguo queda reservado para siempre"]],
    e: [
      "GitHub redirects the old URL, but if someone creates a repository with the old owner and name, the redirect is gone. Update remotes, badges and links anyway. Actions references to the old path (`uses: olduser/action@v1`) are the most fragile, and a retired namespace protects popular actions from takeover.",
      "GitHub redirige l'ancienne URL, mais si quelqu'un crée un dépôt avec l'ancien propriétaire et le même nom, la redirection disparaît. Mets quand même à jour remotes, badges et liens. Les références Actions vers l'ancien chemin (`uses: olduser/action@v1`) sont les plus fragiles, et un espace de noms retiré protège les actions populaires contre la prise de contrôle.",
      "GitHub redirige la URL antigua, pero si alguien crea un repositorio con el antiguo dueño y el mismo nombre, la redirección desaparece. Actualiza igualmente remotos, insignias y enlaces. Las referencias de Actions a la ruta antigua (`uses: olduser/action@v1`) son las más frágiles, y un espacio de nombres retirado protege las acciones populares contra la toma de control.",
    ],
  },
];

const issuesExpert: GithubQuestion[] = [
  {
    id: "gh-issues-31",
    q: ["Why use the GraphQL API rather than REST to update a Project's fields?", "Pourquoi utiliser l'API GraphQL plutôt que REST pour mettre à jour les champs d'un Project ?", "¿Por qué usar la API GraphQL en vez de REST para actualizar los campos de un Project?"],
    a: ["Projects were built on GraphQL first: items and custom fields are reached by node IDs in one query", "Les Projects ont d'abord été construits sur GraphQL : éléments et champs personnalisés s'atteignent par des node IDs en une requête", "Los Projects se construyeron primero sobre GraphQL: elementos y campos personalizados se alcanzan por node IDs en una sola consulta"],
    w: [["GraphQL needs no authentication", "GraphQL ne demande pas d'authentification", "GraphQL no requiere autenticación"], ["REST is read-only on GitHub", "REST est en lecture seule sur GitHub", "REST es de solo lectura en GitHub"], ["GraphQL changes are free of rate limits", "Les changements GraphQL échappent aux limites de débit", "Los cambios GraphQL no tienen límites de uso"]],
    e: [
      "A mutation such as `updateProjectV2ItemFieldValue` takes the project, item and field node IDs; one query fetches only the fields needed across many objects. GraphQL has its own rate limit counted in points by query cost. REST covers much of Projects now, but scripts and the `gh project` commands lean on GraphQL.",
      "Une mutation comme `updateProjectV2ItemFieldValue` prend les node IDs du projet, de l'élément et du champ ; une requête ne récupère que les champs voulus sur de nombreux objets. GraphQL a sa propre limite de débit comptée en points selon le coût de la requête. REST couvre maintenant une bonne part des Projects, mais les scripts et les commandes `gh project` s'appuient sur GraphQL.",
      "Una mutación como `updateProjectV2ItemFieldValue` recibe los node IDs del proyecto, el elemento y el campo; una consulta trae solo los campos necesarios de muchos objetos. GraphQL tiene su propio límite de uso contado en puntos según el coste de la consulta. REST cubre ya buena parte de los Projects, pero los scripts y las órdenes `gh project` se apoyan en GraphQL.",
    ],
  },
  {
    id: "gh-issues-32",
    q: ["An issue was opened in the wrong repository. What does Transfer issue keep?", "Une issue a été ouverte dans le mauvais dépôt. Que garde Transfer issue ?", "Se abrió una issue en el repositorio equivocado. ¿Qué conserva Transfer issue?"],
    a: ["Comments, assignees who have access, and a redirect from the old URL; labels and milestones only if they exist in the target", "Les commentaires, les assignés qui ont accès, et une redirection depuis l'ancienne URL ; labels et milestones seulement s'ils existent dans la cible", "Los comentarios, los asignados que tienen acceso y una redirección desde la URL antigua; etiquetas y milestones solo si existen en el destino"],
    w: [["Only the title; the rest must be copied by hand", "Seulement le titre ; le reste doit être recopié à la main", "Solo el título; el resto hay que copiarlo a mano"], ["Everything, including linked pull requests, which move too", "Tout, y compris les pull requests liées, qui déménagent aussi", "Todo, incluidas las pull requests enlazadas, que también se mueven"], ["Nothing: issues cannot move between repositories", "Rien : les issues ne changent pas de dépôt", "Nada: las issues no pueden cambiar de repositorio"]],
    e: [
      "Transfers work between repositories of the same owner (user or organization) where you have write access, and not from private to public. The issue gets a new number. Pull requests never move; references to them stay as cross-repository links.",
      "Les transferts se font entre dépôts du même propriétaire (utilisateur ou organisation) où l'on a l'accès en écriture, et pas d'un dépôt privé vers un public. L'issue reçoit un nouveau numéro. Les pull requests ne déménagent jamais ; les références restent des liens entre dépôts.",
      "Las transferencias se hacen entre repositorios del mismo dueño (usuario u organización) en los que se tiene acceso de escritura, y no de privado a público. La issue recibe un número nuevo. Las pull requests nunca se mueven; las referencias quedan como enlaces entre repositorios.",
    ],
  },
  {
    id: "gh-issues-33",
    q: ["A Project has an Iteration field of two weeks. What happens to unfinished items when an iteration ends?", "Un Project a un champ Iteration de deux semaines. Que deviennent les éléments inachevés à la fin d'une itération ?", "Un Project tiene un campo Iteration de dos semanas. ¿Qué pasa con los elementos sin terminar al acabar una iteración?"],
    a: ["They keep the past iteration until someone, or a workflow, moves them to the next one", "Ils gardent l'itération passée jusqu'à ce que quelqu'un, ou un workflow, les déplace vers la suivante", "Conservan la iteración pasada hasta que alguien, o un workflow, los mueve a la siguiente"],
    w: [["They are closed automatically", "Ils sont fermés automatiquement", "Se cierran automáticamente"], ["They are deleted from the Project", "Ils sont retirés du Project", "Se quitan del Project"], ["Their Status resets to Todo", "Leur Status revient à Todo", "Su Status vuelve a Todo"]],
    e: [
      "Iterations are dated values of a field; nothing moves on its own when one ends. Moving leftovers deliberately is a planning signal: work that keeps rolling over is too big or not a priority. Views such as `iteration:@current` and `@previous` make the review easy.",
      "Les itérations sont des valeurs datées d'un champ ; rien ne bouge seul quand l'une se termine. Déplacer les restes délibérément est un signal de planification : le travail qui glisse sans cesse est trop gros ou pas prioritaire. Des vues comme `iteration:@current` et `@previous` facilitent la revue.",
      "Las iteraciones son valores con fecha de un campo; nada se mueve solo cuando una termina. Mover lo pendiente deliberadamente es una señal de planificación: el trabajo que se arrastra una y otra vez es demasiado grande o no es prioritario. Vistas como `iteration:@current` y `@previous` facilitan la revisión.",
    ],
  },
  {
    id: "gh-issues-34",
    q: ["A public repository is flooded by spam issues from new accounts. Which temporary measure fits?", "Un dépôt public est inondé d'issues de spam venant de nouveaux comptes. Quelle mesure temporaire convient ?", "Un repositorio público se llena de issues de spam de cuentas nuevas. ¿Qué medida temporal encaja?"],
    a: ["An interaction limit, such as allowing only prior contributors or collaborators to comment and open issues for a set time", "Une limite d'interaction, comme ne laisser que les contributeurs précédents ou les collaborateurs commenter et ouvrir des issues pour une durée donnée", "Un límite de interacción, como permitir solo a contribuidores previos o colaboradores comentar y abrir issues durante un tiempo"],
    w: [["Turning the repository private", "Rendre le dépôt privé", "Hacer privado el repositorio"], ["Deleting all issues", "Supprimer toutes les issues", "Borrar todas las issues"], ["Requiring signed commits", "Exiger des commits signés", "Exigir commits firmados"]],
    e: [
      "Interaction limits (24 hours to 6 months) restrict comments, issues and pull requests to existing users, prior contributors or collaborators, on a repository or a whole organization. Combined with blocking and reporting abuse, they stop a wave without hiding the project.",
      "Les limites d'interaction (de 24 heures à 6 mois) restreignent commentaires, issues et pull requests aux utilisateurs existants, aux contributeurs précédents ou aux collaborateurs, sur un dépôt ou toute une organisation. Avec le blocage et le signalement des abus, elles arrêtent une vague sans cacher le projet.",
      "Los límites de interacción (de 24 horas a 6 meses) restringen comentarios, issues y pull requests a usuarios existentes, contribuidores previos o colaboradores, en un repositorio o toda una organización. Junto con el bloqueo y la denuncia de abusos, detienen una oleada sin ocultar el proyecto.",
    ],
  },
];

const pullsExpert: GithubQuestion[] = [
  {
    id: "gh-pulls-31",
    q: ["`CODEOWNERS` has `*.js @acme/web` and, below it, `/api/ @acme/backend`. Who owns `/api/server.js`?", "`CODEOWNERS` contient `*.js @acme/web` puis, plus bas, `/api/ @acme/backend`. Qui possède `/api/server.js` ?", "`CODEOWNERS` tiene `*.js @acme/web` y, debajo, `/api/ @acme/backend`. ¿Quién es dueño de `/api/server.js`?"],
    a: ["`@acme/backend` only: the last matching line wins", "`@acme/backend` seulement : la dernière ligne qui correspond l'emporte", "Solo `@acme/backend`: gana la última línea que coincide"],
    w: [["`@acme/web` only: the first matching line wins", "`@acme/web` seulement : la première ligne qui correspond l'emporte", "Solo `@acme/web`: gana la primera línea que coincide"], ["Both teams, each needing to approve", "Les deux équipes, chacune devant approuver", "Los dos equipos, cada uno debe aprobar"], ["Nobody: overlapping patterns cancel out", "Personne : les motifs qui se chevauchent s'annulent", "Nadie: los patrones que se solapan se anulan"]],
    e: [
      "For each file, GitHub uses only the last line that matches; earlier matches are ignored, not added. To have both teams own it, put them on one line: `/api/ @acme/backend @acme/web`, and then an approval from either satisfies the rule. Put general patterns first and specific ones after.",
      "Pour chaque fichier, GitHub n'utilise que la dernière ligne qui correspond ; les correspondances précédentes sont ignorées, pas additionnées. Pour que les deux équipes le possèdent, mets-les sur une ligne : `/api/ @acme/backend @acme/web`, et alors l'approbation de l'une ou l'autre satisfait la règle. Mets les motifs généraux d'abord et les précis ensuite.",
      "Para cada archivo, GitHub usa solo la última línea que coincide; las coincidencias anteriores se ignoran, no se suman. Para que ambos equipos sean dueños, ponlos en una línea: `/api/ @acme/backend @acme/web`, y entonces basta la aprobación de cualquiera de los dos. Pon primero los patrones generales y después los concretos.",
    ],
  },
  {
    id: "gh-pulls-32",
    q: ["A squash-merged pull request broke production. What is the quickest safe undo?", "Une pull request fusionnée en squash a cassé la production. Quelle est l'annulation sûre la plus rapide ?", "Una pull request fusionada con squash rompió producción. ¿Cuál es la forma segura más rápida de deshacerla?"],
    a: ["The Revert button, which opens a pull request with a commit undoing the squashed commit", "Le bouton Revert, qui ouvre une pull request avec un commit annulant le commit squash", "El botón Revert, que abre una pull request con un commit que deshace el commit squash"],
    w: [["`git reset --hard` on `main` and a force-push", "`git reset --hard` sur `main` et un force-push", "`git reset --hard` en `main` y un force-push"], ["Deleting the branch of the pull request", "Supprimer la branche de la pull request", "Borrar la rama de la pull request"], ["Closing the pull request again", "Refermer la pull request", "Volver a cerrar la pull request"]],
    e: [
      "Reverting adds history instead of rewriting it, so it goes through the usual review and checks and is safe on a protected branch. A squash merge makes it one commit to revert; a merge commit needs `git revert -m 1`; a rebase merge needs every replayed commit reverted. To redo the change later, revert the revert.",
      "Annuler par revert ajoute de l'historique au lieu de le réécrire, donc passe par la revue et les vérifications habituelles et reste sûr sur une branche protégée. Un merge squash donne un seul commit à annuler ; un merge commit demande `git revert -m 1` ; un merge rebase demande d'annuler chaque commit rejoué. Pour refaire le changement plus tard, on annule le revert.",
      "Revertir añade historial en vez de reescribirlo, así que pasa por la revisión y las comprobaciones habituales y es seguro en una rama protegida. Un merge squash deja un solo commit que revertir; un merge commit requiere `git revert -m 1`; un merge rebase requiere revertir cada commit reaplicado. Para rehacer el cambio más tarde, se revierte el revert.",
    ],
  },
  {
    id: "gh-pulls-33",
    q: ["A bug appeared somewhere in the last 200 commits of `main`. Why does a squash-merge history help `git bisect`?", "Un bug est apparu quelque part dans les 200 derniers commits de `main`. Pourquoi un historique en squash aide-t-il `git bisect` ?", "Un error apareció en algún punto de los últimos 200 commits de `main`. ¿Por qué ayuda a `git bisect` un historial con squash?"],
    a: ["Each commit is a whole pull request that passed the checks, so every step tests a working state and points to one pull request", "Chaque commit est une pull request entière qui a passé les vérifications, donc chaque étape teste un état qui fonctionne et désigne une pull request", "Cada commit es una pull request entera que pasó las comprobaciones, así que cada paso prueba un estado que funciona y señala una pull request"],
    w: [["`git bisect` only works on squashed commits", "`git bisect` ne fonctionne que sur des commits squash", "`git bisect` solo funciona con commits squash"], ["Squashing removes the bug from history", "Le squash retire le bug de l'historique", "El squash quita el error del historial"], ["It makes bisect run on GitHub's servers", "Cela fait tourner bisect sur les serveurs de GitHub", "Hace que bisect corra en los servidores de GitHub"]],
    e: [
      "`git bisect` halves the range at each step: about 8 tests for 200 commits. Intermediate work-in-progress commits that do not build make steps ambiguous (`git bisect skip`). With squash, every commit on `main` built; the trade-off is a coarser answer, a whole pull request rather than one small commit.",
      "`git bisect` coupe l'intervalle en deux à chaque étape : environ 8 tests pour 200 commits. Les commits intermédiaires de travail en cours qui ne compilent pas rendent des étapes ambiguës (`git bisect skip`). Avec le squash, chaque commit de `main` a été construit ; la contrepartie est une réponse plus grossière, une pull request entière plutôt qu'un petit commit.",
      "`git bisect` parte el intervalo por la mitad en cada paso: unas 8 pruebas para 200 commits. Los commits intermedios de trabajo en curso que no compilan vuelven ambiguos algunos pasos (`git bisect skip`). Con squash, cada commit de `main` compiló; la contrapartida es una respuesta más gruesa, una pull request entera en vez de un commit pequeño.",
    ],
  },
  {
    id: "gh-pulls-34",
    q: ["A fix on `main` must also reach the maintained `release/2.x` branch. What is the usual way?", "Une correction sur `main` doit aussi arriver sur la branche maintenue `release/2.x`. Quelle est la manière habituelle ?", "Una corrección en `main` también debe llegar a la rama mantenida `release/2.x`. ¿Cuál es la forma habitual?"],
    a: ["Cherry-pick the fix's commit onto a branch from `release/2.x` and open a backport pull request", "Cherry-picker le commit de la correction sur une branche partant de `release/2.x` et ouvrir une pull request de backport", "Hacer cherry-pick del commit de la corrección en una rama que parte de `release/2.x` y abrir una pull request de backport"],
    w: [["Merge `main` into `release/2.x`", "Fusionner `main` dans `release/2.x`", "Fusionar `main` en `release/2.x`"], ["Rebase `release/2.x` onto `main`", "Rebaser `release/2.x` sur `main`", "Hacer rebase de `release/2.x` sobre `main`"], ["Change the pull request's base after merging", "Changer la base de la pull request après la fusion", "Cambiar la base de la pull request tras fusionar"]],
    e: [
      "Merging or rebasing would bring every new feature of `main` into the release line. `git cherry-pick <sha>` copies just the fix, as a new commit, onto the maintenance branch; conflicts are resolved there. Squash merges make this easy, one commit per fix, and bots can automate backports from a label.",
      "Fusionner ou rebaser amènerait toutes les nouvelles fonctionnalités de `main` dans la ligne de version. `git cherry-pick <sha>` copie seulement la correction, comme nouveau commit, sur la branche de maintenance ; les conflits s'y résolvent. Les merges squash facilitent cela, un commit par correction, et des robots peuvent automatiser les backports à partir d'un label.",
      "Fusionar o hacer rebase traería todas las funciones nuevas de `main` a la línea de versión. `git cherry-pick <sha>` copia solo la corrección, como commit nuevo, en la rama de mantenimiento; los conflictos se resuelven allí. Los merges squash lo facilitan, un commit por corrección, y hay robots que automatizan los backports a partir de una etiqueta.",
    ],
  },
];

const teamsExpert: GithubQuestion[] = [
  {
    id: "gh-teams-31",
    q: ["An enterprise uses SAML single sign-on and SCIM. What does SCIM add?", "Une entreprise utilise le SSO SAML et SCIM. Qu'ajoute SCIM ?", "Una empresa usa SSO SAML y SCIM. ¿Qué añade SCIM?"],
    a: ["The identity provider creates, updates and removes access automatically, so leaving the company removes GitHub access", "Le fournisseur d'identité crée, met à jour et supprime les accès automatiquement, donc quitter l'entreprise retire l'accès à GitHub", "El proveedor de identidad crea, actualiza y retira los accesos automáticamente, así que dejar la empresa quita el acceso a GitHub"],
    w: [["A second password for each user", "Un deuxième mot de passe pour chaque utilisateur", "Una segunda contraseña para cada usuario"], ["Encryption of repositories at rest", "Le chiffrement des dépôts au repos", "El cifrado de los repositorios en reposo"], ["Faster sign-in", "Une connexion plus rapide", "Un inicio de sesión más rápido"]],
    e: [
      "SAML authenticates people through the company's identity provider; SCIM provisions and deprovisions them, and can sync team membership from directory groups. Enterprise Managed Users go further: accounts are created and owned by the identity provider and cannot act outside the enterprise.",
      "SAML authentifie les personnes par le fournisseur d'identité de l'entreprise ; SCIM les provisionne et les déprovisionne, et peut synchroniser l'appartenance aux équipes depuis les groupes de l'annuaire. Les Enterprise Managed Users vont plus loin : les comptes sont créés et possédés par le fournisseur d'identité et ne peuvent pas agir hors de l'entreprise.",
      "SAML autentica a las personas a través del proveedor de identidad de la empresa; SCIM las da de alta y de baja, y puede sincronizar la pertenencia a equipos desde los grupos del directorio. Los Enterprise Managed Users van más allá: las cuentas las crea y posee el proveedor de identidad y no pueden actuar fuera de la empresa.",
    ],
  },
  {
    id: "gh-teams-32",
    q: ["Someone changed a ruleset last week and nobody knows who. Where is it recorded?", "Quelqu'un a modifié un ruleset la semaine dernière et personne ne sait qui. Où est-ce enregistré ?", "Alguien cambió un ruleset la semana pasada y nadie sabe quién. ¿Dónde queda registrado?"],
    a: ["In the organization's audit log, with who, what and when", "Dans le journal d'audit de l'organisation, avec qui, quoi et quand", "En el registro de auditoría de la organización, con quién, qué y cuándo"],
    w: [["In the repository's commit history", "Dans l'historique des commits du dépôt", "En el historial de commits del repositorio"], ["Nowhere: settings changes are not recorded", "Nulle part : les changements de réglages ne sont pas enregistrés", "En ningún sitio: los cambios de ajustes no se registran"], ["In the Actions logs", "Dans les journaux d'Actions", "En los registros de Actions"]],
    e: [
      "The audit log records administrative events (settings, permissions, rulesets, secrets created or deleted, bypasses) with actor and time. Enterprises can stream it to a SIEM for retention and alerts. Settings live outside Git, which is one argument for managing them as code, for example with Terraform's GitHub provider.",
      "Le journal d'audit enregistre les événements d'administration (réglages, permissions, rulesets, secrets créés ou supprimés, contournements) avec l'acteur et l'heure. Les entreprises peuvent le transmettre en continu à un SIEM pour la conservation et les alertes. Les réglages vivent hors de Git, un argument pour les gérer comme du code, par exemple avec le fournisseur GitHub de Terraform.",
      "El registro de auditoría guarda los eventos de administración (ajustes, permisos, rulesets, secretos creados o borrados, omisiones) con el actor y la hora. Las empresas pueden enviarlo en continuo a un SIEM para conservarlo y alertar. Los ajustes viven fuera de Git, un argumento para gestionarlos como código, por ejemplo con el proveedor de GitHub de Terraform.",
    ],
  },
  {
    id: "gh-teams-33",
    q: ["A team ships a mobile app every two weeks whatever is ready. What is that model called, and what does it need?", "Une équipe publie une application mobile toutes les deux semaines, quoi qu'il soit prêt. Comment s'appelle ce modèle, et de quoi a-t-il besoin ?", "Un equipo publica una app móvil cada dos semanas, esté lo que esté listo. ¿Cómo se llama ese modelo y qué necesita?"],
    a: ["A release train: unfinished work must be hidden behind feature flags or kept off the release branch", "Un release train : le travail inachevé doit être caché derrière des feature flags ou tenu hors de la branche de release", "Un release train: el trabajo sin terminar debe ocultarse tras feature flags o mantenerse fuera de la rama de release"],
    w: [["Continuous deployment: every commit goes to users", "Le déploiement continu : chaque commit va aux utilisateurs", "Despliegue continuo: cada commit llega a los usuarios"], ["Git flow: it needs no planning", "Git flow : il ne demande aucune planification", "Git flow: no requiere planificación"], ["A code freeze: nobody may commit for two weeks", "Un gel du code : personne ne committe pendant deux semaines", "Una congelación del código: nadie hace commit durante dos semanas"]],
    e: [
      "The train leaves on schedule; features that miss it take the next one. That needs `main` always releasable: a release branch cut on the date, fixes cherry-picked onto it, and incomplete features merged but switched off. App store review and staged rollouts fit this rhythm.",
      "Le train part à l'heure ; les fonctionnalités qui le ratent prennent le suivant. Il faut donc un `main` toujours publiable : une branche de release coupée à la date, des corrections cherry-pickées dessus, et les fonctionnalités incomplètes fusionnées mais désactivées. La validation des magasins d'applications et les déploiements progressifs s'accordent à ce rythme.",
      "El tren sale a su hora; las funciones que lo pierden toman el siguiente. Hace falta un `main` siempre publicable: una rama de release cortada en la fecha, correcciones con cherry-pick en ella y las funciones incompletas fusionadas pero desactivadas. La revisión de las tiendas de apps y los despliegues escalonados encajan con este ritmo.",
    ],
  },
  {
    id: "gh-teams-34",
    q: ["Why might an organization create a custom repository role?", "Pourquoi une organisation créerait-elle un rôle de dépôt personnalisé ?", "¿Por qué crearía una organización un rol de repositorio personalizado?"],
    a: ["To grant a precise set of permissions, such as Write plus managing webhooks, without the whole of Maintain or Admin", "Pour accorder un ensemble précis de permissions, comme Write plus la gestion des webhooks, sans tout Maintain ou Admin", "Para dar un conjunto preciso de permisos, como Write más gestionar webhooks, sin todo Maintain o Admin"],
    w: [["To let people bypass all rules", "Pour permettre à certains de contourner toutes les règles", "Para dejar que algunos se salten todas las reglas"], ["To create a role below Read", "Pour créer un rôle en dessous de Read", "Para crear un rol por debajo de Read"], ["To give access to repositories of other organizations", "Pour donner accès aux dépôts d'autres organisations", "Para dar acceso a repositorios de otras organizaciones"]],
    e: [
      "A custom role starts from a base role (Read, Triage, Write, Maintain) and adds fine-grained permissions, following least privilege. It is available on GitHub Enterprise. Organization-level roles (security manager, app manager…) do the same for organization-wide duties.",
      "Un rôle personnalisé part d'un rôle de base (Read, Triage, Write, Maintain) et ajoute des permissions fines, selon le moindre privilège. Il est disponible sur GitHub Enterprise. Les rôles d'organisation (security manager, app manager…) font de même pour des tâches à l'échelle de l'organisation.",
      "Un rol personalizado parte de un rol base (Read, Triage, Write, Maintain) y añade permisos detallados, según el mínimo privilegio. Está disponible en GitHub Enterprise. Los roles de organización (security manager, app manager…) hacen lo mismo para tareas de toda la organización.",
    ],
  },
];

const protectionExpert: GithubQuestion[] = [
  {
    id: "gh-protection-31",
    q: ["An organization ruleset requires 1 approval on `main`; the repository's own ruleset requires 2. What applies?", "Un ruleset d'organisation exige 1 approbation sur `main` ; celui du dépôt en exige 2. Qu'est-ce qui s'applique ?", "Un ruleset de organización exige 1 aprobación en `main`; el del repositorio exige 2. ¿Qué se aplica?"],
    a: ["2 approvals: when rulesets overlap, the most restrictive version of each rule applies", "2 approbations : quand des rulesets se superposent, la version la plus restrictive de chaque règle s'applique", "2 aprobaciones: cuando los rulesets se solapan, se aplica la versión más restrictiva de cada regla"],
    w: [["1 approval: the organization's ruleset takes precedence", "1 approbation : le ruleset de l'organisation l'emporte", "1 aprobación: manda el ruleset de la organización"], ["3 approvals: the requirements add up", "3 approbations : les exigences s'additionnent", "3 aprobaciones: los requisitos se suman"], ["Whichever ruleset was created last", "Le ruleset créé en dernier", "El ruleset creado en último lugar"]],
    e: [
      "Rulesets aggregate: every active ruleset targeting the branch applies, and for a rule present in several, the strictest setting wins. Classic branch protection rules aggregate with rulesets too. A repository admin can therefore tighten but never loosen what the organization sets.",
      "Les rulesets s'agrègent : chaque ruleset actif visant la branche s'applique, et pour une règle présente dans plusieurs, le réglage le plus strict l'emporte. Les règles classiques de protection s'agrègent aussi avec les rulesets. Un administrateur de dépôt peut donc durcir mais jamais assouplir ce que l'organisation impose.",
      "Los rulesets se agregan: se aplica cada ruleset activo que apunte a la rama, y para una regla presente en varios gana el ajuste más estricto. Las reglas clásicas de protección también se agregan con los rulesets. Un administrador de repositorio puede, por tanto, endurecer pero nunca relajar lo que fija la organización.",
    ],
  },
  {
    id: "gh-protection-32",
    q: ["A required status check named `test` could be faked by any workflow or app that reports a check called `test`. How do you prevent that?", "Une vérification exigée nommée `test` pourrait être simulée par tout workflow ou application qui rapporte une vérification `test`. Comment l'empêcher ?", "Una comprobación exigida llamada `test` podría falsearla cualquier workflow o app que informe una comprobación `test`. ¿Cómo impedirlo?"],
    a: ["Set the expected source of the check, such as GitHub Actions, so only that app's `test` counts", "Régler la source attendue de la vérification, comme GitHub Actions, pour que seul le `test` de cette application compte", "Fijar el origen esperado de la comprobación, como GitHub Actions, para que solo cuente el `test` de esa app"],
    w: [["Rename the check to something secret", "Renommer la vérification en quelque chose de secret", "Cambiar el nombre de la comprobación por algo secreto"], ["Require two checks named `test`", "Exiger deux vérifications nommées `test`", "Exigir dos comprobaciones llamadas `test`"], ["Nothing: checks are always trustworthy", "Rien : les vérifications sont toujours fiables", "Nada: las comprobaciones siempre son fiables"]],
    e: [
      "Required checks match by name, and someone with write access could add a trivial workflow job of the same name, or an app with checks permission could post a success. Pinning the expected GitHub App closes that. Required workflows in rulesets go further, enforcing a central workflow that the repository cannot edit.",
      "Les vérifications exigées se reconnaissent par leur nom, et quelqu'un avec l'accès en écriture pourrait ajouter un job trivial du même nom, ou une application ayant la permission checks pourrait publier un succès. Fixer l'application GitHub attendue ferme cette porte. Les workflows exigés dans les rulesets vont plus loin, en imposant un workflow central que le dépôt ne peut pas modifier.",
      "Las comprobaciones exigidas se reconocen por su nombre, y alguien con acceso de escritura podría añadir un job trivial con el mismo nombre, o una app con permiso de checks podría publicar un éxito. Fijar la GitHub App esperada cierra esa puerta. Los workflows exigidos en los rulesets van más allá e imponen un workflow central que el repositorio no puede editar.",
    ],
  },
  {
    id: "gh-protection-33",
    q: ["What does a push ruleset (on private and internal repositories) allow that branch rules cannot?", "Que permet un push ruleset (sur les dépôts privés et internes) que les règles de branche ne permettent pas ?", "¿Qué permite un push ruleset (en repositorios privados e internos) que las reglas de rama no permiten?"],
    a: ["Blocking pushes by content, such as file paths, extensions or sizes, on every branch including new ones", "Bloquer des push selon leur contenu, comme les chemins, extensions ou tailles de fichiers, sur toutes les branches, y compris les nouvelles", "Bloquear push según su contenido, como rutas, extensiones o tamaños de archivo, en todas las ramas, incluidas las nuevas"],
    w: [["Limiting how many pushes a person makes per day", "Limiter le nombre de push par personne et par jour", "Limitar cuántos push hace una persona al día"], ["Requiring a review before each push", "Exiger une revue avant chaque push", "Exigir una revisión antes de cada push"], ["Pushing automatically to a backup repository", "Pousser automatiquement vers un dépôt de secours", "Subir automáticamente a un repositorio de respaldo"]],
    e: [
      "Branch rules act when a branch is updated or merged; a push ruleset inspects the commits of any push, so a `.env` file or a 500 MB binary is rejected even on a brand-new branch, before it enters history. It applies to the repository and its whole fork network.",
      "Les règles de branche agissent quand une branche est mise à jour ou fusionnée ; un push ruleset examine les commits de n'importe quel push, donc un fichier `.env` ou un binaire de 500 Mo est refusé même sur une branche toute neuve, avant d'entrer dans l'historique. Il s'applique au dépôt et à tout son réseau de forks.",
      "Las reglas de rama actúan cuando una rama se actualiza o se fusiona; un push ruleset examina los commits de cualquier push, así que un archivo `.env` o un binario de 500 MB se rechaza incluso en una rama nueva, antes de entrar en el historial. Se aplica al repositorio y a toda su red de forks.",
    ],
  },
  {
    id: "gh-protection-34",
    q: ["Production deploys run in a GitHub environment. How can a rule outside GitHub, such as no deploys during an incident, block them?", "Les déploiements en production passent par un environnement GitHub. Comment une règle extérieure à GitHub, comme pas de déploiement pendant un incident, peut-elle les bloquer ?", "Los despliegues a producción pasan por un entorno de GitHub. ¿Cómo puede bloquearlos una regla externa a GitHub, como no desplegar durante un incidente?"],
    a: ["A custom deployment protection rule: a GitHub App the environment calls, which approves or rejects the job", "Une règle de protection de déploiement personnalisée : une application GitHub que l'environnement appelle, et qui approuve ou rejette le job", "Una regla de protección de despliegue personalizada: una GitHub App a la que llama el entorno y que aprueba o rechaza el job"],
    w: [["A branch protection rule on `main`", "Une règle de protection de branche sur `main`", "Una regla de protección de rama en `main`"], ["A label on the pull request", "Un label sur la pull request", "Una etiqueta en la pull request"], ["Disabling Actions for the duration", "Désactiver Actions pendant ce temps", "Desactivar Actions durante ese tiempo"]],
    e: [
      "Besides required reviewers, wait timers and branch filters, an environment can require approval from apps such as monitoring or change-management systems. The job waits until the app responds. It keeps the rule in the system that knows about incidents, with the decision visible on the run.",
      "En plus des relecteurs exigés, des délais et des filtres de branches, un environnement peut exiger l'approbation d'applications comme des systèmes de supervision ou de gestion des changements. Le job attend la réponse de l'application. La règle reste dans le système qui connaît les incidents, et la décision est visible sur l'exécution.",
      "Además de revisores exigidos, temporizadores y filtros de ramas, un entorno puede exigir la aprobación de apps como sistemas de monitorización o de gestión de cambios. El job espera la respuesta de la app. La regla se queda en el sistema que conoce los incidentes, con la decisión visible en la ejecución.",
    ],
  },
];

const actionsExpert: GithubQuestion[] = [
  {
    id: "gh-actions-31",
    q: ["A cleanup step must run even when an earlier step failed, but not when the run was cancelled. Which `if:`?", "Une étape de nettoyage doit tourner même si une étape précédente a échoué, mais pas si l'exécution a été annulée. Quel `if:` ?", "Un paso de limpieza debe ejecutarse aunque un paso anterior haya fallado, pero no si la ejecución se canceló. ¿Qué `if:`?"],
    a: ["`if: success() || failure()`", "`if: success() || failure()`", "`if: success() || failure()`"],
    w: [["`if: always()`", "`if: always()`", "`if: always()`"], ["`if: failure()`", "`if: failure()`", "`if: failure()`"], ["No `if:`: steps always run", "Pas de `if:` : les étapes tournent toujours", "Sin `if:`: los pasos siempre se ejecutan"]],
    e: [
      "A step without `if:` implies `success()`: it is skipped after a failure. `failure()` runs only after a failure, `always()` runs even on cancellation, `cancelled()` only then. `success() || failure()` (equivalently `!cancelled()`) covers both outcomes but respects a cancel.",
      "Une étape sans `if:` sous-entend `success()` : elle est sautée après un échec. `failure()` ne tourne qu'après un échec, `always()` tourne même en cas d'annulation, `cancelled()` seulement alors. `success() || failure()` (ou `!cancelled()`) couvre les deux issues tout en respectant une annulation.",
      "Un paso sin `if:` implica `success()`: se omite tras un fallo. `failure()` solo se ejecuta tras un fallo, `always()` se ejecuta incluso al cancelar, `cancelled()` solo entonces. `success() || failure()` (o `!cancelled()`) cubre ambos resultados pero respeta una cancelación.",
    ],
  },
  {
    id: "gh-actions-32",
    q: ["A release job pushes a tag using the `GITHUB_TOKEN`. A workflow `on: push: tags` does not start. Why?", "Un job de release pousse un tag avec le `GITHUB_TOKEN`. Un workflow `on: push: tags` ne démarre pas. Pourquoi ?", "Un job de release sube un tag con el `GITHUB_TOKEN`. Un workflow `on: push: tags` no arranca. ¿Por qué?"],
    a: ["Events caused by the `GITHUB_TOKEN` do not trigger new workflow runs, to prevent loops; use a GitHub App token or `workflow_dispatch`", "Les événements causés par le `GITHUB_TOKEN` ne déclenchent pas de nouvelles exécutions, pour éviter les boucles ; utilise un jeton d'application GitHub ou `workflow_dispatch`", "Los eventos causados por el `GITHUB_TOKEN` no disparan ejecuciones nuevas, para evitar bucles; usa un token de GitHub App o `workflow_dispatch`"],
    w: [["Tags never trigger workflows", "Les tags ne déclenchent jamais de workflows", "Los tags nunca disparan workflows"], ["The tag must be signed first", "Le tag doit d'abord être signé", "El tag tiene que firmarse primero"], ["Workflows only start on weekdays", "Les workflows ne démarrent qu'en semaine", "Los workflows solo arrancan entre semana"]],
    e: [
      "Pushes, pull requests and other events made with the `GITHUB_TOKEN` are deliberately ignored as triggers, except `workflow_dispatch` and `repository_dispatch`. A token from a GitHub App (via `actions/create-github-app-token`) acts as that app and does trigger workflows, with permissions scoped to the installation.",
      "Les push, pull requests et autres événements faits avec le `GITHUB_TOKEN` sont volontairement ignorés comme déclencheurs, sauf `workflow_dispatch` et `repository_dispatch`. Un jeton d'application GitHub (via `actions/create-github-app-token`) agit au nom de cette application et déclenche bien les workflows, avec des permissions limitées à l'installation.",
      "Los push, pull requests y demás eventos hechos con el `GITHUB_TOKEN` se ignoran a propósito como disparadores, salvo `workflow_dispatch` y `repository_dispatch`. Un token de GitHub App (con `actions/create-github-app-token`) actúa en nombre de esa app y sí dispara workflows, con permisos limitados a la instalación.",
    ],
  },
  {
    id: "gh-actions-33",
    q: ["How can a job run a matrix over the packages a pull request changed, a list known only at run time?", "Comment un job peut-il faire tourner une matrice sur les paquets modifiés par une pull request, une liste connue seulement à l'exécution ?", "¿Cómo puede un job ejecutar una matriz sobre los paquetes que cambió una pull request, una lista conocida solo en tiempo de ejecución?"],
    a: ["A first job outputs a JSON array; the second uses `matrix: package: ${{ fromJSON(needs.changes.outputs.packages) }}`", "Un premier job produit un tableau JSON ; le second utilise `matrix: package: ${{ fromJSON(needs.changes.outputs.packages) }}`", "Un primer job emite un array JSON; el segundo usa `matrix: package: ${{ fromJSON(needs.changes.outputs.packages) }}`"],
    w: [["It cannot: a matrix must be written in the file", "C'est impossible : une matrice doit être écrite dans le fichier", "No puede: una matriz debe escribirse en el archivo"], ["With `matrix: auto`", "Avec `matrix: auto`", "Con `matrix: auto`"], ["By committing the list to the repository first", "En committant d'abord la liste dans le dépôt", "Confirmando antes la lista en el repositorio"]],
    e: [
      "`fromJSON` turns the string output into an array the matrix expands. An empty array makes the matrix job fail, so guard it with `if: needs.changes.outputs.packages != '[]'`. A matrix is limited to 256 jobs per workflow run.",
      "`fromJSON` change la sortie texte en tableau que la matrice développe. Un tableau vide fait échouer le job de matrice, donc protège-le avec `if: needs.changes.outputs.packages != '[]'`. Une matrice est limitée à 256 jobs par exécution de workflow.",
      "`fromJSON` convierte la salida de texto en un array que la matriz expande. Un array vacío hace fallar el job de la matriz, así que protégelo con `if: needs.changes.outputs.packages != '[]'`. Una matriz está limitada a 256 jobs por ejecución de workflow.",
    ],
  },
  {
    id: "gh-actions-34",
    q: ["A public repository has had no activity for 60 days. What happens to its scheduled workflows?", "Un dépôt public n'a eu aucune activité depuis 60 jours. Que deviennent ses workflows planifiés ?", "Un repositorio público no ha tenido actividad en 60 días. ¿Qué pasa con sus workflows programados?"],
    a: ["GitHub disables them; they must be re-enabled by hand", "GitHub les désactive ; il faut les réactiver à la main", "GitHub los desactiva; hay que reactivarlos a mano"],
    w: [["They keep running forever", "Ils continuent de tourner pour toujours", "Siguen ejecutándose para siempre"], ["They run once more and delete themselves", "Ils tournent une dernière fois et se suppriment", "Se ejecutan una última vez y se borran"], ["They switch to running monthly", "Ils passent à une exécution mensuelle", "Pasan a ejecutarse cada mes"]],
    e: [
      "To save resources, scheduled workflows in public repositories are disabled after 60 days without repository activity; maintainers are warned by e-mail. A cron job that keeps something alive therefore fails silently on an abandoned project. Re-enable it from the Actions tab or with `gh workflow enable`.",
      "Pour économiser des ressources, les workflows planifiés des dépôts publics sont désactivés après 60 jours sans activité sur le dépôt ; les mainteneurs sont prévenus par e-mail. Une tâche cron qui maintient quelque chose en vie échoue donc en silence sur un projet abandonné. Réactive-la depuis l'onglet Actions ou avec `gh workflow enable`.",
      "Para ahorrar recursos, los workflows programados de los repositorios públicos se desactivan tras 60 días sin actividad en el repositorio; se avisa a los mantenedores por correo. Una tarea cron que mantiene algo vivo falla, pues, en silencio en un proyecto abandonado. Reactívala desde la pestaña Actions o con `gh workflow enable`.",
    ],
  },
];

const securityExpert: GithubQuestion[] = [
  {
    id: "gh-security-31",
    q: ["A cloud trust condition accepts any token with `repository_owner == 'acme'`. What is wrong?", "Une condition de confiance cloud accepte tout jeton avec `repository_owner == 'acme'`. Qu'est-ce qui ne va pas ?", "Una condición de confianza en la nube acepta cualquier token con `repository_owner == 'acme'`. ¿Qué falla?"],
    a: ["Any workflow in any repository of the organization, on any branch, can deploy; restrict to the repository and environment, for example the `sub` claim", "N'importe quel workflow de n'importe quel dépôt de l'organisation, sur n'importe quelle branche, peut déployer ; restreins au dépôt et à l'environnement, par exemple par le claim `sub`", "Cualquier workflow de cualquier repositorio de la organización, en cualquier rama, puede desplegar; restringe al repositorio y al entorno, por ejemplo con el claim `sub`"],
    w: [["Nothing: the organization name is secret", "Rien : le nom de l'organisation est secret", "Nada: el nombre de la organización es secreto"], ["OIDC tokens cannot carry the owner", "Les jetons OIDC ne peuvent pas porter le propriétaire", "Los tokens OIDC no pueden llevar el dueño"], ["The condition must use the user's e-mail", "La condition doit utiliser l'e-mail de l'utilisateur", "La condición debe usar el correo del usuario"]],
    e: [
      "The token's `sub` looks like `repo:acme/shop:environment:production` or `repo:acme/shop:ref:refs/heads/main`. Matching it, or `repository` plus `environment`, means only that repository's production job gets production credentials, and environment rules (reviewers, branches) then guard the job. Broad conditions turn any repository into a key.",
      "Le `sub` du jeton ressemble à `repo:acme/shop:environment:production` ou `repo:acme/shop:ref:refs/heads/main`. Le faire correspondre, ou `repository` plus `environment`, signifie que seul le job de production de ce dépôt reçoit les identifiants de production, et les règles d'environnement (relecteurs, branches) gardent alors le job. Des conditions larges font de n'importe quel dépôt une clé.",
      "El `sub` del token se parece a `repo:acme/shop:environment:production` o `repo:acme/shop:ref:refs/heads/main`. Hacerlo coincidir, o `repository` más `environment`, significa que solo el job de producción de ese repositorio recibe las credenciales de producción, y las reglas del entorno (revisores, ramas) protegen entonces el job. Las condiciones amplias convierten cualquier repositorio en una llave.",
    ],
  },
  {
    id: "gh-security-32",
    q: ["Why is a `pull_request_target` workflow that checks out and builds the pull request's code dangerous?", "Pourquoi un workflow `pull_request_target` qui récupère et construit le code de la pull request est-il dangereux ?", "¿Por qué es peligroso un workflow `pull_request_target` que descarga y construye el código de la pull request?"],
    a: ["It runs with the base repository's secrets and a write token, so a fork's code runs with them", "Il tourne avec les secrets du dépôt de base et un jeton en écriture, donc le code d'un fork s'exécute avec eux", "Se ejecuta con los secretos del repositorio base y un token de escritura, así que el código de un fork corre con ellos"],
    w: [["It runs on the fork's account and bills the fork", "Il tourne sur le compte du fork et facture le fork", "Corre en la cuenta del fork y se lo factura al fork"], ["It cannot read the base branch", "Il ne peut pas lire la branche de base", "No puede leer la rama base"], ["It never runs for forks", "Il ne tourne jamais pour les forks", "Nunca se ejecuta para forks"]],
    e: [
      "`pull_request_target` uses the workflow from the base branch and is trusted, meant for labelling or commenting without running the contribution. Checking out `github.event.pull_request.head.sha` and running its build scripts hands the secrets to whoever opened the pull request: a pattern known as a pwn request.",
      "`pull_request_target` utilise le workflow de la branche de base et est de confiance, fait pour étiqueter ou commenter sans exécuter la contribution. Récupérer `github.event.pull_request.head.sha` et lancer ses scripts de build donne les secrets à celui qui a ouvert la pull request : un schéma connu sous le nom de pwn request.",
      "`pull_request_target` usa el workflow de la rama base y es de confianza, pensado para etiquetar o comentar sin ejecutar la contribución. Descargar `github.event.pull_request.head.sha` y ejecutar sus scripts de build entrega los secretos a quien abrió la pull request: un patrón conocido como pwn request.",
    ],
  },
  {
    id: "gh-security-33",
    q: ["Why should self-hosted runners not serve public repositories?", "Pourquoi les runners auto-hébergés ne doivent-ils pas servir de dépôts publics ?", "¿Por qué los runners autoalojados no deben atender repositorios públicos?"],
    a: ["A fork's pull request can run arbitrary code on the machine, which may persist and reach the internal network", "La pull request d'un fork peut exécuter du code arbitraire sur la machine, qui peut persister et atteindre le réseau interne", "La pull request de un fork puede ejecutar código arbitrario en la máquina, que puede persistir y alcanzar la red interna"],
    w: [["Public repositories cannot use self-hosted runners at all", "Les dépôts publics ne peuvent pas du tout utiliser de runners auto-hébergés", "Los repositorios públicos no pueden usar runners autoalojados en absoluto"], ["They are slower for public repositories", "Ils sont plus lents pour les dépôts publics", "Son más lentos para repositorios públicos"], ["GitHub bills public repositories double", "GitHub facture les dépôts publics le double", "GitHub factura el doble a los repositorios públicos"]],
    e: [
      "Hosted runners are fresh virtual machines destroyed after each job; a long-lived self-hosted runner keeps files, credentials and processes between jobs, and sits inside your network. If you must, use ephemeral runners (one job each), runner groups limited to private repositories, and no sensitive network access.",
      "Les runners hébergés sont des machines virtuelles neuves détruites après chaque job ; un runner auto-hébergé durable garde fichiers, identifiants et processus d'un job à l'autre, et se trouve dans ton réseau. Si tu dois le faire, utilise des runners éphémères (un job chacun), des groupes de runners limités aux dépôts privés, et aucun accès réseau sensible.",
      "Los runners alojados son máquinas virtuales nuevas que se destruyen tras cada job; un runner autoalojado duradero conserva archivos, credenciales y procesos entre jobs, y está dentro de tu red. Si no hay más remedio, usa runners efímeros (un job cada uno), grupos de runners limitados a repositorios privados y ningún acceso de red sensible.",
    ],
  },
  {
    id: "gh-security-34",
    q: ["Why can the Actions cache be a path for attack between branches?", "Pourquoi le cache d'Actions peut-il être une voie d'attaque entre branches ?", "¿Por qué la caché de Actions puede ser una vía de ataque entre ramas?"],
    a: ["A poisoned cache entry saved by one run can be restored by a more trusted run, so restrict which workflows save caches that release jobs use", "Une entrée de cache empoisonnée sauvée par une exécution peut être restaurée par une exécution plus sensible, donc restreins quels workflows sauvent les caches qu'utilisent les jobs de release", "Una entrada de caché envenenada que guarda una ejecución puede restaurarla otra más sensible, así que restringe qué workflows guardan las cachés que usan los jobs de release"],
    w: [["Caches are encrypted with the branch name", "Les caches sont chiffrés avec le nom de la branche", "Las cachés se cifran con el nombre de la rama"], ["Caches can only be read by administrators", "Seuls les administrateurs peuvent lire les caches", "Solo los administradores pueden leer las cachés"], ["Caches are deleted after each run", "Les caches sont supprimés après chaque exécution", "Las cachés se borran tras cada ejecución"]],
    e: [
      "A run can restore caches from its own branch and from the default branch; caches created on the default branch are visible to all branches. If a low-trust job on the default branch (say, triggered by issue comments) can write a cache, it can plant tampered dependencies that a release build restores. Release builds can skip caches entirely.",
      "Une exécution peut restaurer les caches de sa propre branche et de la branche par défaut ; les caches créés sur la branche par défaut sont visibles de toutes les branches. Si un job peu fiable sur la branche par défaut (déclenché, disons, par des commentaires d'issue) peut écrire un cache, il peut y placer des dépendances trafiquées qu'un build de release restaurera. Les builds de release peuvent se passer entièrement de cache.",
      "Una ejecución puede restaurar las cachés de su propia rama y de la rama por defecto; las cachés creadas en la rama por defecto son visibles para todas las ramas. Si un job poco fiable en la rama por defecto (disparado, por ejemplo, por comentarios de issues) puede escribir una caché, puede plantar dependencias manipuladas que restaurará un build de release. Los builds de release pueden prescindir por completo de la caché.",
    ],
  },
];

const supplyExpert: GithubQuestion[] = [
  {
    id: "gh-supply-31",
    q: ["Dependabot has a `cooldown` option. What is it for?", "Dependabot a une option `cooldown`. À quoi sert-elle ?", "Dependabot tiene una opción `cooldown`. ¿Para qué sirve?"],
    a: ["Waiting a number of days after a release before proposing it, so that a malicious or broken version has time to be caught", "Attendre un certain nombre de jours après une version avant de la proposer, pour qu'une version malveillante ou cassée ait le temps d'être repérée", "Esperar un número de días tras una versión antes de proponerla, para que una versión maliciosa o rota tenga tiempo de detectarse"],
    w: [["Pausing all updates during holidays", "Suspendre toutes les mises à jour pendant les vacances", "Pausar todas las actualizaciones en vacaciones"], ["Limiting Dependabot's CPU use", "Limiter l'usage CPU de Dependabot", "Limitar el uso de CPU de Dependabot"], ["Closing pull requests nobody merged after a week", "Fermer les pull requests que personne n'a fusionnées après une semaine", "Cerrar las pull requests que nadie fusionó tras una semana"]],
    e: [
      "Supply-chain attacks often publish a poisoned version that is pulled within days. `cooldown` (with `default-days` and per-semver settings) delays version updates so the ecosystem notices first. Security updates are not delayed: a known fix should arrive at once.",
      "Les attaques de la chaîne d'approvisionnement publient souvent une version empoisonnée retirée en quelques jours. `cooldown` (avec `default-days` et des réglages par niveau semver) retarde les mises à jour de version pour que l'écosystème remarque d'abord. Les mises à jour de sécurité ne sont pas retardées : une correction connue doit arriver tout de suite.",
      "Los ataques a la cadena de suministro suelen publicar una versión envenenada que se retira en pocos días. `cooldown` (con `default-days` y ajustes por nivel semver) retrasa las actualizaciones de versión para que el ecosistema lo note antes. Las de seguridad no se retrasan: una corrección conocida debe llegar enseguida.",
    ],
  },
  {
    id: "gh-supply-32",
    q: ["A customer asks for a software bill of materials. What can GitHub produce?", "Un client demande une nomenclature logicielle (SBOM). Que peut produire GitHub ?", "Un cliente pide una lista de materiales de software (SBOM). ¿Qué puede producir GitHub?"],
    a: ["An SPDX SBOM exported from the dependency graph, listing packages, versions and licences", "Une SBOM SPDX exportée depuis le graphe de dépendances, listant paquets, versions et licences", "Una SBOM SPDX exportada desde el grafo de dependencias, con paquetes, versiones y licencias"],
    w: [["A list of the repository's contributors", "La liste des contributeurs du dépôt", "La lista de colaboradores del repositorio"], ["A copy of every dependency's source code", "Une copie du code source de chaque dépendance", "Una copia del código fuente de cada dependencia"], ["A certificate that the software has no vulnerabilities", "Un certificat que le logiciel n'a pas de vulnérabilités", "Un certificado de que el software no tiene vulnerabilidades"]],
    e: [
      "The dependency graph's Export SBOM (or the REST API) gives an SPDX JSON document. It reflects manifests and lockfiles; dependencies resolved only at build time can be added by submitting them with the dependency submission API. An SBOM is an inventory, which consumers then match against advisories.",
      "Export SBOM du graphe de dépendances (ou l'API REST) donne un document SPDX en JSON. Il reflète manifestes et lockfiles ; les dépendances résolues seulement au build peuvent être ajoutées par l'API de soumission de dépendances. Une SBOM est un inventaire, que les utilisateurs comparent ensuite aux avis de sécurité.",
      "Export SBOM del grafo de dependencias (o la API REST) da un documento SPDX en JSON. Refleja manifiestos y lockfiles; las dependencias que solo se resuelven en el build se pueden añadir con la API de envío de dependencias. Una SBOM es un inventario, que los usuarios comparan después con los avisos de seguridad.",
    ],
  },
  {
    id: "gh-supply-33",
    q: ["A maintainer fixes a vulnerability reported privately. What does a repository security advisory allow?", "Un mainteneur corrige une vulnérabilité signalée en privé. Que permet un avis de sécurité du dépôt ?", "Un mantenedor corrige una vulnerabilidad notificada en privado. ¿Qué permite un aviso de seguridad del repositorio?"],
    a: ["Working on the fix in a temporary private fork, requesting a CVE, and publishing the advisory so Dependabot alerts users", "Travailler sur la correction dans un fork privé temporaire, demander un CVE, et publier l'avis pour que Dependabot alerte les utilisateurs", "Trabajar en la corrección en un fork privado temporal, pedir un CVE y publicar el aviso para que Dependabot alerte a los usuarios"],
    w: [["Hiding the vulnerable versions from the package registry", "Cacher les versions vulnérables du registre de paquets", "Ocultar las versiones vulnerables del registro de paquetes"], ["Fixing the vulnerability automatically", "Corriger la vulnérabilité automatiquement", "Corregir la vulnerabilidad automáticamente"], ["Notifying only the reporter", "Ne notifier que la personne qui a signalé", "Notificar solo a quien informó"]],
    e: [
      "A draft advisory is private to maintainers and invited collaborators. GitHub is a CVE Numbering Authority and can assign a CVE. Once published and reviewed into the GitHub Advisory Database, Dependabot alerts every repository depending on the affected versions.",
      "Un brouillon d'avis est privé, réservé aux mainteneurs et aux collaborateurs invités. GitHub est une CVE Numbering Authority et peut attribuer un CVE. Une fois publié et relu dans la GitHub Advisory Database, Dependabot alerte chaque dépôt qui dépend des versions touchées.",
      "Un borrador de aviso es privado, solo para los mantenedores y colaboradores invitados. GitHub es una CVE Numbering Authority y puede asignar un CVE. Una vez publicado y revisado en la GitHub Advisory Database, Dependabot alerta a cada repositorio que dependa de las versiones afectadas.",
    ],
  },
  {
    id: "gh-supply-34",
    q: ["Since 2025, how is GitHub Advanced Security sold to organizations on the Team or Enterprise plan?", "Depuis 2025, comment GitHub Advanced Security est-il vendu aux organisations sur les plans Team ou Enterprise ?", "Desde 2025, ¿cómo se vende GitHub Advanced Security a las organizaciones con plan Team o Enterprise?"],
    a: ["As two products: Secret Protection (secret scanning, push protection) and Code Security (code scanning, dependency review, Copilot Autofix)", "En deux produits : Secret Protection (secret scanning, push protection) et Code Security (code scanning, dependency review, Copilot Autofix)", "Como dos productos: Secret Protection (secret scanning, push protection) y Code Security (code scanning, dependency review, Copilot Autofix)"],
    w: [["As one bundle, only on Enterprise", "En un seul paquet, seulement sur Enterprise", "Como un único paquete, solo en Enterprise"], ["Free for every private repository", "Gratuitement pour chaque dépôt privé", "Gratis para cada repositorio privado"], ["Per pull request scanned", "À la pull request analysée", "Por pull request analizada"]],
    e: [
      "GitHub split Advanced Security into Secret Protection and Code Security, available to Team plans as well as Enterprise, billed per active committer. Public repositories get secret scanning, push protection, CodeQL and dependency review free; Dependabot alerts and updates are free everywhere.",
      "GitHub a scindé Advanced Security en Secret Protection et Code Security, disponibles pour les plans Team comme Enterprise, facturés par committer actif. Les dépôts publics ont gratuitement secret scanning, push protection, CodeQL et dependency review ; les alertes et mises à jour Dependabot sont gratuites partout.",
      "GitHub dividió Advanced Security en Secret Protection y Code Security, disponibles para planes Team además de Enterprise, facturados por committer activo. Los repositorios públicos tienen gratis secret scanning, push protection, CodeQL y dependency review; las alertas y actualizaciones de Dependabot son gratuitas en todas partes.",
    ],
  },
];

export const repos = { reposExpert };
export const issues = { issuesExpert };
export const pulls = { pullsExpert };
export const teams = { teamsExpert };
export const protection = { protectionExpert };
export const actions = { actionsExpert };
export const security = { securityExpert };
export const supply = { supplyExpert };
