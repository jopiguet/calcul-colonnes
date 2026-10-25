/**
 * Google Cloud, Expert: governance at scale (custom constraints), IAM's
 * edges (new basic roles, authoritative writes, service agents, signing
 * permissions), Google's own access, firewall policies and secure tags,
 * GKE operations, data stores' guarantees, and drift and incident work.
 */
import type { LinuxQuestion as GcpQuestion } from "../linux/types";

const governance: GcpQuestion[] = [
  {
    id: "gc-gov-01",
    q: ["No predefined constraint forbids GKE clusters without a release channel. What does the Organization Policy Service offer?", "Aucune contrainte prédéfinie n'interdit les clusters GKE sans canal de publication. Que propose le service de règles d'administration ?", "Ninguna restricción predefinida prohíbe clústeres de GKE sin canal de versiones. ¿Qué ofrece el servicio de políticas de organización?"],
    a: ["A custom constraint: a CEL condition on the resource's fields, for supported resource types, enforced on create and update", "Une contrainte personnalisée : une condition CEL sur les champs de la ressource, pour les types compatibles, appliquée à la création et à la mise à jour", "Una restricción personalizada: una condición CEL sobre los campos del recurso, en los tipos compatibles, aplicada al crear y actualizar"],
    w: [["A deny policy on `container.clusters.create`", "Une stratégie de refus sur `container.clusters.create`", "Una política de denegación sobre `container.clusters.create`"], ["A budget alert on GKE", "Une alerte de budget sur GKE", "Una alerta de presupuesto sobre GKE"], ["Nothing: only predefined constraints exist", "Rien : seules les contraintes prédéfinies existent", "Nada: solo existen restricciones predefinidas"]],
    e: [
      "A condition such as `resource.releaseChannel.channel == \"UNSPECIFIED\"` with action `DENY` blocks matching requests whoever makes them. A deny policy could only block creating clusters altogether, not clusters with a given setting. Custom constraints can be tested in dry-run like any policy.",
      "Une condition telle que `resource.releaseChannel.channel == \"UNSPECIFIED\"` avec l'action `DENY` bloque les requêtes correspondantes, quel qu'en soit l'auteur. Une stratégie de refus ne pourrait que bloquer toute création de cluster, pas les clusters avec un réglage donné. Les contraintes personnalisées se testent en simulation comme toute règle.",
      "Una condición como `resource.releaseChannel.channel == \"UNSPECIFIED\"` con la acción `DENY` bloquea las peticiones que coincidan, las haga quien las haga. Una política de denegación solo podría bloquear la creación de clústeres en general, no los que tengan un ajuste concreto. Las restricciones personalizadas se prueban en modo de prueba como cualquier política.",
    ],
  },
  {
    id: "gc-gov-02",
    q: ["What are the constraints named `iam.managed.*` or `compute.managed.*`, compared with the older ones?", "Que sont les contraintes nommées `iam.managed.*` ou `compute.managed.*`, comparées aux anciennes ?", "¿Qué son las restricciones llamadas `iam.managed.*` o `compute.managed.*`, comparadas con las antiguas?"],
    a: ["Managed constraints, built on the custom constraint platform: they support dry-run and Policy Simulator, and replace legacy equivalents", "Des contraintes gérées, bâties sur la plateforme des contraintes personnalisées : elles gèrent la simulation et Policy Simulator, et remplacent leurs équivalents hérités", "Restricciones gestionadas, construidas sobre la plataforma de restricciones personalizadas: admiten modo de prueba y Policy Simulator, y sustituyen a sus equivalentes heredados"],
    w: [["They are only for Google-managed projects", "Elles ne concernent que les projets gérés par Google", "Solo son para proyectos gestionados por Google"], ["They cannot be changed by the organisation", "L'organisation ne peut pas les modifier", "La organización no las puede cambiar"], ["They are billed", "Elles sont facturées", "Se facturan"]],
    e: [
      "`iam.managed.disableServiceAccountKeyCreation` is the managed counterpart of the older key-creation constraint and is among the secure-by-default ones. Migrating means setting the managed constraint, checking it, then removing the legacy one.",
      "`iam.managed.disableServiceAccountKeyCreation` est l'équivalent géré de l'ancienne contrainte de création de clés et fait partie des contraintes « sécurisées par défaut ». Migrer, c'est poser la contrainte gérée, la vérifier, puis retirer l'ancienne.",
      "`iam.managed.disableServiceAccountKeyCreation` es el equivalente gestionado de la antigua restricción de creación de claves y está entre las «seguras por defecto». Migrar es poner la restricción gestionada, comprobarla y luego quitar la antigua.",
    ],
  },
  {
    id: "gc-gov-03",
    q: ["A folder sets `gcp.resourceLocations` to EU regions; a project below sets it to allow `us-central1` with inheritance merged. Where can the project create resources?", "Un dossier fixe `gcp.resourceLocations` sur les régions de l'UE ; un projet en dessous autorise `us-central1` en fusionnant avec l'héritage. Où le projet peut-il créer des ressources ?", "Una carpeta fija `gcp.resourceLocations` en regiones de la UE; un proyecto debajo permite `us-central1` fusionando con la herencia. ¿Dónde puede crear recursos el proyecto?"],
    a: ["In the EU regions and in `us-central1`: with `inheritFromParent`, list values merge", "Dans les régions de l'UE et dans `us-central1` : avec `inheritFromParent`, les valeurs de liste fusionnent", "En las regiones de la UE y en `us-central1`: con `inheritFromParent`, los valores de lista se fusionan"],
    w: [["Only in the EU: a parent's restriction cannot be widened", "Seulement dans l'UE : on ne peut pas élargir une restriction du parent", "Solo en la UE: no se puede ampliar una restricción del padre"], ["Only in `us-central1`", "Seulement dans `us-central1`", "Solo en `us-central1`"], ["Nowhere: the conflict blocks all creation", "Nulle part : le conflit bloque toute création", "En ninguna parte: el conflicto bloquea toda creación"]],
    e: [
      "Organisation policies are not monotonic like IAM: a descendant can widen what its parent allowed, by merging or by replacing. That is exactly why `roles/orgpolicy.policyAdmin` must stay with a central team; otherwise project owners could undo data-residency rules.",
      "Les règles d'administration ne sont pas monotones comme IAM : un descendant peut élargir ce que son parent permettait, par fusion ou par remplacement. C'est précisément pourquoi `roles/orgpolicy.policyAdmin` doit rester à une équipe centrale ; sinon des propriétaires de projets pourraient défaire les règles de localisation des données.",
      "Las políticas de organización no son monótonas como IAM: un descendiente puede ampliar lo que permitía su padre, fusionando o sustituyendo. Precisamente por eso `roles/orgpolicy.policyAdmin` debe quedarse en un equipo central; si no, los propietarios de proyectos podrían deshacer las reglas de residencia de datos.",
    ],
  },
];

