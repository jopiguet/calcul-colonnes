/**
 * Deployment systems, Débutant: CI and CD, artifacts and environments,
 * containers and images, the four release strategies, logs, metrics and
 * traces, what infrastructure as code is, Terraform's first commands,
 * Kubernetes's first objects, and what GitOps and managed platforms are.
 * Code between backticks is the same in the three languages.
 */
import type { LinuxQuestion as DeployQuestion } from "../linux/types";

const pipelineBasics: DeployQuestion[] = [
  {
    id: "dp-pipeline-01",
    q: ["What is the difference between continuous delivery and continuous deployment?", "Quelle est la différence entre livraison continue et déploiement continu ?", "¿Qué diferencia hay entre entrega continua y despliegue continuo?"],
    a: ["With delivery every change is ready to release and a person decides when; with deployment every change that passes the pipeline goes to production automatically", "En livraison, chaque changement est prêt à partir et une personne décide quand ; en déploiement, chaque changement qui passe le pipeline part automatiquement en production", "En la entrega, cada cambio está listo para salir y una persona decide cuándo; en el despliegue, cada cambio que pasa el pipeline va automáticamente a producción"],
    w: [["They are two names for the same thing", "Ce sont deux noms pour la même chose", "Son dos nombres para lo mismo"], ["Delivery is for mobile apps, deployment for websites", "La livraison est pour les applications mobiles, le déploiement pour les sites", "La entrega es para apps móviles y el despliegue para webs"], ["Deployment skips the tests to go faster", "Le déploiement saute les tests pour aller plus vite", "El despliegue se salta las pruebas para ir más rápido"]],
    e: [
      "Continuous integration merges and tests small changes often. Continuous delivery keeps the result always releasable, with a manual approval to ship. Continuous deployment removes that last button: the pipeline's tests, checks and progressive rollout are the gate.",
      "L'intégration continue fusionne et teste souvent de petits changements. La livraison continue garde le résultat toujours publiable, avec une approbation manuelle pour livrer. Le déploiement continu supprime ce dernier bouton : les tests, vérifications et le déploiement progressif du pipeline sont le contrôle.",
      "La integración continua fusiona y prueba a menudo cambios pequeños. La entrega continua mantiene el resultado siempre publicable, con una aprobación manual para enviarlo. El despliegue continuo quita ese último botón: las pruebas, comprobaciones y el despliegue progresivo del pipeline son el control.",
    ],
  },
  {
    id: "dp-pipeline-02",
    q: ["What is a build artifact?", "Qu'est-ce qu'un artefact de build ?", "¿Qué es un artefacto de build?"],
    a: ["The deployable output of a build, such as a container image, a package or a binary, stored with a version", "Le résultat déployable d'un build, comme une image de conteneur, un paquet ou un binaire, stocké avec une version", "El resultado desplegable de un build, como una imagen de contenedor, un paquete o un binario, guardado con una versión"],
    w: [["The source code of the application", "Le code source de l'application", "El código fuente de la aplicación"], ["A log file left by a failed build", "Un fichier journal laissé par un build échoué", "Un archivo de registro dejado por un build fallido"], ["The server the application runs on", "Le serveur sur lequel tourne l'application", "El servidor donde corre la aplicación"]],
    e: [
      "The pipeline turns a commit into an artifact once, stores it in a registry (Artifact Registry, npm, Maven…) under a version or digest, and deploys that same artifact to each environment. Knowing which artifact runs where is the basis of rollbacks and audits.",
      "Le pipeline change un commit en artefact une seule fois, le stocke dans un registre (Artifact Registry, npm, Maven…) sous une version ou un digest, et déploie ce même artefact dans chaque environnement. Savoir quel artefact tourne où est la base des retours arrière et des audits.",
      "El pipeline convierte un commit en artefacto una sola vez, lo guarda en un registro (Artifact Registry, npm, Maven…) con una versión o un digest y despliega ese mismo artefacto en cada entorno. Saber qué artefacto corre dónde es la base de las vueltas atrás y las auditorías.",
    ],
  },
  {
    id: "dp-pipeline-03",
    q: ["Why have a staging environment before production?", "Pourquoi avoir un environnement de staging avant la production ?", "¿Por qué tener un entorno de staging antes de producción?"],
    a: ["To run the release in conditions close to production, with its configuration and data shape, before real users meet it", "Pour faire tourner la version dans des conditions proches de la production, avec sa configuration et sa forme de données, avant que de vrais utilisateurs la rencontrent", "Para ejecutar la versión en condiciones parecidas a producción, con su configuración y forma de datos, antes de que la usen usuarios reales"],
    w: [["To keep a backup copy of production", "Pour garder une copie de secours de la production", "Para tener una copia de seguridad de producción"], ["Because production cannot run tests", "Parce que la production ne peut pas lancer de tests", "Porque producción no puede ejecutar pruebas"], ["To host the developers' personal experiments", "Pour héberger les essais personnels des développeurs", "Para alojar los experimentos personales de los desarrolladores"]],
    e: [
      "Unit tests miss what only appears with real infrastructure: migrations, permissions, networking, configuration. Staging catches those if it resembles production (same artifact, same kind of services, similar data). The further it drifts, the less its green light means.",
      "Les tests unitaires ratent ce qui n'apparaît qu'avec une vraie infrastructure : migrations, permissions, réseau, configuration. Le staging les attrape s'il ressemble à la production (même artefact, mêmes sortes de services, données semblables). Plus il s'en éloigne, moins son feu vert veut dire.",
      "Las pruebas unitarias no ven lo que solo aparece con infraestructura real: migraciones, permisos, red, configuración. Staging lo detecta si se parece a producción (mismo artefacto, mismos tipos de servicio, datos parecidos). Cuanto más se aleja, menos significa su luz verde.",
    ],
  },
  {
    id: "dp-pipeline-04",
    q: ["A pipeline runs on every push: build, unit tests, integration tests, deploy. Which order of feedback is best?", "Un pipeline tourne à chaque push : build, tests unitaires, tests d'intégration, déploiement. Quel ordre de retour est le meilleur ?", "Un pipeline corre en cada push: build, pruebas unitarias, pruebas de integración, despliegue. ¿Qué orden de respuesta es el mejor?"],
    a: ["Fast, cheap checks first, so most failures are reported within minutes", "Les vérifications rapides et peu coûteuses d'abord, pour que la plupart des échecs soient signalés en quelques minutes", "Primero las comprobaciones rápidas y baratas, para que la mayoría de los fallos se notifiquen en minutos"],
    w: [["The slowest tests first, since they find the worst bugs", "Les tests les plus lents d'abord, puisqu'ils trouvent les pires bugs", "Primero las pruebas más lentas, porque encuentran los peores errores"], ["Deploy first, then test in production", "Déployer d'abord, puis tester en production", "Desplegar primero y luego probar en producción"], ["The order does not matter", "L'ordre n'a pas d'importance", "El orden no importa"]],
    e: [
      "Linting, compiling and unit tests fail fast and cost little; integration and end-to-end tests are slower and need environments. Ordering by cost and running independent stages in parallel keeps the feedback loop short, which is what makes small, frequent changes practical.",
      "Lint, compilation et tests unitaires échouent vite et coûtent peu ; les tests d'intégration et de bout en bout sont plus lents et demandent des environnements. Ordonner par coût et lancer en parallèle les étapes indépendantes garde la boucle de retour courte, ce qui rend pratiques les petits changements fréquents.",
      "El lint, la compilación y las pruebas unitarias fallan rápido y cuestan poco; las de integración y de extremo a extremo son más lentas y necesitan entornos. Ordenar por coste y ejecutar en paralelo las etapas independientes mantiene corto el ciclo de respuesta, que es lo que hace prácticos los cambios pequeños y frecuentes.",
    ],
  },
];

