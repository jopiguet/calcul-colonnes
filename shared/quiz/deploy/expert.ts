/**
 * Deployment systems, Expert: SLSA and hermetic builds, monorepo
 * pipelines, OCI images and build secrets, signatures, shadow traffic,
 * cells and bake time, burn-rate alerts and toil, OpenTofu and licences,
 * blast radius, replacements and removed blocks, tests and ephemeral
 * values, scheduling and graceful shutdown, Cloud Run in depth and
 * disaster recovery.
 */
import type { LinuxQuestion as DeployQuestion } from "../linux/types";

const pipelineExpert: DeployQuestion[] = [
  {
    id: "dp-pipeline-31",
    q: ["What does SLSA build provenance at a higher level guarantee?", "Que garantit une provenance de build SLSA de niveau élevé ?", "¿Qué garantiza una procedencia de build SLSA de nivel alto?"],
    a: ["That the artifact was built by a named, hardened build platform from a stated source, with provenance the build itself cannot forge", "Que l'artefact a été construit par une plateforme de build nommée et durcie à partir d'une source déclarée, avec une provenance que le build lui-même ne peut pas falsifier", "Que el artefacto lo construyó una plataforma de build nombrada y reforzada a partir de una fuente declarada, con una procedencia que el propio build no puede falsificar"],
    w: [["That the code has no bugs", "Que le code n'a pas de bugs", "Que el código no tiene errores"], ["That two people reviewed every line", "Que deux personnes ont relu chaque ligne", "Que dos personas revisaron cada línea"], ["That the artifact is encrypted", "Que l'artefact est chiffré", "Que el artefacto está cifrado"]],
    e: [
      "SLSA (Supply-chain Levels for Software Artifacts) grades how trustworthy a build's origin is. Its higher build levels require the provenance to be generated and signed by the platform, isolated from the user's build steps, so a compromised step cannot lie about where the artifact came from. Consumers verify provenance before deploying.",
      "SLSA (Supply-chain Levels for Software Artifacts) note la fiabilité de l'origine d'un build. Ses niveaux de build élevés exigent que la provenance soit générée et signée par la plateforme, isolée des étapes de build de l'utilisateur, donc une étape compromise ne peut pas mentir sur l'origine de l'artefact. Les utilisateurs vérifient la provenance avant de déployer.",
      "SLSA (Supply-chain Levels for Software Artifacts) califica lo fiable que es el origen de un build. Sus niveles de build altos exigen que la procedencia la genere y firme la plataforma, aislada de los pasos de build del usuario, así que un paso comprometido no puede mentir sobre el origen del artefacto. Los usuarios verifican la procedencia antes de desplegar.",
    ],
  },
  {
    id: "dp-pipeline-32",
    q: ["What is a hermetic build?", "Qu'est-ce qu'un build hermétique ?", "¿Qué es un build hermético?"],
    a: ["A build whose every input is declared and fetched by hash in advance, with no network access during the build", "Un build dont chaque entrée est déclarée et récupérée par hash à l'avance, sans accès réseau pendant le build", "Un build cuyas entradas se declaran todas y se descargan por hash de antemano, sin acceso a la red durante el build"],
    w: [["A build run on a machine without users", "Un build lancé sur une machine sans utilisateurs", "Un build ejecutado en una máquina sin usuarios"], ["A build whose output is encrypted", "Un build dont le résultat est chiffré", "Un build cuyo resultado está cifrado"], ["A build that never uses caches", "Un build qui n'utilise jamais de cache", "Un build que nunca usa caché"]],
    e: [
      "If a build can download whatever it likes, its result depends on the day and on remote servers. Tools such as Bazel or Nix declare inputs with hashes and sandbox the build, which makes results reproducible and caches safe to share, since identical inputs always give identical outputs.",
      "Si un build peut télécharger ce qu'il veut, son résultat dépend du jour et de serveurs distants. Des outils comme Bazel ou Nix déclarent les entrées avec des hashes et isolent le build, ce qui rend les résultats reproductibles et les caches sûrs à partager, puisque des entrées identiques donnent toujours des résultats identiques.",
      "Si un build puede descargar lo que quiera, su resultado depende del día y de servidores remotos. Herramientas como Bazel o Nix declaran las entradas con hashes y aíslan el build, lo que hace reproducibles los resultados y seguras de compartir las cachés, porque entradas idénticas siempre dan resultados idénticos.",
    ],
  },
  {
    id: "dp-pipeline-33",
    q: ["A monorepo holds 40 services. Why build only the affected ones on each change?", "Un monorepo contient 40 services. Pourquoi ne construire que ceux qui sont touchés à chaque changement ?", "Un monorepo contiene 40 servicios. ¿Por qué construir solo los afectados en cada cambio?"],
    a: ["Building everything makes pipelines slow and deploys noisy; a dependency graph finds the services whose inputs changed", "Tout construire rend les pipelines lents et les déploiements bruyants ; un graphe de dépendances trouve les services dont les entrées ont changé", "Construirlo todo hace lentos los pipelines y ruidosos los despliegues; un grafo de dependencias encuentra los servicios cuyas entradas cambiaron"],
    w: [["Unaffected services cannot be built", "Les services non touchés ne peuvent pas être construits", "Los servicios no afectados no se pueden construir"], ["Git refuses to check out the whole monorepo", "Git refuse de récupérer tout le monorepo", "Git se niega a descargar todo el monorepo"], ["Each service needs a separate repository to deploy", "Chaque service a besoin d'un dépôt séparé pour être déployé", "Cada servicio necesita un repositorio aparte para desplegarse"]],
    e: [
      "Path filters are a start, but a change in a shared library affects every service using it. Build tools (Bazel, Nx, Turborepo, Pants) know the graph and compute affected targets, with remote caching for the rest. Deploying unchanged services adds risk and hides which change caused a problem.",
      "Les filtres de chemins sont un début, mais un changement dans une bibliothèque partagée touche chaque service qui l'utilise. Les outils de build (Bazel, Nx, Turborepo, Pants) connaissent le graphe et calculent les cibles touchées, avec un cache distant pour le reste. Déployer des services inchangés ajoute du risque et cache quel changement a causé un problème.",
      "Los filtros de rutas son un comienzo, pero un cambio en una biblioteca compartida afecta a cada servicio que la usa. Las herramientas de build (Bazel, Nx, Turborepo, Pants) conocen el grafo y calculan los objetivos afectados, con caché remota para el resto. Desplegar servicios sin cambios añade riesgo y oculta qué cambio causó un problema.",
    ],
  },
  {
    id: "dp-pipeline-34",
    q: ["Why sign container images and verify signatures at deploy time?", "Pourquoi signer les images de conteneur et vérifier les signatures au déploiement ?", "¿Por qué firmar las imágenes de contenedor y verificar las firmas al desplegar?"],
    a: ["So that only images built by your pipeline can run, even if someone pushes another image to the registry", "Pour que seules les images construites par ton pipeline puissent tourner, même si quelqu'un pousse une autre image dans le registre", "Para que solo puedan correr las imágenes construidas por tu pipeline, aunque alguien suba otra imagen al registro"],
    w: [["Signed images are smaller", "Les images signées sont plus petites", "Las imágenes firmadas son más pequeñas"], ["Registries refuse unsigned images by law", "Les registres refusent par la loi les images non signées", "Los registros rechazan por ley las imágenes sin firmar"], ["Signing removes vulnerabilities", "La signature supprime les vulnérabilités", "Firmar elimina las vulnerabilidades"]],
    e: [
      "Sigstore's cosign signs images, keyless with the pipeline's OIDC identity. An admission controller (Kyverno, Sigstore policy-controller) or Binary Authorization on Google Cloud then refuses unsigned or wrongly signed images. Registry write access alone no longer lets an attacker run code.",
      "cosign de Sigstore signe les images, sans clé grâce à l'identité OIDC du pipeline. Un contrôleur d'admission (Kyverno, le policy-controller de Sigstore) ou Binary Authorization sur Google Cloud refuse alors les images non signées ou mal signées. L'accès en écriture au registre ne suffit plus à un attaquant pour exécuter du code.",
      "cosign de Sigstore firma las imágenes, sin clave gracias a la identidad OIDC del pipeline. Un controlador de admisión (Kyverno, el policy-controller de Sigstore) o Binary Authorization en Google Cloud rechaza entonces las imágenes sin firmar o mal firmadas. El acceso de escritura al registro ya no basta a un atacante para ejecutar código.",
    ],
  },
];

