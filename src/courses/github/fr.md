# GitHub — un cours complet

## Comment utiliser ce cours

Ce cours mène du premier dépôt à la conduite d'une équipe sur GitHub : collaboration, revue, automatisation avec Actions, et sécurité du code et de ses dépendances. Il décrit GitHub tel qu'il fonctionne fin 2026 ; les réglages changent de place dans l'interface de temps en temps, donc le cours nomme les fonctions plutôt que les chemins de menus.

**Pour qui.** Des développeurs qui ont utilisé Git seuls et veulent bien travailler avec d'autres sur GitHub, et des responsables d'équipe qui mettent en place dépôts, règles et pipelines. Git de base (commit, branche, fusion) suffit pour commencer.

**Organisation.** Huit parties en deux blocs :

| Bloc | Parties | Ce que tu sais faire après |
|---|---|---|
| Travailler ensemble | 1 Dépôts · 2 Issues et Projects · 3 Pull requests · 4 Organisations et méthode | Conduire un projet où les changements sont proposés, relus et suivis |
| Automatisation et sécurité | 5 Protection des branches et rulesets · 6 Actions · 7 Sécuriser les workflows · 8 La chaîne d'approvisionnement | Garantir la qualité sur `main`, automatiser tests et déploiements, garder secrets et dépendances sous contrôle |

Chaque partie finit par ce qu'il faut retenir. Les exercices à la fin donnent une tâche par partie, avec les réponses.

**Avec Luma.** Le test *🐙 GitHub* du groupe *Informatique* de Luma suit les mêmes huit parties sur quatre niveaux (Débutant à Expert), avec 128 questions rédigées. Lis une partie, puis passe le test dessus : la revue des erreurs renvoie à la partie qu'il te faut.

**Ce qu'il te faut.** Un compte GitHub, Git installé, et idéalement la CLI GitHub (`gh`). Un dépôt personnel suffit pour les parties 1 à 3 et 5 à 8 ; la partie 4 est plus simple avec une organisation gratuite.

## Partie 1 — Les dépôts

Un dépôt, ce sont les fichiers d'un projet plus tout leur historique. GitHub héberge le dépôt et ajoute tout ce qui l'entoure : issues, pull requests, Actions, fonctions de sécurité et permissions.

### Commits, branches et historique

Un **commit** est un instantané de toute l'arborescence des fichiers, avec un auteur, une date, un message et un lien vers son commit parent. Git identifie chaque commit par un hash (son SHA) calculé sur tout cela, donc changer quoi que ce soit dans un ancien commit change le SHA de tous ses descendants. C'est pourquoi réécrire un historique publié dérange : tous les autres ont encore les anciens commits.

Une **branche** n'est qu'un nom mobile pointant vers un commit. En créer une est instantané, donc le travail se fait sur des branches de courte durée et arrive sur `main` par une pull request. Un **tag** est un nom qui ne bouge pas, utilisé pour les versions (`v1.4.0`) ; une **release** GitHub est une page construite sur un tag, avec des notes et des fichiers à télécharger.

### Clone, fork et remotes

- `git clone` copie un dépôt et son historique sur ta machine.
- Un **fork** est une copie sur GitHub, sous ton compte. On forke un projet dans lequel on ne peut pas écrire, on pousse une branche dans son fork, et on ouvre une pull request vers l'original.

Par convention, dans un clone de ton fork, `origin` est ton fork et `upstream` l'original :

```sh
git clone git@github.com:you/project.git
cd project
git remote add upstream git@github.com:acme/project.git
git fetch upstream
git switch -c fix-typo upstream/main
```

Le bouton Sync fork, ou `gh repo sync`, met à jour le `main` de ton fork. Garde tes propres commits hors du `main` de ton fork, pour que la synchronisation n'entre jamais en conflit.

### Les fichiers que chaque dépôt devrait avoir

