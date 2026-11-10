# Sistemas de despliegue — un curso completo

## Cómo usar este curso

Este curso explica cómo va el software de un commit a producción y cómo sigue sano allí: pipelines y artefactos, contenedores, estrategias de puesta en producción, infraestructura como código con Terraform, Kubernetes, GitOps y plataformas gestionadas como Cloud Run, y la operación que lo mantiene todo en marcha. Describe las herramientas tal como están a finales de 2026, y da prioridad a los principios que duran más que una herramienta.

**Para quién.** Desarrolladores que entregan código y quieren entender qué pasa después de la fusión, y cualquiera que monte o revise un pipeline de entrega. Hace falta soltura con Git y un terminal; la parte 5 supone algo de vocabulario de nube (proyectos, regiones, cuentas de servicio).

**Organización.** Ocho partes en dos bloques:

| Bloque | Partes | Qué sabes hacer después |
|---|---|---|
| Los fundamentos | 1 Pipelines y artefactos · 2 Contenedores · 3 Estrategias de puesta en producción | Construir una vez, entregar sin riesgo, volver atrás en segundos |
| Herramientas y operación | 4 Infraestructura como código · 5 Terraform y OpenTofu · 6 Kubernetes · 7 GitOps y plataformas gestionadas · 8 Operación | Describir la infraestructura en código, ejecutarla en Kubernetes o Cloud Run y mantenerla fiable |

Cada parte termina con lo que hay que recordar. Los ejercicios del final dan una tarea por parte, con respuestas.

**Con Luma.** El test *🚀 Déploiement* del grupo *Informatique* de Luma sigue los mismos temas en cuatro niveles (Principiante a Experto), con 128 preguntas redactadas. El propio Luma se despliega como describe la parte 7: una imagen construida por GitHub Actions, las migraciones en un job aparte y una revisión sin tráfico con un tag en Cloud Run, probada antes de que pase el tráfico.

**Qué necesitas.** Docker o Podman para la parte 2; Terraform u OpenTofu y una cuenta en la nube (basta una oferta gratuita) para la parte 5; para la parte 6, un clúster local como kind o minikube.

## Parte 1 — Pipelines y artefactos

### CI, entrega continua, despliegue continuo

- La **integración continua** fusiona a menudo cambios pequeños, cada uno construido y probado automáticamente.
- La **entrega continua** mantiene el resultado siempre publicable; una persona decide cuándo enviarlo.
- El **despliegue continuo** envía cada cambio que pasa el pipeline, con comprobaciones automáticas y despliegue progresivo como control.

El objetivo es siempre el mismo: cambios pequeños, respuesta rápida y puestas en producción que son rutina y no acontecimientos.

### Construir una vez, desplegar en todas partes

El pipeline convierte un commit en **artefacto** una sola vez (una imagen de contenedor, un paquete, un binario), lo guarda en un registro con una versión o un digest y despliega ese mismo artefacto en cada entorno. Reconstruir para producción podría traer otras dependencias y enviar algo que nadie probó.

Lo que cambia entre entornos es la **configuración**, leída del entorno en tiempo de ejecución: una variable de entorno como `DATABASE_URL`, y los secretos de un gestor de secretos. Es la regla twelve-factor de la configuración en el entorno.

Nombra los artefactos por lo que son, no por dónde están: una versión (`1.4.0`) o el SHA del commit, más el digest para las máquinas. `latest` no dice nada en un historial de despliegues.

### Un pipeline que responde rápido

1. Lint, compilación, pruebas unitarias: de segundos a pocos minutos, en cada push.
2. Construir el artefacto y analizarlo.
3. Pruebas de integración y de extremo a extremo contra servicios reales.
4. Desplegar en staging y lanzar pruebas rápidas.
5. Promover a producción, progresivamente, con comprobaciones automáticas.

Ordena por coste y ejecuta en paralelo las etapas independientes. Una aprobación manual antes de producción debe mirar el riesgo (qué cambió, las migraciones, el momento), no volver a leer el código.

### Tronco, previsualizaciones y reproducibilidad

