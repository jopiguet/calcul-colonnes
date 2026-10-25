/**
 * Google Cloud, Intermédiaire: organisation policies, IAM in practice
 * (custom roles, conditions, safe changes), using and impersonating service
 * accounts, audit logs, connectivity (Shared VPC, peering, Private Google
 * Access, IAP), running services, access to storage, Terraform.
 */
import type { LinuxQuestion as GcpQuestion } from "../linux/types";

const orgPolicies: GcpQuestion[] = [
  {
    id: "gc-org-01",
    q: ["IAM and the Organization Policy Service: what does each control?", "IAM et le service de règles d'administration (Organization Policy) : que contrôle chacun ?", "IAM y el servicio de políticas de organización: ¿qué controla cada uno?"],
    a: ["IAM decides who may act; organisation policies restrict what configurations are allowed at all, whoever acts", "IAM décide qui peut agir ; les règles d'administration restreignent les configurations permises, quel que soit l'acteur", "IAM decide quién puede actuar; las políticas de organización restringen qué configuraciones se permiten, actúe quien actúe"],
    w: [["They are two names for the same thing", "Ce sont deux noms de la même chose", "Son dos nombres de lo mismo"], ["Organisation policies grant roles to groups", "Les règles d'administration accordent des rôles aux groupes", "Las políticas de organización conceden roles a grupos"], ["IAM applies to projects, organisation policies only to the organisation node", "IAM s'applique aux projets, les règles d'administration seulement au nœud d'organisation", "IAM se aplica a proyectos, las políticas de organización solo al nodo de organización"]],
    e: [
      "Even an Owner cannot create a VM with an external IP if `compute.vmExternalIpAccess` forbids it, or a bucket outside Europe if `gcp.resourceLocations` restricts locations. Constraints are set on the organisation, folders or projects and inherited; changing them needs `roles/orgpolicy.policyAdmin`, usually held by few.",
      "Même un Owner ne peut pas créer une VM avec IP externe si `compute.vmExternalIpAccess` l'interdit, ni un bucket hors d'Europe si `gcp.resourceLocations` restreint les emplacements. Les contraintes se posent sur l'organisation, des dossiers ou des projets et s'héritent ; les modifier demande `roles/orgpolicy.policyAdmin`, détenu en général par peu de monde.",
      "Ni siquiera un Owner puede crear una VM con IP externa si `compute.vmExternalIpAccess` lo prohíbe, ni un bucket fuera de Europa si `gcp.resourceLocations` restringe las ubicaciones. Las restricciones se ponen en la organización, carpetas o proyectos y se heredan; cambiarlas requiere `roles/orgpolicy.policyAdmin`, que suelen tener pocos.",
    ],
  },
  {
    id: "gc-org-02",
    q: ["Which constraint stops IAM grants to accounts outside your own domains (e.g. a personal Gmail)?", "Quelle contrainte empêche les attributions IAM à des comptes hors de vos domaines (par ex. un Gmail personnel) ?", "¿Qué restricción impide concesiones de IAM a cuentas fuera de tus dominios (p. ej. un Gmail personal)?"],
    a: ["`iam.allowedPolicyMemberDomains` (domain-restricted sharing)", "`iam.allowedPolicyMemberDomains` (partage restreint au domaine)", "`iam.allowedPolicyMemberDomains` (uso compartido restringido al dominio)"],
    w: [["`compute.vmExternalIpAccess`", "`compute.vmExternalIpAccess`", "`compute.vmExternalIpAccess`"], ["`storage.uniformBucketLevelAccess`", "`storage.uniformBucketLevelAccess`", "`storage.uniformBucketLevelAccess`"], ["`gcp.resourceLocations`", "`gcp.resourceLocations`", "`gcp.resourceLocations`"]],
    e: [
      "It lists the Cloud Identity customer IDs whose principals may appear in allow policies. It is enforced by default in organisations created since May 2024. Existing grants are not removed when it is turned on; new ones are refused. Public access (`allUsers`) is blocked too, which can break intentionally public buckets.",
      "Elle liste les ID client Cloud Identity dont les principaux peuvent figurer dans les stratégies d'autorisation. Elle est appliquée par défaut dans les organisations créées depuis mai 2024. Les attributions existantes ne sont pas retirées à l'activation ; les nouvelles sont refusées. L'accès public (`allUsers`) est aussi bloqué, ce qui peut casser des buckets volontairement publics.",
      "Lista los ID de cliente de Cloud Identity cuyos principales pueden aparecer en las políticas de permiso. Se aplica por defecto en las organizaciones creadas desde mayo de 2024. Las concesiones existentes no se quitan al activarla; las nuevas se rechazan. El acceso público (`allUsers`) también se bloquea, lo que puede romper buckets públicos a propósito.",
    ],
  },
  {
    id: "gc-org-03",
    q: ["An organisation policy set on a folder, and another on a project inside it: which applies to the project?", "Une règle d'administration posée sur un dossier, et une autre sur un projet qu'il contient : laquelle s'applique au projet ?", "Una política de organización en una carpeta y otra en un proyecto dentro de ella: ¿cuál se aplica al proyecto?"],
    a: ["The project's, which may replace the inherited one or, for list constraints, merge with it (`inheritFromParent`)", "Celle du projet, qui peut remplacer celle héritée ou, pour les contraintes de liste, fusionner avec elle (`inheritFromParent`)", "La del proyecto, que puede sustituir a la heredada o, en las restricciones de lista, fusionarse con ella (`inheritFromParent`)"],
    w: [["Always the folder's: higher policies cannot be changed below", "Toujours celle du dossier : on ne peut rien changer plus bas", "Siempre la de la carpeta: no se puede cambiar nada más abajo"], ["Both are ignored when they disagree", "Les deux sont ignorées quand elles divergent", "Ambas se ignoran cuando discrepan"], ["The most permissive of the two, always", "La plus permissive des deux, toujours", "La más permisiva de las dos, siempre"]],
    e: [
      "Unlike IAM allow policies, which only add up, organisation policies are evaluated from the nearest ancestor that sets one. That is why changing them is a privileged role: a project-level override can loosen a constraint. Dry-run policies show what a change would block before enforcing it.",
      "Contrairement aux stratégies d'autorisation IAM, qui ne font que s'additionner, les règles d'administration s'évaluent depuis l'ancêtre le plus proche qui en définit une. C'est pourquoi les modifier est un rôle privilégié : une dérogation au niveau du projet peut assouplir une contrainte. Les règles en mode simulation (dry-run) montrent ce qu'un changement bloquerait avant de l'appliquer.",
      "A diferencia de las políticas de permiso de IAM, que solo se suman, las políticas de organización se evalúan desde el antecesor más cercano que defina una. Por eso cambiarlas es un rol privilegiado: una excepción a nivel de proyecto puede relajar una restricción. Las políticas en modo de prueba (dry-run) muestran qué bloquearía un cambio antes de aplicarlo.",
    ],
  },
  {
    id: "gc-org-04",
    q: ["Which of these is enforced by default in a Google Cloud organisation created after May 2024?", "Laquelle de ces contraintes est appliquée par défaut dans une organisation Google Cloud créée après mai 2024 ?", "¿Cuál de estas se aplica por defecto en una organización de Google Cloud creada después de mayo de 2024?"],
    a: ["Service account key creation is disabled", "La création de clés de comptes de service est désactivée", "La creación de claves de cuentas de servicio está desactivada"],
    w: [["Every VM must use a Spot instance", "Chaque VM doit être une instance Spot", "Cada VM debe ser una instancia Spot"], ["Data Access audit logs are on for every service", "Les journaux Data Access sont activés pour chaque service", "Los registros Data Access están activos en todos los servicios"], ["Only the `europe-west6` region may be used", "Seule la région `europe-west6` peut être utilisée", "Solo se puede usar la región `europe-west6`"]],
    e: [
      "The secure-by-default baseline enforces, among others: no service account key creation or upload, no automatic Editor grant to default service accounts, domain-restricted sharing, and uniform bucket-level access. Older organisations can apply the same constraints themselves.",
      "La base « sécurisée par défaut » applique notamment : pas de création ni d'import de clés de comptes de service, pas d'attribution automatique d'Editor aux comptes de service par défaut, le partage restreint au domaine, et l'accès uniforme au niveau du bucket. Les organisations plus anciennes peuvent appliquer elles-mêmes ces contraintes.",
      "La base «segura por defecto» aplica, entre otras: sin creación ni subida de claves de cuentas de servicio, sin concesión automática de Editor a las cuentas de servicio predeterminadas, uso compartido restringido al dominio, y acceso uniforme a nivel de bucket. Las organizaciones más antiguas pueden aplicar ellas mismas estas restricciones.",
    ],
  },
];

