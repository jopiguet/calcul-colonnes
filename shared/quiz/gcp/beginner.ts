/**
 * Google Cloud, Débutant: the resource hierarchy, IAM's vocabulary, service
 * accounts, first security habits, VPC networks, choosing where code runs,
 * storage, and the tools (gcloud, credentials, budgets). Code between
 * backticks is the same in the three languages.
 */
import type { LinuxQuestion as GcpQuestion } from "../linux/types";

const resourceBasics: GcpQuestion[] = [
  {
    id: "gc-res-01",
    q: ["What is the order of Google Cloud's resource hierarchy, top first?", "Quel est l'ordre de la hiérarchie des ressources de Google Cloud, du haut vers le bas ?", "¿Cuál es el orden de la jerarquía de recursos de Google Cloud, de arriba abajo?"],
    a: ["Organisation, folders, projects, then the resources (buckets, VMs…)", "Organisation, dossiers, projets, puis les ressources (buckets, VM…)", "Organización, carpetas, proyectos y luego los recursos (buckets, VM…)"],
    w: [["Projects, folders, organisation, resources", "Projets, dossiers, organisation, ressources", "Proyectos, carpetas, organización, recursos"], ["Billing account, regions, zones, projects", "Compte de facturation, régions, zones, projets", "Cuenta de facturación, regiones, zonas, proyectos"], ["Organisation, regions, projects, folders", "Organisation, régions, projets, dossiers", "Organización, regiones, proyectos, carpetas"]],
    e: [
      "The organisation is the root, tied to a Cloud Identity or Google Workspace domain. Folders group projects (by team, environment), and may nest. Every resource belongs to exactly one project. Policies (IAM, organisation policies) set higher up are inherited by everything below.",
      "L'organisation est la racine, liée à un domaine Cloud Identity ou Google Workspace. Les dossiers regroupent les projets (par équipe, par environnement) et peuvent s'imbriquer. Chaque ressource appartient à exactement un projet. Les stratégies (IAM, règles d'administration) posées plus haut sont héritées par tout ce qui est en dessous.",
      "La organización es la raíz, ligada a un dominio de Cloud Identity o Google Workspace. Las carpetas agrupan proyectos (por equipo, por entorno) y pueden anidarse. Cada recurso pertenece exactamente a un proyecto. Las políticas (IAM, políticas de organización) puestas más arriba las hereda todo lo que hay debajo.",
    ],
  },
  {
    id: "gc-res-02",
    q: ["A project has a name, an ID and a number. Which can be changed after creation?", "Un projet a un nom, un ID et un numéro. Lequel peut changer après la création ?", "Un proyecto tiene un nombre, un ID y un número. ¿Cuál se puede cambiar tras crearlo?"],
    a: ["Only the name; the ID (globally unique) and the number are fixed", "Seulement le nom ; l'ID (unique au monde) et le numéro sont fixes", "Solo el nombre; el ID (único en todo el mundo) y el número son fijos"],
    w: [["The ID, with `gcloud projects update`", "L'ID, avec `gcloud projects update`", "El ID, con `gcloud projects update`"], ["All three", "Les trois", "Los tres"], ["The number, when the project moves to another folder", "Le numéro, quand le projet change de dossier", "El número, cuando el proyecto cambia de carpeta"]],
    e: [
      "The project ID appears in URLs, bucket defaults and service account emails, so it is permanent and cannot be reused even after deletion. The number is assigned by Google and used by some APIs and service agents. A deleted project can be restored for about 30 days.",
      "L'ID du projet apparaît dans les URL, les valeurs par défaut des buckets et les adresses des comptes de service : il est permanent et ne peut pas être réutilisé, même après suppression. Le numéro est attribué par Google et utilisé par certaines API et les agents de service. Un projet supprimé peut être restauré pendant environ 30 jours.",
      "El ID del proyecto aparece en URLs, valores por defecto de buckets y correos de cuentas de servicio, así que es permanente y no se puede reutilizar ni tras borrarlo. El número lo asigna Google y lo usan algunas API y los agentes de servicio. Un proyecto borrado se puede restaurar durante unos 30 días.",
    ],
  },
  {
    id: "gc-res-03",
    q: ["What is the difference between a region and a zone?", "Quelle est la différence entre une région et une zone ?", "¿Cuál es la diferencia entre una región y una zona?"],
    a: ["A region (`europe-west6`) is a geographic area; it contains several zones (`europe-west6-a`), isolated failure domains", "Une région (`europe-west6`) est une zone géographique ; elle contient plusieurs zones (`europe-west6-a`), des domaines de panne isolés", "Una región (`europe-west6`) es un área geográfica; contiene varias zonas (`europe-west6-a`), dominios de fallo aislados"],
    w: [["They are synonyms", "Ce sont des synonymes", "Son sinónimos"], ["A zone contains several regions", "Une zone contient plusieurs régions", "Una zona contiene varias regiones"], ["Regions are for storage, zones for networks", "Les régions sont pour le stockage, les zones pour le réseau", "Las regiones son para almacenamiento, las zonas para redes"]],
    e: [
      "Resources are zonal (a VM, a persistent disk), regional (a subnet, a regional MIG, Cloud Run) or global (a VPC network, a global load balancer, IAM). Spreading across zones protects against a zone's failure; across regions, against a region's. Data residency is chosen by region: `europe-west6` is Zurich.",
      "Les ressources sont zonales (une VM, un disque persistant), régionales (un sous-réseau, un MIG régional, Cloud Run) ou globales (un réseau VPC, un équilibreur de charge global, IAM). Répartir sur plusieurs zones protège de la panne d'une zone ; sur plusieurs régions, de celle d'une région. La localisation des données se choisit par région : `europe-west6` est Zurich.",
      "Los recursos son zonales (una VM, un disco persistente), regionales (una subred, un MIG regional, Cloud Run) o globales (una red VPC, un balanceador global, IAM). Repartir en varias zonas protege del fallo de una zona; en varias regiones, del de una región. La residencia de los datos se elige por región: `europe-west6` es Zúrich.",
    ],
  },
  {
    id: "gc-res-04",
    q: ["How is a project paid for?", "Comment un projet est-il payé ?", "¿Cómo se paga un proyecto?"],
    a: ["It is linked to a Cloud Billing account, which can pay for many projects", "Il est lié à un compte de facturation Cloud Billing, qui peut payer plusieurs projets", "Se vincula a una cuenta de facturación de Cloud Billing, que puede pagar muchos proyectos"],
    w: [["Each project has its own credit card", "Chaque projet a sa propre carte bancaire", "Cada proyecto tiene su propia tarjeta"], ["The organisation pays automatically for every project", "L'organisation paie automatiquement chaque projet", "La organización paga automáticamente cada proyecto"], ["Projects are free; only folders are billed", "Les projets sont gratuits ; seuls les dossiers sont facturés", "Los proyectos son gratis; solo se facturan las carpetas"]],
    e: [
      "Billing accounts are separate from the resource hierarchy and have their own IAM roles (Billing Account Administrator, User, Viewer). Linking a project needs rights on both. Without an active billing account, paid services stop.",
      "Les comptes de facturation sont séparés de la hiérarchie des ressources et ont leurs propres rôles IAM (administrateur, utilisateur, lecteur du compte de facturation). Lier un projet demande des droits sur les deux. Sans compte de facturation actif, les services payants s'arrêtent.",
      "Las cuentas de facturación están separadas de la jerarquía de recursos y tienen sus propios roles de IAM (administrador, usuario, lector de la cuenta de facturación). Vincular un proyecto requiere permisos en ambos. Sin una cuenta de facturación activa, los servicios de pago se detienen.",
    ],
  },
  {
    id: "gc-res-05",
    q: ["Labels and tags on resources: what tells them apart?", "Libellés (labels) et tags sur les ressources : qu'est-ce qui les distingue ?", "Etiquetas (labels) y tags en los recursos: ¿qué los diferencia?"],
    a: ["Labels are metadata for organising and billing reports; tags are resources with their own IAM, usable in IAM conditions and firewall policies", "Les labels sont des métadonnées pour organiser et ventiler la facture ; les tags sont des ressources avec leur propre IAM, utilisables dans les conditions IAM et les stratégies de pare-feu", "Las labels son metadatos para organizar y desglosar la factura; los tags son recursos con su propio IAM, utilizables en condiciones de IAM y políticas de firewall"],
    w: [["Nothing: tags is the new name for labels", "Rien : tags est le nouveau nom des labels", "Nada: tags es el nombre nuevo de las labels"], ["Labels control access, tags only billing", "Les labels contrôlent l'accès, les tags seulement la facture", "Las labels controlan el acceso, los tags solo la factura"], ["Tags only exist on VMs", "Les tags n'existent que sur les VM", "Los tags solo existen en las VM"]],
    e: [
      "Anyone who can edit a resource can change its labels, so labels must not drive access. Resource Manager tags are defined centrally, granted through IAM, and inherited down the hierarchy, which makes them safe in conditions (\"production\" resources) and in deny policies. Network tags on VMs are a third, older notion used by VPC firewall rules.",
      "Quiconque peut modifier une ressource peut changer ses labels : ils ne doivent donc pas piloter l'accès. Les tags de Resource Manager sont définis de façon centrale, attribués via IAM et hérités le long de la hiérarchie, ce qui les rend sûrs dans les conditions (ressources « production ») et les stratégies de refus. Les tags réseau des VM sont une troisième notion, plus ancienne, utilisée par les règles de pare-feu VPC.",
      "Cualquiera que pueda editar un recurso puede cambiar sus labels, así que no deben decidir el acceso. Los tags de Resource Manager se definen de forma central, se conceden mediante IAM y se heredan por la jerarquía, lo que los hace seguros en condiciones (recursos de «producción») y en políticas de denegación. Las etiquetas de red de las VM son una tercera noción, más antigua, usada por las reglas de firewall de VPC.",
    ],
  },
];