- **Trunk-based development**: los cambios llegan a `main` al menos a diario, con el trabajo a medias tras feature flags, así que cada despliegue es pequeño.
- **Entornos de previsualización**: un despliegue efímero por pull request, en su propia URL, eliminado al cerrar la pull request.
- **Builds reproducibles**: dependencias y cadena de herramientas fijadas dan artefactos idénticos bit a bit. Los **builds herméticos** van más allá: todas las entradas declaradas por hash y sin red durante el build.
- **SLSA** califica la confianza en el origen de un build; en los niveles altos, la plataforma de build firma una procedencia que los pasos del build no pueden falsificar. Las **imágenes firmadas**, comprobadas al desplegar, garantizan que solo corren los artefactos de tu pipeline.

### Las migraciones son un paso aparte

Los despliegues de código mantienen la versión antigua y la nueva lado a lado durante minutos; los cambios de esquema suelen ser de un solo sentido. Ejecuta las migraciones como un paso propio antes del código, y mantén cada migración compatible con el código de antes y de después (parte 3).

**Para recordar.** Un artefacto inmutable por commit, promovido de entorno en entorno; configuración y secretos desde el entorno; primero las comprobaciones rápidas; las migraciones aparte del código.

## Parte 2 — Los contenedores

### Contenedores, imágenes, registros

Un **contenedor** es un conjunto de procesos aislados por el núcleo (namespaces para lo que ve, cgroups para lo que usa); comparte el núcleo del anfitrión, así que arranca en milisegundos pero aísla menos que una máquina virtual. Una **imagen** es la plantilla de solo lectura de la que parte un contenedor; un **registro** (Artifact Registry, GitHub Container Registry, Docker Hub) guarda las imágenes por nombre, tag y digest.

### Un buen Dockerfile

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

- **El orden de las capas**: las dependencias cambian poco y el código a menudo, así que copia los manifiestos e instala antes de copiar el código. Un `.dockerignore` deja `node_modules` y `.git` fuera del contexto de build.
- **Multietapa**: compiladores y fuentes se quedan en la etapa de build; la imagen final solo tiene lo que se ejecuta.
- **Sin root**: `USER node` limita lo que puede hacer un exploit.
- **Forma exec**: `CMD ["node", ...]` hace de la aplicación el PID 1, que recibe SIGTERM y puede pararse limpiamente.

### Tags y digests

Un tag como `app:1.4` se puede mover; un digest como `app@sha256:9f…` siempre designa los mismos bytes. Las personas leen tags; los despliegues deben fijar digests. Las plataformas anotan el digest que resolvieron.

### Imágenes más pequeñas y más seguras

- Las **bases mínimas o distroless** quitan el shell y el gestor de paquetes: menos vulnerabilidades, pero la depuración depende de los registros y de variantes de depuración.
- **El análisis** encuentra las vulnerabilidades conocidas; reconstruye con regularidad sobre bases actualizadas en vez de parchear contenedores en marcha.
- **Imágenes multiarquitectura**: `docker buildx build --platform linux/amd64,linux/arm64` produce un índice del que cada máquina descarga la suya.
- **Secretos de build**: un archivo borrado en una capa posterior sigue existiendo en la anterior. Usa `RUN --mount=type=secret,id=npm ...` para que el secreto nunca entre en una capa.

### Bajo el capó

Las imágenes siguen el formato **OCI**: un manifiesto lista una configuración y capas por digest, y un índice agrupa los manifiestos por plataforma. Kubernetes habla con un runtime como containerd, que usa runc (o gVisor, Kata Containers) para crear los contenedores. El aislamiento de primera generación de Cloud Run usaba gVisor; la segunda generación ejecuta un núcleo Linux completo en una microVM.

**Para recordar.** Ordena las capas para la caché, construye por etapas, ejecuta sin root y en forma exec, fija digests, reconstruye a menudo sobre bases pequeñas y deja los secretos fuera de las capas.

## Parte 3 — Estrategias de puesta en producción

### Las cuatro estrategias básicas

| Estrategia | Cómo | Vuelta atrás | Coste |
|---|---|---|---|
| Recreate | Parar la versión antigua, arrancar la nueva | Volver a desplegar la antigua | Interrupción |
| Rolling | Sustituir las instancias unas pocas cada vez | Volver a poner la antigua poco a poco | Las dos versiones en servicio un rato |
| Blue-green | Arrancar la nueva junto a la antigua y cambiar todo el tráfico de golpe | Volver a cambiar | El doble de capacidad durante el cambio |
| Canary | Enviar una pequeña parte del tráfico a la nueva y aumentarla por pasos | Devolver el tráfico | Requiere métricas y reparto de tráfico |