const containersExpert: DeployQuestion[] = [
  {
    id: "dp-containers-31",
    q: ["A `Dockerfile` copies an npm token, installs private packages, then deletes the token in a later step. Is the token gone from the image?", "Un `Dockerfile` copie un jeton npm, installe des paquets privés, puis supprime le jeton dans une étape suivante. Le jeton a-t-il disparu de l'image ?", "Un `Dockerfile` copia un token de npm, instala paquetes privados y luego borra el token en un paso posterior. ¿Ha desaparecido el token de la imagen?"],
    a: ["No: it remains in the earlier layer; use a BuildKit secret mount (`--mount=type=secret`) instead", "Non : il reste dans la couche précédente ; utilise plutôt un montage de secret BuildKit (`--mount=type=secret`)", "No: sigue en la capa anterior; usa en su lugar un montaje de secreto de BuildKit (`--mount=type=secret`)"],
    w: [["Yes: deleting a file removes it from the image", "Oui : supprimer un fichier le retire de l'image", "Sí: borrar un archivo lo quita de la imagen"], ["Yes, if the image is pushed to a private registry", "Oui, si l'image est poussée dans un registre privé", "Sí, si la imagen se sube a un registro privado"], ["Only if the token was in an environment variable", "Seulement si le jeton était dans une variable d'environnement", "Solo si el token estaba en una variable de entorno"]],
    e: [
      "Layers are stacked; a later deletion only hides the file, and anyone with the image can extract the earlier layer. `RUN --mount=type=secret,id=npm ...` exposes the secret during that one step without writing it to any layer. Build arguments are also recorded in the image history.",
      "Les couches s'empilent ; une suppression ultérieure ne fait que cacher le fichier, et quiconque a l'image peut extraire la couche précédente. `RUN --mount=type=secret,id=npm ...` expose le secret pendant cette seule étape sans l'écrire dans aucune couche. Les arguments de build sont eux aussi enregistrés dans l'historique de l'image.",
      "Las capas se apilan; un borrado posterior solo oculta el archivo, y quien tenga la imagen puede extraer la capa anterior. `RUN --mount=type=secret,id=npm ...` expone el secreto durante ese único paso sin escribirlo en ninguna capa. Los argumentos de build también quedan anotados en el historial de la imagen.",
    ],
  },
  {
    id: "dp-containers-32",
    q: ["In the OCI image format, what does a tag point to?", "Dans le format d'image OCI, vers quoi pointe un tag ?", "En el formato de imagen OCI, ¿a qué apunta un tag?"],
    a: ["A manifest (or an index of manifests per platform), which lists a config and layers by digest", "Un manifeste (ou un index de manifestes par plateforme), qui liste une configuration et des couches par digest", "Un manifiesto (o un índice de manifiestos por plataforma), que lista una configuración y capas por digest"],
    w: [["A single compressed file containing everything", "Un fichier compressé unique contenant tout", "Un único archivo comprimido que lo contiene todo"], ["The `Dockerfile` the image was built from", "Le `Dockerfile` dont l'image vient", "El `Dockerfile` del que se construyó la imagen"], ["A running container", "Un conteneur en cours d'exécution", "Un contenedor en ejecución"]],
    e: [
      "Everything is content-addressed: layers are blobs named by their hash, the manifest names them, and the manifest's own hash is the image digest. Identical layers are shared across images and pulled once. The same structure stores other artifacts in registries, such as signatures, SBOMs and Helm charts.",
      "Tout est adressé par le contenu : les couches sont des blobs nommés par leur hash, le manifeste les nomme, et le hash du manifeste lui-même est le digest de l'image. Les couches identiques sont partagées entre images et tirées une seule fois. La même structure stocke d'autres artefacts dans les registres, comme les signatures, les SBOM et les charts Helm.",
      "Todo se direcciona por contenido: las capas son blobs nombrados por su hash, el manifiesto los nombra y el hash del propio manifiesto es el digest de la imagen. Las capas idénticas se comparten entre imágenes y se descargan una vez. La misma estructura guarda otros artefactos en los registros, como firmas, SBOM y charts de Helm.",
    ],
  },
  {
    id: "dp-containers-33",
    q: ["What do runc and containerd do under Docker or Kubernetes?", "Que font runc et containerd sous Docker ou Kubernetes ?", "¿Qué hacen runc y containerd bajo Docker o Kubernetes?"],
    a: ["containerd manages images and container lifecycles; runc creates each container with the kernel's namespaces and cgroups", "containerd gère les images et le cycle de vie des conteneurs ; runc crée chaque conteneur avec les namespaces et cgroups du noyau", "containerd gestiona las imágenes y el ciclo de vida de los contenedores; runc crea cada contenedor con los namespaces y cgroups del núcleo"],
    w: [["They are Docker's graphical interfaces", "Ce sont les interfaces graphiques de Docker", "Son las interfaces gráficas de Docker"], ["They build images from `Dockerfile`s", "Ils construisent les images à partir des `Dockerfile`", "Construyen las imágenes a partir de los `Dockerfile`"], ["They are container registries", "Ce sont des registres de conteneurs", "Son registros de contenedores"]],
    e: [
      "Kubernetes talks to a runtime through the CRI (containerd or CRI-O); the runtime calls an OCI runtime such as runc, or gVisor and Kata Containers for stronger isolation. Docker itself uses containerd and runc; Kubernetes stopped needing Docker years ago, and Docker-built images run unchanged.",
      "Kubernetes parle à un runtime par la CRI (containerd ou CRI-O) ; le runtime appelle un runtime OCI comme runc, ou gVisor et Kata Containers pour une isolation plus forte. Docker utilise lui-même containerd et runc ; Kubernetes n'a plus besoin de Docker depuis des années, et les images construites par Docker tournent sans changement.",
      "Kubernetes habla con un runtime mediante la CRI (containerd o CRI-O); el runtime llama a un runtime OCI como runc, o gVisor y Kata Containers para un aislamiento más fuerte. Docker usa a su vez containerd y runc; Kubernetes dejó de necesitar Docker hace años, y las imágenes construidas con Docker corren sin cambios.",
    ],
  },
  {
    id: "dp-containers-34",
    q: ["Cloud Run's second generation execution environment differs from the first mainly how?", "En quoi l'environnement d'exécution de deuxième génération de Cloud Run diffère-t-il surtout de la première ?", "¿En qué se diferencia sobre todo el entorno de ejecución de segunda generación de Cloud Run del de primera?"],
    a: ["It runs containers in a microVM with full Linux compatibility, while the first used gVisor's sandboxed kernel with faster cold starts", "Il fait tourner les conteneurs dans une microVM avec une compatibilité Linux complète, alors que la première utilisait le noyau isolé de gVisor, aux démarrages à froid plus rapides", "Ejecuta los contenedores en una microVM con compatibilidad Linux completa, mientras que la primera usaba el núcleo aislado de gVisor, con arranques en frío más rápidos"],
    w: [["It runs on Windows", "Il tourne sous Windows", "Corre en Windows"], ["It has no sandbox at all", "Il n'a aucune isolation", "No tiene ningún aislamiento"], ["It can only run functions, not containers", "Il ne peut faire tourner que des fonctions, pas des conteneurs", "Solo puede ejecutar funciones, no contenedores"]],
    e: [
      "gVisor reimplements Linux system calls in user space, which isolates well but some calls and file systems behave differently. Gen2 gives a full Linux kernel (network file systems, all system calls) and often better CPU and network performance, at the cost of somewhat slower cold starts.",
      "gVisor réimplémente les appels système Linux dans l'espace utilisateur, ce qui isole bien mais fait que certains appels et systèmes de fichiers se comportent autrement. Gen2 donne un noyau Linux complet (systèmes de fichiers réseau, tous les appels système) et souvent de meilleures performances CPU et réseau, au prix de démarrages à froid un peu plus lents.",
      "gVisor reimplementa las llamadas al sistema de Linux en espacio de usuario, lo que aísla bien pero hace que algunas llamadas y sistemas de archivos se comporten distinto. Gen2 da un núcleo Linux completo (sistemas de archivos de red, todas las llamadas al sistema) y a menudo mejor rendimiento de CPU y red, a costa de arranques en frío algo más lentos.",
    ],
  },
];

