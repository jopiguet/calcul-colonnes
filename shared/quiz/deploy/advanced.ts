/**
 * Deployment systems, Avancé: trunk-based work and preview environments,
 * reproducible builds, minimal images and PID 1, multi-architecture images,
 * expand/contract migrations and rolling forward, DORA and postmortems,
 * Pulumi, CDK, Crossplane and policy as code, Terraform's lifecycle,
 * import and moved blocks, HPA, Helm and Kustomize, Argo CD and Flux.
 */
import type { LinuxQuestion as DeployQuestion } from "../linux/types";

const pipelineAdvanced: DeployQuestion[] = [
  {
    id: "dp-pipeline-21",
    q: ["What does a preview environment per pull request give?", "Qu'apporte un environnement de prévisualisation par pull request ?", "¿Qué aporta un entorno de previsualización por pull request?"],
    a: ["A short-lived deployment of the branch at its own URL, so reviewers try the change before merging, removed when the pull request closes", "Un déploiement éphémère de la branche à sa propre URL, pour que les relecteurs essaient le changement avant la fusion, supprimé à la fermeture de la pull request", "Un despliegue efímero de la rama en su propia URL, para que los revisores prueben el cambio antes de fusionar, eliminado al cerrar la pull request"],
    w: [["A copy of production's data for each developer", "Une copie des données de production pour chaque développeur", "Una copia de los datos de producción para cada desarrollador"], ["A permanent staging server per team", "Un serveur de staging permanent par équipe", "Un servidor de staging permanente por equipo"], ["A screenshot of the change", "Une capture d'écran du changement", "Una captura de pantalla del cambio"]],
    e: [
      "Platforms such as Vercel and Netlify do it out of the box; on Cloud Run a tagged no-traffic revision per pull request does the same. Data is the hard part: seeded test data or a branch of the database, never production's personal data. Cleaning up on close keeps costs down.",
      "Des plateformes comme Vercel et Netlify le font d'emblée ; sur Cloud Run, une révision sans trafic avec un tag par pull request fait de même. Les données sont la partie difficile : des données de test générées ou une branche de la base, jamais les données personnelles de la production. Nettoyer à la fermeture limite les coûts.",
      "Plataformas como Vercel y Netlify lo hacen de serie; en Cloud Run, una revisión sin tráfico con un tag por pull request hace lo mismo. Los datos son lo difícil: datos de prueba generados o una rama de la base, nunca los datos personales de producción. Limpiar al cerrar mantiene bajos los costes.",
    ],
  },
  {
    id: "dp-pipeline-22",
    q: ["What is a reproducible build?", "Qu'est-ce qu'un build reproductible ?", "¿Qué es un build reproducible?"],
    a: ["Building the same source with the same tools gives bit-for-bit the same artifact, anywhere and later", "Construire la même source avec les mêmes outils donne bit à bit le même artefact, n'importe où et plus tard", "Construir la misma fuente con las mismas herramientas da bit a bit el mismo artefacto, en cualquier sitio y más tarde"],
    w: [["A build that never fails", "Un build qui n'échoue jamais", "Un build que nunca falla"], ["A build that runs on every commit", "Un build qui tourne à chaque commit", "Un build que corre en cada commit"], ["A build stored in two registries", "Un build stocké dans deux registres", "Un build guardado en dos registros"]],
    e: [
      "It requires pinned dependencies (lockfiles, base image digests), no timestamps or random paths in the output, and a fixed toolchain. Anyone can then rebuild and compare hashes to check that a binary really comes from the published source, a strong defence against a compromised build server.",
      "Il demande des dépendances fixées (lockfiles, digests des images de base), aucun horodatage ni chemin aléatoire dans le résultat, et une chaîne d'outils figée. N'importe qui peut alors reconstruire et comparer les hashes pour vérifier qu'un binaire vient vraiment de la source publiée, une forte défense contre un serveur de build compromis.",
      "Requiere dependencias fijadas (lockfiles, digests de las imágenes base), ninguna marca de tiempo ni ruta aleatoria en el resultado y una cadena de herramientas fija. Cualquiera puede entonces reconstruir y comparar los hashes para comprobar que un binario viene de verdad de la fuente publicada, una buena defensa ante un servidor de build comprometido.",
    ],
  },
  {
    id: "dp-pipeline-23",
    q: ["Why does trunk-based development go with continuous deployment?", "Pourquoi le trunk-based development va-t-il avec le déploiement continu ?", "¿Por qué el trunk-based development va con el despliegue continuo?"],
    a: ["Changes reach `main` in small pieces at least daily, so each deploy is small, easy to check and easy to undo", "Les changements arrivent sur `main` par petits morceaux au moins chaque jour, donc chaque déploiement est petit, facile à vérifier et à annuler", "Los cambios llegan a `main` en trozos pequeños al menos a diario, así que cada despliegue es pequeño, fácil de comprobar y de deshacer"],
    w: [["It forbids pull requests", "Il interdit les pull requests", "Prohíbe las pull requests"], ["It deploys once a month", "Il déploie une fois par mois", "Despliega una vez al mes"], ["It removes the need for tests", "Il supprime le besoin de tests", "Elimina la necesidad de pruebas"]],
    e: [
      "Long-lived branches merge big batches that are risky to deploy and hard to diagnose. With the trunk always releasable, unfinished features behind flags, and strong automated tests, every merge can go out. DORA's research links this to both speed and stability.",
      "Les branches durables fusionnent de gros lots risqués à déployer et durs à diagnostiquer. Avec un tronc toujours publiable, les fonctionnalités inachevées derrière des flags et de solides tests automatiques, chaque fusion peut partir. Les recherches de DORA relient cela à la fois à la vitesse et à la stabilité.",
      "Las ramas duraderas fusionan lotes grandes, arriesgados de desplegar y difíciles de diagnosticar. Con el tronco siempre publicable, las funciones a medias tras flags y buenas pruebas automáticas, cada fusión puede salir. Las investigaciones de DORA lo relacionan tanto con la velocidad como con la estabilidad.",
    ],
  },
  {
    id: "dp-pipeline-24",
    q: ["A pipeline deploys the database migration and the new code in one step. What is the risk?", "Un pipeline déploie la migration de base de données et le nouveau code en une seule étape. Quel est le risque ?", "Un pipeline despliega la migración de base de datos y el código nuevo en un solo paso. ¿Cuál es el riesgo?"],
    a: ["During the rollout old instances meet the new schema, and rolling back the code does not roll back the schema", "Pendant le déploiement, les anciennes instances rencontrent le nouveau schéma, et revenir en arrière sur le code ne revient pas sur le schéma", "Durante el despliegue las instancias antiguas se encuentran con el esquema nuevo, y volver atrás el código no vuelve atrás el esquema"],
    w: [["Migrations cannot run in a pipeline", "Les migrations ne peuvent pas tourner dans un pipeline", "Las migraciones no pueden correr en un pipeline"], ["The database will be deleted", "La base de données sera supprimée", "Se borrará la base de datos"], ["None, if the tests passed", "Aucun, si les tests sont passés", "Ninguno, si pasaron las pruebas"]],
    e: [
      "Code rollouts take minutes with both versions live, and schema changes are often one-way. Run migrations as a separate step before the code, make them backward compatible (add before using, remove after nobody uses), and the code can then go back and forth safely. Luma runs its migrations as a separate Cloud Run job for this reason.",
      "Les déploiements de code prennent des minutes avec les deux versions en service, et les changements de schéma sont souvent à sens unique. Lance les migrations comme une étape séparée avant le code, rends-les rétrocompatibles (ajouter avant d'utiliser, retirer quand plus personne n'utilise), et le code peut alors aller et revenir sans danger. Luma lance ses migrations dans un job Cloud Run séparé pour cette raison.",
      "Los despliegues de código tardan minutos con las dos versiones en servicio, y los cambios de esquema suelen ser de un solo sentido. Ejecuta las migraciones como un paso aparte antes del código, hazlas compatibles hacia atrás (añadir antes de usar, quitar cuando ya nadie use) y el código podrá ir y volver sin peligro. Luma ejecuta sus migraciones en un job de Cloud Run aparte por esta razón.",
    ],
  },
];

