/**
 * Google Cloud, Avancé: a landing zone, deny policies and principal access
 * boundaries, federation instead of keys, perimeters and keys (VPC Service
 * Controls, KMS, IAP), load balancing and hybrid links, GKE security, data
 * protection, reliability.
 */
import type { LinuxQuestion as GcpQuestion } from "../linux/types";

const landingZone: GcpQuestion[] = [
  {
    id: "gc-lz-01",
    q: ["A common folder layout for an organisation's landing zone?", "Une organisation courante des dossiers pour la landing zone d'une organisation ?", "¿Una organización habitual de carpetas para la landing zone de una organización?"],
    a: ["Folders per environment (prod, non-prod) or business unit, with shared projects (networking, logging, security) apart", "Des dossiers par environnement (prod, hors prod) ou par entité, avec des projets communs à part (réseau, journalisation, sécurité)", "Carpetas por entorno (prod, no prod) o unidad de negocio, con proyectos comunes aparte (red, registros, seguridad)"],
    w: [["One project for the whole company", "Un seul projet pour toute l'entreprise", "Un solo proyecto para toda la empresa"], ["One folder per developer", "Un dossier par développeur", "Una carpeta por desarrollador"], ["Projects directly under the organisation, no folders, to avoid inheritance", "Des projets directement sous l'organisation, sans dossiers, pour éviter l'héritage", "Proyectos directamente bajo la organización, sin carpetas, para evitar la herencia"]],
    e: [
      "Folders are where policies attach: stricter organisation policies and fewer grants on prod, broader ones on sandboxes. Shared VPC host projects, the log sink's destination and the security tooling live in dedicated projects owned by platform teams. Google's enterprise foundations blueprint describes one such layout in Terraform.",
      "Les dossiers sont les points d'attache des stratégies : règles d'administration plus strictes et moins d'attributions sur la prod, plus larges sur les bacs à sable. Projets hôtes Shared VPC, destination du récepteur de journaux et outils de sécurité vivent dans des projets dédiés, tenus par les équipes plateforme. Le blueprint « enterprise foundations » de Google décrit une telle organisation en Terraform.",
      "Las carpetas son donde se asocian las políticas: políticas de organización más estrictas y menos concesiones en prod, más amplias en los entornos de prueba. Los proyectos host de Shared VPC, el destino del receptor de registros y las herramientas de seguridad viven en proyectos dedicados, de los equipos de plataforma. El blueprint «enterprise foundations» de Google describe una organización así en Terraform.",
    ],
  },
  {
    id: "gc-lz-02",
    q: ["Why use Resource Manager tags (not labels) to mark production resources for IAM conditions?", "Pourquoi utiliser des tags Resource Manager (et non des labels) pour marquer les ressources de production dans les conditions IAM ?", "¿Por qué usar tags de Resource Manager (y no labels) para marcar los recursos de producción en condiciones de IAM?"],
    a: ["Attaching a tag needs its own IAM permission, and tags are inherited: a project owner cannot simply relabel a resource to escape the condition", "Attacher un tag demande sa propre permission IAM, et les tags sont hérités : un propriétaire de projet ne peut pas simplement réétiqueter une ressource pour échapper à la condition", "Asociar un tag requiere su propio permiso de IAM, y los tags se heredan: un propietario de proyecto no puede reetiquetar un recurso para escapar de la condición"],
    w: [["Labels are not visible in the console", "Les labels ne sont pas visibles dans la console", "Las labels no se ven en la consola"], ["Tags are free and labels are billed", "Les tags sont gratuits et les labels facturés", "Los tags son gratis y las labels se facturan"], ["Labels only exist on VMs", "Les labels n'existent que sur les VM", "Las labels solo existen en las VM"]],
    e: [
      "A condition such as `resource.matchTag(\"123/env\", \"prod\")` is only as trustworthy as the control over who sets the tag. Tag keys and values are defined at the organisation or project, and `roles/resourcemanager.tagUser` is granted on the value. Deny policy conditions recognise only tags.",
      "Une condition comme `resource.matchTag(\"123/env\", \"prod\")` ne vaut que par le contrôle de qui pose le tag. Les clés et valeurs de tags se définissent au niveau de l'organisation ou du projet, et `roles/resourcemanager.tagUser` s'accorde sur la valeur. Les conditions des stratégies de refus ne reconnaissent que les tags.",
      "Una condición como `resource.matchTag(\"123/env\", \"prod\")` solo es tan fiable como el control de quién pone el tag. Las claves y valores de tags se definen en la organización o el proyecto, y `roles/resourcemanager.tagUser` se concede sobre el valor. Las condiciones de las políticas de denegación solo reconocen tags.",
    ],
  },
  {
    id: "gc-lz-03",
    q: ["Before enforcing a new organisation policy across thousands of projects, how is its impact checked?", "Avant d'imposer une nouvelle règle d'administration sur des milliers de projets, comment vérifier son impact ?", "Antes de imponer una política de organización nueva en miles de proyectos, ¿cómo se comprueba su impacto?"],
    a: ["Set it in dry-run mode first: violations are logged, nothing is blocked", "La poser d'abord en mode simulation (dry-run) : les violations sont journalisées, rien n'est bloqué", "Ponerla primero en modo de prueba (dry-run): las infracciones se registran, nada se bloquea"],
    w: [["Enforce it on Friday evening and watch tickets", "L'imposer le vendredi soir et surveiller les tickets", "Imponerla el viernes por la tarde y vigilar los tickets"], ["There is no way: policies are all or nothing", "Impossible : les règles sont tout ou rien", "No hay forma: las políticas son todo o nada"], ["Apply it to the billing account first", "L'appliquer d'abord au compte de facturation", "Aplicarla primero a la cuenta de facturación"]],
    e: [
      "Dry-run policies produce audit log entries for what would have been denied, so teams can fix configurations or request exceptions before enforcement. Policy Simulator offers a similar preview for IAM changes.",
      "Les règles en simulation produisent des entrées de journal d'audit pour ce qui aurait été refusé : les équipes corrigent leurs configurations ou demandent des exceptions avant l'application. Policy Simulator offre un aperçu semblable pour les changements IAM.",
      "Las políticas en modo de prueba generan entradas de auditoría de lo que se habría denegado, así los equipos corrigen configuraciones o piden excepciones antes de aplicarlas. Policy Simulator ofrece una vista previa parecida para cambios de IAM.",
    ],
  },
  {
    id: "gc-lz-04",
    q: ["Where can a project's data be stored, and how is that restricted to Switzerland and the EU?", "Où les données d'un projet peuvent-elles être stockées, et comment limiter cela à la Suisse et à l'UE ?", "¿Dónde se pueden guardar los datos de un proyecto, y cómo se limita a Suiza y la UE?"],
    a: ["Anywhere by default; the organisation policy `gcp.resourceLocations` limits the regions where resources can be created", "N'importe où par défaut ; la règle d'administration `gcp.resourceLocations` limite les régions où créer des ressources", "En cualquier sitio por defecto; la política de organización `gcp.resourceLocations` limita las regiones donde se pueden crear recursos"],
    w: [["Only in the region of the billing address", "Seulement dans la région de l'adresse de facturation", "Solo en la región de la dirección de facturación"], ["By choosing the project's default zone", "En choisissant la zone par défaut du projet", "Eligiendo la zona predeterminada del proyecto"], ["It cannot be restricted", "Cela ne peut pas être restreint", "No se puede restringir"]],
    e: [
      "The constraint takes regions or value groups (`in:eu-locations`) and applies to services that support it when resources are created; existing resources stay where they are. Global services and some metadata may still be processed elsewhere, which matters for compliance reviews.",
      "La contrainte prend des régions ou des groupes de valeurs (`in:eu-locations`) et s'applique, pour les services compatibles, à la création des ressources ; les ressources existantes restent où elles sont. Les services globaux et certaines métadonnées peuvent encore être traités ailleurs, ce qui compte lors des revues de conformité.",
      "La restricción admite regiones o grupos de valores (`in:eu-locations`) y se aplica, en los servicios compatibles, al crear recursos; los existentes se quedan donde están. Los servicios globales y ciertos metadatos pueden procesarse en otro sitio, lo que importa en las revisiones de cumplimiento.",
    ],
  },
];