const iamBasics: GcpQuestion[] = [
  {
    id: "gc-iam-01",
    q: ["In IAM, what does an allow policy bind together?", "Dans IAM, qu'est-ce qu'une stratégie d'autorisation associe ?", "En IAM, ¿qué une una política de permiso?"],
    a: ["Principals (who) to roles (collections of permissions), on the resource the policy is attached to", "Des principaux (qui) à des rôles (ensembles de permissions), sur la ressource à laquelle la stratégie est attachée", "Principales (quién) con roles (conjuntos de permisos), sobre el recurso al que está asociada la política"],
    w: [["Users to individual permissions, directly", "Des utilisateurs à des permissions isolées, directement", "Usuarios con permisos sueltos, directamente"], ["Projects to regions", "Des projets à des régions", "Proyectos con regiones"], ["Passwords to service accounts", "Des mots de passe à des comptes de service", "Contraseñas con cuentas de servicio"]],
    e: [
      "Permissions (`storage.objects.get`) are never granted directly: they come in roles (`roles/storage.objectViewer`). A binding says \"these members have this role here\". Each resource has one allow policy, and it is inherited by everything below the resource.",
      "Les permissions (`storage.objects.get`) ne s'accordent jamais directement : elles viennent dans des rôles (`roles/storage.objectViewer`). Une liaison dit « ces membres ont ce rôle ici ». Chaque ressource a une stratégie d'autorisation, héritée par tout ce qui est sous elle.",
      "Los permisos (`storage.objects.get`) nunca se conceden directamente: vienen en roles (`roles/storage.objectViewer`). Una vinculación dice «estos miembros tienen este rol aquí». Cada recurso tiene una política de permiso, que hereda todo lo que hay debajo.",
    ],
  },
  {
    id: "gc-iam-02",
    q: ["Why does Google advise against Owner, Editor and Viewer in production?", "Pourquoi Google déconseille-t-il Owner, Editor et Viewer en production ?", "¿Por qué Google desaconseja Owner, Editor y Viewer en producción?"],
    a: ["These basic roles hold thousands of permissions across every service: far more than any task needs", "Ces rôles de base contiennent des milliers de permissions sur tous les services : bien plus qu'une tâche n'en demande", "Estos roles básicos contienen miles de permisos de todos los servicios: mucho más de lo que necesita una tarea"],
    w: [["They are deprecated and will stop working", "Ils sont obsolètes et vont cesser de fonctionner", "Están obsoletos y dejarán de funcionar"], ["They cannot be granted on projects", "Ils ne peuvent pas être accordés sur des projets", "No se pueden conceder en proyectos"], ["They are paid roles", "Ce sont des rôles payants", "Son roles de pago"]],
    e: [
      "Editor can change almost anything in a project, including deleting data; it grows whenever a service adds permissions. Predefined roles (`roles/run.developer`, `roles/storage.objectViewer`) or custom roles follow least privilege. Basic roles also cannot carry IAM conditions.",
      "Editor peut modifier presque tout dans un projet, y compris supprimer des données ; il s'élargit chaque fois qu'un service ajoute des permissions. Les rôles prédéfinis (`roles/run.developer`, `roles/storage.objectViewer`) ou personnalisés suivent le moindre privilège. Les rôles de base ne peuvent pas non plus porter de conditions IAM.",
      "Editor puede cambiar casi todo en un proyecto, incluido borrar datos; crece cada vez que un servicio añade permisos. Los roles predefinidos (`roles/run.developer`, `roles/storage.objectViewer`) o personalizados siguen el mínimo privilegio. Los roles básicos tampoco admiten condiciones de IAM.",
    ],
  },
  {
    id: "gc-iam-03",
    q: ["Ten people need the same access to a project. What is the usual practice?", "Dix personnes ont besoin du même accès à un projet. Quelle est la pratique habituelle ?", "Diez personas necesitan el mismo acceso a un proyecto. ¿Cuál es la práctica habitual?"],
    a: ["Grant the role to a Google group and manage membership in the group", "Accorder le rôle à un groupe Google et gérer l'appartenance au groupe", "Conceder el rol a un grupo de Google y gestionar la pertenencia al grupo"],
    w: [["Share one user account between them", "Leur partager un seul compte utilisateur", "Compartir entre ellos una sola cuenta de usuario"], ["Give each a service account key", "Donner à chacun une clé de compte de service", "Dar a cada uno una clave de cuenta de servicio"], ["Grant the role to each user, then copy the policy to every project", "Accorder le rôle à chaque utilisateur, puis copier la stratégie dans chaque projet", "Conceder el rol a cada usuario y copiar la política a cada proyecto"]],
    e: [
      "A group binding (`group:sre@example.com`) keeps policies short and stable: joining or leaving the team changes the group, not every policy. It also makes access reviews simple. Shared accounts and keys handed to people destroy accountability in the audit logs.",
      "Une liaison à un groupe (`group:sre@example.com`) garde les stratégies courtes et stables : arriver ou quitter l'équipe change le groupe, pas chaque stratégie. Cela simplifie aussi les revues d'accès. Comptes partagés et clés remises à des personnes détruisent la traçabilité dans les journaux d'audit.",
      "Una vinculación a un grupo (`group:sre@example.com`) mantiene las políticas cortas y estables: entrar o salir del equipo cambia el grupo, no cada política. También simplifica las revisiones de acceso. Las cuentas compartidas y las claves entregadas a personas destruyen la trazabilidad en los registros de auditoría.",
    ],
  },
  {
    id: "gc-iam-04",
    q: ["How is a predefined role named?", "Comment s'écrit le nom d'un rôle prédéfini ?", "¿Cómo se escribe el nombre de un rol predefinido?"],
    a: ["`roles/SERVICE.IDENTIFIER`, e.g. `roles/compute.instanceAdmin.v1`", "`roles/SERVICE.IDENTIFIER`, par ex. `roles/compute.instanceAdmin.v1`", "`roles/SERVICE.IDENTIFIER`, p. ej. `roles/compute.instanceAdmin.v1`"],
    w: [["`projects/PROJECT/roles/NAME`", "`projects/PROJECT/roles/NAME`", "`projects/PROJECT/roles/NAME`"], ["`compute.instances.admin`", "`compute.instances.admin`", "`compute.instances.admin`"], ["`iam://compute/admin`", "`iam://compute/admin`", "`iam://compute/admin`"]],
    e: [
      "`projects/PROJECT/roles/NAME` (or `organizations/ORG/roles/NAME`) is a custom role. `compute.instances.start` is a permission: service, resource, verb. `gcloud iam roles describe roles/compute.instanceAdmin.v1` lists a role's permissions.",
      "`projects/PROJECT/roles/NAME` (ou `organizations/ORG/roles/NAME`) est un rôle personnalisé. `compute.instances.start` est une permission : service, ressource, verbe. `gcloud iam roles describe roles/compute.instanceAdmin.v1` liste les permissions d'un rôle.",
      "`projects/PROJECT/roles/NAME` (o `organizations/ORG/roles/NAME`) es un rol personalizado. `compute.instances.start` es un permiso: servicio, recurso, verbo. `gcloud iam roles describe roles/compute.instanceAdmin.v1` lista los permisos de un rol.",
    ],
  },
  {
    id: "gc-iam-05",
    q: ["Which command grants a role on a project without touching the other bindings?", "Quelle commande accorde un rôle sur un projet sans toucher aux autres liaisons ?", "¿Qué comando concede un rol en un proyecto sin tocar las demás vinculaciones?"],
    a: ["`gcloud projects add-iam-policy-binding PROJECT --member=user:ana@example.com --role=roles/viewer`", "`gcloud projects add-iam-policy-binding PROJECT --member=user:ana@example.com --role=roles/viewer`", "`gcloud projects add-iam-policy-binding PROJECT --member=user:ana@example.com --role=roles/viewer`"],
    w: [["`gcloud projects set-iam-policy PROJECT policy.json` with only the new binding", "`gcloud projects set-iam-policy PROJECT policy.json` avec seulement la nouvelle liaison", "`gcloud projects set-iam-policy PROJECT policy.json` solo con la vinculación nueva"], ["`gcloud iam roles create`", "`gcloud iam roles create`", "`gcloud iam roles create`"], ["`gcloud auth login ana@example.com`", "`gcloud auth login ana@example.com`", "`gcloud auth login ana@example.com`"]],
    e: [
      "`add-iam-policy-binding` reads the policy, adds the member, and writes it back. `set-iam-policy` replaces the whole policy with the file: a file holding one binding removes all the others, possibly the owners' own access. `gcloud iam roles create` defines a custom role; it grants nothing.",
      "`add-iam-policy-binding` lit la stratégie, ajoute le membre et la réécrit. `set-iam-policy` remplace toute la stratégie par le fichier : un fichier avec une seule liaison supprime toutes les autres, peut-être l'accès des propriétaires eux-mêmes. `gcloud iam roles create` définit un rôle personnalisé ; il n'accorde rien.",
      "`add-iam-policy-binding` lee la política, añade el miembro y la vuelve a escribir. `set-iam-policy` sustituye toda la política por el archivo: un archivo con una sola vinculación elimina todas las demás, quizá el acceso de los propios propietarios. `gcloud iam roles create` define un rol personalizado; no concede nada.",
    ],
  },
  {
    id: "gc-iam-06",
    q: ["What does \"least privilege\" mean in IAM?", "Que signifie « moindre privilège » dans IAM ?", "¿Qué significa «mínimo privilegio» en IAM?"],
    a: ["The narrowest role, on the lowest resource, for the shortest time that lets the task be done", "Le rôle le plus étroit, sur la ressource la plus basse, pour la durée la plus courte qui permettent la tâche", "El rol más estrecho, en el recurso más bajo, durante el menor tiempo que permitan la tarea"],
    w: [["Grant Viewer to everyone and Owner to admins", "Accorder Viewer à tous et Owner aux administrateurs", "Conceder Viewer a todos y Owner a los administradores"], ["Grant roles only at the organisation, to keep one place", "N'accorder des rôles qu'à l'organisation, pour n'avoir qu'un endroit", "Conceder roles solo en la organización, para tener un único sitio"], ["Use as few roles as possible, whatever they contain", "Utiliser le moins de rôles possible, quel que soit leur contenu", "Usar los menos roles posibles, contengan lo que contengan"]],
    e: [
      "A role on a bucket instead of the project, `objectViewer` instead of `storage.admin`, and temporary elevation instead of standing access limit what a mistake or a stolen credential can do. The IAM recommender suggests removing permissions that were not used for 90 days.",
      "Un rôle sur un bucket plutôt que sur le projet, `objectViewer` plutôt que `storage.admin`, et une élévation temporaire plutôt qu'un accès permanent limitent ce que peuvent faire une erreur ou un identifiant volé. Le recommandeur IAM propose de retirer les permissions non utilisées depuis 90 jours.",
      "Un rol en un bucket en vez de en el proyecto, `objectViewer` en vez de `storage.admin`, y una elevación temporal en vez de un acceso permanente limitan lo que pueden hacer un error o una credencial robada. El recomendador de IAM propone quitar los permisos no usados en 90 días.",
    ],
  },
];

