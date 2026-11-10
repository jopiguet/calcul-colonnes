# Systèmes de déploiement — un cours complet

## Comment utiliser ce cours

Ce cours explique comment un logiciel va d'un commit à la production et y reste en bonne santé : pipelines et artefacts, conteneurs, stratégies de mise en production, infrastructure as code avec Terraform, Kubernetes, GitOps et plateformes gérées comme Cloud Run, et l'exploitation qui fait tourner le tout. Il décrit les outils tels qu'ils sont fin 2026, et privilégie les principes qui durent plus longtemps qu'un outil.

**Pour qui.** Des développeurs qui livrent du code et veulent comprendre ce qui se passe après la fusion, et quiconque met en place ou relit un pipeline de livraison. Il faut être à l'aise avec Git et un terminal ; la partie 5 suppose un peu de vocabulaire cloud (projets, régions, comptes de service).

**Organisation.** Huit parties en deux blocs :

| Bloc | Parties | Ce que tu sais faire après |
|---|---|---|
| Les fondements | 1 Pipelines et artefacts · 2 Conteneurs · 3 Stratégies de mise en production | Construire une fois, livrer sans risque, revenir en arrière en quelques secondes |
| Outils et exploitation | 4 Infrastructure as code · 5 Terraform et OpenTofu · 6 Kubernetes · 7 GitOps et plateformes gérées · 8 Exploitation | Décrire l'infrastructure en code, la faire tourner sur Kubernetes ou Cloud Run, et la garder fiable |

Chaque partie finit par ce qu'il faut retenir. Les exercices à la fin donnent une tâche par partie, avec les réponses.

**Avec Luma.** Le test *🚀 Déploiement* du groupe *Informatique* de Luma suit les mêmes thèmes sur quatre niveaux (Débutant à Expert), avec 128 questions rédigées. Luma lui-même est déployé comme le décrit la partie 7 : une image construite par GitHub Actions, des migrations lancées dans un job à part, une révision sans trafic avec un tag sur Cloud Run, testée avant que le trafic y passe.

**Ce qu'il te faut.** Docker ou Podman pour la partie 2 ; Terraform ou OpenTofu et un compte cloud (une offre gratuite suffit) pour la partie 5 ; pour la partie 6, un cluster local comme kind ou minikube.

## Partie 1 — Pipelines et artefacts

### CI, livraison continue, déploiement continu

- L'**intégration continue** fusionne souvent de petits changements, chacun construit et testé automatiquement.
- La **livraison continue** garde le résultat toujours publiable ; une personne décide quand livrer.
- Le **déploiement continu** livre chaque changement qui passe le pipeline, avec des vérifications automatiques et un déploiement progressif comme contrôle.

Le but reste le même : de petits changements, des retours rapides, et des mises en production qui sont une routine plutôt qu'un événement.

### Construire une fois, déployer partout

Le pipeline change un commit en **artefact** une seule fois (une image de conteneur, un paquet, un binaire), le stocke dans un registre sous une version ou un digest, et déploie ce même artefact dans chaque environnement. Reconstruire pour la production pourrait tirer d'autres dépendances et livrer quelque chose que personne n'a testé.

Ce qui diffère entre environnements, c'est la **configuration**, lue dans l'environnement à l'exécution : une variable d'environnement comme `DATABASE_URL`, et les secrets d'un gestionnaire de secrets. C'est la règle twelve-factor de la configuration dans l'environnement.

Nomme les artefacts par ce qu'ils sont, pas par où ils sont : une version (`1.4.0`) ou le SHA du commit, plus le digest pour les machines. `latest` ne dit rien dans un historique de déploiement.

### Un pipeline qui répond vite

1. Lint, compilation, tests unitaires : de quelques secondes à quelques minutes, à chaque push.
2. Construire l'artefact et l'analyser.
3. Tests d'intégration et de bout en bout contre de vrais services.
4. Déployer en staging, lancer des tests rapides.
5. Promouvoir en production, progressivement, avec des vérifications automatiques.