const iamAdvanced: GcpQuestion[] = [
  {
    id: "gc-iama-01",
    q: ["Where can an IAM deny policy be attached?", "Où peut-on attacher une stratégie de refus IAM ?", "¿Dónde se puede asociar una política de denegación de IAM?"],
    a: ["To an organisation, a folder or a project; it is inherited by everything below", "À une organisation, un dossier ou un projet ; elle est héritée par tout ce qui est en dessous", "A una organización, una carpeta o un proyecto; la hereda todo lo que hay debajo"],
    w: [["To any resource, buckets included", "À n'importe quelle ressource, buckets compris", "A cualquier recurso, buckets incluidos"], ["Only to the organisation", "Seulement à l'organisation", "Solo a la organización"], ["To a principal, like a role", "À un principal, comme un rôle", "A un principal, como un rol"]],
    e: [
      "Deny policies are attached through the IAM v2 API, up to 500 per resource. They name denied principals, optional exception principals, denied permissions in the v2 form (`storage.googleapis.com/objects.delete`), and optional conditions, which can only use tags. Not every permission can be denied.",
      "Les stratégies de refus s'attachent via l'API IAM v2, jusqu'à 500 par ressource. Elles nomment les principaux refusés, d'éventuels principaux en exception, les permissions refusées sous la forme v2 (`storage.googleapis.com/objects.delete`) et d'éventuelles conditions, qui ne peuvent porter que sur des tags. Toutes les permissions ne peuvent pas être refusées.",
      "Las políticas de denegación se asocian con la API v2 de IAM, hasta 500 por recurso. Nombran los principales denegados, principales de excepción opcionales, los permisos denegados en forma v2 (`storage.googleapis.com/objects.delete`) y condiciones opcionales, que solo pueden usar tags. No todos los permisos se pueden denegar.",
    ],
  },
  {
    id: "gc-iama-02",
    q: ["In which order does IAM evaluate principal access boundary, deny and allow policies?", "Dans quel ordre IAM évalue-t-il les limites d'accès des principaux, les refus et les autorisations ?", "¿En qué orden evalúa IAM los límites de acceso de principales, las denegaciones y los permisos?"],
    a: ["Principal access boundary first, then deny, then allow: any of them saying no blocks the access", "D'abord la limite d'accès des principaux, puis le refus, puis l'autorisation : n'importe lequel qui dit non bloque l'accès", "Primero el límite de acceso de principales, luego la denegación, luego el permiso: cualquiera que diga no bloquea el acceso"],
    w: [["Allow first; deny only if nothing is allowed", "D'abord l'autorisation ; le refus seulement si rien n'est autorisé", "Primero el permiso; la denegación solo si no se permite nada"], ["The most specific policy wins, whatever its type", "La stratégie la plus précise gagne, quel que soit son type", "Gana la política más específica, sea del tipo que sea"], ["Deny first, then boundary, then allow, and a later allow overrides", "D'abord le refus, puis la limite, puis l'autorisation, et une autorisation ultérieure l'emporte", "Primero la denegación, luego el límite, luego el permiso, y un permiso posterior prevalece"]],
    e: [
      "A principal access boundary (PAB) says which resources a set of principals is eligible to access at all, whatever roles they hold elsewhere: a way to stop your users from using another organisation's resources. Deny then removes specific permissions; allow must finally grant them.",
      "Une limite d'accès des principaux (PAB) dit à quelles ressources un ensemble de principaux peut avoir accès, quels que soient les rôles qu'ils détiennent ailleurs : un moyen d'empêcher vos utilisateurs d'utiliser les ressources d'une autre organisation. Le refus retire ensuite des permissions précises ; l'autorisation doit enfin les accorder.",
      "Un límite de acceso de principales (PAB) dice a qué recursos puede acceder un conjunto de principales, tengan los roles que tengan en otro sitio: una forma de impedir que tus usuarios usen recursos de otra organización. La denegación quita luego permisos concretos; el permiso debe finalmente concederlos.",
    ],
  },
  {
    id: "gc-iama-03",
    q: ["Engineers need Owner on production only during incidents. What does Google Cloud provide?", "Des ingénieurs ont besoin d'Owner en production seulement pendant les incidents. Que fournit Google Cloud ?", "Los ingenieros necesitan Owner en producción solo durante incidentes. ¿Qué ofrece Google Cloud?"],
    a: ["Privileged Access Manager: entitlements requested just in time, with a justification, optional approval and a time limit", "Privileged Access Manager : des droits demandés juste à temps, avec justification, approbation éventuelle et limite de durée", "Privileged Access Manager: derechos pedidos justo a tiempo, con justificación, aprobación opcional y límite de tiempo"],
    w: [["A shared break-glass password in a wiki", "Un mot de passe d'urgence partagé dans un wiki", "Una contraseña de emergencia compartida en una wiki"], ["Permanent Owner, reviewed yearly", "Owner permanent, revu chaque année", "Owner permanente, revisado cada año"], ["A second organisation for incidents", "Une seconde organisation pour les incidents", "Una segunda organización para incidentes"]],
    e: [
      "PAM grants a temporary conditional binding when an entitlement is approved and removes it at expiry; requests and grants are audited. Standing privileged access is the opposite of least privilege in time. Keep break-glass accounts for when PAM itself is unavailable, tightly monitored.",
      "PAM accorde une liaison conditionnelle temporaire quand un droit est approuvé et la retire à l'expiration ; demandes et attributions sont auditées. Un accès privilégié permanent est l'opposé du moindre privilège dans le temps. Garder des comptes d'urgence pour le cas où PAM lui-même est indisponible, étroitement surveillés.",
      "PAM concede una vinculación condicional temporal cuando se aprueba un derecho y la quita al caducar; peticiones y concesiones se auditan. Un acceso privilegiado permanente es lo contrario del mínimo privilegio en el tiempo. Mantener cuentas de emergencia para cuando PAM no esté disponible, muy vigiladas.",
    ],
  },
  {
    id: "gc-iama-04",
    q: ["Employees sign in with an external identity provider (Entra ID, Okta) and are not synchronised to Cloud Identity. How can they use Google Cloud?", "Les employés se connectent avec un fournisseur d'identité externe (Entra ID, Okta) et ne sont pas synchronisés dans Cloud Identity. Comment peuvent-ils utiliser Google Cloud ?", "Los empleados inician sesión con un proveedor de identidad externo (Entra ID, Okta) y no se sincronizan con Cloud Identity. ¿Cómo pueden usar Google Cloud?"],
    a: ["Workforce Identity Federation: a workforce pool trusts the provider, and roles go to `principalSet://` identifiers built from its attributes", "La fédération d'identité des employés : un pool d'employés fait confiance au fournisseur, et les rôles vont à des identifiants `principalSet://` construits sur ses attributs", "La federación de identidades de personal: un pool de personal confía en el proveedor, y los roles van a identificadores `principalSet://` construidos con sus atributos"],
    w: [["They cannot: every user needs a Google account", "Impossible : chaque utilisateur doit avoir un compte Google", "Imposible: cada usuario necesita una cuenta de Google"], ["By sharing one service account key", "En partageant une clé de compte de service", "Compartiendo una clave de cuenta de servicio"], ["With Workload Identity Federation for GKE", "Avec la fédération d'identité de charge de travail pour GKE", "Con la federación de identidades de cargas de trabajo para GKE"]],
    e: [
      "Workforce pools sit at the organisation and map the provider's claims (groups, department) to attributes; a binding can target a whole group of the external directory. Workload Identity Federation is the counterpart for machines (CI, other clouds).",
      "Les pools d'employés se trouvent au niveau de l'organisation et font correspondre les attributs du fournisseur (groupes, service) ; une liaison peut viser tout un groupe de l'annuaire externe. La fédération d'identité de charge de travail est l'équivalent pour les machines (CI, autres clouds).",
      "Los pools de personal están en la organización y asignan las afirmaciones del proveedor (grupos, departamento) a atributos; una vinculación puede apuntar a todo un grupo del directorio externo. La federación de identidades de cargas de trabajo es el equivalente para máquinas (CI, otras nubes).",
    ],
  },
  {
    id: "gc-iama-05",
    q: ["A team should manage only buckets whose names start with `team-a-`. How is that expressed in IAM?", "Une équipe ne doit gérer que les buckets dont le nom commence par `team-a-`. Comment l'exprimer dans IAM ?", "Un equipo solo debe gestionar los buckets cuyo nombre empieza por `team-a-`. ¿Cómo se expresa en IAM?"],
    a: ["A conditional binding on the project with `resource.name.startsWith(\"projects/_/buckets/team-a-\")`", "Une liaison conditionnelle sur le projet avec `resource.name.startsWith(\"projects/_/buckets/team-a-\")`", "Una vinculación condicional en el proyecto con `resource.name.startsWith(\"projects/_/buckets/team-a-\")`"],
    w: [["A custom role named `team-a-storage`", "Un rôle personnalisé nommé `team-a-storage`", "Un rol personalizado llamado `team-a-storage`"], ["A label `team=a` on the buckets", "Un label `team=a` sur les buckets", "Una label `team=a` en los buckets"], ["It cannot be expressed: grant on each bucket", "Inexprimable : accorder sur chaque bucket", "No se puede expresar: conceder en cada bucket"]],
    e: [
      "Conditions on `resource.name` match the resource's full name, whose form depends on the service (for Cloud Storage, `projects/_/buckets/NAME/objects/…`). Some permissions, such as listing buckets, are checked on the project, not on a named bucket, so the condition must allow for that or grant listing separately.",
      "Les conditions sur `resource.name` portent sur le nom complet de la ressource, dont la forme dépend du service (pour Cloud Storage, `projects/_/buckets/NAME/objects/…`). Certaines permissions, comme lister les buckets, se vérifient sur le projet et non sur un bucket nommé : la condition doit en tenir compte, ou le listage s'accorde à part.",
      "Las condiciones sobre `resource.name` usan el nombre completo del recurso, cuya forma depende del servicio (en Cloud Storage, `projects/_/buckets/NAME/objects/…`). Algunos permisos, como listar buckets, se comprueban en el proyecto y no en un bucket con nombre, así que la condición debe preverlo o el listado se concede aparte.",
    ],
  },
];