### Feature flags y sondas

Los **feature flags** separan desplegar de publicar: el código sale desactivado y se activa para algunos usuarios o para todos sin despliegue, y se apaga en segundos si se porta mal. Quita los flags viejos.

Las **sondas** mantienen las instancias malas fuera del tráfico: una sonda de **disponibilidad** que falla saca una instancia del balanceo; una sonda de **vida** que falla la reinicia. Un despliegue cuyas instancias nuevas nunca están listas se atasca en vez de servir errores.

### Los canaries en la práctica

En Cloud Run, despliega sin tráfico y luego muévelo:

```sh
gcloud run deploy web --image="$IMAGE" --no-traffic --tag=candidate
gcloud run services update-traffic web --to-tags=candidate=10
gcloud run services update-traffic web --to-latest
```

Vigila la tasa de errores y la latencia frente a la versión antigua en cada paso. **El análisis automático de canaries** (Argo Rollouts, Flagger) compara estadísticamente canary y referencia y vuelve atrás solo. Enruta por usuario cuando una sesión abarca varias peticiones, para que cada uno vea una sola versión.

### Bases de datos: expand y contract

Para cambiar el nombre de una columna sin interrupción:

1. **Expand**: añadir la columna nueva.
2. Escribir en las dos columnas y rellenar las filas antiguas.
3. Pasar las lecturas a la columna nueva.
4. Dejar de escribir la antigua.
5. **Contract**: borrar la columna antigua.

Cada paso funciona con el código de antes y de después, así que cada despliegue puede volver atrás. Lo mismo vale para los formatos de mensajes en colas y para los datos en caché: haz primero tolerantes a los lectores y luego cambia a los escritores.

### Volver atrás o corregir hacia delante

Vuelve atrás por defecto cuando la causa no esté clara: restablece rápido un estado conocido. Corrige hacia delante cuando la versión nueva ya cambió datos que la antigua no sabe leer, y una corrección pequeña puede pasar por el pipeline normal.

### Los sistemas grandes

- El **tráfico espejo** copia peticiones reales a la versión nueva y compara las respuestas sin devolverlas; los efectos secundarios deben desactivarse en el espejo.
- Las **celdas** dividen el sistema en copias independientes que atienden partes de los usuarios; las versiones avanzan celda a celda, región a región.
- El **tiempo de maduración** entre etapas detecta los problemas lentos: fugas, tareas diarias, horas punta.

**Para recordar.** Separa despliegue y publicación con flags; condiciona el tráfico a la disponibilidad; haz canaries con comparación automática; cambia los esquemas con expand y contract; vuelve atrás salvo que los datos digan lo contrario.

## Parte 4 — Infraestructura como código

### Por qué código

La infraestructura como código describe redes, bases de datos, clústeres y permisos en archivos versionados que aplica una herramienta. Los cambios se revisan en pull requests, los entornos se pueden recrear y los archivos documentan lo que existe. Los cambios hechos con clics no dejan rastro y hacen divergir los entornos.

### Declarativo, idempotente, inmutable

- **Declarativo**: describes el estado final deseado; la herramienta lo compara con la realidad y calcula los pasos.
- **Idempotente**: aplicar dos veces tiene el mismo efecto que una, así que una ejecución fallida se puede reintentar.
- **Infraestructura inmutable**: en vez de parchear servidores, se construye una imagen nueva y se sustituyen; volver atrás es desplegar la imagen anterior.
- **Deriva**: la realidad ya no coincide con el código, normalmente tras un cambio manual. Detéctala con planes programados y lleva los arreglos al código.

### El panorama

| Tipo | Herramientas | Función |
|---|---|---|
| Aprovisionamiento, declarativo | Terraform, OpenTofu | Crear recursos de nube y SaaS mediante las API, cualquier proveedor |
| Nativo de una nube | AWS CloudFormation, Azure Bicep, Google Cloud Infrastructure Manager | Lo mismo para una sola nube (Infrastructure Manager ejecuta Terraform) |
| Lenguajes de propósito general | Pulumi, AWS CDK | La infraestructura escrita en TypeScript, Python, Go |
| Plano de control de Kubernetes | Crossplane | Los recursos de la nube como objetos de Kubernetes, reconciliados continuamente |
| Gestión de configuración | Ansible, Chef, Puppet | Configurar el software dentro de máquinas existentes |