| Fichier | Rôle |
|---|---|
| `README.md` | Ce qu'est le projet, comment l'installer et l'utiliser |
| `LICENSE` | Qui peut utiliser le code et comment ; sans licence, personne ne peut légalement le réutiliser |
| `.gitignore` | Les fichiers que Git ne doit pas suivre : résultats de build, dépendances, `.env` |
| `CONTRIBUTING.md` | Comment proposer un changement : installation, tests, style, pull requests |
| `SECURITY.md` | Comment signaler une vulnérabilité en privé |
| `CODE_OF_CONDUCT.md` | Le comportement attendu de chacun |

Une organisation peut fournir des fichiers communautaires par défaut dans un dépôt nommé `.github`. Un **dépôt modèle** donne ses fichiers aux nouveaux dépôts, avec un historique neuf.

### Réécrire l'historique sans danger

Sur ta propre branche, `git rebase` et `git commit --amend` réécrivent des commits ; la branche distante demande alors un push forcé. Utilise la forme prudente :

```sh
git push --force-with-lease
```

Elle refuse si quelqu'un d'autre a poussé entre-temps, au lieu d'effacer ses commits. Ne réécris jamais une branche partagée.

Un secret committé par erreur reste dans l'historique même après un nouveau commit qui le supprime. Révoque d'abord l'identifiant ; ensuite, si besoin, réécris l'historique avec `git filter-repo`, force le push de chaque branche et tag, et fais recloner les collaborateurs.

### Gros fichiers, signatures et gros dépôts

- **Git LFS** stocke les gros binaires hors de Git, en laissant de petits pointeurs dans le dépôt ; GitHub refuse en Git simple les fichiers de plus de 100 Mo.
- Les **commits signés** (clés GPG, SSH ou S/MIME) reçoivent un badge Verified : le champ auteur seul ne prouve rien.
- Les **clones superficiels et partiels** rendent la CI rapide : `actions/checkout` ne récupère que le commit construit, sauf si tu règles `fetch-depth: 0`.

**À retenir.** Un commit est un instantané immuable nommé par un hash ; les branches sont des noms peu coûteux ; les forks sont des copies côté serveur ; ne réécris jamais un historique partagé, et considère tout secret committé comme divulgué.

## Partie 2 — Issues et Projects

Les issues sont la liste des tâches du projet ; les Projects planifient sur beaucoup d'entre elles ; Discussions accueille les conversations qui ne sont pas encore du travail.

### Les issues

Une issue a un titre, une description, des labels, des assignés, un milestone facultatif et une conversation. Quelques habitudes les rendent utiles :

- Les **labels** trient et filtrent : `bug`, `docs`, `good first issue`, `help wanted`. Les deux derniers sont montrés aux nouveaux venus.
- Les **mentions** (`@lea`, `@acme/backend`) notifient les personnes et les abonnent.
- Les **mots-clés de fermeture** dans une pull request (`Fixes #42`, `Closes #42`, `Resolves #42`) lient l'issue et la ferment quand la pull request est fusionnée dans la branche par défaut.
- Un bon rapport de bug donne les étapes pour reproduire, le comportement attendu et réel, et la version.

### Modèles et formulaires

Les fichiers de `.github/ISSUE_TEMPLATE/` façonnent les nouvelles issues. Les formulaires d'issue sont du YAML avec de vrais champs :

```yaml
name: Bug report
description: Something does not work
labels: [bug]
body:
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
    validations:
      required: true
  - type: input
    id: version
    attributes:
      label: Version
```

Un `config.yml` dans le même dossier peut désactiver les issues vierges et renvoyer les questions vers Discussions.

### Les Projects

Un Project est un tableau, un board ou une roadmap sur des issues et pull requests de n'importe quels dépôts de son propriétaire. Les éléments sont les vraies issues, avec des champs en plus : Status, Priority, Iteration, Estimate. Des workflows intégrés ajoutent des éléments automatiquement et règlent Status quand un élément est ajouté, fermé ou fusionné ; tout ce qui est plus précis se programme avec l'API GraphQL.