const federation: GcpQuestion[] = [
  {
    id: "gc-fed-01",
    q: ["How does a GitHub Actions workflow deploy to Google Cloud without a service account key?", "Comment un workflow GitHub Actions déploie-t-il sur Google Cloud sans clé de compte de service ?", "¿Cómo despliega un workflow de GitHub Actions en Google Cloud sin clave de cuenta de servicio?"],
    a: ["Workload Identity Federation: a pool and OIDC provider trust GitHub's tokens, exchanged by STS for short-lived credentials", "La fédération d'identité de charge de travail : un pool et un fournisseur OIDC font confiance aux jetons de GitHub, échangés par STS contre des identifiants de courte durée", "La federación de identidades de cargas de trabajo: un pool y un proveedor OIDC confían en los tokens de GitHub, que STS intercambia por credenciales de corta duración"],
    w: [["It must store a JSON key as a repository secret", "Il doit stocker une clé JSON comme secret du dépôt", "Debe guardar una clave JSON como secreto del repositorio"], ["With the developer's password", "Avec le mot de passe du développeur", "Con la contraseña del desarrollador"], ["Google trusts any GitHub repository automatically", "Google fait confiance automatiquement à tout dépôt GitHub", "Google confía automáticamente en cualquier repositorio de GitHub"]],
    e: [
      "The provider maps claims (`assertion.repository`, `assertion.ref`) to attributes. The workflow then either impersonates a service account (`roles/iam.workloadIdentityUser` on it) or is granted roles directly as a `principalSet://` of the pool. Nothing long-lived is stored in GitHub.",
      "Le fournisseur fait correspondre les revendications (`assertion.repository`, `assertion.ref`) à des attributs. Le workflow emprunte ensuite un compte de service (`roles/iam.workloadIdentityUser` sur celui-ci) ou reçoit directement des rôles comme `principalSet://` du pool. Rien de durable n'est stocké chez GitHub.",
      "El proveedor asigna las afirmaciones (`assertion.repository`, `assertion.ref`) a atributos. Después el workflow suplanta una cuenta de servicio (`roles/iam.workloadIdentityUser` sobre ella) o recibe roles directamente como `principalSet://` del pool. No se guarda nada duradero en GitHub.",
    ],
  },
  {
    id: "gc-fed-02",
    q: ["Why must a GitHub OIDC provider in a workload identity pool have an attribute condition?", "Pourquoi un fournisseur OIDC GitHub dans un pool d'identités de charge de travail doit-il avoir une condition d'attribut ?", "¿Por qué un proveedor OIDC de GitHub en un pool de identidades de cargas de trabajo debe tener una condición de atributo?"],
    a: ["GitHub's issuer is shared by every repository: without a condition (on the owner or repository), any repository could get tokens the pool accepts", "L'émetteur de GitHub est partagé par tous les dépôts : sans condition (sur le propriétaire ou le dépôt), n'importe quel dépôt pourrait obtenir des jetons acceptés par le pool", "El emisor de GitHub lo comparten todos los repositorios: sin condición (sobre el propietario o el repositorio), cualquier repositorio podría obtener tokens que el pool acepta"],
    w: [["To make token exchange faster", "Pour accélérer l'échange de jetons", "Para acelerar el intercambio de tokens"], ["Conditions are only for billing", "Les conditions ne servent qu'à la facturation", "Las condiciones solo sirven para la facturación"], ["GitHub tokens are not signed", "Les jetons GitHub ne sont pas signés", "Los tokens de GitHub no están firmados"]],
    e: [
      "A condition such as `assertion.repository_owner == \"my-org\"` limits who can even enter the pool; bindings on specific `attribute.repository` values then limit what each repository may do. Without it, security rests on bindings alone, and one broad binding opens the door to strangers.",
      "Une condition comme `assertion.repository_owner == \"my-org\"` limite qui peut seulement entrer dans le pool ; des liaisons sur des valeurs précises de `attribute.repository` limitent ensuite ce que chaque dépôt peut faire. Sans elle, la sécurité ne repose que sur les liaisons, et une seule liaison trop large ouvre la porte à des inconnus.",
      "Una condición como `assertion.repository_owner == \"my-org\"` limita quién puede siquiera entrar en el pool; las vinculaciones sobre valores concretos de `attribute.repository` limitan después lo que puede hacer cada repositorio. Sin ella, la seguridad depende solo de las vinculaciones, y una sola demasiado amplia abre la puerta a desconocidos.",
    ],
  },
  {
    id: "gc-fed-03",
    q: ["A GKE pod must read a bucket. What is the recommended way?", "Un pod GKE doit lire un bucket. Quelle est la méthode recommandée ?", "Un pod de GKE debe leer un bucket. ¿Cuál es la forma recomendada?"],
    a: ["Workload Identity Federation for GKE: grant the role to the pod's Kubernetes service account as a `principal://` identifier", "La fédération d'identité de charge de travail pour GKE : accorder le rôle au compte de service Kubernetes du pod, sous la forme d'un identifiant `principal://`", "La federación de identidades de cargas de trabajo para GKE: conceder el rol a la cuenta de servicio de Kubernetes del pod, como identificador `principal://`"],
    w: [["Use the node's service account, shared by every pod on it", "Utiliser le compte de service du nœud, partagé par tous ses pods", "Usar la cuenta de servicio del nodo, compartida por todos sus pods"], ["Mount a JSON key as a Kubernetes secret", "Monter une clé JSON comme secret Kubernetes", "Montar una clave JSON como secreto de Kubernetes"], ["Make the bucket public inside the cluster", "Rendre le bucket public à l'intérieur du cluster", "Hacer público el bucket dentro del clúster"]],
    e: [
      "The identifier is `principal://iam.googleapis.com/projects/NUMBER/locations/global/workloadIdentityPools/PROJECT.svc.id.goog/subject/ns/NAMESPACE/sa/KSA`. Each workload gets its own identity, and the GKE metadata server stops pods from reaching the node's credentials. Linking to a Google service account by impersonation remains possible.",
      "L'identifiant est `principal://iam.googleapis.com/projects/NUMBER/locations/global/workloadIdentityPools/PROJECT.svc.id.goog/subject/ns/NAMESPACE/sa/KSA`. Chaque charge a sa propre identité, et le serveur de métadonnées de GKE empêche les pods d'atteindre les identifiants du nœud. Lier à un compte de service Google par emprunt d'identité reste possible.",
      "El identificador es `principal://iam.googleapis.com/projects/NUMBER/locations/global/workloadIdentityPools/PROJECT.svc.id.goog/subject/ns/NAMESPACE/sa/KSA`. Cada carga tiene su propia identidad, y el servidor de metadatos de GKE impide que los pods lleguen a las credenciales del nodo. Sigue siendo posible enlazar con una cuenta de servicio de Google por suplantación.",
    ],
  },
  {
    id: "gc-fed-04",
    q: ["A service account in project A must be attached to resources in project B. What stands in the way by default?", "Un compte de service du projet A doit être attaché à des ressources du projet B. Qu'est-ce qui l'empêche par défaut ?", "Una cuenta de servicio del proyecto A debe asociarse a recursos del proyecto B. ¿Qué lo impide por defecto?"],
    a: ["The organisation policy `iam.disableCrossProjectServiceAccountUsage`, which must be relaxed in project A", "La règle d'administration `iam.disableCrossProjectServiceAccountUsage`, qu'il faut assouplir dans le projet A", "La política de organización `iam.disableCrossProjectServiceAccountUsage`, que hay que relajar en el proyecto A"],
    w: [["Nothing ever: projects share service accounts freely", "Rien, jamais : les projets partagent librement les comptes de service", "Nada nunca: los proyectos comparten libremente las cuentas de servicio"], ["Service accounts cannot leave their project at all", "Les comptes de service ne peuvent jamais sortir de leur projet", "Las cuentas de servicio nunca pueden salir de su proyecto"], ["A firewall rule between the projects", "Une règle de pare-feu entre les projets", "Una regla de firewall entre los proyectos"]],
    e: [
      "Centralising service accounts in one project is a valid pattern, but it needs that constraint lifted where they live and Service Account User for the deployers. Granting roles in project B to a service account from A is always possible; attaching it to B's resources is what the constraint governs.",
      "Centraliser les comptes de service dans un projet est un modèle valable, mais il faut lever cette contrainte là où ils vivent et accorder Service Account User aux déployeurs. Accorder des rôles dans le projet B à un compte de service de A est toujours possible ; c'est l'attacher aux ressources de B que régit la contrainte.",
      "Centralizar las cuentas de servicio en un proyecto es un patrón válido, pero requiere levantar esa restricción donde viven y conceder Service Account User a quienes despliegan. Conceder roles en el proyecto B a una cuenta de servicio de A siempre es posible; lo que regula la restricción es asociarla a recursos de B.",
    ],
  },
  {
    id: "gc-fed-05",
    q: ["A legacy application outside any cloud truly needs a credential. What is better than a key with no expiry?", "Une application ancienne hors de tout cloud a vraiment besoin d'un identifiant. Quoi de mieux qu'une clé sans expiration ?", "Una aplicación antigua fuera de cualquier nube necesita de verdad una credencial. ¿Qué es mejor que una clave sin caducidad?"],
    a: ["Federation with its own identity (OIDC, SAML, X.509 certificates); failing that, a key with an enforced expiry, stored in a secret manager, monitored", "La fédération avec sa propre identité (OIDC, SAML, certificats X.509) ; à défaut, une clé avec expiration imposée, stockée dans un gestionnaire de secrets, surveillée", "La federación con su propia identidad (OIDC, SAML, certificados X.509); si no, una clave con caducidad impuesta, guardada en un gestor de secretos y vigilada"],
    w: [["A user's password in a configuration file", "Le mot de passe d'un utilisateur dans un fichier de configuration", "La contraseña de un usuario en un archivo de configuración"], ["An API key, which identifies a user", "Une clé d'API, qui identifie un utilisateur", "Una clave de API, que identifica a un usuario"], ["A key shared by all legacy applications", "Une clé partagée par toutes les applications anciennes", "Una clave compartida por todas las aplicaciones antiguas"]],
    e: [
      "Workload Identity Federation also accepts X.509 client certificates for workloads with no identity provider. When keys remain, the organisation policy `iam.serviceAccountKeyExpiryHours` limits their lifetime, and unused keys can be found through key usage insights.",
      "La fédération d'identité de charge de travail accepte aussi des certificats client X.509 pour les charges sans fournisseur d'identité. Quand des clés subsistent, la règle `iam.serviceAccountKeyExpiryHours` limite leur durée de vie, et les clés inutilisées se repèrent par les analyses d'usage des clés.",
      "La federación de identidades de cargas de trabajo también acepta certificados de cliente X.509 para cargas sin proveedor de identidad. Cuando quedan claves, la política `iam.serviceAccountKeyExpiryHours` limita su vida, y las claves sin uso se detectan con los análisis de uso de claves.",
    ],
  },
];