const iamExpert: GcpQuestion[] = [
  {
    id: "gc-iamx-01",
    q: ["Besides Owner, Editor and Viewer, which basic roles has Google introduced (in Preview)?", "En plus d'Owner, Editor et Viewer, quels rôles de base Google a-t-il introduits (en préversion) ?", "Además de Owner, Editor y Viewer, ¿qué roles básicos ha introducido Google (en vista previa)?"],
    a: ["`roles/admin`, `roles/writer` and `roles/reader`", "`roles/admin`, `roles/writer` et `roles/reader`", "`roles/admin`, `roles/writer` y `roles/reader`"],
    w: [["`roles/root`, `roles/user` and `roles/guest`", "`roles/root`, `roles/user` et `roles/guest`", "`roles/root`, `roles/user` y `roles/guest`"], ["`roles/browser` only", "`roles/browser` seulement", "Solo `roles/browser`"], ["None: basic roles are frozen", "Aucun : les rôles de base sont figés", "Ninguno: los roles básicos están congelados"]],
    e: [
      "Reader, Writer and Admin come in layers: Writer adds state-changing permissions to Reader, Admin adds sensitive actions such as managing roles. They cannot be granted in the console. Like the legacy basic roles, they are broad: predefined or custom roles remain the advice for production.",
      "Reader, Writer et Admin s'empilent : Writer ajoute à Reader les permissions qui modifient l'état, Admin les actions sensibles comme gérer les rôles. Ils ne s'accordent pas depuis la console. Comme les anciens rôles de base, ils sont larges : les rôles prédéfinis ou personnalisés restent le conseil pour la production.",
      "Reader, Writer y Admin se apilan: Writer añade a Reader los permisos que cambian el estado, Admin las acciones sensibles como gestionar roles. No se pueden conceder desde la consola. Como los roles básicos antiguos, son amplios: los roles predefinidos o personalizados siguen siendo el consejo para producción.",
    ],
  },
  {
    id: "gc-iamx-02",
    q: ["Why can Owner on a project not simply be granted by API to a user outside the organisation?", "Pourquoi ne peut-on pas simplement accorder Owner sur un projet par l'API à un utilisateur extérieur à l'organisation ?", "¿Por qué no se puede conceder Owner en un proyecto por API a un usuario de fuera de la organización, sin más?"],
    a: ["Owner has special rules: such a grant goes through an invitation sent from the console, which the user must accept, and only some kinds of principals may hold Owner", "Owner a des règles particulières : une telle attribution passe par une invitation envoyée depuis la console, que l'utilisateur doit accepter, et seuls certains types de principaux peuvent détenir Owner", "Owner tiene reglas especiales: esa concesión pasa por una invitación enviada desde la consola, que el usuario debe aceptar, y solo algunos tipos de principales pueden tener Owner"],
    w: [["Gmail accounts cannot hold any role", "Les comptes Gmail ne peuvent détenir aucun rôle", "Las cuentas de Gmail no pueden tener ningún rol"], ["Owner can only be granted by Google support", "Owner ne peut être accordé que par le support Google", "Owner solo lo puede conceder el soporte de Google"], ["It can; there is no restriction", "C'est possible ; il n'y a aucune restriction", "Se puede; no hay ninguna restricción"]],
    e: [
      "Owner can, among other things, change billing and IAM, so Google adds friction around it. Domain-restricted sharing blocks outside principals for every role in organisations that enforce it.",
      "Owner peut notamment modifier la facturation et IAM : Google ajoute donc des freins autour de lui. Le partage restreint au domaine bloque les principaux extérieurs pour tous les rôles dans les organisations qui l'appliquent.",
      "Owner puede, entre otras cosas, cambiar la facturación y el IAM, así que Google añade fricción a su alrededor. El uso compartido restringido al dominio bloquea a los principales externos para todos los roles en las organizaciones que lo aplican.",
    ],
  },
  {
    id: "gc-iamx-03",
    q: ["Why is `iam.serviceAccounts.signBlob` on a service account as sensitive as Token Creator?", "Pourquoi `iam.serviceAccounts.signBlob` sur un compte de service est-il aussi sensible que Token Creator ?", "¿Por qué `iam.serviceAccounts.signBlob` sobre una cuenta de servicio es tan sensible como Token Creator?"],
    a: ["Signing arbitrary data as the account can produce assertions exchanged for its access or ID tokens", "Signer des données arbitraires au nom du compte permet de produire des assertions échangées contre ses jetons d'accès ou d'identité", "Firmar datos arbitrarios como la cuenta permite producir aserciones que se intercambian por sus tokens de acceso o de identidad"],
    w: [["It only signs PDF files", "Il ne signe que des fichiers PDF", "Solo firma archivos PDF"], ["It is not sensitive at all", "Il n'est pas sensible du tout", "No es sensible en absoluto"], ["It reveals the account's private key", "Il révèle la clé privée du compte", "Revela la clave privada de la cuenta"]],
    e: [
      "A JWT signed by the service account (with `signJwt` or `signBlob`) can be traded for tokens, so these permissions amount to impersonation. They belong to the Token Creator role and should be granted with the same care, on specific accounts.",
      "Un JWT signé par le compte de service (avec `signJwt` ou `signBlob`) peut s'échanger contre des jetons : ces permissions reviennent à l'emprunt d'identité. Elles font partie du rôle Token Creator et s'accordent avec le même soin, sur des comptes précis.",
      "Un JWT firmado por la cuenta de servicio (con `signJwt` o `signBlob`) se puede canjear por tokens, así que estos permisos equivalen a la suplantación. Forman parte del rol Token Creator y se conceden con el mismo cuidado, sobre cuentas concretas.",
    ],
  },
  {
    id: "gc-iamx-04",
    q: ["What are service agents, such as `service-PROJECT_NUMBER@gcp-sa-run.iam.gserviceaccount.com`?", "Que sont les agents de service, comme `service-PROJECT_NUMBER@gcp-sa-run.iam.gserviceaccount.com` ?", "¿Qué son los agentes de servicio, como `service-PROJECT_NUMBER@gcp-sa-run.iam.gserviceaccount.com`?"],
    a: ["Google-managed service accounts through which a service acts in your project; removing their roles breaks the service", "Des comptes de service gérés par Google, par lesquels un service agit dans votre projet ; retirer leurs rôles casse le service", "Cuentas de servicio gestionadas por Google con las que un servicio actúa en tu proyecto; quitarles sus roles rompe el servicio"],
    w: [["Accounts of Google support engineers", "Les comptes des ingénieurs du support Google", "Las cuentas de los ingenieros del soporte de Google"], ["Leftovers from deleted projects, safe to remove", "Des restes de projets supprimés, à retirer sans risque", "Restos de proyectos borrados, que se pueden quitar sin riesgo"], ["User accounts created for each API call", "Des comptes utilisateurs créés à chaque appel d'API", "Cuentas de usuario creadas en cada llamada a la API"]],
    e: [
      "They receive service agent roles (`roles/run.serviceAgent`) automatically, for example to pull images or write to a CMEK-encrypted disk (which also needs a KMS role). An authoritative IAM write that drops them causes outages hard to trace; Policy Troubleshooter and audit logs show them at work.",
      "Ils reçoivent automatiquement des rôles d'agent de service (`roles/run.serviceAgent`), par exemple pour télécharger des images ou écrire sur un disque chiffré par CMEK (ce qui demande aussi un rôle KMS). Une écriture IAM qui fait autorité et les supprime provoque des pannes difficiles à remonter ; Policy Troubleshooter et les journaux d'audit les montrent à l'œuvre.",
      "Reciben automáticamente roles de agente de servicio (`roles/run.serviceAgent`), por ejemplo para descargar imágenes o escribir en un disco cifrado con CMEK (lo que también requiere un rol de KMS). Una escritura de IAM autoritativa que los elimina provoca caídas difíciles de rastrear; Policy Troubleshooter y los registros de auditoría los muestran trabajando.",
    ],
  },
];