Les **sous-issues** font d'une fonctionnalité un parent avec des issues enfants, même entre dépôts, et les **types d'issue** (bug, feature, task), définis par l'organisation, complètent les labels.

### Recherche et tri

Les qualificatifs de recherche se combinent : `is:issue is:open label:bug no:assignee` liste les bugs sans responsable. Enregistrée comme vue de Project, une telle requête devient la liste de tri. Les itérations ne déplacent pas seules les éléments inachevés : les déplacer est une décision de planification.

### Modération

Les mainteneurs peuvent verrouiller une conversation, masquer des commentaires hors sujet ou abusifs, transférer une issue vers un autre dépôt du même propriétaire, et fixer des limites d'interaction temporaires sur un dépôt public inondé de spam. Un code de conduite donne les règles auxquelles renvoyer.

**À retenir.** Une issue, une tâche ; labels et formulaires accélèrent le tri ; les Projects planifient sur plusieurs dépôts avec des champs et des vues ; Discussions garde la liste d'issues actionnable.

## Partie 3 — Les pull requests

Une pull request propose de fusionner une branche (head) dans une autre (base), montre le diff, lance les vérifications et réunit la revue.

### Ouvrir et relire

- Ouvre tôt en **brouillon** pour avoir un avis sur la direction ; marque-la prête quand elle l'est.
- Garde-la **petite et ciblée** : quelques centaines de lignes reçoivent une vraie revue, des milliers un survol. Sépare refactorings et reformatage des changements de comportement.
- Décris le **pourquoi** et **comment tester**, et lie l'issue.

Une revue est Comment, Approve ou Request changes. Les relecteurs peuvent écrire des **suggestions de modification** que l'auteur committe en un clic. Un auteur ne peut pas approuver sa propre pull request.

### Les trois méthodes de fusion

| Méthode | Résultat sur la branche de base | Bien pour |
|---|---|---|
| Create a merge commit | Chaque commit de la branche, plus un commit de fusion | Garder l'historique exact de la branche |
| Squash and merge | Un commit par pull request | Un historique propre où chaque commit est un changement relu |
| Rebase and merge | Chaque commit rejoué, sans commit de fusion | Un historique linéaire avec les commits individuels |

La fusion squash facilite les reverts et les backports (un commit par changement) et aide `git bisect`, puisque chaque commit de `main` a passé les vérifications.

### CODEOWNERS

Un fichier `CODEOWNERS` (dans `.github/`, à la racine ou dans `docs/`) associe des chemins à des propriétaires :

```text
*            @acme/maintainers
*.js         @acme/web
/api/        @acme/backend
/docs/       @acme/writers @lea
```

Les propriétaires sont sollicités automatiquement en revue ; avec la revue des code owners de la protection de branche, l'approbation d'un propriétaire par chemin touché est exigée. Pour chaque fichier, seule la **dernière ligne qui correspond** compte : `/api/server.js` ci-dessus appartient à `@acme/backend` seul. Mets les motifs généraux d'abord, les précis ensuite. Les propriétaires doivent avoir l'accès en écriture ; le fichier n'en donne aucun.

### Conflits, reverts et backports

Un conflit signifie que les deux branches ont modifié les mêmes lignes ; fusionne ou rebase la base dans ta branche, résous, puis pousse. Pour annuler une pull request fusionnée, utilise le bouton **Revert** : il ouvre une nouvelle pull request avec un commit qui l'annule, relue comme tout changement. Pour amener une correction sur une branche de version maintenue, cherry-pick-la sur une branche partant de cette version et ouvre une pull request de backport.

### Merge queues, auto-merge et piles