const saBasics: GcpQuestion[] = [
  {
    id: "gc-sa-01",
    q: ["What is a service account?", "Qu'est-ce qu'un compte de service ?", "¿Qué es una cuenta de servicio?"],
    a: ["An identity for a workload (a VM, a Cloud Run service, a pipeline), not for a person", "Une identité pour une charge de travail (une VM, un service Cloud Run, un pipeline), pas pour une personne", "Una identidad para una carga de trabajo (una VM, un servicio de Cloud Run, un pipeline), no para una persona"],
    w: [["An admin account shared by the team", "Un compte d'administration partagé par l'équipe", "Una cuenta de administración compartida por el equipo"], ["A Google account with a paid licence", "Un compte Google avec une licence payante", "Una cuenta de Google con licencia de pago"], ["The account Google uses to bill a project", "Le compte que Google utilise pour facturer un projet", "La cuenta que usa Google para facturar un proyecto"]],
    e: [
      "Service accounts have emails such as `app@PROJECT.iam.gserviceaccount.com`, receive roles like any principal, and are also resources: who may use or impersonate one is itself controlled by IAM on the service account. They have no password and cannot sign in to the console.",
      "Les comptes de service ont des adresses comme `app@PROJECT.iam.gserviceaccount.com`, reçoivent des rôles comme tout principal, et sont aussi des ressources : qui peut en utiliser ou en emprunter un est lui-même contrôlé par IAM sur le compte de service. Ils n'ont pas de mot de passe et ne peuvent pas se connecter à la console.",
      "Las cuentas de servicio tienen correos como `app@PROJECT.iam.gserviceaccount.com`, reciben roles como cualquier principal, y también son recursos: quién puede usarlas o suplantarlas se controla a su vez con IAM sobre la cuenta de servicio. No tienen contraseña y no pueden iniciar sesión en la consola.",
    ],
  },
  {
    id: "gc-sa-02",
    q: ["How does code on a VM or Cloud Run get credentials for a Google API, without any key file?", "Comment du code sur une VM ou Cloud Run obtient-il des identifiants pour une API Google, sans fichier de clé ?", "¿Cómo obtiene el código en una VM o Cloud Run credenciales para una API de Google, sin archivo de clave?"],
    a: ["From the metadata server, as the service account attached to the resource; client libraries find them through Application Default Credentials", "Auprès du serveur de métadonnées, au nom du compte de service attaché à la ressource ; les bibliothèques clientes les trouvent par les Application Default Credentials", "Del servidor de metadatos, como la cuenta de servicio asociada al recurso; las bibliotecas cliente las encuentran mediante las Application Default Credentials"],
    w: [["From the project's owner, by email", "Du propriétaire du projet, par e-mail", "Del propietario del proyecto, por correo"], ["They cannot: a JSON key must be deployed with the code", "Impossible : il faut déployer une clé JSON avec le code", "No pueden: hay que desplegar una clave JSON con el código"], ["From environment variables Google fills with the owner's password", "De variables d'environnement que Google remplit avec le mot de passe du propriétaire", "De variables de entorno que Google rellena con la contraseña del propietario"]],
    e: [
      "The metadata server hands out short-lived access tokens, refreshed automatically. Nothing secret sits in the image or the repository. Locally, `gcloud auth application-default login` gives the same libraries your own credentials.",
      "Le serveur de métadonnées fournit des jetons d'accès de courte durée, renouvelés automatiquement. Rien de secret ne se trouve dans l'image ni dans le dépôt. En local, `gcloud auth application-default login` donne aux mêmes bibliothèques vos propres identifiants.",
      "El servidor de metadatos entrega tokens de acceso de corta duración, renovados automáticamente. No hay nada secreto en la imagen ni en el repositorio. En local, `gcloud auth application-default login` da a las mismas bibliotecas tus propias credenciales.",
    ],
  },
  {
    id: "gc-sa-03",
    q: ["Why are service account keys (JSON files) a risk?", "Pourquoi les clés de comptes de service (fichiers JSON) sont-elles un risque ?", "¿Por qué las claves de cuentas de servicio (archivos JSON) son un riesgo?"],
    a: ["They are long-lived secrets: anyone holding the file acts as the account until the key is deleted", "Ce sont des secrets de longue durée : quiconque détient le fichier agit au nom du compte jusqu'à la suppression de la clé", "Son secretos de larga duración: quien tenga el archivo actúa como la cuenta hasta que se borre la clave"],
    w: [["They expire after one hour", "Elles expirent au bout d'une heure", "Caducan al cabo de una hora"], ["They only work inside Google Cloud", "Elles ne marchent qu'à l'intérieur de Google Cloud", "Solo funcionan dentro de Google Cloud"], ["They are encrypted and useless if leaked", "Elles sont chiffrées et inutiles en cas de fuite", "Están cifradas y no sirven si se filtran"]],
    e: [
      "Keys get committed to repositories, copied to laptops and forgotten. Prefer attached service accounts, impersonation, or Workload Identity Federation from outside Google Cloud. Organisations created since May 2024 enforce constraints that disable key creation and upload by default.",
      "Les clés finissent dans des dépôts, copiées sur des portables, oubliées. Préférer les comptes de service attachés, l'emprunt d'identité, ou la fédération d'identité de charge de travail depuis l'extérieur de Google Cloud. Les organisations créées depuis mai 2024 appliquent par défaut des contraintes qui désactivent la création et l'import de clés.",
      "Las claves acaban en repositorios, copiadas en portátiles, olvidadas. Mejor cuentas de servicio asociadas, suplantación o la federación de identidades de cargas de trabajo desde fuera de Google Cloud. Las organizaciones creadas desde mayo de 2024 aplican por defecto restricciones que desactivan la creación y la subida de claves.",
    ],
  },
  {
    id: "gc-sa-04",
    q: ["A new project's VMs run as the Compute Engine default service account. What is the advice?", "Les VM d'un nouveau projet tournent avec le compte de service Compute Engine par défaut. Quel est le conseil ?", "Las VM de un proyecto nuevo se ejecutan con la cuenta de servicio predeterminada de Compute Engine. ¿Cuál es el consejo?"],
    a: ["Create a dedicated service account per workload, with only the roles it needs", "Créer un compte de service dédié par charge de travail, avec seulement les rôles nécessaires", "Crear una cuenta de servicio dedicada por carga de trabajo, solo con los roles que necesita"],
    w: [["Keep it: it has no roles at all", "Le garder : il n'a aucun rôle", "Mantenerla: no tiene ningún rol"], ["Grant it Owner so nothing fails", "Lui accorder Owner pour que rien n'échoue", "Darle Owner para que nada falle"], ["Delete it and run VMs with no identity, always", "Le supprimer et faire tourner les VM sans identité, toujours", "Borrarla y ejecutar las VM sin identidad, siempre"]],
    e: [
      "`PROJECT_NUMBER-compute@developer.gserviceaccount.com` is shared by every VM that does not choose another, and historically received Editor on the project. Secure-by-default organisations block that automatic grant. A dedicated account per workload keeps both its permissions and its audit trail apart.",
      "`PROJECT_NUMBER-compute@developer.gserviceaccount.com` est partagé par toutes les VM qui n'en choisissent pas d'autre, et recevait historiquement Editor sur le projet. Les organisations « sécurisées par défaut » bloquent cette attribution automatique. Un compte dédié par charge de travail sépare ses permissions et sa trace d'audit.",
      "`PROJECT_NUMBER-compute@developer.gserviceaccount.com` la comparten todas las VM que no eligen otra, y históricamente recibía Editor en el proyecto. Las organizaciones «seguras por defecto» bloquean esa concesión automática. Una cuenta dedicada por carga de trabajo separa sus permisos y su rastro de auditoría.",
    ],
  },
];