### Policy as code y revisión

Reglas como ningún bucket público o etiquetas obligatorias se pueden comprobar automáticamente en cada plan (OPA y Conftest con Rego, Sentinel en HCP Terraform), haciendo fallar el pipeline antes de apply. Los revisores se centran entonces en la intención. Publica el plan en la pull request: el diff muestra la intención y el plan el efecto, como una base de datos que se reemplazaría.

### Organizar el código y el estado

Mantén módulos compartidos y una pequeña configuración raíz por entorno, cada una con sus propias variables y su propio estado. Divide los estados por ciclo de vida y responsabilidad (red, datos compartidos, cada servicio): los estados más pequeños planifican más rápido, admiten permisos más estrictos y limitan el radio de impacto de un error. Terragrunt puede quitar la repetición que eso crea.

**Para recordar.** Describe el estado final, guárdalo en Git, revisa planes y no solo diffs, detecta la deriva, impón las barreras como políticas y divide el estado para limitar lo que puede alcanzar un error.

## Parte 5 — Terraform y OpenTofu

### Licencias y forks

HashiCorp pasó Terraform a la Business Source License en 2023; **OpenTofu**, bajo la Linux Foundation, es el fork de código abierto nacido de la última versión abierta, en gran parte compatible y con funciones añadidas como el cifrado del estado en el cliente. HashiCorp forma ahora parte de IBM. Lo que sigue vale para ambos.

### El lenguaje

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

- Los **proveedores** hablan con las API y definen los tipos de recurso; `terraform init` los descarga y anota las versiones exactas en `.terraform.lock.hcl`, que se confirma.
- Los **recursos** son objetos gestionados; las **fuentes de datos** solo leen objetos gestionados en otro sitio.
- Las **variables** son entradas (archivos `.tfvars`, `-var` o variables de entorno `TF_VAR_`); los **outputs** exponen resultados; los **locals** dan nombre a expresiones.
- Los **módulos** son carpetas con entradas y salidas, llamados con una `source` y una versión.

### El flujo y el estado

`terraform init`, luego `plan` (lo que cambiaría) y luego `apply`. El **estado** asocia cada dirección de recurso con el objeto real; guárdalo en un backend remoto con **bloqueo** (GCS, HCP Terraform, S3 con `use_lockfile`), nunca en Git, porque puede contener secretos.

Lee los planes con cuidado: `+` crear, `-` destruir, `~` actualizar en el sitio, `-/+` reemplazar. El reemplazo de un recurso con estado significa perder datos salvo que esté previsto.

### count o for_each

Con `count`, las instancias van numeradas: quitar un elemento del medio desplaza los siguientes y los recrea. Con `for_each`, las instancias se identifican por su nombre: quitar una solo toca esa. Usa `for_each` para colecciones y `count` para copias idénticas o un interruptor.

### Cambiar lo que existe

| Necesidad | Bloque |
|---|---|
| Hacer que se gestione un objeto existente | `import` (con `-generate-config-out` para esbozar el código) |
| Cambiar el nombre o mover un recurso sin recrearlo | `moved` |
| Dejar de gestionar un objeto sin destruirlo | `removed` con `lifecycle { destroy = false }` |
| Rechazar cualquier plan que lo destruiría | `lifecycle { prevent_destroy = true }` |
| Crear el sustituto antes de destruir el antiguo | `lifecycle { create_before_destroy = true }` |
| Dejar de restablecer un atributo cambiado en otro sitio | `lifecycle { ignore_changes = [...] }` |

### Secretos y pruebas

`sensitive = true` oculta un valor en la salida pero no en el estado. Desde la 1.10 y la 1.11, los **valores efímeros** y los **argumentos de solo escritura** permiten pasar un secreto a un recurso sin guardarlo en el plan ni en el estado. `terraform test` ejecuta archivos `.tftest.hcl` que planifican o aplican un módulo y comprueban aserciones; los bloques `check` verifican condiciones reales tras apply.

**Para recordar.** Fija los proveedores y confirma el archivo de bloqueo; estado remoto con bloqueo; lee cada reemplazo del plan; `for_each` para colecciones; `import`, `moved` y `removed` en vez de editar el estado a mano; deja los secretos fuera del estado.

