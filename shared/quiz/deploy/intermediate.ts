/**
 * Deployment systems, Intermédiaire: build once and configure per
 * environment, image layers, multi-stage builds and digests, feature flags
 * and probes, SLOs and error budgets, provisioning against configuration
 * and drift, remote state and for_each, Kubernetes probes and resources,
 * pull-based GitOps and promotion.
 */
import type { LinuxQuestion as DeployQuestion } from "../linux/types";

const pipelinePractice: DeployQuestion[] = [
  {
    id: "dp-pipeline-11",
    q: ["Why build an artifact once and promote the same one through staging and production?", "Pourquoi construire un artefact une seule fois et promouvoir le même en staging puis en production ?", "¿Por qué construir un artefacto una sola vez y promover el mismo por staging y producción?"],
    a: ["What was tested in staging is exactly what reaches production; rebuilding could pull different dependencies", "Ce qui a été testé en staging est exactement ce qui arrive en production ; reconstruire pourrait tirer d'autres dépendances", "Lo que se probó en staging es exactamente lo que llega a producción; reconstruir podría traer otras dependencias"],
    w: [["Building takes too long to do twice", "Le build prend trop de temps pour le faire deux fois", "El build tarda demasiado para hacerlo dos veces"], ["Production cannot run builds", "La production ne peut pas lancer de builds", "Producción no puede ejecutar builds"], ["Registries allow only one upload per version", "Les registres n'autorisent qu'un envoi par version", "Los registros solo permiten una subida por versión"]],
    e: [
      "A rebuild for production could pick a newer base image or package, or a different compiler, and ship something nobody tested. Promote by digest or immutable version; only configuration differs between environments.",
      "Un rebuild pour la production pourrait prendre une image de base ou un paquet plus récents, ou un autre compilateur, et livrer quelque chose que personne n'a testé. Promeus par digest ou version immuable ; seule la configuration diffère entre environnements.",
      "Reconstruir para producción podría coger una imagen base o un paquete más nuevos, u otro compilador, y enviar algo que nadie probó. Promueve por digest o versión inmutable; solo la configuración cambia entre entornos.",
    ],
  },
  {
    id: "dp-pipeline-12",
    q: ["Where should the database address for each environment come from?", "D'où doit venir l'adresse de la base de données de chaque environnement ?", "¿De dónde debe venir la dirección de la base de datos de cada entorno?"],
    a: ["From the environment at run time, such as an environment variable or a secret manager, not from the build", "De l'environnement à l'exécution, comme une variable d'environnement ou un gestionnaire de secrets, pas du build", "Del entorno en tiempo de ejecución, como una variable de entorno o un gestor de secretos, no del build"],
    w: [["From a constant in the code, changed before each build", "D'une constante dans le code, changée avant chaque build", "De una constante en el código, cambiada antes de cada build"], ["From a configuration file committed for each environment, with the password", "D'un fichier de configuration committé pour chaque environnement, avec le mot de passe", "De un archivo de configuración confirmado por entorno, con la contraseña"], ["From the developer's laptop", "De l'ordinateur du développeur", "Del portátil del desarrollador"]],
    e: [
      "The twelve-factor app keeps config in the environment: the same image runs everywhere, with `DATABASE_URL` set by the platform. Secrets come from a secret manager mounted at run time. That is also what makes build once, deploy many possible.",
      "L'application twelve-factor garde la configuration dans l'environnement : la même image tourne partout, avec `DATABASE_URL` réglé par la plateforme. Les secrets viennent d'un gestionnaire de secrets monté à l'exécution. C'est aussi ce qui permet de construire une fois et déployer partout.",
      "La aplicación twelve-factor guarda la configuración en el entorno: la misma imagen corre en todas partes, con `DATABASE_URL` fijado por la plataforma. Los secretos vienen de un gestor de secretos montado en ejecución. Eso es también lo que permite construir una vez y desplegar en todas partes.",
    ],
  },
  {
    id: "dp-pipeline-13",
    q: ["Which tag identifies an image best for a deploy record?", "Quel tag identifie le mieux une image dans l'historique des déploiements ?", "¿Qué tag identifica mejor una imagen en el historial de despliegues?"],
    a: ["The version or the commit SHA it was built from, such as `1.4.0` or `3f9c2ab`", "La version ou le SHA du commit dont elle vient, comme `1.4.0` ou `3f9c2ab`", "La versión o el SHA del commit del que se construyó, como `1.4.0` o `3f9c2ab`"],
    w: [["`latest`", "`latest`", "`latest`"], ["`stable`", "`stable`", "`stable`"], ["The date of the deploy only", "Seulement la date du déploiement", "Solo la fecha del despliegue"]],
    e: [
      "`latest` and `stable` move to new images, so a record saying latest was deployed tells nothing later. A version or commit SHA links the running code to its source and its pipeline run; the digest (`sha256:…`) pins the exact bytes.",
      "`latest` et `stable` passent à de nouvelles images, donc un historique disant latest a été déployé ne dit rien plus tard. Une version ou un SHA de commit relie le code en marche à sa source et à son exécution de pipeline ; le digest (`sha256:…`) fixe les octets exacts.",
      "`latest` y `stable` pasan a imágenes nuevas, así que un historial que dice que se desplegó latest no dice nada después. Una versión o un SHA de commit enlaza el código en marcha con su fuente y su ejecución del pipeline; el digest (`sha256:…`) fija los bytes exactos.",
    ],
  },
  {
    id: "dp-pipeline-14",
    q: ["A deploy pipeline has a manual approval before production. What should the approver look at?", "Un pipeline de déploiement a une approbation manuelle avant la production. Que doit regarder la personne qui approuve ?", "Un pipeline de despliegue tiene una aprobación manual antes de producción. ¿Qué debe mirar quien aprueba?"],
    a: ["What changed since the last release, whether staging checks passed, and whether the timing and rollback plan are sound", "Ce qui a changé depuis la dernière version, si les vérifications de staging sont passées, et si le moment et le plan de retour arrière tiennent", "Qué cambió desde la última versión, si pasaron las comprobaciones de staging y si el momento y el plan de vuelta atrás son razonables"],
    w: [["Only that the pipeline's name is right", "Seulement que le nom du pipeline est le bon", "Solo que el nombre del pipeline es el correcto"], ["The full source code, line by line", "Tout le code source, ligne par ligne", "Todo el código fuente, línea a línea"], ["Nothing: the approval is a formality", "Rien : l'approbation est une formalité", "Nada: la aprobación es una formalidad"]],
    e: [
      "Code was reviewed in pull requests; the release gate is about risk: the list of changes, test and staging results, migrations, ongoing incidents, and the moment (not before a holiday). A gate that is always clicked blindly adds delay without safety; automate what it checks.",
      "Le code a été relu dans les pull requests ; le contrôle de mise en production porte sur le risque : la liste des changements, les résultats des tests et du staging, les migrations, les incidents en cours, et le moment (pas avant un jour férié). Un contrôle toujours validé à l'aveugle ajoute du délai sans sécurité ; automatise ce qu'il vérifie.",
      "El código se revisó en las pull requests; el control de salida a producción trata del riesgo: la lista de cambios, los resultados de pruebas y staging, las migraciones, los incidentes en curso y el momento (no antes de un festivo). Un control que siempre se aprueba a ciegas añade retraso sin seguridad; automatiza lo que comprueba.",
    ],
  },
];