const saExpert: GcpQuestion[] = [
  {
    id: "gc-sax-01",
    q: ["A delegation chain lets A impersonate C through B. Which permission must A have on B?", "Une chaîne de délégation permet à A d'emprunter C en passant par B. Quelle permission A doit-il avoir sur B ?", "Una cadena de delegación permite a A suplantar a C pasando por B. ¿Qué permiso debe tener A sobre B?"],
    a: ["`iam.serviceAccounts.implicitDelegation` on B, and B needs Token Creator on C", "`iam.serviceAccounts.implicitDelegation` sur B, et B a besoin de Token Creator sur C", "`iam.serviceAccounts.implicitDelegation` sobre B, y B necesita Token Creator sobre C"],
    w: [["`actAs` on C only", "`actAs` sur C seulement", "Solo `actAs` sobre C"], ["None: chains are not allowed", "Aucune : les chaînes sont interdites", "Ninguno: las cadenas no están permitidas"], ["Owner on B's project", "Owner sur le projet de B", "Owner en el proyecto de B"]],
    e: [
      "`generateAccessToken` accepts a `delegates` list; each hop must be authorised. Chains are rare and hard to review, which makes them worth checking in audits: an unnoticed implicit delegation is a path to privilege.",
      "`generateAccessToken` accepte une liste `delegates` ; chaque étape doit être autorisée. Les chaînes sont rares et difficiles à relire, ce qui les rend dignes d'être vérifiées lors des audits : une délégation implicite passée inaperçue est un chemin vers des privilèges.",
      "`generateAccessToken` acepta una lista `delegates`; cada salto debe estar autorizado. Las cadenas son raras y difíciles de revisar, lo que las hace dignas de comprobar en las auditorías: una delegación implícita que pasa desapercibida es un camino hacia privilegios.",
    ],
  },
  {
    id: "gc-sax-02",
    q: ["An attacker holds `iam.serviceAccounts.actAs` on a powerful service account and can create Cloud Run services. What can they do?", "Un attaquant détient `iam.serviceAccounts.actAs` sur un compte de service puissant et peut créer des services Cloud Run. Que peut-il faire ?", "Un atacante tiene `iam.serviceAccounts.actAs` sobre una cuenta de servicio poderosa y puede crear servicios de Cloud Run. ¿Qué puede hacer?"],
    a: ["Deploy code running as that account and act with all its roles: a privilege escalation", "Déployer du code qui tourne avec ce compte et agir avec tous ses rôles : une élévation de privilèges", "Desplegar código que se ejecute como esa cuenta y actuar con todos sus roles: una escalada de privilegios"],
    w: [["Nothing: actAs only shows the account's name", "Rien : actAs ne montre que le nom du compte", "Nada: actAs solo muestra el nombre de la cuenta"], ["Read the account's private key", "Lire la clé privée du compte", "Leer la clave privada de la cuenta"], ["Only see the account's audit logs", "Seulement voir les journaux d'audit du compte", "Solo ver los registros de auditoría de la cuenta"]],
    e: [
      "Any service that runs code as an attached account (VMs, Cloud Run, Cloud Build, Dataflow, GKE) turns actAs plus create rights into that account's power. Hence: Service Account User on specific accounts only, powerful accounts in separate projects, and reviews of who holds both.",
      "Tout service qui exécute du code avec un compte attaché (VM, Cloud Run, Cloud Build, Dataflow, GKE) transforme actAs plus des droits de création en pouvoir de ce compte. D'où : Service Account User seulement sur des comptes précis, comptes puissants dans des projets séparés, et revue de qui détient les deux.",
      "Todo servicio que ejecute código con una cuenta asociada (VM, Cloud Run, Cloud Build, Dataflow, GKE) convierte actAs más permisos de creación en el poder de esa cuenta. De ahí: Service Account User solo sobre cuentas concretas, cuentas poderosas en proyectos aparte, y revisar quién tiene ambas cosas.",
    ],
  },
  {
    id: "gc-sax-03",
    q: ["A service account is deleted by mistake. What can be done?", "Un compte de service est supprimé par erreur. Que peut-on faire ?", "Se borra una cuenta de servicio por error. ¿Qué se puede hacer?"],
    a: ["Undelete it within 30 days by its unique ID; creating a new one with the same email gives a new identity that old bindings do not match", "La restaurer dans les 30 jours par son ID unique ; en recréer une avec la même adresse donne une nouvelle identité que les anciennes liaisons ne visent pas", "Restaurarla en 30 días por su ID único; crear otra con el mismo correo da una identidad nueva a la que no apuntan las vinculaciones antiguas"],
    w: [["Nothing: deletion is final at once", "Rien : la suppression est immédiatement définitive", "Nada: el borrado es definitivo al instante"], ["Recreate it with the same email: everything works again", "La recréer avec la même adresse : tout refonctionne", "Crearla de nuevo con el mismo correo: todo vuelve a funcionar"], ["Ask any project owner to restore it from a backup", "Demander à un propriétaire de projet de la restaurer d'une sauvegarde", "Pedir a un propietario de proyecto que la restaure de una copia"]],
    e: [
      "Bindings reference the account's unique ID internally; a deleted account appears as `deleted:serviceAccount:…?uid=…` in policies. Disabling an account first, then deleting it after a quiet period, avoids such incidents.",
      "Les liaisons référencent en interne l'ID unique du compte ; un compte supprimé apparaît comme `deleted:serviceAccount:…?uid=…` dans les stratégies. Désactiver d'abord un compte, puis le supprimer après une période calme, évite ce genre d'incident.",
      "Las vinculaciones hacen referencia internamente al ID único de la cuenta; una cuenta borrada aparece como `deleted:serviceAccount:…?uid=…` en las políticas. Desactivar primero la cuenta y borrarla tras un periodo tranquilo evita estos incidentes.",
    ],
  },
];