## Parte 6 — Kubernetes

### Los objetos básicos

| Objeto | Función |
|---|---|
| Pod | Uno o varios contenedores que comparten una dirección de red; desechable |
| Deployment | Mantiene en marcha N Pods idénticos y despliega las versiones nuevas |
| Service | Un nombre y una dirección estables delante de los Pods que coinciden |
| Ingress, Gateway API | El enrutamiento HTTP desde fuera por host y ruta |
| ConfigMap, Secret | La configuración y las credenciales que se dan a los Pods |
| HorizontalPodAutoscaler | Cambia el número de réplicas para mantener una métrica cerca de un objetivo |

Kubernetes es declarativo: `kubectl apply -f` guarda el estado deseado, y unos controladores hacen coincidir continuamente la realidad.

### Un Deployment que se sostiene

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

- Las **peticiones** son lo que reserva el planificador; los **límites** ponen tope al uso (por encima del límite de memoria, se mata el contenedor).
- `maxSurge: 1` y `maxUnavailable: 0` añaden un Pod nuevo cada vez y nunca bajan del número deseado.
- Las sondas condicionan el tráfico y reinician los contenedores atascados.

### Empaquetado y configuración

- **Helm** renderiza plantillas con valores en charts, con historial de releases: bueno para distribuir software.
- **Kustomize** (integrado en `kubectl apply -k`) aplica parches a YAML simple con overlays por entorno.
- Los **Secrets** son solo base64 por defecto: protégelos con RBAC y cifrado en reposo, o sincronízalos desde un gestor de secretos.

### Disponibilidad e identidad

- Un **PodDisruptionBudget** limita cuántos Pods pueden parar a la vez las interrupciones voluntarias (actualizaciones de nodos).
- Los **taints y tolerations** reservan nodos; la **afinidad** reparte las réplicas entre zonas.
- En GKE, **Workload Identity** da a cada cuenta de servicio de Kubernetes sus propios permisos de IAM, sin archivos de clave.
- Las **clases QoS** se derivan de peticiones y límites: los Pods Guaranteed son los últimos en ser desalojados si falta memoria.

### Operadores y parada

Un **operador** es un controlador con recursos personalizados que codifica cómo ejecutar una aplicación (copias de seguridad, conmutación, actualizaciones). Al pararse, un Pod recibe SIGTERM y dispone de `terminationGracePeriodSeconds` (30 por defecto) para terminar las peticiones en curso antes de SIGKILL; una pausa corta en `preStop` cubre el momento en que los endpoints aún se actualizan.

**Para recordar.** Deployments para los Pods, Services para las direcciones, sondas para el tráfico, peticiones para la planificación; empaqueta con Helm o Kustomize; deja los secretos fuera de los manifiestos en claro; gestiona SIGTERM.

## Parte 7 — GitOps y plataformas gestionadas

### GitOps

GitOps guarda el estado deseado de los sistemas en Git y deja que un agente (Argo CD, Flux) lo aplique continuamente. Los cambios de producción se convierten en pull requests: revisados, registrados, reversibles. El agente también deshace los cambios manuales (la deriva) cuando la autorreparación está activada.

| | Por empuje | Por arrastre |
|---|---|---|
| Quién aplica | La CI, que tiene las credenciales del clúster | Un agente dentro del clúster |
| Deriva | No se ve hasta el despliegue siguiente | Se detecta y corrige continuamente |
| Encaja con | Plataformas sin agente, como Cloud Run | Clústeres de Kubernetes |

Los entornos son carpetas u overlays en un repositorio de configuración; la **promoción** es una pull request que cambia el digest de la imagen en el entorno siguiente. Hay herramientas (image automation de Flux, Argo CD Image Updater) que pueden abrir esas pull requests. Los **secretos** solo se confirman cifrados (SOPS, Sealed Secrets) o como referencias resueltas desde un gestor de secretos (External Secrets). Las **sync waves** y los hooks de Argo CD ordenan los recursos, por ejemplo un job de migración antes del Deployment.

Un clúster perdido por completo se reconstruye desde el código: Terraform para el clúster y luego el agente sincroniza todo lo demás. Solo los datos necesitan copias de seguridad, y todo el procedimiento hay que ensayarlo.