const perimeters: GcpQuestion[] = [
  {
    id: "gc-per-01",
    q: ["IAM is correct, yet a stolen credential could copy BigQuery data to an attacker's project. What addresses that?", "IAM est correct, mais un identifiant volé pourrait copier des données BigQuery vers le projet d'un attaquant. Qu'est-ce qui répond à ce risque ?", "IAM está bien, pero una credencial robada podría copiar datos de BigQuery al proyecto de un atacante. ¿Qué cubre ese riesgo?"],
    a: ["VPC Service Controls: a service perimeter blocks Google API calls that move data across its boundary", "VPC Service Controls : un périmètre de service bloque les appels d'API Google qui font sortir des données de ses limites", "VPC Service Controls: un perímetro de servicio bloquea las llamadas a API de Google que sacan datos fuera de sus límites"],
    w: [["A firewall rule denying egress on port 443", "Une règle de pare-feu refusant la sortie sur le port 443", "Una regla de firewall que deniega la salida por el puerto 443"], ["Customer-managed encryption keys alone", "Les clés de chiffrement gérées par le client, seules", "Las claves de cifrado gestionadas por el cliente, por sí solas"], ["Cloud Armor", "Cloud Armor", "Cloud Armor"]],
    e: [
      "IAM asks who; a perimeter asks from where and to where. Calls to protected services from outside (unless matching an access level or ingress rule) and copies to resources outside are refused even with valid credentials. Perimeters start in dry-run, since they easily break integrations.",
      "IAM demande qui ; un périmètre demande d'où et vers où. Les appels aux services protégés depuis l'extérieur (sauf niveau d'accès ou règle d'entrée correspondante) et les copies vers des ressources extérieures sont refusés, même avec des identifiants valides. Les périmètres démarrent en simulation, car ils cassent facilement des intégrations.",
      "IAM pregunta quién; un perímetro pregunta desde dónde y hacia dónde. Las llamadas a servicios protegidos desde fuera (salvo que coincidan con un nivel de acceso o una regla de entrada) y las copias a recursos de fuera se rechazan aun con credenciales válidas. Los perímetros empiezan en modo de prueba, porque rompen integraciones con facilidad.",
    ],
  },
  {
    id: "gc-per-02",
    q: ["A Cloud KMS key used for CMEK is rotated. What happens to data encrypted with the old version?", "Une clé Cloud KMS utilisée pour CMEK est renouvelée. Qu'advient-il des données chiffrées avec l'ancienne version ?", "Se rota una clave de Cloud KMS usada para CMEK. ¿Qué pasa con los datos cifrados con la versión antigua?"],
    a: ["It stays readable: old versions remain enabled for decryption, new data uses the new primary version", "Elles restent lisibles : les anciennes versions restent actives pour déchiffrer, les nouvelles données utilisent la nouvelle version principale", "Siguen legibles: las versiones antiguas siguen activas para descifrar, los datos nuevos usan la nueva versión principal"],
    w: [["It becomes unreadable at once", "Elles deviennent illisibles aussitôt", "Pasan a ser ilegibles al instante"], ["It is re-encrypted automatically within the hour, everywhere", "Elles sont rechiffrées automatiquement dans l'heure, partout", "Se vuelven a cifrar automáticamente en una hora, en todas partes"], ["Rotation is impossible for CMEK keys", "La rotation est impossible pour les clés CMEK", "La rotación es imposible para claves CMEK"]],
    e: [
      "Rotation adds a version; it does not destroy the old ones. Disabling or destroying a version is what cuts access, by design, to data encrypted with it. Separate duties: key administrators (`roles/cloudkms.admin`) should not be the ones using keys to decrypt data.",
      "La rotation ajoute une version ; elle ne détruit pas les anciennes. C'est désactiver ou détruire une version qui coupe l'accès, volontairement, aux données chiffrées avec elle. Séparer les rôles : les administrateurs de clés (`roles/cloudkms.admin`) ne devraient pas être ceux qui utilisent les clés pour déchiffrer.",
      "La rotación añade una versión; no destruye las antiguas. Desactivar o destruir una versión es lo que corta el acceso, a propósito, a los datos cifrados con ella. Separar funciones: los administradores de claves (`roles/cloudkms.admin`) no deberían ser quienes usan las claves para descifrar.",
    ],
  },
  {
    id: "gc-per-03",
    q: ["An internal web app behind a load balancer must be reachable only by employees, without a VPN. What fits?", "Une application web interne derrière un équilibreur doit être accessible aux seuls employés, sans VPN. Qu'est-ce qui convient ?", "Una app web interna tras un balanceador debe ser accesible solo para empleados, sin VPN. ¿Qué encaja?"],
    a: ["Identity-Aware Proxy on the backend service: each request is authenticated and authorised with IAM (`roles/iap.httpsResourceAccessor`)", "Identity-Aware Proxy sur le service de backend : chaque requête est authentifiée et autorisée par IAM (`roles/iap.httpsResourceAccessor`)", "Identity-Aware Proxy en el servicio de backend: cada petición se autentica y autoriza con IAM (`roles/iap.httpsResourceAccessor`)"],
    w: [["An allowlist of office IP addresses only", "Une liste blanche d'IP de bureaux uniquement", "Solo una lista de IP de las oficinas"], ["A password in the URL", "Un mot de passe dans l'URL", "Una contraseña en la URL"], ["Making the app public and hiding its link", "Rendre l'app publique et cacher son lien", "Hacer pública la app y ocultar su enlace"]],
    e: [
      "IAP applies zero-trust access: identity and context (with access levels: device, location) decide, not the network. The backend must accept traffic only from the load balancer, so IAP cannot be bypassed; the app can read the signed `x-goog-iap-jwt-assertion` header to know the user.",
      "IAP applique un accès zéro confiance : l'identité et le contexte (avec des niveaux d'accès : appareil, lieu) décident, pas le réseau. Le backend ne doit accepter que le trafic de l'équilibreur, pour qu'IAP ne puisse pas être contourné ; l'application peut lire l'en-tête signé `x-goog-iap-jwt-assertion` pour connaître l'utilisateur.",
      "IAP aplica un acceso de confianza cero: deciden la identidad y el contexto (con niveles de acceso: dispositivo, ubicación), no la red. El backend solo debe aceptar tráfico del balanceador, para que no se pueda saltar IAP; la app puede leer la cabecera firmada `x-goog-iap-jwt-assertion` para saber quién es el usuario.",
    ],
  },
  {
    id: "gc-per-04",
    q: ["Cloud Armor is attached where, and protects against what?", "Où Cloud Armor s'attache-t-il, et contre quoi protège-t-il ?", "¿Dónde se asocia Cloud Armor y contra qué protege?"],
    a: ["To backend services of external load balancers: WAF rules (OWASP), rate limiting, IP and geo rules, and DDoS protection", "Aux services de backend des équilibreurs externes : règles WAF (OWASP), limitation de débit, règles par IP et géographie, protection DDoS", "A los servicios de backend de balanceadores externos: reglas WAF (OWASP), limitación de tasa, reglas por IP y geografía, protección DDoS"],
    w: [["To VMs directly, replacing firewall rules", "Directement aux VM, à la place des règles de pare-feu", "Directamente a las VM, en lugar de las reglas de firewall"], ["To IAM policies, against privilege escalation", "Aux stratégies IAM, contre l'élévation de privilèges", "A las políticas de IAM, contra la escalada de privilegios"], ["To buckets, against deletion", "Aux buckets, contre la suppression", "A los buckets, contra el borrado"]],
    e: [
      "Security policies evaluate requests at Google's edge, before they reach the backends. Preconfigured rules cover SQL injection and XSS; adaptive protection learns traffic patterns. VPC firewall rules still guard the instances themselves.",
      "Les stratégies de sécurité évaluent les requêtes à la périphérie de Google, avant qu'elles n'atteignent les backends. Des règles préconfigurées couvrent l'injection SQL et le XSS ; la protection adaptative apprend les profils de trafic. Les règles de pare-feu VPC protègent toujours les instances elles-mêmes.",
      "Las políticas de seguridad evalúan las peticiones en el borde de Google, antes de que lleguen a los backends. Reglas preconfiguradas cubren inyección SQL y XSS; la protección adaptativa aprende los patrones de tráfico. Las reglas de firewall de VPC siguen protegiendo las propias instancias.",
    ],
  },
];