const containersBasics: DeployQuestion[] = [
  {
    id: "dp-containers-01",
    q: ["What is the main difference between a container and a virtual machine?", "Quelle est la différence principale entre un conteneur et une machine virtuelle ?", "¿Cuál es la diferencia principal entre un contenedor y una máquina virtual?"],
    a: ["Containers share the host's kernel and isolate processes; a virtual machine runs its own kernel on virtual hardware", "Les conteneurs partagent le noyau de l'hôte et isolent des processus ; une machine virtuelle fait tourner son propre noyau sur du matériel virtuel", "Los contenedores comparten el núcleo del anfitrión y aíslan procesos; una máquina virtual ejecuta su propio núcleo sobre hardware virtual"],
    w: [["Containers are always more secure than virtual machines", "Les conteneurs sont toujours plus sûrs que les machines virtuelles", "Los contenedores siempre son más seguros que las máquinas virtuales"], ["Virtual machines start faster than containers", "Les machines virtuelles démarrent plus vite que les conteneurs", "Las máquinas virtuales arrancan más rápido que los contenedores"], ["Containers cannot run Linux programs", "Les conteneurs ne peuvent pas faire tourner de programmes Linux", "Los contenedores no pueden ejecutar programas de Linux"]],
    e: [
      "A container is a group of processes with its own view of the file system, network and process list (namespaces) and resource limits (cgroups). Without a guest kernel it starts in milliseconds and weighs megabytes. The shared kernel is also why isolation is weaker than a virtual machine's.",
      "Un conteneur est un groupe de processus avec sa propre vue du système de fichiers, du réseau et de la liste des processus (namespaces) et des limites de ressources (cgroups). Sans noyau invité, il démarre en millisecondes et pèse des mégaoctets. Le noyau partagé explique aussi que l'isolation soit plus faible que celle d'une machine virtuelle.",
      "Un contenedor es un grupo de procesos con su propia vista del sistema de archivos, la red y la lista de procesos (namespaces) y límites de recursos (cgroups). Sin núcleo invitado, arranca en milisegundos y pesa megas. El núcleo compartido explica también que el aislamiento sea más débil que el de una máquina virtual.",
    ],
  },
  {
    id: "dp-containers-02",
    q: ["What is the difference between an image and a container?", "Quelle est la différence entre une image et un conteneur ?", "¿Qué diferencia hay entre una imagen y un contenedor?"],
    a: ["An image is a read-only template of files and settings; a container is a running instance of it", "Une image est un modèle en lecture seule de fichiers et de réglages ; un conteneur en est une instance en cours d'exécution", "Una imagen es una plantilla de solo lectura de archivos y ajustes; un contenedor es una instancia en ejecución de ella"],
    w: [["An image runs on Windows, a container on Linux", "Une image tourne sous Windows, un conteneur sous Linux", "Una imagen corre en Windows y un contenedor en Linux"], ["A container is a compressed image", "Un conteneur est une image compressée", "Un contenedor es una imagen comprimida"], ["They are the same thing", "C'est la même chose", "Son lo mismo"]],
    e: [
      "Like a class and its objects: one image, many containers. Each container adds a thin writable layer on top of the image, lost when the container is removed, so durable data belongs in volumes or external services.",
      "Comme une classe et ses objets : une image, de nombreux conteneurs. Chaque conteneur ajoute une fine couche modifiable au-dessus de l'image, perdue quand le conteneur est supprimé, donc les données durables vont dans des volumes ou des services externes.",
      "Como una clase y sus objetos: una imagen, muchos contenedores. Cada contenedor añade una capa fina modificable sobre la imagen, que se pierde al eliminar el contenedor, así que los datos duraderos van en volúmenes o servicios externos.",
    ],
  },
  {
    id: "dp-containers-03",
    q: ["What does a `Dockerfile` describe?", "Que décrit un `Dockerfile` ?", "¿Qué describe un `Dockerfile`?"],
    a: ["The steps to build an image: a base image, files to copy, commands to run and the command to start", "Les étapes pour construire une image : une image de base, des fichiers à copier, des commandes à lancer et la commande de démarrage", "Los pasos para construir una imagen: una imagen base, archivos que copiar, órdenes que ejecutar y la orden de arranque"],
    w: [["The servers a container may run on", "Les serveurs sur lesquels un conteneur peut tourner", "Los servidores en los que puede correr un contenedor"], ["The list of users allowed to run the image", "La liste des utilisateurs autorisés à lancer l'image", "La lista de usuarios autorizados a ejecutar la imagen"], ["The network of a group of containers", "Le réseau d'un groupe de conteneurs", "La red de un grupo de contenedores"]],
    e: [
      "`FROM node:22-slim` picks a base, `COPY` and `RUN` add files and install dependencies, `ENV` and `EXPOSE` set metadata, `CMD` or `ENTRYPOINT` say what to run. `docker build` executes it into layers; the same file gives the same kind of image anywhere.",
      "`FROM node:22-slim` choisit une base, `COPY` et `RUN` ajoutent des fichiers et installent les dépendances, `ENV` et `EXPOSE` règlent des métadonnées, `CMD` ou `ENTRYPOINT` disent quoi lancer. `docker build` l'exécute en couches ; le même fichier donne le même genre d'image partout.",
      "`FROM node:22-slim` elige una base, `COPY` y `RUN` añaden archivos e instalan dependencias, `ENV` y `EXPOSE` fijan metadatos, `CMD` o `ENTRYPOINT` dicen qué ejecutar. `docker build` lo ejecuta en capas; el mismo archivo da el mismo tipo de imagen en cualquier sitio.",
    ],
  },
  {
    id: "dp-containers-04",
    q: ["What is a container registry?", "Qu'est-ce qu'un registre de conteneurs ?", "¿Qué es un registro de contenedores?"],
    a: ["A server that stores images by name and tag, from which platforms pull them to run", "Un serveur qui stocke des images par nom et tag, d'où les plateformes les tirent pour les lancer", "Un servidor que guarda imágenes por nombre y tag, del que las plataformas las descargan para ejecutarlas"],
    w: [["A list of running containers", "Une liste des conteneurs en cours d'exécution", "Una lista de los contenedores en ejecución"], ["A database of container logs", "Une base de données de journaux de conteneurs", "Una base de datos de registros de contenedores"], ["The file that lists a container's environment variables", "Le fichier qui liste les variables d'environnement d'un conteneur", "El archivo que lista las variables de entorno de un contenedor"]],
    e: [
      "Docker Hub, GitHub Container Registry and Google's Artifact Registry are registries: `docker push` uploads an image, Cloud Run or Kubernetes pull it. Private registries control who can pull, and can scan images for vulnerabilities.",
      "Docker Hub, GitHub Container Registry et Artifact Registry de Google sont des registres : `docker push` envoie une image, Cloud Run ou Kubernetes la tirent. Les registres privés contrôlent qui peut tirer, et peuvent analyser les images à la recherche de vulnérabilités.",
      "Docker Hub, GitHub Container Registry y Artifact Registry de Google son registros: `docker push` sube una imagen y Cloud Run o Kubernetes la descargan. Los registros privados controlan quién puede descargar y pueden analizar las imágenes en busca de vulnerabilidades.",
    ],
  },
];