const containersAdvanced: DeployQuestion[] = [
  {
    id: "dp-containers-21",
    q: ["Why does `CMD [\"node\", \"server.js\"]` stop more cleanly than `CMD node server.js`?", "Pourquoi `CMD [\"node\", \"server.js\"]` s'arrête-t-il plus proprement que `CMD node server.js` ?", "¿Por qué `CMD [\"node\", \"server.js\"]` se para más limpiamente que `CMD node server.js`?"],
    a: ["The exec form makes node PID 1, receiving SIGTERM; the shell form runs it under `/bin/sh -c`, which may not pass the signal on", "La forme exec fait de node le PID 1, qui reçoit SIGTERM ; la forme shell le lance sous `/bin/sh -c`, qui peut ne pas transmettre le signal", "La forma exec hace de node el PID 1, que recibe SIGTERM; la forma shell lo lanza bajo `/bin/sh -c`, que puede no transmitir la señal"],
    w: [["The exec form uses less memory", "La forme exec utilise moins de mémoire", "La forma exec usa menos memoria"], ["The shell form cannot read environment variables", "La forme shell ne peut pas lire les variables d'environnement", "La forma shell no puede leer variables de entorno"], ["There is no difference", "Il n'y a pas de différence", "No hay diferencia"]],
    e: [
      "On shutdown the platform sends SIGTERM to PID 1 and kills it after a grace period. If PID 1 is a shell that ignores the signal, the app never drains requests or closes connections and is killed hard. Use the exec form, handle SIGTERM in the app, or add a tiny init such as `tini`.",
      "À l'arrêt, la plateforme envoie SIGTERM au PID 1 et le tue après un délai de grâce. Si le PID 1 est un shell qui ignore le signal, l'application ne termine jamais ses requêtes ni ne ferme ses connexions, et elle est tuée brutalement. Utilise la forme exec, gère SIGTERM dans l'application, ou ajoute un petit init comme `tini`.",
      "Al pararse, la plataforma envía SIGTERM al PID 1 y lo mata tras un periodo de gracia. Si el PID 1 es un shell que ignora la señal, la aplicación nunca termina sus peticiones ni cierra sus conexiones y se mata de golpe. Usa la forma exec, gestiona SIGTERM en la aplicación o añade un init pequeño como `tini`.",
    ],
  },
  {
    id: "dp-containers-22",
    q: ["What does a distroless or minimal base image remove?", "Que retire une image de base distroless ou minimale ?", "¿Qué quita una imagen base distroless o mínima?"],
    a: ["The shell, package manager and tools not needed to run the app, cutting size and attack surface", "Le shell, le gestionnaire de paquets et les outils inutiles pour faire tourner l'application, ce qui réduit la taille et la surface d'attaque", "El shell, el gestor de paquetes y las herramientas que no hacen falta para ejecutar la aplicación, reduciendo tamaño y superficie de ataque"],
    w: [["The application's dependencies", "Les dépendances de l'application", "Las dependencias de la aplicación"], ["The Linux kernel", "Le noyau Linux", "El núcleo Linux"], ["Environment variables", "Les variables d'environnement", "Las variables de entorno"]],
    e: [
      "Fewer packages mean fewer vulnerabilities to patch and fewer tools for an attacker who gets in. The cost is debugging: no shell to `exec` into, so you rely on logs, ephemeral debug containers, or a debug variant of the image. Containers never contain a kernel anyway.",
      "Moins de paquets signifie moins de vulnérabilités à corriger et moins d'outils pour un attaquant qui entre. Le prix est le débogage : pas de shell où faire `exec`, donc on s'appuie sur les journaux, des conteneurs de débogage éphémères ou une variante de débogage de l'image. Les conteneurs ne contiennent de toute façon jamais de noyau.",
      "Menos paquetes significa menos vulnerabilidades que parchear y menos herramientas para un atacante que entre. El precio es la depuración: no hay shell en el que hacer `exec`, así que se depende de los registros, de contenedores de depuración efímeros o de una variante de depuración de la imagen. Los contenedores nunca contienen un núcleo, de todos modos.",
    ],
  },
  {
    id: "dp-containers-23",
    q: ["Developers on Apple Silicon build images that fail on the amd64 servers. What fixes it?", "Des développeurs sur Apple Silicon construisent des images qui échouent sur les serveurs amd64. Qu'est-ce qui règle le problème ?", "Los desarrolladores con Apple Silicon construyen imágenes que fallan en los servidores amd64. ¿Qué lo arregla?"],
    a: ["Build multi-architecture images with `docker buildx build --platform linux/amd64,linux/arm64`, or build in CI for the target platform", "Construire des images multi-architecture avec `docker buildx build --platform linux/amd64,linux/arm64`, ou construire en CI pour la plateforme cible", "Construir imágenes multiarquitectura con `docker buildx build --platform linux/amd64,linux/arm64`, o construir en CI para la plataforma de destino"],
    w: [["Renaming the image with `-amd64`", "Renommer l'image avec `-amd64`", "Renombrar la imagen con `-amd64`"], ["Running the servers in a virtual machine", "Faire tourner les serveurs dans une machine virtuelle", "Ejecutar los servidores en una máquina virtual"], ["Adding more memory to the servers", "Ajouter de la mémoire aux serveurs", "Añadir memoria a los servidores"]],
    e: [
      "An image holds binaries for one CPU architecture. An image index (manifest list) groups variants, and each machine pulls its own. Building production images in CI from the repository also avoids it works on my laptop images entirely.",
      "Une image contient des binaires pour une architecture de processeur. Un index d'images (manifest list) regroupe des variantes, et chaque machine tire la sienne. Construire les images de production en CI depuis le dépôt évite aussi entièrement les images qui ne marchent que sur un portable.",
      "Una imagen contiene binarios para una arquitectura de CPU. Un índice de imágenes (manifest list) agrupa variantes y cada máquina descarga la suya. Construir las imágenes de producción en CI desde el repositorio evita además por completo las imágenes que solo funcionan en un portátil.",
    ],
  },
  {
    id: "dp-containers-24",
    q: ["An image scanner reports 40 vulnerabilities, most in the base image. What is the most effective response?", "Un scanner d'images signale 40 vulnérabilités, la plupart dans l'image de base. Quelle est la réponse la plus efficace ?", "Un escáner de imágenes informa de 40 vulnerabilidades, la mayoría en la imagen base. ¿Cuál es la respuesta más eficaz?"],
    a: ["Rebuild regularly on an updated, smaller base image, and triage what remains by whether it is reachable", "Reconstruire régulièrement sur une image de base à jour et plus petite, et trier ce qui reste selon que c'est atteignable", "Reconstruir con regularidad sobre una imagen base actualizada y más pequeña, y clasificar lo que quede según sea alcanzable"],
    w: [["Patch each package by hand inside the running containers", "Corriger chaque paquet à la main dans les conteneurs en marche", "Parchear cada paquete a mano dentro de los contenedores en marcha"], ["Turn off the scanner", "Désactiver le scanner", "Desactivar el escáner"], ["Never update the base image, to stay stable", "Ne jamais mettre à jour l'image de base, pour rester stable", "No actualizar nunca la imagen base, para estar estable"]],
    e: [
      "Most findings disappear with a fresh or slimmer base; scheduled rebuilds (Dependabot can bump `FROM` lines) keep them away. Changes inside running containers are lost at the next restart. What remains is judged by context: a vulnerable library the app never loads is lower priority.",
      "La plupart des résultats disparaissent avec une base récente ou plus légère ; des reconstructions planifiées (Dependabot peut mettre à jour les lignes `FROM`) les tiennent à distance. Les changements dans les conteneurs en marche sont perdus au redémarrage suivant. Ce qui reste se juge selon le contexte : une bibliothèque vulnérable que l'application ne charge jamais est moins prioritaire.",
      "La mayoría de los hallazgos desaparecen con una base reciente o más ligera; las reconstrucciones programadas (Dependabot puede actualizar las líneas `FROM`) los mantienen a raya. Los cambios dentro de los contenedores en marcha se pierden en el siguiente reinicio. Lo que queda se juzga según el contexto: una biblioteca vulnerable que la aplicación nunca carga es menos prioritaria.",
    ],
  },
];