Ordonne par coût et lance en parallèle les étapes indépendantes. Une approbation manuelle avant la production doit regarder le risque (ce qui a changé, les migrations, le moment), pas relire le code.

### Tronc, prévisualisations et reproductibilité

- **Trunk-based development** : les changements arrivent sur `main` au moins chaque jour, le travail inachevé derrière des feature flags, donc chaque déploiement est petit.
- **Environnements de prévisualisation** : un déploiement éphémère par pull request, à sa propre URL, supprimé à la fermeture de la pull request.
- **Builds reproductibles** : des dépendances et une chaîne d'outils figées donnent des artefacts identiques bit à bit. Les **builds hermétiques** vont plus loin : toutes les entrées déclarées par hash, pas de réseau pendant le build.
- **SLSA** note la confiance dans l'origine d'un build ; aux niveaux élevés, la plateforme de build signe une provenance que les étapes du build ne peuvent pas falsifier. Les **images signées**, vérifiées au déploiement, garantissent que seuls les artefacts de ton pipeline tournent.

### Les migrations sont une étape à part

Les déploiements de code font tourner l'ancienne et la nouvelle version côte à côte pendant des minutes ; les changements de schéma sont souvent à sens unique. Lance les migrations comme une étape à part avant le code, et garde chaque migration compatible avec le code d'avant et d'après (partie 3).

**À retenir.** Un artefact immuable par commit, promu d'environnement en environnement ; configuration et secrets venant de l'environnement ; les vérifications rapides d'abord ; les migrations à part du code.

## Partie 2 — Les conteneurs

### Conteneurs, images, registres

Un **conteneur** est un ensemble de processus isolés par le noyau (namespaces pour ce qu'il voit, cgroups pour ce qu'il utilise) ; il partage le noyau de l'hôte, donc il démarre en millisecondes mais isole moins qu'une machine virtuelle. Une **image** est le modèle en lecture seule dont part un conteneur ; un **registre** (Artifact Registry, GitHub Container Registry, Docker Hub) stocke les images par nom, tag et digest.

### Un bon Dockerfile

```dockerfile
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/server.js"]
```

- **L'ordre des couches** : les dépendances changent rarement, le code souvent, donc copie les manifestes et installe avant de copier le code. Un `.dockerignore` garde `node_modules` et `.git` hors du contexte de build.
- **Multi-étapes** : compilateurs et sources restent dans l'étape de build ; l'image finale ne contient que ce qui tourne.
- **Non root** : `USER node` limite ce qu'un exploit peut faire.
- **Forme exec** : `CMD ["node", ...]` fait de l'application le PID 1, qui reçoit SIGTERM et peut s'arrêter proprement.

### Tags et digests

Un tag comme `app:1.4` peut être déplacé ; un digest comme `app@sha256:9f…` désigne toujours les mêmes octets. Les humains lisent les tags ; les déploiements doivent fixer les digests. Les plateformes enregistrent le digest qu'elles ont résolu.

### Des images plus petites et plus sûres

- Les **bases minimales ou distroless** retirent le shell et le gestionnaire de paquets : moins de vulnérabilités, mais le débogage repose sur les journaux et des variantes de débogage.
- **L'analyse** trouve les vulnérabilités connues ; reconstruis régulièrement sur des bases à jour plutôt que de corriger des conteneurs en marche.
- **Images multi-architecture** : `docker buildx build --platform linux/amd64,linux/arm64` produit un index dans lequel chaque machine tire la sienne.
- **Secrets de build** : un fichier supprimé dans une couche ultérieure existe encore dans la précédente. Utilise `RUN --mount=type=secret,id=npm ...` pour que le secret n'entre jamais dans une couche.

### Sous le capot

Les images suivent le format **OCI** : un manifeste liste une configuration et des couches par digest, et un index regroupe les manifestes par plateforme. Kubernetes parle à un runtime comme containerd, qui utilise runc (ou gVisor, Kata Containers) pour créer les conteneurs. L'isolation de première génération de Cloud Run utilisait gVisor ; la deuxième génération fait tourner un noyau Linux complet dans une microVM.