const containersPractice: DeployQuestion[] = [
  {
    id: "dp-containers-11",
    q: ["Why copy `package.json` and install dependencies before copying the rest of the code in a `Dockerfile`?", "Pourquoi copier `package.json` et installer les dépendances avant de copier le reste du code dans un `Dockerfile` ?", "¿Por qué copiar `package.json` e instalar las dependencias antes de copiar el resto del código en un `Dockerfile`?"],
    a: ["Each instruction is a cached layer; code changes then reuse the dependency layer instead of reinstalling", "Chaque instruction est une couche en cache ; un changement de code réutilise alors la couche des dépendances au lieu de réinstaller", "Cada instrucción es una capa en caché; un cambio de código reutiliza así la capa de dependencias en vez de reinstalar"],
    w: [["Docker requires that order", "Docker impose cet ordre", "Docker exige ese orden"], ["It makes the image more secure", "Cela rend l'image plus sûre", "Hace la imagen más segura"], ["Dependencies cannot be installed after the code is copied", "On ne peut pas installer les dépendances après avoir copié le code", "No se pueden instalar las dependencias tras copiar el código"]],
    e: [
      "When a layer's inputs change, it and every layer after it are rebuilt. Dependencies change rarely, code often: `COPY package*.json ./`, `RUN npm ci`, then `COPY . .` keeps builds fast. A `.dockerignore` also keeps `node_modules` and `.git` out of the build context.",
      "Quand les entrées d'une couche changent, elle et toutes les suivantes sont reconstruites. Les dépendances changent rarement, le code souvent : `COPY package*.json ./`, `RUN npm ci`, puis `COPY . .` garde les builds rapides. Un `.dockerignore` garde aussi `node_modules` et `.git` hors du contexte de build.",
      "Cuando cambian las entradas de una capa, se reconstruyen ella y todas las siguientes. Las dependencias cambian poco y el código a menudo: `COPY package*.json ./`, `RUN npm ci` y luego `COPY . .` mantiene rápidos los builds. Un `.dockerignore` deja además `node_modules` y `.git` fuera del contexto de build.",
    ],
  },
  {
    id: "dp-containers-12",
    q: ["What does a multi-stage build give?", "Qu'apporte un build multi-étapes ?", "¿Qué aporta un build multietapa?"],
    a: ["A small final image: tools and sources stay in the build stage, only the result is copied into a minimal runtime stage", "Une image finale petite : outils et sources restent dans l'étape de build, seul le résultat est copié dans une étape d'exécution minimale", "Una imagen final pequeña: herramientas y fuentes se quedan en la etapa de build y solo el resultado se copia a una etapa de ejecución mínima"],
    w: [["Images for several CPU architectures at once", "Des images pour plusieurs architectures de processeur à la fois", "Imágenes para varias arquitecturas de CPU a la vez"], ["Several containers in one image", "Plusieurs conteneurs dans une image", "Varios contenedores en una imagen"], ["Parallel builds on several machines", "Des builds parallèles sur plusieurs machines", "Builds en paralelo en varias máquinas"]],
    e: [
      "`FROM node:22 AS build` compiles; `FROM node:22-slim` then `COPY --from=build /app/dist ./dist` keeps only what runs. Compilers, dev dependencies and source never ship: a smaller image pulls faster, starts faster and carries fewer vulnerabilities.",
      "`FROM node:22 AS build` compile ; `FROM node:22-slim` puis `COPY --from=build /app/dist ./dist` ne garde que ce qui tourne. Compilateurs, dépendances de développement et sources ne partent jamais : une image plus petite se tire et démarre plus vite, et porte moins de vulnérabilités.",
      "`FROM node:22 AS build` compila; `FROM node:22-slim` y luego `COPY --from=build /app/dist ./dist` conserva solo lo que se ejecuta. Compiladores, dependencias de desarrollo y fuentes nunca se envían: una imagen más pequeña se descarga y arranca más rápido y lleva menos vulnerabilidades.",
    ],
  },
  {
    id: "dp-containers-13",
    q: ["What is the difference between pulling `app:1.4` and `app@sha256:9f…`?", "Quelle est la différence entre tirer `app:1.4` et `app@sha256:9f…` ?", "¿Qué diferencia hay entre descargar `app:1.4` y `app@sha256:9f…`?"],
    a: ["A tag can be moved to another image; a digest always names the same bytes", "Un tag peut être déplacé vers une autre image ; un digest désigne toujours les mêmes octets", "Un tag se puede mover a otra imagen; un digest siempre designa los mismos bytes"],
    w: [["The digest version downloads faster", "La version par digest se télécharge plus vite", "La versión por digest se descarga más rápido"], ["Tags only work with public registries", "Les tags ne marchent qu'avec les registres publics", "Los tags solo funcionan con registros públicos"], ["They are always the same image", "C'est toujours la même image", "Siempre son la misma imagen"]],
    e: [
      "A digest is the hash of the image manifest, so it cannot point elsewhere. Deploying by digest makes what runs exactly reproducible and protects against a re-pushed tag. Humans read tags, machines should pin digests; Kubernetes and Cloud Run record the digest they resolved.",
      "Un digest est le hash du manifeste de l'image, donc il ne peut pas pointer ailleurs. Déployer par digest rend exactement reproductible ce qui tourne et protège contre un tag repoussé. Les humains lisent les tags, les machines doivent fixer les digests ; Kubernetes et Cloud Run enregistrent le digest qu'ils ont résolu.",
      "Un digest es el hash del manifiesto de la imagen, así que no puede apuntar a otro sitio. Desplegar por digest hace exactamente reproducible lo que corre y protege contra un tag subido de nuevo. Las personas leen tags y las máquinas deben fijar digests; Kubernetes y Cloud Run anotan el digest que resolvieron.",
    ],
  },
  {
    id: "dp-containers-14",
    q: ["Why run the application in the container as a non-root user?", "Pourquoi faire tourner l'application dans le conteneur avec un utilisateur non root ?", "¿Por qué ejecutar la aplicación en el contenedor con un usuario que no sea root?"],
    a: ["If the application is compromised, the attacker has fewer rights inside the container and less chance of escaping it", "Si l'application est compromise, l'attaquant a moins de droits dans le conteneur et moins de chances d'en sortir", "Si la aplicación se ve comprometida, el atacante tiene menos derechos dentro del contenedor y menos posibilidades de escapar"],
    w: [["Root cannot open network ports", "Root ne peut pas ouvrir de ports réseau", "Root no puede abrir puertos de red"], ["Non-root containers start faster", "Les conteneurs non root démarrent plus vite", "Los contenedores sin root arrancan más rápido"], ["Registries refuse images that run as root", "Les registres refusent les images qui tournent en root", "Los registros rechazan las imágenes que corren como root"]],
    e: [
      "Root in a container is root on the shared kernel's terms, limited but powerful; a kernel or runtime bug can turn it into root on the host. `USER node` (or a numeric UID) in the `Dockerfile`, a read-only file system and dropped capabilities shrink what an exploit can do.",
      "Root dans un conteneur est root aux conditions du noyau partagé, limité mais puissant ; un bug du noyau ou du runtime peut le changer en root sur l'hôte. `USER node` (ou un UID numérique) dans le `Dockerfile`, un système de fichiers en lecture seule et des capacités retirées réduisent ce qu'un exploit peut faire.",
      "Root en un contenedor es root con las condiciones del núcleo compartido, limitado pero poderoso; un fallo del núcleo o del runtime puede convertirlo en root en el anfitrión. `USER node` (o un UID numérico) en el `Dockerfile`, un sistema de archivos de solo lectura y capacidades retiradas reducen lo que puede hacer un exploit.",
    ],
  },
];