const strategiesAdvanced: DeployQuestion[] = [
  {
    id: "dp-strategies-21",
    q: ["A column `name` must become `full_name` with no downtime. What is the expand/contract order?", "Une colonne `name` doit devenir `full_name` sans interruption. Quel est l'ordre expand/contract ?", "Una columna `name` debe pasar a `full_name` sin interrupción. ¿Cuál es el orden expand/contract?"],
    a: ["Add `full_name`, write both and backfill, switch reads to `full_name`, stop writing `name`, then drop it", "Ajouter `full_name`, écrire les deux et remplir l'existant, passer les lectures sur `full_name`, cesser d'écrire `name`, puis la supprimer", "Añadir `full_name`, escribir ambas y rellenar lo existente, pasar las lecturas a `full_name`, dejar de escribir `name` y después borrarla"],
    w: [["Rename the column, then deploy the new code", "Renommer la colonne, puis déployer le nouveau code", "Renombrar la columna y luego desplegar el código nuevo"], ["Deploy the new code, then rename the column", "Déployer le nouveau code, puis renommer la colonne", "Desplegar el código nuevo y luego renombrar la columna"], ["Stop the service, rename, restart", "Arrêter le service, renommer, redémarrer", "Parar el servicio, renombrar y reiniciar"]],
    e: [
      "Each step is compatible with the code running before and after it, so every deploy can roll back. A direct rename breaks whichever version runs against the wrong schema during the rollout. It takes several releases; the reward is never needing a maintenance window.",
      "Chaque étape est compatible avec le code qui tourne avant et après elle, donc chaque déploiement peut revenir en arrière. Un renommage direct casse la version qui tourne contre le mauvais schéma pendant le déploiement. Cela prend plusieurs versions ; la récompense est de ne jamais avoir besoin d'une fenêtre de maintenance.",
      "Cada paso es compatible con el código que corre antes y después, así que cada despliegue puede volver atrás. Un cambio de nombre directo rompe la versión que corre contra el esquema equivocado durante el despliegue. Lleva varias versiones; la recompensa es no necesitar nunca una ventana de mantenimiento.",
    ],
  },
  {
    id: "dp-strategies-22",
    q: ["When is rolling forward better than rolling back?", "Quand est-il préférable de corriger en avant (roll forward) plutôt que de revenir en arrière ?", "¿Cuándo es mejor corregir hacia delante (roll forward) que volver atrás?"],
    a: ["When the release changed data in a way the old version cannot handle, and a small fix can ship quickly through the normal pipeline", "Quand la version a changé les données d'une façon que l'ancienne ne sait pas gérer, et qu'une petite correction peut partir vite par le pipeline normal", "Cuando la versión cambió los datos de forma que la antigua no puede manejar, y una corrección pequeña puede salir rápido por el pipeline normal"],
    w: [["Always: rolling back is never safe", "Toujours : revenir en arrière n'est jamais sûr", "Siempre: volver atrás nunca es seguro"], ["When nobody knows what changed", "Quand personne ne sait ce qui a changé", "Cuando nadie sabe qué cambió"], ["When the pipeline is broken", "Quand le pipeline est cassé", "Cuando el pipeline está roto"]],
    e: [
      "Rollback is the default when the cause is unclear: it restores a known state fast. But if the new version already migrated or wrote data the old one misreads, going back can make things worse, and a targeted fix is safer. Fast, reliable pipelines make rolling forward a real option.",
      "Le retour arrière est le défaut quand la cause n'est pas claire : il rétablit vite un état connu. Mais si la nouvelle version a déjà migré ou écrit des données que l'ancienne lit mal, revenir peut aggraver les choses, et une correction ciblée est plus sûre. Des pipelines rapides et fiables font de la correction en avant une vraie option.",
      "Volver atrás es lo normal cuando la causa no está clara: restablece rápido un estado conocido. Pero si la nueva versión ya migró o escribió datos que la antigua lee mal, volver puede empeorar las cosas, y una corrección concreta es más segura. Unos pipelines rápidos y fiables hacen de corregir hacia delante una opción real.",
    ],
  },
  {
    id: "dp-strategies-23",
    q: ["What does automated canary analysis compare?", "Que compare l'analyse automatique d'un canary ?", "¿Qué compara el análisis automático de un canary?"],
    a: ["The canary's metrics, such as error rate and latency, against a baseline running the old version over the same period", "Les métriques du canary, comme le taux d'erreurs et la latence, à celles d'une référence qui fait tourner l'ancienne version sur la même période", "Las métricas del canary, como tasa de errores y latencia, con las de una referencia que ejecuta la versión antigua en el mismo periodo"],
    w: [["The canary's code against the old code", "Le code du canary à l'ancien code", "El código del canary con el antiguo"], ["The number of users before and after the release", "Le nombre d'utilisateurs avant et après la version", "El número de usuarios antes y después de la versión"], ["The image sizes of both versions", "La taille des images des deux versions", "El tamaño de las imágenes de ambas versiones"]],
    e: [
      "Comparing with a baseline at the same time removes daily patterns and incidents affecting everyone. Tools such as Argo Rollouts, Flagger or Spinnaker's Kayenta run statistical tests and promote or abort the canary automatically, so a person need not watch dashboards during each release.",
      "Comparer avec une référence au même moment élimine les rythmes de la journée et les incidents qui touchent tout le monde. Des outils comme Argo Rollouts, Flagger ou Kayenta de Spinnaker font des tests statistiques et promeuvent ou abandonnent le canary automatiquement, donc personne n'a à surveiller des tableaux de bord à chaque version.",
      "Comparar con una referencia al mismo tiempo elimina los ritmos del día y los incidentes que afectan a todos. Herramientas como Argo Rollouts, Flagger o Kayenta de Spinnaker hacen pruebas estadísticas y promueven o abortan el canary automáticamente, así que nadie tiene que vigilar paneles en cada versión.",
    ],
  },
  {
    id: "dp-strategies-24",
    q: ["Why can a canary of 5 percent of requests mislead for a feature used by signed-in users over several requests?", "Pourquoi un canary de 5 pour cent des requêtes peut-il tromper pour une fonctionnalité utilisée par des utilisateurs connectés sur plusieurs requêtes ?", "¿Por qué un canary del 5 por ciento de las peticiones puede engañar en una función usada por usuarios conectados a lo largo de varias peticiones?"],
    a: ["A user may bounce between versions within one session; routing by user (sticky) gives each user one version", "Un utilisateur peut passer d'une version à l'autre dans une même session ; un routage par utilisateur (collant) donne à chacun une seule version", "Un usuario puede saltar entre versiones dentro de una sesión; un enrutamiento por usuario (persistente) da a cada uno una sola versión"],
    w: [["5 percent is always too small to measure", "5 pour cent est toujours trop peu pour mesurer", "El 5 por ciento siempre es demasiado poco para medir"], ["Signed-in users cannot reach a canary", "Les utilisateurs connectés ne peuvent pas atteindre un canary", "Los usuarios conectados no pueden llegar a un canary"], ["Requests cannot be split by percentage", "Les requêtes ne peuvent pas être partagées en pourcentage", "Las peticiones no se pueden repartir por porcentaje"]],
    e: [
      "Random per-request splitting can send page one to the new version and page two to the old, causing errors neither version has alone. Session affinity, or feature flags keyed on user ID, keep each user consistent and make a user-level percentage meaningful.",
      "Un partage aléatoire par requête peut envoyer la page un à la nouvelle version et la page deux à l'ancienne, causant des erreurs qu'aucune version n'a seule. L'affinité de session, ou des feature flags indexés sur l'identifiant de l'utilisateur, gardent chaque utilisateur cohérent et donnent un sens à un pourcentage d'utilisateurs.",
      "Un reparto aleatorio por petición puede mandar la página uno a la versión nueva y la dos a la antigua, causando errores que ninguna versión tiene por separado. La afinidad de sesión, o feature flags indexados por el identificador del usuario, mantienen coherente a cada usuario y dan sentido a un porcentaje de usuarios.",
    ],
  },
];