**À retenir.** Ordonne les couches pour le cache, construis par étapes, tourne en non root et en forme exec, fixe les digests, reconstruis souvent sur de petites bases, et garde les secrets hors des couches.

## Partie 3 — Stratégies de mise en production

### Les quatre stratégies de base

| Stratégie | Comment | Retour arrière | Coût |
|---|---|---|---|
| Recreate | Arrêter l'ancienne version, démarrer la nouvelle | Redéployer l'ancienne | Interruption |
| Rolling | Remplacer les instances quelques-unes à la fois | Remettre l'ancienne version progressivement | Les deux versions en service un moment |
| Blue-green | Démarrer la nouvelle à côté de l'ancienne, basculer tout le trafic d'un coup | Rebasculer | Capacité double pendant la bascule |
| Canary | Envoyer une petite part du trafic à la nouvelle, l'augmenter par étapes | Renvoyer le trafic | Demande des métriques et un partage du trafic |

### Feature flags et sondes

Les **feature flags** séparent déployer et publier : le code part désactivé et s'active pour certains utilisateurs ou pour tous sans déploiement, et se coupe en quelques secondes s'il se comporte mal. Retire les vieux flags.

Les **sondes** gardent les mauvaises instances hors du trafic : une sonde de **disponibilité** en échec retire une instance de la répartition de charge ; une sonde de **vie** en échec la redémarre. Un déploiement dont les nouvelles instances ne deviennent jamais prêtes se bloque au lieu de servir des erreurs.

### Les canaries en pratique

Sur Cloud Run, déploie sans trafic, puis déplace-le :

```sh
gcloud run deploy web --image="$IMAGE" --no-traffic --tag=candidate
gcloud run services update-traffic web --to-tags=candidate=10
gcloud run services update-traffic web --to-latest
```

Surveille le taux d'erreurs et la latence face à l'ancienne version à chaque étape. **L'analyse automatique des canaries** (Argo Rollouts, Flagger) compare statistiquement canary et référence et revient en arrière d'elle-même. Route par utilisateur quand une session s'étend sur plusieurs requêtes, pour que chacun ne voie qu'une version.

### Bases de données : expand et contract

Pour renommer une colonne sans interruption :

1. **Expand** : ajouter la nouvelle colonne.
2. Écrire dans les deux colonnes, et remplir les anciennes lignes.
3. Passer les lectures sur la nouvelle colonne.
4. Cesser d'écrire l'ancienne.
5. **Contract** : supprimer l'ancienne colonne.

Chaque étape marche avec le code d'avant et d'après, donc chaque déploiement peut revenir en arrière. Il en va de même des formats de messages dans les files et des données en cache : rends d'abord les lecteurs tolérants, puis change les écrivains.

### Revenir en arrière ou corriger en avant

Reviens en arrière par défaut quand la cause n'est pas claire : cela rétablit vite un état connu. Corrige en avant quand la nouvelle version a déjà changé des données que l'ancienne ne sait pas lire, et qu'une petite correction peut passer par le pipeline normal.

### Les grands systèmes

- Le **trafic miroir** copie de vraies requêtes vers la nouvelle version et compare les réponses sans les renvoyer ; les effets de bord doivent être désactivés dans le miroir.
- Les **cellules** découpent le système en copies indépendantes servant des parts d'utilisateurs ; les versions passent cellule par cellule, région par région.
- Le **temps de maturation** entre étapes attrape les problèmes lents : fuites, tâches quotidiennes, heures de pointe.

**À retenir.** Sépare déploiement et publication par des flags ; conditionne le trafic à la disponibilité ; fais des canaries avec comparaison automatique ; change les schémas par expand et contract ; reviens en arrière sauf si les données disent le contraire.

## Partie 4 — Infrastructure as code

### Pourquoi du code