const strategiesBasics: DeployQuestion[] = [
  {
    id: "dp-strategies-01",
    q: ["What is a blue-green deployment?", "Qu'est-ce qu'un déploiement blue-green ?", "¿Qué es un despliegue blue-green?"],
    a: ["Two identical environments: the new version starts beside the old, then all traffic switches at once, and switching back is the rollback", "Deux environnements identiques : la nouvelle version démarre à côté de l'ancienne, puis tout le trafic bascule d'un coup, et rebasculer est le retour arrière", "Dos entornos idénticos: la nueva versión arranca junto a la antigua, luego todo el tráfico cambia de golpe, y volver a cambiar es la vuelta atrás"],
    w: [["Releasing to users with blue eyes first", "Livrer d'abord aux utilisateurs aux yeux bleus", "Publicar primero para los usuarios de ojos azules"], ["Stopping the old version, then starting the new one", "Arrêter l'ancienne version, puis démarrer la nouvelle", "Parar la versión antigua y luego arrancar la nueva"], ["Replacing servers one by one", "Remplacer les serveurs un par un", "Sustituir los servidores uno a uno"]],
    e: [
      "Green is tested while blue serves; the router then points to green. Rollback is instant while blue still runs. It costs double capacity during the switch, and databases are shared, so schema changes must work for both versions.",
      "Green est testé pendant que blue sert ; le routeur pointe ensuite vers green. Le retour arrière est instantané tant que blue tourne encore. Cela coûte une capacité double pendant la bascule, et les bases de données sont partagées, donc les changements de schéma doivent marcher pour les deux versions.",
      "Green se prueba mientras blue sirve; después el enrutador apunta a green. La vuelta atrás es instantánea mientras blue siga en marcha. Cuesta el doble de capacidad durante el cambio, y las bases de datos se comparten, así que los cambios de esquema deben funcionar con ambas versiones.",
    ],
  },
  {
    id: "dp-strategies-02",
    q: ["What is a canary release?", "Qu'est-ce qu'une release canary ?", "¿Qué es una release canary?"],
    a: ["Sending a small share of traffic to the new version, watching its errors and latency, then increasing the share step by step", "Envoyer une petite part du trafic à la nouvelle version, surveiller ses erreurs et sa latence, puis augmenter la part par étapes", "Enviar una pequeña parte del tráfico a la nueva versión, vigilar sus errores y su latencia, y luego aumentar la parte por pasos"],
    w: [["Releasing only to the development team", "Livrer seulement à l'équipe de développement", "Publicar solo para el equipo de desarrollo"], ["Releasing at night when nobody uses the service", "Livrer la nuit quand personne n'utilise le service", "Publicar de noche cuando nadie usa el servicio"], ["Testing the new version on a copy of production data", "Tester la nouvelle version sur une copie des données de production", "Probar la nueva versión con una copia de los datos de producción"]],
    e: [
      "Like the canary in a mine, the first few percent of users reveal problems while most are on the old version. Steps such as 5, 25, 50, 100 percent with automatic checks between them limit the blast radius. Cloud Run's traffic splitting between revisions does exactly this.",
      "Comme le canari dans la mine, les premiers pourcents d'utilisateurs révèlent les problèmes pendant que la plupart restent sur l'ancienne version. Des étapes comme 5, 25, 50, 100 pour cent avec des vérifications automatiques entre elles limitent le rayon d'impact. Le partage du trafic entre révisions de Cloud Run fait exactement cela.",
      "Como el canario en la mina, los primeros porcentajes de usuarios revelan los problemas mientras la mayoría sigue en la versión antigua. Pasos como 5, 25, 50, 100 por ciento con comprobaciones automáticas entre ellos limitan el radio de impacto. El reparto de tráfico entre revisiones de Cloud Run hace exactamente esto.",
    ],
  },
  {
    id: "dp-strategies-03",
    q: ["What is a rolling update?", "Qu'est-ce qu'une mise à jour progressive (rolling update) ?", "¿Qué es una actualización progresiva (rolling update)?"],
    a: ["Replacing instances of the old version with the new a few at a time, so the service keeps running throughout", "Remplacer les instances de l'ancienne version par la nouvelle quelques-unes à la fois, pour que le service continue de tourner", "Sustituir las instancias de la versión antigua por la nueva unas pocas cada vez, para que el servicio siga funcionando"],
    w: [["Restarting every instance at the same moment", "Redémarrer toutes les instances au même moment", "Reiniciar todas las instancias en el mismo momento"], ["Keeping two full environments and switching between them", "Garder deux environnements complets et basculer de l'un à l'autre", "Mantener dos entornos completos y cambiar entre ellos"], ["Updating the database before the code", "Mettre à jour la base de données avant le code", "Actualizar la base de datos antes del código"]],
    e: [
      "It is Kubernetes's default for Deployments: new pods start, pass their readiness probe, and old ones stop, within limits such as `maxSurge` and `maxUnavailable`. For a while both versions serve, so they must be compatible. The opposite, Recreate, stops everything first and has downtime.",
      "C'est le défaut de Kubernetes pour les Deployments : de nouveaux pods démarrent, passent leur sonde de disponibilité, et les anciens s'arrêtent, dans des limites comme `maxSurge` et `maxUnavailable`. Un moment, les deux versions servent, donc elles doivent être compatibles. L'inverse, Recreate, arrête tout d'abord et provoque une interruption.",
      "Es el valor por defecto de Kubernetes para los Deployments: arrancan pods nuevos, pasan su sonda de disponibilidad y los antiguos se paran, dentro de límites como `maxSurge` y `maxUnavailable`. Durante un rato sirven las dos versiones, así que deben ser compatibles. Lo contrario, Recreate, lo para todo primero y provoca una interrupción.",
    ],
  },
  {
    id: "dp-strategies-04",
    q: ["A release goes wrong. What makes a rollback quick?", "Une version tourne mal. Qu'est-ce qui rend un retour arrière rapide ?", "Una versión sale mal. ¿Qué hace rápida una vuelta atrás?"],
    a: ["The previous artifact is still stored and deploying it is the same automated step as any deploy", "L'artefact précédent est encore stocké et le déployer est la même étape automatisée que tout déploiement", "El artefacto anterior sigue guardado y desplegarlo es el mismo paso automatizado que cualquier despliegue"],
    w: [["Rebuilding the old version from source during the incident", "Reconstruire l'ancienne version depuis le code pendant l'incident", "Reconstruir la versión antigua desde el código durante el incidente"], ["Restoring the database from last week's backup", "Restaurer la base de données depuis la sauvegarde de la semaine dernière", "Restaurar la base de datos desde la copia de la semana pasada"], ["Editing the code on the production server", "Modifier le code sur le serveur de production", "Editar el código en el servidor de producción"]],
    e: [
      "Immutable, versioned artifacts make rollback a redeploy of a known-good version, or on platforms like Cloud Run a traffic switch to the previous revision. Rebuilding under pressure risks a different result. Data changes are the hard part: plan migrations that the old version tolerates.",
      "Des artefacts immuables et versionnés font du retour arrière le redéploiement d'une version connue comme bonne, ou sur des plateformes comme Cloud Run une bascule du trafic vers la révision précédente. Reconstruire sous pression risque un résultat différent. Les changements de données sont la partie difficile : prévois des migrations que l'ancienne version tolère.",
      "Los artefactos inmutables y versionados convierten la vuelta atrás en volver a desplegar una versión que se sabe buena, o en plataformas como Cloud Run en pasar el tráfico a la revisión anterior. Reconstruir bajo presión arriesga un resultado distinto. Los cambios de datos son lo difícil: planifica migraciones que la versión antigua tolere.",
    ],
  },
];