const iamPractice: GcpQuestion[] = [
  {
    id: "gc-iamp-01",
    q: ["Where can a custom role be defined?", "Où peut-on définir un rôle personnalisé ?", "¿Dónde se puede definir un rol personalizado?"],
    a: ["In an organisation or a project, not in a folder; it can only be granted within where it was created", "Dans une organisation ou un projet, pas dans un dossier ; il ne s'accorde que là où il a été créé", "En una organización o un proyecto, no en una carpeta; solo se concede donde se creó"],
    w: [["Anywhere, folders included", "N'importe où, dossiers compris", "En cualquier sitio, carpetas incluidas"], ["Only by Google support", "Seulement par le support Google", "Solo por el soporte de Google"], ["Only in projects", "Seulement dans des projets", "Solo en proyectos"]],
    e: [
      "A role meant for several projects is defined at the organisation. Project-level custom roles cannot include permissions that only work at folder or organisation level. Custom roles do not follow Google's updates of predefined roles: new permissions a service needs must be added by hand.",
      "Un rôle destiné à plusieurs projets se définit au niveau de l'organisation. Les rôles personnalisés d'un projet ne peuvent pas inclure de permissions qui n'agissent qu'au niveau du dossier ou de l'organisation. Les rôles personnalisés ne suivent pas les mises à jour des rôles prédéfinis : les nouvelles permissions qu'un service demande s'ajoutent à la main.",
      "Un rol pensado para varios proyectos se define en la organización. Los roles personalizados de proyecto no pueden incluir permisos que solo actúan a nivel de carpeta u organización. Los roles personalizados no siguen las actualizaciones de los predefinidos: los permisos nuevos que necesite un servicio se añaden a mano.",
    ],
  },
  {
    id: "gc-iamp-02",
    q: ["A contractor needs access to a project until 31 December only. What does IAM offer?", "Un prestataire a besoin d'un accès au projet jusqu'au 31 décembre seulement. Que propose IAM ?", "Un contratista necesita acceso al proyecto solo hasta el 31 de diciembre. ¿Qué ofrece IAM?"],
    a: ["A conditional binding with an expiry, e.g. `request.time < timestamp(\"2026-12-31T23:59:59Z\")`", "Une liaison conditionnelle avec expiration, par ex. `request.time < timestamp(\"2026-12-31T23:59:59Z\")`", "Una vinculación condicional con caducidad, p. ej. `request.time < timestamp(\"2026-12-31T23:59:59Z\")`"],
    w: [["Nothing: remember to remove it on that date", "Rien : penser à la retirer à cette date", "Nada: acordarse de quitarla ese día"], ["A Viewer role, which expires after 90 days", "Un rôle Viewer, qui expire au bout de 90 jours", "Un rol Viewer, que caduca a los 90 días"], ["A label `expires=2026-12-31` on the project", "Un label `expires=2026-12-31` sur le projet", "Una label `expires=2026-12-31` en el proyecto"]],
    e: [
      "IAM Conditions are CEL expressions on the request (time) or the resource (type, name, tags). A policy with conditions must use policy version 3, and basic roles cannot be conditional. The expired binding stays in the policy, inactive, until removed.",
      "Les conditions IAM sont des expressions CEL sur la requête (l'heure) ou la ressource (type, nom, tags). Une stratégie avec conditions doit être en version 3, et les rôles de base ne peuvent pas être conditionnels. La liaison expirée reste dans la stratégie, inactive, jusqu'à ce qu'on la retire.",
      "Las condiciones de IAM son expresiones CEL sobre la petición (la hora) o el recurso (tipo, nombre, tags). Una política con condiciones debe usar la versión 3, y los roles básicos no pueden ser condicionales. La vinculación caducada se queda en la política, inactiva, hasta que se quite.",
    ],
  },
  {
    id: "gc-iamp-03",
    q: ["Two admins edit the same allow policy at once. How does IAM avoid one silently undoing the other?", "Deux administrateurs modifient la même stratégie d'autorisation en même temps. Comment IAM évite-t-il que l'un défasse l'autre en silence ?", "Dos administradores editan la misma política de permiso a la vez. ¿Cómo evita IAM que uno deshaga al otro en silencio?"],
    a: ["The policy's `etag`: a `setIamPolicy` carrying an outdated etag is rejected, so the change is retried on the fresh policy", "L'`etag` de la stratégie : un `setIamPolicy` avec un etag périmé est rejeté, et le changement est refait sur la stratégie à jour", "El `etag` de la política: un `setIamPolicy` con un etag desfasado se rechaza, y el cambio se repite sobre la política actual"],
    w: [["It locks the policy for an hour", "Il verrouille la stratégie pendant une heure", "Bloquea la política durante una hora"], ["The last write always wins", "La dernière écriture gagne toujours", "La última escritura gana siempre"], ["It merges the two files line by line", "Il fusionne les deux fichiers ligne à ligne", "Fusiona los dos archivos línea a línea"]],
    e: [
      "This is optimistic concurrency: read the policy (with its etag), change it, write it back. `add-iam-policy-binding` and Terraform's `google_*_iam_member` do the cycle for one binding. A hand-written `set-iam-policy` with a file read long ago risks dropping others' grants.",
      "C'est de la concurrence optimiste : lire la stratégie (avec son etag), la modifier, la réécrire. `add-iam-policy-binding` et le `google_*_iam_member` de Terraform font ce cycle pour une liaison. Un `set-iam-policy` à la main avec un fichier lu il y a longtemps risque d'effacer les attributions des autres.",
      "Es concurrencia optimista: leer la política (con su etag), cambiarla, volver a escribirla. `add-iam-policy-binding` y el `google_*_iam_member` de Terraform hacen el ciclo para una vinculación. Un `set-iam-policy` a mano con un archivo leído hace tiempo puede borrar las concesiones de otros.",
    ],
  },
  {
    id: "gc-iamp-04",
    q: ["A user gets \"permission denied\" on a bucket and nobody knows why. Which tool explains it?", "Un utilisateur reçoit « permission refusée » sur un bucket et personne ne sait pourquoi. Quel outil l'explique ?", "Un usuario recibe «permiso denegado» en un bucket y nadie sabe por qué. ¿Qué herramienta lo explica?"],
    a: ["Policy Troubleshooter, which checks a principal, a permission and a resource against allow, deny and boundary policies", "Policy Troubleshooter, qui vérifie un principal, une permission et une ressource face aux stratégies d'autorisation, de refus et de limite", "Policy Troubleshooter, que comprueba un principal, un permiso y un recurso frente a las políticas de permiso, denegación y límite"],
    w: [["Cloud Trace", "Cloud Trace", "Cloud Trace"], ["The billing report", "Le rapport de facturation", "El informe de facturación"], ["`gcloud config list`", "`gcloud config list`", "`gcloud config list`"]],
    e: [
      "It shows which bindings at which level grant or fail to grant the permission, and whether a deny policy or principal access boundary blocks it. Policy Analyzer answers the reverse question: who can access this resource, or what can this principal access.",
      "Il montre quelles liaisons, à quel niveau, accordent ou non la permission, et si une stratégie de refus ou une limite d'accès des principaux la bloque. Policy Analyzer répond à la question inverse : qui peut accéder à cette ressource, ou à quoi ce principal peut accéder.",
      "Muestra qué vinculaciones, en qué nivel, conceden o no el permiso, y si lo bloquea una política de denegación o un límite de acceso de principales. Policy Analyzer responde a la pregunta inversa: quién puede acceder a este recurso, o a qué puede acceder este principal.",
    ],
  },
  {
    id: "gc-iamp-05",
    q: ["How long after a role is granted does it take effect?", "Combien de temps après l'attribution d'un rôle prend-il effet ?", "¿Cuánto tarda en surtir efecto un rol tras concederlo?"],
    a: ["Usually within about two minutes, sometimes longer: IAM is eventually consistent", "En général en deux minutes environ, parfois plus : IAM est cohérent à terme", "Normalmente en unos dos minutos, a veces más: IAM tiene consistencia eventual"],
    w: [["Instantly, everywhere", "Instantanément, partout", "Al instante, en todas partes"], ["At midnight UTC", "À minuit UTC", "A medianoche UTC"], ["After the user signs out and in, never before", "Après une déconnexion et reconnexion, jamais avant", "Tras cerrar sesión y volver a entrar, nunca antes"]],
    e: [
      "Policy changes propagate through caches. Automation that grants a role and uses it at once should retry. Removing access is not instant either, which matters when cutting off a compromised account: also disable the account or revoke its credentials.",
      "Les changements de stratégie se propagent à travers des caches. Une automatisation qui accorde un rôle et l'utilise aussitôt doit réessayer. Retirer un accès n'est pas instantané non plus, ce qui compte pour couper un compte compromis : désactiver aussi le compte ou révoquer ses identifiants.",
      "Los cambios de política se propagan a través de cachés. Una automatización que concede un rol y lo usa al instante debe reintentar. Quitar un acceso tampoco es instantáneo, lo que importa al cortar una cuenta comprometida: desactivar también la cuenta o revocar sus credenciales.",
    ],
  },
  {
    id: "gc-iamp-06",
    q: ["A role granted on a folder: where does it apply?", "Un rôle accordé sur un dossier : où s'applique-t-il ?", "Un rol concedido en una carpeta: ¿dónde se aplica?"],
    a: ["To the folder and everything below it: sub-folders, their projects and their resources", "Au dossier et à tout ce qu'il contient : sous-dossiers, leurs projets et leurs ressources", "A la carpeta y a todo lo que contiene: subcarpetas, sus proyectos y sus recursos"],
    w: [["Only to the folder object itself", "Seulement à l'objet dossier lui-même", "Solo al propio objeto carpeta"], ["To projects created after the grant only", "Seulement aux projets créés après l'attribution", "Solo a los proyectos creados después de la concesión"], ["To the projects, unless they have their own policy", "Aux projets, sauf s'ils ont leur propre stratégie", "A los proyectos, salvo que tengan su propia política"]],
    e: [
      "The effective policy of a resource is the union of its own and all its ancestors'. A project's policy cannot remove what a folder grants; only a deny policy can block it. That is why broad grants high in the hierarchy deserve care.",
      "La stratégie effective d'une ressource est l'union de la sienne et de celles de tous ses ancêtres. La stratégie d'un projet ne peut pas retirer ce qu'accorde un dossier ; seule une stratégie de refus peut le bloquer. D'où la prudence avec les attributions larges en haut de la hiérarchie.",
      "La política efectiva de un recurso es la unión de la suya y las de todos sus antecesores. La política de un proyecto no puede quitar lo que concede una carpeta; solo una política de denegación puede bloquearlo. De ahí el cuidado con las concesiones amplias en lo alto de la jerarquía.",
    ],
  },
];