const strategiesPractice: DeployQuestion[] = [
  {
    id: "dp-strategies-11",
    q: ["What does a feature flag allow?", "Que permet un feature flag ?", "¿Qué permite un feature flag?"],
    a: ["Deploying code with a feature switched off, then turning it on for some users or everyone without a new deploy", "Déployer du code avec une fonctionnalité désactivée, puis l'activer pour certains utilisateurs ou pour tous sans nouveau déploiement", "Desplegar código con una función desactivada y luego activarla para algunos usuarios o para todos sin un despliegue nuevo"],
    w: [["Skipping the tests for urgent features", "Sauter les tests pour les fonctionnalités urgentes", "Saltarse las pruebas en funciones urgentes"], ["Marking a commit as important", "Marquer un commit comme important", "Marcar un commit como importante"], ["Running two versions of the database", "Faire tourner deux versions de la base de données", "Ejecutar dos versiones de la base de datos"]],
    e: [
      "Flags separate deploying (code on servers) from releasing (users see it). Unfinished work can merge to `main` hidden, a feature can roll out to 1 percent, and a bad one is switched off in seconds. Old flags are debt: remove them once a feature is fully released.",
      "Les flags séparent déployer (le code sur les serveurs) et publier (les utilisateurs le voient). Le travail inachevé peut être fusionné dans `main` caché, une fonctionnalité peut s'ouvrir à 1 pour cent, et une mauvaise se coupe en quelques secondes. Les vieux flags sont une dette : retire-les une fois la fonctionnalité entièrement publiée.",
      "Los flags separan desplegar (el código en los servidores) de publicar (los usuarios lo ven). El trabajo sin terminar puede fusionarse en `main` oculto, una función puede abrirse al 1 por ciento y una mala se apaga en segundos. Los flags viejos son deuda: quítalos cuando la función esté publicada del todo.",
    ],
  },
  {
    id: "dp-strategies-12",
    q: ["What is the difference between a readiness probe and a liveness probe?", "Quelle est la différence entre une sonde de disponibilité (readiness) et une sonde de vie (liveness) ?", "¿Qué diferencia hay entre una sonda de disponibilidad (readiness) y una de vida (liveness)?"],
    a: ["A failing readiness probe takes the instance out of traffic; a failing liveness probe restarts it", "Une sonde de disponibilité en échec retire l'instance du trafic ; une sonde de vie en échec la redémarre", "Una sonda de disponibilidad que falla saca la instancia del tráfico; una de vida que falla la reinicia"],
    w: [["Readiness restarts the instance, liveness removes it from traffic", "La disponibilité redémarre l'instance, la vie la retire du trafic", "La disponibilidad reinicia la instancia y la de vida la saca del tráfico"], ["They are two names for the same check", "Ce sont deux noms pour le même contrôle", "Son dos nombres para el mismo control"], ["Readiness runs once at deploy, liveness never", "La disponibilité tourne une fois au déploiement, la vie jamais", "La disponibilidad corre una vez al desplegar y la de vida nunca"]],
    e: [
      "During a rolling update, new instances get traffic only once ready, so a broken release stalls instead of serving errors. Liveness catches a deadlocked process. Make liveness lenient and independent of dependencies; a startup probe protects slow starters from being killed early.",
      "Pendant une mise à jour progressive, les nouvelles instances ne reçoivent du trafic qu'une fois prêtes, donc une version cassée se bloque au lieu de servir des erreurs. La sonde de vie attrape un processus bloqué. Rends-la tolérante et indépendante des dépendances ; une startup probe protège les démarrages lents d'être tués trop tôt.",
      "Durante una actualización progresiva, las instancias nuevas solo reciben tráfico cuando están listas, así que una versión rota se atasca en vez de servir errores. La sonda de vida detecta un proceso bloqueado. Hazla tolerante e independiente de las dependencias; una startup probe evita que los arranques lentos mueran antes de tiempo.",
    ],
  },
  {
    id: "dp-strategies-13",
    q: ["A canary at 10 percent shows an error rate of 4 percent, against 0.5 percent on the old version. What should happen?", "Un canary à 10 pour cent montre un taux d'erreurs de 4 pour cent, contre 0,5 pour cent sur l'ancienne version. Que doit-il se passer ?", "Un canary al 10 por ciento muestra una tasa de errores del 4 por ciento, frente al 0,5 por ciento de la versión antigua. ¿Qué debe pasar?"],
    a: ["Send all traffic back to the old version and investigate", "Renvoyer tout le trafic vers l'ancienne version et enquêter", "Devolver todo el tráfico a la versión antigua e investigar"],
    w: [["Continue to 50 percent to get more data", "Continuer à 50 pour cent pour avoir plus de données", "Seguir al 50 por ciento para tener más datos"], ["Restart the canary instances and continue", "Redémarrer les instances canary et continuer", "Reiniciar las instancias canary y seguir"], ["Wait a day before deciding", "Attendre un jour avant de décider", "Esperar un día antes de decidir"]],
    e: [
      "The whole point of the canary is to stop early: eight times the error rate on a tenth of the traffic is already hurting users. Automated analysis compares canary and baseline on error rate and latency and rolls back on its own; humans then find the cause.",
      "Tout l'intérêt du canary est de s'arrêter tôt : huit fois le taux d'erreurs sur un dixième du trafic fait déjà souffrir des utilisateurs. Une analyse automatique compare canary et référence sur le taux d'erreurs et la latence et revient en arrière d'elle-même ; les humains cherchent ensuite la cause.",
      "La gracia del canary es parar pronto: ocho veces la tasa de errores en una décima parte del tráfico ya está perjudicando a usuarios. Un análisis automático compara canary y referencia en tasa de errores y latencia y vuelve atrás solo; luego las personas buscan la causa.",
    ],
  },
  {
    id: "dp-strategies-14",
    q: ["Cloud Run service `web` has revisions `web-00041` (current) and `web-00042` (new). How do you send 10 percent to the new one?", "Le service Cloud Run `web` a les révisions `web-00041` (actuelle) et `web-00042` (nouvelle). Comment envoyer 10 pour cent à la nouvelle ?", "El servicio de Cloud Run `web` tiene las revisiones `web-00041` (actual) y `web-00042` (nueva). ¿Cómo envías el 10 por ciento a la nueva?"],
    a: ["`gcloud run services update-traffic web --to-revisions=web-00042=10`", "`gcloud run services update-traffic web --to-revisions=web-00042=10`", "`gcloud run services update-traffic web --to-revisions=web-00042=10`"],
    w: [["`gcloud run deploy web --percent=10`", "`gcloud run deploy web --percent=10`", "`gcloud run deploy web --percent=10`"], ["`gcloud run services split web 10`", "`gcloud run services split web 10`", "`gcloud run services split web 10`"], ["`gcloud run revisions scale web-00042 10`", "`gcloud run revisions scale web-00042 10`", "`gcloud run revisions scale web-00042 10`"]],
    e: [
      "`update-traffic` assigns percentages to revisions; the rest stays on the revisions already serving. Deploying with `--no-traffic` first, testing through a tag URL, then moving 10, 50 and 100 percent is a canary on Cloud Run; `--to-latest` sends all traffic to the newest.",
      "`update-traffic` attribue des pourcentages aux révisions ; le reste demeure sur les révisions qui servaient déjà. Déployer d'abord avec `--no-traffic`, tester par l'URL d'un tag, puis passer à 10, 50 et 100 pour cent fait un canary sur Cloud Run ; `--to-latest` envoie tout le trafic à la plus récente.",
      "`update-traffic` asigna porcentajes a las revisiones; el resto se queda en las revisiones que ya servían. Desplegar primero con `--no-traffic`, probar por la URL de un tag y luego pasar al 10, 50 y 100 por ciento es un canary en Cloud Run; `--to-latest` envía todo el tráfico a la más nueva.",
    ],
  },
];