const securityBasics: GcpQuestion[] = [
  {
    id: "gc-sec-01",
    q: ["Where should a database password used by a Cloud Run service live?", "Où doit vivre le mot de passe de base de données d'un service Cloud Run ?", "¿Dónde debe vivir la contraseña de base de datos de un servicio de Cloud Run?"],
    a: ["In Secret Manager, exposed to the service as a variable or a file, readable only by its service account", "Dans Secret Manager, exposé au service comme variable ou fichier, lisible seulement par son compte de service", "En Secret Manager, expuesto al servicio como variable o archivo, legible solo por su cuenta de servicio"],
    w: [["In the container image", "Dans l'image du conteneur", "En la imagen del contenedor"], ["In the Git repository, in `.env`", "Dans le dépôt Git, dans `.env`", "En el repositorio Git, en `.env`"], ["In a plain environment variable set in the console, visible to every viewer", "Dans une variable d'environnement en clair saisie dans la console, visible de tout lecteur", "En una variable de entorno en claro puesta en la consola, visible para todo lector"]],
    e: [
      "Secret Manager stores versions, encrypts them, logs every access, and grants `roles/secretmanager.secretAccessor` per secret. Plain environment variables appear in the service's configuration to anyone who can view it. Images and repositories spread secrets to every copy.",
      "Secret Manager garde des versions, les chiffre, journalise chaque accès et accorde `roles/secretmanager.secretAccessor` secret par secret. Les variables d'environnement en clair apparaissent dans la configuration du service à quiconque peut la consulter. Images et dépôts répandent les secrets à chaque copie.",
      "Secret Manager guarda versiones, las cifra, registra cada acceso y concede `roles/secretmanager.secretAccessor` secreto por secreto. Las variables de entorno en claro aparecen en la configuración del servicio para cualquiera que pueda verla. Imágenes y repositorios difunden los secretos con cada copia.",
    ],
  },
  {
    id: "gc-sec-02",
    q: ["Is data stored in Google Cloud encrypted at rest by default?", "Les données stockées dans Google Cloud sont-elles chiffrées au repos par défaut ?", "¿Los datos guardados en Google Cloud se cifran en reposo por defecto?"],
    a: ["Yes, always, with Google-managed keys; customer-managed keys (CMEK, in Cloud KMS) are an option for more control", "Oui, toujours, avec des clés gérées par Google ; les clés gérées par le client (CMEK, dans Cloud KMS) sont une option pour plus de contrôle", "Sí, siempre, con claves gestionadas por Google; las claves gestionadas por el cliente (CMEK, en Cloud KMS) son una opción para más control"],
    w: [["No, it must be enabled per bucket", "Non, il faut l'activer bucket par bucket", "No, hay que activarlo bucket por bucket"], ["Only in paid regions", "Seulement dans les régions payantes", "Solo en las regiones de pago"], ["Only for Cloud SQL", "Seulement pour Cloud SQL", "Solo para Cloud SQL"]],
    e: [
      "Encryption at rest is automatic and free. CMEK lets you rotate, disable or destroy the key yourself, and see its use in audit logs, at the cost of managing it: a destroyed key makes the data unreadable for good.",
      "Le chiffrement au repos est automatique et gratuit. CMEK permet de faire tourner, désactiver ou détruire soi-même la clé, et de voir son usage dans les journaux d'audit, au prix de sa gestion : une clé détruite rend les données illisibles pour de bon.",
      "El cifrado en reposo es automático y gratuito. CMEK permite rotar, desactivar o destruir uno mismo la clave, y ver su uso en los registros de auditoría, a costa de gestionarla: una clave destruida deja los datos ilegibles para siempre.",
    ],
  },
  {
    id: "gc-sec-03",
    q: ["Who can always see that someone changed an IAM policy in a project?", "Qui peut toujours voir que quelqu'un a modifié une stratégie IAM dans un projet ?", "¿Quién puede ver siempre que alguien cambió una política de IAM en un proyecto?"],
    a: ["Anyone allowed to read its Admin Activity audit logs, which are always written and cannot be disabled", "Quiconque peut lire ses journaux d'audit Admin Activity, toujours écrits et impossibles à désactiver", "Cualquiera que pueda leer sus registros de auditoría Admin Activity, que siempre se escriben y no se pueden desactivar"],
    w: [["Nobody: audit logs must be enabled first", "Personne : il faut d'abord activer les journaux d'audit", "Nadie: primero hay que activar los registros de auditoría"], ["Only Google support", "Seulement le support Google", "Solo el soporte de Google"], ["Only the person who made the change", "Seulement la personne qui a fait le changement", "Solo la persona que hizo el cambio"]],
    e: [
      "Admin Activity logs record configuration changes (`SetIamPolicy`, creating a VM) with who, when and from where, kept 400 days in the `_Required` bucket at no charge. Data Access logs (who read what) are off by default for most services.",
      "Les journaux Admin Activity enregistrent les changements de configuration (`SetIamPolicy`, création d'une VM) avec qui, quand et d'où, gardés 400 jours dans le bucket `_Required` sans frais. Les journaux Data Access (qui a lu quoi) sont désactivés par défaut pour la plupart des services.",
      "Los registros Admin Activity guardan los cambios de configuración (`SetIamPolicy`, crear una VM) con quién, cuándo y desde dónde, durante 400 días en el bucket `_Required` sin coste. Los registros Data Access (quién leyó qué) están desactivados por defecto en la mayoría de servicios.",
    ],
  },
];