const strategiesExpert: DeployQuestion[] = [
  {
    id: "dp-strategies-31",
    q: ["What is shadow (mirrored) traffic?", "Qu'est-ce que le trafic miroir (shadow) ?", "¿Qué es el tráfico espejo (shadow)?"],
    a: ["Copies of real requests sent to the new version, whose responses are compared but never returned to users", "Des copies de vraies requêtes envoyées à la nouvelle version, dont les réponses sont comparées mais jamais renvoyées aux utilisateurs", "Copias de peticiones reales enviadas a la versión nueva, cuyas respuestas se comparan pero nunca se devuelven a los usuarios"],
    w: [["Traffic from bots, filtered out", "Le trafic des robots, filtré", "El tráfico de los bots, filtrado"], ["Requests replayed from last month's logs into production", "Des requêtes rejouées en production depuis les journaux du mois dernier", "Peticiones de los registros del mes pasado reproducidas en producción"], ["A second load balancer kept on standby", "Un second répartiteur de charge gardé en réserve", "Un segundo balanceador en reserva"]],
    e: [
      "Mirroring tests the new version with real load and real inputs at zero user risk, as long as it has no side effects: writes, e-mails and payments must be disabled or sent to fakes in the shadow. Service meshes and the Gateway API offer request mirroring.",
      "Le miroir teste la nouvelle version avec une vraie charge et de vraies entrées sans aucun risque pour les utilisateurs, tant qu'elle n'a pas d'effets de bord : les écritures, e-mails et paiements doivent être désactivés ou envoyés vers des simulacres dans le miroir. Les service meshes et la Gateway API proposent le miroir de requêtes.",
      "El espejo prueba la versión nueva con carga real y entradas reales sin ningún riesgo para los usuarios, siempre que no tenga efectos secundarios: las escrituras, correos y pagos deben desactivarse o enviarse a simulaciones en el espejo. Los service meshes y la Gateway API ofrecen la duplicación de peticiones.",
    ],
  },
  {
    id: "dp-strategies-32",
    q: ["What is a cell-based architecture, from a deployment point of view?", "Qu'est-ce qu'une architecture en cellules, du point de vue du déploiement ?", "¿Qué es una arquitectura por celdas, desde el punto de vista del despliegue?"],
    a: ["The system is split into independent copies, each serving a slice of users, and releases go cell by cell so a bad one hurts only one cell", "Le système est découpé en copies indépendantes, chacune servant une partie des utilisateurs, et les versions passent cellule par cellule pour qu'une mauvaise ne touche qu'une cellule", "El sistema se divide en copias independientes, cada una para una parte de los usuarios, y las versiones avanzan celda a celda para que una mala solo afecte a una celda"],
    w: [["A design where each function runs in its own container", "Une conception où chaque fonction tourne dans son propre conteneur", "Un diseño en el que cada función corre en su propio contenedor"], ["A mobile network deployment", "Un déploiement de réseau mobile", "Un despliegue de red móvil"], ["Running all services in one process", "Faire tourner tous les services dans un processus", "Ejecutar todos los servicios en un proceso"]],
    e: [
      "Cells bound the blast radius of both failures and deploys: a release starts in a small cell, bakes, then proceeds in waves. Large providers deploy region by region and zone by zone for the same reason. The cost is routing users to cells and operating many copies.",
      "Les cellules bornent le rayon d'impact des pannes comme des déploiements : une version commence dans une petite cellule, mûrit, puis avance par vagues. Les grands fournisseurs déploient région par région et zone par zone pour la même raison. Le prix est de router les utilisateurs vers les cellules et d'exploiter de nombreuses copies.",
      "Las celdas acotan el radio de impacto tanto de los fallos como de los despliegues: una versión empieza en una celda pequeña, madura y luego avanza por oleadas. Los grandes proveedores despliegan región a región y zona a zona por la misma razón. El precio es enrutar a los usuarios a las celdas y operar muchas copias.",
    ],
  },
  {
    id: "dp-strategies-33",
    q: ["Why wait (a bake time) between stages of a rollout even when metrics look fine?", "Pourquoi attendre (un temps de maturation) entre les étapes d'un déploiement même quand les métriques semblent bonnes ?", "¿Por qué esperar (un tiempo de maduración) entre las etapas de un despliegue aunque las métricas parezcan bien?"],
    a: ["Some problems appear only with time or rare traffic: memory leaks, daily jobs, cache expiry, peak hours", "Certains problèmes n'apparaissent qu'avec le temps ou un trafic rare : fuites de mémoire, tâches quotidiennes, expiration des caches, heures de pointe", "Algunos problemas solo aparecen con el tiempo o con tráfico poco frecuente: fugas de memoria, tareas diarias, caducidad de cachés, horas punta"],
    w: [["To let the build cache cool down", "Pour laisser refroidir le cache de build", "Para dejar que se enfríe la caché del build"], ["Because cloud APIs limit deploys per hour", "Parce que les API cloud limitent les déploiements par heure", "Porque las API de la nube limitan los despliegues por hora"], ["To give testers time to write tests", "Pour donner aux testeurs le temps d'écrire des tests", "Para dar tiempo a los testers a escribir pruebas"]],
    e: [
      "Ten minutes of green metrics prove little about a leak that kills the process after six hours. Bake times scale with risk and stage: short for the first canary, longer before the last wave. Faster rollouts trade this safety away; the trade-off should be explicit.",
      "Dix minutes de métriques vertes prouvent peu de chose sur une fuite qui tue le processus après six heures. Les temps de maturation grandissent avec le risque et l'étape : courts pour le premier canary, plus longs avant la dernière vague. Des déploiements plus rapides abandonnent cette sécurité ; le compromis doit être explicite.",
      "Diez minutos de métricas en verde prueban poco sobre una fuga que mata el proceso a las seis horas. Los tiempos de maduración crecen con el riesgo y la etapa: cortos para el primer canary, más largos antes de la última oleada. Los despliegues más rápidos renuncian a esta seguridad; el compromiso debe ser explícito.",
    ],
  },
  {
    id: "dp-strategies-34",
    q: ["A queue consumer is deployed with a new message format. Why can a rollback still fail afterwards?", "Un consommateur de file est déployé avec un nouveau format de message. Pourquoi un retour arrière peut-il encore échouer ensuite ?", "Se despliega un consumidor de cola con un formato de mensaje nuevo. ¿Por qué una vuelta atrás puede fallar después?"],
    a: ["Messages already produced in the new format remain in the queue, and the old version cannot read them", "Les messages déjà produits au nouveau format restent dans la file, et l'ancienne version ne sait pas les lire", "Los mensajes ya producidos en el formato nuevo siguen en la cola, y la versión antigua no sabe leerlos"],
    w: [["Queues cannot be rolled back at all", "On ne peut pas du tout revenir en arrière sur une file", "Las colas no admiten vuelta atrás en absoluto"], ["The old image is deleted at each deploy", "L'ancienne image est supprimée à chaque déploiement", "La imagen antigua se borra en cada despliegue"], ["Rollbacks always restart the queue from zero", "Les retours arrière redémarrent toujours la file depuis zéro", "Las vueltas atrás siempre reinician la cola desde cero"]],
    e: [
      "State outlives code: messages, cache entries and stored events written by the new version persist. Make readers tolerant first (accept old and new formats), then switch writers, as with database expand/contract; version messages explicitly so consumers can tell them apart.",
      "L'état survit au code : les messages, entrées de cache et événements stockés écrits par la nouvelle version persistent. Rends d'abord les lecteurs tolérants (accepter l'ancien et le nouveau format), puis change les écrivains, comme pour le expand/contract des bases de données ; versionne explicitement les messages pour que les consommateurs les distinguent.",
      "El estado sobrevive al código: los mensajes, entradas de caché y eventos guardados que escribió la versión nueva persisten. Haz primero tolerantes a los lectores (aceptar el formato antiguo y el nuevo) y luego cambia a los escritores, como en el expand/contract de las bases de datos; versiona explícitamente los mensajes para que los consumidores los distingan.",
    ],
  },
];