const operationsPractice: DeployQuestion[] = [
  {
    id: "dp-operations-11",
    q: ["What is the difference between an SLI, an SLO and an SLA?", "Quelle est la différence entre un SLI, un SLO et un SLA ?", "¿Qué diferencia hay entre un SLI, un SLO y un SLA?"],
    a: ["The SLI is what you measure, the SLO the target you set for it, the SLA a contract with consequences if missed", "Le SLI est ce qu'on mesure, le SLO l'objectif qu'on lui fixe, le SLA un contrat avec des conséquences s'il est manqué", "El SLI es lo que mides, el SLO el objetivo que le fijas y el SLA un contrato con consecuencias si se incumple"],
    w: [["They are three names for uptime", "Ce sont trois noms pour la disponibilité", "Son tres nombres para la disponibilidad"], ["The SLA is internal, the SLO is for customers", "Le SLA est interne, le SLO pour les clients", "El SLA es interno y el SLO para los clientes"], ["The SLI is a tool, the SLO a team, the SLA a dashboard", "Le SLI est un outil, le SLO une équipe, le SLA un tableau de bord", "El SLI es una herramienta, el SLO un equipo y el SLA un panel"]],
    e: [
      "SLI: share of requests answered successfully within 300 ms. SLO: 99.9 percent of them over 30 days. SLA: credits to customers below 99.5 percent. The SLO is stricter than the SLA so that the team reacts before the contract is breached.",
      "SLI : la part des requêtes servies avec succès en moins de 300 ms. SLO : 99,9 pour cent d'entre elles sur 30 jours. SLA : des avoirs aux clients sous 99,5 pour cent. Le SLO est plus strict que le SLA pour que l'équipe réagisse avant que le contrat soit enfreint.",
      "SLI: la parte de peticiones atendidas con éxito en menos de 300 ms. SLO: el 99,9 por ciento de ellas en 30 días. SLA: abonos a los clientes por debajo del 99,5 por ciento. El SLO es más estricto que el SLA para que el equipo reaccione antes de incumplir el contrato.",
    ],
  },
  {
    id: "dp-operations-12",
    q: ["An SLO of 99.9 percent over 30 days allows how much downtime?", "Un SLO de 99,9 pour cent sur 30 jours permet combien d'indisponibilité ?", "¿Cuánta indisponibilidad permite un SLO del 99,9 por ciento en 30 días?"],
    a: ["About 43 minutes", "Environ 43 minutes", "Unos 43 minutos"],
    w: [["About 4 minutes", "Environ 4 minutes", "Unos 4 minutos"], ["About 7 hours", "Environ 7 heures", "Unas 7 horas"], ["About 1 day", "Environ 1 jour", "Aproximadamente 1 día"]],
    e: [
      "30 days is 43,200 minutes; 0.1 percent of that is 43.2 minutes. That is the error budget: 99.99 percent leaves about 4.3 minutes, 99 percent about 7.2 hours. Each extra nine costs far more engineering, which is why the target should match what users need.",
      "30 jours font 43 200 minutes ; 0,1 pour cent de cela fait 43,2 minutes. C'est le budget d'erreur : 99,99 pour cent laisse environ 4,3 minutes, 99 pour cent environ 7,2 heures. Chaque neuf de plus coûte bien plus d'ingénierie, c'est pourquoi l'objectif doit correspondre au besoin des utilisateurs.",
      "30 días son 43 200 minutos; el 0,1 por ciento de eso son 43,2 minutos. Ese es el presupuesto de error: el 99,99 por ciento deja unos 4,3 minutos y el 99 por ciento unas 7,2 horas. Cada nueve de más cuesta mucha más ingeniería, por eso el objetivo debe ajustarse a lo que necesitan los usuarios.",
    ],
  },
  {
    id: "dp-operations-13",
    q: ["A team has spent its whole error budget for the month. What does an error budget policy usually say?", "Une équipe a dépensé tout son budget d'erreur du mois. Que dit en général une politique de budget d'erreur ?", "Un equipo ha gastado todo su presupuesto de error del mes. ¿Qué suele decir una política de presupuesto de error?"],
    a: ["Slow or freeze risky releases and put effort into reliability until the budget recovers", "Ralentir ou geler les versions risquées et consacrer l'effort à la fiabilité jusqu'à ce que le budget se reconstitue", "Frenar o congelar las versiones arriesgadas y dedicar el esfuerzo a la fiabilidad hasta que el presupuesto se recupere"],
    w: [["Lower the SLO to 99 percent for the rest of the month", "Baisser le SLO à 99 pour cent pour le reste du mois", "Bajar el SLO al 99 por ciento el resto del mes"], ["Deploy faster to fix things", "Déployer plus vite pour réparer", "Desplegar más rápido para arreglar"], ["Stop monitoring until next month", "Arrêter la supervision jusqu'au mois suivant", "Dejar de monitorizar hasta el mes siguiente"]],
    e: [
      "The budget turns reliability into a shared, measurable trade-off: budget left means room to ship and experiment, budget gone means stability first. Agreeing on this in advance avoids arguments during the crisis. Moving the target to fit the outages defeats the purpose.",
      "Le budget fait de la fiabilité un compromis partagé et mesurable : du budget restant laisse de la place pour livrer et expérimenter, un budget épuisé met la stabilité d'abord. S'accorder là-dessus à l'avance évite les disputes pendant la crise. Déplacer l'objectif pour l'adapter aux pannes ruine l'idée.",
      "El presupuesto convierte la fiabilidad en un compromiso compartido y medible: si queda presupuesto hay margen para publicar y experimentar; si se agotó, primero la estabilidad. Acordarlo de antemano evita discusiones durante la crisis. Mover el objetivo para ajustarlo a las caídas arruina la idea.",
    ],
  },
  {
    id: "dp-operations-14",
    q: ["What is a runbook?", "Qu'est-ce qu'un runbook ?", "¿Qué es un runbook?"],
    a: ["Written steps for diagnosing and handling a known situation, linked from the alert that signals it", "Des étapes écrites pour diagnostiquer et traiter une situation connue, liées depuis l'alerte qui la signale", "Pasos escritos para diagnosticar y gestionar una situación conocida, enlazados desde la alerta que la avisa"],
    w: [["The list of releases of the year", "La liste des versions de l'année", "La lista de versiones del año"], ["A test that runs every morning", "Un test qui tourne chaque matin", "Una prueba que corre cada mañana"], ["The on-call rota", "Le planning d'astreinte", "El calendario de guardias"]],
    e: [
      "At 3 a.m., the person on call should not have to rediscover how to check the queue or fail over the database. A runbook gives the checks, commands and escalation contacts; steps that are always the same are candidates for automation.",
      "À 3 heures du matin, la personne d'astreinte ne devrait pas avoir à redécouvrir comment vérifier la file ou basculer la base de données. Un runbook donne les vérifications, les commandes et les contacts d'escalade ; les étapes toujours identiques sont candidates à l'automatisation.",
      "A las 3 de la mañana, quien está de guardia no debería tener que redescubrir cómo revisar la cola o conmutar la base de datos. Un runbook da las comprobaciones, las órdenes y los contactos de escalado; los pasos que siempre son iguales son candidatos a automatizarse.",
    ],
  },
];