const impersonation: GcpQuestion[] = [
  {
    id: "gc-imp-01",
    q: ["To deploy a Cloud Run service that runs as `app@…`, what must the deployer have on that service account?", "Pour déployer un service Cloud Run qui tourne en tant que `app@…`, que doit avoir le déployeur sur ce compte de service ?", "Para desplegar un servicio de Cloud Run que se ejecute como `app@…`, ¿qué debe tener quien despliega sobre esa cuenta de servicio?"],
    a: ["`iam.serviceAccounts.actAs`, through Service Account User (`roles/iam.serviceAccountUser`)", "`iam.serviceAccounts.actAs`, via Service Account User (`roles/iam.serviceAccountUser`)", "`iam.serviceAccounts.actAs`, mediante Service Account User (`roles/iam.serviceAccountUser`)"],
    w: [["Nothing: anyone who can deploy can choose any account", "Rien : quiconque peut déployer peut choisir n'importe quel compte", "Nada: cualquiera que pueda desplegar puede elegir cualquier cuenta"], ["Owner on the service account's project", "Owner sur le projet du compte de service", "Owner en el proyecto de la cuenta de servicio"], ["A key for the service account", "Une clé du compte de service", "Una clave de la cuenta de servicio"]],
    e: [
      "Attaching an account to a resource lets that resource act with the account's roles, so it is itself a privilege: otherwise a developer could attach a powerful account and gain its access. Grant Service Account User on the specific account, not on the project, where it covers every service account in it.",
      "Attacher un compte à une ressource permet à celle-ci d'agir avec ses rôles : c'est donc un privilège en soi, sinon un développeur pourrait attacher un compte puissant et obtenir son accès. Accorder Service Account User sur le compte précis, pas sur le projet, où il couvre tous les comptes de service.",
      "Asociar una cuenta a un recurso permite a este actuar con sus roles, así que es un privilegio en sí mismo: si no, un desarrollador podría asociar una cuenta poderosa y obtener su acceso. Conceder Service Account User sobre la cuenta concreta, no sobre el proyecto, donde cubre todas las cuentas de servicio.",
    ],
  },
  {
    id: "gc-imp-02",
    q: ["`gcloud storage ls --impersonate-service-account=deploy@…` needs which role on that account?", "`gcloud storage ls --impersonate-service-account=deploy@…` demande quel rôle sur ce compte ?", "¿Qué rol requiere `gcloud storage ls --impersonate-service-account=deploy@…` sobre esa cuenta?"],
    a: ["Service Account Token Creator (`roles/iam.serviceAccountTokenCreator`)", "Service Account Token Creator (`roles/iam.serviceAccountTokenCreator`)", "Service Account Token Creator (`roles/iam.serviceAccountTokenCreator`)"],
    w: [["Service Account User", "Service Account User", "Service Account User"], ["Service Account Key Admin", "Service Account Key Admin", "Service Account Key Admin"], ["Viewer on the project", "Viewer sur le projet", "Viewer en el proyecto"]],
    e: [
      "Impersonation asks IAM for a short-lived access token for the account (`getAccessToken`). Service Account User only allows attaching the account to resources. Short-lived tokens, logged in the audit logs with both identities, replace downloaded keys for people and CI.",
      "L'emprunt d'identité demande à IAM un jeton d'accès de courte durée pour le compte (`getAccessToken`). Service Account User ne permet que d'attacher le compte à des ressources. Les jetons courts, journalisés avec les deux identités, remplacent les clés téléchargées pour les personnes et la CI.",
      "La suplantación pide a IAM un token de acceso de corta duración para la cuenta (`getAccessToken`). Service Account User solo permite asociar la cuenta a recursos. Los tokens cortos, registrados en auditoría con las dos identidades, sustituyen a las claves descargadas para personas y CI.",
    ],
  },
  {
    id: "gc-imp-03",
    q: ["Why grant Token Creator on one service account rather than on the project?", "Pourquoi accorder Token Creator sur un compte de service plutôt que sur le projet ?", "¿Por qué conceder Token Creator sobre una cuenta de servicio y no sobre el proyecto?"],
    a: ["On the project it covers every service account in it, including the most privileged", "Sur le projet, il couvre tous les comptes de service qu'il contient, y compris les plus privilégiés", "En el proyecto cubre todas sus cuentas de servicio, incluidas las más privilegiadas"],
    w: [["Project-level grants are not allowed for this role", "Les attributions au niveau du projet sont interdites pour ce rôle", "Las concesiones a nivel de proyecto no están permitidas para este rol"], ["It costs more on the project", "Cela coûte plus cher sur le projet", "Cuesta más en el proyecto"], ["There is no difference", "Il n'y a aucune différence", "No hay diferencia"]],
    e: [
      "A service account is a resource under its project, so a project grant is inherited by all of them. Anyone with Token Creator there can become any of them, an easy privilege escalation. Keep powerful service accounts in a dedicated project with few people on it.",
      "Un compte de service est une ressource sous son projet : une attribution sur le projet est héritée par tous. Quiconque y a Token Creator peut devenir n'importe lequel, une élévation de privilèges facile. Garder les comptes de service puissants dans un projet dédié, avec peu de monde dessus.",
      "Una cuenta de servicio es un recurso bajo su proyecto, así que una concesión en el proyecto la heredan todas. Quien tenga ahí Token Creator puede convertirse en cualquiera de ellas, una escalada de privilegios fácil. Guardar las cuentas de servicio poderosas en un proyecto dedicado, con poca gente.",
    ],
  },
  {
    id: "gc-imp-04",
    q: ["How long does an access token from impersonation or the metadata server last by default?", "Combien de temps dure par défaut un jeton d'accès obtenu par emprunt d'identité ou par le serveur de métadonnées ?", "¿Cuánto dura por defecto un token de acceso obtenido por suplantación o del servidor de metadatos?"],
    a: ["One hour", "Une heure", "Una hora"],
    w: [["Until revoked by hand", "Jusqu'à révocation manuelle", "Hasta que se revoque a mano"], ["Ten years, like a key", "Dix ans, comme une clé", "Diez años, como una clave"], ["Thirty seconds", "Trente secondes", "Treinta segundos"]],
    e: [
      "Short lifetimes limit the damage of a leaked token; libraries refresh tokens on their own. A service account key, by contrast, stays valid until deleted, unless an organisation policy sets an expiry for keys.",
      "Une durée courte limite les dégâts d'un jeton divulgué ; les bibliothèques renouvellent les jetons seules. Une clé de compte de service, elle, reste valable jusqu'à sa suppression, sauf si une règle d'administration fixe une expiration des clés.",
      "Una duración corta limita el daño de un token filtrado; las bibliotecas renuevan los tokens solas. Una clave de cuenta de servicio, en cambio, sigue válida hasta que se borra, salvo que una política de organización fije una caducidad para las claves.",
    ],
  },
  {
    id: "gc-imp-05",
    q: ["In audit logs, an action done by impersonation shows what?", "Dans les journaux d'audit, une action faite par emprunt d'identité montre quoi ?", "En los registros de auditoría, ¿qué muestra una acción hecha por suplantación?"],
    a: ["The service account as the caller, and the delegation chain with the person who impersonated it", "Le compte de service comme appelant, et la chaîne de délégation avec la personne qui l'a emprunté", "La cuenta de servicio como llamante, y la cadena de delegación con la persona que la suplantó"],
    w: [["Only the service account: the person is invisible", "Seulement le compte de service : la personne est invisible", "Solo la cuenta de servicio: la persona es invisible"], ["Only the person", "Seulement la personne", "Solo la persona"], ["Nothing: impersonated calls are not logged", "Rien : les appels avec emprunt ne sont pas journalisés", "Nada: las llamadas suplantadas no se registran"]],
    e: [
      "`serviceAccountDelegationInfo` in the log entry names the original principal. This is a key advantage over shared keys, where every action looks like the service account alone.",
      "`serviceAccountDelegationInfo` dans l'entrée de journal nomme le principal d'origine. C'est un avantage clé sur les clés partagées, où chaque action semble venir du seul compte de service.",
      "`serviceAccountDelegationInfo` en la entrada del registro nombra al principal original. Es una ventaja clave frente a las claves compartidas, donde cada acción parece venir solo de la cuenta de servicio.",
    ],
  },
];