- Une **merge queue** teste chaque pull request avec celles qui la précèdent sur la dernière base, et ne fusionne que ce qui passe. Les workflows exigés doivent aussi tourner `on: merge_group`.
- L'**auto-merge** fusionne dès que toutes les exigences sont remplies.
- Les **pull requests empilées** découpent un gros changement en une chaîne, chacune ayant pour base la branche précédente, pour relire chaque étape à part.

**À retenir.** De petites pull requests avec un pourquoi clair ; le squash pour un historique de changements relus ; la dernière ligne `CODEOWNERS` qui correspond l'emporte ; annule par une pull request, jamais en réécrivant `main`.

## Partie 4 — Organisations et méthode

### Comptes, organisations et rôles

Chacun garde son compte personnel et rejoint des **organisations**, qui possèdent les dépôts, donc rien n'est perdu quand quelqu'un part. L'accès à un dépôt vient de cinq rôles :

| Rôle | Ajoute |
|---|---|
| Read | Voir, cloner, ouvrir des issues, commenter |
| Triage | Gérer issues et pull requests : labels, assignés, fermeture |
| Write | Pousser, fusionner des pull requests |
| Maintain | Gérer les réglages du dépôt, sauf les destructifs |
| Admin | Tout, y compris accès, suppression et réglages de sécurité |

Donne les accès par **équipes** (`@acme/backend`), pas personne par personne : l'appartenance pilote alors tous les dépôts d'un coup. Les équipes enfants héritent des accès de leur parent. La **permission de base** de l'organisation s'applique à chaque membre sur chaque dépôt ; les collaborateurs externes ne voient que les dépôts où on les a ajoutés. Les entreprises ajoutent le SSO SAML, le provisionnement SCIM, des rôles de dépôt personnalisés et un journal d'audit.

### Modèles de branches

| Modèle | Forme | Convient à |
|---|---|---|
| GitHub flow | `main` plus de courtes branches de fonctionnalité, fusionnées après revue, puis déployées | Les services web déployés en continu |
| Trunk-based development | Des branches très courtes fusionnées au moins chaque jour, le travail inachevé derrière des feature flags | Les équipes en déploiement continu |
| Git flow | `develop`, des branches de release et de hotfix à côté de `main` | Les logiciels livrés par versions, avec des versions maintenues |

Les release trains combinent le travail en tronc et un calendrier fixe : une branche de release est coupée à la date, et ce qui n'est pas prêt attend le train suivant.

### Versions et messages de commit

Le **versionnage sémantique** se lit MAJEUR.MINEUR.CORRECTIF : un changement cassant augmente la majeure, une fonctionnalité compatible la mineure, une correction compatible le correctif ; après `2.3.1`, une nouvelle fonctionnalité donne `2.4.0`. Les **Conventional Commits** s'écrivent `type(scope): description`, comme `fix(parser): handle empty input` ou `feat!: drop Node 18`, pour que des outils déduisent la version suivante et le changelog.

### Une culture de revue saine

- La revue fait partie du travail : convenez d'une première réponse dans la journée de travail.
- Demande la revue à une équipe plutôt qu'à une personne ; `CODEOWNERS` répartit la charge.
- Commente le code, pas la personne ; sépare l'indispensable des suggestions.
- **Inner source** : laisse toute équipe lire les dépôts d'une autre et y proposer des changements, avec de bons README et guides de contribution.

**À retenir.** Les organisations possèdent le code, les équipes portent les accès, les rôles suivent le moindre privilège ; choisis un modèle de branches qui correspond à ta façon de livrer ; versionne et décris les changements pour que machines et personnes les lisent.

## Partie 5 — Protection des branches et rulesets

Les règles changent les bonnes habitudes en garanties sur les branches qui comptent.

### Ce qu'il faut exiger sur `main`