const securityExpert: GcpQuestion[] = [
  {
    id: "gc-secx-01",
    q: ["How does a customer see, and control, Google staff accessing its content?", "Comment un client voit-il, et contrôle-t-il, l'accès du personnel de Google à son contenu ?", "¿Cómo ve, y controla, un cliente el acceso del personal de Google a su contenido?"],
    a: ["Access Transparency logs record such access with a justification; Access Approval requires the customer's approval first", "Les journaux Access Transparency enregistrent ces accès avec une justification ; Access Approval exige d'abord l'approbation du client", "Los registros de Access Transparency guardan esos accesos con una justificación; Access Approval exige antes la aprobación del cliente"],
    w: [["Data Access audit logs show Google staff as ordinary users", "Les journaux Data Access montrent le personnel Google comme des utilisateurs ordinaires", "Los registros Data Access muestran al personal de Google como usuarios normales"], ["It cannot: Google access is invisible", "Impossible : l'accès de Google est invisible", "No puede: el acceso de Google es invisible"], ["By removing Google from the IAM policy", "En retirant Google de la stratégie IAM", "Quitando a Google de la política de IAM"]],
    e: [
      "Both apply to supported services and are part of the sovereignty and compliance toolset, alongside key management outside Google (Cloud External Key Manager) and Assured Workloads for regulated regimes.",
      "Les deux s'appliquent aux services compatibles et font partie des outils de souveraineté et de conformité, avec la gestion des clés hors de Google (Cloud External Key Manager) et Assured Workloads pour les régimes réglementés.",
      "Ambos se aplican a los servicios compatibles y forman parte de las herramientas de soberanía y cumplimiento, junto con la gestión de claves fuera de Google (Cloud External Key Manager) y Assured Workloads para regímenes regulados.",
    ],
  },
  {
    id: "gc-secx-02",
    q: ["What does a Confidential VM protect that ordinary encryption does not?", "Que protège une Confidential VM que le chiffrement ordinaire ne protège pas ?", "¿Qué protege una Confidential VM que el cifrado normal no protege?"],
    a: ["Data in use: memory is encrypted by the CPU with keys the hypervisor cannot read", "Les données en cours d'utilisation : la mémoire est chiffrée par le processeur avec des clés que l'hyperviseur ne peut pas lire", "Los datos en uso: la memoria la cifra el procesador con claves que el hipervisor no puede leer"],
    w: [["Data at rest on disks", "Les données au repos sur les disques", "Los datos en reposo en los discos"], ["Data in transit on the internet", "Les données en transit sur internet", "Los datos en tránsito por internet"], ["Logs only", "Seulement les journaux", "Solo los registros"]],
    e: [
      "At rest and in transit are already encrypted by default. Confidential computing (AMD SEV, Intel TDX) covers the third state, with attestation to prove the VM runs in such an environment. Applications run unchanged; there is a small performance cost.",
      "Au repos et en transit, tout est déjà chiffré par défaut. L'informatique confidentielle (AMD SEV, Intel TDX) couvre le troisième état, avec une attestation qui prouve que la VM tourne dans un tel environnement. Les applications tournent sans modification ; il y a un léger coût en performance.",
      "En reposo y en tránsito ya está todo cifrado por defecto. La computación confidencial (AMD SEV, Intel TDX) cubre el tercer estado, con una atestación que prueba que la VM se ejecuta en ese entorno. Las aplicaciones funcionan sin cambios; hay un pequeño coste de rendimiento.",
    ],
  },
  {
    id: "gc-secx-03",
    q: ["VPC Service Controls blocks a legitimate partner who must write to a bucket inside the perimeter. The precise fix?", "VPC Service Controls bloque un partenaire légitime qui doit écrire dans un bucket du périmètre. La correction précise ?", "VPC Service Controls bloquea a un socio legítimo que debe escribir en un bucket del perímetro. ¿El arreglo preciso?"],
    a: ["An ingress rule naming the partner's identities, the service and method, and the target resources", "Une règle d'entrée qui nomme les identités du partenaire, le service et la méthode, et les ressources visées", "Una regla de entrada que nombra las identidades del socio, el servicio y el método, y los recursos de destino"],
    w: [["Remove the bucket's project from the perimeter", "Retirer le projet du bucket du périmètre", "Quitar del perímetro el proyecto del bucket"], ["Grant the partner Owner", "Accorder Owner au partenaire", "Conceder Owner al socio"], ["Switch the whole perimeter to dry-run", "Passer tout le périmètre en simulation", "Pasar todo el perímetro a modo de prueba"]],
    e: [
      "Ingress and egress rules open narrow, audited paths: these identities, from these sources, may call `storage.googleapis.com` methods on these projects. The partner still needs IAM permissions; the perimeter and IAM must both say yes. Violation logs carry the details to write the rule.",
      "Les règles d'entrée et de sortie ouvrent des chemins étroits et audités : ces identités, depuis ces sources, peuvent appeler ces méthodes de `storage.googleapis.com` sur ces projets. Le partenaire a toujours besoin de permissions IAM ; périmètre et IAM doivent dire oui tous deux. Les journaux de violation donnent les détails pour écrire la règle.",
      "Las reglas de entrada y salida abren caminos estrechos y auditados: estas identidades, desde estos orígenes, pueden llamar a estos métodos de `storage.googleapis.com` en estos proyectos. El socio sigue necesitando permisos de IAM; perímetro e IAM deben decir que sí los dos. Los registros de infracción dan los detalles para escribir la regla.",
    ],
  },
];