const vpcBasics: GcpQuestion[] = [
  {
    id: "gc-vpc-01",
    q: ["In Google Cloud, a VPC network and its subnets are…", "Dans Google Cloud, un réseau VPC et ses sous-réseaux sont…", "En Google Cloud, una red VPC y sus subredes son…"],
    a: ["The network is global, each subnet is regional", "Le réseau est global, chaque sous-réseau est régional", "La red es global, cada subred es regional"],
    w: [["Both regional", "Tous deux régionaux", "Ambos regionales"], ["Both zonal", "Tous deux zonaux", "Ambos zonales"], ["The network is regional, subnets are zonal", "Le réseau est régional, les sous-réseaux zonaux", "La red es regional, las subredes zonales"]],
    e: [
      "One VPC network can have subnets in Zurich and in Iowa, and VMs in both talk over Google's network with internal addresses, without VPNs between regions. A subnet spans all zones of its region. This differs from some other clouds, where a network is regional.",
      "Un même réseau VPC peut avoir des sous-réseaux à Zurich et dans l'Iowa, et les VM des deux se parlent sur le réseau de Google avec des adresses internes, sans VPN entre régions. Un sous-réseau couvre toutes les zones de sa région. C'est différent d'autres clouds, où un réseau est régional.",
      "Una misma red VPC puede tener subredes en Zúrich y en Iowa, y las VM de ambas se comunican por la red de Google con direcciones internas, sin VPN entre regiones. Una subred abarca todas las zonas de su región. Es distinto de otras nubes, donde una red es regional.",
    ],
  },
  {
    id: "gc-vpc-02",
    q: ["A new VM in a custom network has no firewall rules. Can the internet reach its port 22?", "Une nouvelle VM dans un réseau personnalisé n'a aucune règle de pare-feu. Internet peut-il atteindre son port 22 ?", "Una VM nueva en una red personalizada no tiene reglas de firewall. ¿Puede internet llegar a su puerto 22?"],
    a: ["No: the implied rules deny all ingress and allow all egress", "Non : les règles implicites refusent toute entrée et autorisent toute sortie", "No: las reglas implícitas deniegan toda entrada y permiten toda salida"],
    w: [["Yes, SSH is always open", "Oui, SSH est toujours ouvert", "Sí, SSH siempre está abierto"], ["Yes, if the VM has an external IP", "Oui, si la VM a une IP externe", "Sí, si la VM tiene IP externa"], ["No, and it cannot reach the internet either", "Non, et elle ne peut pas non plus atteindre internet", "No, y tampoco puede salir a internet"]],
    e: [
      "Every VPC network has two implied rules at the lowest priority (65535): deny ingress, allow egress. The `default` network, created in new projects unless an organisation policy prevents it, adds rules that open SSH, RDP and ICMP from anywhere: one reason to avoid it. Going out to the internet also needs an external IP or Cloud NAT.",
      "Chaque réseau VPC a deux règles implicites à la plus basse priorité (65535) : refuser l'entrée, autoriser la sortie. Le réseau `default`, créé dans les nouveaux projets sauf règle d'administration contraire, ajoute des règles qui ouvrent SSH, RDP et ICMP depuis partout : une raison de l'éviter. Sortir vers internet demande aussi une IP externe ou Cloud NAT.",
      "Toda red VPC tiene dos reglas implícitas con la prioridad más baja (65535): denegar la entrada, permitir la salida. La red `default`, creada en los proyectos nuevos salvo que una política de organización lo impida, añade reglas que abren SSH, RDP e ICMP desde cualquier sitio: una razón para evitarla. Salir a internet también requiere una IP externa o Cloud NAT.",
    ],
  },
  {
    id: "gc-vpc-03",
    q: ["VMs without external IPs must download updates from the internet. What provides that?", "Des VM sans IP externe doivent télécharger des mises à jour sur internet. Qu'est-ce qui le permet ?", "Unas VM sin IP externa deben descargar actualizaciones de internet. ¿Qué lo permite?"],
    a: ["Cloud NAT, configured on a Cloud Router in the region: outbound only", "Cloud NAT, configuré sur un Cloud Router de la région : sortant seulement", "Cloud NAT, configurado en un Cloud Router de la región: solo saliente"],
    w: [["An ingress firewall rule from 0.0.0.0/0", "Une règle de pare-feu d'entrée depuis 0.0.0.0/0", "Una regla de firewall de entrada desde 0.0.0.0/0"], ["Private Google Access", "Private Google Access", "Private Google Access"], ["A VM acting as NAT is the only way", "Une VM faisant office de NAT est le seul moyen", "Una VM que haga de NAT es la única forma"]],
    e: [
      "Cloud NAT is managed and software-defined: no gateway VM to patch or scale. Connections cannot start from the internet towards the VMs. Private Google Access is narrower: it lets such VMs reach Google APIs (Cloud Storage, BigQuery), not the rest of the internet.",
      "Cloud NAT est géré et logiciel : pas de VM passerelle à corriger ou dimensionner. Aucune connexion ne peut partir d'internet vers les VM. Private Google Access est plus étroit : il permet à ces VM d'atteindre les API Google (Cloud Storage, BigQuery), pas le reste d'internet.",
      "Cloud NAT es gestionado y por software: no hay VM pasarela que parchear o escalar. Ninguna conexión puede iniciarse desde internet hacia las VM. Private Google Access es más estrecho: deja a esas VM llegar a las API de Google (Cloud Storage, BigQuery), no al resto de internet.",
    ],
  },
  {
    id: "gc-vpc-04",
    q: ["What do network tags on a VM do in VPC firewall rules?", "À quoi servent les tags réseau d'une VM dans les règles de pare-feu VPC ?", "¿Para qué sirven las etiquetas de red de una VM en las reglas de firewall de VPC?"],
    a: ["They select the targets a rule applies to (e.g. `web`), or the sources of traffic between VMs", "Ils choisissent les cibles auxquelles une règle s'applique (par ex. `web`), ou les sources du trafic entre VM", "Seleccionan los destinos a los que se aplica una regla (p. ej. `web`), o los orígenes del tráfico entre VM"],
    w: [["They are labels for billing only", "Ce sont des libellés pour la facture seulement", "Son etiquetas solo para la factura"], ["They encrypt the VM's traffic", "Ils chiffrent le trafic de la VM", "Cifran el tráfico de la VM"], ["They choose the VM's subnet", "Ils choisissent le sous-réseau de la VM", "Eligen la subred de la VM"]],
    e: [
      "A rule targeting tag `web` applies only to VMs carrying it. Anyone allowed to edit a VM can change its tags, so for stronger control use target service accounts, or secure tags (Resource Manager tags) in network firewall policies, which IAM governs.",
      "Une règle visant le tag `web` ne s'applique qu'aux VM qui le portent. Quiconque peut modifier une VM peut changer ses tags : pour un contrôle plus fort, cibler des comptes de service, ou utiliser des tags sécurisés (tags de Resource Manager) dans les stratégies de pare-feu réseau, régis par IAM.",
      "Una regla dirigida a la etiqueta `web` solo se aplica a las VM que la llevan. Cualquiera que pueda editar una VM puede cambiar sus etiquetas, así que para un control más fuerte se usan cuentas de servicio de destino, o tags seguros (tags de Resource Manager) en políticas de firewall de red, que gobierna IAM.",
    ],
  },
  {
    id: "gc-vpc-05",
    q: ["Two VMs in the same VPC network but different regions: how do they talk?", "Deux VM du même réseau VPC mais de régions différentes : comment communiquent-elles ?", "Dos VM de la misma red VPC pero de regiones distintas: ¿cómo se comunican?"],
    a: ["Directly with internal IP addresses, if firewall rules allow it", "Directement par adresses IP internes, si les règles de pare-feu le permettent", "Directamente con direcciones IP internas, si las reglas de firewall lo permiten"],
    w: [["Only through external IPs", "Seulement par des IP externes", "Solo mediante IP externas"], ["Through a VPN between the regions", "Par un VPN entre les régions", "Mediante una VPN entre las regiones"], ["They cannot: a network is per region", "Impossible : un réseau est par région", "No pueden: una red es por región"]],
    e: [
      "Routes for every subnet exist across the whole global network. Traffic between regions stays on Google's backbone, though it is billed as inter-region egress. Ingress between VMs still needs a firewall rule allowing it.",
      "Les routes de chaque sous-réseau existent dans tout le réseau global. Le trafic entre régions reste sur la dorsale de Google, même s'il est facturé comme sortie inter-régions. L'entrée entre VM demande toujours une règle de pare-feu qui l'autorise.",
      "Las rutas de cada subred existen en toda la red global. El tráfico entre regiones se queda en la red troncal de Google, aunque se factura como salida entre regiones. La entrada entre VM sigue necesitando una regla de firewall que la permita.",
    ],
  },
];