const operationsAdvanced: DeployQuestion[] = [
  {
    id: "dp-operations-21",
    q: ["What are the four DORA key metrics?", "Quelles sont les quatre métriques clés de DORA ?", "¿Cuáles son las cuatro métricas clave de DORA?"],
    a: ["Deployment frequency, lead time for changes, change failure rate and time to restore service", "La fréquence de déploiement, le délai des changements, le taux d'échec des changements et le temps de rétablissement du service", "La frecuencia de despliegue, el tiempo de entrega de cambios, la tasa de fallos de cambios y el tiempo de recuperación del servicio"],
    w: [["Lines of code, commits, pull requests and tickets closed", "Les lignes de code, commits, pull requests et tickets fermés", "Líneas de código, commits, pull requests y tickets cerrados"], ["CPU, memory, disk and network", "CPU, mémoire, disque et réseau", "CPU, memoria, disco y red"], ["Uptime, latency, cost and users", "Disponibilité, latence, coût et utilisateurs", "Disponibilidad, latencia, coste y usuarios"]],
    e: [
      "Two measure throughput (how often, how fast from commit to production), two measure stability (how often a change causes a failure, how fast you recover). The research behind them found that high performers are good at both at once. Counting commits or lines measures activity, not outcomes.",
      "Deux mesurent le débit (à quelle fréquence, à quelle vitesse du commit à la production), deux la stabilité (à quelle fréquence un changement cause une panne, à quelle vitesse on se rétablit). La recherche derrière elles a montré que les meilleures équipes sont bonnes aux deux à la fois. Compter commits ou lignes mesure l'activité, pas les résultats.",
      "Dos miden el rendimiento (con qué frecuencia y a qué velocidad del commit a producción) y dos la estabilidad (con qué frecuencia un cambio causa un fallo y a qué velocidad te recuperas). La investigación detrás encontró que los mejores equipos son buenos en ambas cosas a la vez. Contar commits o líneas mide actividad, no resultados.",
    ],
  },
  {
    id: "dp-operations-22",
    q: ["What makes a postmortem blameless?", "Qu'est-ce qui rend un post-mortem sans reproche (blameless) ?", "¿Qué hace que un post mortem sea sin culpables (blameless)?"],
    a: ["It asks how the system let a reasonable action cause harm, and fixes the system, rather than who made the mistake", "Il demande comment le système a permis qu'une action raisonnable fasse du mal, et corrige le système, plutôt que qui s'est trompé", "Pregunta cómo permitió el sistema que una acción razonable causara daño y arregla el sistema, en vez de quién se equivocó"],
    w: [["It is written without naming the service", "Il est écrit sans nommer le service", "Se escribe sin nombrar el servicio"], ["Nobody is allowed to read it", "Personne n'a le droit de le lire", "Nadie puede leerlo"], ["It is only written when nobody made a mistake", "Il n'est écrit que quand personne ne s'est trompé", "Solo se escribe cuando nadie se equivocó"]],
    e: [
      "People who fear blame hide details, and the same failure returns. A blameless review gathers a timeline, contributing causes and action items with owners: a missing guard, a confusing tool, an alert that did not fire. Its value comes from the follow-up actually being done.",
      "Les gens qui craignent le reproche cachent des détails, et la même panne revient. Une revue sans reproche réunit une chronologie, les causes contributives et des actions avec des responsables : une protection manquante, un outil déroutant, une alerte qui n'a pas sonné. Sa valeur vient de ce que les suites soient vraiment faites.",
      "Quien teme la culpa oculta detalles, y el mismo fallo vuelve. Una revisión sin culpables reúne una cronología, las causas que contribuyeron y acciones con responsables: una protección que faltaba, una herramienta confusa, una alerta que no saltó. Su valor depende de que el seguimiento se haga de verdad.",
    ],
  },
  {
    id: "dp-operations-23",
    q: ["During an incident, what does the incident commander do?", "Pendant un incident, que fait le responsable d'incident (incident commander) ?", "Durante un incidente, ¿qué hace el responsable del incidente (incident commander)?"],
    a: ["Coordinates: sets priorities, assigns roles and keeps communication flowing, usually without debugging personally", "Il coordonne : fixe les priorités, attribue les rôles et fait circuler la communication, en général sans déboguer lui-même", "Coordina: fija las prioridades, asigna los roles y mantiene la comunicación, normalmente sin depurar personalmente"],
    w: [["Fixes the bug alone as fast as possible", "Corrige le bug seul le plus vite possible", "Corrige el error solo lo más rápido posible"], ["Writes the press release", "Rédige le communiqué de presse", "Redacta el comunicado de prensa"], ["Decides who is to blame", "Décide qui est fautif", "Decide quién tiene la culpa"]],
    e: [
      "Separating coordination from hands-on work avoids everyone debugging the same thing while nobody updates users. Typical roles: commander, operations lead, communications lead, scribe. Mitigation first (rollback, failover), root cause later.",
      "Séparer la coordination du travail technique évite que tout le monde débogue la même chose pendant que personne n'informe les utilisateurs. Rôles typiques : responsable, responsable des opérations, responsable de la communication, scribe. L'atténuation d'abord (retour arrière, bascule), la cause racine ensuite.",
      "Separar la coordinación del trabajo técnico evita que todos depuren lo mismo mientras nadie informa a los usuarios. Roles típicos: responsable, responsable de operaciones, responsable de comunicación, escriba. Primero mitigar (volver atrás, conmutar) y después la causa raíz.",
    ],
  },
  {
    id: "dp-operations-24",
    q: ["How should a service on Cloud Run get its database password?", "Comment un service sur Cloud Run doit-il obtenir le mot de passe de sa base de données ?", "¿Cómo debe obtener un servicio en Cloud Run la contraseña de su base de datos?"],
    a: ["From Secret Manager, mounted as an environment variable or file, with access granted to the service's own service account", "Depuis Secret Manager, monté comme variable d'environnement ou fichier, avec un accès accordé au compte de service propre au service", "Desde Secret Manager, montado como variable de entorno o archivo, con acceso concedido a la cuenta de servicio propia del servicio"],
    w: [["Baked into the container image", "Intégré dans l'image du conteneur", "Integrada en la imagen del contenedor"], ["Typed in by an operator at each start", "Tapé par un opérateur à chaque démarrage", "Tecleada por un operador en cada arranque"], ["Stored in the Git repository, encrypted with base64", "Stocké dans le dépôt Git, chiffré en base64", "Guardada en el repositorio Git, cifrada en base64"]],
    e: [
      "A secret manager stores versions, controls access per identity, logs reads and allows rotation without rebuilding. Anything in an image is readable by whoever can pull it. Pinning a secret version, or using `latest` with a restart policy, is a choice to make deliberately when rotating.",
      "Un gestionnaire de secrets garde des versions, contrôle l'accès par identité, journalise les lectures et permet la rotation sans reconstruire. Tout ce qui est dans une image est lisible par quiconque peut la tirer. Fixer une version de secret, ou utiliser `latest` avec une politique de redémarrage, est un choix à faire délibérément lors des rotations.",
      "Un gestor de secretos guarda versiones, controla el acceso por identidad, registra las lecturas y permite rotar sin reconstruir. Todo lo que hay en una imagen lo puede leer quien pueda descargarla. Fijar una versión del secreto, o usar `latest` con una política de reinicio, es una decisión que tomar a conciencia al rotar.",
    ],
  },
];