const networkingExpert: GcpQuestion[] = [
  {
    id: "gc-netx-01",
    q: ["Why prefer secure tags to network tags in firewall rules for production?", "Pourquoi préférer les tags sécurisés aux tags réseau dans les règles de pare-feu de production ?", "¿Por qué preferir los tags seguros a las etiquetas de red en las reglas de firewall de producción?"],
    a: ["Secure tags are IAM-controlled Resource Manager tags, so a VM's editor cannot just add one to get through; network policies use them as targets and sources", "Les tags sécurisés sont des tags Resource Manager contrôlés par IAM : l'éditeur d'une VM ne peut pas simplement en ajouter un pour passer ; les stratégies réseau les utilisent comme cibles et sources", "Los tags seguros son tags de Resource Manager controlados por IAM, así que quien edita una VM no puede añadir uno sin más para pasar; las políticas de red los usan como destinos y orígenes"],
    w: [["Network tags are deprecated and ignored", "Les tags réseau sont obsolètes et ignorés", "Las etiquetas de red están obsoletas y se ignoran"], ["Secure tags are faster to evaluate", "Les tags sécurisés sont plus rapides à évaluer", "Los tags seguros se evalúan más rápido"], ["Secure tags work across organisations without IAM", "Les tags sécurisés marchent entre organisations sans IAM", "Los tags seguros funcionan entre organizaciones sin IAM"]],
    e: [
      "With network tags, `compute.instances.setTags` (part of common instance roles) lets someone opt a VM into an allow rule. Secure tags need `roles/resourcemanager.tagUser` on the tag value, a separate grant. They are used by global and regional network firewall policies, not by VPC firewall rules.",
      "Avec les tags réseau, `compute.instances.setTags` (inclus dans des rôles d'instance courants) permet de faire entrer une VM dans une règle d'autorisation. Les tags sécurisés demandent `roles/resourcemanager.tagUser` sur la valeur du tag, une attribution distincte. Ils sont utilisés par les stratégies de pare-feu réseau globales et régionales, pas par les règles de pare-feu VPC.",
      "Con las etiquetas de red, `compute.instances.setTags` (incluido en roles de instancia habituales) permite meter una VM en una regla de permiso. Los tags seguros requieren `roles/resourcemanager.tagUser` sobre el valor del tag, una concesión aparte. Los usan las políticas de firewall de red globales y regionales, no las reglas de firewall de VPC.",
    ],
  },
  {
    id: "gc-netx-02",
    q: ["What does a hierarchical firewall policy rule with action `goto_next` do?", "Que fait une règle de stratégie de pare-feu hiérarchique avec l'action `goto_next` ?", "¿Qué hace una regla de política de firewall jerárquica con la acción `goto_next`?"],
    a: ["It stops evaluating that policy and hands the decision to the next level: a folder's policy, then the VPC's rules and network policies", "Elle arrête l'évaluation de cette stratégie et passe la décision au niveau suivant : la stratégie d'un dossier, puis les règles du VPC et les stratégies réseau", "Detiene la evaluación de esa política y pasa la decisión al nivel siguiente: la política de una carpeta, luego las reglas de la VPC y las políticas de red"],
    w: [["It allows the packet", "Elle autorise le paquet", "Permite el paquete"], ["It denies the packet and logs it", "Elle refuse le paquet et le journalise", "Deniega el paquete y lo registra"], ["It retries the rule later", "Elle réessaie la règle plus tard", "Reintenta la regla más tarde"]],
    e: [
      "Hierarchical policies let a central team decide some traffic for everyone (deny known-bad ranges, allow health checks) and delegate the rest with `goto_next`. A level with no matching rule also passes to the next. If nothing decides, the implied rules deny ingress and allow egress.",
      "Les stratégies hiérarchiques permettent à une équipe centrale de décider une partie du trafic pour tous (refuser des plages malveillantes connues, autoriser les vérifications d'état) et de déléguer le reste avec `goto_next`. Un niveau sans règle correspondante passe aussi au suivant. Si rien ne décide, les règles implicites refusent l'entrée et autorisent la sortie.",
      "Las políticas jerárquicas permiten a un equipo central decidir parte del tráfico para todos (denegar rangos maliciosos conocidos, permitir comprobaciones de estado) y delegar el resto con `goto_next`. Un nivel sin regla coincidente también pasa al siguiente. Si nada decide, las reglas implícitas deniegan la entrada y permiten la salida.",
    ],
  },
  {
    id: "gc-netx-03",
    q: ["What does setting a network's enforcement order to `BEFORE_CLASSIC_FIREWALL` change?", "Que change le réglage de l'ordre d'application d'un réseau sur `BEFORE_CLASSIC_FIREWALL` ?", "¿Qué cambia poner el orden de aplicación de una red en `BEFORE_CLASSIC_FIREWALL`?"],
    a: ["Global and regional network firewall policies are evaluated before the VPC firewall rules instead of after", "Les stratégies de pare-feu réseau globales et régionales sont évaluées avant les règles de pare-feu VPC au lieu d'après", "Las políticas de firewall de red globales y regionales se evalúan antes que las reglas de firewall de VPC en lugar de después"],
    w: [["Hierarchical policies move after the VPC rules", "Les stratégies hiérarchiques passent après les règles VPC", "Las políticas jerárquicas pasan detrás de las reglas de VPC"], ["VPC rules are disabled", "Les règles VPC sont désactivées", "Las reglas de VPC se desactivan"], ["Egress is denied by default", "La sortie est refusée par défaut", "La salida se deniega por defecto"]],
    e: [
      "Hierarchical policies always come first. The option helps migrate from VPC rules to network policies: the new policy decides first, and the old rules remain as a fallback until removed.",
      "Les stratégies hiérarchiques passent toujours en premier. L'option aide à migrer des règles VPC vers les stratégies réseau : la nouvelle stratégie décide d'abord, et les anciennes règles restent en filet de sécurité jusqu'à leur retrait.",
      "Las políticas jerárquicas siempre van primero. La opción ayuda a migrar de las reglas de VPC a las políticas de red: la política nueva decide antes, y las reglas antiguas se quedan de respaldo hasta quitarlas.",
    ],
  },
  {
    id: "gc-netx-04",
    q: ["A subnet's primary range is full. What can be done in place?", "La plage principale d'un sous-réseau est pleine. Que peut-on faire sur place ?", "El rango principal de una subred está lleno. ¿Qué se puede hacer sin moverla?"],
    a: ["Expand it to a shorter prefix (e.g. /24 to /22), if the larger range overlaps nothing; it can never shrink", "L'agrandir vers un préfixe plus court (par ex. /24 vers /22), si la plage plus large ne chevauche rien ; elle ne peut jamais rétrécir", "Ampliarlo a un prefijo más corto (p. ej. /24 a /22), si el rango mayor no se solapa con nada; nunca se puede reducir"],
    w: [["Nothing: the subnet must be recreated", "Rien : il faut recréer le sous-réseau", "Nada: hay que recrear la subred"], ["Add a second primary range", "Ajouter une seconde plage principale", "Añadir un segundo rango principal"], ["Shrink it and add another", "La réduire et en ajouter une autre", "Reducirla y añadir otra"]],
    e: [
      "`gcloud compute networks subnets expand-ip-range` keeps existing addresses, since the new range contains the old one. Plan address space ahead: peered networks, Shared VPC and on-premises ranges must all stay disjoint. Secondary ranges can be added for alias IPs.",
      "`gcloud compute networks subnets expand-ip-range` garde les adresses existantes, puisque la nouvelle plage contient l'ancienne. Planifier l'espace d'adressage à l'avance : réseaux appairés, Shared VPC et plages sur site doivent tous rester disjoints. Des plages secondaires peuvent s'ajouter pour les IP d'alias.",
      "`gcloud compute networks subnets expand-ip-range` conserva las direcciones existentes, porque el rango nuevo contiene al antiguo. Planificar el espacio de direcciones con antelación: redes con peering, Shared VPC y rangos locales deben seguir siendo disjuntos. Se pueden añadir rangos secundarios para IP de alias.",
    ],
  },
];