const operationsBasics: DeployQuestion[] = [
  {
    id: "dp-operations-01",
    q: ["What do logs, metrics and traces each tell you?", "Que disent respectivement les journaux, les métriques et les traces ?", "¿Qué dicen respectivamente los registros, las métricas y las trazas?"],
    a: ["Logs record events, metrics count and measure over time, traces follow one request across services", "Les journaux enregistrent des événements, les métriques comptent et mesurent dans le temps, les traces suivent une requête à travers les services", "Los registros guardan eventos, las métricas cuentan y miden en el tiempo, las trazas siguen una petición a través de los servicios"],
    w: [["They are three formats of the same data", "Ce sont trois formats des mêmes données", "Son tres formatos de los mismos datos"], ["Logs are for developers, metrics for managers, traces for lawyers", "Les journaux sont pour les développeurs, les métriques pour les managers, les traces pour les juristes", "Los registros son para desarrolladores, las métricas para gerentes y las trazas para abogados"], ["Traces count requests, metrics follow one request", "Les traces comptent les requêtes, les métriques suivent une requête", "Las trazas cuentan peticiones y las métricas siguen una petición"]],
    e: [
      "A metric (requests per second, error rate, latency percentiles) shows that something is wrong and is cheap to keep. Logs explain what happened in one place. A trace shows where time went across services. OpenTelemetry standardizes collecting all three.",
      "Une métrique (requêtes par seconde, taux d'erreurs, percentiles de latence) montre que quelque chose ne va pas et coûte peu à garder. Les journaux expliquent ce qui s'est passé à un endroit. Une trace montre où le temps est passé à travers les services. OpenTelemetry normalise la collecte des trois.",
      "Una métrica (peticiones por segundo, tasa de errores, percentiles de latencia) muestra que algo va mal y cuesta poco guardarla. Los registros explican qué pasó en un sitio. Una traza muestra dónde se fue el tiempo entre servicios. OpenTelemetry normaliza la recogida de los tres.",
    ],
  },
  {
    id: "dp-operations-02",
    q: ["What should a good alert be based on?", "Sur quoi une bonne alerte doit-elle reposer ?", "¿En qué debe basarse una buena alerta?"],
    a: ["A symptom users feel, such as errors or slowness, that needs a person to act now", "Un symptôme que ressentent les utilisateurs, comme des erreurs ou de la lenteur, qui demande qu'une personne agisse maintenant", "Un síntoma que notan los usuarios, como errores o lentitud, que requiere que una persona actúe ya"],
    w: [["Every warning line in the logs", "Chaque ligne d'avertissement des journaux", "Cada línea de aviso de los registros"], ["CPU above 50 percent on any machine", "Le CPU au-dessus de 50 pour cent sur n'importe quelle machine", "La CPU por encima del 50 por ciento en cualquier máquina"], ["Each deploy, so that people know", "Chaque déploiement, pour que les gens soient au courant", "Cada despliegue, para que la gente lo sepa"]],
    e: [
      "Alerts that fire without needing action teach people to ignore them. Page on symptoms (error rate, latency, availability against an objective); send causes such as high CPU or a full disk soon to tickets or dashboards. Every page should come with a runbook.",
      "Des alertes qui sonnent sans qu'il faille agir apprennent aux gens à les ignorer. Alerte sur les symptômes (taux d'erreurs, latence, disponibilité face à un objectif) ; envoie les causes comme un CPU élevé ou un disque bientôt plein vers des tickets ou des tableaux de bord. Chaque alerte devrait avoir son runbook.",
      "Las alertas que saltan sin que haga falta actuar enseñan a la gente a ignorarlas. Alerta por síntomas (tasa de errores, latencia, disponibilidad frente a un objetivo); manda las causas, como una CPU alta o un disco casi lleno, a tickets o paneles. Cada alerta debería tener su runbook.",
    ],
  },
  {
    id: "dp-operations-03",
    q: ["What is a health check endpoint such as `/health` for?", "À quoi sert un point de contrôle de santé comme `/health` ?", "¿Para qué sirve un endpoint de salud como `/health`?"],
    a: ["Letting the platform and monitors ask whether the service is up, to route traffic or restart it", "Permettre à la plateforme et à la supervision de demander si le service est en marche, pour router le trafic ou le redémarrer", "Permitir que la plataforma y la monitorización pregunten si el servicio está activo, para enrutar el tráfico o reiniciarlo"],
    w: [["Measuring the users' health", "Mesurer la santé des utilisateurs", "Medir la salud de los usuarios"], ["Running the test suite in production", "Lancer la suite de tests en production", "Ejecutar la batería de pruebas en producción"], ["Showing the source code version to visitors", "Montrer la version du code aux visiteurs", "Mostrar la versión del código a los visitantes"]],
    e: [
      "Load balancers stop sending traffic to instances that fail it, orchestrators restart them, uptime checks page someone. Keep it cheap and honest: a liveness check should not fail because a dependency is down, or every instance restarts at once.",
      "Les répartiteurs de charge cessent d'envoyer du trafic aux instances qui échouent, les orchestrateurs les redémarrent, les contrôles de disponibilité préviennent quelqu'un. Garde-le léger et honnête : un contrôle de vie ne doit pas échouer parce qu'une dépendance est en panne, sinon toutes les instances redémarrent ensemble.",
      "Los balanceadores dejan de enviar tráfico a las instancias que fallan, los orquestadores las reinician, los controles de disponibilidad avisan a alguien. Mantenlo ligero y honesto: un control de vida no debe fallar porque una dependencia esté caída, o todas las instancias se reinician a la vez.",
    ],
  },
  {
    id: "dp-operations-04",
    q: ["Where should an application write its logs when it runs in a container?", "Où une application doit-elle écrire ses journaux quand elle tourne dans un conteneur ?", "¿Dónde debe escribir sus registros una aplicación que corre en un contenedor?"],
    a: ["To standard output and error, which the platform collects", "Sur la sortie standard et la sortie d'erreur, que la plateforme collecte", "En la salida estándar y la de error, que la plataforma recoge"],
    w: [["To a file inside the container", "Dans un fichier à l'intérieur du conteneur", "En un archivo dentro del contenedor"], ["To the database", "Dans la base de données", "En la base de datos"], ["Nowhere: containers cannot log", "Nulle part : les conteneurs ne peuvent pas journaliser", "En ningún sitio: los contenedores no pueden registrar"]],
    e: [
      "A container's file system disappears with it and is not searchable. Platforms such as Cloud Run and Kubernetes capture stdout and stderr and send them to a log service. Structured JSON lines (with a severity field) make them filterable, as Luma does on Cloud Run.",
      "Le système de fichiers d'un conteneur disparaît avec lui et n'est pas interrogeable. Des plateformes comme Cloud Run et Kubernetes captent stdout et stderr et les envoient à un service de journaux. Des lignes JSON structurées (avec un champ de gravité) les rendent filtrables, comme le fait Luma sur Cloud Run.",
      "El sistema de archivos de un contenedor desaparece con él y no se puede consultar. Plataformas como Cloud Run y Kubernetes capturan stdout y stderr y los envían a un servicio de registros. Líneas JSON estructuradas (con un campo de gravedad) las hacen filtrables, como hace Luma en Cloud Run.",
    ],
  },
];