const iacPractice: DeployQuestion[] = [
  {
    id: "dp-iac-11",
    q: ["What is configuration drift?", "Qu'est-ce que la dérive de configuration (drift) ?", "¿Qué es la deriva de configuración (drift)?"],
    a: ["The real infrastructure no longer matches its code, usually after manual changes", "L'infrastructure réelle ne correspond plus à son code, en général après des changements manuels", "La infraestructura real ya no coincide con su código, normalmente tras cambios manuales"],
    w: [["Servers moving between data centers", "Des serveurs qui changent de centre de données", "Servidores que cambian de centro de datos"], ["Clocks of servers going out of sync", "Les horloges des serveurs qui se désynchronisent", "Relojes de servidores que se desincronizan"], ["Old versions of the code still in Git", "Les vieilles versions du code encore dans Git", "Versiones antiguas del código aún en Git"]],
    e: [
      "A port opened by hand during an incident, a size changed in the console: the next `terraform plan` shows it as a change to undo, or worse, someone applies and reverts the fix unknowingly. Detect drift with scheduled plans, and bring manual fixes back into code.",
      "Un port ouvert à la main pendant un incident, une taille changée dans la console : le prochain `terraform plan` le montre comme un changement à annuler, ou pire, quelqu'un applique et annule la correction sans le savoir. Détecte la dérive par des plans planifiés, et ramène les correctifs manuels dans le code.",
      "Un puerto abierto a mano durante un incidente, un tamaño cambiado en la consola: el siguiente `terraform plan` lo muestra como un cambio que deshacer o, peor, alguien aplica y deshace el arreglo sin saberlo. Detecta la deriva con planes programados y lleva los arreglos manuales de vuelta al código.",
    ],
  },
  {
    id: "dp-iac-12",
    q: ["What is immutable infrastructure?", "Qu'est-ce que l'infrastructure immuable ?", "¿Qué es la infraestructura inmutable?"],
    a: ["Servers are never changed after creation; a change means building a new image and replacing them", "Les serveurs ne sont jamais modifiés après leur création ; un changement veut dire construire une nouvelle image et les remplacer", "Los servidores nunca se modifican tras crearse; un cambio significa construir una imagen nueva y sustituirlos"],
    w: [["Infrastructure that cannot be deleted", "Une infrastructure qu'on ne peut pas supprimer", "Infraestructura que no se puede borrar"], ["Servers whose disks are read-only for users", "Des serveurs dont les disques sont en lecture seule pour les utilisateurs", "Servidores cuyos discos son de solo lectura para los usuarios"], ["Infrastructure written once and never updated", "Une infrastructure écrite une fois et jamais mise à jour", "Infraestructura escrita una vez y nunca actualizada"]],
    e: [
      "Patching servers in place makes each one slightly different over time. Replacing them from a versioned image (a container, a machine image) keeps every instance identical and makes rollback a redeploy of the previous image. Containers on Cloud Run are immutable by nature.",
      "Corriger les serveurs sur place rend chacun un peu différent avec le temps. Les remplacer à partir d'une image versionnée (un conteneur, une image machine) garde chaque instance identique et fait du retour arrière le redéploiement de l'image précédente. Les conteneurs sur Cloud Run sont immuables par nature.",
      "Parchear los servidores en el sitio hace que cada uno sea un poco distinto con el tiempo. Sustituirlos a partir de una imagen versionada (un contenedor, una imagen de máquina) mantiene idénticas todas las instancias y hace de la vuelta atrás volver a desplegar la imagen anterior. Los contenedores en Cloud Run son inmutables por naturaleza.",
    ],
  },
  {
    id: "dp-iac-13",
    q: ["Which is the native infrastructure-as-code service of each major cloud?", "Quel est le service d'infrastructure as code natif de chaque grand cloud ?", "¿Cuál es el servicio nativo de infraestructura como código de cada gran nube?"],
    a: ["AWS CloudFormation, Azure Bicep and ARM templates, Google Cloud Infrastructure Manager, which runs Terraform", "AWS CloudFormation, Azure Bicep et les modèles ARM, Google Cloud Infrastructure Manager, qui fait tourner Terraform", "AWS CloudFormation, Azure Bicep y las plantillas ARM, Google Cloud Infrastructure Manager, que ejecuta Terraform"],
    w: [["Terraform is made by each cloud for itself", "Terraform est fait par chaque cloud pour lui-même", "Terraform lo hace cada nube para sí misma"], ["Ansible on all three", "Ansible sur les trois", "Ansible en las tres"], ["They have none; only third-party tools exist", "Ils n'en ont pas ; seuls des outils tiers existent", "No tienen ninguno; solo existen herramientas de terceros"]],
    e: [
      "Native services know their cloud well but only that cloud. Google retired Deployment Manager in favour of Infrastructure Manager, a managed way to run Terraform configurations. Terraform and OpenTofu work across clouds and SaaS providers with one language.",
      "Les services natifs connaissent bien leur cloud mais seulement lui. Google a retiré Deployment Manager au profit d'Infrastructure Manager, une manière gérée de faire tourner des configurations Terraform. Terraform et OpenTofu fonctionnent sur plusieurs clouds et fournisseurs SaaS avec un seul langage.",
      "Los servicios nativos conocen bien su nube, pero solo esa. Google retiró Deployment Manager en favor de Infrastructure Manager, una forma gestionada de ejecutar configuraciones de Terraform. Terraform y OpenTofu funcionan en varias nubes y proveedores SaaS con un solo lenguaje.",
    ],
  },
  {
    id: "dp-iac-14",
    q: ["Why review infrastructure changes in pull requests with the plan attached?", "Pourquoi relire les changements d'infrastructure dans des pull requests avec le plan joint ?", "¿Por qué revisar los cambios de infraestructura en pull requests con el plan adjunto?"],
    a: ["The diff shows the intent, the plan shows the effect, such as a database that would be replaced", "Le diff montre l'intention, le plan montre l'effet, comme une base de données qui serait remplacée", "El diff muestra la intención y el plan el efecto, como una base de datos que se reemplazaría"],
    w: [["Plans are needed to compile the code", "Les plans sont nécessaires pour compiler le code", "Los planes hacen falta para compilar el código"], ["Reviewers cannot read configuration files", "Les relecteurs ne savent pas lire les fichiers de configuration", "Los revisores no saben leer archivos de configuración"], ["The plan replaces the need for tests", "Le plan remplace le besoin de tests", "El plan sustituye la necesidad de pruebas"]],
    e: [
      "A one-line rename in code can mean destroy and recreate in reality. Running `terraform plan` in CI and posting it on the pull request lets reviewers catch it; applying only after merge, from CI, keeps every change recorded. Tools such as Atlantis or HCP Terraform automate this loop.",
      "Un renommage d'une ligne dans le code peut signifier détruire et recréer dans la réalité. Lancer `terraform plan` en CI et le publier sur la pull request permet aux relecteurs de le voir ; n'appliquer qu'après la fusion, depuis la CI, garde chaque changement enregistré. Des outils comme Atlantis ou HCP Terraform automatisent cette boucle.",
      "Un cambio de nombre de una línea en el código puede significar destruir y recrear en la realidad. Ejecutar `terraform plan` en CI y publicarlo en la pull request permite a los revisores verlo; aplicar solo tras la fusión, desde la CI, deja registrado cada cambio. Herramientas como Atlantis o HCP Terraform automatizan este ciclo.",
    ],
  },
];