const computeExpert: GcpQuestion[] = [
  {
    id: "gc-cmpx-01",
    q: ["A Cloud Run service must handle a long background job after the response is sent. What is needed?", "Un service Cloud Run doit poursuivre un long travail après l'envoi de la réponse. Que faut-il ?", "Un servicio de Cloud Run debe seguir con un trabajo largo tras enviar la respuesta. ¿Qué hace falta?"],
    a: ["Instance-based billing (CPU always allocated), or better, hand the job to Cloud Run jobs, Cloud Tasks or Pub/Sub", "La facturation à l'instance (CPU toujours alloué), ou mieux, confier le travail à des Cloud Run jobs, Cloud Tasks ou Pub/Sub", "Facturación por instancia (CPU siempre asignada), o mejor, pasar el trabajo a Cloud Run jobs, Cloud Tasks o Pub/Sub"],
    w: [["Nothing: Cloud Run keeps full CPU forever", "Rien : Cloud Run garde tout le CPU indéfiniment", "Nada: Cloud Run mantiene toda la CPU para siempre"], ["A higher concurrency", "Une concurrence plus élevée", "Una concurrencia mayor"], ["A larger container image", "Une image de conteneur plus grande", "Una imagen de contenedor más grande"]],
    e: [
      "With request-based billing, CPU is throttled outside requests, so background work stalls; the instance may also be shut down when idle. Jobs run to completion with retries and up to many hours; a task queue makes the work durable and retried.",
      "Avec la facturation à la requête, le CPU est bridé hors des requêtes : le travail en arrière-plan cale ; l'instance peut aussi être arrêtée au repos. Les jobs s'exécutent jusqu'au bout avec reprises, jusqu'à de nombreuses heures ; une file de tâches rend le travail durable et rejoué.",
      "Con la facturación por petición, la CPU se limita fuera de las peticiones, así que el trabajo en segundo plano se atasca; la instancia también puede apagarse en reposo. Los jobs se ejecutan hasta el final con reintentos, durante muchas horas; una cola de tareas hace el trabajo duradero y reintentado.",
    ],
  },
  {
    id: "gc-cmpx-02",
    q: ["During a GKE node upgrade, how do you keep a service available?", "Pendant une mise à jour des nœuds GKE, comment garder un service disponible ?", "Durante una actualización de nodos de GKE, ¿cómo se mantiene disponible un servicio?"],
    a: ["Several replicas spread across nodes and zones, a PodDisruptionBudget, and surge or blue-green node upgrades", "Plusieurs répliques réparties sur nœuds et zones, un PodDisruptionBudget, et des mises à jour de nœuds en surge ou blue-green", "Varias réplicas repartidas entre nodos y zonas, un PodDisruptionBudget, y actualizaciones de nodos en surge o blue-green"],
    w: [["Disable upgrades forever", "Désactiver les mises à jour pour toujours", "Desactivar las actualizaciones para siempre"], ["One replica with a large node", "Une réplique sur un gros nœud", "Una réplica en un nodo grande"], ["Restart the cluster at night", "Redémarrer le cluster la nuit", "Reiniciar el clúster de noche"]],
    e: [
      "Upgrades drain nodes; a PodDisruptionBudget limits how many pods may be evicted at once, and spread constraints avoid all replicas on one node. Maintenance windows and exclusions choose when upgrades happen; release channels choose how fast versions arrive.",
      "Les mises à jour vident les nœuds ; un PodDisruptionBudget limite combien de pods peuvent être évincés à la fois, et des contraintes de répartition évitent toutes les répliques sur un nœud. Fenêtres et exclusions de maintenance choisissent quand les mises à jour ont lieu ; les canaux de publication, à quelle vitesse arrivent les versions.",
      "Las actualizaciones vacían los nodos; un PodDisruptionBudget limita cuántos pods se pueden desalojar a la vez, y las restricciones de reparto evitan tener todas las réplicas en un nodo. Las ventanas y exclusiones de mantenimiento eligen cuándo se actualiza; los canales de versiones, a qué ritmo llegan las versiones.",
    ],
  },
  {
    id: "gc-cmpx-03",
    q: ["A MIG behind a load balancer keeps recreating VMs that are actually fine. A likely cause?", "Un MIG derrière un équilibreur recrée sans cesse des VM qui vont pourtant bien. Une cause probable ?", "Un MIG tras un balanceador recrea una y otra vez VM que en realidad están bien. ¿Una causa probable?"],
    a: ["The autohealing health check fails: firewall blocking the checkers' ranges, wrong port or path, or an initial delay shorter than the boot time", "La vérification d'état de réparation échoue : pare-feu bloquant les plages des vérificateurs, mauvais port ou chemin, ou délai initial plus court que le démarrage", "La comprobación de estado de autorreparación falla: firewall que bloquea los rangos de los comprobadores, puerto o ruta erróneos, o retraso inicial más corto que el arranque"],
    w: [["Spot VMs are always recreated hourly", "Les Spot VM sont toujours recréées chaque heure", "Las Spot VM siempre se recrean cada hora"], ["The instance template is too new", "Le modèle d'instance est trop récent", "La plantilla de instancia es demasiado nueva"], ["The load balancer's IP changed", "L'IP de l'équilibreur a changé", "La IP del balanceador cambió"]],
    e: [
      "Autohealing deletes instances that fail their health check. If the checker cannot reach them (firewall from `35.191.0.0/16` and `130.211.0.0/22`), or checks before the application has started, healthy VMs loop. A lenient autohealing check, separate from the load balancer's, avoids cascades.",
      "La réparation automatique supprime les instances qui échouent à leur vérification d'état. Si le vérificateur ne peut pas les atteindre (pare-feu depuis `35.191.0.0/16` et `130.211.0.0/22`), ou vérifie avant le démarrage de l'application, des VM saines tournent en boucle. Une vérification de réparation plus tolérante, distincte de celle de l'équilibreur, évite les cascades.",
      "La autorreparación borra las instancias que fallan su comprobación de estado. Si el comprobador no puede llegar a ellas (firewall desde `35.191.0.0/16` y `130.211.0.0/22`), o comprueba antes de que arranque la aplicación, VM sanas entran en bucle. Una comprobación de autorreparación más tolerante, distinta de la del balanceador, evita cascadas.",
    ],
  },
];