const loadBalancing: GcpQuestion[] = [
  {
    id: "gc-lb-01",
    q: ["Which source ranges must firewall rules allow for Google's load balancer health checks?", "Quelles plages sources les règles de pare-feu doivent-elles autoriser pour les vérifications d'état des équilibreurs Google ?", "¿Qué rangos de origen deben permitir las reglas de firewall para las comprobaciones de estado de los balanceadores de Google?"],
    a: ["`35.191.0.0/16` and `130.211.0.0/22`", "`35.191.0.0/16` et `130.211.0.0/22`", "`35.191.0.0/16` y `130.211.0.0/22`"],
    w: [["`35.235.240.0/20` only", "`35.235.240.0/20` seulement", "Solo `35.235.240.0/20`"], ["`0.0.0.0/0`, since health checks come from anywhere", "`0.0.0.0/0`, puisque les vérifications viennent de partout", "`0.0.0.0/0`, porque las comprobaciones vienen de cualquier sitio"], ["None: health checks bypass firewalls", "Aucune : les vérifications contournent le pare-feu", "Ninguno: las comprobaciones se saltan el firewall"]],
    e: [
      "Without them, every backend looks unhealthy and the load balancer returns errors, a classic first-deployment failure. `35.235.240.0/20` is IAP's TCP forwarding range. Some load balancers (network passthrough) use additional ranges listed in the documentation.",
      "Sans elles, chaque backend paraît en mauvaise santé et l'équilibreur renvoie des erreurs, une panne classique de premier déploiement. `35.235.240.0/20` est la plage du transfert TCP d'IAP. Certains équilibreurs (réseau passthrough) utilisent d'autres plages listées dans la documentation.",
      "Sin ellos, cada backend parece no estar sano y el balanceador devuelve errores, un fallo clásico del primer despliegue. `35.235.240.0/20` es el rango del reenvío TCP de IAP. Algunos balanceadores (de red de paso) usan rangos adicionales que lista la documentación.",
    ],
  },
  {
    id: "gc-lb-02",
    q: ["What does the global external Application Load Balancer give a multi-region web app?", "Qu'apporte l'équilibreur de charge d'application externe global à une application web multirégion ?", "¿Qué aporta el balanceador de carga de aplicaciones externo global a una app web multirregión?"],
    a: ["One anycast IP; requests enter at the nearest Google edge and go to the closest healthy backend, with TLS, CDN and Cloud Armor there", "Une IP anycast ; les requêtes entrent par la périphérie Google la plus proche et vont au backend sain le plus proche, avec TLS, CDN et Cloud Armor sur place", "Una IP anycast; las peticiones entran por el borde de Google más cercano y van al backend sano más próximo, con TLS, CDN y Cloud Armor ahí"],
    w: [["One IP per region, chosen by DNS", "Une IP par région, choisie par le DNS", "Una IP por región, elegida por el DNS"], ["Layer 4 passthrough only", "Seulement du passthrough de couche 4", "Solo paso directo de capa 4"], ["Nothing over a regional load balancer", "Rien de plus qu'un équilibreur régional", "Nada más que un balanceador regional"]],
    e: [
      "It is a proxy at layer 7: it terminates TLS (Google-managed certificates possible), routes by host and path to backend services (MIGs, Cloud Run via serverless NEGs, buckets), and fails over between regions. Regional and internal variants exist for other needs.",
      "C'est un proxy de couche 7 : il termine le TLS (certificats gérés par Google possibles), route selon l'hôte et le chemin vers des services de backend (MIG, Cloud Run via des NEG sans serveur, buckets) et bascule entre régions. Des variantes régionales et internes existent pour d'autres besoins.",
      "Es un proxy de capa 7: termina TLS (certificados gestionados por Google posibles), enruta por host y ruta a servicios de backend (MIG, Cloud Run mediante NEG sin servidor, buckets) y conmuta entre regiones. Existen variantes regionales e internas para otras necesidades.",
    ],
  },
  {
    id: "gc-lb-03",
    q: ["How does HA VPN reach a 99.99 % availability SLA?", "Comment HA VPN atteint-il un SLA de disponibilité de 99,99 % ?", "¿Cómo alcanza HA VPN un SLA de disponibilidad del 99,99 %?"],
    a: ["With two interfaces, each with a tunnel to the peer (ideally two peer devices), and BGP through Cloud Router", "Avec deux interfaces, chacune avec un tunnel vers le pair (idéalement deux équipements pairs), et BGP via Cloud Router", "Con dos interfaces, cada una con un túnel hacia el par (idealmente dos equipos pares), y BGP mediante Cloud Router"],
    w: [["With one tunnel and a static route", "Avec un tunnel et une route statique", "Con un túnel y una ruta estática"], ["Automatically, for any configuration", "Automatiquement, pour toute configuration", "Automáticamente, con cualquier configuración"], ["By using two regions' Classic VPN", "En utilisant le Classic VPN de deux régions", "Usando el Classic VPN de dos regiones"]],
    e: [
      "The SLA applies only to the redundant topology. Cloud Router exchanges routes dynamically, so a tunnel failure reroutes on its own. For higher bandwidth and private connectivity, Dedicated or Partner Interconnect are used, also in redundant pairs.",
      "Le SLA ne vaut que pour la topologie redondante. Cloud Router échange les routes dynamiquement : la panne d'un tunnel se contourne seule. Pour plus de débit et une connectivité privée, on utilise Dedicated ou Partner Interconnect, eux aussi par paires redondantes.",
      "El SLA solo vale para la topología redundante. Cloud Router intercambia las rutas de forma dinámica, así que el fallo de un túnel se reencamina solo. Para más ancho de banda y conectividad privada se usa Dedicated o Partner Interconnect, también en pares redundantes.",
    ],
  },
  {
    id: "gc-lb-04",
    q: ["Consumers in many VPCs must reach a service published by another team, with overlapping IP ranges. What fits?", "Des consommateurs dans de nombreux VPC doivent atteindre un service publié par une autre équipe, avec des plages IP qui se chevauchent. Qu'est-ce qui convient ?", "Consumidores en muchas VPC deben llegar a un servicio publicado por otro equipo, con rangos IP solapados. ¿Qué encaja?"],
    a: ["Private Service Connect: the producer publishes a service attachment; each consumer creates an endpoint with an IP of its own", "Private Service Connect : le producteur publie un rattachement de service ; chaque consommateur crée un point de terminaison avec une IP à lui", "Private Service Connect: el productor publica un adjunto de servicio; cada consumidor crea un endpoint con una IP propia"],
    w: [["VPC peering with each consumer", "Un appairage VPC avec chaque consommateur", "Peering de VPC con cada consumidor"], ["A public IP and an allowlist", "Une IP publique et une liste blanche", "Una IP pública y una lista blanca"], ["Shared VPC across all teams", "Un Shared VPC entre toutes les équipes", "Un Shared VPC entre todos los equipos"]],
    e: [
      "PSC connects one service, not two whole networks: no route exchange, so ranges may overlap, and the producer approves which consumers connect. Peering exposes every subnet both ways and forbids overlaps. Google APIs and many managed services are also reached through PSC.",
      "PSC relie un service, pas deux réseaux entiers : aucun échange de routes, donc les plages peuvent se chevaucher, et le producteur approuve les consommateurs qui se connectent. L'appairage expose tous les sous-réseaux dans les deux sens et interdit les chevauchements. Les API Google et de nombreux services gérés s'atteignent aussi par PSC.",
      "PSC conecta un servicio, no dos redes enteras: sin intercambio de rutas, así que los rangos pueden solaparse, y el productor aprueba qué consumidores se conectan. El peering expone todas las subredes en ambos sentidos y prohíbe los solapes. Las API de Google y muchos servicios gestionados también se alcanzan con PSC.",
    ],
  },
  {
    id: "gc-lb-05",
    q: ["VMs must resolve `corp.internal` names hosted on an on-premises DNS server. What does Cloud DNS offer?", "Des VM doivent résoudre des noms `corp.internal` hébergés sur un DNS sur site. Que propose Cloud DNS ?", "Las VM deben resolver nombres `corp.internal` alojados en un DNS local. ¿Qué ofrece Cloud DNS?"],
    a: ["A private forwarding zone for `corp.internal`, sending queries to the on-premises servers over VPN or Interconnect", "Une zone privée de transfert pour `corp.internal`, qui envoie les requêtes aux serveurs sur site par VPN ou Interconnect", "Una zona privada de reenvío para `corp.internal`, que envía las consultas a los servidores locales por VPN o Interconnect"],
    w: [["A public zone for `corp.internal`", "Une zone publique pour `corp.internal`", "Una zona pública para `corp.internal`"], ["Copying the hosts file to every VM", "Copier le fichier hosts sur chaque VM", "Copiar el archivo hosts a cada VM"], ["Nothing: VMs can only resolve public names", "Rien : les VM ne résolvent que des noms publics", "Nada: las VM solo resuelven nombres públicos"]],
    e: [
      "Private zones are visible only to the networks they are bound to. Forwarding zones send a domain elsewhere; peering zones let one VPC use another's DNS view (common with Shared VPC). Inbound server policies let on-premises resolvers query Cloud DNS in turn.",
      "Les zones privées ne sont visibles que des réseaux auxquels elles sont liées. Les zones de transfert envoient un domaine ailleurs ; les zones d'appairage permettent à un VPC d'utiliser la vue DNS d'un autre (courant avec Shared VPC). Les stratégies de serveur entrantes laissent à leur tour les résolveurs sur site interroger Cloud DNS.",
      "Las zonas privadas solo las ven las redes a las que están ligadas. Las zonas de reenvío mandan un dominio a otro sitio; las zonas de peering permiten a una VPC usar la vista DNS de otra (habitual con Shared VPC). Las políticas de servidor entrantes dejan a su vez que los resolvers locales consulten Cloud DNS.",
    ],
  },
];