### Las plataformas gestionadas

Plataformas como Cloud Run, App Runner, Azure Container Apps o Fly.io ejecutan tu contenedor y lo escalan, incluso a cero; renuncias al acceso a los nodos y aceptas límites en las peticiones a cambio de mucho menos trabajo de operación.

En **Cloud Run**:

- Cada despliegue crea una **revisión** inmutable; el tráfico se puede repartir entre revisiones, devolver a una más antigua o mantener a cero para una candidata con tag que tiene su propia URL.
- La **concurrencia** es el número de peticiones simultáneas por instancia; el **máximo de instancias** pone tope al escalado, y las peticiones por encima de la capacidad esperan un momento y luego reciben un 429.
- El **mínimo de instancias** elimina los arranques en frío. Fíjalo en el servicio (`--min`), no en cada revisión (`--min-instances`), o cada candidata con tag mantendrá una instancia caliente y facturada.
- **Cloud Deploy** añade una promoción gestionada por destinos ordenados, con aprobaciones y pasos canary.

El workflow de release de Luma es un ejemplo compacto: construir la imagen, ejecutar las migraciones en un job de Cloud Run, desplegar una revisión `--no-traffic` con el tag `candidate`, comprobarla y luego mover el tráfico.

**Para recordar.** Git como fuente de verdad, un agente que reconcilia, la promoción por pull request, secretos cifrados o referenciados; en Cloud Run, revisiones y tags dan canaries y vueltas atrás instantáneas.

## Parte 8 — La operación

### La observabilidad

- Las **métricas** muestran que algo va mal: tasa de peticiones, tasa de errores, percentiles de latencia, saturación.
- Los **registros** explican qué pasó en un sitio; los contenedores los escriben en la salida estándar, en JSON estructurado.
- Las **trazas** siguen una petición a través de los servicios.

OpenTelemetry normaliza la recogida de los tres. Los endpoints de salud permiten a las plataformas esquivar y reiniciar las instancias enfermas.

### SLI, SLO y presupuestos de error

Un **SLI** es lo que se mide (la parte de peticiones atendidas con éxito en menos de 300 ms), un **SLO** el objetivo (el 99,9 por ciento en 30 días), un **SLA** un contrato con consecuencias. Un SLO del 99,9 por ciento en 30 días deja un **presupuesto de error** de 43,2 minutos; el 99,99 por ciento deja unos 4,3. Cuando el presupuesto se agota, una política acordada frena las versiones arriesgadas hasta que se recupere.

Alerta por los síntomas que notan los usuarios, no por cada causa. Las **alertas de consumo** avisan cuando el presupuesto se gasta lo bastante rápido como para agotarse (por ejemplo, 14,4 veces el ritmo sostenible durante una hora gasta el 2 por ciento de un presupuesto de 30 días), con una ventana corta para dejar de avisar tras la recuperación.

### El rendimiento de entrega

Las cuatro métricas **DORA** miden la entrega: la frecuencia de despliegue y el tiempo de entrega de los cambios (el rendimiento), la tasa de fallos de cambios y el tiempo de recuperación del servicio (la estabilidad). La investigación detrás muestra que los buenos equipos mejoran ambas cosas a la vez, lo que permiten los cambios pequeños y frecuentes.

### Los incidentes

- Mitiga primero (volver atrás, conmutar) y busca la causa raíz después.
- Los roles: un responsable del incidente coordina, un responsable de operaciones depura, un responsable de comunicación informa a los usuarios.
- Los **runbooks** enlazados desde las alertas dan los pasos para las situaciones conocidas.
- Los **post mortem sin culpables** preguntan cómo permitió el sistema que una acción razonable causara daño, y siguen las acciones hasta completarlas.

### Secretos, trabajo repetitivo y resiliencia

- Los servicios leen los secretos de un gestor de secretos con su propia identidad; nada secreto vive en las imágenes ni en Git.
- El **trabajo repetitivo** es trabajo manual, repetitivo y automatizable que crece con el servicio; ponle tope y elimínalo con ingeniería.
- La **ingeniería del caos** inyecta fallos controlados para comprobar que sistemas y personas aguantan.
- El **RPO** (los datos que te puedes permitir perder) y el **RTO** (el tiempo de recuperación) solo son reales si las restauraciones se ensayan.