L'infrastructure as code décrit réseaux, bases de données, clusters et permissions dans des fichiers versionnés qu'un outil applique. Les changements sont relus en pull request, les environnements peuvent être recréés, et les fichiers documentent ce qui existe. Les changements faits à la souris ne laissent pas de trace et font diverger les environnements.

### Déclaratif, idempotent, immuable

- **Déclaratif** : on décrit l'état final voulu ; l'outil le compare à la réalité et calcule les étapes.
- **Idempotent** : appliquer deux fois a le même effet qu'une fois, donc une exécution échouée peut être relancée.
- **Infrastructure immuable** : au lieu de corriger les serveurs, on construit une nouvelle image et on les remplace ; le retour arrière est le redéploiement de l'image précédente.
- **Dérive** : la réalité ne correspond plus au code, en général après un changement manuel. Détecte-la par des plans planifiés et ramène les correctifs dans le code.

### Le paysage

| Sorte | Outils | Rôle |
|---|---|---|
| Provisionnement, déclaratif | Terraform, OpenTofu | Créer des ressources cloud et SaaS par les API, tout fournisseur |
| Natif d'un cloud | AWS CloudFormation, Azure Bicep, Google Cloud Infrastructure Manager | La même chose pour un seul cloud (Infrastructure Manager fait tourner Terraform) |
| Langages généralistes | Pulumi, AWS CDK | L'infrastructure écrite en TypeScript, Python, Go |
| Plan de contrôle Kubernetes | Crossplane | Les ressources cloud comme objets Kubernetes, réconciliées en continu |
| Gestion de configuration | Ansible, Chef, Puppet | Configurer les logiciels dans des machines existantes |

### Policy as code et revue

Des règles comme pas de bucket public ou des labels obligatoires peuvent être vérifiées automatiquement sur chaque plan (OPA et Conftest avec Rego, Sentinel dans HCP Terraform), en faisant échouer le pipeline avant apply. Les relecteurs se concentrent alors sur l'intention. Publie le plan sur la pull request : le diff montre l'intention, le plan montre l'effet, comme une base de données qui serait remplacée.

### Organiser le code et l'état

Garde des modules partagés et une petite configuration racine par environnement, chacune avec ses variables et son état propres. Découpe les états par cycle de vie et par responsabilité (réseau, données partagées, chaque service) : des états plus petits planifient plus vite, prennent des permissions plus strictes et limitent le rayon d'impact d'une erreur. Terragrunt peut supprimer la répétition que cela crée.

**À retenir.** Décris l'état final, garde-le dans Git, relis les plans et pas seulement les diffs, détecte la dérive, impose les garde-fous comme des politiques, et découpe l'état pour limiter ce qu'une erreur peut atteindre.

## Partie 5 — Terraform et OpenTofu

### Licences et forks

HashiCorp a fait passer Terraform à la Business Source License en 2023 ; **OpenTofu**, sous l'égide de la Linux Foundation, est le fork open source issu de la dernière version ouverte, largement compatible et qui ajoute des fonctions comme le chiffrement de l'état côté client. HashiCorp fait désormais partie d'IBM. Ce qui suit vaut pour les deux.

### Le langage

```hcl
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
  backend "gcs" {
    bucket = "acme-tf-state"
    prefix = "web/production"
  }
}

variable "region" {
  type    = string
  default = "europe-west1"
}

resource "google_storage_bucket" "assets" {
  name     = "acme-assets"
  location = var.region
}

output "bucket_url" {
  value = google_storage_bucket.assets.url
}
```