const iacAdvanced: DeployQuestion[] = [
  {
    id: "dp-iac-21",
    q: ["What do Pulumi and the AWS CDK do differently from Terraform's HCL?", "Que font Pulumi et l'AWS CDK différemment du HCL de Terraform ?", "¿Qué hacen Pulumi y el AWS CDK de forma distinta al HCL de Terraform?"],
    a: ["Infrastructure is written in general-purpose languages such as TypeScript or Python, with loops, functions and tests", "L'infrastructure s'écrit dans des langages généralistes comme TypeScript ou Python, avec boucles, fonctions et tests", "La infraestructura se escribe en lenguajes de propósito general como TypeScript o Python, con bucles, funciones y pruebas"],
    w: [["They are imperative scripts that run cloud commands one by one", "Ce sont des scripts impératifs qui lancent des commandes cloud une à une", "Son scripts imperativos que lanzan órdenes de la nube una a una"], ["They configure software inside servers", "Ils configurent les logiciels dans les serveurs", "Configuran el software dentro de los servidores"], ["They need no state", "Ils n'ont pas besoin d'état", "No necesitan estado"]],
    e: [
      "The program builds a desired-state graph that an engine applies declaratively; Pulumi keeps state like Terraform, the CDK synthesizes CloudFormation templates. Real languages bring abstraction and IDE support, and also the risk of over-clever infrastructure that is hard to review.",
      "Le programme construit un graphe d'état voulu qu'un moteur applique de façon déclarative ; Pulumi garde un état comme Terraform, le CDK synthétise des modèles CloudFormation. Les vrais langages apportent abstraction et aide de l'éditeur, et aussi le risque d'une infrastructure trop astucieuse, difficile à relire.",
      "El programa construye un grafo de estado deseado que un motor aplica de forma declarativa; Pulumi guarda estado como Terraform y el CDK sintetiza plantillas de CloudFormation. Los lenguajes de verdad aportan abstracción y ayuda del editor, y también el riesgo de una infraestructura demasiado ingeniosa, difícil de revisar.",
    ],
  },
  {
    id: "dp-iac-22",
    q: ["What is Crossplane?", "Qu'est-ce que Crossplane ?", "¿Qué es Crossplane?"],
    a: ["A Kubernetes extension that manages cloud resources as Kubernetes objects, reconciled continuously by controllers", "Une extension de Kubernetes qui gère les ressources cloud comme des objets Kubernetes, réconciliés en continu par des contrôleurs", "Una extensión de Kubernetes que gestiona los recursos de la nube como objetos de Kubernetes, reconciliados continuamente por controladores"],
    w: [["A Terraform provider for Kubernetes", "Un fournisseur Terraform pour Kubernetes", "Un proveedor de Terraform para Kubernetes"], ["A container registry", "Un registre de conteneurs", "Un registro de contenedores"], ["A CI service", "Un service de CI", "Un servicio de CI"]],
    e: [
      "A bucket or database becomes a custom resource applied with `kubectl` or GitOps; controllers create it and keep correcting drift, unlike Terraform, which acts only when run. Compositions let platform teams offer simple abstractions (a Postgres claim) over many cloud resources.",
      "Un bucket ou une base de données devient une ressource personnalisée appliquée avec `kubectl` ou en GitOps ; des contrôleurs la créent et corrigent sans cesse la dérive, contrairement à Terraform, qui n'agit que lorsqu'on le lance. Les compositions permettent aux équipes plateforme d'offrir des abstractions simples (une demande Postgres) sur de nombreuses ressources cloud.",
      "Un bucket o una base de datos pasa a ser un recurso personalizado aplicado con `kubectl` o con GitOps; unos controladores lo crean y corrigen sin parar la deriva, a diferencia de Terraform, que solo actúa cuando se ejecuta. Las composiciones permiten a los equipos de plataforma ofrecer abstracciones sencillas (una petición de Postgres) sobre muchos recursos de la nube.",
    ],
  },
  {
    id: "dp-iac-23",
    q: ["What does policy as code, with a tool such as OPA or Sentinel, add to infrastructure pipelines?", "Qu'ajoute la policy as code, avec un outil comme OPA ou Sentinel, aux pipelines d'infrastructure ?", "¿Qué añade la policy as code, con una herramienta como OPA o Sentinel, a los pipelines de infraestructura?"],
    a: ["Rules checked automatically against each plan, such as no public buckets or required labels, blocking violations before apply", "Des règles vérifiées automatiquement sur chaque plan, comme pas de bucket public ou des labels obligatoires, qui bloquent les violations avant apply", "Reglas comprobadas automáticamente en cada plan, como ningún bucket público o etiquetas obligatorias, que bloquean las infracciones antes de apply"],
    w: [["A faster way to apply plans", "Une manière plus rapide d'appliquer les plans", "Una forma más rápida de aplicar los planes"], ["A replacement for code review", "Un remplacement de la revue de code", "Un sustituto de la revisión de código"], ["Automatic cost reductions", "Des réductions de coût automatiques", "Reducciones de coste automáticas"]],
    e: [
      "Rules written as code (Rego for OPA and Conftest, Sentinel for HCP Terraform) evaluate the plan's JSON and fail the pipeline on a violation. Reviewers then focus on intent while routine guardrails are enforced consistently. Cloud organization policies enforce similar rules at the API level.",
      "Des règles écrites en code (Rego pour OPA et Conftest, Sentinel pour HCP Terraform) évaluent le JSON du plan et font échouer le pipeline en cas de violation. Les relecteurs se concentrent alors sur l'intention, et les garde-fous courants s'appliquent uniformément. Les politiques d'organisation des clouds imposent des règles semblables au niveau de l'API.",
      "Reglas escritas como código (Rego para OPA y Conftest, Sentinel para HCP Terraform) evalúan el JSON del plan y hacen fallar el pipeline si hay una infracción. Los revisores se centran entonces en la intención, y las barreras habituales se aplican de manera uniforme. Las políticas de organización de las nubes imponen reglas parecidas a nivel de API.",
    ],
  },
  {
    id: "dp-iac-24",
    q: ["How should infrastructure code for dev, staging and production usually be organized?", "Comment organiser en général le code d'infrastructure pour dev, staging et production ?", "¿Cómo se suele organizar el código de infraestructura para dev, staging y producción?"],
    a: ["Shared modules, one small root configuration per environment with its own variables and its own state", "Des modules partagés, une petite configuration racine par environnement avec ses variables et son état propres", "Módulos compartidos y una pequeña configuración raíz por entorno, con sus propias variables y su propio estado"],
    w: [["One state file for all environments, to keep them in sync", "Un seul fichier d'état pour tous les environnements, pour les garder synchronisés", "Un solo archivo de estado para todos los entornos, para mantenerlos sincronizados"], ["A full copy of every file per environment, edited by hand", "Une copie complète de chaque fichier par environnement, modifiée à la main", "Una copia completa de cada archivo por entorno, editada a mano"], ["Production only in code, the others by hand", "Seulement la production en code, les autres à la main", "Solo producción en código y los demás a mano"]],
    e: [
      "Separate states keep a mistake in dev from touching production and allow different access per environment. Shared modules keep the environments alike, and differences are explicit variables (sizes, counts). Terraform workspaces share one configuration and backend, which suits identical copies more than real environments.",
      "Des états séparés évitent qu'une erreur en dev touche la production et permettent des accès différents par environnement. Les modules partagés gardent les environnements semblables, et les différences sont des variables explicites (tailles, nombres). Les workspaces Terraform partagent une configuration et un backend, ce qui convient plus à des copies identiques qu'à de vrais environnements.",
      "Estados separados evitan que un error en dev toque producción y permiten accesos distintos por entorno. Los módulos compartidos mantienen parecidos los entornos, y las diferencias son variables explícitas (tamaños, cantidades). Los workspaces de Terraform comparten una configuración y un backend, lo que va mejor con copias idénticas que con entornos reales.",
    ],
  },
];