const terraformPractice: DeployQuestion[] = [
  {
    id: "dp-terraform-11",
    q: ["Two people run `terraform apply` on the same state at the same time. What prevents corruption?", "Deux personnes lancent `terraform apply` sur le même état en même temps. Qu'est-ce qui empêche la corruption ?", "Dos personas ejecutan `terraform apply` sobre el mismo estado a la vez. ¿Qué impide que se corrompa?"],
    a: ["State locking in the remote backend: the second run waits or fails until the first releases the lock", "Le verrouillage de l'état dans le backend distant : la seconde exécution attend ou échoue jusqu'à ce que la première libère le verrou", "El bloqueo del estado en el backend remoto: la segunda ejecución espera o falla hasta que la primera libera el bloqueo"],
    w: [["Terraform merges the two states afterwards", "Terraform fusionne les deux états ensuite", "Terraform fusiona los dos estados después"], ["Nothing: the last one to finish wins", "Rien : le dernier à finir l'emporte", "Nada: gana el último en terminar"], ["Git refuses the second push", "Git refuse le second push", "Git rechaza el segundo push"]],
    e: [
      "Backends such as GCS, HCP Terraform and S3 (with `use_lockfile`) lock the state during operations. A local state file has no lock across machines, one reason teams use a remote backend from day one. `terraform force-unlock` exists for stale locks; use it only when sure.",
      "Des backends comme GCS, HCP Terraform et S3 (avec `use_lockfile`) verrouillent l'état pendant les opérations. Un fichier d'état local n'a pas de verrou entre machines, une raison pour laquelle les équipes utilisent un backend distant dès le premier jour. `terraform force-unlock` existe pour les verrous orphelins ; ne l'utilise qu'en étant sûr.",
      "Backends como GCS, HCP Terraform y S3 (con `use_lockfile`) bloquean el estado durante las operaciones. Un archivo de estado local no tiene bloqueo entre máquinas, una razón por la que los equipos usan un backend remoto desde el primer día. `terraform force-unlock` existe para bloqueos huérfanos; úsalo solo cuando estés seguro.",
    ],
  },
  {
    id: "dp-terraform-12",
    q: ["Why prefer `for_each` over `count` for a set of buckets named in a list?", "Pourquoi préférer `for_each` à `count` pour un ensemble de buckets nommés dans une liste ?", "¿Por qué preferir `for_each` a `count` para un conjunto de buckets nombrados en una lista?"],
    a: ["`for_each` keys each instance by name; with `count`, removing an item in the middle shifts the indexes and recreates the buckets after it", "`for_each` identifie chaque instance par son nom ; avec `count`, retirer un élément au milieu décale les index et recrée les buckets suivants", "`for_each` identifica cada instancia por su nombre; con `count`, quitar un elemento del medio desplaza los índices y recrea los buckets siguientes"],
    w: [["`count` cannot create more than ten resources", "`count` ne peut pas créer plus de dix ressources", "`count` no puede crear más de diez recursos"], ["`for_each` is faster to apply", "`for_each` s'applique plus vite", "`for_each` se aplica más rápido"], ["`count` does not work with buckets", "`count` ne marche pas avec les buckets", "`count` no funciona con buckets"]],
    e: [
      "With `count`, instances are `bucket[0]`, `bucket[1]`, `bucket[2]`; dropping the first renumbers the rest, and Terraform plans to destroy and recreate them. With `for_each = toset(var.names)`, they are `bucket[\"logs\"]`, `bucket[\"media\"]`: removing one touches only that one. Use `count` for identical copies or an on/off switch.",
      "Avec `count`, les instances sont `bucket[0]`, `bucket[1]`, `bucket[2]` ; supprimer la première renumérote les autres, et Terraform prévoit de les détruire et recréer. Avec `for_each = toset(var.names)`, elles sont `bucket[\"logs\"]`, `bucket[\"media\"]` : en retirer une ne touche qu'elle. Garde `count` pour des copies identiques ou un interrupteur.",
      "Con `count`, las instancias son `bucket[0]`, `bucket[1]`, `bucket[2]`; quitar la primera renumera las demás, y Terraform planea destruirlas y recrearlas. Con `for_each = toset(var.names)`, son `bucket[\"logs\"]`, `bucket[\"media\"]`: quitar una solo toca esa. Usa `count` para copias idénticas o un interruptor.",
    ],
  },
  {
    id: "dp-terraform-13",
    q: ["What is a Terraform module?", "Qu'est-ce qu'un module Terraform ?", "¿Qué es un módulo de Terraform?"],
    a: ["A folder of configuration with inputs and outputs, called from other configurations to reuse a pattern", "Un dossier de configuration avec des entrées et des sorties, appelé depuis d'autres configurations pour réutiliser un modèle", "Una carpeta de configuración con entradas y salidas, llamada desde otras configuraciones para reutilizar un patrón"],
    w: [["A provider plugin", "Un plugin de fournisseur", "Un plugin de proveedor"], ["A copy of the state for one environment", "Une copie de l'état pour un environnement", "Una copia del estado de un entorno"], ["A command such as `plan` or `apply`", "Une commande comme `plan` ou `apply`", "Una orden como `plan` o `apply`"]],
    e: [
      "Every configuration is a module; the root module calls child modules with `module \"web\" { source = \"./modules/cloud-run\" ... }`, from a folder, Git or a registry with a version. Good modules encode a standard (logging, labels, IAM) once; too many layers of modules make plans hard to read.",
      "Toute configuration est un module ; le module racine appelle des modules enfants avec `module \"web\" { source = \"./modules/cloud-run\" ... }`, depuis un dossier, Git ou un registre avec une version. De bons modules codent une norme (journaux, labels, IAM) une fois ; trop de couches de modules rendent les plans difficiles à lire.",
      "Toda configuración es un módulo; el módulo raíz llama a módulos hijos con `module \"web\" { source = \"./modules/cloud-run\" ... }`, desde una carpeta, Git o un registro con una versión. Los buenos módulos codifican una norma (registros, etiquetas, IAM) una vez; demasiadas capas de módulos hacen difíciles de leer los planes.",
    ],
  },
  {
    id: "dp-terraform-14",
    q: ["What is a data source, as opposed to a resource?", "Qu'est-ce qu'une source de données, par opposition à une ressource ?", "¿Qué es una fuente de datos, frente a un recurso?"],
    a: ["A data source only reads something that already exists, such as a network made elsewhere; a resource is created and managed", "Une source de données ne fait que lire quelque chose qui existe déjà, comme un réseau créé ailleurs ; une ressource est créée et gérée", "Una fuente de datos solo lee algo que ya existe, como una red creada en otro sitio; un recurso se crea y se gestiona"],
    w: [["A data source stores the state", "Une source de données stocke l'état", "Una fuente de datos guarda el estado"], ["A data source is a database resource", "Une source de données est une ressource de base de données", "Una fuente de datos es un recurso de base de datos"], ["They are the same, with two keywords", "C'est la même chose, avec deux mots-clés", "Son lo mismo, con dos palabras clave"]],
    e: [
      "`data \"google_project\" \"this\" {}` looks up information at plan time without managing it; deleting the block never deletes anything. It connects configurations owned by different teams, or reads values such as the latest image or the current project number.",
      "`data \"google_project\" \"this\" {}` recherche des informations au moment du plan sans les gérer ; supprimer le bloc ne supprime jamais rien. Cela relie des configurations appartenant à des équipes différentes, ou lit des valeurs comme la dernière image ou le numéro du projet courant.",
      "`data \"google_project\" \"this\" {}` consulta información al planificar sin gestionarla; borrar el bloque nunca borra nada. Sirve para conectar configuraciones de equipos distintos o leer valores como la última imagen o el número del proyecto actual.",
    ],
  },
];