const operationsExpert: DeployQuestion[] = [
  {
    id: "dp-operations-31",
    q: ["Why alert on error budget burn rate rather than on the raw error rate?", "Pourquoi alerter sur le rythme de consommation (burn rate) du budget d'erreur plutôt que sur le taux d'erreurs brut ?", "¿Por qué alertar por el ritmo de consumo (burn rate) del presupuesto de error en vez de por la tasa de errores bruta?"],
    a: ["It pages fast for a burn that would exhaust the budget in hours, and stays quiet for small blips that do not threaten the objective", "Il alerte vite pour une consommation qui épuiserait le budget en quelques heures, et reste silencieux pour de petits pics qui ne menacent pas l'objectif", "Avisa rápido de un consumo que agotaría el presupuesto en horas y se calla ante picos pequeños que no amenazan el objetivo"],
    w: [["Burn rates are cheaper to store", "Les rythmes de consommation coûtent moins à stocker", "Los ritmos de consumo cuestan menos de guardar"], ["Error rates cannot be measured precisely", "Les taux d'erreurs ne peuvent pas être mesurés précisément", "Las tasas de errores no se pueden medir con precisión"], ["Burn rates ignore errors altogether", "Les rythmes de consommation ignorent complètement les erreurs", "Los ritmos de consumo ignoran del todo los errores"]],
    e: [
      "A burn rate of 1 spends the budget exactly over the period; 14.4 sustained for an hour spends 2 percent of a 30-day budget. Multi-window alerts (a long window to be sure, a short one to stop paging after recovery) catch real threats quickly with few false alarms, as described in Google's SRE workbook.",
      "Un rythme de 1 dépense le budget exactement sur la période ; 14,4 pendant une heure dépense 2 pour cent d'un budget de 30 jours. Des alertes à plusieurs fenêtres (une longue pour être sûr, une courte pour cesser d'alerter après le rétablissement) attrapent vite les vraies menaces avec peu de fausses alarmes, comme le décrit le SRE workbook de Google.",
      "Un ritmo de 1 gasta el presupuesto justo en el periodo; 14,4 durante una hora gasta el 2 por ciento de un presupuesto de 30 días. Las alertas de varias ventanas (una larga para estar seguro y una corta para dejar de avisar tras la recuperación) detectan rápido las amenazas reales con pocas falsas alarmas, como describe el SRE workbook de Google.",
    ],
  },
  {
    id: "dp-operations-32",
    q: ["In SRE terms, what is toil?", "Au sens SRE, qu'est-ce que le labeur (toil) ?", "En términos de SRE, ¿qué es el trabajo repetitivo (toil)?"],
    a: ["Manual, repetitive, automatable work that grows with the service and leaves no lasting improvement", "Un travail manuel, répétitif, automatisable, qui grandit avec le service et ne laisse aucune amélioration durable", "Trabajo manual, repetitivo y automatizable que crece con el servicio y no deja ninguna mejora duradera"],
    w: [["Any work done at night", "Tout travail fait la nuit", "Cualquier trabajo hecho de noche"], ["Writing documentation", "Écrire de la documentation", "Escribir documentación"], ["Meetings about incidents", "Les réunions sur les incidents", "Las reuniones sobre incidentes"]],
    e: [
      "Restarting a stuck job by hand every week, resizing disks, copying certificates: such tasks scale linearly with growth. SRE practice caps toil (often around half of a team's time) and spends the rest on engineering that removes it, such as automation, self-healing and better defaults.",
      "Redémarrer à la main une tâche bloquée chaque semaine, agrandir des disques, copier des certificats : ces tâches grandissent linéairement avec la croissance. La pratique SRE plafonne le labeur (souvent autour de la moitié du temps d'une équipe) et consacre le reste à l'ingénierie qui le supprime, comme l'automatisation, l'auto-réparation et de meilleurs réglages par défaut.",
      "Reiniciar a mano una tarea atascada cada semana, ampliar discos, copiar certificados: esas tareas crecen linealmente con el crecimiento. La práctica SRE pone un tope al trabajo repetitivo (a menudo en torno a la mitad del tiempo de un equipo) y dedica el resto a la ingeniería que lo elimina, como la automatización, la autorreparación y mejores valores por defecto.",
    ],
  },
  {
    id: "dp-operations-33",
    q: ["What does chaos engineering do?", "Que fait le chaos engineering ?", "¿Qué hace la ingeniería del caos?"],
    a: ["Injects controlled failures, such as killed instances or added latency, to check that the system and the team cope as expected", "Il injecte des pannes contrôlées, comme des instances tuées ou de la latence ajoutée, pour vérifier que le système et l'équipe tiennent comme prévu", "Inyecta fallos controlados, como instancias que se matan o latencia añadida, para comprobar que el sistema y el equipo aguantan como se espera"],
    w: [["Deploys without tests to save time", "Il déploie sans tests pour gagner du temps", "Despliega sin pruebas para ahorrar tiempo"], ["Randomly reorders the release schedule", "Il réordonne au hasard le calendrier des versions", "Reordena al azar el calendario de versiones"], ["Removes monitoring to see what happens", "Il retire la supervision pour voir ce qui se passe", "Quita la monitorización para ver qué pasa"]],
    e: [
      "An experiment states a hypothesis (losing one zone does not raise errors), limits the blast radius, runs, and compares. It finds missing retries, wrong timeouts and runbooks that do not work, before a real outage does. Game days apply the same idea to people and procedures.",
      "Une expérience énonce une hypothèse (perdre une zone ne fait pas monter les erreurs), limite le rayon d'impact, tourne, puis compare. Elle trouve les relances manquantes, les délais mal réglés et les runbooks qui ne marchent pas, avant qu'une vraie panne ne le fasse. Les game days appliquent la même idée aux personnes et aux procédures.",
      "Un experimento plantea una hipótesis (perder una zona no sube los errores), limita el radio de impacto, se ejecuta y compara. Encuentra reintentos que faltan, tiempos de espera mal fijados y runbooks que no funcionan, antes de que lo haga una caída real. Los game days aplican la misma idea a las personas y los procedimientos.",
    ],
  },
  {
    id: "dp-operations-34",
    q: ["What is the difference between RPO and RTO?", "Quelle est la différence entre RPO et RTO ?", "¿Qué diferencia hay entre RPO y RTO?"],
    a: ["RPO is how much recent data you can afford to lose; RTO is how long recovery may take", "Le RPO est la quantité de données récentes qu'on peut se permettre de perdre ; le RTO est le temps que peut prendre la reprise", "El RPO es cuántos datos recientes te puedes permitir perder; el RTO, cuánto puede tardar la recuperación"],
    w: [["RPO is for databases, RTO for servers", "Le RPO est pour les bases de données, le RTO pour les serveurs", "El RPO es para bases de datos y el RTO para servidores"], ["They are the same target in two units", "C'est le même objectif en deux unités", "Son el mismo objetivo en dos unidades"], ["RTO is how often backups run", "Le RTO est la fréquence des sauvegardes", "El RTO es la frecuencia de las copias de seguridad"]],
    e: [
      "An RPO of 5 minutes needs continuous replication or frequent backups; an RTO of 1 hour needs restores that are automated and rehearsed. Tighter targets cost more. Both are only real if tested: a backup never restored is a hope, not a plan.",
      "Un RPO de 5 minutes demande une réplication continue ou des sauvegardes fréquentes ; un RTO d'une heure demande des restaurations automatisées et répétées. Des objectifs plus stricts coûtent plus. Les deux ne sont réels que s'ils sont testés : une sauvegarde jamais restaurée est un espoir, pas un plan.",
      "Un RPO de 5 minutos requiere replicación continua o copias frecuentes; un RTO de 1 hora requiere restauraciones automatizadas y ensayadas. Objetivos más estrictos cuestan más. Ambos solo son reales si se prueban: una copia nunca restaurada es una esperanza, no un plan.",
    ],
  },
];