const iacBasics: DeployQuestion[] = [
  {
    id: "dp-iac-01",
    q: ["What is infrastructure as code?", "Qu'est-ce que l'infrastructure as code ?", "¿Qué es la infraestructura como código?"],
    a: ["Describing servers, networks and services in versioned files that a tool applies, instead of clicking in consoles", "Décrire serveurs, réseaux et services dans des fichiers versionnés qu'un outil applique, au lieu de cliquer dans des consoles", "Describir servidores, redes y servicios en archivos versionados que una herramienta aplica, en lugar de hacer clic en consolas"],
    w: [["Writing application code that runs on servers", "Écrire du code applicatif qui tourne sur des serveurs", "Escribir código de aplicación que corre en servidores"], ["Documenting the infrastructure in a wiki", "Documenter l'infrastructure dans un wiki", "Documentar la infraestructura en una wiki"], ["Buying servers through an API", "Acheter des serveurs par une API", "Comprar servidores mediante una API"]],
    e: [
      "Files such as Terraform's `.tf` are reviewed in pull requests, recreate an environment on demand, and show what exists and why. Clicked changes leave no record and drift apart across environments; code makes infrastructure repeatable.",
      "Des fichiers comme les `.tf` de Terraform sont relus en pull request, recréent un environnement à la demande, et montrent ce qui existe et pourquoi. Les changements faits à la souris ne laissent pas de trace et font diverger les environnements ; le code rend l'infrastructure reproductible.",
      "Archivos como los `.tf` de Terraform se revisan en pull requests, recrean un entorno cuando se quiera y muestran qué existe y por qué. Los cambios hechos con clics no dejan rastro y hacen divergir los entornos; el código hace reproducible la infraestructura.",
    ],
  },
  {
    id: "dp-iac-02",
    q: ["What does declarative mean for an infrastructure tool?", "Que signifie déclaratif pour un outil d'infrastructure ?", "¿Qué significa declarativo para una herramienta de infraestructura?"],
    a: ["You describe the end state you want; the tool works out the steps to get there from what exists", "On décrit l'état final voulu ; l'outil calcule les étapes pour y arriver depuis ce qui existe", "Describes el estado final que quieres; la herramienta calcula los pasos para llegar desde lo que existe"],
    w: [["You list the commands to run in order", "On liste les commandes à lancer dans l'ordre", "Enumeras las órdenes que ejecutar en orden"], ["The tool only reads, never changes", "L'outil ne fait que lire, sans jamais modifier", "La herramienta solo lee, nunca cambia"], ["Each resource must be declared in a separate file", "Chaque ressource doit être déclarée dans un fichier séparé", "Cada recurso debe declararse en un archivo aparte"]],
    e: [
      "Declarative: three instances of this size behind this load balancer. Imperative: create instance, create another… A declarative tool compares desired and actual state and computes the difference, so running it again changes nothing if nothing changed. Terraform, Kubernetes manifests and CloudFormation are declarative.",
      "Déclaratif : trois instances de cette taille derrière ce répartiteur de charge. Impératif : créer une instance, en créer une autre… Un outil déclaratif compare l'état voulu et l'état réel et calcule la différence, donc le relancer ne change rien si rien n'a changé. Terraform, les manifestes Kubernetes et CloudFormation sont déclaratifs.",
      "Declarativo: tres instancias de este tamaño tras este balanceador. Imperativo: crear una instancia, crear otra… Una herramienta declarativa compara el estado deseado y el real y calcula la diferencia, así que volver a ejecutarla no cambia nada si nada cambió. Terraform, los manifiestos de Kubernetes y CloudFormation son declarativos.",
    ],
  },
  {
    id: "dp-iac-03",
    q: ["What does idempotent mean for a deployment step?", "Que signifie idempotent pour une étape de déploiement ?", "¿Qué significa idempotente para un paso de despliegue?"],
    a: ["Running it twice has the same effect as running it once", "La lancer deux fois a le même effet que la lancer une fois", "Ejecutarlo dos veces tiene el mismo efecto que ejecutarlo una"],
    w: [["It can only run once", "Elle ne peut tourner qu'une fois", "Solo puede ejecutarse una vez"], ["It runs without any permission", "Elle tourne sans aucune permission", "Se ejecuta sin ningún permiso"], ["It always deletes what existed before", "Elle supprime toujours ce qui existait avant", "Siempre borra lo que existía antes"]],
    e: [
      "`mkdir -p dir` is idempotent, `echo line >> file` is not. Idempotent steps can be retried after a failure halfway without creating duplicates, which pipelines need. Declarative tools are idempotent by design; scripts must be written carefully to be.",
      "`mkdir -p dir` est idempotent, `echo line >> file` ne l'est pas. Les étapes idempotentes peuvent être relancées après un échec à mi-chemin sans créer de doublons, ce dont les pipelines ont besoin. Les outils déclaratifs sont idempotents par nature ; les scripts doivent être écrits avec soin pour l'être.",
      "`mkdir -p dir` es idempotente, `echo line >> file` no. Los pasos idempotentes se pueden reintentar tras un fallo a medias sin crear duplicados, lo que necesitan los pipelines. Las herramientas declarativas son idempotentes por diseño; los scripts hay que escribirlos con cuidado para que lo sean.",
    ],
  },
  {
    id: "dp-iac-04",
    q: ["Which tool is mainly for provisioning cloud infrastructure, as opposed to configuring software on existing machines?", "Quel outil sert surtout à provisionner l'infrastructure cloud, par opposition à configurer des logiciels sur des machines existantes ?", "¿Qué herramienta sirve sobre todo para aprovisionar infraestructura en la nube, frente a configurar software en máquinas existentes?"],
    a: ["Terraform", "Terraform", "Terraform"],
    w: [["Ansible", "Ansible", "Ansible"], ["Bash", "Bash", "Bash"], ["Git", "Git", "Git"]],
    e: [
      "Terraform (and OpenTofu, Pulumi, CloudFormation) creates networks, databases, clusters and permissions through cloud APIs. Ansible, Chef and Puppet configure what runs inside machines: packages, files, services. With containers and managed services, provisioning matters more and machine configuration less.",
      "Terraform (et OpenTofu, Pulumi, CloudFormation) crée réseaux, bases de données, clusters et permissions par les API des clouds. Ansible, Chef et Puppet configurent ce qui tourne dans les machines : paquets, fichiers, services. Avec les conteneurs et les services gérés, le provisionnement compte davantage et la configuration des machines moins.",
      "Terraform (y OpenTofu, Pulumi, CloudFormation) crea redes, bases de datos, clústeres y permisos mediante las API de la nube. Ansible, Chef y Puppet configuran lo que corre dentro de las máquinas: paquetes, archivos, servicios. Con contenedores y servicios gestionados, aprovisionar importa más y configurar máquinas, menos.",
    ],
  },
];