- Les **fournisseurs** parlent aux API et définissent les types de ressources ; `terraform init` les télécharge et enregistre les versions exactes dans `.terraform.lock.hcl`, que l'on committe.
- Les **ressources** sont des objets gérés ; les **sources de données** ne font que lire des objets gérés ailleurs.
- Les **variables** sont des entrées (fichiers `.tfvars`, `-var` ou variables d'environnement `TF_VAR_`) ; les **outputs** exposent des résultats ; les **locals** nomment des expressions.
- Les **modules** sont des dossiers avec entrées et sorties, appelés avec une `source` et une version.

### Le déroulé et l'état

`terraform init`, puis `plan` (ce qui changerait), puis `apply`. L'**état** associe chaque adresse de ressource à l'objet réel ; garde-le dans un backend distant avec **verrouillage** (GCS, HCP Terraform, S3 avec `use_lockfile`), jamais dans Git, puisqu'il peut contenir des secrets.

Lis les plans avec soin : `+` créer, `-` détruire, `~` mettre à jour sur place, `-/+` remplacer. Le remplacement d'une ressource avec état signifie une perte de données sauf si c'est prévu.

### count ou for_each

Avec `count`, les instances sont numérotées : retirer un élément au milieu décale les suivants et les recrée. Avec `for_each`, les instances sont identifiées par leur nom : en retirer une ne touche qu'elle. Utilise `for_each` pour les collections, `count` pour des copies identiques ou un interrupteur.

### Changer ce qui existe

| Besoin | Bloc |
|---|---|
| Faire gérer un objet existant | `import` (avec `-generate-config-out` pour ébaucher le code) |
| Renommer ou déplacer une ressource sans la recréer | `moved` |
| Cesser de gérer un objet sans le détruire | `removed` avec `lifecycle { destroy = false }` |
| Refuser tout plan qui le détruirait | `lifecycle { prevent_destroy = true }` |
| Créer le remplaçant avant de détruire l'ancien | `lifecycle { create_before_destroy = true }` |
| Cesser de rétablir un attribut changé ailleurs | `lifecycle { ignore_changes = [...] }` |

### Secrets et tests

`sensitive = true` cache une valeur à l'affichage mais pas dans l'état. Depuis la 1.10 et la 1.11, les **valeurs éphémères** et les **arguments en écriture seule** permettent de passer un secret à une ressource sans qu'il soit stocké dans le plan ni l'état. `terraform test` lance des fichiers `.tftest.hcl` qui planifient ou appliquent un module et vérifient des assertions ; les blocs `check` vérifient des conditions réelles après apply.

**À retenir.** Fixe les fournisseurs et committe le fichier de verrouillage ; un état distant avec verrou ; lis chaque remplacement du plan ; `for_each` pour les collections ; `import`, `moved` et `removed` plutôt que de modifier l'état à la main ; garde les secrets hors de l'état.

## Partie 6 — Kubernetes

### Les objets de base

| Objet | Rôle |
|---|---|
| Pod | Un ou plusieurs conteneurs partageant une adresse réseau ; jetable |
| Deployment | Garde N Pods identiques en marche, déploie les nouvelles versions |
| Service | Un nom et une adresse stables devant les Pods qui correspondent |
| Ingress, Gateway API | Le routage HTTP depuis l'extérieur par hôte et chemin |
| ConfigMap, Secret | La configuration et les identifiants donnés aux Pods |
| HorizontalPodAutoscaler | Change le nombre de réplicas pour garder une métrique près d'une cible |

Kubernetes est déclaratif : `kubectl apply -f` stocke l'état voulu, et des contrôleurs font sans cesse correspondre la réalité.

### Un Deployment qui tient la route

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: europe-docker.pkg.dev/acme/apps/web@sha256:9f2c0d
          resources:
            requests: { cpu: 250m, memory: 256Mi }
            limits: { memory: 512Mi }
          readinessProbe:
            httpGet: { path: /ready, port: 8080 }
          livenessProbe:
            httpGet: { path: /health, port: 8080 }
```

- Les **demandes** sont ce que l'ordonnanceur réserve ; les **limites** plafonnent l'usage (au-delà de la limite mémoire, le conteneur est tué).
- `maxSurge: 1` et `maxUnavailable: 0` ajoutent un nouveau Pod à la fois et ne descendent jamais sous le nombre voulu.
- Les sondes conditionnent le trafic et redémarrent les conteneurs bloqués.

### Empaquetage et configuration

- **Helm** rend des modèles avec des valeurs en charts, avec un historique des releases : bien pour distribuer un logiciel.
- **Kustomize** (intégré à `kubectl apply -k`) applique des patchs à du YAML simple par des overlays par environnement.
- Les **Secrets** ne sont que du base64 par défaut : protège-les par RBAC et chiffrement au repos, ou synchronise-les depuis un gestionnaire de secrets.

### Disponibilité et identité

- Un **PodDisruptionBudget** limite combien de Pods les interruptions volontaires (mises à jour de nœuds) peuvent arrêter à la fois.
- Les **taints et tolerations** réservent des nœuds ; l'**affinité** répartit les réplicas entre zones.
- Sur GKE, **Workload Identity** donne à chaque compte de service Kubernetes ses propres permissions IAM, sans fichier de clé.
- Les **classes QoS** découlent des demandes et limites : les Pods Guaranteed sont évincés en dernier en cas de manque de mémoire.

### Opérateurs et arrêt

Un **opérateur** est un contrôleur avec des ressources personnalisées qui code comment faire tourner une application (sauvegardes, bascule, mises à jour). À l'arrêt, un Pod reçoit SIGTERM et dispose de `terminationGracePeriodSeconds` (30 par défaut) pour finir les requêtes en cours avant SIGKILL ; une courte pause `preStop` couvre le moment où les endpoints se mettent encore à jour.

**À retenir.** Des Deployments pour les Pods, des Services pour les adresses, des sondes pour le trafic, des demandes pour l'ordonnancement ; empaquette avec Helm ou Kustomize ; garde les secrets hors des manifestes en clair ; gère SIGTERM.

## Partie 7 — GitOps et plateformes gérées

### Le GitOps

Le GitOps garde l'état voulu des systèmes dans Git et laisse un agent (Argo CD, Flux) l'appliquer en continu. Les changements de la production deviennent des pull requests : relues, enregistrées, annulables. L'agent annule aussi les changements manuels (la dérive) quand l'auto-réparation est activée.

| | Par poussée | Par tirage |
|---|---|---|
| Qui applique | La CI, qui détient les identifiants du cluster | Un agent dans le cluster |
| Dérive | Pas vue avant le déploiement suivant | Détectée et corrigée en continu |
| Convient à | Les plateformes sans agent, comme Cloud Run | Les clusters Kubernetes |

Les environnements sont des dossiers ou des overlays dans un dépôt de configuration ; la **promotion** est une pull request qui change le digest de l'image dans l'environnement suivant. Des outils (image automation de Flux, Argo CD Image Updater) peuvent ouvrir ces pull requests. Les **secrets** ne sont committés que chiffrés (SOPS, Sealed Secrets) ou comme références résolues depuis un gestionnaire de secrets (External Secrets). Les **sync waves** et les hooks d'Argo CD ordonnent les ressources, par exemple un job de migration avant le Deployment.

Un cluster perdu entièrement se reconstruit depuis le code : Terraform pour le cluster, puis l'agent synchronise tout le reste. Seules les données ont besoin de sauvegardes, et toute la procédure doit être répétée.

### Les plateformes gérées

Des plateformes comme Cloud Run, App Runner, Azure Container Apps ou Fly.io font tourner ton conteneur et le mettent à l'échelle, même jusqu'à zéro ; tu renonces à l'accès aux nœuds et acceptes des limites de requêtes en échange de beaucoup moins de travail d'exploitation.

Sur **Cloud Run** :

- Chaque déploiement crée une **révision** immuable ; le trafic peut être partagé entre révisions, renvoyé vers une plus ancienne, ou tenu à zéro pour un candidat avec tag qui a sa propre URL.
- La **concurrence** est le nombre de requêtes simultanées par instance ; le **maximum d'instances** plafonne la mise à l'échelle, et les requêtes au-delà de la capacité attendent brièvement, puis reçoivent une 429.
- Le **minimum d'instances** supprime les démarrages à froid. Règle-le sur le service (`--min`), pas sur chaque révision (`--min-instances`), sinon chaque candidat avec tag garde une instance chaude, facturée.
- **Cloud Deploy** ajoute une promotion gérée à travers des cibles ordonnées, avec approbations et étapes canary.

Le workflow de release de Luma en est un exemple compact : construire l'image, lancer les migrations dans un job Cloud Run, déployer une révision `--no-traffic` avec le tag `candidate`, la vérifier, puis déplacer le trafic.

**À retenir.** Git comme source de vérité, un agent qui réconcilie, la promotion par pull request, des secrets chiffrés ou référencés ; sur Cloud Run, révisions et tags donnent les canaries et les retours arrière instantanés.

## Partie 8 — L'exploitation

### L'observabilité

- Les **métriques** montrent que quelque chose ne va pas : débit de requêtes, taux d'erreurs, percentiles de latence, saturation.
- Les **journaux** expliquent ce qui s'est passé à un endroit ; les conteneurs les écrivent sur la sortie standard, en JSON structuré.
- Les **traces** suivent une requête à travers les services.

OpenTelemetry normalise la collecte des trois. Les points de contrôle de santé permettent aux plateformes de contourner et redémarrer les instances malades.

### SLI, SLO et budgets d'erreur

Un **SLI** est ce qu'on mesure (la part des requêtes servies avec succès en moins de 300 ms), un **SLO** l'objectif (99,9 pour cent sur 30 jours), un **SLA** un contrat avec des conséquences. Un SLO de 99,9 pour cent sur 30 jours laisse un **budget d'erreur** de 43,2 minutes ; 99,99 pour cent en laisse environ 4,3. Quand le budget est dépensé, une politique convenue ralentit les versions risquées jusqu'à ce qu'il se reconstitue.

Alerte sur les symptômes que ressentent les utilisateurs, pas sur chaque cause. Les **alertes de consommation** préviennent quand le budget se dépense assez vite pour s'épuiser (par exemple 14,4 fois le rythme soutenable pendant une heure dépense 2 pour cent d'un budget de 30 jours), avec une fenêtre courte pour cesser d'alerter après le rétablissement.

### La performance de livraison

Les quatre métriques **DORA** mesurent la livraison : la fréquence de déploiement et le délai des changements (le débit), le taux d'échec des changements et le temps de rétablissement du service (la stabilité). La recherche derrière elles montre que les bonnes équipes améliorent les deux ensemble, ce que permettent de petits changements fréquents.

### Les incidents

- Atténue d'abord (retour arrière, bascule), cherche la cause racine ensuite.
- Les rôles : un responsable d'incident coordonne, un responsable des opérations débogue, un responsable de la communication informe les utilisateurs.
- Les **runbooks** liés depuis les alertes donnent les étapes pour les situations connues.
- Les **post-mortems sans reproche** demandent comment le système a permis qu'une action raisonnable fasse du mal, et suivent les actions jusqu'à leur achèvement.

### Secrets, labeur et résilience

- Les services lisent les secrets dans un gestionnaire de secrets par leur propre identité ; rien de secret ne vit dans les images ni dans Git.
- Le **labeur** est un travail manuel, répétitif, automatisable, qui grandit avec le service ; plafonne-le et supprime-le par l'ingénierie.
- Le **chaos engineering** injecte des pannes contrôlées pour vérifier que systèmes et personnes tiennent.
- Le **RPO** (les données qu'on peut perdre) et le **RTO** (le temps de reprise) ne sont réels que si les restaurations sont répétées.

**À retenir.** Mesure ce que ressentent les utilisateurs, fixe des SLO et dépense le budget d'erreur délibérément, alerte sur la consommation, suis DORA, conduis des incidents sans reproche, et répète la reprise.

## Exercices

1. Ton pipeline reconstruit l'image pour la production après le succès du staging. Qu'est-ce qui ne va pas, et que doit-il faire à la place ?
2. Réécris un `Dockerfile` Node à une seule étape qui tourne en root avec `CMD npm start` en un meilleur. Liste trois changements.
3. Un canary à 10 pour cent montre 4 pour cent d'erreurs contre 0,5 pour cent sur l'ancienne version. Que se passe-t-il ensuite, idéalement sans intervention humaine ?
4. Une colonne `email` doit passer dans une nouvelle table `contacts`. Esquisse les étapes expand/contract.
5. Un collègue renomme une ressource dans Terraform et le plan montre `-/+` sur une base de données. Que fais-tu ?
6. Trois buckets sont créés avec `count` à partir d'une liste. Quelqu'un retire le premier nom. Que montre le plan, et comment l'éviter ?
7. Écris les champs minimaux d'un Deployment qui garde trois réplicas, ne descend jamais sous trois pendant le déploiement, et conditionne le trafic à `/ready`.
8. Ton service a un SLO de 99,9 pour cent sur 30 jours et a déjà été indisponible 35 minutes ce mois-ci. Combien reste-t-il de budget, et que suggère la politique ?

### Réponses

1. Il livre un artefact que personne n'a testé. Construis une fois, pousse avec une version et un digest, déploie ce digest en staging, puis promeus le même digest en production ; seule la configuration diffère.
2. Un build multi-étapes, les manifestes de dépendances copiés avant le code, `USER node`, et la forme exec `CMD ["node", "dist/server.js"]` ; aussi un `.dockerignore`.
3. Le trafic retourne vers l'ancienne version et la mise en production s'arrête ; l'analyse automatique des canaries compare canary et référence et revient en arrière d'elle-même.
4. Créer `contacts` ; écrire aux deux endroits et remplir l'existant ; lire depuis `contacts` ; cesser d'écrire `email` ; supprimer la colonne dans une version ultérieure.
5. Arrête-toi : ajoute un bloc `moved` de l'ancienne adresse vers la nouvelle, refais le plan et attends-toi à aucun changement ; si le remplacement vient d'un argument immuable, repense le changement.
6. Les deux buckets restants changent d'index et sont prévus pour destruction et recréation. Utilise `for_each` sur un ensemble de noms, avec des blocs `moved` pour migrer les instances existantes.
7. Voir le Deployment de la partie 6 : `replicas: 3`, `maxSurge: 1`, `maxUnavailable: 0`, une `readinessProbe` sur `/ready`.
8. 43,2 moins 35 laisse environ 8 minutes ; la politique suggère de geler les versions risquées et de travailler la fiabilité jusqu'à ce que le budget se reconstitue.

## Sources

Pages de référence pour chaque partie. Outils et limites changent : vérifie la page avant de te fier à un détail.

| Partie | Pages |
|---|---|
| 1 | [The Twelve-Factor App](https://12factor.net/) · [SLSA](https://slsa.dev/) |
| 2 | [Référence du Dockerfile](https://docs.docker.com/reference/dockerfile/) · [Spécification des images OCI](https://github.com/opencontainers/image-spec) |
| 3 | [Argo Rollouts](https://argoproj.github.io/rollouts/) · [Cloud Run : déploiements et migration du trafic](https://cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration) |
| 4 | [Open Policy Agent](https://www.openpolicyagent.org/) · [Crossplane](https://www.crossplane.io/) |
| 5 | [Le langage Terraform](https://developer.hashicorp.com/terraform/language) · [OpenTofu](https://opentofu.org/) |
| 6 | [Documentation de Kubernetes](https://kubernetes.io/docs/home/) · [Gateway API](https://gateway-api.sigs.k8s.io/) |
| 7 | [Principes OpenGitOps](https://opengitops.dev/) · [Argo CD](https://argo-cd.readthedocs.io/) · [Documentation de Cloud Run](https://cloud.google.com/run/docs) |
| 8 | [Les livres SRE de Google](https://sre.google/books/) · [DORA](https://dora.dev/) · [OpenTelemetry](https://opentelemetry.io/) |