const iacExpert: DeployQuestion[] = [
  {
    id: "dp-iac-31",
    q: ["Why does OpenTofu exist?", "Pourquoi OpenTofu existe-t-il ?", "¿Por qué existe OpenTofu?"],
    a: ["HashiCorp moved Terraform from an open-source licence to the Business Source License in 2023; OpenTofu is the open-source fork under the Linux Foundation", "HashiCorp a fait passer Terraform d'une licence open source à la Business Source License en 2023 ; OpenTofu est le fork open source sous l'égide de la Linux Foundation", "HashiCorp pasó Terraform de una licencia de código abierto a la Business Source License en 2023; OpenTofu es el fork de código abierto bajo la Linux Foundation"],
    w: [["It is Terraform rewritten in Rust for speed", "C'est Terraform réécrit en Rust pour la vitesse", "Es Terraform reescrito en Rust para ir más rápido"], ["It is Google's managed Terraform service", "C'est le service Terraform géré de Google", "Es el servicio de Terraform gestionado de Google"], ["It replaces HCL with YAML", "Il remplace HCL par du YAML", "Sustituye HCL por YAML"]],
    e: [
      "The BSL limits competing commercial use. OpenTofu forked from the last open release and stays largely compatible (same language, providers, state), while adding features such as client-side state encryption. HashiCorp itself is now part of IBM. For most users the choice is about licence and governance.",
      "La BSL limite les usages commerciaux concurrents. OpenTofu est parti de la dernière version ouverte et reste largement compatible (même langage, mêmes fournisseurs, même état), tout en ajoutant des fonctions comme le chiffrement de l'état côté client. HashiCorp fait désormais partie d'IBM. Pour la plupart des utilisateurs, le choix tient à la licence et à la gouvernance.",
      "La BSL limita los usos comerciales competidores. OpenTofu partió de la última versión abierta y sigue siendo en gran parte compatible (mismo lenguaje, proveedores y estado), añadiendo funciones como el cifrado del estado en el cliente. HashiCorp forma ahora parte de IBM. Para la mayoría de usuarios, la elección depende de la licencia y la gobernanza.",
    ],
  },
  {
    id: "dp-iac-32",
    q: ["One Terraform state holds a whole company's infrastructure. What is the main problem?", "Un seul état Terraform contient toute l'infrastructure d'une entreprise. Quel est le problème principal ?", "Un único estado de Terraform contiene toda la infraestructura de una empresa. ¿Cuál es el problema principal?"],
    a: ["Every plan is slow, one lock blocks everyone, and any mistake can reach everything: the blast radius is the whole company", "Chaque plan est lent, un seul verrou bloque tout le monde, et toute erreur peut tout atteindre : le rayon d'impact est toute l'entreprise", "Cada plan es lento, un solo bloqueo frena a todos y cualquier error puede alcanzarlo todo: el radio de impacto es toda la empresa"],
    w: [["Terraform cannot store more than 100 resources", "Terraform ne peut pas stocker plus de 100 ressources", "Terraform no puede guardar más de 100 recursos"], ["The state file becomes encrypted", "Le fichier d'état devient chiffré", "El archivo de estado pasa a estar cifrado"], ["Providers stop working", "Les fournisseurs cessent de fonctionner", "Los proveedores dejan de funcionar"]],
    e: [
      "Split states by lifecycle and ownership: network, shared data, each service, each environment. Smaller states plan faster, can have tighter permissions, and limit what a bad apply can touch. Outputs, data sources or a tool such as Terragrunt connect them.",
      "Découpe les états par cycle de vie et par responsabilité : réseau, données partagées, chaque service, chaque environnement. Des états plus petits planifient plus vite, peuvent avoir des permissions plus strictes, et limitent ce qu'un mauvais apply peut toucher. Les outputs, les sources de données ou un outil comme Terragrunt les relient.",
      "Divide los estados por ciclo de vida y responsabilidad: red, datos compartidos, cada servicio, cada entorno. Los estados más pequeños planifican más rápido, pueden tener permisos más estrictos y limitan lo que puede tocar un apply erróneo. Los outputs, las fuentes de datos o una herramienta como Terragrunt los conectan.",
    ],
  },
  {
    id: "dp-iac-33",
    q: ["What does Terragrunt add on top of Terraform or OpenTofu?", "Qu'ajoute Terragrunt au-dessus de Terraform ou d'OpenTofu ?", "¿Qué añade Terragrunt sobre Terraform u OpenTofu?"],
    a: ["A thin wrapper to keep backend and provider settings DRY across many small configurations, and to run them in dependency order", "Une fine couche pour éviter de répéter les réglages de backend et de fournisseurs sur de nombreuses petites configurations, et pour les lancer dans l'ordre des dépendances", "Una capa fina para no repetir los ajustes de backend y proveedores en muchas configuraciones pequeñas, y para ejecutarlas en orden de dependencias"],
    w: [["A new configuration language replacing HCL", "Un nouveau langage de configuration remplaçant HCL", "Un nuevo lenguaje de configuración que sustituye a HCL"], ["A hosted state backend", "Un backend d'état hébergé", "Un backend de estado alojado"], ["A Kubernetes operator", "Un opérateur Kubernetes", "Un operador de Kubernetes"]],
    e: [
      "Splitting into many states repeats the same backend blocks and wiring. Terragrunt generates them from a parent file, passes outputs between units as dependencies, and can plan or apply a whole tree. It is a convenience layer; plain Terraform with good conventions or a platform such as HCP Terraform can cover the same needs.",
      "Découper en nombreux états répète les mêmes blocs de backend et le même câblage. Terragrunt les génère à partir d'un fichier parent, passe des outputs d'une unité à l'autre comme dépendances, et peut planifier ou appliquer tout un arbre. C'est une couche de commodité ; Terraform seul avec de bonnes conventions ou une plateforme comme HCP Terraform peut couvrir les mêmes besoins.",
      "Dividir en muchos estados repite los mismos bloques de backend y el mismo cableado. Terragrunt los genera a partir de un archivo padre, pasa outputs entre unidades como dependencias y puede planificar o aplicar todo un árbol. Es una capa de comodidad; Terraform solo con buenas convenciones o una plataforma como HCP Terraform puede cubrir las mismas necesidades.",
    ],
  },
  {
    id: "dp-iac-34",
    q: ["A scheduled `terraform plan` in CI shows changes nobody committed. What should happen?", "Un `terraform plan` planifié en CI montre des changements que personne n'a committés. Que doit-il se passer ?", "Un `terraform plan` programado en CI muestra cambios que nadie confirmó. ¿Qué debe pasar?"],
    a: ["Raise it as drift: find who changed what, then either encode the change in code or apply to revert it", "Le signaler comme une dérive : trouver qui a changé quoi, puis soit inscrire le changement dans le code, soit appliquer pour l'annuler", "Notificarlo como deriva: averiguar quién cambió qué y luego o bien escribir el cambio en el código o bien aplicar para deshacerlo"],
    w: [["Apply automatically every night, without looking", "Appliquer automatiquement chaque nuit, sans regarder", "Aplicar automáticamente cada noche, sin mirar"], ["Ignore it: plans are often wrong", "L'ignorer : les plans se trompent souvent", "Ignorarlo: los planes se equivocan a menudo"], ["Delete the state file", "Supprimer le fichier d'état", "Borrar el archivo de estado"]],
    e: [
      "Drift is a signal: an emergency fix, a console change or another tool touching the same resources. Blindly applying could undo a deliberate fix during an incident; ignoring it lets code and reality diverge. The audit logs of the cloud say who made the change.",
      "La dérive est un signal : une correction d'urgence, un changement dans la console ou un autre outil qui touche les mêmes ressources. Appliquer à l'aveugle pourrait annuler une correction délibérée pendant un incident ; l'ignorer laisse code et réalité diverger. Les journaux d'audit du cloud disent qui a fait le changement.",
      "La deriva es una señal: un arreglo de urgencia, un cambio en la consola u otra herramienta que toca los mismos recursos. Aplicar a ciegas podría deshacer un arreglo deliberado durante un incidente; ignorarla deja que código y realidad diverjan. Los registros de auditoría de la nube dicen quién hizo el cambio.",
    ],
  },
];