const storageExpert: GcpQuestion[] = [
  {
    id: "gc-stox-01",
    q: ["What lets Spanner offer externally consistent transactions across regions?", "Qu'est-ce qui permet à Spanner d'offrir des transactions à cohérence externe entre régions ?", "¿Qué permite a Spanner ofrecer transacciones con consistencia externa entre regiones?"],
    a: ["TrueTime: synchronised clocks with a bounded uncertainty, waited out at commit", "TrueTime : des horloges synchronisées à l'incertitude bornée, attendue au moment du commit", "TrueTime: relojes sincronizados con una incertidumbre acotada, que se espera al hacer commit"],
    w: [["A single primary in one region for all writes, with lag", "Un seul primaire dans une région pour toutes les écritures, avec retard", "Un solo primario en una región para todas las escrituras, con retraso"], ["Eventual consistency with conflict resolution", "Une cohérence à terme avec résolution des conflits", "Consistencia eventual con resolución de conflictos"], ["Locking every table during each transaction", "Le verrouillage de chaque table pendant chaque transaction", "Bloquear cada tabla durante cada transacción"]],
    e: [
      "Commit timestamps reflect real time order: if T1 commits before T2 starts, T2's timestamp is later, everywhere. Paxos replicates each split; the price is write latency tied to the distances between replicas.",
      "Les horodatages de commit reflètent l'ordre réel : si T1 est validée avant que T2 commence, l'horodatage de T2 est postérieur, partout. Paxos réplique chaque partition ; le prix est une latence d'écriture liée aux distances entre répliques.",
      "Las marcas de tiempo de commit reflejan el orden real: si T1 se confirma antes de que empiece T2, la marca de T2 es posterior, en todas partes. Paxos replica cada partición; el precio es una latencia de escritura ligada a las distancias entre réplicas.",
    ],
  },
  {
    id: "gc-stox-02",
    q: ["A Bigtable table's row keys start with a timestamp. What goes wrong?", "Les clés de ligne d'une table Bigtable commencent par un horodatage. Qu'est-ce qui ne va pas ?", "Las claves de fila de una tabla de Bigtable empiezan por una marca de tiempo. ¿Qué falla?"],
    a: ["Writes all land on the same key range, hotspotting one node; lead with a well-distributed field instead", "Les écritures tombent toutes sur la même plage de clés et surchargent un nœud ; commencer plutôt par un champ bien réparti", "Todas las escrituras caen en el mismo rango de claves y sobrecargan un nodo; empezar mejor por un campo bien repartido"],
    w: [["Timestamps are not allowed in keys", "Les horodatages sont interdits dans les clés", "Las marcas de tiempo no se permiten en las claves"], ["Reads become eventually consistent", "Les lectures deviennent à cohérence finale", "Las lecturas pasan a ser eventualmente consistentes"], ["Nothing: Bigtable hashes keys", "Rien : Bigtable hache les clés", "Nada: Bigtable aplica hash a las claves"]],
    e: [
      "Bigtable sorts rows by key and splits ranges across nodes; monotonically increasing keys send all new writes to the last range. Keys such as `device#reversed-timestamp` spread load and keep each device's data together for scans.",
      "Bigtable trie les lignes par clé et répartit les plages entre nœuds ; des clés croissantes envoient toutes les nouvelles écritures sur la dernière plage. Des clés comme `device#reversed-timestamp` répartissent la charge et gardent les données de chaque appareil ensemble pour les parcours.",
      "Bigtable ordena las filas por clave y reparte los rangos entre nodos; claves crecientes mandan todas las escrituras nuevas al último rango. Claves como `device#reversed-timestamp` reparten la carga y mantienen juntos los datos de cada dispositivo para los recorridos.",
    ],
  },
  {
    id: "gc-stox-03",
    q: ["After a successful upload to Cloud Storage, is a read or a listing from another region guaranteed to see the new object?", "Après un envoi réussi vers Cloud Storage, une lecture ou un listage depuis une autre région voit-il forcément le nouvel objet ?", "Tras una subida correcta a Cloud Storage, ¿una lectura o un listado desde otra región ve con seguridad el objeto nuevo?"],
    a: ["Yes: object reads, writes, deletes and listings are strongly consistent", "Oui : lectures, écritures, suppressions et listages d'objets sont fortement cohérents", "Sí: las lecturas, escrituras, borrados y listados de objetos son fuertemente consistentes"],
    w: [["No: listings are eventually consistent for hours", "Non : les listages sont à cohérence finale pendant des heures", "No: los listados son eventualmente consistentes durante horas"], ["Only within the same zone", "Seulement dans la même zone", "Solo dentro de la misma zona"], ["Only for the Standard class", "Seulement pour la classe Standard", "Solo para la clase Standard"]],
    e: [
      "Strong global consistency removes the need for retries after writes. Caching is the exception: publicly cacheable objects may be served stale by caches until `Cache-Control` expires. Access changes (IAM) are themselves eventually consistent.",
      "La cohérence forte globale évite de réessayer après les écritures. Le cache fait exception : des objets publics mis en cache peuvent être servis périmés jusqu'à l'expiration de `Cache-Control`. Les changements d'accès (IAM) sont, eux, cohérents à terme.",
      "La consistencia fuerte global evita reintentar tras las escrituras. La caché es la excepción: los objetos públicos almacenados en caché pueden servirse desfasados hasta que caduque `Cache-Control`. Los cambios de acceso (IAM) tienen, en cambio, consistencia eventual.",
    ],
  },
];