const gke: GcpQuestion[] = [
  {
    id: "gc-gke-01",
    q: ["Which service account should GKE nodes run as?", "Avec quel compte de service les nœuds GKE doivent-ils tourner ?", "¿Con qué cuenta de servicio deben ejecutarse los nodos de GKE?"],
    a: ["A dedicated, minimal one (logging, monitoring, pulling images), not the Compute Engine default account", "Un compte dédié et minimal (journalisation, supervision, téléchargement d'images), pas le compte Compute Engine par défaut", "Una cuenta dedicada y mínima (registros, supervisión, descarga de imágenes), no la cuenta predeterminada de Compute Engine"],
    w: [["The project owner's account", "Le compte du propriétaire du projet", "La cuenta del propietario del proyecto"], ["The default account with Editor, so pods can do anything", "Le compte par défaut avec Editor, pour que les pods puissent tout faire", "La cuenta predeterminada con Editor, para que los pods puedan hacer de todo"], ["No account at all", "Aucun compte", "Ninguna cuenta"]],
    e: [
      "Without Workload Identity, pods can use the node's credentials, so a broad node account makes every pod powerful. Give nodes `roles/container.defaultNodeServiceAccount` (or equivalent minimal roles) and give workloads their own identities through Workload Identity Federation for GKE.",
      "Sans Workload Identity, les pods peuvent utiliser les identifiants du nœud : un compte de nœud large rend chaque pod puissant. Donner aux nœuds `roles/container.defaultNodeServiceAccount` (ou des rôles minimaux équivalents) et aux charges leurs propres identités par la fédération d'identité pour GKE.",
      "Sin Workload Identity, los pods pueden usar las credenciales del nodo, así que una cuenta de nodo amplia hace poderoso a cada pod. Dar a los nodos `roles/container.defaultNodeServiceAccount` (o roles mínimos equivalentes) y a las cargas sus propias identidades con la federación de identidades para GKE.",
    ],
  },
  {
    id: "gc-gke-02",
    q: ["How is a GKE cluster's control plane kept off the open internet?", "Comment éviter que le plan de contrôle d'un cluster GKE soit ouvert sur internet ?", "¿Cómo se mantiene el plano de control de un clúster de GKE fuera de internet abierto?"],
    a: ["Use the private endpoint (or the DNS-based endpoint with IAM), and restrict any public endpoint to authorised networks", "Utiliser le point de terminaison privé (ou celui basé sur DNS, avec IAM), et restreindre tout point public à des réseaux autorisés", "Usar el endpoint privado (o el basado en DNS, con IAM), y restringir cualquier endpoint público a redes autorizadas"],
    w: [["Change the API server port", "Changer le port du serveur d'API", "Cambiar el puerto del servidor de API"], ["Use Spot nodes", "Utiliser des nœuds Spot", "Usar nodos Spot"], ["It cannot be: control planes are always public", "Impossible : les plans de contrôle sont toujours publics", "No se puede: los planos de control siempre son públicos"]],
    e: [
      "Kubernetes RBAC and IAM still authorise every call, but limiting who can reach the API server removes a whole class of attacks. Nodes without external IPs (private nodes) reach the internet through Cloud NAT.",
      "RBAC Kubernetes et IAM autorisent toujours chaque appel, mais limiter qui peut atteindre le serveur d'API supprime toute une classe d'attaques. Les nœuds sans IP externe (nœuds privés) sortent vers internet par Cloud NAT.",
      "RBAC de Kubernetes e IAM siguen autorizando cada llamada, pero limitar quién puede llegar al servidor de API elimina toda una clase de ataques. Los nodos sin IP externa (nodos privados) salen a internet mediante Cloud NAT.",
    ],
  },
  {
    id: "gc-gke-03",
    q: ["IAM and Kubernetes RBAC in GKE: how do they combine?", "IAM et RBAC Kubernetes dans GKE : comment se combinent-ils ?", "IAM y RBAC de Kubernetes en GKE: ¿cómo se combinan?"],
    a: ["A request is allowed if either IAM or RBAC allows it; IAM suits project-wide roles, RBAC namespace-level ones", "Une requête est permise si IAM ou RBAC la permet ; IAM convient aux rôles sur tout le projet, RBAC à ceux par espace de noms", "Una petición se permite si la permite IAM o RBAC; IAM sirve para roles en todo el proyecto, RBAC para los de un espacio de nombres"],
    w: [["Both must allow every request", "Les deux doivent permettre chaque requête", "Ambos deben permitir cada petición"], ["RBAC is disabled in GKE", "RBAC est désactivé dans GKE", "RBAC está desactivado en GKE"], ["IAM overrides RBAC denials", "IAM l'emporte sur les refus de RBAC", "IAM prevalece sobre las denegaciones de RBAC"]],
    e: [
      "Because either system can grant, a broad IAM role such as `roles/container.admin` on the project gives cluster-wide power whatever RBAC says. Give teams a minimal IAM role to get credentials (`roles/container.clusterViewer`) and fine-grained RBAC in their namespaces, possibly bound to Google groups.",
      "Comme l'un ou l'autre peut accorder, un rôle IAM large tel que `roles/container.admin` sur le projet donne un pouvoir sur tout le cluster, quoi que dise RBAC. Donner aux équipes un rôle IAM minimal pour obtenir les identifiants (`roles/container.clusterViewer`) et un RBAC fin dans leurs espaces de noms, éventuellement lié à des groupes Google.",
      "Como cualquiera de los dos puede conceder, un rol de IAM amplio como `roles/container.admin` en el proyecto da poder sobre todo el clúster, diga lo que diga RBAC. Dar a los equipos un rol de IAM mínimo para obtener credenciales (`roles/container.clusterViewer`) y un RBAC fino en sus espacios de nombres, quizá ligado a grupos de Google.",
    ],
  },
  {
    id: "gc-gke-04",
    q: ["A regional GKE cluster, compared with a zonal one, offers what?", "Un cluster GKE régional, comparé à un zonal, offre quoi ?", "¿Qué ofrece un clúster de GKE regional comparado con uno zonal?"],
    a: ["Control plane replicas and nodes across several zones, so a zone outage or an upgrade does not stop the API", "Des répliques du plan de contrôle et des nœuds sur plusieurs zones : une panne de zone ou une mise à jour n'arrête pas l'API", "Réplicas del plano de control y nodos en varias zonas, así que un fallo de zona o una actualización no detienen la API"],
    w: [["Cheaper nodes", "Des nœuds moins chers", "Nodos más baratos"], ["Pods that can move between regions", "Des pods qui peuvent changer de région", "Pods que pueden cambiar de región"], ["No upgrades ever", "Aucune mise à jour, jamais", "Ninguna actualización, nunca"]],
    e: [
      "A zonal cluster's single control plane is unavailable during its upgrades and if its zone fails. Node pools in a regional cluster are replicated in each zone, which multiplies node counts. Release channels (Rapid, Regular, Stable, Extended) set the upgrade pace.",
      "Le plan de contrôle unique d'un cluster zonal est indisponible pendant ses mises à jour et si sa zone tombe. Les pools de nœuds d'un cluster régional sont répliqués dans chaque zone, ce qui multiplie le nombre de nœuds. Les canaux de publication (Rapid, Regular, Stable, Extended) fixent le rythme des mises à jour.",
      "El plano de control único de un clúster zonal no está disponible durante sus actualizaciones ni si cae su zona. Los grupos de nodos de un clúster regional se replican en cada zona, lo que multiplica el número de nodos. Los canales de versiones (Rapid, Regular, Stable, Extended) marcan el ritmo de actualización.",
    ],
  },
];