const terraformExpert: DeployQuestion[] = [
  {
    id: "dp-terraform-31",
    q: ["A plan shows `-/+` next to a database instance. What does it mean?", "Un plan montre `-/+` à côté d'une instance de base de données. Qu'est-ce que cela signifie ?", "Un plan muestra `-/+` junto a una instancia de base de datos. ¿Qué significa?"],
    a: ["It will be destroyed and recreated, because an argument that cannot change in place has changed", "Elle sera détruite puis recréée, parce qu'un argument qui ne peut pas changer sur place a changé", "Se destruirá y se volverá a crear, porque cambió un argumento que no puede cambiarse en el sitio"],
    w: [["It will be updated in place", "Elle sera mise à jour sur place", "Se actualizará en el sitio"], ["It will be imported", "Elle sera importée", "Se importará"], ["Nothing will change; the symbol is informational", "Rien ne changera ; le symbole est informatif", "No cambiará nada; el símbolo es informativo"]],
    e: [
      "`+` create, `-` destroy, `~` update in place, `-/+` replace (destroy then create), `+/-` replace with create first. The plan marks the attribute that forces replacement. For stateful resources, a replacement means data loss unless planned: stop and check before applying.",
      "`+` créer, `-` détruire, `~` mettre à jour sur place, `-/+` remplacer (détruire puis créer), `+/-` remplacer en créant d'abord. Le plan signale l'attribut qui force le remplacement. Pour les ressources avec état, un remplacement signifie une perte de données sauf si c'est prévu : arrête-toi et vérifie avant d'appliquer.",
      "`+` crear, `-` destruir, `~` actualizar en el sitio, `-/+` reemplazar (destruir y luego crear), `+/-` reemplazar creando primero. El plan señala el atributo que fuerza el reemplazo. En recursos con estado, un reemplazo significa perder datos salvo que esté previsto: para y revisa antes de aplicar.",
    ],
  },
  {
    id: "dp-terraform-32",
    q: ["A resource must leave Terraform's management but keep existing. What is the clean way in recent versions?", "Une ressource doit sortir de la gestion de Terraform mais continuer d'exister. Quelle est la manière propre dans les versions récentes ?", "Un recurso debe salir de la gestión de Terraform pero seguir existiendo. ¿Cuál es la forma limpia en las versiones recientes?"],
    a: ["A `removed` block with `lifecycle { destroy = false }`, reviewed in a plan", "Un bloc `removed` avec `lifecycle { destroy = false }`, relu dans un plan", "Un bloque `removed` con `lifecycle { destroy = false }`, revisado en un plan"],
    w: [["Delete the resource block and apply", "Supprimer le bloc de ressource et appliquer", "Borrar el bloque del recurso y aplicar"], ["`prevent_destroy = true`", "`prevent_destroy = true`", "`prevent_destroy = true`"], ["Rename the resource", "Renommer la ressource", "Cambiar el nombre del recurso"]],
    e: [
      "Deleting the block makes Terraform destroy the real object. Since Terraform 1.7, `removed { from = google_storage_bucket.legacy  lifecycle { destroy = false } }` drops it from state through a plan, the declarative successor of `terraform state rm`. Another configuration can then import it.",
      "Supprimer le bloc fait détruire l'objet réel par Terraform. Depuis Terraform 1.7, `removed { from = google_storage_bucket.legacy  lifecycle { destroy = false } }` le retire de l'état par un plan, successeur déclaratif de `terraform state rm`. Une autre configuration peut ensuite l'importer.",
      "Borrar el bloque hace que Terraform destruya el objeto real. Desde Terraform 1.7, `removed { from = google_storage_bucket.legacy  lifecycle { destroy = false } }` lo quita del estado mediante un plan, sucesor declarativo de `terraform state rm`. Otra configuración puede importarlo después.",
    ],
  },
  {
    id: "dp-terraform-33",
    q: ["What does `terraform test` run?", "Que lance `terraform test` ?", "¿Qué ejecuta `terraform test`?"],
    a: ["`.tftest.hcl` files whose `run` blocks plan or apply the module, often in a temporary environment, and check `assert` conditions", "Des fichiers `.tftest.hcl` dont les blocs `run` planifient ou appliquent le module, souvent dans un environnement temporaire, et vérifient des conditions `assert`", "Archivos `.tftest.hcl` cuyos bloques `run` planifican o aplican el módulo, a menudo en un entorno temporal, y comprueban condiciones `assert`"],
    w: [["The application's unit tests", "Les tests unitaires de l'application", "Las pruebas unitarias de la aplicación"], ["A syntax check only", "Seulement une vérification de syntaxe", "Solo una comprobación de sintaxis"], ["A load test of the deployed service", "Un test de charge du service déployé", "Una prueba de carga del servicio desplegado"]],
    e: [
      "Since 1.6, tests can run `command = plan` for fast checks of computed values, or `apply` to create real resources and destroy them afterwards. Mocked providers (1.7) test logic without cloud calls. `terraform validate` checks syntax; `check` blocks verify live conditions after apply.",
      "Depuis la 1.6, les tests peuvent lancer `command = plan` pour vérifier vite des valeurs calculées, ou `apply` pour créer de vraies ressources et les détruire ensuite. Des fournisseurs simulés (1.7) testent la logique sans appels au cloud. `terraform validate` vérifie la syntaxe ; les blocs `check` vérifient des conditions réelles après apply.",
      "Desde la 1.6, las pruebas pueden ejecutar `command = plan` para comprobar rápido valores calculados, o `apply` para crear recursos reales y destruirlos después. Los proveedores simulados (1.7) prueban la lógica sin llamadas a la nube. `terraform validate` comprueba la sintaxis; los bloques `check` verifican condiciones reales tras apply.",
    ],
  },
  {
    id: "dp-terraform-34",
    q: ["What do ephemeral values and write-only arguments, added in Terraform 1.10 and 1.11, change for secrets?", "Que changent pour les secrets les valeurs éphémères et les arguments en écriture seule, ajoutés dans Terraform 1.10 et 1.11 ?", "¿Qué cambian para los secretos los valores efímeros y los argumentos de solo escritura, añadidos en Terraform 1.10 y 1.11?"],
    a: ["A secret can be read or passed to a resource without ever being stored in plan or state files", "Un secret peut être lu ou passé à une ressource sans jamais être stocké dans les fichiers de plan ou d'état", "Un secreto puede leerse o pasarse a un recurso sin guardarse nunca en los archivos de plan o de estado"],
    w: [["Secrets are encrypted in state with a fixed key", "Les secrets sont chiffrés dans l'état avec une clé fixe", "Los secretos se cifran en el estado con una clave fija"], ["Secrets are printed only once in the logs", "Les secrets ne sont affichés qu'une fois dans les journaux", "Los secretos se imprimen solo una vez en los registros"], ["Secrets expire after the apply and must be recreated", "Les secrets expirent après l'apply et doivent être recréés", "Los secretos caducan tras el apply y hay que recrearlos"]],
    e: [
      "An ephemeral resource (for example reading a secret version) exists only during the run; a write-only argument (such as a database password ending in `_wo`) is sent to the provider but never persisted, with a version argument to signal changes. That closes the old gap where `sensitive` hid secrets from output but kept them in state.",
      "Une ressource éphémère (par exemple la lecture d'une version de secret) n'existe que pendant l'exécution ; un argument en écriture seule (comme un mot de passe de base de données finissant par `_wo`) est envoyé au fournisseur mais jamais conservé, avec un argument de version pour signaler les changements. Cela ferme l'ancienne faille où `sensitive` cachait les secrets à l'affichage mais les gardait dans l'état.",
      "Un recurso efímero (por ejemplo, leer una versión de un secreto) solo existe durante la ejecución; un argumento de solo escritura (como una contraseña de base de datos que termina en `_wo`) se envía al proveedor pero nunca se guarda, con un argumento de versión para indicar cambios. Eso cierra el viejo hueco en el que `sensitive` ocultaba los secretos en la salida pero los conservaba en el estado.",
    ],
  },
];