const computeBasics: GcpQuestion[] = [
  {
    id: "gc-cmp-01",
    q: ["A stateless HTTP container must scale from zero to many with no servers to manage. The natural choice?", "Un conteneur HTTP sans état doit passer de zéro à beaucoup d'instances sans serveur à gérer. Le choix naturel ?", "Un contenedor HTTP sin estado debe escalar de cero a muchas instancias sin servidores que gestionar. ¿La elección natural?"],
    a: ["Cloud Run", "Cloud Run", "Cloud Run"],
    w: [["A Compute Engine VM", "Une VM Compute Engine", "Una VM de Compute Engine"], ["A GKE Standard cluster", "Un cluster GKE Standard", "Un clúster de GKE Standard"], ["Cloud Storage", "Cloud Storage", "Cloud Storage"]],
    e: [
      "Cloud Run runs any container listening on `$PORT`, scales on requests (to zero when idle), and bills by use. GKE suits many services with Kubernetes needs; Compute Engine suits software that needs a whole machine or a specific OS. Cloud Functions are now Cloud Run functions.",
      "Cloud Run exécute tout conteneur qui écoute sur `$PORT`, s'adapte aux requêtes (jusqu'à zéro au repos) et facture à l'usage. GKE convient à de nombreux services avec des besoins Kubernetes ; Compute Engine aux logiciels qui ont besoin d'une machine entière ou d'un OS précis. Cloud Functions s'appelle maintenant Cloud Run functions.",
      "Cloud Run ejecuta cualquier contenedor que escuche en `$PORT`, escala con las peticiones (hasta cero en reposo) y factura por uso. GKE encaja con muchos servicios con necesidades de Kubernetes; Compute Engine con software que necesita una máquina entera o un SO concreto. Cloud Functions ahora se llama Cloud Run functions.",
    ],
  },
  {
    id: "gc-cmp-02",
    q: ["What are Spot VMs?", "Que sont les Spot VM ?", "¿Qué son las Spot VM?"],
    a: ["Much cheaper VMs that Google can stop at any time, with about 30 seconds' notice", "Des VM bien moins chères que Google peut arrêter à tout moment, avec environ 30 secondes de préavis", "VM mucho más baratas que Google puede detener en cualquier momento, con unos 30 segundos de aviso"],
    w: [["VMs reserved for one year", "Des VM réservées pour un an", "VM reservadas por un año"], ["VMs in a single zone only, otherwise identical", "Des VM dans une seule zone, sinon identiques", "VM en una sola zona, por lo demás idénticas"], ["VMs with a guaranteed price for life", "Des VM à prix garanti à vie", "VM con precio garantizado de por vida"]],
    e: [
      "They suit batch jobs, CI runners and fault-tolerant workers that can restart. Unlike the older preemptible VMs, they have no 24-hour limit. Committed use discounts are the way to pay less for steady workloads.",
      "Elles conviennent aux traitements par lots, aux exécuteurs de CI et aux workers tolérants aux pannes qui peuvent redémarrer. Contrairement aux anciennes VM préemptives, elles n'ont pas de limite de 24 heures. Les remises sur engagement d'utilisation sont le moyen de payer moins pour une charge stable.",
      "Sirven para trabajos por lotes, ejecutores de CI y workers tolerantes a fallos que pueden reiniciarse. A diferencia de las antiguas VM interrumpibles, no tienen límite de 24 horas. Los descuentos por compromiso de uso son la forma de pagar menos por cargas estables.",
    ],
  },
  {
    id: "gc-cmp-03",
    q: ["A Cloud Run service receives no traffic for an hour. What does it cost in compute, by default?", "Un service Cloud Run ne reçoit aucun trafic pendant une heure. Que coûte-t-il en calcul, par défaut ?", "Un servicio de Cloud Run no recibe tráfico durante una hora. ¿Cuánto cuesta en cómputo, por defecto?"],
    a: ["Nothing: with no minimum instances it scales to zero; the next request has a cold start", "Rien : sans instances minimum, il descend à zéro ; la requête suivante subit un démarrage à froid", "Nada: sin instancias mínimas baja a cero; la siguiente petición tiene un arranque en frío"],
    w: [["The price of one instance running all the time", "Le prix d'une instance qui tourne en permanence", "El precio de una instancia en marcha todo el tiempo"], ["A fixed monthly fee per service", "Un forfait mensuel par service", "Una cuota mensual fija por servicio"], ["The same as under load", "Autant que sous charge", "Lo mismo que con carga"]],
    e: [
      "Minimum instances keep some warm (billed) to avoid cold starts. With request-based billing, CPU is charged only while requests are handled; instance-based billing keeps CPU allocated all the time, for background work.",
      "Les instances minimum en gardent quelques-unes chaudes (facturées) pour éviter les démarrages à froid. Avec la facturation à la requête, le CPU n'est facturé que pendant le traitement des requêtes ; la facturation à l'instance garde le CPU alloué en permanence, pour le travail en arrière-plan.",
      "Las instancias mínimas mantienen algunas activas (facturadas) para evitar arranques en frío. Con la facturación por petición, la CPU solo se cobra mientras se atienden peticiones; la facturación por instancia mantiene la CPU asignada siempre, para trabajo en segundo plano.",
    ],
  },
  {
    id: "gc-cmp-04",
    q: ["Where should container images for Cloud Run and GKE be stored today?", "Où stocker aujourd'hui les images de conteneurs pour Cloud Run et GKE ?", "¿Dónde se guardan hoy las imágenes de contenedor para Cloud Run y GKE?"],
    a: ["Artifact Registry", "Artifact Registry", "Artifact Registry"],
    w: [["Container Registry (`gcr.io`), the current service", "Container Registry (`gcr.io`), le service actuel", "Container Registry (`gcr.io`), el servicio actual"], ["A Cloud Storage bucket mounted by Docker", "Un bucket Cloud Storage monté par Docker", "Un bucket de Cloud Storage montado por Docker"], ["Only Docker Hub", "Seulement Docker Hub", "Solo Docker Hub"]],
    e: [
      "Artifact Registry stores containers and language packages (npm, Maven, Python) in regional repositories with IAM per repository and vulnerability scanning. Container Registry was shut down in 2025; `gcr.io` names can be served from Artifact Registry.",
      "Artifact Registry stocke conteneurs et paquets de langages (npm, Maven, Python) dans des dépôts régionaux, avec IAM par dépôt et analyse des vulnérabilités. Container Registry a été arrêté en 2025 ; les noms `gcr.io` peuvent être servis par Artifact Registry.",
      "Artifact Registry guarda contenedores y paquetes de lenguajes (npm, Maven, Python) en repositorios regionales, con IAM por repositorio y análisis de vulnerabilidades. Container Registry se cerró en 2025; los nombres `gcr.io` se pueden servir desde Artifact Registry.",
    ],
  },
];