const audit: GcpQuestion[] = [
  {
    id: "gc-aud-01",
    q: ["Which audit logs are off by default and must be enabled to see who read data?", "Quels journaux d'audit sont désactivés par défaut et doivent être activés pour voir qui a lu des données ?", "¿Qué registros de auditoría están desactivados por defecto y hay que activar para ver quién leyó datos?"],
    a: ["Data Access logs (except for BigQuery, where they are on)", "Les journaux Data Access (sauf pour BigQuery, où ils sont activés)", "Los registros Data Access (salvo en BigQuery, donde están activos)"],
    w: [["Admin Activity logs", "Les journaux Admin Activity", "Los registros Admin Activity"], ["System Event logs", "Les journaux System Event", "Los registros System Event"], ["None: all audit logs are always on", "Aucun : tous les journaux d'audit sont toujours actifs", "Ninguno: todos los registros de auditoría están siempre activos"]],
    e: [
      "Data Access logs can be voluminous and are billed as log storage, so they are enabled per service and per log type (`DATA_READ`, `DATA_WRITE`, `ADMIN_READ`), often at the organisation for sensitive services. Admin Activity and System Event logs are always written; Policy Denied logs are written by default.",
      "Les journaux Data Access peuvent être volumineux et sont facturés comme stockage de journaux : on les active par service et par type (`DATA_READ`, `DATA_WRITE`, `ADMIN_READ`), souvent au niveau de l'organisation pour les services sensibles. Les journaux Admin Activity et System Event sont toujours écrits ; les journaux Policy Denied le sont par défaut.",
      "Los registros Data Access pueden ser voluminosos y se facturan como almacenamiento de registros, así que se activan por servicio y por tipo (`DATA_READ`, `DATA_WRITE`, `ADMIN_READ`), a menudo en la organización para los servicios sensibles. Admin Activity y System Event se escriben siempre; Policy Denied se escribe por defecto.",
    ],
  },
  {
    id: "gc-aud-02",
    q: ["How long are logs kept in the `_Required` and `_Default` buckets?", "Combien de temps les journaux sont-ils gardés dans les buckets `_Required` et `_Default` ?", "¿Cuánto tiempo se guardan los registros en los buckets `_Required` y `_Default`?"],
    a: ["400 days in `_Required` (fixed, free); 30 days in `_Default` (configurable)", "400 jours dans `_Required` (fixe, gratuit) ; 30 jours dans `_Default` (réglable)", "400 días en `_Required` (fijo, gratis); 30 días en `_Default` (configurable)"],
    w: [["Forever in both", "Pour toujours dans les deux", "Para siempre en ambos"], ["7 days in both", "7 jours dans les deux", "7 días en ambos"], ["30 days in `_Required`, 400 in `_Default`", "30 jours dans `_Required`, 400 dans `_Default`", "30 días en `_Required`, 400 en `_Default`"]],
    e: [
      "`_Required` holds Admin Activity and System Event audit logs. For longer retention or analysis, route logs with a sink to a log bucket with custom retention, BigQuery, Cloud Storage or Pub/Sub; an aggregated sink at the organisation collects every project's.",
      "`_Required` contient les journaux d'audit Admin Activity et System Event. Pour une rétention plus longue ou de l'analyse, router les journaux avec un récepteur (sink) vers un bucket de journaux à rétention choisie, BigQuery, Cloud Storage ou Pub/Sub ; un récepteur agrégé à l'organisation collecte ceux de tous les projets.",
      "`_Required` contiene los registros Admin Activity y System Event. Para más retención o análisis, enviar los registros con un receptor (sink) a un bucket de registros con retención propia, BigQuery, Cloud Storage o Pub/Sub; un receptor agregado en la organización recoge los de todos los proyectos.",
    ],
  },
  {
    id: "gc-aud-03",
    q: ["Which Logs Explorer filter finds changes to IAM policies?", "Quel filtre de l'explorateur de journaux trouve les modifications de stratégies IAM ?", "¿Qué filtro del Explorador de registros encuentra los cambios en políticas de IAM?"],
    a: ["`protoPayload.methodName=\"SetIamPolicy\"`", "`protoPayload.methodName=\"SetIamPolicy\"`", "`protoPayload.methodName=\"SetIamPolicy\"`"],
    w: [["`severity=ERROR`", "`severity=ERROR`", "`severity=ERROR`"], ["`resource.type=\"iam_role\" AND text:grant`", "`resource.type=\"iam_role\" AND text:grant`", "`resource.type=\"iam_role\" AND text:grant`"], ["`logName:\"syslog\"`", "`logName:\"syslog\"`", "`logName:\"syslog\"`"]],
    e: [
      "Audit entries carry the method, the caller (`protoPayload.authenticationInfo.principalEmail`), and for IAM changes the binding deltas (`serviceData.policyDelta` or `metadata`). A log-based alert on this filter warns of grants made outside the usual pipeline.",
      "Les entrées d'audit portent la méthode, l'appelant (`protoPayload.authenticationInfo.principalEmail`) et, pour les changements IAM, les différences de liaisons (`serviceData.policyDelta` ou `metadata`). Une alerte basée sur ce filtre signale les attributions faites hors du pipeline habituel.",
      "Las entradas de auditoría llevan el método, el llamante (`protoPayload.authenticationInfo.principalEmail`) y, para cambios de IAM, las diferencias de vinculaciones (`serviceData.policyDelta` o `metadata`). Una alerta basada en este filtro avisa de concesiones hechas fuera del pipeline habitual.",
    ],
  },
  {
    id: "gc-aud-04",
    q: ["Why route the organisation's audit logs to a separate, locked-down project?", "Pourquoi envoyer les journaux d'audit de l'organisation vers un projet séparé et verrouillé ?", "¿Por qué enviar los registros de auditoría de la organización a un proyecto aparte y cerrado?"],
    a: ["So that the people who administer workloads cannot alter or delete the trail of what they did", "Pour que ceux qui administrent les charges de travail ne puissent pas modifier ni supprimer la trace de ce qu'ils ont fait", "Para que quienes administran las cargas de trabajo no puedan alterar ni borrar el rastro de lo que hicieron"],
    w: [["Logs are free only in a separate project", "Les journaux ne sont gratuits que dans un projet séparé", "Los registros solo son gratis en un proyecto aparte"], ["Audit logs cannot be read in their own project", "Les journaux d'audit ne sont pas lisibles dans leur propre projet", "Los registros de auditoría no se pueden leer en su propio proyecto"], ["It makes logging faster", "Cela accélère la journalisation", "Hace que el registro sea más rápido"]],
    e: [
      "An aggregated sink at the organisation sends every project's audit logs to a bucket in a security project, with a retention lock if needed. Project owners keep reading their own logs, but the copy of record is out of their reach.",
      "Un récepteur agrégé à l'organisation envoie les journaux d'audit de chaque projet vers un bucket d'un projet de sécurité, avec un verrou de rétention si besoin. Les propriétaires de projets lisent toujours leurs propres journaux, mais la copie de référence est hors de leur portée.",
      "Un receptor agregado en la organización envía los registros de auditoría de cada proyecto a un bucket de un proyecto de seguridad, con bloqueo de retención si hace falta. Los propietarios de proyectos siguen leyendo sus registros, pero la copia de referencia queda fuera de su alcance.",
    ],
  },
];