const terraformBasics: DeployQuestion[] = [
  {
    id: "dp-terraform-01",
    q: ["What does `terraform plan` do?", "Que fait `terraform plan` ?", "¿Qué hace `terraform plan`?"],
    a: ["It shows what Terraform would create, change or destroy to match the configuration, without doing it", "Il montre ce que Terraform créerait, modifierait ou détruirait pour correspondre à la configuration, sans le faire", "Muestra lo que Terraform crearía, cambiaría o destruiría para coincidir con la configuración, sin hacerlo"],
    w: [["It applies the changes", "Il applique les changements", "Aplica los cambios"], ["It downloads the providers", "Il télécharge les fournisseurs", "Descarga los proveedores"], ["It draws a diagram of the infrastructure", "Il dessine un schéma de l'infrastructure", "Dibuja un diagrama de la infraestructura"]],
    e: [
      "The workflow is `terraform init` (download providers, set up the backend), `plan` (compare configuration, state and reality), `apply` (perform the plan after confirmation). Reading the plan, especially destroys and replacements, is the main safety step; in CI the plan is often posted on the pull request.",
      "Le déroulé est `terraform init` (télécharger les fournisseurs, préparer le backend), `plan` (comparer configuration, état et réalité), `apply` (exécuter le plan après confirmation). Lire le plan, surtout les destructions et remplacements, est la principale étape de sécurité ; en CI, le plan est souvent publié sur la pull request.",
      "El flujo es `terraform init` (descargar proveedores, preparar el backend), `plan` (comparar configuración, estado y realidad), `apply` (ejecutar el plan tras confirmar). Leer el plan, sobre todo destrucciones y reemplazos, es el principal paso de seguridad; en CI el plan suele publicarse en la pull request.",
    ],
  },
  {
    id: "dp-terraform-02",
    q: ["What is Terraform's state?", "Qu'est-ce que l'état (state) de Terraform ?", "¿Qué es el estado (state) de Terraform?"],
    a: ["A file mapping each resource in the configuration to the real object it manages, with its last known attributes", "Un fichier qui associe chaque ressource de la configuration à l'objet réel qu'elle gère, avec ses derniers attributs connus", "Un archivo que asocia cada recurso de la configuración al objeto real que gestiona, con sus últimos atributos conocidos"],
    w: [["The list of providers used", "La liste des fournisseurs utilisés", "La lista de proveedores usados"], ["A backup of the cloud's data", "Une sauvegarde des données du cloud", "Una copia de seguridad de los datos de la nube"], ["The log of past commands", "Le journal des commandes passées", "El registro de las órdenes pasadas"]],
    e: [
      "Without state, Terraform could not tell which bucket is `google_storage_bucket.assets`. State can hold secrets in plain text, so it belongs in a protected remote backend (a GCS bucket, HCP Terraform), never in Git. Losing it means Terraform no longer knows what it manages.",
      "Sans état, Terraform ne saurait pas quel bucket est `google_storage_bucket.assets`. L'état peut contenir des secrets en clair, donc il va dans un backend distant protégé (un bucket GCS, HCP Terraform), jamais dans Git. Le perdre signifie que Terraform ne sait plus ce qu'il gère.",
      "Sin estado, Terraform no sabría qué bucket es `google_storage_bucket.assets`. El estado puede contener secretos en claro, así que va en un backend remoto protegido (un bucket de GCS, HCP Terraform), nunca en Git. Perderlo significa que Terraform ya no sabe qué gestiona.",
    ],
  },
  {
    id: "dp-terraform-03",
    q: ["In Terraform, what is a provider?", "Dans Terraform, qu'est-ce qu'un fournisseur (provider) ?", "En Terraform, ¿qué es un proveedor (provider)?"],
    a: ["A plugin that talks to one API, such as Google Cloud, GitHub or Cloudflare, and defines its resource types", "Un plugin qui parle à une API, comme Google Cloud, GitHub ou Cloudflare, et définit ses types de ressources", "Un plugin que habla con una API, como Google Cloud, GitHub o Cloudflare, y define sus tipos de recurso"],
    w: [["The company hosting the state file", "L'entreprise qui héberge le fichier d'état", "La empresa que aloja el archivo de estado"], ["A variable holding the region", "Une variable qui contient la région", "Una variable que contiene la región"], ["A person allowed to run `apply`", "Une personne autorisée à lancer `apply`", "Una persona autorizada a ejecutar `apply`"]],
    e: [
      "`required_providers` pins sources and versions (`hashicorp/google`), `terraform init` downloads them and records exact versions in `.terraform.lock.hcl`, which you commit. Each provider brings resources (`google_cloud_run_v2_service`) and data sources.",
      "`required_providers` fixe sources et versions (`hashicorp/google`), `terraform init` les télécharge et enregistre les versions exactes dans `.terraform.lock.hcl`, que l'on committe. Chaque fournisseur apporte des ressources (`google_cloud_run_v2_service`) et des sources de données.",
      "`required_providers` fija fuentes y versiones (`hashicorp/google`), `terraform init` los descarga y anota las versiones exactas en `.terraform.lock.hcl`, que se confirma. Cada proveedor aporta recursos (`google_cloud_run_v2_service`) y fuentes de datos.",
    ],
  },
  {
    id: "dp-terraform-04",
    q: ["What are `variable` and `output` blocks for?", "À quoi servent les blocs `variable` et `output` ?", "¿Para qué sirven los bloques `variable` y `output`?"],
    a: ["Variables are inputs to a configuration; outputs expose values after apply, such as a service's URL", "Les variables sont les entrées d'une configuration ; les outputs exposent des valeurs après apply, comme l'URL d'un service", "Las variables son las entradas de una configuración; los outputs exponen valores tras apply, como la URL de un servicio"],
    w: [["Variables store secrets, outputs store logs", "Les variables stockent les secrets, les outputs les journaux", "Las variables guardan secretos y los outputs registros"], ["They declare which providers to use", "Ils déclarent quels fournisseurs utiliser", "Declaran qué proveedores usar"], ["Outputs are the resources Terraform creates", "Les outputs sont les ressources que Terraform crée", "Los outputs son los recursos que crea Terraform"]],
    e: [
      "`variable \"region\" {}` is set by a `.tfvars` file, `-var` or an environment variable `TF_VAR_region`; one configuration then serves several environments. `output \"url\" { value = ... }` prints after apply and lets other configurations or scripts read results.",
      "`variable \"region\" {}` se règle par un fichier `.tfvars`, `-var` ou une variable d'environnement `TF_VAR_region` ; une configuration sert alors plusieurs environnements. `output \"url\" { value = ... }` s'affiche après apply et permet à d'autres configurations ou scripts de lire les résultats.",
      "`variable \"region\" {}` se fija con un archivo `.tfvars`, `-var` o una variable de entorno `TF_VAR_region`; una misma configuración sirve así a varios entornos. `output \"url\" { value = ... }` se muestra tras apply y permite que otras configuraciones o scripts lean los resultados.",
    ],
  },
];