const dataProtection: GcpQuestion[] = [
  {
    id: "gc-dp-01",
    q: ["Object versioning, soft delete, and a locked retention policy: which can prevent even an admin from deleting data before a date?", "Versionnage des objets, suppression réversible et règle de rétention verrouillée : lequel empêche même un administrateur de supprimer des données avant une date ?", "Control de versiones, borrado temporal y política de retención bloqueada: ¿cuál impide incluso a un administrador borrar datos antes de una fecha?"],
    a: ["A locked retention policy (Bucket Lock): objects cannot be deleted or replaced before the period ends, and the lock cannot be removed", "Une règle de rétention verrouillée (Bucket Lock) : les objets ne peuvent être supprimés ni remplacés avant la fin de la période, et le verrou ne s'enlève pas", "Una política de retención bloqueada (Bucket Lock): los objetos no se pueden borrar ni sustituir antes del final del periodo, y el bloqueo no se quita"],
    w: [["Object versioning", "Le versionnage des objets", "El control de versiones de objetos"], ["Soft delete", "La suppression réversible", "El borrado temporal"], ["An IAM condition on the bucket", "Une condition IAM sur le bucket", "Una condición de IAM en el bucket"]],
    e: [
      "Versioning keeps noncurrent versions, which an admin can still delete. Soft delete (on by default, 7 days) lets deleted objects be restored within its window. A locked retention policy suits regulatory retention (write once, read many); it is irreversible, so test it unlocked first.",
      "Le versionnage garde les versions non courantes, qu'un administrateur peut encore supprimer. La suppression réversible (active par défaut, 7 jours) permet de restaurer des objets supprimés dans ce délai. Une règle de rétention verrouillée convient à la conservation réglementaire (écrire une fois, lire souvent) ; elle est irréversible : la tester d'abord sans verrou.",
      "El control de versiones guarda las versiones no actuales, que un administrador aún puede borrar. El borrado temporal (activo por defecto, 7 días) permite restaurar objetos borrados en ese plazo. Una política de retención bloqueada sirve para la conservación normativa (escribir una vez, leer muchas); es irreversible, así que conviene probarla antes sin bloqueo.",
    ],
  },
  {
    id: "gc-dp-02",
    q: ["Cloud SQL high availability and read replicas: which protects against a zone failure?", "Haute disponibilité de Cloud SQL et répliques de lecture : laquelle protège contre la panne d'une zone ?", "Alta disponibilidad de Cloud SQL y réplicas de lectura: ¿cuál protege contra el fallo de una zona?"],
    a: ["High availability: a standby in another zone with synchronous replication and automatic failover", "La haute disponibilité : une instance de secours dans une autre zone, réplication synchrone et basculement automatique", "La alta disponibilidad: una instancia en espera en otra zona, con replicación síncrona y conmutación automática"],
    w: [["A read replica, which takes over automatically", "Une réplique de lecture, qui prend le relais automatiquement", "Una réplica de lectura, que toma el relevo automáticamente"], ["Daily backups, with no downtime", "Des sauvegardes quotidiennes, sans interruption", "Copias diarias, sin interrupción"], ["Neither: Cloud SQL is always multi-region", "Aucune : Cloud SQL est toujours multirégion", "Ninguna: Cloud SQL es siempre multirregión"]],
    e: [
      "Read replicas use asynchronous replication to offload reads; promoting one is a manual step that may lose recent writes. Backups and point-in-time recovery protect against mistakes and corruption, which replication faithfully copies. Cross-region replicas serve disaster recovery.",
      "Les répliques de lecture utilisent une réplication asynchrone pour décharger les lectures ; en promouvoir une est une étape manuelle qui peut perdre des écritures récentes. Sauvegardes et restauration à un instant donné protègent des erreurs et des corruptions, que la réplication copie fidèlement. Les répliques interrégionales servent à la reprise après sinistre.",
      "Las réplicas de lectura usan replicación asíncrona para descargar lecturas; promover una es un paso manual que puede perder escrituras recientes. Las copias y la recuperación a un momento dado protegen contra errores y corrupciones, que la replicación copia fielmente. Las réplicas entre regiones sirven para la recuperación ante desastres.",
    ],
  },
  {
    id: "gc-dp-03",
    q: ["What does Backup and DR's backup vault add over ordinary backups?", "Qu'ajoute le coffre de sauvegarde de Backup and DR par rapport à des sauvegardes ordinaires ?", "¿Qué añade la bóveda de copias de Backup and DR frente a copias normales?"],
    a: ["Immutable, isolated backups with an enforced minimum retention, which even project admins cannot delete early", "Des sauvegardes immuables et isolées avec une rétention minimale imposée, que même les administrateurs du projet ne peuvent pas supprimer avant terme", "Copias inmutables y aisladas con una retención mínima impuesta, que ni los administradores del proyecto pueden borrar antes de tiempo"],
    w: [["Faster restores only", "Seulement des restaurations plus rapides", "Solo restauraciones más rápidas"], ["Backups stored on the same disk as the data", "Des sauvegardes sur le même disque que les données", "Copias guardadas en el mismo disco que los datos"], ["Free storage", "Un stockage gratuit", "Almacenamiento gratuito"]],
    e: [
      "Ransomware and compromised admin accounts delete backups first. A vault managed separately from the workload's project, with enforced retention, keeps a recovery point that an attacker with the project's credentials cannot remove.",
      "Les rançongiciels et les comptes d'administration compromis suppriment d'abord les sauvegardes. Un coffre géré à part du projet de la charge, avec rétention imposée, garde un point de restauration qu'un attaquant muni des identifiants du projet ne peut pas retirer.",
      "El ransomware y las cuentas de administración comprometidas borran primero las copias. Una bóveda gestionada aparte del proyecto de la carga, con retención impuesta, conserva un punto de recuperación que un atacante con las credenciales del proyecto no puede quitar.",
    ],
  },
];