const operationsExpert: GcpQuestion[] = [
  {
    id: "gc-opsx-01",
    q: ["Resources created by hand must come under Terraform without being recreated. How?", "Des ressources créées à la main doivent passer sous Terraform sans être recréées. Comment ?", "Unos recursos creados a mano deben pasar a Terraform sin recrearse. ¿Cómo?"],
    a: ["Write their configuration and `import` blocks, then check that `terraform plan` shows no change", "Écrire leur configuration et des blocs `import`, puis vérifier que `terraform plan` n'affiche aucun changement", "Escribir su configuración y bloques `import`, y luego comprobar que `terraform plan` no muestra cambios"],
    w: [["Delete them and let Terraform recreate them", "Les supprimer et laisser Terraform les recréer", "Borrarlos y dejar que Terraform los recree"], ["Copy the state file of another project", "Copier le fichier d'état d'un autre projet", "Copiar el archivo de estado de otro proyecto"], ["Run `terraform apply -force`", "Lancer `terraform apply -force`", "Ejecutar `terraform apply -force`"]],
    e: [
      "Import blocks put existing resources into state under a configuration address; `terraform plan -generate-config-out` can draft the configuration. An empty plan proves configuration and reality match. `gcloud beta resource-config bulk-export` can export existing resources as Terraform too.",
      "Les blocs import placent des ressources existantes dans l'état sous une adresse de configuration ; `terraform plan -generate-config-out` peut ébaucher la configuration. Un plan vide prouve que configuration et réalité concordent. `gcloud beta resource-config bulk-export` peut aussi exporter des ressources existantes en Terraform.",
      "Los bloques import meten recursos existentes en el estado bajo una dirección de configuración; `terraform plan -generate-config-out` puede esbozar la configuración. Un plan vacío demuestra que configuración y realidad coinciden. `gcloud beta resource-config bulk-export` también puede exportar recursos existentes como Terraform.",
    ],
  },
  {
    id: "gc-opsx-02",
    q: ["An incident: a service account key may have leaked. In which order should you act?", "Incident : une clé de compte de service a peut-être fuité. Dans quel ordre agir ?", "Incidente: puede que se haya filtrado una clave de cuenta de servicio. ¿En qué orden actuar?"],
    a: ["Disable the key (and the account if needed), then find its use in audit logs, then rotate dependents and remove the root cause", "Désactiver la clé (et le compte si besoin), puis retrouver son usage dans les journaux d'audit, puis renouveler ce qui en dépend et supprimer la cause", "Desactivar la clave (y la cuenta si hace falta), luego buscar su uso en los registros de auditoría, luego renovar lo que depende de ella y eliminar la causa"],
    w: [["Read the logs for a week before changing anything", "Lire les journaux pendant une semaine avant de toucher à quoi que ce soit", "Leer los registros durante una semana antes de cambiar nada"], ["Delete the project", "Supprimer le projet", "Borrar el proyecto"], ["Create a second key so the first is ignored", "Créer une seconde clé pour que la première soit ignorée", "Crear una segunda clave para que se ignore la primera"]],
    e: [
      "Containment first: a disabled key stops working at once (allow for propagation), and can be re-enabled if it was a false alarm. Audit logs show the key ID in `authenticationInfo.serviceAccountKeyName`, revealing what it did. Then move the workload to keyless authentication.",
      "D'abord contenir : une clé désactivée cesse de marcher aussitôt (compter la propagation) et peut être réactivée si c'était une fausse alerte. Les journaux d'audit montrent l'ID de la clé dans `authenticationInfo.serviceAccountKeyName`, ce qui révèle ce qu'elle a fait. Ensuite, passer la charge à une authentification sans clé.",
      "Primero contener: una clave desactivada deja de funcionar enseguida (contar con la propagación) y se puede reactivar si fue una falsa alarma. Los registros de auditoría muestran el ID de la clave en `authenticationInfo.serviceAccountKeyName`, lo que revela qué hizo. Después, pasar la carga a autenticación sin claves.",
    ],
  },
  {
    id: "gc-opsx-03",
    q: ["How do you stop pull requests from introducing a public bucket or an over-broad role, before anything is deployed?", "Comment empêcher des pull requests d'introduire un bucket public ou un rôle trop large, avant tout déploiement ?", "¿Cómo se impide que las pull requests introduzcan un bucket público o un rol demasiado amplio, antes de desplegar nada?"],
    a: ["Policy as code in CI: check the Terraform plan against rules (Open Policy Agent, Conftest or similar), backed by organisation policies at run time", "La politique sous forme de code en CI : vérifier le plan Terraform face à des règles (Open Policy Agent, Conftest ou équivalent), doublé des règles d'administration à l'exécution", "Políticas como código en CI: comprobar el plan de Terraform contra reglas (Open Policy Agent, Conftest o similar), respaldado por las políticas de organización en ejecución"],
    w: [["Review by eye only", "Une relecture à l'œil seulement", "Solo revisión a ojo"], ["A budget alert after deployment", "Une alerte de budget après le déploiement", "Una alerta de presupuesto tras el despliegue"], ["Disallow Terraform", "Interdire Terraform", "Prohibir Terraform"]],
    e: [
      "Checks on `terraform show -json plan` catch problems at review time with a clear message; organisation policies stop the same thing for changes made by any other path. Both layers matter: CI can be bypassed, and organisation policies give late, terse errors.",
      "Des contrôles sur `terraform show -json plan` attrapent les problèmes à la relecture avec un message clair ; les règles d'administration bloquent la même chose pour les changements faits par tout autre chemin. Les deux couches comptent : la CI peut être contournée, et les règles d'administration donnent des erreurs tardives et laconiques.",
      "Las comprobaciones sobre `terraform show -json plan` detectan los problemas en la revisión con un mensaje claro; las políticas de organización frenan lo mismo para cambios hechos por cualquier otro camino. Ambas capas importan: la CI se puede saltar, y las políticas de organización dan errores tardíos y escuetos.",
    ],
  },
];

export const hierarchy = { governance };
export const iam = { iamExpert };
export const serviceAccounts = { saExpert };
export const security = { securityExpert };
export const networking = { networkingExpert };
export const compute = { computeExpert };
export const storage = { storageExpert };
export const operations = { operationsExpert };