const terraformAdvanced: DeployQuestion[] = [
  {
    id: "dp-terraform-21",
    q: ["A production database must never be destroyed by mistake. Which `lifecycle` setting helps?", "Une base de données de production ne doit jamais être détruite par erreur. Quel réglage `lifecycle` aide ?", "Una base de datos de producción nunca debe destruirse por error. ¿Qué ajuste de `lifecycle` ayuda?"],
    a: ["`prevent_destroy = true`: any plan that would destroy it fails", "`prevent_destroy = true` : tout plan qui la détruirait échoue", "`prevent_destroy = true`: cualquier plan que la destruyera falla"],
    w: [["`ignore_changes = all`", "`ignore_changes = all`", "`ignore_changes = all`"], ["`create_before_destroy = true`", "`create_before_destroy = true`", "`create_before_destroy = true`"], ["`depends_on = []`", "`depends_on = []`", "`depends_on = []`"]],
    e: [
      "`prevent_destroy` makes Terraform refuse, including for replacements caused by changing an immutable argument; removing the block from the code removes the protection, so pair it with the provider's deletion protection on the resource itself. `create_before_destroy` changes the order of a replacement; `ignore_changes` stops Terraform from reverting chosen attributes.",
      "`prevent_destroy` fait refuser Terraform, y compris pour les remplacements causés par le changement d'un argument immuable ; retirer le bloc du code retire la protection, donc associe-le à la protection contre la suppression du fournisseur sur la ressource elle-même. `create_before_destroy` change l'ordre d'un remplacement ; `ignore_changes` empêche Terraform de rétablir certains attributs.",
      "`prevent_destroy` hace que Terraform se niegue, incluso a reemplazos causados por cambiar un argumento inmutable; quitar el bloque del código quita la protección, así que combínalo con la protección contra borrado del proveedor en el propio recurso. `create_before_destroy` cambia el orden de un reemplazo; `ignore_changes` impide que Terraform restablezca los atributos elegidos.",
    ],
  },
  {
    id: "dp-terraform-22",
    q: ["A bucket was created by hand and must now be managed by Terraform. What is the modern way?", "Un bucket a été créé à la main et doit maintenant être géré par Terraform. Quelle est la manière moderne ?", "Un bucket se creó a mano y ahora debe gestionarlo Terraform. ¿Cuál es la forma moderna?"],
    a: ["An `import` block with its ID and target address, reviewed in a plan, then applied", "Un bloc `import` avec son identifiant et l'adresse cible, relu dans un plan, puis appliqué", "Un bloque `import` con su identificador y la dirección de destino, revisado en un plan y luego aplicado"],
    w: [["Delete it and let Terraform create it again", "Le supprimer et laisser Terraform le recréer", "Borrarlo y dejar que Terraform lo vuelva a crear"], ["Edit the state file by hand", "Modifier le fichier d'état à la main", "Editar a mano el archivo de estado"], ["Add the resource block; Terraform finds it by name", "Ajouter le bloc de ressource ; Terraform le trouve par son nom", "Añadir el bloque del recurso; Terraform lo encuentra por su nombre"]],
    e: [
      "Since Terraform 1.5, `import { to = google_storage_bucket.assets  id = \"acme-assets\" }` is part of the configuration: the plan shows the import, and `terraform plan -generate-config-out=gen.tf` can draft the resource block. Without it, a new resource block would try to create a bucket that already exists.",
      "Depuis Terraform 1.5, `import { to = google_storage_bucket.assets  id = \"acme-assets\" }` fait partie de la configuration : le plan montre l'import, et `terraform plan -generate-config-out=gen.tf` peut ébaucher le bloc de ressource. Sans lui, un nouveau bloc de ressource essaierait de créer un bucket qui existe déjà.",
      "Desde Terraform 1.5, `import { to = google_storage_bucket.assets  id = \"acme-assets\" }` forma parte de la configuración: el plan muestra la importación y `terraform plan -generate-config-out=gen.tf` puede esbozar el bloque del recurso. Sin él, un bloque de recurso nuevo intentaría crear un bucket que ya existe.",
    ],
  },
  {
    id: "dp-terraform-23",
    q: ["You rename `google_compute_instance.web` to `google_compute_instance.frontend` in the code. How do you avoid destroying and recreating it?", "Tu renommes `google_compute_instance.web` en `google_compute_instance.frontend` dans le code. Comment éviter de la détruire et la recréer ?", "Cambias el nombre de `google_compute_instance.web` a `google_compute_instance.frontend` en el código. ¿Cómo evitas destruirla y recrearla?"],
    a: ["A `moved` block from the old address to the new one", "Un bloc `moved` de l'ancienne adresse vers la nouvelle", "Un bloque `moved` de la dirección antigua a la nueva"],
    w: [["A `depends_on` between the two names", "Un `depends_on` entre les deux noms", "Un `depends_on` entre los dos nombres"], ["`terraform apply -refresh-only`", "`terraform apply -refresh-only`", "`terraform apply -refresh-only`"], ["Nothing: Terraform detects renames", "Rien : Terraform détecte les renommages", "Nada: Terraform detecta los cambios de nombre"]],
    e: [
      "Terraform tracks objects by address; a new address looks like one resource removed and another added. `moved { from = google_compute_instance.web  to = google_compute_instance.frontend }` tells it they are the same object, and the plan shows a move with no change. It also works when moving resources into modules.",
      "Terraform suit les objets par adresse ; une nouvelle adresse ressemble à une ressource retirée et une autre ajoutée. `moved { from = google_compute_instance.web  to = google_compute_instance.frontend }` lui dit que c'est le même objet, et le plan montre un déplacement sans changement. Cela marche aussi pour déplacer des ressources dans des modules.",
      "Terraform sigue los objetos por dirección; una dirección nueva parece un recurso quitado y otro añadido. `moved { from = google_compute_instance.web  to = google_compute_instance.frontend }` le dice que son el mismo objeto, y el plan muestra un movimiento sin cambios. También sirve para mover recursos a módulos.",
    ],
  },
  {
    id: "dp-terraform-24",
    q: ["A variable holds a database password. What does `sensitive = true` do, and not do?", "Une variable contient un mot de passe de base de données. Que fait `sensitive = true`, et que ne fait-il pas ?", "Una variable contiene una contraseña de base de datos. ¿Qué hace `sensitive = true` y qué no hace?"],
    a: ["It hides the value in plan and apply output, but the value is still stored in the state", "Il cache la valeur dans la sortie de plan et d'apply, mais la valeur reste stockée dans l'état", "Oculta el valor en la salida de plan y apply, pero el valor se sigue guardando en el estado"],
    w: [["It encrypts the value in the state", "Il chiffre la valeur dans l'état", "Cifra el valor en el estado"], ["It sends the value to a secret manager", "Il envoie la valeur à un gestionnaire de secrets", "Envía el valor a un gestor de secretos"], ["It stops the value from being used by resources", "Il empêche les ressources d'utiliser la valeur", "Impide que los recursos usen el valor"]],
    e: [
      "Sensitive values are redacted in the console, which prevents leaks into CI logs, but resource attributes land in state in plain text. Protect the state backend (access control, encryption), or keep secrets out of Terraform: generate them in a secret manager, or use ephemeral values and write-only arguments in recent versions.",
      "Les valeurs sensibles sont masquées dans la console, ce qui évite les fuites dans les journaux de CI, mais les attributs des ressources arrivent en clair dans l'état. Protège le backend de l'état (contrôle d'accès, chiffrement), ou garde les secrets hors de Terraform : génère-les dans un gestionnaire de secrets, ou utilise les valeurs éphémères et les arguments en écriture seule des versions récentes.",
      "Los valores sensibles se ocultan en la consola, lo que evita fugas en los registros de CI, pero los atributos de los recursos llegan en claro al estado. Protege el backend del estado (control de acceso, cifrado) o deja los secretos fuera de Terraform: genéralos en un gestor de secretos, o usa los valores efímeros y los argumentos de solo escritura de las versiones recientes.",
    ],
  },
];