const kubernetesPractice: DeployQuestion[] = [
  {
    id: "dp-kubernetes-11",
    q: ["What is the difference between a container's resource request and its limit?", "Quelle est la différence entre la demande (request) et la limite (limit) de ressources d'un conteneur ?", "¿Qué diferencia hay entre la petición (request) y el límite (limit) de recursos de un contenedor?"],
    a: ["The request is what the scheduler reserves to place the Pod; the limit is the most it may use", "La demande est ce que l'ordonnanceur réserve pour placer le Pod ; la limite est le maximum qu'il peut utiliser", "La petición es lo que el planificador reserva para colocar el Pod; el límite es lo máximo que puede usar"],
    w: [["The request is the maximum, the limit the minimum", "La demande est le maximum, la limite le minimum", "La petición es el máximo y el límite el mínimo"], ["They only matter for billing", "Elles ne comptent que pour la facturation", "Solo importan para la facturación"], ["Requests apply to CPU, limits to disk", "Les demandes s'appliquent au CPU, les limites au disque", "Las peticiones son para la CPU y los límites para el disco"]],
    e: [
      "A Pod lands on a node with enough unreserved capacity for its requests. Above its CPU limit a container is throttled; above its memory limit it is killed (OOMKilled). Requests far below real use overload nodes, far above waste money.",
      "Un Pod atterrit sur un nœud ayant assez de capacité non réservée pour ses demandes. Au-delà de sa limite CPU, un conteneur est ralenti ; au-delà de sa limite mémoire, il est tué (OOMKilled). Des demandes très en dessous de l'usage réel surchargent les nœuds, très au-dessus gaspillent de l'argent.",
      "Un Pod se coloca en un nodo con capacidad sin reservar suficiente para sus peticiones. Por encima de su límite de CPU, un contenedor se ralentiza; por encima del de memoria, se mata (OOMKilled). Peticiones muy por debajo del uso real sobrecargan los nodos; muy por encima, malgastan dinero.",
    ],
  },
  {
    id: "dp-kubernetes-12",
    q: ["A Deployment has 4 replicas with `maxSurge: 1` and `maxUnavailable: 0`. How does a rolling update proceed?", "Un Deployment a 4 réplicas avec `maxSurge: 1` et `maxUnavailable: 0`. Comment se déroule une mise à jour progressive ?", "Un Deployment tiene 4 réplicas con `maxSurge: 1` y `maxUnavailable: 0`. ¿Cómo avanza una actualización progresiva?"],
    a: ["One new Pod starts; once ready, one old Pod stops; and so on, never fewer than 4 ready Pods", "Un nouveau Pod démarre ; une fois prêt, un ancien s'arrête ; et ainsi de suite, jamais moins de 4 Pods prêts", "Arranca un Pod nuevo; cuando está listo, se para uno antiguo; y así sucesivamente, nunca con menos de 4 Pods listos"],
    w: [["All 4 old Pods stop, then 4 new ones start", "Les 4 anciens Pods s'arrêtent, puis 4 nouveaux démarrent", "Se paran los 4 Pods antiguos y luego arrancan 4 nuevos"], ["One old Pod stops before each new one starts", "Un ancien Pod s'arrête avant que chaque nouveau démarre", "Se para un Pod antiguo antes de que arranque cada nuevo"], ["4 new Pods start at once beside the old ones", "4 nouveaux Pods démarrent d'un coup à côté des anciens", "Arrancan 4 Pods nuevos a la vez junto a los antiguos"]],
    e: [
      "`maxSurge` is how many Pods may exist above the desired count, `maxUnavailable` how many may be missing. 1 and 0 trade speed for capacity: never below 4, at most 5 at once. A readiness probe that never passes stalls the rollout safely, leaving the old Pods serving.",
      "`maxSurge` dit combien de Pods peuvent exister au-delà du nombre voulu, `maxUnavailable` combien peuvent manquer. 1 et 0 échangent de la vitesse contre de la capacité : jamais moins de 4, au plus 5 à la fois. Une sonde de disponibilité qui ne passe jamais bloque le déploiement sans danger, et les anciens Pods continuent de servir.",
      "`maxSurge` indica cuántos Pods puede haber por encima del número deseado y `maxUnavailable` cuántos pueden faltar. 1 y 0 cambian velocidad por capacidad: nunca menos de 4, como mucho 5 a la vez. Una sonda de disponibilidad que nunca pasa atasca el despliegue sin peligro, y los Pods antiguos siguen sirviendo.",
    ],
  },
  {
    id: "dp-kubernetes-13",
    q: ["What is a Kubernetes Secret, by default?", "Qu'est-ce qu'un Secret Kubernetes, par défaut ?", "¿Qué es un Secret de Kubernetes, por defecto?"],
    a: ["A ConfigMap-like object whose values are base64-encoded, not encrypted, readable by anyone allowed to read Secrets", "Un objet comme une ConfigMap dont les valeurs sont encodées en base64, pas chiffrées, lisibles par quiconque a le droit de lire les Secrets", "Un objeto parecido a un ConfigMap cuyos valores van codificados en base64, no cifrados, legibles por quien tenga permiso para leer Secrets"],
    w: [["An encrypted vault that even administrators cannot read", "Un coffre chiffré que même les administrateurs ne peuvent pas lire", "Una caja fuerte cifrada que ni los administradores pueden leer"], ["A password for the `kubectl` command", "Un mot de passe pour la commande `kubectl`", "Una contraseña para la orden `kubectl`"], ["A file that Kubernetes deletes after one read", "Un fichier que Kubernetes supprime après une lecture", "Un archivo que Kubernetes borra tras una lectura"]],
    e: [
      "base64 is an encoding anyone can reverse. Protect Secrets with RBAC, encryption at rest in etcd (managed clusters such as GKE offer it), and preferably keep the source of truth in a secret manager synced in by tools like External Secrets. Never commit Secret manifests in clear to Git.",
      "Le base64 est un encodage que n'importe qui peut inverser. Protège les Secrets par RBAC, par le chiffrement au repos dans etcd (les clusters gérés comme GKE le proposent), et garde de préférence la source de vérité dans un gestionnaire de secrets synchronisé par des outils comme External Secrets. Ne committe jamais de manifestes de Secret en clair dans Git.",
      "El base64 es una codificación que cualquiera puede invertir. Protege los Secrets con RBAC, con cifrado en reposo en etcd (los clústeres gestionados como GKE lo ofrecen) y, mejor, guarda la fuente de verdad en un gestor de secretos sincronizado con herramientas como External Secrets. Nunca confirmes en Git manifiestos de Secret en claro.",
    ],
  },
  {
    id: "dp-kubernetes-14",
    q: ["What does the Gateway API offer over Ingress?", "Qu'offre la Gateway API par rapport à Ingress ?", "¿Qué ofrece la Gateway API frente a Ingress?"],
    a: ["A richer, role-oriented model: infrastructure teams own Gateways, application teams own Routes, with traffic splitting and header matching built in", "Un modèle plus riche, orienté rôles : les équipes d'infrastructure possèdent les Gateways, les équipes applicatives les Routes, avec partage du trafic et correspondance d'en-têtes intégrés", "Un modelo más rico, orientado a roles: los equipos de infraestructura son dueños de los Gateways y los de aplicación de las Routes, con reparto de tráfico y coincidencia de cabeceras integrados"],
    w: [["It replaces Services", "Elle remplace les Services", "Sustituye a los Services"], ["It is only for internal traffic", "Elle n'est que pour le trafic interne", "Solo es para tráfico interno"], ["It removes the need for TLS certificates", "Elle supprime le besoin de certificats TLS", "Elimina la necesidad de certificados TLS"]],
    e: [
      "Ingress covers host and path routing, and anything more depends on controller-specific annotations. The Gateway API (GatewayClass, Gateway, HTTPRoute…) standardizes weighted backends for canaries, header-based routing and cross-namespace delegation. It is the successor most controllers now implement.",
      "Ingress couvre le routage par hôte et chemin, et tout le reste dépend d'annotations propres à chaque contrôleur. La Gateway API (GatewayClass, Gateway, HTTPRoute…) normalise les backends pondérés pour les canaries, le routage par en-têtes et la délégation entre namespaces. C'est le successeur que la plupart des contrôleurs implémentent désormais.",
      "Ingress cubre el enrutamiento por host y ruta, y todo lo demás depende de anotaciones propias de cada controlador. La Gateway API (GatewayClass, Gateway, HTTPRoute…) normaliza backends ponderados para canaries, enrutamiento por cabeceras y delegación entre namespaces. Es el sucesor que la mayoría de controladores implementan ya.",
    ],
  },
];