- **Une pull request avant la fusion**, avec au moins une approbation, et la revue des code owners là où il y en a.
- **Écarter les approbations périmées** quand de nouveaux commits sont poussés, et exiger l'approbation du dernier push, pour que personne ne fusionne de code non relu.
- **Des vérifications de statut exigées** : des vérifications nommées (par exemple `test`) doivent passer. Exiger que la branche soit **à jour** fait tourner les vérifications sur ce que la fusion produira ; une merge queue donne la même garantie sans mises à jour manuelles.
- Un **historique linéaire** (seulement des fusions squash ou rebase), des **commits signés**, la **résolution des conversations**.
- **Ni force-push ni suppression.**

### Les rulesets

Les rulesets sont la forme récente des règles. Par rapport à la protection de branche classique :

- Plusieurs rulesets peuvent viser la même branche, et ils **s'agrègent** : pour une règle présente dans plusieurs, le réglage le plus restrictif s'applique. Un ruleset d'organisation exigeant une approbation et un ruleset de dépôt en exigeant deux en donnent deux.
- Ils visent des branches, des **tags** et, pour les dépôts privés et internes, des **push** (chemins, extensions, tailles de fichiers), sur de nombreux dépôts à la fois.
- Une **liste de contournement** nomme les rôles, équipes ou applications autorisés à les sauter ; garde-la courte et préfère les applications.
- Le **mode évaluation** (sur les plans Enterprise) signale ce qui serait bloqué avant d'imposer.
- Tous ceux qui ont l'accès en lecture voient quelles règles s'appliquent.

Un ruleset de tags sur `v*` que seule une application de release peut contourner garantit que les tags de version viennent du pipeline de release.

### Des vérifications dignes de confiance

Une vérification exigée se reconnaît par son nom, donc règle sa **source attendue** (par exemple GitHub Actions), sinon une imitation venant d'une autre application ou d'un autre workflow pourrait la satisfaire. Les workflows exigés des rulesets vont plus loin : un workflow central que chaque dépôt doit passer et ne peut pas modifier.

### Les environnements comme contrôles

Les déploiements utilisent des **environnements** avec leurs propres règles : relecteurs exigés, délais d'attente, branches ou tags autorisés, et règles de protection de déploiement personnalisées où une application externe approuve ou rejette le job (par exemple, pas de déploiement pendant un incident).

**À retenir.** Exige sur `main` des pull requests relues, vérifiées et à jour ; préfère les rulesets, qui se superposent et où le réglage le plus strict l'emporte ; garde des listes de contournement minuscules ; fixe la source des vérifications exigées.

## Partie 6 — Actions

GitHub Actions fait tourner des workflows : des fichiers YAML dans `.github/workflows/`, déclenchés par des événements.