const kubernetesAdvanced: DeployQuestion[] = [
  {
    id: "dp-kubernetes-21",
    q: ["What does a HorizontalPodAutoscaler do?", "Que fait un HorizontalPodAutoscaler ?", "¿Qué hace un HorizontalPodAutoscaler?"],
    a: ["It changes a Deployment's number of replicas to keep a metric, such as average CPU, near a target", "Il change le nombre de réplicas d'un Deployment pour garder une métrique, comme le CPU moyen, près d'une cible", "Cambia el número de réplicas de un Deployment para mantener una métrica, como la CPU media, cerca de un objetivo"],
    w: [["It gives each Pod more CPU when busy", "Il donne plus de CPU à chaque Pod quand il est occupé", "Da más CPU a cada Pod cuando está ocupado"], ["It adds nodes to the cluster", "Il ajoute des nœuds au cluster", "Añade nodos al clúster"], ["It moves Pods to quieter nodes", "Il déplace les Pods vers des nœuds plus calmes", "Mueve los Pods a nodos más tranquilos"]],
    e: [
      "With a target of 70 percent CPU and Pods averaging 140 percent of their request, it roughly doubles the replicas, within `minReplicas` and `maxReplicas`. CPU percentages are relative to requests, so requests must be set. Adding nodes is the cluster autoscaler's job; resizing Pods is the vertical autoscaler's.",
      "Avec une cible de 70 pour cent de CPU et des Pods en moyenne à 140 pour cent de leur demande, il double à peu près les réplicas, entre `minReplicas` et `maxReplicas`. Les pourcentages de CPU sont relatifs aux demandes, qui doivent donc être réglées. Ajouter des nœuds est le travail du cluster autoscaler ; redimensionner les Pods, celui de l'autoscaler vertical.",
      "Con un objetivo del 70 por ciento de CPU y Pods de media al 140 por ciento de su petición, duplica más o menos las réplicas, entre `minReplicas` y `maxReplicas`. Los porcentajes de CPU son relativos a las peticiones, que por tanto hay que fijar. Añadir nodos es tarea del cluster autoscaler; redimensionar los Pods, del autoescalador vertical.",
    ],
  },
  {
    id: "dp-kubernetes-22",
    q: ["What is the difference between Helm and Kustomize?", "Quelle est la différence entre Helm et Kustomize ?", "¿Qué diferencia hay entre Helm y Kustomize?"],
    a: ["Helm renders templates with values into packaged charts with releases; Kustomize patches plain YAML with overlays, without templates", "Helm rend des modèles avec des valeurs en charts empaquetés, avec des releases ; Kustomize applique des patchs à du YAML simple par des overlays, sans modèles", "Helm renderiza plantillas con valores en charts empaquetados, con releases; Kustomize aplica parches a YAML simple mediante overlays, sin plantillas"],
    w: [["Helm is for networking, Kustomize for storage", "Helm est pour le réseau, Kustomize pour le stockage", "Helm es para red y Kustomize para almacenamiento"], ["Kustomize installs clusters, Helm installs nodes", "Kustomize installe des clusters, Helm des nœuds", "Kustomize instala clústeres y Helm nodos"], ["They are two names for the same tool", "Ce sont deux noms pour le même outil", "Son dos nombres para la misma herramienta"]],
    e: [
      "Helm suits distributing software to others (`helm install` a database chart with your values) and tracks release history. Kustomize, built into `kubectl apply -k`, keeps a base and per-environment overlays readable as YAML. Many teams use charts from others and Kustomize for their own manifests.",
      "Helm convient pour distribuer un logiciel à d'autres (`helm install` d'un chart de base de données avec tes valeurs) et suit l'historique des releases. Kustomize, intégré à `kubectl apply -k`, garde une base et des overlays par environnement lisibles en YAML. Beaucoup d'équipes utilisent les charts des autres et Kustomize pour leurs propres manifestes.",
      "Helm va bien para distribuir software a otros (`helm install` de un chart de base de datos con tus valores) y sigue el historial de las releases. Kustomize, integrado en `kubectl apply -k`, mantiene legibles en YAML una base y overlays por entorno. Muchos equipos usan los charts de otros y Kustomize para sus propios manifiestos.",
    ],
  },
  {
    id: "dp-kubernetes-23",
    q: ["Why set a PodDisruptionBudget on a Deployment of 3 replicas?", "Pourquoi régler un PodDisruptionBudget sur un Deployment de 3 réplicas ?", "¿Por qué fijar un PodDisruptionBudget en un Deployment de 3 réplicas?"],
    a: ["So that voluntary disruptions such as node upgrades never take down more Pods than the budget allows at once", "Pour que les interruptions volontaires comme les mises à jour de nœuds n'arrêtent jamais plus de Pods à la fois que le budget ne le permet", "Para que las interrupciones voluntarias, como las actualizaciones de nodos, nunca paren más Pods a la vez de los que permite el presupuesto"],
    w: [["To limit how much the Pods cost", "Pour limiter le coût des Pods", "Para limitar lo que cuestan los Pods"], ["To stop Pods from crashing", "Pour empêcher les Pods de planter", "Para impedir que los Pods fallen"], ["To limit the number of deploys per day", "Pour limiter le nombre de déploiements par jour", "Para limitar el número de despliegues al día"]],
    e: [
      "`minAvailable: 2` lets node drains evict Pods only while 2 stay ready, so a cluster upgrade proceeds node by node without an outage. It does not protect against crashes or node failures (involuntary disruptions); spreading replicas across nodes and zones does that.",
      "`minAvailable: 2` ne laisse les vidages de nœuds évincer des Pods que tant que 2 restent prêts, donc une mise à jour du cluster avance nœud par nœud sans interruption. Cela ne protège pas des plantages ni des pannes de nœud (interruptions involontaires) ; répartir les réplicas sur des nœuds et des zones le fait.",
      "`minAvailable: 2` solo deja que los vaciados de nodos desalojen Pods mientras sigan listos 2, así que una actualización del clúster avanza nodo a nodo sin interrupción. No protege de caídas ni fallos de nodo (interrupciones involuntarias); repartir las réplicas entre nodos y zonas sí.",
    ],
  },
  {
    id: "dp-kubernetes-24",
    q: ["On GKE, how should a Pod call Google Cloud APIs without a key file?", "Sur GKE, comment un Pod doit-il appeler les API de Google Cloud sans fichier de clé ?", "En GKE, ¿cómo debe llamar un Pod a las API de Google Cloud sin archivo de clave?"],
    a: ["With Workload Identity: its Kubernetes service account is granted IAM roles, and Google credentials are issued to it automatically", "Avec Workload Identity : son compte de service Kubernetes reçoit des rôles IAM, et des identifiants Google lui sont délivrés automatiquement", "Con Workload Identity: a su cuenta de servicio de Kubernetes se le conceden roles de IAM y se le emiten credenciales de Google automáticamente"],
    w: [["By mounting a service account key as a Secret", "En montant une clé de compte de service comme Secret", "Montando una clave de cuenta de servicio como Secret"], ["By using the node's default credentials for everything", "En utilisant les identifiants par défaut du nœud pour tout", "Usando para todo las credenciales por defecto del nodo"], ["It cannot: Pods have no identity", "C'est impossible : les Pods n'ont pas d'identité", "No puede: los Pods no tienen identidad"]],
    e: [
      "Workload Identity Federation for GKE maps Kubernetes service accounts to IAM principals, so each workload gets only its own permissions and no long-lived key exists. Node credentials would give every Pod on the node the same, usually broad, access.",
      "La Workload Identity Federation for GKE associe les comptes de service Kubernetes à des principaux IAM, donc chaque charge de travail n'a que ses propres permissions et aucune clé durable n'existe. Les identifiants du nœud donneraient à chaque Pod du nœud le même accès, souvent large.",
      "La Workload Identity Federation for GKE asocia las cuentas de servicio de Kubernetes a principales de IAM, así que cada carga de trabajo tiene solo sus propios permisos y no existe ninguna clave duradera. Las credenciales del nodo darían a cada Pod del nodo el mismo acceso, normalmente amplio.",
    ],
  },
];