const connectivity: GcpQuestion[] = [
  {
    id: "gc-con-01",
    q: ["What is Shared VPC?", "Qu'est-ce que Shared VPC ?", "¿Qué es Shared VPC?"],
    a: ["A host project owns the network; service projects attach to it and create resources in its subnets", "Un projet hôte possède le réseau ; des projets de service s'y rattachent et créent des ressources dans ses sous-réseaux", "Un proyecto host posee la red; los proyectos de servicio se conectan a ella y crean recursos en sus subredes"],
    w: [["Peering between two VPC networks", "Un appairage entre deux réseaux VPC", "Un peering entre dos redes VPC"], ["A VPN shared by several companies", "Un VPN partagé par plusieurs entreprises", "Una VPN compartida por varias empresas"], ["A network copied into each project", "Un réseau copié dans chaque projet", "Una red copiada en cada proyecto"]],
    e: [
      "A central network team manages subnets, firewalls, routes and hybrid links once; application teams get `roles/compute.networkUser` on the subnets they may use. Billing and IAM for workloads stay in their own projects. It is the usual base of a landing zone.",
      "Une équipe réseau centrale gère une seule fois sous-réseaux, pare-feu, routes et liaisons hybrides ; les équipes applicatives reçoivent `roles/compute.networkUser` sur les sous-réseaux qu'elles peuvent utiliser. Facturation et IAM des charges restent dans leurs projets. C'est la base habituelle d'une landing zone.",
      "Un equipo de red central gestiona una sola vez subredes, firewalls, rutas y enlaces híbridos; los equipos de aplicación reciben `roles/compute.networkUser` en las subredes que pueden usar. La facturación y el IAM de las cargas se quedan en sus proyectos. Es la base habitual de una landing zone.",
    ],
  },
  {
    id: "gc-con-02",
    q: ["Network A is peered with B, and B with C. Can A reach C through B?", "Le réseau A est appairé avec B, et B avec C. A peut-il atteindre C via B ?", "La red A tiene peering con B, y B con C. ¿Puede A llegar a C a través de B?"],
    a: ["No: VPC Network Peering is not transitive", "Non : l'appairage de réseaux VPC n'est pas transitif", "No: el peering de redes VPC no es transitivo"],
    w: [["Yes, routes are shared along the chain", "Oui, les routes se transmettent le long de la chaîne", "Sí, las rutas se comparten a lo largo de la cadena"], ["Yes, if all three are in the same region", "Oui, si les trois sont dans la même région", "Sí, si las tres están en la misma región"], ["Only for ICMP", "Seulement pour ICMP", "Solo para ICMP"]],
    e: [
      "Each pair needs its own peering, and peered networks cannot have overlapping subnet ranges. For hub-and-spoke designs, Network Connectivity Center, VPN or Private Service Connect are used instead. Firewall rules still apply on both sides.",
      "Chaque paire a besoin de son propre appairage, et des réseaux appairés ne peuvent pas avoir de plages de sous-réseaux qui se chevauchent. Pour des architectures en étoile, on utilise plutôt Network Connectivity Center, un VPN ou Private Service Connect. Les règles de pare-feu s'appliquent toujours des deux côtés.",
      "Cada par necesita su propio peering, y las redes con peering no pueden tener rangos de subred solapados. Para diseños en estrella se usan Network Connectivity Center, VPN o Private Service Connect. Las reglas de firewall siguen aplicándose en ambos lados.",
    ],
  },
  {
    id: "gc-con-03",
    q: ["How do admins SSH to VMs that have no external IP, without a bastion?", "Comment des administrateurs se connectent-ils en SSH à des VM sans IP externe, sans bastion ?", "¿Cómo entran por SSH los administradores en VM sin IP externa, sin bastión?"],
    a: ["IAP TCP forwarding: allow ingress from `35.235.240.0/20` and grant `roles/iap.tunnelResourceAccessor`", "Le transfert TCP d'IAP : autoriser l'entrée depuis `35.235.240.0/20` et accorder `roles/iap.tunnelResourceAccessor`", "El reenvío TCP de IAP: permitir la entrada desde `35.235.240.0/20` y conceder `roles/iap.tunnelResourceAccessor`"],
    w: [["Open port 22 from `0.0.0.0/0`", "Ouvrir le port 22 depuis `0.0.0.0/0`", "Abrir el puerto 22 desde `0.0.0.0/0`"], ["It is impossible without an external IP", "C'est impossible sans IP externe", "Es imposible sin IP externa"], ["Through Cloud NAT, inbound", "Par Cloud NAT, en entrée", "Mediante Cloud NAT, en entrada"]],
    e: [
      "`gcloud compute ssh VM --tunnel-through-iap` wraps SSH in an HTTPS tunnel that IAP authorises with IAM, per user, and logs. Only IAP's range needs the firewall opening. OS Login then ties Linux accounts to Google identities.",
      "`gcloud compute ssh VM --tunnel-through-iap` enveloppe SSH dans un tunnel HTTPS qu'IAP autorise par IAM, utilisateur par utilisateur, et journalise. Seule la plage d'IAP doit être ouverte dans le pare-feu. OS Login relie ensuite les comptes Linux aux identités Google.",
      "`gcloud compute ssh VM --tunnel-through-iap` envuelve SSH en un túnel HTTPS que IAP autoriza con IAM, por usuario, y registra. Solo hay que abrir en el firewall el rango de IAP. OS Login liga después las cuentas de Linux a identidades de Google.",
    ],
  },
  {
    id: "gc-con-04",
    q: ["What does Private Google Access, enabled on a subnet, allow?", "Que permet Private Google Access, activé sur un sous-réseau ?", "¿Qué permite Private Google Access, activado en una subred?"],
    a: ["VMs without external IPs in that subnet can reach Google APIs and services (Cloud Storage, BigQuery…)", "Les VM sans IP externe de ce sous-réseau peuvent atteindre les API et services Google (Cloud Storage, BigQuery…)", "Las VM sin IP externa de esa subred pueden llegar a las API y servicios de Google (Cloud Storage, BigQuery…)"],
    w: [["The internet can reach those VMs privately", "Internet peut atteindre ces VM en privé", "Internet puede llegar a esas VM en privado"], ["The VMs can reach any website", "Les VM peuvent atteindre n'importe quel site", "Las VM pueden llegar a cualquier web"], ["Google support can log in to the VMs", "Le support Google peut se connecter aux VM", "El soporte de Google puede entrar en las VM"]],
    e: [
      "It is set per subnet and only concerns Google's APIs; general internet access needs Cloud NAT. With VPC Service Controls, the `restricted.googleapis.com` range routes API traffic to perimeter-aware endpoints. On-premises hosts use the same idea through Private Service Connect or the private ranges.",
      "Il se règle par sous-réseau et ne concerne que les API Google ; l'accès général à internet demande Cloud NAT. Avec VPC Service Controls, la plage `restricted.googleapis.com` dirige le trafic vers des points de terminaison qui respectent le périmètre. Les hôtes sur site utilisent la même idée via Private Service Connect ou les plages privées.",
      "Se configura por subred y solo afecta a las API de Google; el acceso general a internet requiere Cloud NAT. Con VPC Service Controls, el rango `restricted.googleapis.com` dirige el tráfico a endpoints que respetan el perímetro. Los equipos locales usan la misma idea con Private Service Connect o los rangos privados.",
    ],
  },
  {
    id: "gc-con-05",
    q: ["A VM must not run with an external IP anywhere in the organisation. How is that enforced?", "Aucune VM ne doit avoir d'IP externe dans l'organisation. Comment l'imposer ?", "Ninguna VM debe tener IP externa en la organización. ¿Cómo se impone?"],
    a: ["The organisation policy `compute.vmExternalIpAccess`, set to deny all (or allow a list of VMs)", "La règle d'administration `compute.vmExternalIpAccess`, réglée pour tout refuser (ou autoriser une liste de VM)", "La política de organización `compute.vmExternalIpAccess`, configurada para denegar todo (o permitir una lista de VM)"],
    w: [["A firewall rule denying egress", "Une règle de pare-feu refusant la sortie", "Una regla de firewall que deniega la salida"], ["Removing Compute Admin from everyone", "Retirer Compute Admin à tout le monde", "Quitar Compute Admin a todo el mundo"], ["A budget alert", "Une alerte de budget", "Una alerta de presupuesto"]],
    e: [
      "Organisation policies restrict configuration whoever has the IAM right to create VMs. Firewall rules filter traffic but an external IP would still exist. With no external IPs, outbound traffic goes through Cloud NAT and admin access through IAP.",
      "Les règles d'administration restreignent la configuration, quel que soit celui qui a le droit IAM de créer des VM. Les règles de pare-feu filtrent le trafic, mais une IP externe existerait quand même. Sans IP externe, la sortie passe par Cloud NAT et l'accès d'administration par IAP.",
      "Las políticas de organización restringen la configuración, tenga quien tenga el permiso de IAM para crear VM. Las reglas de firewall filtran el tráfico, pero la IP externa seguiría existiendo. Sin IP externas, la salida pasa por Cloud NAT y el acceso de administración por IAP.",
    ],
  },
];