const kubernetesExpert: DeployQuestion[] = [
  {
    id: "dp-kubernetes-31",
    q: ["A Pod is being deleted during a rollout. What should the application do between SIGTERM and the end of the grace period?", "Un Pod est supprimé pendant un déploiement. Que doit faire l'application entre SIGTERM et la fin du délai de grâce ?", "Se está borrando un Pod durante un despliegue. ¿Qué debe hacer la aplicación entre SIGTERM y el fin del periodo de gracia?"],
    a: ["Stop accepting new work, finish in-flight requests, close connections and exit, within `terminationGracePeriodSeconds`", "Cesser d'accepter du travail, terminer les requêtes en cours, fermer les connexions et sortir, dans `terminationGracePeriodSeconds`", "Dejar de aceptar trabajo, terminar las peticiones en curso, cerrar las conexiones y salir, dentro de `terminationGracePeriodSeconds`"],
    w: [["Exit immediately", "Sortir immédiatement", "Salir inmediatamente"], ["Ignore it: Kubernetes waits forever", "L'ignorer : Kubernetes attend indéfiniment", "Ignorarla: Kubernetes espera para siempre"], ["Restart itself", "Se redémarrer", "Reiniciarse"]],
    e: [
      "Removal from Service endpoints and SIGTERM happen concurrently, so a few requests may still arrive just after the signal; a short `preStop` sleep or a delay before closing the listener avoids errors. After the grace period (30 seconds by default) the process gets SIGKILL.",
      "Le retrait des endpoints du Service et l'envoi de SIGTERM ont lieu en même temps, donc quelques requêtes peuvent encore arriver juste après le signal ; une courte pause `preStop` ou un délai avant de fermer l'écoute évite les erreurs. Après le délai de grâce (30 secondes par défaut), le processus reçoit SIGKILL.",
      "La retirada de los endpoints del Service y el SIGTERM ocurren a la vez, así que pueden llegar aún algunas peticiones justo después de la señal; una pausa corta en `preStop` o una espera antes de cerrar la escucha evita errores. Tras el periodo de gracia (30 segundos por defecto), el proceso recibe SIGKILL.",
    ],
  },
  {
    id: "dp-kubernetes-32",
    q: ["What do taints and tolerations do?", "Que font les taints et les tolerations ?", "¿Qué hacen los taints y las tolerations?"],
    a: ["A taint on a node repels Pods; only Pods with a matching toleration may be scheduled there", "Un taint sur un nœud repousse les Pods ; seuls les Pods avec une toleration correspondante peuvent y être placés", "Un taint en un nodo repele a los Pods; solo los Pods con una toleration que coincida pueden colocarse allí"],
    w: [["They attract Pods to the nodes with the most free memory", "Ils attirent les Pods vers les nœuds avec le plus de mémoire libre", "Atraen a los Pods hacia los nodos con más memoria libre"], ["They encrypt traffic between nodes", "Ils chiffrent le trafic entre nœuds", "Cifran el tráfico entre nodos"], ["They limit how many Pods a namespace may run", "Ils limitent le nombre de Pods d'un namespace", "Limitan cuántos Pods puede ejecutar un namespace"]],
    e: [
      "Taints reserve nodes, for example GPU or Spot nodes, for workloads that opt in with a toleration. A toleration only permits; to require a node, combine it with node affinity or a node selector. Affinity and anti-affinity also spread replicas across zones.",
      "Les taints réservent des nœuds, par exemple à GPU ou Spot, aux charges de travail qui s'y engagent par une toleration. Une toleration ne fait que permettre ; pour exiger un nœud, associe-la à une affinité de nœud ou à un sélecteur de nœud. L'affinité et l'anti-affinité répartissent aussi les réplicas entre zones.",
      "Los taints reservan nodos, por ejemplo con GPU o Spot, para las cargas de trabajo que se apuntan con una toleration. Una toleration solo permite; para exigir un nodo, combínala con una afinidad de nodo o un selector de nodo. La afinidad y la antiafinidad también reparten las réplicas entre zonas.",
    ],
  },
  {
    id: "dp-kubernetes-33",
    q: ["What is a Kubernetes operator?", "Qu'est-ce qu'un opérateur Kubernetes ?", "¿Qué es un operador de Kubernetes?"],
    a: ["A controller with custom resources that encodes how to run a specific application, such as a database's backups and failover", "Un contrôleur avec des ressources personnalisées qui code comment faire tourner une application précise, comme les sauvegardes et la bascule d'une base de données", "Un controlador con recursos personalizados que codifica cómo ejecutar una aplicación concreta, como las copias y la conmutación de una base de datos"],
    w: [["A person on call for the cluster", "Une personne d'astreinte pour le cluster", "Una persona de guardia para el clúster"], ["A `kubectl` plugin for formatting YAML", "Un plugin `kubectl` pour formater le YAML", "Un plugin de `kubectl` para formatear YAML"], ["A node that runs only system Pods", "Un nœud qui ne fait tourner que des Pods système", "Un nodo que solo ejecuta Pods del sistema"]],
    e: [
      "A CustomResourceDefinition adds a type such as `PostgresCluster`; the operator's control loop watches it and creates StatefulSets, Services and backup jobs, and handles upgrades and failover, capturing operational knowledge in code. It is the same reconcile pattern as built-in controllers.",
      "Une CustomResourceDefinition ajoute un type comme `PostgresCluster` ; la boucle de contrôle de l'opérateur le surveille et crée StatefulSets, Services et jobs de sauvegarde, et gère mises à jour et bascules, en codant le savoir d'exploitation. C'est le même schéma de réconciliation que les contrôleurs intégrés.",
      "Una CustomResourceDefinition añade un tipo como `PostgresCluster`; el bucle de control del operador lo vigila y crea StatefulSets, Services y jobs de copia, y gestiona actualizaciones y conmutaciones, codificando el saber de operación. Es el mismo patrón de reconciliación que los controladores integrados.",
    ],
  },
  {
    id: "dp-kubernetes-34",
    q: ["A Pod sets requests equal to limits for CPU and memory in every container. Which QoS class does it get, and why does it matter?", "Un Pod règle les demandes égales aux limites pour le CPU et la mémoire dans chaque conteneur. Quelle classe QoS reçoit-il, et pourquoi cela compte-t-il ?", "Un Pod fija las peticiones iguales a los límites de CPU y memoria en cada contenedor. ¿Qué clase QoS recibe y por qué importa?"],
    a: ["Guaranteed: under memory pressure on the node, it is the last to be evicted", "Guaranteed : en cas de manque de mémoire sur le nœud, il est le dernier à être évincé", "Guaranteed: si falta memoria en el nodo, es el último en ser desalojado"],
    w: [["BestEffort: it runs only when nodes are idle", "BestEffort : il ne tourne que quand les nœuds sont inactifs", "BestEffort: solo corre cuando los nodos están inactivos"], ["Burstable: it may use any amount of memory", "Burstable : il peut utiliser n'importe quelle quantité de mémoire", "Burstable: puede usar cualquier cantidad de memoria"], ["None: QoS classes were removed", "Aucune : les classes QoS ont été supprimées", "Ninguna: las clases QoS se eliminaron"]],
    e: [
      "Kubernetes derives the class: Guaranteed (requests equal limits everywhere), Burstable (some requests), BestEffort (none). When a node runs short of memory, the kubelet evicts BestEffort first, then Burstable above their requests. Critical workloads benefit from Guaranteed; batch jobs can be Burstable.",
      "Kubernetes déduit la classe : Guaranteed (demandes égales aux limites partout), Burstable (quelques demandes), BestEffort (aucune). Quand un nœud manque de mémoire, le kubelet évince d'abord les BestEffort, puis les Burstable au-dessus de leurs demandes. Les charges critiques gagnent à être Guaranteed ; les tâches par lots peuvent être Burstable.",
      "Kubernetes deduce la clase: Guaranteed (peticiones iguales a los límites en todas partes), Burstable (algunas peticiones), BestEffort (ninguna). Cuando a un nodo le falta memoria, el kubelet desaloja primero a los BestEffort y luego a los Burstable por encima de sus peticiones. Las cargas críticas ganan siendo Guaranteed; las tareas por lotes pueden ser Burstable.",
    ],
  },
];

