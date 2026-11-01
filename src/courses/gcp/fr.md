# Google Cloud — l'essentiel du test

## Comment utiliser ce cours

Ce cours accompagne le test Google Cloud. Il suit la liste de contrôle d'une équipe plateforme : qui possède quoi, qui peut faire quoi, comment circule le trafic, où tournent les charges de travail et comment les données sont conservées. Les commandes utilisent `gcloud` ; lancez-les dans Cloud Shell sur un projet de test.

| Niveau | Ce qu'il demande |
|---|---|
| Débutant | Projets, régions et zones, rôles, VPC, Compute Engine et Cloud Storage |
| Intermédiaire | IAM en pratique, comptes de service, règles de pare-feu, Cloud Run, classes de stockage |
| Avancé | Héritage, emprunt d'identité, règles d'administration, équilibrage de charge, GKE, Terraform |
| Expert | Stratégies de refus, fédération d'identité de charge de travail, VPC Service Controls, pare-feu hiérarchiques, conception de la disponibilité |

## Partie 1 — La hiérarchie des ressources

Les ressources sont dans des **projets** ; les projets dans des **dossiers**, sous une seule **organisation** liée à un domaine. La facturation est rattachée projet par projet. Les stratégies posées sur un nœud sont héritées par tout ce qui se trouve en dessous. Les règles d'administration restreignent ce qui peut être configuré — par exemple `constraints/iam.allowedPolicyMemberDomains` limite le partage à votre domaine, et `constraints/gcp.resourceLocations` limite les régions. Une landing zone met en place cette hiérarchie, le réseau partagé, la journalisation et les garde-fous avant l'arrivée de la première charge de travail.

## Partie 2 — IAM

Une liaison accorde un **rôle** à un **principal** sur une **ressource**. Les rôles de base (Owner, Editor, Viewer) sont trop larges ; les rôles prédéfinis comme `roles/storage.objectViewer` correspondent à un service ; les rôles personnalisés listent des autorisations précises. Les stratégies d'autorisation sont héritées et s'additionnent : un droit accordé sur le dossier ne peut pas être retiré sur le projet. Les stratégies de refus sont évaluées avant les stratégies d'autorisation et l'emportent. Les conditions restreignent un droit selon l'heure, le nom de la ressource ou un tag.

```bash
gcloud projects add-iam-policy-binding my-project \
  --member="group:data-readers@example.com" \
  --role="roles/bigquery.dataViewer"
```

Accordez aux groupes, pas aux utilisateurs individuels, et préférez le rôle le plus étroit au niveau le plus bas.

## Partie 3 — Les comptes de service

Un compte de service est une identité pour du code. Attachez-le à la charge de travail — une VM, un service Cloud Run — et le code obtient des identifiants de courte durée auprès du serveur de métadonnées ; évitez les clés téléchargeables. Un utilisateur qui a `roles/iam.serviceAccountTokenCreator` peut **emprunter l'identité** d'un compte de service pour agir en son nom, ce qui est auditable et ne demande aucune clé. Les charges de travail hors de Google Cloud — GitHub Actions, AWS, un cluster sur site — utilisent la **fédération d'identité de charge de travail** pour échanger leurs propres jetons contre des identifiants Google.

## Partie 4 — La sécurité

Cloud Audit Logs enregistre l'activité d'administration (toujours active), l'accès aux données (à activer) et les refus de stratégie. Security Command Center rassemble les constats. Secret Manager stocke les secrets avec versions et IAM ; Cloud KMS gère les clés de chiffrement, y compris les clés gérées par le client pour le stockage et les bases de données. **VPC Service Controls** trace un périmètre autour de services comme Cloud Storage et BigQuery, si bien que les données ne peuvent pas être copiées à l'extérieur, même avec des identifiants valides.

## Partie 5 — Le réseau

Un réseau VPC est mondial ; ses **sous-réseaux** sont régionaux, chacun avec une plage d'adresses IP. Un `/24` donne 256 adresses, dont Google en réserve 4 : 252 sont donc utilisables. Les règles de pare-feu s'appliquent à tout le réseau, sélectionnent les instances par tag ou par compte de service, et sont évaluées par priorité (le plus petit nombre d'abord) ; les règles implicites autorisent toute sortie et refusent toute entrée. Les stratégies de pare-feu hiérarchiques s'appliquent depuis l'organisation ou un dossier et peuvent déléguer aux règles du VPC avec `goto_next`.

Connectivité : l'appairage de VPC relie deux réseaux, le VPC partagé permet à des projets de service d'utiliser le réseau d'un projet hôte, Cloud VPN et Interconnect rejoignent le site, Cloud NAT donne un accès sortant aux VM privées. L'équilibreur de charge d'application externe global sert le HTTP(S) depuis une seule IP anycast ; les équilibreurs de charge réseau laissent passer TCP et UDP.

## Partie 6 — Le calcul

| Service | Quand |
|---|---|
| Compute Engine | Contrôle complet d'une VM, n'importe quel logiciel |
| Cloud Run | Un conteneur qui répond à des requêtes et descend à zéro |
| GKE | Beaucoup de conteneurs, les fonctions de Kubernetes, des services de longue durée |
| Cloud Run functions | Une petite fonction déclenchée par un événement |

Les groupes d'instances gérés recréent les VM défaillantes et s'adaptent à la charge. Cloud Run s'adapte selon le nombre de requêtes simultanées par instance ; un nombre minimal d'instances évite les démarrages à froid. GKE Autopilot gère les nœuds pour vous ; Standard vous les laisse.

## Partie 7 — Stockage et protection des données

Les classes de Cloud Storage échangent le prix du stockage contre celui de l'accès : Standard, Nearline (30 jours minimum), Coldline (90), Archive (365). Les règles de cycle de vie déplacent ou suppriment les objets selon leur âge. Utilisez l'accès uniforme au niveau du bucket pour que l'IAM seule contrôle l'accès, et des URL signées pour un partage temporaire. Le versionnage des objets et les règles de conservation protègent contre la suppression ; une règle de conservation verrouillée ne peut pas être raccourcie. Bases de données : Cloud SQL pour PostgreSQL et MySQL, Spanner pour l'échelle mondiale, Firestore pour les documents, BigQuery pour l'analyse.

## Partie 8 — L'exploitation

`gcloud config set project`, `gcloud auth login` et `gcloud auth application-default login` configurent les outils. Terraform décrit l'infrastructure sous forme de code ; gardez son état dans un bucket Cloud Storage avec versionnage. Cloud Monitoring et Cloud Logging collectent métriques et journaux ; les règles d'alerte préviennent au-delà d'un seuil. La fiabilité se conçoit par région : les ressources zonales tombent avec leur zone, les régionales survivent à la perte d'une zone, et les architectures multirégionales à celle d'une région. Un SLO avec un budget d'erreur décide quand livrer et quand corriger.

## Sources

| Thème | Référence gratuite |
|---|---|
| Tous les services | [Documentation Google Cloud](https://cloud.google.com/docs) |
| IAM | [Présentation de l'IAM](https://cloud.google.com/iam/docs/overview) |
| Le réseau | [Présentation du VPC](https://cloud.google.com/vpc/docs/overview) |
| L'architecture | [Google Cloud Architecture Framework](https://cloud.google.com/architecture/framework) |
| La fiabilité | [Les livres SRE de Google](https://sre.google/books/) |