const computeOps: GcpQuestion[] = [
  {
    id: "gc-ops-01",
    q: ["What does a managed instance group (MIG) add to plain VMs?", "Qu'apporte un groupe d'instances géré (MIG) par rapport à de simples VM ?", "¿Qué añade un grupo de instancias gestionado (MIG) frente a VM sueltas?"],
    a: ["Identical VMs from an instance template, with autoscaling, autohealing on a health check, and rolling updates", "Des VM identiques issues d'un modèle d'instance, avec autoscaling, réparation automatique sur health check et mises à jour progressives", "VM idénticas a partir de una plantilla de instancia, con autoescalado, autorreparación con health check y actualizaciones graduales"],
    w: [["A cheaper price per VM", "Un prix par VM plus bas", "Un precio por VM más bajo"], ["Shared disks between all VMs", "Des disques partagés entre toutes les VM", "Discos compartidos entre todas las VM"], ["Nothing: it is a label", "Rien : c'est un libellé", "Nada: es una etiqueta"]],
    e: [
      "Instance templates are immutable: a change means a new template and a rolling update. A regional MIG spreads VMs across zones. Autohealing recreates VMs that fail the health check, which needs firewall rules allowing the health checkers' ranges.",
      "Les modèles d'instance sont immuables : un changement veut dire un nouveau modèle et une mise à jour progressive. Un MIG régional répartit les VM sur plusieurs zones. La réparation automatique recrée les VM qui échouent au health check, ce qui demande des règles de pare-feu autorisant les plages des vérificateurs.",
      "Las plantillas de instancia son inmutables: un cambio implica una plantilla nueva y una actualización gradual. Un MIG regional reparte las VM entre zonas. La autorreparación recrea las VM que fallan el health check, lo que requiere reglas de firewall que permitan los rangos de los comprobadores.",
    ],
  },
  {
    id: "gc-ops-02",
    q: ["How does Cloud Run release a new version to 10 % of users first?", "Comment Cloud Run publie-t-il d'abord une nouvelle version pour 10 % des utilisateurs ?", "¿Cómo publica Cloud Run una versión nueva primero para el 10 % de los usuarios?"],
    a: ["Deploy a new revision with `--no-traffic`, then split traffic between revisions (90/10)", "Déployer une nouvelle révision avec `--no-traffic`, puis répartir le trafic entre révisions (90/10)", "Desplegar una revisión nueva con `--no-traffic` y luego repartir el tráfico entre revisiones (90/10)"],
    w: [["Create a second project for the new version", "Créer un second projet pour la nouvelle version", "Crear un segundo proyecto para la versión nueva"], ["It cannot: every deploy takes all traffic", "Impossible : chaque déploiement prend tout le trafic", "No puede: cada despliegue se lleva todo el tráfico"], ["Use a Spot instance for the new version", "Utiliser une instance Spot pour la nouvelle version", "Usar una instancia Spot para la versión nueva"]],
    e: [
      "Each deploy creates an immutable revision. `gcloud run services update-traffic --to-revisions=NEW=10` shifts a share; tags give a revision its own URL for testing. Rolling back is moving traffic back to the old revision.",
      "Chaque déploiement crée une révision immuable. `gcloud run services update-traffic --to-revisions=NEW=10` en déplace une part ; les tags donnent à une révision sa propre URL pour la tester. Revenir en arrière, c'est renvoyer le trafic vers l'ancienne révision.",
      "Cada despliegue crea una revisión inmutable. `gcloud run services update-traffic --to-revisions=NEW=10` desplaza una parte; las etiquetas dan a una revisión su propia URL para probarla. Volver atrás es devolver el tráfico a la revisión antigua.",
    ],
  },
  {
    id: "gc-ops-03",
    q: ["GKE Autopilot and GKE Standard differ how?", "Qu'est-ce qui distingue GKE Autopilot de GKE Standard ?", "¿En qué se diferencian GKE Autopilot y GKE Standard?"],
    a: ["Autopilot manages the nodes and bills per pod resources; Standard leaves node pools to you and bills per node", "Autopilot gère les nœuds et facture les ressources des pods ; Standard vous laisse les pools de nœuds et facture par nœud", "Autopilot gestiona los nodos y factura por recursos de los pods; Standard te deja los grupos de nodos y factura por nodo"],
    w: [["Autopilot has no Kubernetes API", "Autopilot n'a pas d'API Kubernetes", "Autopilot no tiene API de Kubernetes"], ["Standard is free", "Standard est gratuit", "Standard es gratis"], ["Autopilot runs only one pod", "Autopilot ne fait tourner qu'un pod", "Autopilot solo ejecuta un pod"]],
    e: [
      "Autopilot applies hardened defaults (no privileged pods, Workload Identity on) and handles node upgrades, sizing and security. Standard suits workloads needing node-level control: custom kernels, specific machine types, daemon sets that need privilege.",
      "Autopilot applique des réglages durcis (pas de pods privilégiés, Workload Identity actif) et s'occupe des mises à jour, du dimensionnement et de la sécurité des nœuds. Standard convient aux charges qui ont besoin du contrôle des nœuds : noyaux spécifiques, types de machines précis, daemonsets privilégiés.",
      "Autopilot aplica valores reforzados (sin pods privilegiados, Workload Identity activado) y se ocupa de actualizar, dimensionar y asegurar los nodos. Standard sirve para cargas que necesitan control de los nodos: kernels propios, tipos de máquina concretos, daemonsets privilegiados.",
    ],
  },
  {
    id: "gc-ops-04",
    q: ["A Cloud Run service must not be callable by the public, only by another service. How?", "Un service Cloud Run ne doit pas être appelable par le public, seulement par un autre service. Comment ?", "Un servicio de Cloud Run no debe poder llamarlo el público, solo otro servicio. ¿Cómo?"],
    a: ["Require authentication and grant `roles/run.invoker` to the caller's service account; the caller sends an ID token", "Exiger l'authentification et accorder `roles/run.invoker` au compte de service de l'appelant ; l'appelant envoie un jeton d'identité", "Exigir autenticación y conceder `roles/run.invoker` a la cuenta de servicio del llamante; el llamante envía un token de identidad"],
    w: [["Grant `roles/run.invoker` to `allUsers`", "Accorder `roles/run.invoker` à `allUsers`", "Conceder `roles/run.invoker` a `allUsers`"], ["Keep the URL secret", "Garder l'URL secrète", "Mantener la URL en secreto"], ["Put an API key in the query string", "Mettre une clé d'API dans l'URL", "Poner una clave de API en la URL"]],
    e: [
      "Cloud Run checks the `Authorization: Bearer` OIDC token, whose audience is the service's URL, against IAM before the request reaches the container. Ingress settings (internal only, or via a load balancer) restrict the network path as well.",
      "Cloud Run vérifie le jeton OIDC `Authorization: Bearer`, dont l'audience est l'URL du service, face à IAM, avant que la requête n'atteigne le conteneur. Les réglages d'entrée (interne seulement, ou via un équilibreur) restreignent aussi le chemin réseau.",
      "Cloud Run comprueba el token OIDC `Authorization: Bearer`, cuya audiencia es la URL del servicio, frente a IAM antes de que la petición llegue al contenedor. Los ajustes de entrada (solo interno, o mediante un balanceador) restringen también el camino de red.",
    ],
  },
];