const gitopsExpert: DeployQuestion[] = [
  {
    id: "dp-gitops-31",
    q: ["A Cloud Run service has `concurrency` 80 and `max-instances` 1. What happens to the 81st simultaneous request?", "Un service Cloud Run a `concurrency` 80 et `max-instances` 1. Que devient la 81e requête simultanée ?", "Un servicio de Cloud Run tiene `concurrency` 80 y `max-instances` 1. ¿Qué pasa con la petición simultánea número 81?"],
    a: ["It waits briefly for a free slot and, if none frees up, is rejected with a 429", "Elle attend brièvement une place libre et, si aucune ne se libère, est refusée avec une 429", "Espera un momento a que haya un hueco libre y, si no se libera ninguno, se rechaza con un 429"],
    w: [["A second instance starts anyway", "Une seconde instance démarre quand même", "Arranca una segunda instancia de todos modos"], ["It is processed by the same instance with no limit", "Elle est traitée par la même instance sans limite", "La procesa la misma instancia sin límite"], ["The service restarts", "Le service redémarre", "El servicio se reinicia"]],
    e: [
      "Concurrency is the maximum of simultaneous requests per instance; `max-instances` caps scaling. Above capacity, requests queue briefly then fail. Apps that keep state in memory (like in-memory rate limits) sometimes need a single instance, accepting that ceiling; otherwise raise the cap or make state external.",
      "La concurrence est le maximum de requêtes simultanées par instance ; `max-instances` plafonne la mise à l'échelle. Au-delà de la capacité, les requêtes attendent brièvement puis échouent. Les applications qui gardent un état en mémoire (comme des limites de débit en mémoire) ont parfois besoin d'une seule instance, en acceptant ce plafond ; sinon, relève la limite ou externalise l'état.",
      "La concurrencia es el máximo de peticiones simultáneas por instancia; `max-instances` pone un tope al escalado. Por encima de la capacidad, las peticiones esperan un momento y luego fallan. Las aplicaciones que guardan estado en memoria (como límites de uso en memoria) a veces necesitan una sola instancia, aceptando ese techo; si no, sube el tope o saca el estado fuera.",
    ],
  },
  {
    id: "dp-gitops-32",
    q: ["Why set minimum instances on the service rather than on each revision in a pipeline that deploys tagged no-traffic candidates?", "Pourquoi régler le minimum d'instances sur le service plutôt que sur chaque révision, dans un pipeline qui déploie des candidats sans trafic avec un tag ?", "¿Por qué fijar el mínimo de instancias en el servicio en vez de en cada revisión, en un pipeline que despliega candidatas sin tráfico con un tag?"],
    a: ["A revision-level minimum would keep warm, billed instances for every tagged candidate too; the service-level minimum warms only what serves traffic", "Un minimum par révision garderait aussi des instances chaudes, facturées, pour chaque candidat avec tag ; le minimum du service ne réchauffe que ce qui sert le trafic", "Un mínimo por revisión mantendría también instancias calientes, facturadas, para cada candidata con tag; el mínimo del servicio solo calienta lo que sirve tráfico"],
    w: [["Revision-level minimums are not allowed", "Les minimums par révision ne sont pas permis", "Los mínimos por revisión no están permitidos"], ["Service-level minimums are free", "Les minimums du service sont gratuits", "Los mínimos del servicio son gratis"], ["Revisions cannot have instances", "Les révisions ne peuvent pas avoir d'instances", "Las revisiones no pueden tener instancias"]],
    e: [
      "A tagged revision is reachable at its URL, so a revision setting `--min-instances 1` keeps it running even with 0 percent traffic, and each release would add one. The service-level setting (`--min`) applies across the revisions receiving traffic and survives releases.",
      "Une révision avec tag est joignable à son URL, donc un réglage de révision `--min-instances 1` la garde en marche même à 0 pour cent du trafic, et chaque version en ajouterait une. Le réglage du service (`--min`) s'applique aux révisions qui reçoivent du trafic et survit aux versions.",
      "Una revisión con tag es accesible en su URL, así que un ajuste de revisión `--min-instances 1` la mantiene en marcha aun con el 0 por ciento del tráfico, y cada versión añadiría una. El ajuste del servicio (`--min`) se aplica a las revisiones que reciben tráfico y sobrevive a las versiones.",
    ],
  },
  {
    id: "dp-gitops-33",
    q: ["What does Google Cloud Deploy add to deploying Cloud Run or GKE?", "Qu'ajoute Google Cloud Deploy au déploiement sur Cloud Run ou GKE ?", "¿Qué añade Google Cloud Deploy al despliegue en Cloud Run o GKE?"],
    a: ["A managed delivery pipeline: releases promoted through ordered targets, with approvals, canary steps and rollbacks recorded", "Un pipeline de livraison géré : des versions promues à travers des cibles ordonnées, avec approbations, étapes canary et retours arrière enregistrés", "Un pipeline de entrega gestionado: versiones promovidas por destinos ordenados, con aprobaciones, pasos canary y vueltas atrás registradas"],
    w: [["It builds container images from source", "Il construit les images de conteneur depuis le code", "Construye las imágenes de contenedor desde el código"], ["It replaces Cloud Run", "Il remplace Cloud Run", "Sustituye a Cloud Run"], ["It hosts Git repositories", "Il héberge des dépôts Git", "Aloja repositorios Git"]],
    e: [
      "Cloud Build or another CI builds; Cloud Deploy takes the artifact and promotes the same release from dev to staging to production, with approval gates and canary percentages, and keeps the history. It covers the release orchestration that teams otherwise script themselves.",
      "Cloud Build ou une autre CI construit ; Cloud Deploy prend l'artefact et promeut la même version de dev à staging puis à production, avec des approbations et des pourcentages de canary, et en garde l'historique. Il couvre l'orchestration des versions que les équipes écrivent sinon elles-mêmes en scripts.",
      "Cloud Build u otra CI construye; Cloud Deploy toma el artefacto y promueve la misma versión de dev a staging y a producción, con aprobaciones y porcentajes de canary, y guarda el historial. Cubre la orquestación de versiones que, si no, los equipos escriben ellos mismos en scripts.",
    ],
  },
  {
    id: "dp-gitops-34",
    q: ["A whole cluster is lost. What makes a GitOps setup recover quickly?", "Un cluster entier est perdu. Qu'est-ce qui permet à un fonctionnement GitOps de repartir vite ?", "Se pierde un clúster entero. ¿Qué permite que un esquema GitOps se recupere rápido?"],
    a: ["A new cluster is created from infrastructure code, the agent is pointed at the repository, and it recreates everything; only data needs backups", "Un nouveau cluster est créé depuis le code d'infrastructure, l'agent est pointé vers le dépôt, et il recrée tout ; seules les données ont besoin de sauvegardes", "Se crea un clúster nuevo desde el código de infraestructura, se apunta el agente al repositorio y lo recrea todo; solo los datos necesitan copias de seguridad"],
    w: [["The cluster's etcd is stored in Git", "L'etcd du cluster est stocké dans Git", "El etcd del clúster se guarda en Git"], ["Git restores the Pods' memory", "Git restaure la mémoire des Pods", "Git restaura la memoria de los Pods"], ["Nothing: GitOps does not help with recovery", "Rien : le GitOps n'aide pas à la reprise", "Nada: GitOps no ayuda en la recuperación"]],
    e: [
      "Because every object is described in Git, rebuilding is mechanical: Terraform for the cluster, then Argo CD or Flux syncs the rest. Persistent volumes, databases and secrets in external managers must be backed up and restored separately; rehearse the whole procedure to know its real RTO.",
      "Comme chaque objet est décrit dans Git, reconstruire est mécanique : Terraform pour le cluster, puis Argo CD ou Flux synchronise le reste. Les volumes persistants, les bases de données et les secrets des gestionnaires externes doivent être sauvegardés et restaurés à part ; répète toute la procédure pour connaître son vrai RTO.",
      "Como cada objeto está descrito en Git, reconstruir es mecánico: Terraform para el clúster y luego Argo CD o Flux sincroniza el resto. Los volúmenes persistentes, las bases de datos y los secretos de los gestores externos hay que copiarlos y restaurarlos aparte; ensaya todo el procedimiento para conocer su RTO real.",
    ],
  },
];

export const pipeline = { pipelineExpert };
export const containers = { containersExpert };
export const strategies = { strategiesExpert };
export const operations = { operationsExpert };
export const iac = { iacExpert };
export const terraform = { terraformExpert };
export const kubernetes = { kubernetesExpert };
export const gitops = { gitopsExpert };