const gitopsAdvanced: DeployQuestion[] = [
  {
    id: "dp-gitops-21",
    q: ["In Argo CD, what is an Application?", "Dans Argo CD, qu'est-ce qu'une Application ?", "En Argo CD, ¿qué es una Application?"],
    a: ["A link between a source (repository, path, revision) and a destination (cluster, namespace), which Argo CD keeps in sync", "Un lien entre une source (dépôt, chemin, révision) et une destination (cluster, namespace), qu'Argo CD garde synchronisées", "Un vínculo entre un origen (repositorio, ruta, revisión) y un destino (clúster, namespace), que Argo CD mantiene sincronizados"],
    w: [["A container image built by Argo CD", "Une image de conteneur construite par Argo CD", "Una imagen de contenedor construida por Argo CD"], ["A user account in Argo CD", "Un compte utilisateur dans Argo CD", "Una cuenta de usuario en Argo CD"], ["A web page that Argo CD deploys", "Une page web qu'Argo CD déploie", "Una página web que despliega Argo CD"]],
    e: [
      "Each Application shows Synced or OutOfSync and Healthy or Degraded, with automated sync, pruning of removed objects and self-heal as options. ApplicationSets generate many Applications from a template, for example one per cluster or per folder.",
      "Chaque Application affiche Synced ou OutOfSync et Healthy ou Degraded, avec en options la synchronisation automatique, la suppression des objets retirés (prune) et l'auto-réparation. Les ApplicationSets génèrent de nombreuses Applications à partir d'un modèle, par exemple une par cluster ou par dossier.",
      "Cada Application muestra Synced u OutOfSync y Healthy o Degraded, con opciones de sincronización automática, poda de los objetos quitados (prune) y autorreparación. Los ApplicationSets generan muchas Applications a partir de una plantilla, por ejemplo una por clúster o por carpeta.",
    ],
  },
  {
    id: "dp-gitops-22",
    q: ["Secrets must live in the GitOps repository. Which approach keeps them safe?", "Les secrets doivent vivre dans le dépôt GitOps. Quelle approche les garde en sécurité ?", "Los secretos deben vivir en el repositorio GitOps. ¿Qué enfoque los mantiene seguros?"],
    a: ["Commit only encrypted secrets (SOPS, Sealed Secrets) or references that an operator resolves from a secret manager (External Secrets)", "Ne committer que des secrets chiffrés (SOPS, Sealed Secrets) ou des références qu'un opérateur résout depuis un gestionnaire de secrets (External Secrets)", "Confirmar solo secretos cifrados (SOPS, Sealed Secrets) o referencias que un operador resuelve desde un gestor de secretos (External Secrets)"],
    w: [["Commit Kubernetes Secrets: they are encrypted already", "Committer les Secrets Kubernetes : ils sont déjà chiffrés", "Confirmar los Secrets de Kubernetes: ya están cifrados"], ["Make the repository private and commit them in clear", "Rendre le dépôt privé et les committer en clair", "Hacer privado el repositorio y confirmarlos en claro"], ["Put them in the commit messages", "Les mettre dans les messages de commit", "Ponerlos en los mensajes de commit"]],
    e: [
      "Kubernetes Secrets are only base64. Sealed Secrets encrypts with a key held by a controller in the cluster; SOPS encrypts values with a cloud KMS key; External Secrets keeps only a pointer in Git and syncs the value from Secret Manager or Vault, which also makes rotation easy.",
      "Les Secrets Kubernetes ne sont que du base64. Sealed Secrets chiffre avec une clé détenue par un contrôleur du cluster ; SOPS chiffre les valeurs avec une clé de KMS cloud ; External Secrets ne garde qu'un pointeur dans Git et synchronise la valeur depuis Secret Manager ou Vault, ce qui facilite aussi la rotation.",
      "Los Secrets de Kubernetes son solo base64. Sealed Secrets cifra con una clave que guarda un controlador del clúster; SOPS cifra los valores con una clave de un KMS de la nube; External Secrets solo guarda un puntero en Git y sincroniza el valor desde Secret Manager o Vault, lo que además facilita la rotación.",
    ],
  },
  {
    id: "dp-gitops-23",
    q: ["In Argo CD, what are sync waves for?", "Dans Argo CD, à quoi servent les sync waves ?", "En Argo CD, ¿para qué sirven las sync waves?"],
    a: ["Ordering resources within a sync, such as a namespace and a migration job before the Deployment", "Ordonner les ressources dans une synchronisation, comme un namespace et un job de migration avant le Deployment", "Ordenar los recursos dentro de una sincronización, como un namespace y un job de migración antes del Deployment"],
    w: [["Spreading syncs across time zones", "Répartir les synchronisations entre fuseaux horaires", "Repartir las sincronizaciones entre zonas horarias"], ["Retrying failed syncs every hour", "Relancer les synchronisations échouées toutes les heures", "Reintentar cada hora las sincronizaciones fallidas"], ["Sending notifications to chat", "Envoyer des notifications dans une messagerie", "Enviar notificaciones a un chat"]],
    e: [
      "An annotation `argocd.argoproj.io/sync-wave` gives each resource a number; lower waves are applied and healthy before higher ones start. Hooks (PreSync, PostSync) run jobs at fixed points, for example a migration before rollout and a smoke test after.",
      "Une annotation `argocd.argoproj.io/sync-wave` donne un numéro à chaque ressource ; les vagues basses sont appliquées et saines avant que les plus hautes commencent. Les hooks (PreSync, PostSync) lancent des jobs à des moments fixes, par exemple une migration avant le déploiement et un test rapide après.",
      "Una anotación `argocd.argoproj.io/sync-wave` da un número a cada recurso; las olas bajas se aplican y están sanas antes de que empiecen las altas. Los hooks (PreSync, PostSync) lanzan jobs en momentos fijos, por ejemplo una migración antes del despliegue y una prueba rápida después.",
    ],
  },
  {
    id: "dp-gitops-24",
    q: ["How can new image versions reach the GitOps repository without a person editing tags?", "Comment les nouvelles versions d'image peuvent-elles arriver dans le dépôt GitOps sans qu'une personne modifie les tags ?", "¿Cómo pueden llegar las nuevas versiones de imagen al repositorio GitOps sin que una persona edite los tags?"],
    a: ["CI or an image automation tool (Flux image automation, Argo CD Image Updater) commits the new tag or opens a pull request", "La CI ou un outil d'automatisation des images (image automation de Flux, Argo CD Image Updater) committe le nouveau tag ou ouvre une pull request", "La CI o una herramienta de automatización de imágenes (image automation de Flux, Argo CD Image Updater) confirma el tag nuevo o abre una pull request"],
    w: [["The cluster pulls `latest` every minute", "Le cluster tire `latest` chaque minute", "El clúster descarga `latest` cada minuto"], ["Git updates the tags by itself", "Git met à jour les tags tout seul", "Git actualiza los tags solo"], ["It cannot: GitOps forbids automation", "C'est impossible : le GitOps interdit l'automatisation", "No puede: GitOps prohíbe la automatización"]],
    e: [
      "Pulling `latest` would break the principle that Git describes exactly what runs. Instead, a tool watches the registry and writes the new version into Git, directly for staging or as a pull request for production, so every change remains a commit.",
      "Tirer `latest` casserait le principe selon lequel Git décrit exactement ce qui tourne. À la place, un outil surveille le registre et écrit la nouvelle version dans Git, directement pour le staging ou par pull request pour la production, donc chaque changement reste un commit.",
      "Descargar `latest` rompería el principio de que Git describe exactamente lo que corre. En su lugar, una herramienta vigila el registro y escribe la versión nueva en Git, directamente para staging o mediante pull request para producción, así que cada cambio sigue siendo un commit.",
    ],
  },
];

export const pipeline = { pipelineAdvanced };
export const containers = { containersAdvanced };
export const strategies = { strategiesAdvanced };
export const operations = { operationsAdvanced };
export const iac = { iacAdvanced };
export const terraform = { terraformAdvanced };
export const kubernetes = { kubernetesAdvanced };
export const gitops = { gitopsAdvanced };