const storageBasics: GcpQuestion[] = [
  {
    id: "gc-sto-01",
    q: ["Cloud Storage classes Standard, Nearline, Coldline, Archive differ in what?", "Les classes Cloud Storage Standard, Nearline, Coldline, Archive diffèrent en quoi ?", "¿En qué difieren las clases de Cloud Storage Standard, Nearline, Coldline y Archive?"],
    a: ["Storage gets cheaper and access dearer, with minimum storage durations of 30, 90 and 365 days for the colder ones", "Le stockage devient moins cher et l'accès plus cher, avec des durées minimales de 30, 90 et 365 jours pour les plus froides", "El almacenamiento se abarata y el acceso se encarece, con duraciones mínimas de 30, 90 y 365 días para las más frías"],
    w: [["Colder classes take hours to read, like tape", "Les classes froides mettent des heures à lire, comme une bande", "Las clases frías tardan horas en leerse, como una cinta"], ["Only Standard is encrypted", "Seul Standard est chiffré", "Solo Standard está cifrado"], ["They differ in maximum object size only", "Elles ne diffèrent que par la taille maximale des objets", "Solo difieren en el tamaño máximo de los objetos"]],
    e: [
      "All classes read with the same low latency; colder ones charge per GB retrieved and for early deletion. Lifecycle rules move objects to colder classes or delete them by age. Autoclass can choose the class from access patterns.",
      "Toutes les classes se lisent avec la même faible latence ; les plus froides facturent chaque Go récupéré et la suppression anticipée. Des règles de cycle de vie déplacent les objets vers des classes plus froides ou les suppriment selon leur âge. Autoclass peut choisir la classe d'après les accès.",
      "Todas las clases se leen con la misma latencia baja; las más frías cobran cada GB recuperado y el borrado anticipado. Las reglas de ciclo de vida mueven los objetos a clases más frías o los borran según su edad. Autoclass puede elegir la clase según los accesos.",
    ],
  },
  {
    id: "gc-sto-02",
    q: ["Bucket names in Cloud Storage are unique where?", "Les noms de buckets Cloud Storage sont uniques où ?", "¿Dónde son únicos los nombres de buckets de Cloud Storage?"],
    a: ["Across all of Cloud Storage, all customers: one global namespace", "Dans tout Cloud Storage, tous clients confondus : un espace de noms global", "En todo Cloud Storage, de todos los clientes: un espacio de nombres global"],
    w: [["Within a project", "Dans un projet", "Dentro de un proyecto"], ["Within a region", "Dans une région", "Dentro de una región"], ["Within an organisation", "Dans une organisation", "Dentro de una organización"]],
    e: [
      "A name like `invoices` is probably taken; prefix with the project or company. Names are visible to anyone guessing them, so do not put secrets in names. A bucket's location (region, dual-region, multi-region) is chosen at creation and cannot change.",
      "Un nom comme `invoices` est sans doute pris ; préfixer par le projet ou l'entreprise. Les noms sont visibles par quiconque les devine : n'y mettre aucun secret. L'emplacement d'un bucket (région, bi-région, multirégion) se choisit à la création et ne change pas.",
      "Un nombre como `invoices` probablemente esté cogido; usar como prefijo el proyecto o la empresa. Los nombres los ve cualquiera que los adivine: no poner secretos en ellos. La ubicación de un bucket (región, birregión, multirregión) se elige al crearlo y no cambia.",
    ],
  },
  {
    id: "gc-sto-03",
    q: ["What does Cloud SQL manage for you?", "Que gère Cloud SQL pour vous ?", "¿Qué gestiona Cloud SQL por ti?"],
    a: ["PostgreSQL, MySQL or SQL Server instances with backups, patching, replicas and failover", "Des instances PostgreSQL, MySQL ou SQL Server avec sauvegardes, correctifs, répliques et basculement", "Instancias de PostgreSQL, MySQL o SQL Server con copias de seguridad, parches, réplicas y conmutación por error"],
    w: [["A schemaless document database", "Une base de documents sans schéma", "Una base de documentos sin esquema"], ["A globally distributed database with unlimited scale", "Une base distribuée mondialement à l'échelle illimitée", "Una base distribuida globalmente con escala ilimitada"], ["Nothing: it is a VM image with PostgreSQL", "Rien : c'est une image de VM avec PostgreSQL", "Nada: es una imagen de VM con PostgreSQL"]],
    e: [
      "Cloud SQL suits a relational application database. Firestore is the document database; Spanner the relational database that scales horizontally across regions; Bigtable the wide-column store for huge throughputs; BigQuery the analytics warehouse.",
      "Cloud SQL convient à une base relationnelle d'application. Firestore est la base de documents ; Spanner la base relationnelle qui s'étend horizontalement sur plusieurs régions ; Bigtable le stockage en colonnes larges pour d'énormes débits ; BigQuery l'entrepôt analytique.",
      "Cloud SQL sirve para una base relacional de aplicación. Firestore es la base de documentos; Spanner la base relacional que escala horizontalmente entre regiones; Bigtable el almacén de columnas anchas para enormes caudales; BigQuery el almacén analítico.",
    ],
  },
];