**Para recordar.** Mide lo que notan los usuarios, fija SLO y gasta el presupuesto de error a conciencia, alerta por consumo, sigue DORA, gestiona incidentes sin culpables y ensaya la recuperación.

## Ejercicios

1. Tu pipeline reconstruye la imagen para producción después de que pase staging. ¿Qué falla y qué debería hacer en su lugar?
2. Reescribe un `Dockerfile` de Node de una sola etapa que corre como root con `CMD npm start` en uno mejor. Enumera tres cambios.
3. Un canary al 10 por ciento muestra un 4 por ciento de errores frente al 0,5 por ciento de la versión antigua. ¿Qué pasa después, idealmente sin intervención humana?
4. Una columna `email` debe pasar a una tabla nueva `contacts`. Esboza los pasos expand/contract.
5. Un compañero cambia el nombre de un recurso en Terraform y el plan muestra `-/+` en una base de datos. ¿Qué haces?
6. Se crean tres buckets con `count` a partir de una lista. Alguien quita el primer nombre. ¿Qué muestra el plan y cómo evitarlo?
7. Escribe los campos mínimos de un Deployment que mantiene tres réplicas, nunca baja de tres durante el despliegue y condiciona el tráfico a `/ready`.
8. Tu servicio tiene un SLO del 99,9 por ciento en 30 días y ya ha estado caído 35 minutos este mes. ¿Cuánto presupuesto queda y qué sugiere la política?

### Respuestas

1. Envía un artefacto que nadie probó. Construye una vez, súbelo con versión y digest, despliega ese digest en staging y luego promueve el mismo digest a producción; solo cambia la configuración.
2. Un build multietapa, los manifiestos de dependencias copiados antes del código, `USER node` y la forma exec `CMD ["node", "dist/server.js"]`; también un `.dockerignore`.
3. El tráfico vuelve a la versión antigua y la puesta en producción se detiene; el análisis automático de canaries compara canary y referencia y vuelve atrás solo.
4. Crear `contacts`; escribir en ambos sitios y rellenar lo existente; leer de `contacts`; dejar de escribir `email`; borrar la columna en una versión posterior.
5. Para: añade un bloque `moved` de la dirección antigua a la nueva, vuelve a planificar y espera ningún cambio; si el reemplazo viene de un argumento inmutable, replantea el cambio.
6. Los dos buckets restantes cambian de índice y se planifica destruirlos y recrearlos. Usa `for_each` sobre un conjunto de nombres, con bloques `moved` para migrar las instancias existentes.
7. Ver el Deployment de la parte 6: `replicas: 3`, `maxSurge: 1`, `maxUnavailable: 0`, una `readinessProbe` en `/ready`.
8. 43,2 menos 35 deja unos 8 minutos; la política sugiere congelar las versiones arriesgadas y trabajar en la fiabilidad hasta que el presupuesto se recupere.

## Fuentes

Páginas de referencia de cada parte. Las herramientas y los límites cambian: comprueba la página antes de fiarte de un detalle.

| Parte | Páginas |
|---|---|
| 1 | [The Twelve-Factor App](https://12factor.net/) · [SLSA](https://slsa.dev/) |
| 2 | [Referencia del Dockerfile](https://docs.docker.com/reference/dockerfile/) · [Especificación de imágenes OCI](https://github.com/opencontainers/image-spec) |
| 3 | [Argo Rollouts](https://argoproj.github.io/rollouts/) · [Cloud Run: despliegues y migración del tráfico](https://cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration) |
| 4 | [Open Policy Agent](https://www.openpolicyagent.org/) · [Crossplane](https://www.crossplane.io/) |
| 5 | [El lenguaje de Terraform](https://developer.hashicorp.com/terraform/language) · [OpenTofu](https://opentofu.org/) |
| 6 | [Documentación de Kubernetes](https://kubernetes.io/docs/home/) · [Gateway API](https://gateway-api.sigs.k8s.io/) |
| 7 | [Principios OpenGitOps](https://opengitops.dev/) · [Argo CD](https://argo-cd.readthedocs.io/) · [Documentación de Cloud Run](https://cloud.google.com/run/docs) |
| 8 | [Los libros de SRE de Google](https://sre.google/books/) · [DORA](https://dora.dev/) · [OpenTelemetry](https://opentelemetry.io/) |