const reliability: GcpQuestion[] = [
  {
    id: "gc-rel-01",
    q: ["An SLO of 99.9 % monthly availability allows how much downtime in a 30-day month?", "Un SLO de 99,9 % de disponibilité mensuelle permet combien d'indisponibilité sur un mois de 30 jours ?", "¿Cuánto tiempo de caída permite un SLO del 99,9 % de disponibilidad mensual en un mes de 30 días?"],
    a: ["About 43 minutes", "Environ 43 minutes", "Unos 43 minutos"],
    w: [["About 4 minutes", "Environ 4 minutes", "Unos 4 minutos"], ["About 7 hours", "Environ 7 heures", "Unas 7 horas"], ["About 9 hours a day", "Environ 9 heures par jour", "Unas 9 horas al día"]],
    e: [
      "30 × 24 × 60 = 43,200 minutes; 0.1 % of that is 43.2 minutes. That is the error budget: while it lasts, teams may ship risky changes; once spent, they slow down and work on reliability. 99.99 % leaves 4.3 minutes, 99 % about 7.2 hours.",
      "30 × 24 × 60 = 43 200 minutes ; 0,1 % de cela font 43,2 minutes. C'est le budget d'erreur : tant qu'il dure, les équipes peuvent livrer des changements risqués ; une fois consommé, elles ralentissent et travaillent la fiabilité. 99,99 % laisse 4,3 minutes, 99 % environ 7,2 heures.",
      "30 × 24 × 60 = 43 200 minutos; el 0,1 % son 43,2 minutos. Es el presupuesto de errores: mientras dura, los equipos pueden publicar cambios arriesgados; una vez gastado, frenan y trabajan en la fiabilidad. 99,99 % deja 4,3 minutos, 99 % unas 7,2 horas.",
    ],
  },
  {
    id: "gc-rel-02",
    q: ["What should an alert on a service's SLO typically fire on?", "Sur quoi une alerte liée au SLO d'un service doit-elle en général se déclencher ?", "¿Sobre qué debe dispararse normalmente una alerta ligada al SLO de un servicio?"],
    a: ["The error budget's burn rate: errors consuming the budget much faster than the period allows", "Le rythme de consommation du budget d'erreur : des erreurs qui consomment le budget bien plus vite que la période ne le permet", "El ritmo de consumo del presupuesto de errores: errores que lo gastan mucho más rápido de lo que permite el periodo"],
    w: [["Any single failed request", "Toute requête en échec", "Cualquier petición fallida"], ["CPU above 50 %", "Un CPU au-dessus de 50 %", "CPU por encima del 50 %"], ["The number of deployments per day", "Le nombre de déploiements par jour", "El número de despliegues al día"]],
    e: [
      "Burn-rate alerts page when users are really affected and stay quiet for blips; using two windows (a short and a long one) catches both sudden outages and slow leaks. Cloud Monitoring's SLO features compute them from request metrics.",
      "Les alertes sur le rythme de consommation réveillent quand les utilisateurs sont vraiment touchés et restent muettes pour les incidents fugaces ; deux fenêtres (une courte, une longue) attrapent pannes soudaines et fuites lentes. Les fonctions SLO de Cloud Monitoring les calculent depuis les métriques de requêtes.",
      "Las alertas por ritmo de consumo avisan cuando los usuarios están realmente afectados y callan ante picos breves; dos ventanas (una corta y una larga) detectan caídas repentinas y fugas lentas. Las funciones de SLO de Cloud Monitoring las calculan a partir de las métricas de peticiones.",
    ],
  },
  {
    id: "gc-rel-03",
    q: ["How can a warning be raised when a specific message appears in an application's logs?", "Comment déclencher un avertissement quand un message précis apparaît dans les journaux d'une application ?", "¿Cómo se lanza un aviso cuando aparece un mensaje concreto en los registros de una aplicación?"],
    a: ["A log-based metric (or log-based alert) on a filter matching the message, with an alerting policy", "Une métrique basée sur les journaux (ou une alerte basée sur les journaux) avec un filtre correspondant au message, et une règle d'alerte", "Una métrica basada en registros (o una alerta basada en registros) con un filtro que coincida con el mensaje, y una política de alertas"],
    w: [["An uptime check", "Une vérification de disponibilité", "Una comprobación de tiempo de actividad"], ["A budget alert", "Une alerte de budget", "Una alerta de presupuesto"], ["Data Access audit logs", "Les journaux Data Access", "Los registros Data Access"]],
    e: [
      "Log-based metrics count matching entries over time, which suits rates and thresholds; log-based alerts notify on each matching entry, which suits rare, important events (a `SetIamPolicy` outside the pipeline). Structured JSON logs make filters precise.",
      "Les métriques basées sur les journaux comptent les entrées correspondantes dans le temps, ce qui convient aux taux et aux seuils ; les alertes basées sur les journaux préviennent à chaque entrée, ce qui convient aux événements rares et importants (un `SetIamPolicy` hors du pipeline). Des journaux JSON structurés rendent les filtres précis.",
      "Las métricas basadas en registros cuentan las entradas coincidentes en el tiempo, útil para tasas y umbrales; las alertas basadas en registros avisan en cada entrada, útil para eventos raros e importantes (un `SetIamPolicy` fuera del pipeline). Los registros JSON estructurados hacen precisos los filtros.",
    ],
  },
  {
    id: "gc-rel-04",
    q: ["Who can see the cost of each team's projects, without access to the resources themselves?", "Qui peut voir le coût des projets de chaque équipe, sans accès aux ressources elles-mêmes ?", "¿Quién puede ver el coste de los proyectos de cada equipo, sin acceso a los propios recursos?"],
    a: ["Holders of Billing Account Viewer (or cost roles on the billing account), and anyone reading the billing export in BigQuery", "Les détenteurs de Billing Account Viewer (ou de rôles de coûts sur le compte de facturation), et quiconque lit l'export de facturation dans BigQuery", "Quienes tengan Billing Account Viewer (o roles de costes en la cuenta de facturación), y quien lea la exportación de facturación en BigQuery"],
    w: [["Only project owners, each for their own project", "Seulement les propriétaires de projets, chacun pour le sien", "Solo los propietarios de proyectos, cada uno el suyo"], ["Nobody: costs are only on the invoice", "Personne : les coûts ne figurent que sur la facture", "Nadie: los costes solo están en la factura"], ["Anyone with Viewer on the organisation", "Quiconque a Viewer sur l'organisation", "Cualquiera con Viewer en la organización"]],
    e: [
      "Billing access is separate from resource access: finance can analyse costs without seeing data. The detailed export to BigQuery, with labels, allows cost reports per team or product; budgets can be scoped to projects or labels.",
      "L'accès à la facturation est séparé de l'accès aux ressources : la finance peut analyser les coûts sans voir les données. L'export détaillé vers BigQuery, avec les labels, permet des rapports de coûts par équipe ou produit ; les budgets peuvent viser des projets ou des labels.",
      "El acceso a la facturación está separado del acceso a los recursos: finanzas puede analizar costes sin ver datos. La exportación detallada a BigQuery, con las labels, permite informes de costes por equipo o producto; los presupuestos pueden limitarse a proyectos o labels.",
    ],
  },
];

export const hierarchy = { landingZone };
export const iam = { iamAdvanced };
export const serviceAccounts = { federation };
export const security = { perimeters };
export const networking = { loadBalancing };
export const compute = { gke };
export const storage = { dataProtection };
export const operations = { reliability };