const kubernetesBasics: DeployQuestion[] = [
  {
    id: "dp-kubernetes-01",
    q: ["What is a Pod in Kubernetes?", "Qu'est-ce qu'un Pod dans Kubernetes ?", "¿Qué es un Pod en Kubernetes?"],
    a: ["The smallest unit Kubernetes runs: one or more containers sharing a network address and volumes", "La plus petite unité que Kubernetes fait tourner : un ou plusieurs conteneurs qui partagent une adresse réseau et des volumes", "La unidad más pequeña que ejecuta Kubernetes: uno o varios contenedores que comparten una dirección de red y volúmenes"],
    w: [["A physical server of the cluster", "Un serveur physique du cluster", "Un servidor físico del clúster"], ["A group of clusters", "Un groupe de clusters", "Un grupo de clústeres"], ["A container image", "Une image de conteneur", "Una imagen de contenedor"]],
    e: [
      "Pods are disposable: when one dies, a controller makes a new one with a new address. That is why you rarely create Pods directly; a Deployment keeps the right number running and a Service gives them a stable address.",
      "Les Pods sont jetables : quand l'un meurt, un contrôleur en crée un nouveau avec une nouvelle adresse. C'est pourquoi on crée rarement des Pods directement ; un Deployment en garde le bon nombre en marche et un Service leur donne une adresse stable.",
      "Los Pods son desechables: cuando uno muere, un controlador crea otro con una dirección nueva. Por eso rara vez se crean Pods directamente; un Deployment mantiene en marcha el número correcto y un Service les da una dirección estable.",
    ],
  },
  {
    id: "dp-kubernetes-02",
    q: ["What does a Deployment do?", "Que fait un Deployment ?", "¿Qué hace un Deployment?"],
    a: ["It keeps a chosen number of identical Pods running and replaces them gradually when the template changes", "Il garde en marche un nombre choisi de Pods identiques et les remplace progressivement quand le modèle change", "Mantiene en marcha un número elegido de Pods idénticos y los sustituye poco a poco cuando cambia la plantilla"],
    w: [["It copies an image to the registry", "Il copie une image dans le registre", "Copia una imagen al registro"], ["It exposes Pods on the internet", "Il expose les Pods sur internet", "Expone los Pods en internet"], ["It stores the cluster's configuration", "Il stocke la configuration du cluster", "Guarda la configuración del clúster"]],
    e: [
      "`replicas: 3` with a Pod template: if a Pod or node dies, a new Pod is created. Changing the image triggers a rolling update through ReplicaSets, and `kubectl rollout undo` goes back. Exposing Pods is a Service's job.",
      "`replicas: 3` avec un modèle de Pod : si un Pod ou un nœud meurt, un nouveau Pod est créé. Changer l'image déclenche une mise à jour progressive par des ReplicaSets, et `kubectl rollout undo` revient en arrière. Exposer les Pods est le travail d'un Service.",
      "`replicas: 3` con una plantilla de Pod: si muere un Pod o un nodo, se crea un Pod nuevo. Cambiar la imagen desencadena una actualización progresiva mediante ReplicaSets, y `kubectl rollout undo` vuelve atrás. Exponer los Pods es tarea de un Service.",
    ],
  },
  {
    id: "dp-kubernetes-03",
    q: ["Why does a Deployment need a Service in front of it?", "Pourquoi un Deployment a-t-il besoin d'un Service devant lui ?", "¿Por qué un Deployment necesita un Service delante?"],
    a: ["Pods come and go with changing addresses; a Service gives one stable name and address and balances across the matching Pods", "Les Pods vont et viennent avec des adresses changeantes ; un Service donne un nom et une adresse stables et répartit entre les Pods qui correspondent", "Los Pods van y vienen con direcciones cambiantes; un Service da un nombre y una dirección estables y reparte entre los Pods que coinciden"],
    w: [["A Service stores the Pods' data", "Un Service stocke les données des Pods", "Un Service guarda los datos de los Pods"], ["A Service builds the image", "Un Service construit l'image", "Un Service construye la imagen"], ["Without a Service, Pods cannot start", "Sans Service, les Pods ne peuvent pas démarrer", "Sin Service, los Pods no pueden arrancar"]],
    e: [
      "A Service selects Pods by labels (`app: web`) and is reachable inside the cluster at a DNS name such as `web.default.svc`. Type `ClusterIP` is internal, `LoadBalancer` gets an external address; HTTP routing by host and path is done by an Ingress or the Gateway API.",
      "Un Service sélectionne les Pods par labels (`app: web`) et se joint dans le cluster par un nom DNS comme `web.default.svc`. Le type `ClusterIP` est interne, `LoadBalancer` reçoit une adresse externe ; le routage HTTP par hôte et chemin se fait par un Ingress ou la Gateway API.",
      "Un Service selecciona los Pods por etiquetas (`app: web`) y se alcanza dentro del clúster con un nombre DNS como `web.default.svc`. El tipo `ClusterIP` es interno y `LoadBalancer` recibe una dirección externa; el enrutamiento HTTP por host y ruta lo hace un Ingress o la Gateway API.",
    ],
  },
  {
    id: "dp-kubernetes-04",
    q: ["What does `kubectl apply -f deployment.yaml` do?", "Que fait `kubectl apply -f deployment.yaml` ?", "¿Qué hace `kubectl apply -f deployment.yaml`?"],
    a: ["It sends the desired state in the file to the cluster, creating or updating the objects to match", "Il envoie au cluster l'état voulu décrit dans le fichier, en créant ou mettant à jour les objets pour y correspondre", "Envía al clúster el estado deseado del archivo, creando o actualizando los objetos para que coincidan"],
    w: [["It runs the file as a shell script on every node", "Il exécute le fichier comme un script shell sur chaque nœud", "Ejecuta el archivo como un script de shell en cada nodo"], ["It deletes everything not in the file", "Il supprime tout ce qui n'est pas dans le fichier", "Borra todo lo que no está en el archivo"], ["It checks the file's syntax only", "Il vérifie seulement la syntaxe du fichier", "Solo comprueba la sintaxis del archivo"]],
    e: [
      "Kubernetes is declarative: the API stores the desired state and controllers work continuously to make reality match. `apply` can be run again safely; `kubectl diff` previews the change. Keeping these manifests in Git and applying them automatically is the basis of GitOps.",
      "Kubernetes est déclaratif : l'API stocke l'état voulu et des contrôleurs travaillent sans cesse pour que la réalité y corresponde. `apply` peut être relancé sans risque ; `kubectl diff` prévisualise le changement. Garder ces manifestes dans Git et les appliquer automatiquement est la base du GitOps.",
      "Kubernetes es declarativo: la API guarda el estado deseado y unos controladores trabajan sin parar para que la realidad coincida. `apply` se puede volver a ejecutar sin riesgo; `kubectl diff` muestra antes el cambio. Guardar estos manifiestos en Git y aplicarlos automáticamente es la base de GitOps.",
    ],
  },
];