const storageAccess: GcpQuestion[] = [
  {
    id: "gc-sa2-01",
    q: ["What does uniform bucket-level access change?", "Que change l'accès uniforme au niveau du bucket ?", "¿Qué cambia el acceso uniforme a nivel de bucket?"],
    a: ["Object ACLs are disabled: access is decided by IAM only, on the bucket and above", "Les ACL des objets sont désactivées : l'accès se décide uniquement par IAM, sur le bucket et au-dessus", "Las ACL de los objetos se desactivan: el acceso lo decide solo IAM, en el bucket y por encima"],
    w: [["Every object becomes public", "Chaque objet devient public", "Cada objeto pasa a ser público"], ["Objects can only be read from the bucket's region", "Les objets ne se lisent que depuis la région du bucket", "Los objetos solo se leen desde la región del bucket"], ["IAM is disabled in favour of ACLs", "IAM est désactivé au profit des ACL", "IAM se desactiva en favor de las ACL"]],
    e: [
      "Two parallel systems (IAM and per-object ACLs) made it hard to know who could read what. With uniform access, one IAM policy answers it, conditions and deny policies apply, and audits are simpler. It is enforced by default in secure-by-default organisations.",
      "Deux systèmes parallèles (IAM et ACL par objet) rendaient difficile de savoir qui pouvait lire quoi. Avec l'accès uniforme, une seule stratégie IAM répond, les conditions et les refus s'appliquent, et les audits sont plus simples. Il est imposé par défaut dans les organisations sécurisées par défaut.",
      "Dos sistemas paralelos (IAM y ACL por objeto) hacían difícil saber quién podía leer qué. Con el acceso uniforme, una sola política de IAM lo dice, se aplican condiciones y denegaciones, y las auditorías son más simples. Se impone por defecto en las organizaciones seguras por defecto.",
    ],
  },
  {
    id: "gc-sa2-02",
    q: ["A user without a Google account must download one private file for a day. What fits?", "Un utilisateur sans compte Google doit télécharger un fichier privé pendant une journée. Qu'est-ce qui convient ?", "Un usuario sin cuenta de Google debe descargar un archivo privado durante un día. ¿Qué encaja?"],
    a: ["A signed URL that expires after a day", "Une URL signée qui expire au bout d'un jour", "Una URL firmada que caduca al cabo de un día"],
    w: [["Make the bucket public for a day", "Rendre le bucket public pour une journée", "Hacer público el bucket durante un día"], ["Send them a service account key", "Lui envoyer une clé de compte de service", "Enviarle una clave de cuenta de servicio"], ["Grant `allUsers` Object Viewer on the object", "Accorder Object Viewer à `allUsers` sur l'objet", "Conceder Object Viewer a `allUsers` sobre el objeto"]],
    e: [
      "A signed URL embeds a signature by a service account, granting one operation on one object until it expires (at most 7 days with V4 signing). Anyone holding the URL can use it until then, so keep the lifetime short.",
      "Une URL signée contient la signature d'un compte de service et accorde une opération sur un objet jusqu'à son expiration (7 jours au plus avec la signature V4). Quiconque détient l'URL peut l'utiliser jusque-là : garder la durée courte.",
      "Una URL firmada lleva la firma de una cuenta de servicio y concede una operación sobre un objeto hasta que caduca (7 días como máximo con la firma V4). Quien tenga la URL puede usarla hasta entonces, así que conviene que dure poco.",
    ],
  },
  {
    id: "gc-sa2-03",
    q: ["How does an application on Cloud Run connect securely to Cloud SQL for PostgreSQL?", "Comment une application sur Cloud Run se connecte-t-elle de façon sûre à Cloud SQL pour PostgreSQL ?", "¿Cómo se conecta de forma segura una aplicación en Cloud Run a Cloud SQL para PostgreSQL?"],
    a: ["Through the Cloud SQL connector or Auth Proxy, authorised by IAM (`roles/cloudsql.client`), possibly with IAM database authentication instead of a password", "Par le connecteur Cloud SQL ou l'Auth Proxy, autorisé par IAM (`roles/cloudsql.client`), éventuellement avec l'authentification IAM à la base au lieu d'un mot de passe", "Mediante el conector de Cloud SQL o el Auth Proxy, autorizado por IAM (`roles/cloudsql.client`), quizá con autenticación de IAM a la base en lugar de contraseña"],
    w: [["Open port 5432 of the instance to `0.0.0.0/0`", "Ouvrir le port 5432 de l'instance à `0.0.0.0/0`", "Abrir el puerto 5432 de la instancia a `0.0.0.0/0`"], ["Store the superuser password in the image", "Stocker le mot de passe superutilisateur dans l'image", "Guardar la contraseña de superusuario en la imagen"], ["It is impossible from Cloud Run", "C'est impossible depuis Cloud Run", "Es imposible desde Cloud Run"]],
    e: [
      "The connector opens a TLS tunnel whose authorisation is IAM, not IP allowlists. With a private IP, traffic stays in the VPC. IAM database authentication logs in as the service account with short-lived tokens, so no database password has to be stored.",
      "Le connecteur ouvre un tunnel TLS autorisé par IAM, pas par des listes d'IP. Avec une IP privée, le trafic reste dans le VPC. L'authentification IAM à la base se connecte en tant que compte de service avec des jetons courts : aucun mot de passe de base à stocker.",
      "El conector abre un túnel TLS autorizado por IAM, no por listas de IP. Con IP privada, el tráfico se queda en la VPC. La autenticación de IAM a la base entra como la cuenta de servicio con tokens cortos, así que no hay que guardar ninguna contraseña de base de datos.",
    ],
  },
  {
    id: "gc-sa2-04",
    q: ["A bucket must never be made public by mistake. What prevents it?", "Un bucket ne doit jamais devenir public par erreur. Qu'est-ce qui l'empêche ?", "Un bucket no debe hacerse público nunca por error. ¿Qué lo impide?"],
    a: ["Public access prevention, on the bucket or enforced by organisation policy", "La prévention de l'accès public, sur le bucket ou imposée par règle d'administration", "La prevención de acceso público, en el bucket o impuesta por política de organización"],
    w: [["Choosing the Archive storage class", "Choisir la classe de stockage Archive", "Elegir la clase de almacenamiento Archive"], ["Enabling object versioning", "Activer le versionnage des objets", "Activar el control de versiones de objetos"], ["A lifecycle rule", "Une règle de cycle de vie", "Una regla de ciclo de vida"]],
    e: [
      "With public access prevention, grants to `allUsers` and `allAuthenticatedUsers` are refused, and existing public access stops. Domain-restricted sharing blocks them too. Versioning and lifecycle rules manage data, not access.",
      "Avec la prévention de l'accès public, les attributions à `allUsers` et `allAuthenticatedUsers` sont refusées et l'accès public existant cesse. Le partage restreint au domaine les bloque aussi. Versionnage et cycle de vie gèrent les données, pas l'accès.",
      "Con la prevención de acceso público, las concesiones a `allUsers` y `allAuthenticatedUsers` se rechazan y el acceso público existente se corta. El uso compartido restringido al dominio también las bloquea. El control de versiones y el ciclo de vida gestionan datos, no acceso.",
    ],
  },
];