### Anatomie d'un workflow

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: ${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm test
```

- Les **événements** (`on:`) lancent des exécutions : `push`, `pull_request`, `schedule`, `workflow_dispatch` (manuel, avec des entrées), `release`, `merge_group` et bien d'autres.
- Les **jobs** tournent sur des runners séparés et neufs, en parallèle sauf si `needs:` les ordonne.
- Les **étapes** tournent dans l'ordre à l'intérieur d'un job et partagent son espace de travail ; `uses:` lance une action, `run:` des commandes shell.
- Une **matrice** lance le job une fois par combinaison : deux versions de Node fois deux systèmes font quatre jobs.

### Passer des données et gagner du temps

- Les **artefacts** (`actions/upload-artifact`) gardent des fichiers d'une exécution pour le téléchargement ou des jobs suivants.
- Les **caches** (`actions/cache`, ou l'option `cache:` des actions de setup) restaurent les dépendances selon une clé comme le hash du lockfile ; l'absence de cache doit quand même fonctionner.
- Les **sorties** : une étape ajoute `name=value` au fichier désigné par `GITHUB_OUTPUT` ; les étapes suivantes lisent `steps.<id>.outputs.name`, et les autres jobs lisent les sorties du job par `needs`.
- Les **planifications** utilisent la syntaxe cron en UTC, tournent depuis la branche par défaut, et peuvent démarrer en retard aux heures chargées.

### Les conditions

Une étape sans `if:` ne tourne que si tout ce qui précède a réussi. Les fonctions de statut changent cela :

| Condition | Tourne quand |
|---|---|
| `success()` (implicite) | Chaque étape précédente a réussi |
| `failure()` | Une étape précédente a échoué |
| `always()` | Toujours, même après une annulation |
| `!cancelled()` | Après réussite ou échec, mais pas après une annulation |

### Réutilisation et contrôle

- Les **workflows réutilisables** (`on: workflow_call`) sont appelés comme des jobs entiers, avec entrées et secrets ; les **actions composites** regroupent des étapes utilisées dans un job.
- Les **groupes de concurrence** tournent un à la fois ; une exécution en attente plus récente remplace une plus ancienne, et `cancel-in-progress` annule aussi celle en cours (bien pour les pull requests, risqué pour les déploiements).
- Les **matrices dynamiques** : un premier job produit un tableau JSON, lu avec `fromJSON` par la matrice du job suivant.
- Les **runners auto-hébergés** conviennent au matériel particulier ou aux réseaux privés, mais doivent rester propres et ne jamais servir de dépôts publics.

### Les pièges à connaître

- Les événements causés par le `GITHUB_TOKEN` (un push, un tag) ne lancent pas de nouvelles exécutions, pour éviter les boucles ; utilise un jeton d'application GitHub quand un workflow doit en déclencher un autre.
- Les workflows planifiés des dépôts publics sont désactivés après 60 jours sans activité.
- Une matrice est limitée à 256 jobs, et une matrice vide échoue.

**À retenir.** Les workflows sont du code dans le dépôt : les événements lancent des jobs, les jobs font tourner des étapes sur des runners neufs ; mets les entrées en cache, garde les résultats comme artefacts ; sache ce que `if:` veut vraiment dire ; réutilise avec les workflows réutilisables et les actions composites.

## Partie 7 — Sécuriser les workflows

Un workflow fait tourner du code avec des identifiants. Traite-le comme la production.

### Les secrets et le jeton

- Stocke les identifiants comme **secrets** (de dépôt, d'environnement ou d'organisation) et lis-les avec `secrets.NAME`. Ne les committe jamais ; un secret committé doit être révoqué.
- Les journaux masquent les valeurs exactes des secrets, pas les valeurs transformées ; n'affiche jamais de secrets.
- Le **`GITHUB_TOKEN`** est créé pour chaque exécution, limité au dépôt, et expire à la fin du job. Règle ses portées avec `permissions:` ; dès que la clé est présente, chaque portée non listée vaut `none`. Pars de `contents: read` et accorde plus par job.

### Forks, Dependabot et environnements

- Les exécutions `pull_request` venant de **forks** n'ont pas de secrets et ont un jeton en lecture seule ; celles des nouveaux contributeurs peuvent demander une approbation.
- Les exécutions déclenchées par **Dependabot** sont traitées de même et ne voient que les secrets Dependabot.
- Les **environnements** gardent les secrets de production hors de tous les autres jobs : un job qui nomme `environment: production` attend ses relecteurs exigés, et ne reçoit qu'ensuite les secrets de l'environnement.

### OIDC au lieu des clés

Un job avec `id-token: write` peut demander à GitHub un jeton OIDC signé décrivant l'exécution. La Workload Identity Federation de Google Cloud (ou ses équivalents AWS et Azure) fait confiance à cet émetteur et échange le jeton contre des identifiants de courte durée. Aucune clé durable n'existe qui pourrait fuir. Restreins la condition de confiance au dépôt et à l'environnement, par le claim `sub` du jeton (par exemple `repo:acme/shop:environment:production`), jamais à toute une organisation.

### La chaîne d'approvisionnement du workflow lui-même

- **Épingle les actions tierces par SHA de commit complet**, avec la version en commentaire ; les tags peuvent être déplacés. En mars 2025, les tags de `tj-actions/changed-files` ont été déplacés vers un commit qui vidait les secrets dans les journaux ; les workflows épinglés par SHA n'ont pas été touchés. Laisse Dependabot mettre les SHA à jour.
- **L'injection de script** : des valeurs comme un titre d'issue sont collées dans le script avant son exécution. Passe-les par une variable d'environnement :

```yaml
- name: Greet
  env:
    TITLE: ${{ github.event.issue.title }}
  run: echo "New issue: $TITLE"
```

- **`pull_request_target`** tourne avec les secrets du dépôt de base ; n'y récupère et n'y construis jamais le code de la pull request.
- Les **caches** créés sur la branche par défaut sont visibles de toutes les branches ; empêche les jobs peu fiables d'écrire des caches que les builds de release restaurent.
- Les **attestations d'artefact** (`actions/attest-build-provenance`) signent où et comment un fichier a été construit ; `gh attestation verify` le vérifie.

**À retenir.** Un jeton au moindre privilège, des secrets seulement là où il faut, OIDC au lieu des clés avec une condition de confiance étroite, des actions épinglées par SHA, le texte non fiable par des variables d'environnement, et pas de code non fiable dans les déclencheurs privilégiés.

## Partie 8 — La chaîne d'approvisionnement : Dependabot, code scanning, secret scanning

### Dependabot

- Les **alertes** : le graphe de dépendances (tiré des manifestes et des lockfiles) est comparé à la GitHub Advisory Database.
- Les **mises à jour de sécurité** : des pull requests qui passent une dépendance vulnérable à la première version corrigée.
- Les **mises à jour de version** : des pull requests qui tiennent les dépendances à jour, configurées dans `.github/dependabot.yml` :

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    groups:
      minor-and-patch:
        update-types: [minor, patch]
    cooldown:
      default-days: 5
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

Les groupes réunissent des mises à jour liées en une pull request ; `ignore` en saute certaines ; `cooldown` attend quelques jours après une version avant de la proposer, pour qu'une version empoisonnée ait le temps d'être repérée (les mises à jour de sécurité ne sont pas retardées). Committe les lockfiles pour que les installations soient reproductibles et les dépendances indirectes visibles.

L'auto-merge est raisonnable pour les mises à jour correctives (et peut-être mineures), une fois les tests exigés passés : un workflow lit `dependabot/fetch-metadata` et lance `gh pr merge --auto --squash` pour celles-là. Les versions majeures méritent un humain.

### Code scanning et secret scanning

- Le **code scanning avec CodeQL** trouve des motifs de vulnérabilité (injection, traversée de chemin…). La configuration par défaut ne demande aucun fichier ; la configuration avancée est un workflow pour des builds et requêtes particuliers. Les résultats apparaissent comme alertes sur les pull requests.
- Le **secret scanning** trouve des identifiants dans tout l'historique et prévient de nombreux fournisseurs ; la **push protection** bloque un push contenant un secret reconnu, sauf si l'auteur enregistre une raison de contourner.
- L'**action dependency review** montre les dépendances qu'ajoute une pull request et peut échouer sur des vulnérabilités connues ou des licences interdites.

Les dépôts publics ont ces fonctions gratuitement ; les privés des plans Team et Enterprise achètent séparément **GitHub Secret Protection** et **GitHub Code Security**.

### Inventaire et divulgation

- Le graphe de dépendances exporte une **SBOM** au format SPDX.
- Le **signalement privé de vulnérabilités** et les **avis de sécurité du dépôt** permettent aux mainteneurs de préparer une correction en privé, demander un CVE et publier ; Dependabot alerte alors chaque dépôt dépendant.

### Le tri

La gravité décrit le paquet, pas ton usage. Une dépendance de développement vulnérable jamais livrée présente en général moins de risque, même si une qui tourne dans la CI avec des secrets peut compter. Écarte avec une raison déclarée, pour que la décision soit enregistrée.

**À retenir.** Des lockfiles, des mises à jour Dependabot groupées et retardées, Actions comprises, CodeQL et push protection activés, la dependency review comme vérification exigée, et une divulgation privée et coordonnée.

## Exercices

1. Forke un projet public, ajoute `upstream`, et crée une branche depuis `upstream/main`. Vers quel remote pousses-tu ?
2. Écris un formulaire d'issue avec un champ Steps to reproduce obligatoire et un champ Version. Où va le fichier ?
3. `CODEOWNERS` contient `*.ts @acme/web` puis, plus loin, `/server/ @acme/api`. Qui possède `/server/app.ts`, et comment les deux équipes le posséderaient-elles ?
4. Ton équipe livre un service web plusieurs fois par jour. Quel modèle de branches et quelle méthode de fusion conviennent, et pourquoi ?
5. Un ruleset d'organisation exige une approbation et un ruleset de dépôt en exige deux, dont un code owner. Qu'est-ce qui s'applique à une pull request sur `main` ?
6. Écris un workflow qui teste sur Node 20 et 22 aux pull requests et aux push sur `main`, avec des permissions en lecture seule et le cache npm.
7. Un job de déploiement utilise une clé JSON de compte de service stockée en secret. Décris le passage à OIDC et la condition de confiance que tu réglerais.
8. Écris un `dependabot.yml` qui met à jour npm et GitHub Actions chaque semaine, regroupe les mises à jour mineures et correctives, et attend cinq jours après les versions.

### Réponses

1. Vers `origin`, ton fork ; la pull request va ensuite de la branche de ton fork vers le `main` d'upstream.
2. Dans `.github/ISSUE_TEMPLATE/`, en fichier `.yml` avec des champs `body` et `validations: required: true` sur les étapes.
3. `@acme/api` : la dernière ligne qui correspond l'emporte. Mets les deux sur une ligne : `/server/ @acme/api @acme/web`.
4. GitHub flow ou trunk-based development avec des fusions squash : des branches courtes, un commit relu par changement sur `main`, des reverts faciles.
5. Deux approbations dont un code owner : les rulesets s'agrègent et le réglage le plus strict de chaque règle s'applique.
6. Voir le workflow de la partie 6 : `on: pull_request` et `push` sur `main`, `permissions: contents: read`, une matrice sur `node`, `cache: npm`.
7. Supprime la clé ; accorde `id-token: write` au job ; crée un pool et un fournisseur d'identité de charge de travail qui font confiance à l'émetteur de GitHub ; n'autorise que `sub` égal à `repo:<owner>/<repo>:environment:production` à emprunter le compte de service de déploiement ; utilise l'action d'authentification avec le fournisseur au lieu de la clé.
8. Voir le fichier de la partie 8, avec `interval: weekly`, un groupe `update-types: [minor, patch]` et `cooldown: default-days: 5`.

## Sources

Pages de référence pour chaque partie. Fonctions et plans changent : vérifie la page avant de te fier à un détail.

| Partie | Pages |
|---|---|
| 1 | [About Git](https://docs.github.com/en/get-started/using-git/about-git) · [Git LFS](https://git-lfs.com/) · [git filter-repo](https://github.com/newren/git-filter-repo) |
| 2 | [About Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects) · [Transférer une issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/transferring-an-issue-to-another-repository) |
| 3 | [About pull request merges](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges) · [About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) |
| 4 | [Repository roles for an organization](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization) · [Semantic Versioning](https://semver.org/) · [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) |
| 5 | [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) · [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) |
| 6 | [Documentation de GitHub Actions](https://docs.github.com/en/actions) |
| 7 | [Preventing pwn requests](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/) · [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation) |
| 8 | [Options de Dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file) · [SLSA](https://slsa.dev/) |