const toolsBasics: GcpQuestion[] = [
  {
    id: "gc-tool-01",
    q: ["Which command makes `gcloud` work in a given project by default?", "Quelle commande fait travailler `gcloud` dans un projet donné par défaut ?", "¿Qué comando hace que `gcloud` trabaje en un proyecto dado por defecto?"],
    a: ["`gcloud config set project PROJECT_ID`", "`gcloud config set project PROJECT_ID`", "`gcloud config set project PROJECT_ID`"],
    w: [["`gcloud projects use PROJECT_ID`", "`gcloud projects use PROJECT_ID`", "`gcloud projects use PROJECT_ID`"], ["`gcloud init --force PROJECT_ID`", "`gcloud init --force PROJECT_ID`", "`gcloud init --force PROJECT_ID`"], ["`export PROJECT=PROJECT_ID`", "`export PROJECT=PROJECT_ID`", "`export PROJECT=PROJECT_ID`"]],
    e: [
      "Properties live in named configurations (`gcloud config configurations create prod`), handy to switch between projects and accounts. Any command can still override with `--project`. Commands use the project ID, not its display name.",
      "Les propriétés vivent dans des configurations nommées (`gcloud config configurations create prod`), pratiques pour passer d'un projet ou d'un compte à l'autre. Toute commande peut encore forcer avec `--project`. Les commandes utilisent l'ID du projet, pas son nom affiché.",
      "Las propiedades viven en configuraciones con nombre (`gcloud config configurations create prod`), útiles para cambiar de proyecto o de cuenta. Cualquier comando puede seguir forzando con `--project`. Los comandos usan el ID del proyecto, no su nombre visible.",
    ],
  },
  {
    id: "gc-tool-02",
    q: ["`gcloud auth login` and `gcloud auth application-default login`: what is the difference?", "`gcloud auth login` et `gcloud auth application-default login` : quelle différence ?", "`gcloud auth login` y `gcloud auth application-default login`: ¿qué diferencia hay?"],
    a: ["The first authorises the `gcloud` tool itself; the second writes credentials for your code's client libraries (ADC)", "La première autorise l'outil `gcloud` lui-même ; la seconde écrit des identifiants pour les bibliothèques clientes de votre code (ADC)", "La primera autoriza la propia herramienta `gcloud`; la segunda escribe credenciales para las bibliotecas cliente de tu código (ADC)"],
    w: [["None", "Aucune", "Ninguna"], ["The second creates a service account key", "La seconde crée une clé de compte de service", "La segunda crea una clave de cuenta de servicio"], ["The first is for Windows, the second for Linux", "La première pour Windows, la seconde pour Linux", "La primera para Windows, la segunda para Linux"]],
    e: [
      "Application Default Credentials are looked up in order: `GOOGLE_APPLICATION_CREDENTIALS`, the file written by `application-default login`, then the metadata server when running on Google Cloud. The same code thus works locally and in production without changes.",
      "Les Application Default Credentials se cherchent dans l'ordre : `GOOGLE_APPLICATION_CREDENTIALS`, le fichier écrit par `application-default login`, puis le serveur de métadonnées sur Google Cloud. Le même code marche ainsi en local et en production sans changement.",
      "Las Application Default Credentials se buscan en orden: `GOOGLE_APPLICATION_CREDENTIALS`, el archivo escrito por `application-default login`, y luego el servidor de metadatos en Google Cloud. Así el mismo código funciona en local y en producción sin cambios.",
    ],
  },
  {
    id: "gc-tool-03",
    q: ["A budget with an alert at 100 % is set on a billing account. What happens when spending reaches it?", "Un budget avec une alerte à 100 % est défini sur un compte de facturation. Que se passe-t-il quand les dépenses l'atteignent ?", "Se define un presupuesto con alerta al 100 % en una cuenta de facturación. ¿Qué pasa cuando el gasto lo alcanza?"],
    a: ["Notifications are sent; nothing is stopped unless you automate it (e.g. Pub/Sub and a function)", "Des notifications partent ; rien n'est arrêté sauf si vous l'automatisez (par ex. Pub/Sub et une fonction)", "Se envían notificaciones; no se detiene nada salvo que lo automatices (p. ej. Pub/Sub y una función)"],
    w: [["All services stop at once", "Tous les services s'arrêtent aussitôt", "Todos los servicios se detienen al instante"], ["Billing switches to the free tier", "La facturation passe au niveau gratuit", "La facturación pasa al nivel gratuito"], ["New resources can no longer be created", "On ne peut plus créer de ressources", "Ya no se pueden crear recursos"]],
    e: [
      "Budgets watch and warn; they are not caps, and cost data arrives with some delay. A hard stop means disabling billing on the project programmatically, which shuts services down and can delete some resources. Quotas are the other brake on runaway use.",
      "Les budgets surveillent et préviennent ; ce ne sont pas des plafonds, et les données de coût arrivent avec un certain retard. Un arrêt net consiste à désactiver la facturation du projet par programme, ce qui arrête les services et peut supprimer des ressources. Les quotas sont l'autre frein contre un emballement.",
      "Los presupuestos vigilan y avisan; no son topes, y los datos de coste llegan con cierto retraso. Un corte en seco consiste en desactivar la facturación del proyecto por programa, lo que detiene los servicios y puede borrar recursos. Las cuotas son el otro freno contra un uso desbocado.",
    ],
  },
  {
    id: "gc-tool-04",
    q: ["Which tool is recommended to copy files to and from Cloud Storage today?", "Quel outil est recommandé aujourd'hui pour copier des fichiers vers et depuis Cloud Storage ?", "¿Qué herramienta se recomienda hoy para copiar archivos a y desde Cloud Storage?"],
    a: ["`gcloud storage cp`", "`gcloud storage cp`", "`gcloud storage cp`"],
    w: [["`gsutil cp`, the current tool", "`gsutil cp`, l'outil actuel", "`gsutil cp`, la herramienta actual"], ["`scp` to the bucket's IP", "`scp` vers l'IP du bucket", "`scp` a la IP del bucket"], ["`curl -T` with the project password", "`curl -T` avec le mot de passe du projet", "`curl -T` con la contraseña del proyecto"]],
    e: [
      "`gcloud storage` is faster and is where new features go; `gsutil` is legacy. Both use your gcloud credentials. `gcloud storage rsync` mirrors a directory; `--recursive` copies trees.",
      "`gcloud storage` est plus rapide et reçoit les nouvelles fonctions ; `gsutil` est un outil hérité. Les deux utilisent vos identifiants gcloud. `gcloud storage rsync` synchronise un répertoire ; `--recursive` copie des arborescences.",
      "`gcloud storage` es más rápido y recibe las funciones nuevas; `gsutil` es heredado. Ambos usan tus credenciales de gcloud. `gcloud storage rsync` sincroniza un directorio; `--recursive` copia árboles.",
    ],
  },
];

export const hierarchy = { resourceBasics };
export const iam = { iamBasics };
export const serviceAccounts = { saBasics };
export const security = { securityBasics };
export const networking = { vpcBasics };
export const compute = { computeBasics };
export const storage = { storageBasics };
export const operations = { toolsBasics };