const terraform: GcpQuestion[] = [
  {
    id: "gc-tf-01",
    q: ["Terraform's `google_project_iam_member`, `_binding` and `_policy`: which can wipe grants made outside Terraform?", "`google_project_iam_member`, `_binding` et `_policy` dans Terraform : lequel peut effacer des attributions faites hors de Terraform ?", "`google_project_iam_member`, `_binding` y `_policy` en Terraform: ¿cuál puede borrar concesiones hechas fuera de Terraform?"],
    a: ["`_policy` (the whole policy) and `_binding` (all members of one role); `_member` only adds one member", "`_policy` (toute la stratégie) et `_binding` (tous les membres d'un rôle) ; `_member` n'ajoute qu'un membre", "`_policy` (toda la política) y `_binding` (todos los miembros de un rol); `_member` solo añade un miembro"],
    w: [["None: Terraform never removes grants", "Aucun : Terraform ne retire jamais d'attribution", "Ninguno: Terraform nunca quita concesiones"], ["Only `_member`", "Seulement `_member`", "Solo `_member`"], ["All three equally", "Les trois également", "Los tres por igual"]],
    e: [
      "`_policy` is authoritative for the project's whole policy: a wrong one can lock everyone out, Google-managed service agents included. `_binding` is authoritative for one role. Mixing `_binding` and `_member` for the same role makes them fight. Most teams use `_member`.",
      "`_policy` fait autorité sur toute la stratégie du projet : une erreur peut bloquer tout le monde, agents de service de Google compris. `_binding` fait autorité sur un rôle. Mélanger `_binding` et `_member` pour le même rôle les fait se combattre. La plupart des équipes utilisent `_member`.",
      "`_policy` es autoritativo sobre toda la política del proyecto: un error puede dejar fuera a todos, agentes de servicio de Google incluidos. `_binding` es autoritativo sobre un rol. Mezclar `_binding` y `_member` para el mismo rol los hace pelear. La mayoría de equipos usa `_member`.",
    ],
  },
  {
    id: "gc-tf-02",
    q: ["Where should a team keep Terraform state for Google Cloud?", "Où une équipe doit-elle garder l'état Terraform pour Google Cloud ?", "¿Dónde debe guardar un equipo el estado de Terraform para Google Cloud?"],
    a: ["In a Cloud Storage bucket (`gcs` backend), versioned, with locking and access limited to the pipeline", "Dans un bucket Cloud Storage (backend `gcs`), versionné, avec verrouillage et accès limité au pipeline", "En un bucket de Cloud Storage (backend `gcs`), con versiones, bloqueo y acceso limitado al pipeline"],
    w: [["In the Git repository, committed after each apply", "Dans le dépôt Git, commité après chaque apply", "En el repositorio Git, con un commit tras cada apply"], ["On each developer's laptop", "Sur le portable de chaque développeur", "En el portátil de cada desarrollador"], ["Nowhere: Terraform reads the cloud each time", "Nulle part : Terraform relit le cloud à chaque fois", "En ninguna parte: Terraform relee la nube cada vez"]],
    e: [
      "State maps configuration to real resources and can contain secrets, so it is stored remotely, encrypted and access-controlled. The `gcs` backend locks the state during operations, so two applies do not collide; versioning recovers a damaged state.",
      "L'état fait correspondre la configuration aux ressources réelles et peut contenir des secrets : il se stocke à distance, chiffré et à accès contrôlé. Le backend `gcs` verrouille l'état pendant les opérations, pour que deux apply ne se télescopent pas ; le versionnage récupère un état abîmé.",
      "El estado relaciona la configuración con los recursos reales y puede contener secretos, así que se guarda en remoto, cifrado y con acceso controlado. El backend `gcs` bloquea el estado durante las operaciones, para que dos apply no choquen; las versiones recuperan un estado dañado.",
    ],
  },
  {
    id: "gc-tf-03",
    q: ["Cloud Deployment Manager templates must be migrated. To what?", "Des modèles Cloud Deployment Manager doivent être migrés. Vers quoi ?", "Hay que migrar plantillas de Cloud Deployment Manager. ¿A qué?"],
    a: ["Terraform, possibly run by Infrastructure Manager; Deployment Manager reached end of support in 2026", "Terraform, éventuellement exécuté par Infrastructure Manager ; Deployment Manager est arrivé en fin de support en 2026", "Terraform, quizá ejecutado por Infrastructure Manager; Deployment Manager llegó al fin de soporte en 2026"],
    w: [["Deployment Manager v3", "Deployment Manager v3", "Deployment Manager v3"], ["Shell scripts with `gcloud`, the recommended path", "Des scripts shell avec `gcloud`, la voie recommandée", "Scripts de shell con `gcloud`, el camino recomendado"], ["Nothing: it is still the recommended tool", "Rien : il reste l'outil recommandé", "Nada: sigue siendo la herramienta recomendada"]],
    e: [
      "Infrastructure Manager runs Terraform for you in Google Cloud, with state managed by the service. DM Convert helps translate templates. Config Connector is the Kubernetes-style alternative, managing Google Cloud resources as Kubernetes objects.",
      "Infrastructure Manager exécute Terraform pour vous dans Google Cloud, avec un état géré par le service. DM Convert aide à traduire les modèles. Config Connector est l'alternative façon Kubernetes, qui gère les ressources Google Cloud comme des objets Kubernetes.",
      "Infrastructure Manager ejecuta Terraform por ti en Google Cloud, con el estado gestionado por el servicio. DM Convert ayuda a traducir las plantillas. Config Connector es la alternativa al estilo Kubernetes, que gestiona los recursos de Google Cloud como objetos de Kubernetes.",
    ],
  },
  {
    id: "gc-tf-04",
    q: ["Which identity should a CI pipeline use to run `terraform apply`?", "Quelle identité un pipeline de CI doit-il utiliser pour lancer `terraform apply` ?", "¿Qué identidad debe usar un pipeline de CI para ejecutar `terraform apply`?"],
    a: ["A dedicated service account, reached through Workload Identity Federation, with only the roles the configuration needs", "Un compte de service dédié, atteint par la fédération d'identité de charge de travail, avec seulement les rôles nécessaires à la configuration", "Una cuenta de servicio dedicada, alcanzada mediante la federación de identidades de cargas de trabajo, solo con los roles que necesita la configuración"],
    w: [["The personal account of the lead engineer", "Le compte personnel de l'ingénieur principal", "La cuenta personal del ingeniero principal"], ["A service account key stored as a CI secret, the recommended way", "Une clé de compte de service stockée comme secret de CI, la méthode recommandée", "Una clave de cuenta de servicio guardada como secreto de CI, la forma recomendada"], ["The Compute Engine default service account", "Le compte de service Compute Engine par défaut", "La cuenta de servicio predeterminada de Compute Engine"]],
    e: [
      "Federation exchanges the CI's own OIDC token (GitHub Actions, GitLab) for short-lived Google credentials: no key to leak or rotate. Separate service accounts per environment keep a staging pipeline from touching production.",
      "La fédération échange le jeton OIDC de la CI (GitHub Actions, GitLab) contre des identifiants Google de courte durée : aucune clé à divulguer ni à faire tourner. Des comptes de service séparés par environnement empêchent un pipeline de préproduction de toucher la production.",
      "La federación intercambia el token OIDC de la CI (GitHub Actions, GitLab) por credenciales de Google de corta duración: ninguna clave que filtrar ni rotar. Cuentas de servicio separadas por entorno impiden que un pipeline de preproducción toque producción.",
    ],
  },
];

export const hierarchy = { orgPolicies };
export const iam = { iamPractice };
export const serviceAccounts = { impersonation };
export const security = { audit };
export const networking = { connectivity };
export const compute = { computeOps };
export const storage = { storageAccess };
export const operations = { terraform };