const gitopsPractice: DeployQuestion[] = [
  {
    id: "dp-gitops-11",
    q: ["What is the difference between push-based and pull-based deployment?", "Quelle est la différence entre déploiement par poussée (push) et par tirage (pull) ?", "¿Qué diferencia hay entre el despliegue por empuje (push) y por arrastre (pull)?"],
    a: ["In push, CI holds credentials and applies changes to the cluster; in pull, an agent inside the cluster fetches the desired state and applies it", "En push, la CI détient les identifiants et applique les changements au cluster ; en pull, un agent dans le cluster récupère l'état voulu et l'applique", "En push, la CI tiene las credenciales y aplica los cambios al clúster; en pull, un agente dentro del clúster obtiene el estado deseado y lo aplica"],
    w: [["Push is for code, pull is for configuration", "Push est pour le code, pull pour la configuration", "Push es para código y pull para configuración"], ["Pull deployments are manual", "Les déploiements pull sont manuels", "Los despliegues pull son manuales"], ["Push uses Git, pull does not", "Push utilise Git, pull non", "Push usa Git y pull no"]],
    e: [
      "Pull keeps cluster credentials out of CI and reconciles continuously, correcting drift. Push is simpler and suits platforms without an agent, such as Cloud Run deployed from GitHub Actions with OIDC. Many setups mix both: CI builds and pushes the image, an agent pulls the manifests.",
      "Le pull garde les identifiants du cluster hors de la CI et réconcilie en continu, en corrigeant la dérive. Le push est plus simple et convient aux plateformes sans agent, comme Cloud Run déployé depuis GitHub Actions avec OIDC. Beaucoup de configurations mêlent les deux : la CI construit et pousse l'image, un agent tire les manifestes.",
      "El pull deja las credenciales del clúster fuera de la CI y reconcilia continuamente, corrigiendo la deriva. El push es más sencillo y va bien con plataformas sin agente, como Cloud Run desplegado desde GitHub Actions con OIDC. Muchos esquemas mezclan ambos: la CI construye y sube la imagen y un agente descarga los manifiestos.",
    ],
  },
  {
    id: "dp-gitops-12",
    q: ["How is a release usually promoted from staging to production in GitOps?", "Comment une version est-elle en général promue du staging à la production en GitOps ?", "¿Cómo se promueve normalmente una versión de staging a producción en GitOps?"],
    a: ["A pull request changes the image version in production's folder or overlay, and merging it deploys", "Une pull request change la version de l'image dans le dossier ou l'overlay de la production, et la fusion déploie", "Una pull request cambia la versión de la imagen en la carpeta o el overlay de producción, y fusionarla despliega"],
    w: [["By rebuilding the image with a production flag", "En reconstruisant l'image avec un drapeau de production", "Reconstruyendo la imagen con un indicador de producción"], ["By copying staging's database to production", "En copiant la base de données du staging en production", "Copiando la base de datos de staging a producción"], ["By running `kubectl` from a laptop", "En lançant `kubectl` depuis un ordinateur portable", "Ejecutando `kubectl` desde un portátil"]],
    e: [
      "Environments are folders (`envs/staging`, `envs/production`) or Kustomize overlays in the configuration repository. Promotion bumps the tag or digest in the next environment's file; the pull request is the approval and the record, and reverting it is the rollback.",
      "Les environnements sont des dossiers (`envs/staging`, `envs/production`) ou des overlays Kustomize dans le dépôt de configuration. La promotion change le tag ou le digest dans le fichier de l'environnement suivant ; la pull request est l'approbation et la trace, et l'annuler est le retour arrière.",
      "Los entornos son carpetas (`envs/staging`, `envs/production`) u overlays de Kustomize en el repositorio de configuración. La promoción cambia el tag o el digest en el archivo del entorno siguiente; la pull request es la aprobación y el registro, y revertirla es la vuelta atrás.",
    ],
  },
  {
    id: "dp-gitops-13",
    q: ["Why keep deployment manifests in a repository separate from the application code?", "Pourquoi garder les manifestes de déploiement dans un dépôt séparé du code de l'application ?", "¿Por qué guardar los manifiestos de despliegue en un repositorio separado del código de la aplicación?"],
    a: ["Configuration changes and code changes have different reviewers, rhythms and access, and the history of deploys stays readable", "Les changements de configuration et de code ont des relecteurs, des rythmes et des accès différents, et l'historique des déploiements reste lisible", "Los cambios de configuración y de código tienen revisores, ritmos y accesos distintos, y el historial de despliegues sigue siendo legible"],
    w: [["GitOps tools cannot read application repositories", "Les outils GitOps ne savent pas lire les dépôts d'application", "Las herramientas GitOps no pueden leer los repositorios de aplicación"], ["Manifests are secret and code is public", "Les manifestes sont secrets et le code est public", "Los manifiestos son secretos y el código público"], ["Git cannot store YAML next to code", "Git ne peut pas stocker du YAML à côté du code", "Git no puede guardar YAML junto al código"]],
    e: [
      "A config repository lets platform people review production changes without wading through feature commits, avoids CI loops when the pipeline commits a new image tag, and gives a clean log of what was deployed when. Small teams often keep one repository anyway; the separation is a scaling choice.",
      "Un dépôt de configuration permet à l'équipe plateforme de relire les changements de production sans parcourir les commits de fonctionnalités, évite des boucles de CI quand le pipeline committe un nouveau tag d'image, et donne un journal propre de ce qui a été déployé et quand. Les petites équipes gardent souvent un seul dépôt ; la séparation est un choix qui vient avec la taille.",
      "Un repositorio de configuración permite al equipo de plataforma revisar los cambios de producción sin recorrer commits de funciones, evita bucles de CI cuando el pipeline confirma un tag de imagen nuevo y da un registro limpio de qué se desplegó y cuándo. Los equipos pequeños suelen tener un solo repositorio; la separación es una decisión que llega con el tamaño.",
    ],
  },
  {
    id: "dp-gitops-14",
    q: ["On Cloud Run, what do `--no-traffic` and `--tag candidate` do together at deploy time?", "Sur Cloud Run, que font ensemble `--no-traffic` et `--tag candidate` au déploiement ?", "En Cloud Run, ¿qué hacen juntos `--no-traffic` y `--tag candidate` al desplegar?"],
    a: ["The new revision gets no user traffic but its own URL, so it can be tested before traffic moves to it", "La nouvelle révision ne reçoit aucun trafic utilisateur mais a sa propre URL, pour être testée avant que le trafic y passe", "La revisión nueva no recibe tráfico de usuarios pero sí su propia URL, para probarla antes de que el tráfico pase a ella"],
    w: [["The service is stopped during the deploy", "Le service est arrêté pendant le déploiement", "El servicio se para durante el despliegue"], ["The image is built but not uploaded", "L'image est construite mais pas envoyée", "La imagen se construye pero no se sube"], ["Traffic is split 50/50 with the previous revision", "Le trafic est partagé à 50/50 avec la révision précédente", "El tráfico se reparte al 50/50 con la revisión anterior"]],
    e: [
      "The tag URL looks like `https://candidate---web-xyz.a.run.app`. A pipeline can smoke-test it, then move traffic with `update-traffic`, and keep the previous revision for an instant rollback. Luma's release workflow uses this pattern.",
      "L'URL du tag ressemble à `https://candidate---web-xyz.a.run.app`. Un pipeline peut la tester rapidement, puis déplacer le trafic avec `update-traffic`, en gardant la révision précédente pour un retour arrière instantané. Le workflow de release de Luma utilise ce schéma.",
      "La URL del tag se parece a `https://candidate---web-xyz.a.run.app`. Un pipeline puede hacerle una prueba rápida, luego mover el tráfico con `update-traffic` y conservar la revisión anterior para volver atrás al instante. El workflow de release de Luma usa este esquema.",
    ],
  },
];

export const pipeline = { pipelinePractice };
export const containers = { containersPractice };
export const strategies = { strategiesPractice };
export const operations = { operationsPractice };
export const iac = { iacPractice };
export const terraform = { terraformPractice };
export const kubernetes = { kubernetesPractice };
export const gitops = { gitopsPractice };