const gitopsBasics: DeployQuestion[] = [
  {
    id: "dp-gitops-01",
    q: ["What is GitOps?", "Qu'est-ce que le GitOps ?", "¿Qué es GitOps?"],
    a: ["Keeping the desired state of systems in Git and letting an agent continuously make the running systems match it", "Garder l'état voulu des systèmes dans Git et laisser un agent faire sans cesse correspondre les systèmes en marche", "Guardar el estado deseado de los sistemas en Git y dejar que un agente haga coincidir continuamente los sistemas en marcha"],
    w: [["Running Git on production servers to edit code there", "Faire tourner Git sur les serveurs de production pour y modifier le code", "Ejecutar Git en los servidores de producción para editar allí el código"], ["Using GitHub instead of a CI server", "Utiliser GitHub au lieu d'un serveur de CI", "Usar GitHub en lugar de un servidor de CI"], ["Storing logs in a Git repository", "Stocker les journaux dans un dépôt Git", "Guardar los registros en un repositorio Git"]],
    e: [
      "Changes to production become pull requests: reviewed, recorded and revertible. Tools such as Argo CD and Flux run in the cluster, watch the repository and apply differences, also undoing manual changes (drift). Git becomes the audit log of what runs.",
      "Les changements de la production deviennent des pull requests : relues, enregistrées et annulables. Des outils comme Argo CD et Flux tournent dans le cluster, surveillent le dépôt et appliquent les différences, en annulant aussi les changements manuels (la dérive). Git devient le journal d'audit de ce qui tourne.",
      "Los cambios de producción se convierten en pull requests: revisadas, registradas y reversibles. Herramientas como Argo CD y Flux corren en el clúster, vigilan el repositorio y aplican las diferencias, deshaciendo también los cambios manuales (la deriva). Git pasa a ser el registro de auditoría de lo que corre.",
    ],
  },
  {
    id: "dp-gitops-02",
    q: ["What does a managed platform such as Cloud Run take off your hands?", "Que te retire une plateforme gérée comme Cloud Run ?", "¿Qué te quita de encima una plataforma gestionada como Cloud Run?"],
    a: ["Servers, operating system updates, scaling and load balancing: you give it a container image and settings", "Les serveurs, les mises à jour du système, la mise à l'échelle et la répartition de charge : on lui donne une image de conteneur et des réglages", "Los servidores, las actualizaciones del sistema, el escalado y el balanceo de carga: le das una imagen de contenedor y unos ajustes"],
    w: [["Writing the application", "L'écriture de l'application", "Escribir la aplicación"], ["Deciding who may access the data", "Décider qui peut accéder aux données", "Decidir quién puede acceder a los datos"], ["Testing the code", "Le test du code", "Probar el código"]],
    e: [
      "Cloud Run, App Runner, Azure Container Apps or Fly.io run containers and scale them, even to zero; Lambda and Cloud Run functions run functions. You trade control (no node access, request limits) for far less operational work. Security of your code and data stays yours.",
      "Cloud Run, App Runner, Azure Container Apps ou Fly.io font tourner des conteneurs et les mettent à l'échelle, même jusqu'à zéro ; Lambda et Cloud Run functions font tourner des fonctions. On échange du contrôle (pas d'accès aux nœuds, limites des requêtes) contre beaucoup moins de travail d'exploitation. La sécurité de ton code et de tes données reste à toi.",
      "Cloud Run, App Runner, Azure Container Apps o Fly.io ejecutan contenedores y los escalan, incluso a cero; Lambda y Cloud Run functions ejecutan funciones. Cambias control (sin acceso a los nodos, límites de las peticiones) por mucho menos trabajo de operación. La seguridad de tu código y tus datos sigue siendo cosa tuya.",
    ],
  },
  {
    id: "dp-gitops-03",
    q: ["On Cloud Run, what is a revision?", "Sur Cloud Run, qu'est-ce qu'une révision ?", "En Cloud Run, ¿qué es una revisión?"],
    a: ["An immutable snapshot of a service's image and settings, created at each deploy, which can receive a share of traffic", "Un instantané immuable de l'image et des réglages d'un service, créé à chaque déploiement, qui peut recevoir une part du trafic", "Una instantánea inmutable de la imagen y los ajustes de un servicio, creada en cada despliegue, que puede recibir una parte del tráfico"],
    w: [["A Git commit of the service's code", "Un commit Git du code du service", "Un commit de Git del código del servicio"], ["A backup of the service's database", "Une sauvegarde de la base de données du service", "Una copia de la base de datos del servicio"], ["A running instance of the container", "Une instance du conteneur en cours d'exécution", "Una instancia en ejecución del contenedor"]],
    e: [
      "Each deploy or configuration change creates a new revision; traffic can go 100 percent to the latest, be split for a canary, or be sent back to an earlier revision for a rollback. A revision deployed `--no-traffic` with a tag gets its own URL for testing first.",
      "Chaque déploiement ou changement de configuration crée une nouvelle révision ; le trafic peut aller à 100 pour cent vers la dernière, être partagé pour un canary, ou renvoyé vers une révision antérieure pour un retour arrière. Une révision déployée `--no-traffic` avec un tag reçoit sa propre URL pour être testée d'abord.",
      "Cada despliegue o cambio de configuración crea una revisión nueva; el tráfico puede ir al 100 por ciento a la última, repartirse para un canary o devolverse a una revisión anterior para volver atrás. Una revisión desplegada `--no-traffic` con un tag recibe su propia URL para probarla antes.",
    ],
  },
  {
    id: "dp-gitops-04",
    q: ["In a GitOps setup, someone changes a setting by hand in the cluster. What happens?", "Dans un fonctionnement GitOps, quelqu'un change un réglage à la main dans le cluster. Que se passe-t-il ?", "En un esquema GitOps, alguien cambia un ajuste a mano en el clúster. ¿Qué pasa?"],
    a: ["The agent sees the drift from Git and, with self-heal on, puts back what Git says", "L'agent voit la dérive par rapport à Git et, avec l'auto-réparation activée, remet ce que dit Git", "El agente ve la deriva respecto a Git y, con la autorreparación activada, vuelve a poner lo que dice Git"],
    w: [["The change is committed to Git automatically", "Le changement est committé automatiquement dans Git", "El cambio se confirma automáticamente en Git"], ["The cluster refuses all manual commands", "Le cluster refuse toutes les commandes manuelles", "El clúster rechaza todas las órdenes manuales"], ["Nothing: GitOps only acts at deploy time", "Rien : le GitOps n'agit qu'au déploiement", "Nada: GitOps solo actúa al desplegar"]],
    e: [
      "Continuous reconciliation compares cluster and repository; differences show as OutOfSync, and self-heal reverts them. The right way to change production is therefore a commit. In an emergency, people pause syncing, fix by hand, then commit the fix.",
      "La réconciliation continue compare cluster et dépôt ; les différences apparaissent comme OutOfSync, et l'auto-réparation les annule. La bonne façon de changer la production est donc un commit. En urgence, on suspend la synchronisation, on corrige à la main, puis on committe la correction.",
      "La reconciliación continua compara clúster y repositorio; las diferencias aparecen como OutOfSync y la autorreparación las deshace. La forma correcta de cambiar producción es, por tanto, un commit. En una urgencia se pausa la sincronización, se arregla a mano y luego se confirma el arreglo.",
    ],
  },
];

export const pipeline = { pipelineBasics };
export const containers = { containersBasics };
export const strategies = { strategiesBasics };
export const operations = { operationsBasics };
export const iac = { iacBasics };
export const terraform = { terraformBasics };
export const kubernetes = { kubernetesBasics };
export const gitops = { gitopsBasics };
